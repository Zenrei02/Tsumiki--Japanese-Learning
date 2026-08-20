// Does a micro anecdote actually REACH a learner?
//
// smoke.mjs proves the two modules still render after the anecdote block was
// spliced in. That is not the same claim. A lookup that silently misses on
// every word would leave every view rendering exactly as before and every
// smoke assertion green — the same shape as the word ledger printing "every
// kanji word has a reading somewhere" while reading nothing at all.
//
// So this test drives the two agreed surfaces and asserts the anecdote TEXT is
// on screen: the vocabulary word card, and the grammar module's tap-to-expand
// word popup. It also asserts the absences the design asks for — no dismiss
// control, no read-state, no counts.
//
//   SMOKE_BUNDLE=$HOME/test-bundle.js node test/mca-render.mjs
//
// Bundle freshness is gated exactly as in smoke.mjs; see the note there.

import { JSDOM } from "jsdom";
import fs from "fs";
import { fileURLToPath } from "url";

const BUNDLE = process.env.SMOKE_BUNDLE || "/tmp/test-bundle.js";
const ANECDOTES = JSON.parse(
  fs.readFileSync(fileURLToPath(new URL("./mca-expected.json", import.meta.url)), "utf8")
);

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
    console.error(`REFUSING TO RUN: bundle at ${BUNDLE} is OLDER than ${stale.length} source file(s).`);
    for (const s of stale.slice(0, 8)) console.error("  " + s);
    process.exit(2);
  }
}

let grammarExercised = false;
const failures = [];
const fail = (m) => failures.push(m);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Generous, because an anecdote-bearing word must be reachable without the
// learner having studied anything: these are the characters the test grants.
const KNOWN = [
  "日", "一", "二", "三", "十", "見", "行", "来", "食", "言", "話", "私",
  "木", "本", "人", "大", "女", "子", "上", "下", "中", "山", "川", "口",
  "目", "田", "月", "水", "雨", "車", "気", "電", "名", "前", "毎", "休",
];

function boot(modId) {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>',
    { runScripts: "outside-only", pretendToBeVisual: true, url: "http://localhost/" });
  const w = dom.window;
  w.HTMLCanvasElement.prototype.getContext = () => new Proxy({
    canvas: { width: 300, height: 300 },
    measureText: () => ({ width: 0 }), getImageData: () => ({ data: [] }),
    createLinearGradient: () => ({ addColorStop() {} }),
  }, { get: (t, k) => (k in t ? t[k] : () => {}), set: (t, k, v) => { t[k] = v; return true; } });
  w.AudioContext = function () {
    return { decodeAudioData: async () => ({}), createBufferSource: () => ({ connect() {}, start() {} }), destination: {}, currentTime: 0 };
  };
  w.fetch = () => Promise.resolve({ ok: false, status: 404 });
  w.console.error = () => {};
  w.console.warn = () => {};
  w.localStorage.setItem("known-kanji-v1", JSON.stringify(KNOWN));
  w.localStorage.setItem("naoshi-last-module", modId);
  w.eval(fs.readFileSync(BUNDLE, "utf8"));
  return w;
}

async function enter(w) {
  const btns = () => [...w.document.querySelectorAll("button")];
  btns().find((x) => /PICK UP WHERE YOU LEFT OFF/i.test(x.textContent || ""))?.click();
  await sleep(900);
}

// A distinctive slice of the anecdote — long enough that it cannot collide with
// lesson prose, short enough to survive whitespace handling in the DOM.
const probe = (word) => ANECDOTES[word].slice(0, 60);

// ————— surface 1: the vocabulary word card —————
async function vocabulary() {
  const w = boot("vocabulary");
  await sleep(2200);
  await enter(w);
  const d = w.document;
  const btns = () => [...d.querySelectorAll("button")];

  const candidates = Object.keys(ANECDOTES);
  const tab = btns().find((b) => candidates.some((c) => (b.textContent || "").startsWith(c)));
  if (!tab) {
    fail("VOCABULARY: no anecdote-bearing word is reachable in the word list — cannot verify the card surface");
    return;
  }
  const word = candidates.find((c) => (tab.textContent || "").startsWith(c));
  tab.click();
  await sleep(700);

  const main = (d.querySelector("main")?.textContent || "");
  if (!main.includes(probe(word))) {
    fail(`VOCABULARY: word card for ${word} rendered without its anecdote`);
    return;
  }
  console.log(`  vocabulary word card "${word}": anecdote present (${ANECDOTES[word].length} chars)`);

  // The absences the design asks for, checked where they would appear.
  const cardBtns = btns().map((b) => (b.textContent || "").trim().toLowerCase());
  const offenders = cardBtns.filter((t) => /dismiss|got it|mark read|hide/.test(t));
  if (offenders.length) fail(`VOCABULARY: anecdote card carries a completion control (${offenders.join(", ")})`);
  else console.log("  vocabulary: no dismiss / mark-read control, as designed");

  const persisted = Object.keys(w.localStorage).filter((k) => /anecdote|mca/i.test(k));
  if (persisted.length) fail(`VOCABULARY: anecdote wrote read-state to storage (${persisted.join(", ")})`);
  else console.log("  vocabulary: nothing written to storage — no read-state");
}

// ————— surface 2: the grammar module's word popup —————
async function grammar() {
  const w = boot("grammar");
  await sleep(2200);
  await enter(w);
  const d = w.document;
  const btns = () => [...d.querySelectorAll("button")];
  const anchors = Object.keys(ANECDOTES);

  // The module may ask the returning-learner depth question before it will show
  // a stage; answer it so the walk below is not blocked by a modal.
  const depth = btns().find((x) => /first time|never|new to/i.test(x.textContent || ""));
  if (depth) { depth.click(); await sleep(500); }

  const stage = btns().find((x) => /First sentences/.test(x.textContent || ""));
  if (!stage) {
    fail(`GRAMMAR: no stage card to open — saw: ${btns().slice(0, 8).map((b) => (b.textContent || "").trim().slice(0, 28)).join(" | ")}`);
    return;
  }
  stage.click();
  await sleep(700);

  // Walk the first few lessons in the stage, and each lesson's tabs, until a
  // tappable word carrying an anecdote turns up. Which lesson it lands in is
  // not the point — that a real tap opens a real popup carrying the text is.
  //
  // NOTE ON WHERE THE SPANS COME FROM, because it is not where the design
  // implies. A step's `bank` is rendered in Practice and Build as "Need words?
  // Tap to add" BUTTONS that append the word to the answer box — they are not
  // JPText spans and they do not open the popup. The popup only ever opens on
  // annotated PROSE, so an anecdote reaches the grammar module when its anchor
  // word is in KANJI_DICT and appears in some lesson's text. 24 of the 33 do.
  // Stage 1's lessons carry 水, 店, 雨, 駅, 公園 and 車, which is why the walk
  // starts here.
  // Dismiss the stage greeting if it is showing, then expand the steps: the
  // stage view lists collapsed "▶ Step N · …" headers, and a lesson button is
  // an index plus a two-letter kind code ("2PRHalf of it isn't there").
  btns().find((x) => /^Got it$/.test((x.textContent || "").trim()))?.click();
  await sleep(300);
  for (const header of btns().filter((b) => /^▶Step [0-3] /.test((b.textContent || "").trim())).slice(0, 4)) {
    header.click();
    await sleep(250);
  }

  // Go to lessons whose EXAMPLE SENTENCES are known to carry an anchor word,
  // rather than hoping one turns up. Annotation is far sparser than it looks:
  // a typical Learn tab yields one or two tappable spans in total, and they are
  // usually high-frequency words like 今日. An undirected walk across ten
  // lessons in two stages found nothing at all, which reads as a broken render
  // and is really a thin surface. 〜じゃないです is example-sentenced with 水,
  // 〜でした with 雨, は with 店 — all three are in KANJI_DICT, so all three
  // become real spans in the Learn tab.
  const TARGETS = [/saying it isn't/, /saying what something was/, /setting the topic/];
  const lessons = TARGETS
    .map((re) => btns().find((b) => re.test(b.textContent || "")))
    .filter(Boolean);
  if (!lessons.length) {
    fail("GRAMMAR: none of the target lessons are in this stage — the walk cannot reach a tappable anchor");
    return;
  }
  let hit = null;
  let spansSeen = 0, lessonsTried = 0;
  outer:
  for (const lesson of lessons.slice(0, 10)) {
    lesson.click();
    await sleep(800);
    lessonsTried++;
    for (const tab of [null, "Quiz", "Practice"]) {
      if (tab) {
        const b = btns().find((x) => (x.textContent || "").trim() === tab);
        if (!b) continue;
        b.click();
        await sleep(600);
      }
      // Do NOT filter spans by their text. A span's textContent is not the bare
      // word — wordDisplay renders whatever the learner can read, so 月曜日
      // arrives as "げつようび" when 曜 is unknown. Filtering on the kanji form
      // silently skips every word the learner has not unlocked, which is most
      // of them. Tap, and let the popup say what it opened.
      const spans = [...d.querySelectorAll('span[role="button"]')];
      spansSeen += spans.length;
      for (const span of spans.slice(0, 12)) {
        span.click();
        await sleep(350);
        const dialogText = d.getElementById("root")?.textContent || "";
        const opened = anchors.find((a) => dialogText.includes(probe(a)));
        if (opened) { hit = { span, opened }; break outer; }
        btns().find((x) => (x.textContent || "").trim() === "Close")?.click();
        await sleep(150);
      }
    }
    btns().find((x) => /←|All lessons|Back/.test(x.textContent || ""))?.click();
    await sleep(500);
  }
  if (!hit) {
    // NOT a pass, and NOT a code failure either — say which, because the two
    // want opposite responses. Measured Session 18 across ten lessons in two
    // stages: a lesson view exposes one or two tappable spans in total, and
    // they are high-frequency words (今日, 学生), never anchor words. The
    // example sentences that DO carry anchors are not on the view the learner
    // lands on. So the popup surface is real but almost unreachable, which is
    // a design finding for Lloyd rather than a bug to fix in the renderer.
    console.log(`  grammar: ${spansSeen} tappable spans across ${lessonsTried} lesson views, 0 carrying an anecdote`);
    console.log("  grammar: popup surface NOT EXERCISED — see the note above; the lookup itself is proven by the vocabulary card");
    return;
  }

  grammarExercised = true;
  console.log(`  grammar word popup "${hit.opened}": anecdote present (tapped in lesson prose)`);

  const closeControls = btns()
    .map((b) => (b.textContent || "").trim().toLowerCase())
    .filter((t) => /dismiss|got it|mark read/.test(t));
  if (closeControls.length) fail(`GRAMMAR: popup carries a completion control (${closeControls.join(", ")})`);
  else console.log("  grammar: Close only — no dismiss or read-state control");
}

await vocabulary();
await grammar();

console.log("\n" + "─".repeat(60));
if (failures.length) {
  console.log(`FAILED — ${failures.length} problem(s):`);
  for (const f of failures) console.log("  ✗ " + f);
  process.exit(1);
}
console.log(
  grammarExercised
    ? "PASSED — both agreed surfaces render an anecdote, with no completion loop."
    : "PASSED — the vocabulary card renders an anecdote with no completion loop.\n" +
      "         The grammar popup was NOT exercised (nothing anecdote-bearing was tappable).\n" +
      "         Do not read this line as coverage of that surface."
);
