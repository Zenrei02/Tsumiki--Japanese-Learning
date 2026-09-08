# -*- coding: utf-8 -*-
"""
The three Session 28 analyses, read off the bake-off log. NO API CALLS, EVER.

WHY THIS IS A COMMITTED SCRIPT AND NOT A NOTEBOOK
The "Measurement method" tracker row names three faults, and fault (1) is that
Session 26's headline figures were produced by no committed script, quoted in a
journal, and had to be reconstructed by Session 27 before they could be used.
Fix (b) is that every derived metric becomes a file. These three analyses feed
journal figures, so they are a file.

THE THREE MODES

--paired   (§2a) THE HIGHEST-VALUE COMPARISON AVAILABLE, and the only paired one.
           Every naoshi-6 row logs `rewrite_pass1` — the single-pass rewrite —
           beside the two-pass rewrite, both produced from a BYTE-IDENTICAL
           diagnosis, because pass 2 cannot touch the issues array. That makes
           the two architectures comparable WITHIN a row, so the between-run
           variance that makes every other comparison in this project uncertain
           cancels out. Where this disagrees with the across-run figures in the
           Session 27 journal, THIS is the better number.

--census   (§2b) The finding that closed the rewrite thread: on rows the eval
           marks ERROR, the tool returned only NONE or WORTH KNOWING. Counted
           across all three runs and broken down by pattern, JLPT level and
           model, with the rows every model missed called out — those are the
           ones no model choice can fix.

--floor    (SESSION 28, NOT IN THE BRIEF) THE NOISE FLOOR, FOR FREE.
           Session 28.1 is written to spend ~$4 running naoshi-4 a second time to
           find out how much moves when nothing changes. It has already been run
           a second time. Every naoshi-6 row logs pass 1's prompt md5 as
           7cabba30… — byte-identical to the naoshi-4 prompt — and pass 1 is the
           SAME request the single-pass path makes (same system prompt, same user
           content, same call site). So a naoshi-6 row's verdict, issues and
           `rewrite_pass1` are a naoshi-4 output produced 24 days later.
           naoshi-4 vs naoshi-6-pass-1 is therefore a null-change comparison, and
           this mode reads the floor off it at a cost of nothing.

--tiers    (§2c) Every counter recomputed with self-inconsistency reported BY
           TIER instead of summed. Session 27 decomposed this by hand for one
           run; here it is the default for all three.

Scoring is imported from check-rewrite-quality.py rather than reimplemented.
That file warns that two copies of a lexicon drift, and its own reviewer
comparison rests on importing check-unnatural-rewrite.py for exactly this
reason.

USAGE
  python3 analyse-bakeoff-log.py [--paired] [--census] [--tiers] [workbook.xlsx]
  (no mode given runs all three)

Exit codes: 0 fine · 2 refused (nothing scanned)
"""
import importlib.util
import json
import sys
from difflib import SequenceMatcher
from collections import Counter, defaultdict
from pathlib import Path

import openpyxl

HERE = Path(__file__).resolve().parent
DEFAULT_WB = HERE / 'naoshi-eval-v1-with-outputs.xlsx'
LOG = HERE / 'bakeoff-log.jsonl'
SCORER = HERE / 'check-rewrite-quality.py'
SCHEMAS = ('naoshi-4', 'naoshi-5', 'naoshi-6')
UNDER_DIAGNOSED = {'NONE', 'WORTH KNOWING'}
# Eval Set columns (1-based), as check-rewrite-quality.py names them.
E_ID, E_SRC, E_LEVEL, E_SENT, E_STATUS, E_WATCH, E_TIER, E_KEY = 1, 2, 3, 4, 5, 6, 7, 8


def load_scorer():
    spec = importlib.util.spec_from_file_location('_cq', str(SCORER))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


cq = load_scorer()


def load_eval(path):
    wb = openpyxl.load_workbook(path, data_only=True)
    ws = wb['Eval Set']
    out = {}
    for r in range(1, ws.max_row + 1):
        v = ws.cell(row=r, column=E_ID).value
        if not (isinstance(v, str) and cq.EID_RE.match(v.strip())):
            continue
        key = cq.norm(ws.cell(row=r, column=E_KEY).value)
        out[v.strip()] = {
            'sent': cq.norm(ws.cell(row=r, column=E_SENT).value),
            'key': '' if key == cq.NO_CORRECTION else key,
            'status': (ws.cell(row=r, column=E_STATUS).value or '').strip(),
            'level': (ws.cell(row=r, column=E_LEVEL).value or '').strip(),
            'source': (ws.cell(row=r, column=E_SRC).value or '').strip(),
            'pattern': (ws.cell(row=r, column=E_WATCH).value or '').strip(),
            'exp_tier': (ws.cell(row=r, column=E_TIER).value or '').strip(),
        }
    return out


def load_log():
    return [json.loads(l) for l in open(LOG, encoding='utf-8') if l.strip()]


def score(src, key, feedback, rewrite):
    """All of check-rewrite-quality.py's signals for one (rewrite, diagnosis)."""
    edits = cq.target_edits(src, key) if key else []
    mask = cq.preserved_mask(src, rewrite) if rewrite else [False] * len(src)
    verdicts, kept_by_edit = [], []
    if rewrite:
        for i1, i2, s_span, k_span in edits:
            v, kept = cq.classify_edit(i1, i2, s_span, k_span, rewrite, mask)
            verdicts.append(v)
            kept_by_edit.append(kept)
    issues = cq.parse_issues(feedback)
    unapplied = cq.unapplied_issues(issues, rewrite) if rewrite else []
    asked, notes = cq.split_unapplied(unapplied)
    subs = cq.substitutions(src, key, rewrite) if rewrite and key else []
    extras = cq.extra_edits(src, key, rewrite, edits) if rewrite else []
    names = cq.kanjified_names(src, key, rewrite) if rewrite else []
    lex_miss = [1 for e, v, kept in zip(edits, verdicts, kept_by_edit)
                if v in ('MISSED', 'PARTIAL') and cq.lexical(''.join(kept))]
    flags = set()
    if 'MISSED' in verdicts:
        flags.add('TARGET_MISSED')
    if 'PARTIAL' in verdicts:
        flags.add('TARGET_PARTIAL')
    if lex_miss:
        flags.add('LEXICAL_MISS')
    if subs:
        flags.add('SUBSTITUTION')
    if names:
        flags.add('NAME_KANJIFIED')
    if asked:
        flags.add('SELF_INCONSISTENT')
    if notes and not asked:
        flags.add('SELF_NOTE_ONLY')
    if extras:
        flags.add('EXTRA_EDIT')
    return {
        'flags': flags, 'verdicts': verdicts,
        'applied': verdicts.count('APPLIED'), 'edits': len(verdicts),
        'asked': len(asked), 'notes': len(notes),
        'echoed': bool(rewrite) and rewrite == src,
    }


COUNTERS = ['TARGET_MISSED', 'LEXICAL_MISS', 'SUBSTITUTION', 'NAME_KANJIFIED',
            'SELF_INCONSISTENT', 'SELF_NOTE_ONLY', 'TARGET_PARTIAL', 'EXTRA_EDIT']


# ── §2a ───────────────────────────────────────────────────────────────────────
def paired(ev, rows):
    six = [r for r in rows if r.get('schema') == 'naoshi-6' and r.get('rewrite_pass1')]
    print('═' * 78)
    print('§2a  PAIRED: single-pass vs two-pass, same row, same diagnosis')
    print('═' * 78)
    if not six:
        print('  No naoshi-6 rows carry rewrite_pass1 — nothing to pair.')
        return
    print(f'  {len(six)} rows carry both arms. The diagnosis is byte-identical '
          'across the pair,')
    print('  so every difference below is the rewrite architecture and nothing else.\n')

    tot = {'one': Counter(), 'two': Counter()}
    applied = {'one': [0, 0], 'two': [0, 0]}
    ident = {'one': 0, 'two': 0}
    moved = defaultdict(lambda: [0, 0])   # counter -> [rows worse, rows better]
    per_model = defaultdict(lambda: {'one': Counter(), 'two': Counter(), 'n': 0})

    for r in six:
        e = ev[r['eval_id']]
        src, key = e['sent'], e['key']
        fb = r.get('feedback') or ''
        a1 = cq.norm(r.get('rewrite_pass1'))
        a2 = cq.norm((r.get('raw') or {}).get('model_rewrite'))
        s1, s2 = score(src, key, fb, a1), score(src, key, fb, a2)
        m = r.get('model_code', '?')
        per_model[m]['n'] += 1
        for tag, sc, arm in (('one', s1, a1), ('two', s2, a2)):
            for f in sc['flags']:
                tot[tag][f] += 1
                per_model[m][tag][f] += 1
            applied[tag][0] += sc['applied']
            applied[tag][1] += sc['edits']
            if arm and arm == src:
                ident[tag] += 1
            if sc['echoed'] and e['status'] == 'ERROR':
                tot[tag]['ECHOED'] += 1
                per_model[m][tag]['ECHOED'] += 1
        for c in COUNTERS + ['ECHOED']:
            in1 = c in s1['flags'] or (c == 'ECHOED' and s1['echoed']
                                       and e['status'] == 'ERROR')
            in2 = c in s2['flags'] or (c == 'ECHOED' and s2['echoed']
                                       and e['status'] == 'ERROR')
            if in2 and not in1:
                moved[c][0] += 1
            elif in1 and not in2:
                moved[c][1] += 1

    print(f"  {'counter':<20}{'1-pass':>9}{'2-pass':>9}{'delta':>8}   "
          f"{'rows worse':>11}{'rows better':>12}")
    for c in COUNTERS + ['ECHOED']:
        d = tot['two'][c] - tot['one'][c]
        print(f"  {c:<20}{tot['one'][c]:>9}{tot['two'][c]:>9}{d:>+8}   "
              f"{moved[c][0]:>11}{moved[c][1]:>12}")
    print(f"\n  {'key edits applied':<20}{applied['one'][0]:>9}"
          f"{applied['two'][0]:>9}"
          f"{applied['two'][0] - applied['one'][0]:>+8}   of "
          f"{applied['one'][1]} key edits")
    print(f"  {'identical to source':<20}{ident['one']:>9}{ident['two']:>9}"
          f"{ident['two'] - ident['one']:>+8}")

    print('\n  PER MODEL (2-pass minus 1-pass; a paired delta, not an across-run one)')
    print(f"    {'':<4}{'n':>4}" + ''.join(f'{c[:9]:>11}' for c in COUNTERS))
    for m in sorted(per_model):
        d = per_model[m]
        print(f"    {m:<4}{d['n']:>4}"
              + ''.join(f"{d['two'][c] - d['one'][c]:>+11}" for c in COUNTERS))


# ── §2b ───────────────────────────────────────────────────────────────────────
def census(ev, rows, quote=6):
    print('═' * 78)
    print('§2b  UNDER-DIAGNOSIS CENSUS: ERROR rows the tool called NONE / WORTH KNOWING')
    print('═' * 78)
    per_schema = {}
    for schema in SCHEMAS:
        sub = [r for r in rows if r.get('schema') == schema]
        und = [r for r in sub if ev[r['eval_id']]['status'] == 'ERROR'
               and r.get('verdict') in UNDER_DIAGNOSED]
        per_schema[schema] = und
        by_model = Counter(r['model_code'] for r in und)
        print(f"  {schema:<11} {len(und):>3} of "
              f"{sum(1 for r in sub if ev[r['eval_id']]['status'] == 'ERROR')} "
              f"ERROR rows   by model: "
              + '  '.join(f'{m} {n}' for m, n in sorted(by_model.items())))

    print('\n  MISSED BY EVERY MODEL — the rows no model choice can fix')
    for schema in SCHEMAS:
        und = per_schema[schema]
        eids = Counter(r['eval_id'] for r in und)
        all3 = sorted(e for e, n in eids.items() if n == 3)
        two = sorted(e for e, n in eids.items() if n == 2)
        print(f"    {schema:<11} all three: {all3 if all3 else '—'}"
              f"   two of three: {two if two else '—'}")

    print('\n  BY WATCHLIST PATTERN AND LEVEL (union across all three runs)')
    union = defaultdict(set)
    for schema in SCHEMAS:
        for r in per_schema[schema]:
            union[r['eval_id']].add(schema)
    pat = Counter(); lvl = Counter(); tier = Counter()
    for eid in union:
        pat[ev[eid]['pattern'] or '(none)'] += 1
        lvl[ev[eid]['level'] or '(none)'] += 1
        tier[ev[eid]['exp_tier'] or '(none)'] += 1
    print(f"    {len(union)} distinct eval sentences under-diagnosed at least once.")
    for label, c in (('level', lvl), ('expected tier', tier)):
        print(f"    by {label}: " + '  '.join(f'{k} {v}' for k, v in sorted(c.items())))
    print('    by pattern:')
    for k, v in sorted(pat.items(), key=lambda kv: -kv[1]):
        print(f'      {v:>2}  {k}')

    print('\n  WHAT THE LEARNER WAS ACTUALLY TOLD — verbatim, the product\'s real output')
    print('  These are rows where the tool saw an ERROR sentence and did not call it one.')
    shown = 0
    for schema in SCHEMAS:
        for r in sorted(per_schema[schema], key=lambda r: r['output_id']):
            if shown >= quote:
                break
            e = ev[r['eval_id']]
            print(f"\n    ── {r['output_id']}  {r['eval_id']}  {r['model_code']}  "
                  f"{schema}  verdict={r['verdict']}")
            print(f"       文    {e['sent']}")
            print(f"       key   {e['key'] or '—'}")
            for line in (r.get('feedback') or '').splitlines():
                print(f"       │ {line}")
            shown += 1
        if shown >= quote:
            break


# ── §2c ───────────────────────────────────────────────────────────────────────
def tiers(ev, rows):
    print('═' * 78)
    print('§2c  TIER-AWARE RECOMPUTATION — every counter, all three runs')
    print('═' * 78)
    print('  Self-inconsistency is split: FIX/UNNATURAL is what a rewrite was asked')
    print('  to apply; NOTE is filtered out in code before the rewrite call, so an')
    print('  unapplied note is the design working. Summing them is not a quantity.\n')
    for schema in SCHEMAS:
        sub = [r for r in rows if r.get('schema') == schema]
        if not sub:
            continue
        print(f'  ── {schema}  ({len(sub)} rows)')
        print(f"    {'':<4}{'n':>4}" + ''.join(f'{c[:9]:>11}' for c in COUNTERS)
              + f"{'applied':>12}")
        agg = Counter(); asked_t = 0; note_t = 0
        for m in sorted({r['model_code'] for r in sub}):
            mrows = [r for r in sub if r['model_code'] == m]
            cnt = Counter(); ap = [0, 0]
            for r in mrows:
                e = ev[r['eval_id']]
                sc = score(e['sent'], e['key'], r.get('feedback') or '',
                           cq.norm((r.get('raw') or {}).get('model_rewrite')))
                for f in sc['flags']:
                    cnt[f] += 1
                    agg[f] += 1
                ap[0] += sc['applied']; ap[1] += sc['edits']
                asked_t += sc['asked']; note_t += sc['notes']
            print(f"    {m:<4}{len(mrows):>4}"
                  + ''.join(f'{cnt[c]:>11}' for c in COUNTERS)
                  + f"{ap[0]:>8}/{ap[1]:<3}")
        print(f"    {'all':<4}{len(sub):>4}"
              + ''.join(f'{agg[c]:>11}' for c in COUNTERS))
        print(f"    self-inconsistency issues: {asked_t} asked-for  +  {note_t} note "
              f"=  {asked_t + note_t} summed (the old headline)\n")


def floor(ev, rows):
    """naoshi-4 vs naoshi-6 pass 1 — the same prompt, two runs, 24 days apart."""
    print('═' * 78)
    print('NOISE FLOOR: naoshi-4  vs  naoshi-6 PASS 1 (same prompt, different run)')
    print('═' * 78)
    four = {r['output_id']: r for r in rows if r.get('schema') == 'naoshi-4'}
    six = {r['output_id']: r for r in rows if r.get('schema') == 'naoshi-6'}
    shared = sorted(set(four) & set(six))
    md5s = {r.get('prompt_md5') for r in six.values()}
    print(f'  {len(shared)} output IDs present in both runs.')
    print(f'  naoshi-6 pass-1 prompt md5: {", ".join(sorted(m or "—" for m in md5s))}')
    print('  naoshi-4 used the same text (verified from git: the prompt at 2a7c878^,')
    print('  immediately before the naoshi-5 change, hashes to 7cabba30…).\n')

    tot = {'a': Counter(), 'b': Counter()}
    applied = {'a': [0, 0], 'b': [0, 0]}
    per_model = defaultdict(lambda: {'a': Counter(), 'b': Counter(), 'n': 0,
                                     'ap_a': [0, 0], 'ap_b': [0, 0],
                                     'dv_a': [], 'dv_b': []})
    ident = {'a': 0, 'b': 0}
    identical_rows = 0
    verdict_moved = []
    for oid in shared:
        ra, rb = four[oid], six[oid]
        e = ev[ra['eval_id']]
        src, key = e['sent'], e['key']
        wa = cq.norm((ra.get('raw') or {}).get('model_rewrite'))
        wb_ = cq.norm(rb.get('rewrite_pass1'))
        sa = score(src, key, ra.get('feedback') or '', wa)
        sb = score(src, key, rb.get('feedback') or '', wb_)
        m = ra.get('model_code', '?')
        per_model[m]['n'] += 1
        for tag, sc, arm in (('a', sa, wa), ('b', sb, wb_)):
            for f in sc['flags']:
                tot[tag][f] += 1
                per_model[m][tag][f] += 1
            applied[tag][0] += sc['applied']; applied[tag][1] += sc['edits']
            per_model[m][f'ap_{tag}'][0] += sc['applied']
            per_model[m][f'ap_{tag}'][1] += sc['edits']
            per_model[m][f'dv_{tag}'].append(
                1 - SequenceMatcher(None, e['sent'], arm, autojunk=False).ratio()
                if arm else None)
            if arm and arm == src:
                ident[tag] += 1
            if sc['echoed'] and e['status'] == 'ERROR':
                tot[tag]['ECHOED'] += 1
                per_model[m][tag]['ECHOED'] += 1
        if wa and wa == wb_:
            identical_rows += 1
        if ra.get('verdict') != rb.get('verdict'):
            verdict_moved.append((oid, m, ra.get('verdict'), rb.get('verdict')))

    print(f"  {'counter':<20}{'naoshi-4':>10}{'n6 pass1':>10}{'FLOOR':>8}")
    for c in COUNTERS + ['ECHOED']:
        print(f"  {c:<20}{tot['a'][c]:>10}{tot['b'][c]:>10}"
              f"{tot['b'][c] - tot['a'][c]:>+8}")
    print(f"  {'key edits applied':<20}{applied['a'][0]:>10}{applied['b'][0]:>10}"
          f"{applied['b'][0] - applied['a'][0]:>+8}")
    print(f"  {'identical to source':<20}{ident['a']:>10}{ident['b']:>10}"
          f"{ident['b'] - ident['a']:>+8}")

    print('\n  PER MODEL — the floor, by model (M1 is the one expected to be 0)')
    print(f"    {'':<4}{'n':>4}" + ''.join(f'{c[:9]:>11}' for c in COUNTERS)
          + f"{'applied':>9}")
    for m in sorted(per_model):
        d = per_model[m]
        da = [x for x in d['dv_a'] if x is not None]
        db = [x for x in d['dv_b'] if x is not None]
        dd = (sum(db) / len(db) - sum(da) / len(da)) if da and db else 0.0
        print(f"    {m:<4}{d['n']:>4}"
              + ''.join(f"{d['b'][c] - d['a'][c]:>+11}" for c in COUNTERS)
              + f"{d['ap_b'][0] - d['ap_a'][0]:>+9}"
              + f"   key edits {d['ap_a'][0]}/{d['ap_a'][1]} → "
                f"{d['ap_b'][0]}/{d['ap_b'][1]}   divergence {dd:+.4f}")

    dva = [x for m in per_model for x in per_model[m]['dv_a'] if x is not None]
    dvb = [x for m in per_model for x in per_model[m]['dv_b'] if x is not None]
    print(f"\n  mean divergence   naoshi-4 {sum(dva)/len(dva):.4f}   "
          f"n6 pass1 {sum(dvb)/len(dvb):.4f}   "
          f"FLOOR {sum(dvb)/len(dvb) - sum(dva)/len(dva):+.4f}")

    print(f'\n  Rewrites byte-identical across the two runs: '
          f'{identical_rows}/{len(shared)}')
    by_model_ident = Counter()
    for oid in shared:
        wa = cq.norm((four[oid].get('raw') or {}).get('model_rewrite'))
        wb_ = cq.norm(six[oid].get('rewrite_pass1'))
        if wa and wa == wb_:
            by_model_ident[four[oid]['model_code']] += 1
    for m in sorted(per_model):
        print(f'    {m}: {by_model_ident[m]}/{per_model[m]["n"]} identical')
    print(f'\n  Verdict changed on {len(verdict_moved)} of {len(shared)} rows:')
    for oid, m, va, vb in verdict_moved[:20]:
        print(f'    {oid} {m}  {va} → {vb}')
    if len(verdict_moved) > 20:
        print(f'    … and {len(verdict_moved) - 20} more')


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    wb_path = Path(args[0]) if args else DEFAULT_WB
    if not wb_path.exists() or not LOG.exists():
        sys.exit(f'Missing {wb_path} or {LOG}')
    ev = load_eval(wb_path)
    rows = load_log()
    if not ev or not rows:
        sys.exit('Nothing to scan — refusing to report on nothing.')
    want = {a for a in sys.argv[1:] if a.startswith('--')}
    run_all = not (want & {'--paired', '--census', '--tiers', '--floor'})
    if run_all or '--paired' in want:
        paired(ev, rows); print()
    if run_all or '--census' in want:
        census(ev, rows); print()
    if run_all or '--tiers' in want:
        tiers(ev, rows); print()
    if run_all or '--floor' in want:
        floor(ev, rows)
    return 0


if __name__ == '__main__':
    sys.exit(main())
