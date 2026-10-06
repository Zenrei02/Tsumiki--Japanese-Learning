// test-blocks.mjs — the journey's effort-block ledger and its merge rule.
//
//   node test/test-blocks.mjs        (from tsumiki-app/)
//
// What has to hold, and why each one is here:
//   · showing up lays one block a Tokyo day and at most three a Tokyo week
//   · an id is laid once, however often its source is re-read
//   · a module's FIRST report is back-filled (no invented date); later ones are
//     dated — and a first report with nothing finished still counts as the first
//   · the checker lays the first sentence of each week, as written, nothing else
//   · the union is order-independent and never drops a block
//   · a shape the merger does not own goes back to the question (null)
//
// Each block ends with a CONTROL that breaks the property and expects the
// assertion to notice — a check that has only ever passed has not been tested.

import { readFileSync } from "node:fs";
import { unionBlocks } from "../src/lib/kobanMerge.js";

const failures = [];
const ok = (cond, msg) => { if (!cond) failures.push(msg); };

function device(seed = {}) {
  const m = new Map(Object.entries(seed));
  return { map: m, storage: { async get(k) { return m.has(k) ? { value: m.get(k) } : null; }, async set(k, v) { m.set(k, String(v)); } } };
}
// blocks.js imports storage.js, which reaches for the browser. Load it fresh per
// "device" with that one import swapped for the device's storage: its write
// queue is module state, as two browsers' would be.
const SRC = readFileSync(new URL("../src/lib/blocks.js", import.meta.url), "utf8")
  .replace('import { storage } from "./storage.js";', "const storage = globalThis.__dev.storage;");
if (SRC.includes('from "./storage.js"')) { console.error("could not stub storage.js"); process.exit(1); }
let n = 0;
async function blocksOn(dev) {
  globalThis.__dev = dev;
  return import("data:text/javascript;base64," + Buffer.from(SRC + `\n// ${n++}`).toString("base64"));
}
const KEY = "tsumiki-blocks-v1";
const ledgerOf = (dev) => JSON.parse(dev.map.get(KEY) || '{"blocks":[]}');
const T0 = Date.parse("2026-10-05T01:00:00Z");          // Monday 10:00 in Tokyo
const DAY = 86400e3;

// 1. showing up: one a day, three a week
{
  const d = device();
  const B = await blocksOn(d);
  for (let i = 0; i < 7; i++) { await B.recordVisit(T0 + i * DAY); await B.recordVisit(T0 + i * DAY + 3600e3); }
  const logins = ledgerOf(d).blocks.filter((b) => b.source === "login");
  ok(logins.length === 3, `1: a full week of visits laid ${logins.length} login blocks, expected 3`);
  ok(new Set(logins.map((b) => b.id)).size === logins.length, "1: two login blocks on one day");
  await B.recordVisit(T0 + 7 * DAY);                    // the next Monday
  ok(ledgerOf(d).blocks.filter((b) => b.source === "login").length === 4, "1: a new week did not allow a new login block");
  // Tokyo, not UTC: 23:30 UTC Sunday is already Monday in Tokyo
  ok(B.tokyoDay(Date.parse("2026-10-11T23:30:00Z")) === "2026-10-12", "1: tokyoDay is not on Tokyo time");
  ok(B.weekOf("2026-10-11") === "2026-10-05" && B.weekOf("2026-10-12") === "2026-10-12", "1: weeks do not start on Monday");
  // CONTROL: with the cap raised, the same week lays more — so the 3 above is the cap, not an accident
  const d2 = device();
  const B2src = SRC.replace("export const LOGINS_PER_WEEK = 3;", "export const LOGINS_PER_WEEK = 7;");
  globalThis.__dev = d2;
  const B2 = await import("data:text/javascript;base64," + Buffer.from(B2src + `\n// ${n++}`).toString("base64"));
  for (let i = 0; i < 7; i++) await B2.recordVisit(T0 + i * DAY);
  ok(ledgerOf(d2).blocks.length === 7, "1 CONTROL: raising the cap did not lay more blocks");
}

// 2. idempotent by id, and module reports back-fill only the first time
{
  const d = device();
  const B = await blocksOn(d);
  await B.reportBlocks("kanji", [{ id: "lesson:kanji:k-lines", source: "kanji", action: "lesson" }]);
  await B.reportBlocks("kanji", [{ id: "lesson:kanji:k-lines", source: "kanji", action: "lesson" },
                                 { id: "lesson:kanji:k-frame", source: "kanji", action: "lesson" }]);
  const bl = ledgerOf(d).blocks;
  ok(bl.length === 2, `2: two reports of overlapping lessons laid ${bl.length} blocks, expected 2`);
  ok(bl.find((b) => b.id === "lesson:kanji:k-lines")?.bf === true, "2: the first report was not back-filled");
  ok(!bl.find((b) => b.id === "lesson:kanji:k-frame")?.bf, "2: a later report was back-filled");
  // a first report with nothing finished still seeds, so the first real lesson is dated
  const e = device();
  const E = await blocksOn(e);
  await E.reportBlocks("grammar", []);
  await E.reportBlocks("grammar", [{ id: "lesson:grammar:copula", source: "grammar", action: "lesson" }]);
  ok(!ledgerOf(e).blocks[0]?.bf, "2: a new learner's first grammar lesson was back-filled");
  // CONTROL: without the empty first report, the same lesson IS back-filled
  const f = device();
  const F = await blocksOn(f);
  await F.reportBlocks("grammar", [{ id: "lesson:grammar:copula", source: "grammar", action: "lesson" }]);
  ok(ledgerOf(f).blocks[0]?.bf === true, "2 CONTROL: seeding made no difference");
  // a module may not report for a source it does not own
  await F.reportBlocks("checker", [{ id: "check:x", source: "checker", action: "check" }]);
  ok(!ledgerOf(f).blocks.some((b) => b.id === "check:x"), "2: an unknown reporter was accepted");
}

// 3. reading the stores
{
  const d = device();
  const B = await blocksOn(d);
  const koban = JSON.stringify({ v: 1, events: [
    { id: "kana:hiragana:a", ts: T0, d: 3, r: "lesson finished", s: "hiragana" },
    { id: "kana:katakana:ka", ts: T0 + DAY, d: 3, r: "lesson finished", s: "katakana" },
    { id: "challenge:2026-10-06:easy", ts: T0 + DAY, d: 2, r: "x", s: "grammar" },
    { id: "challenge:2026-10-06:hard", ts: T0 + DAY + 60, d: 4, r: "x", s: "grammar" },
    { id: "u1", ts: T0 + 2 * DAY, d: 5, r: "word completed", s: "vocabulary" },
    { id: "u2", ts: T0 + 2 * DAY + 60, d: 5, r: "word completed", s: "vocabulary" },
    { id: "u3", ts: T0 + 2 * DAY + 90, d: 1, r: "review", s: "vocabulary" },
  ] });
  const words = JSON.stringify({ 学校: { log: [{ t: T0 + 3 * DAY, via: "check", ok: false }, { t: T0 + 3 * DAY + 5, via: "check", ok: true }] }, _reviewPay: { day: "x", n: 1 } });
  const history = JSON.stringify({ _checks: [
    { d: "2026-10-07", text: "駅で友だちを会いました。", verdict: "fix", score: 2 },
    { d: "2026-10-05", text: "私は昨日図書館で本を読みます。", verdict: "fix", score: 3 },
    { d: "2026-10-13", text: "毎朝コーヒーを飲みます。", verdict: "ok", score: 5 },
  ] });
  const c = B.candidatesFrom({ koban, history, words });
  const ids = c.map((x) => x.id).sort();
  ok(ids.includes("lesson:hiragana:a") && ids.includes("lesson:katakana:ka"), "3: kana lessons not read from the koban ledger");
  ok(ids.filter((i) => i.startsWith("review:grammar:")).length === 1, "3: two challenge tiers on one day laid two blocks");
  ok(ids.filter((i) => i.startsWith("lesson:vocabulary:")).length === 1, "3: two words completed on one day laid two blocks");
  ok(ids.filter((i) => i.startsWith("review:vocabulary:")).length === 1, "3: a day of vocabulary checks did not lay one review block");
  const checks = c.filter((x) => x.source === "checker");
  ok(checks.length === 2, `3: three checks across two weeks laid ${checks.length} checker blocks, expected 2`);
  const wk1 = checks.find((x) => x.id === "check:2026-10-05");
  ok(wk1 && wk1.sentence === "私は昨日図書館で本を読みます。", "3: the checker block is not the FIRST sentence of its week");
  // effort, never grading: nothing from the check but the sentence
  ok(checks.every((x) => !("verdict" in x) && !("score" in x)), "3: a checker block carried a verdict or score");
  await B.ensureBlocks(c); await B.ensureBlocks(c);
  ok(ledgerOf(d).blocks.length === c.length, "3: reading the same stores twice laid blocks twice");
  // CONTROL: a store with no checker history lays no checker blocks
  const c2 = B.candidatesFrom({ koban, history: null, words });
  ok(!c2.some((x) => x.source === "checker"), "3 CONTROL: checker blocks appeared without a history");
}

// 4. the union
{
  const A = JSON.stringify({ v: 1, blocks: [
    { id: "login:2026-10-05", ts: T0, source: "login", action: "login" },
    { id: "lesson:kanji:k-lines", ts: T0 + 5, source: "kanji", action: "lesson", bf: true },
  ], built: { torii: T0 + 10 }, seeded: { kanji: T0 } });
  const Bv = JSON.stringify({ v: 1, blocks: [
    { id: "login:2026-10-06", ts: T0 + DAY, source: "login", action: "login" },
    { id: "lesson:kanji:k-lines", ts: T0 + 99, source: "kanji", action: "lesson" },
  ], built: { torii: T0 + 20, pagoda: T0 + 30 }, seeded: { kanji: T0 + 50, grammar: T0 } });
  const ab = unionBlocks(A, Bv), ba = unionBlocks(Bv, A);
  ok(ab === ba, "4: the union depends on argument order");
  const u = JSON.parse(ab);
  ok(u.blocks.length === 3, `4: the union holds ${u.blocks.length} blocks, expected 3`);
  ok(!u.blocks.find((b) => b.id === "lesson:kanji:k-lines").bf, "4: a back-filled copy beat a dated one");
  ok(u.built.torii === T0 + 10 && u.built.pagoda === T0 + 30, "4: built structures did not union to the earliest stamp");
  ok(u.seeded.kanji === T0 && u.seeded.grammar === T0, "4: seeded sources did not union");
  ok(unionBlocks("[]", A) === null && unionBlocks(A, '{"events":[]}') === null, "4: a foreign shape was merged instead of asked");
  // CONTROL: a plain "newer wins" would lose a block — prove the test can see that
  const lossy = JSON.parse(Bv);
  ok(lossy.blocks.length !== u.blocks.length, "4 CONTROL: the newer copy alone already held every block");
}

// 5. structures: announced only once earned, never twice
{
  const d = device();
  const B = await blocksOn(d);
  const mk = (src, i, action = "lesson") => ({ id: `${src}:${i}`, ts: T0 + i, source: src, action });
  const few = [...Array(14)].map((_, i) => mk("hiragana", i)).concat([...Array(12)].map((_, i) => mk("login", 100 + i, "login")));
  ok(B.earnedUnbuilt(few, {}) === null, "5: a torii was announced before it was earned");
  // recipe met (15 kana, 12 logins) but too few blocks to build it whole: held back
  const thin = few.concat([mk("katakana", 50)]);
  ok(thin.length < B.slotCount("torii") && B.earnedUnbuilt(thin, {}) === null, "5: a torii was announced that would be built with gaps");
  const enough = thin.concat([...Array(B.slotCount("torii"))].map((_, i) => mk("login", 200 + i, "login")));
  ok(B.earnedUnbuilt(enough, {}) === "torii", "5: an earned torii was not announced");
  // CONTROL: the same recipe check without the whole-building guard would have announced `thin`
  ok(B.RECIPES.torii.earned(B.tally(thin)), "5 CONTROL: `thin` does not even meet the recipe, so the guard was never tested");
  ok(B.earnedUnbuilt(enough, { torii: T0 }) === null, "5: a built torii was announced again");
  const a = B.assignForBuilding("torii", enough);
  ok(a.slots.length > 0 && new Set(a.slots.map((s) => s.b.id)).size === a.slots.length, "5: one block used twice in a building");
}

if (failures.length) {
  console.error(`FAIL — ${failures.length}:\n  ` + failures.join("\n  "));
  process.exit(1);
}
console.log("OK — blocks: showing-up cap, idempotent ids, back-fill, store reads, union, structures");
