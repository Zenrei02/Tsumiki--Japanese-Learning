# -*- coding: utf-8 -*-
"""
Derives readings for the ledger words that have none, so they stop rendering
"not in dictionary" when tapped.

THE BUG THIS FIXES
  build-word-ledger.py surfaced kanji-containing bank words with no reading
  recorded anywhere — the word banks store none and KANJI_DICT doesn't cover
  them. Tapping 痛い, 開ける, 雨が降る… in the app shows "not in dictionary".

WHY DERIVED, NOT WRITTEN
  Readings are dictionary facts, not teaching content, so they should come from
  a dictionary rather than from a model. This reads them out of UniDic
  (the same morphological dictionary the tokenizer work is heading toward),
  via fugashi. Nothing here is authored.

  Install once:  pip3 install fugashi unidic-lite

CONFIDENCE, NOT CERTAINTY
  Every derived reading is checked against the word's own okurigana: if the
  surface form ends in kana, the reading must end in the same kana. Words that
  fail that check, or that tokenize oddly, are marked "review" rather than
  dropped — a wrong reading taught confidently is worse than a gap.

  UniDic's `kana` field is used, never `pron`: pron is phonetic (トーキョー) and
  would put long-vowel bars into a learner-facing reading.

  `kana` is also the reading of the token as it appeared, which is not always the
  headword reading: 言う comes back as ユウ, the colloquial pronunciation, where a
  dictionary entry wants いう. When a token is already in its dictionary form,
  UniDic's own lemma reading (`lForm`) is the headword reading, so any
  disagreement between the two is a signal, not noise — the lemma reading wins
  and the word is flagged so a human confirms the call.

OUTPUT
  word-readings-patch-v1.json  — machine-readable, with per-word provenance
  word-readings-report.md      — what to eyeball, review items first
  Neither touches the JSX. Applying to KANJI_DICT is a separate authoring step.

USAGE
  python3 derive-missing-readings.py
"""
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
LEDGER = HERE / "word-ledger-v1.json"
OUT_JSON = HERE / "word-readings-patch-v1.json"
OUT_MD = HERE / "word-readings-report.md"

KANJI = re.compile(r"[一-鿿]")
KANA = re.compile(r"[぀-ゟ゠-ヿ]")
# Particles that legitimately appear inside a multi-word bank entry (雨が降る).
PHRASE_PARTICLES = set("がをにへとはのもで")


def kata_to_hira(s):
    return "".join(chr(ord(c) - 0x60) if "ァ" <= c <= "ヶ" else c for c in s)


def okurigana_tail(word):
    """Trailing kana of the surface form — the part a reading must reproduce."""
    m = re.search(r"[぀-ゟ]+$", word)
    return m.group(0) if m else ""


def derive(tagger, word):
    """(reading, confidence, note). confidence: 'ok' | 'review'."""
    try:
        tokens = list(tagger(word))
    except Exception as e:                                    # pragma: no cover
        return None, "review", f"tokenizer error: {e}"

    parts, unknown, lemma_swaps = [], [], []
    for m in tokens:
        f = m.feature
        kana = getattr(f, "kana", None)
        if not kana or kana == "*":
            if KANJI.search(m.surface):
                unknown.append(m.surface)
            parts.append(m.surface)
            continue
        lform = getattr(f, "lForm", None)
        # Token already in dictionary form, but its surface reading disagrees with
        # its headword reading — take the headword reading and say so.
        if (m.surface == getattr(f, "lemma", None)
                and lform and lform != "*" and lform != kana):
            lemma_swaps.append(f"{m.surface}: {kata_to_hira(kana)} → "
                               f"{kata_to_hira(lform)} (headword reading)")
            kana = lform
        parts.append(kata_to_hira(kana))
    reading = "".join(parts)

    if lemma_swaps:
        return reading, "review", "; ".join(lemma_swaps)
    if unknown:
        return reading, "review", f"no reading in UniDic for: {'、'.join(unknown)}"
    if KANJI.search(reading):
        return reading, "review", "reading still contains kanji"

    tail = okurigana_tail(word)
    if tail and not reading.endswith(tail):
        return reading, "review", f"okurigana mismatch — word ends 「{tail}」, reading ends 「{reading[-len(tail):]}」"

    # A phrase entry keeps its particles; flag anything else multi-token and odd.
    if len(tokens) > 1:
        surface_particles = {t.surface for t in tokens if len(t.surface) == 1
                             and t.surface in PHRASE_PARTICLES}
        if not surface_particles and not word.endswith(("する", "い", "る", "う",
                                                        "つ", "く", "ぐ", "む", "ぬ", "ぶ", "す")):
            return reading, "review", "multi-token entry, no linking particle"

    return reading, "ok", ""


def main():
    try:
        import fugashi
    except ImportError:
        sys.exit("fugashi is not installed. Run: pip3 install fugashi unidic-lite")

    if not LEDGER.exists():
        sys.exit(f"{LEDGER.name} not found — run build-word-ledger.py first.")

    ledger = json.loads(LEDGER.read_text(encoding="utf-8"))
    words = ledger["words"]
    missing = [w for w in words if KANJI.search(w["written"]) and not w.get("readings")]

    tagger = fugashi.Tagger()
    entries = []
    for w in missing:
        reading, conf, note = derive(tagger, w["written"])
        entries.append({
            "written": w["written"],
            "reading": reading,
            "meaning": (w.get("meanings") or [""])[0],
            "jlpt": w.get("jlpt"),
            "sources": w.get("sources", []),
            "confidence": conf,
            "note": note,
        })

    entries.sort(key=lambda e: (e["confidence"] != "review", e["written"]))
    review = [e for e in entries if e["confidence"] == "review"]

    OUT_JSON.write_text(json.dumps({
        "generated_from": LEDGER.name,
        "ledger_count": ledger.get("count"),
        "source": "UniDic via fugashi/unidic-lite — kana field (orthographic), not pron",
        "status": "DERIVED, NOT REVIEWED — dictionary data, but no reviewer has "
                  "signed it off. Send with the rest of the review queue.",
        "count": len(entries),
        "review_count": len(review),
        "entries": entries,
    }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# Missing word readings — derived from UniDic",
        "",
        f"Source ledger: `{LEDGER.name}` ({ledger.get('count')} words, "
        f"generated {ledger.get('generated')})",
        f"Derived: **{len(entries)}** words that had no reading anywhere.",
        f"Needing a look: **{len(review)}**.",
        "",
        "These are the words that currently render *not in dictionary* when tapped.",
        "Readings come from UniDic, not from a model — but nobody has checked them,",
        "so they go to the reviewer with the rest of the queue.",
        "",
        "Applying these to `KANJI_DICT` is an authoring pass, not a data operation:",
        "the dict is a flat array in each single-file module, so the edit lands by hand",
        "(or with the web-app port, whichever comes first).",
        "",
    ]
    if review:
        lines += ["## Check these first", "",
                  "| Word | Derived reading | Meaning | Why flagged |", "|---|---|---|---|"]
        for e in review:
            lines.append(f"| {e['written']} | {e['reading'] or '—'} | {e['meaning']} | {e['note']} |")
        lines.append("")
    lines += ["## Derived cleanly", "",
              "| Word | Reading | Meaning | JLPT | KANJI_DICT row |", "|---|---|---|---|---|"]
    for e in entries:
        if e["confidence"] == "ok":
            lvl = e["jlpt"] or "N5"
            row = f'`["{e["written"]}", "{e["reading"]}", "{e["meaning"]}", "{lvl}"],`'
            lines.append(f"| {e['written']} | {e['reading']} | {e['meaning']} | {lvl} | {row} |")
    lines += ["", "---", "",
              "JLPT shown as `N5` where the ledger carries no level — the bank entries",
              "never recorded one. Worth setting properly during the authoring pass,",
              "since the level drives the furigana-as-exception-marker rule."]
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")

    print(f"{len(entries)} readings derived ({len(review)} need a look).")
    print(f"Wrote {OUT_JSON.name} and {OUT_MD.name}.")
    if review:
        print("\nFlagged:")
        for e in review:
            print(f"  {e['written']}  →  {e['reading'] or '—'}   ({e['note']})")


if __name__ == "__main__":
    main()
