#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Could a word-processor-style rule checker catch what the eval key marks?
NO API CALLS. Reads naoshi-eval-v1.xlsx / Eval Set and scores a small,
POS-based rule set against the answer key. Session 32 follow-up (Sep 14 2026),
asked as: "Is there another way to build a grammar checker akin a word
processor check? Maybe it's not as accurate but it would be faster."

THE RULES WERE WRITTEN BEFORE THE SENTENCES WERE READ. That is the whole
validity of the number this prints. A rule set tuned against these 50 rows
would "catch" whatever it was tuned to catch and say nothing about the next
50. The rules below come from the prompt's own L1-interference watchlist and
from the textbook error classes every JSL teacher knows — and one disclosure:
four rows (E01–E04) were visible in a column dump while the workbook's shape
was being inspected, before the rules were written. E03 (欲しいじゃなかった)
and E04 (つもりのに) fall in classes that were going on the list regardless
(i-adjective negation; な before のに after a noun), but a reader should know.

WHAT "CATCH" MEANS HERE. A rule hit on an ERROR row counts as a catch only if
its span OVERLAPS the region the key's expected correction actually changes.
A hit elsewhere on an error row is a false positive that happened to land on
a bad sentence, and is counted as one. On a CORRECT row any hit is a false
positive — and per the prompt's rule 1, that is the number that matters most.

Tokenizer: janome (pure Python, IPADIC-style POS + conjugation). Install:
    pip3 install --user janome
"""
import re, sys
from difflib import SequenceMatcher
from pathlib import Path

try:
    from janome.tokenizer import Tokenizer
except ImportError:
    sys.exit("janome is not installed: pip3 install --user janome")
import openpyxl

HERE = Path(__file__).parent
WB = HERE / "naoshi-eval-v1.xlsx"
T = Tokenizer()

# ---------- the rule set (frozen before the sentences were read) ----------
# Each rule returns a list of (start, end, tier, label). Offsets are into the
# original text, computed from token positions.

GA_PREDICATES = {"好き", "嫌い", "上手", "下手", "苦手", "得意", "欲しい",
                 "わかる", "分かる", "できる", "出来る", "見える", "聞こえる",
                 "必要", "ほしい"}
GODAN_NEEDS_ONBIN = ("五段・カ行", "五段・ガ行", "五段・バ行", "五段・マ行",
                     "五段・ナ行", "五段・ラ行", "五段・タ行", "五段・ワ行")

def toks(text):
    out, pos = [], 0
    for t in T.tokenize(text):
        s = t.surface
        i = text.find(s, pos)
        if i == -1:
            i = pos
        out.append({"s": s, "pos": t.part_of_speech.split(","), "type": t.infl_type,
                    "form": t.infl_form, "base": t.base_form, "start": i, "end": i + len(s)})
        pos = i + len(s)
    return out

def rules(text):
    tk = toks(text)
    hits = []
    def hit(a, b, tier, label):
        hits.append((tk[a]["start"], tk[b]["end"], tier, label))
    n = len(tk)
    for i, t in enumerate(tk):
        nxt = tk[i + 1] if i + 1 < n else None
        nxt2 = tk[i + 2] if i + 2 < n else None
        # R1 i-adjective conjugated like a noun: 面白いでした / 面白いだ / 欲しいじゃない
        if t["pos"][0] == "形容詞" and t["form"] == "基本形" and nxt:
            if nxt["base"] == "です" and nxt2 and nxt2["base"] == "た":
                hit(i, i + 2, "FIX", "R1 i-adj + でした")
            elif nxt["base"] == "だ" and nxt["form"] == "基本形":
                hit(i, i + 1, "FIX", "R1 i-adj + だ")
            elif nxt["s"] in ("じゃ", "では") and nxt2 and nxt2["base"] in ("ない", "ある"):
                hit(i, i + 2, "FIX", "R1 i-adj + じゃない")
        # R2 ら抜き: ichidan (or 来る) 未然形 + suffix れる
        if (t["pos"][0] == "動詞" and t["type"] in ("一段", "カ変・来ル", "カ変・クル")
                and t["form"] == "未然形" and nxt and nxt["pos"][1] == "接尾"
                and nxt["base"] == "れる"):
            hit(i, i + 1, "FIX", "R2 ら抜き")
        # R3 doubled particle
        if t["pos"][0] == "助詞" and nxt and nxt["pos"][0] == "助詞" and nxt["s"] == t["s"] \
                and t["s"] in ("を", "は", "が", "に", "で", "と", "も"):
            hit(i, i + 1, "FIX", "R3 doubled particle")
        # R4 を before a が-predicate
        if t["s"] == "を" and t["pos"][0] == "助詞" and nxt:
            if nxt["base"] in GA_PREDICATES:
                hit(i, i + 1, "FIX", "R4 を with が-predicate")
            elif (nxt["pos"][0] == "動詞" and nxt["type"] == "一段" and nxt["form"] == "未然形"
                  and nxt2 and nxt2["base"] == "られる"):
                hit(i, i + 2, "FIX", "R4 を with potential")
        # R7 noun / na-adjective directly before のに・ので・のだ・んだ (needs な)
        if (t["pos"][0] == "名詞" and t["pos"][1] in ("一般", "非自立", "形容動詞語幹", "副詞可能", "サ変接続")
                and nxt and nxt["pos"][0] == "助詞" and nxt["pos"][1] == "接続助詞"
                and nxt["s"] in ("のに", "ので")):
            hit(i, i + 1, "FIX", "R7 noun + のに/ので without な")
        # R8 na-adjective conjugated like an i-adjective: 静かくない / きれいかった
        if t["pos"][0] == "名詞" and t["pos"][1] == "形容動詞語幹" and nxt:
            if nxt["s"] in ("く", "くない", "かっ") or (nxt["pos"][0] == "形容詞" and nxt["pos"][1] == "接尾"):
                hit(i, i + 1, "FIX", "R8 na-adj conjugated as i-adj")
        # R11 i-adjective + の + noun (大きいの犬)
        if (t["pos"][0] == "形容詞" and t["form"] == "基本形" and nxt and nxt["s"] == "の"
                and nxt["pos"][0] == "助詞" and nxt2 and nxt2["pos"][0] == "名詞"):
            hit(i, i + 2, "FIX", "R11 i-adj + の + noun")
        # R15 godan て/た without sound change: 行きて, 書きた, 読みて
        if (t["pos"][0] == "動詞" and t["type"] and t["type"].startswith(GODAN_NEEDS_ONBIN)
                and t["form"] == "連用形" and nxt and nxt["pos"][0] == "助詞"
                and nxt["s"] in ("て", "た") ):
            hit(i, i + 1, "FIX", "R15 て-form without 音便")
        # R9 あなた (watchlist: usually unnatural / disrespectful)
        if t["s"] == "あなた":
            hit(i, i, "UNNATURAL", "R9 あなた as 'you'")
    # R10 pronoun overuse: 私/僕/俺 twice or more in one sentence
    for sent_start, sent_end in sentences_of(text):
        pron = [t for t in tk if t["s"] in ("私", "僕", "俺", "わたし") and sent_start <= t["start"] < sent_end]
        if len(pron) >= 2:
            hits.append((pron[1]["start"], pron[1]["end"], "UNNATURAL", "R10 pronoun overuse"))
    # R5 register mixing across sentences: polite and plain sentence-finals both present
    finals = []
    for sent_start, sent_end in sentences_of(text):
        inside = [t for t in tk if sent_start <= t["start"] < sent_end and t["pos"][0] != "記号"]
        if not inside:
            continue
        last = inside[-1]
        # peel sentence-final particles
        while last and last["pos"][0] == "助詞" and last["pos"][1] == "終助詞" and len(inside) > 1:
            inside = inside[:-1]; last = inside[-1]
        if last["base"] in ("です", "ます") or (last["base"] == "た" and len(inside) > 1 and inside[-2]["base"] in ("です", "ます")):
            finals.append(("polite", last))
        elif last["pos"][0] in ("動詞", "形容詞") or last["base"] in ("だ", "た", "ない"):
            finals.append(("plain", last))
    if {"polite", "plain"} <= {k for k, _ in finals}:
        plain = next(t for k, t in finals if k == "plain")
        hits.append((plain["start"], plain["end"], "FIX", "R5 polite/plain mixed"))
    return hits

def sentences_of(text):
    out, start = [], 0
    for m in re.finditer(r"[。！？!?\n]", text):
        out.append((start, m.end())); start = m.end()
    if start < len(text):
        out.append((start, len(text)))
    return out or [(0, len(text))]

# ---------- key ----------
def load_key():
    wb = openpyxl.load_workbook(WB)
    es = wb["Eval Set"]
    rows = []
    for row in es.iter_rows(min_row=6):
        rid, sent = row[0].value, row[3].value
        if not (rid and sent and str(sent).strip()):
            continue
        rows.append({
            "id": str(rid).strip(), "text": str(sent).strip(),
            "status": str(row[4].value or "").strip().upper(),
            "pattern": str(row[5].value or "").strip(),
            "tier": str(row[6].value or "").strip().upper(),
            "correction": str(row[7].value or "").strip(),
        })
    return rows

def changed_regions(a, b):
    """Character spans of `a` that the correction `b` alters."""
    out = []
    for tag, i1, i2, j1, j2 in SequenceMatcher(None, a, b).get_opcodes():
        if tag != "equal":
            out.append((i1, max(i2, i1 + 1)))   # an insertion touches the char after it
    return out

def overlaps(a, b):
    return a[0] < b[1] and b[0] < a[1]

# ---------- score ----------
def main():
    rows = load_key()
    fp_correct, fp_error, catches, misses = [], [], [], []
    per_rule = {}
    tier_ok = 0
    for r in rows:
        hits = rules(r["text"])
        for h in hits:
            per_rule.setdefault(h[3], []).append(r["id"])
        if r["status"] == "CORRECT":
            if hits:
                fp_correct.append((r, hits))
            continue
        # ERROR row
        regions = changed_regions(r["text"], r["correction"]) if r["correction"] and r["correction"] != "—" else []
        good = [h for h in hits if any(overlaps((h[0], h[1]), g) for g in regions)]
        bad = [h for h in hits if h not in good]
        if good:
            catches.append((r, good))
            if any(h[2] == r["tier"] for h in good):
                tier_ok += 1
        else:
            misses.append(r)
        if bad:
            fp_error.append((r, bad))

    correct_rows = [r for r in rows if r["status"] == "CORRECT"]
    error_rows = [r for r in rows if r["status"] != "CORRECT"]
    fix_rows = [r for r in error_rows if r["tier"] == "FIX"]
    unnat_rows = [r for r in error_rows if r["tier"] == "UNNATURAL"]
    caught_ids = {r["id"] for r, _ in catches}

    print(f"eval set: {len(rows)} rows · {len(correct_rows)} CORRECT · {len(error_rows)} ERROR "
          f"({len(fix_rows)} FIX, {len(unnat_rows)} UNNATURAL, "
          f"{len(error_rows) - len(fix_rows) - len(unnat_rows)} other)\n")
    print(f"FALSE POSITIVES on CORRECT rows: {len(fp_correct)} / {len(correct_rows)}"
          + ("  ← rule 1 says this must be ~0" if fp_correct else "  ✓"))
    for r, hs in fp_correct:
        print(f"   {r['id']}  {r['text']}")
        for h in hs: print(f"        ✗ {h[3]}: 「{r['text'][h[0]:h[1]]}」")
    print(f"\nCATCHES on ERROR rows (hit overlaps the key's corrected region): {len(catches)} / {len(error_rows)}")
    print(f"   of which FIX-tier rows caught: {sum(1 for r,_ in catches if r['tier']=='FIX')} / {len(fix_rows)}")
    print(f"   of which UNNATURAL-tier rows caught: {sum(1 for r,_ in catches if r['tier']=='UNNATURAL')} / {len(unnat_rows)}")
    print(f"   tier also right: {tier_ok} / {len(catches)}")
    for r, hs in catches:
        print(f"   {r['id']} [{r['tier']}] {r['text']}  →  {r['correction']}")
        for h in hs: print(f"        ✓ {h[3]}: 「{r['text'][h[0]:h[1]]}」")
    print(f"\nWRONG-PLACE HITS on ERROR rows (a false positive that landed on a bad sentence): {len(fp_error)}")
    for r, hs in fp_error:
        print(f"   {r['id']} {r['text']}")
        for h in hs: print(f"        ✗ {h[3]}: 「{r['text'][h[0]:h[1]]}」")
    print(f"\nMISSES: {len(misses)} / {len(error_rows)} error rows with no catch — by the key's own pattern label:")
    from collections import Counter
    for pat, k in Counter(r["pattern"] for r in misses).most_common():
        ids = [r["id"] for r in misses if r["pattern"] == pat]
        print(f"   {k:2d}  {pat}  ({', '.join(ids)})")
    print("\nPER RULE (rows it fired on):")
    for label, ids in sorted(per_rule.items()):
        print(f"   {label}: {len(ids)}  {', '.join(ids)}")
    if not per_rule:
        print("   (no rule fired on any row)")

if __name__ == "__main__":
    main()
