#!/usr/bin/env python3
"""
check-storage-keys.py — guard against the export/import key list drifting.

WHY THIS EXISTS
The KEYS list in tsumiki-app/src/lib/storage.js is hand-maintained and is the
ONLY thing Save/Restore copies. It was written for the four static modules and
never updated when the grammar module arrived, so `tsumiki-n5-progress-v1` and
`tsumiki-learner-depth-v1` were silently absent from every export for weeks. Restore
then reported "Restored 7 saved items" — a success message over a restore that
had dropped the largest module in the app.

That is the project's recurring failure shape: the log was truthful about what
it did and silent about what it missed. A count of restored items cannot detect
a key that was never exported, so the check has to compare against what the
modules ACTUALLY WRITE, not against itself.

WHAT IT CHECKS
  1. every key a module writes is present in KEYS      (data loss if missing)
  2. every key in KEYS is written by some module       (stale entry / typo)

Writes are found two ways, because modules use both forms:
  storage.set("literal-key", …)
  const SOME_KEY = "literal-key";  … storage.set(SOME_KEY, …)

WHAT IT SCANS, AND WHY IT IS WIDER THAN IT LOOKS
The first version of this check globbed tsumiki-app/src/modules/*.jsx only, and so
inherited the exact assumption that caused the bug it was written for: that the
modules which exist right now are all the modules there are. Two consequences,
both found by the 2026-09-05 audit:

  · engagement-module.jsx is AUTHORED AT THE REPO ROOT and not yet spliced into
    tsumiki-app/, so its "tsumiki-engagement-v1" was invisible — a real missing key that
    this check reported clean.
  · stroke-data-v1 was reported as "listed but not written" because the thing
    that writes it is lib/strokeEngine.jsx, also outside the old glob.

So the scan now covers three places, and the root authoring files are the point:
a key should be caught when it is WRITTEN, not when it reaches a build.

  · tsumiki-app/src/**/*.jsx and *.js   — the generated app, lib and data
  · <root>/*-module.jsx                — the authoring modules, spliced or not
  · <root>/tsumiki-prototype.jsx, checker-module.jsx

Exit 0 clean, 1 on any finding. Run before any deploy that touches the app.
"""

import re, sys
from pathlib import Path

HERE = Path(__file__).parent
SRC = HERE / "tsumiki-app" / "src"
STORAGE = SRC / "lib" / "storage.js"
MODULES = SRC / "modules"

# Keys that are UI state, not learner progress, and are deliberately not exported.
IGNORE = {"tsumiki-last-module", "tsumiki-open-challenge", "__tsumiki_probe__",
          # A hand-off buffer, not progress: study reports waiting for the
          # engagement panel to mount. Emptied the moment it is read, and
          # meaningless to anyone but the browser that wrote it — exporting it
          # would carry a pending quest credit into someone else's restore.
          "tsumiki-pending-study",
          # Which day this device last showed the Goals dialog. Per-device UI
          # state: exporting it would carry "already seen today" onto a
          # machine that has not seen it.
          "tsumiki-goals-seen",
          # A one-shot "open Review when you get there" flag, written by
          # Progress and cleared the moment the checker reads it. Navigation,
          # not progress — same class as tsumiki-open-challenge.
          "tsumiki-open-review"}


def declared_keys():
    text = STORAGE.read_text(encoding="utf-8")
    m = re.search(r"export const KEYS\s*=\s*\[(.*?)\]", text, re.S)
    if not m:
        print("!! could not find `export const KEYS = [...]` in storage.js")
        sys.exit(2)
    return set(re.findall(r'"([^"]+)"', m.group(1)))


def sources():
    """Every file that could write a storage key — see the header for why."""
    files = set()
    if SRC.exists():
        files |= set(SRC.rglob("*.jsx"))
        files |= set(SRC.rglob("*.js"))
    files |= set(HERE.glob("*-module.jsx"))
    files |= {HERE / "tsumiki-prototype.jsx", HERE / "checker-module.jsx"}
    files.discard(STORAGE)          # KEYS itself is the thing being checked against
    return sorted(f for f in files if f.exists())


def label(f):
    """Path as reported: root files bare, app files relative to tsumiki-app/src."""
    try:
        return str(f.relative_to(SRC))
    except ValueError:
        return f.name


def written_keys():
    """Keys any module passes to storage.set(), directly or via a const."""
    found = {}
    for f in sources():
        text = f.read_text(encoding="utf-8")

        # const NAME = "key";  -> resolve identifiers used in storage.set(NAME)
        consts = dict(re.findall(r'const\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*"([^"]+)"\s*;', text))

        # direct literals
        for k in re.findall(r'storage\.set\(\s*"([^"]+)"', text):
            found.setdefault(k, set()).add(label(f))

        # via a const identifier
        for ident in re.findall(r'storage\.set\(\s*([A-Za-z_][A-Za-z0-9_]*)\s*[,)]', text):
            if ident in consts:
                found.setdefault(consts[ident], set()).add(label(f))

        # saveJSON(KEY, …) / saveJSON("key", …) — the wrapper the modules use
        for k in re.findall(r'saveJSON\(\s*"([^"]+)"', text):
            found.setdefault(k, set()).add(label(f))
        for ident in re.findall(r'saveJSON\(\s*([A-Za-z_][A-Za-z0-9_]*)\s*,', text):
            if ident in consts:
                found.setdefault(consts[ident], set()).add(label(f))

    return {k: v for k, v in found.items() if k not in IGNORE}


def main():
    if not STORAGE.exists() or not MODULES.exists():
        print("tsumiki-app/src not found — nothing to check")
        return 0

    declared = declared_keys()
    written = written_keys()

    missing = {k: v for k, v in written.items() if k not in declared}
    stale = declared - set(written)

    print(f"KEYS in storage.js : {len(declared)}")
    print(f"keys modules write : {len(written)}")

    bad = False

    if missing:
        bad = True
        print(f"\n!! {len(missing)} KEY(S) WRITTEN BY A MODULE BUT NOT EXPORTED")
        print("   Save/Restore silently drops these. This is data loss.")
        for k, files in sorted(missing.items()):
            print(f"   - {k}   (written by {', '.join(sorted(files))})")

    if stale:
        # Not data loss — a key listed but never written just exports nothing.
        # Still worth surfacing: it is usually a typo or a removed feature.
        print(f"\n?  {len(stale)} key(s) listed but not written by any module:")
        for k in sorted(stale):
            print(f"   - {k}")
        print("   (shared/handwriting keys may legitimately live elsewhere —")
        print("    confirm before deleting)")

    if not bad:
        print("\nOK — every key a module writes is exported")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
