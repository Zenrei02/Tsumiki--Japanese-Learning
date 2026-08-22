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

def die(msg):
    sys.exit(f"build-word-ledger.py: {msg}")


def bracketed(text, open_at):
    """Return the contents of the [...] that starts at open_at, brackets balanced."""
    depth, i = 0, open_at
    while i < len(text):
        if text[i] == "[":
            depth += 1
        elif text[i] == "]":
            depth -= 1
            if depth == 0:
                return text[open_at + 1:i]
        i += 1
    die("unterminated bank array — the module is malformed.")


# ---- store 1: bank arrays (per lesson category; [written, gloss], no reading)
#
# Located STRUCTURALLY, not by a fixed field order. The original regex required
# `cat:` and `bank:` to be adjacent lines; Session 17's restaging inserted
# `level:` between them and this store silently fell to zero, which the report
# then printed as "every kanji word has a reading somewhere" — a clean bill of
# health produced by reading nothing. Hence the census guard below.
cats = [(m.start(), m.group(1)) for m in re.finditer(r'\bcat: "([^"]+)"', PRACTICE)]
banks_parsed = 0
for i, (pos, cat) in enumerate(cats):
    end = cats[i + 1][0] if i + 1 < len(cats) else len(PRACTICE)
    block = PRACTICE[pos:end]
    bm = re.search(r'\bbank: \[', block)
    if not bm:
        continue
    banks_parsed += 1
    body = bracketed(block, bm.end() - 1)
    step = cat.split("·")[0].strip()
    for w in re.finditer(r'\["([^"]+)", *"([^"]+)"\]', body):
        add(w.group(1), None, w.group(2), f"bank:{step}")

# Census: every `bank:` key in the file must have been parsed by the loop above.
banks_in_file = len(re.findall(r'\bbank: \[', PRACTICE))
if banks_parsed != banks_in_file:
    die(f"parsed {banks_parsed} bank arrays but the module contains "
        f"{banks_in_file}. The lesson structure has changed shape — fix the "
        f"parser before trusting the ledger.")

# ---- store 2: KANJI_DICT ([written, reading, meaning, jlpt])
dict_region = PRACTICE[PRACTICE.index("const KANJI_DICT"):PRACTICE.index("const DICT_SORTED")]
for m in re.finditer(r'\["([^"]+)", "([^"]*)", "([^"]*)", "(N\d)"\]', dict_region):
    written, reading, meaning, lvl = m.groups()
    add(written, reading or None, meaning or None, "KANJI_DICT")
    ledger[written]["jlpt"] = lvl

# ---- store 3: kanji-module w: arrays ([written, reading, meaning] per kanji)
w_parsed = 0
for m in re.finditer(r'"(.)": \{[^{}]*?w: \[((?:\[[^\]]*\],?)*)\]', KANJI):
    ch, body = m.group(1), m.group(2)
    w_parsed += 1
    for w in re.finditer(r'\["([^"]+)","([^"]*)","([^"]*)"\]', body):
        add(w.group(1), w.group(2) or None, w.group(3) or None, f"w:{ch}")

# ---- census guards on the other two stores -----------------------------------
# Same reasoning as store 1: a store that quietly reads nothing looks exactly
# like a store with nothing to say. Compare against what the files contain.
w_in_file = len(re.findall(r'\bw: \[', KANJI))
if w_parsed != w_in_file:
    die(f"parsed {w_parsed} kanji w: arrays but kanji-module.jsx contains "
        f"{w_in_file}. Fix the parser before trusting the ledger.")

dict_rows = len(re.findall(r'\["([^"]+)", "([^"]*)", "([^"]*)", "(N\d)"\]', dict_region))
if dict_rows == 0:
    die("KANJI_DICT parsed to zero rows — the dictionary's shape has changed.")

for label, n in (("lesson banks", banks_parsed), ("KANJI_DICT", dict_rows),
                 ("kanji w: arrays", w_parsed)):
    if n == 0:
        die(f"store '{label}' contributed nothing. A ledger built from two of "
            f"three stores is not a ledger; refusing to write it.")

# ---- adjudicated stem-vs-word exceptions ----
# KANJI_DICT carries deliberate okurigana-STEM rows for the tap-to-read path
# (止/と, 出/で, 思/おも … — DICT_SORTED's longest-prefix match glosses 変わる,
# 変わった, 変えて through the bare-kanji row). Those rows are display shims,
# not words. 変 is the first stem row to collide with a REAL standalone word
# (変/へん "strange", kanji-module w:, added with the Aug 21 kanji expansion).
# Until a second collision motivates a full stem/word distinction — a reviewer
# question, since some bare rows ARE words (日/ひ, 文/ぶん) — the word-level
# truth is recorded here explicitly, with its reason. Never add a bare hash or
# an unexplained entry (the BENIGN-allowlist rule).
# Adjudicated by Lloyd, Aug 23 2026 (weekly audit).
RESOLVED = {
    "変": {"reading": "へん", "meaning": "strange",
           "note": "KANJI_DICT 変/か is the display stem for 変わる/変える "
                   "inflections; the standalone WORD is へん (strange)."},
}

resolved_notes = []
for _w, _rule in RESOLVED.items():
    _e = ledger.get(_w)
    if _e is None:
        continue
    if _rule["reading"] not in _e["readings"]:
        die(f"RESOLVED entry for {_w} names reading '{_rule['reading']}' but the "
            f"stores now carry {_e['readings']} — the exception has gone stale. "
            f"Re-adjudicate it; do not let it rot.")
    _e["readings"].remove(_rule["reading"]); _e["readings"].insert(0, _rule["reading"])
    if _rule["meaning"] in _e["meanings"]:
        _e["meanings"].remove(_rule["meaning"]); _e["meanings"].insert(0, _rule["meaning"])
    _e["resolved"] = _rule["note"]
    _kept = [c for c in conflicts if not c.startswith(f"READING  {_w}:")]
    if len(_kept) != len(conflicts):
        resolved_notes.append(f"{_w}: {_rule['note']} → '{_rule['reading']}' wins.")
        conflicts[:] = _kept

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
if resolved_notes:
    lines += ["", "## Resolved by adjudicated exception (see RESOLVED in this script)", ""]
    lines += [f"- {n}" for n in resolved_notes]
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
