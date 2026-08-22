#!/usr/bin/env python3
"""Validate lesson-settings-v1.json against grammar-module.jsx itself.

Same discipline as check-scenes.py: point ids, steps and the kanji dictionary are read
out of the module at run time, never from a spec. Adds the checks the merged primitive
needs -- that every setting still carries its sourcing, and that a merged lesson names
what it was merged from.
"""
import json, re, sys, collections

D = json.load(open('lesson-settings-v1.json', encoding='utf-8'))
items = D['items']
# Audit 2026-08-23: a zero-item parse ran no checks and printed the same
# "FAIL: none — all checks passed" as a clean run. Refuse it instead.
if not items:
    print("REFUSED: 0 items in lesson-settings-v1.json — an empty read would pass every check.")
    sys.exit(2)
src = open('grammar-module.jsx', encoding='utf-8').read()

point_step = {}
for b in re.split(r'\n  \{\n    cat: "', src)[1:]:
    cat = b.split('"')[0]
    for pid, jp, en in re.findall(r'id: "([a-z0-9-]+)", jp: "([^"]*)", en: "([^"]*)"', b):
        point_step[pid] = cat

KD = set()
for w, r, m, lv in re.findall(r'\["([^"]+)", "([^"]+)", "([^"]+)", "(N\d)"\]', src):
    KD.update(ch for ch in w if '一' <= ch <= '鿿')

# the two source files this merges, so nothing is claimed to merge from an item that
# does not exist
prior = set()
for f in ('micro-anecdotes-v1.json', 'grammar-scenes-v1.json'):
    prior |= {x['id'] for x in json.load(open(f, encoding='utf-8'))['items']}

fail, warn = [], []
per_step = collections.Counter()

def step_no(cat):
    m = re.match(r"Step (\d+)", cat)
    return int(m.group(1)) if m else None

for it in items:
    i, p = it['id'], it['point']
    if p not in point_step:
        fail.append(f"{i}: point '{p}' not in grammar-module.jsx"); continue
    if point_step[p] != it['step']:
        fail.append(f"{i}: step mismatch — json {it['step']!r}, module {point_step[p]!r}")
    per_step[point_step[p]] += 1

    sw, tw = len(it['setting'].split()), len(it['turn'].split())
    if not 45 <= sw <= 80: fail.append(f"{i}: setting {sw} words (45-80)")
    if not 25 <= tw <= 55: fail.append(f"{i}: turn {tw} words (25-55)")

    for m in it['merged_from']:
        if m not in prior: fail.append(f"{i}: merged_from {m!r} is not an id in either source file")
    if not it['why_this_lesson'].strip():
        fail.append(f"{i}: why_this_lesson is empty — the pattern choice has to be argued")

    c = it.get('contrast')
    if c:
        if c['kind'] not in ('alt', 'misfit', 'error'):
            fail.append(f"{i}: contrast kind {c['kind']!r} not in alt/misfit/error")
        if c['kind'] == 'error' and step_no(it['step']) in {0, 1, 2}:
            fail.append(f"{i}: error-contrast not allowed in {it['step']}")

    jp_all = it['line']['jp'] + (c['jp'] if c else '')
    if it['pattern'] is None:
        warn.append(f"{i}: pattern is an absence, nothing to match -- verify by eye")
    elif it['pattern'] not in jp_all:
        fail.append(f"{i}: pattern {it['pattern']!r} does not appear in the Japanese")

    # the merge must not lose the verification work
    if not it['claims'] and not any('No factual claims' in f for f in it['flags']):
        fail.append(f"{i}: no claims and no flag saying the situation asserts none")
    if it['claims'] and not it['sources'] and not it['flags']:
        fail.append(f"{i}: claims made with no source and no flag explaining why")

    for f in ('line', 'contrast'):
        blk = it.get(f)
        if not blk: continue
        out = [ch for ch in blk['jp'] if '一' <= ch <= '鿿' and ch not in KD]
        if out:
            flagged = any('KANJI_DICT' in x for x in it['flags'])
            (warn if flagged else fail).append(
                f"{i}.{f}: kanji outside KANJI_DICT {out}" + (" (flagged)" if flagged else " — flag it or change the word"))

    ROMAJI = (r'\b(desu|masu|kudasai|arigatou|sensei|senpai|teineigo|sonkeigo|kenjougo'
              r'|omiyage|hanko|konbini|shitsurei|sumimasen)\b')
    hits = set(m.group(0).lower() for m in re.finditer(
        ROMAJI, it['setting'] + it['turn'] + it['line']['en'], re.I))
    if hits:
        excused = any('romaji' in f.lower() for f in it['flags'])
        (warn if excused else fail).append(
            f"{i}: romaji in rendered text {sorted(hits)}" + (" (flagged as deliberate)" if excused else ""))

# Coverage, not density. cc-* lessons are already situations and b-*/rc* are composition
# tasks, so neither needs a setting; everything else in a started step does.
covered = {x['point'] for x in items}
started = {x['step'] for x in items}
step_points = collections.defaultdict(list)
for b in re.split(r'\n  \{\n    cat: "', src)[1:]:
    cat = b.split('"')[0]
    for pid, jp, en in re.findall(r'id: "([a-z0-9-]+)", jp: "([^"]*)", en: "([^"]*)"', b):
        if pid.startswith(('cc-', 'b-', 'b1', 'b2', 'b3', 'rc')): continue
        step_points[cat].append(pid)
gaps = {}
for st in started:
    missing = [p for p in step_points.get(st, []) if p not in covered]
    if missing: gaps[st] = missing

print(f"lessons authored: {len(items)}   steps touched: {len(per_step)}")
merged = sum(1 for x in items if len(x['merged_from']) > 1)
print(f"natural merges (scene + anecdote on one point): {merged}")
print(f"claims carried: {sum(len(x['claims']) for x in items)}   sources: {sum(len(x['sources']) for x in items)}")
sw = [len(x['setting'].split()) for x in items]
print(f"setting words: min {min(sw)} max {max(sw)}")
print("\n-- coverage of started steps --")
for st in sorted(started, key=lambda s: list(point_step.values()).index(s)):
    tot = len(step_points.get(st, []))
    print(f"  {tot - len(gaps.get(st, [])):2}/{tot:2}  {st}" + ("   MISSING: " + ", ".join(gaps[st]) if st in gaps else ""))

print("\nWARN:" if warn else "\nWARN: none")
for x in warn: print("  -", x)
print("\nFAIL:" if fail else "\nFAIL: none — all checks passed")
for x in fail: print("  -", x)
sys.exit(1 if fail else 0)
