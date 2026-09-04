#!/usr/bin/env python3
"""
check-storage-keys.py — guard against the export/import key list drifting.

WHY THIS EXISTS
The KEYS list in naoshi-app/src/lib/storage.js is hand-maintained and is the
ONLY thing Save/Restore copies. It was written for the four static modules and
never updated when the grammar module arrived, so `n5-progress-v1` and
`learner-depth-v1` were silently absent from every export for weeks. Restore
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

Exit 0 clean, 1 on any finding. Run before any deploy that touches the app.
"""

import re, sys
from pathlib import Path

HERE = Path(__file__).parent
SRC = HERE / "naoshi-app" / "src"
STORAGE = SRC / "lib" / "storage.js"
MODULES = SRC / "modules"

# Keys that are UI state, not learner progress, and are deliberately not exported.
IGNORE = {"naoshi-last-module", "naoshi-open-challenge", "__naoshi_probe__"}


def declared_keys():
    text = STORAGE.read_text(encoding="utf-8")
    m = re.search(r"export const KEYS\s*=\s*\[(.*?)\]", text, re.S)
    if not m:
        print("!! could not find `export const KEYS = [...]` in storage.js")
        sys.exit(2)
    return set(re.findall(r'"([^"]+)"', m.group(1)))


def written_keys():
    """Keys any module passes to storage.set(), directly or via a const."""
    found = {}
    for f in sorted(MODULES.glob("*.jsx")):
        text = f.read_text(encoding="utf-8")

        # const NAME = "key";  -> resolve identifiers used in storage.set(NAME)
        consts = dict(re.findall(r'const\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*"([^"]+)"\s*;', text))

        # direct literals
        for k in re.findall(r'storage\.set\(\s*"([^"]+)"', text):
            found.setdefault(k, set()).add(f.name)

        # via a const identifier
        for ident in re.findall(r'storage\.set\(\s*([A-Za-z_][A-Za-z0-9_]*)\s*[,)]', text):
            if ident in consts:
                found.setdefault(consts[ident], set()).add(f.name)

        # saveJSON(KEY, …) / saveJSON("key", …) — the wrapper the modules use
        for k in re.findall(r'saveJSON\(\s*"([^"]+)"', text):
            found.setdefault(k, set()).add(f.name)
        for ident in re.findall(r'saveJSON\(\s*([A-Za-z_][A-Za-z0-9_]*)\s*,', text):
            if ident in consts:
                found.setdefault(consts[ident], set()).add(f.name)

    return {k: v for k, v in found.items() if k not in IGNORE}


def main():
    if not STORAGE.exists() or not MODULES.exists():
        print("naoshi-app/src not found — nothing to check")
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
