// Load a save file into a test window, the way a learner's restored progress
// would sit in storage.
//
// WHY THIS EXISTS (Oct 17 2026). stage-view.mjs and mca-render.mjs booted with
// no saved progress at all. When the first-visit welcome landed (eac4c57, Oct 4)
// a learner with no progress became a NEWCOMER, the welcome replaced Home, and
// both tests went red for 13 days without anyone noticing. Seeding the welcome
// flag alone would have made them pass by describing a learner who cannot
// exist. A test that means "a returning learner" should start from a returning
// learner's save data — so it follows the app when the app changes what
// "returning" means.
//
// The file is in the app's own export format (lib/storage.js exportProgress),
// and is REFUSED rather than half-applied if it drifts from that format: a key
// the app no longer saves, a value that is not a JSON string, or a `keys` count
// that does not match. A fixture that silently stopped matching the app would
// be the same failure this file was written to fix.
import fs from "fs";
import { fileURLToPath } from "url";

const STORAGE_SRC = fileURLToPath(new URL("../src/lib/storage.js", import.meta.url));

function appKeys() {
  const src = fs.readFileSync(STORAGE_SRC, "utf8");
  const block = src.match(/export const KEYS = \[([\s\S]*?)\n\];/);
  if (!block) throw new Error("load-save: could not find KEYS in src/lib/storage.js");
  const keys = [...block[1].matchAll(/^\s*"([^"]+)"/gm)].map((m) => m[1]);
  if (keys.length < 10) throw new Error(`load-save: KEYS parsed to only ${keys.length} entries — extractor is broken`);
  return new Set(keys);
}

export function readSave(name) {
  const path = fileURLToPath(new URL(`./fixtures/${name}.json`, import.meta.url));
  const save = JSON.parse(fs.readFileSync(path, "utf8"));
  const problems = [];
  if (save.format !== "tsumiki-progress") problems.push(`format is ${JSON.stringify(save.format)}`);
  if (save.version !== 1) problems.push(`version is ${save.version}`);
  const entries = Object.entries(save.data || {});
  if (save.keys !== entries.length) problems.push(`keys says ${save.keys}, data holds ${entries.length}`);
  const known = appKeys();
  for (const [k, v] of entries) {
    if (!known.has(k)) problems.push(`${k} is not a key the app saves (lib/storage.js KEYS)`);
    if (typeof v !== "string") { problems.push(`${k} is not stored as a string`); continue; }
    try { JSON.parse(v); } catch { problems.push(`${k} does not hold JSON`); }
  }
  if (problems.length) {
    throw new Error(`load-save: fixtures/${name}.json does not match the app's save format:\n  ` + problems.join("\n  "));
  }
  return save;
}

// `without`: keys the calling test controls itself and that the save must NOT
// decide for it. Refuses rather than overwriting, so the test's assumption is
// checked instead of quietly enforced.
export function applySave(w, name, { without = [] } = {}) {
  const save = readSave(name);
  for (const k of without) {
    if (k in save.data) throw new Error(`load-save: fixtures/${name}.json holds ${k}, which this test sets itself`);
  }
  for (const [k, v] of Object.entries(save.data)) w.localStorage.setItem(k, v);
  return save;
}
