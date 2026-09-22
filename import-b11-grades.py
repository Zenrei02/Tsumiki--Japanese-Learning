#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Import Keiko's B11 grades into b11-grades.csv. NEVER into Blind Grading G/H.

READS   either
          · Naoshi — ブラインド採点 responses (all batches).xlsx   ← the usual case
            (File → Download → Microsoft Excel). B11a and B11b are two TABS in
            the Blind Grading sheet; every tab without B11 labels is skipped and
            named, so it is visible that the right thing was read.
          · Naoshi — ブラインド採点 B11 responses.csv
            a single-tab CSV export. Kept because it is what the design intended
            and what the self-test exercises.
        A path given on the command line overrides both.

        build-b11-forms.py  for the B11-nn → O-id mapping, RE-DERIVED from the
        log and the Blind Grading order, not from a saved manifest — there is no
        saved manifest, on purpose.

WRITES  b11-grades.csv  output_id, eval_id, label, batch, grade, comment,
        schema=naoshi-4-lowthink, graded_at, grader.  Gitignored (grader's name).

        ⚠️ THIS SCRIPT NEVER OPENS THE EVAL WORKBOOK AND NEVER WRITES TO DRIVE.
        It reads one downloaded file and writes one CSV. B11's grades describe a
        different prompt stamp from the B1–B9 grades they are compared against;
        mixing them into Blind Grading G/H would destroy the comparison.

RULES   a label outside B11-01…50 is a stop, not a skip; a duplicate label
        (re-submission) — the LATEST timestamp wins and the conflict is printed,
        as in import-grading-responses.py; a grade outside the four values is a
        stop. Duplicates are resolved ACROSS tabs, not just within one.

        ⚠️ A BATCH THAT HAS NOT COME BACK IS NAMED, NOT ABSORBED INTO A TOTAL.
        import-grading-responses.py once printed "Step 3 complete" while silently
        dropping thirty outputs, because its summary was computed against the same
        truncated range that caused the loss. So this prints per-batch coverage
        and says NOT RETURNED for a batch with no answers, rather than letting
        25-of-50 read as a normal partial.

SELF-TEST  --self-test covers both readers: a synthetic five-row CSV export (one
        duplicate, one moved each way), then a synthetic two-tab xlsx including a
        decoy O-id tab that must be skipped and a cross-tab duplicate that must
        resolve to the later submission. Then it feeds a label outside the range
        and a bad grade and requires a refusal of each.

WHY THE XLSX PATH EXISTS. Sep 19 2026: build-b11-forms.gs was pasted into the
B1–B9 Apps Script project rather than a new one, so responseSheet() reused the
stored RESPONSE_SS_ID and both B11 forms were linked to the Blind Grading sheet.
Nothing was damaged — the nine B1–B9 tabs are untouched and the Blind Grading
importer cannot see B11 tabs (its header regex is O\\d{3}) — but B11's answers now
arrive as two tabs in a shared workbook rather than one CSV. Lloyd's call was to
leave Drive alone and teach this script to read them, rather than hand-operate on
the sheet holding 150 irreplaceable grades. See the 🔗 Links page, Step 3.6.
"""
import csv, importlib.util, io, re, sys, tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
SRC_CSV = HERE / "Naoshi — ブラインド採点 B11 responses.csv"
SRC_XLSX = HERE / "Naoshi — ブラインド採点 responses (all batches).xlsx"
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


def harvest(hdr, data, labels, answers, where):
    """Fold one tab's rows into `answers`. Shared by both readers so the duplicate
    rule, the range stop and the grade stop behave identically whichever file the
    grades arrived in — and so a re-submission in a DIFFERENT tab still resolves."""
    name_col = next((i for i, h in enumerate(hdr)
                     if h and ("お名前" in str(h) or "name" in str(h).lower())), None)
    seen = set()
    for r in data:
        if not r or not r[0]:
            continue
        ts = str(r[0]); grader = (r[name_col] if name_col is not None and name_col < len(r) else "") or ""
        per = {}
        for i, h in enumerate(hdr):
            m = HDR_RE.match(str(h or ""))
            if m:
                per.setdefault(m.group(1), {})[m.group(2)] = (r[i] if i < len(r) else "")
        for label, d in per.items():
            g = str(d.get("評価") or "").strip()
            if not g:
                continue
            if label not in labels:
                die(f"label {label} is not one of B11-01…50 — refusing the whole file.")
            if g not in VALID:
                die(f"{label}: grade {g!r} is not one of {sorted(VALID)}.")
            seen.add(label)
            cand = (ts, str(grader), g, str(d.get("コメント", "") or ""))
            if label in answers and answers[label][0] != ts:
                old = answers[label]
                keep = max(old, cand, key=lambda x: x[0])
                print(f"conflict {label}: {old[2]} ({old[0]}) vs {g} ({ts}) — keeping the later, {keep[2]}")
                answers[label] = keep
            else:
                answers[label] = cand
    return seen


def parse(text, labels):
    """CSV reader — one tab's export. Kept as the original entry point."""
    rows = list(csv.reader(io.StringIO(text)))
    if not rows:
        die("the export is empty.")
    answers = {}
    harvest(rows[0], [r for r in rows[1:] if any(r)], labels, answers, "csv")
    return answers


def parse_xlsx(path, labels):
    """Workbook reader — B11a and B11b are two tabs among the Blind Grading tabs.

    Every tab is classified and reported. A tab carrying B11 labels but no graded
    rows is NOT silently merged into the total; it comes back as an empty `seen`
    set and main() names its batch as NOT RETURNED."""
    try:
        from openpyxl import load_workbook
    except ImportError:
        die("openpyxl is needed to read the .xlsx — pip install openpyxl --break-system-packages, "
            "or export the B11 tab as CSV instead.")
    wb = load_workbook(path, data_only=True, read_only=True)
    answers, used, skipped = {}, {}, []
    for ws in wb.worksheets:
        rows = list(ws.iter_rows(values_only=True))
        hdr = list(rows[0]) if rows else []
        if not any(HDR_RE.match(str(h or "")) for h in hdr):
            skipped.append(ws.title)
            continue
        used[ws.title] = harvest(hdr, rows[1:], labels, answers, ws.title)
    wb.close()
    if not used:
        die(f"no tab in {Path(path).name} carries B11-nn columns — is this the right download? "
            f"tabs seen: {', '.join(skipped) or 'none'}")
    print(f"read {len(used)} B11 tab(s): " +
          "; ".join(f"{t} ({len(s)} graded)" for t, s in used.items()))
    if skipped:
        print(f"skipped {len(skipped)} tab(s) with no B11 labels: {', '.join(skipped)}")
    return answers


def write(answers, labels, out):
    with out.open("w", encoding="utf-8", newline="") as f:
        w = csv.writer(f)
        w.writerow(["output_id", "eval_id", "label", "batch", "grade", "comment", "schema", "graded_at", "grader"])
        for label in sorted(answers):
            batch, oid, eid = labels[label]
            ts, grader, g, c = answers[label]
            w.writerow([oid, eid, label, batch, g, c, STAMP, ts, grader])


def report(answers, labels):
    """Per-batch coverage. A batch with nothing in it is named, not averaged away."""
    by_batch = {}
    for label, (batch, _o, _e) in labels.items():
        by_batch.setdefault(batch, set()).add(label)
    for batch in sorted(by_batch):
        want = by_batch[batch]
        got = want & set(answers)
        if not got:
            print(f"  {batch}: NOT RETURNED — 0 of {len(want)}")
        elif got != want:
            miss = sorted(want - got)
            print(f"  {batch}: {len(got)} of {len(want)} — missing {', '.join(miss[:8])}"
                  + ("…" if len(miss) > 8 else ""))
        else:
            print(f"  {batch}: {len(got)} of {len(want)} ✓")


def _fixture_rows():
    hdr = ["Timestamp", "お名前 / Your name"]
    for lab in ["B11-01", "B11-02", "B11-03", "B11-04", "B11-05"]:
        hdr += [f"{lab} ・ 評価", f"{lab} ・ コメント"]
    r1 = ["9/20/2026 10:00:00", "T", "一致", "", "部分一致", "x", "誤指摘", "y", "一致", "", "見逃し", ""]
    r2 = ["9/20/2026 11:00:00", "T", "部分一致", "later", "", "", "", "", "", "", "", ""]
    return hdr, r1, r2


def self_test(labels):
    print("self-test:")
    hdr, r1, r2 = _fixture_rows()
    text = "\n".join(",".join(f'"{c}"' for c in row) for row in [hdr, r1, r2])
    a = parse(text, labels)
    assert a["B11-01"][2] == "部分一致" and a["B11-01"][3] == "later", "latest submission must win"
    assert len(a) == 5 and a["B11-03"][2] == "誤指摘"
    with tempfile.TemporaryDirectory() as td:      # never in the project folder
        buf = Path(td) / "b11-selftest.csv"
        write(a, labels, buf)
        got = list(csv.DictReader(buf.open(encoding="utf-8")))
    assert len(got) == 5 and all(g["schema"] == STAMP for g in got) and got[0]["output_id"].startswith("O")
    print("  ok  csv: five rows, duplicate resolved to the later submission, O-ids re-derived")

    # ---- the xlsx path: two B11 tabs, a decoy O-id tab, a CROSS-TAB duplicate ----
    try:
        from openpyxl import Workbook
    except ImportError:
        print("  SKIP  xlsx checks — openpyxl not installed")
    else:
        with tempfile.TemporaryDirectory() as td:
            p = Path(td) / "wb.xlsx"
            wb = Workbook(); ws1 = wb.active; ws1.title = "Form Responses 1"
            # decoy: a real Blind Grading tab. Must be skipped, never read.
            ws1.append(["Timestamp", "お名前 / Your name", "O017 ・ 評価", "O017 ・ コメント"])
            ws1.append(["8/25/2026 21:23:23", "木谷恵子", "一致", ""])
            ws2 = wb.create_sheet("Form Responses 10")
            h2 = ["Timestamp", "お名前 / Your name"]
            for lab in ["B11-01", "B11-02"]:
                h2 += [f"{lab} ・ 評価", f"{lab} ・ コメント"]
            ws2.append(h2)
            ws2.append(["9/20/2026 10:00:00", "K", "一致", "", "見逃し", ""])
            ws3 = wb.create_sheet("Form Responses 11")
            h3 = ["Timestamp", "お名前 / Your name"]
            for lab in ["B11-26", "B11-01"]:      # B11-01 again, LATER — cross-tab duplicate
                h3 += [f"{lab} ・ 評価", f"{lab} ・ コメント"]
            ws3.append(h3)
            ws3.append(["9/21/2026 09:00:00", "K", "誤指摘", "", "部分一致", "moved"])
            ws4 = wb.create_sheet("Sheet1")       # Google's empty leftover
            wb.save(p)
            ax = parse_xlsx(p, labels)
        assert set(ax) == {"B11-01", "B11-02", "B11-26"}, f"unexpected labels {sorted(ax)}"
        assert ax["B11-01"][2] == "部分一致" and ax["B11-01"][3] == "moved", \
            "a re-submission in a DIFFERENT tab must still win on timestamp"
        assert ax["B11-26"][2] == "誤指摘"
        assert not any(k.startswith("O") for k in ax), "an O-id tab must never be read"
        print("  ok  xlsx: two B11 tabs merged, O-id tab and Sheet1 skipped, cross-tab duplicate resolved")

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


def pick_source():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if args:
        p = Path(args[0])
        if not p.exists():
            die(f"{p} not found.")
        return p
    if SRC_CSV.exists():
        return SRC_CSV
    if SRC_XLSX.exists():
        return SRC_XLSX
    die(f"no export found. Expected one of:\n"
        f"  {SRC_XLSX.name}   (File → Download → Microsoft Excel — B11a/B11b are tabs in it)\n"
        f"  {SRC_CSV.name}\n"
        f"or pass a path as the first argument.")


def main():
    labels = mapping()
    if "--self-test" in sys.argv:
        return self_test(labels)
    src = pick_source()
    print(f"reading {src.name}")
    if src.suffix.lower() in (".xlsx", ".xlsm"):
        answers = parse_xlsx(src, labels)
    else:
        answers = parse(src.read_text(encoding="utf-8-sig"), labels)
    if not answers:
        die("no grades in the export.")
    write(answers, labels, OUT)
    print(f"wrote {OUT.name} — {len(answers)} of {len(labels)} graded"
          + ("" if len(answers) == len(labels) else ""))
    report(answers, labels)


if __name__ == "__main__":
    main()
