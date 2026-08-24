# -*- coding: utf-8 -*-
"""
Generates build-grading-forms.gs — the Step 3 (blind grading) Google Forms script.

Step 2 (key check) had its sentences hand-baked into build-key-check-forms.gs.
Step 3 can't work that way: the rows it grades don't exist until the bake-off
harness has run. So this script reads the filled workbook and WRITES the .gs.

WHAT IT READS
  naoshi-eval-v1-with-outputs.xlsx  — Blind Grading E/F (tool verdict + feedback),
                                      produced by bakeoff-harness.py --run
  naoshi-eval-v1.xlsx               — Eval Set G/H (the key) and J/K/L (the
                                      reviewer's Step 2 verification of that key)
  build-key-check-forms.gs          — the JAPANESE key rationales

The key is deliberately read from the MASTER workbook, not the copy: Step 2
responses are imported into the master, and the master is the source of truth for
whether a key row was amended. If the two workbooks disagree on a sentence, this
script stops rather than guess.

RATIONALES COME FROM THE .GS, NOT THE WORKBOOK
  Eval Set column I is English by design — it is Lloyd-facing (Step 1). The
  reviewer-facing Japanese rationales live in build-key-check-forms.gs, written
  for the Step 2 v2 rebuild. Reading column I here would put English back in
  front of the reviewer, which is the exact bug that forced that rebuild
  (Aug 6 2026: reviewer-facing surfaces are Japanese-primary).

WHAT IT WRITES
  build-grading-forms.gs — one form per batch, sized from the data (batches are
  UNEVEN since Aug 12 2026: B5=12, B8=18, B9=30 outputs, rest 15), all feeding
  one response spreadsheet. Paste into script.google.com, run buildAllGradingForms.

BLINDING
  Column C (model code) is never read into DATA and the emitted file is asserted
  free of M1/M2/M3 before it is saved. A grader who can tell which model produced
  an output makes the whole bake-off worthless.

ORDERING
  Row order within a batch is the Blind Grading sheet's pre-shuffled order, kept
  verbatim. Do not sort — the shuffle is what stops a grader inferring the model
  from position.

USAGE
  python3 build-grading-forms.py
"""
import re
import sys
from pathlib import Path

import openpyxl

HERE = Path(__file__).resolve().parent
WB_MASTER = HERE / "naoshi-eval-v1.xlsx"
WB_OUTPUTS = HERE / "naoshi-eval-v1-with-outputs.xlsx"
GS_STEP2 = HERE / "build-key-check-forms.gs"
GS_OUT = HERE / "build-grading-forms.gs"

BG_FIRST, BG_LAST = 5, 154       # Blind Grading data rows
ES_FIRST, ES_LAST = 6, 55        # Eval Set data rows (row 5 is EXAMPLE)
AMENDED = {"要修正", "一部修正"}


def die(msg):
    sys.exit(f"STOP: {msg}")


def load_jp_rationales():
    """Eval ID -> Japanese rationale, lifted from the Step 2 forms script.

    Parsed rather than imported because the .gs is a JavaScript file. The DATA
    array is a flat list of object literals with double-quoted keys, so a
    non-greedy block scan is sufficient and stays robust to key reordering.
    """
    if not GS_STEP2.exists():
        die(f"{GS_STEP2.name} not found — it holds the Japanese key rationales.")
    text = GS_STEP2.read_text(encoding="utf-8")
    body = text.split("var DATA = [", 1)[-1].split("\n];", 1)[0]
    out = {}
    for block in re.findall(r"\{(.*?)\n  \}", body, flags=re.S):
        eid = re.search(r'"id":\s*"(E\d{2})"', block)
        rat = re.search(r'"rationale":\s*"(.*?)"\s*$', block, flags=re.S | re.M)
        sen = re.search(r'"sentence":\s*"(.*?)"\s*,\s*$', block, flags=re.S | re.M)
        if eid and rat:
            out[eid.group(1)] = {
                "rationale": rat.group(1).replace('\\"', '"'),
                "sentence": sen.group(1).replace('\\"', '"') if sen else None,
            }
    if not out:
        die(f"Could not parse any rationales out of {GS_STEP2.name}. If its DATA "
            "format changed, this parser needs updating — do not fall back to the "
            "workbook's English column I.")
    return out


def looks_english(s):
    """Mostly Latin letters.

    A ratio, not a presence test: the English column-I rationales quote Japanese
    examples, so 'contains kana' would wave them straight through. Japanese prose
    that happens to name a tier label stays well under the threshold.
    """
    letters = sum(c.isalpha() for c in s)
    latin = sum(1 for c in s if c.isalpha() and c.isascii())
    return letters > 0 and latin / letters > 0.5


def load_keys():
    """Eval ID -> the verified key, as amended by Step 2."""
    if not WB_MASTER.exists():
        die(f"{WB_MASTER.name} not found.")
    ws = openpyxl.load_workbook(WB_MASTER, data_only=True)["Eval Set"]
    jp = load_jp_rationales()
    keys, unverified, missing_jp, drift, english = {}, [], [], [], []
    for r in range(ES_FIRST, ES_LAST + 1):
        eid = ws.cell(row=r, column=1).value
        if not eid:
            continue
        check = (ws.cell(row=r, column=10).value or "").strip()   # J キー確認
        if not check:
            unverified.append(eid)
        sentence = ws.cell(row=r, column=4).value or ""
        src = jp.get(eid)
        if not src:
            missing_jp.append(eid)
            rationale = ""
        else:
            rationale = src["rationale"]
            if src["sentence"] and src["sentence"] != sentence:
                drift.append(eid)
            if looks_english(rationale):
                english.append(eid)
        keys[eid] = {
            "level":       ws.cell(row=r, column=3).value or "",
            "sentence":    sentence,
            "status":      ws.cell(row=r, column=5).value or "",
            "tier":        ws.cell(row=r, column=7).value or "",
            "correction":  ws.cell(row=r, column=8).value or "",
            "rationale":   rationale,
            "check":       check,
            "amendment":   (ws.cell(row=r, column=11).value or "").strip(),  # K 修正案
            "amend_note":  (ws.cell(row=r, column=12).value or "").strip(),  # L コメント
        }
    if unverified:
        die("Step 2 is not complete — no キー確認 answer for: "
            + ", ".join(sorted(unverified))
            + "\nRun import-key-check-responses.py first. Grading against an "
              "unverified key measures the key, not the models.")
    if missing_jp:
        die(f"No Japanese rationale in {GS_STEP2.name} for: {', '.join(sorted(missing_jp))}")
    if drift:
        die("Sentence text differs between the Eval Set and "
            f"{GS_STEP2.name} for: {', '.join(sorted(drift))}. "
            "One of them was edited after the Step 2 forms went out — reconcile "
            "before generating grading forms.")
    if english:
        die(f"Rationale reads as English for: {', '.join(sorted(english))}. "
            "Reviewer-facing surfaces are Japanese-primary (decided Aug 6 2026).")
    return keys


def load_batch_map():
    """Eval ID -> batch, read from Eval Set column M — the source col I points at.

    Blind Grading column I is `=INDEX('Eval Set'!$M$6:$M$55, MATCH(B{r},…))`.
    openpyxl cannot evaluate a formula and does not preserve cached results, so
    EVERY script here that saves the workbook — both importers, this generator's
    inputs — strips column I's cached values and leaves it unreadable.

    Until Aug 21 2026 that made this generator die with "open the workbook once in
    LibreOffice to recalculate", i.e. **regenerating the forms depended on a manual
    GUI step on a machine that may not have LibreOffice**, triggered by a message
    nobody would connect to "an importer ran last week". Read the source column
    instead. The formula stays, because it is what makes the sheet readable to a
    human; it is simply no longer the only way a script can learn the batch.
    """
    ws = openpyxl.load_workbook(WB_MASTER, data_only=True)["Eval Set"]
    out = {}
    for r in range(ES_FIRST, ES_LAST + 1):
        eid = ws.cell(row=r, column=1).value
        batch = ws.cell(row=r, column=13).value          # M バッチ
        if eid and batch:
            out[str(eid).strip()] = str(batch).strip()
    return out


def load_outputs():
    """Blind Grading rows, in sheet order. Model code is deliberately not read."""
    if not WB_OUTPUTS.exists():
        die(f"{WB_OUTPUTS.name} not found — run bakeoff-harness.py --run first.")
    ws = openpyxl.load_workbook(WB_OUTPUTS, data_only=True)["Blind Grading"]
    batch_map = load_batch_map()
    rows, empty, derived = [], [], 0
    for r in range(BG_FIRST, BG_LAST + 1):
        oid = ws.cell(row=r, column=1).value
        eid = ws.cell(row=r, column=2).value
        verdict = ws.cell(row=r, column=5).value
        feedback = ws.cell(row=r, column=6).value
        batch = ws.cell(row=r, column=9).value
        if not oid:
            continue
        if not verdict:
            empty.append(oid)
            continue
        if not batch:
            batch = batch_map.get(str(eid).strip())
            derived += 1
        if not batch:
            die(f"{oid} ({eid}) has no batch: Blind Grading col I did not resolve "
                f"AND Eval Set col M has no entry for {eid}. Reconcile the two "
                "workbooks — do not guess a batch.")
        rows.append({
            "oid": oid, "eid": eid, "batch": str(batch).strip(),
            "verdict": str(verdict).strip(), "feedback": (feedback or "").strip(),
        })
    if empty:
        die(f"{len(empty)} Blind Grading rows have no tool verdict "
            f"({', '.join(empty[:5])}{'…' if len(empty) > 5 else ''}). "
            "The bake-off has not finished — re-run bakeoff-harness.py --run.")
    if derived:
        print(f"NOTE: Blind Grading col I was unresolved for {derived} row(s); "
              "batch taken from Eval Set col M instead. Expected after any script "
              "has saved the workbook — not an error.")
    return rows


def intended_ja(status):
    return "誤りなし" if status == "CORRECT" else "誤りあり"


# ⚠️ THE STEP 2 REVIEWER AND THE STEP 3 GRADER ARE DIFFERENT PEOPLE — Aug 21 2026.
# Eval Set column L keeps her real name, because column L is the provenance record
# and rewriting it would destroy who actually did the Step 2 work. The
# REVIEWER-FACING FORM must not carry it: a grader who cannot place 「ともこ」 reads
# it as noise, and naming her to a third party is a decision, not a default.
# So the tag is redacted to a ROLE, and only at render time. Record and artifact
# want different things here; that is not a contradiction to be resolved by
# picking one.
AMEND_ROLE = "別のネイティブレビュアー"
NAME_TAG_RE = re.compile(r"〔[^〕]*〕\s*$")


def redact_name_tag(note):
    """Replace a TRAILING 〔name〕 provenance tag with a role label.

    Only a tag at the very end is touched — that is where import-key-check-responses
    appends it, verified across all 15 amended rows. A 〔…〕 anywhere else is the
    reviewer's own prose and is left alone.
    """
    note = (note or "").strip()
    if not note:
        return ""
    return NAME_TAG_RE.sub(f"〔{AMEND_ROLE}〕", note).strip()


def key_block(k):
    """The verified key as the grader should see it.

    Level and intended status are deliberately NOT in here. They are 出題側
    metadata, not claims anyone is being asked to check, and a Step 2 reviewer
    told us so on Aug 6 2026: with the level inside the key block, a reviewer who
    disagreed with a level could only say so by marking 要修正, which is
    indistinguishable from "the correction is wrong". Same reasoning applies at
    Step 3 — a grader who thinks the level is off must not be pushed toward
    部分一致, because that number feeds the GO/TUNE gate.
    """
    out = [f"判定: {k['tier']}",
           f"修正案: {k['correction']}",
           f"理由: {k['rationale']}"]
    if k["check"] in AMENDED:
        out.append("")
        out.append(f"【Step 2でレビュアーが修正したキー（{k['check']}）】")
        if k["amendment"]:
            out.append(f"修正案: {k['amendment']}")
        if k["amend_note"]:
            out.append(f"補足: {redact_name_tag(k['amend_note'])}")
        out.append("※ 採点はこの修正後のキーを基準にしてください。")
    return "\n".join(out)


def js(s):
    return ("'" + str(s).replace("\\", "\\\\").replace("'", "\\'")
            .replace("\n", "\\n").replace("\r", "") + "'")


GS_TEMPLATE = '''/**
 * Naoshi Step-3 blind grading forms — one Google Form per batch, all feeding
 * ONE response spreadsheet. Batches are UNEVEN; each form is sized from the
 * data it holds. See the BATCH SIZES line below for the real counts.
 *
 * GENERATED FILE — do not hand-edit. Regenerate with:
 *     python3 build-grading-forms.py
 * Generated from: {src}
 * BATCH SIZES: {sizes} (total {total} outputs across {nbatches} forms)
 *
 * The three outputs for a sentence all sit in the same batch, so one grader
 * sees all three. Which model produced which output is not in this file and
 * must never be added to it.
 *
 * HOW TO RUN
 *   1. script.google.com → New project → paste this over Code.gs
 *   2. Run → buildAllGradingForms   (authorise when prompted)
 *   3. Run → showLinks, and PASTE THE LOG SOMEWHERE PERMANENT. The Apps Script
 *      console clears; showLinks can always reprint it, but only from the same
 *      project under the same account.
 *   4. Send each reviewer the LIVE link for their batch. B1 first, as calibration.
 *
 * ⚠️ RE-RUNNING IS SAFE, AND THAT IS DELIBERATE.
 * This script remembers what it has already built in Script Properties, so a
 * second run SKIPS every finished batch instead of creating a duplicate form.
 * That matters because ~{items} form items sit close to the 6-minute execution
 * limit: a timeout partway through is a normal outcome, not a failure. If it
 * stops early, just run buildAllGradingForms again — or run the single
 * remaining batch, e.g. buildB1(). Never start a fresh project to "try again";
 * a fresh project has no memory and WILL duplicate the forms.
 *
 * Question titles are prefixed with the Output ID (e.g. "O017 ・ 評価") so
 * responses can be written back into the Blind Grading sheet columns G–H by
 * import-grading-responses.py.
 */

var DATA = [
{data}
];

/* ---- entry points ------------------------------------------------------- */

function buildAllGradingForms() {{
  var start = new Date().getTime();
  var batches = batchList();
  var built = 0, skipped = 0, stoppedAt = null;

  for (var i = 0; i < batches.length; i++) {{
    if (new Date().getTime() - start > 4.5 * 60 * 1000) {{
      stoppedAt = batches.slice(i);
      break;
    }}
    if (buildBatch(batches[i])) {{ built++; }} else {{ skipped++; }}
  }}

  Logger.log('');
  Logger.log('Built ' + built + ' form(s) this run; skipped ' + skipped +
             ' already built.');
  if (stoppedAt) {{
    Logger.log('STOPPED SHORT of the 6-minute limit with ' + stoppedAt.length +
               ' batch(es) left: ' + stoppedAt.join(', '));
    Logger.log('This is expected. Run buildAllGradingForms again — it resumes.');
  }}
  showLinks();
}}

{batchfns}
/** Reprint every link this project has created. Safe to run any time. */
function showLinks() {{
  var props = PropertiesService.getScriptProperties();
  Logger.log('');
  Logger.log('--- LINKS ---');
  batchList().forEach(function (b) {{
    var live = props.getProperty('LIVE_' + b);
    if (live) {{
      Logger.log(b + '  LIVE: ' + live);
      Logger.log(b + '  EDIT: ' + props.getProperty('EDIT_' + b));
    }} else {{
      Logger.log(b + '  (not built yet)');
    }}
  }});
  var id = props.getProperty('RESPONSE_SS_ID');
  Logger.log('RESPONSES (one tab per form): ' + (id
    ? 'https://docs.google.com/spreadsheets/d/' + id + '/edit'
    : '(not created yet)'));
  Logger.log('When batches are done: File → Download → Microsoft Excel, drop the file');
  Logger.log('in the project folder, and run import-grading-responses.py.');
}}

/**
 * Forget every form this project built. It does NOT delete the forms — it only
 * makes the script willing to build them a SECOND time. Nothing in the normal
 * workflow needs this; if a form went wrong, delete that form in Drive first,
 * then clear its two keys by hand.
 */
function resetGradingFormsState() {{
  throw new Error('Refusing to run automatically. If you really mean it, open ' +
    'Project Settings → Script Properties and delete the keys by hand. ' +
    'Clearing this state is how duplicate live forms get created.');
}}

/* ---- machinery ---------------------------------------------------------- */

function batchList() {{
  var seen = {{}}, out = [];
  DATA.forEach(function (r) {{
    if (!seen[r.batch]) {{ seen[r.batch] = true; out.push(r.batch); }}
  }});
  return out.sort();
}}

function rowsFor(batch) {{
  var rows = DATA.filter(function (r) {{ return r.batch === batch; }});
  if (!rows.length) throw new Error('No rows for batch ' + batch + '.');
  return rows;
}}

/** Returns true if it built the form, false if it was already built. */
function buildBatch(batch) {{
  var props = PropertiesService.getScriptProperties();
  var live = props.getProperty('LIVE_' + batch);
  if (live) {{
    Logger.log(batch + '  already built — ' + live);
    return false;
  }}
  var partial = props.getProperty('EDIT_' + batch);
  if (partial) {{
    throw new Error(batch + ' was left HALF-BUILT by an earlier run: the form ' +
      'exists (' + partial + ') but its questions were not finished. Open it, ' +
      'delete it in Drive, then delete the EDIT_' + batch + ' key in Project ' +
      'Settings → Script Properties, then run this again. Building on top of a ' +
      'half-built form would leave two live forms for one batch.');
  }}
  buildOneForm(batch, rowsFor(batch), responseSheet());
  return true;
}}

/** The one response spreadsheet, created on first use and reused thereafter. */
function responseSheet() {{
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('RESPONSE_SS_ID');
  if (id) {{
    try {{
      return SpreadsheetApp.openById(id);
    }} catch (e) {{
      throw new Error('The stored response spreadsheet (' + id + ') could not be ' +
        'opened — it may be trashed, or you may be signed in as a different ' +
        'account. Do NOT re-run blind: check Drive first, because building again ' +
        'would create a second set of live forms.');
    }}
  }}
  var ss = SpreadsheetApp.create('Naoshi — ブラインド採点 responses (all batches)');
  props.setProperty('RESPONSE_SS_ID', ss.getId());
  Logger.log('RESPONSES created: ' + ss.getUrl());
  return ss;
}}

function buildOneForm(batch, rows, ss) {{
  var form = FormApp.create('Naoshi — ブラインド採点 ' + batch + ' (' + rows.length + '件)');
  // Recorded the moment it exists, so a run that dies mid-build leaves a trail
  // to the orphan instead of an invisible form nobody can find again.
  PropertiesService.getScriptProperties()
    .setProperty('EDIT_' + batch, form.getEditUrl());
  // ── Rewritten Aug 24 2026, from B1's own feedback. The grader described the page
  //    as ①間違えた文章 → ②日本人の訂正した正しい文章 → ③また間違えた文章 and could not
  //    tell whether ③ was hers to correct. Read as a sequence of SENTENCES that is
  //    exactly what it looks like, and one line saying 「← 採点していただくのはこの部分です」
  //    did not survive the impression. The blocks are now named by ROLE, the four
  //    verdicts are defined as a comparison of ② against ③ rather than as
  //    free-standing judgements, and the "you are not correcting anything" statement
  //    is the first thing on the page rather than the last.
  //
  //    KEEP IN SYNC WITH patch-grading-forms-v2.gs, which applies this same text to
  //    the nine forms that are already live. If you edit one, edit both — otherwise
  //    the next regeneration silently reverts the live wording.
  form.setDescription(
    'ツール（文法チェッカー）が出した指摘が、確認済みの解答キーとどれくらい合っているかを' +
    '見ていただくフォームです。\\n\\n' +
    '⚠️ いちばん大事なこと：日本語を直していただく必要はありません。\\n' +
    'このフォームに出てくる文は、どれも「直すため」ではなく「見比べるため」に置いてあります。\\n\\n' +
    '【各ページの3つのブロック】\\n' +
    '① 学習者が書いた文 … 間違いを含む文です。直さなくて大丈夫です。\\n' +
    '② 正解 … ネイティブが確認済みの正解です。判断の基準にしてください。直さなくて大丈夫です。\\n' +
    '③ ツールの答え … ツールが出した指摘です。★評価していただくのは、この③だけです。\\n\\n' +
    'やっていただくのは「③は②と同じことを言えているか？」の判断だけです。\\n\\n' +
    '【評価の選び方】（すべて ② と ③ を見比べての判断です）\\n' +
    '・一致 ＝ ②にある間違いを、③も同じように指摘できている\\n' +
    '・部分一致 ＝ ③も間違いには気づいているが、種類・箇所・説明のどれかがずれている\\n' +
    '・見逃し ＝ ②にある間違いを、③が指摘していない\\n' +
    '・誤指摘 ＝ ②では正しいとされている部分を、③が「間違い」だと言っている' +
    '（いちばん重要なチェック項目です）\\n\\n' +
    // The disambiguation B1 actually needed: her 誤指摘 comments were rewrites, so
    // the verdict may have meant "the tool's FIX is bad Japanese" rather than "the
    // tool flagged a correct part" — and only the latter belongs in the gate.
    '※ 「③の指摘は合っているけれど、③が出した直し方が不自然だ」と感じることがあります。' +
    'その場合、評価は上の4つから選んでいただいたうえで、コメント欄に「直し方が不自然」と' +
    '書いてください。評価とコメントで別々に受け取れますので、迷わなくて大丈夫です。\\n\\n' +
    '【③が使うラベルの意味】\\n' +
    '・FIX ＝ 文法的な誤り（要修正）\\n' +
    '・UNNATURAL ＝ 文法的には正しいが不自然\\n' +
    '・WORTH KNOWING ＝ 誤りではないが役立つ指摘（例：かな書き→漢字）\\n' +
    '・NONE ＝ 指摘なし（正しく自然な文）\\n\\n' +
    'この' + batch + 'バッチには' + rows.length + '件の出力があります。' +
    // 所要時間 travels with the batch size (audit 2026-08-23; was hardcoded 25〜35分
    // for every batch — wrong by 2× on B9's 30). ~1.7–2.3 min per output, rounded
    // to 5: 15→25〜35, 12→20〜30, 18→30〜45, 30→50〜70.
    '所要時間は' + (Math.floor(rows.length * 1.7 / 5) * 5) + '〜' +
    (Math.ceil(rows.length * 2.3 / 5) * 5) + '分ほどです。' +
    '途中保存はできないので、時間のあるときに1回で最後までお願いします。\\n\\n' +
    '同じ文が複数回出てきます。これは意図的なものです（複数の設定で同じ文を処理しているため）。' +
    'どの出力がどの設定によるものかは伏せてあります。前の判断に合わせようとせず、1件ずつ独立して評価してください。\\n\\n' +
    'レベル（N5〜N2）と「出題の想定」は出題側の情報で、評価の対象ではありません。'
  );
  try {{ form.setCollectEmail(false); }} catch (e) {{}}
  form.setLimitOneResponsePerUser(false);
  form.setProgressBar(true);
  form.setShuffleQuestions(false);
  form.setAllowResponseEdits(true);
  form.setConfirmationMessage('ありがとうございました！ ' + batch + ' の採点はこれで完了です。');

  form.addTextItem()
    .setTitle('お名前 / Your name')
    .setHelpText('どのバッチを誰が採点したか記録するためだけに使います。')
    .setRequired(true);

  rows.forEach(function (row, i) {{
    if (i > 0) form.addPageBreakItem().setTitle(row.oid + ' （' + (i + 1) + '/' + rows.length + '）');
    // Block labels name a ROLE, not a content type — see the description note above.
    // KEEP IN SYNC with LABELS in patch-grading-forms-v2.gs.
    var body =
      '【① 学習者が書いた文】（間違いを含みます。直さなくて大丈夫です）\\n' + row.sentence + '\\n' +
      'レベル: ' + row.level + ' ・ 出題の想定: ' + row.intended + '\\n\\n' +
      '【② 正解 ＝ 判断の基準】（ネイティブ確認済み。直さなくて大丈夫です）\\n' + row.key + '\\n\\n' +
      '【③ ツールの答え】★評価するのはココだけです ― ②と同じことを言えていますか？\\n' +
      '判定: ' + row.verdict + '\\n' +
      (row.feedback ? row.feedback : '（指摘なし）');
    form.addSectionHeaderItem()
      .setTitle(row.oid + ' ・ ' + row.sentence + '（レベル:' + row.level + '）')
      .setHelpText(body);
    form.addMultipleChoiceItem()
      .setTitle(row.oid + ' ・ 評価')
      .setChoiceValues(['一致', '部分一致', '見逃し', '誤指摘'])
      .setRequired(true);
    form.addParagraphTextItem()
      .setTitle(row.oid + ' ・ コメント')
      .setHelpText('「部分一致」「見逃し」「誤指摘」を選んだときは、②と③のどこが違うか一言だけお願いします。' +
                   '日本語を直していただく必要はありません。' +
                   '「③の直し方が不自然だ」と感じた場合も、ここに書いてください。')
      .setRequired(false);
  }});

  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  Logger.log(batch + '  EDIT: ' + form.getEditUrl());
  Logger.log(batch + '  LIVE: ' + form.getPublishedUrl());
  // LIVE_ is written LAST: it is what marks the batch finished, so a run that
  // dies partway leaves EDIT_ only, and buildBatch refuses rather than duplicate.
  PropertiesService.getScriptProperties()
    .setProperty('LIVE_' + batch, form.getPublishedUrl());
}}
'''


def main():
    keys = load_keys()
    rows = load_outputs()

    records = []
    for row in rows:
        k = keys.get(row["eid"])
        if not k:
            die(f"{row['oid']} points at {row['eid']}, which is not in the Eval Set.")
        records.append({
            "oid": row["oid"], "batch": row["batch"], "sentence": k["sentence"],
            "level": k["level"], "intended": intended_ja(k["status"]),
            "verdict": row["verdict"], "feedback": row["feedback"],
            "key": key_block(k),
        })

    by_batch = {}
    for rec in records:
        by_batch.setdefault(rec["batch"], []).append(rec)
    sizes = {b: len(v) for b, v in sorted(by_batch.items())}
    if len(set(sizes.values())) != 1:
        print(f"  NOTE: uneven batches {sizes} — check the Eval Set batch column.")

    body = ",\n".join(
        "  { oid: %s, batch: %s, sentence: %s, level: %s, intended: %s, "
        "verdict: %s, feedback: %s, key: %s }"
        % (js(r["oid"]), js(r["batch"]), js(r["sentence"]), js(r["level"]),
           js(r["intended"]), js(r["verdict"]), js(r["feedback"]), js(r["key"]))
        for r in records
    )
    order = sorted(by_batch)
    batchfns = "".join(
        "/** Build just %s (%d outputs). Safe to run twice — it skips if done. */\n"
        "function build%s() { buildBatch('%s'); showLinks(); }\n\n" % (b, sizes[b], b, b)
        for b in order
    )
    # 1 name field + 4 items per output (page break, header, choice, comment);
    # the first output has no page break. Close enough to judge the 6-min limit.
    items = len(by_batch) + len(records) * 4 - len(by_batch)

    gs = GS_TEMPLATE.format(
        src=WB_OUTPUTS.name,
        data=body,
        sizes=", ".join(f"{b}={sizes[b]}" for b in order),
        total=len(records),
        nbatches=len(by_batch),
        items=items,
        batchfns=batchfns,
    )

    leak = re.search(r"\bM[123]\b", gs)
    if leak:
        die(f"model code {leak.group(0)!r} leaked into the generated file — "
            "the grading would not be blind. Not writing.")

    GS_OUT.write_text(gs, encoding="utf-8")
    print(f"Wrote {GS_OUT.name} — {len(records)} outputs across {len(by_batch)} batches "
          f"({', '.join(f'{b}:{n}' for b, n in sizes.items())}).")
    amended = sum(1 for k in keys.values() if k["check"] in AMENDED)
    print(f"Key rows carrying a Step 2 amendment: {amended} of {len(keys)}.")
    print("Blinding check passed — no model codes in the output.")
    print("\nNext: paste into script.google.com, run buildAllGradingForms, send the LIVE links.")


if __name__ == "__main__":
    main()
