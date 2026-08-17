#!/usr/bin/env python3
"""Validate grammar-scenes-v1.json against grammar-module.jsx itself.

Checks the module, never the spec: every `point` id and its step are read out of
grammar-module.jsx at run time, so a scene pointing at a lesson that has moved or been
renamed fails here rather than at render.
"""
import json, re, sys, collections

D = json.load(open('grammar-scenes-v1.json', encoding='utf-8'))
items = D['items']
src = open('grammar-module.jsx', encoding='utf-8').read()

# point id -> (step, jp, en), read from the module
point_step, point_jp = {}, {}
for b in re.split(r'\n  \{\n    cat: "', src)[1:]:
    cat = b.split('"')[0]
    for pid, jp, en in re.findall(r'id: "([a-z0-9-]+)", jp: "([^"]*)", en: "([^"]*)"', b):
        point_step[pid] = cat
        point_jp[pid] = jp

KD = set()
for w, r, m, lv in re.findall(r'\["([^"]+)", "([^"]+)", "([^"]+)", "(N\d)"\]', src):
    KD.update(ch for ch in w if '一' <= ch <= '鿿')

fail, warn = [], []
per_step = collections.Counter()
def step_no(cat):
    m = re.match(r"Step (\d+)", cat)
    return int(m.group(1)) if m else None   # checkpoints return None
EARLY = {0, 1, 2}   # steps where an error-contrast is not allowed

for it in items:
    i, p = it['id'], it['point']
    if p not in point_step:
        fail.append(f"{i}: point '{p}' not in grammar-module.jsx"); continue
    if point_step[p] != it['step']:
        fail.append(f"{i}: step mismatch — json says {it['step']!r}, module says {point_step[p]!r}")
    per_step[point_step[p]] += 1

    sw, tw = len(it['setup'].split()), len(it['turn'].split())
    it['_w'] = sw + tw
    if not 35 <= sw <= 70: fail.append(f"{i}: setup {sw} words (35-70)")
    if not 25 <= tw <= 55: fail.append(f"{i}: turn {tw} words (25-55)")
    if it['_w'] > 130:     fail.append(f"{i}: {it['_w']} rendered words (cap 130)")

    if it['setup'].rstrip()[-1:] in '。」':
        warn.append(f"{i}: setup ends on Japanese punctuation — setup should stop before the line")

    c = it.get('contrast')
    if c:
        if c['kind'] not in ('alt', 'misfit', 'error'):
            fail.append(f"{i}: contrast kind {c['kind']!r} not in alt/misfit/error")
        if c['kind'] == 'error' and step_no(it['step']) in EARLY:
            fail.append(f"{i}: error-contrast not allowed in {it['step']}")

    # The pattern has to actually appear in the Japanese. The module's `jp` field cannot be
    # trusted to supply it -- sometimes it is a lesson title ("うちとそと"), sometimes the
    # pattern is conjugated away in a real sentence (〜てくる surfacing as てきました). So the
    # scene names its own fragment and this verifies it, which catches a later edit that
    # drifts a line off its own point. None means the pattern is an absence (sc-drop).
    if 'pattern' not in it:
        fail.append(f"{i}: no `pattern` field -- state the fragment, or null if it is an absence")
    elif it['pattern'] is None:
        warn.append(f"{i}: pattern is an absence, nothing to match -- verify by eye")
    else:
        jp_all = it['line']['jp'] + (c['jp'] if c else '')
        if it['pattern'] not in jp_all:
            fail.append(f"{i}: pattern {it['pattern']!r} does not appear in the Japanese")
        # and cross-check it against the module, where the module gives a real pattern
        title = point_jp[p]
        if not re.search(r'[「」、,]|\bvs\b|[A-Za-z]', title):
            core = [x for x in re.split(r'[・/\s]|〜|（.*?）', title) if x and re.search(r'[ぁ-んァ-ヶ一-龥]', x)]
            stems = [re.sub(r'[うるいだ]$', '', x) for x in core]
            if core and not any(st and st in jp_all for st in stems):
                warn.append(f"{i}: module pattern {core} not visible in the line (named fragment {it['pattern']!r} is) -- conjugation, probably; check by eye")

    for f in ('line', 'contrast'):
        blk = it.get(f)
        if not blk: continue
        out = [ch for ch in blk['jp'] if '一' <= ch <= '鿿' and ch not in KD]
        if out: warn.append(f"{i}.{f}: kanji outside KANJI_DICT {out} — furigana decision needed")

    # Romaji leak in the rendered English. 'keigo' is deliberately NOT on this list: the
    # module already uses it as an English term (lesson en: "the keigo you'll hear most").
    ROMAJI = (r'\b(desu|masu|kudasai|arigatou|sensei|senpai|teineigo|sonkeigo|kenjougo'
              r'|omiyage|hanko|konbini|shitsurei|sumimasen)\b')
    hits = set(m.group(0).lower() for m in re.finditer(
        ROMAJI, it['setup'] + it['turn'], re.I))
    if hits: fail.append(f"{i}: romaji leak in rendered English: {sorted(hits)}")

if len(set(x['id'] for x in items)) != len(items): fail.append("duplicate scene ids")
for st, c in per_step.items():
    if c > 2: fail.append(f"density: {st} has {c} scenes (cap 2)")

print(f"scenes: {len(items)}   points covered: {len(set(x['point'] for x in items))}")
print("\n-- per-step --")
for st in sorted(per_step, key=lambda s: list(point_step.values()).index(s)):
    print(f"  {per_step[st]}  {st}")
w = [x['_w'] for x in items]
print(f"\nrendered words: min {min(w)} median {sorted(w)[len(w)//2]} max {max(w)}")
ck = collections.Counter(x['contrast']['kind'] for x in items if x.get('contrast'))
print(f"contrasts: {dict(ck)}   none: {sum(1 for x in items if not x.get('contrast'))}")
tg = collections.Counter(t for x in items for t in x['tags'])
print("tags:", dict(tg))

print("\nWARN:" if warn else "\nWARN: none")
for x in warn: print("  -", x)
print("\nFAIL:" if fail else "\nFAIL: none — all checks passed")
for x in fail: print("  -", x)
sys.exit(1 if fail else 0)
