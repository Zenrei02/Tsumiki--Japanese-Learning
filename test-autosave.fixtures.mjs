// Fixtures for test-autosave.py — the save cadence, and the gate in front of it.
//
// ⚠️ THIS FILE IMPORTS THE REAL MODULES, IT DOES NOT SLICE A CORE OUT OF THEM.
// autosave.js is not a pure function: what it guards is the ORDER of a debounce,
// a gate, a network call and a page going away, and an extracted copy of it
// would be a copy of the thing whose wiring is the bug surface. So storage.js,
// autosave.js and sync.js are loaded as they ship, wired to a fake Supabase
// client that records every request.
//
// The clock is fake. setTimeout/clearTimeout/Date.now are replaced BEFORE the
// modules are imported, and autosave.js reads them off the global at call time,
// so the real IDLE_MS / MAX_MS / BOUNDARY_MS constants are the ones under test
// rather than shortened ones a test invented.
//
// What every assertion here is really about: a learner does a lesson, the tab
// dies, and the work is either on their account or it is gone.

// ————— a controllable clock —————
let clockNow = 1_700_000_000_000;
let seq = 0;
const pending = new Map();      // id -> { at, fn }

globalThis.setTimeout = (fn, ms) => { const id = ++seq; pending.set(id, { at: clockNow + (ms || 0), fn }); return id; };
globalThis.clearTimeout = (id) => { pending.delete(id); };
Date.now = () => clockNow;

/** Move the clock, firing anything due, then let promises settle. */
async function advance(ms) {
  const target = clockNow + ms;
  for (;;) {
    let next = null;
    for (const [id, t] of pending) if (t.at <= target && (!next || t.at < next.at)) next = { id, ...t };
    if (!next) break;
    pending.delete(next.id);
    clockNow = next.at;
    next.fn();
    await settle();
  }
  clockNow = target;
  await settle();
}
/**
 * Let everything in flight finish. A flush is fire-and-forget by design — the
 * write path must never wait on the network — so "advance the clock and read the
 * call log" is a race unless the push chain is awaited explicitly.
 *
 * ⚠️ THE setImmediate LOOP ALONE WAS NOT ENOUGH, and finding out why was worth
 * the trouble: the first push after arming waits on the module loader, which
 * takes more event-loop turns than a microtask flush. That is a real property of
 * the code, not a test artefact — it is why autosave.js warms the loader when it
 * arms instead of importing inside the flush.
 */
async function settle() {
  for (let i = 0; i < 8; i++) {
    await new Promise((r) => setImmediate(r));
    try { await autosave.autosaveSettled(); } catch { /* a failed push is a result, not a crash */ }
  }
}

// ————— a browser, minimally —————
const listeners = { visibilitychange: [], pagehide: [] };
const localStore = new Map();
globalThis.window = {
  localStorage: {
    getItem: (k) => (localStore.has(k) ? localStore.get(k) : null),
    setItem: (k, v) => localStore.set(k, String(v)),
    removeItem: (k) => localStore.delete(k),
  },
  addEventListener: (type, fn) => { (listeners[type] ||= []).push(fn); },
};
globalThis.document = {
  visibilityState: "visible",
  addEventListener: (type, fn) => { (listeners[type] ||= []).push(fn); },
};
const fire = (type) => { for (const fn of listeners[type] || []) fn(); };

// ————— a Supabase that only records —————
function fakeClient(initial = {}) {
  const calls = [];
  let row = { data: { ...initial }, version: initial && Object.keys(initial).length ? 1 : 0 };
  return {
    calls,
    posts: () => calls.filter((c) => c.op === "POST"),
    gets: () => calls.filter((c) => c.op === "GET"),
    current: () => row.data,
    version: () => row.version,
    from() {
      return {
        select: () => ({ eq: () => ({ maybeSingle: async () => {
          calls.push({ op: "GET" });
          return { data: { ...row, updated_at: null }, error: null };
        } }) }),
        upsert: async (obj) => {
          calls.push({ op: "POST", data: { ...obj.data } });
          // The archive trigger's own rule: an identical document is not a new
          // version. Modelled here so a test can assert the version DID NOT move.
          const same = JSON.stringify(obj.data) === JSON.stringify(row.data);
          row = { data: { ...obj.data }, version: same ? row.version : row.version + 1 };
          return { error: null };
        },
      };
    },
  };
}

// ————— the modules under test —————
const LIB = process.env.TSUMIKI_LIB;
const storage = await import(LIB + "/storage.js");
const autosave = await import(LIB + "/autosave.js");
const sync = await import(LIB + "/sync.js");

let failures = 0;
const assert = (cond, msg) => { if (!cond) { console.error("FAIL: " + msg); failures++; } };
const eq = (a, b, msg) => assert(JSON.stringify(a) === JSON.stringify(b),
  msg + "  (got " + JSON.stringify(a) + ", wanted " + JSON.stringify(b) + ")");

const USER = "user-1";
async function reset() {
  autosave.disarmAutosave();
  localStore.clear();
  document.visibilityState = "visible";
  await settle();
}

// ————— 1. SIGNED OUT SAVES NOTHING, SILENTLY —————
// Not "fails quietly" — does not happen. A learner with no account must not
// generate a single request, and must not see an error for not having one.
{
  await reset();
  const c = fakeClient();
  await storage.storage.set("tsumiki-kanji-progress-v1", '{"a":1}');
  await advance(60000);
  eq(c.calls.length, 0, "a signed-out learner generates no requests at all");
  assert(localStore.get("tsumiki-kanji-progress-v1") === '{"a":1}',
    "...and the local write happened anyway");
}

// ————— 2. THE GATE —————
//
// ⚠️ THIS IS THE ASSERTION THE WHOLE FILE EXISTS FOR, and it took two attempts
// to write one that means anything.
//
// The hazard: a push that runs before the load has finished sends a document
// that predates the account's — thin where the account is full — and the
// account takes it. The guard is the ORDER (has the load finished?), not the
// SIZE, because a size test cannot tell a stale push from a learner who reset
// one section.
//
// THE FIRST VERSION OF THIS BLOCK TESTED NOTHING. It checked that an unarmed
// autosave sends no requests — which was true whether the gate existed or not,
// because an unarmed autosave had no client and a push with no client throws
// before it reaches the network. Deleting the gate left every assertion green.
// test-autosave.py --self-check is what said so.
//
// So the session is established FIRST — a real client, a real user id, exactly
// as account.jsx does at the top of the load — and only the gate stands between
// a module's write and a request. Remove it and these go red.
{
  await reset();
  const c = fakeClient({ "tsumiki-kanji-progress-v1": '{"a":1,"b":2}' });

  // The load starts: we know who we are, and we are not allowed to send.
  autosave.autosaveSession(c, USER);

  // A module writes while the account is still being fetched.
  await storage.storage.set("tsumiki-n5-progress-v1", '{"g":1}');
  await advance(60000);
  eq(c.posts().length, 0,
    "NOTHING IS PUSHED BEFORE THE LOAD HAS FINISHED — even with a live session in hand");

  // The load finishes and writes the settled document locally, exactly as
  // account.jsx's writeLocal does.
  localStore.set("tsumiki-kanji-progress-v1", '{"a":1,"b":2}');
  autosave.armAutosave(sync.canonDoc({ "tsumiki-kanji-progress-v1": '{"a":1,"b":2}' }, storage.KEYS));
  await advance(5000);
  eq(c.posts().length, 1, "...and is pushed once the load has finished");
  eq(c.posts()[0].data, {
    "tsumiki-kanji-progress-v1": '{"a":1,"b":2}',
    "tsumiki-n5-progress-v1": '{"g":1}',
  }, "THE PUSH CARRIES BOTH — the account's keys and the one written during the window");

  // ⚠️ AND WHAT IT WOULD HAVE SENT INSTEAD. This is the whole bug in one line:
  // the ungated push would have carried only the key written during the window,
  // and the account's kanji progress would have been gone.
  assert(!("tsumiki-kanji-progress-v1" in { "tsumiki-n5-progress-v1": '{"g":1}' }),
    "(for the reader: the premature document lacks the account's key entirely)");
}

// ————— 2b. a signed-out learner, with no session at all —————
{
  await reset();
  const c = fakeClient();
  await storage.storage.set("tsumiki-kanji-progress-v1", '{"a":1}');
  await advance(60000);
  eq(c.calls.length, 0, "no session means no requests of any kind");
}

// ————— 3. debounced, and one request per burst —————
{
  await reset();
  const c = fakeClient();
  autosave.autosaveSession(c, USER);
  autosave.armAutosave(sync.canonDoc({}, storage.KEYS));

  await storage.storage.set("tsumiki-known-words-v1", '["本"]');
  await advance(2000);
  eq(c.posts().length, 0, "a save waits for the learner to stop writing");

  await storage.storage.set("tsumiki-known-words-v1", '["本","犬"]');
  await advance(2000);
  eq(c.posts().length, 0, "...and a second write within the window restarts the wait");

  await advance(1500);
  eq(c.posts().length, 1, "ONE request for the burst, not one per write");
  eq(c.current()["tsumiki-known-words-v1"], '["本","犬"]', "and it carries the latest value");
}

// ————— 4. continuous writing still saves —————
// Without a ceiling on the debounce, a module that writes every second resets
// the timer forever and the learner's work never leaves the browser.
{
  await reset();
  const c = fakeClient();
  autosave.autosaveSession(c, USER);
  autosave.armAutosave(sync.canonDoc({}, storage.KEYS));
  for (let i = 0; i < 12; i++) {
    await storage.storage.set("tsumiki-kanji-progress-v1", '{"n":' + i + "}");
    await advance(2000);            // never idle long enough to trigger the debounce
  }
  assert(c.posts().length >= 1, "A CEILING EXISTS — continuous writing still reaches the account");
}

// ————— 5. a milestone does not wait the full idle window —————
{
  await reset();
  const c = fakeClient();
  autosave.autosaveSession(c, USER);
  autosave.armAutosave(sync.canonDoc({}, storage.KEYS));
  await storage.storage.set("tsumiki-checker-history-v1", '{"p1":{"n":1}}');
  await advance(1000);
  eq(c.posts().length, 1, "a checker submission saves sooner than an ordinary write");
}

// ————— 6. NOTHING CHANGED IS NOTHING SENT —————
// The property that makes a quiet load cost a GET and no POST. Get this wrong
// and every load files an archive version of a document nobody edited.
{
  await reset();
  const c = fakeClient();
  autosave.autosaveSession(c, USER);
  autosave.armAutosave(sync.canonDoc({}, storage.KEYS));
  await storage.storage.set("tsumiki-kanji-mode", "kana");
  await advance(5000);
  eq(c.posts().length, 1, "the first real change is sent");
  const v = c.version();

  await storage.storage.set("tsumiki-kanji-mode", "kana");   // same value again
  await advance(5000);
  eq(c.posts().length, 1, "WRITING THE SAME VALUE SENDS NOTHING");
  eq(c.version(), v, "...so the account's version does not move");

  // And a module re-serialising identical state is not a change either.
  await storage.storage.set("tsumiki-known-words-v1", '{"a":1,"b":2}');
  await advance(5000);
  const after = c.posts().length;
  await storage.storage.set("tsumiki-known-words-v1", '{"b":2,"a":1}');
  await advance(5000);
  eq(c.posts().length, after, "re-serialised identical state sends nothing");
}

// ————— 7. losing the page —————
//
// visibilitychange -> hidden and pagehide are the only signals iOS Safari
// gives before a tab is frozen. A learner who switches apps mid-lesson must not
// have to wait out the debounce.
{
  await reset();
  const c = fakeClient();
  autosave.autosaveSession(c, USER);
  autosave.armAutosave(sync.canonDoc({}, storage.KEYS));
  await storage.storage.set("tsumiki-n5-progress-v1", '{"lesson":"done"}');
  await advance(100);                      // nowhere near the debounce
  eq(c.posts().length, 0, "still waiting");

  document.visibilityState = "hidden";
  fire("visibilitychange");
  await settle();
  eq(c.posts().length, 1, "HIDING THE PAGE SAVES IMMEDIATELY");
  eq(c.current()["tsumiki-n5-progress-v1"], '{"lesson":"done"}', "and the work is on the account");
}
{
  await reset();
  const c = fakeClient();
  autosave.autosaveSession(c, USER);
  autosave.armAutosave(sync.canonDoc({}, storage.KEYS));
  await storage.storage.set("tsumiki-katakana-progress-v1", '{"ア":1}');
  await advance(100);
  fire("pagehide");
  await settle();
  eq(c.posts().length, 1, "CLOSING THE TAB SAVES IMMEDIATELY");
}

// ————— 8. a write made WHILE hidden goes out on its own —————
//
// ⚠️ NOT AN OPTIMISATION. App.jsx's own visibilitychange handler
// (commitIfWorked) writes the recency and engagement keys when the page hides,
// and it registers its listener after autosave installs one — so the hide flush
// runs FIRST and would miss exactly the writes the hide caused.
{
  await reset();
  const c = fakeClient();
  autosave.autosaveSession(c, USER);
  autosave.armAutosave(sync.canonDoc({}, storage.KEYS));
  document.visibilityState = "hidden";
  fire("visibilitychange");                 // nothing pending; no request
  await settle();
  eq(c.posts().length, 0, "hiding with nothing to save sends nothing");

  // now the app's own hide handler gets its turn
  await storage.storage.set("tsumiki-module-recency-v1", '{"grammar":"2026-09-16"}');
  await settle();
  eq(c.posts().length, 1, "A WRITE MADE WHILE HIDDEN IS SAVED AT ONCE, not in three seconds");
}

// ————— 9. signing out stops it —————
// The token is about to be thrown away; nothing may be sent afterwards.
{
  await reset();
  const c = fakeClient();
  autosave.autosaveSession(c, USER);
  autosave.armAutosave(sync.canonDoc({}, storage.KEYS));
  await storage.storage.set("tsumiki-kanji-progress-v1", '{"a":1}');
  await autosave.flushNow("sign-out");      // what account.jsx does first
  eq(c.posts().length, 1, "sign-out flushes what is pending WHILE the session still exists");

  autosave.disarmAutosave();
  await storage.storage.set("tsumiki-kanji-progress-v1", '{"a":2}');
  await advance(60000);
  eq(c.posts().length, 1, "and nothing is sent after signing out");
}

// ————— 10. which browser joined which account is device-local —————
// If this key ever entered KEYS it would be uploaded, and every device would
// then claim to have joined the moment one of them had — skipping the merge
// that exists to check exactly that claim.
{
  await reset();
  assert(!storage.KEYS.includes("tsumiki-account-joined-v1"),
    "THE JOINED MARKER IS NOT IN KEYS — it must never be uploaded");
  assert(storage.joinedAccount() === null, "a fresh browser has joined nothing");
  storage.markAccountJoined(USER);
  assert(storage.joinedAccount() === USER, "joining is remembered");
  assert(!("tsumiki-account-joined-v1" in sync.readLocal()),
    "...and it is absent from the document that gets pushed");
  storage.clearAccountJoined();
  assert(storage.joinedAccount() === null, "signing out forgets it, so the next sign-in merges");
}

// ————— 11. a restore from a file reaches the account —————
// With the account authoritative on load, a restore that stayed local would be
// undone by the next page load — silently, which is this project's whole
// recurring failure shape.
{
  await reset();
  const c = fakeClient();
  autosave.autosaveSession(c, USER);
  autosave.armAutosave(sync.canonDoc({}, storage.KEYS));
  const file = JSON.stringify({
    format: "tsumiki-progress", version: 1,
    data: { "tsumiki-n5-progress-v1": '{"restored":true}' },
  });
  const res = storage.importProgress(file);
  assert(res.ok, "the file restored");
  await advance(5000);
  eq(c.posts().length, 1, "A RESTORE IS PUSHED — otherwise the next load undoes it");
  eq(c.current()["tsumiki-n5-progress-v1"], '{"restored":true}', "and the account has it");
}

// ————— 12. writing back what the account just gave us pushes nothing —————
// sync.writeLocal() is the load applying the account's own document. Announcing
// it would schedule a push of the server's document straight back at it.
{
  await reset();
  const c = fakeClient();
  autosave.autosaveSession(c, USER);
  autosave.armAutosave(sync.canonDoc({ "tsumiki-known-kanji-v1": '["日"]' }, storage.KEYS));
  sync.writeLocal({ "tsumiki-known-kanji-v1": '["日"]' });
  await advance(60000);
  eq(c.posts().length, 0, "AN ORDINARY LOAD COSTS NO POST");
  assert(localStore.get("tsumiki-known-kanji-v1") === '["日"]', "...but it did write locally");
}

if (failures) {
  console.error("\n" + failures + " ASSERTION(S) FAILED");
  process.exit(1);
}
console.log("ALL AUTOSAVE TESTS PASS");
