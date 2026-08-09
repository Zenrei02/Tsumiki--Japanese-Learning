// Smoke test — opens a lesson in each module and clicks every sub-view.
//
// WHY IT EXISTS. The earlier render test only MOUNTED the app and checked the
// nav bar. It passed while two views were white-screening, because it never
// entered them. Every crash Lloyd reported came from the deduplication refactor
// and every one was invisible to a check that stops at the front door:
//
//   STROKES        not imported after the table moved to a registry
//   LOG_PTS        stripped from modules but not exported from the engine
//   useMemo        engine's React import hardcoded, engine used a fourth hook
//   TRACE_N        hand-maintained dependency list drifting from real usage
//   TRACE_STAGES   multi-line declaration cut mid-object, leaving a stray brace
//
// A build check catches none of these. They are runtime ReferenceErrors, and a
// white screen is what a learner sees.
//
// RUN:  node test/smoke.mjs        (needs a bundle at /tmp/test-bundle.js —
//                                   see the build step in the README)
// Exits nonzero if any view renders under 200 characters.

import { JSDOM } from "jsdom";
import fs from "fs";
async function go(modId, lessonMatch, tabs) {
  const errors=[];
  const dom=new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>',
    {runScripts:"outside-only",pretendToBeVisual:true,url:"http://localhost/"});
  const w=dom.window;
  w.HTMLCanvasElement.prototype.getContext=()=>new Proxy({
    canvas:{width:300,height:300}, lineCap:"", lineJoin:"", lineWidth:1,
    strokeStyle:"", fillStyle:"", globalAlpha:1, font:"",
    measureText:()=>({width:0}), getImageData:()=>({data:[]}),
    createLinearGradient:()=>({addColorStop(){}}),
  }, { get:(t,k)=> (k in t ? t[k] : ()=>{}) , set:(t,k,v)=>{t[k]=v;return true;} });
  w.AudioContext=function(){return{decodeAudioData:async()=>({}),createBufferSource:()=>({connect(){},start(){}}),destination:{},currentTime:0};};
  w.fetch=()=>Promise.resolve({ok:false,status:404});
  w.console.error=(...a)=>{const s=a.join(" ");if(!/Not implemented|jsdom|Could not parse CSS/i.test(s))errors.push(s);};
  w.console.warn=()=>{};
  w.addEventListener("error",e=>errors.push("UNCAUGHT: "+(e.error?.message||e.message)));
  w.localStorage.setItem("known-kanji-v1",JSON.stringify(["日","一","二","三","十"]));
  w.localStorage.setItem("naoshi-last-module",modId);
  w.eval(fs.readFileSync("/tmp/test-bundle.js","utf8"));
  await new Promise(r=>setTimeout(r,2200));
  const d=w.document;
  const lesson=[...d.querySelectorAll("button")].find(b=>lessonMatch.test(b.textContent||""));
  console.log(`\n${modId.toUpperCase()} — opening ${JSON.stringify((lesson?.textContent||"").trim().slice(0,44))}`);
  lesson?.click(); await new Promise(r=>setTimeout(r,800));
  const avail=[...d.querySelectorAll("button")].map(b=>(b.textContent||"").trim());
  console.log("  tabs available:", avail.filter(t=>t.length<14&&t.length>1).join(" | "));
  for (const tab of tabs) {
    const b=[...d.querySelectorAll("button")].find(x=>(x.textContent||"").trim()===tab);
    if (!b) { console.log(`  "${tab}" — not present`); continue; }
    b.click(); await new Promise(r=>setTimeout(r,900));
    const t=(d.getElementById("root")?.textContent||"").trim();
    const broke = t.length<200;
    console.log(`  "${tab}" → ${t.length} chars ${broke?"❌ WHITE SCREEN":"ok"}`);
    if (broke) globalThis.__smokeFailed = true;
    if (errors.length) { console.log("     errors:", errors.slice(0,2)); errors.length=0; }
  }
}
await go("kanji", /KJLines/, ["Learn","Write","Recall","Use it"]);
await go("hiragana", /Main Vowel Series/, ["Learn","Trace","Drill","Listen","Assemble"]);

// fail the run if any view collapsed
if (globalThis.__smokeFailed) process.exitCode = 1;
