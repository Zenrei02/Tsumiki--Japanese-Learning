# Task — rewrite quality: the Phase 0 finding, and how to work on it without burning the reviewer

## Context

Blind grading is complete and imported (150/150, Sep 5 2026). **All three models read
TUNE**, and the binding constraint is agreement, not invented errors:

| | 一致 | agreement | 誤指摘 | invented |
|---|---|---|---|---|
| M1 Haiku 4.5 | 34 | **68%** | 5 | 10% |
| M2 Sonnet 5 | 43 | **86%** | 2 | 4% |
| M3 Opus 5 | 41 | **82%** | 3 | 6% |

The 90% bar fails on all three, and even the most generous possible regrade — counting
*every* flagged 部分一致 as 一致 — leaves M1 at 86%, M2 at 92%, M3 at 90%. **No regrading
produces a GO.** So the eval has done its job: the answer is TUNE, and this task is
about *what* to tune.

Two candidate explanations are already **ruled out**, so do not re-litigate them:

- **Reviewer disagreement.** `check-key-confound.py`: 24% disagreement on amended-key
  rows vs 20% on clean-key rows, gap **+4%**. Tomoko-vs-Keiko is not driving the score.
- **The grading-vocabulary gap alone.** It is real and it moves the invented-error count
  (M1 5 → 0–1), but it cannot move agreement enough to matter. See above.

## The finding

`check-unnatural-rewrite.py` flags **23 of 150 outputs** whose comment describes a fault
the four-way vocabulary cannot name. **16 of those 23 are FIX-tier** — this is
concentrated exactly where the tool is most confident. M1 earns 13 of the 23, more than
M2 and M3 combined.

Read the four sentences where two or more models failed the same way, and one pattern
does all the work:

**E02** 「えりが直ってくれると思ったから（笑）」 · key `直って → 直して`
- M1 rewrote it as 「**襟**が直ってくれると思ったから」 — it converted **えり, a person's
  name, into 襟 ("collar")**, and left the actual transitivity error untouched.
- M2 said NONE and echoed the input back unchanged.
- M3 got it right.

**E10** 「会いは8時からでしょう？」 · key `会い → 会うの` (nominalise the verb)
- M3 → 「**会議**は8時からでしょう？」 ("the meeting")
- M2 → 「**待ち合わせ**は8時からでしょう？」 ("the rendezvous")
- M1 → 「会い**が**8時からでしょう？」 (swapped the particle, left 会い intact)

All three diagnosed correctly that 会い is not a standalone noun. Two then **substituted
a different noun**, changing what the sentence says; the third **fixed a particle
instead**. Keiko: 「②は会うという意味なのに ③では会議という意味になっている」.

**E14** · key `孤立な → 孤立した`, `高揚された → 気分が高揚した`
- M3 changed 孤立 to **孤独** (a different word) and とも to 友達.
- M1 kept 孤立した but wrote 「友達が来たときに高揚した」; Keiko: 「気分が高揚した のほうが自然」.

**E50** 「糖尿病は家族でよくあること」 · key `家族 → 家系` (family → bloodline)
- M2 kept **家族** and merely added です. Keiko: 「家系と家族が直っていない」.
- M1 kept 家族 and changed the particle で→が.

**The pattern: the rewriter reaches for grammatical repair when the required fix is
lexical or semantic.** Particles, conjugations and politeness get adjusted; the wrong
*word* stays wrong, or gets swapped for a plausible neighbour that changes the meaning.
On E02 it went further and re-read a proper noun as a common noun.

This is consistent with the tier data: detection is broadly sound (agreement failures are
not mostly 見逃し — M2 and M3 have **zero** 見逃し), and the damage is downstream, in what
the tool proposes.

---

## ⚠️ Before writing a single line of `SYSTEM_PROMPT`

**Changing the prompt invalidates the baseline.** All 150 outputs were produced under the
current `SYSTEM_PROMPT`. A change means the eval no longer measures the thing that is
shipping, and re-grading costs Keiko another nine batches — which is not available:
she has done nine already, declined payment for B1, and is owed ¥6,000 as of this
writing. **Reviewer time is the scarcest resource in this project and it is nearly spent.**

So the sequence is *instrument first, change second*. The precedent is explicit and is in
CLAUDE.md: the romaji-leak問題 was routed to `check-romaji-leak.py` rather than to eval
rows, because "before adding eval rows for a property, check the grading vocabulary can
actually express failing it." Rewrite quality is the same shape — and better, because
unlike romaji it can be scored against something the workbook already holds.

### Step 1 — Build the instrument: `check-rewrite-quality.py`

Every row in `Blind Grading` has the tool's proposed rewrite (parse `Rewrite:` out of
column F — present on all 150 rows, checked) and `Eval Set` column H has the reviewer-verified correction. **That is a
reference pair, on all 150 rows, with no reviewer time at all.** Keiko was effectively
computing this by hand; automate what she was doing.

Report per output, and aggregate per model:

1. **Did the tool's rewrite change the token the key changed?** Diff `文` → key
   correction to get the target edit; diff `文` → tool rewrite to get the actual edit.
   Overlap is the core signal. E50's 家族/家系 and E02's 直って/直して both fail here.
2. **Did it introduce a token in neither the source nor the key?** That is the
   substitution failure — 会議, 待ち合わせ, 襟, 孤独 all surface this way.
3. **Did it echo the input unchanged while claiming NONE?** (M2 on E02.)
4. **Did it alter a proper noun?** Names in hiragana are the trap; E02's えり→襟 is the
   case. Cross-reference the sentence's own tokens.

Validate it against the 23 rows the reviewer already flagged: **a check that does not
reproduce Keiko's calls on those rows is not measuring what she measured.** Report its
agreement with her as the headline, the way `import-grading-responses.py` reports
coverage. Follow the house guards — refuse on a zero-row read, print what it flags, write
nothing to the workbook.

### Step 2 — Only then, propose prompt changes

Write the proposal to `rewrite-quality-proposal-v1.md`. For each change, give the rows it
is meant to fix and the rows it might break. Candidate directions the evidence supports —
**these are hypotheses, not instructions**:

- Require the rewrite to be **the minimum edit** that resolves the diagnosis, and to
  preserve every token not implicated in it.
- Forbid substituting a **different content word** for the one being corrected when a
  form of the original word will do (会う → 会うの, not 会議).
- Treat **hiragana proper nouns** as opaque; never convert them to kanji.
- When the diagnosis is lexical, say so and **fix the word**, rather than adjusting a
  particle around it.

Do **not** edit `SYSTEM_PROMPT` in this task. The proposal is the deliverable. CLAUDE.md
holds a standing bar against `SYSTEM_PROMPT` changes while Phase 0 is live; Phase 0's
grading is now finished, so that bar is Lloyd's to lift — but it is his call, made once,
with the proposal in front of him.

### Step 3 — Say how it would be re-measured

Any change needs a re-run, and re-grading is the expensive half. Cost it honestly:
`bakeoff-harness.py` re-runs are cheap (see `RUNNING-THE-BAKEOFF.md`); reviewer batches
are not. State plainly whether Step 1's instrument is sufficient to detect the
improvement **without** Keiko, and if it is not, say what minimum reviewer ask would be —
in batches and yen, at ¥2,000/batch.

---

## Constraints

- **Do not edit any grade, comment, or key** in the workbook. Adjudications go in
  `Eval Set` col L with a date and a name, the E09 way, and they are Lloyd's to make.
- **Snapshot before any workbook write** — `backups/`, next number is `07`. Both
  workbooks are gitignored and untracked; `backups/` is the only history they have.
- **Do not rebuild any Google Form.** They hold live responses.
- **One deploying push per session, and app-touching work must be batched.** This task
  touches no `naoshi-app/` file, so its commits are free. Verify rather than assume:
  ```
  cd naoshi-app
  git --no-optional-locks diff --quiet origin/main HEAD ./ ../netlify.toml
  # exit 0 => build SKIPPED (free).  exit 1 => build RUNS (15 credits).
  ```
  Run the control too — a range that *does* touch `naoshi-app/` must exit 1.
- **Read the modules, not the specs.** Parse `checker-module.jsx` for the live
  `SYSTEM_PROMPT`; the design docs drift within days.

## Definition of done

- [ ] `check-rewrite-quality.py` exists, guards fire, writes nothing
- [ ] Its agreement with Keiko's 23 flagged rows is reported as the headline number
- [ ] `rewrite-quality-proposal-v1.md` written, each proposed change tied to specific rows
- [ ] Re-measurement cost stated in batches and yen
- [ ] `SYSTEM_PROMPT` unchanged; no grade, comment or key edited
