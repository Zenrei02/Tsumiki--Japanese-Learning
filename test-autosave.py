#!/usr/bin/env python3
"""
test-autosave.py — the save cadence, and the gate in front of it.

WHAT IT GUARDS, AND WHY IT IS A NEW FILE RATHER THAN MORE FIXTURES

test-progress-sync.py guards the MERGE: given two documents, which survives.
That was the whole risk while progress uploaded at exactly two moments. As of
2026-09-16 it uploads continuously (tsumiki-app/src/lib/autosave.js) and the
account is authoritative on load, and the risk moved: the merge is still right,
but a push that happens at the WRONG MOMENT writes a document that predates the
one the load is about to install, and the account takes it.

That is an ordering bug, not an arithmetic one, so the thing under test is the
wiring — a debounce, a gate, a network call and a page going away — and there is
no pure core to slice out that would still be the bug surface.

⚠️ SO THIS TEST IMPORTS THE SHIPPING MODULES, IN PLACE. storage.js, autosave.js
and sync.js are loaded as they are, wired to a fake Supabase client that records
every request, on a fake clock installed before the imports so the REAL timing
constants are the ones under test. No copy of the logic exists to drift.

    python3 test-autosave.py                run the assertions
    python3 test-autosave.py --self-check   NEGATIVE CONTROL — must go RED

The control copies the whole lib directory to a temp dir, removes ONE line from
the copy — the gate that refuses to push before the load has finished — and
requires the assertions to fail. A guard that has only ever refused has not been
tested; this project has shipped a check that could not fail before.

Note what the control mutates and what it does not. The landmark is a line that
carries behaviour, not a constant: test-weekly-window.py's first control edited
`const WEEK_LEN = 7;`, which broke the EXTRACTION and exited 2 — which looks
like a working control because something did go wrong.

⚠️ AND THE CONTROL ITSELF WAS WRONG THE FIRST TIME IT RAN, in exactly that way.
The temp directory had no package.json, so Node loaded the copied .js files as
CommonJS and every one of them died on `import` — red, instantly, with the
mutation playing no part. It would have been red without the mutation too.

So the control now runs the copy TWICE: unmutated, which must be GREEN, and
then mutated, which must be RED. The green run is the part that proves the
temp environment is a faithful one, and it is the only reason the red run means
anything.

Exit 0 = all assertions pass.
"""
import subprocess, sys, pathlib, tempfile, shutil, os

HERE = pathlib.Path(__file__).parent
LIB = HERE / "tsumiki-app" / "src" / "lib"
FIXTURES = HERE / "test-autosave.fixtures.mjs"

# The gate itself. Removing it is the bug the whole file exists to catch: a push
# that runs before account.jsx has settled this device against the account.
GATE = '  if (!ready || !client || !userId) return "not-ready";'


def run(lib_dir):
    env = dict(os.environ, TSUMIKI_LIB=pathlib.Path(lib_dir).resolve().as_uri())
    r = subprocess.run([ "node", str(FIXTURES) ], capture_output=True, text=True, env=env)
    sys.stdout.write(r.stdout)
    sys.stderr.write(r.stderr)
    return r.returncode


def self_check():
    src = (LIB / "autosave.js").read_text(encoding="utf-8")
    if GATE not in src:
        print("!! the gate line this control mutates is not in autosave.js")
        print("   looked for:", GATE.strip())
        print("   if it was reworded, update GATE here — a control that cannot")
        print("   find its landmark is not a control, it is a green exit code.")
        return 2
    tmp = tempfile.mkdtemp(prefix="tsumiki-autosave-control-")
    try:
        dst = pathlib.Path(tmp) / "lib"
        shutil.copytree(LIB, dst)
        # Without this the copied .js files load as CommonJS and die on their
        # first `import` — red for a reason that has nothing to do with the gate.
        (dst / "package.json").write_text('{"type":"module"}', encoding="utf-8")

        print("— CONTROL, PART 1: the copy UNMUTATED. This must be GREEN. —")
        if run(dst) != 0:
            print("\n!! THE UNMUTATED COPY FAILED. The temp environment is not")
            print("   faithful, so a red mutated run would prove nothing.")
            return 1

        (dst / "autosave.js").write_text(src.replace(GATE, ""), encoding="utf-8")
        print("\n— CONTROL, PART 2: the gate removed. These must FAIL. —")
        if run(dst) == 0:
            print("\n!! THE CONTROL PASSED. The assertions do not test the gate.")
            return 1
        print("\n(control went red as required, and only because of the mutation)")
        return 0
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    sys.exit(self_check() if "--self-check" in sys.argv else run(LIB))
