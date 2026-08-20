// GENERATED from kanji-module.jsx by build-vite-app.py — do not hand-edit.
// Edit the source module and re-run. The single-file artifact stays the
// source of truth so the reviewer's grading path keeps working.
import { useEffect, useRef, useState } from "react";
import { installStorage } from "../lib/storage.js";
import { T } from "../lib/tokens.js";
import { StrokeView, StrokePractice } from "../lib/strokeEngine.jsx";
import { loadJSON, saveJSON } from "../lib/json.js";
import "../data/strokes-kanji.js";
installStorage();

// ————— Design tokens (same family as the checker, grammar and kana modules) —————


// ————— Stroke data —————
// KanjiVG (Ulrich Apel), CC BY-SA 3.0 — http://kanjivg.tagaini.net
// Same 109-unit box as the kana modules, so the tracing engine and the
// calibration floor carry straight over.



// Depth-1 component decomposition, also from KanjiVG. `orig` records the parent
// form of a variant (亻 → 人), which is what a learner actually needs told.
// Structural, not pedagogical: KanjiVG reports 白 as containing 日, which is true
// of the shape and misleading about the meaning. Where that matters the lesson's
// own note overrides it.
const PARTS = {"一":[],"二":[],"三":[{"e":"一"}],"川":[],"十":[],"七":[{"e":"一"},{"e":"乙"}],"土":[],"小":[],"水":[],"日":[],"月":[],"田":[],"目":[],"口":[],"四":[{"e":"囗"},{"e":"儿","orig":"八"}],"国":[{"e":"囗"},{"e":"玉"}],"人":[],"入":[],"八":[],"大":[],"中":[{"e":"口"},{"e":"丨"}],"車":[],"女":[],"子":[],"母":[{"e":"毋"}],"本":[{"e":"木"}],"木":[],"火":[],"山":[],"上":[{"e":"卜"},{"e":"一"}],"下":[{"e":"一"},{"e":"卜"}],"力":[],"男":[{"e":"田"},{"e":"力"}],"休":[{"e":"亻","orig":"人"},{"e":"木"}],"林":[{"e":"木"}],"森":[{"e":"木"},{"e":"林"}],"好":[{"e":"女"},{"e":"子"}],"明":[{"e":"日"},{"e":"月"}],"町":[{"e":"田"},{"e":"丁"}],"白":[{"e":"日"}],"百":[{"e":"一"},{"e":"白"}],"千":[{"e":"丿"},{"e":"十"}],"円":[{"e":"冂"}],"手":[],"生":[],"先":[{"e":"儿","orig":"八"}],"学":[{"e":"子"}],"校":[{"e":"木"},{"e":"交"}],"年":[{"e":"丿"},{"e":"干"}],"今":[{"e":"人"}],"分":[{"e":"八"},{"e":"刀"}],"見":[{"e":"目"},{"e":"儿"}],"行":[{"e":"彳"}],"来":[{"e":"米"}],"食":[],"気":[{"e":"气"},{"e":"乂"}],"天":[{"e":"一"},{"e":"大"}],"雨":[],"私":[{"e":"禾"},{"e":"厶"}],"何":[{"e":"亻","orig":"人"},{"e":"可"}],"時":[{"e":"日"},{"e":"寺"}],"間":[{"e":"門"},{"e":"日"}],"言":[],"話":[{"e":"言"},{"e":"舌"}],"五":[],"六":[{"e":"八"}],"九":[],"会":[{"e":"人"},{"e":"云"}],"電":[{"e":"雨"},{"e":"田"}],"開":[{"e":"門"},{"e":"开"}],"買":[{"e":"罒"},{"e":"貝"}],"作":[{"e":"亻","orig":"人"},{"e":"乍"}],"文":[],"使":[{"e":"亻","orig":"人"},{"e":"吏"}],"書":[{"e":"聿"},{"e":"日"}],"朝":[{"e":"十"},{"e":"日"},{"e":"月"}],"起":[{"e":"走"},{"e":"己"}],"帰":[{"e":"刂"},{"e":"帚"}],"週":[{"e":"辶"},{"e":"周"}],"毎":[{"e":"母"}],"曜":[{"e":"日"},{"e":"羽"},{"e":"隹"}],"名":[{"e":"夕"},{"e":"口"}],"前":[{"e":"月"},{"e":"刂"}],"語":[{"e":"言"},{"e":"五"},{"e":"口"}],"高":[{"e":"口"},{"e":"冂"}],"安":[{"e":"宀"},{"e":"女"}],"新":[{"e":"木"},{"e":"斤"}],"広":[{"e":"广"},{"e":"厶"}],"思":[{"e":"田"},{"e":"心"}],"待":[{"e":"彳"},{"e":"寺"}],"始":[{"e":"女"},{"e":"台"}],"終":[{"e":"糸"},{"e":"冬"}],"飲":[{"e":"飠","orig":"食"},{"e":"欠"}],"茶":[{"e":"艹"},{"e":"木"}],"歩":[{"e":"止"},{"e":"少"}],"聞":[{"e":"門"},{"e":"耳"}],"物":[{"e":"牜","orig":"牛"},{"e":"勿"}],"写":[{"e":"冖"},{"e":"与"}],"真":[{"e":"十"},{"e":"目"}],"勉":[{"e":"免"},{"e":"力"}],"強":[{"e":"弓"},{"e":"虫"}],"意":[{"e":"音"},{"e":"心"}],"味":[{"e":"口"},{"e":"未"}],"寒":[{"e":"宀"}],"暑":[{"e":"日"},{"e":"者"}],"忙":[{"e":"忄","orig":"心"},{"e":"亡"}],"痛":[{"e":"疒"},{"e":"甬"}],"寝":[{"e":"宀"},{"e":"爿"}],"洗":[{"e":"氵","orig":"水"},{"e":"先"}],"歯":[{"e":"止"},{"e":"米"}],"散":[{"e":"月"},{"e":"攵"}],"友":[{"e": "又"}],"達":[{"e": "辶"}, {"e": "土"}, {"e": "羊"}],"昨":[{"e": "日"}, {"e": "乍"}],"夏":[{"e": "自"}, {"e": "夂"}],"音":[{"e": "立"}, {"e": "日"}],"楽":[{"e": "白"}, {"e": "木"}],"果":[{"e": "田"}, {"e": "木"}],"机":[{"e": "木"}, {"e": "几"}],"映":[{"e": "日"}, {"e": "央"}],"画":[{"e": "一"}, {"e": "田"}, {"e": "凵"}],"部":[{"e": "⻏"}],"屋":[{"e": "尸"}, {"e": "至"}],"問":[{"e": "門"}, {"e": "口"}],"宿":[{"e": "宀"}, {"e": "亻", "orig": "人"}, {"e": "百"}],"題":[{"e": "是"}, {"e": "頁"}],"図":[{"e": "囗"}],"館":[{"e": "飠", "orig": "食"}, {"e": "官"}]};

// ————— Kanji ——————
// m=meaning, on/kun=readings, story=the hook, w=words, look=confusables
const K = {
  "一": { m: "one", on: "イチ", kun: "ひと(つ)", w: [["一つ","ひとつ","one thing"],["一人","ひとり","one person; alone"]] },
  "二": { m: "two", on: "ニ", kun: "ふた(つ)", w: [["二つ","ふたつ","two things"]] },
  "三": { m: "three", on: "サン", kun: "みっ(つ)", w: [["三時","さんじ","three o'clock"]] },
  "十": { m: "ten", on: "ジュウ", kun: "とお", w: [["十日","とおか","the 10th"]] },
  "七": { m: "seven", on: "シチ", kun: "なな", w: [["七時","しちじ","seven o'clock"]] },
  "川": { m: "river", on: "セン", kun: "かわ", w: [["川","かわ","river"]] },
  "土": { m: "earth; soil", on: "ド", kun: "つち", look: ["士"], w: [["土曜日","どようび","Saturday"]] },
  "小": { m: "small", on: "ショウ", kun: "ちい(さい)", w: [["小さい","ちいさい","small"]] },
  "水": { m: "water", on: "スイ", kun: "みず", w: [["水","みず","water"],["水曜日","すいようび","Wednesday"]] },
  "日": { m: "sun; day", on: "ニチ", kun: "ひ・か", look: ["目","白"], w: [["日本","にほん","Japan"],["毎日","まいにち","every day"]] },
  "月": { m: "moon; month", on: "ゲツ", kun: "つき", w: [["月曜日","げつようび","Monday"]] },
  "田": { m: "rice field", on: "デン", kun: "た", w: [["田中","たなか","Tanaka (name)"]] },
  "目": { m: "eye", on: "モク", kun: "め", look: ["日","白"], w: [["目","め","eye"]] },
  "口": { m: "mouth", on: "コウ", kun: "くち", w: [["口","くち","mouth"]] },
  "四": { m: "four", on: "シ", kun: "よん・よっ(つ)", w: [["四つ","よっつ","four things"]] },
  "国": { m: "country", on: "コク", kun: "くに", story: "A jewel 玉 kept inside a border 囗.", w: [["国","くに","country"]] },
  "人": { m: "person", on: "ジン・ニン", kun: "ひと", look: ["入","八"], w: [["日本人","にほんじん","Japanese person"]] },
  "入": { m: "enter", on: "ニュウ", kun: "はい(る)", look: ["人","八"], w: [["入る","はいる","to enter"]] },
  "八": { m: "eight", on: "ハチ", kun: "や(っつ)", look: ["人","入"], w: [["八つ","やっつ","eight things"]] },
  "大": { m: "big", on: "ダイ・タイ", kun: "おお(きい)", look: ["犬","太"], w: [["大きい","おおきい","big"]] },
  "中": { m: "middle; inside", on: "チュウ", kun: "なか", story: "A line driven through the middle of a box.", w: [["中","なか","inside"]] },
  "車": { m: "car; wheel", on: "シャ", kun: "くるま", look: ["東"], w: [["車","くるま","car"],["電車","でんしゃ","train"]] },
  "女": { m: "woman", on: "ジョ", kun: "おんな", w: [["女の人","おんなのひと","woman"]] },
  "子": { m: "child", on: "シ", kun: "こ", w: [["子ども","こども","child"]] },
  "母": { m: "mother", on: "ボ", kun: "はは", w: [["母","はは","my mother"]] },
  "山": { m: "mountain", on: "サン", kun: "やま", w: [["山","やま","mountain"]] },
  "力": { m: "power", on: "リョク・リキ", kun: "ちから", w: [["力","ちから","strength"]] },
  "手": { m: "hand", on: "シュ", kun: "て", w: [["手","て","hand"],["上手","じょうず","good at"]] },
  "生": { m: "life; birth", on: "セイ", kun: "い(きる)・う(まれる)", w: [["学生","がくせい","student"],["先生","せんせい","teacher"]] },
  "木": { m: "tree; wood", on: "モク・ボク", kun: "き", look: ["本","未","末"], w: [["木","き","tree"]] },
  "本": { m: "book; origin", on: "ホン", kun: "もと", story: "A tree 木 with a mark at the root — the origin of the thing.", look: ["木"], w: [["本","ほん","book"],["日本","にほん","Japan"]] },
  "林": { m: "woods", on: "リン", kun: "はやし", story: "Two trees.", w: [["林","はやし","woods"]] },
  "森": { m: "forest", on: "シン", kun: "もり", story: "Three trees. The pattern is doing real work here.", w: [["森","もり","forest"]] },
  "校": { m: "school", on: "コウ", kun: "—", w: [["学校","がっこう","school"]] },
  "火": { m: "fire", on: "カ", kun: "ひ", w: [["火曜日","かようび","Tuesday"]] },
  "上": { m: "above; up", on: "ジョウ", kun: "うえ・あ(げる)", w: [["上","うえ","above"],["上手","じょうず","good at"]] },
  "下": { m: "below; down", on: "カ・ゲ", kun: "した・くだ(さる)", w: [["下","した","below"],["下手","へた","bad at"]] },
  "男": { m: "man", on: "ダン", kun: "おとこ", story: "Power 力 in the rice field 田.", w: [["男の人","おとこのひと","man"]] },
  "休": { m: "rest", on: "キュウ", kun: "やす(む)", story: "A person 亻 leaning against a tree 木.", look: ["体"], sentence: true, w: [["休み","やすみ","holiday; rest"],["休む","やすむ","to rest"]] },
  "好": { m: "like; fond", on: "コウ", kun: "す(き)", story: "A woman 女 and her child 子.", sentence: true, w: [["好き","すき","liked; to like"]] },
  "明": { m: "bright", on: "メイ", kun: "あか(るい)", story: "Sun 日 and moon 月 side by side.", w: [["明日","あした","tomorrow"],["明るい","あかるい","bright"]] },
  "町": { m: "town", on: "チョウ", kun: "まち", story: "Fields 田 on a grid 丁.", w: [["町","まち","town"]] },
  "白": { m: "white", on: "ハク", kun: "しろ(い)", story: "Not a sun — a grain of rice, or a thumbnail, depending which scholar you ask. The shape only looks like 日.", look: ["日","目"], w: [["白い","しろい","white"]] },
  "百": { m: "hundred", on: "ヒャク", kun: "—", story: "One 一 above white 白.", w: [["百円","ひゃくえん","100 yen"]] },
  "千": { m: "thousand", on: "セン", kun: "ち", look: ["干","午"], w: [["千円","せんえん","1000 yen"]] },
  "円": { m: "yen; circle", on: "エン", kun: "まる(い)", w: [["百円","ひゃくえん","100 yen"]] },
  "先": { m: "previous; ahead", on: "セン", kun: "さき", w: [["先生","せんせい","teacher"],["先週","せんしゅう","last week"]] },
  "学": { m: "study; learning", on: "ガク", kun: "まな(ぶ)", look: ["字"], w: [["学生","がくせい","student"],["学校","がっこう","school"]] },
  "年": { m: "year", on: "ネン", kun: "とし", w: [["三年","さんねん","three years"],["今年","ことし","this year"]] },
  "今": { m: "now", on: "コン", kun: "いま", look: ["分"], w: [["今","いま","now"],["今日","きょう","today"]] },
  "分": { m: "minute; divide", on: "ブン・フン", kun: "わ(かる)", story: "A blade 刀 splitting 八 something in two.", look: ["今"], w: [["分かる","わかる","to understand"]] },
  "見": { m: "see; watch", on: "ケン", kun: "み(る)", story: "An eye 目 up on a pair of legs 儿.", sentence: true, w: [["見る","みる","to see"]] },
  "行": { m: "go", on: "コウ", kun: "い(く)", sentence: true, w: [["行く","いく","to go"]] },
  "来": { m: "come", on: "ライ", kun: "く(る)", sentence: true, w: [["来る","くる","to come"],["来週","らいしゅう","next week"]] },
  "食": { m: "eat; food", on: "ショク", kun: "た(べる)", sentence: true, w: [["食べる","たべる","to eat"]] },
  "言": { m: "say; word", on: "ゲン・ゴン", kun: "い(う)・こと", story: "A mouth 口 with lines stacked above it — sound on its way out.", sentence: true, w: [["言う","いう","to say"],["言葉","ことば","word; language"]] },
  "話": { m: "speak; story", on: "ワ", kun: "はな(す)", story: "Words 言 coming off a tongue 舌.", sentence: true, w: [["話す","はなす","to speak"],["電話","でんわ","telephone"]] },
  "気": { m: "spirit; air", on: "キ", kun: "—", w: [["天気","てんき","weather"],["元気","げんき","well"]] },
  "天": { m: "heaven; sky", on: "テン", kun: "あま", story: "A big person 大 with the sky 一 drawn over their head.", w: [["天気","てんき","weather"]] },
  "雨": { m: "rain", on: "ウ", kun: "あめ", w: [["雨","あめ","rain"]] },
  "私": { m: "I; private", on: "シ", kun: "わたし", sentence: true, w: [["私","わたし","I"]] },
  "何": { m: "what", on: "カ", kun: "なに・なん", sentence: true, w: [["何","なに","what"],["何時","なんじ","what time"]] },
  "時": { m: "time; hour", on: "ジ", kun: "とき", story: "The sun 日 at the temple 寺 — how the hour got told.", w: [["時間","じかん","time"],["三時","さんじ","three o'clock"]] },
  "間": { m: "interval; between", on: "カン", kun: "あいだ", story: "Sun 日 showing through a gate 門 — the gap.", w: [["時間","じかん","time"]] },
  "五": { m: "five", on: "ゴ", kun: "いつ(つ)", w: [["五時","ごじ","five o'clock"],["五つ","いつつ","five things"]] },
  "六": { m: "six", on: "ロク", kun: "むっ(つ)", w: [["六時","ろくじ","six o'clock"]] },
  "九": { m: "nine", on: "キュウ・ク", kun: "ここの(つ)", look: ["力"], w: [["九時","くじ","nine o'clock"]] },
  "会": { m: "meet; gathering", on: "カイ", kun: "あ(う)", look: ["今","分"], story: "The spreading lid of 今 and 分 again — this time over 云: people drawn together under one roof.", sentence: true, w: [["会う","あう","to meet"],["会社","かいしゃ","company"]] },
  "電": { m: "electricity", on: "デン", kun: "—", story: "Rain 雨 over a field with a tail of lightning — the character originally meant lightning itself.", w: [["電車","でんしゃ","train"],["電話","でんわ","telephone"],["電気","でんき","electricity; the lights"]] },
  "開": { m: "open", on: "カイ", kun: "あ(ける)・ひら(く)", look: ["間"], story: "The gate from 間 with a different guest — the bar, and the two hands lifting it.", sentence: true, w: [["開ける","あける","to open"]] },
  "買": { m: "buy", on: "バイ", kun: "か(う)", look: ["貝"], story: "A net 罒 coming down over 貝, a shell — shells were early money, and the character has been about shopping ever since.", sentence: true, w: [["買う","かう","to buy"],["買い物","かいもの","shopping"]] },
  "作": { m: "make", on: "サク", kun: "つく(る)", story: "亻 plus a right side carrying sound rather than meaning, the way 何's and 時's do.", sentence: true, w: [["作る","つくる","to make"],["作文","さくぶん","composition"]] },
  "文": { m: "sentence; writing", on: "ブン", kun: "—", w: [["作文","さくぶん","composition"],["文","ぶん","sentence"]] },
  "使": { m: "use", on: "シ", kun: "つか(う)", sentence: true, w: [["使う","つかう","to use"]] },
  "書": { m: "write", on: "ショ", kun: "か(く)", story: "A hand gripping a brush, set down over the page.", sentence: true, w: [["書く","かく","to write"],["図書館","としょかん","library"]] },
  "朝": { m: "morning", on: "チョウ", kun: "あさ", story: "The moon 月 still in the sky while the sun climbs through the grass. Hold it as a picture, not a history.", w: [["朝","あさ","morning"],["朝ごはん","あさごはん","breakfast"],["毎朝","まいあさ","every morning"]] },
  "起": { m: "get up; wake", on: "キ", kun: "お(きる)", story: "走, to run, with 己, the self, tucked into its lap — getting yourself moving.", sentence: true, w: [["起きる","おきる","to get up"]] },
  "帰": { m: "return home", on: "キ", kun: "かえ(る)", story: "The parts — two strokes at the left, a broom shape at the right — do not tell an honest story here. Learn it as a movement.", sentence: true, w: [["帰る","かえる","to go home"]] },
  "週": { m: "week", on: "シュウ", kun: "—", story: "The road 辶 taken all the way around 周 — a circuit that comes back to its start.", w: [["先週","せんしゅう","last week"],["来週","らいしゅう","next week"],["週末","しゅうまつ","weekend"]] },
  "毎": { m: "every", on: "マイ", kun: "—", look: ["母"], story: "母's shape under a slanted top — a structural fact, not a story about mothers.", w: [["毎日","まいにち","every day"],["毎週","まいしゅう","every week"]] },
  "曜": { m: "day of the week", on: "ヨウ", kun: "—", story: "日 beside feathers over a short-tailed bird 隹. It named the seven luminaries — sun, moon, and the five visible planets — which is exactly how Japanese still names its days.", w: [["月曜日","げつようび","Monday"],["何曜日","なんようび","what day of the week"]] },
  "名": { m: "name", on: "メイ", kun: "な", story: "An evening 夕 over a mouth 口 — calling out a name in the dark, when a face can't be seen. The story is old and argued over; the shape is easy either way.", w: [["名前","なまえ","name"]] },
  "前": { m: "before; front", on: "ゼン", kun: "まえ", w: [["名前","なまえ","name"],["前","まえ","front; before"]] },
  "語": { m: "language; word", on: "ゴ", kun: "かた(る)", story: "言 words, 五 five, 口 a mouth — every stroke already yours. Read it as words traded mouth to mouth.", w: [["日本語","にほんご","Japanese (language)"],["英語","えいご","English (language)"]] },
  "高": { m: "tall; expensive", on: "コウ", kun: "たか(い)", story: "Usually told as a tall building or watchtower, storey on storey.", sentence: true, w: [["高い","たかい","tall; expensive"]] },
  "安": { m: "cheap; peaceful", on: "アン", kun: "やす(い)", look: ["好"], story: "女 under a roof 宀. The traditional account is rest and safety — 安 meant peaceful first, and cheap grew out of easy. Hold the story loosely; keep the shape.", sentence: true, w: [["安い","やすい","cheap"]] },
  "新": { m: "new", on: "シン", kun: "あたら(しい)", story: "The right side 斤 is an axe — fresh-cut wood is the usual telling.", sentence: true, w: [["新しい","あたらしい","new"],["新聞","しんぶん","newspaper"]] },
  "広": { m: "wide; spacious", on: "コウ", kun: "ひろ(い)", sentence: true, w: [["広い","ひろい","spacious; wide"]] },
  "思": { m: "think", on: "シ", kun: "おも(う)", story: "A 心 heart under what looks like a field 田 — though the top began as a skull, not a field. In kanji it is the heart, not the head, that does the thinking, and 心 will keep turning up wherever feeling does.", sentence: true, w: [["思う","おもう","to think"]] },
  "待": { m: "wait", on: "タイ", kun: "ま(つ)", look: ["時"], story: "The step 彳 you know from 行, beside the 寺 you met inside 時 — the temple repays its glance, exactly as promised.", sentence: true, w: [["待つ","まつ","to wait"]] },
  "始": { m: "begin", on: "シ", kun: "はじ(める)・はじ(まる)", look: ["好"], sentence: true, w: [["始まる","はじまる","to begin (by itself)"],["始める","はじめる","to begin (something)"]] },
  "終": { m: "end", on: "シュウ", kun: "お(わる)", story: "The left side 糸 is a thread — the first you have seen of a component that runs through a whole family of characters ahead.", sentence: true, w: [["終わる","おわる","to end"],["終わり","おわり","the end"]] },
  "飲": { m: "drink", on: "イン", kun: "の(む)", story: "The food radical — 食, squashed to stand at the left — beside 欠, a wide-open mouth.", sentence: true, w: [["飲む","のむ","to drink"],["飲み物","のみもの","a drink"]] },
  "茶": { m: "tea", on: "チャ・サ", kun: "—", story: "The grass crown 艹 on top marks plants — tea is first of many words wearing it.", w: [["お茶","おちゃ","tea"]] },
  "歩": { m: "walk; step", on: "ホ", kun: "ある(く)", story: "止 began as a footprint. 歩 is two of them, one after the other — walking, drawn directly.", sentence: true, w: [["歩く","あるく","to walk"],["散歩","さんぽ","a walk; a stroll"]] },
  "聞": { m: "hear; ask", on: "ブン", kun: "き(く)", story: "An ear 耳 standing in the gateway — the third guest, exactly where the gate lesson said it would be.", sentence: true, w: [["聞く","きく","to hear; to ask"],["新聞","しんぶん","newspaper"]] },
  "物": { m: "thing", on: "ブツ・モツ", kun: "もの", story: "The left side is an ox, squashed to stand aside the way 亻 does — things were measured in livestock long before yen. Hold the story loosely; the character is everywhere either way.", w: [["物","もの","thing"],["買い物","かいもの","shopping"],["飲み物","のみもの","a drink"]] },
  "写": { m: "copy", on: "シャ", kun: "うつ(す)", w: [["写真","しゃしん","photograph"]] },
  "真": { m: "true; real", on: "シン", kun: "ま", story: "写真 is a true-copy — which is exactly what a photograph claimed to be when the word was coined.", w: [["写真","しゃしん","photograph"],["真ん中","まんなか","the very middle"]] },
  "勉": { m: "effort", on: "ベン", kun: "—", w: [["勉強","べんきょう","study"]] },
  "強": { m: "strong", on: "キョウ", kun: "つよ(い)", sentence: true, w: [["勉強","べんきょう","study"],["強い","つよい","strong"]] },
  "意": { m: "mind; intention", on: "イ", kun: "—", story: "音 a sound, over 心 the heart — the sound the heart makes: what you mean. 心's second customer, one group after it arrived.", w: [["意味","いみ","meaning"],["得意","とくい","one's strong suit"]] },
  "味": { m: "taste; flavour", on: "ミ", kun: "あじ", w: [["意味","いみ","meaning"],["味","あじ","taste"]] },
  "寒": { m: "cold (weather)", on: "カン", kun: "さむ(い)", sentence: true, w: [["寒い","さむい","cold"]] },
  "暑": { m: "hot (weather)", on: "ショ", kun: "あつ(い)", story: "The sun 日 on top is doing the heating.", sentence: true, w: [["暑い","あつい","hot (weather)"]] },
  "忙": { m: "busy", on: "ボウ", kun: "いそが(しい)", story: "The heart radical 忄 — 心 squashed to stand at the left — beside 亡, loss: a heart with no room left in it. The old account and the daily experience agree.", sentence: true, w: [["忙しい","いそがしい","busy"]] },
  "痛": { m: "pain", on: "ツウ", kun: "いた(い)", story: "The lean-to 疒 marks the sickness family — you will meet it again in 病 and 疲.", sentence: true, w: [["痛い","いたい","painful; ouch"]] },
  "寝": { m: "sleep; lie down", on: "シン", kun: "ね(る)", story: "A roof 宀, a bed stood on its side, and the broom-shape from 帰 — a room readied for the night. Loose story, honest parts.", sentence: true, w: [["寝る","ねる","to sleep; to go to bed"]] },
  "洗": { m: "wash", on: "セン", kun: "あら(う)", story: "The water radical 氵 — 水, squashed — beside the 先 you already write.", sentence: true, w: [["洗う","あらう","to wash"],["手を洗う","てをあらう","to wash one's hands"]] },
  "歯": { m: "tooth", on: "シ", kun: "は", story: "止 sits on top carrying the sound; below it, teeth in an open mouth — one of the few characters that is still simply a picture.", w: [["歯","は","tooth"],["歯をみがく","はをみがく","to brush one's teeth"]] },
  "散": { m: "scatter", on: "サン", kun: "ち(る)", w: [["散歩","さんぽ","a walk; a stroll"],["散る","ちる","to scatter; to fall (petals)"]] },
"友": {"m": "friend", "on": "ユウ", "kun": "とも", "story": "Two hands joined — ナ reaching over 又, a grip older than writing. Friendship as a handshake.", "sentence": true, "w": [["友達", "ともだち", "friend"]]},
"達": {"m": "reach; attain", "on": "タツ", "story": "The road radical 辶 from 週, carrying its delivery stack down the road. Who arrives down the road with you: 友達.", "w": [["友達", "ともだち", "friend"]]},
"昨": {"m": "yesterday; last-", "on": "サク", "story": "日 beside the 乍 you wrote in 作 — the sound-carrier keeps its さく. The word 昨日 says きのう anyway; the character itself says さく (昨年).", "w": [["昨日", "きのう", "yesterday"]]},
"夏": {"m": "summer", "on": "カ", "kun": "なつ", "story": "A heavy head under a sun hat, trailing slow legs 夂 — summer walking. Picture, not history.", "sentence": true, "w": [["夏", "なつ", "summer"], ["夏休み", "なつやすみ", "summer vacation"]]},
"音": {"m": "sound", "on": "オン", "kun": "おと", "story": "立 over 日 — classically a tongue with a mark on it: sound made visible. You met it inside 意 (a sound over the heart); here it stands alone.", "sentence": true, "w": [["音", "おと", "sound"], ["音楽", "おんがく", "music"]]},
"楽": {"m": "music; fun", "on": "ガク・ラク", "kun": "たの(しい)", "story": "A drum with bells on its wooden stand. Two readings split the meanings: ガク for music, ラク・たのしい for ease and joy.", "sentence": true, "w": [["音楽", "おんがく", "music"], ["楽しい", "たのしい", "fun, enjoyable"]]},
"果": {"m": "fruit; result", "on": "カ", "story": "A tree wearing its fruit fat in the crown — the 田 up top is a round fruit, not a field. Results grow on effort the way fruit grows on trees.", "w": [["果物", "くだもの", "fruit"]]},
"机": {"m": "desk", "on": "キ", "kun": "つくえ", "story": "Wood 木 shaped like a little table 几. A desk — the plainest assembly in the group.", "sentence": true, "w": [["机", "つくえ", "desk"]]},
"映": {"m": "reflect; project", "on": "エイ", "kun": "うつ(る)", "story": "Sun 日 throwing light onto 央, the center — projection. The cinema borrowed the sun's trick.", "w": [["映画", "えいが", "movie"]]},
"画": {"m": "picture; stroke", "on": "ガ・カク", "story": "A field framed and underlined — a bounded drawing. It also counts strokes: 八画 is eight strokes, which 画 itself has.", "w": [["映画", "えいが", "movie"], ["計画", "けいかく", "plan"]]},
"部": {"m": "part; section", "on": "ブ", "story": "The right-ear radical ⻏ — a town squeezed to a ribbon — beside its sound block. Sections of a town, then of anything: 全部, all the parts.", "w": [["部屋", "へや", "room"], ["全部", "ぜんぶ", "all, everything"]]},
"屋": {"m": "roof; shop", "on": "オク", "kun": "や", "story": "A reclining figure 尸 roofing 至, arrival — where you arrive and stay. Rooms, roofs, and shopkeepers: 本屋 is the book-place.", "w": [["部屋", "へや", "room"], ["本屋", "ほんや", "bookshop"]]},
"問": {"m": "question", "on": "モン", "kun": "と(う)", "story": "A mouth 口 standing in the gateway — you stop at the door and ask. The gate family's fourth guest, both halves already yours.", "w": [["問題", "もんだい", "problem; question"], ["質問", "しつもん", "question (asked)"]]},
"宿": {"m": "lodge; inn", "on": "シュク", "kun": "やど", "story": "Roof 宀, person 亻, hundred 百 — a hundred travelers under one roof: an inn. Eleven strokes, not one new part.", "w": [["宿題", "しゅくだい", "homework"]]},
"題": {"m": "topic; problem", "on": "ダイ", "story": "是 beside the page-head 頁 — the matter set squarely on the page in front of you. Eighteen strokes that read as two parts.", "w": [["宿題", "しゅくだい", "homework"], ["問題", "もんだい", "problem; question"]]},
"図": {"m": "drawing; plan", "on": "ズ・ト", "story": "Marks sealed inside a border 囗 — territory drawn small: a map, a diagram, a plan.", "w": [["図書館", "としょかん", "library"], ["地図", "ちず", "map"]]},
"館": {"m": "hall; building", "on": "カン", "story": "The food radical 飠 beside 官 — the official hall that fed its guests. The squashed-radical thread gets its second 飠 customer after 飲.", "w": [["図書館", "としょかん", "library"]]},
  "社": { m: "company; shrine", on: "シャ", kun: "やしろ", story: "The altar radical 礻 beside earth 土 — a shrine standing on its ground. The word that made it modern is 会社: the gathering-place 会 plus 社. Flip the pair and you get 社会 — society. Same two characters, both directions, both everywhere.", w: [["会社","かいしゃ","company"],["社会","しゃかい","society"],["社長","しゃちょう","company president"]] },
  "事": { m: "matter; work", on: "ジ", kun: "こと", story: "A vertical spine hooked at the foot, catching every crossbar on the way down — a character you will write far more often than take apart. It is the こと of everyday talk: the thing, the matter, the business at hand.", w: [["仕事","しごと","work; job"],["用事","ようじ","errand"],["事故","じこ","accident"]] },
  "業": { m: "trade; business", on: "ギョウ", story: "Thirteen strokes of scaffolding over a base — trade as a built thing, plank by plank. You meet it from the student side first: 授業, a class.", w: [["授業","じゅぎょう","class; lesson"],["休業","きゅうぎょう","closed for business"]] },
  "者": { m: "person (who does)", on: "シャ", kun: "もの", story: "The doer. Attach it to a field and you name the person working it: 医者 heals, 若者 is young, 初心者 is just starting. You have been writing it for weeks — it is the top of 暑, finally stepping out on its own.", w: [["医者","いしゃ","doctor"],["若者","わかもの","young person"],["初心者","しょしんしゃ","beginner"]] },
  "場": { m: "place", on: "ジョウ", kun: "ば", story: "Earth 土 beside the sun-banner 昜 — a sunlit patch of ground, which is all a place is. 場所 says where, 立場 is the ground you stand on, and 場合 is a place in time — a case, a situation.", w: [["場所","ばしょ","place"],["場合","ばあい","case; situation"],["立場","たちば","standpoint"]] },
  "京": { m: "capital", on: "キョウ", look: ["高"], story: "A watchtower on high ground — compare 高, which keeps the same tall silhouette. Two words carry it: 東京, the eastern capital, and 京都, the old one.", w: [["東京","とうきょう","Tokyo"],["京都","きょうと","Kyoto"]] },
  "予": { m: "in advance", on: "ヨ", story: "Four strokes of beforehand. 予定 is the plan, 予約 is the booking, and 天気予報 is tomorrow's weather told today.", w: [["予定","よてい","plan; schedule"],["予約","よやく","reservation"],["天気予報","てんきよほう","weather forecast"]] },
  "合": { m: "to fit; to match", on: "ゴウ", kun: "あ(う)", story: "A lid 人+一 settling onto its box 口 — every part already yours. Things that fit: 場合 a case, 都合 your circumstances, 試合 a match where two sides meet.", sentence: true, w: [["場合","ばあい","case; situation"],["都合","つごう","convenience; circumstances"],["合う","あう","to fit; to match"]] },
  "議": { m: "deliberation", on: "ギ", story: "Words 言 beside a dense right half — twenty strokes, the heaviest character in the app, and it means exactly what that feels like: formal discussion. One word carries nearly all of its work: 会議, the meeting.", w: [["会議","かいぎ","meeting"]] },
  "説": { m: "explain", on: "セツ", look: ["話","語"], story: "Words 言 again — the third member of the talking family after 話 and 語 — this time with a right side that unpacks: 説明, to explain.", w: [["説明","せつめい","explanation"]] },
  "理": { m: "reason; logic", on: "リ", story: "The king's jewel 王 beside the village 里 — and 里 keeps its sound: り in 理, exactly the trick 寺 played in 時 and 乍 in 昨. 料理 is cooking, 理由 is a reason: both are things done in the right order.", w: [["料理","りょうり","cooking"],["理由","りゆう","reason"]] },
  "由": { m: "reason; origin", on: "ユウ・ユ", story: "A field 田 with one sprout pushed through the top — where something comes from. 理由 is the reason; 自由 is freedom, doing things from your own root.", w: [["理由","りゆう","reason"],["自由","じゆう","freedom"]] },
  "最": { m: "the most", on: "サイ", kun: "もっと(も)", story: "The sun 日 over 取 — an ear 耳 in a gripping hand 又, the old sign for taking. Take the topmost: the most. It makes superlatives by standing in front: 最初 first, 最後 last, 最近 lately.", w: [["最初","さいしょ","the first"],["最後","さいご","the last"],["最近","さいきん","recently"]] },
  "後": { m: "after; behind", on: "ゴ", kun: "あと・うし(ろ)", look: ["待"], story: "The stepping radical 彳 you know from 行 and 待, a small thread 幺, and the trailing feet 夂 from the bottom of 夏 — falling behind on the road. 後で, later; 午後, the afternoon; 最後, the very last.", sentence: true, w: [["最後","さいご","the last"],["午後","ごご","afternoon"],["後で","あとで","later"]] },
  "結": { m: "tie; conclude", on: "ケツ", kun: "むす(ぶ)", story: "The thread 糸 from 終 beside 吉 — a scholar 士 over a mouth 口. Threads tied off: 結果 is the result, 結婚 is marriage. Both are knots.", w: [["結果","けっか","result"],["結婚","けっこん","marriage"]] },
  "字": { m: "character; letter", on: "ジ", look: ["学"], story: "A child 子 under the roof 宀 — where characters get learned. Compare 学, which sits the same child under a different roof. 漢字 is the word this whole module is about.", w: [["漢字","かんじ","kanji"],["字","じ","character; handwriting"]] },
  "漢": { m: "China (old); the kan of kanji", on: "カン", story: "Water 氵 — named at last, after 洗 carried it unlabelled for five groups — beside a dense right half taught whole. It names the old mainland, and survives almost solely inside one word you say every day here: 漢字.", w: [["漢字","かんじ","kanji"]] },
};

// ————— Lessons —————
// Kind codes stay English here for the same reason the kana modules do: a module
// teaching a script cannot label its own interface in that script.
const MODULES = [
  { id: "cc-furigana", kind: "culture", title: "The little kana above the kanji",
    exp: "Those small kana printed above or beside a kanji are called furigana, and they are simply its pronunciation. Japanese uses them wherever a reader might not know a character — children's books, learners' material, a surname nobody can guess, a rare word in a newspaper.\n\nHere they are your training wheels. Every kanji you have not learned yet wears its reading, so you can always read the sentence even when you cannot yet read the character.\n\nThey come off by themselves. As you learn a character it stops needing its furigana, and the word you already knew quietly changes shape on the page. That moment — when 見る stops being a shape with a label and becomes a word you can just read — is the whole point of this module.\n\nOne thing worth knowing early: furigana in the wild mostly signals *this is written for someone still learning*. Adult Japanese runs without them. So the goal is not to read furigana well. It is to stop needing them." },

  { id: "cc-intro", kind: "culture", title: "Where this order comes from",
    exp: "There is no official kanji list for any JLPT level. The Japan Foundation stopped publishing test specifications in 2010, on the reasoning that the point of study is communication rather than memorising a list. Every \"N5 kanji list\" you have seen is a reconstruction.\n\nSo the order here is a choice, and it is worth telling you what the choice was. Not the elementary-school order — that one is built for children who already speak fluent Japanese and are learning to write what they can already say, which is why it front-loads 貝, 竹 and 糸.\n\nInstead: characters are scored on how much reading they buy you divided by how much they cost to learn, then reshuffled just enough that nothing appears before its own parts do. The first block is different again — those characters are chosen because between them they demonstrate every stroke rule, and they happen to also be common and to turn up inside hundreds of other kanji. That block is close to free." },

  { id: "k-lines", kind: "kanji", title: "Lines, and the order they go in", chars: ["一","二","三","十"],
    rule: "Top to bottom, and a horizontal crosses before a vertical.",
    exp: "Four characters, nine strokes, two rules.\n\nStack downward: 三 is written top line, middle line, bottom line. Never the other way, never outside-in.\n\nWhere a horizontal crosses a vertical, the horizontal goes first — so 十 is the sideways stroke, then the upright. This one rule decides the opening of a very large number of kanji, and getting it wrong is the single most visible tell in a learner's handwriting." },

  { id: "k-frame", kind: "kanji", title: "Frames: outside before inside", chars: ["日","月","目","田","口"],
    rule: "Draw the frame, then fill it.",
    exp: "A box is written left wall, then top-and-right in one stroke, then whatever is inside, then the floor last. The floor is always last — the box stays open until everything is in it.\n\nThese five are worth the effort twice over. 日 and 目 are components of a large fraction of everything you will meet later, and 口 turns up as a mouth, a container, an enclosure, and occasionally as nothing more than a convenient square." },

  { id: "sb-eye", kind: "skill", title: "日, 目, 白 — three squares", chars: ["日","目","白"],
    exp: "These three are the most-confused trio in early kanji, and the answer is boring: count the lines inside.\n\n日 has one. 目 has two. 白 has one, plus a small stroke on top like a lid.\n\nThey are shown together on purpose. Meeting confusable characters far apart lets the wrong one settle in first; meeting them side by side forces the difference to be encoded from the start. It costs a minute now and saves months of second-guessing.\n\nStructurally 白 does contain 日 — but the meanings are unrelated, so do not build a story on it." },

  { id: "k-center", kind: "kanji", title: "Centre first, then the wings", chars: ["小","水","川","山"],
    rule: "Central stroke first, then the pieces either side. Side-by-side strokes run left to right.",
    exp: "小 is the clean case: the middle vertical, then the left dot, then the right. 水 is the same idea with more going on.\n\n川 shows the other half of the rule — three verticals with no centre, so they simply run left to right. When there is no middle, work across from the left." },

  { id: "k-sweep", kind: "kanji", title: "People, and diagonal sweeps", chars: ["人","入","八","大"],
    rule: "Of two diagonals, the one falling left is written first.",
    exp: "人 is two strokes: the left sweep, then the right. 入 is the same two strokes with the join moved. 八 separates them entirely.\n\nThat is the whole difference between three very common characters, and it is a difference of where the strokes meet rather than of shape. Worth slowing down on.\n\n大 adds a horizontal across the top of 人 — a person with arms out. It is the base of 天, 太 and 犬, so the shape is an investment." },

  { id: "sb-person", kind: "skill", title: "人, 入, 八 — where the strokes meet", chars: ["人","入","八"],
    exp: "人: the two strokes meet at the top, and the left stroke starts the join.\n入: they meet near the top too, but the RIGHT stroke is the one that starts high and the left one hangs off it.\n八: they never meet at all.\n\nIn print the difference is obvious. Handwritten at speed it is not, which is exactly why the stroke order matters — a reader follows the movement, not just the outline." },

  { id: "k-pierce", kind: "kanji", title: "Strokes that run all the way through", chars: ["中","車","女","子"],
    rule: "A stroke that pierces the whole character is written last.",
    exp: "中 is a box with a line through it, and the line goes last — frame, then the piercing vertical.\n\nThe same rule works sideways. 女 finishes with the long horizontal that cuts across everything, and 子 does the same. If you have ever written 女 and had it come out looking unbalanced, this is usually why: the crossbar was drawn too early and the rest had to be fitted around it.\n\n車 is a fuller version of the same idea and is worth writing a few times." },

  { id: "k-enclose", kind: "kanji", title: "Closing the box", chars: ["四","国","円"],
    rule: "An enclosure's bottom stroke is the very last one.",
    exp: "This is the frame rule taken to its conclusion. In 国 you write the left wall, the top-and-right, then everything inside — 玉, a jewel — and only then the floor.\n\nIt feels wrong, because the instinct is to finish the container first. The reason it works this way is that the frame's proportions get set by what goes in it, and you cannot judge that with the box already shut." },

  { id: "cp-strokes", kind: "checkpoint", title: "Checkpoint — the nine rules",
    chars: ["三","日","小","人","中","国"],
    exp: "Six characters, one from each rule you have met. No new material.\n\nDo these on Blank if you can. If a stroke will not come, the hint gives you one stroke and one only — that is enough to unstick you without handing over the answer, and the difference matters for whether it sticks." },

  { id: "k-t1", kind: "kanji", title: "Time on your hands", chars: ["今","分","手","時","上"],
    rule: "Horizontal-before-vertical applies only when they cross. A vertical nothing crosses — 上's opening stroke — goes first.",
    exp: "時 and 分 are the o'clock and minutes on every clock face, and 今 is the word that asks what they say right now. Three characters in, you can read a clock: 三時十分.\n\n今 and 分 open identically — the same two spreading diagonals you wrote in 人 and 八. Then they part company: 今 tucks its strokes underneath, 分 hangs a blade (刀) below. Write them side by side once and they will stay apart for good.\n\n分 is 八 over 刀 — something divided by a blade. A minute is a division of the hour, and the same character reads わ in 分ける, to divide. The story is real, not a memory trick.\n\n時 puts 日 on the left — the sun, telling you the meaning lives near days and time. The right-hand side is carrying sound rather than meaning: a pattern you will meet again and again, so treat it as a shape for now.\n\n上 is where the rule earns its keep — its vertical goes first, because nothing crosses it. 手 is the hand itself; put 上 next to it and you have 上手 — \"skilled,\" written up-hand — the word you will hear the first time your Japanese lands." },

  { id: "sb-lid", kind: "skill", title: "今 and 分 — the same lid", chars: ["今","分"],
    exp: "今 and 分 share a lid and differ entirely in what sits under it. They are drilled together because separating them is what causes the confusion.\n\nA useful habit starts here — when a new kanji looks like one you know, stop and find the difference deliberately rather than noting that they are similar. \"Similar\" is what your memory will store otherwise, and it is not enough to read with." },

  { id: "k-t2", kind: "kanji", title: "Your first sentence, in kanji", chars: ["学","下","生","明","天"],
    rule: "Two parts side by side are written left part completely first — 明 is all of 日, then all of 月.",
    exp: "学 and 生 make 学生 — the word you put in your very first sentence, 私は学生です, back when です was all you had. 学 has 子 at its base, under a roof and some marks: a child under instruction.\n\n生 is worth a note of its own. It means life, birth, raw, and student, and its readings are among the most irregular in the language. Do not try to hold all of them now — meet it in words and let the readings accumulate.\n\n下 arrives one group after 上, its mirror — and like 上 it does grammatical work: 下手 is 上手's opposite number.\n\n明 is the sun and moon sharing one sky: bright — the first kanji you can read as a story, and the first assembled entirely from characters you can already write. 天 is 大 with the sky drawn above it, and the first half of 天気, which finishes next group." },

  { id: "k-t3", kind: "kanji", title: "The teacher and the weather", chars: ["先","気","百","好","年"],
    rule: "A three-sided wrap like 気's is drawn before what shelters inside it — only a closed box saves its floor for last.",
    exp: "Two of your very first words finish in this group. 先 joins the 生 you already have to make 先生 — literally \"born before\": a teacher is someone who got there first. And 気 joins 天 for 天気, sky-spirit, the weather.\n\n気 on its own is one of the hardest characters to pin to a single English word — spirit, air, mood, inclination — and it turns up everywhere, including in 元気, the standard way of asking whether someone is well.\n\n好 is 女 and 子 together: fondness, liking. Whether the original image was a mother with her child or a marriage is argued about; either way the pairing is the character — another one assembled entirely from pieces you can already write, straight out of Stage 0. It will carry 好き when liking things arrives in the grammar.\n\n百 is 一 over 白, both yours already. It buys you prices — 百円 turns up the first time you shop, and the first time the grammar teaches you to say you cannot afford something.\n\n年 is the year, and it needs care: the long horizontal near the bottom pierces, so it goes last — Stage 0's piercing rule, back on duty." },

  { id: "k-t4", kind: "kanji", title: "Seeing, going, and the gap between", chars: ["見","行","七","千","間"],
    rule: "門 is a wrap too: the gate is drawn whole before what you see through it.",
    exp: "見る and 行く have been yours since Step 4 — here is what they look like written down. 見 is an eye 目 on legs 儿. 行 began, the story goes, as a drawing of a crossroads — the place where going happens — and its narrow left side is finished before the right, the same left-then-right that runs through everything.\n\n間 is the sun seen through a gate 門: a gap, an interval, the space between two things. It joins the 時 you already have to make 時間 — time itself.\n\n七 and 千 close out the numbers your day runs on: 七時 is seven o'clock, and 千円 is a thousand yen — you will read it on the first note you handle." },

  { id: "k-t5", kind: "kanji", title: "Rain, fire, and what's coming", chars: ["雨","来","町","火","何"],
    rule: "雨 is a frame with the weather still inside — the four drops go in last.",
    exp: "雨 is the closest thing to a picture this group has: a frame with the rain still falling in it. The drops are the last four strokes — Stage 0's frame rule, holding.\n\n来 you have been saying since 来る arrived — one of the two irregular verbs, the pair that stands outside the Go and Ichi families entirely. The written form is all that is new.\n\n田 is a rice field seen from above — the paths between the plots are the cross in the middle — and 町 is 田 beside 丁, fields on a grid: a town. 火 is fire, and it gives you 火曜日 — Tuesday, straight out of Step 3's calendar.\n\n何 is \"what,\" and you cannot get far in a conversation without it. Its left side is 人, squashed to stand at the edge of a character — a posture you will see constantly from here. The right side is carrying sound, the way 時's right side does." },

  { id: "k-t6", kind: "kanji", title: "The family table", chars: ["母","力","男","土","食"],
    rule: "母's long horizontal pierces the whole character: the two dots go in first, the piercer last of all.",
    exp: "母 is mother, and its shape needs the most care here: the two dots go in before the long horizontal, which pierces everything and is written last — the piercing rule, hiding somewhere unexpected.\n\n力 is strength — usually told as a flexed arm. 男 is 田 over 力, power in the field. Both are compositions rather than new shapes: once you can see 田 inside a character, you have already learned five of its strokes.\n\n土 is the ground itself, and it gives Saturday its character. 食 is eating — 食べる, from your earliest verb lessons: a lid over a full dish, and the character that will follow you onto every menu in Japan." },

  { id: "k-t7", kind: "kanji", title: "Speaking for yourself", chars: ["言","話","私","木","本"],
    rule: "話 writes all of 言 before any of 舌 — a component finishes whole before the next begins.",
    exp: "言 is words — 言う, to say. 話 is those same words with a tongue 舌 beside them: 話す, to speak. Learn the first and the second is already half drawn, which is the whole reason they arrive together.\n\n私 is \"I.\" The left side is 禾, a grain plant; the right is 厶, which once meant \"private\" — grain of one's own. However you hold the story, it is the single most unavoidable character in this course.\n\n木 is a tree, and 本 is 木 with one short mark near the base: the root — and from root, the origin, the source, a book, and Japan itself: 日本, sun-origin." },

  { id: "sb-root", kind: "skill", title: "木 and 本 — one stroke apart", chars: ["木","本"],
    exp: "木 and 本 differ by one short stroke near the bottom. Same drill as before: find the one stroke deliberately. 本 is the tree with its root marked — if you can say which stroke is the mark, you have the difference encoded, and 日本 will never read as \"sun-tree.\"" },

  { id: "k-t8", kind: "kanji", title: "The tree family", chars: ["休","校","林","森"],
    rule: "A repeated component runs across before down: 林 is left tree then right; 森 is the top tree, then the bottom pair, left to right.",
    exp: "Every character here contains the 木 you met one group ago.\n\nTwo trees make 林, woods. Three make 森, forest. The logic is as transparent as kanji ever gets, and it is real — this is how the characters were actually built.\n\n休 is 亻 plus 木: a person against a tree, resting. It is one of the cleanest stories in the whole system and it is genuinely the historical one.\n\n校 pairs 木 with 交. That second part is not carrying meaning so much as sound — a hint you will learn to read much later. For now, treat it as a shape you have met. It closes 学校: the 学 from six groups back finally gets its school." },

  { id: "cp-parts", kind: "checkpoint", title: "Checkpoint — reading the parts",
    chars: ["休","明","男","好","時"],
    exp: "Five compound characters. Before you write each one, name its parts out loud.\n\nThat step is the point of the checkpoint. Copying a shape is a drawing task; naming the parts first is a reading task, and reading is what you are actually building." },

  { id: "k-t9", kind: "kanji", title: "The numbers nobody taught you", chars: ["五","六","九"],
    rule: "Nothing new: horizontals go before the verticals that cross them, and 九's bend is one stroke — turn the corner without lifting.",
    exp: "You have been counting around a gap. 一二三四七八十百千 arrived over the first two groups; these three close the set, and with them every price, every hour and every date is written in characters you can write too.\n\n五 is four strokes of pure Stage 0: the top horizontal, the crossing frame, the floor last. 六 opens with a dot and a lid, then hangs 八 beneath — you have been writing its whole lower half since the sweeps lesson.\n\n九 is the one that needs care. Two strokes only: the left sweep, then a single stroke that runs across, turns the corner, and hooks up at the end. Keep that bend inside one movement. And watch it next to 力 — in 九 the horizontal sticks out past the sweep on the left; in 力 it does not. A reading note while you are here: 九時 is くじ, not きゅうじ — the clock keeps the older reading, just as it does at 七時." },

  { id: "k-t10", kind: "kanji", title: "Out among people", chars: ["会","電","開","買"],
    rule: "開 works exactly like 間 — the whole gate 門 first, then what it holds.",
    exp: "会う, to meet — 会 opens with the same spreading lid you drilled on 今 and 分, then tucks 云 beneath it. One more member of a family your eye already knows how to spot.\n\n電 is rain 雨 over a field with a tail of lightning, and it originally meant lightning itself. It arrives this late for how common it is because 雨 had to come first — and the moment it lands, three words you have used for weeks change shape at once: 電車, 電話, 電気.\n\n開 brings the gate back. In 間 the sun stood in the gap; here it is the bar, and the two hands lifting it. 開ける has been on your doorknobs since the て-form lessons.\n\n買 is a net coming down over 貝, a shell — shells were early money, and the character has meant buying ever since. Together the four write an afternoon: take the 電車 into town, 会う a friend, 開ける the shop door, 買う what you came for." },

  { id: "sb-gate", kind: "skill", title: "間 and 開 — same gate, different guest", chars: ["間","開"],
    exp: "The gate 門 is eight strokes you already own, and it frames a whole family of characters. What stands in the gateway decides the meaning: the sun in the gap makes 間, the interval; the bar and hands make 開, to open.\n\nSay the guest out loud as you write — \"sun\", \"hands\" — because at reading speed the gate is all your eye gets, and the guest is the only difference there is. A third member, 聞 with an ear in the gateway, is waiting a few groups ahead." },

  { id: "k-t11", kind: "kanji", title: "Making and marking", chars: ["作","文","使","書"],
    rule: "亻 finishes before the right side starts — the same left-then-right that has governed everything since 明.",
    exp: "作る is making, and 作文 — literally a made sentence — is the word your homework has been hiding under. 文 itself is four strokes and one of the oldest characters in the system: a mark, a pattern, a sentence.\n\n作 and 使 share the squashed person 亻 from 休 and 何. Both right sides are carrying sound rather than meaning — the division of labour you first met in 時, and worth noticing deliberately every time now, because it is how most kanji you will ever meet are built.\n\n書 is a hand gripping a brush, set down over the page: 書く, to write. It also sits inside 図書館 — the library, a building named as the house of books." },

  { id: "k-t12", kind: "kanji", title: "The daily arc", chars: ["朝","起","帰"],
    rule: "朝's left stack runs top to bottom — 十, 日, 十 — and finishes whole before 月 begins.",
    exp: "Three characters that bracket a day. 起きる gets you up, 帰る gets you home, and 朝 is what both of them point at.\n\n起 is 走, to run — a character you will meet properly in a later group — with 己, the self, tucked into its lap: getting yourself moving. The run's long final stroke sweeps underneath and carries 己 on its back.\n\n朝 reads as a picture: the moon 月 still in the sky while the sun climbs through the grass on the left. Hold it as a picture rather than a history and it will hold you back.\n\n帰 is the one to respect. Its parts — two strokes standing at the left, a broom shape at the right — do not tell an honest story, so learn it as a movement instead. It is one of the most-written verbs in the language; your hand will know it before your eye does." },

  { id: "k-t13", kind: "kanji", title: "Naming the days", chars: ["週","毎","曜"],
    rule: "曜 is three columns, each finished whole: 日, then the feathers, then the bird 隹.",
    exp: "週 is the road radical 辶 — a squashed \"going\", the way 亻 is a squashed person — wrapped around 周: a circuit that comes back to its start. 先週 and 来週 have been in your grammar since the time words arrived; now they are yours to write.\n\n毎 is every: 毎日, 毎週, 毎朝. Its lower half is 母's shape — a structural fact rather than a story — and its readings are blessedly regular.\n\nThen the one you were promised. 曜 is eighteen strokes, the longest character in this course, and it is three shapes rather than eighteen decisions: 日, a pair of feathers, a short-tailed bird 隹. It named the seven luminaries — the sun, the moon, and the five planets you can see — and that is exactly how Japanese names its days: 月曜日 moon-day, 火曜日 fire-day, 水曜日 water-day. One hard character, and every day of the week stops needing furigana. It is the best trade in the syllabus." },

  { id: "cp-day", kind: "checkpoint", title: "Checkpoint — a readable day",
    chars: ["五","電","開","書","朝","曜"],
    exp: "Six characters, one from each lesson in this group — between them they can write the hour you got up, the train you caught, the door you opened, the page you wrote, and the name of the day itself.\n\nBlank if you can. The hint still gives one stroke and one only." },

  { id: "k-t14", kind: "kanji", title: "Your name, in your language", chars: ["名","前","語"],
    rule: "名 stacks 夕 over 口 top to bottom; 語 writes its three parts each finished whole, left to right.",
    exp: "名前 is your name — the word every introduction has run on since your very first lesson — and both halves arrive here together. 前 also works alone: in front of, and before, which is why it turns up in times and places alike.\n\n語 is the group's payoff. 言 words, 五 five, 口 a mouth: fourteen strokes and every one of them already yours, the largest character so far that you can read as an assembly rather than learn as a shape. It closes 日本語 — the name of the thing you are doing.",
    },

  { id: "k-t15", kind: "kanji", title: "The price of things", chars: ["高","安","新","広"],
    rule: "高 is stacked boxes: work top to bottom, and every box keeps its floor for last.",
    exp: "Four adjectives, straight out of Step 9's grammar: 高い, 安い, 新しい, 広い. These are the characters your opinions run on — what things cost, how new they are, how much room they leave you.\n\n高 doubles for tall and expensive, and Japanese sees no difference worth marking. 安 is 女 under a roof 宀 — peaceful first, cheap by extension, the pleasant idea that what costs little leaves you at ease.\n\n新 carries an axe 斤 on the right — fresh-cut — and pairs with 聞 in 新聞, the newspaper: the news. That second character is the gate with an ear in it, still a group or two away; for now the word wears its furigana.\n\n広 is the smallest of the four: a lean-to roof over the same 厶 you met in 私. Five strokes, and your rooms and towns can be described.",
    },


  { id: "k-t16", kind: "kanji", title: "Think, wait, begin, end", chars: ["思","待","始","終"],
    rule: "思's 心 is four strokes: left dot, the curling hook, then the two dots — in that order.",
    exp: "The verbs that run under a day, rather than through it. 思う has been carrying your opinions since 〜と思います; here is its character — a heart 心 under what looks like a field. The top began as a skull, whatever it looks like now; the heart below is doing the thinking, and 心 will return wherever feeling does.\n\n待つ puts the step 彳 beside the temple — the next lesson takes the pair apart properly.\n\n始 and 終 are bookends. 始 is 女 with 台 — and it is the 始まる/始める pair from the grammar module's verb-pairs lesson, so its two words mean you choose your particle with your verb: 会議が始まる, 会議を始める. 終 hangs 冬, winter, off a thread 糸 — the end of the year on the end of the line. Between them they can open and close anything you do.",
    },
  { id: "sb-tera", kind: "skill", title: "時 and 待 — the temple on the right", chars: ["時","待"],
    exp: "Two characters share the 寺 you were told to glance at back in 時's lesson. The right side stays put; the LEFT side does the telling: the sun 日 makes it about time, the step 彳 makes it about waiting.\n\nThis is the pattern worth extracting, because it is the pattern most kanji are actually built on: the right side carries a sound, the left side names the topic. You have seen it in 作 and 使, and 寺 will do it again in characters you haven't met. When two characters look like twins, check the left edge first — that is usually where the difference lives.",
    },

  { id: "k-t17", kind: "kanji", title: "Tea, and the walk after", chars: ["飲","茶","歩"],
    rule: "The food radical squashes to stand at the left of 飲 — like 亻, a component learns to stand aside.",
    exp: "お茶を飲む — tea, and the drinking of it. 飲 puts the 食 you already write beside 欠, a mouth open wide, and narrows from eating to drinking. 茶 wears the grass crown 艹 that marks plants; it is the first of many characters that carry it, and お茶 is the word your breaks are made of.\n\n歩 is walking drawn directly: 止 began as a footprint, and 歩 is two footprints, one after the other. It gives you 歩く, and 散歩 — the walk you take for its own sake — keeps its furigana on 散 for now.\n\nSmall reading note: 散歩 is さんぽ, the ほ hardening to ぽ after ん — the same small sound shifts you met all through the kana modules, still at work inside words.",
    },

  { id: "cp-desc", kind: "checkpoint", title: "Checkpoint — describing your day",
    chars: ["語","高","思","始","飲","歩"],
    exp: "Six characters, one from each lesson in this group. Between them: the language you study, the price you thought about, the thing you started, the tea you drank, and the walk after.\n\nBlank if you can. The hint gives one stroke, as always.",
    },

  { id: "k-t18", kind: "kanji", title: "Paper, pictures, things", chars: ["聞","物","写","真"],
    rule: "聞 draws the whole gate 門 first — the third time you have done it, and the rule has not moved.",
    exp: "聞 is the guest you were promised: an ear in the gateway. 聞く does double duty — to hear, and to ask — which surprises English speakers exactly once. And 新聞 sheds the furigana it wore into k-t15: the news, heard on paper.\n\n物 is もの, the all-purpose thing, and it pays for itself instantly: 買い物, 飲み物, and 物 alone. Its left side is an ox squashed to stand aside, the way 亻 stands aside in 休 — things were measured in livestock long before yen, a story to hold loosely.\n\n写真 arrives as a pair — some words are simply bought whole. 写 is copy, 真 is true: a photograph is a true-copy, which is exactly what the camera claimed when the word was coined. The bank's 写真を撮る keeps 撮 in furigana for now; the noun itself is yours.",
    },

  { id: "sb-gate2", kind: "skill", title: "間・開・聞 — the gate, complete", chars: ["間","開","聞"],
    exp: "The family sb-gate promised is now whole. Three guests, three meanings: the sun in the gap makes 間, the interval; the bar and hands make 開, to open; the ear makes 聞, to hear.\n\nWrite all three in a row and notice what your hand already knows: the gate is eight of the strokes every time, so each new member cost you almost nothing. That is what a component family is for — and it is why the glance at 門 back in 間's lesson was an investment, not a detour. Say the guest out loud as you write; at reading speed the guest is the only difference there is.",
    },

  { id: "k-t19", kind: "kanji", title: "Study, and what it means", chars: ["勉","強","意","味"],
    rule: "強's bow 弓 finishes whole before anything stands beside it — components complete themselves, always.",
    exp: "勉強 is the second word this group buys whole — and the word for what you are doing right now. 強 repays the pair on its own: 強い, strong, straight into your Step 9 adjectives.\n\n意 is 音, a sound, over 心, the heart — the sound the heart makes: what you mean. The heart was promised to keep turning up when you met it under 思; here it is, one group later.\n\n味 is taste, and 意味 — meaning — is what a word holds the way food holds flavour. It also half-opens 得意, the word the 上手 lesson recommended for talking about your own strengths; 得 keeps its furigana a while longer.",
    },

  { id: "k-t20", kind: "kanji", title: "How the day feels", chars: ["寒","暑","忙","痛"],
    rule: "寒 stacks under its roof top to bottom, and the two floor dots go in last.",
    exp: "Four adjectives straight out of Step 9, and between them most of how a day gets described: 寒い, 暑い, 忙しい, 痛い.\n\n寒 and 暑 are the weather pair. 暑's sun 日 sits on top, doing the heating — and the grammar module's script lesson already showed you why the kanji matters here: 暑い and 熱い sound identical, and only the character says whether the day or the tea is hot. 熱 itself comes later; the distinction starts now.\n\n忙 introduces the fourth member of the squashed family: 忄 is 心, the heart, turned sideways to stand at the left — alongside 亻 the person, 飠 the food, and 氵 the water you will meet next lesson. Beside it, 亡: loss. A heart with no room left in it — the old account and the daily experience agree.\n\n痛 wears the lean-to 疒 that marks the sickness family (病 and 疲 wait further on). 痛い earns its keep in speech, too — it is what Japanese says where English says ouch.",
    },

  { id: "k-t21", kind: "kanji", title: "Winding down", chars: ["寝","洗","歯","散"],
    rule: "洗's water radical 氵 is three strokes, top to bottom, before the whole of 先.",
    exp: "The evening, in order: 手を洗う, 歯をみがく, 散歩 if the weather holds, and 寝る.\n\n洗 is the group's assembly moment: the water radical 氵 — 水, squashed — beside the 先 you have written since 先生. Two knowns, one new character.\n\n歯 is nearly a photograph of itself: teeth in an open mouth, with 止 on top carrying the sound. 散 finally frees 散歩 from its furigana — さんぽ, the ぽ hardened by the ん in front of it, exactly the shift k-t17 flagged.\n\nAnd 寝 closes what 起 opened back in the daily-arc lesson: a roof, a bed stood on its side, and — look closely — the broom-shape from 帰, the room being readied for the night. The story is loose but the parts are honestly there. The day the module teaches now runs end to end: 起きて、食べて、歩いて、寝る.",
    },

  { id: "cp-feel", kind: "checkpoint", title: "Checkpoint — the whole day now",
    chars: ["聞","真","強","暑","洗","寝"],
    exp: "Six characters across the group: the news you heard, the photo that was true, the strength you studied up, the heat of the afternoon, the washing before bed, and the sleep at the end of it.\n\nBlank if you can. One stroke from the hint, as always.",
    },

  // ————— Group 6 · School days (Session 15, ledger-driven) —————
  { id: "k-t22", kind: "kanji", title: "Friends and days", chars: ["友","達","昨","夏"],
    rule: "達's road radical 辶 is written LAST — the stack rides on top, then the road slides underneath, exactly as in 週.",
    exp: "友達 arrives whole: 友, two hands joined — ナ reaching over 又, a grip older than writing — and 達, the road radical 辶 from 週 carrying its delivery stack. Who arrives down the road with you: friends.\n\n昨 is the quiet pattern payoff: 日 beside the 乍 you wrote in 作. 乍 keeps its sound — さく in 作, さく in 昨 — the same trick sb-tera showed with 寺. (昨日 the word says きのう anyway; the drill after this lesson takes that apart.)\n\n夏 is a picture to keep, not a history: a heavy head under a sun hat, trailing slow legs 夂 — summer, walking. 夏休み needs only the 休 you already own.",
    },

  { id: "sb-saku", kind: "skill", title: "作・昨 — the sound stays", chars: ["作","昨"],
    exp: "sb-tera showed the pattern on 時 and 待: one side names the topic, the other keeps the sound. Here it is again, cleaner: 乍 says さく. With a person 亻 it's 作 — making, さく. With a sun 日 it's 昨 — the day past, さく. Different topics, same sound.\n\nThe catch that keeps you honest: 昨日 the WORD reads きのう — a whole-word reading that ignores both characters, the same exception family as 果物. The character's own さく surfaces the moment you meet 昨年.\n\nOnce you see 乍 as a sound-carrier, unread characters start half-pronouncing themselves. That's the skill.",
    },

  { id: "k-t23", kind: "kanji", title: "Sound and fruit", chars: ["音","楽","果","机"],
    rule: "楽 writes its center first — 白, then the sparks off both shoulders, then 木 beneath.",
    exp: "音 stood inside 意 back in the feelings group — a sound over the heart. Here it is alone: 立 over 日, sound made visible. Add 楽 — a drum with bells on its wooden stand — and 音楽 is music: sound, enjoyed.\n\n楽 carries two readings on purpose: ガク when it means music, ラク・たのしい when it means ease and joy. One character, both sides of a good afternoon.\n\n果 is a tree wearing its fruit fat in the crown — the 田 up top is a round fruit, not a field. Results grow on effort the way fruit grows on trees, so 果 also means outcome. (果物 reads くだもの — another whole-word reading, like 昨日.)\n\n机 is the plainest assembly here: wood 木 shaped like a little table 几. A desk.",
    },

  { id: "k-t24", kind: "kanji", title: "Out and in", chars: ["映","画","部","屋"],
    rule: "⻏ the right-ear is two strokes — ribbon curl, then the straight drop — and it comes second: the left half speaks first.",
    exp: "映画 comes as a pair: 映, sun 日 throwing light onto 央 the center — projection — and 画, a field framed and underlined: a bounded drawing. Together, projected pictures: the movies.\n\n画 moonlights as the stroke counter — 八画 is eight strokes, which 画 itself has — so the module's own vocabulary just became writable.\n\n部 introduces ⻏, the right-ear radical: a town squeezed to a ribbon. Sections of a town, then sections of anything: 全部, all the parts; 部屋, the section of the house that's yours.\n\n屋 is a reclining figure 尸 roofing 至, arrival — where you arrive and stay. Rooms, roofs, and shops: 本屋 is the book-place. (部屋 reads へや — the や is 屋's own; the へ is the word's.)",
    },

  { id: "k-t25", kind: "kanji", title: "The study set", chars: ["問","宿","題","図","館"],
    rule: "宀 first, always — the roof goes up before anyone lodges under it.",
    exp: "問 walks into the gate: 門 with a mouth 口 in the doorway — you stop at the entrance and ask. The gate family sb-gate2 called a trio quietly seats a fourth guest, and both halves were already yours.\n\n宿 is this group's 語-moment: roof 宀, person 亻, hundred 百 — a hundred travelers under one roof, an inn. Eleven strokes, not one new part.\n\n題 is the deliberate mountain: eighteen strokes, the heaviest character in the module — and the point is that it doesn't matter. 是 beside the page-head 頁, the matter set squarely on the page: read parts, not strokes, and 宿題 and 問題 both land at once.\n\n図 is territory drawn small: marks sealed in a border 囗. And 館 — the food radical 飠 beside 官, the official hall that fed its guests — finishes 図書館: drawings, writings, and the building that keeps them.",
    },

  { id: "cp-school", kind: "checkpoint", title: "Checkpoint — school days",
    chars: ["達","音","映","画","宿","題"],
    exp: "Six characters that spell an afternoon: the friends who arrived, the music on the way, the movie you watched, and the homework waiting after.\n\nBlank if you can. One stroke from the hint, as always.",
    },
  { id: "k-t26", kind: "kanji", title: "Work, and the company you keep", chars: ["社","事","業","者"],
    rule: "社's altar radical 礻 finishes — all four strokes — before 土 begins. Left side first, always, and it holds for every two-sided character in this group.",
    wild: "株式会社 on every office building's nameplate — 社 ends most company names you will walk past. 営業中 hangs on shop doors (business, underway); 関係者以外立入禁止 on gates means the 者 concerned are not you. 工事中, with 事, fronts every dug-up pavement.",
    exp: "社 is the altar radical 礻 standing on earth 土 — a shrine, and then, when Japan needed a word for the companies arriving with the Meiji era, the shrine lent its character: 会社. Flip it and 社会 is society. Two characters, two orders, two of the most common words you will meet from here on.\n\n事 is the everyday こと — matter, business, the thing at hand. A hooked spine catching its crossbars; write it whole and often, because 仕事 is where the N3 stages spend most of their time.\n\n業 is trade built like scaffolding, thirteen strokes plank by plank. Your side of it for now is 授業 — the class you sit in.\n\n者 you have been writing since 暑: its top, finally out on its own. It marks the doer — 医者 heals, 若者 is young, 初心者 has just begun. The drill after this lesson takes the reunion apart.",
    },

  { id: "sb-mono", kind: "skill", title: "者・暑 — the one who was there all along", chars: ["者","暑"],
    exp: "When 暑 arrived in the feelings group, its top was just heat shimmer over the sun. Now the top has a name: 者, the doer, a character in its own right. Nothing about 暑 changed — your eye did.\n\nThat is the skill this builder is for. Parts you meet inside characters can step out and become characters, and characters you learn late retro-name the ones you learned early. 乍 did it as a sound; 者 does it as a shape.\n\nAnd 者 earns its keep immediately: it is the person-suffix of the working world — 医者, 若者, 初心者. When an unfamiliar character ends a word about a kind of person, guess しゃ and you will be right more often than not.",
    },

  { id: "k-t27", kind: "kanji", title: "Where and when it happens", chars: ["場","京","予","合"],
    rule: "場 writes its earth 土 first, then the sun-banner 昜 — sun before the banner strokes sweep down and left.",
    wild: "駐車場 is the blue P-sign's long form — a place for parked cars — and 会場 with an arrow points to any event you're heading for. 東京 is on the departure board of every east-bound shinkansen; 予約 glows on the reserved tab of ticket machines, and 予定 heads a whiteboard column in every office.",
    exp: "場 is ground 土 under the sun-banner 昜 — a lit patch of earth, which is all a place is. 場所 says where. 立場 is the ground you stand on. And 場合 is a place in time: a case, a situation — the word the four ifs of Step 16 have been waiting for.\n\n京 is a watchtower on high ground, and it keeps the tall silhouette of 高 — worth one look, because the two share a skyline. 東京 and 京都: the new capital and the old.\n\n予 is beforehand in four strokes. 予定 the plan, 予約 the booking, 天気予報 tomorrow's weather told today — the app's politeness stages lean on all three.\n\n合 is a lid settling onto its box: 人, 一, 口, every stroke already yours. Things that fit — 場合, 都合, 試合 — and the verb 合う, to fit, which your grammar met inside 間に合う.",
    },

  { id: "k-t28", kind: "kanji", title: "Saying why", chars: ["議","説","理","由"],
    rule: "言 is seven strokes, and every one of them lands before the right side begins — the same in 議 and 説 as it was in 話 and 語.",
    wild: "会議室 on frosted-glass doors down every office corridor. 取扱説明書 is the booklet in the box with anything you buy — the 説明 is the middle of it. 料理 runs across menus and cooking shows all day; 理由 is the box on any form that asks why you are applying.",
    exp: "This is the reasons group — the characters behind Step 29's okage and seide, arriving in writing.\n\n議 is words 言 beside a dense right half that stays folded — twenty strokes, the heaviest character in this app. It means formal deliberation, and it rides almost entirely inside one word: 会議. Nine of your lesson banks already use it.\n\n説 is the third member of the talking family — 話 spoke, 語 named languages, and 説 explains: 説明. Same 言, new right side.\n\n理 is the king's jewel 王 beside the village 里 — and 里 keeps its sound, り, the trick you know from 寺 in 時 and 乍 in 昨. 料理 is cooking and 理由 is a reason: both are things done in their right order.\n\n由 is a field with one sprout through the top — origin, the root a reason grows from. 理由, and later 自由: freedom, acting from your own root.",
    },

  { id: "k-t29", kind: "kanji", title: "Before and after", chars: ["最","後","結","字","漢"],
    rule: "最 stacks top before bottom: the sun 日, then the ear 耳, and the gripping hand 又 closes it.",
    wild: "自由席 and 指定席 on the shinkansen — 自由, built on 由, is the unreserved car. 最後尾 is the sign an attendant holds at the end of a long queue; 最新 flashes in electronics stores. And 漢字 names itself on every study-book spine in the bookshop's language corner.",
    exp: "最 is the sun over 取 — an ear 耳 in a gripping hand 又, the old sign for taking. Take from the top: the most. It builds superlatives by standing in front — 最初, 最後, 最近 — and your banks have been full of all three for two stages.\n\n後 reuses three old parts: the stepping 彳 of 行 and 待, a small thread, and the trailing feet 夂 from the bottom of 夏. Falling behind on the road — after. 後で, 午後, and 最後 again from the other side.\n\n結 is the thread 糸 of 終 tied to 吉. Knots: 結果 the result, 結婚 the marriage.\n\n字 is a child under the roof 宀, learning letters — hold it against 学, the same child under a different roof.\n\nAnd 漢. Water 氵 — carried unnamed in 洗 for five groups, named at last — beside a right half taught whole. It names old China, and in this app it lives inside exactly one word: 漢字. You have been saying it since day one. Now you can write it.",
    },

  { id: "cp-work", kind: "checkpoint", title: "Checkpoint — the working week",
    chars: ["社","事","場","予","議","字"],
    exp: "Six characters that spell a working day: the company you joined, the work on the desk, the place it happens, the plan you made, the meeting about it — and the characters you wrote it all down in.\n\nBlank if you can. One stroke from the hint, as always.",
    },
];

// ————— Progress migration: order-v1 → order-v2 lesson ids (Session 10) —————
// The order-v2 regroup renamed every post-Stage-0 lesson, so per-lesson
// progress under the old ids would silently orphan while known-kanji-v1 kept
// claiming the characters. Migration is by CHARACTER — the only unit stable
// across the regroup: each traced entry ("char:mode") moves to the first
// current lesson that teaches its character. Two deliberate losses, both
// chosen over guessing: recall-quiz bests are lesson-scoped and have no
// faithful mapping to the new groups, so recall is retaken; and the split
// skill builders (sb-lid, sb-root) start fresh rather than inheriting traces
// from kanji lessons — the drill is the point, not the ink.
const DEAD_IDS_V1 = ["k-tree", "k-person2", "k-sun", "k-field", "k-woman",
                     "k-verbs", "sb-tree", "k-numbers", "k-weather", "k-rest"];
function migrateProgressV2(p) {
  if (!p || !DEAD_IDS_V1.some((id) => p[id])) return p;      // nothing to migrate
  // char → current home lesson. Kanji lessons win; skills are the fallback so
  // 白 — whose only current lesson is sb-eye — still has somewhere to land.
  // (Dead lessons re-listed Stage 0 characters: 田 in k-field, 女·子 in
  // k-woman. Their traces merge into the SURVIVING Stage 0 entries, which is
  // why this runs in two passes — survivors first, then merges on top.)
  const home = {};
  for (const kind of ["kanji", "skill"]) {
    for (const m of MODULES) {
      if (m.kind !== kind || !m.chars) continue;
      for (const c of m.chars) if (!home[c]) home[c] = m.id;
    }
  }
  const next = {};
  for (const [id, entry] of Object.entries(p)) {             // pass 1: survivors
    if (!DEAD_IDS_V1.includes(id)) next[id] = entry;
  }
  for (const id of DEAD_IDS_V1) {                            // pass 2: merges
    for (const t of (p[id] && p[id].traced) || []) {
      const dest = home[String(t).split(":")[0]];
      if (!dest) continue;
      const d = next[dest] = { ...(next[dest] || {}) };      // never mutate a survivor
      const seen = new Set(d.traced || []);
      seen.add(t);
      d.traced = [...seen];
    }
  }
  next._migratedV2 = { at: Date.now(), from: DEAD_IDS_V1.filter((id) => p[id]) };
  return next;
}

const GROUPS = [
  { title: "Foundations — how strokes work",
    blurb: "Nine rules that govern every kanji you will ever write, each on a character worth knowing anyway.",
    ids: ["k-lines","k-frame","sb-eye","k-center","k-sweep","sb-person","k-pierce","k-enclose","cp-strokes"] },
  { title: "Building from parts",
    blurb: "Characters stop being shapes and start being assemblies. Nothing appears before its own components do.",
    ids: ["k-t1","sb-lid","k-t2","k-t3","k-t4","k-t5","k-t6","k-t7","sb-root","k-t8","cp-parts"] },
  { title: "The shape of a day",
    blurb: "The numbers finished, the week named, and the daily round — meeting, making, writing, getting home — assembled from parts you already own.",
    ids: ["k-t9","k-t10","sb-gate","k-t11","k-t12","k-t13","cp-day"] },
  { title: "Describing your days",
    blurb: "Your name and your language, the price of things, and the verbs that run underneath — thinking, waiting, starting, finishing, and the tea in between.",
    ids: ["k-t14","k-t15","k-t16","sb-tera","k-t17","cp-desc"] },
  { title: "The rest of the day",
    blurb: "News and photos, study and meaning, how a day feels, and the routine that closes it — the gate family completed, the squashed radicals named.",
    ids: ["k-t18","sb-gate2","k-t19","k-t20","k-t21","cp-feel"] },
  { title: "School days",
    blurb: "Friends and yesterdays, music and fruit, movies and rooms, and the study set — the gate seats a fourth guest, the page-head 頁 arrives, and the sound-carriers start paying.",
    ids: ["k-t22","sb-saku","k-t23","k-t24","k-t25","cp-school"] },
  { title: "The working week",
    blurb: "The company and the doers in it, the places and plans, the reasons said out loud — and 漢字 itself, finally written by the people learning it. 者 steps out of 暑, 里 keeps its sound, and 氵 gets its name.",
    ids: ["k-t26","sb-mono","k-t27","k-t28","k-t29","cp-work"] },
];
const INTRO = MODULES.find((m) => m.id === "cc-intro");
const FURIGANA = MODULES.find((m) => m.id === "cc-furigana");
// The two lessons that must be met before anything else. They are pinned above
// the groups and highlighted until acknowledged — a learner who scrolls straight
// to 一 has skipped the two things that explain what they are looking at.
const INTROS = [FURIGANA, INTRO].filter(Boolean);
const GROUPED = GROUPS.map((g) => ({
  ...g, points: g.ids.map((id) => MODULES.find((m) => m.id === id)).filter(Boolean),
}));

// The seam the grammar module consumes. Ordered: everything a learner has been
// taught, in teaching order. `kanjiTaught()` / `needsFurigana()` read this.
// Paste this array into grammar-module.jsx's KANJI_SYLLABUS, or import it.
export const KANJI_SYLLABUS = GROUPED.flatMap((g) =>
  g.points.flatMap((p) => p.chars || [])
).filter((c, i, a) => a.indexOf(c) === i);

const KINDS = {
  kanji:      { short: "KJ", full: "Kanji lesson",       color: "#3D5A80" },
  skill:      { short: "SB", full: "Skill builder",      color: "#C7351B" },
  culture:    { short: "CC", full: "Culture Connection", color: "#3E7C4F" },
  checkpoint: { short: "CP", full: "Checkpoint",         color: "#907119" },
};
const KIND_ORDER = ["kanji", "skill", "culture", "checkpoint"];

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

// ————— Coverage —————
// Approximate cumulative kanji-token coverage of ordinary text by frequency rank.
// PLACEHOLDER anchors — recompute against the real merged frequency list before
// this is shown as fact. It is the most confident-looking number in the UI.
const COVERAGE_ANCHORS = [[0,0],[10,.10],[25,.18],[50,.26],[100,.38],[200,.52],[300,.62],[500,.77],[750,.85],[1000,.90]];
function coverageAtRank(n) {
  if (n <= 0) return 0;
  for (let i = 1; i < COVERAGE_ANCHORS.length; i++) {
    const [x0, y0] = COVERAGE_ANCHORS[i - 1], [x1, y1] = COVERAGE_ANCHORS[i];
    if (n <= x1) return y0 + ((n - x0) / (x1 - x0)) * (y1 - y0);
  }
  return 0.9;
}

// ————— Storage —————
const KEY = "kanji-progress-v1";
const KNOWN_KEY = "known-kanji-v1";      // written here, read by the grammar module
const GRAMMAR_KEY = "n5-progress-v1";    // read here, written by the grammar module
         // SHARED with the kana modules — the
                                         // handwriting floor calibrated there
                                         // applies here without recalibrating.



// ————— API —————
async function callClaude() {
  // Removed by build-vite-app.py. This build is static: no API key,
  // no network, no cost. Features needing the grader are disabled
  // above rather than failing here.
  throw new Error("grader-unavailable-in-static-build");
}

// Deliberately narrow. A beginner sentence is often wrong four ways at once and
// correcting all four is accurate and demoralising. This is a kanji drill.
const SENTENCE_SYSTEM = null; // stripped by build-vite-app.py — prompts ship only in the graded artifact

const GRADING_MESSAGES = [
  "Looking for your new kanji in the wild…",
  "Checking one thing and ignoring the rest on purpose…",
  "Uncapping the red pen, then putting most of it away…",
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

function Chip({ children, color }) {
  return (
    <span style={{
      display: "inline-block", fontSize: 11, letterSpacing: ".4px", padding: "2px 8px",
      borderRadius: 999, border: `1px solid ${color || T.hairline}`, color: color || T.sub,
    }}>{children}</span>
  );
}

// ————— Stroke-order animation (ported from the kana modules) —————




// ————— Tracing engine (ported wholesale from the kana modules) —————






















// ————— Learn —————
function partLabel(p) {
  return p.orig ? `${p.e} (a squashed ${p.orig})` : p.e;
}

function Learn({ mod, known, onTapChar }) {
  const chars = mod.chars || [];
  return (
    <div>
      {mod.rule && (
        <div style={{
          background: T.noteBg, border: `1px solid ${T.note}44`, borderRadius: 6,
          padding: "12px 16px", marginBottom: 16,
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".6px", color: T.note, marginBottom: 5 }}>
            THE RULE
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.6 }}>{mod.rule}</div>
        </div>
      )}

      {mod.exp.split("\n\n").map((para, i) => (
        <p key={i} style={{ fontSize: 15, lineHeight: 1.75, marginTop: i === 0 ? 0 : 14, marginBottom: 0 }}>
          {para}
        </p>
      ))}

      {/* In the wild (Session 18) — where in Japan these characters are
          standing right now: shop shutters, ticket stock, queue signage.
          Observable claims only, no history — the scene idea applied to the
          streetscape. Piloted on Group 7; earlier groups backfill later. */}
      {mod.wild && (
        <div style={{
          background: T.noteBg, border: `1px solid ${T.note}44`, borderRadius: 6,
          padding: "12px 16px", marginTop: 18,
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".6px", color: T.note, marginBottom: 5 }}>
            IN THE WILD
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.7 }}>{mod.wild}</div>
        </div>
      )}

      {chars.length > 0 && (
        <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 12 }}>
          {chars.map((c) => {
            const k = K[c] || {};
            const parts = PARTS[c] || [];
            return (
              <div key={c} style={{
                background: T.sheet, border: `1px solid ${T.hairline}`, borderRadius: 6,
                padding: "14px 18px", display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap",
              }}>
                <button onClick={() => onTapChar(c)} title="Stroke order" style={{
                  fontFamily: T.jpFont, fontSize: 46, lineHeight: 1, background: "none",
                  border: "none", cursor: "pointer", color: T.ink, padding: 0,
                }}>{c}</button>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
                    <span style={{ fontSize: 16, fontWeight: 600 }}>{k.m}</span>
                    {known.includes(c) && <Chip color={T.ok}>learned</Chip>}
                  </div>
                  <div style={{ fontFamily: T.jpFont, fontSize: 14, color: T.sub, marginTop: 4 }}>
                    {k.on}{k.kun && k.kun !== "—" ? " · " + k.kun : ""}
                  </div>
                  {parts.length > 0 && (
                    <div style={{ fontSize: 13, color: T.sub, marginTop: 8 }}>
                      Built from {parts.map(partLabel).join(" + ")}
                    </div>
                  )}
                  {k.story && (
                    <p style={{ fontSize: 14, lineHeight: 1.6, marginTop: 8, marginBottom: 0 }}>{k.story}</p>
                  )}
                  {k.w && (
                    <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 4 }}>
                      {k.w.map(([jp, kana, en]) => (
                        <div key={jp} style={{ display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
                          <ruby style={{ fontFamily: T.jpFont, fontSize: 17 }}>
                            {jp}<rt style={{ fontSize: ".5em", color: T.sub }}>{kana}</rt>
                          </ruby>
                          <span style={{ fontSize: 13, color: T.sub }}>{en}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ————— Recall —————
// Meaning → character, four options. Distractors come from the lesson's own
// look-alikes first, so the test is discrimination rather than recognition.
function buildQuestions(chars) {
  const pool = Object.keys(K);
  return chars.map((c) => {
    const near = (K[c] && K[c].look) || [];
    const others = [...near, ...pool.filter((x) => x !== c && !near.includes(x))]
      .filter((x) => K[x]).slice(0, 40);
    const picks = [];
    for (const o of others) {
      if (picks.length >= 3) break;
      if (!picks.includes(o)) picks.push(o);
    }
    const options = [c, ...picks].sort(() => Math.random() - 0.5);
    return { c, prompt: K[c].m, options, answer: options.indexOf(c) };
  }).sort(() => Math.random() - 0.5);
}

function Recall({ mod, progress, onProgress }) {
  const chars = mod.chars || [];
  const [qs, setQs] = useState(() => buildQuestions(chars));
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);

  if (!chars.length) return <p style={{ fontSize: 14, color: T.sub }}>Nothing to recall in this lesson.</p>;
  const q = qs[i];
  const done = i >= qs.length;

  if (done) {
    return (
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <div style={{ fontSize: 15, marginBottom: 14 }}>
          {score === qs.length ? "All of them." : score >= qs.length - 1 ? "Nearly all of them." : "Worth another pass."}
        </div>
        <button className="btn-ghost" onClick={() => { setQs(buildQuestions(chars)); setI(0); setPicked(null); setScore(0); }}>
          Again
        </button>
      </div>
    );
  }

  const choose = (idx) => {
    if (picked !== null) return;
    setPicked(idx);
    const right = idx === q.answer;
    if (right) setScore((s) => s + 1);
    setTimeout(() => {
      setPicked(null);
      const next = i + 1;
      setI(next);
      if (next >= qs.length) {
        const prev = progress[mod.id] || {};
        const best = Math.max(prev.recallBest || 0, score + (right ? 1 : 0));
        onProgress({ ...progress, [mod.id]: { ...prev, recallBest: best, recallOf: qs.length } });
      }
    }, right ? 550 : 1300);
  };

  return (
    <div>
      <div style={{ height: 3, background: T.hairline, borderRadius: 999, marginBottom: 20, overflow: "hidden" }}>
        <div style={{ width: `${(i / qs.length) * 100}%`, height: "100%", background: T.ink, transition: "width .3s" }} />
      </div>
      <p style={{ fontSize: 13, color: T.sub, margin: "0 0 6px" }}>Which one means…</p>
      <div style={{ fontSize: 21, fontWeight: 600, marginBottom: 20 }}>{q.prompt}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(70px,1fr))", gap: 10 }}>
        {q.options.map((o, idx) => {
          const isAnswer = idx === q.answer;
          const show = picked !== null;
          return (
            <button key={o} onClick={() => choose(idx)} disabled={show} style={{
              fontFamily: T.jpFont, fontSize: 34, padding: "16px 0", borderRadius: 6, cursor: show ? "default" : "pointer",
              background: show && isAnswer ? "#EDF5EE" : show && idx === picked ? "#FDF1EF" : T.sheet,
              border: `1px solid ${show && isAnswer ? T.ok : show && idx === picked ? T.shu : T.hairline}`,
              color: T.ink,
            }}>{o}</button>
          );
        })}
      </div>
      {picked !== null && picked !== q.answer && (
        <p style={{ fontSize: 14, marginTop: 16, color: T.sub }}>
          <span style={{ fontFamily: T.jpFont, fontSize: 18, color: T.ink }}>{q.c}</span>
          {" — "}{K[q.c].m}. You picked{" "}
          <span style={{ fontFamily: T.jpFont, fontSize: 18 }}>{q.options[picked]}</span>
          {K[q.options[picked]] ? `, which is ${K[q.options[picked]].m}.` : "."}
        </p>
      )}
    </div>
  );
}

// ————— Use it —————
// Gated: only kanji flagged `sentence` and only once the learner has grammar
// behind them. The precise pattern-level gate needs the grammar module's current
// lesson ids — until those are wired in, this checks that grammar exists at all.
function UseIt({ mod, grammarDone }) {
  const chars = (mod.chars || []).filter((c) => K[c] && K[c].sentence);
  const [ch, setCh] = useState(chars[0] || null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState(null);
  const [err, setErr] = useState(null);
  const msg = useRotating(GRADING_MESSAGES, busy);

  if (!chars.length) {
    return (
      <p style={{ fontSize: 14, color: T.sub, lineHeight: 1.7 }}>
        Nothing in this lesson lands in a sentence yet. Some kanji — 川, 力, 七 — are worth
        knowing long before there is anything a beginner can build around them. The prompt
        appears on the ones that unlock a usable word.
      </p>
    );
  }
  if (!grammarDone) {
    return (
      <p style={{ fontSize: 14, color: T.sub, lineHeight: 1.7 }}>
        This opens once you have some grammar behind you. Writing a sentence with a kanji you
        have just met is worth a great deal — but only when the sentence around it is one you
        can already build. Come back after a few grammar lessons.
      </p>
    );
  }

  const grade = async () => {
    const s = text.trim();
    if (!s || busy) return;
    setBusy(true); setErr(null); setRes(null);
    try {
      setRes(await callClaude(SENTENCE_SYSTEM, `Target kanji: ${ch} (${K[ch].m}).\n\nLearner's sentence:\n${s}`));
    } catch {
      setErr("Couldn't reach the grader. Your sentence is still here — try again in a moment.");
    } finally { setBusy(false); }
  };

  return (
    <div>
      <p style={{ fontSize: 15, lineHeight: 1.7, marginTop: 0 }}>
        Write one sentence using this kanji. Anything at all — short is fine. Only two things
        get checked: whether the kanji is there and correct, and whether the sentence holds
        together. Everything else is left alone on purpose.
      </p>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "16px 0 12px" }}>
        {chars.map((c) => (
          <button key={c} onClick={() => { setCh(c); setRes(null); }} style={{
            fontFamily: T.jpFont, fontSize: 22, padding: "6px 12px", borderRadius: 4, cursor: "pointer",
            background: ch === c ? T.ink : T.sheet, color: ch === c ? T.paper : T.ink,
            border: `1px solid ${ch === c ? T.ink : T.hairline}`,
          }}>{c}</button>
        ))}
      </div>
      {ch && K[ch].w && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          {K[ch].w.map(([jp]) => (
            <button key={jp} className="btn-ghost" style={{ fontFamily: T.jpFont, fontSize: 15 }}
              onClick={() => setText((t) => t + jp)}>{jp}</button>
          ))}
        </div>
      )}
      <textarea
        value={text} onChange={(e) => setText(e.target.value.slice(0, 140))} rows={2}
        placeholder="ここに書いてください…"
        style={{
          width: "100%", boxSizing: "border-box", border: `1px solid ${T.hairline}`, borderRadius: 6,
          padding: 12, fontSize: 18, lineHeight: 1.8, fontFamily: T.jpFont, color: T.ink,
          resize: "vertical", background: T.paper,
        }}
      />
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10, flexWrap: "wrap" }}>
        <button className="btn-primary" onClick={grade} disabled={busy || !text.trim()}>
          {busy ? "Checking…" : "Check it"}
        </button>
        {busy && <span style={{ fontSize: 12, color: T.sub }}>{msg}</span>}
      </div>
      {err && <p style={{ fontSize: 13, color: T.shu, marginTop: 12 }}>{err}</p>}
      {res && (
        <div style={{ marginTop: 16, padding: "14px 18px", borderRadius: 6, background: T.sheet, border: `1px solid ${T.hairline}` }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
            <Chip color={res.used_kanji ? T.ok : T.note}>{res.used_kanji ? `${ch} used` : `${ch} missing`}</Chip>
            <Chip color={res.grammatical ? T.ok : T.note}>{res.grammatical ? "holds together" : "needs a fix"}</Chip>
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.65, margin: 0 }}>{res.feedback}</p>
        </div>
      )}
      <p style={{ fontSize: 12, color: T.sub, marginTop: 14 }}>
        Feedback is AI-generated and pending native-speaker review.
      </p>
    </div>
  );
}

// ————— Lesson —————
const TABS = [["learn","Learn"],["write","Write"],["recall","Recall"],["use","Use it"]];

function Lesson({ mod, known, progress, onProgress, onLearn, onBack, grammarDone }) {
  // ── Completion writes known-kanji-v1 ──────────────────────────────────────
  // Previously nothing did this except a button. A lesson is complete when every
  // character has been traced at least once AND recall has been attempted with a
  // passing score — the same test the lesson list uses to draw its tick, so the
  // tick and the unlock can never disagree.
  const lessonChars = mod.chars || [];
  useEffect(() => {
    if (!lessonChars.length) return;
    const p = progress[mod.id] || {};
    const tracedChars = new Set((p.traced || []).map((t) => String(t).split(":")[0]));
    const allTraced = lessonChars.every((c) => tracedChars.has(c));
    const recallPassed = p.recallBest != null && p.recallOf
      ? p.recallBest / p.recallOf >= 0.8
      : false;
    if (allTraced && recallPassed) {
      const unlearned = lessonChars.filter((c) => !known.includes(c));
      if (unlearned.length) onLearn(unlearned);
    }
  }, [progress, mod.id, known]);

  const [tab, setTab] = useState("learn");
  const [panel, setPanel] = useState(null);
  const [replay, setReplay] = useState(0);      // remounts StrokeView to replay
  const [writeFocus, setWriteFocus] = useState(null);
  const panelRef = useRef(null);

  // Bring the panel to the learner rather than making them hunt for it. Without
  // this the stroke animation plays off-screen and is over before they scroll
  // down, which reads as "it does not animate".
  useEffect(() => {
    if (panel && panelRef.current?.scrollIntoView) {
      panelRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [panel]);
  const chars = mod.chars || [];
  const allKnown = chars.length > 0 && chars.every((c) => known.includes(c));

  return (
    <div>
      <button className="btn-ghost" onClick={onBack} style={{ marginBottom: 16 }}>← All lessons</button>
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
        <KindBadge kind={mod.kind} />
        <h2 style={{ fontSize: 19, fontWeight: 600, margin: 0 }}>{mod.title}</h2>
      </div>
      <div style={{ height: 1, background: T.hairline, margin: "14px 0 18px" }} />

      {mod.kind !== "culture" && (
        <div style={{ display: "flex", gap: 4, marginBottom: 18, flexWrap: "wrap" }}>
          {TABS.map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              border: "none", borderBottom: `2px solid ${tab === id ? T.ink : "transparent"}`,
              background: "none", color: tab === id ? T.ink : T.sub, fontSize: 14,
              padding: "6px 12px", cursor: "pointer", fontFamily: "inherit",
            }}>{label}</button>
          ))}
        </div>
      )}

      {mod.kind === "culture" && (
        <div style={{ marginTop: 22, paddingTop: 16, borderTop: `1px solid ${T.hairline}` }}>
          {/* Culture lessons had no completion at all, so the list could never
              stop highlighting them and nothing recorded that they were read.
              One button, one flag. */}
          {(progress[mod.id] || {}).read ? (
            <p style={{ fontSize: 13, color: T.ok, margin: 0 }}>✓ Read</p>
          ) : (
            <button className="btn-primary" onClick={() => {
              const prev = progress[mod.id] || {};
              onProgress({ ...progress, [mod.id]: { ...prev, read: true } });
            }}>Got it!</button>
          )}
        </div>
      )}

      {(mod.kind === "culture" || tab === "learn") && (
        <>
          <Learn mod={mod} known={known} onTapChar={setPanel} />
          {panel && (
            <div ref={panelRef} style={{
              marginTop: 14, padding: 16, background: T.paper, border: `2px solid ${T.ink}`,
              borderRadius: 6, display: "flex", gap: 18, alignItems: "flex-start", flexWrap: "wrap",
            }}>
              {/* The panel used to render far below the character grid, so tapping
                  a kanji meant scrolling down to find it — and by the time you
                  arrived the stroke animation had already played and finished.
                  It looked static because you were late, not because it was
                  broken. Now it scrolls itself into view, replays on demand, and
                  offers the thing you actually wanted next: to try drawing it. */}
              <div>
                <StrokeView key={panel + replay} ch={panel} auto numbers />
                <button className="btn-ghost" style={{ marginTop: 6, width: "100%" }}
                        onClick={() => setReplay((n) => n + 1)}>↻ Watch again</button>
              </div>
              <div style={{ flex: 1, minWidth: 190 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: T.jpFont, fontSize: 30 }}>{panel}</span>
                  {K[panel] && <span style={{ fontSize: 14, color: T.sub }}>{K[panel].m}</span>}
                </div>
                {K[panel] && (K[panel].on || K[panel].kun) && (
                  <div style={{ fontSize: 13, color: T.sub, marginTop: 4 }}>
                    {K[panel].on && <span>音 {K[panel].on}</span>}
                    {K[panel].on && K[panel].kun && <span> · </span>}
                    {K[panel].kun && <span>訓 {K[panel].kun}</span>}
                  </div>
                )}
                <p style={{ fontSize: 13, color: T.sub, lineHeight: 1.6, marginTop: 10 }}>
                  Copy the sequence, not just the shape — stroke order is most of what
                  makes handwriting readable.
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
                  <button className="btn-primary" onClick={() => { setWriteFocus(panel); setTab("write"); }}>
                    Try drawing it
                  </button>
                  <button className="btn-ghost" onClick={() => setPanel(null)}>Close</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      {mod.kind !== "culture" && tab === "write" && (
        <StrokePractice chars={chars} modId={mod.id} progress={progress}
                        onProgress={onProgress} startCh={writeFocus} />
      )}
      {mod.kind !== "culture" && tab === "recall" && (
        <Recall mod={mod} progress={progress} onProgress={onProgress} />
      )}
      {mod.kind !== "culture" && tab === "use" && (
        <UseIt mod={mod} grammarDone={grammarDone} />
      )}

      {/* The manual "Add these to my syllabus" button is gone. It asked the
          learner to declare mastery before they had done anything, and it was
          also the only thing writing known-kanji-v1 — so the vocabulary module
          depended on a button most people would never press. Completion now
          does it: trace the characters, pass recall, and they are yours.

          The furigana control returns later as a culture lesson about taking
          the training wheels off, not as a button at the top of lesson one. */}
      {chars.length > 0 && (
        <div style={{ marginTop: 26, paddingTop: 18, borderTop: `1px solid ${T.hairline}` }}>
          {allKnown ? (
            <p style={{ fontSize: 13, color: T.ok, margin: 0 }}>
              ✓ These are yours. Words using them have appeared in Vocabulary, and
              they will lose their furigana as you keep meeting them.
            </p>
          ) : (
            <p style={{ fontSize: 13, color: T.sub, margin: 0 }}>
              Trace each character and pass Recall, and these become yours —
              no button to press.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ————— Root —————
// ————— First-clear timestamps (Session 11) —————
// Every save stamps any array element, object key, or newly-set field that has
// no stamp yet, under progress._firstAt. The then-vs-now moment
// (reward-system-design-v1.md) needs this history before Phase 0 recruiting;
// nothing reads it yet. Stamps equal to _stampEpoch predate stamping and mean
// "before we started counting". The "_" guard also skips _migratedV2.
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

export default function KanjiModule() {
  const [known, setKnown] = useState([]);
  const [progress, setProgress] = useState({});
  const [grammarDone, setGrammarDone] = useState(false);
  const [current, setCurrent] = useState(null);
  const [openGroups, setOpenGroups] = useState({ 0: true });
  const loaded = useRef(false);

  useEffect(() => {
    (async () => {
      const k = await loadJSON(KNOWN_KEY, []);
      setKnown(Array.isArray(k) ? k : []);
      const raw = await loadJSON(KEY, {});
      const migrated = migrateProgressV2(raw);
      if (migrated !== raw) await saveJSON(KEY, migrated);  // upgrade storage once
      setProgress(migrated);
      const g = await loadJSON(GRAMMAR_KEY, {});
      setGrammarDone(Object.keys(g || {}).length > 0);
      loaded.current = true;
    })();
  }, []);

  const updateProgress = (p) => { const s = stampFirsts(p); setProgress(s); if (loaded.current) saveJSON(KEY, s); };
  const learn = (chars) => {
    const next = [...known];
    chars.forEach((c) => { if (!next.includes(c)) next.push(c); });
    setKnown(next);
    if (loaded.current) saveJSON(KNOWN_KEY, next);
  };

  const mod = current ? MODULES.find((m) => m.id === current) : null;
  const lessonDone = (m) => {
    const p = progress[m.id];
    if (!m.chars) return false;
    if (!p) return false;
    // Same test the lesson itself uses to unlock characters, so a ticked lesson
    // and an unlocked character can never disagree. The old version accepted a
    // single traced stroke and any recall attempt at all, which is why lessons
    // looked finished while nothing had actually been learned.
    const traced = new Set((p.traced || []).map((t) => String(t).split(":")[0]));
    const allTraced = m.chars.every((c) => traced.has(c));
    const recallPassed = p.recallBest != null && p.recallOf ? p.recallBest / p.recallOf >= 0.8 : false;
    return allTraced && recallPassed;
  };
  const pct = coverageAtRank(known.length);

  return (
    <div style={{ minHeight: "100vh", background: T.paper, fontFamily: T.uiFont, color: T.ink }}>
      <style>{`
        .btn-primary { background: ${T.ink}; color: ${T.paper}; border: none; padding: 9px 20px;
          border-radius: 6px; font-size: 14px; cursor: pointer; font-family: inherit; }
        .btn-primary:disabled { opacity: .5; cursor: default; }
        .btn-ghost { background: none; border: 1px solid ${T.hairline}; color: ${T.sub};
          padding: 6px 12px; border-radius: 6px; font-size: 13px; cursor: pointer; font-family: inherit; }
        .btn-ghost:hover:not(:disabled) { color: ${T.ink}; border-color: #CFCDC4; }
        .btn-ghost:disabled { opacity: .45; cursor: default; }
        .row { display: flex; align-items: center; gap: 10px; width: 100%; text-align: left;
          background: ${T.sheet}; border: 1px solid ${T.hairline}; border-radius: 6px; padding: 10px 14px; cursor: pointer; font-family: inherit; }
        .row:hover { border-color: #CFCDC4; }
        .grouphead { display: flex; align-items: center; gap: 10px; width: 100%; text-align: left;
          background: none; border: none; cursor: pointer; font-family: inherit; padding: 0; }
        textarea:focus, input:focus, button:focus-visible, canvas:focus-visible {
          outline: 2px solid ${T.ai}; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
      `}</style>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px 80px" }}>
        <header style={{ marginBottom: 6 }}>
          <div style={{ fontSize: 20, fontWeight: 600 }}>Kanji</div>
          <div style={{ fontSize: 13, color: T.sub }}>Read it · write it · use it</div>
        </header>
        <div style={{ height: 1, background: T.hairline, margin: "18px 0 24px" }} />

        {mod ? (
          <Lesson
            mod={mod} known={known} progress={progress} onProgress={updateProgress}
            onLearn={learn} onBack={() => setCurrent(null)} grammarDone={grammarDone}
          />
        ) : (
          <div>
            {/* Coverage — a capability statement, not a workload count */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 26, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                  {Math.round(pct * 100)}%
                </span>
                <span style={{ fontSize: 13, color: T.sub }}>of the kanji in ordinary Japanese text</span>
              </div>
              <div style={{ height: 6, background: T.hairline, borderRadius: 999, overflow: "hidden" }}>
                <div style={{ width: `${pct * 100}%`, height: "100%", background: T.shu, transition: "width .5s ease" }} />
              </div>
            </div>

            {/* Legend above the list */}
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
              {KIND_ORDER.map((k) => (
                <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <KindBadge kind={k} size={10} />
                  <span style={{ fontSize: 12, color: T.sub }}>{KINDS[k].full}</span>
                </span>
              ))}
            </div>

            {/* The two intro lessons, pinned above the groups so they cannot be
                scrolled past, and HIGHLIGHTED until acknowledged. Furigana comes
                first: it is what the learner is looking at on every screen in
                this module, and nothing had ever explained it. Once both are
                marked "Got it!" the highlight drops and they read as ordinary
                lessons. */}
            {INTROS.map((m) => {
              const read = !!(progress[m.id] || {}).read;
              const blurb = m.id === "cc-furigana"
                ? "Start here — what those little kana above the characters are."
                : "Then this — why the order is what it is.";
              return (
                <button key={m.id} className="row" onClick={() => setCurrent(m.id)}
                        style={{
                          marginBottom: 10, alignItems: "flex-start",
                          background: read ? undefined : T.noteBg,
                          border: read ? undefined : `1px solid ${T.note}`,
                        }}>
                  <KindBadge kind="culture" />
                  <span style={{ flex: 1 }}>
                    <span style={{ display: "block", fontSize: 15, fontWeight: 600 }}>
                      {m.title}
                      {read && <span style={{ color: T.ok, marginLeft: 8, fontSize: 13 }}>✓</span>}
                    </span>
                    <span style={{ display: "block", fontSize: 13, color: read ? T.sub : T.note, marginTop: 2 }}>
                      {read ? "Read" : blurb}
                    </span>
                  </span>
                </button>
              );
            })}
            <div style={{ marginBottom: 22 }} />

            {GROUPED.map((g, gi) => {
              const open = !!openGroups[gi];
              const total = g.points.filter((p) => p.chars).length;
              const done = g.points.filter(lessonDone).length;
              return (
                <section key={g.title} style={{ marginBottom: 20 }}>
                  <button className="grouphead" onClick={() => setOpenGroups((o) => ({ ...o, [gi]: !o[gi] }))}>
                    <span style={{ fontSize: 12, color: T.sub, width: 12 }}>{open ? "▾" : "▸"}</span>
                    <span style={{ flex: 1 }}>
                      <span style={{ display: "block", fontSize: 15, fontWeight: 600 }}>{g.title}</span>
                      <span style={{ display: "block", fontSize: 12, color: T.sub, marginTop: 2 }}>{g.blurb}</span>
                    </span>
                    <span aria-hidden style={{ width: 54, height: 4, background: T.hairline, borderRadius: 999, overflow: "hidden", flexShrink: 0 }}>
                      <span style={{ display: "block", width: `${total ? (done/total)*100 : 0}%`, height: "100%", background: T.ok }} />
                    </span>
                  </button>
                  {open && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                      {g.points.map((p) => (
                        <button key={p.id} className="row" onClick={() => setCurrent(p.id)}>
                          <KindBadge kind={p.kind} />
                          <span style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ display: "block", fontSize: 14 }}>{p.title}</span>
                            {p.chars && (
                              <span style={{ display: "block", fontFamily: T.jpFont, fontSize: 15, color: T.sub, marginTop: 3 }}>
                                {p.chars.join(" ")}
                              </span>
                            )}
                          </span>
                          <span style={{ fontSize: 14, color: lessonDone(p) ? T.ok : T.hairline }}>
                            {lessonDone(p) ? "✓" : "○"}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </section>
              );
            })}

            <p style={{ fontSize: 12, color: T.sub, textAlign: "center", marginTop: 24, lineHeight: 1.7 }}>
              Order is provisional — it will be regenerated from a merged frequency list.
              Coverage is approximated from published data. Stroke data from KanjiVG (CC BY-SA 3.0).
              Content is AI-authored and pending native-speaker review.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
