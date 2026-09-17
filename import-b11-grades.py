#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Import Keiko's B11 grades into b11-grades.csv. NEVER into Blind Grading G/H.

READS   Naoshi — ブラインド採点 B11 responses.csv  (File → Download → CSV of the
        response sheet; both forms feed one sheet, so one file)
        build-b11-forms.py                     for the B11-nn → O-id mapping,
        RE-DERIVED from the log and the Blind Grading order, not from a saved
        manifest — there is no saved manifest, on purpose.
WRITES  b11-grades.csv  output_id, eval_id, label, batch, grade, comment,
        schema=naoshi-4-lowthink, graded_at, grader.  Gitignored (grader's name).
RULES   a label outside B11-01…50 is a stop, not a skip; a duplicate label
        (re-submission) — the LATEST timestamp wins and the conflict is printed,
        as in import-grading-responses.py; a grade outside the four values is a stop.
SELF-TEST  --self-test builds a synthetic five-row export in memory (one
        duplicate, one moved each way), asserts the CSV, then feeds a label
        outside the range and requires a refusal.
"""
import csv, importlib.util, io, re, sys, tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
SRC = HERE / "Naoshi — ブラインド採点 B11 responses.csv"
OUT = HERE / "b11-grades.csv"
VALID = {"一致", "部分一致", "見逃し", "誤指摘"}
HDR_RE = re.compile(r"^(B11-\d{2}) ・ (評価|コメント)$")
STAMP = "naoshi-4-lowthink"

def die(msg):
    sys.exit(f"STOP: {msg}")

def mapping():
    spec = importlib.util.spec_from_file_location("_b11", str(HERE / "build-b11-forms.py"))
    b11 = importlib.util.module_from_spec(spec); spec.loader.exec_module(b11)
    seq, _ = b11.plan()
    return {label: (batch, oid, eid) for label, batch, oid, eid in seq}

def parse(text, labels):
    rows = list(csv.reader(io.StringIO(text)))
    hdr, data = rows[0], [r for r in rows[1:] if any(r)]
    name_col = next((i for i, h in enumerate(hdr) if h and ("お名前" in h or "name" in h.lower())), None)
    answers = {}   # label -> (ts, grader, grade, comment)
    for r in data:
        ts = r[0]; grader = r[name_col] if name_col is not None else ""
        per = {}
        for i, h in enumerate(hdr):
            m = HDR_RE.match(h or "")
            if m:
                per.setdefault(m.group(1), {})[m.group(2)] = r[i] if i < len(r) else ""
        for label, d in per.items():
            g = (d.get("評価") or "").strip()
            if not g:
                continue
            if label not in labels:
                die(f"label {label} is not one of B11-01…50 — refusing the whole file.")
            if g not in VALID:
                die(f"{label}: grade {g!r} is not one of {sorted(VALID)}.")
            if label in answers and answers[label][0] != ts:
                old = answers[label]
                keep = max(old, (ts, grader, g, d.get("コメント", "")), key=lambda x: x[0])
                print(f"conflict {label}: {old[2]} ({old[0]}) vs {g} ({ts}) — keeping the later, {keep[2]}")
                answers[label] = keep
            else:
                answers[label] = (ts, grader, g, d.get("コメント", "") or "")
    return answers

def write(answers, labels, out):
    with out.open("w", encoding="utf-8", newline="") as f:
        w = csv.writer(f)
        w.writerow(["output_id", "eval_id", "label", "batch", "grade", "comment", "schema", "graded_at", "grader"])
        for label in sorted(answers):
            batch, oid, eid = labels[label]
            ts, grader, g, c = answers[label]
            w.writerow([oid, eid, label, batch, g, c, STAMP, ts, grader])

def self_test(labels):
    print("self-test:")
    hdr = ["Timestamp", "お名前 / Your name"]
    for lab in ["B11-01", "B11-02", "B11-03", "B11-04", "B11-05"]:
        hdr += [f"{lab} ・ 評価", f"{lab} ・ コメント"]
    r1 = ["9/20/2026 10:00:00", "T", "一致", "", "部分一致", "x", "誤指摘", "y", "一致", "", "見逃し", ""]
    r2 = ["9/20/2026 11:00:00", "T", "部分一致", "later", "", "", "", "", "", "", "", ""]   # re-submits B11-01 only
    text = "\n".join(",".join(f'"{c}"' for c in row) for row in [hdr, r1, r2])
    a = parse(text, labels)
    assert a["B11-01"][2] == "部分一致" and a["B11-01"][3] == "later", "latest submission must win"
    assert len(a) == 5 and a["B11-03"][2] == "誤指摘"
    with tempfile.TemporaryDirectory() as td:      # never in the project folder
        buf = Path(td) / "b11-selftest.csv"
        write(a, labels, buf)
        got = list(csv.DictReader(buf.open(encoding="utf-8")))
    assert len(got) == 5 and all(g["schema"] == STAMP for g in got) and got[0]["output_id"].startswith("O")
    print("  ok  five rows, duplicate resolved to the later submission, O-ids re-derived")
    try:
        parse(text.replace("B11-05", "B11-51"), labels); print("  FAIL  an out-of-range label was accepted"); sys.exit(1)
    except SystemExit as e:
        if not str(e).startswith("STOP"): raise
        print("  ok  a label outside B11-01…50 is refused")
    try:
        parse(text.replace("見逃し", "まあまあ"), labels); print("  FAIL  a bad grade was accepted"); sys.exit(1)
    except SystemExit as e:
        if not str(e).startswith("STOP"): raise
        print("  ok  a grade outside the four values is refused")
    print("self-test PASSED")

def main():
    labels = mapping()
    if "--self-test" in sys.argv:
        return self_test(labels)
    if not SRC.exists():
        die(f"{SRC.name} not found — export the B11 response sheet as CSV into this folder.")
    answers = parse(SRC.read_text(encoding="utf-8-sig"), labels)
    if not answers:
        die("no grades in the export.")
    write(answers, labels, OUT)
    missing = sorted(set(labels) - set(answers))
    print(f"wrote {OUT.name} — {len(answers)} of 50 graded" + (f"; not yet graded: {', '.join(missing)}" if missing else " (complete)"))

if __name__ == "__main__":
    main()
