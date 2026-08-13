// Smoke test — opens each module, enters a lesson, and clicks every sub-view.
//
// WHY IT EXISTS. The earlier render test only MOUNTED the app and checked the
// nav bar. It passed while two views were white-screening, because it never
// entered them. Every crash Lloyd reported came from the deduplication refactor
// and every one was invisible to a check that stops at the front door:
//
//   STROKES        not imported after the table moved to a registry
//   LOG_PTS        stripped from modules but not exported from the engine
//   useMemo        engine's React import hardcoded, engine used a fourth hook
//   TRACE_N        hand-maintained dependency list drifting from real usage
//   TRACE_STAGES   multi-line declaration cut mid-object, leaving a stray brace
//
// A build check catches none of these. They are runtime ReferenceErrors, and a
// white screen is what a learner sees.
//
// COVERAGE — read this before trusting a green run. Until late in Session 9 this file
// exercised KANJI and HIRAGANA only, while its own header claimed "each module".
// Katakana and Vocabulary were never opened, which is the worse half of the gap:
// Vocabulary is the module the build pipeline splices TWICE (its WORDS table
// from build-vocab-data.py, its engine from build-shared-stroke-engine.py), so
// it carries the most generated surface and had the least checking. A test that
// overstates its own reach is a documented trap in this project — "suspect a
// green result that arrives too easily."
//
// Two further sharp edges, both of which used to pass silently:
//   - A tab that is ABSENT now fails unless it is listed in `optional`.
//     "Assemble" is deliberately gone; anything else missing is a bug.
//   - Vocabulary's queues are driven by known-kanji-v1. With the default five
//     kanji only three words qualify, so the module can render an almost-empty
//     page that still clears any length threshold. It gets a richer known-set
//     so its queues actually populate — including 言う, whose kanji was added
//     in Session 9.
//
// RUN:  npm run smoke      (bundles test/entry.jsx, then runs this)
// Exits nonzero if any view collapses, any required tab is missing, or any
// module throws.

import { JSDOM } from "jsdom";
import fs from "fs";

// The bundle path is overridable because a sandboxed /tmp can be unwritable —
// and worse, a STALE /tmp/test-bundle.js from an earlier session reads as a
// green run against old code. Session 10 shipped several "PASSED" results that
// way before noticing. Hence: explicit path, and a hard freshness gate — the
// bundle must be newer than every module source it claims to test.
const BUNDLE = process.env.SMOKE_BUNDLE || "/tmp/test-bundle.js";
{
  const { fileURLToPath } = await import("url");
  const bundleTime = fs.statSync(BUNDLE).mtimeMs;
  const srcDir = fileURLToPath(new URL("../src/", import.meta.url));
  const stale = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = dir + e.name;
      if (e.isDirectory()) walk(p + "/");
      else if (fs.statSync(p).mtimeMs > bundleTime) stale.push(p.slice(srcDir.length));
    }
  };
  walk(srcDir);
  if (stale.length) {
    console.error(`REFUSING TO RUN: bundle at ${BUNDLE} is OLDER than ${stale.length} source file(s):`);
    for (const s of stale.slice(0, 8)) console.error("  " + s);
    console.error("Rebuild first (npm run smoke does), or point SMOKE_BUNDLE at a fresh bundle.");
    process.exit(2);
  }
}

const DEFAULT_KNOWN = ["日", "一", "二", "三", "十"];
// Enough of the syllabus for the vocabulary queues to have real work in them.
const RICH_KNOWN = [
  "日", "一", "二", "三", "十", "見", "行", "来", "食", "言", "話", "私",
  "木", "本", "人", "大", "女", "子", "上", "下", "中", "山", "川", "口",
  "目", "田", "月",
];

const failures = [];
function fail(msg) { failures.push(msg); }

async function go(modId, lessonMatch, tabs, opts = {}) {
  const errors = [];
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>',
    { runScripts: "outside-only", pretendToBeVisual: true, url: "http://localhost/" });
  const w = dom.window;
  w.HTMLCanvasElement.prototype.getContext = () => new Proxy({
    canvas: { width: 300, height: 300 }, lineCap: "", lineJoin: "", lineWidth: 1,
    strokeStyle: "", fillStyle: "", globalAlpha: 1, font: "",
    measureText: () => ({ width: 0 }), getImageData: () => ({ data: [] }),
    createLinearGradient: () => ({ addColorStop() {} }),
  }, { get: (t, k) => (k in t ? t[k] : () => {}), set: (t, k, v) => { t[k] = v; return true; } });
  w.AudioContext = function () {
    return {
      decodeAudioData: async () => ({}),
      createBufferSource: () => ({ connect() {}, start() {} }),
      destination: {}, currentTime: 0,
    };
  };
  w.fetch = () => Promise.resolve({ ok: false, status: 404 });
  w.console.error = (...a) => {
    const s = a.join(" ");
    if (!/Not implemented|jsdom|Could not parse CSS/i.test(s)) errors.push(s);
  };
  w.console.warn = () => {};
  w.addEventListener("error", e => errors.push("UNCAUGHT: " + (e.error?.message || e.message)));
  w.localStorage.setItem("known-kanji-v1", JSON.stringify(opts.known || DEFAULT_KNOWN));
  w.localStorage.setItem("naoshi-last-module", modId);
  w.eval(fs.readFileSync(BUNDLE, "utf8"));
  await new Promise(r => setTimeout(r, 2200));

  // Session 13: the app now lands on the Home screen rather than teleporting
  // to naoshi-last-module. Enter the module the way a user does: the hero
  // card offers the last-visited module (seeded above) — click it, and in
  // doing so smoke-test Home itself. Fall back to the header tab.
  {
    const all = [...w.document.querySelectorAll("button")];
    const hero = all.find(x => /PICK UP WHERE YOU LEFT OFF/i.test(x.textContent || ""));
    const label = { hiragana: "Hiragana", katakana: "Katakana", grammar: "Grammar",
                    kanji: "Kanji", vocabulary: "Vocabulary" }[modId];
    const tab = all.find(x => (x.textContent || "").startsWith(label));
    if (!hero && !tab) { fail(`${modId.toUpperCase()}: HOME gave no way into the module`); return; }
    if (hero) console.log(`  home: continue card ok (${modId})`);
    (hero || tab).click();
    await new Promise(r => setTimeout(r, 900));
  }

  const d = w.document;
  const NAME = modId.toUpperCase();
  const btns = () => [...d.querySelectorAll("button")];
  const rootText = () => (d.getElementById("root")?.textContent || "").trim();

  // The module must render something before we go looking for a lesson.
  if (rootText().length < 200) {
    console.log(`\n${NAME} — ❌ module did not render (${rootText().length} chars)`);
    if (errors.length) console.log("     errors:", errors.slice(0, 3));
    fail(`${NAME}: module did not render`);
    return;
  }

  let opened = "(top level)";
  if (lessonMatch) {
    const lesson = btns().find(b => lessonMatch.test(b.textContent || ""));
    if (!lesson) {
      console.log(`\n${NAME} — ❌ no lesson matched ${lessonMatch}`);
      fail(`${NAME}: lesson entry point not found`);
      return;
    }
    opened = JSON.stringify((lesson.textContent || "").trim().slice(0, 44));
    lesson.click();
    await new Promise(r => setTimeout(r, 800));
  }
  console.log(`\n${NAME} — opening ${opened}`);

  const avail = btns().map(b => (b.textContent || "").trim());
  console.log("  tabs available:", avail.filter(t => t.length < 14 && t.length > 1).join(" | "));

  const optional = new Set(opts.optional || []);
  for (const tab of tabs) {
    const b = btns().find(x => (x.textContent || "").trim() === tab);
    if (!b) {
      if (optional.has(tab)) { console.log(`  "${tab}" — not present (expected)`); }
      else { console.log(`  "${tab}" — ❌ MISSING`); fail(`${NAME}: tab "${tab}" missing`); }
      continue;
    }
    b.click();
    await new Promise(r => setTimeout(r, 900));
    const t = rootText();
    const broke = t.length < 200;
    console.log(`  "${tab}" → ${t.length} chars ${broke ? "❌ WHITE SCREEN" : "ok"}`);
    if (broke) fail(`${NAME}: view "${tab}" collapsed`);
    if (errors.length) { console.log("     errors:", errors.slice(0, 2)); errors.length = 0; }
  }

  if (opts.then) await opts.then({ d, btns, rootText, log: (...a) => console.log("  ", ...a), fail, NAME });
  if (errors.length) {
    console.log("     late errors:", errors.slice(0, 3));
    fail(`${NAME}: console errors after interaction`);
  }
}

await go("kanji", /KJLines/, ["Learn", "Write", "Recall", "Use it"]);

await go("hiragana", /Main Vowel Series/, ["Learn", "Trace", "Drill", "Listen", "Assemble"],
  { optional: ["Assemble"] });

// Katakana shares the kana engine but carries its own lesson table and its own
// copy of the spliced blocks — "identical to hiragana" is an assumption the
// drift checker verifies for shared blocks only, not for this module's own code.
await go("katakana", /Main Vowel Series/, ["Learn", "Trace", "Drill", "Listen", "Assemble"],
  { optional: ["Assemble"] });

// Grammar is the static port (Session 10): the grader is stripped from the
// bundle, so the API surfaces must be REPLACED by self-mark fallbacks — and
// self-marking must write n5-progress-v1, the key the vocabulary module
// unlocks kana-only words from. Both halves are asserted: grader UI absent,
// progress write present. Navigation is two-deep (stage card → point row),
// which go() can't do alone, so it all lives in `then`.
await go("grammar", null, [], {
  then: async ({ d, btns, rootText, log, fail: f, NAME }) => {
    const wait = (ms = 700) => new Promise(r => setTimeout(r, ms));
    const stage = btns().find(b => /Foundations/.test(b.textContent || ""));
    if (!stage) { f(`${NAME}: Stage 1 card not found`); return; }
    stage.click(); await wait();
    const step1 = btns().find(b => /Your first sentences/.test(b.textContent || ""));
    if (step1) { step1.click(); await wait(); }
    const row = btns().find(b => /making a statement|です/.test(b.textContent || ""));
    if (!row) { f(`${NAME}: no Step 1 point row found`); return; }
    log(`opening point ${JSON.stringify((row.textContent || "").trim().slice(0, 40))}`);
    row.click(); await wait(900);
    for (const tab of ["Learn", "Quiz", "Practice"]) {
      const b = btns().find(x => (x.textContent || "").trim().startsWith(tab));
      if (!b) { log(`  "${tab}" — ❌ MISSING`); f(`${NAME}: tab "${tab}" missing`); continue; }
      b.click(); await wait(800);
      const t = rootText();
      log(`"${tab}" → ${t.length} chars ${t.length < 200 ? "❌ WHITE SCREEN" : "ok"}`);
      if (t.length < 200) f(`${NAME}: view "${tab}" collapsed`);
    }
    // Quiz tab: static stand-in present, grader UI absent
    const quizTab = btns().find(x => (x.textContent || "").trim().startsWith("Quiz"));
    if (quizTab) { quizTab.click(); await wait(); }
    if (rootText().includes("Start quiz")) f(`${NAME}: grader quiz UI leaked into static build`);
    const mark = btns().find(b => (b.textContent || "").trim() === "Mark as studied");
    if (!mark) { f(`${NAME}: "Mark as studied" fallback missing`); return; }
    mark.click(); await wait();
    if (!rootText().includes("Marked as studied")) f(`${NAME}: self-mark did not register`);
    let prog = {};
    try { prog = JSON.parse(d.defaultView.localStorage.getItem("n5-progress-v1") || "{}"); } catch {}
    const wrote = Object.values(prog).some(p => p && p.studied);
    log(`n5-progress-v1 studied entry: ${wrote ? "ok — vocabulary can unlock from this" : "❌ NOT WRITTEN"}`);
    if (!wrote) f(`${NAME}: self-mark did not write n5-progress-v1`);
    const practiceTab = btns().find(x => (x.textContent || "").trim().startsWith("Practice"));
    if (practiceTab) { practiceTab.click(); await wait(); }
    if (rootText().includes("Grade my sentence")) f(`${NAME}: grader practice UI leaked into static build`);
    if (!btns().some(b => (b.textContent || "").includes("log practice"))) f(`${NAME}: practice self-log button missing`);
  },
});

// Vocabulary has no lessons — its top level IS the queues, so there is nothing
// to open. The tabs are the queue views; the deep step enters a word, which is
// where the spliced WORDS table and the shared stroke engine actually meet.
await go("vocabulary", null, ["New", "Review"], {
  known: RICH_KNOWN,
  then: async ({ btns, rootText, log, fail: f, NAME }) => {
    const back = btns().find(b => (b.textContent || "").trim() === "New");
    if (back) { back.click(); await new Promise(r => setTimeout(r, 600)); }
    const card = btns().find(b => (b.textContent || "").includes("言う"))
              || btns().find(b => (b.textContent || "").trim().length > 6
                                && !["New", "Review"].includes((b.textContent || "").trim()));
    if (!card) { log('❌ no word card to open — queues are empty'); f(`${NAME}: no word cards`); return; }
    log(`opening word card ${JSON.stringify((card.textContent || "").trim().slice(0, 30))}`);
    card.click();
    await new Promise(r => setTimeout(r, 900));
    const t = rootText();
    log(`word view → ${t.length} chars ${t.length < 200 ? "❌ WHITE SCREEN" : "ok"}`);
    if (t.length < 200) f(`${NAME}: word practice view collapsed`);
  },
});

console.log("\n" + "─".repeat(60));
if (failures.length) {
  console.log(`FAILED — ${failures.length} problem${failures.length > 1 ? "s" : ""}:`);
  for (const f of failures) console.log("  ✗ " + f);
  process.exitCode = 1;
} else {
  console.log("PASSED — 5 modules, every required view rendered.");
}
