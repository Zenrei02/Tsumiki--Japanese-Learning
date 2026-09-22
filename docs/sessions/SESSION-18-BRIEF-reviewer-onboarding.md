# Session 18 brief — get the reviewer started

*Written at the end of Session 17. The reviewer said yes (Aug 19) and asked
「いつぐらいに確認をしたらいいですか？」 — when should I do the checking? They are waiting
on a date, so the reply is the first thing, not the last.*

## The state that makes this session possible

Everything upstream is done. `build-grading-forms.gs` is generated, blinded
(no `M1`/`M2`/`M3` anywhere in the 173 KB file), and covers all 150 outputs
across 9 batches. The eval key was verified in Session 15. The bake-off is
150/150. **The only thing between here and a GO/TUNE verdict is a human
grading, and that human has agreed.**

## What Session 18 must produce

1. A reply to their question, in Japanese, with a real date.
2. Nine forms created and, critically, **verified to be reachable by them**.
3. B1's live link sent with instructions they can follow without you present.

## ⚠️ Two traps that have already cost this project a session each

Both are in `CLAUDE.md`; both bite exactly here.

**1. Apps Script account mismatch.** The existing forms are owned by
`quantumshifting@gmail.com`. Cowork's Drive connector authenticates as
`zensoreno`. In Session 12, B9 was built while signed into the other account
and was simply **invisible to a Drive search** — the only evidence it existed
was its execution log, which is the exact evidence this project has twice been
burned by.

The expensive version of this mistake is re-running the script under the other
account "because the form isn't there", which creates a **SECOND live form**.
That is the v1/v2 trap, and with a reviewer already holding a link it would
mean grading responses landing in two places.

**So: decide which account runs `buildAllGradingForms` BEFORE running it,
write it down, and confirm the forms are visible from a Drive search
afterwards. Do not re-run to "fix" an invisible form.**

**2. Domain restriction silently blocks outsiders.** A Workspace account will
sometimes restrict a new Google Form to its own domain and block every outside
respondent — with no warning to the owner. **Open B1's live link from a signed-
out browser (or a private window) before sending it.** If it asks for a login
or says you need permission, the reviewer will hit the same wall and will
probably just assume they did something wrong.

## The reply to send now

They asked for a date. Do not answer with "soon" — they said yes
enthusiastically and deserve a concrete number. Suggested (adjust the day to
whatever is real):

```
ありがとう！すごく助かります🙏

今フォームを準備しているので、今週中にリンクを送りますね。
1セット目は12問で、30分くらいで終わると思います。

締め切りは特にないので、時間のあるときにゆっくりやってもらえれば大丈夫です。
やってみて「思ってたのと違うな」と思ったら、途中でやめてもらっても
全然かまいません。

またリンクと一緒に、やり方の説明も送ります！
```

The three things that copy is deliberately doing: giving a real timeframe,
removing deadline pressure, and giving them an explicit exit. A friend who
feels trapped in a favour grades worse and resents it — and the whole value of
this instrument is unhurried attention.

## What to send with the B1 link

Short instructions in Japanese, not a manual. They need:

- What they are looking at: a learner's Japanese sentence, then what the AI
  said about it.
- The four options and what each means — 一致 / 部分一致 / 見逃し / 誤指摘.
- That the comment box is optional but valuable, especially when they pick
  部分一致.
- **That there is no expectation the AI is right.** Say this explicitly. A
  polite grader who assumes the tool is authoritative will drift toward 一致,
  and that would corrupt the number the whole project rests on.

Draft this in Session 18 once the form is live and you can see its actual
wording.

## Open decisions to settle in the session

- **Per-output pricing for batches 2–9.** ¥5,000 flat is uneven: B1 is 12
  outputs, B9 is 30, same money. ¥300/output keeps the total at ¥45,000 and
  distributes it honestly (B1 ≈ ¥3,600, B9 ¥9,000). Raise it naturally after
  B1 — *"I realised the batches aren't the same size"* — which is a fairness
  correction, not a haggle. **Do not revise B1's ¥5,000 downward**; it has
  been promised.
- **How to pay.** Not yet discussed. Worth settling before B1 lands rather
  than after.
- **Whether to commit past B1 now.** The de-risking argument says wait: B1 is
  the calibration batch, and it tells you whether the forms are clear and the
  vocabulary holds up before ¥40,000 is committed.

## After responses come back

`import-grading-responses.py` → the Results sheet's Accuracy section and the
GO/TUNE cells compute themselves. Two things to carry into reading that
verdict, both already established and both invisible to the grader:

- **The romaji leak** — 6 confirmed rows across all three models, so a
  SYSTEM_PROMPT gap rather than a model property. Caveat or blocking fix,
  undecided.
- **The cost spread** — Haiku $3.59 / Sonnet ~$32.7 / Opus ~$45.9 per 1,000
  checks. Knowable before a single form returns, and it sets how large a
  quality gap has to be to justify the difference.

## Do not let the grading run block the rest

Session 17's parallel work stands: kanji Group 7 (社 leads, ledger turn
first), the cultural-anecdote design pass, Stage 3 steps 27+, the 57-shape
policy pass. The reviewer works at human pace; nothing else should wait on it.
