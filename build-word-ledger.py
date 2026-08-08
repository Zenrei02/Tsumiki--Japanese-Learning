#!/usr/bin/env python3
"""Build the consolidated word ledger from the three uncoordinated word stores.

Per word-kanji-scheduling-v1.md §6/§8 and the tracker row 'Consolidate three
word stores': words currently live in `bank` (grammar-module.jsx, per-lesson,
no readings), `KANJI_DICT` (grammar-module.jsx, display dictionary doing double
duty), and the `w:` sample-word arrays (kanji-module.jsx). None is
authoritative. This script makes ONE authoritative artifact:

  word-ledger-v1.json   — every word the app teaches or displays, with
                          written form, reading, meaning, and provenance
                          (which store(s), which lesson/kanji). This is the
                          ordering pipeline's input (Loach & Wang word-driven
                          variant runs over exactly this set).
  word-ledger-report.md — scope stats + every cross-store conflict, for
                          resolution at source.

The JSX stores are NOT rewritten by this script. While the modules are
single-file artifacts they cannot import shared data; the ledger becomes the
source of truth they are regenerated FROM when the web-app port happens.
`w:` survives as presentation either way (good teaching), it just stops being
an independent authority on what a word means.

Re-run after any edit to bank / KANJI_DICT / w: arrays. Exits nonzero if new
conflicts appear.
"""
import json, re, sys, datetime, pathlib
from collections import OrderedDict

HERE = pathlib.Path(__file__).parent
PRACTICE = (HERE / "grammar-module.jsx").read_text(encoding="utf-8")
KANJI = (HERE / "kanji-module.jsx").read_text(encoding="utf-8")

ledger = OrderedDict()  # written -> entry
conflicts = []

def add(written, reading, meaning, source):
    e = ledger.setdefault(written, {"written": written, "readings": [],
                                    "meanings": [], "sources": []})
    if reading and reading not in e["readings"]:
        if e["readings"]:
            conflicts.append(f"READING  {written}: '{e['readings'][0]}' "
                             f"({e['sources'][0]}) vs '{reading}' ({source})")
        e["readings"].append(reading)
    if meaning and meaning not in e["meanings"]:
        e["meanings"].append(meaning)
    if source not in e["sources"]:
        e["sources"].append(source)

# ---- store 1: bank arrays (per lesson category; [written, gloss], no reading)
for m in re.finditer(r'cat: "([^"]+)",\s*\n\s*bank: \[([^\]]*(?:\][^\]]*)*?)\],\s*\n\s*points:', PRACTICE):
    cat, body = m.group(1), m.group(2)
    step = cat.split("·")[0].strip()
    for w in re.finditer(r'\["([^"]+)", "([^"]+)"\]', body):
        add(w.group(1), None, w.group(2), f"bank:{step}")

# ---- store 2: KANJI_DICT ([written, reading, meaning, jlpt])
dict_region = PRACTICE[PRACTICE.index("const KANJI_DICT"):PRACTICE.index("const DICT_SORTED")]
for m in re.finditer(r'\["([^"]+)", "([^"]*)", "([^"]*)", "(N\d)"\]', dict_region):
    written, reading, meaning, lvl = m.groups()
    add(written, reading or None, meaning or None, "KANJI_DICT")
    ledger[written]["jlpt"] = lvl

# ---- store 3: kanji-module w: arrays ([written, reading, meaning] per kanji)
for m in re.finditer(r'"(.)": \{[^{}]*?w: \[((?:\[[^\]]*\],?)*)\]', KANJI):
    ch, body = m.group(1), m.group(2)
    for w in re.finditer(r'\["([^"]+)","([^"]*)","([^"]*)"\]', body):
        add(w.group(1), w.group(2) or None, w.group(3) or None, f"w:{ch}")

# ---- report ----
n_bank = sum(1 for e in ledger.values() if any(s.startswith("bank") for s in e["sources"]))
n_dict = sum(1 for e in ledger.values() if "KANJI_DICT" in e["sources"])
n_w = sum(1 for e in ledger.values() if any(s.startswith("w:") for s in e["sources"]))
n_multi = sum(1 for e in ledger.values() if len(e["sources"]) > 1)
no_reading = sorted(w for w, e in ledger.items()
                    if not e["readings"] and re.search(r"[㐀-鿿]", w))

out = {"generated": datetime.date.today().isoformat(),
       "note": "Authoritative word set for the app. Input to the word-driven "
               "ordering pipeline. Regenerate with build-word-ledger.py.",
       "count": len(ledger), "words": list(ledger.values())}
(HERE / "word-ledger-v1.json").write_text(
    json.dumps(out, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

lines = [
    f"# Word ledger report — {datetime.date.today().isoformat()}",
    "",
    f"**{len(ledger)} distinct words** across the three stores: "
    f"{n_bank} in lesson banks, {n_dict} in KANJI_DICT, {n_w} in kanji w: arrays; "
    f"{n_multi} appear in more than one store.",
    "",
    "## Cross-store reading conflicts",
    "",
]
if conflicts:
    lines += [f"- {c}" for c in conflicts]
else:
    lines.append("None. The three stores never disagree on a reading — the "
                 "divergence is in *scope*, not content.")
lines += [
    "",
    "## Kanji-containing words with no recorded reading",
    "",
    "These appear only in a lesson `bank` (which stores no readings). The "
    "display path covers them only if KANJI_DICT happens to have the word; "
    "otherwise they render as 'not in dictionary'. This is the concrete cost "
    "of the three-store split:",
    "",
]
lines.append(", ".join(no_reading) if no_reading else "None — every kanji word has a reading somewhere.")
report = "\n".join(lines)
(HERE / "word-ledger-report.md").write_text(report + "\n", encoding="utf-8")
print(report)
print(f"\nword-ledger-v1.json: {len(ledger)} entries", file=sys.stderr)
sys.exit(1 if conflicts else 0)
