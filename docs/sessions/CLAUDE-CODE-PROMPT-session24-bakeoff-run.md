# Session 24 — run the bake-off against `naoshi-5`

**One job.** The `SYSTEM_PROMPT` freeze is lifted, the prompt has changed, and
nothing has measured it. Re-run the harness and read six counters.

Written from a Cowork session that could not run it. ~US$2, ~15 minutes, no
reviewer time. Everything you need is below — you should not have to reconstruct
any of it from a chat log.

---

## Before you start: four conditions

### 1. Run from THIS working tree, not a fresh clone

```
git log --oneline -1     # must be 4240ccb or a descendant
git status --short       # must be clean
git rev-list --count origin/main..HEAD    # 20 at time of writing
```

⚠️ **`origin/main` is 20 commits behind and has neither the new prompt nor the
harness fix.** Run it there and the harness extracts the OLD prompt, finds 150
already-logged rows, makes zero calls, and exits green. You would report "the
prompt change did nothing" having changed nothing and called nothing.

### 2. Do NOT run this while the rename is in flight

The rename (tsumiki → its real name) is happening in a separate session. The
harness extracts `SYSTEM_PROMPT` live from `tsumiki-prototype.jsx` and stamps
`SCHEMA_VERSION` on every logged row — **the rename touches both.**

The dangerous case is not the version changing. It is the rename editing the
**prompt text** (there are "tsumiki" mentions inside the prompt string) while
leaving `SCHEMA_VERSION` alone: two different prompts then share one stamp and
nothing downstream can separate the rows. **Run before the rename lands, or
after. Never across.**

### 3. Confirm you are not in a sandbox before blaming the key

A Cowork session cannot run this at all. Its egress layer rejects any request to
`api.anthropic.com` carrying an `x-api-key` or `authorization` header — it never
inspects the value, so a valid key and a garbage key fail identically.

**If `--smoke` returns 401, check for a `request-id` response header before
touching anything.**

| | intercepted by a sandbox | genuinely from Anthropic |
|---|---|---|
| body | `Unauthorized` — plain text, 12 bytes | `{"type":"error","error":{…},"request_id":"req_…"}` |
| headers | `Connection`, `Content-Type`, `Transfer-Encoding`, and nothing else | includes `Request-Id`, `Cf-Ray`, `Server`, `Date` |

**A 401 with no `request-id` never reached Anthropic.** Their API stamps one on
every response, errors included.

⚠️ **DO NOT REVOKE THE KEY.** An earlier read of this 401 concluded it had been
rotated; that was wrong, and acting on it would have destroyed a working
credential to fix a problem it did not have. The key in `ANTHROPIC_API_KEY` has
still never actually been tested by anything. Full detail in
`RUNNING-THE-BAKEOFF.md` under "The bake-off CANNOT be run from inside a Cowork
session".

### 4. Nothing you are about to run is irreplaceable — but know what is

Verified from the source: the harness **reads** `naoshi-eval-v1.xlsx` and
**writes** only `naoshi-eval-v1-with-outputs.xlsx`, `bakeoff-log.jsonl` and
`bakeoff-parse-failures.jsonl`.

`naoshi-eval-v1.xlsx` is gitignored and has no version history — the Notion row
calls it the one artefact git cannot restore. **Do not write to it.** No step
below does.

---

## The commands

```
python3 bakeoff-harness.py --dry-run
```
Must print `prompt naoshi-5 · 50 sentences · 3 models · 150/150 ... runnable`.
**If it says 0 runnable, stop** — you are on the old harness (condition 1).

```
read -rs ANTHROPIC_API_KEY && export ANTHROPIC_API_KEY
python3 bakeoff-harness.py --smoke
python3 bakeoff-harness.py --run --key-verified
python3 check-rewrite-quality.py
```

`--key-verified` asserts the reviewer has verified the answer key. That is true
for this eval set; it is not a formality to route around if it ever isn't.

If it dies mid-run, re-run the same command. Resume is safe **and now
schema-aware** (commit `e035556`): it only counts rows logged under the CURRENT
prompt version, so the 150 `naoshi-4` rows do not mask the new run. They stay in
the log untouched — they are the Phase 0 baseline.

---

## The baseline, and what should move

Everything below was produced under `naoshi-4`. `Eval Set` column H does not
change when the prompt changes, so all of it is directly comparable.

| measure | naoshi-4 | expected direction |
|---|---|---|
| key edits applied — M1 | 16 / 42 | **up** |
| key edits applied — M2 | 26 / 42 | up |
| key edits applied — M3 | 27 / 42 | up |
| `SELF_INCONSISTENT` | 23 | **down hardest** (R2 targets it directly) |
| `EXTRA_EDIT` | 27 | down |
| `SUBSTITUTION` | 17 | down |
| `LEXICAL_MISS` | 12 | down |
| `NAME_KANJIFIED` | 5 | down |
| primary-flagged rows | M1 19, M2 8, M3 8 (35 total) | down |

**These predictions were committed in `2a7c878` BEFORE any result existed.**
Compare against them rather than deciding after the fact what counted as
success. That ordering is the only thing separating a measurement from a story.

### Three readings that are NOT "it worked"

- **`SUBSTITUTION` and `LEXICAL_MISS` must BOTH fall.** One falling while the
  other rises means R3 was read as half a rule — "fix the word" alone is exactly
  how 会議 and 孤独 got into the eval in the first place. That is a regression
  wearing a better score.
- **If M1 (16/42) does not move**, the honest conclusion is that the prompt was
  never the problem for Haiku — not that the change needs another pass.
- **A better score with fewer signals is not a better result.** The primary-
  signal rule (precision ≥ 2× the 15% base rate) was fixed before the numbers
  were read, deliberately. Do not re-tune it now.

---

## What this run can and cannot conclude

**It can reject the change. It cannot accept it.** `check-rewrite-quality.py`
scores whether the rewrite hit the reviewer-verified key — not whether it is
natural Japanese. A change that makes rewrites more minimal and *less* natural
would score as an unambiguous improvement here.

That blindness is measured, not theoretical: on O009, O098 and O120 the rewrite
matched the key **character for character** and Keiko still graded them 部分一致
with 「直し方が不自然」. Recall is capped at 87%, not 100%.

So: green counters mean *proceed to ask*, not *done*.

**Do NOT commission reviewer work off the back of this run.** The next step, if
the counters move, is one batch — ¥2,000, ~20–35 rows, one NEW question (*is
this rewrite natural?*) on a TENTH form, because the four-way vocabulary
(一致 / 部分一致 / 見逃し / 誤指摘) cannot express the finding. **Do not rebuild
B1–B9**: they hold live responses and a rebuild orphans real graded data. That
ask is Lloyd's to make, not yours — B1 was declined outright and paid for with
goodwill, which is not a balance that can be topped up.

---

## What to hand back

1. The six counters, before and after, as a table.
2. Whether each prediction above held — including the ones that did not.
3. The `--run` token totals (two yellow cells on the Results sheet).
4. Anything the instrument flagged that is not on the list. The check is
   character-based and coarse by design; its own output says to read the rows.

Then update the Notion row **Rewrite quality — the Phase 0 finding, instrumented
before any prompt change** and say plainly whether `naoshi-5` is kept, reverted,
or needs a second pass.

If it is reverted: `git revert 2a7c878` restores `naoshi-4`, and the naoshi-4
rows are already in the log, so nothing needs re-running to get the baseline back.

---

## Context you may want but should not need

- `error-history-design-v1.md` — unrelated, ignore.
- `rewrite-quality-proposal-v1.md` — the five proposals and, for each, the rows
  it fixes AND the rows it might break. **Gitignored: it quotes key corrections
  verbatim.** Read it if a counter moves the wrong way.
- `prompt-regressions.md` § R4, R6 — where the finding came from.
- Commit `2a7c878` — what changed in the prompt and why, rule by rule.
- Commit `e035556` — the resume bug, and why a green run used to mean nothing.
