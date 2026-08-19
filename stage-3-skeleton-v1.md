# Stage 3 skeleton — v1 (Session 17, planning pass; nothing authored)

*Follows `stage-2-skeleton-v1.md`. This is a plan for Lloyd to rule on, not content.
Existing Steps 24–26 are already authored and shipped; what is proposed here is
**additions and one restructure**, marked ➕ NEW and ⚠️ DECISION throughout.*

## Lloyd's brief (Session 17)

> Stage 3, with the keigo, needs a robust situation breakdown. We need the user to
> understand how much this part invades their lives, that it isn't just a rare occurrence.
> Phone calls, shops, doctor's offices — it needs a lesson for each part. First showing
> what they assumed they would hear, and then showing them what they will actually hear
> (行きます vs 参ります). This is especially important for the replacement words for go and
> come, which are now the same word. After the いただく lesson, put a CC in where that's
> what いただきます comes from. For the SB, make sure they understand the difference between
> when 敬語 are and when 謙譲語 or 尊敬語 are used.

Four asks: **situations**, **hear-first**, **the go/come collapse**, and **the taxonomy**.
Plus one Stage 2 insert.

## The thing that makes Stage 3 different

Stages 1 and 2 taught production. Keigo is **received long before it is produced** — a
learner will hear a thousand 参ります before they ever say one — and the existing Step 24
already says so (*"This step asks you to RECOGNIZE, not produce"*).

Lloyd's point sharpens that: the reason to teach it early is not politeness, it is
**comprehension**. A learner who knows 来ます and not 参ります does not hear a polite train
announcement. They hear an announcement they cannot parse, twice a day, for a year.

And the fact that reframes the whole stage:

> **The learner has been speaking keigo since Step 1.** です・ます *is* 丁寧語, which is one
> of the categories of 敬語. Stage 3 is not a new subject. It is the name for something
> they have been doing for twenty-three steps, plus two directions they have not met.

That belongs on the first page of the stage, because it converts keigo from a mountain
into a map — which is also the Session 17 tracker row on not discouraging new learners.

## ➕ The new lesson shape: HEAR-FIRST

Lloyd's *"what they assumed, then what they'll actually hear"* is a new arrangement of the
existing arc, not a new primitive. Mapped onto `lesson-arc-design-v1.md`:

| arc page | hear-first content |
|---|---|
| `setting` | the situation, and **the sentence the learner expects** — built from grammar they own |
| `ext₀` (flip) | **what is actually said**, same meaning, unrecognisable |
| `ext₁` (wrinkle) | why: which direction it is pointing, and who is being raised or lowered |

Worked, for the station:

> **setting** — You are on the platform and the announcement starts. You know this
> sentence. 電車が来ます. You have known it since Step 4.
> **ext₀** — What comes out of the speaker is 「まもなく電車が**参ります**」. Same train,
> same arriving, and not one word you were listening for.
> **ext₁** — 参る is the humble verb. The railway is lowering **its own train**, because
> the company is うち and you are the customer. The train is not being modest; the
> announcer is.

The `contrast` field already supports this — the expected form is `kind: "misfit"`
(perfectly good Japanese, wrong for this mouth), never `error`.

## ⚠️ DECISION 1 — where the situation lessons live

Lloyd wants a lesson per venue. Two ways to place them:

**Option A — a new step, `Step 26 · Keigo in the wild`**, pushing the existing Step 26 to
27. Cleanest pedagogically: hearing (24) → lowering (25) → **hearing it for real (26)** →
producing (27). Cost: renumbering touches `curriculum-order-v1.json`,
`curriculum-revisit-map-v1.md`, the arcs file, and any tracker row citing "Step 26".

**Option B — distribute them as `cc-*` lessons inside Steps 24 and 25.** No renumbering,
no downstream churn. Cost: five culture lessons inside two steps is a heavy load, and
Step 24 already carries `cc-baito`.

**Recommendation: A.** The situations are the point of the stage, not a garnish on it, and
burying them as culture stops inside a step called "Hearing keigo" understates exactly what
Lloyd is trying to correct. But the renumbering is real work and it is his call.

*The rest of this document assumes A, with new numbers in brackets.*

---

## Step 24 · Keigo is already everywhere *(retitled from "Hearing keigo")*

Bank unchanged: 先生, 社長, お客様, 店, 二階, お手洗い, 飲み物, 会議

| id | | status |
|---|---|---|
| ➕ `sb-keigo-what` | 敬語の地図 — what the word covers | **NEW — Lloyd's taxonomy ask** |
| `sonkeigo` | いらっしゃる・おっしゃる・召し上がる | shipped |
| ➕ `sb-ikukuru` | 行く・来る・いる → 一つ | **NEW — the collapse** |
| `gozaimasu` | ございます・〜でございます | shipped |
| `cc-baito` | バイト敬語 | shipped |

### ➕ `sb-keigo-what` — the taxonomy Lloyd asked for

**敬語 is the umbrella, not a third sibling.** This is the confusion to kill on sight:

- **丁寧語** — です・ます. Politeness aimed at the *listener*. **Step 1. You already own it.**
- **尊敬語** — raises the *other person's* action. Step 24.
- **謙譲語** — lowers *your own*. Step 25.

All three are 敬語. So the question is never "keigo or not" — it is **which direction**,
and the answer is decided by *whose action the verb describes*, not by how formal the room
feels.

**Sourced footnote worth carrying:** the Agency for Cultural Affairs' 敬語の指針
(Feb 2 2007, 平成19年) officially splits keigo into **five**: 尊敬語, 謙譲語Ⅰ, 謙譲語Ⅱ
(丁重語), 丁寧語, 美化語. The three-way split this app teaches is the practical
simplification, and saying so is more honest than pretending three is the whole truth.
⚠️ One search result mis-dated this as 2019 — it is 平成19年 = **2007**. Do not propagate.

### ➕ `sb-ikukuru` — the collapse (Lloyd flagged this specifically)

The single hardest recognition problem in the stage, because it runs **both directions at
once and merges verbs the learner has kept apart since Step 4**:

| plain | 尊敬語 (them, up) | 謙譲語 (you, down) |
|---|---|---|
| いる | **いらっしゃる** | おる |
| 行く | **いらっしゃる** | **参る** / 伺う |
| 来る | **いらっしゃる** | **参る** |

Three verbs → one going up. Two verbs → one coming down. So 先生はいらっしゃいますか is
*is the teacher in?* **or** *is the teacher coming?* — and only context separates them.

The learner's instinct will be that this is ambiguity to be fixed. It is not; it is
ambiguity native speakers live in comfortably, and the lesson has to say so rather than
imply a rule is missing.

---

## Step 25 · Lowering yourself — unchanged

`kenjougo`, `sb-uchisoto`. Both shipped. `sb-uchisoto` becomes load-bearing for the new
Step 26 — the train announcement, the phone call and the shop counter are all the same
うち/そと mechanism seen from three angles, and the situation lessons should point back at
it explicitly rather than re-teaching it.

---

## ➕ Step 26 · Keigo in the wild *(NEW — the situation breakdown)*

Every lesson here is **hear-first**. Each opens on the sentence the learner expects.

| id | venue | expected → actual | the point |
|---|---|---|---|
| `cc-densha` | station, train | 電車が来ます → **まもなく電車が参ります** | the company lowers its own train; うち includes the rolling stock |
| `cc-denwa` | the phone | 田中さんはいますか → **田中はおりません** | your own boss goes down, no さん — the うち freeze |
| `cc-mise2` | shop counter | いくらですか → **〜円でございます / 少々お待ちください** | the announcement register; distinct from `cc-konbini` (survival) and `cc-baito` (the wrong-but-universal) |
| `cc-byouin` | clinic | 名前を呼びます → **お名前をお呼びします / どうなさいましたか** | the productive お〜する pattern, met before Step 27 teaches it |
| `cc-yakusho` | city office | 書いてください → **お書きください / こちらにご記入ください** | closes the Stage 1 arc spine — the counter the learner has stood at since Step 0 |

**Five lessons, and that is deliberate breadth.** The brief is that keigo *invades* — one
example does not demonstrate invasion, five in five different rooms does.

⚠️ **Overlap to police:** `cc-konbini` (Step 8) and `cc-baito` (Step 24) already exist.
`cc-mise2` must be the *correct* department-store register, explicitly contrasted with
バイト敬語's contested forms — otherwise it repeats a lesson the learner has had twice.

---

## Step 27 · Producing politeness *(renumbered from 26)*

`okeigo`, `sb-keigo-map`, `b-keigo`. All shipped, all unchanged.

⚠️ **Note:** `cc-byouin` and `cc-yakusho` expose お〜する before this step formally teaches
it. That is correct for a recognition-first stage — but the Step 27 lesson should say
*"you have already heard this five times"* rather than introducing it cold.

## ⚠️ There is no Stage 3 checkpoint

Stage 1 closes on Checkpoint 3, Stage 2 on Checkpoint 6. **Stage 3 currently ends on
`b-keigo` with no review.** Either add `rc7` / Checkpoint 7, or decide deliberately that
the composition is the review. Flagging rather than deciding.

---

## ➕ Stage 2 insert — `cc-itadakimasu`

**⚠️ This is NOT a Stage 3 lesson.** `itadaku` lives in **Step 14** (Stage 2), so the CC
Lloyd asked for belongs there, immediately after it.

The grammar is uncontested and is the whole point: **いただきます is the ます-form of
いただく**, the humble verb for もらう — and the module's `itadaku` lesson already gestures
at this (*"you have been receiving the meal politely all along"*). The CC makes it a lesson.

### ⚠️ And the received explanation is contested — which is the best thing about it

The version that circulates in English — and in a lot of Japanese material — is that
いただきます thanks the *life of the ingredients*, or the farmer, or the cook. That is a
**modern gloss, not an etymology**, and it is publicly disputed by Japanese linguists;
Kondō Yasuhiro (近藤泰弘) has called the life-of-the-food and thanks-to-the-cook accounts
*かなり疑わしい* — quite doubtful.

The documented history is also messier and more interesting than the tidy story:

- the **verb** いただく is ancient — to receive something raised above the head
- as a **mealtime greeting**, the earliest citations are disputed: 1812 (*孝行導草*) in one
  source, **1934** per Japanese Wikipedia, and Kondō reports finding a **1917** (大正6年)
  primary-school text — which points at **schools spreading it in the modern era**, not at
  an ancient rite

This is the `cc-baito` shape exactly, and this project's best-performing move: state the
verifiable thing (it is the humble verb), and say plainly that the pretty story is a later
gloss whose dates do not agree.

**Reviewer note:** the dates conflict across sources and one of them is a linguist's post
rather than a paper. Do not assert a single first-attestation. The CC should say *the
citations disagree*, which is both true and more interesting than picking one.

---

## Open questions for Lloyd

1. **DECISION 1** — new Step 26 with renumbering (recommended), or `cc-*` inside 24/25?
2. **Five situations, or fewer?** Station and phone are non-negotiable; clinic, shop and
   city office are the ones to cut if five is too many.
3. **Stage 3 checkpoint** — add `rc7`, or let `b-keigo` close the stage?
4. **Does `sb-keigo-what` open the stage or open Step 24?** It reframes everything after
   it, which argues for making it the stage's first screen rather than a lesson inside it.
5. **美化語** (お茶, ご飯) — `cc-ogo` in Step 5 already teaches the polish prefixes without
   naming them as keigo. Retro-fit the name in `sb-keigo-what`, or leave it?

## Dependencies

- `sb-uchisoto` (Step 25) must precede all five situation lessons — every one of them is
  that axis in a different room.
- `cc-itadakimasu` depends only on `itadaku` (Step 14) and can be authored immediately.
- The arcs framework already supports hear-first with no schema change; `contrast.kind`
  is `misfit` for the expected-but-wrong-mouth form, never `error`.

## What is NOT in this plan

No new grammar. Every pattern Stage 3 needs is already authored — this is a plan about
**arrangement, recognition and coverage**, which is what Lloyd's brief actually asked for.
