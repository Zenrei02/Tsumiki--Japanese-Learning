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
          watch: "Same building, either particle, depending on the verb. 図書館で勉強します and 図書館に本があります are both correct — the place didn't change, the verb did.",
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
    bank: [["学校", "school"], ["駅", "station"], ["友達", "friend"], ["電車", "train"], ["映画", "movie"], ["公園", "park"], ["朝ごはん", "breakfast"], ["図書館", "library"]],
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
        id: "sb-pronouns", jp: "私・あなたを省く", en: "when to drop pronouns", kind: "skill",
        exp: {
          what: "English requires a subject in every clause. Japanese doesn't — and leaves it out whenever context makes it obvious. Sentences with no visible subject at all are the norm, not an abbreviation.",
          build: "Just delete it. If it's clear who you're talking about, the sentence is finished without a pronoun.",
          when: "Keep 私 only for genuine contrast, or when introducing yourself as a new topic. For other people, use their name plus さん — 田中さんは — which is what あなた's job actually is.",
          watch: "Repeating 私 in every sentence is the single loudest marker of an English-speaking learner. And あなた toward someone whose name you know can read as cold or even confrontational, despite every textbook glossing it as \"you.\"",
        },
        ex: [["昨日映画を見ました。とても面白かったです。", "No 私 anywhere — and completely natural."], ["私は行きますが、妹は行きません。", "私 kept on purpose: contrast."], ["田中さんは今日も忙しいですか。", "Their name, not あなた."]],
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
          what: "Every Japanese verb belongs to one of two families, and the family decides how every single form is built. Learn a verb's family once and you never have to think about it again. Textbooks call them godan and ichidan — from here we'll just say Go and Ichi.",
          build: "Ichi verbs drop る and add the ending: 食べる → 食べます. Go verbs shift their final sound to the i-row first: 飲む → 飲みます, 行く → 行きます, 買う → 買います.",
          when: "Sorting them: if a verb doesn't end in る, it's Go, guaranteed. If it ends in る, look at the vowel before it — える or いる usually means Ichi (食べる, 見る), while ある, うる, おる means Go (作る, 乗る).",
          watch: "A handful of verbs end in いる or える and are Go anyway: 帰る, 入る, 走る, 切る, 知る. They're common enough that it's worth learning these five as a set now rather than being surprised by 帰ります later.",
        },
        ex: [["食べる → 食べます", "Ichi: drop る, add ます."], ["飲む → 飲みます", "Go: む → み, add ます."], ["帰る → 帰ります", "Looks Ichi, behaves Go."]],
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
          watch: "This is the error the checker flags hardest, because there is nothing in English to warn you. 窓を閉まりました is wrong twice: 閉まる is the intransitive verb so it cannot take を, and a person closing something needs 閉めました. Useful self-check — if you find を sitting in front of an intransitive verb, one of the two is wrong.",
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
      { id: "rc1", jp: "復習 · Steps 1–3", en: "checkpoint: basics, particles & tense", kind: "review", covers: ["desu", "ka", "wa", "ga", "o", "ni-time", "de-place", "mo", "no", "masu", "mashita", "teiru", "mada"], exp: "Mixed review of everything so far: the copula, core particles, and polite tense. The quiz pulls from all of it. In practice, try combining at least two patterns in one sentence.", ex: [] },
    ],
  },
  {
    cat: "Step 5 · Requests, permission & obligation",
    bank: [["待つ", "to wait"], ["座る", "to sit"], ["写真を撮る", "to take a photo"], ["薬を飲む", "to take medicine"], ["帰る", "to go home"], ["入る", "to enter"], ["使う", "to use"], ["急ぐ", "to hurry"]],
    points: [
      { id: "tekudasai", jp: "〜てください", en: "please do", exp: "Polite request using the te-form.", ex: [["ちょっと待ってください。", "Please wait a moment."], ["ゆっくり話してください。", "Please speak slowly."]] },
      { id: "naidekudasai", jp: "〜ないでください", en: "please don't", exp: "Polite negative request.", ex: [["ここで写真を撮らないでください。", "Please don't take photos here."], ["心配しないでください。", "Please don't worry."]] },
      { id: "temoii", jp: "〜てもいいです", en: "may / it's okay to", exp: "Grants or asks permission.", ex: [["ここに座ってもいいですか。", "May I sit here?"], ["帰ってもいいですよ。", "You may go home."]] },
      { id: "tewaikemasen", jp: "〜てはいけません", en: "must not", exp: "Prohibition — something is not allowed.", ex: [["ここでたばこを吸ってはいけません。", "You must not smoke here."], ["授業中に寝てはいけません。", "You must not sleep in class."]] },
      { id: "nakereba", jp: "〜なければなりません", en: "must / have to", exp: "Obligation — something is necessary.", ex: [["毎日薬を飲まなければなりません。", "I have to take medicine every day."], ["明日早く起きなければなりません。", "I must get up early tomorrow."]] },
      { id: "nakutemoii", jp: "〜なくてもいいです", en: "don't have to", exp: "The action is not necessary.", ex: [["明日は来なくてもいいです。", "You don't have to come tomorrow."], ["急がなくてもいいですよ。", "You don't have to hurry."]] },
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
      { id: "mashou", jp: "〜ましょう", en: "let's", exp: "Suggests doing something together.", ex: [["一緒に帰りましょう。", "Let's go home together."], ["昼ごはんを食べましょう。", "Let's eat lunch."]] },
      { id: "mashouka", jp: "〜ましょうか", en: "shall I / shall we?", exp: "Offers help or suggests an action as a question.", ex: [["手伝いましょうか。", "Shall I help you?"], ["窓を開けましょうか。", "Shall I open the window?"]] },
      { id: "masenka", jp: "〜ませんか", en: "won't you ...? (invitation)", exp: "Polite invitation, softer than ましょう.", ex: [["一緒に映画を見ませんか。", "Won't you watch a movie with me?"], ["お茶を飲みませんか。", "Won't you have some tea?"]] },
      { id: "tai", jp: "〜たいです", en: "want to do", exp: "Expresses the speaker's own desire to do something. The object often takes が.", ex: [["日本へ行きたいです。", "I want to go to Japan."], ["水が飲みたいです。", "I want to drink water."]] },
      { id: "hoshii", jp: "〜がほしいです", en: "want (a thing)", exp: "Expresses wanting an object (not an action). The thing wanted takes が.", ex: [["新しいかばんがほしいです。", "I want a new bag."], ["時間がほしいです。", "I want time."]] },
      { id: "tsumori", jp: "〜つもりです", en: "intend to", exp: "States a plan or intention, with the dictionary form.", ex: [["夏に国へ帰るつもりです。", "I intend to return to my country in summer."], ["車を買うつもりです。", "I plan to buy a car."]] },
      { id: "niiku", jp: "〜に行きます", en: "go (somewhere) to do", exp: "Verb stem + に + motion verb: moving somewhere for a purpose.", ex: [["デパートへ買い物に行きます。", "I go to the department store to shop."], ["友達に会いに行きました。", "I went to meet a friend."]] },
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
      { id: "tekara", jp: "〜てから", en: "after doing", exp: "Do A, then B — with the te-form.", ex: [["手を洗ってから食べます。", "I eat after washing my hands."], ["仕事が終わってから飲みに行きました。", "After work ended, I went drinking."]] },
      { id: "atode", jp: "〜たあとで", en: "after ...", exp: "After A (past-tense verb or noun+の), B happens.", ex: [["ごはんを食べたあとで散歩します。", "I take a walk after eating."], ["授業のあとで図書館へ行きます。", "After class I go to the library."]] },
      { id: "maeni", jp: "〜まえに", en: "before ...", exp: "Before A (dictionary form or noun+の), B happens.", ex: [["寝るまえに歯をみがきます。", "I brush my teeth before sleeping."], ["食事のまえに手を洗います。", "I wash my hands before meals."]] },
      { id: "nagara", jp: "〜ながら", en: "while doing", exp: "Two actions by the same person at the same time; the main action comes second.", ex: [["音楽を聞きながら勉強します。", "I study while listening to music."], ["歩きながら話しましょう。", "Let's talk while walking."]] },
      { id: "taritari", jp: "〜たり〜たりします", en: "do things like A and B", exp: "Lists representative activities, implying there are others.", ex: [["週末は本を読んだり、映画を見たりします。", "On weekends I read books, watch movies, and so on."], ["日曜日は掃除したり、洗濯したりしました。", "On Sunday I cleaned, did laundry, and such."]] },
      { id: "kata", jp: "〜かた", en: "how to ...", exp: "Verb stem + 方: the way or method of doing something.", ex: [["漢字の読み方を教えてください。", "Please teach me how to read this kanji."], ["この機械の使い方がわかりません。", "I don't know how to use this machine."]] },
      { id: "toki", jp: "〜とき", en: "when ...", exp: "'At the time of A' — A can be a verb, adjective, or noun+の.", ex: [["ひまなとき、音楽を聞きます。", "When I'm free, I listen to music."], ["日本に来たとき、驚きました。", "When I came to Japan, I was surprised."]] },
      { id: "deshou", jp: "〜でしょう", en: "probably", exp: "Expresses probability or conjecture; also used in weather forecasts.", ex: [["明日は晴れるでしょう。", "It will probably be sunny tomorrow."], ["彼は来ないでしょう。", "He probably won't come."]] },
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
      { id: "rc2", jp: "復習 · Steps 4–6", en: "checkpoint: requests, desire & linking", kind: "review", covers: ["tekudasai", "temoii", "tewaikemasen", "nakereba", "mashou", "masenka", "tai", "hoshii", "tsumori", "tekara", "maeni", "nagara", "taritari", "toki"], exp: "Mixed review of requests, permission, obligation, invitations, desire, and linking actions in time. In practice, combine at least two patterns in one sentence.", ex: [] },
    ],
  },
  {
    cat: "Step 8 · Existence & possession",
    bank: [["机", "desk"], ["いす", "chair"], ["猫", "cat"], ["子ども", "child"], ["銀行", "bank"], ["前", "front"], ["下", "under"], ["部屋", "room"]],
    points: [
      { id: "arimasu", jp: "あります / います", en: "there is / exists", exp: "あります for inanimate things; います for people and animals.", ex: [["机の上に本があります。", "There is a book on the desk."], ["公園に子どもがいます。", "There are children in the park."]] },
      { id: "motteiru", jp: "〜を持っています", en: "have / own", exp: "Possession of objects, using 持つ in the ています form.", ex: [["車を持っています。", "I have a car."], ["ペンを持っていますか。", "Do you have a pen?"]] },
      { id: "location", jp: "〜は〜にあります / います", en: "X is (located) at Y", exp: "States where something or someone is.", ex: [["銀行は駅の前にあります。", "The bank is in front of the station."], ["猫はいすの下にいます。", "The cat is under the chair."]] },
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
      { id: "iadj", jp: "い形容詞 (i-adjectives)", en: "i-adjective conjugation", exp: "い-adjectives conjugate: 高い → 高くない (neg), 高かった (past), 高くなかった (past neg).", ex: [["この店は高くないです。", "This shop is not expensive."], ["昨日は寒かったです。", "It was cold yesterday."]] },
      { id: "naadj", jp: "な形容詞 (na-adjectives)", en: "na-adjective usage", exp: "な-adjectives take な before nouns and conjugate with です/じゃない/でした.", ex: [["静かな町です。", "It's a quiet town."], ["この問題は簡単じゃないです。", "This problem is not easy."]] },
      { id: "kute", jp: "〜くて / 〜で (connecting)", en: "and (adjectives)", exp: "Connects adjectives: い-adj → 〜くて; na-adj/noun → 〜で.", ex: [["この部屋は広くて明るいです。", "This room is spacious and bright."], ["彼は親切で優しいです。", "He is kind and gentle."]] },
      { id: "narimasu", jp: "〜くなります / 〜になります", en: "become", exp: "Change of state: い-adj → 〜くなる; na-adj/noun → 〜になる.", ex: [["天気がよくなりました。", "The weather got better."], ["兄は医者になりました。", "My brother became a doctor."]] },
      { id: "shimasu-change", jp: "〜くします / 〜にします", en: "make (something) ...", exp: "Someone changes a thing's state: い-adj → 〜くする; na-adj/noun → 〜にする.", ex: [["部屋を暖かくしてください。", "Please make the room warm."], ["音を静かにしました。", "I made the sound quiet."]] },
      { id: "nisuru", jp: "〜にします", en: "decide on", exp: "Choosing or deciding on something, e.g. when ordering.", ex: [["私はコーヒーにします。", "I'll have coffee."], ["赤いのにします。", "I'll go with the red one."]] },
      { id: "amari", jp: "あまり〜ない", en: "not very", exp: "'Not much / not very', always with a negative.", ex: [["あまり高くないです。", "It's not very expensive."], ["あまりテレビを見ません。", "I don't watch TV much."]] },
      { id: "zenzen", jp: "ぜんぜん〜ない", en: "not at all", exp: "'Not at all', with a negative.", ex: [["ぜんぜんわかりません。", "I don't understand at all."], ["お金がぜんぜんありません。", "I have no money at all."]] },
      { id: "totemo", jp: "とても / ちょっと", en: "very / a little", exp: "Degree adverbs placed before adjectives or verbs.", ex: [["この映画はとても面白いです。", "This movie is very interesting."], ["ちょっと疲れました。", "I'm a little tired."]] },
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
      { id: "hou", jp: "〜より〜のほうが", en: "B more than A", exp: "'Compared to A, B is more X.' The preferred item takes のほうが.", ex: [["電車よりバスのほうが安いです。", "The bus is cheaper than the train."], ["夏より冬のほうが好きです。", "I like winter more than summer."]] },
      { id: "ichiban", jp: "〜のなかで〜がいちばん", en: "the most (superlative)", exp: "Within a group, X is the most Y.", ex: [["果物のなかでりんごがいちばん好きです。", "Among fruits, I like apples the most."], ["クラスのなかで田中さんがいちばん背が高いです。", "Tanaka-san is the tallest in the class."]] },
      { id: "suki", jp: "〜が好きです / きらいです", en: "like / dislike", exp: "The liked thing takes が (a classic が-not-を pattern).", ex: [["音楽が好きです。", "I like music."], ["野菜がきらいです。", "I dislike vegetables."]] },
      { id: "jouzu", jp: "〜が上手です / 下手です", en: "good at / bad at", exp: "Skill at something; the skill takes が. 上手 is not used about yourself — prefer 得意.", ex: [["妹はピアノが上手です。", "My sister is good at piano."], ["私は歌が下手です。", "I'm bad at singing."]] },
      { id: "wakaru", jp: "〜がわかります", en: "understand", exp: "わかる takes が for the thing understood, not を.", ex: [["日本語が少しわかります。", "I understand a little Japanese."], ["意味がわかりません。", "I don't understand the meaning."]] },
      { id: "nogasuki", jp: "〜のが好きです", en: "like doing", exp: "の turns a verb into a noun so you can like/dislike an activity.", ex: [["本を読むのが好きです。", "I like reading books."], ["料理を作るのが好きです。", "I like cooking."]] },
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
      { id: "kara-because", jp: "〜から (because)", en: "because / so", exp: "Reason + から + result. Also answers なぜ/どうして questions.", ex: [["暑いから、窓を開けました。", "Because it's hot, I opened the window."], ["時間がないから、急ぎましょう。", "We have no time, so let's hurry."]] },
      { id: "node", jp: "〜ので", en: "because (softer)", exp: "Like から but softer and more objective; common in polite explanations.", ex: [["頭が痛いので、帰ります。", "I'm going home because I have a headache."], ["雨なので、家にいます。", "Since it's raining, I'll stay home."]] },
      { id: "ga-but", jp: "〜が / けど (but)", en: "but / although", exp: "Connects two contrasting clauses. けど is casual; が is neutral-polite.", ex: [["高いですが、おいしいです。", "It's expensive, but delicious."], ["行きたいけど、時間がありません。", "I want to go, but I have no time."]] },
      { id: "demo", jp: "でも / そして / それから", en: "but / and / and then", exp: "Sentence-starting connectors: でも (but), そして (and), それから (and then).", ex: [["雨でした。でも、出かけました。", "It was raining. But I went out."], ["朝ごはんを食べました。それから、学校へ行きました。", "I ate breakfast. Then I went to school."]] },
      { id: "toiu", jp: "〜という", en: "called / named", exp: "Introduces a name the listener may not know.", ex: [["「花」という映画を見ました。", "I watched a movie called 'Hana'."], ["ポチという犬を飼っています。", "I have a dog named Pochi."]] },
      { id: "doushite", jp: "どうして / なぜ〜からです", en: "why? ... because", exp: "Ask a reason with どうして/なぜ; answer with 〜からです.", ex: [["どうして遅れましたか。", "Why were you late?"], ["電車が止まったからです。", "Because the train stopped."]] },
      { id: "nanika", jp: "何か / どこか / だれか", en: "something / somewhere / someone", exp: "Question word + か makes an indefinite: something, somewhere, someone.", ex: [["何か食べたいです。", "I want to eat something."], ["どこかへ行きましょう。", "Let's go somewhere."]] },
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
          watch: "〜と cannot be followed by a request, an invitation, or anything expressing your will — 東京に行くと、電話してください is wrong, because 〜と describes automatic consequences and a request is not automatic. Use 〜たら. Note also that 〜たら is built from the た-form, which means every sound change you learned in Step 4 is working for you here.",
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
      { id: "rc3", jp: "復習 · Stage 1", en: "checkpoint: the full stage", kind: "review", covers: ["arimasu", "location", "ageru", "iadj", "naadj", "kute", "narimasu", "amari", "hou", "ichiban", "suki", "potential", "wakaru", "nogasuki", "kara-because", "node", "ga-but", "toiu", "sb-pronouns", "sb-waga", "sb-ganotwo", "sb-transitive", "sb-orthography", "sb-omou"], exp: "The full Stage 1 review — existence, adjectives, comparisons, and connectors, plus the skill-builder judgments (pronouns, は/が, が-not-を). Write like you mean it.", ex: [] },
    ],
  },
  {
    cat: "Stress test — first N4 lesson",
    level: "N4",
    bank: [["全部", "all"], ["忘れる", "to forget"], ["かさ", "umbrella"], ["財布", "wallet"], ["落とす", "to drop"], ["最後まで", "to the end"]],
    points: [
      { id: "teshimau", jp: "〜てしまう", en: "completely / regrettably do", n4: true, exp: "N4: expresses completion ('finished entirely') or an unintended, regrettable result. Casual contractions: 〜ちゃう / 〜じゃう.", ex: [["宿題を全部やってしまいました。", "I finished all my homework."], ["電車の中でかさを忘れてしまいました。", "I (regrettably) forgot my umbrella on the train."]] },
    ],
  },
];

const ALL_POINTS = CURRICULUM.flatMap((c) => c.points.map((p) => ({ ...p, cat: c.cat })));

const LEVELS = [
  { id: "S1", title: "1", subtitle: "Foundations", jlpt: "≈ JLPT N5", markers: "en", tagline: "First sentences to full daily basics — grammar, skill builders, culture stops, and checkpoints along the way.", groups: CURRICULUM.filter((c) => !c.level) },
  { id: "S2", title: "2", subtitle: "Everyday fluency", jlpt: "≈ JLPT N4", markers: "kana", tagline: "One stress-test lesson so far. Full curriculum coming after Stage 1 validation.", groups: CURRICULUM.filter((c) => c.level === "N4") },
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
  const gradingMsg = useRotating(GRADING_MESSAGES, loading);

  const grade = async () => {
    const input = text.trim();
    if (!input || loading) return;
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
          {loading ? "Grading…" : "Grade my sentence"}
        </button>
        {loading && (
          <span style={{ fontSize: 13, color: T.sub, fontStyle: "italic" }} aria-live="polite">
            {gradingMsg}
          </span>
        )}
      </div>
      {err && <p style={{ color: T.shu, fontSize: 14 }}>{err}</p>}
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
  const msg = useRotating(BUILD_MESSAGES, loading);
  const required = (point.requires || []).map((id) => ALL_POINTS.find((x) => x.id === id)).filter(Boolean);

  const grade = async () => {
    const input = text.trim();
    if (!input || loading) return;
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
          {loading ? "Reading…" : "Check my sentences"}
        </button>
        {loading && (
          <span style={{ fontSize: 13, color: T.sub, fontStyle: "italic" }} aria-live="polite">{msg}</span>
        )}
        <span style={{ fontSize: 12, color: T.sub, marginLeft: "auto" }}>{text.length}/400</span>
      </div>
      {err && <p style={{ color: T.shu, fontSize: 14 }}>{err}</p>}

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

function Module({ point, progress, onProgress, onBack, mode, onTapWord, script = "en" }) {
  const [tab, setTab] = useState("learn");
  const p = progress[point.id] || {};
  const kind = KINDS[point.kind || "grammar"];
  const group = CURRICULUM.find((g) => g.points.some((x) => x.id === point.id));
  const bank = (group && group.bank) || [];
  const tabs =
    point.kind === "primer" ? [["learn", "Learn"]]
    : point.kind === "build" ? [["learn", "Learn"], ["build", "Write"]]
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
        {point.n4 && <Chip color={T.ai}>Stage 2 stress test</Chip>}
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
            {id === "practice" && p.practiced ? ` · ${p.practiced}` : ""}
            {id === "build" && p.bestElements != null ? ` · ${p.bestElements}/${p.elementTotal}` : ""}
          </button>
        ))}
      </div>
      <div style={{ background: T.sheet, border: `1px solid ${T.hairline}`, borderRadius: 8, padding: 20 }}>
        {tab === "learn" && (
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
                : "Ready? Take the quiz, then write your own sentence in Practice."}
            </p>
          </div>
        )}
        {tab === "quiz" && <Quiz point={point} progress={progress} onProgress={onProgress} mode={mode} onTapWord={onTapWord} />}
        {tab === "practice" && <Practice point={point} bank={bank} progress={progress} onProgress={onProgress} mode={mode} onTapWord={onTapWord} />}
        {tab === "build" && <Build point={point} bank={bank} progress={progress} onProgress={onProgress} mode={mode} onTapWord={onTapWord} />}
      </div>
    </div>
  );
}

export default function GrammarPractice() {
  const [progress, setProgress] = useState({});
  const [kanjiMode, setKanjiMode] = useState("kanji");
  const [popup, setPopup] = useState(null);
  const [levelId, setLevelId] = useState(null);
  const [current, setCurrent] = useState(null);
  const [query, setQuery] = useState("");
  const [openCats, setOpenCats] = useState(null); // null → fall back to first unfinished step
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
  }, []);

  const setMode = (m) => {
    setKanjiMode(m);
    try { window.storage.set("kanji-mode", m); } catch {}
  };

  const updateProgress = (p) => {
    setProgress(p);
    if (loaded.current) saveProgress(p);
  };

  const isDone = (pt) => {
    const pr = progress[pt.id];
    if (!pr) return false;
    if (pt.kind === "primer") return !!pr.read;
    if (pt.kind === "build") return !!pr.built;
    return pr.quizBest != null && !!pr.practiced;
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

        {point ? (
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
