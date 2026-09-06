#!/usr/bin/env python3
"""Curriculum-gap audit: probe grammar-module.jsx's CURRICULUM against the
checker's SYSTEM_PROMPT (tsumiki-prototype.jsx).

Re-run this after ANY SYSTEM_PROMPT change. It answers one question: is the
checker grading on anything the curriculum never teaches?

Method (same as the Session-4 audit that found transitivity/potential/
orthography missing): split the curriculum into per-lesson text blocks, then
regex-probe every block for each concept the prompt grades on or watches for.
A probe with zero matching lessons is a gap.

The probe list is maintained BY HAND against the prompt. When the prompt
changes, diff its categories / watchlist / named alternations against PROBES
below before running — a probe list that lags the prompt audits nothing.
Current as of SCHEMA_VERSION naoshi-4.

Usage: python3 curriculum-gap-audit.py [--report out.md]
"""
import re, sys, datetime, pathlib

HERE = pathlib.Path(__file__).parent
PRACTICE = (HERE / "grammar-module.jsx").read_text(encoding="utf-8")
CHECKER = (HERE / "tsumiki-prototype.jsx").read_text(encoding="utf-8")

# ---- sanity: which prompt version is this audit running against? ----
m = re.search(r'SCHEMA_VERSION = "([^"]+)"', CHECKER)
SCHEMA = m.group(1) if m else "UNKNOWN"

# ---- carve the curriculum into lesson blocks ----
start = PRACTICE.index("const CURRICULUM = [")
end = PRACTICE.index("];", PRACTICE.index("// ————— ", start))  # next section marker
region = PRACTICE[start:end]

# Each lesson starts at `id: "..."`; its text runs to the next id.
parts = re.split(r'\bid: "([\w-]+)"', region)
lessons = {}  # id -> text block
for i in range(1, len(parts) - 1, 2):
    lessons[parts[i]] = parts[i + 1]
if len(parts) % 2 == 0:  # trailing block
    lessons[parts[-2]] = parts[-1] if isinstance(parts[-1], str) else ""

# ---- probes: (label, [regexes], expectation) ----
# expectation: "required" | "deferred" (known deliberate gap — report, don't fail)
PROBES = [
    # — grading categories —
    ("particle: は vs が", [r"は.{0,40}が|が.{0,40}は", r"new information|topic"], "required"),
    ("particle: に vs で", [r"に.{0,30}で|で.{0,30}に", r"de-place|ni-time"], "required"),
    ("conjugation: te-form", [r"て形|te-form|〜て"], "required"),
    ("conjugation: negation", [r"ません|ない form|negat"], "required"),
    ("conjugation: past tense", [r"ました|past"], "required"),
    ("conjugation: potential form", [r"potential|話せ|できる"], "required"),
    ("conjugation: passive", [r"passive|られ"], "required"),
    ("word_choice: transitive/intransitive", [r"transitiv|開け|閉ま|始ま"], "required"),
    ("word_order: verb-last / postpositions", [r"verb goes last|verb comes last|order"], "required"),
    ("register: plain vs です/ます mixing", [r"polite|politeness|plain form|です/ます|register"], "required"),
    ("naturalness: textbook-flavoured phrasing", [r"natural|native speaker"], "required"),
    ("orthography: kana where kanji is standard", [r"orthograph|kana where|漢字.{0,20}かな|kanji.{0,30}standard"], "required"),
    # — L1-interference watchlist —
    ("watchlist: pronoun overuse (私 drop)", [r"私.{0,60}(every|repeat|drop|omit)|subject.{0,60}(drop|omit|leaves out)|loudest tell"], "required"),
    ("watchlist: あなた misuse", [r"あなた"], "required"),
    ("watchlist: が-traps — 好き/嫌い", [r"好き"], "required"),
    ("watchlist: が-traps — 上手/下手", [r"上手|下手"], "required"),
    ("watchlist: が-traps — 欲しい", [r"欲しい|ほしい"], "required"),
    ("watchlist: が-traps — わかる", [r"わかる|わかり"], "required"),
    ("watchlist: が-traps — できる", [r"できる|できます"], "required"),
    # — rule-7 named alternations (added in naoshi-4) —
    ("alternation: てもらう vs てくれる", [r"もらう|もらい", r"くれる|くれま"], "required"),
    ("alternation: は vs が under contrast", [r"contrast.{0,60}(は|が)|(は|が).{0,60}contrast"], "required"),
    ("alternation: たら vs と", [r"たら", r"〜と|use と|と:"], "required"),
    ("alternation: ば conditional", [r"〜ば|use ば|ば form|えば"], "deferred"),
    ("alternation: なら conditional", [r"なら"], "deferred"),
    ("alternation: plain vs polite choice", [r"plain.{0,50}polite|polite.{0,50}plain"], "required"),
    # — curriculum-internal probes (Session 9) —
    # NOT derived from the checker prompt. Everything above asks "does the
    # curriculum teach what the checker grades?", which structurally cannot find
    # a gap in something the checker never checks. The prompt contains zero
    # mentions of する, so no prompt-derived probe could ever have found the two
    # gaps below. They were found by a learner-shaped question instead:
    # "is the する suffix in here at all?"
    #
    # Keep this section for things the curriculum owes the LEARNER rather than
    # things it owes the checker. A clean prompt-coverage report is a narrower
    # claim than it looks.
    # ⚠️ Both probes below were written loose first and reported "covered" on
    # false positives — `shimasu-change` (〜にします, a different pattern) and the
    # passing する mentions in other lessons' `watch` fields. A probe that matches
    # something adjacent is worse than no probe, because it certifies the gap
    # shut. Tightened to require an actual INTRODUCTION, and confirmed to report
    # GAP against the current file before being trusted.
    # RETUNED Aug 15 2026 (weekly audit). This probe reported GAP for a week
    # after the defect it was written for had been FIXED. sb-verbtypes now reads
    # "one of two families — plus exactly two exceptions, する and 来る, and that
    # is the whole system", and its `when` field puts する/来る outside the
    # sorting test explicitly. The old regex wanted `third|own|separate` within
    # 60 chars of する; the text has "its own forms" at ~90 — and, the actual
    # reason widening the window did not help, `.` does not cross newlines, so
    # the two halves of the claim sit in different `exp` fields and could never
    # match in one pass. The window was never the bug.
    #
    # Now anchored to ONE LINE on purpose (`[^\n]`, not `.`): the families
    # framing, then する/来る, then the words that put them outside it. Verified
    # against three negative fixtures before being trusted — exception framing
    # stripped, する/来る removed entirely (the original Session-9 defect), and
    # the lesson deleted. All three report GAP; the live file reports covered by
    # sb-verbtypes alone, with no false positive on ta-plain or potential, both
    # of which mention する and "irregular" for conjugation reasons.
    #
    # A permanently-red check stops being read, and this one shares its exit
    # code with the noun+する gap below, which is real.
    ("verb class: three families, not two (する/来る introduced as a class)",
     [r"(Go|Ichi|godan|ichidan|famil)[^\n]{0,400}(する|来る)[^\n]{0,160}(irregular|exception|own forms|third)"],
     "required"),
    ("word formation: noun + する",
     [r"(noun|名詞).{0,60}する.{0,60}(verb|動詞)|する.{0,60}(turns|makes|verbali[sz]).{0,40}(noun|名詞)|サ変"],
     "required"),
    ("counters: 〜つ vs 〜個 vs 〜人", [r"〜つ|counter"], "required"),
    ("word formation: adjective → adverb (〜く / 〜に)", [r"くする|adverb|〜く.{0,30}〜に"], "required"),
]

def probe_hits(regexes):
    hits = set()
    for lid, text in lessons.items():
        if all(re.search(rx, text, re.I) for rx in regexes):
            hits.add(lid)
    # fall back to any-match if all-match found nothing (multi-regex probes)
    if not hits and len(regexes) > 1:
        for lid, text in lessons.items():
            if any(re.search(rx, text, re.I) for rx in regexes):
                hits.add(lid)
        return hits, "partial"
    return hits, "full"

# ---- requires integrity: every build's requires must name real lesson ids ----
req_errors = []
empty_requires = []
for m2 in re.finditer(r'id: "([\w-]+)"[\s\S]{0,200}?requires: \[([^\]]*)\]', region):
    lid, body = m2.group(1), m2.group(2)
    ids = re.findall(r'"([\w-]+)"', body)
    if not ids:
        empty_requires.append(lid)
    for rid in ids:
        if rid not in lessons:
            req_errors.append(f"{lid} requires unknown id '{rid}'")

# ---- report ----
lines = [
    f"# Curriculum-gap audit — {datetime.date.today().isoformat()}",
    f"Checker prompt: `{SCHEMA}` · lessons probed: {len(lessons)}",
    "",
    "| Probe | Status | Covered by |",
    "|---|---|---|",
]
missing = []
for label, rxs, expect in PROBES:
    hits, mode = probe_hits(rxs)
    if hits:
        shown = ", ".join(sorted(hits)[:6]) + (" …" if len(hits) > 6 else "")
        flag = "covered" if mode == "full" else "covered (partial match)"
        lines.append(f"| {label} | {flag} | {shown} |")
    else:
        tag = "DEFERRED (known)" if expect == "deferred" else "**MISSING**"
        lines.append(f"| {label} | {tag} | — |")
        if expect == "required":
            missing.append(label)

lines += ["", "## requires integrity"]
lines.append(f"- Empty requires arrays: {', '.join(empty_requires) if empty_requires else 'none'}")
lines.append(f"- Broken references: {'; '.join(req_errors) if req_errors else 'none'}")
lines += ["", "## Verdict"]
if missing:
    lines.append(f"**{len(missing)} required gap(s):** " + "; ".join(missing))
else:
    lines.append("No required gaps. The checker grades nothing the curriculum does not teach. "
                 "(ば/なら remain deliberate deferrals — the checker's rule-7 mentions them as "
                 "alternatives it may NAME in explanations, which does not require a lesson.)")
report = "\n".join(lines)
print(report)
if "--report" in sys.argv:
    out = pathlib.Path(sys.argv[sys.argv.index("--report") + 1])
    out.write_text(report + "\n", encoding="utf-8")
    print(f"\nwritten to {out}", file=sys.stderr)
sys.exit(1 if missing or req_errors else 0)
