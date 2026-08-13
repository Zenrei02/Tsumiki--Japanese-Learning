// GENERATED from katakana-module.jsx by build-vite-app.py — do not hand-edit.
// Edit the source module and re-run. The single-file artifact stays the
// source of truth so the reviewer's grading path keeps working.
import { useEffect, useMemo, useRef, useState } from "react";
import { installStorage } from "../lib/storage.js";
import { T } from "../lib/tokens.js";
import { StrokeView, samplePath, scoreStroke, tolerancesFor, thinPoints, useStrokeData, StrokePractice, LOG_PTS, STROKE_BOX, TOL, TRACE_N } from "../lib/strokeEngine.jsx";
import { STROKES } from "../lib/strokeData.js";
import "../data/strokes-katakana.js";
installStorage();

// ————— Design tokens (matched to the rest of the app) —————


// ————— Kana tables —————
const COLS = [
  { key: "a",  name: "Main Vowel Series", kana: ["ア", "イ", "ウ", "エ", "オ"], sounds: ["a", "i", "u", "e", "o"] },
  { key: "ka", name: "K-Series", kana: ["カ", "キ", "ク", "ケ", "コ"], sounds: ["ka", "ki", "ku", "ke", "ko"] },
  { key: "sa", name: "S-Series", kana: ["サ", "シ", "ス", "セ", "ソ"], sounds: ["sa", "shi", "su", "se", "so"] },
  { key: "ta", name: "T-Series", kana: ["タ", "チ", "ツ", "テ", "ト"], sounds: ["ta", "chi", "tsu", "te", "to"] },
  { key: "na", name: "N-Series", kana: ["ナ", "ニ", "ヌ", "ネ", "ノ"], sounds: ["na", "ni", "nu", "ne", "no"] },
  { key: "ha", name: "H-Series", kana: ["ハ", "ヒ", "フ", "ヘ", "ホ"], sounds: ["ha", "hi", "fu", "he", "ho"] },
  { key: "ma", name: "M-Series", kana: ["マ", "ミ", "ム", "メ", "モ"], sounds: ["ma", "mi", "mu", "me", "mo"] },
  { key: "ya", name: "Y-Series", kana: ["ヤ", "",   "ユ", "",   "ヨ"], sounds: ["ya", "", "yu", "", "yo"] },
  { key: "ra", name: "R-Series", kana: ["ラ", "リ", "ル", "レ", "ロ"], sounds: ["ra", "ri", "ru", "re", "ro"] },
  { key: "wa", name: "W-Series", kana: ["ワ", "",   "",   "",   "ヲ"], sounds: ["wa", "", "", "", "wo"] },
];

const DAKUTEN = { カ:"ガ", キ:"ギ", ク:"グ", ケ:"ゲ", コ:"ゴ", サ:"ザ", シ:"ジ", ス:"ズ", セ:"ゼ", ソ:"ゾ",
  タ:"ダ", チ:"ヂ", ツ:"ヅ", テ:"デ", ト:"ド", ハ:"バ", ヒ:"ビ", フ:"ブ", ヘ:"ベ", ホ:"ボ", ウ:"ヴ" };
const HANDAKU = { ハ:"パ", ヒ:"ピ", フ:"プ", ヘ:"ペ", ホ:"ポ" };
const SMALL = { ツ:"ッ", ヤ:"ャ", ユ:"ュ", ヨ:"ョ", ア:"ァ", イ:"ィ", ウ:"ゥ", エ:"ェ", オ:"ォ" };

// ヲ has no second reading to show. It never does the particle's job — that is
// always written in hiragana — so it is only ever recited "wo", which is what
// the W-Series row now labels it. Kept as an empty map so the chart and panel
// share one shape across both modules.
const ALT_SOUND = {};

// Combined sounds. One row per i-row character that takes a small ャュョ, in
// chart order — the same twelve sets the audio was recorded in.
const YOUON = [
  ["キ", ["キャ", "キュ", "キョ"], ["kya", "kyu", "kyo"]],
  ["シ", ["シャ", "シュ", "ショ"], ["sha", "shu", "sho"]],
  ["チ", ["チャ", "チュ", "チョ"], ["cha", "chu", "cho"]],
  ["ニ", ["ニャ", "ニュ", "ニョ"], ["nya", "nyu", "nyo"]],
  ["ヒ", ["ヒャ", "ヒュ", "ヒョ"], ["hya", "hyu", "hyo"]],
  ["ミ", ["ミャ", "ミュ", "ミョ"], ["mya", "myu", "myo"]],
  ["リ", ["リャ", "リュ", "リョ"], ["rya", "ryu", "ryo"]],
  ["ギ", ["ギャ", "ギュ", "ギョ"], ["gya", "gyu", "gyo"]],
  ["ジ", ["ジャ", "ジュ", "ジョ"], ["ja", "ju", "jo"]],
  ["ヂ", ["ヂャ", "ヂュ", "ヂョ"], ["ja", "ju", "jo"]],
  ["ビ", ["ビャ", "ビュ", "ビョ"], ["bya", "byu", "byo"]],
  ["ピ", ["ピャ", "ピュ", "ピョ"], ["pya", "pyu", "pyo"]],
];

const EXTRA_SOUND = { ガ:"ga", ギ:"gi", グ:"gu", ゲ:"ge", ゴ:"go", ザ:"za", ジ:"ji", ズ:"zu", ゼ:"ze", ゾ:"zo",
  ダ:"da", ヂ:"ji", ヅ:"zu", デ:"de", ド:"do", バ:"ba", ビ:"bi", ブ:"bu", ベ:"be", ボ:"bo",
  パ:"pa", ピ:"pi", プ:"pu", ペ:"pe", ポ:"po", ヴ:"vu", ン:"n", "ー":"long vowel",
  ッ:"small tsu", ャ:"small ya", ュ:"small yu", ョ:"small yo",
  ァ:"small a", ィ:"small i", ゥ:"small u", ェ:"small e", ォ:"small o" };

function soundFor(ch) {
  for (const c of COLS) {
    const i = c.kana.indexOf(ch);
    if (i >= 0 && c.kana[i]) return c.sounds[i];
  }
  return EXTRA_SOUND[ch] || "?";
}

// Katakana's shape traps are worse than hiragana's and mostly about stroke
// direction rather than outline — which is exactly what tracing would catch.
const CONFUSABLE = [
  ["シ", "ツ"], ["ソ", "ン"], ["シ", "ン"], ["ツ", "ソ"],
  ["ノ", "メ"], ["ノ", "ヌ"], ["メ", "ヌ"],
  ["ワ", "ク"], ["ワ", "ウ"], ["ク", "ケ"], ["ク", "タ"],
  ["ラ", "ウ"], ["ス", "ヌ"], ["コ", "ユ"], ["テ", "チ"],
  ["ア", "マ"], ["ナ", "メ"], ["ホ", "オ"], ["ロ", "コ"],
  ["レ", "ル"], ["ヒ", "ト"], ["エ", "コ"], ["ユ", "ヨ"],
  ["ケ", "タ"], ["ワ", "タ"], ["ノ", "ソ"], ["ス", "メ"], ["ウ", "フ"],
];
const isConfusable = (a, b) => CONFUSABLE.some(([x, y]) => (x === a && y === b) || (x === b && y === a));

// ————— Curriculum —————
// NOTE: all Japanese content is AI-authored and pending native-speaker review.
// Culture Connection lessons need the closest read — register and etymology
// claims are the easiest things here to get confidently wrong.
//
// SCAFFOLDING RULE: Write exercises only ever use kana taught by that point,
// verified by script. Culture lessons are READ-ONLY and may show words slightly
// ahead — the learner already knows voiced marks from hiragana, so recognising
// ダ before writing it is a small step, not a gap.
const MODULES = [
  { id: "cc-intro", kind: "culture",
    title: "What katakana is for", sounds: "", en: "read this before anything else",
    exp: "Katakana is the same set of sounds you already know from hiragana, written differently. It marks a word as coming from outside — foreign words, foreign names, brand names, sound effects, and the occasional word set in katakana purely for emphasis, the way we might use italics.\n\nThe part worth hearing now, before you learn a single character: katakana does not reproduce the original pronunciation. It never really tried to. A borrowed word is rebuilt from Japanese sounds and Japanese rhythm, and whatever does not fit is replaced or padded out. English has consonants stacked together and words that stop on a consonant; Japanese does neither, so vowels get inserted and endings get added.\n\nTreat every katakana word as a Japanese word from the start. If you read them as English wearing a costume, you will mispronounce them, and worse, you will assume you know what they mean.",
    notes: [
      "Not all loanwords come from English. パン is Portuguese, アルバイト is German, イクラ is Russian, ズボン is French.",
      "Meaning drifts too. A borrowed word often means something narrower, broader, or simply different from its source.",
    ],
    showcase: [
      { kana: "パン", en: "bread", note: "Not from English at all — and not unusual in that." },
      { kana: "アルバイト", en: "part-time job", note: "Also not from English. Katakana marks foreign, not English." },
    ] },

  { id: "a", kind: "kana", col: "a",
    title: "Main Vowel Series", sounds: "a i u e o", en: "the same five sounds, new shapes",
    exp: "Same five vowels, same order, different characters. Katakana shapes are angular where hiragana curves — they were built from fragments of kanji, and it shows.",
    notes: ["ア and マ share a similar frame. So do ウ, ワ and ラ, which is the first trap of many."],
    words: [] },
  { id: "ka", kind: "kana", col: "ka",
    title: "K-Series", sounds: "ka ki ku ke ko", en: "and the first real words",
    exp: "Five more, and enough to write actual words for the first time. Katakana needs more characters per word than hiragana does, because loanwords pick up extra vowels on the way in.",
    notes: ["ク and ケ differ by one stroke. ク, ワ and タ are a three-way mix-up."],
    words: [
      { kana: "カカオ", mora: ["ka", "ka", "o"], en: "cacao" },
      { kana: "エコ", mora: ["e", "ko"], en: "eco" },
      { kana: "イカ", mora: ["i", "ka"], en: "squid" },
    ] },
  { id: "sa", kind: "kana", col: "sa",
    title: "S-Series", sounds: "sa shi su se so", en: "the hardest two characters in the system",
    exp: "This row contains シ and ソ, which together with ツ and ン form the single worst confusion in Japanese writing. They are not distinguished by shape so much as by stroke direction, which is why watching them written matters more here than anywhere else.",
    notes: [
      "シ and ツ: シ's short strokes come in low and sweep up; ツ's come down from the top.",
      "ソ and ン: same problem, same solution — direction, not outline.",
      "If you only learn stroke order for four characters, make it these four.",
    ],
    words: [
      { kana: "アイス", mora: ["a", "i", "su"], en: "ice cream" },
      { kana: "キス", mora: ["ki", "su"], en: "kiss" },
      { kana: "オアシス", mora: ["o", "a", "shi", "su"], en: "oasis" },
      { kana: "スイカ", mora: ["su", "i", "ka"], en: "watermelon" },
    ] },
  { id: "ta", kind: "kana", col: "ta",
    title: "T-Series", sounds: "ta chi tsu te to", en: "the other half of the confusion",
    exp: "ツ arrives here, completing the シ・ツ・ソ・ン set. Same irregular readings as hiragana — chi and tsu, not ti and tu — because these are the same sounds in different clothes.",
    notes: ["チ and テ look related and are not.", "ツ against シ is the pair to drill."],
    words: [
      { kana: "テスト", mora: ["te", "su", "to"], en: "test" },
      { kana: "コスト", mora: ["ko", "su", "to"], en: "cost" },
      { kana: "サイト", mora: ["sa", "i", "to"], en: "website" },
      { kana: "タイ", mora: ["ta", "i"], en: "Thailand" },
    ] },
  { id: "sb-shitsuso", kind: "skill",
    show: ["シ", "ツ", "ソ"],
    title: "シ・ツ・ソ", sounds: "shi tsu so", en: "the confusion starts here",
    exp: "Three characters you have just met are the hardest in the writing system, and they are hard for a reason worth understanding: they are not really distinguished by shape. They are distinguished by the direction the strokes are written.\n\nIn a clean printed font the differences are visible. In handwriting they collapse, and native speakers get them wrong too. Learning the rule now costs a few minutes; unlearning a bad habit later costs months.",
    notes: [
      "シ — short strokes enter from the LEFT, long stroke sweeps UPWARD. Same direction as hiragana し.",
      "ツ — short strokes sit on TOP, long stroke sweeps DOWNWARD. Same direction as hiragana つ.",
      "ソ — one short stroke, written downward. Think of it as ツ with a stroke removed.",
      "Count first, then check direction. That order gets it right every time.",
    ],
    judge: [
      { prompt: "shi", answer: "シ", options: ["シ", "ツ"], why: "Two short strokes entering from the left, long stroke written upward — like hiragana し." },
      { prompt: "tsu", answer: "ツ", options: ["ツ", "シ"], why: "Two short strokes on top, long stroke written downward — like hiragana つ." },
      { prompt: "so", answer: "ソ", options: ["ソ", "ツ"], why: "One short stroke, not two. Both are written downward, so counting is what separates them." },
      { prompt: "so", answer: "ソ", options: ["ソ", "シ"], why: "ソ has one short stroke and goes down; シ has two and goes up. Both differences point the same way." },
      { prompt: "shi", answer: "シ", options: ["シ", "ソ"], why: "Two strokes, upward. ソ has one, downward." },
    ] },

  { id: "na", kind: "kana", col: "na",
    title: "N-Series", sounds: "na ni nu ne no", en: "more near-twins",
    exp: "Regular sounds. The shapes are the work again: ヌ and ス differ by a single stroke, and ノ turns up inside several other characters.",
    notes: ["ノ, メ and ヌ are built from the same diagonal.", "ヌ and ス are one stroke apart."],
    words: [
      { kana: "ネクタイ", mora: ["ne", "ku", "ta", "i"], en: "necktie" },
      { kana: "テニス", mora: ["te", "ni", "su"], en: "tennis" },
      { kana: "ナイス", mora: ["na", "i", "su"], en: "nice" },
    ] },
  { id: "ha", kind: "kana", col: "ha",
    title: "H-Series", sounds: "ha hi fu he ho", en: "the row that becomes p later",
    exp: "フ is fu, not hu, exactly as in hiragana. This row takes both voiced marks later, turning into ba and pa — and a large share of loanwords need those.",
    notes: ["ヘ is almost identical to hiragana へ. It is one of the few that carried over.", "ホ and オ share a cross."],
    words: [
      { kana: "ナイフ", mora: ["na", "i", "fu"], en: "knife" },
      { kana: "ハイテク", mora: ["ha", "i", "te", "ku"], en: "high-tech" },
      { kana: "ホスト", mora: ["ho", "su", "to"], en: "host" },
    ] },
  { id: "ma", kind: "kana", col: "ma",
    title: "M-Series", sounds: "ma mi mu me mo", en: "regular throughout",
    exp: "No irregular readings and, for once, no severe shape traps. A row to build speed on.",
    notes: ["メ shares its diagonal with ノ and ヌ."],
    words: [
      { kana: "マスク", mora: ["ma", "su", "ku"], en: "mask" },
      { kana: "メモ", mora: ["me", "mo"], en: "memo" },
      { kana: "トマト", mora: ["to", "ma", "to"], en: "tomato" },
      { kana: "ミス", mora: ["mi", "su"], en: "mistake" },
    ] },
  { id: "sb-diagonal", kind: "skill",
    show: ["ノ", "ヌ", "ス", "メ"],
    title: "ノ・ヌ・ス・メ", sounds: "no nu su me", en: "the diagonal family",
    exp: "A second cluster, and it works differently from the first. These four are not separated by direction — they are separated by how many strokes there are and whether they cross.\n\nYou have now met all four, spread across three different lessons, which is exactly why they blur together. Seeing them side by side once is worth more than meeting them one at a time ever was.",
    notes: [
      "ノ is a single stroke. It is the only one of the four, and that alone settles it.",
      "メ is two crossing diagonals with no horizontal top.",
      "ヌ and ス both open with a stroke that runs right, then turns down to the left.",
      "The difference between them is the second stroke: on ヌ it crosses the first, on ス it hangs from the turn without crossing.",
    ],
    judge: [
      { prompt: "no", answer: "ノ", options: ["ノ", "メ"], why: "One stroke. メ is two, crossing." },
      { prompt: "me", answer: "メ", options: ["メ", "ヌ"], why: "メ has no horizontal top — just two diagonals crossing." },
      { prompt: "nu", answer: "ヌ", options: ["ヌ", "ス"], why: "The second stroke crosses the first. On ス it hangs from the turn instead." },
      { prompt: "su", answer: "ス", options: ["ス", "ヌ"], why: "No crossing. The second stroke drops away from the bend." },
      { before: "", answer: "メ", after: "モ", en: "memo", options: ["メ", "ヌ"], why: "メモ. Two crossing diagonals, no horizontal top." },
      { before: "ホ", answer: "ス", after: "ト", en: "host", options: ["ス", "ヌ"], why: "ホスト. Nothing crosses." },
    ] },

  { id: "ya", kind: "kana", col: "ya",
    title: "Y-Series", sounds: "ya yu yo", en: "three again",
    exp: "Same gaps as hiragana — no i, no e. These three also appear in small form later to build combined sounds, which katakana uses constantly.",
    notes: ["Three characters, and all three do double duty in their small form."],
    words: [
      { kana: "タイヤ", mora: ["ta", "i", "ya"], en: "tyre" },
      { kana: "ヤシ", mora: ["ya", "shi"], en: "palm tree" },
    ] },
  { id: "ra", kind: "kana", col: "ra",
    title: "R-Series", sounds: "ra ri ru re ro", en: "the row English words land on",
    exp: "Worth extra attention, because this row absorbs both English l and r. Every English word ending in an l or r sound picks up a character from here on the way into Japanese, so ル and ラ turn up everywhere.",
    notes: ["ル and レ differ by one stroke.", "ロ and コ are a box and a bracket."],
    words: [
      { kana: "ホテル", mora: ["ho", "te", "ru"], en: "hotel" },
      { kana: "ライス", mora: ["ra", "i", "su"], en: "rice (Western style)" },
      { kana: "カメラ", mora: ["ka", "me", "ra"], en: "camera" },
      { kana: "クラス", mora: ["ku", "ra", "su"], en: "class" },
    ] },
  { id: "wa", kind: "kana", col: "wa",
    title: "W-Series & ン", sounds: "wa wo n", en: "the last three",
    exp: "ン is the character you have been waiting for — English words ending in a consonant lean on it heavily. ヲ exists for completeness and you will almost never meet it: the particle it writes is always written in hiragana.",
    notes: [
      "ン against ソ is the last of the four-way trap. Direction again.",
      "ヲ is effectively obsolete. Recognise it, do not expect it.",
    ],
    words: [
      { kana: "ワイン", mora: ["wa", "i", "n"], en: "wine" },
      { kana: "レモン", mora: ["re", "mo", "n"], en: "lemon" },
      { kana: "リモコン", mora: ["ri", "mo", "ko", "n"], en: "remote control" },
      { kana: "エアコン", mora: ["e", "a", "ko", "n"], en: "air conditioner" },
    ] },
  { id: "sb-frame", kind: "skill",
    show: ["ワ", "ウ", "ク", "ケ", "タ"],
    title: "ワ・ク・ケ・タ", sounds: "wa ku ke ta", en: "the shared frame",
    exp: "The last cluster, and the one that catches people at reading speed rather than at writing speed. All four open the same way, so at a glance they occupy the same shape — the differences are small marks added to a common frame.\n\nWith ワ finally taught, you can see the whole family at once. Learn it as a family and each one stops being a separate thing to remember.",
    notes: [
      "ワ is the bare frame — open at the bottom, nothing inside.",
      "ウ is ワ with a mark added on top.",
      "ク hangs a long diagonal from the top right.",
      "タ is ク with a stroke through it.",
      "ケ is the odd one: it opens with its own short stroke at the top left rather than sharing the frame.",
    ],
    judge: [
      { prompt: "wa", answer: "ワ", options: ["ワ", "ク"], why: "Nothing hangs from the corner. ク has a long diagonal." },
      { prompt: "u", answer: "ウ", options: ["ウ", "ワ"], why: "ウ carries a mark on top. ワ is bare." },
      { prompt: "ta", answer: "タ", options: ["タ", "ク"], why: "タ is ク with a stroke through it." },
      { prompt: "ke", answer: "ケ", options: ["ケ", "ク"], why: "ケ opens with its own short stroke at the top left." },
      { before: "", answer: "ワ", after: "イン", en: "wine", options: ["ワ", "ク"], why: "ワイン. The bare frame." },
      { before: "ネ", answer: "ク", after: "タイ", en: "necktie", options: ["ク", "タ"], why: "ネクタイ — and the タ right after it makes the contrast visible." },
    ] },

  { id: "sb-four", kind: "skill",
    show: ["シ", "ツ", "ソ", "ン"],
    title: "シ・ツ・ソ・ン", sounds: "shi tsu so n", en: "all four, and the rule that sorts them",
    exp: "ン completes the set, and with all four in front of you the pattern finally resolves. Two questions settle every case.\n\nHow many short strokes — two, or one? And which way does the long stroke travel — up, or down? Answer both and there is exactly one character left.\n\nTwo strokes and upward is シ. Two strokes and downward is ツ. One stroke and upward is ン. One stroke and downward is ソ.",
    notes: [
      "The pairs run diagonally: シ and ン both go up. ツ and ソ both go down.",
      "And across: シ and ツ both have two strokes. ン and ソ both have one.",
      "Fonts make this look easy. Handwriting does not, which is why the rule matters more than the picture.",
    ],
    judge: [
      { prompt: "n", answer: "ン", options: ["ン", "ソ"], why: "One stroke each, so direction decides: ン is written upward, ソ downward." },
      { prompt: "so", answer: "ソ", options: ["ソ", "ン"], why: "Downward. ン travels up." },
      { prompt: "shi", answer: "シ", options: ["シ", "ン"], why: "Both go up, so count: シ has two short strokes, ン has one." },
      { prompt: "tsu", answer: "ツ", options: ["ツ", "ソ"], why: "Both go down, so count: ツ has two, ソ has one." },
      { before: "ワイ", answer: "ン", after: "", en: "wine", options: ["ン", "ソ"], why: "ワイン. A word ending in a consonant sound takes ン." },
      { before: "レモ", answer: "ン", after: "", en: "lemon", options: ["ン", "ソ"], why: "レモン. Same ending, same character." },
    ] },

  { id: "cp1", kind: "checkpoint", all: true,
    title: "Review", sounds: "all 46", en: "checkpoint — the full chart",
    exp: "All of it, mixed. Pay particular attention to anything from the シ・ツ・ソ・ン family — those four are worth being slow and certain about rather than fast and wrong.",
    notes: [],
    words: [
      { kana: "アニメ", mora: ["a", "ni", "me"], en: "animation" },
      { kana: "ロシア", mora: ["ro", "shi", "a"], en: "Russia" },
      { kana: "スイス", mora: ["su", "i", "su"], en: "Switzerland" },
      { kana: "テキスト", mora: ["te", "ki", "su", "to"], en: "textbook" },
    ] },

  { id: "cc-recognise", kind: "culture", all: true,
    title: "Words you'll almost recognise", sounds: "", en: "and why almost is the problem",
    exp: "Now that you can read the chart, you can read hundreds of words you half-know. That is the good news and the trap in one sentence.\n\nEnglish borrowings get rebuilt to Japanese rhythm on the way in. Consonant clusters get vowels pushed between them, final consonants get a vowel added, and long words get cut short. The result is a Japanese word. Read it as Japanese and you will be understood; read it as English with an accent and you will not.\n\nShortening is the pattern to watch. Japanese trims long borrowings hard, and the trimmed form is the real word — nobody says the long version.",
    notes: [
      "テレビ is not an abbreviation people expand. It is simply the word for television.",
      "Shortening is everywhere: パソコン, エアコン, コンビニ, スーパー, アニメ, リモコン.",
      "Some words are assembled in Japan from English parts and do not exist in English at all.",
    ],
    showcase: [
      { kana: "コイン", en: "coin", note: "About as direct as these get." },
      { kana: "コインランドリー", en: "laundromat", note: "Assembled in Japan. An English speaker would say laundromat." },
      { kana: "テレビ", en: "television; TV set", note: "Clipped. Nobody uses the long form — the short one is the word." },
      { kana: "ドラマ", en: "TV series", note: "Narrower than English. A scripted television series, not the genre or the fuss." },
      { kana: "ダンス", en: "dance", note: "Western-style social or performance dance. Traditional Japanese dance has its own word." },
    ] },

  { id: "dakuten", kind: "kana", all: true, dakuten: true,
    title: "Voiced sounds", sounds: "ga za da ba pa", en: "the same two marks",
    exp: "Identical system to hiragana — a pair of strokes voices a character, a small circle turns the H series into p sounds. No new shapes to learn, only the same marks on characters you already know.",
    notes: [
      "Loanwords lean on these heavily. Roughly a third of the katakana you meet carries a mark.",
      "ヂ and ヅ exist and are almost never used in loanwords. Default to ジ and ズ.",
    ],
    words: [
      { kana: "パン", mora: ["pa", "n"], en: "bread" },
      { kana: "バス", mora: ["ba", "su"], en: "bus" },
      { kana: "テレビ", mora: ["te", "re", "bi"], en: "television" },
      { kana: "ダンス", mora: ["da", "n", "su"], en: "dance" },
    ] },

  { id: "youon", kind: "kana", youon: true,
    walk: ["ャ", "ュ", "ョ"], all: true, dakuten: true, small: true,
    title: "Combined sounds", sounds: "kya sha cho", en: "two characters, one beat",
    exp: "Same rule as hiragana: a small ャ, ュ or ョ after an i-row character fuses the two into a single beat. Katakana uses these constantly, because English is full of sounds Japanese can only build this way.",
    notes: [
      "シャ is sha, チャ is cha, ジャ is ja.",
      "Size is the whole difference. キャ is one beat; キヤ is two.",
    ],
    words: [
      { kana: "シャツ", mora: ["sha", "tsu"], en: "shirt" },
      { kana: "チョコ", mora: ["cho", "ko"], en: "chocolate" },
      { kana: "ジャム", mora: ["ja", "mu"], en: "jam" },
      { kana: "キャベツ", mora: ["kya", "be", "tsu"], en: "cabbage" },
    ] },
  { id: "cc-2", kind: "culture", all: true, dakuten: true, small: true,
    title: "Borrowed, then changed", sounds: "", en: "same word, different job",
    exp: "A borrowed word does not have to keep its original meaning, and often does not. Sometimes the meaning narrows to one specific use; sometimes it widens to cover things the source language would never include.\n\nThis is where assuming you know a word costs you. The pronunciation being unfamiliar is obvious and you will correct for it. The meaning being different is invisible until it goes wrong.",
    notes: ["When you meet a katakana word you recognise, check the meaning anyway. It is the cheapest habit in Japanese."],
    showcase: [
      { kana: "ジュース", en: "any sweet soft drink", note: "Wider than juice. A cola counts." },
      { kana: "キャベツ", en: "cabbage", note: "Three beats: kya-be-tsu. Nothing left of the English rhythm." },
      { kana: "シャーペン", en: "mechanical pencil", note: "Clipped from a longer katakana phrase that was itself built in Japan." },
    ] },

  { id: "sokuon", kind: "kana",
    walk: ["ッ"], all: true, dakuten: true, small: true,
    title: "Double consonants", sounds: "small tsu", en: "the silent beat",
    exp: "A small ッ is a full beat of held silence before the next consonant, exactly as in hiragana. It appears often in loanwords because English words that end abruptly get rebuilt with one.",
    notes: [
      "It is a beat. セット is three: se-(t)-to.",
      "A doubled consonant on a keyboard produces it — setto gives セット.",
    ],
    words: [
      { kana: "ヨット", mora: ["yo", "t", "to"], en: "yacht" },
      { kana: "セット", mora: ["se", "t", "to"], en: "set" },
      { kana: "ネット", mora: ["ne", "t", "to"], en: "internet" },
      { kana: "コップ", mora: ["ko", "p", "pu"], en: "glass, tumbler" },
    ] },
  { id: "cc-3", kind: "culture", all: true, dakuten: true, small: true,
    title: "Not what you would guess", sounds: "", en: "familiar shape, different word",
    exp: "Not every katakana word came from English, and some of the ones that did not look close enough to fool you.\n\nThe practical consequence is simple: when a katakana word does not quite match any English word you know, do not force it. It may not be from English at all, and guessing will put you further from the meaning rather than closer.",
    notes: ["When a katakana word almost matches an English one, check rather than assume."],
    showcase: [
      { kana: "コップ", en: "glass, tumbler", note: "A tumbler. Not the same as カップ, which has a handle." },
      { kana: "ホッチキス", en: "stapler", note: "A brand name that became the everyday word." },
      { kana: "カルテ", en: "patient chart", note: "Standard medical vocabulary. Nothing English about it." },
    ] },

  { id: "chouon", kind: "kana", all: true, dakuten: true, small: true, bar: true,
    title: "Long vowels", sounds: "the ー bar", en: "katakana's own solution",
    exp: "Hiragana lengthens a vowel by adding a vowel character. Katakana does not — it uses a single bar, ー, and that bar is one full beat.\n\nThis is katakana-only. You will not see ー in hiragana text, and the reason matters: loanwords are so full of long vowels that spelling them out would be unreadable.",
    notes: [
      "The bar takes the sound of whatever vowel it follows. コー is koo, キー is kii.",
      "It is a beat of its own. ケーキ is three beats, not two.",
      "In vertical writing the bar is drawn vertically. Same character, rotated.",
    ],
    words: [
      { kana: "コーヒー", mora: ["ko", "o", "hi", "i"], en: "coffee" },
      { kana: "ケーキ", mora: ["ke", "e", "ki"], en: "cake" },
      { kana: "ノート", mora: ["no", "o", "to"], en: "notebook" },
      { kana: "スーパー", mora: ["su", "u", "pa", "a"], en: "supermarket" },
    ] },
  { id: "cc-4", kind: "culture", all: true, dakuten: true, small: true, bar: true,
    title: "Words that moved house", sounds: "", en: "recognisable, and wrong",
    exp: "These are the ones that catch confident learners. Every word here is genuinely borrowed from English, spelled in a way you can decode, and used for something the English word does not cover.\n\nNone of them is a mistake on the Japanese side. A borrowed word belongs to the language that borrowed it, and Japanese has put these to work in its own way.",
    notes: ["The pattern is usually narrowing to one specific referent, or attaching to whatever the object was when it arrived."],
    showcase: [
      { kana: "ストーブ", en: "heater", note: "The word is stove, but it means a room heater. A kitchen stove is コンロ." },
      { kana: "クーラー", en: "air conditioner", note: "The cooling unit. Not a cool box." },
      { kana: "スマート", en: "slim, slender", note: "The word is smart, but it describes build rather than intelligence. A compliment about someone's figure." },
      { kana: "マンション", en: "apartment, condominium", note: "A concrete apartment building. Nothing like an English mansion." },
    ] },

  { id: "extended", kind: "kana", all: true, dakuten: true, small: true, bar: true, ext: true,
    title: "ヴ and the small vowels", sounds: "va ti fo tu", en: "sounds Japanese didn't have",
    exp: "The last piece. To carry foreign sounds that Japanese has no character for, katakana pairs a character with a small vowel: フ plus small ォ gives フォ, テ plus small ィ gives ティ. And ウ takes a voiced mark to become ヴ, for v.\n\nThese are recent additions and they are still settling. That is why you will see the same word spelled more than one way.",
    notes: [
      "ヴ is in retreat. Official guidance has pushed usage toward ブ and バ, which is why ヴァイオリン is now usually バイオリン. Recognise ヴ; do not reach for it.",
      "Small ゥ is the rare one, appearing mainly in トゥ and ドゥ — タトゥー, ヒンドゥー. Older borrowings used ツ instead, which is why ツアー and トゥデイ coexist.",
      "ティ and チ are both used for foreign ti, depending on when the word arrived.",
    ],
    words: [
      { kana: "フォーク", mora: ["fo", "o", "ku"], en: "fork" },
      { kana: "チェック", mora: ["che", "k", "ku"], en: "check" },
      { kana: "ファイル", mora: ["fa", "i", "ru"], en: "file" },
      { kana: "タトゥー", mora: ["ta", "tu", "u"], en: "tattoo" },
    ] },
  { id: "cc-5", kind: "culture", all: true, dakuten: true, small: true, bar: true, ext: true,
    title: "Travel words that betray you", sounds: "", en: "where the gap costs you money",
    exp: "The extended characters turn up most in recent borrowings, which means travel, technology and business — exactly the situations where getting a word slightly wrong is expensive.\n\nThese words are worth knowing precisely rather than approximately, because you will meet them at an airport counter or a service desk, under time pressure, in Japanese.",
    notes: ["When a katakana word appears on a sign or a form, assume its Japanese meaning is the operative one."],
    showcase: [
      { kana: "トランジット", en: "transfer; connecting", note: "Used where English says transfer — changing planes. Narrower than English transit." },
      { kana: "サービス", en: "free of charge", note: "サービスです means you are not being charged, not that you are receiving service." },
      { kana: "バイキング", en: "buffet", note: "The word is Viking. It means a buffet meal. There is no route from one to the other you could reason your way along." },
      { kana: "クレーム", en: "a complaint", note: "A customer complaint, not a claim." },
    ] },

  { id: "cc-wasei", kind: "culture", all: true, dakuten: true, small: true, bar: true, ext: true,
    title: "Careful: fake English", sounds: "", en: "わせいえいご",
    exp: "One last warning, and it is the important one.\n\nSome katakana words were assembled in Japan out of English parts and do not exist in English at all. They are called わせいえいご — English made in Japan. The difficulty is not that they are hard to read. It is that many Japanese speakers believe they are English, and will use them with you expecting to be understood.\n\nSo the failure runs both ways. You will not recognise the word, and they will not know it is not English. Being aware of the category is most of the defence.",
    notes: [
      "There are hundreds. Two are enough for now — you will meet more as your vocabulary grows.",
      "A fuller lesson comes later in the course, once you have the vocabulary for the ones that matter at work.",
    ],
    showcase: [
      { kana: "コンセント", en: "power outlet", note: "Sounds like consent. No English speaker will follow you." },
      { kana: "サラリーマン", en: "white-collar employee", note: "The word is salary man. Widely assumed to be English; no English speaker uses it." },
    ] },

  { id: "sb-final", kind: "skill",
    show: ["シ", "ツ", "ソ", "ン"], all: true, dakuten: true, small: true, bar: true, ext: true,
    title: "The Final Test", sounds: "", en: "katakana mastery, allegedly",
    exp: "Everything you have learned, and it comes down to four characters again.\n\nThese are real words with one character removed. No cues, no context beyond the meaning — just the same two questions: how many strokes, and which direction.\n\nIf it helps, know that native speakers get these wrong in handwriting all the time, and that entire internet arguments have been fought over whether a particular scrawl was a ツ or a シ. Clearing this does not make you better than a native speaker. It does mean katakana has nothing left to hold over you.",
    notes: ["Count the strokes. Then check the direction. That is the whole system."],
    judge: [
      { before: "", answer: "シ", after: "ャツ", en: "shirt", options: ["シ", "ツ"], why: "シャツ. Two strokes, upward — and the small ャ needs an i-row character before it, which ツ is not." },
      { before: "", answer: "ソ", after: "ース", en: "sauce", options: ["ソ", "ン"], why: "ソース. Downward. A word cannot open with ン." },
      { before: "スー", answer: "ツ", after: "", en: "a suit", options: ["ツ", "シ"], why: "スーツ. Two strokes, downward." },
      { before: "パソコ", answer: "ン", after: "", en: "computer", options: ["ン", "ソ"], why: "パソコン. One stroke, upward." },
      { before: "", answer: "ソ", after: "フト", en: "software", options: ["ソ", "ン"], why: "ソフト. Downward, and again nothing opens with ン." },
      { before: "", answer: "シ", after: "ャワー", en: "shower", options: ["シ", "ツ"], why: "シャワー. Upward, and the small ャ confirms it." },
    ] },

  { id: "cp2", kind: "checkpoint", all: true, dakuten: true, small: true, bar: true, ext: true,
    title: "Review", sounds: "everything", en: "checkpoint — the whole system",
    exp: "The complete katakana system: the chart, the marks, small characters, the long bar and the extended pairs. Clear this and every sign, menu and product label in Japan is at least readable — which is not the same as understandable, as the culture lessons kept pointing out.",
    notes: [],
    words: [
      { kana: "コーヒー", mora: ["ko", "o", "hi", "i"], en: "coffee" },
      { kana: "シャッター", mora: ["sha", "t", "ta", "a"], en: "shutter" },
      { kana: "パーティー", mora: ["pa", "a", "ti", "i"], en: "party" },
      { kana: "サンドイッチ", mora: ["sa", "n", "do", "i", "c", "chi"], en: "sandwich" },
    ] },
];

// Kana available to the learner by the time they reach module index n.
// ————— Groups —————
// Each block runs learn → consolidate. The culture lessons stay interleaved
// where they were: they are timed to land right after the kana that makes the
// example words readable.
const GROUPS = [
  { title: "Getting started", ids: ["a", "ka", "sa", "ta", "sb-shitsuso"] },
  { title: "The middle rows", ids: ["na", "ha", "ma", "sb-diagonal"] },
  { title: "Finishing the chart", ids: ["ya", "ra", "wa", "sb-frame", "sb-four", "cp1"] },
  { title: "Marks and modifiers", ids: ["cc-recognise", "dakuten", "youon", "cc-2", "sokuon", "cc-3", "chouon", "cc-4", "extended"] },
  { title: "Loanwords that bite", ids: ["cc-5", "cc-wasei", "sb-final", "cp2"] },
];
const INTRO = MODULES.find((m) => m.id === "cc-intro");
const GROUPED = GROUPS.map((g) => ({ ...g, points: g.ids.map((id) => MODULES.find((m) => m.id === id)).filter(Boolean) }));

function availableAt(n) {
  const set = new Set();
  for (let i = 0; i <= n; i++) {
    const m = MODULES[i];
    if (!m) continue;
    if (m.all) COLS.forEach((c) => c.kana.forEach((k) => k && set.add(k)));
    else if (m.col) {
      const c = COLS.find((x) => x.key === m.col);
      if (c) c.kana.forEach((k) => k && set.add(k));
    }
    if (m.id === "wa" || m.all) set.add("ン");
    if (m.dakuten) {
      Object.values(DAKUTEN).forEach((k) => k !== "ヴ" && set.add(k));
      Object.values(HANDAKU).forEach((k) => set.add(k));
    }
    if (m.small) ["ッ", "ャ", "ュ", "ョ"].forEach((k) => set.add(k));
    if (m.bar) set.add("ー");
    if (m.ext) { ["ァ", "ィ", "ゥ", "ェ", "ォ"].forEach((k) => set.add(k)); set.add("ヴ"); }
  }
  return set;
}

// Lesson-type markers. These modules teach reading, so the markers stay in
// English: kanji is out of scope here by definition, and kana in the chrome
// would be a puzzle rather than a label. The grammar module escalates instead.
const KINDS = {
  kana:       { short: "KL", full: "Kana lesson",        color: "#3D5A80" },
  skill:      { short: "SB", full: "Skill builder",      color: "#C7351B" },
  culture:    { short: "CC", full: "Culture Connection", color: "#3E7C4F" },
  // Darkened from #B08A1F: white badge text on the original ochre was 3.2:1.
  checkpoint: { short: "CP", full: "Checkpoint",         color: "#907119" },
};
const KIND_ORDER = ["kana", "skill", "culture", "checkpoint"];

function KindBadge({ kind, size = 11 }) {
  const k = KINDS[kind];
  return (
    <span title={k.full} style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      background: k.color, color: "#FFFFFF", borderRadius: 4, fontWeight: 600,
      fontSize: size, letterSpacing: ".6px", lineHeight: 1, padding: "4px 6px",
      minWidth: 28, flexShrink: 0,
    }}>{k.short}</span>
  );
}
const hasJP = (t) => /[\u3040-\u30FF\u3400-\u9FFF]/.test(t);

// ————— Storage —————
const KEY = "katakana-progress-v1";
async function loadProgress() {
  try { const r = await window.storage.get(KEY); return r ? JSON.parse(r.value) : {}; }
  catch { return {}; }
}
async function saveProgress(p) {
  try { await window.storage.set(KEY, JSON.stringify(p)); }
  catch (e) { console.error("progress save failed", e); }
}

// ————— 五十音 pad —————
function KanaPad({ onInsert, onModify, onBack, onClear, enabled }) {
  const live = (ch) => !!ch && (!enabled || enabled.has(ch));
  const cell = (ch, key) => (
    <button key={key} onClick={() => live(ch) && onInsert(ch)} disabled={!live(ch)}
      className={ch ? (live(ch) ? "pad-key" : "pad-dim") : "pad-gap"}
      aria-label={ch ? `${ch}, ${soundFor(ch)}` : undefined}>
      {ch}
    </button>
  );
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 3 }}>
        {[0, 1, 2, 3, 4].map((row) => COLS.map((c, ci) => cell(c.kana[row], `${ci}-${row}`)))}
      </div>
      <div style={{ display: "flex", gap: 3, marginTop: 3, flexWrap: "wrap" }}>
        <button className={live("ン") ? "pad-key" : "pad-dim"} disabled={!live("ン")}
          onClick={() => live("ン") && onInsert("ン")} aria-label="n">ン</button>
        <button className={live("ー") ? "pad-key" : "pad-dim"} disabled={!live("ー")}
          onClick={() => live("ー") && onInsert("ー")} aria-label="long vowel bar">ー</button>
        <button className="pad-key" onClick={() => onModify("dakuten")} aria-label="add dakuten">゛</button>
        <button className="pad-key" onClick={() => onModify("handaku")} aria-label="add handakuten">゜</button>
        <button className="pad-key" onClick={() => onModify("small")} aria-label="make the last character small">small</button>
        <button className="pad-key" onClick={() => onInsert("、")}>、</button>
        <button className="pad-key" onClick={() => onInsert("。")}>。</button>
        <button className="pad-key" onClick={onBack} aria-label="backspace">⌫</button>
        <button className="pad-ghost" onClick={onClear}>Clear</button>
      </div>
      <p style={{ fontSize: 11, color: T.sub, marginTop: 8, marginBottom: 0 }}>
        Greyed keys are characters you haven't met yet. ヴ is ウ with a dakuten.
      </p>
    </div>
  );
}

// ————— 原稿用紙 squares —————
function Squares({ value, length, reveal }) {
  const chars = Array.from(value);
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {Array.from({ length: Math.max(length, chars.length) }).map((_, i) => (
        <div key={i} style={{
          width: 46, height: 46, borderRadius: 2,
          border: `1px solid ${i >= length ? T.shu : T.hairline}`,
          background: T.sheet, display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: T.jpFont, fontSize: 26, color: reveal ? T.ok : T.ink,
        }}>{chars[i] || ""}</div>
      ))}
    </div>
  );
}

// ————— Stroke data (KanjiVG) —————
// Source: KanjiVG, https://github.com/KanjiVG/kanjivg — Creative Commons
// Attribution-Share Alike 3.0. Paths are ordered by writing order inside a
// 109x109 box. Share-alike obligations apply; see the dictionary licence row.




// ————— Stroke-order animation —————


// ————— Sound-first header (Session 13) —————
// The listening control leads every character view. It used to trail the
// canvases as a small ghost button, which on a phone meant scrolling past two
// boxes to reach the one thing being taught first — the sound. Big enough for
// a thumb and first in reading order. Silent units render it disabled and let
// the romaji stand alone.
function SoundHeader({ ch }) {
  const { play, canPlay, playSound, canPlaySound } = useKanaAudio();
  const able = canPlay(ch);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
      <button onClick={() => play(ch)} disabled={!able} aria-label={"Play " + soundFor(ch)}
        style={{
          width: 64, height: 64, borderRadius: 999, cursor: able ? "pointer" : "default",
          border: `1px solid ${able ? T.ink : T.hairline}`, background: T.sheet,
          color: T.ink, fontSize: 26, opacity: able ? 1 : 0.45, flex: "0 0 auto",
        }}>♪</button>
      <span style={{ fontFamily: T.jpFont, fontSize: 44, lineHeight: 1 }}>{ch}</span>
      <span style={{ fontSize: 20, letterSpacing: ".5px", color: T.ink }}>
        {ALT_SOUND[ch] ? `${ALT_SOUND[ch]} · ${soundFor(ch)}` : soundFor(ch)}
      </span>
      {ALT_SOUND[ch] && canPlaySound(ALT_SOUND[ch]) && (
        <button className="btn-ghost" style={{ padding: "4px 12px", fontSize: 13 }}
          onClick={() => playSound(ALT_SOUND[ch], ch)}>▶ {ALT_SOUND[ch]}</button>
      )}
    </div>
  );
}

function StrokePanel({ ch, onClose, onPractise }) {
  const [numbers, setNumbers] = useState(false);
  const [replay, setReplay] = useState(0);
  const boxRef = useRef(null);

  // Bring the panel to the learner. Without this the stroke animation plays
  // off-screen on a long chart and is finished before they scroll to it, which
  // reads as "it does not animate".
  useEffect(() => {
    if (ch && boxRef.current?.scrollIntoView) {
      boxRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [ch]);

  if (!ch) return null;
  const known = !!STROKES[ch];
  return (
    <div ref={boxRef} style={{
      marginTop: 14, padding: 16, background: T.paper,
      border: `2px solid ${T.ink}`, borderRadius: 6,
    }}>
      {/* Sound first (Session 13) — the listening control leads the panel
          rather than trailing the animation. */}
      <SoundHeader ch={ch} />
      <div style={{ display: "flex", gap: 18, alignItems: "flex-start", flexWrap: "wrap", marginTop: 14 }}>
        {known ? <StrokeView key={ch + replay} ch={ch} auto numbers={numbers} /> : (
          <div style={{ fontSize: 13, color: T.sub }}>No stroke data for this character yet.</div>
        )}
        <div style={{ flex: 1, minWidth: 160 }}>
          <p style={{ fontSize: 13, color: T.sub, lineHeight: 1.6, marginTop: 0, marginBottom: 10 }}>
            Tap the square to watch it written again. Stroke order is most of what makes
            handwriting readable — worth copying the sequence, not just the shape.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
            <button className="btn-ghost" onClick={() => setReplay((n) => n + 1)}>↻ Watch again</button>
            {onPractise && known && (
              <button className="btn-primary" onClick={() => onPractise(ch)}>Try drawing it</button>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="btn-ghost" onClick={() => setNumbers((v) => !v)}>
              {numbers ? "Hide numbers" : "Show numbers"}
            </button>
            <button className="btn-ghost" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const CHART_NOTE = null;

// ————— Learn —————
// ————— Combined sounds chart (拗音) —————
// Not another COLS entry, because a yōon cell is two characters carrying one
// sound. StrokePanel takes a single character and has no stroke data for きゃ,
// so these cells play their recording instead of opening the panel.
//
// The romaji is listed, not composed: し gives sha rather than shya, ち gives
// cha, じ gives ja. That irregularity is the same reason the audio holds one
// recorded clip per pair rather than stitching two together — きゃ is one mora.
//
// ぢゃぢゅぢょ is included because the lesson notes say the voiced i-row forms
// take small ゃゅょ, and it is a homophone of じゃじゅじょ — it shares their clip.
function YouonChart() {
  const { playSound, canPlaySound } = useKanaAudio();
  const cell = (k, sound) => (
    <button key={k} onClick={() => playSound(sound, k)} disabled={!canPlaySound(sound)}
      style={{
        border: `1px solid ${T.hairline}`, background: T.sheet, borderRadius: 3,
        padding: "10px 4px", textAlign: "center", cursor: canPlaySound(sound) ? "pointer" : "default",
        fontFamily: "inherit", opacity: canPlaySound(sound) ? 1 : 0.5,
      }}>
      <div style={{ fontFamily: T.jpFont, fontSize: 27, lineHeight: 1.15 }}>{k}</div>
      <div style={{ fontSize: 12, color: T.sub, letterSpacing: ".5px", marginTop: 3 }}>{sound}</div>
    </button>
  );
  return (
    <div style={{ margin: "18px 0 0" }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".5px", color: T.sub, marginBottom: 8 }}>
        EVERY COMBINED SOUND
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
        {YOUON.map(([, kana, sounds]) => kana.map((k, i) => cell(k, sounds[i])))}
      </div>
      <p style={{ fontSize: 11, color: T.sub, marginTop: 8, marginBottom: 0 }}>
        Tap any one to hear it. Each is a single beat, however long the romaji looks.
      </p>
    </div>
  );
}

function Learn({ mod, progress, onProgress, onPractise, onFinish, finishLabel }) {
  // Paged, not scrolled (Session 13). The lesson used to be one long column —
  // explanation, walk, chart, look-alikes, words, notes — and on a phone the
  // sound sat below two canvases. Now it is one idea per screen: the
  // explanation first, then each character on its own page with the sound at
  // the top, then the chart and the sections that used to stack below it.
  const col = mod.col ? COLS.find((c) => c.key === mod.col) : null;
  const walk = walkCharsFor(mod);
  const traps = mod.show || [];
  const [sel, setSel] = useState(null);

  const pages = [];
  if (mod.exp) pages.push({ id: "about", label: "about" });
  walk.forEach((c) => pages.push({ id: "ch:" + c, label: c, ch: c }));
  if (col) pages.push({ id: "chart", label: "the full chart" });
  if (mod.youon) pages.push({ id: "combined", label: "combined sounds" });
  if (traps.length) pages.push({ id: "traps", label: "look-alikes" });
  if (mod.showcase && mod.showcase.length) pages.push({ id: "words", label: "words" });
  if (mod.notes.length) pages.push({ id: "notes", label: "worth knowing" });

  // Resume at the first character not yet walked — but only if they have
  // started; a fresh lesson opens on the explanation.
  const resumePage = () => {
    const done = ((progress || {})[mod.id] || {}).walked || [];
    const idx = walk.findIndex((c) => !done.includes(c));
    if (idx <= 0) return 0;
    const p = pages.findIndex((pg) => pg.ch === walk[idx]);
    return p < 0 ? 0 : p;
  };
  const [page, setPage] = useState(resumePage);
  useEffect(() => { setPage(resumePage()); setSel(null); }, [mod.id]);
  useEffect(() => { setSel(null); }, [page]);

  const cur = pages[Math.min(page, pages.length - 1)] || { id: "about" };
  const walked = ((progress || {})[mod.id] || {}).walked || [];
  const last = page >= pages.length - 1;

  const charBtn = (k, i, sound) => (
    <button key={i} onClick={() => setSel(sel === k ? null : k)}
      style={{
        flex: "1 1 80px", border: `1px solid ${sel === k ? T.ink : T.hairline}`,
        background: T.sheet, borderRadius: 3, padding: "12px 4px", textAlign: "center",
        cursor: "pointer", fontFamily: "inherit",
      }}>
      <div style={{ fontFamily: T.jpFont, fontSize: 38, lineHeight: 1.1 }}>{k}</div>
      <div style={{ fontSize: 13, color: T.sub, letterSpacing: ".5px", marginTop: 4 }}>
        {ALT_SOUND[k] ? `${ALT_SOUND[k]} · ${sound}` : sound}
      </div>
    </button>
  );

  return (
    <div>
      {/* Page rail: tap to jump. Character pages show their kana and go green
          once walked; section pages are dots. */}
      {pages.length > 1 && (
        <div style={{ display: "flex", gap: 6, marginBottom: 14, alignItems: "center", flexWrap: "wrap" }}>
          {pages.map((pg, n) => pg.ch ? (
            <button key={pg.id} onClick={() => setPage(n)} style={{
              width: 28, height: 28, borderRadius: 999, padding: 0, cursor: "pointer",
              fontFamily: T.jpFont, fontSize: 14, lineHeight: 1,
              background: n === page ? T.ink : walked.includes(pg.ch) ? T.ok : "none",
              color: n === page || walked.includes(pg.ch) ? T.paper : T.sub,
              border: `1px solid ${n === page ? T.ink : walked.includes(pg.ch) ? T.ok : T.hairline}`,
            }}>{pg.ch}</button>
          ) : (
            <button key={pg.id} onClick={() => setPage(n)} aria-label={pg.label} title={pg.label}
              style={{
                width: 12, height: 12, borderRadius: 999, padding: 0, cursor: "pointer",
                background: n === page ? T.ink : "none",
                border: `1px solid ${n === page ? T.ink : T.hairline}`,
              }} />
          ))}
        </div>
      )}

      {cur.id === "about" && (
        <div>
          {String(mod.exp).split("\n\n").map((para, i) => (
            <p key={i} style={{ fontSize: 15, lineHeight: 1.75, marginTop: i === 0 ? 0 : 14 }}>{para}</p>
          ))}
        </div>
      )}

      {cur.ch && (
        <WalkPage key={cur.ch} ch={cur.ch} modId={mod.id} progress={progress}
          onProgress={onProgress}
          onAdvance={() => setPage((p) => Math.min(p + 1, pages.length - 1))} />
      )}

      {cur.id === "chart" && col && (
        <div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {col.kana.map((k, i) =>
              k ? charBtn(k, i, col.sounds[i]) : (
                <div key={i} style={{
                  flex: "1 1 80px", border: `1px dashed ${T.hairline}`, borderRadius: 3, padding: "12px 4px",
                  textAlign: "center", color: "#C9C7BF", fontSize: 12,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>none</div>
              )
            )}
          </div>
          <p style={{ fontSize: 11, color: T.sub, marginTop: 8, marginBottom: 0 }}>
            Tap any character to watch it written.{CHART_NOTE ? " " + CHART_NOTE : ""}
          </p>
          <StrokePanel ch={sel} onClose={() => setSel(null)} onPractise={onPractise} />
        </div>
      )}

      {cur.id === "combined" && <YouonChart />}

      {cur.id === "traps" && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".5px", color: T.sub, marginBottom: 8 }}>
            WATCH THEM WRITTEN
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {traps.map((k, i) => charBtn(k, i, soundFor(k)))}
          </div>
          <p style={{ fontSize: 11, color: T.sub, marginTop: 8, marginBottom: 0 }}>
            The difference is in the movement, not the finished shape. Tap each one.
          </p>
          <StrokePanel ch={sel} onClose={() => setSel(null)} onPractise={onPractise} />
        </div>
      )}

      {cur.id === "words" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {(mod.showcase || []).map((w, i) => (
            <div key={i} style={{
              border: `1px solid ${T.hairline}`, borderLeft: `3px solid ${T.ok}`,
              background: T.sheet, borderRadius: 4, padding: "12px 16px",
            }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
                <span style={{ fontFamily: T.jpFont, fontSize: 22 }}>{w.kana}</span>
                <span style={{ fontSize: 14, color: T.ink, fontWeight: 600 }}>{w.en}</span>
              </div>
              <div style={{ fontSize: 13, color: T.sub, lineHeight: 1.6, marginTop: 5 }}>{w.note}</div>
            </div>
          ))}
        </div>
      )}

      {cur.id === "notes" && (
        <div style={{
          background: T.noteBg, border: `1px solid ${T.note}44`, borderLeft: `3px solid ${T.note}`,
          borderRadius: 4, padding: "12px 16px",
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".5px", color: T.note, marginBottom: 8 }}>
            WORTH KNOWING
          </div>
          {mod.notes.map((n, i) => (
            <div key={i} style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 5 }}>{n}</div>
          ))}
        </div>
      )}

      {pages.length > 1 && (
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button className="btn-ghost" onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            style={{ flex: 1, padding: "12px 0", opacity: page === 0 ? 0.4 : 1 }}>‹ Back</button>
          {!last ? (
            <button className="btn-primary" onClick={() => setPage((p) => Math.min(p + 1, pages.length - 1))}
              style={{ flex: 2, padding: "12px 0" }}>Next ›</button>
          ) : onFinish ? (
            <button className="btn-primary" onClick={onFinish}
              style={{ flex: 2, padding: "12px 0" }}>{finishLabel || "Next ›"}</button>
          ) : null}
        </div>
      )}
    </div>
  );
}

// ————— Drill —————
function Drill({ mod, idx, progress, onProgress, onGoTrace }) {
  const { pool, focus } = useMemo(() => {
    const seen = [...availableAt(idx)].filter((k) => k !== "ー");
    let f;
    if (mod.col) {
      const c = COLS.find((x) => x.key === mod.col);
      f = c.kana.filter(Boolean);
      if (mod.id === "wa") f = [...f, "ン"];
    } else if (mod.dakuten && !mod.small) {
      f = [...new Set([...Object.values(DAKUTEN), ...Object.values(HANDAKU)])].filter((k) => k !== "ヴ");
    } else if (mod.ext) {
      f = ["ヴ", "ァ", "ィ", "ゥ", "ェ", "ォ"];
    } else f = seen;
    return { pool: seen, focus: f };
  }, [mod.id, idx]);

  const make = () => {
    const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);
    const core = shuffle(focus);
    const review = shuffle(pool.filter((k) => !focus.includes(k)));
    return [...core, ...review].slice(0, Math.max(core.length, Math.min(10, pool.length)));
  };

  const [queue, setQueue] = useState([]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [showRomaji, setShowRomaji] = useState(false);
  const { playSound, canPlaySound } = useKanaAudio();

  useEffect(() => {
    setQueue(make()); setI(0); setPicked(null); setScore(0); setDone(false);
  }, [mod.id, idx]);

  const target = queue[i];

  // Play on arrival so the drill is listening-first without needing a tap,
  // and hide the romaji again for each new question. MUST sit above the
  // early returns below — a hook after a conditional return runs on some
  // renders and not others, which is "Rendered more hooks than during the
  // previous render" and a white screen.
  useEffect(() => {
    setShowRomaji(false);
    if (target) playSound(soundFor(target), target);
  }, [target]);

  const opts = useMemo(() => {
    if (!target) return [];
    const wrong = pool.filter((k) => k !== target).sort(() => Math.random() - 0.5).slice(0, 5);
    return [...wrong, target].sort(() => Math.random() - 0.5);
  }, [target, i, queue]);

  if (done) {
    const pct = queue.length ? score / queue.length : 0;
    return (
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <div style={{ fontFamily: T.jpFont, fontSize: 34, color: pct >= 0.8 ? T.ok : T.ink }}>
          {score} / {queue.length}
        </div>
        <Flourish
          title={pct === 1 ? "Every one." : pct >= 0.8 ? "Nearly clean." : "Drill finished."}
          detail={pct >= 0.8
            ? "Recognition is there. Tracing is what makes it stick — that is the next tab."
            : "Worth another run before you trace them; the shapes land better once the sounds are solid."}
          nextLabel="Go to Trace"
          onNext={onGoTrace}
          onAgain={() => { setQueue(make()); setI(0); setPicked(null); setScore(0); setDone(false); }}
        />
      </div>
    );
  }
  if (!target) return null;

  const pick = (k) => { if (picked) return; setPicked(k); if (k === target) setScore((s) => s + 1); };
  const next = () => {
    if (i + 1 < queue.length) { setI(i + 1); setPicked(null); }
    else {
      setDone(true);
      const prev = progress[mod.id] || {};
      onProgress({ ...progress, [mod.id]: { ...prev, drill: Math.max(prev.drill || 0, score), drillOf: queue.length } });
    }
  };

  return (
    <div>
      <div style={{ fontSize: 12, color: T.sub, marginBottom: 14 }}>{i + 1} of {queue.length} · Score {score}</div>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: T.sub, marginBottom: 10 }}>Tap the character you hear</div>
        {/* drill-audio-v1 — prompting in romaji taught the romaji: the learner read
            "ka" and matched letters. The prompt is now the sound itself. Romaji
            stays one tap away, because a learner on a silent bus or a device with
            no audio must still be able to finish. */}
        <button onClick={() => playSound(soundFor(target), target)}
                disabled={!canPlaySound(soundFor(target))}
                aria-label="Play the sound again"
                style={{
                  fontSize: 30, padding: "14px 30px", borderRadius: 999, cursor: "pointer",
                  border: `1px solid ${T.hairline}`, background: T.sheet, color: T.ink,
                  opacity: canPlaySound(soundFor(target)) ? 1 : 0.45,
                }}>♪</button>
        {!canPlaySound(soundFor(target)) ? (
          <div style={{ fontSize: 34, letterSpacing: "2px", fontWeight: 300, marginTop: 10 }}>
            {soundFor(target)}
          </div>
        ) : (
          <div style={{ marginTop: 8, minHeight: 26 }}>
            {showRomaji
              ? <span style={{ fontSize: 22, letterSpacing: "2px", fontWeight: 300 }}>{soundFor(target)}</span>
              : <button className="btn-ghost" style={{ fontSize: 12 }}
                        onClick={() => setShowRomaji(true)}>Show the romaji</button>}
          </div>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        {opts.map((k, n) => {
          const right = picked && k === target;
          const wrongPick = picked === k && k !== target;
          return (
            <button key={n} onClick={() => pick(k)} style={{
              padding: "16px 0", fontFamily: T.jpFont, fontSize: 32, borderRadius: 4,
              cursor: picked ? "default" : "pointer",
              background: right ? "#EDF4EE" : wrongPick ? "#FBEDEA" : T.sheet,
              border: `1px solid ${right ? T.ok : wrongPick ? T.shu : T.hairline}`, color: T.ink,
            }}>{k}</button>
          );
        })}
      </div>
      {picked && (
        <div style={{ marginTop: 16, fontSize: 14, lineHeight: 1.6 }}>
          {picked === target ? <span style={{ color: T.ok, fontWeight: 600 }}>Correct.</span> : (
            <span>
              <span style={{ color: T.shu, fontWeight: 600 }}>Not quite. </span>
              <span style={{ fontFamily: T.jpFont, fontSize: 17 }}>{picked}</span> is {soundFor(picked)}.
              {isConfusable(picked, target) && (
                <span style={{ color: T.note }}> These two are near-twins — the difference is stroke direction, not outline.</span>
              )}
            </span>
          )}
          <div style={{ marginTop: 12 }}>
            <button className="btn-primary" onClick={next}>{i + 1 < queue.length ? "Next" : "Finish"}</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ————— Speech (word playback) —————
// On-device synthesis via the browser. This sidesteps the redistribution terms
// attached to cloud TTS, and costs nothing. Quality varies by device and
// pitch-accent is unreliable.
//
// Single kana no longer come from here — see the recorded audio block below.
// Whole words still do, deliberately: stitching recorded mora into a word gives
// flat, evenly spaced syllables with no pitch accent and no coarticulation,
// which would teach the wrong prosody in the one activity that is specifically
// about hearing a real word. Recorded word audio is its own recording session.
function useJapaneseVoice() {
  const [voice, setVoice] = useState(null);
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) { setChecked(true); return; }
    const pick = () => {
      const vs = window.speechSynthesis.getVoices() || [];
      const ja = vs.find((v) => (v.lang || "").toLowerCase().replace("_", "-").startsWith("ja"));
      if (ja) setVoice(ja);
      if (vs.length) setChecked(true);
    };
    pick();
    window.speechSynthesis.onvoiceschanged = pick;
    const t = setTimeout(() => setChecked(true), 1500);
    return () => { window.speechSynthesis.onvoiceschanged = null; clearTimeout(t); };
  }, []);
  return { voice, checked, supported: typeof window !== "undefined" && !!window.speechSynthesis };
}
function speak(text, voice) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ja-JP";
  if (voice) u.voice = voice;
  u.rate = 0.8;
  window.speechSynthesis.speak(u);
}

// ————— Recorded kana audio —————
// Native recordings, cut and loudness-matched by Audio/split-kana-audio.py and
// packed into a single sprite by Audio/build-kana-sprite.py: 102 distinct
// sounds in ~736 KB, one fetch, decoded once, played by offset.
//
// Keyed by sound, not by character, so じ and ぢ share a clip — they are
// homophones and the sprite folds them onto one key.
//
// Degrades quietly. If the sprite cannot be fetched (a published artifact frame
// blocks relative fetches) or a sound has no clip yet, playback falls through to
// speech synthesis and nothing in the UI changes. Currently unrecorded: the
// katakana extended set — vu, fa, fo, ti, tu, che.
const SPRITE_BASE = "./audio";   // where kana-sprite.mp3 and .json are served

// Substituted by Audio/build-artifact-bundle.py when packing a standalone,
// single-file build — an artifact frame has no second file to fetch. Left null
// here so the app source and the shareable build never diverge: the bundler
// rewrites this one line rather than keeping a second copy of the module.
// Shape when set: { clips: { sound: [offset, duration] }, mp3: "<base64>" }
const SPRITE_INLINE = null;

let _actx = null, _abuf = null, _amap = null, _aload = null;

function spriteBytesFromBase64(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out.buffer;
}

function loadKanaSprite() {
  if (_aload) return _aload;
  _aload = (async () => {
    if (typeof window === "undefined") return false;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    let clips, bytes;
    if (SPRITE_INLINE) {
      clips = SPRITE_INLINE.clips;
      bytes = spriteBytesFromBase64(SPRITE_INLINE.mp3);
    } else {
      const [spec, audio] = await Promise.all([
        fetch(SPRITE_BASE + "/kana-sprite.json"),
        fetch(SPRITE_BASE + "/kana-sprite.mp3"),
      ]);
      if (!spec.ok || !audio.ok) return false;
      clips = (await spec.json()).clips;
      bytes = await audio.arrayBuffer();
    }
    if (!clips) return false;
    _actx = new AC();
    _abuf = await _actx.decodeAudioData(bytes);
    _amap = clips;
    return true;
  })().catch(() => false);
  return _aload;
}

// Characters that are real but have no sound of their own: a small っ is a beat
// of silence, small ゃゅょ never stand alone, ー only lengthens what precedes it.
// These get no play control rather than a control that does nothing.
function isSilentUnit(ch) {
  const s = soundFor(ch);
  return !s || s === "?" || s === "long vowel" || s.indexOf("small ") === 0;
}

function playRecorded(sound) {
  if (!_actx || !_abuf || !_amap) return false;
  const at = _amap[sound];
  if (!at) return false;
  if (_actx.state === "suspended") _actx.resume();
  const src = _actx.createBufferSource();
  src.buffer = _abuf;
  src.connect(_actx.destination);
  src.start(0, at[0], at[1]);
  return true;
}

function useKanaAudio() {
  const [ready, setReady] = useState(!!_amap);
  const { voice, supported } = useJapaneseVoice();
  useEffect(() => {
    let live = true;
    loadKanaSprite().then((ok) => { if (live) setReady(ok); });
    return () => { live = false; };
  }, []);
  // Play by sound rather than by character. A yōon is two characters carrying
  // one recorded mora, so keying playback on a single character — as this hook
  // originally did — left every きゃ clip unreachable. `spoken` is what speech
  // synthesis says if there is no recording for that sound.
  // Returns what actually happened, so a caller can tell recorded from synth.
  const playSound = (sound, spoken) => {
    if (!sound) return "silent";
    if (playRecorded(sound)) return "recorded";
    speak(spoken || sound, voice);
    return "synth";
  };
  const canPlaySound = (sound) => !!sound && (ready || supported);
  const play = (ch) => (isSilentUnit(ch) ? "silent" : playSound(soundFor(ch), ch));
  const canPlay = (ch) => !isSilentUnit(ch) && canPlaySound(soundFor(ch));
  return { play, canPlay, playSound, canPlaySound, ready };
}


// ————— Write —————
function Write({ mod, idx, progress, onProgress, listen }) {
  const words = mod.words || [];
  const enabled = useMemo(() => availableAt(idx), [idx]);
  const { voice, checked, supported } = useJapaneseVoice();
  const [wi, setWi] = useState(0);
  const [val, setVal] = useState("");
  const [result, setResult] = useState(null);
  const [cleared, setCleared] = useState(0);

  useEffect(() => { setWi(0); setVal(""); setResult(null); setCleared(0); }, [mod.id]);
  if (!words.length) {
    return <p style={{ fontSize: 14, color: T.sub }}>
      No words yet — five vowels aren't enough to spell a katakana word. The next lesson opens this up.
    </p>;
  }

  const w = words[wi];
  const modify = (kind) => {
    if (result) return;
    setVal((v) => {
      if (!v) return v;
      const last = v.slice(-1);
      const map = kind === "dakuten" ? DAKUTEN : kind === "handaku" ? HANDAKU : SMALL;
      return map[last] ? v.slice(0, -1) + map[last] : v;
    });
  };

  const check = () => {
    if (!val) return;
    if (val === w.kana) { setResult({ ok: true }); setCleared((c) => c + 1); return; }
    const a = Array.from(val), b = Array.from(w.kana);
    let at = 0;
    while (at < Math.max(a.length, b.length) && a[at] === b[at]) at++;
    const got = a[at], want = b[at];
    let msg;
    if (got === undefined) msg = `Too short — this word is ${b.length} beats and you wrote ${a.length}.`;
    else if (want === undefined) msg = `Too long — this word is ${b.length} beats and you wrote ${a.length}.`;
    else if (want === "ー") msg = `Beat ${at + 1} is a long vowel. Tap the ー bar rather than repeating the vowel.`;
    else if (SMALL[got] === want) msg = `Beat ${at + 1} needs to be small. Type it, then tap "small".`;
    else if (SMALL[want] === got) msg = `Beat ${at + 1} should be full size, not small.`;
    else if (DAKUTEN[got] === want) msg = `Beat ${at + 1} needs a dakuten. Type ${got}, then tap ゛.`;
    else if (HANDAKU[got] === want) msg = `Beat ${at + 1} needs a handakuten. Type ${got}, then tap ゜.`;
    else if (isConfusable(got, want)) msg = `Beat ${at + 1}: you wrote ${got} (${soundFor(got)}), this word wants ${want} (${soundFor(want)}). These two differ by stroke direction — worth a careful look.`;
    else msg = `Beat ${at + 1}: you wrote ${got} (${soundFor(got)}), this word wants ${want} (${soundFor(want)}).`;
    setResult({ ok: false, msg });
  };

  const next = () => {
    if (wi + 1 < words.length) { setWi(wi + 1); setVal(""); setResult(null); }
    else {
      const prev = progress[mod.id] || {};
      const key = listen ? "heard" : "written";
      onProgress({ ...progress, [mod.id]: { ...prev, [key]: Math.max(prev[key] || 0, cleared) } });
      setWi(0); setVal(""); setResult(null); setCleared(0);
    }
  };

  return (
    <div>
      <div style={{ fontSize: 12, color: T.sub, marginBottom: 12 }}>Word {wi + 1} of {words.length}</div>
      <div style={{ fontSize: 13, color: T.sub, marginBottom: 8 }}>
        {listen ? "Listen, then tap out what you hear" : "Assemble this word — one character per box"}
      </div>
      {listen ? (
        <div style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          {supported && (voice || !checked) ? (
            <button className="btn-primary" onClick={() => speak(w.kana, voice)}
              style={{ fontSize: 15, padding: "10px 24px" }}>
              ▶ Play{result?.ok ? " again" : ""}
            </button>
          ) : (
            <div style={{
              padding: "12px 16px", borderRadius: 4, background: T.noteBg,
              border: `1px solid ${T.note}44`, fontSize: 13, lineHeight: 1.6,
            }}>
              No Japanese voice is available on this device, so this activity can't run here.
              Listen &amp; Write covers the same words and falls back to their meaning
              as the prompt, so nothing is lost. Listen is optional either way — it
              does not gate finishing the lesson.
            </div>
          )}
          {result?.ok && <span style={{ fontSize: 14, color: T.sub }}>{w.en}</span>}
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 14, flexWrap: "wrap" }}>
          <div style={{ fontSize: 25, letterSpacing: "1px" }}>
            {w.mora.map((m, i) => (
              <span key={i}>{i > 0 && <span style={{ color: "#C9C7BF", margin: "0 7px" }}>·</span>}{m}</span>
            ))}
          </div>
          <div style={{ fontSize: 14, color: T.sub }}>{w.en}</div>
        </div>
      )}

      <Squares value={result?.ok ? w.kana : val} length={Array.from(w.kana).length} reveal={result?.ok} />

      {!result && (
        <KanaPad enabled={enabled} onInsert={(ch) => setVal((v) => v + ch)} onModify={modify}
          onBack={() => setVal((v) => v.slice(0, -1))} onClear={() => setVal("")} />
      )}

      <div style={{ marginTop: 16 }}>
        {!result ? (
          <button className="btn-primary" onClick={check} disabled={!val}>Check</button>
        ) : (
          <div>
            <div style={{
              padding: "12px 16px", borderRadius: 4, fontSize: 14, lineHeight: 1.6, marginBottom: 12,
              background: result.ok ? "#EDF4EE" : "#FBEDEA",
              border: `1px solid ${result.ok ? T.ok : T.shu}55`,
            }}>
              <strong style={{ color: result.ok ? T.ok : T.shu }}>{result.ok ? "Correct. " : "Not yet. "}</strong>
              {result.ok
                ? <span><span style={{ fontFamily: T.jpFont }}>{w.kana}</span> — {w.en}</span>
                : result.msg}
            </div>
            {result.ok
              ? <button className="btn-primary" onClick={next}>{wi + 1 < words.length ? "Next word" : "Start over"}</button>
              : <button className="btn-ghost" onClick={() => setResult(null)}>Try again</button>}
          </div>
        )}
      </div>
    </div>
  );
}

// ————— Judgment drill (skill builders) —————
// Two item shapes: a bare sound prompt, or a word with one character removed.
function Judge({ mod, progress, onProgress }) {
  const items = mod.judge || [];
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  useEffect(() => { setI(0); setPicked(null); setScore(0); setDone(false); }, [mod.id]);
  if (!items.length) return null;

  if (done) {
    const perfect = score === items.length;
    return (
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <div style={{ fontFamily: T.jpFont, fontSize: 34, color: perfect ? T.ok : T.ink }}>
          {score} / {items.length}
        </div>
        <p style={{ fontSize: 14, color: T.sub }}>
          {perfect ? "Nothing left to hold over you." : "Count the strokes, then check the direction. Run it again."}
        </p>
        <button className="btn-ghost" onClick={() => { setI(0); setPicked(null); setScore(0); setDone(false); }}>Again</button>
      </div>
    );
  }

  const it = items[i];
  const pick = (o) => { if (picked) return; setPicked(o); if (o === it.answer) setScore((sc) => sc + 1); };
  const next = () => {
    if (i + 1 < items.length) { setI(i + 1); setPicked(null); }
    else {
      setDone(true);
      const prev = progress[mod.id] || {};
      onProgress({ ...progress, [mod.id]: { ...prev, judged: Math.max(prev.judged || 0, score) } });
    }
  };
  const blankColor = picked ? (picked === it.answer ? T.ok : T.shu) : T.shu;

  return (
    <div>
      <div style={{ fontSize: 12, color: T.sub, marginBottom: 16 }}>{i + 1} of {items.length} · Score {score}</div>

      {it.prompt ? (
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: T.sub, marginBottom: 6 }}>Which one is</div>
          <div style={{ fontSize: 42, letterSpacing: "2px", fontWeight: 300 }}>{it.prompt}</div>
        </div>
      ) : (
        <>
          <div style={{ fontFamily: T.jpFont, fontSize: 30, lineHeight: 1.9, marginBottom: 6, textAlign: "center" }}>
            {it.before}
            <span style={{
              display: "inline-block", minWidth: 46, borderBottom: `2px solid ${blankColor}`,
              color: picked ? blankColor : "transparent",
            }}>{picked || "＿"}</span>
            {it.after}
          </div>
          <div style={{ fontSize: 13, color: T.sub, textAlign: "center", marginBottom: 18 }}>{it.en}</div>
        </>
      )}

      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        {it.options.map((o) => {
          const right = picked && o === it.answer;
          const wrongPick = picked === o && o !== it.answer;
          return (
            <button key={o} onClick={() => pick(o)} style={{
              padding: "14px 30px", fontFamily: T.jpFont, fontSize: 30, borderRadius: 4,
              cursor: picked ? "default" : "pointer",
              background: right ? "#EDF4EE" : wrongPick ? "#FBEDEA" : T.sheet,
              border: `1px solid ${right ? T.ok : wrongPick ? T.shu : T.hairline}`, color: T.ink,
            }}>{o}</button>
          );
        })}
      </div>

      {picked && (
        <div style={{ marginTop: 16, fontSize: 14, lineHeight: 1.6, textAlign: "center" }}>
          <span style={{ color: picked === it.answer ? T.ok : T.shu, fontWeight: 600 }}>
            {picked === it.answer ? "Correct. " : "Not quite. "}
          </span>
          {it.why}
          <div style={{ marginTop: 12 }}>
            <button className="btn-primary" onClick={next}>{i + 1 < items.length ? "Next" : "Finish"}</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ————— Stroke practice —————
// Scoring works off the same SVG API the animation uses: getPointAtLength()
// samples any reference stroke into comparable points, so no library is needed.
// TOL is in units of the 109-box and is deliberately lenient — these numbers
// need tuning against real handwriting on a phone before they mean anything.









// Compares a learner stroke to a reference. Direction is caught by scoring the
// reference both ways round: if reversed fits clearly better, they drew it
// backwards — right shape, wrong movement.


// ————— Calibration & attempt logging —————
// The Trace stage shows a visible ghost, so a learner tracing it is producing
// near-best-case output for THEIR hand and THEIR input device. Those distances
// are a free per-user noise floor; thresholds are set as a multiple of it rather
// than as fixed constants, so a finger on a phone and a stylus on a tablet get
// held to the same relative standard.
//
// Raw points are logged too, resampled but not scored, so attempts can be
// re-scored offline with any algorithm later. Logging only the score would mean
// re-collecting from scratch every time the maths changes.

        // samples before the floor is trusted
      // rolling calibration window
     // rolling attempt log
       // points retained per attempt



// Multipliers come from the synthetic separation analysis: correct-with-tremor
// stays well under the point where wrong strokes begin. Clamps stop a freakishly
// steady or freakishly shaky calibration from producing a useless bar.






const STAGES = [
  { id: "trace", label: "Trace", blurb: "Follow the grey stroke. This is about the movement, not accuracy." },
  { id: "guided", label: "Guided", blurb: "Earlier strokes stay. Draw the next one from memory." },
  { id: "blank", label: "Blank", blurb: "Nothing shown. Order is yours to get right now." },
];



// ————— What the practice pad offers —————
// Built from the module's own tables rather than from the stroke data, so the
// pad can only ever offer characters the course actually teaches. Obsolete kana
// are gone entirely; ヰ, ヱ and the ヷ series were dropped long ago, and ヲ is excluded because the course teaches it for recognition only.
const PAD_EXCLUDE = new Set(["ヲ"]);
const MODERN_KANA = new Set(
  [
    ...COLS.flatMap((c) => c.kana),
    ...Object.values(DAKUTEN),
    ...Object.values(HANDAKU),
    ...Object.values(SMALL),
    "ン", "ー",
  ].filter((ch) => ch && !PAD_EXCLUDE.has(ch))
);
// ————— Derived practice sets —————
// The voiced lesson teaches no new shapes, so the walk covers one per series —
// the five the lesson itself names — while Trace offers all twenty-five.
const VOICED_WALK = [
  ...["ka", "sa", "ta", "ha"].map((k) => DAKUTEN[((COLS.find((c) => c.key === k) || {}).kana || [])[0]]),
  HANDAKU[((COLS.find((c) => c.key === "ha") || {}).kana || [])[0]],
].filter(Boolean);
const VOICED_ALL = [...Object.values(DAKUTEN), ...Object.values(HANDAKU)].filter((c) => STROKES[c]);

// Every combined sound in ordinary use. The T-row voiced base is left out on
// purpose: ぢゃ and its relatives are not written in modern Japanese.
const YOUON_PAIRS = (() => {
  const y = COLS.find((c) => c.key === "ya");
  const smalls = y ? [y.kana[0], y.kana[2], y.kana[4]].map((c) => SMALL[c]).filter(Boolean) : [];
  const bases = [];
  ["ka", "sa", "ta", "na", "ha", "ma", "ra"].forEach((key) => {
    const col = COLS.find((c) => c.key === key);
    const base = col && col.kana[1];
    if (!base) return;
    bases.push(base);
    if (key !== "ta") {
      if (DAKUTEN[base]) bases.push(DAKUTEN[base]);
      if (HANDAKU[base]) bases.push(HANDAKU[base]);
    }
  });
  return bases
    .flatMap((b) => smalls.map((s) => b + s))
    .filter((p) => Array.from(p).every((c) => STROKES[c]));
})();

const LOOKUP_CHARS = Object.keys(STROKES)
  .filter((c) => MODERN_KANA.has(c))
  .sort((a, b) => a.codePointAt(0) - b.codePointAt(0));

// ————— Free writing pad —————
// Deliberately not the grader. This asks a different question — is what you
// wrote legible to a machine — and it is honest about that, because handwriting
// recognisers are built to tolerate wrong stroke order and would happily accept
// a character formed completely incorrectly.
function FreePad({ onBack, allowed, embedded }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const strokes = useRef([]);
  const current = useRef([]);
  const [status, setStatus] = useState("idle");
  const [reading, setReading] = useState(null);
  const [supported, setSupported] = useState(null);
  const [ref, setRef] = useState(null);
  const [refMode, setRefMode] = useState("glyph");
  const W = 320, H = 320;

  useEffect(() => {
    setSupported(typeof navigator !== "undefined" && "createHandwritingRecognizer" in navigator);
  }, []);

  const redraw = () => {
    const cv = canvasRef.current;
    if (!cv) return;
    const g = cv.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    if (cv.width !== W * dpr) { cv.width = W * dpr; cv.height = H * dpr; }
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    g.fillStyle = T.sheet; g.fillRect(0, 0, W, H);
    g.strokeStyle = T.hairline; g.lineWidth = 1;
    g.setLineDash([4, 4]);
    g.beginPath(); g.moveTo(W / 2, 0); g.lineTo(W / 2, H); g.moveTo(0, H / 2); g.lineTo(W, H / 2); g.stroke();
    g.setLineDash([]);
    const poly = (pts) => {
      if (pts.length < 2) return;
      g.strokeStyle = T.ink; g.lineWidth = 9; g.lineCap = "round"; g.lineJoin = "round";
      g.beginPath(); g.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y);
      g.stroke();
    };
    strokes.current.forEach(poly);
    poly(current.current);
  };
  useEffect(redraw, []);

  const at = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H, t: Date.now() };
  };
  const down = (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    drawing.current = true; current.current = [at(e)]; setReading(null); redraw();
  };
  const move = (e) => { if (drawing.current) { current.current.push(at(e)); redraw(); } };
  const up = () => {
    if (!drawing.current) return;
    drawing.current = false;
    if (current.current.length > 1) strokes.current.push(current.current);
    current.current = []; redraw();
  };
  const clear = () => { strokes.current = []; current.current = []; setReading(null); redraw(); };

  const read = async () => {
    if (!strokes.current.length) return;
    setStatus("reading"); setReading(null);
    try {
      const rec = await navigator.createHandwritingRecognizer({ languages: ["ja"] });
      const d = rec.startDrawing({ recognitionType: "text", inputType: "touch" });
      for (const s of strokes.current) {
        const hs = new window.HandwritingStroke();
        const t0 = s[0].t;
        s.forEach((p) => hs.addPoint({ x: p.x, y: p.y, t: p.t - t0 }));
        d.addStroke(hs);
      }
      const preds = await d.getPrediction();
      setReading(preds && preds.length ? preds.slice(0, 3).map((p) => p.text) : []);
      setStatus("idle");
      rec.finish?.();
    } catch (err) {
      setStatus("error");
      setReading(null);
    }
  };

  return (
    <div>
      {!embedded && (
        <button className="btn-ghost" onClick={onBack} style={{ marginBottom: 16 }}>← All lessons</button>
      )}
      <h2 style={{ fontSize: 22, margin: "0 0 6px" }}>Free writing pad</h2>
      <p style={{ fontSize: 14, color: T.sub, lineHeight: 1.7, marginTop: 0 }}>
        Open canvas, any character you like. Look one up on the right to put a reference beside you —
        the finished shape to compare against, or the animation to watch the movement again.{" "}
        You can also ask the machine to read your writing back, but treat that as a legibility check
        rather than a grade: a recogniser will happily accept a character formed in completely the
        wrong order, so a pass means it <em>looks</em> right, not that you wrote it right. The stroke
        practice in each lesson is the one that checks how you got there.
      </p>

      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div>
          <canvas
            ref={canvasRef}
            style={{
              width: W, height: H, maxWidth: "100%", borderRadius: 3, touchAction: "none",
              border: `1px solid ${T.hairline}`, cursor: "crosshair", display: "block", background: T.sheet,
            }}
            onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onPointerLeave={up}
          />
          <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <button className="btn-primary" onClick={read} disabled={supported === false || status === "reading"}>
              {status === "reading" ? "Reading…" : "Read it back"}
            </button>
            <button className="btn-ghost" onClick={clear}>Clear</button>
          </div>
        </div>

        <div style={{ flex: "1 1 300px", minWidth: 260 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".5px", color: T.sub, marginBottom: 8 }}>
            LOOK UP A CHARACTER
          </div>
          <div style={{
            display: "flex", flexWrap: "wrap", gap: 3, maxHeight: 132, overflowY: "auto",
            padding: 6, border: `1px solid ${T.hairline}`, borderRadius: 4, background: T.paper,
          }}>
            {LOOKUP_CHARS.filter((c) => !allowed || allowed.has(c)).map((c) => (
              <button key={c} onClick={() => setRef(ref === c ? null : c)} style={{
                fontFamily: T.jpFont, fontSize: 17, padding: "4px 8px", borderRadius: 3, cursor: "pointer",
                background: ref === c ? T.ink : T.sheet, color: ref === c ? T.paper : T.ink,
                border: `1px solid ${ref === c ? T.ink : T.hairline}`, minWidth: 30,
              }}>{c}</button>
            ))}
          </div>

          {ref ? (
            <div style={{ marginTop: 12 }}>
              {refMode === "glyph" ? (
                <div style={{
                  width: 168, height: 168, borderRadius: 3, background: T.sheet,
                  border: `1px solid ${T.hairline}`, display: "flex", alignItems: "center",
                  justifyContent: "center", fontFamily: T.jpFont, fontSize: 120, lineHeight: 1,
                }}>{ref}</div>
              ) : (
                <StrokeView ch={ref} size={168} auto />
              )}
              <div style={{ marginTop: 6, display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
                <span style={{ fontSize: 14, color: T.sub }}>{ref} — {soundFor(ref)}</span>
                <button className="btn-ghost" style={{ fontSize: 11, padding: "3px 10px" }}
                  onClick={() => setRefMode(refMode === "glyph" ? "animate" : "glyph")}>
                  {refMode === "glyph" ? "watch it written" : "show the character"}
                </button>
              </div>
            </div>
          ) : (
            <p style={{ fontSize: 13, color: T.sub, lineHeight: 1.6, marginTop: 12 }}>
              Pick a character to put a reference beside your canvas — either the finished shape to
              compare against, or the animation to watch the movement again.
            </p>
          )}
        </div>
      </div>

      {supported === false && (
        <div style={{
          marginTop: 12, padding: "12px 16px", borderRadius: 4, background: T.noteBg,
          border: `1px solid ${T.note}44`, fontSize: 13, lineHeight: 1.6,
        }}>
          This browser has no handwriting recognition, so nothing can read it back — the pad still
          works if you just want somewhere to practise. Support is Chromium-only and also depends on
          the operating system having Japanese handwriting models installed.
        </div>
      )}
      {status === "error" && (
        <div style={{
          marginTop: 12, padding: "12px 16px", borderRadius: 4, background: "#FBEDEA",
          border: `1px solid ${T.shu}44`, fontSize: 13, lineHeight: 1.6,
        }}>
          The recogniser refused the request. That happens when Japanese handwriting models aren't
          installed, or when the browser throttles repeated calls.
        </div>
      )}
      {reading && (
        <div style={{
          marginTop: 12, padding: "12px 16px", borderRadius: 4, background: T.sheet,
          border: `1px solid ${T.hairline}`,
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".5px", color: T.sub, marginBottom: 8 }}>
            READ AS
          </div>
          {reading.length ? (
            <div style={{ fontFamily: T.jpFont, fontSize: 26, lineHeight: 1.7 }}>
              {reading.map((r, i) => (
                <span key={i} style={{ marginRight: 16, color: i === 0 ? T.ink : T.sub }}>{r}</span>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 14, color: T.sub }}>Nothing recognisable — try writing larger.</div>
          )}
        </div>
      )}
    </div>
  );
}

const KANA_N = "ン";

// ————— Character walkthrough —————
// Meeting five characters at once is a reference chart, not a lesson. This
// steps through them one at a time: watch it written, then trace it twice,
// then move on. The whole-row chart and the drills come after.
const WALK_REPS = 2;

function walkCharsFor(mod) {
  if (mod.col) {
    const c = COLS.find((x) => x.key === mod.col);
    const out = c ? c.kana.filter(Boolean) : [];
    return mod.id === "wa" ? [...out, KANA_N] : out;
  }
  if (mod.id === "dakuten") return VOICED_WALK;
  return mod.walk || [];
}

// Trace is a picker rather than a sequence, so it can offer the full voiced set.
function traceCharsFor(mod) {
  if (mod.col) {
    const c = COLS.find((x) => x.key === mod.col);
    const out = c ? c.kana.filter(Boolean) : [];
    return mod.id === "wa" ? [...out, KANA_N] : out;
  }
  if (mod.id === "dakuten") return VOICED_ALL;
  return mod.walk || mod.show || [];
}

// ————— Shared handwriting box —————
// Extracted from the character walk (now WalkPage) so the pair practice and Listen & Write can both
// reuse the stroke scoring. The canvas keeps a fixed internal resolution and is
// sized by CSS, so two of them can shrink side by side on a phone without the
// pointer maths drifting — toBox reads the live bounding box.
function TraceBox({ ch, guide = true, onComplete, res = 200, caption }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const currentRef = useRef([]);
  const pointerType = useRef("unknown");
  const [strokeIdx, setStrokeIdx] = useState(0);
  const [drawn, setDrawn] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [misses, setMisses] = useState(0);
  const [peek, setPeek] = useState(false);   // hint showing for THIS stroke only
  const [hinted, setHinted] = useState(false); // any hint used on this character
  const { floor, record } = useStrokeData();
  const tol = tolerancesFor(floor);
  const paths = (ch && STROKES[ch]) || [];
  const refs = useMemo(() => paths.map((d) => samplePath(d, TRACE_N)), [ch]);
  const K = res / STROKE_BOX;
  const showRef = guide || peek;

  useEffect(() => {
    setStrokeIdx(0); setDrawn([]); setFeedback(null); setMisses(0);
    setPeek(false); setHinted(false);
  }, [ch]);

  const redraw = () => {
    const cv = canvasRef.current;
    if (!cv) return;
    const g = cv.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    if (cv.width !== res * dpr) { cv.width = res * dpr; cv.height = res * dpr; }
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, res, res);
    g.fillStyle = T.sheet; g.fillRect(0, 0, res, res);
    g.strokeStyle = T.hairline; g.lineWidth = 1;
    g.setLineDash([4, 4]);
    g.beginPath();
    g.moveTo(res / 2, 0); g.lineTo(res / 2, res);
    g.moveTo(0, res / 2); g.lineTo(res, res / 2);
    g.stroke();
    g.setLineDash([]);
    g.strokeRect(0.5, 0.5, res - 1, res - 1);
    const poly = (pts, colour, w) => {
      if (pts.length < 2) return;
      g.strokeStyle = colour; g.lineWidth = w; g.lineCap = "round"; g.lineJoin = "round";
      g.beginPath(); g.moveTo(pts[0][0] * K, pts[0][1] * K);
      for (let n = 1; n < pts.length; n++) g.lineTo(pts[n][0] * K, pts[n][1] * K);
      g.stroke();
    };
    if (guide) {
      // Guided boxes show the whole character with the next stroke picked out.
      refs.forEach((r, n) => { if (n > strokeIdx) poly(r, "#E6E4DC", 11); });
      if (refs[strokeIdx]) poly(refs[strokeIdx], "#D6D3C9", 11);
    } else if (peek && refs[strokeIdx]) {
      // Help me: just the one stroke they are stuck on, nothing further ahead.
      poly(refs[strokeIdx], "#D6D3C9", 11);
    }
    drawn.forEach((s) => poly(s, T.ink, 10));
    if (currentRef.current.length) poly(currentRef.current, T.shu, 10);
  };
  useEffect(redraw, [ch, strokeIdx, drawn, refs, peek]);

  const toBox = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * STROKE_BOX, ((e.clientY - r.top) / r.height) * STROKE_BOX];
  };
  const down = (e) => {
    if (!paths.length || strokeIdx >= paths.length) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    drawing.current = true;
    pointerType.current = e.pointerType || "unknown";
    currentRef.current = [toBox(e)];
    setFeedback(null); redraw();
  };
  const move = (e) => { if (drawing.current) { currentRef.current.push(toBox(e)); redraw(); } };
  const up = () => {
    if (!drawing.current) return;
    drawing.current = false;
    const pts = currentRef.current;
    currentRef.current = [];
    if (pts.length < 3) { redraw(); return; }
    const sc = scoreStroke(pts, refs[strokeIdx] || []);
    const bar = showRef ? tol.loose : tol.ok;
    const ok = sc.dist <= bar && !sc.backwards;
    record({
      t: Date.now(), ch, stroke: strokeIdx, stage: guide ? "box" : "blankbox",
      device: pointerType.current, dist: Math.round(sc.dist * 100) / 100,
      backwards: !!sc.backwards, outOfOrder: false,
      tier: ok ? "good" : sc.backwards ? "unnatural" : "fix", hinted: !guide && peek,
      pts: thinPoints(pts, LOG_PTS),
    }, showRef && sc.dist < 25 && !sc.backwards ? sc.dist : null);

    if (!ok) {
      const m = misses + 1;
      setMisses(m);
      setFeedback(sc.backwards
        ? "Right shape, drawn backwards — start from the other end."
        : m >= 2 && !peek
        ? "Not quite. Tap \u201cHelp me\u201d to see just this stroke."
        : "Not quite — try that stroke again.");
      redraw();
      return;
    }
    setFeedback(null); setMisses(0); setPeek(false);
    const next = [...drawn, pts];
    if (strokeIdx + 1 < paths.length) { setDrawn(next); setStrokeIdx(strokeIdx + 1); return; }
    setDrawn([]); setStrokeIdx(0);
    if (onComplete) onComplete({ ch, peeked: hinted });
  };

  return (
    <div style={{ flex: "1 1 0", minWidth: 0 }}>
      <canvas
        ref={canvasRef}
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
        style={{
          width: "100%", aspectRatio: "1 / 1", display: "block", touchAction: "none",
          borderRadius: 4, cursor: "crosshair",
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, minHeight: 20 }}>
        <span style={{ fontSize: 11, color: T.sub, flex: 1 }}>
          {peek
            ? `hint \u00b7 stroke ${strokeIdx + 1} only`
            : caption || `stroke ${strokeIdx + 1} of ${paths.length || 1}`}
        </span>
        {!guide && strokeIdx < paths.length && (
          <button className="btn-ghost" style={{ padding: "2px 8px", fontSize: 11 }}
            onClick={() => { setPeek((v) => !v); if (!peek) setHinted(true); }}>
            {peek ? "Hide hint" : "Help me"}
          </button>
        )}
      </div>
      {feedback && <p style={{ fontSize: 12, color: T.shu, margin: "2px 0 0" }}>{feedback}</p>}
    </div>
  );
}

// ————— Combined sounds: two boxes, one line —————
// きゃ is one sound written as two characters, so practising them apart never
// teaches the thing that matters — the small one sits low and stays small.
function PairPractice({ pairs, modId, progress, onProgress }) {
  const cleared = (progress[modId] || {}).pairs || [];
  const [pi, setPi] = useState(0);
  const [doneLeft, setDoneLeft] = useState(false);
  const [doneRight, setDoneRight] = useState(false);
  const pair = pairs[pi] || "";
  const [a, b] = Array.from(pair);

  useEffect(() => { setDoneLeft(false); setDoneRight(false); }, [pi]);

  const finish = () => {
    const prev = progress[modId] || {};
    const set = new Set(prev.pairs || []); set.add(pair);
    onProgress({ ...progress, [modId]: { ...prev, pairs: [...set] } });
  };
  useEffect(() => { if (doneLeft && doneRight) finish(); }, [doneLeft, doneRight]);

  return (
    <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${T.hairline}` }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".6px", color: T.sub, marginBottom: 6 }}>
        WRITE THE COMBINATION
      </div>
      <p style={{ fontSize: 13, color: T.sub, marginTop: 0, lineHeight: 1.6 }}>
        Two characters, one sound. The second one stays small and sits low — that is the whole
        difference between きや and きゃ.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 14 }}>
        {pairs.map((p, n) => (
          <button key={p} onClick={() => setPi(n)} style={{
            fontFamily: T.jpFont, fontSize: 14, padding: "3px 7px", borderRadius: 4, cursor: "pointer",
            background: n === pi ? T.ink : cleared.includes(p) ? "#EDF4EE" : T.sheet,
            color: n === pi ? T.paper : T.ink,
            border: `1px solid ${n === pi ? T.ink : cleared.includes(p) ? T.ok + "66" : T.hairline}`,
          }}>{p}</button>
        ))}
      </div>
      {/* nowrap so the two boxes stay on one line at any width; they shrink together */}
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start", flexWrap: "nowrap" }}>
        <TraceBox key={pair + "-a"} ch={a} onComplete={() => setDoneLeft(true)}
          caption={doneLeft ? "\u2713 done" : `full size \u00b7 ${a}`} />
        <TraceBox key={pair + "-b"} ch={b} onComplete={() => setDoneRight(true)}
          caption={doneRight ? "\u2713 done" : `small \u00b7 ${b}`} />
      </div>
      {doneLeft && doneRight && (
        <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 4, background: "#EDF4EE",
          border: `1px solid ${T.ok}55`, fontSize: 14 }}>
          <strong style={{ color: T.ok }}>{pair} written. </strong>
          {pi + 1 < pairs.length
            ? <button className="btn-ghost" style={{ marginLeft: 6 }} onClick={() => setPi(pi + 1)}>Next combination</button>
            : "That is every combination in this lesson."}
        </div>
      )}
    </div>
  );
}

// ————— Listen and Write —————
// Step three of the writing arc: Trace teaches the shape, this asks for it from
// nothing. One box, reused — a finished character moves into the answer strip
// and the box clears, so a five-beat word needs no extra room.
function ListenWrite({ mod, progress, onProgress }) {
  const words = (mod.words || []).filter((w) => Array.from(w.kana).every((c) => STROKES[c]));
  const { voice, checked, supported } = useJapaneseVoice();

  const [wi, setWi] = useState(0);
  const [got, setGot] = useState([]);
  const [helped, setHelped] = useState(false);
  const [cleared, setCleared] = useState(0);
  const [reveal, setReveal] = useState(false);

  useEffect(() => { setWi(0); setGot([]); setCleared(0); setHelped(false); setReveal(false); }, [mod.id]);

  if (!words.length) {
    return <p style={{ fontSize: 14, color: T.sub }}>
      No words here yet with full stroke data — Trace is the writing practice for this lesson.
    </p>;
  }

  const w = words[wi];
  const target = Array.from(w.kana);
  const pos = got.length;
  const complete = pos >= target.length;

  const accept = ({ peeked }) => {
    if (peeked) setHelped(true);
    const next = [...got, target[pos]];
    setGot(next);
    if (next.length >= target.length) {
      if (!helped && !peeked) setCleared((c) => c + 1);
    }
  };

  const next = () => {
    setGot([]); setHelped(false); setReveal(false);
    if (wi + 1 < words.length) setWi(wi + 1);
    else {
      const prev = progress[mod.id] || {};
      onProgress({ ...progress, [mod.id]: { ...prev, listenWrote: Math.max(prev.listenWrote || 0, cleared) } });
      setWi(0); setCleared(0);
    }
  };

  return (
    <div>
      <div style={{ fontSize: 12, color: T.sub, marginBottom: 10 }}>Word {wi + 1} of {words.length}</div>
      <p style={{ fontSize: 13, color: T.sub, marginTop: 0, lineHeight: 1.6 }}>
        Listen, then write it one character at a time. Nothing is shown — each finished character
        moves up into the answer.
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
        {checked && supported ? (
          <button className="btn-primary" onClick={() => speak(w.kana, voice)}>Play the word</button>
        ) : (
          <span style={{ fontSize: 13, color: T.sub }}>
            No Japanese voice on this device — the meaning is the prompt instead.
          </span>
        )}
        {/* The activity still works without audio: the English meaning becomes
            the prompt, which is harder but not impossible. So this is an escape
            hatch, not a necessity — for a learner who cannot hear it, or whose
            device reports a voice and then plays nothing, which does happen.
            It is offered rather than applied: silently marking it complete would
            claim they did something they did not. */}
        {!supported && ((progress[mod.id] || {}).lwSkipped ? (
          <span style={{ fontSize: 13, color: T.ok }}>✓ Counted as done</span>
        ) : (
          <button className="btn-ghost" onClick={() => {
            const prev = progress[mod.id] || {};
            onProgress({ ...progress, [mod.id]: {
              ...prev, listenWrote: words.length, lwSkipped: true } });
          }}>Can't do this one — count it as done</button>
        ))}
        <button className="btn-ghost" onClick={() => setReveal((v) => !v)}>
          {reveal ? "hide the word" : "I'm stuck"}
        </button>
        <span style={{ fontSize: 13, color: T.sub, marginLeft: "auto" }}>{w.en}</span>
      </div>

      {/* answer strip — filled beats, then empty slots */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {target.map((c, n) => (
          <span key={n} style={{
            width: 42, height: 48, borderRadius: 4, display: "inline-flex", alignItems: "center",
            justifyContent: "center", fontFamily: T.jpFont, fontSize: 24,
            background: n < pos ? T.sheet : "none",
            border: `1px ${n === pos ? "solid" : "dashed"} ${n < pos ? T.ok + "88" : n === pos ? T.ink : T.hairline}`,
            color: T.ink,
          }}>{n < pos ? c : reveal ? <span style={{ color: T.hairline }}>{c}</span> : ""}</span>
        ))}
      </div>

      {complete ? (
        <div style={{ padding: "12px 16px", borderRadius: 4, background: "#EDF4EE",
          border: `1px solid ${T.ok}55`, fontSize: 14, lineHeight: 1.7 }}>
          <strong style={{ color: T.ok }}>{w.kana} — {w.en}. </strong>
          {helped ? "Written with a look at the shape, which still counts as practice." : "Written from nothing."}
          <div style={{ marginTop: 10 }}>
            <button className="btn-primary" onClick={next}>
              {wi + 1 < words.length ? "Next word" : "Finish"}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ maxWidth: 240 }}>
          <TraceBox key={`${w.kana}-${pos}`} ch={target[pos]} guide={false} onComplete={accept}
            caption={`beat ${pos + 1} of ${target.length}`} />
        </div>
      )}
    </div>
  );
}

function WalkPage({ ch, modId, progress, onProgress, onAdvance }) {
  // One character, one page (Session 13). The walk used to be one block
  // cycling through the lesson's characters with the sound tucked under the
  // canvases; each character now gets its own page — sound first, then watch
  // it written, then trace it. Clearing WALK_REPS traces records the character
  // and turns the page. The Next button still moves freely: paging is
  // navigation, walked is progress, and neither gates the other.
  const [reps, setReps] = useState(0);
  const [strokeIdx, setStrokeIdx] = useState(0);
  const [drawn, setDrawn] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const currentRef = useRef([]);
  const pointerType = useRef("unknown");
  const { floor, record } = useStrokeData();
  const tol = tolerancesFor(floor);

  const paths = (ch && STROKES[ch]) || [];
  const refs = useMemo(() => paths.map((d) => samplePath(d, TRACE_N)), [ch]);
  const SIZE = 210;
  const K = SIZE / STROKE_BOX;

  useEffect(() => { setReps(0); setStrokeIdx(0); setDrawn([]); setFeedback(null); }, [ch]);

  const redraw = () => {
    const cv = canvasRef.current;
    if (!cv) return;
    const g = cv.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    if (cv.width !== SIZE * dpr) { cv.width = SIZE * dpr; cv.height = SIZE * dpr; }
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, SIZE, SIZE);
    g.fillStyle = T.sheet; g.fillRect(0, 0, SIZE, SIZE);
    g.strokeStyle = T.hairline; g.lineWidth = 1;
    g.setLineDash([4, 4]);
    g.beginPath(); g.moveTo(SIZE / 2, 0); g.lineTo(SIZE / 2, SIZE);
    g.moveTo(0, SIZE / 2); g.lineTo(SIZE, SIZE / 2); g.stroke();
    g.setLineDash([]);
    g.strokeRect(0.5, 0.5, SIZE - 1, SIZE - 1);
    const poly = (pts, colour, w) => {
      if (pts.length < 2) return;
      g.strokeStyle = colour; g.lineWidth = w; g.lineCap = "round"; g.lineJoin = "round";
      g.beginPath(); g.moveTo(pts[0][0] * K, pts[0][1] * K);
      for (let n = 1; n < pts.length; n++) g.lineTo(pts[n][0] * K, pts[n][1] * K);
      g.stroke();
    };
    refs.forEach((r, n) => { if (n >= strokeIdx) poly(r, "#E6E4DC", 11); });
    if (refs[strokeIdx]) poly(refs[strokeIdx], "#D6D3C9", 11);
    drawn.forEach((s) => poly(s, T.ink, 10));
    if (currentRef.current.length) poly(currentRef.current, T.shu, 10);
  };
  useEffect(redraw, [ch, strokeIdx, drawn, refs]);

  const toBox = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * STROKE_BOX, ((e.clientY - r.top) / r.height) * STROKE_BOX];
  };
  const down = (e) => {
    if (!paths.length || strokeIdx >= paths.length) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    drawing.current = true;
    pointerType.current = e.pointerType || "unknown";
    currentRef.current = [toBox(e)];
    setFeedback(null); redraw();
  };
  const move = (e) => { if (drawing.current) { currentRef.current.push(toBox(e)); redraw(); } };
  const up = () => {
    if (!drawing.current) return;
    drawing.current = false;
    const pts = currentRef.current;
    currentRef.current = [];
    if (pts.length < 3) { redraw(); return; }

    const sc = scoreStroke(pts, refs[strokeIdx] || []);
    const ok = sc.dist <= tol.loose && !sc.backwards;
    const tier = ok ? "good" : sc.backwards ? "unnatural" : "fix";
    record({
      t: Date.now(), ch, stroke: strokeIdx, stage: "walk", device: pointerType.current,
      dist: Math.round(sc.dist * 100) / 100, backwards: !!sc.backwards, outOfOrder: false,
      tier, pts: thinPoints(pts, LOG_PTS),
    }, sc.dist < 25 && !sc.backwards ? sc.dist : null);

    if (!ok) {
      setFeedback(sc.backwards
        ? "Right shape, drawn backwards — start from the other end."
        : "Follow the grey line. Watch it written once more if you need to.");
      redraw();
      return;
    }
    setFeedback(null);
    const next = [...drawn, pts];
    if (strokeIdx + 1 < paths.length) { setDrawn(next); setStrokeIdx(strokeIdx + 1); return; }

    const r = reps + 1;
    setDrawn([]); setStrokeIdx(0); setReps(r);
    if (r >= WALK_REPS) {
      const prev = progress[modId] || {};
      const set = new Set(prev.walked || []); set.add(ch);
      onProgress({ ...progress, [modId]: { ...prev, walked: [...set] } });
      if (onAdvance) onAdvance();
    }
  };

  const cleared = ((progress[modId] || {}).walked || []).includes(ch);

  return (
    <div>
      <SoundHeader ch={ch} />

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start", marginTop: 14 }}>
        <div>
          <StrokeView ch={ch} size={SIZE} auto />
        </div>
        <div>
          <canvas ref={canvasRef}
            style={{
              width: SIZE, height: SIZE, maxWidth: "100%", borderRadius: 3, touchAction: "none",
              border: `1px solid ${T.hairline}`, cursor: "crosshair", display: "block",
            }}
            onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onPointerLeave={up} />
          <div style={{ fontSize: 11, color: T.sub, marginTop: 4, textAlign: "center" }}>
            trace it — {reps} of {WALK_REPS} done{cleared ? " · already cleared" : ""}
          </div>
        </div>
      </div>

      <div style={{ fontSize: 12, color: T.sub, marginTop: 10 }}>
        {paths.length} stroke{paths.length === 1 ? "" : "s"} · stroke {strokeIdx + 1}
      </div>

      {feedback && (
        <div style={{ marginTop: 10, fontSize: 13, color: T.shu, lineHeight: 1.6 }}>{feedback}</div>
      )}

      <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button className="btn-ghost" onClick={() => { setDrawn([]); setStrokeIdx(0); setFeedback(null); }}>
          Clear
        </button>
        {!cleared && (
          <button className="btn-ghost" onClick={() => {
            const prev = progress[modId] || {};
            const set = new Set(prev.walked || []); set.add(ch);
            onProgress({ ...progress, [modId]: { ...prev, walked: [...set] } });
            if (onAdvance) onAdvance();
          }}>Skip this one</button>
        )}
      </div>
    </div>
  );
}

// ————— Finish flourish —————
// An activity that just ends leaves the learner wondering whether it counted.
// This marks the moment and points at what is next, which is also the only
// place the app ever says "well done" — so it should mean something.
//
// Deliberately not a modal: it appears in place, under the activity, and does
// not have to be dismissed. A learner who wants another run is one tap away.
function Flourish({ title, detail, milestone, nextLabel, onNext, onAgain }) {
  return (
    <div role="status" style={{
      marginTop: 18, padding: "18px 18px 16px", borderRadius: 10,
      background: T.okBg || "#EDF5EE", border: `1px solid ${T.ok}`, textAlign: "center",
    }}>
      <div style={{ fontSize: 26, lineHeight: 1 }}>✓</div>
      <div style={{ font: `600 16px ${T.uiFont}`, color: T.ink, marginTop: 8 }}>{title}</div>
      {detail && (
        <div style={{ font: `13px/1.6 ${T.uiFont}`, color: T.sub, marginTop: 4 }}>{detail}</div>
      )}
      {milestone && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px dashed ${T.ok}` }}>
          <div style={{ fontFamily: T.jpFont, fontSize: 30, color: T.ink }}>{milestone.word}</div>
          <div style={{ font: `13px/1.6 ${T.uiFont}`, color: T.sub, marginTop: 4 }}>
            You have been building this word since {new Date(milestone.since)
              .toLocaleDateString(undefined, { month: "long", day: "numeric" })}. Today it became yours.
          </div>
        </div>
      )}
      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 14, flexWrap: "wrap" }}>
        {onNext && <button className="btn-primary" onClick={onNext}>{nextLabel || "Next"}</button>}
        {onAgain && <button className="btn-ghost" onClick={onAgain}>Again</button>}
      </div>
    </div>
  );
}

// ————— Module shell —————
function Module({ mod, idx, progress, onProgress, onBack }) {
  const isCulture = mod.kind === "culture";
  const isSkill = mod.kind === "skill";
  const tabs = isCulture
    ? [["learn", "Read"]]
    : isSkill
      ? [["learn", "Learn"], ["judge", "Choose"], ["trace", "Trace"], ["pad", "Free pad"]]
      : [["learn", "Learn"], ["drill", "Drill"], ["listen", "Listen"], ["trace", "Trace"],
          ...(mod.words && mod.words.length ? [["lw", "Listen & Write"]] : []),
          ["pad", "Free pad"]];
  // Only what they have met by this lesson, so free practice can never ask for
  // a character they haven't been taught.
  const padChars = useMemo(() => availableAt(idx), [idx]);
  // Same guard on the practice sets: ヴ is a voiced form but is not taught until
  // the extended lesson, so the voiced lesson must not offer it.
  const traceChars = traceCharsFor(mod).filter((c) => padChars.has(c));
  const pairChars = (mod.id === "youon" ? YOUON_PAIRS : []).filter((p) =>
    Array.from(p).every((c) => padChars.has(c))
  );
  const [tab, setTab] = useState("learn");
  const [traceFocus, setTraceFocus] = useState(null);   // set by "Try drawing it"
  useEffect(() => { setTab("learn"); setTraceFocus(null); }, [mod.id]);
  const p = progress[mod.id] || {};
  const lessonComplete = (() => {
    if (isCulture) return !!p.read;
    if (isSkill) return (p.judged || 0) >= (mod.judge?.length || 1);
    const traced = new Set((p.traced || []).map((t) => String(t).split(":")[0]));
    const allTraced = traceChars.length > 0 && traceChars.every((c) => traced.has(c));
    const needsWords = !!(mod.words && mod.words.length);
    return p.drill != null && allTraced && (!needsWords || (p.listenWrote || 0) >= mod.words.length);
  })();

  return (
    <div>
      <button className="btn-ghost" onClick={onBack} style={{ marginBottom: 16 }}>← All lessons</button>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
        <h2 style={{ fontFamily: hasJP(mod.title) ? T.jpFont : T.uiFont, fontSize: 27, margin: 0 }}>{mod.title}</h2>
        {mod.sounds && <span style={{ fontSize: 15, letterSpacing: ".5px" }}>{mod.sounds}</span>}
        <span style={{ fontSize: 14, color: T.sub }}>· {mod.en}</span>
        <KindBadge kind={mod.kind} />
      </div>

        {/* Lesson-level flourish. Appears once every activity in this lesson is
          satisfied, so a learner knows the lesson is finished rather than
          guessing from a tick in a list they have to go back to see. */}
      {lessonComplete && (
        <Flourish
          title="Lesson complete"
          detail={flourishDetail(mod, progress)}
          milestone={thenVsNow(mod, progress)}
          nextLabel="← Back to lessons"
          onNext={onBack}
        />
      )}

      {tabs.length > 1 && (
      <div style={{ display: "flex", gap: 6, margin: "16px 0", flexWrap: "wrap" }}>
          {tabs.map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              padding: "7px 16px", borderRadius: 999, fontSize: 13, cursor: "pointer", fontFamily: T.uiFont,
              background: tab === id ? T.ink : "none", color: tab === id ? T.paper : T.sub,
              border: `1px solid ${tab === id ? T.ink : T.hairline}`,
            }}>
              {label}
              {id === "drill" && p.drill != null ? ` · ${p.drill}` : ""}
                {id === "listen" && p.heard ? ` · ${p.heard}` : ""}
              {id === "trace" && p.traced ? ` · ${p.traced.length}` : ""}
              {id === "judge" && p.judged != null ? ` · ${p.judged}` : ""}
            </button>
          ))}
        </div>
      )}
      {tabs.length === 1 && <div style={{ height: 16 }} />}

      <div style={{ background: T.sheet, border: `1px solid ${T.hairline}`, borderRadius: 8, padding: 20 }}>
        {tab === "learn" && <Learn mod={mod} progress={progress} onProgress={onProgress}
          onPractise={(c) => { setTraceFocus(c); setTab("trace"); }}
          onFinish={isCulture ? null : () => setTab(isSkill ? "judge" : "drill")}
          finishLabel={isSkill ? "Go to Choose ›" : "Go to Drill ›"} />}
        {tab === "drill" && <Drill mod={mod} idx={idx} progress={progress} onProgress={onProgress} onGoTrace={() => setTab("trace")} />}
        {tab === "listen" && <Write mod={mod} idx={idx} progress={progress} onProgress={onProgress} listen />}
        {tab === "pad" && (
          <div>
            <p style={{ fontSize: 14, color: T.sub, marginTop: 0, lineHeight: 1.7 }}>
              Nothing is scored here. Write whatever you like with the kana you have met so far —
              the reference strip below only offers those.
            </p>
            <FreePad allowed={padChars} embedded />
          </div>
        )}
        {tab === "trace" && (
          <div>
            <StrokePractice chars={traceChars} modId={mod.id} progress={progress} onProgress={onProgress} startCh={traceFocus} />
            {pairChars.length > 0 && (
              <PairPractice pairs={pairChars} modId={mod.id} progress={progress} onProgress={onProgress} />
            )}
          </div>
        )}
        {tab === "lw" && <ListenWrite mod={mod} progress={progress} onProgress={onProgress} />}
        {tab === "judge" && <Judge mod={mod} progress={progress} onProgress={onProgress} />}
      </div>

      {isCulture && (
        <div style={{ marginTop: 14, textAlign: "center" }}>
          <button className="btn-primary" onClick={() => {
            const prev = progress[mod.id] || {};
            onProgress({ ...progress, [mod.id]: { ...prev, read: true } });
            onBack();
          }}>Got it</button>
        </div>
      )}
    </div>
  );
}

// ————— First-clear timestamps + the capability line (Session 11) —————
// Same design as the hiragana module; see the comment there and
// reward-system-design-v1.md. Stamps equal to _stampEpoch predate stamping.
function stampFirsts(next) {
  const t = Date.now();
  const stamps = { ...(next._firstAt || {}) };
  for (const id of Object.keys(next)) {
    if (id.startsWith("_")) continue;
    const entry = next[id];
    if (!entry || typeof entry !== "object") continue;
    for (const field of Object.keys(entry)) {
      const v = entry[field];
      if (Array.isArray(v)) {
        for (const el of v) {
          const k = id + ":" + field + ":" + String(el);
          if (stamps[k] == null) stamps[k] = t;
        }
      } else if (v && typeof v === "object") {
        for (const kk of Object.keys(v)) {
          const k = id + ":" + field + ":" + kk;
          if (stamps[k] == null) stamps[k] = t;
        }
      } else if (v != null) {
        const k = id + ":" + field;
        if (stamps[k] == null) stamps[k] = t;
      }
    }
  }
  return { ...next, _firstAt: stamps, _stampEpoch: next._stampEpoch == null ? t : next._stampEpoch };
}

const BASE_KANA = (() => {
  const s = new Set();
  COLS.forEach((c) => c.kana.forEach((k) => k && s.add(k)));
  s.add("ン"); // lives outside COLS — the wa lesson adds it (see availableAt)
  return s;
})();
function tracedEverywhere(progress) {
  const s = new Set();
  for (const id of Object.keys(progress)) {
    if (id.startsWith("_")) continue;
    const p = progress[id];
    if (!p) continue;
    (Array.isArray(p.traced) ? p.traced : []).forEach((tr) => s.add(String(tr).split(":")[0]));
    (Array.isArray(p.walked) ? p.walked : []).forEach((c) => s.add(c));
  }
  return s;
}
function flourishDetail(mod, progress) {
  const traced = tracedEverywhere(progress);
  const can = [...BASE_KANA].filter((k) => traced.has(k)).length;
  if (!can) return "Recognised, formed, and heard. The next lesson is waiting in the list.";
  let lessonChars = new Set();
  try { lessonChars = new Set(traceCharsFor(mod)); } catch (e) {}
  const seen = new Set(), withNew = [], rest = [];
  for (const m of MODULES) {
    for (const w of (m.words || [])) {
      if (!w.kana || seen.has(w.kana)) continue;
      const chars = [...w.kana];
      if (!chars.every((c) => traced.has(c) || c === "ー")) continue;
      seen.add(w.kana);
      (chars.some((c) => lessonChars.has(c)) ? withNew : rest).push(w.kana);
    }
  }
  const ex = [...withNew, ...rest].slice(0, 3);
  let line = "You can now write " + can + " of the 46 katakana" +
    (ex.length ? " — enough for " + ex.join("、") : "") + ".";
  const g = GROUPS.find((gr) => gr.ids.includes(mod.id));
  if (g) {
    const left = g.ids.length - 1 - g.ids.indexOf(mod.id);
    line += left > 0
      ? " " + left + " more lesson" + (left === 1 ? "" : "s") + " in “" + g.title + "”."
      : " That wraps up “" + g.title + "”.";
  }
  return line;
}

// ————— Then-vs-now (Session 11) —————
// Same design as the hiragana module; see the comment there. Silence until a
// learner's own history spans the window is by design, not a bug.
const THEN_WINDOW = 21 * 24 * 60 * 60 * 1000;
function charFirstTimes(progress) {
  const map = {};
  const fa = progress._firstAt || {};
  for (const key of Object.keys(fa)) {
    const parts = key.split(":");
    if (parts.length < 3 || (parts[1] !== "traced" && parts[1] !== "walked")) continue;
    const ch = parts[2];
    if (map[ch] == null || fa[key] < map[ch]) map[ch] = fa[key];
  }
  return map;
}
function thenVsNow(mod, progress) {
  const times = charFirstTimes(progress);
  let lessonChars = new Set();
  try { lessonChars = new Set(traceCharsFor(mod)); } catch (e) {}
  let best = null;
  for (const m of MODULES) {
    for (const w of (m.words || [])) {
      if (!w.kana) continue;
      const chars = [...w.kana].filter((c) => c !== "ー");
      if (chars.length < 2) continue;
      const ts = chars.map((c) => times[c]);
      if (ts.some((t) => t == null)) continue;
      const newest = Math.max(...ts);
      if (!lessonChars.has(chars[ts.indexOf(newest)])) continue;
      if (Date.now() - newest > 18 * 36e5) continue;
      const oldest = Math.min(...ts);
      if (newest - oldest < THEN_WINDOW) continue;
      if (!best || chars.length > best.n) best = { word: w.kana, since: oldest, n: chars.length };
    }
  }
  return best;
}

// ————— Root —————
export default function KatakanaModule() {
  const [progress, setProgress] = useState({});
  const [current, setCurrent] = useState(null);
  const [freePad, setFreePad] = useState(false);
  const [openGroups, setOpenGroups] = useState(null); // null → fall back to first unfinished group
  const loaded = useRef(false);

  useEffect(() => { loadProgress().then((p) => { setProgress(p); loaded.current = true; }); }, []);
  const update = (p) => { const s = stampFirsts(p); setProgress(s); if (loaded.current) saveProgress(s); };

  const isDone = (m) => {
    const p = progress[m.id];
    if (!p) return false;
    if (m.kind === "culture") return !!p.read;
    if (m.kind === "skill") return (p.judged || 0) >= (m.judge?.length || 1);
    // Recognise it, form it, then hear it and write it. Three abilities, in
    // the order the lesson teaches them.
    //
    //   drill      — recognition
    //   traced     — EVERY character in the lesson, not just one. A five-kana
    //                lesson finishing after one traced character was the old
    //                behaviour and it flattered the learner.
    //   listenWrote— only where the lesson has words AND the device can speak
    //                them. ListenWrite runs on speech synthesis, not the
    //                recorded sprite, so a device with no Japanese voice cannot
    //                do it at all. Requiring it unconditionally would lock those
    //                learners out permanently — which is why Listen was excluded
    //                from completion originally. It marks itself satisfied when
    //                unsupported.
    //
    // Free pad is open practice and is deliberately never part of this.
    const chars = traceCharsFor(m);
    const traced = new Set((p.traced || []).map((t) => String(t).split(":")[0]));
    const allTraced = chars.length > 0 && chars.every((c) => traced.has(c));
    const needsWords = !!(m.words && m.words.length);
    const wordsDone = !needsWords || (p.listenWrote || 0) >= m.words.length;
    return p.drill != null && allTraced && wordsDone;
  };

  const doneCount = MODULES.filter(isDone).length;
  // Collapsed by default except the first group with work left, so the list
  // opens as four or five headings rather than every lesson at once.
  const firstUnfinished = (GROUPED.find((g) => g.points.some((m) => !isDone(m))) || GROUPED[0]).title;
  const isOpen = (title) => (openGroups ? openGroups.has(title) : title === firstUnfinished);
  const toggleGroup = (title) =>
    setOpenGroups((prev) => {
      const next = new Set(prev || [firstUnfinished]);
      if (next.has(title)) next.delete(title); else next.add(title);
      return next;
    });
  const idx = current ? MODULES.findIndex((m) => m.id === current) : -1;
  const mod = idx >= 0 ? MODULES[idx] : null;

  return (
    <div style={{ minHeight: "100vh", background: T.paper, fontFamily: T.uiFont, color: T.ink }}>
      <style>{`
        .btn-primary { background: ${T.ink}; color: ${T.paper}; border: none; padding: 9px 20px;
          border-radius: 6px; font-size: 14px; cursor: pointer; font-family: inherit; }
        .btn-primary:disabled { opacity: .5; cursor: default; }
        .btn-ghost { background: none; border: 1px solid ${T.hairline}; color: ${T.sub};
          padding: 6px 12px; border-radius: 6px; font-size: 13px; cursor: pointer; font-family: inherit; }
        .btn-ghost:hover { color: ${T.ink}; border-color: #CFCDC4; }
        .pad-key { background: ${T.sheet}; border: 1px solid ${T.hairline}; border-radius: 3px;
          font-family: ${T.jpFont}; font-size: 19px; padding: 9px 0; cursor: pointer; color: ${T.ink}; min-width: 30px; }
        .pad-key:hover { border-color: #CFCDC4; background: #FCFCFA; }
        .pad-dim { background: ${T.paper}; border: 1px solid ${T.hairline}; border-radius: 3px;
          font-family: ${T.jpFont}; font-size: 19px; padding: 9px 0; color: #C9C7BF; cursor: default; min-width: 30px; }
        .pad-gap { background: none; border: 1px dashed ${T.hairline}; border-radius: 3px; padding: 9px 0; cursor: default; }
        .pad-ghost { background: none; border: 1px solid ${T.hairline}; color: ${T.sub}; border-radius: 3px;
          font-size: 12px; padding: 0 12px; cursor: pointer; font-family: inherit; }
        .btn-pad { display: inline-flex; align-items: center; gap: 7px; background: ${T.sheet};
          border: 1px solid ${T.ink}; color: ${T.ink}; padding: 7px 15px; border-radius: 6px;
          font-size: 13px; cursor: pointer; font-family: inherit; white-space: nowrap; }
        .btn-pad svg { stroke: ${T.shu}; transition: stroke .12s ease; }
        .btn-pad:hover { background: ${T.ink}; color: ${T.paper}; }
        .btn-pad:hover svg { stroke: ${T.paper}; }
        .group-head { display: flex; align-items: center; gap: 10px; width: 100%;
          background: none; border: none; border-bottom: 1px solid ${T.hairline};
          padding: 10px 2px; cursor: pointer; font-family: inherit; color: inherit; }
        .row-btn { display: flex; align-items: center; gap: 10px; width: 100%; text-align: left;
          background: ${T.sheet}; border: 1px solid ${T.hairline}; border-radius: 6px;
          padding: 11px 14px; cursor: pointer; font-family: inherit; }
        .row-btn:hover { border-color: #CFCDC4; }
        .row-cc { background: #FBFCFB; }
        button:focus-visible { outline: 2px solid ${T.ai}; outline-offset: 2px; }
      `}</style>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px 80px" }}>
        <header style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 6 }}>
          <div style={{ fontFamily: T.jpFont, fontSize: 34, color: T.shu, lineHeight: 1 }}>ア</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>Katakana</div>
            <div style={{ fontSize: 13, color: T.sub }}>
              {mod ? mod.title : "Stage 1 · the second alphabet"}
            </div>
          </div>
        </header>
        <div style={{ height: 1, background: T.hairline, margin: "18px 0 22px" }} />

        {freePad ? (
          <FreePad onBack={() => setFreePad(false)} />
        ) : mod ? (
          <Module mod={mod} idx={idx} progress={progress} onProgress={update} onBack={() => setCurrent(null)} />
        ) : (
          <div>
            <p style={{ fontSize: 14, color: T.sub, marginTop: 0, lineHeight: 1.7 }}>
              Same sounds you already know, new shapes — and a running thread of Culture Connection
              lessons about loanwords, because the biggest katakana trap isn't reading the characters.
              It's assuming you know what the word means.
            </p>
            <div style={{ marginTop: 16, paddingBottom: 12, borderBottom: `1px solid ${T.hairline}`,
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div style={{ fontSize: 12, color: T.sub, display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px 0" }}>
                {KIND_ORDER.map((key) => (
                  <span key={key} style={{ display: "inline-flex", alignItems: "center", gap: 5, marginRight: 12 }}>
                    <KindBadge kind={key} size={10} />
                    {KINDS[key].full}
                  </span>
                ))}
              </div>
              <button className="btn-pad" onClick={() => setFreePad(true)}>
                <svg width="15" height="15" viewBox="0 0 20 20" fill="none" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 16 C6 6 10 3 13 5 C16 7 14 12 11 13" />
                </svg>
                Free writing pad
              </button>
            </div>
            {INTRO && (() => {
              const introDone = isDone(INTRO);
              return (
                <button
                  onClick={() => setCurrent(INTRO.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left",
                    background: T.sheet, border: `1px solid ${introDone ? T.hairline : KINDS.culture.color}`,
                    borderLeft: `3px solid ${KINDS.culture.color}`, borderRadius: 8,
                    padding: "14px 16px", marginBottom: 18, cursor: "pointer", fontFamily: "inherit", color: "inherit",
                  }}
                >
                  <KindBadge kind="culture" />
                  <span style={{ flex: 1 }}>
                    <span style={{ display: "block", fontSize: 16, fontWeight: 600 }}>{INTRO.title}</span>
                    <span style={{ display: "block", fontSize: 13, color: T.sub, marginTop: 2 }}>
                      Read this first — it is the five minutes that makes the rest make sense.
                    </span>
                  </span>
                  <span style={{ fontSize: 13, color: introDone ? T.ok : T.note }}>{introDone ? "✓" : "○"}</span>
                </button>
              );
            })()}
            {GROUPED.map((g) => {
              const gDone = g.points.filter(isDone).length;
              const gComplete = gDone === g.points.length;
              const open = isOpen(g.title);
              return (
                <section key={g.title} style={{ marginBottom: 10 }}>
                  <button className="group-head" onClick={() => toggleGroup(g.title)} aria-expanded={open}>
                    <span style={{ color: T.sub, fontSize: 11, width: 10, display: "inline-block",
                      transform: open ? "rotate(90deg)" : "none", transition: "transform .15s" }}>▶</span>
                    <span style={{ fontSize: 13, letterSpacing: ".5px", textTransform: "uppercase", flex: 1, textAlign: "left" }}>
                      {g.title}
                    </span>
                    {gComplete ? (
                      <span style={{ fontSize: 13, color: T.ok }}>✓</span>
                    ) : (
                      <span style={{ width: 44, height: 3, background: T.hairline, borderRadius: 2, overflow: "hidden" }}>
                        <span style={{ display: "block", height: 3, borderRadius: 2,
                          background: gDone ? T.note : "transparent",
                          width: `${Math.round((gDone / g.points.length) * 100)}%` }} />
                      </span>
                    )}
                  </button>
                  {open && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
                      {g.points.map((m, gi) => {
                        const done = isDone(m);
                        const started = !!progress[m.id];
                        return (
                          <button key={m.id} className="row-btn" onClick={() => setCurrent(m.id)}>
                            <span style={{ fontSize: 12, color: T.sub, minWidth: 14, textAlign: "right" }}>{gi + 1}</span>
                            <KindBadge kind={m.kind} />
                            <span style={{ fontFamily: hasJP(m.title) ? T.jpFont : T.uiFont, fontSize: 17 }}>{m.title}</span>
                            {m.sounds && <span style={{ fontSize: 13, letterSpacing: ".4px" }}>{m.sounds}</span>}
                            <span style={{ fontSize: 13, color: T.sub, flex: 1 }}>· {m.en}</span>
                            <span style={{ fontSize: 13, color: done ? T.ok : started ? T.note : "#C9C7BF" }}>
                              {done ? "✓" : started ? "…" : "○"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </section>
              );
            })}
            <p style={{ fontSize: 12, color: T.sub, textAlign: "center", marginTop: 4 }}>
              Lesson content is AI-authored and pending native-speaker review. Etymology and usage claims
              in the culture lessons need the closest read.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
