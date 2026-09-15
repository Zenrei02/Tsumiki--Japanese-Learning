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

if (failures) {
  console.error("\n" + failures + " ASSERTION(S) FAILED");
  process.exit(1);
}
console.log("ALL PROGRESS-SYNC TESTS PASS");
