# Stage 2 skeleton — v1.1 (Session 14, planning pass; nothing authored)

**Status: APPROVED by Lloyd with one amendment (Session 14).** His ruling:
keigo proper moves OUT of Stage 2 to the beginning of Stage 3, spaced across
several steps — N3 is where it's tested, and it carries the feeling of another
language, which is daunting at the second stage ("it was for me"). Everything
else approved as drafted, including the authoring order 14 → 15 → 16.

This is the planning pass Session 13 named as Stage 2's opening move: the step
structure decided against the N4 grammar inventory BEFORE authoring, with the
revisit-map obligations placed and every reserved lesson given an id so later
sessions collide with nothing. No module edits ship with this document.

Sources consulted, per standing practice: `curriculum-revisit-map-v1.md` (the
Stage 2 obligations), `cc-sb-candidates-v1.md` (the blocked そう triangle),
the live Step 13 group in `grammar-module.jsx`, and the Stage 2 tracker row.

## Ground rules carried from Stage 1

- **Steps are functional themes**, not form lists — "what can you do now,"
  never "here are ten endings."
- **Weave, don't append**: sb- lands the moment its prerequisites finish, cc-
  where the social fact bites, one b- composition closes every step, rc-
  checkpoints every four steps. Marker script for Stage 2 is kana (LEVELS).
- **Authored deep from day one.** Stage 1 was written shallow and deepened in
  Session 14; Stage 2 lessons ship WITH their DEEP entry (walkthrough + drill)
  in the same commit. `author-deep-content.py` already verifies them.
- **Ids are reserved here** so parallel sessions and the tracker can refer to
  lessons that don't exist yet. Revisits take separate ids, are ungated, and
  first-contact lessons say the topic returns (all Session 13 decisions).
- **After any authoring session**: ledger loop (`build-word-ledger.py`), and
  new example vocabulary flows to the kanji demand table as usual.
- **The counts rule** holds: no lesson counts in learner-facing copy; step
  taglines state capability.

## The shape at a glance

Step 13 (live) grows two points; ten new steps follow, 14 → 23; three new
checkpoints (rc4 after 16, rc5 after 20, rc6 = the Stage 2 stage review).
Keigo proper is NOT in this stage — it opens Stage 3, spaced out (see the
on-ramp sketch below); Stage 2's only taste of it is Step 14's giving verbs.
Estimated total ≈ 95–105 points against the ~130 ballpark — the difference is
deliberate headroom: N4 fringe items (〜ば〜ほど, 〜まま, 場合) are parked in a
holding pen rather than forced into steps, and Lloyd's brief-driven additions
always find room.

---

## Step 13 · て-form, second wind (LIVE — grows by two)

Has: teshimau, teoku, tearu, cc-chau, sb-aspect, cc-drop, cc-aizuchi,
cc-ritual. Gaps: the two everyday て-continuations that complete the family,
and no composition.

| id | jp | one line |
|---|---|---|
| `temiru` | 〜てみる | try doing — do it and see |
| `teikutekuru` | 〜ていく・〜てくる | change moving away from now, and toward it |
| `b-s13` | 作文 · きのうのしっぱい | a small failure story: てしまった, ておいた, てみた |

sb-aspect's covers extend to temiru/teikutekuru? **No** — keep sb-aspect's
four-way contrast intact; the new pair gets its own watch fields instead.

## Step 14 · Giving, receiving & kindness

The revisit map's R1 obligation. Stage 1's ageru taught the perspective
triangle on objects; this step runs the same triangle on ACTIONS, then adds
the up/down forms.

| id | jp | one line |
|---|---|---|
| `teageru` | 〜てあげる・〜てくれる・〜てもらう | favors, seen from each end |
| `ageru2` | あげる・くれる・もらう · 二回目 | REVISIT — が…くれる ↔ に…もらう, the same event twice |
| `itadaku` | いただく・くださる・さしあげる | the giving verbs, up and down |
| `tehoshii` | 〜てほしい | wanting someone else to do it |
| `sb-kuremorau` | くれる vs もらう | one kindness, two sentences — who is the subject? |
| `cc-favor` | お願い and the weight of favors | why asking is heavier here, and how てくれる thanks |
| `b-s14` | 作文 · 親切 | a kindness given and one received, both directions marked |

Rationale: early in the stage because favor-language saturates daily speech and
every later composition wants it. R1's regression note pins to ageru2.

## Step 15 · Guessing, seeming & hearsay

The evidence-marking family — how sure you are, and how you know.

| id | jp | one line |
|---|---|---|
| `kamo` | 〜かもしれません | might be — the honest maybe |
| `hazu` | 〜はずです | should be — expectation with reasons |
| `youda` | 〜ようです・みたいです | seems so — judged from what you see |
| `rashii` | 〜らしい | apparently — secondhand seeming |
| `souda-mite` | 〜そうです（様子） | looks about to — read off the surface |
| `souda-denbun` | 〜そうです（伝聞） | I hear that — plain form + そうです |
| `sb-sou` | 降りそう・降るそう・そうですね | **the blocked flag SHIPS HERE** — three shapes, three meanings; links back to cc-yes |
| `cc-hedge` | 断定しない | why Japanese rounds certainty down — hedging as good manners |
| `b-s15` | 作文 · うわさ | report something heard, guess something seen |

Rationale: cc-sb-candidates item 1 requires the そう parents and the SB to
ship together — this step is built around that pairing.

## Step 16 · The four ifs (fulfills tara's promise)

Stage 1's tara lesson carries an honesty flag pointing exactly here.

| id | jp | one line |
|---|---|---|
| `ba` | 〜ば | the logical if — condition as equation |
| `nara` | 〜なら | the topical if — "if that's the situation…" |
| `taradou` | 〜たらどうですか | advice wearing an if |
| `sb-if4` | たら・と・ば・なら | REVISIT-completer — the four-way contrast the map demands; updates tara's flag |
| `b-s16` | 作文 · アドバイス | give a friend advice: one condition, one suggestion |

Small step on purpose: the four-way SB is the heaviest judgment lesson in the
stage and deserves undivided attention. The tara spotlight row in the revisit
map ("〜たら / 〜ば / 〜と / 〜なら") finds its home lesson here.

## — rc4 · 復習 · Steps 13–16 —

## Step 17 · Intentions, decisions & change

| id | jp | one line |
|---|---|---|
| `you-vol` | 〜よう（意向形） | the let's/shall-I form, plain |
| `youtoomou` | 〜ようと思っています | forming a plan out loud |
| `kotonisuru` | 〜ことにする | deciding it — the choice is yours |
| `kotoninaru` | 〜ことになる | it's been decided — the choice wasn't |
| `yotei` | 〜予定です | on the schedule |
| `youninaru` | 〜ようになる | change arrives — you can now, you do now |
| `younisuru` | 〜ようにする | steering yourself — the standing effort |
| `sb-suru-naru` | する系 vs なる系 | the agency thread: ことにする/ことになる, ようにする/ようになる as ONE system (echoes Step 9's く/にする・なる) |
| `b-s17` | 作文 · 来年 | next year: a decision, a plan, a habit you're building |

## Step 18 · Ability, experience & degrees

| id | jp | one line |
|---|---|---|
| `kotogadekiru` | 〜ことができる | ability, formal shape — and why 話せる usually wins |
| `takotogaaru` | 〜たことがある | ever done it — experience as grammar |
| `kotogaaru` | 〜ことがある | sometimes happens |
| `sugiru` | 〜すぎる | too much — the overdose suffix |
| `yasui-nikui` | 〜やすい・〜にくい | easy-to, hard-to |
| `teiru3` | 〜ている · 三回目 | REVISIT — the map's watch item: state vs progressive decided by verb class |
| `potential2` | 可能形 · 二回目 | **RESERVED, BLOCKED on R6** — が/を with potentials; ships only with the reviewer's ruling, and SYSTEM_PROMPT moves in the same commit |
| `b-s18` | 作文 · できること | what you can do now that you couldn't — たことがある + ようになりました |

Rationale: teiru3 sits where verb breadth finally exists; potential2 is the
sb-ganotwo resolution's home if R6 says the lesson must soften.

## Step 19 · Time's edges

| id | jp | one line |
|---|---|---|
| `aida` | 〜間・〜間に | during vs at-some-point-during |
| `madeni` | 〜までに | by — the deadline まで isn't |
| `tokoro` | 〜るところ・〜ているところ・〜たところ | about to, in the middle of, just did |
| `bakari` | 〜たばかり | fresh off it — and why it differs from たところ |
| `naide` | 〜ないで（〜ずに） | without doing — the missing accompaniment |
| `sb-madeni` | まで vs までに | until vs by — small particle, missed deadline |
| `b-s19` | 作文 · いそがしい日 | a busy day told at its edges: deadlines, durings, just-finisheds |

## Step 20 · Doing to & being done to

| id | jp | one line |
|---|---|---|
| `saseru` | 〜させる | the causative — making and letting |
| `saserareru` | 〜させられる | the causative-passive — made to, and feeling it |
| `meirei` | 命令形・〜な | the bare command — recognize always, produce rarely |
| `nasai` | 〜なさい | the parent-and-teacher imperative |
| `sb-rareru` | られる collision | passive, potential, honorific — one shape, three readings; 見られる decided by context |
| `cc-meirei` | 命令はどこにいる | where commands actually live: signs, sports, anime — and why speech avoids them |
| `b-s20` | 作文 · 子どものとき | childhood: what you were made to do, let do, told to do |

Rationale: passive shipped in Stage 1's Step 12, so the causative family
completes the voice system here; sb-rareru untangles the collision that
potential (S1) and passive (S1) have been quietly building toward.

## — rc5 · 復習 · Steps 17–20 —

## Step 21 · Reasons, concessions & flow

| id | jp | one line |
|---|---|---|
| `shi` | 〜し | reasons that stack — and imply more |
| `noni` | 〜のに | although — expectation betrayed, feeling included |
| `temo` | 〜ても | even if — concession without the sting |
| `sorede` | それで・それに・だから | the paragraph connectors, upgraded from でも/それから |
| `sb-noni` | のに vs ても vs が | three concessions, three temperatures |
| `b-s21` | 作文 · ざんねんな話 | a disappointment: stacked reasons, one のに |

## ~~Step 22 · Politeness, up and down~~ → MOVED to open Stage 3 (Lloyd, Session 14)

Keigo re-frames everything before it and reads like a second language — too
much weight for the second stage, and N3 is where it's tested. It opens
Stage 3 instead, SPACED OUT rather than compressed into one step. The
reserved ids travel with it. On-ramp sketch (to be properly planned when
Stage 3's skeleton is drawn — parked here so the shape isn't lost):

- **S3 opening step A · Hearing keigo** — recognition only: `sonkeigo`
  (いらっしゃる, おっしゃる, 召し上がる, ご覧になる as things said TO you),
  `gozaimasu` (the shop floor), `cc-baito` (バイト敬語 — technically wrong,
  universally heard). No production asked.
- **S3 opening step B · Lowering yourself** — `kenjougo` (おる, 申す, いたす,
  拝見する), `sb-uchisoto` (the axis that picks the verb — cc-family's
  instinct, now grammar; its "much later" pointer lands here).
- **S3 opening step C · Producing politeness** — `okeigo` (お〜になる・お〜する,
  the productive patterns), `sb-keigo-map` (one exchange, three renderings),
  `b-keigo` (作文 · メール — one request, properly dressed).

Stage 2 keeps exactly one taste: Step 14's giving verbs (いただく・くださる・
さしあげる), which the revisit map's R1 obligation pins there regardless —
they now double as Stage 3's seed, and Step 14's copy should say so.

## Step 22 · Wrapping thoughts (embedding & nominalizing)

| id | jp | one line |
|---|---|---|
| `kadouka` | 〜かどうか | whether or not — a question boxed inside a sentence |
| `ka-embed` | 疑問詞＋か | I don't know where/when/who — the embedded question |
| `koto-no` | こと vs の | the two nominalizers — where each lives (nogasuki's forward pointer lands) |
| `toiuimi` | 〜という意味 | asking what things mean — metalanguage for learners |
| `sb-kotono` | ことか、のか | the choice drill: 見ることが好き? 見るのが好き? verbs of sense vs abstraction |
| `b-s22` | 作文 · わからないこと | write about not-knowing: two embedded questions, one かどうか |

## Step 23 · Other minds

tai's Stage 1 wrinkle ("Japanese marks other minds differently — Stage 2 has
the machinery") is the doorway.

| id | jp | one line |
|---|---|---|
| `garu` | 〜がる・〜たがる | showing signs of wanting — what you can honestly say about others |
| `hoshigaru` | ほしがる | the noun-want, other-minds edition |
| `sb-minds` | 私は嬉しい、彼は嬉しがっている | the my-mind/your-mind line English never draws |
| `cc-honne` | 本音と建前 | the two truths — named honestly, without cynicism |
| `b-s23` | 作文 · ともだち | describe a friend: what they seem to feel, want, be about to do — the whole evidence system in one portrait |

Rationale: closes the stage on the theme Stage 2 quietly builds throughout —
what you can claim about the world versus about other people — so the stage
review reads as one idea completing.

## — rc6 · 復習 · Stage 2 (the stage review) —

Covers: every sb- above plus the load-bearing grammar (teageru family, the
four ifs, causative family, evidence markers, the giving verbs).

---

## Holding pen (N4-fringe, deliberately unplaced)

〜ば〜ほど, 〜まま, 〜場合は, 〜ずつ, 〜とおりに, 〜つづける/はじめる/おわる
as a compound-verb lesson, 〜でも (example-giving), embedded 〜と伝える. Each
is real N4-adjacent material; none earns a slot until a step has a reason to
hold it. The challenge's multi-tier and Lloyd's briefs will surface which of
these are actually missed.

## Dependencies & standing blocks

- **`sb-sou` ships only with `souda-mite` + `souda-denbun`** (its own flag's
  condition). cc-yes already forward-points at the triangle.
- **`potential2` blocked on R6**; if R6 rules the other way, the slot becomes
  a no-op and sb-ganotwo's freeze simply lifts. Either way lesson + checker
  move in one commit.
- **tara's honesty flag** gets updated (not removed) by sb-if4: the flag
  promised the set completes; the completing lesson should say it kept the
  promise.
- Stage 1 attach-point flags (とき tense drill, compliment deflection) remain
  Stage 1 queue items in cc-sb-candidates — not Stage 2 work.
- LEVELS S2 tagline currently says "Full curriculum coming after Stage 1
  validation" — rewrite when the first new step lands.

## Lloyd's rulings (Session 14 — all five questions answered)

1. **Step order** — approved as drafted. Hard edges that remain: 15 before
   sb-sou's dependents; 14 before the Stage 3 keigo arc; 16 after Stage 1's
   tara (given).
2. **Keigo** — MOVED to open Stage 3, spaced out (see the struck section
   above). His reasons: N3 is where it's tested, and it has the feeling of
   another language — daunting at the second stage.
3. **Step 13's two additions** — approved; the live step may grow.
4. **Checkpoint cadence** — approved (rc4 / rc5 / rc6).
5. **Authoring order** — approved: 14 → 15 → 16 first, then 17–20, then
   21–23.
