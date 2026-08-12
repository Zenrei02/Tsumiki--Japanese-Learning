/**
 * Creates the B9 key-check form and links it to the EXISTING response
 * spreadsheet. Aug 12 2026.
 *
 * WHY B9 EXISTS — three gaps found by auditing the set, all closed here:
 *
 *  1. INVENTED-ERROR RATE WAS MEASURED ON SYNTHETIC JAPANESE. 12 of the 13
 *     clean controls were SYNTHETIC; only E11 was REAL. The headline metric
 *     therefore rested almost entirely on sentences written to be clean rather
 *     than on real learner writing that happens to be clean, and the README's
 *     REAL-vs-SYNTHETIC realism check was impossible at 1 vs 12.
 *     → E41–E46: six REAL clean sentences from Lloyd's own chat logs.
 *
 *  2. THE WORTH KNOWING TIER HAD ZERO ROWS. It exists in the locked three-tier
 *     design and in the workbook legend, and regression R4 ("checker must not
 *     assume a learner level it doesn't have") is specifically about that tier.
 *     The eval could not detect the one prompt defect already documented.
 *     → E47 (REAL) and E48 (SYNTHETIC) are the first rows to exercise it.
 *
 *  3. UNNATURAL — "the app's core value tier" — had 3 rows of 46.
 *     → E49, E50 take it to 5.
 *
 * n goes 40 → 50. Gates RE-DERIVED in the same edit: ≤5% still means at most 2
 * invented and ≤3% at most 1, because 2/50 = 4.0% passes and 3/50 = 6.0% fails.
 * The count bar holds for any n from 40 to 59, so this cost nothing.
 *
 * Note the batch is deliberately MIXED (6 CORRECT, 4 ERROR) and ordered so it
 * neither opens nor closes on a run of the same intended status. An all-CORRECT
 * batch would telegraph its own answer key and invite a run of 問題なし clicks,
 * which would compromise exactly the rows added to make the metric trustworthy.
 *
 * HOW TO RUN
 *   1. script.google.com → open the project (or a new one)
 *   2. Paste this over Code.gs
 *   3. Run → buildB9Form   (authorise if prompted)
 *   4. Read the log, open the LIVE link once from OUTSIDE the account to confirm
 *      it is not domain-restricted, then send it.
 */

var RESPONSES_SS_ID = '1og82GhV3xcabE7DMr7NfNR2wtvvmmCQmDaeADyaHqPM';

var DATA = [
  {
    "id": "E43", "batch": "B9", "level": "N4",
    "sentence": "今週末のパーティに行こうかなー",
    "status": "CORRECT", "tier": "NONE", "correction": "—",
    "rationale": "意向形「行こう」＋「かな」で正しい。"
  },
  {
    "id": "E49", "batch": "B9", "level": "N3",
    "sentence": "前はちょっと感情があったけど今はあんまりないと思う",
    "status": "ERROR", "tier": "UNNATURAL",
    "correction": "前はちょっと気持ちがあったけど今はあんまりないと思う",
    "rationale": "文法的には正しいのでUNNATURALどまり。「感情」は心理学的なカテゴリーとしての感情。人に対する気持ちは「気持ち」（慣用的には「気がある」）。"
  },
  {
    "id": "E41", "batch": "B9", "level": "N5",
    "sentence": "日本のランキングはどう思う？",
    "status": "CORRECT", "tier": "NONE", "correction": "—",
    "rationale": "普通の口語の疑問文で、直すところはない。"
  },
  {
    "id": "E47", "batch": "B9", "level": "N5",
    "sentence": "進撃の巨人をみたい〜",
    "status": "ERROR", "tier": "WORTH KNOWING",
    "correction": "進撃の巨人を見たい〜",
    "rationale": "文法の誤りではないため注意喚起（WORTH KNOWING）。「見たい」は漢字で書くのが標準で、かなの「みたい」は「〜のようだ」の意味と紛らわしい。"
  },
  {
    "id": "E45", "batch": "B9", "level": "N3",
    "sentence": "あのとき、凄くハマってたよ…",
    "status": "CORRECT", "tier": "NONE", "correction": "—",
    "rationale": "「ハマってた」は「ハマっていた」の口語の縮約形で、誤りではない。"
  },
  {
    "id": "E50", "batch": "B9", "level": "N3",
    "sentence": "例えば、糖尿病は家族でよくあること。",
    "status": "ERROR", "tier": "UNNATURAL",
    "correction": "例えば、糖尿病は家系によくあること。",
    "rationale": "文法的には正しいのでUNNATURALどまり。「家族」は同居する家族、遺伝的な傾向は「家系」。英語の\"runs in the family\"の直訳。"
  },
  {
    "id": "E46", "batch": "B9", "level": "N3",
    "sentence": "他の仕事を見つけられませんので、近い所で探しました。岡山市はあまり遠くないでしょう？",
    "status": "CORRECT", "tier": "NONE", "correction": "—",
    "rationale": "丁寧体。可能形の否定「見つけられません」＋「ので」、続けて丁寧な疑問文。文法上の問題はない。"
  },
  {
    "id": "E48", "batch": "B9", "level": "N5",
    "sentence": "来週、ともだちと映画を見に行きます。",
    "status": "ERROR", "tier": "WORTH KNOWING",
    "correction": "来週、友達と映画を見に行きます。",
    "rationale": "「友達」が標準的な表記。かなでも誤りではないが、同じ文で「映画」「見」「行」は漢字なので不統一に見える。文法上の問題はない。"
  },
  {
    "id": "E42", "batch": "B9", "level": "N4",
    "sentence": "鳥山先生のネーミングセンスは変！！",
    "status": "CORRECT", "tier": "NONE", "correction": "—",
    "rationale": "「変」を「だ」なしで述語に使うのは口語として普通。"
  },
  {
    "id": "E44", "batch": "B9", "level": "N4",
    "sentence": "今週末はいっぱい宿題があるけど、来週はお休み",
    "status": "CORRECT", "tier": "NONE", "correction": "—",
    "rationale": "口語の二文で、最後を名詞「お休み」で終える普通の書き方。"
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
    'この' + batch + 'バッチには' + n + '文あります。所要時間は20〜25分ほどです。途中保存はできないので、1回で最後までお願いします。\n\n' +
    '各文について：文とその解答キー（判定・修正案・理由）が表示されます。キーが正しいか判断してください。\n' +
    '・問題なし ＝ キーは正しい\n' +
    '・要修正 ＝ キーが間違っている（あなたの修正案を書いてください）\n' +
    '・一部修正 ＝ おおむね正しいが直しが必要（補足を書いてください）\n\n' +
    '【判定ラベルの意味】\n' +
    '・FIX ＝ 文法的な誤り（テストで×になるもの）\n' +
    '・UNNATURAL ＝ 文法的には正しいが、母語話者はそう言わない\n' +
    '・WORTH KNOWING ＝ 誤りではないが、知っておくと役立つ指摘（例：かな表記→漢字表記）\n' +
    '・NONE ＝ 指摘なし（正しく自然な文）\n\n' +
    '【確認していただく範囲について】\n' +
    'レベル（N5〜N2）と「出題の想定」は出題側の情報で、確認の対象ではありません。' +
    '見ていただきたいのは【解答キー】の判定・修正案・理由だけです。\n' +
    '「出題の想定: 誤りなし」の文は、間違いのない文として出題されています。本当に間違いがないかを確認してください。\n' +
    'ツールの出力はまだ見ないでください（このフォームには含まれていません）。';
}

// ---------- build ----------

function buildB9Form() {
  var ss = SpreadsheetApp.openById(RESPONSES_SS_ID);
  var rows = DATA;

  var form = FormApp.create('Naoshi — キー確認 B9 (' + rows.length + '文)');
  form.setDescription(formDescription('B9', rows.length));
  try { form.setCollectEmail(false); } catch (e) {}
  form.setLimitOneResponsePerUser(false);
  form.setProgressBar(true);
  form.setShuffleQuestions(false);
  form.setAllowResponseEdits(true);
  form.setConfirmationMessage('ありがとうございました！ B9 の確認はこれで完了です。');

  // Log the durable ids the moment the form exists — an exception later would
  // otherwise orphan it with no record of the url (Session 5).
  Logger.log('B9  EDIT: ' + form.getEditUrl());
  Logger.log('B9  LIVE: ' + form.getPublishedUrl());

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

  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  Logger.log('');
  Logger.log('B9 built with ' + rows.length + ' questions (6 CORRECT, 4 ERROR, mixed order).');
  Logger.log('Responses land in a NEW tab of: ' + ss.getUrl());
}
