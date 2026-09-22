# Message to Keiko — B11, the same question on a set she has not seen

**Status:** ✅ READY TO SEND — the two LIVE links below are the real, verified ones
(built and verified Sep 19 2026; see 🔗 Links page § Step 3.6). Written Sep 15 2026
(Session 32.1); links inserted and two mismatches corrected Sep 22 2026.
**ALL GATES CLEAR — SENDABLE AS-IS.** B10's ¥2,000 was paid (Lloyd, Sep 22 2026);
tracker row *Pay Keiko for B10* marked Done. Pre-flight items 1–7 all ✅.
**Send via:** LINE, same as every previous batch message.
**Fee:** ¥6,000 proposed (50 rows, standard four-way question — B8/B9's rate,
¥2,000 for 18 and ¥4,000 for 30). Lloyd sets the number; the message carries it once.
**Send AFTER B10 is returned and paid.** B10 is asking a different question about
the default outputs; two open batches with different questions is the confusion
B10's own README warns about.

---

## What this batch is, and what Keiko must not be told

The 50 M2 sentences run again with `effort: low` (Session 32.1, stamp
`naoshi-4-lowthink`). Her B1–B9 grades on the same 50 sentences under the default
request are the comparison. Same four-way vocabulary — 一致 / 部分一致 / 見逃し /
誤指摘 — because the point is a PAIRED comparison per sentence against grades that
already exist, and a new question would make that impossible.

She has seen every one of these sentences three times already (once per model
across B1–B9). The existing form description already says so and already says
the setting is hidden: 「同じ文が複数回出てきます…どの出力がどの設定によるものかは
伏せてあります」. Nothing about speed, thinking, cost, or "a faster version" goes
anywhere near her — that is the blind. If she asks what changed, the answer is
「設定を一つ変えて、同じ文を通し直したものです」 and nothing more.

## Why two forms, not one

Fifty rows at her measured 1.7–2.3 min/row is 85–115 minutes with no mid-save;
B9's 30 rows was already the long one. B11a and B11b, 25 rows each, one response
sheet, can be done on different days. The message says so.

## Pre-flight (mirror of B10's list — every line must be ✅ before sending)

1. ✅ Both forms built by `build-b11-forms.gs`; exactly one B11a and one B11b
   exist (created 10:34:16Z / 10:35:22Z Sep 19, owner `zensoreno`, no duplicate).
   ⚠ CORRECTED: the keys are `LIVE_B11a` / `EDIT_B11a` / `LIVE_B11b` /
   `EDIT_B11b` / `RESPONSE_SS_ID` — NOT `B11A_*` / `B11B_*` as this line first
   said. Checking for a key that does not exist would read as "not built".
   ⚠ They live in the **B1–B9 Apps Script project**, not a new one: the script
   was pasted there, so `RESPONSE_SS_ID` was reused and B11's two tabs sit on
   the Blind Grading sheet. Checked Sep 19: nothing damaged, B1–B9 tabs and all
   of Keiko's submissions intact, and `import-grading-responses.py` cannot see
   the B11 tabs (its `^(O\d{3}) ・ …` regex does not match `B11-01 ・ 評価`).
   🚨 DO NOT re-run the builder in a fresh project to "fix" this — it would
   build a second live pair.
2. ✅ Verified against the artifact, not the log: both forms opened
   unauthenticated, 25 pages each, B11a opening on `B11-01` and B11b on
   `B11-26`; all 50 labels confirmed through the response sheet's header rows
   (52 columns each, contiguous, no gaps, no duplicates).
3. ✅ Opens unauthenticated; permissions `anyone · reader · published` plus the
   owner on both; no other editor and no `anyone · writer`, so the EDIT link is
   not reachable from the LIVE link.
4. ✅ Blinding holds on the live pages as well as the `.gs`: no `M1`/`M2`/`M3`,
   no setting or effort name, no O-id anywhere. The 〔別のネイティブレビュアー〕
   redaction is in place.
5. ✅ Form row labels are `B11-01 … B11-50`, NOT the O-ids: O-ids already carry
   her B1–B9 grades in Blind Grading G/H, and a response keyed by O-id invites
   an import that overwrites them. The O-id ↔ B11 manifest is Lloyd-only.
6. ✅ B1–B10 untouched. Blind Grading G/H untouched. B11 grades import to their
   own file (`b11-grades.csv`, keyed by output_id, schema `naoshi-4-lowthink`)
   via `import-b11-grades.py`, which now reads the shared workbook, merges every
   tab carrying `B11-nn` columns, and refuses outright if none does. Self-test
   green; three negative controls each failed for the right reason.
7. ✅ B10 returned AND paid. Graded by Keiko Sep 16 09:23 (23/24 適切), imported
   Sep 17, ¥2,000 paid Sep 22 2026.

---

## The message (send as-is once the links are real)

> 恵子さん
>
> B10もありがとうございました。おかげで、ツールの説明の直し方がはっきりしました。
>
> もう一度だけ、お願いできないでしょうか。
> **B11、50問（25問ずつ2つのフォーム）、6,000円**でお願いしたいです。
>
> 今回は**いつもの採点**です。B1〜B9と同じ、一致・部分一致・見逃し・誤指摘の4択とコメント欄で、
> 質問の仕方も画面もB9までと同じです。
>
> 文は以前に見ていただいたものと同じです。設定を一つ変えて同じ文を通し直したもので、
> どの出力がどの設定かは伏せてあります。前の判断に合わせようとせず、
> いつも通り1件ずつ見ていただければ大丈夫です。
>
> 今回も**日本語を直していただく必要はありません**。見比べて選んでいただくだけです。
> 1つのフォームで40〜60分くらいです。途中保存ができないので2つに分けました。
> 別々の日にやっていただいて大丈夫です。
>
> フォームはこちらです。
> B11a：https://docs.google.com/forms/d/e/1FAIpQLSfM9e5eNGa0fCZXKwBnESnweB0SsTS-_7Iun26noU3IolrbFg/viewform
> B11b：https://docs.google.com/forms/d/e/1FAIpQLSdAT6WqU3hs1I0wvzNZWZsfCw7LQFi4FMYuheJ0gQXYpXoERg/viewform
>
> 難しければ全然お気になさらないでください。お返事だけいただけたら嬉しいです。

---

## English gloss (for Lloyd — do not send)

> Keiko,
>
> Thank you for B10 as well — it made clear how the tool's explanations need to
> be fixed.
>
> Could I ask for one more round? **B11, 50 questions (two forms of 25), ¥6,000.**
>
> This time it's **the usual grading**: the same four choices as B1–B9 — 一致 /
> 部分一致 / 見逃し / 誤指摘 — plus a comment box, same wording and same screens as
> B9.
>
> The sentences are ones you've seen before. One setting was changed and the same
> sentences were run through again; which output came from which setting is
> hidden. Don't try to match your earlier judgements — just look at each one on
> its own, as always.
>
> **You don't need to correct any Japanese** this time either — just compare and
> choose. About 40–60 minutes per form. It can't be saved midway, so I split it
> in two; different days is fine.
>
> Here are the forms.
> B11a: <https://docs.google.com/forms/d/e/1FAIpQLSfM9e5eNGa0fCZXKwBnESnweB0SsTS-_7Iun26noU3IolrbFg/viewform>
> B11b: <https://docs.google.com/forms/d/e/1FAIpQLSdAT6WqU3hs1I0wvzNZWZsfCw7LQFi4FMYuheJ0gQXYpXoERg/viewform>
>
> If it's difficult, please don't worry about it at all. Just a reply would be
> great.

---

## When it comes back (Lloyd-only)

⚠️ The `…responses (all batches).xlsx` sitting in the project folder is STALE —
it predates B11, and `import-b11-grades.py` will correctly refuse it. Download a
fresh copy first: 「Naoshi — ブラインド採点 responses (all batches)」 → File →
Download → Microsoft Excel, replace the copy in the folder, then
`python3 import-b11-grades.py` → `python3 compare-b11.py`.

If she finishes only one batch the importer names it (`NOT RETURNED — 0 of 25`).
**B11a alone tells you less** — B11b carries most of the UNNATURAL and
WORTH KNOWING rows.

## What the grades are for (Lloyd-only)

Paired, per sentence: her B11 grade on `O0xx` under `naoshi-4-lowthink` against
her B1–B9 grade on the same `O0xx` under `naoshi-4`. Two numbers decide it, the
same two that chose Sonnet: the 誤指摘 count (bar ≤2 goal / ≤1 stretch on this
n) and the 一致+部分一致 rate. If both land inside the default's band, flip
`TSUMIKI_EFFORT=low` (Session 32.2 prompt). If 誤指摘 rises, don't — that is the
failure the mechanical count could not see, and it is exactly what this batch
exists to see.
