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

PART 3 IS A SECOND MUTATION: notePushed made a no-op, so no push ever tells
autosave what it sent. The two "sends nothing" dedupe assertions must then fail
BY NAME — exiting red is not enough here. On 2026-10-04 those same two
assertions were failing at HEAD for an unrelated reason: the fake client's
upsert was not chainable, every push threw on `.select`, and notePushed never
ran. A red run proves only that something broke; naming the assertions shows
this mutation is what they catch.

Exit 0 = all assertions pass.
"""
import subprocess, sys, pathlib, tempfile, shutil, os

HERE = pathlib.Path(__file__).parent
LIB = HERE / "tsumiki-app" / "src" / "lib"
FIXTURES = HERE / "test-autosave.fixtures.mjs"

# The gate itself. Removing it is the bug the whole file exists to catch: a push
# that runs before account.jsx has settled this device against the account.
GATE = '  if (!ready || !client || !userId) return "not-ready";'

# The line that records what was last pushed. Without it every flush believes
# the account has never seen this document, and re-sends identical state.
NOTE_PUSHED = "  lastPushed = canonical;\n"
DEDUPE_ASSERTIONS = [
    "WRITING THE SAME VALUE SENDS NOTHING",
    "re-serialised identical state sends nothing",
]


def run(lib_dir):
    env = dict(os.environ, TSUMIKI_LIB=pathlib.Path(lib_dir).resolve().as_uri())
    r = subprocess.run([ "node", str(FIXTURES) ], capture_output=True, text=True, env=env)
    sys.stdout.write(r.stdout)
    sys.stderr.write(r.stderr)
    return r.returncode, r.stdout + r.stderr


def self_check():
    src = (LIB / "autosave.js").read_text(encoding="utf-8")
    for name, landmark in (("GATE", GATE), ("NOTE_PUSHED", NOTE_PUSHED)):
        if src.count(landmark) != 1:
            print("!! the line this control mutates is not in autosave.js exactly once")
            print("   looked for:", landmark.strip())
            print(f"   if it was reworded, update {name} here — a control that cannot")
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
        if run(dst)[0] != 0:
            print("\n!! THE UNMUTATED COPY FAILED. The temp environment is not")
            print("   faithful, so a red mutated run would prove nothing.")
            return 1

        (dst / "autosave.js").write_text(src.replace(GATE, ""), encoding="utf-8")
        print("\n— CONTROL, PART 2: the gate removed. These must FAIL. —")
        if run(dst)[0] == 0:
            print("\n!! THE CONTROL PASSED. The assertions do not test the gate.")
            return 1

        (dst / "autosave.js").write_text(
            src.replace(NOTE_PUSHED, "  /* control: notePushed records nothing */\n"),
            encoding="utf-8")
        print("\n— CONTROL, PART 3: notePushed a no-op. The dedupe assertions must FAIL. —")
        code, out = run(dst)
        missing = [a for a in DEDUPE_ASSERTIONS if "FAIL: " + a not in out]
        if code == 0 or missing:
            print("\n!! THE CONTROL DID NOT FAIL AS REQUIRED. Expected FAIL lines for:")
            for a in missing or DEDUPE_ASSERTIONS:
                print("     " + a)
            print("   The dedupe assertions do not test notePushed.")
            return 1

        print("\n(control went red as required, and only because of each mutation)")
        return 0
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    sys.exit(self_check() if "--self-check" in sys.argv else run(LIB)[0])
