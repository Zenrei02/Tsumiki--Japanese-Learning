#!/usr/bin/env python3
"""
test-error-history.py — the error-history store, and the union sync.js relies on.

WHY THIS EXISTS, AND WHAT IT IS REALLY GUARDING

`checker-history-v1` is the first key in the app that is a LOG rather than
STATE, and it is the ONLY key exempt from sync.js's ask-on-conflict rule: when
two devices hold different histories it unions them instead of asking the
learner to choose. That exemption is not a preference. It is earned by two
properties, and if either stops holding, the exemption becomes silent data loss
in the one place a learner would never think to check:

    union(A, B) === union(B, A)     order-independent
    union(A, A) === A               idempotent

Break the first and two devices settle on different histories depending on which
one signed in — and the app later reports a trend from it as fact. Nothing on
screen would look wrong.

The subtle one is TRIM. The store is capped, and trimming each side BEFORE the
union makes the result depend on which device happened to be fuller. That is why
there is an assertion at the cap and not only on small maps: the small case
passes under a wrong implementation.

HOW IT RUNS
Same shape as test-progress-sync.py and test-weekly-window.py: the PURE CORE is
sliced out of the shipping module at run time and the fixtures are appended, so
these assertions run against the code that ships rather than a copy of it.

NEGATIVE CONTROL — RUN IT, DO NOT TRUST IT
    python3 test-error-history.py --self-check
mutates the extracted core in memory (trim before union instead of after) and
requires that the assertions go RED. A check that cannot fail is not a check,
and this project has already shipped one that could not: the first stylesheet
guard compared 107 emitted rules against 107 parsed rules and passed against a
stylesheet with every escape stripped.

The landmark used for the mutation carries no value under test, deliberately.
test-weekly-window.py's control was wrong the first time because its landmark
was `const WEEK_LEN = 7;` — editing it broke the EXTRACTION and exited 2, which
looks like a working control because something did go wrong.

Exit 0 = all assertions pass.
"""
import subprocess, sys, pathlib, tempfile, os

HERE = pathlib.Path(__file__).parent
MOD = HERE / "naoshi-app" / "src" / "lib" / "errorHistory.js"
FIXTURES = HERE / "test-error-history.fixtures.mjs"

START = "// ——— PURE CORE (extracted verbatim at run time by test-error-history.py) ———"
END = "// ——— END PURE CORE ———"

src = MOD.read_text(encoding="utf-8")
if START not in src or END not in src:
    print("!! could not find the pure-core markers in", MOD)
    print("   the test slices between them; if they were renamed, update both.")
    sys.exit(2)

core = src[src.index(START) + len(START):src.index(END)]
for needed in ("function foldCheck", "function unionHistory", "function trim",
               "function byErrorType", "function recentChecks"):
    if needed not in core:
        print(f"!! the extracted slice does not contain {needed} — extraction is wrong")
        sys.exit(2)

# Constants the fixtures use live above the core (they are exported API, not
# internals), so they are prepended rather than moved into it.
def const(name):
    return src.split(f"export const {name} = ")[1].split(";")[0]

PRELUDE = "\n".join([
    f"const MAX_ENTRIES = {const('MAX_ENTRIES')};",
    f"const MAX_CHECK_BYTES = {const('MAX_CHECK_BYTES')};",
    f"const MAX_CHECKS = {const('MAX_CHECKS')};",
    'const CHECKS = "_checks";',
])

# `summarise` is below the core because it is a reader, not part of the merge.
# Sliced separately so the fixtures can exercise it without the core growing to
# include things the sync exemption does not depend on.
SUM_START = "export function summarise("
summarise = src[src.index(SUM_START):]
summarise = summarise[:summarise.index("\n}\n") + 3].replace("export function", "function", 1)

SELF_CHECK = "--self-check" in sys.argv

if SELF_CHECK:
    # The mutation: trim BEFORE the union instead of after. The landmark is a
    # `return` statement, which carries no value the assertions read.
    landmark = "  return trim(merged);"
    if landmark not in core:
        print("!! self-check landmark not found — the control cannot be trusted")
        sys.exit(2)
    core = core.replace(landmark, "  return merged;", 1)
    core = core.replace("    for (const [k, list] of Object.entries(src)) {",
                        "    for (const [k, list] of Object.entries(trim(src))) {", 1)

with tempfile.NamedTemporaryFile("w", suffix=".mjs", delete=False,
                                 dir=tempfile.gettempdir(), encoding="utf-8") as f:
    f.write(PRELUDE + "\n" + core + "\n" + summarise + "\n"
            + FIXTURES.read_text(encoding="utf-8"))
    path = f.name
try:
    r = subprocess.run(["node", path], capture_output=True, text=True)
    sys.stdout.write(r.stdout)
    sys.stderr.write(r.stderr)
    if SELF_CHECK:
        if r.returncode == 0:
            print("\n!! CONTROL DID NOT FIRE — trim-before-union passed every "
                  "assertion.\n   The union properties are not actually being "
                  "tested. Fix the test, not the code.")
            sys.exit(1)
        if r.returncode == 2 or "SyntaxError" in r.stderr or "ReferenceError" in r.stderr:
            print("\n!! the control broke the HARNESS rather than the code — "
                  "that is not evidence.\n   Something did go wrong, which is "
                  "what makes this failure mode look like a working control.")
            sys.exit(2)
        print("\ncontrol fired as required: trim-before-union is caught")
        sys.exit(0)
    sys.exit(r.returncode)
finally:
    os.unlink(path)
