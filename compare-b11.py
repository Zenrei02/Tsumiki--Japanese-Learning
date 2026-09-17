#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
compare-b11.py — the paired comparison that decides TSUMIKI_EFFORT=low.

For each of the fifty Sonnet 5 O-ids: Keiko's grade on the DEFAULT output
(Blind Grading G in the graded naoshi-4 workbook, as amended by B10) beside her
grade on the effort=low output (b11-grades.csv). Same sentence, same key, same
four-way question, same grader — a paired design, so the between-run variance
that clouds every other comparison in this project cancels out.

TWO NUMBERS DECIDE IT, the same two that chose Sonnet:
  誤指摘 count      the invented-error bar: ≤2 goal / ≤1 stretch on this n
  一致+部分一致 rate  agreement with the key
THE RULE, verbatim from the Session 32.1 message: flip if both land inside the
default's band; do not flip if 誤指摘 rises.

Session 28 band: a per-model delta must beat 3 before it is called a result.
It is printed beside every delta here so nobody quotes a 1 as a finding.

GUARD: refuses unless the live workbook's grade census is the post-B10 naoshi-4
one (122 / 17 / 10 / 1). Pointed at any other file, the default column would be
the wrong baseline and every number below would be wrong with a straight face.

--self-test  runs the arithmetic on a synthetic pair and asserts the counts,
             the deltas, the moved rows and the verdict; then the guard against
             a workbook whose census is not the baseline.
"""
import csv, sys
from collections import Counter
from pathlib import Path
import openpyxl

HERE = Path(__file__).resolve().parent
WB = HERE / "naoshi-eval-v1-with-outputs.xlsx"
B11 = HERE / "b11-grades.csv"
BASELINE_CENSUS = {"一致": 122, "部分一致": 17, "誤指摘": 10, "見逃し": 1}
BAND = 3
GOAL, STRETCH = 2, 1
ORDER = ["一致", "部分一致", "見逃し", "誤指摘"]
BG_FIRST, BG_LAST = 5, 154

def die(msg):
    sys.exit(f"STOP: {msg}")

def default_grades(wb_path):
    bg = openpyxl.load_workbook(wb_path, data_only=True)["Blind Grading"]
    census = Counter(bg.cell(row=r, column=7).value for r in range(BG_FIRST, BG_LAST + 1))
    if dict(census) != BASELINE_CENSUS:
        die(f"live census {dict(census)} ≠ post-B10 baseline {BASELINE_CENSUS}; wrong file or B10 --apply not run.")
    return {bg.cell(row=r, column=1).value: bg.cell(row=r, column=7).value
            for r in range(BG_FIRST, BG_LAST + 1) if bg.cell(row=r, column=3).value == "M2"}

def b11_grades(path):
    rows = list(csv.DictReader(path.open(encoding="utf-8")))
    if any(r["schema"] != "naoshi-4-lowthink" for r in rows):
        die("b11-grades.csv carries a schema other than naoshi-4-lowthink.")
    return {r["output_id"]: (r["grade"], r["comment"]) for r in rows}

def report(default, low, out=print):
    ids = sorted(set(default) & set(low))
    missing = sorted(set(default) - set(low))
    d = Counter(default[o] for o in ids); l = Counter(low[o][0] for o in ids)
    n = len(ids)
    out(f"paired rows: {n} of 50" + (f"  (not yet graded: {', '.join(missing)})" if missing else ""))
    out(f"{'':14s}{'default':>10s}{'effort=low':>12s}{'delta':>8s}   band ±{BAND}")
    for g in ORDER:
        delta = l[g] - d[g]
        flag = "" if abs(delta) < BAND else "  ← beats the band"
        out(f"{g:14s}{d[g]:>10d}{l[g]:>12d}{delta:>+8d}{flag}")
    agree_d = d["一致"] + d["部分一致"]; agree_l = l["一致"] + l["部分一致"]
    out(f"{'一致+部分一致':14s}{agree_d:>10d}{agree_l:>12d}{agree_l - agree_d:>+8d}   "
        f"({100 * agree_d / n:.0f}% → {100 * agree_l / n:.0f}%)")
    out(f"\n誤指摘 against the bar: default {d['誤指摘']}, effort=low {l['誤指摘']}  "
        f"(goal ≤{GOAL}, stretch ≤{STRETCH})")
    moved = [(o, default[o], low[o][0], low[o][1]) for o in ids if default[o] != low[o][0]]
    out(f"\nrows whose grade moved: {len(moved)}")
    for o, a, b, c in moved:
        out(f"  {o}: {a} → {b}" + (f"   「{c}」" if c else ""))
    rises = l["誤指摘"] > d["誤指摘"]
    inside = all(abs(l[g] - d[g]) < BAND for g in ORDER)
    verdict = ("DO NOT FLIP — 誤指摘 rose." if rises else
               "FLIP — every counter inside the default's band and 誤指摘 did not rise." if inside else
               "NOT DECIDED — a counter moved by the band or more; read the moved rows before deciding.")
    out(f"\nTHE RULE: flip if both land inside the default's band; do not flip if 誤指摘 rises.")
    out(f"VERDICT: {verdict}" + ("" if n == 50 else "  (PROVISIONAL — not all 50 rows are graded)"))
    return {"n": n, "default": d, "low": l, "moved": moved, "verdict": verdict}

def self_test():
    print("self-test:")
    ids = [f"O{i:03d}" for i in range(1, 51)]
    default = {o: "一致" for o in ids}; default["O005"] = "誤指摘"; default["O009"] = "部分一致"
    low = {o: ("一致", "") for o in ids}
    low["O005"] = ("誤指摘", ""); low["O009"] = ("一致", "");  low["O012"] = ("部分一致", "wording")
    lines = []; r = report(default, low, out=lines.append)
    assert r["n"] == 50 and r["default"]["誤指摘"] == 1 and r["low"]["誤指摘"] == 1
    assert len(r["moved"]) == 2 and r["verdict"].startswith("FLIP"), r["verdict"]
    print("  ok  counts, two moved rows, FLIP when inside the band and 誤指摘 flat")
    low2 = dict(low); low2["O020"] = ("誤指摘", "invented"); r2 = report(default, low2, out=lambda s: None)
    assert r2["verdict"].startswith("DO NOT FLIP"); print("  ok  one extra 誤指摘 → DO NOT FLIP, band or no band")
    low3 = dict(low)
    for o in ids[20:24]: low3[o] = ("見逃し", "")
    r3 = report(default, low3, out=lambda s: None)
    assert r3["verdict"].startswith("NOT DECIDED"); print("  ok  a counter moving by the band → NOT DECIDED")
    try:
        default_grades(HERE / "backups" / "naoshi-eval-v1-with-outputs.11-pre-b10-amend.xlsx"); print("  FAIL  the pre-B10 snapshot was accepted as the baseline"); sys.exit(1)
    except SystemExit as e:
        if not str(e).startswith("STOP"): raise
        print("  ok  the pre-B10 snapshot (118/21/10/1) is refused as a baseline")
    default_grades(WB); print("  ok  the live workbook is accepted (control)")
    print("self-test PASSED")

def main():
    if "--self-test" in sys.argv:
        return self_test()
    if not B11.exists():
        die(f"{B11.name} not found — run import-b11-grades.py first.")
    report(default_grades(WB), b11_grades(B11))

if __name__ == "__main__":
    main()
