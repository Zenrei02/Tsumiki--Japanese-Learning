// ————— Storage —————
// The artifact sandbox provides a `window.storage` object. A normal browser does
// not, so every module would silently forget everything: `loadProgress()` returns
// {} on every launch, the app appears to run, and a tester reports "it doesn't
// save." That failure is invisible without this file.
//
// Here it is real: localStorage, with an in-memory fallback because Chrome blocks
// localStorage on `file://` in some configurations and in private windows.
//
// The API shape deliberately matches the artifact host exactly —
//   get(key) -> { value } | null
//   set(key, value)
// so the module source needs no changes at all. Same code, real backing store.
//
// ⚠️ AND `set` IS NOW ALSO THE SAVE-TO-ACCOUNT TRIGGER. Every progress write in
// the app funnels through it, which is why the debounce lives here and not as a
// save call sprinkled through thirteen modules — see lib/autosave.js. A module
// does not have to remember to announce anything; writing IS the announcement.

import { noteWrite } from "./autosave.js";

const memory = new Map();

let backing = null;
function store() {
  if (backing) return backing;
  try {
    const probe = "__tsumiki_probe__";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    backing = window.localStorage;
  } catch {
    console.warn(
      "localStorage unavailable — progress will last only for this tab. " +
      "Usually a private window, or a browser blocking site data."
    );
    backing = {
      getItem: (k) => (memory.has(k) ? memory.get(k) : null),
      setItem: (k, v) => memory.set(k, v),
      removeItem: (k) => memory.delete(k),
      key: (i) => Array.from(memory.keys())[i] ?? null,
      get length() { return memory.size; },
    };
  }
  return backing;
}

export const storage = {
  async get(key) {
    const value = store().getItem(key);
    return value == null ? null : { value };
  },
  async set(key, value) {
    store().setItem(key, String(value));
    // Only keys the account holds. `tsumiki-last-module` and the other UI-state
    // keys in check-storage-keys.py's IGNORE list are never uploaded, so they
    // must not be able to schedule an upload either.
    if (KEYS.includes(key)) noteWrite(key);
  },
};

// Modules call `window.storage` directly, unchanged from the artifact build.
// Installing it here means the module source stays byte-identical to the source
// of truth, which is what lets build-vite-app.py regenerate rather than fork.
export function installStorage() {
  if (typeof window !== "undefined" && !window.storage) window.storage = storage;
}

// ————— Export / import —————
// Progress lives in one browser on one device. A tester who clears their browser
// loses everything, and there is no account system yet (deliberately — see
// stitching-decision-v1.md). These two functions are the cheap insurance, and
// they double as the only way to see what a tester actually did.

// Every key the modules read or write. Listed explicitly rather than dumping all
// of localStorage, so an export never carries unrelated site data.
//
// ⚠️ THIS LIST DRIFTED ONCE AND THE FAILURE WAS SILENT. It was written for the
// four static modules and never updated when the grammar module landed, so
// `tsumiki-n5-progress-v1` — the biggest module in the app, the one Home calls "the
// heart of the app" — was omitted from every export. A learner who saved,
// cleared their browser and restored got ALL of their grammar progress dropped
// and a message reading "Restored 7 saved items." Success text over a partial
// restore. Fixed 2026-09-04; `check-storage-keys.py` now fails the build if a
// module writes a key that is not listed here.
//
// ⚠️ AND IT WAS ABOUT TO HAPPEN AGAIN, one file away. `tsumiki-engagement-v1` is written
// by engagement-module.jsx, which is AUTHORED AT THE REPO ROOT and not yet
// spliced into tsumiki-app/ — so the new check could not see it either, because
// its first version scanned only src/modules/*.jsx. The key is listed here BEFORE
// the splice, deliberately: the fix lands ahead of the bug rather than behind it.
// (2026-09-05 audit. The check now scans the root authoring modules too.)
//
// THE GENERAL RULE, since this has now cost two modules: a key belongs in this
// list when it is WRITTEN, not when its module reaches a build.
export const KEYS = [
  "tsumiki-hiragana-progress-v2",
  "tsumiki-katakana-progress-v1",
  "tsumiki-kanji-progress-v1",
  "tsumiki-known-kanji-v1",
  "tsumiki-known-words-v1",
  "tsumiki-n5-progress-v1",     // grammar — MISSING until 2026-09-04, see above
  "tsumiki-learner-depth-v1",   // grammar — MISSING until 2026-09-04, see above
  "tsumiki-achievement-points-v1",
  "tsumiki-engagement-v1",      // streak / rhythm / quests — listed ahead of the splice
  "tsumiki-stroke-data-v1",   // shared handwriting calibration — the reason one origin matters
  "tsumiki-kanji-mode",
  "tsumiki-module-recency-v1",  // when each section was last WORKED IN — orders Home
  // The checker's first store, and the app's first LOG rather than STATE.
  // It is exempt from the ask-on-conflict rule in sync.js and unioned
  // instead — see LOG_KEYS there and error-history-design-v1.md.
  "tsumiki-checker-history-v1",
];

// ————— Which account this device has already joined —————
//
// ⚠️ THIS KEY MUST NEVER ENTER `KEYS`. It is the one piece of state that has to
// mean something DIFFERENT on each device, and uploading it would make every
// device claim to have already joined the account the moment one of them had —
// which is precisely the claim the first-sign-in merge exists to check. It is
// written through the raw store rather than `storage.set` for the same reason:
// it is not progress and must not schedule an upload of itself.
//
// What it answers: "has this browser already settled its progress against this
// account?" If yes, a later sign-in is a LOAD and the account's copy wins
// silently. If no — a new device, or a device that signed out since — the
// account and this browser are two independent histories and sign-in is a
// genuine merge, question and all. See lib/account.jsx.
const JOINED_KEY = "tsumiki-account-joined-v1";

export function joinedAccount() {
  try { return store().getItem(JOINED_KEY); } catch { return null; }
}
export function markAccountJoined(userId) {
  try { store().setItem(JOINED_KEY, String(userId)); } catch { /* memory fallback */ }
}
// ⚠️ CLEARED ON SIGN-OUT, DELIBERATELY. Signing out leaves this device's
// progress where it is and lets the learner keep working — so by the time they
// sign back in, this browser may hold work the account never saw. That is the
// same two-independent-histories situation as a brand-new device, and it gets
// the same answer: merge, and ask if the two genuinely disagree.
export function clearAccountJoined() {
  try { store().removeItem(JOINED_KEY); } catch { /* memory fallback */ }
}

export function exportProgress() {
  const data = {};
  for (const k of KEYS) {
    const v = store().getItem(k);
    if (v != null) data[k] = v;
  }
  return {
    format: "tsumiki-progress",
    version: 1,
    exported: new Date().toISOString(),
    keys: Object.keys(data).length,
    data,
  };
}

export function downloadProgress() {
  const blob = new Blob([JSON.stringify(exportProgress(), null, 1)],
                        { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tsumiki-progress-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Returns { ok, message }. Never throws at the caller — a tester restoring a
// wrong file should get a sentence, not a stack trace.
//
// ⚠️ `save` IS NOT A TIDINESS OPTION. A restore from a file is the learner
// putting real work back, and with the account authoritative on load it would
// be undone by the next page load unless it reaches the account — so the
// default is to announce every restored key. sync.js's writeLocal() passes
// false, and it is the ONLY caller that may: what it is writing is what the
// account just gave us, so announcing it would schedule a push of the server's
// own document straight back at it.
export function importProgress(text, { save = true } = {}) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, message: "That file isn't readable as progress data." };
  }
  // ⚠️ BOTH NAMES ARE ACCEPTED, AND THE OLD ONE IS NOT DEAD WEIGHT.
  // Files exported before the 2026-09-06 rename carry `naoshi-progress`. They
  // are sitting on testers' disks right now, and they are the only undo a
  // DEVICE has. RENAME-NOTES.md §1 said to do exactly this and it was missed;
  // rejecting them turned "restore my progress" into "That looks like a
  // different kind of file." Keep reading both for as long as anyone might
  // still hold one — which is longer than it feels.
  const FORMATS = new Set(["tsumiki-progress", "naoshi-progress"]);
  if (!FORMATS.has(parsed?.format) || !parsed.data) {
    return { ok: false, message: "That looks like a different kind of file." };
  }
  // ⚠️ AND ACCEPTING THE OLD FORMAT STRING ALONE WOULD HAVE FIXED NOTHING.
  // A pre-rename file's KEYS are the pre-rename names too, so every one of them
  // would fall through `KEYS.includes(k)` and the restore would report "That
  // file had nothing in it." — a second, quieter version of the same refusal.
  // The rename was a pure prefix, so the mapping is mechanical rather than a
  // table to keep in sync: `stroke-data-v1` -> `tsumiki-stroke-data-v1`.
  const resolve = (k) => {
    if (KEYS.includes(k)) return k;
    const prefixed = "tsumiki-" + k;
    return KEYS.includes(prefixed) ? prefixed : null;
  };
  let n = 0;
  for (const [k, v] of Object.entries(parsed.data)) {
    const key = resolve(k);
    if (key) { store().setItem(key, v); n++; if (save) noteWrite(key); }
  }
  return {
    ok: true,
    message: n
      ? `Restored ${n} saved item${n === 1 ? "" : "s"}. Reload to see it.`
      : "That file had nothing in it.",
  };
}
