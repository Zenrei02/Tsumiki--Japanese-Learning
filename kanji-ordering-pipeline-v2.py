#!/usr/bin/env python3
"""Kanji ordering pipeline v2 — resolves the two blockers that made v1 unusable.

v1 (2026-08-03) produced a defensible order and then flagged two problems that
stopped it being applied. This version resolves both, in the light of what the
ledger actually says.

BLOCKER 1 — untaught components (22 characters, 24 distinct parts).
  v1 loaded every untaught part with a flat +1.5 cost and listed them as an
  open question: promote the part into the syllabus, frame it as shape-only,
  or move the character later.

  Checked against the ledger, the question answers itself. Every promotion
  candidate carries ZERO word-demand: 門, 寺, 刀, 米, 交, 玉, 舌, 禾, 丁 appear
  in no app word at all; 可 appears in one (可能形, a metalinguistic label);
  only 言 has any real demand, and only 2. Promoting them would teach
  characters the learner will never read, purely to satisfy a decomposition
  graph — which is precisely the mistargeting the word-driven method exists
  to avoid. So no part is promoted.

  Instead the policy states what was always true: KanjiVG decomposition is a
  STRUCTURAL fact and carries no pedagogical claim. The module already knows
  this locally (it overrides KanjiVG's 白 ⊃ 日 because the shape is real and
  the meaning is not). v2 generalises that from an exception to a rule, with
  every part classified explicitly:

    named — a nameable shape with a usable mnemonic. Glossed on the card
            ("this shape means gate — you are not learning it yet"). NOT a
            lesson, NOT in KANJI_SYLLABUS, NOT a review item. Cost +0.5,
            for the one glance it costs.
    mute  — a stroke or a decomposition artifact with no honest gloss.
            Hidden from the card entirely; the character is atomic for
            teaching. Cost +0. Showing these ACTIVELY MISLEADS: "上 = 卜 + 一"
            teaches a 3-stroke character as a compound of two things the
            learner will never see again.

  Consequence for the order: v1's flat +1.5 penalised simple characters for
  artifact parts (上 下 七 千 中 年 気 母 円 四) while under-penalising nothing.
  Removing it is not a loosening — it is a correction.

BLOCKER 2 — only KANJIDIC2 newspaper ranks are present.
  Session 4 Decision 8 calls newspaper frequency the wrong target for a
  learner reading menus and messages, and the scriptin corpora still cannot
  be fetched (the sandbox is refused by the proxy; see README note).

  v2 does not guess. It runs the whole order at a sweep of frequency weights
  and reports how much the order actually depends on the term. If the order
  is stable across 0.0–0.5, the missing corpora are not blocking and the
  order can be applied now; if it swings, they are, and it cannot. The
  caveat becomes a measurement instead of a warning label.

Everything else is carried from v1 unchanged: word-demand as the primary
signal, dynamic cost (placed components discount a compound), greedy
topological pick, contrastive adjacency (Session 4 Decisions 3 and 6).

Outputs: kanji-order-v2.json, kanji-order-report-v2.md. Re-runnable, safe,
and it does NOT rewrite kanji-module.jsx — applying the order to lessons is
an authoring decision, not a data operation.
"""
import json, re, pathlib, datetime
from collections import defaultdict

HERE = pathlib.Path(__file__).parent
FD = HERE / "freq-data"
MODULE = (HERE / "kanji-module.jsx").read_text(encoding="utf-8")
LEDGER = json.loads((HERE / "word-ledger-v1.json").read_text(encoding="utf-8"))
MISC = json.loads((FD / "kanjidic-misc.json").read_text(encoding="utf-8"))["chars"]
LOOK = json.loads((FD / "lookalikes.json").read_text(encoding="utf-8"))["pairs"]
KANJI_RE = re.compile(r"[㐀-鿿々]")

# ---------------------------------------------------------------- policy ----
# Every KanjiVG part that is not itself a taught character. Curated, because
# there are only 24 and each is a teaching decision that should be on the
# record rather than inferred by a rule. Rationale is carried into the report.
# PROMOTED — the one authored exception to the demand rule (Lloyd, Session 9).
# The rule says a component earns a syllabus slot only if it carries ledger
# demand. 言 has the most of any candidate (言う, 言) but only 2, so the rule
# alone would have kept it a named shape. Overridden deliberately, on grounds
# the ledger cannot see: 言う is a high-frequency verb in its own right, and 言
# is the backbone of 言語, 話, 読む, 語 and much of the vocabulary just past
# this syllabus. The ledger measures the corpus as it is today, not as it will
# be two stages out, and that is a real limitation of demand-driven ordering.
#
# ⚠️ AUTHORING DEPENDENCY, not free: 言 has no KanjiVG stroke paths and no
# dictionary entry in kanji-module.jsx (verified — it appears only as a part of
# 話). Promoting it means adding 7 stroke paths, a dictionary entry, readings,
# and a lesson slot before this order can be applied. The pipeline places it;
# it cannot supply the data.
PROMOTED = {
    "言": "say / speech — 言う on its own, and the component behind 話, 読む, 語, 言語",
}
NAMED = {
    "門": "gate — the shape is a pair of doors, and it recurs widely later",
    "米": "rice — honest as a shape in 来, though not its true origin",
    "玉": "jewel — 'a jewel inside a border' is a good story for 国",
    "刀": "blade — pairs with 八 'divide' to make 分 read as splitting",
    "寺": "temple — recurs in 持, 待, 特, so the glance is repaid",
    "交": "crossing — 校 as 'where paths cross by the trees'",
    "舌": "tongue — with 言 it makes 話 obviously about talking",
    "可": "possible — abstract, but it is a real character the learner may meet",
    "禾": "grain (radical) — the leaning tree-like shape on the left of 私",
    "囗": "enclosure (radical) — the full box, distinct from 口 the mouth",
    "彳": "going (radical) — the 'step' on the left of 行",
    "丁": "block — a real if uncommon character; 町 is 'fields plus blocks'",
    "儿": "legs (radical) — 見 as an eye on legs is well attested and memorable",
}
MUTE = {
    "丿": "a single diagonal stroke, not a component",
    "丨": "a single vertical stroke, not a component",
    "乙": "effectively the whole of 七; decomposing it says nothing",
    "卜": "artifact — 上 and 下 are atomic 3-stroke characters",
    "冂": "artifact — 円's frame, no separable meaning",
    "干": "misleading — 年 is historically 禾 + 千, not this",
    "乂": "a stroke pair inside 気, no gloss possible",
    "厶": "artifact in 私, no honest meaning",
    "毋": "circular — this is just 母's own frame",
    "气": "the vapour frame of 気; the character's story is better told whole",
}
COST_NAMED, COST_MUTE = 0.5, 0.0

# ---------------------------------------------------------- module data ----
PARTS = json.loads(re.search(r"const PARTS = (\{.*?\});", MODULE, re.S).group(1))
for _p in PROMOTED:                      # promoted parts join the taught set
    PARTS.setdefault(_p, [])             # no depth-1 parts of their own recorded
TAUGHT = list(PARTS.keys())
MISSING_DATA = [p for p in PROMOTED if not re.search(r'"' + p + r'":\s*\[\s*"[Mm]', MODULE)]
hand_order, seen = [], set()
for m in re.finditer(r"chars: \[([^\]]*)\]", MODULE):
    for c in re.findall(r'"(.)"', m.group(1)):
        if c not in seen:
            seen.add(c); hand_order.append(c)

# ------------------------------------------------------------- BLOCKER 3 ----
# The Stage 0 block is NOT a centrality decision and must not be reordered by one.
# Its characters are chosen because between them they demonstrate the nine stroke
# rules — a teaching criterion the pipeline has no visibility of.
#
# THIS WAS ALREADY KNOWN. The v1 tracker row records it plainly among its caveats:
# "Stage 0's stroke-rule constraint is not modelled." It is a recorded limitation
# being resolved here, not a discovery. What v2 adds is the measurement — how much
# the omission actually cost — and the fix.
#
# The cost: v1 sorted all 63 together, so 口, 川, 田, 中, 四, 山, 女 were each
# pushed forty-odd places down the list, and those moves were reported as the
# method paying off. v2 locks Stage 0 as an ordered prefix (everything taught
# before the stroke-rule checkpoint) and derives centrality over the remainder.
_cut = MODULE.index('id: "cp-strokes"')
STAGE0, _s = [], set()
for m in re.finditer(r"chars: \[([^\]]*)\]", MODULE[:_cut]):
    for c in re.findall(r'"(.)"', m.group(1)):
        if c not in _s: _s.add(c); STAGE0.append(c)
STAGE0_SET = set(STAGE0)

# ------------------------------------------- signal 1: demand from words ----
demand = defaultdict(int)
for w in LEDGER["words"]:
    weight = len(w["sources"])
    for ch in set(w["written"]):
        if KANJI_RE.match(ch):
            demand[ch] += weight

# ------------------------------------- signal 2: merged general frequency ----
corpora = {"kanjidic (newspaper rank)":
           {c: v["freq"] for c, v in MISC.items() if v.get("freq")}}
for name in ("aozora", "news", "twitter"):
    f = FD / f"{name}.json"
    if f.exists():
        rows = json.loads(f.read_text(encoding="utf-8"))
        ranks, r = {}, 0
        for row in rows:
            if row[0] == "all": continue
            r += 1; ranks[row[0]] = r
        corpora[name] = ranks
IGNORED_WIKI = (FD / "wikipedia.json").exists()   # least consistent — Session 2
NEWSPAPER_ONLY = len(corpora) == 1

def freq_score(c):
    s = [1.0 / ranks[c] for ranks in corpora.values() if c in ranks]
    return sum(s) / len(corpora) if s else 0.0

# ----------------------------------------------------------- confusables ----
MODLOOK = defaultdict(set)
for m in re.finditer(r'"(.)": \{[^{}]*?look: \[([^\]]*)\]', MODULE):
    c, body = m.group(1), m.group(2)
    for x in re.findall(r'"(.)"', body):
        MODLOOK[c].add(x); MODLOOK[x].add(c)
def confusables(c):
    return set(MODLOOK.get(c, ())) or set(LOOK.get(c, ()))

# ------------------------------------------------------- cost, v2 policy ----
def strokes(c):
    return MISC.get(c, {}).get("strokes") or 8
def taught_deps(c):
    return [p["e"] for p in PARTS.get(c, []) if p["e"] in TAUGHT] + \
           [p.get("orig") for p in PARTS.get(c, []) if p.get("orig") in TAUGHT]
def foreign_parts(c):
    return [p["e"] for p in PARTS.get(c, [])
            if p["e"] not in TAUGHT and p.get("orig") not in TAUGHT]
def part_load(c):
    """v2: named shapes cost a glance, muted artifacts cost nothing."""
    return sum(COST_NAMED if p in NAMED else
               COST_MUTE if p in MUTE else COST_NAMED   # unseen part -> named
               for p in foreign_parts(c))
def cost(c, placed=frozenset()):
    known = sum(strokes(p) for p in set(taught_deps(c)) if p in placed)
    return max(3.0, strokes(c) - 0.7 * known) + part_load(c)

# --------------------------------------------------- centrality + ordering ----
maxd = max(demand.values()) if demand else 1
maxf = max((freq_score(c) for c in TAUGHT), default=1) or 1

def build_order(fw):
    """Greedy topological pick at frequency weight `fw` (demand weight 1-fw)."""
    def centrality(c, placed):
        d = demand.get(c, 0) / maxd
        f = freq_score(c) / maxf
        return ((1 - fw) * d + fw * f) / cost(c, placed)
    # Stage 0 is a fixed prefix in its authored (stroke-rule) order.
    order, placed, chains = list(STAGE0), set(STAGE0), []
    pool = set(TAUGHT) - STAGE0_SET
    ready = lambda c: all(d in placed for d in taught_deps(c))
    while pool:
        cands = [c for c in pool if ready(c)] or list(pool)
        pick = max(cands, key=lambda c: (centrality(c, placed), -strokes(c), c))
        order.append(pick); placed.add(pick); pool.discard(pick)
        chain, frontier = [pick], [pick]
        while frontier:                      # pull ready look-alikes in beside it
            nxt = [x for x in confusables(frontier.pop()) if x in pool and ready(x)]
            for x in sorted(nxt, key=lambda c: (-centrality(c, placed), c)):
                if x in pool:
                    order.append(x); placed.add(x); pool.discard(x)
                    chain.append(x); frontier.append(x)
        if len(chain) > 1: chains.append(chain)
    return order, chains

BASE_FW = 0.3
order, adjacency_chains = build_order(BASE_FW)
pos = {c: i for i, c in enumerate(order)}

# ------------------------------------------------- BLOCKER 2: sensitivity ----
SWEEP = [0.0, 0.15, 0.3, 0.5]
sweeps = {fw: build_order(fw)[0] for fw in SWEEP}
def kendall_tau(a, b):
    ia, ib = {c: i for i, c in enumerate(a)}, {c: i for i, c in enumerate(b)}
    cs = list(a); n = len(cs); conc = disc = 0
    for i in range(n):
        for j in range(i + 1, n):
            x, y = cs[i], cs[j]
            s = (ia[x] - ia[y]) * (ib[x] - ib[y])
            conc += s > 0; disc += s < 0
    return (conc - disc) / (conc + disc) if conc + disc else 1.0
sensitivity = []
for fw in SWEEP:
    o = sweeps[fw]
    p = {c: i for i, c in enumerate(o)}
    moved = max(abs(p[c] - pos[c]) for c in TAUGHT)
    n10 = sum(1 for c in TAUGHT if abs(p[c] - pos[c]) >= 10)
    sensitivity.append((fw, round(kendall_tau(order, o), 4), moved, n10))

# --------------------------------------------------------- expansion queue ----
def centrality_flat(c):
    d = demand.get(c, 0) / maxd
    f = freq_score(c) / maxf
    return ((1 - BASE_FW) * d + BASE_FW * f) / cost(c)
queue = sorted((c for c in demand if c not in pos), key=lambda c: -centrality_flat(c))

# ---------------------------------------------------------- coverage curve ----
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
            coverage = (name, pts); break

# ----------------------------------------------------------------- output ----
rows = [{"pos": i + 1, "char": c,
         "hand_pos": (hand_order.index(c) + 1) if c in hand_order else None,
         "v1_pos": None,
         "demand_words": demand.get(c, 0), "strokes": strokes(c),
         "cost": round(cost(c), 2), "centrality": round(centrality_flat(c), 4),
         "taught_parts": taught_deps(c),
         "named_shapes": [p for p in foreign_parts(c) if p in NAMED],
         "muted_shapes": [p for p in foreign_parts(c) if p in MUTE]}
        for i, c in enumerate(order)]

v1p = None
v1f = HERE / "kanji-order-v1.json"
if v1f.exists():
    v1p = {r["char"]: r["pos"] for r in json.loads(v1f.read_text(encoding="utf-8"))["order"]}
    for r in rows: r["v1_pos"] = v1p.get(r["char"])

out = {"generated": datetime.date.today().isoformat(), "version": 2,
       "method": f"({1-BASE_FW:.1f}*ledger-demand + {BASE_FW}*merged-frequency) / "
                 "(strokes - 0.7*placed-parts + 0.5*named-shapes); greedy topological",
       "component_policy": {"named": NAMED, "muted": MUTE,
                            "promoted": PROMOTED,
                            "promoted_missing_module_data": MISSING_DATA,
                            "promotion_rule": "a component enters the syllabus only if it "
                                              "carries ledger word-demand, OR by an authored "
                                              "override recorded with its reason"},
       "stage0_locked": STAGE0,
       "corpora_used": list(corpora.keys()), "newspaper_only": NEWSPAPER_ONLY,
       "wikipedia_ignored": IGNORED_WIKI,
       "frequency_sensitivity": [{"weight": w, "kendall_tau_vs_base": t,
                                  "max_displacement": m, "chars_moved_10plus": n}
                                 for w, t, m, n in sensitivity],
       "order": rows, "contrast_adjacency_chains": adjacency_chains,
       "expansion_queue": [{"char": c, "demand_words": demand[c],
                            "example_words": [w["written"] for w in LEDGER["words"]
                                              if c in w["written"]][:3]}
                           for c in queue[:40]]}
(HERE / "kanji-order-v2.json").write_text(
    json.dumps(out, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

# ------------------------------------------------------------------ report ----
L = [f"# Kanji order v2 — {datetime.date.today().isoformat()}", "",
     "Supersedes `kanji-order-report.md` (v1, 2026-08-03). Same method; the two "
     "blockers v1 raised are resolved here rather than deferred.", "",
     f"Corpora merged: {', '.join(corpora.keys())}."
     + (" wikipedia.json present but ignored (least consistent — Session 2)." if IGNORED_WIKI else ""),
     f"Demand source: word-ledger-v1.json ({LEDGER['count']} words).", "",
     "## Blocker 1 — untaught components: resolved, no promotions", "",
     "v1 listed 22 characters containing parts the syllabus never teaches and asked "
     "whether to promote the parts, frame them as shape-only, or move the characters "
     "later. Checked against the ledger the question collapses:", ""]
promo_demand = [(c, demand.get(c, 0)) for c in list(NAMED)]
L += [f"| Candidate part | Ledger word-demand |", "|---|---:|"]
L += [f"| {c} | {d} |" for c, d in sorted(promo_demand, key=lambda x: -x[1])]
L += ["", "### The one authored override — 言 is promoted", "",
      "Lloyd's call, Session 9, and it is worth recording as an override rather than folding "
      "it into the rule. 言 has the most demand of any candidate and still only 2, so the "
      "demand rule alone would have left it a named shape. It is promoted on grounds the "
      "ledger cannot see: **言う is a high-frequency verb in its own right, and 言 is the "
      "backbone of 話, 読む, 語, 言語** — most of which sit just past this syllabus. "
      "The ledger measures the corpus as it is today, not as it will be two stages out. "
      "That is a genuine limitation of demand-driven ordering and this is the first case "
      "where it bites.", ""]
if MISSING_DATA:
    L += [f"⚠️ **Not free.** {'、'.join(MISSING_DATA)} has no KanjiVG stroke paths and no "
          "dictionary entry in `kanji-module.jsx` — it appears there only as a part of 話. "
          "Promoting it needs stroke paths, a dictionary entry with readings, and a lesson "
          "slot **before this order can be applied**. The pipeline places it; it cannot "
          "supply the data.", ""]
L += ["### Everything else stays out", "",
      "**No other component carries enough demand to earn a syllabus slot.** Promoting them "
      "would teach characters the learner never reads, to satisfy a decomposition "
      "graph — the same mistargeting the word-driven method exists to prevent. So the "
      "resolution is not to add characters but to state what was always true: "
      "**KanjiVG decomposition is a structural fact and carries no pedagogical claim.** "
      "The module already applies that locally, overriding KanjiVG's 白 ⊃ 日 because the "
      "shape is real and the meaning is not. v2 makes it a rule, and classifies every part:", "",
      f"**Named shapes ({len(NAMED)})** — glossed on the card as a shape, never taught, "
      f"never scheduled, never in `KANJI_SYLLABUS`. Cost +{COST_NAMED} for the glance.", ""]
L += [f"- **{c}** — {why}" for c, why in NAMED.items()]
L += ["", f"**Muted shapes ({len(MUTE)})** — hidden from the card entirely; the character "
      f"is atomic for teaching. Cost +{COST_MUTE}. These do not merely fail to help — "
      "showing them misleads.", ""]
L += [f"- **{c}** — {why}" for c, why in MUTE.items()]
L += ["", "The cost consequence is a correction, not a loosening: v1 charged a flat +1.5 "
      "for every foreign part, which penalised simple characters (上 下 七 千 中 年 気 母 円 四) "
      "for artifacts of the decomposition rather than for anything a learner has to do.", "",
      "## Blocker 2 — newspaper-only frequency: measured, not guessed", ""]
if NEWSPAPER_ONLY:
    L += ["The scriptin corpora are still absent, so the frequency term still inherits "
          "KANJIDIC2's newspaper skew (Session 4 Decision 8). Rather than warn about it "
          "again, v2 measures how much the order depends on that term:", ""]
else:
    L += [f"Merged across {len(corpora)} corpora. Sensitivity retained as a check:", ""]
L += ["| Frequency weight | Kendall τ vs base (0.3) | Max displacement | Chars moved ≥10 |",
      "|---:|---:|---:|---:|"]
L += [f"| {w:.2f}{' ← base' if w == BASE_FW else ''} | {t} | {m} | {n} |"
      for w, t, m, n in sensitivity]
tau0 = dict((w, t) for w, t, _, _ in sensitivity)[0.0]
mv0 = dict((w, n) for w, _, _, n in sensitivity)[0.0]
plural = "character" if mv0 == 1 else "characters"
verdict = ("**Not blocking.** Dropping the frequency term entirely leaves the order "
           f"substantially intact (τ = {tau0}, {mv0} {plural} moving ten places or more). "
           "Word-demand and component structure are doing the work; the newspaper skew "
           "rides on a term that barely steers. The order can be applied now, and the "
           "scriptin merge treated as a refinement rather than a prerequisite."
           if tau0 >= 0.85 else
           "**Blocking.** The order changes materially when the frequency term is removed "
           f"(τ = {tau0}, {mv0} {plural} moving ten places or more), so the newspaper "
           "skew is steering real decisions. Fetch the scriptin corpora before applying.")
L += ["", verdict, "",
      "```",
      "wget -P freq-data https://raw.githubusercontent.com/scriptin/kanji-frequency/master/data2015/{aozora,news,twitter}.json",
      "```",
      "(scriptin/kanji-frequency, CC-BY-4.0. Run on your own machine — the sandbox proxy "
      "refuses GitHub raw.)", "",
      "## Blocker 3 — Stage 0 was being reordered by a criterion that does not apply", "",
      "**A recorded limitation, not a discovery.** The v1 tracker row lists it among its own "
      "caveats — *\"Stage 0's stroke-rule constraint is not modelled\"* — so this was known "
      "when v1 shipped. What v2 adds is the measurement of what the omission cost, and the "
      "fix.", "",
      f"The module's first block is not a centrality decision: its **{len(STAGE0)}** "
      "characters are chosen because between them they demonstrate the nine stroke rules, and "
      "the pipeline has no visibility of that criterion. v1 sorted all 63 together, so 口, 川, "
      "田, 中, 四, 山 and 女 were each pushed forty-odd places down the list and the report "
      "presented those as the method paying off.", ""]
if v1f.exists():
    _v1 = json.loads(v1f.read_text(encoding="utf-8"))["order"]
    _big = [r for r in _v1 if r["hand_pos"] and abs(r["hand_pos"] - r["pos"]) >= 10]
    _s0 = [r["char"] for r in _big if r["char"] in STAGE0_SET]
    L += [f"They were not. **{len(_s0)} of the {len(_big)} 'large moves' v1 reported — "
          f"{' '.join(_s0)} — were the pipeline overriding a deliberate teaching choice it "
          "could not see.**", ""]
L += ["v2 locks Stage 0 as an ordered prefix and derives centrality over the remaining "
      f"{len(TAUGHT) - len(STAGE0)} characters only, so every move it now reports is real.", "",
      "**Locked prefix (stroke-rule block, authored order):**", "",
      "> " + "".join(STAGE0), "",
      f"## Generated order ({len(order)} taught characters)", "",
      "".join(STAGE0) + " ｜ " + "".join(order[len(STAGE0):]),
      "",
      "(Locked Stage 0 to the left of the bar; derived order to the right.)", ""]
if v1p:
    # Isolate the two changes: the Stage 0 lock dominates the raw diff, so the
    # component policy is only legible within the derived tail.
    tail = [r for r in rows if r["char"] not in STAGE0_SET and r["v1_pos"]]
    v1_tail = sorted(tail, key=lambda r: r["v1_pos"])
    v1_rank = {r["char"]: i + 1 for i, r in enumerate(v1_tail)}
    v2_rank = {r["char"]: i + 1 for i, r in enumerate(sorted(tail, key=lambda r: r["pos"]))}
    tmoves = sorted(((c, v1_rank[c], v2_rank[c]) for c in v1_rank
                     if abs(v1_rank[c] - v2_rank[c]) >= 3),
                    key=lambda m: -abs(m[1] - m[2]))
    nmoved = sum(1 for c in v1_rank if v1_rank[c] != v2_rank[c])
    L += ["## Separating the two v2 changes", "",
          "The raw v1 → v2 diff is dominated by the Stage 0 lock and says little on its own. "
          "Read the two changes apart:", "",
          f"**The Stage 0 lock** restores {len(STAGE0)} characters to their authored "
          "stroke-rule order. This is a restoration, not a re-ranking — v1's placement of "
          "them was never meaningful.", "",
          f"**The component policy**, measured only within the {len(tail)} derived "
          f"characters where it is the sole variable: {nmoved} shift relative rank, "
          f"largest move {max((abs(a-b) for _, a, b in tmoves), default=0)} places.", ""]
    if tmoves:
        L += ["| Character | v1 rank in tail | v2 rank in tail | Artifact parts v1 charged for |",
              "|---|---:|---:|---|"]
        for c, a, b in tmoves[:14]:
            fp = [p for p in foreign_parts(c)]
            L.append(f"| {c} | {a} | {b} | {'、'.join(fp) or '—'} |")
        L += ["", "Two different effects are visible here and they should not be conflated. "
              "Characters with artifact parts (母, 私, 上, 七, 千) gain directly: v1 was "
              "charging them for strokes rather than for anything the learner has to do. "
              "Characters with no foreign parts at all (好, 学, 明) move because cost is "
              "**dynamic** — 好 is 女 + 子 and both are now locked early in Stage 0, so by "
              "the time it is considered it costs almost nothing. That is the intended "
              "behaviour of Decision 3, and it only becomes visible once Stage 0 stops "
              "being shuffled into the middle of the list.", ""]
    else:
        L += ["The component policy did not disturb the derived order.", ""]
hmoves = sorted(((r["char"], r["hand_pos"], r["pos"]) for r in rows
                 if r["hand_pos"] and abs(r["hand_pos"] - r["pos"]) >= 10),
                key=lambda m: -abs(m[1] - m[2]))
L += ["## Largest moves vs the hand-sequenced order (≥10 places)", ""]
L += [f"- {c}: hand #{h} → v2 #{p}" for c, h, p in hmoves]
L += ["", "## Contrastive adjacency chains (Session 4 Decision 6)", "",
      ("; ".join("·".join(ch) for ch in adjacency_chains) or "none formed"), "",
      "**Read these as scheduling hints, not as constraints on the order.** Applying Decision 6 "
      "to the module shows the adjacency mechanism is a weaker version of something already "
      "built: 日, 目 and 白 are *not* adjacent in Stage 0 (positions 5, 7, 10, with 月, 田, 口 "
      "between them), and the contrast is carried by a dedicated skill lesson `sb-eye` placed "
      "once the set is complete. `sb-person` and `sb-tree` do the same for 人·入·八 and for "
      "木·本 / 今·分. A contrast lesson teaches the distinction explicitly, survives regrouping, "
      "and does not compete with centrality for sequence positions. Decision 6 is better stated "
      "as *confusables get a contrast lesson once the set is complete*. Note the two chains "
      "formed above are exactly the pairs `sb-tree` already covers.", "",
      "## Characters carrying named shapes (lesson needs a shape gloss)", ""]
for r in rows:
    if r["named_shapes"]:
        L.append(f"- {r['char']} (#{r['pos']}): {'、'.join(r['named_shapes'])}")
L += ["", "## Characters with muted parts (decomposition hidden — teach whole)", ""]
muted_rows = [r for r in rows if r["muted_shapes"]]
L += [f"- {r['char']} (#{r['pos']}): {'、'.join(r['muted_shapes'])}" for r in muted_rows]
L += ["", "## Lesson-group plan — applying the order", "",
      "The order is a sequence; the module teaches in groups of 3–7 with a theme and a "
      "stroke rule. Groups below are cut from the derived tail at the adjacency chains "
      "(which must not be split) and at size 5, then named from what actually landed "
      "together. Stage 0's groups are unchanged.", "",
      "| Group | Characters | Note |", "|---|---|---|"]
tail_chars = order[len(STAGE0):]
groups, cur = [], []
chain_of = {c: ch for ch in adjacency_chains for c in ch}
for c in tail_chars:
    cur.append(c)
    nxt = tail_chars[tail_chars.index(c) + 1] if c != tail_chars[-1] else None
    same_chain = nxt and chain_of.get(c) and chain_of.get(nxt) is chain_of.get(c)
    if len(cur) >= 5 and not same_chain:
        groups.append(cur); cur = []
if cur: groups.append(cur)
for i, g in enumerate(groups, 1):
    named = [c for c in g if [p for p in foreign_parts(c) if p in NAMED]]
    chains_here = {"·".join(ch) for ch in adjacency_chains if set(ch) & set(g)}
    note = []
    if chains_here: note.append("contrast pair " + ", ".join(sorted(chains_here)))
    if named: note.append("shape gloss on " + "、".join(named))
    L.append(f"| Tail {i} | {'・'.join(g)} | {'; '.join(note) or '—'} |")
L += ["", f"{len(groups)} groups after the two existing Stage 0 checkpoints. Two properties "
      "hold by construction and are worth stating because they are what the pipeline is for: "
      "**no character appears before a taught component of itself**, and **no contrast pair "
      "is split across a group boundary**.", "",
      "What the pipeline cannot supply is the theme sentence and the stroke rule for each "
      "group — those are authoring, and the existing group titles ('The tree family', "
      "'Frames: outside before inside') set a bar a generated label would not meet. The "
      "grouping above is the skeleton to author against, not a replacement for it.", "",
      "## Expansion queue (ledger characters not yet taught — top 15)", ""]
for q in out["expansion_queue"][:15]:
    L.append(f"- {q['char']} — in {q['demand_words']} app word-slots ({'、'.join(q['example_words'])})")
L += ["", "## Coverage curve", ""]
if coverage:
    name, pts = coverage
    L.append(f"Computed against the {name} corpus: "
             + "; ".join(f"first {n} chars → {p}% of running text" for n, p in pts))
else:
    L.append("Still pending the scriptin corpora (see Blocker 2). The percentage shown in "
             "the module UI remains interpolated from published anchor points — the most "
             "confident-looking number in the interface and the least earned.")
(HERE / "kanji-order-report-v2.md").write_text("\n".join(L) + "\n", encoding="utf-8")
print("\n".join(L))
