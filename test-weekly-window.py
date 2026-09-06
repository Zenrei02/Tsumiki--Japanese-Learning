#!/usr/bin/env python3
"""Regression test for the rolling weekly window in engagement-module.jsx.

WHAT IT GUARDS. The weekly rhythm target was chosen instead of a daily streak
because a streak punishes normal life and produces quit-on-break. A window that
hands a learner three days out of two puts that cliff straight back — which is
what the old Monday-anchored calendar week did to anyone who started on a
Friday. The property is: whatever day you start, you get seven.

It also guards the day labels. They used to be a fixed list, 月火水木金土日,
which put 日 last where a Japanese calendar puts it first, and which could
disagree with the dates it was printed under. They are now derived from each
date, so the two cannot drift apart.

HOW IT AVOIDS TESTING A COPY. The date helpers are sliced out of
engagement-module.jsx AT RUN TIME, between two landmarks, and prepended to the
fixtures — same approach as test-progress-migration.py and test-progress-sync.py.

PROVEN ABLE TO FAIL BEFORE ITS FIRST GREEN RUN, per standing practice. The
demonstration, Sep 6 2026: WEEK_LEN was changed from 7 to 6, which is the
shape of every off-by-one this file exists to catch. 32 assertions went red
across every group; green again on revert.

The first attempt at that control FAILED FOR THE WRONG REASON and is worth
recording: the start landmark was `const WEEK_LEN = 7;`, so editing the value
broke the extraction and the harness exited 2 — "could not find the landmarks" —
instead of reporting red assertions. It looked like a working control at a
glance, because something did go wrong. The landmark is now a line that carries
no value under test, and the control produces real failures.

Exit 0 = all assertions pass.
"""
import subprocess, sys, pathlib, tempfile, os

HERE = pathlib.Path(__file__).parent
SRC = HERE / "engagement-module.jsx"
FIXTURES = HERE / "test-weekly-window.fixtures.mjs"

# ⚠️ THE START LANDMARK MUST NOT CONTAIN A VALUE THIS FILE TESTS. It used to be
# `const WEEK_LEN = 7;`, and the negative control — flipping that 7 to a 6 —
# therefore broke the EXTRACTION instead of the logic: exit 2, "could not find
# the landmarks", rather than the fifteen red assertions it should have produced.
# A control that fails for the wrong reason proves nothing about the test.
START = "const dayKey ="
END = "/* ---------------------------------------------------------------------------\n   4. QUEST GENERATION"

src = SRC.read_text(encoding="utf-8")
if START not in src or END not in src:
    print("!! could not find the date-helper landmarks in", SRC)
    print("   the test slices between them; if they moved, update this file too.")
    sys.exit(2)

core = src[src.index(START):src.index(END)]
for needed in ("dayKey", "windowDayKeys", "weekdayLabel", "windowLive",
               "inferWeekStart", "daysBetween", "WEEK_LEN"):
    if needed not in core:
        print(f"!! the extracted slice does not contain {needed} — extraction is wrong")
        sys.exit(2)

day_key = ""

with tempfile.NamedTemporaryFile("w", suffix=".mjs", delete=False,
                                 dir=tempfile.gettempdir(), encoding="utf-8") as f:
    f.write(day_key + core + "\n" + FIXTURES.read_text(encoding="utf-8"))
    path = f.name
try:
    r = subprocess.run(["node", path], capture_output=True, text=True)
    sys.stdout.write(r.stdout); sys.stderr.write(r.stderr)
    sys.exit(r.returncode)
finally:
    os.unlink(path)
