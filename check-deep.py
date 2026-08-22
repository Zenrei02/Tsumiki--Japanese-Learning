#!/usr/bin/env python3
"""Mechanical gate for DEEP content — built BEFORE the S9-S16 drills were authored.

Answer keys are the one content type where an error actively teaches something
false, so this checker exists before the content does (Session 19 handover, the
same move as the conjugator's golden tests and the scene reachability guard).

Everything authoritative is read out of grammar-module.jsx at run time: the
point ids, the stage of each step, and the DEEP block itself. Pending deep-only
content files (stage-N-deep-v1.json) can be passed as arguments and are held to
the same assertions before they are ever spliced:

    python3 check-deep.py                        # module's own DEEP block
    python3 check-deep.py stage-9-deep-v1.json   # ALSO validate pending files

Assertions (fail):
  - census: entries parsed == entry lines present between the @@DEEP markers
  - every covered point id exists in the module
  - seg is a list of [span, gloss(, 1)] with non-empty spans and glosses
  - at most one seg span carries the THE-POINT flag
  - hl, when present, occurs character-for-character in the joined seg sentence
  - every wrinkle has teaching text `t` and, when it has hl, hl occurs in its jp
  - drill items: q present; every `___` blank has at least one accepted answer;
    `a` non-empty; every accepted answer appears in opts when opts exist;
    opts contain no duplicates (a distractor equal to an answer is a duplicate);
    at least 2 options when opts exist
  - pending files: no silent overwrite — a pid already in the module's DEEP fails
Warnings (report, don't fail):
  - drill item missing `why` or `en`
  - joined seg not ending in sentence-final punctuation
  - a drill with fewer than 3 items

NOT checked here: whether drill vocabulary stays inside the lesson's own bank —
that is the word-ledger pipeline's jurisdiction (build-word-ledger.py).
"""
import json, pathlib, re, sys

HERE = pathlib.Path(__file__).parent
MODULE = HERE / "grammar-module.jsx"
FINAL = "。？！?!」』）)"

src = MODULE.read_text(encoding="utf-8")

# ---- module facts -----------------------------------------------------------
point_stage, step_points, order = {}, {}, []
for b in re.split(r'\n  \{\n    cat: "', src)[1:]:
    cat = b.split('"')[0]; order.append(cat)
    lv = re.search(r'level: "([^"]*)"', b)
    stage = lv.group(1) if lv else "?"
    ids = re.findall(r'id: "([a-z0-9-]+)", jp: "', b)
    step_points[cat] = (stage, ids)
    for pid in ids:
        point_stage[pid] = stage
module_pids = set(point_stage)


def load_deep():
    i = src.index("{", src.index("const DEEP = "))
    depth, j, instr, esc = 0, i, False, False
    while j < len(src):
        c = src[j]
        if instr:
            if esc: esc = False
            elif c == "\\": esc = True
            elif c == '"': instr = False
        else:
            if c == '"': instr = True
            elif c == "{": depth += 1
            elif c == "}":
                depth -= 1
                if depth == 0: break
        j += 1
    body = "\n".join(l for l in src[i:j + 1].split("\n") if not l.lstrip().startswith("//"))
    return json.loads(re.sub(r",(\s*[}\]])", r"\1", body))


fail, warn = [], []


def check_entry(pid, d, where):
    tag = f"{where}:{pid}"
    if pid not in module_pids:
        fail.append(f"{tag}: not a point in grammar-module.jsx"); return
    known = {"seg", "hl", "note", "wr", "drill"}
    for k in d:
        if k not in known:
            fail.append(f"{tag}: unknown key {k!r}")

    seg = d.get("seg")
    if seg is not None:
        if not isinstance(seg, list) or not seg:
            fail.append(f"{tag}: seg present but not a non-empty list")
        else:
            flagged = 0
            for n, card in enumerate(seg):
                if (not isinstance(card, list) or len(card) not in (2, 3)
                        or not isinstance(card[0], str) or not isinstance(card[1], str)):
                    fail.append(f"{tag}.seg[{n}]: not [span, gloss(, 1)]"); continue
                if not card[0]: fail.append(f"{tag}.seg[{n}]: empty span")
                if not card[1]: fail.append(f"{tag}.seg[{n}]: empty gloss")
                if len(card) == 3:
                    if card[2] != 1: fail.append(f"{tag}.seg[{n}]: flag is {card[2]!r}, not 1")
                    flagged += 1
            if flagged > 1:
                fail.append(f"{tag}: {flagged} seg spans flagged THE POINT — at most one")
            joined = "".join(c[0] for c in seg if isinstance(c, list) and c and isinstance(c[0], str))
            if joined and joined[-1] not in FINAL:
                warn.append(f"{tag}: seg sentence ends {joined[-6:]!r} — no final punctuation")
            hl = d.get("hl")
            if hl and hl not in joined:
                fail.append(f"{tag}: hl {hl!r} not found character-for-character in seg sentence")
    elif d.get("hl"):
        warn.append(f"{tag}: hl without seg — nothing to highlight")

    for n, w in enumerate(d.get("wr") or []):
        wtag = f"{tag}.wr[{n}]"
        if not isinstance(w, dict): fail.append(f"{wtag}: not an object"); continue
        if not w.get("t"):  fail.append(f"{wtag}: wrinkle without teaching text t")
        if not w.get("jp"): fail.append(f"{wtag}: wrinkle without jp")
        if w.get("hl") and w.get("jp") and w["hl"] not in w["jp"]:
            fail.append(f"{wtag}: hl {w['hl']!r} not in its own jp")

    drill = d.get("drill")
    if drill is not None:
        items = drill.get("items")
        if not items:
            fail.append(f"{tag}.drill: no items"); return
        if len(items) < 3:
            warn.append(f"{tag}.drill: only {len(items)} item(s)")
        for n, it in enumerate(items):
            itag = f"{tag}.drill[{n}]"
            q, a, opts = it.get("q"), it.get("a"), it.get("opts")
            if not q: fail.append(f"{itag}: no q")
            if "___" in (q or "") and not a:
                fail.append(f"{itag}: blank with no accepted answer")
            if not a or not isinstance(a, list) or not all(isinstance(x, str) and x for x in a):
                fail.append(f"{itag}: a missing/empty/not a list of strings")
            if opts is not None:
                if not isinstance(opts, list) or len(opts) < 2:
                    fail.append(f"{itag}: opts present but fewer than 2 options")
                else:
                    if len(set(opts)) != len(opts):
                        dupes = sorted({o for o in opts if opts.count(o) > 1})
                        fail.append(f"{itag}: duplicate option(s) {dupes} — a distractor equals an answer or itself")
                    for x in (a or []):
                        if x not in opts:
                            fail.append(f"{itag}: accepted answer {x!r} not among opts")
            if not it.get("why"): warn.append(f"{itag}: no why")
            if not it.get("en"):  warn.append(f"{itag}: no en")


# ---- the module's own block -------------------------------------------------
DEEP = load_deep()
block = src[src.index("// @@DEEP-START"):src.index("// @@DEEP-END")]
entry_lines = len(re.findall(r'\n  "[a-z0-9-]+": \{', block))
if entry_lines != len(DEEP):
    fail.append(f"census: {entry_lines} entry lines between markers, {len(DEEP)} parsed")

for pid, d in DEEP.items():
    check_entry(pid, d, "module")

# ---- pending deep-only files ------------------------------------------------
pending = {}
for arg in sys.argv[1:]:
    part = json.loads(pathlib.Path(arg).read_text(encoding="utf-8"))
    entries = {}
    for blk in part.get("new_steps", []):
        entries.update(blk.get("deep") or {})
    for ins in part.get("insert", []):
        if ins.get("deep"): entries[ins["point"]["id"]] = ins["deep"]
    for pid, d in entries.items():
        if pid in DEEP:
            fail.append(f"{arg}:{pid}: already in module DEEP — splice would need --update; refuse silent overwrite")
        if pid in pending:
            fail.append(f"{arg}:{pid}: appears in more than one pending file")
        pending[pid] = d
        check_entry(pid, d, arg)

# ---- coverage ----------------------------------------------------------------
have = set(DEEP) | set(pending)
def excluded(p): return bool(re.match(r"(b-|b\d|cc-|ms-|rc\d)", p))
n_items = sum(len((d.get("drill") or {}).get("items", [])) for d in list(DEEP.values()) + list(pending.values()))
print(f"DEEP entries: {len(DEEP)} in module + {len(pending)} pending   drill items: {n_items}")
print("\n-- coverage by stage (eligible points) --")
stages = sorted({s for s, _ in step_points.values() if s != "?"}, key=lambda x: (len(x), x))
gd = gt = 0
for stage in stages:
    pts = [p for p, s in point_stage.items() if s == stage and not excluded(p)]
    done = [p for p in pts if p in have]
    gd += len(done); gt += len(pts)
    miss = [p for p in pts if p not in have]
    line = f"  {stage}: {len(done)}/{len(pts)}"
    if miss and len(miss) <= 8: line += "   missing: " + ", ".join(miss)
    elif miss: line += f"   missing: {len(miss)} points"
    print(line)
print(f"  ALL: {gd}/{gt}")

print("\nWARN:" if warn else "\nWARN: none")
for x in warn: print("  -", x)
print("\nFAIL:" if fail else "\nFAIL: none — all checks passed")
for x in fail: print("  -", x)
sys.exit(1 if fail else 0)
