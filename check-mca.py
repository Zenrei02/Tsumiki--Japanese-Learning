import json,re,sys,collections
D=json.load(open('micro-anecdotes-v1.json',encoding='utf-8'))
items=D['items']
src=open('grammar-module.jsx',encoding='utf-8').read()

# build step -> bank words map from the module itself
steps={}
for b in re.split(r'\n  \{\n    cat: "',src)[1:]:
    cat=b.split('"')[0]
    bm=re.search(r'bank: \[(.*?)\],\n',b,re.S)
    words=[w for w,_ in re.findall(r'\["([^"]+)", *"([^"]*)"\]',bm.group(1))] if bm else []
    steps[cat]=words
    steps.setdefault('_cc',[])
cc_by_step={}
for b in re.split(r'\n  \{\n    cat: "',src)[1:]:
    cat=b.split('"')[0]
    cc_by_step[cat]=re.findall(r'id: "(cc-[a-z0-9-]+)"',b)

fail=[];warn=[]
print(f"items: {len(items)}")
ids=[i['id'] for i in items]
if len(set(ids))!=len(ids): fail.append("duplicate ids")

per_step=collections.Counter()
for it in items:
    w=it['anchor']['word']; st=it['anchor']['step']
    per_step[st]+=1
    if st not in steps: fail.append(f"{it['id']}: step not in module: {st}")
    elif w not in steps[st]: fail.append(f"{it['id']}: '{w}' not in bank of {st} (bank={steps[st]})")
    n=len(it['text'].split())
    it['words']=n
    if n<45 or n>110: fail.append(f"{it['id']}: {n} words (cap 45-110)")
    elif n>90: warn.append(f"{it['id']}: {n} words (over 90 target, under 110 cap)")
    if not it['sources'] and not it['flags']: fail.append(f"{it['id']}: no sources and no flag")
    if not it['claims']: fail.append(f"{it['id']}: no claims")

for st,c in per_step.items():
    if c>2: fail.append(f"density: {st} has {c} anecdotes (cap 2)")

# romaji leak: japanese common nouns written in romaji in RENDERED text
block=r'\b(yukata|omiyage|hanko|inkan|juminhyo|kotatsu|onsen|sento|konbini|shotengai|bonodori|matsuri|obon|tsuyu|sakura|jouyou|joyo|seiriken|oshibori|okusuri|shako|keijidousha|souji|youmuin|hiyokechi|banchi|chome|senbetsu|kaiten|zushi|ekimae|akiya|denwa|ramen|sensei|arigatou)\b'
allow={'furigana','katakana','hiragana','kanji','tatami','sushi','tofu','yen','samurai'}
for it in items:
    hits=set(m.group(0).lower() for m in re.finditer(block,it['text'],re.I))-allow
    if hits: fail.append(f"{it['id']}: romaji leak in rendered text: {sorted(hits)}")

print("\n-- per-step density (module cc- lessons in that step shown) --")
for st in sorted(per_step,key=lambda s:list(steps).index(s)):
    print(f"  {per_step[st]}  {st}   cc: {cc_by_step.get(st,[])}")

wc=[i['words'] for i in items]
print(f"\nwords: min {min(wc)} median {sorted(wc)[len(wc)//2]} max {max(wc)}")
print(f"claims total: {sum(len(i['claims']) for i in items)}")
print(f"items with flags: {sum(1 for i in items if i['flags'])}")
print(f"items with zero sources: {[i['id'] for i in items if not i['sources']]}")
tags=collections.Counter(t for i in items for t in i['tags'])
print("tags:",dict(tags))

print("\nWARN:" if warn else "\nWARN: none")
for w in warn: print("  -",w)
print("\nFAIL:" if fail else "\nFAIL: none — all checks passed")
for f in fail: print("  -",f)
sys.exit(1 if fail else 0)
