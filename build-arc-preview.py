#!/usr/bin/env python3
"""Build a SINGLE STANDALONE HTML preview of the lesson arcs.

This is a SHAPE PREVIEW, not the app. It renders the page sequence a lesson would have
under lesson-arc-design-v1.md so the structure can be judged before grammar-module.jsx is
touched. It does not modify the module, does not build the Vite app, and makes zero
network requests — everything is inlined, so the file opens from disk anywhere.

Data comes from lesson-arcs-v1.json plus the module itself: the four beats (what / build /
when / watch) and the wrinkle text are read out of grammar-module.jsx at build time, so
what you see is the module's real prose rather than a copy that could drift.
"""
import json, re, html, sys, pathlib

ROOT = pathlib.Path(__file__).parent
src = (ROOT / 'grammar-module.jsx').read_text(encoding='utf-8')
arcs = json.loads((ROOT / 'lesson-arcs-v1.json').read_text(encoding='utf-8'))

# ---- DEEP (for wrinkle text), brace-walked and comment-stripped -------------
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

# ---- the four beats + examples, per point ----------------------------------
def beats(pid):
    m = re.search(r'id: "%s", jp: "([^"]*)", en: "([^"]*)",(.{0,3000}?)(?=\n      \{\n        id:|\n    \],)'
                  % re.escape(pid), src, re.S)
    if not m: return None
    out = {'jp': m.group(1), 'en': m.group(2)}
    blk = m.group(3)
    for f in ('what', 'build', 'when', 'watch'):
        fm = re.search(r'%s: "(.*?)",\n' % f, blk, re.S)
        if fm: out[f] = fm.group(1).replace('\\"', '"').replace('\\n', ' ')
    exm = re.search(r'ex: \[(.*?)\],?\n', blk, re.S)
    out['ex'] = re.findall(r'\["([^"]+)", "((?:[^"\\]|\\.)*)"\]', exm.group(1)) if exm else []
    return out

steps, order = {}, []
for b in re.split(r'\n  \{\n    cat: "', src)[1:]:
    cat = b.split('"')[0]; order.append(cat)
    steps[cat] = [p for p, _, _ in re.findall(r'id: "([a-z0-9-]+)", jp: "([^"]*)", en: "([^"]*)"', b)]

lessons = []
for it in arcs['items']:
    pid = it['point']
    bt = beats(pid)
    if not bt:
        print(f"  ! no module beats for {pid}", file=sys.stderr); continue
    wr = (DEEP.get(pid) or {}).get('wr') or []
    exts = []
    for e in it['extensions']:
        t = e.get('t') if e['kind'] != 'wrinkle' else (wr[e['wr']].get('t') if e.get('wr') is not None and e['wr'] < len(wr) else None)
        exts.append({'kind': e['kind'], 'scene': e['scene'], 'jp': e['jp'], 'en': e['en'], 't': t})
    claimed = {e['wr'] for e in it['extensions'] if e['kind'] == 'wrinkle' and e.get('wr') is not None}
    lessons.append({
        'id': pid, 'step': it['step'], 'jp': bt['jp'], 'en': bt['en'],
        'setting': it['setting'], 'ext': exts,
        'what': bt.get('what', ''), 'build': bt.get('build', ''),
        'when': bt.get('when', ''), 'watch': bt.get('watch', ''),
        'ex': bt['ex'],
        'orphanWr': [w.get('t', '') for k, w in enumerate(wr) if k not in claimed],
        'flags': it['flags'], 'claims': it['claims'], 'sources': it['sources'],
    })

DATA = json.dumps({'steps': [c for c in order if any(l['step'] == c for l in lessons)],
                   'lessons': lessons}, ensure_ascii=False)

HTML = """<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Naoshi — lesson arc preview</title><style>
:root{--paper:#F7F6F2;--sheet:#FFF;--ink:#22252B;--sub:#6E7178;--hair:#E4E2DB;--shu:#C7351B;
--note:#907119;--noteBg:#FAF3E0;--ai:#3D5A80;
--jp:"Hiragino Mincho ProN","Yu Mincho","Noto Serif JP",serif;
--ui:-apple-system,BlinkMacSystemFont,"Segoe UI","Hiragino Sans","Noto Sans JP",sans-serif}
*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--ui);
display:flex;min-height:100vh}
#side{width:290px;flex:none;border-right:1px solid var(--hair);overflow:auto;height:100vh;background:#fff}
#side h1{font-size:13px;letter-spacing:.5px;margin:0;padding:16px 16px 6px;color:var(--sub)}
.stepname{font-size:11px;font-weight:700;letter-spacing:.6px;color:var(--sub);padding:14px 16px 4px;text-transform:uppercase}
.pt{display:block;width:100%;text-align:left;border:0;background:none;padding:7px 16px;cursor:pointer;
font-family:var(--jp);font-size:15px;color:var(--ink);border-left:3px solid transparent}
.pt small{display:block;font-family:var(--ui);font-size:11px;color:var(--sub)}
.pt:hover{background:#FAFAF8}.pt.on{background:#FBEDEA;border-left-color:var(--shu)}
#main{flex:1;display:flex;flex-direction:column;align-items:center;padding:26px 20px 40px;overflow:auto;height:100vh}
#card{background:var(--sheet);border:1px solid var(--hair);border-radius:12px;max-width:620px;width:100%;
padding:26px 30px 18px;min-height:430px;display:flex;flex-direction:column}
.kicker{font-size:11px;font-weight:700;letter-spacing:.7px;color:var(--sub);margin-bottom:10px}
.kicker.red{color:var(--shu)}
h2{font-family:var(--jp);font-size:25px;margin:0 0 2px}h2+.en{color:var(--sub);font-size:13px;margin-bottom:18px}
p.body{font-size:15px;line-height:1.78;margin:0 0 14px}
.jpbox{border-left:3px solid var(--hair);padding:2px 0 2px 14px;margin:14px 0}
.jpbox .l{font-family:var(--jp);font-size:20px;line-height:1.85}
.jpbox .g{font-size:13px;color:var(--sub)}
.hl{color:var(--shu);font-weight:600}
.wrbox{background:var(--noteBg);border:1px solid var(--note);border-radius:9px;padding:12px 14px;margin:12px 0;
font-size:14px;line-height:1.7;color:#3d3216}
.seg{display:flex;gap:12px;align-items:baseline;padding:7px 11px;border:1px solid var(--hair);border-radius:6px;margin-bottom:7px}
.tag{font-size:11px;font-weight:700;color:var(--shu);letter-spacing:.4px}
nav{margin-top:auto;display:flex;align-items:center;gap:10px;padding-top:16px;border-top:1px solid var(--hair)}
button.nav{border:1px solid var(--hair);background:#fff;border-radius:8px;padding:9px 17px;cursor:pointer;font-size:14px}
button.nav.primary{background:var(--ink);color:#fff;border-color:var(--ink)}
button.nav:disabled{opacity:0;pointer-events:none}
.dots{flex:1;display:flex;justify-content:center;gap:6px}
.dot{width:8px;height:8px;border-radius:99px;border:0;background:var(--hair);cursor:pointer;padding:0}
.dot.on{background:var(--ink)}
#meta{max-width:620px;width:100%;margin-top:14px;font-size:12px;color:var(--sub);line-height:1.6}
#meta b{color:var(--ink)}
.banner{max-width:620px;width:100%;background:#EEF2F7;border:1px solid #C9D6E4;color:#24405e;
border-radius:9px;padding:11px 14px;font-size:12.5px;line-height:1.6;margin-bottom:16px}
kbd{background:#fff;border:1px solid var(--hair);border-bottom-width:2px;border-radius:4px;padding:1px 5px;font-size:11px}
</style></head><body>
<div id="side"><h1>STAGE 1 · 112 LESSONS</h1><div id="list"></div></div>
<div id="main">
 <div class="banner"><b>Shape preview.</b> This renders the page sequence from
 <code>lesson-arcs-v1.json</code> plus the module's own prose. It is <b>not</b> the app —
 nothing here is built, deployed or connected to Netlify. Arrow keys <kbd>←</kbd> <kbd>→</kbd> page.</div>
 <div id="card"></div>
 <div id="meta"></div>
</div>
<script>
const D = __DATA__;
let li = 0, pi = 0;
const esc = s => (s||"").replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
function hl(t, p){ t = esc(t); if(!p) return t; const i = t.indexOf(esc(p));
  return i<0 ? t : t.slice(0,i)+'<span class="hl">'+esc(p)+'</span>'+t.slice(i+esc(p).length); }
function jpbox(jp, en, p){ return '<div class="jpbox"><div class="l">'+hl(jp,p)+'</div><div class="g">'+esc(en)+'</div></div>'; }

function pages(L){
  const out = [{k:'setting'},{k:'idea'},{k:'apart'}];
  if(L.ex.length>1) out.push({k:'again'});
  L.ext.forEach((e,i)=>out.push({k:'ext',i}));
  if(L.watch || L.orphanWr.length) out.push({k:'watch'});
  out.push({k:'try'});
  return out;
}
function render(){
  const L = D.lessons[li], P = pages(L); if(pi>=P.length) pi = P.length-1;
  const pg = P[pi]; let h = '';
  h += '<h2>'+esc(L.jp)+'</h2><div class="en">'+esc(L.en)+' &middot; '+esc(L.step)+'</div>';
  if(pg.k==='setting'){
    h += '<div class="kicker">THE SITUATION</div><p class="body">'+esc(L.setting.scene)+'</p>'
       + jpbox(L.setting.jp, L.setting.en, L.setting.pattern);
  } else if(pg.k==='idea'){
    h += '<div class="kicker">THE IDEA</div><p class="body">'+esc(L.what)+'</p>';
    if(L.when) h += '<div class="kicker">WHEN YOU\\'D USE IT</div><p class="body">'+esc(L.when)+'</p>';
  } else if(pg.k==='apart'){
    h += '<div class="kicker">ONE SENTENCE, TAKEN APART</div>';
    if(L.ex[0]) h += jpbox(L.ex[0][0], L.ex[0][1], null);
    h += '<p class="body" style="color:var(--sub);font-size:13px">The live module breaks this into per-word cards from <code>DEEP.seg</code>; the preview shows the sentence whole.</p>';
  } else if(pg.k==='again'){
    h += '<div class="kicker">HOW IT\\'S BUILT — AND SIGHTED AGAIN</div>';
    if(L.build) h += '<p class="body">'+esc(L.build)+'</p>';
    L.ex.slice(1).forEach(e => h += jpbox(e[0], e[1], null));
  } else if(pg.k==='ext'){
    const e = L.ext[pg.i];
    const label = e.kind==='flip' ? 'NOW YOU SAY IT' : 'A WRINKLE';
    h += '<div class="kicker'+(e.kind==='flip'?'':' red')+'">'+label+'</div>';
    h += '<p class="body">'+esc(e.scene)+'</p>';
    if(e.t) h += '<div class="wrbox">'+esc(e.t)+'</div>';
    h += jpbox(e.jp, e.en, null);
    h += '<div class="seg"><span class="tag">'+e.kind.toUpperCase()+'</span><span style="font-size:12px;color:var(--sub)">'
       + (e.kind==='flip' ? 'The learner\\'s side, different object — this is what replaces the abstract “when”.'
          : e.kind==='wrinkle' ? 'Text above comes from the module\\'s own DEEP wrinkle, not from the arcs file.'
          : 'A wrinkle the module did not have; the arc supplies its text.')+'</span></div>';
  } else if(pg.k==='watch'){
    h += '<div class="kicker red">WATCH OUT</div><p class="body">'+esc(L.watch)+'</p>';
    L.orphanWr.forEach(t => h += '<div class="wrbox">'+esc(t)+'</div>');
  } else {
    h += '<div class="kicker">NOW IT\\'S YOURS</div><p class="body">You\\'ve seen it, seen it taken apart, and seen its edges. In the app this hands off to the drill and free writing.</p>';
  }
  h += '<nav><button class="nav" '+(pi?'':'disabled')+' onclick="go(-1)">← Back</button><div class="dots">'
     + P.map((p,i)=>'<button class="dot'+(i===pi?' on':'')+'" onclick="jump('+i+')" title="'+p.k+'"></button>').join('')
     + '</div><button class="nav primary" '+(pi<P.length-1?'':'disabled')+' onclick="go(1)">Next →</button></nav>';
  document.getElementById('card').innerHTML = h;
  document.getElementById('meta').innerHTML =
    '<b>'+esc(L.id)+'</b> — '+P.length+' pages · '+L.ext.length+' extension(s)'
    + (L.flags.length ? '<br><b>flags:</b> '+L.flags.map(esc).join(' · ') : '')
    + (L.claims.length ? '<br><b>claims:</b> '+L.claims.map(esc).join(' · ') : '')
    + (L.sources.length ? '<br><b>sources:</b> '+L.sources.length : '');
  document.querySelectorAll('.pt').forEach((b,i)=>b.classList.toggle('on', i===li));
}
function go(d){ const P=pages(D.lessons[li]); pi=Math.max(0,Math.min(P.length-1,pi+d)); render(); }
function jump(i){ pi=i; render(); }
function pick(i){ li=i; pi=0; render(); document.getElementById('main').scrollTop=0; }
addEventListener('keydown', e => { if(e.key==='ArrowRight') go(1); if(e.key==='ArrowLeft') go(-1); });
(function(){ let h='', cur=null;
  D.lessons.forEach((L,i)=>{ if(L.step!==cur){ cur=L.step; h+='<div class="stepname">'+esc(cur)+'</div>'; }
    h += '<button class="pt" onclick="pick('+i+')">'+esc(L.jp)+'<small>'+esc(L.en)+'</small></button>'; });
  document.getElementById('list').innerHTML=h; })();
render();
</script></body></html>"""

out = ROOT / 'lesson-arc-preview.html'
out.write_text(HTML.replace('__DATA__', DATA), encoding='utf-8')
print(f"wrote {out.name}  ({out.stat().st_size//1024} KB, {len(lessons)} lessons, zero network requests)")
