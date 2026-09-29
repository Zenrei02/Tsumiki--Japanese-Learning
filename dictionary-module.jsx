import { useState, useEffect, useRef, useCallback } from "react";

// ————— Dictionary module (Session 34) —————
// dictionary-drawer-design-v1.md, option B: JMdict and KANJIDIC2 as static
// shards built by build-dict-data.py into tsumiki-app/public/dict/. Nothing here
// calls the API and nothing here is authored Japanese — every word, reading and
// gloss comes from EDRDG's data, which is why the credit line sits at the foot
// of every screen this module draws (the licence asks for exactly that).
//
// ONE MODULE, TWO SHAPES. As a page it is a section like any other. As a drawer
// it is how the REST of the app looks words up: a module that wants a word
// explained fires `tsumiki:lookup` (see lookUp() in grammar, kanji and checker),
// and the shell opens this in a panel from the right with the request. When no
// shell is listening — a standalone artifact — lookUp() reports false and the
// caller keeps its own popup. Nothing here imports anything from the app.
//
// THE MOST COMMON INTERPRETATION. Results are ordered by build-dict-data.py's
// rank (see RANK in its docstring: the everyday-vocabulary list first, newspaper
// frequency only as a tiebreak). The top result is marked MOST COMMON, and in an
// entry the first sense is — JMdict orders senses by how often they are meant,
// so that highlight is the data's claim, not a guess made here.
//
// WHAT THIS DOES NOT SHOW, DELIBERATELY:
//   · JLPT levels. No authoritative vocabulary-level list exists
//     (tokenizer-options-breakdown.md); a level chip would be an invented claim.
//     KANJIDIC2's jlpt field is the pre-2010 four-level test and is not shown.
//   · Counts. "Words with 験" is a list that ends, not a number.
//
// OPENED FROM THE HANDLE, the drawer leads with the words that are on the
// learner's screen right now — the shell collects them from data-lookup marks
// and passes them in. Search stays at the top either way.
//
// SEARCH TAKES ROMAJI TOO (Session 35). `taberu` is converted to たべる and
// searched as kana, and the conversion is shown so the learner reads back what
// their typing meant. INPUT ONLY — nothing here ever displays romaji; see the
// Romaji input section below for why that distinction is the whole of it.

// ————— Design tokens (shared across modules) —————
const T = {
  paper: "#F7F6F2",
  sheet: "#FFFFFF",
  ink: "#22252B",
  sub: "#6E7178",
  hairline: "#E4E2DB",
  shu: "#C7351B",
  note: "#907119",   // darkened ochre — white/dark-on-ochre was 3.2:1 at #B08A1F (Session 4 fix, propagated Session 9)
  noteBg: "#FAF3E0",
  ai: "#3D5A80",
  ok: "#3E7C4F",
  okBg: "#EDF5EE",   // the completion splash's seal (Session 33); already in vocabulary-module.jsx at this value
  jpFont: '"Hiragino Mincho ProN","Yu Mincho","Noto Serif JP",serif',
  uiFont: '-apple-system,BlinkMacSystemFont,"Segoe UI","Hiragino Sans","Noto Sans JP",sans-serif',
};

async function loadJSON(key, fallback) {
  try { const r = await window.storage.get(key); return r ? JSON.parse(r.value) : fallback; }
  catch { return fallback; }
}
async function saveJSON(key, v) {
  try { await window.storage.set(key, JSON.stringify(v)); }
  catch (e) { console.error("save failed: " + key, e); }
}

// Words the learner chose to keep. OWNED HERE — this module is the only writer.
// The vocabulary module reads it and schedules the words like any other; its own
// progress for them lives in its own key. One writer per key, so the two never
// race to save the same object.
const MY_WORDS_KEY = "tsumiki-my-words-v1";

const FALLBACK_CREDIT =
  "Dictionary data: JMdict and KANJIDIC2, © Electronic Dictionary Research and Development Group, CC BY-SA 4.0";
const LICENCE_URL = "https://www.edrdg.org/edrdg/licence.html";

// ————— Data access —————
// Buckets are FNV-1a over UTF-16 code units — build-dict-data.py hashes the
// same way, and the two are checked against each other in its test.
const DICT_BASE = "/dict";
let META = null;
const SHARDS = new Map();
function fnv(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h >>> 0;
}
const hira = (s) => (s || "").replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
async function loadMeta() {
  if (META) return META;
  const r = await fetch(`${DICT_BASE}/meta.json`);
  if (!r.ok) throw new Error("no dictionary data");
  META = await r.json();
  return META;
}
async function shard(kind, key) {
  const m = await loadMeta();
  const url = `${DICT_BASE}/${kind}/${String(fnv(key) % m.buckets[kind]).padStart(3, "0")}.json`;
  if (!SHARDS.has(url)) SHARDS.set(url, fetch(url).then((r) => (r.ok ? r.json() : {})).catch(() => ({})));
  return (await SHARDS.get(url))[key];
}
// A preview is [id, headword, reading, gloss, rank(, form)] — see build-dict-data.py.
const formsOf = (p) => [hira(p[1]), hira(p[2] || p[1]), p[5]].filter(Boolean);

const JP = /[぀-ヿ㐀-鿿々〆]/;
const KANJI = /[㐀-鿿々]/;
const STOP = new Set(["a", "an", "the", "to", "of", "be", "is", "in", "on", "for"]);

// ————— Romaji input (Session 35) —————
// A learner who cannot yet read kana cannot reach the dictionary at all, and
// being unable to look a word up is where people stop (Lloyd, Session 35).
// So the search box takes wāpuro romaji — the same keystrokes an IME takes —
// converts it to kana, and searches that.
//
// THIS DOES NOT BREAK THE NO-ROMAJI RULE, and the distinction is the one
// input-romaji-layer-spec-v1.md already draws: "the banned thing is
// transliteration, not translation". dictionary-drawer-design-v1.md says the
// drawer must not SHOW romaji. It doesn't. Romaji goes in; kana and kanji come
// back. Every use of it is also a kana lesson, which is the opposite of a leak.
//
// Covered by test-romaji-search.py, which slices this section out at run time.
const RK = {
  kya:"きゃ", kyu:"きゅ", kyo:"きょ", kye:"きぇ",
  gya:"ぎゃ", gyu:"ぎゅ", gyo:"ぎょ",
  sha:"しゃ", shu:"しゅ", sho:"しょ", she:"しぇ",
  sya:"しゃ", syu:"しゅ", syo:"しょ",
  cha:"ちゃ", chu:"ちゅ", cho:"ちょ", che:"ちぇ",
  tya:"ちゃ", tyu:"ちゅ", tyo:"ちょ",
  jya:"じゃ", jyu:"じゅ", jyo:"じょ",
  zya:"じゃ", zyu:"じゅ", zyo:"じょ",
  nya:"にゃ", nyu:"にゅ", nyo:"にょ",
  hya:"ひゃ", hyu:"ひゅ", hyo:"ひょ",
  bya:"びゃ", byu:"びゅ", byo:"びょ",
  pya:"ぴゃ", pyu:"ぴゅ", pyo:"ぴょ",
  mya:"みゃ", myu:"みゅ", myo:"みょ",
  rya:"りゃ", ryu:"りゅ", ryo:"りょ",
  dya:"ぢゃ", dyu:"ぢゅ", dyo:"ぢょ",
  shi:"し", chi:"ち", tsu:"つ",
  thi:"てぃ", dhi:"でぃ", tsa:"つぁ", tse:"つぇ", tso:"つぉ",
  xtu:"っ", ltu:"っ",
  ka:"か", ki:"き", ku:"く", ke:"け", ko:"こ",
  ga:"が", gi:"ぎ", gu:"ぐ", ge:"げ", go:"ご",
  sa:"さ", si:"し", su:"す", se:"せ", so:"そ",
  za:"ざ", ji:"じ", zi:"じ", zu:"ず", ze:"ぜ", zo:"ぞ",
  ta:"た", ti:"ち", tu:"つ", te:"て", to:"と",
  da:"だ", di:"ぢ", du:"づ", de:"で", do:"ど",
  na:"な", ni:"に", nu:"ぬ", ne:"ね", no:"の",
  ha:"は", hi:"ひ", hu:"ふ", fu:"ふ", he:"へ", ho:"ほ",
  ba:"ば", bi:"び", bu:"ぶ", be:"べ", bo:"ぼ",
  pa:"ぱ", pi:"ぴ", pu:"ぷ", pe:"ぺ", po:"ぽ",
  ma:"ま", mi:"み", mu:"む", me:"め", mo:"も",
  ya:"や", yu:"ゆ", yo:"よ",
  ra:"ら", ri:"り", ru:"る", re:"れ", ro:"ろ",
  wa:"わ", wo:"を", wi:"ゐ", we:"ゑ",
  fa:"ふぁ", fi:"ふぃ", fe:"ふぇ", fo:"ふぉ",
  va:"ゔぁ", vi:"ゔぃ", vu:"ゔ", ve:"ゔぇ", vo:"ゔぉ",
  // (no nn: entry — `nn` is decided by the ん lookahead above, never the table)
  xa:"ぁ", xi:"ぃ", xu:"ぅ", xe:"ぇ", xo:"ぉ",
  la:"ぁ", li:"ぃ", lu:"ぅ", le:"ぇ", lo:"ぉ",
  a:"あ", i:"い", u:"う", e:"え", o:"お", "-":"ー",
};
const R_VOWEL = "aiueo";
const R_DOUBLE = /[bcdfghjkmpqrstvwyz]/;

function romajiToKana(input) {
  const s = (input || "").toLowerCase()
    .replace(/[āâ]/g, "aa").replace(/[īî]/g, "ii").replace(/[ūû]/g, "uu")
    .replace(/[ēê]/g, "ee").replace(/[ōô]/g, "ou");
  let out = "", i = 0;
  while (i < s.length) {
    const c = s[i], nx = s[i + 1];
    // ん, which needs the only lookahead in here. Bare n takes ん before a
    // consonant and at the end, but stays open before a vowel or y so that
    // `nya` is にゃ and `hona` is ほな.
    //
    // `nn` IS NOT SIMPLY ん. Whether the second n belongs to ん or starts the
    // next mora depends on what follows IT: in `konnichiwa` the second n opens
    // に, so ん takes one character and leaves it; in `nn` and `honn` there is
    // no mora to open, so ん takes both. Consuming both unconditionally turns
    // こんにちわ into こんいちわ, which is what test-romaji-search.py caught.
    if (c === "n") {
      if (nx === "'") { out += "ん"; i += 2; continue; }
      if (nx === "n") {
        const after = s[i + 2];
        out += "ん";
        i += (after && (R_VOWEL.includes(after) || after === "y")) ? 1 : 2;
        continue;
      }
      if (!nx) { out += "ん"; i += 1; continue; }
      if (!R_VOWEL.includes(nx) && nx !== "y") { out += "ん"; i += 1; continue; }
    }
    // っ — a doubled consonant, as in kitte / gakkou.
    if (nx === c && R_DOUBLE.test(c)) { out += "っ"; i += 1; continue; }
    let step = 0;
    for (const len of [3, 2, 1]) {
      const seg = s.slice(i, i + len);
      if (seg.length === len && RK[seg]) { out += RK[seg]; step = len; break; }
    }
    if (!step) break;   // not romaji from here on; the caller decides what that means
    i += step;
  }
  return { kana: out, rest: s.slice(i) };
}

// Was that romaji, or just English? English that does not decompose into morae
// stops the converter early and leaves a long tail ("strength" converts
// nothing at all). A half-typed mora leaves exactly one consonant, which is
// normal mid-keystroke and still worth searching as a prefix.
function romajiSearchable({ kana, rest }) {
  return kana.length > 0 && (rest === "" || (rest.length === 1 && !R_VOWEL.includes(rest)));
}

// ————— end romaji input —————

// A small deinflector, so a word lifted out of a sentence — 食べた, 行きます,
// 高くない — still finds its entry. It proposes dictionary forms and the caller
// keeps only those that match an entry EXACTLY, so a wrong proposal costs a
// lookup, never a wrong answer. Not a morphological analyser: that decision is
// still open in tokenizer-options-breakdown.md.
const DEINFLECT = [
  ["ませんでした", ["る"]], ["なかった", ["る", "う", "く", "す", "つ", "ぬ", "ぶ", "む", "ぐ"]],
  ["ました", ["る"]], ["ません", ["る"]], ["ます", ["る"]], ["ない", ["る"]], ["たい", ["る"]],
  ["られる", ["る"]], ["させる", ["る"]],
  ["きました", ["く"]], ["きます", ["く"]], ["ぎます", ["ぐ"]], ["します", ["す", "する"]],
  ["ちます", ["つ"]], ["にます", ["ぬ"]], ["びます", ["ぶ"]], ["みます", ["む"]],
  ["ります", ["る"]], ["います", ["う"]],
  ["いた", ["く"]], ["いて", ["く"]], ["いだ", ["ぐ"]], ["いで", ["ぐ"]],
  ["した", ["す", "する"]], ["して", ["す", "する"]],
  ["った", ["う", "つ", "る"]], ["って", ["う", "つ", "る"]],
  ["んだ", ["む", "ぶ", "ぬ"]], ["んで", ["む", "ぶ", "ぬ"]],
  ["かった", ["い"]], ["くない", ["い"]], ["くて", ["い"]], ["く", ["い"]],
  ["た", ["る"]], ["て", ["る"]],
];
function deinflect(q) {
  const out = [];
  for (const [end, reps] of DEINFLECT) {
    if (q.length > end.length && q.endsWith(end)) {
      for (const r of reps) out.push(q.slice(0, -end.length) + r);
    }
  }
  if (q === "した" || q === "して" || q === "します") out.push("する");
  return [...new Set(out)];
}

function rankSort(list, qn) {
  const seen = new Set();
  return list
    .filter((p) => (seen.has(p[0]) ? false : seen.add(p[0])))
    .sort((a, b) => {
      const ea = formsOf(a).includes(qn) ? 0 : 1, eb = formsOf(b).includes(qn) ? 0 : 1;
      return ea - eb || a[4] - b[4] || a[1].length - b[1].length;
    });
}

async function searchJP(q) {
  const qn = hira(q);
  const rows = (await shard("x", qn.slice(0, 2))) || [];
  const hits = rankSort(rows.filter((p) => formsOf(p).some((f) => f.startsWith(qn))), qn);
  if (hits.some((p) => formsOf(p).includes(qn))) return { list: hits, via: null };
  // No exact entry: try it as an inflected form before settling for prefixes.
  for (const cand of deinflect(qn)) {
    const r2 = (await shard("x", cand.slice(0, 2))) || [];
    const exact = rankSort(r2.filter((p) => formsOf(p).includes(cand)), cand);
    if (exact.length) return { list: [...exact, ...hits], via: { from: q, to: exact[0][1] } };
  }
  return { list: hits, via: null };
}

async function searchEN(q) {
  const toks = (q.toLowerCase().match(/[a-z][a-z'\-]+/g) || []);
  const tok = toks.find((t) => !STOP.has(t)) || toks[0];
  if (!tok) return { list: [], via: null };
  let rows = (await shard("e", tok)) || [];
  const phrase = toks.join(" ");
  if (toks.length > 1) {
    const tight = rows.filter((p) => p[3].toLowerCase().includes(phrase));
    if (tight.length) rows = [...tight, ...rows.filter((p) => !tight.includes(p))];
  }
  return { list: rows, via: null };
}

async function search(raw) {
  const q = raw.trim();
  if (!q) return { list: [], kanji: null, via: null, kana: null };
  let res, kana = null;
  if (JP.test(q)) {
    res = await searchJP(q);
  } else {
    // Latin input is BOTH an English query and possibly romaji, and which one
    // was meant is not knowable from the string: `sake` is an English word and
    // 酒. So run both and let the data decide the order.
    const en = await searchEN(q);
    const conv = romajiToKana(q);
    const jp = romajiSearchable(conv) ? await searchJP(conv.kana) : { list: [], via: null };
    if (jp.list.length) {
      kana = conv.kana;
      // WHICH READING LEADS. An EXACT kana entry is the first requirement — a
      // prefix-only hit is no evidence at all, so English keeps the top slot
      // and the kana results follow rather than displacing them.
      //
      // Exactness alone is not enough, and `go` is why (Session 38). It is an
      // English word AND valid romaji for ご, and ご has an exact entry — 五,
      // "five" — so 五 led and 行く, the answer to the question actually asked,
      // sat below it. Every English word that happens to decompose into morae
      // failed the same way: `name` → 嘗め "lick" over 名前, `water` → 私 over
      // 水, `rain` → ライン over 雨.
      //
      // So compare the two readings in the currency the data already speaks:
      // RANK (build-dict-data.py's everyday-vocabulary ordering). The kana
      // reading leads only when its best exact entry is at least as common as
      // the best English answer. That is deliberately the builder's number
      // rather than a fresh look at the glosses — the gloss-quality rule lives
      // in build-dict-data.py's norm(), and a second copy here would drift.
      //
      // ONE MORA IS THE WEAKEST SIGNAL THERE IS, so it must win outright, not
      // tie: ご alone fits a dozen homophones, and a two-letter Latin string is
      // far more often English. That is exactly the `go` tie (行く rank 5, 五
      // rank 5), and it is what keeps 五 below. It does NOT cost the particles,
      // which are rank 0 and so still win strictly — に, は, へ, わ and って
      // all still lead their English hits.
      //
      // What stays genuinely ambiguous: single-mora English words whose kana is
      // a common particle (`new` → ね, `now` → の). The string cannot settle
      // those and this does not pretend to.
      const exact = jp.list.some((x) => formsOf(x).includes(conv.kana));
      // Both lists are already ordered best-first — searchJP rankSorts and puts
      // exact matches ahead, searchEN trusts the builder's gloss-quality order
      // — so each head IS that side's best candidate.
      const enBest = en.list.length ? en.list[0][4] : Infinity;
      const jpBest = exact ? jp.list[0][4] : Infinity;
      const morae = conv.kana.replace(/[ゃゅょぁぃぅぇぉゎ]/g, "").length;
      const kanaLeads = exact && (morae > 1 ? jpBest <= enBest : jpBest < enBest);
      const merged = kanaLeads ? [...jp.list, ...en.list] : [...en.list, ...jp.list];
      const seen = new Set();
      res = { list: merged.filter((x) => (seen.has(x[0]) ? false : seen.add(x[0]))), via: jp.via };
    } else {
      res = en;
    }
  }
  const chars = [...q];
  const kanji = chars.length === 1 && KANJI.test(q) ? await shard("k", q) : null;
  return { ...res, list: res.list.slice(0, 40), kanji, kana };
}

// ————— small pieces —————
const kunDisplay = (k) => (k.includes(".") ? k.replace(".", "（") + "）" : k).replace(/-/g, "〜");

function Credit({ credit }) {
  return (
    <p style={{
      font: `0.6875rem/1.5 ${T.uiFont}`, color: T.sub, margin: "26px 0 0",
      paddingTop: 12, borderTop: `1px solid ${T.hairline}`,
    }}>
      {credit || FALLBACK_CREDIT}.{" "}
      <a href={LICENCE_URL} target="_blank" rel="noreferrer" style={{ color: T.sub }}>Licence</a>
    </p>
  );
}

function Label({ children }) {
  return <div className="ts-label" style={{ margin: "0 0 8px", color: "#4A463D" }}>{children}</div>;
}

function PreviewRow({ p, top, onOpen }) {
  return (
    // Tatami rework (board 10): a washi word row; the most common reading
    // carries the dictionary's 鈍 edge.
    <button onClick={() => onOpen(p[0])} className="ts-word" style={{
      alignItems: "baseline", marginBottom: 6, background: "#FBF7EE",
      boxShadow: top ? "inset 0 0 0 1.5px #D9CFB8, inset 4px 0 0 #727171" : "inset 0 0 0 1.5px #D9CFB8",
    }}>
      <span style={{ font: `1.25rem ${T.jpFont}`, color: T.ink, flexShrink: 0 }}>{p[1]}</span>
      {p[2] && <span style={{ font: `0.875rem ${T.jpFont}`, color: T.sub, flexShrink: 0 }}>{p[2]}</span>}
      <span style={{ font: `0.8125rem ${T.uiFont}`, color: T.sub, flex: 1, minWidth: 0 }}>{p[3]}</span>
      {top && (
        <span style={{
          font: `700 0.625rem ${T.uiFont}`, letterSpacing: ".5px", color: "#2C2A26",
          background: "#E4DBC6", borderRadius: 999, padding: "2px 8px", flexShrink: 0,
        }}>MOST COMMON</span>
      )}
    </button>
  );
}

// ————— ShellSlot (tatami rework) —————
// Stand-alone this renders its children where they are. Inside the app,
// build-vite-app.py swaps it for lib/shell.jsx, which puts them in the shell's
// slot of that name — the index tabs under the header, the header's かな/漢字
// toggle — so every section's chrome is built once. Identical in every module.
function ShellSlot({ name, children }) { return <>{children}</>; }

// ————— recent lookups (board 10's Recent tab) —————
// Every entry the learner actually opens, newest first, 40 kept. Stored with the
// learner's other data (storage.js KEYS) so it follows them between devices.
const RECENT_KEY = "tsumiki-dict-recent-v1";
const RECENT_MAX = 40;

// ————— hearing a word —————
// There are no recordings for dictionary words, so this is the browser's own
// Japanese voice, reading the KANA — a reading, never a guess from kanji. Only
// offered where the browser has speech synthesis at all.
const CAN_SAY = typeof window !== "undefined" && "speechSynthesis" in window;
function sayJP(text) {
  try {
    const s = window.speechSynthesis;
    s.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ja-JP"; u.rate = 0.9;
    const v = s.getVoices().find((x) => /^ja/i.test(x.lang));
    if (v) u.voice = v;
    s.speak(u);
  } catch (e) { /* no voice, no sound — the button is a convenience */ }
}

// ————— draw a kanji (board 10) —————
// The learner draws; the drawing is compared stroke by stroke, in order, with
// KanjiVG's strokes for the 2,136 jōyō kanji, and the closest characters are
// offered. Order-aware on purpose: tsumiki teaches stroke order, and a matcher
// that ignored it would reward the habit the kanji module exists to fix.
//
// The table (build-draw-strokes.py) is fetched only when the pad opens — 760 KB
// gzipped is fine for someone who asked to draw, and wrong for everyone who
// did not. Everything is in 109×109 KanjiVG units, normalised to the drawing's
// own bounding box so a small or off-centre character still matches.
const DRAW_URL = "/draw/strokes-joyo-v1.json";
const DRAW_N = 16;
let DRAW_TABLE = null;
const DRAW_REFS = new Map();
async function loadDrawTable() {
  if (!DRAW_TABLE) {
    const r = await fetch(DRAW_URL);
    if (!r.ok) throw new Error("draw-missing");
    DRAW_TABLE = (await r.json()).strokes;
  }
  return DRAW_TABLE;
}
let _drawSvg = null;
function pathPoints(d, n) {
  if (!_drawSvg) {
    const ns = "http://www.w3.org/2000/svg";
    _drawSvg = document.createElementNS(ns, "svg");
    _drawSvg.setAttribute("style", "position:absolute;width:0;height:0;visibility:hidden");
    _drawSvg.appendChild(document.createElementNS(ns, "path"));
    document.body.appendChild(_drawSvg);
  }
  const p = _drawSvg.firstChild;
  p.setAttribute("d", d);
  const len = p.getTotalLength ? p.getTotalLength() : 0;
  const out = [];
  for (let i = 0; i < n; i++) {
    const pt = p.getPointAtLength((len * i) / (n - 1));
    out.push([pt.x, pt.y]);
  }
  return out;
}
function resamplePts(pts, n) {
  if (pts.length < 2) return Array.from({ length: n }, () => pts[0] || [0, 0]);
  const acc = [0];
  for (let i = 1; i < pts.length; i++) acc.push(acc[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const total = acc[acc.length - 1] || 1;
  const out = []; let j = 0;
  for (let k = 0; k < n; k++) {
    const t = (total * k) / (n - 1);
    while (j < acc.length - 2 && acc[j + 1] < t) j++;
    const seg = acc[j + 1] - acc[j] || 1, f = (t - acc[j]) / seg;
    out.push([pts[j][0] + (pts[j + 1][0] - pts[j][0]) * f, pts[j][1] + (pts[j + 1][1] - pts[j][1]) * f]);
  }
  return out;
}
function normalise(strokes) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const s of strokes) for (const [x, y] of s) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  const size = Math.max(x1 - x0, y1 - y0, 1e-6), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  return strokes.map((s) => s.map(([x, y]) => [(x - cx) / size, (y - cy) / size]));
}
function refStrokes(ch, paths) {
  if (!DRAW_REFS.has(ch)) DRAW_REFS.set(ch, normalise(paths.map((d) => pathPoints(d, DRAW_N))));
  return DRAW_REFS.get(ch);
}
function recognise(table, drawn) {
  const n = drawn.length;
  if (!n) return [];
  const mine = normalise(drawn.map((s) => resamplePts(s, DRAW_N)));
  const scored = [];
  for (const [ch, paths] of Object.entries(table)) {
    if (Math.abs(paths.length - n) > 1) continue;
    const ref = refStrokes(ch, paths);
    const k = Math.min(n, ref.length);
    let sum = 0;
    for (let i = 0; i < k; i++) {
      let d = 0;
      for (let p = 0; p < DRAW_N; p++) d += Math.hypot(mine[i][p][0] - ref[i][p][0], mine[i][p][1] - ref[i][p][1]);
      sum += d / DRAW_N;
    }
    scored.push([ch, sum / k + 0.12 * Math.abs(ref.length - n)]);
  }
  return scored.sort((a, b) => a[1] - b[1]).slice(0, 10).map(([ch]) => ch);
}

function DrawPad({ onPick, onClose }) {
  const SIZE = 240;
  const [strokes, setStrokes] = useState([]);   // in 109-box units
  const [cands, setCands] = useState([]);
  const [state, setState] = useState("loading"); // loading | ready | missing
  const table = useRef(null);
  const cv = useRef(null);
  const live = useRef(null);

  useEffect(() => {
    let alive = true;
    loadDrawTable().then((t) => { if (alive) { table.current = t; setState("ready"); } })
      .catch(() => alive && setState("missing"));
    return () => { alive = false; };
  }, []);

  const redraw = () => {
    const c = cv.current; if (!c) return;
    const g = c.getContext("2d"), dpr = window.devicePixelRatio || 1;
    if (c.width !== SIZE * dpr) { c.width = SIZE * dpr; c.height = SIZE * dpr; }
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.fillStyle = "#FFFDF7"; g.fillRect(0, 0, SIZE, SIZE);
    g.strokeStyle = "#E4DBC6"; g.lineWidth = 1; g.setLineDash([4, 4]);
    g.beginPath(); g.moveTo(SIZE / 2, 0); g.lineTo(SIZE / 2, SIZE); g.moveTo(0, SIZE / 2); g.lineTo(SIZE, SIZE / 2); g.stroke();
    g.setLineDash([]);
    const sc = SIZE / 109;
    const line = (pts, col) => {
      if (pts.length < 2) return;
      g.strokeStyle = col; g.lineWidth = 9; g.lineCap = "round"; g.lineJoin = "round";
      g.beginPath(); g.moveTo(pts[0][0] * sc, pts[0][1] * sc);
      for (const [x, y] of pts.slice(1)) g.lineTo(x * sc, y * sc);
      g.stroke();
    };
    strokes.forEach((s) => line(s, "#2C2A26"));
    if (live.current) line(live.current, T.shu);
  };
  useEffect(redraw, [strokes]);
  useEffect(() => {
    if (state !== "ready") return;
    // Off the pointer path: matching ~450 characters takes a moment the first
    // time (their strokes are sampled once and kept).
    const t = setTimeout(() => setCands(recognise(table.current, strokes)), 30);
    return () => clearTimeout(t);
  }, [strokes, state]);

  const at = (e) => {
    const r = cv.current.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * 109, ((e.clientY - r.top) / r.height) * 109];
  };
  const down = (e) => { e.currentTarget.setPointerCapture?.(e.pointerId); live.current = [at(e)]; redraw(); };
  const move = (e) => { if (!live.current) return; live.current.push(at(e)); redraw(); };
  const up = () => {
    const s = live.current; live.current = null;
    if (s && s.length > 1) setStrokes((x) => [...x, s]); else redraw();
  };

  return (
    <div className="ts-card" style={{ padding: "14px 16px", margin: "12px 0 0", display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
      <div style={{ alignSelf: "stretch", display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
        <span className="ts-label">DRAW A KANJI</span>
        <span style={{ font: `0.75rem ${T.uiFont}`, color: "#4A463D" }}>Stroke order counts.</span>
      </div>
      <canvas ref={cv} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
              aria-label="Drawing pad — draw one kanji"
              style={{ width: SIZE, height: SIZE, maxWidth: "100%", borderRadius: 12, touchAction: "none",
                       boxShadow: "inset 0 0 0 1.5px #D9CFB8, 0 0 0 1.5px #D9CFB8", background: "#FFFDF7", cursor: "crosshair" }} />
      {state === "missing" && (
        <p style={{ font: `0.8125rem ${T.uiFont}`, color: "#4A463D", margin: 0 }}>
          Drawing needs the stroke data that ships with the full app.
        </p>
      )}
      {state === "ready" && strokes.length > 0 && (
        <div aria-label="Closest kanji" style={{ alignSelf: "stretch", display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 8 }}>
          {cands.map((c) => (
            <button key={c} className="ts-tile" onClick={() => onPick(c)} aria-label={`Search for ${c}`}>{c}</button>
          ))}
        </div>
      )}
      {state === "ready" && !strokes.length && (
        <p style={{ font: `0.8125rem ${T.uiFont}`, color: "#4A463D", margin: 0 }}>
          Draw one character; the closest matches appear as you go. Tap one to search for it.
        </p>
      )}
      <div style={{ alignSelf: "stretch", display: "flex", gap: 10 }}>
        <button className="ts-btn ts-btn-wood" style={{ flex: 1, minHeight: 44 }} disabled={!strokes.length}
                onClick={() => setStrokes((x) => x.slice(0, -1))}>Undo</button>
        <button className="ts-btn ts-btn-washi" style={{ flex: 1 }} disabled={!strokes.length}
                onClick={() => setStrokes([])}>Clear</button>
        <button className="ts-btn ts-btn-washi" style={{ flex: 1 }} onClick={onClose}>Close</button>
      </div>
      <p style={{ alignSelf: "stretch", font: `0.6875rem ${T.uiFont}`, color: "#6E6A60", margin: 0 }}>
        Stroke data: KanjiVG (Ulrich Apel), CC BY-SA 3.0.
      </p>
    </div>
  );
}

// ————— the entry —————
function Entry({ id, onBack, onKanji, myWords, onSend, onUnsend, onSeen }) {
  const [e, setE] = useState(null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    let alive = true;
    setE(null); setErr(false);
    shard("f", String(id)).then((x) => { if (alive) { x ? setE(x) : setErr(true); } }).catch(() => alive && setErr(true));
    return () => { alive = false; };
  }, [id]);

  // Recent lookups: an entry counts once it has actually loaded.
  useEffect(() => {
    if (!e || !onSeen) return;
    const w = [...e.k].sort((a, b) => b[1] - a[1])[0]?.[0] || [...e.r].sort((a, b) => b[1] - a[1])[0][0];
    const r = [...e.r].sort((a, b) => b[1] - a[1])[0][0];
    onSeen({ id: e.i ?? id, w, r, m: e.s[0][1][0] });
  }, [e]);

  if (err) return <p style={{ color: T.sub, font: `0.875rem ${T.uiFont}` }}>That entry could not be loaded.</p>;
  if (!e) return <p style={{ color: T.sub, font: `0.875rem ${T.uiFont}` }}>Loading…</p>;

  // Common spellings first; the rest are real but rarer, so they step back.
  const writ = [...e.k].sort((a, b) => b[1] - a[1]);
  const read = [...e.r].sort((a, b) => b[1] - a[1]);
  const head = writ.length ? writ[0][0] : read[0][0];
  const reading = read[0][0];
  const kanjiIn = [...new Set([...head].filter((c) => KANJI.test(c) && c !== "々"))];
  const mine = myWords.some((w) => w.w === head);

  // Tatami rework (board 10): one washi entry card — the word in ruby, the
  // meaning, the kanji as chips, the Send button in wood.
  return (
    <div>
      {onBack && (
        <button onClick={onBack} className="ts-btn ts-btn-washi" style={{
          display: "inline-flex", minHeight: 38, fontSize: "0.8125rem", marginBottom: 12,
        }}>← Results</button>
      )}
      <div className="ts-card" style={{ padding: "16px 18px", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
        {head !== reading ? (
          <ruby style={{ font: `700 1.875rem ${T.jpFont}`, color: T.ink, rubyPosition: "over" }}>
            {head}<rt style={{ fontSize: ".5em", color: "#6E6A60", fontFamily: T.uiFont, fontWeight: 500 }}>{reading}</rt>
          </ruby>
        ) : (
          <span style={{ font: `700 1.875rem ${T.jpFont}`, color: T.ink }}>{head}</span>
        )}
      </div>
      {(writ.length > 1 || read.length > 1) && (
        <p style={{ font: `0.8125rem ${T.uiFont}`, color: T.sub, margin: "6px 0 0" }}>
          Also{" "}
          {[...writ.slice(1), ...read.slice(1)].map(([t, c], i) => (
            <span key={i} style={{ fontFamily: T.jpFont, color: c ? T.ink : T.sub, marginRight: 8 }}>{t}</span>
          ))}
        </p>
      )}

      <div style={{ marginTop: 18 }}>
        {e.s.map(([pos, gl, tags], i) => (
          <div key={i} className={i === 0 ? "ts-inset" : undefined} style={i === 0 ? {
            display: "block", marginBottom: 12,
          } : { padding: "8px 2px", borderBottom: "1px solid #E4DBC6" }}>
            {i === 0 && <Label>MOST COMMON MEANING</Label>}
            <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
              {i > 0 && <span style={{ font: `0.75rem ${T.uiFont}`, color: T.sub, minWidth: 14 }}>{i + 1}</span>}
              <span style={{
                font: i === 0 ? `600 1rem/1.5 ${T.uiFont}` : `0.9375rem/1.5 ${T.uiFont}`, color: T.ink,
              }}>{gl.join("; ")}</span>
            </div>
            {(pos.length > 0 || tags.length > 0) && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6, marginLeft: i > 0 ? 22 : 0 }}>
                {[...pos, ...tags].map((t, j) => (
                  <span key={j} style={{
                    font: `0.6875rem ${T.uiFont}`, color: T.sub, border: `1px solid ${T.hairline}`,
                    borderRadius: 999, padding: "1px 8px",
                  }}>{t}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Send to Vocabulary. It joins the review ladder there; practising it —
          not sending it — is what counts toward the week (Lloyd, Session 34:
          one tap must not be farmable). */}
      <div style={{ marginTop: 14 }}>
        {mine ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {CAN_SAY && (
              <button onClick={() => sayJP(reading)} className="ts-btn ts-btn-washi" aria-label={`Hear ${reading}`}
                      style={{ width: 44, padding: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 5L6 9H3v6h3l5 4z" /><path d="M15 9a4 4 0 010 6" /></svg>
              </button>
            )}
            <span style={{ font: `600 0.875rem ${T.uiFont}`, color: T.ink }}>In your words ✓</span>
            <span style={{ font: `0.8125rem ${T.uiFont}`, color: T.sub, flex: 1 }}>Waiting in Vocabulary.</span>
            <button onClick={() => onUnsend(head)} className="ts-btn ts-btn-washi"
                    style={{ minHeight: 38, fontSize: "0.8125rem" }}>Remove</button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", gap: 10 }}>
            {CAN_SAY && (
              <button onClick={() => sayJP(reading)} className="ts-btn ts-btn-washi" aria-label={`Hear ${reading}`}
                      style={{ width: 52, padding: 0, minHeight: 52 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 5L6 9H3v6h3l5 4z" /><path d="M15 9a4 4 0 010 6" /></svg>
              </button>
            )}
            <button onClick={() => onSend({ w: head, r: reading, m: e.s[0][1][0], id: e.i })}
                    className="ts-btn ts-btn-wood" style={{ flex: 1 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
              Send to Vocabulary
            </button>
            </div>
            <p style={{ font: `0.8125rem/1.6 ${T.uiFont}`, color: T.sub, margin: "8px 0 0" }}>
              It joins your reviews there. Practise five words of your own in a week
              and the week is kept, even on fewer study days.
            </p>
          </>
        )}
      </div>

      {kanjiIn.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <Label>THE KANJI IN IT</Label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {kanjiIn.map((c) => (
              <button key={c} onClick={() => onKanji(c)} aria-label={`The kanji ${c}`} style={{
                font: `1.25rem ${T.jpFont}`, color: T.ink, background: "#E4DBC6", cursor: "pointer",
                border: 0, borderRadius: 999, minWidth: 48, minHeight: 44, padding: "0 14px",
              }}>{c}</button>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

// ————— a kanji —————
function KanjiCard({ ch, info, onOpen, compact }) {
  if (!info) return null;
  return (
    <div className="ts-card" style={{ padding: "14px 16px", marginBottom: 16 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <span style={{ font: `3rem/1 ${T.jpFont}`, color: T.ink }}>{ch}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          {info.m && <div style={{ font: `600 0.9375rem ${T.uiFont}`, color: T.ink }}>{info.m.slice(0, 4).join("; ")}</div>}
          {info.on && <div style={{ font: `0.875rem ${T.jpFont}`, color: T.sub, marginTop: 4 }}>音 {info.on.join("・")}</div>}
          {info.kun && <div style={{ font: `0.875rem ${T.jpFont}`, color: T.sub, marginTop: 2 }}>訓 {info.kun.map(kunDisplay).join("・")}</div>}
          {info.s && <div style={{ font: `0.75rem ${T.uiFont}`, color: T.sub, marginTop: 4 }}>{info.s} strokes</div>}
        </div>
      </div>
      {!compact && info.w && info.w.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <Label>WORDS WITH {ch}</Label>
          {info.w.map((p, i) => <PreviewRow key={p[0]} p={p} top={i === 0} onOpen={onOpen} />)}
        </div>
      )}
    </div>
  );
}

// ————— from your lessons —————
// The curated word a lesson handed over, shown ABOVE the dictionary and apart
// from it: this has been through the authoring pipeline and the reviewer's
// queue; what follows is a third-party dataset (design doc, "the rule this must
// not break").
function Curated({ c }) {
  return (
    <div style={{
      border: `1px solid ${T.hairline}`, borderRadius: 10, background: T.sheet,
      padding: "14px 16px", marginBottom: 16,
    }}>
      <Label>FROM YOUR LESSONS</Label>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
        <span style={{ font: `1.75rem ${T.jpFont}`, color: T.ink }}>{c.w}</span>
        {c.r && c.r !== c.w && <span style={{ font: `1rem ${T.jpFont}`, color: T.sub }}>{c.r}</span>}
      </div>
      {c.m && <div style={{ font: `0.9375rem ${T.uiFont}`, color: T.ink, marginTop: 4 }}>{c.m}</div>}
      {c.note && (
        <p style={{
          font: `0.8125rem/1.65 ${T.uiFont}`, color: T.ink, background: T.noteBg,
          border: `1px solid ${T.note}`, borderRadius: 8, padding: "10px 12px", margin: "12px 0 0",
        }}>{c.note}</p>
      )}
    </div>
  );
}

// ————— root —————
export default function DictionaryModule({ mode = "page", request = null, onClose = null }) {
  const [q, setQ] = useState(request?.q || "");
  const [res, setRes] = useState({ list: [], kanji: null, via: null, kana: null });
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(null);      // entry id
  const [kanjiView, setKanjiView] = useState(null); // { ch, info }
  const [meta, setMeta] = useState(null);
  const [missing, setMissing] = useState(false);
  const [myWords, setMyWords] = useState([]);
  const [flash, setFlash] = useState(null);
  const [autoId, setAutoId] = useState(null); // the entry a lesson's word opened
  const [tab, setTab] = useState("search");    // search | recent | kanji (page only)
  const [recent, setRecent] = useState([]);
  const [knownKanji, setKnownKanji] = useState([]);
  const [drawOpen, setDrawOpen] = useState(false);
  const onScreen = (request && request.onScreen) || [];
  const inputRef = useRef(null);
  const seq = useRef(0);

  useEffect(() => {
    loadMeta().then(setMeta).catch(() => setMissing(true));
    loadJSON(MY_WORDS_KEY, []).then((v) => setMyWords(Array.isArray(v) ? v : []));
    loadJSON(RECENT_KEY, []).then((v) => setRecent(Array.isArray(v) ? v : []));
    loadJSON("tsumiki-known-kanji-v1", []).then((v) => setKnownKanji(Array.isArray(v) ? v : []));
  }, []);
  const remember = useCallback((w) => {
    setRecent((prev) => {
      const next = [{ ...w, at: Date.now() }, ...prev.filter((x) => x.id !== w.id)].slice(0, RECENT_MAX);
      saveJSON(RECENT_KEY, next);
      return next;
    });
  }, []);

  const run = useCallback(async (text) => {
    const n = ++seq.current;
    if (!text.trim()) { setRes({ list: [], kanji: null, via: null, kana: null }); setBusy(false); return; }
    setBusy(true);
    try {
      const r = await search(text);
      if (n === seq.current) setRes(r);
    } catch { if (n === seq.current) setMissing(true); }
    if (n === seq.current) setBusy(false);
  }, []);

  // A new request from the shell (a tapped word, a kanji being studied) resets
  // the drawer to that request rather than stacking onto whatever was open.
  useEffect(() => {
    if (!request) return;
    setOpen(null); setKanjiView(null); setAutoId(null);
    setQ(request.q || "");
    if (request.kanji) {
      shard("k", request.kanji).then((info) => setKanjiView({ ch: request.kanji, info })).catch(() => setMissing(true));
      setRes({ list: [], kanji: null, via: null, kana: null });
    } else if (request.q) {
      run(request.q).then(() => {});
    } else {
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [request?.n]);

  // When a lesson hands over a word, open its entry straight away if the
  // dictionary has an exact match — the learner tapped a WORD, not a search.
  useEffect(() => {
    if (!request?.q || !request.curated || open) return;
    const top = res.list[0];
    if (top && formsOf(top).includes(hira(request.q))) { setOpen(top[0]); setAutoId(top[0]); }
  }, [res]);

  useEffect(() => {
    const t = setTimeout(() => run(q), 180);
    return () => clearTimeout(t);
  }, [q]);

  const persistWords = (next) => { setMyWords(next); saveJSON(MY_WORDS_KEY, next); };
  const onSend = (w) => {
    if (myWords.some((x) => x.w === w.w)) return;
    persistWords([{ ...w, at: Date.now() }, ...myWords]);
    setFlash(`${w.w} sent to Vocabulary`);
    setTimeout(() => setFlash(null), 2200);
  };
  const onUnsend = (w) => persistWords(myWords.filter((x) => x.w !== w));
  const openKanji = (ch) => {
    setOpen(null); setTab("search");
    shard("k", ch).then((info) => setKanjiView({ ch, info }));
  };
  const openEntry = (id) => { setTab("search"); setOpen(id); };

  const drawer = mode === "drawer";
  const body = (
    <>
      {drawer && (
        // Tatami rework (05): じしょ leads, as on the edge tab that opened it.
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ font: `700 1.25rem ${T.jpFont}`, color: T.ink }}>じしょ</span>
            <span style={{ font: `700 0.8125rem ${T.uiFont}`, color: "#4A463D" }}>Dictionary</span>
          </span>
          {onClose && (
            <button onClick={onClose} aria-label="Close dictionary" style={{
              background: "none", border: "none", cursor: "pointer", width: 40, height: 40,
              display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12, color: T.ink,
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          )}
        </div>
      )}
      {!drawer && (
        <header style={{ marginBottom: 12 }}>
          {/* The shell header already says じしょ Dictionary; the line stays. */}
          <p style={{ font: `0.875rem ${T.uiFont}`, color: "#4A463D", margin: 0 }}>
            Look up a word in Japanese or English. Keep the ones worth keeping.
          </p>
        </header>
      )}

      {request?.curated && !kanjiView && (!open || open === autoId) && <Curated c={request.curated} />}

      {!drawer && (
        <ShellSlot name="tabs">
          {/* Paper index tabs (board 10). */}
          <div className="ts-tabs" role="tablist" aria-label="Dictionary">
            {[["search", "Search"], ["recent", "Recent"], ["kanji", "Kanji"]].map(([id, label]) => (
              <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}>{label}</button>
            ))}
          </div>
        </ShellSlot>
      )}
      <div style={{ display: "flex", gap: 10 }}>
      <label style={{ display: "block", flex: 1, minWidth: 0 }}>
        <span style={{ position: "absolute", left: -9999 }}>Search the dictionary</span>
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(null); setKanjiView(null); }}
          placeholder="食べる · たべる · taberu · eat"
          style={{
            // Board 10: a 52px field in Shippori 18px; the drawer keeps 44.
            width: "100%", boxSizing: "border-box", minHeight: drawer ? 44 : 52, padding: "0 16px",
            borderRadius: drawer ? 12 : 14, border: 0,
            boxShadow: "inset 0 0 0 1.5px #D9CFB8, 0 2px 0 #CFC4A8", background: "#FFFDF7", color: T.ink,
            font: `${drawer ? "1.0625rem" : "1.125rem"} ${T.jpFont}`,
          }}
        />
      </label>
        <button onClick={() => setDrawOpen((o) => !o)} aria-pressed={drawOpen} aria-label="Search by drawing a kanji"
                className="ts-btn ts-btn-washi" style={{ width: drawer ? 44 : 52, minHeight: drawer ? 44 : 52, padding: 0, flexShrink: 0 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 20l4-1 11-11-3-3L5 16z" /><path d="M13 7l3 3" /></svg>
        </button>
      </div>
      {!drawer && (
        <p style={{ font: `0.75rem ${T.uiFont}`, color: "#4A463D", margin: "8px 0 0" }}>
          Japanese, romaji or English — <em>toshokan</em> works too.
        </p>
      )}
      {drawOpen && (
        <DrawPad onClose={() => setDrawOpen(false)}
                 onPick={(c) => { setQ((x) => x + c); setOpen(null); setKanjiView(null); setTab("search"); setDrawOpen(false); }} />
      )}

      <div style={{ marginTop: 16 }}>
        {!drawer && tab === "recent" ? (
          recent.length ? (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <Label>RECENT</Label>
                <button className="ts-btn ts-btn-washi" style={{ minHeight: 36, fontSize: "0.8125rem" }}
                        onClick={() => { setRecent([]); saveJSON(RECENT_KEY, []); }}>Clear</button>
              </div>
              {recent.map((w) => (
                <PreviewRow key={w.id} p={[w.id, w.w, w.r !== w.w ? w.r : "", w.m, 0]} onOpen={openEntry} />
              ))}
            </>
          ) : (
            <p style={{ font: `0.875rem/1.6 ${T.uiFont}`, color: "#4A463D" }}>
              Nothing yet. Every word you open is kept here, newest first.
            </p>
          )
        ) : !drawer && tab === "kanji" ? (
          knownKanji.length ? (
            <>
              <Label>YOUR KANJI</Label>
              <p style={{ font: `0.8125rem ${T.uiFont}`, color: "#4A463D", margin: "0 0 10px" }}>
                The ones you have made yours in Kanji. Tap one for its readings and the words it is in.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 10 }}>
                {knownKanji.map((c) => (
                  <button key={c} className="ts-tile done" style={{ "--ts-accent": "#5B4A7D" }}
                          onClick={() => openKanji(c)} aria-label={`The kanji ${c}`}>{c}</button>
                ))}
              </div>
            </>
          ) : (
            <p style={{ font: `0.875rem/1.6 ${T.uiFont}`, color: "#4A463D" }}>
              No kanji of your own yet — trace a character and pass Recall in Kanji and it
              appears here. Any kanji can still be looked up: search for it, or draw it.
            </p>
          )
        ) : missing ? (
          <p style={{ font: `0.875rem/1.6 ${T.uiFont}`, color: T.sub }}>
            The dictionary data isn’t available here — it ships with the full app.
          </p>
        ) : open ? (
          <Entry id={open} onBack={() => setOpen(null)} onKanji={openKanji}
                 myWords={myWords} onSend={onSend} onUnsend={onUnsend} onSeen={remember} />
        ) : kanjiView ? (
          <>
            {q && (
              <button onClick={() => setKanjiView(null)} style={{
                background: "none", border: "none", cursor: "pointer", padding: "4px 0", marginBottom: 10,
                font: `0.8125rem ${T.uiFont}`, color: T.sub,
              }}>← Results</button>
            )}
            <KanjiCard ch={kanjiView.ch} info={kanjiView.info} onOpen={setOpen} />
          </>
        ) : q.trim() ? (
          <>
            {res.kanji && <KanjiCard ch={q.trim()} info={res.kanji} onOpen={setOpen} compact={res.list.length > 0} />}
            {res.kana && (
              <p style={{ font: `0.8125rem ${T.uiFont}`, color: T.sub, margin: "0 0 10px" }}>
                Reading that as{" "}
                <span style={{ font: `1rem ${T.jpFont}`, color: T.ink }}>{res.kana}</span>
              </p>
            )}
            {res.via && (
              <p style={{ font: `0.8125rem ${T.uiFont}`, color: T.sub, margin: "0 0 10px" }}>
                <span style={{ fontFamily: T.jpFont }}>{res.via.from}</span> looks like a form of{" "}
                <span style={{ fontFamily: T.jpFont, color: T.ink }}>{res.via.to}</span>.
              </p>
            )}
            {res.list.map((p, i) => <PreviewRow key={p[0]} p={p} top={i === 0} onOpen={setOpen} />)}
            {res.kanji && res.list.length > 0 && (
              <button onClick={() => setKanjiView({ ch: q.trim(), info: res.kanji })} style={{
                background: "none", border: "none", cursor: "pointer", padding: "6px 0",
                font: `0.8125rem ${T.uiFont}`, color: T.sub,
              }}>Words with {q.trim()} →</button>
            )}
            {!busy && !res.list.length && !res.kanji && (
              <p style={{ font: `0.875rem/1.6 ${T.uiFont}`, color: T.sub }}>
                Not in this dictionary. It carries the common words — around thirty
                thousand — rather than every word ever recorded.
              </p>
            )}
          </>
        ) : (onScreen.length > 0 || myWords.length > 0) ? (
          <>
            {/* Opened from the handle rather than from a word: the first thing
                offered is what the learner is looking at (Lloyd, Session 34).
                Chips rather than rows — these are prompts to search, not
                results, and they must not be mistaken for dictionary entries. */}
            {onScreen.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <Label>ON THIS SCREEN</Label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {onScreen.map((w) => (
                    <button key={w} onClick={() => setQ(w)} style={{
                      font: `1.0625rem ${T.jpFont}`, color: T.ink, background: "#FBF7EE",
                      border: 0, boxShadow: "inset 0 0 0 1.5px #D9CFB8, 0 2px 0 #CFC4A8", borderRadius: 999,
                      minHeight: 40, padding: "0 14px", cursor: "pointer",
                    }}>{w}</button>
                  ))}
                </div>
              </div>
            )}
            {myWords.length > 0 && (
              <>
                <Label>YOUR WORDS</Label>
                {myWords.map((w) => (
                  <PreviewRow key={w.w} p={[w.id, w.w, w.r !== w.w ? w.r : "", w.m, 0]} onOpen={setOpen} />
                ))}
              </>
            )}
          </>
        ) : (
          <p style={{ font: `0.875rem/1.6 ${T.uiFont}`, color: T.sub }}>
            Type a word in kanji, kana, romaji or English — <span style={{ fontFamily: T.jpFont }}>たべる</span>,
            taberu and eat all reach the same entry. In the rest of the app, tap a
            word to land here with it already looked up.
          </p>
        )}
      </div>

      {flash && (
        <div role="status" style={{
          position: "fixed", left: "50%", transform: "translateX(-50%)", bottom: 28, zIndex: 60,
          background: T.ink, color: T.sheet, padding: "10px 18px", borderRadius: 999,
          font: `600 0.875rem ${T.uiFont}`, boxShadow: "0 4px 14px rgba(0,0,0,.18)",
        }}>{flash}</div>
      )}

      <Credit credit={meta?.attribution} />
    </>
  );

  if (drawer) return <div style={{ padding: "14px 14px 24px" }}>{body}</div>;
  return (
    <div style={{ background: T.paper, minHeight: "100%", padding: "22px 18px 60px" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>{body}</div>
    </div>
  );
}
