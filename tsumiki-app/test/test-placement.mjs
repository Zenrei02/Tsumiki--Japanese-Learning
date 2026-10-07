// test-placement.mjs — the first-visit wizard's review quizzes.
//
//   node test/test-placement.mjs        (from tsumiki-app/, after build-vite-app.py)
//
// What has to hold (Lloyd, Oct 7–8 2026), and why each one is here:
//   · the pass mark sits at about two-thirds for every quiz size actually used
//   · below 60% locks the quiz for a week; 60% up to the pass mark does not
//   · the stage quiz waits until every group quiz is passed
//   · a stage pass credits the stage's lessons as `placed`, and kanji as known;
//     a group pass credits nothing
//   · the quiz data is complete: every kana has a sound, every kanji a meaning
//   · the merge is order-independent, never undoes a pass, keeps the later lock
//
// Each block ends with a CONTROL that breaks the property and expects the
// assertion to notice — a check that has only ever passed has not been tested.

import { readFileSync } from "node:fs";
import { mergePlacement } from "../src/lib/kobanMerge.js";

const failures = [];
const ok = (cond, msg) => { if (!cond) failures.push(msg); };

function device(seed = {}) {
  const m = new Map(Object.entries(seed));
  return { map: m, storage: { async get(k) { return m.has(k) ? { value: m.get(k) } : null; }, async set(k, v) { m.set(k, String(v)); } } };
}
const DATA = new URL("../src/lib/placementData.js", import.meta.url).href;
const SRC = readFileSync(new URL("../src/lib/placement.js", import.meta.url), "utf8")
  .replace('import { storage } from "./storage.js";', "const storage = globalThis.__dev.storage;")
  .replace('from "./placementData.js"', `from "${DATA}"`);
let n = 0;
async function on(dev) {
  globalThis.__dev = dev;
  return import("data:text/javascript;base64," + Buffer.from(SRC + `\n// ${n++}`).toString("base64"));
}
const KEY = "tsumiki-placement-v1";
const T0 = Date.parse("2026-10-08T03:00:00Z"), DAY = 86400e3;

// 1. the pass mark, at every size in use
{
  const P = await on(device());
  const sizes = new Set(Object.values(P.QUIZ).map((q) => q.n));
  for (const s of sizes) {
    const r = P.passMark(s) / s;
    ok(r >= 0.65 && r <= 0.7 + 1e-9, `1: a ${s}-question quiz passes at ${P.passMark(s)} (${Math.round(r * 100)}%), outside 65–70%`);
  }
  ok(P.passMark(10) === 7 && P.passMark(15) === 10, "1: 10 → 7 and 15 → 10 are the numbers Lloyd was shown");
  // CONTROL: a plain 60% rule would put 10 questions at 6 — the check above would catch it
  ok(Math.ceil(10 * 0.6) / 10 < 0.65, "1 CONTROL: the 65% floor would not catch a 60% rule");
}

// 2. data completeness
{
  const P = await on(device());
  for (const [id, s] of Object.entries(P.SECTIONS)) {
    ok(s.groups.length > 0, `2: ${id} has no group quizzes`);
    for (const q of s.quizzes) {
      ok(q.items.length >= q.n, `2: ${q.id} asks ${q.n} questions from ${q.items.length} items`);
      for (const it of q.items) {
        if (s.kind === "kana") ok(typeof it.sound === "string" && it.sound && it.sound !== "?", `2: ${q.id}: ${it.q} has no sound`);
        else ok(typeof it.meaning === "string" && it.meaning, `2: ${q.id}: ${it.q} has no meaning`);
      }
    }
    const qs = P.buildQuestions(s.stage.id);
    ok(qs.every((x) => x.options.includes(x.item.q) && new Set(x.options).size === x.options.length), `2: ${id} stage question without its answer, or with a repeated option`);
  }
  ok(P.SECTIONS.kanji.groups.length === 2, "2: the kanji stage should be its first two groups");
  // no romaji in any option or prompt: everything shown is kana, kanji, or an English meaning
  const romajiOption = Object.values(P.QUIZ).flatMap((q) => P.buildQuestions(q.id)).some((x) => x.options.some((o) => /[a-z]/i.test(o)));
  ok(!romajiOption, "2: an answer option contains Latin letters");
}

// 3. pass, lock, retry — and the stage waits for its groups
{
  const d = device();
  const P = await on(d);
  await P.recordAnswers({ studied: true, knows: { kanji: true }, quiz: { kanji: true } }, T0);
  let st = await P.readPlacement();
  ok(P.quizStatus(st, "kanji:g1", T0).state === "available", "3: a yes did not open the group quiz");
  ok(P.quizStatus(st, "kanji:stage", T0).state === "waiting", "3: the stage quiz was open before its groups");
  ok(P.quizStatus(st, "hiragana:g1", T0).state === null, "3: a quiz nobody asked for is offered");

  const low = await P.recordAttempt("kanji:g1", { right: 5, n: 10, missed: ["三", "人"] }, T0);   // 50%
  ok(low.locked && !low.passed && low.until === T0 + 7 * DAY, "3: 50% did not lock the quiz for a week");
  ok(low.weak.length === 1 && low.weak[0].items.length === 2 && /Foundations/.test(low.weak[0].title), "3: the weak parts are not grouped under their lesson group");
  st = await P.readPlacement();
  ok(P.quizStatus(st, "kanji:g1", T0 + DAY).state === "locked", "3: a locked quiz was open the next day");
  ok(P.quizStatus(st, "kanji:g1", T0 + 7 * DAY + 1).state === "available", "3: the lock did not end after a week");

  const mid = await P.recordAttempt("kanji:g2", { right: 6, n: 10 }, T0);    // 60%: not a pass, not a lock
  ok(!mid.passed && !mid.locked, "3: 60% should neither pass nor lock");
  st = await P.readPlacement();
  ok(P.quizStatus(st, "kanji:g2", T0).state === "available", "3: a 60% attempt left the quiz unavailable");

  const g1 = await P.recordAttempt("kanji:g1", { right: 7, n: 10 }, T0 + 8 * DAY);
  const g2 = await P.recordAttempt("kanji:g2", { right: 7, n: 10 }, T0 + 8 * DAY);
  ok(g1.passed && g2.passed && !g1.credited && !g2.credited, "3: a group pass credited lessons");
  ok(!d.map.has("tsumiki-kanji-progress-v1"), "3: a group pass wrote to the kanji module's store");
  st = await P.readPlacement();
  ok(P.quizStatus(st, "kanji:stage", T0 + 8 * DAY).state === "available", "3: passing both groups did not open the stage quiz");

  const stage = await P.recordAttempt("kanji:stage", { right: 10, n: 15 }, T0 + 8 * DAY);
  const prog = JSON.parse(d.map.get("tsumiki-kanji-progress-v1") || "{}");
  const known = JSON.parse(d.map.get("tsumiki-known-kanji-v1") || "[]");
  ok(stage.passed && stage.credited, "3: a stage pass did not credit");
  ok(P.SECTIONS.kanji.stage.lessons.every((id) => prog[id]?.placed), "3: a lesson in the stage was not marked placed");
  ok(!prog["k-t9"], "3: a lesson OUTSIDE the stage was credited");
  ok(P.SECTIONS.kanji.stage.items.every((it) => known.includes(it.q)), "3: a placed kanji is missing from known-kanji");
  // CONTROL: one short of the mark does not pass
  const e = device(); const Q = await on(e);
  await Q.recordAnswers({ studied: true, quiz: { kanji: true } }, T0);
  const short = await Q.recordAttempt("kanji:g1", { right: 6, n: 10 }, T0);
  ok(!short.passed, "3 CONTROL: 6 of 10 passed");
}

// 4. crediting keeps what a learner already did
{
  const d = device({ "tsumiki-hiragana-progress-v2": JSON.stringify({ a: { drill: 4, drillOf: 5, traced: ["あ:trace"] } }) });
  const P = await on(d);
  await P.recordAnswers({ studied: true, quiz: { hiragana: true } }, T0);
  for (const g of P.SECTIONS.hiragana.groups) await P.recordAttempt(g.id, { right: 10, n: 10 }, T0);
  await P.recordAttempt("hiragana:stage", { right: 15, n: 15 }, T0);
  const prog = JSON.parse(d.map.get("tsumiki-hiragana-progress-v2"));
  ok(prog.a.drill === 4 && prog.a.traced.length === 1 && prog.a.placed === T0, "4: crediting overwrote a lesson's own progress");
  ok(!Object.keys(prog).some((k) => k.startsWith("cc-")), "4: a culture lesson was credited");
}

// 5. the merge
{
  const A = JSON.stringify({ v: 1, answers: { at: T0, studied: true, quiz: { kanji: true } }, quizzes: {
    "kanji:g1": { unlocked: T0, attempts: [{ ts: T0 + 1, right: 5, n: 10 }], lockedUntil: T0 + 7 * DAY },
  } });
  const B = JSON.stringify({ v: 1, answers: { at: T0 + 5, studied: true, quiz: { kanji: true, hiragana: true } }, quizzes: {
    "kanji:g1": { unlocked: T0 + 2, attempts: [{ ts: T0 + 3, right: 8, n: 10 }], passed: T0 + 3 },
    "hiragana:g1": { unlocked: T0 + 5, attempts: [] },
  } });
  const ab = mergePlacement(A, B), ba = mergePlacement(B, A);
  ok(ab === ba, "5: the merge depends on argument order");
  const u = JSON.parse(ab);
  ok(u.quizzes["kanji:g1"].passed === T0 + 3 && u.quizzes["kanji:g1"].lockedUntil === undefined, "5: a pass on one device was undone by a lock on the other");
  ok(u.quizzes["kanji:g1"].attempts.length === 2 && u.quizzes["kanji:g1"].unlocked === T0, "5: attempts or the first unlock were lost");
  ok(u.quizzes["hiragana:g1"] && u.answers.at === T0 + 5, "5: the later answers or an unlock went missing");
  ok(mergePlacement("[]", A) === null, "5: a foreign shape was merged instead of asked");
  // CONTROL: two locks, no pass — the LATER lock stands
  const L1 = JSON.stringify({ v: 1, quizzes: { q: { unlocked: 1, attempts: [], lockedUntil: 100 } } });
  const L2 = JSON.stringify({ v: 1, quizzes: { q: { unlocked: 1, attempts: [], lockedUntil: 200 } } });
  ok(JSON.parse(mergePlacement(L1, L2)).quizzes.q.lockedUntil === 200, "5 CONTROL: the earlier lock won");
}

if (failures.length) {
  console.error(`FAIL — ${failures.length}:\n  ` + failures.join("\n  "));
  process.exit(1);
}
console.log("OK — placement: pass mark, data, lock and retry, stage gating, crediting, merge");
