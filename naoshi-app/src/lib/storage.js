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

const memory = new Map();

let backing = null;
function store() {
  if (backing) return backing;
  try {
    const probe = "__naoshi_probe__";
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
// `n5-progress-v1` — the biggest module in the app, the one Home calls "the
// heart of the app" — was omitted from every export. A learner who saved,
// cleared their browser and restored got ALL of their grammar progress dropped
// and a message reading "Restored 7 saved items." Success text over a partial
// restore. Fixed 2026-09-04; `check-storage-keys.py` now fails the build if a
// module writes a key that is not listed here.
//
// ⚠️ AND IT WAS ABOUT TO HAPPEN AGAIN, one file away. `engagement-v1` is written
// by engagement-module.jsx, which is AUTHORED AT THE REPO ROOT and not yet
// spliced into naoshi-app/ — so the new check could not see it either, because
// its first version scanned only src/modules/*.jsx. The key is listed here BEFORE
// the splice, deliberately: the fix lands ahead of the bug rather than behind it.
// (2026-09-05 audit. The check now scans the root authoring modules too.)
//
// THE GENERAL RULE, since this has now cost two modules: a key belongs in this
// list when it is WRITTEN, not when its module reaches a build.
export const KEYS = [
  "hiragana-progress-v2",
  "katakana-progress-v1",
  "kanji-progress-v1",
  "known-kanji-v1",
  "known-words-v1",
  "n5-progress-v1",     // grammar — MISSING until 2026-09-04, see above
  "learner-depth-v1",   // grammar — MISSING until 2026-09-04, see above
  "achievement-points-v1",
  "engagement-v1",      // streak / rhythm / quests — listed ahead of the splice
  "stroke-data-v1",   // shared handwriting calibration — the reason one origin matters
  "kanji-mode",
  "module-recency-v1",  // when each section was last WORKED IN — orders Home
];

export function exportProgress() {
  const data = {};
  for (const k of KEYS) {
    const v = store().getItem(k);
    if (v != null) data[k] = v;
  }
  return {
    format: "naoshi-progress",
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
  a.download = `naoshi-progress-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Returns { ok, message }. Never throws at the caller — a tester restoring a
// wrong file should get a sentence, not a stack trace.
export function importProgress(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, message: "That file isn't readable as progress data." };
  }
  if (parsed?.format !== "naoshi-progress" || !parsed.data) {
    return { ok: false, message: "That looks like a different kind of file." };
  }
  let n = 0;
  for (const [k, v] of Object.entries(parsed.data)) {
    if (KEYS.includes(k)) { store().setItem(k, v); n++; }
  }
  return {
    ok: true,
    message: n
      ? `Restored ${n} saved item${n === 1 ? "" : "s"}. Reload to see it.`
      : "That file had nothing in it.",
  };
}
