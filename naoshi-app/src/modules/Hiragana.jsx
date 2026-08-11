// GENERATED from hiragana-module.jsx by build-vite-app.py — do not hand-edit.
// Edit the source module and re-run. The single-file artifact stays the
// source of truth so the reviewer's grading path keeps working.
import { useEffect, useMemo, useRef, useState } from "react";
import { installStorage } from "../lib/storage.js";
import { T } from "../lib/tokens.js";
import { StrokeView, samplePath, scoreStroke, tolerancesFor, thinPoints, useStrokeData, StrokePractice, LOG_PTS, STROKE_BOX, TOL, TRACE_N } from "../lib/strokeEngine.jsx";
import { STROKES } from "../lib/strokeData.js";
import "../data/strokes-hiragana.js";
installStorage();

// ————— Design tokens (matched to naoshi-prototype / grammar-module) —————


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




// ————— Stroke-order animation —————


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

// ————— Drill: sound → kana —————
function Drill({ mod, idx, progress, onProgress, onGoTrace }) {
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
  const [showRomaji, setShowRomaji] = useState(false);
  const { playSound, canPlaySound } = useKanaAudio();

  useEffect(() => {
    const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);
    // New material first, then review from everything already learned.
    const core = shuffle(focus);
    const review = shuffle(pool.filter((k) => !focus.includes(k)));
    setQueue([...core, ...review].slice(0, Math.max(core.length, Math.min(10, pool.length))));
    setI(0); setPicked(null); setScore(0); setDone(false);
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
        <Flourish
          title={pct === 1 ? "Every one." : pct >= 0.8 ? "Nearly clean." : "Drill finished."}
          detail={pct >= 0.8
            ? "Recognition is there. Tracing is what makes it stick — that is the next tab."
            : "Worth another run before you trace them; the shapes land better once the sounds are solid."}
          nextLabel="Go to Trace"
          onNext={onGoTrace}
          onAgain={restart}
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
      <div style={{ fontSize: 12, color: T.sub, marginBottom: 14 }}>
        {i + 1} of {queue.length} · Score {score}
      </div>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: T.sub, marginBottom: 10 }}>Tap the kana you hear</div>
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
  const isSkill = mod.kind === "skill";
  const isCulture = mod.kind === "culture";
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
        <span style={{ fontSize: 15, letterSpacing: ".5px" }}>{mod.sounds}</span>
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
// stampFirsts: every save stamps any array element, object key, or newly-set
// field that has no stamp yet, under progress._firstAt. The then-vs-now moment
// (reward-system-design-v1.md) needs this history to exist before Phase 0
// recruiting; nothing reads it yet. Stamps equal to _stampEpoch belong to a
// profile that predates stamping — "before we started counting", not real
// first-clear times.
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

// The lesson flourish states what the learner CAN now do — never workload.
// The fraction is allowed under the clarified counts rule (sprint horizon,
// closed set) and the example words are computed, never asserted: only words
// whose every character the learner has actually traced qualify. The section
// countdown ("2 more lessons in …") is the checkpoint-pacing exception, also
// Session 11. See reward-system-design-v1.md §2 and the rule-scope section.
const BASE_KANA = (() => {
  const s = new Set();
  COLS.forEach((c) => c.kana.forEach((k) => k && s.add(k)));
  s.add("ん"); // lives outside COLS — the wa lesson adds it (see availableAt)
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
  let line = "You can now write " + can + " of the 46 hiragana" +
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
// Fires when THIS lesson's tracing completed a word whose other characters
// were first cleared at least THEN_WINDOW ago — evidence of progress, shown
// not asserted (reward-system-design-v1.md). It reads the _firstAt history,
// so it cannot fire before that window has genuinely elapsed for a learner;
// silence until then is by design, not a bug.
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
      if (ts.some((t) => t == null)) continue;          // not yet fully writable
      const newest = Math.max(...ts);
      if (!lessonChars.has(chars[ts.indexOf(newest)])) continue; // caused by THIS lesson
      if (Date.now() - newest > 18 * 36e5) continue;    // completed just now, not long ago
      const oldest = Math.min(...ts);
      if (newest - oldest < THEN_WINDOW) continue;      // the "then" must be a real then
      if (!best || chars.length > best.n) best = { word: w.kana, since: oldest, n: chars.length };
    }
  }
  return best;
}

// ————— Root —————
export default function HiraganaModule() {
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
    //                recorded sprite (word playback stayed on synthesis
    //                deliberately — stitched mora have no pitch accent), so a
    //                device with no Japanese voice cannot do it at all.
    //                Requiring it unconditionally would lock those learners out
    //                permanently, which is why Listen was excluded from
    //                completion in the first place. It marks itself satisfied
    //                when unsupported.
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
