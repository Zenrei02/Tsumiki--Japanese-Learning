import { useState, useEffect, useRef } from "react";

// ————— Design tokens (same family as the checker) —————
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
  jpFont: '"Hiragino Mincho ProN","Yu Mincho","Noto Serif JP",serif',
  uiFont: '-apple-system,BlinkMacSystemFont,"Segoe UI","Hiragino Sans","Noto Sans JP",sans-serif',
};

// ————— Kanji display dictionary —————
// Prototype subset, AI-tagged and pending native review. The real app replaces
// this with a tokenizer-based annotation pipeline (see tracker).
// [written form, kana reading, meaning, kanji level]
const KANJI_DICT = [
  ["ご飯", "ごはん", "rice; a meal", "N4"],
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
      { id: "rc1", jp: "復習 · Steps 1–3", en: "checkpoint: basics, particles & tense", kind: "review", covers: ["desu", "ka", "wa", "ga", "o", "ni-time", "de-place", "mo", "no", "masu", "mashita", "teiru", "mada", "sb-no", "sb-kosoado", "sb-yone", "sb-counters", "sb-negq"], exp: "Mixed review of everything so far: the copula, core particles, and polite tense. The quiz pulls from all of it. In practice, try combining at least two patterns in one sentence.", ex: [] },
    ],
  },
  {
    cat: "Step 5 · Requests, permission & obligation",
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
    ],
  },
  {
    cat: "Step 13 · て-form, second wind",
    level: "N4",
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
    level: "N4",
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
    level: "N4",
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
    level: "N4",
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
    level: "N4",
    points: [
      { id: "rc4", jp: "復習 · Steps 13–16", en: "checkpoint: aspect, kindness, evidence, ifs", kind: "review", covers: ["teshimau", "teoku", "tearu", "sb-aspect", "temiru", "teikutekuru", "teageru", "ageru2", "itadaku", "tehoshii", "sb-kuremorau", "kamo", "hazu", "youda", "rashii", "souda-mite", "souda-denbun", "sb-sou", "ba", "nara", "taradou", "sb-if4"], exp: "Stage 2's first checkpoint — the て-form's second wind, the favor triangle in both registers, the whole evidence dial, and all four ifs. These four steps are one arc: what you do, what you owe, what you know, and what would follow.", ex: [] },
    ],
  },

  {
    cat: "Step 17 · Intentions, decisions & change",
    level: "N4",
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
    level: "N4",
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
    level: "N4",
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
    level: "N4",
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
    level: "N4",
    points: [
      { id: "rc5", jp: "復習 · Steps 17–20", en: "checkpoint: plans, ability, time, voices", kind: "review", covers: ["you-vol", "youtoomou", "kotonisuru", "kotoninaru", "yotei", "youninaru", "younisuru", "sb-suru-naru", "kotogadekiru", "takotogaaru", "kotogaaru", "sugiru", "yasui-nikui", "teiru3", "aida", "madeni", "tokoro", "bakari", "naide", "sb-madeni", "saseru", "saserareru", "meirei", "nasai", "sb-rareru"], exp: "The second Stage 2 checkpoint — intentions and the する/なる axis, ability and experience, time's edges, and the voice system from making to being-made. Four steps about will: yours, time's, and other people's.", ex: [] },
    ],
  },

  {
    cat: "Step 21 · Reasons, concessions & flow",
    level: "N4",
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
    level: "N4",
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
    level: "N4",
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
    level: "N4",
    points: [
      { id: "rc6", jp: "復習 · Stage 2", en: "checkpoint: the full stage", kind: "review", covers: ["temiru", "teikutekuru", "teageru", "ageru2", "itadaku", "tehoshii", "sb-kuremorau", "kamo", "hazu", "youda", "rashii", "souda-mite", "souda-denbun", "sb-sou", "ba", "nara", "sb-if4", "youtoomou", "kotonisuru", "kotoninaru", "youninaru", "younisuru", "sb-suru-naru", "kotogadekiru", "takotogaaru", "sugiru", "teiru3", "aida", "madeni", "tokoro", "bakari", "naide", "sb-madeni", "saseru", "saserareru", "sb-rareru", "shi", "noni", "temo", "sb-noni", "kadouka", "ka-embed", "koto-no", "toiuimi", "sb-kotono", "garu", "hoshigaru", "sb-minds"], exp: "The full Stage 2 review — aspect and kindness, evidence and ifs, will and time, voices, temperatures, boxes, and other minds. One stage, one long argument: what you do, what you know, and what you can honestly claim about anyone else. Write like you mean it.", ex: [] },
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
  // @@DEEP-END
};
const DRILL_DRAW = 5;

const LEVELS = [
  { id: "S1", title: "1", subtitle: "Foundations", jlpt: "≈ JLPT N5", markers: "en", tagline: "First sentences to full daily basics — grammar, skill builders, culture stops, and checkpoints along the way.", groups: CURRICULUM.filter((c) => !c.level) },
  { id: "S2", title: "2", subtitle: "Everyday fluency", jlpt: "≈ JLPT N4", markers: "kana", tagline: "The て-form's second wind, then the language of kindness — favors given, received, and wished for. Growing step by step.", groups: CURRICULUM.filter((c) => c.level === "N4") },
  { id: "S3", title: "3", subtitle: "Independence", jlpt: "≈ JLPT N3", markers: "kanji", locked: true },
  { id: "S4", title: "4", subtitle: "Nuance", jlpt: "≈ JLPT N2", markers: "kanji", locked: true },
  { id: "S5", title: "5", subtitle: "Mastery", jlpt: "≈ JLPT N1", markers: "kanji", locked: true },
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
const STATIC_BUILD = false;

// ————— API helpers —————
async function callClaude(system, user, maxTokens = 1000) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-5",
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message || "API error");
  const raw = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
  return JSON.parse(raw.replace(/```json|```/g, "").trim());
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

const QUIZ_SYSTEM = `You write multiple-choice quiz questions for adult English speakers learning Japanese. You are given ONE target grammar point. Rules:
1. Every question must test ONLY the target grammar point. Distractors should be plausible confusions with it.
2. Use only JLPT N5 vocabulary (plus the target pattern itself). Keep sentences short.
3. Exactly ONE option may be correct. Double-check that no distractor is also acceptable; if a distractor could be argued correct, replace it.
4. Vary question style: fill-in-the-blank (use ___), choose-the-correct-sentence, or choose-the-meaning.
Respond with ONLY valid JSON, no fences:
{"questions":[{"q":"<question text, Japanese with ___ where needed>","options":["...","...","...","..."],"answer":<0-3>,"why":"<one-sentence English explanation of the correct answer>"}]}
5. If the target is a REVIEW CHECKPOINT listing multiple grammar points, spread the 5 questions across different points from the list.
6. In the "q" and "options" fields, write EVERY word that contains kanji in the format 【word|reading】, e.g. 【映画|えいが】を【見|み】ます. Never use this format in "why".
Generate exactly 5 questions.`;

const PRACTICE_SYSTEM = `You grade one sentence written by an adult English-speaking Japanese learner practicing ONE target grammar point. Rules:
1. First judge whether the sentence attempts and correctly uses the target pattern.
2. Then check the whole sentence for other errors (particles, conjugation, word choice, word order, register, naturalness, orthography). Do NOT invent errors; if it's correct and natural, say so.
3. Watch for classic English-speaker issues: unnecessary 私/あなた, が vs を traps (好き, 上手, ほしい, わかる, potential forms), transitive/intransitive mix-ups.
4. Every issue has a "type":
   - "fix" — grammatically wrong; must be corrected.
   - "unnatural" — grammatically CORRECT, but a native speaker wouldn't phrase it this way: stiff or textbook-flavored wording, direct-translation phrasing, odd collocations, unnecessary pronouns. Acknowledge it's correct; show the natural alternative.
   - "note" — neither wrong nor unnatural; a growth opportunity. Examples: a word written in kana where the kanji is standard and at/near the learner's level (e.g. いたい → 痛い, name the kanji's JLPT level); an optional politeness upgrade that would fit the context.
   Never mark correct kana usage as a "fix". Kana-for-kanji is always a "note". Choose exactly one type per issue; when torn between "fix" and "unnatural", ask: would this be marked wrong on a grammar test? If not, it's "unnatural".
   "note" IS NOT A BUCKET FOR MARGINAL OBSERVATIONS. Emit one only when the learner would actually do something differently next time. If a note would not change what they write, omit it. Zero notes is the correct output for a good sentence, and a sentence carrying more notes than it has real issues is over-annotated.
5. If the target is a REVIEW CHECKPOINT listing multiple patterns, "uses_target" means the sentence correctly uses at least one of them (praise using two or more).
6. Explanations are in plain English for a beginner. Preserve the writer's intended meaning.
7. In the "rewrite" field, write every word that contains kanji as 【word|reading】, e.g. 【ご飯|ごはん】を【食|た】べました. NEVER use this format in "span", "correction", or "explanation" — those must stay plain.
Respond with ONLY valid JSON, no fences:
{"uses_target":true|false,"target_feedback":"<1-2 sentences: how well they used the target pattern>","issues":[{"type":"fix"|"unnatural"|"note","span":"<exact substring>","correction":"<fixed or suggested substring>","explanation":"<1-2 sentences>"}],"score":<1-5 naturalness>,"rewrite":"<the sentence rewritten naturally using the target pattern, changing as little as possible>"}`;

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
const BUILD_SYSTEM = `You grade a short composition (1–4 sentences) written by an adult English-speaking Japanese learner. This is NOT a single-pattern drill: the learner was asked to combine several grammar points they have already studied into connected writing.

You are given the brief they saw and a list of REQUIRED ELEMENTS, each with an id. Rules:
1. Judge each required element INDEPENDENTLY:
   - "used": true if they attempted it at all, even incorrectly.
   - "correct": true only if the usage is actually correct.
   - "evidence": the exact substring from their writing that shows it, or null if absent.
   Never mark an element used without evidence you can quote.
2. "combined": true if the sentences hang together as writing about one thing. Separate sentences are fine; four unrelated fragments each containing one pattern are not.
3. Then check the whole composition for other errors, using the same three types as the practice grader:
   - "fix" — grammatically wrong.
   - "unnatural" — correct but not how a native speaker would put it.
   - "note" — neither wrong nor unnatural; a growth opportunity, e.g. kana where the kanji is standard at their level.
   Do NOT invent errors. Kana-for-kanji is always a "note", never a "fix".
   "note" IS NOT A BUCKET FOR MARGINAL OBSERVATIONS. Emit one only when the learner would actually do something differently next time; if it would not change what they write, omit it. Zero notes is the correct output for good writing. This matters more here than in single-sentence practice: four sentences give four times the surface to over-annotate, and a composition handed back covered in yellow reads as failure even when every note is individually fair. One or two across the whole composition is a ceiling, not a target.
4. Watch for classic English-speaker issues: 私 repeated in every sentence, あなた, が vs を traps (好き, 上手, ほしい, わかる, potential forms), transitive/intransitive mix-ups, and politeness drifting between sentences — that last one is especially common in multi-sentence writing and worth flagging as a "fix" when it happens.
5. Explanations are plain English for a beginner. Preserve the writer's intended meaning.
6. In "rewrite" ONLY, write every word containing kanji as 【word|reading】, e.g. 【昨日|きのう】【学校|がっこう】へ【行|い】きました. NEVER use that format in "evidence", "note", "feedback", "span", "correction", or "explanation".
Respond with ONLY valid JSON, no fences:
{"elements":[{"id":"<the id given to you>","used":true|false,"correct":true|false,"evidence":"<exact substring or null>","note":"<one short sentence in English>"}],"combined":true|false,"feedback":"<2-3 sentences on the composition as a whole>","issues":[{"type":"fix"|"unnatural"|"note","span":"<exact substring>","correction":"<fixed substring>","explanation":"<1-2 sentences>"}],"score":<1-5 naturalness>,"rewrite":"<the whole composition rewritten naturally, keeping every required element, changing as little as possible>"}`;

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

// ————— Walkthrough (Session 14) —————
// The staged Learn flow for points with DEEP[id].seg: the idea → the first
// example taken apart element by element → the pattern sighted again in the
// remaining examples → the wrinkles → a handoff into the drill and free
// writing. Paged, not scrolled — same mobile-first call as the kana Learn
// pager (Session 13). Progress gains a `walked` flag; nothing is gated on it.
function Walkthrough({ point, deep, progress, onProgress, mode, onTapWord, goTab }) {
  const exp = typeof point.exp === "object" ? point.exp : { what: point.exp };
  const wr = deep.wr || [];
  const pages = [
    "idea", "apart",
    ...(point.ex.length > 1 ? ["again"] : []),
    ...(exp.watch || wr.length ? ["watch"] : []),
    "try",
  ];
  const [pi, setPi] = useState(0);
  const page = pages[pi];

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
          {wr.map((w, i) => (
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
        <button className="btn-ghost" style={{ visibility: pi > 0 ? "visible" : "hidden", padding: "10px 18px" }} onClick={() => setPi((v) => Math.max(0, v - 1))}>
          ← Back
        </button>
        <div style={{ flex: 1, display: "flex", justifyContent: "center", gap: 6 }}>
          {pages.map((p, i) => (
            <button key={p} onClick={() => setPi(i)} aria-label={`page ${i + 1}`} style={{
              width: 8, height: 8, borderRadius: 999, border: "none", cursor: "pointer", padding: 0,
              background: i === pi ? T.ink : T.hairline,
            }} />
          ))}
        </div>
        <button className="btn-primary" style={{ visibility: pi < pages.length - 1 ? "visible" : "hidden", padding: "10px 18px" }} onClick={() => setPi((v) => Math.min(pages.length - 1, v + 1))}>
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
  const s2ids = new Set(((LEVELS.find((l) => l.id === "S2") || {}).groups || []).flatMap((g) => g.points.map((p) => p.id)));
  const s2live = pool.some((pt) => s2ids.has(pt.id));
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
