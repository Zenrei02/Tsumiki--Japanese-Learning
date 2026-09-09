#!/usr/bin/env python3
"""
test-b10-roundtrip.py — can build-b10-form.py's preview be trusted to describe
the file Apps Script will actually run?

WHY THIS EXISTS. The preview is rendered by parsing the emitted .gs back out and
decoding it, rather than from the rows the generator holds in memory. That choice
is the whole point: rendering the intent and calling it a preview of the artifact
is the mistake this project has made three times. But it only buys anything if
the decoder is exact and the parser REFUSES a file it cannot read — a parser that
silently returns fewer rows would produce a short preview that looks complete.

So this file tests the round trip in both directions, and every refusal has a
partner that must succeed. A guard that has only ever refused has not been
tested; a round trip that has only ever passed has not been either.

Exit 0 = js/unjs are exact inverses, the parser reads good input and refuses bad.
"""
import importlib.util
import pathlib
import sys

HERE = pathlib.Path(__file__).parent
spec = importlib.util.spec_from_file_location('_b10', str(HERE / 'build-b10-form.py'))
b10 = importlib.util.module_from_spec(spec)
spec.loader.exec_module(b10)

fails = 0


def case(label, got, want):
    global fails
    ok = got == want
    if not ok:
        fails += 1
    print(f"{'ok   ' if ok else 'FAIL '} {label:<52} -> {got!r} (wanted {want!r})")


# ── js() and unjs() must be exact inverses ───────────────────────────────────
# The inputs that matter are the ones the real data contains: apostrophes in the
# English explanations, backslashes, newlines between the summary and the [FIX]
# lines, full-width Japanese punctuation, and the unescaped double quotes that
# O040 made famous.
print('js / unjs — exact inverses on the shapes the real data has')
for s in [
    'plain',
    "it's got an apostrophe",
    "back\\slash and 'quote' together",
    'line one\nline two\nline three',
    'かのじょが直してくれると思った（笑）',   # kana + kanji + full-width parens
    '(transitive, "to produce/put out")',
    'trailing backslash \\',
    '',
]:
    case(f'round trip {s[:30]!r}', b10.unjs(b10.js(s)), s)

# ── the parser must refuse what it cannot read ───────────────────────────────
print('\nparse_gs_rows — refuses a file it cannot read')
for label, bad in [
    ('no DATA block at all', 'var NOPE = [];'),
    ('a row missing a string field', "var DATA = [\n  { oid: 'O001' },\n];"),
    ('a row missing a boolean field',
     "var DATA = [\n  { oid: 'O001', sentence: 'あ', explanation: 'b', "
     "rewrite: 'c', key: 'd' },\n];"),
]:
    try:
        b10.parse_gs_rows(bad)
        got = 'returned'
    except SystemExit:
        got = 'refused'
    case(label, got, 'refused')

# THE PASSING CONTROL. Without it every assertion above is satisfied by a parser
# that refuses everything.
print('\n...and reads one it can (the control)')
good = ("var DATA = [\n"
        "  { oid: 'O001', sentence: 'あ', explanation: 'x\\'y', rewrite: 'い', "
        "showKey: true, key: 'う', keyAmended: false },\n"
        "  { oid: 'O002', sentence: 'え', explanation: 'p\\nq', rewrite: 'お', "
        "showKey: false, key: '', keyAmended: false },\n];")
rows = b10.parse_gs_rows(good)
case('reads both rows', len(rows), 2)
case('decodes an escaped apostrophe', rows[0]['explanation'], "x'y")
case('decodes an escaped newline', rows[1]['explanation'], 'p\nq')
case('reads the booleans', (rows[0]['showKey'], rows[1]['showKey']), (True, False))
case('keeps the order', [r['oid'] for r in rows], ['O001', 'O002'])

# ── the description extractor ────────────────────────────────────────────────
# It concatenates literals. If the template ever interpolates a variable, the
# preview would show the reviewer something she does not get, so it must refuse
# rather than render a partial description.
print('\ngs_description — literals only')
try:
    b10.gs_description("form.setDescription(\n    'a' + batch + 'b'\n  );")
    got = 'returned'
except SystemExit:
    got = 'refused'
case('refuses an interpolated description', got, 'refused')
try:
    b10.gs_description("form.setDescription(\n    'nothing familiar here'\n  );")
    got = 'returned'
except SystemExit:
    got = 'refused'
case('refuses a block without the known heading', got, 'refused')

# and the real file, if it has been generated
gs = HERE / 'build-b10-form.gs'
if gs.exists():
    print('\nthe real generated file')
    text = gs.read_text(encoding='utf-8')
    real = b10.parse_gs_rows(text)
    case('parses every row', len(real), 24)
    case('every row has an Output ID',
         all(b10.re.fullmatch(r'O\d{3}', r['oid']) for r in real), True)
    case('exactly four rows show the key',
         sum(1 for r in real if r['showKey']), 4)
    desc = b10.gs_description(text)
    case('the description comes back', '今回きいていること' in desc, True)
    case('no model code survived into it',
         any(m in text for m in ('M1', 'M2', 'M3')), False)
else:
    print('\n(build-b10-form.gs not generated — run build-b10-form.py first)')

print()
if fails:
    print(f'{fails} FAILED')
    sys.exit(1)
print('js/unjs are exact inverses, the parser refuses bad input and reads good')
