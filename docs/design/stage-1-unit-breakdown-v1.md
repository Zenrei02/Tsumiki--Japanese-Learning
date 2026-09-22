# Stage 1 — unit breakdown v1

Curriculum · proposal, not applied. Measured against `CURRICULUM` in `n5-practice.jsx` as of Jul 31 2026.

---

## The finding that changes the question

You asked about breaking Stages into smaller pieces. **The pieces already exist.** Stage 1 is
twelve Steps plus three Checkpoints, and eighteen `build` lessons sit at the seams between them.

More usefully: the build lessons carry a `requires: [...]` array naming the points they draw on.
That makes the seams **machine-readable rather than implied**. A unit is definable as "the points
between one build and the next," and the data to do it is already in the file.

So this isn't new architecture. Three real problems remain:

1. **The Steps are wildly uneven** — 25 points at the widest, 4 at the narrowest.
2. **Step is not what the learner identifies with.** Stage is the headline; Step is the thing that
   actually holds a coherent arc. That is backwards for a progress signal.
3. **Three builds declare no prerequisites at all**, so the seam data breaks exactly where the
   curriculum is thinnest.

---

## Measured sizes

| Step | Points | Builds | Notes |
|---|---:|---:|---|
| 0 · Before any Japanese | 2 | 0 | Prologue, not a unit |
| 1 · Your first sentences | 10 | 1 | Well-sized |
| **2 · Core particles** | **25** | **2** | **Largest by far, and early** |
| 3 · Verbs: dictionary form up | 18 | 3 | Three arcs in one name |
| Checkpoint 1 | 2 | 1 | |
| 4 · Requests, permission & obligation | 7 | 1 | `requires` empty |
| 5 · Invitations, desire & intention | 8 | 1 | `requires` empty |
| 6 · Linking actions & time | 9 | 1 | `requires` empty |
| Checkpoint 2 | 2 | 1 | |
| 7 · Existence & possession | 6 | 1 | |
| 8 · Adjectives & adverbs | 11 | 1 | |
| 9 · Comparing & preferring | 9 | 1 | |
| 10 · Reasons, contrast & connectors | 10 | 1 | |
| 11 · Past N5 · the shape-changers | 4 | 1 | Smallest real unit |
| Checkpoint 3 | 2 | 1 | |

**Step 2 is the problem.** Twenty-five points, no checkpoint, and it lands second — precisely where
a beginner's commitment is least established. It already contains two builds, which is the file
telling you it is two units wearing one name.

Steps 4–6 are the opposite: pure grammar runs with no `skill` or `culture` lessons at all, where
Steps 2 and 3 carry four and five skill lessons respectively. That region was built fastest and it
shows in the scaffolding as well as in the missing `requires`.

---

## Proposed units

Split at the builds that already exist. Names are capability-first — what the learner can do when
they finish — so that completing a unit means something on its own rather than administratively.

| # | Name | Was | Pts | Closes with |
|---|---|---|---:|---|
| — | Before any Japanese | Step 0 | 2 | *(prologue)* |
| 1 | Say what things are | Step 1 | 10 | introduce yourself |
| 2 | Mark who does what to what | Step 2a | 10 | four particles, one sentence |
| 3 | Join things and count them | Step 2b | 15 | join things up |
| 4 | Put verbs in the past | Step 3a | 7 | chain three actions |
| 5 | Say what's going on right now | Step 3b | 4 | describe a state |
| 6 | Describe with a whole clause | Step 3c | 7 | describe a person |
| — | **Checkpoint 1** | — | 2 | put yesterday together |
| 7 | Tell someone what to do | Step 4 | 7 | write the house rules |
| 8 | Say what you want and intend | Step 5 | 8 | state a plan |
| 9 | Link actions in time | Step 6 | 9 | narrate a routine |
| — | **Checkpoint 2** | — | 2 | make a plan with someone |
| 10 | Say what exists and where | Step 7 | 6 | map a room |
| 11 | Describe what things are like | Step 8 | 11 | sell me a place |
| 12 | Compare and prefer | Step 9 | 9 | rank and prefer |
| 13 | Give reasons and push back | Step 10 | 10 | make your case |
| 14 | Handle the shape-changers | Step 11 | 4 | explain how something works |
| — | **Checkpoint 3** | — | 2 | argue a preference |

Fourteen units plus three checkpoints. Range narrows from 4–25 to 4–15.

### The one place that needs new work

Unit 3 stays large at fifteen. Splitting it further would separate joining (と, も, の, から, より,
か, や) from quantity (だけ, しか, counters, ぐらい, ごろ) — but there is only one build lesson in
that stretch, so the front half would have no closer. **That means writing a new build lesson**,
which is why I have left it merged rather than doing it unilaterally. It is the one genuine
addition on the table.

---

## Three data gaps worth fixing first

**`b-s4`, `b-s5` and `b-s6` have empty `requires` arrays.** Every other build names three or four
points. Those three can't gate on anything, and they're the builds closing the units that also
lack skill lessons. Filling them is cheap and it restores the property that makes this whole
breakdown computable rather than hand-maintained.

**Steps 4–6 have no `skill` lessons.** Steps 2 and 3 average four or five. Requests, desire and
time-linking all have English-speaker traps worth a skill lesson — obligation phrasing in
particular is where 〜なければなりません gets over-applied to things that are merely expected.

**Naming is currently taxonomic, not capability-based.** "Core particles" and "Adjectives &
adverbs" describe the grammar; "Mark who does what to what" describes the learner. The second kind
survives the move away from JLPT framing; the first quietly re-imports it.

---

## What this does and doesn't change

**Changes:** the label on each group, and which level of the hierarchy the learner sees as *their*
current position. Step becomes the headline; Stage recedes to a quiet reference.

**Doesn't change:** lesson content, ordering, the badge escalation system, or the decision to hide
lesson counts. This is compatible with that decision and is in fact the reason to do it — hiding
counts was correct, but it removed a position signal, and long Steps removed the other one.
Shorter, named Steps restore position without restoring counts.

**For Stages 2–5:** this is the template. The useful constraint to carry forward is that a unit
ends at a build lesson, and a unit that has grown past roughly a dozen points needs a second one.

---

## Open questions

1. Keep the word "Step," or move to "Unit"? Step is already in the file and reads fine; renaming
   the concept is churn for its own sake unless you dislike it.
2. Does the Stage label stay visible at all, or become metadata a learner can look up?
3. Is the new build lesson for the front half of Unit 3 worth writing now, or is fifteen points
   tolerable for one unit in the middle of the stage?
