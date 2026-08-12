/**
 * Rebuilds ONLY the B7 and B8 key-check forms, in place. Aug 12 2026.
 *
 * WHY: B1–B6 are answered and must not be touched. B7 and B8 have zero
 * responses, so their questions can be rebuilt safely. Three changes:
 *   1. The 「← 確認していただくのはこの部分です」 label is removed from every
 *      item (reviewer: it repeats on every question and is noise).
 *   2. E35 is replaced. The old sentence 「英会話を作った外国人はに日本が
 *      キツイと言われたんです。」 was rejected as unparseable; the new one is a
 *      REAL sentence from the same source logs covering the same watchlist slot.
 *   3. E35 moves from B5 (already answered) to the END of B8, so B8 has 6.
 *
 * The existing form IDs are reused, so the LIVE LINKS DO NOT CHANGE and the
 * response spreadsheet stays linked. Do not run buildAllKeyCheckForms — that
 * creates new forms and a new spreadsheet, and would orphan B1–B6.
 *
 * HOW TO RUN
 *   1. script.google.com → open the existing project (or a new one)
 *   2. Paste this over Code.gs
 *   3. Run → patchB7B8   (authorise if prompted)
 *   4. Read the execution log; open both LIVE links once to confirm they render.
 *
 * AFTER RUNNING: rebuilding the questions DOES leave stale header columns behind.
 * Confirmed Aug 12 2026 — B7 went to 33 columns where it needs 17, B8 to 36 where
 * it needs 20, every Eval ID appearing twice with the stale copy trailing and empty.
 *
 * ⚠️ YOU CANNOT DELETE THE STALE COLUMNS. A form-linked response sheet locks its
 * column structure, so Sheets refuses the delete. An earlier version of this note
 * told you to delete them; that was wrong and cost Lloyd a confusing attempt.
 *
 * NO ACTION IS NEEDED. import-key-check-responses.py was hardened the same day:
 * it takes the FIRST non-empty value per field, never lets a blank overwrite an
 * answer, and prints a NOTE naming the duplicated columns. (Before that fix it
 * took the LAST match, which would have read all five original B8 sentences as
 * unanswered with no error shown.)
 *
 * If you want it cosmetically clean anyway, the only routes are whole-tab ones:
 * delete the B7/B8 TABS (right-click tab → Delete), or unlink and relink the form.
 * Both are safe ONLY while that batch has zero responses — after the reviewer
 * submits, either one destroys real data. Not worth the risk for tidiness.
 */

var FORM_IDS = {
  B7: '1ojPRe41f-oxlcj0z2Xp5Xz7VhOtGbjKMF8b0_azRvo8',
  B8: '1NsMg9Oc_zs2fSmeBvbHTgBzjNU5Lv2YcEGHCT8tiyDA'
};

var DATA = [
  {
    "id": "E01", "batch": "B7", "level": "N5",
    "sentence": "お昼はスーパーでお弁当を買って食べました。",
    "status": "CORRECT", "tier": "NONE", "correction": "—",
    "rationale": "基本的な「て」形の連続で、全く自然な文。"
  },
  {
    "id": "E21", "batch": "B7", "level": "N4",
    "sentence": "2級ならいいけど3級を合格することはビザのことに関係ないよ．",
    "status": "ERROR", "tier": "FIX",
    "correction": "2級ならいいけど3級に合格することはビザのことに関係ないよ．",
    "rationale": "「合格する」は「に」を取る:「3級に合格する」。"
  },
  {
    "id": "E23", "batch": "B7", "level": "N5",
    "sentence": "ひらがな・カタカナでもまだ分かりないの？！って思った。",
    "status": "ERROR", "tier": "FIX",
    "correction": "ひらがな・カタカナでもまだ分からないの？！って思った。",
    "rationale": "「分かる」の否定は「分からない」(五段動詞のア段＋ない)。「分かりない」という形は存在しない。"
  },
  {
    "id": "E28", "batch": "B7", "level": "N4",
    "sentence": "ワンパンマン見る後、モブサイコ見た",
    "status": "ERROR", "tier": "FIX",
    "correction": "ワンパンマン見た後、モブサイコ見た",
    "rationale": "「後」の前の動詞は過去形:「見た後」。(「前」は辞書形を取るので対照的。)"
  },
  {
    "id": "E38", "batch": "B7", "level": "N5",
    "sentence": "めちゃ楽しいでした！",
    "status": "ERROR", "tier": "FIX",
    "correction": "めちゃ楽しかったです！",
    "rationale": "い形容詞は自ら過去形に活用するため「でした」を直接付けられない。過去の丁寧形は「楽しかったです」。"
  },
  {
    "id": "E02", "batch": "B8", "level": "N4",
    "sentence": "えりが直ってくれると思ったから（笑）",
    "status": "ERROR", "tier": "FIX",
    "correction": "えりが直してくれると思ったから（笑）",
    "rationale": "「〜てくれる」には他動詞が必要:「直してくれる」。「直る」は自動詞で、物が自然に直る意味になる。"
  },
  {
    "id": "E04", "batch": "B8", "level": "N4",
    "sentence": "歩いて帰るつもりのに飲み過ぎた",
    "status": "ERROR", "tier": "FIX",
    "correction": "歩いて帰るつもりなのに飲み過ぎた",
    "rationale": "「つもり」は名詞なので「のに」の前に「な」が必要:「つもりなのに」。"
  },
  {
    "id": "E13", "batch": "B8", "level": "N3",
    "sentence": "15時に御社に伺います。",
    "status": "CORRECT", "tier": "NONE", "correction": "—",
    "rationale": "相手の会社を訪問する謙譲表現として正しい。ビジネスの場面で自然な敬語。"
  },
  {
    "id": "E17", "batch": "B8", "level": "N2",
    "sentence": "僕は優しいから僕の罪悪感をつけ込んだ．",
    "status": "ERROR", "tier": "FIX",
    "correction": "僕が優しいから、僕の罪悪感につけ込んだ．",
    "rationale": "「付け込む」は付け入る対象を「に」で示す:「罪悪感につけ込む」。「を」は誤り。"
  },
  {
    "id": "E37", "batch": "B8", "level": "N5",
    "sentence": "ゴルフ好き人のためだけではなく、気になる人も集まりたいでしょ？",
    "status": "ERROR", "tier": "FIX",
    "correction": "ゴルフが好きな人のためだけではなく、気になる人も集まりたいでしょ？",
    "rationale": "「好き」はな形容詞で、名詞の前には「な」が必要:「好きな人」。"
  },
  {
    "id": "E35", "batch": "B8", "level": "N3",
    "sentence": "あの時、誰もに興味がなかったよ",
    "status": "ERROR", "tier": "FIX",
    "correction": "あの時、誰にも興味がなかったよ",
    "rationale": "「も」は格助詞「に」の後ろに付く:「誰にも」。「誰もに」は順序が逆。「誰も来なかった」のように「誰も」が単独で主語になる形があるため、「誰も」を一つの塊と捉えてしまいやすい。"
  }
];

// ---------- shared rendering (matches build-key-check-forms.gs) ----------

function intendedJa(status) {
  return status === 'CORRECT' ? '誤りなし' : '誤りあり';
}

function itemTitle(row) {
  return row.id + ' ・ ' + row.sentence + '（レベル:' + row.level + '）';
}

function itemHelp(row) {
  return '【文】\n' + row.sentence + '\n' +
         'レベル: ' + row.level + ' ・ 出題の想定: ' + intendedJa(row.status) + '\n\n' +
         '【解答キー】\n' +
         '判定: ' + row.tier + '\n' +
         '修正案: ' + row.correction + '\n' +
         '理由: ' + row.rationale;
}

function formDescription(batch, n) {
  return '文法チェックツールを採点する前に、「解答キー」（想定される判定と修正）が正しいかどうかを確認していただくフォームです。\n\n' +
    'この' + batch + 'バッチには' + n + '文あります。所要時間は10〜15分ほどです。途中保存はできないので、1回で最後までお願いします。\n\n' +
    '各文について：文とその解答キー（判定・修正案・理由）が表示されます。キーが正しいか判断してください。\n' +
    '・問題なし ＝ キーは正しい\n' +
    '・要修正 ＝ キーが間違っている（あなたの修正案を書いてください）\n' +
    '・一部修正 ＝ おおむね正しいが直しが必要（補足を書いてください）\n\n' +
    '【判定ラベルの意味】\n' +
    '・FIX ＝ 文法的な誤り（テストで×になるもの）\n' +
    '・UNNATURAL ＝ 文法的には正しいが、母語話者はそう言わない\n' +
    '・NONE ＝ 指摘なし（正しく自然な文）\n\n' +
    '【確認していただく範囲について】\n' +
    'レベル（N5〜N2）と「出題の想定」は出題側の情報で、確認の対象ではありません。' +
    '見ていただきたいのは【解答キー】の判定・修正案・理由だけです。\n' +
    '「出題の想定: 誤りなし」の文は、間違いのない文として出題されています。本当に間違いがないかを確認してください。\n' +
    'ツールの出力はまだ見ないでください（このフォームには含まれていません）。';
}

// ---------- the patch ----------

function patchB7B8() {
  var batches = {};
  DATA.forEach(function (row) {
    (batches[row.batch] = batches[row.batch] || []).push(row);
  });

  ['B7', 'B8'].forEach(function (b) {
    var form = FormApp.openById(FORM_IDS[b]);

    // Refuse to touch a form that already has answers.
    if (form.getResponses().length > 0) {
      Logger.log(b + '  SKIPPED — form already has ' + form.getResponses().length +
                 ' response(s). Rebuilding would discard them.');
      return;
    }

    var items = form.getItems();
    for (var i = items.length - 1; i >= 0; i--) form.deleteItem(items[i]);

    var rows = batches[b];
    form.setTitle('Naoshi — キー確認 ' + b + ' (' + rows.length + '文)');
    form.setDescription(formDescription(b, rows.length));
    form.setConfirmationMessage('ありがとうございました！ ' + b + ' の確認はこれで完了です。');

    form.addTextItem()
      .setTitle('お名前 / Your name')
      .setHelpText('どのバッチを誰が確認したか記録するためだけに使います。')
      .setRequired(true);

    rows.forEach(function (row, i) {
      if (i > 0) form.addPageBreakItem().setTitle(row.id + ' （' + (i + 1) + '/' + rows.length + '）');
      form.addSectionHeaderItem().setTitle(itemTitle(row)).setHelpText(itemHelp(row));
      form.addMultipleChoiceItem()
        .setTitle(row.id + ' ・ キー確認')
        .setChoiceValues(['問題なし', '要修正', '一部修正'])
        .setRequired(true);
      form.addParagraphTextItem()
        .setTitle(row.id + ' ・ 修正案')
        .setHelpText('「要修正」「一部修正」の場合はこちらに。')
        .setRequired(false);
      form.addParagraphTextItem()
        .setTitle(row.id + ' ・ コメント')
        .setRequired(false);
    });

    Logger.log(b + '  rebuilt with ' + rows.length + ' sentences');
    Logger.log(b + '  LIVE: ' + form.getPublishedUrl());
  });

  Logger.log('');
  Logger.log('Now check the B7/B8 tabs of the response spreadsheet for stale');
  Logger.log('duplicate header columns before sending the links.');
}
