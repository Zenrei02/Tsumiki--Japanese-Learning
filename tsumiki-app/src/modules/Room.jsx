// GENERATED from room-module.jsx by build-vite-app.py — do not hand-edit.
// Edit the authoring module at the repo root and re-run.
import { useEffect, useMemo, useRef, useState } from "react";
import { installStorage } from "../lib/storage.js";
import { T } from "../lib/tokens.js";
import { loadJSON, saveJSON } from "../lib/json.js";
import { readKoban, kobanBalance, spendKoban } from "../lib/koban.js";
import { ShellSlot } from "../lib/shell.jsx";
installStorage();

/* ============================================================================
   room-module.jsx  —  v1
   tsumiki — the room (へや), the shop, and how you look in it.

   WHOLE-FILE DROP-IN. No required props. Default export. Authored at the repo
   root like every module; build-vite-app.py derives src/modules/Room.jsx from
   it and wires it in where Home's two room doors used to lead to "Still being
   built".

   SOURCES, IN THE ORDER THEY WIN:
     · Notion "🏠 Room, Garden & Avatar — design for the room/shop pass (v1)",
       Sep 10 2026 — §3 keys, §4 prices, §5 spots/avatar, §7 avatar bounds.
     · docs/design/reward-system-design-v1.md §5 — the room as a sink, the
       pulse, the first-open card, the no-guilt pet.
     · room-demo-v1.html — the art direction approved at Session 11:
       isometric 2.5D, tatami grid, shop/room split with an inventory, koban as
       an icon, Japanese item names only beside a pictured preview. The item
       drawings below are that file's, ported.

   LLOYD'S CALLS FOR THIS PASS (Oct 4 2026): Room v1 + economy, no auth, no
   garden yet · wallet in the room/shop only (R-1) · the §4 ladder (R-2) ·
   avatar seated at the study spot, quests pay koban only (R-4).

   THE RULES THIS FILE MUST NOT BREAK
     · Space is earned, contents are bought. The bigger home opens when your
       Japanese grows (CAPABILITY, read from the modules' own progress); koban
       pay for the move, they never unlock it. Spending never takes away
       anything you have.
     · No curriculum-horizon denominators. Never "12 of 30 items". The
       catalogue is browsed, not completed.
     · Nothing here gates anything else in the app. Nothing here pays koban.
     · The cat is always glad to see you. It naps, it sits by the thing you
       bought last, it holds a koban when you earned some while away. It never
       gets hungry and never sulks — that would be a streak wearing fur.
     · Item names are DRAFT Japanese, pending the reviewer (Notion §9: draft
       now, sign-off after B10). Do not treat CATALOG as reviewed.
   ========================================================================== */

/* ---------------------------------------------------------------------------
   1. STORAGE
   -------------------------------------------------------------------------*/

const OWNED_KEY = "tsumiki-room-owned-v1";      // { v, ids: { itemId: firstOwnedAt } } — union
const LAYOUT_KEY = "tsumiki-room-layout-v1";    // { v, t, home, placed, wall, anchor, style, last, introSeen }
const CHARACTER_KEY = "tsumiki-character-v1";   // { v, t, hair, top, bottom, acc }
// Read here, written by the modules that own them — the capability gate.
const HIRA_KEY = "tsumiki-hiragana-progress-v2";
const KATA_KEY = "tsumiki-katakana-progress-v1";
const WORDS_KEY = "tsumiki-known-words-v1";
// ⚠️ PER-DEVICE, RAW localStorage, NOT EXPORTED — on purpose. What this
// browser last saw in the room: the balance then, and the prices of what was
// not yet owned. Home reads it to decide whether the Room door pulses. It is a
// statement about one screen, like the ambience switch, and exporting it would
// make a second device think it had already seen a crossing it never showed.
const PULSE_KEY = "tsumiki-room-pulse-v1";





/* ---------------------------------------------------------------------------
   2. THE CATALOGUE — every item is a vocabulary item
   Prices: Notion §4 ladder. Placeholders, like every koban figure — and the
   tuning dial is §4.1: if learners run rich, ADD VARIANTS, never move bands.
     first item 12 · regular 45–80 · feature 150–200 · the move 350
     variants of something already owned 8–20
   kind: floor (placed on the grid) · wall (hung in a slot) · anchor (sits at
   the study spot) · style (a recolour; worn by the room, not placed).
   -------------------------------------------------------------------------*/

const CATALOG = [
  // first item — reachable on day one or two
  { id: "zataku",   jp: "座卓",   reading: "ざたく",     en: "low table — sits at your study spot", price: 12, kind: "anchor" },
  { id: "zabuton",  jp: "座布団", reading: "ざぶとん",   en: "floor cushion",        price: 12,  kind: "floor", w: 1, d: 1 },
  { id: "hachiue",  jp: "鉢植え", reading: "はちうえ",   en: "potted plant",         price: 12,  kind: "floor", w: 1, d: 1 },
  { id: "kakejiku", jp: "掛け軸", reading: "かけじく",   en: "hanging scroll",       price: 12,  kind: "wall", wall: "L", len: 1.2 },
  // regular — most furniture
  { id: "ikebana",  jp: "生け花", reading: "いけばな",   en: "flower arrangement",   price: 45,  kind: "floor", w: 1, d: 1 },
  { id: "chochin",  jp: "提灯",   reading: "ちょうちん", en: "paper lantern",        price: 50,  kind: "wall", wall: "R", len: 0.8 },
  { id: "noren",    jp: "暖簾",   reading: "のれん",     en: "doorway curtain",      price: 55,  kind: "wall", wall: "R", len: 2.2 },
  { id: "andon",    jp: "行灯",   reading: "あんどん",   en: "paper floor lamp",     price: 60,  kind: "floor", w: 1, d: 1 },
  { id: "hondana",  jp: "本棚",   reading: "ほんだな",   en: "bookshelf",            price: 70,  kind: "floor", w: 1, d: 2 },
  { id: "byobu",    jp: "屏風",   reading: "びょうぶ",   en: "folding screen",       price: 80,  kind: "floor", w: 1, d: 3 },
  // feature — about two weeks
  { id: "futon",    jp: "布団",   reading: "ふとん",     en: "bedding",              price: 150, kind: "floor", w: 2, d: 3 },
  { id: "bonsai",   jp: "盆栽",   reading: "ぼんさい",   en: "bonsai tree",          price: 160, kind: "floor", w: 1, d: 1 },
  { id: "kotatsu",  jp: "こたつ", reading: "こたつ",     en: "heated table — takes the study spot", price: 180, kind: "anchor" },
  { id: "toro",     jp: "灯籠",   reading: "とうろう",   en: "stone lantern",        price: 200, kind: "floor", w: 1, d: 1 },
  // variants — recolours of what the room already has (§4.1, the surplus valve)
  { id: "kabe-sakura",   jp: "桜色の壁",     reading: "さくらいろのかべ",   en: "cherry-pink walls",     price: 10, kind: "style", slot: "wall",    color: "#F1DEDC", edge: "#DCC3C0" },
  { id: "kabe-wakatake", jp: "若竹色の壁",   reading: "わかたけいろのかべ", en: "young-bamboo walls",    price: 10, kind: "style", slot: "wall",    color: "#DCE6D2", edge: "#C3D0B6" },
  { id: "kabe-ai",       jp: "藍色の壁",     reading: "あいいろのかべ",     en: "indigo walls",          price: 10, kind: "style", slot: "wall",    color: "#C9D2DF", edge: "#AEBACB" },
  { id: "tatami-ao",     jp: "青畳",         reading: "あおだたみ",         en: "fresh green tatami",    price: 12, kind: "style", slot: "tatami",  color: "#B5C08A", alt: "#A9B57D", line: "#7F8A55" },
  { id: "tatami-ryukyu", jp: "琉球畳",       reading: "りゅうきゅうだたみ", en: "square, borderless tatami", price: 15, kind: "style", slot: "tatami", color: "#C7BC8C", alt: "#BDB07C", line: null },
  { id: "kotatsu-kon",   jp: "紺のこたつ布団", reading: "こんのこたつぶとん", en: "navy kotatsu quilt",  price: 15, kind: "style", slot: "blanket", color: "#3D5A80", shade: "#304A6C", needs: "kotatsu" },
  { id: "kotatsu-aka",   jp: "赤のこたつ布団", reading: "あかのこたつぶとん", en: "red kotatsu quilt",   price: 15, kind: "style", slot: "blanket", color: "#B7503E", shade: "#9C4233", needs: "kotatsu" },
];
const BY_ID = Object.fromEntries(CATALOG.map((c) => [c.id, c]));

// The default look of each style slot — owned by everyone, costs nothing.
const STYLE_DEFAULT = {
  wall: { color: "#EFE7D6", edge: "#D8CDB8" },
  tatami: { color: "#B7B98A", alt: "#ADAF80", line: "#83855D" },
  blanket: { color: "#C96F4A", shade: "#B25E3C" },
};

/* ---------------------------------------------------------------------------
   3. HOMES — space is earned
   The first home is yours from the first visit. The next one opens when your
   Japanese grows — read from what the modules already record, never from
   lessons finished or koban earned — and moving costs the capstone price.
   Later homes (the engawa, the house) are not drawn yet and are not listed:
   a teaser of three more doors would be a denominator wearing a roof.
   -------------------------------------------------------------------------*/

const HOMES = [
  { id: "yojouhan", jp: "四畳半", reading: "よじょうはん", en: "a four-and-a-half-mat room", n: 6 },
  { id: "rokujou",  jp: "六畳",   reading: "ろくじょう",   en: "a six-mat room", n: 8, price: 350 },
];
const MOVE_WORDS = 40;   // practised words that also open the next home (placeholder)

const HIRAGANA = "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん";
const KATAKANA = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
function tracedIn(progress) {
  const s = new Set();
  for (const id of Object.keys(progress || {})) {
    if (id.startsWith("_")) continue;
    const p = progress[id];
    if (!p) continue;
    (Array.isArray(p.traced) ? p.traced : []).forEach((t) => s.add(String(t).split(":")[0]));
    (Array.isArray(p.walked) ? p.walked : []).forEach((c) => s.add(c));
  }
  return s;
}
async function readCapability() {
  const [h, k, w] = await Promise.all([loadJSON(HIRA_KEY, {}), loadJSON(KATA_KEY, {}), loadJSON(WORDS_KEY, {})]);
  const th = tracedIn(h), tk = tracedIn(k);
  const kana = [...HIRAGANA].every((c) => th.has(c)) && [...KATAKANA].every((c) => tk.has(c));
  const words = Object.entries(w || {}).filter(([id, p]) => !id.startsWith("_") && p && Array.isArray(p.written) && p.written.length > 0).length;
  return { kana, words, ready: kana || words >= MOVE_WORDS };
}

/* ---------------------------------------------------------------------------
   4. SPOTS — a data table, not code (Notion §5.1)
   Adding the zen garden is one entry here, plus its overlay. v1 ships the
   study spot only; `overlay` is where a mini-game would open.
   -------------------------------------------------------------------------*/

const SPOTS = [
  { id: "study", labelJa: "座卓", table: { gx: 1, gy: 1, w: 2, d: 2 }, seat: { gx: 1, gy: 3 }, avatarPose: "seiza", overlay: null },
];
const STUDY = SPOTS[0];

/* ---------------------------------------------------------------------------
   5. THE AVATAR, BOUNDED (Notion §7)
   Four swap slots, one pose, a fixed silhouette so the parts compose without
   art per combination. The first option in each slot is everyone's; the rest
   are variants at 8–15, the same surplus valve as the room's recolours.
   -------------------------------------------------------------------------*/

const AVATAR = {
  hair: [
    { id: "hair-short", jp: "短い髪",     en: "short, dark",  price: 0,  style: "short", color: "#2C2A26" },
    { id: "hair-long",  jp: "長い髪",     en: "long, dark",   price: 10, style: "long",  color: "#2C2A26" },
    { id: "hair-bun",   jp: "お団子",     en: "bun",          price: 10, style: "bun",   color: "#3B2A1C" },
    { id: "hair-chestnut", jp: "栗色の髪", en: "short, chestnut", price: 12, style: "short", color: "#7A4A2A" },
  ],
  top: [
    { id: "top-ai",     jp: "藍の羽織",   en: "indigo haori", price: 0,  color: "#3D5A80", shade: "#30496A" },
    { id: "top-matcha", jp: "抹茶色の服", en: "matcha top",   price: 8,  color: "#7C8F55", shade: "#657544" },
    { id: "top-sakura", jp: "桜色の服",   en: "cherry top",   price: 8,  color: "#D9A3A0", shade: "#C48A87" },
    { id: "top-yukata", jp: "浴衣",       en: "yukata",       price: 15, color: "#F3EFE6", shade: "#DAD3C3", pattern: true },
  ],
  bottom: [
    { id: "bottom-sumi",  jp: "墨色のズボン", en: "charcoal trousers", price: 0, color: "#4A463D" },
    { id: "bottom-hakama", jp: "袴",          en: "hakama",           price: 12, color: "#5B4A7D" },
    { id: "bottom-kinari", jp: "生成りのズボン", en: "undyed trousers", price: 8, color: "#D8CDB8" },
  ],
  acc: [
    { id: "acc-none",      jp: "なし",     en: "nothing",        price: 0 },
    { id: "acc-megane",    jp: "眼鏡",     en: "glasses",        price: 10 },
    { id: "acc-hachimaki", jp: "鉢巻き",   en: "headband",       price: 10 },
    { id: "acc-kanzashi",  jp: "簪",       en: "hairpin",        price: 12 },
  ],
};
const SLOT_NAMES = { hair: "Hair", top: "Top", bottom: "Bottom", acc: "Accessory" };
const AV_BY_ID = Object.fromEntries(Object.values(AVATAR).flat().map((o) => [o.id, o]));
const AV_DEFAULT = { hair: "hair-short", top: "top-ai", bottom: "bottom-sumi", acc: "acc-none" };

// Lloyd's first-open card, Session 11, warmed up at his request — the wording
// room-demo-v1.html shipped. The load-bearing part: the bigger home is
// promised for YOUR JAPANESE GROWING, not lessons or koban. Keep that in any
// copy edit (reward-system-design-v1.md §5).
const INTRO = [
  "Welcome home! This little room is all yours — fill it with whatever catches your eye in the shop.",
  "And as your Japanese grows, so will your home. You’ll be moving somewhere bigger before you know it.",
];

/* ---------------------------------------------------------------------------
   6. ISOMETRIC GEOMETRY + DRAWING (from room-demo-v1.html)
   -------------------------------------------------------------------------*/

const TW = 33, TH = 16.5, WALLH = 96, PAD = 22;
const S = "#4A4238";
function geom(n) {
  const OX = n * TW + PAD, OY = WALLH + PAD + 8;
  return { n, OX, OY, W: 2 * n * TW + 2 * PAD, H: OY + 2 * n * TH + PAD };
}
const isoAt = (G) => (gx, gy) => ({ x: G.OX + (gx - gy) * TW, y: G.OY + (gx + gy) * TH });
function pickTile(G, mx, my) {
  const a = (mx - G.OX) / TW, b = (my - G.OY) / TH;
  return { gx: Math.floor((a + b) / 2), gy: Math.floor((b - a) / 2) };
}
const pts = (arr) => arr.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
function poly(arr, fill, stroke, extra) {
  return `<polygon points="${pts(arr)}" fill="${fill}"` + (stroke ? ` stroke="${stroke}" stroke-width="1"` : "") + (extra || "") + "/>";
}
function isoBox(iso, gx, gy, w, d, h, lift, top, left, right, stroke) {
  const L = lift || 0;
  const c = [iso(gx, gy), iso(gx + w, gy), iso(gx + w, gy + d), iso(gx, gy + d)];
  const b = c.map((p) => ({ x: p.x, y: p.y - L }));
  const t = c.map((p) => ({ x: p.x, y: p.y - L - h }));
  return poly([t[0], t[1], t[2], t[3]], top, stroke) +
         poly([b[3], b[2], t[2], t[3]], left, stroke) +
         poly([b[2], b[1], t[1], t[2]], right, stroke);
}
function wallQuad(iso, wall, start, len, topLift, botLift) {
  const p0 = wall === "L" ? iso(0, start) : iso(start, 0);
  const p1 = wall === "L" ? iso(0, start + len) : iso(start + len, 0);
  return [{ x: p0.x, y: p0.y - botLift }, { x: p1.x, y: p1.y - botLift },
          { x: p1.x, y: p1.y - topLift }, { x: p0.x, y: p0.y - topLift }];
}
// Wall slots are derived from the wall's length, so a bigger home has more.
function wallSlots(n) { const out = []; for (let s = 0.6; s + 0.8 <= n - 0.3; s += 2.2) out.push(+s.toFixed(1)); return out; }
const fitsWall = (n, start, len) => start + len <= n - 0.2;

function kobanSVG(size) {
  const s = size || 15;
  return `<svg width="${s}" height="${Math.round(s * 1.3)}" viewBox="0 0 14 18" aria-label="koban" role="img" style="display:inline-block;vertical-align:-2px">` +
    `<ellipse cx="7" cy="9" rx="6" ry="8" fill="#E8C87A" stroke="#8B6B4A" stroke-width="1.2"/>` +
    `<line x1="3.2" y1="9" x2="10.8" y2="9" stroke="#B99A4F" stroke-width="1.2"/>` +
    `<ellipse cx="7" cy="9" rx="3.6" ry="5.2" fill="none" stroke="#B99A4F" stroke-width="0.9"/></svg>`;
}
function KobanIcon({ size = 13 }) {
  return (
    <svg width={size} height={Math.round(size * 1.3)} viewBox="0 0 14 18" aria-label="koban"
      style={{ display: "inline-block", verticalAlign: "-2px" }}>
      <ellipse cx="7" cy="9" rx="6" ry="8" fill="#E8C87A" stroke="#8B6B4A" strokeWidth="1.2" />
      <line x1="3.2" y1="9" x2="10.8" y2="9" stroke="#B99A4F" strokeWidth="1.2" />
      <ellipse cx="7" cy="9" rx="3.6" ry="5.2" fill="none" stroke="#B99A4F" strokeWidth="0.9" />
    </svg>
  );
}

// SVG's skewY() takes no centre point (only rotate() does) — a browser drops
// "skewY(a x y)" whole and logs an error. Skew about a point the long way.
const skewAt = (a, x, y) => `translate(${x} ${y}) skewY(${a}) translate(${-x} ${-y})`;

const dims = (it) => { const c = BY_ID[it.type]; return it.rot ? [c.d, c.w] : [c.w, c.d]; };
const footprint = (iso, it) => { const [w, d] = dims(it); return [iso(it.gx, it.gy), iso(it.gx + w, it.gy), iso(it.gx + w, it.gy + d), iso(it.gx, it.gy + d)]; };

function drawFloorItem(iso, it, opts) {
  const [w, d] = dims(it);
  const g = it.gx, y = it.gy;
  const cx = iso(g + w / 2, y + d / 2);
  let s = "";
  switch (it.type) {
    case "zabuton":
      s = isoBox(iso, g + .12, y + .12, .76, .76, 6, 0, "#6B6CA3", "#54558A", "#494A7C", S);
      break;
    case "hachiue":
      s = isoBox(iso, g + .3, y + .3, .4, .4, 12, 0, "#B98A5E", "#A0744C", "#8C6440", S) +
          `<ellipse cx="${cx.x - 5}" cy="${cx.y - 22}" rx="8" ry="10" fill="#6EA271" stroke="${S}"/>` +
          `<ellipse cx="${cx.x + 6}" cy="${cx.y - 25}" rx="7" ry="11" fill="#5E8C61" stroke="${S}"/>` +
          `<ellipse cx="${cx.x}" cy="${cx.y - 31}" rx="6" ry="9" fill="#7BAE7A" stroke="${S}"/>`;
      break;
    case "ikebana":
      s = isoBox(iso, g + .32, y + .32, .36, .36, 14, 0, "#2F3A4A", "#262F3C", "#1F2732", S) +
          `<path d="M ${cx.x} ${cx.y - 14} q -2 -14 -9 -24 M ${cx.x} ${cx.y - 14} q 3 -12 10 -18 M ${cx.x} ${cx.y - 14} l 1 -30" stroke="#5E7B3E" stroke-width="2" fill="none"/>` +
          `<circle cx="${cx.x - 9}" cy="${cx.y - 38}" r="4.5" fill="#D9707A" stroke="${S}"/>` +
          `<circle cx="${cx.x + 10}" cy="${cx.y - 32}" r="4" fill="#E8C87A" stroke="${S}"/>` +
          `<circle cx="${cx.x + 1}" cy="${cx.y - 45}" r="3.5" fill="#F3EFE6" stroke="${S}"/>`;
      break;
    case "bonsai":
      s = isoBox(iso, g + .25, y + .25, .5, .5, 9, 0, "#A56A45", "#8C5738", "#7C4C30", S) +
          `<path d="M ${cx.x} ${cx.y - 9} q -3 -12 4 -20" stroke="#6B4A2F" stroke-width="3" fill="none"/>` +
          `<ellipse cx="${cx.x + 6}" cy="${cx.y - 32}" rx="14" ry="8" fill="#5E8C61" stroke="${S}"/>` +
          `<ellipse cx="${cx.x - 7}" cy="${cx.y - 24}" rx="10" ry="6" fill="#6EA271" stroke="${S}"/>`;
      break;
    case "andon":
      s = `<ellipse cx="${cx.x}" cy="${cx.y - 26}" rx="26" ry="15" fill="#F4DFA5" opacity=".45"/>` +
          isoBox(iso, g + .28, y + .28, .44, .44, 40, 0, "#EFE3C0", "#EAD9AC", "#E2CE9B", "#8B6B4A") +
          isoBox(iso, g + .24, y + .24, .52, .52, 4, 40, "#8B6B4A", "#7A5C3F", "#6D5238", S);
      break;
    case "toro":
      s = isoBox(iso, g + .3, y + .3, .4, .4, 14, 0, "#9C978C", "#88837A", "#7A766D", S) +
          isoBox(iso, g + .22, y + .22, .56, .56, 12, 14, "#B4AFA4", "#A29D92", "#948F84", S) +
          `<ellipse cx="${cx.x}" cy="${cx.y - 21}" rx="5" ry="3.5" fill="#F4DFA5" opacity=".9"/>` +
          isoBox(iso, g + .12, y + .12, .76, .76, 5, 26, "#8E897F", "#7E7970", "#716C63", S) +
          `<path d="M ${cx.x - 3} ${cx.y - 31} l 3 -8 l 3 8 z" fill="#8E897F" stroke="${S}"/>`;
      break;
    case "hondana":
      if (!it.rot) {
        s = isoBox(iso, g + .1, y + .05, .8, 1.9, 62, 0, "#8B6B4A", "#7A5C3F", "#6D5238", S);
        for (let k = 0; k < 3; k++) {
          const a = iso(g + .9, y + .2), b = iso(g + .9, y + 1.8);
          const lift = 12 + k * 17;
          s += `<line x1="${a.x}" y1="${a.y - lift}" x2="${b.x}" y2="${b.y - lift}" stroke="#4E3A28" stroke-width="1.2"/>`;
          for (let j = 0; j < 5; j++) {
            const p = iso(g + .9, y + .3 + j * .3);
            const col = ["#B7503E", "#3D5A80", "#E8C87A", "#5E8C61", "#F3EFE6"][(j + k) % 5];
            s += `<rect x="${(p.x - 1).toFixed(1)}" y="${(p.y - lift - 12).toFixed(1)}" width="5" height="11" fill="${col}" stroke="${S}" stroke-width=".6" transform="${skewAt(26.6, p.x, p.y)}"/>`;
          }
        }
      } else {
        s = isoBox(iso, g + .05, y + .1, 1.9, .8, 62, 0, "#8B6B4A", "#7A5C3F", "#6D5238", S);
        for (let k = 0; k < 3; k++) {
          const a = iso(g + .2, y + .9), b = iso(g + 1.8, y + .9);
          const lift = 12 + k * 17;
          s += `<line x1="${a.x}" y1="${a.y - lift}" x2="${b.x}" y2="${b.y - lift}" stroke="#4E3A28" stroke-width="1.2"/>`;
        }
      }
      break;
    case "futon":
      if (!it.rot) {
        s = isoBox(iso, g + .05, y + .05, 1.9, 2.9, 9, 0, "#F3EFE6", "#E4DECF", "#D8D1C0", S) +
            isoBox(iso, g + .05, y + 1.0, 1.9, 1.95, 10, 0, "#A9BDCE", "#93A9BC", "#8399AC", S) +
            isoBox(iso, g + .55, y + .18, .9, .55, 8, 9, "#EFE6D2", "#E2D7BE", "#D6CAAE", S);
      } else {
        s = isoBox(iso, g + .05, y + .05, 2.9, 1.9, 9, 0, "#F3EFE6", "#E4DECF", "#D8D1C0", S) +
            isoBox(iso, g + 1.0, y + .05, 1.95, 1.9, 10, 0, "#A9BDCE", "#93A9BC", "#8399AC", S) +
            isoBox(iso, g + .18, y + .55, .55, .9, 8, 9, "#EFE6D2", "#E2D7BE", "#D6CAAE", S);
      }
      break;
    case "byobu": {
      for (let i = 0; i < 3; i++) {
        const off = (i % 2 === 0) ? .12 : .42;
        if (!it.rot) s += isoBox(iso, g + off, y + i + .02, .14, .96, 62, 0, "#D9B878", "#CBA968", "#BC9A58", S);
        else         s += isoBox(iso, g + i + .02, y + off, .96, .14, 62, 0, "#D9B878", "#CBA968", "#BC9A58", S);
      }
      s += `<path d="M ${cx.x - 12} ${cx.y - 44} q 14 -8 26 2" stroke="#6B4A2F" stroke-width="2" fill="none" opacity=".7"/>`;
      break;
    }
    default: break;
  }
  const o = opts || {};
  const op = o.ghost ? ` opacity="0.55"` : "";
  const sel = o.selected ? poly(footprint(iso, it), "none", T.shu, ' stroke-dasharray="4 3" stroke-width="1.5"') : "";
  return `<g data-item="${o.ghost ? "" : it.type}"${op} style="cursor:${o.ghost ? "default" : "grab"}">` +
         poly(footprint(iso, it), "rgba(0,0,0,0.001)") + s + sel + "</g>";
}

// The study spot's table. 座卓 or こたつ, with the quilt colour as a style.
function drawAnchor(iso, type, blanket, opts) {
  const { gx, gy } = STUDY.table;
  const cx = iso(gx + 1, gy + 1);
  let s = "";
  if (type === "kotatsu") {
    s = isoBox(iso, gx + .2, gy + .2, 1.6, 1.6, 16, 0, blanket.color, blanket.shade, blanket.shade, S) +
        isoBox(iso, gx + .05, gy + .05, 1.9, 1.9, 5, 16, "#8B6B4A", "#7A5C3F", "#6D5238", S) +
        `<ellipse cx="${cx.x}" cy="${cx.y - 21}" rx="9" ry="4.5" fill="#D9CBB1" stroke="${S}"/>` +
        `<circle cx="${cx.x + 14}" cy="${cx.y - 23}" r="4" fill="#E8913A" stroke="${S}"/>`;
  } else if (type === "zataku") {
    s = isoBox(iso, gx + .25, gy + .25, .12, .12, 13, 0, "#5E4630", "#4E3A28", "#433222", S) +
        isoBox(iso, gx + 1.63, gy + .25, .12, .12, 13, 0, "#5E4630", "#4E3A28", "#433222", S) +
        isoBox(iso, gx + .25, gy + 1.63, .12, .12, 13, 0, "#5E4630", "#4E3A28", "#433222", S) +
        isoBox(iso, gx + 1.63, gy + 1.63, .12, .12, 13, 0, "#5E4630", "#4E3A28", "#433222", S) +
        isoBox(iso, gx + .1, gy + .1, 1.8, 1.8, 5, 13, "#7A5A3C", "#694C31", "#5C4229", S) +
        `<rect x="${cx.x - 16}" y="${cx.y - 24}" width="20" height="13" rx="2" fill="#FBF7EE" stroke="#B89A72" transform="${skewAt(-8, cx.x, cx.y)}"/>` +
        `<path d="M ${cx.x - 12} ${cx.y - 19} h 12 M ${cx.x - 12} ${cx.y - 15} h 8" stroke="#8A7F6F" stroke-width="1.2"/>`;
  } else {
    // No table yet: the spot shows where it will go, as the board does for
    // things not yet there — dashed, never empty-looking or reproachful.
    const f = [iso(gx, gy), iso(gx + 2, gy), iso(gx + 2, gy + 2), iso(gx, gy + 2)];
    s = poly(f, "rgba(251,247,238,.35)", "#8A7F6F", ' stroke-dasharray="6 5" stroke-width="1.5"') +
        `<text x="${cx.x}" y="${cx.y + 4}" text-anchor="middle" font-family='${T.jpFont}' font-size="13" font-weight="700" fill="#4A463D">${STUDY.labelJa}</text>`;
  }
  const o = opts || {};
  const sel = o.selected ? poly([iso(gx, gy), iso(gx + 2, gy), iso(gx + 2, gy + 2), iso(gx, gy + 2)], "none", T.shu, ' stroke-dasharray="4 3" stroke-width="1.5"') : "";
  return `<g data-anchor="${type || ""}" style="cursor:pointer">${s}${sel}</g>`;
}

function drawWallItemAt(iso, type, start) {
  const c = BY_ID[type];
  let s = "";
  if (type === "kakejiku") {
    s = poly(wallQuad(iso, "L", start, c.len, WALLH - 8, 14), "#EFE6D2", S) +
        poly(wallQuad(iso, "L", start - .06, c.len + .12, WALLH - 6, WALLH - 12), "#6D5238", S) +
        poly(wallQuad(iso, "L", start - .06, c.len + .12, 20, 14), "#6D5238", S);
    const m0 = iso(0, start + c.len * .5);
    s += `<path d="M ${m0.x} ${m0.y - WALLH + 26} q -8 18 4 34 q 8 12 2 22" stroke="#4A4238" stroke-width="2.5" fill="none"/>` +
         `<ellipse cx="${m0.x - 6}" cy="${m0.y - WALLH + 30}" rx="7" ry="4" fill="#5E8C61" opacity=".8"/>` +
         `<circle cx="${m0.x + 10}" cy="${m0.y - 30}" r="4" fill="#B7503E" opacity=".9"/>`;
  } else if (type === "noren") {
    const flap = c.len / 3;
    for (let i = 0; i < 3; i++) {
      s += poly(wallQuad(iso, "R", start + i * flap + .04, flap - .08, WALLH - 10, 26 + (i === 1 ? 0 : 6)), "#3E4E77", S);
    }
    s += poly(wallQuad(iso, "R", start - .05, c.len + .1, WALLH - 8, WALLH - 14), "#6D5238", S);
    const mid = iso(start + c.len / 2, 0);
    s += `<circle cx="${mid.x}" cy="${mid.y - WALLH + 34}" r="8" fill="none" stroke="#F6F1E7" stroke-width="2"/>`;
  } else if (type === "chochin") {
    const mid = iso(start + c.len / 2, 0);
    const y0 = mid.y - WALLH + 22;
    s = `<line x1="${mid.x}" y1="${y0 - 12}" x2="${mid.x}" y2="${y0}" stroke="${S}" stroke-width="1.2"/>` +
        `<ellipse cx="${mid.x}" cy="${y0 + 26}" rx="22" ry="12" fill="#F4DFA5" opacity=".35"/>` +
        `<rect x="${mid.x - 7}" y="${y0}" width="14" height="4" fill="#2C2A26"/>` +
        `<ellipse cx="${mid.x}" cy="${y0 + 18}" rx="12" ry="15" fill="#C9503A" stroke="${S}"/>` +
        `<path d="M ${mid.x - 12} ${y0 + 12} h 24 M ${mid.x - 12} ${y0 + 18} h 24 M ${mid.x - 11} ${y0 + 24} h 22" stroke="#9C3A28" stroke-width="1"/>` +
        `<rect x="${mid.x - 7}" y="${y0 + 32}" width="14" height="4" fill="#2C2A26"/>`;
  }
  return s;
}
function drawWallItem(iso, type, slotStart, opts) {
  const c = BY_ID[type];
  const o = opts || {};
  const sel = o.selected ? poly(wallQuad(iso, c.wall, slotStart - .05, c.len + .1, WALLH - 4, 10), "none", T.shu, ' stroke-dasharray="4 3" stroke-width="1.5"') : "";
  return `<g data-item="${type}" style="cursor:pointer">` +
    poly(wallQuad(iso, c.wall, slotStart, c.len, WALLH - 8, 12), "rgba(0,0,0,0.001)") + drawWallItemAt(iso, type, slotStart) + sel + "</g>";
}

/* ---- the avatar: seated, one pose, four slots ---- */
function avatarParts(ch) {
  const pick = (slot) => AV_BY_ID[ch[slot]] || AV_BY_ID[AV_DEFAULT[slot]];
  return { hair: pick("hair"), top: pick("top"), bottom: pick("bottom"), acc: pick("acc") };
}
// Drawn around (x, y) = the point on the floor where the avatar sits, at
// scale k. One function serves the room and the portrait, so they cannot
// disagree about what you are wearing.
function drawAvatar(x, y, k, ch) {
  const P = avatarParts(ch);
  const f = (n) => (n * k).toFixed(1);
  const X = (dx) => (x + dx * k).toFixed(1), Y = (dy) => (y + dy * k).toFixed(1);
  const skin = "#F1D9C0";
  let s = `<ellipse cx="${X(0)}" cy="${Y(0)}" rx="${f(20)}" ry="${f(7)}" fill="rgba(0,0,0,.14)"/>`;
  // folded legs (seiza) — the bottom
  s += `<path d="M ${X(-17)} ${Y(-2)} q ${f(17)} ${f(8)} ${f(34)} 0 l ${f(-3)} ${f(-12)} q ${f(-14)} ${f(-5)} ${f(-28)} 0 z" fill="${P.bottom.color}" stroke="${S}" stroke-width="${f(1)}"/>`;
  // long hair falls behind the body
  if (P.hair.style === "long") s += `<path d="M ${X(-13)} ${Y(-48)} q ${f(-4)} ${f(22)} ${f(2)} ${f(34)} h ${f(22)} q ${f(6)} ${f(-12)} ${f(2)} ${f(-34)} z" fill="${P.hair.color}"/>`;
  // torso — the top
  s += `<path d="M ${X(-14)} ${Y(-11)} q ${f(-2)} ${f(-22)} ${f(5)} ${f(-28)} h ${f(18)} q ${f(7)} ${f(6)} ${f(5)} ${f(28)} z" fill="${P.top.color}" stroke="${S}" stroke-width="${f(1)}"/>`;
  if (P.top.pattern) s += `<path d="M ${X(-8)} ${Y(-30)} l ${f(4)} ${f(4)} M ${X(2)} ${Y(-22)} l ${f(4)} ${f(4)} M ${X(-4)} ${Y(-16)} l ${f(4)} ${f(4)}" stroke="#3D5A80" stroke-width="${f(1.4)}"/>`;
  s += `<path d="M ${X(-4)} ${Y(-39)} l ${f(4)} ${f(9)} l ${f(4)} ${f(-9)}" stroke="${P.top.shade}" stroke-width="${f(1.6)}" fill="none"/>`;
  // hands resting in the lap
  s += `<ellipse cx="${X(0)}" cy="${Y(-12)}" rx="${f(7)}" ry="${f(3.5)}" fill="${skin}" stroke="${S}" stroke-width="${f(.8)}"/>`;
  // head
  s += `<circle cx="${X(0)}" cy="${Y(-50)}" r="${f(11)}" fill="${skin}" stroke="${S}" stroke-width="${f(1)}"/>`;
  // hair on top
  if (P.hair.style === "bun") s += `<circle cx="${X(0)}" cy="${Y(-64)}" r="${f(5.5)}" fill="${P.hair.color}"/>`;
  s += `<path d="M ${X(-11.5)} ${Y(-50)} q ${f(1)} ${f(-14)} ${f(11.5)} ${f(-13)} q ${f(10.5)} ${f(-1)} ${f(11.5)} ${f(13)} q ${f(-5)} ${f(-6)} ${f(-11.5)} ${f(-6)} q ${f(-6.5)} 0 ${f(-11.5)} ${f(6)} z" fill="${P.hair.color}"/>`;
  // face, a calm one — eyes closed in concentration
  s += `<path d="M ${X(-6)} ${Y(-49)} q ${f(2)} ${f(2)} ${f(4)} 0 M ${X(2)} ${Y(-49)} q ${f(2)} ${f(2)} ${f(4)} 0" stroke="${S}" stroke-width="${f(1.2)}" fill="none" stroke-linecap="round"/>`;
  s += `<path d="M ${X(-2)} ${Y(-44)} q ${f(2)} ${f(1.5)} ${f(4)} 0" stroke="${S}" stroke-width="${f(1)}" fill="none" stroke-linecap="round"/>`;
  // accessory
  if (P.acc.id === "acc-megane") s += `<g fill="none" stroke="#2C2A26" stroke-width="${f(1.1)}"><circle cx="${X(-4)}" cy="${Y(-49)}" r="${f(3.4)}"/><circle cx="${X(4)}" cy="${Y(-49)}" r="${f(3.4)}"/><path d="M ${X(-.6)} ${Y(-49)} h ${f(1.2)}"/></g>`;
  if (P.acc.id === "acc-hachimaki") s += `<path d="M ${X(-11)} ${Y(-55)} q ${f(11)} ${f(-4)} ${f(22)} 0" stroke="#F3EFE6" stroke-width="${f(3)}" fill="none"/><circle cx="${X(0)}" cy="${Y(-57)}" r="${f(1.8)}" fill="${T.shu}"/><path d="M ${X(10)} ${Y(-55)} l ${f(6)} ${f(5)} M ${X(10)} ${Y(-55)} l ${f(7)} ${f(1)}" stroke="#F3EFE6" stroke-width="${f(2)}"/>`;
  if (P.acc.id === "acc-kanzashi") s += `<path d="M ${X(6)} ${Y(-58)} l ${f(9)} ${f(-6)}" stroke="#8B6B4A" stroke-width="${f(1.2)}"/><circle cx="${X(15)}" cy="${Y(-64)}" r="${f(3.2)}" fill="#D9707A" stroke="${S}" stroke-width="${f(.6)}"/>`;
  return `<g class="rm-breathe" style="transform-origin:${X(0)}px ${Y(0)}px">${s}</g>`;
}

/* ---- the cat: always glad to see you ---- */
function drawCat(iso, gx, gy, holding) {
  const p = iso(gx + .5, gy + .5);
  return `<g pointer-events="none">` +
    `<ellipse cx="${p.x}" cy="${p.y}" rx="13" ry="6" fill="rgba(0,0,0,.1)"/>` +
    `<ellipse cx="${p.x}" cy="${p.y - 8}" rx="11" ry="10" fill="#F6F1E7" stroke="${S}"/>` +
    `<circle cx="${p.x}" cy="${p.y - 22}" r="8.5" fill="#F6F1E7" stroke="${S}"/>` +
    `<path d="M ${p.x - 8} ${p.y - 26} l -2 -8 l 6 3 z M ${p.x + 8} ${p.y - 26} l 2 -8 l -6 3 z" fill="#F6F1E7" stroke="${S}"/>` +
    `<ellipse cx="${p.x - 5}" cy="${p.y - 13}" rx="3" ry="2.4" fill="#E8913A" opacity=".85"/>` +
    `<path d="M ${p.x - 7} ${p.y - 15} q 7 3.5 14 0" stroke="${T.shu}" stroke-width="2.6" fill="none"/>` +
    `<circle cx="${p.x}" cy="${p.y - 12.5}" r="2" fill="#E8C87A" stroke="${S}" stroke-width=".7"/>` +
    (holding
      ? `<path d="M ${p.x - 4} ${p.y - 23} q 1.5 -1.5 3 0 M ${p.x + 1} ${p.y - 23} q 1.5 -1.5 3 0" stroke="${S}" stroke-width="1.1" fill="none"/>` +
        `<circle cx="${p.x + 11}" cy="${p.y - 22}" r="4" fill="#F6F1E7" stroke="${S}"/>` +
        `<g transform="translate(${p.x + 6} ${p.y - 18})">` + `<ellipse cx="5" cy="6" rx="4.5" ry="6" fill="#E8C87A" stroke="#8B6B4A"/><line x1="2" y1="6" x2="8" y2="6" stroke="#B99A4F"/></g>`
      : `<path d="M ${p.x - 5} ${p.y - 22} l 3 1 M ${p.x + 2} ${p.y - 22} l 3 1" stroke="${S}" stroke-width="1.1"/>` +
        `<text x="${p.x + 12}" y="${p.y - 30}" font-size="9" fill="#8A7F6F" class="rm-zz">z z</text>`) +
    `<path d="M ${p.x + 10} ${p.y - 4} q 9 -2 8 -11" stroke="#F6F1E7" stroke-width="4" fill="none"/>` +
    `<path d="M ${p.x + 10} ${p.y - 4} q 9 -2 8 -11" stroke="${S}" stroke-width="1" fill="none" opacity=".5"/>` +
    `</g>`;
}

/* ---- previews for the shop and the inventory ---- */
const PREVIEW_ISO = (gx, gy) => ({ x: 120 + (gx - gy) * TW, y: 140 + (gx + gy) * TH });
function previewSVG(id, style) {
  const c = BY_ID[id];
  const iso = PREVIEW_ISO;
  let body, box;
  if (c.kind === "wall") {
    const p0 = c.wall === "L" ? iso(0, 1) : iso(1, 0);
    const p1 = c.wall === "L" ? iso(0, 1 + c.len) : iso(1 + c.len, 0);
    box = [Math.min(p0.x, p1.x) - 14, Math.min(p0.y, p1.y) - WALLH - 4, Math.abs(p1.x - p0.x) + 28, Math.abs(p1.y - p0.y) + WALLH + 14];
    body = drawWallItemAt(iso, id, 1);
  } else if (c.kind === "anchor") {
    const rel = (gx, gy) => iso(gx - STUDY.table.gx, gy - STUDY.table.gy);
    box = [rel(1, 3).x - 8, rel(1, 1).y - 52, (rel(3, 1).x - rel(1, 3).x) + 16, 2 * TH * 2 + 62];
    body = drawAnchor(rel, id, id === "kotatsu" ? STYLE_DEFAULT.blanket : null, {});
  } else if (c.kind === "style") {
    return styleSwatch(c);
  } else {
    box = [iso(0, c.d).x - 8, iso(0, 0).y - 82, (iso(c.w, 0).x - iso(0, c.d).x) + 16, iso(c.w, c.d).y - iso(0, 0).y + 92];
    body = drawFloorItem(iso, { type: id, gx: 0, gy: 0, rot: 0 }, {});
  }
  return `<svg viewBox="${box.map((v) => v.toFixed(0)).join(" ")}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${body}</svg>`;
}
function styleSwatch(c) {
  if (c.slot === "wall") {
    return `<svg viewBox="0 0 120 80" aria-hidden="true"><polygon points="10,70 60,45 60,5 10,30" fill="${c.color}" stroke="${c.edge}"/><polygon points="60,45 110,70 110,30 60,5" fill="${c.color}" stroke="${c.edge}" opacity=".85"/></svg>`;
  }
  if (c.slot === "tatami") {
    const lines = c.line ? `<path d="M30,48 L90,18 M30,18 L90,48" stroke="${c.line}" stroke-width="1.6"/>` : `<path d="M60,4 L60,62 M8,33 L112,33" stroke="${c.alt}" stroke-width="1"/>`;
    return `<svg viewBox="0 0 120 66" aria-hidden="true"><polygon points="60,4 112,33 60,62 8,33" fill="${c.color}" stroke="${c.alt}"/>${lines}</svg>`;
  }
  return `<svg viewBox="0 0 120 80" aria-hidden="true"><polygon points="60,20 105,42 60,64 15,42" fill="${c.color}" stroke="${c.shade}"/><polygon points="15,42 60,64 60,74 15,52" fill="${c.shade}"/><polygon points="60,64 105,42 105,52 60,74" fill="${c.shade}" opacity=".85"/><ellipse cx="60" cy="38" rx="9" ry="4.5" fill="#D9CBB1"/></svg>`;
}
function avatarPreviewSVG(ch) {
  return `<svg viewBox="0 0 80 90" aria-hidden="true">${drawAvatar(40, 82, 1.05, ch)}</svg>`;
}

/* ---------------------------------------------------------------------------
   7. STATE HELPERS
   -------------------------------------------------------------------------*/

const BLANK_LAYOUT = { v: 1, t: 0, home: "yojouhan", placed: {}, wall: {}, anchor: null, style: {}, last: null, introSeen: false };
const BLANK_CHAR = { v: 1, t: 0, ...AV_DEFAULT };

function homeOf(layout) { return HOMES.find((h) => h.id === layout.home) || HOMES[0]; }

function reserved(n) {
  const m = new Set();
  const { table, seat } = STUDY;
  for (let x = table.gx; x < table.gx + table.w; x++) for (let y = table.gy; y < table.gy + table.d; y++) m.add(x + "," + y);
  m.add(seat.gx + "," + seat.gy);
  return m;
}
function occupied(layout, except) {
  const m = reserved(homeOf(layout).n);
  for (const [type, p] of Object.entries(layout.placed || {})) {
    if (type === except || !BY_ID[type]) continue;
    const [w, d] = dims({ type, rot: p.rot });
    for (let x = p.gx; x < p.gx + w; x++) for (let y = p.gy; y < p.gy + d; y++) m.add(x + "," + y);
  }
  return m;
}
function fits(layout, type, gx, gy, rot) {
  const n = homeOf(layout).n;
  const [w, d] = dims({ type, rot });
  if (gx < 0 || gy < 0 || gx + w > n || gy + d > n) return false;
  const occ = occupied(layout, type);
  for (let x = gx; x < gx + w; x++) for (let y = gy; y < gy + d; y++) if (occ.has(x + "," + y)) return false;
  return true;
}
function styleOf(layout, slot) {
  const id = (layout.style || {})[slot];
  return (id && BY_ID[id]) || STYLE_DEFAULT[slot];
}

// What the cat does: sits beside whatever you placed last, or beside you.
function catSpot(layout) {
  const n = homeOf(layout).n;
  const occ = occupied(layout, null);
  const tryAround = (gx, gy, w, d) => {
    const spots = [[gx + w, gy], [gx - 1, gy + d - 1], [gx, gy + d], [gx + w - 1, gy - 1], [gx + w, gy + d - 1]];
    return spots.find(([x, y]) => x >= 0 && y >= 0 && x < n && y < n && !occ.has(x + "," + y));
  };
  const last = layout.last && layout.placed[layout.last];
  if (last) { const [w, d] = dims({ type: layout.last, rot: last.rot }); const s = tryAround(last.gx, last.gy, w, d); if (s) return s; }
  return tryAround(STUDY.seat.gx, STUDY.seat.gy, 1, 1) || [n - 1, n - 1];
}

/* ---------------------------------------------------------------------------
   8. UI
   -------------------------------------------------------------------------*/

const CSS = `
.rm-breathe{animation:rm-breathe 5.5s ease-in-out infinite}
@keyframes rm-breathe{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.018)}}
.rm-zz{animation:rm-zz 3.2s ease-in-out infinite}
@keyframes rm-zz{0%,100%{opacity:.25}50%{opacity:.9}}
@media (prefers-reduced-motion: reduce){.rm-breathe,.rm-zz{animation:none}}
.rm-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px}
.rm-prev{height:96px;display:flex;align-items:center;justify-content:center;background:#F1EADB;border-radius:10px}
.rm-prev svg{max-height:90px;max-width:100%}
.rm-inv{display:flex;gap:8px;overflow-x:auto;padding:2px 2px 6px;scrollbar-width:thin}
.rm-inv button{flex:0 0 auto;display:flex;flex-direction:column;align-items:center;gap:2px;min-width:72px;min-height:44px;padding:6px 6px 4px;border-radius:12px;border:0;cursor:pointer;font:inherit;background:#FBF7EE;box-shadow:inset 0 0 0 1.5px #D9CFB8,0 2px 0 #CFC4A8;color:#2C2A26}
.rm-inv button[aria-pressed="true"]{box-shadow:inset 0 0 0 2px #C7351B,0 2px 0 #CFC4A8;background:#FBF1EC}
.rm-inv svg{width:44px;height:40px}
.rm-opt{display:flex;flex-direction:column;align-items:center;gap:2px;min-width:76px;min-height:44px;padding:6px;border-radius:12px;border:0;cursor:pointer;font:inherit;background:#FBF7EE;box-shadow:inset 0 0 0 1.5px #D9CFB8,0 2px 0 #CFC4A8;color:#2C2A26}
.rm-opt[aria-pressed="true"]{box-shadow:inset 0 0 0 2px #3E7C4F,0 2px 0 #CFC4A8}
`;

const label = { font: `700 0.6875rem ${T.uiFont}`, letterSpacing: ".08em", color: T.muted };



export default function RoomModule() {
  const [ready, setReady] = useState(false);
  const [view, setView] = useState("room");          // room | shop | you
  const [balance, setBalance] = useState(0);
  const [owned, setOwned] = useState({});             // itemId -> first owned at
  const [layout, setLayout] = useState(BLANK_LAYOUT);
  const [ch, setCh] = useState(BLANK_CHAR);
  const [cap, setCap] = useState({ kana: false, words: 0, ready: false });
  const [awaySince, setAwaySince] = useState(0);      // koban earned since the last visit
  const [placing, setPlacing] = useState(null);       // { type, rot } while placing from inventory
  const [hover, setHover] = useState(null);
  const [drag, setDrag] = useState(null);
  const [selected, setSelected] = useState(null);     // itemId, or "anchor"
  const [note, setNote] = useState(null);
  const svgRef = useRef(null);

  // ————— load —————
  useEffect(() => {
    let alive = true;
    (async () => {
      const [led, o, l, c, capNow] = await Promise.all([
        readKoban(), loadJSON(OWNED_KEY, null), loadJSON(LAYOUT_KEY, null), loadJSON(CHARACTER_KEY, null), readCapability(),
      ]);
      if (!alive) return;
      // Owned = the list, plus anything the ledger shows was paid for. A spend
      // and its owned-entry are two writes; if a tab ever closed between them,
      // the ledger still knows what was bought, so nothing paid for is lost.
      const ids = { ...((o && o.ids) || {}) };
      let repaired = false;
      let paidHome = null;
      for (const e of led.events) {
        if (!(e.d < 0 && e.item)) continue;
        if ((BY_ID[e.item] || AV_BY_ID[e.item]) && ids[e.item] == null) { ids[e.item] = e.ts || Date.now(); repaired = true; }
        const h = String(e.item).startsWith("home:") && HOMES.findIndex((x) => "home:" + x.id === e.item);
        if (h > 0 && (paidHome == null || h > paidHome)) paidHome = h;
      }
      if (repaired) saveJSON(OWNED_KEY, { v: 1, ids });
      // The same for the home. Layout merges most-recent-wins, so an older
      // device's later edit could carry the small room back over a move that
      // was paid for. The ledger cannot lose that payment, so it decides.
      const lay = { ...BLANK_LAYOUT, ...(l || {}) };
      const layIdx = Math.max(0, HOMES.findIndex((x) => x.id === lay.home));
      if (paidHome != null && paidHome > layIdx) lay.home = HOMES[paidHome].id;
      const bal = kobanBalance(led);
      setOwned(ids);
      setLayout({ ...lay, placed: { ...(lay.placed || {}) }, wall: { ...(lay.wall || {}) }, style: { ...(lay.style || {}) } });
      setCh({ ...BLANK_CHAR, ...(c || {}) });
      setCap(capNow);
      setBalance(bal);
      // The cat holds a koban when some arrived while you were away.
      let seen = null;
      try { const raw = window.localStorage.getItem(PULSE_KEY); seen = raw ? JSON.parse(raw).seen : null; } catch (e) {}
      if (Number.isFinite(seen) && bal > seen) setAwaySince(bal - seen);
      setReady(true);
    })();
    return () => { alive = false; };
  }, []);

  // What this browser has now seen in the room — read by Home for the pulse.
  // Written on every change of balance or ownership, so a purchase clears the
  // crossing it answered and visiting clears all of them.
  useEffect(() => {
    if (!ready) return;
    const prices = CATALOG.filter((c) => owned[c.id] == null && (!c.needs || owned[c.needs] != null)).map((c) => c.price);
    const home = HOMES.find((h) => h.price && h.id !== layout.home);
    if (home && cap.ready) prices.push(home.price);
    try { window.localStorage.setItem(PULSE_KEY, JSON.stringify({ seen: balance, prices: [...new Set(prices)].sort((a, b) => a - b) })); } catch (e) {}
  }, [ready, balance, owned, layout.home, cap.ready]);

  // ————— writes —————
  const saveLayout = (next) => {
    const v = { ...next, v: 1, t: Date.now() };
    setLayout(v); saveJSON(LAYOUT_KEY, v);
  };
  const saveChar = (next) => {
    const v = { ...next, v: 1, t: Date.now() };
    setCh(v); saveJSON(CHARACTER_KEY, v);
  };
  const own = (id) => {
    setOwned((prev) => {
      const ids = { ...prev, [id]: prev[id] ?? Date.now() };
      saveJSON(OWNED_KEY, { v: 1, ids });
      return ids;
    });
  };
  const flash = (text) => { setNote(text); setTimeout(() => setNote((n) => (n === text ? null : n)), 3200); };

  const buy = async (id, priceOverride, jpName) => {
    const item = BY_ID[id] || AV_BY_ID[id];
    if (!item || owned[id] != null) return false;
    const price = priceOverride ?? item.price;
    const r = await spendKoban(price, "bought " + (jpName || item.jp), id);
    setBalance(r.balance);
    if (!r.ok) { flash("Not quite enough yet."); return false; }
    own(id);
    return true;
  };

  const buyItem = async (c) => {
    if (!(await buy(c.id))) return;
    if (c.kind === "anchor") {
      // The first table goes straight to the study spot, so the first thing
      // a learner buys changes the scene they are already looking at (§5.1).
      saveLayout({ ...layout, anchor: c.id });
      flash(`${c.jp} is at your study spot.`);
    } else if (c.kind === "style") {
      saveLayout({ ...layout, style: { ...layout.style, [c.slot]: c.id } });
      flash(`${c.jp} — on.`);
    } else {
      flash(`${c.jp} is waiting in your room.`);
    }
  };

  const moveHome = async (home) => {
    if (!cap.ready || layout.home === home.id) return;
    const r = await spendKoban(home.price, "moved to " + home.jp, "home:" + home.id);
    setBalance(r.balance);
    if (!r.ok) { flash("Not quite enough yet."); return; }
    saveLayout({ ...layout, home: home.id });
    setView("room");
    flash(`Welcome to your ${home.jp}.`);
  };

  // ————— derived —————
  const home = homeOf(layout);
  const G = useMemo(() => geom(home.n), [home.n]);
  const iso = useMemo(() => isoAt(G), [G]);
  const slots = useMemo(() => wallSlots(home.n), [home.n]);
  const inventory = CATALOG.filter((c) => owned[c.id] != null && (c.kind === "floor" || c.kind === "wall")
    && layout.placed[c.id] == null && layout.wall[c.id] == null);
  const nextHome = HOMES.find((h) => h.price && h.id !== layout.home && HOMES.indexOf(h) > HOMES.indexOf(home));

  // ————— the scene, as one SVG string —————
  const sceneSVG = useMemo(() => {
    const wall = styleOf(layout, "wall"), tat = styleOf(layout, "tatami"), blanket = styleOf(layout, "blanket");
    const n = home.n;
    let s = "";
    s += poly(wallQuad(iso, "L", 0, n, WALLH, 0), wall.color, wall.edge);
    s += poly(wallQuad(iso, "R", 0, n, WALLH, 0), wall.color, wall.edge, ' style="filter:brightness(.96)"');
    for (let i = 1; i < Math.floor(n / 1.6) + 1; i++) if (i * 1.6 < n) s += poly(wallQuad(iso, "L", i * 1.6, .04, WALLH - 10, 8), wall.edge);
    for (let x = 0; x < n; x++) for (let y = 0; y < n; y++) {
      const even = ((x >> 1) + (y >> 1)) % 2 === 0;
      s += poly([iso(x, y), iso(x + 1, y), iso(x + 1, y + 1), iso(x, y + 1)], even ? tat.color : tat.alt, tat.line || tat.alt);
    }
    if (tat.line) for (let i = 0; i <= n; i += 2) {
      s += `<line x1="${iso(i, 0).x}" y1="${iso(i, 0).y}" x2="${iso(i, n).x}" y2="${iso(i, n).y}" stroke="${tat.line}" stroke-width="1.4"/>`;
      s += `<line x1="${iso(0, i).x}" y1="${iso(0, i).y}" x2="${iso(n, i).x}" y2="${iso(n, i).y}" stroke="${tat.line}" stroke-width="1.4"/>`;
    }
    // wall items
    for (const [type, idx] of Object.entries(layout.wall)) {
      if (!BY_ID[type] || slots[idx] == null) continue;
      s += drawWallItem(iso, type, slots[idx], { selected: selected === type });
    }
    if (placing && BY_ID[placing.type].kind === "wall") {
      const c = BY_ID[placing.type];
      slots.forEach((start, idx) => {
        const taken = Object.entries(layout.wall).some(([t, i]) => i === idx && BY_ID[t] && BY_ID[t].wall === c.wall);
        if (!taken && fitsWall(n, start, c.len)) s += `<g data-slot="${idx}" style="cursor:pointer">` +
          poly(wallQuad(iso, c.wall, start, c.len, WALLH - 8, 12), "rgba(62,124,79,.22)", T.ok, ' stroke-dasharray="5 4" stroke-width="1.5"') + "</g>";
      });
    }
    // floor: everything sorted back-to-front, the study spot and the avatar included
    const draws = [];
    for (const [type, p] of Object.entries(layout.placed)) {
      if (!BY_ID[type] || (drag && drag.type === type)) continue;
      const [w, d] = dims({ type, rot: p.rot });
      draws.push({ depth: p.gx + w + p.gy + d, svg: drawFloorItem(iso, { type, ...p }, { selected: selected === type }) });
    }
    const t = STUDY.table;
    draws.push({ depth: t.gx + t.w + t.gy + t.d, svg: drawAnchor(iso, layout.anchor, blanket, { selected: selected === "anchor" }) });
    const seat = iso(STUDY.seat.gx + .5, STUDY.seat.gy + .35);
    draws.push({ depth: STUDY.seat.gx + STUDY.seat.gy + 2.1, svg: `<g pointer-events="none">${drawAvatar(seat.x, seat.y, .78, ch)}</g>` });
    const [cgx, cgy] = catSpot(layout);
    draws.push({ depth: cgx + cgy + 2.05, svg: drawCat(iso, cgx, cgy, awaySince > 0) });
    draws.sort((a, b) => a.depth - b.depth);
    s += draws.map((d) => d.svg).join("");
    // placing / dragging ghosts
    const ghost = (type, gx, gy, rot, ok) => {
      const it = { type, gx, gy, rot };
      return poly(footprint(iso, it), ok ? "rgba(62,124,79,.32)" : "rgba(199,53,27,.30)") + (ok ? drawFloorItem(iso, it, { ghost: true }) : "");
    };
    if (placing && BY_ID[placing.type].kind === "floor" && hover) s += ghost(placing.type, hover.gx, hover.gy, placing.rot, fits(layout, placing.type, hover.gx, hover.gy, placing.rot));
    if (drag) s += ghost(drag.type, drag.gx, drag.gy, drag.rot, drag.ok);
    return s;
  }, [layout, home.n, iso, slots, placing, hover, drag, selected, ch, awaySince]);

  // ————— pointer handling on the scene —————
  const svgPoint = (ev) => {
    const r = svgRef.current.getBoundingClientRect();
    return { x: (ev.clientX - r.left) * G.W / r.width, y: (ev.clientY - r.top) * G.H / r.height };
  };
  const onMove = (ev) => {
    if (!svgRef.current) return;
    const p = svgPoint(ev);
    if (placing && BY_ID[placing.type].kind === "floor") setHover(pickTile(G, p.x, p.y));
    if (drag) {
      const tl = pickTile(G, p.x - drag.offX, p.y - drag.offY);
      setDrag({ ...drag, gx: tl.gx, gy: tl.gy, ok: fits(layout, drag.type, tl.gx, tl.gy, drag.rot) });
    }
  };
  const onDown = (ev) => {
    if (!svgRef.current) return;
    const p = svgPoint(ev);
    const slotEl = ev.target.closest && ev.target.closest("[data-slot]");
    if (placing && BY_ID[placing.type].kind === "wall") {
      if (slotEl) {
        saveLayout({ ...layout, wall: { ...layout.wall, [placing.type]: +slotEl.dataset.slot } });
        setSelected(placing.type); setPlacing(null);
      }
      return;
    }
    if (placing) {
      const tl = pickTile(G, p.x, p.y);
      if (fits(layout, placing.type, tl.gx, tl.gy, placing.rot)) {
        saveLayout({ ...layout, placed: { ...layout.placed, [placing.type]: { gx: tl.gx, gy: tl.gy, rot: placing.rot } }, last: placing.type });
        setSelected(placing.type); setPlacing(null); setHover(null);
      }
      return;
    }
    const itemEl = ev.target.closest && ev.target.closest("[data-item]");
    const anchorEl = ev.target.closest && ev.target.closest("[data-anchor]");
    const type = itemEl && itemEl.dataset.item;
    if (type && layout.placed[type]) {
      const pl = layout.placed[type];
      const base = iso(pl.gx, pl.gy);
      setSelected(type);
      setDrag({ type, rot: pl.rot || 0, gx: pl.gx, gy: pl.gy, ok: true, offX: p.x - base.x, offY: p.y - base.y });
      try { svgRef.current.setPointerCapture(ev.pointerId); } catch (e) {}
      return;
    }
    if (type && layout.wall[type] != null) { setSelected(type); return; }
    if (anchorEl) { setSelected("anchor"); return; }
    setSelected(null);
  };
  const onUp = () => {
    if (!drag) return;
    if (drag.ok && (drag.gx !== layout.placed[drag.type].gx || drag.gy !== layout.placed[drag.type].gy)) {
      saveLayout({ ...layout, placed: { ...layout.placed, [drag.type]: { gx: drag.gx, gy: drag.gy, rot: drag.rot } } });
    }
    setDrag(null);
  };

  const rotate = (type) => {
    const p = layout.placed[type]; if (!p) return;
    const nr = p.rot ? 0 : 1;
    const n = home.n;
    const [w, d] = dims({ type, rot: nr });
    for (const [gx, gy] of [[p.gx, p.gy], [Math.min(p.gx, n - w), Math.min(p.gy, n - d)]]) {
      if (fits(layout, type, gx, gy, nr)) { saveLayout({ ...layout, placed: { ...layout.placed, [type]: { gx, gy, rot: nr } } }); return; }
    }
    flash("No room to turn it there — move it first.");
  };
  const putAway = (type) => {
    const placed = { ...layout.placed }, wall = { ...layout.wall };
    delete placed[type]; delete wall[type];
    saveLayout({ ...layout, placed, wall, last: layout.last === type ? null : layout.last });
    setSelected(null);
  };

  useEffect(() => {
    const onKey = (ev) => {
      if (ev.key === "Escape") { setPlacing(null); setHover(null); setDrag(null); }
      if ((ev.key === "r" || ev.key === "R") && view === "room") {
        if (placing && BY_ID[placing.type].kind === "floor") setPlacing({ ...placing, rot: placing.rot ? 0 : 1 });
        else if (selected && layout.placed[selected]) rotate(selected);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!ready) return <p style={{ padding: "40px 18px", color: T.sub, font: `0.875rem ${T.uiFont}` }}>Opening the door…</p>;

  const wallet = (
    <span title="Koban" style={{ display: "inline-flex", alignItems: "center", gap: 6, font: `700 1rem ${T.uiFont}`, color: T.ink }}>
      <KobanIcon size={15} /> {balance}
    </span>
  );

  // ————— the selected thing, described —————
  const selInfo = (() => {
    if (placing) {
      const c = BY_ID[placing.type];
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <ItemName c={c} />
          <span style={{ font: `0.8125rem/1.6 ${T.uiFont}`, color: T.sub }}>
            {c.kind === "wall" ? "Tap a green space on the wall to hang it." : "Tap a free spot on the floor."}
            {c.kind === "floor" && c.w !== c.d ? " Turn it first if it does not fit." : ""}
          </span>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {c.kind === "floor" && c.w !== c.d && <button className="ts-btn ts-btn-washi" onClick={() => setPlacing({ ...placing, rot: placing.rot ? 0 : 1 })}>Turn</button>}
            <button className="ts-btn ts-btn-washi" onClick={() => { setPlacing(null); setHover(null); }}>Cancel</button>
          </div>
        </div>
      );
    }
    if (selected === "anchor") {
      const tables = CATALOG.filter((c) => c.kind === "anchor" && owned[c.id] != null);
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span lang="ja" style={{ font: `700 1.25rem ${T.jpFont}` }}>{STUDY.labelJa}</span>
            <span style={{ font: `0.8125rem ${T.uiFont}`, color: T.sub }}>your study spot</span>
          </span>
          {tables.length === 0 ? (
            <span style={{ font: `0.8125rem/1.6 ${T.uiFont}`, color: T.sub }}>
              Where you sit to study. A table for it is in the shop.
            </span>
          ) : (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {tables.map((c) => (
                <button key={c.id} className="rm-opt" aria-pressed={layout.anchor === c.id}
                        onClick={() => saveLayout({ ...layout, anchor: c.id })}>
                  <span lang="ja" style={{ font: `700 1rem ${T.jpFont}` }}>{c.jp}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }
    if (selected && BY_ID[selected]) {
      const c = BY_ID[selected];
      const onFloor = layout.placed[selected] != null;
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <ItemName c={c} />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {onFloor && c.w !== c.d && <button className="ts-btn ts-btn-washi" onClick={() => rotate(selected)}>Turn</button>}
            <button className="ts-btn ts-btn-washi" onClick={() => putAway(selected)}>Put away</button>
          </div>
          {onFloor && <span style={{ font: `0.75rem ${T.uiFont}`, color: T.muted }}>Drag it to move it.</span>}
        </div>
      );
    }
    return null;
  })();

  return (
    <div style={{ padding: "14px 16px 36px", display: "flex", flexDirection: "column", gap: 14 }}>
      <style>{CSS}</style>
      <ShellSlot name="tabs">
        <div className="ts-tabs" role="tablist" aria-label="Your room">
          {[["room", "Room"], ["shop", "Shop"], ["you", "You"]].map(([id, name]) => (
            <button key={id} role="tab" aria-selected={view === id} onClick={() => { setView(id); setPlacing(null); setSelected(null); }}>{name}</button>
          ))}
        </div>
      </ShellSlot>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <span style={{ display: "flex", alignItems: "baseline", gap: 8, minWidth: 0 }}>
          <span lang="ja" style={{ font: `700 1.125rem ${T.jpFont}`, color: "var(--ts-on-tatami, #4A463D)" }}>{home.jp}</span>
          <span style={{ font: `0.8125rem ${T.uiFont}`, color: "var(--ts-on-tatami, #4A463D)" }}>{home.en}</span>
        </span>
        <span className="ts-card" style={{ padding: "6px 12px", borderRadius: 12 }}>{wallet}</span>
      </div>

      {note && (
        <div role="status" className="ts-card" style={{ padding: "10px 14px", font: `0.875rem ${T.uiFont}`, color: T.ink }}>{note}</div>
      )}

      {view === "room" && (
        <>
          {/* The first-open card sits ABOVE the scene, not over it: on a phone
              the scene is shorter than the card, and an overlay clipped its
              first line. The room it is talking about stays in view. */}
          {!layout.introSeen && (
            <div role="dialog" aria-label="Welcome home" className="ts-card ts-rise"
                 style={{ padding: "16px 18px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
              {INTRO.map((p, i) => <p key={i} style={{ margin: 0, font: `0.9375rem/1.65 ${T.uiFont}` }}>{p}</p>)}
              <button className="ts-btn ts-btn-shu" style={{ minHeight: 48 }} onClick={() => saveLayout({ ...layout, introSeen: true })}>
                Let’s decorate
              </button>
            </div>
          )}
          <div className="ts-card" style={{ padding: 6, position: "relative", overflow: "hidden" }}>
            <svg ref={svgRef} viewBox={`0 0 ${G.W.toFixed(0)} ${G.H.toFixed(0)}`} role="img"
                 aria-label={`Your ${home.en}: tatami floor, your study spot${layout.anchor ? " with a " + BY_ID[layout.anchor].en.split(" — ")[0] : ""}, you seated there, and the cat`}
                 style={{ display: "block", width: "100%", height: "auto", touchAction: "none", userSelect: "none" }}
                 onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
                 dangerouslySetInnerHTML={{ __html: sceneSVG }} />
          </div>

          {awaySince > 0 && (
            <p style={{ margin: 0, font: `0.8125rem/1.6 ${T.uiFont}`, color: "var(--ts-on-tatami, #4A463D)" }}>
              The cat has been keeping something for you: +{awaySince} <KobanIcon size={11} /> since you last looked in.
            </p>
          )}

          {selInfo && <div className="ts-card" style={{ padding: "12px 14px" }}>{selInfo}</div>}

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ ...label, color: "var(--ts-on-tatami, #6E6A60)" }}>TO PLACE</span>
            {inventory.length ? (
              <div className="rm-inv">
                {inventory.map((c) => (
                  <button key={c.id} aria-pressed={!!placing && placing.type === c.id}
                          onClick={() => { setSelected(null); setPlacing(placing && placing.type === c.id ? null : { type: c.id, rot: 0 }); }}>
                    <span dangerouslySetInnerHTML={{ __html: previewSVG(c.id) }} />
                    <span lang="ja" style={{ font: `700 0.875rem ${T.jpFont}` }}>{c.jp}</span>
                  </button>
                ))}
              </div>
            ) : (
              <span style={{ font: `0.8125rem/1.6 ${T.uiFont}`, color: "var(--ts-on-tatami, #4A463D)" }}>
                {CATALOG.some((c) => owned[c.id] != null && (c.kind === "floor" || c.kind === "wall"))
                  ? "Everything you own is out." : "Nothing to place yet."} <button className="ts-link" style={{ padding: "0 2px", minHeight: 0 }} onClick={() => setView("shop")}>The shop</button> has more.
              </span>
            )}
          </div>
          <p style={{ margin: 0, font: `0.75rem/1.6 ${T.uiFont}`, color: "var(--ts-on-tatami, #6E6A60)" }}>
            Tap something in the room to move, turn or put it away.
          </p>
        </>
      )}

      {view === "shop" && (
        <Shop owned={owned} balance={balance} layout={layout} cap={cap} nextHome={nextHome}
              onBuy={buyItem} onMove={moveHome} onPlace={(id) => { setView("room"); setPlacing({ type: id, rot: 0 }); }} />
      )}

      {view === "you" && (
        <You ch={ch} owned={owned} balance={balance}
             onWear={(slot, id) => saveChar({ ...ch, [slot]: id })}
             onBuy={async (slot, o) => { if (await buy(o.id, o.price, o.jp)) { saveChar({ ...ch, [slot]: o.id }); flash(`${o.jp} — on.`); } }} />
      )}
    </div>
  );
}

function ItemName({ c }) {
  return (
    <span style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
      <span lang="ja" style={{ font: `700 1.25rem ${T.jpFont}` }}>{c.jp}</span>
      <span lang="ja" style={{ font: `0.8125rem ${T.uiFont}`, color: T.shu }}>{c.reading}</span>
      <span style={{ font: `0.8125rem ${T.uiFont}`, color: T.sub }}>{c.en}</span>
    </span>
  );
}

// ————— The shop —————
// Browsed, not completed: grouped by what things are, never counted. The
// Japanese name leads and the picture sits beside it — the condition Lloyd set
// for Japanese-only names (Session 11). Reading the shop is a reading exercise
// the learner chooses to do, which is the room's real defence against being a
// gem store.
function Shop({ owned, balance, layout, cap, nextHome, onBuy, onMove, onPlace }) {
  const groups = [
    { title: "FOR THE ROOM", items: CATALOG.filter((c) => c.kind === "floor" || c.kind === "anchor") },
    { title: "FOR THE WALLS", items: CATALOG.filter((c) => c.kind === "wall") },
    { title: "COLOURS AND TEXTURES", items: CATALOG.filter((c) => c.kind === "style" && (!c.needs || owned[c.needs] != null)) },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {nextHome && (
        <div className="ts-card" style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={label}>A BIGGER HOME</span>
          <span style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
            <span lang="ja" style={{ font: `700 1.375rem ${T.jpFont}` }}>{nextHome.jp}</span>
            <span lang="ja" style={{ font: `0.8125rem ${T.uiFont}`, color: T.shu }}>{nextHome.reading}</span>
            <span style={{ font: `0.8125rem ${T.uiFont}`, color: T.sub }}>{nextHome.en}</span>
          </span>
          {cap.ready ? (
            <>
              <span style={{ font: `0.875rem/1.6 ${T.uiFont}`, color: T.sub }}>
                Your Japanese has grown enough for a bigger place. Everything you own comes with you.
              </span>
              <button className="ts-btn ts-btn-shu" style={{ minHeight: 48 }} disabled={balance < nextHome.price} onClick={() => onMove(nextHome)}>
                Move for {nextHome.price} <KobanIcon size={14} />
              </button>
            </>
          ) : (
            <span style={{ font: `0.875rem/1.6 ${T.uiFont}`, color: T.sub }}>
              Opens as your Japanese grows: once you can write both kana scripts, or have practised with {MOVE_WORDS} words.
            </span>
          )}
        </div>
      )}
      {groups.map((g) => g.items.length > 0 && (
        <div key={g.title} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={{ ...label, color: "var(--ts-on-tatami, #6E6A60)" }}>{g.title}</span>
          <div className="rm-grid">
            {g.items.map((c) => {
              const has = owned[c.id] != null;
              const out = layout.placed[c.id] != null || layout.wall[c.id] != null || layout.anchor === c.id || (layout.style || {})[c.slot] === c.id;
              return (
                <div key={c.id} className="ts-card" style={{ padding: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                  <div className="rm-prev" dangerouslySetInnerHTML={{ __html: previewSVG(c.id) }} />
                  <span style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
                    <span lang="ja" style={{ font: `700 1.0625rem ${T.jpFont}` }}>{c.jp}</span>
                    <span lang="ja" style={{ font: `0.75rem ${T.uiFont}`, color: T.shu }}>{c.reading}</span>
                  </span>
                  <span style={{ font: `0.75rem/1.5 ${T.uiFont}`, color: T.sub, flex: 1 }}>{c.en}</span>
                  {has ? (
                    c.kind === "floor" || c.kind === "wall" ? (
                      out ? <span style={{ font: `700 0.8125rem ${T.uiFont}`, color: T.ok, minHeight: 36, display: "flex", alignItems: "center" }}>In your room</span>
                          : <button className="ts-btn ts-btn-washi" style={{ minHeight: 40 }} onClick={() => onPlace(c.id)}>Place it</button>
                    ) : (
                      <span style={{ font: `700 0.8125rem ${T.uiFont}`, color: T.ok, minHeight: 36, display: "flex", alignItems: "center" }}>
                        {out ? "In your room" : "Yours"}
                      </span>
                    )
                  ) : (
                    <button className="ts-btn ts-btn-washi" style={{ minHeight: 40, justifyContent: "space-between" }}
                            disabled={balance < c.price} onClick={() => onBuy(c)}
                            aria-label={`Buy ${c.en} for ${c.price} koban`}>
                      <span>Buy</span><span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>{c.price} <KobanIcon size={12} /></span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <p style={{ margin: 0, font: `0.75rem/1.6 ${T.uiFont}`, color: "var(--ts-on-tatami, #6E6A60)" }}>
        Koban come from your study — finishing kana lessons, completing words, the daily challenge, a path of goals. Spending them never undoes any of it.
      </p>
    </div>
  );
}

// ————— You —————
// Four slots, one pose (Notion §7). The portrait and the figure at the study
// spot are drawn by the same function, so they always agree.
function You({ ch, owned, balance, onWear, onBuy }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="ts-card" style={{ padding: 12, display: "flex", justifyContent: "center" }}>
        <div style={{ width: 150 }} dangerouslySetInnerHTML={{ __html: avatarPreviewSVG(ch) }} />
      </div>
      {Object.entries(AVATAR).map(([slot, opts]) => (
        <div key={slot} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ ...label, color: "var(--ts-on-tatami, #6E6A60)" }}>{SLOT_NAMES[slot].toUpperCase()}</span>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {opts.map((o) => {
              const has = o.price === 0 || owned[o.id] != null;
              const on = (ch[slot] || AV_DEFAULT[slot]) === o.id;
              return (
                <button key={o.id} className="rm-opt" aria-pressed={on}
                        disabled={!has && balance < o.price}
                        style={!has && balance < o.price ? { opacity: .55, cursor: "default" } : null}
                        onClick={() => (has ? onWear(slot, o.id) : onBuy(slot, o))}
                        aria-label={has ? `Wear ${o.en}` : `Buy ${o.en} for ${o.price} koban`}>
                  <span lang="ja" style={{ font: `700 0.9375rem ${T.jpFont}` }}>{o.jp}</span>
                  <span style={{ font: `0.6875rem ${T.uiFont}`, color: T.sub }}>{o.en}</span>
                  {!has && <span style={{ font: `700 0.75rem ${T.uiFont}`, display: "inline-flex", alignItems: "center", gap: 3 }}>{o.price} <KobanIcon size={10} /></span>}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
