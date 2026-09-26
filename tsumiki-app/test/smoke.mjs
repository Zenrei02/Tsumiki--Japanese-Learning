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
import { fileURLToPath } from "url";

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

// Session 16: the floor a rendered view must clear, measured against <main>
// rather than #root. See the note above rootText() for why it moved and why
// this number is much lower than the 200 it replaced — the old figure was
// partly counting the nav bar's own text.
const MIN_VIEW = 80;

// SMOKE_ONLY=grammar,vocabulary runs a subset. Added Session 14: the Cowork
// sandbox caps a single command at 45s and reaps backgrounded processes, so
// the full five-module run cannot reliably finish in one piece there. Split
// runs cover the same ground; omit the variable for the full sweep.
const ONLY = (process.env.SMOKE_ONLY || "").split(",").map(s => s.trim()).filter(Boolean);

let modulesRun = 0;
async function go(modId, lessonMatch, tabs, opts = {}) {
  if (ONLY.length && !ONLY.includes(modId)) return;
  modulesRun++;
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
  w.localStorage.setItem("tsumiki-known-kanji-v1", JSON.stringify(opts.known || DEFAULT_KNOWN));
  w.localStorage.setItem("tsumiki-last-module", modId);
  w.eval(fs.readFileSync(BUNDLE, "utf8"));
  await new Promise(r => setTimeout(r, 2200));

  // Session 16: the side menu is the only global navigation now, so it is
  // checked before anything else. If the drawer fails to open, every module is
  // unreachable for a learner who is not on Home — a failure the old test
  // could not have seen, because the tab bar was always in the DOM whether it
  // worked or not. Open it, confirm every module is listed, close it again,
  // and confirm it actually went away.
  {
    const all = () => [...w.document.querySelectorAll("button")];
    const menuBtn = all().find(x => x.getAttribute("aria-label") === "Menu");
    if (!menuBtn) {
      fail(`${modId.toUpperCase()}: no Menu button — the side menu is missing`);
      return;
    }
    menuBtn.click();
    await new Promise(r => setTimeout(r, 300));
    const panel = w.document.querySelector('[role="dialog"][aria-modal="true"]');
    if (!panel) {
      fail(`${modId.toUpperCase()}: Menu button did not open the drawer`);
      return;
    }
    const listed = [...panel.querySelectorAll("button")].map(b => (b.textContent || "").trim());
    const missing = ["Hiragana", "Katakana", "Grammar", "Kanji", "Vocabulary", "Checker", "Dictionary", "Home"]
      .filter(l => !listed.some(t => t.startsWith(l)));
    if (missing.length) fail(`${modId.toUpperCase()}: drawer is missing ${missing.join(", ")}`);
    const closeBtn = [...panel.querySelectorAll("button")]
      .find(b => b.getAttribute("aria-label") === "Close menu");
    if (!closeBtn) fail(`${modId.toUpperCase()}: drawer has no close control`);
    else {
      closeBtn.click();
      await new Promise(r => setTimeout(r, 300));
      if (w.document.querySelector('[role="dialog"][aria-modal="true"]')) {
        fail(`${modId.toUpperCase()}: drawer would not close`);
      }
    }
    console.log(`  side menu: opens, lists ${listed.length} destinations, closes ok`);
  }

  // Session 13: the app lands on the Home screen rather than teleporting to
  // tsumiki-last-module. Enter the module the way a user does: the hero card
  // offers the last-visited module (seeded above) — click it, and in doing so
  // smoke-test Home itself. Fall back to the drawer, which is now the real
  // alternative route rather than the header tab that used to be here.
  {
    const label = { hiragana: "Hiragana", katakana: "Katakana", grammar: "Grammar",
                    kanji: "Kanji", vocabulary: "Vocabulary", checker: "Checker" }[modId];
    const all = () => [...w.document.querySelectorAll("button")];
    const hero = all().find(x => /PICK UP WHERE YOU LEFT OFF/i.test(x.textContent || ""));
    if (hero) {
      console.log(`  home: continue card ok (${modId})`);
      hero.click();
    } else {
      all().find(x => x.getAttribute("aria-label") === "Menu")?.click();
      await new Promise(r => setTimeout(r, 300));
      const viaMenu = all().find(x => (x.textContent || "").trim().startsWith(label));
      if (!viaMenu) {
        fail(`${modId.toUpperCase()}: no way into the module from Home or the drawer`);
        return;
      }
      console.log(`  home: no continue card — entered via the side menu`);
      viaMenu.click();
    }
    await new Promise(r => setTimeout(r, 900));
  }

  const d = w.document;
  const NAME = modId.toUpperCase();
  const btns = () => [...d.querySelectorAll("button")];

  // Session 16: measure <main>, not #root. #root includes the app shell, and
  // until the tab bar became a drawer that shell contributed ~76 characters
  // to every single measurement — the five module labels with their Japanese
  // names, plus "Save progress" and "Restore". The 200-char floor below was
  // calibrated against that padding, so it was partly measuring chrome.
  //
  // It showed the moment the drawer landed: Vocabulary's Review view dropped
  // from 240 chars to 186 and "failed", having lost exactly the 54 characters
  // of tab labels. The view itself was unchanged and correct — it renders
  // "Nothing here yet. Words arrive once you have practised them.", a
  // legitimate empty state that had never independently cleared the bar.
  //
  // So: measure what the module actually rendered, and set the floor where it
  // catches a genuine white screen (a collapsed React tree yields ~0 chars)
  // without punishing a sparse-but-correct view. Correctness beyond "did it
  // render" is the job of the specific string assertions further down.
  const rootText = () =>
    (d.querySelector("main")?.textContent || d.getElementById("root")?.textContent || "").trim();

  // The module must render something before we go looking for a lesson.
  if (rootText().length < MIN_VIEW) {
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
    const broke = t.length < MIN_VIEW;
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
    // Session 14: the review challenge is a new always-available surface on
    // the stage picker — assert it opens and comes back, don't skip it.
    const chall = btns().find(b => /Review challenge/.test(b.textContent || ""));
    if (!chall) { f(`${NAME}: review challenge card missing`); }
    else {
      chall.click(); await wait();
      if (!rootText().includes("腕試し")) f(`${NAME}: challenge screen did not open`);
      log(`challenge screen: ${rootText().includes("腕試し") ? "ok" : "❌"}`);
      const back = btns().find(b => (b.textContent || "").includes("All grammar"));
      if (back) { back.click(); await wait(); } else { f(`${NAME}: challenge has no way back`); return; }
    }
    // Session 17: this used to match /Foundations/, which was Stage 1's SUBTITLE. The
    // re-staging renamed it and the test failed on a rename rather than on a regression —
    // a stale literal asserting nothing about whether the app works. Match the card
    // structurally instead: the first enabled .level-card that is not the challenge card.
    const stage = btns().find(b =>
      (b.className || "").includes("level-card") && !b.disabled &&
      !/Review challenge/.test(b.textContent || ""));
    if (!stage) { f(`${NAME}: Stage 1 card not found`); return; }
    log(`stage card: ${JSON.stringify((stage.textContent || "").trim().slice(0, 40))}`);
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
      log(`"${tab}" → ${t.length} chars ${t.length < MIN_VIEW ? "❌ WHITE SCREEN" : "ok"}`);
      if (t.length < MIN_VIEW) f(`${NAME}: view "${tab}" collapsed`);
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
    try { prog = JSON.parse(d.defaultView.localStorage.getItem("tsumiki-n5-progress-v1") || "{}"); } catch {}
    const wrote = Object.values(prog).some(p => p && p.studied);
    log(`n5-progress-v1 studied entry: ${wrote ? "ok — vocabulary can unlock from this" : "❌ NOT WRITTEN"}`);
    if (!wrote) f(`${NAME}: self-mark did not write n5-progress-v1`);
    const practiceTab = btns().find(x => (x.textContent || "").trim().startsWith("Practice"));
    if (practiceTab) { practiceTab.click(); await wait(); }
    if (rootText().includes("Grade my sentence")) f(`${NAME}: grader practice UI leaked into static build`);
    if (!btns().some(b => (b.textContent || "").includes("log practice"))) f(`${NAME}: practice self-log button missing`);
    // Session 14: です is a deep lesson now — Learn must be the walkthrough
    // pager and Drill must present a deterministic item. Assert both.
    const learnTab = btns().find(x => (x.textContent || "").trim().startsWith("Learn"));
    if (learnTab) {
      learnTab.click(); await wait();
      const pager = btns().some(b => (b.textContent || "").includes("Next →"));
      log(`walkthrough pager: ${pager ? "ok" : "❌ MISSING"}`);
      if (!pager) f(`${NAME}: deep lesson Learn is not the walkthrough pager`);
    }
    const drillTab = btns().find(x => (x.textContent || "").trim().startsWith("Drill"));
    if (!drillTab) { f(`${NAME}: Drill tab missing on a deep lesson`); }
    else {
      drillTab.click(); await wait();
      const start = btns().find(b => /^(Start|Another round)$/.test((b.textContent || "").trim()));
      if (!start) { f(`${NAME}: drill start button missing`); }
      else {
        start.click(); await wait();
        const presented = / of \d/.test(rootText());
        log(`drill item presented: ${presented ? "ok" : "❌"}`);
        if (!presented) f(`${NAME}: drill did not present an item`);

        // Session 34: a tapped word in a lesson goes to the dictionary drawer,
        // not the old modal. The first tappable word in the drill sentence is
        // clicked for real, so this proves the ROUTING, not just the drawer.
        const word = d.querySelector('main span[role="button"]');
        if (!word) f(`${NAME}: no tappable word in the drill sentence to route`);
        else {
          word.click(); await wait(900);
          const dict = [...d.querySelectorAll('[role="dialog"]')].find(x => x.getAttribute("aria-label") === "Dictionary");
          if (!dict) f(`${NAME}: tapping a word did not open the dictionary drawer — lookups are not routed`);
          else {
            log(`word tap → dictionary drawer: ok ("${(word.textContent || "").trim()}")`);
            [...dict.querySelectorAll("button")].find(b => b.getAttribute("aria-label") === "Close dictionary")?.click();
            await wait(300);
          }
        }

        // Session 34: the finish screen printed "4 of 4" for a 4-of-5 round —
        // it cleared the run before rendering, so the total collapsed into the
        // score. Play the round out (typed items answered wrong on purpose) and
        // assert the total the round STARTED with is the one it ends with.
        const total = +((rootText().match(/(?<!\d)1 of (\d+)/) || [])[1] || 0);  // not \b: textContent runs "Practice1 of 5" together
        for (let k = 0; k < 25; k++) {
          if (/clean sweep|misses are the lesson/.test(rootText())) break;
          const inp = d.querySelector("main input");
          if (inp) {
            Object.getOwnPropertyDescriptor(d.defaultView.HTMLInputElement.prototype, "value").set.call(inp, "✗");
            inp.dispatchEvent(new d.defaultView.Event("input", { bubbles: true }));
            await wait(120);
            btns().find(b => (b.textContent || "").trim() === "Check")?.click();
          } else {
            const chip = btns().find(b => (b.className || "").includes("btn-ghost") &&
              !/^←|Again|Done/.test((b.textContent || "").trim()));
            chip?.click();
          }
          await wait(250);
          btns().find(b => /^(Next →|Finish)$/.test((b.textContent || "").trim()))?.click();
          await wait(300);
        }
        const fin = rootText().match(/(\d+) of (\d+) — (clean sweep|the misses are the lesson)/);
        if (!fin) f(`${NAME}: drill round never reached its finish screen`);
        else if (+fin[2] !== total) f(`${NAME}: drill finish reads "${fin[1]} of ${fin[2]}" for a ${total}-item round — the total is lost`);
        else if ((+fin[1] === +fin[2]) !== /clean sweep/.test(fin[3])) f(`${NAME}: drill says "${fin[3]}" at ${fin[1]} of ${fin[2]}`);
        else log(`drill finish: ${fin[1]} of ${fin[2]} — total survives the round`);
      }
    }

    // ————— The completion splash, and the way out of it (Session 34) —————
    // Lloyd: a tester who finishes a lesson must have a button back to the
    // start. The lesson is already marked studied above, so logging one
    // practice flips isDone and the splash fires for real — no state is faked.
    {
      const pTab = btns().find(x => (x.textContent || "").trim().startsWith("Practice"));
      if (pTab) { pTab.click(); await wait(700); }
      // The log button is disabled until something is written — the learner
      // logs a sentence, not an intention.
      const box = d.querySelector("main textarea");
      if (box) {
        Object.getOwnPropertyDescriptor(d.defaultView.HTMLTextAreaElement.prototype, "value")
          .set.call(box, "私は学生です。");
        box.dispatchEvent(new d.defaultView.Event("input", { bubbles: true }));
        await wait(300);
      }
      const logBtn = btns().find(b => (b.textContent || "").includes("log practice"));
      if (!logBtn) { f(`${NAME}: no practice self-log button — the splash cannot be reached`); }
      else if (logBtn.disabled) { f(`${NAME}: the practice log button stayed disabled after a sentence was written`); }
      else {
        logBtn.click(); await wait(1100);
        const t = rootText();
        if (!/Lesson complete\./.test(t)) f(`${NAME}: finishing the lesson did not raise the completion splash`);
        else {
          log("completion splash: raised by finishing the lesson");
          const back = btns().find(b => (b.textContent || "").trim() === "← All grammar points");
          const stay = btns().find(b => (b.textContent || "").trim() === "Stay in this lesson");
          if (!back) { f(`${NAME}: the splash has no button back to the lesson list`); }
          else if (!stay) { f(`${NAME}: the splash offers no way to stay in the lesson`); }
          else {
            back.click(); await wait(900);
            const after = rootText();
            if (/Lesson complete\./.test(after)) f(`${NAME}: the splash's back button did not leave the splash`);
            else if (!/Review challenge|Step 1|All grammar/i.test(after)) f(`${NAME}: the splash's back button did not land on a list screen`);
            else log("completion splash: back button returns to the list");
          }
        }
      }
    }
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
    log(`word view → ${t.length} chars ${t.length < MIN_VIEW ? "❌ WHITE SCREEN" : "ok"}`);
    if (t.length < MIN_VIEW) f(`${NAME}: word practice view collapsed`);
  },
});

// Session 16: the checker. Its whole job is a network call, and the smoke test
// has fetch stubbed to a 404, so what is checked here is the part that must
// hold WITHOUT a backend: the module renders, the context selector and the
// input are present, and pressing Check with an unconfigured endpoint produces
// a stated reason rather than a white screen or a silent nothing.
//
// That last one is the real risk. A checker that fails invisibly looks exactly
// like a checker that found no errors — and "no errors" is a result this
// product is specifically designed to give. The two must never be confusable.
await go("checker", null, [], {
  then: async ({ btns, rootText, log, fail: f, NAME }) => {
    const t = rootText();
    for (const needed of ["Casual", "Polite", "Business", "Check"]) {
      if (!t.includes(needed)) f(`${NAME}: "${needed}" missing from the checker`);
    }
    // No bare `document` here — this runs in Node against a jsdom window, so
    // the only document available is the one the buttons belong to.
    const box = btns()[0]?.ownerDocument?.querySelector("textarea");
    if (!box) { f(`${NAME}: no text input`); return; }
    log("input, context selector and Check button all present");

    // Type, then press Check. CHECKER_URL is empty in this bundle, so the
    // module should short-circuit to "not-configured" and SAY so.
    const setter = Object.getOwnPropertyDescriptor(
      box.ownerDocument.defaultView.HTMLTextAreaElement.prototype, "value").set;
    setter.call(box, "私は毎日私の犬と散歩します。");
    box.dispatchEvent(new box.ownerDocument.defaultView.Event("input", { bubbles: true }));
    await new Promise(r => setTimeout(r, 300));

    const go2 = btns().find(b => (b.textContent || "").trim() === "Check");
    if (!go2) { f(`${NAME}: Check button vanished after typing`); return; }
    go2.click();
    await new Promise(r => setTimeout(r, 900));

    const after = rootText();
    if (after.length < MIN_VIEW) { f(`${NAME}: checker collapsed after Check`); return; }
    const explained = /isn't connected|went wrong|could not be reached/i.test(after);
    log(`unconfigured Check → ${explained ? "explained to the learner ok" : "❌ SILENT"}`);
    if (!explained) f(`${NAME}: Check failed silently — indistinguishable from "no errors found"`);
  },
});

// ————— GOALS, THE ONCE-A-DAY DIALOG (Session 23) —————
// The daily card / weekly rhythm / quest chain. It was inline on Home; Lloyd
// moved it behind a dialog that opens ITSELF on the first visit of each day
// and is reachable afterwards from the Goals button.
//
// The behaviour worth guarding is the ONCE part. An "open every load" bug
// looks identical on the first run of the day and is only visible on the
// second, so both are exercised below.
//
// ⚠️ WHY THIS CHECKS CSS AND NOT JUST THAT IT RENDERED. engagement-module.jsx is
// authored in Tailwind and this app has no Tailwind, so build-vite-app.py
// generates a scoped stand-in stylesheet from the classes the module uses. That
// generator can be wrong in a way NOTHING ELSE NOTICES: the module renders, the
// build prints a rule count, every guard goes green, and the card is unstyled.
//
// It has already happened once, on the first build. Several selectors need CSS
// escapes — `.text-\[11px\]`, `.gap-1\.5`, `.from-amber-50\/40`, every
// `.hover\:…` — and the file emitted them inside a plain JS template literal,
// where JavaScript ate the backslash before CSS ever saw it. Ten-odd rules
// shipped as invalid selectors that browsers drop in silence. The build said
// 107 rules and the file contained 107 rules; both were true and neither was
// the question.
//
// ⚠️ AND THE OBVIOUS CHECK FOR IT DOES NOT WORK HERE. The first version of this
// compared rules EMITTED against rules the CSS parser ACCEPTED, on the reasoning
// that a parser is the only thing that can say whether a selector is real. In a
// browser that is true — Chrome reports 107 emitted, 107 parsed when the escapes
// are right, and drops the broken ones when they are not. jsdom does not: run
// against a stylesheet with every escape stripped, it still reported 107 of 107
// and the whole check passed. It was only found because the negative control was
// run and was expected to be red.
//
// So the assertion is TEXTUAL, and deliberately so: a selector containing
// [ ] . / % or a variant colon must carry its backslash. That is the exact
// property the template literal destroyed, it is checkable without a parser, and
// it cannot be satisfied by a parser being lenient.
//
// The real-browser half of this was verified by hand on Sep 6 2026 against
// `npm run dev`: 107 emitted / 107 parsed, `.text-\[11px\]` computing to 11px
// and `.from-amber-50\/40` producing rgba(255,251,235,0.4). That is evidence
// about a browser; the check below is the regression guard that runs every time.
{
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>',
    { runScripts: "outside-only", pretendToBeVisual: true, url: "http://localhost/" });
  const w = dom.window;
  const errors = [];
  w.HTMLCanvasElement.prototype.getContext = () => new Proxy({
    canvas: { width: 300, height: 300 }, measureText: () => ({ width: 0 }),
  }, { get: (t, k) => (k in t ? t[k] : () => {}), set: (t, k, v) => { t[k] = v; return true; } });
  w.fetch = () => Promise.resolve({ ok: false, status: 404 });
  w.console.error = (...a) => {
    const t = a.join(" ");
    if (!/Not implemented|jsdom|Could not parse CSS/i.test(t)) errors.push(t);
  };
  w.console.warn = () => {};
  w.addEventListener("error", e => errors.push("UNCAUGHT: " + (e.error?.message || e.message)));
  // It shows nothing to a learner who has started nothing — deliberate, so it
  // has to be given something to have started.
  w.localStorage.setItem("tsumiki-hiragana-progress-v2", JSON.stringify({ "h-a": { seen: true } }));
  w.eval(fs.readFileSync(BUNDLE, "utf8"));
  await new Promise(r => setTimeout(r, 2500));

  console.log("\nGOALS — the once-a-day dialog");
  const goalsDlg = () => [...w.document.querySelectorAll('[role="dialog"]')]
    .find(d => d.getAttribute("aria-label") === "Goals");
  if (!goalsDlg()) fail("GOALS: did not open itself on the first visit of the day");
  else console.log("  opens itself on the first visit of the day");

  const scope = w.document.querySelector(".eng-scope");
  if (!scope) {
    fail("GOALS: no .eng-scope — the engagement module did not mount");
  } else {
    const styleEl = scope.querySelector("style");
    if (!styleEl) {
      fail("ENGAGEMENT: panel mounted with no stylesheet — it will render unstyled");
    } else {
      const css = styleEl.textContent;
      const emitted = (css.match(/\.eng-scope/g) || []).length;
      console.log(`  scoped stylesheet: ${emitted} rules`);
      if (emitted < 50) {
        fail(`ENGAGEMENT: only ${emitted} rules — the class extractor has stopped finding them`);
      }

      // Every selector, minus a legitimate trailing pseudo-class, must have its
      // special characters escaped.
      const broken = [];
      for (const line of css.split("\n")) {
        const sel = line.split("{")[0].trim();
        if (!sel.startsWith(".eng-scope")) continue;
        const bare = sel.replace(/:hover$/, "").replace(/\s*>\s*\*\s*\+\s*\*$/, "");
        // (?<!\\) — the character is a problem only when NOT already escaped.
        if (/(?<!\\)[[\]/%]/.test(bare) || /(?<!\\):/.test(bare.slice(1))) {
          broken.push(sel);
        }
      }
      if (broken.length) {
        fail(`ENGAGEMENT: ${broken.length} selector(s) lost their CSS escapes — ` +
             `e.g. ${JSON.stringify(broken[0])}. A browser drops these silently ` +
             `and the card renders unstyled. Check that engagementStyles.js is ` +
             `emitted with String.raw.`);
      } else {
        console.log("  selectors keep their CSS escapes ok");
      }
    }
    // Scoping is the whole safety argument: nothing here may reach the rest of
    // the app. A bare `.rounded-lg` would restyle five other modules.
    const unscoped = (scope.querySelector("style")?.textContent || "")
      .split("\n").filter(l => l.trim() && !l.trim().startsWith(".eng-scope"));
    if (unscoped.length) {
      fail(`ENGAGEMENT: ${unscoped.length} rule(s) are not scoped to .eng-scope — ` +
           `e.g. ${JSON.stringify(unscoped[0].slice(0, 60))}`);
    } else {
      console.log("  every rule scoped to .eng-scope ok");
    }
    const text = scope.textContent || "";
    if (text.length < 80) fail(`ENGAGEMENT: panel rendered only ${text.length} chars`);
    else console.log(`  panel rendered ${text.length} chars`);
  }
  if (errors.length) fail("GOALS: console errors — " + errors.slice(0, 2).join(" | "));
}

// Second visit, same day: it must NOT reopen. Fresh window, same marker.
{
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>',
    { runScripts: "outside-only", pretendToBeVisual: true, url: "http://localhost/" });
  const w = dom.window;
  w.HTMLCanvasElement.prototype.getContext = () => new Proxy({
    canvas: { width: 300, height: 300 }, measureText: () => ({ width: 0 }),
  }, { get: (t, k) => (k in t ? t[k] : () => {}), set: (t, k, v) => { t[k] = v; return true; } });
  w.fetch = () => Promise.resolve({ ok: false, status: 404 });
  w.console.error = () => {}; w.console.warn = () => {};
  w.localStorage.setItem("tsumiki-hiragana-progress-v2", JSON.stringify({ "h-a": { seen: true } }));
  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  w.localStorage.setItem("tsumiki-goals-seen", today);
  w.eval(fs.readFileSync(BUNDLE, "utf8"));
  await new Promise(r => setTimeout(r, 2500));

  const reopened = [...w.document.querySelectorAll('[role="dialog"]')]
    .find(x => x.getAttribute("aria-label") === "Goals");
  if (reopened) {
    fail("GOALS: opened again on a second visit the same day — the marker is not being read");
  } else {
    console.log("  stays shut on a second visit the same day");
  }

  // …and the Goals button is still there to open it on purpose.
  const btn = [...w.document.querySelectorAll("button")]
    .find(b => (b.textContent || "").trim() === "Goals");
  if (!btn) {
    fail("GOALS: no Goals button on Home — the dialog would be unreachable after the first visit");
  } else {
    btn.click();
    await new Promise(r => setTimeout(r, 900));
    const opened = [...w.document.querySelectorAll('[role="dialog"]')]
      .find(x => x.getAttribute("aria-label") === "Goals");
    if (!opened) fail("GOALS: the Goals button did not open the dialog");
    else console.log("  the Goals button reopens it on demand");
  }
}

// ————— ACCOUNTS (Session 23) —————
// Accounts are OPTIONAL, and this bundle is the un-configured case: esbuild's
// iife output replaces `import.meta` with {}, so VITE_SUPABASE_URL and
// VITE_SUPABASE_PUBLISHABLE_KEY are both absent — exactly the shape of a local
// `npm run dev` with no .env, and of the standalone HTML build.
//
// TWO THINGS ARE BEING CHECKED, and the first is the one that would hurt.
//
//   1. THE APP STILL WORKS WITHOUT ACCOUNTS. account.jsx is imported by App.jsx
//      at the top level, not lazily, so anything that throws while it evaluates
//      takes the WHOLE APP down — every module, on every device, including the
//      five that have nothing to do with accounts. The specific trap is
//      `import.meta.env.X` without the optional chain: under iife that is a
//      property read on undefined and it throws at module load. The Checker
//      already carries the guarded form for this reason.
//
//   2. UNCONFIGURED IS EXPLAINED, NEVER SILENT. Same rule the Checker is held
//      to above: a sign-in panel that simply does nothing when tapped is
//      indistinguishable from one that is broken.
{
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>',
    { runScripts: "outside-only", pretendToBeVisual: true, url: "http://localhost/" });
  const w = dom.window;
  const errors = [];
  w.HTMLCanvasElement.prototype.getContext = () => new Proxy({
    canvas: { width: 300, height: 300 }, measureText: () => ({ width: 0 }),
  }, { get: (t, k) => (k in t ? t[k] : () => {}), set: (t, k, v) => { t[k] = v; return true; } });
  w.fetch = () => Promise.resolve({ ok: false, status: 404 });
  w.console.error = (...a) => {
    const t = a.join(" ");
    if (!/Not implemented|jsdom|Could not parse CSS/i.test(t)) errors.push(t);
  };
  w.console.warn = () => {};
  w.addEventListener("error", e => errors.push("UNCAUGHT: " + (e.error?.message || e.message)));
  // Seeded so a section counts as STARTED. Without it the Progress reset has
  // nothing to select, "Clear selected…" stays disabled, and the assertion that
  // the confirm still offers a save is skipped — a check that quietly does not
  // run is the failure mode this file's header is about.
  w.localStorage.setItem("tsumiki-hiragana-progress-v2", JSON.stringify({ "あ": { seen: 1 } }));
  w.eval(fs.readFileSync(BUNDLE, "utf8"));
  await new Promise(r => setTimeout(r, 1500));

  console.log("\nACCOUNTS — unconfigured build");
  const all = () => [...w.document.querySelectorAll("button")];

  if (!all().length) {
    fail("ACCOUNTS: the app rendered no buttons at all — App.jsx did not mount");
  } else {
    all().find(x => x.getAttribute("aria-label") === "Menu")?.click();
    await new Promise(r => setTimeout(r, 300));
    const entry = all().find(b => (b.textContent || "").trim() === "Account");
    if (!entry) {
      fail("ACCOUNTS: no Account entry in the drawer");
    } else {
      console.log("  drawer offers Account");
      entry.click();
      await new Promise(r => setTimeout(r, 500));
      const dlg = [...w.document.querySelectorAll('[role="dialog"]')]
        .find(d => d.getAttribute("aria-label") === "Account");
      if (!dlg) {
        fail("ACCOUNTS: tapping Account opened nothing");
      } else {
        const text = (dlg.textContent || "");
        console.log(`  dialog opens → ${text.length} chars`);
        const explained = /not switched on|Accounts are not/i.test(text);
        console.log(`  unconfigured build → ${explained ? "explained to the learner ok" : "❌ SILENT"}`);
        if (!explained) {
          fail("ACCOUNTS: unconfigured build says nothing — indistinguishable from broken");
        }
        // And it must not offer a sign-in it cannot perform.
        if (dlg.querySelector('input[type="email"]')) {
          fail("ACCOUNTS: unconfigured build still offers an email field");
        }

        // ————— BACKUP: BOTH HALVES, IN ONE PLACE (Session 24) —————
        // ⚠️ THE ASSERTION IS THAT THEY ARE TOGETHER, not merely that each
        // exists. Save and Restore were split across two screens for one
        // commit — a backup you take on one screen and put back on another is
        // not a feature, it is two loose ends, and BOTH halves passed their own
        // check the whole time. So this looks in one element for both.
        //
        // Not gated on being signed in: a learner with no account is exactly
        // the one whose progress lives in a single browser.
        const hasSave = /Save to a file/i.test(text);
        const hasRestore = /Restore from a file/i.test(text);
        if (!hasSave || !hasRestore) {
          fail(`ACCOUNTS: backup is incomplete here — save:${hasSave} restore:${hasRestore}. ` +
               "Both halves belong in Account, together.");
        } else console.log("  backup: save and restore, both here, unsigned-in");
        const close = [...dlg.querySelectorAll("button")]
          .find(b => b.getAttribute("aria-label") === "Close");
        if (!close) fail("ACCOUNTS: dialog has no close control");
        else {
          close.click();
          await new Promise(r => setTimeout(r, 300));
          const still = [...w.document.querySelectorAll('[role="dialog"]')]
            .find(d => d.getAttribute("aria-label") === "Account");
          if (still) fail("ACCOUNTS: dialog would not close");
          else console.log("  dialog closes ok");
        }
      }
    }

    // ————— PROGRESS, ITS OWN DESTINATION (Session 24) —————
    // It was a tab inside the Account dialog. Two things have to be true now
    // and neither is implied by the other: it must be reachable as a PLACE
    // from the drawer, and the Account dialog must no longer be the way in.
    console.log("\nPROGRESS — its own destination");
    all().find(x => x.getAttribute("aria-label") === "Menu")?.click();
    await new Promise(r => setTimeout(r, 300));
    const prog = all().find(b => (b.textContent || "").trim().startsWith("Progress"));
    if (!prog) {
      fail("PROGRESS: no Progress entry in the drawer — it is unreachable");
    } else {
      console.log("  drawer offers Progress, among the destinations");
      prog.click();
      await new Promise(r => setTimeout(r, 600));
      const main = w.document.querySelector("main");
      const t = (main?.textContent || "");
      console.log(`  rendered ${t.length} chars`);
      // It is a page, not a dialog. If PROGRESS'S OWN CONTENT is inside a
      // modal the move did not happen — it was only relabelled.
      //
      // ⚠️ Scoped to Progress's own content on purpose. The first version asked
      // whether ANY modal was open, which passed only because nothing had been
      // started yet: seed a section and the once-a-day Goals dialog opens
      // itself, and the assertion "failed" over a dialog it was never about.
      const inModal = [...w.document.querySelectorAll('[role="dialog"][aria-modal="true"]')]
        .some(d => /WHAT YOU CAN DO/.test(d.textContent || ""));
      if (inModal) {
        fail("PROGRESS: its content is inside a dialog — it is still modal");
      }
      if (t.length < MIN_VIEW) fail("PROGRESS: rendered almost nothing");
      for (const [needle, why] of [
        ["WHAT YOU CAN DO", "the capability list is missing"],
        ["WHAT YOU HAVE WRITTEN", "the connection to the checked sentences is missing"],
        ["START A SECTION AGAIN", "the reset did not come across with it"],
      ]) {
        if (!t.includes(needle)) fail(`PROGRESS: ${why}`);
      }
      // A learner with no history must be told where the sentences come from,
      // not shown an empty box.
      if (!/Nothing checked yet/i.test(t)) {
        fail("PROGRESS: the empty state does not explain what would appear here");
      }
      console.log("  capability list, checked-sentence link and reset all present");
      // The header must name the place. `current` falls back to MODULES[0] for
      // any id it does not know, which would have written "Hiragana" above it.
      const header = w.document.querySelector("header")?.textContent || "";
      if (!header.includes("Progress")) {
        fail("PROGRESS: the header does not name it — it inherits a module's title");
      } else console.log("  header names it ok");

      // ————— SAVE/RESTORE, RETIRED AS FURNITURE (Session 24) —————
      // The pair used to sit in the header on every screen and again under the
      // sign-in panel. Accounts do that job now. Two things have to hold, and
      // the second is the one that would quietly break:
      //
      //   1. the routine surfaces are gone
      //   2. ⚠️ THE SAVE OFFERED AT THE DANGER POINTS STILL EXISTS. Two Save
      //      buttons remain, at the two moments something can be overwritten —
      //      the sign-in conflict and the reset. They are shortcuts to the same
      //      download Account offers; if one goes, that path silently loses its
      //      only undo while every other button still works.
      if (/\bSave\b|\bRestore\b/.test(header)) {
        fail("PROGRESS: the header still carries Save/Restore — they were retired");
      } else console.log("  header no longer carries Save/Restore");

      // Restore is NOT here. It belongs beside the Save it undoes, in Account
      // under BACKUP — the version of this that put a lone restore button on
      // this screen is the split the Account check above is guarding against.
      const t2 = (w.document.querySelector("main")?.textContent || "");
      if (/Restore from a file/i.test(t2)) {
        fail("PROGRESS: a lone Restore is here — backup belongs in Account, whole");
      } else console.log("  no lone Restore here — backup lives in Account");

      // And the Save it is the counterpart to, at the moment of danger.
      // "Clear selected…" is disabled until something IS selected, so the
      // checkbox has to be ticked first — the first version of this check
      // clicked a disabled button and reported the confirm unreachable.
      const box = [...w.document.querySelectorAll('input[type="checkbox"]')]
        .find(c => !c.disabled);
      if (box) {
        box.click();
        await new Promise(r => setTimeout(r, 200));
      }
      const anyStarted = all().find(b => b.textContent === "Clear selected…");
      if (anyStarted && !anyStarted.disabled) {
        anyStarted.click();
        await new Promise(r => setTimeout(r, 250));
        const t3 = (w.document.querySelector("main")?.textContent || "");
        if (!/Save a copy first/i.test(t3)) {
          fail("PROGRESS: the reset confirm no longer offers a save — the reset " +
               "became unrecoverable");
        } else console.log("  the reset confirm still offers a save");
      } else {
        fail("PROGRESS: the reset confirm could not be reached — a section is " +
             "seeded as started precisely so this assertion runs");
      }
    }

    // And it is gone from where it used to live.
    all().find(x => x.getAttribute("aria-label") === "Menu")?.click();
    await new Promise(r => setTimeout(r, 300));
    all().find(b => (b.textContent || "").trim() === "Account")?.click();
    await new Promise(r => setTimeout(r, 500));
    const acct = [...w.document.querySelectorAll('[role="dialog"]')]
      .find(d => d.getAttribute("aria-label") === "Account");
    if (acct && /WHAT YOU CAN DO|START A SECTION AGAIN/.test(acct.textContent || "")) {
      fail("PROGRESS: the Account dialog still carries the progress tab — it was copied, not moved");
    } else {
      console.log("  Account no longer carries it");
    }
  }
  if (errors.length) fail("ACCOUNTS: console errors — " + errors.slice(0, 2).join(" | "));
}


// ————— DICTIONARY (Session 34) —————
// The module, the lookup drawer, the send to Vocabulary, and the week it can
// keep. fetch serves the REAL shards from public/dict — a stubbed dictionary
// would test the stub. What must hold:
//   · the header opens the drawer from anywhere; search works in kana, kanji
//     and English; the top result is marked MOST COMMON and 行く beats 囲碁
//   · an entry highlights its first sense as MOST COMMON MEANING
//   · an inflected form (食べた) finds its dictionary form
//   · a lesson's lookup event lands with the curated card ABOVE the entry
//   · a kanji request shows the words containing it
//   · the EDRDG credit is on screen (the licence requires it)
//   · Send to Vocabulary writes my-words, and Vocabulary shows "Your words"
//   · practising sent words shows as the alternative weekly goal in Goals
if (!ONLY.length || ONLY.includes("dictionary")) {
  modulesRun++;
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>',
    { runScripts: "outside-only", pretendToBeVisual: true, url: "http://localhost/" });
  const w = dom.window;
  const errors = [];
  w.HTMLCanvasElement.prototype.getContext = () => new Proxy({
    canvas: { width: 300, height: 300 }, measureText: () => ({ width: 0 }),
  }, { get: (t, k) => (k in t ? t[k] : () => {}), set: (t, k, v) => { t[k] = v; return true; } });
  // fileURLToPath, not .pathname: the repo folder has spaces in its name, and
  // .pathname keeps them as %20 — every shard then "does not exist".
  const PUB = fileURLToPath(new URL("../public", import.meta.url));
  w.fetch = (u) => {
    const s = String(u);
    const f = PUB + s;
    if (s.startsWith("/dict/") && fs.existsSync(f)) {
      const txt = fs.readFileSync(f, "utf8");
      return Promise.resolve({ ok: true, status: 200, json: async () => JSON.parse(txt) });
    }
    return Promise.resolve({ ok: false, status: 404 });
  };
  w.console.error = (...a) => {
    const t = a.join(" ");
    if (!/Not implemented|jsdom|Could not parse CSS/i.test(t)) errors.push(t);
  };
  w.console.warn = () => {};
  w.addEventListener("error", e => errors.push("UNCAUGHT: " + (e.error?.message || e.message)));
  const now = Date.now();
  w.localStorage.setItem("tsumiki-hiragana-progress-v2", JSON.stringify({ "h-a": { seen: true } }));
  // One word sent an hour ago, practised twice since — and one visit from
  // BEFORE it was sent, which must not count.
  w.localStorage.setItem("tsumiki-my-words-v1", JSON.stringify(
    [{ w: "経験", r: "けいけん", m: "experience", id: 1251270, at: now - 3600e3 }]));
  w.localStorage.setItem("tsumiki-known-words-v1", JSON.stringify({ "経験": {
    written: [], exposures: 3, sentences: 0, visits: 3, stage: 1, due: now + 86400e3,
    log: [{ t: now - 7200e3, via: "interval" }, { t: now - 1800e3, via: "interval" }, { t: now - 900e3, via: "interval" }],
  } }));
  w.eval(fs.readFileSync(BUNDLE, "utf8"));
  await new Promise(r => setTimeout(r, 2500));
  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  const all = () => [...w.document.querySelectorAll("button")];
  const dlg = (label) => [...w.document.querySelectorAll('[role="dialog"]')].find(d => d.getAttribute("aria-label") === label);
  const type = async (input, v) => {
    Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set.call(input, v);
    input.dispatchEvent(new w.Event("input", { bubbles: true }));
    await wait(900);
  };

  console.log("\nDICTIONARY — the module, the drawer, and the week");

  // The week first: the Goals dialog opens itself on this first visit.
  const g = dlg("Goals");
  if (!g) fail("DICTIONARY: Goals did not open, so the own-words line could not be checked");
  else {
    await wait(600);
    const gt = g.textContent || "";
    if (!/words of your own — 2 so far/.test(gt)) {
      fail("DICTIONARY: Goals does not show own-word practice as 2 (one visit predates the send and must not count) — got: " +
           (gt.match(/Or practise[^.]*/) || ["(no own-words line)"])[0]);
    } else console.log("  Goals: own-word practice counted, pre-send visit excluded");
    [...g.querySelectorAll("button")].find(b => b.getAttribute("aria-label") === "Close")?.click();
    await wait(300);
  }

  // Tatami rework: the header 辞 button went; the じしょ edge tab on every
  // screen is now the one dictionary control in the chrome, so it carries this.
  const hdr = all().find(b => b.getAttribute("aria-label") === "Open the dictionary");
  if (!hdr) { fail("DICTIONARY: no edge tab — the dictionary is not reachable from every screen"); }
  else {
    hdr.click();
    await wait(1200);
    const d = dlg("Dictionary");
    if (!d) fail("DICTIONARY: the edge tab did not open the lookup drawer");
    else {
      console.log("  edge tab opens the drawer");
      const input = d.querySelector("input");
      await type(input, "たべる");
      if (process.env.SMOKE_DEBUG) console.log("DEBUG dict:", (d.textContent || "").slice(0, 400), "| input=", input?.value);
      const first = [...d.querySelectorAll("button")].find(b => /食べる/.test(b.textContent || ""));
      if (!first || !/MOST COMMON/.test(first.textContent)) fail("DICTIONARY: たべる did not put 食べる first, marked MOST COMMON");
      else {
        console.log("  kana search: 食べる first, marked MOST COMMON");
        first.click();
        await wait(700);
        const et = d.textContent || "";
        if (!/MOST COMMON MEANING/.test(et) || !/to eat/.test(et)) fail("DICTIONARY: the entry does not highlight its first sense");
        else console.log("  entry: first sense highlighted as MOST COMMON MEANING");
        const send = [...d.querySelectorAll("button")].find(b => b.textContent === "Send to Vocabulary");
        if (!send) fail("DICTIONARY: no Send to Vocabulary on an entry");
        else {
          send.click();
          await wait(400);
          const mine = JSON.parse(w.localStorage.getItem("tsumiki-my-words-v1") || "[]");
          if (!mine.some(x => x.w === "食べる")) fail("DICTIONARY: Send to Vocabulary did not write my-words");
          else if (!/In your words/.test(d.textContent)) fail("DICTIONARY: the entry does not show it was sent");
          else console.log("  send: written to my-words, entry shows it");
        }
      }
      await type(d.querySelector("input"), "go");
      const goTop = [...d.querySelectorAll("button")].find(b => /MOST COMMON/.test(b.textContent || ""));
      if (!goTop || !/行く/.test(goTop.textContent)) fail("DICTIONARY: English \"go\" did not put 行く first — got " + (goTop?.textContent || "nothing"));
      else console.log("  English search: go → 行く first");
      await type(d.querySelector("input"), "食べた");
      if (!/looks like a form of/.test(d.textContent) || !/食べる/.test(d.textContent)) fail("DICTIONARY: 食べた did not find 食べる");
      else console.log("  deinflection: 食べた → 食べる");
      if (!/Electronic Dictionary Research/.test(d.textContent)) fail("DICTIONARY: the EDRDG credit is not on screen — the licence requires it");
      else console.log("  credit line present");
    }

    // A lesson's word: the protocol grammar, kanji and checker all speak.
    w.dispatchEvent(new w.CustomEvent("tsumiki:lookup", { detail: { q: "経験", curated: { w: "経験", r: "けいけん", m: "experience" } } }));
    await wait(1200);
    const d2 = dlg("Dictionary");
    const t2 = d2?.textContent || "";
    if (!/FROM YOUR LESSONS/.test(t2) || !/MOST COMMON MEANING/.test(t2)) fail("DICTIONARY: a lesson's lookup did not show the curated card above the opened entry");
    else if (t2.indexOf("FROM YOUR LESSONS") > t2.indexOf("MOST COMMON MEANING")) fail("DICTIONARY: the curated card is BELOW the dictionary entry");
    else console.log("  lesson lookup: curated card above the auto-opened entry");

    w.dispatchEvent(new w.CustomEvent("tsumiki:lookup", { detail: { kanji: "験", q: "" } }));
    await wait(900);
    const t3 = dlg("Dictionary")?.textContent || "";
    if (!/WORDS WITH 験/.test(t3) || !/試験/.test(t3)) fail("DICTIONARY: a kanji request did not show the words containing it");
    else console.log("  kanji request: words with 験 listed");
    [...(dlg("Dictionary")?.querySelectorAll("button") || [])].find(b => b.getAttribute("aria-label") === "Close dictionary")?.click();
    await wait(300);
    if (dlg("Dictionary")) fail("DICTIONARY: the drawer would not close");
  }

  // As a page, from the menu — and Vocabulary picks the sent words up.
  all().find(x => x.getAttribute("aria-label") === "Menu")?.click();
  await wait(300);
  all().find(b => (b.textContent || "").trim().startsWith("Dictionary"))?.click();
  await wait(1200);
  const pt = w.document.querySelector("main")?.textContent || "";
  if (!/Look up a word in Japanese or English/.test(pt)) fail("DICTIONARY: the page did not render from the menu");
  else console.log("  page renders from the menu");
  all().find(x => x.getAttribute("aria-label") === "Menu")?.click();
  await wait(300);
  all().find(b => (b.textContent || "").trim().startsWith("Vocabulary"))?.click();
  await wait(1500);
  const vt = w.document.querySelector("main")?.textContent || "";
  if (!/Your words/.test(vt) || !/食べる/.test(vt)) fail("VOCABULARY: sent words do not appear under Your words");
  else console.log("  vocabulary: sent words appear under Your words");

  // ————— the pull-out handle (Session 34) —————
  // Vocabulary is on screen at this point, so its words carry data-lookup and
  // the drawer must lead with them rather than with an empty search box.
  {
    const handle = all().find(b => b.getAttribute("aria-label") === "Open the dictionary");
    if (!handle) fail("DICTIONARY: no pull-out handle — the drawer can only be opened by tapping a word");
    else {
      handle.click();
      await wait(1200);
      const d = dlg("Dictionary");
      const t = d?.textContent || "";
      if (!d) fail("DICTIONARY: the handle did not open the drawer");
      else if (!/ON THIS SCREEN/.test(t)) fail("DICTIONARY: the handle opened the drawer without the words that are on screen");
      else if (!d.querySelector("input")) fail("DICTIONARY: no search box at the top of the drawer");
      else {
        const chips = [...d.querySelectorAll("button")].filter(b => /^[\u3040-\u30ff\u3400-\u9fff]+$/.test((b.textContent || "").trim()));
        if (!chips.length) fail("DICTIONARY: ON THIS SCREEN is empty while words are visible behind the drawer");
        else {
          console.log(`  handle: opens the drawer, ${chips.length} word(s) on this screen`);
          const word = (chips[0].textContent || "").trim();
          chips[0].click();
          await wait(1100);
          if (!(dlg("Dictionary")?.querySelector("input") || {}).value) fail("DICTIONARY: tapping an on-screen word did not search for it");
          else console.log(`  handle: tapping ${word} searches for it`);
        }
      }
      [...(dlg("Dictionary")?.querySelectorAll("button") || [])].find(b => b.getAttribute("aria-label") === "Close dictionary")?.click();
      await wait(300);
      if (!all().find(b => b.getAttribute("aria-label") === "Open the dictionary")) {
        fail("DICTIONARY: the handle did not come back after the drawer closed");
      } else console.log("  handle: returns when the drawer closes");
    }
  }

  if (errors.length) fail("DICTIONARY: console errors — " + errors.slice(0, 2).join(" | "));
}

console.log("\n" + "─".repeat(60));
if (failures.length) {
  console.log(`FAILED — ${failures.length} problem${failures.length > 1 ? "s" : ""}:`);
  for (const f of failures) console.log("  ✗ " + f);
  process.exitCode = 1;
} else {
  console.log(`PASSED — ${modulesRun} module${modulesRun === 1 ? "" : "s"}${ONLY.length ? " (SMOKE_ONLY subset)" : ""}, every required view rendered.`);
}
