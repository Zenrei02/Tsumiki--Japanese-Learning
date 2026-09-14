#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Session 32.1 — does Sonnet 5 get worse when it thinks less, and how much faster?
NO API CALLS. Reads bakeoff-log.jsonl and the eval key, and compares the M2
(claude-sonnet-5) rows of four stamps against the answer key:

  naoshi-4            the measured default: adaptive thinking, effort high (API default)
  naoshi-6 (pass 1)   the SAME request 24 days later — the null replicate Session 28
                      used as the noise floor; its pass-1 diagnosis is a naoshi-4 output
  naoshi-4-lowthink   thinking adaptive + output_config.effort = low
  naoshi-4-nothink    thinking disabled

Every row of every stamp used the byte-identical prompt (md5 7cabba30…).

COUNTERS, all per stamp over the 50 M2 rows:
  detected     ERROR rows where the verdict is not NONE
  missed       ERROR rows returned NONE or WORTH KNOWING   (the Session 28 census definition)
  tier-exact   verdict equals the key's expected tier
  located      ERROR rows where some issue span overlaps the region the key's
               correction changes — "did it point at the right place", tier aside
  invented     CORRECT rows returned FIX or UNNATURAL       (rule 1; the launch-gate number)
  flagged-ok   CORRECT rows returned anything but NONE (includes WORTH KNOWING)
  latency      median / p90 wall-clock seconds, where the row logged one
  tokens       median output tokens and thinking tokens, and $/call at Run Key prices

READ WITH THE FLOOR. naoshi-4 vs naoshi-6-pass-1 is the same request twice; the
gap between them is what "nothing changed" looks like on 50 rows. A lowthink or
nothink delta smaller than that gap is not a finding.
"""
import json, statistics as st, sys
from difflib import SequenceMatcher
from pathlib import Path
import openpyxl

HERE = Path(__file__).parent
LOG = HERE / "bakeoff-log.jsonl"
WB = HERE / "naoshi-eval-v1.xlsx"
PRICE_IN, PRICE_OUT, PRICE_CACHE_READ = 3.0, 15.0, 0.30   # $/MTok, Sonnet 5 standard

def key():
    wb = openpyxl.load_workbook(WB)
    out = {}
    for row in wb["Eval Set"].iter_rows(min_row=6):
        rid, sent = row[0].value, row[3].value
        if rid and sent and str(sent).strip():
            out[str(rid).strip()] = {
                "text": str(sent).strip(),
                "status": str(row[4].value or "").strip().upper(),
                "tier": str(row[6].value or "").strip().upper(),
                "correction": str(row[7].value or "").strip(),
            }
    return out

def changed(a, b):
    return [(i1, max(i2, i1 + 1)) for tag, i1, i2, *_ in SequenceMatcher(None, a, b).get_opcodes() if tag != "equal"]

def rows_for(stamp):
    out = {}
    for line in LOG.read_text(encoding="utf-8").splitlines():
        try: r = json.loads(line)
        except Exception: continue
        if r.get("schema") == stamp and r.get("model_code") == "M2":
            out[r["eval_id"]] = r
    return out

def q(xs, p):
    xs = sorted(xs); return xs[min(len(xs) - 1, int(p * len(xs)))] if xs else None

def score(stamp, K):
    R = rows_for(stamp)
    if not R: return None
    err = [e for e in R if K[e]["status"] != "CORRECT"]
    cor = [e for e in R if K[e]["status"] == "CORRECT"]
    detected = [e for e in err if R[e]["verdict"] != "NONE"]
    missed = [e for e in err if R[e]["verdict"] in ("NONE", "WORTH KNOWING")]
    tier_exact = [e for e in R if R[e]["verdict"] == K[e]["tier"]]
    located = []
    for e in err:
        regions = changed(K[e]["text"], K[e]["correction"]) if K[e]["correction"] not in ("", "—") else []
        text = K[e]["text"]
        spans = [i.get("span", "") for i in (R[e].get("raw") or {}).get("issues", [])]
        hit = False
        for sp in spans:
            if not sp: continue
            i = text.find(sp)
            while i != -1:
                if any(i < g[1] and g[0] < i + len(sp) for g in regions): hit = True; break
                i = text.find(sp, i + 1)
            if hit: break
        if hit: located.append(e)
    invented = [e for e in cor if R[e]["verdict"] in ("FIX", "UNNATURAL")]
    flagged = [e for e in cor if R[e]["verdict"] != "NONE"]
    lat = [r["latency_s"] for r in R.values() if r.get("latency_s")]
    outs = [r["usage"].get("output_tokens", 0) for r in R.values()]
    thk = [(r["usage"].get("output_tokens_details") or {}).get("thinking_tokens") for r in R.values()]
    thk = [t for t in thk if t is not None]
    cost = []
    for r in R.values():
        u = r["usage"]
        cost.append((u.get("input_tokens", 0) * PRICE_IN + u.get("cache_read_input_tokens", 0) * PRICE_CACHE_READ
                     + u.get("cache_creation_input_tokens", 0) * PRICE_IN * 1.25 + u.get("output_tokens", 0) * PRICE_OUT) / 1e6)
    return {
        "n": len(R), "err": len(err), "cor": len(cor),
        "detected": detected, "missed": missed, "tier_exact": tier_exact, "located": located,
        "invented": invented, "flagged": flagged,
        "lat_med": st.median(lat) if lat else None, "lat_p90": q(lat, .9), "lat_n": len(lat),
        "out_med": st.median(outs), "thk_med": st.median(thk) if thk else None, "thk_n": len(thk),
        "cost_med": st.median(cost), "cost_sum": sum(cost),
    }

def main():
    K = key()
    stamps = [("naoshi-4", "default (measured)"), ("naoshi-6", "same request, 24 days later (floor)"),
              ("naoshi-4-lowthink", "effort low"), ("naoshi-4-nothink", "thinking disabled")]
    S = {s: score(s, K) for s, _ in stamps}
    S = {s: v for s, v in S.items() if v}
    def f(x): return "—" if x is None else (f"{x:.1f}" if isinstance(x, float) else str(x))
    print("Sonnet 5 · M2 rows · prompt naoshi-4 (md5 7cabba30) in every arm\n")
    hdr = f"{'':40s}" + "".join(f"{s:>20s}" for s in S)
    print(hdr)
    def line(label, fn):
        print(f"{label:40s}" + "".join(f"{f(fn(S[s])):>20s}" for s in S))
    line("rows", lambda v: v["n"])
    line("ERROR rows detected (verdict ≠ NONE)", lambda v: f"{len(v['detected'])}/{v['err']}")
    line("ERROR rows missed (NONE or WK)", lambda v: f"{len(v['missed'])}/{v['err']}")
    line("ERROR rows located (span on key region)", lambda v: f"{len(v['located'])}/{v['err']}")
    line("tier-exact vs key (all rows)", lambda v: f"{len(v['tier_exact'])}/{v['n']}")
    line("CORRECT rows invented (FIX/UNNAT)", lambda v: f"{len(v['invented'])}/{v['cor']}")
    line("CORRECT rows flagged at all", lambda v: f"{len(v['flagged'])}/{v['cor']}")
    line("latency median s (n logged)", lambda v: f"{f(v['lat_med'])} ({v['lat_n']})")
    line("latency p90 s", lambda v: v["lat_p90"])
    line("output tokens median", lambda v: v["out_med"])
    line("thinking tokens median (n)", lambda v: f"{f(v['thk_med'])} ({v['thk_n']})")
    line("$/call median", lambda v: f"${v['cost_med']:.4f}")
    line("$ for 50 rows (cache-create priced)", lambda v: f"${v['cost_sum']:.2f}")
    print("\nROW-LEVEL DISAGREEMENTS WITH THE DEFAULT RUN (verdict changed):")
    base = rows_for("naoshi-4")
    for s in S:
        if s == "naoshi-4": continue
        R = rows_for(s); diff = [(e, base[e]["verdict"], R[e]["verdict"], K[e]["status"], K[e]["tier"]) for e in R if e in base and R[e]["verdict"] != base[e]["verdict"]]
        print(f"  {s}: {len(diff)} of {len(R)} rows differ from naoshi-4")
        for e, a, b, stt, t in sorted(diff):
            mark = "worse" if (stt == "CORRECT" and b != "NONE" and a == "NONE") or (stt != "CORRECT" and b in ("NONE","WORTH KNOWING") and a not in ("NONE","WORTH KNOWING")) else \
                   "better" if (stt == "CORRECT" and b == "NONE" and a != "NONE") or (stt != "CORRECT" and a in ("NONE","WORTH KNOWING") and b not in ("NONE","WORTH KNOWING")) else "shift"
            print(f"     {e} [{stt} {t}] {a} → {b}  ({mark})")

if __name__ == "__main__":
    main()
