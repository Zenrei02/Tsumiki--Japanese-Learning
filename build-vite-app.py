#!/usr/bin/env python3
"""Generate the Vite app from the four static modules, with shared code hoisted.

WHY GENERATE RATHER THAN CONVERT. The single-file artifacts must keep working —
the reviewer is grading through the published checker, and the kana modules went
to the voice contributor as standalone HTML. Converting them in place would break
the eval path. So the artifacts stay the source of truth and this derives an
importing version of each. Re-runnable; the artifacts are never modified.

DEDUPLICATION. A first version left every module carrying its own design tokens
and its own copy of the stroke engine, on the grounds that hoisting mechanically
was risky. Lloyd pushed back, correctly: the shared blocks are byte-identical
right now — the drift check proves it — and that is the cheapest moment this will
ever be. Every session that passes risks real divergence. Building a multi-file
project and keeping single-file duplication is the worst of both.

So tokens, the engine, the shared constants and the storage helpers are hoisted
into src/lib/ and imported. Each module keeps its own progress KEY, its own
stroke data, and everything genuinely its own.

THE ONE DESIGN PROBLEM. StrokeView and StrokePractice each read a module-level
STROKES table — once apiece. Merging all three tables into one shared import
would work (kana and kanji key sets are disjoint) but every module would then
download ~100 KB of paths it never draws, undoing the code-splitting that keeps
first load at 49 KB. So src/lib/strokeData.js is a REGISTRY: each module imports
its own data file, that file registers itself on load, and the engine reads the
merged table at render time. Splitting preserved, no call sites changed.

STATIC BY CONSTRUCTION. The API function body is REMOVED, not gated. A first
check that tried to prove the gate held threw two false positives — the tell that
the property was too subtle to assert. "Unreachable because a flag is false" is a
promise about control flow; a static build should make it a promise about the
bundle.
"""
import re, pathlib, sys

HERE = pathlib.Path(__file__).parent
APP = HERE / "naoshi-app"
SRC = APP / "src"
LIB = SRC / "lib"
DATA = SRC / "data"
MODDIR = SRC / "modules"
for d in (LIB, DATA, MODDIR): d.mkdir(parents=True, exist_ok=True)

# The sixth field is the SECTION ACCENT. See ACCENT_RATIONALE below before
# changing one — these colours are constrained, not chosen freely.
MODULES = [
    ("hiragana-module.jsx",   "Hiragana.jsx",   "HiraganaModule",   "Hiragana",   "ひらがな",  "#CFC4E6"),
    ("katakana-module.jsx",   "Katakana.jsx",   "KatakanaModule",   "Katakana",   "カタカナ",  "#A493CE"),
    ("grammar-module.jsx",    "Grammar.jsx",    "GrammarPractice",  "Grammar",    "ぶんぽう",  "#2F6F6B"),
    ("kanji-module.jsx",      "Kanji.jsx",      "KanjiModule",      "Kanji",      "漢字",      "#5B4A7D"),
    ("vocabulary-module.jsx", "Vocabulary.jsx", "VocabularyModule", "Vocabulary", "ことば",    "#8A5A3B"),
    ("checker-module.jsx",    "Checker.jsx",    "CheckerModule",    "Checker",    "直し",      "#C9C6BE"),
]

ACCENT_RATIONALE = """\
Section accents, added Aug 24 2026 (Lloyd's request: a colour per section, with
the kana lighter shades of one family and kanji its darkest).

THE BINDING CONSTRAINT IS THAT FOUR PALETTE COLOURS ALREADY MEAN SOMETHING.
The three-tier feedback system spends 朱 #C7351B on FIX, 藍 #3D5A80 on
UNNATURAL and 金 #907119 on WORTH KNOWING, and 緑 #3E7C4F is ok/correct. A
section accent reusing any of them would make red-means-error unreliable, and
that system is the app's most distinctive idea. So accents must come from hues
the palette has not already committed. Do not "simplify" this later by reaching
for an existing token.

THE SCRIPT TRACK IS ONE FAMILY DEEPENING: 藤 #CFC4E6 -> 藤 #A493CE ->
江戸紫 #5B4A7D. Hiragana, katakana and kanji are not three subjects; they are
one writing system getting deeper, which is what the shared hue says and three
unrelated colours would not. Purple also happens to sit at the top of the
冠位十二階 court ranks, which makes kanji-as-darkest read as rank rather than
as difficulty — the friendlier of the two framings, and consistent with the
standing rule against anything that reads as workload.

THE CHECKER IS DELIBERATELY THE QUIETEST (鼠 #C9C6BE) and this is not an
oversight. It is the one screen where 朱/藍/金 carry meaning, so a saturated
frame there competes with the feedback it exists to present. The near-neutral
also separates the tool from the five learning modules, which is a true
distinction rather than a cosmetic one.

CONTRAST — READ THE WHOLE PARAGRAPH BEFORE QUOTING IT. These accents are
DECORATIVE and REDUNDANT, and that is what exempts them: colour carries no
information here, because every section is also named in text in the header and
the drawer, immediately beside the rule. WCAG 1.4.11 governs colour that is
"required to understand the content", so it does not reach them at all. They
appear in exactly two places, both non-text and both label-adjacent — a 4px
borderTop on the home card and a 3px borderBottom on the section header.

DO NOT read this as "they were measured against 3:1 and passed." Three of them
do not: #CFC4E6 is 1.53, #C9C6BE is 1.58 and #A493CE is 2.54 against both
T.paper and T.sheet. That is fine while they stay decorative, and it is the
whole reason the redundancy above is load-bearing rather than a nicety.

An earlier version of this comment opened by invoking the 3:1 bar as "what
applies" and only then gave the reason it may not — so a session reading the
first sentence would have believed these colours cleared a bar they miss by a
factor of two. Reworded 2026-09-05 on the weekly audit's finding: the palette
was never the defect, the sentence was.

THE CONDITION, since the exemption is conditional: the moment an accent goes
BEHIND TEXT, or becomes the only thing distinguishing two states, the exemption
lapses and the real bar is 4.5:1 — not 3:1. #CFC4E6 is nowhere near either.
Darkening hiragana/katakana/checker to roughly #8E7BB8 / #8F8B80 would clear
3:1 while staying inside the 藤 and 鼠 families, and is the fix if that day comes;
it is deliberately NOT applied now, because it would cost the lightest-shade
reading the script-track argument above depends on.
"""
ENGINE_FNS = ["strokeStart", "StrokeView", "resample", "samplePath", "scoreStroke",
              "tolerancesFor", "thinPoints", "useStrokeData", "StrokePractice"]
# SHARED_CONSTS is DERIVED below, from what the engine actually references.

problems = []
CANON = (HERE / "kanji-module.jsx").read_text(encoding="utf-8")


def decl_span(text, name):
    """Span of a top-level `const NAME = ...` declaration, however many lines.

    A line-based strip (`^const NAME = [^\n]*\n`) removes only the first line of
    a multi-line object or arrow function and leaves its body and closing `};`
    behind — which is a syntax error, not a subtle bug. TRACE_STAGES is exactly
    that shape.
    """
    m = re.search(r"^const " + re.escape(name) + r"\b", text, re.M)
    if not m: return None
    i = m.start(); k = m.end(); depth = 0
    while k < len(text):
        c = text[k]
        if c in "{[(": depth += 1
        elif c in "}])": depth -= 1
        elif c == ";" and depth <= 0:
            return i, k + 1
        elif c == "\n" and depth <= 0:
            # unterminated single-line form: stop at the newline
            rest = text[i:k]
            if rest.count("=") and not rest.rstrip().endswith(","):
                return i, k + 1
        k += 1
    return i, len(text)


def brace_span(text, pat):
    m = re.search(pat, text)
    if not m: return None
    i = m.end() - 1
    while text[i] != "{": i += 1
    d, k = 1, i + 1
    while d:
        if text[k] == "{": d += 1
        elif text[k] == "}": d -= 1
        k += 1
    return m.start(), k


def fn_span(text, name):
    i = text.find("function " + name)
    if i < 0: return None
    p = text.index("(", i); d, q = 1, p + 1
    while d:
        if text[q] == "(": d += 1
        elif text[q] == ")": d -= 1
        q += 1
    j = text.index("{", q); d, k = 1, j + 1
    while d:
        if text[k] == "{": d += 1
        elif text[k] == "}": d -= 1
        k += 1
    return i, k


# ── design tokens: union across modules ──────────────────────────────────────
tok = {}
for src_name, *_ in MODULES:
    t = (HERE / src_name).read_text(encoding="utf-8")
    sp = brace_span(t, r"const T = \{")
    if not sp: continue
    for k, v in re.findall(r"(\w+):\s*('[^']*'|\"[^\"]*\")", t[sp[0]:sp[1]]):
        if k in tok and tok[k] != v:
            problems.append(f"design token `{k}` conflicts: {tok[k]} vs {v} ({src_name})")
        tok[k] = v

# ACCENT is NOT part of the union. T is derived from the modules and guarded by
# the conflict check above; ACCENT is authored here, in the generator, because no
# module owns a section identity — the shell does. Keeping them as two exports
# means the union invariant stays honest and a future accent change cannot look
# like a module token drifting.
accent_js = "".join(
    f'  {c[3].lower()}: "{c[5]}",\n' for c in MODULES)

(LIB / "tokens.js").write_text(
    "// GENERATED by build-vite-app.py — the union of every module's design tokens.\n"
    "// They were identical apart from additions. A key holding two different values\n"
    "// fails the build rather than silently picking one.\n"
    "export const T = {\n"
    + "".join(f"  {k}: {v},\n" for k, v in sorted(tok.items()))
    + "};\n\n"
    + "// Section accents. AUTHORED in build-vite-app.py, not unioned from the modules\n"
    + "// — no module owns a section identity, the shell does.\n"
    + "//\n"
    + "".join(f"// {line}\n" for line in ACCENT_RATIONALE.strip().split("\n"))
    + "export const ACCENT = {\n" + accent_js + "};\n", encoding="utf-8")

# ── stroke data registry ─────────────────────────────────────────────────────
(LIB / "strokeData.js").write_text(
    "// GENERATED by build-vite-app.py.\n"
    "// A REGISTRY rather than one merged table. Merging every stroke path would\n"
    "// work — the kana and kanji key sets are disjoint — but each module would then\n"
    "// download ~100 KB of paths it never draws, undoing the code-splitting that\n"
    "// keeps first load at 49 KB. Each module imports its own data file, that file\n"
    "// registers on load, and the engine reads the merged table at render time.\n"
    "export const STROKES = {};\n"
    "export function registerStrokes(table) { Object.assign(STROKES, table); }\n",
    encoding="utf-8")

# ── the engine, taken once from the canonical module ─────────────────────────
parts = []
for fn in ENGINE_FNS:
    sp = fn_span(CANON, fn)
    if sp: parts.append(CANON[sp[0]:sp[1]])
    else: problems.append(f"engine function {fn} not found in kanji-module.jsx")

# ── what does the engine actually depend on? ─────────────────────────────────
# DERIVED, not hand-listed. Three separate white screens came from a hand-written
# constant list drifting from what the engine really used: STROKES (missing
# import), LOG_PTS (stripped but not exported), useMemo (hardcoded React import),
# and TRACE_N. Each fix revealed the next, which is the signature of maintaining
# by hand a list the compiler could compute.
#
# So: scan the engine for identifiers it references but does not declare, and
# hoist any that are module-level constants in the canonical source.
engine_src_probe = "\n".join(parts)
declared_in_engine = set(re.findall(r"(?:function|const|let|var)\s+([A-Za-z_$][\w$]*)", engine_src_probe))
referenced = set(re.findall(r"\b([A-Za-z_$][\w$]*)\b", engine_src_probe))
JS_GLOBALS = {"Math","JSON","Object","Array","Promise","Set","Map","Date","String","Number",
              "Boolean","Error","console","window","document","isNaN","parseFloat","parseInt",
              "undefined","null","true","false","requestAnimationFrame","setTimeout","AudioContext"}
REACT_HOOKS = {"useState","useEffect","useRef","useMemo","useCallback","useReducer","useLayoutEffect"}
IMPORTED = {"T", "STROKES"}

consts, hoisted_names = [], []
for name in sorted(referenced - declared_in_engine - JS_GLOBALS - REACT_HOOKS - IMPORTED):
    sp = decl_span(CANON, name)          # multi-line safe, same helper as the strip
    if sp:
        decl = CANON[sp[0]:sp[1]].rstrip()
        consts.append(decl)
        # Names this declaration DEFINES — not every `x =` inside its body.
        # The greedy version pulled `s`, `i`, `b`, `m` out of meanDist/median's
        # loop bodies and would have stripped a module's own variable of that
        # name. Only a brace-free declaration can define several names
        # (const A = 1, B = 2); anything with a body defines exactly one.
        head = re.match(r"const\s+([A-Za-z_$][\w$]*)", decl)
        if head:
            if "{" in decl or "[" in decl or "=>" in decl:
                hoisted_names.append(head.group(1))
            else:
                hoisted_names += re.findall(r"(?:const\s+|,\s*)([A-Za-z_$][\w$]*)\s*=", decl)

# de-duplicate declarations that define the same names
seen, uniq = set(), []
for d in consts:
    key = tuple(sorted(re.findall(r"([A-Za-z_$][\w$]*)\s*=", d)))
    if key not in seen:
        seen.add(key); uniq.append(d)
consts = uniq
SHARED_CONSTS = sorted(set(hoisted_names))
print(f"  engine dependencies hoisted: {', '.join(SHARED_CONSTS)}")

# Derive the engine's React imports from what it actually uses. Hardcoding
# "useState, useEffect, useRef" shipped an engine calling useMemo with no import
# — a ReferenceError inside StrokePractice, which is the white screen Lloyd hit
# on BOTH kana Trace and kanji Write. Same shared engine, same crash, two doors.
engine_src = "\n".join(parts)
engine_hooks = sorted({h for h in ["useState", "useEffect", "useRef", "useMemo",
                                   "useCallback", "useReducer", "useLayoutEffect"]
                       if re.search(r"\b" + h + r"\s*\(", engine_src)})

(LIB / "strokeEngine.jsx").write_text(
    "// GENERATED by build-vite-app.py from kanji-module.jsx — ONE implementation.\n"
    "// Previously hand-copied into four modules. Calibration is shared through\n"
    "// stroke-data-v1, so two scoring implementations would end up calibrating\n"
    "// against each other's mistakes. Hoisting removes that class of bug rather\n"
    "// than merely watching for it.\n"
    "// KanjiVG (Ulrich Apel), CC BY-SA 3.0 — http://kanjivg.tagaini.net\n"
    'import { ' + ", ".join(engine_hooks) + ' } from "react";\n'
    'import { T } from "./tokens.js";\n'
    'import { STROKES } from "./strokeData.js";\n\n'
    + "\n".join(consts) + "\n\n"
    + "\n\n".join(parts) + "\n\n"
    # Export every shared constant, not a hand-picked subset. An earlier version
    # exported only TOL/STROKE_BOX/SD_KEY while stripping CAL_* and LOG_* from the
    # modules too — so a module using LOG_PTS outside the engine (both kana modules
    # do, when logging stroke attempts) got a ReferenceError and a white screen the
    # instant tracing started. Stripping and exporting must cover the same list.
    + "export { " + ", ".join(ENGINE_FNS + SHARED_CONSTS) + " };\n",
    encoding="utf-8")

# ── storage helpers, shared ──────────────────────────────────────────────────
(LIB / "json.js").write_text(
    "// GENERATED by build-vite-app.py — the loadJSON/saveJSON pair every module\n"
    "// carried its own identical copy of.\n"
    "export async function loadJSON(key, fallback) {\n"
    "  try { const r = await window.storage.get(key); return r ? JSON.parse(r.value) : fallback; }\n"
    "  catch { return fallback; }\n"
    "}\n"
    "export async function saveJSON(key, v) {\n"
    "  try { await window.storage.set(key, JSON.stringify(v)); }\n"
    "  catch (e) { console.error"'("save failed: " + key, e); }\n'
    "}\n", encoding="utf-8")

# ── per-module transform ─────────────────────────────────────────────────────
stats = []
for src_name, out_name, comp, label, jp, _accent in MODULES:
    src = (HERE / src_name).read_text(encoding="utf-8")
    before = len(src)

    # strip the API implementation entirely — see module docstring
    if re.search(r"async function callClaude", src):
        src = re.sub(r"async function callClaude\([^)]*\) \{.*?\n\}",
                     "async function callClaude() {\n"
                     "  // Removed by build-vite-app.py. This build is static: no API key,\n"
                     "  // no network, no cost. Features needing the grader are disabled\n"
                     "  // above rather than failing here.\n"
                     '  throw new Error("grader-unavailable-in-static-build");\n'
                     "}", src, count=1, flags=re.S)

    # The checker's backend URL comes from the Vite env, so the deployed site
    # and a local dev server can point at different Supabase projects without a
    # code change. The source module keeps a bare "" so it stays loadable
    # outside a bundler, and this is the only place import.meta appears.
    #
    # This is a URL, not a secret: the API key lives in the Edge Function's
    # environment and never reaches the browser. The purity check below still
    # refuses to build if this file ever mentions Anthropic directly.
    src = re.sub(r'^const CHECKER_URL = "";',
                 'const CHECKER_URL = import.meta.env?.VITE_CHECKER_URL || "";'
                 '  // wired by build-vite-app.py',
                 src, count=1, flags=re.M)

    # flip the static flag: the flag gates the UI (self-mark stand-ins for the
    # quiz and both graders), while the strips above and below keep the BUNDLE
    # clean — the flag is a control-flow promise, the strips are bundle promises,
    # and the build makes both.
    if re.search(r"^const STATIC_BUILD = false;", src, re.M):
        src = re.sub(r"^const STATIC_BUILD = false;",
                     "const STATIC_BUILD = true;  // flipped by build-vite-app.py",
                     src, count=1, flags=re.M)

    # the frozen Phase 0 prompts ship only in the graded artifact, never in a
    # public static bundle. References stay valid (the flag or the stripped
    # callClaude makes them unreachable); the text itself is gone. Matched by
    # the *_SYSTEM convention rather than a hand-list — the hand-listed first
    # version missed kanji-module's SENTENCE_SYSTEM, which had been shipping in
    # the public bundle since the app was first built. The purity check below
    # is what caught it.
    src = re.sub(r"^const (\w*_SYSTEM) = `.*?`;",
                 lambda m: f"const {m.group(1)} = null; // stripped by build-vite-app.py — prompts ship only in the graded artifact",
                 src, flags=re.M | re.S)

    # extract this module's stroke table into its own data file, then register it
    sp = brace_span(src, r"const STROKES = \{")
    data_import = ""
    if sp:
        table = src[sp[0]:sp[1]]
        stem = out_name.replace(".jsx", "").lower()
        (DATA / f"strokes-{stem}.js").write_text(
            f"// GENERATED by build-vite-app.py from {src_name}.\n"
            "// KanjiVG (Ulrich Apel), CC BY-SA 3.0 — http://kanjivg.tagaini.net\n"
            "// Registers itself so this module ships only the characters it teaches.\n"
            'import { registerStrokes } from "../lib/strokeData.js";\n'
            + table.replace("const STROKES =", "const TABLE =", 1) + ";\n"
            "registerStrokes(TABLE);\n", encoding="utf-8")
        src = src[:sp[0]] + src[sp[1] + 1:]
        data_import = f'import "../data/strokes-{stem}.js";\n'

    # strip hoisted blocks
    sp = brace_span(src, r"const T = \{")
    if sp: src = src[:sp[0]] + src[sp[1] + 1:]
    for fn in ENGINE_FNS:
        sp = fn_span(src, fn)
        if sp: src = src[:sp[0]] + src[sp[1]:]
    for fn in ("loadJSON", "saveJSON"):
        sp = fn_span(src, fn)
        if sp:
            start = sp[0]
            if src[max(0, start - 6):start].strip().endswith("async"):
                start = src.rindex("async", 0, start)
            src = src[:start] + src[sp[1]:]
    for c in SHARED_CONSTS:
        sp = decl_span(src, c)
        if sp: src = src[:sp[0]] + src[sp[1]:]

    used_engine = [f for f in ENGINE_FNS if re.search(r"\b" + f + r"\b", src)]
    used_const = [c for c in SHARED_CONSTS if re.search(r"\b" + c + r"\b", src)]
    # Modules reference STROKES outside the engine too — e.g. filtering which
    # characters actually have paths before offering writing practice. Stripping
    # the table without importing the registry left a ReferenceError that only a
    # render test catches; the build compiles fine.
    needs_strokes = bool(re.search(r"\bSTROKES\b", src))
    used_json = [f for f in ("loadJSON", "saveJSON") if re.search(r"\b" + f + r"\(", src)]
    needs_T = bool(re.search(r"\bT\.", src))

    for c in SHARED_CONSTS:
        if re.search(r"\b" + c + r"\b", src) and c not in used_const:
            problems.append(f"{out_name}: uses {c} but it is neither declared nor imported")

    for pattern, why in [(r"api\.anthropic\.com", "API endpoint"),
                         (r"ANTHROPIC_API_KEY", "API key reference"),
                         (r"You grade", "grader prompt survived stripping"),
                         (r"You write multiple-choice", "quiz prompt survived stripping"),
                         (r"^const STATIC_BUILD = false;", "static flag not flipped")]:
        for m in re.finditer(pattern, src, re.M):
            problems.append(f"{src_name}:{src[:m.start()].count(chr(10)) + 1} — {why}")

    hooks = sorted({h for h in ["useState", "useEffect", "useRef", "useMemo",
                                "useCallback", "useReducer"] if re.search(r"\b" + h + r"\s*\(", src)})
    src = re.sub(r'^import \{[^}]*\} from "react";\s*\n', "", src, count=1, flags=re.M)

    header = [
        f"// GENERATED from {src_name} by build-vite-app.py — do not hand-edit.",
        "// Edit the source module and re-run. The single-file artifact stays the",
        "// source of truth so the reviewer's grading path keeps working.",
        f'import {{ {", ".join(hooks)} }} from "react";' if hooks else "",
        'import { installStorage } from "../lib/storage.js";',
    ]
    if needs_T: header.append('import { T } from "../lib/tokens.js";')
    if used_engine or used_const:
        header.append('import { ' + ", ".join(used_engine + used_const) + ' } from "../lib/strokeEngine.jsx";')
    if used_json:
        header.append('import { ' + ", ".join(used_json) + ' } from "../lib/json.js";')
    if needs_strokes: header.append('import { STROKES } from "../lib/strokeData.js";')
    if data_import: header.append(data_import.rstrip())
    header.append("installStorage();\n")

    out = "\n".join(h for h in header if h) + "\n" + src
    (MODDIR / out_name).write_text(out, encoding="utf-8")
    stats.append((out_name, before, len(out)))

if problems:
    print("REFUSING TO BUILD:")
    for p in problems: print("  " + p)
    sys.exit(1)

# ── app shell ────────────────────────────────────────────────────────────────
nav = ",\n  ".join(f'{{ id: "{c[3].lower()}", label: "{c[3]}", jp: "{c[4]}", '
                   f'accent: ACCENT.{c[3].lower()}, Comp: {c[2]} }}'
                   for c in MODULES)
imports = "\n".join(f'const {c[2]} = lazy(() => import("./modules/{c[1]}"));' for c in MODULES)

(SRC / "App.jsx").write_text('''// GENERATED by build-vite-app.py — do not hand-edit.
import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { downloadProgress, importProgress, storage } from "./lib/storage.js";
import { T, ACCENT } from "./lib/tokens.js";
''' + imports + '''

const MODULES = [
  ''' + nav + '''
];

// ————— Home (Session 13) —————
// The app used to open straight into a module with nothing explaining what
// the five doors are for. Home answers three questions, in order: where was
// I (the continue card), where should a newcomer go first (hiragana — it
// gates everything), and what is everything else for — one honest line each,
// stating capability, never workload: no counts anywhere, per the standing
// rule. Mobile-first: one column, whole cards tappable, thumb-size targets.
const HOME_WHY = {
  hiragana: "The script that holds every sentence together. Everything else here assumes it — this is where Japanese starts.",
  katakana: "The second script: loanwords, menus, signs. Runs alongside hiragana, at whatever pace suits you.",
  grammar: "The heart of the app — lessons and graded writing practice, from your first sentence upward.",
  kanji: "Characters in an order that pays for itself: each one unlocks words you already use.",
  vocabulary: "The words you have met, coming back just before you would forget them.",
  checker: "Write anything in Japanese and find out what is wrong, what merely sounds off, and why.",
};
// Shown INSTEAD of HOME_WHY when the learner has started nothing. Not a lock —
// the door stays open either way; this just tells the right person it is theirs.
const HOME_INVITE = {
  checker: "Do you have Japanese experience? Try out the checker! Write a sentence and find out what is wrong, what merely sounds off, and why.",
};
const PROGRESS_KEYS = {
  hiragana: "hiragana-progress-v2", katakana: "katakana-progress-v1",
  grammar: "n5-progress-v1", kanji: "kanji-progress-v1", vocabulary: "known-words-v1",
};

// Read through `storage`, NOT localStorage directly (Session 21). The old
// version called localStorage.getItem here while every module went through the
// storage adapter — which falls back to an in-memory map in a private window or
// wherever site data is blocked. In that case the modules held real progress
// and Home reported none, showing "START HERE" to someone mid-course. One store
// per concern: if the modules read it through the adapter, so does Home.
async function readStarted() {
  const out = {};
  for (const [id, key] of Object.entries(PROGRESS_KEYS)) {
    const r = await storage.get(key);
    const v = r?.value;
    out[id] = v != null && v !== "{}" && v !== "[]";
  }
  return out;
}

// The next unfinished task of the current quest chain, if one exists.
// Written by the engagement module (engagement-v1). Absent until that module is
// wired in and reportActivity() has call sites — Home falls back to the
// continue card, so this is dark rather than broken until then.
async function readNextTask() {
  try {
    const r = await storage.get("engagement-v1");
    const chain = r ? JSON.parse(r.value)?.chain : null;
    const t = chain?.tasks?.find((x) => x.done < x.target);
    if (!t) return null;
    return MODULES.some((m) => m.id === t.module) ? t : null;
  } catch (e) { return null; }
}

function Home({ startedMap, lastMod, nextTask, go }) {
  const fresh = !MODULES.some((m) => startedMap[m.id]);
  const started = (id) => Boolean(startedMap[id]);

  // Hero priority: what to DO now > where you were > where to begin.
  // Session 21 — Home answered "where can I go" six times over and "what should
  // I do" not at all, so every session opened with a decision. A module name is
  // not an action: "Continue › Kanji" still leaves the choosing to the learner.
  const taskMod = nextTask ? MODULES.find((m) => m.id === nextTask.module) : null;
  const hero = taskMod || lastMod || MODULES[0];
  const heroLabel = taskMod ? "NEXT ON YOUR PATH"
    : lastMod ? "PICK UP WHERE YOU LEFT OFF" : "NEW HERE? START WITH";
  const heroCta = taskMod ? "Go ›" : lastMod ? "Continue ›" : "Start here ›";
  const cardBase = {
    display: "block", width: "100%", textAlign: "left", cursor: "pointer",
    background: T.sheet, border: `1px solid ${T.hairline}`, borderRadius: 10,
    padding: "14px 16px", fontFamily: T.uiFont, color: T.ink,
  };
  const chip = (text, color) => (
    <span style={{
      font: `600 10px ${T.uiFont}`, letterSpacing: ".5px", color: T.paper,
      background: color, borderRadius: 999, padding: "3px 9px", marginLeft: 8,
      verticalAlign: "middle",
    }}>{text}</span>
  );
  return (
    <div style={{ padding: "18px 16px 36px" }}>
      <button onClick={() => go(hero.id)} style={{
        ...cardBase, border: `2px solid ${T.ink}`, padding: "18px 18px 16px", marginBottom: 22,
      }}>
        <div style={{ font: `600 11px ${T.uiFont}`, letterSpacing: ".7px", color: T.sub }}>
          {heroLabel}
        </div>
        {taskMod ? (
          // The action is the headline; the module name demotes to a subtitle.
          <>
            <div style={{ font: `600 22px/1.4 ${T.uiFont}`, marginTop: 8 }}>
              {nextTask.label}
            </div>
            <p style={{ font: `13px ${T.uiFont}`, color: T.sub, margin: "8px 0 12px" }}>
              in {hero.label} <span style={{ fontFamily: T.jpFont }}>{hero.jp}</span>
            </p>
          </>
        ) : (
          <>
            <div style={{ marginTop: 8, display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
              <span style={{ font: `600 24px ${T.uiFont}` }}>{hero.label}</span>
              <span style={{ font: `20px ${T.jpFont}`, color: T.sub }}>{hero.jp}</span>
            </div>
            <p style={{ font: `14px/1.6 ${T.uiFont}`, color: T.sub, margin: "8px 0 12px" }}>
              {HOME_WHY[hero.id]}
            </p>
          </>
        )}
        <div style={{ font: `600 15px ${T.uiFont}` }}>{heroCta}</div>
      </button>

      {started("grammar") && (
        // Session 14: the daily review challenge gets a front-door card once
        // grammar has begun — before that it would only point at an empty
        // pool. The flag routes the grammar module straight to the challenge.
        <button
          onClick={() => { try { localStorage.setItem("naoshi-open-challenge", "1"); } catch (e) {} go("grammar"); }}
          style={{ ...cardBase, border: `1px solid ${T.shu}55`, marginBottom: 22 }}
        >
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ font: `600 16px ${T.uiFont}` }}>Review challenge</span>
            <span style={{ font: `15px ${T.jpFont}`, color: T.shu, marginLeft: 8 }}>腕試し</span>
          </div>
          <p style={{ font: `13px/1.6 ${T.uiFont}`, color: T.sub, margin: "6px 0 0" }}>
            Draw a grammar point you've learned and write with it. A fresh challenge every day — the day turns at midnight, Tokyo time.
          </p>
        </button>
      )}

      <div style={{ font: `600 11px ${T.uiFont}`, letterSpacing: ".7px", color: T.sub, marginBottom: 10 }}>
        EVERYWHERE YOU CAN GO
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {MODULES.map((m) => (
          // The accent rule sits on the card too, not only inside the section,
          // so the mapping is learned on the way in rather than discovered after.
          <button key={m.id} onClick={() => go(m.id)}
                  style={{ ...cardBase, borderTop: `4px solid ${m.accent}` }}>
            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ font: `600 16px ${T.uiFont}` }}>{m.label}</span>
              <span style={{ font: `15px ${T.jpFont}`, color: T.sub, marginLeft: 8 }}>{m.jp}</span>
              {m.id === "hiragana" && fresh && chip("START HERE", T.ok)}
              {m.id === "checker" && fresh && chip("ALREADY STUDIED?", T.note)}
              {lastMod?.id === m.id && chip("LAST WORKED ON", T.ink)}
              {lastMod?.id !== m.id && started(m.id) && chip("IN PROGRESS", T.sub)}
            </div>
            <p style={{ font: `13px/1.6 ${T.uiFont}`, color: T.sub, margin: "6px 0 0" }}>
              {/* Session 21 (Lloyd): a day-one learner sees the Checker as a
                  peer of Hiragana and bounces off a tool built for people who
                  can already write — a bad first impression, and a real API
                  cost per call. The answer is an invitation, not a lock:
                  someone arriving with existing Japanese is exactly who the
                  Checker is for, and this is how they find out. */}
              {m.id === "checker" && fresh ? HOME_INVITE.checker : HOME_WHY[m.id]}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ————— Side menu (Session 16) —————
// The tab bar was five buttons wide and already wrapped onto a second row on a
// phone, pushing content down before the learner had read anything. A sixth
// door would have made it three rows. A drawer costs one tap to open and in
// exchange gives every module a full-width target with its Japanese name
// beside it — the shape the app is actually used in, which is one-handed.
//
// Deliberately not a <dialog>: Safari's support for inert backdrops is still
// uneven and this needs no form semantics. Scrim + role="dialog" + Escape is
// the boring version that behaves the same everywhere.
function Drawer({ open, close, active, go }) {
  const panelRef = useRef(null);

  // Escape closes, and the background does not scroll underneath an open
  // drawer — on a phone that scroll-through is the difference between a menu
  // and a bug.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === "Escape") close(); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    // Move focus into the panel so a keyboard or screen-reader user lands
    // inside the menu they just opened rather than behind it.
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  if (!open) return null;

  const row = (selected) => ({
    display: "flex", alignItems: "baseline", gap: 10, width: "100%",
    background: selected ? T.paper : "none",
    border: "none", borderLeft: `3px solid ${selected ? T.ink : "transparent"}`,
    cursor: "pointer", textAlign: "left", padding: "14px 18px",
    font: `${selected ? 600 : 400} 16px ${T.uiFont}`,
    color: selected ? T.ink : T.sub,
  });

  return (
    <>
      <div onClick={close} aria-hidden="true" style={{
        position: "fixed", inset: 0, zIndex: 20,
        background: "rgba(34,37,43,0.44)",
      }} />
      <nav ref={panelRef} tabIndex={-1} role="dialog" aria-modal="true"
           aria-label="Modules" style={{
        position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 21,
        width: "min(82vw, 300px)", background: T.sheet,
        borderRight: `1px solid ${T.hairline}`,
        display: "flex", flexDirection: "column", outline: "none",
        boxShadow: "0 0 40px rgba(34,37,43,0.18)",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 12px 14px 18px", borderBottom: `1px solid ${T.hairline}`,
        }}>
          <span style={{ font: `600 19px ${T.jpFont}`, color: T.ink }}>直</span>
          <button onClick={close} aria-label="Close menu" style={{
            background: "none", border: "none", cursor: "pointer",
            padding: 10, font: `18px ${T.uiFont}`, color: T.sub, lineHeight: 1,
          }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "6px 0" }}>
          <button onClick={() => go("home")} style={row(active === "home")}>
            Home
          </button>
          {MODULES.map((m) => (
            <button key={m.id} onClick={() => go(m.id)} style={row(active === m.id)}>
              {m.label}
              <span style={{ font: `14px ${T.jpFont}`, color: T.sub }}>{m.jp}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}

export default function App() {
  // Land on Home. It remembers where they were (naoshi-last-module) and
  // offers it as the continue card, rather than teleporting them there —
  // Session 13: the doors deserve a hallway.
  const [active, setActive] = useState("home");
  const [msg, setMsg] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [startedMap, setStartedMap] = useState({});
  const [lastWorked, setLastWorked] = useState(null);
  const [nextTask, setNextTask] = useState(null);

  // Home's data is read through the storage adapter, so it must be async and
  // must refresh whenever we come back to Home — a lesson finished inside a
  // module changes both the chips and the hero.
  useEffect(() => {
    if (active !== "home") return undefined;
    let alive = true;
    (async () => {
      const [s, t, last] = await Promise.all([
        readStarted(), readNextTask(), storage.get("naoshi-last-module"),
      ]);
      if (!alive) return;
      setStartedMap(s);
      setNextTask(t);
      setLastWorked(last?.value ?? null);
    })();
    return () => { alive = false; };
  }, [active]);
  const current = MODULES.find((m) => m.id === active) || MODULES[0];
  const menuBtnRef = useRef(null);

  const closeMenu = () => {
    setMenuOpen(false);
    // Focus goes back to the control that opened the drawer, so keyboard
    // users are not dropped at the top of the document.
    menuBtnRef.current?.focus();
  };

  // ————— "Last worked on", by evidence (Session 21) —————
  // This used to be written the instant you navigated: tapping into Kanji and
  // backing straight out made it your continue card indefinitely. Opening is
  // not doing. Now we snapshot the module's own progress store on the way in
  // and compare on the way out — the flag is only written if the store actually
  // changed. No module edits needed: each one already persists its own state,
  // and that write IS the evidence.
  const snapRef = useRef({ id: null, value: null });

  const snapshot = async (id) => {
    const key = PROGRESS_KEYS[id];
    if (!key) { snapRef.current = { id: null, value: null }; return; }
    const r = await storage.get(key);
    snapRef.current = { id, value: r?.value ?? null };
  };

  const commitIfWorked = async () => {
    const { id, value } = snapRef.current;
    if (!id) return;
    const key = PROGRESS_KEYS[id];
    const r = await storage.get(key);
    if ((r?.value ?? null) !== value) {
      await storage.set("naoshi-last-module", id);
      setLastWorked(id);
    }
    snapRef.current = { id: null, value: null };
  };

  const go = (id) => {
    commitIfWorked();
    setActive(id);
    setMenuOpen(false);
    if (id !== "home") snapshot(id);
  };

  // A learner who closes the tab mid-lesson still worked. Commit on hide too.
  useEffect(() => {
    const onHide = () => { if (document.visibilityState === "hidden") commitIfWorked(); };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, []);

  const restore = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = () => setMsg(importProgress(String(r.result)).message);
    r.readAsText(file);
    e.target.value = "";
  };

  const btn = {
    background: "none", border: "none", cursor: "pointer",
    padding: "8px 10px", borderRadius: 8,
  };

  return (
    <div style={{ background: T.paper, minHeight: "100vh", fontFamily: T.uiFont }}>
      <header style={{
        background: T.sheet,
        // A BAR UNDER THE STICKY HEADER, not a frame around the viewport: a
        // four-sided border costs real width on a phone and this carries the
        // same signal for none. Home keeps the plain hairline — it is not a
        // section and should not claim one's colour.
        borderBottom: active === "home"
          ? `1px solid ${T.hairline}`
          : `3px solid ${current.accent}`,
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{
          maxWidth: 900, margin: "0 auto", padding: "8px 12px",
          display: "flex", alignItems: "center", gap: 4,
        }}>
          <button ref={menuBtnRef} onClick={() => setMenuOpen(true)}
                  aria-label="Menu" aria-expanded={menuOpen} aria-haspopup="dialog"
                  style={{
            ...btn, padding: 10, display: "flex", flexDirection: "column",
            gap: 4, width: 44, alignItems: "stretch",
          }}>
            {[0, 1, 2].map((i) => (
              <span key={i} style={{
                display: "block", height: 2, background: T.ink, borderRadius: 2,
              }} />
            ))}
          </button>
          <button onClick={() => go("home")} aria-label="Home" style={{
            background: "none", border: "none", cursor: "pointer", padding: "4px 8px",
            font: `600 17px ${T.jpFont}`, color: T.ink, borderRadius: 8,
          }}>直</button>
          <span style={{
            font: `14px ${T.uiFont}`, color: T.sub, marginLeft: 2,
          }}>{active === "home" ? "" : current.label}</span>
          <span style={{ flex: 1 }} />
          <button onClick={downloadProgress} title="Save your progress to a file" style={{
            ...btn, border: `1px solid ${T.hairline}`, padding: "6px 12px",
            font: `13px ${T.uiFont}`, color: T.sub,
          }}>Save</button>
          <label style={{
            border: `1px solid ${T.hairline}`, borderRadius: 8, padding: "6px 12px",
            cursor: "pointer", font: `13px ${T.uiFont}`, color: T.sub,
          }}>
            Restore
            <input type="file" accept="application/json" onChange={restore}
                   style={{ display: "none" }} />
          </label>
        </div>
        {msg && (
          <div role="status" style={{
            maxWidth: 900, margin: "0 auto", padding: "0 16px 10px",
            font: `13px ${T.uiFont}`, color: T.note,
          }}>{msg}</div>
        )}
      </header>

      <Drawer open={menuOpen} close={closeMenu} active={active} go={go} />

      <main style={{ maxWidth: 900, margin: "0 auto" }}>
        {active === "home" ? (
          <Home startedMap={startedMap} nextTask={nextTask} go={go}
                lastMod={MODULES.find((m) => m.id === lastWorked) || null} />
        ) : (
          <Suspense fallback={
            <p style={{ padding: "40px 18px", color: T.sub, font: `14px ${T.uiFont}` }}>Loading…</p>
          }>
            <current.Comp />
          </Suspense>
        )}
      </main>
    </div>
  );
}
''', encoding="utf-8")

(SRC / "main.jsx").write_text('''// GENERATED by build-vite-app.py — do not hand-edit.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { installStorage } from "./lib/storage.js";
import App from "./App.jsx";

installStorage();
createRoot(document.getElementById("root")).render(<StrictMode><App /></StrictMode>);
''', encoding="utf-8")

saved = sum(b - a for _, b, a in stats)
print(f"lib: tokens ({len(tok)} keys), engine ({len(parts)} functions), registry, json helpers")
for name, b, a in stats:
    print(f"  {name:18s} {b:>8,} → {a:>8,}  ({b - a:+,})")
print(f"\nduplication removed from modules: {saved:,} bytes")
print("verified: no API endpoint or key reference in any generated file")
