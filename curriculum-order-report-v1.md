# Curriculum order v1 — 2026-08-08

Grammar units, vocabulary introduction, and where both meet the kanji order. Measured against the live `grammar-module.jsx` and `kanji-order-v2.json`, not against the session notes — the notes have drifted.

## 0. What has already shipped since the notes were written

`stage-1-unit-breakdown-v1.md` reads as a proposal. Checked against the file, **most of it is already in place**:

| Proposal | Status in the live file |
|---|---|
| Split the 25-point Step 2 | ✅ Done — now Step 2 (10 pts) + Step 3 (15 pts) |
| Fill the three empty `requires` | ✅ Done — no build has an empty array |
| Split old Step 3 into three arcs | ❌ Not done — now Step 4, 18 points, 3 builds |
| Capability-first naming | ❌ Not done — names are still taxonomic |

So the remaining grammar work is two items, not a re-plan.

## 1. Grammar integrity

- Duplicate point ids: **none**
- `requires` naming a point that does not exist: **none**
- `requires` naming a point taught LATER: **none**
- Build lessons with an empty `requires`: **none**

126 points across 17 steps. The prerequisite graph is a clean DAG in file order, which is the property that makes the unit breakdown computable rather than hand-maintained.

## 2. Units, derived from the build seams

A unit is the run of points closing at a build lesson — the breakdown's own rule, applied to the file as it stands.

| # | Step | Points | Closes with |
|---:|---|---:|---|
| 1 | Step 0 · Before any Japanese | 2 | — |
| 2 | Step 1 · Your first sentences | 10 | introduce yourself |
| 3 | Step 2 · Core particles | 10 | four particles, one sentence |
| 4 | Step 3 · Joining, choosing & counting | 15 ⚠️ | join things up |
| 5 | Step 4 · Verbs: from dictionary form up | 7 | chain three actions |
| 6 | Step 4 · Verbs: from dictionary form up | 4 | describe a state |
| 7 | Step 4 · Verbs: from dictionary form up | 7 | describe a person |
| 8 | Checkpoint 1 | 2 | put yesterday together |
| 9 | Step 5 · Requests, permission & obligation | 7 | write the house rules |
| 10 | Step 6 · Invitations, desire & intention | 8 | state a plan |
| 11 | Step 7 · Linking actions & time | 9 | narrate a routine |
| 12 | Checkpoint 2 | 2 | make a plan with someone |
| 13 | Step 8 · Existence & possession | 6 | map a room |
| 14 | Step 9 · Adjectives & adverbs | 11 | sell me a place |
| 15 | Step 10 · Comparing & preferring | 9 | rank and prefer |
| 16 | Step 11 · Reasons, contrast & connectors | 10 | make your case |
| 17 | Step 12 · Past N5 · the shape-changers | 4 | explain how something works |
| 18 | Checkpoint 3 · Stage review | 2 | argue a preference |
| 19 | Stress test — first N4 lesson | 1 | — |

Units over twelve points: **1** — b-s2b

### The one structural change left: split Step 4

Step 4 carries 18 points and **three** build lessons, which is the file saying it is three units wearing one name. The seams are already authored; splitting at them costs no new content and lands at 7 / 4 / 7 — exactly the sizes the breakdown predicted before this file existed in its current form.

| New unit | Points | Closes with | Capability name |
|---|---:|---|---|
| 4a | 7 | `b-s3a` chain three actions | Put verbs in the past |
| 4b | 4 | `b-s3c` describe a state | Say what's going on right now |
| 4c | 7 | `b-s3b` describe a person | Describe with a whole clause |

**Authoring nit found while placing the seams:** `cc-teru` (the casual 〜てる contraction) sits *after* `b-s3c`, so a mechanical split files it under 4c. It is about 〜ている and belongs in 4b. Moving it makes the split 7 / 5 / 6, which is better balanced as well as better grouped.

## 3. Vocabulary — what the order actually is

The ledger holds **286** words. Only **93** are introduced anywhere; the remaining **193** are `KANJI_DICT` display entries and kanji-card samples — reachable and glossable, never taught. That gap is the finding. There is no missing *sequence*; there is a missing *syllabus*.

### 3a. Defect — the Step 2 split cloned its bank

**Step 2 · Core particles** and **Step 3 · Joining, choosing & counting** carry byte-identical banks:

> 公園、友達、図書館、学校、映画、朝ごはん、電車、駅

When Step 2 was split the points divided and the bank did not. Both halves now claim to introduce all eight words, so neither half's vocabulary is actually scoped, and the first-introduction map is ambiguous for eight of the 93 taught words. This is the highest-value fix in the document: it is small, it is unambiguous, and every downstream ordering reads through it.

### 3b. Recurrence — the gap Session 3 named, now measured

- Words appearing in more than one bank: **23 of 93**
- Of those, recurring **only** at a checkpoint: **13**

So recurrence is almost entirely an artefact of checkpoints re-listing their own step's words. Discounting the cloned Step 2/3 bank above, only a handful of words genuinely reappear in a later teaching step:

- 終わる: Step 7 → Step 12
- 時間: Step 11 → Step 12 → Checkpoint 3

This directly corrects an assumption carried in `word-kanji-scheduling-v1.md` §9 (*'a high-frequency word appears across many lessons, so it recurs without anything being scheduled'*). **It does not.** In this corpus a word is introduced once and, unless its checkpoint catches it, never returns. The retention dividend the note banked on is not there, so recurrence has to be scheduled after all.

### 3c. Words invisible to the ledger builder

`build-word-ledger.py` matches `bank:` only when `points:` follows it, so 6 words are silently absent from the ledger: かさ、全部、忘れる、最後まで、落とす、財布.

These are the N4 stress-test bank — arguably correct to exclude as out-of-stage, but it happens by regex accident rather than by decision, and the ledger reports 87 bank words where the file has 93.

## 4. Promotion queue — the genuinely orderable list

Dictionary-only words ranked for promotion into a lesson bank. Score is own-corpus demand (source count) plus bonuses for already appearing on a kanji card, for N5, and for being fully covered by the kanji syllabus. **No centrality division and no kanji gate** — word cost is flat, and gating words on kanji is the failure mode `word-kanji-scheduling-v1.md` §2 exists to prevent. Kanji coverage is a tie-breaker only, because it affects how the word *looks*, never whether it appears.

| # | Word | Reading | Meaning | Sources | Kanji covered | Plain at kanji # | Score |
|---:|---|---|---|---:|---|---|---:|
| 1 | 三時 | さんじ | three o'clock | 3 | 2/2 | #29 | 6.5 |
| 2 | 百円 | ひゃくえん | 100 yen | 3 | 2/2 | #38 | 6.5 |
| 3 | 一つ | ひとつ | one (thing) | 2 | 1/1 | #1 | 5.5 |
| 4 | 七時 | しちじ | seven o'clock | 2 | 2/2 | #43 | 5.5 |
| 5 | 三年 | さんねん | three years | 2 | 2/2 | #40 | 5.5 |
| 6 | 上手 | じょうず | good at | 3 | 2/2 | ⚠ jukujikun | 5.5 |
| 7 | 二つ | ふたつ | two (things) | 2 | 1/1 | #2 | 5.5 |
| 8 | 今 | いま | now | 2 | 1/1 | #26 | 5.5 |
| 9 | 休み | やすみ | holiday; rest | 2 | 1/1 | #61 | 5.5 |
| 10 | 何 | なに | what | 2 | 1/1 | #50 | 5.5 |
| 11 | 千円 | せんえん | 1000 yen | 2 | 2/2 | #44 | 5.5 |
| 12 | 好き | すき | liked; to like | 2 | 1/1 | #39 | 5.5 |
| 13 | 手 | て | hand | 2 | 1/1 | #28 | 5.5 |
| 14 | 日本 | にほん | Japan | 3 | 2/2 | ⚠ jukujikun | 5.5 |
| 15 | 母 | はは | my mother | 2 | 1/1 | #51 | 5.5 |
| 16 | 田中 | たなか | Tanaka (name) | 2 | 2/2 | #19 | 5.5 |
| 17 | 私 | わたし | I | 2 | 1/1 | #58 | 5.5 |
| 18 | 一人 | ひとり | one person; alone | 2 | 2/2 | ⚠ jukujikun | 4.5 |
| 19 | 下手 | へた | bad at | 2 | 2/2 | ⚠ jukujikun | 4.5 |
| 20 | 先週 | せんしゅう | last week | 2 | 1/2 | never in Stage 1 | 4.5 |
| 21 | 十日 | とおか | the 10th; ten days | 2 | 2/2 | #5 | 4.5 |
| 22 | 月曜日 | げつようび | Monday | 2 | 2/3 | never in Stage 1 | 4.5 |
| 23 | 来週 | らいしゅう | next week | 2 | 1/2 | never in Stage 1 | 4.5 |
| 24 | 火曜日 | かようび | Tuesday | 2 | 2/3 | never in Stage 1 | 4.5 |
| 25 | 町 | まち | town | 2 | 1/1 | #48 | 4.5 |
| 26 | 電話 | でんわ | telephone | 2 | 1/2 | never in Stage 1 | 4.5 |
| 27 | 上 | うえ | above | 1 | 1/1 | #30 | 3.5 |
| 28 | 中 | なか | inside | 1 | 1/1 | #19 | 3.5 |
| 29 | 休む | やすむ | to rest | 1 | 1/1 | #61 | 3.5 |
| 30 | 何時 | なんじ | what time | 1 | 2/2 | #50 | 3.5 |

## 5. Where the three orders meet — rendering over time

For each taught word, the kanji-order position at which it stops needing furigana. This is the promotion event from `word-kanji-scheduling-v1.md` §2, made concrete.

### ⚠️ First, a correction — composition does not always hold

The **Kanji display pipeline** tracker row (Jul 28 2026) records a limitation that has never been implemented, and every figure in this section originally ignored it:

> **Jukujikun break composition entirely** — 今日 きょう, 大人 おとな, 昨日 きのう, 一人 ひとり. The reading does not decompose across characters; both kanji may be known while the word is unreadable by composition.

The row calls for a hand-maintained exception list where the word carries its own unsplittable reading. **That list still does not exist.** This pipeline now seeds it (12 entries) and excludes those words from the composition arithmetic rather than reporting a promotion position that would never fire.

It matters most in the promotion queue below, where four of the original top ten — 上手 じょうず, 日本 にほん, 一人 ひとり, 下手 へた — were scored as fully kanji-covered and therefore ready. Knowing 上 and 手 does not let a learner read じょうず. They now carry a ⚠ and lose the coverage bonus.

- Taught words that are kana-only and always render plain: **5**
- Taught words that **never** render plain inside the 63-character syllabus: **67**

Those words keep furigana for the whole of Stage 1:

> お茶、一緒に、仕事、会う、会議、作る、使う、全部、公園、写真、写真を撮る、冬、前、勉強する、友達、図書館、夏、安い、宿題、寒い、寝る、帰る、広い、座る、待つ、忘れる、忙しい、思う、急ぐ、手を洗う、散歩する、新しい、映画、昼ごはん、暑い、最後まで、朝ごはん、机、果物、歌、歯をみがく、毎日、犬、猫、痛い、窓、簡単、終わる、落とす、薬を飲む、財布、買う、起きる、遅れる、部屋、野菜、銀行、開ける、雨が降る、電気、電車、静か、面白い、音楽、頭、駅、高い

This is working as designed — §2 says kanji state changes how a word looks, never whether it appears — but it is worth seeing the size of it. Roughly 72% of the taught vocabulary is still ruby-annotated at the end of Stage 1, which sets the honest expectation for how much of the 'quietly stops needing ruby' moment the learner actually gets.

Promotion events by kanji-order decile — where the re-render moments cluster:

| Kanji positions | Words promoted |
|---|---:|
| #11–#20 | 3 |
| #21–#30 | 2 |
| #31–#40 | 4 |
| #41–#50 | 4 |
| #51–#60 | 5 |
| #61–#70 | 1 |

Only **19** of the 93 taught words get a promotion event at all, and they do not cluster at the front — 5 land in the first thirty characters and the rest are spread through the tail. The demand term front-loads the *characters*, but a word needs **every** one of its characters, so a word's promotion is governed by its latest character, not its earliest. That is worth stating plainly because it is the opposite of what the ordering rationale implies, and it means the re-render moment is a rarer event than `word-kanji-scheduling-v1.md` §2 assumes when it calls it 'a genuine product moment'. It is still worth building — but on this syllabus it fires 19 times, not continuously.

### The expansion queue this implies — and why it does not work

v1's expansion queue ranked untaught characters by demand across the whole 286-word ledger. The sharper question is which untaught character would move the most **taught** words from furigana to plain. Asked that way, the answer is uncomfortable:

| Untaught kanji | Taught words still blocked | Words |
|---|---:|---|
| 会 | 2 | 会う、会議 |
| 写 | 2 | 写真を撮る、写真 |
| 真 | 2 | 写真を撮る、写真 |
| 部 | 2 | 部屋、全部 |
| 電 | 2 | 電車、電気 |
| 事 | 1 | 仕事 |
| 仕 | 1 | 仕事 |
| 作 | 1 | 作る |
| 使 | 1 | 使う |
| 全 | 1 | 全部 |

**No character unlocks more than two words, and 79 of the 84 unlock exactly one.** The distribution is flat — there is no high-leverage pick, and ranking the queue barely matters because every entry is worth about the same.

Worse, clearing furigana from all 67 blocked words would take **84 new characters** — the syllabus would have to grow from 64 to 148, and 20 of those words need two or three of them before anything visible happens.

**This is the finding that should change a plan.** The promotion event — a finishing kanji reaching back to re-render a word the learner already knows — is described in `word-kanji-scheduling-v1.md` §2 as the payoff of the whole scheduling model. On the current syllabus it fires nineteen times in Stage 1 and then stops, because the vocabulary is written with a long flat tail of characters that each appear once. The model is not wrong; the expectation set on it is. Either the kanji syllabus expands far past 63 to chase it, or the promotion event is repositioned as a pleasant occasional surprise rather than a core mechanic. That is a product decision, and it should be made deliberately rather than discovered after the feature is built.

