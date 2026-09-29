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
  3. no key on storage.js's NOT_EXPORTED list is in KEYS
  4. every `*_KEY` const declared in storage.js is classified — it is in KEYS,
     or it is on NOT_EXPORTED with a reason

⚠️ WHY 3 AND 4 EXIST, added 2026-09-29. Checks 1 and 2 only see keys that go
through `storage.set`. Two keys do not: `tsumiki-account-joined-v1` and
`tsumiki-account-version-v1` are written through the raw store precisely so they
cannot schedule an upload of themselves, and they must NEVER enter KEYS — one
would make every device claim to have already joined the account, the other
would hand a fresh device a version watermark it never earned, after which that
device would treat every honest read as stale and refuse the account's copy
forever.

The problem that needed solving is that "not in KEYS" looked identical whether it
was a decision or an oversight, and this project has already lost twelve days of
progress to the oversight version. So storage.js now carries an explicit
NOT_EXPORTED list with a reason per entry, check 3 fails if anything on it ever
reaches KEYS, and check 4 fails if storage.js grows a key const that is on
neither list — which is the case that would otherwise be silent.

Check 4 is scoped to storage.js on purpose. That is where a deliberately
un-exported key belongs and where the classification decision is made; widening
it to every module would report module-local constants that check 1 already
covers, and a check that reports things you have to ignore stops being read.

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


def storage_text():
    return STORAGE.read_text(encoding="utf-8")


def storage_consts(text):
    """`const NAME = "literal";` in storage.js, so NOT_EXPORTED can name the
    consts rather than repeating the strings — two copies of a key string is one
    more place for them to disagree."""
    return dict(re.findall(r'const\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*"([^"]+)"\s*;', text))


def declared_keys(text):
    m = re.search(r"export const KEYS\s*=\s*\[(.*?)\]", text, re.S)
    if not m:
        print("!! could not find `export const KEYS = [...]` in storage.js")
        sys.exit(2)
    return set(re.findall(r'"([^"]+)"', m.group(1)))


def not_exported(text, consts):
    """storage.js's NOT_EXPORTED: [{ key: SOME_KEY, why: "…" }, …].

    Absent is not the same as empty. If the list cannot be found at all, the
    guard it provides is gone and saying so is the whole point — a silently
    skipped check is the failure mode this file exists to prevent."""
    m = re.search(r"export const NOT_EXPORTED\s*=\s*\[(.*?)\n\];", text, re.S)
    if not m:
        print("!! could not find `export const NOT_EXPORTED = [...]` in storage.js")
        print("   checks 3 and 4 cannot run without it — see this file's header.")
        sys.exit(2)
    body = m.group(1)
    out = {}
    for ident_or_lit in re.findall(r'key:\s*(?:"([^"]+)"|([A-Za-z_][A-Za-z0-9_]*))', body):
        lit, ident = ident_or_lit
        key = lit or consts.get(ident)
        if not key:
            print(f"!! NOT_EXPORTED names `{ident}`, which is not a string const in storage.js")
            sys.exit(2)
        out[key] = ident or "(literal)"
    return out


def key_consts(text):
    """Every `*_KEY` const in storage.js. These are the keys this file writes
    itself, through the raw store, and each one has to be classified."""
    return {name: val for name, val in storage_consts(text).items()
            if name.endswith("_KEY")}


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

    text = storage_text()
    consts = storage_consts(text)
    declared = declared_keys(text)
    excluded = not_exported(text, consts)
    written = written_keys()

    missing = {k: v for k, v in written.items() if k not in declared}
    stale = declared - set(written)
    # ⚠️ Check 3: a key that MUST NOT be uploaded, in the list of things that are.
    leaked = sorted(set(excluded) & declared)
    # ⚠️ Check 4: a key const in storage.js that nobody classified either way.
    unclassified = sorted(
        (name, val) for name, val in key_consts(text).items()
        if val not in declared and val not in excluded
    )

    print(f"KEYS in storage.js : {len(declared)}")
    print(f"keys modules write : {len(written)}")
    print(f"NOT_EXPORTED       : {len(excluded)}")
    for k, ident in sorted(excluded.items()):
        print(f"   · {k}   ({ident}) — deliberately device-local")

    bad = False

    if missing:
        bad = True
        print(f"\n!! {len(missing)} KEY(S) WRITTEN BY A MODULE BUT NOT EXPORTED")
        print("   Save/Restore silently drops these. This is data loss.")
        for k, files in sorted(missing.items()):
            print(f"   - {k}   (written by {', '.join(sorted(files))})")

    if leaked:
        bad = True
        print(f"\n!! {len(leaked)} KEY(S) ON NOT_EXPORTED ARE IN KEYS")
        print("   These are statements about ONE browser's relationship to the")
        print("   account, and uploading one makes every other device inherit a")
        print("   claim that is only true here. Read the reason beside the entry")
        print("   in storage.js before removing it from either list.")
        for k in leaked:
            print(f"   - {k}")

    if unclassified:
        bad = True
        print(f"\n!! {len(unclassified)} KEY CONST(S) IN storage.js ARE IN NEITHER LIST")
        print("   A key is either exported (KEYS) or deliberately not (NOT_EXPORTED,")
        print("   with a reason). 'Neither' is what the twelve days of silent")
        print("   grammar loss looked like in the code, so it is a failure here.")
        for name, val in unclassified:
            print(f"   - {name} = \"{val}\"")

    if stale:
        # Not data loss — a key listed but never written just exports nothing.
        # Still worth surfacing: it is usually a typo or a removed feature.
        print(f"\n?  {len(stale)} key(s) listed but not written by any module:")
        for k in sorted(stale):
            print(f"   - {k}")
        print("   (shared/handwriting keys may legitimately live elsewhere —")
        print("    confirm before deleting)")

    if not bad:
        print("\nOK — every key a module writes is exported, and every key this")
        print("     build deliberately withholds is named and accounted for")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
