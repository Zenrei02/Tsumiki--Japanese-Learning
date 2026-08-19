// GENERATED from grammar-module.jsx by build-vite-app.py — do not hand-edit.
// Edit the source module and re-run. The single-file artifact stays the
// source of truth so the reviewer's grading path keeps working.
import { useEffect, useRef, useState } from "react";
import { installStorage } from "../lib/storage.js";
import { T } from "../lib/tokens.js";
installStorage();

// ————— Design tokens (same family as the checker) —————


// ————— Kanji display dictionary —————
// Prototype subset, AI-tagged and pending native review. The real app replaces
// this with a tokenizer-based annotation pipeline (see tracker).
// [written form, kana reading, meaning, kanji level]
const KANJI_DICT = [
  ["ご飯", "ごはん", "rice; a meal", "N4"],
  ["社長", "しゃちょう", "company president", "N3"], ["お客様", "おきゃくさま", "customer; guest (honored)", "N3"], ["席", "せき", "seat", "N3"],
  ["二階", "にかい", "second floor", "N4"], ["お手洗い", "おてあらい", "restroom", "N4"], ["飲み物", "のみもの", "drink", "N4"], ["教室", "きょうしつ", "classroom", "N4"], ["拝見", "はいけん", "(humbly) looking at", "N3"], ["住所", "じゅうしょ", "address", "N4"], ["荷物", "にもつ", "luggage; bags", "N4"],
  ["日本語", "にほんご", "Japanese language", "N5"], ["日本人", "にほんじん", "Japanese person", "N5"], ["日本", "にほん", "Japan", "N5"],
  ["図書館", "としょかん", "library", "N3"], ["朝ごはん", "あさごはん", "breakfast", "N5"], ["昼ごはん", "ひるごはん", "lunch", "N4"],
  ["学生", "がくせい", "student", "N5"], ["先生", "せんせい", "teacher", "N5"], ["学校", "がっこう", "school", "N5"],
  ["電車", "でんしゃ", "train", "N5"], ["映画", "えいが", "movie", "N4"], ["公園", "こうえん", "park", "N3"],
  ["友達", "ともだち", "friend", "N4"], ["時間", "じかん", "time", "N5"], ["毎日", "まいにち", "every day", "N5"],
  ["今日", "きょう", "today", "N5"], ["昨日", "きのう", "yesterday", "N4"], ["明日", "あした", "tomorrow", "N4"],
  ["天気", "てんき", "weather", "N5"], ["音楽", "おんがく", "music", "N4"], ["宿題", "しゅくだい", "homework", "N3"],
  ["仕事", "しごと", "work", "N4"], ["写真", "しゃしん", "photo", "N4"], ["銀行", "ぎんこう", "bank", "N5"],
  ["部屋", "へや", "room", "N4"], ["果物", "くだもの", "fruit", "N4"], ["野菜", "やさい", "vegetables", "N3"],
  ["医者", "いしゃ", "doctor", "N3"], ["問題", "もんだい", "problem", "N4"], ["意味", "いみ", "meaning", "N4"],
  ["全部", "ぜんぶ", "all", "N3"], ["最後", "さいご", "the end", "N3"], ["財布", "さいふ", "wallet", "N2"],
  ["散歩", "さんぽ", "a walk", "N3"], ["勉強", "べんきょう", "study", "N4"], ["大丈夫", "だいじょうぶ", "it's fine", "N3"],
  ["上手", "じょうず", "good at", "N5"], ["下手", "へた", "bad at", "N5"], ["子ども", "こども", "child", "N5"],
  ["週末", "しゅうまつ", "weekend", "N4"], ["田中", "たなか", "Tanaka (name)", "N5"], ["国", "くに", "country", "N5"],
  ["新し", "あたらし", "new", "N5"], ["面白", "おもしろ", "interesting", "N4"], ["簡単", "かんたん", "simple", "N3"],
  ["好き", "すき", "liked; to like", "N5"], ["高", "たか", "expensive; tall", "N5"], ["安", "やす", "cheap", "N5"],
  ["寒", "さむ", "cold", "N4"], ["暑", "あつ", "hot", "N4"], ["広", "ひろ", "spacious", "N4"], ["静か", "しずか", "quiet", "N4"],
  ["忙し", "いそがし", "busy", "N3"], ["痛", "いた", "painful", "N4"], ["小さ", "ちいさ", "small", "N5"], ["大き", "おおき", "big", "N5"],
  ["食べ", "たべ", "eat", "N5"], ["飲", "の", "drink", "N5"], ["行", "い", "go", "N5"], ["見", "み", "see; watch", "N5"],
  ["買", "か", "buy", "N5"], ["話", "はな", "speak", "N5"], ["読", "よ", "read", "N5"], ["書", "か", "write", "N5"],
  ["聞", "き", "listen; ask", "N5"], ["会", "あ", "meet", "N5"], ["待", "ま", "wait", "N4"], ["使", "つか", "use", "N4"],
  ["住", "す", "live (reside)", "N4"], ["働", "はたら", "work (verb)", "N4"], ["起", "お", "get up", "N4"], ["寝", "ね", "sleep", "N3"],
  ["帰", "かえ", "return home", "N4"], ["開け", "あけ", "open (something)", "N4"], ["開", "あ", "open", "N4"], ["閉", "し", "close", "N4"],
  ["始", "はじ", "begin", "N4"], ["終わ", "おわ", "end", "N4"], ["洗", "あら", "wash", "N3"], ["歯", "は", "tooth", "N3"],
  ["遅", "おく", "late", "N3"], ["忘", "わす", "forget", "N3"], ["落と", "おと", "drop", "N3"], ["撮", "と", "take (photo)", "N3"],
  ["吸", "す", "smoke; inhale", "N3"], ["座", "すわ", "sit", "N3"], ["歌", "うた", "song; sing", "N4"], ["背", "せ", "height; back", "N3"],
  ["薬", "くすり", "medicine", "N3"], ["頭", "あたま", "head", "N4"], ["窓", "まど", "window", "N2"], ["机", "つくえ", "desk", "N2"],
  ["猫", "ねこ", "cat", "N2"], ["犬", "いぬ", "dog", "N4"], ["袋", "ふくろ", "bag", "N2"], ["利用", "りよう", "use (formal)", "N3"],
  ["夏", "なつ", "summer", "N4"], ["冬", "ふゆ", "winter", "N4"], ["雨", "あめ", "rain", "N5"], ["水", "みず", "water", "N5"],
  ["本", "ほん", "book", "N5"], ["車", "くるま", "car", "N5"], ["駅", "えき", "station", "N4"], ["店", "みせ", "shop", "N5"],
  ["海", "うみ", "sea", "N4"], ["町", "まち", "town", "N4"], ["手", "て", "hand", "N5"], ["私", "わたし", "I", "N5"],
  ["母", "はは", "my mother", "N5"], ["父", "ちち", "my father", "N5"], ["兄", "あに", "my older brother", "N4"],
  ["妹", "いもうと", "my younger sister", "N4"], ["弟", "おとうと", "my younger brother", "N4"], ["今", "いま", "now", "N5"],
  // —— v2 additions: words introduced by the rewritten Step 1–4 copy ——
  ["牛乳", "ぎゅうにゅう", "milk", "N4"], ["結婚", "けっこん", "marriage", "N3"],
  ["東京", "とうきょう", "Tokyo", "N5"], ["名前", "なまえ", "name", "N5"],
  ["顔", "かお", "face", "N4"], ["肉", "にく", "meat", "N5"],
  ["魚", "さかな", "fish", "N5"], ["彼", "かれ", "he", "N4"],
  ["誰", "だれ", "who", "N4"], ["休み", "やすみ", "holiday; rest", "N5"],
  ["遊", "あそ", "play", "N4"], ["泳", "およ", "swim", "N4"],
  ["切", "き", "cut", "N4"], ["知", "し", "know", "N4"],
  ["走", "はし", "run", "N4"], ["乗", "の", "ride", "N4"],
  ["作", "つく", "make", "N4"], ["降", "ふ", "fall (rain)", "N3"],
  ["向", "む", "face; head toward", "N3"], ["妹", "いもうと", "my younger sister", "N4"],
  ["百円", "ひゃくえん", "100 yen", "N5"], ["三月", "さんがつ", "March", "N5"],
  ["月曜日", "げつようび", "Monday", "N5"], ["火曜日", "かようび", "Tuesday", "N5"],
  ["七時", "しちじ", "seven o'clock", "N5"], ["九時", "くじ", "nine o'clock", "N5"],
  ["五時", "ごじ", "five o'clock", "N5"], ["三時", "さんじ", "three o'clock", "N5"],
  ["三十分", "さんじゅっぷん", "thirty minutes", "N5"], ["十人", "じゅうにん", "ten people", "N5"],
  ["一人", "ひとり", "one person; alone", "N5"], ["十日", "とおか", "the 10th; ten days", "N4"],
  ["来週", "らいしゅう", "next week", "N5"], ["先週", "せんしゅう", "last week", "N5"],
  ["三年", "さんねん", "three years", "N5"], ["千円", "せんえん", "1000 yen", "N5"],
  ["机の上", "つくえのうえ", "on the desk", "N4"], ["歩", "ある", "walk", "N4"],
  ["終わり", "おわり", "the end", "N4"], ["始ま", "はじま", "begin (intransitive)", "N4"],
  ["何", "なに", "what", "N5"], ["疲", "つか", "get tired", "N3"], ["来", "き", "come", "N5"],
  ["赤", "あか", "red", "N4"], ["家", "いえ", "house; home", "N5"], ["茶", "ちゃ", "tea", "N5"],
  ["入", "はい", "enter", "N5"], ["朝", "あさ", "morning", "N5"], ["持", "も", "hold; have", "N4"],
  ["一", "いち", "one", "N5"], ["休", "やす", "rest", "N5"], ["一つ", "ひとつ", "one (thing)", "N5"],
  // —— v3 additions: kosoado, question words, counters, noun modification ——
  ["離婚", "りこん", "divorce", "N2"], ["料理", "りょうり", "cooking; a dish", "N4"],
  ["人", "ひと", "person", "N5"], ["二人", "ふたり", "two people", "N5"],
  ["三人", "さんにん", "three people", "N5"], ["二つ", "ふたつ", "two (things)", "N5"],
  ["三つ", "みっつ", "three (things)", "N5"], ["二", "に", "two", "N5"],
  ["三", "さん", "three", "N5"], ["枚", "まい", "counter: flat things", "N4"],
  ["冊", "さつ", "counter: books", "N3"], ["度", "ど", "time; degree", "N4"],
  ["去年", "きょねん", "last year", "N4"], ["紙", "かみ", "paper", "N4"],
  // —— v4 additions: composition titles, word order, primer support ——
  ["作文", "さくぶん", "composition; writing", "N3"], ["語順", "ごじゅん", "word order", "N2"],
  ["説明", "せつめい", "explanation", "N3"], ["計画", "けいかく", "plan", "N3"],
  ["日", "ひ", "day", "N5"], ["場所", "ばしょ", "place", "N3"],
  ["得意", "とくい", "good at (about yourself)", "N3"], ["好", "この", "like; preference", "N5"],
  ["言", "い", "say", "N5"], ["理由", "りゆう", "reason", "N3"],
  ["文", "ぶん", "sentence", "N4"], ["一文", "いちぶん", "one sentence", "N4"],
  // —— v5 additions: verb pairs, potential/passive, quoting, conditionals, orthography ——
  ["自動詞", "じどうし", "intransitive verb", "N2"], ["他動詞", "たどうし", "transitive verb", "N2"],
  ["可能形", "かのうけい", "potential form", "N2"], ["受身形", "うけみけい", "passive form", "N2"],
  ["漢字", "かんじ", "kanji", "N4"], ["会議", "かいぎ", "meeting", "N3"],
  ["会社", "かいしゃ", "company", "N4"], ["電気", "でんき", "electricity; the lights", "N4"],
  ["電話", "でんわ", "telephone", "N5"], ["止", "と", "stop", "N4"],
  ["出", "で", "exit; go out", "N5"], ["消", "け", "turn off; erase", "N3"],
  ["少", "すこ", "a little", "N5"], ["早", "はや", "early; fast", "N5"],
  ["熱", "あつ", "hot (to the touch)", "N3"], ["合", "あ", "fit; match", "N3"],
  ["変", "か", "change", "N4"], ["綺麗", "きれい", "pretty; clean", "N2"],
  ["思", "おも", "think", "N4"], ["多", "おお", "many", "N4"],
  ["押", "お", "push", "N3"], ["着", "つ", "arrive; wear", "N4"],
  // Added Aug 2 2026 — the four runs that rendered "not in dictionary" when
  // tapped in bank words (found by build-word-ledger.py + a scanDict sweep).
  // AI-authored display data, pending reviewer sign-off like the rest.
  ["一緒", "いっしょ", "together", "N5"], ["前", "まえ", "before; in front", "N5"],
  ["急", "いそ", "hurry", "N4"], ["下", "した", "under; below", "N5"],
  // —— v6 additions: Step 14 (giving, receiving & kindness) ——
  ["手伝", "てつだ", "help", "N4"], ["教", "おし", "teach; tell", "N5"],
  ["お土産", "おみやげ", "souvenir", "N4"], ["直", "なお", "fix; correct", "N3"],
  ["京都", "きょうと", "Kyoto", "N5"], ["動詞", "どうし", "verb", "N2"],
  // —— v7 additions: Step 15 (guessing, seeming & hearsay) ——
  ["空", "そら", "sky", "N4"], ["暗", "くら", "dark", "N4"],
  ["違", "ちが", "differ; be wrong", "N4"], ["落ち", "お", "fall (on its own)", "N3"],
  ["春", "はる", "spring", "N4"],
  // —— v8 additions: Step 17 (intentions, decisions & change) ——
  ["来年", "らいねん", "next year", "N5"], ["来月", "らいげつ", "next month", "N5"],
  ["毎朝", "まいあさ", "every morning", "N5"], ["予定", "よてい", "schedule; plan", "N3"],
  ["靴", "くつ", "shoes", "N4"], ["脱", "ぬ", "take off (shoes, clothes)", "N3"],
  ["決", "き", "decide", "N3"],
  ["時々", "ときどき", "sometimes", "N5"], ["日曜日", "にちようび", "Sunday", "N5"],
  ["字", "じ", "character; handwriting", "N4"],
  ["夏休み", "なつやすみ", "summer break", "N4"], ["先月", "せんげつ", "last month", "N5"],
  ["授業", "じゅぎょう", "class; lesson", "N4"], ["間", "あいだ", "interval; while", "N4"],
  ["出す", "だす", "submit; put out", "N4"], ["払", "はら", "pay", "N4"],
  ["答", "こた", "answer", "N4"], ["掃除", "そうじ", "cleaning", "N4"], ["山", "やま", "mountain", "N5"],
  ["今度", "こんど", "next time", "N5"], ["壊", "こわ", "break", "N3"], ["試合", "しあい", "match; game", "N3"],
  ["言葉", "ことば", "word; language", "N4"], ["質問", "しつもん", "question", "N3"],
  ["飼", "か", "keep (a pet)", "N3"],
];
const DICT_SORTED = [...KANJI_DICT].sort((a, b) => b[0].length - a[0].length);
// Live learner state, shared with the kanji module (known-kanji-v1) and the
// hiragana module (hiragana-progress-v2). The old hardcoded N5_KANJI string
// froze kanji knowledge at build time; this reads what the learner has
// actually finished. "KNOWN" means *this learner can read it* — a different
// fact from "this kanji is N5-level", and the only one that matters here.
let KNOWN_KANJI = new Set();
// Furigana is worthless to someone who has to decode it, so ruby only renders
// once the hiragana module's final checkpoint (cp2) has been reached.
let KANA_FLUENT = false;
async function loadIntegrationState() {
  try {
    const r = await window.storage.get("known-kanji-v1");
    const v = r ? JSON.parse(r.value) : [];
    KNOWN_KANJI = new Set(Array.isArray(v) ? v : []);
  } catch { KNOWN_KANJI = new Set(); }
  try {
    const r = await window.storage.get("hiragana-progress-v2");
    const p = r ? JSON.parse(r.value) : {};
    KANA_FLUENT = !!(p && p.cp2 && Object.keys(p.cp2).length);
  } catch { KANA_FLUENT = false; }
}
const KANJI_RE = /[\u3400-\u9FFF々]/;
const BRACKET_RE = /【([^|】]+)\|([^】]+)】/;
const stripB = (t) => (t || "").replace(/【([^|】]+)\|[^】]+】/g, "$1");
function levelForWord(word) {
  for (const ch of word) { if (KANJI_RE.test(ch) && !KNOWN_KANJI.has(ch)) return "LATER"; }
  return "KNOWN";
}
function scanDict(text, out) {
  let i = 0;
  while (i < text.length) {
    let hit = null;
    for (const e of DICT_SORTED) { if (text.startsWith(e[0], i)) { hit = e; break; } }
    // Dictionary entries carry a JLPT level in slot 3; replace it with the
    // learner-relative tag so display and popup reflect what *they* can read.
    if (hit) { out.push({ entry: [hit[0], hit[1], hit[2], levelForWord(hit[0])] }); i += hit[0].length; continue; }
    const ch = text[i];
    if (KANJI_RE.test(ch)) {
      // Unknown kanji run: never let it pass silently.
      let run = ch; i++;
      while (i < text.length && KANJI_RE.test(text[i])) { run += text[i]; i++; }
      out.push({ entry: [run, "—", "Not in the prototype dictionary yet", "UNK"] });
      continue;
    }
    if (out.length && out[out.length - 1].t !== undefined) out[out.length - 1].t += ch;
    else out.push({ t: ch });
    i++;
  }
}
function annotate(text) {
  const out = [];
  let rest = text;
  while (rest) {
    const m = rest.match(BRACKET_RE);
    if (!m) { scanDict(rest, out); break; }
    if (m.index > 0) scanDict(rest.slice(0, m.index), out);
    out.push({ entry: [m[1], m[2], "", levelForWord(m[1])] });
    rest = rest.slice(m.index + m[0].length);
  }
  return out;
}
// Annotate instead of substituting: an untaught kanji keeps its written form
// and wears its reading as ruby, so 食べます is visible from day one and simply
// loses the furigana once 食 is learned. Returns a string, or {ruby, rt}.
function wordDisplay(entry, mode) {
  const [kj, kana, , lvl] = entry;
  if (lvl === "UNK") return kj;
  if (mode === "kana" || !KANA_FLUENT) return kana; // pre-kana learners only
  if (lvl === "KNOWN") return kj;                   // plain kanji
  return { ruby: kj, rt: kana };                    // kanji + furigana
}
const dispText = (d) => (d && typeof d === "object" ? d.ruby : d);
function DispSpan({ d }) {
  return d && typeof d === "object"
    ? <ruby>{d.ruby}<rt style={{ fontSize: ".5em", color: T.sub }}>{d.rt}</rt></ruby>
    : <>{d}</>;
}
function JPText({ text, mode, onTap }) {
  if (!text) return null;
  return (
    <span>
      {annotate(text).map((sg, i) =>
        sg.entry ? (
          <span
            key={i}
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); onTap && onTap(sg.entry); }}
            onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); onTap && onTap(sg.entry); } }}
            style={{ borderBottom: `1px dashed ${sg.entry[3] === "KNOWN" ? T.sub : T.note}`, cursor: "pointer" }}
          >
            <DispSpan d={wordDisplay(sg.entry, mode)} />
          </span>
        ) : (
          <span key={i}>{sg.t}</span>
        )
      )}
    </span>
  );
}

// ————— N5 grammar curriculum (+1 N4 stress-test module) —————
// NOTE: all content below is AI-authored and pending native-speaker review.
const CURRICULUM = [
  {
    cat: "Step 0 · Before any Japanese",
    level: "S1",
    bank: [],
    points: [
      {
        id: "prim-shape", jp: "Backwards, but consistently", en: "how a Japanese sentence is put together", kind: "primer",
        exp: {
          what: "Japanese is not scrambled English. It's English run in a different order — and the order is completely consistent, which means three rules cover most of the shock. You can meet all three before learning a single Japanese word, so everything below is in English, arranged the way Japanese arranges it.",
          build: "One: the verb goes last. Always, no exceptions, however long the sentence gets. Two: the little connecting words come after the thing they connect, not before — English says \"in Tokyo,\" Japanese says \"Tokyo-in.\" Three: anything that describes something goes in front of it, including entire clauses. English says \"the book I bought yesterday.\" Japanese says \"the yesterday-I-bought book.\"",
          when: "Read the examples below out loud. They look ridiculous in English and they are precisely correct in Japanese. The point is that your first real sentence should feel familiar rather than impossible.",
          watch: "Rule one has a delightful consequence: the last word decides everything. Tense, politeness, whether it's a question, and — best of all — whether the whole sentence is negative. \"I to the party go…\" is not yet a finished thought, because \"…not\" might still be coming. There is a reason Japanese listeners are famously patient.",
        },
        ex: [
          ["I coffee drink.", "= I drink coffee. The verb comes last."],
          ["I Tokyo-in live.", "= I live in Tokyo. The \"in\" attaches behind Tokyo, not in front of it."],
          ["Yesterday friend-with movie watched.", "= Yesterday I watched a movie with a friend."],
          ["The yesterday-I-bought book interesting was.", "= The book I bought yesterday was interesting."],
          ["You student are — ?", "= Are you a student? Nothing moves around; a question marker is added at the end."],
          ["I to the party go… not.", "= I'm not going to the party. You genuinely have to wait for it."],
        ],
      },
      {
        id: "prim-drop", jp: "Half of it isn't there", en: "what Japanese leaves out", kind: "primer",
        exp: {
          what: "English demands a subject in every sentence, even when the subject means nothing at all — \"it\" is raining, \"there\" is a book on the desk. Nobody can point to that \"it.\" Japanese has no such requirement. If everyone already knows who or what you mean, it simply isn't said, and the sentence is finished without it.",
          build: "Nothing to build — this is a rule about what you leave out. \"Delicious was\" is a whole, grammatical, entirely unremarkable Japanese sentence.",
          when: "Constantly. Most Japanese sentences you will hear contain no visible subject whatsoever. The moment you stop supplying one out of habit, your writing gets noticeably better.",
          watch: "Saying \"I\" in every sentence is the single loudest tell of an English speaker writing Japanese. It isn't wrong so much as strange — a native speaker includes it to draw a contrast, and otherwise doesn't bother. There's a whole lesson on this later; for now, just notice how little is missing from the examples below.",
        },
        ex: [
          ["Coffee drink.", "= I drink coffee. Who? You. Obviously."],
          ["Delicious was.", "= It was delicious. Two words, complete sentence, nobody confused."],
          ["Tomorrow go? — Go.", "= Are you going tomorrow? — Yes, I am. An entire exchange with no people in it."],
        ],
      },
    ],
  },
  {
    cat: "Step 1 · Your first sentences",
    level: "S1",
    bank: [["学生", "student"], ["先生", "teacher"], ["本", "book"], ["水", "water"], ["今日", "today"], ["天気", "weather"], ["犬", "dog"], ["日本人", "Japanese person"]],
    points: [
      {
        id: "desu", jp: "〜です / だ", en: "how to say what something is",
        exp: {
          what: "Japanese has no verb quite like English \"is.\" Instead, です sits at the end of a sentence and says: that's the statement, and I'm saying it politely. 私は学生です is closer to \"me — student — politely\" than to \"I am a student.\"",
          build: "Put です at the very end, after a noun or an adjective. だ is the same word without the politeness, used with close friends. In relaxed speech people often drop だ entirely and just let the noun stand.",
          when: "Identifying, describing, stating a plain fact. です is the safe adult default — strangers, staff, teachers, work.",
          watch: "です does not mean \"exists.\" \"There is a book on the desk\" needs あります (Step 8), not です. And です never attaches to an ordinary verb: 食べるです isn't a thing.",
        },
        ex: [["私は学生です。", "I am a student."], ["これは本だ。", "This is a book."]],
      },
      {
        id: "kosoado", jp: "これ・それ・あれ / この・その・あの", en: "this, that, that over there",
        exp: {
          what: "English splits pointing two ways, this and that. Japanese splits it three, by who the thing is near: これ is by me, それ is by you, あれ is away from both of us.",
          build: "Two sets, and mixing them up is the classic error. これ・それ・あれ stand alone in place of a noun: これは本です. この・その・あの must be followed by a noun: この本は高いです. どれ and どの are the \"which\" versions.",
          when: "Shopping, pointing, choosing — and constantly in conversation, where それ means \"that thing you just said\" rather than anything physical.",
          watch: "これ本です is wrong; これ can't lean on a noun, so it's この本です or これは本です. The three-way split is genuinely about the listener, not just distance — something in your hands is それ even if you're sitting together.",
        },
        ex: [["これは私の本です。", "This is my book. (near me)"], ["その店は安いですよ。", "That shop is cheap. (near you, or one you mentioned)"]],
      },
      {
        id: "sb-kosoado", jp: "こそあど · 三方向", en: "three directions, two sets", kind: "skill",
        exp: {
          what: "English points two ways; Japanese points three, and then doubles the system: これ・それ・あれ stand alone, この・その・あの must hold a noun. Two choices in every act of pointing, and both run on instinct in your first language — which is exactly why they need a drill in this one.",
          build: "Choose the distance first: near me → こ, near you → そ, away from both of us → あ. Then choose the set: naming the thing itself, bare (これ); pointing at a noun you're about to say, +の (この本). The ど row — どれ, どの — asks the same two questions as a question.",
          when: "Every act of pointing, and half of conversation — where それ mostly means 'the thing you just said' rather than anything in the room.",
          watch: "The two errors are mirror images. これ本です — a bare pointer leaning on a noun it cannot hold. And あの for anything far from YOU — but あ means far from both of you; something in your listener's hands is それ however far away they're standing. Distance is measured from the pair of you, not from your arm.",
        },
        ex: [["この本は高いです。", "Holding a noun → この."], ["それは何ですか。", "Near the listener, standing alone → それ."], ["あれは学校です。", "Away from both of us → あれ."]],
      },
      {
        id: "janai", jp: "〜じゃないです / ではありません", en: "saying it isn't",
        exp: {
          what: "The \"no, it isn't\" partner of です.",
          build: "Noun + じゃないです (conversational) or + ではありません (formal, and what you'll see in writing). The plain version, for friends, is just じゃない. ではない is the same word as じゃない in its dressed-up spelling.",
          when: "Correcting someone, denying something, softening a claim.",
          watch: "This negative is only for nouns and な-adjectives. い-adjectives negate on their own — 高い becomes 高くない, never 高いじゃない (Step 9). Learners mix these two systems constantly.",
        },
        ex: [["これは水じゃないです。", "This is not water."], ["彼は先生ではありません。", "He is not a teacher."]],
      },
      {
        id: "deshita", jp: "〜でした", en: "saying what something was",
        exp: {
          what: "です moved into the past.",
          build: "です → でした. For the past negative: じゃなかったです, or the formal ではありませんでした.",
          when: "Describing how something or someone was — yesterday's weather, last week's schedule, a past job.",
          watch: "Again, nouns and な-adjectives only. 寒いでした is wrong; い-adjectives carry their own past tense (寒かったです).",
        },
        ex: [["昨日は雨でした。", "Yesterday it was rainy."], ["先週は休みでした。", "Last week was a holiday."]],
      },
      {
        id: "ka", jp: "〜か", en: "turning a statement into a question",
        exp: {
          what: "か is a spoken question mark. It's a word, not punctuation, and it does the whole job on its own.",
          build: "Add か to the very end: ですか, ますか. Nothing else moves. Japanese has no equivalent of English flipping \"you are\" into \"are you\" — the word order of the statement stays exactly as it was.",
          when: "Any polite question.",
          watch: "Two habits surprise people. In writing, Japanese usually ends a か-question with 。 rather than ？. And in casual speech か is dropped altogether — you just raise your pitch: 学生？",
        },
        ex: [["これは何ですか。", "What is this?"], ["田中さんは学生ですか。", "Is Tanaka-san a student?"]],
      },
      { id: "cc-yes", jp: "はい・ええ・そうです", en: "how to say yes, in more ways than one", kind: "culture",
        exp: "Japanese has no single word doing what English 'yes' does — it has a repertoire, and each member has a register. はい is the polite workhorse (it's also 'present!' at roll call, and 'go on' while listening — more on that much later). ええ is はい's softer cousin, common in relaxed polite speech. うん is casual, for friends, and its refusal twin ううん is a different pitch of the same hum.\n\nそうです is the agreeing yes: 'that's so.' 学生ですか。— そうです。 It agrees with a statement rather than answering a request, and そうですね adds thinking-time — you'll hear it open half of all answers, meaning something between 'yes' and 'let me see'. そう has other jobs waiting in Stage 2; this everyday one comes first.\n\nBut the most native yes of all is none of these: repeat the predicate. 学生ですか。— はい、学生です。 Echoing the verb back is what full agreement actually sounds like, and it works when nothing else quite does.\n\nOne warning to bank now: with NEGATIVE questions, はい agrees with the negative. 学生じゃないですか。— はい means 'correct — not a student', exactly where English says no. Japanese yes/no tracks the statement, not the underlying fact. File it; the very next lesson is that drill.",
        ex: [["学生ですか。— はい、学生です。", "The most native yes: echo the predicate."], ["いい店ですね。— そうですね。", "Agreeing with a statement — and buying a half-second to think."]],
      },
      {
        id: "sb-negq", jp: "「学生じゃないですか」—「はい」", en: "yes means you're right, no means you're wrong", kind: "skill",
        exp: {
          what: "The drill the last lesson promised. English yes/no answers report the FACT: 'Aren't you a student?' — 'Yes' means I am one, however the question was phrased. Japanese はい/いいえ report on the STATEMENT: はい means 'what you said is correct', いいえ means 'what you said is wrong'. With positive questions the two systems agree, so the wiring difference hides. Negative questions expose it.",
          build: "学生じゃないですか — you're not a student? はい、学生じゃないです: yes-your-statement-is-right, I'm NOT one. いいえ、学生です: no-your-statement-is-wrong, I AM one. Both answers sit exactly opposite the English instinct.",
          when: "Negative questions are everywhere in polite speech precisely because they soften: 行きませんか, 高くないですか, 疲れていませんか. Every one of them is a small trap for this wiring.",
          watch: "The reliable escape while the reflex builds: skip the particle and answer with the predicate. 学生じゃないですか — 学生です。 No はい, no いいえ, no ambiguity, completely natural. Native speakers do this constantly for the same reason. And when you do use はい, say the full echo after it — the echo keeps you honest, because you can hear whether it matches what you meant.",
        },
        ex: [["学生じゃないですか。— はい、学生じゃないです。", "はい agrees with the STATEMENT: right, not a student."], ["学生じゃないですか。— いいえ、学生です。", "いいえ rejects the statement: wrong — I am one."], ["行きませんか。— 行きます！", "The escape hatch: answer with the predicate and skip the particle entirely."]],
      },
      {
        id: "qwords", jp: "何・誰・どこ・いつ・どう", en: "the question words",
        exp: {
          what: "The word that asks the question sits exactly where the answer would sit. Japanese doesn't haul it to the front of the sentence the way English does.",
          build: "何 what, 誰 who, どこ where, いつ when, どう how, いくら how much, どうして why. Drop one into the slot you want filled and close with か: 誰が来ましたか。 The statement 田中さんが来ました becomes the question by swapping 田中さん for 誰 — nothing else moves.",
          when: "Every question that isn't a yes/no question.",
          watch: "Question words take が, never は — 誰が来ましたか, never 誰は. And 何 has two readings depending on what follows it: なん before です and counters (何ですか, 何人), なに before を and most particles (何を食べますか). Nobody teaches the rule because native speakers absorb it; copy the examples until it settles.",
        },
        ex: [["これは何ですか。", "What is this?"], ["いつ日本へ来ましたか。", "When did you come to Japan?"], ["どこで買いましたか。", "Where did you buy it?"]],
      },
      {
        id: "ne", jp: "〜ね", en: "inviting agreement",
        exp: {
          what: "ね turns a statement into \"…right?\" It hands the thought to the listener and asks them to nod along.",
          build: "Tack ね onto the end of a finished sentence.",
          when: "Small talk and shared observations — the weather, the food, the room. It's one of the most common sounds in daily Japanese, and it does real social work: it says we're on the same page.",
          watch: "ね assumes the listener already knows or feels the same. Announcing something genuinely new with ね sounds off — that job belongs to よ.",
        },
        ex: [["今日は暑いですね。", "It's hot today, isn't it?"], ["いい天気ですね。", "Nice weather, isn't it?"]],
      },
      {
        id: "yo", jp: "〜よ", en: "flagging news",
        exp: {
          what: "よ marks what you're saying as new to the listener: heads up, you didn't know this.",
          build: "Add よ to the end. よね combines both particles — \"it's X, isn't it\" — and is extremely common.",
          when: "Correcting a wrong assumption, offering useful information, reassuring someone.",
          watch: "よ can land as pushy or lecturing if the listener already knew. When unsure, leave it off — a bare です is never rude, while a misplaced よ can be.",
        },
        ex: [["この店は安いですよ。", "This shop is cheap, you know."], ["明日は休みですよ。", "Tomorrow is a day off, you know."]],
      },
      {
        id: "sb-yone", jp: "ね・よ・よね", en: "the tuning particles", kind: "skill",
        exp: {
          what: "English does this entire system with tone of voice, so nothing in your first language tells you which particle you need. The choice is social, not grammatical: ね hands the thought over for agreement, よ delivers news, よね states a belief while asking for backup.",
          build: "Same sentence, three settings. 暑いですね — we both feel it; nod along. 暑いですよ — you clearly haven't been outside yet. 暑いですよね — I'm fairly sure; back me up. The order in よね is fixed: there is no ねよ.",
          when: "Constantly — these three end an enormous share of spoken sentences. Choosing none is itself a setting: a bare です states a fact and asks nothing of anyone.",
          watch: "The mistake that lands worst is よ about the listener's own experience — 疲れていますよ tells someone how they feel, exactly as presumptuous as it sounds in English. When unsure: ね if you're sharing, nothing if you're not. A misplaced ね is friendly noise; a misplaced よ is a small shove.",
        },
        ex: [["暑いですね。", "Shared — we both feel it."], ["この店、安いですよ。", "News — you didn't know."], ["明日は休みですよね。", "Fairly sure — back me up?"]],
      },
      {
        id: "cc-greetings", jp: "あいさつ in real life", en: "greetings people actually use", kind: "culture",
        exp: {
          what: "Textbooks open with こんにちは, but daily life runs on situational greetings instead — phrases tied to a moment rather than a time of day.",
          when: "お疲れさまです carries most of working life: arriving, leaving, passing someone in the hallway, ending a call. どうも is a light all-purpose hello and thank-you. いってきます and ただいま bracket leaving and returning home.",
          watch: "Recognize these first; producing them comes naturally later. The one to avoid overusing is こんにちは — with colleagues you see daily, it can sound oddly formal.",
        },
        ex: [["お疲れさまです。", "Standard work greeting — arriving, leaving, passing in the hallway."], ["いってきます。— いってらっしゃい。", "'I'm off' — 'Take care.' Every morning, every home."]],
      },
      {
        id: "b-s1", jp: "作文 · じこしょうかい", en: "introduce yourself", kind: "build",
        requires: ["desu", "ka", "kosoado", "qwords"],
        brief: "Introduce yourself in two or three sentences, then ask the other person one question back. You have no verbs yet — that's fine. です does more work than you would think.",
        exp: {
          what: "Your first composition, assembled from almost nothing. Step 1 gave you a way to say what something is, a way to deny it, a way to ask, and a way to point. That is already a conversation.",
          build: "Two or three statements plus one question, all in です form. Short is correct here.",
          when: "The actual first thirty seconds of meeting anyone in Japanese.",
          watch: "Nothing should be doing anything yet — this is all naming and identifying. If you catch yourself reaching for \"I went\" or \"I like,\" park it. Step 4 is coming and it is worth the wait.",
        },
        ex: [],
      },
    ],
  },

  {
    cat: "Step 2 · Core particles",
    level: "S1",
    bank: [["学校", "school"], ["駅", "station"], ["友達", "friend"], ["電車", "train"], ["映画", "movie"], ["公園", "park"], ["朝ごはん", "breakfast"], ["図書館", "library"]],
    points: [
      {
        id: "wa", jp: "は", en: "setting the topic",
        exp: {
          what: "は sets the stage. It says \"here's what I'm talking about\" — and everything after it is a comment on that thing. It is not a subject marker, and it does not mean \"is.\"",
          build: "Place は directly after the thing you're putting on stage. It's written with the character は but pronounced wa. This spelling quirk applies only to the particle, never to は inside a word.",
          when: "Opening a conversation, changing subject, or drawing a contrast between two things.",
          watch: "Because English collapses \"I am a student\" into one verb, learners read 私は as \"I am.\" It isn't. In 私は学生です, は sets the topic and です makes the statement — two separate jobs.",
        },
        ex: [["私は学生です。", "I am a student."], ["この店は安いです。", "As for this shop, it's cheap."]],
      },
      {
        id: "ga", jp: "が", en: "pointing at who or what",
        exp: {
          what: "が points at the one doing or being something — it answers \"who?\" or \"which one?\"",
          build: "[noun] が [verb or adjective].",
          when: "Three main situations: introducing something for the first time, answering a who/what question, and with a fixed set of words that demand it (ある, いる, 好き, わかる — Step 10).",
          watch: "Both は and が sit where English puts the subject, so they feel interchangeable at first. They aren't. Quick test: if your sentence answers \"which one?\", use が. If it just names what you're discussing, use は. The next lesson takes this apart properly.",
        },
        ex: [["公園に犬がいます。", "There's a dog in the park."], ["誰が来ましたか。", "Who came?"]],
      },
      {
        id: "sb-waga", jp: "は vs が", en: "the real difference", kind: "skill",
        exp: {
          what: "The single most-asked question in beginner Japanese, and it has a workable answer: は is for information already on the table, が is for information arriving now.",
          build: "Introduce something with が, then refer back to it with は. That handoff is the pattern in miniature.",
          when: "Any time you're unsure, run the question test. \"Who came?\" and its answer both take が, because the whole point of the sentence is identifying which person. \"How was the movie?\" takes は, because the movie is already what you're discussing.",
          watch: "Don't try to translate them. English marks new versus known information with \"a\" and \"the,\" and with stress — Japanese does it with these two particles instead. Thinking of が as roughly \"a\" and は as roughly \"the\" gets you surprisingly far.",
        },
        ex: [["昨日、猫が来ました。その猫はとても小さかったです。", "A cat came yesterday (new → が). The cat was tiny (now known → は)."], ["誰が来ましたか。— 田中さんが来ました。", "Who came? — Tanaka-san did. (Who/what questions and their answers → が)"]],
      },
      {
        id: "o", jp: "を", en: "marking what the action lands on",
        exp: {
          what: "を tags the thing an action is done to. Eat what? Read what? Buy what? That noun takes を.",
          build: "[thing] を [verb]. Written with the character を, which exists for nothing else, and pronounced exactly like お.",
          when: "With any verb that acts on something: 食べる, 読む, 買う, 見る, 作る.",
          watch: "Not every English object becomes を. 好き, ほしい, わかる and できる all take が instead — a mismatch that catches every English speaker, and one Step 10 drills specifically.",
        },
        ex: [["パンを食べます。", "I eat bread."], ["映画を見ました。", "I watched a movie."]],
      },
      {
        id: "ni-time", jp: "に (time)", en: "pinning an action to a time",
        exp: {
          what: "に fixes an action to a specific point on the clock or calendar.",
          build: "[time] に [verb].",
          when: "Times you could write as a number: 七時に, 月曜日に, 三月に, 十日に.",
          watch: "This is the one worth memorizing. に does NOT attach to relative time words — 今日, 明日, 昨日, 毎日, 来週, 今. 明日に行きます is wrong; 明日行きます is right. The rule of thumb: if a number is involved, use に; if the word only makes sense relative to right now, leave it bare.",
        },
        ex: [["七時に起きます。", "I get up at seven."], ["明日、友達に会います。", "I'll meet a friend tomorrow. (no に on 明日)"]],
      },
      {
        id: "ni-dest", jp: "に / へ (destination)", en: "saying where you're going",
        exp: {
          what: "Both mark where movement is headed.",
          build: "[place] に or へ, followed by a movement verb — 行く, 来る, 帰る. へ is written with the character へ but pronounced e, the same spelling quirk as は.",
          when: "Any journey. In practice the two are interchangeable for travel; に is more common in speech, へ has a slightly softer, more directional feel.",
          watch: "Don't reach for で here. で covers what you do once you've arrived, not the going: 学校に行きます, then 学校で勉強します. The next-but-one lesson pairs them up.",
        },
        ex: [["学校に行きます。", "I go to school."], ["日本へ来ました。", "I came to Japan."]],
      },
      {
        id: "sb-kanaparticles", jp: "は・へ・を", en: "when a kana stops sounding like itself", kind: "skill",
        exp: {
          what: "Three particles are written with kana that stop sounding like themselves: は reads wa, へ reads e, and を reads o. The kana module planted this before you knew what a particle was — this is where it lands, because now you own all three as grammar.",
          build: "The rule is mercifully clean: the special reading applies ONLY when the kana is working as a particle. はな (flower) reads hana; the は in 私は reads wa. を is the easy one — it exists for nothing except the particle, so it is always o.",
          when: "Every sentence you read aloud, and every sentence you type. The IME expects the spelling, not the sound: type 'ha' for the particle は and 'wo' for を — typing 'wa' gets you わ, which is the single most common romaji-input slip there is.",
          watch: "One sentence can carry the same kana both ways: はなはきれいです — the first は belongs to hana, the second is the particle, wa. Reading aloud is where this shows; writing わたしわ is how it shows in the other direction.",
        },
        ex: [["私は学校へ行きます。", "Read watashi wa gakkō e — two spelling quirks in one short sentence."], ["はなはきれいです。", "Same kana twice, read two ways — the second は is the particle."]],
      },
      {
        id: "de-place", jp: "で (place)", en: "where the action happens",
        exp: {
          what: "で marks the stage an action is performed on.",
          build: "[place] で [action verb].",
          when: "Studying, eating, working, playing, meeting — anything you actively do, somewhere.",
          watch: "で needs a real action. Simply being somewhere isn't one: that's に with あります/います. Two lessons from now you'll drill the split.",
        },
        ex: [["図書館で勉強します。", "I study at the library."], ["公園で友達に会いました。", "I met a friend in the park."]],
      },
      {
        id: "de-means", jp: "で (means)", en: "the tool you did it with",
        exp: {
          what: "Same particle, different job — で also marks the instrument, vehicle, language, or material used.",
          build: "[thing] で [verb].",
          when: "バスで行きます, 日本語で話します, 手で書きます, はしで食べます.",
          watch: "For a person you did something with, use と, not で: 友達と行きます. で would suggest you used your friend as a tool.",
        },
        ex: [["バスで行きます。", "I go by bus."], ["日本語で話します。", "I speak in Japanese."]],
      },
      {
        id: "sb-nide", jp: "に vs で", en: "place: existing vs doing", kind: "skill",
        exp: {
          what: "Both translate as \"at\" or \"in,\" which is exactly why they get swapped. The split isn't about the place — it's about the verb.",
          build: "で goes with verbs of doing. に goes with verbs of being: あります, います, 住んでいる, and with destinations after movement verbs.",
          when: "Ask one question before choosing: is something happening here, or is something simply located here? Happening → で. Located → に.",
          watch: "Same building, either particle, depending on the verb. 図書館で勉強します and 図書館に本があります are both correct — the place didn't change, the verb did. The split isn't finished, either — it returns in Step 8, when あります and います give 'being somewhere' a verb of its own, and bring one surprise with them.",
        },
        ex: [["図書館で勉強します。", "I study at the library. (action → で)"], ["図書館に本がたくさんあります。", "There are many books in the library. (existence → に)"]],
      },
      {
        id: "b-s2a", jp: "作文 · 一文に全部", en: "four particles, one sentence", kind: "build",
        requires: ["wa", "o", "ni-time", "de-place"],
        brief: "Write one sentence containing all four: a topic, a time, a place where something happened, and the thing the action landed on. Then write a second sentence that changes only the place.",
        exp: {
          what: "Particles are easy one at a time and slippery in combination, because each is competing for the same slot your brain has labelled \"preposition.\" This is the drill that pulls them apart.",
          build: "One sentence using all four, then a near-copy with a single element swapped. The second sentence is the real test — it proves the first wasn't luck.",
          when: "Every sentence you will ever write. There is no Japanese without particles.",
          watch: "に and で are the pair that collapse into each other. If something is happening, it's で. If something simply is somewhere, it's に. And に does not touch 今日, 明日 or 毎日, however much it would like to.",
        },
        ex: [],
      },
    ],
  },
  {
    cat: "Step 3 · Joining, choosing & counting",
    level: "S2",
    bank: [["パン", "bread"], ["牛乳", "milk"], ["肉", "meat"], ["魚", "fish"], ["妹", "younger sister"], ["家", "house, home"], ["日本語", "Japanese language"], ["月曜日", "Monday"]],
    points: [
      {
        id: "to-and", jp: "と (and / with)", en: "joining nouns, naming your companion",
        exp: {
          what: "と does two jobs: it links nouns into a list, and it marks who you did something alongside.",
          build: "A と B for lists. [person] と [verb] for companionship.",
          when: "Shopping lists, pairs of things, and anyone you went somewhere with.",
          watch: "と joins nouns only — never two sentences, never two adjectives. \"I ate and went home\" needs the て-form (Step 4), not と. And と implies your list is complete; for \"and so on,\" you'll want や, coming up shortly.",
        },
        ex: [["パンと牛乳を買いました。", "I bought bread and milk."], ["友達と映画を見ます。", "I watch a movie with a friend."]],
      },
      {
        id: "mo", jp: "も", en: "also, too, neither",
        exp: {
          what: "も says \"this one as well\" — adding something to what's already been said.",
          build: "も pushes は, が and を out and takes their place. After other particles it simply stacks on top: 日本にも, 友達とも.",
          when: "Agreeing, adding to a list, and — paired with a negative — saying \"neither… nor.\"",
          watch: "私はも and 本をも are both wrong. When も arrives, は, が and を leave.",
        },
        ex: [["私も学生です。", "I am also a student."], ["肉も魚も食べません。", "I eat neither meat nor fish."]],
      },
      {
        id: "no", jp: "の (possession)", en: "gluing two nouns together",
        exp: {
          what: "の connects one noun to another: of, 's, from, about, made of. It's the most flexible particle you'll meet.",
          build: "A の B, where B is the main thing and A describes it. 日本語の先生 is a teacher of Japanese, not a Japanese-language teacher who happens to be Japanese. Chains are fine: 私の学校の先生.",
          when: "Possession, affiliation, origin, topic, material — whenever two nouns need joining.",
          watch: "The order reverses several English phrasings, so read it as \"B of A\" while it's still new. の can also stand in for a noun you've already established: 赤いの means \"the red one.\"",
        },
        ex: [["私の本です。", "It's my book."], ["日本語の先生です。", "He's a Japanese language teacher."]],
      },
      {
        id: "sb-no", jp: "の · 一人四役", en: "one particle, four jobs", kind: "skill",
        exp: {
          what: "English has no single word doing what の does, so your instinct has nothing to map it onto — which is exactly why it gets a drill of its own. Count the jobs: possession (私の本), description (日本語の先生), standing in for a noun you already named (赤いの — the red one), and a fourth — turning whole verbs into nouns — that arrives in Step 10.",
          build: "A の B — B is the main thing, A describes it. Read it as 'B of A' while it's new. For the stand-in job, drop the noun and keep の: 赤いのをください.",
          when: "Whenever two nouns need connecting, and whenever repeating a noun would be clumsy. Japanese reaches for の far more often than English reaches for 'of'.",
          watch: "The classic overreach: の does NOT attach describing-words to nouns. きれいの人 is wrong — words like きれい bring their own connector (きれいな人), and words like 高い attach directly (高い店). If both sides aren't nouns, の isn't the glue; the two describing-word families get their full lessons in Step 9. Long chains unwind from the right: 私の日本語の先生の本 — the book of the teacher of my Japanese.",
        },
        ex: [["私の日本語の先生の本です。", "Chains unwind from the right: my Japanese teacher's book."], ["赤いのをください。", "の standing in for the noun: the red one, please."], ["きれいな人です。", "NOT きれいの人 — describing-words bring their own connector."]],
      },
      { id: "cc-n", jp: "ん", en: "の in a hurry", kind: "culture",
        exp: "Spoken Japanese compresses の to ん constantly, and one pattern carries most of it: 〜んです. どうしたんですか — what's going on? 高いんです — the thing is, it's expensive. The ん adds a flavour English handles with tone of voice: this is an explanation; there's context behind it.\n\nYou don't have to produce it yet. You do have to recognize it, because real speech hands it to you in the first minute: 行くんですか。忙しいんです。 And the bare の on the end of a casual question — なんで来ないの？ — is the same particle, uncompressed.\n\nTwo anchors to keep. In writing and formal speech the full のです survives. And after nouns, a な steps in first: 学生なんです, never 学生んです — that な will matter again when the explanation pattern gets its full lesson later.",
        ex: [["どうしたんですか。", "What's going on? — the ん marks it as asking for the story."], ["学生なんです。", "Nouns take な before ん: I'm a student, you see."]],
      },
      {
        id: "sb-pronouns", jp: "私・あなたを省く", en: "when to drop pronouns", kind: "skill",
        exp: {
          what: "English requires a subject in every clause. Japanese doesn't — and leaves it out whenever context makes it obvious. Sentences with no visible subject at all are the norm, not an abbreviation.",
          build: "Just delete it. If it's clear who you're talking about, the sentence is finished without a pronoun.",
          when: "Keep 私 only for genuine contrast, or when introducing yourself as a new topic. For other people, use their name plus さん — 田中さんは — which is what あなた's job actually is.",
          watch: "Repeating 私 in every sentence is the single loudest marker of an English-speaking learner. And あなた toward someone whose name you know can read as cold or even confrontational, despite every textbook glossing it as \"you.\" And this is only half the lesson — Step 11 covers the cases where 私 has to stay, once you can build the clauses it stays for.",
        },
        ex: [["昨日映画を見ました。とても面白かったです。", "No 私 anywhere — and completely natural."], ["私は行きますが、妹は行きません。", "私 kept on purpose: contrast."], ["田中さんは今日も忙しいですか。", "Their name, not あなた."]],
      },
      { id: "cc-family", jp: "母 と お母さん", en: "two words for every relative", kind: "culture",
        exp: "Japanese keeps two words for each family member, and which one you use depends on whose family it is. Talking about YOUR OWN family to someone outside it, use the plain, humble set: 母, 父, 兄, 姉, 妹, 弟. Talking about SOMEONE ELSE'S family — or to your own mother across the dinner table — use the honorific set: お母さん, お父さん, お兄さん, お姉さん.\n\nEnglish has nothing like this, so the mistake writes itself: introducing your own mother as お母さん to a stranger sounds, to Japanese ears, like calling her 'my esteemed mother' — polite in exactly the wrong direction. The rule underneath is the inside/outside (うち・そと) instinct that runs through the whole language: humble about your own side, respectful about the other side. This is its first appearance; keigo, much later, is the same instinct grown up.\n\nRecognition first: when someone says 母, they mean their own mother. When they ask about お母さん, they mean yours.",
        ex: [["母は先生です。", "MY mother — plain word, humble direction."], ["お母さんはお元気ですか。", "YOUR mother — honorific direction."]],
      },
      {
        id: "kara-from", jp: "から〜まで", en: "from here to there",
        exp: {
          what: "A matched pair marking a start point and an end point — in time or in space.",
          build: "A から B まで. Either half works alone: 九時から on its own is fine, and so is 駅まで.",
          when: "Working hours, opening times, routes, page ranges.",
          watch: "から has a second life meaning \"because\" (Step 11). Position tells you which: after a noun it's \"from\"; after a whole clause it's \"because.\"",
        },
        ex: [["九時から五時まで働きます。", "I work from nine to five."], ["家から駅まで歩きます。", "I walk from home to the station."]],
      },
      {
        id: "yori", jp: "より", en: "than",
        exp: {
          what: "より marks the thing you're measuring against — the loser of the comparison.",
          build: "A より B が [adjective]. B is the one that wins.",
          when: "Any straightforward comparison of two things.",
          watch: "It reads backwards from English. 犬は猫より大きい unpacks as \"the dog, compared to the cat, is big\" — より attaches to the cat, not the dog. Step 10 adds the fuller のほうが version you'll actually hear most often.",
        },
        ex: [["犬は猫より大きいです。", "The dog is bigger than the cat."], ["今日は昨日より寒いです。", "Today is colder than yesterday."]],
      },
      {
        id: "ka-or", jp: "か (or)", en: "offering a choice",
        exp: {
          what: "か placed between two nouns means \"or.\"",
          build: "A か B.",
          when: "Offering options, hedging about which of two things applies.",
          watch: "It looks identical to the question particle from Step 1, and it isn't the same use. Position tells you apart: between nouns it's \"or\"; at the end of the sentence it's a question.",
        },
        ex: [["コーヒーかお茶を飲みます。", "I'll drink coffee or tea."], ["月曜日か火曜日に来てください。", "Please come Monday or Tuesday."]],
      },
      {
        id: "ya", jp: "〜や〜(など)", en: "and, but only some of them",
        exp: {
          what: "や lists a couple of examples and implies there were more.",
          build: "A や B, often closed with など (\"and so on\").",
          when: "Describing what was in a room, on a table, or on a menu, without committing to a full inventory.",
          watch: "This is the deliberate contrast with と. と says that's the whole list; や says here's a sample. Using と for the contents of your fridge sounds oddly precise, as though you'd counted.",
        },
        ex: [["机の上に本やペンがあります。", "There are books, pens, and such on the desk."], ["すしやてんぷらなどを食べました。", "I ate sushi, tempura, and so on."]],
      },
      {
        id: "dake", jp: "〜だけ", en: "only, just",
        exp: {
          what: "A neutral limiter: this much and no more, with no judgement attached.",
          build: "Goes straight after the noun or amount. It can absorb を and が: 水だけ飲みます rather than 水をだけ.",
          when: "Stating a limit as a plain fact.",
          watch: "だけ is neutral. The next lesson, しか, means the same thing but adds a sigh — pick deliberately.",
        },
        ex: [["水だけ飲みます。", "I'll drink only water."], ["一人だけ来ました。", "Only one person came."]],
      },
      {
        id: "shika", jp: "〜しか〜ない", en: "only — and that's not much",
        exp: {
          what: "Also \"only,\" but coloured with insufficiency: less than you'd hoped.",
          build: "[noun] しか + a NEGATIVE verb. The negative isn't optional — しか cannot appear without it.",
          when: "Emphasizing that something is in short supply.",
          watch: "The shape feels like a double negative and translates as a positive. 百円しかありません is \"I only have 100 yen,\" not \"I don't have 100 yen.\" Trust the pattern rather than the literal parts.",
        },
        ex: [["百円しかありません。", "I have only 100 yen."], ["日本語しか話しません。", "I speak nothing but Japanese."]],
      },
      {
        id: "counters", jp: "一つ・二人・三枚 (counters)", en: "how to count things",
        exp: {
          what: "You can't put a number straight next to a noun. Japanese pairs every number with a counter word matching the kind of thing counted — much like English says two sheets of paper rather than two papers, except Japanese does it for everything.",
          build: "The all-purpose set 一つ、二つ、三つ… covers most objects up to ten and is the one to learn first. Then 〜人 for people, 〜枚 for flat things (paper, shirts, tickets), 〜本 for long things (bottles, pens), 〜冊 for books. Position: the number goes after the noun and its particle — りんごを三つ買いました, not 三つのりんごを.",
          when: "Shopping, ordering, saying how many of anything there are.",
          watch: "一人 and 二人 are read ひとり and ふたり — irregular, extremely common, worth memorizing today. Beyond that, don't try to learn every counter now; 〜つ will carry you through most conversations, and a wrong counter is understood while a missing one is not.",
        },
        ex: [["りんごを三つ買いました。", "I bought three apples."], ["学生が二人います。", "There are two students."]],
      },
      {
        id: "sb-counters", jp: "三本は「さんぼん」", en: "picking the counter, hearing the shift", kind: "skill",
        exp: {
          what: "No English equivalent — you say 'two coffees' and move on. Japanese asks two questions of everything you count: which counter word, and what the number does to its sound.",
          build: "Counter first: 〜人 people, 〜枚 flat things, 〜本 long things, 〜冊 bound things, 〜匹 small animals, 〜つ for anything you're unsure of. Then the sound: some numbers fuse with some counters — 一本 いっぽん, 三本 さんぼん, 六本 ろっぽん — while 二本 にほん stays plain. The shifts are the same clipping-and-voicing machinery the kana modules taught, running at conversation speed.",
          when: "Ordering two beers, buying three tickets, counting anything out loud — daily, in other words.",
          watch: "Priorities. ひとり and ふたり are non-negotiable. The 〜本 row is the classic shift set — drill いっぽん・にほん・さんぼん as a chant until it stops being arithmetic. Past that, relax: a wrong counter is understood and gently corrected, while a MISSING one (りんご三ください) is genuinely broken. When stuck, 〜つ — みっつください is always a sentence.",
        },
        ex: [["ビールを二本ください。", "Long thing → 本, and 二本 stays plain: にほん."], ["ビールを三本ください。", "Same counter, new sound: さんぼん."], ["切手を三枚買いました。", "Flat thing → 枚, no shift: さんまい."]],
      },
      {
        id: "gurai", jp: "〜ぐらい / くらい", en: "about (an amount)",
        exp: {
          what: "Softens a quantity or a length of time to an approximation.",
          build: "[number + counter] ぐらい. ぐらい and くらい are the same word — use whichever comes out.",
          when: "三十分ぐらい, 十人ぐらい, 千円ぐらい, 三年ぐらい.",
          watch: "This is for how much and how long. For roughly when, you need ごろ — the next lesson.",
        },
        ex: [["三十分ぐらいかかります。", "It takes about 30 minutes."], ["十人ぐらい来ました。", "About ten people came."]],
      },
      {
        id: "goro", jp: "〜ごろ", en: "around (a time)",
        exp: {
          what: "Softens a point on the clock or calendar.",
          build: "[time] ごろ — and it swallows the に. 七時ごろ帰ります, not 七時ごろに帰ります.",
          when: "七時ごろ, 三月ごろ, 十日ごろ.",
          watch: "Duration takes ぐらい, a point in time takes ごろ. 三十分ごろ is wrong (that's a length), and 七時ぐらい, while heard, is looser than 七時ごろ.",
        },
        ex: [["七時ごろ帰ります。", "I'll go home around seven."], ["三月ごろ日本に来ました。", "I came to Japan around March."]],
      },
      {
        id: "sb-slots", jp: "語順のめやす", en: "the default running order", kind: "skill",
        exp: {
          what: "Japanese word order is famously flexible, and the reason is the particle system itself: because the particles identify what each piece is doing, you can move most pieces around without breaking anything. But flexible isn't random, and there is a default order that sounds neutral.",
          build: "Time, then place, then who else is involved, then the thing the action lands on, then the verb: 昨日、図書館で友達と本を読みました. Move something to the front and you've emphasized it. Leave it to the end and it sounds like an afterthought.",
          when: "Any sentence with more than two pieces in it. When a sentence feels off but every particle checks out, order is usually the culprit.",
          watch: "Exactly one thing cannot move: the verb stays last. Everything else negotiates. That's the whole reason particles carry so much weight — English uses position to show who did what to whom, and Japanese uses が, に and を instead, which frees the positions up for emphasis.",
        },
        ex: [["昨日、図書館で本を読みました。", "Time, place, object, verb — the neutral order."], ["本は昨日読みました。", "Object pulled to the front as the topic: as for the book, I read it yesterday."]],
      },
      {
        id: "b-s2b", jp: "作文 · つなぐ", en: "join things up", kind: "build",
        requires: ["to-and", "mo", "no", "ya"],
        brief: "Describe what is on your desk or in your bag right now. Include one complete list, one incomplete list, at least one \"also,\" and at least one noun glued to another.",
        exp: {
          what: "Step 3 closes with the connectors — the particles that let a single sentence hold more than one idea. Using them together is what stops writing sounding like a stack of index cards.",
          build: "Two or three sentences about one small scene. Somewhere in there: と for a finished list, や for a partial one, も for adding, and の joining two nouns.",
          when: "Descriptions, inventories, and any answer to \"what have you got?\"",
          watch: "と and や are a deliberate choice, not synonyms — と claims the list is complete, so using it for the contents of your bag sounds like you counted. And when も arrives, は, が and を leave the building.",
        },
        ex: [],
      },
    ],
  },

  {
    cat: "Step 4 · Verbs: from dictionary form up",
    level: "S2",
    bank: [["勉強する", "to study"], ["食べる", "to eat"], ["見る", "to see"], ["行く", "to go"], ["起きる", "to get up"], ["寝る", "to sleep"], ["毎日", "every day"], ["昨日", "yesterday"]],
    points: [
      {
        id: "dict", jp: "辞書形 (dictionary form)", en: "the base every other form bends from",
        exp: {
          what: "The plain, unchanged shape of a verb — the one a dictionary lists. 食べる, 飲む, 行く. Everything else in this step is made by bending this form.",
          build: "It always ends in an u-sound: る, む, く, ぐ, す, つ, ぬ, ぶ, う. If a Japanese verb doesn't end that way, it isn't in dictionary form.",
          when: "Two jobs. It's casual present and future speech on its own, and it slots unchanged into larger patterns — 〜つもりです, 〜まえに, 〜のが好きです.",
          watch: "On its own it's casual. Ending a sentence with 行く to a teacher or a stranger is the equivalent of answering a work email with \"yeah, going.\"",
        },
        ex: [["明日学校へ行く。", "I'll go to school tomorrow. (casual)"], ["日本語を話すのが好きです。", "I like speaking Japanese. (dictionary form inside a pattern)"]],
      },
      {
        id: "masu", jp: "〜ます / ません", en: "the polite everyday form",
        exp: {
          what: "The form you'll use most as an adult in Japan. It carries politeness without any formality beyond it — it's neutral, not stiff.",
          build: "Take the verb's stem and add ます, or ません for the negative. Getting the stem is a two-family problem, and the very next lesson solves it.",
          when: "Strangers, colleagues, shop staff, teachers, anyone older, anyone you've just met. When in doubt, ます.",
          watch: "ます itself carries the tense, so you don't add anything else: 食べますです isn't a thing. And ません covers both \"don't\" and \"won't\" — Japanese doesn't split those.",
        },
        ex: [["毎日勉強します。", "I study every day."], ["肉を食べません。", "I don't eat meat."]],
      },
      {
        id: "sb-verbtypes", jp: "Go と Ichi", en: "the two verb families", kind: "skill",
        quizHint: "Test conjugating dictionary form into ます form. Use wrong-family traps as distractors, e.g. 食べます (correct) vs 食べります (wrong), 飲みます (correct) vs 飲べます (wrong).",
        exp: {
          what: "Every Japanese verb belongs to one of two families — plus exactly two exceptions, する and 来る, and that is the whole system. The family decides how every single form is built: learn a verb's family once and you never have to think about it again. Textbooks call the families godan and ichidan — from here we'll just say Go and Ichi.",
          build: "Ichi verbs drop る and add the ending: 食べる → 食べます. Go verbs shift their final sound to the i-row first: 飲む → 飲みます, 行く → 行きます, 買う → 買います.",
          when: "Sorting them: if a verb doesn't end in る, it's Go, guaranteed. If it ends in る, look at the vowel before it — える or いる usually means Ichi (食べる, 見る), while ある, うる, おる means Go (作る, 乗る). する and 来る ignore this test entirely — they are the two irregulars, and later lessons give each its own forms. There are no others hiding.",
          watch: "A handful of verbs end in いる or える and are Go anyway: 帰る, 入る, 走る, 切る, 知る. They're common enough that it's worth learning these five as a set now rather than being surprised by 帰ります later.",
        },
        ex: [["食べる → 食べます", "Ichi: drop る, add ます."], ["飲む → 飲みます", "Go: む → み, add ます."], ["帰る → 帰ります", "Looks Ichi, behaves Go."], ["する → します・来る → 来ます", "The two exceptions — small enough to just memorise."]],
      },
      {
        id: "sb-suruverbs", jp: "する と 来る", en: "the two exceptions, and the one that builds new verbs", kind: "skill",
        quizHint: "Test する-verb formation and the irregular stems. Use sorting traps as distractors — 勉強する conjugated as if it were Go (勉強しります) or Ichi (勉強しる) — and the 来る reading shifts (きます / こない / きて), where the kanji stays 来 and the sound does not.",
        exp: {
          what: "The last lesson promised these two their own forms; this is it. する and 来る are the only irregular verbs in the language — but する is not just an exception to memorise. It is the machine Japanese uses to turn nouns into verbs, which makes it the single most productive verb you will meet.",
          build: "Noun + する makes a verb — textbooks call these サ変動詞, or just する-verbs. Put する directly after the noun: 勉強 (study) → 勉強する, 電話 (telephone) → 電話する, 掃除 (cleaning) → 掃除する, 予約 (reservation) → 予約する. It works on borrowed words too — コピーする, チェックする, メールする. The compound then conjugates exactly as する does: 勉強します, 勉強した, 勉強して, 勉強しない. Learn する's forms once and you have conjugated every one of these at the same time.\n\nする: します・した・して・しない, and the potential is できる, not される. 来る: きます・きた・きて・こない — the kanji stays 来 while the sound moves く → き → こ, which is the part that actually catches people.",
          when: "Constantly, and more often as your vocabulary grows — most two-kanji activity words work this way, so every noun of that shape you learn is quietly also a verb. 日本語を勉強しています。明日、予約します。",
          watch: "The sorting test from the last lesson does not apply to these, and trying to apply it is the classic accident: 勉強する is neither Go nor Ichi, so 勉強しります and 勉強しる are both wrong — it is します, full stop.\n\nYou may also meet 勉強をする, with を. It is not an error; it loosens the compound back into 'do studying', and it is slightly heavier. The catch is that you cannot then stack another を — 日本語を勉強する is fine, 日本語を勉強をする is not, because a clause takes one を.",
        },
        ex: [["毎晩、日本語を勉強します。", "The noun 勉強 plus する. One を, on 日本語."], ["友達に電話しました。", "電話 is a telephone; 電話する is to make a call."], ["明日、友達が来ます。", "来る → きます. The reading moves, the kanji doesn't."], ["昨日は来ませんでした。", "And the negative stem is こ — 来ない, 来ません."]],
      },
      {
        id: "ta-plain", jp: "〜た / 〜ない (plain past & negative)", en: "the sound changes everything else depends on",
        exp: {
          what: "The casual past and casual negative. They matter beyond casual speech: several later patterns (〜たあとで, 〜たり, 〜ないでください) attach to these forms, so the sound changes here get reused constantly.",
          build: "Ichi verbs are easy: drop る, add た or ない — 食べた, 食べない. Go verbs change their final sound for the past. う・つ・る → った (買った, 待った, 帰った). む・ぬ・ぶ → んだ (飲んだ, 遊んだ). く → いた (書いた), ぐ → いだ (泳いだ). す → した (話した). For the negative, shift the final sound to the a-row and add ない: 飲む → 飲まない, 行く → 行かない.",
          when: "Talking to close friends and family, and as the raw material for later grammar.",
          watch: "Four irregulars, and they're all high-frequency: 行く → 行った (not 行いた), する → した / しない, 来る → 来た / 来ない, and ある → あった but ない (never あらない). Verbs ending in う take わ in the negative: 買う → 買わない.",
        },
        ex: [["昨日、ラーメンを食べた。", "I ate ramen yesterday. (casual)"], ["今日は行かない。", "I'm not going today. (casual)"]],
      },
      {
        id: "mashita", jp: "〜ました / ませんでした", en: "polite past",
        exp: {
          what: "The past tense of ます — what you'll actually say in most adult conversations.",
          build: "Stem + ました, or ませんでした for the past negative. Same stem, same two families as before: 食べました, 飲みました.",
          when: "Reporting anything that already happened, at any level of politeness above \"close friend.\"",
          watch: "The polite past ignores the sound-change chart entirely — it's built from the stem, not from the た-form. 飲んだました is a common early mistake; it's just 飲みました.",
        },
        ex: [["昨日映画を見ました。", "I watched a movie yesterday."], ["朝ごはんを食べませんでした。", "I didn't eat breakfast."]],
      },
      {
        id: "te", jp: "て形 (te-form)", en: "the connector everything plugs into",
        exp: {
          what: "The most useful form in beginner Japanese. It isn't a tense and it can't end a sentence on its own — it's a hand-off, saying \"…and then\" or \"…so that\" to whatever follows.",
          build: "Exactly the chart you learned for 〜た, with て and で swapped in. う・つ・る → って (買って, 待って, 帰って). む・ぬ・ぶ → んで (飲んで, 遊んで). く → いて (書いて), ぐ → いで (泳いで). す → して (話して). Ichi verbs drop る and add て: 食べて. Irregulars: 行く → 行って, する → して, 来る → 来て.",
          when: "It unlocks most of the rest of this course: 〜てください (requests), 〜ています (ongoing), 〜てもいい (permission), 〜てから (sequence) — plus simply chaining actions together in one sentence.",
          watch: "The て-form carries no tense of its own. The final verb sets the tense for the whole sentence: 朝起きて、顔を洗いました is entirely past, even though 起きて looks unmarked. Learn this chart properly now — you'll use it every day for the rest of the course.",
        },
        ex: [["朝起きて、顔を洗います。", "I get up and wash my face."], ["ここに名前を書いてください。", "Please write your name here."]],
      },
      {
        id: "b-s3a", jp: "作文 · つづける", en: "chain three actions", kind: "build",
        requires: ["te", "mashita", "o"],
        brief: "Describe your morning in ONE sentence: three things you did, in order, joined by the て-form, with only the final verb carrying the tense.",
        exp: {
          what: "Chaining is the て-form's entire purpose, and you cannot feel that from a single example. One long sentence is the fastest way to make it click.",
          build: "One sentence, three verbs. The first two go in て-form. Only the last one gets ました.",
          when: "Any sequence — a morning, a recipe, a journey, a process at work.",
          watch: "Resist the urge to tense every verb. 起きました、食べました、行きました is three sentences in a trench coat; 起きて、食べて、行きました is the real thing. The chain carries one tense and it lives at the very end.",
        },
        ex: [],
      },
      {
        id: "teiru", jp: "〜ています (ongoing)", en: "happening right now",
        exp: {
          what: "The closest thing Japanese has to \"is doing\" — an action in progress at this moment.",
          build: "て-form + います. Plain version: て-form + いる.",
          when: "Describing what's going on as you speak: it's raining, he's watching TV, I'm eating.",
          watch: "In real speech the い almost always disappears — 見ています becomes 見てる. That's the next culture lesson, and it's what you'll actually hear.",
        },
        ex: [["今、雨が降っています。", "It's raining now."], ["弟はテレビを見ています。", "My brother is watching TV."]],
      },
      {
        id: "teiru2", jp: "〜ています (habit / state)", en: "a state that stuck",
        exp: {
          what: "The same form doing a genuinely different job: not \"is doing\" but \"did, and the result is still true.\" 住んでいる isn't in the middle of moving in — they moved in, and they're still there.",
          build: "Same shape as before.",
          when: "住んでいます (live somewhere), 働いています (work somewhere), 結婚しています (be married), 知っています (know), 持っています (have).",
          watch: "These trip up English speakers because English uses a simple present for them. \"I live in Tokyo\" must be 住んでいます — 住みます is wrong. And 知っています has an irregular negative: 知りません, never 知っていません.",
        },
        ex: [["東京に住んでいます。", "I live in Tokyo."], ["銀行で働いています。", "I work at a bank."]],
      },
      {
        id: "sb-transitive", jp: "自動詞・他動詞", en: "verbs that come in pairs", kind: "skill",
        practicePrompt: "Write one sentence where something is simply in a state (open, closed, on, stopped) — using the intransitive verb and が, not を.",
        practiceHint: "uses_target means the sentence uses an intransitive verb from a transitive/intransitive pair with the correct particle (が, not を).",
        exp: {
          what: "English uses one verb for both sides of an action: I opened the door, and the door opened. Japanese uses two different verbs. 開ける is what a person does to a door; 開く is what the door does on its own. There is no overlap, and English gives you no warning that a choice is being made.",
          build: "The pairs travel in recognisable families: 開ける/開く, 閉める/閉まる, 始める/始まる, 止める/止まる, 出す/出る, 入れる/入る, つける/つく, 消す/消える. The particle has to agree with the verb you picked — the someone-does-it verb takes を (窓を開けます), the it-just-happens verb takes が (窓が開きます). Choose the verb first and the particle follows automatically.",
          when: "Constantly, and especially with 〜ています. 窓が開いています describes a window that is open, which is what you would actually say about a room. 窓を開けています means you are in the middle of opening it right now, which is rarely the point.",
          watch: "This is the error the checker flags hardest, because there is nothing in English to warn you. 窓を閉まりました is wrong twice: 閉まる is the intransitive verb so it cannot take を, and a person closing something needs 閉めました. Useful self-check — if you find を sitting in front of an intransitive verb, one of the two is wrong. You'll meet this again in Step 10, where a second, unrelated family of が verbs arrives — keeping the two がs apart is that lesson's whole point.",
        },
        ex: [["窓を閉めました。", "I closed the window. (I did it → を + transitive)"], ["窓が閉まりました。", "The window closed. (it happened → が + intransitive)"], ["電気がついています。", "The light is on. (state, from the intransitive)"], ["会議は三時に始まります。", "The meeting starts at three. (it starts itself)"]],
      },
      {
        id: "b-s3c", jp: "作文 · 部屋のじょうたい", en: "describe a state", kind: "build",
        requires: ["sb-transitive", "teiru2", "o"],
        brief: "Describe the state of a room. One thing you did to something, and at least two things that are simply in a state — open, closed, on, off, stopped. Make every particle agree with its verb.",
        exp: {
          what: "Verb pairs only bite under pressure, when you are describing a scene and have to choose a verb and a particle in the same breath. This is that pressure, deliberately.",
          build: "Three or four sentences about one room. At least one を with a transitive verb for something you did, and at least two が with intransitive states.",
          when: "Describing anything you did not personally arrange — rooms, streets, shops, machines, anything broken.",
          watch: "Before you submit, check every を against the verb that follows it. を in front of an intransitive verb is always an error, and it is the single fastest mistake to catch in your own writing.",
        },
        ex: [],
      },
      {
        id: "cc-teru", jp: "〜てる (casual 〜ている)", en: "the contraction you'll hear day one", kind: "culture",
        exp: {
          what: "In everyday speech 〜ている loses its い and becomes 〜てる. You already know the full form; this is just what it sounds like out of the textbook.",
          build: "見ている → 見てる. 何をしていますか → 何してる. The を often drops too.",
          when: "With friends, in messages, and in essentially all casual conversation. You'll hear it far more often than the full form.",
          watch: "Recognize it everywhere; produce it only with people you'd use plain form with. 〜てる in a work email would read as careless.",
        },
        ex: [["何してる？", "What are you doing? (= 何をしていますか)"], ["今、駅に向かってる。", "Heading to the station now."]],
      },
      {
        id: "mou", jp: "もう〜ました", en: "already done",
        exp: {
          what: "もう plus a past verb reports that something is finished.",
          build: "もう + past tense. Answering \"yes\" to もう〜ましたか is just はい、もう〜ました.",
          when: "Confirming completion — homework, lunch, a task someone asked about.",
          watch: "もう has two other lives worth recognizing: with a negative it means \"no longer\" (もう飲みません — I don't drink any more), and before a number it means \"another\" (もう一つ).",
        },
        ex: [["もう昼ごはんを食べました。", "I already ate lunch."], ["宿題はもう終わりました。", "The homework is already finished."]],
      },
      {
        id: "mada", jp: "まだ〜ていません", en: "not yet",
        exp: {
          what: "The natural answer to もう〜ましたか when the answer is no.",
          build: "まだ + て-form + いません. Not the plain past negative.",
          when: "Anything still outstanding but expected.",
          watch: "まだ食べませんでした is grammatical but wrong in feel — it says \"I didn't eat, end of story.\" ていません keeps the door open: it hasn't happened yet, but it will. Separately, まだ before an adjective just means \"still\": まだ忙しいです.",
        },
        ex: [["まだ食べていません。", "I haven't eaten yet."], ["レポートはまだ書いていません。", "I haven't written the report yet."]],
      },
      {
        id: "sb-future", jp: "未来形はない", en: "there is no future tense", kind: "skill",
        exp: {
          what: "Japanese has two tenses, not three: past, and everything else. There is no equivalent of \"will.\" 行きます is both \"I go\" and \"I will go,\" and nothing about the verb changes between them.",
          build: "Nothing to build — that's the point. To place something in the future, add a time word instead: 明日行きます, 来週会います, 三時に始まります.",
          when: "Habits, plans, promises, scheduled events — all of it uses the same non-past form.",
          watch: "The instinct to hunt for a future marker is strong, and it produces things like 行くでしょう where a plain 行きます was wanted. If you know it's happening, use the non-past. でしょう (Step 7) means you're guessing.",
        },
        ex: [["毎日コーヒーを飲みます。", "I drink coffee every day. (habit)"], ["明日、友達に会います。", "I'll meet a friend tomorrow. (future — same form, context decides)"]],
      },
      {
        id: "sb-register", jp: "です・ます or plain?", en: "choosing your politeness", kind: "skill",
        practicePrompt: "Write TWO sentences to the same listener — a friend, or a teacher — and keep the politeness consistent in both.",
        practiceHint: "The learner was asked to write TWO sentences to one listener with a consistent politeness level; uses_target means the level is consistent across both sentences and fits that listener.",
        exp: {
          what: "Every Japanese sentence you produce carries a politeness level, whether you chose one or not. You can't opt out — even the plain form is a choice, and listeners hear it.",
          build: "です/ます with strangers, teachers, staff, colleagues, anyone older. Plain form with close friends, family, and children.",
          when: "Pick a level per listener at the start of a conversation and hold it. The level tracks your relationship with the person you're speaking to, not your mood or the topic.",
          watch: "The classic error isn't picking the wrong level — it's drifting between them mid-conversation, which reads as unstable rather than casual. That's why this lesson asks for two sentences instead of one: consistency is the skill being tested.",
        },
        ex: [["先生、明日は休みます。", "To a teacher: polite."], ["明日、休むよ。", "To a friend: plain."]],
      },
      {
        id: "sb-nounmod", jp: "名詞修飾 (noun modification)", en: "describing a noun with a whole clause", kind: "skill",
        practicePrompt: "Write one sentence containing a noun described by a clause in front of it — 母が作った料理, 日本語を勉強している人, 昨日買った本.",
        practiceHint: "uses_target means the sentence contains a clause modifying a noun, with the clause in plain form and placed BEFORE the noun.",
        exp: {
          what: "English puts a describing phrase after the noun: people who are divorced, the book I read yesterday, a friend who lives in Tokyo. Japanese puts it in front, with nothing joining the two: 離婚した人, 昨日読んだ本, 東京に住んでいる友達. There is no word for who, which, or that — the clause just sits there, and the noun it describes comes last.",
          build: "Take a full sentence, put it in PLAIN form, and park it directly before the noun. 人が離婚した becomes 離婚した人. Every plain form works: 食べない人 a person who doesn't eat, 母が作る料理 food my mother makes, 母が作った料理 food my mother made. If the clause has its own subject, mark it with が — は cannot appear inside.",
          when: "The moment you want a subject bigger than one word. This is the single structure that moves a learner from short sentences to real ones, and every later pattern that looks complicated (〜とき, 〜まえに, 〜のが好き) is this same shape underneath.",
          watch: "Three specific errors. Never です or ます inside the clause: 離婚しました人 is wrong, it's 離婚した人. Never insert a joining word — there's no equivalent of who or that, and adding の doesn't help. And は inside the clause is wrong: 私が読んだ本, never 私は読んだ本. One nuance worth carrying over from Step 4: 結婚した人 is someone who got married, while 結婚している人 is someone who is married — the same past-versus-state split you met with 〜ています.",
        },
        ex: [["離婚した人は、もう一度結婚しますか。", "Do people who have divorced marry again? (clause before the noun, no joining word)"], ["これは母が作った料理です。", "This is food my mother made. (the clause's own subject takes が)"], ["東京に住んでいる友達がいます。", "I have a friend who lives in Tokyo."], ["昨日買った本はとても面白かったです。", "The book I bought yesterday was very interesting."]],
      },
      {
        id: "b-s3b", jp: "作文 · 人をえがく", en: "describe a person", kind: "build",
        requires: ["sb-nounmod", "teiru2", "masu"],
        brief: "Describe someone you know in two or three sentences — and describe them at least once with a clause placed in front of the noun, like 東京に住んでいる友達 or 日本語を勉強している人.",
        exp: {
          what: "Step 4's payoff. You now have plain forms, states that stuck, and the ability to park a whole clause in front of a noun — which together is what a real description is actually made of.",
          build: "Two or three sentences. At least one noun described by a clause, and at least one state verb (住んでいる, 働いている, 結婚している).",
          when: "Introducing anyone, describing a character, answering \"who's that?\"",
          watch: "The clause goes before the noun and stays plain even when the sentence ends politely: 東京に住んでいる友達がいます. Plain inside, polite at the end. That split feels wrong for about a month and is completely correct.",
        },
        ex: [],
      },
    ],
  },
  {
    cat: "Checkpoint 1",
    level: "S2",
    bank: [["学校", "school"], ["友達", "friend"], ["映画", "movie"], ["毎日", "every day"], ["昨日", "yesterday"], ["本", "book"]],
    points: [
      {
        id: "b1", jp: "作文 · 昨日のこと", en: "put yesterday together", kind: "build",
        requires: ["mashita", "o", "de-place", "ni-time"],
        brief: "Write two or three sentences about yesterday. Say where you went, what you did there, and what time something happened.",
        exp: {
          what: "Every lesson so far has drilled one pattern in isolation. This asks you to run several at once, which is the actual skill — no real sentence contains exactly one grammar point, and knowing four patterns separately is not the same as being able to use them together.",
          build: "Cover all four listed patterns across two or three sentences. They needn't crowd into a single sentence, but the sentences should be about the same event rather than four unrelated statements.",
          when: "Any message, email, or spoken turn longer than a greeting. This is the smallest unit of real writing.",
          watch: "Two habits surface the moment people combine patterns. Politeness starts drifting between sentences — choose です/ます or plain and hold it to the end. And 私 creeps back in at the start of every sentence; you established who you are in the first one, so drop it after that.",
        },
        ex: [],
      },
      { id: "rc1", jp: "復習 · Steps 1–3", en: "checkpoint: basics, particles & tense", kind: "review", covers: ["desu", "ka", "wa", "ga", "o", "ni-time", "de-place", "mo", "no", "masu", "mashita", "teiru", "mada", "sb-no", "sb-kosoado", "sb-yone", "sb-counters", "sb-negq", "sb-suruverbs"], exp: "Mixed review of everything so far: the copula, core particles, and polite tense. The quiz pulls from all of it. In practice, try combining at least two patterns in one sentence.", ex: [] },
    ],
  },
  {
    cat: "Step 5 · Requests, permission & obligation",
    level: "S3",
    bank: [["待つ", "to wait"], ["座る", "to sit"], ["写真を撮る", "to take a photo"], ["薬を飲む", "to take medicine"], ["帰る", "to go home"], ["入る", "to enter"], ["使う", "to use"], ["急ぐ", "to hurry"]],
    points: [
      {
        id: "tekudasai", jp: "〜てください", en: "please do",
        exp: {
          what: "The all-purpose polite request: please do this. It is built on the て-form, which is a large part of why the て-form was worth the sweat.",
          build: "て-form + ください: 待ってください, 話してください. You will also hear the softer 〜てくださいませんか — recognize it; producing it can wait.",
          when: "Asking anyone to do anything politely — counters, teachers, taxi drivers. The neutral default for requests to people you are not close to.",
          watch: "However polite, it is still an instruction — for favours from superiors, お願いします or the invitation forms do the job more gracefully. And bare ください with を asks for a THING: 水をください. The split is clean: を + noun for things, て + verb for actions.",
        },
        ex: [["ちょっと待ってください。", "Please wait a moment."], ["ゆっくり話してください。", "Please speak slowly."], ["すみません、写真を撮ってください。— いいですよ。", "Asking a stranger for a photo — request and easy grant."]],
      },
      {
        id: "naidekudasai", jp: "〜ないでください", en: "please don't",
        exp: {
          what: "The please-don't — a request pointed at not-doing.",
          build: "ない-form + でください: 撮らないでください, 心配しないでください. The negative lives on ない; there is no ませんでください.",
          when: "House rules, gentle warnings, and asking someone to stop — softly.",
          watch: "Delivery sets the temperature: 心配しないでください is comfort, not command. Keep it apart from てはいけません two lessons on — ないでください asks THIS person, now; てはいけません states a standing rule that applies to everyone.",
        },
        ex: [["ここで写真を撮らないでください。", "Please don't take photos here."], ["心配しないでください。", "Please don't worry."], ["忘れないでくださいね。", "A gentle reminder — the ね from Step 1 softens it further."]],
      },
      {
        id: "temoii", jp: "〜てもいいです", en: "may / it's okay to",
        exp: {
          what: "Permission, in both directions: 〜てもいいですか asks it, 〜てもいいですよ grants it. The question form is the one you will use daily — this is HOW you ask 'may I'.",
          build: "て-form + もいいですか to ask; drop the か to grant. Literally 'even if I do it, is it good?' — which is what the も is doing there.",
          when: "Before touching, sitting, photographing, borrowing, leaving early. Japanese social space runs on asking first, and this form is the asking.",
          watch: "Learn the answers with the question. Yes: いいですよ, or just どうぞ. A real no usually avoids だめ — you will hear ちょっと… or すみません、それは…. Hesitation IS the answer; take it as one.",
        },
        ex: [["ここに座ってもいいですか。", "May I sit here?"], ["帰ってもいいですよ。", "You may go home."], ["写真を撮ってもいいですか。— どうぞ。", "Asking permission, and the friendly grant."], ["入ってもいいですか。— あ、ちょっと…", "The soft refusal — the trailing ちょっと is a complete answer."]],
      },
      {
        id: "tewaikemasen", jp: "〜てはいけません", en: "must not",
        exp: {
          what: "Prohibition as a standing rule: must not. Impersonal — it belongs to the place or the situation, not to you.",
          build: "て-form + はいけません. The written は is the particle, read wa — the kana lesson's rule on duty.",
          when: "Rules attached to places: signs, classrooms, hospitals, pools. Often what a sign means even when the sign just says 禁止.",
          watch: "Strong and flat — to stop a PERSON, ないでください is kinder. And hold the triangle corner: must-not is this; don't-have-to is なくてもいい, built from entirely different parts. English builds both from 'must'; Japanese never does.",
        },
        ex: [["ここでたばこを吸ってはいけません。", "You must not smoke here."], ["授業中に寝てはいけません。", "You must not sleep in class."], ["この部屋を使ってはいけません。", "A rule about the room — it applies to everyone, not just you."]],
      },
      {
        id: "nakereba", jp: "〜なければなりません", en: "must / have to",
        exp: {
          what: "Obligation: must, have to. Japanese builds it as a double negative — 'if I do not do it, it will not do' — which is why the pieces look the way they do.",
          build: "ない-form, drop the い, + ければなりません: 飲まなければなりません. 〜ないといけません means the same with a lighter step — the modular slots are two lessons on.",
          when: "Duties, deadlines, medicine, early alarms — and the polite exit: もう帰らなければなりません.",
          watch: "About yourself it states duty; aimed at the listener it can order them around — 行かなければなりませんよ is bossy. And keep the direction straight: this whole assembly means MUST DO. Must-NOT lives next door in てはいけません.",
        },
        ex: [["毎日薬を飲まなければなりません。", "I have to take medicine every day."], ["明日早く起きなければなりません。", "I must get up early tomorrow."], ["もう帰らなければなりません。", "The polite exit line — duty offered as courtesy."]],
      },
      {
        id: "nakutemoii", jp: "〜なくてもいいです", en: "don't have to",
        exp: {
          what: "Permission not to: you don't have to. The kind corner of the obligation triangle.",
          build: "ない-form, drop the い, + くてもいいです — the same skeleton as てもいい: 'even if you don't, it's fine.'",
          when: "Reassuring people, lightening loads, and answering must-I questions with mercy.",
          watch: "This is the corner English miswires — the skill builder two lessons on drills it. Notice the negotiation pair: 行かなければなりませんか asks the obligation; いいえ、行かなくてもいいですよ is its kind release.",
        },
        ex: [["明日は来なくてもいいです。", "You don't have to come tomorrow."], ["急がなくてもいいですよ。", "You don't have to hurry."], ["明日も来なければなりませんか。— いいえ、来なくてもいいですよ。", "The obligation question and its kind answer."]],
      },
      { id: "cc-nakya", jp: "なきゃ・なくちゃ・ないと", en: "how 'must' actually sounds", kind: "culture",
        exp: "Nobody says なければなりません to a friend. Speech clips it hard, and the clipped forms usually drop the second half entirely: 行かなきゃ — gotta go. 勉強しなくちゃ — I've got to study. 帰らないと — I'd better get home. The missing なりません is understood, the way English 'gotta' carries 'have got to' inside it.\n\nThe full forms survive where formality does — strangers, bosses, writing. The clipped ones own everywhere else, so your ears need them even while your own sentences stay polite: なきゃ from なければ, なくちゃ from なくては, and ないと standing alone with its consequence left hanging.",
        ex: [["もう行かなきゃ。", "Gotta go — the second half is understood."], ["宿題しないと…", "The trailing と leaves the consequence unsaid — exactly like English 'or else…'"]],
      },
      {
        id: "sb-must", jp: "「must」の三すくみ", en: "must, must-not, don't-have-to", kind: "skill",
        exp: {
          what: "Three patterns from this step form a triangle English wires differently, and the miswiring is invisible until it does real damage: しなければなりません (must do), してはいけません (must not do), しなくてもいいです (don't have to do).",
          build: "The dangerous corner is the third. English builds 'must not' and 'don't have to' from the same material, so the instinct is to negate 'must' and hope. Japanese splits them completely: negative form + なくてもいい grants permission NOT to do; て-form + はいけない prohibits. The two share nothing.",
          when: "Rules, obligations, reassurances. Telling someone 来なくてもいいです (you don't have to come) when you meant 来てはいけません (you must not come) — or the reverse — flips the message, and both sentences are grammatical, so nothing warns you.",
          watch: "The 'must' pattern itself is modular: なければ, ないと or なきゃ on the left; なりません, いけません or だめ on the right. Most combinations work and mean the same thing — 行かないといけない, 行かなきゃだめ — so don't memorize six patterns, memorize two slots. The double negative is doing the work in all of them ('if you don't go, it won't do'), which is why adding your own extra negative on top is the one honestly wrong move.",
        },
        ex: [["明日は来なくてもいいです。", "Don't have to — permission not to."], ["ここに入ってはいけません。", "Must not — prohibition. A different corner entirely."], ["薬を飲まないといけません。", "The same 'must' as なければなりません — two slots, many fillings."]],
      },
      { id: "cc-ogo", jp: "お茶・ご飯", en: "the polish prefixes", kind: "culture",
        exp: "That お on お茶 isn't part of the word — it's a politeness prefix, and Japanese attaches it to nouns to add respect or plain refinement: 水 becomes お水, 話 becomes お話. Native-Japanese words take お; Chinese-origin words take ご (ご飯, ご家族). English has no equivalent — the closest thing is the distance between 'water' and 'some water for you', carried by one syllable.\n\nSome words fossilized with the prefix welded on: ご飯 (cooked rice, and meals generally), お茶, お金, お願い — in polite conversation nobody strips these down, so treat the prefix as part of the word. Others take お only when politeness calls for it. And some never take it — foreign loanwords especially: おビール is a joke, not a request.\n\nFor now: learn ご飯, お茶, お金 and お願いします as whole words, notice the prefix when you hear it elsewhere, and don't manufacture your own yet. Over-prefixing (お犬, おコーヒー) is a real and endearing learner error — but an error.",
        ex: [["お茶をください。", "Fossilized — お茶 is simply the word."], ["ご家族はお元気ですか。", "ご for the Chinese-origin word — politeness pointed at THEIR family."]],
      },
      {
        id: "b-s4", jp: "作文 · ルールを説明する", en: "write the house rules", kind: "build",
        requires: ["tekudasai", "tewaikemasen", "nakereba", "temoii"],
        brief: "Write the rules for somewhere — a library, a classroom, your kitchen. One request, one prohibition, one requirement, one permission.",
        exp: {
          what: "Step 5 is four ways of telling someone what to do, and they differ mostly in force. Writing them side by side is the only way to feel the gap between them.",
          build: "Three or four short sentences, one per pattern. A sign, not an essay.",
          when: "Instructions, house rules, explaining a process to someone new.",
          watch: "These carry real social weight. 〜てはいけません is a genuine prohibition and lands hard on a person; 〜ないでください is the version you would actually say to a friend. Picking the wrong strength is a bigger mistake here than picking the wrong ending.",
        },
        ex: [],
      },
    ],
  },
  {
    cat: "Step 6 · Invitations, desire & intention",
    level: "S3",
    bank: [["一緒に", "together"], ["昼ごはん", "lunch"], ["お茶", "tea"], ["買う", "to buy"], ["会う", "to meet"], ["新しい", "new"], ["車", "car"], ["国", "country"]],
    points: [
      {
        id: "mashou", jp: "〜ましょう", en: "let's",
        exp: {
          what: "Let's — proposing joint action as though it is as good as agreed.",
          build: "ます-stem + ましょう: 行きましょう, 始めましょう, 食べましょう.",
          when: "Moving a group: let's start, let's eat, let's go. Also self-encouragement, said to no one in particular.",
          watch: "ましょう assumes the other person is on board. If it is a genuine question, ましょうか (next lesson); if you are inviting rather than deciding, ませんか (softer still). The three form a ladder of presumption — pick by how sure you are they want it.",
        },
        ex: [["一緒に帰りましょう。", "Let's go home together."], ["昼ごはんを食べましょう。", "Let's eat lunch."], ["じゃ、そろそろ行きましょう。", "Moving the group — decided together, announced kindly."]],
      },
      {
        id: "mashouka", jp: "〜ましょうか", en: "shall I / shall we?",
        exp: {
          what: "Two jobs in one form: shall we? — the genuine-question version of ましょう — and shall I?, the polite offer of help.",
          build: "ます-stem + ましょうか: 何を食べましょうか (deciding together), 手伝いましょうか (offering).",
          when: "Deciding jointly, and offering: to carry, to open, to help, to pick someone up.",
          watch: "As an offer, learn the replies with it: お願いします accepts gratefully; 大丈夫です declines politely — the same 大丈夫 from the konbini lesson. And the か is load-bearing: 手伝いますか asks whether you WILL help; 手伝いましょうか offers to.",
        },
        ex: [["手伝いましょうか。", "Shall I help you?"], ["窓を開けましょうか。", "Shall I open the window?"], ["荷物を持ちましょうか。— すみません、お願いします。", "The offer, and its grateful yes."]],
      },
      {
        id: "masenka", jp: "〜ませんか", en: "won't you ...? (invitation)",
        exp: {
          what: "The polite invitation: won't you? Softest of the three proposal forms because the negative question builds room-to-decline into the grammar itself.",
          build: "ます-stem negative + か: 見ませんか, 行きませんか, 飲みませんか.",
          when: "First invitations, and any invitation upward in politeness — colleagues, seniors, people you'd like to know better.",
          watch: "Two earlier lessons come due here at once. The answer to listen for is the soft no — 日曜日はちょっと…. And per the yes/no drill: accepting an invitation is ぜひ or いいですね, almost never a bare はい — answer the invitation, not the grammar.",
        },
        ex: [["一緒に映画を見ませんか。", "Won't you watch a movie with me?"], ["お茶を飲みませんか。", "Won't you have some tea?"], ["今度一緒に食べませんか。— いいですね！", "Invitation, and the enthusiastic accept."]],
      },
      { id: "cc-no", jp: "「ちょっと…」", en: "how to hear no", kind: "culture",
        exp: "You can now invite people — so you need to hear the answers, and Japanese rarely refuses with いいえ. A direct no forces the other person to reject you to your face, so the culture routes around it, and the refusals sound like anything but refusals.\n\nThe repertoire: 日曜日はちょっと… — 'Sunday's a bit…' — is a complete and final no; nothing comes after the ちょっと, and nothing is supposed to. 難しいですね — 'that's difficult' — means it isn't going to happen. 考えておきます — 'I'll think it over' — from a shop clerk or a business contact, almost always means the thinking is already done. また今度 — 'another time' — usually contains no other time. Add the physical set: the slow うーん, the tilted head, the breath drawn through teeth.\n\nThe learner mistake isn't producing these — it's not hearing them. 'I'm a little busy' sounds, to an English ear, like an invitation to reschedule: 'then how about Saturday?' But the vagueness WAS the answer, and pressing forces the refusal to get harder — an unkindness in both directions. When you hear ちょっと, the kind move is そうですか、また今度ぜひ — accept the soft no softly, whether or not the other person's また今度 contains a next time; yours can.\n\nAnd for your own refusals, the same machinery is yours from day one: すみません、日曜日はちょっと… is complete, polite, and kinder than any full sentence — the trailing-off pattern that Step 11's けど lesson develops further.",
        ex: [["日曜日はちょっと…", "A complete, final, polite no. Nothing follows the ちょっと."], ["考えておきます。", "'I'll think it over' — the thinking is usually already done."]],
      },
      {
        id: "tai", jp: "〜たいです", en: "want to do",
        exp: {
          what: "Wanting to DO something, spoken from the inside: たい bends the verb into an adjective of desire.",
          build: "ます-stem + たい(です), then conjugate like an い-adjective: 行きたくない, 行きたかった. The object often switches to が: 水が飲みたい.",
          when: "Your own wishes, plans, and cravings — and asking about them between equals: 何がしたいですか.",
          watch: "たい reports your OWN inner state. Asking a superior 何を食べたいですか peers inside them — 何にしますか does the job politely. And third parties are off limits: 妹は行きたいです claims to feel her wanting; Japanese reroutes that through 〜たがっている, which arrives in Stage 2.",
        },
        ex: [["日本へ行きたいです。", "I want to go to Japan."], ["水が飲みたいです。", "I want to drink water."], ["日本で何がしたいですか。— 京都に行きたいです。", "The want-question between equals, and its answer."]],
      },
      {
        id: "hoshii", jp: "〜がほしいです", en: "want (a thing)",
        exp: {
          what: "Wanting a THING. The wanted thing takes が, and the word behaves like an い-adjective.",
          build: "[thing] が ほしいです; ほしくない, ほしかった.",
          when: "Shopping, wishlists, and the birthday interrogation: 何がほしいですか.",
          watch: "The same inner-state restriction as たい: your own wanting only; other people's runs through ほしがっている (Stage 2). And when OFFERING something to a superior, ほしいですか pries — いかがですか is the graceful version; recognize it now.",
        },
        ex: [["新しいかばんがほしいです。", "I want a new bag."], ["時間がほしいです。", "I want time."], ["誕生日に何がほしいですか。— 新しいかばんがほしいです。", "The wish question — が on the wanted thing, both directions."]],
      },
      {
        id: "tsumori", jp: "〜つもりです", en: "intend to",
        exp: {
          what: "Stated intention: a plan you have actually settled on, not a mood.",
          build: "Dictionary form + つもりです. Negative plans put the ない first: 行かないつもりです — intending NOT to.",
          when: "Answering what-are-you-doing questions with commitment: 夏休みは何をするつもりですか.",
          watch: "つもり claims real intention — for a soft maybe, Japanese reaches for 〜たいと思います, which completes in Step 12 when と思います arrives. And the past, 〜るつもりでした, means intended-but-didn't: quiet regret built into tense.",
        },
        ex: [["夏に国へ帰るつもりです。", "I intend to return to my country in summer."], ["車を買うつもりです。", "I plan to buy a car."], ["夏休みは何をするつもりですか。— 国へ帰るつもりです。", "Plan question, committed answer."]],
      },
      {
        id: "niiku", jp: "〜に行きます", en: "go (somewhere) to do",
        exp: {
          what: "Movement with a mission: a purpose + に + a motion verb says you're going somewhere in order to do something.",
          build: "Take the ます form and drop ます to get the stem — 会います → 会い — then stem + に + 行く／来る／帰る. Action nouns slot in directly: 買い物に行きます.",
          when: "Any errand — shopping, meeting someone, swimming. One of the most-used everyday patterns there is.",
          watch: "The purpose slot holds a stem or a noun, never a whole clause: 会いに行く, not 会うに行く. And the destination keeps its own particle separately — デパートへ買い物に行きます carries both.",
        },
        ex: [["デパートへ買い物に行きます。", "I go to the department store to shop."], ["友達に会いに行きました。", "I went to meet a friend."]],
      },
      {
        id: "b-s5", jp: "作文 · 計画", en: "state a plan", kind: "build",
        requires: ["tai", "tsumori", "mashou", "niiku"],
        brief: "Write about something you are planning. Say what you want to do, what you intend to do, what you would like to do together, and where you are going in order to do it.",
        exp: {
          what: "Wanting, intending and proposing are three separate things in Japanese and one vague cloud in English. This puts them next to each other where the difference is visible.",
          build: "Three or four sentences about a single plan.",
          when: "Making arrangements, and answering \"what are you up to this weekend?\"",
          watch: "〜たい is your own desire and cannot be used to declare someone else's. 〜つもり is firmer than English \"planning to\" — it is a decision, not a notion. And ましょう assumes the other person is coming with you.",
        },
        ex: [],
      },
    ],
  },
  {
    cat: "Step 7 · Linking actions & time",
    level: "S3",
    bank: [["手を洗う", "to wash hands"], ["歯をみがく", "to brush teeth"], ["音楽", "music"], ["散歩する", "to take a walk"], ["宿題", "homework"], ["仕事", "work"], ["終わる", "to end"], ["話す", "to speak"]],
    points: [
      {
        id: "tekara", jp: "〜てから", en: "after doing",
        exp: {
          what: "After doing X, Y — two actions chained in strict order on the て-form.",
          build: "て-form + から, then the next clause: 手を洗ってから、食べます.",
          when: "Routines, instructions, itineraries — anywhere order matters.",
          watch: "This から is pure sequence — the reason-から (Step 11) attaches to whole clauses, this one to て-forms; position tells them apart. Tense lives only at the END: 食べてから行きました casts the whole chain into the past. And one てから per sentence is the natural load — chains of three read as a list wearing a costume.",
        },
        ex: [["手を洗ってから食べます。", "I eat after washing my hands."], ["仕事が終わってから飲みに行きました。", "After work ended, I went drinking."], ["仕事が終わってから、何をしますか。", "The after-work question — sequence inside a question."]],
      },
      {
        id: "atode", jp: "〜たあとで", en: "after ...",
        exp: {
          what: "After X — looser than てから, and happy to take a noun.",
          build: "Plain PAST verb + あとで (食べたあとで), or noun + のあとで (仕事のあとで).",
          when: "Afterwards-plans, and gentle scheduling: 会議のあとで話しましょう.",
          watch: "The verb before あとで is ALWAYS plain past — even when everything is in the future: 食べたあとで行きます. The た marks completed-relative-to, not past-in-time; English tense instinct fights this exactly once a sentence.",
        },
        ex: [["ごはんを食べたあとで散歩します。", "I take a walk after eating."], ["授業のあとで図書館へ行きます。", "After class I go to the library."], ["仕事のあとで、飲みに行きませんか。", "Noun + のあとで, wrapped in an invitation."]],
      },
      {
        id: "maeni", jp: "〜まえに", en: "before ...",
        exp: {
          what: "Before X — あとで's mirror.",
          build: "DICTIONARY form + 前に (寝る前に), or noun + の前に (食事の前に).",
          when: "Routines and warnings: before bed, before eating, before the meeting.",
          watch: "The mirror rule: BEFORE takes dictionary form even for past events — 食べる前に手を洗いました. Pair it with あとで's rule and keep both: before→る, after→た, regardless of when anything actually happened. The pair is one of the cleanest systems in the language once you stop consulting English tense.",
        },
        ex: [["寝るまえに歯をみがきます。", "I brush my teeth before sleeping."], ["食事のまえに手を洗います。", "I wash my hands before meals."], ["日本に来る前に、日本語を勉強しましたか。", "Dictionary form before 前に — even though everything here is past."]],
      },
      {
        id: "nagara", jp: "〜ながら", en: "while doing",
        exp: {
          what: "Doing X while doing Y — two actions, one person, one main event.",
          build: "ます-stem + ながら, main action LAST: 音楽を聞きながら勉強します — the studying is the point; the music is backdrop.",
          when: "Multitasking of every kind — and describing your habits: テレビを見ながら食べます.",
          watch: "One body only: both actions belong to the same person. Two different people doing things at once needs 〜ている間に, later. And the order is meaningful — the ながら clause is the background; swap them and you claim to be mainly listening while incidentally studying.",
        },
        ex: [["音楽を聞きながら勉強します。", "I study while listening to music."], ["歩きながら話しましょう。", "Let's talk while walking."], ["歩きながら話しましょう。", "Let's talk while we walk — background action first, main action last."]],
      },
      {
        id: "taritari", jp: "〜たり〜たりします", en: "do things like A and B",
        exp: {
          what: "Doing things LIKE X and Y — a sample of activities, order not implied.",
          build: "た-form + り, repeat, close with する — which carries all the tense: 読んだり書いたりします, 読んだり書いたりしました.",
          when: "Describing weekends, hobbies, and any answer to what-do-you-do questions that deserves more than one verb.",
          watch: "The final する is not optional — it holds the tense, and without it the sentence hangs unfinished. And unlike てから, no order is claimed: 食べたり飲んだりしました scatters the evening; 食べてから飲みました schedules it.",
        },
        ex: [["週末は本を読んだり、映画を見たりします。", "On weekends I read books, watch movies, and so on."], ["日曜日は掃除したり、洗濯したりしました。", "On Sunday I cleaned, did laundry, and such."], ["週末は何をしますか。— 映画を見たり、買い物したりします。", "The weekend question and its sampling answer."]],
      },
      {
        id: "kata", jp: "〜かた", en: "how to ...",
        exp: {
          what: "How-to as a noun: 方(かた) turns a verb into the way of doing it.",
          build: "ます-stem + 方: 読み方, 使い方, 作り方. The result is a NOUN, so it takes の from what it attaches to: 漢字の読み方.",
          when: "Asking how anything works — which makes it one of the most useful question machines you own.",
          watch: "The を becomes の: 漢字を読む, but 漢字の読み方 — keeping the を (漢字を読み方) is the signature error. This is also の quietly doing its noun-glue job from Step 3, one more time.",
        },
        ex: [["漢字の読み方を教えてください。", "Please teach me how to read this kanji."], ["この機械の使い方がわかりません。", "I don't know how to use this machine."], ["すみません、この漢字の読み方を教えてください。", "The learner's power tool: how-to + please-teach in one sentence."]],
      },
      {
        id: "toki", jp: "〜とき", en: "when ...",
        exp: {
          what: "When X, Y — とき turns any clause into a time.",
          build: "Plain clause + とき: 子どものとき, 忙しいとき, 雨のとき. Nouns take の, な-adjectives keep な.",
          when: "Childhood stories, conditions, habits — when it rains, when I was small, when I'm busy.",
          watch: "The famous subtlety: the tense BEFORE とき is relative to the main clause, not to now. 日本に行くとき、かばんを買いました — bought before/while going (still on this side of arrival). 日本に行ったとき、かばんを買いました — bought after arriving. One character, different city where the bag was bought.",
        },
        ex: [["ひまなとき、音楽を聞きます。", "When I'm free, I listen to music."], ["日本に来たとき、驚きました。", "When I came to Japan, I was surprised."], ["日本に行くとき、空港でかばんを買いました。", "る + とき: not yet arrived — the bag is from the airport at home."], ["日本に行ったとき、京都でかばんを買いました。", "た + とき: after arriving — the bag is from Kyoto."]],
      },
      {
        id: "deshou", jp: "〜でしょう", en: "probably",
        exp: {
          what: "でしょう states what's probably true — a forecast, a guess said aloud. It's です with the certainty dialed down.",
          build: "Plain form + でしょう: 晴れるでしょう, 来ないでしょう. After nouns and な-adjectives there's no だ: 雨でしょう.",
          when: "Weather forecasts run on it, and so does any guess about what you can't check — someone else's plans, tomorrow, the crowd at the station.",
          watch: "Rising でしょう？ is a different move — \"right?\", fishing for agreement, ね's pushier cousin. And だろう is the same word in plain register, common between friends.",
        },
        ex: [["明日は晴れるでしょう。", "It will probably be sunny tomorrow."], ["彼は来ないでしょう。", "He probably won't come."]],
      },
      {
        id: "b-s6", jp: "作文 · 一日のながれ", en: "narrate a routine", kind: "build",
        requires: ["tekara", "maeni", "nagara", "taritari"],
        brief: "Describe a typical day. Put one thing after another, one thing before another, two things happening at once, and a couple of examples of what else you get up to.",
        exp: {
          what: "Step 7 is entirely about arranging events in time, and the patterns only make sense relative to each other. One routine uses all of them without straining.",
          build: "Three or four sentences following a single day from beginning to end.",
          when: "Habits, routines and schedules — one of the most common early conversation topics there is.",
          watch: "〜まえに takes the dictionary form even when the event is firmly in the past: 寝るまえに歯をみがきました. 〜たあとで takes the past form. The tense lives on the main verb at the end, never on the connector.",
        },
        ex: [],
      },
    ],
  },
  {
    cat: "Checkpoint 2",
    level: "S3",
    bank: [["一緒に", "together"], ["写真", "photo"], ["音楽", "music"], ["宿題", "homework"], ["買う", "to buy"], ["帰る", "to go home"]],
    points: [
      {
        id: "b2", jp: "作文 · さそう", en: "make a plan with someone", kind: "build",
        requires: ["masenka", "tai", "tekara", "ni-time"],
        brief: "Invite someone to do something with you. Say when, say what you want to do, and put two actions in the right order.",
        exp: {
          what: "An invitation is the first thing most learners actually need to produce from scratch, and it needs several patterns cooperating: the invitation itself, a time, a desire, and a sequence.",
          build: "Two to four sentences. Start with the invitation, then fill in the details — that ordering is also how it works socially.",
          when: "Messaging a friend, proposing something to a colleague, replying to an invitation with a counter-proposal.",
          watch: "〜ませんか is an invitation and 〜たいです is your own wish; mixing them into 行きたいませんか is a common collision. And watch the に on time words — 明日 takes none, 七時 does.",
        },
        ex: [],
      },
      { id: "rc2", jp: "復習 · Steps 4–6", en: "checkpoint: requests, desire & linking", kind: "review", covers: ["tekudasai", "temoii", "tewaikemasen", "nakereba", "mashou", "masenka", "tai", "hoshii", "tsumori", "tekara", "maeni", "nagara", "taritari", "toki", "sb-must"], exp: "Mixed review of requests, permission, obligation, invitations, desire, and linking actions in time. In practice, combine at least two patterns in one sentence.", ex: [] },
    ],
  },
  {
    cat: "Step 8 · Existence & possession",
    level: "S4",
    bank: [["机", "desk"], ["いす", "chair"], ["猫", "cat"], ["子ども", "child"], ["銀行", "bank"], ["前", "front"], ["下", "under"], ["部屋", "room"]],
    points: [
      {
        id: "arimasu", jp: "あります / います", en: "there is / exists",
        exp: {
          what: "Existence: there is. ある for things, いる for anything alive — Japanese splits 'is' by animacy before it tells you anything else.",
          build: "[place] に [thing] が あります/います. Negatives: ありません, いません.",
          when: "What's around you, what a place has — and availability, which makes ありますか one of the most-used questions in the language: Wi-Fiはありますか。英語のメニューはありますか。",
          watch: "The animacy line is strict and drawn by aliveness, not importance: your car takes あります, your goldfish います. And the next lesson adds the one twist this rule can't call alone — あります for events happening.",
        },
        ex: [["机の上に本があります。", "There is a book on the desk."], ["公園に子どもがいます。", "There are children in the park."], ["すみません、英語のメニューはありますか。— はい、あります。", "THE availability question, asked and answered."]],
      },
      {
        id: "motteiru", jp: "〜を持っています", en: "have / own",
        exp: {
          what: "Having something on you, or owning it — 持つ frozen into the ている state.",
          build: "[thing] を持っています; negative 持っていません. The state of having, not the act of holding.",
          when: "Do-you-have questions of every kind: ペンを持っていますか。傘を持っていますか。",
          watch: "持っています is the state; 持ちます means will take/hold — offering 持ちましょうか uses that one. And living things are never possessions grammatically: 犬がいます, never 犬を持っています — the dog exists at your house; you don't carry it.",
        },
        ex: [["車を持っています。", "I have a car."], ["ペンを持っていますか。", "Do you have a pen?"], ["ペン、持っていますか。— はい、どうぞ。", "Got a pen? — casual particle-drop, and the handover."]],
      },
      {
        id: "location", jp: "〜は〜にあります / います", en: "X is (located) at Y",
        exp: {
          what: "Where something IS: the known thing takes は, its place takes に.",
          build: "AはBにあります/います, with position words slotting in through の: 駅の前に, いすの下に.",
          when: "Directions, descriptions, and the survival question: どこにありますか — or the shorter どこですか, which works everywhere.",
          watch: "Compare this to the arimasu-sentence and you are watching は and が at work: 机の上に本があります introduces a book; 本は机の上にあります locates the book we both know about. Same facts, different information flow — sb-waga's whole story, on location duty.",
        },
        ex: [["銀行は駅の前にあります。", "The bank is in front of the station."], ["猫はいすの下にいます。", "The cat is under the chair."], ["すみません、トイレはどこにありますか。— あそこです。", "THE survival question."]],
      },
      {
        id: "sb-nide2", jp: "に vs で · second look", en: "existing, located — or held", kind: "skill",
        exp: {
          what: "Step 2's rule: happening → で, located → に. It couldn't be finished there, because the being-somewhere verbs あります and います hadn't arrived. Now they have — and they bring the one case the old rule can't call on its own.",
          build: "Location keeps に, exactly as promised: 銀行は駅の前にあります. But あります has a second job — an event being held. パーティーがあります, 会議があります. When あります means 'takes place', the place takes で: 明日、学校でパーティーがあります. Same verb on the page; the meaning switched from existing to happening, and the particle follows the meaning, not the verb.",
          when: "Where things are → に. Where events happen → で. Where you're headed → に or へ, as in Step 6 — the destination never takes で.",
          watch: "The question is still the one you learned in Step 2 — is something happening here, or simply located here? What's new is that あります can now sit on either side of it. A book あります → に. A party あります → で.",
        },
        ex: [["机の上に本があります。", "The book exists there → に."], ["明日、学校でパーティーがあります。", "The party happens there → で, even with あります."]],
      },
      {
        id: "ageru", jp: "あげる・くれる・もらう", en: "giving and receiving", kind: "skill",
        exp: {
          what: "Three verbs for one English idea. English says give no matter which way the thing travels; Japanese makes you choose based on who ends up holding it. あげる is giving away from you, くれる is someone giving toward you, もらう is you receiving.",
          build: "あげる and くれる mark the recipient with に: 友達に本をあげました. 友達が本をくれました. もらう flips the sentence around — the giver takes に or から: 友達に本をもらいました.",
          when: "Any exchange at all: presents, help, advice, information, a lift home. It comes up far more often than the textbook placement suggests.",
          watch: "くれる can only point toward you or your side of a relationship. 先生が本をあげました, about a teacher giving you a book, is wrong — it has to be くれました. And notice there is no neutral option: Japanese forces you to take a position on who benefited, which English lets you dodge completely.",
        },
        ex: [["友達に本をあげました。", "I gave my friend a book. (away from me)"], ["友達が本をくれました。", "My friend gave me a book. (toward me)"], ["先生に薬をもらいました。", "I got medicine from the teacher."]],
      },
      { id: "cc-konbini", jp: "コンビニ・レストランの日本語", en: "convenience store & restaurant Japanese", kind: "culture", exp: "Staff speech is ultra-polite and formulaic. You don't need to produce it — you need to recognize the questions and know the two-word answers.", ex: [["袋はご利用ですか。— 大丈夫です。", "Need a bag? — I'm fine (no thanks)."], ["以上でよろしいですか。— はい。", "Will that be all? — Yes."]] },
      {
        id: "b-s7", jp: "作文 · 部屋のようす", en: "map a room", kind: "build",
        requires: ["arimasu", "location", "motteiru"],
        brief: "Describe the room you are sitting in. Say what is there, where two things sit in relation to each other, and one thing you have on you.",
        exp: {
          what: "Existence sentences are the first that force あります and います apart, and position words only mean anything once something exists to be positioned.",
          build: "Three or four sentences describing one space.",
          when: "Directions, descriptions, and telling someone where you left the thing.",
          watch: "あります for objects, います for anything alive — Japanese draws that line by animacy, not importance, so your car takes あります and your goldfish takes います. Position words sit between の and に: 机の上に.",
        },
        ex: [],
      },
    ],
  },
  {
    cat: "Step 9 · Adjectives & adverbs",
    level: "S4",
    bank: [["高い", "expensive; tall"], ["安い", "cheap"], ["寒い", "cold"], ["暑い", "hot"], ["静か", "quiet"], ["簡単", "easy"], ["面白い", "interesting"], ["広い", "spacious"]],
    points: [
      {
        id: "iadj", jp: "い形容詞 (i-adjectives)", en: "i-adjective conjugation",
        exp: {
          what: "い-adjectives conjugate themselves — tense and negation live on the adjective, and です contributes only politeness.",
          build: "Drop the い: 高くない (negative), 高かった (past), 高くなかった (past negative). です goes after any of them, unchanged.",
          when: "Describing anything, and answering どうでしたか — the how-was-it question that follows every movie, meal and trip.",
          watch: "Two traps carry most of the failures. 高いでした is the classic — でした belongs to nouns and な-adjectives; い-adjectives carry their own past (高かったです). And いい is irregular everywhere: よくない, よかった, よくなかった — never いくない. Chant it once a day until it's boring.",
        },
        ex: [["この店は高くないです。", "This shop is not expensive."], ["昨日は寒かったです。", "It was cold yesterday."], ["映画はどうでしたか。— とても面白かったです。", "Past tense rides the adjective; です just adds polish."]],
      },
      {
        id: "naadj", jp: "な形容詞 (na-adjectives)", en: "na-adjective usage",
        exp: {
          what: "な-adjectives are nouns wearing adjective clothing: な before a noun, です-machinery for everything else.",
          build: "静かな町 before a noun; 静かです, 静かじゃないです, 静かでした standing alone.",
          when: "Description, like the い-family — the split between the two families is arbitrary history, so the family of each word has to be learned with the word.",
          watch: "The な appears ONLY before a noun — 静かなです is wrong. The traps are the な-words that end in い: きれい and きらい both belong HERE, so きれいくない is wrong (きれいじゃない), and — from Step 3's の drill — きれいの人 is doubly wrong: it's きれいな人.",
        },
        ex: [["静かな町です。", "It's a quiet town."], ["この問題は簡単じゃないです。", "This problem is not easy."], ["どんな町ですか。— 静かで、きれいな町です。", "The what-kind question — な before the noun, で joining."]],
      },
      {
        id: "kute", jp: "〜くて / 〜で (connecting)", en: "and (adjectives)",
        exp: {
          what: "Joining adjectives into one description: and, without a second sentence.",
          build: "い-adjectives become 〜くて: 広くて明るい. な-adjectives and nouns take で: 静かで優しい, 先生で母です.",
          when: "Descriptions with two or more qualities — which is most descriptions worth giving.",
          watch: "Match the connector to the family: くて for い, で for な — mixing them is the visible error. いい joins as よくて. And the て carries a whisper of sequence or cause: 忙しくて、行けません leans on busy as the reason — a preview of how much work て does in this language.",
        },
        ex: [["この部屋は広くて明るいです。", "This room is spacious and bright."], ["彼は親切で優しいです。", "He is kind and gentle."], ["この店は安くて、おいしいです。", "Two claims, one sentence — the standard restaurant verdict."]],
      },
      {
        id: "narimasu", jp: "〜くなります / 〜になります", en: "become",
        exp: {
          what: "Becoming — change of state, with the change inside the verb なる.",
          build: "い-adjectives: 〜くなります (寒くなりました). な-adjectives and nouns: 〜になります (元気になりました, 医者になりました).",
          when: "Weather turning, people recovering, careers happening, prices rising.",
          watch: "なる is the it-happens twin — nobody has to do anything for 寒くなる. The someone-does-it twin is する, next lesson, and the pair is the transitivity logic from Step 4 wearing adjective clothing. Watch the joint: 寒くなる, never 寒いなる.",
        },
        ex: [["天気がよくなりました。", "The weather got better."], ["兄は医者になりました。", "My brother became a doctor."], ["日本語が上手になりましたね。", "The compliment of progress — becoming, aimed at you."]],
      },
      {
        id: "shimasu-change", jp: "〜くします / 〜にします", en: "make (something) ...",
        exp: {
          what: "Making something become — the deliberate twin of なります.",
          build: "い-adjectives: 〜くします (部屋を暖かくします). な-adjectives and nouns: 〜にします (音を静かにします).",
          when: "Requests and adjustments: warmer, quieter, cheaper, cleaner.",
          watch: "する needs a doer and a を — that is the whole difference from なる. 部屋が暖かくなりました (it warmed up) versus 部屋を暖かくしました (someone warmed it): the verb pair logic from Step 4, one more time, because it never stops applying.",
        },
        ex: [["部屋を暖かくしてください。", "Please make the room warm."], ["音を静かにしました。", "I made the sound quiet."], ["すみません、少し静かにしてください。", "The polite adjustment request — change-する riding てください."]],
      },
      {
        id: "nisuru", jp: "〜にします", en: "decide on",
        exp: {
          what: "Deciding on something — the choosing にします, mostly heard across counters.",
          build: "[chosen thing] にします: コーヒーにします. Question: 何にしますか.",
          when: "Ordering, choosing between options, settling any what-will-you-have.",
          watch: "One vowel from a different world: にします chooses, になります becomes — コーヒーにします orders a coffee; コーヒーになります is a prophecy. And 何にしますか is THE restaurant question; answering it with にします closes the loop politely.",
        },
        ex: [["私はコーヒーにします。", "I'll have coffee."], ["赤いのにします。", "I'll go with the red one."], ["何にしますか。— 私はうどんにします。", "THE ordering exchange, both halves."]],
      },
      {
        id: "amari", jp: "あまり〜ない", en: "not very",
        exp: {
          what: "Not very — a softener that only works holding hands with a negative.",
          build: "あまり + negative: あまり高くないです, あまり食べません.",
          when: "Polite lukewarmness — about food, hobbies, weather, and anything you'd rather not condemn outright.",
          watch: "The negative is not optional: あまり高いです is broken. In speech you will hear あんまり — same word, relaxed. And あまり好きじゃないです is the polite way to dislike something, which the liking lesson in Step 10 will lean on.",
        },
        ex: [["あまり高くないです。", "It's not very expensive."], ["あまりテレビを見ません。", "I don't watch TV much."], ["スポーツをしますか。— あまりしません。", "The polite lukewarm answer."]],
      },
      {
        id: "zenzen", jp: "ぜんぜん〜ない", en: "not at all",
        exp: {
          what: "Not at all — total negation's adverb.",
          build: "ぜんぜん + negative: ぜんぜんわかりません, ぜんぜんありません.",
          when: "Honest zeroes: no money, no idea, no time.",
          watch: "Textbook rule: negative required. Street truth: casual speech says ぜんぜん大丈夫 (totally fine) constantly — recognize it, enjoy it, and keep your own ぜんぜん glued to negatives for now; in writing the positive use still reads as slang.",
        },
        ex: [["ぜんぜんわかりません。", "I don't understand at all."], ["お金がぜんぜんありません。", "I have no money at all."], ["わかりましたか。— いいえ、ぜんぜんわかりませんでした。", "The honest zero, politely delivered."]],
      },
      {
        id: "totemo", jp: "とても / ちょっと", en: "very / a little",
        exp: {
          what: "The everyday degree dials: とても turns it up, ちょっと turns it down.",
          build: "Both sit before the adjective or verb: とても面白い, ちょっと疲れました.",
          when: "Everywhere — degree words are how opinions get their volume set.",
          watch: "ちょっと is double-booked: it measures smallness AND powers the soft refusal (the invitations step's ちょっと…). Tone and the trailing-off decide which. In speech すごく does とても's job, and めっちゃ sits further down the casual ladder — the slang stop next door covers that crowd.",
        },
        ex: [["この映画はとても面白いです。", "This movie is very interesting."], ["ちょっと疲れました。", "I'm a little tired."], ["日本の夏はどうですか。— とても暑いです。", "Volume set to high — the standard weather verdict."]],
      },
      { id: "cc-slang", jp: "すごい → すげー", en: "slang cousins of what you know", kind: "culture", exp: "Casual speech stretches and swaps what you just learned: すごい → すげー, and めっちゃ or 超 replace とても. Recognize them anywhere; use them only with friends.", ex: [["この店、めっちゃ安い！", "This place is super cheap! (casual とても)"], ["すげー！", "Whoa! (very casual — friends only)"]] },
      {
        id: "b-s8", jp: "作文 · 場所をえがく", en: "sell me a place", kind: "build",
        requires: ["iadj", "naadj", "kute", "narimasu"],
        brief: "Describe somewhere you like — a café, a park, your hometown. Use both adjective types, join two of them inside one sentence, and say how something changed.",
        exp: {
          what: "Two adjective systems that behave nothing alike, plus the join and the change-of-state. Step 9 is where description stops being one word at a time.",
          build: "Three or four sentences. At least one of them has to carry two adjectives joined together.",
          when: "Recommendations, reviews, describing anywhere you have been.",
          watch: "The join depends on the type: い-adjectives become 〜くて (広くて), while な-adjectives and nouns take で (静かで). And いい is irregular everywhere it shows up — よくて, よくない, よかった. Never いくて.",
        },
        ex: [],
      },
    ],
  },
  {
    cat: "Step 10 · Comparing & preferring",
    level: "S4",
    bank: [["夏", "summer"], ["冬", "winter"], ["果物", "fruit"], ["りんご", "apple"], ["歌", "song"], ["ピアノ", "piano"], ["野菜", "vegetables"], ["バス", "bus"]],
    points: [
      {
        id: "hou", jp: "〜より〜のほうが", en: "B more than A",
        exp: {
          what: "Comparing two things: the winner takes のほうが.",
          build: "AよりBのほうが + adjective: 電車よりバスのほうが安いです. The question: AとBと、どちらのほうが…ですか.",
          when: "Preferences, recommendations, and every which-is-better decision spoken aloud.",
          watch: "The adjective never changes — no -er, no more: the frame does all the comparing while 安い stays 安い. English keeps groping for morphology here; stop letting it. And answer the どちら question WITH のほうが even though it repeats: 猫のほうが好きです.",
        },
        ex: [["電車よりバスのほうが安いです。", "The bus is cheaper than the train."], ["夏より冬のほうが好きです。", "I like winter more than summer."], ["犬と猫と、どちらのほうが好きですか。— 猫のほうが好きです。", "THE comparison question, frame echoed in the answer."]],
      },
      {
        id: "ichiban", jp: "〜のなかで〜がいちばん", en: "the most (superlative)",
        exp: {
          what: "The superlative, made of number one: いちばん.",
          build: "[group] のなかで [X] がいちばん + adjective. Questions: 何が / 誰が / どこがいちばん…ですか.",
          when: "Favourites, records, rankings — and small talk's favourite question shape: 日本料理のなかで何がいちばん好きですか.",
          watch: "Question words take が (the rule from Step 1, still on duty), the group takes のなかで, and again no morphology — いちばん does the lifting while the adjective rests. Answering with just the winner + です is natural: 寿司です。",
        },
        ex: [["果物のなかでりんごがいちばん好きです。", "Among fruits, I like apples the most."], ["クラスのなかで田中さんがいちばん背が高いです。", "Tanaka-san is the tallest in the class."], ["日本料理のなかで何がいちばん好きですか。— 寿司です。", "Superlative question; predicate-echo answer."]],
      },
      {
        id: "suki", jp: "〜が好きです / きらいです", en: "like / dislike",
        exp: {
          what: "Liking, built as a な-adjective rather than a verb — which is why the liked thing takes が.",
          build: "[thing] が好きです. Stronger: 大好きです. Dislike: きらいです — but see the caution.",
          when: "Preferences of every kind, and the getting-to-know-you question: 〜が好きですか.",
          watch: "が, never を — Step 10's drum, drummed. And きらい lands HARD in conversation; polite dislike is あまり好きじゃないです, the あまり lesson doing social work. きらい also hides in the な-family despite its い — きらいくない is wrong twice.",
        },
        ex: [["音楽が好きです。", "I like music."], ["野菜がきらいです。", "I dislike vegetables."], ["日本の食べ物が好きですか。— はい、大好きです。", "The liking question, asked and amplified."]],
      },
      {
        id: "jouzu", jp: "〜が上手です / 下手です", en: "good at / bad at",
        exp: {
          what: "Skill: good at, bad at — the skill takes が.",
          build: "[skill] が上手です / 下手です.",
          when: "Praising others' abilities — and hearing your own praised, which will happen the moment you say こんにちは.",
          watch: "上手 praises OTHERS; about yourself use 得意 (strong suit) or 苦手 — the 得意 you met in the kanji module. 下手 about someone else is blunt; あまり上手じゃないです spares feelings. And when 日本語が上手ですね lands on you, the native move is deflection: いえいえ、まだまだです.",
        },
        ex: [["妹はピアノが上手です。", "My sister is good at piano."], ["私は歌が下手です。", "I'm bad at singing."], ["日本語が上手ですね。— いえいえ、まだまだです。", "The compliment you WILL receive, and its standard deflection."]],
      },
      {
        id: "wakaru", jp: "〜がわかります", en: "understand",
        exp: {
          what: "Understanding — what makes sense to you takes が.",
          build: "[thing] がわかります. わかりました — got it. わかりません — I don't understand, or I can't tell.",
          when: "Classrooms, directions, and the meta-question that keeps every conversation alive: わかりますか.",
          watch: "わかる vs 知る: 知っています is having the information; わかります is it making sense. The negatives split harder — 知りません (never heard of it) about a person you've met sounds cold; わかりません stays safe. When lost, the full sentence すみません、よくわかりません buys help without offence.",
        },
        ex: [["日本語が少しわかります。", "I understand a little Japanese."], ["意味がわかりません。", "I don't understand the meaning."], ["この言葉の意味がわかりますか。— いいえ、よくわかりません。", "The meaning question — 意味 from the kanji module, earning its keep."]],
      },
      {
        id: "nogasuki", jp: "〜のが好きです", en: "like doing",
        exp: {
          what: "Liking an activity — の turns the verb into a noun first, then 好き treats it like any liked thing.",
          build: "Dictionary form + のが好きです: 読むのが好きです.",
          when: "Hobbies, and the hobby question: 何をするのが好きですか.",
          watch: "This is の's fourth job — the one Step 3's drill promised was coming. Don't drop it: 読むが好き is broken; the verb can't take が until の makes it a noun. こと also works (読むことが好きです) — slightly stiffer, at home in writing; both are correct.",
        },
        ex: [["本を読むのが好きです。", "I like reading books."], ["料理を作るのが好きです。", "I like cooking."], ["何をするのが好きですか。— 音楽を聞くのが好きです。", "The hobby question — の quietly making nouns of verbs, twice."]],
      },
      {
        id: "potential", jp: "可能形 (〜られる / 〜える)", en: "saying you can do something",
        exp: {
          what: "English adds a separate word, can. Japanese bends the verb itself. There is no equivalent of can sitting in front — the ability is baked into the ending.",
          build: "Ichi verbs drop る and add られる: 食べる → 食べられる, 見る → 見られる. Go verbs shift their final sound to the e-row and add る: 話す → 話せる, 読む → 読める, 行く → 行ける, 買う → 買える. Two irregulars, both common: する → できる, 来る → 来られる.",
          when: "Ability, but just as often permission or possibility — この店でカードが使えますか asks whether cards are accepted, not whether you personally are capable.",
          watch: "The object usually switches from を to が: 日本語が話せます, not 日本語を話せます. This is the が-trap the next lesson drills. Also worth knowing early — for Ichi verbs the potential form is identical to the passive, so 食べられる means both can eat and is eaten. Context sorts it out, which is exactly why casual speech shortens the potential to 食べれる.",
        },
        ex: [["日本語が少し話せます。", "I can speak a little Japanese."], ["この店でカードが使えますか。", "Can I use a card at this shop?"], ["朝早く起きられません。", "I can't get up early."]],
      },
      {
        id: "sb-transitive2", jp: "自動詞・他動詞 · second look", en: "two different がs are about to collide", kind: "skill",
        exp: {
          what: "Step 4 taught the verb pairs and their particles: を for the twin you do, が for the twin that happens. The reason it resurfaces here, of all places: this step hands out が for a completely different reason, and the two がs need to stay apart in your head.",
          build: "ドアが開きました — が because 開く is the twin that happens by itself. 音楽が好きです — が because 好き belongs to the small set that demands it. Same particle, two unrelated reasons. In both cases the particle follows the verb's nature; what differs is which nature.",
          when: "Any time you catch yourself about to write が and can't say which rule put it there. Say the reason out loud: 'happens by itself', or 'one of the が words'. If neither fits, the particle is probably wrong.",
          watch: "The self-check from Step 4 still holds — を in front of an intransitive verb is always an error — and it matters more now, because this step's compositions are full of both がs at once. 窓が開いています and 犬が好きです earn their がs entirely differently.",
        },
        ex: [["ドアが開きました。", "It happened by itself → the intransitive twin's が."], ["音楽が好きです。", "A が word → the other が. Same particle, different law."]],
      },
      { id: "sb-ganotwo", jp: "を じゃなくて が", en: "the が-not-を reflex", kind: "skill", exp: "A small set of words takes が where English instinct says 'object': 好き, きらい, 上手, 下手, ほしい, わかる, できる — and every potential form (日本語が話せる, 朝早く起きられる). 〜を好き sounds off to native ears — this lesson trains the reflex until が feels automatic.", ex: [["日本語がわかります。", "I understand Japanese."], ["新しいくつがほしいです。", "I want new shoes."]] },
      {
        id: "b-s9", jp: "作文 · 好みを言う", en: "rank and prefer", kind: "build",
        requires: ["ichiban", "suki", "potential", "sb-ganotwo"],
        brief: "Pick a category — food, music, cities — and say which one is your favourite, what you like, and one thing you are good or bad at. Check every particle before you submit.",
        exp: {
          what: "Step 10's real subject isn't comparison, it's が turning up exactly where English swears there should be an object. This composition is a が-trap minefield, deliberately.",
          build: "Three or four sentences. Every 好き, 上手, 下手 and わかる in your writing deserves a second look.",
          when: "Preferences, recommendations, introductions — this comes up constantly.",
          watch: "音楽が好きです, not 音楽を好きです. The thing you like is grammatically the thing doing the pleasing, which is bizarre for about a month and then permanent. And 上手 isn't used about yourself; 得意 is the modest version.",
        },
        ex: [],
      },
    ],
  },
  {
    cat: "Step 11 · Reasons, contrast & connectors",
    level: "S4",
    bank: [["頭", "head"], ["雨", "rain"], ["時間", "time"], ["遅れる", "to be late"], ["窓", "window"], ["開ける", "to open"], ["忙しい", "busy"], ["痛い", "painful"]],
    points: [
      {
        id: "kara-because", jp: "〜から (because)", en: "because / so",
        exp: {
          what: "Reason first, から, then the result — Japanese states the cause before the effect.",
          build: "[reason clause] から、[result]. Standalone answer: 〜からです.",
          when: "Explaining yourself, and answering どうして — where 〜からです is the complete polite answer.",
          watch: "The order is the mirror of English 'because', which trails its reason — flip your instinct. After a NOUN, から means from (Step 3); after a clause, because — position decides. And a から on every sentence reads as defending yourself; ので, next lesson, is the pressure valve.",
        },
        ex: [["暑いから、窓を開けました。", "Because it's hot, I opened the window."], ["時間がないから、急ぎましょう。", "We have no time, so let's hurry."], ["どうして日本語を勉強していますか。— 日本で働きたいからです。", "The why-question and its complete からです answer."]],
      },
      {
        id: "node", jp: "〜ので", en: "because (softer)",
        exp: {
          what: "The softer because — presenting the reason as circumstance rather than argument.",
          build: "Plain clause + ので. Nouns and な-adjectives interpose な: 雨なので, 静かなので.",
          when: "Polite explanations, requests, and apologies — where から might sound like pleading a case, ので simply reports how things stand.",
          watch: "The な is the trap: 雨だので is wrong, 雨なので is right — the same な that appears before ん in 学生なんです, doing the same job. Writing to anyone senior, reach for ので; it reads as adult.",
        },
        ex: [["頭が痛いので、帰ります。", "I'm going home because I have a headache."], ["雨なので、家にいます。", "Since it's raining, I'll stay home."], ["頭が痛いので、お先に失礼します。", "The polite early exit — reason as circumstance, not excuse."]],
      },
      {
        id: "ga-but", jp: "〜が / けど (but)", en: "but / although",
        exp: {
          what: "Joining two clauses that pull against each other: but.",
          build: "[clause] が、[clause] — neutral-polite. けど is its casual cousin, けれど and けれども climb back up the formality ladder.",
          when: "Contrasts, concessions, and the polite preamble — すみませんが、 before a request isn't contrasting anything; it's cushioning.",
          watch: "That preamble-が is worth having on purpose: すみませんが、駅はどこですか reads as courtesy, not contradiction. And the trailing-off usage — ending AT the けど — is its own move, covered next lesson; don't read those sentences as unfinished.",
        },
        ex: [["高いですが、おいしいです。", "It's expensive, but delicious."], ["行きたいけど、時間がありません。", "I want to go, but I have no time."], ["すみませんが、駅はどこですか。", "The cushion-が — no contrast, pure courtesy."]],
      },
      { id: "cc-kedo", jp: "〜けど…", en: "the sentence that trails off on purpose", kind: "culture",
        exp: "You just learned けど and が as 'but' — here is the part no textbook leads with: Japanese routinely ends the sentence there. ちょっと高いんですけど… — it's a bit expensive, and the sentence is over. Nothing is missing; the unsaid half (…so could we talk about the price?) is the point, handed to the listener to complete.\n\nIn English a trailing 'but…' sounds unfinished or passive-aggressive. In Japanese it's polished — softer than saying the conclusion aloud, because the conclusion might force the other person to refuse, and this way nobody has to. You'll hear it constantly in requests: すみません、駅に行きたいんですけど… is a complete, polite request for directions — the ん you met in Step 3 and the けど from two lessons ago, doing their best work together.\n\nRecognition first, then production: end your request at けど and stop talking. The silence is doing grammar.",
        ex: [["駅に行きたいんですけど…", "A complete request for directions — the asking lives in the unsaid half."], ["ちょっと高いんですけど…", "A complete negotiation opener."]],
      },
      {
        id: "demo", jp: "でも / そして / それから", en: "but / and / and then",
        exp: {
          what: "The sentence-starters: でも (but), そして (and), それから (and then) — connection across a full stop.",
          build: "Start the new sentence with them: 雨でした。でも、出かけました。",
          when: "Longer thoughts, stories, and anywhere one sentence isn't enough — which is soon.",
          watch: "でも STARTS sentences; が and けど JOIN clauses — でも in the middle of a sentence is the visible learner seam. それから sequences (and then); そして adds without sequencing. Speech also opens with で alone — a clipped それで — recognize it.",
        },
        ex: [["雨でした。でも、出かけました。", "It was raining. But I went out."], ["朝ごはんを食べました。それから、学校へ行きました。", "I ate breakfast. Then I went to school."], ["朝ごはんを食べました。それから、学校へ行きました。", "Sequence across the full stop."]],
      },
      {
        id: "toiu", jp: "〜という", en: "called / named",
        exp: {
          what: "Introducing a name the listener may not know: called, named.",
          build: "[name] という [noun]: 「花」という映画, ポチという犬.",
          when: "Titles, names, new words — and the learner's power tool: asking what things are called.",
          watch: "The question form is the treasure here: これは日本語で何といいますか asks the name of anything you can point at, and the answer comes back in the same frame — 「はさみ」といいます. One pattern, infinite vocabulary lessons, free.",
        },
        ex: [["「花」という映画を見ました。", "I watched a movie called 'Hana'."], ["ポチという犬を飼っています。", "I have a dog named Pochi."], ["これは日本語で何といいますか。— 「はさみ」といいます。", "The what's-it-called question — infinite vocabulary, one frame."]],
      },
      {
        id: "doushite", jp: "どうして / なぜ〜からです", en: "why? ... because",
        exp: {
          what: "Asking why, and answering it as a pair: どうして…か。— 〜からです。",
          build: "どうして (neutral-polite), なぜ (formal, written), なんで (casual) — three registers of the same question. Answer with 〜からです.",
          when: "Any why. どうしてですか alone follows anything anyone says.",
          watch: "Bare why-questions can press hard in Japanese — どうして来ないんですか with the explanatory ん (Step 3's cc) softens the demand into curiosity. Choose the register with the relationship: なんで with friends, どうして as default, なぜ on paper.",
        },
        ex: [["どうして遅れましたか。", "Why were you late?"], ["電車が止まったからです。", "Because the train stopped."], ["どうして遅れたんですか。— 電車が止まったからです。", "Why softened with ん, answered with からです."]],
      },
      {
        id: "nanika", jp: "何か / どこか / だれか", en: "something / somewhere / someone",
        exp: {
          what: "Something, someone, somewhere — question words plus か stop asking and start gesturing.",
          build: "何か, 誰か, どこか, いつか. Particles often drop after them: 何か食べたい.",
          when: "Offers, vague plans, and half-formed wants: 何か飲みますか。どこか行きたいです。",
          watch: "The one-syllable trap: 何か食べましたか asks WHETHER you ate (yes/no); 何を食べましたか asks WHAT you ate (content). Answer type follows question type — a はい to the を-version answers a question nobody asked. sb-negq's statement-tracking rule, from the other side.",
        },
        ex: [["何か食べたいです。", "I want to eat something."], ["どこかへ行きましょう。", "Let's go somewhere."], ["何か飲みますか。— はい、じゃあお茶をください。", "The something-offer: a yes/no question wearing a question word."]],
      },
      {
        id: "sb-orthography", jp: "漢字とかな", en: "which script a word gets", kind: "skill",
        exp: {
          what: "Japanese has no spelling in the English sense — you can't misspell 食べる. What it has instead is convention about which script each word wears, and wearing the wrong one reads as odd rather than incorrect.",
          build: "The rough division: content words take kanji (食べる, 時間, 会社), grammar takes kana (は, を, ます, ください, から), and loanwords take katakana. A handful of very common words are conventionally kana even though kanji exist for them — ある, いる, する, とても, ちょっと, きれい.",
          when: "Every time you write. Handwriting and typing pull in opposite directions: typing hands you kanji for free, so learners routinely over-convert.",
          watch: "Over-using kanji is the more common learner error, not under-using — 綺麗 exists but きれい is what ordinary writing uses. This is also why the grader marks kana-where-kanji-is-standard as worth knowing rather than a fix: it isn't wrong, just a chance to level up. The genuine trap is homophones, where the kanji carries the whole meaning: 暑い and 熱い, 会う and 合う, 帰る and 変える.",
        },
        ex: [["きれいな部屋です。", "Conventionally kana, even though 綺麗 exists."], ["暑い日に熱いお茶を飲みます。", "A hot day and hot tea — identical sound, different kanji."]],
      },
      { id: "sb-waga2", jp: "は vs が · second look", en: "the refresher, with everything you know now", kind: "skill", exp: "You met は vs が back in Step 2. Now you have contrast, reasons, and comparisons — the places where the choice really matters. A known topic keeps は even through a long sentence (この店は高いですが、おいしいです), while が introduces, answers, and marks preference targets (コーヒーのほうが好きです). If the sentence answers 'which, who, or what' — reach for が.", ex: [["この店は高いですが、おいしいです。", "Topic は carries through the contrast."], ["誰が作りましたか。— 母が作りました。", "Question and answer: が both times."]] },
      {
        id: "sb-pronouns2", jp: "私・あなた · second look", en: "when the pronoun must stay", kind: "skill",
        exp: {
          what: "Step 3's advice was delete it — and it couldn't be finished there, because the main place 私 genuinely earns its keep needs grammar you didn't have yet: a whole clause describing a noun (Step 4's 名詞修飾).",
          build: "A describing clause carries its own subject slot, and when that subject isn't obvious from context, it has to be said: 私が好きなスポーツはテニスです — the 私が belongs to the clause, telling you whose liking it is. Swap the subject and the clause follows: 母が作った料理. Inside a describing clause the subject takes が, never は — the rule from the lesson next door.",
          when: "Describing clauses whose subject needs saying, direct contrast (私は行きますが、妹は行きません — Step 3 already gave you this one), answers to だれが questions, and introducing yourself.",
          watch: "The over-correction is real: learners who took Step 3 to heart start deleting every 私, and then a sentence like 私が好きなスポーツはテニスです looks 'too English' to them. It isn't — it is exactly how a native speaker says it when the clause needs an owner. Deleting the pronoun is a default, not a law.",
        },
        ex: [["私が好きなスポーツはテニスです。", "私 stays: the describing clause needs its own subject — and it takes が."], ["母が作った料理がいちばんおいしいです。", "Same slot, different owner — the clause says whose."]],
      },
      {
        id: "b-s10", jp: "作文 · 理由を言う", en: "make your case", kind: "build",
        requires: ["kara-because", "node", "ga-but", "doushite"],
        brief: "Argue for something small — why you prefer one commute, one coffee, one season. Give a reason, give a softer reason, admit one drawback, and answer your own \"why.\"",
        exp: {
          what: "The last composition before the stage review, and the closest thing yet to real writing: a position, some support, and an honest concession. Every connector in Step 11 earns its place here.",
          build: "Four or five sentences. This is the longest thing you have been asked to write, and that is the point.",
          when: "Opinions, explanations, and any email where you have to justify something.",
          watch: "から and ので differ in feel more than in meaning. ので is softer and more objective, which is why it dominates polite explanations and apologies; から can come across as defending yourself. Writing to someone senior, reach for ので.",
        },
        ex: [],
      },
    ],
  },
  {
    cat: "Step 12 · Past N5 · the shape-changers",
    level: "S4",
    bank: [["思う", "to think"], ["言う", "to say"], ["雨が降る", "to rain"], ["作る", "to make"], ["時間", "time"], ["会議", "meeting"], ["電気", "electricity; lights"], ["終わる", "to end"]],
    points: [
      {
        id: "sb-omou", jp: "〜と思います", en: "reporting a thought, back to front", kind: "skill",
        exp: {
          what: "To report a thought, a quote, or anything anyone said, Japanese puts the whole reported thing FIRST and the reporting verb last — the same back-to-front shape you met with noun modification. English says I think that this shop is expensive. Japanese says this-shop-is-expensive, I-think.",
          build: "[a complete sentence in PLAIN form] + と思います. 高いと思います. The same frame carries 〜と言いました (said) and 〜と聞きました (heard). The clause before と stays plain however polite the ending is.",
          when: "Opinions, hedging, and repeating what someone told you. It is also how you stop stating everything as flat fact, which is most of what makes writing sound adult rather than robotic.",
          watch: "です never appears before と思います — 高いですと思います is wrong; it is 高いと思います. Nouns and な-adjectives need だ instead: 学生だと思います. And Japanese negates the thought rather than the verb, so 来ないと思います (I think he won't come) is far more natural than 来ると思いません.",
        },
        ex: [["この店は高いと思います。", "I think this shop is expensive."], ["彼は学生だと思います。", "I think he's a student. (noun → だ)"], ["明日は来ないと思います。", "I don't think he'll come tomorrow. (negate the thought)"]],
      },
      {
        id: "passive", jp: "受身形 (〜られる)", en: "when it happens to you",
        exp: {
          what: "The passive, and the reason it belongs here rather than later: for Ichi verbs it is the exact same form as the potential you just learned. 見られる means both can be seen and is being seen, and the only way to tell is the rest of the sentence.",
          build: "Ichi verbs: drop る, add られる — 見る → 見られる. Go verbs shift their final sound to the a-row and add れる — 読む → 読まれる, 言う → 言われる, 使う → 使われる. Irregular: する → される, 来る → 来られる. The person it happened to becomes the topic, and the one who did it takes に: 私は先生に名前を聞かれました.",
          when: "Far more often than English passive, because Japanese uses it to say something happened to me, often with a flavour of inconvenience. 雨に降られました means I got rained on, and there is genuine complaint in it.",
          watch: "Because Go verbs use the a-row (読まれる) and their potential uses the e-row (読める), those two stay comfortably apart. Ichi verbs give you no such help. This collision is the whole reason casual speech invented 見れる for the potential — the shortcut exists to protect the distinction.",
        },
        ex: [["私は先生に名前を聞かれました。", "The teacher asked me my name. (it happened to me)"], ["この店は多くの人に使われています。", "This shop is used by a lot of people."], ["雨に降られました。", "I got caught in the rain. (and I'm not pleased)"]],
      },
      {
        id: "tara", jp: "〜たら / 〜と", en: "if, and when",
        exp: {
          what: "English leans on one word, if, and lets context sort out whether you mean a real possibility or an inevitable consequence. Japanese splits those apart, and picking the wrong one changes what you are claiming about the world.",
          build: "〜たら is built from the plain past: 食べる → 食べたら, 行く → 行ったら, 高い → 高かったら. It covers both if and when for one-off events. 〜と attaches to the plain non-past (行くと) and means every single time, without exception — a law of nature, not a plan.",
          when: "〜たら for anything that might or might not happen, and for when-then sequences. 〜と for machines, rules, and reliable consequences: このボタンを押すと、ドアが開きます.",
          watch: "〜と cannot be followed by a request, an invitation, or anything expressing your will — 東京に行くと、電話してください is wrong, because 〜と describes automatic consequences and a request is not automatic. Use 〜たら. Note also that 〜たら is built from the た-form, which means every sound change you learned in Step 4 is working for you here. One more thing, so the map is honest: Japanese has four ifs — 〜たら, 〜と, 〜ば, 〜なら. Stage 1 gives you the first two; 〜ば and 〜なら arrive in Stage 2, and the four-way choice only makes sense once they do.",
        },
        ex: [["時間があったら、行きます。", "If I have time, I'll go."], ["このボタンを押すと、ドアが開きます。", "Press this button and the door opens. (every time)"], ["日本に着いたら、電話してください。", "When you arrive in Japan, please call. (a request → たら)"]],
      },
      {
        id: "b-s11", jp: "作文 · しくみを説明する", en: "explain how something works", kind: "build",
        requires: ["tara", "sb-omou", "sb-transitive", "passive"],
        brief: "Explain how something works — a machine, an app, a process at your job. Say what happens automatically, what someone has to do, what you think about it, and one thing that gets done to it.",
        exp: {
          what: "The four patterns in this step all move pieces of a sentence somewhere English would not put them. This composition makes them cooperate on a single topic, which is where the shapes stop feeling like tricks and start feeling like Japanese.",
          build: "Four or five sentences about one thing. Somewhere in there: an automatic consequence, a state or an action from a verb pair, a passive, and one opinion.",
          when: "Explaining anything to anyone — this is a large share of adult writing at work.",
          watch: "The two collisions from this step are both live here. 〜と must describe something automatic, never a request. And with Ichi verbs, potential and passive are the same shape, so make the rest of the sentence do the disambiguating.",
        },
        ex: [],
      },
    ],
  },
  {
    cat: "Checkpoint 3 · Stage review",
    level: "S4",
    bank: [["部屋", "room"], ["猫", "cat"], ["夏", "summer"], ["果物", "fruit"], ["時間", "time"], ["雨", "rain"]],
    points: [
      {
        id: "b3", jp: "作文 · どちらが好きか", en: "argue a preference", kind: "build",
        requires: ["hou", "kara-because", "suki", "sb-nounmod"],
        brief: "Say which of two things you prefer and why. Describe at least one of them with a clause placed before the noun — 母が作った料理, 日本語を勉強している人, 去年見た映画.",
        exp: {
          what: "The hardest composition in Stage 1, and the one closest to real writing: a claim, a reason, and a noun described by a whole clause rather than a single adjective.",
          build: "Two to four sentences. The noun-modifying clause is the piece to plan first — decide what you're describing before you decide what you prefer, because it's the structure most likely to come out backwards.",
          when: "Opinions, recommendations, and any answer longer than one line to \"which do you like?\"",
          watch: "The describing clause goes BEFORE its noun and uses plain form even when the rest of your sentence is polite: 母が作った料理が好きです is correct — 作った stays plain inside the clause while です carries the politeness at the end. Mixing that up is the single most common error at this stage.",
        },
        ex: [],
      },
      { id: "rc3", jp: "復習 · Stage 1", en: "checkpoint: the full stage", kind: "review", covers: ["arimasu", "location", "ageru", "iadj", "naadj", "kute", "narimasu", "amari", "hou", "ichiban", "suki", "potential", "wakaru", "nogasuki", "kara-because", "node", "ga-but", "toiu", "sb-pronouns", "sb-waga", "sb-ganotwo", "sb-transitive", "sb-orthography", "sb-omou", "sb-nide2", "sb-transitive2", "sb-pronouns2"], exp: "The full Stage 1 review — existence, adjectives, comparisons, and connectors, plus the skill-builder judgments (pronouns, は/が, が-not-を). Write like you mean it.", ex: [] },
      {
        id: "ms-n5", jp: "N5の範囲、ぜんぶ", en: "everything the N5 syllabus expects", kind: "review",
        exp: "Everything the N5 syllabus expects of you is now behind you.\n\nNot most of it, and not the important parts. The particles, both verb families, the て-form, the plain past, existence, adjectives, comparison, reasons, and the shape-changers. That is the list. You have walked through all of it.\n\nWhat it means in practice is more useful than the label. You can say what something is and what it is not, now and in the past. You can ask where, when, who, what and why, and understand the answer's shape even when its words are new. You can chain two actions, put one before the other, and give a reason for either. You can describe a room, compare two things, and turn down an invitation without giving offence.\n\nThe test is a reference point rather than a finish line, which is why it is named here and almost nowhere else in this app. What comes next is not harder grammar so much as more of it at once — the same sentences, carrying more.",
        ex: [],
      },
    ],
  },
  {
    cat: "Step 13 · て-form, second wind",
    level: "S5",
    bank: [["全部", "all"], ["忘れる", "to forget"], ["かさ", "umbrella"], ["財布", "wallet"], ["落とす", "to drop"], ["最後まで", "to the end"], ["予約", "reservation"], ["窓", "window"], ["電気", "electricity; lights"], ["晩ご飯", "dinner"]],
    points: [
      {
        id: "teshimau", jp: "〜てしまう", en: "done — completely, or regrettably", n4: true,
        exp: {
          what: "One ending, two flavours sharing a root: the action went all the way. Neutrally that's completion — 最後まで読んでしまいました, read to the very end. Emotionally it's a result you can't take back — 財布を落としてしまいました, and the regret lives inside the verb rather than being added to it.",
          build: "て-form + しまう, which then conjugates like any Go verb: 食べてしまいます, 食べてしまいました.",
          when: "Finishing things entirely, and reporting accidents, losses, and things said that shouldn't have been. English needs a whole phrase — 'went and lost it', 'ended up eating it all'; Japanese folds it into the verb.",
          watch: "Context picks the flavour, and the past tense with an unfortunate object almost always reads as regret. Don't reach for it on happy outcomes — 合格してしまいました reads as 'I regrettably passed'. In speech this compresses to ちゃう / じゃう — the culture stop two lessons ahead — so 忘れちゃった IS 忘れてしまった, not a verb you never learned.",
        },
        ex: [["宿題を全部やってしまいました。", "Completion: every bit of it, done."], ["電車の中でかさを忘れてしまいました。", "Regret: the umbrella is gone, and the verb says how you feel about it."]],
      },
      {
        id: "teoku", jp: "〜ておく", en: "do it now, for later", n4: true,
        exp: {
          what: "An action done in advance so that later goes smoothly. English says 'ahead of time' or 'go ahead and'; Japanese puts the preparation inside the verb: ホテルを予約しておきます — book it now, because the trip is coming.",
          build: "て-form + おく: 買っておく, 作っておく, 調べておく. Polite 〜ておきます, past 〜ておきました.",
          when: "Preparations of every size — chilling drinks before guests arrive, reading the papers before the meeting, leaving a note before going out. A quieter second use points the same idea at not-doing: そのままにしておいてください, leave it as it is.",
          watch: "The trap is translating it as plain future. 買います says you will buy it; 買っておきます says you're buying it now so that later works. If you can't name the 'later', ておく is the wrong tool. Speech clips it to とく — 買っとく — same culture stop as ちゃう.",
        },
        ex: [["ホテルを予約しておきました。", "Booked ahead — the later is already in the verb's mind."], ["飲み物を冷やしておいてください。", "Please chill the drinks (for when they're needed)."]],
      },
      {
        id: "tearu", jp: "〜てある", en: "it's been done, and it shows", n4: true,
        exp: {
          what: "A state that exists because somebody deliberately made it: 窓が開けてあります — the window stands open, and someone opened it on purpose. English needs the awkward 'has been opened (and still is)'; Japanese keeps a form for exactly this.",
          build: "て-form of a TRANSITIVE verb + ある, and the thing takes が: 窓が開けてある, 晩ご飯が作ってある. The doer goes unmentioned — the point is the arranged state, not who arranged it.",
          when: "Describing preparations already in place — very often the visible result of someone's earlier ておく. 予約してあります: the booking exists; relax.",
          watch: "This corners the transitivity work from Steps 4 and 10, so slow down. 窓が開いている (intransitive + ている): it happens to be open, no story. 窓が開けてある (transitive + てある): it's open because someone wanted it open. Same window, different claim about intent. And yes — the particle really is が on a transitive verb's object here, the one place your を-reflex must stand down.",
        },
        ex: [["窓が開けてあります。", "Open on purpose — the state carries the intent."], ["晩ご飯はもう作ってあります。", "Dinner's already made (someone saw to it)."]],
      },
      {
        id: "temiru", jp: "〜てみる", en: "try doing — do it and see", n4: true,
        exp: {
          what: "Do it, and see what happens: て-form + みる turns any action into an experiment. 食べてみる — try eating it; the claim is only that you'll do it once and find out.",
          build: "て-form + みる, which then conjugates like the verb 見る it came from: 食べてみます, 食べてみました, 食べてみたいです — that last stack, try-want-to, is everywhere.",
          when: "First attempts, tastings, fittings, and gentle invitations: 使ってみてください — please give it a try.",
          watch: "てみる is trying-as-experiment, not trying-as-effort. Struggling to open a stuck jar isn't 開けてみる — that machinery comes later. Here you simply don't know the result yet.",
        },
        ex: [["このケーキを食べてみました。", "I tried the cake — to see."], ["日本語で話してみます。", "I'll try speaking in Japanese."], ["この服を着てみてもいいですか。", "May I try this on? — てみる riding Step 5's permission ask."]],
      },
      {
        id: "teikutekuru", jp: "〜ていく・〜てくる", en: "change, moving away and toward", n4: true,
        exp: {
          what: "行く and 来る, attached to a て-form, stop being about walking: they give an action a DIRECTION relative to now. 暖かくなってきました — it's been getting warm (change arriving toward the present); これから寒くなっていきます — it'll go on getting cold (change heading away from now).",
          build: "て-form + いく (away from now, or physically away): 持っていく — take along. て-form + くる (toward now, or physically toward): 持ってくる — bring. The literal senses — take and bring — are the everyday workhorses.",
          when: "Carrying things (持っていく・持ってくる is daily vocabulary), and narrating change: だんだん〜てきた for what's been building, 〜ていく for what lies ahead.",
          watch: "ちょっと行ってきます — \"off I go (and I'll be back)\" — is this pattern fossilized into the leaving-home ritual いってきます from Step 1's greetings. The grammar was hiding in the phrase all along.",
        },
        ex: [["雨が降ってきました。", "It's started raining — the change arrived on you."], ["これから暑くなっていきます。", "From here it'll keep getting hotter."], ["お茶を持ってきてください。", "Please bring some tea."]],
      },
      { id: "cc-chau", jp: "ちゃう・じゃう・とく", en: "the て-forms you'll actually hear", kind: "culture", n4: true,
        exp: "The patterns you just learned wear casual disguises, and speech uses the disguises most of the time.\n\n〜てしまう becomes 〜ちゃう: 食べてしまった → 食べちゃった. Where the て-form voices to で, it becomes 〜じゃう: 飲んでしまった → 飲んじゃった. 〜ておく becomes 〜とく: 買っておく → 買っとく, and 言っておいて → 言っといて. てある has no clipped cousin — it was already short.\n\nThe clipped forms conjugate as ordinary Go verbs, so they climb the politeness ladder too: 忘れちゃいました is polite in shape and casual at heart, and you will hear it constantly. Recognition first; production when the room is casual. The compression itself runs on the same sound-shift instinct as さんぽ's ぽ — Japanese clips where the mouth wants to go.",
        ex: [["かさ、忘れちゃった。", "= 忘れてしまった — gone, and I feel it."], ["先に言っといてね。", "= 言っておいて — tell them ahead of time, okay?"]],
      },
      {
        id: "sb-aspect", jp: "ている・てある・ておく・てしまう", en: "four continuations, one choice", kind: "skill", n4: true,
        exp: {
          what: "The て-form now has four continuations, and they divide the world cleanly: ている (ongoing, or a state), てある (a state someone arranged), ておく (arranging now for later), てしまう (went all the way). Choosing between them IS the grammar — the verb itself barely changes.",
          build: "Ask two questions. State or action? States → ている / てある; actions → ておく / てしまう. Then: does intent matter? てある and ておく carry purpose; ている and てしまう don't ask for any.",
          when: "Any description of how things stand, any preparation, any completed-or-regretted act — between them the four cover a large share of everyday verb endings.",
          watch: "Two mistakes do most of the damage. First: 窓が開いてある — welding the intransitive twin to てある. てある demands the transitive (開けてある), because an arranged state needs an arranger; the twins from Steps 4 and 10 run straight through this lesson at higher stakes. Second: parking ておく where nothing is being prepared — if you can't say what the 'later' is, you wanted plain form or ている.",
        },
        ex: [["電気がついています。", "State, no story — intransitive + ている."], ["電気がつけてあります。", "State with intent — transitive + てある."], ["電気をつけておきます。", "Action now, for later — ておく."]],
      },
      { id: "cc-drop", jp: "コーヒー、飲む？", en: "the particles speech leaves out", kind: "culture", n4: true,
        exp: "Casual speech drops particles the way English drops 'have you' from 'been there?'. コーヒーを飲みますか becomes コーヒー飲む？ — を gone, か gone, politeness gone, and to Japanese ears nothing is missing. は and を vanish most readily; が and に mostly stay, because they carry information that position alone can't recover.\n\nTwo cautions. This is a SPOKEN register — dropped particles in writing read as texting or carelessness, and the checker will keep flagging them in your written practice here, correctly. And don't file casual speech as 'the same thing minus particles': the particles are still there in the grammar; speech just trusts you to hear them. If you can't say which particle was dropped, that sentence is teaching you less than it seems to be.",
        ex: [["コーヒー、飲む？", "= コーヒーを飲みますか — casual strips を and か."], ["それ、何？", "= それは何ですか — the は is silent, not absent."]],
      },
      { id: "cc-aizuchi", jp: "あいづち", en: "the listening noises", kind: "culture", n4: true,
        exp: "Japanese conversation expects the listener to make noise. うん、はい、へえ、そうですか、なるほど — these are あいづち, and they don't mean 'I agree'; they mean 'I'm here, keep going'. A speaker getting silence from you will stop and ask what's wrong; on the phone あいづち are practically mandatory, which is why phone Japanese sounds like a duet.\n\nEnglish back-channels exist ('mm-hm', 'right') but at a fraction of the density, so the learner error runs both directions: too few あいづち reads as cold or lost, and reading them literally reads too much in — はい mid-story means 'go on', not 'yes, I agree'. That one causes real misunderstandings in meetings, and not only for learners.\n\nStart with three: そうですか for new information, へえ for mild surprise, なるほど for 'now I see'. Place them at the ends of the other person's phrases and feel the conversation relax.",
        ex: [["へえ、そうなんですか。", "Mild surprise + keep-going — the workhorse pair."], ["なるほど。", "'Now I see' — respectful, adult, everywhere."]],
      },
      { id: "cc-ritual", jp: "いただきます・よろしく", en: "phrases that are actions", kind: "culture", n4: true,
        exp: "Some phrases aren't sentences with meanings so much as actions with sounds. いただきます before eating and ごちそうさまでした after aren't 'bon appétit' and 'that was delicious' — they're a bracket pair marking receipt of a meal, said even alone, even over a convenience-store onigiri. Skipping them isn't rude exactly; it's like not closing a door you opened.\n\nよろしくお願いします is the biggest and least translatable: said when meeting someone, joining a team, or asking a favour, it means roughly 'I place this — and myself — in your good hands'. No English sentence swaps in, which is why learners underuse it; Japanese speakers end half their introductions and emails with it. おじゃまします, on entering someone's home, announces 'I am intruding' — the acknowledgment IS the courtesy.\n\nYou met the workplace set (お疲れさまです) back in the greetings lesson — same species. These are load-bearing: produce them early and often, and let the grammar catch up later.",
        ex: [["いただきます。", "Before eating — even alone. A bracket, not a comment."], ["これからよろしくお願いします。", "Meeting someone new — untranslatable, indispensable."]],
      },
      {
        id: "b-s13", jp: "作文 · きのうのしっぱい", en: "a small failure story", kind: "build", n4: true,
        requires: ["teshimau", "teoku", "temiru"],
        brief: "Tell a small failure from your week — something forgotten, dropped, or regretted — using てしまいました for the damage, ておきました for what you'd prepared (or should have), and てみました for what you tried.",
        exp: {
          what: "The て-form's second wind, pointed at the most tellable kind of story: the minor disaster.",
          build: "One てしまいました (the regrettable part), one ておきました (the preparation), one てみました (the attempt). Chain with てから or あとで if the timeline needs it — Step 7 still works here.",
          when: "Small-failure stories are social currency in any language; in Japanese they run on exactly these three forms.",
          watch: "Keep the regret where it belongs: てしまう marks the mishap, not every verb in the story. One しまう per disaster is usually the honest count.",
        },
        ex: [],
      },
    ],
  },

  {
    cat: "Step 14 · Giving, receiving & kindness",
    level: "S5",
    bank: [["手伝う", "to help"], ["写真", "photo"], ["先生", "teacher"], ["妹", "younger sister"], ["弟", "younger brother"], ["お土産", "souvenir"], ["宿題", "homework"], ["母", "my mother"]],
    points: [
      {
        id: "teageru", jp: "〜てあげる・〜てくれる・〜てもらう", en: "favors, seen from each end",
        exp: {
          what: "Step 8 taught the giving triangle for THINGS. Attach the same three verbs to a て-form and the triangle now moves ACTIONS: help given, help received, help arranged. English says \"for me\" or says nothing at all — Japanese builds the direction of the kindness into the verb itself.",
          build: "て-form + あげる (I do it for someone), + くれる (someone does it for ME), + もらう (I receive the doing). 手伝ってあげる・手伝ってくれる・手伝ってもらう — one act of helping, three camera angles.",
          when: "Constantly. Daily Japanese marks who benefited from almost every act; leaving the verb off (母は朝ごはんを作りました) is grammatical but oddly cold — it reports labor without acknowledging the kindness.",
          watch: "てあげる said TO the person you're helping can sound like presenting a bill — \"I'll do this FOR you.\" Fine in the third person; offering help directly, reach for 手伝いましょうか (Step 6) instead.",
        },
        ex: [["友達が宿題を手伝ってくれました。", "My friend helped me with my homework — a kindness toward me."], ["私は妹に本を読んであげました。", "I read my little sister a book — my kindness outward."], ["田中さんに写真を撮ってもらいました。", "I had Tanaka take a photo — the favor, received."]],
      },
      {
        id: "ageru2", jp: "あげる・くれる・もらう · 二回目", en: "the same event, told twice",
        exp: {
          what: "Step 8's triangle, second look — because one real event can be told from two corners. 田中さんが本をくれました and 田中さんに本をもらいました describe the SAME gift. What changes is the subject: who your sentence is about.",
          build: "くれる: the GIVER is the subject, marked が — 田中さんが（私に）くれました. もらう: the RECEIVER is the subject — （私は）田中さんにもらいました, and the giver drops to に. Same event, two frames; the particles swap roles with the verb.",
          when: "Choose by what the surrounding story is about. Talking about Tanaka's generosity → くれる keeps him on stage. Talking about your day and what came into it → もらう keeps you there.",
          watch: "The classic wreck is mixing frames: 田中さんがもらいました reads as \"TANAKA received\" — the opposite event. Before anything else, check that verb and particles are telling the same story.",
        },
        ex: [["田中さんが本をくれました。", "Tanaka gave me a book — told from his side."], ["田中さんに本をもらいました。", "I got a book from Tanaka — the same gift, told from mine."], ["誰にもらいましたか。— 母にもらいました。", "Who was it from? — From my mom."]],
      },
      {
        id: "itadaku", jp: "いただく・くださる・さしあげる", en: "the giving verbs, dressed up",
        exp: {
          what: "The triangle has a formal wardrobe. もらう has いただく, くれる has くださる, あげる has さしあげる — the same three directions, worn when the other party stands above you: teachers, bosses, customers, strangers being kind.",
          build: "Drop-in replacements, て-forms and all: 先生に教えていただきました, 先生が教えてくださいました. The directions and particles are exactly the plain triangle's — only the altitude changed.",
          when: "Any favor crossing upward. You already say the most famous one: いただきます before meals is this verb — you have been receiving the meal politely all along.",
          watch: "さしあげる is rare in speech and easily servile — offers of help upward usually hide in other forms (お手伝いしましょうか). This is your first real taste of keigo; the full system opens Stage 3, spaced out, and these three verbs are its seed.",
        },
        ex: [["先生に漢字を教えていただきました。", "The teacher kindly taught me kanji — received, upward."], ["先生が本をくださいました。", "The teacher kindly gave me a book."], ["「いただきます」は、この動詞です。", "The before-meals いただきます is this verb — receiving, politely."]],
      },
      {
        id: "cc-itadakimasu", jp: "いただきます", en: "the verb you have been saying all along", kind: "culture", n4: true,
        exp: "You have said it before every meal since your first week, and it is the verb you just learned. いただきます is いただく — the humble form of もらう — in its ます shape. Literally: I humbly receive. Not a set phrase that happens to sound like a verb, but the verb itself, conjugated, doing exactly the job Step 14 describes.\n\nThat much is uncontested. What comes next usually is not.\n\nThe story that circulates — in English and in a good deal of Japanese material — is that いただきます thanks the life of the ingredients, or the farmer, or the person who cooked. It is a lovely account and it is a modern gloss rather than an etymology. The linguist 近藤泰弘 has called the thanking-the-food and thanking-the-cook explanations かなり疑わしい, quite doubtful. The dates do not settle it either: one source finds it in a book of 1812, Japanese Wikipedia gives 1934, and Kondō reports an earlier mealtime example in a primary-school text of 1917. Those citations disagree, and a phrase that spread through schools in the last century is a different thing from an ancient rite.\n\nSo what is safe to carry: the verb is genuinely humble, the receiving is genuinely the point, and the beautiful explanation is younger than it sounds. Step 13's cc-ritual covered what the phrase DOES — a bracket around a meal, said even alone over a convenience-store onigiri. This one is where it comes from.",
        ex: [],
      },
      {
        id: "tehoshii", jp: "〜てほしい", en: "wanting someone else to do it",
        exp: {
          what: "ほしい (Step 6) wanted things. Attach it to a て-form and you want an ACTION — from someone else. 来てほしい: I want you to come.",
          build: "[person] に + て-form + ほしい: 友達に来てほしいです. The wanter is you; the hoped-for doer takes に. The negative wish is 〜ないでほしい: 吸わないでほしい — a please-don't, wished rather than requested.",
          when: "Softer than a request — てください asks; てほしい confesses. Real speech floats it with Step 3's ん: 手伝ってほしいんですが…, the classic favor opener that trails off before even asking.",
          watch: "It's still YOUR want — same first-person gravity as たい and ほしい. Claiming to know what someone else wants done needs the other-minds machinery at the end of this stage.",
        },
        ex: [["友達に来てほしいです。", "I want my friend to come."], ["ちょっと手伝ってほしいんですが…。", "I could use a little help… — the favor opener."], ["ここでたばこを吸わないでほしいです。", "I'd rather you didn't smoke here."]],
      },
      {
        id: "sb-kuremorau", jp: "くれる vs もらう", en: "one kindness, two sentences", kind: "skill",
        exp: {
          what: "Learners freeze mid-sentence deciding between these two — because they're deciding in the wrong place. The skill is picking the FRAME first: who is this sentence about? After that the verb is forced and no decision remains.",
          build: "About the giver → くれる, giver が. About you, the receiver → もらう, giver に. Run the check before you speak, not during.",
          when: "Every time a favor enters a story — and especially in answers, where the question sets the frame: 誰が手伝ってくれましたか keeps the giver's frame; your own day's story invites もらう.",
          watch: "The に in a もらう sentence is the GIVER, not a destination — 友達にもらいました is from the friend. English \"from\" tempts から, which also works with people; に is simply the more common choice.",
        },
        ex: [["妹が写真を撮ってくれました。", "About my sister's kindness — her frame, が."], ["先生に直してもらいました。", "About my problem getting fixed — my frame, giver に."]],
      },
      {
        id: "cc-favor", jp: "お願いの重さ", en: "the weight of favors", kind: "culture",
        exp: "Favors weigh more here — not because people are less kind, but because kindness is carefully accounted. A small お願い opens a small account, and the language keeps the books: てくれる acknowledges the credit, てもらう records the receipt, お返し — the return gift — settles the balance. This is why the favor-opener sounds so indirect (手伝ってほしいんですが… trails off before even asking), and why refusing to let someone repay you can, oddly, be unkind: it leaves their account open.\n\nNone of this is cynicism. The accounting is how care circulates. The point of お土産 was never the cookies — it's the message \"you were with me on my trip.\" A borrowed umbrella returns with a small something; a favor received gets mentioned the NEXT time you meet (この間はありがとうございました — thanks for the other day), because a kindness is worth two thanks.\n\nOne habit to start now: thank people with the verb. 手伝ってくれてありがとう lands warmer than a bare ありがとう, because it names the kindness while thanking it.",
        ex: [["手伝ってくれてありがとう。", "Thanks for helping me — the kindness, named."], ["これ、京都のお土産です。", "A souvenir from Kyoto — the real message: you came along."]],
      },
      {
        id: "b-s14", jp: "作文 · 親切", en: "kindnesses, in both directions", kind: "build",
        requires: ["teageru", "ageru2", "itadaku", "tehoshii"],
        brief: "Write about kindness in your week: one favor someone did for you, one you did for someone, and one thing you wish someone would do. Keep the directions honest — every favor carries its verb.",
        exp: {
          what: "The step's whole triangle, pointed at your own week.",
          build: "One てくれました (or てくださいました if it came from above), one てあげました, one てほしいです. The particles carry each frame: giver が with くれる, giver に with もらう・いただく.",
          when: "This is diary Japanese — exactly the register these verbs live in.",
          watch: "Check each sentence twice: verb direction first, then particles. A flipped frame (田中さんがもらいました) is the classic wreck — and keep the politeness level steady across all three sentences.",
        },
        ex: [],
      },
    ],
  },

  {
    cat: "Step 15 · Guessing, seeming & hearsay",
    level: "S5",
    bank: [["天気", "weather"], ["ニュース", "news"], ["ケーキ", "cake"], ["結婚", "marriage"], ["忙しい", "busy"], ["閉まる", "to close"], ["落ちる", "to fall"], ["チケット", "ticket"]],
    points: [
      {
        id: "kamo", jp: "〜かもしれません", en: "might be — the honest maybe",
        exp: {
          what: "The claim-lowerer: attach it to a finished thought and you're at maybe — fifty-fifty or below, with no embarrassment owed if it turns out wrong.",
          build: "Plain form + かもしれません: 行くかもしれません, 高かったかもしれません. Nouns and な-adjectives attach bare — 雨かもしれません, no だ. Friends clip it to かも.",
          when: "Plans not yet firm, guesses you're not ready to defend, the weather, other people's whereabouts.",
          watch: "でしょう (Step 7) leans probable; かもしれません sits at maybe. Swapping them changes how much you're promising — the certainty dial matters more in Japanese than in English.",
        },
        ex: [["明日は雨かもしれません。", "It might rain tomorrow — a real maybe."], ["田中さんは来ないかもしれません。", "Tanaka might not come."], ["もう帰ったかもしれません。", "He may have already gone home."]],
      },
      {
        id: "hazu", jp: "〜はずです", en: "should be — expectation with receipts",
        exp: {
          what: "はず says the conclusion FOLLOWS from something you know: he bought a ticket, so he should be coming. Not hope — reasoning, said aloud.",
          build: "Plain form + はずです: 来るはずです. Nouns take の (学生のはずです); な-adjectives keep な (静かなはずです).",
          when: "Schedules, logic, vouching: the store should be open (today's no holiday); this answer should be right (I checked twice).",
          watch: "If nothing backs it, you wanted かもしれません or でしょう instead. And 〜はずがない runs the reasoning in reverse: can't possibly be.",
        },
        ex: [["チケットを買いましたから、来るはずです。", "He bought a ticket, so he should be coming."], ["今日は休みじゃないから、店は開いているはずです。", "It's not a holiday — the shop should be open."], ["そんなはずがありません。", "That can't be right."]],
      },
      {
        id: "youda", jp: "〜ようです・みたいです", en: "seems so — judged by eye",
        exp: {
          what: "A judgment from evidence in front of you: the lights are off, so nobody's home — it seems. みたいです is the same claim in casual dress.",
          build: "Plain form + ようです. Nouns take の before よう (雨のようです); な-adjectives keep な. みたい attaches bare to everything: 雨みたいです.",
          when: "Reading situations aloud — someone seems busy, the shop seems closed, he seems to have caught a cold.",
          watch: "ようだ judges from YOUR observation; らしい (next) leans on what you heard. The source of the evidence picks the form.",
        },
        ex: [["誰もいないようです。", "Seems nobody's home — the lights are off."], ["田中さんは忙しいみたいです。", "Tanaka seems busy — casual dress."], ["雨のようです。", "Seems to be rain — の joins the noun."]],
      },
      {
        id: "rashii", jp: "〜らしい", en: "apparently — seeming at second hand",
        exp: {
          what: "A judgment leaning on what you heard or read, your own eyes only half-involved. Rumor absorbed, source blurred: apparently they're getting married.",
          build: "Plain form + らしい: 結婚するらしいです. Nouns attach bare: 学生らしいです.",
          when: "Passing on what's circulating without vouching for it — shop closures, engagements, transfers: the natural habitat of らしい.",
          watch: "らしい has a second job: true-to-type. 春らしい天気 is weather that's properly spring; 学生らしい服 is student-LIKE clothes. Same word, different machine — context decides.",
        },
        ex: [["田中さんは結婚するらしいです。", "Apparently Tanaka's getting married."], ["あの店は閉まるらしいです。", "Apparently that shop is closing."], ["彼は学生らしいです。", "Apparently he's a student — or: he's every inch one. Context picks."]],
      },
      {
        id: "souda-mite", jp: "〜そうです（様子）", en: "looks about to",
        exp: {
          what: "Read straight off the surface: 降りそう — rain any minute, by the look of the sky; おいしそう — looks delicious, untasted. It claims only what the surface shows.",
          build: "Verb STEM + そう: 降りそうです, 落ちそうです. い-adjectives drop the い: おいしそう, 高そう. いい is irregular — よさそう; ない → なさそう.",
          when: "Imminent things and first impressions — food you haven't tried, rain that hasn't landed, a bag about to fall off the desk.",
          watch: "This そう takes STEMS; the hearsay そう (next lesson) takes finished plain forms. 降りそう (looks like rain) vs 降るそう (I hear it'll rain) — one kana apart. The skill lesson after next drills exactly this.",
        },
        ex: [["雨が降りそうです。", "Looks like rain any minute."], ["このケーキはおいしそうです。", "This cake looks delicious."], ["かばんが落ちそうです。", "That bag's about to fall."]],
      },
      {
        id: "souda-denbun", jp: "〜そうです（伝聞）", en: "I hear that…",
        exp: {
          what: "Hearsay with a straight face: 降るそうです — I hear it will rain; the forecast said so. Information passed on whole, source implied and standing behind it.",
          build: "PLAIN FORM + そうです — the finished clause, untouched: 降るそうです, 高いそうです, 学生だそうです (nouns need だ). Tense and negation live INSIDE the clause: 降らないそうです, 降ったそうです.",
          when: "Relaying news, forecasts, what someone told you — with more confidence than らしい, because the source is nameable.",
          watch: "Never そうでした, never そうじゃないです — this そう itself won't conjugate. If the news is past or negative, the clause inside carries it.",
        },
        ex: [["明日は雨が降るそうです。", "I hear it'll rain tomorrow — the forecast says so."], ["あの店は安いそうです。", "That shop's cheap, I hear."], ["田中さんは学生だそうです。", "I hear Tanaka's a student — だ before hearsay そう."]],
      },
      {
        id: "sb-sou", jp: "降りそう・降るそう・そうですね", en: "one syllable, three machines", kind: "skill",
        exp: {
          what: "Three near-identical shapes, three different claims: 降りそうです reads the sky, 降るそうです repeats the forecast, そうですね agrees with your neighbor. English needs three different sentences; Japanese splits them by what そう attaches to.",
          build: "The attach point is everything. STEM + そう = looks-about-to. PLAIN CLAUSE + そう = hearsay. Bare そうです（ね） standing alone = the everyday agreement — cc-yes, from all the way back in Step 1, finally meeting its relatives.",
          when: "Weather talk runs on all three at once — which is why this drill exists, and why it waited until both parents were taught.",
          watch: "One kana decides: 降り (stem) versus 降る (plain). Misread it and you claim sight where you meant rumor. When in doubt, listen for what stands before そう.",
        },
        ex: [["雨が降りそうです。", "The sky says so."], ["雨が降るそうです。", "The news says so."], ["いい天気ですね。— そうですね。", "The neighbor says so — and you agree."]],
      },
      {
        id: "cc-hedge", jp: "断定しない", en: "why certainty gets rounded down", kind: "culture",
        exp: "Listen to a week of Japanese and notice how rarely anyone flatly says that anything IS. The weather might (かもしれません), the train seems (ようです), tomorrow is probably (でしょう), I think (と思います) — hedges stacked even around things the speaker knows perfectly well. This isn't indecision. Rounding certainty down leaves room — for the other person, for new information, for being wrong without anyone losing face. Assertion is a small act of force, and the language prefers to knock before entering.\n\nSo don't read the hedges as weakness, and don't strip them out to sound confident. 明日は雨です where 雨でしょう belongs doesn't sound sure of itself — it sounds like you personally schedule the rain. Even disagreement enters the room hedged: 違うかもしれませんが… (\"I may be wrong, but…\") is how a differing opinion gets a hearing.\n\nFor your own Japanese, one rule of thumb: hedge one notch below what you feel. You will almost never sound underconfident, and you will very often sound exactly right.",
        ex: [["違うかもしれませんが…。", "\"I may be wrong, but…\" — disagreement, entering politely."], ["明日は雨でしょう。", "Even the forecast hedges — でしょう, not です."]],
      },
      {
        id: "b-s15", jp: "作文 · うわさ", en: "four kinds of knowing", kind: "build",
        requires: ["souda-denbun", "youda", "kamo", "hazu"],
        brief: "Pass on one piece of news you heard, read one situation from what you can see, add one honest maybe, and one reasoned should. Four sentences, four kinds of knowing.",
        exp: {
          what: "The whole evidence system, pointed at one small story.",
          build: "One 〜そうです (hearsay), one 〜ようです・みたいです, one 〜かもしれません, one 〜はずです. Watch the joints: の・な before よう, だ before hearsay そう after nouns, nothing before かもしれません.",
          when: "This is how news actually moves between people — hedged, sourced, reasoned.",
          watch: "Don't let the four sentences end interchangeably. Each form claims a different kind of knowing; if two could swap endings without changing anything, one of them is dishonest.",
        },
        ex: [],
      },
    ],
  },

  {
    cat: "Step 16 · The four ifs",
    level: "S5",
    bank: [["電車", "train"], ["チケット", "ticket"], ["医者", "doctor"], ["薬", "medicine"], ["京都", "Kyoto"], ["天気", "weather"], ["休む", "to rest"], ["ボタン", "button"]],
    points: [
      {
        id: "ba", jp: "〜ば", en: "the logical if",
        exp: {
          what: "Condition as equation: if X holds, Y follows. The most neutral of the four ifs — the one proverbs and general advice run on: 聞けば、わかります — ask, and you'll understand.",
          build: "う-verbs shift the last sound to the え row + ば (行く→行けば, 飲む→飲めば); る-verbs take れば (食べれば); い-adjectives take ければ (安ければ). Negative: なければ. する→すれば, 来る→来れば, いい→よければ.",
          when: "General truths and conditions where the focus falls on WHAT FOLLOWS: 安ければ、買います — IF it's cheap (that's the open question), I'll buy.",
          watch: "You've been conjugating ば for months without knowing it: なければなりません is \"if you don't…, it won't do\" — Step 5's obligation was a ば-sentence all along. One care: requests after ば sound stiff unless the condition is a state (時間があれば、来てください is fine); when the condition is an action and the follow-up is your will, たら is safer.",
        },
        ex: [["聞けば、わかります。", "Ask, and you'll understand."], ["安ければ、買います。", "If it's cheap, I'll buy it."], ["時間があれば、来てください。", "If you have time, please come — a state, so ば carries the request fine."]],
      },
      {
        id: "nara", jp: "〜なら", en: "the topical if",
        exp: {
          what: "\"If that's the situation we're talking about…\" なら takes what the other person said — or what context offers — and builds on it: going to Kyoto? — なら, take the train.",
          build: "Plain clause or bare noun + なら: 行くなら, 京都なら. No だ after nouns.",
          when: "Advice and reactions. 京都なら、電車がいいですよ answers someone's plan; お茶なら、あの店 answers someone's craving. The condition is borrowed, not predicted.",
          watch: "なら is the only if that can point BACKWARD in time: 行くなら、チケットを買っておいてください — the buying happens BEFORE the going. たら's result always follows its condition; なら's advice may precede it. None of the other ifs can do this.",
        },
        ex: [["京都へ行くなら、電車がいいですよ。", "If you're going to Kyoto, the train's your friend."], ["お茶なら、あの店が安いです。", "If it's tea you're after, that shop is cheap."], ["行くなら、早く行きましょう。", "If we're going, let's go early."]],
      },
      {
        id: "taradou", jp: "〜たらどうですか", en: "advice wearing an if",
        exp: {
          what: "\"How about if you…?\" — a suggestion that leaves the decision entirely with the other person.",
          build: "たら-form + どうですか: 先生に聞いたらどうですか. Among friends it clips to 〜たらどう？, or even a bare 〜たら？ with rising pitch.",
          when: "The natural next move after someone tells you a problem — suggesting without pushing.",
          watch: "Tone matters: said flat, 〜たらどうですか can land as \"why haven't you already?\" Keep it light, or cushion it: 少し休んだらどうですか.",
        },
        ex: [["先生に聞いたらどうですか。", "How about asking the teacher?"], ["少し休んだらどうですか。", "How about resting a little?"], ["医者に行ったらどうですか。", "Maybe see a doctor?"]],
      },
      {
        id: "sb-if4", jp: "たら・と・ば・なら", en: "four ifs, four claims", kind: "skill",
        exp: {
          what: "The set is complete — the promise Step 12 planted is kept. Four ifs, four claims: たら (one-off, if-or-when), と (every time, automatic), ば (logical equation, focus on the result), なら (borrowed topic, advice attached). Many sentences accept two of them; the choice tunes what you're claiming.",
          build: "Quick tells: a request or invitation follows → たら (or なら). A law of nature → と. A proverb, or the condition is the open question → ば. Reacting to their plan → なら — and only なら can advise about BEFORE the condition.",
          when: "Every if-sentence from now on. When two feel right, they often both are — choose by claim, not by fear.",
          watch: "Two hard walls, everything else is tuning: と never precedes a request or act of will; なら is the only backward-pointing if.",
        },
        ex: [["時間があったら、行きます。", "One-off possibility → たら."], ["春になると、暖かくなります。", "Every year, automatically → と."], ["行くなら、早く。", "Their plan, your advice → なら."]],
      },
      {
        id: "b-s16", jp: "作文 · アドバイス", en: "advice that stays gentle", kind: "build",
        requires: ["tara", "ba", "nara", "taradou"],
        brief: "A friend tells you a problem. Write the advice: one 〜たらどうですか suggestion, one 〜なら tip that reacts to their situation, and one more condition with ば or たら. Leave the decision with them.",
        exp: {
          what: "The step's whole toolkit, pointed at the gentlest real-world job there is: advising a friend without pushing.",
          build: "One 〜たらどうですか, one 〜なら built on their situation, one ば or たら condition. Close warm — ね still does real work here, all the way from Step 1.",
          when: "Combine with Step 15's hedges (かもしれませんが…) and this reads like a native message.",
          watch: "Never と for advice — automatic consequences aren't suggestions. And keep the decision theirs: advice that commands stops being advice.",
        },
        ex: [],
      },
    ],
  },

  {
    cat: "Checkpoint 4",
    level: "S5",
    points: [
      { id: "rc4", jp: "復習 · Steps 13–16", en: "checkpoint: aspect, kindness, evidence, ifs", kind: "review", covers: ["teshimau", "teoku", "tearu", "sb-aspect", "temiru", "teikutekuru", "teageru", "ageru2", "itadaku", "tehoshii", "sb-kuremorau", "kamo", "hazu", "youda", "rashii", "souda-mite", "souda-denbun", "sb-sou", "ba", "nara", "taradou", "sb-if4"], exp: "Stage 2's first checkpoint — the て-form's second wind, the favor triangle in both registers, the whole evidence dial, and all four ifs. These four steps are one arc: what you do, what you owe, what you know, and what would follow.", ex: [] },
    ],
  },

  {
    cat: "Step 17 · Intentions, decisions & change",
    level: "S6",
    bank: [["来年", "next year"], ["会議", "meeting"], ["予定", "schedule"], ["靴", "shoes"], ["来月", "next month"], ["毎朝", "every morning"], ["たばこ", "tobacco"], ["東京", "Tokyo"]],
    points: [
      {
        id: "you-vol", jp: "〜よう（意向形）", en: "the plain let's",
        exp: {
          what: "ましょう's plain twin — the volitional: 行こう is \"let's go\" among friends, and \"right, I'll go\" said to yourself. Half of everyday self-talk runs on it.",
          build: "う-verbs shift the last sound to the お-row + う: 行く→行こう, 飲む→飲もう. る-verbs take よう: 食べよう. する→しよう, 来る→来よう.",
          when: "Casual proposals (映画を見よう！), and decisions muttered at yourself (そろそろ帰ろう). It's also the base the next lesson builds plans on.",
          watch: "The register split is the usual one: ましょう for anyone, 〜よう for friends and diaries. Same meaning, different clothes.",
        },
        ex: [["そろそろ帰ろう。", "Time to head home — said to yourself."], ["一緒に映画を見よう。", "Let's watch a movie — the casual invitation."], ["今日は早く寝よう。", "Tonight, early to bed — a small resolution."]],
      },
      {
        id: "youtoomou", jp: "〜ようと思っています", en: "a plan you're carrying",
        exp: {
          what: "The volitional grows up: よう + と思っています states a plan that's been living in your head — \"I'm thinking I'll…\" Softer than つもり, warmer than a schedule.",
          build: "Volitional + と思っています: 日本へ行こうと思っています. The と is Step 12's quoting と — you're quoting your own intention, so everything before it stays plain.",
          when: "Sharing plans without carving them in stone — the default way to say what's next in your life.",
          watch: "と思います marks a decision forming right now, this second; と思っています means it's been on your mind a while. The ています does its usual state-work.",
        },
        ex: [["来年、日本へ行こうと思っています。", "I'm thinking of going to Japan next year."], ["新しい車を買おうと思っています。", "I've been thinking I'll buy a new car."], ["日本語をもっと勉強しようと思っています。", "Planning to study more Japanese."]],
      },
      {
        id: "kotonisuru", jp: "〜ことにする", en: "deciding it — your choice",
        exp: {
          what: "The moment of choosing, marked: 行くことにしました — I've decided to go. The decision is yours, and ことにする performs it.",
          build: "Plain form + ことにする: 行くことにします／しました. Deciding NOT to: 行かないことにしました — the negative lives inside, as usual.",
          when: "Announcing choices — quitting, starting, going, skipping dessert.",
          watch: "ことにしている, with ている, is a decision you keep re-making — a personal rule: 毎朝散歩することにしています, I make it a rule to walk every morning.",
        },
        ex: [["日本へ行くことにしました。", "I've decided to go to Japan."], ["たばこを吸わないことにしました。", "I've decided to quit smoking."], ["毎朝散歩することにしています。", "I make it a rule to walk every morning."]],
      },
      {
        id: "kotoninaru", jp: "〜ことになる", en: "it's been decided",
        exp: {
          what: "The same shape with なる: it has come about — decided by someone else, by circumstances, by the world. 行くことになりました: it's been arranged that I'm going.",
          build: "Plain form + ことになる. The standing-rule version is ことになっている: ここでは靴を脱ぐことになっています — shoes off here, that's the arrangement.",
          when: "Transfers, schedules, rules — anything settled above your head, or politely framed as if it were.",
          watch: "The modesty twist: Japanese often announces even CHOSEN things with なる — 結婚することになりました is the standard wedding announcement, and no one hears an arranged marriage in it. Grammar says arrival; culture says humility.",
        },
        ex: [["来月、東京へ行くことになりました。", "It's been decided — I'm off to Tokyo next month."], ["結婚することになりました。", "We're getting married — the standard announcement."], ["ここでは靴を脱ぐことになっています。", "Shoes off here — that's the standing arrangement."]],
      },
      {
        id: "yotei", jp: "〜予定です", en: "on the schedule",
        exp: {
          what: "The planner's word: 予定 is neutral, factual, datebook-flavored. No chest, no fate — just the calendar.",
          build: "Plain form + 予定です: 行く予定です. As a noun it stands alone too: 明日は予定があります — I have plans.",
          when: "Itineraries, meetings, departures — where つもり would sound personal and ことになりました would sound eventful, 予定 just sounds booked.",
          watch: "つもり lives in your chest; 予定 lives in the calendar. Both can be true of the same trip — pick by which you're reporting.",
        },
        ex: [["明日、京都へ行く予定です。", "Scheduled to go to Kyoto tomorrow."], ["会議は三時に始まる予定です。", "The meeting is set to start at three."], ["来週帰る予定です。", "Due back next week."]],
      },
      {
        id: "youninaru", jp: "〜ようになる", en: "change arrives",
        exp: {
          what: "Crossing a line, marked: what you couldn't do, you now can; what you didn't do, you now do. 話せるようになりました — I've become able to speak.",
          build: "Plain form — very often the potential — + ようになる: 読めるようになる. The reverse change is 〜なくなる: 食べなくなりました, stopped eating it.",
          when: "Progress reports. This is the sentence shape your own study lives in: 漢字が読めるようになりました.",
          watch: "ようになる reports the arrival of a change, not a single event. 早く起きました is one morning; 早く起きるようになりました is a new you.",
        },
        ex: [["日本語が話せるようになりました。", "I've become able to speak Japanese."], ["毎朝早く起きるようになりました。", "I've started waking early — the habit arrived."], ["妹は野菜を食べるようになりました。", "My sister eats vegetables now — the change happened."]],
      },
      {
        id: "younisuru", jp: "〜ようにする", en: "steering yourself",
        exp: {
          what: "The steering wheel: a standing effort to make a behavior true. 毎日話すようにしています — I make a point of speaking daily. Not yet arrival; deliberate motion toward it.",
          build: "Plain form + ようにする; ようにしています for the ongoing effort; avoiding something: 〜ないようにしています.",
          when: "Habits under construction, doctor's orders, resolutions that need renewing every morning.",
          watch: "する steers, なる reports arrival — Step 9's 暖かくする／暖かくなる split, one floor up. The next lesson locks the whole axis in.",
        },
        ex: [["毎日日本語を話すようにしています。", "I make a point of speaking Japanese daily."], ["たばこを吸わないようにしています。", "I'm trying to keep off the cigarettes."], ["早く寝るようにします。", "I'll try to get to bed early — the resolution."]],
      },
      {
        id: "sb-suru-naru", jp: "する系 vs なる系", en: "who's driving the change?", kind: "skill",
        exp: {
          what: "One axis runs through this whole step: did you choose it, or did it come about? ことにする／ことになる and ようにする／ようになる differ only there — and Step 9's 暖かくする／暖かくなる was the first rung of the same ladder.",
          build: "する = agency: you decide (ことにする), you steer (ようにする). なる = arrival: it got decided (ことになる), it became true (ようになる). The attach points are identical within each pair; only the driver changes.",
          when: "Any sentence about change or decision — pick the verb by who's at the wheel.",
          watch: "Culture bends grammar here: announcements often prefer なる even for chosen things (結婚することになりました). When you hear なる, don't assume nobody chose — assume somebody's being modest.",
        },
        ex: [["日本へ行くことにしました。", "I chose it — する."], ["日本へ行くことになりました。", "It came about — なる (perhaps modestly)."], ["早く起きるようにしています。→ 早く起きるようになりました。", "The effort, then the arrival — the full arc of a habit."]],
      },
      {
        id: "b-s17", jp: "作文 · 来年", en: "next year, in four claims", kind: "build",
        requires: ["youtoomou", "kotonisuru", "yotei", "youninaru"],
        brief: "Write about next year: one plan on your mind, one decision already made, one thing on the calendar, and one change you want to arrive (〜ようになりたいです works beautifully).",
        exp: {
          what: "Four different relationships to the future, one honest paragraph.",
          build: "One 〜ようと思っています, one 〜ことにしました, one 〜予定です, one 〜ようになりたいです. They are NOT interchangeable — that's the exercise.",
          when: "New Year's resolutions run on exactly this grammar; you're a few months early or late, which is fine.",
          watch: "Keep する and なる honest: what you chose gets する-machinery, what you hope arrives gets なる. The composition grader can see the difference.",
        },
        ex: [],
      },
    ],
  },

  {
    cat: "Step 18 · Ability, experience & degrees",
    level: "S6",
    bank: [["すし", "sushi"], ["時々", "sometimes"], ["日曜日", "Sunday"], ["ペン", "pen"], ["漢字", "kanji"], ["チケット", "ticket"], ["話", "talk; story"], ["字", "handwriting"]],
    points: [
      {
        id: "kotogadekiru", jp: "〜ことができる", en: "ability, in formal dress",
        exp: {
          what: "The potential form's Sunday clothes: plain verb + ことができる says the same thing, one register up — the shape signs, announcements, and careful writing prefer.",
          build: "Plain form + ことができる: 話すことができます. Tense and negation land on できる: できません, できました.",
          when: "Formal contexts, and any verb whose potential form feels clumsy in the mouth. In everyday speech, 話せます usually wins — it's shorter.",
          watch: "Don't double the ability: 話せることができる stacks two potentials into nonsense. One machine per sentence.",
        },
        ex: [["日本語を話すことができます。", "I can speak Japanese — stated formally."], ["ここでチケットを買うことができます。", "Tickets may be purchased here — sign-Japanese."], ["漢字を書くことができません。", "I cannot write kanji (yet — the syllabus disagrees)."]],
      },
      {
        id: "takotogaaru", jp: "〜たことがある", en: "ever done it — experience as grammar",
        exp: {
          what: "It's happened at least once in your life, and there's a form for exactly that: 日本へ行ったことがあります — I've been to Japan.",
          build: "Plain PAST + ことがある. Never: 行ったことがありません. The have-you-ever question: 〜たことがありますか.",
          when: "Firsts, travel talk, interviews — anywhere lifetime experience is the topic.",
          watch: "行ったことがある (ever, sometime) versus 行きました (went, then). If the sentence carries a WHEN, use the plain past — 去年日本へ行ったことがあります mixes the two and grates.",
        },
        ex: [["日本へ行ったことがあります。", "I've been to Japan."], ["すしを食べたことがありますか。", "Have you ever had sushi?"], ["京都へ行ったことがありません。", "Never been to Kyoto — yet."]],
      },
      {
        id: "kotogaaru", jp: "〜ことがある", en: "sometimes happens",
        exp: {
          what: "The same machine in the present tense makes a different claim: it sometimes happens. 朝ごはんを食べないことがあります — some mornings I skip.",
          build: "Plain NON-PAST + ことがある, with 時々 often riding along for honesty.",
          when: "Habits with exceptions, occasional slips, sometimes-truths.",
          watch: "One kana of tense flips the whole meaning: 食べたことがある — have eaten, ever; 食べることがある — sometimes eat. The た is the entire difference.",
        },
        ex: [["朝ごはんを食べないことがあります。", "Some mornings I skip breakfast."], ["日曜日も働くことがあります。", "Sometimes I work Sundays too."], ["時々、映画を見に行くことがあります。", "Now and then I go see a movie."]],
      },
      {
        id: "sugiru", jp: "〜すぎる", en: "too much — the overdose suffix",
        exp: {
          what: "Attach すぎる and anything tips past its right amount: 食べすぎました — ate too much; 高すぎます — too expensive.",
          build: "Verb stem + すぎる (食べすぎる); い-adjectives drop the い (高すぎる); な-adjectives attach bare (静かすぎる). The result conjugates as a る-verb.",
          when: "Complaints and confessions — the two moods it was born for.",
          watch: "すぎる is a judgment, not a measurement — too much FOR something. And it chains beautifully with Step 13: 食べすぎてしまいました, overate-regrettably, is practically one word in real life.",
        },
        ex: [["昨日は食べすぎました。", "I ate too much yesterday."], ["この店は高すぎます。", "This place is just too expensive."], ["テレビを見すぎてしまいました。", "Watched too much TV — and regret it."]],
      },
      {
        id: "yasui-nikui", jp: "〜やすい・〜にくい", en: "easy-to, hard-to",
        exp: {
          what: "Easy-to and hard-to, built into the verb itself: 読みやすい — easy to read; 読みにくい — hard to read.",
          build: "Verb stem + やすい／にくい: 使いやすい, 書きにくい. The result is a full い-adjective and conjugates like one: 読みやすかったです.",
          when: "Reviews and preferences — pens, books, apps, explanations, cities: everything gets rated on this axis.",
          watch: "It describes the THING's character, not your skill: 読みにくい字 blames the handwriting, not your eyes. (やすい here has nothing to do with 安い cheap — same sound, different word.)",
        },
        ex: [["この本は読みやすいです。", "This book is easy to read."], ["このペンは書きにくいです。", "This pen is hard to write with."], ["田中さんの話はわかりやすいです。", "Tanaka's explanations are easy to follow."]],
      },
      {
        id: "teiru3", jp: "〜ている · 三回目", en: "the third pass: verb nature decides",
        exp: {
          what: "The pass Steps 4 promised: with real verb breadth in hand, ている's split finally shows its rule. Change-verbs wear ている as RESULT; activity-verbs wear it as IN-PROGRESS.",
          build: "Ask what the verb names. An instant change (行く, 来る, 起きる, 結婚する) → ている is the state AFTER: 行っている = is there, gone. A stretch of activity (食べる, 読む, 書く) → ている is the MIDDLE of it.",
          when: "The classic trap this defuses: 田中さんは東京に行っています does NOT mean he's mid-journey. He went, and he's there.",
          watch: "The state-pairs English blurs: 知っています (I know), 持っています (I have), 住んでいます (I live) — all change-verbs worn as results, which is why Step 4's teiru2 felt odd and now doesn't. When a ている surprises you, ask what kind of verb it rides.",
        },
        ex: [["田中さんは東京に行っています。", "Tanaka has gone to Tokyo — and is there now."], ["弟はもう起きています。", "My brother is up — awake as a state, not mid-rising."], ["今、昼ごはんを食べています。", "Eating lunch right now — a true middle."]],
      },
      {
        id: "b-s18", jp: "作文 · できること", en: "what you can do now", kind: "build",
        requires: ["takotogaaru", "youninaru", "sugiru", "kotogadekiru"],
        brief: "What you can do now that you once couldn't: one remembered first (たことがあります), one arrival (ようになりました), one confession from along the way (すぎました), and one formal claim (ことができます) — a small certificate, written by you.",
        exp: {
          what: "Your own learning, told in the step's grammar.",
          build: "One 〜たことがあります, one 〜ようになりました, one 〜すぎました, one 〜ことができます. Chronology helps: first, effort, excess, ability.",
          when: "This is the story every learner actually has — the composition just asks for it in Japanese.",
          watch: "たことがある takes no date; the arrival takes ようになりました, not a bare past. And let the すぎました be true — everyone has one.",
        },
        ex: [],
      },
    ],
  },

  {
    cat: "Step 19 · Time's edges",
    level: "S6",
    bank: [["夏休み", "summer break"], ["電話", "phone call"], ["授業", "class"], ["レポート", "report"], ["先月", "last month"], ["さっき", "just now"], ["会議", "meeting"], ["五時", "five o'clock"]],
    points: [
      {
        id: "aida", jp: "〜間・〜間に", en: "during — whole span, or a point inside",
        exp: {
          what: "During, split in two: 間 for something filling the WHOLE span (夏休みの間、働きました — all through it), 間に for something landing at a POINT inside it (夏休みの間に、京都へ行きました — at some point during).",
          build: "Noun + の間（に）; clause + 間（に）, the clause usually in ている: 寝ている間に. The に is the entire difference — with it, a point inside; without it, the full stretch.",
          when: "Vacations, absences, while-you-were-out events, and while-you-slept ones.",
          watch: "The main verb must agree with your choice: span-filling actions ride 間, one-shot actions ride 間に. 寝ている間に電話がありました — the call landed once, inside the sleeping.",
        },
        ex: [["寝ている間に、電話がありました。", "While I slept, a call came — one point inside the span."], ["夏休みの間、毎日働きました。", "All through summer break, I worked — the whole span."], ["授業の間、静かにしてください。", "Please keep quiet for the whole class."]],
      },
      {
        id: "madeni", jp: "〜までに", en: "by — the deadline まで isn't",
        exp: {
          what: "By, not until. までに sets a deadline — done at or before that time. まで holds a state up to a time. One kana apart, a missed train between them.",
          build: "Time + までに + a one-shot action: 五時までに帰ります. Time + まで + a continuing state: 五時まで働きます.",
          when: "Deadlines, submissions, last trains — anywhere lateness has a price.",
          watch: "The test is the verb: does it CONTINUE up to the time (まで), or COMPLETE by it (までに)? 三時まで会議があります; 三時までにレポートを出します.",
        },
        ex: [["五時までに帰ります。", "I'll be home BY five — done by then."], ["五時まで働きます。", "I work UNTIL five — continuing to then."], ["明日までにレポートを書いてください。", "Please write the report by tomorrow."]],
      },
      {
        id: "tokoro", jp: "〜るところ・〜ているところ・〜たところ", en: "where you are in the act",
        exp: {
          what: "ところ — \"place\" — turned into time: where you ARE inside an action. 食べるところ (about to), 食べているところ (mid-act), 食べたところ (just did).",
          build: "Plain non-past + ところ = on the verge. ている + ところ = caught in the middle. Plain past + ところ = fresh off it. Usually closed with です.",
          when: "The phone-answer sentence: 今、出るところです — just heading out. Timing talk, gentle excuses, doorway conversations.",
          watch: "たところ is strictly this-moment fresh; たばかり (next lesson) stretches with your FEELING of recency. The next drill splits them.",
        },
        ex: [["今、家を出るところです。", "Just about to leave the house."], ["今、昼ごはんを食べているところです。", "In the middle of lunch right now."], ["今、帰ってきたところです。", "Just this minute got home."]],
      },
      {
        id: "bakari", jp: "〜たばかり", en: "just did it — as felt",
        exp: {
          what: "Recency by your own clock: 先月日本に来たばかりです — only just arrived. A month ago by the calendar; fresh by feel — and ばかり sides with the feel.",
          build: "Plain past + ばかりです.",
          when: "Excusing inexperience and marking new arrivals: 始めたばかりです — I've only just started (so be patient with me).",
          watch: "たところ is objective this-instant; たばかり is subjective recency — a month can be ばかり if it still feels that way. The elasticity is the point, not a flaw.",
        },
        ex: [["先月、日本に来たばかりです。", "I only just came to Japan — last month, but it's fresh."], ["日本語を始めたばかりです。", "I've only just started Japanese."], ["さっき食べたばかりです。", "I literally just ate."]],
      },
      {
        id: "naide", jp: "〜ないで", en: "without doing",
        exp: {
          what: "The missing accompaniment: ないで hangs a not-done action off the main one. 朝ごはんを食べないで学校へ行きました — went to school without eating.",
          build: "ない form + で, then the main clause. The formal written twin is 〜ずに: 食べずに.",
          when: "Skipped steps, forgotten steps, minimalist mornings, brave attempts (見ないで書く — writing without looking).",
          watch: "Not the same as なくて, which gives a REASON and pairs with feelings or results. ないで is manner — HOW the main act was done, minus something.",
        },
        ex: [["朝ごはんを食べないで学校へ行きました。", "Went to school without breakfast."], ["何も見ないで漢字を書きました。", "Wrote the kanji without looking at anything."], ["寝ないで勉強しました。", "Studied without sleeping — not recommended, grammatically flawless."]],
      },
      {
        id: "sb-madeni", jp: "まで vs までに", en: "until vs by", kind: "skill",
        exp: {
          what: "The smallest particle difference with the biggest scheduling consequences. まで rides continuing states; までに rides completions. Get them backward and you've promised to work at the deadline instead of finishing by it.",
          build: "Ask the verb: still happening at that time → まで. Finished at or before it → までに.",
          when: "Every deadline, every meeting, every last train.",
          watch: "英語 speakers lean on \"until\" for both — the trap is real and the fix is the verb-test, every time.",
        },
        ex: [["三時まで会議があります。", "The meeting RUNS until three."], ["三時までにレポートを出します。", "The report lands BY three."]],
      },
      {
        id: "b-s19", jp: "作文 · いそがしい日", en: "a busy day, told at its edges", kind: "build",
        requires: ["aida", "madeni", "tokoro", "naide"],
        brief: "Tell a busy day: one deadline met (までに), one thing that happened while another went on (間に), one moment you were caught mid-something (ているところ), and one corner you cut (ないで).",
        exp: {
          what: "A day with real edges — deadlines, interruptions, and shortcuts, all marked.",
          build: "One 〜までに, one 〜間（に）, one 〜ているところ, one 〜ないで. Chain with Step 7's machinery where the timeline needs it.",
          when: "This is how busy days are actually narrated — the grammar was built for complaining gracefully.",
          watch: "Check each 間 against its verb: whole-span actions without に, one-shot events with. And keep the ないで honest — a skipped step, not a reason.",
        },
        ex: [],
      },
    ],
  },

  {
    cat: "Step 20 · Doing to & being done to",
    level: "S6",
    bank: [["野菜", "vegetables"], ["子ども", "child"], ["宿題", "homework"], ["歌", "song"], ["部屋", "room"], ["答える", "to answer"], ["がんばれ", "hang in there!"], ["漢字", "kanji"]],
    points: [
      {
        id: "saseru", jp: "〜させる", en: "the causative — making and letting",
        exp: {
          what: "One form, two forces: 食べさせました can be MADE him eat or LET him eat — coercion and permission share the machinery, and context arbitrates.",
          build: "う-verbs: あ-row + せる (行く→行かせる, 飲む→飲ませる). る-verbs: させる (食べさせる). する→させる, 来る→来させる. The person caused takes に when there's a を-object, を when there isn't.",
          when: "Parenting, managing, granting — anywhere one will moves another.",
          watch: "The politeness lifeline hiding inside: 〜させてください — \"please let me\" — is the causative's most useful everyday shape: 今日は早く帰らせてください.",
        },
        ex: [["母は弟に野菜を食べさせました。", "Mom made my brother eat his vegetables."], ["子どもを公園で遊ばせました。", "We let the kids play in the park."], ["すみません、今日は早く帰らせてください。", "Please let me leave early today — the causative asking a favor."]],
      },
      {
        id: "saserareru", jp: "〜させられる", en: "made to do — and feeling it",
        exp: {
          what: "The causative-passive: someone made you, and the grammar carries the grudge. 野菜を食べさせられました — I was made to eat them, resentment included.",
          build: "Two moves, always in order: causative first (食べさせる), then passive (食べさせられる). The maker takes に. Speech often contracts う-verbs: 飲まされる, 行かされる.",
          when: "Complaints about obligation — school, work, childhood. The natural habitat is the sigh.",
          watch: "This is the longest everyday conjugation in the language. Build it in two steps every time — trying to jump straight to させられる is where it breaks.",
        },
        ex: [["母に野菜を食べさせられました。", "Mom made me eat the vegetables — and I felt it."], ["母に部屋を掃除させられました。", "Got made to clean my room."], ["会議で歌を歌わせられました。", "They made me sing at the meeting. There are no winners."]],
      },
      {
        id: "meirei", jp: "命令形・〜な", en: "the bare command — recognize, rarely produce",
        exp: {
          what: "The imperative and its mirror: 行け — go!; 行くな — don't you dare. Real Japanese, rare in polite speech, everywhere in signs, sports, and fiction.",
          build: "う-verbs: え-row (行け, 飲め). る-verbs: ろ (食べろ). する→しろ, 来る→こい. The prohibitive is dictionary form + な: 入るな.",
          when: "RECOGNITION is the job: signs (ここに入るな), cheering (がんばれ！), emergencies, and every action scene ever written.",
          watch: "がんばれ！ is the one command everyone says — cheering suspends the rudeness entirely. Between adults otherwise, a bare imperative reads as aggression; your request form remains てください.",
        },
        ex: [["がんばれ！", "Go! You've got this! — the cheering imperative."], ["ここに入るな。", "KEEP OUT — the sign's な."], ["早くしろ！", "Hurry UP! — fiction and emergencies only."]],
      },
      {
        id: "nasai", jp: "〜なさい", en: "the parent-and-teacher imperative",
        exp: {
          what: "Softer than the bare command, still an order: 早く寝なさい — go to bed. The register of parents, teachers, and worksheets.",
          build: "Verb stem + なさい: 食べなさい, 起きなさい. Test papers speak it too: 答えなさい — answer the question.",
          when: "Downward only — adult to child, teacher to student, exam to examinee.",
          watch: "Never sideways or up: なさい at a colleague is parenting them, and it lands exactly that way. Adult-to-adult requests stay with てください and its softer cousins.",
        },
        ex: [["早く寝なさい。", "Go to bed — every parent, every night."], ["野菜も食べなさい。", "Eat your vegetables too."], ["よく読んで、答えなさい。", "Read carefully and answer — the exam's voice."]],
      },
      {
        id: "sb-rareru", jp: "られる collision", en: "one shape, three readings", kind: "skill",
        exp: {
          what: "見られる is can-see (potential), is-seen (passive), or — in keigo, waiting in Stage 3 — an exalted person simply seeing. One shape, three machines; particles and context arbitrate.",
          build: "Potential: the seeable thing takes が. Passive: a doer stands by with に. Honorific: the subject outranks you and nothing else is odd. る-verbs collide completely; う-verbs split cleanly (読める vs 読まれる) — which is exactly why speech invented ら抜き.",
          when: "Every られる you meet from now on: run the three-way check before assuming.",
          watch: "ら抜き — 見れる, 食べれる for the potential — is widespread, genuinely disambiguating, and still marked wrong in formal writing. Recognize both; write the full form.",
        },
        ex: [["ここから山が見られます。", "The mountain can be seen from here — potential, が."], ["先生に見られました。", "I was seen by the teacher — passive, に. Guilt sold separately."], ["見れる・食べれる", "ら抜き — speech's own fix for this collision. Recognize; don't write."]],
      },
      {
        id: "cc-meirei", jp: "命令はどこにいる", en: "where commands actually live", kind: "culture",
        exp: "Learn the imperative, then notice where it actually lives: almost nowhere you talk. Signs use it (入るな), sports arenas run on it (がんばれ！ — the one command everyone, everywhere, says warmly), emergencies permit it, and fiction is soaked in it — heroes and villains bark 命令形 at each other constantly, which is precisely why it can't be your model. Anime-Japanese is a real register; it just isn't the office's.\n\nBetween adults, actual instruction happens on the softness ladder you already own: てください, then てもらえますか, then ていただけますか as the stakes and status rise. A Japanese boss ordering someone around still usually ASKS. The imperative's true daily job in your life will be exactly two words: がんばれ shouted at someone else's effort, and がんばって said gently to a friend's.\n\nSo: recognize the bare commands everywhere they're written, enjoy them in fiction, produce them at sporting events — and let てください keep your actual requests.",
        ex: [["がんばれ！", "The one imperative everyone says — cheering suspends everything."], ["ここに入るな。", "Signage barks; people don't."]],
      },
      {
        id: "b-s20", jp: "作文 · 子どものとき", en: "childhood, in voices", kind: "build",
        requires: ["saseru", "saserareru", "nasai", "takotogaaru"],
        brief: "Childhood: one thing you were made to do (させられました), one thing you were allowed to do (させてくれました — Step 14's kindness meets the causative), one order you heard daily (quote it with なさい), and one thing you had never done back then (たことがありませんでした).",
        exp: {
          what: "The step's whole voice-system, pointed at the small tyrannies and freedoms of being a kid.",
          build: "One 〜させられました, one 〜させてくれました, one quoted 〜なさい (「早く寝なさい」と…), one 〜たことがありませんでした. Past tense throughout — this is memoir.",
          when: "Everyone has this material. The causative-passive was practically invented for it.",
          watch: "Build させられる in two moves and check the maker's に. And keep the quoted なさい inside quotes — you're reporting the order, not issuing it.",
        },
        ex: [],
      },
    ],
  },

  {
    cat: "Checkpoint 5",
    level: "S6",
    points: [
      { id: "rc5", jp: "復習 · Steps 17–20", en: "checkpoint: plans, ability, time, voices", kind: "review", covers: ["you-vol", "youtoomou", "kotonisuru", "kotoninaru", "yotei", "youninaru", "younisuru", "sb-suru-naru", "kotogadekiru", "takotogaaru", "kotogaaru", "sugiru", "yasui-nikui", "teiru3", "aida", "madeni", "tokoro", "bakari", "naide", "sb-madeni", "saseru", "saserareru", "meirei", "nasai", "sb-rareru"], exp: "The second Stage 2 checkpoint — intentions and the する/なる axis, ability and experience, time's edges, and the voice system from making to being-made. Four steps about will: yours, time's, and other people's.", ex: [] },
    ],
  },

  {
    cat: "Step 21 · Reasons, concessions & flow",
    level: "S7",
    bank: [["雨", "rain"], ["店", "shop"], ["時間", "time"], ["日曜日", "Sunday"], ["会議", "meeting"], ["今度", "next time"], ["家", "home"], ["映画", "movie"]],
    points: [
      {
        id: "shi", jp: "〜し", en: "reasons that stack",
        exp: {
          what: "Reasons piled up, with more implied: 安いし、おいしいし、あの店がいいですよ — cheap, AND tasty, AND (the list could go on) — that shop's the one.",
          build: "Plain form + し, stackable. Nouns and な-adjectives bring だ: 雨だし, 静かだし. The conclusion can follow — or the reasons can simply trail off, carrying it unspoken.",
          when: "Justifying choices without pinning everything on one cause — the polite pile-up.",
          watch: "から names THE reason; し offers reasons-among-others. Even one し hints at unnamed more — that hint is the flavor, use it on purpose.",
        },
        ex: [["安いし、おいしいし、あの店がいいですよ。", "Cheap, tasty — that place is the one."], ["今日は雨だし、家にいましょう。", "It's raining (among other things) — let's stay in."], ["時間もないし、また今度。", "No time, and so on — next time, then."]],
      },
      {
        id: "noni", jp: "〜のに", en: "although — with feeling",
        exp: {
          what: "Expectation betrayed, and the grammar carries the sting: 勉強したのに、忘れました — I studied, AND YET. けど states contrast; のに aches.",
          build: "Plain form + のに. Nouns and な-adjectives take な: 日曜日なのに, 静かなのに.",
          when: "Disappointments, surprises, gentle reproaches — anywhere the world broke a promise to you.",
          watch: "Don't spend のに on neutral contrasts — that's けど's job, and misused のに sounds like sulking. The trailing version is reproach distilled: せっかく作ったのに… — after I went to the trouble…",
        },
        ex: [["勉強したのに、忘れてしまいました。", "I studied — and still forgot. The しまう stacks the regret."], ["日曜日なのに、働いています。", "It's SUNDAY, and yet here I am working."], ["高かったのに、おいしくなかったです。", "Expensive — and it wasn't even good."]],
      },
      {
        id: "temo", jp: "〜ても", en: "even if — concede and continue",
        exp: {
          what: "The override: 雨が降っても、行きます — even if it rains, I'm going. ても concedes the condition and drives through it.",
          build: "て-form + も: 降っても. い-adjectives: くても (高くても). Nouns and な-adjectives: でも (雨でも). いくら〜ても turns it universal: いくら勉強しても — no matter how much.",
          when: "Determination, reassurance, and no-matter-what claims.",
          watch: "たら cancels, ても overrides: 降ったら行きません / 降っても行きます — same rain, opposite spines. And Step 5's てもいいですか was this ても all along: \"even if I do it, is it fine?\"",
        },
        ex: [["雨が降っても、行きます。", "Even if it rains, I'm going."], ["高くても、買います。", "Even if it's pricey, I'm buying it."], ["いくら勉強しても、忘れます。", "No matter how much I study, it slips away. (The next step's grammar can't fix this; spaced review can.)"]],
      },
      {
        id: "sorede", jp: "それで・それに・だから", en: "the paragraph joints, upgraded",
        exp: {
          what: "Step 11 gave you でも and それから; here are the working joints of real paragraphs: それで (and so — consequence), それに (and on top of that — addition), だから (that's why — the blunt conclusion).",
          build: "All three open a new sentence, exactly like でも. それで links a result; それに piles on a point; だから draws the line under the reasons.",
          when: "Anything longer than two sentences — which is to say, everything from here on.",
          watch: "だから opening a REPLY can land as impatience — \"like I SAID.\" And bare それで？ with rising pitch is the listener's nudge: \"…and then?\" — half of storytelling is the audience saying it.",
        },
        ex: [["雨が降りました。それで、家にいました。", "It rained. So I stayed in."], ["この店は安いです。それに、おいしいです。", "Cheap — and on top of that, good."], ["明日は会議です。だから、早く寝ます。", "Meeting tomorrow. That's why I'm turning in early."]],
      },
      {
        id: "sb-noni", jp: "のに vs ても vs が", en: "three concessions, three temperatures", kind: "skill",
        exp: {
          what: "Same facts, different hearts: が/けど states the contrast (cool), ても overrides it (determined), のに aches over it (felt). Choosing is emotional work, not grammar work.",
          build: "Neutral report → が/けど. Condition conceded, action anyway → ても. Expectation betrayed, feeling on the table → のに.",
          when: "Every contrast you write from now on — the temperature is always a choice.",
          watch: "のに is the strong stuff: spent on trivia it reads as sulking, saved for real betrayals it lands perfectly. When unsure, けど is never wrong — just cooler.",
        },
        ex: [["高いですが、買います。", "Cool: noted, buying anyway."], ["高くても、買います。", "Determined: price be damned."], ["高かったのに、壊れました。", "Felt: after what I paid — it broke."]],
      },
      {
        id: "b-s21", jp: "作文 · ざんねんな話", en: "a disappointment, told warm", kind: "build",
        requires: ["shi", "noni", "temo", "sorede"],
        brief: "Tell a small disappointment: stack two reasons with し, let one のに carry the ache, one ても for what you did (or will do) anyway, and join sentences with それで・それに・だから.",
        exp: {
          what: "The step's whole temperature system in one short, human story.",
          build: "Two 〜し reasons, one 〜のに, one 〜ても, connectors between sentences. Step 15's hedges mix in naturally if the ending is uncertain.",
          when: "The gently-disappointed story is a Japanese conversational art form — this is its exact toolkit.",
          watch: "One のに, placed where it hurts — two reads as complaining. And let the ても end on your spine, not the world's: what you'll do anyway.",
        },
        ex: [],
      },
    ],
  },

  {
    cat: "Step 22 · Wrapping thoughts",
    level: "S7",
    bank: [["意味", "meaning"], ["言葉", "word"], ["歌う", "to sing"], ["決める", "to decide"], ["忘れる", "to forget"], ["質問", "question"], ["漢字", "kanji"], ["誰", "who"]],
    points: [
      {
        id: "kadouka", jp: "〜かどうか", en: "whether or not — a question, boxed",
        exp: {
          what: "A yes/no question sealed in a box and set inside another sentence: 行くかどうか、まだ決めていません — whether I'll go, still undecided.",
          build: "Plain clause + かどうか + the outer verb: わかりません, 決めていません, 聞いてみます. The box carries its own か — the sentence end needs nothing extra.",
          when: "Undecided plans, unchecked facts, things you mean to ask someone.",
          watch: "です drops inside the box: 学生かどうか, never 学生ですかどうか. The box takes plain contents only.",
        },
        ex: [["行くかどうか、まだ決めていません。", "Whether I'll go — still undecided."], ["おいしいかどうか、食べてみましょう。", "Whether it's good — let's try it and see. (Step 13's てみる, on the case.)"], ["田中さんが来るかどうか、わかりません。", "Whether Tanaka's coming, I can't say."]],
      },
      {
        id: "ka-embed", jp: "疑問詞＋か", en: "the open question, boxed",
        exp: {
          what: "Open questions box up too: 誰が来るか、わかりません — who's coming, I don't know. The question word stays in its slot; か seals the box.",
          build: "Question-word clause + か + the outer verb: 何を食べるか、決めましょう. どこで買ったか、忘れました.",
          when: "I-don't-know, let's-decide, I-forget — daily sentences all.",
          watch: "Collision alert: 誰か standing alone is SOMEBODY (Step 11); 誰が来るか is a boxed question. The verb inside the box is the tell — Step 11's 誰か has none.",
        },
        ex: [["誰が来るか、わかりません。", "Who's coming — no idea."], ["何を食べるか、決めましょう。", "Let's decide what to eat."], ["どこで買ったか、忘れました。", "Where I bought it — forgotten."]],
      },
      {
        id: "koto-no", jp: "こと vs の", en: "the two nominalizers, side by side",
        exp: {
          what: "Both turn actions into things — Step 10's の and this stage's こと finally meet. The split: の stays close to the senses and the live moment; こと steps back into fact and habit.",
          build: "の for what's witnessed as it happens: 弟が歌うのを聞きました. こと for the abstract: ability (話すことができる), experience (行ったことがある), decisions (行くことにした). Many spots accept both: 読むのが好き／読むことが好き.",
          when: "Every nominalization from here on — which is to say, constantly.",
          watch: "Two fixed houses never move: 〜ことができる and 〜たことがある take こと, always. The sensing verbs (見る, 聞く) all but demand の. Where both fit, の runs warmer and more spoken, こと cooler and more written.",
        },
        ex: [["弟が歌うのを聞きました。", "I heard my brother singing — live, sensed → の."], ["日本語を話すことができます。", "Ability, abstract → こと (fixed house)."], ["本を読むのが好きです。", "Both would work here — の keeps it warm."]],
      },
      {
        id: "toiuimi", jp: "〜という意味", en: "asking what things mean",
        exp: {
          what: "The learner's power tool: どういう意味ですか — what does that mean? — and the answer's shape, 〜という意味です. This is how confusion becomes vocabulary, in real time.",
          build: "Asking: [expression]はどういう意味ですか. Answering: [expression]は[explanation]という意味です — Step 11's naming という, now working on meanings.",
          when: "Every conversation in which you are a learner — which is all of them, for a happy long while.",
          watch: "Two different questions, keep them straight: 何といいますか asks for the WORD (\"what's this called?\"); どういう意味ですか asks for the SENSE (\"what does it mean?\"). One fills your vocabulary forward, the other backward.",
        },
        ex: [["すみません、どういう意味ですか。", "Sorry — what does that mean?"], ["「直す」は「もう一度よくする」という意味です。", "\"Naosu\" means \"to make good again.\" (Yes, the app is named after it.)"], ["この漢字はどういう意味ですか。", "What does this kanji mean?"]],
      },
      {
        id: "sb-kotono", jp: "ことが好き？のが好き？", en: "the nominalizer choice drill", kind: "skill",
        exp: {
          what: "Where both fit, taste decides — but two houses are fixed and the senses have a favorite. Sorting fast keeps your sentences from stalling mid-thought.",
          build: "Run the checks in order: ことができる/たことがある construction? → こと, no choice. Sensing verb (見る・聞く) on something live? → の. Neither? → both fine; pick の for warmth, こと for print.",
          when: "Every time an action needs to become a thing.",
          watch: "The error that grates most: 話すのができます — の in こと's fixed house. The fixed houses are few; guard them and the rest is taste.",
        },
        ex: [["泳ぐことができます。", "Fixed house — こと."], ["妹が泳ぐのを見ました。", "Watched it live — の."]],
      },
      {
        id: "b-s22", jp: "作文 · わからないこと", en: "writing about not-knowing", kind: "build",
        requires: ["kadouka", "ka-embed", "koto-no", "toiuimi"],
        brief: "Write about what you don't know: one かどうか uncertainty, one boxed open question (誰・何・どこ…か), one nominalized like or ability (の or こと — chosen on purpose), and one meaning-question you actually want to ask someone.",
        exp: {
          what: "Not-knowing, written fluently — the most honest subject a learner has.",
          build: "One 〜かどうか, one 疑問詞＋か box, one nominalization with の or こと (be ready to say why you picked it), one どういう意味ですか aimed at something real.",
          when: "This is the composition that turns your actual confusions into Japanese — recycle it forever.",
          watch: "Keep the boxes plain inside (no です before か), and check any こと/の against the fixed houses before trusting taste.",
        },
        ex: [],
      },
    ],
  },

  {
    cat: "Step 23 · Other minds",
    level: "S7",
    bank: [["公園", "park"], ["犬", "dog"], ["かばん", "bag"], ["野菜", "vegetables"], ["妹", "younger sister"], ["弟", "younger brother"], ["友達", "friend"], ["何でも", "anything"]],
    points: [
      {
        id: "garu", jp: "〜がる・〜たがる", en: "showing signs of wanting",
        exp: {
          what: "The machinery tai promised back in Step 6: you cannot FEEL someone else's wanting, so Japanese marks what you can SEE — the signs. 弟は行きたがっています: he's showing every sign of wanting to go.",
          build: "Drop the い from たい (or from a feeling-adjective) and add がる: 行きたい → 行きたがる, usually worn as ている: 行きたがっています. The がる verb takes を where たい leaned が.",
          when: "Reporting anyone else's wants and feelings — the honest, native way.",
          watch: "私は行きたい／弟は行きたがっている — the line English never draws. たい about a third person claims telepathy; がる claims observation, which is all you actually have.",
        },
        ex: [["弟は公園へ行きたがっています。", "My brother's dying to go to the park — visibly."], ["子どもは野菜を食べたがりません。", "The kid shows no signs of wanting those vegetables."], ["私は公園へ行きたいです。", "ME, I want to go — first person keeps たい."]],
      },
      {
        id: "hoshigaru", jp: "ほしがる", en: "the noun-want, other-minds edition",
        exp: {
          what: "Step 6's ほしい, run through the same machine: 私はほしい, but 妹はほしがっている — she's showing signs of wanting it.",
          build: "ほしい → ほしがる, usually ほしがっています. And the particle swaps: が with ほしい becomes を with ほしがる — 新しいかばんをほしがっています.",
          when: "Gifts, kids in shops, anyone whose wanting you can only witness.",
          watch: "The particle swap IS the grammar: が marks the state's target, を marks the observed behavior's object. If you catch yourself writing 妹はかばんがほしいです, the telepathy alarm should ring.",
        },
        ex: [["妹は新しいかばんをほしがっています。", "My sister's got her eye on a new bag — visibly."], ["子どもは何でもほしがります。", "Kids want everything — as behavior, observable daily."], ["私はかばんがほしいです。", "MY want keeps ほしい and が — first person, direct line."]],
      },
      {
        id: "sb-minds", jp: "私は行きたい、彼は行きたがっている", en: "the my-mind/your-mind line", kind: "skill",
        exp: {
          what: "One line runs through the whole language: inner states are first-person territory. Everyone else's mind reaches you as signs (がる), appearances (そう・よう — Step 15 was building this all along), or words (と言っています). Claiming direct access to another mind is the L1 error this drill hunts.",
          build: "Mine → たい・ほしい, stated flat. Theirs, visible → たがる・ほしがる. Theirs, read from looks → 行きたそうです・ほしいようです. Theirs, reported → 行きたいと言っています.",
          when: "Every sentence about what anyone else feels or wants — which is half of all gossip and most of all kindness.",
          watch: "Questions are the exception that proves the rule: 行きたいですか asks the person directly, so たい is fine — you're requesting the first-person report, not faking it.",
        },
        ex: [["私は行きたいです。", "Mine — direct."], ["弟は行きたがっています。", "His — as signs."], ["田中さんは行きたいと言っています。", "Tanaka's — as reported words."]],
      },
      {
        id: "cc-honne", jp: "本音と建前", en: "the two truths", kind: "culture",
        exp: "本音 is what's felt; 建前 is what's presented. Named plainly like that, it can sound like a culture of concealment — it isn't. 建前 is the social surface that keeps shared rooms comfortable: the ちょっと… refusal you learned in Step 6's culture stop, the deflected compliment, the また今度、ぜひ that both parties understand completely. Everyone knows both layers exist. Nobody is fooled, and that's the point — it's not deception if it's a shared code.\n\nNotice what your grammar has been telling you all stage: other minds arrive as signs (がる), appearances (よう・そう), hearsay (らしい), or quotes (と言っています) — never directly. 本音と建前 is the same epistemology, grown into manners: the inner truth is the other person's to keep, and the surface is real information generously given. Read the surface well and you rarely need to demand what's under it.\n\nTwo working rules. Don't hunt 本音 aggressively — pressing \"but what do you REALLY think?\" forces a choice between rudeness and a lie, and you'll usually get the lie. And when you're given a warm surface — また今度、ぜひ — take the warmth as real (it is) and the schedule as unwritten (it also is).",
        ex: [["ちょっと…。", "The soft no — 建前 doing kind work. You met it in Step 6; now you know its family name."], ["また今度、ぜひ。", "\"Next time, definitely\" — the warmth is real; the date is not."]],
      },
      {
        id: "b-s23", jp: "作文 · ともだち", en: "a portrait, honestly marked", kind: "build",
        requires: ["garu", "hoshigaru", "sb-minds", "youda"],
        brief: "A portrait of someone you know: what they seem to feel (ようです・そうです), what they're showing signs of wanting (たがっています・ほしがっています), something they've said (と言っています), and one direct line about your own feelings toward them (好き, たい — first person owns them).",
        exp: {
          what: "The whole evidence system, pointed at one person you care about — Stage 2's closing argument.",
          build: "One 〜ようです or 〜そうです, one 〜たがっています／ほしがっています, one 〜と言っています, one first-person feeling stated flat. Four sources of knowing, correctly claimed.",
          when: "This is what fluent kindness sounds like: precise about what you can know, warm about what you feel.",
          watch: "The one hard rule: no bare たい・ほしい about them, ever — every claim about their inside marked as sign, seeming, or quote. Your own line is the only unmarked one, and that contrast is the portrait's spine.",
        },
        ex: [],
      },
    ],
  },

  {
    cat: "Checkpoint 6 · Stage review",
    level: "S7",
    points: [
      { id: "rc6", jp: "復習 · Stage 2", en: "checkpoint: the full stage", kind: "review", covers: ["temiru", "teikutekuru", "teageru", "ageru2", "itadaku", "tehoshii", "sb-kuremorau", "kamo", "hazu", "youda", "rashii", "souda-mite", "souda-denbun", "sb-sou", "ba", "nara", "sb-if4", "youtoomou", "kotonisuru", "kotoninaru", "youninaru", "younisuru", "sb-suru-naru", "kotogadekiru", "takotogaaru", "sugiru", "teiru3", "aida", "madeni", "tokoro", "bakari", "naide", "sb-madeni", "saseru", "saserareru", "sb-rareru", "shi", "noni", "temo", "sb-noni", "kadouka", "ka-embed", "koto-no", "toiuimi", "sb-kotono", "garu", "hoshigaru", "sb-minds"], exp: "The full Stage 2 review — aspect and kindness, evidence and ifs, will and time, voices, temperatures, boxes, and other minds. One stage, one long argument: what you do, what you know, and what you can honestly claim about anyone else. Write like you mean it.", ex: [] },
      {
        id: "ms-n4", jp: "N4の範囲、ぜんぶ", en: "everything the N4 syllabus expects", kind: "review",
        exp: "Everything the N4 syllabus expects of you is now behind you as well.\n\nThe て-form's second life, kindness travelling in three directions, evidence sorted by where you got it, all four ifs, intentions against schedules, ability and experience, the edges of time, things done to you and things you were made to do, concessions at three temperatures, thoughts packed into boxes, and the line between your own mind and everybody else's.\n\nThe practical difference from where you stood at N5 is not vocabulary. It is that you can now say things about things — hold a clause inside a sentence, report what somebody else said without claiming it, hedge a guess to exactly the confidence you actually have, and complain about the weather in a grammar that carries the complaint for you.\n\nFrom here the syllabus stops being a list of forms and starts being a question of register: who you are speaking to, and how far up or down the sentence has to reach. That is what the next stages are about.",
        ex: [],
      },
    ],
  },

  // ————— Stage 3 opens: the keigo on-ramp (Session 15) —————
  // Lloyd's Session 14 ruling: keigo opens Stage 3, SPACED OUT — three small
  // steps (hear it → lower yourself → build it), not one heavy one. Step 14's
  // giving verbs (いただく・くださる・さしあげる) are the seed this arc grows from.
  {
    cat: "Step 24 · Keigo is already everywhere",
    level: "S8",
    bank: [["先生", "teacher"], ["社長", "company president"], ["お客様", "customer — honored"], ["店", "shop"], ["二階", "second floor"], ["お手洗い", "restroom"], ["飲み物", "drink"], ["会議", "meeting"]],
    points: [
      {
        id: "sb-keigo-what", jp: "敬語の地図", en: "what the word actually covers", kind: "skill",
        exp: {
          what: "敬語 is not a third thing standing beside 尊敬語 and 謙譲語 — it is the umbrella both of them live under, and you have been under it since Step 1. です・ます is 丁寧語, politeness aimed at the listener, and it is keigo. Stage 3 is not a new subject. It is the name for something you have been doing for twenty-three steps, plus two directions you have not met.",
          build: "Four rooms under one roof. 丁寧語 — です・ます, aimed at whoever is listening, regardless of who the sentence is about. 尊敬語 — raises the OTHER person's action: 先生がおっしゃいました. 謙譲語 — lowers YOUR OWN: 私が申しました. 美化語 — the noun itself dressed with お or ご: お茶, ご飯.",
          when: "Every time you catch yourself asking whether this is a keigo situation. That is the wrong question and it has no answer. The right one is: whose action does this verb describe? Theirs, raise it. Yours, lower it. Nobody's in particular, です・ます was already enough.",
          watch: "The trap is treating politeness as a dial for the room — formal place, formal words. It is not about the room, it is about the direction. Two people at the same counter use opposite verbs for the same act of going, and both are correct, because one of them is going and the other is being gone to.",
        },
        ex: [["日本語を話します。", "丁寧語 — aimed at the listener. You have used this since Step 1."], ["先生は何とおっしゃいましたか。", "尊敬語 — the teacher's action, raised."], ["田中と申します。", "謙譲語 — your own action, lowered."], ["お茶・ご飯・お名前", "美化語 — the noun itself, dressed."]],
      },
      {
        id: "sonkeigo", jp: "いらっしゃる・おっしゃる・召し上がる", en: "the elevated verbs, said to you",
        exp: {
          what: "Keigo's first face: 尊敬語, respect language — a small set of special verbs that elevate the person DOING the action. いらっしゃる covers 行く・来る・いる all at once; おっしゃる is 言う; 召し上がる is 食べる・飲む; ご覧になる is 見る; なさる is する. Same events, said looking up. And you already own one: Step 14's くださる is くれる elevated — this is that system, opening fully.",
          build: "This step asks you to RECOGNIZE, not produce. The subject of an elevated verb is always the person being honored — a teacher, a customer, the person you're asking about. Politely they conjugate irregularly: いらっしゃる → いらっしゃいます, おっしゃる → おっしゃいます, なさる → なさいます.",
          when: "Aimed at you constantly: shops, stations, offices, school. 先生はいらっしゃいますか asks whether the teacher is in — the いる underneath is dressed, the question is ordinary.",
          watch: "These verbs never describe you. 私はいらっしゃいます elevates yourself — the one thing the system cannot say. When keigo points at you, next step's verbs answer; for now, just hear the altitude.",
        },
        ex: [["先生は今日、学校にいらっしゃいますか。", "Is the teacher at school today? — いる, elevated; the question itself is ordinary."], ["何とおっしゃいましたか。", "What did you say? — 言う, elevated, aimed at the person above."], ["どうぞ、召し上がってください。", "Please, eat — the host's word for 食べる."]],
      },
      {
        id: "sb-ikukuru", jp: "行く・来る・いる → 一つ", en: "three verbs, one replacement", kind: "skill",
        exp: {
          what: "The hardest recognition problem in the stage, and it runs both directions at once. Going up, three verbs you have kept apart since Step 4 — いる, 行く, 来る — all collapse into いらっしゃる. Coming down, two of them collapse into 参る. The distinctions you spent Stage 1 learning are not wrong; they simply stop being visible at this altitude.",
          build: "UP, for them: いる・行く・来る → いらっしゃる. DOWN, for you: 行く・来る → 参る; いる → おる; and 伺う is the narrower one, for visiting and for asking. So 先生はいらっしゃいますか covers three questions, and 明日参ります covers two answers.",
          when: "Constantly, and mostly aimed at you. Station announcements, phone calls, receptionists, shop floors. The train that is about to arrive does not 来る — it 参る, and you will hear that several times a day for as long as you live here.",
          watch: "先生はいらっしゃいますか is 'is the teacher in?' or 'is the teacher coming?' and nothing in the sentence separates them. Your instinct will be that a rule is missing. It is not — this is ambiguity native speakers live in comfortably, and context resolves it every time without anybody noticing there was one.",
        },
        ex: [["先生はいらっしゃいますか。", "Is the teacher in? — or coming. Three verbs, one shape."], ["まもなく電車が参ります。", "The train is about to arrive — 来る, lowered."], ["明日、伺います。", "I'll visit tomorrow — the narrower humble one."]],
      },
      {
        id: "gozaimasu", jp: "ございます・〜でございます", en: "the shop floor's polite floor",
        exp: {
          what: "The announcement register: ございます is あります in formal dress, でございます is です one bow deeper. This one honors nobody in particular — it's politeness aimed at the listener at large, which is why buildings speak it: shops, hotels, elevators, train announcements.",
          build: "あります → ございます, negative ございません. です → でございます. Nothing else in the sentence changes.",
          when: "Required listening, optional speaking: お手洗いは二階にございます will reach you long before you need to say it. And you've been saying one all along — ありがとうございます carries the same ござる.",
          watch: "You can live politely on あります and です for years. If you do reach for でございます, commit to the register — a sentence that bows this deep and then ends casually reads as parody.",
        },
        ex: [["お手洗いは二階にございます。", "The restroom is on the second floor — あります, formally, from the staff side."], ["お飲み物はこちらでございます。", "Your drinks, right here — です, one bow deeper."], ["ありがとうございます。", "The thanks you already say — ござる was in it all along."]],
      },
      {
        id: "cc-baito", jp: "バイト敬語", en: "the keigo you'll hear most", kind: "culture",
        exp: "The keigo you will hear most often isn't the textbook's — it's バイト敬語, part-timer keigo, drilled from training manuals into millions of convenience-store and family-restaurant shifts until it became the sound of the counter itself.\n\nThe set pieces: 「こちらがコーヒーになります」 — nothing is becoming anything; になります is working as a softened です. 「お飲み物のほうはよろしいですか」 — のほう points at no direction. 「ご注文は以上でよろしかったでしょうか」 — past tense about the order you're still placing. 「一万円からお預かりします」 — から marks no starting point anyone can name. Prescriptive keigo calls every one of these wrong, and you will hear every one of them today.\n\nTwo working rules. Recognize, don't adopt: these forms live at the counter, and carrying よろしかったでしょうか into an email or an interview moves the wrongness to you. And never correct the clerk — they're performing politeness under a manual, and the performance, not the grammar, is the actual message.\n\nOne honest footnote: linguists are gentler here than the etiquette books. The 'wrong' forms have real work to do — になります and のほう blur and soften, the past tense steps back deferentially — which is exactly how new keigo has always formed. What the manuals fixed in place, the language may yet keep. The counter is where you can watch Japanese move.",
      },
    ],
  },

  {
    cat: "Step 25 · Lowering yourself",
    level: "S8",
    bank: [["母", "my mother — outward"], ["兄", "my older brother — outward"], ["会社", "company"], ["電話", "telephone"], ["写真", "photo"], ["会議", "meeting"]],
    points: [
      {
        id: "kenjougo", jp: "おる・申す・いたす・伺う", en: "lowering yourself",
        exp: {
          what: "The mirror face: 謙譲語, humble language — verbs that lower the DOER, and the doer is you or yours. おる is your いる; 申す your 言う; いたす your する; 参る your 行く・来る; 伺う your visiting and your asking; 拝見する your 見る. And Step 14's いただく was this all along — your もらう and your eating, lowered.",
          build: "The subject of a humble verb is always your side: 私は田中と申します。明日、伺います。Politely they conjugate like ordinary verbs — おります, 申します, いたします, 参ります — no irregular い to memorize this time.",
          when: "Introducing yourself is the doorway: 〜と申します in every first meeting. Then phones (出かけております), visits (伺います), and offers (私がいたします).",
          watch: "Aim is everything. A humble verb pointed at the other person demotes them — 先生はおりますか sends the teacher DOWN, the exact mirror of Step 24's backfire. Up-verbs for them, down-verbs for you; the map has two halves and every mistake is a crossed wire.",
        },
        ex: [["私は田中と申します。", "My name is Tanaka — 言う, lowered: the standard self-introduction."], ["明日、そちらに伺います。", "I'll come to you tomorrow — visiting someone above, humbly."], ["母は今、出かけております。", "My mother's out right now — your side's いる, lowered, told outward."]],
      },
      {
        id: "sb-uchisoto", jp: "うちとそと", en: "the axis that picks the verb", kind: "skill",
        exp: {
          what: "The rule under the whole system: the axis isn't you-versus-them, it's YOUR SIDE versus outside — うち and そと. cc-family planted the instinct long ago: your own mother is 母 to others, お母さん at home. That instinct — promised for 'much later' — is now grammar, and later is now.",
          build: "Speaking to そと, your whole うち goes down as one unit — family, coworkers, even your own president: 田中はただいま外出しております, says the receptionist about her own boss. No さん, humble おる. Inside the walls he's elevated; across them, he's you.",
          when: "Every boundary crossing: answering the company phone, introducing family, speaking for your team to anyone outside it.",
          watch: "The English-speaker freeze: lowering your own boss feels like betrayal. It's the opposite — you lower your whole side as one body, and the unity is the respect. The axis moves, too: the same person can be うち at work and そと at dinner.",
        },
        ex: [["田中はただいま外出しております。", "Your coworker, to a caller — no さん, humble verb: he's inside your wall."], ["私の母は先生です。", "My mother is a teacher — bare 母, because you're speaking outward."], ["社長は会議にいらっしゃいますか。", "THEIR president — the other company's side sits above, so he's elevated."]],
      },
    ],
  },

  // Session 17, Lloyd's brief: the learner has to understand how much keigo
  // invades their life, not that it is rare. Eight rooms, ordered by how often
  // they are actually walked into. Every lesson is HEAR-FIRST — the sentence
  // they expect, then the sentence they will meet.
  {
    cat: "Step 26 · Keigo in the wild",
    level: "S8",
    bank: [["電車", "train"], ["荷物", "luggage; a parcel"], ["予約", "a booking"], ["保険証", "insurance card"], ["番号", "number"], ["生", "draught beer"], ["会計", "the bill"], ["窓口", "the counter"]],
    points: [
      {
        id: "cc-densha", jp: "駅と電車", en: "the announcement you hear twice a day", kind: "culture",
        exp: "You know this sentence. 電車が来ます — you have owned it since Step 4. Stand on a platform and what comes out of the speaker is 「まもなく、電車が参ります」.\n\nSame train. Same arriving. Not one word you were listening for.\n\n参る is the humble verb — and the surprising part is who is being lowered. It is the railway, lowering its own train, because the company is うち and you, standing on the platform with a ticket, are そと. The train is not being modest. The announcer is, on the company's behalf, exactly as you would lower your own boss on a phone call.\n\nOnce you hear it, you hear it everywhere. The department store lift says 上へ参ります. The bus says 発車いたします. The doors 閉まります and the staff 恐れ入ります. Announcements are the one place a learner is guaranteed daily keigo exposure, and they are also the easiest, because they repeat forever and nobody expects an answer.\n\nWhat you actually need to produce here is nothing at all. This is a listening room.",
        ex: [["まもなく、電車が参ります。", "The train will arrive shortly — 来る, lowered by the company."], ["上へ参ります。", "Going up — the lift, in the same humble verb."], ["白線の内側までお下がりください。", "Please step back behind the white line — お〜ください, Step 27's pattern, met early."]],
      },
      {
        id: "cc-mise2", jp: "売り場とレジ", en: "the shop floor's own register", kind: "culture",
        exp: "You would ask いくらですか. What comes back is 「三千円でございます」, and if there is a queue, 「少々お待ちください」.\n\nでございます is です one bow deeper and it honours nobody in particular — it is politeness aimed at the room. That is why buildings speak it: department stores, hotels, banks, anywhere with a uniform. It is the announcement register rather than the personal one.\n\nThis is not the same shop Japanese you met twice before, and the difference is worth holding. Step 8's cc-konbini is survival — the two-word answers that get you out of a convenience store. Step 24's cc-baito is バイト敬語, the forms that are everywhere and that prescriptivists call wrong. This is the third thing: the correct, trained, department-store register, spoken by people who were taught it in a manual and get it right.\n\nYour half of the exchange stays small. はい, お願いします, 大丈夫です. The register comes at you; you are not expected to return it.",
        ex: [["三千円でございます。", "That'll be 3,000 yen — です, one bow deeper."], ["少々お待ちください。", "One moment please — the standard hold."], ["こちらでよろしいでしょうか。", "Is this all right? — でしょうか softens the asking further than ですか."]],
      },
      {
        id: "cc-denwa", jp: "電話", en: "where your own boss goes down", kind: "culture",
        exp: "You would ask 田中さんはいますか. On a company phone, what you will hear back about that same person is 「田中はただいま外出しております」.\n\nNo さん. A humble verb. About their own section head.\n\nThis is うち and そと doing its most visible work, and it is the moment English speakers freeze. Lowering your own boss to an outsider feels like disloyalty. It is the opposite: you lower your entire side as one body, and the unity is the respect. Inside the office he is 田中さん and elevated; the instant the call connects to somebody outside, he is 田中 and he おる.\n\nThe same axis runs the other way. Ask about somebody at the company you are calling and they go up — 田中さんはいらっしゃいますか. One sentence, two directions, decided entirely by which side of the wall each person stands on.\n\nAnd the phone is where you will produce keigo earliest, because the script is short and fixed: your company, your name, and what you want.",
        ex: [["田中はただいま外出しております。", "Tanaka is out — your own side, lowered, さん dropped."], ["田中さんはいらっしゃいますか。", "Is Mr Tanaka in? — their side, raised."], ["いつもお世話になっております。", "The standard opening — untranslatable, and required."]],
      },
      {
        id: "cc-takuhai", jp: "宅配便", en: "the slip in your letterbox", kind: "culture",
        exp: "You expect 荷物が来ます. What arrives instead, on a slip through the door, is ご不在のため — and if you catch the driver, 「お届けにあがりました」.\n\nあがる is another humble verb for coming, alongside 参る, and it is the delivery trade's own. The driver is lowering himself on behalf of the company; ご不在 dresses your absence with a 美化語 prefix, which is a small courtesy — even your not being home is described politely.\n\nRedelivery is the thing worth knowing before you need it. The slip has a number, a website and an automated line, and the phrase that matters is 再配達. Japan runs an enormous redelivery system precisely because so much is delivered to homes where nobody is in during the day, and the automated menus are entirely in keigo you will now recognise: ご希望の日時をお選びください.\n\nThe practical upshot: you do not have to speak to anybody. You have to read one slip.",
        ex: [["お届けにあがりました。", "I've come to deliver — あがる, another humble 来る."], ["ご不在のため、持ち帰りました。", "You were out, so I took it back."], ["再配達をお願いします。", "Redelivery please — the one sentence you will produce."]],
      },
      {
        id: "cc-byouin", jp: "病院と薬局", en: "the clinic's questions", kind: "culture",
        exp: "You expect 名前を呼びます and どうしましたか. What you will hear is 「お名前をお呼びします」 and 「本日はどうなさいましたか」.\n\nThis is the productive pattern arriving before Step 27 teaches it. お + stem + する lowers the speaker's own action — the receptionist is lowering her calling-of-your-name — and なさる is the elevated する, raising yours. In one short exchange the altitude moves both ways, which is the whole system in miniature.\n\nA clinic is also where you will meet the most keigo per minute of any ordinary errand, because everybody in the building is trained and every question is scripted. 保険証はお持ちですか. こちらにおかけになってお待ちください. お大事に on the way out, which is the one you should learn to say back.\n\nWhat you need to produce is small and mostly nouns: where it hurts, since when, what you are taking. The keigo is entirely incoming.",
        ex: [["お名前をお呼びします。", "We'll call your name — お〜する, the speaker lowering her own act."], ["本日はどうなさいましたか。", "What brings you in today? — する, raised."], ["お大事に。", "Take care of yourself — say this one back."]],
      },
      {
        id: "cc-yakusho", jp: "役所の窓口", en: "the counter you have already stood at", kind: "culture",
        exp: "You know 書いてください. At the counter you will be handed a form and told 「こちらにご記入ください」.\n\nSame instruction. ご記入 is the 漢語 noun dressed with ご, and ください does the asking — which means the polite version is not a different grammar so much as a different vocabulary, one layer more formal than the verb you own.\n\nYou have been standing at this counter since Step 0. The fourteen-day registration, the insurance, the certificate for the bank — all of it happened in rooms speaking this register, and until now you have been parsing the gestures rather than the sentences. The vocabulary is small and it repeats: お待ちください, お持ちですか, ご確認ください, 恐れ入りますが.\n\n恐れ入りますが is the one to recognise first. It means roughly 'I'm afraid I must trouble you', it precedes almost every request a counter makes of you, and it is the audible signal that something is about to be asked.",
        ex: [["こちらにご記入ください。", "Please fill this in here — ご + 漢語 noun."], ["恐れ入りますが、身分証をお持ちですか。", "Sorry to trouble you — do you have ID?"], ["少々お待ちください。", "One moment — the same hold as the shop floor."]],
      },
      {
        id: "cc-ginkou", jp: "銀行と郵便局", en: "the slowest, most polite room in Japan", kind: "culture",
        exp: "You expect 待ってください. What you get is 「恐れ入りますが、少々お待ちください」, and then you wait rather a long time.\n\nBanks and post offices run the deepest routine keigo of anywhere you will go monthly. Everything is 承ります (received, humbly), お預かりします (taken into our keeping), ご確認ください (please confirm). Money makes institutions careful, and careful in Japanese means low.\n\nお預かりします is worth pulling out because it is everywhere and it is not what it looks like. 預かる is to keep something on someone's behalf — so when a cashier says 一万円お預かりします, they are not saying they have taken your money, they are saying they are holding it while they make change. It is the same verb a coin locker uses, and it is why the phrase survives even when the amount is exact.\n\nExpect forms, a stamp, and a number ticket. Expect to be thanked more than you thanked anybody.",
        ex: [["一万円お預かりします。", "Taking 10,000 yen — holding it, not keeping it."], ["恐れ入りますが、こちらにご印鑑を。", "Sorry to trouble you — your seal here."], ["確かに承りました。", "Received and confirmed — 受ける, lowered."]],
      },
      {
        id: "cc-nomikai", jp: "居酒屋と飲み会", en: "the one room where it all drops", kind: "culture",
        exp: "Everywhere else in this step, keigo comes at you. Here it comes at you from the floor and evaporates at your table, in the same evening, and you have to run both.\n\nFrom the staff: いらっしゃいませ, お決まりでしょうか, ラストオーダーになります. Textbook incoming keigo, and the same register you have met at every counter this step.\n\nFrom the table: none of that. Contractions, dropped particles, 〜っす doing the work of です — うまいっす, 大丈夫っす — and the section head who was firmly keigo at six o'clock on plain forms by eight. On Monday morning he will be keigo again, and neither of you will mention it. That switch is not rudeness or friendship exactly; it is what the room is for.\n\nTwo practical things. とりあえず生 — a beer to start, said by somebody within a minute of sitting down, and the closest thing to a ritual opening. And お通し, the small dish nobody ordered that appears anyway and goes on the bill: it is a seat charge in the shape of food, it is normal, and it is not a mistake.\n\nThe forms themselves you have met — Step 9's cc-slang, Step 13's cc-chau. What is new is the speed of the altitude change and where the line falls.",
        ex: [["とりあえず生をお願いします。", "A draught to start — the standard opening move."], ["お決まりでしょうか。", "Ready to order? — incoming, from the floor."], ["うまいっす。", "It's good — っす, the compressed です, table-side only."]],
      },
      {
        id: "cc-hogosha", jp: "保護者様・お子様", en: "the letter in the school bag", kind: "culture",
        exp: "A print comes home folded twice in your child's bag, and the top line is addressed to you. You know the words for parent and child — 親 and 子ども, both since Step 3. Neither is anywhere on the page.\n\nWhat is there is 保護者様 at the top, and お子様 further down.\n\n保護者 is guardian rather than parent: a legal-shaped word for whoever is responsible for the child, which is exactly why a school reaches for it — it fits every household without needing to know anything about yours. 様 addresses you as that person. And お子様 is the honorific for somebody ELSE'S child, which means the school is raising your own child, to you, in a letter you are holding in your kitchen.\n\nThat is Step 25's うち・そと axis running straight through a family. From the school your child is outside and goes up. Writing back, your child is うち and goes flat — 子ども, never お子様. A parent who writes お子様 about their own child has elevated their own side: the same error as calling your own boss 田中さん to a customer.\n\nOne older word survives on older notices. ご父兄 — literally fathers and elder brothers — was standard for decades and has been widely dropped, because gender equality, rising divorce and fathers who are not at home all made it describe a family that had stopped being typical.\n\nAnd this is the venue nobody reaches by accident. No shop, station or counter will teach you these two words. You meet them the first time somebody hands you a letter that assumes you are responsible for a child — which is to say, you only learn them once you are on the receiving end of them.",
        ex: [["保護者様", "Addressed to you — as the child's guardian, not as a parent."], ["お子様のお名前をご記入ください。", "Please write your child's name — the school raising your child, to you."], ["子どもがお世話になっております。", "Thank you for looking after my child — writing back, your own side goes flat."]],
      },
    ],
  },

  {
    cat: "Step 27 · Producing politeness",
    level: "S8",
    bank: [["荷物", "luggage, bags"], ["名前", "name"], ["住所", "address"], ["説明", "explanation"], ["お客様", "customer — honored"], ["会社", "company"]],
    points: [
      {
        id: "okeigo", jp: "お〜になる・お〜する", en: "politeness you can build",
        exp: {
          what: "Beyond the special verbs, keigo is PRODUCTIVE — two patterns cover every verb the special list skips. お + stem + になる elevates the other person's action: お帰りになりました. お + stem + する lowers yours, done for them: お持ちします. Kanji-compound verbs swap お for ご: ご説明します, ご案内します. And the お/ご you've been hearing on nouns — お名前, ご住所, お手洗い — is the same politeness, worn by things.",
          build: "The stem is the ます-form minus ます: 帰ります → 帰り → お帰りになる (theirs); 持ちます → 持ち → お持ちする (yours, for them); する-compounds take ご+noun+する: ご説明します.",
          when: "The moment you need altitude for a verb with no special form — which is most verbs. お待ちください and おかけください reach you daily; お送りします and ご連絡いたします are how offices offer.",
          watch: "Two traps. A special verb wins: 食べる has 召し上がる, so お食べになる sounds off. And never double-dress: ご覧になられる stacks two elevations — 二重敬語, the classic overreach. One dressing per verb.",
        },
        ex: [["社長はもうお帰りになりました。", "The president has already gone home — 帰る, elevated by the pattern."], ["お荷物をお持ちします。", "I'll carry your bags — your action, lowered, offered upward."], ["ご住所とお名前をお願いします。", "Address and name, please — the form-filling pair, politely dressed."]],
      },
      {
        id: "sb-keigo-map", jp: "一つの会話、三つの高さ", en: "one exchange, three altitudes", kind: "skill",
        exp: {
          what: "The whole system on one map: plain (friends), です・ます (the default you've lived in since Step 1), and keigo — which splits in two: their verbs up, your verbs down. Three altitudes, one conversation.",
          build: "いる？ → いますか → いらっしゃいますか (theirs) / おります (yours). 食べる？ → 食べますか → 召し上がりますか / いただきます. Pick the altitude once, then hold it.",
          when: "Default to です・ます everywhere; hear keigo at counters and offices; produce it in emails, interviews, and first meetings — this step's composition is exactly that.",
          watch: "Keigo is a costume for the other person's verbs and a bow for your own — never both directions on one verb, and never keigo at a friend, where it lands as comedy or as distance.",
        },
        ex: [["先生、コーヒーを召し上がりますか。", "Offering upward — their drinking, elevated."], ["はい、いただきます。", "Accepting — your receiving, lowered. One exchange, both halves."], ["明日、うちに来る？", "And with a friend: plain altitude, no costume at all."]],
      },
      {
        id: "b-keigo", jp: "作文 · メール", en: "one request, properly dressed", kind: "build",
        requires: ["sonkeigo", "kenjougo", "okeigo"],
        brief: "A short message to a teacher or a company: open politely, name yourself with 〜と申します, make ONE request dressed in keigo (ご確認いただけますか・お送りいただけますか, or 〜てくださいませんか), and close with よろしくお願いいたします. Four or five sentences — altitude held steady from first line to last.",
        exp: {
          what: "The on-ramp's proof: one real message you could actually send — the email to a teacher, the inquiry to a company — with the altitude held all the way through.",
          build: "Opening (はじめまして, or お世話になっております if there's history) → 〜と申します → the request, once, dressed → よろしくお願いいたします.",
          when: "This is the keigo you'll produce most in real life: written, short, high-stakes-feeling, and completely formulaic — which is the good news.",
          watch: "One request, dressed once — a message that elevates every verb reads as nervous. Frame + name + request + bow: the frame carries the politeness so the verbs don't have to carry it all.",
        },
        ex: [],
      },
    ],
  },

  // Lloyd, Session 17: Stage 3 needs a COMPREHENSION check. Every earlier
  // checkpoint is production — a composition here would test the one thing a
  // recognition stage does not claim to teach.
  {
    cat: "Checkpoint 7 · 聞き取り",
    level: "S8",
    points: [
      {
        id: "rc7", jp: "復習 · 聞き取り", en: "checkpoint: hear it, place it", kind: "review",
        covers: ["sb-keigo-what", "sonkeigo", "sb-ikukuru", "gozaimasu", "kenjougo", "sb-uchisoto", "okeigo", "sb-keigo-map"],
        exp: "The Stage 3 review, and deliberately not a composition. This stage taught recognition, so the check is recognition: hear a line, name the plain sentence under it, and say which way it points and who moved. Some of these have more than one defensible answer — that is not a flaw in the question, it is what いらっしゃる actually does.",
        ex: [],
      },
    ],
  },

  // Stage 9 opens. から and ので said WHY. These say who it reflects on — English
  // does that with tone, Japanese does it with the word, so picking wrong is
  // audible.
  {
    cat: "Step 28 · Cause, blame and credit",
    level: "S9",
    bank: [["結果", "result"], ["失敗", "a failure"], ["成功", "success"], ["努力", "effort"], ["事故", "an accident"], ["遅刻", "lateness"], ["準備", "preparation"], ["経験", "experience"]],
    points: [
      {
        id: "okage", jp: "〜おかげで", en: "thanks to — cause with credit", kind: "grammar",
        exp: {
          what: "から and ので report a reason flatly. おかげで reports the same reason and hands somebody the credit for it. It is not politeness bolted onto a fact — it is the word taking a side, and once you know all three, taking no side stops being available.",
          build: "Noun + の + おかげで, or a plain clause + おかげで: 先生のおかげで, 早く出たおかげで. Whatever follows is a good result. If it is not good, you have reached for the wrong half of the pair.",
          when: "Thanking somebody in a way that names what they actually did — which is most of the thanks you will ever write. Also the polite way to report a success that was not entirely your own.",
          watch: "It can be used sarcastically and it lands hard when it is: 君のおかげで about a disaster is not a mistake anybody makes twice. Keep it for outcomes you are glad about, or mean the sarcasm.",
        },
        ex: [["先生のおかげで、合格しました。", "Thanks to my teacher, I passed."], ["早く出たおかげで、間に合いました。", "Because I left early — and I'm glad I did — I made it."]],
      },
      {
        id: "seide", jp: "〜せいで", en: "because of — cause with blame", kind: "grammar",
        exp: {
          what: "The mirror. せいで names a cause and blames it, and what follows is bad. Where おかげで hands somebody credit, せいで hands them fault, and the sentence cannot be neutral about which it is doing.",
          build: "Noun + の + せいで, or a plain clause + せいで: 雨のせいで, 寝坊したせいで. There is also せいか, which softens the blame into a maybe — 疲れているせいか, perhaps because I'm tired.",
          when: "Explaining a failure, a delay, anything that went wrong. And, carefully, in complaints — the word does the complaining, so your tone does not have to.",
          watch: "Blaming a person out loud with せいで is a real accusation rather than a turn of phrase. About yourself it is ordinary and even modest; about a colleague it is something you would have to mean.",
        },
        ex: [["雨のせいで、試合が中止になりました。", "The match was called off because of the rain."], ["寝坊したせいで、遅刻しました。", "I was late because I overslept."]],
      },
      {
        id: "bakarini", jp: "〜ばかりに", en: "just because — one small cause, one large result", kind: "grammar",
        exp: {
          what: "The narrow one, and the most emotional. ばかりに says a single small thing caused an outsized bad result, and the sentence carries the regret that the small thing was avoidable.",
          build: "Plain form + ばかりに. Usually past, and usually about something the speaker did or failed to do: 一言言わなかったばかりに.",
          when: "Regret with a cause attached — a specific and very common shape here. Not I failed, but this one thing meant I failed.",
          watch: "The disproportion is the entire point. Spend it on a large cause with a large result and it is wasted; that is せいで's job. If the sentence does not feel unfair, this is not the pattern.",
        },
        ex: [["一言言わなかったばかりに、大きな問題になりました。", "Just because I didn't say one word, it turned into a real problem."], ["準備しなかったばかりに、失敗しました。", "Simply because I hadn't prepared, I failed."]],
      },
      {
        id: "sb-riyuu", jp: "理由の温度", en: "four becauses, four temperatures", kind: "skill",
        exp: {
          what: "You now have four ways to say because and they are not interchangeable — they differ in who the reason reflects on. から asserts it, ので presents it as circumstance, おかげで credits, せいで blames. Choosing none of the last two is itself a choice: it says the cause had no owner.",
          build: "Neutral: から (asserting) / ので (softer, circumstance). Owned: おかげで (good result, credit) / せいで (bad result, blame). And ばかりに for a small cause with an unfair result.",
          when: "Every explanation you give from here. The neutral pair is still the default; the owned pair is for when the sentence should say something about responsibility.",
          watch: "The error is not grammatical, it is social. 雨のおかげで試合が中止になりました thanks the rain for ruining the match, which reads as sarcasm whether or not you meant it. Match the temperature to the outcome.",
        },
        ex: [["雨だから、行きません。", "Neutral — から asserts the reason."], ["雨のせいで、中止です。", "Owned, and blamed."], ["晴れたおかげで、できました。", "Owned, and credited."]],
      },
      {
        id: "b-s28", jp: "作文 · うまくいかなかった日", en: "a day that went wrong", kind: "build",
        requires: ["okage", "seide", "sb-riyuu"],
        brief: "Write about a day that went badly and one thing that saved it. Use せいで once for what went wrong and おかげで once for what rescued it.",
        exp: {
          what: "The step's whole triangle, pointed at an ordinary bad day — which is the situation these words were built for.",
          build: "Three or four sentences. One cause you blame, one you credit, and at least one plain から or ので so the contrast between owned and neutral is visible.",
          when: "This is the shape of most real explanations: something went wrong, something helped, and the words you choose say how you feel about each.",
          watch: "Check the outcome after each one. A good result behind せいで, or a bad one behind おかげで, reads as sarcasm — and sarcasm you did not intend is the most expensive error in this step.",
        },
        ex: [],
      },
    ],
  },

  // The step that makes writing possible. Each of these takes a noun and holds
  // it at a distance — about, toward, by means of, in, for. It is why an N3
  // reading passage looks impenetrable to an N4 learner.
  {
    cat: "Step 29 · The compound particles",
    level: "S9",
    bank: [["問題", "problem; issue"], ["社会", "society"], ["方法", "method"], ["調査", "a survey"], ["意見", "an opinion"], ["影響", "influence"], ["場合", "case; situation"], ["環境", "environment"]],
    points: [
      {
        id: "nitsuite", jp: "〜について", en: "about — the topic, held out", kind: "grammar",
        exp: {
          what: "は sets a topic you then talk around. について names a topic and holds it out in front of the sentence as an object of discussion — about it, on the subject of it. It is the first of a family that turns nouns into subject matter, and the family is what written Japanese runs on.",
          build: "Noun + について + verb of talking, thinking, writing, asking: 問題について話します. Before a noun it becomes についての — 問題についての意見.",
          when: "Anything with a subject: a report, an email, a meeting, a question. The moment you need to say what something is about rather than simply talk about it.",
          watch: "It needs a verb that can take a subject matter. 問題について行きます is not a sentence — you cannot go about a problem. And do not stack it on は: 問題については is possible and means as for the problem, which is a further step out, not a doubling.",
        },
        ex: [["この問題について話しましょう。", "Let's talk about this problem."], ["日本の社会についての本を読みました。", "I read a book about Japanese society."]],
      },
      {
        id: "nitaishite", jp: "〜に対して", en: "toward — the thing you face", kind: "grammar",
        exp: {
          what: "について is about. に対して is toward, facing, in response to — it points an attitude or an action at a target rather than naming a subject. The difference is whether the noun is being discussed or being confronted.",
          build: "Noun + に対して: 質問に対して答える, 学生に対して厳しい. Before a noun, に対する — 学生に対する態度.",
          when: "Attitudes, responses, treatment of people. It is also the neutral word for a contrast between two things — Aに対してB, where A and B are being set against each other.",
          watch: "The overlap with について is real and the test is simple: can the noun be a topic of conversation, or is it something you are facing? 問題について考える, but 質問に対して答える — you think about a problem and answer to a question.",
        },
        ex: [["質問に対して、はっきり答えました。", "I answered the question clearly."], ["彼は学生に対してとても厳しいです。", "He is very strict toward his students."]],
      },
      {
        id: "niyotte", jp: "〜によって", en: "by, by means of, depending on", kind: "grammar",
        exp: {
          what: "The widest of the family, and it carries three jobs that share one shape: by means of (the method), by (the doer, in a passive), and depending on (it varies). Context separates them and nothing else does.",
          build: "Noun + によって. With a passive it marks the agent: この本は夏目漱石によって書かれました. With a plural or a range it means it varies: 人によって違います. And によっては singles out some cases.",
          when: "Written Japanese, constantly — it is the agent-marker of the passive voice in anything formal, and the standard way to say it depends.",
          watch: "The passive agent in speech is に; によって is the written one, and swapping them makes writing sound spoken and speech sound like a report. And 人によって違います does not mean people are different — it means the answer varies by person.",
        },
        ex: [["人によって、意見が違います。", "Opinions differ from person to person."], ["この方法によって、問題が解決しました。", "The problem was solved by this method."]],
      },
      {
        id: "nioite", jp: "〜において", en: "in, at — the formal stage", kind: "grammar",
        exp: {
          what: "で, in a suit. において marks a place, a time or a field, and it belongs to documents, ceremonies and academic writing. It says nothing で could not say; what it adds is the register of the room it is said in.",
          build: "Noun + において, or における before a noun: 会議において, 日本における教育. Places, eras, fields — not small physical locations.",
          when: "Reading, mostly. Notices, contracts, papers, formal speeches. Producing it is for written work; saying it out loud in a café is the same mistake as でございます at a friend's kitchen table.",
          watch: "It does not stretch to ordinary places. 台所において料理します is wrong in the way a dinner-jacket is wrong at breakfast — で is the word, and において is reserved for the abstract or the ceremonial.",
        },
        ex: [["会議において、その問題が話し合われました。", "The matter was discussed at the meeting."], ["日本における環境の問題", "Environmental issues in Japan."]],
      },
      {
        id: "nitotte", jp: "〜にとって", en: "for — from whose point of view", kind: "grammar",
        exp: {
          what: "にとって marks the viewpoint a judgement is made from. It does not mean for in the sense of a gift or a purpose — it means as far as this person is concerned, and what follows is almost always an evaluation.",
          build: "Noun (usually a person or a group) + にとって: 私にとって, 学生にとって. Before a noun, にとっての.",
          when: "Any sentence where something is important, difficult, or valuable to somebody in particular — which is most opinions once you stop stating them as facts about the world.",
          watch: "The trap is に. 私に大切です is not the sentence; it is 私にとって大切です. And the follow-on is a judgement, not an action — にとって働きます is not a thing, because working is not an evaluation.",
        },
        ex: [["私にとって、この経験はとても大切です。", "For me, this experience matters a great deal."], ["学生にとって、その本は少し難しいです。", "For students, that book is a little difficult."]],
      },
      {
        id: "sb-fukugou", jp: "複合助詞の地図", en: "the compound particles, side by side", kind: "skill",
        exp: {
          what: "Five shapes that all start with に and all take a noun, and English translates four of them as about or for at some point — which is exactly why they need laying out together rather than meeting one at a time.",
          build: "について — the subject matter. に対して — the thing faced or responded to. によって — the means, the agent, or the variable. において — the formal stage. にとって — the viewpoint a judgement comes from. として, from Step 21, is the sixth: in the role of.",
          when: "Every piece of writing you produce from here, and every N3 reading passage you meet. Recognising them is what turns a wall of text into sentences.",
          watch: "Two pairs collide. について vs に対して: discussed, or faced. によって vs によっては: it varies, or in some cases specifically. When neither feels right, the plain particle usually was right — these are for when the sentence needs the extra distance.",
        },
        ex: [["問題について話す", "Discuss the problem — subject matter."], ["質問に対して答える", "Answer the question — facing it."], ["私にとって大切だ", "Important to me — my viewpoint."]],
      },
      {
        id: "b-s29", jp: "作文 · 意見文", en: "a short opinion", kind: "build",
        requires: ["nitsuite", "nitotte", "sb-fukugou"],
        brief: "Write a short opinion on something you have views about — a rule at work, a change in your town. Use について to name the topic and にとって to say whose view it is.",
        exp: {
          what: "The first genuinely written thing this course asks for. Everything before it could have been said out loud; this reads as prose because the compound particles are what prose is made of.",
          build: "Four or five sentences. Name the topic with について, give your view with にとって, and use one reason pattern from Step 28 so the opinion has a cause under it.",
          when: "Emails that argue, forum posts, the written half of an exam. It is also the shape of a complaint that gets taken seriously.",
          watch: "Do not stack the compound particles for weight. One per sentence at most — a paragraph with について, に対して and において in it reads as somebody testing their new vocabulary, which is exactly what it would be.",
        },
        ex: [],
      },
    ],
  },

  // The stage's argumentative core. わけ is the hard one and worth the room: it
  // does NOT mean reason — it means that follows.
  {
    cat: "Step 30 · Conclusions",
    level: "S9",
    bank: [["理由", "reason"], ["説明", "explanation"], ["常識", "common sense"], ["立場", "position; standpoint"], ["当然", "natural; obvious"], ["確か", "certain"], ["普通", "ordinary"], ["若い", "young"]],
    points: [
      {
        id: "wakeda", jp: "〜わけだ", en: "that follows — the conclusion clicking", kind: "grammar",
        exp: {
          what: "The pattern nearly every English explanation gets slightly wrong by calling it reason. わけだ does not give a reason — it draws a conclusion FROM one the listener already has. It is the sound of something clicking: no wonder, that explains it, so that's why.",
          build: "Plain form + わけです / わけだ. Nouns and な-adjectives take な: 学生なわけです. It usually follows a fact just established, by you or by them.",
          when: "The second half of an explanation. Somebody says the shop was shut; you say ああ、休みだったわけですね — so that's why. It is agreement plus understanding, in one word.",
          watch: "It cannot open a conversation. わけだ needs something already on the table to conclude from, so used cold it sounds like the end of a thought nobody heard the start of. And it is not から — から supplies the reason, わけだ receives it.",
        },
        ex: [["十年住んでいるんですか。道理で日本語が上手なわけですね。", "Ten years? No wonder your Japanese is good."], ["電車が止まっていたんです。だから遅れたわけです。", "The trains were stopped — so that's why I was late."]],
      },
      {
        id: "wakedewanai", jp: "〜わけではない", en: "not that — denying a conclusion", kind: "grammar",
        exp: {
          what: "The other half, and the more useful one. わけではない denies a conclusion the listener might reasonably have drawn from what you just said. It is not it isn't so — it is it doesn't follow, which is a different and much more careful denial.",
          build: "Plain form + わけではありません / わけじゃない. Very often after a partial statement: あまり好きじゃないけど、嫌いなわけじゃない.",
          when: "Softening, correcting an impression, and staying honest without being blunt. It is one of the most-used hedges in adult conversation because it lets you deny an implication without denying the fact.",
          watch: "It denies the inference, not the sentence. 全部わかったわけではありません means I didn't understand all of it, not I understood none of it — and the difference matters, because the second is a much bigger claim.",
        },
        ex: [["嫌いなわけではありませんが、あまり食べません。", "It's not that I dislike it — I just don't eat much of it."], ["全部わかったわけではありません。", "I didn't understand all of it."]],
      },
      {
        id: "beki", jp: "〜べき", en: "ought to — the moral should", kind: "grammar",
        exp: {
          what: "なければなりません is an obligation with a source — a rule, a deadline, a doctor. べき is an obligation with no source but judgement: this is the right thing, and I am saying so. English uses should for both and Japanese does not.",
          build: "Dictionary form + べきです: 行くべきです. する is the irregular one — するべき and すべき are both used, すべき being the more written. The negative is べきではありません.",
          when: "Advice with weight behind it, opinions about what people ought to do, and anything approaching an argument. It is common in writing and in strong speech, and rare in polite small talk.",
          watch: "It is heavier than English should. 帰るべきです to a colleague is not go home, get some rest — it is closer to you ought to leave, and it will be heard as a judgement. For gentle advice, Step 16's たらどうですか is the tool.",
        },
        ex: [["もっと早く言うべきでした。", "I should have said something sooner."], ["そんなことを言うべきではありません。", "You shouldn't say things like that."]],
      },
      {
        id: "nichigainai", jp: "〜に違いない", en: "must be — certainty from evidence", kind: "grammar",
        exp: {
          what: "The top of the certainty dial you have been building since Step 7. でしょう leans probable, かもしれません allows maybe, はず expects with receipts — に違いない concludes, and leaves no room. It is the strongest guess the language has that is still a guess.",
          build: "Plain form + に違いありません, without だ on nouns and な-adjectives: 学生に違いない. In speech it compresses to に違いない.",
          when: "Reasoning out loud from evidence, and common in writing and fiction. Somebody's coat is gone and the door is open — 出かけたに違いない.",
          watch: "It is a conclusion, not a fact. If you know, say it plainly; に違いない about something you actually witnessed sounds like you are guessing about your own experience. And it is noticeably more written than spoken — きっと does the same job in conversation.",
        },
        ex: [["電気が消えている。もう帰ったに違いない。", "The lights are off — he must have gone home."], ["この字は先生のに違いありません。", "This handwriting must be the teacher's."]],
      },
      {
        id: "monoda", jp: "〜ものだ", en: "that's how it is — the general truth", kind: "grammar",
        exp: {
          what: "ものだ states something as a general truth about how the world works, rather than as a fact about this case. It carries a faint weight of common sense — everybody knows this, and you are being reminded.",
          build: "Plain form + ものです. It has three lives worth separating: general truth (若い時は失敗するものだ), nostalgia in the past (よく遊んだものだ — we used to play a lot), and mild instruction (人に会ったら挨拶するものだ).",
          when: "Advice from an older person, essays, and any sentence that means this is simply how things are. The nostalgic use is extremely common in speech.",
          watch: "Do not use it for a fact about one situation. 今日は寒いものです is wrong — today's weather is not a general truth. It needs a claim that would still be true next year.",
        },
        ex: [["若い時は、失敗するものです。", "When you're young, you make mistakes — that's how it goes."], ["学生の頃は、よく遊んだものです。", "Back in my student days, we used to go out a lot."]],
      },
      {
        id: "sb-kakushin", jp: "確信の段階", en: "the certainty dial, complete", kind: "skill",
        exp: {
          what: "Six stops, built across three stages, and this is where they finally sit on one line. Each one commits you to a different amount, and the gap between neighbours is the whole point.",
          build: "です (it is) → でしょう (probably) → かもしれません (maybe) → ようです・らしい (it seems, judged or heard) → はずです (should be, with receipts) → に違いない (must be, concluded). And わけだ sits outside the line: it is not a degree of certainty, it is a conclusion drawn from one.",
          when: "Every claim you make about something you did not personally witness — which, once you notice it, is most of what anybody says.",
          watch: "English collapses the middle of this line into might and probably, so the instinct is to reach for two stops and ignore four. The cost is real: はず and かもしれません are three places apart, and using one for the other misreports how much you actually know.",
        },
        ex: [["明日は雨でしょう。", "Probably — the forecast's word."], ["雨かもしれません。", "Maybe — an honest coin-flip."], ["買ったから、来るはずです。", "Should be — he bought a ticket."], ["電気が消えている。帰ったに違いない。", "Must have — the evidence closes it."]],
      },
      {
        id: "b-s30", jp: "作文 · 推理", en: "reason it out", kind: "build",
        requires: ["wakeda", "nichigainai", "sb-kakushin"],
        brief: "Describe something you noticed and work out what it means. Somebody's absence, a closed shop, a changed schedule. Use two different stops on the certainty dial and one わけだ where the conclusion lands.",
        exp: {
          what: "The stage's whole argumentative apparatus, pointed at something small. Reasoning in writing is what Stage 9 exists to make possible, and this is the first time the course asks for it.",
          build: "Four or five sentences: the observation, one or two guesses at different strengths, and the conclusion. Keep the strong claim for the end — a paragraph that opens with に違いない has nowhere left to go.",
          when: "Half of workplace email is this shape: here is what I noticed, here is what I think it means, here is what I suggest.",
          watch: "Match the stop to the evidence you actually have. A に違いない resting on nothing reads as overconfidence, and a かもしれません resting on proof reads as evasion. The dial is a promise about how much you know.",
        },
        ex: [],
      },
    ],
  },

  // Compound verbs — the productive machinery that lets a verb you already know
  // say something new. かける and ぬく have no English equivalent and qualify for the
  // auto-qualifier treatment.
  {
    cat: "Step 31 · Verbs that carry more",
    level: "S9",
    bank: [["途中", "partway; en route"], ["最後", "the end"], ["電気", "the light; electricity"], ["窓", "window"], ["話しかける", "to speak to"], ["やり直す", "to redo"], ["読み終わる", "to finish reading"], ["続ける", "to continue"]],
    points: [
      {
        id: "hajimeru", jp: "〜はじめる", en: "start doing", kind: "grammar",
        exp: {
          what: "The first of the compound verbs, and the easiest way to see what the whole family does: take a verb's stem, bolt a second verb onto it, and the second one supplies a shape the first one did not have. はじめる supplies a beginning.",
          build: "ます-stem + はじめる: 読みはじめる, 食べはじめる. It conjugates as an ordinary る-verb from there — 読みはじめました.",
          when: "Narrating anything with a start to it. It is also how you say something began without naming a time, which is more common in speech than a clock reading.",
          watch: "はじめる is the transitive twin and はじまる the intransitive one, and the compound only takes はじめる — 雨が降りはじまる is wrong even though the rain starts by itself. The compound describes the action, not the rain.",
        },
        ex: [["八時に読みはじめました。", "I started reading at eight."], ["雨が降りはじめました。", "It's started raining."]],
      },
      {
        id: "owaru", jp: "〜おわる", en: "finish doing", kind: "grammar",
        exp: {
          what: "The other end of the same machine. おわる closes an action, and pairs with はじめる so cleanly that the two are usually learned in one breath.",
          build: "ます-stem + おわる: 読みおわる, 食べおわる. There is also 終える, the transitive version, which sounds more deliberate — 読み終えました is a shade more formal than 読みおわりました.",
          when: "Reporting completion of something that took a while. It is the natural partner of Step 13's てしまう, which finishes an action AND adds a feeling; おわる just finishes it.",
          watch: "It does not work on verbs with no duration. 死におわる is not a sentence — a thing has to take time before it can finish. Instantaneous verbs take てしまう instead.",
        },
        ex: [["この本を読みおわりました。", "I've finished reading this book."], ["食べおわったら、行きましょう。", "Let's go once we've finished eating."]],
      },
      {
        id: "kakeru", jp: "〜かける", en: "started and stopped — the unfinished half", kind: "grammar",
        exp: {
          what: "The one with no English equivalent, and the reason this step exists. かける says an action was begun and not completed — the half-eaten meal, the half-written message, the sentence you started and abandoned. English needs a whole phrase; Japanese puts it in the verb.",
          build: "ます-stem + かける: 食べかける, 言いかける. The result is very often used before a noun as かけの — 読みかけの本, a book I'm partway through.",
          when: "Describing anything left in the middle, which is most of a real desk. Also for an action interrupted: 言いかけてやめました, I started to say something and stopped.",
          watch: "It is not the same as 〜ている. 食べています is eating, in progress right now. 食べかけています is left half-eaten, and nobody is at the table. One is an action; the other is a state something got left in.",
        },
        ex: [["読みかけの本が三冊あります。", "I've got three books on the go."], ["何か言いかけて、やめました。", "He started to say something, then stopped."]],
      },
      {
        id: "nuku", jp: "〜ぬく", en: "all the way through — against resistance", kind: "grammar",
        exp: {
          what: "The mirror of かける and the other no-equivalent one. ぬく says the action was carried all the way to the end, and that finishing it took something. It is not merely completion — it is completion against difficulty, and the pride is inside the verb.",
          build: "ます-stem + ぬく: やりぬく, 走りぬく, 考えぬく. Usually past, and usually about something that was hard.",
          when: "Endurance: a race finished, a project completed, a decision thought through properly. It is the word for having stuck at it.",
          watch: "Do not spend it on easy things. 食べぬきました about a sandwich is comic — the pattern promises difficulty, so an easy object undercuts it. For ordinary completion, おわる or てしまう.",
        },
        ex: [["最後まで走りぬきました。", "I ran it all the way to the end."], ["よく考えぬいて決めました。", "I thought it through properly before deciding."]],
      },
      {
        id: "ppanashi", jp: "〜っぱなし", en: "left on, left open — and you shouldn't have", kind: "grammar",
        exp: {
          what: "A compound with an attitude. っぱなし says something was left in a state it should not have been left in — the light on, the window open, the tap running. The criticism is not added by tone; it is what the word means.",
          build: "ます-stem + っぱなし: つけっぱなし, 開けっぱなし, 出しっぱなし. It behaves as a noun — 電気がつけっぱなしです.",
          when: "Complaining about a state somebody left behind, which in a shared house or a staffroom is daily. Also about yourself, ruefully.",
          watch: "It carries blame, so it is not the neutral way to report a state — that is Step 13's てある, which says somebody did it on purpose. 窓が開けてある means somebody opened it deliberately; 窓が開けっぱなし means somebody left it open and should not have.",
        },
        ex: [["電気がつけっぱなしでした。", "The light had been left on."], ["窓を開けっぱなしにしないでください。", "Please don't leave the window open."]],
      },
      {
        id: "sb-aspect2", jp: "複合動詞のかたち", en: "one stem, five endings", kind: "skill",
        exp: {
          what: "Five endings that all bolt onto a ます-stem and all change what the verb claims about its own completeness. Learned separately they look like vocabulary; laid out together they are a system with two axes — how far the action got, and how you feel about it.",
          build: "はじめる (it began) · おわる (it finished) · かける (it began and stopped) · ぬく (it finished, and that was hard) · っぱなし (it was left, and that was careless). All take the ます-stem, all conjugate as ordinary verbs afterwards except っぱなし, which is a noun.",
          when: "Constantly once you have them, because they replace whole English clauses. Half-read, saw it through, left it running — one word each.",
          watch: "The two with no English equivalent are the two worth drilling: かける and ぬく. English speakers reach for them last because nothing in their first language suggests a verb could carry unfinishedness or endurance as part of its shape.",
        },
        ex: [["読みかけの本", "Half-read — かける."], ["最後までやりぬいた", "Saw it through — ぬく."], ["つけっぱなし", "Left on — and shouldn't have been."]],
      },
      {
        id: "b-s31", jp: "作文 · 机の上", en: "the state of your desk", kind: "build",
        requires: ["kakeru", "ppanashi", "sb-aspect2"],
        brief: "Describe a desk, a room or a kitchen honestly — what is half-done, what got left, what you saw through to the end. Use かける once and っぱなし once.",
        exp: {
          what: "The compound verbs describe states nothing else can describe in one word, and an untidy desk is where all five of them live at once.",
          build: "Four or five sentences. At least one thing partway, one thing left carelessly, and one thing you actually finished — so the contrast between かける, っぱなし and おわる is visible in one paragraph.",
          when: "Describing a situation rather than an event, which is what most of a room is.",
          watch: "Keep っぱなし for things that genuinely should not have been left. Spread across every sentence it stops being criticism and becomes a tic.",
        },
        ex: [],
      },
    ],
  },

  // Where a learner stops saying very and starts saying more than you'd think.
  // Every pattern here grades a claim rather than stating one.
  {
    cat: "Step 32 · Degrees and tendencies",
    level: "S9",
    bank: [["最近", "recently"], ["体", "body"], ["風邪", "a cold"], ["値段", "price"], ["味", "taste; flavour"], ["若者", "young people"], ["努力", "effort"], ["予想", "expectation"]],
    points: [
      {
        id: "gachi", jp: "〜がち", en: "prone to — the unwelcome tendency", kind: "grammar",
        exp: {
          what: "がち says something happens often and that this is a tendency rather than an event — and almost always an unwelcome one. It is the difference between I was ill and I get ill a lot, and the second is a claim about a pattern.",
          build: "ます-stem or noun + がち: 忘れがち, 病気がち, 曇りがち. It behaves as a な-adjective — 忘れがちな人.",
          when: "Describing habits, weaknesses and weather. It is common in advice and in self-deprecation, both of which need a way to name a tendency without naming an occasion.",
          watch: "The negative colouring is built in. 元気がち is not a sentence, because getting better a lot is not a complaint. If the tendency is welcome, this is not the word.",
        },
        ex: [["最近、忘れがちです。", "I've been forgetful lately."], ["子どもの頃は病気がちでした。", "I was often ill as a child."]],
      },
      {
        id: "gimi", jp: "〜気味", en: "a touch of — the slight lean", kind: "grammar",
        exp: {
          what: "気味 is がち's quieter neighbour. It says a little bit, a touch, slightly — a state the speaker is leaning toward without being in it. 風邪気味 is not a cold; it is the shadow of one.",
          build: "ます-stem or noun + 気味, read ぎみ: 風邪気味, 疲れ気味, 太り気味. Behaves as a noun or な-adjective.",
          when: "Health, mood and anything you want to report without committing to. It is the socially useful way to say you are not quite right without asking anybody to do something about it.",
          watch: "It is a degree, not a frequency — that is がち's job. 遅れ気味 means running slightly late; 遅れがち means late a lot. Swapping them turns a today into a habit, which about a colleague is a much larger thing to say.",
        },
        ex: [["ちょっと風邪気味です。", "I've got a bit of a cold coming on."], ["最近、疲れ気味です。", "I've been a touch tired lately."]],
      },
      {
        id: "warini", jp: "〜わりに", en: "for — considering, and against expectation", kind: "grammar",
        exp: {
          what: "わりに sets an expectation and then undercuts it. It means for a — considering it is X, it is surprisingly Y — and the surprise is the point. English does this with for and a raised eyebrow.",
          build: "Plain form or noun + の + わりに: 値段のわりに, 若いわりに. Often followed by は for emphasis: わりには.",
          when: "Judgements that need a benchmark: value for money, ability for age, effort for result. It is one of the most useful review words in the language.",
          watch: "The two halves must genuinely disagree. 安いわりに安い is not a sentence, and more subtly, a pairing that is not surprising just reads as a clumsy comparison — the pattern promises a gap and the listener waits for one.",
        },
        ex: [["値段のわりに、おいしいです。", "For the price, it's good."], ["若いわりに、しっかりしています。", "For someone so young, he's very together."]],
      },
      {
        id: "bahodo", jp: "〜ば〜ほど", en: "the more, the more", kind: "grammar",
        exp: {
          what: "One thing scaled against another: the more you do this, the more that happens. English has a fixed frame for it and so does Japanese, and both repeat the verb — which is the part that feels strange for a week and then stops.",
          build: "ば-form + dictionary form + ほど: 読めば読むほど, 考えれば考えるほど. な-adjectives use なら〜なほど, い-adjectives ければ〜いほど: 高ければ高いほど.",
          when: "Anything with a slope to it — practice and improvement, price and quality, thinking and confusion. Very common in writing and in advice.",
          watch: "The verb must be the same on both sides. 読めば書くほど is not a scale, it is two unrelated things, and the sentence collapses. And the ば-form is the Step 16 one — this pattern is why that lesson mattered.",
        },
        ex: [["練習すればするほど、上手になります。", "The more you practise, the better you get."], ["考えれば考えるほど、わからなくなります。", "The more I think about it, the less I understand."]],
      },
      {
        id: "dokoroka", jp: "〜どころか", en: "far from — the overturn", kind: "grammar",
        exp: {
          what: "The strongest of the group. どころか takes what somebody has assumed and overturns it — not only is it not that, it is the opposite. It is a correction with force behind it.",
          build: "Plain form or noun + どころか. The second half usually carries も or さえ: 上手どころか、話せもしません.",
          when: "Correcting an understatement or a wrong assumption, and common in complaint and in modest denial. Somebody says your Japanese must be good by now — 上手どころか is the reply.",
          watch: "It is not a soft correction. どころか says the assumption was not merely wrong but backwards, so aimed at another person's claim it can read as contradiction. About yourself it is safe and often modest.",
        },
        ex: [["安いどころか、とても高かったです。", "Far from cheap — it was very expensive."], ["休むどころか、もっと忙しくなりました。", "Far from resting, I got busier."]],
      },
      {
        id: "sb-doai", jp: "度合いのことば", en: "grading a claim", kind: "skill",
        exp: {
          what: "Six words that all do something English does with adverbs and a tone of voice: they grade a claim instead of stating it. Together they are the difference between a sentence that reports and one that positions.",
          build: "Frequency: がち (often, unwelcome). Degree: 気味 (a touch of). Benchmark: わりに (for a —, against expectation). Scale: ば〜ほど (the more, the more). Overturn: どころか (far from). And Step 9's あまり and ぜんぜん still sit underneath as the negative end.",
          when: "Reviews, opinions, health, weather, self-description — anywhere a plain adjective would overclaim.",
          watch: "The commonest error is がち for 気味 and back. One is how often, the other is how much, and about a person the difference is between a habit and a Tuesday.",
        },
        ex: [["忘れがち", "Often — a tendency."], ["疲れ気味", "A touch — a degree."], ["値段のわりに", "Considering — a benchmark."]],
      },
      {
        id: "b-s32", jp: "作文 · レビュー", en: "write a review", kind: "build",
        requires: ["warini", "dokoroka", "sb-doai"],
        brief: "Review something honestly — a restaurant, a film, a gadget. Use わりに once to set a benchmark, and one other grading word.",
        exp: {
          what: "A review is a graded claim from beginning to end, which makes it the natural home for everything in this step.",
          build: "Four or five sentences with at least one benchmark and one thing that surprised you. A flat list of adjectives is what this step exists to get you past.",
          when: "Reviews, recommendations, and the half of any opinion that is about degree rather than fact.",
          watch: "Grade honestly. どころか on something mildly disappointing overstates, and it is the one word here that a reader will notice you misusing.",
        },
        ex: [],
      },
    ],
  },

  // The stage closes on three families: exactly-as, pretending, and three grains
  // of timing — the instant, the middle, and the moment after. くせに carries real
  // rudeness and is flagged as such.
  {
    cat: "Step 33 · Manner, pretence and timing",
    level: "S9",
    bank: [["説明", "explanation"], ["約束", "a promise"], ["準備", "preparation"], ["連絡", "contact; word"], ["会議", "meeting"], ["途中", "partway"], ["知る", "to know"], ["決まる", "to be decided"]],
    points: [
      {
        id: "toori", jp: "〜とおり", en: "exactly as — no deviation", kind: "grammar",
        exp: {
          what: "とおり says something happened exactly as something else specified: as I said, as written, as you expected. The claim is precision — not roughly like, but matching.",
          build: "Plain form + とおり, or noun + の + とおり: 言ったとおり, 説明のとおり. After a noun it often becomes どおり with the voicing — 予定どおり, 時間どおり, and those two are near-fixed expressions.",
          when: "Instructions, predictions that came true, and reporting that something went to plan. 予定どおり is one of the most useful two-word answers in working life.",
          watch: "It is not ような. ような is like, resembling; とおり is exactly as, following. 言ったようにやりました is I did it more or less as you said, which is a different and weaker promise than 言ったとおりにやりました.",
        },
        ex: [["言ったとおりにやりました。", "I did it exactly as you said."], ["会議は予定どおり始まりました。", "The meeting started on schedule."]],
      },
      {
        id: "furi", jp: "〜ふりをする", en: "pretending — the performed state", kind: "grammar",
        exp: {
          what: "ふりをする says somebody put on a state they were not in: pretended not to know, pretended to be asleep, pretended not to notice. Japanese makes it a noun and a verb rather than an adverb, which means the pretending is the action.",
          build: "Plain form + ふりをする, or noun + の + ふり: 知らないふりをする, 寝たふりをする, 病気のふり.",
          when: "Describing social behaviour, in stories and in gossip — and 知らないふり in particular is a very common thing to describe, because pretending not to have noticed is a real and often kind move.",
          watch: "It carries a judgement, usually mild. Saying somebody 知らないふりをした is an accusation of a small dishonesty, so it is not the neutral way to say they did not know — that is simply 知りませんでした.",
        },
        ex: [["彼は知らないふりをしました。", "He pretended not to know."], ["寝たふりをしていました。", "I was pretending to be asleep."]],
      },
      {
        id: "nagaramo", jp: "〜ながらも", en: "even while — the concession inside one person", kind: "grammar",
        exp: {
          what: "Step 7's ながら put two actions in one body at one time. ながらも keeps the body and adds a contradiction: doing this and yet that, knowing this and yet doing that. The two halves disagree, and both are true of the same person.",
          build: "ます-stem or adjective + ながらも: 知っていながらも, 小さいながらも. It is written and slightly literary; speech usually reaches for のに or けど instead.",
          when: "Writing, especially anything reflective. It is the shape for admitting an inconsistency in yourself without excusing it.",
          watch: "Do not confuse it with plain ながら. 音楽を聞きながら勉強する is two compatible actions; 知っていながら言わなかった is two incompatible ones, and the も is what makes the difference audible.",
        },
        ex: [["小さいながらも、いい店です。", "Small though it is, it's a good shop."], ["知っていながらも、何も言いませんでした。", "Even knowing, I said nothing."]],
      },
      {
        id: "kuseni", jp: "〜くせに", en: "even though — and I resent it", kind: "grammar",
        exp: {
          what: "The rudest concession in the set, and worth meeting deliberately rather than in the wild. くせに means even though, and it adds contempt: the speaker thinks the other party had no business being that way. It is のに with a sneer.",
          build: "Plain form + くせに. Nouns take の: 子どものくせに. The second half is almost always a complaint or an accusation.",
          when: "Recognition first — fiction, arguments, and complaints between people who know each other well. Producing it aims real disdain at somebody, and it is not softened by です.",
          watch: "⚠️ This is genuinely insulting and a learner who meets it in a drama will misjudge how it lands. 子どものくせに is not affectionate; it means you're only a child, so how dare you. For a neutral even though, use のに. For a polite one, けど.",
        },
        ex: [["知っているくせに、教えてくれませんでした。", "He knew perfectly well, and still wouldn't tell me."], ["子どものくせに、生意気です。", "Cheeky, for a child — and said with contempt."]],
      },
      {
        id: "totan", jp: "〜たとたん", en: "the instant — the seam between two events", kind: "grammar",
        exp: {
          what: "The finest grain of timing the language has: たとたん says the second thing happened at the exact moment the first finished, with no gap and usually no warning. The surprise is part of it.",
          build: "Plain PAST + とたん(に): 座ったとたん, 出たとたん. The second half is almost always something unexpected and outside the speaker's control.",
          when: "Narrating a moment where something turned on a hinge — the phone rang the instant you sat down, it started raining the moment you left.",
          watch: "It cannot carry your own intention. 家を出たとたん、買い物に行きました is wrong: you cannot plan the thing that happens at the instant. If the second half is something you chose, you want てから or たら.",
        },
        ex: [["座ったとたん、電話が鳴りました。", "The instant I sat down, the phone rang."], ["外に出たとたん、雨が降りはじめました。", "The moment I stepped outside, it started raining."]],
      },
      {
        id: "saichuu", jp: "〜最中に", en: "right in the middle of", kind: "grammar",
        exp: {
          what: "The middle grain. 最中に says something interrupted an activity that was fully underway — not during in general, but right in the thick of it, and usually at the worst moment.",
          build: "Noun + の + 最中に, or 〜ている + 最中に: 会議の最中に, 話している最中に.",
          when: "Interruptions, and complaints about them. It is stronger than 間に from Step 19 — 間に is a neutral window, 最中に is a moment that was busy and got broken into.",
          watch: "It needs an activity with a middle. 寝ている最中に is odd for ordinary sleep, because sleeping is not an activity in progress in the way a meeting is; 寝ている間に is the natural sentence there.",
        },
        ex: [["会議の最中に、電話が鳴りました。", "The phone rang right in the middle of the meeting."], ["話している最中に、帰ってしまいました。", "He left while I was still talking."]],
      },
      {
        id: "shidai", jp: "〜次第", en: "as soon as — the moment it is possible", kind: "grammar",
        exp: {
          what: "The forward-looking grain. 次第 says as soon as the first thing is done, the second will follow — and it belongs to arrangements and promises rather than to narration. It is the business register's word for the moment something becomes possible.",
          build: "ます-stem or noun + 次第: 決まり次第, 到着次第, 連絡が入り次第. The second half is always future and always the speaker's own action or intention.",
          when: "Email and workplace speech, constantly: I'll be in touch as soon as it's decided. It is the polite promise that a thing will follow another thing.",
          watch: "It cannot be used about the past — 決まり次第連絡しました is not a sentence, because the pattern is a promise. And the second half must be something you control; 決まり次第、雨が降ります is nonsense for the same reason.",
        },
        ex: [["決まり次第、ご連絡します。", "I'll be in touch as soon as it's decided."], ["到着次第、始めましょう。", "Let's start as soon as everyone's arrived."]],
      },
      {
        id: "sb-timing", jp: "三つのタイミング", en: "the instant, the middle, the moment after", kind: "skill",
        exp: {
          what: "Three patterns that all translate as when or as soon as and mean three different things about where in an event you are standing. Laid side by side the difference stops being subtle.",
          build: "たとたん — the seam, past only, and the second half is a surprise you did not control. 最中に — the thick of it, an activity interrupted. 次第 — the moment it becomes possible, future only, and the second half is your own promise. And Step 19's 間に is still the neutral window under all three.",
          when: "Narration takes the first two; arrangements take the third. Most sentences that feel like they need one of these are actually fine with てから or たら, so reach for these when the timing itself is the point.",
          watch: "The tense restrictions are absolute and they are the fastest way to check yourself: たとたん is past and uncontrolled, 次第 is future and controlled. If a sentence wants both, it wants neither.",
        },
        ex: [["座ったとたん", "The seam — and a surprise."], ["会議の最中に", "The thick of it — interrupted."], ["決まり次第", "As soon as possible — and I promise."]],
      },
      {
        id: "b-s33", jp: "作文 · あの日のこと", en: "the day it all happened at once", kind: "build",
        requires: ["totan", "saichuu", "sb-timing"],
        brief: "Tell a short story about a day when things kept interrupting each other. Use たとたん once for a moment that turned on a hinge, and 最中に once for something that broke into the middle of another thing.",
        exp: {
          what: "The stage's last composition, and the first that asks for narration rather than argument — timing patterns only earn their keep in a story.",
          build: "Five or six sentences in past tense. One hinge, one interruption, and at least one reason pattern from Step 28 so the story explains itself as it goes.",
          when: "Telling anybody about a day that went sideways, which is most of what anecdotes are.",
          watch: "Keep たとたん for things outside your control. A story where every hinge was something the narrator chose is not using the pattern, it is only wearing it.",
        },
        ex: [],
      },
    ],
  },

  // Stage 9's review, and the milestone that closes the JLPT ladder this app
  // teaches.
  {
    cat: "Checkpoint 8 · Stage review",
    level: "S9",
    points: [
      {
        id: "rc8", jp: "復習 · Stage 9", en: "checkpoint: the full stage", kind: "review",
        covers: ["okage", "seide", "bakarini", "sb-riyuu", "nitsuite", "nitaishite", "niyotte", "nioite", "nitotte", "sb-fukugou", "wakeda", "wakedewanai", "beki", "nichigainai", "monoda", "sb-kakushin", "hajimeru", "owaru", "kakeru", "nuku", "ppanashi", "sb-aspect2", "gachi", "gimi", "warini", "bahodo", "dokoroka", "sb-doai", "toori", "furi", "nagaramo", "kuseni", "totan", "saichuu", "shidai", "sb-timing"],
        exp: "The full Stage 9 review — cause with an owner, the compound particles that make writing possible, conclusions drawn and denied, verbs that carry their own completeness, claims that are graded rather than stated, and three grains of timing. One stage, one argument: this is where you stopped reporting what happened and started saying what you think it means.",
        ex: [],
      },
      {
        id: "ms-n3", jp: "N3の範囲、ぜんぶ", en: "everything the N3 syllabus expects", kind: "review",
        exp: "Everything the N3 syllabus expects of you is now behind you.\n\nKeigo in both directions and the nine rooms it reaches you in. Cause that assigns credit or blame. The compound particles that turn a noun into a subject held at arm's length. Conclusions drawn, and — harder — conclusions denied. Compound verbs that say half-done, saw-it-through and left-on in a single word. Claims graded rather than asserted. And timing at three grains.\n\nThe honest description of the change is this: at N5 you could say what happened. At N4 you could say it to somebody, at the right altitude, with the right amount of confidence. At N3 you can say what it means — and disagree with somebody about that, in writing, without either of you being rude.\n\nThat is the last level this app teaches for now. What sits above it is not a new kind of grammar so much as a much longer tail of it, and the honest thing to say is that you no longer need a course to meet the rest — you need reading, and the patience to look things up. You have the machinery to do that.",
        ex: [],
      },
    ],
  },
];

const ALL_POINTS = CURRICULUM.flatMap((c) => c.points.map((p) => ({ ...p, cat: c.cat })));

// ————— Deep walkthroughs + drills (Session 14) —————
// DEEP[id] deepens a lesson into the staged flow Lloyd specified: the idea →
// one example taken apart element by element → the pattern sighted again →
// the wrinkles → a controlled fill-in drill → free writing (the existing
// Practice tab). Entries are AUTHORED DATA — AI-authored, queued for native
// review like all lesson copy — and are spliced between the markers below by
// author-deep-content.py, which asserts mechanically that: seg surfaces
// concatenate exactly to ex[0][0]; every hl is a substring of the example it
// highlights; every choice-drill answer appears among its options; every
// drill question carries the ___ blank. A lesson without an entry renders the
// classic Learn layout unchanged; an entry with drill but no seg (the skill
// builders) keeps its four-beat Learn and gains only the Drill tab.
//
// Entry shape:
//   seg:  [[surface, gloss, isTarget?], …]   ex[0][0] taken apart
//   hl:   "substring"                        highlighted in ex[1..]
//   note: "…"                                optional line under the re-sighting
//   wr:   [{ t, jp?, en?, hl? }, …]          wrinkles, each with optional example
//   drill:{ note?, pool?, items: [
//     { q: "…___…", a: ["accepted", …], opts: ["…", …], why: "…" }   choice
//     { q: "…___…", a: ["accepted", …],                 why: "…" }   typed
//   ]}
//   pool: true → each run draws DRILL_DRAW items at random and the finish
//   line invites the learner back for the rest of the pool.
const DEEP = {
  // @@DEEP-START
  "desu": {"seg": [["私", "I — a noun, about to be introduced as the topic"], ["は", "topic marker — \"as for me…\" (Step 2 takes this apart properly)"], ["学生", "student — the thing being claimed"], ["です。", "THE POINT — the polite \"is\": it equates 私 with 学生 and closes the sentence", 1]], "hl": "だ", "note": "だ is です with the politeness removed — same job, plain register. Recognize it now; you'll produce it later.", "wr": [{"t": "です also rides along after い-adjectives purely for politeness — there it adds no meaning, only polish.", "jp": "高いです。", "en": "It's expensive — です adds politeness, nothing else.", "hl": "です"}], "drill": {"items": [{"q": "これは水___。", "en": "This is water.", "a": ["です"], "opts": ["です", "は", "を", "か"], "why": "Naming what something is → です closes the statement politely."}, {"q": "私は学生___。", "en": "I am a student.", "a": ["です"], "opts": ["です", "じゃないです", "でした", "ですか"], "why": "A present, positive statement — plain です."}, {"q": "田中さんは先生___。", "en": "Tanaka-san is a teacher.", "a": ["です"], "opts": ["です", "でした", "じゃないです", "ですか"], "why": "Still now, still true → です, not the past でした."}, {"q": "あれは学校___。", "en": "That (over there) is a school.", "a": ["です"], "opts": ["です", "は", "の", "か"], "why": "The pointer あれ opens the sentence; です still closes it."}, {"q": "これは本___か。", "en": "Is this a book?", "a": ["です"], "opts": ["です", "は", "じゃ", "の"], "why": "Questions keep です — か is added after it, nothing else moves."}]}},
  "kosoado": {"seg": [["これ", "THE POINT — \"this,\" near me, standing alone as a noun", 1], ["は", "topic marker"], ["私の", "\"my\" — の glues 私 to the noun (Step 3)"], ["本", "book"], ["です。", "\"is\" — closes the statement"]], "hl": "その", "note": "その is holding the noun 店 — the +の set (この・その・あの) never stands alone, and the bare set (これ・それ・あれ) never holds a noun.", "wr": [{"t": "あの and あれ point away from BOTH of you. Something in your listener's hands is それ, however far from you it sits — distance is measured from the pair of you.", "jp": "あの人は誰ですか。", "en": "Who is that person (over there, away from us both)?", "hl": "あの"}], "drill": {"items": [{"q": "___は私の本です。", "en": "This (in my hand) is my book.", "a": ["これ"], "opts": ["これ", "それ", "あれ", "この"], "why": "Near me, standing alone → これ. この would need a noun to hold."}, {"q": "___本は高いです。", "en": "This book (holding it up) is expensive.", "a": ["この"], "opts": ["この", "これ", "それ", "あの"], "why": "Pointing at a noun you're about to say → この本."}, {"q": "___は何ですか。", "en": "What's that (you're holding)?", "a": ["それ"], "opts": ["それ", "これ", "あれ", "その"], "why": "Near the listener, standing alone → それ."}, {"q": "___は学校です。", "en": "That (far from both of us) is a school.", "a": ["あれ"], "opts": ["あれ", "それ", "あの", "これ"], "why": "Away from both of you, standing alone → あれ."}, {"q": "___店は安いです。", "en": "That shop (the one you just mentioned) is cheap.", "a": ["その"], "opts": ["その", "それ", "あの", "この"], "why": "\"The thing you just said\" is そ-territory, and holding a noun needs +の → その."}]}},
  "sb-kosoado": {"drill": {"note": "Two choices in every act of pointing: the distance (こ・そ・あ) and the set (bare, or +の holding a noun). Both at once, every time.", "items": [{"q": "___は何ですか。", "en": "Near the listener, standing alone.", "a": ["それ"], "opts": ["それ", "その", "これ", "あれ"], "why": "そ-distance, bare set — それ stands alone."}, {"q": "___人は先生です。", "en": "Away from both of us.", "a": ["あの"], "opts": ["あの", "あれ", "その", "この"], "why": "あ-distance, and 人 needs holding → あの."}, {"q": "___は私の水です。", "en": "In my own hand.", "a": ["これ"], "opts": ["これ", "この", "それ", "あれ"], "why": "こ-distance, standing alone → これ."}, {"q": "___本は私のです。", "en": "That book you're holding is mine.", "a": ["その"], "opts": ["その", "それ", "あの", "この"], "why": "Near the listener + holding 本 → その."}, {"q": "___は駅ですか。", "en": "Is that (way over there) the station?", "a": ["あれ"], "opts": ["あれ", "あの", "それ", "これ"], "why": "Far from you both, standing alone → あれ."}]}},
  "janai": {"seg": [["これ", "\"this\" — near me"], ["は", "topic marker"], ["水", "water — the thing being denied"], ["じゃないです。", "THE POINT — \"is not\": the denial that stands where です stood", 1]], "hl": "ではありません", "note": "Same word in formal dress — ではありません is what careful speech and writing use. じゃない, bare, is what friends hear.", "wr": [{"t": "い-adjectives never take this negative. 高い carries its own: 高くない — never 高いじゃない. This split catches every English speaker; Step 9 drills it.", "jp": "この本は高くないです。", "en": "This book is not expensive — the い-adjective negates itself.", "hl": "高くない"}], "drill": {"items": [{"q": "これはお茶___。", "en": "This isn't tea. (polite conversation)", "a": ["じゃないです"], "opts": ["じゃないです", "です", "でした", "ですか"], "why": "Polite everyday denial → じゃないです."}, {"q": "彼は学生___。", "en": "He is not a student. (formal, written)", "a": ["ではありません"], "opts": ["ではありません", "じゃない", "でした", "です"], "why": "The formal register wears the full ではありません."}, {"q": "それは犬___。", "en": "That's not a dog. (casual, to a friend)", "a": ["じゃない"], "opts": ["じゃない", "じゃないです", "ではありません", "です"], "why": "Between friends the です drops: bare じゃない."}, {"q": "私は先生___。", "en": "I am not a teacher. (polite conversation)", "a": ["じゃないです"], "opts": ["じゃないです", "じゃない", "です", "でした"], "why": "Polite but spoken → じゃないです."}, {"q": "この店は静か___。", "en": "This shop is not quiet. (polite)", "a": ["じゃないです"], "opts": ["じゃないです", "くないです", "ではない", "でした"], "why": "静か is a な-adjective — it negates like a noun, with じゃないです."}]}},
  "deshita": {"seg": [["昨日", "yesterday — a bare time word, no particle needed"], ["は", "topic marker"], ["雨", "rain — a noun; \"rainy\" as a state"], ["でした。", "THE POINT — です moved into the past: \"was\"", 1]], "hl": "でした", "wr": [{"t": "The past negative stacks pieces you already own: じゃなかったです in conversation, ではありませんでした in formal writing.", "jp": "昨日は雨じゃなかったです。", "en": "Yesterday it wasn't rainy.", "hl": "じゃなかったです"}, {"t": "い-adjectives refuse でした — 寒い carries its own past, 寒かったです. 寒いでした is the classic miss; Step 9 drills the system.", "jp": "昨日は寒かったです。", "en": "Yesterday was cold — the adjective itself changed shape.", "hl": "寒かったです"}], "drill": {"items": [{"q": "昨日は休み___。", "en": "Yesterday was a day off.", "a": ["でした"], "opts": ["でした", "です", "じゃないです", "でしたか"], "why": "Past and finished → でした."}, {"q": "先週は雨___。", "en": "Last week it wasn't rainy.", "a": ["じゃなかったです"], "opts": ["じゃなかったです", "じゃないです", "でした", "です"], "why": "Past + negative stack: じゃなかったです."}, {"q": "彼は学生___。", "en": "He was a student.", "a": ["でした"], "opts": ["でした", "です", "じゃない", "ですか"], "why": "A finished state → でした."}, {"q": "昨日は寒___です。", "en": "Yesterday was cold — careful, い-adjective!", "a": ["かった"], "opts": ["かった", "い", "でした", "くない"], "why": "い-adjectives carry their own past: 寒かったです, never 寒いでした."}, {"q": "あの店は静か___。", "en": "That shop was quiet.", "a": ["でした"], "opts": ["でした", "かったです", "じゃない", "です"], "why": "静か is a な-adjective — it takes でした like a noun would."}]}},
  "ka": {"seg": [["これ", "\"this\""], ["は", "topic marker"], ["何", "\"what\" — sitting exactly where the answer will sit"], ["です", "the polite closer, unmoved"], ["か。", "THE POINT — the spoken question mark: it turns the whole statement into a question", 1]], "hl": "か", "note": "Nothing moved. English flips \"you are\" into \"are you\"; Japanese leaves the statement intact and hangs か on the end.", "wr": [{"t": "In writing, a か-question usually ends with 。 rather than ？. And in casual speech か drops entirely — rising pitch does the whole job: 学生？", "jp": null}], "drill": {"items": [{"q": "これは本です___。", "en": "Is this a book?", "a": ["か"], "opts": ["か", "ね", "よ", "の"], "why": "A genuine question → か. ね and よ tune statements, not questions."}, {"q": "田中さんは先生です___。", "en": "Is Tanaka-san a teacher?", "a": ["か"], "opts": ["か", "よ", "ね", "が"], "why": "You're asking, not telling → か."}, {"q": "あれは駅です___。", "en": "Is that the station?", "a": ["か"], "opts": ["か", "ね", "を", "は"], "why": "Same statement, か on the end — word order never flips."}, {"q": "明日は休みです。 → ___", "en": "Turn the statement into a question.", "a": ["明日は休みですか", "明日は休みですか。"], "why": "Add か after です — nothing else moves."}, {"q": "それはお茶です。 → ___", "en": "Turn the statement into a question.", "a": ["それはお茶ですか", "それはお茶ですか。"], "why": "Statement + か = question. The order is untouched."}]}},
  "sb-negq": {"drill": {"note": "はい means \"your statement is right\"; いいえ means \"your statement is wrong.\" Track the statement, not the fact — or dodge with the predicate.", "items": [{"q": "学生じゃないですか。— ___、学生じゃないです。", "en": "Right — I'm not a student.", "a": ["はい"], "opts": ["はい", "いいえ", "そうですね"], "why": "The statement (\"not a student\") is correct → はい, exactly where English says no."}, {"q": "学生じゃないですか。— ___、学生です。", "en": "Wrong — I AM a student.", "a": ["いいえ"], "opts": ["はい", "いいえ", "そうですね"], "why": "The statement is wrong → いいえ, then the correction."}, {"q": "高くないですか。— ___、高いです。", "en": "\"Isn't it expensive?\" — you think it IS.", "a": ["いいえ"], "opts": ["はい", "いいえ", "そうですね"], "why": "\"Not expensive\" is wrong → いいえ、高いです."}, {"q": "高くないですか。— ___、高くないです。", "en": "Agreed, it's not expensive.", "a": ["はい"], "opts": ["はい", "いいえ", "そうですね"], "why": "The negative statement is right → はい."}, {"q": "雨じゃないですか。— ___、雨です。", "en": "Wrong — it IS raining.", "a": ["いいえ"], "opts": ["はい", "いいえ", "そうですね"], "why": "Reject the wrong statement with いいえ, then state the fact."}, {"q": "学生じゃないですか。— ___", "en": "Dodge the trap: answer with the predicate only. (You ARE a student.)", "a": ["学生です", "学生です。"], "why": "The escape hatch — no はい, no いいえ, no ambiguity. Natives do this constantly."}]}},
  "qwords": {"seg": [["これ", "\"this\""], ["は", "topic marker"], ["何", "THE POINT — \"what,\" dropped into the exact slot where the answer will go", 1], ["です", "polite closer"], ["か。", "question marker"]], "hl": "いつ", "note": "いつ sits where the time would sit; どこ where the place would. The question word fills the answer's slot — nothing gets hauled to the front.", "wr": [{"t": "Question words take が, never は. And 何 switches reading: なん before です and counters, なに before を and most particles — copy the examples until it settles.", "jp": "誰が来ましたか。", "en": "Who came? — 誰が, never 誰は.", "hl": "誰が"}], "drill": {"items": [{"q": "___が来ましたか。", "en": "Who came?", "a": ["誰"], "opts": ["誰", "何", "どこ", "いつ"], "why": "Asking after a person → 誰."}, {"q": "これは___ですか。", "en": "What is this?", "a": ["何"], "opts": ["何", "誰", "どう", "どこ"], "why": "Asking what a thing is → 何 (read なん before です)."}, {"q": "___で買いましたか。", "en": "Where did you buy it?", "a": ["どこ"], "opts": ["どこ", "いつ", "誰", "何"], "why": "Asking after a place → どこ, in the place slot."}, {"q": "___日本へ来ましたか。", "en": "When did you come to Japan?", "a": ["いつ"], "opts": ["いつ", "どこ", "何", "どう"], "why": "Asking after a time → いつ, no particle needed."}, {"q": "誰___来ましたか。", "en": "Who came? — pick the particle.", "a": ["が"], "opts": ["が", "は", "を", "に"], "why": "Question words take が, never は."}]}},
  "ne": {"seg": [["今日", "today — bare time word"], ["は", "topic marker"], ["暑いです", "\"is hot\" — a complete polite statement"], ["ね。", "THE POINT — hands the thought to the listener: \"…right?\"", 1]], "hl": "ね", "wr": [{"t": "ね leans on shared ground. If the listener can't already feel or know what you're saying, ね has nothing to lean on — announcing real news is よ's job, next lesson.", "jp": null}], "drill": {"items": [{"q": "今日は暑いです___。", "en": "You're both standing in the heat.", "a": ["ね"], "opts": ["ね", "よ", "か", "が"], "why": "Shared experience → ね, inviting the nod."}, {"q": "いい天気です___。", "en": "Sharing the view with a friend.", "a": ["ね"], "opts": ["ね", "よ", "か", "の"], "why": "You both see the sky — ね hands the thought over."}, {"q": "おいしいです___。", "en": "Eating together — isn't this good?", "a": ["ね"], "opts": ["ね", "よ", "か", "を"], "why": "Same table, same food → ね."}, {"q": "明日は休みです___。", "en": "Heads-up — they didn't know this.", "a": ["よ"], "opts": ["ね", "よ", "か", "の"], "why": "Genuinely new information is よ's job — ね would presume they already knew."}, {"q": "寒いです___。", "en": "You're both shivering at the bus stop.", "a": ["ね"], "opts": ["ね", "よ", "か", "が"], "why": "Both feeling it → ね."}]}},
  "yo": {"seg": [["この店", "\"this shop\" — この holding its noun"], ["は", "topic marker"], ["安いです", "\"is cheap\" — a complete polite statement"], ["よ。", "THE POINT — flags the statement as news: \"you didn't know this\"", 1]], "hl": "よ", "wr": [{"t": "よね stacks both particles: fairly sure, wanting backup. The order is fixed — よね, never ねよ.", "jp": "この店は安いですよね。", "en": "This shop's cheap, right? — stating and checking at once.", "hl": "よね"}], "drill": {"items": [{"q": "明日は休みです___。", "en": "Your friend hasn't heard — tell them.", "a": ["よ"], "opts": ["よ", "ね", "か", "が"], "why": "New to the listener → よ."}, {"q": "この店は安いです___。", "en": "Recommending a shop they don't know.", "a": ["よ"], "opts": ["よ", "ね", "か", "の"], "why": "Useful news → よ."}, {"q": "暑いです___。", "en": "You're both outside in it.", "a": ["ね"], "opts": ["よ", "ね", "か", "を"], "why": "Shared experience is ね — よ here would lecture them about their own skin."}, {"q": "田中さんは先生です___。", "en": "Correcting a wrong guess.", "a": ["よ"], "opts": ["よ", "ね", "か", "が"], "why": "Fixing a wrong assumption → よ."}, {"q": "明日は休みです___ね。", "en": "Pretty sure — back me up?", "a": ["よ"], "opts": ["よ", "ね", "か", "の"], "why": "よね is the fixed stack: a statement plus a request for backup."}]}},
  "sb-yone": {"drill": {"note": "Same sentence, three settings — the choice is social, not grammatical. Read the room in each line.", "items": [{"q": "暑いです___。", "en": "We both feel it; nod along.", "a": ["ね"], "opts": ["ね", "よ", "よね", "か"], "why": "Sharing → ね."}, {"q": "暑いです___。", "en": "You clearly haven't been outside yet.", "a": ["よ"], "opts": ["ね", "よ", "よね", "か"], "why": "Delivering news → よ."}, {"q": "明日は休みです___。", "en": "Fairly sure — back me up.", "a": ["よね"], "opts": ["ね", "よ", "よね", "か"], "why": "Belief + request for backup → よね."}, {"q": "この店、安いです___。", "en": "News to them.", "a": ["よ"], "opts": ["ね", "よ", "よね", "か"], "why": "They didn't know → よ."}, {"q": "いい天気です___。", "en": "Small talk in the elevator.", "a": ["ね"], "opts": ["ね", "よ", "よね", "か"], "why": "Shared observation, social glue → ね."}, {"q": "明日は雨です___。", "en": "You checked the forecast; they didn't.", "a": ["よ"], "opts": ["ね", "よ", "よね", "か"], "why": "Information they lack → よ."}]}},
  "wa": {"seg": [["私", "I — the thing about to be put on stage"], ["は", "THE POINT — sets 私 as the topic: everything after this is a comment on it", 1], ["学生", "student — the comment begins"], ["です。", "\"is\" — closes the statement politely"]], "hl": "は", "note": "Same move: この店 goes on stage, 安いです comments on it. は never means \"is\" — です is doing that job, separately.", "wr": [{"t": "は is pronounced wa — a spelling quirk that applies only to the particle, never to は inside a word. A later skill lesson drills all three quirky particles at once.", "jp": null}], "drill": {"items": [{"q": "私___学生です。", "en": "Introducing yourself.", "a": ["は"], "opts": ["は", "が", "を", "に"], "why": "You're setting the topic — yourself — and commenting on it → は."}, {"q": "今日___暑いですね。", "en": "Making small talk about today.", "a": ["は"], "opts": ["は", "が", "を", "で"], "why": "今日 goes on stage; the comment follows → は."}, {"q": "この店___安いです。", "en": "As for this shop — it's cheap.", "a": ["は"], "opts": ["は", "が", "を", "の"], "why": "Talking ABOUT the shop → topic は."}, {"q": "映画___面白かったです。", "en": "\"How was the movie?\" — answering about it.", "a": ["は"], "opts": ["は", "が", "を", "に"], "why": "The movie is already on the table — known information takes は."}, {"q": "私___田中です。", "en": "Opening a self-introduction.", "a": ["は"], "opts": ["は", "が", "を", "も"], "why": "Naming your topic (yourself), then commenting → は."}]}},
  "ga": {"seg": [["公園", "the park"], ["に", "location marker — where something exists (Step 8 owns this fully)"], ["犬", "a dog — arriving in the conversation for the first time"], ["が", "THE POINT — points at who or what: the dog, new on the scene", 1], ["います。", "\"is there / exists\" — for living things"]], "hl": "が", "note": "誰 asks \"which person?\" — exactly が's specialty. Question words take が, never は.", "wr": [{"t": "A fixed set of words demands が no matter what: ある・いる, 好き, わかる and friends. Step 10 collects them into one drill.", "jp": null}], "drill": {"items": [{"q": "公園に猫___います。", "en": "There's a cat in the park — first mention.", "a": ["が"], "opts": ["が", "は", "を", "の"], "why": "New information arriving → が."}, {"q": "誰___来ましたか。", "en": "Who came?", "a": ["が"], "opts": ["が", "は", "も", "を"], "why": "Question words take が, never は."}, {"q": "田中さん___来ました。", "en": "Answering: Tanaka-san is the one who came.", "a": ["が"], "opts": ["が", "は", "を", "に"], "why": "The answer to a who-question identifies — that's が's job."}, {"q": "犬___好きです。", "en": "I like dogs.", "a": ["が"], "opts": ["が", "を", "は", "に"], "why": "好き is one of the words that demands が — never を."}, {"q": "水___あります。", "en": "There's water — pointing it out.", "a": ["が"], "opts": ["が", "は", "を", "で"], "why": "ある introduces what exists → が."}]}},
  "sb-waga": {"drill": {"note": "が for information arriving now; は for information already on the table. Watch each sentence decide.", "items": [{"q": "昨日、猫___来ました。", "en": "A cat came yesterday — new on the scene.", "a": ["が"], "opts": ["は", "が", "を", "も"], "why": "First appearance → が, like English \"a cat.\""}, {"q": "その猫___小さかったです。", "en": "The cat (now known) was tiny.", "a": ["は"], "opts": ["は", "が", "を", "の"], "why": "Second mention — now it's \"the cat\" → は."}, {"q": "誰___来ましたか。", "en": "Who came?", "a": ["が"], "opts": ["は", "が", "を", "に"], "why": "Identifying which person → が."}, {"q": "田中さん___来ました。", "en": "— Tanaka-san did.", "a": ["が"], "opts": ["は", "が", "を", "も"], "why": "The answer inherits the question's が."}, {"q": "映画___どうでしたか。", "en": "How was the movie?", "a": ["は"], "opts": ["は", "が", "を", "か"], "why": "The movie is already what you're discussing → は."}, {"q": "私___学生です。", "en": "Just naming what you're discussing: yourself.", "a": ["は"], "opts": ["は", "が", "を", "で"], "why": "No one asked \"who is the student?\" — plain topic → は."}]}},
  "o": {"seg": [["パン", "bread — the thing the action lands on"], ["を", "THE POINT — tags パン as what gets eaten", 1], ["食べます。", "\"eat\" — the verb, acting on パン"]], "hl": "を", "note": "見ました acts on 映画 — watched what? The what takes を. The character を exists for nothing else in the language.", "wr": [{"t": "Not every English object becomes を. 好き, ほしい, わかる and できる all take が instead — the mismatch that catches every English speaker. Step 10 drills it head-on.", "jp": null}], "drill": {"items": [{"q": "水___飲みます。", "en": "I drink water.", "a": ["を"], "opts": ["を", "が", "は", "に"], "why": "Drink what? Water — the acted-on thing takes を."}, {"q": "本___読みました。", "en": "I read a book.", "a": ["を"], "opts": ["を", "が", "で", "は"], "why": "Read what? を marks it."}, {"q": "映画___見ます。", "en": "I watch a movie.", "a": ["を"], "opts": ["を", "に", "が", "の"], "why": "Watch what? を."}, {"q": "朝ごはん___食べました。", "en": "I ate breakfast.", "a": ["を"], "opts": ["を", "が", "は", "で"], "why": "Ate what? を lands the action on 朝ごはん."}, {"q": "日本語___勉強します。", "en": "I study Japanese.", "a": ["を"], "opts": ["を", "が", "に", "は"], "why": "Study what? を — 勉強する acts on its subject matter."}]}},
  "ni-time": {"seg": [["七時", "seven o'clock — a number time, the kind に loves"], ["に", "THE POINT — pins the action to that point on the clock", 1], ["起きます。", "\"get up\" — the pinned action"]], "hl": "明日", "note": "And here is the trap, live: 明日 takes NO に — it's a relative word. (The に in this sentence belongs to 会います — meeting someone — a different job entirely.)", "wr": [{"t": "に attaches to clock-and-calendar times only. Relative words — 今日, 明日, 昨日, 毎日, 来週 — go bare: 明日行きます, never 明日に行きます. Rule of thumb: if a number is involved, use に.", "jp": "毎日七時に起きます。", "en": "Every day (bare) at seven (に) I get up — both rules in one sentence.", "hl": "毎日"}], "drill": {"items": [{"q": "七時___起きます。", "en": "I get up at seven.", "a": ["に"], "opts": ["に", "で", "は", "を"], "why": "A clock time → に."}, {"q": "月曜日___来てください。", "en": "Please come on Monday.", "a": ["に"], "opts": ["に", "で", "が", "を"], "why": "A calendar day → に."}, {"q": "___に起きます。", "en": "Which of these can hold に?", "a": ["七時"], "opts": ["七時", "明日", "毎日", "今日"], "why": "Only the clock time — the relative words go bare."}, {"q": "___に来ました。", "en": "Which one takes に?", "a": ["三月"], "opts": ["三月", "昨日", "今日", "毎日"], "why": "三月 is calendar; the rest only make sense relative to now, so no に."}, {"q": "___に帰ります。", "en": "Which one takes に?", "a": ["五時"], "opts": ["五時", "明日", "毎日", "来週"], "why": "Numbers take に; 明日・毎日・来週 stay bare."}]}},
  "ni-dest": {"seg": [["学校", "school — where the movement is headed"], ["に", "THE POINT — marks the destination", 1], ["行きます。", "\"go\" — a movement verb; に/へ need one"]], "hl": "へ", "note": "へ does the same job with a slightly softer, more directional feel — and it's pronounced e, the second spelling quirk.", "wr": [{"t": "Don't reach for で here. で covers what you do once you've arrived, not the going: 学校に行きます, then 学校で勉強します. The next lessons pair them up.", "jp": null}], "drill": {"items": [{"q": "駅___行きます。", "en": "I go to the station.", "a": ["に", "へ"], "opts": ["に", "で", "を", "は"], "why": "Destination → に (へ works too)."}, {"q": "日本___来ました。", "en": "I came to Japan.", "a": ["へ", "に"], "opts": ["へ", "で", "を", "が"], "why": "Where the journey headed → へ or に."}, {"q": "家___帰ります。", "en": "I'm going home.", "a": ["に", "へ"], "opts": ["に", "で", "を", "は"], "why": "帰る is a movement verb; home is the destination → に."}, {"q": "図書館___行きました。", "en": "I went to the library.", "a": ["に", "へ"], "opts": ["に", "で", "が", "は"], "why": "Going TO it → に. Studying AT it would be で."}, {"q": "公園___来てください。", "en": "Please come to the park.", "a": ["に", "へ"], "opts": ["に", "で", "を", "の"], "why": "Destination of 来る → に."}]}},
  "sb-kanaparticles": {"drill": {"note": "Three kana stop sounding like themselves the moment they work as particles. Sound on one side, spelling on the other — the IME wants the spelling.", "items": [{"q": "In 私は学生です, the particle は is pronounced ___.", "a": ["wa"], "opts": ["wa", "ha", "e", "o"], "why": "Particle は reads wa — only as a particle."}, {"q": "In 学校へ行きます, the particle へ is pronounced ___.", "a": ["e"], "opts": ["e", "he", "wa", "o"], "why": "Particle へ reads e."}, {"q": "を is pronounced ___.", "a": ["o"], "opts": ["o", "wo", "u", "e"], "why": "を exists only as a particle, and it always reads o."}, {"q": "To TYPE the particle は, you type ___.", "a": ["ha"], "opts": ["ha", "wa", "wo", "e"], "why": "The IME wants the spelling: ha. Typing wa gets you わ — the most common romaji slip there is."}, {"q": "To TYPE を, you type ___.", "a": ["wo"], "opts": ["wo", "o", "ha", "we"], "why": "Spelling again: wo, even though it sounds like o."}, {"q": "In はなはきれいです, the SECOND は is pronounced ___.", "a": ["wa"], "opts": ["wa", "ha", "na", "e"], "why": "The first は belongs to はな (flower) and reads ha; the second is the particle — wa."}]}},
  "de-place": {"seg": [["図書館", "the library — the stage"], ["で", "THE POINT — marks the stage the action is performed on", 1], ["勉強します。", "\"study\" — a real action, happening there"]], "hl": "で", "note": "Met a friend — an action — at the park: で again. The に in this sentence belongs to 会います (meeting someone), not to the place.", "wr": [{"t": "で needs a real action. Simply BEING somewhere isn't one — that's に with あります・います, and the next skill lesson drills the split until it holds.", "jp": null}], "drill": {"items": [{"q": "図書館___勉強します。", "en": "I study at the library.", "a": ["で"], "opts": ["で", "に", "を", "は"], "why": "Studying is an action performed there → で."}, {"q": "公園___友達に会いました。", "en": "I met a friend at the park.", "a": ["で"], "opts": ["で", "に", "へ", "を"], "why": "Meeting happens there — action at a place → で."}, {"q": "家___映画を見ます。", "en": "I watch movies at home.", "a": ["で"], "opts": ["で", "に", "が", "を"], "why": "Watching is the action; home is its stage → で."}, {"q": "学校___日本語を話します。", "en": "I speak Japanese at school.", "a": ["で"], "opts": ["で", "に", "は", "を"], "why": "Speaking happens there → で."}, {"q": "店___働きます。", "en": "I work at a shop.", "a": ["で"], "opts": ["で", "に", "を", "の"], "why": "Working is an action → で marks where it's done."}]}},
  "de-means": {"seg": [["バス", "the bus — the tool for the job"], ["で", "THE POINT — \"by means of\": how the going gets done", 1], ["行きます。", "\"go\""]], "hl": "で", "note": "Same particle, same idea: Japanese is the tool the speaking is done with.", "wr": [{"t": "One exception every learner hits early: walking is 歩いて — a て-form, coming in Step 4 — never 歩きで.", "jp": "駅まで歩いて行きます。", "en": "I walk to the station — 歩いて does the job で can't.", "hl": "歩いて"}], "drill": {"items": [{"q": "電車___行きます。", "en": "I go by train.", "a": ["で"], "opts": ["で", "に", "を", "が"], "why": "The train is the means → で."}, {"q": "日本語___話しました。", "en": "I spoke in Japanese.", "a": ["で"], "opts": ["で", "を", "に", "は"], "why": "The language is the tool → で."}, {"q": "ペン___書きます。", "en": "I write with a pen.", "a": ["で"], "opts": ["で", "を", "が", "に"], "why": "The pen is the instrument → で."}, {"q": "バス___帰ります。", "en": "I'm heading home by bus.", "a": ["で"], "opts": ["で", "に", "へ", "を"], "why": "How you travel → で. The destination would take に."}, {"q": "何___行きますか。", "en": "How (by what) will you go?", "a": ["で"], "opts": ["で", "に", "が", "は"], "why": "Asking after the means → 何で."}]}},
  "sb-nide": {"drill": {"note": "に for where something IS; で for where something HAPPENS. Every item is one or the other — decide which question the sentence answers.", "items": [{"q": "図書館___勉強します。", "en": "I study at the library.", "a": ["で"], "opts": ["に", "で", "へ", "を"], "why": "Studying happens there → で."}, {"q": "図書館___本がたくさんあります。", "en": "The library has many books.", "a": ["に"], "opts": ["に", "で", "へ", "を"], "why": "The books just ARE there — existence → に."}, {"q": "公園___犬がいます。", "en": "There's a dog in the park.", "a": ["に"], "opts": ["に", "で", "が", "を"], "why": "Being, not doing → に with います."}, {"q": "公園___遊びます。", "en": "I play at the park.", "a": ["で"], "opts": ["に", "で", "へ", "は"], "why": "Playing is an action performed there → で."}, {"q": "学校___行きます。", "en": "I go to school.", "a": ["に"], "opts": ["に", "で", "を", "は"], "why": "Movement toward → に. Neither existence nor action-at."}, {"q": "家___テレビを見ます。", "en": "I watch TV at home.", "a": ["で"], "opts": ["に", "で", "が", "を"], "why": "Watching happens there → で."}]}},
  "to-and": {"seg": [["パン", "bread"], ["と", "THE POINT — the exhaustive \"and\": this and this, the complete list", 1], ["牛乳", "milk"], ["を", "object marker, covering the whole pair"], ["買いました。", "\"bought\""]], "hl": "と", "note": "と's second job, same instinct: WITH someone — a companion is \"and\" for people.", "wr": [{"t": "と claims the list is complete. If you're giving examples rather than the whole set, that's や — two lessons from here.", "jp": null}], "drill": {"items": [{"q": "パン___水を買いました。", "en": "I bought bread and water — that's everything.", "a": ["と"], "opts": ["と", "や", "も", "か"], "why": "A complete list → と."}, {"q": "友達___映画を見ました。", "en": "I watched a movie with a friend.", "a": ["と"], "opts": ["と", "や", "を", "は"], "why": "A companion → と, \"with.\""}, {"q": "犬___猫がいます。", "en": "There's a dog and a cat — exactly those.", "a": ["と"], "opts": ["と", "や", "か", "も"], "why": "Complete list → と."}, {"q": "肉___魚を食べます。", "en": "I eat meat and fish — the whole answer.", "a": ["と"], "opts": ["と", "や", "か", "の"], "why": "Everything named → と."}, {"q": "母___父が来ます。", "en": "Mother and father are coming.", "a": ["と"], "opts": ["と", "や", "も", "が"], "why": "Both of them, no others implied → と."}]}},
  "mo": {"seg": [["私", "I"], ["も", "THE POINT — \"too\": adds 私 to something already said, REPLACING は", 1], ["学生", "student"], ["です。", "\"am\""]], "hl": "も", "note": "Doubled, も…も means \"both\" — and with a negative verb it sweeps both away: neither meat nor fish.", "wr": [{"t": "も replaces は, が and を — it never stacks on them. 私もは is impossible; the も IS the particle.", "jp": null}], "drill": {"items": [{"q": "私___学生です。", "en": "(Tanaka is a student.) I'm a student too.", "a": ["も"], "opts": ["も", "は", "が", "と"], "why": "Joining an existing statement → も, in place of は."}, {"q": "田中さん___来ます。", "en": "(Yamada is coming.) Tanaka is coming too.", "a": ["も"], "opts": ["も", "は", "が", "を"], "why": "Adding to the list → も."}, {"q": "水___飲みます。", "en": "(I drink tea.) I drink water too.", "a": ["も"], "opts": ["も", "を", "は", "か"], "why": "も replaces を entirely — 水もを is impossible."}, {"q": "肉も魚___食べません。", "en": "I eat neither meat nor fish.", "a": ["も"], "opts": ["も", "と", "や", "を"], "why": "も…も with a negative → \"neither…nor.\""}, {"q": "今日___暑いです。", "en": "(Yesterday was hot.) Today is hot too.", "a": ["も"], "opts": ["も", "は", "が", "に"], "why": "Today joins yesterday → も."}]}},
  "no": {"seg": [["私", "I / me — the owner, coming first"], ["の", "THE POINT — the glue: links two nouns, the second one being the main thing", 1], ["本", "book — the main noun, always last"], ["です。", "\"is\""]], "hl": "の", "note": "Wider than owning: a teacher OF Japanese. の links any two nouns — origin, type, topic, possession.", "wr": [{"t": "Order is fixed: describer first, main noun last. 本の私 is nonsense. When chains grow — 私の日本語の先生 — read from the back: the LAST noun is the thing.", "jp": null}], "drill": {"items": [{"q": "私___本です。", "en": "It's my book.", "a": ["の"], "opts": ["の", "は", "が", "を"], "why": "Owner + thing → の between them."}, {"q": "日本語___先生です。", "en": "A teacher of Japanese.", "a": ["の"], "opts": ["の", "を", "が", "は"], "why": "Field + person → の. Not possession — connection."}, {"q": "田中さん___犬です。", "en": "Tanaka-san's dog.", "a": ["の"], "opts": ["の", "は", "と", "が"], "why": "Owner first, thing last, の between."}, {"q": "これは母___料理です。", "en": "This is my mother's cooking.", "a": ["の"], "opts": ["の", "が", "を", "で"], "why": "Maker + made → の."}, {"q": "東京___店で買いました。", "en": "I bought it at a shop in Tokyo.", "a": ["の"], "opts": ["の", "で", "に", "と"], "why": "Place + thing → の links them into one noun phrase."}]}},
  "sb-no": {"drill": {"note": "の has four jobs — and one famous overreach. きれいの人 is the one this drill exists to kill.", "items": [{"q": "私___本です。", "en": "Possession — my book.", "a": ["の"], "opts": ["の", "な", "が", "は"], "why": "Noun + noun → の."}, {"q": "赤い___をください。", "en": "\"The red one, please\" — の standing in for a noun.", "a": ["の"], "opts": ["の", "こと", "が", "は"], "why": "の replaces the noun you both already know."}, {"q": "きれい___人です。", "en": "A pretty person — careful!", "a": ["な"], "opts": ["な", "の", "い", "と"], "why": "きれい is a な-adjective: きれいな人. きれいの人 is THE classic overreach."}, {"q": "日本語___先生です。", "en": "A teacher of Japanese.", "a": ["の"], "opts": ["の", "な", "を", "は"], "why": "Two nouns → の."}, {"q": "静か___店が好きです。", "en": "I like quiet shops.", "a": ["な"], "opts": ["な", "の", "い", "が"], "why": "静か is also a な-adjective — な before the noun, never の."}, {"q": "友達___車で来ました。", "en": "I came in my friend's car.", "a": ["の"], "opts": ["の", "な", "と", "が"], "why": "Owner + thing → の."}]}},
  "sb-pronouns": {"drill": {"note": "Japanese drops the pronoun whenever context carries it — and keeps it exactly where contrast or identification demands it. Choose the natural sentence.", "items": [{"q": "A friend asks what you did yesterday. ___", "en": "\"I watched a movie.\"", "a": ["昨日映画を見ました。"], "opts": ["昨日映画を見ました。", "私は昨日映画を見ました。", "あなたは映画を見ました。"], "why": "You're obviously the subject — dropping 私 is the natural default."}, {"q": "I'M going, but my sister isn't. ___", "en": "Contrast between two people.", "a": ["私は行きますが、妹は行きません。"], "opts": ["私は行きますが、妹は行きません。", "行きますが、行きません。", "あなたは行きますが、妹は行きません。"], "why": "Contrast is exactly when 私 must stay — dropping both leaves nonsense."}, {"q": "Asking your coworker Tanaka if they're busy today: ___", "en": "Address a person you know by name.", "a": ["田中さんは今日も忙しいですか。"], "opts": ["田中さんは今日も忙しいですか。", "あなたは今日も忙しいですか。", "私は今日も忙しいですか。"], "why": "Use the name — あなた to someone whose name you know reads as pointed."}, {"q": "Someone asks who ate the bread. It was you. ___", "en": "Identify yourself as the one.", "a": ["私が食べました。"], "opts": ["私が食べました。", "食べました。", "あなたが食べました。"], "why": "Identification keeps 私 — with が, because you're answering \"who?\""}]}},
  "kara-from": {"seg": [["九時", "nine o'clock — the starting edge"], ["から", "THE POINT — \"from\": opens the span", 1], ["五時", "five o'clock — the far edge"], ["まで", "\"until / up to\" — the bookend partner"], ["働きます。", "\"work\" — what fills the span"]], "hl": "から", "note": "Space, not just time: from home to the station. から〜まで brackets any kind of span.", "drill": {"items": [{"q": "九時___五時まで働きます。", "en": "I work from nine to five.", "a": ["から"], "opts": ["から", "まで", "に", "で"], "why": "The starting edge → から."}, {"q": "九時から五時___働きます。", "en": "I work from nine to five.", "a": ["まで"], "opts": ["まで", "から", "に", "を"], "why": "The far edge → まで."}, {"q": "家___駅まで歩きます。", "en": "I walk from home to the station.", "a": ["から"], "opts": ["から", "まで", "に", "へ"], "why": "Where the walking starts → から."}, {"q": "月曜日___火曜日まで休みです。", "en": "Off from Monday to Tuesday.", "a": ["から"], "opts": ["から", "まで", "に", "も"], "why": "Days span the same way hours do → から…まで."}, {"q": "学校___家まで歩きました。", "en": "I walked from school to home.", "a": ["から"], "opts": ["から", "まで", "で", "を"], "why": "Starting point → から."}]}},
  "yori": {"seg": [["犬", "dogs — the topic being measured"], ["は", "topic marker"], ["猫", "cats — the yardstick"], ["より", "THE POINT — \"than\": marks what's being measured against", 1], ["大きいです。", "\"are big\" — which より turns into \"are bigger\""]], "hl": "より", "wr": [{"t": "The adjective never changes. English inflects big → bigger; Japanese leaves 大きい alone and lets より carry the whole comparison.", "jp": null}], "drill": {"items": [{"q": "猫は犬___小さいです。", "en": "Cats are smaller than dogs.", "a": ["より"], "opts": ["より", "から", "は", "の"], "why": "The yardstick (dogs) takes より."}, {"q": "今日は昨日___暑いです。", "en": "Today is hotter than yesterday.", "a": ["より"], "opts": ["より", "から", "まで", "も"], "why": "Measured against yesterday → 昨日より."}, {"q": "電車はバス___早いです。", "en": "The train is faster than the bus.", "a": ["より"], "opts": ["より", "から", "で", "は"], "why": "The bus is the standard of comparison → より."}, {"q": "この店はあの店___安いです。", "en": "This shop is cheaper than that one.", "a": ["より"], "opts": ["より", "から", "の", "も"], "why": "あの店 is the yardstick → より."}, {"q": "あの店はこの店___高いです。", "en": "That shop is pricier than this one.", "a": ["より"], "opts": ["より", "から", "まで", "が"], "why": "Same machine, flipped — より marks the standard."}]}},
  "ka-or": {"seg": [["コーヒー", "coffee — option one"], ["か", "THE POINT — \"or\": between nouns, offering a choice", 1], ["お茶", "tea — option two"], ["を", "object marker over whichever wins"], ["飲みます。", "\"drink\""]], "hl": "か", "wr": [{"t": "This か sits BETWEEN nouns. The question か sits at the very end. Same kana, different station — position tells you which is which every time.", "jp": null}], "drill": {"items": [{"q": "コーヒー___お茶を飲みます。", "en": "I'll drink coffee or tea.", "a": ["か"], "opts": ["か", "と", "や", "も"], "why": "One or the other → か."}, {"q": "月曜日___火曜日に来てください。", "en": "Please come Monday or Tuesday.", "a": ["か"], "opts": ["か", "と", "や", "も"], "why": "Either day works → か."}, {"q": "バス___電車で行きます。", "en": "I'll go by bus or train.", "a": ["か"], "opts": ["か", "と", "や", "の"], "why": "A choice of means → か."}, {"q": "肉___魚を食べますか。", "en": "Will you have the meat or the fish?", "a": ["か"], "opts": ["か", "と", "や", "も"], "why": "Choosing one → か between the nouns; the second か asks the question."}, {"q": "パン___牛乳を買いました。", "en": "I bought bread AND milk — both.", "a": ["と"], "opts": ["と", "か", "や", "も"], "why": "Both, not either → と. か would mean you bought one or the other."}]}},
  "ya": {"seg": [["机の上", "on the desk — の chaining place words (Step 8 revisits this)"], ["に", "location marker"], ["本", "books"], ["や", "THE POINT — \"and, among others\": an open list of examples", 1], ["ペン", "pens"], ["が", "subject of ある"], ["あります。", "\"there are\""]], "hl": "や", "note": "など — \"and so on\" — often closes a や list, making the open-endedness explicit.", "wr": [{"t": "と would claim the desk holds books and pens and NOTHING else. や says \"that kind of thing.\" Choose by the honesty of your list.", "jp": null}], "drill": {"items": [{"q": "机の上に本___ペンがあります。", "en": "Books, pens, that sort of thing.", "a": ["や"], "opts": ["や", "と", "か", "も"], "why": "Examples from a longer list → や."}, {"q": "すし___てんぷらなどを食べました。", "en": "Sushi, tempura, and so on.", "a": ["や"], "opts": ["や", "と", "か", "の"], "why": "など confirms it: open list → や."}, {"q": "店で水___お茶を買いました。", "en": "Water, tea, among other things.", "a": ["や"], "opts": ["や", "と", "か", "も"], "why": "Not the whole receipt — examples → や."}, {"q": "パン___牛乳を買いました。", "en": "Bread and milk — the complete list.", "a": ["と"], "opts": ["と", "や", "か", "も"], "why": "Everything named → と. や would imply more unnamed items."}, {"q": "公園に犬___猫がいます。", "en": "Dogs, cats, and so on.", "a": ["や"], "opts": ["や", "と", "か", "が"], "why": "A sampling, not a census → や."}]}},
  "dake": {"seg": [["水", "water"], ["だけ", "THE POINT — \"only\": states the limit, flat and neutral", 1], ["飲みます。", "\"drink\" — positive verb, and that's fine"]], "hl": "だけ", "wr": [{"t": "だけ states the limit neutrally; しか — next lesson — states it with a sigh. Same fact, different feeling.", "jp": null}], "drill": {"items": [{"q": "水___飲みます。", "en": "I drink only water — neutral fact.", "a": ["だけ"], "opts": ["だけ", "しか", "も", "を"], "why": "しか would demand a negative verb: 水しか飲みません. Positive 飲みます → だけ."}, {"q": "一人___来ました。", "en": "Just one person came — stated flatly.", "a": ["だけ"], "opts": ["だけ", "しか", "も", "が"], "why": "来ました is positive → だけ."}, {"q": "日本語___話します。", "en": "I speak only Japanese — plain statement.", "a": ["だけ"], "opts": ["だけ", "しか", "も", "を"], "why": "Neutral limit, positive verb → だけ."}, {"q": "百円___あります。", "en": "I have exactly 100 yen — no drama.", "a": ["だけ"], "opts": ["だけ", "しか", "が", "も"], "why": "あります is positive — だけ carries the limit without the sigh."}, {"q": "本を一冊___買いました。", "en": "I bought just the one book.", "a": ["だけ"], "opts": ["だけ", "しか", "も", "や"], "why": "Positive verb, neutral count → だけ."}]}},
  "shika": {"seg": [["百円", "100 yen"], ["しか", "THE POINT — \"nothing but\": a limit with a sigh built in", 1], ["ありません。", "\"there ISN'T\" — しか forces the verb negative"]], "hl": "しか", "note": "話しません — negative again. しか cannot live with a positive verb, ever.", "wr": [{"t": "The verb goes negative even though the meaning is almost positive (\"I DO have 100 yen — but only that\"). English has nothing like it. The pattern is しか + negative, no exceptions.", "jp": null}], "drill": {"items": [{"q": "百円___ありません。", "en": "I've only got 100 yen — alas.", "a": ["しか"], "opts": ["しか", "だけ", "も", "が"], "why": "The negative ありません is the tell → しか."}, {"q": "日本語___話しません。", "en": "I speak nothing but Japanese.", "a": ["しか"], "opts": ["しか", "だけ", "を", "も"], "why": "Negative 話しません → しか."}, {"q": "水___飲みません。", "en": "I drink nothing but water.", "a": ["しか"], "opts": ["しか", "だけ", "も", "を"], "why": "しか pairs with the negative; だけ would want 飲みます."}, {"q": "水___飲みます。", "en": "Positive verb — which limiter fits?", "a": ["だけ"], "opts": ["だけ", "しか", "も", "か"], "why": "飲みます is positive — しか is impossible here; だけ carries the limit."}, {"q": "一人___来ませんでした。", "en": "Only one person came — fewer than hoped.", "a": ["しか"], "opts": ["しか", "だけ", "も", "が"], "why": "Negative verb + disappointment → しか."}]}},
  "counters": {"seg": [["りんご", "apples — the noun, unchanged by counting"], ["を", "object marker"], ["三つ", "THE POINT — the count, floating after the particle, before the verb", 1], ["買いました。", "\"bought\""]], "hl": "二人", "note": "People get 〜人 — and ひとり, ふたり are irregular readings worth memorizing whole; regular counting starts at さんにん.", "wr": [{"t": "The count doesn't glue to the noun the way English does (\"three apples\") — it floats after the particle: りんごを三つ買いました, never 三つりんごを.", "jp": null}], "drill": {"items": [{"q": "りんごを___買いました。", "en": "I bought three (small round things).", "a": ["三つ"], "opts": ["三つ", "三人", "三枚", "三本"], "why": "General things → the 〜つ series."}, {"q": "学生が___います。", "en": "There are two students.", "a": ["二人"], "opts": ["二人", "二つ", "二枚", "二本"], "why": "People → 〜人, read ふたり here."}, {"q": "本を___読みました。", "en": "I read one book.", "a": ["一冊"], "opts": ["一冊", "一つ", "一人", "一枚"], "why": "Bound volumes → 〜冊."}, {"q": "紙を___ください。", "en": "Three sheets of paper, please.", "a": ["三枚"], "opts": ["三枚", "三つ", "三本", "三人"], "why": "Flat things → 〜枚."}, {"q": "友達が___来ました。", "en": "Three friends came.", "a": ["三人"], "opts": ["三人", "三つ", "三枚", "三冊"], "why": "People → 〜人, さんにん — regular from three up."}]}},
  "sb-counters": {"drill": {"note": "The counter changes its own sound as the numbers change — いっぽん・にほん・さんぼん is one word wearing three hats. Sound work, ear first.", "items": [{"q": "ビールを一本ください。— 一本 is read ___.", "a": ["いっぽん"], "opts": ["いっぽん", "いちほん", "いっほん", "いちぼん"], "why": "One + ほん → いっぽん, the doubled-consonant + p shift."}, {"q": "ビールを二本ください。— 二本 is read ___.", "a": ["にほん"], "opts": ["にほん", "にぼん", "にぽん", "ふたほん"], "why": "Two leaves ほん untouched: にほん."}, {"q": "ビールを三本ください。— 三本 is read ___.", "a": ["さんぼん"], "opts": ["さんぼん", "さんほん", "さんぽん", "みほん"], "why": "After ん, h → b: さんぼん — the rendaku the kana modules planted."}, {"q": "一人 is read ___.", "a": ["ひとり"], "opts": ["ひとり", "いちにん", "いちじん", "ひとにん"], "why": "Irregular — memorized whole."}, {"q": "二人 is read ___.", "a": ["ふたり"], "opts": ["ふたり", "ににん", "にじん", "ふたにん"], "why": "The second irregular — regular counting starts at さんにん."}, {"q": "切手を___買いました。", "en": "Three stamps.", "a": ["三枚"], "opts": ["三枚", "三本", "三つ", "三冊"], "why": "Stamps are flat → 〜枚."}]}},
  "gurai": {"seg": [["三十分", "thirty minutes — an amount of time"], ["ぐらい", "THE POINT — \"about\": fuzzes the amount", 1], ["かかります。", "\"it takes\""]], "hl": "ぐらい", "wr": [{"t": "ぐらい fuzzes AMOUNTS; ごろ — next lesson — fuzzes POINTS in time. About thirty minutes → ぐらい; around seven o'clock → ごろ.", "jp": null}], "drill": {"items": [{"q": "三十分___かかります。", "en": "It takes about thirty minutes.", "a": ["ぐらい"], "opts": ["ぐらい", "ごろ", "まで", "だけ"], "why": "A duration — an amount → ぐらい."}, {"q": "十人___来ました。", "en": "About ten people came.", "a": ["ぐらい"], "opts": ["ぐらい", "ごろ", "だけ", "しか"], "why": "A quantity → ぐらい."}, {"q": "七時___帰ります。", "en": "I'll head home around seven.", "a": ["ごろ"], "opts": ["ごろ", "ぐらい", "まで", "から"], "why": "A point on the clock → ごろ, not ぐらい."}, {"q": "千円___です。", "en": "It's about 1000 yen.", "a": ["ぐらい"], "opts": ["ぐらい", "ごろ", "だけ", "も"], "why": "An amount of money → ぐらい."}, {"q": "三年___日本にいました。", "en": "I was in Japan about three years.", "a": ["ぐらい"], "opts": ["ぐらい", "ごろ", "まで", "から"], "why": "A span of years — an amount → ぐらい."}]}},
  "goro": {"seg": [["七時", "seven o'clock — a point on the clock"], ["ごろ", "THE POINT — \"around\": fuzzes the point in time", 1], ["帰ります。", "\"go home\""]], "hl": "ごろ", "wr": [{"t": "ごろ usually replaces に rather than stacking with it — 七時ごろ帰ります, no に needed.", "jp": null}], "drill": {"items": [{"q": "七時___起きます。", "en": "I get up around seven.", "a": ["ごろ"], "opts": ["ごろ", "ぐらい", "から", "まで"], "why": "A clock point → ごろ."}, {"q": "三月___日本へ来ました。", "en": "I came to Japan around March.", "a": ["ごろ"], "opts": ["ごろ", "ぐらい", "から", "も"], "why": "A calendar point → ごろ."}, {"q": "三十分___かかります。", "en": "It takes roughly thirty minutes.", "a": ["ぐらい"], "opts": ["ぐらい", "ごろ", "まで", "だけ"], "why": "An amount of time, not a clock point → ぐらい."}, {"q": "九時___寝ます。", "en": "I go to bed around nine.", "a": ["ごろ"], "opts": ["ごろ", "ぐらい", "に", "から"], "why": "A fuzzy clock point → ごろ, replacing に."}, {"q": "三時___友達に会います。", "en": "Meeting a friend around three.", "a": ["ごろ"], "opts": ["ごろ", "ぐらい", "まで", "から"], "why": "Around a point → ごろ."}]}},
  "sb-slots": {"drill": {"note": "Japanese sentences park each piece in a slot — time, place, object, verb — and only the verb's seat is bolted down: last.", "items": [{"q": "Yesterday, at the library, I read a book — the unmarked order: ___", "a": ["昨日、図書館で本を読みました。"], "opts": ["昨日、図書館で本を読みました。", "本を昨日図書館で読みました。", "読みました昨日図書館で本を。"], "why": "Time → place → object → verb is the resting order."}, {"q": "The one position that never moves: the verb goes ___.", "a": ["last"], "opts": ["last", "first", "right after the time word"], "why": "Everything else can shuffle for emphasis; the verb anchors the end."}, {"q": "本は昨日読みました。— 本 is up front because ___.", "a": ["It's been made the topic with は"], "opts": ["It's been made the topic with は", "Objects always come first", "It's a mistake"], "why": "Fronting a noun and marking it は puts it on stage — \"as for the book…\""}, {"q": "昨日、公園で友達に会いました。— 公園で is filling the ___ slot.", "a": ["place"], "opts": ["place", "time", "object"], "why": "で marks the stage the meeting happened on — the place slot."}]}},
  "dict": {"seg": [["明日", "tomorrow — bare, no に"], ["学校", "school"], ["へ", "destination marker"], ["行く。", "THE POINT — the dictionary form: the verb exactly as a dictionary lists it, plain and complete", 1]], "hl": "話す", "note": "Dictionary form isn't only casual — it's the form other grammar grabs hold of: 話すの turns the whole verb into a thing (Step 10 uses this constantly).", "wr": [{"t": "Plain form ends sentences among friends; です・ます ends them everywhere else. Which one you reach for is a register dial — a skill lesson later this step sets it deliberately.", "jp": null}], "drill": {"items": [{"q": "Which is the dictionary form? ___", "a": ["食べる"], "opts": ["食べる", "食べます", "食べて", "食べた"], "why": "The plain, complete, look-it-up shape: 食べる."}, {"q": "Which is the dictionary form? ___", "a": ["飲む"], "opts": ["飲む", "飲みます", "飲んで", "飲んだ"], "why": "飲む — the form every conjugation starts from."}, {"q": "Which is the dictionary form? ___", "a": ["来る"], "opts": ["来る", "来ます", "来て", "来た"], "why": "来る — irregular in its changes, but this is its home shape."}, {"q": "行きます → dictionary form: ___", "a": ["行く", "いく"], "why": "Strip the ます machinery back to the plain verb: 行く."}, {"q": "見ます → dictionary form: ___", "a": ["見る", "みる"], "why": "見る — a る-verb; the dictionary form is the stem plus る."}]}},
  "masu": {"seg": [["毎日", "every day — bare time word"], ["勉強", "study — the noun half of the verb"], ["します。", "THE POINT — the polite ます form: safe with anyone, anywhere", 1]], "hl": "食べません", "note": "The negative is built into the same machine: ます → ません. No extra word, the ending itself flips.", "wr": [{"t": "How a verb reaches its ます form depends on its type — る-verbs swap る for ます, う-verbs shift the last sound to the い row, する・来る do their own thing. The next lesson sorts every verb you'll meet into those three boxes.", "jp": null}], "drill": {"pool": true, "note": "Dictionary form on the left — give the polite ます form. A different draw of verbs every round.", "items": [{"q": "食べる → 毎日パンを___。", "en": "eat → polite", "a": ["食べます", "たべます"], "why": "る-verb: drop る, add ます."}, {"q": "飲む → 毎日お茶を___。", "en": "drink → polite", "a": ["飲みます", "のみます"], "why": "う-verb: む → み + ます."}, {"q": "行く → 毎日学校へ___。", "en": "go → polite", "a": ["行きます", "いきます"], "why": "う-verb: く → き + ます."}, {"q": "見る → 毎日テレビを___。", "en": "watch → polite", "a": ["見ます", "みます"], "why": "る-verb: drop る, add ます."}, {"q": "話す → 日本語を___。", "en": "speak → polite", "a": ["話します", "はなします"], "why": "う-verb: す → し + ます."}, {"q": "読む → 毎日本を___。", "en": "read → polite", "a": ["読みます", "よみます"], "why": "う-verb: む → み + ます."}, {"q": "書く → 名前を___。", "en": "write → polite", "a": ["書きます", "かきます"], "why": "う-verb: く → き + ます."}, {"q": "帰る → 七時に___。", "en": "go home → polite. Careful!", "a": ["帰ります", "かえります"], "why": "帰る LOOKS like a る-verb but is an う-verb: 帰ります, never 帰ます."}, {"q": "待つ → 駅で___。", "en": "wait → polite", "a": ["待ちます", "まちます"], "why": "う-verb: つ → ち + ます."}, {"q": "する → 毎日勉強を___。", "en": "do → polite", "a": ["します"], "why": "Irregular: する → します, memorized whole."}, {"q": "来る → 友達が___。", "en": "come → polite", "a": ["来ます", "きます"], "why": "Irregular: 来る → 来ます (きます)."}]}},
  "sb-verbtypes": {"drill": {"note": "Three boxes hold every verb in the language. Sorting fast — especially the る-lookalikes — is the whole skill.", "items": [{"q": "食べる is a ___ verb.", "a": ["る-verb"], "opts": ["る-verb", "う-verb", "irregular"], "why": "True る-verb: the る drops clean off (食べます)."}, {"q": "飲む is a ___ verb.", "a": ["う-verb"], "opts": ["う-verb", "る-verb", "irregular"], "why": "Ends in む — the う row shifts (飲みます)."}, {"q": "帰る is a ___ verb.", "a": ["う-verb"], "opts": ["う-verb", "る-verb", "irregular"], "why": "The famous fake: ends in る but conjugates 帰ります. A short list of these is worth memorizing."}, {"q": "する is ___.", "a": ["irregular"], "opts": ["irregular", "る-verb", "う-verb"], "why": "One of exactly two irregulars — する and 来る."}, {"q": "見る is a ___ verb.", "a": ["る-verb"], "opts": ["る-verb", "う-verb", "irregular"], "why": "True る-verb: 見ます."}, {"q": "買う is a ___ verb.", "a": ["う-verb"], "opts": ["う-verb", "る-verb", "irregular"], "why": "Ends in う itself: 買います."}]}},
  "ta-plain": {"seg": [["昨日", "yesterday — bare"], ["、", "a breath"], ["ラーメン", "ramen"], ["を", "object marker"], ["食べた。", "THE POINT — the plain past: た where る was. Casual, complete", 1]], "hl": "行かない", "note": "The plain NEGATIVE rides the same register: ない where the polite has ません. 行かない, 食べない — friends-and-diary forms.", "wr": [{"t": "The plain past た is built exactly like the て-form with a た instead — 飲んで/飲んだ, 行って/行った. Learn one, get the other free (て arrives two lessons on).", "jp": null}], "drill": {"pool": true, "note": "Plain past (…た) or plain negative (…ない) as asked — the casual forms speech runs on.", "items": [{"q": "食べる → 昨日、パンを___。", "en": "plain past", "a": ["食べた", "たべた"], "why": "る-verb: る → た."}, {"q": "飲む → 昨日、お茶を___。", "en": "plain past", "a": ["飲んだ", "のんだ"], "why": "む → んだ."}, {"q": "行く → 昨日、学校へ___。", "en": "plain past", "a": ["行った", "いった"], "why": "行く is the exception: 行った, not 行いた."}, {"q": "読む → 昨日、本を___。", "en": "plain past", "a": ["読んだ", "よんだ"], "why": "む → んだ."}, {"q": "見る → 昨日、映画を___。", "en": "plain past", "a": ["見た", "みた"], "why": "る-verb: る → た."}, {"q": "する → 昨日、勉強を___。", "en": "plain past", "a": ["した"], "why": "Irregular: する → した."}, {"q": "行く → 今日は___。", "en": "plain negative", "a": ["行かない", "いかない"], "why": "う-verb: く → か + ない."}, {"q": "食べる → 朝ごはんは___。", "en": "plain negative", "a": ["食べない", "たべない"], "why": "る-verb: る → ない."}, {"q": "飲む → コーヒーは___。", "en": "plain negative", "a": ["飲まない", "のまない"], "why": "う-verb: む → ま + ない."}, {"q": "ある → 時間が___。", "en": "plain negative — the odd one out", "a": ["ない"], "why": "ある's negative is just ない — the one verb that vanishes entirely."}]}},
  "mashita": {"seg": [["昨日", "yesterday"], ["映画", "a movie"], ["を", "object marker"], ["見ました。", "THE POINT — polite past: ます → ました", 1]], "hl": "食べませんでした", "note": "The polite past negative stacks the pieces in order: ません + でした. Didn't eat, said politely.", "wr": [{"t": "Every verb builds this the same way once it has its ます form — which is why the ます machinery came first. No new sorting to learn here.", "jp": null}], "drill": {"pool": true, "note": "Polite past (…ました) or polite past negative (…ませんでした), as asked.", "items": [{"q": "見る → 昨日、映画を___。", "en": "polite past", "a": ["見ました", "みました"], "why": "見ます → 見ました."}, {"q": "食べる → 朝ごはんを___。", "en": "polite past", "a": ["食べました", "たべました"], "why": "食べます → 食べました."}, {"q": "行く → 先週、東京へ___。", "en": "polite past", "a": ["行きました", "いきました"], "why": "行きます → 行きました."}, {"q": "飲む → 薬を___。", "en": "polite past", "a": ["飲みました", "のみました"], "why": "飲みます → 飲みました."}, {"q": "買う → 本を___。", "en": "polite past", "a": ["買いました", "かいました"], "why": "買います → 買いました."}, {"q": "食べる → 昨日は何も___。", "en": "polite past negative", "a": ["食べませんでした", "たべませんでした"], "why": "ません + でした — the full polite stack."}, {"q": "行く → 昨日は学校へ___。", "en": "polite past negative", "a": ["行きませんでした", "いきませんでした"], "why": "行きません + でした."}, {"q": "する → 宿題を___。", "en": "polite past", "a": ["しました"], "why": "します → しました."}, {"q": "来る → 田中さんが___。", "en": "polite past", "a": ["来ました", "きました"], "why": "来ます → 来ました."}, {"q": "読む → その本は___。", "en": "polite past negative", "a": ["読みませんでした", "よみませんでした"], "why": "読みません + でした."}]}},
  "te": {"seg": [["朝", "in the morning — bare"], ["起きて", "THE POINT — the て-form: \"get up, and…\" — it links this action to the next", 1], ["、", "a breath"], ["顔", "face"], ["を", "object marker"], ["洗います。", "\"wash\" — the sentence's real ending carries the politeness for the whole chain"]], "hl": "書いて", "note": "て is also how requests attach: 書いて + ください. Half of Step 5 is built on this one form.", "wr": [{"t": "The sound changes sort by the verb's last kana: む・ぶ・ぬ → んで, く → いて (but 行く → 行って), ぐ → いで, う・つ・る → って, す → して. る-verbs just swap る for て. It's the hardest conjugation of Stage 1 — hence the pool below.", "jp": null}], "drill": {"pool": true, "note": "Dictionary form to て-form — the change that unlocks half the grammar ahead. Draw again until the sound shifts feel automatic.", "items": [{"q": "食べる → パンを___、学校へ行きます。", "en": "て-form", "a": ["食べて", "たべて"], "why": "る-verb: る → て."}, {"q": "飲む → お茶を___、寝ます。", "en": "て-form", "a": ["飲んで", "のんで"], "why": "む → んで."}, {"q": "行く → 学校へ___、勉強します。", "en": "て-form — the exception!", "a": ["行って", "いって"], "why": "行く breaks its own rule: 行って, not 行いて."}, {"q": "書く → 名前を___ください。", "en": "て-form", "a": ["書いて", "かいて"], "why": "く → いて."}, {"q": "聞く → 先生に___ください。", "en": "て-form", "a": ["聞いて", "きいて"], "why": "く → いて (聞く is regular; only 行く breaks it)."}, {"q": "話す → 日本語で___ください。", "en": "て-form", "a": ["話して", "はなして"], "why": "す → して."}, {"q": "待つ → ちょっと___ください。", "en": "て-form", "a": ["待って", "まって"], "why": "つ → って."}, {"q": "読む → 本を___、寝ました。", "en": "て-form", "a": ["読んで", "よんで"], "why": "む → んで."}, {"q": "泳ぐ → 海で___、帰りました。", "en": "て-form", "a": ["泳いで", "およいで"], "why": "ぐ → いで — the voiced twin of く → いて."}, {"q": "する → 勉強を___、テレビを見ます。", "en": "て-form", "a": ["して"], "why": "Irregular: する → して."}, {"q": "来る → 家に___ください。", "en": "て-form", "a": ["来て", "きて"], "why": "Irregular: 来る → 来て (きて)."}]}},
  "teiru": {"seg": [["今", "now — the word that loves this form"], ["、", "a breath"], ["雨", "rain"], ["が", "subject marker"], ["降っています。", "THE POINT — て-form + いる: the action is in progress, happening as we speak", 1]], "hl": "見ています", "note": "Same machine on a person: watching, right now, mid-action.", "wr": [{"t": "ています has a second life — states that continue (living somewhere, being married). The very next lesson takes that on; don't be surprised when 住んでいます isn't \"in the middle of living.\"", "jp": null}], "drill": {"pool": true, "note": "て-form + います — happening right now. The て-form pool pays off here.", "items": [{"q": "降る → 今、雨が___。", "en": "It's raining right now.", "a": ["降っています", "ふっています"], "why": "降って + います — in progress."}, {"q": "見る → 弟はテレビを___。", "en": "…is watching TV.", "a": ["見ています", "みています"], "why": "見て + います."}, {"q": "食べる → 今、朝ごはんを___。", "en": "…am eating breakfast.", "a": ["食べています", "たべています"], "why": "食べて + います."}, {"q": "読む → 母は本を___。", "en": "…is reading a book.", "a": ["読んでいます", "よんでいます"], "why": "読んで + います."}, {"q": "書く → 名前を___。", "en": "…am writing my name.", "a": ["書いています", "かいています"], "why": "書いて + います."}, {"q": "話す → 先生と___。", "en": "…is talking with the teacher.", "a": ["話しています", "はなしています"], "why": "話して + います."}, {"q": "待つ → 駅で友達を___。", "en": "…am waiting for a friend.", "a": ["待っています", "まっています"], "why": "待って + います."}, {"q": "泳ぐ → 海で___。", "en": "…is swimming in the sea.", "a": ["泳いでいます", "およいでいます"], "why": "泳いで + います."}]}},
  "teiru2": {"seg": [["東京", "Tokyo"], ["に", "location of the state"], ["住んでいます。", "THE POINT — ています as an ongoing STATE: not \"in the middle of moving in,\" but \"lives there\"", 1]], "hl": "働いています", "note": "Same shape: employment as a standing state, not an action underway this second.", "wr": [{"t": "A handful of verbs live almost entirely in this form: 住んでいます, 結婚しています, 知っています. Saying 住みます for \"I live in Tokyo\" is the classic miss — it sounds like a moving plan.", "jp": null}], "drill": {"items": [{"q": "住む → 東京に___。", "en": "I live in Tokyo. (state)", "a": ["住んでいます", "すんでいます"], "why": "Residing is a state → 住んでいます, not 住みます."}, {"q": "働く → 銀行で___。", "en": "I work at a bank. (state)", "a": ["働いています", "はたらいています"], "why": "Ongoing employment → 働いています."}, {"q": "田中さんは結婚___。", "en": "Tanaka is married — the state, not the ceremony.", "a": ["しています"], "opts": ["しています", "します", "しました", "する"], "why": "Married-ness continues → しています. しました would report the wedding day."}, {"q": "知る → 田中さんを___。", "en": "I know Tanaka.", "a": ["知っています", "しっています"], "why": "知る lives almost only as 知っています — knowing is a state."}, {"q": "彼は東京に___。", "en": "He lives in Tokyo.", "a": ["住んでいます"], "opts": ["住んでいます", "住みます", "住みました", "住む"], "why": "住みます reads as a future plan to move — the state is 住んでいます."}]}},
  "sb-transitive": {"drill": {"note": "Pairs of twins: the doer-verb takes を (someone acts), the happen-verb takes が (the thing does it itself). The particle and the verb must agree.", "items": [{"q": "窓___閉めました。", "en": "I closed the window.", "a": ["を"], "opts": ["を", "が", "は", "に"], "why": "閉める is the doer-twin — someone acts on the window → を."}, {"q": "窓___閉まりました。", "en": "The window closed.", "a": ["が"], "opts": ["が", "を", "で", "へ"], "why": "閉まる is the happen-twin — the window did it itself → が."}, {"q": "電気___つけました。", "en": "I turned on the lights.", "a": ["を"], "opts": ["を", "が", "は", "の"], "why": "つける = doer-twin → を."}, {"q": "電気___つきました。", "en": "The lights came on.", "a": ["が"], "opts": ["が", "を", "は", "に"], "why": "つく = happen-twin → が."}, {"q": "会議___始まりました。", "en": "The meeting began.", "a": ["が"], "opts": ["が", "を", "で", "へ"], "why": "始まる happens by itself → が. 始める would need a person and を."}, {"q": "The twin test: \"The movie begins at three\" uses ___.", "a": ["始まる"], "opts": ["始まる", "始める", "始めます"], "why": "No one is doing anything to the movie — the happen-twin 始まる."}]}},
  "mou": {"seg": [["もう", "THE POINT — \"already\": the door on this action is closed", 1], ["昼ごはん", "lunch"], ["を", "object marker"], ["食べました。", "\"ate\" — a completed form, which もう requires"]], "hl": "もう", "wr": [{"t": "もう pairs with completed forms. Its mirror まだ — next lesson — pairs with ていません. The two lessons are one system: door closed, door still open.", "jp": null}], "drill": {"items": [{"q": "___昼ごはんを食べました。", "en": "I already ate lunch.", "a": ["もう"], "opts": ["もう", "まだ", "とても", "ぐらい"], "why": "Completed and done → もう."}, {"q": "宿題は___終わりました。", "en": "The homework's already finished.", "a": ["もう"], "opts": ["もう", "まだ", "とても", "だけ"], "why": "Done-ness → もう + a past form."}, {"q": "___食べていません。", "en": "I haven't eaten yet.", "a": ["まだ"], "opts": ["まだ", "もう", "とても", "だけ"], "why": "The door's still open → まだ, with ていません."}, {"q": "田中さんは___帰りましたか。", "en": "Has Tanaka already gone home?", "a": ["もう"], "opts": ["もう", "まだ", "ぐらい", "から"], "why": "Asking whether it's already happened → もう."}, {"q": "食べる → もう___。", "en": "\"I already ate\" — polite. Finish it.", "a": ["食べました", "たべました"], "why": "もう + the completed polite past."}]}},
  "mada": {"seg": [["まだ", "THE POINT — \"yet / still\": the door on this action stays open", 1], ["食べていません。", "\"have not eaten\" — ています' negative: the state of not-having-done-it-yet"]], "hl": "まだ", "wr": [{"t": "The classic overreach: まだ食べませんでした. ませんでした reports that eating simply didn't happen — closed, historical. Not-yet-ness is a present state, and it needs ていません.", "jp": "まだ食べていません。", "en": "Correct — the not-yet state, still open.", "hl": "食べていません"}], "drill": {"items": [{"q": "___食べていません。", "en": "I haven't eaten yet.", "a": ["まだ"], "opts": ["まだ", "もう", "とても", "だけ"], "why": "Open door → まだ."}, {"q": "レポートは___書いていません。", "en": "The report isn't written yet.", "a": ["まだ"], "opts": ["まだ", "もう", "ぐらい", "から"], "why": "Still pending → まだ + ていません."}, {"q": "まだ食べて___。", "en": "…haven't eaten yet — close the pattern.", "a": ["いません"], "opts": ["いません", "いました", "います", "ありません"], "why": "まだ pairs with ています' negative: ていません."}, {"q": "___昼ごはんを食べました。", "en": "I ALREADY ate lunch.", "a": ["もう"], "opts": ["もう", "まだ", "とても", "しか"], "why": "Closed door → もう. まだ食べました is the miswiring this drill exists for."}, {"q": "読む → その本はまだ___。", "en": "\"I haven't read that book yet.\" Finish it.", "a": ["読んでいません", "よんでいません"], "why": "まだ + 読んで + いません — state still open."}]}},
  "sb-future": {"drill": {"note": "Japanese has no future tense — and needs none. The non-past form plus a time word covers tomorrow as easily as every day.", "items": [{"q": "明日、映画を___。", "en": "I WILL watch a movie tomorrow.", "a": ["見ます"], "opts": ["見ます", "見ました", "見ています", "見た"], "why": "Non-past 見ます covers the future — 明日 does the time work."}, {"q": "毎日コーヒーを___。", "en": "I drink coffee every day. (habit)", "a": ["飲みます"], "opts": ["飲みます", "飲みました", "飲んだ", "飲みません"], "why": "The same non-past covers habits — context decides."}, {"q": "来週、日本へ___。", "en": "I'm going to Japan next week.", "a": ["行きます"], "opts": ["行きます", "行きました", "行っています", "行った"], "why": "Future plan → plain non-past + the time word."}, {"q": "Japanese marks the future with ___.", "a": ["nothing — the non-past form covers it"], "opts": ["nothing — the non-past form covers it", "a special future ending", "でしょう, always"], "why": "There is no future conjugation to learn. The time word carries the when."}, {"q": "明日、友達に___。(会う)", "en": "I'll meet a friend tomorrow.", "a": ["会います", "あいます"], "why": "会う → 会います — non-past, future by context."}]}},
  "sb-register": {"drill": {"note": "Same sentence, different listener. The grammar is identical — the ending is the outfit it wears.", "items": [{"q": "To your boss: 明日は___。", "en": "I'll be off tomorrow.", "a": ["休みます"], "opts": ["休みます", "休む", "休むよ"], "why": "Upward and polite → ます."}, {"q": "To a close friend: 明日、___よ。", "en": "Taking tomorrow off!", "a": ["休む"], "opts": ["休む", "休みます", "休みました"], "why": "Among friends the plain form is the default; 休みました would put it in the past."}, {"q": "First meeting, introducing yourself: 私は田中___。", "en": "I'm Tanaka.", "a": ["です"], "opts": ["です", "だ", "だよ"], "why": "New people get polite forms until the relationship says otherwise."}, {"q": "One sentence should hold ___ register.", "a": ["one — don't drift mid-sentence"], "opts": ["one — don't drift mid-sentence", "both — variety is natural", "plain first half, polite second half"], "why": "Register drift inside a sentence is the tell the graders flag most."}, {"q": "Textbook-polite with close friends feels ___.", "a": ["distant"], "opts": ["distant", "rude", "perfect"], "why": "Not wrong — but ます with old friends keeps them at arm's length. Registers are social distances."}]}},
  "sb-nounmod": {"drill": {"note": "Japanese has no \"who/that/which.\" The describing clause parks BEFORE its noun, verb in plain form — however polite the sentence ends.", "items": [{"q": "___人は先生です。", "en": "The person who came yesterday is a teacher.", "a": ["昨日来た"], "opts": ["昨日来た", "昨日来ました", "来たの昨日"], "why": "Clause before noun, plain form inside: 昨日来た人."}, {"q": "母が___料理が好きです。", "en": "I like the food my mother makes.", "a": ["作った"], "opts": ["作った", "作りました", "作るの"], "why": "Inside the clause the verb stays plain — です carries politeness at the end."}, {"q": "東京に___友達がいます。", "en": "I have a friend who lives in Tokyo.", "a": ["住んでいる"], "opts": ["住んでいる", "住んでいます", "住むの"], "why": "The state form, plain, inside the clause: 住んでいる友達."}, {"q": "昨日___本は面白かったです。", "en": "The book I bought yesterday was really good.", "a": ["買った"], "opts": ["買った", "買いました", "買うの"], "why": "買った本 — plain past inside the describing clause."}, {"q": "The describing clause goes ___ its noun.", "a": ["before"], "opts": ["before", "after", "either side"], "why": "Always before — the mirror image of English relative clauses."}]}},
  "tekudasai": {"seg": [["ちょっと", "\"a moment\" — the softener that starts half of all requests"], ["待って", "\"wait\" — the て-form Step 4 built; requests ride on it"], ["ください。", "THE POINT — attach to a て-form: \"please do (it)\"", 1]], "hl": "話してください", "note": "Any verb, same machine: て-form + ください. The politeness of the request is the て-form's passenger.", "wr": [{"t": "The answer side is part of the pattern: いいですよ and どうぞ are yes — and a hesitant ちょっと… usually IS the answer, a no wearing softness.", "jp": null}], "drill": {"pool": true, "note": "Verb on the left — build the request. Every item is て-form + ください, so this is the て-pool paying off again.", "items": [{"q": "待つ → ちょっと___。", "en": "Please wait a moment.", "a": ["待ってください", "まってください"], "why": "待って + ください."}, {"q": "話す → ゆっくり___。", "en": "Please speak slowly.", "a": ["話してください", "はなしてください"], "why": "話して + ください."}, {"q": "書く → ここに名前を___。", "en": "Please write your name here.", "a": ["書いてください", "かいてください"], "why": "書いて + ください."}, {"q": "来る → 明日、家に___。", "en": "Please come to my place tomorrow.", "a": ["来てください", "きてください"], "why": "来て + ください."}, {"q": "見る → これを___。", "en": "Please look at this.", "a": ["見てください", "みてください"], "why": "見て + ください."}, {"q": "読む → この本を___。", "en": "Please read this book.", "a": ["読んでください", "よんでください"], "why": "読んで + ください."}, {"q": "聞く → よく___。", "en": "Please listen carefully.", "a": ["聞いてください", "きいてください"], "why": "聞いて + ください."}, {"q": "する → 宿題を___。", "en": "Please do the homework.", "a": ["してください"], "why": "して + ください."}]}},
  "naidekudasai": {"seg": [["ここ", "here"], ["で", "place of the action"], ["写真", "photos"], ["を", "object marker"], ["撮らないでください。", "THE POINT — plain negative + でください: \"please don't\"", 1]], "hl": "心配しないでください", "note": "The negative request runs on the plain ない form from Step 4 — not the て-form. Two different rails; mixing them is the common slip.", "wr": [{"t": "ないでください asks someone to refrain; てはいけません (two lessons on) forbids outright. The first is a request, the second a rule.", "jp": null}], "drill": {"pool": true, "note": "Verb on the left — build the \"please don't.\" Plain ない form + でください every time.", "items": [{"q": "撮る → ここで写真を___。", "en": "Please don't take photos here.", "a": ["撮らないでください", "とらないでください"], "why": "撮らない + でください."}, {"q": "心配する → ___。", "en": "Please don't worry.", "a": ["心配しないでください", "しんぱいしないでください"], "why": "する → しない + でください."}, {"q": "忘れる → ___ね。", "en": "Please don't forget, OK?", "a": ["忘れないでください", "わすれないでください"], "why": "忘れない + でください — ね softens it further."}, {"q": "吸う → ここでたばこを___。", "en": "Please don't smoke here.", "a": ["吸わないでください", "すわないでください"], "why": "う-verb: う → わ + ない, then でください."}, {"q": "開ける → 窓を___。", "en": "Please don't open the window.", "a": ["開けないでください", "あけないでください"], "why": "開けない + でください."}, {"q": "入る → この部屋に___。", "en": "Please don't go into this room.", "a": ["入らないでください", "はいらないでください"], "why": "入る is an う-verb fake-out too: 入らない."}, {"q": "使う → この机を___。", "en": "Please don't use this desk.", "a": ["使わないでください", "つかわないでください"], "why": "使わない + でください."}]}},
  "temoii": {"seg": [["ここ", "here"], ["に", "location"], ["座って", "\"sit\" — て-form again"], ["もいいですか。", "THE POINT — ても + いい: \"is it OK even if I…?\" — the permission ask", 1]], "hl": "帰ってもいい", "note": "The answer reuses the same shape: 帰ってもいいですよ — \"you may go home.\" Ask and permission are one pattern.", "wr": [{"t": "Reading the answer is half the skill: どうぞ is yes. あ、ちょっと… is a no wearing softness — pressing past it makes things worse in both directions.", "jp": null}], "drill": {"items": [{"q": "座る → ここに___か。", "en": "May I sit here?", "a": ["座ってもいいです", "すわってもいいです"], "why": "座って + もいいですか."}, {"q": "撮る → 写真を___か。", "en": "May I take a photo?", "a": ["撮ってもいいです", "とってもいいです"], "why": "撮って + もいいですか."}, {"q": "入って___ですか。", "en": "May I come in?", "a": ["もいい"], "opts": ["もいい", "はいけません", "ください", "もだめ"], "why": "Permission ask → てもいいですか."}, {"q": "帰る → もう___か。", "en": "May I go home now?", "a": ["帰ってもいいです", "かえってもいいです"], "why": "帰って + もいいですか."}, {"q": "写真を撮ってもいいですか。— ___", "en": "A friendly yes.", "a": ["どうぞ"], "opts": ["どうぞ", "ちょっと…", "だめです"], "why": "どうぞ hands permission over warmly."}, {"q": "入ってもいいですか。— あ、ちょっと… means ___.", "a": ["no, said softly"], "opts": ["no, said softly", "yes, come in", "wait exactly one moment"], "why": "Hesitation IS the answer. The refusal lives in the trailing-off."}]}},
  "tewaikemasen": {"seg": [["ここ", "here"], ["で", "place of the action"], ["たばこ", "tobacco / cigarettes"], ["を", "object marker"], ["吸って", "\"smoke\" — て-form"], ["はいけません。", "THE POINT — ては + いけません: \"must not\" — a rule, not a request", 1]], "hl": "寝てはいけません", "note": "Same rail: て-form + はいけません. The は inside is the topic particle, read wa.", "wr": [{"t": "This is the strong, signage-and-rules form. Softer real-life refusals usually reach for ちょっと… or ないでください — save てはいけません for actual rules.", "jp": null}], "drill": {"items": [{"q": "使う → この部屋を___。", "en": "You must not use this room.", "a": ["使ってはいけません", "つかってはいけません"], "why": "使って + はいけません."}, {"q": "寝る → 授業中に___。", "en": "No sleeping in class.", "a": ["寝てはいけません", "ねてはいけません"], "why": "寝て + はいけません."}, {"q": "ここで写真を撮って___。", "en": "Taking photos here is not allowed.", "a": ["はいけません"], "opts": ["はいけません", "もいいです", "ください", "いません"], "why": "Prohibition → てはいけません."}, {"q": "吸う → ここでたばこを___。", "en": "Smoking here is forbidden.", "a": ["吸ってはいけません", "すってはいけません"], "why": "吸って + はいけません."}, {"q": "ここに座って___か。", "en": "MAY I sit here? (asking, not forbidding)", "a": ["もいいです"], "opts": ["もいいです", "はいけません", "ないでください", "います"], "why": "The ask is てもいいですか — the two patterns share the て but not the job."}]}},
  "nakereba": {"seg": [["毎日", "every day"], ["薬", "medicine"], ["を", "object marker"], ["飲まなければなりません。", "THE POINT — ない-form minus い + ければなりません: \"must / have to\"", 1]], "hl": "起きなければなりません", "note": "Long, but regular: get the ない form, drop い, add ければなりません. Casual speech clips it hard — that's the cc lesson nearby.", "wr": [{"t": "The double negative is doing the work: \"if I don't drink it, it won't do.\" Japanese states obligation by ruling out NOT doing — there is no direct \"must\" verb.", "jp": null}], "drill": {"pool": true, "note": "Build the obligation: ない-form → なければなりません. The pool has more verbs than one round shows.", "items": [{"q": "飲む → 毎日薬を___。", "en": "I have to take medicine every day.", "a": ["飲まなければなりません", "のまなければなりません"], "why": "飲まない → 飲まなければなりません."}, {"q": "起きる → 明日早く___。", "en": "I have to get up early tomorrow.", "a": ["起きなければなりません", "おきなければなりません"], "why": "起きない → 起きなければなりません."}, {"q": "帰る → もう___。", "en": "I have to head home now.", "a": ["帰らなければなりません", "かえらなければなりません"], "why": "帰らない → 帰らなければなりません."}, {"q": "行く → 学校へ___。", "en": "I have to go to school.", "a": ["行かなければなりません", "いかなければなりません"], "why": "行かない → 行かなければなりません."}, {"q": "書く → レポートを___。", "en": "I have to write the report.", "a": ["書かなければなりません", "かかなければなりません"], "why": "書かない → 書かなければなりません."}, {"q": "する → 宿題を___。", "en": "I have to do the homework.", "a": ["しなければなりません"], "why": "しない → しなければなりません."}]}},
  "nakutemoii": {"seg": [["明日", "tomorrow — bare"], ["は", "topic marker"], ["来なくてもいいです。", "THE POINT — なくて + もいい: \"you don't have to\" — released, not forbidden", 1]], "hl": "急がなくてもいいです", "note": "Reassurance is this pattern's day job — \"no need to hurry\" is kindness in grammar form.", "wr": [{"t": "Don't-have-to and must-not both FEEL like negatives of must in English. They are different sentences here: 来なくてもいいです releases; 来てはいけません forbids. The skill lesson next drills the triangle.", "jp": null}], "drill": {"items": [{"q": "来る → 明日は___。", "en": "You don't have to come tomorrow.", "a": ["来なくてもいいです", "こなくてもいいです"], "why": "来ない → 来なくて + もいいです."}, {"q": "急ぐ → ___よ。", "en": "No need to hurry.", "a": ["急がなくてもいいです", "いそがなくてもいいです"], "why": "急がない → 急がなくてもいいです."}, {"q": "明日も来なければなりませんか。— いいえ、___。", "en": "Do I have to come tomorrow too? — No, you don't.", "a": ["来なくてもいいですよ"], "opts": ["来なくてもいいですよ", "来てはいけませんよ", "来ないでくださいよ"], "why": "Released from the obligation — not forbidden, not asked to refrain."}, {"q": "書く → 名前は___。", "en": "You don't have to write your name.", "a": ["書かなくてもいいです", "かかなくてもいいです"], "why": "書かない → 書かなくてもいいです."}, {"q": "この薬は毎日___。", "en": "You don't have to take this one every day.", "a": ["飲まなくてもいいです"], "opts": ["飲まなくてもいいです", "飲んではいけません", "飲まないでください", "飲みません"], "why": "Permission NOT to — なくてもいいです."}]}},
  "sb-must": {"drill": {"note": "The triangle: must (なければなりません), must not (てはいけません), don't have to (なくてもいいです). English wiring makes the last two feel alike — they never are.", "items": [{"q": "ここでたばこを___。", "en": "Smoking here is FORBIDDEN.", "a": ["吸ってはいけません"], "opts": ["吸ってはいけません", "吸わなくてもいいです", "吸わなければなりません"], "why": "A rule against → てはいけません."}, {"q": "明日は___。", "en": "You DON'T HAVE TO come tomorrow.", "a": ["来なくてもいいです"], "opts": ["来なくてもいいです", "来てはいけません", "来なければなりません"], "why": "Released → なくてもいいです. 来てはいけません would bar the door."}, {"q": "毎日薬を___。", "en": "You MUST take it every day.", "a": ["飲まなければなりません"], "opts": ["飲まなければなりません", "飲んではいけません", "飲まなくてもいいです"], "why": "Obligation → なければなりません."}, {"q": "この部屋を___。", "en": "Using this room is not allowed.", "a": ["使ってはいけません"], "opts": ["使ってはいけません", "使わなくてもいいです", "使わなければなりません"], "why": "Prohibition → てはいけません."}, {"q": "レポートは今日___。", "en": "The report doesn't have to be today.", "a": ["書かなくてもいいです"], "opts": ["書かなくてもいいです", "書いてはいけません", "書かなければなりません"], "why": "No obligation today → なくてもいいです."}, {"q": "学校へ___。", "en": "I have to go.", "a": ["行かなければなりません"], "opts": ["行かなければなりません", "行ってはいけません", "行かなくてもいいです"], "why": "Must → なければなりません."}]}},
  "mashou": {"seg": [["一緒に", "\"together\" — the word that loves this form"], ["帰りましょう。", "THE POINT — ます → ましょう: \"let's\" — proposing a shared action", 1]], "hl": "食べましょう", "wr": [{"t": "ましょう assumes the decision is basically made. For a genuine invitation that leaves room to decline, ませんか — two lessons on — is the polite opener.", "jp": null}], "drill": {"pool": true, "note": "ます form → ましょう. Same machine every time; the pool varies the verbs.", "items": [{"q": "食べる → 昼ごはんを___。", "en": "Let's eat lunch.", "a": ["食べましょう", "たべましょう"], "why": "食べます → 食べましょう."}, {"q": "行く → そろそろ___。", "en": "Let's get going.", "a": ["行きましょう", "いきましょう"], "why": "行きます → 行きましょう."}, {"q": "帰る → 一緒に___。", "en": "Let's head home together.", "a": ["帰りましょう", "かえりましょう"], "why": "帰ります → 帰りましょう."}, {"q": "見る → 映画を___。", "en": "Let's watch a movie.", "a": ["見ましょう", "みましょう"], "why": "見ます → 見ましょう."}, {"q": "飲む → お茶を___。", "en": "Let's have some tea.", "a": ["飲みましょう", "のみましょう"], "why": "飲みます → 飲みましょう."}, {"q": "する → 一緒に勉強___。", "en": "Let's study together.", "a": ["しましょう"], "why": "します → しましょう."}]}},
  "mashouka": {"seg": [["手伝い", "\"help\" — the verb stem"], ["ましょうか。", "THE POINT — ましょう + か: \"shall I?\" — offering to do it for them", 1]], "hl": "開けましょうか", "note": "The offer aims at THEIR comfort — shall I open the window (for you)? か turns let's into shall-I.", "drill": {"items": [{"q": "開ける → 窓を___か。", "en": "Shall I open the window?", "a": ["開けましょう", "あけましょう"], "why": "開けます → 開けましょう + か."}, {"q": "持つ → 荷物を___か。", "en": "Shall I carry your bag?", "a": ["持ちましょう", "もちましょう"], "why": "持ちます → 持ちましょう + か."}, {"q": "手伝いましょうか。— すみません、___。", "en": "Accept the offer.", "a": ["お願いします"], "opts": ["お願いします", "どういたしまして", "ちょっと…"], "why": "お願いします accepts an offer with thanks built in."}, {"q": "電気をつけ___か。", "en": "Shall I turn on the lights?", "a": ["ましょう"], "opts": ["ましょう", "ません", "ました", "ます"], "why": "Offering → ましょうか."}, {"q": "閉める → ドアを___か。", "en": "Shall I close the door?", "a": ["閉めましょう", "しめましょう"], "why": "閉めます → 閉めましょう + か."}]}},
  "masenka": {"seg": [["一緒に", "\"together\""], ["映画", "a movie"], ["を", "object marker"], ["見ませんか。", "THE POINT — ません + か: \"won't you…?\" — the invitation that leaves room to say no", 1]], "hl": "飲みませんか", "wr": [{"t": "Negative on purpose: \"won't you\" presses less than \"will you.\" Answers matter too — いいですね！ accepts; ちょっと… declines softly, and the culture stop right after this is about exactly that.", "jp": null}], "drill": {"items": [{"q": "飲む → お茶を___。", "en": "Won't you have some tea with me?", "a": ["飲みませんか", "のみませんか"], "why": "飲みません + か — the soft invitation."}, {"q": "見る → 一緒に映画を___。", "en": "Want to see a movie together?", "a": ["見ませんか", "みませんか"], "why": "見ません + か."}, {"q": "食べる → 今度一緒に___。", "en": "Shall we grab a meal sometime?", "a": ["食べませんか", "たべませんか"], "why": "食べません + か."}, {"q": "一緒に食べませんか。— ___！", "en": "Accept warmly.", "a": ["いいですね"], "opts": ["いいですね", "はいけません", "どういたしまして"], "why": "いいですね — \"sounds great.\""}, {"q": "映画を___。", "en": "LET'S watch — you've both already decided.", "a": ["見ましょう"], "opts": ["見ましょう", "見ませんか", "見ますか"], "why": "Decision made → ましょう. ませんか opens a door instead."}]}},
  "tai": {"seg": [["日本", "Japan"], ["へ", "destination marker"], ["行きたいです。", "THE POINT — verb stem + たい: what YOU want to do; it conjugates like an い-adjective", 1]], "hl": "飲みたいです", "note": "The wanted thing often takes が with たい — 水が飲みたい. Both が and を are heard; が leans harder on the wanting.", "wr": [{"t": "たい is for your OWN wants. Announcing someone else's inner state — 彼は行きたいです — overreaches what you can know; Japanese marks other minds differently (Stage 2 has the machinery).", "jp": null}], "drill": {"pool": true, "note": "Stem + たい — the want-to form. Conjugate away; the pool rotates the verbs.", "items": [{"q": "行く → 日本へ___です。", "en": "I want to go to Japan.", "a": ["行きたい", "いきたい"], "why": "行き + たい."}, {"q": "飲む → 水が___です。", "en": "I want to drink water.", "a": ["飲みたい", "のみたい"], "why": "飲み + たい."}, {"q": "食べる → すしが___です。", "en": "I want to eat sushi.", "a": ["食べたい", "たべたい"], "why": "食べ + たい."}, {"q": "見る → その映画が___です。", "en": "I want to see that movie.", "a": ["見たい", "みたい"], "why": "見 + たい."}, {"q": "買う → 新しい車が___です。", "en": "I want to buy a new car.", "a": ["買いたい", "かいたい"], "why": "買い + たい."}, {"q": "会う → 友達に___です。", "en": "I want to see my friend.", "a": ["会いたい", "あいたい"], "why": "会い + たい."}, {"q": "する → 日本で何が___ですか。", "en": "What do you want to do in Japan?", "a": ["したい"], "why": "し + たい."}]}},
  "hoshii": {"seg": [["新しい", "new — い-adjective doing its normal job"], ["かばん", "bag — the wanted thing"], ["が", "ほしい demands が, never を"], ["ほしいです。", "THE POINT — \"want (a thing)\": an い-adjective aimed at nouns", 1]], "hl": "ほしい", "wr": [{"t": "ほしい wants THINGS; たい wants ACTIONS. A new bag → ほしい; to buy the bag → 買いたい. English \"want\" covers both, which is why the split needs deliberate reps.", "jp": null}], "drill": {"items": [{"q": "新しいかばん___ほしいです。", "en": "I want a new bag.", "a": ["が"], "opts": ["が", "を", "は", "に"], "why": "ほしい demands が."}, {"q": "時間___ほしいです。", "en": "I want time.", "a": ["が"], "opts": ["が", "を", "は", "で"], "why": "Still ほしい, still が."}, {"q": "水が___。", "en": "I want water — the thing itself.", "a": ["ほしいです"], "opts": ["ほしいです", "飲みたいです", "ほしいます"], "why": "A thing wanted → ほしい. (飲みたい would want the act of drinking.)"}, {"q": "すしが___。", "en": "I want to EAT sushi — the action.", "a": ["食べたいです"], "opts": ["食べたいです", "ほしいです", "食べほしいです"], "why": "An action wanted → たい. 食べほしい doesn't exist."}, {"q": "誕生日に何___ほしいですか。", "en": "What do you want for your birthday?", "a": ["が"], "opts": ["が", "を", "は", "の"], "why": "Question word or not, ほしい keeps が."}]}},
  "tsumori": {"seg": [["夏", "summer"], ["に", "time marker — seasons count as calendar"], ["国", "home country"], ["へ", "destination"], ["帰る", "\"return\" — DICTIONARY form; つもり insists on plain"], ["つもりです。", "THE POINT — plain verb + つもり: a formed intention", 1]], "hl": "買うつもり", "wr": [{"t": "つもり follows the PLAIN form: 帰るつもり, never 帰りますつもり. The politeness waits at the very end, on です — the same division of labor as noun modification.", "jp": null}], "drill": {"items": [{"q": "車を___つもりです。", "en": "I intend to buy a car.", "a": ["買う"], "opts": ["買う", "買います", "買った", "買い"], "why": "Plain form before つもり."}, {"q": "夏に国へ___つもりです。", "en": "I plan to go home in summer.", "a": ["帰る"], "opts": ["帰る", "帰ります", "帰って", "帰り"], "why": "帰る stays plain; です politens the whole thing."}, {"q": "行く → 来週、東京へ___です。", "en": "I intend to go next week.", "a": ["行くつもり", "いくつもり"], "why": "行く + つもり + です."}, {"q": "勉強する → 毎日___です。", "en": "I intend to study every day.", "a": ["勉強するつもり", "べんきょうするつもり"], "why": "する stays plain before つもり."}, {"q": "夏休みは何を___つもりですか。", "en": "What do you plan to do over summer break?", "a": ["する"], "opts": ["する", "します", "して", "し"], "why": "Plain する — even in a polite question."}]}},
  "niiku": {"seg": [["デパート", "the department store — the destination"], ["へ", "destination marker — still its own job"], ["買い物", "shopping — the purpose"], ["に", "THE POINT — links the purpose to the movement: going TO DO", 1], ["行きます。", "\"go\""]], "hl": "会いに", "note": "A verb works too: its stem + に — 会い comes from 会います, ます dropped.", "wr": [{"t": "The purpose slot takes a noun (買い物) or a verb STEM (会い) — never a whole clause. \"To meet\" is 会いに, not 会うに and not 会ってに.", "jp": null}], "drill": {"items": [{"q": "デパートへ買い物___行きます。", "en": "Off to the department store to shop.", "a": ["に"], "opts": ["に", "を", "で", "と"], "why": "Purpose + に + motion verb."}, {"q": "友達に___に行きました。", "en": "I went to meet a friend.", "a": ["会い"], "opts": ["会い", "会う", "会って", "会った"], "why": "The stem — 会います minus ます."}, {"q": "海へ___に行きます。", "en": "Going to the sea to swim.", "a": ["泳ぎ"], "opts": ["泳ぎ", "泳ぐ", "泳いで", "泳いだ"], "why": "泳ぎます → stem 泳ぎ."}, {"q": "公園へ___に行きましょう。", "en": "Let's go to the park to play.", "a": ["遊び"], "opts": ["遊び", "遊ぶ", "遊んで", "遊んだ"], "why": "遊びます → stem 遊び."}, {"q": "見る → 映画を___行きます。", "en": "Going (out) to see a movie.", "a": ["見に", "みに"], "why": "Stem 見 + に."}]}},
  "tekara": {"seg": [["手", "hands"], ["を", "object marker"], ["洗ってから", "THE POINT — て-form + から: \"after doing, then…\" — first action finished before the second starts", 1], ["食べます。", "\"eat\" — the follow-on action"]], "hl": "終わってから", "wr": [{"t": "This から glues to a て-form. The reason-から (Step 11) glues to a whole finished clause — same kana, different joint, and the joint tells you which one you're hearing.", "jp": null}], "drill": {"items": [{"q": "洗う → 手を___食べます。", "en": "Wash up, then eat.", "a": ["洗ってから", "あらってから"], "why": "洗って + から — sequence locked in."}, {"q": "終わる → 仕事が___、飲みに行きます。", "en": "After work ends, we're going drinking.", "a": ["終わってから", "おわってから"], "why": "終わって + から."}, {"q": "宿題をして___、テレビを見ます。", "en": "Homework first, TV after.", "a": ["から"], "opts": ["から", "まで", "とき", "など"], "why": "て-form + から = after doing."}, {"q": "食べる → ごはんを___、散歩します。", "en": "Eat, then take a walk.", "a": ["食べてから", "たべてから"], "why": "食べて + から."}, {"q": "手を洗ってから食べます。— which happened first? ___", "a": ["washing"], "opts": ["washing", "eating", "both at once"], "why": "てから fixes the order: wash first, always."}]}},
  "atode": {"seg": [["ごはん", "the meal"], ["を", "object marker"], ["食べた", "\"ate\" — plain PAST; あとで insists on it"], ["あとで", "THE POINT — \"after\": clause in plain past + あとで", 1], ["散歩します。", "\"take a walk\""]], "hl": "のあとで", "note": "Nouns join with の: 授業のあとで. Verbs join in plain past: 食べたあとで. Two doors into the same pattern.", "wr": [{"t": "The verb before あとで is ALWAYS plain past — even when the whole sentence is about the future: 食べたあとで散歩します, \"after I('ll have) eaten, I'll walk.\" The tense of the sentence lives at its end.", "jp": null}], "drill": {"items": [{"q": "ごはんを___あとで散歩します。", "en": "I'll walk after eating.", "a": ["食べた"], "opts": ["食べた", "食べる", "食べて", "食べます"], "why": "あとで takes plain past — even about the future."}, {"q": "授業___あとで図書館へ行きます。", "en": "After class, the library.", "a": ["の"], "opts": ["の", "を", "で", "た"], "why": "A noun joins あとで with の."}, {"q": "仕事___あとで、飲みに行きませんか。", "en": "Drinks after work?", "a": ["の"], "opts": ["の", "を", "が", "に"], "why": "仕事 is a noun → のあとで."}, {"q": "映画を___あとで、昼ごはんを食べました。", "en": "After seeing the movie, we had lunch.", "a": ["見た"], "opts": ["見た", "見る", "見て", "見ます"], "why": "Plain past 見た before あとで."}, {"q": "食べたあとで vs 食べてから: ___", "a": ["both work — two ways to say \"after\""], "opts": ["both work — two ways to say \"after\"", "only 食べてから is correct", "only 食べたあとで is correct"], "why": "Interchangeable in most daily sentences; てから leans slightly harder on the sequence."}]}},
  "maeni": {"seg": [["寝る", "\"sleep\" — plain PRESENT, even inside past stories"], ["まえに", "THE POINT — \"before doing\": plain present + まえに", 1], ["歯", "teeth"], ["を", "object marker"], ["みがきます。", "\"brush\""]], "hl": "のまえに", "note": "Nouns join with の here too: 食事のまえに — the mirror of のあとで.", "wr": [{"t": "The mirror rule to あとで: before-clauses take plain PRESENT even about the past. The sentence's tense lives at the end, never in the joint.", "jp": "日本に来る前に、日本語を勉強しました。", "en": "Before coming to Japan, I studied Japanese — 来る stays present.", "hl": "来る前に"}], "drill": {"items": [{"q": "___まえに歯をみがきます。", "en": "I brush my teeth before bed.", "a": ["寝る"], "opts": ["寝る", "寝た", "寝て", "寝ます"], "why": "まえに takes plain present — always."}, {"q": "食事___まえに手を洗います。", "en": "Wash hands before the meal.", "a": ["の"], "opts": ["の", "を", "で", "た"], "why": "Nouns join まえに with の."}, {"q": "日本に___まえに、日本語を勉強しました。", "en": "I studied before coming — the coming is done, but…", "a": ["来る"], "opts": ["来る", "来た", "来て", "来ます"], "why": "…来る stays present. The past lives in 勉強しました."}, {"q": "食べる → ___まえに手を洗ってください。", "en": "Please wash up before eating.", "a": ["食べる", "たべる"], "why": "Plain present + まえに."}, {"q": "The rule pair — あとで and まえに take plain ___.", "a": ["past / present"], "opts": ["past / present", "present / past", "past / past"], "why": "食べたあとで、食べるまえに — the joint's tense is fixed regardless of the sentence's."}]}},
  "nagara": {"seg": [["音楽", "music"], ["を", "object marker"], ["聞きながら", "THE POINT — verb stem + ながら: doing both at once; this one is the sidekick", 1], ["勉強します。", "\"study\" — the MAIN action, coming last"]], "hl": "歩きながら", "wr": [{"t": "The verb after ながら is the main one. 音楽を聞きながら勉強します is studying (with music on), not listening (while studying) — position assigns the priority.", "jp": null}], "drill": {"items": [{"q": "音楽を___ながら勉強します。", "en": "Studying with music on.", "a": ["聞き"], "opts": ["聞き", "聞く", "聞いて", "聞いた"], "why": "The stem — 聞きます minus ます — takes ながら."}, {"q": "___ながら話しましょう。", "en": "Let's talk as we walk.", "a": ["歩き"], "opts": ["歩き", "歩く", "歩いて", "歩いた"], "why": "歩きます → stem 歩き + ながら."}, {"q": "テレビを___ながらごはんを食べます。", "en": "Eating with the TV on.", "a": ["見"], "opts": ["見", "見る", "見て", "見た"], "why": "見ます → stem 見 (short, but a real stem)."}, {"q": "飲む → お茶を___本を読みます。", "en": "Reading over tea.", "a": ["飲みながら", "のみながら"], "why": "飲み + ながら; 読みます is the main act."}, {"q": "音楽を聞きながら勉強します — the main thing being done is ___.", "a": ["studying"], "opts": ["studying", "listening", "both equally"], "why": "The final verb is the headline; ながら marks the background."}]}},
  "taritari": {"seg": [["週末", "the weekend"], ["は", "topic marker"], ["本", "books"], ["を", "object marker"], ["読んだり", "THE POINT — plain past + り: \"things like reading…\" — a sampled list, not a sequence", 1], ["、", "a breath"], ["映画", "movies"], ["を", "object marker"], ["見たり", "the second sample — たり again"], ["します。", "closes the list: \"…and such, I do.\" This する carries the tense"]], "hl": "したり", "wr": [{"t": "たり is the plain past + り, and the sentence MUST close with する — that final します/しました carries tense for the whole list. Dropped closers are the most common たり error.", "jp": null}], "drill": {"items": [{"q": "本を___り、映画を見たりします。", "en": "Reading, watching movies, that kind of weekend.", "a": ["読んだ"], "opts": ["読んだ", "読むた", "読みた", "読んで"], "why": "たり rides the plain past: 読んだ + り."}, {"q": "映画を見たり、買い物___します。", "en": "Movies, shopping, and so on.", "a": ["したり"], "opts": ["したり", "したりを", "するり", "してり"], "why": "買い物する → した + り."}, {"q": "週末は読んだり見たり___。", "en": "Close the pattern — present tense.", "a": ["します"], "opts": ["します", "です", "ます", "だ"], "why": "The final する closes every たり list and holds the tense."}, {"q": "泳ぐ → 海で___り、遊んだりしました。", "en": "Swam, played around, and such.", "a": ["泳いだ", "およいだ"], "why": "泳ぐ → 泳いだ + り; しました makes the whole day past."}, {"q": "A たり list claims to be ___.", "a": ["samples from a longer day"], "opts": ["samples from a longer day", "the complete list", "a strict sequence"], "why": "たり means \"among other things\" — the や of activities."}]}},
  "kata": {"seg": [["漢字", "kanji"], ["の", "linking の"], ["読み方", "THE POINT — verb stem + 方: \"way of doing\" — the how-to, as a noun", 1], ["を", "object marker — it's a noun now, so it takes noun particles"], ["教えてください。", "\"please teach (me)\""]], "hl": "使い方", "wr": [{"t": "The result is a full NOUN — it takes の before it and が・を after it like any other noun: 漢字の読み方がわかりません.", "jp": null}], "drill": {"items": [{"q": "漢字の___方を教えてください。", "en": "Please teach me how to read this kanji.", "a": ["読み"], "opts": ["読み", "読む", "読んで", "読んだ"], "why": "Stem + 方: 読み方."}, {"q": "この機械の___方がわかりません。", "en": "I don't know how to use this machine.", "a": ["使い"], "opts": ["使い", "使う", "使って", "使った"], "why": "使います → stem 使い + 方."}, {"q": "書く → この漢字の___を教えてください。", "en": "How do you write this kanji?", "a": ["書き方", "かきかた"], "why": "書き + 方 — the way of writing."}, {"q": "作る → この料理の___がわかりません。", "en": "I don't know how to make this dish.", "a": ["作り方", "つくりかた"], "why": "作り + 方."}, {"q": "読み方 is a ___.", "a": ["noun"], "opts": ["noun", "verb", "adjective"], "why": "That's the point — the verb has become a thing you can teach, know, or look up."}]}},
  "toki": {"seg": [["ひまな", "\"free\" — な-adjective wearing its な before a noun"], ["とき、", "THE POINT — \"when\": the clause before it names the time", 1], ["音楽", "music"], ["を", "object marker"], ["聞きます。", "\"listen\""]], "hl": "来たとき", "note": "Verbs join too — and here in plain past: when I (had) come. The tense inside とき is where this lesson earns its keep.", "wr": [{"t": "Relative tense, the step's hardest idea: 行くとき = on the way, not yet arrived; 行ったとき = after arriving. Same trip, two different bags bought in two different cities.", "jp": "日本に行くとき、空港でかばんを買いました。", "en": "Bought on the way — at the airport on THIS side, before arrival.", "hl": "行くとき"}], "drill": {"items": [{"q": "日本に___とき、空港でかばんを買いました。", "en": "Bought BEFORE arriving — this side's airport.", "a": ["行く"], "opts": ["行く", "行った", "行って", "行きます"], "why": "Not yet arrived at that moment → 行くとき."}, {"q": "日本に___とき、京都でかばんを買いました。", "en": "Bought in Kyoto — already there.", "a": ["行った"], "opts": ["行った", "行く", "行って", "行きます"], "why": "Arrival complete → 行ったとき."}, {"q": "ひま___とき、音楽を聞きます。", "en": "When I'm free, I listen to music.", "a": ["な"], "opts": ["な", "の", "い", "だ"], "why": "な-adjective + とき keeps its な."}, {"q": "子ども___とき、東京に住んでいました。", "en": "When I was a child, I lived in Tokyo.", "a": ["の"], "opts": ["の", "な", "は", "が"], "why": "Nouns join とき with の."}, {"q": "来る → 日本に___とき、驚きました。", "en": "When I came (already here), I was amazed.", "a": ["来た", "きた"], "why": "The arriving was complete when the amazement hit → 来たとき."}]}},
  "deshou": {"seg": [["明日", "tomorrow — bare"], ["は", "topic marker"], ["晴れる", "\"clear up\" — plain form"], ["でしょう。", "THE POINT — \"probably\": です with the certainty dialed down", 1]], "hl": "でしょう", "note": "Negative guesses work the same way — plain ない form + でしょう.", "drill": {"items": [{"q": "明日は晴れる___。", "en": "Probably sunny tomorrow.", "a": ["でしょう"], "opts": ["でしょう", "です", "でした", "ですか"], "why": "A forecast — probable, not certain → でしょう."}, {"q": "彼は来ない___。", "en": "He probably won't come.", "a": ["でしょう"], "opts": ["でしょう", "です", "でした", "か"], "why": "Plain negative + でしょう."}, {"q": "\"Probably rain tomorrow\" is ___.", "a": ["明日は雨でしょう"], "opts": ["明日は雨でしょう", "明日は雨だでしょう", "明日は雨ですでしょう"], "why": "After nouns, でしょう attaches bare — no だ, no です."}, {"q": "行く → 田中さんは___でしょう。", "en": "Tanaka will probably go.", "a": ["行く", "いく"], "why": "Plain form + でしょう."}, {"q": "高い___。", "en": "Probably expensive.", "a": ["でしょう"], "opts": ["でしょう", "だでしょう", "ですでしょう", "でしたでしょう"], "why": "い-adjectives take でしょう directly: 高いでしょう."}]}},
  "arimasu": {"seg": [["机の上", "on the desk — landmark + の + position"], ["に", "location of existence"], ["本", "a book"], ["が", "what exists takes が"], ["あります。", "THE POINT — \"exists / there is\" for things; いる is its living twin", 1]], "hl": "います", "note": "Children breathe, so います. あります for what sits still, います for what could walk away.", "wr": [{"t": "English \"have\" is often just ある: 英語のメニューはありますか — \"DO you have an English menu?\" Existence covers possession more than you'd expect.", "jp": null}], "drill": {"items": [{"q": "机の上に本が___。", "en": "There's a book on the desk.", "a": ["あります"], "opts": ["あります", "います", "です", "します"], "why": "A thing → あります."}, {"q": "公園に子どもが___。", "en": "There are children in the park.", "a": ["います"], "opts": ["います", "あります", "です", "します"], "why": "Living beings → います."}, {"q": "いすの下に猫が___。", "en": "There's a cat under the chair.", "a": ["います"], "opts": ["います", "あります", "です", "でした"], "why": "The cat is alive (and judging you) → います."}, {"q": "時間が___か。", "en": "Do you have time?", "a": ["あります"], "opts": ["あります", "います", "します", "です"], "why": "Abstract things exist with ある — and that IS the Japanese \"have\" here."}, {"q": "お金が___。", "en": "I have money.", "a": ["あります"], "opts": ["あります", "います", "です", "ではありません"], "why": "Money exists in your possession → あります."}]}},
  "motteiru": {"seg": [["車", "a car"], ["を", "object marker"], ["持っています。", "THE POINT — \"holding\" as a state: the deliberate \"have\" for possessions", 1]], "hl": "持っています", "note": "Asked of pockets and bags — got a pen on you? — the same state verb.", "wr": [{"t": "ある-possession and 持っている overlap; 持っている leans toward the concrete and ownable. People are never held — family \"having\" is います: 兄がいます.", "jp": null}], "drill": {"items": [{"q": "車を___。", "en": "I own a car.", "a": ["持っています", "もっています"], "opts": ["持っています", "あります", "います", "持ちました"], "why": "A possession held as a state → 持っています."}, {"q": "ペン、___か。", "en": "Got a pen on you?", "a": ["持っています", "もっています"], "opts": ["持っています", "あります", "います", "持ちます"], "why": "Carryable, on your person → 持っています."}, {"q": "兄が___。", "en": "I have an older brother.", "a": ["います"], "opts": ["います", "持っています", "あります", "です"], "why": "People are never held — family takes います."}, {"q": "お金を___。", "en": "I've got money on me.", "a": ["持っています", "もっています"], "opts": ["持っています", "います", "でした", "持ちました"], "why": "Cash in the wallet → 持っています."}, {"q": "時間が___。", "en": "I have time.", "a": ["あります"], "opts": ["あります", "持っています", "います", "します"], "why": "Abstracts exist rather than being held → あります."}]}},
  "location": {"seg": [["銀行", "the bank — the thing being located"], ["は", "topic marker"], ["駅の前", "THE POINT — landmark + の + position word: \"the station's front\"", 1], ["に", "location of existence"], ["あります。", "\"is (located)\""]], "hl": "いすの下に", "note": "Same machine pointing down: the chair's underneath. Any position word slots in — 上・下・前・中・となり.", "wr": [{"t": "Landmark FIRST: 机の上 is \"the desk's top.\" English says \"on the desk\"; Japanese builds a place-noun and parks things in it with に.", "jp": null}], "drill": {"items": [{"q": "銀行は駅の___にあります。", "en": "The bank is in FRONT of the station.", "a": ["前"], "opts": ["前", "上", "下", "中"], "why": "In front → 前."}, {"q": "猫はいすの___にいます。", "en": "The cat is UNDER the chair.", "a": ["下"], "opts": ["下", "上", "前", "中"], "why": "Under → 下."}, {"q": "本は机の___にあります。", "en": "The book is ON the desk.", "a": ["上"], "opts": ["上", "下", "中", "前"], "why": "On top → 上."}, {"q": "犬は家の___にいます。", "en": "The dog is INSIDE the house.", "a": ["中"], "opts": ["中", "上", "下", "前"], "why": "Inside → 中."}, {"q": "\"On the desk\" is ___.", "a": ["机の上"], "opts": ["机の上", "上の机", "机上の"], "why": "Landmark first, position after, glued with の: 机の上."}]}},
  "sb-nide2": {"drill": {"note": "The Step 2 question — happening, or located? — survives even あります: an EVENT being held takes で.", "items": [{"q": "明日、学校___パーティーがあります。", "en": "There's a party at school tomorrow.", "a": ["で"], "opts": ["で", "に", "へ", "を"], "why": "An event being held → で, even with あります."}, {"q": "机の上___本があります。", "en": "There's a book on the desk.", "a": ["に"], "opts": ["に", "で", "へ", "を"], "why": "A thing located → に."}, {"q": "図書館___会議があります。", "en": "There's a meeting at the library.", "a": ["で"], "opts": ["で", "に", "へ", "が"], "why": "A meeting happens → で."}, {"q": "公園___犬がいます。", "en": "There's a dog in the park.", "a": ["に"], "opts": ["に", "で", "へ", "は"], "why": "Located, not happening → に."}, {"q": "The question that decides it: is it ___?", "a": ["happening, or located?"], "opts": ["happening, or located?", "big, or small?", "past, or present?"], "why": "Events take で; existence takes に — あります can sit on either side."}]}},
  "ageru": {"seg": [["友達", "my friend — the receiver"], ["に", "the receiver takes に"], ["本", "a book"], ["を", "object marker"], ["あげました。", "THE POINT — giving OUTWARD: I (or we) give to someone else", 1]], "hl": "くれました", "note": "The same event seen from the receiving end: they gave TO ME → くれる. Perspective picks the verb.", "wr": [{"t": "もらう is receiving — and its source takes に. Three verbs, one triangle: give-out (あげる), give-to-me (くれる), receive (もらう).", "jp": "先生に薬をもらいました。", "en": "I received medicine from the teacher — the source marked with に.", "hl": "もらいました"}], "drill": {"items": [{"q": "友達に本を___。", "en": "I gave my friend a book.", "a": ["あげました"], "opts": ["あげました", "くれました", "もらいました"], "why": "Outward from me → あげる."}, {"q": "友達が本を___。", "en": "My friend gave ME a book.", "a": ["くれました"], "opts": ["くれました", "あげました", "もらいました"], "why": "Inward to me → くれる."}, {"q": "先生に薬を___。", "en": "I received medicine from the teacher.", "a": ["もらいました"], "opts": ["もらいました", "あげました", "くれました"], "why": "I'm the receiver doing the verb → もらう."}, {"q": "妹にペンを___。", "en": "I gave my little sister a pen.", "a": ["あげました"], "opts": ["あげました", "くれました", "もらいました"], "why": "Me → someone else: あげる."}, {"q": "田中さんが水を___。", "en": "Tanaka handed me some water.", "a": ["くれました"], "opts": ["くれました", "あげました", "もらいました"], "why": "Someone else → me: くれる."}, {"q": "友達___本をもらいました。", "en": "I got a book from my friend.", "a": ["に"], "opts": ["に", "が", "を", "へ"], "why": "もらう's source takes に (から also works)."}]}},
  "iadj": {"seg": [["この店", "this shop"], ["は", "topic marker"], ["高くないです。", "THE POINT — い-adjectives conjugate THEMSELVES: 高い → 高くない; です is only polish", 1]], "hl": "寒かった", "note": "The past lives inside the adjective too: 寒い → 寒かった. です never carries the tense.", "wr": [{"t": "Four shapes to own: 高い・高くない・高かった・高くなかった. The two classic wrecks are 高いでした (adjective refusing でした) and 高いじゃない (noun-negative on an い-adjective).", "jp": null}], "drill": {"pool": true, "note": "Conjugate the adjective itself — です waits outside, doing nothing but politeness.", "items": [{"q": "この店は___です。", "en": "高い → NOT expensive.", "a": ["高くない", "たかくない"], "opts": ["高くない", "高いじゃない", "高くないだ", "高いくない"], "why": "い → くない. じゃない belongs to nouns."}, {"q": "昨日は___です。", "en": "寒い → WAS cold.", "a": ["寒かった", "さむかった"], "opts": ["寒かった", "寒いでした", "寒かったでした", "寒いだった"], "why": "い → かった. 寒いでした is the classic wreck."}, {"q": "映画は___です。", "en": "面白い → WAS interesting.", "a": ["面白かった", "おもしろかった"], "opts": ["面白かった", "面白いでした", "面白でした", "面白いかった"], "why": "面白い → 面白かった."}, {"q": "この本は___です。", "en": "安い → was NOT cheap.", "a": ["安くなかった", "やすくなかった"], "opts": ["安くなかった", "安くないでした", "安いじゃなかった", "安かったない"], "why": "Negative then past, both inside the adjective: くなかった."}, {"q": "暑い → 昨日は___です。", "en": "Yesterday WAS hot — type it.", "a": ["暑かった", "あつかった"], "why": "暑い → 暑かった."}, {"q": "忙しい → 今日は___です。", "en": "Today is NOT busy — type it.", "a": ["忙しくない", "いそがしくない"], "why": "忙しい → 忙しくない."}]}},
  "naadj": {"seg": [["静かな", "THE POINT — な-adjective wearing its な to hold a noun", 1], ["町", "town — the noun being held"], ["です。", "\"is\""]], "hl": "簡単じゃない", "note": "Negating like a noun — じゃない, the system Step 1 already gave you. な-adjectives are nouns at heart.", "wr": [{"t": "Which family a word belongs to must be learned with the word — きれい ends in い and still isn't an い-adjective: きれいな人, きれいじゃない.", "jp": null}], "drill": {"items": [{"q": "___町です。", "en": "静か → a quiet town.", "a": ["静かな", "しずかな"], "opts": ["静かな", "静かい", "静かの", "静か"], "why": "Before a noun → な."}, {"q": "この問題は___です。", "en": "簡単 → NOT simple.", "a": ["簡単じゃない", "かんたんじゃない"], "opts": ["簡単じゃない", "簡単くない", "簡単ない", "簡単じゃい"], "why": "Noun-style negative: じゃない. くない belongs to the other family."}, {"q": "___人です。", "en": "きれい → a pretty person. Careful!", "a": ["きれいな"], "opts": ["きれいな", "きれいい", "きれいの", "きれい"], "why": "きれい is な-family despite the い: きれいな人."}, {"q": "昨日は___でした。", "en": "ひま → was free (nothing to do).", "a": ["ひま"], "opts": ["ひま", "ひまな", "ひまだ", "ひまの"], "why": "Before でした the な drops — it's behaving as a noun."}, {"q": "部屋は___じゃないです。", "en": "きれい → not clean.", "a": ["きれい"], "opts": ["きれい", "きれいな", "きれいい", "きれく"], "why": "Bare before じゃない — the な only appears when holding a noun."}]}},
  "kute": {"seg": [["この部屋", "this room"], ["は", "topic marker"], ["広くて", "THE POINT — い-adj → くて: chains qualities into one description", 1], ["明るいです。", "\"and bright\" — the chain's last link carries tense and politeness"]], "hl": "親切で", "note": "な-adjectives chain with で instead — the two families, again, each with its own connector.", "wr": [{"t": "The chain inherits its tense from the END: 安くて、おいしかったです makes both past. And くて joins allies — qualities pulling the same direction. Rivals get が (Step 11).", "jp": null}], "drill": {"items": [{"q": "この部屋は___明るいです。", "en": "広い → spacious and bright.", "a": ["広くて", "ひろくて"], "opts": ["広くて", "広いで", "広で", "広いくて"], "why": "い → くて."}, {"q": "彼は___優しいです。", "en": "親切 → kind and gentle.", "a": ["親切で", "しんせつで"], "opts": ["親切で", "親切くて", "親切て", "親切なで"], "why": "な-adjective → で."}, {"q": "この店は___、おいしいです。", "en": "安い → cheap and tasty.", "a": ["安くて", "やすくて"], "opts": ["安くて", "安いで", "安で", "安くで"], "why": "安い → 安くて."}, {"q": "新しい → この車は___、きれいです。", "en": "new and clean — type it.", "a": ["新しくて", "あたらしくて"], "why": "新しい → 新しくて."}, {"q": "静か → この町は___、いいです。", "en": "quiet and nice — type it.", "a": ["静かで", "しずかで"], "why": "な-family chains with で: 静かで."}]}},
  "narimasu": {"seg": [["天気", "the weather"], ["が", "subject marker"], ["よくなりました。", "THE POINT — became: いい → よく + なる. Change of state, and いい conjugates on its よ side", 1]], "hl": "になりました", "note": "Nouns and な-adjectives take に before なる: 医者になる — became a doctor.", "wr": [{"t": "い-adjectives drop い and add く (高くなる); nouns and な-adjectives take に (静かになる). いい is the irregular: よくなる, never いくなる.", "jp": "日本語が上手になりましたね。", "en": "Your Japanese has gotten good — 上手 is な-family, so に.", "hl": "上手になりました"}], "drill": {"pool": true, "note": "く or に, then なる. The fork is the whole game.", "items": [{"q": "天気が___なりました。", "en": "いい → got better.", "a": ["よく"], "opts": ["よく", "いく", "いいに", "よに"], "why": "いい conjugates as よ-: よくなる."}, {"q": "兄は医者___なりました。", "en": "Became a doctor.", "a": ["に"], "opts": ["に", "く", "で", "が"], "why": "A noun → に + なる."}, {"q": "日本語が上手___なりましたね。", "en": "Your Japanese got good!", "a": ["に"], "opts": ["に", "く", "が", "は"], "why": "上手 is な-family → に."}, {"q": "部屋が___なりました。", "en": "暖かい → got warm.", "a": ["暖かく", "あたたかく"], "opts": ["暖かく", "暖かに", "暖かいく", "暖かで"], "why": "い-adjective → く + なる."}, {"q": "寒い → 冬が来て、___なりました。", "en": "Winter came and it got cold — type it.", "a": ["寒く", "さむく"], "why": "寒い → 寒く + なる."}, {"q": "静か → 町が___なりました。", "en": "The town got quiet — type it.", "a": ["静かに", "しずかに"], "why": "な-family → 静かに + なる."}]}},
  "shimasu-change": {"seg": [["部屋", "the room"], ["を", "object — someone is acting on it"], ["暖かくしてください。", "THE POINT — the doer twin of なる: MAKE it warm — く/に + する", 1]], "hl": "静かにしました", "note": "Same く/に fork as なる — one rule feeding two verbs.", "wr": [{"t": "なる happens on its own; する is done by someone. 暖かくなりました — the room warmed up; 暖かくしました — somebody turned up the heat.", "jp": null}], "drill": {"items": [{"q": "部屋を暖かく___ください。", "en": "Please make the room warm.", "a": ["して"], "opts": ["して", "なって", "し", "なり"], "why": "Someone acts → する (here as してください)."}, {"q": "音を___しました。", "en": "静か → turned the sound down.", "a": ["静かに", "しずかに"], "opts": ["静かに", "静かく", "静かで", "静かの"], "why": "な-family → に + する."}, {"q": "少し静かに___ください。", "en": "Please quiet down a little.", "a": ["して"], "opts": ["して", "なって", "なり", "です"], "why": "A request to act → してください."}, {"q": "安い → もう少し___してください。", "en": "A little cheaper, please — type it.", "a": ["安く", "やすく"], "why": "い-adjective → く + する."}, {"q": "部屋が暖かく___。", "en": "The room GOT warm — by itself.", "a": ["なりました"], "opts": ["なりました", "しました", "です", "ました"], "why": "No agent in sight → なる."}]}},
  "nisuru": {"seg": [["私", "I"], ["は", "topic marker"], ["コーヒー", "coffee — the winning option"], ["にします。", "THE POINT — \"I'll go with…\": にする settles a choice", 1]], "hl": "にします", "note": "の from Step 3 makes \"the red one\"; にする picks it. The two smallest words in the shop, doing all the work.", "drill": {"items": [{"q": "私はコーヒー___します。", "en": "I'll have the coffee.", "a": ["に"], "opts": ["に", "を", "が", "で"], "why": "Settling on an option → にする."}, {"q": "何___しますか。", "en": "What'll you have?", "a": ["に"], "opts": ["に", "を", "が", "は"], "why": "Asking someone's pick → 何にしますか."}, {"q": "赤いの___します。", "en": "I'll take the red one.", "a": ["に"], "opts": ["に", "を", "が", "の"], "why": "の builds \"the red one\"; に settles it."}, {"q": "うどん → 私は___します。", "en": "I'll go with udon — type it.", "a": ["うどんに"], "why": "Choice + に + する."}, {"q": "にする is for ___.", "a": ["settling a choice"], "opts": ["settling a choice", "making something change", "being polite"], "why": "Menus, plans, colors — any moment a decision lands."}]}},
  "amari": {"seg": [["あまり", "THE POINT — \"not very\": あまり opens, and a NEGATIVE must close", 1], ["高くないです。", "\"isn't expensive\" — the negative that あまり promised"]], "hl": "あまり", "wr": [{"t": "あまり is a promise of a negative ending — あまり高いです breaks the contract mid-sentence. ぜんぜん (next) makes the same promise, harder.", "jp": null}], "drill": {"items": [{"q": "あまり___です。", "en": "高い → not very expensive.", "a": ["高くない", "たかくない"], "opts": ["高くない", "高い", "高かった", "高くて"], "why": "あまり opened; the negative closes."}, {"q": "あまりテレビを___。", "en": "I don't watch much TV.", "a": ["見ません"], "opts": ["見ません", "見ます", "見ました", "見ています"], "why": "あまり + negative verb."}, {"q": "スポーツは、あまり___。", "en": "Not really — not much sport.", "a": ["しません"], "opts": ["しません", "します", "しました", "したいです"], "why": "The promised negative: しません."}, {"q": "___高くないです。", "en": "Not VERY expensive — a partial no.", "a": ["あまり"], "opts": ["あまり", "とても", "ぜんぜん", "もう"], "why": "Partial → あまり. ぜんぜん would say not AT ALL; とても needs a positive."}, {"q": "あまり must end ___.", "a": ["negative"], "opts": ["negative", "positive", "either way"], "why": "The opening word writes a check only a negative can cash."}]}},
  "zenzen": {"seg": [["ぜんぜん", "THE POINT — \"not at all\": total zero, negative required", 1], ["わかりません。", "\"don't understand\" — the required negative"]], "hl": "ぜんぜん", "wr": [{"t": "Casual speech bends this: ぜんぜん大丈夫 — \"totally fine\" — is real and common among friends. In writing and polite speech, keep ぜんぜん negative.", "jp": null}], "drill": {"items": [{"q": "ぜんぜん___。", "en": "I don't understand AT ALL.", "a": ["わかりません"], "opts": ["わかりません", "わかります", "わかりました", "わかっています"], "why": "ぜんぜん + negative."}, {"q": "お金がぜんぜん___。", "en": "No money whatsoever.", "a": ["ありません"], "opts": ["ありません", "あります", "ありました", "います"], "why": "Zero → ぜんぜんありません."}, {"q": "___わかりません。", "en": "Understand NOTHING — total zero.", "a": ["ぜんぜん"], "opts": ["ぜんぜん", "あまり", "とても", "ちょっと"], "why": "Total → ぜんぜん."}, {"q": "___わかりません。", "en": "Don't REALLY understand — partial.", "a": ["あまり"], "opts": ["あまり", "ぜんぜん", "とても", "もう"], "why": "Partial → あまり. The two words split the negative scale."}, {"q": "In polite or written Japanese, ぜんぜん pairs with ___.", "a": ["negatives"], "opts": ["negatives", "positives", "questions"], "why": "The casual positive use exists — but the safe register keeps the contract."}]}},
  "totemo": {"seg": [["この映画", "this movie"], ["は", "topic marker"], ["とても", "THE POINT — \"very\": the plain intensifier for positive sentences", 1], ["面白いです。", "\"is interesting\""]], "hl": "ちょっと", "note": "The soft end of the dial — \"a bit.\" Also the polite understater: ちょっと高いです often means \"too expensive for me.\"", "wr": [{"t": "とても doesn't do negatives. For \"not very\" the language switches machinery: あまり + negative. The full dial: とても / ちょっと / あまり〜ない / ぜんぜん〜ない.", "jp": null}], "drill": {"items": [{"q": "この映画は___面白いです。", "en": "VERY interesting.", "a": ["とても"], "opts": ["とても", "あまり", "ぜんぜん", "しか"], "why": "Positive intensity → とても."}, {"q": "日本の夏は___暑いです。", "en": "Japanese summers are VERY hot.", "a": ["とても"], "opts": ["とても", "あまり", "ぜんぜん", "まだ"], "why": "Positive → とても."}, {"q": "___疲れました。", "en": "I'm a BIT tired.", "a": ["ちょっと"], "opts": ["ちょっと", "とても", "ぜんぜん", "あまり"], "why": "Soft touch → ちょっと."}, {"q": "この店は___高くないです。", "en": "Not VERY pricey.", "a": ["あまり"], "opts": ["あまり", "とても", "ちょっと", "もう"], "why": "Negative sentence → あまり takes over from とても."}, {"q": "とても belongs in ___ sentences.", "a": ["positive"], "opts": ["positive", "negative", "either"], "why": "For negatives the dial hands off to あまり and ぜんぜん."}]}},
  "hou": {"seg": [["電車", "the train — about to lose"], ["より", "marks the loser (Step 3's より)"], ["バス", "the bus — the winner"], ["のほうが", "THE POINT — のほう marks the WINNER of the comparison", 1], ["安いです。", "\"is cheap(er)\""]], "hl": "のほうが", "wr": [{"t": "どちらのほうが好きですか asks the choice; the answer keeps のほうが even when より drops away entirely: 猫のほうが好きです.", "jp": null}], "drill": {"items": [{"q": "電車よりバス___安いです。", "en": "The bus is cheaper than the train.", "a": ["のほうが"], "opts": ["のほうが", "より", "だけ", "がほう"], "why": "The winner wears のほうが."}, {"q": "夏より冬___好きです。", "en": "I like winter better than summer.", "a": ["のほうが"], "opts": ["のほうが", "より", "だけ", "を"], "why": "Winter wins → のほうが."}, {"q": "犬と猫と、___のほうが好きですか。", "en": "Dogs or cats — which do you prefer?", "a": ["どちら"], "opts": ["どちら", "何", "誰", "どこ"], "why": "Exactly two options → どちら."}, {"q": "— 猫___好きです。", "en": "Answering: cats win.", "a": ["のほうが"], "opts": ["のほうが", "より", "は", "を"], "why": "The answer keeps のほうが; より can vanish."}, {"q": "より marks the ___.", "a": ["loser"], "opts": ["loser", "winner", "both sides"], "why": "より = measured-against; のほうが = preferred."}]}},
  "ichiban": {"seg": [["果物", "fruit — the group"], ["のなかで", "\"within\" — sets the arena"], ["りんご", "apples"], ["が", "the winner takes が"], ["いちばん", "THE POINT — \"number one\": the superlative, with no change to the adjective", 1], ["好きです。", "\"liked (best)\""]], "hl": "いちばん", "wr": [{"t": "Two things compare with のほうが; three or more crown a winner with いちばん. Asking about the group uses 何・誰 + が + いちばん.", "jp": null}], "drill": {"items": [{"q": "果物のなかでりんごが___好きです。", "en": "Of all fruit, I like apples best.", "a": ["いちばん"], "opts": ["いちばん", "のほうが", "より", "とても"], "why": "A group of three-plus → いちばん."}, {"q": "クラスのなかで田中さんが___背が高いです。", "en": "Tanaka is the tallest in class.", "a": ["いちばん"], "opts": ["いちばん", "のほうが", "より", "まだ"], "why": "Group superlative → いちばん."}, {"q": "日本料理のなかで___がいちばん好きですか。", "en": "What Japanese food do you like best?", "a": ["何"], "opts": ["何", "どちら", "誰", "どこ"], "why": "Open group → 何. どちら is for exactly two."}, {"q": "果物___なかでりんごがいちばん好きです。", "en": "Within fruit…", "a": ["の"], "opts": ["の", "を", "は", "が"], "why": "The arena joins with の: 果物のなかで."}, {"q": "Two things compare with ___ (three or more crown a winner with いちばん).", "a": ["どちら+のほうが"], "opts": ["どちら+のほうが", "いちばん", "より+まで"], "why": "Pairwise → のほうが; crowd → いちばん."}]}},
  "suki": {"seg": [["音楽", "music — what English would call the object"], ["が", "THE POINT — 好き demands が: liking is a state, not an action", 1], ["好きです。", "\"is liked\" — a な-adjective, not a verb"]], "hl": "が", "note": "きらい — dislike — runs on the same rails: が, な-adjective, the whole system.", "wr": [{"t": "音楽を好きです is the single most predictable English-speaker error of this step. 好き describes a state, and states take が.", "jp": null}], "drill": {"items": [{"q": "音楽___好きです。", "en": "I like music.", "a": ["が"], "opts": ["が", "を", "は", "に"], "why": "好き demands が."}, {"q": "野菜___きらいです。", "en": "I dislike vegetables.", "a": ["が"], "opts": ["が", "を", "は", "も"], "why": "きらい follows the same rule."}, {"q": "犬___大好きです。", "en": "I LOVE dogs.", "a": ["が"], "opts": ["が", "を", "は", "に"], "why": "大好き intensifies; the が stays."}, {"q": "好き is a ___.", "a": ["な-adjective"], "opts": ["な-adjective", "verb", "particle"], "why": "That's WHY it takes が — it describes a state, not an act done to music."}, {"q": "日本の食べ物___好きですか。", "en": "Do you like Japanese food?", "a": ["が"], "opts": ["が", "を", "は", "も"], "why": "Question or statement, 好き keeps が."}]}},
  "jouzu": {"seg": [["妹", "my little sister — the person, as topic"], ["は", "topic marker"], ["ピアノ", "piano — the skill area"], ["が", "THE POINT — 上手・下手 point at the skill with が", 1], ["上手です。", "\"is good at\" — な-adjective"]], "hl": "が", "note": "下手 — bad at — same structure, humbler content.", "wr": [{"t": "上手 praises OTHERS. About your own strengths, 得意 is the natural word — and deflecting praise (いえいえ、まだまだです) is half the grammar of this lesson.", "jp": null}], "drill": {"items": [{"q": "妹はピアノ___上手です。", "en": "My sister is good at piano.", "a": ["が"], "opts": ["が", "を", "は", "に"], "why": "The skill area takes が."}, {"q": "私は歌___下手です。", "en": "I'm bad at singing.", "a": ["が"], "opts": ["が", "を", "は", "の"], "why": "下手 points with が too."}, {"q": "日本語が上手ですね。— ___", "en": "The expected response to praise.", "a": ["いえいえ、まだまだです"], "opts": ["いえいえ、まだまだです", "はい、上手です", "どういたしまして"], "why": "Deflection is the expected step in the dance — agreeing reads as boasting."}, {"q": "私は料理が___です。", "en": "Stating your own strong suit.", "a": ["得意"], "opts": ["得意", "上手", "下手"], "why": "上手 aimed at yourself sounds like self-praise; 得意 states a strength plainly."}, {"q": "彼はサッカー___上手です。", "en": "He's good at soccer.", "a": ["が"], "opts": ["が", "を", "は", "で"], "why": "Skill + が + 上手."}]}},
  "wakaru": {"seg": [["日本語", "Japanese — the thing that is clear"], ["が", "THE POINT — わかる takes が: understanding happens to you", 1], ["少し", "\"a little\""], ["わかります。", "\"is understandable (to me)\""]], "hl": "が", "wr": [{"t": "を…わかる is the same trap as を好き. It helps to read わかる as \"is clear (to me)\": 日本語がわかります — Japanese is clear to me.", "jp": null}], "drill": {"items": [{"q": "日本語___少しわかります。", "en": "I understand a little Japanese.", "a": ["が"], "opts": ["が", "を", "は", "に"], "why": "わかる demands が."}, {"q": "意味___わかりません。", "en": "I don't understand the meaning.", "a": ["が"], "opts": ["が", "を", "は", "も"], "why": "Negative or not, わかる keeps が."}, {"q": "この言葉の意味___わかりますか。", "en": "Do you understand this word?", "a": ["が"], "opts": ["が", "を", "は", "で"], "why": "Still が."}, {"q": "日本語___話せます。", "en": "I can speak Japanese — a preview.", "a": ["が"], "opts": ["が", "を", "は", "で"], "why": "The potential family (next lesson) inherits が from the same logic."}, {"q": "わかる is closest to ___.", "a": ["\"is clear to me\""], "opts": ["\"is clear to me\"", "\"I figure out\"", "\"I study\""], "why": "Understanding arrives; it isn't performed on the language. Hence が."}]}},
  "nogasuki": {"seg": [["本", "books"], ["を", "object of the inner clause — it survives"], ["読む", "\"read\" — plain form; の insists on it"], ["のが", "THE POINT — の turns the action into a thing; が then does its 好き job", 1], ["好きです。", "\"is liked\""]], "hl": "のが", "wr": [{"t": "の nominalizes only PLAIN forms — 読みますのが is out. And the inner を survives: 本を読むのが好き carries two particles doing two different jobs.", "jp": null}], "drill": {"items": [{"q": "本を読む___好きです。", "en": "I like reading books.", "a": ["のが"], "opts": ["のが", "のを", "がの", "こと"], "why": "の makes the action a thing; 好き takes it with が."}, {"q": "料理を作る___好きです。", "en": "I like cooking.", "a": ["のが"], "opts": ["のが", "のを", "を", "とが"], "why": "Same machine: 作るの + が."}, {"q": "音楽を___のが好きです。", "en": "I like listening to music.", "a": ["聞く"], "opts": ["聞く", "聞きます", "聞いて", "聞いた"], "why": "の nominalizes the plain form only."}, {"q": "泳ぐ → ___のが好きです。", "en": "I like swimming — type it.", "a": ["泳ぐ", "およぐ"], "why": "Plain 泳ぐ + のが好き."}, {"q": "何をする___好きですか。", "en": "What do you like doing?", "a": ["のが"], "opts": ["のが", "のを", "がの", "は"], "why": "するの + が — the question runs the same rails."}]}},
  "potential": {"seg": [["日本語", "Japanese"], ["が", "the able-to thing takes が"], ["少し", "\"a little\""], ["話せます。", "THE POINT — the potential form: can-do built into the verb; 話す → 話せる", 1]], "hl": "使えます", "note": "Can-the-card-be-used — ability of things, not just people.", "wr": [{"t": "う-verbs shift to the え row (話す→話せる, 使う→使える); る-verbs take られる (起きる→起きられる); する→できる, 来る→来られる. And the able-to thing takes が.", "jp": "朝早く起きられません。", "en": "Can't get up early — 起きる → 起きられる, negated.", "hl": "起きられません"}], "drill": {"pool": true, "note": "Build the can-form. う-verbs slide to え; る-verbs take られる; the irregulars do their own thing.", "items": [{"q": "話す → 日本語が少し___。", "en": "I can speak a little.", "a": ["話せます", "はなせます"], "why": "す → せ: 話せる → 話せます."}, {"q": "使う → この店でカードが___か。", "en": "Can I use a card here?", "a": ["使えます", "つかえます"], "why": "う → え: 使える."}, {"q": "読む → 漢字が少し___。", "en": "I can read some kanji.", "a": ["読めます", "よめます"], "why": "む → め: 読める."}, {"q": "書く → 名前が___。", "en": "I can write my name.", "a": ["書けます", "かけます"], "why": "く → け: 書ける."}, {"q": "食べる → すしが___。", "en": "I can eat sushi.", "a": ["食べられます", "たべられます"], "why": "る-verb → られる: 食べられる."}, {"q": "起きる → 朝早く___。", "en": "I CAN'T get up early.", "a": ["起きられません", "おきられません"], "why": "起きられる, negated → 起きられません."}, {"q": "する → 料理が___。", "en": "I can cook.", "a": ["できます"], "why": "する's potential is a different word: できる."}, {"q": "来る → 明日___か。", "en": "Can you come tomorrow?", "a": ["来られます", "こられます"], "why": "来る → 来られる (こられる)."}, {"q": "泳ぐ → 少し___。", "en": "I can swim a bit.", "a": ["泳げます", "およげます"], "why": "ぐ → げ: 泳げる."}]}},
  "sb-transitive2": {"drill": {"note": "Two unrelated がs converge in this step: the happen-twin's が (Step 4) and the state-family's が (好き・わかる・potential). Same kana, different reasons — name which one you're using.", "items": [{"q": "ドア___開きました。", "en": "The door opened by itself.", "a": ["が"], "opts": ["が", "を", "は", "で"], "why": "The intransitive twin's が — the door is the doer."}, {"q": "音楽___好きです。", "en": "I like music.", "a": ["が"], "opts": ["が", "を", "は", "に"], "why": "The state-family が — 好き's demand."}, {"q": "The が in ドアが開いた and the が in 音楽が好き are ___.", "a": ["two different jobs sharing one particle"], "opts": ["two different jobs sharing one particle", "the same job", "both marking objects"], "why": "One marks a happening's subject; one marks a state's target. Knowing which you're writing keeps both honest."}, {"q": "窓___閉まりました。", "en": "The window closed.", "a": ["が"], "opts": ["が", "を", "は", "へ"], "why": "Happen-twin → が."}, {"q": "日本語___わかります。", "en": "I understand Japanese.", "a": ["が"], "opts": ["が", "を", "は", "も"], "why": "State-family → が."}]}},
  "kara-because": {"seg": [["暑い", "\"it's hot\" — the reason clause"], ["から、", "THE POINT — \"because / so\": closes the reason, which comes FIRST", 1], ["窓", "the window"], ["を", "object marker"], ["開けました。", "\"opened\" — the result"]], "hl": "から", "wr": [{"t": "Answering どうして, the reason stands alone with からです: 働きたいからです. And reason-から takes a whole clause — the after-から (Step 7) takes a て-form. The joint tells them apart.", "jp": null}], "drill": {"items": [{"q": "暑い___、窓を開けました。", "en": "It was hot, so I opened the window.", "a": ["から"], "opts": ["から", "まで", "とき", "けど"], "why": "Reason → result: から."}, {"q": "時間がない___、急ぎましょう。", "en": "No time — let's hurry.", "a": ["から"], "opts": ["から", "まで", "とき", "など"], "why": "The reason clause closes with から."}, {"q": "どうして日本語を勉強していますか。— 日本で働きたい___です。", "en": "Because I want to work in Japan.", "a": ["から"], "opts": ["から", "まで", "とき", "の"], "why": "The standalone answer: reason + からです."}, {"q": "Reason and result — Japanese says ___.", "a": ["reason first, then result"], "opts": ["reason first, then result", "result first, then reason", "either, freely"], "why": "暑いから、開けました — the reason leads, the result follows."}, {"q": "高い → ___、買いませんでした。", "en": "It was pricey, so I didn't buy it — type the reason.", "a": ["高いから", "たかいから"], "why": "Plain clause + から."}]}},
  "node": {"seg": [["頭", "head"], ["が", "subject marker"], ["痛いので、", "THE POINT — ので: the gentler because — reason laid down as circumstance", 1], ["帰ります。", "\"I'm going home\""]], "hl": "なので", "note": "Nouns and な-adjectives bring な before ので: 雨なので. The bare noun + ので is the classic slip.", "wr": [{"t": "から asserts a reason; ので presents it as circumstance — softer, which is why excuses and workplace exits (お先に失礼します) prefer it.", "jp": null}], "drill": {"items": [{"q": "雨___、家にいます。", "en": "It's raining, so I'm staying in.", "a": ["なので"], "opts": ["なので", "ので", "だので", "から"], "why": "Nouns take な before ので. (から would need だ: 雨だから.)"}, {"q": "頭が痛い___、お先に失礼します。", "en": "The soft workplace exit — pick the gentlest joint.", "a": ["ので"], "opts": ["ので", "から", "けど", "まで"], "why": "から states; ので excuses. The exit line runs on ので."}, {"q": "静か___、この図書館が好きです。", "en": "It's quiet, so I like this library.", "a": ["なので"], "opts": ["なので", "ので", "いので", "から"], "why": "静か is な-family → 静かなので."}, {"q": "ので vs から: ___", "a": ["ので is softer — reason as circumstance"], "opts": ["ので is softer — reason as circumstance", "ので is stronger", "identical in tone"], "why": "Both true, differently voiced. Requests and excuses lean ので."}, {"q": "忙しい → ___、行きません。", "en": "Too busy to go — type it with the gentle joint.", "a": ["忙しいので", "いそがしいので"], "why": "Plain clause + ので."}]}},
  "ga-but": {"seg": [["高いですが、", "THE POINT — clause + が: \"but\" — the polite connector that turns the corner", 1], ["おいしいです。", "\"it's delicious\" — the second, contrasting leg"]], "hl": "けど", "note": "けど is the everyday spoken \"but\" — same joint, more relaxed register.", "wr": [{"t": "すみませんが、… is が's second life: a cushion before a request, meaning almost nothing. And this clause-が has no relation to the particle が — position tells you which is which.", "jp": "すみませんが、駅はどこですか。", "en": "Excuse me, but — the cushion before asking.", "hl": "すみませんが"}], "drill": {"items": [{"q": "高いです___、おいしいです。", "en": "Pricey, but delicious.", "a": ["が"], "opts": ["が", "から", "ので", "と"], "why": "Two clauses pulling opposite ways → が."}, {"q": "行きたい___、時間がありません。", "en": "Want to go, but no time — casual.", "a": ["けど"], "opts": ["けど", "から", "ので", "も"], "why": "The relaxed register's but → けど."}, {"q": "すみません___、駅はどこですか。", "en": "Excuse me, but — where's the station?", "a": ["が"], "opts": ["が", "けど", "から", "は"], "why": "The politeness cushion — near-meaningless が."}, {"q": "が joins ___.", "a": ["rivals — clauses pulling opposite ways"], "opts": ["rivals — clauses pulling opposite ways", "allies — clauses agreeing", "a verb to its object"], "why": "Allies chain with くて/で (Step 9); rivals turn the corner with が."}, {"q": "高い → この店は___、おいしいです。", "en": "Type the polite \"it's expensive, but…\"", "a": ["高いですが", "たかいですが", "高いけど", "たかいけど"], "why": "高いですが — polite が (けど accepted for the casual register)."}]}},
  "demo": {"seg": [["雨でした。", "\"It was raining.\" — a full sentence, full stop"], ["でも、", "THE POINT — sentence-opening \"but\": でも restarts and turns the corner", 1], ["出かけました。", "\"(I) went out anyway.\""]], "hl": "それから", "note": "The same opening slot carries other connectors — それから (\"and then\") strings a day together.", "wr": [{"t": "Mid-sentence \"but\" is が/けど; でも only opens a NEW sentence. Same meaning, different positions — English \"but\" covers both, so the split needs watching.", "jp": null}], "drill": {"items": [{"q": "雨でした。___、出かけました。", "en": "It was raining. But I went out.", "a": ["でも"], "opts": ["でも", "それから", "じゃ", "と"], "why": "Contrast across a full stop → でも."}, {"q": "朝ごはんを食べました。___、学校へ行きました。", "en": "Ate breakfast. Then off to school.", "a": ["それから"], "opts": ["それから", "でも", "けど", "か"], "why": "Sequence, not contrast → それから."}, {"q": "でも begins ___.", "a": ["a new sentence"], "opts": ["a new sentence", "a clause mid-sentence", "a noun phrase"], "why": "Mid-sentence contrast belongs to が and けど."}, {"q": "高かったです。___、買いました。", "en": "It was expensive. But I bought it.", "a": ["でも"], "opts": ["でも", "それから", "だけ", "も"], "why": "New sentence, opposite direction → でも."}, {"q": "映画を見ました。___、帰りました。", "en": "Watched a movie. Then went home.", "a": ["それから"], "opts": ["それから", "でも", "から", "まで"], "why": "And-then → それから."}]}},
  "toiu": {"seg": [["「花」", "\"Hana\" — the name, quoted"], ["という", "THE POINT — [name] という [thing]: \"the … called …\" — introduces names the listener may not know", 1], ["映画", "movie — the category the name belongs to"], ["を", "object marker"], ["見ました。", "\"watched\""]], "hl": "という", "wr": [{"t": "Asking for a word runs the same machine backwards — the survival question for every learner.", "jp": "これは日本語で何といいますか。", "en": "What's this called in Japanese? — the learner's best friend.", "hl": "何といいますか"}], "drill": {"items": [{"q": "「花」___映画を見ました。", "en": "I watched a movie called Hana.", "a": ["という"], "opts": ["という", "とという", "のいう", "どういう"], "why": "Name + という + category."}, {"q": "ポチ___犬を飼っています。", "en": "We have a dog called Pochi.", "a": ["という"], "opts": ["という", "といって", "のいう", "とか"], "why": "という introduces the unfamiliar name."}, {"q": "これは日本語で___といいますか。", "en": "What's this called in Japanese?", "a": ["何"], "opts": ["何", "誰", "どこ", "どう"], "why": "Asking after the name itself → 何."}, {"q": "—「はさみ」と___。", "en": "— It's called hasami.", "a": ["いいます"], "opts": ["いいます", "います", "あります", "します"], "why": "と + いう: \"is said/called.\""}, {"q": "という introduces ___.", "a": ["a name the listener may not know"], "opts": ["a name the listener may not know", "a reason", "a comparison"], "why": "Once the name is shared knowledge, という drops away."}]}},
  "doushite": {"seg": [["どうして", "THE POINT — \"why\": the question that expects a から answer", 1], ["遅れましたか。", "\"were (you) late?\""]], "hl": "からです", "note": "The paired answer: reason + からです. Question and answer are one system — learn them together.", "wr": [{"t": "In real speech the question usually softens with ん: どうして遅れたんですか. A bare どうしてですか can land as blunt — the ん cushions the asking.", "jp": null}], "drill": {"items": [{"q": "___遅れましたか。", "en": "Why were you late?", "a": ["どうして"], "opts": ["どうして", "何", "どこ", "いつ"], "why": "Asking for a reason → どうして."}, {"q": "— 電車が止まった___です。", "en": "Because the train stopped.", "a": ["から"], "opts": ["から", "ので", "まで", "こと"], "why": "The paired answer shape: 〜からです."}, {"q": "どうして遅れた___ですか。", "en": "The softened, real-speech version.", "a": ["ん"], "opts": ["ん", "か", "と", "も"], "why": "The ん cushion — Step 3's recognition lesson, now in your own mouth."}, {"q": "どうして pairs with answers ending ___.", "a": ["からです"], "opts": ["からです", "までです", "ようです"], "why": "Why-questions get because-answers."}, {"q": "頭が痛い → ___です。", "en": "\"Why did you leave early?\" — type the answer.", "a": ["頭が痛いから", "頭が痛かったから", "あたまがいたいから", "あたまがいたかったから"], "why": "Reason + からです."}]}},
  "nanika": {"seg": [["何か", "THE POINT — question word + か: \"something\" — the question goes vague", 1], ["食べたいです。", "\"want to eat\""]], "hl": "どこか", "note": "The set is fully regular: 何か something, 誰か someone, どこか somewhere, いつか someday.", "wr": [{"t": "Particles often drop after these: 何か食べたい needs no を; どこかへ行く keeps its へ. When unsure, dropping is the safer-sounding move.", "jp": null}], "drill": {"items": [{"q": "___食べたいです。", "en": "I want to eat SOMETHING.", "a": ["何か"], "opts": ["何か", "何", "何が", "何も"], "why": "何 + か = something."}, {"q": "___へ行きましょう。", "en": "Let's go SOMEWHERE.", "a": ["どこか"], "opts": ["どこか", "どこ", "どこも", "どこが"], "why": "どこ + か = somewhere."}, {"q": "___来ましたか。", "en": "Did SOMEONE come?", "a": ["誰か"], "opts": ["誰か", "誰", "誰も", "誰が"], "why": "誰 + か = someone."}, {"q": "何か飲みます___。", "en": "Want something to drink?", "a": ["か"], "opts": ["か", "ね", "よ", "の"], "why": "The sentence-final か still asks the question — two かs, two jobs."}, {"q": "何か usually drops its ___.", "a": ["particle"], "opts": ["particle", "verb", "politeness"], "why": "何かを食べたい isn't wrong, but 何か食べたい is what people say."}]}},
  "sb-orthography": {"drill": {"note": "Same sound, different kanji, different meaning — and some words are better left in kana. The checker grades this gently as notes; here it's the whole point.", "items": [{"q": "Hot day, hot tea — the right pair is ___.", "a": ["暑い日に熱いお茶"], "opts": ["暑い日に熱いお茶", "熱い日に暑いお茶", "暑い日に暑いお茶"], "why": "暑い for weather, 熱い for touch — same sound, split by kanji."}, {"q": "きれい is usually written ___.", "a": ["in kana"], "opts": ["in kana", "綺麗, always", "in katakana"], "why": "The kanji 綺麗 is above N5 and rare in everyday writing — kana is the standard."}, {"q": "天気が___です。", "en": "The weather is hot.", "a": ["暑い"], "opts": ["暑い", "熱い", "痛い"], "why": "Weather-hot → 暑い."}, {"q": "お茶が___です。", "en": "The tea is hot.", "a": ["熱い"], "opts": ["熱い", "暑い", "寒い"], "why": "Touch-hot → 熱い."}, {"q": "いたい → the standard written form at your level is ___.", "a": ["痛い"], "opts": ["痛い", "いたい, always", "イタイ"], "why": "痛 is in your kanji syllabus — the grader nudges kana-for-kanji as a note, never a fix."}]}},
  "sb-waga2": {"drill": {"note": "The second look: contrast rides は, identification rides が — and one sentence can carry both doing different jobs.", "items": [{"q": "この店___高いですが、おいしいです。", "en": "This place is pricey BUT delicious.", "a": ["は"], "opts": ["は", "が", "を", "も"], "why": "Contrast is は's specialty."}, {"q": "誰___作りましたか。", "en": "Who made this?", "a": ["が"], "opts": ["が", "は", "を", "に"], "why": "Question words identify → が."}, {"q": "— 母___作りました。", "en": "— Mom did.", "a": ["が"], "opts": ["が", "は", "を", "も"], "why": "The answer inherits the question's が."}, {"q": "肉は食べますが、魚___食べません。", "en": "Meat yes, fish no.", "a": ["は"], "opts": ["は", "が", "を", "も"], "why": "The second leg of a contrast keeps は."}, {"q": "The question が answers is ___.", "a": ["\"which one?\""], "opts": ["\"which one?\"", "\"what about it?\"", "\"when?\""], "why": "が identifies; は frames a topic and asks \"what about it?\" — the whole distinction in one line."}]}},
  "sb-pronouns2": {"drill": {"note": "When 私 must STAY: a describing clause carries its own subject slot, and clause-internal subjects take が.", "items": [{"q": "___好きなスポーツはテニスです。", "en": "The sport I like is tennis.", "a": ["私が"], "opts": ["私が", "私は", "私"], "why": "Inside a describing clause the subject stays, marked が (の also works) — は would break out of the clause."}, {"q": "母___作った料理がいちばんおいしいです。", "en": "Mom's cooking is the best.", "a": ["が"], "opts": ["が", "は", "を", "に"], "why": "母 is the clause's own subject → が."}, {"q": "Inside a describing clause, the subject takes ___.", "a": ["が"], "opts": ["が", "は", "も"], "why": "は belongs to the sentence's main frame, never inside the clause."}, {"q": "私___好きな音楽", "en": "\"the music I like\" — build the clause.", "a": ["が"], "opts": ["が", "は", "を", "も"], "why": "Clause-internal subject → 私が (or 私の)."}]}},
  "sb-omou": {"drill": {"note": "Plain clause + と思います — と quotes your thought. The clause inside stays plain no matter how polite the outside is.", "items": [{"q": "この店は高い___思います。", "en": "I think this place is expensive.", "a": ["と"], "opts": ["と", "を", "が", "か"], "why": "と quotes the thought."}, {"q": "彼は学生___と思います。", "en": "I think he's a student.", "a": ["だ"], "opts": ["だ", "です", "の", "な"], "why": "Nouns need だ before と: 学生だと思います, never 学生ですと."}, {"q": "明日は___と思います。", "en": "I think he WON'T come.", "a": ["来ない"], "opts": ["来ない", "来ません", "来ないです", "来る"], "why": "The negative lives inside the quote, in plain form: 来ないと思います."}, {"q": "おいしい → この料理は___と思います。", "en": "I think it's delicious — type it.", "a": ["おいしい"], "why": "い-adjectives go straight into と, plain."}, {"q": "静か → この町は___と思います。", "en": "I think this town is quiet.", "a": ["静かだ", "しずかだ"], "opts": ["静かだ", "静か", "静かです", "静かな"], "why": "な-adjectives take だ before と, like nouns."}]}},
  "passive": {"seg": [["私", "I — the one it happened to"], ["は", "topic marker"], ["先生", "the teacher — the doer"], ["に", "the doer takes に in a passive"], ["名前", "name"], ["を", "object marker"], ["聞かれました。", "THE POINT — the passive: done-to-me; 聞く → 聞かれる", 1]], "hl": "使われています", "note": "Passives describe things too — the shop is used by many people, as an ongoing state.", "wr": [{"t": "雨に降られました — the \"suffering passive\": it rained ON me. Japanese lets events happen TO you grammatically; English has to paraphrase.", "jp": "雨に降られました。", "en": "I got rained on — the classic suffering passive.", "hl": "降られました"}], "drill": {"items": [{"q": "私は先生___名前を聞かれました。", "en": "I was asked my name by the teacher.", "a": ["に"], "opts": ["に", "が", "を", "で"], "why": "The doer in a passive takes に."}, {"q": "聞く → 名前を___。", "en": "\"was asked\" — passive, polite past.", "a": ["聞かれました", "きかれました"], "why": "聞く → 聞かれる → 聞かれました."}, {"q": "使う → この店は多くの人に___います。", "en": "This shop is used by many people.", "a": ["使われて", "つかわれて"], "why": "使われる in its て-form + います — a standing state."}, {"q": "雨___降られました。", "en": "I got rained on.", "a": ["に"], "opts": ["に", "が", "を", "は"], "why": "Even the rain, as doer, takes に."}, {"q": "話す → the passive is ___.", "a": ["話される"], "opts": ["話される", "話せる", "話しられる"], "why": "あ-row + れる. 話せる is the POTENTIAL — the lookalike that isn't."}]}},
  "tara": {"seg": [["時間", "time"], ["が", "subject of ある"], ["あったら、", "THE POINT — た-form + ら: \"if / when it happens\" — Stage 1's everyday if", 1], ["行きます。", "\"I'll go\""]], "hl": "と", "note": "The other Stage 1 if: 〜と, for machine-like certainty — press it and it opens, every time, no exceptions.", "wr": [{"t": "Japanese has four ifs — たら・と・ば・なら. Stage 1 teaches たら and と; ば and なら arrive in Stage 2. An honest deferral, not an omission.", "jp": "日本に着いたら、電話してください。", "en": "When you arrive, call me — たら covers when-cases too.", "hl": "着いたら"}], "drill": {"items": [{"q": "時間が___、行きます。", "en": "If I have time, I'll go. (ある)", "a": ["あったら"], "opts": ["あったら", "あるたら", "あれたら", "あります"], "why": "た-form + ら: あった → あったら."}, {"q": "このボタンを押す___、ドアが開きます。", "en": "Press it and it opens — every time.", "a": ["と"], "opts": ["と", "から", "まで", "か"], "why": "Machine-like certainty → と."}, {"q": "日本に___、電話してください。", "en": "When you arrive, call me. (着く)", "a": ["着いたら"], "opts": ["着いたら", "着くたら", "着けたら", "着くと"], "why": "着いた + ら. 〜と can't carry a request — that's the tell."}, {"q": "降る → 雨が___、家にいます。", "en": "If it rains, I'm staying in — type it.", "a": ["降ったら", "ふったら"], "why": "降った + ら."}, {"q": "〜と cannot end with ___.", "a": ["a request or invitation"], "opts": ["a request or invitation", "a present-tense fact", "a machine behavior"], "why": "と states automatic results; requests and invitations need たら."}]}},
  "temiru": {"seg": [["このケーキ", "this cake — the unknown"], ["を", "object marker"], ["食べてみました。", "THE POINT — て-form + みる: did it once, to see", 1]], "hl": "話してみます", "note": "みる conjugates like the 見る it came from — and 〜てみたいです (want to try) is the stack you'll use most.", "wr": [{"t": "Trying-as-experiment, not trying-as-effort: てみる means the result is unknown, not that the task is hard.", "jp": null}], "drill": {"items": [{"q": "食べる → このケーキを___ました。", "en": "I tried the cake — to see.", "a": ["食べてみ", "たべてみ"], "why": "食べて + みる → 食べてみました."}, {"q": "話す → 日本語で___ます。", "en": "I'll try speaking in Japanese.", "a": ["話してみ", "はなしてみ"], "why": "話して + みます."}, {"q": "着る → この服を___もいいですか。", "en": "May I try this on?", "a": ["着てみて", "きてみて"], "why": "着てみて + もいいですか — てみる riding the permission ask."}, {"q": "使う → ___ください。", "en": "Please give it a try.", "a": ["使ってみて", "つかってみて"], "why": "使ってみて + ください — the gentle invitation."}, {"q": "てみる claims ___.", "a": ["the result is unknown — do it once and see"], "opts": ["the result is unknown — do it once and see", "the task is difficult", "you will succeed"], "why": "An experiment, not a struggle."}]}},
  "teikutekuru": {"seg": [["雨", "rain"], ["が", "subject marker"], ["降ってきました。", "THE POINT — て-form + くる: the change arrived TOWARD now (and onto you)", 1]], "hl": "なっていきます", "note": "The mirror: ていく sends the change away from now — from here on, hotter and hotter.", "wr": [{"t": "You've said this pattern daily since Step 1: いってきます — \"I go and come (back)\" — is ていく・てくる fossilized into the leaving-home ritual.", "jp": null}], "drill": {"items": [{"q": "雨が降って___ました。", "en": "It's STARTED raining — arrived on you.", "a": ["き"], "opts": ["き", "いき", "み", "おき"], "why": "Change toward now → てくる."}, {"q": "これから暑くなって___ます。", "en": "From here on it'll KEEP getting hotter.", "a": ["いき"], "opts": ["いき", "き", "み", "おき"], "why": "Change heading away from now → ていく."}, {"q": "お茶を持って___ください。", "en": "Please BRING some tea.", "a": ["きて"], "opts": ["きて", "いって", "みて", "おいて"], "why": "Toward the speaker → 持ってくる."}, {"q": "お弁当を持って___ましょう。", "en": "Let's TAKE lunch along.", "a": ["いき"], "opts": ["いき", "き", "み", "しまい"], "why": "Away with you → 持っていく."}, {"q": "日本語が上手になって___ました。", "en": "Your Japanese has been getting good — up to now.", "a": ["き"], "opts": ["き", "いき", "み", "おき"], "why": "Change accumulating toward the present → てくる."}]}},
  "teageru": {"seg": [["友達", "my friend — the giver of the favor"], ["が", "the giver takes が with くれる"], ["宿題", "homework"], ["を", "object of the helping"], ["手伝ってくれました。", "THE POINT — て-form + くれました: the act flowed toward me, as a kindness", 1]], "hl": "あげました", "note": "Outward now: my act, my kindness — あげる. The receiver takes に.", "wr": [{"t": "Cold report versus kindness: 母は朝ごはんを作りました states labor; adding くれる thanks it. Native ears notice the くれる that isn't there.", "jp": "母が朝ごはんを作ってくれました。", "en": "Mom made me breakfast — the くれる carries the gratitude.", "hl": "作ってくれました"}], "drill": {"items": [{"q": "友達が宿題を手伝って___。", "en": "My friend helped me — kindness toward me.", "a": ["くれました"], "opts": ["くれました", "あげました", "もらいました"], "why": "Toward me, giver as subject → くれる."}, {"q": "私は妹に本を読んで___。", "en": "I read to my little sister — my kindness outward.", "a": ["あげました"], "opts": ["あげました", "くれました", "もらいました"], "why": "Outward from me → あげる."}, {"q": "田中さんに写真を撮って___。", "en": "I had Tanaka take the photo.", "a": ["もらいました"], "opts": ["もらいました", "くれました", "あげました"], "why": "I received the doing → もらう, doer に."}, {"q": "母が朝ごはんを作って___。", "en": "Mom kindly made me breakfast.", "a": ["くれました"], "opts": ["くれました", "あげました", "もらいました"], "why": "Her act, toward me → くれる."}, {"q": "先生に漢字を教えて___。", "en": "I had the teacher teach me kanji.", "a": ["もらいました"], "opts": ["もらいました", "くれました", "あげました"], "why": "Received the teaching → もらう. (いただきました, two lessons on, is its formal twin.)"}, {"q": "私は弟にお茶を買って___。", "en": "I bought my little brother some tea.", "a": ["あげました"], "opts": ["あげました", "くれました", "もらいました"], "why": "My kindness, outward → あげる."}]}},
  "ageru2": {"seg": [["田中さん", "Tanaka — the giver, and the subject of this telling"], ["が", "くれる puts the giver on stage with が"], ["本", "a book"], ["を", "object marker"], ["くれました。", "THE POINT — the frame: くれる tells the gift from the giver's side; もらう could tell the same gift from mine", 1]], "hl": "もらいました", "note": "The identical event — the subject switched to me, and 田中さん dropped to に.", "wr": [{"t": "Frame-mixing is the wreck: 田中さんがもらいました says TANAKA received something. Verb and particles must tell the same story, always.", "jp": null}], "drill": {"items": [{"q": "田中さん___本をくれました。", "en": "Tanaka gave me a book — his frame.", "a": ["が"], "opts": ["が", "に", "を", "は"], "why": "くれる: the giver is the subject → が."}, {"q": "田中さん___本をもらいました。", "en": "I got a book from Tanaka — my frame.", "a": ["に"], "opts": ["に", "が", "を", "で"], "why": "もらう: the giver drops to に."}, {"q": "You've been talking about your kind friend all paragraph. ___", "a": ["友達がくれました"], "opts": ["友達がくれました", "友達にもらいました", "友達をくれました"], "why": "Keep the friend on stage → くれる keeps the giver as subject."}, {"q": "誰___もらいましたか。", "en": "Who was it from?", "a": ["に"], "opts": ["に", "が", "を", "は"], "why": "Asking after もらう's giver → 誰に."}, {"q": "田中さんがもらいました means ___.", "a": ["Tanaka received it"], "opts": ["Tanaka received it", "Tanaka gave it to me", "I received it from Tanaka"], "why": "Receiver-subject frame. If you meant his gift to you: 田中さんがくれました."}]}},
  "itadaku": {"seg": [["先生", "the teacher — above me on the politeness axis"], ["に", "the giver of the favor, に as with もらう"], ["漢字", "kanji"], ["を", "object marker"], ["教えて", "\"teach\" — て-form, attached exactly as in the plain triangle"], ["いただきました。", "THE POINT — もらう in formal dress: received, upward, gratefully", 1]], "hl": "くださいました", "note": "くれる's formal twin — the giver stays on stage as subject; the kindness bows.", "wr": [{"t": "The map, whole: もらう→いただく, くれる→くださる, あげる→さしあげる. Directions and particles unchanged — only the altitude of the other party moved.", "jp": null}], "drill": {"items": [{"q": "先生に教えて___。", "en": "Received the favor — from a teacher, so formal.", "a": ["いただきました"], "opts": ["いただきました", "くださいました", "さしあげました"], "why": "Receiving upward → いただく."}, {"q": "先生が本を___。", "en": "The teacher kindly gave me one — teacher as subject.", "a": ["くださいました"], "opts": ["くださいました", "いただきました", "さしあげました"], "why": "Giver-as-subject, upward → くださる."}, {"q": "もらう's formal twin is ___.", "a": ["いただく"], "opts": ["いただく", "くださる", "さしあげる"], "why": "Receive, politely → いただく."}, {"q": "くれる's formal twin is ___.", "a": ["くださる"], "opts": ["くださる", "いただく", "さしあげる"], "why": "Give-to-me, politely → くださる."}, {"q": "食事の前の「___」。", "en": "Before meals — the polite receiving you already say.", "a": ["いただきます"], "opts": ["いただきます", "くださいます", "さしあげます"], "why": "You receive the meal → いただきます. The verb was keigo all along."}]}},
  "tehoshii": {"seg": [["友達", "my friend — the hoped-for doer"], ["に", "the doer takes に"], ["来てほしいです。", "THE POINT — て-form + ほしい: wanting the ACT, from them", 1]], "hl": "手伝ってほしい", "note": "The んですが… trailing setup — Step 3's ん and the soft trailing-off, working together on one small favor.", "wr": [{"t": "Three wants, three machines: 水がほしい (a thing), 飲みたい (my own act), 飲んでほしい (someone else's act). English covers all three with \"want\" — Japanese never does.", "jp": null}], "drill": {"items": [{"q": "友達に来て___です。", "en": "I want my friend to come.", "a": ["ほしい"], "opts": ["ほしい", "たい", "ください"], "why": "Their act, wished for → てほしい."}, {"q": "ちょっと手伝って___んですが…。", "en": "The classic favor opener.", "a": ["ほしい"], "opts": ["ほしい", "たい", "もらう"], "why": "てほしい + ん + trailing が — the full soft ask."}, {"q": "水が___です。", "en": "I want water — the thing itself.", "a": ["ほしい"], "opts": ["ほしい", "飲みたい", "飲んでほしい"], "why": "A thing wanted → plain ほしい (Step 6)."}, {"q": "すしが___です。", "en": "I want to eat it MYSELF.", "a": ["食べたい"], "opts": ["食べたい", "ほしい", "食べてほしい"], "why": "My own act → たい."}, {"q": "母に作って___です。", "en": "I want Mom to make it.", "a": ["ほしい"], "opts": ["ほしい", "たい", "ください"], "why": "Her act, my wish → てほしい, doer に."}, {"q": "ここでたばこを___でほしいです。", "en": "I'd rather you NOT smoke here.", "a": ["吸わない"], "opts": ["吸わない", "吸って", "吸う"], "why": "The negative wish rides the ない form: 吸わないでほしい."}]}},
  "sb-kuremorau": {"drill": {"note": "Pick the frame FIRST — who is this sentence about? — and the verb is forced. The freeze happens when you decide mid-sentence.", "items": [{"q": "友達が手伝って___。", "en": "About my friend's kindness.", "a": ["くれました"], "opts": ["くれました", "もらいました", "あげました"], "why": "Giver's frame, giver が → くれる."}, {"q": "友達に手伝って___。", "en": "About my day — I got help.", "a": ["もらいました"], "opts": ["もらいました", "くれました", "あげました"], "why": "My frame, giver に → もらう."}, {"q": "妹が写真を撮って___。", "en": "My sister kindly took it.", "a": ["くれました"], "opts": ["くれました", "もらいました", "あげました"], "why": "Her kindness on stage → くれる."}, {"q": "先生に直して___。", "en": "I had the teacher fix it.", "a": ["もらいました"], "opts": ["もらいました", "くれました", "あげました"], "why": "Receipt recorded from my side → もらう."}, {"q": "友達___もらいました。", "en": "Mark the giver.", "a": ["に"], "opts": ["に", "が", "を"], "why": "もらう's giver takes に (から also works); が would flip the verb to くれる."}, {"q": "The question to ask first: ___", "a": ["who is this sentence about?"], "opts": ["who is this sentence about?", "which verb sounds politer?", "which particle comes last?"], "why": "Frame first. Then verb and particles fall into place on their own."}]}},
  "kamo": {"seg": [["明日", "tomorrow — bare"], ["は", "topic marker"], ["雨", "rain — a noun, attaching bare: no だ"], ["かもしれません。", "THE POINT — \"might be\": the claim lowered to an honest maybe", 1]], "hl": "かもしれません", "wr": [{"t": "The certainty dial so far: です (it is) → でしょう (probably) → かもしれません (maybe). This step adds more stops — keep placing each new form on the dial.", "jp": null}], "drill": {"items": [{"q": "明日は雨___。", "en": "MIGHT rain — a real maybe, not a forecast's probably.", "a": ["かもしれません"], "opts": ["かもしれません", "でしょう", "です", "ですか"], "why": "Fifty-fifty or below → かもしれません. でしょう would lean probable."}, {"q": "田中さんは来ない___。", "en": "He might not come.", "a": ["かもしれません"], "opts": ["かもしれません", "でしょう", "です", "はずです"], "why": "A maybe about someone else's plans → かも."}, {"q": "明日は雨___。", "en": "PROBABLY — the forecast's own word.", "a": ["でしょう"], "opts": ["でしょう", "かもしれません", "です", "まで"], "why": "Probable, not merely possible → でしょう."}, {"q": "帰る → もう___かもしれません。", "en": "He may have ALREADY gone home — type it.", "a": ["帰った", "かえった"], "why": "The past lives inside the clause: 帰ったかもしれません."}, {"q": "\"Might be rain\" is ___.", "a": ["雨かもしれません"], "opts": ["雨かもしれません", "雨だかもしれません", "雨ですかもしれません"], "why": "Nouns attach bare — no だ, no です before かもしれません."}]}},
  "hazu": {"seg": [["チケット", "the ticket — the receipt this reasoning stands on"], ["を", "object marker"], ["買いましたから", "\"because (he) bought it\" — the reason, stated"], ["、", "a breath"], ["来る", "\"come\" — plain form"], ["はずです。", "THE POINT — \"should\": the conclusion that follows from what you know", 1]], "hl": "はずです", "wr": [{"t": "はずがない runs the same reasoning in reverse — \"there's no way.\"", "jp": "そんなはずがありません。", "en": "That can't be right — the receipts don't add up to that.", "hl": "はずがありません"}], "drill": {"items": [{"q": "チケットを買いましたから、来る___です。", "en": "He should be coming — there's a receipt.", "a": ["はず"], "opts": ["はず", "かも", "でしょう", "つもり"], "why": "Reasoned expectation → はず."}, {"q": "今日は休みじゃないから、店は開いている___です。", "en": "Should be open — no holiday today.", "a": ["はず"], "opts": ["はず", "かも", "らしい", "そう"], "why": "Logic with a stated reason → はず."}, {"q": "そんな___がありません。", "en": "No way. Can't possibly be.", "a": ["はず"], "opts": ["はず", "かも", "こと", "よう"], "why": "はずがない — impossibility by reasoning."}, {"q": "静か → 図書館は___はずです。", "en": "The library should be quiet — type the joint.", "a": ["静かな", "しずかな"], "why": "な-adjectives keep な before はず."}, {"q": "はず needs ___.", "a": ["a reason you could point to"], "opts": ["a reason you could point to", "a hope", "a rumor"], "why": "No receipts, no はず — reach for かもしれません or でしょう instead."}]}},
  "youda": {"seg": [["誰も", "nobody — question word + も under a negative"], ["いない", "\"isn't there\" — plain negative"], ["ようです。", "THE POINT — \"seems\": judged from what's in front of you", 1]], "hl": "みたいです", "note": "Same judgment, casual dress — and みたい attaches bare to nouns where よう wants の.", "wr": [{"t": "The joints differ by family: 雨のようです but 雨みたいです; 静かなようです but 静かみたいです. よう is choosier than みたい.", "jp": null}], "drill": {"items": [{"q": "誰もいない___です。", "en": "Seems nobody's home — the lights are off.", "a": ["よう"], "opts": ["よう", "らしい", "はず", "つもり"], "why": "Your own eyes on the evidence → よう."}, {"q": "田中さんは忙しい___です。", "en": "Seems busy — casual register.", "a": ["みたい"], "opts": ["みたい", "のよう", "はず", "かも"], "why": "みたい is よう in casual dress, attaching bare."}, {"q": "雨___ようです。", "en": "Seems to be rain — pick the joint.", "a": ["の"], "opts": ["の", "な", "だ", "は"], "why": "Nouns join よう with の."}, {"q": "静か___ようです。", "en": "Seems quiet — pick the joint.", "a": ["な"], "opts": ["な", "の", "だ", "い"], "why": "な-adjectives keep な before よう."}, {"q": "ようだ's evidence is ___.", "a": ["what you see in front of you"], "opts": ["what you see in front of you", "what someone told you", "pure hope"], "why": "Secondhand seeming is らしい — the next lesson."}]}},
  "rashii": {"seg": [["田中さん", "Tanaka"], ["は", "topic marker"], ["結婚する", "\"will marry\" — plain form"], ["らしいです。", "THE POINT — \"apparently\": rumor absorbed, source blurred", 1]], "hl": "らしい", "wr": [{"t": "らしい's second job — true to type: 春らしい天気 is weather being properly spring. Same word, different machine; context decides which is running.", "jp": "彼は学生らしいです。", "en": "Apparently a student — or every inch one. Context picks.", "hl": "らしい"}], "drill": {"items": [{"q": "田中さんは結婚する___です。", "en": "Apparently — you heard it around.", "a": ["らしい"], "opts": ["らしい", "よう", "はず", "たい"], "why": "Absorbed rumor → らしい."}, {"q": "あの店は閉まる___です。", "en": "Apparently that shop's closing.", "a": ["らしい"], "opts": ["らしい", "よう", "はず", "かも"], "why": "Word going around → らしい."}, {"q": "誰もいない___です。", "en": "Judged from the dark windows YOURSELF.", "a": ["よう"], "opts": ["よう", "らしい", "そう", "はず"], "why": "Your own eyes → よう; らしい would blame the rumor mill."}, {"q": "らしい leans on ___.", "a": ["absorbed rumor — the source blurred"], "opts": ["absorbed rumor — the source blurred", "your own eyes", "logic and receipts"], "why": "Eyes → よう; receipts → はず; blur → らしい."}, {"q": "春___天気ですね。", "en": "Properly spring-like weather.", "a": ["らしい"], "opts": ["らしい", "のよう", "みたい", "はず"], "why": "True-to-type らしい — the second job, live."}]}},
  "souda-mite": {"seg": [["雨", "rain"], ["が", "subject marker"], ["降りそうです。", "THE POINT — verb STEM + そう: about to, by the look of it", 1]], "hl": "おいしそう", "note": "い-adjectives drop the い: おいしい → おいしそう. First impressions, before first bites.", "wr": [{"t": "Two irregulars to memorize whole: いい → よさそう, ない → なさそう.", "jp": null}], "drill": {"items": [{"q": "雨が降り___です。", "en": "Looks like rain any minute.", "a": ["そう"], "opts": ["そう", "らしい", "はず", "よう"], "why": "Read off the sky's surface → stem + そう."}, {"q": "このケーキはおいし___です。", "en": "Looks delicious — untasted.", "a": ["そう"], "opts": ["そう", "いそう", "いだそう", "くそう"], "why": "おいしい drops its い, then そう."}, {"q": "かばんが___そうです。", "en": "落ちる — about to fall.", "a": ["落ち"], "opts": ["落ち", "落ちる", "落ちた", "落ちて"], "why": "This そう takes the STEM: 落ち."}, {"q": "いい → ___そうです。", "en": "Looks good — the irregular.", "a": ["よさ"], "opts": ["よさ", "いい", "よ", "よく"], "why": "いい → よさそう, memorized whole."}, {"q": "始まる → 映画が___です。", "en": "The movie's about to start — type it.", "a": ["始まりそう", "はじまりそう"], "why": "Stem 始まり + そう."}]}},
  "souda-denbun": {"seg": [["明日", "tomorrow — bare"], ["は", "topic marker"], ["雨", "rain"], ["が", "subject of 降る"], ["降るそうです。", "THE POINT — PLAIN FORM + そうです: heard whole, passed on whole", 1]], "hl": "そうです", "wr": [{"t": "らしい blurs its source; this そう stands on one — the forecast, the friend who told you. Confidence scales with how nameable the source is.", "jp": null}], "drill": {"items": [{"q": "明日は雨が降る___です。", "en": "The forecast SAYS so.", "a": ["そう"], "opts": ["そう", "らしい", "よう", "はず"], "why": "Named-source hearsay → plain form + そう."}, {"q": "あの店は安い___です。", "en": "I hear it's cheap.", "a": ["そう"], "opts": ["そう", "よう", "らしそう", "はず"], "why": "高いようです would claim your own judgment; hearing → そう."}, {"q": "田中さんは学生___そうです。", "en": "I hear he's a student — pick the joint.", "a": ["だ"], "opts": ["だ", "の", "な", "です"], "why": "Nouns need だ before hearsay そう: 学生だそうです."}, {"q": "明日は___そうです。", "en": "I hear it WON'T rain.", "a": ["降らない"], "opts": ["降らない", "降りません", "降りそうもない", "降って"], "why": "Negation lives inside the clause, in plain form: 降らないそうです."}, {"q": "This そう attaches to ___.", "a": ["the finished plain clause"], "opts": ["the finished plain clause", "the verb stem", "the て-form"], "why": "Stem + そう is the OTHER そう — looks-about-to."}]}},
  "sb-sou": {"drill": {"note": "One syllable, three machines — split entirely by what stands before そう. cc-yes promised this drill back in Step 1; both parents now exist.", "items": [{"q": "空が暗いです。雨が降___そうです。", "en": "The SKY says so.", "a": ["り"], "opts": ["り", "る", "った", "って"], "why": "Your own eyes on the surface → stem: 降りそう."}, {"q": "ニュースでは、雨が降___そうです。", "en": "The NEWS says so.", "a": ["る"], "opts": ["る", "り", "って", "らない"], "why": "Passing on the report whole → plain form: 降るそう."}, {"q": "いい天気ですね。— ___ですね。", "en": "Agree with the neighbor.", "a": ["そう"], "opts": ["そう", "降りそう", "降るそう", "はず"], "why": "Bare そうです（ね） — the everyday agreement from Step 1."}, {"q": "このケーキ、おいし___です。", "en": "Looks tasty — untasted.", "a": ["そう"], "opts": ["そう", "いそう", "いだそう", "くそう"], "why": "い-adjective drops い, stem-style そう."}, {"q": "あの店は高い___です。", "en": "So I HEAR.", "a": ["そう"], "opts": ["そう", "よう", "らしそう", "みたそう"], "why": "Finished clause + そう = hearsay. (高いようです would be your own read.)"}, {"q": "そうですね, standing alone, is ___.", "a": ["agreement — Step 1's everyday yes"], "opts": ["agreement — Step 1's everyday yes", "hearsay", "a weather prediction"], "why": "The triangle closes where cc-yes said it would."}]}},
  "ba": {"seg": [["聞けば", "THE POINT — え-row + ば: \"if you ask\" — condition as equation", 1], ["、", "a breath"], ["わかります。", "\"you'll understand\" — what follows from the condition"]], "hl": "安ければ", "note": "い-adjectives take ければ — the same machine as なければなりません, now meeting its family.", "wr": [{"t": "Step 5's obligation was a ば-sentence in disguise: 飲まなければなりません — \"if you don't drink it, it won't do.\" You've conjugated ば for months.", "jp": null}], "drill": {"pool": true, "note": "Build the ば-form: え-row for う-verbs, れば for る-verbs, ければ for い-adjectives.", "items": [{"q": "行く → 電車で___、早いです。", "en": "If you go by train, it's fast.", "a": ["行けば", "いけば"], "why": "く → け + ば."}, {"q": "飲む → 薬を___、よくなりますよ。", "en": "Take the medicine and you'll get better.", "a": ["飲めば", "のめば"], "why": "む → め + ば."}, {"q": "安い → ___、買います。", "en": "If it's cheap, I'll buy it.", "a": ["安ければ", "やすければ"], "why": "い-adjective → ければ."}, {"q": "見る → これを___、わかります。", "en": "Look at this and you'll see.", "a": ["見れば", "みれば"], "why": "る-verb → れば."}, {"q": "する → 勉強___、わかります。", "en": "Study and it comes clear.", "a": ["すれば"], "why": "する → すれば."}, {"q": "いい → 天気が___、行きましょう。", "en": "If the weather's good, let's go.", "a": ["よければ"], "why": "いい conjugates on its よ side: よければ."}]}},
  "nara": {"seg": [["京都", "Kyoto — their plan, not yours"], ["へ", "destination marker"], ["行くなら", "THE POINT — plain clause + なら: \"if that's the situation…\" — a borrowed topic", 1], ["、", "a breath"], ["電車", "the train"], ["が", "subject marker"], ["いいですよ。", "\"is good\" — advice attached, with よ delivering the news"]], "hl": "なら", "note": "Bare noun + なら — the topic lifted straight out of the other person's sentence.", "wr": [{"t": "なら's superpower: its advice can happen BEFORE its condition. 行くなら、チケットを買っておいてください — the buying comes first. No other if can point backward.", "jp": null}], "drill": {"items": [{"q": "京都へ行く___、電車がいいですよ。", "en": "Responding to THEIR travel plan.", "a": ["なら"], "opts": ["なら", "たら", "ば", "と"], "why": "Borrowed topic + advice → なら."}, {"q": "お茶___、あの店が安いです。", "en": "If it's tea you're after…", "a": ["なら"], "opts": ["なら", "たら", "ば", "と"], "why": "Bare noun topic → なら, no だ."}, {"q": "日本語___、田中さんに聞いてください。", "en": "If it's Japanese you need help with…", "a": ["なら"], "opts": ["なら", "たら", "ば", "と"], "why": "Topic from context → なら."}, {"q": "行く___、チケットを買っておいてください。", "en": "Buy BEFORE going — which if allows that order?", "a": ["なら"], "opts": ["なら", "たら", "と", "ば"], "why": "Only なら points backward; たら would put the buying after the going."}, {"q": "なら borrows its condition from ___.", "a": ["what the other person just said"], "opts": ["what the other person just said", "the laws of nature", "your own receipts"], "why": "That's why it's the advice-if: the topic is already theirs."}]}},
  "taradou": {"seg": [["先生", "the teacher"], ["に", "the one to ask"], ["聞いたら", "\"if you asked\" — the たら form doing its usual work"], ["どうですか。", "THE POINT — たら + どうですか: \"how about…?\" — the decision stays theirs", 1]], "hl": "どうですか", "wr": [{"t": "Tone is the whole game: flat delivery reads as \"why haven't you already?\" Keep it light, cushion it with 少し or でも.", "jp": null}], "drill": {"items": [{"q": "先生に聞いた___どうですか。", "en": "How about asking the teacher?", "a": ["ら"], "opts": ["ら", "り", "れば", "と"], "why": "The たら form carries the suggestion."}, {"q": "少し休んだら___ですか。", "en": "How about a little rest?", "a": ["どう"], "opts": ["どう", "何", "なぜ", "いつ"], "why": "たら + どうですか — the fixed pair."}, {"q": "医者に行く → ___どうですか。", "en": "Maybe see a doctor? — type the たら form.", "a": ["行ったら", "いったら"], "why": "行く → 行ったら (the Step 4 sound change, still paying rent)."}, {"q": "〜たらどうですか, said warmly, is ___.", "a": ["a light suggestion"], "opts": ["a light suggestion", "an order", "a complaint"], "why": "Advice that leaves the choice with them — tone keeps it that way."}, {"q": "休む → 少し___どうですか。", "en": "How about resting a bit? — type it.", "a": ["休んだら", "やすんだら"], "why": "む → んだら."}]}},
  "sb-if4": {"drill": {"note": "Four ifs, four claims — and two hard walls: と never precedes a request, and only なら points backward. Everything else is tuning.", "items": [{"q": "このボタンを押す___、ドアが開きます。", "en": "Every time, automatically.", "a": ["と"], "opts": ["と", "たら", "ば", "なら"], "why": "A law of the machine → と."}, {"q": "時間があっ___、行きます。", "en": "If I happen to have time — one-off.", "a": ["たら"], "opts": ["たら", "と", "ば", "なら"], "why": "One-off possibility → たら."}, {"q": "安けれ___、買います。", "en": "IF cheap — the condition is the open question.", "a": ["ば"], "opts": ["ば", "と", "たら", "なら"], "why": "Focus on what follows from the condition → ば."}, {"q": "京都へ行く___、電車がいいですよ。", "en": "Reacting to their plan.", "a": ["なら"], "opts": ["なら", "と", "ば", "たら"], "why": "Borrowed topic, advice attached → なら."}, {"q": "日本に着い___、電話してください。", "en": "A request follows — which if survives?", "a": ["たら"], "opts": ["たら", "と", "ば", "なら"], "why": "と can't precede a request; たら carries when-then plus your will."}, {"q": "The only if that can point backward in time: ___.", "a": ["なら"], "opts": ["なら", "たら", "と"], "why": "行くなら、買っておいて — advice before the going. なら alone does this."}]}},
  "you-vol": {"seg": [["そろそろ", "\"about time to…\" — the word that loves this form"], ["帰ろう。", "THE POINT — the volitional: お-row + う, \"let's / I'll\" in plain clothes", 1]], "hl": "見よう", "note": "る-verbs take よう — 見る → 見よう. The casual invitation, ready to go.", "wr": [{"t": "ましょう was this form wearing polite dress all along: 行きましょう／行こう, one meaning, two registers.", "jp": null}], "drill": {"pool": true, "note": "Build the volitional: お-row + う for う-verbs, よう for る-verbs, irregulars memorized whole.", "items": [{"q": "行く → 一緒に___。", "en": "Let's go!", "a": ["行こう", "いこう"], "why": "く → こ + う."}, {"q": "食べる → 昼ごはんを___。", "en": "Let's eat lunch.", "a": ["食べよう", "たべよう"], "why": "る-verb → よう."}, {"q": "飲む → お茶を___。", "en": "Let's have tea.", "a": ["飲もう", "のもう"], "why": "む → も + う."}, {"q": "帰る → そろそろ___。", "en": "Time to head home.", "a": ["帰ろう", "かえろう"], "why": "帰る is う-family: 帰ろう."}, {"q": "する → 勉強___。", "en": "Let's study.", "a": ["しよう"], "why": "する → しよう."}, {"q": "見る → 映画を___。", "en": "Let's watch a movie.", "a": ["見よう", "みよう"], "why": "見る → 見よう."}]}},
  "youtoomou": {"seg": [["来年", "next year — bare time word"], ["、", "a breath"], ["日本", "Japan"], ["へ", "destination marker"], ["行こう", "the volitional — the intention itself"], ["と思っています。", "THE POINT — quoting your own plan: it's been on your mind", 1]], "hl": "買おう", "note": "買う → 買おう before the quote — the volitional machinery from last lesson, in its day job.", "wr": [{"t": "と思います = deciding this second; と思っています = carrying the plan already. The ています is doing its usual state-work on your own head.", "jp": null}], "drill": {"items": [{"q": "行く → 来年、日本へ___と思っています。", "en": "Thinking of going next year.", "a": ["行こう", "いこう"], "why": "Volitional before the quoting と."}, {"q": "買う → 新しい車を___と思っています。", "en": "Been thinking I'll buy one.", "a": ["買おう", "かおう"], "why": "う → おう: 買おう."}, {"q": "勉強する → もっと___と思っています。", "en": "Planning to study more.", "a": ["勉強しよう", "べんきょうしよう"], "why": "する → しよう + と思っています."}, {"q": "日本へ行こうと___います。", "en": "The plan's been on my mind — close it.", "a": ["思って"], "opts": ["思って", "思い", "思う", "思った"], "why": "と思っています — the carried plan."}, {"q": "と思っています means the plan ___.", "a": ["has been on your mind a while"], "opts": ["has been on your mind a while", "was decided this second", "belongs to someone else"], "why": "The ています marks the standing state of intending."}]}},
  "kotonisuru": {"seg": [["日本", "Japan"], ["へ", "destination marker"], ["行く", "\"go\" — plain form"], ["ことにしました。", "THE POINT — こと + にする: the choice, performed — and it was YOURS", 1]], "hl": "吸わないことにしました", "note": "Deciding not to: the ない form goes inside, the machinery outside stays identical.", "wr": [{"t": "ことにしている — with ている — is a decision renewed daily, a personal rule: 毎朝散歩することにしています.", "jp": null}], "drill": {"items": [{"q": "日本へ行く___しました。", "en": "I've decided to go.", "a": ["ことに"], "opts": ["ことに", "ことが", "ように", "ことを"], "why": "Decision performed → ことにする."}, {"q": "たばこを___ことにしました。", "en": "Decided to QUIT.", "a": ["吸わない"], "opts": ["吸わない", "吸う", "吸って", "吸った"], "why": "The negative decision lives inside: 吸わないことにする."}, {"q": "毎朝散歩すること___います。", "en": "I make it a RULE — ongoing.", "a": ["にして"], "opts": ["にして", "になって", "にし", "がして"], "why": "ことにしている — the standing personal rule."}, {"q": "買う → 車を___ことにしました。", "en": "Decided to buy — type the plain form.", "a": ["買う", "かう"], "why": "Plain form before ことにする."}, {"q": "ことにする marks ___.", "a": ["your own choosing"], "opts": ["your own choosing", "someone else's decision", "a schedule entry"], "why": "Agency → する. The next lesson takes the other side."}]}},
  "kotoninaru": {"seg": [["来月", "next month"], ["、", "a breath"], ["東京", "Tokyo"], ["へ", "destination marker"], ["行く", "\"go\" — plain form"], ["ことになりました。", "THE POINT — こと + になる: it came about — decided above your head (or framed that way)", 1]], "hl": "ことになりました", "note": "The standard wedding announcement — and nobody hears an arranged marriage in it. Modesty wears なる.", "wr": [{"t": "ことになっている is the standing arrangement: ここでは靴を脱ぐことになっています — that's just how it is here. Rules love this form.", "jp": "ここでは靴を脱ぐことになっています。", "en": "Shoes off here — the arrangement, stated.", "hl": "ことになっています"}], "drill": {"items": [{"q": "来月、東京へ行く___なりました。", "en": "It's been decided — I'm transferring.", "a": ["ことに"], "opts": ["ことに", "ように", "ことが", "のに"], "why": "Decided by circumstances → ことになる."}, {"q": "結婚する___になりました。", "en": "The standard announcement.", "a": ["こと"], "opts": ["こと", "よう", "の", "もの"], "why": "ことになりました — chosen, but worn modestly."}, {"q": "ここでは靴を脱ぐことになって___。", "en": "The standing rule — close it.", "a": ["います"], "opts": ["います", "あります", "します", "なります"], "why": "ことになっている — arrangement as a state."}, {"q": "自分で決めた (you chose it yourself): ___", "en": "Which machine claims the choice?", "a": ["ことにしました"], "opts": ["ことにしました", "ことになりました", "予定でした"], "why": "Your hand on the wheel → する."}, {"q": "Hearing ことになりました, assume ___.", "a": ["somebody may just be being modest"], "opts": ["somebody may just be being modest", "nobody chose anything", "a machine decided"], "why": "Culture bends the grammar — なる can dress a chosen thing."}]}},
  "yotei": {"seg": [["明日", "tomorrow — bare"], ["、", "a breath"], ["京都", "Kyoto"], ["へ", "destination marker"], ["行く", "\"go\" — plain form"], ["予定です。", "THE POINT — 予定: the calendar's word — booked, neutral, factual", 1]], "hl": "予定", "wr": [{"t": "つもり lives in your chest; 予定 lives in the calendar. Both can be true of one trip — report whichever you mean.", "jp": null}], "drill": {"items": [{"q": "明日、京都へ行く___です。", "en": "Scheduled — it's in the book.", "a": ["予定"], "opts": ["予定", "つもり", "こと", "はず"], "why": "Datebook-flavored → 予定."}, {"q": "会議は三時に始まる___です。", "en": "The meeting is SET to start at three.", "a": ["予定"], "opts": ["予定", "つもり", "そう", "ため"], "why": "An arrangement, not an intention → 予定."}, {"q": "夏に国へ帰る___です。", "en": "I INTEND to — it's in my chest, not the calendar.", "a": ["つもり"], "opts": ["つもり", "予定", "こと", "はず"], "why": "Personal intention → つもり (Step 6, still alive)."}, {"q": "来週帰る → the neutral, booked version: ___", "a": ["来週帰る予定です"], "opts": ["来週帰る予定です", "来週帰るつもりです", "来週帰ることにしました"], "why": "予定 states the schedule without drama."}, {"q": "予定 reports ___.", "a": ["what's booked"], "opts": ["what's booked", "what you yearn for", "what came about"], "why": "The calendar's voice."}]}},
  "youninaru": {"seg": [["日本語", "Japanese"], ["が", "the able-to thing keeps its が"], ["話せる", "\"can speak\" — the potential, from Step 10"], ["ようになりました。", "THE POINT — ようになる: the line was crossed; the change ARRIVED", 1]], "hl": "起きるようになりました", "note": "Not one early morning — a new normal. ようになる reports arrivals, not events.", "wr": [{"t": "The reverse change is 〜なくなる: 食べなくなりました — stopped eating it. Arrival works in both directions.", "jp": null}], "drill": {"items": [{"q": "日本語が話せる___なりました。", "en": "I've become able to speak.", "a": ["ように"], "opts": ["ように", "ことに", "そうに", "ために"], "why": "Change arriving → ようになる."}, {"q": "毎朝早く起きる___なりました。", "en": "The habit arrived.", "a": ["ように"], "opts": ["ように", "ことに", "ままに", "ばかりに"], "why": "New normal → ようになる."}, {"q": "妹は野菜を食べ___なりました。", "en": "She STOPPED eating them — the reverse.", "a": ["なく"], "opts": ["なく", "ないように", "ずに", "なくて"], "why": "〜なくなる — arrival of an absence."}, {"q": "読める → 漢字が___ようになりました。", "en": "Type the potential that goes inside.", "a": ["読める", "よめる"], "why": "Potential + ようになる — the app's favorite sentence."}, {"q": "ようになる reports ___.", "a": ["an arrival — a new normal"], "opts": ["an arrival — a new normal", "a single event", "an intention"], "why": "One morning is 起きました; a changed life is 起きるようになりました."}]}},
  "younisuru": {"seg": [["毎日", "every day"], ["日本語", "Japanese"], ["を", "object marker"], ["話す", "\"speak\" — plain form"], ["ようにしています。", "THE POINT — ようにする: the standing effort — steering, not yet arrived", 1]], "hl": "吸わないようにしています", "note": "Avoidance steers the same wheel: ない form + ようにしています.", "wr": [{"t": "The full arc of a habit: 早く起きるようにしています (the effort) → 早く起きるようになりました (the arrival). Two lessons, one life.", "jp": null}], "drill": {"items": [{"q": "毎日日本語を話す___しています。", "en": "I make a point of it.", "a": ["ように"], "opts": ["ように", "ことに", "そうに", "ために"], "why": "Standing effort → ようにする."}, {"q": "たばこを___ようにしています。", "en": "Trying to keep OFF them.", "a": ["吸わない"], "opts": ["吸わない", "吸う", "吸って", "吸った"], "why": "Avoidance: ない form inside, ようにする outside."}, {"q": "早く寝る___します。", "en": "I'll try to — the resolution.", "a": ["ように"], "opts": ["ように", "ことに", "予定に", "ために"], "why": "Steering toward the habit → ようにする."}, {"q": "The habit's full arc, effort then arrival: 早く起きるように ___.", "en": "Pick the pair, effort → arrival.", "a": ["しています → なりました"], "opts": ["しています → なりました", "なりました → しています", "します → します"], "why": "する steers; なる reports the crossing."}, {"q": "ようにする is ___.", "a": ["deliberate steering"], "opts": ["deliberate steering", "the arrival itself", "a calendar entry"], "why": "Motion toward the habit — arrival is ようになる's news."}]}},
  "sb-suru-naru": {"drill": {"note": "One question sorts every item: who's driving — you (する), or the world (なる)? Step 9's 暖かくする／なる was rung one of this ladder.", "items": [{"q": "たばこをやめる。自分で決めた。→ 吸わない___しました。", "en": "You chose it.", "a": ["ことに"], "opts": ["ことに", "ように", "ことになり", "予定に"], "why": "Your decision → ことにする."}, {"q": "来月、東京へ行く___なりました。", "en": "The company decided.", "a": ["ことに"], "opts": ["ことに", "ように", "ことにし", "つもりに"], "why": "Decided above your head → ことになる."}, {"q": "毎日走る___しています。", "en": "The standing effort.", "a": ["ように"], "opts": ["ように", "ことに", "そうに", "ままに"], "why": "Steering a habit → ようにする. (ことにしています would mark it as a rule you decreed — close, but the effort-flavor is ようにする's.)"}, {"q": "漢字が読める___なりました。", "en": "The change arrived on its own schedule.", "a": ["ように"], "opts": ["ように", "ことに", "ために", "ばかりに"], "why": "Arrival of ability → ようになる."}, {"q": "部屋を暖かく___ください。", "en": "Rung one of the ladder — someone acts.", "a": ["して"], "opts": ["して", "なって", "し", "なり"], "why": "Step 9's する — the same axis, first floor."}, {"q": "結婚することになりました usually means ___.", "a": ["they chose, and are wearing it modestly"], "opts": ["they chose, and are wearing it modestly", "an arranged marriage", "a scheduling error"], "why": "Culture bends grammar: なる as humility, not passivity."}]}},
  "kotogadekiru": {"seg": [["日本語", "Japanese"], ["を", "object of the inner verb — を survives here, unlike with 話せる"], ["話す", "\"speak\" — plain form"], ["ことができます。", "THE POINT — こと + できる: ability in formal dress", 1]], "hl": "買うことができます", "note": "Sign-Japanese: tickets MAY BE purchased here. Announcements love this shape.", "wr": [{"t": "One ability machine per sentence: 話せることができる stacks two potentials into nonsense.", "jp": null}], "drill": {"items": [{"q": "日本語を話す___ができます。", "en": "Formal ability claim.", "a": ["こと"], "opts": ["こと", "の", "もの", "よう"], "why": "Plain verb + ことができる."}, {"q": "ここでチケットを買うことが___。", "en": "Sign on the machine — close it.", "a": ["できます"], "opts": ["できます", "あります", "します", "なります"], "why": "Ability lands on できる."}, {"q": "漢字を書くことが___。", "en": "I canNOT write kanji.", "a": ["できません"], "opts": ["できません", "ありません", "しません", "できました"], "why": "Negation on できる: できません."}, {"q": "The everyday, spoken version of 話すことができます: ___", "a": ["話せます"], "opts": ["話せます", "話せることができます", "話しできます"], "why": "The potential form — shorter, and it wins in speech."}, {"q": "泳ぐ → 海で泳ぐ___ができます。", "en": "Type the joint.", "a": ["こと"], "why": "Plain form + こと + ができる."}]}},
  "takotogaaru": {"seg": [["日本", "Japan"], ["へ", "destination marker"], ["行った", "\"went\" — plain PAST; the machine insists on it"], ["ことがあります。", "THE POINT — た + ことがある: it has happened in your life, at least once", 1]], "hl": "食べたことがありますか", "note": "The have-you-ever question — travel talk's favorite opener.", "wr": [{"t": "Ever versus then: 行ったことがある carries no date. If your sentence has a WHEN, use plain past — 去年行きました, never 去年行ったことがあります.", "jp": null}], "drill": {"items": [{"q": "日本へ___ことがあります。", "en": "I've BEEN — sometime, no date.", "a": ["行った"], "opts": ["行った", "行く", "行って", "行きます"], "why": "The experience machine takes plain past."}, {"q": "すしを食べたことが___か。", "en": "Have you ever…?", "a": ["あります"], "opts": ["あります", "います", "します", "できます"], "why": "ことがある — the ある carries the question."}, {"q": "京都へ行ったことが___。", "en": "Never been.", "a": ["ありません"], "opts": ["ありません", "いません", "しません", "ないです"], "why": "Never = the experience doesn't exist: ありません."}, {"q": "去年、日本へ___。", "en": "Went LAST YEAR — a dated trip.", "a": ["行きました"], "opts": ["行きました", "行ったことがあります", "行くことがあります"], "why": "A WHEN in the sentence → plain past, not the ever-machine."}, {"q": "会う → 田中さんに___ことがあります。", "en": "I've met him before — type it.", "a": ["会った", "あった"], "why": "会う → 会った + ことがある."}]}},
  "kotogaaru": {"seg": [["朝ごはん", "breakfast"], ["を", "object marker"], ["食べない", "\"don't eat\" — plain NON-past, negative"], ["ことがあります。", "THE POINT — non-past + ことがある: it sometimes happens", 1]], "hl": "働くことがあります", "note": "Sometimes-truths about your own routine — the honest exceptions.", "wr": [{"t": "One kana flips it: 食べたことがある (ever) / 食べることがある (sometimes). Tense before こと is the entire difference.", "jp": null}], "drill": {"items": [{"q": "朝ごはんを___ことがあります。", "en": "SOME mornings I skip.", "a": ["食べない"], "opts": ["食べない", "食べなかった", "食べて", "食べません"], "why": "Plain non-past inside → sometimes-happens."}, {"q": "日曜日も働く___があります。", "en": "Sometimes I work Sundays.", "a": ["こと"], "opts": ["こと", "の", "とき", "ため"], "why": "Non-past + ことがある."}, {"q": "すしを___ことがあります。", "en": "I HAVE eaten it — ever.", "a": ["食べた"], "opts": ["食べた", "食べる", "食べて", "食べます"], "why": "Ever → plain past. The tense picks the machine."}, {"q": "時々、映画を見に行く___があります。", "en": "Now and then.", "a": ["こと"], "opts": ["こと", "の", "はず", "つもり"], "why": "時々 + non-past ことがある — the honest exception."}, {"q": "食べることがある vs 食べたことがある: the difference is ___.", "a": ["the tense before こと"], "opts": ["the tense before こと", "the politeness level", "the particle after こと"], "why": "Non-past = sometimes; past = ever."}]}},
  "sugiru": {"seg": [["昨日", "yesterday"], ["は", "topic marker"], ["食べすぎました。", "THE POINT — stem + すぎる: past the right amount", 1]], "hl": "高すぎます", "note": "い-adjectives drop the い first: 高い → 高すぎる.", "wr": [{"t": "It chains with Step 13's regret: 食べすぎてしまいました — overate, alas — is practically one word in real life.", "jp": "テレビを見すぎてしまいました。", "en": "Watched too much TV — and regret it.", "hl": "見すぎてしまいました"}], "drill": {"items": [{"q": "昨日は食べ___ました。", "en": "Ate too much.", "a": ["すぎ"], "opts": ["すぎ", "そう", "やす", "にく"], "why": "Stem + すぎる → 食べすぎました."}, {"q": "この店は___すぎます。", "en": "高い — too expensive.", "a": ["高"], "opts": ["高", "高い", "高く", "高さ"], "why": "い-adjective drops its い before すぎる."}, {"q": "飲む → ゆうべ…いや、昨日___ました。", "en": "Drank too much — type it.", "a": ["飲みすぎ", "のみすぎ"], "why": "飲み + すぎ + ました."}, {"q": "静か___すぎます。", "en": "TOO quiet — な-adjective.", "a": ["（なにもなし）"], "opts": ["（なにもなし）", "な", "に", "の"], "why": "な-adjectives attach bare: 静かすぎる."}, {"q": "すぎる is ___.", "a": ["a judgment — too much FOR something"], "opts": ["a judgment — too much FOR something", "a neutral measurement", "always about food"], "why": "The standard lives in the speaker."}]}},
  "yasui-nikui": {"seg": [["この本", "this book"], ["は", "topic marker"], ["読みやすいです。", "THE POINT — stem + やすい: easy-to, built into the verb", 1]], "hl": "書きにくい", "note": "The dark twin: stem + にくい, hard-to. Both conjugate on as い-adjectives.", "wr": [{"t": "About the thing, not your skill: 読みにくい字 blames the handwriting. And this やすい is not 安い — same sound, unrelated word.", "jp": null}], "drill": {"items": [{"q": "この本は読み___です。", "en": "Easy to read.", "a": ["やすい"], "opts": ["やすい", "にくい", "すぎ", "そう"], "why": "Stem + やすい."}, {"q": "このペンは書き___です。", "en": "Hard to write with.", "a": ["にくい"], "opts": ["にくい", "やすい", "すぎ", "たい"], "why": "Stem + にくい."}, {"q": "田中さんの話はわかり___です。", "en": "Easy to follow.", "a": ["やすい"], "opts": ["やすい", "にくい", "すぎ", "らしい"], "why": "わかり + やすい — the reviewer's favorite compliment."}, {"q": "使う → この機械は___です。", "en": "Hard to use — type it.", "a": ["使いにくい", "つかいにくい"], "why": "使い + にくい."}, {"q": "読みやすかったです is possible because the result is ___.", "a": ["an い-adjective"], "opts": ["an い-adjective", "a verb", "a noun"], "why": "The compound conjugates like 高い does — かった and all."}]}},
  "teiru3": {"seg": [["田中さん", "Tanaka"], ["は", "topic marker"], ["東京", "Tokyo"], ["に", "location of the resulting state"], ["行っています。", "THE POINT — change-verb + ている: the state AFTER the change. He's not traveling; he's THERE", 1]], "hl": "起きています", "note": "起きる is an instant — so ている is the awake-state after it, not a slow-motion rising.", "wr": [{"t": "The rule, finally statable: verbs naming an instant change wear ている as result (行っている, 知っている, 住んでいる); verbs naming an activity wear it as the middle (食べている, 読んでいる). Ask the verb which it is.", "jp": null}], "drill": {"items": [{"q": "田中さんは東京に行っています means ___.", "a": ["he's gone — and is there now"], "opts": ["he's gone — and is there now", "he's mid-journey", "he goes there often"], "why": "行く names an instant change; ている is the state after."}, {"q": "弟はもう___います。", "en": "He's UP — the state.", "a": ["起きて"], "opts": ["起きて", "起き", "起きる", "起きた"], "why": "起きて + いる — awake as a result."}, {"q": "今、昼ごはんを___います。", "en": "Mid-meal — a true middle.", "a": ["食べて"], "opts": ["食べて", "食べ", "食べる", "食べた"], "why": "食べる is an activity → in-progress ている."}, {"q": "結婚しています means ___.", "a": ["is married — the state"], "opts": ["is married — the state", "is at a wedding right now", "marries habitually"], "why": "結婚する is an instant change; the state persists."}, {"q": "When a ている surprises you, ask ___.", "a": ["what kind of verb it rides"], "opts": ["what kind of verb it rides", "how polite the sentence is", "where the topic marker went"], "why": "Instant change → result; activity → middle. The verb's nature decides."}]}},
  "aida": {"seg": [["寝ている", "\"sleeping\" — the span, held open with ている"], ["間に", "THE POINT — 間 + に: at a point INSIDE the span (without に, the whole stretch)", 1], ["、", "a breath"], ["電話", "a phone call"], ["が", "subject marker"], ["ありました。", "\"there was\" — one event, landing once"]], "hl": "の間", "note": "Nouns join with の — and no に here means the working filled the WHOLE break.", "wr": [{"t": "The main verb must agree: one-shot events take 間に; span-filling actions take bare 間. The に is a promise about how the verb behaves.", "jp": null}], "drill": {"items": [{"q": "寝ている___、電話がありました。", "en": "One call, somewhere inside the sleeping.", "a": ["間に"], "opts": ["間に", "間", "までに", "ところに"], "why": "A point inside the span → 間に."}, {"q": "夏休みの___、毎日働きました。", "en": "All through the break.", "a": ["間"], "opts": ["間", "間に", "までに", "まで"], "why": "The action fills the whole span → bare 間."}, {"q": "授業の___、静かにしてください。", "en": "For the whole class.", "a": ["間"], "opts": ["間", "間に", "とき", "までに"], "why": "Continuous quiet → 間 without に."}, {"q": "夏休みの___、京都へ行きました。", "en": "At some point during the break.", "a": ["間に"], "opts": ["間に", "間", "まで", "ながら"], "why": "One trip, inside the span → 間に."}, {"q": "The に in 間に promises ___.", "a": ["a one-shot event inside the span"], "opts": ["a one-shot event inside the span", "extra politeness", "a longer span"], "why": "Without に, the verb must fill the whole stretch."}]}},
  "madeni": {"seg": [["五時", "five o'clock — the deadline"], ["までに", "THE POINT — までに: BY then, done at or before", 1], ["帰ります。", "\"go home\" — a one-shot completion"]], "hl": "まで", "note": "Without the に: working UNTIL five — the state holds right up to the line.", "wr": [{"t": "The verb-test never fails: continues to the time → まで; completes by the time → までに.", "jp": null}], "drill": {"items": [{"q": "五時___帰ります。", "en": "Home BY five.", "a": ["までに"], "opts": ["までに", "まで", "から", "ごろに"], "why": "A completion with a deadline → までに."}, {"q": "五時___働きます。", "en": "Working UNTIL five.", "a": ["まで"], "opts": ["まで", "までに", "から", "ごろ"], "why": "A continuing state → まで."}, {"q": "明日___レポートを書いてください。", "en": "Report due tomorrow.", "a": ["までに"], "opts": ["までに", "まで", "から", "の間"], "why": "Deadline → までに."}, {"q": "三時___会議があります。", "en": "The meeting runs to three.", "a": ["まで"], "opts": ["まで", "までに", "間に", "から"], "why": "The meeting continues → まで."}, {"q": "書く → 金曜日までに___。", "en": "\"I'll write it by Friday\" — type the verb, polite.", "a": ["書きます", "かきます"], "why": "までに + the completing act."}]}},
  "tokoro": {"seg": [["今", "now — this form's favorite word"], ["、", "a breath"], ["家", "the house"], ["を", "を with 出る — leaving a place takes を"], ["出るところです。", "THE POINT — plain non-past + ところ: on the verge, caught at the doorway", 1]], "hl": "食べているところ", "note": "ている + ところ — caught mid-act. The three tenses of ところ are three freeze-frames.", "wr": [{"t": "たところ is strictly this-instant; たばかり (next) stretches with felt recency. 今帰ってきたところ can only be now; 先月来たばかり can be a month old.", "jp": null}], "drill": {"items": [{"q": "今、家を出る___です。", "en": "JUST about to leave.", "a": ["ところ"], "opts": ["ところ", "ばかり", "こと", "つもり"], "why": "Non-past + ところ = on the verge."}, {"q": "今、昼ごはんを___ところです。", "en": "Caught mid-lunch.", "a": ["食べている"], "opts": ["食べている", "食べる", "食べた", "食べて"], "why": "ている + ところ = the middle of the act."}, {"q": "今、___ところです。", "en": "帰ってくる — just this minute got back.", "a": ["帰ってきた", "かえってきた"], "opts": ["帰ってきた", "帰ってくる", "帰ってきて", "帰ってきている"], "why": "Plain past + ところ = fresh off it."}, {"q": "電話: 「今、出る___です」", "en": "The phone-answer sentence — heading out the door.", "a": ["ところ"], "opts": ["ところ", "ばかり", "はず", "こと"], "why": "The doorway freeze-frame."}, {"q": "The three ところs are ___.", "a": ["about to / in the middle / just did"], "opts": ["about to / in the middle / just did", "past / present / future", "polite / plain / casual"], "why": "Three freeze-frames of one action — tense picks the frame."}]}},
  "bakari": {"seg": [["先月", "last month — a real calendar distance"], ["、", "a breath"], ["日本", "Japan"], ["に", "destination"], ["来たばかりです。", "THE POINT — plain past + ばかり: just arrived, by the clock of feeling", 1]], "hl": "始めたばかり", "note": "The learner's shield: I've only just started — so be patient with me.", "wr": [{"t": "ばかり is elastic where ところ is strict: a month can still be ばかり if it feels fresh. Claiming 先月来たところ, though, would be false — the instant is long gone.", "jp": null}], "drill": {"items": [{"q": "先月、日本に来た___です。", "en": "Only just arrived — by feel.", "a": ["ばかり"], "opts": ["ばかり", "ところ", "こと", "はず"], "why": "A month old but felt-fresh → ばかり. ところ would claim this instant."}, {"q": "日本語を___ばかりです。", "en": "I've only just started.", "a": ["始めた", "はじめた"], "opts": ["始めた", "始める", "始めて", "始めます"], "why": "Plain past + ばかり."}, {"q": "さっき食べた___です。", "en": "I literally just ate.", "a": ["ばかり"], "opts": ["ばかり", "ところ", "こと", "まで"], "why": "Recency as excuse → ばかり (ところ would also work here — さっき is fresh enough for both)."}, {"q": "今、帰ってきた___です。", "en": "THIS instant — strict.", "a": ["ところ"], "opts": ["ところ", "ばかり", "こと", "予定"], "why": "今 pins it to the instant — ところ's home ground."}, {"q": "ばかり measures recency by ___.", "a": ["how fresh it feels"], "opts": ["how fresh it feels", "the calendar only", "politeness level"], "why": "Subjective clock — the elasticity is the point."}]}},
  "naide": {"seg": [["朝ごはん", "breakfast"], ["を", "object marker"], ["食べないで", "THE POINT — ない + で: without doing — the missing accompaniment", 1], ["学校", "school"], ["へ", "destination marker"], ["行きました。", "\"went\" — the main act, minus its usual companion"]], "hl": "見ないで", "note": "The brave version: writing kanji without looking. ないで marks what DIDN'T come along.", "wr": [{"t": "Written Japanese swaps in 〜ずに: 食べずに. Same meaning, formal dress — recognize it now, produce it later.", "jp": null}], "drill": {"items": [{"q": "朝ごはんを___学校へ行きました。", "en": "Went without eating.", "a": ["食べないで"], "opts": ["食べないで", "食べなくて", "食べずで", "食べません"], "why": "Manner-without → ないで. なくて would give a reason instead."}, {"q": "何も___漢字を書きました。", "en": "Wrote without looking at anything.", "a": ["見ないで"], "opts": ["見ないで", "見なくて", "見ずで", "見ないと"], "why": "見ない + で — the skipped companion."}, {"q": "___勉強しました。", "en": "Studied without sleeping.", "a": ["寝ないで"], "opts": ["寝ないで", "寝なくて", "寝ずで", "寝ないので"], "why": "寝ない + で."}, {"q": "The formal written twin of ないで is ___.", "a": ["〜ずに"], "opts": ["〜ずに", "〜なくて", "〜ないと"], "why": "食べずに — same meaning, formal register."}, {"q": "Without-doing rides ___ (because-not rides なくて).", "a": ["ないで"], "opts": ["ないで", "なくて", "ずで"], "why": "ないで is manner — the skipped companion; なくて hands over a reason."}]}},
  "sb-madeni": {"drill": {"note": "Run the verb-test on every item: still happening at that time → まで; finished by it → までに.", "items": [{"q": "三時___会議があります。", "en": "Runs until three.", "a": ["まで"], "opts": ["まで", "までに", "間に", "から"], "why": "Continuing → まで."}, {"q": "三時___レポートを出します。", "en": "Lands by three.", "a": ["までに"], "opts": ["までに", "まで", "間", "ごろ"], "why": "Completion → までに."}, {"q": "九時___寝ます。", "en": "I'll be asleep BY nine.", "a": ["までに"], "opts": ["までに", "まで", "から", "の間"], "why": "Falling asleep completes → までに."}, {"q": "九時___勉強します。", "en": "Studying UNTIL nine.", "a": ["まで"], "opts": ["まで", "までに", "間に", "ごろに"], "why": "Studying continues → まで."}, {"q": "金曜日___お金を払ってください。", "en": "Payment due Friday.", "a": ["までに"], "opts": ["までに", "まで", "から", "とき"], "why": "One payment, deadline → までに."}, {"q": "The verb-test asks: ___", "a": ["does it continue, or complete?"], "opts": ["does it continue, or complete?", "is it polite enough?", "is the time exact?"], "why": "Continue → まで; complete → までに. Every time."}]}},
  "saseru": {"seg": [["母", "Mom — the will behind the act"], ["は", "topic marker"], ["弟", "my brother — the one caused"], ["に", "the caused person takes に (a を-object follows)"], ["野菜", "vegetables"], ["を", "object marker"], ["食べさせました。", "THE POINT — the causative: made (or let) him eat", 1]], "hl": "遊ばせました", "note": "The letting side of the same form — permission and coercion share machinery; context arbitrates.", "wr": [{"t": "The everyday gold: 〜させてください — \"please let me.\" 帰らせてください asks a favor with the causative's own grammar.", "jp": "すみません、今日は早く帰らせてください。", "en": "Please let me leave early — the causative, hat in hand.", "hl": "帰らせてください"}], "drill": {"pool": true, "note": "Build the causative: あ-row + せる for う-verbs, させる for る-verbs.", "items": [{"q": "食べる → 弟に野菜を___ました。", "en": "Made him eat them.", "a": ["食べさせ", "たべさせ"], "why": "る-verb → させる."}, {"q": "行く → 子どもを学校へ___ました。", "en": "Sent (made go).", "a": ["行かせ", "いかせ"], "why": "く → か + せる."}, {"q": "飲む → 薬を___ました。", "en": "Made (them) take the medicine.", "a": ["飲ませ", "のませ"], "why": "む → ま + せる."}, {"q": "遊ぶ → 公園で___ました。", "en": "Let them play.", "a": ["遊ばせ", "あそばせ"], "why": "ぶ → ば + せる — same form, kinder force."}, {"q": "する → 宿題を___ました。", "en": "Made them do homework.", "a": ["させ"], "why": "する → させる."}, {"q": "帰る → すみません、早く___てください。", "en": "Please LET me go home early.", "a": ["帰らせ", "かえらせ"], "why": "帰らせて + ください — the causative favor-ask."}]}},
  "saserareru": {"seg": [["母", "Mom — the maker"], ["に", "the maker takes に in the causative-passive"], ["野菜", "vegetables"], ["を", "object marker"], ["食べさせられました。", "THE POINT — causative then passive: made-to, felt keenly", 1]], "hl": "掃除させられました", "note": "する-verbs stack the same way: 掃除させる → 掃除させられる.", "wr": [{"t": "Two moves, strict order: causative first (食べさせる), passive second (させられる). Speech contracts う-verbs — 飲まされる, 行かされる — recognize the short forms, build the long ones.", "jp": null}], "drill": {"items": [{"q": "母に野菜を___られました。", "en": "Was made to eat them.", "a": ["食べさせ", "たべさせ"], "opts": ["食べさせ", "食べられ", "食べさせられ", "食べさし"], "why": "The causative goes first; られました closes it."}, {"q": "母に部屋を掃除___ました。", "en": "Got made to clean.", "a": ["させられ"], "opts": ["させられ", "されられ", "させ", "られ"], "why": "する → させる → させられる."}, {"q": "会議で歌を___。", "en": "They made me sing (full form, polite past).", "a": ["歌わせられました", "うたわせられました", "歌わされました", "うたわされました"], "why": "歌う → 歌わせる → 歌わせられる (speech: 歌わされる)."}, {"q": "The build order is ___.", "a": ["causative first, then passive"], "opts": ["causative first, then passive", "passive first, then causative", "either order"], "why": "食べさせる → 食べさせられる. Jumping straight to the end is where it breaks."}, {"q": "In 母に食べさせられた, the に marks ___.", "a": ["the maker"], "opts": ["the maker", "the destination", "the time"], "why": "Same に as the passive's doer — the one whose will won."}]}},
  "meirei": {"seg": [["がんばれ！", "THE POINT — the bare imperative: え-row command. Cheering suspends the rudeness entirely", 1]], "hl": "入るな", "note": "The mirror: dictionary form + な — the sign's don't.", "wr": [{"t": "Production is rare; recognition is constant — signs, sports, fiction. Anime characters bark 命令形 at each other for dramatic reasons that do not apply to your office.", "jp": null}], "drill": {"items": [{"q": "行く → the bare command: ___！", "a": ["行け", "いけ"], "opts": ["行け", "行こう", "行って", "行きなさい"], "why": "え-row: 行け. (行こう proposes; 行け orders.)"}, {"q": "食べる → the bare command: ___！", "a": ["食べろ", "たべろ"], "opts": ["食べろ", "食べよう", "食べて", "食べれ"], "why": "る-verb → ろ."}, {"q": "ここに___な。", "en": "KEEP OUT — the sign.", "a": ["入る", "はいる"], "opts": ["入る", "入れ", "入って", "入り"], "why": "Prohibitive = dictionary form + な."}, {"q": "する → ___！", "en": "Do it! — fiction only, please.", "a": ["しろ"], "opts": ["しろ", "しよう", "して", "せよ"], "why": "する → しろ (せよ exists in writing — recognize, don't reach for it)."}, {"q": "The one imperative you'll actually say: ___", "a": ["がんばれ"], "opts": ["がんばれ", "早くしろ", "入るな"], "why": "Cheering is the imperative's safe habitat."}]}},
  "nasai": {"seg": [["早く", "\"quickly / early\" — the adverb from 早い"], ["寝なさい。", "THE POINT — stem + なさい: the parent's imperative, downward only", 1]], "hl": "食べなさい", "note": "Every dinner table, every night — なさい is domestic weather.", "wr": [{"t": "Exams speak it too: 答えなさい. From a worksheet it's neutral instruction; from you to a colleague it's parenting them. Downward only.", "jp": null}], "drill": {"items": [{"q": "寝る → 早く___。", "en": "Go to bed — parent voice.", "a": ["寝なさい", "ねなさい"], "why": "Stem 寝 + なさい."}, {"q": "食べる → 野菜も___。", "en": "Eat your vegetables too.", "a": ["食べなさい", "たべなさい"], "why": "Stem + なさい."}, {"q": "答える → よく読んで、___。", "en": "The exam's voice.", "a": ["答えなさい", "こたえなさい"], "why": "答え + なさい — worksheet register."}, {"q": "なさい may travel ___.", "a": ["downward only"], "opts": ["downward only", "in any direction", "upward, politely"], "why": "Parent→child, teacher→student, exam→you. Never at a colleague."}, {"q": "To a colleague, the request form is ___.", "a": ["てください"], "opts": ["てください", "なさい", "命令形"], "why": "Adults ask adults — Step 5's machinery remains the daily driver."}]}},
  "sb-rareru": {"drill": {"note": "One shape, three readings — potential, passive, honorific (that one waits in Stage 3). Particles and context arbitrate; run the check every time.", "items": [{"q": "ここから山が___ます。", "en": "The mountain CAN BE SEEN — potential.", "a": ["見られ", "みられ"], "opts": ["見られ", "見させ", "見せ", "見え"], "why": "Potential られる, thing marked が. (見える exists too — a later nuance.)"}, {"q": "先生に___ました。", "en": "I WAS SEEN — passive, guilt included.", "a": ["見られ", "みられ"], "opts": ["見られ", "見させ", "見せられ", "見え"], "why": "Same shape — the に-marked doer says passive."}, {"q": "見られる could be potential or passive. What arbitrates? ___", "a": ["particles and context"], "opts": ["particles and context", "politeness level", "word order alone"], "why": "が + thing → potential; に + doer → passive."}, {"q": "ら抜き (見れる, 食べれる) is ___.", "a": ["common speech, marked in formal writing"], "opts": ["common speech, marked in formal writing", "always wrong", "the formal standard"], "why": "Speech's own fix for the collision — recognize it, write the full form."}, {"q": "読む escapes the collision because ___.", "a": ["its potential (読める) and passive (読まれる) differ"], "opts": ["its potential (読める) and passive (読まれる) differ", "it has no passive", "it has no potential"], "why": "う-verbs split the two shapes; only る-verbs collide fully."}]}},
  "shi": {"seg": [["安いし", "\"cheap, and…\" — the first stacked reason"], ["、", "a breath"], ["おいしいし", "THE POINT — し: another reason, with more implied beyond it", 1], ["、", "a breath"], ["あの店", "that shop"], ["が", "subject marker"], ["いいですよ。", "the conclusion the reasons were building toward"]], "hl": "だし", "note": "Nouns and な-adjectives bring だ before し: 雨だし.", "wr": [{"t": "から names THE reason; し offers reasons-among-others, list deliberately unfinished. Even a single し carries that \"and more\" flavor.", "jp": null}], "drill": {"items": [{"q": "安い___、おいしいし、あの店がいいですよ。", "en": "Cheap, and tasty, and…", "a": ["し"], "opts": ["し", "から", "ので", "が"], "why": "Stacked reasons → し."}, {"q": "今日は雨___、家にいましょう。", "en": "It's raining (among other things)…", "a": ["だし"], "opts": ["だし", "し", "から", "なので"], "why": "Nouns take だ before し: 雨だし."}, {"q": "時間もない___、また今度。", "en": "No time, and so on — next time.", "a": ["し"], "opts": ["し", "が", "まで", "けど"], "why": "The trailing し carries the unspoken rest of the list."}, {"q": "静か___、この図書館が好きです。", "en": "Quiet, among other virtues.", "a": ["だし"], "opts": ["だし", "し", "なし", "のに"], "why": "な-adjective + だ + し."}, {"q": "し differs from から because し ___.", "a": ["implies more reasons beyond the ones named"], "opts": ["implies more reasons beyond the ones named", "is more formal", "only works with adjectives"], "why": "The unfinished list is the point."}]}},
  "noni": {"seg": [["勉強した", "\"studied\" — plain past; the effort"], ["のに", "THE POINT — のに: and yet — expectation betrayed, sting included", 1], ["、", "a breath"], ["忘れてしまいました。", "\"forgot, alas\" — Step 13's regret stacking onto the ache"]], "hl": "なのに", "note": "Nouns take な before のに: 日曜日なのに — it's SUNDAY, and yet.", "wr": [{"t": "The trailing のに is reproach distilled: せっかく作ったのに… — after I went to the trouble… The sentence doesn't need finishing; the ache is complete.", "jp": null}], "drill": {"items": [{"q": "勉強した___、忘れてしまいました。", "en": "Studied — AND YET.", "a": ["のに"], "opts": ["のに", "ので", "から", "けど"], "why": "Betrayed expectation with feeling → のに. けど would state it cool."}, {"q": "日曜日___、働いています。", "en": "It's SUNDAY, and yet…", "a": ["なのに"], "opts": ["なのに", "のに", "だのに", "でも"], "why": "Nouns take な before のに."}, {"q": "高かった___、おいしくなかったです。", "en": "After what I paid — not even good.", "a": ["のに"], "opts": ["のに", "ので", "し", "たら"], "why": "The felt contrast → のに."}, {"q": "Neutral contrast, no ache: 高いです___、買います。", "en": "Just stating it.", "a": ["が"], "opts": ["が", "のに", "し", "ので"], "why": "Cool contrast is が/けど territory — のに here would sulk."}, {"q": "のに carries ___.", "a": ["feeling — expectation betrayed"], "opts": ["feeling — expectation betrayed", "a neutral contrast", "a stacked reason"], "why": "けど states; のに aches."}]}},
  "temo": {"seg": [["雨", "rain"], ["が", "subject marker"], ["降っても", "THE POINT — て-form + も: even if — conceded, and overridden", 1], ["、", "a breath"], ["行きます。", "\"I'm going\" — the spine of the sentence"]], "hl": "高くても", "note": "い-adjectives: くても. Nouns and な-adjectives: でも — 雨でも行きます.", "wr": [{"t": "たら cancels, ても overrides: 降ったら行きません / 降っても行きます — same rain, opposite spines. And Step 5's てもいいですか was this ても all along.", "jp": null}], "drill": {"items": [{"q": "雨が___、行きます。", "en": "Even if it rains — going.", "a": ["降っても"], "opts": ["降っても", "降ったら", "降ると", "降れば"], "why": "Concede and continue → ても."}, {"q": "___、買います。", "en": "高い — even if pricey.", "a": ["高くても"], "opts": ["高くても", "高いでも", "高くたら", "高ければ"], "why": "い-adjective → くても."}, {"q": "いくら___、忘れます。", "en": "No matter how much I study…", "a": ["勉強しても", "べんきょうしても"], "opts": ["勉強しても", "勉強したら", "勉強すると", "勉強すれば"], "why": "いくら〜ても — the universal concession."}, {"q": "雨___、行きます。", "en": "Even if it's rain (noun) — going.", "a": ["でも"], "opts": ["でも", "ても", "なのに", "だし"], "why": "Nouns take でも."}, {"q": "降ったら行きません vs 降っても行きます: ___", "a": ["たら cancels; ても overrides"], "opts": ["たら cancels; ても overrides", "both cancel", "both override"], "why": "Same rain, opposite spines."}]}},
  "sorede": {"seg": [["雨が降りました。", "\"It rained.\" — a full sentence, full stop"], ["それで、", "THE POINT — それで: and so — the consequence joint", 1], ["家にいました。", "\"stayed home\" — the result"]], "hl": "それに", "note": "The piling-on joint: cheap — and on top of that, good.", "wr": [{"t": "だから opening a reply can sound like \"like I SAID.\" And bare それで？ with rising pitch is the listener's nudge — \"…and then?\" Half of storytelling is the audience saying it.", "jp": null}], "drill": {"items": [{"q": "雨が降りました。___、家にいました。", "en": "It rained. AND SO…", "a": ["それで"], "opts": ["それで", "それに", "でも", "それから"], "why": "Consequence → それで."}, {"q": "この店は安いです。___、おいしいです。", "en": "Cheap. AND ON TOP OF THAT…", "a": ["それに"], "opts": ["それに", "それで", "だから", "でも"], "why": "Addition → それに."}, {"q": "明日は会議です。___、早く寝ます。", "en": "Meeting tomorrow. THAT'S WHY…", "a": ["だから"], "opts": ["だから", "それに", "でも", "それから"], "why": "The blunt conclusion → だから."}, {"q": "朝ごはんを食べました。___、学校へ行きました。", "en": "Ate. THEN went — plain sequence.", "a": ["それから"], "opts": ["それから", "それで", "だから", "それに"], "why": "Sequence without causation → それから (Step 11's joint, still working)."}, {"q": "それで？, rising, means ___.", "a": ["\"…and then?\" — the listener's nudge"], "opts": ["\"…and then?\" — the listener's nudge", "\"that's why\"", "\"on top of that\""], "why": "The audience's half of every story."}]}},
  "sb-noni": {"drill": {"note": "Three temperatures for one contrast: が/けど (cool), ても (determined), のに (felt). The facts don't choose — you do.", "items": [{"q": "高いです___、買います。", "en": "COOL: noted, buying anyway.", "a": ["が"], "opts": ["が", "のに", "ても", "し"], "why": "Neutral statement of contrast → が."}, {"q": "高く___、買います。", "en": "DETERMINED: price be damned.", "a": ["ても"], "opts": ["ても", "のに", "が", "たら"], "why": "Concede and override → ても."}, {"q": "高かった___、壊れました。", "en": "FELT: after what I paid — it broke.", "a": ["のに"], "opts": ["のに", "が", "ても", "から"], "why": "Betrayal with feeling → のに."}, {"q": "雨が降っています___、試合があります。", "en": "Flat report: raining, game's on.", "a": ["が"], "opts": ["が", "のに", "だから", "し"], "why": "No ache claimed → が."}, {"q": "せっかく作った___…。", "en": "The trailing reproach.", "a": ["のに"], "opts": ["のに", "ても", "けど", "から"], "why": "のに… left hanging — the ache completes itself."}, {"q": "When unsure of temperature, reach for ___.", "a": ["けど — never wrong, just cooler"], "opts": ["けど — never wrong, just cooler", "のに — maximum feeling", "だから — conclusive"], "why": "のに misspent reads as sulking; けど is the safe cool."}]}},
  "kadouka": {"seg": [["行く", "\"go\" — plain, as the box demands"], ["かどうか", "THE POINT — かどうか: the yes/no question, sealed and embedded", 1], ["、", "a breath"], ["まだ", "\"yet\" — Step 4's door-holder"], ["決めていません。", "\"haven't decided\" — the outer verb the box hands itself to"]], "hl": "かどうか", "wr": [{"t": "です drops inside the box: 学生かどうか, never 学生ですかどうか. Boxes take plain contents.", "jp": null}], "drill": {"items": [{"q": "行く___、まだ決めていません。", "en": "WHETHER I'll go — undecided.", "a": ["かどうか"], "opts": ["かどうか", "かとうか", "かどう", "などか"], "why": "Yes/no box → かどうか."}, {"q": "おいしい___、食べてみましょう。", "en": "Whether it's good — let's find out.", "a": ["かどうか"], "opts": ["かどうか", "かなにか", "かどうも", "そうか"], "why": "The box + てみる — question meets experiment."}, {"q": "田中さんが学生___どうか、わかりません。", "en": "Whether he's a student — pick the joint.", "a": ["か"], "opts": ["か", "ですか", "だか", "なか"], "why": "Plain inside the box: 学生かどうか."}, {"q": "来る → 田中さんが___かどうか、聞いてみます。", "en": "I'll ask whether he's coming — type it.", "a": ["来る", "くる"], "why": "Plain non-past inside the box."}, {"q": "The box needs no second か at sentence end because ___.", "a": ["the box carries its own"], "opts": ["the box carries its own", "embedded sentences ban questions", "です replaces it"], "why": "かどうか is the question, contained."}]}},
  "ka-embed": {"seg": [["誰", "\"who\" — the question word, staying in its slot"], ["が", "question words keep their が (Step 1's rule survives embedding)"], ["来る", "\"comes\" — plain form"], ["か", "THE POINT — か seals the open question into a box", 1], ["、", "a breath"], ["わかりません。", "\"I don't know\" — the outer verb"]], "hl": "か", "wr": [{"t": "Collision alert: 誰か alone = SOMEBODY (Step 11); 誰が来るか = a boxed question. The verb inside the box is the tell.", "jp": null}], "drill": {"items": [{"q": "誰が来る___、わかりません。", "en": "Who's coming — no idea.", "a": ["か"], "opts": ["か", "かどうか", "の", "こと"], "why": "Open question → 疑問詞…か. (かどうか is for yes/no boxes.)"}, {"q": "何を食べる___、決めましょう。", "en": "Let's decide what to eat.", "a": ["か"], "opts": ["か", "かどうか", "の", "と"], "why": "The open box: 何を食べるか."}, {"q": "どこで___か、忘れました。", "en": "Where I bought it — forgotten.", "a": ["買った", "かった"], "opts": ["買った", "買います", "買って", "買う"], "why": "Plain past inside the box — the buying already happened."}, {"q": "\"SOMEBODY came\" (not a question) is 誰___来ました。", "a": ["か"], "opts": ["か", "が", "は"], "why": "誰か = somebody (Step 11). 誰が来るか, with its own verb inside, is the boxed question."}, {"q": "行くかどうか vs どこへ行くか: the difference is ___.", "a": ["yes/no box vs open-question box"], "opts": ["yes/no box vs open-question box", "politeness", "tense"], "why": "かどうか seals yes/no; 疑問詞+か seals the open kind."}]}},
  "koto-no": {"seg": [["弟", "my brother"], ["が", "clause-internal subject — が, as Step 11 taught"], ["歌う", "\"sing\" — plain form"], ["のを", "THE POINT — の nominalizes the live, witnessed act; を hands it to the verb", 1], ["聞きました。", "\"heard\" — a sensing verb; の's home ground"]], "hl": "ことができます", "note": "The fixed house: ability always takes こと — no taste involved.", "wr": [{"t": "Where both fit (読むのが好き／読むことが好き), の runs warm and spoken, こと cool and written. Where the houses are fixed, there is no choice at all.", "jp": null}], "drill": {"items": [{"q": "弟が歌う___を聞きました。", "en": "Heard him singing — live.", "a": ["の"], "opts": ["の", "こと", "もの", "ところ"], "why": "Sensing verbs demand の."}, {"q": "日本語を話す___ができます。", "en": "Ability — the fixed house.", "a": ["こと"], "opts": ["こと", "の", "もの", "よう"], "why": "ことができる never takes の."}, {"q": "日本へ行った___があります。", "en": "Experience — the other fixed house.", "a": ["こと"], "opts": ["こと", "の", "とき", "ば"], "why": "たことがある — こと, always."}, {"q": "本を読む___が好きです。", "en": "Both fit — pick the warmer, spoken one.", "a": ["の"], "opts": ["の", "こと", "もの"], "why": "Taste territory: の for warmth (こと wouldn't be wrong)."}, {"q": "妹が泳ぐ___を見ました。", "en": "Watched her swim.", "a": ["の"], "opts": ["の", "こと", "ところ", "そう"], "why": "見る — sensing verb, live scene → の."}]}},
  "toiuimi": {"seg": [["すみません", "the opener that buys goodwill"], ["、", "a breath"], ["どういう", "\"what kind of\" — こそあど's ど-row, grown up"], ["意味", "meaning"], ["ですか。", "THE POINT — どういう意味ですか: the learner's power question", 1]], "hl": "という意味", "note": "The answer's shape: [expression]は[explanation]という意味です — Step 11's naming という, aimed at meanings.", "wr": [{"t": "Keep the two learner-questions straight: 何といいますか asks for the WORD; どういう意味ですか asks for the SENSE. One grows vocabulary forward, the other backward.", "jp": null}], "drill": {"items": [{"q": "すみません、どういう___ですか。", "en": "What does that mean?", "a": ["意味"], "opts": ["意味", "言葉", "話", "こと"], "why": "The power question: どういう意味ですか."}, {"q": "「直す」は「もう一度よくする」___意味です。", "en": "The answering shape.", "a": ["という"], "opts": ["という", "どういう", "といった", "そういう"], "why": "Explanation + という意味です."}, {"q": "You see a new WORD and want its name in Japanese: ___", "a": ["これは日本語で何といいますか"], "opts": ["これは日本語で何といいますか", "これはどういう意味ですか", "これはいくらですか"], "why": "Asking for the word → 何といいますか."}, {"q": "You hear a word and don't know its SENSE: ___", "a": ["どういう意味ですか"], "opts": ["どういう意味ですか", "何といいますか", "どこですか"], "why": "Asking for the meaning → どういう意味ですか."}, {"q": "この漢字はどういう意味です___。", "en": "Close the question.", "a": ["か"], "opts": ["か", "ね", "よ", "の"], "why": "A real question → か."}]}},
  "sb-kotono": {"drill": {"note": "Checks in order: fixed house? → こと. Sensing verb, live scene? → の. Neither? → taste (の warm, こと written). The houses are few — guard them.", "items": [{"q": "泳ぐ___ができます。", "en": "Fixed house.", "a": ["こと"], "opts": ["こと", "の", "もの", "よう"], "why": "ことができる — no taste involved."}, {"q": "妹が泳ぐ___を見ました。", "en": "Live, witnessed.", "a": ["の"], "opts": ["の", "こと", "ところ", "そう"], "why": "Sensing verb → の."}, {"q": "すしを食べた___があります。", "en": "Experience.", "a": ["こと"], "opts": ["こと", "の", "とき", "ため"], "why": "たことがある — the second fixed house."}, {"q": "映画を見る___が好きです。", "en": "Both fit — warm and spoken.", "a": ["の"], "opts": ["の", "こと", "もの"], "why": "Taste: の for conversation. こと acceptable, cooler."}, {"q": "話すのができます is wrong because ___.", "a": ["ことができる is a fixed house"], "opts": ["ことができる is a fixed house", "の is always casual", "話す can't nominalize"], "why": "The error that grates: の in こと's house."}, {"q": "弟が帰ってくる___を待っています。", "en": "Waiting for him to come home — live anticipation.", "a": ["の"], "opts": ["の", "こと", "ところ"], "why": "待つ leans sensing-live → の."}]}},
  "garu": {"seg": [["弟", "my brother — a mind that isn't yours"], ["は", "topic marker"], ["公園", "the park"], ["へ", "destination marker"], ["行きたがっています。", "THE POINT — たい minus い + がる: showing SIGNS of wanting, worn as ている", 1]], "hl": "食べたがりません", "note": "The negative observes an absence of signs — no visible wanting anywhere near those vegetables.", "wr": [{"t": "The particle shifts with the machinery: たい leaned が (水が飲みたい); たがる takes を (水を飲みたがっている). State became behavior; the grammar follows.", "jp": null}], "drill": {"items": [{"q": "弟は公園へ行き___います。", "en": "HE wants to go — visibly.", "a": ["たがって"], "opts": ["たがって", "たくて", "たいで", "たそうで"], "why": "Third person → たがる, worn as ている."}, {"q": "私は公園へ行き___です。", "en": "I want to go — my own mind.", "a": ["たい"], "opts": ["たい", "たがり", "たがる", "たそう"], "why": "First person keeps たい — the direct line is yours alone."}, {"q": "子どもは野菜を食べ___ません。", "en": "No visible wanting.", "a": ["たがり"], "opts": ["たがり", "たく", "たいで", "そうで"], "why": "たがる conjugates as an う-verb: たがりません."}, {"q": "妹は犬を飼い___います。", "en": "She's dying for a dog.", "a": ["たがって"], "opts": ["たがって", "たくて", "ほしくて", "たいと"], "why": "Her want, as signs → 飼いたがっています."}, {"q": "たい about a third person claims ___.", "a": ["telepathy"], "opts": ["telepathy", "politeness", "past tense"], "why": "がる claims observation — which is all you actually have."}]}},
  "hoshigaru": {"seg": [["妹", "my sister"], ["は", "topic marker"], ["新しい", "new"], ["かばん", "bag"], ["を", "THE PARTICLE TELL — ほしがる takes を where ほしい leaned が"], ["ほしがっています。", "THE POINT — ほしい minus い + がる: her wanting, as visible behavior", 1]], "hl": "ほしがります", "note": "Habitual observation: kids want everything, observably, daily.", "wr": [{"t": "The swap in one line: 私はかばんがほしい／妹はかばんをほしがっている. State keeps が; behavior takes を.", "jp": null}], "drill": {"items": [{"q": "妹は新しいかばん___ほしがっています。", "en": "Her want, observed.", "a": ["を"], "opts": ["を", "が", "は", "に"], "why": "Behavior-machinery takes を."}, {"q": "私は新しいかばん___ほしいです。", "en": "My want, direct.", "a": ["が"], "opts": ["が", "を", "は", "も"], "why": "The state keeps が (Step 6, unchanged)."}, {"q": "子どもは何でも___。", "en": "Kids want everything — observable, habitual.", "a": ["ほしがります"], "opts": ["ほしがります", "ほしいです", "ほしがっています", "ほしいます"], "why": "Habitual behavior → ほしがります. (ほしがっています would spotlight right now.)"}, {"q": "弟は新しいゲームを___います。", "en": "He's got his eye on it.", "a": ["ほしがって"], "opts": ["ほしがって", "ほしくて", "ほしいで", "ほしそうで"], "why": "ほしがっています — the standing display of wanting."}, {"q": "The particle swap (が→を) tracks ___.", "a": ["state becoming observed behavior"], "opts": ["state becoming observed behavior", "politeness rising", "past tense"], "why": "ほしい describes a state; ほしがる narrates conduct."}]}},
  "sb-minds": {"drill": {"note": "Four channels to another mind: signs (がる), looks (そう・よう), words (と言っています) — and the direct line, which is yours alone. Pick the honest channel every time.", "items": [{"q": "私は日本へ行き___です。", "en": "Your own want.", "a": ["たい"], "opts": ["たい", "たがい", "たがる", "たそう"], "why": "First person — the only unmarked mind."}, {"q": "弟は日本へ行き___います。", "en": "His want, from his behavior.", "a": ["たがって"], "opts": ["たがって", "たくて", "たいで", "ましょう"], "why": "Signs → たがる."}, {"q": "田中さんは行きたい___言っています。", "en": "His want, from his words.", "a": ["と"], "opts": ["と", "を", "か", "も"], "why": "Quoted → と言っています. Inside the quote, his たい is HIS first person."}, {"q": "妹は疲れている___です。", "en": "Her state, read from her face.", "a": ["よう"], "opts": ["よう", "たがる", "たい", "つもり"], "why": "Appearance → ようです (Step 15 was building this all along)."}, {"q": "行きたいですか。— why is たい fine here? ___", "a": ["you're asking for their first-person report"], "opts": ["you're asking for their first-person report", "questions suspend grammar", "たい is always fine"], "why": "The question requests the direct line rather than faking it."}, {"q": "The my-mind/your-mind line exists because ___.", "a": ["you can only observe other minds, never feel them"], "opts": ["you can only observe other minds, never feel them", "politeness demands it", "たい is irregular"], "why": "The grammar encodes the epistemology — and 本音と建前 (next) is its cultural twin."}]}},
  "sonkeigo": {"seg": [["先生", "the teacher — the person the sentence honors"], ["は", "topic marker"], ["今日、", "today"], ["学校に", "at school — に marks where"], ["いらっしゃいますか。", "THE POINT — いる elevated (it also covers 行く and 来る): the teacher's being-there, said looking up", 1]], "hl": "おっしゃいました", "note": "言う, elevated and aimed upward — the asker keeps ordinary grammar; only the honored person's verb is dressed.", "wr": [{"t": "The -aru verbs conjugate irregularly polite: いらっしゃいます・おっしゃいます・なさいます・くださいます — an い where る-verb logic expects り. Your ear learns this before your grammar does.", "jp": "社長は何をなさいますか。", "en": "What will the president do? — する elevated to なさる, politely なさいます.", "hl": "なさいます"}, {"t": "Recognition only, on purpose: elevated verbs describe the OTHER person, so nothing here is for your own sentences yet. Your side of the conversation gets its verbs next step."}], "drill": {"note": "Recognition drills: hear the altitude, name the plain verb underneath. Nothing asks you to produce keigo yet.", "items": [{"q": "先生は教室に___か。", "en": "Is the teacher in the classroom? — いる, elevated.", "a": ["いらっしゃいます"], "opts": ["いらっしゃいます", "おっしゃいます", "召し上がります", "なさいます"], "why": "いる (and 行く・来る) elevated → いらっしゃる."}, {"q": "いらっしゃる is the elevated form of ___。", "a": ["いる・行く・来る"], "opts": ["いる・行く・来る", "言う", "食べる・飲む", "する"], "why": "One elevated verb covers all three — context picks which."}, {"q": "何と___か。", "en": "What did (someone above you) say?", "a": ["おっしゃいました"], "opts": ["おっしゃいました", "いらっしゃいました", "なさいました", "召し上がりました"], "why": "言う elevated → おっしゃる."}, {"q": "どうぞ、___ください。", "en": "Please, eat — the host elevating your eating.", "a": ["召し上がって"], "opts": ["召し上がって", "いらっしゃって", "おっしゃって", "なさって"], "why": "食べる・飲む elevated → 召し上がる."}, {"q": "社長はゴルフを___。", "en": "The president plays golf — する, elevated.", "a": ["なさいます"], "opts": ["なさいます", "いたします", "いらっしゃいます", "召し上がります"], "why": "する elevated → なさる. (いたします lowers instead — that's next step's verb.)"}]}},
  "gozaimasu": {"seg": [["お手洗い", "the restroom — the お is politeness worn by the noun; Step 27 makes it productive"], ["は", "topic marker"], ["二階に", "on the second floor — に marks where it exists"], ["ございます。", "THE POINT — あります in formal dress: existence, announced with a bow", 1]], "hl": "でございます", "note": "です one bow deeper — でございます closes the sentence the way a hotel closes a door.", "wr": [{"t": "The negative is ございません — the shop's gentle no.", "jp": "申し訳ありません、席がございません。", "en": "Our apologies — there are no seats. (ございません bows lower than ありません.)", "hl": "ございません"}, {"t": "This register honors no one in particular — it's politeness toward the listener at large, which is why it belongs to announcements, signs and staff rather than to friends."}], "drill": {"note": "Recognition again: hear the formal floor, know the plain verb under it.", "items": [{"q": "(ホテルで) お手洗いは二階に___。", "en": "Staff telling a guest where the restroom is.", "a": ["ございます"], "opts": ["ございます", "います", "いらっしゃいます", "ございません"], "why": "Things exist with あります; the staff side dresses it as ございます. いらっしゃる is for people."}, {"q": "ございます is ___ in formal dress。", "a": ["あります"], "opts": ["あります", "います", "です", "行きます"], "why": "Existence of things, formally."}, {"q": "お飲み物はこちら___。", "en": "Your drinks are here — です, one bow deeper.", "a": ["でございます"], "opts": ["でございます", "でいらっしゃいます", "でした", "になさいます"], "why": "です → でございます. でいらっしゃいます elevates a person, not a drink."}, {"q": "ありがとう___。", "en": "The thanks you already say.", "a": ["ございます"], "opts": ["ございます", "あります", "なさいます", "おっしゃいます"], "why": "ござる has been inside your daily thanks all along."}, {"q": "すみません、今日は席が___。", "en": "The shop's gentle \"we're full.\"", "a": ["ございません"], "opts": ["ございません", "いません", "いらっしゃいません", "ございます"], "why": "No seats → the formal negative ございません."}]}},
  "kenjougo": {"seg": [["私", "I — the person being lowered"], ["は", "topic marker"], ["田中と", "Tanaka — と marks what's said, exactly as with 言う"], ["申します。", "THE POINT — 言う lowered: naming yourself, humbly", 1]], "hl": "伺います", "note": "Your going, lowered — 伺う also covers asking and visiting, always aimed at someone above.", "wr": [{"t": "The map has two halves now, and every plain verb with an up-form has a down-twin: いる → いらっしゃる↑・おる↓; 言う → おっしゃる↑・申す↓; する → なさる↑・いたす↓; 行く・来る → いらっしゃる↑・参る↓; 見る → ご覧になる↑・拝見する↓."}, {"t": "Step 14's いただく finds its seat: your もらう — and your eating and drinking — lowered. The giving verbs were the map's first corner all along.", "jp": "先生に本をいただきました。", "en": "I received a book from the teacher — もらう, lowered, exactly as Step 14 taught.", "hl": "いただきました"}], "drill": {"note": "Your side goes down. First productions — names, phones, visits.", "items": [{"q": "はじめまして。私は山田と___。", "en": "Introducing yourself.", "a": ["申します", "もうします"], "opts": ["申します", "おっしゃいます", "いたします", "なさいます"], "why": "Your own name goes down — 申す. おっしゃる would elevate you."}, {"q": "申す is the humble twin of ___。", "a": ["言う"], "opts": ["言う", "いる", "する", "行く"], "why": "言う: おっしゃる up, 申す down."}, {"q": "母は今、出かけて___。", "en": "My mother's out — your side, told outward.", "a": ["おります"], "opts": ["おります", "いらっしゃいます", "ございます", "なさいます"], "why": "Your family's いる goes down → おる. (ございます is for things.)"}, {"q": "先生の写真を___しました。", "en": "I (humbly) looked at the teacher's photo.", "a": ["拝見", "はいけん"], "opts": ["拝見", "ご覧", "見学", "けんぶつ"], "why": "Your seeing goes down → 拝見する. ご覧になる elevates the other person's seeing."}, {"q": "明日、そちらに___います。", "en": "I'll come to you tomorrow — visiting someone above.", "a": ["伺", "うかが"], "opts": ["伺", "いらっしゃ", "参", "おっしゃ"], "why": "Visiting upward → 伺います. (参ります is also humble going — 伺う adds the toward-you aim. And 参+います wouldn't even conjugate: 参ります.)"}]}},
  "sb-uchisoto": {"drill": {"note": "Same verb, same person — the axis decides. Read who's inside before you pick.", "items": [{"q": "(会社の電話で) すみません、田中はただいま___。", "en": "About your own coworker, to an outside caller.", "a": ["おりません"], "opts": ["おりません", "いらっしゃいません", "いません"], "why": "The caller is そと — your side's いる goes down, even for a boss. (いません isn't wrong, just underdressed for the company phone.)"}, {"q": "私の___は先生です。", "en": "Introducing your mother to your teacher.", "a": ["母", "はは"], "opts": ["母", "お母さん", "お母様"], "why": "Your own family, spoken outward → bare 母. cc-family's instinct, now grammar."}, {"q": "社長は会議に___か。", "en": "Asking about the OTHER company's president.", "a": ["いらっしゃいます"], "opts": ["いらっしゃいます", "おります", "いたします"], "why": "Their side sits above you — elevate."}, {"q": "社長は今、出かけて___。", "en": "About YOUR OWN president, to an outsider.", "a": ["おります"], "opts": ["おります", "いらっしゃいます", "なさいます"], "why": "Same title as the last drill, your side this time → down. That contrast IS the axis."}, {"q": "Speaking to another company, your own coworkers are ___。", "a": ["うち"], "opts": ["うち", "そと", "either"], "why": "Inside your wall — lowered as one unit when you face out."}]}},
  "okeigo": {"seg": [["社長", "the president — the honored doer"], ["は", "topic marker"], ["もう", "already"], ["お帰りに", "THE POINT — お + the verb's stem: the elevation begins", 1], ["なりました。", "になる completes the pattern — their returning, raised"]], "hl": "お持ちします", "note": "The mirror pattern: お + stem + する lowers YOUR action, performed for them — offering as grammar.", "wr": [{"t": "A special verb beats the pattern where one exists: 食べる has 召し上がる, so お食べになる sounds off. The patterns are for the verbs the special list skips — which is most of them."}, {"t": "Never double-dress. ご覧になる is already elevated; adding られる makes ご覧になられる — 二重敬語, the classic overreach. One dressing per verb.", "jp": "ご覧になりますか。", "en": "Will you take a look? — one elevation, correctly dressed.", "hl": "ご覧になります"}], "drill": {"note": "Build the altitude: stem + pattern, direction chosen by whose action it is.", "items": [{"q": "先生はもう___になりました。", "en": "Elevate the teacher's going-home.", "a": ["お帰り", "おかえり"], "opts": ["お帰り", "帰り", "ご帰り", "お帰りに"], "why": "お + stem + になる. ご belongs to kanji compounds like ご説明."}, {"q": "お荷物を___します。", "en": "I'll carry your bags — your action, lowered, for them.", "a": ["お持ち", "おもち"], "opts": ["お持ち", "持ち", "お持ちに", "ご持ち"], "why": "お + stem + する lowers your side."}, {"q": "説明する → ___します。", "en": "Explaining, humbly — a kanji compound.", "a": ["ご説明", "ごせつめい"], "opts": ["ご説明", "お説明", "ご説明に"], "why": "Kanji compounds take ご, not お."}, {"q": "The other person's eating needs no pattern — its special verb is ___。", "a": ["召し上がる"], "opts": ["召し上がる", "お食べになる", "いただく"], "why": "Special verb wins; お食べになる sounds off, and いただく points the wrong way — down."}, {"q": "ご覧になる is already elevated — adding られる makes it ___。", "a": ["二重敬語"], "opts": ["二重敬語", "謙譲語", "丁寧語"], "why": "Double-dressing. One elevation per verb is the rule."}]}},
  "sb-keigo-map": {"drill": {"note": "Pick the altitude, then the direction. The English line tells you where you stand.", "items": [{"q": "先生、コーヒーを___か。", "en": "Offering, full keigo — their drinking.", "a": ["召し上がります", "めしあがります"], "opts": ["召し上がります", "飲みます", "いただきます"], "why": "Their eating and drinking, elevated → 召し上がる."}, {"q": "はい、___。", "en": "Accepting that coffee — your receiving.", "a": ["いただきます"], "opts": ["いただきます", "召し上がります", "くださいます"], "why": "Your side receives, lowered — the mealtime word doing its original job."}, {"q": "(友だちに) 明日、うちに___？", "en": "Inviting a friend over — plain altitude.", "a": ["来る", "くる"], "opts": ["来る", "いらっしゃる", "参る"], "why": "Keigo at a friend lands as comedy — plain 来る."}, {"q": "社長は何と___か。", "en": "What did the president say? — their words.", "a": ["おっしゃいました"], "opts": ["おっしゃいました", "申しました", "言いました"], "why": "Their speaking goes up. 申す would drag the president down."}, {"q": "私は山田と___。", "en": "And your own name, in the same meeting.", "a": ["申します", "もうします"], "opts": ["申します", "おっしゃいます", "なさいます"], "why": "Your name goes down — the map's two halves inside one introduction."}]}},
  "sb-keigo-what": {"wr": [{"t": "The official count is five, not four. The Agency for Cultural Affairs' 敬語の指針 (2 February 2007) splits keigo into 尊敬語, 謙譲語Ⅰ, 謙譲語Ⅱ (also called 丁重語), 丁寧語 and 美化語. The four-way map here is the practical simplification — 謙譲語Ⅱ is a refinement of lowering that you can meet after the other four are solid."}, {"t": "美化語 comes in three tiers, and the first one has escaped. FROZEN: ご飯, お腹, お菓子 — no longer a choice at all, because 飯 is a different and rougher word. A LIVE DIAL: お水, お名前, お荷物 — strip the prefix and the register genuinely moves. MARKED: おビール, おソース — possible, and they read as service-counter rather than neutral.", "jp": "ご飯・お名前・おビール", "en": "Frozen / live dial / marked — one prefix, three different jobs.", "hl": "ご飯"}, {"t": "Step 5's cc-ogo taught お茶 and ご飯 as 'the polish prefixes' without naming them. They were 美化語 all along. One clean rule to carry: お goes on 和語, ご on 漢語, and loanwords take neither — ×おコーヒー is the test case that proves it."}], "drill": {"note": "Name the room, not the register. Each item asks which of the four is doing the work.", "items": [{"q": "「田中と申します」の敬語は？", "en": "Your own name, lowered.", "a": ["謙譲語"], "opts": ["謙譲語", "尊敬語", "丁寧語", "美化語"], "why": "申す lowers the speaker's own action. Your side goes down."}, {"q": "「先生がいらっしゃいます」の敬語は？", "en": "The teacher's being-there, raised.", "a": ["尊敬語"], "opts": ["尊敬語", "謙譲語", "丁寧語", "美化語"], "why": "いらっしゃる raises the other person's action."}, {"q": "「日本語を話します」の敬語は？", "en": "The form you have used since Step 1.", "a": ["丁寧語"], "opts": ["丁寧語", "尊敬語", "謙譲語", "美化語"], "why": "です・ます is politeness aimed at the listener — and it is keigo."}, {"q": "「お名前」の「お」は？", "en": "The noun itself, dressed.", "a": ["美化語"], "opts": ["美化語", "尊敬語", "謙譲語", "丁寧語"], "why": "The prefix dresses the noun rather than raising or lowering anyone's action."}, {"q": "敬語 is ___ 尊敬語 and 謙譲語.", "a": ["the umbrella over"], "opts": ["the umbrella over", "a third kind beside", "the opposite of", "the same thing as"], "why": "All of them are keigo. The question is never whether — it is which direction."}, {"q": "×おコーヒー is wrong because ___.", "a": ["loanwords take neither お nor ご"], "opts": ["loanwords take neither お nor ご", "コーヒー is 漢語", "お is only for verbs", "coffee is informal"], "why": "お goes on 和語, ご on 漢語, and borrowed words take neither."}]}},
  "sb-ikukuru": {"wr": [{"t": "参ります on a platform is the piece that surprises people most. The railway is lowering its own train, because the company is うち and you, the passenger, are そと. The train is not being modest — the announcer is, on the company's behalf, exactly as you would lower your own boss on the phone.", "jp": "まもなく電車が参ります。", "en": "The company lowers its own rolling stock.", "hl": "参ります"}, {"t": "伺う is not a synonym for 参る. It is narrower and it carries its own two jobs: visiting somebody, and asking them something. 明日伺います is 'I'll come to you tomorrow'; ちょっと伺いますが is 'may I ask you something'. Both lower you; neither is a general-purpose 行く."}, {"t": "Aim is everything, and the mirror error is the expensive one. おる is YOUR being-there — 先生はおりますか sends the teacher down, which is the exact opposite of what you meant. Up-verbs for them, down-verbs for you, and no exceptions to lean on."}], "drill": {"note": "Recognition first: hear the altitude, name the plain verb underneath, and say whose action it is.", "items": [{"q": "まもなく電車が___。", "en": "Station announcement — the train is arriving.", "a": ["参ります"], "opts": ["参ります", "いらっしゃいます", "おります", "来られます"], "why": "The company lowers its own train: 来る → 参る."}, {"q": "先生は教室に___か。", "en": "Asking whether the teacher is in.", "a": ["いらっしゃいます"], "opts": ["いらっしゃいます", "おります", "参ります", "申します"], "why": "The teacher is the other side — raise it. おります would demote them."}, {"q": "いらっしゃる covers ___.", "a": ["いる・行く・来る"], "opts": ["いる・行く・来る", "言う・話す", "食べる・飲む", "する・なる"], "why": "Three verbs, one elevated shape — which is why it is ambiguous and why that is fine."}, {"q": "明日、そちらに___。", "en": "I'll come to you tomorrow — visiting.", "a": ["伺います"], "opts": ["伺います", "いらっしゃいます", "おっしゃいます", "なさいます"], "why": "伺う is the narrow humble one: visiting, and asking."}, {"q": "「先生はおりますか」is wrong because ___.", "a": ["おる lowers the teacher"], "opts": ["おる lowers the teacher", "おる is too casual", "先生 cannot take keigo", "it needs です"], "why": "A humble verb aimed at the other person demotes them — the mirror of elevating yourself."}, {"q": "田中はただいま外出___。", "en": "On the phone, about your own colleague, to an outside caller.", "a": ["しております"], "opts": ["しております", "していらっしゃいます", "されています", "しております"], "why": "Your own side goes down, even your boss — おる, not いらっしゃる."}]}},
  "rc7": {"drill": {"note": "Five kinds of item: decode the plain verb, name the direction, spot the misaimed one, place it in a room, and pick the altitude. Where more than one answer fits, the explanation says so.", "items": [{"q": "「先生はいらっしゃいますか」の「いらっしゃる」は何の敬語？", "en": "Which plain verb is underneath?", "a": ["いる・行く・来る のどれでも"], "opts": ["いる・行く・来る のどれでも", "いる だけ", "行く だけ", "言う"], "why": "All three collapse into いらっしゃる, so the sentence is genuinely ambiguous — 'is the teacher in' or 'is the teacher coming'. Context decides, and native speakers do not notice the ambiguity."}, {"q": "「田中はおりません」— 誰を下げている？", "en": "Who is being lowered?", "a": ["話し手の側（うち）"], "opts": ["話し手の側（うち）", "田中さん個人だけ", "聞き手", "誰も"], "why": "The speaker lowers their whole side as one body, which is why 田中 loses his さん to an outside caller."}, {"q": "「先生はおりますか」の問題は？", "en": "What is wrong here?", "a": ["謙譲語を相手に向けている"], "opts": ["謙譲語を相手に向けている", "丁寧語が足りない", "先生に敬語は使わない", "問題ない"], "why": "おる lowers its subject, and the subject here is the teacher — the exact mirror of elevating yourself."}, {"q": "「まもなく電車が参ります」— どこで聞く？", "en": "Where would you hear this?", "a": ["駅のホーム"], "opts": ["駅のホーム", "友達の家", "教室で先生から", "電話で自分が言う"], "why": "The railway lowering its own train. You will hear it several times a day and never need to say it."}, {"q": "「お名前をお呼びします」の「お呼びします」は？", "en": "Which direction?", "a": ["謙譲語（話し手の動作）"], "opts": ["謙譲語（話し手の動作）", "尊敬語（相手の動作）", "美化語", "丁寧語だけ"], "why": "お + stem + する lowers the speaker's own action — the receptionist's calling, not your being called."}, {"q": "「いただきます」のもとの動詞は？", "en": "The verb underneath the mealtime phrase.", "a": ["いただく（もらうの謙譲語）"], "opts": ["いただく（もらうの謙譲語）", "いたす", "いらっしゃる", "くださる"], "why": "It is もらう, lowered — you have been conjugating a humble verb three times a day."}, {"q": "同じ「行く」を、相手には ___、自分には ___。", "en": "The same act, two directions.", "a": ["いらっしゃる／参る"], "opts": ["いらっしゃる／参る", "参る／いらっしゃる", "おる／いらっしゃる", "なさる／いたす"], "why": "Up for them, down for you — and the two words share no material at all."}, {"q": "「ご飯」の「ご」は今も敬語として働いている？", "en": "Is the prefix still doing a job?", "a": ["いいえ、語に定着している"], "opts": ["いいえ、語に定着している", "はい、尊敬語として", "はい、謙譲語として", "場面による"], "why": "Frozen. 飯 is a different, rougher word — the prefix stopped being a dial and became part of the vocabulary."}]}},
  // @@DEEP-END
};
const DRILL_DRAW = 5;

// ————— Lesson arcs (Session 17) —————
// ARCS[id] opens a lesson on the situation the learner is standing in, then
// extends that same situation page by page: first the flip — the pattern from
// the learner's own side with a different object, which replaces the abstract
// "when you'd use it" beat — and then one page per wrinkle, each caused by the
// situation rather than announced beside it. Framework in
// lesson-arc-design-v1.md; authored in lesson-arcs-v1.json and spliced between
// the markers below by build-arcs.py. NEVER hand-edit the generated block.
//
// Entry shape:
//   setting:    { scene, jp, en, pattern? }   pattern highlighted via HL
//   extensions: [{ kind, wr?, t?, scene, jp, en }, …]   one page each
//     kind "flip"     the learner's-side use; wr is always absent
//     kind "wrinkle"  wr indexes DEEP[id].wr, and the wrinkle's teaching text
//                     STAYS in DEEP — it is read from there at render time and
//                     deliberately not copied here, because side files that
//                     duplicate module content drift from it
//     kind "extra"    a wrinkle DEEP does not have, so it carries its own t
//
// A wrinkle no extension claims still renders on the `watch` page rather than
// vanishing; check-arcs.py warns when that happens. The JSON's claims/sources/
// flags/review are the reviewer's and are not emitted here — they never render.
const ARCS = {
  // @@ARCS-START
  "prim-shape": {"setting": {"scene": "The immigration hall, after the flight and before the country starts. The officer takes your passport and the landing card you filled in somewhere over Siberia. If you are staying more than three months you will leave this desk holding a residence card — the document you are then required to carry every day you are here. He asks, in Japanese first, what you have come to do.", "jp": "カードを見せます。", "en": "Card show. — I show the card.", "pattern": "を"}, "extensions": [{"kind": "flip", "scene": "An hour later, at the airport post office, you want a travel card for the trains. The words are not in your head yet, but the shape is, and the shape is the reverse of everything you have said out loud since you were two: whatever the thing is goes first, and whatever you are doing to it goes last.", "jp": "カードを買います。", "en": "Card buy. — I'll buy a card."}, {"kind": "extra", "t": "The last word decides everything — tense, politeness, question or statement, and whether the whole sentence was negative. English commits in the first three words; Japanese commits in the last two syllables, which is why you have to listen to the end of a sentence you thought you had already understood.", "scene": "The clerk answers with a sentence that begins exactly like the one you expected and then ends somewhere else entirely. Everything that mattered — whether it was a question, whether it was negative — arrived after you had already stopped listening.", "jp": "カードを買いますか。", "en": "Will you buy a card? — one syllable at the end, and it was a question all along."}]},
  "prim-drop": {"setting": {"scene": "The ward office, second week, registering the address you must register inside fourteen days. The clerk has your form, your card and your passport laid out in front of her, so she already knows your name, your date of birth and where you now live. She looks up and asks what you do for a living, and there is exactly one piece of information in the room that she does not have.", "jp": "先生です。", "en": "Teacher. — I'm a teacher."}, "extensions": [{"kind": "flip", "scene": "A fortnight later the school hands you a form of its own, and the teacher at the next desk reads the box over your shoulder and asks whether the person in the photo is your brother. He is not. Nothing in the answer needs to name him, or you, or the photograph.", "jp": "友達です。", "en": "A friend. — He's a friend."}, {"kind": "extra", "t": "私 does not disappear because it is impolite — it disappears because it is already known. Put it back in and you are drawing a contrast: 私は先生です answers 'and what about you?' rather than 'what do you do?'. That is why saying it in every sentence reads as strange rather than wrong.", "scene": "At the welcome lunch, everyone goes round the table. The person before you says what they do, and then it is your turn, and this is the one time all fortnight the word for I earns its place — because the sentence is not about you, it is about you as opposed to him.", "jp": "私は先生です。", "en": "I'm a teacher — as opposed to whatever he just said."}]},
  "desu": {"setting": {"scene": "A police box, a Tuesday evening, and an officer has asked to see your card. The card is in your wallet, which is where it has to be — a photograph of it on your phone does not satisfy the law, and not carrying it is a fine of up to two hundred thousand yen. He reads the status printed on the front and asks, conversationally, what you are here for.", "jp": "学生です。", "en": "I'm a student.", "pattern": "です"}, "extensions": [{"kind": "flip", "scene": "Saturday, and a neighbour two doors down stops you by the bins to ask about the dog you have been walking, which is not yours — you are minding it for the family upstairs while they are away. One word and です does the whole job.", "jp": "友達の犬です。", "en": "It's a friend's dog."}, {"kind": "wrinkle", "wr": 0, "scene": "Later the same conversation she asks whether the vet was expensive, and the answer needs an adjective rather than a noun. です comes along anyway, and this time it is carrying nothing but manners.", "jp": "高いです。", "en": "It's expensive — です adds politeness, nothing else."}]},
  "kosoado": {"setting": {"scene": "The counter at the city office, and three things are on it: the form you have just filled in, in front of you; your residence card, which the clerk has slid to her side to copy the number off; and a rack of leaflets against the far wall that you will need one of before you leave. She asks which of them is yours to take away.", "jp": "それはカードです。", "en": "That one — by you — is the card.", "pattern": "それ"}, "extensions": [{"kind": "flip", "scene": "Now you are the one asking. The leaflet you need is behind her on the rack, out of reach of both of you, and pointing at it is the entire sentence — the word you choose says how far away it is from the pair of you.", "jp": "あれをください。", "en": "That one over there, please."}, {"kind": "wrinkle", "wr": 0, "scene": "Somebody comes to the counter and speaks to the clerk by name, and you want to know who he is. He is not near you and not near her. The far word does the work again, and this time the thing it points at is a person.", "jp": "あの人は誰ですか。", "en": "Who is that person over there?"}]},
  "sb-kosoado": {"setting": {"scene": "The station lost-property window, the morning after you left a bag on the train. The man behind the counter goes into the back and returns with three of them, which he sets on a shelf well out of reach of either of you. He does not ask you to describe it. He waits for you to point, and the choice is not one decision but two.", "jp": "あれです。", "en": "That one — away from us both.", "pattern": "あれ"}, "extensions": [{"kind": "flip", "scene": "He brings it down and asks whether the umbrella hooked on the strap is yours too. It is now in his hands, a metre from your face — which by the rule you have just learned is not near you at all, whatever the tape measure says.", "jp": "それも私のです。", "en": "That one's mine too."}, {"kind": "extra", "t": "The second decision is which set. これ・それ・あれ stand alone in place of a noun; この・その・あの cannot stand at all and must be holding one. これ本です is the error the two sets produce, and it is the commonest in this step.", "scene": "He asks you to sign for it, and the form wants the item written in — so now the pointing word has a noun to hold, and the word itself has to change to hold it.", "jp": "そのかばんです。", "en": "That bag — pointing word plus noun, so それ becomes その."}]},
  "janai": {"setting": {"scene": "The clerk has been working from your visa category and has ticked the box that says student. You are not one — you are here to work, and that box decides which of two forms you spend the next twenty minutes on. Her hand is already going to the wrong pile, and you have about four seconds and one sentence.", "jp": "学生じゃないです。", "en": "I'm not a student.", "pattern": "じゃないです"}, "extensions": [{"kind": "flip", "scene": "A week later, at the school gate, a parent takes you for the other foreign teacher — the one who left in March. Same shape, different noun, and it is the politest available way to stop a conversation going somewhere neither of you wants.", "jp": "日本人じゃないです。", "en": "I'm not Japanese."}, {"kind": "wrinkle", "wr": 0, "scene": "She apologises and asks whether the textbook you are holding was expensive, meaning to be kind about it. It was not — and the word for expensive refuses this negative entirely, because it is not a noun and it can do the job itself.", "jp": "この本は高くないです。", "en": "This book is not expensive — the adjective negates itself."}]},
  "deshita": {"setting": {"scene": "You took the afternoon off, cycled twenty minutes and found the shutters down. Municipal offices keep short weekday hours and shut at weekends, so the errand you have to complete inside fourteen days now has eleven left in it. The next morning somebody at work asks whether you got it sorted.", "jp": "休みでした。", "en": "It was closed.", "pattern": "でした"}, "extensions": [{"kind": "flip", "scene": "She asks whether the ride over was at least pleasant, which it was not — it rained the whole way there and stopped the moment you turned round. Same past tense, your sentence this time, and the word in front of it is a noun again.", "jp": "雨でした。", "en": "It was rain. — It was raining."}, {"kind": "wrinkle", "wr": 0, "scene": "You want to add that it was not raining on the way back, which needs the past and the negative at once. Nothing new is required: two pieces you already own, stacked in that order.", "jp": "昨日は雨じゃなかったです。", "en": "Yesterday it wasn't rainy."}, {"kind": "wrinkle", "wr": 1, "scene": "What you actually want to say is that it was cold, and that is where the sentence breaks — because cold is not a noun, and it will not accept でした at any price. It carries its own past inside itself.", "jp": "昨日は寒かったです。", "en": "Yesterday was cold — the adjective changed shape."}]},
  "ka": {"setting": {"scene": "Four windows, four queues, and a numbered ticket in your hand that does not say which of them it belongs to. The signs above each one are in kanji you cannot read yet. Everybody in the room knows where they are going except you, and the only tool you have is a sentence you can already say with one sound added to the end.", "jp": "これですか。", "en": "Is it this one?", "pattern": "か"}, "extensions": [{"kind": "flip", "scene": "It was not that one. At the right window the clerk hands you a second form, and now you are asking whether this is the last of them — the same one syllable, doing the same work, on a sentence you built yourself.", "jp": "これは最後ですか。", "en": "Is this the last one?"}, {"kind": "wrinkle", "wr": 0, "scene": "The teacher next to you at lunch asks the same kind of question and it sounds nothing like yours: no か at all, just the pitch going up at the end. Written down, meanwhile, the question you asked at the counter would end with a full stop.", "jp": "学生？", "en": "Student? — casual: か drops, the pitch does the work."}]},
  "sb-negq": {"setting": {"scene": "The immigration office, renewing your status. The officer is reading from your file and confirming one detail he already believes he knows. 「学生じゃないですか」 — you're not a student, are you? You are not. Your English instinct is about to answer the fact, and the fact is no, so the word arriving in your mouth is the wrong one.", "jp": "はい、学生じゃないです。", "en": "That's right — I'm not a student.", "pattern": "はい、"}, "extensions": [{"kind": "flip", "scene": "Later that week you are the one asking. The neighbour has not put her bins out and you want to check she is not away — and the question you build is a negative one, which means her はい will mean yes-you're-right-I'm-not.", "jp": "明日、いませんか。", "en": "You won't be here tomorrow?"}, {"kind": "extra", "t": "The escape while the reflex builds: drop the particle and answer with the predicate. 学生じゃないですか — 学生です。 No はい, no いいえ, nothing to get backwards, and native speakers do it constantly for exactly the same reason.", "scene": "The officer asks a second one and you can feel yourself computing. So you skip the yes-or-no entirely and say the fact, which is shorter, completely natural, and impossible to get the wrong way round.", "jp": "学生です。", "en": "I'm a student. — answering the fact, not the phrasing."}]},
  "qwords": {"setting": {"scene": "A form with eleven boxes, of which you have confidently filled in three. The clerk has stepped away. The man beside you is filling in the same form at speed, and you need to know what goes in the fourth box badly enough to interrupt him — with a finger on it, so the question has somewhere to land.", "jp": "これは何ですか。", "en": "What is this?", "pattern": "何"}, "extensions": [{"kind": "flip", "scene": "He tells you, and then the next box needs a different question — not what it is but where the thing goes. The word changes and nothing else in the sentence moves, which is the whole trick and takes about a week to trust.", "jp": "どこですか。", "en": "Where is it?"}, {"kind": "wrinkle", "wr": 0, "scene": "A name gets called twice and nobody stands up, and you ask the man beside you who it was. The question word lands in the subject's seat — and that seat, when a question word is sitting in it, never takes は.", "jp": "誰が来ましたか。", "en": "Who came? — 誰が, never 誰は."}]},
  "ne": {"setting": {"scene": "Forty minutes into a numbered wait at the city office, on a row of plastic chairs, beside a woman who arrived before you did. Neither of you is going anywhere. She catches your eye and says something about the weather — and what she is doing is not conveying information, because you are both sitting in the same room and you both already know it.", "jp": "いい天気ですね。", "en": "Nice weather, isn't it.", "pattern": "ね"}, "extensions": [{"kind": "flip", "scene": "Your number is two away and hers is next, and the wait has been long enough that saying so out loud is a small act of solidarity rather than a complaint. You go first this time.", "jp": "長いですね。", "en": "It's long, isn't it."}, {"kind": "wrinkle", "wr": 0, "scene": "Then you nearly tell her something she cannot possibly know — that the counter shuts at five — with the same ね on the end, and it comes out wrong, because there is nothing there for her to agree with.", "jp": "五時までですね。", "en": "It's until five, isn't it — only works if she already knew."}]},
  "yo": {"setting": {"scene": "The same waiting room, a week later. A man two seats along is holding the pale blue form, and you know from getting it wrong yourself last Tuesday that the counter he is queuing for wants the white one. He is about to stand up. You have one short sentence and no vocabulary for any of the nouns involved.", "jp": "それじゃないですよ。", "en": "That's not the one, you know.", "pattern": "よ"}, "extensions": [{"kind": "flip", "scene": "He thanks you and asks where the white ones are kept, and you know that too, because you have been here three times this month. Genuine news, delivered by you, to someone who did not have it: the same particle, doing the same job.", "jp": "あそこにありますよ。", "en": "They're over there, you know."}, {"kind": "wrinkle", "wr": 0, "scene": "What you are less sure about is whether the counter takes cards, and you want to say so in a way that states your belief and asks him to confirm it. Both particles stack, in that order, and only that order.", "jp": "この店は安いですよね。", "en": "This shop's cheap, right? — stating and checking at once."}]},
  "sb-yone": {"setting": {"scene": "August, no air conditioning worth the name in the older part of the building, and an hour on the plastic chairs. The woman beside you has been there as long as you have. The clerk who comes out to call the next number has spent the morning behind a desk in the cooled office at the back, and says the same thing about the heat that everyone has been saying all morning.", "jp": "暑いですね。", "en": "Hot, isn't it — we both feel it.", "pattern": "ですね"}, "extensions": [{"kind": "flip", "scene": "You say it back to the clerk as she passes, and it is the wrong particle for her — she has just come out of the cool room and has not been in this since eight. What she needs is the news setting, not the agreement one.", "jp": "暑いですよ。", "en": "It's hot out here — you haven't been in it."}, {"kind": "extra", "t": "The mistake that lands worst is よ about the listener's own experience. 疲れていますよ tells someone how tired they are, which is exactly as presumptuous in Japanese as it sounds in English. When unsure: ね if you are sharing, nothing at all if you are not.", "scene": "An hour later you nearly tell the woman beside you that she must be tired, with よ on the end, and stop — because the one thing you cannot deliver as news is how somebody else feels.", "jp": "疲れましたね。", "en": "You must be tired — shared, not announced."}]},
  "wa": {"setting": {"scene": "The bank, opening an account, which needs the card and the address you registered a fortnight ago. The teller is working down a list, and each question puts a different thing on the table — your address, your employer, your reason for opening it. Then she reaches the line about you, and pauses with the pen over it.", "jp": "私は学生です。", "en": "As for me — student.", "pattern": "は"}, "extensions": [{"kind": "flip", "scene": "Two questions later she moves the conversation onto the account itself, and you follow her — because は does not mean I, it means here is the thing we are now discussing, and the thing you are discussing has just changed.", "jp": "この口座は新しいです。", "en": "This account is new."}, {"kind": "wrinkle", "wr": 0, "scene": "You read the form back to yourself under your breath and it does not sound like it is spelled. The character you have been writing all morning is not making the sound it makes anywhere else in the language.", "jp": "私は学生です。", "en": "Read watashi WA — は as a particle is pronounced wa."}]},
  "ga": {"setting": {"scene": "Your number is called and you stand, and so does somebody else — a friend has come along to help with the Japanese, and the clerk has never met them and has no idea who they are. She looks between the two of you. What the sentence has to do is put a person into the conversation who was not in it a second ago.", "jp": "友達が来ました。", "en": "A friend came with me.", "pattern": "が"}, "extensions": [{"kind": "flip", "scene": "Walking home you pass the park and there is a dog loose by the gate with no one anywhere near it. Same job, different thing arriving: nobody knew the dog was there until you said so.", "jp": "公園に犬がいます。", "en": "There's a dog in the park."}, {"kind": "wrinkle", "wr": 0, "scene": "Your friend asks whether you understood any of what the clerk said at the end. Some words never negotiate about this particle — understanding is one of them, and it takes が whether or not anything is arriving.", "jp": "日本語がわかります。", "en": "I understand Japanese — わかる always takes が."}]},
  "sb-waga": {"setting": {"scene": "The clerk has understood that somebody came with you and now wants to know what they are to you, which is a second question about a person who has stopped being a surprise. The same human being is about to appear in two consecutive sentences, and the particle changes between them for a reason English has no word for.", "jp": "友達が来ました。友達は日本人です。", "en": "A friend came. The friend is Japanese.", "pattern": "が来ました"}, "extensions": [{"kind": "flip", "scene": "That evening you tell the story to someone else and do the same handoff without thinking about it — the cat that turned up on the balcony arrives new, and by the second sentence it is a cat you are both discussing.", "jp": "猫が来ました。その猫は小さかったです。", "en": "A cat came. The cat was small."}, {"kind": "extra", "t": "The question test settles most cases in a second. If the sentence answers which one, it takes が — and so does the question that asked it. If it just names what you are already talking about, it takes は.", "scene": "At the school gate the next morning somebody asks who was at the office with you. The question and the answer both point at a person out of a set of possible people, so both of them take the same particle.", "jp": "誰が来ましたか。— 友達が来ました。", "en": "Who came? — A friend did."}]},
  "o": {"setting": {"scene": "The counter opens at half past eight and the queue starts before it. You have set an alarm for the first time since you arrived and you are eating standing up, because the difference between arriving at twenty-five past and arriving at ten to nine is about ninety minutes of your day. Everything in the sentence is ordinary; the particle is the whole lesson.", "jp": "朝ごはんを食べます。", "en": "I eat breakfast.", "pattern": "を"}, "extensions": [{"kind": "flip", "scene": "On the way you stop at the bakery by the station, because the queue will be long and there is nothing to do in it. Different verb, different object, same tag on the thing the action lands on.", "jp": "パンを買います。", "en": "I buy bread."}, {"kind": "wrinkle", "wr": 0, "scene": "Waiting, you try to say that you like the bakery — and the sentence refuses the particle you have just learned. Liking is not something you do to a bakery; the grammar treats it as a state, and states take a different marker.", "jp": "この店が好きです。", "en": "I like this shop — 好き takes が, not を."}]},
  "ni-time": {"setting": {"scene": "You have been putting the ward office off for nine days and there are five left. Somebody at work asks when you are finally going to go, and the honest answer is the one you have been avoiding — not next week, not on some numbered day you could write in a diary, but today, straight after this conversation.", "jp": "今日、行きます。", "en": "I'm going today.", "pattern": "今日、"}, "extensions": [{"kind": "flip", "scene": "She asks what time, and the answer is now a number on a clock — which is precisely the kind of time that does take the particle you just left out of the sentence before it. Both rules, one after the other, thirty seconds apart.", "jp": "七時に行きます。", "en": "I'm going at seven."}, {"kind": "wrinkle", "wr": 0, "scene": "Getting there before it shuts means getting up earlier, every day, for the rest of the week — and that sentence needs both kinds of time at once, one bare and one marked.", "jp": "毎日七時に起きます。", "en": "Every day (bare) at seven (に) I get up."}]},
  "ni-dest": {"setting": {"scene": "Public libraries are free to people who live in the area and the card takes about ten minutes, provided you can prove you live where you say you live — which is the same piece of paper everything else has wanted this month. It is the first errand of the fortnight nobody is making you do.", "jp": "図書館に行きます。", "en": "I'm going to the library.", "pattern": "に行きます"}, "extensions": [{"kind": "flip", "scene": "The librarian asks, making conversation, where you came from — meaning the country, and meaning the journey rather than the place. The other destination particle is a shade softer and does the same job.", "jp": "日本へ来ました。", "en": "I came to Japan."}, {"kind": "wrinkle", "wr": 0, "scene": "You want to add that you will study there, and the sentence takes a different particle for the same building — because you have stopped talking about going and started talking about doing.", "jp": "図書館で勉強します。", "en": "I study at the library — arriving is に, doing is で."}]},
  "sb-kanaparticles": {"setting": {"scene": "An online application, in Japanese, that will not let you past the name field. You have switched the keyboard over and you are typing what you hear, which is how わたしわ has now gone into the box twice. What is on the screen is not what the sentence sounds like, and the two have to be told apart before anything else will work.", "jp": "私は学校へ行きます。", "en": "Read: watashi wa gakkou e ikimasu — two spelling quirks in one short sentence.", "pattern": "は"}, "extensions": [{"kind": "flip", "scene": "You get past it and hit the same wall one field later, on the box that wants what you are applying for. The third quirky particle is the easy one — it exists for nothing except this job, so it is always the same sound.", "jp": "本を買います。", "en": "I'm buying a book — を is typed 'wo' and read o."}, {"kind": "extra", "t": "One sentence can carry the same kana both ways. はなはきれいです — the first は belongs to the flower, the second is the particle. Reading aloud is where this shows up; typing わたしわ is how it shows up in the other direction.", "scene": "The form's example line has the same character in it twice, and only one of them changes its sound. Nothing marks which is which except what each one is doing.", "jp": "はなはきれいです。", "en": "Flowers are pretty — first は is hana, second is the particle wa."}]},
  "de-place": {"setting": {"scene": "Your apartment has one room and a wall shared with somebody who works nights. The park by the station has benches, and on Saturday mornings a man practises a wind instrument at the far end of it, which somehow makes concentrating easier rather than harder. You have arranged to meet the friend who came to the ward office with you.", "jp": "公園で友達に会いました。", "en": "I met a friend at the park.", "pattern": "で"}, "extensions": [{"kind": "flip", "scene": "It rains, so you move to the library, and the sentence follows you without changing shape — the particle marks wherever the doing happens, and the doing has just moved indoors.", "jp": "図書館で勉強します。", "en": "I study at the library."}, {"kind": "wrinkle", "wr": 0, "scene": "You want to say the books you need are in there, and the sentence quietly refuses — because nothing is happening in it. Sitting on a shelf is not an action, and a place where nothing is being done takes the other particle.", "jp": "図書館に本があります。", "en": "There are books in the library — existing, not doing."}]},
  "de-means": {"setting": {"scene": "The ward office is two stations away. You have no car — that would mean proving to the police you have somewhere off-street to keep it — and the bicycle a departing colleague left you is still not registered in your name. So every errand this month has started on the same platform, and the sentence for it marks the train as a tool rather than a place.", "jp": "電車で行きます。", "en": "I'll go by train.", "pattern": "電車で"}, "extensions": [{"kind": "flip", "scene": "At the counter you cannot follow the clerk's question and ask her to use the other language, which is the same particle again — not a vehicle this time but a medium, which the grammar treats identically.", "jp": "日本語で話します。", "en": "Let's speak in Japanese."}, {"kind": "wrinkle", "wr": 0, "scene": "Going home you decide to walk it, and the one everyday method that refuses this particle is the one you are using. Walking gets a verb form instead, which arrives properly in Step 4.", "jp": "駅まで歩いて行きます。", "en": "I'll walk to the station — 歩いて, never 歩きで."}]},
  "sb-nide": {"setting": {"scene": "The library card worked. You are in there on a Sunday for the second time and you want to say two things about the same building: that you come here to work, and that the thing you are looking for is somewhere on the second floor. The room does not change between those two sentences. The particle does.", "jp": "図書館に本があります。", "en": "There are books in the library — existence.", "pattern": "に本があります"}, "extensions": [{"kind": "flip", "scene": "The librarian asks what you are doing up there every weekend, and the answer is about an action rather than a location. Same building, same shelves, third sentence in a row about them — and the particle flips back, because the verb changed.", "jp": "二階で勉強します。", "en": "I study on the second floor."}, {"kind": "extra", "t": "Ask one question before choosing and it comes out right every time: is something happening here, or is something simply located here? Happening takes で. Located takes に. The place never decides — the verb does.", "scene": "Both of your sentences were about the same shelves on the same floor of the same building, and nothing about the room had anything to do with which particle each one wanted. The verb decided both times, and the verb was the only thing that changed.", "jp": "公園で会います。公園に犬がいます。", "en": "We meet at the park. There's a dog in the park."}]},
  "to-and": {"setting": {"scene": "First proper shop after the arrival week, and you are buying for an empty kitchen. The list in your hand has two things on it because two things is what will fit in the basket alongside the rice you already have. At the till the assistant asks whether that is everything, and it is — exactly that, nothing else.", "jp": "パンと牛乳を買いました。", "en": "I bought bread and milk.", "pattern": "と"}, "extensions": [{"kind": "flip", "scene": "On the way out you meet the teacher from the next desk, who asks who you came with. The same particle does a second job that English splits off into a different word entirely — joining things, and naming the person you are with.", "jp": "友達と行きました。", "en": "I went with a friend."}, {"kind": "wrinkle", "wr": 0, "scene": "She asks what else is in the fridge and you start listing, and this is where と stops being the right tool — because it claims the list is finished, and yours is a sample of a fridge you have not properly looked in.", "jp": "肉や魚があります。", "en": "There's meat and fish and so on — や, not と."}]},
  "mo": {"setting": {"scene": "The staffroom, the first week of term, and the introductions have been going round the table for ten minutes. The person before you has just said which school they came from, and it happens to be the same one you were at last year in a different country — a coincidence worth one sentence and not more.", "jp": "私も学生です。", "en": "I'm a student too.", "pattern": "も"}, "extensions": [{"kind": "flip", "scene": "Later somebody asks whether anyone else is free on Monday and two hands go up including yours. The particle attaches to whatever is being added, and this time what is being added is a day.", "jp": "月曜日も行きます。", "en": "I'm going on Monday as well."}, {"kind": "wrinkle", "wr": 0, "scene": "You try to say it about yourself with the topic particle still attached and the sentence will not take both. This one arrives and evicts whatever was standing there — it does not stack.", "jp": "私も行きます。", "en": "I'm going too — も replaces は, never joins it."}]},
  "no": {"setting": {"scene": "Somebody has left a textbook on the shared desk and nobody has claimed it for three days. It has your surname written inside the cover in roman letters, which is either a coincidence or the school office being efficient about the order you put in a fortnight ago. The teacher beside you picks it up and holds it out, eyebrows raised.", "jp": "私の本です。", "en": "It's my book.", "pattern": "の"}, "extensions": [{"kind": "flip", "scene": "You hand back a different one that has been sitting under it, because that one is hers — same glue, other direction, and the owner always comes first while the thing owned comes last.", "jp": "先生の本です。", "en": "It's the teacher's book."}, {"kind": "wrinkle", "wr": 0, "scene": "A third book turns up belonging to the teacher who teaches you Japanese on Wednesdays, and now the chain has three links in it. Read from the right and it unwinds cleanly; read from the left and it makes no sense at all.", "jp": "私の日本語の先生の本です。", "en": "My Japanese teacher's book — the LAST noun is the thing."}]},
  "sb-no": {"setting": {"scene": "The stationery order form has a column you cannot parse, because every line on it is three nouns stuck together with the same character and no clue about which one is the item. It is the commonest particle on the page and it is doing a different job in almost every row.", "jp": "私の日本語の先生の本です。", "en": "Chains unwind from the right: my Japanese teacher's book.", "pattern": "の"}, "extensions": [{"kind": "flip", "scene": "You fill in your own line and the same particle does a job that is not possession at all — it names where something is from, which English would need a whole preposition for.", "jp": "日本の本です。", "en": "It's a Japanese book — origin, not ownership."}, {"kind": "extra", "t": "The classic overreach: の does NOT attach describing-words to nouns. きれいの人 is wrong — words like きれい bring their own connector (きれいな人), and words like 高い attach directly (高い店). If both sides are not nouns, this is not the particle you want.", "scene": "You try to write pretty notebook in the description column, reach for the particle that has worked all morning, and produce something that is not a phrase in any register of the language.", "jp": "きれいなノートです。", "en": "A pretty notebook — きれい brings its own な."}]},
  "sb-pronouns": {"setting": {"scene": "You have been in the country a month and somebody who read your self-introduction says, kindly, that it sounded a little stiff. Reading it back, every sentence starts the same way — the word for I, eleven times in nine lines, because that is what English taught your hands to do.", "jp": "昨日映画を見ました。とても面白かったです。", "en": "No 私 anywhere — and completely natural."}, "extensions": [{"kind": "flip", "scene": "You rewrite it. The one place the word stays is the line where you are being contrasted with the teacher who left — because there the sentence is genuinely about which of the two of you is meant.", "jp": "私は先生です。", "en": "I'M the teacher — contrast, so 私 earns its place."}, {"kind": "extra", "t": "あなた is not the fix. Toward someone whose name you know it reads as cold or confrontational, whatever the textbook says. The word English uses for you is done in Japanese with the person's name plus さん — 田中さんは — which is what あなた's job actually is.", "scene": "You try to ask the teacher beside you what she thinks, reach for the word every phrasebook gives for you, and get a small pause in return. Her name has been on the desk sign the whole time.", "jp": "田中さんはどう思いますか。", "en": "What do you think? — the name, not あなた."}]},
  "kara-from": {"setting": {"scene": "The ward office notice is four lines long and two of them are numbers. You have been caught out once already by turning up at the wrong end of the afternoon, and the counter you need has different hours from the rest of the building. The pair of particles on that line is the whole message.", "jp": "九時から五時まで働きます。", "en": "Open from nine to five.", "pattern": "から"}, "extensions": [{"kind": "flip", "scene": "You tell the school office when you are around on Thursdays, and it is the same pair doing the same work on your own timetable — a start, an end, and nothing needed in between.", "jp": "月曜日から金曜日まで学校にいます。", "en": "I'm at school Monday to Friday."}, {"kind": "extra", "t": "から has a second life meaning because, arriving in Step 11. Position tells you which is which: after a noun it is from; after a whole clause it is because. Same word, two stations.", "scene": "Halfway down the same notice the character turns up again, and this time nothing in front of it is a place or a time — it is a whole sentence, and the meaning has quietly changed underneath you.", "jp": "休みですから、行きません。", "en": "It's closed, so I'm not going — から after a clause is because."}]},
  "yori": {"setting": {"scene": "Two apartments, both within cycling distance of the school, and you have to tell the agent which one by Friday. One is cheaper and forty minutes from the station; the other is neither. Everybody who asks wants the comparison in one sentence, and the sentence puts the two things in an order English would reverse.", "jp": "この家はあの家より安いです。", "en": "This place is cheaper than that one.", "pattern": "より"}, "extensions": [{"kind": "flip", "scene": "The agent asks it back the other way round, about the commute rather than the rent, so you rebuild it with the other option as the yardstick — because より attaches to the thing being measured against, not to the thing being measured.", "jp": "バスは電車より安いです。", "en": "The bus is cheaper than the train."}, {"kind": "wrinkle", "wr": 0, "scene": "You listen for the word to change the way English changes cheap into cheaper, and it never does. The adjective stands exactly as it is and the particle carries the entire comparison on its own.", "jp": "犬は猫より大きいです。", "en": "The dog is bigger than the cat — 大きい never inflects."}]},
  "ka-or": {"setting": {"scene": "The school lunch order form wants a choice for each day of the coming month, and the two options are printed side by side with a single character between them. It is a character you have seen at the end of every question you have asked since your first week, and it is not doing that job here.", "jp": "コーヒーかお茶を飲みます。", "en": "I'll drink coffee or tea.", "pattern": "か"}, "extensions": [{"kind": "flip", "scene": "The office asks which day suits for the medical, and you genuinely do not mind, so you hand the choice back — the same character, between two days instead of two drinks.", "jp": "月曜日か火曜日がいいです。", "en": "Monday or Tuesday would be good."}, {"kind": "wrinkle", "wr": 0, "scene": "Your reply ends up with the character twice in one line, once in the middle and once at the very end, and they are not the same word doing two jobs so much as two words sharing a shape. Where it sits tells you which.", "jp": "月曜日か火曜日ですか。", "en": "Is it Monday or Tuesday? — middle か is 'or', final か asks."}]},
  "ya": {"setting": {"scene": "The neighbour who has been signing for your parcels asks what you have got in for the week, and the honest answer is that you do not entirely know — you shopped fast and put things away faster. What you can give her is a couple of examples and the clear signal that the list is not the whole of it.", "jp": "肉や魚があります。", "en": "There's meat and fish and that sort of thing.", "pattern": "や"}, "extensions": [{"kind": "flip", "scene": "She asks what is on the desk you have been complaining about, and the same word does the same job: two examples out of a surface you would rather not inventory.", "jp": "机の上に本やペンがあります。", "en": "There are books, pens and so on on the desk."}, {"kind": "wrinkle", "wr": 0, "scene": "Say it with the other joining particle instead and you have claimed to have counted — that the fridge holds meat and fish and nothing whatever besides, which is a strange thing to be certain about.", "jp": "肉と魚があります。", "en": "There's meat and fish — と says that's the complete list."}]},
  "dake": {"setting": {"scene": "A medical for the job, and the instruction sheet says nothing from midnight. At half past seven the nurse asks whether you have had anything this morning, and you have — one glass of water, because the sheet said nothing about water and you were not going to guess. The answer is a plain statement of a limit, with no feeling attached to it.", "jp": "水だけ飲みます。", "en": "I only drink water.", "pattern": "だけ"}, "extensions": [{"kind": "flip", "scene": "She asks how long you have been in the country and the answer is short enough to want the same word — a flat limit, stated without apology, which is exactly what this particle is for.", "jp": "一か月だけです。", "en": "Only a month."}, {"kind": "wrinkle", "wr": 0, "scene": "There is another word for only, one lesson away, and it means the same fact with a sigh attached. Choosing between them is choosing whether the limit is neutral or disappointing.", "jp": "水しか飲みません。", "en": "I've only got water — しか adds the sigh だけ doesn't."}]},
  "shika": {"setting": {"scene": "The last bus has gone. There is a taxi rank with no taxi on it and one shop still lit. Cashless payment reached 42.8% of consumer spending in 2024 against a government target of 80%, and out here that average means nothing — the shop takes cash, the taxi firm takes cash, and you are counting what is in your wallet before you go in.", "jp": "千円しかありません。", "en": "I've only got a thousand yen.", "pattern": "しか"}, "extensions": [{"kind": "flip", "scene": "The shopkeeper phones a driver anyway and asks how much you have. You say it again to a second person, and it is still the version with the sigh in it, because the amount is still not enough.", "jp": "百円しかありません。", "en": "I've only got a hundred yen."}, {"kind": "wrinkle", "wr": 0, "scene": "Written out, the sentence looks like it should mean you have no money at all — the verb is negative and the meaning is not. It is one of the few patterns where trusting the shape beats translating the parts.", "jp": "百円しかありません。", "en": "I have only 100 yen — negative verb, positive meaning."}]},
  "counters": {"setting": {"scene": "A greengrocer with everything in open boxes and no barcodes, which means saying out loud how many you want rather than putting them in a basket and letting a machine work it out. There are four people behind you. The number is the easy part; the word that has to follow it is not.", "jp": "りんごを三つ買いました。", "en": "I bought three apples.", "pattern": "三つ"}, "extensions": [{"kind": "flip", "scene": "At the counter next door you order for two, which needs the counter for people — and that one has irregular readings in exactly the places you will need most often.", "jp": "二人です。", "en": "Two people — read ふたり, not におん."}, {"kind": "wrinkle", "wr": 0, "scene": "You try to put the number in front of the fruit the way English does and the sentence comes apart. The count does not glue to the noun; it floats along behind the particle, just in front of the verb.", "jp": "りんごを三つ買いました。", "en": "Never 三つりんごを — the count floats after the particle."}]},
  "sb-counters": {"setting": {"scene": "small izakaya on a Friday with the whole section, and you have been sent to the counter to order for the table. Two beers is a sentence you have practised. It comes out fine. Three of them, twenty minutes later, does not — because the number and the counter change each other's sound when they meet.", "jp": "ビールを二本ください。", "en": "Two beers, please — 二本 stays plain: にほん.", "pattern": "二本"}, "extensions": [{"kind": "flip", "scene": "The second round is three, and the word you practised has quietly changed shape in your mouth. Nothing about the writing warned you; this is a sound rule, learned by ear and drilled as a chant.", "jp": "ビールを三本ください。", "en": "Three beers — さんぼん, not さんほん."}, {"kind": "extra", "t": "Priorities, because there are dozens of counters and you do not need them. ひとり and ふたり are non-negotiable. The 〜本 row is the classic shift set. Past that, relax — a wrong counter is understood and gently corrected, while a MISSING one is genuinely broken.", "scene": "Somebody asks for something you have no counter for at all, and uses the all-purpose one instead, and nothing whatever goes wrong. That is the escape hatch, and it is always a sentence.", "jp": "みっつください。", "en": "Three, please — 〜つ rescues almost anything."}]},
  "gurai": {"setting": {"scene": "The school wants to know how long your commute is, for the paperwork that decides your travel allowance. You have done it eleven times and it has never taken the same number of minutes twice. The form has a box for a number and no box for it depends, so the sentence needs a way to say roughly.", "jp": "三十分ぐらいかかります。", "en": "It takes about thirty minutes.", "pattern": "ぐらい"}, "extensions": [{"kind": "flip", "scene": "The same form asks how much you spend on it a month, and the answer is another number you cannot pin down. The same word fuzzes an amount of money exactly as it fuzzed an amount of time.", "jp": "一万円ぐらいです。", "en": "About ten thousand yen."}, {"kind": "wrinkle", "wr": 0, "scene": "The next box wants what time you leave the house, and reaching for the same word puts a smear across a point on the clock rather than across a length. There is a different word for that, and it is the next lesson.", "jp": "七時ごろ出ます。", "en": "I leave around seven — a point in time takes ごろ."}]},
  "goro": {"setting": {"scene": "The neighbour who signs for your parcels wants to know when you are usually back, so she knows when it is worth ringing the bell rather than leaving a card. You are back at about the same time every day and at exactly that time on no day at all, and she is asking about a point on the clock rather than a length of anything.", "jp": "七時ごろ帰ります。", "en": "I get home around seven.", "pattern": "ごろ"}, "extensions": [{"kind": "flip", "scene": "You ask her the same thing back, because there is a parcel of hers you have taken in twice, and the question uses the same word about the same kind of time.", "jp": "何時ごろですか。", "en": "About what time?"}, {"kind": "wrinkle", "wr": 0, "scene": "You write it down for her with the time particle in as well, out of habit, and it is one piece too many — this word has already done that job on its way past.", "jp": "七時ごろ帰ります。", "en": "No に needed — ごろ replaces it rather than joining it."}]},
  "sb-slots": {"setting": {"scene": "You write three sentences in the school's shared notebook about where you were on Tuesday, and every particle in them is right. The teacher who reads it says it is perfectly clear and slightly odd, and cannot immediately say why. Nothing is wrong. The pieces are in an order nobody would choose.", "jp": "昨日、図書館で本を読みました。", "en": "Time, place, object, verb — the neutral order."}, "extensions": [{"kind": "flip", "scene": "You rewrite the second sentence into the default running order and it stops sounding translated, without a single word being added or removed. The particles were carrying the meaning all along; what the order was carrying was the ease.", "jp": "月曜日、公園で友達に会いました。", "en": "Monday, at the park, met a friend."}, {"kind": "extra", "t": "Exactly one thing cannot move: the verb stays last. Everything else negotiates, and moving a piece earlier gives it emphasis rather than breaking anything. That is why particles carry so much weight here — English uses position to show who did what to whom, and Japanese has spent that budget elsewhere.", "scene": "You try putting the place first instead, to stress it, and the sentence survives intact — because the particle sitting on it says what that piece is doing regardless of where in the line it happens to stand.", "jp": "図書館で昨日本を読みました。", "en": "Same sentence, place fronted for emphasis — still fine."}]},
  "dict": {"setting": {"scene": "A group chat with three other teachers, set up on your second day, which is where the actual information about the school lives — what time the gate is locked, whose turn it is on Saturday. You have been answering in full polite sentences and it reads like a letter from a bank. Everyone else is writing in the shortest form there is.", "jp": "明日学校へ行く。", "en": "I'll go to school tomorrow. (casual)", "pattern": "行く"}, "extensions": [{"kind": "flip", "scene": "Somebody asks what time you eat, meaning whether you will be in the staffroom at noon, and the answer is the same bare form — it is not shorthand or laziness, it is the shape a dictionary would list and the shape everything else is built from.", "jp": "十二時に食べる。", "en": "I eat at twelve."}, {"kind": "wrinkle", "wr": 0, "scene": "You use the same form in an email to the teacher who runs your section, and it arrives like answering a work message with 'yeah, going'. Nothing was ungrammatical. The register was two floors below the room.", "jp": "明日、学校へ行きます。", "en": "Same sentence, polite — です・ます for anyone but friends."}]},
  "masu": {"setting": {"scene": "The first parents' evening, and you have twelve conversations to get through with people you have never met, about children you have known for three weeks. Whatever else you get wrong tonight, the ending on every verb should be the same one — the safe adult default, the form that is never wrong with a stranger.", "jp": "毎日勉強します。", "en": "He studies every day.", "pattern": "します"}, "extensions": [{"kind": "flip", "scene": "A parent asks what time you get in and you answer about yourself for the first time all evening. Same ending, your own verb, and the tense is sitting inside it rather than being added on afterwards.", "jp": "毎日七時に起きます。", "en": "I get up at seven every day."}, {"kind": "wrinkle", "wr": 0, "scene": "How a verb reaches this ending depends on which family it belongs to, and you have been guessing all evening — mostly correctly, which is worse, because you have no idea why. The next lesson sorts every verb you will meet.", "jp": "食べます。飲みます。します。", "en": "Three families, three routes to the same ending."}]},
  "sb-verbtypes": {"setting": {"scene": "You have started keeping verbs in a notebook and the list has stopped being useful, because it is alphabetical and the language does not care about that. Every verb you meet belongs to one of two families, the family decides how it bends, and telling them apart is a two-second test you can run on sight.", "jp": "食べる → 食べます", "en": "Ichi: drop る, add ます.", "pattern": "食べます"}, "extensions": [{"kind": "flip", "scene": "You re-sort the notebook into two columns and the test does most of the work by itself: if it does not end in る it is the other family, guaranteed, no exceptions to worry about.", "jp": "行く → 行きます", "en": "Go: the last sound shifts to the い row."}, {"kind": "extra", "t": "A handful end in いる or える and are Go anyway: 帰る, 入る, 走る, 切る, 知る. They are common enough to be worth learning as a set today rather than meeting one at a time in the middle of a sentence.", "scene": "Two verbs you use daily — going home and going in — fail the test. They look like one family and belong to the other, and there are five of them worth memorising as a block.", "jp": "帰る → 帰ります", "en": "Looks Ichi, is Go — 帰ります, not 帰る→帰ます."}]},
  "sb-suruverbs": {"setting": {"scene": "Your vocabulary list has forty two-kanji nouns on it and you have been learning them as nouns. Somebody points out that most of them are also verbs — that one small word turns almost any of them into something you can do — and the list quietly doubles in value without a single new entry.", "jp": "毎日、日本語を勉強します。", "en": "I study Japanese every day.", "pattern": "勉強します"}, "extensions": [{"kind": "flip", "scene": "You try it on a noun nobody taught you as a verb and it works, which is the point: the pattern is productive, so every word of that shape you learn from now on arrives with a verb attached.", "jp": "毎日、散歩します。", "en": "I take a walk every day."}, {"kind": "extra", "t": "The sorting test from the last lesson does not apply to these, and trying to apply it is the classic accident: 勉強する is neither family, so 勉強しります and 勉強しる are both wrong. It and 来る are simply irregular, and they are the two most common verbs in the language.", "scene": "You run the two-column test on it out of habit and get an answer that does not exist. These two verbs sit outside the system entirely, and there are only two of them.", "jp": "来ます。します。", "en": "The two irregulars — learned whole, not sorted."}]},
  "ta-plain": {"setting": {"scene": "Saturday, and three of the teachers have taken you to a ramen place near the station, which is the first time all month anybody has spoken to you at normal speed. Every sentence at the table ends in a sound you half recognise and cannot produce, and all of them are about what happened last night.", "jp": "昨日、ラーメンを食べた。", "en": "I ate ramen yesterday. (casual)", "pattern": "食べた"}, "extensions": [{"kind": "flip", "scene": "Somebody asks whether you went to the festival and you answer in the same register for the first time — the plain past, at a table where nobody is anybody's teacher for the evening.", "jp": "行った。", "en": "I went."}, {"kind": "wrinkle", "wr": 0, "scene": "The shape is not new. It is built exactly like the connector form coming in two lessons, with one sound swapped at the end, so learning either of them hands you the other for nothing.", "jp": "飲んで / 飲んだ", "en": "Same machinery, one sound apart."}]},
  "mashita": {"setting": {"scene": "Monday morning, and the section head asks what you did at the weekend — the same question the table asked on Saturday night, in a room where the answer cannot possibly be the same shape. Same event, same verb, same week, and one whole floor up in politeness because of who is standing in front of you.", "jp": "昨日映画を見ました。", "en": "I watched a film yesterday.", "pattern": "ました"}, "extensions": [{"kind": "flip", "scene": "She asks whether you have eaten, meaning this morning, and the negative version of the same tense arrives by exactly the same route — nothing new to learn and nothing to sort, just one piece swapped at the end of the word.", "jp": "朝ごはんを食べませんでした。", "en": "I didn't eat breakfast."}, {"kind": "wrinkle", "wr": 0, "scene": "You reach for the plain past you learned on Saturday and try to make it polite by adding to the end of it, which produces something that is not a word. This form is built from the ます stem, and it ignores the sound-change chart entirely.", "jp": "飲みました。", "en": "Not 飲んだました — built from the stem, not the plain past."}]},
  "te": {"setting": {"scene": "The morning routine you have to describe for the school's health form is four actions long and you can say all four of them separately. What you cannot do is join them, so the answer reads like a telegram. This one form is the connector every later pattern plugs into, and it is the hardest conjugation in the whole stage.", "jp": "朝起きて、顔を洗います。", "en": "I get up and wash my face.", "pattern": "起きて"}, "extensions": [{"kind": "flip", "scene": "You chain the rest of it yourself and the whole morning arrives as a single sentence rather than four. Only the last verb carries the tense for any of it; everything in front is simply hooked on and takes whatever that final verb decides.", "jp": "朝ごはんを食べて、学校へ行きます。", "en": "I eat breakfast and go to school."}, {"kind": "wrinkle", "wr": 0, "scene": "Which sound the form takes depends on the verb's last kana, and the chart has six rows and one outright liar in it — the verb for going, which does not behave like the row it belongs to.", "jp": "行って", "en": "行く breaks its own row — 行いて is wrong."}]},
  "teiru": {"setting": {"scene": "A phone call from the school office at ten past eight, asking where you are, and the honest answer is on a platform two stations away watching a delay board. What the question wants is not what you did or what you will do but what is happening at this exact moment, which needs a form English builds with is and Japanese builds onto the verb.", "jp": "今、雨が降っています。", "en": "It's raining now.", "pattern": "降っています"}, "extensions": [{"kind": "flip", "scene": "She asks what you can see from where you are standing, and you describe the platform — the same shape, this time in your own sentence, with everything in it happening at the moment you say it.", "jp": "今、電車を待っています。", "en": "I'm waiting for the train now."}, {"kind": "wrinkle", "wr": 0, "scene": "You use it about where you live and it comes out meaning something you did not intend — because this form has a second life, and the next lesson is entirely about the difference.", "jp": "東京に住んでいます。", "en": "I live in Tokyo — not 'in the middle of living'."}]},
  "teiru2": {"setting": {"scene": "New class, first lesson, and thirty-four children want to know everything about you at once — where you live, whether you are married, whether you have a dog. All three answers describe a state you are in now, and every one of them got there because something happened in the past and then stopped changing.", "jp": "東京に住んでいます。", "en": "I live in Tokyo.", "pattern": "住んでいます"}, "extensions": [{"kind": "flip", "scene": "They ask about the teacher who left, and the same form describes where she is now — a result that is still standing, not an action anybody is in the middle of.", "jp": "国に帰っています。", "en": "She's gone back to her country (and is there)."}, {"kind": "wrinkle", "wr": 0, "scene": "You answer the where-do-you-live question with the plain polite form instead, and it lands as a plan rather than a fact — as though you were describing a move you have not made yet.", "jp": "東京に住んでいます。", "en": "住みます would sound like a moving plan, not a life."}]},
  "sb-transitive": {"setting": {"scene": "You come back to the staffroom after lunch and the window is open. It was shut when you left. Nobody is standing near it and nobody is going to be blamed. What you want to say is a description of the room, not a report of anyone's action — and English hands you one verb for both jobs with no warning that a choice is being made.", "jp": "窓が開いています。", "en": "The window is open.", "pattern": "開いています"}, "extensions": [{"kind": "flip", "scene": "You close it, and now there is a person in the sentence — you — which means the other twin of the same verb, and the particle changes to match without you touching it.", "jp": "窓を閉めました。", "en": "I closed the window."}, {"kind": "extra", "t": "The self-check that catches it: if you find を sitting in front of an it-just-happens verb, one of the two is wrong. 窓を閉まりました is wrong twice — 閉まる cannot take を, and a person closing something needs 閉めました.", "scene": "You write it in the shared notebook with the wrong twin and the wrong particle, and the sentence is broken in two places at once, neither of which English would have flagged.", "jp": "窓が閉まりました。", "en": "The window closed — no one did it, so が and the happen-twin."}]},
  "mou": {"setting": {"scene": "Half past twelve and the section head is doing the rounds before the afternoon meeting, checking who still needs to eat, who has sent the forms in, who has done the thing they said they would do at nine. Every question she asks is about whether something is finished, and every answer is one word plus a past tense.", "jp": "もう昼ごはんを食べました。", "en": "I've already eaten lunch.", "pattern": "もう"}, "extensions": [{"kind": "flip", "scene": "You ask her the same about the paperwork you handed in on Friday, because nobody has said anything since and the deadline was yesterday. Same word, your question, checking a door is shut.", "jp": "もう見ましたか。", "en": "Have you already looked at it?"}, {"kind": "wrinkle", "wr": 0, "scene": "Its mirror turns up in the next answer down the row — somebody has not eaten, and the not-yet version pairs with a different ending entirely. The two words are one system: door closed, door still open.", "jp": "まだ食べていません。", "en": "Not yet — まだ pairs with ていません."}]},
  "mada": {"setting": {"scene": "The medical for the job is at two and the instruction sheet said nothing after midnight. At half past one somebody offers you a biscuit and you have to explain, in a staffroom, that you have not eaten — not that you did not eat, which is a different sentence and closes a door that is still very much open.", "jp": "まだ食べていません。", "en": "I haven't eaten yet.", "pattern": "まだ"}, "extensions": [{"kind": "flip", "scene": "At the clinic the nurse asks whether the forms came back from the school and you use the same shape about somebody else's outstanding job — still open, still expected, not yet done.", "jp": "まだ来ていません。", "en": "It hasn't come yet."}, {"kind": "wrinkle", "wr": 0, "scene": "You say it with the ordinary polite past instead and it reports that eating simply did not happen — historical, finished, nothing pending. Not-yet-ness is a present state and it needs the present-state form.", "jp": "まだ食べていません。", "en": "Not まだ食べませんでした — that closes the door."}]},
  "sb-future": {"setting": {"scene": "You spend twenty minutes hunting for the future tense, because the school calendar for next term needs describing and every sentence you want is about something that has not happened yet. There is nothing to find. The form you already have covers habits, plans, promises and scheduled events without changing shape.", "jp": "毎日コーヒーを飲みます。", "en": "I drink coffee every day. (habit)", "pattern": "飲みます"}, "extensions": [{"kind": "flip", "scene": "You write the line about next Monday with the identical ending you used for the habit, and nothing whatever marks it as future except the word for Monday sitting at the front. If you know it is happening, the non-past says so.", "jp": "月曜日に行きます。", "en": "I'm going on Monday."}, {"kind": "extra", "t": "The instinct to hunt for a future marker produces things like 行くでしょう where a plain 行きます was wanted. でしょう is a guess, not a tense — reaching for it to mean 'will' quietly downgrades a fact into a probably.", "scene": "You add a word you half-remember meaning will, and the sentence stops being a plan and becomes a forecast — which is not what a calendar means at all, and quietly downgrades something you know into something you suspect.", "jp": "明日、行きます。", "en": "Not 行くでしょう — that's 'probably', not 'will'."}]},
  "sb-register": {"setting": {"scene": "Two conversations, four minutes apart, in the same room. One with the teacher you eat lunch with every day; one with the section head who signs your leave. The words are nearly identical and the endings cannot be, and the level tracks your relationship with the person rather than the subject or your mood.", "jp": "先生、明日は休みます。", "en": "To a teacher: polite.", "pattern": "休みます"}, "extensions": [{"kind": "flip", "scene": "You say the same thing to the friend at the next desk on your way out and drop a whole floor without thinking about it, which is exactly right — the dial moved because the listener moved, not because the news did.", "jp": "明日、休む。", "en": "Same news, to a friend."}, {"kind": "extra", "t": "The classic error is not picking the wrong level. It is drifting between them inside one conversation, which reads as unstable rather than casual — pick a level per listener at the start and hold it to the end.", "scene": "Halfway through a longer conversation with the section head you relax, and a single plain verb slips in among the polite ones. Nobody says anything about it and nobody needs to. Everybody in the room heard it happen.", "jp": "休みます。", "en": "Hold the level you started on."}]},
  "sb-nounmod": {"setting": {"scene": "The end-of-term report wants a sentence about the children who joined late, and you cannot build it — every version needs a joining word that does not exist. Japanese puts the whole description in front of the noun with nothing between them, and this is the single structure that turns short sentences into real ones.", "jp": "離婚した人は、もう一度結婚しますか。", "en": "Do people who have divorced marry again?", "pattern": "した人"}, "extensions": [{"kind": "flip", "scene": "You write your own line about the class and the clause slots in front of the noun with no connector at all — no who, no that, nothing to translate, which is exactly why it feels wrong for the first month.", "jp": "昨日来た学生は日本人です。", "en": "The student who came yesterday is Japanese."}, {"kind": "extra", "t": "Three specific errors. Never です or ます inside the clause — 離婚しました人 is wrong, it is 離婚した人. Never insert a joining word, because there is no equivalent of who or that. And never add の, which is for joining nouns, not clauses.", "scene": "Your first attempt is polite inside the clause, which nothing in English would warn you about, and the politeness belongs at the very end of the sentence rather than in the middle of it.", "jp": "昨日来た学生です。", "en": "Not 昨日来ました学生 — politeness waits for the end."}]},
  "tekudasai": {"setting": {"scene": "The bank again, and the account has hit a problem that needs the teller to fetch somebody. She asks you to sit down, and then you need to ask her something back — the neutral polite request, the one that works on counters, taxi drivers and teachers, and the only one you have.", "jp": "ちょっと待ってください。", "en": "Please wait a moment.", "pattern": "てください"}, "extensions": [{"kind": "flip", "scene": "The form has to go to the school for a stamp and back here by Friday, so you ask the office to look at it today rather than tomorrow. Your request this time, same shape, on a verb of your own.", "jp": "今日、見てください。", "en": "Please look at it today."}, {"kind": "wrinkle", "wr": 0, "scene": "The answer side is part of the pattern and it is not always a word for yes. いいですよ and どうぞ are both agreement — and a hesitant ちょっと with nothing after it is very often the whole answer.", "jp": "ちょっと…", "en": "A no wearing softness — take the hesitation as the answer."}]},
  "naidekudasai": {"setting": {"scene": "A school trip to a temple, thirty-four children, and a member of staff comes over to you rather than to them — which means whatever is about to be said is for you to pass on. Inside the hall, no photographs. It is a request rather than a rule on a sign, and the form matches that.", "jp": "ここで写真を撮らないでください。", "en": "Please don't take photos here.", "pattern": "ないでください"}, "extensions": [{"kind": "flip", "scene": "You turn round and say it to the class, and then say a gentler one to the child who has been worrying all morning about getting something wrong — the same shape, doing comfort rather than instruction.", "jp": "心配しないでください。", "en": "Please don't worry."}, {"kind": "wrinkle", "wr": 0, "scene": "On the way out there is a sign that means the same thing in a completely different voice: not a person asking this person now, but a standing rule that was true before you arrived.", "jp": "ここでたばこを吸ってはいけません。", "en": "No smoking here — a rule, not a request."}]},
  "temoii": {"setting": {"scene": "The staffroom has assigned desks and one spare, and you have been standing with a laptop for four minutes because nobody has told you whether the spare is spare. Japanese social space runs on asking first, and this is the asking — before you sit, borrow, photograph, or leave early.", "jp": "ここに座ってもいいですか。", "en": "May I sit here?", "pattern": "てもいいですか"}, "extensions": [{"kind": "flip", "scene": "Later you need the good stapler off somebody else's desk, and the same question does it — asking before taking is not deference here, it is the ordinary running order.", "jp": "使ってもいいですか。", "en": "May I use it?"}, {"kind": "wrinkle", "wr": 0, "scene": "Reading the answer is half the skill. どうぞ is yes and needs no words around it. あ、ちょっと… is a no wearing softness, and pressing past it makes things worse in both directions at once.", "jp": "あ、ちょっと…", "en": "That's the no. Don't ask twice."}]},
  "tewaikemasen": {"setting": {"scene": "The pool, the first hot week, and the rules are on a board by the gate in language that does not soften anything. Some of it is pictures. Most of it is one pattern, repeated, which is the pattern signage uses when the rule was true before you arrived and will be true after you leave.", "jp": "ここでたばこを吸ってはいけません。", "en": "You must not smoke here.", "pattern": "てはいけません"}, "extensions": [{"kind": "flip", "scene": "You have to put it into English for the class and then back into Japanese for the parent who arrives late, and it is the same flat shape both times — no room in it and none intended.", "jp": "ここに入ってはいけません。", "en": "You must not go in here."}, {"kind": "wrinkle", "wr": 0, "scene": "You use it on a child who is about to do something harmless and it lands far heavier than you meant. To stop a person, rather than state a rule, the gentler request form is the right tool.", "jp": "入らないでください。", "en": "Please don't go in — asking a person, not quoting a rule."}]},
  "nakereba": {"setting": {"scene": "The clinic sends you home with a week of tablets and an instruction that is not a suggestion, and the pharmacist writes it into the booklet you now carry. Every day, whether or not you feel any better. The sentence for a duty like that is built out of pieces you already own, assembled in a shape English does not have.", "jp": "毎日薬を飲まなければなりません。", "en": "I have to take medicine every day.", "pattern": "なければなりません"}, "extensions": [{"kind": "flip", "scene": "Six o'clock, and you are the first to leave a room where nobody has moved — so you say why, and this is the polite exit as much as it is an obligation.", "jp": "もう帰らなければなりません。", "en": "I have to go now."}, {"kind": "wrinkle", "wr": 0, "scene": "Taken apart, the sentence says that if you do not drink it, it will not do. There is no direct word for must anywhere in it — the obligation is built by ruling out the not-doing, which is why the shape looks so long for so small an idea.", "jp": "飲まなければなりません。", "en": "Literally: if I don't drink it, it won't do."}]},
  "nakutemoii": {"setting": {"scene": "Saturday practice is optional this month and one family has spent four minutes apologising for something they do not need to apologise for. You have one sentence in which to release them, and the sentence that forbids them is built from entirely different parts — but English builds both out of the same words, so the instinct is to negate must and hope.", "jp": "明日は来なくてもいいです。", "en": "You don't have to come tomorrow.", "pattern": "なくてもいいです"}, "extensions": [{"kind": "flip", "scene": "A colleague asks whether she has to fill in the second form as well, and you get to be the one giving mercy — same shape, answering a must-I question with a no that grants rather than forbids.", "jp": "書かなくてもいいです。", "en": "You don't have to write it."}, {"kind": "wrinkle", "wr": 0, "scene": "Say the other one by mistake and you have banned a child from the school on Saturday. Both sentences are perfectly grammatical and nothing warns you that the message inverted.", "jp": "来てはいけません。", "en": "You must NOT come — a different sentence entirely."}]},
  "sb-must": {"setting": {"scene": "Three sentences from this step form a triangle, and one corner of it is where English speakers do real damage. Must do, must not do, and do not have to do — the first two feel like opposites and the third feels like a negative of the first, which is exactly the wiring that sends a family home thinking their son is banned.", "jp": "来なくてもいいです。", "en": "You don't have to come.", "pattern": "なくてもいいです"}, "extensions": [{"kind": "flip", "scene": "You draw the triangle out on paper for yourself, and the two dangerous corners share no material at all: one is the negative form plus permission, the other is the connector form plus prohibition. Nothing about them overlaps.", "jp": "来てはいけません。", "en": "You must not come — different parts, opposite meaning."}, {"kind": "extra", "t": "The must corner itself is modular: なければ, ないと or なきゃ on the left; なりません, いけません or だめ on the right. Most combinations work and mean the same thing, so learn two slots rather than six patterns — and note the double negative is doing the work in all of them, which is why adding your own extra negative is the one honestly wrong move.", "scene": "You hear four different versions of the same obligation in one week and assume they are four patterns. They are two slots with three fillings each, and every combination means what you think it means.", "jp": "行かないといけない。", "en": "Same meaning, lighter register — two slots, swapped."}]},
  "mashou": {"setting": {"scene": "Six o'clock, the last two people in the staffroom, and both of you have been finding small things to do for twenty minutes. The decision is essentially already made and somebody has to say it out loud. This form does not ask — it moves a group that has already agreed.", "jp": "一緒に帰りましょう。", "en": "Let's go home together.", "pattern": "ましょう"}, "extensions": [{"kind": "flip", "scene": "At the station you both look at the same shop at the same moment, which is agreement enough on its own — so the sentence skips the asking entirely and goes straight to the deciding, which is what this form is for.", "jp": "お茶を飲みましょう。", "en": "Let's have some tea."}, {"kind": "wrinkle", "wr": 0, "scene": "You use it on somebody you have known for four days and it assumes rather more than you have. For a genuine invitation, one that leaves the other person somewhere to stand, there is a softer opener two lessons away.", "jp": "一緒に帰りませんか。", "en": "Won't you go home together? — leaves room to decline."}]},
  "mashouka": {"setting": {"scene": "The teacher across the desk is carrying a box of textbooks with her chin on top of it and has said nothing, because saying something would be asking. You are not deciding anything jointly here — you are offering, which is the same form with one syllable added and a completely different social job.", "jp": "手伝いましょうか。", "en": "Shall I help you?", "pattern": "ましょうか"}, "extensions": [{"kind": "flip", "scene": "Later it is genuinely joint — the two of you are standing in front of a window nobody has opened all afternoon, and the question is what to do rather than whether you will do it for her.", "jp": "窓を開けましょうか。", "en": "Shall we open the window?"}, {"kind": "extra", "t": "Learn the replies with the offer. お願いします accepts gratefully; 大丈夫です declines politely — the same 大丈夫 from the convenience store lesson, doing the same work. And the か is load-bearing: 手伝いますか asks whether you help in general, which is a different question.", "scene": "She answers with two words and you have to know which of them was a yes. One hands you the box; the other means she has it, thank you, and neither contains a no.", "jp": "大丈夫です。", "en": "I'm fine, thanks — a polite decline, not a yes."}]},
  "masenka": {"setting": {"scene": "A month in. The teacher at the next desk has stayed late twice this week and you would like to suggest lunch, without putting her in the position of turning you down to your face — which she would find harder than you would. The negative question builds the exit into the grammar.", "jp": "一緒に昼ごはんを食べませんか。", "en": "Won't you have lunch with me?", "pattern": "ませんか"}, "extensions": [{"kind": "flip", "scene": "It goes well enough that you try a second one for the weekend, aimed slightly upward — at somebody senior, where the room to decline matters more rather than less.", "jp": "一緒に映画を見ませんか。", "en": "Won't you come and see a film?"}, {"kind": "wrinkle", "wr": 0, "scene": "The answer is not はい or いいえ. Acceptance comes as いいですね or ぜひ; the refusal comes as ちょっと, trailing off into nothing, and the trailing off is the entire message.", "jp": "いいですね。", "en": "That'd be nice — the acceptance, where a bare はい would be odd."}]},
  "tai": {"setting": {"scene": "The end-of-year form asks where you would like to be placed next April, and it is the first document since you arrived that has asked what you want rather than what you are. Your own wishes, stated flat, in a form that belongs to you and only to you.", "jp": "日本へ行きたいです。", "en": "I want to go to Japan.", "pattern": "たいです"}, "extensions": [{"kind": "flip", "scene": "Somebody asks over lunch what you want to eat, which is this same form pointed at you between equals — and answering it is the easiest complete sentence you have built all week, because it is about the one mind you have access to.", "jp": "お茶を飲みたいです。", "en": "I want some tea."}, {"kind": "wrinkle", "wr": 0, "scene": "You use it about your sister, who has been talking about visiting for months, and the sentence claims to know something you cannot know. Japanese marks other people's insides differently, and the machinery for it arrives in Stage 2.", "jp": "妹は行きたがっています。", "en": "My sister wants to go — read from outside, not claimed."}]},
  "hoshii": {"setting": {"scene": "The apartment came with a fridge, a light and nothing else, and four weeks in you have a list on the back of an envelope. Somebody at work asks what you still need, and the answer is about things rather than actions — which Japanese splits into two different words where English uses one.", "jp": "新しいかばんがほしいです。", "en": "I want a new bag.", "pattern": "がほしいです"}, "extensions": [{"kind": "flip", "scene": "Your birthday is in three weeks and the interrogation has started early. Same word, same particle — and the particle is the thing to watch, because the thing you want is not something you are doing anything to.", "jp": "車がほしいです。", "en": "I want a car."}, {"kind": "wrinkle", "wr": 0, "scene": "Half your list is not things at all but things you want to do, and those need the other form entirely. A new bag wants one word; buying the bag wants the other.", "jp": "かばんを買いたいです。", "en": "I want to buy a bag — actions take たい."}]},
  "tsumori": {"setting": {"scene": "Leave has to go in by the end of the month and the section head is asking everyone in turn what they are doing in August. Two of your colleagues answer with something vague. Yours is not vague — the flights are booked — and there is a form for a plan you have actually committed to.", "jp": "夏に国へ帰るつもりです。", "en": "I intend to go home in the summer.", "pattern": "つもりです"}, "extensions": [{"kind": "flip", "scene": "She asks what you will do about the apartment while you are away, and the answer is another real decision rather than a hope — the same shape, on a verb of your own.", "jp": "友達に会うつもりです。", "en": "I intend to see a friend."}, {"kind": "wrinkle", "wr": 0, "scene": "You build it off the polite form out of habit and it will not take it. This pattern grabs the plain verb, and all the politeness waits at the very end, on the last word — the same division of labour as describing a noun with a clause.", "jp": "帰るつもりです。", "en": "Never 帰りますつもり — plain form, politeness at the end."}]},
  "niiku": {"setting": {"scene": "Saturday, and the list is four errands long: the bank, the ward office, the shop by the station, and the friend who has been holding a parcel for you since Tuesday. Every one of them is a place plus a reason for going there, and Japanese has one pattern that carries both at once.", "jp": "デパートへ買い物に行きます。", "en": "I'm going to the department store to shop.", "pattern": "に行きます"}, "extensions": [{"kind": "flip", "scene": "You tell the neighbour where you are off to, and the purpose slot takes a verb this time rather than a noun — but not a whole verb, only the front half of one.", "jp": "友達に会いに行きます。", "en": "I'm going to meet a friend."}, {"kind": "wrinkle", "wr": 0, "scene": "You try to put the whole verb in the purpose slot and the sentence refuses. It takes a noun or a stem — never a complete clause, which is the shape English keeps trying to hand it.", "jp": "会いに行きます。", "en": "Not 会うに行く, not 会ってに — the stem, 会い."}]},
  "tekara": {"setting": {"scene": "School lunch is eaten in the classroom with the children, and there is an order to it that nobody writes down: hands, then seats, then the greeting, then anybody touches anything. On your first day you sat down at the wrong point in that sequence and thirty-four children noticed before the teacher did.", "jp": "手を洗ってから食べます。", "en": "We eat after washing our hands.", "pattern": "てから"}, "extensions": [{"kind": "flip", "scene": "By the second week you are the one saying it, to a child who has arrived at the table with the sequence in the wrong order. Same shape, your mouth, and the sentence is doing a job rather than describing one.", "jp": "手を洗ってから座ってください。", "en": "Please sit down after washing your hands."}, {"kind": "wrinkle", "wr": 0, "scene": "The same two kana turn up four lessons later meaning because, and nothing about the characters tells you which is which. The joint does: this one glues to a connector form, the other to a whole finished clause.", "jp": "暑いから、窓を開けました。", "en": "Because it was hot, I opened the window — から on a clause."}]},
  "atode": {"setting": {"scene": "A colleague asks whether you want to come to the thing after work on Friday, and the answer depends entirely on what order the evening happens in — there is a meeting, then the thing, and you can only manage one of them. The sentence you need is about what follows what.", "jp": "ごはんを食べたあとで散歩します。", "en": "I take a walk after eating.", "pattern": "あとで"}, "extensions": [{"kind": "flip", "scene": "You answer with your own version, about the meeting rather than dinner, and the whole sentence is about Friday — which has not happened yet, and which makes the next part surprising.", "jp": "会議が終わったあとで行きます。", "en": "I'll go after the meeting finishes."}, {"kind": "wrinkle", "wr": 0, "scene": "The verb in front is in the past even though every word of the sentence is about the future. That past is not marking time; it is marking completed-relative-to the other half, and the sentence's real tense waits at the end.", "jp": "食べたあとで散歩します。", "en": "Past form, future sentence — た marks completion, not time."}]},
  "maeni": {"setting": {"scene": "The dentist's form asks what you do before bed, which is a question you can answer in English in four words and cannot answer in Japanese at all. Everything you have learned this step joins two actions in one order; this one joins them in the other.", "jp": "寝るまえに歯をみがきます。", "en": "I brush my teeth before sleeping.", "pattern": "まえに"}, "extensions": [{"kind": "flip", "scene": "She asks about the medicine you are on and whether you take it before food, and you build the sentence yourself out of the same joint — with the verb in front sitting in its plain, unbent, dictionary shape.", "jp": "食べるまえに薬を飲みます。", "en": "I take the medicine before eating."}, {"kind": "wrinkle", "wr": 0, "scene": "Then you say something about last year, and the verb in front stubbornly refuses to go into the past even though the event plainly did. This joint takes the present regardless, and the sentence's tense lives at the very end.", "jp": "日本に来る前に、日本語を勉強しました。", "en": "Before coming to Japan, I studied Japanese — 来る, not 来た."}]},
  "nagara": {"setting": {"scene": "Marking, forty exercise books, and the staffroom radio left on because the room is otherwise quiet enough to hear the clock on the wall. Somebody comes in and asks what you are doing, and the honest answer has two verbs in it — both belonging to the same person, across the same stretch of the same afternoon.", "jp": "音楽を聞きながら勉強します。", "en": "I study while listening to music.", "pattern": "ながら"}, "extensions": [{"kind": "flip", "scene": "You ask her the same about her own evenings, and the pattern goes out as easily as it came in — two things, one body, happening across the same stretch of time.", "jp": "話しながら歩きました。", "en": "We walked while talking."}, {"kind": "wrinkle", "wr": 0, "scene": "You say it the other way round and change what you claimed to be doing. The verb after the joint is the main one, so the order is not decoration — it decides which activity you were actually engaged in.", "jp": "勉強しながら音楽を聞きます。", "en": "Listening to music, with studying alongside — the priority flipped."}]},
  "taritari": {"setting": {"scene": "Monday morning and the small talk is about the weekend. You did five or six things, none in an order anyone needs, and two of them you would rather not go into. What the question wants is a flavour of two days rather than a timetable of them.", "jp": "週末は本を読んだり、映画を見たりします。", "en": "At weekends I read, watch films, that sort of thing.", "pattern": "たり"}, "extensions": [{"kind": "flip", "scene": "You ask her the same back and get a list built the identical way — a sample, openly incomplete, with the honest implication that there were other things and neither of you is listing them.", "jp": "音楽を聞いたり、散歩したりしました。", "en": "I listened to music, went for a walk, and so on."}, {"kind": "wrinkle", "wr": 0, "scene": "You drop the closing verb because the list already felt finished, and the sentence hangs unfinished instead. That final one is not decoration — it is carrying the tense for everything in front of it.", "jp": "読んだり見たりしました。", "en": "The closing します/しました holds the tense for the whole list."}]},
  "kata": {"setting": {"scene": "A character on a school form that you can see, copy and not read, in a word nobody will pronounce for you because everybody assumes you can. What you need is not the meaning but the method — and Japanese turns a verb into a way-of-doing-it by bolting one syllable onto its stem.", "jp": "漢字の読み方を教えてください。", "en": "Please teach me how to read this kanji.", "pattern": "読み方"}, "extensions": [{"kind": "flip", "scene": "It works on anything. The ticket machine at the station has beaten you twice, and the same construction turns using it into a noun you can ask a stranger about.", "jp": "使い方がわかりません。", "en": "I don't know how to use it."}, {"kind": "wrinkle", "wr": 0, "scene": "What comes out the other end is a full noun, which means the particle in front has to change — the thing you are reading stops taking the object marker and takes the glue from Step 3 instead.", "jp": "漢字の読み方がわかりません。", "en": "漢字の, not 漢字を — the result is a noun."}]},
  "toki": {"setting": {"scene": "You bought a suitcase for the move. Whether you bought it at home in the week you were packing, or in a department store three days after you landed, is a difference every listener hears — and it turns on one character in the sentence you tell it with.", "jp": "ひまなとき、音楽を聞きます。", "en": "When I'm free, I listen to music.", "pattern": "とき"}, "extensions": [{"kind": "flip", "scene": "You use it about your own childhood, which needs the noun version of the joint rather than the verb one — and nouns arrive at it through the same の from Step 3.", "jp": "子どものとき、東京に住んでいました。", "en": "When I was a child, I lived in Tokyo."}, {"kind": "wrinkle", "wr": 0, "scene": "Then the suitcase sentence, where the tense in front is measured against the other half of the sentence rather than against now. One character decides which country the shop was in.", "jp": "日本に行くとき、空港でかばんを買いました。", "en": "Bought on the way — this side's airport, before arrival."}]},
  "deshou": {"setting": {"scene": "Sports day is Saturday and the whole school is watching the forecast, because the decision to move it gets made on Friday afternoon by somebody who will ask what you think. The weather report itself never says will. It says something one notch below that, every single evening.", "jp": "明日は晴れるでしょう。", "en": "It'll probably be sunny tomorrow.", "pattern": "でしょう"}, "extensions": [{"kind": "flip", "scene": "Asked directly what you reckon, you hedge the same way about something you have no business being certain of — the shape lets you answer the question without pretending to knowledge you do not have.", "jp": "雨が降るでしょう。", "en": "It'll probably rain."}, {"kind": "extra", "t": "Said with the pitch rising, でしょう？ is a different move entirely — it means right?, fishing for agreement, and it is ね's pushier cousin. Falling, it hedges; rising, it presses. And だろう is the same word in plain register, common between friends.", "scene": "Somebody says it back to you with the tone going up at the end, and it is no longer a hedge — it is a request that you agree, which is a different thing to be handed.", "jp": "明日は晴れるでしょう？", "en": "It'll be sunny tomorrow, right? — rising, this presses."}]},
  "arimasu": {"setting": {"scene": "A restaurant with no pictures on the menu and no English on the wall, and the question you need is not whether they will help you but whether a thing exists on the premises. Japanese has two verbs for existing and the line between them is drawn by aliveness, strictly, with no exceptions for how much you care about the thing.", "jp": "机の上に本があります。", "en": "There's a book on the desk.", "pattern": "あります"}, "extensions": [{"kind": "flip", "scene": "At the next table there is a cat asleep on a chair, which is a fact about the same room needing the other verb entirely — because it is alive, and that is the only question the grammar asks.", "jp": "いすの上に猫がいます。", "en": "There's a cat on the chair."}, {"kind": "wrinkle", "wr": 0, "scene": "Then you ask the actual question, and the verb for existing turns out to cover having as well — which is how you ask a restaurant for an English menu without knowing the verb for have.", "jp": "英語のメニューはありますか。", "en": "Do you have an English menu? — existence covers possession."}]},
  "motteiru": {"setting": {"scene": "The bank form has a section about what you own, which is a strange thing to be asked in a language you are still assembling. Ownership has its own verb, and it sits in the continuing form you learned in Step 4 — because owning is a state you are in rather than an action you perform.", "jp": "車を持っています。", "en": "I have a car.", "pattern": "持っています"}, "extensions": [{"kind": "flip", "scene": "They ask whether you have a residence card on you, which you do, in the wallet where it has to live — the same verb, the same continuing shape, about the one object you are legally required to be carrying.", "jp": "カードを持っています。", "en": "I have my card with me."}, {"kind": "wrinkle", "wr": 0, "scene": "The next box asks about family, and the verb quietly refuses. People are never held — a brother is not a possession grammatically, so having one runs through the alive-existence verb instead.", "jp": "兄がいます。", "en": "I have an older brother — います, never 持っています."}]},
  "location": {"setting": {"scene": "Somebody at the station asks you for directions, in Japanese, on the assumption that you live here — which after four months you do. You know exactly where the bank is and cannot say it, because Japanese builds the place first and parks the thing in it afterwards.", "jp": "銀行は駅の前にあります。", "en": "The bank is in front of the station.", "pattern": "にあります"}, "extensions": [{"kind": "flip", "scene": "She asks about the post office too, which is behind the same building, and the second sentence comes out faster than the first because the frame is already built and only the landmark has moved.", "jp": "部屋は下にあります。", "en": "The room is downstairs."}, {"kind": "wrinkle", "wr": 0, "scene": "The landmark comes first and the relationship second, which is the reverse of the English. 机の上 is the desk's top — a place-noun built out of two nouns, and only then does anything get parked in it.", "jp": "机の上にあります。", "en": "It's on the desk — literally, at the desk's top."}]},
  "sb-nide2": {"setting": {"scene": "The same question from Step 2 comes back with something new attached: is something happening here, or simply located here. What has changed is that the existence verb can now sit on either side of that line, because it has a second job — an event being held somewhere is also a thing that exists.", "jp": "机の上に本があります。", "en": "The book exists there → に.", "pattern": "があります"}, "extensions": [{"kind": "flip", "scene": "The staffroom noticeboard says there is a party at the school tomorrow, and the same verb takes the other particle — because a party is not sitting there, it is happening there.", "jp": "明日、学校でパーティーがあります。", "en": "There's a party at school tomorrow — happening, so で."}, {"kind": "extra", "t": "The particle follows the meaning, not the verb. あります meaning exists takes に; あります meaning takes place takes で. Same word on the page, two different jobs, and only the sense tells you which particle it wants.", "scene": "You write both sentences down one under the other and the verb is identical in each. Nothing on the page distinguishes them except what the sentence is claiming about the world.", "jp": "部屋に机があります。学校で会議があります。", "en": "A desk exists in the room. A meeting happens at school."}]},
  "ageru": {"setting": {"scene": "You have been ill for a week and three separate people have done something about it — one lent you a heater, one brought soup, one went to the pharmacy. Telling that story needs three different verbs for what English calls giving, and which one you pick depends on which direction the kindness travelled.", "jp": "友達に本をあげました。", "en": "I gave my friend a book. (away from me)", "pattern": "あげました"}, "extensions": [{"kind": "flip", "scene": "The heater came the other way, toward you, and English would use the same verb for both. Japanese will not — giving that arrives at your side of the relationship has its own word and cannot borrow the other.", "jp": "友達が本をくれました。", "en": "My friend gave me a book — toward me, so くれる."}, {"kind": "wrinkle", "wr": 0, "scene": "The third one you tell from your own end rather than the giver's, which is the receiving verb — and its source takes the particle you would expect to mean a destination.", "jp": "先生に薬をもらいました。", "en": "I got medicine from the teacher — に marks the giver."}]},
  "iadj": {"setting": {"scene": "Apartment hunting again, because the lease is up in March and the agent wants a shortlist by Friday. Every sentence you need is a judgement about a room — big, cheap, cold, far — and the words that carry judgements in Japanese conjugate like verbs rather than sitting still like English adjectives do.", "jp": "この店は高くないです。", "en": "This shop is not expensive.", "pattern": "高くない"}, "extensions": [{"kind": "flip", "scene": "You saw one on Tuesday that was fine and one on Wednesday that was not, and reporting that needs the past — which the adjective builds itself, out of its own body, with no help from anything else in the sentence.", "jp": "広かったです。", "en": "It was spacious."}, {"kind": "wrinkle", "wr": 0, "scene": "Four shapes to own and two classic wrecks. Adding でした to an adjective is the first, because that ending belongs to nouns. Using the noun negative on it is the second, and both look completely reasonable coming out of English.", "jp": "高くなかったです。", "en": "It wasn't expensive — not 高いでした, not 高いじゃない."}]},
  "naadj": {"setting": {"scene": "The second flat is above a bakery on a street with no through traffic, and the word you want for it is one you have known for weeks — except that it behaves like a noun rather than like the words you learned in the last lesson, and it needs a syllable in front of the thing it describes.", "jp": "静かな町です。", "en": "It's a quiet town.", "pattern": "静かな"}, "extensions": [{"kind": "flip", "scene": "You tell the agent what you are after and the same word turns up at the end of the sentence instead of in front of a noun — where the extra syllable vanishes completely, because there is nothing for it to attach to.", "jp": "この部屋は静かです。", "en": "This room is quiet — な only before a noun."}, {"kind": "wrinkle", "wr": 0, "scene": "Which family a word belongs to has to be learned with the word, because the spelling lies. Two of the commonest end in the same kana as the other family and belong firmly to this one.", "jp": "きれいな部屋です。", "en": "A clean room — きれい ends in い and is な all the same."}]},
  "kute": {"setting": {"scene": "One sentence to describe the flat you want, into a phone, to an agent who has four minutes. You have the adjectives and you have been saying them one at a time in separate sentences, which sounds like a list read out by a machine.", "jp": "この部屋は広くて明るいです。", "en": "This room is spacious and bright.", "pattern": "広くて"}, "extensions": [{"kind": "flip", "scene": "The one you saw yesterday needs two words from the other family joined together, which uses a different connector — matching the joint to the family is the whole of the rule.", "jp": "静かで簡単でした。", "en": "It was quiet and straightforward — で for な-words."}, {"kind": "wrinkle", "wr": 0, "scene": "The chain takes its tense from the end, so the last word makes the whole thing past. And the joint only links qualities pulling the same way — for two that disagree, the sentence needs the but from Step 11.", "jp": "安くて、おいしかったです。", "en": "Cheap and good — the final word makes both past."}]},
  "narimasu": {"setting": {"scene": "Four months in, and the thing everybody comments on is that the weather has turned and so has your Japanese. Both are changes that happened without anybody doing anything on purpose, which is one verb in Japanese and the it-happens twin of the pair you met in Step 4.", "jp": "天気がよくなりました。", "en": "The weather got better.", "pattern": "なりました"}, "extensions": [{"kind": "flip", "scene": "Somebody says the second one to you at the end of a meeting, and it is the same verb doing the same job about a person rather than a season — a change that arrived rather than one anybody performed.", "jp": "日本語が上手になりましたね。", "en": "Your Japanese has got good, hasn't it."}, {"kind": "wrinkle", "wr": 0, "scene": "How the word in front joins depends on its family — one drops its last kana and takes a different one, the other takes に — and the commonest adjective in the language is irregular in exactly this spot.", "jp": "よくなりました。", "en": "いい is irregular: よくなる, never いくなる."}]},
  "shimasu-change": {"setting": {"scene": "The staffroom is cold enough that two people are working in coats, and the heater controls are behind your desk. Somebody asks you to do something about it — which is the other twin of the verb you just learned, the one that needs a person to perform it and a thing to perform it on.", "jp": "部屋を暖かくしてください。", "en": "Please make the room warm.", "pattern": "暖かくして"}, "extensions": [{"kind": "flip", "scene": "You ask the same of the caretaker about the corridor, which nobody has heated since November — the same twin of the same verb, this time as your request, with a doer in the sentence and a thing being done to.", "jp": "部屋を静かにしてください。", "en": "Please make the room quiet."}, {"kind": "wrinkle", "wr": 0, "scene": "The pair sit one word apart and mean entirely different things about who is responsible. One says the room warmed up. The other says somebody turned the heating on, and that somebody is in the sentence.", "jp": "部屋が暖かくなりました。", "en": "The room warmed up — nobody did it."}]},
  "nisuru": {"setting": {"scene": "A restaurant with the whole section, a laminated menu you can read about a third of, and a waiter already standing at your elbow with a pad. The question he asks is the one every restaurant in the country asks, and the answer is a fixed pattern that means neither becoming nor doing but choosing between things.", "jp": "私はコーヒーにします。", "en": "I'll have the coffee.", "pattern": "にします"}, "extensions": [{"kind": "flip", "scene": "Somebody hesitates and you ask them the same question the waiter asked you, which is the shape you will use in every restaurant, ticket office and coffee shop from here on.", "jp": "何にしますか。", "en": "What will you have?"}, {"kind": "extra", "t": "One vowel from a different world: にします chooses, になります becomes. コーヒーにします orders a coffee; コーヒーになります is a prophecy. Both are grammatical, which is why the slip goes unnoticed by everyone except the waiter.", "scene": "You get one kana wrong and announce, to a waiter holding a pad, that you are going to turn into a coffee. He writes down what you meant, because context is generous, and you hear it a second later.", "jp": "コーヒーになります。", "en": "I will become coffee — one kana away from ordering one."}]},
  "amari": {"setting": {"scene": "Somebody has cooked and is asking whether you like it, and the honest answer is not very — which in English is a small negative and in Japanese is a whole grammatical contract. The adverb makes a promise at the front of the sentence that the ending has to keep.", "jp": "あまり高くないです。", "en": "It's not very expensive.", "pattern": "あまり"}, "extensions": [{"kind": "flip", "scene": "Later somebody asks about a dish you genuinely do not like, and this is the polite machinery for saying so — not the blunt word for dislike, but this adverb doing social work.", "jp": "あまり好きじゃないです。", "en": "I don't like it very much."}, {"kind": "wrinkle", "wr": 0, "scene": "Start the sentence with it and forget to finish negative, and the contract breaks halfway. The adverb is a promise of a negative ending, and the next lesson's adverb makes the same promise harder.", "jp": "あまり高くないです。", "en": "あまり高いです is broken — the ending must be negative."}]},
  "zenzen": {"setting": {"scene": "A meeting in which somebody speaks for six minutes about something you needed to understand, and afterwards asks, kindly, how much of it landed. The honest answer is at the far end of the same dial you learned last lesson, and it makes the same promise about how the sentence has to end.", "jp": "ぜんぜんわかりません。", "en": "I don't understand at all.", "pattern": "ぜんぜん"}, "extensions": [{"kind": "flip", "scene": "She asks whether it was too fast and you use it again about something else that was entirely absent — the adverb at the front, the negative at the end, the whole distance between them held open.", "jp": "ぜんぜん時間がありません。", "en": "There's no time at all."}, {"kind": "wrinkle", "wr": 0, "scene": "Then somebody at lunch uses it with a positive and nobody blinks, because casual speech bends this rule daily. Recognise it, enjoy it, and keep your own version negative in anything written or polite.", "jp": "ぜんぜん大丈夫。", "en": "Totally fine — real, common, and casual only."}]},
  "totemo": {"setting": {"scene": "Parents' evening again, a year on, and every sentence you say tonight is a judgement with a dial on it. There are four settings on that dial and you have been using one of them for everything, which makes twelve conversations sound like the same conversation.", "jp": "この映画はとても面白いです。", "en": "This film is very interesting.", "pattern": "とても"}, "extensions": [{"kind": "flip", "scene": "For a child who is nearly there rather than entirely there, you need the small setting instead — the same slot in the sentence, one notch down, and a completely different message home.", "jp": "ちょっと難しいです。", "en": "It's a little difficult."}, {"kind": "wrinkle", "wr": 0, "scene": "What the big one cannot do is go negative. For not very the language changes machinery altogether and reaches for last lesson's adverb, so the full dial runs across two different systems.", "jp": "あまり面白くないです。", "en": "Not very interesting — とても can't do this job."}]},
  "hou": {"setting": {"scene": "Two routes to work, and after four months of alternating you finally have an opinion. Somebody in the staffroom asks which is better and the answer is a frame with two slots — and the adjective inside it does not change shape at all, however hard English wants it to.", "jp": "電車よりバスのほうが安いです。", "en": "The bus is cheaper than the train.", "pattern": "のほうが"}, "extensions": [{"kind": "flip", "scene": "You ask her the same about summer and winter, which is the small talk equivalent of a free square, and the frame goes out exactly as it came in with two new nouns dropped into the slots.", "jp": "夏より冬のほうが好きです。", "en": "I prefer winter to summer."}, {"kind": "wrinkle", "wr": 0, "scene": "Asked which of two you prefer, the answer keeps the second half of the frame and drops the first entirely — the thing being compared against has already been said, so it does not need saying again.", "jp": "猫のほうが好きです。", "en": "I prefer cats — より gone, のほうが stays."}]},
  "ichiban": {"setting": {"scene": "The children have worked out that you will answer questions about yourself, and have moved on from two-way comparisons to outright rankings — favourite food, favourite season, favourite animal, in that order, every lunchtime. Two things compare with last lesson's frame; three or more crown a winner, and crowning needs a different word entirely.", "jp": "果物のなかでりんごがいちばん好きです。", "en": "Of all fruit I like apples best.", "pattern": "いちばん"}, "extensions": [{"kind": "flip", "scene": "You turn it round on them, which buys four minutes and gets the whole class talking — the group takes one frame, and the thing being crowned takes the particle that has been following 好き around all step.", "jp": "野菜のなかで何がいちばん好きですか。", "en": "Which vegetable do you like best?"}, {"kind": "wrinkle", "wr": 0, "scene": "The question word in that sentence takes the same particle it took back in Step 1, which has been quietly on duty ever since — and the adjective, again, does no work at all.", "jp": "誰がいちばん上手ですか。", "en": "Who is best at it? — question words take が."}]},
  "suki": {"setting": {"scene": "A welcome dinner for the new term, and the question going round the table is what music you listen to. The sentence you want has a thing you like sitting in the middle of it, and every instinct you own says that thing is the object of the verb.", "jp": "音楽が好きです。", "en": "I like music.", "pattern": "が好きです"}, "extensions": [{"kind": "flip", "scene": "You ask it back and get it wrong in the other direction, about a food you would rather avoid — because the blunt word for dislike lands far harder in Japanese than its English translation suggests.", "jp": "あまり好きじゃないです。", "en": "I don't like it much — the polite version of dislike."}, {"kind": "wrinkle", "wr": 0, "scene": "The error is completely predictable and survives a year if nobody corrects it. 好き is not a verb; it is describing a state, and the thing you like is grammatically what does the pleasing.", "jp": "音楽が好きです。", "en": "音楽を好きです is the classic wreck — が, always."}]},
  "jouzu": {"setting": {"scene": "Four months in, somebody tells you your Japanese is good, and it is not — it is better than it was, which is a different thing. What follows is a small ritual with two moves in it, and the word they used is one you must never point back at yourself.", "jp": "妹はピアノが上手です。", "en": "My sister is good at piano.", "pattern": "が上手です"}, "extensions": [{"kind": "flip", "scene": "Somebody asks what you are actually good at, and the honest answer needs the modest word instead — the one you use about your own strengths, because the other one aimed inward reads as boasting.", "jp": "料理が得意です。", "en": "Cooking is my strong suit."}, {"kind": "wrinkle", "wr": 0, "scene": "The second move of the ritual is the deflection, and it is not false modesty so much as the expected next line. Agreeing with the compliment is the move that actually lands badly.", "jp": "いえいえ、まだまだです。", "en": "Not at all, I've a long way to go."}]},
  "wakaru": {"setting": {"scene": "A parent is explaining something at speed and stops to check whether you are following. There are two words that both come out as understand in English and they are not interchangeable — one is having the information, the other is it making sense, and the negatives split harder than the positives do.", "jp": "日本語が少しわかります。", "en": "I understand a little Japanese.", "pattern": "わかります"}, "extensions": [{"kind": "flip", "scene": "Somebody asks whether you know a colleague by name, which turns out to be the other verb entirely — that one is about holding a piece of information rather than about anything becoming clear to you.", "jp": "知っています。", "en": "I know (of) her."}, {"kind": "wrinkle", "wr": 0, "scene": "The particle is the same trap as 好き, one lesson on. It helps to read the verb as is-clear-to-me rather than as understand, because then the が stops looking wrong.", "jp": "日本語がわかります。", "en": "Japanese is clear to me — hence が, not を."}]},
  "nogasuki": {"setting": {"scene": "A form for the school newsletter asks about hobbies, and every answer you want is a verb rather than a noun — reading, walking, cooking. Japanese will not let a verb take the particle that 好き demands until something turns the verb into a thing first, and Step 3 promised this job was coming.", "jp": "本を読むのが好きです。", "en": "I like reading books.", "pattern": "のが好き"}, "extensions": [{"kind": "flip", "scene": "You ask a colleague the same and her answer runs the identical machinery on a different verb — the plain form, then the one syllable that turns it into a noun, then the particle that was waiting for one.", "jp": "歌を歌うのが好きです。", "en": "I like singing."}, {"kind": "wrinkle", "wr": 0, "scene": "It only works on the plain form, and the object inside survives — so the sentence ends up carrying two particles doing two entirely different jobs, one inside the noun and one outside it.", "jp": "本を読むのが好きです。", "en": "を inside, が outside — 読みますのが is out."}]},
  "potential": {"setting": {"scene": "The phone shop again, a year on, and the question is whether the card in your hand will work in their machine. It is a question about capability rather than about anybody's intention, and Japanese builds that into the verb itself rather than adding a word in front of it.", "jp": "日本語が少し話せます。", "en": "I can speak a little Japanese.", "pattern": "話せます"}, "extensions": [{"kind": "flip", "scene": "You ask about the card, which is a capability belonging to an object rather than a person — the same form, and the grammar does not care that nobody involved has a will.", "jp": "この店でカードが使えますか。", "en": "Can I use a card in this shop?"}, {"kind": "wrinkle", "wr": 0, "scene": "How the verb bends depends on which family it is in, and the thing you are able to do switches its particle at the same time — from the object marker to the one this whole step has been drumming.", "jp": "朝早く起きられません。", "en": "I can't get up early — 起きる → 起きられる, negated."}]},
  "sb-transitive2": {"setting": {"scene": "Two unrelated particles are about to collide in the same paragraph. One is the が you learned in Step 4, belonging to the twin of a verb that happens by itself. The other is the が this whole step has been handing out to 好き, わかる and the potential form. Same kana, entirely different reasons.", "jp": "ドアが開きました。", "en": "The door opened by itself.", "pattern": "が開きました"}, "extensions": [{"kind": "flip", "scene": "One sentence later you use the other kind about something you like, and nothing on the page distinguishes them — which is fine as long as you know which of the two you are writing at the time.", "jp": "音楽が好きです。", "en": "I like music — the state-family's が."}, {"kind": "extra", "t": "The Step 4 self-check still holds and matters more here: を in front of an it-just-happens verb is always an error. What is new is that this step's compositions are full of both がs at once, so naming which one you are using keeps both honest.", "scene": "You write a paragraph with four of them in it and two are one kind and two the other. Reading it back, the only way to check is to ask of each one what job it thought it was doing.", "jp": "窓が閉まりました。日本語がわかります。", "en": "The window closed. I understand Japanese. Two がs, two reasons."}]},
  "sb-ganotwo": {"setting": {"scene": "This step's real subject is not comparison at all. It is が turning up in exactly the places English swears there should be an object, and the composition ahead is a minefield of them on purpose — every 好き, 上手, 下手 and わかる in anything you write deserves a second look before you hand it in.", "jp": "日本語がわかります。", "en": "I understand Japanese.", "pattern": "がわかります"}, "extensions": [{"kind": "flip", "scene": "You check your own newsletter paragraph and find three places where you reached for the object marker out of habit. All three are about states rather than actions, and all three want the other particle.", "jp": "新しいくつがほしいです。", "en": "I want new shoes — ほしい takes が too."}, {"kind": "extra", "t": "One more trap in the same family: 上手 is not used about yourself. 得意 states a strength plainly and modestly; 上手 aimed inward reads as self-praise, whatever the particle is doing.", "scene": "The last sentence of the paragraph is about something you are good at, and the particle is right while the word is not — modest about the grammar, immodest about the claim.", "jp": "料理が得意です。", "en": "Cooking is my strong suit — not 私は料理が上手です."}]},
  "kara-because": {"setting": {"scene": "The staffroom in August with the windows shut because of the insects and the air conditioning fighting a losing battle. Somebody has to say why they are opening one, and in Japanese the reason goes first and the consequence second — which is the mirror of the English sentence you are translating in your head.", "jp": "暑いから、窓を開けました。", "en": "Because it was hot, I opened the window.", "pattern": "から"}, "extensions": [{"kind": "flip", "scene": "Ten minutes later you leave early for the clinic, and saying why is the same shape with your own reason in front — the order stops feeling backwards somewhere around the fourth time you build it.", "jp": "頭が痛いから、帰ります。", "en": "I've got a headache, so I'm going home."}, {"kind": "wrinkle", "wr": 0, "scene": "Asked directly why, the reason can stand entirely on its own with nothing after it — and note the joint: this one takes a whole finished clause, where the から from Step 7 took a connector form.", "jp": "忙しいからです。", "en": "Because I'm busy — the reason alone, closed with です."}]},
  "node": {"setting": {"scene": "Leaving before the section head does, for the second time this week, with a genuine reason and no wish to sound like you are asserting it. There are two words for because and they differ in force: one states a reason, the other presents it as circumstance, and workplace exits reach for the second.", "jp": "頭が痛いので、帰ります。", "en": "I'm going home because I have a headache.", "pattern": "ので"}, "extensions": [{"kind": "flip", "scene": "An email to somebody senior about a deadline you will miss, where the softer of the two is doing real work — it hands over a circumstance rather than pushing a justification across the desk.", "jp": "時間がないので、明日します。", "en": "There's no time, so I'll do it tomorrow."}, {"kind": "wrinkle", "wr": 0, "scene": "A noun in front of it needs a syllable you would not predict — the same one that turns up before ん in the explanatory form from Step 3, doing exactly the same joining job.", "jp": "雨なので、行きません。", "en": "It's raining, so I won't go — 雨なので, never 雨だので."}]},
  "ga-but": {"setting": {"scene": "A restaurant recommendation you want to give honestly, which means saying two things that pull against each other in one sentence. The connector that joins opposing halves is a kana you already know as a particle, doing an entirely unrelated job in an entirely different position.", "jp": "高いですが、おいしいです。", "en": "It's expensive, but it's good.", "pattern": "が、"}, "extensions": [{"kind": "flip", "scene": "You use the casual cousin of it with the teacher you eat lunch with, which is the same joint one register down and by far the more common of the two in speech.", "jp": "忙しいけど、行きます。", "en": "I'm busy, but I'll go."}, {"kind": "wrinkle", "wr": 0, "scene": "Then it turns up as a cushion in front of a question, meaning almost nothing at all — not contradiction but courtesy, the polite throat-clearing before you ask a stranger for something.", "jp": "すみませんが、駅はどこですか。", "en": "Excuse me, but where's the station? — が as a cushion."}]},
  "demo": {"setting": {"scene": "Writing the first long thing you have written in Japanese — three paragraphs for the school newsletter — and everything you produce comes out as one enormous sentence, because the words you know for but and and then all join clauses. The ones that start new sentences are different words, and mixing them up is the visible learner seam.", "jp": "雨でした。でも、出かけました。", "en": "It was raining. But I went out.", "pattern": "でも"}, "extensions": [{"kind": "flip", "scene": "You break the second paragraph in half and open the new sentence with it, which is the only position it can take — and the paragraph immediately stops sounding like one breath.", "jp": "でも、時間がありませんでした。", "en": "But there wasn't any time."}, {"kind": "wrinkle", "wr": 0, "scene": "Mid-sentence, the job belongs to the other two words entirely. English uses one word in both positions, so the split has to be watched every single time you join two halves rather than start something new.", "jp": "雨でしたが、出かけました。", "en": "Same meaning, joined rather than started — が, not でも."}]},
  "toiu": {"setting": {"scene": "Somebody recommends a film and you catch the shape of the sentence but not the name inside it, which is the ordinary condition of your life here. The frame that attaches a name to a thing is one pattern — and run backwards it becomes the single most useful question a learner can own.", "jp": "「花」という映画を見ました。", "en": "I watched a film called 'Hana'.", "pattern": "という"}, "extensions": [{"kind": "flip", "scene": "You use it about the place near the station whose name you finally learned, which is the first time all month you have introduced something rather than asked about it.", "jp": "「さくら」という店に行きました。", "en": "I went to a shop called Sakura."}, {"kind": "wrinkle", "wr": 0, "scene": "Then the machine runs the other way. Anything you can point at, you can now get the name of — and the answer comes back inside the same frame you asked in.", "jp": "これは日本語で何といいますか。", "en": "What's this called in Japanese?"}]},
  "doushite": {"setting": {"scene": "A child has handed nothing in for a week and you have to ask why, in a language where the bare why-question presses considerably harder than its English translation does. The word itself is easy and you have known it since Step 1. The register it lands in, said flat to a twelve-year-old, is the whole of the problem.", "jp": "どうして遅れましたか。", "en": "Why were you late?", "pattern": "どうして"}, "extensions": [{"kind": "flip", "scene": "You answer one yourself at the end of the day, about the meeting you missed, and the reply comes back in the frame the question set up — the reason, closed off with the ending from two lessons ago.", "jp": "時間がなかったからです。", "en": "Because there wasn't time."}, {"kind": "wrinkle", "wr": 0, "scene": "Asked flat, it can land as a demand for justification rather than a question. The explanatory syllable from Step 3 cushions it into curiosity, and in real speech between people it is almost always there.", "jp": "どうして遅れたんですか。", "en": "Why were you late? — the ん softens the asking."}]},
  "nanika": {"setting": {"scene": "Half past nine at night in a town where two things are open, and the question is not what you want but whether you want anything at all. Japanese builds indefinite words out of the question words you already own, plus one kana — and the difference between them and the questions they came from is one syllable wide.", "jp": "何か食べたいです。", "en": "I want to eat something.", "pattern": "何か"}, "extensions": [{"kind": "flip", "scene": "Somebody asks where you are going on Sunday and the honest answer is nowhere decided yet — which is the same construction built on a different question word, and it works on every one of them.", "jp": "どこかへ行きます。", "en": "I'm going somewhere."}, {"kind": "wrinkle", "wr": 0, "scene": "Particles mostly drop off these, and the one-syllable difference decides what kind of answer you are asking for — whether you ate anything is a yes-or-no; what you ate is a list.", "jp": "何か食べましたか。", "en": "Did you eat anything? — a yes/no, not a what."}]},
  "sb-orthography": {"setting": {"scene": "The newsletter draft comes back from the teacher who checks it with four words changed out of kanji and into kana, and none of them were wrong. Which script a word gets is convention rather than rule, and over-using kanji is the more common learner error — not under-using it.", "jp": "きれいな部屋です。", "en": "Conventionally kana, even though 綺麗 exists.", "pattern": "きれい"}, "extensions": [{"kind": "flip", "scene": "You rewrite two more of your own on the same principle, and the paragraph stops looking like it was assembled out of a dictionary and starts looking like ordinary writing.", "jp": "ちょっと難しいです。", "en": "A little difficult — kana, by convention."}, {"kind": "extra", "t": "This is also why the checker treats script choice as a note rather than an error. A word written in kanji where convention prefers kana is not wrong; it is loud, and loudness is a register problem rather than a grammar one.", "scene": "Nothing you wrote would have been marked incorrect by anybody. It simply read as though it had been written by someone with a dictionary open, which after four months it had not been.", "jp": "部屋はきれいです。", "en": "Kana here reads as ordinary; kanji would read as formal."}]},
  "sb-waga2": {"setting": {"scene": "The two particles from Step 2 come back with everything you have learned since standing behind them. The topic set at the front of a sentence carries on through the contrast in the middle of it, which is a thing you could not have seen in Step 2 because you had no contrast to see it with.", "jp": "この店は高いですが、おいしいです。", "en": "Topic は carries through the contrast.", "pattern": "は"}, "extensions": [{"kind": "flip", "scene": "You write your own two-clause sentence about the flat and the topic set at the front holds for both halves without being said twice — which is most of what makes long sentences bearable to read.", "jp": "この部屋は広いですが、寒いです。", "en": "This room is spacious but cold."}, {"kind": "extra", "t": "The test has not changed since Step 2: if the sentence answers which one, it takes が; if it names what you are already discussing, it takes は. What has changed is the length of the sentences you are testing.", "scene": "The paragraph you have just written has six of them in it, and every single one still answers the same question the Step 2 test asked. The rule did not grow any more complicated; the sentences around it did.", "jp": "誰が来ましたか。— 田中さんが来ました。", "en": "Who came? — Tanaka did. Question and answer, both が."}]},
  "sb-pronouns2": {"setting": {"scene": "Step 3 told you to delete the word for I, and you took it to heart, and now you have deleted one that was doing a job. A describing clause needs its own subject inside it — and inside that clause, the subject takes the other particle, which is the part nobody warns you about.", "jp": "私が好きなスポーツはテニスです。", "en": "私 stays: the clause needs its own subject, and it takes が.", "pattern": "私が"}, "extensions": [{"kind": "flip", "scene": "You write another one about a book rather than a sport, and the same structure needs the same word in the same place — not because the sentence is about you, but because the clause inside it is.", "jp": "私が読んだ本は面白かったです。", "en": "The book I read was interesting."}, {"kind": "extra", "t": "The over-correction is real and it produces sentences that are wrong in a new way. Deleting every 私 is as mechanical as inserting every 私 was; what changed in Step 3 was the default, not the rule.", "scene": "Reading back a paragraph you pruned last week, two sentences have lost the subject of a clause — and now they describe somebody unspecified doing something you had meant to claim as your own.", "jp": "私が作った料理です。", "en": "It's food I made — drop 私が and the cook goes missing."}]},
  "sb-omou": {"setting": {"scene": "A planning meeting where you have an opinion and no wish to state it as fact, because you have been here five months and the people around the table have been here twenty years. Japanese puts the whole thought first and the reporting verb last, which is the same back-to-front shape as describing a noun with a clause.", "jp": "この店は高いと思います。", "en": "I think this shop is expensive.", "pattern": "と思います"}, "extensions": [{"kind": "flip", "scene": "Somebody asks what you reckon about the timing and you build your own — the clause in front stays plain however polite the ending gets, which is the whole division of labour.", "jp": "時間がないと思います。", "en": "I think there isn't time."}, {"kind": "extra", "t": "です never appears in front of と思います — 高いですと思います is wrong; it is 高いと思います. Nouns and な-adjectives take だ instead: 学生だと思います. And Japanese negates the thought rather than the reporting, so 来ないと思います is what gets said, not 来ると思いません.", "scene": "Your first attempt is polite in the middle, where the politeness does not belong, and your second negates the wrong half of the sentence — both of which sound like careful English and like nothing anybody here says.", "jp": "来ないと思います。", "en": "I think he won't come — negate the thought, not the thinking."}]},
  "passive": {"setting": {"scene": "Your name got read out in the morning meeting in connection with a form you had not been told about, and telling that story afterwards needs a shape where the thing happens to you rather than by you. English mostly avoids this by rearranging the sentence; Japanese bends the verb.", "jp": "私は先生に名前を聞かれました。", "en": "The teacher asked me my name.", "pattern": "聞かれました"}, "extensions": [{"kind": "flip", "scene": "You use it about something smaller and more annoying — the umbrella that went from the stand by the door — and the person responsible does not have to appear in the sentence at all.", "jp": "かさを取られました。", "en": "My umbrella was taken."}, {"kind": "wrinkle", "wr": 0, "scene": "Then the version English has no grammar for whatsoever: the weather doing something to you. Japanese lets an event happen to a person grammatically, and the sentence carries the grievance without a single word of complaint in it.", "jp": "雨に降られました。", "en": "I got rained on — the suffering passive."}]},
  "tara": {"setting": {"scene": "A trip with two colleagues and one of them wants a phone call when you land, which is a sentence with a condition in front of it and an instruction behind. Japanese has four words for if and this stage teaches two of them — and only one of the two can be followed by a request.", "jp": "時間があったら、行きます。", "en": "If I have time, I'll go.", "pattern": "たら"}, "extensions": [{"kind": "flip", "scene": "You make the promise yourself, to the colleague who asked for it, which is exactly the sentence this whole lesson exists for: a condition in front, and something you are undertaking to do about it behind.", "jp": "日本に着いたら、電話してください。", "en": "Call me when you get to Japan."}, {"kind": "wrinkle", "wr": 0, "scene": "The other one from this step cannot carry that. It describes something automatic, so a request behind it makes no sense — and the remaining two ifs are deferred to Stage 2, which is a deferral rather than an omission.", "jp": "冬になると、寒くなります。", "en": "When winter comes it gets cold — と is automatic, no requests."}]},
  "teshimau": {"setting": {"scene": "The gate at the station, and your wallet is not in your bag. You stand still and go back through the morning — the bakery, the bus, the bench outside where you sat to answer a message. Somebody you half know from the platform stops and asks what is wrong, and the sentence carries the regret inside the verb rather than beside it.", "jp": "財布を落としてしまいました。", "en": "I've gone and dropped my wallet.", "pattern": "てしまいました"}, "extensions": [{"kind": "flip", "scene": "Two hours later, at the police box filling in the lost-property form, the officer asks whether you have finished. You have — the whole thing, every box. Same ending, no regret in it at all this time, just completion.", "jp": "全部書いてしまいました。", "en": "I've finished writing it all."}, {"kind": "extra", "t": "Context picks the flavour, and the past tense with an unfortunate object almost always reads as regret. Do not reach for it on happy outcomes — 合格してしまいました reads as 'I regrettably passed'. In speech it compresses to ちゃう / じゃう, which is the culture stop two lessons ahead: 忘れちゃった IS 忘れてしまった.", "scene": "You tell a colleague you passed something using the same ending, meaning to sound modest about it, and it lands as though passing had been a misfortune that befell you.", "jp": "忘れちゃった。", "en": "Forgot it — the spoken compression of 忘れてしまった."}]},
  "teoku": {"setting": {"scene": "Golden Week is six weeks off and everybody in the staffroom has already booked. You have learned this the expensive way once: the trains sell out, the hotels sell out, and the difference between doing a thing now and doing it in May is whether the thing is possible at all. The verb has the later built into it.", "jp": "ホテルを予約しておきました。", "en": "I booked the hotel ahead — so that later works.", "pattern": "ておきました"}, "extensions": [{"kind": "flip", "scene": "You do the same for the person going with you, buying the tickets on a Tuesday for a trip in May, and the sentence says why you are doing it now rather than simply that you are doing it.", "jp": "チケットを買っておきます。", "en": "I'll buy the tickets in advance."}, {"kind": "extra", "t": "The trap is translating it as plain future. 買います says you will buy it; 買っておきます says you are buying it now so that later works. If you cannot name the later, you do not want this form.", "scene": "You use it about something with no later attached — a coffee, this afternoon — and it puzzles the person you say it to, because they are still waiting to hear what the preparation was for.", "jp": "買います。", "en": "Just buying it — no later, so no ておく."}]},
  "tearu": {"setting": {"scene": "You come into the meeting room ten minutes early and the window is open, the chairs are out, and the handouts are squared on the table. None of that happened by itself. Somebody came in before you and did it on purpose, and Japanese has a form that says exactly that — the state, with the intention still visible in it.", "jp": "窓が開けてあります。", "en": "The window has been opened — on purpose.", "pattern": "てあります"}, "extensions": [{"kind": "flip", "scene": "You do the same for the person after you, leaving the lights on and the board wiped, and say so on the way out — reporting a state you deliberately produced rather than an action you performed.", "jp": "電気がつけてあります。", "en": "The lights have been left on (for you)."}, {"kind": "extra", "t": "This corners the transitivity work from Steps 4 and 10, so slow down. 窓が開いている is intransitive + ている: it happens to be open, no story. 窓が開けてある is transitive + てある: somebody opened it and meant it. Same window, two different claims about the world.", "scene": "Later the same window is open again and this time nobody did it, because the catch is broken. The sentence has to change, because there is no longer any intention in the room to report.", "jp": "窓が開いています。", "en": "The window is open — no story, nobody's doing."}]},
  "temiru": {"setting": {"scene": "A new place has opened by the station and the queue outside it is the only recommendation anybody can give you. Nobody in the staffroom has been. The verb you need is not about effort or difficulty — it is about not knowing how a thing will turn out until you have done it.", "jp": "このケーキを食べてみました。", "en": "I tried the cake — to see.", "pattern": "てみました"}, "extensions": [{"kind": "flip", "scene": "You suggest it to somebody else the same week, which is the form's other half — an invitation to go and find out, with the outcome honestly unknown to both of you at the time of asking.", "jp": "行ってみませんか。", "en": "Shall we go and see?"}, {"kind": "wrinkle", "wr": 0, "scene": "You use it about a jar you cannot get the lid off, meaning that you struggled with it, and the form does not carry that at all — this is about an unknown result, not a hard task.", "jp": "食べてみます。", "en": "I'll try it and see — experiment, not effort."}]},
  "teikutekuru": {"setting": {"scene": "You have come to collect the new card and the clerk is explaining what happens next. Over sixteen and staying more than three months, you must have it on you every day — not a photocopy, not a photograph on your phone, the card itself, with a fine of up to two hundred thousand yen if an officer asks and you cannot produce it. She slides it across and tells you what to do with it.", "jp": "カードを持っていってください。", "en": "Take the card with you — away from here, from now on.", "pattern": "持っていって"}, "extensions": [{"kind": "flip", "scene": "Six weeks later you leave a spare key with the neighbour who signs for your parcels, and she asks whether to keep it or bring it back on Saturday. Same pair of verbs, your mouth, and the direction is the only thing that decides which.", "jp": "鍵を持ってきてください。", "en": "Please bring the key (here) — toward me."}, {"kind": "wrinkle", "wr": 0, "scene": "You have been saying this pattern since your first week without knowing it was one. The phrase you use walking out of the door every morning is these two verbs, fossilised.", "jp": "いってきます。", "en": "Off I go — and I'll come back."}]},
  "sb-aspect": {"setting": {"scene": "Four endings from this step all hang off the same connector form and all describe something continuing, which is why they blur. The window is a good test bench, because the same window can carry all four and mean four different things about who did what and when.", "jp": "窓が開いています。", "en": "It's open — a state, no story.", "pattern": "ています"}, "extensions": [{"kind": "flip", "scene": "You run the other three past the same window yourself. Somebody opened it deliberately; you are opening it now for later; you have gone and opened it when you should not have. One object, four claims.", "jp": "窓を開けておきます。", "en": "I'll open the window in advance."}, {"kind": "extra", "t": "Pick by what you are claiming, not by the verb. ている reports a state. てある adds that somebody intended it. ておく says you are doing it now for a later. てしまう says it went all the way, with regret optional. The four never compete for the same sentence once you know which question you are answering.", "scene": "The one that gets misused is てある, because English has no way at all to say that a state was somebody's doing without naming the somebody who did it and putting them in the sentence.", "jp": "窓が開けてあります。", "en": "Somebody opened it, on purpose — and is not in the sentence."}]},
  "teageru": {"setting": {"scene": "You were three days behind on marking after being ill and somebody quietly took half the pile. Reporting that in Japanese needs more than the verb for help, because there is a version of the sentence that states the labour and a version that thanks it, and native ears notice which one you chose.", "jp": "友達が宿題を手伝ってくれました。", "en": "A friend helped me with the homework.", "pattern": "てくれました"}, "extensions": [{"kind": "flip", "scene": "The following week you take somebody else's pile, and telling it from your own side needs the outward verb — which, said to the person's face, is the one to be careful with.", "jp": "妹の宿題を手伝ってあげました。", "en": "I helped my sister with her homework."}, {"kind": "wrinkle", "wr": 0, "scene": "Drop the kindness verb and the sentence still works and still reports the same event — it simply stops thanking anyone, and that absence is audible to everybody in the room.", "jp": "母が朝ごはんを作ってくれました。", "en": "My mother made breakfast for me — 作りました alone would be a cold report."}]},
  "ageru2": {"setting": {"scene": "A colleague is leaving at the end of the month and there are presents going in three directions at once — from the section to her, from her to the section, and one from you personally. Every one of those is the same event seen from a different seat, and Japanese makes you pick the seat before you pick the verb.", "jp": "田中さんが本をくれました。", "en": "Tanaka gave me a book — told from her side.", "pattern": "くれました"}, "extensions": [{"kind": "flip", "scene": "You tell the same event from your own end instead, which changes the verb and moves the particle onto the giver — and both sentences are equally true of one book changing hands.", "jp": "田中さんに本をもらいました。", "en": "I got a book from Tanaka."}, {"kind": "wrinkle", "wr": 0, "scene": "Mix the two frames and you reverse who did what. The verb and the particles have to be telling the same story, and checking that they are is the whole discipline of this lesson.", "jp": "田中さんがもらいました。", "en": "This says TANAKA received — the opposite event."}]},
  "itadaku": {"setting": {"scene": "The head of section spent forty minutes after work going through your kanji with you, which is a favour from a long way up. The giving verbs you have been using since Step 8 still apply — the directions and particles do not move — but the altitude of the other person does, and the verbs change clothes to match.", "jp": "先生に漢字を教えていただきました。", "en": "The teacher kindly taught me kanji.", "pattern": "いただきました"}, "extensions": [{"kind": "flip", "scene": "Told from her side of the desk rather than from yours, the same favour needs the elevated version of the toward-me verb — the same event, the same direction, and one rung further up.", "jp": "先生が教えてくださいました。", "en": "The teacher kindly taught me."}, {"kind": "wrinkle", "wr": 0, "scene": "The map is the one you already own with a second storey built on top: もらう becomes いただく, くれる becomes くださる, あげる becomes さしあげる, and not one of the directions moved an inch.", "jp": "いただきます。", "en": "The one you already say before meals — the same verb, all along."}]},
  "tehoshii": {"setting": {"scene": "The photograph for the leaving card needs taking and you are the only one who has not been asked to be in it. What you want is not a thing and it is not an action of your own — it is an action performed by somebody else, which is a third kind of wanting and gets its own machinery.", "jp": "友達に来てほしいです。", "en": "I want my friend to come.", "pattern": "てほしい"}, "extensions": [{"kind": "flip", "scene": "You use it on something smaller and more awkward, about a colleague who has been leaving the meeting-room window open in February — still your want, still about somebody else's action.", "jp": "窓を閉めてほしいです。", "en": "I want them to close the window."}, {"kind": "wrinkle", "wr": 0, "scene": "Three wants, three machines, and English covers all three with a single word. A thing, an act of your own, and an act of somebody else's — the middle one you have had since Step 6.", "jp": "水がほしい。飲みたい。飲んでほしい。", "en": "Want a thing / want to drink / want them to drink."}]},
  "sb-kuremorau": {"setting": {"scene": "Your car would not start and a neighbour drove you to work. That evening you tell it twice — once to somebody who asks how you got in, and once to somebody who asks who the man in the car was. Learners freeze mid-sentence choosing between the two verbs, and they are freezing in the wrong place.", "jp": "妹が写真を撮ってくれました。", "en": "My sister took the photo for me — her frame, が.", "pattern": "てくれました"}, "extensions": [{"kind": "flip", "scene": "Asked the other question, the frame moves onto you and the verb is forced — so the skill is picking whose story this is before you open your mouth, after which no decision remains.", "jp": "妹に写真を撮ってもらいました。", "en": "I had my sister take the photo."}, {"kind": "extra", "t": "The に in a もらう sentence is the GIVER, not a destination — 友達にもらいました is from the friend. English 'from' tempts から, which also works with people; に is simply the more common choice.", "scene": "You reach for the particle that means from, which is not wrong and is not what anybody around you actually says. The giver takes に, and it looks like a destination until it stops looking like one.", "jp": "友達にもらいました。", "en": "Got it from a friend — に marks the giver."}]},
  "kamo": {"setting": {"scene": "Sports day is Saturday and somebody has to decide by Friday lunchtime whether to move it. You have looked at the same forecast everyone else has looked at and you have no more idea than they do. What the sentence needs is a claim small enough to be honest.", "jp": "明日は雨かもしれません。", "en": "It might rain tomorrow.", "pattern": "かもしれません"}, "extensions": [{"kind": "flip", "scene": "Asked about a colleague's plans rather than about the weather, you hedge in exactly the same way — because somebody else's Saturday is precisely as unknowable to you as the sky over the field is.", "jp": "田中さんは来ないかもしれません。", "en": "Tanaka might not come."}, {"kind": "wrinkle", "wr": 0, "scene": "There is a certainty dial here and this step keeps adding stops to it — flat statement, then probably, then maybe. Swapping one for another changes how much you have promised the listener.", "jp": "明日は雨でしょう。", "en": "Probably rain — でしょう leans further than かも."}]},
  "hazu": {"setting": {"scene": "Somebody has not arrived and the meeting cannot start without them. You are not guessing here — you watched them buy the ticket on Wednesday and they messaged the section at seven this morning. This is expectation with evidence behind it, and Japanese keeps that firmly apart from a hopeful maybe.", "jp": "チケットを買いましたから、来るはずです。", "en": "He bought a ticket, so he should be coming.", "pattern": "はずです"}, "extensions": [{"kind": "flip", "scene": "You use it about a shop rather than about a person, on the strength of an opening-hours sign you read yourself last week — the receipts are the thing that earns you this form rather than the weaker one.", "jp": "今日は開いているはずです。", "en": "It should be open today."}, {"kind": "wrinkle", "wr": 0, "scene": "Run the same reasoning backwards and what you get is a flat denial: not that the thing is unlikely, but that the evidence you are already holding in your hand rules it out completely.", "jp": "そんなはずがありません。", "en": "There's no way — the reasoning, reversed."}]},
  "youda": {"setting": {"scene": "The flat opposite has had no lights on for a fortnight and the post is stacking up in the box downstairs. Nobody has told you anything. What you have is your own eyes, which is a specific kind of evidence and gets its own form.", "jp": "誰もいないようです。", "en": "Seems nobody's home.", "pattern": "ようです"}, "extensions": [{"kind": "flip", "scene": "You say the same about a colleague who has been at her desk since seven and has not touched the tea beside her — again judged by looking, not by anything anybody said.", "jp": "忙しいようです。", "en": "She seems busy."}, {"kind": "wrinkle", "wr": 0, "scene": "The casual cousin means the same thing and joins onto words differently, and よう turns out to be the choosier of the two about what it is willing to sit behind in a sentence.", "jp": "雨みたいです。", "en": "Looks like rain — みたい joins bare where よう wants の."}]},
  "rashii": {"setting": {"scene": "The bakery by the station has been shut a week with nothing on the door, and three people have given you three reasons — the owner's health, the rent, a daughter in Osaka. Not one of them has spoken to the owner. Somebody asks what you have heard, and the honest answer passes it on without vouching for it.", "jp": "田中さんは結婚するらしいです。", "en": "Apparently Tanaka's getting married.", "pattern": "らしい"}, "extensions": [{"kind": "flip", "scene": "You pass on the shop rumour yourself the same afternoon, in the same shape, and the form is doing something honest — it marks the sentence as second-hand rather than dressing it up as knowledge.", "jp": "閉まるらしいです。", "en": "Apparently it's closing."}, {"kind": "wrinkle", "wr": 0, "scene": "Then the same word turns up meaning something else entirely — not what you heard about a thing, but the thing being properly and characteristically itself, which context has to separate.", "jp": "彼は学生らしいです。", "en": "He's student-like — or: apparently he's a student. Context decides."}]},
  "souda-mite": {"setting": {"scene": "The sky over the school field has gone the colour it goes about twenty minutes before everything gets wet, and three hundred children are outside. Nobody has forecast anything. You are reading the sky itself, and the form for that attaches to the front half of the verb.", "jp": "雨が降りそうです。", "en": "Looks like rain any minute.", "pattern": "降りそう"}, "extensions": [{"kind": "flip", "scene": "You use it about a shelf in the staffroom that has been leaning since March, which is the same reading-from-appearance applied to something that has not actually happened yet and may never.", "jp": "落ちそうです。", "en": "It looks like it's about to fall."}, {"kind": "wrinkle", "wr": 0, "scene": "Two of the commonest adjectives in the whole language refuse this pattern outright and take shapes you simply have to learn whole, because nothing about the rule predicts either of them.", "jp": "よさそうです。なさそうです。", "en": "いい → よさそう, ない → なさそう."}]},
  "souda-denbun": {"setting": {"scene": "The forecast at seven said it plainly and you are repeating it to somebody who did not see it. This is not your judgement and not a rumour with a blurred source — there is a nameable thing that said so, and the form stands on it.", "jp": "明日は雨が降るそうです。", "en": "I hear it'll rain tomorrow.", "pattern": "降るそう"}, "extensions": [{"kind": "flip", "scene": "You relay something a colleague told you directly, which is the same form with a different source — and the confidence in it scales with how nameable that source is.", "jp": "会議は三時からだそうです。", "en": "I hear the meeting's from three."}, {"kind": "wrinkle", "wr": 0, "scene": "One kana apart from yesterday's lesson, and it changes what you are claiming about where the information came from — whether you looked at the sky yourself, or somebody told you about it.", "jp": "降りそう / 降るそう", "en": "Looks like rain / I hear it'll rain."}]},
  "sb-sou": {"setting": {"scene": "Three things ending in the same syllable arrive in the same week and mean different things: the sky looks like rain, the forecast says rain, and somebody agrees with you about the weather. One kana decides which, and misreading it claims sight where you meant rumour.", "jp": "雨が降りそうです。", "en": "The sky says so.", "pattern": "降りそう"}, "extensions": [{"kind": "flip", "scene": "You build the other two yourself in the same conversation, and the test is what stands in front of the syllable — the front half of a verb, or a whole finished one.", "jp": "雨が降るそうです。", "en": "The forecast says so."}, {"kind": "extra", "t": "The third is not this machine at all: そうですね is agreement, the conversational noise from Step 1 wearing the same syllables. Nothing in the writing separates the three — only what sits in front of them, and what the conversation is doing.", "scene": "Somebody says the third one back to you across a desk and for a moment you parse it as one of the other two, which is the entire reason this lesson exists at this point in the step.", "jp": "そうですね。", "en": "Agreement — not evidence at all."}]},
  "ba": {"setting": {"scene": "A student has been stuck on the same thing for three lessons and will not put a hand up. What you want to say is a plain logical consequence — do this, and that follows — with no invitation and no request attached to it, which is what this if is for.", "jp": "聞けば、わかります。", "en": "Ask, and you'll understand.", "pattern": "聞けば"}, "extensions": [{"kind": "flip", "scene": "You use it about yourself, in the staffroom, about the reading you cannot do — the same shape, a condition and its result, with the focus on what would follow.", "jp": "読めば、わかります。", "en": "If I read it, I'll understand."}, {"kind": "wrinkle", "wr": 0, "scene": "You have been conjugating this form since Step 5 without knowing it was one. The long obligation pattern you learned for medicine and deadlines is this if in disguise, doing precisely this job.", "jp": "飲まなければなりません。", "en": "If I don't drink it, it won't do — a ば-sentence all along."}]},
  "nara": {"setting": {"scene": "You are moving west and you mention it in the staffroom, and somebody asks what you are taking. Japan runs on two mains frequencies — Tokyo and everything east on 50 Hz, Osaka and everything west on 60 — because in the 1890s the Tokyo company bought German generators and the Osaka company bought American ones, and nobody ever unified them. Most modern appliances cope. Yours is fifteen years old.", "jp": "大阪なら、その電子レンジは使えません。", "en": "If it's Osaka — that microwave won't work.", "pattern": "なら"}, "extensions": [{"kind": "flip", "scene": "Somebody else mentions a trip to Kyoto and you hang advice off what they just said, which is what this if is for — it picks up the other person's topic rather than proposing one.", "jp": "京都へ行くなら、電車がいいですよ。", "en": "If Kyoto's the plan, the train's your friend."}, {"kind": "wrinkle", "wr": 0, "scene": "This is the only one of the four that can advise about something happening BEFORE its own condition — buy the ticket, then go. No other if can point backward like that.", "jp": "行くなら、チケットを買っておいてください。", "en": "If you're going, buy the ticket first."}]},
  "taradou": {"setting": {"scene": "A colleague has been at her desk until nine every night for a fortnight and has started making the kind of small mistakes that people make when they are tired. Saying so directly is not available to you. What is available is advice wearing the clothes of a question.", "jp": "先生に聞いたらどうですか。", "en": "How about asking the teacher?", "pattern": "たらどうですか"}, "extensions": [{"kind": "flip", "scene": "You aim it at the actual problem rather than at a convenient proxy, and cushion it — because the same words delivered flat carry an accusation that the softened version does not.", "jp": "少し休んだらどうですか。", "en": "How about taking a bit of a rest?"}, {"kind": "wrinkle", "wr": 0, "scene": "Tone is the entire game with this one. Delivered flat and unhedged, it reads as why-haven't-you-already, which is the exact opposite of the thing the form was actually built to do.", "jp": "少し休んだらどうですか。", "en": "Keep it light — cushion it with 少し or でも."}]},
  "sb-if4": {"setting": {"scene": "Four words for if, and Stage 1 gave you two of them. The remaining two arrive here, and the choice between all four is not about grammar being fussy — each one makes a different claim about how the condition and the result are related.", "jp": "時間があったら、行きます。", "en": "If I have time, I'll go — one-off possibility.", "pattern": "たら"}, "extensions": [{"kind": "flip", "scene": "You build the automatic one about something that happens every single year without anybody's involvement, which is the version of the four that cannot be followed by a request or an invitation.", "jp": "冬になると、寒くなります。", "en": "When winter comes, it gets cold."}, {"kind": "extra", "t": "Two hard walls, everything else is tuning. と never precedes a request, an invitation or an act of will, because it describes automatic consequence. And なら is the only backward-pointing if. Where two feel right they often both are — choose by what you are claiming, not by fear.", "scene": "You try to attach a request to the automatic one and the sentence refuses on meaning rather than on form — nothing is ungrammatical, it simply claims something nobody in the room meant.", "jp": "東京に行くと、電話してください。", "en": "Wrong: と can't carry a request."}]},
  "you-vol": {"setting": {"scene": "Nine at night, the staffroom is down to two people, and the other one left an hour ago in everything but the physical sense. Nobody is deciding anything jointly here — this is the sentence you say to yourself, out loud, to make the getting-up happen.", "jp": "そろそろ帰ろう。", "en": "Right — time to head home.", "pattern": "帰ろう"}, "extensions": [{"kind": "flip", "scene": "Saturday, and you use it on a friend rather than on yourself, which is the same form pointed outward — the casual version of the let's you have had since Step 6.", "jp": "一緒に行こう。", "en": "Let's go together."}, {"kind": "wrinkle", "wr": 0, "scene": "The polite one you already know turns out to have been this form in a coat the whole time. Same meaning, same job, two registers, and which you reach for tracks who is standing in the room.", "jp": "行きましょう / 行こう", "en": "One meaning, two registers."}]},
  "youtoomou": {"setting": {"scene": "The visa runs to next March and the question of whether you stay has been sitting at the back of your head since about November. Nobody has asked you outright until now, over lunch, and the honest answer is not a decision and not a whim — it is something you have been carrying.", "jp": "来年、日本へ行こうと思っています。", "en": "I'm thinking of going to Japan next year.", "pattern": "と思っています"}, "extensions": [{"kind": "flip", "scene": "Somebody asks about something smaller — the course you keep mentioning — and the same shape says you have been turning it over rather than that you decided it just now.", "jp": "日本語を勉強しようと思っています。", "en": "I've been thinking of studying Japanese."}, {"kind": "wrinkle", "wr": 0, "scene": "Drop the continuing form and the sentence moves the decision to this second, which is a different claim about your own head — and the ています is doing exactly the state-work it has done since Step 4.", "jp": "行こうと思います。", "en": "I've just decided — deciding now, not carrying a plan."}]},
  "kotonisuru": {"setting": {"scene": "The form for next year's contract has been on the desk for eight days and has to go back on Friday. At some point on the Wednesday the turning-it-over stops and something else happens instead, and the language has a form for exactly that moment — the point where you become the one who chose.", "jp": "日本へ行くことにしました。", "en": "I've decided to go to Japan.", "pattern": "ことにしました"}, "extensions": [{"kind": "flip", "scene": "You use it on something small the same afternoon, about the smoking you have been meaning to stop, and it is the same form doing the same job on a much smaller decision.", "jp": "たばこをやめることにしました。", "en": "I've decided to give up smoking."}, {"kind": "wrinkle", "wr": 0, "scene": "Put the continuing form on it and the decision stops being a single moment and becomes a rule you re-make every morning, which is what a habit actually is when you look at it closely.", "jp": "毎朝散歩することにしています。", "en": "I make it a rule to walk every morning."}]},
  "kotoninaru": {"setting": {"scene": "You find out at the Monday meeting, along with everybody else, that you are going to the Tokyo office next month. Nobody consulted you and nobody is pretending they did. There is a form for a decision that arrived rather than one you made, and it is not passive-aggressive — it is simply how the announcement is shaped.", "jp": "来月、東京へ行くことになりました。", "en": "It's been decided — I'm off to Tokyo next month.", "pattern": "ことになりました"}, "extensions": [{"kind": "flip", "scene": "You relay it to somebody outside the section the same way, and the form does something useful: it reports the outcome without putting anybody in the sentence to be blamed or thanked for it.", "jp": "会議は三時からになりました。", "en": "The meeting's been moved to three."}, {"kind": "wrinkle", "wr": 0, "scene": "With the continuing form on it, it stops being an announcement and becomes a standing arrangement — the way things are done here, with no decider visible anywhere in the sentence at all.", "jp": "ここでは靴を脱ぐことになっています。", "en": "Shoes come off here — that's just how it is."}]},
  "yotei": {"setting": {"scene": "Two questions in one conversation that sound identical in English. What do you intend to do in August, and what is actually in the calendar for August. One of those lives in your chest and one of them lives on a shared spreadsheet the office can see, and Japanese does not use the same word for both.", "jp": "明日、京都へ行く予定です。", "en": "I'm scheduled to go to Kyoto tomorrow.", "pattern": "予定です"}, "extensions": [{"kind": "flip", "scene": "Asked about the same trip by a friend rather than by the office, you switch to the one that reports intention instead — both are true of one journey, and you pick by which you are being asked about.", "jp": "京都へ行くつもりです。", "en": "I intend to go to Kyoto."}, {"kind": "wrinkle", "wr": 0, "scene": "The distinction survives even when the two disagree, which is the useful case: something can sit on the calendar that you have no intention of doing, and something can be fully intended and nowhere in writing.", "jp": "来年、帰る予定です。", "en": "Scheduled to go home next year — the calendar's version."}]},
  "youninaru": {"setting": {"scene": "Somebody at the year-end party says your Japanese has changed and you disagree, and then realise on the train home that you understood most of the party. Nothing happened on any particular day. What the sentence has to report is the arrival of a change rather than an event.", "jp": "日本語が話せるようになりました。", "en": "I've become able to speak Japanese.", "pattern": "ようになりました"}, "extensions": [{"kind": "flip", "scene": "You say it about a habit rather than an ability, about the mornings that used to be impossible, and it is the same claim — a new state, arrived at, with no single moment to point to.", "jp": "毎朝早く起きるようになりました。", "en": "I've got to where I get up early."}, {"kind": "wrinkle", "wr": 0, "scene": "It runs in the other direction too, and the reverse is the one people forget — a thing you used to do and have stopped doing is the same arrival, arriving negatively.", "jp": "たばこを吸わなくなりました。", "en": "I've stopped smoking — the change, arriving the other way."}]},
  "younisuru": {"setting": {"scene": "The difference between the person who improved and the person who did not is usually not talent, and at some point you decide to be deliberate about it. This form is the effort rather than the result — the steering, before there is anything to report.", "jp": "毎日日本語を話すようにしています。", "en": "I make a point of speaking Japanese every day.", "pattern": "ようにしています"}, "extensions": [{"kind": "flip", "scene": "You use it about something you are trying to stop rather than start, which takes the negative inside the clause and leaves the steering machinery on the outside completely untouched.", "jp": "たばこを吸わないようにしています。", "en": "I'm making a point of not smoking."}, {"kind": "wrinkle", "wr": 0, "scene": "Put this lesson beside the last one and you have the entire arc of a habit in two sentences: the trying, and then months later, without any particular day to point at, the arriving.", "jp": "早く起きるようにしています → 早く起きるようになりました", "en": "The effort, then the arrival."}]},
  "sb-suru-naru": {"setting": {"scene": "One axis runs through this entire step and it is not really about grammar: did you choose it, or did it come about? Every pair in the step splits on that one question, and Step 9's warming-the-room versus the-room-warmed was the first rung of the very same ladder.", "jp": "日本へ行くことにしました。", "en": "I chose it — する.", "pattern": "ことにしました"}, "extensions": [{"kind": "flip", "scene": "You build the other half about the same trip, as though the office had decided it, and nothing changes except who is holding the steering wheel — which is the only thing this axis measures.", "jp": "日本へ行くことになりました。", "en": "It was decided — なる."}, {"kind": "extra", "t": "Culture bends the grammar here and it is worth knowing before you mis-hear somebody. Announcements often prefer なる even for things that were plainly chosen — 結婚することになりました is the standard wedding announcement, and nobody hears it as an accident. When you hear なる, do not assume nobody chose.", "scene": "Somebody announces their own wedding using the it-was-decided form and for a second you almost congratulate them on their bad luck, before the register catches up with what they actually meant.", "jp": "結婚することになりました。", "en": "We're getting married — chosen, announced modestly."}]},
  "kotogadekiru": {"setting": {"scene": "A form for a course you want to take, with a box asking what you can do, and a space for it in writing rather than in conversation. You have had the short potential form since Step 10 and it is not wrong here — but written Japanese leans on the longer, flatter version, and this is the register the box is asking for.", "jp": "日本語を話すことができます。", "en": "I can speak Japanese — stated formally.", "pattern": "ことができます"}, "extensions": [{"kind": "flip", "scene": "You use it about something narrower further down the same form, where the formality is doing real work — a claim about capability on a document that somebody is going to file and keep.", "jp": "漢字を読むことができます。", "en": "I can read kanji."}, {"kind": "wrinkle", "wr": 0, "scene": "You try to combine it with the short potential you already know, stacking two ability machines into a single sentence, and the result means nothing at all in any register of the language.", "jp": "話せることができる", "en": "Wrong — one ability machine per sentence."}]},
  "takotogaaru": {"setting": {"scene": "A new colleague arrives and the getting-to-know-you questions start, and half of them are about whether you have ever done a thing rather than when you did it. English uses a tense for this; Japanese uses a whole construction, and the difference is that this one refuses to carry a date.", "jp": "日本へ行ったことがあります。", "en": "I've been to Japan.", "pattern": "たことがあります"}, "extensions": [{"kind": "flip", "scene": "You ask it back about something specific, which is the shape most of this conversation will take for the next twenty minutes — ever, at any point, with no interest in which year.", "jp": "すしを食べたことがありますか。", "en": "Have you ever eaten sushi?"}, {"kind": "wrinkle", "wr": 0, "scene": "Put a date in the sentence and the whole construction becomes wrong, because you have stopped asking about experience and started reporting an event — and the plain past does that job already.", "jp": "去年、日本へ行きました。", "en": "Went last year — a WHEN means plain past, not ことがある."}]},
  "kotogaaru": {"setting": {"scene": "The medical form asks how often rather than whether, and there is a row of boxes between always and never that you have no vocabulary for. What you need is a way to say that a thing happens sometimes — not habitually, not never, just occasionally enough to be worth writing down.", "jp": "朝ごはんを食べないことがあります。", "en": "Some mornings I skip breakfast.", "pattern": "ことがあります"}, "extensions": [{"kind": "flip", "scene": "The doctor asks about something else in the same shape, and you answer it yourself — the construction reports frequency somewhere between rarely and regularly, which is where most true answers live.", "jp": "時々、日曜日も働くことがあります。", "en": "Sometimes I work Sundays too."}, {"kind": "wrinkle", "wr": 0, "scene": "One kana of tense in front separates this from last lesson entirely. Past means ever, across a whole life. Present means sometimes, in an ordinary week. Nothing else in the sentence changes at all.", "jp": "食べたことがある / 食べることがある", "en": "Have eaten, ever / sometimes eat."}]},
  "sugiru": {"setting": {"scene": "The end-of-year party, the second one this week, and the walk to the station is being done slowly by everybody. What you want to say is not that you ate a lot but that you ate more than was wise, which is a judgement rather than a measurement and gets its own suffix.", "jp": "昨日は食べすぎました。", "en": "I ate too much yesterday.", "pattern": "すぎました"}, "extensions": [{"kind": "flip", "scene": "You use it about something that is not food, about the evening rather than the meal, and it attaches to the front half of a verb exactly the same way.", "jp": "昨日は話しすぎました。", "en": "I talked too much last night."}, {"kind": "wrinkle", "wr": 0, "scene": "It chains with the regret ending from Step 13 so naturally that the two behave like one word, and in real speech the combination is what you will hear rather than either of them alone.", "jp": "テレビを見すぎてしまいました。", "en": "Watched too much television, alas."}]},
  "yasui-nikui": {"setting": {"scene": "Two textbooks for the same course, and the section head wants to know which to order for next year. One of them is not harder — it is worse laid out, with handwriting samples nobody can decipher. That distinction is the whole lesson: this pair describes the thing's character, not your ability.", "jp": "この本は読みやすいです。", "en": "This book is easy to read.", "pattern": "読みやすい"}, "extensions": [{"kind": "flip", "scene": "You say the opposite about the other one, and notice that the sentence blames the book rather than the reader — which is the point, and is also the tactful way to say it in a meeting.", "jp": "この字は読みにくいです。", "en": "This handwriting is hard to read."}, {"kind": "wrinkle", "wr": 0, "scene": "The easy-to half sounds exactly like the word for cheap and has nothing whatever to do with it — same sound, unrelated word, and only what it attaches to tells them apart.", "jp": "使いやすい / 安い", "en": "Easy to use / cheap — same sound, no relation."}]},
  "teiru3": {"setting": {"scene": "Third time this form has come round and this is the pass where the rule finally becomes sayable. Somebody asks where a colleague is, and the answer uses the same ending you have used for rain falling and for living in a city — three different jobs from one shape, and the verb decides which.", "jp": "田中さんは東京に行っています。", "en": "Tanaka has gone to Tokyo — and is there now.", "pattern": "行っています"}, "extensions": [{"kind": "flip", "scene": "You use it about yourself in the middle of doing something, which is the version you met first — and the shape has not changed at all between the two sentences.", "jp": "今、レポートを書いています。", "en": "I'm writing the report now."}, {"kind": "wrinkle", "wr": 0, "scene": "The rule, at last, in a form you can say out loud: a verb naming an instant change wears this as a result, and a verb naming an activity wears it as the middle. Knowing which you hold answers it every time.", "jp": "知っています。住んでいます。", "en": "Instant-change verbs, worn as results."}]},
  "aida": {"setting": {"scene": "You slept through your phone and there are two missed calls and a message from the office. Explaining it needs a stretch of time and something that happened inside that stretch, and Japanese makes you say which of the two you mean with one extra kana.", "jp": "寝ている間に、電話がありました。", "en": "While I slept, a call came.", "pattern": "間に"}, "extensions": [{"kind": "flip", "scene": "You use the other version about the same nap, where the action fills the whole span rather than landing at one point inside it — and the kana comes off.", "jp": "夏休みの間、日本語を勉強しました。", "en": "I studied Japanese all through the summer break."}, {"kind": "wrinkle", "wr": 0, "scene": "The main verb has to agree with the choice you made: one-shot events take the kana, span-filling actions do not. It is a promise about how the verb behaves rather than about the length of the time.", "jp": "授業の間、寝ていました。", "en": "Slept through the whole lesson — span, so no に."}]},
  "madeni": {"setting": {"scene": "Two sentences on the same staffroom whiteboard, both with times in them, and they mean opposite things about what happens at that hour. The meeting runs to three. The report has to be in by three. English leans on until for both, and the difference is a deadline.", "jp": "五時までに帰ります。", "en": "I'll be home by five.", "pattern": "までに"}, "extensions": [{"kind": "flip", "scene": "You write the other one for your own row on the board, about something that continues rather than something that completes, and the kana comes off again without anything else changing.", "jp": "三時まで会議があります。", "en": "There's a meeting until three."}, {"kind": "wrinkle", "wr": 0, "scene": "The verb test never fails and takes about a second: does the action continue up to the time, or complete by it? Continuing takes the short one, completing takes the long one.", "jp": "三時までにレポートを出します。", "en": "I'll hand the report in by three."}]},
  "tokoro": {"setting": {"scene": "A phone call at the exact moment you are putting your shoes on, asking whether you have left yet. There are three honest answers depending on which second you are standing in — about to, in the middle of, just finished — and Japanese has a single frame with three settings for exactly this.", "jp": "今、家を出るところです。", "en": "I'm just about to leave.", "pattern": "ところです"}, "extensions": [{"kind": "flip", "scene": "They ring again forty minutes later and the answer has moved two settings along the same frame, which is the only thing about the sentence that changed between the two calls.", "jp": "今、着いたところです。", "en": "I've just this second arrived."}, {"kind": "wrinkle", "wr": 0, "scene": "The just-finished setting is strictly this instant, and next lesson's near-synonym is not — which is why one of them can stretch to a month and this one cannot stretch past a minute.", "jp": "今帰ってきたところです。", "en": "Just got back — and it can only mean just now."}]},
  "bakari": {"setting": {"scene": "Six weeks in and somebody at a dinner asks how the Japanese is coming along. Six weeks is not new by the calendar — it is two pay slips and a haircut — but from the inside it is still the first week, and the question deserves the inside answer.", "jp": "先月、日本に来たばかりです。", "en": "I only just came to Japan.", "pattern": "ばかり"}, "extensions": [{"kind": "flip", "scene": "You use it about the job rather than about the country, which is also a small request folded into a statement about time — be patient with me, I have only just got here.", "jp": "始めたばかりです。", "en": "I've only just started."}, {"kind": "wrinkle", "wr": 0, "scene": "This one measures by feel and last lesson's measures by clock. A month can still be this if it still feels fresh; claiming the strict one about last month would simply be false.", "jp": "先月来たばかりです。", "en": "Elastic — where たところ could not stretch at all."}]},
  "naide": {"setting": {"scene": "A morning that went wrong in a specific way: the alarm, the train, and out of the door with nothing eaten. What the sentence has to report is not a reason for anything but the manner of the going — the same action, minus something that normally belongs in it.", "jp": "朝ごはんを食べないで学校へ行きました。", "en": "I went to school without breakfast.", "pattern": "ないで"}, "extensions": [{"kind": "flip", "scene": "You use it about the report you handed in, which was finished and not checked — again a manner rather than an excuse, and the distinction matters to how the sentence lands.", "jp": "読まないで出しました。", "en": "I handed it in without reading it."}, {"kind": "wrinkle", "wr": 0, "scene": "Written Japanese swaps in a shorter form that means exactly the same thing in formal dress. Worth recognising now on documents and notices, and worth producing yourself considerably later on.", "jp": "食べずに", "en": "Same meaning, written register — 〜ずに."}]},
  "sb-madeni": {"setting": {"scene": "The trap is real and it is not subtle once you see it: English leans on until for two things Japanese keeps apart. One is a stretch the action fills. The other is a deadline the action has to beat. Getting them the wrong way round tells your section head something untrue about when the work will exist.", "jp": "三時まで会議があります。", "en": "The meeting RUNS until three.", "pattern": "まで"}, "extensions": [{"kind": "flip", "scene": "You write the deadline version yourself for the thing you owe her by Friday, and the whole difference between the two rows on the board turns out to be one kana that converts a duration into a due date.", "jp": "三時までにレポートを出します。", "en": "I'll hand the report in by three."}, {"kind": "extra", "t": "The fix is the verb test, every time, and it takes a second. Does the action CONTINUE up to that time, or COMPLETE by it? Continuing takes まで. Completing takes までに. Nothing about the time itself decides it.", "scene": "You check both sentences on the board against the test and they sort themselves immediately, which is the point — the rule is mechanical once you ask the right question.", "jp": "五時まで待ちます。五時までに帰ります。", "en": "I'll wait until five. I'll be home by five."}]},
  "saseru": {"setting": {"scene": "A parent describing the evening routine at a parents' evening, and half of it is about getting a nine-year-old to do things he has no intention of doing. English uses make and let and keeps them apart; Japanese uses one form for both and lets the situation decide which you meant.", "jp": "母は弟に野菜を食べさせました。", "en": "Mum made my brother eat his vegetables.", "pattern": "食べさせました"}, "extensions": [{"kind": "flip", "scene": "You use the letting half yourself, about a child who wanted to finish something after the bell had gone, and it is the same conjugation carrying the opposite social weight entirely.", "jp": "子どもに歌を歌わせました。", "en": "I let the children sing."}, {"kind": "wrinkle", "wr": 0, "scene": "Hidden inside this form is the most useful polite request you will learn all year — asking permission by making yourself the person who is being allowed to do the thing.", "jp": "すみません、今日は早く帰らせてください。", "en": "Sorry — please let me leave early today."}]},
  "saserareru": {"setting": {"scene": "Half past one, and your class is cleaning the corridor they walk down every day — brooms, cloths, fifteen minutes of it, in the timetable rather than beside it. You say something about it to the teacher next to you, who is old enough to have done it himself for twelve years, and he laughs before he answers.", "jp": "毎日、そうじをさせられました。", "en": "I was made to do the cleaning every day.", "pattern": "させられました"}, "extensions": [{"kind": "flip", "scene": "You tell him about your own school in return, about an instrument nobody chose to play, and the form carries the grievance without a single word of complaint anywhere in the sentence.", "jp": "毎日、漢字を書かせられました。", "en": "I was made to write kanji every day."}, {"kind": "wrinkle", "wr": 0, "scene": "Two moves, in strict order — causative first, then passive — and speech contracts the long ones, so what you actually hear across a table is shorter than what you learn to build.", "jp": "飲まされました。", "en": "Made to drink — the contracted form you'll hear."}]},
  "meirei": {"setting": {"scene": "Sports day, and the entire field is shouting one word at a child running the last hundred metres. It is a bare command, the rudest form in the language, and nobody within a kilometre thinks it is rude — because cheering suspends the rudeness completely, which is the only everyday place it does.", "jp": "がんばれ！", "en": "Go on! You've got this!", "pattern": "がんばれ"}, "extensions": [{"kind": "flip", "scene": "You shout it yourself, which is the one time all year you will produce this form on purpose, and then you spend the rest of the year only recognising it.", "jp": "見て！", "en": "Look! — the softer everyday alternative."}, {"kind": "wrinkle", "wr": 0, "scene": "Production is rare and recognition is constant: signs, sports, fiction. Characters bark it at each other for dramatic reasons that do not transfer to a staffroom on an ordinary Tuesday.", "jp": "止まれ", "en": "STOP — on a sign, where it belongs."}]},
  "nasai": {"setting": {"scene": "The imperative you will actually meet in print, on every worksheet and every exam paper in the building, and on nobody's lips except a parent's. From a question sheet it is neutral instruction. Aimed sideways at an adult it is parenting them, and it lands exactly that way.", "jp": "早く寝なさい。", "en": "Go to bed.", "pattern": "なさい"}, "extensions": [{"kind": "flip", "scene": "You write it on a worksheet yourself, which is where it is entirely neutral — the same word doing an administrative job rather than a domestic one, and nobody reads anything into it.", "jp": "質問に答えなさい。", "en": "Answer the question."}, {"kind": "wrinkle", "wr": 0, "scene": "Downward only. Used at a colleague it does not read as brisk, it reads as talking to them like a child, and adult-to-adult requests stay with the forms from Step 5.", "jp": "答えてください。", "en": "Please answer — the sideways version."}]},
  "sb-rareru": {"setting": {"scene": "One shape, three readings, all arriving in the same fortnight: it can be done, it was done to me, and the polite form of a verb. Nothing on the page separates them. The rest of the sentence has to do the disambiguating, which is why this collision gets a lesson of its own.", "jp": "ここから山が見られます。", "en": "The mountain can be seen from here — potential.", "pattern": "見られます"}, "extensions": [{"kind": "flip", "scene": "You build the other reading of the identical shape, where something happened to somebody rather than being possible, and only the particles and the surrounding context tell the two of them apart.", "jp": "先生に名前を聞かれました。", "en": "The teacher asked me my name — passive."}, {"kind": "extra", "t": "ら抜き — 見れる, 食べれる for the potential — is widespread, genuinely useful because it disambiguates, and still marked wrong in formal writing. Recognise both; write the long one.", "scene": "Half the people around you drop the ら in speech, which removes the ambiguity you have just spent a lesson learning to live with — and a marker will still take it off you in writing.", "jp": "見れる", "en": "Spoken potential, ら dropped — clear, common, and marked wrong on paper."}]},
  "shi": {"setting": {"scene": "Somebody is choosing where to take a visiting inspector to lunch and has asked you, which means your answer needs to sound like a recommendation rather than a single reason. You have three reasons and no wish to rank them, and there is a joint that stacks them while implying there are more.", "jp": "安いし、おいしいし、あの店がいいですよ。", "en": "It's cheap, it's good — that place is the one.", "pattern": "し"}, "extensions": [{"kind": "flip", "scene": "You use it about why you are not going out on Sunday, where the same open-ended stacking works as a soft excuse — reasons among others, none of them the whole story.", "jp": "雨だし、時間もないし。", "en": "It's raining, I've no time…"}, {"kind": "wrinkle", "wr": 0, "scene": "One of these is enough to change the flavour. Even a single one hints at unnamed more, where the から from Step 11 names the reason and closes the list.", "jp": "安いから、あの店がいいですよ。", "en": "から names THE reason; し leaves the list open."}]},
  "noni": {"setting": {"scene": "You spent Saturday morning making something to take to a barbecue — the four-hour version, from scratch, because you wanted to turn up with something real. You arrive and there are three of the same thing already on the table, all shop-bought, and yours goes home again untouched.", "jp": "勉強したのに、忘れてしまいました。", "en": "I studied — and still forgot.", "pattern": "のに"}, "extensions": [{"kind": "flip", "scene": "You say it about the barbecue itself rather than about studying, and the joint carries an ache that the neutral but from Step 11 simply does not have available to it.", "jp": "作ったのに、誰も食べませんでした。", "en": "I made it, and nobody ate any."}, {"kind": "wrinkle", "wr": 0, "scene": "Left trailing and unfinished, it is reproach distilled — and the sentence does not need completing at all, because the ache inside it is already whole without any second half.", "jp": "せっかく作ったのに…", "en": "After I went to all that trouble…"}]},
  "temo": {"setting": {"scene": "Sports day again, the forecast is bad, and somebody has to say out loud what happens if it rains — because the answer is that it goes ahead regardless. That is a concession rather than a condition: the rain is granted first, and then overridden.", "jp": "雨が降っても、行きます。", "en": "Even if it rains, I'm going.", "pattern": "ても"}, "extensions": [{"kind": "flip", "scene": "You use it about a price rather than about the weather, conceding the objection and then continuing straight past it, which is exactly what makes this different from an if.", "jp": "高くても、買います。", "en": "Even if it's pricey, I'm buying it."}, {"kind": "wrinkle", "wr": 0, "scene": "Same rain, opposite spines: one form cancels the plan and this one overrides it. And the permission question from Step 5 was this joint all along — even if I do this, is it all right?", "jp": "降ったら行きません / 降っても行きます", "en": "たら cancels; ても overrides."}]},
  "sorede": {"setting": {"scene": "Telling a story of any length in Japanese means joining sentences rather than clauses, and the words that do that are not the ones you have been using inside sentences. Half of storytelling is the noises the listener makes, and one of these words is theirs rather than yours.", "jp": "雨が降りました。それで、家にいました。", "en": "It rained. So I stayed in.", "pattern": "それで"}, "extensions": [{"kind": "flip", "scene": "You add the one that piles on rather than concludes, which is what you want when the second sentence is more of the same rather than a consequence of the first.", "jp": "安いです。それに、おいしいです。", "en": "It's cheap. And what's more, it's good."}, {"kind": "wrinkle", "wr": 0, "scene": "Two social traps in one lesson. Opening a reply with the because-word can land as like-I-said; and the bare so-then with the pitch rising is the listener's nudge for you to keep going.", "jp": "それで？", "en": "…and then? — the listener's nudge, not yours."}]},
  "sb-noni": {"setting": {"scene": "Three ways to say but, and they are not interchangeable — they are three temperatures. One notes the contrast and moves on. One grants the objection and continues anyway. One aches. Picking the hot one for a trivial contrast is the error, and it reads as sulking.", "jp": "高いですが、買います。", "en": "Pricey, but I'm buying it — cool.", "pattern": "ですが"}, "extensions": [{"kind": "flip", "scene": "You build the middle temperature about the same purchase, conceding the price rather than merely noting it in passing, which is a different claim about how much the objection actually weighed.", "jp": "高くても、買います。", "en": "Even if it's pricey, I'm buying it."}, {"kind": "extra", "t": "のに is the strong stuff. Spent on trivia it reads as sulking; saved for a real betrayal of expectation it lands perfectly. When unsure, けど is never wrong — it is the neutral setting and nobody has ever been offended by it.", "scene": "You use the hot one about a shop being shut on a Tuesday, which is not a betrayal of anything, and it comes out sounding like a complaint about the universe.", "jp": "高いのに、買いました。", "en": "Save this heat for something that deserves it."}]},
  "kadouka": {"setting": {"scene": "The section head asks whether you are coming back next year and the honest answer is that you have not decided. Saying that in Japanese needs the undecided thing packed into a box and dropped into a sentence about deciding — a whole question, boxed, sitting where a noun would sit.", "jp": "行くかどうか、まだ決めていません。", "en": "Whether I'll go — still undecided.", "pattern": "かどうか"}, "extensions": [{"kind": "flip", "scene": "You ask her something in the same shape about a meeting nobody has confirmed yet, and the box behaves like any other noun in the sentence once it has been closed up.", "jp": "会議があるかどうか、わかりません。", "en": "I don't know whether there's a meeting."}, {"kind": "wrinkle", "wr": 0, "scene": "The politeness comes off inside the box. Boxes take plain contents only, and leaving the polite ending in is the error that marks a sentence as assembled rather than as spoken.", "jp": "学生かどうか", "en": "Never 学生ですかどうか — plain inside the box."}]},
  "ka-embed": {"setting": {"scene": "Same machinery as the last lesson, open question this time. Not whether somebody is coming but who — and the who has to go inside the box along with the rest of the question, after which the whole box sits inside a sentence about not knowing.", "jp": "誰が来るか、わかりません。", "en": "Who's coming — no idea.", "pattern": "来るか"}, "extensions": [{"kind": "flip", "scene": "You build one about a word rather than a person, which is the shape half your questions will take for the next year — asking about the content of something you cannot yet read.", "jp": "どういう意味か、わかりません。", "en": "I don't know what it means."}, {"kind": "wrinkle", "wr": 0, "scene": "Collision with Step 11: the same two kana standing alone mean somebody. The verb inside the box is the tell — a boxed question has one, and an indefinite has nothing at all.", "jp": "誰か / 誰が来るか", "en": "Somebody / who's coming — the verb tells you which."}]},
  "koto-no": {"setting": {"scene": "Two sentences about your younger brother five minutes apart. In the first you are reporting something you heard through the wall at eleven last night. In the second you are telling somebody what he is like — a standing fact, true whether or not anybody is listening.", "jp": "弟が歌うのを聞きました。", "en": "I heard my brother singing — live, sensed.", "pattern": "のを"}, "extensions": [{"kind": "flip", "scene": "The second sentence steps back out of the moment and into a standing fact about him, and the nominaliser cools accordingly — same brother, same verb, an entirely different distance.", "jp": "弟は歌うことが好きです。", "en": "He likes singing."}, {"kind": "wrinkle", "wr": 0, "scene": "Where both fit, one runs warm and spoken and the other cool and written. Where the houses are fixed there is no choice at all, and there are only two of those.", "jp": "読むのが好き / 読むことが好き", "en": "Warm and spoken / cool and written."}]},
  "toiuimi": {"setting": {"scene": "A word on a notice on the staffroom door that you can read aloud and cannot understand, which is a different problem from the one you have been solving all year. Up to now you have been asking what things are called. This asks what something means, and they are not the same question.", "jp": "すみません、どういう意味ですか。", "en": "Sorry — what does that mean?", "pattern": "どういう意味"}, "extensions": [{"kind": "flip", "scene": "You use it about a word somebody says rather than one you read, and it is the single most useful sentence in this step — the one that keeps a conversation going instead of ending it.", "jp": "その言葉はどういう意味ですか。", "en": "What does that word mean?"}, {"kind": "wrinkle", "wr": 0, "scene": "Keep the two learner-questions apart. One asks for the word and grows your vocabulary forwards; the other asks for the sense and grows it backwards from something you already met.", "jp": "何といいますか / どういう意味ですか", "en": "What's it called / what does it mean."}]},
  "sb-kotono": {"setting": {"scene": "Two nominalisers, and most of the time either one will do — which is exactly why the few places that refuse one of them are worth memorising rather than reasoning about. There are two fixed houses in the language and everything outside them is taste.", "jp": "泳ぐことができます。", "en": "I can swim — a fixed house, こと.", "pattern": "ことができます"}, "extensions": [{"kind": "flip", "scene": "You build the other fixed house, the experience one from Step 18, and it takes the same nominaliser for the same reason — the construction owns it, and no judgement is involved.", "jp": "行ったことがあります。", "en": "I've been — the other fixed house."}, {"kind": "extra", "t": "The error that grates most is の in こと's fixed house — 話すのができます. The fixed houses are few: 〜ことができる and 〜たことがある, always こと. Guard those two and the rest of the choice is taste rather than grammar.", "scene": "You put the warm spoken one into the ability construction, which is the one place in the language it cannot go, and the sentence stops being Japanese at that exact syllable.", "jp": "話すのができます", "en": "Wrong — ことができる owns its noun."}]},
  "garu": {"setting": {"scene": "A boy in your class has been at the window for ten minutes while the rest are outside. He has not said anything and you have not asked. You mention it to the teacher next to you, and what you have is what you can see — not what he told you, and not what you know.", "jp": "弟は公園へ行きたがっています。", "en": "My brother's desperate to go to the park.", "pattern": "たがっています"}, "extensions": [{"kind": "flip", "scene": "You say your own version of the same want straight out, because your own head is the one place you are allowed to report from directly — and the contrast between the two sentences is the whole lesson.", "jp": "私は行きたいです。", "en": "I want to go."}, {"kind": "wrinkle", "wr": 0, "scene": "The particle moves along with the machinery. Your own want leans on one of them; the observed behaviour takes the other, because a state has become something you are watching somebody do.", "jp": "水が飲みたい / 水を飲みたがっている", "en": "State takes が; observed behaviour takes を."}]},
  "hoshigaru": {"setting": {"scene": "Your sister has walked past the same shop window four times this month and has mentioned the bag in it twice without ever saying she wants it. You are not claiming to know her mind — you are reporting what anybody watching would have noticed, which is a different sentence.", "jp": "妹は新しいかばんをほしがっています。", "en": "My sister's got her eye on a new bag.", "pattern": "ほしがっています"}, "extensions": [{"kind": "flip", "scene": "Your own version of the same want takes the plain form and the other particle, and putting the two sentences side by side is the fastest way to feel the line the language is drawing.", "jp": "私はかばんがほしいです。", "en": "I want a bag."}, {"kind": "wrinkle", "wr": 0, "scene": "The particle swap is not decoration, it is the grammar itself: one marks the target of a state, the other marks the object of behaviour that you are standing there watching.", "jp": "かばんがほしい / かばんをほしがっている", "en": "State keeps が; behaviour takes を."}]},
  "sb-minds": {"setting": {"scene": "One line runs through the whole language and this is where it gets named: inner states are first-person territory. Your own wants go flat. Everyone else's reach you as signs, as appearances, or as words they said — and claiming direct access to another mind is the error this drill hunts.", "jp": "私は行きたいです。", "en": "Mine — stated directly.", "pattern": "行きたい"}, "extensions": [{"kind": "flip", "scene": "You report somebody else's want three different ways in one conversation — what you can see, what it looks like, and what they actually told you — and none of the three claims to be inside their head.", "jp": "行きたいと言っています。", "en": "He says he wants to go — reported, not claimed."}, {"kind": "extra", "t": "Questions are the exception that proves the rule: 行きたいですか asks the person directly, so たい is fine there — you are requesting the first-person report rather than faking it. The restriction is on asserting somebody else's insides, not on discussing them.", "scene": "You ask a colleague what she wants to do at the weekend using the plain form, and it is entirely correct — because asking somebody is not the same as claiming to know.", "jp": "何がしたいですか。", "en": "What do you want to do? — asking is fine."}]},
  "sb-keigo-what": {"setting": {"scene": "Somebody at work tells you the section head is coming, and uses a word you have never heard for it. You have been in this country long enough to order food, register an address and argue with a phone company, and a single sentence about somebody walking down a corridor has just gone past you completely. This is the point where most learners decide keigo is a wall.", "jp": "日本語を話します。", "en": "I speak Japanese — 丁寧語, and it is already keigo.", "pattern": "します"}, "extensions": [{"kind": "flip", "scene": "It is not a wall, and the proof is the sentence you have been saying since your first week. です・ます is 丁寧語. 丁寧語 is 敬語. You have been standing under this umbrella for twenty-three steps without anybody telling you what it was called.", "jp": "田中と申します。", "en": "My name is Tanaka — the same umbrella, one direction further."}, {"kind": "wrinkle", "wr": 2, "scene": "Step 5 taught you お茶 and ご飯 and called them polish. They had a name. And the interesting half is the ones that escaped — nobody hears politeness in ご飯 any more, because it stopped being a choice and became the word.", "jp": "ご飯・お名前・おビール", "en": "Frozen / a live dial / marked — one prefix, three jobs."}, {"kind": "wrinkle", "wr": 0, "scene": "One honest footnote, because the tidy four-room map you have just been handed is a simplification, and the fuller official version has five rooms rather than four. You will meet the extra one eventually and it is better not to be surprised by it.", "jp": "尊敬語・謙譲語Ⅰ・謙譲語Ⅱ・丁寧語・美化語", "en": "The official five, 2007 — this app teaches four."}]},
  "sonkeigo": {"setting": {"scene": "You ring the school office to ask whether a particular teacher is in today, and you have the sentence ready — you have had it since Step 8. 先生はいますか. What comes back is not an answer to that question but a version of it you did not recognise, asked back at you for confirmation.", "jp": "先生はいますか。", "en": "Is the teacher in? — the sentence you own.", "pattern": "いますか"}, "extensions": [{"kind": "flip", "scene": "What the office says is the same question with the teacher lifted a floor. Nothing about the grammar around it changed — only the verb, and only because of whose being-there it describes.", "jp": "先生は今日、学校にいらっしゃいますか。", "en": "Is the teacher at school today? — their action, raised."}, {"kind": "wrinkle", "wr": 0, "scene": "These verbs conjugate politely in a shape that will trip your ear before it trips your grammar, because they put an い where everything you know about る-verbs expects a り.", "jp": "いらっしゃいます・おっしゃいます・なさいます", "en": "Not いらっしゃります — the -aru verbs go irregular here."}, {"kind": "wrinkle", "wr": 1, "scene": "And nothing in this lesson is for your own sentences yet. Elevated verbs describe the other person, so pointed at yourself they do the one thing the whole system cannot say — which is why this step asks you only to recognise them.", "jp": "私はいらっしゃいます。", "en": "Wrong — you cannot elevate yourself."}]},
  "sb-ikukuru": {"setting": {"scene": "Three verbs you have kept carefully apart since Step 4 — being somewhere, going, coming — are about to become one word, and then a different one word depending on which way the sentence points. This is the single hardest recognition problem in the stage and it is worth slowing down for, because you will meet it on a platform this evening.", "jp": "先生はいますか。行きますか。来ますか。", "en": "Three separate questions — for now.", "pattern": "いますか"}, "extensions": [{"kind": "flip", "scene": "Going up, all three collapse into one. Which means the sentence you hear back is genuinely three questions wearing one coat, and the room rather than the grammar tells you which was meant.", "jp": "先生はいらっしゃいますか。", "en": "Is the teacher in — or coming? Both, and context decides."}, {"kind": "wrinkle", "wr": 0, "scene": "Coming down, two of them collapse into a different word — and you will hear it first not from a person but from a loudspeaker, several times a day, for as long as you live here.", "jp": "まもなく電車が参ります。", "en": "The train will arrive shortly — the company lowering its own train."}, {"kind": "wrinkle", "wr": 2, "scene": "The expensive mistake is aiming a down-verb at the person you meant to raise, and it is an easy one to make, because both words mean the same plain thing underneath and only the direction separates them.", "jp": "先生はおりますか。", "en": "Wrong — おる sends the teacher down."}]},
  "gozaimasu": {"setting": {"scene": "A hotel lobby, and you ask where the toilets are. You know exactly how this sentence works — お手洗いはどこにありますか — because あります has been yours since Step 8. The answer comes back with the shape intact and the verb replaced by something that sounds like it belongs to the building rather than to the person saying it.", "jp": "お手洗いはどこにありますか。", "en": "Where is the restroom? — the sentence you own.", "pattern": "ありますか"}, "extensions": [{"kind": "flip", "scene": "What you get is あります in formal dress. It honours nobody in particular — it is politeness aimed at the room at large, which is exactly why buildings speak it and friends never do.", "jp": "お手洗いは二階にございます。", "en": "The restroom is on the second floor."}, {"kind": "wrinkle", "wr": 0, "scene": "The negative is the shop's gentle no, and it is worth recognising before you need it — it is how a full restaurant turns you away without ever saying the word.", "jp": "申し訳ありません、席がございません。", "en": "Our apologies — there are no seats."}, {"kind": "wrinkle", "wr": 1, "scene": "And you have been saying one of these every day for a year without noticing it. The thanks you give a cashier, a driver and a colleague has ござる sitting quietly inside it, doing exactly this job.", "jp": "ありがとうございます。", "en": "The ござる was there all along."}]},
  "kenjougo": {"setting": {"scene": "A first meeting at a company, and the introduction is the one sentence you have rehearsed. 私は田中です. It is correct, it is polite, and it is not what anybody in the room is about to say about themselves — because introducing yourself is the doorway into the half of the system that points down.", "jp": "私は田中です。", "en": "I'm Tanaka — correct, and not what gets said here.", "pattern": "です"}, "extensions": [{"kind": "flip", "scene": "The version that gets said lowers your own act of naming yourself. It is the first humble verb almost every learner produces on purpose, and after it the rest of the set stops feeling exotic.", "jp": "田中と申します。", "en": "My name is Tanaka — 言う, lowered."}, {"kind": "wrinkle", "wr": 0, "scene": "Every plain verb that has an up-form turns out to have a down-twin as well, and the two halves of the map finally sit beside each other rather than arriving a step apart.", "jp": "いる → いらっしゃる↑・おる↓", "en": "Up for them, down for you — one plain verb, two directions."}, {"kind": "wrinkle", "wr": 1, "scene": "And the verb you say before every meal takes its seat on that map. It has been sitting in the humble column since your very first week here, doing this exact job.", "jp": "いただきます。", "en": "もらう, lowered — and your eating and drinking with it."}]},
  "sb-uchisoto": {"setting": {"scene": "You answer the office phone. It is a customer asking for your section head — the man you would never mention without さん inside these walls, who signs your leave and sits four desks away. He is out until three. You have to say so, to somebody outside the company, and every instinct you own is about to give you the wrong sentence.", "jp": "田中さんは出かけています。", "en": "Mr Tanaka is out — correct inside the office.", "pattern": "出かけています"}, "extensions": [{"kind": "flip", "scene": "Across the wall he loses his さん and takes a humble verb, and the thing to understand is that this is not disrespect aimed at him. You are lowering your entire side as one body, and the unity is the respect.", "jp": "田中はただいま外出しております。", "en": "Tanaka is out at the moment."}, {"kind": "extra", "t": "The axis is not you-versus-them, it is your side versus outside — うち and そと. Step 3's cc-family planted the instinct long before you could use it: your own mother is 母 to outsiders and お母さん at home, which is the same rule running on a noun instead of a verb.", "scene": "The rule is older than this lesson. You have been switching between two words for your own mother since Step 3, on exactly this axis, without anybody calling it one.", "jp": "母 / お母さん", "en": "Outward / at home — the same wall, drawn round a family."}, {"kind": "extra", "t": "And the axis MOVES. The same man is うち at work and そと at his daughter's school gate; the same colleague is うち to a customer and そと to your own section head. It is not a property of the person, it is a property of the boundary you are speaking across at that moment.", "scene": "At the school gate on Saturday you meet him again, in a room where you are both parents and neither of you is the company, and the whole thing rearranges itself.", "jp": "田中さんもいらっしゃいますか。", "en": "Is Tanaka coming too? — outside work, he is そと and goes back up."}]},
  "okeigo": {"setting": {"scene": "You need to say that the president has already gone home, and there is no special verb for it — the elevated list covers being, going, saying, eating, doing and looking, and 帰る is not on it. This is the moment the learner discovers the list is short and the language is not, and that keigo has a productive engine underneath the vocabulary.", "jp": "社長はもう帰りました。", "en": "The president has already gone home — plain polite.", "pattern": "帰りました"}, "extensions": [{"kind": "flip", "scene": "Two patterns cover every verb the special list skips. お plus the stem plus になる raises theirs; お plus the stem plus する lowers yours. You have been hearing both since Step 26 without being told the formula.", "jp": "社長はもうお帰りになりました。", "en": "The president has already gone home — raised."}, {"kind": "wrinkle", "wr": 0, "scene": "Where a special verb already exists it wins, and reaching for the pattern instead of the word sounds like somebody assembling their politeness out of a kit rather than speaking it.", "jp": "お食べになる", "en": "Off — 食べる already has 召し上がる."}, {"kind": "wrinkle", "wr": 1, "scene": "And the overreach that marks a nervous speaker more clearly than anything else is dressing the same verb twice over, when one dressing was the entire requirement and the second one only draws attention to the effort.", "jp": "ご覧になられる", "en": "二重敬語 — one dressing per verb."}]},
  "sb-keigo-map": {"setting": {"scene": "The same question — will you have coffee? — asked three times in one day. To a friend at lunch. To the colleague across the desk. To a visitor your section head has brought in, in the first thirty seconds of a meeting that matters. Three rooms, one question, and the whole system reduces to picking a height and holding it.", "jp": "コーヒーを飲む？", "en": "Want coffee? — plain, to a friend.", "pattern": "飲む"}, "extensions": [{"kind": "flip", "scene": "The middle altitude is the one you have lived in since Step 1 and it is correct almost everywhere. The top one raises their verb — and note that only their verb moves, because the rest of the sentence has no altitude to have.", "jp": "コーヒーを召し上がりますか。", "en": "Will you have coffee? — their verb, raised."}, {"kind": "extra", "t": "Pick the altitude once and hold it. The error that gets noticed is not choosing the wrong level — it is drifting between them mid-conversation, which reads as unstable rather than casual. And never both directions on one verb: keigo is a costume for their verbs and a bow for your own.", "scene": "Halfway through the meeting you relax and a single plain form slips in among the elevated ones. Nobody says anything about it and nobody needs to, because everybody in the room heard it happen.", "jp": "いただきます。", "en": "Your own drinking, lowered — the other direction, on your verb."}, {"kind": "extra", "t": "And never keigo at a friend, where it lands as comedy or, worse, as distance. Using the top altitude on somebody close is not extra respect; it is a wall, and they will hear it as one.", "scene": "You try the elevated version on the friend you eat lunch with every day, as a joke, and it is funny for about one second and then quietly cold in a way neither of you wants.", "jp": "召し上がりますか。", "en": "To a friend: comedy, then distance."}]},
  "okage": {"setting": {"scene": "The visa renewal came back approved, and it came back approved because somebody in the office spent forty minutes checking your paperwork line by line before you submitted it. Telling people it went through is easy. Telling them in a way that puts the credit where it belongs needs a word that から does not have.", "jp": "先生のおかげで、合格しました。", "en": "Thanks to my teacher, I passed.", "pattern": "おかげで"}, "extensions": [{"kind": "flip", "scene": "You write the thank-you the same evening, and the word does the work your English would have needed a whole extra sentence for — it names the cause and hands over the credit in one move.", "jp": "手伝ってくれたおかげで、間に合いました。", "en": "Thanks to your help, I made it in time."}, {"kind": "extra", "t": "It can be used sarcastically, and it lands hard when it is. 君のおかげで about a disaster is not a mistake anybody makes twice — the word is so firmly on the good side that putting a bad outcome behind it reads as a deliberate cut.", "scene": "Somebody uses it about a meeting that overran by two hours, and for a moment nobody in the room is quite sure whether it was a joke — which is how you learn that the word has only one side and putting a bad outcome behind it is always heard.", "jp": "君のおかげで、二時間かかりました。", "en": "Thanks to you, that took two hours — and everybody heard the edge."}]},
  "seide": {"setting": {"scene": "The form came back rejected over a date written in the wrong order, and the twenty minutes you now have to spend fixing it are not really yours to be annoyed about — you filled it in. Explaining what happened needs a word that says where the fault sits, and Japanese will not let you leave that unsaid.", "jp": "寝坊したせいで、遅刻しました。", "en": "I was late because I overslept.", "pattern": "せいで"}, "extensions": [{"kind": "flip", "scene": "You use it about yourself first, which is where it is safest and where it reads as ordinary rather than accusatory — the blame lands on you and nobody has to react to it.", "jp": "書き間違えたせいで、やり直しになりました。", "en": "Because I wrote it wrong, it has to be done again."}, {"kind": "extra", "t": "Aimed at a person it stops being a turn of phrase and becomes a real accusation. About yourself it is modest; about a colleague it is something you would have to mean, and there is a softer version — せいか — that turns the blame into a maybe.", "scene": "You nearly use it about the person who handed you the form in the first place, and stop, because the sentence would have been heard exactly as it was built — as blame, aimed at somebody standing two desks away.", "jp": "疲れているせいか、間違えました。", "en": "Perhaps because I'm tired, I made a mistake — せいか hedges the blame."}]},
  "bakarini": {"setting": {"scene": "One box on the residence application, left blank because you were not sure whether it applied to you, and the whole thing has come back. Not the difficult parts — those were fine. One box. The sentence for this is not the same as the sentence for an ordinary mistake, because the size of the cause and the size of the result do not match.", "jp": "一言言わなかったばかりに、大きな問題になりました。", "en": "Just because I didn't say one word, it turned into a real problem.", "pattern": "ばかりに"}, "extensions": [{"kind": "flip", "scene": "You use it about something smaller and older — a message you did not send, and the fortnight of confusion that followed — and the pattern carries the regret without you having to add a word of it.", "jp": "連絡しなかったばかりに、ずっと待たせてしまいました。", "en": "Just because I didn't get in touch, I kept them waiting all that time."}, {"kind": "extra", "t": "The disproportion is the entire point. A large cause with a large result is せいで's job — spend ばかりに on it and the pattern is wasted, because it promises unfairness and the sentence has not delivered any.", "scene": "You try it on something where the cause was genuinely serious and the result proportionate, and it comes out sounding like an excuse rather than a regret, because the pattern promises unfairness the facts do not supply.", "jp": "準備しなかったせいで、失敗しました。", "en": "A real cause, a real result — that is せいで, not ばかりに."}]},
  "sb-riyuu": {"setting": {"scene": "Four ways to say because, and you now have all of them. The difference between them is not politeness and it is not formality — it is whether the reason has an owner, and if so, whether that owner comes out of the sentence looking good or bad.", "jp": "雨だから、行きません。", "en": "It's raining, so I'm not going — から asserts, and owns nothing.", "pattern": "から"}, "extensions": [{"kind": "flip", "scene": "You rewrite the same explanation three times to watch the dial move, and only the middle word changes each time — neutral, then credited, then blamed. The facts are identical in all three sentences and the reader's impression is not.", "jp": "晴れたおかげで、できました。", "en": "It cleared up, so we managed it — and the weather gets the credit."}, {"kind": "extra", "t": "The error here is social rather than grammatical, which makes it the expensive kind. 雨のおかげで試合が中止になりました thanks the rain for ruining the match: perfectly formed, and it reads as sarcasm whether or not any was intended.", "scene": "So you check each sentence against its outcome before sending it, which takes about a second and turns out to be the whole discipline of this step — good result with the credit word, bad result with the blame word, and never crossed.", "jp": "雨のせいで、中止になりました。", "en": "Bad outcome, blaming word — matched."}]},
  "nitsuite": {"setting": {"scene": "Your first real email in Japanese that is not a request — a short note to the section about a change to the timetable. You know how to say the timetable and you know how to say changed, and you do not know how to say the sentence is ABOUT the timetable, which turns out to be the thing the whole email hangs on.", "jp": "この問題について話しましょう。", "en": "Let's talk about this problem.", "pattern": "について"}, "extensions": [{"kind": "flip", "scene": "You use it in the subject line as well, where it becomes についての and sits in front of a noun — which is how every notice on the staffroom wall has always been written.", "jp": "時間割についてのお知らせ", "en": "A notice regarding the timetable."}, {"kind": "extra", "t": "It needs a verb that can take a subject matter. 問題について行きます is not a sentence — you cannot go about a problem — and the mistake is easy because English lets about attach to almost anything.", "scene": "You write a sentence where について sits in front of a verb of movement, and it comes apart in a way nothing in English would have warned you about, because English lets about attach to nearly anything and Japanese does not.", "jp": "問題について考えました。", "en": "I thought about the problem — a verb that can hold a topic."}]},
  "nitaishite": {"setting": {"scene": "A parent has written in with a complaint, and you have been asked to draft the reply. The complaint is the thing you are answering — not the thing you are discussing — and Japanese keeps those two apart with two different particles that English blurs into one word.", "jp": "質問に対して、はっきり答えました。", "en": "I answered the question clearly.", "pattern": "に対して"}, "extensions": [{"kind": "flip", "scene": "You use it again in the same reply, about the school's position on the issue, where it points a stance at a target rather than naming a subject — and the noun in front is something being faced rather than discussed.", "jp": "その問題に対する学校の考えを説明しました。", "en": "I explained the school's position on the matter."}, {"kind": "extra", "t": "The overlap with について is real and the test is one question: can the noun be a topic of conversation, or is it something you are facing? You think ABOUT a problem and answer TO a question, and the two particles split exactly there.", "scene": "You swap the two particles once by accident and the sentence says you discussed the question rather than answered it, which is a different and noticeably more evasive claim to be making in a letter to a parent.", "jp": "質問について話しました。", "en": "I discussed the question — which is not the same as answering it."}]},
  "niyotte": {"setting": {"scene": "A form asking how you would like to be contacted, with a note underneath explaining that the answer varies depending on which office you are dealing with. Three separate uses of one particle on a single sheet of paper, and none of them is the one you learned first.", "jp": "人によって、意見が違います。", "en": "Opinions differ from person to person.", "pattern": "によって"}, "extensions": [{"kind": "flip", "scene": "You meet the second use the same afternoon, in a sentence about how a decision was reached rather than about how much things vary — the means rather than the variation, and nothing in the shape of the word tells you which.", "jp": "この方法によって、問題が解決しました。", "en": "The problem was solved by this method."}, {"kind": "extra", "t": "The third use is the passive agent, and it is the written one. In speech the agent takes に; によって belongs to reports and documents, so swapping them makes writing sound spoken and speech sound like a memo.", "scene": "You see it again on a notice about a building and realise it is doing the job に does in conversation, which is why formal Japanese reads as though it were written by a different language from the one spoken in the corridor.", "jp": "この本は夏目漱石によって書かれました。", "en": "This book was written by Sōseki — the written passive agent."}]},
  "nioite": {"setting": {"scene": "The letter confirming your contract renewal, which is one page long and contains no sentence you would ever say out loud. Halfway down is a word doing the job で does, in clothes で never wears, and recognising it is the difference between reading the letter and guessing at it.", "jp": "会議において、その問題が話し合われました。", "en": "The matter was discussed at the meeting.", "pattern": "において"}, "extensions": [{"kind": "flip", "scene": "You meet it again the same week on a notice about environmental policy, where it marks a field rather than a place — and the register is identical both times, which is the only thing the word reliably signals.", "jp": "日本における環境の問題", "en": "Environmental issues in Japan."}, {"kind": "extra", "t": "It does not stretch to ordinary places. 台所において料理します is wrong in the way a dinner jacket is wrong at breakfast: で is the word, and において is reserved for the abstract, the institutional and the ceremonial.", "scene": "You try it about your own kitchen as an experiment and it is immediately, obviously absurd — the word simply will not sit on a small physical place, and で snaps back into position without any effort at all.", "jp": "台所で料理します。", "en": "In the kitchen — で, and nothing else."}]},
  "nitotte": {"setting": {"scene": "A reference letter you have been asked to write for a colleague who is moving on, and the sentence that matters is the one about what the work meant to her. Not what it was — what it was to her, which is a different claim and needs a word that marks whose view it is.", "jp": "私にとって、この経験はとても大切です。", "en": "For me, this experience matters a great deal.", "pattern": "にとって"}, "extensions": [{"kind": "flip", "scene": "You use it about yourself in a form asking why you want to take the course, and it turns a flat statement into a positioned one — the same fact, now clearly a judgement made from somewhere rather than a claim about the world.", "jp": "私にとって、日本語は仕事の一部です。", "en": "For me, Japanese is part of the job."}, {"kind": "extra", "t": "The trap is plain に. 私に大切です is not the sentence — it is 私にとって大切です. And what follows must be a judgement rather than an action: にとって働きます is not a thing, because working is not an evaluation.", "scene": "You write it once with に alone and the sentence is not quite ungrammatical, only wrong in a way you cannot yet hear — which is the most expensive kind of error, because nothing in the room corrects it.", "jp": "学生にとって、その本は少し難しいです。", "en": "For students, that book is a little difficult."}]},
  "sb-fukugou": {"setting": {"scene": "Five shapes that all start with に, all take a noun, and all get translated as about or for at some point — which is exactly why meeting them one at a time is the slowest possible way to learn them. Laid out together they stop overlapping.", "jp": "問題について話す", "en": "Discuss the problem — subject matter.", "pattern": "について"}, "extensions": [{"kind": "flip", "scene": "You sort your own last three emails by which of the five each sentence actually needed, and two of them turn out to have been wrong in a way nobody mentioned at the time and nobody was ever going to.", "jp": "質問に対して答える", "en": "Answer the question — facing it, not discussing it."}, {"kind": "extra", "t": "When none of the five feels right, the plain particle usually was right all along. These are for when a sentence needs the extra distance — a noun held out as subject matter — and a paragraph that uses three of them reads as somebody testing new vocabulary.", "scene": "You take two of them back out of a draft and it reads better immediately — which is the lesson underneath the lesson, because these are for distance and a paragraph does not need distance in every sentence.", "jp": "私にとって大切です。", "en": "Important to me — the viewpoint one, and the one worth keeping."}]},
  "wakeda": {"setting": {"scene": "Somebody in the staffroom mentions, in passing, that you have been here eleven years. The person they are telling had assumed two or three, and you watch the arithmetic happen on their face. What they say next is not a question and not a new fact — it is the sound of something clicking into place.", "jp": "十年住んでいるんですか。道理で日本語が上手なわけですね。", "en": "Ten years? No wonder your Japanese is good.", "pattern": "わけです"}, "extensions": [{"kind": "flip", "scene": "You use it yourself an hour later, when somebody explains why the trains were a mess all morning, and the whole of your journey suddenly makes sense backwards rather than forwards.", "jp": "事故があったんですか。だから遅れたわけですね。", "en": "There was an accident? So that's why everyone was late."}, {"kind": "extra", "t": "It cannot open a conversation. わけだ concludes from something already on the table, so used cold it sounds like the end of a thought nobody heard the beginning of. And it is not から — から supplies a reason, わけだ receives one.", "scene": "You try it as an opening line and the other person waits for the part that was supposed to come first, because the word is a receipt for information rather than a delivery of it.", "jp": "電車が止まっていたから、遅れました。", "en": "から supplies the reason. わけだ would have received it."}]},
  "wakedewanai": {"setting": {"scene": "You have said, honestly, that you do not eat much natto — and you can see the conclusion forming on the other side of the table, which is that you hate it. You do not hate it. Denying that flatly would deny the thing you actually said, so what you need is a way to deny the inference and keep the fact.", "jp": "嫌いなわけではありませんが、あまり食べません。", "en": "It's not that I dislike it — I just don't eat much of it.", "pattern": "わけではありません"}, "extensions": [{"kind": "flip", "scene": "You use it about your own Japanese the same week, when somebody's compliment has drawn a conclusion considerably larger than the evidence supports and denying it flatly would be its own kind of dishonesty.", "jp": "全部わかったわけではありません。", "en": "It's not that I understood all of it."}, {"kind": "extra", "t": "It denies the inference, not the sentence. 全部わかったわけではありません means I did not understand ALL of it — not that I understood none. The difference matters, because the second is a far bigger claim and English speakers reach for it by accident.", "scene": "You hear the same shape used to walk back an impression without retracting a single word of fact, which is most of what it is for and most of why adults reach for it constantly.", "jp": "行きたくないわけじゃないです。", "en": "It's not that I don't want to go — the door stays open."}]},
  "beki": {"setting": {"scene": "A colleague has been covering for somebody who has not asked and has not thanked her, and she has not said anything about it for three weeks. You are about to give an opinion that is not advice and not a rule — it is a judgement about what a person ought to do, and Japanese has a word that carries exactly that weight.", "jp": "もっと早く言うべきでした。", "en": "You should have said something sooner.", "pattern": "べき"}, "extensions": [{"kind": "flip", "scene": "You use the negative version about yourself, about something you said in a meeting and regretted before the sentence had finished leaving your mouth — which is where this pattern is safest and most honest.", "jp": "そんなことを言うべきではありませんでした。", "en": "I shouldn't have said that."}, {"kind": "extra", "t": "It is heavier than English should. 帰るべきです to a colleague is not go home and rest — it is closer to you ought to leave, and it will be heard as a judgement rather than a kindness. For gentle advice, Step 16's たらどうですか is the tool.", "scene": "You nearly use it to suggest that somebody take a break, and swap it for the softer pattern in time, because what you meant was kindness and what the word carries is a verdict.", "jp": "少し休んだらどうですか。", "en": "How about a rest? — advice, not judgement."}]},
  "nichigainai": {"setting": {"scene": "The office is dark, the section head's coat is gone from the hook, and the meeting she called for four o'clock is nine minutes from starting. You did not see her leave. Everything you have is evidence, and the sentence you want is the strongest thing you can say that is still, honestly, a guess.", "jp": "電気が消えている。もう帰ったに違いない。", "en": "The lights are off — she must have gone home.", "pattern": "に違いない"}, "extensions": [{"kind": "flip", "scene": "You use it about an object rather than a person, on handwriting you recognise without having watched anybody write it — the evidence is complete and the conclusion still is not a fact.", "jp": "この字は先生のに違いありません。", "en": "This handwriting must be the teacher's."}, {"kind": "extra", "t": "It is a conclusion, not a fact. Used about something you actually witnessed it sounds like you are guessing about your own experience — and it is noticeably more written than spoken, where きっと does the same job with less weight.", "scene": "Somebody says it out loud in conversation and it sounds a shade formal, which is how you learn where it actually lives — in writing and in reasoning, rather than in the staffroom.", "jp": "きっと帰りましたよ。", "en": "She'll have gone home — the spoken version."}]},
  "monoda": {"setting": {"scene": "A first-year teacher has made the same mistake you made in your first year, and is taking it considerably harder than it deserves. What you want to say is not about this mistake — it is about how the world generally goes, which is a different kind of claim and needs a different ending.", "jp": "若い時は、失敗するものです。", "en": "When you're young, you make mistakes — that's how it goes.", "pattern": "ものです"}, "extensions": [{"kind": "flip", "scene": "The same word turns up that evening doing something quite different, when somebody older begins a sentence about how things used to be — the nostalgia use, which is far more common in speech than the general truth.", "jp": "学生の頃は、よく遊んだものです。", "en": "Back in our student days, we used to go out a lot."}, {"kind": "extra", "t": "It cannot describe one situation. 今日は寒いものです is wrong, because today's weather is not a general truth — the claim has to be one that would still hold next year. That restriction is what separates it from です.", "scene": "You try it about a single cold afternoon and it lands as though you were legislating about the weather, because the pattern claims a truth that would still hold next year.", "jp": "今日は寒いです。", "en": "Today is cold — a fact about today, so plain です."}]},
  "sb-kakushin": {"setting": {"scene": "Six ways to say how sure you are, built across three stages, and this is the first time they sit on one line. The gap between neighbouring stops is not decorative — each one commits you to a different amount, and English collapses the middle four into might and probably.", "jp": "明日は雨でしょう。", "en": "Probably rain — the forecast's own word.", "pattern": "でしょう"}, "extensions": [{"kind": "flip", "scene": "You place your own claims on the dial for a day and find you have been living at two stops out of six, which is why so much of what you say comes out either vaguer or firmer than you meant.", "jp": "買ったから、来るはずです。", "en": "He bought a ticket, so he should be coming."}, {"kind": "extra", "t": "わけだ sits outside this line entirely. It is not a degree of certainty — it is a conclusion drawn from one, which is why it needs something already said before it can work at all.", "scene": "You notice the difference the moment you try to open a sentence with わけだ and cannot — it needs something already on the table, which none of the six stops on the dial do.", "jp": "電気が消えている。帰ったに違いない。", "en": "Must have — the top of the dial, and the evidence closes it."}]},
  "hajimeru": {"setting": {"scene": "A reading habit you have been meaning to build for two years finally starts on a Tuesday, with a book you will take four months to finish. Reporting that it has begun needs a shape that bolts one verb onto another — and it is the easiest member of a family you will use constantly.", "jp": "八時に読みはじめました。", "en": "I started reading at eight.", "pattern": "はじめました"}, "extensions": [{"kind": "flip", "scene": "You use it about the weather within the hour, and notice that the compound works perfectly well on things nobody chose to start, which is not obvious from a pattern that looks like it is about intention.", "jp": "雨が降りはじめました。", "en": "It's started raining."}, {"kind": "extra", "t": "はじめる is the transitive twin and はじまる the intransitive one, but the compound only ever takes はじめる — 雨が降りはじまる is wrong even though the rain starts by itself. The compound describes the action, not the rain's autonomy.", "scene": "You reach for the wrong twin and the sentence is rejected by a rule that has nothing to do with who did the starting — the compound describes the action, and the action always takes はじめる.", "jp": "雨が降りはじめました。", "en": "The rain starts itself, and the compound still takes はじめる."}]},
  "owaru": {"setting": {"scene": "Four months later, the last page. The book has been on the desk long enough that finishing it is genuinely an event, and the sentence for it closes an action that had a length — which is what separates this from the ending you learned in Step 13.", "jp": "この本を読みおわりました。", "en": "I've finished reading this book.", "pattern": "読みおわりました"}, "extensions": [{"kind": "flip", "scene": "You use it about something smaller in order to arrange the evening, where the finishing is a condition for the next thing to happen rather than an announcement worth making in its own right.", "jp": "食べおわったら、行きましょう。", "en": "Let's go once we've finished eating."}, {"kind": "extra", "t": "It does not work on verbs with no duration. 死におわる is not a sentence — a thing has to take time before it can finish — and instantaneous verbs take Step 13's てしまう instead, which finishes an action and adds a feeling.", "scene": "You test it on something momentary and the compound simply refuses to attach, because a thing has to take some amount of time before it can be finished, and forgetting takes none at all.", "jp": "忘れてしまいました。", "en": "Forgetting has no duration, so it takes てしまう."}]},
  "kakeru": {"setting": {"scene": "Your desk, honestly described: three books with markers in them, a form filled in as far as the third box, and a message to the landlord that has been sitting half-typed since Thursday. English needs a whole phrase for each of those. Japanese puts it inside the verb.", "jp": "読みかけの本が三冊あります。", "en": "I've got three books on the go.", "pattern": "読みかけ"}, "extensions": [{"kind": "flip", "scene": "You use it about a sentence rather than an object — the thing you started to say in the meeting and then decided against — which is the same unfinishedness applied to speech.", "jp": "何か言いかけて、やめました。", "en": "He started to say something, then stopped."}, {"kind": "extra", "t": "It is not 〜ている. 食べています is eating, in progress, with somebody at the table. 食べかけています is left half-eaten and the room is empty. One is an action; the other is the state something got abandoned in.", "scene": "You use the wrong one about a plate on the table and describe somebody eating who in fact left an hour ago, which is a small error with a surprisingly large gap inside it.", "jp": "食べかけのケーキがあります。", "en": "There's a half-eaten cake — a state, not an action."}]},
  "nuku": {"setting": {"scene": "The application you have been assembling for five weeks, with the certified translations and the two documents that had to come from another country, finally goes in. Saying you completed it is true and thin. There is a verb ending that says you completed it and that completing it cost something.", "jp": "最後まで走りぬきました。", "en": "I ran it all the way to the end.", "pattern": "ぬきました"}, "extensions": [{"kind": "flip", "scene": "You use it about the thinking rather than the doing, which is where it is most at home — a decision made properly rather than quickly, and the effort is inside the verb rather than beside it.", "jp": "よく考えぬいて決めました。", "en": "I thought it through properly before deciding."}, {"kind": "extra", "t": "Do not spend it on easy things. 食べぬきました about a sandwich is comic, because the pattern promises difficulty and an easy object undercuts it — for ordinary completion the words are おわる or てしまう.", "scene": "Somebody uses it about a completely trivial task as a joke, and the joke works precisely because the ending is far too heavy for the thing it has been asked to carry.", "jp": "読みおわりました。", "en": "Ordinary completion — おわる, with no struggle claimed."}]},
  "ppanashi": {"setting": {"scene": "The staffroom heater has been running since Friday, the window beside it has been open the same length of time, and it is Monday morning. Somebody is going to say something about it, and the word they use will contain the complaint so their voice does not have to.", "jp": "電気がつけっぱなしでした。", "en": "The light had been left on.", "pattern": "つけっぱなし"}, "extensions": [{"kind": "flip", "scene": "You use it as a request rather than a complaint, which is the polite half of the same word and the version you will actually produce more often than the accusing one.", "jp": "窓を開けっぱなしにしないでください。", "en": "Please don't leave the window open."}, {"kind": "extra", "t": "It carries blame, so it is not the neutral way to report a state. Step 13's てある says somebody did it on purpose — 窓が開けてある — while っぱなし says somebody left it and should not have. Same window, two different accusations.", "scene": "You use てある where you meant っぱなし and accidentally credit somebody with having opened the window on purpose, which turns a complaint into a compliment that nobody in the room had earned.", "jp": "窓が開けてあります。", "en": "Opened on purpose — the neutral report, with no blame in it."}]},
  "sb-aspect2": {"setting": {"scene": "Five endings that all bolt onto a ます-stem and all change what the verb claims about its own completeness. Met one at a time they look like vocabulary; laid out together they are a system with two axes — how far the action got, and how you feel about that.", "jp": "読みかけの本", "en": "Half-read — かける.", "pattern": "かけ"}, "extensions": [{"kind": "flip", "scene": "You run a single verb through all five endings in a notebook and the two axes separate cleanly for the first time: began, finished, abandoned, endured, neglected — one stem, five different claims about completeness.", "jp": "最後までやりぬいた。", "en": "Saw it through — ぬく, and it was hard."}, {"kind": "extra", "t": "The two worth drilling are the two with no English equivalent — かける and ぬく. English speakers reach for them last because nothing in a first language suggests that a verb could carry unfinishedness or endurance as part of its own shape.", "scene": "You catch yourself describing a half-done thing in three English-shaped words and then in one Japanese one, which is the first time the compound verbs feel like an economy rather than a burden.", "jp": "つけっぱなし", "en": "Left on — and it shouldn't have been."}]},
  "gachi": {"setting": {"scene": "A health check questionnaire with a column that is not asking whether you have been ill but whether you tend to be. One is an event and the other is a pattern, and the form wants the pattern — which needs a word that grades a tendency rather than reporting an occasion.", "jp": "最近、忘れがちです。", "en": "I've been forgetful lately.", "pattern": "がち"}, "extensions": [{"kind": "flip", "scene": "You use it about your own childhood in the next box down, where a tendency across years rather than a fact about one week is exactly what the form is asking for.", "jp": "子どもの頃は病気がちでした。", "en": "I was often ill as a child."}, {"kind": "extra", "t": "The negative colouring is built in. 元気がち is not a sentence, because being well a lot is not a complaint — if the tendency is welcome, this is not the word, and no amount of context will make it fit.", "scene": "You try it on something good and the sentence quietly refuses to mean anything, because the negative colouring is not connotation you can override with context — it is what the word is.", "jp": "よく元気になります。", "en": "Often gets better — plain, because がち cannot carry good news."}]},
  "gimi": {"setting": {"scene": "Half past eight, and you are not ill enough to stay home and not well enough to pretend nothing is happening. Somebody asks how you are. The honest answer is a degree rather than a state, and reporting it without asking anybody to do something about it is exactly what this word is for.", "jp": "ちょっと風邪気味です。", "en": "I've got a bit of a cold coming on.", "pattern": "気味"}, "extensions": [{"kind": "flip", "scene": "You use it about tiredness rather than illness later the same week, which is the other place it lives and the one where it does most of its social work.", "jp": "最近、疲れ気味です。", "en": "I've been a touch tired lately."}, {"kind": "extra", "t": "It is a degree, not a frequency — that is がち's job. 遅れ気味 means running slightly late today; 遅れがち means late a lot, as a habit. About a colleague the difference is between a Tuesday and a character reference.", "scene": "You use the wrong one about somebody else and turn a single late morning into a standing accusation, which is a much larger thing to have said than you meant to say.", "jp": "遅れがちです。", "en": "Late a lot — a habit, and a much bigger thing to say."}]},
  "warini": {"setting": {"scene": "The flat is small, it is above a bakery, and the rent is a third less than the one you looked at on Tuesday. Somebody asks whether it is any good, and the honest answer is not good or bad — it is good for what it costs, which needs a benchmark inside the sentence.", "jp": "値段のわりに、おいしいです。", "en": "For the price, it's good.", "pattern": "わりに"}, "extensions": [{"kind": "flip", "scene": "You use it about a person rather than a thing, which is where it is most common and most useful — and where the benchmark being undercut is somebody's age rather than a price.", "jp": "若いわりに、しっかりしています。", "en": "For someone so young, he's very together."}, {"kind": "extra", "t": "The two halves have to genuinely disagree. A pairing that is not surprising reads as a clumsy comparison, because the pattern promises a gap and the listener waits for one — 安いわりに安い is not a sentence anybody finishes.", "scene": "You use it in a sentence where the two halves agree rather than disagree, and the listener pauses, still waiting for the second shoe that the pattern promised and the sentence never actually dropped.", "jp": "高いわりに、おいしくないです。", "en": "Expensive, and not even good — the gap the pattern promises."}]},
  "bahodo": {"setting": {"scene": "Four months into a study habit and the odd thing has started happening: the more you read, the less certain you feel, because every page shows you two more things you did not know. Saying that needs a frame that scales one thing against another, and both halves use the same verb.", "jp": "練習すればするほど、上手になります。", "en": "The more you practise, the better you get.", "pattern": "ばするほど"}, "extensions": [{"kind": "flip", "scene": "You use the version that is actually true of your week, where the slope runs downhill rather than up, and the frame turns out to carry discouragement exactly as well as it carries progress.", "jp": "考えれば考えるほど、わからなくなります。", "en": "The more I think about it, the less I understand."}, {"kind": "extra", "t": "The verb must be the same on both sides. 読めば書くほど is not a scale, it is two unrelated things bolted together, and the sentence collapses. And the ば-form is Step 16's — this pattern is a large part of why that lesson mattered.", "scene": "You try it with two different verbs and the frame stops meaning anything at all, because a scale needs the same thing on both ends and two unrelated verbs are not a scale.", "jp": "高ければ高いほどいいです。", "en": "The pricier the better — adjectives take ければ〜いほど."}]},
  "dokoroka": {"setting": {"scene": "Somebody says your Japanese must be almost fluent by now. They mean it kindly, they have heard you order lunch, and it is not remotely close to true. A polite correction would understate how far off it is — and there is a word for overturning an assumption rather than gently adjusting it.", "jp": "安いどころか、とても高かったです。", "en": "Far from cheap — it was very expensive.", "pattern": "どころか"}, "extensions": [{"kind": "flip", "scene": "You use it about a holiday that was supposed to be restful and was not, where the assumption and the reality point in genuinely opposite directions rather than merely differing by a degree or two.", "jp": "休むどころか、もっと忙しくなりました。", "en": "Far from resting, I got busier."}, {"kind": "extra", "t": "It is not a soft correction. どころか says the assumption was not merely wrong but backwards, so aimed at somebody else's claim it reads as contradiction — about yourself it is safe, and often modest.", "scene": "You aim it at a colleague's estimate rather than your own and it lands harder than the room expected, because overturning somebody else's claim is a different act from overturning your own.", "jp": "思ったより高かったです。", "en": "Pricier than I expected — the soft version, for somebody else's claim."}]},
  "sb-doai": {"setting": {"scene": "Six words that all do something English handles with adverbs and a raised eyebrow: they grade a claim instead of stating one. Met separately they look like vocabulary and get used interchangeably. Together they are the difference between a sentence that reports something and a sentence that takes a position on it.", "jp": "忘れがち", "en": "Often — a tendency, and an unwelcome one.", "pattern": "がち"}, "extensions": [{"kind": "flip", "scene": "You rewrite a flat paragraph of adjectives using three of them, and it stops sounding like a list and starts sounding like an opinion — which is the whole difference this step is for.", "jp": "値段のわりに、いいです。", "en": "Good for the price — a benchmark, not an adjective."}, {"kind": "extra", "t": "The commonest error is がち for 気味 and back. One is how often and the other is how much, and about a person that is the difference between describing their week and describing them.", "scene": "You check each one against the question it actually answers — how often, or how much — and the pair that kept collapsing into each other separates immediately and stays separated.", "jp": "疲れ気味です。", "en": "A touch tired — a degree, today."}]},
  "toori": {"setting": {"scene": "A handover note from somebody who has left, with six steps on it, and a system that will do something expensive if the steps happen in the wrong order. When you report back that it is done, the word you want claims precision rather than approximation.", "jp": "言ったとおりにやりました。", "en": "I did it exactly as you said.", "pattern": "とおり"}, "extensions": [{"kind": "flip", "scene": "You use the voiced version, which is nearly a fixed expression by now and is one of the two or three most useful short answers in any Japanese working week.", "jp": "会議は予定どおり始まりました。", "en": "The meeting started on schedule."}, {"kind": "extra", "t": "It is not ような. ような is like, resembling; とおり is exactly as, following. 言ったようにやりました is I did it more or less as you said, which is a weaker promise than anybody wants on a handover.", "scene": "You use the softer one by accident and end up promising rather less than you actually delivered, which on a handover note is a strange and slightly costly direction in which to get something wrong.", "jp": "説明のとおりにやりました。", "en": "Exactly as explained — no room left in it."}]},
  "furi": {"setting": {"scene": "On the train, somebody two seats down is having a phone conversation that everybody can hear and nobody wants to be part of. The entire carriage is doing the same thing, and there is a word for it that makes the pretending itself the action.", "jp": "彼は知らないふりをしました。", "en": "He pretended not to know.", "pattern": "ふりをしました"}, "extensions": [{"kind": "flip", "scene": "You use it about yourself and a colleague's very obvious new haircut, where the pretending was clearly the kind thing to do rather than the dishonest one, and everybody at the table was doing it.", "jp": "気づかないふりをしました。", "en": "I pretended not to notice."}, {"kind": "extra", "t": "It carries a judgement, usually mild. Saying somebody 知らないふりをした accuses them of a small dishonesty — so it is not the neutral way to report that they did not know, which is simply 知りませんでした.", "scene": "You use it where the person genuinely had no idea, and accidentally accuse them of a small dishonesty they did not commit — the judgement is inside the word and cannot be removed by tone.", "jp": "知りませんでした。", "en": "He didn't know — no pretence claimed."}]},
  "nagaramo": {"setting": {"scene": "A reflective paragraph in a year-end report, about a decision you knew at the time was the wrong one and made anyway. Two things true of the same person at the same moment, and they contradict each other — which is a shape Step 7's ながら could hold the timing of but not the contradiction.", "jp": "知っていながらも、何も言いませんでした。", "en": "Even knowing, I said nothing.", "pattern": "ながらも"}, "extensions": [{"kind": "flip", "scene": "You use the adjective version about the small office you are describing, where the concession is much gentler and the sentence turns out to be a compliment rather than an admission of anything.", "jp": "小さいながらも、いい店です。", "en": "Small though it is, it's a good shop."}, {"kind": "extra", "t": "Do not confuse it with plain ながら. 音楽を聞きながら勉強する is two compatible actions in one body; 知っていながら言わなかった is two incompatible ones, and the も is what makes the difference audible.", "scene": "You drop the も and the sentence stops conceding anything at all — it simply describes two things happening at once, which was Step 7's job and not this one's.", "jp": "音楽を聞きながら勉強します。", "en": "Two compatible actions — plain ながら, no contradiction."}]},
  "kuseni": {"setting": {"scene": "A line in a drama that the subtitles render as even though, said by one character to another, and the temperature of the room changes. The subtitle is not wrong and it is not close to enough — the word carries contempt, and a learner who files it beside のに will one day use it and not understand what happened.", "jp": "知っているくせに、教えてくれませんでした。", "en": "He knew perfectly well, and still wouldn't tell me.", "pattern": "くせに"}, "extensions": [{"kind": "flip", "scene": "You look for the neutral version of the same sentence and find it two steps back, in Step 21, where it has been sitting the whole time doing the job without the contempt.", "jp": "知っているのに、教えてくれませんでした。", "en": "He knew, and still wouldn't tell me — のに, with no sneer."}, {"kind": "extra", "t": "⚠️ This is genuinely insulting and です does not soften it. 子どものくせに is not affectionate — it means you are only a child, so how dare you. Recognise it in fiction and in arguments; for a neutral even though use のに, and for a polite one けど.", "scene": "You hear it used affectionately between two close friends and realise the exception proves how sharp the default is — it works there because both of them know it should not.", "jp": "高いけど、買います。", "en": "Expensive, but I'm buying it — the safe one, always."}]},
  "totan": {"setting": {"scene": "You sit down for the first time since seven in the morning, and the phone rings. Not a minute later — at the exact moment your weight reaches the chair, as though the two events were connected, which they were not. There is a pattern for that seam and the surprise is built into it.", "jp": "座ったとたん、電話が鳴りました。", "en": "The instant I sat down, the phone rang.", "pattern": "とたん"}, "extensions": [{"kind": "flip", "scene": "You use it about the weather, which is where most people meet it first and where the timing is at its most unfair — the rain waiting, apparently, for the door to close behind you.", "jp": "外に出たとたん、雨が降りはじめました。", "en": "The moment I stepped outside, it started raining."}, {"kind": "extra", "t": "It cannot carry your own intention. 家を出たとたん、買い物に行きました is wrong — you cannot plan the thing that happens at the instant, and if the second half is something you chose, the sentence wants てから or たら instead.", "scene": "You write one where the second half was your own decision and the pattern quietly stops working, because a seam is something that happens to you rather than something you arrange.", "jp": "家を出てから、買い物に行きました。", "en": "After leaving, I went shopping — chosen, so てから."}]},
  "saichuu": {"setting": {"scene": "Nine minutes into a meeting that took three weeks to arrange, with everybody finally in the room, a phone goes off. Not during the meeting in the general sense — in the thick of it, at the worst available moment, which is a finer claim than Step 19's neutral window.", "jp": "会議の最中に、電話が鳴りました。", "en": "The phone rang right in the middle of the meeting.", "pattern": "最中に"}, "extensions": [{"kind": "flip", "scene": "You use it about a conversation rather than a meeting, where the interruption is somebody walking away rather than a noise, and the thing being broken into is your own half-finished sentence.", "jp": "話している最中に、帰ってしまいました。", "en": "He left while I was still talking."}, {"kind": "extra", "t": "It needs an activity with a middle. 寝ている最中に is odd for ordinary sleep, because sleeping is not an activity underway the way a meeting is — 寝ている間に is the natural sentence there, and 間に is the neutral window this one intensifies.", "scene": "You try it about ordinary sleep and it is subtly wrong in a way the neutral window is not, because sleeping is not an activity underway the way a meeting is.", "jp": "寝ている間に、電話がありました。", "en": "While I slept, a call came — the neutral window."}]},
  "shidai": {"setting": {"scene": "An email you have to send before you leave, about a decision that has not been made yet, to somebody who needs to know the moment it is. Not when it is decided, not after — as soon as, and the sentence is a promise rather than a description.", "jp": "決まり次第、ご連絡します。", "en": "I'll be in touch as soon as it's decided.", "pattern": "次第"}, "extensions": [{"kind": "flip", "scene": "You use it in the room rather than in writing, to start something the moment the last person arrives, and it is the same promise made out loud instead of on paper.", "jp": "到着次第、始めましょう。", "en": "Let's start as soon as everyone's here."}, {"kind": "extra", "t": "It cannot be used about the past, because the pattern is a promise — 決まり次第連絡しました is not a sentence. And the second half must be something you control: 決まり次第、雨が降ります is nonsense for exactly the same reason.", "scene": "You try to report a past sequence with it and the tense restriction refuses outright, which is the fastest way to learn that this pattern is a promise rather than a description.", "jp": "決まってから、連絡しました。", "en": "After it was decided, I got in touch — past, so てから."}]},
  "sb-timing": {"setting": {"scene": "Three patterns that all come out in English as when or as soon as, and all mean something different about where in an event you are standing. Side by side the difference stops being subtle, and the tense restrictions do most of the work of telling them apart.", "jp": "座ったとたん、電話が鳴りました。", "en": "The seam — past, and a surprise you did not control.", "pattern": "とたん"}, "extensions": [{"kind": "flip", "scene": "You sort three sentences from your own week into the three grains, and two of them turn out to have wanted a different one from the one you used at the time.", "jp": "決まり次第、ご連絡します。", "en": "As soon as possible — future, and your own promise."}, {"kind": "extra", "t": "The tense restrictions are absolute and they are the fastest self-check there is: たとたん is past and uncontrolled, 次第 is future and controlled. If a sentence wants both at once, it wants neither of them.", "scene": "You test a sentence against both restrictions and it fails each of them, which is how you find out it never wanted any of the three and had wanted てから all along.", "jp": "会議の最中に、電話が鳴りました。", "en": "The thick of it — an activity interrupted."}]},
  // @@ARCS-END
};

const LEVELS = [
  // Session 17: stages decoupled from JLPT levels, on Lloyd's ruling. Stage used to EQUAL
  // JLPT level exactly, which is why the old Stage 1 carried 143 lessons — N5 is simply a
  // big level and the architecture inherited that shape. The project line has always been
  // "JLPT shown as reference only, not identity"; this is that decision, reasserted.
  // Every boundary below is an existing checkpoint. No step numbers moved.
  { id: "S1", title: "1", subtitle: "First sentences", jlpt: "≈ JLPT N5", markers: "en", tagline: "Saying what things are, pointing at them, asking about them — and not a single verb yet.", groups: CURRICULUM.filter((c) => c.level === "S1") },
  { id: "S2", title: "2", subtitle: "Verbs arrive", jlpt: "≈ JLPT N5", markers: "en", tagline: "Joining, choosing and counting, and then the machine everything else bends from: the verb.", groups: CURRICULUM.filter((c) => c.level === "S2") },
  { id: "S3", title: "3", subtitle: "Asking and wanting", jlpt: "≈ JLPT N5", markers: "en", tagline: "Requests, permission, obligation, invitations and the shapes that chain one action to the next.", groups: CURRICULUM.filter((c) => c.level === "S3") },
  { id: "S4", title: "4", subtitle: "Describing the world", jlpt: "≈ JLPT N5", markers: "en", tagline: "Existence, adjectives, comparison and reasons — everything the N5 syllabus expects, finished.", groups: CURRICULUM.filter((c) => c.level === "S4") },
  { id: "S5", title: "5", subtitle: "Conversation", jlpt: "≈ JLPT N4", markers: "kana", tagline: "The て-form's second wind, kindness in both directions, evidence, and the four ifs.", groups: CURRICULUM.filter((c) => c.level === "S5") },
  { id: "S6", title: "6", subtitle: "Plans, time and voice", jlpt: "≈ JLPT N4", markers: "kana", tagline: "Intentions and decisions, ability and experience, time's edges, and things done to you.", groups: CURRICULUM.filter((c) => c.level === "S6") },
  { id: "S7", title: "7", subtitle: "Nuance and other minds", jlpt: "≈ JLPT N4", markers: "kana", tagline: "Concessions with temperature, thoughts in boxes, and the line between your mind and everyone else's.", groups: CURRICULUM.filter((c) => c.level === "S7") },
  { id: "S8", title: "8", subtitle: "Politeness", jlpt: "≈ JLPT N3", markers: "kanji", tagline: "Keigo — hearing it, lowering yourself, and the nine rooms it will reach you in.", groups: CURRICULUM.filter((c) => c.level === "S8") },
  { id: "S9", title: "9", subtitle: "Independence", jlpt: "≈ JLPT N3", markers: "kanji", tagline: "Cause with an owner, the compound particles that make writing possible, conclusions drawn and denied, and claims that are graded rather than asserted — where you stop reporting and start arguing.", groups: CURRICULUM.filter((c) => c.level === "S9") },
  { id: "S10", title: "10", subtitle: "Nuance", jlpt: "≈ JLPT N2", markers: "kanji", locked: true },
  { id: "S11", title: "11", subtitle: "Mastery", jlpt: "≈ JLPT N1", markers: "kanji", locked: true },
];

// Lesson types. GATING: intentionally none yet — later, skill builders and
// checkpoints become required before advancing past them.
// Lesson-type markers. The script escalates with the stage: plain English
// initials while a learner can't read anything, kana once they can, kanji with
// furigana once kanji is the point. Set per stage on LEVELS.markers.
const KINDS = {
  primer:  { en: "PR", kana: "じょ", kanji: "序", reading: "じょ", color: "#8A6F4E", label: "Primer" },
  grammar: { en: "GM", kana: "ぶん", kanji: "文", reading: "ぶん", color: "#3D5A80", label: "Grammar" },
  skill:   { en: "SB", kana: "わざ", kanji: "技", reading: "わざ", color: "#C7351B", label: "Skill builder" },
  build:   { en: "SP", kana: "さく", kanji: "作", reading: "さく", color: "#6B5B95", label: "Sentence practice" },
  culture: { en: "CC", kana: "まち", kanji: "街", reading: "まち", color: "#3E7C4F", label: "Culture connection" },
  // Darkened from #B08A1F: white text on the original ochre only reached 3.2:1.
  review:  { en: "CP", kana: "ふく", kanji: "復", reading: "ふく", color: "#907119", label: "Checkpoint" },
};
const KIND_ORDER = ["primer", "grammar", "skill", "build", "culture", "review"];

function KindMarker({ kind, script = "en", size = 11 }) {
  const k = KINDS[kind || "grammar"];
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    background: k.color, color: "#FFFFFF", borderRadius: 4, fontWeight: 600,
    lineHeight: 1, flexShrink: 0, whiteSpace: "nowrap",
  };
  if (script === "kanji") {
    return (
      <span className="kind-mark" title={k.label}
        style={{ ...base, fontFamily: T.jpFont, fontSize: size + 3, padding: "2px 6px", minWidth: 24 }}>
        <ruby>{k.kanji}<rt>{k.reading}</rt></ruby>
      </span>
    );
  }
  if (script === "kana") {
    return (
      <span title={k.label}
        style={{ ...base, fontFamily: T.jpFont, fontSize: size + 1, padding: "4px 6px", minWidth: 30 }}>
        {k.kana}
      </span>
    );
  }
  return (
    <span title={k.label}
      style={{ ...base, fontSize: size, letterSpacing: ".6px", padding: "4px 6px", minWidth: 28 }}>
      {k.en}
    </span>
  );
}

function levelPoints(level) {
  return (level.groups || []).flatMap((g) => g.points);
}

// ————— Static build flag —————
// false here, in the artifact, where the grader runs and the reviewer grades
// through the published checker path. build-vite-app.py flips it to true for
// the static app: no prompts in the bundle, no API call, and the quiz and both
// graders swap for self-marked equivalents that still write n5-progress-v1 —
// the key the vocabulary module reads to unlock words by step (Session 10).
const STATIC_BUILD = true;  // flipped by build-vite-app.py

// ————— API helpers —————
async function callClaude() {
  // Removed by build-vite-app.py. This build is static: no API key,
  // no network, no cost. Features needing the grader are disabled
  // above rather than failing here.
  throw new Error("grader-unavailable-in-static-build");
}

// ————— Scaffolded explanations —————
// `exp` is either a plain string (older lessons) or an object of up to four
// beats. Both render; both feed the API prompt.
const BEATS = [
  ["what", "WHAT IT DOES"],
  ["build", "HOW IT'S BUILT"],
  ["when", "WHEN YOU'D USE IT"],
  ["watch", "WATCH OUT"],
];
const expText = (exp) =>
  typeof exp === "string" ? exp : BEATS.map(([k]) => exp[k]).filter(Boolean).join(" ");

function Explanation({ exp, mode, onTapWord }) {
  if (!exp) return null;
  if (typeof exp === "string") {
    return (
      <p style={{ fontSize: 15, lineHeight: 1.7, marginTop: 0 }}>
        <JPText text={exp} mode={mode} onTap={onTapWord} />
      </p>
    );
  }
  const beats = BEATS.filter(([k]) => exp[k]);
  return (
    <div>
      {beats.map(([k, label], i) => (
        <div key={k} style={{ marginTop: i === 0 ? 0 : 18 }}>
          <div style={{
            fontSize: 11, fontWeight: 600, letterSpacing: ".6px",
            color: k === "watch" ? T.shu : T.sub, marginBottom: 5,
          }}>
            {label}
          </div>
          <p style={{ fontSize: 15, lineHeight: 1.75, margin: 0 }}>
            <JPText text={exp[k]} mode={mode} onTap={onTapWord} />
          </p>
        </div>
      ))}
    </div>
  );
}

function targetDescription(point) {
  if (point.kind === "review" && point.covers) {
    const list = point.covers
      .map((id) => { const p = ALL_POINTS.find((x) => x.id === id); return p ? `${p.jp} (${p.en})` : null; })
      .filter(Boolean)
      .join("; ");
    return `REVIEW CHECKPOINT covering these grammar points: ${list}`;
  }
  return `Target grammar point: ${point.jp} — "${point.en}". Explanation: ${expText(point.exp)} Example: ${point.ex[0][0]}`;
}

const QUIZ_SYSTEM = null; // stripped by build-vite-app.py — prompts ship only in the graded artifact

const PRACTICE_SYSTEM = null; // stripped by build-vite-app.py — prompts ship only in the graded artifact

// ————— Storage (progress) —————
async function loadProgress() {
  try {
    const r = await window.storage.get("n5-progress-v1");
    return r ? JSON.parse(r.value) : {};
  } catch {
    return {};
  }
}
async function saveProgress(p) {
  try {
    await window.storage.set("n5-progress-v1", JSON.stringify(p));
  } catch (e) {
    console.error("progress save failed", e);
  }
}

// ————— Loading personality —————
const GRADING_MESSAGES = [
  "Checking your fabulous work and hoping for no errors…",
  "Reading it twice, like a proud teacher…",
  "Uncapping the red pen (gently)…",
  "Consulting the particle spirits…",
  "Looking for kanji you could show off…",
];
const QUIZ_MESSAGES = [
  "Writing five fresh questions just for you…",
  "Hiding one correct answer among the sneaky ones…",
  "Making the distractors properly tempting…",
];
function useRotating(messages, active) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!active) { setI(0); return; }
    const t = setInterval(() => setI((v) => (v + 1) % messages.length), 2200);
    return () => clearInterval(t);
  }, [active, messages.length]);
  return messages[i];
}

// ————— Components —————
function Chip({ children, color }) {
  return (
    <span style={{
      display: "inline-block", fontSize: 11, letterSpacing: ".4px", padding: "2px 8px",
      borderRadius: 999, border: `1px solid ${color || T.hairline}`, color: color || T.sub,
    }}>{children}</span>
  );
}

// Static-build stand-in for the generated quiz: the lesson still needs a way
// to write progress (the vocabulary module unlocks words off it), so the
// learner self-marks. `studied` is deliberately NOT `quizBest` — imported
// artifact progress keeps its real scores, and isDone accepts either.
function StaticMark({ point, progress, onProgress }) {
  const p = progress[point.id] || {};
  const done = !!(p.studied || p.quizBest != null);
  return (
    <div style={{ textAlign: "center", padding: "24px 0" }}>
      <p style={{ fontSize: 14, color: T.sub, marginTop: 0 }}>
        Quizzes are generated fresh by the grader, which is not part of this static
        preview — it arrives with the full app.
      </p>
      {done ? (
        <p style={{ fontSize: 14, color: T.ok }}>Marked as studied ✓</p>
      ) : (
        <button className="btn-primary"
          onClick={() => onProgress({ ...progress, [point.id]: { ...p, studied: true, at: Date.now() } })}>
          Mark as studied
        </button>
      )}
    </div>
  );
}

function Quiz({ point, progress, onProgress, mode, onTapWord }) {
  const [state, setState] = useState("idle"); // idle | loading | active | done | error
  const [questions, setQuestions] = useState([]);
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [err, setErr] = useState("");
  const quizMsg = useRotating(QUIZ_MESSAGES, state === "loading");

  const start = async () => {
    setState("loading");
    setErr("");
    try {
      const data = await callClaude(
        QUIZ_SYSTEM,
        targetDescription(point) + (point.quizHint ? ` Quiz guidance: ${point.quizHint}` : "")
      );
      if (!Array.isArray(data.questions) || data.questions.length === 0) throw new Error("bad shape");
      setQuestions(data.questions);
      setQi(0); setPicked(null); setScore(0);
      setState("active");
    } catch (e) {
      setErr("Couldn't generate the quiz. Try again.");
      setState("error");
    }
  };

  const pick = (i) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === questions[qi].answer) setScore((s) => s + 1);
  };

  const next = async () => {
    if (qi + 1 < questions.length) {
      setQi(qi + 1); setPicked(null);
    } else {
      setState("done");
      const finalScore = score;
      const prev = progress[point.id] || {};
      const best = Math.max(prev.quizBest || 0, finalScore);
      onProgress({ ...progress, [point.id]: { ...prev, quizBest: best, quizTotal: questions.length } });
    }
  };

  if (state === "idle" || state === "error" || state === "loading") {
    if (STATIC_BUILD) return <StaticMark point={point} progress={progress} onProgress={onProgress} />;
    return (
      <div style={{ textAlign: "center", padding: "24px 0" }}>
        <p style={{ fontSize: 14, color: T.sub, marginTop: 0 }}>
          Five fresh questions on {point.jp}, generated each time.
        </p>
        {err && <p style={{ color: T.shu, fontSize: 14 }}>{err}</p>}
        <button className="btn-primary" onClick={start} disabled={state === "loading"}>
          {state === "loading" ? "One moment…" : "Start quiz"}
        </button>
        {state === "loading" && (
          <p style={{ fontSize: 13, color: T.sub, fontStyle: "italic" }} aria-live="polite">{quizMsg}</p>
        )}
      </div>
    );
  }

  if (state === "done") {
    return (
      <div style={{ textAlign: "center", padding: "24px 0" }}>
        <div style={{ fontFamily: T.jpFont, fontSize: 34, color: score >= 4 ? T.ok : T.ink }}>
          {score} / {questions.length}
        </div>
        <p style={{ fontSize: 14, color: T.sub }}>
          {score === questions.length ? "Perfect — try writing your own sentence in Practice." :
           score >= 3 ? "Solid. Reread the misses, then try Practice." :
           "Worth rereading the Learn tab before Practice."}
        </p>
        <button className="btn-ghost" onClick={start}>New quiz</button>
      </div>
    );
  }

  const q = questions[qi];
  return (
    <div>
      <div style={{ fontSize: 12, color: T.sub, marginBottom: 10 }}>Question {qi + 1} of {questions.length} · Score {score}</div>
      <div style={{ fontFamily: T.jpFont, fontSize: 18, lineHeight: 1.9, marginBottom: 14 }}><JPText text={q.q} mode={mode} onTap={onTapWord} /></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {q.options.map((opt, i) => {
          const isPicked = picked === i;
          const isRight = picked !== null && i === q.answer;
          const isWrongPick = isPicked && i !== q.answer;
          return (
            <button
              key={i}
              onClick={() => pick(i)}
              style={{
                textAlign: "left", padding: "10px 14px", borderRadius: 6, fontSize: 16,
                fontFamily: T.jpFont, cursor: picked === null ? "pointer" : "default",
                background: isRight ? "#EDF4EE" : isWrongPick ? "#FBEDEA" : T.sheet,
                border: `1px solid ${isRight ? T.ok : isWrongPick ? T.shu : T.hairline}`,
                color: T.ink,
              }}
            >
              <JPText text={opt} mode={mode} onTap={onTapWord} />
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div style={{ marginTop: 12, fontSize: 14, lineHeight: 1.6 }}>
          <span style={{ color: picked === q.answer ? T.ok : T.shu, fontWeight: 600 }}>
            {picked === q.answer ? "Correct. " : "Not quite. "}
          </span>
          <JPText text={q.why} mode={mode} onTap={onTapWord} />
          <div style={{ marginTop: 12 }}>
            <button className="btn-primary" onClick={next}>
              {qi + 1 < questions.length ? "Next" : "Finish"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Shared by Practice and Build so the three-tier grader looks identical in both.
function IssueList({ issues, mode, onTapWord }) {
  return (
    <>
      {(issues || []).map((iss, i) => {
        const isNote = iss.type === "note";
        const isUnnatural = iss.type === "unnatural";
        const accent = isNote ? T.note : isUnnatural ? T.ai : T.shu;
        const label = isNote ? "WORTH KNOWING" : isUnnatural ? "CORRECT, BUT UNNATURAL" : "FIX";
        return (
          <div key={i} style={{
            border: `1px solid ${T.hairline}`, borderLeft: `3px solid ${accent}`,
            borderRadius: 6, padding: "12px 16px", background: isNote ? T.noteBg : T.sheet,
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".5px", color: accent, marginBottom: 6 }}>
              {label}
            </div>
            <div style={{ fontFamily: T.jpFont, fontSize: 16, marginBottom: 6 }}>
              <span style={
                isNote ? { color: T.ink }
                : isUnnatural ? { borderBottom: `2px dotted ${T.ai}`, color: T.ink }
                : { textDecoration: "line-through", textDecorationColor: T.shu, color: T.sub }
              }>
                {stripB(iss.span)}
              </span>
              <span style={{ margin: "0 8px", color: T.sub }}>→</span>
              <span>{stripB(iss.correction)}</span>
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.6 }}><JPText text={iss.explanation} mode={mode} onTap={onTapWord} /></div>
          </div>
        );
      })}
    </>
  );
}

// ————— Composition grading —————
// Unlike Practice, this reports on EACH required element separately, so a
// learner can see which of the four landed rather than one pass/fail verdict.
const BUILD_SYSTEM = null; // stripped by build-vite-app.py — prompts ship only in the graded artifact

function buildDescription(point) {
  const els = (point.requires || [])
    .map((id) => {
      const p = ALL_POINTS.find((x) => x.id === id);
      return p ? `- id "${id}": ${p.jp} — "${p.en}"` : `- id "${id}"`;
    })
    .join("\n");
  return `BRIEF SHOWN TO THE LEARNER:\n${point.brief}\n\nREQUIRED ELEMENTS:\n${els}`;
}

function Practice({ point, bank = [], progress, onProgress, mode, onTapWord }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");
  const [logged, setLogged] = useState(false);
  const gradingMsg = useRotating(GRADING_MESSAGES, loading);

  const grade = async () => {
    const input = text.trim();
    if (!input || loading) return;
    if (STATIC_BUILD) {
      // No grader in the static build. Log the attempt the way the vocabulary
      // module logs its self-assessed sentence; the checker takes over
      // post-Phase 0 through this same progress shape.
      const prev = progress[point.id] || {};
      onProgress({ ...progress, [point.id]: { ...prev, practiced: (prev.practiced || 0) + 1 } });
      setResult(null); setErr(""); setLogged(true);
      return;
    }
    setLoading(true); setErr(""); setResult(null);
    try {
      const data = await callClaude(
        PRACTICE_SYSTEM,
        `${targetDescription(point)}${point.practiceHint ? " " + point.practiceHint : ""}\n\nLearner's sentence:\n${input}`
      );
      setResult(data);
      const prev = progress[point.id] || {};
      onProgress({ ...progress, [point.id]: { ...prev, practiced: (prev.practiced || 0) + 1 } });
    } catch (e) {
      setErr("Grading failed — try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <p style={{ fontSize: 14, color: T.sub, marginTop: 0 }}>
        {point.practicePrompt || (
          <>Write one sentence of your own using <span style={{ fontFamily: T.jpFont, color: T.ink }}>{point.jp}</span>.</>
        )}
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, 200))}
        placeholder="ここに文を書いてください…"
        rows={2}
        style={{
          width: "100%", boxSizing: "border-box", border: `1px solid ${T.hairline}`, borderRadius: 6,
          padding: 12, fontSize: 18, lineHeight: 1.9, fontFamily: T.jpFont, background: T.paper, resize: "vertical",
        }}
      />
      {bank.length > 0 && (
        <div style={{ margin: "8px 0 2px", display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: T.sub }}>Need words? Tap to add:</span>
          {bank.map(([jp, en]) => {
            const entry = KANJI_DICT.find((d) => d[0] === jp);
            const disp = entry ? wordDisplay(entry, mode) : jp;
            return (
              <button key={jp} className="btn-ghost" style={{ padding: "4px 10px" }} onClick={() => setText((t) => (t + dispText(disp)).slice(0, 200))}>
                <span style={{ fontFamily: T.jpFont, fontSize: 14 }}><DispSpan d={disp} /></span>
                <span style={{ fontSize: 11, marginLeft: 6 }}>{en}</span>
              </button>
            );
          })}
        </div>
      )}
      <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <button className="btn-primary" onClick={grade} disabled={loading || !text.trim()}>
          {loading ? "Grading…" : STATIC_BUILD ? "I wrote it — log practice" : "Grade my sentence"}
        </button>
        {loading && (
          <span style={{ fontSize: 13, color: T.sub, fontStyle: "italic" }} aria-live="polite">
            {gradingMsg}
          </span>
        )}
      </div>
      {err && <p style={{ color: T.shu, fontSize: 14 }}>{err}</p>}
      {logged && (
        <p style={{ color: T.ok, fontSize: 14 }} role="status">
          Logged. Check your sentence against the examples in Learn — the grader arrives with the full app.
        </p>
      )}
      {result && (
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{
            padding: "12px 16px", borderRadius: 6, background: result.uses_target ? "#EDF4EE" : "#FBEDEA",
            border: `1px solid ${result.uses_target ? T.ok : T.shu}55`, fontSize: 14, lineHeight: 1.6,
          }}>
            <strong style={{ color: result.uses_target ? T.ok : T.shu }}>
              {result.uses_target ? "Target pattern used. " : "Target pattern missing or off. "}
            </strong>
            <JPText text={result.target_feedback} mode={mode} onTap={onTapWord} />
          </div>
          <IssueList issues={result.issues} mode={mode} onTapWord={onTapWord} />
          <div style={{ border: `1px solid ${T.hairline}`, borderRadius: 6, padding: "12px 16px", background: T.sheet }}>
            <div style={{ fontSize: 12, color: T.ok, fontWeight: 600, letterSpacing: ".5px", marginBottom: 6 }}>
              NATURAL VERSION · {result.score}/5
            </div>
            <div style={{ fontFamily: T.jpFont, fontSize: 17, lineHeight: 1.9 }}><JPText text={result.rewrite} mode={mode} onTap={onTapWord} /></div>
          </div>
        </div>
      )}
    </div>
  );
}

const BUILD_MESSAGES = [
  "Checking each piece separately…",
  "Seeing whether it hangs together…",
  "Counting how many patterns landed…",
  "Reading it as writing, not as an exercise…",
  "Looking for politeness drift between sentences…",
];

function Build({ point, bank = [], progress, onProgress, mode, onTapWord }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");
  const [logged, setLogged] = useState(false);
  const msg = useRotating(BUILD_MESSAGES, loading);
  const required = (point.requires || []).map((id) => ALL_POINTS.find((x) => x.id === id)).filter(Boolean);

  const grade = async () => {
    const input = text.trim();
    if (!input || loading) return;
    if (STATIC_BUILD) {
      // No grader here — the element-by-element check is the learner's, against
      // the visible checklist. bestElements is deliberately not written: it is
      // a graded number and self-marking must not mint one.
      const prev = progress[point.id] || {};
      onProgress({
        ...progress,
        [point.id]: { ...prev, built: (prev.built || 0) + 1, elementTotal: required.length },
      });
      setResult(null); setErr(""); setLogged(true);
      return;
    }
    setLoading(true); setErr(""); setResult(null);
    try {
      const data = await callClaude(
        BUILD_SYSTEM,
        `${buildDescription(point)}\n\nLearner's writing:\n${input}`,
        1600
      );
      setResult(data);
      const correct = (data.elements || []).filter((e) => e.correct).length;
      const prev = progress[point.id] || {};
      onProgress({
        ...progress,
        [point.id]: {
          ...prev,
          built: (prev.built || 0) + 1,
          bestElements: Math.max(prev.bestElements || 0, correct),
          elementTotal: required.length,
        },
      });
    } catch {
      setErr("Grading failed — try again.");
    } finally {
      setLoading(false);
    }
  };

  const byId = {};
  (result?.elements || []).forEach((e) => { byId[e.id] = e; });

  return (
    <div>
      <div style={{
        background: T.paper, border: `1px solid ${T.hairline}`, borderRadius: 6,
        padding: "14px 16px", marginBottom: 16,
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".6px", color: T.sub, marginBottom: 6 }}>
          YOUR BRIEF
        </div>
        <p style={{ fontSize: 15, lineHeight: 1.7, margin: 0 }}>{point.brief}</p>
      </div>

      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".6px", color: T.sub, marginBottom: 8 }}>
        USE ALL {required.length}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
        {required.map((p) => {
          const r = byId[p.id];
          const state = !r ? "todo" : r.correct ? "ok" : r.used ? "off" : "miss";
          const color = state === "ok" ? T.ok : state === "off" ? T.note : state === "miss" ? T.shu : T.sub;
          const glyph = state === "ok" ? "✓" : state === "off" ? "△" : state === "miss" ? "—" : "○";
          return (
            <div key={p.id} style={{
              display: "flex", alignItems: "baseline", gap: 10, fontSize: 14,
              padding: "8px 12px", background: T.sheet,
              border: `1px solid ${state === "todo" ? T.hairline : color + "66"}`, borderRadius: 6,
            }}>
              <span style={{ color, minWidth: 14, fontFamily: T.jpFont }}>{glyph}</span>
              <span style={{ fontFamily: T.jpFont, fontSize: 15 }}>{p.jp}</span>
              <span style={{ color: T.sub, fontSize: 13, flex: 1 }}>{p.en}</span>
              {r && r.evidence && (
                <span style={{ fontFamily: T.jpFont, fontSize: 14, color }}>{stripB(r.evidence)}</span>
              )}
            </div>
          );
        })}
      </div>
      {result && (result.elements || []).some((e) => e.note && !e.correct) && (
        <div style={{ marginBottom: 16, display: "flex", flexDirection: "column", gap: 6 }}>
          {result.elements.filter((e) => e.note && !e.correct).map((e, i) => (
            <div key={i} style={{ fontSize: 13, color: T.sub, lineHeight: 1.6 }}>
              <span style={{ fontFamily: T.jpFont, color: T.ink }}>
                {(required.find((p) => p.id === e.id) || {}).jp}
              </span>{" — "}{e.note}
            </div>
          ))}
        </div>
      )}

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, 400))}
        placeholder="ここに二〜三文書いてください…"
        rows={4}
        style={{
          width: "100%", boxSizing: "border-box", border: `1px solid ${T.hairline}`, borderRadius: 6,
          padding: 12, fontSize: 18, lineHeight: 1.9, fontFamily: T.jpFont, background: T.paper, resize: "vertical",
        }}
      />
      {bank.length > 0 && (
        <div style={{ margin: "8px 0 2px", display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: T.sub }}>Need words? Tap to add:</span>
          {bank.map(([jp, en]) => {
            const entry = KANJI_DICT.find((d) => d[0] === jp);
            const disp = entry ? wordDisplay(entry, mode) : jp;
            return (
              <button key={jp} className="btn-ghost" style={{ padding: "4px 10px" }} onClick={() => setText((t) => (t + dispText(disp)).slice(0, 400))}>
                <span style={{ fontFamily: T.jpFont, fontSize: 14 }}><DispSpan d={disp} /></span>
                <span style={{ fontSize: 11, marginLeft: 6 }}>{en}</span>
              </button>
            );
          })}
        </div>
      )}
      <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <button className="btn-primary" onClick={grade} disabled={loading || !text.trim()}>
          {loading ? "Reading…" : STATIC_BUILD ? "I wrote it — log this build" : "Check my sentences"}
        </button>
        {loading && (
          <span style={{ fontSize: 13, color: T.sub, fontStyle: "italic" }} aria-live="polite">{msg}</span>
        )}
        <span style={{ fontSize: 12, color: T.sub, marginLeft: "auto" }}>{text.length}/400</span>
      </div>
      {err && <p style={{ color: T.shu, fontSize: 14 }}>{err}</p>}
      {logged && (
        <p style={{ color: T.ok, fontSize: 14 }} role="status">
          Logged. Walk the checklist above yourself — is each required element present, and does it do its job?
        </p>
      )}

      {result && (
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{
            padding: "12px 16px", borderRadius: 6,
            background: result.combined ? "#EDF4EE" : T.noteBg,
            border: `1px solid ${result.combined ? T.ok : T.note}55`, fontSize: 14, lineHeight: 1.6,
          }}>
            <strong style={{ color: result.combined ? T.ok : T.note }}>
              {(result.elements || []).filter((e) => e.correct).length}/{required.length} patterns
              {result.combined ? ", connected. " : ", but reading as separate sentences. "}
            </strong>
            <JPText text={result.feedback} mode={mode} onTap={onTapWord} />
          </div>
          <IssueList issues={result.issues} mode={mode} onTapWord={onTapWord} />
          <div style={{ border: `1px solid ${T.hairline}`, borderRadius: 6, padding: "12px 16px", background: T.sheet }}>
            <div style={{ fontSize: 12, color: T.ok, fontWeight: 600, letterSpacing: ".5px", marginBottom: 6 }}>
              NATURAL VERSION · {result.score}/5
            </div>
            <div style={{ fontFamily: T.jpFont, fontSize: 17, lineHeight: 1.9 }}>
              <JPText text={result.rewrite} mode={mode} onTap={onTapWord} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ————— Koban wallet (Session 14) —————
// Same key and shape as the vocabulary module: a plain number under
// achievement-points-v1. Copy of KobanIcon kept byte-identical to the
// vocabulary module's for a future hoist into lib/.
async function loadWallet() {
  try { const r = await window.storage.get("achievement-points-v1"); return r ? JSON.parse(r.value) : 0; }
  catch { return 0; }
}
async function addKoban(n) {
  const v = (await loadWallet()) + n;
  try { await window.storage.set("achievement-points-v1", JSON.stringify(v)); } catch (e) { console.error("koban save failed", e); }
  return v;
}
function KobanIcon({ size = 13 }) {
  return (
    <svg width={size} height={Math.round(size * 1.3)} viewBox="0 0 14 18" aria-label="koban"
      style={{ display: "inline-block", verticalAlign: "-2px" }}>
      <ellipse cx="7" cy="9" rx="6.2" ry="8.2" fill="#D9B44A" stroke="#8A6F1D" strokeWidth="1" />
      <ellipse cx="7" cy="9" rx="4.1" ry="6.1" fill="none" stroke="#8A6F1D" strokeWidth=".7" />
      <line x1="4.6" y1="9" x2="9.4" y2="9" stroke="#8A6F1D" strokeWidth=".8" />
    </svg>
  );
}

// Midnight in Tokyo is the challenge day-boundary — the app teaches Japan's
// clock along with its language. en-CA gives YYYY-MM-DD.
function tokyoToday() {
  try { return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo" }).format(new Date()); }
  catch { return new Date().toISOString().slice(0, 10); }
}

// ————— Highlight helper —————
// Renders text with one substring emphasized, keeping JPText's dictionary
// annotation on every part. hl boundaries are grammar elements, so splitting
// there never cuts a dictionary word in a way that matters.
function HL({ text, hl, mode, onTap }) {
  const i = hl ? text.indexOf(hl) : -1;
  if (i < 0) return <JPText text={text} mode={mode} onTap={onTap} />;
  return (
    <>
      <JPText text={text.slice(0, i)} mode={mode} onTap={onTap} />
      <span style={{ color: T.shu, fontWeight: 600 }}><JPText text={hl} mode={mode} onTap={onTap} /></span>
      <JPText text={text.slice(i + hl.length)} mode={mode} onTap={onTap} />
    </>
  );
}

// ————— Walkthrough (Session 14, extended Session 17) —————
// The staged Learn flow for points with DEEP[id].seg: the idea → the first
// example taken apart element by element → the pattern sighted again in the
// remaining examples → the wrinkles → a handoff into the drill and free
// writing. Paged, not scrolled — same mobile-first call as the kana Learn
// pager (Session 13). Progress gains a `walked` flag; nothing is gated on it.
//
// Session 17 adds the lesson arc where ARCS[id] exists: a `setting` page opens
// on the situation, and each of the arc's extensions takes a page of its own
// between `again` and `watch` —
//
//   setting → idea → apart → again → ext0 → ext1 → … → watch → try
//
// A point with no arc keeps exactly the sequence above it, unchanged. `watch`
// survives either way and carries exp.watch plus any wrinkle no extension
// claimed, so nothing authored in DEEP can silently stop rendering.
function Walkthrough({ point, deep, progress, onProgress, mode, onTapWord, goTab }) {
  const exp = typeof point.exp === "object" ? point.exp : { what: point.exp };
  const wr = deep.wr || [];
  const arc = ARCS[point.id];
  const exts = arc ? arc.extensions : [];
  // Wrinkles an extension has claimed move onto their own page; the rest stay
  // on `watch`. With no arc nothing is claimed, which is today's stacked page.
  const claimed = new Set(exts.map((e) => e.wr).filter((i) => i != null));
  const leftover = wr.map((w, i) => [w, i]).filter(([, i]) => !claimed.has(i));
  const pages = [
    ...(arc ? ["setting"] : []),
    "idea", "apart",
    ...(point.ex.length > 1 ? ["again"] : []),
    ...exts.map((_, i) => "ext" + i),
    ...(exp.watch || leftover.length ? ["watch"] : []),
    "try",
  ];
  const [pi, setPi] = useState(0);
  // Page counts now range from three to nine, and the pager keeps its index
  // when the learner moves between lessons — clamp rather than render nothing.
  const cur = Math.min(pi, pages.length - 1);
  const page = pages[cur];
  const ext = page && page.startsWith("ext") ? exts[+page.slice(3)] : null;
  // A wrinkle extension's teaching text comes from DEEP, never from the arc —
  // the arc supplies only the scene that carries it. `extra` brings its own.
  const extText = ext ? (ext.kind === "wrinkle" ? (wr[ext.wr] || {}).t : ext.t) : null;
  // First candidate that actually occurs in the line, or no highlight at all.
  const pickHl = (jp, ...cands) => cands.find((c) => c && jp.indexOf(c) >= 0) || null;

  useEffect(() => {
    if (page !== "try") return;
    const prev = progress[point.id] || {};
    if (prev.walked) return;
    onProgress({ ...progress, [point.id]: { ...prev, walked: true } });
  }, [page, point.id]);

  const H = ({ children }) => (
    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".6px", color: T.sub, marginBottom: 8 }}>{children}</div>
  );
  const exBox = ([jp, en], i, hl) => (
    <div key={i} style={{ marginTop: 12, paddingLeft: 14, borderLeft: `3px solid ${T.hairline}` }}>
      <div style={{ fontFamily: T.jpFont, fontSize: 18, lineHeight: 1.9 }}>
        <HL text={jp} hl={hl} mode={mode} onTap={onTapWord} />
      </div>
      <div style={{ fontSize: 13, color: T.sub }}>{en}</div>
    </div>
  );

  return (
    <div>
      {page === "setting" && (
        <div>
          <H>THE SITUATION</H>
          <p style={{ fontSize: 15, lineHeight: 1.75, marginTop: 0 }}><JPText text={arc.setting.scene} mode={mode} onTap={onTapWord} /></p>
          {exBox([arc.setting.jp, arc.setting.en], 0, arc.setting.pattern)}
        </div>
      )}
      {ext && (
        <div>
          <H>
            {ext.kind === "flip"
              ? "THE SAME SITUATION, YOUR SIDE"
              : <span style={{ color: T.shu }}>THE SITUATION DEVELOPS</span>}
          </H>
          <p style={{ fontSize: 15, lineHeight: 1.75, marginTop: 0 }}><JPText text={ext.scene} mode={mode} onTap={onTapWord} /></p>
          {extText && (
            <p style={{ fontSize: 15, lineHeight: 1.75, marginTop: 14, marginBottom: 0 }}><JPText text={extText} mode={mode} onTap={onTapWord} /></p>
          )}
          {exBox([ext.jp, ext.en], 0, pickHl(ext.jp, arc.setting.pattern, ext.kind === "wrinkle" ? (wr[ext.wr] || {}).hl : null))}
        </div>
      )}
      {page === "idea" && (
        <div>
          <H>THE IDEA</H>
          <p style={{ fontSize: 15, lineHeight: 1.75, marginTop: 0 }}><JPText text={exp.what || ""} mode={mode} onTap={onTapWord} /></p>
          {exp.when && (
            <>
              <H>WHEN YOU'D USE IT</H>
              <p style={{ fontSize: 15, lineHeight: 1.75, marginTop: 0 }}><JPText text={exp.when} mode={mode} onTap={onTapWord} /></p>
            </>
          )}
        </div>
      )}
      {page === "apart" && (
        <div>
          <H>ONE SENTENCE, TAKEN APART</H>
          <div style={{ fontFamily: T.jpFont, fontSize: 22, lineHeight: 1.9, marginBottom: 2 }}>
            <JPText text={point.ex[0][0]} mode={mode} onTap={onTapWord} />
          </div>
          <div style={{ fontSize: 13, color: T.sub, marginBottom: 14 }}>{point.ex[0][1]}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {deep.seg.map(([surf, gloss, target], i) => (
              <div key={i} style={{
                display: "flex", alignItems: "baseline", gap: 12, padding: "8px 12px",
                borderRadius: 6, border: `1px solid ${target ? T.shu + "66" : T.hairline}`,
                background: target ? "#FBEDEA" : T.sheet,
              }}>
                <span style={{ fontFamily: T.jpFont, fontSize: 18, color: target ? T.shu : T.ink, fontWeight: target ? 600 : 400, flexShrink: 0 }}>
                  <JPText text={surf} mode={mode} onTap={onTapWord} />
                </span>
                <span style={{ fontSize: 13, color: T.sub, lineHeight: 1.6 }}>
                  {target ? <strong style={{ color: T.shu, letterSpacing: ".4px" }}>THE POINT · </strong> : null}
                  {gloss}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      {page === "again" && (
        <div>
          <H>HOW IT'S BUILT — AND SIGHTED AGAIN</H>
          {exp.build && <p style={{ fontSize: 15, lineHeight: 1.75, marginTop: 0 }}><JPText text={exp.build} mode={mode} onTap={onTapWord} /></p>}
          {point.ex.slice(1).map((e, i) => exBox(e, i, deep.hl))}
          {deep.note && <p style={{ fontSize: 13, color: T.sub, marginTop: 12 }}>{deep.note}</p>}
        </div>
      )}
      {page === "watch" && (
        <div>
          <H><span style={{ color: T.shu }}>THE WRINKLES</span></H>
          {exp.watch && <p style={{ fontSize: 15, lineHeight: 1.75, marginTop: 0 }}><JPText text={exp.watch} mode={mode} onTap={onTapWord} /></p>}
          {leftover.map(([w, i]) => (
            <div key={i} style={{ marginTop: 14 }}>
              <p style={{ fontSize: 15, lineHeight: 1.75, margin: 0 }}><JPText text={w.t} mode={mode} onTap={onTapWord} /></p>
              {w.jp && exBox([w.jp, w.en], i, w.hl)}
            </div>
          ))}
        </div>
      )}
      {page === "try" && (
        <div style={{ textAlign: "center", padding: "10px 0" }}>
          <div style={{ fontFamily: T.jpFont, fontSize: 26, marginBottom: 8 }}>{point.jp}</div>
          <p style={{ fontSize: 14, color: T.sub, maxWidth: 420, margin: "0 auto 18px", lineHeight: 1.7 }}>
            You've seen it, seen it taken apart, and seen its edges. Now it's yours:
            first with the training wheels on, then free.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 300, margin: "0 auto" }}>
            {deep.drill && (
              <button className="btn-primary" style={{ padding: "12px 20px" }} onClick={() => goTab("drill")}>
                Fill in the blanks →
              </button>
            )}
            <button className="btn-ghost" style={{ padding: "10px 20px" }} onClick={() => goTab("practice")}>
              Write your own sentence →
            </button>
          </div>
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 22, paddingTop: 14, borderTop: `1px solid ${T.hairline}` }}>
        <button className="btn-ghost" style={{ visibility: cur > 0 ? "visible" : "hidden", padding: "10px 18px" }} onClick={() => setPi(Math.max(0, cur - 1))}>
          ← Back
        </button>
        <div style={{ flex: 1, display: "flex", justifyContent: "center", gap: 6 }}>
          {pages.map((p, i) => (
            <button key={p} onClick={() => setPi(i)} aria-label={`page ${i + 1}`} style={{
              width: 8, height: 8, borderRadius: 999, border: "none", cursor: "pointer", padding: 0,
              background: i === cur ? T.ink : T.hairline,
            }} />
          ))}
        </div>
        <button className="btn-primary" style={{ visibility: cur < pages.length - 1 ? "visible" : "hidden", padding: "10px 18px" }} onClick={() => setPi(Math.min(pages.length - 1, cur + 1))}>
          Next →
        </button>
      </div>
    </div>
  );
}

// ————— Drill (Session 14) —————
// The controlled middle step between watching and free writing: authored
// fill-in-the-blank items, checked deterministically — no grader, so this
// works identically in the static app. Choice items show four chips; typed
// items take keyboard input (any accepted alternative counts, kana or kanji,
// trailing punctuation ignored). pool entries draw DRILL_DRAW at random and
// the finish line invites another visit for the rest of the pool.
const normJP = (s) => (s || "").normalize("NFKC").replace(/[\s　。、．！？!?.,]/g, "");
function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function Blankline({ q, fill, ok, mode, onTap }) {
  const [before, after] = q.split("___");
  return (
    <div style={{ fontFamily: T.jpFont, fontSize: 20, lineHeight: 2 }}>
      <JPText text={before} mode={mode} onTap={onTap} />
      {fill == null ? (
        <span style={{ display: "inline-block", minWidth: 52, borderBottom: `2px solid ${T.ink}`, margin: "0 3px" }}>&nbsp;</span>
      ) : (
        <span style={{ color: ok ? T.ok : T.shu, fontWeight: 600, borderBottom: `2px solid ${ok ? T.ok : T.shu}`, margin: "0 3px" }}>
          <JPText text={fill} mode={mode} onTap={onTap} />
        </span>
      )}
      <JPText text={after || ""} mode={mode} onTap={onTap} />
    </div>
  );
}
function Drill({ point, deep, progress, onProgress, mode, onTapWord }) {
  const d = deep.drill;
  const [run, setRun] = useState(null);      // array of items for this run
  const [i, setI] = useState(0);
  const [answered, setAnswered] = useState(null); // { given, ok }
  const [typed, setTyped] = useState("");
  const [right, setRight] = useState(0);
  const [opts, setOpts] = useState([]);
  const p = progress[point.id] || {};

  const start = () => {
    const items = shuffled(d.items);
    const drawn = d.pool ? items.slice(0, DRILL_DRAW) : items;
    setRun(drawn); setI(0); setRight(0); setAnswered(null); setTyped("");
    setOpts(drawn[0].opts ? shuffled(drawn[0].opts) : []);
  };
  const item = run && run[i];
  const answer = (given) => {
    if (answered) return;
    const ok = item.a.some((acc) => normJP(acc) === normJP(given));
    setAnswered({ given, ok });
    if (ok) setRight((r) => r + 1);
  };
  const next = () => {
    if (i + 1 >= run.length) {
      const k = right, n = run.length;
      const prev = progress[point.id] || {};
      const oldRatio = prev.drillTotal ? (prev.drillBest || 0) / prev.drillTotal : -1;
      onProgress({
        ...progress,
        [point.id]: {
          ...prev, drillRuns: (prev.drillRuns || 0) + 1,
          ...(k / n >= oldRatio ? { drillBest: k, drillTotal: n } : {}),
        },
      });
      setRun([]); setI(-1); // -1 → finished screen
      return;
    }
    const ni = i + 1;
    setI(ni); setAnswered(null); setTyped("");
    setOpts(run[ni].opts ? shuffled(run[ni].opts) : []);
  };

  if (!run) {
    return (
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <p style={{ fontSize: 14, color: T.sub, maxWidth: 420, margin: "0 auto 6px", lineHeight: 1.7 }}>
          {d.note || <>Just the mechanic, nothing else: fill each blank with <span style={{ fontFamily: T.jpFont, color: T.ink }}>{point.jp}</span> doing its job.</>}
        </p>
        {d.pool && (
          <p style={{ fontSize: 12, color: T.sub, margin: "0 0 14px" }}>
            Each round draws {Math.min(DRILL_DRAW, d.items.length)} from a pool of {d.items.length} — no two rounds need be the same.
          </p>
        )}
        <button className="btn-primary" style={{ marginTop: 8, padding: "12px 24px" }} onClick={start}>
          {p.drillRuns ? "Another round" : "Start"}
        </button>
        {p.drillBest != null && (
          <p style={{ fontSize: 12, color: T.sub, marginTop: 10 }}>Best so far: {p.drillBest}/{p.drillTotal}</p>
        )}
      </div>
    );
  }
  if (i === -1) {
    return (
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <div style={{ fontFamily: T.jpFont, fontSize: 30, color: right === (run.length || right) ? T.ok : T.ink, marginBottom: 6 }}>
          {right === (run.length || right) ? "花丸" : "済"}
        </div>
        <p style={{ fontSize: 15, margin: "0 0 4px" }}>{right} of {run.length || right} — {right === (run.length || right) ? "clean sweep." : "the misses are the lesson."}</p>
        {d.pool && (
          <p style={{ fontSize: 13, color: T.sub, maxWidth: 400, margin: "6px auto 0", lineHeight: 1.7 }}>
            Other words are still waiting in the pool — come back any time for another round with a different draw.
          </p>
        )}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 16 }}>
          <button className="btn-ghost" onClick={start}>Again</button>
          <button className="btn-primary" onClick={() => setRun(null)}>Done</button>
        </div>
      </div>
    );
  }
  return (
    <div>
      <div style={{ fontSize: 12, color: T.sub, marginBottom: 10 }}>{i + 1} of {run.length}</div>
      <Blankline q={item.q} fill={answered ? (answered.ok ? answered.given : item.a[0]) : null} ok={answered ? answered.ok : null} mode={mode} onTap={onTapWord} />
      {item.en && <div style={{ fontSize: 13, color: T.sub, marginTop: 4 }}>{item.en}</div>}
      {!answered && item.opts && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
          {opts.map((o) => (
            <button key={o} className="btn-ghost" style={{ fontFamily: T.jpFont, fontSize: 17, padding: "9px 18px" }} onClick={() => answer(o)}>
              <JPText text={o} mode={mode} onTap={() => {}} />
            </button>
          ))}
        </div>
      )}
      {!answered && !item.opts && (
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && typed.trim()) answer(typed); }}
            placeholder="ここに…"
            style={{
              flex: 1, border: `1px solid ${T.hairline}`, borderRadius: 6, padding: "10px 12px",
              fontSize: 18, fontFamily: T.jpFont, background: T.paper,
            }}
          />
          <button className="btn-primary" disabled={!typed.trim()} onClick={() => answer(typed)}>Check</button>
        </div>
      )}
      {answered && (
        <div style={{ marginTop: 14 }}>
          <div style={{
            padding: "10px 14px", borderRadius: 6, fontSize: 14, lineHeight: 1.65,
            background: answered.ok ? "#EDF4EE" : "#FBEDEA",
            border: `1px solid ${answered.ok ? T.ok : T.shu}55`,
          }}>
            <strong style={{ color: answered.ok ? T.ok : T.shu }}>
              {answered.ok ? "That's it. " : <>It's <span style={{ fontFamily: T.jpFont }}>{item.a[0]}</span>. </>}
            </strong>
            <JPText text={item.why || ""} mode={mode} onTap={onTapWord} />
            {!answered.ok && !item.opts && normJP(answered.given) !== "" && (
              <div style={{ fontSize: 13, color: T.sub, marginTop: 6 }}>
                You wrote: <span style={{ fontFamily: T.jpFont }}>{answered.given}</span>
              </div>
            )}
          </div>
          <div style={{ textAlign: "right", marginTop: 12 }}>
            <button className="btn-primary" onClick={next}>{i + 1 >= run.length ? "Finish" : "Next →"}</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ————— Review challenge (Session 14) —————
// Always available from the grammar landing screen (and offered from Home):
// draw a mechanic at random from everything already learned and write with
// it. Two tiers — single (one mechanic) and multi (two while the learner is
// in Stage 1; three or four once Stage 2 points are learned, mixing stages).
// Each tier pays koban once per day, resetting at midnight in Tokyo. The
// payment rides the real grader, so the static build plays the challenge but
// pays nothing — grading and koban arrive with the full app (Lloyd's call,
// Session 14, over paying on self-report).
const CH_PAY = { single: 3, multi: 5, multi4: 8 };
function ReviewChallenge({ progress, onProgress, isDone, mode, onTapWord, onBack }) {
  const [tier, setTier] = useState(null);       // "single" | "multi"
  const [drawn, setDrawn] = useState(null);     // array of points
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);   // { ok, paid, data, static }
  const [err, setErr] = useState("");
  const gradingMsg = useRotating(GRADING_MESSAGES, loading);

  const pool = ALL_POINTS.filter((pt) => (!pt.kind || pt.kind === "grammar" || pt.kind === "skill") && isDone(pt));
  // Was: LEVELS.find(l => l.id === "S2"). That hard-coded the OLD stage numbering, where
  // S2 was the whole N4 set. After the Session 17 re-staging S2 is "Verbs arrive" (Steps
  // 3-4), which a learner reaches in their first week — the challenge would have jumped to
  // four patterns and the higher payout almost immediately. The concept was never about a
  // stage number; it is "has this learner got past N5 material", so derive it from the
  // JLPT reference and let it survive any future re-staging.
  const beyondN5ids = new Set(LEVELS.filter((l) => !/N5/.test(l.jlpt || "")).flatMap((l) => (l.groups || []).flatMap((g) => g.points.map((p) => p.id))));
  const s2live = pool.some((pt) => beyondN5ids.has(pt.id));
  const today = tokyoToday();
  const claimed = (t) => ((progress._challenge || {})[t] === today);

  const draw = (t) => {
    const n = t === "single" ? 1 : Math.min(pool.length, s2live ? 3 + Math.floor(Math.random() * 2) : 2);
    setTier(t); setDrawn(shuffled(pool).slice(0, n)); setText(""); setResult(null); setErr("");
  };
  const pay = tier === "single" ? CH_PAY.single : (drawn && drawn.length >= 3 ? CH_PAY.multi4 : CH_PAY.multi);

  const submit = async () => {
    const input = text.trim();
    if (!input || loading) return;
    if (STATIC_BUILD) { setResult({ static: true }); return; }
    setLoading(true); setErr(""); setResult(null);
    try {
      let ok, data;
      if (drawn.length === 1) {
        data = await callClaude(PRACTICE_SYSTEM, `${targetDescription(drawn[0])}\n\nLearner's sentence:\n${input}`);
        ok = !!data.uses_target;
      } else {
        const els = drawn.map((pt) => `- id "${pt.id}": ${pt.jp} — "${pt.en}"`).join("\n");
        data = await callClaude(
          BUILD_SYSTEM,
          `BRIEF SHOWN TO THE LEARNER:\nReview challenge — write 1–3 connected sentences using ALL of the listed patterns.\n\nREQUIRED ELEMENTS:\n${els}\n\nLearner's writing:\n${input}`
        );
        ok = (data.elements || []).length > 0 && data.elements.every((e) => e.correct);
      }
      let paid = 0;
      if (ok && !claimed(tier)) {
        paid = pay;
        await addKoban(paid);
        onProgress({ ...progress, _challenge: { ...(progress._challenge || {}), [tier]: today } });
      }
      setResult({ ok, paid, data });
    } catch (e) {
      setErr("Grading failed — try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button className="btn-ghost" onClick={onBack} style={{ marginBottom: 16 }}>← All grammar</button>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <h2 style={{ fontFamily: T.jpFont, fontSize: 26, margin: 0 }}>腕試し</h2>
        <span style={{ fontSize: 14, color: T.sub }}>review challenge — a test of your arm</span>
      </div>
      {!drawn && (
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 14, color: T.sub, lineHeight: 1.7, marginTop: 0 }}>
            Draw from everything you've learned, write, and see if it lands. Each tier pays
            once per day — the day turns over at midnight in Tokyo.
          </p>
          {pool.length === 0 ? (
            <p style={{ fontSize: 14, lineHeight: 1.7 }}>
              Nothing in the pool yet — the challenge draws only from lessons you've finished.
              Complete a grammar point or two and come back.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button className="point-row" onClick={() => draw("single")}>
                <span style={{ fontFamily: T.jpFont, fontSize: 20, color: T.shu }}>一</span>
                <span style={{ flex: 1, textAlign: "left" }}>
                  <span style={{ display: "block", fontSize: 15, fontWeight: 600 }}>Single mechanic</span>
                  <span style={{ display: "block", fontSize: 13, color: T.sub }}>One pattern, one sentence.</span>
                </span>
                <span style={{ fontSize: 13, color: T.sub }}>
                  {claimed("single") ? <span style={{ color: T.ok }}>済 today</span> : <>{CH_PAY.single} <KobanIcon size={11} /></>}
                </span>
              </button>
              <button className="point-row" onClick={() => draw("multi")} disabled={pool.length < 2} style={pool.length < 2 ? { opacity: .55, cursor: "default" } : undefined}>
                <span style={{ fontFamily: T.jpFont, fontSize: 20, color: T.shu }}>組</span>
                <span style={{ flex: 1, textAlign: "left" }}>
                  <span style={{ display: "block", fontSize: 15, fontWeight: 600 }}>Multi mechanic</span>
                  <span style={{ display: "block", fontSize: 13, color: T.sub }}>
                    {s2live ? "Three or four patterns, woven together — Stage 2 rules." : "Two patterns in one piece of writing."}
                  </span>
                </span>
                <span style={{ fontSize: 13, color: T.sub }}>
                  {claimed("multi") ? <span style={{ color: T.ok }}>済 today</span> : <>{s2live ? CH_PAY.multi4 : CH_PAY.multi} <KobanIcon size={11} /></>}
                </span>
              </button>
            </div>
          )}
          <p style={{ fontSize: 12, color: T.sub, marginTop: 14 }}>
            済 means today's koban for that tier are already claimed — the writing itself is unlimited.
          </p>
        </div>
      )}
      {drawn && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".6px", color: T.sub, marginBottom: 8 }}>
            YOUR DRAW — {drawn.length === 1 ? "USE THIS PATTERN" : `WEAVE ALL ${drawn.length} TOGETHER`}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {drawn.map((pt) => (
              <div key={pt.id} style={{ display: "flex", alignItems: "center", gap: 10, background: T.sheet, border: `1px solid ${T.hairline}`, borderRadius: 6, padding: "10px 14px" }}>
                <KindMarker kind={pt.kind} script="en" />
                <span style={{ fontFamily: T.jpFont, fontSize: 17 }}>{pt.jp}</span>
                <span style={{ fontSize: 13, color: T.sub, flex: 1 }}>{pt.en}</span>
              </div>
            ))}
          </div>
          {!result && (
            <>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, 300))}
                placeholder="ここに文を書いてください…"
                rows={drawn.length > 1 ? 4 : 2}
                style={{
                  width: "100%", boxSizing: "border-box", border: `1px solid ${T.hairline}`, borderRadius: 6,
                  padding: 12, fontSize: 18, lineHeight: 1.9, fontFamily: T.jpFont, background: T.paper,
                  resize: "vertical", marginTop: 12,
                }}
              />
              <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <button className="btn-primary" onClick={submit} disabled={loading || !text.trim()}>
                  {loading ? "Grading…" : "Submit"}
                </button>
                <button className="btn-ghost" onClick={() => draw(tier)} disabled={loading}>Draw again</button>
                {loading && <span style={{ fontSize: 13, color: T.sub, fontStyle: "italic" }} aria-live="polite">{gradingMsg}</span>}
              </div>
              {err && <p style={{ color: T.shu, fontSize: 14 }}>{err}</p>}
            </>
          )}
          {result && result.static && (
            <div style={{ marginTop: 14, padding: "12px 16px", borderRadius: 6, background: T.sheet, border: `1px solid ${T.hairline}`, fontSize: 14, lineHeight: 1.7 }}>
              Written — now hold it against the drawn pattern{drawn.length > 1 ? "s" : ""} in Learn.
              The grader, and the koban it pays, arrive with the full app.
              <div style={{ marginTop: 10, fontFamily: T.jpFont, fontSize: 17, lineHeight: 1.9 }}>
                <JPText text={text} mode={mode} onTap={onTapWord} />
              </div>
              <div style={{ marginTop: 12 }}>
                <button className="btn-ghost" onClick={() => { setDrawn(null); setTier(null); }}>Back to tiers</button>
              </div>
            </div>
          )}
          {result && !result.static && (
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{
                padding: "12px 16px", borderRadius: 6, background: result.ok ? "#EDF4EE" : "#FBEDEA",
                border: `1px solid ${result.ok ? T.ok : T.shu}55`, fontSize: 14, lineHeight: 1.6,
              }}>
                <strong style={{ color: result.ok ? T.ok : T.shu }}>
                  {result.ok ? "Challenge complete. " : "Not yet — the pattern didn't land. "}
                </strong>
                {result.paid ? <span>+{result.paid} <KobanIcon size={12} /> · next {tier} challenge pays at midnight, Tokyo time.</span>
                  : result.ok ? <span>Today's {tier} koban were already claimed — this one was for the practice.</span> : null}
                <div style={{ marginTop: 6 }}>
                  <JPText text={(result.data.target_feedback || result.data.feedback || "")} mode={mode} onTap={onTapWord} />
                </div>
              </div>
              {result.data.elements && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {result.data.elements.map((el) => {
                    const pt = drawn.find((x) => x.id === el.id);
                    return (
                      <div key={el.id} style={{ display: "flex", gap: 10, alignItems: "baseline", fontSize: 13, padding: "6px 10px", borderRadius: 6, background: T.sheet, border: `1px solid ${T.hairline}` }}>
                        <span style={{ color: el.correct ? T.ok : T.shu }}>{el.correct ? "✓" : "✗"}</span>
                        <span style={{ fontFamily: T.jpFont }}>{pt ? pt.jp : el.id}</span>
                        <span style={{ color: T.sub, flex: 1 }}>{el.note}</span>
                      </div>
                    );
                  })}
                </div>
              )}
              <IssueList issues={result.data.issues} mode={mode} onTapWord={onTapWord} />
              {result.data.rewrite && (
                <div style={{ border: `1px solid ${T.hairline}`, borderRadius: 6, padding: "12px 16px", background: T.sheet }}>
                  <div style={{ fontSize: 12, color: T.ok, fontWeight: 600, letterSpacing: ".5px", marginBottom: 6 }}>
                    NATURAL VERSION{result.data.score ? ` · ${result.data.score}/5` : ""}
                  </div>
                  <div style={{ fontFamily: T.jpFont, fontSize: 17, lineHeight: 1.9 }}><JPText text={result.data.rewrite} mode={mode} onTap={onTapWord} /></div>
                </div>
              )}
              <div>
                <button className="btn-ghost" onClick={() => { setDrawn(null); setTier(null); }}>Back to tiers</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Module({ point, progress, onProgress, onBack, mode, onTapWord, script = "en" }) {
  const [tab, setTab] = useState("learn");
  const p = progress[point.id] || {};
  const kind = KINDS[point.kind || "grammar"];
  const group = CURRICULUM.find((g) => g.points.some((x) => x.id === point.id));
  const bank = (group && group.bank) || [];
  // Deep entries exist only for grammar and skill points; seg drives the
  // staged walkthrough, drill drives the Drill tab — independently, so a
  // skill builder can keep its four-beat Learn and still drill.
  const deep = (!point.kind || point.kind === "grammar" || point.kind === "skill") ? DEEP[point.id] : null;
  const tabs =
    point.kind === "primer" ? [["learn", "Learn"]]
    : point.kind === "build" ? [["learn", "Learn"], ["build", "Write"]]
    : deep && deep.drill ? [["learn", "Learn"], ["drill", "Drill"], ["quiz", "Quiz"], ["practice", "Practice"]]
    : [["learn", "Learn"], ["quiz", "Quiz"], ["practice", "Practice"]];

  // Primers have nothing to submit, so opening one is what counts as doing it.
  useEffect(() => {
    if (point.kind !== "primer") return;
    const prev = progress[point.id] || {};
    if (prev.read) return;
    onProgress({ ...progress, [point.id]: { ...prev, read: true } });
  }, [point.id]);

  return (
    <div>
      <button className="btn-ghost" onClick={onBack} style={{ marginBottom: 16 }}>← All grammar points</button>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
        <h2 style={{ fontFamily: T.jpFont, fontSize: 26, margin: 0 }}>{point.jp}</h2>
        <span style={{ fontSize: 14, color: T.sub }}>{point.en}</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <KindMarker kind={point.kind} script={script} />
          <span style={{ fontSize: 12, color: T.sub }}>{kind.label}</span>
        </span>
        {/* The "Stage 2 stress test" chip retired in Session 14 — Stage 2 is
            a real stage now; the n4 flags stay harmlessly on the old points. */}
      </div>
      <div style={{ display: "flex", gap: 6, margin: "16px 0", visibility: tabs.length > 1 ? "visible" : "hidden", height: tabs.length > 1 ? "auto" : 0 }}>
        {tabs.map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              padding: "7px 16px", borderRadius: 999, fontSize: 13, cursor: "pointer", fontFamily: T.uiFont,
              background: tab === id ? T.ink : "none", color: tab === id ? T.paper : T.sub,
              border: `1px solid ${tab === id ? T.ink : T.hairline}`,
            }}
          >
            {label}
            {id === "quiz" && p.quizBest != null ? ` · ${p.quizBest}/${p.quizTotal}` : ""}
            {id === "drill" && p.drillBest != null ? ` · ${p.drillBest}/${p.drillTotal}` : ""}
            {id === "practice" && p.practiced ? ` · ${p.practiced}` : ""}
            {id === "build" && p.bestElements != null ? ` · ${p.bestElements}/${p.elementTotal}` : ""}
          </button>
        ))}
      </div>
      <div style={{ background: T.sheet, border: `1px solid ${T.hairline}`, borderRadius: 8, padding: 20 }}>
        {tab === "learn" && deep && deep.seg && (
          <Walkthrough point={point} deep={deep} progress={progress} onProgress={onProgress} mode={mode} onTapWord={onTapWord} goTab={setTab} />
        )}
        {tab === "learn" && !(deep && deep.seg) && (
          <div>
            <Explanation exp={point.exp} mode={mode} onTapWord={onTapWord} />
            {point.covers && (
              <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 6 }}>
                {point.covers.map((id) => {
                  const p2 = ALL_POINTS.find((x) => x.id === id);
                  return p2 ? <Chip key={id}>{p2.jp}</Chip> : null;
                })}
              </div>
            )}
            {point.ex.map(([jp, en], i) => (
              <div key={i} style={{ marginTop: 12, paddingLeft: 14, borderLeft: `3px solid ${T.hairline}` }}>
                <div style={{ fontFamily: T.jpFont, fontSize: 18, lineHeight: 1.9 }}><JPText text={jp} mode={mode} onTap={onTapWord} /></div>
                <div style={{ fontSize: 13, color: T.sub }}>{en}</div>
              </div>
            ))}
            <p style={{ fontSize: 12, color: T.sub, marginBottom: 0, marginTop: 18 }}>
              {point.kind === "primer"
                ? "That's the whole primer — nothing to answer, nothing to write. Step 1 starts the actual Japanese."
                : point.kind === "build"
                ? "Ready? Open Write — you'll see the brief and a checklist of what to include."
                : deep && deep.drill
                ? "Ready? Warm up with the Drill, then the quiz, then write your own sentence in Practice."
                : "Ready? Take the quiz, then write your own sentence in Practice."}
            </p>
          </div>
        )}
        {tab === "drill" && deep && deep.drill && <Drill point={point} deep={deep} progress={progress} onProgress={onProgress} mode={mode} onTapWord={onTapWord} />}
        {tab === "quiz" && <Quiz point={point} progress={progress} onProgress={onProgress} mode={mode} onTapWord={onTapWord} />}
        {tab === "practice" && <Practice point={point} bank={bank} progress={progress} onProgress={onProgress} mode={mode} onTapWord={onTapWord} />}
        {tab === "build" && <Build point={point} bank={bank} progress={progress} onProgress={onProgress} mode={mode} onTapWord={onTapWord} />}
      </div>
    </div>
  );
}

// ————— First-clear timestamps (Session 11) —————
// Every save stamps any array element, object key, or newly-set field that has
// no stamp yet, under progress._firstAt. The then-vs-now moment
// (reward-system-design-v1.md) needs this history before Phase 0 recruiting;
// nothing reads it yet. Stamps equal to _stampEpoch predate stamping.
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

export default function GrammarPractice() {
  const [progress, setProgress] = useState({});
  const [kanjiMode, setKanjiMode] = useState("kanji");
  const [popup, setPopup] = useState(null);
  const [levelId, setLevelId] = useState(null);
  const [current, setCurrent] = useState(null);
  const [query, setQuery] = useState("");
  const [openCats, setOpenCats] = useState(null); // null → fall back to first unfinished step
  const [challenge, setChallenge] = useState(false);
  const loaded = useRef(false);

  const [, setIntegrationTick] = useState(0);
  useEffect(() => {
    loadProgress().then((p) => { setProgress(p); loaded.current = true; });
    // Known-kanji + kana-fluency live in module-level state; bump a counter
    // once they load so everything annotated re-renders against real data.
    loadIntegrationState().then(() => setIntegrationTick((t) => t + 1));
    (async () => {
      try { const r = await window.storage.get("kanji-mode"); if (r && (r.value === "kana" || r.value === "kanji")) setKanjiMode(r.value); } catch {}
    })();
    // Home's challenge card sets this flag before navigating here. localStorage
    // rather than window.storage because it is the app shell's medium; guarded
    // because the artifact iframe may deny it.
    try {
      if (localStorage.getItem("naoshi-open-challenge")) {
        localStorage.removeItem("naoshi-open-challenge");
        setChallenge(true);
      }
    } catch {}
  }, []);

  const setMode = (m) => {
    setKanjiMode(m);
    try { window.storage.set("kanji-mode", m); } catch {}
  };

  const updateProgress = (p) => {
    const s = stampFirsts(p);
    setProgress(s);
    if (loaded.current) saveProgress(s);
  };

  const isDone = (pt) => {
    const pr = progress[pt.id];
    if (!pr) return false;
    if (pt.kind === "primer") return !!pr.read;
    if (pt.kind === "build") return !!pr.built;
    // `studied` is the static build's self-mark; nothing writes it in the
    // artifact, so behaviour there is unchanged. Progress imported from the
    // artifact keeps counting through quizBest.
    return (pr.quizBest != null || !!pr.studied) && !!pr.practiced;
  };

  const stagesComplete = LEVELS.filter(
    (l) => !l.locked && levelPoints(l).length > 0 && levelPoints(l).every(isDone)
  ).length;

  const level = levelId ? LEVELS.find((l) => l.id === levelId) : null;
  const point = current ? ALL_POINTS.find((p) => p.id === current) : null;
  // Derive from the point rather than the open stage, so a lesson reached by
  // any route still shows its own stage's marker script.
  const pointScript = point
    ? (LEVELS.find((l) => (l.groups || []).some((g) => g.points.some((p) => p.id === point.id))) || {}).markers || "en"
    : "en";
  const q = query.trim().toLowerCase();

  // Everything starts collapsed except the first step with work left in it, so
  // the stage opens on one short list rather than every lesson at once.
  const firstUnfinished = level
    ? (level.groups.find((g) => g.points.some((p) => !isDone(p))) || level.groups[0] || {}).cat
    : null;
  const isOpen = (name) => (q ? true : openCats ? openCats.has(name) : name === firstUnfinished);
  const toggleCat = (name) =>
    setOpenCats((prev) => {
      const next = new Set(prev || (firstUnfinished ? [firstUnfinished] : []));
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });

  return (
    <div style={{ minHeight: "100vh", background: T.paper, fontFamily: T.uiFont, color: T.ink }}>
      <style>{`
        .btn-primary { background: ${T.ink}; color: ${T.paper}; border: none; padding: 9px 20px;
          border-radius: 6px; font-size: 14px; cursor: pointer; font-family: inherit; }
        .btn-primary:disabled { opacity: .5; cursor: default; }
        .btn-ghost { background: none; border: 1px solid ${T.hairline}; color: ${T.sub};
          padding: 6px 12px; border-radius: 6px; font-size: 13px; cursor: pointer; font-family: inherit; }
        .btn-ghost:hover { color: ${T.ink}; border-color: #CFCDC4; }
        .kind-mark ruby { ruby-position: over; }
        .kind-mark rt { font-size: 8px; font-weight: 400; letter-spacing: 0; line-height: 1.1;
          color: rgba(255,255,255,.8); }
        .step-head { display: flex; align-items: center; gap: 10px; width: 100%; background: none;
          border: none; border-bottom: 1px solid ${T.hairline}; padding: 10px 2px; cursor: pointer;
          font-family: inherit; }
        .step-head:hover span { color: ${T.ink}; }
        .point-row { display: flex; align-items: center; gap: 10px; width: 100%; text-align: left;
          background: ${T.sheet}; border: 1px solid ${T.hairline}; border-radius: 6px;
          padding: 10px 14px; cursor: pointer; font-family: inherit; }
        .point-row:hover { border-color: #CFCDC4; }
        .level-card { display: flex; align-items: center; gap: 16px; width: 100%; text-align: left;
          background: ${T.sheet}; border: 1px solid ${T.hairline}; border-radius: 8px;
          padding: 18px 20px; cursor: pointer; font-family: inherit; }
        .level-card:hover:not(:disabled) { border-color: #CFCDC4; }
        .level-card:disabled { cursor: default; opacity: .55; }
        textarea:focus, input:focus, button:focus-visible { outline: 2px solid ${T.ai}; outline-offset: 2px; }
      `}</style>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px 80px" }}>
        <header style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 6 }}>
          <div style={{ fontFamily: T.jpFont, fontSize: 34, color: T.shu, lineHeight: 1 }}>学</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>Grammar Practice</div>
            <div style={{ fontSize: 13, color: T.sub }}>
              {level ? `Stage ${level.title} · ${level.subtitle} (${level.jlpt})` : "Pick your stage · learn → quiz → write"}
            </div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", border: `1px solid ${T.hairline}`, borderRadius: 999, overflow: "hidden" }} role="group" aria-label="Kanji display mode">
            {[["kana", "かな"], ["kanji", "漢字"]].map(([m, label]) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  border: "none", cursor: "pointer", fontFamily: T.jpFont, fontSize: 13, padding: "6px 12px",
                  background: kanjiMode === m ? T.ink : "none", color: kanjiMode === m ? T.paper : T.sub,
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </header>
        <div style={{ height: 1, background: T.hairline, margin: "18px 0 22px" }} />

        {challenge ? (
          <ReviewChallenge progress={progress} onProgress={updateProgress} isDone={isDone} mode={kanjiMode} onTapWord={setPopup} onBack={() => setChallenge(false)} />
        ) : point ? (
          <Module point={point} progress={progress} onProgress={updateProgress} onBack={() => setCurrent(null)} mode={kanjiMode} onTapWord={setPopup} script={pointScript} />
        ) : level ? (
          <div>
            <button className="btn-ghost" onClick={() => { setLevelId(null); setQuery(""); setOpenCats(null); }} style={{ marginBottom: 16 }}>
              ← All stages
            </button>
            {level.tagline && <p style={{ fontSize: 14, color: T.sub, marginTop: 0 }}>{level.tagline}</p>}
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search Stage ${level.title}…`}
              style={{
                width: "100%", boxSizing: "border-box", border: `1px solid ${T.hairline}`, borderRadius: 6,
                padding: "10px 14px", fontSize: 14, marginBottom: 14, background: T.sheet, fontFamily: "inherit",
              }}
            />
            <div style={{
              display: "flex", flexWrap: "wrap", gap: "8px 16px", alignItems: "center",
              paddingBottom: 14, marginBottom: 16, borderBottom: `1px solid ${T.hairline}`,
            }}>
              {KIND_ORDER.map((k) => (
                <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: T.sub }}>
                  <KindMarker kind={k} script={level.markers} />
                  {KINDS[k].label}
                </span>
              ))}
              <span style={{ fontSize: 12, color: T.hairline, marginLeft: "auto" }}>nothing is gated yet</span>
            </div>
            {level.groups.map((cat) => {
              const pts = cat.points.filter(
                (p) => !q || p.jp.toLowerCase().includes(q) || p.en.toLowerCase().includes(q)
              );
              if (pts.length === 0) return null;
              const done = cat.points.filter(isDone).length;
              const complete = done === cat.points.length;
              const open = isOpen(cat.cat);
              return (
                <section key={cat.cat} style={{ marginBottom: 10 }}>
                  <button
                    className="step-head"
                    onClick={() => toggleCat(cat.cat)}
                    aria-expanded={open}
                    aria-label={`${cat.cat} — ${complete ? "complete" : done ? "in progress" : "not started"}`}
                  >
                    <span style={{ color: T.sub, fontSize: 11, width: 10, transition: "transform .15s",
                      display: "inline-block", transform: open ? "rotate(90deg)" : "none" }}>▶</span>
                    <span style={{ fontSize: 13, letterSpacing: ".5px", color: T.ink, textTransform: "uppercase", flex: 1, textAlign: "left" }}>
                      {cat.cat}
                    </span>
                    {complete ? (
                      <span style={{ fontFamily: T.jpFont, fontSize: 14, color: T.ok }}>済</span>
                    ) : done > 0 ? (
                      // Progress without a number: a bare count of lessons is
                      // discouraging, a part-filled bar is not.
                      <span style={{ width: 44, height: 3, background: T.hairline, borderRadius: 2, overflow: "hidden" }}>
                        <span style={{
                          display: "block", height: 3, borderRadius: 2, background: T.note,
                          width: `${Math.round((done / cat.points.length) * 100)}%`,
                        }} />
                      </span>
                    ) : null}
                  </button>
                  {open && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
                      {pts.map((p) => {
                        const pr = progress[p.id] || {};
                        const isComplete = isDone(p);
                        const started = pr.quizBest != null || pr.practiced || pr.built;
                        return (
                          <button key={p.id} className="point-row" onClick={() => setCurrent(p.id)}>
                            <span style={{ fontSize: 12, color: T.sub, minWidth: 16, textAlign: "right" }}>
                              {cat.points.indexOf(p) + 1}
                            </span>
                            <KindMarker kind={p.kind} script={level.markers} />
                            <span style={{ fontFamily: T.jpFont, fontSize: 17, minWidth: 0 }}>{p.jp}</span>
                            <span style={{ fontSize: 13, color: T.sub, flex: 1 }}>{p.en}</span>
                            <span style={{ fontSize: 13, color: isComplete ? T.ok : started ? T.note : T.hairline }}>
                              {isComplete ? "済" : started ? "…" : "○"}
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
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button className="level-card" onClick={() => setChallenge(true)} style={{ border: `1px solid ${T.shu}55` }}>
              <span style={{ fontFamily: T.jpFont, fontSize: 26, color: T.shu, minWidth: 54 }}>腕</span>
              <span style={{ flex: 1 }}>
                <span style={{ display: "block", fontSize: 15, fontWeight: 600 }}>Review challenge</span>
                <span style={{ display: "block", fontSize: 13, color: T.sub, marginTop: 2 }}>
                  Draw from what you've learned and write. Fresh koban daily — the day turns at midnight, Tokyo time.
                </span>
              </span>
              <span style={{ fontSize: 13, color: T.sub }}>›</span>
            </button>
            <p style={{ fontSize: 13, color: T.sub, margin: "0 0 4px" }}>
              {stagesComplete === 0
                ? `No stages finished yet · ${LEVELS.length} to go`
                : `${stagesComplete} of ${LEVELS.length} stages complete`}
            </p>
            {LEVELS.map((l) => {
              const pts = levelPoints(l);
              const done = pts.filter(isDone).length;
              return (
                <button
                  key={l.id}
                  className="level-card"
                  disabled={!!l.locked}
                  onClick={() => !l.locked && setLevelId(l.id)}
                >
                  <span style={{ fontFamily: T.jpFont, fontSize: 30, color: l.locked ? T.sub : T.shu, minWidth: 54 }}>
                    {l.title}
                  </span>
                  <span style={{ flex: 1 }}>
                    <span style={{ display: "block", fontSize: 15, fontWeight: 600 }}>{l.subtitle}</span>
                    <span style={{ display: "block", fontSize: 13, color: T.sub, marginTop: 2 }}>
                      {l.locked ? `Coming soon · ${l.jlpt}` : l.jlpt}
                    </span>
                  </span>
                  {!l.locked && done > 0 && done === pts.length && (
                    <span style={{ fontFamily: T.jpFont, color: T.ok, fontSize: 20 }}>済</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
      {popup && (
        <div onClick={() => setPopup(null)} style={{ position: "fixed", inset: 0, background: "#22252B66", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: T.sheet, borderRadius: 10, padding: "22px 28px", maxWidth: 300, textAlign: "center", border: `1px solid ${T.hairline}` }}>
            <div style={{ fontFamily: T.jpFont, fontSize: 40 }}>{popup[0]}</div>
            <div style={{ fontFamily: T.jpFont, fontSize: 18, color: T.sub, marginTop: 4 }}>{popup[1]}</div>
            {popup[2] ? <div style={{ fontSize: 14, marginTop: 6 }}>{popup[2]}</div> : null}
            <div style={{ marginTop: 10 }}>
              <Chip color={popup[3] === "KNOWN" ? undefined : T.note}>
                {popup[3] === "KNOWN" ? "You know this one" : popup[3] === "UNK" ? "Not in dictionary yet" : "Reading shown for now"}
              </Chip>
            </div>
            {popup[3] === "UNK" ? (
              <p style={{ fontSize: 12, color: T.sub, marginTop: 10, marginBottom: 0 }}>Prototype dictionary gap — the full tokenizer pipeline will cover every word.</p>
            ) : popup[3] !== "KNOWN" ? (
              <p style={{ fontSize: 12, color: T.sub, marginTop: 10, marginBottom: 0 }}>The kanji module teaches this one — until then it keeps its reading.</p>
            ) : null}
            <button className="btn-ghost" style={{ marginTop: 14 }} onClick={() => setPopup(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
