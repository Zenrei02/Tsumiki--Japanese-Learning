#!/usr/bin/env python3
"""Regression test for restoring a PRE-RENAME progress file.

WHAT IT GUARDS. `importProgress` is the only undo a device has — the account has
the archive trigger, a browser has a saved file and nothing else. Between
2026-09-06 and 2026-09-13 the live site rejected every file exported before the
rename, twice over: the format string had changed from `naoshi-progress` to
`tsumiki-progress` with no dual-accept, and the keys inside had all gained a
`tsumiki-` prefix, so even a file that passed the format check would have
restored zero keys and reported "That file had nothing in it."

RENAME-NOTES.md §1 called this out in advance and offered two ways to avoid it.
Neither was taken. This test is what makes the third way stick.

HOW IT AVOIDS TESTING A COPY. The fixtures import
tsumiki-app/src/lib/storage.js directly, so the assertions run against the
shipped module. There is no `window` under node, so `store()` falls through its
own try/catch to the in-memory backing — documented behaviour in that file, and
the reason these assertions can run headless at all.

PROVEN ABLE TO FAIL BEFORE ITS FIRST GREEN RUN, per standing practice.
Demonstration, 2026-09-13, three controls each reverted after:

  1. format dual-accept removed (`FORMATS` back to the single new name)
     -> FAIL: a pre-rename file is accepted at all
     -> FAIL: all three keys land
     -> plus the three key assertions, 5 total

  2. key mapping removed (`resolve` back to `KEYS.includes(k) ? k : null`)
     -> FAIL: all three keys land — "That file had nothing in it."
     -> plus the three key assertions, 4 total
     THIS IS THE CONTROL THAT MATTERS: it is the state the fix would have been
     in if only the format string had been changed, which was the original
     proposal. It goes red here and green nowhere else.

  3. the refusal path loosened (any format accepted)
     -> FAIL: an unrelated format is still refused
     -> FAIL: a file with no format at all is refused

Exit 0 = all assertions pass.
"""
import subprocess, sys, pathlib

HERE = pathlib.Path(__file__).parent
FIXTURES = HERE / "test-import-format.fixtures.mjs"
STORAGE = HERE / "tsumiki-app" / "src" / "lib" / "storage.js"

if not STORAGE.exists():
    print("!! storage.js not found at", STORAGE)
    print("   if the app directory was renamed again, update this path.")
    sys.exit(2)

r = subprocess.run(["node", str(FIXTURES)], capture_output=True, text=True, cwd=HERE)
sys.stdout.write(r.stdout)
sys.stderr.write(r.stderr)
sys.exit(r.returncode)
