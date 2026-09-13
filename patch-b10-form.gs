/**
 * patch-b10-form.gs — Session 30 review fixes, applied IN PLACE to the live B10 form.
 *
 * Run from the SAME Apps Script project that built B10 (it reads B10_EDIT from
 * Script Properties). Does NOT create a form, does NOT touch B1–B9, does NOT
 * change the LIVE link. Run patchB10Form() with DRY_RUN = true first and read
 * the log; then set DRY_RUN = false and run it once.
 *
 * What it changes (and nothing else):
 *   1. The form description — the leading "※ …不適切または一部適切にあたります"
 *      sentence is replaced by a neutral pointer. The text below is copied
 *      verbatim from the regenerated build-b10-form.gs, so the live form and
 *      the repo agree byte for byte.
 *   2. On the four key-exact pages: the multiple-choice question is retitled
 *      ("③と④は同じ文です…どちらが近いですか"), its choices become
 *      一致 / 部分一致 / どちらとも言えない, and the reason box is retitled
 *      "その理由" with new help text.
 * Expected log on a real run: 1 description, 4 choice items, 4 reason items.
 */
var DRY_RUN = true;

var NEW_DESCRIPTION =
    'いつもありがとうございます。今回は これまでの9回とは しつもんが ちがいます。\n\n' +
    '⚠️ 日本語を直していただく必要はありません。今回も「見て、判断していただく」だけです。\n\n' +
    '【今回きいていること】\n' +
    'ツールが学習者に見せた「説明」が、学習者にとって適切かどうか、それだけです。\n' +
    '正解キーと合っているかどうか（一致・部分一致…）は、今回は聞いていません。\n\n' +
    '【各ページの内容】\n' +
    '① 学習者が書いた文 … 直さなくて大丈夫です。\n' +
    '② ツールの説明 … 学習者が実際に画面で見た文章です。英語です。\n' +
    '③ ツールが提案した文 … ツールが「こう書けます」と出した文です。\n\n' +
    '②が英語なのは、このツールが英語話者の学習者向けだからです。学習者が読むのは' +
    'この英文そのものですので、そのまま載せています。\n\n' +
    '【評価の選び方】\n' +
    '・適切 ＝ ②を読んだ学習者は、自分の文がどうだったか正しく理解できる\n' +
    '・一部適切 ＝ だいたい伝わるが、足りない・分かりにくいところがある\n' +
    '・不適切 ＝ 学習者が誤解する。または、必要なことが説明されていない\n' +
    '・判断できない ＝ 情報が足りず、決められない\n\n' +
    '※ ③が①と違う場合は、その違いが②で説明されているかどうかも見てください。' +
    '判断はお任せします。コメント欄に一言いただけると助かります。\n\n' +
    '一部のページには【④ ネイティブ確認済みの正解】が付いています。' +
    'そのページだけ、追加の質問があります。\n\n' +
    'この B10 には 24件 あります。所要時間は 40〜60分ほどです。' +
    '途中保存はできないので、時間のあるときに1回で最後までお願いします。\n\n' +
    '同じ文が複数回出てくることがあります。これは意図的なものです。' +
    '前の判断に合わせようとせず、1件ずつ独立して評価してください。'
;

function patchB10Form() {
  var props = PropertiesService.getScriptProperties();
  var editUrl = props.getProperty('B10_EDIT');
  if (!editUrl) throw new Error('B10_EDIT is not set — this is not the project that built B10. Stop.');
  var form = FormApp.openByUrl(editUrl);
  Logger.log('form: ' + form.getTitle());

  var changed = { description: 0, choice: 0, reason: 0 };

  if (form.getDescription() !== NEW_DESCRIPTION) {
    Logger.log('description: WILL CHANGE');
    if (!DRY_RUN) form.setDescription(NEW_DESCRIPTION);
    changed.description++;
  } else {
    Logger.log('description: already current');
  }

  form.getItems().forEach(function (item) {
    var t = item.getTitle();
    var oid = (t.match(/^(O\d{3}) ・ /) || [])[1];
    if (!oid) return;
    if (item.getType() === FormApp.ItemType.MULTIPLE_CHOICE && t.indexOf('ほぼ同じ文') !== -1) {
      var mc = item.asMultipleChoiceItem();
      Logger.log(oid + ': choice item WILL CHANGE');
      if (!DRY_RUN) {
        mc.setTitle(oid + ' ・ ③と④は同じ文です。この場合の評価は、どちらが近いですか（以前の評価は気にせずお答えください）');
        mc.setChoiceValues(['一致', '部分一致', 'どちらとも言えない']);
      }
      changed.choice++;
    }
    if (item.getType() === FormApp.ItemType.PARAGRAPH_TEXT && t.indexOf('「部分一致」の理由') !== -1) {
      var pt = item.asParagraphTextItem();
      Logger.log(oid + ': reason item WILL CHANGE');
      if (!DRY_RUN) {
        pt.setTitle(oid + ' ・ その理由');
        pt.setHelpText('「部分一致」を選んだ場合、どこが違うと感じたか一言いただけると、ツールの評価のしかたを直せます。');
      }
      changed.reason++;
    }
  });

  Logger.log((DRY_RUN ? 'DRY RUN — nothing written. ' : 'APPLIED. ') +
             'description ' + changed.description + ' · choice ' + changed.choice + ' · reason ' + changed.reason +
             ' (expected 1 · 4 · 4 on first run; 0 · 0 · 0 once applied)');
  if (changed.choice !== changed.reason) throw new Error('choice/reason counts differ — inspect before applying');
}
