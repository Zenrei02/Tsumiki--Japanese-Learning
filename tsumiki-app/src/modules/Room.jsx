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

   LLOYD'S CALLS FOR THIS PASS (Oct 4 2026): Room v1 + economy, no auth ·
   wallet in the room/shop only (R-1) · the §4 ladder (R-2) · avatar seated
   at the study spot, quests pay koban only (R-4). v2, same day: the garden
   and bonsai spots with their two overlays (Notion §5.2, §6).

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
const GARDEN_KEY = "tsumiki-garden-state-v1";   // { v, t, style, trimmedAt, growth, rake } — most recent wins
// Read here for the bonsai's growth — the engagement layer's days of REAL
// study (opening the app is not one), kept for 120 days.
const ENGAGEMENT_KEY = "tsumiki-engagement-v1";
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
  { id: "bonsai",   jp: "盆栽",   reading: "ぼんさい",   en: "bonsai — grows as you study", price: 160, kind: "spot", spot: "bonsai" },
  { id: "karesansui", jp: "枯山水", reading: "かれさんすい", en: "sand garden — rake it", price: 150, kind: "spot", spot: "garden" },
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
  // The bonsai's pot, species and moss (Notion §6.3: koban buy these — never
  // growth). A new species is a new object class, so it prices in the regular
  // band; a pot colour and moss are variants.
  { id: "momiji",        jp: "紅葉",         reading: "もみじ",             en: "maple — a second species", price: 50, kind: "style", slot: "species", leaf: "#C9503A", leafHi: "#E07A4F", needs: "bonsai" },
  { id: "hachi-seiji",   jp: "青磁の鉢",     reading: "せいじのはち",       en: "celadon pot",           price: 12, kind: "style", slot: "pot", color: "#8FB6A6", shade: "#6E9C8B", needs: "bonsai" },
  { id: "koke",          jp: "苔",           reading: "こけ",               en: "moss for the pot",      price: 15, kind: "style", slot: "moss", color: "#6E8F3E", needs: "bonsai" },
];
const BY_ID = Object.fromEntries(CATALOG.map((c) => [c.id, c]));

// The default look of each style slot — owned by everyone, costs nothing.
const STYLE_DEFAULT = {
  wall: { color: "#EFE7D6", edge: "#D8CDB8" },
  tatami: { color: "#B7B98A", alt: "#ADAF80", line: "#83855D" },
  blanket: { color: "#C96F4A", shade: "#B25E3C" },
  species: { leaf: "#4E7A45", leafHi: "#6E9C5E" },   // 松, the pine every bonsai starts as
  pot: { color: "#7A5A3C", shade: "#5C4229" },
  moss: null,
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
   Each spot is a fixed place in the room. `item` is what you buy to fill it
   (null for the study spot, which is always yours); `overlay` is the
   mini-game it opens. The tiles stay reserved before the spot is filled, so
   buying it never has to push furniture out of the way.
   -------------------------------------------------------------------------*/

const SPOTS = [
  { id: "study",  labelJa: "座卓", tiles: { gx: 1, gy: 1, w: 2, d: 2 }, seat: { gx: 1, gy: 3 }, avatarPose: "seiza", item: null, overlay: null },
  { id: "garden", labelJa: "庭",   tiles: { gx: 3, gy: 1, w: 2, d: 2 }, item: "karesansui", overlay: "rake", verb: "Rake the sand" },
  { id: "bonsai", labelJa: "盆栽", tiles: { gx: 0, gy: 4, w: 1, d: 1 }, item: "bonsai", overlay: "trim", verb: "Tend the tree" },
];
const STUDY = SPOTS[0];
STUDY.table = STUDY.tiles;
const SPOT_BY_ID = Object.fromEntries(SPOTS.map((sp) => [sp.id, sp]));

/* ---------------------------------------------------------------------------
   4b. THE GARDEN (Notion §6)
   No score, no fail state, no koban for playing — each overlay has a verb
   that satisfies without being graded.

   THE BONSAI GROWS ONLY FROM STUDY (§6.3). Growth is the number of distinct
   days, after the tree was bought, on which real study happened — the
   engagement layer's activeDays, plus the days koban were earned (which only
   study pays). It is stored as a high-water mark so it can never shrink when
   activeDays ages out old days. Koban buy the pot, the species, the moss;
   nothing here sells growth.

   IT SELF-REGULATES (§6.1): study grows the tree out past its shape; trimming
   brings it back to one of three trained styles. Stop studying and there is
   nothing to trim — absence is quiet, never punished. Trimming PICKS A
   SILHOUETTE; it never cuts freely, so the drawing matrix stays finite:
   maturity (0–3) × overgrowth (0–3) × style (3) × species (2).
   -------------------------------------------------------------------------*/

const STYLES = [
  { id: "chokkan", jp: "直幹",   reading: "ちょっかん", en: "formal upright" },
  { id: "moyogi",  jp: "模様木", reading: "もようぎ",   en: "informal upright" },
  { id: "kengai",  jp: "懸崖",   reading: "けんがい",   en: "cascade" },
];
const TRIM_AFTER = 2;     // study days of overgrowth before there is anything to trim
const MATURE_EVERY = 4;   // study days per step of maturity
const BLANK_GARDEN = { v: 1, t: 0, style: "moyogi", trimmedAt: 0, growth: 0, rake: [] };

const dayOf = (ts) => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
// Distinct study days after `since` (a timestamp). Ledger earns count, spends
// and the migrated opening balance do not.
function studyDaysSince(led, engagement, since) {
  const from = dayOf(since || 0);
  const days = new Set();
  for (const e of (led && led.events) || []) {
    if (e.d > 0 && e.ts > 0 && e.s !== "migration") { const k = dayOf(e.ts); if (k > from) days.add(k); }
  }
  for (const k of (engagement && Array.isArray(engagement.activeDays) ? engagement.activeDays : [])) {
    if (typeof k === "string" && k > from) days.add(k);
  }
  return days.size;
}
function treeShape(g) {
  const over = Math.max(0, (g.growth || 0) - (g.trimmedAt || 0));
  return {
    style: STYLES.some((x) => x.id === g.style) ? g.style : "moyogi",
    maturity: Math.min(3, Math.floor((g.growth || 0) / MATURE_EVERY)),
    shag: Math.min(3, over),
    canTrim: over >= TRIM_AFTER,
  };
}

/* ---------------------------------------------------------------------------
   5. THE AVATAR — WHO YOU ARE, THEN WHAT YOU WEAR (Lloyd, Oct 4 2026)
   Two layers, kept apart on purpose:

   · BASE — skin, body, hair, hair colour, eyes. Chosen by the learner on
     their first visit, before anything else, and FREE, always: who someone is
     is not for sale, and it can be changed any time from the You tab.
   · WEAR — clothes and accessories over the base. A plain starter outfit is
     everyone's; the rest are variants at 8–15, the surplus valve (§4.1).

   This widens Notion §7 ("four slots, one fixed silhouette") at Lloyd's
   request. It stays affordable because nothing is per-combination art: the
   avatar is drawn in code, a body type is a width the clothes are drawn
   from, and so every top fits every body. Still one pose, seated.
   Body types are named by shape, never by gender.
   -------------------------------------------------------------------------*/

const BASE = {
  skin: [
    { id: "skin-1", color: "#F6E0C8" }, { id: "skin-2", color: "#EBC9A4" }, { id: "skin-3", color: "#D6A57A" },
    { id: "skin-4", color: "#A9724A" }, { id: "skin-5", color: "#6E4630" },
  ],
  body: [
    { id: "body-narrow", en: "narrow", w: .86 }, { id: "body-medium", en: "medium", w: 1 }, { id: "body-broad", en: "broad", w: 1.16 },
  ],
  hair: [
    { id: "short", en: "short" }, { id: "cropped", en: "cropped" }, { id: "bob", en: "bob" },
    { id: "long", en: "long" }, { id: "ponytail", en: "ponytail" }, { id: "bun", en: "bun" },
  ],
  hairColor: [
    { id: "hc-black", color: "#2C2A26" }, { id: "hc-brown", color: "#4E3423" }, { id: "hc-chestnut", color: "#7A4A2A" },
    { id: "hc-auburn", color: "#8E3B26" }, { id: "hc-blond", color: "#C9A060" }, { id: "hc-grey", color: "#A8A49C" },
    { id: "hc-indigo", color: "#2E3F66" },
  ],
  eyes: [
    { id: "eyes-calm", en: "calm" }, { id: "eyes-open", en: "open" }, { id: "eyes-smile", en: "smiling" },
  ],
};
const BASE_NAMES = { skin: "Skin", body: "Body", hair: "Hair", hairColor: "Hair colour", eyes: "Eyes" };
const BASE_DEFAULT = { skin: "skin-2", body: "body-medium", hair: "short", hairColor: "hc-black", eyes: "eyes-calm" };
const baseOf = (ch, k) => BASE[k].find((o) => o.id === ((ch.base || {})[k])) || BASE[k].find((o) => o.id === BASE_DEFAULT[k]);

// Wear. The first option in each slot is everyone's.
const WEAR = {
  top: [
    { id: "top-kinari",  jp: "生成りのシャツ", en: "undyed shirt", price: 0,  color: "#EFE6D2", shade: "#D8CDB8" },
    { id: "top-ai",      jp: "藍の羽織",     en: "indigo haori",  price: 8,  color: "#3D5A80", shade: "#30496A" },
    { id: "top-matcha",  jp: "抹茶色の服",   en: "matcha top",    price: 8,  color: "#7C8F55", shade: "#657544" },
    { id: "top-sakura",  jp: "桜色の服",     en: "cherry top",    price: 8,  color: "#D9A3A0", shade: "#C48A87" },
    { id: "top-parka",   jp: "パーカー",     en: "hoodie",        price: 12, color: "#6E6A60", shade: "#56534B", hood: true },
    { id: "top-yukata",  jp: "浴衣",         en: "yukata",        price: 15, color: "#F3EFE6", shade: "#DAD3C3", pattern: true },
  ],
  bottom: [
    { id: "bottom-sumi",   jp: "墨色のズボン",   en: "charcoal trousers", price: 0,  color: "#4A463D" },
    { id: "bottom-kinari", jp: "生成りのズボン", en: "undyed trousers",   price: 8,  color: "#D8CDB8" },
    { id: "bottom-skirt",  jp: "スカート",       en: "skirt",             price: 8,  color: "#8E3B26", flare: true },
    { id: "bottom-hakama", jp: "袴",             en: "hakama",            price: 12, color: "#5B4A7D", flare: true },
  ],
  head: [
    { id: "head-none",      jp: "なし",     en: "nothing",    price: 0 },
    { id: "head-hachimaki", jp: "鉢巻き",   en: "headband",   price: 10 },
    { id: "head-kanzashi",  jp: "簪",       en: "hairpin",    price: 12 },
    { id: "head-beret",     jp: "ベレー帽", en: "beret",      price: 12 },
  ],
  face: [
    { id: "face-none",   jp: "なし",   en: "nothing", price: 0 },
    { id: "face-megane", jp: "眼鏡",   en: "glasses", price: 10 },
  ],
  neck: [
    { id: "neck-none",    jp: "なし",     en: "nothing", price: 0 },
    { id: "neck-muffler", jp: "マフラー", en: "scarf",   price: 10 },
  ],
};
const WEAR_NAMES = { top: "Tops", bottom: "Bottoms", head: "On your head", face: "Glasses", neck: "Around your neck" };
const AV_BY_ID = Object.fromEntries(Object.values(WEAR).flat().map((o) => [o.id, o]));
const WEAR_DEFAULT = Object.fromEntries(Object.entries(WEAR).map(([k, opts]) => [k, opts[0].id]));
const wearOf = (ch, k) => AV_BY_ID[(ch.wear || {})[k]] || AV_BY_ID[WEAR_DEFAULT[k]];

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

/* ---- the avatar: seated, one pose ---- */
// Drawn around (x, y) = the point on the floor where the avatar sits, at
// scale k. One function serves the room, the portrait and character
// creation, so they cannot disagree about who you are or what you wear.
function drawAvatar(x, y, k, ch) {
  const skin = baseOf(ch, "skin").color, body = baseOf(ch, "body").w;
  const hair = baseOf(ch, "hair").id, hc = baseOf(ch, "hairColor").color, eyes = baseOf(ch, "eyes").id;
  const top = wearOf(ch, "top"), bottom = wearOf(ch, "bottom");
  const head = wearOf(ch, "head").id, face = wearOf(ch, "face").id, neck = wearOf(ch, "neck").id;
  const f = (n) => (n * k).toFixed(1);
  const X = (dx) => (x + dx * k).toFixed(1), Y = (dy) => (y + dy * k).toFixed(1);
  const sw = (n) => `stroke-width="${f(n)}"`;
  let s = `<ellipse cx="${X(0)}" cy="${Y(0)}" rx="${f(20 * body)}" ry="${f(7)}" fill="rgba(0,0,0,.14)"/>`;
  // long and ponytail hair fall behind the body
  if (hair === "long") s += `<path d="M ${X(-13)} ${Y(-48)} q ${f(-4)} ${f(22)} ${f(2)} ${f(34)} h ${f(22)} q ${f(6)} ${f(-12)} ${f(2)} ${f(-34)} z" fill="${hc}"/>`;
  if (hair === "ponytail") s += `<path d="M ${X(8)} ${Y(-56)} q ${f(14)} ${f(4)} ${f(10)} ${f(26)} q ${f(-3)} ${f(6)} ${f(-7)} ${f(2)} q ${f(4)} ${f(-14)} ${f(-6)} ${f(-24)} z" fill="${hc}"/>`;
  // THE BODY is drawn at width `body`: legs, torso and clothes inside one
  // horizontal scale, so every garment fits every body type.
  let b = "";
  const flare = bottom.flare ? 4 : 0;
  b += `<path d="M ${X(-17 - flare)} ${Y(-2)} q ${f(17 + flare)} ${f(8)} ${f(34 + 2 * flare)} 0 l ${f(-3 - flare)} ${f(-12)} q ${f(-14)} ${f(-5)} ${f(-28)} 0 z" fill="${bottom.color}" stroke="${S}" ${sw(1)}/>`;
  if (bottom.id === "bottom-hakama") b += `<path d="M ${X(-6)} ${Y(-12)} l ${f(-3)} ${f(10)} M ${X(6)} ${Y(-12)} l ${f(3)} ${f(10)}" stroke="#3E3258" ${sw(1.2)}/>`;
  b += `<path d="M ${X(-14)} ${Y(-11)} q ${f(-2)} ${f(-22)} ${f(5)} ${f(-28)} h ${f(18)} q ${f(7)} ${f(6)} ${f(5)} ${f(28)} z" fill="${top.color}" stroke="${S}" ${sw(1)}/>`;
  if (top.pattern) b += `<path d="M ${X(-8)} ${Y(-30)} l ${f(4)} ${f(4)} M ${X(2)} ${Y(-22)} l ${f(4)} ${f(4)} M ${X(-4)} ${Y(-16)} l ${f(4)} ${f(4)}" stroke="#3D5A80" ${sw(1.4)}/>`;
  if (top.hood) b += `<path d="M ${X(-10)} ${Y(-38)} q ${f(10)} ${f(8)} ${f(20)} 0" fill="none" stroke="${top.shade}" ${sw(3)}/><path d="M ${X(-2)} ${Y(-30)} v ${f(8)} M ${X(2)} ${Y(-30)} v ${f(8)}" stroke="#F3EFE6" ${sw(1)}/>`;
  else b += `<path d="M ${X(-4)} ${Y(-39)} l ${f(4)} ${f(9)} l ${f(4)} ${f(-9)}" stroke="${top.shade}" ${sw(1.6)} fill="none"/>`;
  b += `<ellipse cx="${X(0)}" cy="${Y(-12)}" rx="${f(7)}" ry="${f(3.5)}" fill="${skin}" stroke="${S}" ${sw(.8)}/>`;
  s += `<g transform="translate(${X(0)} 0) scale(${body} 1) translate(${(-(x)).toFixed(1)} 0)">${b}</g>`;
  if (neck === "neck-muffler") s += `<path d="M ${X(-9 * body)} ${Y(-38)} q ${f(9 * body)} ${f(5)} ${f(18 * body)} 0 v ${f(4)} q ${f(-9 * body)} ${f(5)} ${f(-18 * body)} 0 z" fill="${T.shu}" stroke="${S}" ${sw(.8)}/><path d="M ${X(4)} ${Y(-35)} l ${f(3)} ${f(12)} l ${f(4)} ${f(-1)} l ${f(-3)} ${f(-11)}" fill="#A92E17" stroke="${S}" ${sw(.6)}/>`;
  // head
  s += `<circle cx="${X(0)}" cy="${Y(-50)}" r="${f(11)}" fill="${skin}" stroke="${S}" ${sw(1)}/>`;
  // hair on top
  if (hair === "bun") s += `<circle cx="${X(0)}" cy="${Y(-64)}" r="${f(5.5)}" fill="${hc}"/>`;
  if (hair === "cropped") s += `<path d="M ${X(-11)} ${Y(-52)} q ${f(1)} ${f(-11)} ${f(11)} ${f(-10)} q ${f(10)} ${f(-1)} ${f(11)} ${f(10)} q ${f(-5)} ${f(-4)} ${f(-11)} ${f(-4)} q ${f(-6)} 0 ${f(-11)} ${f(4)} z" fill="${hc}"/>`;
  else s += `<path d="M ${X(-11.5)} ${Y(-50)} q ${f(1)} ${f(-14)} ${f(11.5)} ${f(-13)} q ${f(10.5)} ${f(-1)} ${f(11.5)} ${f(13)} q ${f(-5)} ${f(-6)} ${f(-11.5)} ${f(-6)} q ${f(-6.5)} 0 ${f(-11.5)} ${f(6)} z" fill="${hc}"/>`;
  if (hair === "bob") s += `<path d="M ${X(-11.5)} ${Y(-52)} q ${f(-3)} ${f(10)} ${f(1)} ${f(14)} h ${f(3)} v ${f(-14)} z M ${X(11.5)} ${Y(-52)} q ${f(3)} ${f(10)} ${f(-1)} ${f(14)} h ${f(-3)} v ${f(-14)} z" fill="${hc}"/>`;
  // eyes
  if (eyes === "eyes-open") s += `<circle cx="${X(-4)}" cy="${Y(-49)}" r="${f(1.4)}" fill="${S}"/><circle cx="${X(4)}" cy="${Y(-49)}" r="${f(1.4)}" fill="${S}"/>`;
  else if (eyes === "eyes-smile") s += `<path d="M ${X(-6)} ${Y(-48)} q ${f(2)} ${f(-2.5)} ${f(4)} 0 M ${X(2)} ${Y(-48)} q ${f(2)} ${f(-2.5)} ${f(4)} 0" stroke="${S}" ${sw(1.2)} fill="none" stroke-linecap="round"/>`;
  else s += `<path d="M ${X(-6)} ${Y(-49)} q ${f(2)} ${f(2)} ${f(4)} 0 M ${X(2)} ${Y(-49)} q ${f(2)} ${f(2)} ${f(4)} 0" stroke="${S}" ${sw(1.2)} fill="none" stroke-linecap="round"/>`;
  s += `<path d="M ${X(-2)} ${Y(-44)} q ${f(2)} ${f(1.5)} ${f(4)} 0" stroke="${S}" ${sw(1)} fill="none" stroke-linecap="round"/>`;
  // accessories
  if (face === "face-megane") s += `<g fill="none" stroke="#2C2A26" ${sw(1.1)}><circle cx="${X(-4)}" cy="${Y(-49)}" r="${f(3.4)}"/><circle cx="${X(4)}" cy="${Y(-49)}" r="${f(3.4)}"/><path d="M ${X(-.6)} ${Y(-49)} h ${f(1.2)}"/></g>`;
  if (head === "head-hachimaki") s += `<path d="M ${X(-11)} ${Y(-55)} q ${f(11)} ${f(-4)} ${f(22)} 0" stroke="#F3EFE6" ${sw(3)} fill="none"/><circle cx="${X(0)}" cy="${Y(-57)}" r="${f(1.8)}" fill="${T.shu}"/><path d="M ${X(10)} ${Y(-55)} l ${f(6)} ${f(5)} M ${X(10)} ${Y(-55)} l ${f(7)} ${f(1)}" stroke="#F3EFE6" ${sw(2)}/>`;
  if (head === "head-kanzashi") s += `<path d="M ${X(6)} ${Y(-58)} l ${f(9)} ${f(-6)}" stroke="#8B6B4A" ${sw(1.2)}/><circle cx="${X(15)}" cy="${Y(-64)}" r="${f(3.2)}" fill="#D9707A" stroke="${S}" ${sw(.6)}/>`;
  if (head === "head-beret") s += `<path d="M ${X(-12)} ${Y(-57)} q ${f(2)} ${f(-11)} ${f(14)} ${f(-10)} q ${f(11)} ${f(1)} ${f(10)} ${f(9)} z" fill="#7A2E2E" stroke="${S}" ${sw(.8)}/><circle cx="${X(2)}" cy="${Y(-67)}" r="${f(1.4)}" fill="#7A2E2E"/>`;
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

/* ---- the garden spots ---- */
// A spot not yet filled: dashed and labelled, the way the board marks things
// still to come — never an empty-looking reproach.
function drawSpotEmpty(iso, sp) {
  const t = sp.tiles;
  const f = [iso(t.gx, t.gy), iso(t.gx + t.w, t.gy), iso(t.gx + t.w, t.gy + t.d), iso(t.gx, t.gy + t.d)];
  const c = iso(t.gx + t.w / 2, t.gy + t.d / 2);
  return `<g data-spot="${sp.id}" style="cursor:pointer">` +
    poly(f, "rgba(251,247,238,.30)", "#8A7F6F", ' stroke-dasharray="6 5" stroke-width="1.4"') +
    `<text x="${c.x}" y="${c.y + 4}" text-anchor="middle" font-family='${T.jpFont}' font-size="12" font-weight="700" fill="#4A463D">${sp.labelJa}</text></g>`;
}

// The sand garden in the room: a low wooden tray, the three stones, and the
// learner's own grooves mapped onto its top face.
const RAKE_STONES = [[0.28, 0.38, 0.07], [0.68, 0.30, 0.05], [0.58, 0.70, 0.06]];
function drawGardenTray(iso, sp, rake) {
  const t = sp.tiles, H = 7;
  const top = (u, v) => { const p = iso(t.gx + .12 + u * (t.w - .24), t.gy + .12 + v * (t.d - .24)); return { x: p.x, y: p.y - H }; };
  let s = isoBox(iso, t.gx + .04, t.gy + .04, t.w - .08, t.d - .08, H, 0, "#6B4E2E", "#5C4229", "#4E3A28", S);
  s += poly([top(0, 0), top(1, 0), top(1, 1), top(0, 1)], "#E8E0C8", "#CFC4A8");
  for (const st of rake || []) {
    if (!Array.isArray(st) || st.length < 2) continue;
    const ptsStr = st.map(([u, v]) => { const q = top(u, v); return q.x.toFixed(1) + "," + q.y.toFixed(1); }).join(" ");
    s += `<polyline points="${ptsStr}" fill="none" stroke="#C9BE9E" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  for (const [u, v, r] of RAKE_STONES) {
    const q = top(u, v);
    s += `<ellipse cx="${q.x}" cy="${q.y}" rx="${(r * 60).toFixed(1)}" ry="${(r * 34).toFixed(1)}" fill="#8E8A80" stroke="${S}" stroke-width=".8"/>` +
         `<ellipse cx="${q.x}" cy="${q.y}" rx="${(r * 60 + 4).toFixed(1)}" ry="${(r * 34 + 2.5).toFixed(1)}" fill="none" stroke="#C9BE9E" stroke-width="1"/>`;
  }
  return `<g data-spot="${sp.id}" style="cursor:pointer">${s}</g>`;
}

// ONE BONSAI RENDERER, drawn straight-on — Notion §5.2 says the scene and the
// overlay may differ in pixels but must agree on STATE, and the surest way to
// agree is for both to read the same shape through the same function. The
// overlay draws it large; the room draws it small, standing on its stand.
const TRUNKS = {
  chokkan: "M100 162 C 99 140, 101 118, 100 92 C 99 80, 100 70, 100 58",
  moyogi:  "M100 162 C 82 140, 122 124, 102 104 C 86 90, 112 78, 100 60",
  kengai:  "M92 162 C 90 138, 104 124, 126 126 C 152 128, 166 146, 168 178",
};
const PADS = {
  chokkan: [[100, 60, 26, 12], [78, 92, 22, 10], [123, 112, 22, 10], [80, 128, 18, 8], [100, 40, 16, 9]],
  moyogi:  [[100, 60, 28, 13], [124, 100, 24, 11], [78, 112, 22, 10], [116, 136, 16, 8], [98, 40, 16, 9]],
  kengai:  [[92, 112, 24, 11], [128, 124, 22, 10], [158, 150, 20, 10], [170, 178, 16, 9], [104, 92, 16, 9]],
};
const SPRIGS = [[-30, -6], [32, -10], [-18, -22], [26, 14], [-34, 10], [6, -26], [38, 2], [-8, 18], [20, -24]];
function bonsaiSVG(shape, look, opts) {
  const o = opts || {};
  const sp = look.species, pot = look.pot;
  const pads = PADS[shape.style].slice(0, 2 + shape.maturity);
  const trunkW = 6 + shape.maturity * 1.6;
  let s = "";
  // pot and soil
  s += `<path d="M58 160 h84 l-8 24 h-68 z" fill="${pot.color}" stroke="${S}" stroke-width="1.2"/>`;
  s += `<rect x="54" y="155" width="92" height="8" rx="2" fill="${pot.shade}" stroke="${S}" stroke-width="1"/>`;
  s += `<ellipse cx="100" cy="156" rx="40" ry="4" fill="#5B4632"/>`;
  if (look.moss) s += `<path d="M64 157 q 8 -6 16 -1 q 9 -6 18 0 q 9 -6 18 0 q 8 -5 16 1 z" fill="${look.moss.color}" stroke="${S}" stroke-width=".7"/>`;
  // trunk
  s += `<path d="${TRUNKS[shape.style]}" fill="none" stroke="#5C4229" stroke-width="${trunkW.toFixed(1)}" stroke-linecap="round"/>`;
  s += `<path d="${TRUNKS[shape.style]}" fill="none" stroke="#7A5A3C" stroke-width="${(trunkW * .35).toFixed(1)}" stroke-linecap="round" opacity=".7"/>`;
  // foliage pads — the trained shape
  for (const [x, y, rx, ry] of pads) {
    s += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${sp.leaf}" stroke="${S}" stroke-width="1"/>`;
    s += `<ellipse cx="${x - rx * .25}" cy="${y - ry * .35}" rx="${rx * .55}" ry="${ry * .45}" fill="${sp.leafHi}" opacity=".85"/>`;
  }
  // overgrowth — study pushing the tree out past its shape
  const n = shape.shag * 3;
  for (let i = 0; i < n; i++) {
    const [px, py] = pads[i % pads.length];
    const [dx, dy] = SPRIGS[i % SPRIGS.length];
    s += `<path d="M${px} ${py} l ${dx * .8} ${dy * .8}" stroke="#5C4229" stroke-width="1.2"/>` +
         `<ellipse cx="${px + dx}" cy="${py + dy}" rx="7" ry="4.5" fill="${sp.leafHi}" stroke="${S}" stroke-width=".7"/>`;
  }
  return o.inner ? s : `<svg viewBox="0 0 220 200" aria-hidden="true">${s}</svg>`;
}
function drawBonsaiSpot(iso, sp, shape, look) {
  const t = sp.tiles;
  const c = iso(t.gx + .5, t.gy + .5);
  const k = .3;
  let s = isoBox(iso, t.gx + .18, t.gy + .18, .64, .64, 10, 0, "#5E4630", "#4E3A28", "#433222", S);
  s += `<g transform="translate(${(c.x - 100 * k).toFixed(1)} ${(c.y - 10 - 184 * k).toFixed(1)}) scale(${k})">${bonsaiSVG(shape, look, { inner: true })}</g>`;
  return `<g data-spot="${sp.id}" style="cursor:pointer">${s}</g>`;
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
  } else if (c.kind === "spot") {
    if (c.spot === "bonsai") return bonsaiSVG({ style: "moyogi", maturity: 2, shag: 0 }, { species: STYLE_DEFAULT.species, pot: STYLE_DEFAULT.pot, moss: null });
    const sp = SPOT_BY_ID[c.spot];
    const rel = (gx, gy) => iso(gx - sp.tiles.gx, gy - sp.tiles.gy);
    const demo = [[[0.05, 0.15], [0.95, 0.15]], [[0.05, 0.55], [0.4, 0.55], [0.5, 0.5], [0.95, 0.5]], [[0.05, 0.88], [0.95, 0.88]]];
    box = [rel(sp.tiles.gx, sp.tiles.gy + 2).x - 8, rel(sp.tiles.gx, sp.tiles.gy).y - 20, 4 * TW + 16, 4 * TH + 34];
    body = drawGardenTray(rel, { ...sp, tiles: { ...sp.tiles } }, demo);
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
  if (c.slot === "species" || c.slot === "pot" || c.slot === "moss") {
    const look = { species: STYLE_DEFAULT.species, pot: STYLE_DEFAULT.pot, moss: null };
    look[c.slot] = c;
    return bonsaiSVG({ style: "moyogi", maturity: 2, shag: 0 }, look);
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
// `created` is false until the learner has made their character. A v1
// character ({ hair, top, … } at the top level) keeps its clothes and is
// asked to make the rest, since who they are was never theirs to choose then.
const BLANK_CHAR = { v: 2, t: 0, created: false, base: { ...BASE_DEFAULT }, wear: { ...WEAR_DEFAULT } };
function normaliseChar(c) {
  if (!c) return { ...BLANK_CHAR };
  if (c.base) return { ...BLANK_CHAR, ...c, base: { ...BASE_DEFAULT, ...c.base }, wear: { ...WEAR_DEFAULT, ...(c.wear || {}) } };
  const wear = { ...WEAR_DEFAULT };
  if (AV_BY_ID[c.top]) wear.top = c.top;
  if (AV_BY_ID[c.bottom]) wear.bottom = c.bottom;
  if (c.acc === "acc-megane") wear.face = "face-megane";
  if (c.acc === "acc-hachimaki") wear.head = "head-hachimaki";
  if (c.acc === "acc-kanzashi") wear.head = "head-kanzashi";
  return { ...BLANK_CHAR, wear };
}

function homeOf(layout) { return HOMES.find((h) => h.id === layout.home) || HOMES[0]; }

function reserved(n) {
  const m = new Set();
  for (const sp of SPOTS) {
    const t = sp.tiles;
    for (let x = t.gx; x < t.gx + t.w; x++) for (let y = t.gy; y < t.gy + t.d; y++) m.add(x + "," + y);
    if (sp.seat) m.add(sp.seat.gx + "," + sp.seat.gy);
  }
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
const lookOf = (layout) => ({ species: styleOf(layout, "species"), pot: styleOf(layout, "pot"), moss: styleOf(layout, "moss") });

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
  const [garden, setGarden] = useState(BLANK_GARDEN);
  const [overlay, setOverlay] = useState(null);       // "rake" | "trim" | null
  const svgRef = useRef(null);

  // ————— load —————
  useEffect(() => {
    let alive = true;
    (async () => {
      const [led, o, l, c, capNow, gs, eng] = await Promise.all([
        readKoban(), loadJSON(OWNED_KEY, null), loadJSON(LAYOUT_KEY, null), loadJSON(CHARACTER_KEY, null), readCapability(),
        loadJSON(GARDEN_KEY, null), loadJSON(ENGAGEMENT_KEY, null),
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
      // Whatever you are wearing is yours. It matters once: the v1 haori was
      // everyone's for free and is a variant now, so a learner who wore it
      // must not find it for sale on their own back.
      const chNow = normaliseChar(c);
      for (const id of Object.values(chNow.wear)) {
        if (AV_BY_ID[id] && AV_BY_ID[id].price > 0 && ids[id] == null) { ids[id] = Date.now(); repaired = true; }
      }
      if (repaired) saveJSON(OWNED_KEY, { v: 1, ids });
      // The same for the home. Layout merges most-recent-wins, so an older
      // device's later edit could carry the small room back over a move that
      // was paid for. The ledger cannot lose that payment, so it decides.
      const lay = { ...BLANK_LAYOUT, ...(l || {}) };
      const layIdx = Math.max(0, HOMES.findIndex((x) => x.id === lay.home));
      if (paidHome != null && paidHome > layIdx) lay.home = HOMES[paidHome].id;
      // Furniture can only sit on free floor. Anything standing on a spot's
      // tiles (a layout from before that spot existed), or anything that is no
      // longer floor furniture at all, goes back to the inventory — owned
      // exactly as before, just not out.
      const placed = { ...(lay.placed || {}) };
      const resv = reserved(homeOf(lay).n);
      for (const [type, pl] of Object.entries(placed)) {
        const c0 = BY_ID[type];
        if (!c0 || c0.kind !== "floor") { delete placed[type]; continue; }
        const [w, d] = dims({ type, rot: pl.rot });
        let clash = false;
        for (let x = pl.gx; x < pl.gx + w; x++) for (let y = pl.gy; y < pl.gy + d; y++) if (resv.has(x + "," + y)) clash = true;
        if (clash) delete placed[type];
      }
      lay.placed = placed;
      if (lay.last && !placed[lay.last]) lay.last = null;
      // The bonsai's growth: study days since it was bought, never fewer
      // than were counted before (see 4b).
      const g0 = { ...BLANK_GARDEN, ...(gs || {}) };
      if (ids.bonsai != null) {
        const grown = Math.max(g0.growth || 0, studyDaysSince(led, eng, ids.bonsai));
        if (grown !== g0.growth) { g0.growth = grown; saveJSON(GARDEN_KEY, { ...g0, t: Date.now() }); }
      }
      setGarden(g0);
      const bal = kobanBalance(led);
      setOwned(ids);
      setLayout({ ...lay, placed: { ...placed }, wall: { ...(lay.wall || {}) }, style: { ...(lay.style || {}) } });
      setCh(normaliseChar(c));
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
  const saveGarden = (next) => {
    const v = { ...next, v: 1, t: Date.now() };
    setGarden(v); saveJSON(GARDEN_KEY, v);
  };
  const saveChar = (next) => {
    const v = { ...next, v: 2, t: Date.now() };
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
    } else if (c.kind === "spot") {
      // A new tree starts in shape: nothing to trim until study grows it out.
      if (c.spot === "bonsai") saveGarden({ ...garden, trimmedAt: garden.growth || 0 });
      flash(`${c.jp} is in your room. Tap it to ${c.spot === "bonsai" ? "tend it" : "rake it"}.`);
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
    const shape = treeShape(garden);
    for (const sp of SPOTS) {
      if (sp.id === "study") continue;
      const has = owned[sp.item] != null;
      const t2 = sp.tiles;
      const svg = !has ? drawSpotEmpty(iso, sp)
        : sp.id === "garden" ? drawGardenTray(iso, sp, garden.rake)
        : drawBonsaiSpot(iso, sp, shape, lookOf(layout));
      draws.push({ depth: t2.gx + t2.w + t2.gy + t2.d - (has ? 0 : 3), svg });
    }
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
  }, [layout, home.n, iso, slots, placing, hover, drag, selected, ch, awaySince, garden, owned]);

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
    const spotEl = ev.target.closest && ev.target.closest("[data-spot]");
    if (spotEl) {
      const sp = SPOT_BY_ID[spotEl.dataset.spot];
      if (sp && owned[sp.item] != null) { setSelected(null); setOverlay(sp.overlay); }
      else setSelected("spot:" + spotEl.dataset.spot);
      return;
    }
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

  // FIRST, WHO IS MOVING IN (Lloyd, Oct 4 2026). Before the room, the shop or
  // the welcome card: the learner makes their character, on their own, for
  // free. Nothing here is bought and nothing is graded.
  if (!ch.created) {
    return (
      <div style={{ padding: "14px 16px 36px" }}>
        <style>{CSS}</style>
        <Creator initial={ch} first onDone={(base) => saveChar({ ...ch, base, created: true })} />
      </div>
    );
  }

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
    if (selected && selected.startsWith("spot:")) {
      const sp = SPOT_BY_ID[selected.slice(5)];
      const c = BY_ID[sp.item];
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <ItemName c={c} />
          <span style={{ font: `0.8125rem/1.6 ${T.uiFont}`, color: T.sub }}>
            This corner is kept for it. It is in the shop when you want it.
          </span>
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

          {SPOTS.some((sp) => sp.overlay && owned[sp.item] != null) && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {SPOTS.filter((sp) => sp.overlay && owned[sp.item] != null).map((sp) => (
                <button key={sp.id} className="rm-opt" style={{ flex: "1 1 120px" }} onClick={() => setOverlay(sp.overlay)}>
                  <span lang="ja" style={{ font: `700 1.25rem ${T.jpFont}` }}>{sp.labelJa}</span>
                  <span style={{ font: `700 0.75rem ${T.uiFont}` }}>{sp.verb}</span>
                  {sp.id === "bonsai" && treeShape(garden).canTrim && (
                    <span style={{ font: `0.6875rem ${T.uiFont}`, color: T.sub }}>it has grown out</span>
                  )}
                </button>
              ))}
            </div>
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

      {overlay === "rake" && (
        <RakeOverlay rake={garden.rake} onClose={() => setOverlay(null)}
                     onSave={(rake) => saveGarden({ ...garden, rake })} />
      )}
      {overlay === "trim" && (
        <TrimOverlay garden={garden} look={lookOf(layout)} onClose={() => setOverlay(null)}
                     onTrim={(style) => saveGarden({ ...garden, style, trimmedAt: garden.growth || 0 })} />
      )}

      {view === "shop" && (
        <Shop owned={owned} balance={balance} layout={layout} cap={cap} nextHome={nextHome}
              onBuy={buyItem} onMove={moveHome} onPlace={(id) => { setView("room"); setPlacing({ type: id, rot: 0 }); }} />
      )}

      {view === "you" && (
        <You ch={ch} owned={owned} balance={balance}
             onBase={(base) => { saveChar({ ...ch, base }); flash("Looking good."); }}
             onWear={(slot, id) => saveChar({ ...ch, wear: { ...ch.wear, [slot]: id } })}
             onBuy={async (slot, o) => { if (await buy(o.id, o.price, o.jp)) { saveChar({ ...ch, wear: { ...ch.wear, [slot]: o.id } }); flash(`${o.jp} — on.`); } }} />
      )}
    </div>
  );
}

// ————— The overlays (Notion §5.2, §6) —————
// They cover the scene, as decided Sep 10: a different camera, straight-on,
// because the learner is dragging on something they need to see. No score,
// no fail state, nothing paid — the reward is the thing itself.
function Overlay({ jp, title, onClose, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const prev = document.activeElement;
    ref.current && ref.current.focus();
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); prev && prev.focus && prev.focus(); };
  }, []);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(44,42,38,.42)", display: "flex",
                  alignItems: "center", justifyContent: "center", padding: 14 }}
         onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={ref} tabIndex={-1} role="dialog" aria-label={title} className="ts-card"
           style={{ width: "100%", maxWidth: 440, maxHeight: "92vh", overflowY: "auto", padding: "14px 16px 16px",
                    display: "flex", flexDirection: "column", gap: 10, outline: "none" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span lang="ja" style={{ font: `700 1.375rem ${T.jpFont}` }}>{jp}</span>
            <span style={{ font: `700 1rem ${T.uiFont}` }}>{title}</span>
          </span>
          <button className="ts-icon" aria-label="Close" onClick={onClose}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Rake: drag to leave grooves. The path persists as `rake` — a list of
// strokes, each a list of [u, v] in 0–1 — so the room can draw it too.
const RAKE_W = 320, RAKE_H = 210, RAKE_MAX_STROKES = 40, RAKE_MAX_POINTS = 1600;
function RakeOverlay({ rake, onSave, onClose }) {
  const [strokes, setStrokes] = useState(() => (Array.isArray(rake) ? rake : []));
  const [live, setLive] = useState(null);
  const svg = useRef(null);
  const uv = (e) => {
    const r = svg.current.getBoundingClientRect();
    const u = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const v = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    return [+u.toFixed(3), +v.toFixed(3)];
  };
  const total = strokes.reduce((n, st) => n + st.length, 0);
  const down = (e) => { try { svg.current.setPointerCapture(e.pointerId); } catch (x) {} setLive([uv(e)]); };
  const move = (e) => {
    if (!live) return;
    const p = uv(e), q = live[live.length - 1];
    if (Math.hypot(p[0] - q[0], p[1] - q[1]) >= 0.012) setLive([...live, p]);
  };
  const up = (e) => {
    if (!live) return;
    // The release point counts: a quick flick can end in the same event as
    // its last move, and the groove would otherwise stop short of the finger.
    if (e && e.type === "pointerup") {
      const p = uv(e), q = live[live.length - 1];
      if (Math.hypot(p[0] - q[0], p[1] - q[1]) >= 0.004) live.push(p);
    }
    if (live.length > 1) {
      // Oldest grooves are smoothed away first once the sand is full, the way
      // a real garden is re-raked rather than refusing a new line.
      let next = [...strokes, live];
      while (next.length > RAKE_MAX_STROKES || next.reduce((n, st) => n + st.length, 0) > RAKE_MAX_POINTS) next = next.slice(1);
      setStrokes(next); onSave(next);
    }
    setLive(null);
  };
  const line = (st, i) => {
    const d = st.map(([u, v]) => (u * RAKE_W).toFixed(1) + "," + (v * RAKE_H).toFixed(1)).join(" ");
    return (
      <g key={i}>
        <polyline points={d} fill="none" stroke="#C9BE9E" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={d} fill="none" stroke="#F3EDDC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" transform="translate(-1 -1)" />
      </g>
    );
  };
  return (
    <Overlay jp="庭" title="Rake the sand" onClose={onClose}>
      <svg ref={svg} viewBox={`0 0 ${RAKE_W} ${RAKE_H}`} role="img" aria-label="Sand garden — drag to rake grooves"
           style={{ width: "100%", height: "auto", display: "block", borderRadius: 10, touchAction: "none", cursor: "crosshair",
                    boxShadow: "inset 0 0 0 6px #6B4E2E" }}
           onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        <rect width={RAKE_W} height={RAKE_H} fill="#E8E0C8" />
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1="10" x2={RAKE_W - 10} y1={22 + i * 21} y2={22 + i * 21} stroke="#DDD3B6" strokeWidth="1.2" />
        ))}
        {strokes.map(line)}
        {live && live.length > 1 && line(live, "live")}
        {RAKE_STONES.map(([u, v, r], i) => (
          <g key={"s" + i}>
            <ellipse cx={u * RAKE_W} cy={v * RAKE_H + 4} rx={r * RAKE_W} ry={r * RAKE_W * .55} fill="rgba(0,0,0,.12)" />
            <ellipse cx={u * RAKE_W} cy={v * RAKE_H} rx={r * RAKE_W} ry={r * RAKE_W * .62} fill="#8E8A80" stroke={S} strokeWidth="1.2" />
            <ellipse cx={u * RAKE_W - r * 60} cy={v * RAKE_H - r * 40} rx={r * RAKE_W * .4} ry={r * RAKE_W * .2} fill="#A9A59B" />
          </g>
        ))}
      </svg>
      <p style={{ margin: 0, font: `0.8125rem/1.6 ${T.uiFont}`, color: T.sub }}>
        Drag to draw grooves around the stones. Whatever you leave here is how the garden looks in your room.
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button className="ts-btn ts-btn-washi" disabled={!total} onClick={() => { setStrokes([]); onSave([]); }}>Smooth the sand</button>
        <button className="ts-btn ts-btn-wood" style={{ minHeight: 44, marginLeft: "auto" }} onClick={onClose}>Done</button>
      </div>
    </Overlay>
  );
}

// Trim: choose a silhouette. Before and after side by side is the reward.
function TrimOverlay({ garden, look, onTrim, onClose }) {
  const shape = treeShape(garden);
  const [pick, setPick] = useState(shape.style);
  const [done, setDone] = useState(null);         // the shape before the trim, kept to show the change
  const after = { ...shape, style: pick, shag: 0 };
  const sp = look.species === STYLE_DEFAULT.species ? "松 · pine" : `${look.species.jp} · ${look.species.en.split(" — ")[0]}`;
  return (
    <Overlay jp="盆栽" title="Tend the tree" onClose={onClose}>
      {done ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <figure style={{ margin: 0, textAlign: "center" }}>
              <div dangerouslySetInnerHTML={{ __html: bonsaiSVG(done, look) }} />
              <figcaption style={{ font: `0.75rem ${T.uiFont}`, color: T.sub }}>before</figcaption>
            </figure>
            <figure style={{ margin: 0, textAlign: "center" }}>
              <div dangerouslySetInnerHTML={{ __html: bonsaiSVG(after, look) }} />
              <figcaption style={{ font: `0.75rem ${T.uiFont}`, color: T.sub }}>after</figcaption>
            </figure>
          </div>
          <p style={{ margin: 0, font: `0.875rem/1.6 ${T.uiFont}`, color: T.sub }}>
            Back in shape — {STYLES.find((x) => x.id === pick).jp}. It will grow out again as you study.
          </p>
          <button className="ts-btn ts-btn-wood" style={{ minHeight: 44 }} onClick={onClose}>Done</button>
        </>
      ) : (
        <>
          <div style={{ background: "#F1EADB", borderRadius: 10 }} dangerouslySetInnerHTML={{ __html: bonsaiSVG(shape.canTrim ? shape : after, look) }} />
          <span style={{ font: `0.75rem ${T.uiFont}`, color: T.muted }}>{sp}</span>
          {shape.canTrim ? (
            <>
              <p style={{ margin: 0, font: `0.875rem/1.6 ${T.uiFont}`, color: T.sub }}>
                Your study has grown it out past its shape. Choose the shape to bring it back to.
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {STYLES.map((st) => (
                  <button key={st.id} className="rm-opt" style={{ flex: "1 1 90px" }} aria-pressed={pick === st.id} onClick={() => setPick(st.id)}>
                    <span lang="ja" style={{ font: `700 1rem ${T.jpFont}` }}>{st.jp}</span>
                    <span lang="ja" style={{ font: `0.6875rem ${T.uiFont}`, color: T.shu }}>{st.reading}</span>
                    <span style={{ font: `0.6875rem ${T.uiFont}`, color: T.sub }}>{st.en}</span>
                  </button>
                ))}
              </div>
              <button className="ts-btn ts-btn-shu" style={{ minHeight: 48 }} onClick={() => { setDone(shape); onTrim(pick); }}>Trim</button>
            </>
          ) : (
            <p style={{ margin: 0, font: `0.875rem/1.6 ${T.uiFont}`, color: T.sub }}>
              It is in shape. It grows on the days you study — come back to it once it has grown out.
            </p>
          )}
        </>
      )}
    </Overlay>
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
    { title: "FOR THE ROOM", items: CATALOG.filter((c) => c.kind === "floor" || c.kind === "anchor" || c.kind === "spot") },
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
              const out = c.kind === "spot" || layout.placed[c.id] != null || layout.wall[c.id] != null || layout.anchor === c.id || (layout.style || {})[c.slot] === c.id;
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
        Clothes and accessories are under You. Koban come from your study — finishing kana lessons, completing words, the daily challenge, a path of goals. Spending them never undoes any of it.
      </p>
    </div>
  );
}

// ————— Character creation —————
// The learner's own choices, made first and free. Swatches for colours, words
// for shapes; the portrait updates as they choose. "Shuffle" is there for
// anyone who would rather not decide, and is a suggestion, not a commitment.
function Creator({ initial, first, onDone, onCancel }) {
  const [base, setBase] = useState({ ...BASE_DEFAULT, ...((initial && initial.base) || {}) });
  const preview = { ...initial, base };
  const pickRandom = () => setBase(Object.fromEntries(Object.entries(BASE).map(([k, opts]) => [k, opts[Math.floor(Math.random() * opts.length)].id])));
  const row = (k) => (
    <div key={k} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <span style={label}>{BASE_NAMES[k].toUpperCase()}</span>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {BASE[k].map((o) => (
          o.color ? (
            <button key={o.id} aria-pressed={base[k] === o.id} aria-label={`${BASE_NAMES[k]} ${BASE[k].indexOf(o) + 1}`}
                    onClick={() => setBase({ ...base, [k]: o.id })}
                    style={{ width: 44, height: 44, borderRadius: 22, border: 0, cursor: "pointer", background: o.color,
                             boxShadow: base[k] === o.id ? `0 0 0 3px ${T.washi}, 0 0 0 5.5px ${T.ok}` : `inset 0 0 0 1.5px rgba(0,0,0,.18)` }} />
          ) : (
            <button key={o.id} className="rm-opt" aria-pressed={base[k] === o.id} onClick={() => setBase({ ...base, [k]: o.id })}
                    style={{ minWidth: 64 }}>
              <span style={{ font: `700 0.8125rem ${T.uiFont}` }}>{o.en}</span>
            </button>
          )
        ))}
      </div>
    </div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="ts-card" style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={label}>{first ? "BEFORE YOU MOVE IN" : "HOW YOU LOOK"}</span>
        <span style={{ font: `700 1.25rem/1.3 ${T.uiFont}` }}>{first ? "Who’s moving in?" : "Change how you look"}</span>
        <span style={{ font: `0.875rem/1.6 ${T.uiFont}`, color: T.sub }}>
          {first ? "Make yourself. None of this costs anything, and you can change it whenever you like."
                 : "Always free. Your clothes stay as they are."}
        </span>
      </div>
      <div className="ts-card" style={{ padding: 12, display: "flex", justifyContent: "center" }}>
        <div style={{ width: 150 }} dangerouslySetInnerHTML={{ __html: avatarPreviewSVG(preview) }} />
      </div>
      <div className="ts-card" style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
        {Object.keys(BASE).map(row)}
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button className="ts-btn ts-btn-washi" onClick={pickRandom}>Shuffle</button>
        {onCancel && <button className="ts-btn ts-btn-washi" onClick={onCancel}>Cancel</button>}
        <button className="ts-btn ts-btn-shu" style={{ flex: 1, minHeight: 52 }} onClick={() => onDone(base)}>
          {first ? "Move in" : "Keep this look"}
        </button>
      </div>
    </div>
  );
}

// ————— You —————
// Who you are (free, any time) above what you wear (a starter outfit, then
// clothes and accessories bought with koban). The portrait and the figure at
// the study spot are drawn by the same function, so they always agree.
function You({ ch, owned, balance, onBase, onWear, onBuy }) {
  const [editing, setEditing] = useState(false);
  if (editing) return <Creator initial={ch} onDone={(base) => { onBase(base); setEditing(false); }} onCancel={() => setEditing(false)} />;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="ts-card" style={{ padding: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <div style={{ width: 150 }} dangerouslySetInnerHTML={{ __html: avatarPreviewSVG(ch) }} />
        <button className="ts-btn ts-btn-washi" onClick={() => setEditing(true)}>Change how you look</button>
      </div>
      <span style={{ ...label, color: "var(--ts-on-tatami, #6E6A60)" }}>CLOTHES AND ACCESSORIES</span>
      {Object.entries(WEAR).map(([slot, opts]) => (
        <div key={slot} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ font: `700 0.8125rem ${T.uiFont}`, color: "var(--ts-on-tatami, #4A463D)" }}>{WEAR_NAMES[slot]}</span>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {opts.map((o) => {
              const has = o.price === 0 || owned[o.id] != null;
              const on = wearOf(ch, slot).id === o.id;
              const cant = !has && balance < o.price;
              return (
                <button key={o.id} className="rm-opt" aria-pressed={on} disabled={cant}
                        style={cant ? { opacity: .55, cursor: "default" } : null}
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
