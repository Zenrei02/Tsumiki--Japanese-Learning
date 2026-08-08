# -*- coding: utf-8 -*-
"""
Writes the key-check form responses back into naoshi-eval-v1.xlsx (Eval Set J-L).

USAGE
  1. In the "Naoshi — キー確認 responses (all batches)" spreadsheet:
     File → Download → Microsoft Excel (.xlsx)
  2. Drop the downloaded file in this folder (any name containing "responses").
  3. python3 import-key-check-responses.py [responses.xlsx]

Matches questions to rows by the Eval ID prefix ("E04 ・ キー確認"), so tab
names and question order don't matter. If the same sentence was answered more
than once (re-submission, or two reviewers on one batch), the LATEST response
wins and the conflict is printed so you can adjudicate.

Never touches columns A-I. Re-runnable: it overwrites J-L from the responses
each time.
"""
import glob, re, sys
import openpyxl

WORKBOOK = 'naoshi-eval-v1.xlsx'

def find_responses_file():
    if len(sys.argv) > 1:
        return sys.argv[1]
    cands = [f for f in glob.glob('*.xlsx') if 'response' in f.lower() and f != WORKBOOK]
    if len(cands) != 1:
        sys.exit(f"Pass the responses file explicitly — found: {cands or 'none'}")
    return cands[0]

def main():
    src = openpyxl.load_workbook(find_responses_file(), data_only=True)
    # collect: eid -> list of (timestamp, name, verdict, correction, comment)
    answers = {}
    for ws in src.worksheets:
        headers = [c.value for c in ws[1]]
        if not any(isinstance(h, str) and 'キー確認' in h for h in headers):
            continue
        name_col = next((i for i, h in enumerate(headers)
                         if isinstance(h, str) and ('お名前' in h or 'name' in h.lower())), None)
        for row in ws.iter_rows(min_row=2, values_only=True):
            if not row[0]:
                continue
            ts = row[0]
            name = row[name_col] if name_col is not None else ''
            per_eid = {}
            for i, h in enumerate(headers):
                m = re.match(r'^(E\d{2}) ・ (キー確認|修正案|コメント)$', str(h))
                if m:
                    per_eid.setdefault(m.group(1), {})[m.group(2)] = row[i]
            for eid, d in per_eid.items():
                if d.get('キー確認'):
                    answers.setdefault(eid, []).append(
                        (ts, name, d.get('キー確認'), d.get('修正案'), d.get('コメント')))

    if not answers:
        sys.exit('No key-check answers found in that file.')

    wb = openpyxl.load_workbook(WORKBOOK)
    ws = wb['Eval Set']
    id_row = {ws.cell(row=r, column=1).value: r for r in range(6, 46)}
    written, conflicts = 0, 0
    for eid, resp in sorted(answers.items()):
        if eid not in id_row:
            print(f'  ?? {eid} not in Eval Set — skipped')
            continue
        resp.sort(key=lambda x: str(x[0]))
        if len(resp) > 1 and len({x[2] for x in resp}) > 1:
            conflicts += 1
            print(f'  CONFLICT {eid}: ' +
                  ' | '.join(f'{x[1]}: {x[2]}' for x in resp) + '  → using latest')
        ts, name, verdict, corr, comment = resp[-1]
        r = id_row[eid]
        ws.cell(row=r, column=10, value=verdict)                      # J キー確認
        ws.cell(row=r, column=11, value=corr or '')                   # K 修正案
        note = (comment or '')
        if name:
            note = (note + ('　' if note else '')) + f'〔{name}〕'
        ws.cell(row=r, column=12, value=note)                          # L コメント
        written += 1
    wb.save(WORKBOOK)

    done = {eid for eid in answers if eid in id_row}
    missing = sorted(set(id_row) - done)
    print(f'\nWrote {written} rows into Eval Set J-L ({conflicts} conflicts).')
    print('Still unanswered: ' + (', '.join(missing) if missing else 'none — Step 2 complete.'))

if __name__ == '__main__':
    main()
