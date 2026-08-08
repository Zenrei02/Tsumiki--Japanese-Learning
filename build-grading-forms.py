# -*- coding: utf-8 -*-
"""
Generates build-grading-forms.gs — the Step 3 (blind grading) Google Forms script.

Step 2 (key check) had its 40 sentences hand-baked into build-key-check-forms.gs.
Step 3 can't work that way: the 120 rows it grades don't exist until the bake-off
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
  build-grading-forms.gs — 8 forms, one per batch, 15 outputs each, all feeding
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

BG_FIRST, BG_LAST = 5, 124       # Blind Grading data rows
ES_FIRST, ES_LAST = 6, 45        # Eval Set data rows (row 5 is EXAMPLE)
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


def load_outputs():
    """Blind Grading rows, in sheet order. Model code is deliberately not read."""
    if not WB_OUTPUTS.exists():
        die(f"{WB_OUTPUTS.name} not found — run bakeoff-harness.py --run first.")
    ws = openpyxl.load_workbook(WB_OUTPUTS, data_only=True)["Blind Grading"]
    rows, empty = [], []
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
            die(f"{oid} has no batch — the Blind Grading col I formula did not "
                "resolve. Open the workbook once in LibreOffice to recalculate, "
                "save, and re-run.")
        rows.append({
            "oid": oid, "eid": eid, "batch": str(batch).strip(),
            "verdict": str(verdict).strip(), "feedback": (feedback or "").strip(),
        })
    if empty:
        die(f"{len(empty)} Blind Grading rows have no tool verdict "
            f"({', '.join(empty[:5])}{'…' if len(empty) > 5 else ''}). "
            "The bake-off has not finished — re-run bakeoff-harness.py --run.")
    return rows


def intended_ja(status):
    return "誤りなし" if status == "CORRECT" else "誤りあり"


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
            out.append(f"補足: {k['amend_note']}")
        out.append("※ 採点はこの修正後のキーを基準にしてください。")
    return "\n".join(out)


def js(s):
    return ("'" + str(s).replace("\\", "\\\\").replace("'", "\\'")
            .replace("\n", "\\n").replace("\r", "") + "'")


GS_TEMPLATE = '''/**
 * Naoshi Step-3 blind grading forms — one Google Form per batch (B1–B8),
 * 15 tool outputs each, all feeding ONE response spreadsheet.
 *
 * GENERATED FILE — do not hand-edit. Regenerate with:
 *     python3 build-grading-forms.py
 * Generated from: {src}
 *
 * The three outputs for a sentence all sit in the same batch, so one grader
 * sees all three. Which model produced which output is not in this file and
 * must never be added to it.
 *
 * HOW TO RUN
 *   1. script.google.com → New project → paste this over Code.gs
 *   2. Run → buildAllGradingForms   (authorise when prompted)
 *   3. Open the execution log. Send each reviewer the LIVE link for their batch.
 *      Same batch split as Step 2 — B1 first, as calibration.
 *
 * Question titles are prefixed with the Output ID (e.g. "O017 ・ 評価") so
 * responses can be written back into the Blind Grading sheet columns G–H by
 * import-grading-responses.py.
 */

var DATA = [
{data}
];

function buildAllGradingForms() {{
  var ss = SpreadsheetApp.create('Naoshi — ブラインド採点 responses (all batches)');
  var batches = {{}};
  DATA.forEach(function (row) {{
    (batches[row.batch] = batches[row.batch] || []).push(row);
  }});
  Object.keys(batches).sort().forEach(function (b) {{
    buildOneForm(b, batches[b], ss);
  }});
  Logger.log('');
  Logger.log('RESPONSES (all batches, one tab per form): ' + ss.getUrl());
  Logger.log('When batches are done: File → Download → Microsoft Excel, drop the file');
  Logger.log('in the project folder, and run import-grading-responses.py.');
}}

function buildOneForm(batch, rows, ss) {{
  var form = FormApp.create('Naoshi — ブラインド採点 ' + batch + ' (' + rows.length + '件)');
  form.setDescription(
    'ツール（文法チェッカー）の出力を、確認済みの解答キーと照らして採点していただくフォームです。\\n\\n' +
    'この' + batch + 'バッチには' + rows.length + '件の出力があります。所要時間は25〜35分ほどです。' +
    '途中保存はできないので、時間のあるときに1回で最後までお願いします。\\n\\n' +
    '同じ文が複数回出てきます。これは意図的なものです（複数の設定で同じ文を処理しているため）。' +
    'どの出力がどの設定によるものかは伏せてあります。前の判断に合わせようとせず、1件ずつ独立して評価してください。\\n\\n' +
    '【評価の選び方】\\n' +
    '・一致 ＝ ツールの指摘が解答と合っている（種類も内容も正しい）\\n' +
    '・部分一致 ＝ 間違いがあるのは合っているが、種類・箇所・説明のどれかがずれている\\n' +
    '・見逃し ＝ 解答にある間違いをツールが指摘していない\\n' +
    '・誤指摘 ＝ 正しい部分を間違いとして指摘している（いちばん重要なチェック項目です）\\n\\n' +
    '【ツールの判定ラベルの意味】\\n' +
    '・FIX ＝ 文法的な誤り（要修正）\\n' +
    '・UNNATURAL ＝ 文法的には正しいが不自然\\n' +
    '・WORTH KNOWING ＝ 誤りではないが役立つ指摘（例：かな書き→漢字）\\n' +
    '・NONE ＝ 指摘なし（正しく自然な文）\\n\\n' +
    '【採点していただく範囲について】\\n' +
    'レベル（N5〜N2）と「出題の想定」は出題側の情報で、採点の対象ではありません。' +
    '【解答キー】は判断の基準としてお使いください。評価していただくのは【ツールの出力】だけです。'
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
    var body =
      '【文】\\n' + row.sentence + '\\n' +
      'レベル: ' + row.level + ' ・ 出題の想定: ' + row.intended + '\\n\\n' +
      '【解答キー】\\n' + row.key + '\\n\\n' +
      '【ツールの出力】← 採点していただくのはこの部分です\\n' +
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
      .setHelpText('「部分一致」「誤指摘」の場合は、どこがずれているか一言お願いします。')
      .setRequired(false);
  }});

  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  Logger.log(batch + '  EDIT: ' + form.getEditUrl());
  Logger.log(batch + '  LIVE: ' + form.getPublishedUrl());
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
    gs = GS_TEMPLATE.format(src=WB_OUTPUTS.name, data=body)

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
