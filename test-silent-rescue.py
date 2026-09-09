#!/usr/bin/env python3
"""
test-silent-rescue.py — does SILENT_RESCUE fire on a rescue and stay quiet on a
width change?

WHY THIS EXISTS. The counter answers one question: did the tool tell the learner
there was nothing to fix and then hand back something different? That makes its
normalisation load-bearing in BOTH directions, and the two failures are opposite
in character.

  FALSE POSITIVE.  O032 (E02 · M2) changed `(笑)` to `（笑）` and nothing else.
                   That is a punctuation width, not an edit the learner would
                   notice, and counting it inflates a figure B10 is built on.

  FALSE NEGATIVE.  Plain NFKC would fix the first case by flattening the whole
                   string — and then a rewrite whose only change is ｱｲｳ → アイウ
                   compares EQUAL to its source and disappears. An orthography
                   change reported as no change at all is the worse direction,
                   because nothing downstream can see that it happened.

cq.norm_punct folds P*/S*/Z* codepoints only, which separates the two.

⚠ THIS FILE EXISTS BECAUSE A GUARD THAT HAS ONLY EVER REFUSED HAS NOT BEEN
TESTED. Session 7 shipped two openpyxl guards that passed against fixtures that
were never broken; the smoke test read a stale bundle for a whole session; the
first stylesheet guard passed against a stripped stylesheet. So every assertion
below has a partner going the other way: for each thing that must NOT count,
something that must.

Exit 0 = every case landed on the expected side.
"""
import importlib.util, json, pathlib, sys

HERE = pathlib.Path(__file__).parent


def load(name, path):
    spec = importlib.util.spec_from_file_location(name, str(path))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


cq = load('_cq', HERE / 'check-rewrite-quality.py')
ab = load('_ab', HERE / 'analyse-bakeoff-log.py')

fails = 0


def case(label, got, want):
    global fails
    ok = got == want
    if not ok:
        fails += 1
    print(f"{'ok   ' if ok else 'FAIL '} {label:<52} -> {got!r} (wanted {want!r})")


# ── norm_punct: what it folds, and what it must not touch ────────────────────
print('norm_punct — punctuation folds, words do not')
case('（笑） and (笑) are the same string',
     cq.norm_punct('本当に面白かった（笑）') == cq.norm_punct('本当に面白かった(笑)'), True)
case('！ and ! are the same string',
     cq.norm_punct('やった！') == cq.norm_punct('やった!'), True)
case('ideographic space folds to a normal one',
     cq.norm_punct('私は　学生です') == cq.norm_punct('私は 学生です'), True)
# The control. If these came back True the fold is reaching into the text and
# the false-negative case above is live.
case('half-width KANA is NOT folded away (control)',
     cq.norm_punct('ｱｲｳ') == cq.norm_punct('アイウ'), False)
case('full-width LATIN is NOT folded away (control)',
     cq.norm_punct('ＡＢＣ') == cq.norm_punct('ABC'), False)
case('a real edit is still a difference (control)',
     cq.norm_punct('えりが直ってくれる') == cq.norm_punct('えりが直してくれる'), False)

# ── silent_rescue: the verdict gate and the change gate ──────────────────────
print('\nsilent_rescue — the verdict gate and the change gate')
# Synthetic on purpose: the gates below care about the SHAPE of the edit, not
# about this being a real eval row, and a tracked file should not carry one
# for free. The rows that must be real — O032 and O043 — are read from the
# log and the workbook at run time, further down.
SRC = 'このへやはちいさすぎので、つかえない'
case('NONE + a real change            = a rescue',
     ab.silent_rescue('NONE', SRC, SRC.replace('すぎので', 'すぎるので'), True),
     'TOWARD_KEY')
case('NONE + a real change, no key edit applied',
     ab.silent_rescue('NONE', SRC, SRC.replace('つかえない', '使えない'), False), 'AWAY')
case('WORTH KNOWING is also a silent tier',
     ab.silent_rescue('WORTH KNOWING', SRC, SRC + 'よ', False), 'AWAY')
case('FIX is NOT a silent tier — it was announced',
     ab.silent_rescue('FIX', SRC, SRC.replace('すぎので', 'すぎるので'), True), None)
case('NONE + no change at all         = not a rescue',
     ab.silent_rescue('NONE', SRC, SRC, False), None)
case('NONE + an empty rewrite         = not a rescue',
     ab.silent_rescue('NONE', SRC, '', False), None)

# ── O032 — READ THE ROW, NOT THE BRIEF ───────────────────────────────────────
# ⚠ The Session 31 brief states that O032 (E02 · M2) "changed only `(笑)` to
# `（笑）` and is not a rescue". The first half is FALSE. Its rewrite is
# byte-identical to its source in all three runs — the source already carries a
# full-width （笑） and the tool echoed the sentence back untouched.
#
# The conclusion survives and the reason does not: O032 is not a rescue because
# NOTHING CHANGED, not because a width fold neutralised a change. Checked across
# all 447 log rows in all three runs, there is no row anywhere whose rewrite
# differs from its source only in punctuation width, and no row where plain NFKC
# would hide a change that norm_punct keeps. The two normalisations return the
# same answer on every row this project has.
#
# So norm_punct is a guard that has NEVER FIRED ON LIVE DATA. That is exactly the
# state this repo has been burned by three times, and it is why the width cases
# above are synthetic: they are the only exercise the fold gets. Keep them. If a
# future run produces a real width-only edit, this is the assertion that will
# already have decided what to do with it.
print('\nO032 (E02 · M2) — read from the log, not from the brief')
rec = None
for line in open(HERE / 'bakeoff-log.jsonl', encoding='utf-8'):
    if not line.strip():
        continue
    r = json.loads(line)
    if r.get('output_id') == 'O032' and r.get('schema') == 'naoshi-4':
        rec = r
        break
if rec is None:
    print('FAIL  O032 not found in bakeoff-log.jsonl — fixture is gone, not passing')
    fails += 1
else:
    import openpyxl
    wb = openpyxl.load_workbook(HERE / 'naoshi-eval-v1-with-outputs.xlsx',
                                data_only=True)
    es = wb['Eval Set']

    def source_of(eid):
        for r_ in range(1, es.max_row + 1):
            v = es.cell(row=r_, column=1).value
            if isinstance(v, str) and v.strip() == eid:
                return str(es.cell(row=r_, column=4).value or '').strip()
        return ''

    src_raw = source_of(rec['eval_id'])
    rw_raw = cq.parse_rewrite_raw(rec.get('feedback'))
    case('its verdict is a silent tier, so the gate is open',
         (rec.get('verdict') or '').upper() in cq.SILENT_TIERS, True)
    case('the rewrite is byte-identical to the source',
         rw_raw == src_raw, True)
    case('the source already carries a FULL-WIDTH （笑）', '（笑）' in src_raw, True)
    case('so O032 is not a rescue — for want of any change at all',
         ab.silent_rescue(rec.get('verdict'), src_raw, rw_raw, False), None)

    # THE PARTNER THAT MUST FIRE. Without this the block above is four ways of
    # saying "nothing happened", which a broken counter also says.
    o43 = None
    for line in open(HERE / 'bakeoff-log.jsonl', encoding='utf-8'):
        if not line.strip():
            continue
        r = json.loads(line)
        if r.get('output_id') == 'O043' and r.get('schema') == 'naoshi-4':
            o43 = r
            break
    if o43 is None:
        print('FAIL  O043 not found — the positive control is missing')
        fails += 1
    else:
        src43 = source_of(o43['eval_id'])
        rw43 = cq.parse_rewrite_raw(o43.get('feedback'))
        case('O043 IS a silent rescue (positive control)',
             ab.silent_rescue(o43.get('verdict'), src43, rw43, False) is not None,
             True)
        case('...and it is AWAY, not toward the key (control)',
             ab.silent_rescue(o43.get('verdict'), src43, rw43, False), 'AWAY')

# ── the whole-corpus claim, asserted rather than remembered ──────────────────
print('\ncorpus — is the punctuation fold doing anything on real data?')
import openpyxl
_wb = openpyxl.load_workbook(HERE / 'naoshi-eval-v1-with-outputs.xlsx', data_only=True)
_es = _wb['Eval Set']
_sent = {}
for _r in range(1, _es.max_row + 1):
    _v = _es.cell(row=_r, column=1).value
    if isinstance(_v, str) and cq.EID_RE.match(_v.strip()):
        _sent[_v.strip()] = str(_es.cell(row=_r, column=4).value or '').strip()
width_only = nfkc_hides = scanned = 0
for line in open(HERE / 'bakeoff-log.jsonl', encoding='utf-8'):
    if not line.strip():
        continue
    r = json.loads(line)
    scanned += 1
    s, w = _sent.get(r['eval_id'], ''), cq.parse_rewrite_raw(r.get('feedback'))
    if not w:
        continue
    if w != s and cq.norm_punct(w) == cq.norm_punct(s):
        width_only += 1
    if cq.norm_punct(w) != cq.norm_punct(s) and cq.norm(w) == cq.norm(s):
        nfkc_hides += 1
print(f'      {scanned} log rows scanned across all three runs')
case('no row is a punctuation-width-only change', width_only, 0)
case('no row where plain NFKC would hide a change', nfkc_hides, 0)
print('      ^ both zero means the fold is UNEXERCISED by real data, not that it')
print('        is unnecessary. If either ever becomes non-zero, that run is the')
print('        first one where the choice of normaliser changed a reported number.')

print()
if fails:
    print(f'{fails} FAILED')
    sys.exit(1)
print('every case landed on the expected side — including the six controls that '
      'must NOT fire')
