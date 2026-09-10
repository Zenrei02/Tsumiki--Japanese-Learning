# Message to Keiko — B10, one new question about the explanation

**Status:** READY TO SEND. The form is built, live and verified. Nothing has been
sent. Written Sep 9 2026, link added Sep 11 2026.
**Send via:** LINE, same as every previous batch message.
**Fee:** ¥2,000 (24 rows, one new question — same rate as B8).
**LIVE link (the one in the message below):** <https://docs.google.com/forms/d/e/1FAIpQLSfk9mWG6rgHaZXBVFzG1VSd8zxu6MenTIxq5pux1qj0FjS7Yg/viewform>

---

## What Lloyd should check before this goes anywhere

1. ✅ **The form is built and verified** (Sep 11 2026). Owner `zensoreno@gmail.com`,
   matching the Step 3 set. Exactly one B10 form and one response sheet exist —
   no duplicate from a re-run. All 24 rows were compared against the `.gs` that
   built them, byte for byte, by reading the live form's own embedded data rather
   than the execution log.
2. ✅ **It opens from outside the account.** The first read was unauthenticated,
   so a Workspace domain restriction would have blocked it and did not.
   Permissions are `anyone · reader · published` plus the owner — no other editor,
   and no `anyone · writer`, so the EDIT link is not reachable from the LIVE one.
3. **B1–B9 are untouched** and stay that way. B10 has its own form, its own
   response spreadsheet, and its own Script Properties keys.
4. **Payment is clear.** Lloyd confirmed Sep 9 2026 that the ¥6,000 for B8 and B9
   is already paid; B1 was declined by her own choice. Nothing is outstanding, so
   this message can go as soon as the form is built and checked. (An earlier draft
   of this line said to settle up first — it was reading a tracker note that had
   gone stale.)

## Why this batch, in one paragraph

B1–B9 asked whether the tool's **diagnosis** matched the key: 一致 / 部分一致 /
見逃し / 誤指摘. On thirteen rows that vocabulary has nothing to say. The tool told
the learner the sentence was fine — and then handed back a different sentence.
`O077` says *"Natural and grammatically sound"* and silently repairs 分かりない →
分からない. `O043` says the same and turns えり, a person's **name**, into 襟
("collar"). A grader working the four-way vocabulary would mark the diagnosis and
never touch the thing that is wrong. So the question has to change, and this is
the batch that changes it: **was the explanation the learner saw acceptable?**

Four more rows ask something narrower. On those, the tool's rewrite matches the
verified key **character for character** and she still graded it 部分一致. No
instrument that compares against the key can reach those rows — by construction
the tool hit the reference. Only she can say whether the grade stands.

⚠️ **The verdict tier is deliberately not shown on the form.** Printing
"判定: NONE" beside an explanation answers the question being asked.

⚠️ **Do not reveal which model produced which output**, here or in any follow-up.

## What is in it

24 rows: 13 silent-rescue rows across all three models, 4 key-exact 部分一致 rows,
7 already-graded controls shuffled in so the rescued rows cannot be found by
position. Roughly 40–60 minutes. The full row list is printed by
`python3 build-b10-form.py` — **that manifest is for Lloyd only and must never
reach her**, as it names the roles and the model codes.

---

## The message (send as-is)

> 恵子さん
>
> ご無沙汰しております。先日のブラインド採点、9バッチ全部やっていただいて本当に助かりました。
> いただいたコメントを読み返しながらツールを直しているのですが、その中で
> 「今までの聞き方では拾えていなかったこと」が一つ見つかりました。
>
> それで、もしお時間があれば、もう1回だけお願いできないでしょうか。
> **B10、24問、2,000円**でお願いしたいです。
>
> 今回は**質問が今までと違います**。一致・部分一致・見逃し・誤指摘の判定ではありません。
> 聞きたいのは一つだけで、
>
> **「ツールが学習者に見せた説明は、学習者にとって適切ですか」**
>
> です。適切／一部適切／不適切／判断できない の4択と、コメント欄だけです。
>
> なぜこれを聞きたいかというと、ツールが「この文は問題ありません」と言っておきながら、
> 出してきた文が元の文と違っている、というケースがいくつかあったからです。
> 学習者から見ると「合っていた」と言われたのに直された形になるので、
> 自分がどこを間違えたのか分からないまま終わってしまいます。
> それが許容できる範囲なのかどうか、日本語を教える側の目で見ていただきたいです。
>
> 今回も**日本語を直していただく必要はありません**。見て選んでいただくだけです。
> 所要時間は40〜60分くらいだと思います。
>
> ツールの説明文が英語なのは、このツールが英語話者の学習者向けだからです。
> 学習者が実際に画面で読むのはその英文そのものなので、そのまま載せています。
>
> フォームはこちらです。お引き受けいただけるようでしたら、
> このままお進みいただいて大丈夫です。
> https://docs.google.com/forms/d/e/1FAIpQLSfk9mWG6rgHaZXBVFzG1VSd8zxu6MenTIxq5pux1qj0FjS7Yg/viewform
>
> 難しければ全然お気になさらないでください。お返事だけいただけたら嬉しいです。

---

## English gloss (for Lloyd — do not send)

> Keiko,
>
> It's been a while. The nine batches of blind grading were a huge help. While
> going back through your comments and fixing the tool, I found one thing the way
> I was asking couldn't pick up.
>
> So if you have time, could I ask for one more round? **B10, 24 questions,
> ¥2,000.**
>
> **The question is different this time** — it isn't 一致/部分一致/見逃し/誤指摘.
> There's only one thing I want to ask:
>
> **"Was the explanation the tool showed the learner appropriate for them?"**
>
> Four options — appropriate / partly appropriate / not appropriate / can't say —
> and a comment box.
>
> The reason I want to ask this is that there were several cases where the tool
> said "there's nothing wrong with this sentence" and then handed back a sentence
> that differed from the original. From the learner's side they're told they were
> right and then quietly corrected, so they finish without knowing what they got
> wrong. I'd like your view, as someone who teaches Japanese, on whether that's
> within acceptable range.
>
> **You don't need to correct any Japanese** this time either — just look and
> choose. I think it'll take about 40–60 minutes.
>
> The tool's explanations are in English because it's built for English-speaking
> learners; that English is exactly what the learner reads on screen, so I've left
> it as-is.
>
> Here's the form. If you're happy to take it on, you can just go ahead from here.
> [link]
>
> If it's difficult, please don't worry about it at all. Just a reply would be
> great.
