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

WHAT IT WILL NOT DO SILENTLY
  Overwrite an existing point. By default an id already in the module is skipped and
  reported, because a silent overwrite of hand-authored lesson prose is the one failure
  this folder cannot afford.

  But insert-only means the JSON stops being the source of truth the moment a lesson
  needs editing — the first edit would have to be made by hand in the module, which is
  exactly the drift the marker blocks exist to prevent. So --update replaces a point's
  body from the JSON when the two differ, prints a diff summary, and touches nothing
  else. Explicit, reported, and never the default.

    python3 build-stage3.py            # insert what is missing
    python3 build-stage3.py --update   # ALSO rewrite points whose JSON has changed
    python3 build-stage3.py --check    # exit 1 if the module is out of date
"""
import json, pathlib, re, sys

HERE = pathlib.Path(__file__).parent
MODULE = HERE / "grammar-module.jsx"
# More than one content file now: Stage 3's lessons, and the JLPT milestone lessons the
# Session 17 re-staging needed. Listed explicitly rather than globbed — a glob would pick
# up whatever else ends up matching, which is not a thing to discover at splice time.
CONTENT = [HERE / "stage-3-content-v1.json", HERE / "milestone-content-v1.json",
           HERE / "stage-8-request-content-v1.json", HERE / "stage-9-content-v1.json",
           # Stage 10 is split across three files for authoring only. Order matters:
           # each step names the previous one in after_step, so b must follow a.
           HERE / "stage-10-content-v1.json", HERE / "stage-10-content-b-v1.json",
           HERE / "stage-10-content-c-v1.json",
           HERE / "stage-9-10-culture-v1.json",
           HERE / "early-builders-v1.json",
           HERE / "step-19-culture-v1.json",
           # Stage 11 (N2 opens) — split a/b for authoring only; b chains after a.
           HERE / "stage-11-content-v1.json",
           HERE / "stage-11-content-b-v1.json",
           # Stages 12-13 (N2 completed) — a/b splits chain by after_step.
           HERE / "stage-12-content-v1.json",
           HERE / "stage-12-content-b-v1.json",
           HERE / "stage-13-content-v1.json",
           HERE / "stage-13-content-b-v1.json",
           HERE / "stage-13-sweep-v1.json",
           # Stages 15-16 (N1 — the curriculum's close). a/b chain by after_step.
           HERE / "stage-15-content-v1.json",
           HERE / "stage-15-content-b-v1.json",
           HERE / "stage-16-content-v1.json",
           HERE / "stage-16-content-b-v1.json",
           HERE / "stage-16-sweep-v1.json",
           HERE / "stage-16-sweep-b-v1.json",
           # Session 19: deep-only files — every cat already exists, so the blocks'
           # empty points are skipped and only the deep dicts splice. Gate first:
           # python3 check-deep.py stage-9-deep-v1.json
           HERE / "stage-9-deep-v1.json",
           HERE / "stage-10-deep-v1.json",
           HERE / "stage-11-deep-v1.json"]

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
    if p.get("requires"):
        out.append(f'{indent}  requires: {json.dumps(p["requires"], ensure_ascii=False)},')
    if p.get("brief"):
        out.append(f'{indent}  brief: {js_str(p["brief"])},')
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

def point_span(src, start, end, pid):
    """(start, end) of a whole point object, brace-matched, including its trailing line."""
    m = re.search(r'\n( *)\{?\s*id: "%s"' % re.escape(pid), src[start:end])
    if not m: return None, None
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
    return i, src.index("\n", j) + 1

def main():
    check = "--check" in sys.argv
    update = "--update" in sys.argv
    src = MODULE.read_text(encoding="utf-8")
    data = {"insert": [], "new_steps": []}
    for f in CONTENT:
        part = json.loads(f.read_text(encoding="utf-8"))
        data["insert"] += part.get("insert", [])
        data["new_steps"] += part.get("new_steps", [])
    before = src
    added, skipped, rewritten = [], [], []
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
            if update:
                s0, s1 = step_span(src, cat)
                a, b = point_span(src, s0, s1, p["id"])
                fresh = js_point(p) + "\n"
                if src[a:b] != fresh:
                    src = src[:a] + fresh + src[b:]
                    rewritten.append(f'{p["id"]} ({b - a} -> {len(fresh)} bytes)')
                else:
                    skipped.append(p["id"])
            else:
                skipped.append(p["id"])
            continue
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
            # ⚠️ Session 17: --update used to stop here, so a step that already existed
            # had EVERY point inside it frozen — an edit to rc7's covers/exp printed
            # "skipped ... already present" and looked like a no-op that was fine. It was
            # not: the JSON had stopped being the source of truth for two thirds of the
            # module's lessons, silently. Under --update, walk the block's points too.
            if update:
                for p in blk["points"]:
                    if f'id: "{p["id"]}"' not in src:
                        continue
                    s0, s1 = step_span(src, blk["cat"])
                    a, b = point_span(src, s0, s1, p["id"])
                    if a is None:
                        continue
                    fresh = js_point(p) + "\n"
                    if src[a:b] != fresh:
                        src = src[:a] + fresh + src[b:]
                        rewritten.append(f'{p["id"]} ({b - a} -> {len(fresh)} bytes)')
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
        line = f'  "{pid}": ' + json.dumps(d, ensure_ascii=False) + ",\n"
        # ⚠️ Session 19: search INSIDE the DEEP block only. The ARCS block (added
        # Session 17, filled Session 19) emits lines in the identical shape —
        # `  "okage": {...` — so a whole-file search reports a DEEP entry as
        # "already present" whenever the point merely has an ARC. Every S9 DEEP
        # insert was silently skipped this way while the log read as success.
        d0 = src.index("// @@DEEP-START"); d1 = src.index(marker)
        m = re.search(r'\n(  "%s": \{.*?\n)' % re.escape(pid), src[d0:d1], re.S)
        # The DEEP body is one long JSON line, so the lazy match ends at the newline
        # that closes it. Anchor on the line, not on a brace walk.
        if m:
            old = m.group(1)
            if update and old != line:
                src = src[:d0 + m.start(1)] + line + src[d0 + m.end(1):]
                rewritten.append(f"DEEP[{pid}]")
            else:
                skipped.append(f"DEEP[{pid}]")
            continue
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
    if rewritten:
        print(f"updated: {', '.join(rewritten)}")
    if skipped:
        print(f"skipped: {', '.join(skipped)}   (already present — never overwritten)")
    print(f"module now: {len(cats)} steps, {pts} lesson objects")
    print("  next: python3 build-arcs.py && python3 build-vocab-data.py && python3 build-vite-app.py")

if __name__ == "__main__":
    main()
