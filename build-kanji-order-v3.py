#!/usr/bin/env python3
"""kanji-order v3 — the locked-syllabus order (Session 13 decision).

WHY THIS EXISTS. kanji-order-v2.json covers only the original 64 characters.
Groups 3-5 (Session 13, 47 characters) were hand-ordered from ledger demand,
which left the order file behind the module — and build-vocab-data.py reads
the order file, so running it would have classified every new character as
never-taught and emitted wrong visit schedules.

THE DECISION (Lloyd, Aug 13 2026): the entire taught syllabus becomes the
locked prefix. This is Blocker 3's own logic extended: the pipeline must not
reorder deliberate teaching choices it cannot see, and Groups 3-5 are exactly
that — batches chosen from ledger demand under the v2 component policy, with
authored staging (曜 as the deliberate hard one, 聞 completing the gate trio).
Deriving their order after the fact would be reordering the past.

WHAT v3 THEREFORE IS: the module's teaching order, verbatim, with the same
per-character metadata v2 carried (weighted ledger demand, strokes, taught
parts, shape classification). Centrality derivation is suspended — it resumes
if a future group wants machine ordering BEFORE it is authored, which is the
only time it can honestly run.

Reads the module and the ledger directly (standing practice: read the
modules, not the specs). Re-runnable. Outputs kanji-order-v3.json and
kanji-order-report-v3.md.
"""
import json, re, datetime, pathlib
from collections import defaultdict

HERE = pathlib.Path(__file__).parent
MODULE = (HERE / "kanji-module.jsx").read_text(encoding="utf-8")
LEDGER = json.loads((HERE / "word-ledger-v1.json").read_text(encoding="utf-8"))
MISC = json.loads((HERE / "freq-data" / "kanjidic-misc.json").read_text(encoding="utf-8"))
MISC = MISC[[k for k in MISC if k != "source"][0]]
V2 = json.loads((HERE / "kanji-order-v2.json").read_text(encoding="utf-8"))
KANJI_RE = re.compile(r"[一-鿿]")

# Shape policy carried forward from v2 (kanji-order-report-v2.md). New shapes
# from Groups 3-5 that neither table covers are REPORTED, not silently binned:
# classification is a policy decision (see the report this script writes).
NAMED = set("門米玉刀寺交舌可禾囗彳丁儿")
MUTE = set("丿丨乙卜冂干乂厶毋气")

PARTS = json.loads(re.search(r"const PARTS = (\{.*?\});", MODULE, re.S).group(1))
order, seen = [], set()
for m in re.finditer(r"chars: \[([^\]]*)\]", MODULE):
    for c in re.findall(r'"(.)"', m.group(1)):
        if c not in seen:
            seen.add(c); order.append(c)
TAUGHT = set(order)

demand = defaultdict(int)
for w in LEDGER["words"]:
    weight = len(w["sources"])
    for ch in set(w["written"]):
        if KANJI_RE.match(ch):
            demand[ch] += weight

v2pos = {r["char"]: r["pos"] for r in V2["order"]}

rows, unclassified = [], defaultdict(list)
for i, c in enumerate(order, 1):
    taught_parts, named, muted, unknown = [], [], [], []
    for p in PARTS.get(c, []):
        e, o = p["e"], p.get("orig")
        if e in TAUGHT or o in TAUGHT:
            taught_parts.append(o or e)
        elif e in NAMED:
            named.append(e)
        elif e in MUTE:
            muted.append(e)
        else:
            unknown.append(e); unclassified[e].append(c)
    rows.append({
        "pos": i, "char": c, "v2_pos": v2pos.get(c),
        "demand_words": demand.get(c, 0),
        "strokes": MISC.get(c, {}).get("strokes"),
        "taught_parts": taught_parts, "named_shapes": named,
        "muted_shapes": muted, "unclassified_shapes": unknown,
    })

out = {
    "generated": datetime.date.today().isoformat(),
    "version": 3,
    "method": "locked syllabus order — no derivation",
    "decision": ("Entire taught syllabus locked as prefix (Lloyd, Session 13). "
                 "Groups 3-5 were authored from ledger demand; reordering them "
                 "after the fact would repeat v1's Blocker-3 mistake. Derivation "
                 "resumes only for a future group ordered BEFORE authoring."),
    "supersedes": "kanji-order-v2.json (64 chars) for every consumer; v2 remains "
                  "the record of the last true derivation.",
    "corpora_used": V2.get("corpora_used"),
    "count": len(order),
    "order": rows,
}
(HERE / "kanji-order-v3.json").write_text(
    json.dumps(out, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

L = [f"# Kanji order v3 — {out['generated']}", "",
     "**Not a derivation.** " + out["decision"], "",
     f"Covers **{len(order)}** characters — the module's teaching order, verbatim. "
     "Downstream consumers (build-vocab-data.py) read this file; "
     "kanji-order-v2.json stays as the record of the last derived order (64 chars).", "",
     "## Teaching order", "",
     "> " + "".join(order), ""]
if unclassified:
    L += ["## ⚠️ Shapes awaiting policy classification", "",
          "Groups 3-5 introduced component shapes the v2 named/muted tables do not "
          "cover. They are glossed in lesson prose but not yet classified for cost. "
          "Classify at the next policy pass:", ""]
    for e, chars in sorted(unclassified.items(), key=lambda kv: -len(kv[1])):
        L.append(f"- **{e}** — in {'、'.join(chars)}")
    L.append("")
zero = [c for c in order if demand.get(c, 0) == 0]
if zero:
    L += ["## Characters with zero current ledger demand", "",
          "Taught for stroke rules or composition, not word demand — expected for "
          "Stage 0 members, worth a glance for anything else:", "",
          "> " + "".join(zero), ""]
(HERE / "kanji-order-report-v3.md").write_text("\n".join(L) + "\n", encoding="utf-8")
print(f"kanji-order-v3.json: {len(order)} chars; "
      f"{len(unclassified)} unclassified shapes; {len(zero)} zero-demand chars")
