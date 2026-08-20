# Reviewer content batches — v1, 2026-08-13

The unreviewed AI-authored inventory grew a lot in Session 13 (47 kanji, 4
grammar lessons). Per Lloyd: split it into batches the reviewer can take one
at a time. Each batch is sized to be finishable in one sitting, states exactly
what to check, and can be sent independently — a batch's verdicts are useful
even if the next batch waits a month.

Master lists live on two tracker rows ("Reviewer pass on kanji module content"
carries every claim by risk level; "Revisit map" carries the grammar items).
This file is the sending order and the per-batch scope, nothing more.

**Not in any batch here:** the sb-ganotwo / R6 question (が with potentials).
Already with the reviewer via reviewer-followup-2026-08-12.md, and it blocks
curriculum + SYSTEM_PROMPT edits — it stays first in line wherever it is.

## Recommended order

E → B → C → D → A. E is smallest and unblocks grammar authoring; B–D are the
new kanji in teaching order (verdicts on early groups matter to more learners
sooner); A is legacy phrasing that has already survived two sessions of use.

---

## Batch E — grammar copy from the revisit pass (smallest; ~20 sentences)

Where: grammar-module.jsx — sb-nide2, sb-pronouns2, sb-transitive2,
sb-kanaparticles, plus the tara watch addition.

1. **sb-nide2's core claim**: あります meaning "is held / takes place" puts で
   on the place — 明日、学校でパーティーがあります. Is the example natural,
   and is the rule stated tightly enough?
2. **sb-pronouns2 / E12 alignment**: 私が好きなスポーツはテニスです presented
   as fully natural; "inside a describing clause the subject takes が, never
   は" — confirm the never.
3. **sb-kanaparticles**: the IME claims (type ha for は, wo for を) and the
   はなはきれいです double-reading example.
4. **tara flag**: the four-ifs sentence — accurate as stated?
5. Carried from Session 7, never sent: the two UniDic-flagged readings in
   vocab-notes (お茶 multi-token; 言う ゆう-vs-いう).
6. **Added later in Session 13** (commit f38af96): sb-no's claim that の
   never attaches describing-words (きれいの人 wrong — any counterexamples
   worth teaching?); cc-n's 学生なんです な-insertion rule; cc-nakya's
   clipped forms and registers; sb-must's two-slot claim (なければ・ないと・
   なきゃ × なりません・いけません・だめ — "most combinations work"; confirm
   which don't); Step 13: てある with transitive + が stated hard,
   窓が開いてある called an error, ちゃいました described as
   polite-in-shape-casual-at-heart, 合格してしまいました reads as regret.
7. **The nine shipped queue lessons** (commit f886fb6): sb-yone's claim
   that 疲れていますよ is presumptuous; sb-counters' shift set
   (いっぽん・にほん・さんぼん・ろっぽん) and the "wrong counter understood,
   missing counter broken" claim; sb-kosoado's "それ even in their hands at
   distance" framing; cc-family's full humble/honorific sets and the
   お母さん-to-a-stranger judgment; cc-ogo's お/ご native-vs-Sino split
   (known to have exceptions — how should the lesson hedge?) and the
   fossilized list; cc-kedo's けど-request register claims; cc-drop's
   "が and に mostly stay" generalization; cc-aizuchi's はい-means-go-on
   and the meetings warning; cc-ritual's よろしくお願いします gloss and
   いただきます-even-alone claim.
8. **cc-yes** (Step 1): the はい/ええ/うん register ladder; そうですね as
   thinking-time; echo-the-predicate as "the most native yes"; and the
   negative-question claim (はい agrees with the negative) — state of the
   art says this is right but usage wobbles in real speech; how hard
   should the lesson state it?
9. **sb-negq + cc-no** (commit pending): sb-negq's "both systems agree on
   positive questions" framing and the skip-the-particle escape-hatch
   advice ("native speakers do this constantly" — confirm); cc-no's
   readings of ちょっと…/難しいですね/考えておきます/また今度 as
   refusals — the register judgments here are the most culture-loaded
   claims in the module and deserve the reviewer's closest read; also the
   recommended response そうですか、また今度ぜひ.
10. **sb-suruverbs** (Step 4, added Aug 15 2026 by the weekly audit — the
    noun+する gap `curriculum-gap-audit.py` had reported since Session 9).
    Four claims worth a native read, in descending risk:
    - **The を alternation.** The lesson says 勉強をする is *not an error* —
      it "loosens the compound back into 'do studying', and it is slightly
      heavier" — but that 日本語を勉強をする is wrong "because a clause takes
      one を". Is the double-を rule safe to state that hard, and is the
      register/nuance description of 勉強をする right?
    - **The potential.** States する's potential is できる, "not される".
      Confirm there is no context at N5–N4 where a learner would meet
      される as the potential rather than the passive.
    - **Productivity.** "Most two-kanji activity words work this way, so
      every noun of that shape you learn is quietly also a verb" — this is
      deliberately a generalisation. How should it hedge? Counterexamples
      a beginner would actually hit are the useful answer.
    - **来る's stems.** きます/きた/きて/こない presented as the trap being
      the sound moving under a fixed kanji. Accurate and worth the emphasis?
    Also: the lesson is in **rc1's `covers`**, so its claims can surface in
    Checkpoint 1 quiz generation — a wrong claim here reaches further than
    a lesson body alone.

## Batch F — the Steps 5–11 scaffolding pass (44 lessons, one sitting if skimmed)

Where: grammar-module.jsx — every former one-line lesson in Steps 5–11,
rewritten four-beat with an added third example (commit pending). The
structures were already reviewed as stubs; what needs native eyes is the
new prose's judgment calls:

- Register/social claims: たい・ほしい third-person restriction and the
  superior-prying caution (何を食べたいですか); 上手 deflection exchange
  (いえいえ、まだまだです); きらい "lands hard", polite dislike via あまり;
  下手 bluntness; ぜんぜん+positive described as common-but-slangy;
  なんで/どうして/なぜ register ladder; preamble-が (すみませんが) framing;
  知りません-about-a-person "sounds cold".
- Grammar rules stated hard: あとで always takes た, 前に always takes
  dictionary; ながら same-subject only, main action last; たり…たりする's
  mandatory する; とき relative tense (the two-cities bag example);
  雨なので never 雨だので; 何か vs 何を question-type split.
- All 44 added third examples, most of them Q&A pairs — natural as
  dialogue?

## Batch B — kanji Group 3, 17 characters (五六九会電開買作文使書朝起帰週毎曜)

Where: kanji-module.jsx k-t9…k-t13, sb-gate, cp-day + K entries.

- Flat claims to verify: 電 "originally meant lightning"; 曜 luminaries → day
  names; 買 net-over-貝, shells-as-money.
- Framings to sanity-check: 朝 (picture-not-history), 会 (family resemblance
  only), 帰 ("parts do not tell an honest story" — is that fair?), 毎
  (deliberately anti-etymology).
- Readings: 九時 くじ; 何曜日 gloss; all kun splits in the 17 K entries.
- The three stroke-rule lines (machine-checked against KanjiVG path order;
  needs a human eye once).

## Batch C — kanji Group 4, 14 characters (名前語高安新広思待始終飲茶歩)

Where: k-t14…k-t17, sb-tera, cp-desc + K entries.

- Hedged stories: 名 (evening+mouth), 安 (roof account — also judge the TONE),
  新 (axe), 思 (skull-not-field double claim), 終 (thread+winter as image).
- sb-tera's aggregate claim: left-names-topic / right-carries-sound is "the
  pattern most kanji are built on" — check the phrasing strength.
- ⚠️ The 時 DISCREPANCY now has three voices (old temple story, Tail 1
  sound-carrier, sb-tera sound-carrier). **Rule on it in this batch** — one
  account survives and the loser gets edited out everywhere.
- Readings: さんぽ rendaku note; 始 kun split; 茶 チャ・サ.

## Batch D — kanji Group 5, 16 characters (聞物写真勉強意味寒暑忙痛寝洗歯散)

Where: k-t18…k-t21, sb-gate2, cp-feel + K entries.

- Stories: 物 ox-radical (hedged), 忙 heart+亡 (hedged), 寝 bed-and-broom
  (explicitly loose), 歯 picture claim, 真 "true-copy" word-coinage claim,
  意 = 音+心 gloss.
- Readings: 聞く hear/ask double duty; **果物 くだもの — jukujikun**, feeds
  the exception-list row; 真ん中 まんなか; 得意 とくい.
- Consistency: k-t20 repeats sb-orthography's 暑い/熱い example — if either
  text changes, both must.

## Batch A — legacy items (Sessions 3–10; survived use, lowest urgency)

- Session 10 list: 先生 "born before", 行 crossroads, 私 禾+厶, 力 flexed arm,
  the eight tail-group texts.
- katakana-vocab-v1.json: 16 readings/glosses (dictionary facts, derived).
- The kana H-series factual fix from audit-2026-08-08.md (two particles, not
  three) — a two-line edit awaiting sign-off.

---

Bookkeeping when a batch comes back: verdicts land on the relevant tracker
row, edits go into the module masters (whole-file deliverables), and anything
that changes a story shared between two texts gets both texts in one commit.

## Batch G — the Session 14 deep-lesson pass (largest; sample, don't read all)

Where: grammar-module.jsx, the DEEP block (108 entries: every Stage 1 grammar
point's walkthrough + drills, every Stage 1 skill builder's drills).

What's in it, by risk:

1. **~560 drill items** — fill-in-the-blank sentences with one keyed answer
   each. Highest-risk property: a DISTRACTOR that is actually also correct in
   context (the English context line is meant to force uniqueness — check it
   does). Mechanically verified already: answers appear among options, blanks
   present, no verification of *linguistic* correctness.
2. **~80 example segmentations** — each lesson's first example glossed element
   by element. Segment boundaries are mechanical (concat equals the sentence);
   the GLOSSES are AI-authored claims about what each element does.
3. **Wrinkle examples** — new sentences beyond the reviewed example set
   (e.g. 毎日七時に起きます, 雨に降られました, 日本に来る前に…勉強しました).
4. **Two lesson upgrades** — niiku and deshou went from one-line to four-beat
   this pass; their new prose is unreviewed.

Sampling guidance: the conjugation pools (masu, te, ta-plain, mashita,
potential, nakereba) are formulaic — spot-check a few per pool. The judgment
drills (sb-yone, sb-negq, node-vs-kara, sb-register, jouzu's 得意 item,
cc-adjacent register claims) deserve the closest read; they encode social
rules, the module's most culture-loaded territory.

Not in this batch: the review-challenge UI copy (English chrome), and
sb-ganotwo (still no drill — frozen on R6, deliberately).

## Batch H — Stage 2 Step 14, giving & receiving (small; read all of it)

Where: grammar-module.jsx — the "Step 14 · Giving, receiving & kindness"
group (teageru, ageru2, itadaku, tehoshii, sb-kuremorau, cc-favor, b-s14)
plus their DEEP walkthroughs and ~28 drill items. Authored Session 14,
deep-from-day-one — first content produced under the new process.

By risk, highest first:

1. **cc-favor's cultural claims** — favor-accounting, お返し, the two-thanks
   custom (この間はありがとうございました), お土産 framing, "refusing repayment
   can be unkind." The most culture-loaded copy since cc-no; closest read.
2. **Register judgments** — てあげる "sounds like presenting a bill" aimed at
   the listener; さしあげる "rare and easily servile"; いただきます glossed as
   the same verb as いただく.
3. **The frame pedagogy** — ageru2/sb-kuremorau teach くれる vs もらう as
   "who is the sentence about"; confirm no drill item admits both answers.
4. **Drill distractors** — same check as Batch G: no distractor also correct
   in context.

Batch H addendum — Step 15, guessing & hearsay (Session 14, same sitting):
kamo, hazu, youda, rashii, souda-mite, souda-denbun, sb-sou, cc-hedge,
b-s15 + DEEP entries (~31 drill items). Closest-read items: cc-hedge's
cultural framing of hedging and the 違うかもしれませんが… pushback claim;
the certainty-dial ordering (です > でしょう > かもしれません) stated as
teaching fact; らしい's two-jobs treatment; every そう drill distractor
(the triangle is exactly where a defensible-but-different answer hides).

Batch H addendum 2 — Step 16, the four ifs + rc4 (Session 14, same
sitting): ba, nara, taradou, sb-if4, b-s16 + DEEP (~22 drill items).
Closest-read items: the four-way claims in sb-if4 (especially "と never
precedes a request" and "only なら points backward" stated as hard walls);
ば's "requests sound stiff unless the condition is a state" nuance;
なら-vs-たら in the 京都 drill items, where a defensible-other-answer is
likeliest.

Batch H addendum 3 — Steps 13 (completion), 17–23 and rc4–rc6 (Session 14,
the finishing run): ~34 new lessons + DEEP entries (~160 drill items across
the additions). Closest-read items, in order: cc-honne (本音と建前 — the
single most culture-loaded lesson in the module; read every sentence),
cc-meirei (the register claims about commands and anime-Japanese),
kotoninaru's modesty claim (結婚することになりました as standard), sb-minds'
epistemology framing, garu/hoshigaru's particle-swap rule (が→を), teiru3's
verb-class rule and its 知っています examples, the ら抜き treatment in
sb-rareru, and every judgment call in sb-noni's temperature system. The
conjugation pools (volitional, causative, ば) are formulaic — spot-check.

## Batch I — the Stage 3 keigo on-ramp (Session 15)

Steps 24–26: sonkeigo, gozaimasu, cc-baito, kenjougo, sb-uchisoto, okeigo,
sb-keigo-map, b-keigo + DEEP entries (~30 drill items). AI-authored, native
eye required — keigo is the register where a small wrongness costs the most.

Closest-read items, in order:

1. **cc-baito** — the most culture-loaded copy in the batch: the four set
   pieces quoted as counter-standard, the "prescriptively wrong, universally
   heard" framing, and the footnote claiming linguists dispute the wrongness.
   Read every sentence; this lesson makes claims about real workplaces.
2. **sb-uchisoto's receptionist rule** — 田中はただいま外出しております
   (own boss, no さん, humble verb, to a caller) stated as standard practice;
   and the 母/お母さん drill claims.
3. **Register verdicts in drills** — several drills mark a grammatical form
   as the wrong ANSWER on register grounds alone (いません at the company
   phone, あります from hotel staff, plain 来る to a friend as the only
   natural altitude). Confirm each verdict; these are judgment calls, not
   grammar.
4. **The maps stated as fact** — いらっしゃる covering 行く・来る・いる;
   伺う vs 参る's toward-you distinction; 二重敬語 flagged on ご覧になられる;
   お/ご distribution (お+stem vs ご+kanji-compound) with its exceptions
   unmentioned at this level.
5. **b-keigo's email formula** — opening/name/request/bow presented as
   sufficient; お世話になっております gated on "if there's history."

Recognition-only framing (Step 24 asks no production) is a pedagogy choice,
not a language claim — flag only if the drills leak production anyway.

Batch I addendum — kanji Group 6, School days (Session 15): 17 characters
(友達昨夏音楽果机映画部屋問宿題図館), four lessons + sb-saku + cp-school.
Story-field claims by risk, same frame as the Groups 1–5 items on the
etymology row:

1. **Stated flat and checkable**: 音 as tongue-with-a-mark; 楽 as drum with
   bells on a stand; 画 as bounded drawing / hand drawing a boundary;
   部's ⻏ glossed as "a town squeezed to a ribbon"; 館's 官 as "official
   hall that fed its guests."
2. **Whole-word readings named in lessons**: 昨日=きのう and 果物=くだもの
   (both routed toward the jukujikun exception-list row), 部屋=へや with
   the claim "the や is 屋's own; the へ is the word's" — verify that
   framing is defensible.
3. **sb-saku's phonetic claim**: 乍 as a さく sound-carrier across 作/昨,
   presented as reliable; and the promise "unread characters start
   half-pronouncing themselves."
4. **Deliberately loose, framed as such**: 夏 (picture-not-history), 達's
   delivery stack, 友's two hands, 宿's hundred travelers, 図's sealed
   territory. Confirm the looseness reads as honest, not sloppy.
5. **Readings**: 楽's ガク/ラク split tied to meaning; 図's ズ・ト; 問題/質問
   glosses. The reverse-payoff teaching order (音 taught after its user 意)
   is a sequencing choice, not a claim — flag only if the lesson copy
   confuses.

## Batch O — the Stage 9/10 culture connections (Session 17)

Seven lessons, authored to close the gap in `sb-cc-placement-review-v1.md`: Stage 9
had **no** culture lessons at all across 36 teaching points, and Stage 10 only the two
adverb-gathering ones. Every lesson here carries an arc (situation → line → wrinkle), and
every claim is either sourced in `lesson-arcs-v1.json` or flagged there as unsourced.

**Read `cc-aimai` first, and read it closely.** It is the highest-risk lesson in the app
outside the keigo stage.

| id | step | subject |
|---|---|---|
| `cc-aimai` | 31 | Refusing without いいえ — ちょっと…, 難しい, 考えておきます, and わけではない |
| `cc-keiji` | 30 | 回覧板 — the folder that comes to your door, and the particles on the sheet |
| `cc-manga` | 32 | Compound verbs in the wild, and where reading for pleasure starts |
| `cc-aisatsu2` | 34 | おかげさまで, お疲れさま, 失礼します — the set phrases opened up |
| `cc-news` | 36 | How a headline is built — no verb, へ for future, か for unconfirmed, 割 |
| `cc-shikata` | 38 | 仕方がない, and the argument about what it means |
| `cc-nengajou` | 42 | 年賀状, お中元/お歳暮, 忘年会, お盆 — the year's deadlines |

### What to check, by risk

1. **⚠️ `cc-aimai` — the framing, not the facts.** The topic (how Japanese speakers say
   no) is the most stereotyped in the field. The lesson is deliberately written about
   REGISTER AND MARKERS rather than national character, and it argues against the
   stereotype in its own text — twice, explicitly. The question for you is whether that
   lands, or whether it still reads as another foreigner explaining Japanese indirectness.
   If it reads wrong, say so bluntly; this one is better cut than shipped half-right.
   Specific items: is 「明日はちょっと…」 fairly described as a *complete* refusal? Is
   「難しいですね」 fairly described as meaning no rather than meaning difficult? Is the
   claim that directness is rising among younger speakers one you'd stand behind?

2. **⚠️ `cc-shikata` — the balance.** Same shape as `cc-baito`: the received cultural
   reading is stated *as* a received reading, and a narrower defensible claim is stated
   separately. Is the balance right? Is the "absolution rather than resignation" reading
   of しょうがないよ fair?

3. **`cc-aisatsu2` — the ご苦労さま warning.** The lesson says ご苦労さまです points
   downward and is a real error aimed upward. Confirm that is still true and still worth
   flagging as strongly as it is.

4. **`cc-manga` — the furigana convention.** Stated as 少年/少女 lines commonly carry
   furigana and 青年/女性 lines frequently do not. Stated as a tendency, not a rule —
   confirm it is put fairly.

5. **`cc-news` — the headline rules.** へ for a forthcoming event, か for the unconfirmed,
   割 for proportions, と for findings. Checkable against any front page; confirm nothing
   is overstated.

6. **`cc-keiji` and `cc-nengajou` — the facts are sourced, the practice is not.** The
   Tokyo digital-回覧板 subsidy and the 年賀状 print-run figures carry citations in the
   arcs file. What needs your eye is the *practice* around them: is the stamp-and-pass-on
   description of a 回覧板 right? Is 寒中見舞い after the 7th the normal repair for a
   missed card? Is the December cut-off described correctly?

7. **Register throughout.** These are culture lessons, so several of them quote speech.
   Anything that sounds like a textbook rather than a person is worth marking.

## Batch P — the two early-stage skill builders (Session 17)

Small, and lower risk than the culture batches — these are grammar claims rather than
claims about what a room sounds like. Two lessons, both closing gaps named in
`sb-cc-placement-review-v1.md`.

| id | step | gap it closes |
|---|---|---|
| `sb-junjo` | 7 · Linking actions & time | 8 teaching points, no builder and no culture stop — the only step in Stages 1–4 with neither. Five ways to relate two actions in time and nothing sorting them. |
| `sb-keiyoushi` | 9 · Adjectives & adverbs | 9 teaching points and no builder, the largest builder-free step in the course. Six of those lessons depend on the い/な split and nothing states it as a system. |

### What to check

1. **`sb-junjo` — two rules stated absolutely.** The lesson says まえに **never** takes
   past tense (寝るまえに, however long ago), and that ながら requires a **single subject**
   for both actions, with 〜ている間に for two people. Both are put as hard rules rather
   than tendencies. Confirm that is fair, or tell us where the edges are.

2. **`sb-keiyoushi` — the exception list.** きれい, 嫌い, 有名, 元気 are given as
   な-adjectives that end in い, presented as a short learned set with no predictive rule.
   Is that the right list to hand a learner at this point? Is anything important missing,
   or anything in it that would be better left until later?

3. **`sb-keiyoushi` — the error it targets.** 高いでした is called the commonest early
   error in the course. Worth a sanity check that it is the one to lead with rather than,
   say, the negative forms.

4. **Both — the drills.** Same check as batches G and H: no distractor should also be
   correct, and the `why` line should explain rather than restate.

5. **Register.** Both are Stage 1–4 lessons, so everything should be plain です・ます and
   the examples should be things a learner at that point could actually say.

Batch P addendum — `cc-chien`, Step 19 · Time's edges (Session 17, same sitting).
The last item from `sb-cc-placement-review-v1.md`. A late train, and the 遅延証明書
that follows it.

The **mechanism is sourced** from operators' own pages (JR East, Toei, Kintetsu,
Hanshin) and cited in `lesson-arcs-v1.json`: roughly five minutes triggers one,
they are handed out at gates and posted online for about 45 days, Kintetsu rounds
to five-minute units and certifies anything past an hour as 「61分以上」. Those
facts should need no checking, only confirmation that nothing is overstated.

Two things do need your eye:

1. **The social reading, which is the whole lesson.** Operators state that the
   certificate attests the maximum delay on a LINE and TIME BAND — not your train,
   and not that you were on it. The lesson draws from that the conclusion that the
   paper is not evidence at all but a device for letting both sides stop
   discussing the matter. That interpretation is the author's. If it is wrong, or
   if it is right but reads as cynical, say so.

2. **The punctuality caveat.** The lesson explicitly declines the
   Japan-is-a-punctual-culture generalisation and substitutes a narrower claim:
   that in workplaces and schools lateness is treated as requiring an account, and
   a standard form exists for giving one. Is the narrower claim fair? Does the
   refusal read as honest, or as hedging?
