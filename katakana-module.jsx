import { useState, useEffect, useRef, useMemo } from "react";

// ————— Design tokens (matched to the rest of the app) —————
const T = {
  paper: "#F7F6F2",
  sheet: "#FFFFFF",
  ink: "#22252B",
  sub: "#6E7178",
  hairline: "#E4E2DB",
  shu: "#C7351B",
  note: "#907119",   // darkened ochre — 3.2:1 at #B08A1F (Session 4 fix, propagated Session 9)
  noteBg: "#FAF3E0",
  ai: "#3D5A80",
  ok: "#3E7C4F",
  midori: "#3E7C4F",
  jpFont: '"Hiragino Mincho ProN","Yu Mincho","Noto Serif JP",serif',
  uiFont: '-apple-system,BlinkMacSystemFont,"Segoe UI","Hiragino Sans","Noto Sans JP",sans-serif',
};

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
const STROKE_BOX = 109;
const STROKES = {"ァ":["M28,42.54c1.91,1.22,3.16,1.13,6.74,0.59c9.03-1.37,29.93-5.05,38.25-6.06c4.14-0.5,6.33,2.36,2.08,5.47c-5.35,3.91-10.4,7.43-18.42,12.52","M51.55,54.18c0.62,1.17,0.8,2.53,0.45,4.13c-3.16,14.45-7.75,24.91-15.58,35.57"],"ア":["M23.5,26.25c2.41,1.56,3.98,1.44,8.51,0.75c11.4-1.75,37.77-5.5,48.28-6.78c5.23-0.64,7.99,2.06,2.62,6.04c-6.75,5-13.12,9.5-23.25,16","M53.12,41.12c0.79,1.5,1.02,3.24,0.58,5.28c-4.04,18.48-9.92,31.85-19.92,45.48"],"ィ":["M67.75,32.78c0.1,1.39-0.27,3.07-1.28,4.37c-7.98,10.24-18.72,23.55-35.97,34.08","M57.19,54.22c0.81,0.92,1.02,2.46,1.02,3.79c0,1.33,0,26.33,0,27.87c0,1.54-0.1,7.48-0.1,9.63"],"イ":["M69.75,16.75c0.12,1.75-0.34,3.86-1.62,5.5c-10.13,12.87-23.75,29.63-45.63,42.87","M56.38,43.88c1,1.12,1.25,3,1.25,4.62c0,1.62,0,32.75,0,34.62c0,1.87-0.13,9.13-0.13,11.76"],"ゥ":["M54.11,32.25c0.8,0.87,0.99,2.32,0.99,3.58c0,1.26,0,8.33,0,9.78","M32.5,45.62c0.94,0.89,1.15,2.38,1.18,3.67c0.08,3.53,0.27,8.68,0.42,12.98c0.07,1.98,0.13,3.78,0.17,5.15","M34.92,48.96c15.42-1.74,32.02-3.54,38.98-4.51c6.96-0.97,6.59,0.65,4.97,5.32c-3.97,11.52-15.04,33.98-32.11,44.85"],"ウ":["M53.25,14.62c1,1.12,1.25,3,1.25,4.62c0,1.62,0,10.76,0,12.64","M26.5,31.25c1,1.12,1.22,3,1.25,4.62c0.09,4.45,0.29,10.95,0.45,16.37c0.07,2.5,0.14,4.77,0.18,6.5","M29.12,35.88c19.38-2.25,40.25-4.25,49-5.5c8.75-1.25,8.28,0.84,6.25,6.88c-5,14.88-20.12,43.5-41,56.62"],"ェ":["M36.22,52.7c1.84,0.56,4.08,0.53,5.93,0.24c6.8-1.08,17.77-2.28,26.71-3.07c1.8-0.16,3.59-0.15,5.37,0.18","M53.25,54.65c0.79,0.9,1.04,2.4,0.99,3.7c-0.14,3.79-0.4,10.3-0.65,17.78c-0.06,1.85-0.12,3.25-0.18,5.19","M26,84.03c2.71,0.7,6.01,0.65,8.73,0.29c14.11-1.84,27.4-2.86,40.12-2.89c2.65-0.01,5.73,0.31,8.3,1.33"],"エ":["M31.87,35.68c2.32,0.71,5.14,0.66,7.48,0.29c8.57-1.35,22.4-2.85,33.66-3.85c2.26-0.2,4.52-0.19,6.77,0.22","M53.34,38.13c1,1.12,1.31,3,1.25,4.62c-0.18,4.74-0.51,12.89-0.83,22.25c-0.08,2.31-0.16,4.7-0.23,7.12","M19,75.46c3.41,0.94,7.57,0.88,11.01,0.39c17.78-2.48,34.53-3.86,50.55-3.9c3.34-0.01,7.23,0.42,10.46,1.8"],"ォ":["M26,50.69c3.11,1.49,6,1.3,8.75,0.86c14.32-2.3,27.34-3.76,40.17-4.53c2.65-0.16,5.05,0.14,8.31,1.15","M58.49,33.57c1.05,1.18,1.31,3.16,1.31,4.86c0,6.36-0.2,36.73-0.2,46.58c0,16.19-4.67,5.96-7.35,4.37","M58.41,49.45c0,1.29-1.31,2.87-2.88,4.77c-6.26,7.55-16.79,18.08-27.51,26.22"],"オ":["M19.5,37.85c3.91,1.78,7.55,1.55,11.01,1.02c18.03-2.75,34.4-4.5,50.55-5.41c3.34-0.19,6.35,0.17,10.46,1.38","M60.38,16.38c1.32,1.49,1.65,3.97,1.65,6.12c0,8-0.25,46.23-0.25,58.63c0,20.38-5.88,7.5-9.25,5.5","M60.29,36.38c0,1.62-1.64,3.61-3.62,6c-7.88,9.5-21.12,22.75-34.62,33"],"カ":["M25.5,40.62c1.88,1.25,4.51,1.87,7.12,1.5c17.88-2.5,32.78-4.51,42.5-5.88c7.12-1,10.59,0.24,8.62,7.88c-2.12,8.25-4.47,17.81-9.25,29.12c-10.49,24.88-14.11,14.51-19.24,11.88","M55.88,17.12c0.88,1.62,1.29,3.83,0.75,6.75c-4.25,22.88-15.88,45.25-30.25,58.88"],"ガ":["M25.5,40.62c1.88,1.25,4.51,1.87,7.12,1.5c17.88-2.5,32.78-4.51,42.5-5.88c7.12-1,10.59,0.24,8.62,7.88c-2.12,8.25-4.47,17.81-9.25,29.12c-10.49,24.88-14.11,14.51-19.24,11.88","M55.88,17.12c0.88,1.62,1.29,3.83,0.75,6.75c-4.25,22.88-15.88,45.25-30.25,58.88","M83,19.75c2.75,1.75,6,5.38,7.75,8.5","M89.38,14.88c3.06,1.57,6.68,4.82,8.62,7.62"],"キ":["M27,40.5c1.75,0.62,4.77,1.09,7.25,0.38c11.75-3.38,30.62-8.13,37.5-9.88c2.62-0.67,6.75-1.12,9-1","M19.5,65.8c2.28,0.84,6.24,1.18,9.46,0.17c17.79-5.59,32.67-9.09,49.17-12.99c3.43-0.81,8.81-1.52,11.74-1.35","M48.87,16.75c2.5,1.75,3.43,3.24,3.88,6.12c2.12,13.62,6.38,45.38,8.25,59.25c0.4,3,1,8.38,1.38,11.12"],"ギ":["M27,40.5c1.75,0.62,4.77,1.09,7.25,0.38c11.75-3.38,30.62-8.13,37.5-9.88c2.62-0.67,6.75-1.12,9-1","M19.5,65.8c2.28,0.84,6.24,1.18,9.46,0.17c17.79-5.59,32.67-9.09,49.17-12.99c3.43-0.81,8.81-1.52,11.74-1.35","M48.87,16.75c2.5,1.75,3.43,3.24,3.88,6.12c2.12,13.62,6.38,45.38,8.25,59.25c0.4,3,1,8.38,1.38,11.12","M81.87,15.13c2.75,1.93,6,5.93,7.75,9.37","M88.25,10c2.71,1.73,5.9,5.32,7.62,8.41"],"ク":["M50,19.62c0.38,1.5,0.34,3.48-0.5,5.12c-4.12,8.12-7.88,15.5-16.12,24.12","M51.25,28.62c2.62,0.25,5.67-0.39,7.62-0.88c6-1.5,9.75-2.38,15.12-3.88c5.79-1.62,7.53-0.42,5.12,4.88c-10.36,22.88-26.24,44.14-48.61,60.51"],"グ":["M50,19.62c0.38,1.5,0.34,3.48-0.5,5.12c-4.12,8.12-7.88,15.5-16.12,24.12","M51.25,28.62c2.62,0.25,5.67-0.39,7.62-0.88c6-1.5,9.75-2.38,15.12-3.88c5.79-1.62,7.53-0.42,5.12,4.88c-10.36,22.88-26.24,44.14-48.61,60.51","M83.75,13.5c2.75,1.75,6,5.38,7.75,8.5","M90.13,8.62c3.06,1.57,6.68,4.82,8.62,7.62"],"ケ":["M40.96,17.88c0.44,1.9,0.39,4.42-0.59,6.5c-4.82,10.31-9.21,19.67-18.87,30.62","M37.88,37.62c2.12,0.88,4.15,1.04,6.62,0.5c12.62-2.75,25.5-4.88,35.75-6.5c3.61-0.57,6.25-0.75,9.25-0.5","M64.46,38.88c0.44,1.9,0.5,4.27-0.08,6.5c-3.63,13.75-9.25,31.25-24.63,43.87"],"ゲ":["M40.96,17.88c0.44,1.9,0.39,4.42-0.59,6.5c-4.82,10.31-9.21,19.67-18.87,30.62","M37.88,37.62c2.12,0.88,4.15,1.04,6.62,0.5c12.62-2.75,25.5-4.88,35.75-6.5c3.61-0.57,6.25-0.75,9.25-0.5","M64.46,38.88c0.44,1.9,0.5,4.27-0.08,6.5c-3.63,13.75-9.25,31.25-24.63,43.87","M83.62,13.94c2.95,1.81,6.43,5.57,8.3,8.81","M90.12,9.12c3.02,1.63,6.58,5,8.5,7.9"],"コ":["M30.13,35c1.75,1,3.01,2.18,6.5,1.62c14.25-2.25,29.62-4.25,37.38-5.5c9.37-1.51,9.88,0.25,8,7.5c-2.77,10.71-5.25,22.12-7,34.88","M27.5,77.38c2.62,1.12,4.38,1.51,8.25,1c11.38-1.5,22.62-3,33.75-3.38c4-0.13,5.88,0,9.62,0.5"],"ゴ":["M30.13,35c1.75,1,3.01,2.18,6.5,1.62c14.25-2.25,29.62-4.25,37.38-5.5c9.37-1.51,9.88,0.25,8,7.5c-2.77,10.71-5.25,22.12-7,34.88","M27.5,77.38c2.62,1.12,4.38,1.51,8.25,1c11.38-1.5,22.62-3,33.75-3.38c4-0.13,5.88,0,9.62,0.5","M84.75,15.5c2.75,1.75,6,5.38,7.75,8.5","M90.87,10.38c3.06,1.57,6.68,4.82,8.62,7.62"],"サ":["M16.5,44.34c2.84,1.27,4.77,1.91,8.93,1.13c17.2-3.22,40.45-5.35,58.53-5.34c4.33,0,6.92,0.37,10.42,0.82","M36.63,23.38c1.12,1.38,1.19,2.5,1.25,4.75c0.25,9,0.38,20.25,0.75,28.88c0.14,3.25,0.38,7.12,0.38,9.25","M69.63,16.62c1.5,2,1.62,2.87,1.62,6.25c0,8.25-0.16,9-0.16,15.88c0,23.25-9.34,42.5-23.21,53"],"ザ":["M16.5,44.34c2.84,1.27,4.77,1.91,8.93,1.13c17.2-3.22,40.45-5.35,58.53-5.34c4.33,0,6.92,0.37,10.42,0.82","M36.63,23.38c1.12,1.38,1.19,2.5,1.25,4.75c0.25,9,0.38,20.25,0.75,28.88c0.14,3.25,0.38,7.12,0.38,9.25","M69.63,16.62c1.5,2,1.62,2.87,1.62,6.25c0,8.25-0.16,9-0.16,15.88c0,23.25-9.34,42.5-23.21,53","M82.75,18.73c2.85,1.78,6.21,5.47,8.03,8.65","M89.5,14.12c2.93,1.57,6.39,4.83,8.25,7.63"],"シ":["M39.87,19.75c5.14,1.57,9.79,6.01,11.5,8.62","M26,42.62c3.25,0.88,10.25,5.5,12.25,8.13","M33,85c3.75,0.88,7.12,0.49,10.38-1.38c17.87-10.24,32.37-23.87,46.12-42.87"],"ジ":["M39.87,19.75c5.14,1.57,9.79,6.01,11.5,8.62","M26,42.62c3.25,0.88,10.25,5.5,12.25,8.13","M33,85c3.62,1.62,6.5,0.88,10.38-1.38c17.81-10.34,32.37-23.87,46.12-42.87","M78.5,18.98c2.85,1.78,6.21,5.47,8.03,8.65","M85.25,14.38c2.93,1.57,6.39,4.83,8.25,7.63"],"ス":["M30.13,29.38c1.75,1.5,4.15,1.98,6.62,1.38c13.25-3.25,24.25-5.62,31.25-7.38c7-1.76,8.64,1.16,6.5,5.75c-11.24,24.12-28.37,45.87-53.5,57.25","M61,57.25c11,7.38,21,17,28,28.62"],"ズ":["M30.13,29.38c1.75,1.5,4.15,1.98,6.62,1.38c13.25-3.25,24.25-5.62,31.25-7.38c7-1.76,8.64,1.16,6.5,5.75c-11.24,24.12-28.37,45.87-53.5,57.25","M61,57.25c11,7.38,21,17,28,28.62","M85.38,16.5c2.75,1.75,6,5.38,7.75,8.5","M91.76,11.62c3.06,1.57,6.68,4.82,8.62,7.62"],"セ":["M17,49.38c3.12,1.5,5.04,2.18,8.62,1.38c23.5-5.25,31.24-7.43,50.62-11.62c23.12-5,6.5,7.75-3.25,18.12","M42.38,19.5c2,2.25,2.15,3.5,2.12,6.62c-0.12,17.5-0.88,31.75-0.88,41.12c0,14,3.13,16.99,12.38,17.12c8.38,0.12,14.12,0.12,18,0.12c3.88,0,7.5-0.5,10.5-1.12"],"ゼ":["M17,49.38c3.12,1.5,5.04,2.18,8.62,1.38c23.5-5.25,31.24-7.43,50.62-11.62c23.12-5,6.5,7.75-3.25,18.12","M42.38,19.5c2,2.25,2.15,3.5,2.12,6.62c-0.12,17.5-0.88,31.75-0.88,41.12c0,14,3.13,16.99,12.38,17.12c8.38,0.12,14.12,0.12,18,0.12c3.88,0,7.5-0.5,10.5-1.12","M83.38,20.25c2.75,1.75,6,5.38,7.75,8.5","M89.76,15.38c3.06,1.57,6.68,4.82,8.62,7.62"],"ソ":["M23.5,25.5c3.92,4.1,7.71,9.93,10.75,17.88","M83.5,21c1.25,2.5,1.3,4.44,0.12,8.5c-5.87,20.38-26.24,49.5-45.62,61.25"],"ゾ":["M23.5,26.65c3.83,4.02,7.54,9.72,10.5,17.5","M83,21.9c1.25,2.5,1.3,4.44,0.12,8.5c-5.87,20.37-26.24,49-45.62,60.75","M86.25,10.65c2.75,1.75,6,5.38,7.75,8.5","M92.62,5.77c3.06,1.57,6.68,4.82,8.62,7.62"],"タ":["M48.83,19.75c0.43,1.72,0.39,4-0.58,5.89c-4.77,9.34-9.1,17.82-18.63,27.73","M49.75,30.38c2.75,0.5,5,0,7.62-0.62c6.02-1.43,10.5-2.62,15.88-4.12c5.79-1.62,8.22,0.31,5.88,5.62c-10.88,24.62-22.13,43.99-50.13,59.99","M43.38,45.62c6.75,3.5,10.62,7.88,14.75,15.25"],"ダ":["M48.83,19.75c0.43,1.72,0.39,4-0.58,5.89c-4.77,9.34-9.1,17.82-18.63,27.73","M49.75,30.38c2.5,0.62,5.67-0.14,7.62-0.62c6-1.5,10.5-2.62,15.88-4.12c5.79-1.62,8.22,0.31,5.88,5.62c-10.88,24.62-22.13,43.99-50.13,59.99","M43.38,45.62c6.75,3.5,10.62,7.88,14.75,15.25","M83.62,14.19c2.95,1.81,6.43,5.57,8.3,8.81","M90.12,9.38c3.02,1.63,6.58,5,8.5,7.9"],"チ":["M69.76,15.25c-0.38,2.62-2.01,4.37-3.88,5.38c-7.88,4.25-18.62,9.75-35.5,13.25","M18.5,51.5c2.88,0.88,4.39,1.65,7.88,1.25c22-2.5,36.38-4.25,56.12-4.88c4.88-0.15,7.88,0.51,10.88,1.51","M54.88,30.75c0.88,0.75,1.75,2.49,1.75,4.75c0,6.03,0.03,11.25,0.03,18.27c0,14.98-5.03,29.48-16.53,39.23"],"ヂ":["M70,15.25c-0.38,2.62-2.26,4.37-4.12,5.38c-7.88,4.25-18.62,9.75-35.5,13.25","M18.5,51.5c2.88,0.88,4.39,1.65,7.88,1.25c22-2.5,36.38-4.25,56.12-4.88c4.88-0.15,7.88,0.51,10.88,1.51","M54.88,30.75c0.88,0.75,1.75,2.49,1.75,4.75c0,6.03,0.03,11.25,0.03,18.27c0,14.98-5.03,29.48-16.53,39.23","M79.88,25.73c2.85,1.78,6.21,5.47,8.03,8.65","M86.63,21.12c2.93,1.57,6.39,4.83,8.25,7.63"],"ッ":["M29,51.88c1.89,2.42,3.59,7.57,3.89,11.2","M48.24,45.73c2.69,2.83,5.28,7.67,5.58,12.01","M79.34,49.8c0.6,1.82,0.31,4.24-0.6,6.46c-6.08,14.83-16.95,32.44-36.68,41.62"],"ツ":["M21.5,31.38c2.38,3,4.5,9.38,4.88,13.88","M45.62,23.75c3.38,3.5,6.62,9.5,7,14.88","M84.62,27.88c0.75,2.25,0.39,5.26-0.75,8c-7.63,18.37-21.25,41.12-46,52.5"],"ヅ":["M21.5,30.62c2.38,3,5,9.38,5.38,13.88","M45.87,23c3.38,3.5,6.62,9.5,7,14.88","M84.62,27.62c0.75,2.25,0.39,5.26-0.75,8c-7.63,18.38-21.25,41.38-46,52.76","M86.5,14.58c2.61,1.91,5.7,5.88,7.36,9.3","M92.68,9.62c2.73,1.8,5.95,5.53,7.69,8.75"],"テ":["M36.5,21.5c2.12,1.25,4.38,1.59,7.25,1.25c10.62-1.25,16.88-2.25,24.62-3.25c3.73-0.48,5.63-0.5,8.13-0.25","M20,44.12c2.88,1,5.26,1.05,7.5,0.75c22.38-3,37-5.62,54.13-6.12c5.62-0.16,7.75,0,10.38,0.62","M58,43.25c0.88,1,1.32,2.63,1.12,4.38c-1.74,15.37-11.62,34.99-24.62,41.87"],"デ":["M36.5,21.5c2.12,1.25,4.38,1.59,7.25,1.25c10.62-1.25,16.88-2.25,24.62-3.25c3.73-0.48,5.63-0.5,8.13-0.25","M20,44.12c2.88,1,5.26,1.05,7.5,0.75c22.38-3,37-5.62,54.13-6.12c5.62-0.16,7.75,0,10.38,0.62","M58,43.25c0.88,1,1.32,2.63,1.12,4.38c-1.74,15.37-11.62,34.99-24.62,41.87","M84.25,16.98c2.85,1.78,6.21,5.47,8.03,8.65","M91,12.38c2.93,1.57,6.39,4.83,8.25,7.63"],"ト":["M44,16.38c1.25,1.12,2.12,3.25,2.12,5.5c0,26.12,0,53.5,0,57.62c0,4.12,0,10.5,0,13.38","M49.24,43.12c11.75,4.12,18.25,10.62,24.5,18.75"],"ド":["M44,16.38c1.25,1.12,2.12,3.25,2.12,5.5c0,26.12,0,53.5,0,57.62c0,4.12,0,10.5,0,13.38","M49.24,43.12c11.75,4.12,18.25,10.62,24.5,18.75","M66.87,26.75c2.75,1.75,6,5.38,7.75,8.5","M73.24,21.88c3.06,1.57,6.68,4.82,8.62,7.62"],"ナ":["M18.5,44.12c2.62,1,4.77,1.17,9.12,0.5c19.38-3,37.75-4.75,52.38-5.62c3.75-0.22,8.88-0.25,11.88,0.12","M53.26,14.5c1.75,1.25,2.75,3,2.75,6c0,3,0.12,21.5,0.12,24.25c0,20-6,37.62-18.38,49.12"],"ニ":["M32.63,34.69c2.5,1.19,4.33,1.6,7.45,1.35c11.55-0.91,18.3-2.41,27.04-3.18c2.64-0.23,6.27-0.16,8.39,0.08","M20,74.88c2.62,1,4.78,1.45,9.12,0.75c20.25-3.25,36.5-3.88,52.38-3.88c3.75,0,8,1,11.12,2.38"],"ヌ":["M33.38,27.62c2.75,1.25,5.38,1.16,8.5,0.62c10.12-1.75,19-3.12,28.62-5c6.67-1.3,7.75-0.12,5.38,5.62c-6.7,16.22-20.63,40.52-48.88,57.89","M44.88,46.38c12,6.75,22.38,15.38,30.62,28.12"],"ネ":["M51.38,12.38c3.38,2.12,8,5.88,11,10.88","M26.88,36.16c2.62,1.46,5.45,1.93,8.5,1.19c10.75-2.6,20.75-4.98,30.88-7.5c6.53-1.62,7.81,1.27,4.62,4.68c-11.63,12.47-22.76,23.35-48.88,37.97","M54.38,54.12c1.38,1.75,1.62,3.5,1.62,6c0,2.5,0,27.5,0,29.38c0,1.88,0,4,0,6.88","M65.38,53.62c12.5,6,19.88,11.75,24.88,18.88"],"ノ":["M72.37,25.25c0.75,2,0.92,4.89,0.25,7.25c-7.12,25-25.38,44.75-43.62,56.88"],"ハ":["M39.33,36.88c0.38,1.14,0.46,2.88-0.12,4.14c-6.33,13.73-13.33,23.86-22.21,32.23","M65.5,36.38c13,9.12,23.12,22.62,28,33.38"],"バ":["M39.08,36.62c0.38,1.14,0.38,2.84-0.12,4.14c-5.46,13.99-13.08,24.12-21.96,32.49","M65.5,36.38c13,9.12,23.12,22.62,28,33.38","M81.13,21c2.75,1.75,6,5.38,7.75,8.5","M87.5,16.12c3.06,1.57,6.68,4.82,8.62,7.62"],"パ":["M39.08,36.62c0.38,1.14,0.38,2.84-0.12,4.14c-5.46,13.99-13.08,24.12-21.96,32.49","M65.5,36.38c13,9.12,23.12,22.62,28,33.38","M86,30.12c-9.62,0-9.25-14.25,0-14.25c9.76,0.01,9.5,14.25,0,14.25"],"ヒ":["M35.38,44.5c1.75,1.38,4.51,2.19,6.88,1.88c10.24-1.38,17.24-2.88,24.24-4.26c3.01-0.59,7.12-1,9.38-0.88","M31,17.62c1.38,1.26,1.88,3.38,1.88,6.13c0,2.75-0.88,44-0.88,47.25c0,9.75,4,14.62,13.75,14.62c6,0,16.38,0.12,21.38,0c5-0.12,9.5-0.62,13.5-1.5"],"ビ":["M35.38,44.5c1.75,1.38,4.51,2.19,6.88,1.88c10.24-1.38,17.24-2.88,24.24-4.26c3.01-0.59,7.12-1,9.38-0.88","M31,17.62c1.38,1.26,1.88,3.38,1.88,6.13c0,2.75-0.88,44-0.88,47.25c0,9.75,4,14.62,13.75,14.62c6,0,16.38,0.12,21.38,0c5-0.12,9.5-0.62,13.5-1.5","M78.13,26.25c2.75,1.75,6,5.38,7.75,8.5","M84.5,21.38c3.06,1.57,6.68,4.82,8.62,7.62"],"ピ":["M35.38,44.5c1.75,1.38,4.51,2.19,6.88,1.88c10.24-1.38,17.24-2.88,24.24-4.26c3.01-0.59,7.12-1,9.38-0.88","M31,17.62c1.38,1.26,1.88,3.38,1.88,6.13c0,2.75-0.88,44-0.88,47.25c0,9.75,4,14.62,13.75,14.62c6,0,16.38,0.12,21.38,0c5-0.12,9.5-0.62,13.5-1.5","M83,32.88c-9.62,0-9.25-14.25,0-14.25c9.76-0.01,9.5,14.25,0,14.25"],"フ":["M24.5,30c1.88,1.88,3.5,2.04,6.5,1.62c14.5-2,29-4.38,43.75-6.88c6.82-1.16,10.58,2.29,6.88,9.12c-10.38,19.14-21.25,39.52-50.01,53.64"],"ブ":["M24.5,30c1.88,1.88,3.5,2.04,6.5,1.62c14.5-2,29-4.38,43.75-6.88c6.82-1.16,10.58,2.29,6.88,9.12c-10.38,19.14-21.25,39.52-50.01,53.64","M86,15.63c2.61,1.93,5.7,5.93,7.36,9.37","M92.06,10.5c2.82,1.78,6.15,5.48,7.94,8.66"],"プ":["M24.5,30c1.88,1.88,3.5,2.04,6.5,1.62c14.5-2,29-4.38,43.75-6.88c6.82-1.16,10.58,2.29,6.88,9.12c-10.38,19.14-21.25,39.52-50.01,53.64","M92.62,23.88c-9.62,0-9.25-14.25,0-14.25c9.76-0.01,9.5,14.25,0,14.25"],"ヘ":["M15.5,49.02c2.78,1.55,5.39,0.64,6.95-0.9c4.05-4.01,9.47-8.3,12-10.88c3.16-3.23,7.32-5.26,12.01-1.16c11.25,9.82,25.03,21.45,35.78,30.36c4.28,3.55,7.71,6.85,11.25,9.56"],"ベ":["M15.5,49c2.75,1.5,5.33,0.62,6.88-0.88c4-3.88,9.38-8.5,11.88-11c3.12-3.12,7.23-5.08,11.87-1.12c11.13,9.5,26.25,22.5,36.87,31.12c4.23,3.43,7.62,6.62,11.12,9.25","M66.88,27c2.75,1.75,6,5.38,7.75,8.5","M73.26,22.12c3.06,1.57,6.68,4.82,8.62,7.62"],"ペ":["M15.5,49.25c2.75,1.5,5.33,0.62,6.88-0.88c4-3.88,9.12-8.75,11.62-11.25c3.12-3.12,7.23-5.08,11.87-1.12c11.13,9.5,26.25,22,36.87,30.62c4.23,3.43,7.62,6.62,11.12,9.25","M72.74,36.12c-9.62,0-9.25-14.25,0-14.25c9.76,0.01,9.5,14.25,0,14.25"],"ホ":["M22.63,40.38c2.62,1,4.75,1.71,9.12,1.25c17.75-1.88,29.25-2.75,45.38-3.88c3.74-0.26,7.38-0.12,11.12,0.62","M53.75,17.12c1.38,1.88,1.38,4.5,1.38,7.38c0,2.88-0.12,46.62-0.12,51.88c0,23.12-6.25,11.25-9.75,9.62","M27.38,59.38c0.5,9.25-1.38,16.62-6.38,21.88","M73.25,52.75c10.88,9.63,15.5,17.63,16.63,24.87"],"ボ":["M22.63,40.38c2.62,1,4.75,1.71,9.12,1.25c17.75-1.88,29.25-2.75,45.38-3.88c3.74-0.26,7.38-0.12,11.12,0.62","M53.75,17.12c1.38,1.88,1.38,4.5,1.38,7.38c0,2.88-0.12,46.62-0.12,51.88c0,23.12-6.25,11.25-9.75,9.62","M27.38,59.38c0.5,9.25-1.38,16.62-6.38,21.88","M73.51,53c10.87,9.62,15.5,17.62,16.62,24.88","M72.63,17.5c2.75,1.75,6,5.38,7.75,8.5","M79.01,12.62c3.06,1.57,6.68,4.82,8.62,7.62"],"ポ":["M22.63,40.38c2.62,1,4.75,1.71,9.12,1.25c17.75-1.88,29.25-2.75,45.38-3.88c3.74-0.26,7.38-0.12,11.12,0.62","M53.75,17.12c1.38,1.88,1.38,4.5,1.38,7.38c0,2.88-0.12,46.62-0.12,51.88c0,23.12-6.25,11.25-9.75,9.62","M27.38,59.38c0.5,9.25-1.38,16.62-6.38,21.88","M73.51,53c10.87,9.62,15.5,17.62,16.62,24.88","M79.75,25.62c-9.62,0-9.25-14.25,0-14.25c9.76,0.01,9.5,14.25,0,14.25"],"マ":["M21.5,33.75c1.88,1.88,3.5,1.99,6.5,1.62c19.62-2.38,33.5-4,51.25-6.38c6.85-0.92,9.37,1.67,4.38,7.62c-7.12,8.5-17.88,20-28.75,31.62","M43.38,58.88c8.43,6.5,16.6,15.93,20.25,26.25"],"ミ":["M41.87,20c10.4,2.57,20.5,6.3,25,10.38","M42,46.88c10.72,2.69,21.11,6.6,25.75,10.88","M36.5,75c15.71,4.49,30.95,11,37.75,18.12"],"ム":["M53.84,22.5c0.88,1.75,0.78,4.57-0.38,6.88c-9.25,18.38-16.19,30.96-25.25,45.75c-3.75,6.12-3,8.38,4.38,7.12c7.38-1.26,46.62-8.12,49.62-8.88","M72.21,60.12c6.88,6.38,13.62,14.88,16,25.38"],"メ":["M73.38,19.12c0.88,1.75,0.48,4.44-0.38,6.88c-7.75,22.12-21.75,47.62-45,62.88","M39.51,39.5c16.54,7.76,32.12,18,38.5,30.88"],"モ":["M27.88,26.19c2.5,1.19,4.33,1.6,7.45,1.35c11.55-0.91,21.93-2.16,32.79-3.93c2.62-0.42,6.27-0.41,8.39-0.17","M17.5,54.38c2.62,1,4.78,1.45,9.12,0.75c20.26-3.25,33.88-5.38,51.64-6.13c3.75-0.16,7.38,0.25,11.12,0.88","M48.76,29.88c1.12,1.62,1.42,3.62,1.42,6.12c0,6.53-0.65,33.56-0.65,35.88c0,7.67,3.09,11.08,10.53,11.76c5.33,0.49,12.31,0.24,16.37,0c4.46-0.26,6.52-0.74,9.59-1.43"],"ャ":["M25,56.25c1.67,1.28,4.84,1.85,7.96,1.08c14.85-3.64,26.27-6.16,38.45-9.34c17.31-4.52,1.18,11.21-2.16,15.73","M41.1,35.5c1.3,1.1,2,2.1,2.5,4.1c0.5,2,9.4,41.62,9.9,43.72c0.5,2.1,1.7,7.2,2.4,9.8"],"ヤ":["M18,45.75c2.12,1.62,6.15,2.35,10.12,1.38c18.88-4.62,33.39-7.83,48.88-11.88c22-5.75,1.5,14.25-2.75,20","M38.47,19.38c1.65,1.4,2.54,2.67,3.18,5.21c0.64,2.54,11.95,52.9,12.59,55.57c0.64,2.67,2.16,9.16,3.05,12.46"],"ュ":["M34.8,52.84c1.91,1.21,4.13,1.67,7.44,1.21c10.65-1.51,13.99-1.68,21.71-2.97c5.43-0.9,6.26,0.13,5.23,5.12c-1.91,9.25-3.92,19.45-5.23,27.49","M24.5,86.21c2.21,1.21,3.84,1.73,7.34,1.21c18.54-2.79,28.95-3.12,43.52-3.12c3.02,0,5.93,0.4,8.95,0.9"],"ユ":["M29.5,35.38c2.38,1.5,5.14,2.08,9.25,1.5c13.25-1.88,18.02-2.4,27.62-4c6.75-1.12,7.78,0.16,6.5,6.38c-2.38,11.5-4.88,24.5-6.5,34.5","M17,76.88c2.75,1.5,4.76,2.05,9.12,1.5c22.62-2.88,36-3.88,54.12-3.88c3.75,0,7.38,0.5,11.12,1.12"],"ョ":["M33.5,50.62c1.9,1.21,4.09,1.6,7.39,1.21c11.19-1.32,21.35-2.46,29.07-3.44c4.79-0.61,5.49,0.4,5.2,5.16c-0.79,12.56-1.5,24.79-2.4,34.21","M33.6,69.04c1.9,1.21,4.09,1.6,7.39,1.21c8.39-0.99,18.23-1.85,24.86-2.47c2.21-0.2,4.21,0.04,6.21,0.44","M29,90.06c2.2,1.05,3.79,1.36,7.29,1.05c9.99-0.88,23.47-2.35,33.07-2.35c2.7,0,4.49,0,7.49,0.44"],"ヨ":["M29.13,30.12c2.38,1.5,5.12,1.98,9.25,1.5c14-1.62,26.71-3.04,36.38-4.25c6-0.75,6.88,0.5,6.5,6.38c-1,15.51-1.89,30.63-3.01,42.25","M29.25,52.88c2.38,1.5,5.12,1.98,9.25,1.5c10.5-1.22,22.81-2.29,31.11-3.04c2.77-0.25,5.27,0.04,7.77,0.54","M23.5,78.84c2.75,1.3,4.74,1.68,9.12,1.3c12.5-1.08,29.37-2.9,41.38-2.9c3.38,0,5.62,0,9.38,0.54"],"ラ":["M38.63,21.06c2.07,1.86,4.43,2.53,8.05,2.15c9.2-0.96,14.34-2.01,21.57-2.95c2.41-0.31,4.13-0.53,6.51-0.19","M26,41.89c2.38,1.7,5.12,2.24,9.25,1.7c14-1.84,31.21-4.95,40.88-6.32c6-0.85,8.14,0.62,6.25,5.72c-6.88,18.62-22,38.25-45.25,48.62"],"リ":["M35,18.38c1.12,1.5,1.62,3,1.62,4.88c0,1.88,0,25,0,27c0,2,0,6.12,0,7.75","M71,15.38c1.5,1.25,2.38,3.12,2.38,5.38c0,2.26-0.12,28.88-0.12,32.88c0,19.62-9.5,32.25-21.75,40.38"],"ル":["M34.38,31.88c1.12,1.5,1.72,3,1.62,4.88c-1.12,22.88-8.88,40.62-17.5,49.5","M56.51,19.62c1.5,1.25,2.38,3.12,2.38,5.38c0,2.26-0.12,47.62-0.12,51.62c0,10.5,0.52,10.21,9.38,2.75c9.5-8,16.5-14.62,26.38-25.62"],"レ":["M34.5,19.75c1.5,1.25,2.38,3.12,2.38,5.38c0,2.26-0.12,50.12-0.12,54.12c-0.02,8.75-0.14,8.63,9.36,3.75c13.23-6.79,33.38-22.5,43.25-33.5"],"ロ":["M25,33.25c1.5,1.25,2.16,3.14,2.38,5.38c0.96,10.07,2.14,23.67,3.14,34.88c0.31,3.4,0.59,6.58,0.86,9.38","M28.13,36.12c9.25-1,37.62-3.12,45.62-4.25c8-1.13,9.57,0.53,8.38,6.62c-2.13,10.89-4.13,21.89-6.75,34.89","M32,78.12c5.38-0.5,33.62-3,36.5-3c2.88,0,7.88-0.25,11.5,0.25"],"ワ":["M25,23.62c1.5,1.25,2.16,3.14,2.38,5.38c0.96,10.07,0.89,8.17,1.89,19.38c0.31,3.4,0.59,6.58,0.86,9.38","M27.75,26.38c3.12,0.38,5.16,0.22,8.23-0.06c13.77-1.29,27.15-2.32,41.65-3.7c8.04-0.76,9.44,0.51,8.38,6.62c-4.76,27.26-20.64,47.64-43.88,61.51"],"ヲ":["M30.24,25.14c2.38,1.7,5.11,2.13,9.25,1.7c12.32-1.29,21.94-2.6,30.48-3.64c2.81-0.34,5.51-0.65,8.14-0.93","M29,46.69c2.25,1.44,4.44,1.9,8.05,1.4c8.19-1.15,19.93-2.64,28.56-3.79c2.38-0.31,4.65-0.62,6.75-0.92","M78,22.88c0.88,2,0.62,4.64,0.12,7c-4.88,22.5-23.5,47.12-44.12,60.74"],"ン":["M26.5,24.88c5.76,2.15,12.68,8.47,15.75,14.25","M28.62,83.75c2.5,1.62,5.12,0.96,7.75-0.62c20.13-12.13,35-24.63,49.63-41.13"],"ヴ":["M53.25,14.62c1,1.12,1.25,3,1.25,4.62c0,1.62,0,10.76,0,12.64","M26.5,31.25c1,1.12,1.22,3,1.25,4.62c0.09,4.45,0.29,10.95,0.45,16.37c0.07,2.5,0.14,4.77,0.18,6.5","M29.12,35.88c19.38-2.25,40.25-4.25,49-5.5c8.75-1.25,8.28,0.84,6.25,6.88c-5,14.88-20.12,43.5-41,56.62","M85.12,16.5c2.75,1.75,6,5.38,7.75,8.5","M91.5,11.62c3.06,1.57,6.68,4.82,8.62,7.62"],"ー":["M14.5,53c5.75-0.75,11.62-0.95,14.5-1c21.62-0.38,40.75-1.62,45.38-1.62c4.63,0,16.75-0.62,20.12-0.62"]};
function strokeStart(d) {
  const m = /^M\s*(-?[\d.]+)[,\s]+(-?[\d.]+)/i.exec(d);
  return m ? [parseFloat(m[1]), parseFloat(m[2])] : null;
}

// ————— Stroke-order animation —————
function StrokeView({ ch, size = 132, numbers, auto }) {
  const paths = STROKES[ch] || [];
  const refs = useRef([]);
  const [lens, setLens] = useState([]);
  const [step, setStep] = useState(-1);
  const timer = useRef(null);
  const reduced = typeof window !== "undefined" && window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;

  useEffect(() => {
    const measured = paths.map((_, i) => {
      const el = refs.current[i];
      try { return el && el.getTotalLength ? el.getTotalLength() : 120; } catch { return 120; }
    });
    setLens(measured);
    setStep(reduced ? paths.length : -1);
    if (auto && !reduced) {
      const t = setTimeout(() => setStep(0), 120);
      return () => clearTimeout(t);
    }
  }, [ch]);

  useEffect(() => {
    if (reduced || step < 0 || step >= paths.length) return;
    const dur = Math.max(240, (lens[step] || 120) * 5.5);
    timer.current = setTimeout(() => setStep((s) => s + 1), dur + 110);
    return () => clearTimeout(timer.current);
  }, [step, lens, paths.length]);

  const play = () => { clearTimeout(timer.current); setStep(reduced ? paths.length : 0); };
  const idle = step < 0;

  return (
    <div style={{ display: "inline-block", textAlign: "center" }}>
      <svg width={size} height={size} viewBox={`0 0 ${STROKE_BOX} ${STROKE_BOX}`}
        role="img" aria-label={`${ch}, stroke order`}
        style={{ background: T.sheet, border: `1px solid ${T.hairline}`, borderRadius: 3, cursor: "pointer" }}
        onClick={play}>
        <line x1={STROKE_BOX/2} y1="0" x2={STROKE_BOX/2} y2={STROKE_BOX} stroke={T.hairline} strokeWidth="0.6" strokeDasharray="3 3" />
        <line x1="0" y1={STROKE_BOX/2} x2={STROKE_BOX} y2={STROKE_BOX/2} stroke={T.hairline} strokeWidth="0.6" strokeDasharray="3 3" />
        {paths.map((d, i) => (
          <path key={"g" + i} d={d} fill="none" stroke="#EAE8E1" strokeWidth="5.5"
            strokeLinecap="round" strokeLinejoin="round" />
        ))}
        {paths.map((d, i) => {
          const len = lens[i] || 120;
          const drawn = step > i;
          const active = step === i;
          return (
            <path key={"s" + i} ref={(el) => (refs.current[i] = el)} d={d} fill="none"
              stroke={active ? T.shu : T.ink} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
              style={{
                strokeDasharray: len,
                strokeDashoffset: drawn || active ? 0 : len,
                transition: active ? `stroke-dashoffset ${Math.max(240, len * 5.5)}ms linear` : "none",
              }} />
          );
        })}
        {numbers && paths.map((d, i) => {
          const pt = strokeStart(d);
          if (!pt) return null;
          return (
            <g key={"n" + i}>
              <circle cx={pt[0]} cy={pt[1]} r="7.5" fill={T.sheet} stroke={T.ai} strokeWidth="1" opacity="0.92" />
              <text x={pt[0]} y={pt[1] + 3.2} textAnchor="middle" fontSize="9" fill={T.ai}
                fontFamily="sans-serif">{i + 1}</text>
            </g>
          );
        })}
      </svg>
      <div style={{ fontSize: 11, color: T.sub, marginTop: 4 }}>
        {idle ? "tap to write" : `${paths.length} stroke${paths.length === 1 ? "" : "s"}`}
      </div>
    </div>
  );
}

function StrokePanel({ ch, onClose, onPractise }) {
  const [numbers, setNumbers] = useState(false);
  const [replay, setReplay] = useState(0);
  const boxRef = useRef(null);
  const { play, canPlay, playSound } = useKanaAudio();

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
      display: "flex", gap: 18, alignItems: "flex-start", flexWrap: "wrap",
    }}>
      {known ? <StrokeView key={ch + replay} ch={ch} auto numbers={numbers} /> : (
        <div style={{ fontSize: 13, color: T.sub }}>No stroke data for this character yet.</div>
      )}
      <div style={{ flex: 1, minWidth: 160 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <span style={{ fontFamily: T.jpFont, fontSize: 26 }}>{ch}</span>
          <span style={{ fontSize: 14, color: T.sub }}>{soundFor(ch)}</span>
        </div>
        <p style={{ fontSize: 13, color: T.sub, lineHeight: 1.6, marginTop: 8, marginBottom: 10 }}>
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
          {canPlay(ch) && (ALT_SOUND[ch] ? (
            <>
              <button className="btn-ghost" onClick={() => playSound(ALT_SOUND[ch], ch)}>
                ▶ {ALT_SOUND[ch]}
              </button>
              <button className="btn-ghost" onClick={() => play(ch)}>▶ {soundFor(ch)}</button>
            </>
          ) : (
            <button className="btn-ghost" onClick={() => play(ch)}>▶ Hear it</button>
          ))}
          <button className="btn-ghost" onClick={() => setNumbers((v) => !v)}>
            {numbers ? "Hide numbers" : "Show numbers"}
          </button>
          <button className="btn-ghost" onClick={onClose}>Close</button>
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

function Learn({ mod, progress, onProgress, onPractise }) {
  const col = mod.col ? COLS.find((c) => c.key === mod.col) : null;
  const [sel, setSel] = useState(null);
  const walk = walkCharsFor(mod);
  const walked = ((progress || {})[mod.id] || {}).walked || [];
  const [showChart, setShowChart] = useState(!walk.length);
  useEffect(() => {
    setSel(null);
    const w = walkCharsFor(mod);
    const done = ((progress || {})[mod.id] || {}).walked || [];
    setShowChart(!w.length || w.every((c) => done.includes(c)));
  }, [mod.id]);
  const traps = mod.show || [];

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
      {String(mod.exp).split("\n\n").map((para, i) => (
        <p key={i} style={{ fontSize: 15, lineHeight: 1.75, marginTop: i === 0 ? 0 : 14 }}>{para}</p>
      ))}

      {walk.length > 0 && (
        <CharacterWalk chars={walk} modId={mod.id} progress={progress} onProgress={onProgress}
          onDone={() => setShowChart(true)} />
      )}
      {walk.length > 0 && !showChart && (
        <button className="btn-ghost" onClick={() => setShowChart(true)}>Skip to the full chart</button>
      )}

      {showChart && col && (
        <div style={{ margin: "18px 0 0" }}>
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
        </div>
      )}

      {showChart && mod.youon && <YouonChart />}

      {traps.length > 0 && (
        <div style={{ margin: "18px 0 0" }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".5px", color: T.sub, marginBottom: 8 }}>
            WATCH THEM WRITTEN
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {traps.map((k, i) => charBtn(k, i, soundFor(k)))}
          </div>
          <p style={{ fontSize: 11, color: T.sub, marginTop: 8, marginBottom: 0 }}>
            The difference is in the movement, not the finished shape. Tap each one.
          </p>
        </div>
      )}

      <StrokePanel ch={sel} onClose={() => setSel(null)} onPractise={onPractise} />

      {mod.showcase && mod.showcase.length > 0 && (
        <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 8 }}>
          {mod.showcase.map((w, i) => (
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

      {mod.notes.length > 0 && (
        <div style={{
          background: T.noteBg, border: `1px solid ${T.note}44`, borderLeft: `3px solid ${T.note}`,
          borderRadius: 4, padding: "12px 16px", marginTop: 16,
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".5px", color: T.note, marginBottom: 8 }}>
            WORTH KNOWING
          </div>
          {mod.notes.map((n, i) => (
            <div key={i} style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 5 }}>{n}</div>
          ))}
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
const TRACE_N = 24;
const TOL = { good: 7, ok: 12, loose: 20 };

function resample(pts, n) {
  if (!pts.length) return [];
  if (pts.length === 1) return Array.from({ length: n }, () => pts[0]);
  const acc = [0];
  for (let i = 1; i < pts.length; i++) acc.push(acc[i-1] + Math.hypot(pts[i][0]-pts[i-1][0], pts[i][1]-pts[i-1][1]));
  const total = acc[acc.length - 1];
  if (total === 0) return Array.from({ length: n }, () => pts[0]);
  const out = []; let j = 0;
  for (let k = 0; k < n; k++) {
    const target = (total * k) / (n - 1);
    while (j < acc.length - 2 && acc[j+1] < target) j++;
    const seg = acc[j+1] - acc[j];
    const t = seg > 0 ? (target - acc[j]) / seg : 0;
    out.push([pts[j][0] + (pts[j+1][0]-pts[j][0])*t, pts[j][1] + (pts[j+1][1]-pts[j][1])*t]);
  }
  return out;
}

function samplePath(d, n) {
  if (typeof document === "undefined") return [];
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("style", "position:absolute;width:0;height:0;overflow:hidden;pointer-events:none");
  const p = document.createElementNS(NS, "path");
  p.setAttribute("d", d);
  svg.appendChild(p);
  document.body.appendChild(svg);
  let out = [];
  try {
    const len = p.getTotalLength();
    for (let i = 0; i < n; i++) { const pt = p.getPointAtLength((len * i) / (n - 1)); out.push([pt.x, pt.y]); }
  } catch { out = []; }
  document.body.removeChild(svg);
  return out;
}

const meanDist = (a, b) => {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += Math.hypot(a[i][0] - b[i][0], a[i][1] - b[i][1]);
  return s / a.length;
};

// Compares a learner stroke to a reference. Direction is caught by scoring the
// reference both ways round: if reversed fits clearly better, they drew it
// backwards — right shape, wrong movement.
function scoreStroke(userPts, refPts) {
  const u = resample(userPts, TRACE_N);
  if (u.length !== TRACE_N || refPts.length !== TRACE_N) return { dist: 999, backwards: false };
  const fwd = meanDist(u, refPts);
  const rev = meanDist(u, [...refPts].reverse());
  return { dist: Math.min(fwd, rev), backwards: rev < fwd * 0.9 };
}

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
const SD_KEY = "stroke-data-v1";
const CAL_MIN = 8;        // samples before the floor is trusted
const CAL_KEEP = 60;      // rolling calibration window
const LOG_KEEP = 400;     // rolling attempt log
const LOG_PTS = 48;       // points retained per attempt

const median = (a) => {
  if (!a.length) return null;
  const b = [...a].sort((x, y) => x - y);
  const m = b.length >> 1;
  return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2;
};

// Multipliers come from the synthetic separation analysis: correct-with-tremor
// stays well under the point where wrong strokes begin. Clamps stop a freakishly
// steady or freakishly shaky calibration from producing a useless bar.
function tolerancesFor(floor) {
  if (floor == null) return { ...TOL, calibrated: false };
  const cl = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  return { good: cl(floor*1.6, 4, 10), ok: cl(floor*2.6, 7, 16), loose: cl(floor*4.0, 12, 26), calibrated: true };
}

function thinPoints(pts, n) {
  if (pts.length <= n) return pts.map(([x, y]) => [Math.round(x*10)/10, Math.round(y*10)/10]);
  const step = (pts.length - 1) / (n - 1);
  return Array.from({ length: n }, (_, i) => {
    const p = pts[Math.round(i * step)];
    return [Math.round(p[0]*10)/10, Math.round(p[1]*10)/10];
  });
}

function useStrokeData() {
  const data = useRef({ cal: [], log: [] });
  const [, bump] = useState(0);
  const dirty = useRef(0);
  const loaded = useRef(false);

  const flush = async () => {
    if (!loaded.current || !dirty.current) return;
    dirty.current = 0;
    try { await window.storage.set(SD_KEY, JSON.stringify(data.current)); }
    catch (e) { console.error("stroke data save failed", e); }
  };

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get(SD_KEY);
        if (r) {
          const p = JSON.parse(r.value);
          data.current = { cal: p.cal || [], log: p.log || [] };
        }
      } catch { /* first run */ }
      loaded.current = true;
      bump((v) => v + 1);
    })();
    return () => { flush(); };
  }, []);

  const record = (entry, calSample) => {
    data.current.log = [...data.current.log, entry].slice(-LOG_KEEP);
    if (calSample != null) data.current.cal = [...data.current.cal, calSample].slice(-CAL_KEEP);
    dirty.current++;
    bump((v) => v + 1);
    if (dirty.current >= 5) flush();   // batched: storage is rate limited
  };

  const resetCal = () => {
    data.current = { ...data.current, cal: [] };
    dirty.current++;
    bump((v) => v + 1);
    flush();
  };

  const cal = data.current.cal;
  return {
    cal,
    log: data.current.log,
    floor: cal.length >= CAL_MIN ? median(cal) : null,
    record,
    resetCal,
  };
}

const STAGES = [
  { id: "trace", label: "Trace", blurb: "Follow the grey stroke. This is about the movement, not accuracy." },
  { id: "guided", label: "Guided", blurb: "Earlier strokes stay. Draw the next one from memory." },
  { id: "blank", label: "Blank", blurb: "Nothing shown. Order is yours to get right now." },
];

function StrokePractice({ chars, modId, progress, onProgress, startCh }) {
  const [ch, setCh] = useState(startCh || chars[0] || null);
  // Arriving from a character panel should land on THAT character.
  useEffect(() => { if (startCh) setCh(startCh); }, [startCh]);
  const [stageIdx, setStageIdx] = useState(0);
  const [strokeIdx, setStrokeIdx] = useState(0);
  const [drawn, setDrawn] = useState([]);      // learner strokes, box coords
  const [feedback, setFeedback] = useState(null);
  const [compare, setCompare] = useState("glyph");
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const currentRef = useRef([]);
  const pointerType = useRef("unknown");
  const { cal, log, floor, record, resetCal } = useStrokeData();
  const tol = tolerancesFor(floor);

  const paths = (ch && STROKES[ch]) || [];
  const refs = useMemo(() => paths.map((d) => samplePath(d, TRACE_N)), [ch]);
  const stage = STAGES[stageIdx];
  const SIZE = 260;
  const K = SIZE / STROKE_BOX;

  useEffect(() => { setStrokeIdx(0); setDrawn([]); setFeedback(null); }, [ch, stageIdx]);

  const redraw = () => {
    const cv = canvasRef.current;
    if (!cv) return;
    const g = cv.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    if (cv.width !== SIZE * dpr) { cv.width = SIZE * dpr; cv.height = SIZE * dpr; }
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, SIZE, SIZE);

    g.fillStyle = T.sheet;
    g.fillRect(0, 0, SIZE, SIZE);
    g.strokeStyle = T.hairline;
    g.lineWidth = 1;
    g.setLineDash([4, 4]);
    g.beginPath(); g.moveTo(SIZE / 2, 0); g.lineTo(SIZE / 2, SIZE);
    g.moveTo(0, SIZE / 2); g.lineTo(SIZE, SIZE / 2); g.stroke();
    g.setLineDash([]);
    g.strokeRect(0.5, 0.5, SIZE - 1, SIZE - 1);

    const poly = (pts, colour, w) => {
      if (pts.length < 2) return;
      g.strokeStyle = colour; g.lineWidth = w; g.lineCap = "round"; g.lineJoin = "round";
      g.beginPath(); g.moveTo(pts[0][0] * K, pts[0][1] * K);
      for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0] * K, pts[i][1] * K);
      g.stroke();
    };

    // Context from the reference, depending on stage
    if (stage.id === "trace" && refs[strokeIdx]) poly(refs[strokeIdx], "#DEDCD4", 13);
    if (stage.id !== "blank") for (let i = 0; i < strokeIdx; i++) if (refs[i]) poly(refs[i], "#C9C7BF", 11);

    drawn.forEach((s) => poly(s, T.ink, 11));
    if (currentRef.current.length) poly(currentRef.current, T.shu, 11);
  };

  useEffect(redraw, [ch, stageIdx, strokeIdx, drawn, refs]);

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
    setFeedback(null);
    redraw();
  };
  const move = (e) => {
    if (!drawing.current) return;
    currentRef.current.push(toBox(e));
    redraw();
  };
  const up = () => {
    if (!drawing.current) return;
    drawing.current = false;
    const pts = currentRef.current;
    currentRef.current = [];
    if (pts.length < 3) { redraw(); return; }

    let result;
    if (stage.id === "blank") {
      // Score against every remaining stroke — lets us tell "wrong order" apart
      // from "wrong stroke", which are very different mistakes.
      let best = { i: strokeIdx, ...scoreStroke(pts, refs[strokeIdx] || []) };
      refs.forEach((r, i) => {
        if (i < strokeIdx) return;
        const sc = scoreStroke(pts, r);
        if (sc.dist < best.dist) best = { i, ...sc };
      });
      result = { ...best, outOfOrder: best.i !== strokeIdx && best.dist < TOL.ok };
    } else {
      result = { i: strokeIdx, ...scoreStroke(pts, refs[strokeIdx] || []) };
    }

    const bar = stage.id === "trace" ? tol.loose : stage.id === "guided" ? (tol.ok + tol.loose) / 2 : tol.ok;
    let tier, msg;
    if (result.outOfOrder) {
      tier = "unnatural";
      msg = `That's stroke ${result.i + 1}, drawn well — but stroke ${strokeIdx + 1} comes first. Order is the thing being tested here.`;
    } else if (result.dist > bar) {
      tier = "fix";
      msg = "That doesn't follow the stroke. Watch it once more, then try again.";
    } else if (result.backwards) {
      tier = "unnatural";
      msg = "Right shape, drawn backwards. The direction is what makes handwriting readable — start from the other end.";
    } else if (result.dist <= tol.good) {
      tier = "good"; msg = "Clean.";
    } else {
      tier = "ok"; msg = "Close enough. A little loose, but the movement is right.";
    }

    // Calibration draws only on Trace, where a ghost is visible, and ignores
    // wild misses so one bad swipe cannot poison the floor.
    const calSample = stage.id === "trace" && result.dist < 25 && !result.backwards ? result.dist : null;
    record({
      t: Date.now(), ch, stroke: strokeIdx, stage: stage.id, device: pointerType.current,
      dist: Math.round(result.dist * 100) / 100, backwards: !!result.backwards,
      outOfOrder: !!result.outOfOrder, tier, pts: thinPoints(pts, LOG_PTS),
    }, calSample);
    setFeedback({ tier, msg });
    if (tier === "good" || tier === "ok") {
      const next = [...drawn, pts];
      setDrawn(next);
      const done = strokeIdx + 1 >= paths.length;
      setStrokeIdx(strokeIdx + 1);
      if (done) {
        const prev = progress[modId] || {};
        const key = "traced";
        const seen = new Set(prev[key] || []);
        seen.add(ch + ":" + stage.id);
        onProgress({ ...progress, [modId]: { ...prev, [key]: [...seen] } });
      }
    } else {
      redraw();
    }
  };

  if (!chars.length) return <p style={{ fontSize: 14, color: T.sub }}>No characters to practise in this lesson.</p>;
  if (!paths.length) return <p style={{ fontSize: 14, color: T.sub }}>No stroke data for this character yet.</p>;

  const finished = strokeIdx >= paths.length;
  const tierColour = feedback
    ? feedback.tier === "fix" ? T.shu : feedback.tier === "unnatural" ? T.ai : T.ok
    : T.sub;
  const doneSet = new Set((progress[modId] || {}).traced || []);

  return (
    <div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        {chars.map((c) => (
          <button key={c} onClick={() => setCh(c)} style={{
            fontFamily: T.jpFont, fontSize: 22, padding: "6px 12px", borderRadius: 4, cursor: "pointer",
            background: ch === c ? T.ink : T.sheet, color: ch === c ? T.paper : T.ink,
            border: `1px solid ${ch === c ? T.ink : T.hairline}`,
          }}>{c}</button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
        {STAGES.map((s, i) => {
          const cleared = doneSet.has(ch + ":" + s.id);
          return (
            <button key={s.id} onClick={() => setStageIdx(i)} style={{
              padding: "5px 14px", borderRadius: 999, fontSize: 12, cursor: "pointer", fontFamily: "inherit",
              background: stageIdx === i ? T.ink : "none", color: stageIdx === i ? T.paper : T.sub,
              border: `1px solid ${stageIdx === i ? T.ink : T.hairline}`,
            }}>{s.label}{cleared ? " ✓" : ""}</button>
          );
        })}
      </div>
      <p style={{ fontSize: 13, color: T.sub, marginTop: 0, marginBottom: 10 }}>{stage.blurb}</p>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div>
          <canvas
            ref={canvasRef}
            style={{
              width: SIZE, height: SIZE, maxWidth: "100%", borderRadius: 3, touchAction: "none",
              border: `1px solid ${T.hairline}`, cursor: "crosshair", display: "block",
            }}
            onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onPointerLeave={up}
          />
          <div style={{ fontSize: 11, color: T.sub, marginTop: 4, textAlign: "center" }}>yours</div>
        </div>
        {finished && (
          <div>
            {compare === "glyph" ? (
              <div style={{
                width: SIZE, height: SIZE, maxWidth: "100%", borderRadius: 3, background: T.sheet,
                border: `1px solid ${T.hairline}`, display: "flex", alignItems: "center",
                justifyContent: "center", fontFamily: T.jpFont, fontSize: SIZE * 0.72, lineHeight: 1,
              }}>{ch}</div>
            ) : (
              <StrokeView ch={ch} size={SIZE} auto />
            )}
            <div style={{ marginTop: 4, textAlign: "center" }}>
              <button className="btn-ghost" style={{ fontSize: 11, padding: "3px 10px" }}
                onClick={() => setCompare(compare === "glyph" ? "animate" : "glyph")}>
                {compare === "glyph" ? "watch it written" : "show the character"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ fontSize: 12, color: T.sub, marginTop: 8 }}>
        {finished ? `All ${paths.length} strokes done` : `Stroke ${strokeIdx + 1} of ${paths.length}`}
      </div>

      {feedback && (
        <div style={{
          marginTop: 10, padding: "10px 14px", borderRadius: 4, fontSize: 14, lineHeight: 1.6,
          background: feedback.tier === "fix" ? "#FBEDEA" : feedback.tier === "unnatural" ? "#EEF1F6" : "#EDF4EE",
          border: `1px solid ${tierColour}55`,
        }}>
          <strong style={{ color: tierColour }}>
            {feedback.tier === "fix" ? "Not quite. " : feedback.tier === "unnatural" ? "Careful. " : "Good. "}
          </strong>
          {feedback.msg}
        </div>
      )}

      {finished && (
        <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {stageIdx < STAGES.length - 1 && (
            <button className="btn-primary" onClick={() => setStageIdx(stageIdx + 1)}>
              Next stage: {STAGES[stageIdx + 1].label}
            </button>
          )}
          <button className="btn-ghost" onClick={() => { setStrokeIdx(0); setDrawn([]); setFeedback(null); }}>
            Again
          </button>
        </div>
      )}
      {!finished && (
        <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn-ghost" onClick={() => {
            if (!drawn.length) return;
            setDrawn(drawn.slice(0, -1)); setStrokeIdx(Math.max(0, strokeIdx - 1)); setFeedback(null);
          }}>Undo stroke</button>
          <button className="btn-ghost" onClick={() => { setStrokeIdx(0); setDrawn([]); setFeedback(null); }}>Clear</button>
        </div>
      )}

      {finished && (
        <div style={{
          marginTop: 14, padding: "14px 16px", borderRadius: 4, background: T.noteBg,
          border: `1px solid ${T.note}44`, borderLeft: `3px solid ${T.note}`,
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".5px", color: T.note, marginBottom: 8 }}>
            NOW CHECK IT YOURSELF
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.7, margin: "0 0 10px" }}>
            The check above only knows count, direction, order and rough shape. What it cannot see is
            the part that makes a character look written rather than drawn — how each stroke ends.
            Japanese handwriting names three endings, and every stroke is one of them.
          </p>
          <div style={{ fontSize: 14, lineHeight: 1.7 }}>
            <div style={{ marginBottom: 4 }}>
              <span style={{ fontFamily: T.jpFont }}>とめ</span> — <strong>the stop.</strong> The stroke
              ends firmly and stops dead. No tail, no drift past the end.
            </div>
            <div style={{ marginBottom: 4 }}>
              <span style={{ fontFamily: T.jpFont }}>はね</span> — <strong>the hook.</strong> The stroke
              finishes with a small flick, usually up and back.
            </div>
            <div style={{ marginBottom: 10 }}>
              <span style={{ fontFamily: T.jpFont }}>はらい</span> — <strong>the sweep.</strong> The stroke
              tapers and releases, thinning as it leaves the paper.
            </div>
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.7, margin: "0 0 10px" }}>
            Put yours beside the character above and look only at the ends. Does each one stop where it
            should stop, flick where it should flick, taper where it should taper? Then look at balance —
            is any part crowding another, and does the whole thing sit centred in the square?
          </p>
          <p style={{ fontSize: 13, color: T.sub, lineHeight: 1.6, margin: 0 }}>
            Want more room? The <strong>Free writing pad</strong> on the lesson list has an open canvas
            and a character lookup, so you can practise any character against its animation.
          </p>
        </div>
      )}
      <details style={{ marginTop: 14 }}>
        <summary style={{ fontSize: 12, color: T.sub, cursor: "pointer" }}>
          Calibration {tol.calibrated ? `· adapted to your hand (${cal.length} samples)` : `· learning (${cal.length}/${CAL_MIN})`}
        </summary>
        <div style={{ fontSize: 12, color: T.sub, lineHeight: 1.7, marginTop: 8 }}>
          <p style={{ margin: "0 0 8px" }}>
            The Trace stage measures how steadily you draw with this device, and the bar for the later
            stages is set relative to that rather than to a fixed number. A finger on a phone and a
            stylus on a tablet are held to the same standard, not the same tolerance.
          </p>
          <div style={{ fontFamily: "monospace", fontSize: 11, marginBottom: 8 }}>
            floor {floor == null ? "—" : floor.toFixed(2)} · good {tol.good.toFixed(1)} · ok{" "}
            {tol.ok.toFixed(1)} · loose {tol.loose.toFixed(1)} · logged {log.length}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="btn-ghost" onClick={() => {
              try { navigator.clipboard.writeText(JSON.stringify(log)); } catch (e) { console.error(e); }
            }}>Copy attempt log</button>
            <button className="btn-ghost" onClick={resetCal}>Reset calibration</button>
          </div>
          <p style={{ margin: "8px 0 0" }}>
            The log keeps the raw points of your last {LOG_KEEP} strokes, not just the scores, so
            attempts can be re-scored later with different maths. Nothing leaves this device.
          </p>
        </div>
      </details>
      <p style={{ fontSize: 11, color: T.sub, marginTop: 12, marginBottom: 0, lineHeight: 1.6 }}>
        This checks stroke count, direction, order and rough shape — not stroke quality, which doesn't
        survive being turned into coordinates. That part is yours to judge.
      </p>
    </div>
  );
}

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
// Extracted from CharacterWalk so the pair practice and Listen & Write can both
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

function CharacterWalk({ chars, modId, progress, onProgress, onDone }) {
  const { play: playKana, canPlay: canPlayKana,
          playSound: playSoundKana } = useKanaAudio();
  const cleared = (progress[modId] || {}).walked || [];
  const firstUndone = chars.findIndex((c) => !cleared.includes(c));
  const [i, setI] = useState(firstUndone < 0 ? chars.length : firstUndone);
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

  const ch = chars[i];
  const paths = (ch && STROKES[ch]) || [];
  const refs = useMemo(() => paths.map((d) => samplePath(d, TRACE_N)), [ch]);
  const SIZE = 210;
  const K = SIZE / STROKE_BOX;

  useEffect(() => { setReps(0); setStrokeIdx(0); setDrawn([]); setFeedback(null); }, [ch]);
  useEffect(() => { if (i >= chars.length && onDone) onDone(); }, [i]);

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
      setI(i + 1);
    }
  };

  if (i >= chars.length) {
    return (
      <div style={{
        margin: "16px 0", padding: "14px 16px", borderRadius: 4, background: "#EDF4EE",
        border: `1px solid ${T.ok}55`, fontSize: 14, lineHeight: 1.7,
      }}>
        <strong style={{ color: T.ok }}>All {chars.length} written. </strong>
        You've met every character in this lesson one at a time. The chart below shows them together —
        then Drill and Assemble mix them up, and Listen & Write asks for them from nothing.
        <div style={{ marginTop: 10 }}>
          <button className="btn-ghost" onClick={() => { setI(0); setReps(0); }}>Go through them again</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ margin: "18px 0", padding: 16, background: T.paper, border: `1px solid ${T.hairline}`, borderRadius: 6 }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 12, alignItems: "center", flexWrap: "wrap" }}>
        {chars.map((c, n) => (
          <span key={c} style={{
            width: 26, height: 26, borderRadius: 999, display: "inline-flex", alignItems: "center",
            justifyContent: "center", fontFamily: T.jpFont, fontSize: 14,
            background: n < i ? T.ok : n === i ? T.ink : "none",
            color: n <= i ? T.paper : T.sub,
            border: `1px solid ${n < i ? T.ok : n === i ? T.ink : T.hairline}`,
          }}>{c}</span>
        ))}
        <span style={{ fontSize: 12, color: T.sub, marginLeft: 4 }}>{i + 1} of {chars.length}</span>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
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
            trace it — {reps} of {WALK_REPS} done
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
        <span style={{ fontFamily: T.jpFont, fontSize: 24 }}>{ch}</span>
        <span style={{ fontSize: 15 }}>{soundFor(ch)}</span>
        {canPlayKana(ch) && ALT_SOUND[ch] && (
          <button className="btn-ghost" style={{ padding: "2px 10px", fontSize: 12 }}
            onClick={() => playSoundKana(ALT_SOUND[ch], ch)}>▶ {ALT_SOUND[ch]}</button>
        )}
        {canPlayKana(ch) && (
          <button className="btn-ghost" style={{ padding: "2px 10px", fontSize: 12 }}
            onClick={() => playKana(ch)}>▶ {ALT_SOUND[ch] ? soundFor(ch) : "hear it"}</button>
        )}
        <span style={{ fontSize: 12, color: T.sub }}>
          · {paths.length} stroke{paths.length === 1 ? "" : "s"} · stroke {strokeIdx + 1}
        </span>
      </div>

      {feedback && (
        <div style={{ marginTop: 10, fontSize: 13, color: T.shu, lineHeight: 1.6 }}>{feedback}</div>
      )}

      <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button className="btn-ghost" onClick={() => { setDrawn([]); setStrokeIdx(0); setFeedback(null); }}>
          Clear
        </button>
        <button className="btn-ghost" onClick={() => {
          const prev = progress[modId] || {};
          const set = new Set(prev.walked || []); set.add(ch);
          onProgress({ ...progress, [modId]: { ...prev, walked: [...set] } });
          setI(i + 1);
        }}>Skip this one</button>
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
        {tab === "learn" && <Learn mod={mod} progress={progress} onProgress={onProgress} onPractise={(c) => { setTraceFocus(c); setTab("trace"); }} />}
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
