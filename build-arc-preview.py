#!/usr/bin/env python3
"""Build a SINGLE STANDALONE HTML preview of the whole grammar curriculum.

A SHAPE PREVIEW, not the app. It renders what a lesson looks like under
lesson-arc-design-v1.md so the structure can be judged before anything is deployed. It
does not modify the module, does not build the Vite app, and makes zero network requests —
everything is inlined, so the file opens from disk anywhere.

⚠️ IT RENDERS EVERY LESSON, NOT JUST THE ARCED ONES. Until Session 17 this was built from
lesson-arcs-v1.json alone, which meant it silently showed 180 of the module's 246 lessons:
every cc-* culture lesson and every checkpoint was ABSENT, including the whole of
Step 26 · Keigo in the wild. Lloyd found it by trying to reach Stage 3 and not being able
to. The curriculum is the source now, and the arcs are looked up per point — so a lesson
without an arc still appears, in its own shape, rather than vanishing.

Everything comes from grammar-module.jsx at build time — the four beats, DEEP.seg, the
wrinkles, the drills and the ARCS block — so the preview cannot drift from the module the
way a hand-made mockup would.
"""
import json, re, sys, pathlib

ROOT = pathlib.Path(__file__).parent
src = (ROOT / "grammar-module.jsx").read_text(encoding="utf-8")


def brace_object(after_marker):
    """Parse a `const X = {...}` object out of the module, comments stripped."""
    i = src.index("{", src.index(after_marker))
    depth = j = 0
    instr = esc = False
    j = i
    while j < len(src):
        c = src[j]
        if instr:
            if esc: esc = False
            elif c == "\\": esc = True
            elif c == '"': instr = False
        else:
            if c == '"': instr = True
            elif c == "{": depth += 1
            elif c == "}":
                depth -= 1
                if depth == 0: break
        j += 1
    body = "\n".join(l for l in src[i:j + 1].split("\n") if not l.lstrip().startswith("//"))
    return json.loads(re.sub(r",(\s*[}\]])", r"\1", body))


DEEP = brace_object("const DEEP = ")
ARCS = brace_object("const ARCS = ")

PAIR = r'\["((?:[^"\\]|\\.)*)", "((?:[^"\\]|\\.)*)"\]'


def unescape(s):
    return json.loads('"%s"' % s)


def parse_points(block):
    """Every lesson object in a step block, in order."""
    out = []
    for m in re.finditer(r'id: "([a-z0-9-]+)", jp: "((?:[^"\\]|\\.)*)", en: "((?:[^"\\]|\\.)*)"', block):
        pid, jp, en = m.group(1), unescape(m.group(2)), unescape(m.group(3))
        nxt = re.search(r'\n *\{?\s*id: "[a-z0-9-]+", jp: "', block[m.end():])
        body = block[m.end(): m.end() + (nxt.start() if nxt else len(block))]
        kind = (re.search(r'kind: "(\w+)"', body[:120]) or [None, "grammar"])[1] \
            if re.search(r'kind: "(\w+)"', body[:120]) else "grammar"
        exp = {}
        for f in ("what", "build", "when", "watch"):
            fm = re.search(r'\n *%s: "((?:[^"\\]|\\.)*)",' % f, body)
            if fm: exp[f] = unescape(fm.group(1))
        if not exp:
            fm = re.search(r'\n *exp: "((?:[^"\\]|\\.)*)",', body)
            if fm: exp["prose"] = unescape(fm.group(1))
        exm = re.search(r"\n *ex: \[(.*?)\],\n", body, re.S)
        ex = [[unescape(a), unescape(b)] for a, b in re.findall(PAIR, exm.group(1))] if exm else []
        cov = re.search(r"\n *covers: \[(.*?)\],", body, re.S)
        covers = re.findall(r'"([a-z0-9-]+)"', cov.group(1)) if cov else []
        brief = re.search(r'\n *brief: "((?:[^"\\]|\\.)*)",', body)
        out.append({"id": pid, "jp": jp, "en": en, "kind": kind, "exp": exp, "ex": ex,
                    "covers": covers, "brief": unescape(brief.group(1)) if brief else ""})
    return out


# Read the stage off the module's own `level` field. Inferring it from step numbers
# broke the moment Session 17 re-staged 3 stages into 9 without moving a step number.
STEP_STAGE = {}
for _b in re.split(r'\n  \{\n    cat: "', src)[1:]:
    _cat = _b.split('"')[0]
    _lv = re.search(r'level: "([^"]*)"', _b)
    STEP_STAGE[_cat] = _lv.group(1) if _lv else "?"


def stage_of(cat):
    return STEP_STAGE.get(cat, "?")


steps, lessons = [], []
for blk in re.split(r'\n  \{\n    cat: "', src)[1:]:
    cat = blk.split('"')[0]
    steps.append({"cat": cat, "stage": stage_of(cat)})
    for p in parse_points(blk):
        d = DEEP.get(p["id"]) or {}
        arc = ARCS.get(p["id"])
        wr = d.get("wr") or []
        exts = []
        for e in (arc or {}).get("extensions", []):
            t = e.get("t") if e.get("kind") != "wrinkle" else (
                wr[e["wr"]].get("t") if e.get("wr") is not None and e["wr"] < len(wr) else None)
            exts.append({"kind": e["kind"], "scene": e["scene"], "jp": e["jp"], "en": e["en"], "t": t})
        claimed = {e.get("wr") for e in (arc or {}).get("extensions", []) if e.get("wr") is not None}
        lessons.append({
            **p, "step": cat, "stage": stage_of(cat),
            "seg": d.get("seg") or [], "segNote": d.get("note") or "",
            "drill": (d.get("drill") or {}).get("items") or [],
            "drillNote": (d.get("drill") or {}).get("note") or "",
            "setting": (arc or {}).get("setting"), "ext": exts,
            "orphanWr": [w.get("t", "") for k, w in enumerate(wr) if k not in claimed],
        })

DATA = json.dumps({"steps": steps, "lessons": lessons}, ensure_ascii=False)

HTML = r"""<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>tsumiki — curriculum preview</title><style>
:root{--paper:#F7F6F2;--sheet:#FFF;--ink:#22252B;--sub:#6E7178;--hair:#E4E2DB;--shu:#C7351B;
--note:#907119;--noteBg:#FAF3E0;--ai:#3D5A80;--ok:#3E7C4F;
--jp:"Hiragino Mincho ProN","Yu Mincho","Noto Serif JP",serif;
--ui:-apple-system,BlinkMacSystemFont,"Segoe UI","Hiragino Sans","Noto Sans JP",sans-serif}
*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--ui);display:flex;min-height:100vh}
#side{width:300px;flex:none;border-right:1px solid var(--hair);height:100vh;background:#fff;display:flex;flex-direction:column}
#stagebar{display:flex;gap:3px;flex-wrap:wrap;padding:12px 12px 8px;border-bottom:1px solid var(--hair);flex:none}
#stagebar button{flex:1 1 22%;border:1px solid var(--hair);background:#fff;border-radius:7px;padding:7px 4px;cursor:pointer;
font-family:var(--ui);font-size:12px;font-weight:600;color:var(--sub)}
#stagebar button.on{background:var(--ink);color:#fff;border-color:var(--ink)}
#filter{flex:none;padding:8px 12px;border-bottom:1px solid var(--hair)}
#filter input{width:100%;border:1px solid var(--hair);border-radius:6px;padding:6px 9px;font-family:var(--ui);font-size:12px}
#list{overflow:auto;flex:1}
.stephead{position:sticky;top:0;background:#fff;font-size:11px;font-weight:700;letter-spacing:.5px;color:var(--sub);
padding:11px 14px 5px;border-bottom:1px solid var(--hair);text-transform:uppercase;z-index:2}
.pt{display:block;width:100%;text-align:left;border:0;background:none;padding:6px 14px;cursor:pointer;
font-family:var(--jp);font-size:14px;color:var(--ink);border-left:3px solid transparent}
.pt small{display:block;font-family:var(--ui);font-size:10.5px;color:var(--sub)}
.pt .k{float:right;font-family:var(--ui);font-size:9px;letter-spacing:.4px;color:#B9BAB6;padding-top:3px}
.pt:hover{background:#FAFAF8}.pt.on{background:#FBEDEA;border-left-color:var(--shu)}
#main{flex:1;display:flex;flex-direction:column;align-items:center;padding:22px 20px 40px;overflow:auto;height:100vh}
#card{background:var(--sheet);border:1px solid var(--hair);border-radius:12px;max-width:640px;width:100%;
padding:26px 30px 18px;min-height:430px;display:flex;flex-direction:column}
.kicker{font-size:11px;font-weight:700;letter-spacing:.7px;color:var(--sub);margin-bottom:10px}
.kicker.red{color:var(--shu)}.kicker.ok{color:var(--ok)}
h2{font-family:var(--jp);font-size:25px;margin:0 0 2px}h2+.en{color:var(--sub);font-size:13px;margin-bottom:18px}
p.body{font-size:15px;line-height:1.78;margin:0 0 14px}
.jpbox{border-left:3px solid var(--hair);padding:2px 0 2px 14px;margin:14px 0}
.jpbox .l{font-family:var(--jp);font-size:20px;line-height:1.85}.jpbox .g{font-size:13px;color:var(--sub)}
.hl{color:var(--shu);font-weight:600}
.wrbox{background:var(--noteBg);border:1px solid var(--note);border-radius:9px;padding:12px 14px;margin:12px 0;
font-size:14px;line-height:1.7;color:#3d3216}
.seg{display:flex;gap:12px;align-items:baseline;padding:8px 12px;border:1px solid var(--hair);border-radius:6px;margin-bottom:7px;background:var(--sheet)}
.seg.target{border-color:#C7351B66;background:#FBEDEA}
.segjp{font-family:var(--jp);font-size:18px;flex-shrink:0}.segjp.tj{color:var(--shu);font-weight:600}
.tag{font-size:11px;font-weight:700;color:var(--shu);letter-spacing:.4px}
.covers{display:flex;flex-wrap:wrap;gap:5px;margin-top:10px}
.covers span{font-size:11px;background:#F2F1EC;border-radius:5px;padding:3px 7px;color:var(--sub)}
.q{border:1px solid var(--hair);border-radius:8px;padding:11px 13px;margin-bottom:9px}
.q .qq{font-family:var(--jp);font-size:15px;margin-bottom:4px}
.q .qa{font-size:12.5px;color:var(--ok);font-weight:600}
.q .qw{font-size:12.5px;color:var(--sub);margin-top:3px;line-height:1.6}
nav{margin-top:auto;display:flex;align-items:center;gap:10px;padding-top:16px;border-top:1px solid var(--hair)}
button.nav{border:1px solid var(--hair);background:#fff;border-radius:8px;padding:9px 17px;cursor:pointer;font-size:14px}
button.nav.primary{background:var(--ink);color:#fff;border-color:var(--ink)}
button.nav:disabled{opacity:0;pointer-events:none}
.dots{flex:1;display:flex;justify-content:center;gap:6px;flex-wrap:wrap}
.dot{width:8px;height:8px;border-radius:99px;border:0;background:var(--hair);cursor:pointer;padding:0}
.dot.on{background:var(--ink)}
#meta{max-width:640px;width:100%;margin-top:14px;font-size:12px;color:var(--sub);line-height:1.6}
#meta b{color:var(--ink)}
.banner{max-width:640px;width:100%;background:#EEF2F7;border:1px solid #C9D6E4;color:#24405e;
border-radius:9px;padding:11px 14px;font-size:12.5px;line-height:1.6;margin-bottom:16px}
#rv{max-width:640px;width:100%;margin-top:10px;background:none;border:0;color:#B9BAB6;font-size:11px;
text-align:right;cursor:pointer;font-family:var(--ui);letter-spacing:.3px}
#rv:hover{color:var(--sub)}
kbd{background:#fff;border:1px solid var(--hair);border-bottom-width:2px;border-radius:4px;padding:1px 5px;font-size:11px}
</style></head><body>
<div id="side">
  <div id="stagebar"></div>
  <div id="filter"><input id="q" placeholder="filter lessons…" autocomplete="off"></div>
  <div id="list"></div>
</div>
<div id="main">
 <div class="banner"><b>Shape preview.</b> Every lesson in the curriculum, rendered from
 <code>grammar-module.jsx</code>. Not the app — nothing here is built, deployed or connected to Netlify.
 <kbd>←</kbd> <kbd>→</kbd> page · <kbd>r</kbd> reviewer notes</div>
 <div id="card"></div>
 <button id="rv" onclick="toggleMeta()">reviewer notes</button>
 <div id="meta"></div>
</div>
<script>
const D = __DATA__;
let li = 0, pi = 0, showMeta = false, stage = null, filter = "";
const esc = s => (s||"").replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
function hl(t,p){ t=esc(t); if(!p) return t; const i=t.indexOf(esc(p));
  return i<0?t:t.slice(0,i)+'<span class="hl">'+esc(p)+'</span>'+t.slice(i+esc(p).length); }
function jpbox(jp,en,p){ return '<div class="jpbox"><div class="l">'+hl(jp,p)+'</div><div class="g">'+esc(en)+'</div></div>'; }
function paras(t){ return (t||"").split("\n\n").map(x=>'<p class="body">'+esc(x)+'</p>').join(''); }

function pages(L){
  if(L.kind==='culture')  return [{k:'culture'}].concat(L.ex.length?[{k:'ex'}]:[]);
  if(L.kind==='review')   return [{k:'review'}].concat(L.drill.length?[{k:'drill'}]:[]);
  if(L.kind==='build')    return [{k:'build'}];
  const out=[]; if(L.setting) out.push({k:'setting'});
  out.push({k:'idea'});
  if(L.seg.length) out.push({k:'apart'});
  if(L.ex.length>1) out.push({k:'again'});
  L.ext.forEach((e,i)=>out.push({k:'ext',i}));
  if(L.exp.watch||L.orphanWr.length) out.push({k:'watch'});
  out.push({k:'try'});
  return out;
}
function render(){
  const L=D.lessons[li], P=pages(L); if(pi>=P.length) pi=P.length-1; const pg=P[pi];
  let h='<h2>'+esc(L.jp)+'</h2><div class="en">'+esc(L.en)+' &middot; '+esc(L.step)+'</div>';
  if(pg.k==='culture'){
    h+='<div class="kicker ok">CULTURE CONNECTION</div>'+paras(L.exp.prose||L.exp.what);
  } else if(pg.k==='ex'){
    h+='<div class="kicker">WHAT YOU\'LL HEAR</div>'+L.ex.map(e=>jpbox(e[0],e[1],null)).join('');
  } else if(pg.k==='review'){
    h+='<div class="kicker ok">CHECKPOINT</div>'+paras(L.exp.prose||L.exp.what);
    if(L.covers.length) h+='<div class="kicker">COVERS</div><div class="covers">'+L.covers.map(c=>'<span>'+esc(c)+'</span>').join('')+'</div>';
  } else if(pg.k==='drill'){
    h+='<div class="kicker">COMPREHENSION ITEMS</div>';
    if(L.drillNote) h+='<p class="body" style="font-size:13px;color:var(--sub)">'+esc(L.drillNote)+'</p>';
    h+=L.drill.map(d=>'<div class="q"><div class="qq">'+esc(d.q)+'</div>'
      +(d.en?'<div class="qw">'+esc(d.en)+'</div>':'')
      +'<div class="qa">→ '+esc((d.a||[]).join(' / '))+'</div>'
      +(d.why?'<div class="qw">'+esc(d.why)+'</div>':'')+'</div>').join('');
  } else if(pg.k==='build'){
    h+='<div class="kicker">COMPOSITION</div>';
    if(L.brief) h+='<div class="wrbox">'+esc(L.brief)+'</div>';
    h+=paras(L.exp.what)+paras(L.exp.build)+paras(L.exp.watch);
  } else if(pg.k==='setting'){
    h+='<div class="kicker">THE SITUATION</div><p class="body">'+esc(L.setting.scene)+'</p>'
      +jpbox(L.setting.jp,L.setting.en,L.setting.pattern);
  } else if(pg.k==='idea'){
    h+='<div class="kicker">THE IDEA</div>'+paras(L.exp.what||L.exp.prose);
    if(L.exp.when) h+='<div class="kicker">WHEN YOU\'D USE IT</div>'+paras(L.exp.when);
  } else if(pg.k==='apart'){
    h+='<div class="kicker">ONE SENTENCE, TAKEN APART</div>';
    if(L.ex[0]) h+='<div class="jpbox" style="border:0;padding-left:0"><div class="l" style="font-size:23px">'+esc(L.ex[0][0])+'</div><div class="g">'+esc(L.ex[0][1])+'</div></div>';
    h+=L.seg.map(t=>'<div class="seg'+(t[2]?' target':'')+'"><span class="segjp'+(t[2]?' tj':'')+'">'+esc(t[0])+'</span>'
      +'<span style="font-size:13px;color:var(--sub);line-height:1.6">'+(t[2]?'<span class="tag">THE POINT · </span>':'')+esc(t[1])+'</span></div>').join('');
    if(L.segNote) h+='<p class="body" style="font-size:13px;color:var(--sub);margin-top:12px">'+esc(L.segNote)+'</p>';
  } else if(pg.k==='again'){
    h+='<div class="kicker">HOW IT\'S BUILT — AND SIGHTED AGAIN</div>'+paras(L.exp.build);
    h+=L.ex.slice(1).map(e=>jpbox(e[0],e[1],null)).join('');
  } else if(pg.k==='ext'){
    const e=L.ext[pg.i];
    h+='<div class="kicker'+(e.kind==='flip'?'':' red')+'">'+(e.kind==='flip'?'NOW YOU SAY IT':'A WRINKLE')+'</div>';
    h+='<p class="body">'+esc(e.scene)+'</p>';
    if(e.t) h+='<div class="wrbox">'+esc(e.t)+'</div>';
    h+=jpbox(e.jp,e.en,null);
  } else if(pg.k==='watch'){
    h+='<div class="kicker red">WATCH OUT</div>'+paras(L.exp.watch);
    h+=L.orphanWr.map(t=>'<div class="wrbox">'+esc(t)+'</div>').join('');
  } else {
    h+='<div class="kicker">NOW IT\'S YOURS</div><p class="body">Seen it, taken it apart, seen its edges. In the app this hands off to the drill and free writing.</p>';
    if(L.drill.length) h+='<p class="body" style="font-size:13px;color:var(--sub)">'+L.drill.length+' drill items exist for this lesson.</p>';
  }
  h+='<nav><button class="nav" '+(pi?'':'disabled')+' onclick="go(-1)">← Back</button><div class="dots">'
   +P.map((p,i)=>'<button class="dot'+(i===pi?' on':'')+'" onclick="jump('+i+')" title="'+p.k+'"></button>').join('')
   +'</div><button class="nav primary" '+(pi<P.length-1?'':'disabled')+' onclick="go(1)">Next →</button></nav>';
  document.getElementById('card').innerHTML=h;
  document.getElementById('meta').innerHTML = showMeta
    ? '<b>'+esc(L.id)+'</b> · '+esc(L.kind)+' · '+P.length+' pages'+(L.setting?' · arc':' · no arc')
      +(L.ext.length?' · '+L.ext.length+' extension(s)':'')+(L.seg.length?' · seg':'')+(L.drill.length?' · '+L.drill.length+' drill items':'')
    : '';
  document.querySelectorAll('.pt').forEach(b=>b.classList.toggle('on', +b.dataset.i===li));
}
function go(d){ const P=pages(D.lessons[li]); pi=Math.max(0,Math.min(P.length-1,pi+d)); render(); }
function jump(i){ pi=i; render(); }
function pick(i){ li=i; pi=0; render(); document.getElementById('main').scrollTop=0; }
function toggleMeta(){ showMeta=!showMeta; document.getElementById('rv').textContent=showMeta?'hide reviewer notes':'reviewer notes'; render(); }
addEventListener('keydown',e=>{ if(e.target.tagName==='INPUT') return;
  if(e.key==='ArrowRight')go(1); if(e.key==='ArrowLeft')go(-1); if(e.key==='r'||e.key==='R')toggleMeta(); });

function buildList(){
  const f=filter.toLowerCase();
  let h='',cur=null,n=0;
  D.lessons.forEach((L,i)=>{
    if(L.stage!==stage) return;
    if(f && !(L.jp.toLowerCase().includes(f)||L.en.toLowerCase().includes(f)||L.id.includes(f)||L.step.toLowerCase().includes(f))) return;
    if(L.step!==cur){ cur=L.step; h+='<div class="stephead">'+esc(cur)+'</div>'; }
    const badge = L.kind==='culture'?'CC':L.kind==='skill'?'SB':L.kind==='review'?'CP':L.kind==='build'?'作文':'';
    h+='<button class="pt" data-i="'+i+'" onclick="pick('+i+')"><span class="k">'+badge+'</span>'
      +esc(L.jp)+'<small>'+esc(L.en)+'</small></button>'; n++;
  });
  document.getElementById('list').innerHTML = h || '<div class="stephead">no matches</div>';
  document.querySelectorAll('#stagebar button').forEach(b=>b.classList.toggle('on',b.dataset.s===stage));
  document.querySelectorAll('.pt').forEach(b=>b.classList.toggle('on', +b.dataset.i===li));
}
function setStage(s){ stage=s; buildList();
  const first=document.querySelector('.pt'); if(first) pick(+first.dataset.i); }
(function(){
  const counts={}, order=[];
  D.lessons.forEach(L=>{ if(!(L.stage in counts)){counts[L.stage]=0; order.push(L.stage);} counts[L.stage]++; });
  stage = order[0];
  document.getElementById('stagebar').innerHTML=order.map(s=>
    '<button data-s="'+s+'" onclick="setStage(\''+s+'\')">'+s+'<br><span style="font-weight:400;font-size:10px">'+counts[s]+'</span></button>').join('');
  document.getElementById('q').addEventListener('input',e=>{ filter=e.target.value; buildList(); });
  buildList(); render();
})();
</script></body></html>"""

out = ROOT / "lesson-arc-preview.html"
out.write_text(HTML.replace("__DATA__", DATA), encoding="utf-8")
by_stage = {}
for l in lessons: by_stage[l["stage"]] = by_stage.get(l["stage"], 0) + 1
arced = sum(1 for l in lessons if l["setting"])
order = sorted(by_stage, key=lambda k: (len(k), k))
print(f"wrote {out.name}  ({out.stat().st_size // 1024} KB, zero network requests)")
print(f"  {len(lessons)} lessons across {len(steps)} steps")
print("  " + "  ".join(f"{k}:{by_stage[k]}" for k in order))
print(f"  {arced} carry an arc; the rest render in their own shape rather than vanishing")
