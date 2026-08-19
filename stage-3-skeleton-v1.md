# Stage 3 skeleton — v3 (Session 17; **BUILT**)

*v1 proposed, v2 took Lloyd's five rulings, v3 records what shipped. Everything below is
now in `grammar-module.jsx` unless marked otherwise — commits `a8e4521` (renumber),
`f75ee9c` (lessons + checkpoint), `45bafe1` (arcs).*

## ✅ Built

| | |
|---|---|
| Renumber, Producing politeness → Step 27 | ✅ `a8e4521`, isolated commit |
| `sb-keigo-what` opening the stage | ✅ Step 24, first point |
| `sb-ikukuru` — the collapse | ✅ Step 24, after `sonkeigo` |
| Step 24 retitled *Keigo is already everywhere* | ✅ |
| **Step 26 · Keigo in the wild** — 8 situation lessons | ✅ all eight |
| **Checkpoint 7 · 聞き取り** — 8 recognition items | ✅ on the DEEP drill machinery |
| `cc-itadakimasu` → Step 14 | ✅ Stage 2, after `itadaku` |
| Arcs for all 8 Stage 3 points | ✅ **180/180 across all stages** |
| `cc-hogosha` (optional ninth) | ⬜ not built — Lloyd's call |

The module is now **35 steps, 245 lesson objects, 180 arcs, 549 pages**.

## Lloyd's brief (Session 17)

> Stage 3, with the keigo, needs a robust situation breakdown. We need the user to
> understand how much this part invades their lives, that it isn't just a rare occurrence.
> Phone calls, shops, doctor's offices — it needs a lesson for each part. First showing
> what they assumed they would hear, and then showing them what they will actually hear
> (行きます vs 参ります). This is especially important for the replacement words for go and
> come, which are now the same word.

Plus, on the venues: *"feel free to add places that make sense to a daily life encounter.
Include more social encounters as well, such as at a bar — this is where CC is really
good, because we can explain where they will encounter casual slang and shortcuts."*

## The two ideas the stage runs on

**One — they have been speaking keigo since Step 1.** です・ます *is* 丁寧語, a category of
敬語. Stage 3 is not a new subject; it is the name for something they have done for
twenty-three steps, plus two directions they have not met. This now **opens the stage**
(ruling 4), because it reframes everything after it.

**Two — the reason to teach it is comprehension, not politeness.** A learner who knows
来ます and not 参ります does not hear a polite train announcement. They hear an announcement
they cannot parse, twice a day, for a year. That is what "invades their lives" means in
practice, and it is why the stage's checkpoint is a **comprehension** check (ruling 3).

## The HEAR-FIRST lesson shape

Lloyd's *"what they assumed, then what they'll actually hear"* is a new arrangement of the
existing arc, not a new primitive:

| arc page | hear-first content |
|---|---|
| `setting` | the situation, and **the sentence the learner expects** — from grammar they own |
| `ext₀` (flip) | **what is actually said** — same meaning, unrecognisable |
| `ext₁` (wrinkle) | which direction it points, and who got raised or lowered |

`contrast.kind` is **`misfit`** for the expected form — perfectly good Japanese, wrong
mouth — and never `error`. No schema change needed.

---

## ➕ Stage opener · `sb-keigo-what` — 敬語の地図

**Ruling 4: this opens the stage, before Step 24.** It is the first screen of Stage 3.

**敬語 is the umbrella, not a third sibling.** The confusion to kill on sight:

- **丁寧語** — です・ます. Politeness aimed at the *listener*. **Step 1. Already owned.**
- **尊敬語** — raises the *other person's* action. Step 24.
- **謙譲語** — lowers *your own*. Step 25.
- **美化語** — お/ご on the noun itself. Step 5's `cc-ogo`, unnamed until now.

The question is never "keigo or not". It is **which direction**, decided by *whose action
the verb describes* — not by how formal the room feels.

**Sourced footnote:** the Agency for Cultural Affairs' 敬語の指針 (2 February **2007**,
平成19年) officially splits keigo into **five**: 尊敬語, 謙譲語Ⅰ, 謙譲語Ⅱ (丁重語), 丁寧語,
美化語. The map this app teaches is the practical simplification, and saying so is more
honest than implying four is the whole truth.
⚠️ A search result mis-dated this to 2019. 平成19年 = **2007**. Do not propagate.

### ➕ The 美化語 retro-fit (ruling 5)

Lloyd: *"Explain the new ones and show how the ones already encountered are common phrases
that found a life outside of keigo."* That is exactly right, and the sources make it **three
tiers rather than two**:

| tier | examples | can you strip the prefix? |
|---|---|---|
| **frozen** — it is just the word now | ご飯, お腹, お菓子 | no. 飯 is a different, rougher word |
| **live dial** — a real register choice | お水, お花, お名前, お荷物 | yes, and the register moves when you do |
| **marked** — reads as service-counter or affected | おビール, おソース | technically possible, not neutral |

The teaching line: **`cc-ogo` in Step 5 taught these as "the polish prefixes" without
naming them.** They were 美化語 all along — and the frozen tier is the interesting half,
because those words *escaped*. Nobody hears politeness in ご飯 any more; it stopped being
a dial and became vocabulary.

One clean rule worth carrying: **お goes on 和語, ご on 漢語, and loanwords take neither** —
×おコーヒー. Testable, and it explains the おビール oddity in one move.

---

## Step 24 · Keigo is already everywhere *(retitled from "Hearing keigo")*

| id | | status |
|---|---|---|
| `sonkeigo` | いらっしゃる・おっしゃる・召し上がる | shipped |
| ➕ `sb-ikukuru` | 行く・来る・いる → 一つ | **NEW — the collapse** |
| `gozaimasu` | ございます・〜でございます | shipped |
| `cc-baito` | バイト敬語 | shipped |

### ➕ `sb-ikukuru` — the collapse

The hardest recognition problem in the stage, because it runs **both directions at once**
and merges verbs kept apart since Step 4:

| plain | 尊敬語 (them, up) | 謙譲語 (you, down) |
|---|---|---|
| いる | **いらっしゃる** | おる |
| 行く | **いらっしゃる** | **参る** / 伺う |
| 来る | **いらっしゃる** | **参る** |

Three verbs → one going up. Two → one coming down. 先生はいらっしゃいますか is *is the
teacher in?* **or** *is the teacher coming?* — context alone separates them.

The learner's instinct is that this is ambiguity to be fixed. It is not. It is ambiguity
native speakers live in comfortably, and the lesson must say so rather than imply a missing
rule.

---

## Step 25 · Lowering yourself — unchanged

`kenjougo`, `sb-uchisoto`. Both shipped. `sb-uchisoto` is now **load-bearing for Step 26** —
the train, the phone and the counter are one mechanism in three rooms, and each situation
lesson should point back at it rather than re-teach it.

---

## ➕ Step 26 · Keigo in the wild — the situation breakdown

**Eight lessons, all hear-first, ordered by how often the learner meets them.** Ruling 2:
five was the floor, not the ceiling.

### Daily

| id | venue | expected → actual |
|---|---|---|
| `cc-densha` | station, train | 電車が来ます → **まもなく電車が参ります** |
| `cc-mise2` | shop floor, department store | いくらですか → **〜円でございます / 少々お待ちください** |

`cc-densha` is the flagship. The railway lowers **its own train**, because the company is
うち and the passenger is そと — the train is not being modest, the announcer is. And the
department-store lift says **上へ参ります**, which is the same verb again before the learner
has left the building.

### Weekly

| id | venue | expected → actual |
|---|---|---|
| `cc-denwa` | the telephone | 田中さんはいますか → **田中はおりません** |
| `cc-takuhai` | delivery, redelivery | 荷物が来ます → **お届けにあがりました / ご不在のため** |

`cc-denwa` is the うち freeze made concrete: your own boss goes down, loses his さん, and
the learner's instinct that this is rude is the lesson.

### Monthly, or when life requires it

| id | venue | expected → actual |
|---|---|---|
| `cc-byouin` | clinic, hospital | 名前を呼びます → **お名前をお呼びします / どうなさいましたか** |
| `cc-yakusho` | city office counter | 書いてください → **ご記入ください / お書きください** |
| `cc-ginkou` | bank, post office | 待ってください → **恐れ入りますが、少々お待ちください** |

`cc-yakusho` closes the Stage 1 arc spine — the counter the learner has stood at since
Step 0, now heard properly for the first time.

### ➕ Social — and the mirror of the whole stage

| id | venue | the point |
|---|---|---|
| `cc-nomikai` | izakaya, bar, the work drink | **keigo arrives from the staff and evaporates at the table** |

This is Lloyd's ask and it is the most valuable lesson in the step, because it is the only
one where the register **drops**. In one evening the learner has to run two registers at
once: いらっしゃいませ / お決まりでしょうか coming at them from the floor, and 〜っす,
とりあえず生, contractions and dropped particles across the table.

Content it should carry: **とりあえず生** (the opening move), **お通し** (the seated charge
that surprises every newcomer), **〜っす** as the compressed です, and the fact that the
person who was your section head at 六時 is on plain forms by 八時 and back to keigo on
Monday morning.

⚠️ **Overlap to police.** `cc-slang` (Step 9) already covers すごい → すげー and `cc-chau`
(Step 13) the て-form contractions. `cc-nomikai` must be about **the setting and the
switch**, not a second slang list — where those forms live, and how fast the altitude
changes in one room.

⚠️ **Also police:** `cc-konbini` (Step 8, survival) and `cc-baito` (Step 24, the
contested-but-universal forms). `cc-mise2` is the *correct* department-store register and
must be explicitly contrasted with both, or it is the third shop lesson in the course.

### Optional ninth, flagged not scheduled

`cc-hogosha` — parents' evening and school notices (ご父兄, お子さま, 保護者). Lloyd
teaches; this is either the most authentic lesson in the step or the one he is too close
to. **His call, not scheduled.**

---

## ➕ Checkpoint 7 · 聞き取り — the comprehension check (ruling 3)

**A new kind of checkpoint, and the reason it has to be new:** every previous checkpoint is
production — `b-*` compositions and `rc*` review challenges. Stage 3 is explicitly a
recognition stage, so a composition checkpoint would test the one thing the stage does not
claim to teach.

**Format — reuse the existing `drill` machinery** (`DEEP[id].drill`, with `q` / `a` /
`opts` / `why`). No new component required. Item types:

1. **Decode** — 「先生はいらっしゃいますか」 → which plain sentence? *(いますか / 行きますか
   / 来ますか — and the honest answer is that more than one fits, which is the point)*
2. **Direction** — 「田中はおりません」 → who is being lowered? *(the speaker's own side)*
3. **Aim check** — 「先生はおりますか」 → what is wrong here? *(a humble verb pointed at
   the teacher demotes them)*
4. **In the wild** — a real announcement or counter line, and: where would you hear this?
5. **Register switch** — the same request at three altitudes; place each one.

Placement: after Step 27, closing the stage. Item 1 is the one to author carefully —
`sb-ikukuru`'s ambiguity means several options are defensible, and the `why` must say so
rather than pretending one is uniquely right.

---

## Step 27 · Producing politeness *(renumbered from 26 — ruling 1)*

`okeigo`, `sb-keigo-map`, `b-keigo`. All shipped, all unchanged in content.

⚠️ Step 26's clinic, city-office and bank lessons expose お〜する **before** this step
teaches it. Correct for a recognition-first stage — but `okeigo` should open with *"you
have already heard this seven times"* rather than introducing it cold.

### ⚠️ The renumbering checklist (ruling 1 accepted, so this is real work)

Every place "Step 26" is asserted has to move:

- `grammar-module.jsx` — the `cat:` string on the step block
- `curriculum-order-v1.json` and `curriculum-order-report-v1.md`
- `curriculum-revisit-map-v1.md`
- `lesson-arcs-v1.json` — the `step` field on `okeigo`, `sb-keigo-map` *(check-arcs.py will
  FAIL on the mismatch, which is the safety net working)*
- `stage-2-skeleton-v1.md` — its "moved to open Stage 3" note
- any tracker row citing Step 26

**Do the renumber in one commit, alone, with `check-arcs.py` green before and after.**
Mixing it with content authoring is how a step number goes missing.

---

## Lloyd's rulings (Session 17 — all five answered)

1. **New Step 26, renumber Producing politeness to 27.** Agreed. Checklist above.
2. **Five was the floor.** Eight scheduled, spread across daily / weekly / monthly, plus
   the social one. `cc-hogosha` flagged as an optional ninth.
3. **Comprehension checkpoint — yes, definitely.** Checkpoint 7 · 聞き取り, spec above,
   reusing the drill machinery.
4. **`sb-keigo-what` opens the stage**, not Step 24.
5. **Retro-fit 美化語.** Name the new ones, and show that the already-met ones —
   ご飯, お腹, お菓子 — are phrases that found a life outside keigo and stopped being a dial.

## Dependencies

- `sb-keigo-what` before everything — it is the stage's opening screen.
- `sb-uchisoto` (Step 25) before all eight situation lessons.
- `cc-itadakimasu` → **Step 14, Stage 2** (see below); independent of this stage.
- Arcs framework needs no schema change for hear-first.

## ➕ Stage 2 insert — `cc-itadakimasu`

**Not a Stage 3 lesson.** `itadaku` is **Step 14**, so the CC belongs immediately after it.

The grammar is uncontested: **いただきます is the ます-form of いただく**, the humble verb
for もらう — and `itadaku` already gestures at it (*"you have been receiving the meal
politely all along"*).

**The received explanation is contested, which is the best thing about it.** The story that
circulates — that it thanks the *life* of the ingredients, or the farmer, or the cook — is
a **modern gloss, not an etymology**. Kondō Yasuhiro (近藤泰弘) has publicly called those
accounts *かなり疑わしい*. And the first-attestation dates disagree: **1812** (*孝行導草*)
in one source, **1934** per Japanese Wikipedia, and Kondō reports a **1917** (大正6年)
primary-school text — which points at schools spreading it in the modern era rather than at
an ancient rite.

`cc-baito` shape exactly. **Reviewer note: do not assert a single first attestation.** The
CC should say the citations disagree, which is true and more interesting than picking one.

## What is NOT in this plan

No new grammar. Every pattern Stage 3 needs is already authored. This is a plan about
**arrangement, recognition and coverage** — which is what the brief asked for.
