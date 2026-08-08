# -*- coding: utf-8 -*-
"""
Writes the Step 3 blind-grading responses into naoshi-eval-v1-with-outputs.xlsx
(Blind Grading G–H), which is what the Results sheet counts.

USAGE
  1. In the "Naoshi — ブラインド採点 responses (all batches)" spreadsheet:
     File → Download → Microsoft Excel (.xlsx)
  2. Drop the downloaded file in this folder (any name containing "response").
  3. python3 import-grading-responses.py [responses.xlsx]

Matches questions to rows by the Output ID prefix ("O017 ・ 評価"), so tab names
and question order don't matter. If the same output was graded more than once
(re-submission, or two graders on one batch), the LATEST wins and the conflict is
printed for adjudication — the same rule as Step 2.

Writes into the WITH-OUTPUTS workbook, never the master: the master holds the
sentences and the key, the copy holds the run. Columns A–F and I are untouched.
Re-runnable: G–H are overwritten from the responses each time.
"""
import glob
import re
import sys

import openpyxl

WORKBOOK = 'naoshi-eval-v1-with-outputs.xlsx'
MASTER = 'naoshi-eval-v1.xlsx'
BG_FIRST, BG_LAST = 5, 124
VALID = {'一致', '部分一致', '見逃し', '誤指摘'}


def find_responses_file():
    if len(sys.argv) > 1:
        return sys.argv[1]
    cands = [f for f in glob.glob('*.xlsx')
             if 'response' in f.lower() and f not in (WORKBOOK, MASTER)]
    if len(cands) != 1:
        sys.exit(f"Pass the responses file explicitly — found: {cands or 'none'}")
    return cands[0]


def main():
    src = openpyxl.load_workbook(find_responses_file(), data_only=True)
    answers = {}
    for ws in src.worksheets:
        headers = [c.value for c in ws[1]]
        if not any(isinstance(h, str) and re.match(r'^O\d{3} ・ 評価$', h) for h in headers):
            continue
        name_col = next((i for i, h in enumerate(headers)
                         if isinstance(h, str) and ('お名前' in h or 'name' in h.lower())), None)
        for row in ws.iter_rows(min_row=2, values_only=True):
            if not row[0]:
                continue
            ts = row[0]
            name = row[name_col] if name_col is not None else ''
            per_oid = {}
            for i, h in enumerate(headers):
                m = re.match(r'^(O\d{3}) ・ (評価|コメント)$', str(h))
                if m:
                    per_oid.setdefault(m.group(1), {})[m.group(2)] = row[i]
            for oid, d in per_oid.items():
                if d.get('評価'):
                    answers.setdefault(oid, []).append(
                        (ts, name, str(d['評価']).strip(), d.get('コメント')))

    if not answers:
        sys.exit('No grading answers found in that file.')

    bad = {v for resp in answers.values() for *_, v, _ in [resp[0]] if v not in VALID}
    if bad:
        sys.exit(f"Unrecognised grade value(s) {bad} — expected one of {VALID}. "
                 "The form choices must match the Blind Grading col G validation exactly.")

    wb = openpyxl.load_workbook(WORKBOOK)
    ws = wb['Blind Grading']
    oid_row = {ws.cell(row=r, column=1).value: r for r in range(BG_FIRST, BG_LAST + 1)}
    written, conflicts = 0, 0
    for oid, resp in sorted(answers.items()):
        if oid not in oid_row:
            print(f'  ?? {oid} not in Blind Grading — skipped')
            continue
        resp.sort(key=lambda x: str(x[0]))
        if len(resp) > 1 and len({x[2] for x in resp}) > 1:
            conflicts += 1
            print(f'  CONFLICT {oid}: ' +
                  ' | '.join(f'{x[1]}: {x[2]}' for x in resp) + '  → using latest')
        ts, name, grade, comment = resp[-1]
        r = oid_row[oid]
        ws.cell(row=r, column=7, value=grade)                       # G 評価
        note = (comment or '')
        if name:
            note = (note + ('　' if note else '')) + f'〔{name}〕'
        ws.cell(row=r, column=8, value=note)                        # H コメント
        written += 1
    wb.save(WORKBOOK)

    done = {oid for oid in answers if oid in oid_row}
    missing = sorted(set(oid_row) - done)
    print(f'\nWrote {written} rows into Blind Grading G-H ({conflicts} conflicts).')
    if missing:
        print(f'Still ungraded ({len(missing)}): ' + ', '.join(missing[:12])
              + ('…' if len(missing) > 12 else ''))
    else:
        print('Still ungraded: none — Step 3 complete.')
        print('Open the workbook to recalculate, then read the Results sheet: '
              'agreement rate, invented-error rate, and the GO / TUNE verdict.')


if __name__ == '__main__':
    main()
