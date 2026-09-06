#!/usr/bin/env python3
"""
test-keepalive-checker.py — does the checker monitor actually go red?

WHY THIS EXISTS. The `checker` job in .github/workflows/supabase-keepalive.yml
was added to catch a failure that is otherwise invisible: a rotated
ANTHROPIC_API_KEY in the Edge Function's environment, which returns
`upstream-error` and reaches the learner as "The checker could not be reached
just now". Nothing else in the project would notice — keepalive-report-2026-08-30
records ZERO requests to /functions/v1/check across its whole window, so silence
is the normal state and an outage looks exactly like it.

A monitor for a silent failure that cannot itself fail is worse than no monitor,
because it converts "we don't know" into "we checked". This project has shipped
that once already: the first stylesheet guard compared 107 emitted rules against
107 parsed rules, passed against a stylesheet with every escape stripped, and
only the negative control exposed it.

⚠️ THE CASE THIS IS REALLY FOR IS 429. `daily-cap` must PASS — it means the
function ran, the cap table was reachable, and the limit did its job. A monitor
that fails there pages us for the system working, and the first fix anyone
reaches for is to raise or remove the cap: breaking the thing that bounds spend
in order to silence a monitor that was wrong.

HOW IT RUNS. The step's shell is lifted out of the YAML at run time — no second
copy — and `probe()` is replaced with a stub that returns a canned status and
body. So these assertions run against the script that ships.

Exit 0 = every scenario produced the expected verdict.
"""
import re, subprocess, sys, pathlib, tempfile, os, json

HERE = pathlib.Path(__file__).parent
WF = HERE / ".github" / "workflows" / "supabase-keepalive.yml"

try:
    import yaml
except ImportError:
    sys.exit("!! pyyaml is needed to slice the step out of the workflow:\n"
             "   pip3 install --break-system-packages pyyaml")

doc = yaml.safe_load(WF.read_text(encoding="utf-8"))
try:
    script = doc["jobs"]["checker"]["steps"][0]["run"]
except Exception:
    sys.exit("!! could not find jobs.checker.steps[0].run — the job was renamed "
             "or restructured; update this test rather than deleting it.")

if "upstream-error" not in script or "daily-cap" not in script:
    sys.exit("!! the extracted step does not mention the cases under test — "
             "extraction is wrong, not the script.")

# Replace the real probe with a stub. Everything else — the ordering of the
# checks, the retry, the messages — is the shipping script verbatim.
# ⚠️ THE STUB ANSWERS DIFFERENTLY ON THE SECOND CALL, and it has to. With one
# fixed answer the retry path is untestable: "timed out, retried, failed" and
# "timed out, never retried, failed" produce the same exit code and the same
# output, so a retry that silently does not happen would pass. FAKE_BODY_2 is
# what makes the retry observable.
# ⚠️ THE COUNTER IS A FILE, NOT A VARIABLE, and the first version was a
# variable. The script calls `status="$(probe ...)"` — command substitution runs
# in a SUBSHELL, so an incremented variable dies with it and every call looked
# like the first. The retry case then failed and the workflow looked broken when
# the harness was. Caught only because the assertion checks that the retry
# HAPPENED and not merely that the exit code was right.
STUB = '''
PROBE_N_FILE="$(mktemp)"
printf '0' > "$PROBE_N_FILE"
probe() {
  n=$(( $(cat "$PROBE_N_FILE") + 1 ))
  printf '%s' "$n" > "$PROBE_N_FILE"
  if [ "$n" -ge 2 ] && [ -n "${FAKE_BODY_2:-}" ]; then
    printf '%s' "$FAKE_BODY_2" > "$1"
    printf '%s' "${FAKE_STATUS_2:-$FAKE_STATUS}"
  else
    printf '%s' "$FAKE_BODY" > "$1"
    printf '%s' "$FAKE_STATUS"
  fi
}
'''
# YAML block scalars strip the common indentation, so the extracted `run` is
# dedented and matching on the workflow file's spacing finds nothing. Anchor on
# the code, not on how it is laid out in the YAML.
m = re.search(r"^([ \t]*)probe\(\) \{.*?^\1\}\n", script, re.S | re.M)
if not m:
    sys.exit("!! could not find the probe() definition to stub — extraction is wrong.")
harness = script[:m.start()] + STUB + script[m.end():]
harness = harness.replace("sleep 30", "sleep 0")   # the retry path, without the wait

# (label, status, body, expect_exit, second_status, second_body)
CASES = [
    ("healthy: a real result",           "200", '{"issues":[],"overall":{}}',            0),
    ("healthy: result with findings",    "200", '{"issues":[{"type":"fix"}]}',           0),
    ("⚠ daily cap is a PASS",            "429", '{"error":"daily-cap","cap":10}',        0),
    ("dead upstream key",                "502", '{"error":"upstream-error"}',            1),
    ("upstream timeout, twice",          "502", '{"error":"upstream-timeout"}',          1),
    ("function not deployed",            "404", '{"message":"not found"}',               1),
    ("project paused",                   "503", 'service unavailable',                   1),
    ("no response at all",               "000", '',                                      1),
    # ⚠ 200 with a body that is not a check result — the shape the ping job's
    # empty-array case already taught us to look for.
    ("200 but not a check result",       "200", '{"error":"something else"}',            1),
    ("200 with an HTML error page",      "200", '<html>gateway</html>',                  1),
]

# ⚠️ THE RETRY, MADE OBSERVABLE. A first-call timeout that recovers on the
# second must PASS — that is the whole reason the retry exists. If the retry
# were silently not happening, this case would fail while every case above
# still passed.
RETRY_CASES = [
    ("timeout then healthy -> PASS",  "502", '{"error":"upstream-timeout"}',
                                      "200", '{"issues":[]}',                           0),
    ("timeout then dead key -> FAIL", "502", '{"error":"upstream-timeout"}',
                                      "502", '{"error":"upstream-error"}',              1),
]

fails = 0
for label, status, body, expect in CASES:
    with tempfile.NamedTemporaryFile("w", suffix=".sh", delete=False,
                                     dir=tempfile.gettempdir(), encoding="utf-8") as f:
        f.write(harness)
        path = f.name
    try:
        r = subprocess.run(["bash", path], capture_output=True, text=True,
                           env={**os.environ, "SUPABASE_URL": "https://stub.invalid",
                                "FAKE_STATUS": status, "FAKE_BODY": body})
        got = 0 if r.returncode == 0 else 1
        ok = got == expect
        if not ok:
            fails += 1
        print(f"{'ok   ' if ok else 'FAIL '} {label:<34} "
              f"http {status:<4} -> exit {r.returncode} (wanted {expect})")
        if not ok:
            print("        " + (r.stdout + r.stderr).strip().replace("\n", "\n        ")[:600])
        # The dead-key message has to name the actual cause, or the alert is a
        # shrug. Asserted rather than assumed.
        if label == "dead upstream key" and "Edge Functions" not in r.stdout:
            fails += 1
            print("FAIL  the dead-key failure does not say where to look")
    finally:
        os.unlink(path)

for label, s1, b1, s2, b2, expect in RETRY_CASES:
    with tempfile.NamedTemporaryFile("w", suffix=".sh", delete=False,
                                     dir=tempfile.gettempdir(), encoding="utf-8") as f:
        f.write(harness)
        path = f.name
    try:
        r = subprocess.run(["bash", path], capture_output=True, text=True,
                           env={**os.environ, "SUPABASE_URL": "https://stub.invalid",
                                "FAKE_STATUS": s1, "FAKE_BODY": b1,
                                "FAKE_STATUS_2": s2, "FAKE_BODY_2": b2})
        got = 0 if r.returncode == 0 else 1
        ok = got == expect
        # It must actually have retried, not merely reached the right verdict.
        retried = "retrying once" in r.stdout
        if not ok or not retried:
            fails += 1
        print(f"{'ok   ' if ok and retried else 'FAIL '} {label:<34} "
              f"http {s1}->{s2}  exit {r.returncode} (wanted {expect})"
              f"{'' if retried else '  ← NEVER RETRIED'}")
    finally:
        os.unlink(path)

# The unset-secret guard, which no scenario above exercises.
with tempfile.NamedTemporaryFile("w", suffix=".sh", delete=False,
                                 dir=tempfile.gettempdir(), encoding="utf-8") as f:
    f.write(harness)
    path = f.name
try:
    env = {k: v for k, v in os.environ.items() if k != "SUPABASE_URL"}
    r = subprocess.run(["bash", path], capture_output=True, text=True,
                       env={**env, "SUPABASE_URL": "", "FAKE_STATUS": "200",
                            "FAKE_BODY": '{"issues":[]}'})
    ok = r.returncode != 0
    if not ok:
        fails += 1
    print(f"{'ok   ' if ok else 'FAIL '} {'missing SUPABASE_URL is refused':<34} "
          f"          -> exit {r.returncode} (wanted non-zero)")
finally:
    os.unlink(path)

print()
if fails:
    print(f"{fails} FAILED")
    sys.exit(1)
print("every scenario produced the expected verdict — including the two that must PASS")
