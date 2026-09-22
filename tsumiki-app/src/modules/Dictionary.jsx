// GENERATED from dictionary-module.jsx by build-vite-app.py — do not hand-edit.
// Edit the source module and re-run. The single-file artifact stays the
// source of truth so the reviewer's grading path keeps working.
import { useCallback, useEffect, useRef, useState } from "react";
import { installStorage } from "../lib/storage.js";
import { T } from "../lib/tokens.js";
import { loadJSON, saveJSON } from "../lib/json.js";
installStorage();

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
      // An EXACT kana entry is a strong signal romaji was meant — `taberu` is
      // not an English word. A prefix-only hit is not, so English keeps the top
      // slot and the kana results follow it rather than displacing them.
      const exact = jp.list.some((x) => formsOf(x).includes(conv.kana));
      const merged = exact ? [...jp.list, ...en.list] : [...en.list, ...jp.list];
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
  return (
    <div style={{
      font: `600 0.6875rem ${T.uiFont}`, letterSpacing: ".6px", color: T.sub, margin: "0 0 8px",
    }}>{children}</div>
  );
}

function PreviewRow({ p, top, onOpen }) {
  return (
    <button onClick={() => onOpen(p[0])} style={{
      display: "flex", alignItems: "baseline", gap: 10, width: "100%", textAlign: "left",
      padding: "10px 12px", marginBottom: 6, cursor: "pointer",
      background: T.sheet, borderRadius: 8,
      border: `1px solid ${top ? T.ink : T.hairline}`,
      borderLeft: `3px solid ${top ? T.ink : T.hairline}`,
    }}>
      <span style={{ font: `1.25rem ${T.jpFont}`, color: T.ink, flexShrink: 0 }}>{p[1]}</span>
      {p[2] && <span style={{ font: `0.875rem ${T.jpFont}`, color: T.sub, flexShrink: 0 }}>{p[2]}</span>}
      <span style={{ font: `0.8125rem ${T.uiFont}`, color: T.sub, flex: 1, minWidth: 0 }}>{p[3]}</span>
      {top && (
        <span style={{
          font: `600 0.625rem ${T.uiFont}`, letterSpacing: ".5px", color: T.ink,
          border: `1px solid ${T.ink}`, borderRadius: 999, padding: "1px 7px", flexShrink: 0,
        }}>MOST COMMON</span>
      )}
    </button>
  );
}

// ————— the entry —————
function Entry({ id, onBack, onKanji, myWords, onSend, onUnsend }) {
  const [e, setE] = useState(null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    let alive = true;
    setE(null); setErr(false);
    shard("f", String(id)).then((x) => { if (alive) { x ? setE(x) : setErr(true); } }).catch(() => alive && setErr(true));
    return () => { alive = false; };
  }, [id]);

  if (err) return <p style={{ color: T.sub, font: `0.875rem ${T.uiFont}` }}>That entry could not be loaded.</p>;
  if (!e) return <p style={{ color: T.sub, font: `0.875rem ${T.uiFont}` }}>Loading…</p>;

  // Common spellings first; the rest are real but rarer, so they step back.
  const writ = [...e.k].sort((a, b) => b[1] - a[1]);
  const read = [...e.r].sort((a, b) => b[1] - a[1]);
  const head = writ.length ? writ[0][0] : read[0][0];
  const reading = read[0][0];
  const kanjiIn = [...new Set([...head].filter((c) => KANJI.test(c) && c !== "々"))];
  const mine = myWords.some((w) => w.w === head);

  return (
    <div>
      {onBack && (
        <button onClick={onBack} style={{
          background: "none", border: "none", cursor: "pointer", padding: "4px 0", marginBottom: 10,
          font: `0.8125rem ${T.uiFont}`, color: T.sub,
        }}>← Results</button>
      )}
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
        <span style={{ font: `2.25rem ${T.jpFont}`, color: T.ink }}>{head}</span>
        {head !== reading && <span style={{ font: `1.125rem ${T.jpFont}`, color: T.sub }}>{reading}</span>}
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
          <div key={i} style={i === 0 ? {
            background: T.paper, border: `1px solid ${T.hairline}`, borderLeft: `3px solid ${T.ink}`,
            borderRadius: 8, padding: "12px 14px", marginBottom: 12,
          } : { padding: "8px 2px", borderBottom: `1px solid ${T.hairline}` }}>
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
      <div style={{ marginTop: 18, padding: "14px 16px", border: `1px solid ${T.hairline}`, borderRadius: 10, background: T.sheet }}>
        {mine ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ font: `600 0.875rem ${T.uiFont}`, color: T.ink }}>In your words ✓</span>
            <span style={{ font: `0.8125rem ${T.uiFont}`, color: T.sub, flex: 1 }}>Waiting in Vocabulary.</span>
            <button onClick={() => onUnsend(head)} style={{
              background: "none", border: `1px solid ${T.hairline}`, borderRadius: 6, cursor: "pointer",
              padding: "6px 12px", font: `0.8125rem ${T.uiFont}`, color: T.sub,
            }}>Remove</button>
          </div>
        ) : (
          <>
            <button onClick={() => onSend({ w: head, r: reading, m: e.s[0][1][0], id: e.i })} style={{
              font: `600 0.875rem ${T.uiFont}`, background: T.ink, color: T.paper,
              border: `1px solid ${T.ink}`, borderRadius: 6, padding: "10px 18px", cursor: "pointer",
            }}>Send to Vocabulary</button>
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
              <button key={c} onClick={() => onKanji(c)} style={{
                font: `1.5rem ${T.jpFont}`, color: T.ink, background: T.sheet, cursor: "pointer",
                border: `1px solid ${T.hairline}`, borderRadius: 8, width: 52, height: 52,
              }}>{c}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ————— a kanji —————
function KanjiCard({ ch, info, onOpen, compact }) {
  if (!info) return null;
  return (
    <div style={{
      border: `1px solid ${T.hairline}`, borderRadius: 10, background: T.sheet,
      padding: "14px 16px", marginBottom: 16,
    }}>
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
  const onScreen = (request && request.onScreen) || [];
  const inputRef = useRef(null);
  const seq = useRef(0);

  useEffect(() => {
    loadMeta().then(setMeta).catch(() => setMissing(true));
    loadJSON(MY_WORDS_KEY, []).then((v) => setMyWords(Array.isArray(v) ? v : []));
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
    setOpen(null);
    shard("k", ch).then((info) => setKanjiView({ ch, info }));
  };

  const drawer = mode === "drawer";
  const body = (
    <>
      {drawer && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ font: `600 1rem ${T.uiFont}`, color: T.ink }}>Dictionary <span style={{ fontFamily: T.jpFont, color: T.sub, fontWeight: 400 }}>じしょ</span></span>
          {onClose && (
            <button onClick={onClose} aria-label="Close dictionary" style={{
              background: "none", border: "none", cursor: "pointer", padding: 8,
              font: `1.125rem ${T.uiFont}`, color: T.sub, lineHeight: 1,
            }}>✕</button>
          )}
        </div>
      )}
      {!drawer && (
        <header style={{ marginBottom: 16 }}>
          <h1 style={{ font: `600 1.375rem ${T.uiFont}`, color: T.ink, margin: "0 0 4px" }}>Dictionary</h1>
          <p style={{ font: `0.875rem ${T.uiFont}`, color: T.sub, margin: 0 }}>
            Look up a word in Japanese or English. Keep the ones worth keeping.
          </p>
        </header>
      )}

      {request?.curated && !kanjiView && (!open || open === autoId) && <Curated c={request.curated} />}

      <label style={{ display: "block" }}>
        <span style={{ position: "absolute", left: -9999 }}>Search the dictionary</span>
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(null); setKanjiView(null); }}
          placeholder="食べる · たべる · taberu · eat"
          style={{
            width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: 8,
            border: `1px solid ${T.hairline}`, background: T.sheet, color: T.ink,
            font: `1.0625rem ${T.jpFont}`,
          }}
        />
      </label>

      <div style={{ marginTop: 16 }}>
        {missing ? (
          <p style={{ font: `0.875rem/1.6 ${T.uiFont}`, color: T.sub }}>
            The dictionary data isn’t available here — it ships with the full app.
          </p>
        ) : open ? (
          <Entry id={open} onBack={() => setOpen(null)} onKanji={openKanji}
                 myWords={myWords} onSend={onSend} onUnsend={onUnsend} />
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
                      font: `1.0625rem ${T.jpFont}`, color: T.ink, background: T.sheet,
                      border: `1px solid ${T.hairline}`, borderRadius: 999,
                      padding: "6px 14px", cursor: "pointer",
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

  if (drawer) return <div style={{ padding: "14px 16px 24px" }}>{body}</div>;
  return (
    <div style={{ background: T.paper, minHeight: "100%", padding: "22px 18px 60px" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>{body}</div>
    </div>
  );
}
