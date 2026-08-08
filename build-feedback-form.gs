/**
 * Builds the Naoshi eval feedback form, its response sheet, and the prefilled
 * URL for FEEDBACK_FORM_URL — in one run.
 *
 * HOW TO RUN
 *   1. script.google.com → New project
 *   2. Paste this file over the placeholder Code.gs
 *   3. Run → buildNaoshiFeedbackForm  (authorise when prompted)
 *   4. Open the execution log. Three URLs are printed; send me the PREFILL one.
 *
 * Each run makes a FRESH form and sheet — it never reuses an earlier one. If a
 * run fails partway, the form it already created is still sitting in your Drive
 * as "Naoshi — feedback on a check" with a matching "Naoshi — feedback
 * responses" sheet. Delete both before re-running or they accumulate.
 */
function buildNaoshiFeedbackForm() {
  var form = FormApp.create('Naoshi — feedback on a check');

  form.setDescription(
    'You just ran a check in Naoshi and marked the corrections. This sends those marks to us.\n\n' +
    'It takes about a minute. Nothing here identifies you.'
  );

  // Anonymous by design: the in-app copy already promises "no name, email, or
  // account details", so collecting email here would contradict shipped text.
  try { form.setCollectEmail(false); } catch (e) { /* renamed in newer runtimes */ }
  form.setLimitOneResponsePerUser(false);   // one tester submits many checks
  form.setProgressBar(false);
  form.setShuffleQuestions(false);
  form.setAllowResponseEdits(false);
  form.setConfirmationMessage(
    'Thank you — that check is now part of the data set that decides how this tool gets built. ' +
    'You can close this tab and carry on.'
  );

  // ── Q1 · ref code (prefilled from the app, so nobody types it) ────────────
  var q1 = form.addTextItem()
    .setTitle('Check reference code')
    .setHelpText('Shown next to the "Copy this check" button as "ref ABC123".')
    .setRequired(true);
  q1.setValidation(
    FormApp.createTextValidation()
      .setHelpText('Six characters — letters and numbers.')
      .requireTextMatchesPattern('^[0-9A-Z]{6}$')
      .build()
  );

  // ── Q2 · the payload ─────────────────────────────────────────────────────
  var q2 = form.addParagraphTextItem()
    .setTitle('Paste your check here')
    .setHelpText('Tap "Copy this check" in the app, then paste. It should start with a curly brace.')
    .setRequired(true);
  q2.setValidation(
    FormApp.createParagraphTextValidation()
      .setHelpText("That doesn't look like a copied check — it should start with {")
      .requireTextMatchesPattern('^\\s*\\{')
      .build()
  );

  // ── Q3 · level ───────────────────────────────────────────────────────────
  form.addMultipleChoiceItem()
    .setTitle('Where are you in your Japanese?')
    .setChoiceValues([
      'Just starting — still on kana',
      'Beginner (Stage 1, roughly N5)',
      'Upper beginner (Stage 2, roughly N4)',
      'Intermediate (Stage 3+, N3 and above)',
      "I'm a native or near-native speaker"
    ])
    .setRequired(false);

  // ── Q4 · the recall question, branching ──────────────────────────────────
  var q4 = form.addMultipleChoiceItem()
    .setTitle("Was there anything you were unsure about that the tool didn't mention?")
    .setRequired(false);

  var pageDetail = form.addPageBreakItem().setTitle('What was it?');
  form.addParagraphTextItem()
    .setTitle('What were you unsure about?')
    .setHelpText('Roughly which part of the sentence, and what you were unsure about.')
    .setRequired(false);

  var pageLast = form.addPageBreakItem().setTitle('Last two');
  pageDetail.setGoToPage(pageLast);

  q4.setChoices([
    q4.createChoice('No, it covered everything I wondered about', pageLast),
    q4.createChoice('Yes', pageDetail),
    q4.createChoice('Not sure', pageLast)
  ]);

  // ── Q5 · which tier earned its place ─────────────────────────────────────
  // Labels match the checker's TIER table exactly. If those labels change,
  // change them here too or the answers stop mapping.
  form.addMultipleChoiceItem()
    .setTitle('Which part of the feedback was most useful?')
    .setChoiceValues([
      'The things marked FIX',
      'The things marked CORRECT, BUT UNNATURAL',
      'The things marked WORTH KNOWING',
      'The rewritten version at the end',
      'The furigana / readings',
      'None of it was useful',
      "I couldn't tell the tiers apart"
    ])
    .setRequired(false);

  // ── Q6 · catch-all ───────────────────────────────────────────────────────
  form.addParagraphTextItem()
    .setTitle('Anything else?')
    .setRequired(false);

  // ── Responses → sheet, so this joins naoshi-eval-v1 on ref code ──────────
  var ss = SpreadsheetApp.create('Naoshi — feedback responses');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  // Log these first. The form and sheet exist by now, so anything that throws
  // below shouldn't cost you their URLs.
  Logger.log('EDIT    : ' + form.getEditUrl());
  Logger.log('LIVE    : ' + form.getPublishedUrl());
  Logger.log('SHEET   : ' + ss.getUrl());

  // ── Prefilled URL. Saves the manual "Get pre-filled link" step entirely. ──
  // q1 is already a TextItem — addTextItem() returns one, so there is no
  // asTextItem() cast to make. createResponse() is called on it directly.
  try {
    var prefill = form.createResponse()
      .withItemResponse(q1.createResponse('TESTCODE'))
      .toPrefilledUrl();
    Logger.log('PREFILL : ' + prefill);
  } catch (e) {
    Logger.log('PREFILL : failed (' + e.message + ')');
    Logger.log('          Fall back to  ⋮ → Get pre-filled link  on the form above.');
  }
  Logger.log('');
  Logger.log('Send me the PREFILL line — it carries the entry ID I need to wire');
  Logger.log('FEEDBACK_FORM_URL so the ref code fills itself.');
}
