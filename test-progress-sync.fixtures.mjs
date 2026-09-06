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

if (failures) {
  console.error("\n" + failures + " ASSERTION(S) FAILED");
  process.exit(1);
}
console.log("ALL PROGRESS-SYNC TESTS PASS");
