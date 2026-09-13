// Fixtures for test-import-format.py.
//
// WHAT THIS GUARDS: restoring a progress file that was exported BEFORE the
// 2026-09-06 rename. Those files carry `format: "naoshi-progress"` and
// pre-rename key names, and for six days the live site refused them twice over
// — once on the format string ("That looks like a different kind of file."),
// and again on the keys, which would have reported "That file had nothing in
// it." even if the format check had passed.
//
// That mattered because a device has no other undo. The account has the archive
// trigger; a browser has this file and nothing else.
//
// storage.js is imported directly, so these assertions run against the shipped
// code rather than a copy. There is no `window` here, so store() falls through
// its own try/catch to the in-memory backing — which is the documented
// behaviour, not a workaround.

import { importProgress, exportProgress, KEYS } from "./tsumiki-app/src/lib/storage.js";

let failures = 0;
const assert = (cond, msg) => {
  if (!cond) { console.error("FAIL: " + msg); failures++; }
};

const file = (format, data) => JSON.stringify({ format, version: 1, data });

// ————— 1. THE PRE-RENAME FILE. Both halves, or neither is fixed. —————
{
  const old = file("naoshi-progress", {
    "hiragana-progress-v2": '{"a":1}',
    "n5-progress-v1": '{"step":4}',
    "stroke-data-v1": '{"cal":9}',
  });
  const r = importProgress(old);
  assert(r.ok === true, "a pre-rename file is accepted at all");
  assert(/Restored 3 saved items/.test(r.message),
    "all three keys land — not 'That file had nothing in it.'  (got: " + r.message + ")");

  // They must land under the NEW names, or the app cannot read them back.
  const back = exportProgress().data;
  assert(back["tsumiki-hiragana-progress-v2"] === '{"a":1}', "old key restored under the tsumiki- name");
  assert(back["tsumiki-n5-progress-v1"] === '{"step":4}', "the grammar key — the one that shipped missing before");
  assert(back["tsumiki-stroke-data-v1"] === '{"cal":9}', "the shared calibration key");
}

// ————— 2. The current format still works, unchanged —————
{
  const r = importProgress(file("tsumiki-progress", { "tsumiki-kanji-progress-v1": '{"k":2}' }));
  assert(r.ok === true && /Restored 1 saved item\./.test(r.message),
    "a current-format file still restores  (got: " + r.message + ")");
  assert(exportProgress().data["tsumiki-kanji-progress-v1"] === '{"k":2}', "current-format value lands");
}

// ————— 3. ⚠️ WHAT MUST STILL BE REFUSED —————
// Accepting a second format is one step from accepting anything. A restore that
// silently swallows an unrelated JSON file is worse than one that refuses a
// real one, because the learner walks away believing it worked.
{
  assert(importProgress("{not json").ok === false, "unreadable text is refused");
  assert(importProgress(file("something-else", { "tsumiki-kanji-mode": "on" })).ok === false,
    "an unrelated format is still refused");
  assert(importProgress(JSON.stringify({ version: 1, data: {} })).ok === false,
    "a file with no format at all is refused");

  // A key the app does not own must not be written, whichever format claims it.
  const r = importProgress(file("naoshi-progress", { "some-other-tool-v1": "x" }));
  assert(r.ok === true && /nothing in it/.test(r.message),
    "an unowned key is dropped, and the message says so  (got: " + r.message + ")");
  assert(exportProgress().data["some-other-tool-v1"] === undefined, "unowned key never written");
  assert(exportProgress().data["tsumiki-some-other-tool-v1"] === undefined,
    "and prefixing it does not smuggle it in either");
}

// ————— 4. The mapping is the rename, not a hand-kept table —————
// If a future key is added that does NOT follow the prefix rule, this is where
// it surfaces, rather than in a learner's failed restore.
{
  const unprefixed = KEYS.filter((k) => !k.startsWith("tsumiki-"));
  assert(unprefixed.length === 0,
    "every KEY carries the tsumiki- prefix, so stripping it is a total mapping  (stray: " +
    JSON.stringify(unprefixed) + ")");
}

if (failures) {
  console.error("\n" + failures + " ASSERTION(S) FAILED");
  process.exit(1);
}
console.log("ALL IMPORT-FORMAT TESTS PASS");
