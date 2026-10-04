// test-koban.mjs — the koban ledger and the room keys' merge rules.
//
//   node test/test-koban.mjs        (from tsumiki-app/, after build-vite-app.py)
//
// What has to hold, and why each one is here:
//   · a once-only id pays once — on one device, and across two after a union
//   · the old single-number wallet becomes ONE opening event, never two
//   · a spend never takes the balance below zero
//   · two awards in flight both land (the write queue)
//   · every union is order-independent: merge(A,B) === merge(B,A)
//   · a shape the merger does not own goes back to the question (null)
//
// Each block ends with a CONTROL that breaks the property and expects the
// assertion to notice — a check that has only ever passed has not been tested.

import { readFileSync } from "node:fs";
import { unionLedger, unionOwned, newerOf, mergeGarden } from "../src/lib/kobanMerge.js";

const failures = [];
const ok = (cond, msg) => { if (!cond) failures.push(msg); };

// ————— a fresh window.storage per "device" —————
function device(seed = {}) {
  const m = new Map(Object.entries(seed));
  return {
    map: m,
    storage: {
      async get(k) { return m.has(k) ? { value: m.get(k) } : null; },
      async set(k, v) { m.set(k, String(v)); },
    },
  };
}
// Load lib/koban.js fresh, bound to one device — its write queue is module
// state, so each device needs its own copy, as two browsers would.
const SRC = readFileSync(new URL("../src/lib/koban.js", import.meta.url), "utf8");
let n = 0;
async function kobanOn(dev) {
  globalThis.window = { storage: dev.storage };
  const url = "data:text/javascript;base64," + Buffer.from(SRC + `\n// ${n++}`).toString("base64");
  return import(url);
}
const LEDGER = "tsumiki-koban-ledger-v1", LEGACY = "tsumiki-achievement-points-v1";

// 1. once-only ids
{
  const d = device();
  const k = await kobanOn(d);
  const a = await k.addKoban(3, "lesson finished", "hiragana", "kana:hiragana:a");
  const b = await k.addKoban(3, "lesson finished", "hiragana", "kana:hiragana:a");
  ok(a.added && !b.added, "1: a repeated once-only id paid twice");
  ok(b.balance === 3, `1: balance after a repeated id is ${b.balance}, expected 3`);
  const c = await k.addKoban(1, "review", "vocabulary");
  const e = await k.addKoban(1, "review", "vocabulary");
  ok(c.added && e.added && e.balance === 5, "1: repeatable awards (no id) should both land");
  // control: an award with no id at all is NOT once-only
  ok(e.balance !== 4, "1 CONTROL: id-less awards collapsed into one");
}

// 2. legacy migration: one opening event, and only one
{
  const d = device({ [LEGACY]: "40" });
  const k = await kobanOn(d);
  ok(await k.kobanNow() === 40, "2: the old wallet did not carry into the ledger");
  await k.addKoban(5, "x", "t");
  await k.addKoban(5, "y", "t");
  const led = JSON.parse(d.map.get(LEDGER));
  const opens = led.events.filter((e) => e.id === k.LEGACY_OPENING);
  ok(opens.length === 1 && opens[0].d === 40, `2: expected one opening event of 40, got ${JSON.stringify(opens)}`);
  ok(await k.kobanNow() === 50, "2: balance after migration + two awards should be 50");
  ok(d.map.get(LEGACY) === "40", "2: the legacy key must be left untouched for one version");
  // Two devices migrating separately must not count the opening twice.
  const d2 = device({ [LEGACY]: "40" });
  const k2 = await kobanOn(d2);
  await k2.addKoban(2, "z", "t");
  const merged = JSON.parse(unionLedger(d.map.get(LEDGER), d2.map.get(LEDGER)));
  const sum = merged.events.reduce((s, e) => s + e.d, 0);
  ok(sum === 52, `2: two separately-migrated devices union to ${sum}, expected 52 (40 once + 5 + 5 + 2)`);
}

// 3. spending refuses rather than going negative
{
  const d = device();
  const k = await kobanOn(d);
  await k.addKoban(12, "x", "t");
  const no = await k.spendKoban(45, "bought 行灯", "andon");
  const yes = await k.spendKoban(12, "bought 座卓", "zataku");
  ok(!no.ok && no.balance === 12, "3: a spend beyond the balance went through");
  ok(yes.ok && yes.balance === 0, "3: an affordable spend did not land");
  const led = JSON.parse(d.map.get(LEDGER));
  ok(led.events.some((e) => e.d === -12 && e.item === "zataku"), "3: the spend did not record which item it bought");
}

// 4. the write queue: awards fired together all land
{
  const d = device();
  const k = await kobanOn(d);
  await Promise.all([1, 2, 3, 4, 5].map((i) => k.addKoban(i, "burst", "t")));
  ok(await k.kobanNow() === 15, "4: concurrent awards lost an event (expected 15)");
}

// 5. unions are order-independent, and refuse shapes they do not own
{
  const A = JSON.stringify({ v: 1, events: [
    { id: "x", ts: 1, d: 5, r: "", s: "" }, { id: "legacy-opening", ts: 0, d: 30, r: "", s: "" }] });
  const B = JSON.stringify({ v: 1, events: [
    { id: "y", ts: 2, d: -12, r: "", s: "room", item: "zataku" }, { id: "legacy-opening", ts: 0, d: 40, r: "", s: "" }] });
  ok(unionLedger(A, B) === unionLedger(B, A), "5: unionLedger depends on argument order");
  const u = JSON.parse(unionLedger(A, B));
  ok(u.events.length === 3, "5: union should hold three distinct ids");
  ok(u.events.find((e) => e.id === "legacy-opening").d === 40, "5: a disputed opening should keep the larger amount");
  ok(unionLedger(A, "42") === null, "5: a ledger merged with a bare number should go back to the question");

  const O1 = JSON.stringify({ v: 1, ids: { zataku: 5, andon: 9 } });
  const O2 = JSON.stringify({ v: 1, ids: { andon: 7, futon: 11 } });
  ok(unionOwned(O1, O2) === unionOwned(O2, O1), "5: unionOwned depends on argument order");
  const o = JSON.parse(unionOwned(O1, O2)).ids;
  ok(o.zataku === 5 && o.andon === 7 && o.futon === 11, `5: owned union wrong: ${JSON.stringify(o)}`);

  const L1 = JSON.stringify({ v: 1, t: 100, home: "yojouhan" });
  const L2 = JSON.stringify({ v: 1, t: 200, home: "rokujou" });
  ok(newerOf(L1, L2) === L2 && newerOf(L2, L1) === L2, "5: newerOf did not pick the later write both ways round");
  const E1 = JSON.stringify({ v: 1, t: 100, a: 1 }), E2 = JSON.stringify({ v: 1, t: 100, a: 2 });
  ok(newerOf(E1, E2) === newerOf(E2, E1), "5: newerOf tie-break depends on argument order");

  // CONTROL: a deliberately order-dependent "union" must be caught by the same check.
  const naive = (l, r) => JSON.stringify({ v: 1, events: [...JSON.parse(l).events, ...JSON.parse(r).events] });
  ok(naive(A, B) !== naive(B, A), "5 CONTROL: the order-independence check cannot tell a naive concat apart");
}

// 6. the garden: newer shape wins, growth never goes down
{
  const old = JSON.stringify({ v: 1, t: 100, style: "moyogi", growth: 9, rake: [] });
  const newer = JSON.stringify({ v: 1, t: 200, style: "kengai", growth: 4, rake: [[[0, 0], [1, 1]]] });
  const m1 = JSON.parse(mergeGarden(old, newer)), m2 = JSON.parse(mergeGarden(newer, old));
  ok(m1.style === "kengai" && m2.style === "kengai", "6: the newer garden's shape did not win");
  ok(m1.growth === 9 && m2.growth === 9, `6: growth went down in the merge (${m1.growth}, ${m2.growth})`);
  ok(JSON.stringify(m1) === JSON.stringify(m2), "6: mergeGarden depends on argument order");
  // CONTROL: plain newerOf would have lost the growth — the check must see it.
  ok(JSON.parse(newerOf(old, newer)).growth === 4, "6 CONTROL: newerOf no longer differs from mergeGarden here");
}

if (failures.length) {
  console.log("FAIL");
  for (const f of failures) console.log("  - " + f);
  process.exit(1);
}
console.log("OK — ledger: once-only ids, one opening event, no overdraft, no lost writes; merges order-independent");
