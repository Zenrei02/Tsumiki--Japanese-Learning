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
const PARTS = {"一":[],"二":[],"三":[{"e":"一"}],"川":[],"十":[],"七":[{"e":"一"},{"e":"乙"}],"土":[],"小":[],"水":[],"日":[],"月":[],"田":[],"目":[],"口":[],"四":[{"e":"囗"},{"e":"儿","orig":"八"}],"国":[{"e":"囗"},{"e":"玉"}],"人":[],"入":[],"八":[],"大":[],"中":[{"e":"口"},{"e":"丨"}],"車":[],"女":[],"子":[],"母":[{"e":"毋"}],"本":[{"e":"木"}],"木":[],"火":[],"山":[],"上":[{"e":"卜"},{"e":"一"}],"下":[{"e":"一"},{"e":"卜"}],"力":[],"男":[{"e":"田"},{"e":"力"}],"休":[{"e":"亻","orig":"人"},{"e":"木"}],"林":[{"e":"木"}],"森":[{"e":"木"},{"e":"林"}],"好":[{"e":"女"},{"e":"子"}],"明":[{"e":"日"},{"e":"月"}],"町":[{"e":"田"},{"e":"丁"}],"白":[{"e":"日"}],"百":[{"e":"一"},{"e":"白"}],"千":[{"e":"丿"},{"e":"十"}],"円":[{"e":"冂"}],"手":[],"生":[],"先":[{"e":"儿","orig":"八"}],"学":[{"e":"子"}],"校":[{"e":"木"},{"e":"交"}],"年":[{"e":"丿"},{"e":"干"}],"今":[{"e":"人"}],"分":[{"e":"八"},{"e":"刀"}],"見":[{"e":"目"},{"e":"儿"}],"行":[{"e":"彳"}],"来":[{"e":"米"}],"食":[],"気":[{"e":"气"},{"e":"乂"}],"天":[{"e":"一"},{"e":"大"}],"雨":[],"私":[{"e":"禾"},{"e":"厶"}],"何":[{"e":"亻","orig":"人"},{"e":"可"}],"時":[{"e":"日"},{"e":"寺"}],"間":[{"e":"門"},{"e":"日"}],"言":[],"話":[{"e":"言"},{"e":"舌"}]};

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

  const updateProgress = (p) => { setProgress(p); if (loaded.current) saveJSON(KEY, p); };
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
