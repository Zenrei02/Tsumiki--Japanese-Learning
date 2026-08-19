#!/usr/bin/env python3
"""Splice the Stage 3 lessons from stage-3-content-v1.json into grammar-module.jsx.

Same discipline as build-arcs.py and build-vocab-data.py: the JSON is the source of
truth, the module is derived, and re-running is idempotent — every insertion is guarded
by an id-presence check, so running this twice changes nothing.

WHAT IT DOES
  1. retitles Step 24
  2. inserts new points into existing steps, at a named position
  3. inserts whole new step blocks (Step 26 · Keigo in the wild, Checkpoint 7)
  4. inserts DEEP entries for the new points, inside the @@DEEP markers

WHAT IT WILL NOT DO
  Overwrite an existing point or DEEP entry. If an id is already in the module it is
  skipped and reported, because a silent overwrite of hand-authored lesson prose is the
  one failure this folder cannot afford.

    python3 build-stage3.py            # splice, report
    python3 build-stage3.py --check    # exit 1 if the module is out of date
"""
import json, pathlib, re, sys

HERE = pathlib.Path(__file__).parent
MODULE = HERE / "grammar-module.jsx"
CONTENT = HERE / "stage-3-content-v1.json"

# ————— emit JS in the module's own house style —————
def js_str(s):
    return json.dumps(s, ensure_ascii=False)

def js_point(p, indent="      "):
    """A lesson object, unquoted keys, matching the CURRICULUM style."""
    head = f'{indent}{{\n{indent}  id: {js_str(p["id"])}, jp: {js_str(p["jp"])}, en: {js_str(p["en"])}, kind: {js_str(p["kind"])},'
    if p.get("n4"):
        head += " n4: true,"
    out = [head]
    if p.get("covers"):
        out.append(f'{indent}  covers: {json.dumps(p["covers"], ensure_ascii=False)},')
    exp = p["exp"]
    if isinstance(exp, dict):
        out.append(f"{indent}  exp: {{")
        for k in ("what", "build", "when", "watch"):
            if exp.get(k):
                out.append(f"{indent}    {k}: {js_str(exp[k])},")
        out.append(f"{indent}  }},")
    else:
        out.append(f"{indent}  exp: {js_str(exp)},")
    ex = p.get("ex", [])
    if ex:
        pairs = ", ".join(f"[{js_str(a)}, {js_str(b)}]" for a, b in ex)
        out.append(f"{indent}  ex: [{pairs}],")
    else:
        out.append(f"{indent}  ex: [],")
    out.append(f"{indent}}},")
    return "\n".join(out)

def js_step(blk):
    lines = ["", "  {", f'    cat: {js_str(blk["cat"])},', f'    level: {js_str(blk["level"])},']
    if blk.get("bank"):
        pairs = ", ".join(f"[{js_str(a)}, {js_str(b)}]" for a, b in blk["bank"])
        lines.append(f"    bank: [{pairs}],")
    lines.append("    points: [")
    for p in blk["points"]:
        lines.append(js_point(p))
    lines.append("    ],")
    lines.append("  },")
    body = "\n".join(lines)
    if blk.get("note"):
        wrapped = "\n".join("  // " + l for l in _wrap(blk["note"], 76))
        body = "\n" + wrapped + body
    return body

def _wrap(text, width):
    words, line, out = text.split(), "", []
    for w in words:
        if len(line) + len(w) + 1 > width:
            out.append(line); line = w
        else:
            line = f"{line} {w}".strip()
    if line: out.append(line)
    return out

# ————— locate things in the module —————
def step_span(src, cat):
    """(start, end) of a whole step block, brace-matched."""
    i = src.index(f'\n  {{\n    cat: {js_str(cat)}')
    depth, j, instr, esc = 0, i + 3, False, False
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
    end = src.index("\n", src.index(",", j))
    return i, end

def point_end(src, start, end, pid):
    """Index just past the closing of point `pid` inside [start,end)."""
    blk = src[start:end]
    m = re.search(r'\n( *)\{?\s*id: "%s"' % re.escape(pid), blk)
    if not m:
        m2 = re.search(r'\n( *)\{ id: "%s"' % re.escape(pid), blk)
        if not m2: return None
        m = m2
    i = start + m.start() + 1
    depth, j, instr, esc = 0, i, False, False
    while j < end:
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
    k = src.index("\n", j)
    return k + 1

def main():
    check = "--check" in sys.argv
    src = MODULE.read_text(encoding="utf-8")
    data = json.loads(CONTENT.read_text(encoding="utf-8"))
    before = src
    added, skipped = [], []
    # A retitle changes the key later inserts look the step up by, so remember it.
    # Without this, the second point aimed at Step 24 searches for a title that no
    # longer exists and the whole splice dies halfway through.
    renamed = {}

    # 1 & 2 — retitle, and insert points into existing steps
    for ins in data["insert"]:
        cat, p = ins["step"], ins["point"]
        cat = renamed.get(cat, cat)
        if ins.get("retitle"):
            old, new = js_str(cat), js_str(ins["retitle"])
            if old in src:
                src = src.replace(f"cat: {old}", f"cat: {new}", 1)
                added.append(f'retitled → {ins["retitle"]}')
            renamed[ins["step"]] = ins["retitle"]
            cat = ins["retitle"]
        if f'id: "{p["id"]}"' in src:
            skipped.append(p["id"]); continue
        s0, s1 = step_span(src, cat)
        if ins.get("after"):
            at = point_end(src, s0, s1, ins["after"])
            if at is None:
                print(f'  ! anchor point {ins["after"]!r} not found in {cat!r}', file=sys.stderr); sys.exit(2)
        else:
            at = src.index("points: [", s0) + len("points: [\n")
        src = src[:at] + js_point(p) + "\n" + src[at:]
        added.append(p["id"])

    # 3 — whole new step blocks
    for blk in data["new_steps"]:
        if f'cat: {js_str(blk["cat"])}' in src:
            skipped.append(blk["cat"]); continue
        _, end = step_span(src, blk["after_step"])
        src = src[:end] + "\n" + js_step(blk) + src[end:]
        added.append(blk["cat"])

    # 4 — DEEP entries
    deeps = {}
    for ins in data["insert"]:
        if ins.get("deep"): deeps[ins["point"]["id"]] = ins["deep"]
    for blk in data["new_steps"]:
        for k, v in (blk.get("deep") or {}).items(): deeps[k] = v
    marker = "  // @@DEEP-END"
    for pid, d in deeps.items():
        if re.search(r'\n  "%s": \{' % re.escape(pid), src):
            skipped.append(f"DEEP[{pid}]"); continue
        line = f'  "{pid}": ' + json.dumps(d, ensure_ascii=False) + ",\n"
        at = src.index(marker)
        src = src[:at] + line + src[at:]
        added.append(f"DEEP[{pid}]")

    if check:
        print("out of date" if src != before else "up to date")
        sys.exit(1 if src != before else 0)

    if src != before:
        MODULE.write_text(src, encoding="utf-8")
    cats = re.findall(r"\n  \{\n    cat: \"([^\"]+)\"", src)
    pts = len(re.findall(r'id: "[a-z0-9-]+", jp: "', src))
    print(f"added:   {', '.join(added) if added else '(nothing)'}")
    if skipped:
        print(f"skipped: {', '.join(skipped)}   (already present — never overwritten)")
    print(f"module now: {len(cats)} steps, {pts} lesson objects")
    print("  next: python3 build-arcs.py && python3 build-vocab-data.py && python3 build-vite-app.py")

if __name__ == "__main__":
    main()
