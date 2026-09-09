#!/usr/bin/env python3
"""
test-json-repair.py — does the O040 repair fix the row it was written for, and
leave every other row alone?

WHY THIS EXISTS. O040 (E24 × M1) fails to parse on every run — 6 of 6 records in
bakeoff-parse-failures.jsonl, all `Expecting ',' delimiter: line 4 column 81`.
Haiku quotes its own glosses inside a JSON string value:

    "summary": "... 出す (transitive, "to produce/put out") should be 出る ..."

The row then drops out of the denominator silently, for one model only.

⚠ THE CONTROL IS THE POINT. A repair pass that rewrites text is exactly the kind
of change that fixes one row and corrupts a hundred, and it would look like a
success either way — the run would complete and the numbers would move. So the
second half of this file feeds every good response in the log through the repair
and asserts it comes back BYTE-IDENTICAL. A repair that is never a no-op on good
input is not a repair, it is a transform.

Exit 0 = the fixture parses, the object is shaped like a real M1 row, and no good
row was touched.
"""
import importlib.util, json, pathlib, sys

HERE = pathlib.Path(__file__).parent
spec = importlib.util.spec_from_file_location('_bh', str(HERE / 'bakeoff-harness.py'))
bh = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bh)

fails = 0


def case(label, got, want):
    global fails
    ok = got == want
    if not ok:
        fails += 1
    print(f"{'ok   ' if ok else 'FAIL '} {label:<54} -> {got!r} (wanted {want!r})")


# ── the fixture, taken from the failure log, not retyped ─────────────────────
print('O040 — the fixture from bakeoff-parse-failures.jsonl')
fixture = None
for line in open(HERE / 'bakeoff-parse-failures.jsonl', encoding='utf-8'):
    if not line.strip():
        continue
    r = json.loads(line)
    if r.get('output_id') == 'O040':
        fixture = r
        break
if fixture is None:
    sys.exit('!! O040 is not in bakeoff-parse-failures.jsonl — the fixture is gone. '
             'Do not delete this test; restore the fixture.')

text = fixture['text']
case('the recorded failure is a JSONDecodeError',
     fixture.get('error_type'), 'JSONDecodeError')

# it really is broken, before anything claims to have fixed it
start = text.find('{')
try:
    json.JSONDecoder().raw_decode(text[start:])
    broken = False
except json.JSONDecodeError:
    broken = True
case('the raw text does NOT parse (control)', broken, True)

obj, repaired = bh.extract_json(text)
case('extract_json now returns an object', isinstance(obj, dict), True)
case('...and reports that it repaired to get there', repaired, True)

# the shape a good M1 row has — a parse that yields the wrong shape is worse
# than a failure, because it would flow into the workbook as real feedback.
good = None
for line in open(HERE / 'bakeoff-log.jsonl', encoding='utf-8'):
    if not line.strip():
        continue
    r = json.loads(line)
    if r.get('model_code') == 'M1' and r.get('schema') == 'naoshi-4' and r.get('raw'):
        good = r['raw']
        break
case('a good M1 row was found to compare against', good is not None, True)
if good:
    case('the repaired object has the same top-level keys',
         sorted(obj.keys()), sorted(good.keys()))
case('overall.summary survived as a string',
     isinstance(obj.get('overall', {}).get('summary'), str), True)
case('the inner quotes are now IN the summary text',
     '"to produce/put out"' in obj['overall']['summary'], True)
case('the issues list survived', len(obj.get('issues', [])), 1)
case('model_rewrite survived',
     obj.get('model_rewrite'), 'え！僕も先週末に熱が出ました。')

# and it flows through the real renderer, not just json.loads
case('verdict_of reads it', bh.verdict_of(obj), 'FIX')
case('render_feedback produces a Rewrite: line',
     'Rewrite: え！僕も先週末に熱が出ました。' in bh.render_feedback(obj), True)

# ── the control: every good response must be untouched ───────────────────────
print('\ncontrol — a good row must be byte-unchanged by the repair')
scanned = changed = 0
for line in open(HERE / 'bakeoff-log.jsonl', encoding='utf-8'):
    if not line.strip():
        continue
    r = json.loads(line)
    raw = r.get('raw')
    if not raw:
        continue
    # Re-serialise the object as the model would have sent it, then round-trip.
    for indent in (None, 2):
        s = json.dumps(raw, ensure_ascii=False, indent=indent)
        scanned += 1
        if bh.repair_unescaped_quotes(s) != s:
            changed += 1
            if changed <= 3:
                print(f'      changed: {r["output_id"]} ({r["schema"]})')
print(f'      {scanned} well-formed JSON documents fed through the repair')
case('none of them was altered', changed, 0)

# and the no-op holds for the shapes that trip naive scanners
print('\ncontrol — escapes and structural quotes the scanner must not touch')
for label, s in [
    ('an escaped quote inside a value', r'{"a": "he said \"hi\" then left"}'),
    ('a backslash before the terminator', r'{"a": "ends with a backslash\\"}'),
    ('an empty string value', '{"a": ""}'),
    ('a brace inside a string', '{"a": "not }, an object"}'),
    ('nested objects and arrays', '{"a": [{"b": "c"}, {"d": ["e", "f"]}]}'),
    ('a colon inside a string', '{"a": "ratio 3:1, roughly"}'),
]:
    out = bh.repair_unescaped_quotes(s)
    case(label, out == s and json.loads(out) == json.loads(s), True)

# ── the one it is allowed to fix, in miniature ───────────────────────────────
print('\nthe repair itself')
bad = '{"summary": "uses 出す (transitive, "to produce") here"}'
try:
    json.loads(bad)
    bad_parses = True
except json.JSONDecodeError:
    bad_parses = False
case('the miniature does NOT parse first (control)', bad_parses, False)
fixed = bh.repair_unescaped_quotes(bad)
case('...and parses after repair',
     json.loads(fixed)['summary'], 'uses 出す (transitive, "to produce") here')

print()
if fails:
    print(f'{fails} FAILED')
    sys.exit(1)
print('the fixture parses, keeps its shape, and no good row was altered')
