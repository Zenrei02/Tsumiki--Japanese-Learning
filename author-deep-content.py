#!/usr/bin/env python3
"""Splice DEEP walkthrough/drill entries into grammar-module.jsx (Session 14).

WHAT THIS IS. The deep-lesson pass authors, for every Stage 1 grammar and
skill point, an element-by-element breakdown of its first example, a
highlight for the re-sighting examples, optional wrinkle examples, and a
deterministic fill-in-the-blank drill. That data lives between the
@@DEEP-START / @@DEEP-END markers in grammar-module.jsx. This script builds
that block from JSON fragment files and VERIFIES each entry against the
lesson it deepens before writing anything.

The fragments are transient authoring inputs (scratch dir, one JSON file per
step); the MODULE is the record. Re-running with corrected fragments fully
replaces the block — the splice is idempotent.

Usage: python3 author-deep-content.py <fragments-dir> [--check-only]

Assertions per entry (hard failures):
- the id exists in the module and its kind is grammar or skill
- seg surfaces concatenate EXACTLY to ex[0][0] (typo net for the breakdown)
- seg marks at least one element as the point
- hl, when given, is a substring of ex[1][0]
- wrinkle examples: jp requires en; a wrinkle hl must appear in its jp
- drill items: exactly one ___ blank; at least one accepted answer; choice
  items must list the first accepted answer among unique options
- pool drills should carry more items than one draw (warning only)
"""
import json, pathlib, re, sys

HERE = pathlib.Path(__file__).parent
MODULE = HERE / "grammar-module.jsx"
DRILL_DRAW = 5

def parse_points(src):
    """id -> {kind, ex: [[jp, en],…]} pulled straight from the module text."""
    pts = {}
    for m in re.finditer(r'\bid:\s*"([^"]+)"', src):
        pid = m.group(1)
        if pid in ("S1", "S2", "S3", "S4", "S5"):
            continue
        tail = src[m.end():]
        # kind, if declared before the next id
        nxt = re.search(r'\bid:\s*"', tail)
        scope = tail[: nxt.start()] if nxt else tail
        km = re.search(r'\bkind:\s*"([^"]+)"', scope)
        exm = re.search(r'\bex:\s*\[(.*?)\](?:,\s*\n|\s*,?\s*\})', scope, re.S)
        ex = []
        if exm:
            ex = re.findall(r'\["((?:[^"\\]|\\.)*)",\s*"(?:[^"\\]|\\.)*"\]', exm.group(1))
        pts[pid] = {"kind": km.group(1) if km else "grammar", "ex": ex}
    return pts

def check(entries, pts):
    errs, warns = [], []
    for pid, e in entries.items():
        p = pts.get(pid)
        if not p:
            errs.append(f"{pid}: no such point in module"); continue
        if p["kind"] not in ("grammar", "skill"):
            errs.append(f"{pid}: kind {p['kind']} is not deep-eligible"); continue
        if "seg" in e:
            if not p["ex"]:
                errs.append(f"{pid}: seg but no examples parsed"); continue
            joined = "".join(s[0] for s in e["seg"])
            want = p["ex"][0].replace('\\"', '"')
            if joined != want:
                errs.append(f"{pid}: seg concat != ex[0]\n  seg → {joined}\n  ex  → {want}")
            if not any(len(s) > 2 and s[2] for s in e["seg"]):
                errs.append(f"{pid}: seg marks no element as the point")
        if e.get("hl"):
            if len(p["ex"]) < 2:
                errs.append(f"{pid}: hl but fewer than two examples")
            elif e["hl"] not in p["ex"][1].replace('\\"', '"'):
                errs.append(f"{pid}: hl 「{e['hl']}」 not in ex[1] 「{p['ex'][1]}」")
        for i, w in enumerate(e.get("wr", [])):
            if w.get("jp") and not w.get("en"):
                errs.append(f"{pid}: wr[{i}] jp without en")
            if w.get("hl") and w.get("jp") and w["hl"] not in w["jp"]:
                errs.append(f"{pid}: wr[{i}] hl not in its jp")
        d = e.get("drill")
        if d:
            if not d.get("items"):
                errs.append(f"{pid}: drill without items")
            for i, it in enumerate(d.get("items", [])):
                if it["q"].count("___") != 1:
                    errs.append(f"{pid}: drill[{i}] needs exactly one ___: {it['q']}")
                if not it.get("a"):
                    errs.append(f"{pid}: drill[{i}] has no accepted answers")
                if "opts" in it:
                    if len(set(it["opts"])) != len(it["opts"]):
                        errs.append(f"{pid}: drill[{i}] duplicate options")
                    if it["a"][0] not in it["opts"]:
                        errs.append(f"{pid}: drill[{i}] answer {it['a'][0]} not among options")
                    if not (3 <= len(it["opts"]) <= 5):
                        warns.append(f"{pid}: drill[{i}] has {len(it['opts'])} options")
            if d.get("pool") and len(d.get("items", [])) <= DRILL_DRAW:
                warns.append(f"{pid}: pool drill with only {len(d['items'])} items (draw is {DRILL_DRAW})")
    return errs, warns

def main():
    frag_dir = pathlib.Path(sys.argv[1])
    check_only = "--check-only" in sys.argv
    entries = {}
    for f in sorted(frag_dir.glob("*.json")):
        data = json.loads(f.read_text())
        dup = set(data) & set(entries)
        if dup:
            sys.exit(f"duplicate ids across fragments: {sorted(dup)}")
        entries.update(data)
    src = MODULE.read_text()
    pts = parse_points(src)
    errs, warns = check(entries, pts)
    for w in warns:
        print(f"WARN {w}")
    if errs:
        print("\n".join(f"FAIL {e}" for e in errs))
        sys.exit(f"{len(errs)} failures — nothing written")
    print(f"{len(entries)} entries verified against {len(pts)} module points")
    if check_only:
        return
    block = "".join(
        f"  {json.dumps(pid, ensure_ascii=False)}: {json.dumps(e, ensure_ascii=False)},\n"
        for pid, e in entries.items()
    )
    out = re.sub(
        r"(// @@DEEP-START\n).*?(  // @@DEEP-END)",
        lambda m: m.group(1) + block + m.group(2),
        src, flags=re.S,
    )
    if out == src and entries:
        sys.exit("splice changed nothing — markers missing?")
    MODULE.write_text(out)
    print(f"spliced {len(entries)} entries into {MODULE.name}")

if __name__ == "__main__":
    main()
