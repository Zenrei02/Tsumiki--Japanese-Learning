#!/usr/bin/env python3
"""Validate lesson-arcs-v1.json against grammar-module.jsx itself.

Everything authoritative is read out of the module at run time: the point ids, the step
each one sits in, the DEEP wrinkle arrays an arc attaches to, and KANJI_DICT. A `wr`
index that stops resolving because the module changed fails here rather than at render.
"""
import json, re, sys, collections

ARCS = json.load(open('lesson-arcs-v1.json', encoding='utf-8'))
items = ARCS['items']
src = open('grammar-module.jsx', encoding='utf-8').read()

# ---- module facts -----------------------------------------------------------
point_step, order, step_points = {}, [], collections.defaultdict(list)
for b in re.split(r'\n  \{\n    cat: "', src)[1:]:
    cat = b.split('"')[0]; order.append(cat)
    for pid, jp, en in re.findall(r'id: "([a-z0-9-]+)", jp: "([^"]*)", en: "([^"]*)"', b):
        point_step[pid] = cat
        if not pid.startswith(('b-', 'b1', 'b2', 'b3', 'rc', 'cc-')):
            step_points[cat].append(pid)

def load_deep():
    i = src.index('{', src.index('const DEEP = '))
    depth = 0; j = i; instr = False; esc = False
    while j < len(src):
        c = src[j]
        if instr:
            if esc: esc = False
            elif c == '\\': esc = True
            elif c == '"': instr = False
        else:
            if c == '"': instr = True
            elif c == '{': depth += 1
            elif c == '}':
                depth -= 1
                if depth == 0: break
        j += 1
    body = '\n'.join(l for l in src[i:j+1].split('\n') if not l.lstrip().startswith('//'))
    return json.loads(re.sub(r',(\s*[}\]])', r'\1', body))
DEEP = load_deep()

KD = set()
for w, r, m, lv in re.findall(r'\["([^"]+)", "([^"]+)", "([^"]+)", "(N\d)"\]', src):
    KD.update(ch for ch in w if '一' <= ch <= '鿿')

fail, warn = [], []
ROMAJI = (r'\b(desu|masu|kudasai|arigatou|sensei|senpai|teineigo|sonkeigo|kenjougo'
          r'|omiyage|hanko|konbini|shitsurei|sumimasen)\b')

def kanji_out(s_):  return [ch for ch in s_ if '一' <= ch <= '鿿' and ch not in KD]

for it in items:
    p, i = it['point'], it['point']
    if p not in point_step:
        fail.append(f"{p}: not a point in grammar-module.jsx"); continue
    if point_step[p] != it['step']:
        fail.append(f"{p}: step mismatch — json {it['step']!r}, module {point_step[p]!r}")

    st = it['setting']
    sw = len(st['scene'].split())
    if not 45 <= sw <= 80: fail.append(f"{p}: setting {sw} words (45-80)")
    if not st.get('jp'):   fail.append(f"{p}: setting has no Japanese line")
    if st.get('pattern') and st['pattern'] not in st['jp']:
        fail.append(f"{p}: setting pattern {st['pattern']!r} not in its own line")

    exts = it['extensions']
    if not exts: fail.append(f"{p}: no extensions — the `when` replacement is missing")
    if not any(e['kind'] == 'flip' for e in exts):
        fail.append(f"{p}: no 'flip' extension — every lesson needs the learner's-side use")

    wr_avail = (DEEP.get(p) or {}).get('wr') or []
    used = []
    for n, e in enumerate(exts):
        tag = f"{p}.ext{n}"
        ew = len(e['scene'].split())
        if not 30 <= ew <= 60: fail.append(f"{tag}: scene {ew} words (30-60)")
        if not e.get('jp'):    fail.append(f"{tag}: no Japanese line — a page without one is narration")
        if e['kind'] not in ('flip', 'wrinkle', 'extra'):
            fail.append(f"{tag}: kind {e['kind']!r} not in flip/wrinkle/extra")
        if e['kind'] == 'wrinkle':
            if e.get('wr') is None:
                fail.append(f"{tag}: kind 'wrinkle' with no wr index")
            elif e['wr'] >= len(wr_avail):
                fail.append(f"{tag}: wr index {e['wr']} but module has {len(wr_avail)} wrinkle(s) for {p}")
            else:
                used.append(e['wr'])
        if e['kind'] == 'extra' and not e.get('t'):
            fail.append(f"{tag}: kind 'extra' must carry its own teaching text `t`")
        if e['kind'] == 'flip' and e.get('wr') is not None:
            fail.append(f"{tag}: a flip has no module wrinkle behind it — wr must be null")
    if len(used) != len(set(used)):
        fail.append(f"{p}: the same module wrinkle is used by two extensions")
    unused = [k for k in range(len(wr_avail)) if k not in used]
    if unused:
        warn.append(f"{p}: module wrinkle(s) {unused} have no extension — they will not render")

    for label, blk in [("setting", st)] + [(f"ext{n}", e) for n, e in enumerate(exts)]:
        out = kanji_out(blk.get('jp', ''))
        if out:
            flagged = any('KANJI_DICT' in f or 'furigana' in f for f in it['flags'])
            (warn if flagged else fail).append(
                f"{p}.{label}: kanji outside KANJI_DICT {out}" + (" (flagged)" if flagged else " — flag it or change the word"))

    text = st['scene'] + ' ' + ' '.join(e['scene'] for e in exts)
    hits = set(m.group(0).lower() for m in re.finditer(ROMAJI, text, re.I))
    if hits:
        excused = any('romaji' in f.lower() for f in it['flags'])
        (warn if excused else fail).append(f"{p}: romaji in rendered text {sorted(hits)}")

    if not it['claims'] and not any('No factual claims' in f for f in it['flags']):
        fail.append(f"{p}: no claims and no flag saying the situation asserts none")
    if it['claims'] and not it['sources'] and not it['flags']:
        fail.append(f"{p}: claims made with no source and no flag explaining why")

if len({x['point'] for x in items}) != len(items): fail.append("duplicate points")

covered = {x['point'] for x in items}
started = [c for c in order if any(x['step'] == c for x in items)]
print(f"arcs: {len(items)}   pages authored: {len(items) * 1 + sum(len(x['extensions']) for x in items)}"
      f" (setting + extensions)   extensions: {sum(len(x['extensions']) for x in items)}")
kinds = collections.Counter(e['kind'] for x in items for e in x['extensions'])
print("extension kinds:", dict(kinds))
# Coverage across every stage the module has, not a hardcoded range -- a stage added
# later must not silently report as complete because the loop never looked at it.
def stage_of(cat):
    m = re.match(r"Step (\d+)", cat)
    if not m: return None
    n = int(m.group(1))
    return 1 if n <= 12 else (2 if n <= 23 else 3)

print("\n-- coverage by stage --")
grand_done = grand_tot = 0
for stage in (1, 2, 3):
    cats = [c for c in order if stage_of(c) == stage]
    if not cats: continue
    done = tot = 0
    lines = []
    for c in cats:
        pts = step_points[c]; have = [q for q in pts if q in covered]
        done += len(have); tot += len(pts)
        miss = [q for q in pts if q not in covered]
        lines.append(f"  {len(have):2}/{len(pts):2}  {c}" + ("   MISSING: " + ", ".join(miss))[:96] if miss else f"  {len(have):2}/{len(pts):2}  {c}")
    pct = done * 100 // tot if tot else 0
    print(f"\n  STAGE {stage}: {done}/{tot} teaching points ({pct}%)")
    for l in lines: print(l)
    grand_done += done; grand_tot += tot
print(f"\n  ALL STAGES: {grand_done}/{grand_tot} ({grand_done*100//grand_tot}%)")

print("\nWARN:" if warn else "\nWARN: none")
for x in warn: print("  -", x)
print("\nFAIL:" if fail else "\nFAIL: none — all checks passed")
for x in fail: print("  -", x)
sys.exit(1 if fail else 0)
