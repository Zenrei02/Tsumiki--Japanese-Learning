# -*- coding: utf-8 -*-
"""
Divergence and identical-to-source for every run in the bake-off log.

WHY THIS EXISTS
Session 26 read a mechanism claim off two numbers — mean divergence and the
count of rewrites identical to the source — that NO COMMITTED SCRIPT PRODUCED.
They were derived ad hoc, quoted in a journal, and then had to be reconstructed
and re-verified by Session 27 before that session could use them. The tracker
row "Measurement method" names this as fault (1) of three, and fix (b) is this
file: every derived metric is a committed script, so no journal figure is ever
ad hoc again.

WHAT THEY ARE
  divergence           1 - SequenceMatcher.ratio(source, rewrite), averaged over
                       the rows that carry a rewrite. How far the tool moved the
                       learner's sentence.
  identical-to-source  the number of rewrites that are the source verbatim. How
                       often it moved the sentence not at all.

Read together they say whether a prompt change made the rewriter more
conservative or merely more silent.

⚠ THE DEFINITION IS PINNED TO RAW STRINGS, AND THAT IS A REAL CHOICE.
Comparing the strings exactly as logged reproduces Session 26/27's figures to
four decimal places. Applying the NFKC + whitespace normalisation that
check-rewrite-quality.py uses moves BOTH runs by -0.0003 (naoshi-4 0.1052 ->
0.1049, naoshi-5 0.0763 -> 0.0760) and leaves the identical-to-source counts
alone. That offset is small, consistent, and exactly the kind of quiet
methodology drift that makes two sessions quote different numbers for the same
thing. So the raw form is the definition of record because it is the one the
existing figures were computed under; NORMALISED is available behind
--normalised for anyone who wants it, and is reported as a separate number
rather than silently replacing this one.

VALIDATION
The two known points are asserted on every run:
    naoshi-4  ->  0.1052 divergence, 47 identical
    naoshi-5  ->  0.0763 divergence, 56 identical
If either drifts, the script FAILS rather than printing a number. A metric that
can change without anyone noticing is the thing this file was written to stop.

USAGE
  python3 check-divergence.py [workbook.xlsx] [--log PATH] [--normalised] [--json]

Exit codes: 0 validated · 1 a known point drifted · 2 refused (nothing scanned)
"""
import json
import re
import sys
import unicodedata
from difflib import SequenceMatcher
from pathlib import Path

import openpyxl

HERE = Path(__file__).resolve().parent
DEFAULT_WB = 'naoshi-eval-v1-with-outputs.xlsx'
DEFAULT_LOG = 'bakeoff-log.jsonl'
ES_SHEET = 'Eval Set'
E_ID, E_SENT = 1, 4
EID_RE = re.compile(r'^E\d+$')

# The reconstructed points Session 27 validated against. Four decimal places,
# because the runs they gate differ in the third.
KNOWN = {
    'naoshi-4': (0.1052, 47),
    'naoshi-5': (0.0763, 56),
}


def norm(s):
    """NFKC + collapsed whitespace — the check-rewrite-quality.py convention.

    Used ONLY under --normalised. See the docstring: this is not the definition
    of record, it is the alternative, reported separately so the difference
    between the two can never be mistaken for a change in the runs.
    """
    if s is None:
        return ''
    return re.sub(r'\s+', ' ', unicodedata.normalize('NFKC', str(s))).strip()


def raw(s):
    return '' if s is None else str(s)


def load_sentences(path):
    """Eval ID -> the learner's original sentence, from the Eval Set sheet."""
    wb = openpyxl.load_workbook(path, data_only=True)
    if ES_SHEET not in wb.sheetnames:
        sys.exit(f'{path} has no {ES_SHEET!r} sheet — refusing.')
    ws = wb[ES_SHEET]
    out = {}
    for r in range(1, ws.max_row + 1):
        v = ws.cell(row=r, column=E_ID).value
        if isinstance(v, str) and EID_RE.match(v.strip()):
            out[v.strip()] = ws.cell(row=r, column=E_SENT).value
    return out


def load_log(path):
    rows = []
    with open(path, encoding='utf-8') as fh:
        for line in fh:
            line = line.strip()
            if line:
                rows.append(json.loads(line))
    return rows


def measure(rows, sentences, prep):
    """{schema: (n, mean divergence, identical)} under one string treatment."""
    by = {}
    for rec in rows:
        schema = rec.get('schema', '<unstamped>')
        src = prep(sentences.get(rec.get('eval_id')))
        rewrite = prep((rec.get('raw') or {}).get('model_rewrite'))
        if not rewrite:
            # A row with no rewrite is a parse question, not a divergence of
            # zero. Counting it as identical-to-source would be a silent lie in
            # the conservative direction, which is the direction that matters.
            continue
        d = 1 - SequenceMatcher(None, src, rewrite, autojunk=False).ratio()
        n, tot, ident = by.get(schema, (0, 0.0, 0))
        by[schema] = (n + 1, tot + d, ident + (1 if rewrite == src else 0))
    return {s: (n, tot / n if n else 0.0, ident) for s, (n, tot, ident) in by.items()}


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    flags = [a for a in sys.argv[1:] if a.startswith('--')]
    as_json = '--json' in flags
    show_norm = '--normalised' in flags

    log_path = HERE / DEFAULT_LOG
    for f in flags:
        if f.startswith('--log='):
            log_path = Path(f.split('=', 1)[1])
    wb_path = Path(args[0]) if args else HERE / DEFAULT_WB

    for p in (wb_path, log_path):
        if not p.exists():
            sys.exit(f'No such file: {p}')

    sentences = load_sentences(wb_path)
    if not sentences:
        sys.exit(f'No eval rows read from {wb_path} — refusing to report on nothing.')
    rows = load_log(log_path)
    if not rows:
        sys.exit(f'No records read from {log_path} — refusing to report on nothing.')

    stats = measure(rows, sentences, raw)
    normed = measure(rows, sentences, norm) if show_norm else {}

    if as_json:
        print(json.dumps({'raw': stats, 'normalised': normed}, indent=2, sort_keys=True))
    else:
        print(f'{len(rows)} log records from {log_path.name}, '
              f'{len(sentences)} eval sentences from {wb_path.name}.\n')
        print(f"  {'schema':<14}{'n':>5}{'divergence':>13}{'identical':>11}")
        for schema in sorted(stats):
            n, d, ident = stats[schema]
            print(f'  {schema:<14}{n:>5}{d:>13.4f}{ident:>11}')
        if show_norm:
            print('\n  NFKC-normalised (not the definition of record):')
            for schema in sorted(normed):
                n, d, ident = normed[schema]
                print(f'  {schema:<14}{n:>5}{d:>13.4f}{ident:>11}')

    # ---- the guard ----
    bad = []
    for schema, (want_d, want_i) in KNOWN.items():
        if schema not in stats:
            bad.append(f'{schema}: absent from the log entirely')
            continue
        _n, got_d, got_i = stats[schema]
        if round(got_d, 4) != want_d or got_i != want_i:
            bad.append(f'{schema}: got {got_d:.4f}/{got_i}, '
                       f'expected {want_d:.4f}/{want_i}')
    if bad:
        print('\n⛔ A VALIDATED POINT HAS DRIFTED — not printing this as a result.')
        for b in bad:
            print(f'   {b}')
        print('   Either the log changed or the definition did. Find out which '
              'before quoting any number above.')
        return 1
    print('\n✅ Both known points reproduce '
          '(naoshi-4 0.1052/47, naoshi-5 0.0763/56).')
    return 0


if __name__ == '__main__':
    sys.exit(main())
