// Fixtures for test-progress-sync.py. The functions under test are sliced out
// of tsumiki-app/src/lib/sync.js AT RUN TIME and prepended to this file, so these
// assertions always run against the shipped merge core and never against a copy.
//
// The property every one of these exists to protect: SIGNING IN MUST NOT LOSE
// PROGRESS. Read them as "what a learner would lose if this line were wrong."

let failures = 0;
const assert = (cond, msg) => {
  if (!cond) { console.error("FAIL: " + msg); failures++; }
};
// Order-insensitive: an object's key order is not part of what is being
// asserted, and the negative control below showed a correct value reported as a
// failure purely because `merged` was built in a different order. A test that
// cries wolf about key order is a test that gets ignored about data loss.
const canonCmp = (x) => {
  const sort = (y) => {
    if (Array.isArray(y)) return y.map(sort);
    if (y && typeof y === "object") {
      return Object.keys(y).sort().reduce((o, k) => { o[k] = sort(y[k]); return o; }, {});
    }
    return y;
  };
  return JSON.stringify(sort(x));
};
const eq = (a, b, msg) => assert(canonCmp(a) === canonCmp(b),
  msg + "  (got " + JSON.stringify(a) + ", wanted " + JSON.stringify(b) + ")");

// ————— 1. nothing anywhere —————
{
  const p = mergeProgress({}, {});
  eq(p.merged, {}, "empty/empty merges to nothing");
  assert(p.status === "clean", "empty/empty is clean");
}

// ————— 2. one side only — the two cases that MUST never ask —————
{
  const p = mergeProgress({ "tsumiki-kanji-progress-v1": '{"a":1}' }, {});
  eq(p.pushed, ["tsumiki-kanji-progress-v1"], "local-only key is pushed");
  eq(p.merged, { "tsumiki-kanji-progress-v1": '{"a":1}' }, "local-only key survives");
  assert(p.status === "clean", "local-only is not a conflict");
}
{
  const p = mergeProgress({}, { "tsumiki-kanji-progress-v1": '{"a":1}' });
  eq(p.pulled, ["tsumiki-kanji-progress-v1"], "remote-only key is pulled");
  eq(p.merged, { "tsumiki-kanji-progress-v1": '{"a":1}' }, "remote-only key survives");
  assert(p.status === "clean", "remote-only is not a conflict");
}

// ————— 3. THE HEADLINE CASE —————
// Kanji on the phone, grammar on the laptop. Two partial states, no genuine
// disagreement. A whole-document sync would make the learner destroy half of
// their own work to answer a question they should never have been asked.
{
  const local  = { "tsumiki-kanji-progress-v1": '{"k":1}', "tsumiki-known-kanji-v1": '["日"]' };
  const remote = { "tsumiki-n5-progress-v1": '{"g":1}',   "tsumiki-learner-depth-v1": '{"d":2}' };
  const p = mergeProgress(local, remote);
  assert(p.status === "clean", "disjoint devices do not conflict");
  eq(Object.keys(p.merged).sort(),
     ["tsumiki-kanji-progress-v1", "tsumiki-known-kanji-v1", "tsumiki-learner-depth-v1", "tsumiki-n5-progress-v1"],
     "disjoint devices merge to the union");
  assert(p.merged["tsumiki-kanji-progress-v1"] === '{"k":1}' && p.merged["tsumiki-n5-progress-v1"] === '{"g":1}',
    "union keeps both sides' values verbatim");
}

// ————— 4. placeholders are not rivals —————
// A module that was opened and not used writes "{}". Treating that as a rival
// to real progress raises a conflict over nothing, and a learner taught to
// dismiss the question will dismiss the real one too.
{
  const p = mergeProgress({ "tsumiki-n5-progress-v1": "{}" }, { "tsumiki-n5-progress-v1": '{"real":1}' });
  eq(p.pulled, ["tsumiki-n5-progress-v1"], "empty local yields to real remote");
  assert(p.status === "clean", "placeholder vs real is not a conflict");
}
{
  const p = mergeProgress({ "tsumiki-n5-progress-v1": '{"real":1}' }, { "tsumiki-n5-progress-v1": "[]" });
  eq(p.pushed, ["tsumiki-n5-progress-v1"], "empty remote yields to real local");
}

// ————— 5. same state, different serialisation —————
{
  const p = mergeProgress({ "tsumiki-known-words-v1": '{"a":1,"b":2}' },
                          { "tsumiki-known-words-v1": '{"b":2,"a":1}' });
  eq(p.same, ["tsumiki-known-words-v1"], "key order is not a disagreement");
  assert(p.conflicts.length === 0, "reordered JSON does not conflict");
}

// ————— 6. a real disagreement is REPORTED, never settled —————
// This is the assertion the whole file exists for. If `merged` ever gains a
// conflicted key, the app will apply it without asking, and one device's work
// is gone.
{
  const local  = { "tsumiki-kanji-progress-v1": '{"traced":["日"]}' };
  const remote = { "tsumiki-kanji-progress-v1": '{"traced":["月"]}' };
  const p = mergeProgress(local, remote);
  assert(p.status === "conflict", "differing content is a conflict");
  eq(p.conflicts, ["tsumiki-kanji-progress-v1"], "the differing key is named");
  assert(!("tsumiki-kanji-progress-v1" in p.merged),
    "A CONFLICTED KEY MUST NOT APPEAR IN merged — that is silent data loss");
}

// ————— 7. "0" is a value someone earned their way down to —————
{
  const p = mergeProgress({ "tsumiki-achievement-points-v1": "0" },
                          { "tsumiki-achievement-points-v1": "120" });
  assert(p.status === "conflict", "a spent wallet is not an empty wallet");
}

// ————— 8. non-JSON values compare as strings —————
{
  const p = mergeProgress({ "tsumiki-kanji-mode": "kun" }, { "tsumiki-kanji-mode": "on" });
  eq(p.conflicts, ["tsumiki-kanji-mode"], "plain strings still compare");
  const q = mergeProgress({ "tsumiki-kanji-mode": "kun" }, { "tsumiki-kanji-mode": "kun" });
  eq(q.same, ["tsumiki-kanji-mode"], "identical plain strings agree");
}

// ————— 9. resolution is explicit or it does not happen —————
{
  const local  = { "tsumiki-kanji-progress-v1": "L", "tsumiki-known-words-v1": "shared" };
  const remote = { "tsumiki-kanji-progress-v1": "R", "tsumiki-known-words-v1": "shared" };
  const p = mergeProgress(local, remote);

  const keepLocal = resolveConflicts(p, local, remote, "local");
  eq(keepLocal, { "tsumiki-known-words-v1": "shared", "tsumiki-kanji-progress-v1": "L" },
     "keeping the device fills conflicts from local");

  const keepRemote = resolveConflicts(p, local, remote, "remote");
  eq(keepRemote, { "tsumiki-known-words-v1": "shared", "tsumiki-kanji-progress-v1": "R" },
     "keeping the account fills conflicts from remote");

  let threw = false;
  try { resolveConflicts(p, local, remote); } catch { threw = true; }
  assert(threw, "there is no default side — an unspecified choice must throw");

  let threw2 = false;
  try { resolveConflicts(p, local, remote, "newest"); } catch { threw2 = true; }
  assert(threw2, "an unrecognised side must throw rather than guess");
}

// ————— 10. the plan does not mutate what it was given —————
{
  const local  = { "tsumiki-kanji-progress-v1": "L" };
  const remote = { "tsumiki-n5-progress-v1": "R" };
  const lc = JSON.stringify(local), rc = JSON.stringify(remote);
  const p = mergeProgress(local, remote);
  resolveConflicts(p, local, remote, "local");
  assert(JSON.stringify(local) === lc, "local input untouched");
  assert(JSON.stringify(remote) === rc, "remote input untouched");
}

// ————— 11. missing/undefined arguments are survivable —————
{
  const p = mergeProgress(null, { "tsumiki-kanji-progress-v1": "R" });
  eq(p.pulled, ["tsumiki-kanji-progress-v1"], "a null local is an empty local, not a crash");
  const q = mergeProgress({ "tsumiki-kanji-progress-v1": "L" }, null);
  eq(q.pushed, ["tsumiki-kanji-progress-v1"], "a null remote is an empty remote, not a crash");
}

// ————— 12. isEmptyValue, stated directly —————
{
  for (const v of ["", "  ", "{}", "[]", "null", "undefined", null, undefined]) {
    assert(isEmptyValue(v), "empty: " + JSON.stringify(v));
  }
  for (const v of ["0", "{\"a\":1}", "[1]", "kun", "false"]) {
    assert(!isEmptyValue(v), "NOT empty: " + JSON.stringify(v));
  }
}

// ————— 13. THE ONE EXEMPTION: a log key unions instead of asking —————
//
// The registry is EMPTY in the extracted core on purpose, so a test has to opt
// a key in deliberately — which is also what makes these assertions about
// DISPATCH rather than about any particular merger. The union's own properties
// (order-independence, idempotence) are test-error-history.py's job.
{
  registerLogMerger("log-key-v1", (l, r) => JSON.stringify(
    [...new Set([...JSON.parse(l), ...JSON.parse(r)])].sort()));

  const p = mergeProgress({ "log-key-v1": '["a","b"]' }, { "log-key-v1": '["b","c"]' });
  eq(p.conflicts, [], "a registered log key does NOT raise a conflict");
  eq(p.unioned, ["log-key-v1"], "...it is reported as unioned, not as clean");
  assert(p.status === "clean", "a unioned key leaves the plan clean");
  assert(p.merged["log-key-v1"] === '["a","b","c"]', "both sides survive the union");

  // An UNREGISTERED key with the same shape must still ask. If this ever goes
  // green the exemption has stopped being a named list and become a behaviour.
  const q = mergeProgress({ "tsumiki-kanji-progress-v1": '["a"]' }, { "tsumiki-kanji-progress-v1": '["b"]' });
  eq(q.conflicts, ["tsumiki-kanji-progress-v1"], "an unregistered key still asks");

  // ⚠️ WRONG TOWARD ASKING, NEVER TOWARD INVENTING. A merger that cannot do its
  // job must fall back to the question, not to a document it made up.
  registerLogMerger("broken-v1", () => null);
  const r = mergeProgress({ "broken-v1": "x" }, { "broken-v1": "y" });
  eq(r.conflicts, ["broken-v1"], "a merger returning null falls back to asking");

  registerLogMerger("throws-v1", () => { throw new Error("boom"); });
  const t = mergeProgress({ "throws-v1": "x" }, { "throws-v1": "y" });
  eq(t.conflicts, ["throws-v1"], "a merger that THROWS falls back to asking");

  // The exemption must not reach the other rules: one side only still wins
  // outright, and equal sides are still 'same', not 'unioned'.
  const u = mergeProgress({ "log-key-v1": '["a"]' }, {});
  eq(u.pushed, ["log-key-v1"], "one side only is still a push, not a union");
  const v = mergeProgress({ "log-key-v1": '["a"]' }, { "log-key-v1": '["a"]' });
  eq(v.same, ["log-key-v1"], "identical sides are still 'same', not a union");
}

// ————— 8. wouldWipeRemote — the 2026-09-07 wipe, as a test —————
// What a learner loses if these are wrong: everything on their account, replaced
// by a device that happened to have nothing. That is not hypothetical; it
// happened, and the archive trigger is the only reason it was recoverable.
{
  const REAL = { "tsumiki-kanji-progress-v1": '{"a":1}' };

  // The actual incident: both sides looked empty to the merge because the KEYS
  // filter had hollowed them out, so a clean {} was pushed over a live row.
  assert(wouldWipeRemote({}, REAL) === true,
    "THE INCIDENT: empty over a live account row is a wipe");

  // Emptiness spelled in the other ways a module writes it. If EMPTY_VALUES and
  // this guard ever disagree, a "{}"-shaped push walks straight past it.
  assert(wouldWipeRemote({ "tsumiki-kanji-progress-v1": "{}" }, REAL) === true,
    "a payload of placeholders is still empty");
  assert(wouldWipeRemote({}, { "tsumiki-kanji-progress-v1": "{}" }) === false,
    "a placeholder-only remote is not worth protecting");

  // ⚠️ THE THREE THAT MUST STAY FALSE. A guard that refuses real work gets
  // switched off, and then it is not a guard.
  assert(wouldWipeRemote({}, {}) === false, "empty over empty is not a wipe");
  assert(wouldWipeRemote(REAL, {}) === false, "a first push to a new account is not a wipe");
  assert(wouldWipeRemote({ "tsumiki-kanji-mode": "on" }, REAL) === false,
    "a SMALLER push is not a wipe — the guard judges empty, never less");

  // Missing/undefined sides must not throw: pushRemote reaches this with
  // whatever fetchRemote returned, and a row that has never existed has no data.
  assert(wouldWipeRemote({}, null) === false, "a null remote is not a wipe");
  assert(wouldWipeRemote(null, REAL) === true, "a null push over real data is still a wipe");
}

// ————— 9. THE AUTHORITATIVE LOAD (2026-09-16) —————
//
// Once a device has joined an account, a load answers the merge's question with
// "remote" instead of showing it. These assertions are about what that must NOT
// change — because the tempting implementation is `writeLocal(remote)`, one
// line, and it silently destroys three of the four rules above.
//
// Read each one as "what a learner loses if the load starts replacing the
// document instead of resolving the merge."
{
  const authoritative = (local, remote) => {
    const p = mergeProgress(local, remote);
    return p.conflicts.length ? resolveConflicts(p, local, remote, "remote") : p.merged;
  };

  // The case the reversal is FOR: this browser is behind, and it stops being
  // behind without anybody being asked anything.
  {
    const local  = { "tsumiki-kanji-progress-v1": '{"traced":["日"]}' };
    const remote = { "tsumiki-kanji-progress-v1": '{"traced":["日","月"]}' };
    eq(authoritative(local, remote), remote, "a differing key takes the account's copy");
  }

  // ⚠️ RULE 1 STILL HOLDS. A key this device has and the account does not is
  // work that simply has not been uploaded yet — usually because the learner
  // was offline. Replacing the document would delete it, and the learner would
  // have no way to know: the account never had it to archive.
  {
    const local  = { "tsumiki-kanji-progress-v1": '{"a":1}', "tsumiki-n5-progress-v1": '{"g":1}' };
    const remote = { "tsumiki-kanji-progress-v1": '{"a":2}' };
    const out = authoritative(local, remote);
    assert(out["tsumiki-n5-progress-v1"] === '{"g":1}',
      "A LOCAL-ONLY KEY SURVIVES THE AUTHORITATIVE LOAD — it was never pushed, so the account cannot have archived it");
    assert(out["tsumiki-kanji-progress-v1"] === '{"a":2}',
      "...and the key they both have still takes the account's copy");
  }

  // ⚠️ AN EMPTY ACCOUNT CANNOT WIPE A DEVICE. Same rule as ever — an empty
  // value is absent, not deleted — but it is load-bearing in a new way now
  // that nobody is asked. This is the 2026-09-07 wipe pointed the other way.
  {
    const local  = { "tsumiki-kanji-progress-v1": '{"a":1}' };
    eq(authoritative(local, {}), local, "an empty account leaves the device alone");
    eq(authoritative(local, { "tsumiki-kanji-progress-v1": "{}" }), local,
       "an account holding placeholders leaves the device alone");
  }

  // ⚠️ THE LOG EXEMPTION MUST SURVIVE IT. The union runs inside mergeProgress
  // and settles the key before the conflict list exists, so both devices' checks
  // are kept. If a future load resolved the log to "remote" instead, a learner
  // who wrote offline would lose those checks with nothing on screen to show it.
  {
    registerLogMerger("tsumiki-checker-history-v1", (l, r) => JSON.stringify(
      { ...JSON.parse(l), ...JSON.parse(r) }));
    const local  = { "tsumiki-checker-history-v1": '{"here":1}' };
    const remote = { "tsumiki-checker-history-v1": '{"there":1}' };
    const out = authoritative(local, remote);
    eq(JSON.parse(out["tsumiki-checker-history-v1"]), { here: 1, there: 1 },
       "the checker log is UNIONED on an authoritative load, not taken from the account");
  }

  // Nothing to settle is still nothing to settle.
  {
    const same = { "tsumiki-known-words-v1": '["本"]' };
    eq(authoritative(same, same), same, "identical sides pass through unchanged");
  }
}

// ————— 10. canonDoc — "is this push worth sending?" —————
//
// Autosave asks this before every request. Get it wrong in one direction and a
// quiet page files an archive version per load; wrong in the other and a real
// change is silently never uploaded.
{
  const KEYS = ["tsumiki-kanji-progress-v1", "tsumiki-known-words-v1", "tsumiki-kanji-mode"];

  assert(canonDoc({ "tsumiki-kanji-progress-v1": '{"a":1}' }, KEYS)
      === canonDoc({ "tsumiki-kanji-progress-v1": '{"a":1}' }, KEYS),
    "the same document compares equal");

  // The one that stops a version being filed on every load: a module that
  // rebuilds its own map can emit the same state with the keys in a different
  // order, and that is not a change.
  assert(canonDoc({ "tsumiki-kanji-progress-v1": '{"a":1,"b":2}' }, KEYS)
      === canonDoc({ "tsumiki-kanji-progress-v1": '{"b":2,"a":1}' }, KEYS),
    "re-serialised identical state is not a change");

  assert(canonDoc({ "tsumiki-kanji-progress-v1": '{"a":1}' }, KEYS)
      !== canonDoc({ "tsumiki-kanji-progress-v1": '{"a":2}' }, KEYS),
    "A REAL CHANGE IS A CHANGE — if this ever passes, work stops being saved");

  assert(canonDoc({ "tsumiki-kanji-progress-v1": '{"a":1}' }, KEYS)
      !== canonDoc({ "tsumiki-kanji-progress-v1": '{"a":1}', "tsumiki-known-words-v1": '["本"]' }, KEYS),
    "a new key is a change");

  // It must compare exactly what pushRemote would SEND: KEYS-filtered, so a
  // stray localStorage entry from another tool on the same origin cannot make
  // the app think it has something to upload.
  assert(canonDoc({ "tsumiki-kanji-progress-v1": "x", "not-ours": "y" }, KEYS)
      === canonDoc({ "tsumiki-kanji-progress-v1": "x" }, KEYS),
    "a key outside KEYS is not part of the document");

  // Insertion order of the map itself is not content either.
  const a = {}; a["tsumiki-known-words-v1"] = '["本"]'; a["tsumiki-kanji-mode"] = "kana";
  const b = {}; b["tsumiki-kanji-mode"] = "kana"; b["tsumiki-known-words-v1"] = '["本"]';
  assert(canonDoc(a, KEYS) === canonDoc(b, KEYS), "key order in the map is not content");

  assert(canonDoc(null, KEYS) === canonDoc({}, KEYS), "a null document is an empty one, not a crash");
}

// ————— 11. THE STALE READ, as a decision (finding 2, Session 33 log read) —————
//
// MEASURED, Supabase edge logs 2026-09-17: a pagehide POST at 14:06:17.105, the
// next page's GET at 14:06:17.132, and the row's own updated_at at 14:06:18.387.
// The reader was a full second ahead of the writer, so the authoritative load
// was handed a copy of the account that was one save behind and would have
// treated it as the truth — reverting the learner's newest work on screen and
// then pushing the reverted document up as the new truth.
//
// The whole decision is `remembered` vs `returned`, and these assertions are the
// three the fix rests on. Read them as "what a learner loses if the comparison
// points the wrong way."
{
  // The headline three.
  assert(loadDecision(6, 5, 99) === "keep-local",
    "REMEMBERED 6, RETURNED 5: the read is behind, so the account must NOT win");
  assert(loadDecision(6, 6, 0) === "account",
    "REMEMBERED 6, RETURNED 6: nothing is wrong and the account wins as ever");
  assert(loadDecision(6, 7, 0) === "account",
    "REMEMBERED 6, RETURNED 7: another device moved it on — that is not stale");

  // ⚠️ THE ASYMMETRY IS THE WHOLE GUARD. A version the server REPORTED cannot be
  // un-reached, so lower-than-confirmed is proof. Nothing else is evidence of
  // anything, and in particular a higher version must never be read as trouble:
  // that is an ordinary second device, and refusing it would break sync.
  assert(readIsStale(6, 5) === true, "lower than confirmed is stale");
  assert(readIsStale(6, 6) === false, "equal is not stale");
  assert(readIsStale(6, 7) === false, "HIGHER IS NOT STALE — that is just another device");

  // Nothing confirmed yet: a device that has never completed a push has no
  // watermark and cannot judge. It must yield, or a brand-new device would
  // refuse the account's copy on its very first load.
  assert(readIsStale(0, 5) === false, "no watermark means no judgement");
  assert(readIsStale(null, 5) === false, "a null watermark means no judgement");
  assert(readIsStale(undefined, 5) === false, "an undefined watermark means no judgement");

  // ⚠️ A READ WE CANNOT PLACE IS TREATED AS BEHIND. The costs are not
  // symmetric — a false "stale" costs one extra POST, a false "trustworthy"
  // reverts the learner's work — and it makes the guard fail LOUDLY: if
  // `version` is ever dropped from the select, every load takes keep-local and
  // 12a goes red, rather than the guard quietly becoming a no-op while the app
  // keeps reporting success.
  assert(readIsStale(6, undefined) === true, "a read without a version is not trusted");
  assert(readIsStale(6, null) === true, "a null version is not trusted");
  assert(readIsStale(6, "nonsense") === true, "an unparseable version is not trusted");

  // A missing row reads as version 0, and against a watermark of 6 that IS
  // stale: the row cannot go away, so a 0 means the read did not see it.
  assert(readIsStale(6, 0) === true, "a row that reads as absent, after a confirmed push, is a stale read");

  // ...and none of that fires before the first confirmed push, or a brand-new
  // device would refuse its own account on its very first load.
  assert(readIsStale(0, undefined) === false, "no watermark still means no judgement");

  // ⚠️ THE RETRY BOUND IS THE LENGTH OF THE SCHEDULE, so there is one place to
  // change it. If these ever disagree the load either gives up early or waits in
  // a loop on every page view.
  assert(STALE_RETRY_MS.length === 2, "at most two re-reads");
  assert(loadDecision(6, 5, 0) === "reread", "first stale read is re-read");
  assert(loadDecision(6, 5, 1) === "reread", "second stale read is re-read");
  assert(loadDecision(6, 5, 2) === "keep-local",
    "AFTER THE BUDGET IT STOPS RE-READING — a bound that is not enforced is a spin");
}

// ————— 12. reconcile: the order, the lock, and the stale branch —————
//
// `reconcile` is the read-merge-write, with every side effect injected, so the
// ORDER of its steps can be asserted without React or a network. Four separate
// orderings are load-bearing and none of them could be tested while this lived
// inside a component:
//
//   · local is written BEFORE the push          (a failed upload leaves MORE, never less)
//   · autosave is armed BEFORE the push          (a write mid-flight is not dropped)
//   · the account's copy is preferred ONLY when the read can be trusted
//   · exactly one reconcile runs at a time, across the whole browser
{
  // One fake world: one "server row", one "localStorage", and a lock that is
  // shared between the simulated tabs exactly as navigator.locks is shared
  // between real ones.
  const makeWorld = ({ local = {}, remote = {}, version = 1, joined = null,
                       remembered = 0, staleReads = 0 } = {}) => {
    const w = {
      store: { ...local },
      row: { data: { ...remote }, version },
      joined,
      remembered,
      staleReads,          // how many of the first reads come back behind
      reads: 0,
      posts: [],
      sleeps: [],
      armed: [],
      wrote: [],
      asked: 0,
      order: [],
    };
    // A promise-chain mutex, shared by every io built from this world. Stands in
    // for navigator.locks: one holder at a time, FIFO for the waiters.
    let tail = Promise.resolve();
    w.lock = (fn) => {
      const mine = tail.then(fn, fn);
      // Keep the chain alive whatever fn did, or one rejection deadlocks the
      // rest — which is also what a real lock does not do.
      tail = mine.then(() => {}, () => {});
      return mine;
    };
    return w;
  };

  const io = (w, over = {}) => ({
    keys: ["tsumiki-kanji-progress-v1", "tsumiki-n5-progress-v1", "tsumiki-known-words-v1"],
    joined: () => { w.order.push("joined?"); return w.joined === "yes"; },
    markJoined: () => { w.order.push("markJoined"); w.joined = "yes"; },
    readLocal: () => ({ ...w.store }),
    writeLocal: (m) => { w.order.push("writeLocal"); w.wrote.push(m); w.store = { ...m }; },
    fetchRemote: async () => {
      w.order.push("fetch");
      w.reads += 1;
      // The first `staleReads` reads report a version BEHIND the watermark, as a
      // read that lands before a commit does.
      const behind = w.reads <= w.staleReads;
      return { data: { ...w.row.data }, version: behind ? w.remembered - 1 : w.row.version };
    },
    pushRemote: async (m) => {
      w.order.push("push");
      w.posts.push(m);
      w.row = { data: { ...m }, version: w.row.version + 1 };
      // A real push is told the new version and writes it down; the watermark
      // is what makes the NEXT load able to spot a stale read.
      w.remembered = Math.max(w.remembered, w.row.version);
    },
    arm: (c) => { w.order.push("arm"); w.armed.push(c); },
    rememberedVersion: () => w.remembered,
    sleep: async (ms) => { w.sleeps.push(ms); },
    onConflict: async () => { w.asked += 1; return "remote"; },
    lock: w.lock,
    ...over,
  });

  // ————— 12a. the ordinary quiet load: one read, no write to the server —————
  {
    const doc = { "tsumiki-kanji-progress-v1": '{"a":1}' };
    const w = makeWorld({ local: doc, remote: doc, version: 4, joined: "yes", remembered: 4 });
    const r = await reconcile(io(w));
    assert(r.path === "load", "a joined device takes the load path");
    assert(r.stale === false, "an up-to-date read is not stale");
    assert(w.reads === 1, "a trustworthy read is read ONCE — no retry, no delay");
    eq(w.sleeps, [], "AND NOTHING WAITS. A fixed delay on the load path would be felt on every load");
    eq(w.posts, [], "a quiet load costs a GET and no POST");
    assert(w.armed.length === 1, "autosave is armed even when there is nothing to send");
  }

  // ————— 12b. the account is ahead: it wins, silently —————
  {
    const w = makeWorld({
      local:  { "tsumiki-kanji-progress-v1": '{"traced":["日"]}' },
      remote: { "tsumiki-kanji-progress-v1": '{"traced":["日","月"]}' },
      version: 9, joined: "yes", remembered: 9,
    });
    const r = await reconcile(io(w));
    assert(r.stale === false, "equal versions are trusted");
    assert(w.store["tsumiki-kanji-progress-v1"] === '{"traced":["日","月"]}',
      "the account's copy is applied to the device");
    assert(w.order.indexOf("writeLocal") < w.order.indexOf("arm"),
      "local is written before autosave is armed");
  }

  // ————— 12c. ⚠️ THE STALE READ: the account does NOT win —————
  // remembered 6, every read returns 5. This is the failure the fix exists for:
  // without it, `local` is reverted to a document that is provably out of date
  // and the next autosave pushes the reverted state up as the truth.
  {
    const w = makeWorld({
      local:  { "tsumiki-kanji-progress-v1": '{"traced":["日","月"]}' },
      remote: { "tsumiki-kanji-progress-v1": '{"traced":["日"]}' },
      version: 5, joined: "yes", remembered: 6, staleReads: 99,
    });
    const r = await reconcile(io(w));
    assert(r.stale === true, "a read that stays behind is reported as stale");
    assert(w.store["tsumiki-kanji-progress-v1"] === '{"traced":["日","月"]}',
      "THE LEARNER'S NEWEST WORK SURVIVES A STALE READ — it is not reverted to the account's older copy");
    assert(w.reads === 3, "one read plus at most two re-reads");
    eq(w.sleeps, STALE_RETRY_MS, "the re-reads back off on the published schedule");
    assert(w.posts.length === 1,
      "AND IT PUSHES: the account is told what this device holds rather than being left ahead of it");
    eq(w.posts[0], { "tsumiki-kanji-progress-v1": '{"traced":["日","月"]}' },
      "what is pushed is what the device kept");
    assert(r.cameBack === 0, "nothing 'came back from the account' on a stale load — nothing was taken from it");
  }

  // ————— 12d. a read that is behind and then catches up —————
  // The common case the retry is FOR: the commit lands during the backoff, so
  // the account wins after all and nobody is asked anything.
  {
    const w = makeWorld({
      local:  { "tsumiki-kanji-progress-v1": '{"a":1}' },
      remote: { "tsumiki-kanji-progress-v1": '{"a":2}' },
      version: 6, joined: "yes", remembered: 6, staleReads: 1,
    });
    const r = await reconcile(io(w));
    assert(r.stale === false, "a read that catches up is not stale");
    assert(w.reads === 2, "it re-read exactly once and then stopped");
    eq(w.sleeps, [STALE_RETRY_MS[0]], "only the first backoff was spent");
    assert(w.store["tsumiki-kanji-progress-v1"] === '{"a":2}', "and then the account wins normally");
  }

  // ————— 12e. RULE 1 AND THE STALE BRANCH ARE NOT IN CONFLICT —————
  // Keeping local must not mean "ignore the account". A key only the account has
  // cannot be a disagreement, so it still comes back — and it must, because
  // pushing a document without it would delete it from the row.
  {
    const w = makeWorld({
      local:  { "tsumiki-kanji-progress-v1": '{"a":1}' },
      remote: { "tsumiki-kanji-progress-v1": '{"a":2}', "tsumiki-n5-progress-v1": '{"g":1}' },
      version: 5, joined: "yes", remembered: 6, staleReads: 99,
    });
    await reconcile(io(w));
    assert(w.store["tsumiki-n5-progress-v1"] === '{"g":1}',
      "A REMOTE-ONLY KEY STILL COMES BACK ON A STALE READ — rule 1 never asked a version number");
    assert(w.store["tsumiki-kanji-progress-v1"] === '{"a":1}',
      "...while the key they both have keeps the device's copy");
    // ⚠️ INDEXED DEFENSIVELY ON PURPOSE. The negative control for the stale
    // check makes this branch push nothing at all, and `w.posts[0][...]` would
    // then THROW — which aborts the run and hides every assertion after it. A
    // test that crashes instead of reporting is worse than one that fails.
    assert((w.posts[0] || {})["tsumiki-n5-progress-v1"] === '{"g":1}',
      "and the push carries it, so the row does not lose it");
  }

  // ————— 12f. a stale read pushes even with nothing to say —————
  // The only thing it could compare against is the document it just decided not
  // to trust, so it does not compare. The archive trigger files no version when
  // `data` is unchanged, so this costs a round trip and nothing else.
  {
    const doc = { "tsumiki-kanji-progress-v1": '{"a":1}' };
    const w = makeWorld({ local: doc, remote: doc, version: 5, joined: "yes",
                          remembered: 6, staleReads: 99 });
    await reconcile(io(w));
    assert(w.posts.length === 1, "the stale branch pushes unconditionally");
  }

  // ————— 12g. the watermark cannot make a FIRST sign-in refuse the account —————
  // A not-joined device runs the genuine merge, and the stale check is not on
  // that path at all. If it ever were, a new device with a stray watermark would
  // silently decline its own account.
  {
    const w = makeWorld({
      local: { "tsumiki-kanji-progress-v1": '{"a":1}' },
      remote: {}, version: 5, joined: null, remembered: 99, staleReads: 99,
    });
    const r = await reconcile(io(w));
    assert(r.path === "merged", "a first sign-in merges");
    eq(w.sleeps, [], "the stale check does not run on the first sign-in");
    assert(w.joined === "yes", "and the device is recorded as joined");
  }

  // ————— 12h. ⚠️ FINDING 1: TWO TABS, ONE MERGE —————
  //
  // MEASURED, same account, sign-in at 13:54:53: two OPTIONS preflights 2ms
  // apart, two GETs, two POSTs — and only ONE GET /auth/v1/user in the whole
  // sign-in. That last number is the identification: the magic-link flow makes
  // two tabs by its nature, supabase-js hands the finished session to the other
  // tab over a BroadcastChannel with no network call, and both tabs run the sign-in
  // sync against the same localStorage and the same account row.
  //
  // The fix is ORDER. The second run waits, then re-evaluates from scratch — and
  // by then markJoined has happened, so it takes the load path and finds nothing
  // to do. Note what is NOT here: no detection, no "am I first?", no timestamp.
  {
    const w = makeWorld({
      local: { "tsumiki-kanji-progress-v1": '{"a":1}' },
      remote: {}, version: 1, joined: null,
    });
    // Both "tabs" start together, as two tabs receiving the same SIGNED_IN do.
    const [a, b] = await Promise.all([reconcile(io(w)), reconcile(io(w))]);

    const paths = [a.path, b.path].sort();
    eq(paths, ["load", "merged"],
      "EXACTLY ONE RUN MERGES; THE SECOND TAKES THE JOINED PATH");
    assert(w.posts.length === 1,
      "ONE POST, NOT TWO — the second tab has nothing to say once the first has spoken");
    assert(w.asked === 0, "and nobody was asked anything: there was no disagreement");
  }

  // ⚠️ THE CONTROL, because a guard that has only ever refused has not been
  // tested. Remove the lock and the SAME fixture must produce the doubled sync
  // that was measured — two merges, two POSTs. If this ever agrees with the
  // locked case, the assertions above are not testing the lock.
  {
    const w = makeWorld({
      local: { "tsumiki-kanji-progress-v1": '{"a":1}' },
      remote: {}, version: 1, joined: null,
    });
    const unlocked = io(w, { lock: null });
    const [a, b] = await Promise.all([reconcile(unlocked), reconcile(io(w, { lock: null }))]);
    eq([a.path, b.path], ["merged", "merged"],
      "CONTROL: with no lock BOTH runs merge — this is the measured bug, reproduced");
    assert(w.posts.length === 2, "CONTROL: and both push");
  }

  // ————— 12i. ⚠️ AND THE ONE THAT ACTUALLY COSTS A LEARNER SOMETHING —————
  // A device with progress that genuinely conflicts. Without the lock BOTH tabs
  // put the conflict question on screen; the learner answers one, the other still
  // holds the old question with the old sides, and answering it — or answering it
  // differently — overwrites the first answer. Two open copies of the one
  // question the whole flow exists to ask exactly once.
  {
    const w = makeWorld({
      local:  { "tsumiki-kanji-progress-v1": '{"traced":["日"]}' },
      remote: { "tsumiki-kanji-progress-v1": '{"traced":["月"]}' },
      version: 1, joined: null,
    });
    const [a, b] = await Promise.all([reconcile(io(w)), reconcile(io(w))]);
    assert(w.asked === 1,
      "THE CONFLICT QUESTION IS ASKED ONCE ACROSS TWO TABS — not once per tab");
    const paths = [a.path, b.path].sort();
    eq(paths, ["load", "settled"],
      "one tab settles the question; the other re-evaluates and takes the load path");
    assert(w.posts.length === 1, "one answer, one push");
  }

  {
    const w = makeWorld({
      local:  { "tsumiki-kanji-progress-v1": '{"traced":["日"]}' },
      remote: { "tsumiki-kanji-progress-v1": '{"traced":["月"]}' },
      version: 1, joined: null,
    });
    await Promise.all([reconcile(io(w, { lock: null })), reconcile(io(w, { lock: null }))]);
    assert(w.asked === 2,
      "CONTROL: with no lock the question is asked TWICE — the measured failure, as a test");
  }

  // ————— 12j. a reconcile that is abandoned releases the lock —————
  // The learner closes the panel, or signs out, with the question unanswered.
  // account.jsx rejects the gate rather than settling on their behalf; if that
  // did not release the lock, every other tab would wait forever on a reconcile
  // that is never going to finish.
  {
    const w = makeWorld({
      local:  { "tsumiki-kanji-progress-v1": "L" },
      remote: { "tsumiki-kanji-progress-v1": "R" },
      version: 1, joined: null,
    });
    const abandon = io(w, {
      onConflict: async () => {
        w.asked += 1;
        const e = new Error("closed"); e.code = "abandoned"; throw e;
      },
    });
    let first = "resolved";
    await reconcile(abandon).catch((e) => { first = e.code; });
    assert(first === "abandoned", "an unanswered question unwinds rather than settling");
    assert(w.posts.length === 0, "AND NOTHING WAS WRITTEN — no answer means no settle");
    // The lock must be free: a second run gets through.
    const r = await reconcile(io(w));
    assert(r.path === "settled", "the next run can still ask, so the lock was released");
  }

  // ————— 12k. the error says whether this device was changed —————
  // "Nothing on this device was changed" is a real promise. It must not be made
  // on a path that had already written the settled document before the upload
  // failed, and that is the only thing distinguishing the two messages.
  {
    const w = makeWorld({ local: { "tsumiki-kanji-progress-v1": "L" }, remote: {},
                          version: 1, joined: null });
    let err = null;
    await reconcile(io(w, { pushRemote: async () => { throw new Error("offline"); } }))
      .catch((e) => { err = e; });
    assert(err && err.localWritten === true,
      "a failure AFTER the local write says so, so the message cannot claim otherwise");
  }
  {
    const w = makeWorld({ local: { "tsumiki-kanji-progress-v1": "L" }, remote: {},
                          version: 1, joined: null });
    let err = null;
    await reconcile(io(w, { fetchRemote: async () => { throw new Error("offline"); } }))
      .catch((e) => { err = e; });
    assert(err && err.localWritten === false,
      "a failure BEFORE it says that too — and autosave was never armed");
    assert(w.armed.length === 0,
      "A DEVICE THAT COULD NOT READ THE ACCOUNT MUST NOT WRITE TO IT");
  }

  // ————— 12l. joined-state is read INSIDE the lock —————
  // The second tab's whole correctness rests on re-evaluating after waiting. If
  // `joined()` were read before taking the lock, the lock would be decoration:
  // both tabs would have captured "not joined" and both would merge.
  {
    const w = makeWorld({
      local: { "tsumiki-kanji-progress-v1": '{"a":1}' },
      remote: {}, version: 1, joined: null,
    });
    const seen = [];
    const spy = (over) => io(w, { joined: () => { seen.push(w.joined); return w.joined === "yes"; }, ...over });
    await Promise.all([reconcile(spy({})), reconcile(spy({}))]);
    eq(seen, [null, "yes"],
      "THE SECOND RUN READS joined() AFTER THE FIRST HAS SET IT — it did not capture a stale answer");
  }
}

if (failures) {
  console.error("\n" + failures + " ASSERTION(S) FAILED");
  process.exit(1);
}
console.log("ALL PROGRESS-SYNC TESTS PASS");
