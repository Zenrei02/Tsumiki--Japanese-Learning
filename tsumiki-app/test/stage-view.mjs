// Stage-view test — the two interactive paths added in Session 17.
//
// WHY IT IS SEPARATE FROM smoke.mjs. smoke.mjs walks every module and cannot finish
// inside the Cowork sandbox's 45-second command cap, so it is run in slices. These two
// features are also not "does the view render" checks — they are conditional UI whose
// whole point is that it shows DIFFERENT things to different learners, which a walk-through
// test structurally cannot see: it only ever visits one branch.
//
//   1. THE STAGE GREETING. Three branches — you started here, you looked ahead, you earned
//      it — and the one that matters is the third. A test that only ever opens Stage 1 with
//      empty progress would pass forever while the earned congratulation was broken.
//
//   2. SPINE MODE. The returning learner sees compositions and checkpoints only. The
//      failure mode to guard against is not a crash, it is showing the wrong SET — too
//      much (the filter silently not applying) or too little (a step with no composition
//      in it rendering as an empty box with no way out). Both look fine to a render check.
//
// RUN:  node test/stage-view.mjs          (bundle at /tmp/test-bundle.js)
//       SMOKE_BUNDLE=$HOME/test-bundle.js node test/stage-view.mjs
// Exits nonzero on any failure.

import { JSDOM } from "jsdom";
import fs from "fs";
import { fileURLToPath } from "url";

const BUNDLE = process.env.SMOKE_BUNDLE || "/tmp/test-bundle.js";
const MODULE_SRC = fileURLToPath(new URL("../../grammar-module.jsx", import.meta.url));

// Same freshness gate as smoke.mjs, for the same reason: a stale bundle reads green.
{
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
    console.error(`REFUSING TO RUN: bundle at ${BUNDLE} is older than ${stale.length} source file(s):`);
    for (const s of stale.slice(0, 8)) console.error("  " + s);
    process.exit(2);
  }
}

// Every lesson id, read out of the module rather than hardcoded — the same discipline the
// checkers use. Seeding all of them is what makes "the previous stage is complete" true.
const src = fs.readFileSync(MODULE_SRC, "utf8");
const ALL_IDS = [...src.matchAll(/id: "([a-z0-9-]+)", jp: "/g)].map((m) => m[1]);
const DONE_ALL = Object.fromEntries(
  ALL_IDS.map((id) => [id, { quizBest: 1, practiced: true, read: true, built: true }])
);

const failures = [];
const fail = (m) => { failures.push(m); console.log("  ✗ " + m); };
const ok = (m) => console.log("  ✓ " + m);

async function boot({ progress, depth } = {}) {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>',
    { runScripts: "outside-only", pretendToBeVisual: true, url: "http://localhost/" });
  const w = dom.window;
  w.HTMLCanvasElement.prototype.getContext = () => new Proxy({ canvas: {} }, { get: () => () => {} });
  w.fetch = () => Promise.resolve({ ok: false, status: 404 });
  w.console.warn = () => {};
  w.localStorage.setItem("tsumiki-last-module", "grammar");
  if (progress) w.localStorage.setItem("tsumiki-n5-progress-v1", JSON.stringify(progress));
  if (depth) w.localStorage.setItem("tsumiki-learner-depth-v1", depth);
  w.eval(fs.readFileSync(BUNDLE, "utf8"));
  await new Promise((r) => setTimeout(r, 2200));
  const btns = () => [...w.document.querySelectorAll("button")];
  const text = () => w.document.querySelector("#root")?.textContent || "";
  const click = async (b, ms = 700) => { b.click(); await new Promise((r) => setTimeout(r, ms)); };
  // Boot lands on Home. Open Grammar from the "pick up where you left off" card.
  const enter = btns().find((b) => /PICK UP WHERE YOU LEFT OFF|LAST VISITED/.test(b.textContent || "")
    && /Grammar/.test(b.textContent || ""));
  if (!enter) throw new Error("could not find a way into Grammar from Home");
  await click(enter, 1200);
  const stageCard = (n) => btns().find((b) =>
    (b.className || "").includes("level-card") && !b.disabled &&
    !/Review challenge/.test(b.textContent || "") &&
    (b.textContent || "").trim().startsWith(String(n)));
  return { w, btns, text, click, stageCard };
}

// ————— 1. the greeting, all three branches —————
console.log("\nSTAGE GREETING");
{
  const { text, click, stageCard } = await boot();
  await click(stageCard(1));
  if (/This is where it starts/.test(text())) ok("Stage 1, nothing done → the opening greeting");
  else fail("Stage 1 did not show the opening greeting");
}
{
  const { text, click, stageCard } = await boot();
  await click(stageCard(8));
  if (/Looking ahead/.test(text())) ok("Stage 8, nothing done → the quiet 'looking ahead' note");
  else fail("Stage 8 with no progress did not show the looking-ahead note");
  if (/is complete\./.test(text())) fail("Stage 8 congratulated a learner who earned nothing");
}
{
  const { text, click, btns, stageCard, w } = await boot({ progress: DONE_ALL });
  await click(stageCard(8));
  const t = text();
  if (/Stage 7 · Nuance and other minds is complete\./.test(t)) ok("Stage 8, Stage 7 finished → the earned congratulation, naming it");
  else fail("Stage 8 did not congratulate a learner who finished Stage 7");
  if (/JLPT N4 syllabus/.test(t)) ok("the milestone in the previous stage is named in the congratulation");
  else fail("Stage 7 ends with ms-n4 but the congratulation did not mention N4");

  // Dismissal has to stick, or the banner nags on every visit.
  const got = btns().find((b) => (b.textContent || "").trim() === "Got it");
  if (!got) { fail("no way to dismiss the greeting"); }
  else {
    await click(got);
    if (/is complete\./.test(text())) fail("greeting survived its own dismiss button");
    const saved = JSON.parse(w.localStorage.getItem("tsumiki-n5-progress-v1") || "{}");
    if (saved._stageGreet && saved._stageGreet.S8 === "earned") ok("dismissal recorded as 'earned', so a later peek can't downgrade it");
    else fail("dismissal was not written to progress — the banner will return");
  }
}

// ————— 2. spine mode —————
console.log("\nSPINE MODE");
{
  const { text, btns, click, stageCard } = await boot();
  const askedFirst = /How much Japanese do you already have/.test(text());
  if (askedFirst) ok("an unanswered learner is asked, on the stage picker");
  else fail("the depth question never appeared");
  const exp = btns().find((b) => /I've studied before/.test(b.textContent || ""));
  if (!exp) { fail("no 'I've studied before' option"); }
  else {
    await click(exp);
    if (/How much Japanese/.test(text())) fail("the question stayed up after being answered");
    await click(stageCard(4));
    const t = text();
    if (/Showing the spine of this stage/.test(t)) ok("Stage 4 opens on its spine");
    else fail("spine explainer missing after choosing the experienced path");
    // The set, not just the presence of a filter: compositions and the checkpoint in,
    // ordinary grammar lessons out.
    const rows = btns().filter((b) => (b.className || "").includes("point-row"));
    const labels = rows.map((r) => (r.textContent || "").trim());
    const comps = labels.filter((l) => /Composition/.test(l)).length;
    const grammarRows = labels.filter((l) => /^\d+GM/.test(l)).length;
    if (comps > 0) ok(`compositions shown (${comps})`);
    else fail("spine mode showed no compositions at all");
    if (grammarRows === 0) ok("ordinary grammar lessons folded away");
    else fail(`spine mode leaked ${grammarRows} grammar lesson row(s)`);
    if (labels.some((l) => /復習/.test(l))) ok("the checkpoint is in the spine");
    else fail("spine mode hid the checkpoint");
    // And it must be possible to get back to everything.
    const open = btns().find((b) => /See everything in this step/.test(b.textContent || ""));
    if (!open) { fail("no way to expand a step back to its full contents"); }
    else {
      await click(open);
      const after = btns().filter((b) => (b.className || "").includes("point-row"));
      if (after.length > rows.length) ok(`expanding a step reveals the rest (${rows.length} → ${after.length} rows)`);
      else fail("expanding a step revealed nothing");
    }
  }
}
{
  // Stage 8 has three steps with no composition and no checkpoint in them. Folded, those
  // steps render an empty body — the learner has to still have a way in.
  const { text, btns, click, stageCard } = await boot({ depth: "spine" });
  await click(stageCard(8));
  const t = text();
  if (/no writing in it/.test(t)) ok("a step with no composition still offers a way inside");
  else fail("Stage 8's writing-free steps render with no way to open them");
  if (/shortest stage in the course, and that is the design/.test(t)) ok("Stage 8's pace note explains its size to the learner");
  else fail("Stage 8's pace note is missing");
}

console.log(failures.length ? `\nFAILED — ${failures.length} problem(s)` : "\nPASSED — all stage-view checks");
process.exit(failures.length ? 1 : 0);
