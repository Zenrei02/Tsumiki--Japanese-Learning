#!/usr/bin/env python3
"""Generate the vocabulary module's word table from the ledger + kanji order.

The module is a single-file artifact and cannot import shared data, so this
emits a compact JS literal to paste in (and a JSON copy for tooling). Re-run
after any change to the ledger, the kanji order, or the grammar module's banks.

Every word carries what the module needs to run the return mechanic:
  w  written form
  r  reading (kana)
  m  meaning (English gloss)
  k  its kanji that the syllabus teaches, IN KANJI-ORDER — this list IS the
     word's visit schedule (order-decisions-v1.md §6.4: a word returns each
     time one of its kanji comes due)
  u  kanji it contains that the syllabus never teaches — these never unlock,
     so a word with any of these never becomes fully writable in Stage 1
  j  jukujikun flag: reading does not decompose across characters, so the
     word must carry its own reading and never claims per-character
     readability (Kanji display pipeline row, Jul 28 2026)
  s  the grammar step that introduces it, or null for dictionary-only words
     awaiting promotion

NOTE ON SCOPE: only words the curriculum actually teaches get s. The other
~193 ledger entries are display-dictionary entries; they are included with
s=null so the promotion queue is visible in-module, but the module does not
surface them as vocabulary until they are promoted.
"""
import json, pathlib, re, datetime

HERE = pathlib.Path(__file__).parent
LEDGER = json.loads((HERE / "word-ledger-v1.json").read_text(encoding="utf-8"))
KO = json.loads((HERE / "kanji-order-v2.json").read_text(encoding="utf-8"))
CO = json.loads((HERE / "curriculum-order-v1.json").read_text(encoding="utf-8"))

kpos = {r["char"]: r["pos"] for r in KO["order"]}
first_intro = CO["vocabulary"]["first_introduction"]
KANJI_RE = re.compile(r"[㐀-鿿々]")

# Session 7 derived readings for the 33 kanji-containing bank words that had
# none (UniDic via fugashi — dictionary facts, nothing model-authored). They
# were emitted as a patch and never applied to the JSX, because applying them
# there is an authoring pass. Nothing had consumed them until now.
#
# Ruby needs a reading, so without these a third of the taught vocabulary would
# render as bare kanji with no way to read it. Merged here, into generated data
# only — the modules are still untouched.
#
# STATUS: DERIVED, NOT REVIEWED. Two entries are flagged for a human glance
# (お茶 by the multi-token rule; 言う, where UniDic's surface reading ゆう
# disagreed with its own lemma reading イウ and the headword was taken).
NOTES = {}
notes_path = HERE / "vocab-notes-v1.json"
if notes_path.exists():
    NOTES = {k: v for k, v in json.loads(notes_path.read_text(encoding="utf-8")).items()
             if not k.startswith("_")}

PATCH = {}
patch_path = HERE / "word-readings-patch-v1.json"
if patch_path.exists():
    PATCH = {e["written"]: e["reading"]
             for e in json.loads(patch_path.read_text(encoding="utf-8"))["entries"]}

# Seeded from the curriculum pipeline; the full list is its own tracker row.
JUKUJIKUN = {"今日", "明日", "昨日", "大人", "一人", "二人", "今年",
             "上手", "下手", "日本", "一日", "二十歳"}

words = []
for e in LEDGER["words"]:
    w = e["written"]
    ks = [c for c in w if KANJI_RE.match(c)]
    taught = sorted((c for c in ks if c in kpos), key=lambda c: kpos[c])
    untaught = [c for c in ks if c not in kpos]
    words.append({
        "w": w,
        "r": (e["readings"] or [None])[0] or PATCH.get(w),
        "m": (e["meanings"] or [None])[0],
        "k": taught,
        "u": untaught,
        "j": w in JUKUJIKUN,
        "s": first_intro.get(w, {}).get("step"),
        "x": NOTES.get(w),
    })

# taught words first, then by first unlock position — the order the module meets them
def sort_key(x):
    return (x["s"] is None, kpos.get(x["k"][0], 999) if x["k"] else 999, x["w"])
words.sort(key=sort_key)

out = {"generated": datetime.date.today().isoformat(),
       "kanji_order": "kanji-order-v2.json",
       "counts": {
           "total": len(words),
           "taught": sum(1 for x in words if x["s"]),
           "enters_module": sum(1 for x in words if x["s"] and x["k"]),
           "visits": sum(len(x["k"]) for x in words if x["s"]),
           "completable": sum(1 for x in words if x["s"] and x["k"] and not x["u"]),
           "taught_with_kanji": sum(1 for x in words if x["s"] and (x["k"] or x["u"])),
           "ruby_capable": sum(1 for x in words if x["s"] and (x["k"] or x["u"]) and x["r"]),
           "readings_from_patch": sum(1 for x in words if x["s"] and x["w"] in PATCH),
           "with_teaching_notes": sum(1 for x in words if x.get("x")),
       },
       "words": words}
(HERE / "vocab-data-v1.json").write_text(
    json.dumps(out, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

# compact JS literal — only fields the module reads, nulls dropped
def js(x):
    parts = [f'w:"{x["w"]}"']
    if x["r"]: parts.append(f'r:"{x["r"]}"')
    if x["m"]: parts.append('m:"%s"' % x["m"].replace('"', '\\"'))
    if x["k"]: parts.append("k:[%s]" % ",".join(f'"{c}"' for c in x["k"]))
    if x["u"]: parts.append("u:[%s]" % ",".join(f'"{c}"' for c in x["u"]))
    if x["j"]: parts.append("j:1")
    if x["s"]: parts.append(f's:"{x["s"]}"')
    if x.get("x"):
        n = x["x"]
        inner = ",".join(f'{f}:{json.dumps(n[f], ensure_ascii=False)}'
                         for f in ("what", "build", "when", "watch") if n.get(f))
        parts.append("x:{" + inner + "}")
    return "{" + ",".join(parts) + "}"

lines = ["// ————— Word table —————",
         "// GENERATED by build-vocab-data.py — do not hand-edit; re-run instead.",
         f"// {out['counts']['taught']} taught words of {out['counts']['total']} in the ledger; "
         f"{out['counts']['enters_module']} ever enter this module, "
         f"{out['counts']['visits']} total visits, "
         f"{out['counts']['completable']} can become fully writable in Stage 1.",
         "// k[] is the word's visit schedule: one visit per kanji, in kanji-teaching order.",
         "const WORDS = ["]
lines += ["  " + js(x) + "," for x in words]
lines.append("];")
(HERE / "vocab-data-v1.js").write_text("\n".join(lines) + "\n", encoding="utf-8")

print(json.dumps(out["counts"], indent=2))
print(f"wrote vocab-data-v1.json and vocab-data-v1.js ({len(words)} words)")

# ---- splice into the module, if present ----
mod = HERE / "vocabulary-module.jsx"
if mod.exists():
    src = mod.read_text(encoding="utf-8")
    block = "\n".join(lines)
    # Delimit with our OWN markers. Anchoring the end on whatever section
    # happens to follow means a later generator's output gets swallowed —
    # which is exactly what happened to the shared stroke engine once it was
    # spliced in between this block and the Storage section.
    start = src.find("// @@WORDS-START@@")
    end = src.find("// @@WORDS-END@@")
    if start != -1 and end != -1 and start < end:
        src = (src[:start] + "// @@WORDS-START@@\n" + block + "\n"
               + src[end:])
        mod.write_text(src, encoding="utf-8")
        print("spliced regenerated WORDS into vocabulary-module.jsx")
    else:
        print("WARNING: could not locate the WORDS block in vocabulary-module.jsx")
