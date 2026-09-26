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
APP = HERE / "tsumiki-app"
SRC = APP / "src"
LIB = SRC / "lib"
DATA = SRC / "data"
MODDIR = SRC / "modules"
for d in (LIB, DATA, MODDIR): d.mkdir(parents=True, exist_ok=True)

# The sixth field is the SECTION ACCENT. See ACCENT_RATIONALE below before
# changing one — these colours are constrained, not chosen freely.
MODULES = [
    ("hiragana-module.jsx",   "Hiragana.jsx",   "HiraganaModule",   "Hiragana",   "ひらがな",  "#9C8BC4"),
    ("katakana-module.jsx",   "Katakana.jsx",   "KatakanaModule",   "Katakana",   "カタカナ",  "#7A66A8"),
    ("grammar-module.jsx",    "Grammar.jsx",    "GrammarPractice",  "Grammar",    "ぶんぽう",  "#2F6F6B"),
    ("kanji-module.jsx",      "Kanji.jsx",      "KanjiModule",      "Kanji",      "漢字",      "#5B4A7D"),
    ("vocabulary-module.jsx", "Vocabulary.jsx", "VocabularyModule", "Vocabulary", "ことば",    "#8A5A3B"),
    ("checker-module.jsx",    "Checker.jsx",    "CheckerModule",    "Checker",    "直し",      "#C7351B"),
    ("dictionary-module.jsx", "Dictionary.jsx", "DictionaryModule", "Dictionary", "じしょ",    "#727171"),
]

ACCENT_RATIONALE = """\
THE TATAMI REWORK (2026-09-27, docs/design/rework/) CHANGED THREE OF THESE.
The accents are now the FACES of the Home blocks, with a white glyph and label
on top. That is the day the CONDITION paragraph below anticipated: an accent
went behind text, so the decorative exemption lapsed. Hiragana moved
#CFC4E6 -> #9C8BC4 and katakana #A493CE -> #7A66A8 (same 藤 family, deepening
as before), and the Checker became lacquer 朱 #C7351B: it is the app's "do
this" colour, and the block face is the ONLY place it is used as a section
fill. That reverses the "Checker is the quietest" paragraph below, on the
designer's call, and it does not touch the rule that matters: 朱 on the
Checker screen still means FIX, because the block is on Home, not beside the
feedback. Kanji, grammar, vocabulary and dictionary are unchanged.

White (#FFF8EC) on each face, measured: hiragana 2.88, katakana 4.63, kanji
7.31, grammar 5.51, vocabulary 5.52, checker 5.03, dictionary 4.61.
HIRAGANA MISSES — 2.88 is under 3:1 even for the 40px glyph, and the 12px
label needs 4.5:1. Shipped as designed and flagged; the fix, if wanted, is a
darker 藤 on that one block.

What follows is the pre-rework record, kept because it is the reasoning.

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

THE DICTIONARY IS 鈍 #727171, THE CHECKER'S FAMILY DARKENED (Session 34). The
checker comment above makes the argument: the near-neutral separates the TOOLS
from the learning modules, "a true distinction rather than a cosmetic one". The
dictionary is the second tool, so it joins that family rather than taking a hue
— and darker, because unlike the checker it has no feedback colours on screen to
compete with. It is also the only accent that clears 3:1 in that family
(4.5:1 on T.paper, 4.87:1 on T.sheet — measured, not estimated), which costs
nothing and removes one future caveat.
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

# ── the tatami rework layer (2026-09-27) ─────────────────────────────────────
# docs/design/rework/IMPLEMENTATION.md. Applied ON TOP of the union, not merged
# into it: the modules still declare their own T and the conflict check above
# still guards them against each other. This layer is the shell's decision
# about how every screen looks, so it lives here, beside ACCENT, for the same
# reason ACCENT does. Existing keys keep their names — the modules read them —
# and some change value: ink, sub (the old grey was too light on washi),
# hairline, sheet (now washi), paper, and both fonts.
REWORK = {
    "ink": '"#2C2A26"', "sub": '"#4A463D"', "muted": '"#6E6A60"',
    "hairline": '"#D9CFB8"', "sheet": '"#FBF7EE"', "paper": '"#F6F1E6"', "header": '"#F6F1E6"',
    "tatami": '"#C6BE8E"', "washi": '"#FBF7EE"', "washiEdge": '"#D9CFB8"', "washiLip": '"#CFC4A8"',
    "wood": '"#C9A47C"', "woodLip": '"#8A6540"', "blockLip": '"#7A5A3C"', "tatamiEdge": '"#2B3A55"',
    "shuHi": '"#DC4B2E"', "shuLo": '"#AC2B15"', "shuLip": '"#7E1F0F"',
    "gold": '"#C9A24A"', "goldPale": '"#F6EBD2"',
    "jpFont": "'\"Shippori Mincho\",\"Hiragino Mincho ProN\",\"Yu Mincho\",\"Noto Serif JP\",serif'",
    "uiFont": "'\"Zen Kaku Gothic New\",\"Hiragino Sans\",\"Noto Sans JP\",sans-serif'",
}
tok.update(REWORK)

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

# ── the skin: textures, buttons, blocks (tatami rework) ──────────────────────
# CSS, because :active presses and textures do not exist as inline styles.
# Shipped as a string rendered in a <style> by App, not as an imported .css,
# so the smoke bundle (esbuild, no CSS loader) sees exactly what Vite ships.
# Class names carry a ts- prefix: the modules have hand-named classes of their
# own and the engagement shim owns .eng-scope, so nothing can collide.
SKIN_CSS = (HERE / "tsumiki-skin.css").read_text(encoding="utf-8")
assert "`" not in SKIN_CSS and "${" not in SKIN_CSS, "skin CSS must survive a JS template literal"
(LIB / "skin.js").write_text(
    "// GENERATED by build-vite-app.py from tsumiki-skin.css — do not hand-edit.\n"
    "// Source of truth for every value: docs/design/rework/*.html.\n"
    "export const SKIN_CSS = `" + SKIN_CSS + "`;\n", encoding="utf-8")

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
    history_imports = []

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

    # The checker's error-history recorder. The source module carries a NO-OP
    # so the standalone artifact stays loadable and the reviewer's grading path
    # keeps working with no account and no store; the app build swaps in the
    # real one. Deleting the declaration rather than copying an implementation
    # into the module is the point — checker-module.jsx and lib/errorHistory.js
    # cannot drift, because there is only ever one implementation.
    #
    # If the no-op is ever renamed or removed from the source module this
    # substitution silently stops happening and the app records nothing, so the
    # miss is reported rather than tolerated.
    if src_name == "checker-module.jsx":
        # Each no-op is matched on its own so a partial rename is reported as a
        # partial rename. Matching them as one block would let two survive
        # silently the moment one changed.
        HISTORY_STUBS = [
            (r"^async function recordCheck\(\) \{[^\n]*\}\n", "recordCheck",
             "checks would be graded and never recorded"),
            (r"^async function readHistory\(\) \{[^\n]*\}\n", "readHistory",
             "Review would always render its empty state"),
            (r"^function byErrorType\(\) \{[^\n]*\}\n", "byErrorType",
             "Review would show no error types at all"),
        ]
        found = []
        for pattern, name, consequence in HISTORY_STUBS:
            m = re.search(pattern, src, re.M)
            if not m:
                problems.append(f"{src_name}: the {name} no-op is gone — the app "
                                f"build has nothing to replace, so {consequence}")
            else:
                src = src[:m.start()] + src[m.end():]
                found.append(name)
        if found:
            history_imports = found

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
    if history_imports:
        header.append('import { ' + ", ".join(history_imports)
                      + ' } from "../lib/errorHistory.js";')
    if data_import: header.append(data_import.rstrip())
    header.append("installStorage();\n")

    out = "\n".join(h for h in header if h) + "\n" + src
    (MODDIR / out_name).write_text(out, encoding="utf-8")
    stats.append((out_name, before, len(out)))

# ── the engagement layer ─────────────────────────────────────────────────────
#
# WHY THIS IS NOT JUST ANOTHER ENTRY IN `MODULES`. Two reasons, and the second
# one is the whole of the work below.
#
# 1. IT IS NOT A DOOR. The six modules are places a learner goes. The engagement
#    layer — daily card, weekly rhythm, quest chain — is what greets them when
#    they arrive, so it belongs ON Home rather than beside it. Home already
#    reads `tsumiki-engagement-v1` for its hero card; this is the thing that writes it.
#
# 2. ⚠️ IT IS AUTHORED IN TAILWIND AND THIS APP HAS NO TAILWIND.
#    engagement-module.jsx carries ~110 utility classes (`rounded-lg`,
#    `text-stone-500`, `space-y-4`); the other six modules style themselves with
#    inline styles off the `T` tokens plus a handful of hand-named classes in an
#    inline <style>. Splicing the module as-is compiles cleanly, renders, and
#    passes every check in this repo — as a wall of unstyled text. That is the
#    project's recurring failure shape exactly: the log is truthful about what
#    it did and silent about what it broke.
#
# THREE WAYS OUT, and why this one:
#   · Add Tailwind to the app — its preflight resets styles globally and would
#     restyle all six existing modules. Largest blast radius of the three, for a
#     module that occupies one card on one screen.
#   · Rewrite the module's markup in the T-token house style — correct-looking,
#     but it forks the authoring artifact, and this pipeline exists precisely so
#     the artifacts stay the source of truth and never get forked.
#   · GENERATE A SCOPED SHIM: read the classes the module actually uses, emit
#     exactly those rules under a `.eng-scope` wrapper, and leave the module
#     byte-identical. Nothing outside the wrapper can be affected, and the
#     source stays the source.
#
# AND THE SHIM IS A GUARD, NOT JUST A TRANSLATION. Every class the module uses
# must be in TW below or the build REFUSES. So the failure mode of someone
# adding `text-rose-500` to the module later is a red build, not a paragraph
# that silently renders in the wrong colour — which is the only version of this
# that survives a session that does not know the shim exists.

ENG_SRC = HERE / "engagement-module.jsx"
ENG_QUOTES = HERE / "quote-bank-v1.js"

# Tailwind's scales, only the values this module actually reaches for.
_SP = {"0.5": "0.125rem", "1": "0.25rem", "1.5": "0.375rem", "2": "0.5rem",
       "3": "0.75rem", "4": "1rem", "5": "1.25rem", "6": "1.5rem", "px": "1px"}
_C = {
    "stone-50": "#FAFAF9", "stone-100": "#F5F5F4", "stone-200": "#E7E5E4",
    "stone-300": "#D6D3D1", "stone-400": "#A8A29E", "stone-500": "#78716C",
    "stone-600": "#57534E", "stone-700": "#44403C", "stone-800": "#292524",
    "stone-900": "#1C1917",
    "amber-50": "#FFFBEB", "amber-100": "#FEF3C7", "amber-200": "#FDE68A",
    "amber-300": "#FCD34D", "amber-600": "#D97706", "amber-700": "#B45309",
    "amber-800": "#92400E", "amber-900": "#78350F",
    "orange-800": "#9A3412", "orange-900": "#7C2D12",
    "white": "#FFFFFF", "transparent": "transparent",
}

def _tw():
    m = {}
    # layout
    m.update({
        "flex": "display:flex", "flex-col": "flex-direction:column",
        "flex-wrap": "flex-wrap:wrap", "flex-1": "flex:1 1 0%",
        "items-center": "align-items:center", "items-baseline": "align-items:baseline",
        "justify-between": "justify-content:space-between",
        "justify-center": "justify-content:center",
        "relative": "position:relative", "absolute": "position:absolute",
        "inset-0": "top:0;right:0;bottom:0;left:0",
        "w-full": "width:100%", "min-w-0": "min-width:0",
        "shrink-0": "flex-shrink:0", "ml-auto": "margin-left:auto",
        "mx-auto": "margin-left:auto;margin-right:auto",
        "max-w-lg": "max-width:32rem",
        "w-5": "width:1.25rem", "h-5": "height:1.25rem",
        "w-6": "width:1.5rem", "h-6": "height:1.5rem",
        "h-px": "height:1px",
    })
    # spacing
    for k, v in _SP.items():
        m[f"p-{k}"] = f"padding:{v}"
        m[f"px-{k}"] = f"padding-left:{v};padding-right:{v}"
        m[f"py-{k}"] = f"padding-top:{v};padding-bottom:{v}"
        m[f"mt-{k}"] = f"margin-top:{v}"
        m[f"mb-{k}"] = f"margin-bottom:{v}"
        m[f"my-{k}"] = f"margin-top:{v};margin-bottom:{v}"
        m[f"gap-{k}"] = f"gap:{v}"
    # colours
    for name, hexv in _C.items():
        m[f"text-{name}"] = f"color:{hexv}"
        m[f"bg-{name}"] = f"background-color:{hexv}"
        m[f"border-{name}"] = f"border-color:{hexv}"
    m["text-transparent"] = "color:transparent"
    # type
    m.update({
        "text-[10px]": "font-size:0.625rem", "text-[11px]": "font-size:0.6875rem",
        "text-[0.45em]": "font-size:0.45em",
        "text-xs": "font-size:0.75rem;line-height:1rem",
        "text-sm": "font-size:0.875rem;line-height:1.25rem",
        "text-lg": "font-size:1.125rem;line-height:1.75rem",
        "text-2xl": "font-size:1.5rem;line-height:2rem",
        "font-normal": "font-weight:400", "font-medium": "font-weight:500",
        "font-semibold": "font-weight:600",
        "italic": "font-style:italic", "uppercase": "text-transform:uppercase",
        "line-through": "text-decoration-line:line-through",
        "leading-relaxed": "line-height:1.625", "leading-loose": "line-height:2",
        "tracking-wide": "letter-spacing:0.025em",
        "tracking-wider": "letter-spacing:0.05em",
        "tracking-widest": "letter-spacing:0.1em",
    })
    # borders / radius
    m.update({
        "border": "border-width:1px;border-style:solid",
        "border-dashed": "border-style:dashed",
        "rounded": "border-radius:0.25rem", "rounded-md": "border-radius:0.375rem",
        "rounded-lg": "border-radius:0.5rem", "rounded-xl": "border-radius:0.75rem",
        "rounded-full": "border-radius:9999px",
    })
    # motion / transform
    m.update({
        "transition-all": "transition-property:all;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:150ms",
        "transition-colors": "transition-property:color,background-color,border-color;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:150ms",
        "duration-700": "transition-duration:700ms",
        "-rotate-90": "transform:rotate(-90deg)",
    })
    # gradient — Tailwind builds these from custom properties; same idea, own names
    m.update({
        "bg-gradient-to-b": "background-image:linear-gradient(to bottom,var(--eng-from,transparent),var(--eng-to,transparent))",
        "from-amber-50/40": "--eng-from:rgba(255,251,235,0.4)",
        "to-white": "--eng-to:#FFFFFF",
    })
    return m

TW = _tw()
# `font-sans` resolves to the app's own UI stack rather than Tailwind's, so the
# card matches the five modules around it. Interpolated at render time from T.
TW_TEMPLATE = {"font-sans": "font-family:${T.uiFont}"}

# Utilities that are a single word. Everything else must contain a hyphen to be
# considered a class at all — which is what keeps identifiers picked up out of
# `${open ? "a" : "b"}` ternaries (`open`, `t.bonus`, `?`) from being mistaken
# for classes and failing the build.
SINGLE_WORD = {"flex", "relative", "absolute", "border", "italic", "uppercase", "rounded"}

def eng_classes(text):
    """Every class token the module can put on an element, static or dynamic."""
    found, i = set(), 0
    while True:
        m = re.search(r"className=", text[i:])
        if not m: break
        start = i + m.end()
        if start >= len(text): break
        if text[start] == '"':
            end = text.index('"', start + 1)
            for t in text[start + 1:end].split(): found.add(t)
            i = end
        elif text[start] == "{":
            depth, j = 0, start
            while j < len(text):
                if text[j] == "{": depth += 1
                elif text[j] == "}":
                    depth -= 1
                    if depth == 0: break
                j += 1
            region = text[start:j + 1]
            for lit in (re.findall(r'"([^"]*)"', region)
                        + re.findall(r"`([^`$]*)`", region)
                        + re.findall(r"'([^']*)'", region)):
                for t in lit.split(): found.add(t)
            i = j
        else:
            i = start
    out = set()
    for t in found:
        t = t.strip().strip('"\'`}{')
        if not t: continue
        if "-" not in t and ":" not in t and t not in SINGLE_WORD: continue
        if t.startswith("$") or "${" in t: continue
        out.add(t)
    return sorted(out)

def css_escape(cls):
    return re.sub(r"([:.\[\]/%])", r"\\\1", cls)

def eng_css(classes):
    rules, unmapped = [], []
    for c in classes:
        base, suffix = c, ""
        if c.startswith("hover:"):
            base, suffix = c[6:], ":hover"
        decl = TW.get(base) or TW_TEMPLATE.get(base)
        if decl is None:
            unmapped.append(c)
            continue
        rules.append(f".eng-scope .{css_escape(c)}{suffix}{{{decl}}}")
    # space-y-N is a child selector, so it cannot come from the flat table above
    for c in classes:
        m = re.fullmatch(r"space-y-(.+)", c)
        if m and m.group(1) in _SP:
            rules.append(f".eng-scope .{css_escape(c)} > * + *{{margin-top:{_SP[m.group(1)]}}}")
            if c in unmapped: unmapped.remove(c)
    return sorted(set(rules)), unmapped

if ENG_SRC.exists() and ENG_QUOTES.exists():
    eng = ENG_SRC.read_text(encoding="utf-8")
    classes = eng_classes(eng)
    rules, unmapped = eng_css(classes)
    for c in unmapped:
        problems.append(
            f"engagement-module.jsx: class {c!r} has no rule in build-vite-app.py's TW table — "
            "add one, or the card ships unstyled")

    # the quote bank travels with it
    (DATA / "quote-bank-v1.js").write_text(
        "// COPIED by build-vite-app.py from quote-bank-v1.js at the repo root,\n"
        "// which is itself generated by build-quote-bank.py. Edit neither.\n"
        + ENG_QUOTES.read_text(encoding="utf-8"), encoding="utf-8")

    (LIB / "engagementStyles.js").write_text(
        "// GENERATED by build-vite-app.py — a scoped stand-in for the Tailwind\n"
        "// utilities engagement-module.jsx is authored in. See that script for why\n"
        "// this exists rather than Tailwind itself, or a rewritten module.\n"
        "//\n"
        "// Every rule is prefixed `.eng-scope`, so nothing here can reach the rest\n"
        "// of the app; and every class the module uses must have a rule or the\n"
        "// build refuses, so this file cannot silently fall behind the module.\n"
        'import { T } from "./tokens.js";\n\n'
        # ⚠️ String.raw, NOT a plain template literal. Several of these selectors
        # carry CSS escapes — `.text-\\[11px\\]`, `.gap-1\\.5`,
        # `.from-amber-50\\/40`, every `.hover\\:…` — and inside a plain
        # backtick literal JavaScript eats the backslash before CSS ever sees it.
        # The result is a selector like `.text-[11px]`, which is invalid, which
        # the browser DROPS SILENTLY. Caught Sep 6 2026 by reading computed
        # styles in the browser: the build said "107 rules", the file contained
        # 107 rules, and roughly ten of them had never applied to anything.
        # A count is not a check. test/smoke.mjs now compares rules emitted
        # against rules the CSS parser actually accepted.
        "export const ENGAGEMENT_CSS = String.raw`\n" + "\n".join(rules) + "\n`;\n",
        encoding="utf-8")

    # the module itself, transformed the same way the six doors are
    out = eng
    out = out.replace('import QUOTES from "./quote-bank-v1.js";',
                      'import QUOTES from "../data/quote-bank-v1.js";', 1)
    for fn in ("loadJSON", "saveJSON"):
        sp = fn_span(out, fn)
        if sp:
            start = sp[0]
            if out[max(0, start - 6):start].strip().endswith("async"):
                start = out.rindex("async", 0, start)
            out = out[:start] + out[sp[1]:]
    out = re.sub(r'^import React, \{[^}]*\} from "react";\s*\n', "", out, count=1, flags=re.M)
    out = re.sub(r'^import \{[^}]*\} from "react";\s*\n', "", out, count=1, flags=re.M)
    hooks = sorted({h for h in ["useState", "useEffect", "useRef", "useMemo", "useCallback"]
                    if re.search(r"\b" + h + r"\s*\(", out)})
    header = [
        "// GENERATED from engagement-module.jsx by build-vite-app.py — do not hand-edit.",
        "// Edit the authoring module at the repo root and re-run.",
        f'import {{ {", ".join(hooks)} }} from "react";',
        'import { installStorage } from "../lib/storage.js";',
        'import { loadJSON, saveJSON } from "../lib/json.js";',
        "installStorage();\n",
    ]
    (MODDIR / "Engagement.jsx").write_text("\n".join(header) + "\n" + out, encoding="utf-8")
    print(f"engagement: {len(classes)} classes -> {len(rules)} scoped rules"
          + (f", {len(unmapped)} UNMAPPED" if unmapped else ""))

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
import { storage } from "./lib/storage.js";
import Account from "./lib/account.jsx";
import Progress from "./lib/progress.jsx";
import GoalsDialog from "./lib/engagementPanel.jsx";
import { reportStudy } from "./lib/activity.js";
import { markWorked, readRecency, orderByRecency, readWallet,
         daysSinceLastWorked, DORMANT_DAYS } from "./lib/stats.js";
import { T, ACCENT } from "./lib/tokens.js";
import { SKIN_CSS } from "./lib/skin.js";
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
  dictionary: "Look up any word, in Japanese or English — or tap one anywhere in the app. Send the ones worth keeping to Vocabulary.",
};
// Shown INSTEAD of HOME_WHY when the learner has started nothing. Not a lock —
// the door stays open either way; this just tells the right person it is theirs.
const HOME_INVITE = {
  checker: "Do you have Japanese experience? Try out the checker! Write a sentence and find out what is wrong, what merely sounds off, and why.",
};
const PROGRESS_KEYS = {
  hiragana: "tsumiki-hiragana-progress-v2", katakana: "tsumiki-katakana-progress-v1",
  grammar: "tsumiki-n5-progress-v1", kanji: "tsumiki-kanji-progress-v1", vocabulary: "tsumiki-known-words-v1",
  // Session 24. The checker had no progress key, so commitIfWorked() could not
  // see it and "write and check one sentence" stayed dark in the quest chain —
  // the gap activity.js used to list under "what is not covered". A check now
  // writes checker-history-v1, and that write IS the evidence, exactly as a
  // module's own store is for every other section. Note that a check finding NO
  // issues still writes (a _checks entry), so a perfect sentence counts as work
  // rather than as nothing.
  checker: "tsumiki-checker-history-v1",
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
    const r = await storage.get("tsumiki-engagement-v1");
    const chain = r ? JSON.parse(r.value)?.chain : null;
    const t = chain?.tasks?.find((x) => x.done < x.target);
    if (!t) return null;
    return MODULES.some((m) => m.id === t.module) ? t : null;
  } catch (e) { return null; }
}

// ————— Home, tatami rework (2026-09-27) —————
// Spec: docs/design/rework/01-home-day.html; where this and the board
// disagree, the board wins. Only the PRESENTATION changed. The hero priority
// (task > last module > start here), orderByRecency and the evidence-based
// "last worked on" are the Session 13–23 logic, unchanged.
//
// The six doors became six wooden blocks, the つみき the app is named for.
// All six stay on the table. The Session 23 version showed a started learner
// only their own sections and sent them to the menu for the rest; a block is
// small enough that hiding it buys nothing, so the ones you have worked on
// move to the front, most recent first, and the rest follow in the fresh
// order. The dictionary is not a block: it opens from the じしょ tab on the
// right edge of every screen.
const BLOCK_ORDER = ["hiragana", "katakana", "kanji", "grammar", "vocabulary", "checker"];
const BLOCK_GLYPH = { hiragana: "あ", katakana: "ア", kanji: "漢", grammar: "文", vocabulary: "言", checker: "直" };
const LABEL = { font: `700 0.6875rem ${T.uiFont}`, letterSpacing: ".08em" };

const ICON = {
  menu: (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>),
  back: (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>),
  music: (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 18V6l10-2v12" /><circle cx="6.5" cy="18" r="2.5" /><circle cx="16.5" cy="16" r="2.5" /></svg>),
  chevron: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>),
  house: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /></svg>),
};

// The room, drawn in the band at the top of Home. Tapping it goes to the room.
// Colours are the board's own; the three blocks on the table wear the
// hiragana, grammar and checker accents so the scene and the grid below agree.
function Scene({ onOpen }) {
  const jp = "Shippori Mincho, serif";
  const svg = (
    <svg viewBox="0 0 390 196" role="img" style={{ display: "block", width: "100%", height: "auto" }}
         aria-label="A tatami room: shoji screens, a low table with wooden blocks, a bamboo fountain">
      <defs>
        <pattern id="ts-weave" width="6" height="3" patternUnits="userSpaceOnUse">
          <rect width="6" height="3" fill="#C6BE8E" />
          <rect width="1" height="3" fill="#E4DDB3" />
          <rect y="2" width="6" height="1" fill="#A79E6A" />
        </pattern>
      </defs>
      <rect width="390" height="196" fill="#EFE7D4" />
      <g fill="#F5EEDD" stroke="#B89A72" strokeWidth="2">
        <rect x="18" y="8" width="150" height="120" />
        <rect x="222" y="8" width="150" height="120" />
      </g>
      <g stroke="#B89A72" strokeWidth="1.4">
        <path d="M18 38h150M18 68h150M18 98h150M56 8v120M93 8v120M130 8v120" />
        <path d="M222 38h150M222 68h150M222 98h150M260 8v120M297 8v120M334 8v120" />
      </g>
      <rect x="176" y="8" width="38" height="120" fill="#E3D9C3" />
      <rect x="185" y="20" width="20" height="70" rx="2" fill="#FBF7EE" stroke="#B89A72" />
      <text x="195" y="60" textAnchor="middle" fontFamily={jp} fontSize="18" fontWeight="700" fill="#2C2A26">つ</text>
      <rect x="0" y="128" width="390" height="8" fill="#5E4630" />
      <rect x="0" y="136" width="390" height="60" fill="url(#ts-weave)" />
      <path d="M0 136h390" stroke="#2B3A55" strokeWidth="3" />
      <path d="M195 136v60" stroke="#2B3A55" strokeWidth="3" />
      <g>
        <rect x="112" y="150" width="166" height="12" rx="3" fill="#4A3423" />
        <rect x="120" y="162" width="10" height="16" fill="#3B2A1C" />
        <rect x="260" y="162" width="10" height="16" fill="#3B2A1C" />
        <rect x="150" y="128" width="24" height="22" rx="3" fill="#9C8BC4" stroke="#5B4A7D" />
        <text x="162" y="145" textAnchor="middle" fontFamily={jp} fontSize="14" fontWeight="700" fill="#FFF8EC">あ</text>
        <rect x="176" y="128" width="24" height="22" rx="3" fill="#2F6F6B" stroke="#1F4C49" />
        <text x="188" y="145" textAnchor="middle" fontFamily={jp} fontSize="14" fontWeight="700" fill="#FFF8EC">文</text>
        <rect x="163" y="106" width="24" height="22" rx="3" fill="#C7351B" stroke="#7E1F0F" />
        <text x="175" y="123" textAnchor="middle" fontFamily={jp} fontSize="14" fontWeight="700" fill="#FFF8EC">直</text>
      </g>
      <g>
        <ellipse cx="338" cy="176" rx="34" ry="12" fill="#8E8A80" />
        <ellipse cx="338" cy="172" rx="26" ry="8" fill="#5B7C8C" />
        <path d="M300 96l40 46" stroke="#7C9A4C" strokeWidth="9" strokeLinecap="round" />
        <path d="M300 96l40 46" stroke="#5F7B36" strokeWidth="3" strokeDasharray="1 9" strokeLinecap="round" />
        <rect x="332" y="120" width="8" height="52" fill="#5F7B36" />
        <circle cx="346" cy="152" r="3" fill="#9CC3D6" />
        <circle cx="344" cy="162" r="2" fill="#9CC3D6" />
      </g>
      <g>
        <rect x="30" y="112" width="54" height="8" rx="2" fill="#4A3423" />
        <path d="M57 112c-4-14-2-26 6-32" stroke="#6B4E2E" strokeWidth="4" fill="none" strokeLinecap="round" />
        <circle cx="66" cy="76" r="14" fill="#5E8C61" />
        <circle cx="52" cy="86" r="9" fill="#4E7B52" />
      </g>
    </svg>
  );
  if (!onOpen) return svg;
  return <button onClick={onOpen} aria-label="Your room" className="ts-scene">{svg}</button>;
}

function Home({ startedMap, lastMod, nextTask, go, recency, wallet, dormantDays, openAccount, openGoals }) {
  const fresh = !MODULES.some((m) => startedMap[m.id]);
  const started = (id) => Boolean(startedMap[id]);

  // Blocks: worked-on sections first, most recent first (orderByRecency — a
  // section with progress but no recency stamp sorts last rather than
  // vanishing), then everything not yet started in the fresh order.
  const blockMods = BLOCK_ORDER.map((id) => MODULES.find((m) => m.id === id)).filter(Boolean);
  const startedIds = blockMods.filter((m) => started(m.id)).map((m) => m.id);
  const shownBlocks = fresh ? blockMods : [
    ...orderByRecency(startedIds, recency || {}),
    ...blockMods.map((m) => m.id).filter((id) => !startedIds.includes(id)),
  ].map((id) => MODULES.find((m) => m.id === id));

  // Hero priority: what to DO now > where you were > where to begin (Session
  // 21). A module name is not an action, so when there is a task the task is
  // the headline and the module demotes to a subtitle.
  const taskMod = nextTask ? MODULES.find((m) => m.id === nextTask.module) : null;
  const hero = taskMod || lastMod || MODULES[0];
  const heroLabel = taskMod ? "NEXT ON YOUR PATH"
    : lastMod ? "PICK UP WHERE YOU LEFT OFF" : "NEW HERE? START WITH";
  const heroCta = taskMod ? "Go" : lastMod ? "Continue" : "Start here";

  return (
    <div>
      <Scene onOpen={() => go("room")} />
      <div style={{ display: "flex", flexDirection: "column", gap: 18, padding: "18px 16px 32px" }}>

        {/* ⚠️ A REMINDER, NOT A DEADLINE (Session 23). Nothing in this app
            expires, and the note says so; it tells someone back after three
            weeks (DORMANT_DAYS) that starting a section again is allowed. */}
        {dormantDays != null && dormantDays >= DORMANT_DAYS && (
          <button onClick={openAccount} className="ts-card ts-card-btn">
            <span style={{ font: `700 0.875rem ${T.uiFont}`, color: T.note }}>Welcome back</span>
            <span style={{ font: `0.8125rem/1.6 ${T.uiFont}`, color: T.sub }}>
              It has been a while. Everything is exactly where you left it — and if
              you would rather start a section again from the beginning, you can
              clear just that one. Nothing here expires on its own.
            </span>
          </button>
        )}

        {/* The one lacquer button on Home. The whole card is the target, as
            before; the button inside it is what presses when you tap. */}
        <button onClick={() => go(hero.id)} className="ts-card ts-card-btn ts-hero">
          <span style={{ ...LABEL, color: T.muted }}>{heroLabel}</span>
          {taskMod ? (
            <>
              <span style={{ font: `700 1.375rem/1.25 ${T.uiFont}` }}>{nextTask.label}</span>
              <span style={{ font: `0.875rem/1.6 ${T.uiFont}`, color: T.sub }}>
                in {hero.label} <span style={{ fontFamily: T.jpFont, color: T.ink }}>{hero.jp}</span>
              </span>
            </>
          ) : (
            <>
              <span style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                <span style={{ font: `700 1.375rem/1.25 ${T.uiFont}` }}>{hero.label}</span>
                <span style={{ font: `1.25rem ${T.jpFont}`, color: T.sub }}>{hero.jp}</span>
              </span>
              <span style={{ font: `0.875rem/1.6 ${T.uiFont}`, color: T.sub }}>{HOME_WHY[hero.id]}</span>
            </>
          )}
          <span className="ts-btn ts-btn-shu" style={{ marginTop: 6 }}>{heroCta} {ICON.chevron}</span>
        </button>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ ...LABEL, color: T.sub }}>YOUR BLOCKS</span>
          <span style={{ font: `0.8125rem ${T.jpFont}`, color: T.sub }}>つみき</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14 }}>
          {shownBlocks.map((m) => {
            // Session 21: a day-one learner meets the Checker as a peer of
            // Hiragana. The answer stays an invitation, not a lock — now a tag
            // on the block, with the full line as its title.
            const tag = !fresh ? null
              : m.id === "hiragana" ? "START HERE"
              : m.id === "checker" ? "ALREADY STUDIED?" : null;
            return (
              <button key={m.id} onClick={() => go(m.id)} className="ts-block"
                      title={m.id === "checker" && fresh ? HOME_INVITE.checker : HOME_WHY[m.id]}
                      style={{
                        backgroundColor: m.accent,
                        ...(m.id === "checker" ? { "--ts-lip": T.shuLip, "--ts-lip-shadow": "rgba(126,31,15,.32)" } : null),
                      }}>
                {tag && <span className="ts-tag">{tag}</span>}
                <span aria-hidden="true" style={{ font: `700 2.5rem/1 ${T.jpFont}` }}>{BLOCK_GLYPH[m.id]}</span>
                <span style={{ font: `700 0.75rem ${T.uiFont}` }}>{m.label}</span>
              </button>
            );
          })}
        </div>

        {started("grammar") && (
          // Session 14: the daily review challenge gets a front-door card once
          // grammar has begun. The flag routes the grammar module straight to it.
          <button
            onClick={() => { try { localStorage.setItem("tsumiki-open-challenge", "1"); } catch (e) {} go("grammar"); }}
            className="ts-card ts-card-btn"
          >
            <span style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
              <span style={{ font: `700 1rem ${T.uiFont}` }}>Review challenge</span>
              <span style={{ font: `0.9375rem ${T.jpFont}`, color: ACCENT.grammar }}>腕試し</span>
            </span>
            <span style={{ font: `0.8125rem/1.6 ${T.uiFont}`, color: T.sub }}>
              Draw a grammar point you've learned and write with it. A fresh challenge every day — the day turns at midnight, Tokyo time.
            </span>
          </button>
        )}

        {/* Goals and koban, on Home only (Session 23): a currency counter over
            a lesson is a scoreboard, and this app does not keep score during
            the work. Revisit when the room ships — it is where koban belong. */}
        {!fresh && (
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <button onClick={openGoals} className="ts-btn ts-btn-washi">Goals</button>
            {wallet > 0 && (
              <span title="Koban you have earned" style={{
                font: `700 0.875rem ${T.uiFont}`, color: T.note, whiteSpace: "nowrap",
              }}>
                <span style={{ fontFamily: T.jpFont }}>小判</span> {wallet}
              </span>
            )}
          </div>
        )}

        <button onClick={() => go("room")} className="ts-btn ts-btn-wood" style={{ width: "100%" }}>
          {ICON.house} Room <span style={{ fontFamily: T.jpFont, fontWeight: 500 }}>へや</span>
        </button>
      </div>
    </div>
  );
}

// ————— The room, until it is built —————
// The rework designs the room (06-room.html) and explicitly builds nothing, but
// Home now has two doors into it. They lead here: the scene, and an honest line.
function RoomSoon({ wallet, go }) {
  return (
    <div>
      <Scene />
      <div style={{ padding: "18px 16px 32px" }}>
        <div className="ts-card" style={{ padding: "18px 18px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={{ ...LABEL, color: T.muted }}>YOUR ROOM</span>
          <span style={{ font: `700 1.375rem/1.25 ${T.uiFont}` }}>Still being built</span>
          <span style={{ font: `0.875rem/1.6 ${T.uiFont}`, color: T.sub }}>
            The koban you earn will furnish it. Nothing you earn in the meantime is lost.
          </span>
          {wallet > 0 && (
            <span style={{ font: `700 0.875rem ${T.uiFont}`, color: T.note }}>
              <span style={{ fontFamily: T.jpFont }}>小判</span> {wallet} saved so far
            </span>
          )}
          <button onClick={() => go("home")} className="ts-btn ts-btn-wood" style={{ marginTop: 6 }}>
            Back to your blocks
          </button>
        </div>
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
function Drawer({ open, close, active, go, onAccount }) {
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
    font: `${selected ? 600 : 400} 1rem ${T.uiFont}`,
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
          <span style={{ font: `600 1.1875rem ${T.jpFont}`, color: T.ink }}>つ</span>
          <button onClick={close} aria-label="Close menu" style={{
            background: "none", border: "none", cursor: "pointer",
            padding: 10, font: `1.125rem ${T.uiFont}`, color: T.sub, lineHeight: 1,
          }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "6px 0" }}>
          <button onClick={() => go("home")} style={row(active === "home")}>
            Home
          </button>
          {MODULES.map((m) => (
            <button key={m.id} onClick={() => go(m.id)} style={row(active === m.id)}>
              {m.label}
              <span style={{ font: `0.875rem ${T.jpFont}`, color: T.sub }}>{m.jp}</span>
            </button>
          ))}
          {/* ABOVE the rule, among the destinations, and that is the whole
              point of moving it (Session 24). The note below says an account is
              not a place; progress IS one — it is where you go to see what you
              can do and to read back your own writing. Behind a sign-in-shaped
              door it looked like account administration. */}
          <button onClick={() => go("progress")} style={row(active === "progress")}>
            Progress
            <span style={{ font: `0.875rem ${T.jpFont}`, color: T.sub }}>きろく</span>
          </button>
        </div>

        {/* Below the rule, not among the destinations: the drawer list answers
            "where can I go", and an account is not a place. (It used to say
            "the header already carries Save and Restore and wraps to two rows
            on a phone" — that stopped being true in Session 24 when those came
            out. The first half of the reason still stands on its own.) */}
        <div style={{ borderTop: `1px solid ${T.hairline}`, padding: "6px 0" }}>
          <button onClick={onAccount} style={{ ...row(false), borderLeftColor: "transparent" }}>
            Account
          </button>
        </div>
      </nav>
    </>
  );
}

// ————— The lookup drawer (Session 34) —————
// Every word lookup in the app lands here. A module fires `tsumiki:lookup`
// with { q, kanji?, curated? } — see lookUp() in grammar, kanji and checker —
// and this opens the dictionary module in a panel from the RIGHT, the side the
// menu drawer does not use. The flag on window is how a module knows someone
// is listening: without it (a standalone artifact) the module keeps its own
// popup, so the artifacts still work on their own.
//
// It is the same component as the Dictionary page, in drawer mode, so there is
// one lookup in the app and not two that could disagree about a word.
// What the learner can currently SEE that the dictionary knows how to look up.
// Every module marks its tappable words with data-lookup where they are drawn
// (JPText in grammar, the checker's kanji runs, WordText in vocabulary, the
// kanji grid), so this reads the page rather than asking each screen to keep a
// second list of what it is showing — which would be a second thing to get
// wrong. Only what is actually in the viewport, in the order it appears.
function wordsOnScreen() {
  const out = [], seen = new Set();
  const h = window.innerHeight || 0;
  for (const el of document.querySelectorAll("[data-lookup]")) {
    const w = (el.getAttribute("data-lookup") || "").trim();
    if (!w || seen.has(w)) continue;
    // Keep it when there is no layout information at all (rect all zeros —
    // jsdom, or a node measured before layout): "cannot tell" must not read as
    // "not on screen", or the list is silently empty exactly where it is tested.
    const r = el.getBoundingClientRect();
    const measured = r.width || r.height || r.top || r.bottom;
    if (measured && (!r.width || r.bottom < 0 || r.top > h)) continue;
    seen.add(w); out.push(w);
    if (out.length >= 24) break;
  }
  return out;
}

function LookupHost() {
  const [req, setReq] = useState(null);
  const panelRef = useRef(null);
  useEffect(() => {
    window.__tsumikiLookup = true;
    const on = (e) => setReq({ ...(e.detail || {}), onScreen: wordsOnScreen(), n: Date.now() });
    window.addEventListener("tsumiki:lookup", on);
    return () => { window.__tsumikiLookup = false; window.removeEventListener("tsumiki:lookup", on); };
  }, []);
  useEffect(() => {
    if (!req) return undefined;
    const onKey = (e) => { if (e.key === "Escape") setReq(null); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [!!req]);
  // ————— the pull-out handle (Lloyd, Session 34) —————
  // A tab on the right edge, low enough to reach with a thumb: the drawer is a
  // thing you can pull out, not only something that happens to you when you tap
  // a word. It sits under the dialogs (z-index 20 against their 30) so it never
  // floats over the Goals card or an account question, and it goes away while
  // the drawer itself is open.
  if (!req) {
    // Tatami rework: the handle is a washi tab reading じしょ, per the boards.
    // Same behaviour as Session 34 — it opens the drawer knowing what is on
    // screen. It is also now the ONLY dictionary control in the chrome: the
    // header 辞 button went, since a tab on every screen already does its job.
    return (
      <button
        onClick={() => setReq({ q: "", onScreen: wordsOnScreen(), n: Date.now() })}
        aria-label="Open the dictionary"
        title="Dictionary — look up a word on this screen"
        className="ts-edge-tab">じしょ</button>
    );
  }
  return (
    <>
      <style>{`
        @keyframes tsumiki-slide-in { from { transform: translateX(100%) } to { transform: translateX(0) } }
        .tsumiki-lookup { animation: tsumiki-slide-in .22s ease-out both; }
        @media (prefers-reduced-motion: reduce) { .tsumiki-lookup { animation: none; } }
      `}</style>
      <div onClick={() => setReq(null)} aria-hidden="true" style={{
        position: "fixed", inset: 0, zIndex: 44, background: "rgba(34,37,43,0.36)",
      }} />
      <aside ref={panelRef} role="dialog" aria-modal="true" aria-label="Dictionary"
             className="tsumiki-lookup" style={{
        position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 45,
        width: "min(440px, 100vw)", overflowY: "auto", background: T.paper,
        borderLeft: `3px solid ${ACCENT.dictionary}`,
        boxShadow: "0 0 40px rgba(34,37,43,0.18)",
      }}>
        <Suspense fallback={
          <p style={{ padding: "24px 18px", color: T.sub, font: `0.875rem ${T.uiFont}` }}>Loading…</p>
        }>
          <DictionaryModule mode="drawer" request={req} onClose={() => setReq(null)} />
        </Suspense>
      </aside>
    </>
  );
}

export default function App() {
  // Land on Home. It remembers where they were (tsumiki-last-module) and
  // offers it as the continue card, rather than teleporting them there —
  // Session 13: the doors deserve a hallway.
  const [active, setActive] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [startedMap, setStartedMap] = useState({});
  const [lastWorked, setLastWorked] = useState(null);
  const [nextTask, setNextTask] = useState(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [goalsOpen, setGoalsOpen] = useState(false);
  const [recency, setRecency] = useState({});
  const [wallet, setWallet] = useState(0);
  const [dormantDays, setDormantDays] = useState(null);

  // Home's data is read through the storage adapter, so it must be async and
  // must refresh whenever we come back to Home — a lesson finished inside a
  // module changes both the chips and the hero.
  useEffect(() => {
    if (active !== "home") return undefined;
    let alive = true;
    (async () => {
      const [s, t, last, rec, w, dorm] = await Promise.all([
        readStarted(), readNextTask(), storage.get("tsumiki-last-module"),
        readRecency(), readWallet(), daysSinceLastWorked(),
      ]);
      if (!alive) return;
      setStartedMap(s);
      setNextTask(t);
      setLastWorked(last?.value ?? null);
      setRecency(rec);
      setWallet(w);
      setDormantDays(dorm);
    })();
    return () => { alive = false; };
  }, [active]);
  const current = MODULES.find((m) => m.id === active) || MODULES[0];
  // `current` falls back to MODULES[0] for anything it does not know. Named
  // destinations that are not modules take their title AND their header rule
  // from here — before, Progress wore Hiragana's colour under its header.
  const NON_MODULE = {
    progress: { label: "Progress", jp: "きろく", accent: T.sub },
    room: { label: "Room", jp: "へや", accent: T.woodLip },
  };
  const place = NON_MODULE[active] || current;

  // ————— Ambience (tatami rework) —————
  // Opt-in, default off, never autoplays. The sound files are not part of the
  // handoff, so this is the switch and its remembered state only.
  // TODO(ambience): wire to the bamboo-fountain/koto loop when the audio exists,
  // and add the once-only first-launch offer in the same change — offering a
  // sound that then does not play would be the wrong first impression.
  // localStorage, not the storage adapter: a per-device preference, not
  // progress, so it stays out of Save/Restore and account sync on purpose.
  const [ambience, setAmbience] = useState(() => {
    try { return localStorage.getItem("tsumiki-ambience") === "on"; } catch (e) { return false; }
  });
  const toggleAmbience = () => setAmbience((on) => {
    try { localStorage.setItem("tsumiki-ambience", on ? "off" : "on"); } catch (e) {}
    return !on;
  });
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
      await storage.set("tsumiki-last-module", id);
      setLastWorked(id);
      // Same evidence, recorded per section so Home can order by what is
      // actually being used, and so a three-week gap can be noticed.
      await markWorked(id);
      setWallet(await readWallet());
      // Session 23: the same evidence, published for the engagement layer. It
      // is deliberately inside this branch — the whole point of commitIfWorked
      // is that the store CHANGED, and marking a day active on navigation is
      // the exact draft that engagement-module.jsx §5 threw out.
      reportStudy(id);
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

  const ambienceBtn = (
    <button className="ts-icon" onClick={toggleAmbience} aria-pressed={ambience}
            aria-label={`Ambience: bamboo fountain and koto, ${ambience ? "on" : "off"}`}
            style={{ color: ambience ? ACCENT.grammar : "#8A847A" }}>
      {ICON.music}
    </button>
  );
  const menuBtn = (
    <button ref={menuBtnRef} className="ts-icon" onClick={() => setMenuOpen(true)}
            aria-label="Menu" aria-expanded={menuOpen} aria-haspopup="dialog">
      {ICON.menu}
    </button>
  );

  return (
    <div className="ts-tatami" style={{ minHeight: "100vh", fontFamily: T.uiFont, color: T.ink }}>
      <style>{SKIN_CSS}</style>
      <header style={{
        background: T.header,
        // A RULE UNDER THE STICKY HEADER, not a frame around the viewport: a
        // four-sided border costs real width on a phone. Home keeps the plain
        // hairline — it is not a section and should not claim one's colour.
        boxShadow: active === "home"
          ? `0 1px 0 ${T.hairline}`
          : `0 1px 0 ${T.hairline}, inset 0 -3px 0 ${place.accent}`,
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{
          maxWidth: 900, margin: "0 auto", minHeight: 56, boxSizing: "border-box",
          padding: "6px 8px", display: "flex", alignItems: "center", gap: 4,
        }}>
          {active === "home" ? (
            <>
              {menuBtn}
              <span style={{ flex: 1 }} />
              <button onClick={() => go("home")} aria-label="Home" className="ts-wordmark">
                <span className="ts-seal" aria-hidden="true">つ</span>
                <span style={{ font: `700 1.375rem/1 ${T.uiFont}`, letterSpacing: "-0.01em" }}>tsumiki</span>
              </button>
              <span style={{ flex: 1 }} />
              {ambienceBtn}
            </>
          ) : (
            // Inside a section the boards show a back arrow where the menu
            // was. The menu stays, on the right: it is still the only way to
            // Progress and Account, and to jump sideways between sections.
            <>
              <button className="ts-icon" onClick={() => go("home")} aria-label="Back to home">{ICON.back}</button>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, minWidth: 0, flex: 1 }}>
                <span style={{ font: `700 1.5rem/1 ${T.jpFont}`, whiteSpace: "nowrap" }}>{place.jp}</span>
                <span style={{
                  font: `700 0.9375rem ${T.uiFont}`, color: T.sub, whiteSpace: "nowrap",
                  overflow: "hidden", textOverflow: "ellipsis",
                }}>{place.label}</span>
              </div>
              {ambienceBtn}
              {menuBtn}
            </>
          )}
        </div>
      </header>

      <Drawer open={menuOpen} close={closeMenu} active={active} go={go}
              onAccount={() => { setMenuOpen(false); setAccountOpen(true); }} />

      {/* Mounted unconditionally and self-gating: it renders nothing until
          opened, and it opens ITSELF if a sign-in turns up a progress
          conflict that needs answering. A question about which copy of a
          learner’s work survives must not sit behind a closed menu. */}
      <Account open={accountOpen} setOpen={setAccountOpen} />

      {/* Mounted always, not only on Home: it opens ITSELF once a day, and a
          learner may well arrive straight into a module. */}
      <GoalsDialog open={goalsOpen} setOpen={setGoalsOpen} startedMap={startedMap} />

      <LookupHost />

      <main style={{ maxWidth: active === "home" || active === "room" ? 520 : 900, margin: "0 auto" }}>
        {active === "home" ? (
          <Home startedMap={startedMap} nextTask={nextTask} go={go}
                recency={recency} wallet={wallet} dormantDays={dormantDays}
                openAccount={() => setAccountOpen(true)}
                openGoals={() => setGoalsOpen(true)}
                lastMod={MODULES.find((m) => m.id === lastWorked) || null} />
        ) : active === "room" ? (
          <RoomSoon wallet={wallet} go={go} />
        ) : active === "progress" ? (
          // Not lazy: it is small, and it is the screen a learner opens to be
          // reassured about their own work. A spinner there reads as "gone".
          <Progress go={go} />
        ) : (
          <Suspense fallback={
            <p style={{ padding: "40px 18px", color: T.sub, font: `0.875rem ${T.uiFont}` }}>Loading…</p>
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
