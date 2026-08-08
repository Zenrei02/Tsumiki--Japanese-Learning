import { useState, useEffect, useRef, useMemo } from "react";

// ————— Design tokens (matched to naoshi-prototype / grammar-module) —————
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
  jpFont: '"Hiragino Mincho ProN","Yu Mincho","Noto Serif JP",serif',
  uiFont: '-apple-system,BlinkMacSystemFont,"Segoe UI","Hiragino Sans","Noto Sans JP",sans-serif',
};

// ————— Kana tables —————
// Column-major 五十音. Empty string = a real gap in the chart, and the gaps
// are information: や行 has no i/e, わ行 ships only わ and を.
const COLS = [
  { key: "a",  name: "Main Vowel Series", kana: ["あ", "い", "う", "え", "お"], sounds: ["a", "i", "u", "e", "o"] },
  { key: "ka", name: "K-Series", kana: ["か", "き", "く", "け", "こ"], sounds: ["ka", "ki", "ku", "ke", "ko"] },
  { key: "sa", name: "S-Series", kana: ["さ", "し", "す", "せ", "そ"], sounds: ["sa", "shi", "su", "se", "so"] },
  { key: "ta", name: "T-Series", kana: ["た", "ち", "つ", "て", "と"], sounds: ["ta", "chi", "tsu", "te", "to"] },
  { key: "na", name: "N-Series", kana: ["な", "に", "ぬ", "ね", "の"], sounds: ["na", "ni", "nu", "ne", "no"] },
  { key: "ha", name: "H-Series", kana: ["は", "ひ", "ふ", "へ", "ほ"], sounds: ["ha", "hi", "fu", "he", "ho"] },
  { key: "ma", name: "M-Series", kana: ["ま", "み", "む", "め", "も"], sounds: ["ma", "mi", "mu", "me", "mo"] },
  { key: "ya", name: "Y-Series", kana: ["や", "",   "ゆ", "",   "よ"], sounds: ["ya", "", "yu", "", "yo"] },
  { key: "ra", name: "R-Series", kana: ["ら", "り", "る", "れ", "ろ"], sounds: ["ra", "ri", "ru", "re", "ro"] },
  { key: "wa", name: "W-Series", kana: ["わ", "",   "",   "",   "を"], sounds: ["wa", "", "", "", "o"] },
];

const DAKUTEN = { か:"が", き:"ぎ", く:"ぐ", け:"げ", こ:"ご", さ:"ざ", し:"じ", す:"ず", せ:"ぜ", そ:"ぞ",
  た:"だ", ち:"ぢ", つ:"づ", て:"で", と:"ど", は:"ば", ひ:"び", ふ:"ぶ", へ:"べ", ほ:"ぼ" };
const HANDAKU = { は:"ぱ", ひ:"ぴ", ふ:"ぷ", へ:"ぺ", ほ:"ぽ" };
const SMALL = { つ:"っ", や:"ゃ", ゆ:"ゅ", よ:"ょ", あ:"ぁ", い:"ぃ", う:"ぅ", え:"ぇ", お:"ぉ" };

// を is typed wo and read o, and both are worth meeting at the character rather
// than only in the lesson notes. This is display-and-playback only: soundFor()
// still returns "o", because that is the answer the Drill wants and how the
// particle is actually pronounced. The contributor recorded the わ-row
// recitation, so both readings have a clip.
const ALT_SOUND = { "を": "wo" };

// Combined sounds. One row per i-row kana that takes a small ゃゅょ, in chart
// order — the same order and the same twelve sets the audio was recorded in.
const YOUON = [
  ["き", ["きゃ", "きゅ", "きょ"], ["kya", "kyu", "kyo"]],
  ["し", ["しゃ", "しゅ", "しょ"], ["sha", "shu", "sho"]],
  ["ち", ["ちゃ", "ちゅ", "ちょ"], ["cha", "chu", "cho"]],
  ["に", ["にゃ", "にゅ", "にょ"], ["nya", "nyu", "nyo"]],
  ["ひ", ["ひゃ", "ひゅ", "ひょ"], ["hya", "hyu", "hyo"]],
  ["み", ["みゃ", "みゅ", "みょ"], ["mya", "myu", "myo"]],
  ["り", ["りゃ", "りゅ", "りょ"], ["rya", "ryu", "ryo"]],
  ["ぎ", ["ぎゃ", "ぎゅ", "ぎょ"], ["gya", "gyu", "gyo"]],
  ["じ", ["じゃ", "じゅ", "じょ"], ["ja", "ju", "jo"]],
  ["ぢ", ["ぢゃ", "ぢゅ", "ぢょ"], ["ja", "ju", "jo"]],
  ["び", ["びゃ", "びゅ", "びょ"], ["bya", "byu", "byo"]],
  ["ぴ", ["ぴゃ", "ぴゅ", "ぴょ"], ["pya", "pyu", "pyo"]],
];

const EXTRA_SOUND = { が:"ga", ぎ:"gi", ぐ:"gu", げ:"ge", ご:"go", ざ:"za", じ:"ji", ず:"zu", ぜ:"ze", ぞ:"zo",
  だ:"da", ぢ:"ji", づ:"zu", で:"de", ど:"do", ば:"ba", び:"bi", ぶ:"bu", べ:"be", ぼ:"bo",
  ぱ:"pa", ぴ:"pi", ぷ:"pu", ぺ:"pe", ぽ:"po", ん:"n",
  っ:"small tsu", ゃ:"small ya", ゅ:"small yu", ょ:"small yo" };

function soundFor(ch) {
  for (const c of COLS) {
    const i = c.kana.indexOf(ch);
    if (i >= 0 && c.kana[i]) return c.sounds[i];
  }
  return EXTRA_SOUND[ch] || "?";
}

// Visually confusable pairs — drives targeted feedback instead of a bare "wrong".
const CONFUSABLE = [
  ["あ", "お"], ["ぬ", "め"], ["れ", "ね"], ["れ", "わ"], ["ね", "わ"],
  ["は", "ほ"], ["さ", "き"], ["き", "ち"], ["さ", "ち"], ["つ", "し"],
  ["し", "そ"], ["つ", "そ"], ["る", "ろ"], ["い", "り"], ["く", "へ"],
  ["う", "つ"], ["す", "む"], ["ま", "も"], ["に", "こ"], ["ら", "う"],
  ["ぬ", "ね"], ["あ", "め"],
];
const isConfusable = (a, b) => CONFUSABLE.some(([x, y]) => (x === a && y === b) || (x === b && y === a));

// ————— Curriculum —————
// One row per lesson. Practice words only use kana taught up to that point,
// which is verified by a cumulative check rather than by hand.
//
// NOTE: all Japanese content is AI-authored and pending native-speaker review.
//
// ROMAJI POLICY: this module is the one place romaji is permitted, and only to
// label a single kana or mora. Word targets render mora-separated (ne · ko),
// never as a whole word in romaji.
const MODULES = [
  { id: "cc-intro", kind: "culture",
    title: "What hiragana is for", sounds: "", en: "read this before anything else",
    exp: "Japanese runs three scripts at once, and hiragana is the one holding the sentence together.\n\nKanji carry meaning — the core of nouns, verbs and adjectives. Katakana marks words that came from outside. Hiragana does everything else, and everything else turns out to be the grammar: the particles that show who did what to whom, the endings that put a verb in the past or make it polite, and any word whose kanji you don't know or that simply isn't usually written in kanji.\n\nTake the hiragana out of a Japanese sentence and you are left with a list of concepts. Put it back and you have a sentence. That is why this script comes first — it is the one that makes a sentence mean something particular rather than something approximate.",
    notes: [
      "Every Japanese word can be written in hiragana. Understanding is another matter, but nothing is unpronounceable once you have these 46.",
      "Furigana — the small characters printed above a kanji to give its reading — are hiragana.",
      "It is the first script Japanese children learn, and the one they read for years before kanji arrives properly.",
      "Katakana comes next and covers exactly the same sounds. Kanji come later and carry meaning rather than sound.",
    ],
    showcase: [
      { kana: "たべます", en: "eat (polite)", note: "The stem carries the meaning; the ending is pure hiragana, and it is the ending that makes this polite rather than casual." },
      { kana: "わたしは", en: "as for me", note: "は here is a particle doing grammatical work. No kanji involved, and the sentence cannot function without it." },
    ] },

  { id: "a", kind: "kana", col: "a",
    title: "Main Vowel Series", sounds: "a i u e o", en: "the five vowels",
    exp: "Five vowels, in this order, always. Every row you learn after this repeats the same five sounds with a consonant in front — so learning the order once here gets you the shape of the whole chart for free.",
    notes: [
      "Each kana is exactly one beat. あい is two beats, not one.",
      "あ and お are the pair to watch here — same three strokes, different curve.",
    ],
    words: [
      { kana: "あい", mora: ["a", "i"], en: "love" },
      { kana: "いえ", mora: ["i", "e"], en: "house" },
      { kana: "あお", mora: ["a", "o"], en: "blue" },
      { kana: "うえ", mora: ["u", "e"], en: "above" },
    ] },
  { id: "ka", kind: "kana", col: "ka",
    title: "K-Series", sounds: "ka ki ku ke ko", en: "the first consonant row",
    exp: "The pattern starts here — k plus each vowel, in the order you already know. No irregulars in this row. It does exactly what it looks like.",
    notes: [],
    words: [
      { kana: "あか", mora: ["a", "ka"], en: "red" },
      { kana: "かお", mora: ["ka", "o"], en: "face" },
      { kana: "いけ", mora: ["i", "ke"], en: "pond" },
      { kana: "きく", mora: ["ki", "ku"], en: "to listen" },
    ] },
  { id: "sa", kind: "kana", col: "sa",
    title: "S-Series", sounds: "sa shi su se so", en: "the first irregular",
    exp: "Four of these behave. The second does not: the pattern would predict si, but the sound is shi. It is the first of only four irregular kana in the whole system, so it is worth marking now.",
    notes: [
      "し is shi, not si.",
      "Japanese primary schools romanise it si; overseas textbooks write shi. Same kana either way — which is why we work from the kana rather than the letters.",
      "さ and き are similar shapes. So are し and つ.",
    ],
    words: [
      { kana: "あさ", mora: ["a", "sa"], en: "morning" },
      { kana: "すし", mora: ["su", "shi"], en: "sushi" },
      { kana: "いす", mora: ["i", "su"], en: "chair" },
      { kana: "さけ", mora: ["sa", "ke"], en: "salmon" },
    ] },
  { id: "ta", kind: "kana", col: "ta",
    title: "T-Series", sounds: "ta chi tsu te to", en: "two more irregulars",
    exp: "The row with the most surprises. The pattern predicts ti and tu; the sounds are chi and tsu. With し and ふ, that is the complete list of irregular readings in hiragana — four, and then no more.",
    notes: [
      "ち is chi, not ti.",
      "つ is tsu, not tu. The t and s are one sound, not two beats.",
      "つ, し and そ are a classic three-way shape mix-up.",
    ],
    words: [
      { kana: "つき", mora: ["tsu", "ki"], en: "moon" },
      { kana: "そと", mora: ["so", "to"], en: "outside" },
      { kana: "した", mora: ["shi", "ta"], en: "below" },
      { kana: "くち", mora: ["ku", "chi"], en: "mouth" },
    ] },
  { id: "sb-sakichi", kind: "skill",
    show: ["さ", "き", "ち"],
    title: "さ・き・ち", sounds: "sa ki chi", en: "the same opening, three ways",
    exp: "Three characters that begin the same way and separate on what happens next. Watching them written apart is quicker than staring at them side by side, because the difference is largely in how many strokes cross the top and which way the tail turns.",
    notes: [
      "さ is three strokes; き is four — the extra one is a second crossbar.",
      "ち is only two, and its tail curls the opposite way from さ.",
      "If you can count the crossbars you have already separated き from the other two.",
    ],
    judge: [
      { prompt: "ki", answer: "き", options: ["き", "さ"], why: "き carries two crossbars; さ has one." },
      { prompt: "sa", answer: "さ", options: ["さ", "き"], why: "One crossbar, then the tail." },
      { prompt: "chi", answer: "ち", options: ["ち", "さ"], why: "The tail turns the other way, and there are only two strokes in all." },
      { prompt: "sa", answer: "さ", options: ["さ", "ち"], why: "Tail to the left. ち turns right." },
    ] },

  { id: "na", kind: "kana", col: "na",
    title: "N-Series", sounds: "na ni nu ne no", en: "regular sounds, tricky shapes",
    exp: "No irregular readings here. The difficulty is entirely visual — ぬ and ね differ only in how the tail loops, and ぬ and め are near-twins.",
    notes: ["ぬ, ね and め are the shapes most often mixed up at this stage."],
    words: [
      { kana: "なつ", mora: ["na", "tsu"], en: "summer" },
      { kana: "にく", mora: ["ni", "ku"], en: "meat" },
      { kana: "ねこ", mora: ["ne", "ko"], en: "cat" },
      { kana: "いぬ", mora: ["i", "nu"], en: "dog" },
    ] },
  { id: "ha", kind: "kana", col: "ha",
    title: "H-Series", sounds: "ha hi fu he ho", en: "the last irregular — and a row to remember",
    exp: "ふ is the fourth and final irregular: fu, not hu, with a sound sitting somewhere between English f and h. This row matters again later, because two of its kana take on second jobs as particles — and both change how they are read.",
    notes: [
      "ふ is fu, not hu.",
      "は and ほ share a frame and differ only on the right.",
      "Remember this series. は, へ and を get a lesson of their own once you finish the chart.",
    ],
    words: [
      { kana: "はな", mora: ["ha", "na"], en: "flower" },
      { kana: "ひと", mora: ["hi", "to"], en: "person" },
      { kana: "ふね", mora: ["fu", "ne"], en: "boat" },
      { kana: "ほし", mora: ["ho", "shi"], en: "star" },
    ] },
  { id: "ma", kind: "kana", col: "ma",
    title: "M-Series", sounds: "ma mi mu me mo", en: "no surprises left",
    exp: "Fully regular. From here to the end of the chart every kana says what it looks like — what remains is recall speed, not exceptions.",
    notes: ["ま and も are easy to swap, as are む and す."],
    words: [
      { kana: "みみ", mora: ["mi", "mi"], en: "ears" },
      { kana: "まち", mora: ["ma", "chi"], en: "town" },
      { kana: "むし", mora: ["mu", "shi"], en: "insect" },
      { kana: "あめ", mora: ["a", "me"], en: "rain" },
    ] },
  { id: "sb-loops", kind: "skill",
    show: ["ぬ", "め", "す", "む"],
    title: "ぬ・め・す・む", sounds: "nu me su mu", en: "does it loop, or not?",
    exp: "Four characters that all finish with a curl, and the question every time is whether that curl closes into a loop or simply trails away.\n\nThis is a family worth meeting together, because in isolation each one looks fine and it is only in comparison that the loop becomes obvious.",
    notes: [
      "ぬ ends in a closed loop. め ends in the same sweep without closing it.",
      "す has a loop; む has a loop and an extra stroke on top.",
      "Same question in each case: did the line come back and cross itself?",
    ],
    judge: [
      { prompt: "nu", answer: "ぬ", options: ["ぬ", "め"], why: "The tail closes into a loop. め leaves it open." },
      { prompt: "me", answer: "め", options: ["め", "ぬ"], why: "No loop — the stroke sweeps out and stops." },
      { prompt: "mu", answer: "む", options: ["む", "す"], why: "む carries a third stroke that す does not." },
      { prompt: "su", answer: "す", options: ["す", "む"], why: "Two strokes, and nothing above the crossbar." },
    ] },

  { id: "ya", kind: "kana", col: "ya",
    title: "Y-Series", sounds: "ya yu yo", en: "the row with gaps",
    exp: "Only three kana. The i and e slots are genuinely empty — not left out here, simply absent from the language. Keep that gap in your mental chart: it is why only ゃ, ゅ and ょ ever appear in small form later.",
    notes: ["Three kana, not five. The gaps are real."],
    words: [
      { kana: "やま", mora: ["ya", "ma"], en: "mountain" },
      { kana: "ゆめ", mora: ["yu", "me"], en: "dream" },
      { kana: "ゆき", mora: ["yu", "ki"], en: "snow" },
      { kana: "やさい", mora: ["ya", "sa", "i"], en: "vegetables" },
    ] },
  { id: "ra", kind: "kana", col: "ra",
    title: "R-Series", sounds: "ra ri ru re ro", en: "not an English r",
    exp: "Regular in writing, unfamiliar in sound. This is not the English r, and it is not an l either — the tongue taps the ridge behind the teeth once, closer to the d in ladder.",
    notes: [
      "One tap. Not a roll, not a glide.",
      "る and ろ differ only by the final loop.",
    ],
    words: [
      { kana: "くるま", mora: ["ku", "ru", "ma"], en: "car" },
      { kana: "もり", mora: ["mo", "ri"], en: "forest" },
      { kana: "しろ", mora: ["shi", "ro"], en: "white" },
      { kana: "とり", mora: ["to", "ri"], en: "bird" },
    ] },
  { id: "wa", kind: "kana", col: "wa",
    title: "W-Series & ん", sounds: "wa o n", en: "the last three",
    exp: "This series ships only two kana in modern Japanese. を appears only as a particle — you will never find it inside a word. ん sits outside the chart altogether, and is the only kana that is not a consonant plus a vowel.",
    notes: [
      "を is typed wo but read o.",
      "ん is a full beat. にほん is ni-ho-n — three beats, not two.",
      "わ, ね and れ are the last big shape trap.",
    ],
    words: [
      { kana: "ほん", mora: ["ho", "n"], en: "book" },
      { kana: "にほん", mora: ["ni", "ho", "n"], en: "Japan" },
      { kana: "わたし", mora: ["wa", "ta", "shi"], en: "I" },
      { kana: "みかん", mora: ["mi", "ka", "n"], en: "mandarin" },
    ] },
  { id: "sb-stems", kind: "skill",
    show: ["ね", "れ", "わ", "る", "ろ"],
    title: "ね・れ・わ・る・ろ", sounds: "ne re wa ru ro", en: "one stem, five endings",
    exp: "The largest trap in hiragana, and the last one you meet. ね, れ and わ share the same left-hand stem and differ entirely in what the right-hand stroke does at the end. る and ろ are the same shape asking the same question.\n\nOnce you see it as a single question — does the stroke loop, flick, or curve away — five characters collapse into one decision made three ways.",
    notes: [
      "ね ends in a loop. れ ends in a flick out to the right. わ ends in a plain curve.",
      "る ends in a loop; ろ is the identical shape without one.",
      "So the whole family is really one question: loop, flick, or neither.",
    ],
    judge: [
      { prompt: "ne", answer: "ね", options: ["ね", "わ"], why: "ね closes into a loop; わ curves away without one." },
      { prompt: "re", answer: "れ", options: ["れ", "ね"], why: "れ flicks outward. ね loops." },
      { prompt: "wa", answer: "わ", options: ["わ", "れ"], why: "A plain curve — no loop, no flick." },
      { prompt: "ru", answer: "る", options: ["る", "ろ"], why: "る loops at the end. ろ stops." },
      { prompt: "ro", answer: "ろ", options: ["ろ", "る"], why: "Same shape, no loop." },
    ] },

  { id: "cp1", kind: "checkpoint", all: true,
    title: "Review", sounds: "all 46", en: "checkpoint — the full chart",
    exp: "Everything so far, mixed and out of order. Speed is what matters here, not accuracy alone — reading needs these to arrive without effort. Anything slow is worth a return trip before moving on.",
    notes: [],
    words: [
      { kana: "さかな", mora: ["sa", "ka", "na"], en: "fish" },
      { kana: "てら", mora: ["te", "ra"], en: "temple" },
      { kana: "みせ", mora: ["mi", "se"], en: "shop" },
      { kana: "ゆき", mora: ["yu", "ki"], en: "snow" },
    ] },
  { id: "dakuten", kind: "kana", all: true, dakuten: true,
    title: "Voiced sounds", sounds: "ga za da ba pa", en: "two marks, twenty-five sounds",
    exp: "No new shapes at all. A pair of strokes voices a kana — か becomes が. A small circle turns the H series into p sounds — は becomes ぱ. That is the entire system: two marks, twenty-five new sounds, nothing new to memorise.",
    notes: [
      "゛ works on the K, S, T and H series only.",
      "゜ works on the H series only.",
      "じ and ぢ are both ji; ず and づ are both zu. Which one to use gets its own lesson.",
    ],
    words: [
      { kana: "かばん", mora: ["ka", "ba", "n"], en: "bag" },
      { kana: "でんわ", mora: ["de", "n", "wa"], en: "telephone" },
      { kana: "たまご", mora: ["ta", "ma", "go"], en: "egg" },
      { kana: "えんぴつ", mora: ["e", "n", "pi", "tsu"], en: "pencil" },
    ] },
  { id: "youon", kind: "kana", youon: true,
    walk: ["ゃ", "ゅ", "ょ"], all: true, dakuten: true, small: true,
    title: "Combined sounds", sounds: "kya sha cho", en: "two kana, one beat",
    exp: "A full-size や after き gives two beats: ki-ya. A small ゃ fuses them into one: kya. The size of the character is the entire difference, and it changes the rhythm of the word.",
    notes: [
      "Only the i-row takes small ゃゅょ: き し ち に ひ み り and their voiced forms.",
      "きゃ is one beat. きや is two.",
      "しゃ is sha, ちゃ is cha, じゃ is ja.",
    ],
    words: [
      { kana: "おちゃ", mora: ["o", "cha"], en: "tea" },
      { kana: "しゃしん", mora: ["sha", "shi", "n"], en: "photo" },
      { kana: "きゃく", mora: ["kya", "ku"], en: "guest" },
      { kana: "じてんしゃ", mora: ["ji", "te", "n", "sha"], en: "bicycle" },
    ] },
  { id: "sokuon", kind: "kana",
    walk: ["っ"], all: true, dakuten: true, small: true,
    title: "Double consonants", sounds: "small tsu", en: "the beat with no sound",
    exp: "A small っ is a full beat of silence. The mouth sets up the next consonant and holds it before releasing. It is never pronounced on its own, and dropping it changes the word.",
    notes: [
      "きて (come) and きって (stamp) are different words.",
      "On a keyboard a doubled consonant produces it — kitte gives きって.",
      "It counts as a beat: きって is three.",
    ],
    words: [
      { kana: "きって", mora: ["ki", "t", "te"], en: "stamp" },
      { kana: "ざっし", mora: ["za", "s", "shi"], en: "magazine" },
      { kana: "きっぷ", mora: ["ki", "p", "pu"], en: "ticket" },
      { kana: "まって", mora: ["ma", "t", "te"], en: "wait" },
    ] },
  { id: "chouon", kind: "kana", all: true, dakuten: true, small: true,
    title: "Long vowels", sounds: "oo · ou · ei", en: "the trap romaji hides",
    exp: "A long vowel is two beats of the same sound, and Japanese writes it by adding a vowel kana — there is no lengthening mark in hiragana. This is the hardest habit to recover if you learned through romaji, because romaji spells おう, おお and お more or less alike.",
    notes: [
      "お is usually lengthened with う: とうきょう, not とおきょお.",
      "But some words genuinely take おお: おおきい, とおい, おおい.",
      "え is usually lengthened with い: せんせい, えいが.",
      "There is no reliable rule — these are learned word by word, which is exactly why kana comes before vocabulary.",
    ],
    words: [
      { kana: "おおきい", mora: ["o", "o", "ki", "i"], en: "big" },
      { kana: "せんせい", mora: ["se", "n", "se", "i"], en: "teacher" },
      { kana: "とうきょう", mora: ["to", "u", "kyo", "u"], en: "Tokyo" },
      { kana: "おかあさん", mora: ["o", "ka", "a", "sa", "n"], en: "mother" },
    ] },
  { id: "particles", kind: "skill",
    show: ["は", "へ", "を"],
    title: "は・へ・を", sounds: "wa e o", en: "when a kana stops sounding like itself",
    exp: "Three kana are read differently when they do a grammatical job. は is read wa, へ is read e, を is read o. This is not a footnote you can skip — these three appear in nearly every Japanese sentence, and reading them wrong is the clearest marker of a beginner.",
    notes: [
      "は is read wa ONLY as the topic particle. Inside a word — はな, はし — it stays ha.",
      "へ is read e ONLY as the direction particle.",
      "を is always o, and is always a particle.",
    ],
    judge: [
      { before: "わたし", answer: "は", after: "がくせいです", en: "I am a student.", options: ["は", "わ"], why: "Topic particle — written は, read wa. わ is never used for this job." },
      { before: "がっこう", answer: "へ", after: "いきます", en: "I go to school.", options: ["へ", "え"], why: "Direction particle — written へ, read e." },
      { before: "ほん", answer: "を", after: "よみます", en: "I read a book.", options: ["を", "お"], why: "Object particle — always を, never お." },
      { before: "はな", answer: "は", after: "きれいです", en: "The flower is pretty.", options: ["は", "わ"], why: "Topic particle again — and note that はな itself opens with は read ha. Same kana, two jobs, one sentence." },
    ] },
  { id: "jizu", kind: "skill",
    show: ["じ", "ぢ", "ず", "づ"],
    title: "じ・ぢ / ず・づ", sounds: "ji zu", en: "same sound, different kana",
    exp: "じ and ぢ are both ji. ず and づ are both zu. In modern Japanese the default is always じ and ず — ぢ and づ survive in only two situations, and knowing them is mostly about not being caught out.",
    notes: [
      "Default to じ and ず. You will be right almost every time.",
      "ぢ and づ appear when a word's own ち or つ becomes voiced inside a compound: はな + ち gives はなぢ.",
      "They also appear when the sound repeats: つづく, ちぢむ.",
    ],
    judge: [
      { before: "", answer: "じ", after: "かん", en: "time", options: ["じ", "ぢ"], why: "Default じ — no compound, no repeat." },
      { before: "はな", answer: "ぢ", after: "", en: "nosebleed", options: ["ぢ", "じ"], why: "はな + ち. The ち voices to ぢ and keeps its original kana." },
      { before: "つ", answer: "づ", after: "く", en: "to continue", options: ["づ", "ず"], why: "The つ repeats and voices — つづく." },
      { before: "み", answer: "ず", after: "", en: "water", options: ["ず", "づ"], why: "Default ず. Not a compound, not a repeat." },
    ] },
  { id: "cp2", kind: "checkpoint", all: true, dakuten: true, small: true,
    title: "Review", sounds: "everything", en: "checkpoint — the whole system",
    exp: "The full kana system: voiced marks, small kana, long vowels and all. Clear this and you can read anything written in hiragana — which is the door into every lesson that follows.",
    notes: [],
    words: [
      { kana: "がっこう", mora: ["ga", "k", "ko", "u"], en: "school" },
      { kana: "しゅくだい", mora: ["shu", "ku", "da", "i"], en: "homework" },
      { kana: "おおきい", mora: ["o", "o", "ki", "i"], en: "big" },
      { kana: "でんしゃ", mora: ["de", "n", "sha"], en: "train" },
    ] },
];

// Kana available to the learner by the time they reach module index n.
// ————— Groups —————
// Each block runs learn → consolidate: a run of kana rows closed by the skill
// builder that untangles the shapes they just met, and a checkpoint where a
// larger arc finishes.
const GROUPS = [
  { title: "Getting started", ids: ["a", "ka", "sa", "ta", "sb-sakichi"] },
  { title: "The middle rows", ids: ["na", "ha", "ma", "sb-loops"] },
  { title: "Finishing the chart", ids: ["ya", "ra", "wa", "sb-stems", "cp1"] },
  { title: "Marks, doubles and traps", ids: ["dakuten", "youon", "sokuon", "chouon", "particles", "jizu", "cp2"] },
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
    if (m.id === "wa" || m.all) set.add("ん");
    if (m.dakuten) {
      Object.values(DAKUTEN).forEach((k) => set.add(k));
      Object.values(HANDAKU).forEach((k) => set.add(k));
    }
    if (m.small) Object.values(SMALL).forEach((k) => set.add(k));
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
const KEY = "hiragana-progress-v2";
async function loadProgress() {
  try { const r = await window.storage.get(KEY); return r ? JSON.parse(r.value) : {}; }
  catch { return {}; }
}
async function saveProgress(p) {
  try { await window.storage.set(KEY, JSON.stringify(p)); }
  catch (e) { console.error("progress save failed", e); }
}

// ————— 五十音 pad —————
// Left to right, あ first. Traditional charts run right to left; that
// orientation is noted in the Learn tab. Deliberate inconsistency.
function KanaPad({ onInsert, onModify, onBack, onClear, enabled }) {
  const live = (ch) => !!ch && (!enabled || enabled.has(ch));
  const cell = (ch, key) => (
    <button
      key={key}
      onClick={() => live(ch) && onInsert(ch)}
      disabled={!live(ch)}
      className={ch ? (live(ch) ? "pad-key" : "pad-dim") : "pad-gap"}
      aria-label={ch ? `${ch}, ${soundFor(ch)}` : undefined}
    >
      {ch}
    </button>
  );
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 3 }}>
        {[0, 1, 2, 3, 4].map((row) => COLS.map((c, ci) => cell(c.kana[row], `${ci}-${row}`)))}
      </div>
      <div style={{ display: "flex", gap: 3, marginTop: 3, flexWrap: "wrap" }}>
        <button className={live("ん") ? "pad-key" : "pad-dim"} disabled={!live("ん")}
          onClick={() => live("ん") && onInsert("ん")} aria-label="n, n">ん</button>
        <button className="pad-key" onClick={() => onModify("dakuten")} aria-label="add dakuten">゛</button>
        <button className="pad-key" onClick={() => onModify("handaku")} aria-label="add handakuten">゜</button>
        <button className="pad-key" onClick={() => onModify("small")} aria-label="make the last kana small">small</button>
        <button className="pad-key" onClick={() => onInsert("、")}>、</button>
        <button className="pad-key" onClick={() => onInsert("。")}>。</button>
        <button className="pad-key" onClick={onBack} aria-label="backspace">⌫</button>
        <button className="pad-ghost" onClick={onClear}>Clear</button>
      </div>
      <p style={{ fontSize: 11, color: T.sub, marginTop: 8, marginBottom: 0 }}>
        Greyed keys are kana you haven't met yet. No space key — Japanese doesn't put spaces between words.
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
        }}>
          {chars[i] || ""}
        </div>
      ))}
    </div>
  );
}

// ————— Stroke data (KanjiVG) —————
// Source: KanjiVG, https://github.com/KanjiVG/kanjivg — Creative Commons
// Attribution-Share Alike 3.0. Paths are ordered by writing order inside a
// 109x109 box. Share-alike obligations apply; see the dictionary licence row.
const STROKE_BOX = 109;
const STROKES = {"ぁ":["M35.72,46.75c0.7,0.7,2.21,1.47,4.22,1.4c8.56-0.28,16.06-1.7,23.69-3.41c1.21-0.27,3.72-0.7,5.32-0.4","M51.03,34.43c0.7,0.8,1.21,2.87,0.85,4.46c-3.01,13.43-5.02,30.31-4.12,42.73c0.33,4.57,1.51,8.72,2.71,10.92","M63.53,55.67c0.6,0.9,0.93,3.52,0.4,4.91c-3.71,9.82-9.04,19.04-20.38,28.66c-5.51,4.67-12.75,3-13.05-6.71c-0.27-8.72,10.74-18.54,26-21.44c9.97-1.9,21.75,1.67,24.5,10.22c3.39,10.53-3.01,21.14-16.77,24.45"],"あ":["M31.01,33c0.88,0.88,2.75,1.82,5.25,1.75c8.62-0.25,20-2.12,29.5-4.25c1.51-0.34,4.62-0.88,6.62-0.5","M49.76,17.62c0.88,1,1.82,3.26,1.38,5.25c-3.75,16.75-6.25,38.13-5.13,53.63c0.41,5.7,1.88,10.88,3.38,13.62","M65.63,44.12c0.75,1.12,1.16,4.39,0.5,6.12c-4.62,12.26-11.24,23.76-25.37,35.76c-6.86,5.83-15.88,3.75-16.25-8.38c-0.34-10.87,13.38-23.12,32.38-26.74c12.42-2.37,27,1.38,30.5,12.75c4.05,13.18-3.76,26.37-20.88,30.49"],"ぃ":["M29,48.88c1.66,1.8,2.27,3.91,1.79,6.16c-3.41,15.71-0.09,26.55,7.29,34.39c5.04,5.35,3.91,2.61,4.55-4.32","M69.38,53.62c7.95,6.66,14.98,15.57,15.5,28"],"い":["M21.5,29.66c2.01,2.17,2.61,4.68,2.17,7.43c-3.09,19.16-1.03,32.01,7.93,41.45c6.12,6.45,6.26,3.14,7.04-5.21","M72.96,36.51c9.44,8.05,17.79,18.82,18.41,33.83"],"ぅ":["M43.83,30.97c4.74,1.79,8.1,2.53,10.84,2.53c6.97,0,6.74,0.95-0.32,4.63","M37.5,52.85c1.67,0.95,3.3,2.57,6.67,1.16c4.2-1.75,10.01-5.75,14.52-5.64c4.51,0.1,8.3,3.96,8.3,14.91c0,13.05-7.98,24.22-20.63,33.48"],"う":["M42,15.5c5.62,2.12,9.62,3,12.88,3c8.27,0,8,1.12-0.38,5.5","M33,42.38c2.12,1.12,4.12,2.88,8.5,1.38c4.38-1.5,12.75-7.12,18.5-7c5.75,0.12,10.25,5,10.25,18c0,15.49-8.25,30.24-24.37,41.24"],"ぇ":["M44.63,30.47c4.74,1.79,6.92,2.41,10.84,2.53c11.71,0.35,3.21,1.51-0.32,4.13","M37.78,56.18c1.47,0.98,3.52,1.37,5.77,0.49c2.57-1.01,13.29-6.16,16.61-7.72c3.32-1.56,6.5,0.03,3.42,3.62c-9.58,11.13-21.31,24.62-30.89,34.68c-2.55,2.68-0.45,2.77,1.17,1.08c10.55-11.04,14.17-15.73,18.47-15.73c5.57,0,2.74,13.09,5.28,17.49c2.54,4.4,14.95,2.93,20.42,1.66"],"え":["M40.52,13.25c5.62,2.12,10,3,14.12,3c8.27,0,8,1.12-0.38,5.5","M32.52,45.12c1.88,1.25,4.5,1.75,7.38,0.62c3.29-1.29,17-7.88,21.25-9.88c4.25-2,8.32,0.04,4.38,4.62c-12.26,14.27-27.26,31.52-39.51,44.4c-3.26,3.42-0.58,3.54,1.5,1.37c13.5-14.12,18.12-20.12,23.62-20.12c7.13,0,3.5,16.75,6.75,22.38c3.25,5.63,19.12,3.75,26.12,2.12"],"ぉ":["M31.09,49.46c1.09,0.81,2.88,1.92,4.77,1.71c1.89-0.2,15.59-4.14,16.78-4.64c1.19-0.5,3.18-1.01,4.67-1.61","M46.14,34.12c1.42,1.38,2.35,3.54,1.98,5.95c-1.99,13.01-2.43,36.74-1.54,47.11c0.6,6.96-0.51,8.43-5.66,5.75c-4.07-2.12-10.92-6.46-10.92-9.99c0-6.05,19.36-19.07,35.55-19.07c13.7,0,19.86,6.66,19.86,13.92c0,6.66-7.45,15.23-21.25,16.95","M70.92,38.97c4.27,2.12,6.97,4.8,8.44,6.66c3.57,4.5,0.3,3.63-0.89,4.04"],"お":["M22.88,35.12c1.38,1,3.62,2.38,6,2.12c2.38-0.26,19.62-5.12,21.12-5.74c1.5-0.62,4-1.25,5.88-2","M41.5,16.12c2.25,1,3.59,4.39,3.12,7.38c-2.5,16.12-3.37,45.53-2.25,58.38c0.75,8.62-0.64,10.45-7.12,7.12c-5.13-2.62-13.75-8-13.75-12.38c0-7.5,24.38-23.62,44.75-23.62c17.25,0,25,8.25,25,17.25c0,8.25-9.38,18.88-26.75,21","M73,22.12c5.38,2.62,8.88,5.88,10.62,8.25c2.27,3.08,0.38,4.5-1.12,5"],"か":["M24.62,38.62c1.88,1.62,4.65,2.33,8.62,1c25.5-8.5,29.5-4.13,29.5,7.62c0,9.38-1.24,17.46-4.25,25.25c-7.62,19.76-10.87,17.39-16.12,10.89","M48.5,17.5c1,1.38,1.29,4.7,0.5,7.12c-5,15.25-18.02,40.93-19.62,43.88c-3.12,5.75-6.38,11.88-9.38,16.25","M77.37,31.62c7.5,6.88,13.25,15.75,15,24.88"],"が":["M24.62,38.62c1.88,1.62,4.65,2.33,8.62,1c25.5-8.5,29.5-4.13,29.5,7.62c0,9.38-1.24,17.46-4.25,25.25c-7.62,19.76-10.87,17.39-16.12,10.89","M48.5,17.5c1,1.38,1.29,4.7,0.5,7.12c-5,15.25-18.02,40.93-19.62,43.88c-3.12,5.75-6.38,11.88-9.38,16.25","M77.37,31.62c7.5,6.88,13.25,15.75,15,24.88","M80.5,18.25c2.75,1.75,6,5.38,7.75,8.5","M86.87,13.38c3.06,1.57,6.68,4.82,8.62,7.62"],"き":["M30.5,30.25c1.88,0.75,4.64,1.06,5.88,0.88c6.75-1,22.25-4.5,26.5-6c2.17-0.76,3.5-1.25,4.88-2.12","M36.25,48.7c2.01,0.85,4.97,1.2,6.29,0.99c7.23-1.13,23.82-5.09,28.37-6.79c2.32-0.86,3.75-1.41,5.22-2.4","M42,14.12c1.5,0.88,3.13,2.94,4,5.12c5.5,13.76,16,29.26,26.37,40.76c7.64,8.47,9.12,9.38-6,3.88","M33.75,83.25c10.62,9.75,27.25,8.62,38.12,5"],"ぎ":["M30.5,30.5c1.88,0.75,4.64,1.06,5.88,0.88c6.75-1,22.25-4.5,26.5-6c2.17-0.76,3.5-1.25,4.88-2.12","M36.25,48.95c2.01,0.85,4.97,1.2,6.29,0.99c7.23-1.13,23.82-5.09,28.37-6.79c2.32-0.86,3.75-1.41,5.22-2.4","M42,14.38c1.5,0.88,3.13,2.94,4,5.12c5.5,13.75,16,29.25,26.38,40.75c7.64,8.47,9.12,9.38-6,3.88","M33.75,83.5c10.62,9.75,27.25,8.62,38.12,5","M77.37,19c2.75,1.75,6,5.38,7.75,8.5","M83.75,14.12c3.06,1.57,6.68,4.82,8.62,7.62"],"く":["M60.66,15c0.5,1.62,0.35,5.44-1,7.38c-6.75,9.62-14.3,19.08-18.62,24.5c-4,5-3.79,7.03-0.88,11c5.5,7.5,12.75,18.75,17.62,27.25c1.48,2.59,2.75,4.75,4.5,8.62"],"ぐ":["M60.66,15c0.5,2.12,0.75,5-1,7.38c-6.97,9.46-14.29,19.09-18.62,24.5c-4,5-3.79,7.03-0.88,11c5.5,7.5,12.75,18.75,17.62,27.25c1.48,2.59,2.75,4.75,4.5,8.62","M73.54,30c2.75,1.75,6,5.38,7.75,8.5","M79.91,25.12c3.06,1.57,6.68,4.82,8.62,7.62"],"け":["M24.67,19.75c1.25,1.5,2.62,3.75,2.12,6.38c-3,15.88-6.5,29.5-4.88,44.62c2.02,18.84,2.25,4.75,6.75-3.5","M53.67,38.62c2.12,1.38,4.28,1.89,6.88,1.5c8.25-1.25,15.39-2.57,20.62-4c2.76-0.74,5.26-1.12,6.88-1.12","M71.67,14.38c2.13,1.37,2.88,3.35,2.88,5.12c0,11.62,0.12,20.38,0.12,30.12c0,20.75-0.62,30.88-12.5,42.25"],"げ":["M24.91,20.25c1.25,1.5,2.37,3.75,1.88,6.38c-3,15.88-6.5,29.5-4.88,44.62c2.02,18.84,2.25,4.75,6.75-3.5","M53.67,39.12c2.12,1.38,4.28,1.89,6.88,1.5c8.25-1.25,15.39-2.57,20.62-4c2.75-0.75,5.25-1.12,6.88-1.12","M71.67,14.62c2.12,1.38,2.87,3.61,2.87,5.38c0,11.62,0.12,20.38,0.12,30.12c0,20.75-0.62,30.88-12.5,42.25","M86.17,13c2.75,1.75,6,5.38,7.75,8.5","M92.54,8.12c3.06,1.57,6.68,4.82,8.62,7.62"],"こ":["M34.75,26.75c1.12,0.88,2.91,2.01,6,1.5c7.62-1.25,14.11-2.56,22.38-2.62c15.5-0.12,5.88,5-5.75,9","M30,68.12c2.25,14.5,15.26,17.96,31,16.75c6.5-0.5,11.88-1.25,17.62-2.88"],"ご":["M34.75,27c1.12,0.88,2.91,2.01,6,1.5c7.62-1.25,14.11-2.56,22.38-2.62c15.5-0.12,5.88,5-5.75,9","M30,68.38c2.25,14.5,15.26,17.96,31,16.75c6.5-0.5,11.88-1.25,17.62-2.88","M80.37,16.25c2.75,1.75,6,5.38,7.75,8.5","M86.75,11.38c3.06,1.57,6.68,4.82,8.62,7.62"],"さ":["M27,38.9c2.42,1.33,5.38,1.47,8.32,1.06c8.79-1.24,28.67-7.76,34.15-10.43c2.79-1.36,3.78-1.91,6.28-3.53","M41.5,13.88c1.5,0.88,3.63,2.94,4.5,5.12c5.5,13.75,15.25,27.62,26.87,39.5c7.98,8.15,6.38,10-6,3.12","M35.25,80.5c4.5,11.75,20.88,12.5,38.38,7.5"],"ざ":["M27,39.15c2.42,1.33,5.38,1.47,8.32,1.06c8.79-1.24,28.67-8.01,34.15-10.68c2.79-1.36,3.78-1.91,6.28-3.53","M41.5,14.12c1.5,0.88,3.63,2.95,4.5,5.13c5.5,13.75,15.25,27.63,26.88,39.5c7.98,8.15,6.38,10-6,3.12","M35.25,80.75c4.5,11.75,20.88,12.5,38.38,7.5","M79.88,14.25c2.75,1.75,6,5.38,7.75,8.5","M86.25,9.38c3.06,1.57,6.68,4.82,8.62,7.62"],"し":["M39.12,17.5c1.25,3.12,0.93,6.74,0.38,10.25c-2.12,13.5-3,26.5-3,39.12c0,27.38,19.88,30.12,45.5,17.25"],"じ":["M39.12,17.25c1.25,3.12,0.93,6.74,0.38,10.25c-2.12,13.5-3,26.5-3,39.12c0,27.38,19.88,30.12,45.5,17.25","M64.24,27c2.75,1.75,6,5.38,7.75,8.5","M70.62,22.12c3.06,1.57,6.68,4.82,8.62,7.62"],"す":["M15.5,37.12c2.88,2.12,6.94,1.51,12.75,0.25c16.12-3.5,36.14-5.38,46.62-6.5c7-0.75,11.88-0.62,17.75,0.12","M57.62,13.38c2,1.5,2.75,3.25,2.75,5.88c0,10.38,0,35.12,0,40.75c0,14.62-15.62,16.38-15.62,1.75c0-14.25,18-14.12,18,6.38c0,13.25-7.75,21.5-16,28.38"],"ず":["M15.5,37.12c2.88,2.12,6.94,1.51,12.75,0.25c16.12-3.5,36.14-5.38,46.62-6.5c7-0.75,11.88-0.62,17.75,0.12","M57.62,13.38c2,1.5,2.75,3.25,2.75,5.88c0,10.38,0,35.12,0,40.75c0,14.62-15.62,16.38-15.62,1.75c0-14.25,18-14.12,18,6.38c0,13.25-7.75,21.5-16,28.38","M77,13c2.75,1.75,6,5.38,7.75,8.5","M83.37,8.12c3.06,1.57,6.68,4.82,8.62,7.62"],"せ":["M16.5,49.93c2.88,2.42,6.86,1.57,12.75,0.53c19-3.34,33-5.72,47.12-7.64c6.99-0.95,11.88-1.21,17.75-0.36","M69.74,17.75c2,1.5,2.75,3.25,2.75,5.88c0,10.38,0,17.88,0,23.5c0,25.62-5.75,23.25-11.88,19","M35.62,26.25c2,1.5,2.75,3.25,2.75,5.88c0,10.38,0,28.38,0,34c0,14.5,6.38,19.55,20.14,19.55c10.24,0,13.74,0.07,22.61-1.68"],"ぜ":["M16.5,49.93c2.88,2.42,6.86,1.57,12.75,0.53c19-3.34,32.5-5.34,47.12-7.64c6.97-1.1,11.88-1.21,17.75-0.36","M69.74,17.75c2,1.5,2.75,3.25,2.75,5.88c0,10.38,0,17.88,0,23.5c0,25.62-5.75,23.25-11.88,19","M35.62,26.25c2,1.5,2.75,3.25,2.75,5.88c0,10.38,0,28.38,0,34c0,14.5,6.38,19.55,20.14,19.55c10.24,0,13.74,0.07,22.61-1.68","M84.5,17.25c2.75,1.75,6,5.38,7.75,8.5","M90.87,12.38c3.06,1.57,6.68,4.82,8.62,7.62"],"そ":["M38.4,22c1.88,1.25,4.98,1.05,7.5,0.38c6.5-1.75,13.25-3.75,19.38-5.38c4.63-1.23,7.18,2.06,3.62,5.25c-12.12,10.87-31.14,24.4-40,30.25c-6.25,4.12-5.88,5.75,1.38,3.88c17.08-4.42,35.96-8.68,50.12-10.38c9.38-1.12,9.62,0.12,0.5,1.38c-15.82,2.17-34.38,14.25-34.38,26.5c0,12.88,11.62,20.38,31.5,16.62"],"ぞ":["M38.4,22c1.88,1.25,4.98,1.05,7.5,0.38c6.5-1.75,13.25-3.75,19.38-5.38c4.63-1.23,7.18,2.06,3.62,5.25c-12.12,10.87-31.14,24.4-40,30.25c-6.25,4.12-5.88,5.75,1.38,3.88c17.08-4.42,35.96-8.68,50.12-10.38c9.38-1.12,9.62,0.12,0.5,1.38c-15.82,2.17-34.38,14.25-34.38,26.5c0,12.88,11.62,20.38,31.5,16.62","M81.78,26.75c2.75,1.75,6,5.38,7.75,8.5","M88.15,21.88c3.06,1.57,6.68,4.82,8.62,7.62"],"た":["M24.38,35.38c1.38,0.62,3.88,1.51,6.38,1.12c6.5-1,16.25-2.88,24.88-4.75c2.64-0.57,5.38-1.5,7.62-2.38","M45,16.88c0.75,1.25,0.87,3.62,0.38,5.25c-6.35,20.94-12.75,36.37-18.88,52.37c-1.36,3.56-4.75,11.75-6,14.62","M56.38,53.25c12.38-2.75,18.25-3.7,23.62-3.12c15.12,1.62-1.12,2.25-4.25,4.88","M54.13,82.25c4.38,7,14.25,8.12,34.5,5.62"],"だ":["M24.38,35.38c1.38,0.62,3.88,1.51,6.38,1.12c6.5-1,16.25-2.88,24.88-4.75c2.64-0.57,5.38-1.5,7.62-2.38","M45,16.88c0.75,1.25,0.87,3.62,0.38,5.25c-6.35,20.94-12.75,36.37-18.88,52.37c-1.36,3.56-4.75,11.75-6,14.62","M56.38,53.25c12.38-2.75,18.25-3.7,23.62-3.12c15.12,1.62-1.12,2.25-4.25,4.88","M54.13,82.25c4.38,7,14.25,8.12,34.5,5.62","M76,22.5c2.75,1.75,6,5.38,7.75,8.5","M82.38,17.62c3.06,1.57,6.68,4.82,8.62,7.62"],"ち":["M24.5,32.62c1.38,0.62,3.88,1.51,6.38,1.12c6.5-1,18.25-4.12,26.88-6c2.64-0.57,5.38-1.5,7.62-2.38","M45.62,15.62c0.75,1.25,0.71,3.58,0.38,5.25c-3,15-4.25,22.59-8.38,38.62c-3.25,12.62-5.38,11.12,3.62,4.38c8.29-6.21,19.75-9.5,28.5-9.5c8.62,0,14.58,5.88,14.5,14.5c-0.12,13.5-16.5,20.62-29.88,23.25"],"ぢ":["M24.5,32.88c1.38,0.62,3.88,1.51,6.38,1.12c6.5-1,18.25-4.12,26.88-6c2.64-0.57,5.38-1.5,7.62-2.38","M45.63,15.88c0.75,1.25,0.71,3.58,0.38,5.25c-3,15-4.25,22.59-8.38,38.62c-3.26,12.63-5.38,11.13,3.62,4.37c8.29-6.21,19.75-9.5,28.5-9.5c8.62,0,14.58,5.88,14.5,14.5c-0.12,13.5-16.5,20.62-29.88,23.25","M74.63,21.75c2.75,1.75,6,5.38,7.75,8.5","M81,16.88c3.06,1.57,6.68,4.82,8.62,7.62"],"っ":["M23,61.15c1.49,1.29,3.72,1.67,6.46,0.5c14.21-6.07,23.85-8.85,35.68-8.65c9.99,0.17,18.28,5.7,18.18,15.24c-0.15,14.93-18.46,23.39-35.79,25.51"],"つ":["M14,44.75c1.88,1.62,4.68,2.09,8.12,0.62c17.88-7.62,30-11.12,44.88-10.88c12.56,0.21,22.98,7.17,22.87,19.17c-0.18,18.77-24.75,28.71-45.01,32.08"],"づ":["M14,44.75c1.88,1.62,4.68,2.09,8.12,0.62c17.88-7.62,30-11.12,44.88-10.88c12.56,0.21,22.98,7.17,22.87,19.17c-0.18,18.77-24.75,28.71-45.01,32.08","M81,18c2.75,1.75,6,5.38,7.75,8.5","M87.38,13.12c3.06,1.57,6.68,4.82,8.62,7.62"],"て":["M20.5,26.38c1.87,1.62,4.42,1.97,8.12,1.37c21.75-3.5,33-5.12,50.12-8.38c12.34-2.34,13-0.88,0.38,1.38c-17.89,3.19-33.78,19.12-33.78,37.62c0,20.5,17.91,30.25,35.16,30.25"],"で":["M20.5,26.38c1.87,1.62,4.42,1.97,8.12,1.37c21.75-3.5,33-5.12,50.12-8.38c12.34-2.34,13-0.88,0.38,1.38c-17.89,3.19-33.78,19.12-33.78,37.62c0,20.5,17.91,30.25,35.16,30.25","M75,41.75c2.75,1.75,6,5.38,7.75,8.5","M81.37,36.88c3.06,1.57,6.68,4.82,8.62,7.62"],"と":["M35.5,18.38c1.74,0.74,3.62,2.62,4.12,5.37c0.5,2.75,4.75,25,5.38,28.12","M78.12,25.5c0.25,1.88,0.04,4.09-2.25,5.75c-6.37,4.63-13.22,8.49-22.75,15.25c-12.88,9.12-21.62,18.38-21.62,27.5c0,10.12,8.5,13.88,26.88,13.88c6.25,0,14.75-0.12,21.62-1.25"],"ど":["M35.5,18.38c1.74,0.74,3.62,2.62,4.12,5.37c0.5,2.75,4.75,25,5.38,28.12","M78.12,25.5c0.25,1.88,0.04,4.09-2.25,5.75c-6.37,4.63-13.21,8.49-22.75,15.25c-12.88,9.12-21.62,18.38-21.62,27.5c0,10.12,8.5,13.88,26.88,13.88c6.25,0,14.75-0.12,21.62-1.25","M84.24,14.5c2.75,1.75,6,5.38,7.75,8.5","M90.62,9.62c3.06,1.57,6.68,4.82,8.62,7.62"],"な":["M22.88,28.96c1.18,0.58,3.3,1.1,5.47,1.05c5.53-0.13,10.9-0.98,16.52-2.42c4.82-1.23,9.13-3.12,11.38-4.22","M42.99,14c0.63,0.89,0.56,2.52,0.31,3.72c-2.96,14.16-7.95,26.56-14.25,37.87c-2.05,3.69-4.25,7.24-6.55,10.65","M72.26,23.25c6.88,2.5,12.62,5.62,14.75,9.5c4.06,7.41-0.25,3.38-3.5,3.88","M68.88,44.62c-1,1.88-2.14,5.24-1.88,8.25c0.62,7,1.5,13.12,1.5,20.62c0,20-27.88,19.75-27.88,9.38c0-5.62,8.25-8.25,13.88-8.25c8.75,0,21.5,3.25,29.75,11.5"],"に":["M24.53,22.75c1.25,1.5,1.62,3.75,1.12,6.38c-3,15.88-9,32.5-7.38,47.62c2.02,18.84,4.5,5.75,8.5-3.5","M53.2,30.64c0.96,0.79,2.44,1.58,5.1,1.35c6.98-0.61,15.01-3.3,22.04-3.36c13.19-0.11,1.5,3.75-8.39,7.35","M52.53,68c1.76,12.92,11.92,16.01,24.23,14.93c5.08-0.45,8.9-0.8,14.27-2.06"],"ぬ":["M25.38,28.5c2,1.38,2.97,3.23,3.38,5.88c1.87,12.18,4.12,23.92,8.54,34.67c1.79,4.36,3.96,8.33,6.84,12.46","M57.12,19.25c0.88,2.12,1.06,3.79,0.62,5.88c-3.12,15-13.14,39.81-18.12,48.62c-11.87,21-20.62,1.25-20.62-4.5c0-22.63,43.75-44.25,62.36-29.59c7.66,6.03,9.8,14.58,9.14,23.34c-2,26.75-32.88,28.38-32.88,16.88c0-9.38,17.38-7.12,27.12-1.12c3.1,1.91,7.25,5.25,9.5,7.5"],"ね":["M33.29,14.5c1.62,1.62,2.1,3.21,1.88,5.88c-1.03,11.93-2.06,31.66-2.53,53.12c-0.1,4.62-0.18,9.31-0.22,14","M17.16,37.88c1.62,0.88,3.25,1.38,5.62,0.75c2.14-0.56,7.8-2.31,12.37-4.03c6.26-2.35,6.88-1.47,3.12,3.63c-5.56,7.53-13.02,17.38-18.48,26.77c-5.6,9.62-3.45,8.3,2,3c19.12-18.62,38.5-39.12,54.12-39.12c11.38,0,12.88,11.25,12.88,32.5c0,28.62-30.18,24.88-30.18,16.26c0-9.63,18.73-7.82,28.06-1.88c2.75,1.75,5.88,4.88,7.5,6.75"],"の":["M53.82,28.62c1,1.5,1.34,4.12,0.88,6.62c-1.75,9.5-6.89,25-10.75,33.12c-9.63,20.26-16.55,14.74-24.38-1.98c-9.13-19.5,23.5-48.88,50.63-40.38c32.38,10.15,28,54.62-4.75,60.88"],"は":["M24.51,18c1.25,1.5,2.15,4,1.62,6.62c-3.5,17.62-6.98,36.4-4,54.88c2.5,15.5,1.12,2,5.62-6.25","M49.64,37.89c2.41,1.57,4.85,2.16,7.8,1.71c9.36-1.43,17.46-2.94,23.4-4.57c3.12-0.86,5.96-1.29,7.8-1.29","M69.77,16.5c2.25,2.12,2.88,4.12,2.88,6.5c0,2.38,1.5,38.62,1.5,48c0,22.5-30.62,19.62-30.62,10.5c0-9.75,23.88-5.62,29.5-2.88c5.62,2.74,11.98,8.26,13.36,9.38"],"ば":["M24.75,17.75c1.25,1.5,1.9,4.25,1.38,6.88c-3.5,17.62-6.98,36.4-4,54.88c2.5,15.5,1.12,2,5.62-6.25","M49.88,37.89c2.41,1.57,4.85,2.41,7.8,1.96c9.36-1.43,17.21-3.19,23.15-4.82c3.12-0.86,5.96-1.29,7.8-1.29","M69.75,16.5c2.26,2.12,2.88,4.12,2.88,6.5c0,2.38,1.5,38.62,1.5,48c0,22.5-30.62,19.62-30.62,10.5c0-9.75,23.88-5.62,29.5-2.88c5.62,2.74,12,8.25,13.38,9.38","M84.75,15.25c2.75,1.75,6,5.38,7.75,8.5","M91.13,10.38c3.06,1.57,6.68,4.82,8.62,7.62"],"ぱ":["M24.51,18c1.25,1.5,2.15,4,1.62,6.62c-3.5,17.62-6.98,36.4-4,54.88c2.5,15.5,1.12,2,5.62-6.25","M49.64,37.89c2.41,1.57,4.85,2.16,7.8,1.71c9.36-1.43,17.46-2.94,23.4-4.57c3.12-0.86,5.96-1.29,7.8-1.29","M69.77,16.5c2.25,2.12,2.88,4.12,2.88,6.5c0,2.38,1.5,38.62,1.5,48c0,22.5-30.62,19.62-30.62,10.5c0-9.75,23.88-5.62,29.5-2.88c5.62,2.74,11.98,8.26,13.36,9.38","M91.01,24.38c-9.62,0-9.25-14.25,0-14.25c9.76-0.01,9.5,14.25,0,14.25"],"ひ":["M20,25.12c1.25,0.88,3.75,2.25,6.5,1.38c2.75-0.87,7.31-2.38,11.38-4.5c6-3.12,8.42-1.01,4.25,4c-27.13,32.62-23.76,58.5-1.52,62.88c18.07,3.56,37.63-16.38,35.63-56.51c-0.72-14.5-0.17-14.78,4.12-1.75c3.76,11.38,10.26,20.76,16.14,26.5"],"び":["M20,25.12c1.25,0.88,3.75,2.25,6.5,1.38c2.75-0.87,7.31-2.38,11.38-4.5c6-3.12,8.42-1.01,4.25,4c-27.13,32.62-23.76,58.5-1.52,62.88c18.07,3.56,37.63-16.38,35.63-56.51c-0.72-14.5-0.17-14.78,4.12-1.75c3.76,11.38,10.26,20.76,16.14,26.5","M86.5,13.5c2.75,1.75,6,5.38,7.75,8.5","M92.87,8.62c3.06,1.57,6.68,4.82,8.62,7.62"],"ぴ":["M20,25.12c1.25,0.88,3.75,2.25,6.5,1.38c2.75-0.87,7.31-2.38,11.38-4.5c6-3.12,8.42-1.01,4.25,4c-27.13,32.62-23.76,58.5-1.52,62.88c18.07,3.56,37.63-16.38,35.63-56.51c-0.72-14.5-0.17-14.78,4.12-1.75c3.76,11.38,10.26,20.76,16.14,26.5","M93.87,22.12c-9.62,0-9.25-14.25,0-14.25c9.75,0.01,9.5,14.25,0,14.25"],"ふ":["M42.63,15.62c3.62,3.38,7.5,5.38,12.74,6.13c9.59,1.37,3.5,3.38-1.88,6.12","M43.63,46.88c1.88,4.62,7.5,9.41,14.25,17.5c10.62,12.74,0.49,30-19.13,21.62","M16.5,73.38c0.75,4,1.88,8.12,5,10.12c1.16,0.74,0.12-3.38,13.25-9.12","M80.13,61.88c5.12,3.38,10.28,7.49,11.38,8.88c6.75,8.5-0.25,4.62-4.62,7.12"],"ぶ":["M42.12,15.62c3.62,3.38,7.5,5.38,12.75,6.12c9.59,1.37,3.5,3.38-1.88,6.12","M43.12,46.88c1.88,4.62,7.5,9.41,14.25,17.5c10.62,12.75,0.5,30-19.12,21.62","M16.5,73.88c0.75,4,1.88,8.12,5,10.12c1.16,0.74,0.12-3.38,13.25-9.12","M79.62,61.88c5.5,3.38,10.28,7.49,11.38,8.88c6.75,8.5-0.25,4.62-4.62,7.12","M73.62,16.25c2.75,1.75,6,5.38,7.75,8.5","M80,11.38c3.06,1.57,6.68,4.82,8.62,7.62"],"ぷ":["M42.13,15.62c3.62,3.38,7.5,5.38,12.74,6.13c9.59,1.37,3.5,3.38-1.88,6.12","M43.13,46.88c1.88,4.62,7.5,9.41,14.25,17.5c10.62,12.74,0.49,30-19.13,21.62","M16.5,73.88c0.75,4,1.88,8.12,5,10.12c1.16,0.74,0.12-3.38,13.25-9.12","M79.63,61.88c5.5,3.38,10.28,7.49,11.38,8.88c6.75,8.5-0.25,4.62-4.62,7.12","M80.87,26.62c-9.62,0-9.25-14.25,0-14.25c9.76,0.01,9.5,14.25,0,14.25"],"へ":["M15,48.75c2.25,1.62,4.67,1.96,7-0.38c3.62-3.62,7.46-6.54,11.25-10.5c5.5-5.75,8.48-4.75,13.12-0.88c12.12,10.12,30.38,25.12,33.38,27.38c3,2.26,12.37,10.38,13.87,11.63"],"べ":["M15,48.75c2.25,1.62,5,1.38,7.62-1c3.89-3.52,6.12-5.75,10.62-9.88c5.88-5.37,8.49-4.75,13.14-0.87c12.12,10.12,30.38,25.12,33.38,27.38c3,2.26,12.37,10.37,13.87,11.62","M66.76,26.75c2.75,1.75,6,5.38,7.75,8.5","M73.13,21.88c3.06,1.57,6.68,4.82,8.62,7.62"],"ぺ":["M15,48.75c2.25,1.62,4.67,1.96,7-0.38c3.62-3.62,7.46-6.54,11.25-10.5c5.5-5.75,8.48-4.75,13.12-0.88c12.12,10.12,30.38,25.12,33.38,27.38c3,2.26,12.38,10.38,13.88,11.63","M73.63,36.75c-9.62,0-9.25-14.25,0-14.25c9.75,0,9.5,14.25,0,14.25"],"ほ":["M24.51,18.75c1.25,1.5,2.15,4,1.62,6.62c-3.5,17.63-6.98,37.4-4,55.88c2.5,15.5,1.12,2,5.62-6.25","M53.08,21.13c1.9,1.28,3.82,1.76,6.14,1.4c7.36-1.17,13.73-2.4,18.41-3.73c2.46-0.7,4.69-1.05,6.13-1.05","M53.83,44.3c2.21,1.44,4.46,1.98,7.16,1.57c8.59-1.31,15.78-2.44,21.23-3.94c2.87-0.79,5.72-1.18,7.41-1.18","M72.51,23c1.38,1.62,1.62,4.12,1.62,6.5c0,2.38,2,35.12,2,44.5c0,17.5-29.88,17.12-29.88,8c0-9.75,21.38-7.88,29.5-2.88c5.33,3.28,12,8.25,13.38,9.38"],"ぼ":["M24.51,18.75c1.25,1.5,2.15,4,1.62,6.62c-3.5,17.63-6.98,37.4-4,55.88c2.5,15.5,1.12,2,5.62-6.25","M53.08,21.13c1.9,1.28,3.82,1.76,6.14,1.4c7.36-1.17,13.73-2.4,18.41-3.73c2.46-0.7,4.69-1.05,6.13-1.05","M53.83,44.3c2.21,1.44,4.46,1.98,7.16,1.57c8.59-1.31,15.78-2.44,21.23-3.94c2.87-0.79,5.72-1.18,7.41-1.18","M72.51,23c1.38,1.62,1.62,4.12,1.62,6.5c0,2.38,2,35.12,2,44.5c0,17.5-29.88,17.12-29.88,8c0-9.75,21.38-7.88,29.5-2.88c5.33,3.28,12,8.25,13.38,9.38","M87.51,26c2.75,1.75,6,5.38,7.75,8.5","M93.88,21.12c3.06,1.57,6.68,4.82,8.62,7.62"],"ぽ":["M24.51,19c1.25,1.5,2.15,4,1.62,6.62c-3.5,17.62-6.98,37.4-4,55.88c2.5,15.5,1.12,2,5.62-6.25","M53.08,21.38c1.9,1.28,3.82,1.76,6.14,1.4c7.36-1.17,13.73-2.4,18.41-3.73c2.46-0.7,4.69-1.05,6.13-1.05","M53.83,44.55c2.21,1.44,4.46,1.98,7.16,1.57c8.59-1.31,15.78-2.44,21.23-3.94c2.87-0.79,5.72-1.18,7.41-1.18","M72.51,23.25c1.38,1.62,1.62,4.12,1.62,6.5c0,2.38,2,35.12,2,44.5c0,17.5-29.88,17.12-29.88,8c0-9.75,21.38-7.88,29.5-2.88c5.33,3.28,12,8.25,13.38,9.38","M95.13,34.5c-9.62,0-9.25-14.25,0-14.25c9.75,0,9.5,14.25,0,14.25"],"ま":["M29.83,32.28c2.2,1.15,4.43,1.5,7.14,1.26c11.54-1.04,25.94-3.12,34.66-4.85c2.87-0.57,5.45-0.44,7.13-0.44","M33.83,51.84c2.45,1.61,4.94,1.72,7.94,1.26c9.52-1.46,17.87-3.1,27.03-5.16c3.22-0.72,6.34-1.32,8.21-1.32","M55.81,14c1.52,1.8,1.8,4.57,1.8,7.19c0,2.63,0.46,43.88,0.46,54.25c0,21.3-30.07,19.96-30.07,9.86c0-10.79,25.88-9.93,38.57-3.18c6.12,3.25,11.55,6.38,14.8,9.13"],"み":["M32.5,26c1.88,1.75,4.06,1.7,6.88,1.25c3.88-0.62,7.62-1.75,11.88-3.12c4.26-1.37,6.25-0.12,4.5,5.12c-1.75,5.24-6.66,17.39-12,30.12c-13.63,32.51-29.26,29.26-29.26,18.63c0-14.25,20.48-15.36,33-13.5c18.5,2.75,30,6.62,44.38,14.25","M79.38,54.75c0.75,2.38,0.49,4.37,0,6.25c-2.12,8.12-7.5,25-22.12,33.75"],"む":["M19.59,31.65c2.1,1.55,4.24,1.66,6.81,1.21c8.17-1.41,15.33-2.98,23.19-4.96c2.76-0.69,5.44-1.27,7.05-1.27","M37.02,15.5c1.62,1.25,2.31,2.88,2.12,5.25c-0.88,11.12-1.5,20.75-4,34.88c-3.61,20.44-19.25,16.99-18.62,7.37c0.5-7.74,6.25-12.86,12.62-13.5c5-0.5,14.28,1.93,5.88,15c-12.62,19.62-11.42,24.51,5.11,25.54c10.98,0.68,19.26,0.72,28.49-0.92c14.15-2.5,7.4-2.63,7.4-11.13","M78.52,36.25c6.88,3.12,11.71,5.95,14.88,10.12c6.25,8.25-1.38,3.62-4.5,4.5"],"め":["M27.48,31.75c1.75,1,2.41,3.09,2.5,5.25c0.5,11.62,2.75,23.5,7.25,31.38c1.39,2.44,5.38,8.5,7.25,10.38","M59.6,19.38c1,1.5,1.35,4.12,0.88,6.62c-2.75,14.62-13.62,37.75-20.1,47.24c-12.28,17.14-16.78,13.14-22.28,0.64c-5.38-15.38,26.4-42.18,53.42-35.28c29.08,8.27,23.96,46.02-7.98,50.15"],"も":["M49.17,14.75c1.88,1.88,1.86,4.52,1.12,8c-3,14.25-5,26.62-7,42.12c-2.55,19.73-0.75,29.88,17,29.86c20.25-0.02,28.63-13.11,20.01-35.73","M26.54,34.62c1.12,0.88,2.87,2.21,6,2c11.12-0.75,20-2.12,27.74-3.46c3.88-0.67,5.88-1.17,8.88-1.04","M26.42,53.38c-1.5,4,1,6.75,7.75,6.75c8.75,0,17.62-1,22.88-1.88c2.01-0.33,5.38-1,7.5-1.75"],"ゃ":["M26,61.07c1.49,1.29,4.16,1.98,6.84,0.69c14.68-7.03,28.36-15.36,40.32-15.26c7.16,0.11,12.7,3.28,12.63,9.75c0,6.61-8.63,13.15-19.43,14.14","M49.1,34.5c4.07,0.69,8.25,3.21,9.12,5.25c1.69,3.97-0.79,1.88-2.28,2.08","M35.77,40.99c1.88,1.49,2.35,2.77,2.82,4.67c2.08,8.33,8.82,32.37,11.7,41.39c0.51,1.62,1.49,4.96,2.28,7.44"],"や":["M18,49.38c1.88,1.62,5.25,2.5,8.62,0.88c18.51-8.88,35.76-19.38,50.83-19.26c9.02,0.14,16.01,4.13,15.93,12.29c0,8.33-10.88,16.58-24.5,17.83","M47.13,15.88c5.12,0.88,10.41,4.05,11.5,6.62c2.12,5-1,2.38-2.88,2.62","M30,24.38c2.38,1.88,3.28,2.87,3.88,5.25c2.62,10.5,11.12,41.12,14.75,52.5c0.65,2.04,1.88,6.25,2.88,9.38"],"ゅ":["M27.74,40.79c1.1,1.2,1.61,3.3,1.2,5c-2.3,9.4-3.2,17.79-1.7,27.99c2.22,15.08,0.9,3.1,2.6-1.2c7.19-18.19,21.79-27.59,35.49-27.59c13.5,0,17.49,9.1,17.49,16.2c0,21.89-24.69,23.69-34.39,13.4","M57.63,33.89c2.1,1.4,2.53,2.5,2.8,5.7c0.7,8.4,1.12,14.97,1.3,23.49c0.4,19.19-5,25.59-9.9,31.39"],"ゆ":["M21.05,25.38c1.38,1.5,2.02,4.13,1.5,6.25c-2.88,11.75-4,22.25-2.12,35c2.77,18.85,1.12,3.88,3.25-1.5c9-22.75,27.24-34.5,44.38-34.5c16.88,0,21.88,11.38,21.88,20.25c0,27.38-30.88,29.62-43,16.75","M58.42,16.75c2.62,1.75,3.17,3.13,3.5,7.12c0.88,10.5,1.4,18.72,1.62,29.38c0.5,24-6.25,32-12.38,39.25"],"ょ":["M57.8,50.06c5.98-1.02,10.95-2.09,14.74-3.25c1.99-0.61,3.8-0.91,4.98-0.91","M54.91,33c1.79,1.69,2.38,3.28,2.29,5.16c-0.6,13.49-0.1,27.68,1.11,42.47c1.5,18.31-27.81,16.56-27.81,9.12c0-9.53,20.92-6.35,28.68-3.27c6.46,2.56,9.18,3.87,14.76,8.23"],"よ":["M58.24,35.38c7.5-1.28,13.74-2.63,18.5-4.1c2.5-0.77,4.77-1.15,6.25-1.15","M54.62,13.88c2.25,2.12,2.98,4.13,2.88,6.5c-0.75,17-0.12,34.88,1.39,53.5c1.88,23.07-34.89,20.88-34.89,11.5c0-12,26.25-8,35.98-4.12c8.1,3.23,11.52,4.88,18.52,10.38"],"ら":["M35.33,15c3.75,3,9.22,4.41,16.5,4.25c11.12-0.25-0.25,2.38-1.25,3.5","M35.83,35.75c-2.14,4.34-2.79,8.67-3.11,13.24c-0.42,5.84-0.31,12.05-2.14,19.13c-3.16,12.27,1.49,4.77,3,3.5c11.88-10,21.7-12.67,32.61-12.49c9.21,0.15,16.85,5.19,16.76,13.88c-0.12,13.6-14.24,21.49-32.49,22.49"],"り":["M38.75,25.25c1.25,1.5,2.24,4.03,1.62,6.62c-2.88,12.13-6.29,29.65-4.25,42.38c2,12.5,1.75-0.75,5.62-6.25","M69.37,18.75c2.25,2.12,2.88,4.12,2.88,6.5c0,2.38,0,26.38,0,35.75c0,16.5-5,25.75-12.62,33.12"],"る":["M34.31,20.38c1.75,1.25,4.62,2.62,8.5,1.5c3.88-1.12,9.62-2.5,15.62-4.62c6-2.12,7.5-0.12,4.38,4.25c-3.12,4.37-18.89,24.62-27.75,34c-8.5,9-13.09,11.89,0.75,3.25c15.62-9.75,43-10.88,43,13.38c0,22.5-40.88,24.5-40.88,12.62c0-11.25,18.12-8.75,24.38-0.38"],"れ":["M34.48,13c1.5,1.38,2.83,3.74,2.5,6.38c-0.5,4-2.75,44.5-2.75,52.88c0,8.38,0.12,16.62,0.12,19.5","M16.98,40.75c2.12,1.38,3.74,1.46,7.5,0c4.5-1.75,6.55-2.66,13-5.5c4.25-1.88,4.4,0.24,2.5,3.5c-5.25,9-10.5,16.75-18.88,27.62c-7.55,9.81-6.93,12.85,3.25,3.12c14-13.38,20.34-19.76,33.88-32.5c6.38-6,19.39-12.09,18.14,0.88c-1.02,10.63-1.89,22.13-2.29,30.75c-1.02,21.71,11.53,18,20.15,8.63"],"ろ":["M36.95,21.88c1.5,2,4.62,3.62,8.5,2.5c3.88-1.12,8.12-2.25,14.12-4.38c6-2.13,6.53-0.1,3.38,4.25c-7.88,10.88-18,22.75-27.5,35.25c-7.49,9.86-10.68,11.32,2.88,2.25c17.38-11.62,46.62-14,46.62,8.12c0,15.62-16,22.5-32.12,25.12"],"ゎ":["M42.57,32.38c1.18,1.08,1.75,2.94,1.58,5.03c-0.79,9.37-2.17,35.11-2.17,41.71c0,6.61-0.49,13.12-0.49,15.38","M26.33,52.97c1.7,1.1,2.94,1.04,5.99,0c4.69-1.6,7.83-2.52,12.97-4.79c3.39-1.5,4.89,0,2.19,3.19c-5.36,6.36-10.38,13.17-17.66,22.25c-6.18,7.71-6.02,9.74,2.39,2.29c17.46-15.46,39.71-28.43,50.68-16.76c11.46,12.19,1.3,29.23-18.66,34.02"],"わ":["M38.53,14.75c1.5,1.38,2.22,3.73,2,6.38c-1,11.87-2.75,44.49-2.75,52.87c0,8.38-0.62,16.62-0.62,19.5","M17.53,40.75c2.12,1.38,3.68,1.3,7.5,0c5.88-2,9.8-3.16,16.25-6c4.25-1.88,6.12,0,2.75,4c-6.72,7.96-13,16.5-22.12,27.88c-7.75,9.66-7.54,12.21,3,2.88c21.88-19.38,49.75-35.62,63.5-21c14.36,15.27,1.62,36.62-23.38,42.62"],"を":["M28.56,27.87c1.62,1.13,3.17,1.64,6.01,1.12c10.86-1.99,16.74-3.37,24.71-4.72c3.64-0.62,5.65-0.93,8.4-0.75","M49.93,14.38c0.75,1,1.48,3.22,0.38,5.62c-4.62,10.12-10,20.75-17.12,30.25c-9.25,12.33-9.25,11.19,2.12,2.5c9-6.88,23.75-12.12,22.88,19.88","M83.06,39.88c0.62,1.75,0,4-3,5.75c-3,1.75-49.62,24.16-44.75,38.25c3.28,9.48,17.93,9.12,29.98,7.75c4.48-0.51,9.15-1.12,12.4-1.75"],"ん":["M56.35,16.5c0.75,1.75,1.13,5.83-0.38,8.25c-7,11.25-27.22,43.47-33.88,54.37c-9,14.75-7.62,16.25,1.5,1.25c17.86-29.36,32-23.76,32-6.75c0,25,19,26.5,34.25-5"]};
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

function StrokePanel({ ch, onClose }) {
  const [numbers, setNumbers] = useState(false);
  const { play, canPlay, playSound } = useKanaAudio();
  if (!ch) return null;
  const known = !!STROKES[ch];
  return (
    <div style={{
      marginTop: 14, padding: 16, background: T.paper,
      border: `1px solid ${T.hairline}`, borderRadius: 6,
      display: "flex", gap: 18, alignItems: "flex-start", flexWrap: "wrap",
    }}>
      {known ? <StrokeView ch={ch} auto numbers={numbers} /> : (
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

const CHART_NOTE = "Charts in Japan run right to left, vowels first on the right; shown left to right here to match the keyboard.";

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

function Learn({ mod, progress, onProgress }) {
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

      <StrokePanel ch={sel} onClose={() => setSel(null)} />

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

// ————— Drill: sound → kana —————
function Drill({ mod, idx, progress, onProgress }) {
  const { pool, focus } = useMemo(() => {
    const seen = [...availableAt(idx)];
    let f;
    if (mod.col) {
      const c = COLS.find((x) => x.key === mod.col);
      f = c.kana.filter(Boolean);
      if (mod.id === "wa") f = [...f, "ん"];
    } else if (mod.dakuten && !mod.small) {
      f = [...new Set([...Object.values(DAKUTEN), ...Object.values(HANDAKU)])];
    } else {
      f = seen;
    }
    return { pool: seen, focus: f };
  }, [mod.id, idx]);

  const [queue, setQueue] = useState([]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);
    // New material first, then review from everything already learned.
    const core = shuffle(focus);
    const review = shuffle(pool.filter((k) => !focus.includes(k)));
    setQueue([...core, ...review].slice(0, Math.max(core.length, Math.min(10, pool.length))));
    setI(0); setPicked(null); setScore(0); setDone(false);
  }, [mod.id, idx]);

  const target = queue[i];
  const opts = useMemo(() => {
    if (!target) return [];
    const wrong = pool.filter((k) => k !== target).sort(() => Math.random() - 0.5).slice(0, 5);
    return [...wrong, target].sort(() => Math.random() - 0.5);
  }, [target, i, queue]);

  const restart = () => {
    const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);
    const core = shuffle(focus);
    const review = shuffle(pool.filter((k) => !focus.includes(k)));
    setQueue([...core, ...review].slice(0, Math.max(core.length, Math.min(10, pool.length))));
    setI(0); setPicked(null); setScore(0); setDone(false);
  };

  if (done) {
    const pct = queue.length ? score / queue.length : 0;
    return (
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <div style={{ fontFamily: T.jpFont, fontSize: 34, color: pct >= 0.8 ? T.ok : T.ink }}>
          {score} / {queue.length}
        </div>
        <p style={{ fontSize: 14, color: T.sub }}>
          {pct === 1 ? "Clean. Go build some words in Write."
            : pct >= 0.8 ? "Close. One more pass, then Write."
            : "Worth another run before Write."}
        </p>
        <button className="btn-ghost" onClick={restart}>Again</button>
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
      <div style={{ fontSize: 12, color: T.sub, marginBottom: 14 }}>
        {i + 1} of {queue.length} · Score {score}
      </div>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: T.sub, marginBottom: 6 }}>Tap the kana for</div>
        <div style={{ fontSize: 42, letterSpacing: "2px", fontWeight: 300 }}>{soundFor(target)}</div>
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
          {picked === target ? (
            <span style={{ color: T.ok, fontWeight: 600 }}>Correct.</span>
          ) : (
            <span>
              <span style={{ color: T.shu, fontWeight: 600 }}>Not quite. </span>
              <span style={{ fontFamily: T.jpFont, fontSize: 17 }}>{picked}</span> is {soundFor(picked)}.
              {isConfusable(picked, target) && (
                <span style={{ color: T.note }}> These two are near-twins by shape — worth a look side by side.</span>
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


// ————— Write: build the word on squares —————
function Write({ mod, idx, progress, onProgress, listen }) {
  const words = mod.words || [];
  const enabled = useMemo(() => availableAt(idx), [idx]);
  const { voice, checked, supported } = useJapaneseVoice();
  const [wi, setWi] = useState(0);
  const [val, setVal] = useState("");
  const [result, setResult] = useState(null);
  const [cleared, setCleared] = useState(0);

  useEffect(() => { setWi(0); setVal(""); setResult(null); setCleared(0); }, [mod.id]);
  if (!words.length) return <p style={{ fontSize: 14, color: T.sub }}>No word building here — the judgment drill is the practice.</p>;

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
    else if (SMALL[got] === want) msg = `Beat ${at + 1} needs to be small. Type it, then tap "small".`;
    else if (SMALL[want] === got) msg = `Beat ${at + 1} should be full size, not small.`;
    else if (DAKUTEN[got] === want) msg = `Beat ${at + 1} needs a dakuten. Type ${got}, then tap ゛.`;
    else if (HANDAKU[got] === want) msg = `Beat ${at + 1} needs a handakuten. Type ${got}, then tap ゜.`;
    else if (isConfusable(got, want)) msg = `Beat ${at + 1}: you wrote ${got} (${soundFor(got)}), this word wants ${want} (${soundFor(want)}). These two are easy to confuse by shape.`;
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
        {listen ? "Listen, then tap out what you hear" : "Assemble this word — one kana per box"}
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
              The Write tab covers the same words.
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
        <KanaPad
          enabled={enabled}
          onInsert={(ch) => setVal((v) => v + ch)}
          onModify={modify}
          onBack={() => setVal((v) => v.slice(0, -1))}
          onClear={() => setVal("")}
        />
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
function Judge({ mod, progress, onProgress }) {
  const items = mod.judge || [];
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  useEffect(() => { setI(0); setPicked(null); setScore(0); setDone(false); }, [mod.id]);
  if (!items.length) return null;

  if (done) {
    return (
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <div style={{ fontFamily: T.jpFont, fontSize: 34, color: score === items.length ? T.ok : T.ink }}>
          {score} / {items.length}
        </div>
        <button className="btn-ghost" onClick={() => { setI(0); setPicked(null); setScore(0); setDone(false); }}>Again</button>
      </div>
    );
  }

  const it = items[i];
  const pick = (o) => { if (picked) return; setPicked(o); if (o === it.answer) setScore((s) => s + 1); };
  const next = () => {
    if (i + 1 < items.length) { setI(i + 1); setPicked(null); }
    else {
      setDone(true);
      const prev = progress[mod.id] || {};
      onProgress({ ...progress, [mod.id]: { ...prev, judged: Math.max(prev.judged || 0, score) } });
    }
  };

  return (
    <div>
      <div style={{ fontSize: 12, color: T.sub, marginBottom: 16 }}>{i + 1} of {items.length} · Score {score}</div>
      <div style={{ fontFamily: T.jpFont, fontSize: 27, lineHeight: 1.9, marginBottom: 6, textAlign: "center" }}>
        {it.before}
        <span style={{
          display: "inline-block", minWidth: 44,
          borderBottom: `2px solid ${picked ? (picked === it.answer ? T.ok : T.shu) : T.shu}`,
          color: picked ? (picked === it.answer ? T.ok : T.shu) : "transparent",
        }}>{picked || "＿"}</span>
        {it.after}
      </div>
      <div style={{ fontSize: 13, color: T.sub, textAlign: "center", marginBottom: 18 }}>{it.en}</div>
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        {it.options.map((o) => {
          const right = picked && o === it.answer;
          const wrongPick = picked === o && o !== it.answer;
          return (
            <button key={o} onClick={() => pick(o)} style={{
              padding: "12px 28px", fontFamily: T.jpFont, fontSize: 27, borderRadius: 4,
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

function StrokePractice({ chars, modId, progress, onProgress }) {
  const [ch, setCh] = useState(chars[0] || null);
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
// are gone entirely; ゐ and ゑ were dropped long ago.
const PAD_EXCLUDE = new Set([]);
const MODERN_KANA = new Set(
  [
    ...COLS.flatMap((c) => c.kana),
    ...Object.values(DAKUTEN),
    ...Object.values(HANDAKU),
    ...Object.values(SMALL),
    "ん",
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

const KANA_N = "ん";

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

// ————— Module shell —————
function Module({ mod, idx, progress, onProgress, onBack }) {
  const isSkill = mod.kind === "skill";
  const isCulture = mod.kind === "culture";
  const tabs = isCulture
    ? [["learn", "Read"]]
    : isSkill
    ? [["learn", "Learn"], ["judge", "Choose"], ["trace", "Trace"], ["pad", "Free pad"]]
    : [["learn", "Learn"], ["drill", "Drill"], ["write", "Assemble"], ["listen", "Listen"], ["trace", "Trace"],
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
  useEffect(() => setTab("learn"), [mod.id]);
  const p = progress[mod.id] || {};

  return (
    <div>
      <button className="btn-ghost" onClick={onBack} style={{ marginBottom: 16 }}>← All lessons</button>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
        <h2 style={{ fontFamily: hasJP(mod.title) ? T.jpFont : T.uiFont, fontSize: 27, margin: 0 }}>{mod.title}</h2>
        <span style={{ fontSize: 15, letterSpacing: ".5px" }}>{mod.sounds}</span>
        <span style={{ fontSize: 14, color: T.sub }}>· {mod.en}</span>
        <KindBadge kind={mod.kind} />
      </div>

      <div style={{ display: "flex", gap: 6, margin: "16px 0" }}>
        {tabs.map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            padding: "7px 16px", borderRadius: 999, fontSize: 13, cursor: "pointer", fontFamily: T.uiFont,
            background: tab === id ? T.ink : "none", color: tab === id ? T.paper : T.sub,
            border: `1px solid ${tab === id ? T.ink : T.hairline}`,
          }}>
            {label}
            {id === "drill" && p.drill != null ? ` · ${p.drill}` : ""}
            {id === "write" && p.written ? ` · ${p.written}` : ""}
            {id === "listen" && p.heard ? ` · ${p.heard}` : ""}
            {id === "trace" && p.traced ? ` · ${p.traced.length}` : ""}
            {id === "judge" && p.judged != null ? ` · ${p.judged}` : ""}
          </button>
        ))}
      </div>

      <div style={{ background: T.sheet, border: `1px solid ${T.hairline}`, borderRadius: 8, padding: 20 }}>
        {tab === "learn" && <Learn mod={mod} progress={progress} onProgress={onProgress} />}
        {tab === "drill" && <Drill mod={mod} idx={idx} progress={progress} onProgress={onProgress} />}
        {tab === "write" && <Write mod={mod} idx={idx} progress={progress} onProgress={onProgress} />}
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
            <StrokePractice chars={traceChars} modId={mod.id} progress={progress} onProgress={onProgress} />
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

// ————— Root —————
export default function HiraganaModule() {
  const [progress, setProgress] = useState({});
  const [current, setCurrent] = useState(null);
  const [freePad, setFreePad] = useState(false);
  const [openGroups, setOpenGroups] = useState(null); // null → fall back to first unfinished group
  const loaded = useRef(false);

  useEffect(() => { loadProgress().then((p) => { setProgress(p); loaded.current = true; }); }, []);
  const update = (p) => { setProgress(p); if (loaded.current) saveProgress(p); };

  const isDone = (m) => {
    const p = progress[m.id];
    if (!p) return false;
    if (m.kind === "culture") return !!p.read;
    if (m.kind === "skill") return (p.judged || 0) >= (m.judge?.length || 1);
    return p.drill != null && (p.written || 0) >= (m.words?.length || 1);
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

  const kanaLearned = (() => {
    let last = -1;
    MODULES.forEach((m, i) => { if (isDone(m)) last = i; });
    if (last < 0) return 0;
    return [...availableAt(last)].filter((k) => !Object.values(SMALL).includes(k)).length;
  })();

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
        button:focus-visible { outline: 2px solid ${T.ai}; outline-offset: 2px; }
      `}</style>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px 80px" }}>
        <header style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 6 }}>
          <div style={{ fontFamily: T.jpFont, fontSize: 34, color: T.shu, lineHeight: 1 }}>あ</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>Hiragana</div>
            <div style={{ fontSize: 13, color: T.sub }}>
              {mod
                ? `${mod.title} · ${mod.sounds}`
                : kanaLearned
                  ? `Stage 1 foundation · ${kanaLearned} kana learned`
                  : "Stage 1 foundation · start at the top"}
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
              One row at a time. Each lesson adds five kana, drills them against everything you already
              know, then has you write real words with them. The traps that cause grammar errors later —
              は read as wa, long vowels, small っ — get lessons of their own rather than a footnote.
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
              Lesson content is AI-authored and pending native-speaker review. Progress is saved on this device's account.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
