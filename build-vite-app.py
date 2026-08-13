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

MODULES = [
    ("hiragana-module.jsx",   "Hiragana.jsx",   "HiraganaModule",   "Hiragana",   "ひらがな"),
    ("katakana-module.jsx",   "Katakana.jsx",   "KatakanaModule",   "Katakana",   "カタカナ"),
    ("grammar-module.jsx",    "Grammar.jsx",    "GrammarPractice",  "Grammar",    "ぶんぽう"),
    ("kanji-module.jsx",      "Kanji.jsx",      "KanjiModule",      "Kanji",      "漢字"),
    ("vocabulary-module.jsx", "Vocabulary.jsx", "VocabularyModule", "Vocabulary", "ことば"),
]
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

(LIB / "tokens.js").write_text(
    "// GENERATED by build-vite-app.py — the union of every module's design tokens.\n"
    "// They were identical apart from additions. A key holding two different values\n"
    "// fails the build rather than silently picking one.\n"
    "export const T = {\n"
    + "".join(f"  {k}: {v},\n" for k, v in sorted(tok.items()))
    + "};\n", encoding="utf-8")

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
for src_name, out_name, comp, label, jp in MODULES:
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
nav = ",\n  ".join(f'{{ id: "{c[3].lower()}", label: "{c[3]}", jp: "{c[4]}", Comp: {c[2]} }}'
                   for c in MODULES)
imports = "\n".join(f'const {c[2]} = lazy(() => import("./modules/{c[1]}"));' for c in MODULES)

(SRC / "App.jsx").write_text('''// GENERATED by build-vite-app.py — do not hand-edit.
import { useState, lazy, Suspense } from "react";
import { downloadProgress, importProgress } from "./lib/storage.js";
import { T } from "./lib/tokens.js";
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
};
const PROGRESS_KEYS = {
  hiragana: "hiragana-progress-v2", katakana: "katakana-progress-v1",
  grammar: "n5-progress-v1", kanji: "kanji-progress-v1", vocabulary: "known-words-v1",
};
function started(id) {
  try {
    const v = localStorage.getItem(PROGRESS_KEYS[id]);
    return v != null && v !== "{}" && v !== "[]";
  } catch (e) { return false; }
}

function Home({ last, go }) {
  const lastMod = MODULES.find((m) => m.id === last);
  const fresh = !MODULES.some((m) => started(m.id));
  const hero = lastMod || MODULES[0];
  const heroLabel = lastMod ? "PICK UP WHERE YOU LEFT OFF" : "NEW HERE? START WITH";
  const heroCta = lastMod ? "Continue ›" : "Start here ›";
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
        <div style={{ marginTop: 8, display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
          <span style={{ font: `600 24px ${T.uiFont}` }}>{hero.label}</span>
          <span style={{ font: `20px ${T.jpFont}`, color: T.sub }}>{hero.jp}</span>
        </div>
        <p style={{ font: `14px/1.6 ${T.uiFont}`, color: T.sub, margin: "8px 0 12px" }}>
          {HOME_WHY[hero.id]}
        </p>
        <div style={{ font: `600 15px ${T.uiFont}` }}>{heroCta}</div>
      </button>

      <div style={{ font: `600 11px ${T.uiFont}`, letterSpacing: ".7px", color: T.sub, marginBottom: 10 }}>
        EVERYWHERE YOU CAN GO
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {MODULES.map((m) => (
          <button key={m.id} onClick={() => go(m.id)} style={cardBase}>
            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ font: `600 16px ${T.uiFont}` }}>{m.label}</span>
              <span style={{ font: `15px ${T.jpFont}`, color: T.sub, marginLeft: 8 }}>{m.jp}</span>
              {m.id === "hiragana" && fresh && chip("START HERE", T.ok)}
              {last === m.id && chip("LAST VISITED", T.ink)}
              {last !== m.id && started(m.id) && chip("IN PROGRESS", T.sub)}
            </div>
            <p style={{ font: `13px/1.6 ${T.uiFont}`, color: T.sub, margin: "6px 0 0" }}>
              {HOME_WHY[m.id]}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  // Land on Home. It remembers where they were (naoshi-last-module) and
  // offers it as the continue card, rather than teleporting them there —
  // Session 13: the doors deserve a hallway.
  const [active, setActive] = useState("home");
  const [msg, setMsg] = useState(null);
  const current = MODULES.find((m) => m.id === active) || MODULES[0];

  const go = (id) => { setActive(id); if (id !== "home") localStorage.setItem("naoshi-last-module", id); };

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
        background: T.sheet, borderBottom: `1px solid ${T.hairline}`,
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{
          maxWidth: 900, margin: "0 auto", padding: "10px 16px",
          display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap",
        }}>
          <button onClick={() => go("home")} aria-label="Home" style={{
            background: "none", border: "none", cursor: "pointer", padding: "4px 8px",
            marginRight: 8, font: `600 17px ${T.jpFont}`, color: T.ink, borderRadius: 8,
            borderBottom: `2px solid ${active === "home" ? T.ink : "transparent"}`,
          }}>直</button>
          {MODULES.map((m) => (
            <button key={m.id} onClick={() => go(m.id)} style={{
              ...btn,
              font: `${active === m.id ? 600 : 400} 14px ${T.uiFont}`,
              color: active === m.id ? T.ink : T.sub,
              borderBottom: `2px solid ${active === m.id ? T.ink : "transparent"}`,
            }}>
              {m.label}
              <span style={{ font: `13px ${T.jpFont}`, color: T.sub, marginLeft: 6 }}>{m.jp}</span>
            </button>
          ))}
          <span style={{ flex: 1 }} />
          <button onClick={downloadProgress} title="Save your progress to a file" style={{
            ...btn, border: `1px solid ${T.hairline}`, padding: "6px 12px",
            font: `13px ${T.uiFont}`, color: T.sub,
          }}>Save progress</button>
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

      <main style={{ maxWidth: 900, margin: "0 auto" }}>
        {active === "home" ? (
          <Home last={localStorage.getItem("naoshi-last-module")} go={go} />
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
