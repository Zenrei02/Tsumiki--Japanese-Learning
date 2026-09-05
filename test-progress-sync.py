#!/usr/bin/env python3
"""Regression test for the sign-in progress merge.

WHAT IT GUARDS. When a learner signs in and both this browser and their account
hold progress, something has to decide what survives. Getting that wrong is
silent: the app reports a successful sign-in either way. This project has
already shipped that exact failure shape once — `n5-progress-v1` missing from
the export list for twelve days, with "Restored 7 saved items" printed over a
restore that had dropped the largest module in the app.

HOW IT AVOIDS TESTING A COPY. The merge core is sliced out of
naoshi-app/src/lib/sync.js AT RUN TIME, between the two marker comments, and
prepended to the fixtures. There is no second copy of the logic to drift from —
the same trick as test-progress-migration.py, and for the same reason: a test
that carries its own copy of the code passes forever after the shipped version
breaks.

PROVEN ABLE TO FAIL BEFORE ITS FIRST GREEN RUN, per standing practice. The
demonstration, Sep 6 2026: `mergeProgress` was temporarily changed to settle a
conflict by preferring local (`merged[k] = l` in place of `conflicts.push(k)`) —
the precise bug the file exists to prevent, and one that leaves every other
behaviour intact. The harness went red on seven assertions — every one of them
downstream of that single line — and green again on revert:

    FAIL: differing content is a conflict
    FAIL: the differing key is named  (got [], wanted ["kanji-progress-v1"])
    FAIL: A CONFLICTED KEY MUST NOT APPEAR IN merged — that is silent data loss
    FAIL: a spent wallet is not an empty wallet
    FAIL: plain strings still compare  (got [], wanted ["kanji-mode"])
    FAIL: keeping the device fills conflicts from local
    FAIL: keeping the account fills conflicts from remote
    7 ASSERTION(S) FAILED

The control paid for itself immediately: the sixth of those was NOT the bug. It
was the assertion helper comparing JSON.stringify output and so tripping over
key order, on a value that was correct. That helper now compares canonically.
A test that cries wolf about key order is a test that gets ignored about data
loss, and the only reason it was found is that this run was expected to be red
and the failures were therefore read one by one.

The control was then RE-RUN against the amended harness, because a control that
predates the harness it vouches for is not evidence of anything. Six failures,
the false one gone and every real one still present; green again on revert.

Exit 0 = all assertions pass.
"""
import subprocess, sys, pathlib, tempfile, os

HERE = pathlib.Path(__file__).parent
SYNC = HERE / "naoshi-app" / "src" / "lib" / "sync.js"
FIXTURES = HERE / "test-progress-sync.fixtures.mjs"

START = "// ——— PURE MERGE CORE (extracted verbatim at run time by test-progress-sync.py) ———"
END = "// ——— END PURE MERGE CORE ———"

src = SYNC.read_text(encoding="utf-8")
if START not in src or END not in src:
    # A rename that silently produced an empty slice would make every assertion
    # fail with a ReferenceError, which reads like a broken test rather than a
    # broken extraction. Say which it is.
    print("!! could not find the merge-core markers in", SYNC)
    print("   the test slices between them; if they were renamed, update both.")
    sys.exit(2)

core = src[src.index(START) + len(START):src.index(END)]
if "function mergeProgress" not in core:
    print("!! the extracted slice does not contain mergeProgress — extraction is wrong")
    sys.exit(2)

with tempfile.NamedTemporaryFile("w", suffix=".mjs", delete=False,
                                 dir=tempfile.gettempdir(), encoding="utf-8") as f:
    f.write(core + "\n" + FIXTURES.read_text(encoding="utf-8"))
    path = f.name
try:
    r = subprocess.run(["node", path], capture_output=True, text=True)
    sys.stdout.write(r.stdout)
    sys.stderr.write(r.stderr)
    sys.exit(r.returncode)
finally:
    os.unlink(path)
