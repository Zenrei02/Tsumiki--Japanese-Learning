#!/usr/bin/env python3
"""Kanji ordering pipeline — replaces the hand-sequenced placeholder order.

Method (Session 4 decision, word-driven per Loach & Wang's final section):
  1. DEMAND — the primary signal. How many words in the app's own ledger
     (word-ledger-v1.json) contain this character. The app's corpus is small
     but correctly aimed; general corpora would push newspaper kanji at
     beginners (the kyōiku mistargeting in a new costume).
  2. GENERAL FREQUENCY — secondary. Merged rank across every corpus file
     present in freq-data/: kanjidic-misc.json (Mainichi newspaper rank,
     always present) plus any of aozora.json / news.json / twitter.json
     (scriptin/kanji-frequency, CC-BY-4.0) dropped into freq-data/.
     wikipedia.json is IGNORED even if present — least consistent of the
     six common databases (Session 2 finding).
  3. COST — DYNAMIC, per Session 4 Decision 3: computed assuming already-
     placed components are known, so a compound's cost falls once its parts
     land and the list self-organises component-first. Base is strokes,
     discounted by placed components' strokes, plus a load for parts the
     syllabus never teaches.
  4. CENTRALITY = (0.7·demand + 0.3·frequency) / cost, recomputed each pick.
  5. TOPOLOGICAL PASS — greedy pick of highest-centrality character whose
     KanjiVG depth-1 parts (those that are themselves taught characters)
     are already placed. Components precede compounds by construction.
  6. CONTRASTIVE ADJACENCY — Session 4 Decision 6 (KLC's approach): when a
     character lands, its ready confusables (the module's own curated look:
     fields, kanjium as backup) are placed immediately after it. Meeting
     look-alikes far apart lets the wrong one settle first; 日/目/白 and
     人/入/八 are taught side by side, deliberately.

Frequency-source caveat (Session 4 Decision 8): KANJIDIC2 ranks are
newspaper-derived and skew political/economic — the wrong target for
someone learning to read messages and menus. While it is the only corpus
present the 0.3 frequency term inherits that skew; the scriptin merge
(aozora/news/twitter) corrects it. The 0.7 word-demand term is unaffected.

Scope: orders the 63 characters the module currently teaches (comparison
against the hand order is the point), then ranks the ledger characters the
module does NOT yet teach as the candidate queue for expansion.

Coverage: if corpus count files are present in freq-data/, the true
cumulative coverage curve is computed for the generated order. Otherwise
that section reports what to download (one wget on an unrestricted machine).

Outputs: kanji-order-v1.json, kanji-order-report.md. Re-runnable; safe.
It does NOT rewrite kanji-module.jsx — applying the order to lessons is an
authoring decision, not a data operation.
"""
import json, re, pathlib, datetime, sys
from collections import defaultdict

HERE = pathlib.Path(__file__).parent
FD = HERE / "freq-data"
MODULE = (HERE / "kanji-module.jsx").read_text(encoding="utf-8")
LEDGER = json.loads((HERE / "word-ledger-v1.json").read_text(encoding="utf-8"))
MISC = json.loads((FD / "kanjidic-misc.json").read_text(encoding="utf-8"))["chars"]
LOOK = json.loads((FD / "lookalikes.json").read_text(encoding="utf-8"))["pairs"]
KANJI_RE = re.compile(r"[㐀-鿿々]")

# ---- module data ----
parts_src = re.search(r"const PARTS = (\{.*?\});", MODULE, re.S).group(1)
PARTS = json.loads(parts_src)           # char -> [{"e": comp, "orig"?: parent}]
TAUGHT = list(PARTS.keys())             # the 63 taught characters
# current hand order: lesson `chars` arrays in file order (mirrors KANJI_SYLLABUS)
hand_order, seen = [], set()
for m in re.finditer(r'chars: \[([^\]]*)\]', MODULE):
    for c in re.findall(r'"(.)"', m.group(1)):
        if c not in seen:
            seen.add(c); hand_order.append(c)

# ---- signal 1: demand from the app's own words ----
demand = defaultdict(int)
for w in LEDGER["words"]:
    weight = len(w["sources"])          # multi-store words matter more
    for ch in set(w["written"]):
        if KANJI_RE.match(ch):
            demand[ch] += weight

# ---- signal 2: merged general frequency ----
corpora = {"kanjidic (newspaper rank)": {c: v["freq"] for c, v in MISC.items() if v.get("freq")}}
for name in ("aozora", "news", "twitter"):
    f = FD / f"{name}.json"
    if f.exists():
        rows = json.loads(f.read_text(encoding="utf-8"))
        ranks, r = {}, 0
        for row in rows:                # scriptin schema: [char, count, ...], first row "all"
            if row[0] == "all": continue
            r += 1; ranks[row[0]] = r
        corpora[name] = ranks
IGNORED_WIKI = (FD / "wikipedia.json").exists()

def freq_score(c):
    scores = []
    for ranks in corpora.values():
        if c in ranks:
            scores.append(1.0 / ranks[c])       # harmonic in rank
    return sum(scores) / len(corpora) if scores else 0.0

# ---- confusables: the module's own curated look: fields, kanjium backup ----
MODLOOK = defaultdict(set)
for m in re.finditer(r'"(.)": \{[^{}]*?look: \[([^\]]*)\]', MODULE):
    c, body = m.group(1), m.group(2)
    for x in re.findall(r'"(.)"', body):
        MODLOOK[c].add(x); MODLOOK[x].add(c)     # symmetric
def confusables(c):
    s = set(MODLOOK.get(c, ()))
    if not s:
        s = set(LOOK.get(c, ()))
    return s

# ---- dynamic cost (Session 4 Decision 3) ----
def strokes(c):
    v = MISC.get(c, {}).get("strokes")
    return v if v else 8                        # neutral default
def taught_deps(c):
    return [p["e"] for p in PARTS.get(c, []) if p["e"] in TAUGHT] + \
           [p.get("orig") for p in PARTS.get(c, []) if p.get("orig") in TAUGHT]
def untaught_parts(c):
    return [p["e"] for p in PARTS.get(c, [])
            if p["e"] not in TAUGHT and p.get("orig") not in TAUGHT]
def cost(c, placed=frozenset()):
    known = sum(strokes(p) for p in set(taught_deps(c)) if p in placed)
    eff = max(3.0, strokes(c) - 0.7 * known)    # parts you know are near-free
    return eff + 1.5 * len(untaught_parts(c))

# ---- centrality, recomputed against the current placed set ----
maxd = max(demand.values()) if demand else 1
maxf = max((freq_score(c) for c in TAUGHT), default=1) or 1
def centrality(c, placed=frozenset()):
    d = demand.get(c, 0) / maxd
    f = freq_score(c) / maxf
    return (0.7 * d + 0.3 * f) / cost(c, placed)

# ---- topological greedy + contrastive adjacency (Session 4 Decisions 3+6) ----
deps = taught_deps
order, placed, pool = [], set(), set(TAUGHT)
adjacency_chains = []
def ready(c): return all(d in placed for d in deps(c))
while pool:
    cands = [c for c in pool if ready(c)] or list(pool)   # cycle guard
    pick = max(cands, key=lambda c: centrality(c, placed))
    order.append(pick); placed.add(pick); pool.discard(pick)
    # pull ready confusables in immediately — taught side by side, not apart
    chain = [pick]
    frontier = [pick]
    while frontier:
        nxt = [x for x in confusables(frontier.pop()) if x in pool and ready(x)]
        for x in sorted(nxt, key=lambda c: -centrality(c, placed)):
            if x in pool:
                order.append(x); placed.add(x); pool.discard(x)
                chain.append(x); frontier.append(x)
    if len(chain) > 1:
        adjacency_chains.append(chain)
pos = {c: i for i, c in enumerate(order)}

# ---- candidate queue: ledger chars the module doesn't teach yet ----
queue = sorted((c for c in demand if c not in placed),
               key=lambda c: -centrality(c))

# ---- coverage curve, if corpus counts are available ----
coverage = None
for name in ("aozora", "news", "twitter"):
    f = FD / f"{name}.json"
    if f.exists():
        rows = json.loads(f.read_text(encoding="utf-8"))
        total = next((r[1] for r in rows if r[0] == "all"), None)
        counts = {r[0]: r[1] for r in rows if r[0] != "all"}
        if total:
            cum, pts = 0, []
            for i, c in enumerate(order, 1):
                cum += counts.get(c, 0)
                if i in (10, 25, 40, 63): pts.append((i, round(100 * cum / total, 2)))
            coverage = (name, pts)
            break

# ---- outputs ----
rows = []
for i, c in enumerate(order):
    rows.append({"pos": i + 1, "char": c, "hand_pos": (hand_order.index(c) + 1) if c in hand_order else None,
                 "demand_words": demand.get(c, 0), "strokes": strokes(c),
                 "centrality": round(centrality(c), 4), "parts": deps(c)})
out = {"generated": datetime.date.today().isoformat(),
       "method": "0.7*ledger-demand + 0.3*merged-frequency, / (strokes + 1.5*parts + 0.5*lookalikes); greedy topological",
       "corpora_used": list(corpora.keys()), "wikipedia_ignored": IGNORED_WIKI,
       "order": rows,
       "contrast_adjacency_chains": adjacency_chains,
       "expansion_queue": [{"char": c, "demand_words": demand[c],
                            "example_words": [w["written"] for w in LEDGER["words"] if c in w["written"]][:3]}
                           for c in queue[:40]]}
(HERE / "kanji-order-v1.json").write_text(json.dumps(out, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

# report
moves = [(r["char"], r["hand_pos"], r["pos"]) for r in rows if r["hand_pos"] and abs(r["hand_pos"] - r["pos"]) >= 10]
L = [f"# Kanji order v1 — {datetime.date.today().isoformat()}",
     "",
     f"Corpora merged: {', '.join(corpora.keys())}."
     + (" wikipedia.json present but ignored (unreliable — Session 2)." if IGNORED_WIKI else ""),
     f"Demand source: word-ledger-v1.json ({LEDGER['count']} words). "
     f"Component precedence: KanjiVG depth-1, holds by construction. "
     f"Cost is dynamic (placed components discount a compound) and confusables "
     f"are pulled adjacent — Session 4 Decisions 3 and 6.",
     ""
     + ("" if len(corpora) > 1 else
        "⚠ Only KANJIDIC2 newspaper ranks present — Session 4 Decision 8 calls that "
        "skew the wrong target for menu/message readers. The 0.3 frequency term "
        "inherits it until the scriptin corpora land in freq-data/."),
     "",
     "## Generated order (63 taught characters)",
     "",
     "".join(r["char"] for r in rows),
     "",
     "## Largest moves vs the hand order (≥10 positions)",
     ""]
if moves:
    L += [f"- {c}: hand #{h} → generated #{p}" for c, h, p in sorted(moves, key=lambda m: -abs(m[1] - m[2]))]
else:
    L.append("None — the hand order was already close to the computed one.")
L += ["", "## Contrastive adjacency chains (Session 4 Decision 6 — confusables taught side by side)",
      "",
      ("; ".join("·".join(ch) for ch in adjacency_chains) or "none formed"),
      "", "## Expansion queue (ledger characters not yet taught — top 15)", ""]
for q in out["expansion_queue"][:15]:
    L.append(f"- {q['char']} — in {q['demand_words']} app word-slots ({'、'.join(q['example_words'])})")
# untaught components: precedence can only hold among taught chars; these
# characters contain KanjiVG parts nothing in the syllabus teaches.
untaught = []
for c in order:
    missing = [p["e"] for p in PARTS.get(c, [])
               if p["e"] not in TAUGHT and not p.get("orig") in TAUGHT]
    if missing:
        untaught.append((c, missing))
L += ["", "## Untaught components (known limitation)",
      "",
      "Precedence holds among taught characters only. These contain KanjiVG "
      "parts nothing in the syllabus teaches — each needs either the part "
      "added to the syllabus, a 'shape only, don't learn it' framing in the "
      "lesson, or a later position. The hand order buried some of these by "
      "instinct; the pipeline surfaces them so the choice is explicit:",
      ""]
for c, missing in untaught:
    p = pos[c] + 1
    L.append(f"- {c} (generated #{p}): contains untaught {'、'.join(missing)}")
L += ["", "## Coverage curve", ""]
if coverage:
    name, pts = coverage
    L.append(f"Computed against the {name} corpus: " + "; ".join(f"first {n} chars → {p}% of running text" for n, p in pts))
else:
    L += ["**Pending corpus counts.** The sandbox cannot reach GitHub raw; run this on your machine, in this folder:",
          "```",
          "wget -P freq-data https://raw.githubusercontent.com/scriptin/kanji-frequency/master/data2015/{aozora,news,twitter}.json",
          "```",
          "then re-run `python3 kanji-ordering-pipeline.py` — the merge widens and this section fills in automatically.",
          "(Data: scriptin/kanji-frequency, CC-BY-4.0.)"]
(HERE / "kanji-order-report.md").write_text("\n".join(L) + "\n", encoding="utf-8")
print("\n".join(L))
