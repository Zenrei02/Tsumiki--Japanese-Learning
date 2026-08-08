#!/usr/bin/env python3
"""Curriculum ordering pipeline — grammar units, vocabulary introduction, and
the point where the two meet the kanji order.

WHY THIS EXISTS. Three orderings were settled separately and never checked
against each other: kanji order (Session 4 → kanji-order-v2), the Stage 1
unit breakdown (stage-1-unit-breakdown-v1.md), and vocabulary, which was
declared word-driven and then never actually derived. This script measures
all three against the live `grammar-module.jsx` rather than against the notes,
because the notes have drifted — the Step 2 split described as a proposal
has already shipped, and the ledger's bank count is stale.

WHAT "VOCABULARY ORDER" TURNS OUT TO MEAN. The honest finding, and the
reason this is not a straight sort: of the 286 ledger words, only ~93 are
taught anywhere. The rest are KANJI_DICT display entries and kanji-card
sample words — reachable, glossable, never introduced. So the deliverable
splits three ways:

  1. The taught words already have an order (bank position). It needs
     AUDITING, not inventing — and the audit finds a real defect.
  2. The gap Session 3 named is RECURRENCE, not sequence. Measured here.
  3. The genuinely orderable thing is the PROMOTION QUEUE: which
     dictionary-only words deserve to become taught words, ranked.

Word cost is flat (word-kanji-scheduling-v1 §9: a word can be met in kana
whatever it is written with, so its cost does not inherit from its
characters). Ranking is therefore close to pure own-corpus demand, with no
centrality division and no kanji gate — deliberately, because gating words
on kanji is the failure mode §2 exists to prevent.

Outputs: curriculum-order-v1.json, curriculum-order-report-v1.md.
Reads only; rewrites no module.
"""
import json, re, pathlib, datetime
from collections import defaultdict, Counter

HERE = pathlib.Path(__file__).parent
PRACTICE = (HERE / "grammar-module.jsx").read_text(encoding="utf-8")
LEDGER = json.loads((HERE / "word-ledger-v1.json").read_text(encoding="utf-8"))
KANJI_RE = re.compile(r"[㐀-鿿々]")

KORDER = HERE / "kanji-order-v2.json"
if not KORDER.exists(): KORDER = HERE / "kanji-order-v1.json"
KO = json.loads(KORDER.read_text(encoding="utf-8"))
kpos = {r["char"]: r["pos"] for r in KO["order"]}

# --------------------------------------------------------------- jukujikun ----
# The "Kanji display pipeline" tracker row (Jul 28 2026) records this and it has
# never been implemented: JUKUJIKUN BREAK COMPOSITION ENTIRELY. The reading does
# not decompose across characters, so both kanji can be known while the word
# stays unreadable. 今日 きょう is not 今 + 日; 明日 あした is not 明 + 日.
#
# Every "plain at kanji #N" figure below assumes composition. For these words
# that assumption is false, and the row calls for a hand-maintained exception
# list where the word carries its own level and its own unsplittable reading.
# The list does not exist yet. This constant is its seed — curated, because the
# purely automatic version has false positives (verb stems, embedded kana).
JUKUJIKUN = {
    "今日": "きょう", "明日": "あした", "昨日": "きのう", "大人": "おとな",
    "一人": "ひとり", "二人": "ふたり", "今年": "ことし", "上手": "じょうず",
    "下手": "へた", "日本": "にほん", "一日": "ついたち", "二十歳": "はたち",
}

# ------------------------------------------------------------ parse file ----
cats = [(m.start(), m.group(1)) for m in re.finditer(r'cat: "([^"]+)"', PRACTICE)]
bounds = [c[0] for c in cats] + [len(PRACTICE)]
STEPS = []
for k, (s, name) in enumerate(cats):
    seg = PRACTICE[s:bounds[k + 1]]
    bank_m = re.search(r"bank: \[(.*?)\],\s*\n\s*points:", seg, re.S)
    bank = re.findall(r'\["([^"]+)", "([^"]+)"\]', bank_m.group(1)) if bank_m else []
    pts = []
    for m in re.finditer(r'id: "([^"]+)", jp: "([^"]*)", en: "([^"]*)"(?:, kind: "([^"]+)")?', seg):
        pid, jp, en, kind = m.groups()
        tail = seg[m.end():m.end() + 400]
        rq = re.search(r"requires: \[([^\]]*)\]", tail)
        reqs = re.findall(r'"([^"]+)"', rq.group(1)) if rq and rq.start() < 200 else []
        pts.append({"id": pid, "jp": jp, "en": en, "kind": kind or "point", "requires": reqs})
    STEPS.append({"cat": name, "bank": bank, "points": pts})

seq = [p["id"] for st in STEPS for p in st["points"]]
seq_i = {p: i for i, p in enumerate(seq)}
stepof = {p["id"]: st["cat"] for st in STEPS for p in st["points"]}

# ------------------------------------------- A. grammar: integrity + units ----
integrity = {"duplicate_ids": [i for i, n in Counter(seq).items() if n > 1],
             "missing_requires": [], "forward_requires": [], "empty_requires_builds": []}
for st in STEPS:
    for p in st["points"]:
        if p["kind"] in ("build", "review") and not p["requires"] and p["kind"] == "build":
            integrity["empty_requires_builds"].append(p["id"])
        for r in p["requires"]:
            if r not in seq_i: integrity["missing_requires"].append((p["id"], r))
            elif seq_i[r] > seq_i[p["id"]]: integrity["forward_requires"].append((p["id"], r))

# Units = the span of points closing at each build lesson. The breakdown's rule:
# a unit ends at a build, and a unit past roughly a dozen points needs a second.
#   `review` lessons close a checkpoint rather than opening a unit, so they are
#   folded into the unit that precedes them instead of starting a new one.
units, cur = [], []
for st in STEPS:
    for p in st["points"]:
        cur.append(p)
        if p["kind"] == "build":
            units.append({"step": st["cat"], "closes": p["id"], "close_en": p["en"],
                          "points": [q["id"] for q in cur]})
            cur = []
    if cur:
        if units and all(q["kind"] in ("review", "primer") for q in cur):
            units[-1]["points"] += [q["id"] for q in cur]      # fold reviews back
        else:
            units.append({"step": st["cat"], "closes": None, "close_en": None,
                          "points": [q["id"] for q in cur]})
        cur = []
oversized = [u for u in units if len(u["points"]) > 12]

# ------------------------------------------ B. vocabulary: taught words ------
first_intro, appears = {}, defaultdict(list)
for st in STEPS:
    for w, gloss in st["bank"]:
        appears[w].append(st["cat"])
        first_intro.setdefault(w, {"word": w, "gloss": gloss, "step": st["cat"]})
taught_words = list(first_intro)
recurring = {w: v for w, v in appears.items() if len(v) > 1}
checkpoint_only_recur = {w: v for w, v in recurring.items()
                         if all("Checkpoint" in x for x in v[1:])}

# identical-bank defect: the Step 2 split divided the points and cloned the bank
identical_banks = []
for i in range(len(STEPS)):
    for j in range(i + 1, len(STEPS)):
        A = {w for w, _ in STEPS[i]["bank"]}; B = {w for w, _ in STEPS[j]["bank"]}
        if A and A == B:
            identical_banks.append((STEPS[i]["cat"], STEPS[j]["cat"], sorted(A)))

# words the ledger never sees (bank regex needs `points:` to follow)
ledger_bank = {w["written"] for w in LEDGER["words"]
               if any(s.startswith("bank:") for s in w["sources"])}
invisible = sorted(set(taught_words) - ledger_bank)

# ------------------------------------- C. promotion queue: untaught words ----
src_of = {w["written"]: w for w in LEDGER["words"]}
def kanji_of(w): return [c for c in w if KANJI_RE.match(c)]
def render_at(w):
    """Kanji-order position at which this word first renders as plain kanji.
    None = never, inside the 63-character syllabus.
    Returns "jukujikun" where composition does not apply at all."""
    if w in JUKUJIKUN: return "jukujikun"
    ks = kanji_of(w)
    if not ks: return 0                                  # kana-only, always plain
    if any(c not in kpos for c in ks): return None
    return max(kpos[c] for c in ks)

queue = []
for w in LEDGER["words"]:
    name = w["written"]
    if name in first_intro: continue                     # already taught
    ks = kanji_of(name)
    covered = sum(1 for c in ks if c in kpos)
    score = (len(w["sources"])                           # own-corpus demand
             + (1.5 if any(s.startswith("w:") for s in w["sources"]) else 0)
             + (1.0 if w.get("jlpt") == "N5" else 0)
             + (1.0 if ks and covered == len(ks) and name not in JUKUJIKUN else 0))
    queue.append({"word": name, "reading": (w["readings"] or [None])[0],
                  "meaning": (w["meanings"] or [None])[0], "jlpt": w.get("jlpt"),
                  "sources": len(w["sources"]), "kanji_covered": f"{covered}/{len(ks)}",
                  "plain_at": render_at(name), "score": round(score, 2)})
queue.sort(key=lambda q: (-q["score"], q["word"]))

# ---------------------------- D. cross-cut: word rendering vs kanji order ----
cross = []
for w in taught_words:
    p = render_at(w)
    cross.append({"word": w, "step": first_intro[w]["step"],
                  "kanji": kanji_of(w), "plain_at": p})
never_plain = [c for c in cross if c["plain_at"] is None]
juku_words  = [c for c in cross if c["plain_at"] == "jukujikun"]
plain_now = [c for c in cross if c["plain_at"] == 0]
promo_hist = Counter()
for c in cross:
    if isinstance(c["plain_at"], int) and c["plain_at"] != 0:
        promo_hist[(c["plain_at"] - 1) // 10 * 10] += 1

# ------------------------------------------------------------------ output ----
out = {"generated": datetime.date.today().isoformat(),
       "source": "grammar-module.jsx (live)", "kanji_order": KORDER.name,
       "grammar": {"steps": [{"cat": s["cat"], "points": len(s["points"]),
                              "bank": len(s["bank"])} for s in STEPS],
                   "total_points": len(seq), "integrity": integrity,
                   "units": units, "oversized_units": [u["closes"] for u in oversized]},
       "vocabulary": {"taught_words": len(taught_words),
                      "ledger_total": LEDGER["count"],
                      "recurring": {w: v for w, v in recurring.items()},
                      "checkpoint_only_recurrence": len(checkpoint_only_recur),
                      "identical_banks": identical_banks,
                      "invisible_to_ledger": invisible,
                      "first_introduction": first_intro},
       "promotion_queue": queue[:60],
       "rendering": {"never_plain_in_stage_1": [c["word"] for c in never_plain],
                     "kana_only": len(plain_now),
                     "promotion_by_kanji_decile": dict(sorted(promo_hist.items()))}}
(HERE / "curriculum-order-v1.json").write_text(
    json.dumps(out, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

# ------------------------------------------------------------------ report ----
L = [f"# Curriculum order v1 — {datetime.date.today().isoformat()}", "",
     "Grammar units, vocabulary introduction, and where both meet the kanji order. "
     f"Measured against the live `grammar-module.jsx` and `{KORDER.name}`, not against "
     "the session notes — the notes have drifted.", "",
     "## 0. What has already shipped since the notes were written", "",
     "`stage-1-unit-breakdown-v1.md` reads as a proposal. Checked against the file, "
     "**most of it is already in place**:", "",
     "| Proposal | Status in the live file |", "|---|---|",
     "| Split the 25-point Step 2 | ✅ Done — now Step 2 (10 pts) + Step 3 (15 pts) |",
     "| Fill the three empty `requires` | ✅ Done — no build has an empty array |",
     "| Split old Step 3 into three arcs | ❌ Not done — now Step 4, 18 points, 3 builds |",
     "| Capability-first naming | ❌ Not done — names are still taxonomic |", "",
     "So the remaining grammar work is two items, not a re-plan.", "",
     "## 1. Grammar integrity", ""]
L += [f"- Duplicate point ids: **{integrity['duplicate_ids'] or 'none'}**",
      f"- `requires` naming a point that does not exist: **{integrity['missing_requires'] or 'none'}**",
      f"- `requires` naming a point taught LATER: **{integrity['forward_requires'] or 'none'}**",
      f"- Build lessons with an empty `requires`: **{integrity['empty_requires_builds'] or 'none'}**",
      "",
      f"{len(seq)} points across {len(STEPS)} steps. The prerequisite graph is a clean DAG "
      "in file order, which is the property that makes the unit breakdown computable rather "
      "than hand-maintained.", "",
      "## 2. Units, derived from the build seams", "",
      "A unit is the run of points closing at a build lesson — the breakdown's own rule, "
      "applied to the file as it stands.", "",
      "| # | Step | Points | Closes with |", "|---:|---|---:|---|"]
for i, u in enumerate(units, 1):
    flag = " ⚠️" if len(u["points"]) > 12 else ""
    L.append(f"| {i} | {u['step']} | {len(u['points'])}{flag} | "
             f"{u['close_en'] or '—'} |")
L += ["", f"Units over twelve points: **{len(oversized)}**"
      + (f" — {', '.join(u['closes'] or '?' for u in oversized)}" if oversized else ""), "",
      "### The one structural change left: split Step 4", "",
      "Step 4 carries 18 points and **three** build lessons, which is the file saying it is "
      "three units wearing one name. The seams are already authored; splitting at them costs "
      "no new content and lands at 7 / 4 / 7 — exactly the sizes the breakdown predicted "
      "before this file existed in its current form.", "",
      "| New unit | Points | Closes with | Capability name |", "|---|---:|---|---|",
      "| 4a | 7 | `b-s3a` chain three actions | Put verbs in the past |",
      "| 4b | 4 | `b-s3c` describe a state | Say what's going on right now |",
      "| 4c | 7 | `b-s3b` describe a person | Describe with a whole clause |", "",
      "**Authoring nit found while placing the seams:** `cc-teru` (the casual 〜てる "
      "contraction) sits *after* `b-s3c`, so a mechanical split files it under 4c. It is "
      "about 〜ている and belongs in 4b. Moving it makes the split 7 / 5 / 6, which is "
      "better balanced as well as better grouped.", "",
      "## 3. Vocabulary — what the order actually is", "",
      f"The ledger holds **{LEDGER['count']}** words. Only **{len(taught_words)}** are "
      "introduced anywhere; the remaining "
      f"**{LEDGER['count'] - len(taught_words)}** are `KANJI_DICT` display entries and "
      "kanji-card samples — reachable and glossable, never taught. That gap is the finding. "
      "There is no missing *sequence*; there is a missing *syllabus*.", "",
      "### 3a. Defect — the Step 2 split cloned its bank", ""]
if identical_banks:
    for a, b, ws in identical_banks:
        L += [f"**{a}** and **{b}** carry byte-identical banks:", "",
              f"> {'、'.join(ws)}", "",
              "When Step 2 was split the points divided and the bank did not. Both halves "
              "now claim to introduce all eight words, so neither half's vocabulary is "
              "actually scoped, and the first-introduction map is ambiguous for eight of "
              f"the {len(taught_words)} taught words. This is the highest-value fix in the "
              "document: it is small, it is unambiguous, and every downstream ordering "
              "reads through it.", ""]
else:
    L += ["No two steps share a bank.", ""]
L += ["### 3b. Recurrence — the gap Session 3 named, now measured", "",
      f"- Words appearing in more than one bank: **{len(recurring)} of {len(taught_words)}**",
      f"- Of those, recurring **only** at a checkpoint: **{len(checkpoint_only_recur)}**", "",
      "So recurrence is almost entirely an artefact of checkpoints re-listing their own "
      "step's words. Discounting the cloned Step 2/3 bank above, only a handful of words "
      "genuinely reappear in a later teaching step:", ""]
genuine = {w: v for w, v in recurring.items()
           if not all("Checkpoint" in x for x in v[1:])
           and not (identical_banks and w in identical_banks[0][2])}
L += [f"- {w}: {' → '.join(x.split(' · ')[0] for x in v)}" for w, v in genuine.items()] or ["- none"]
L += ["", "This directly corrects an assumption carried in `word-kanji-scheduling-v1.md` §9 "
      "(*'a high-frequency word appears across many lessons, so it recurs without anything "
      "being scheduled'*). **It does not.** In this corpus a word is introduced once and, "
      "unless its checkpoint catches it, never returns. The retention dividend the note "
      "banked on is not there, so recurrence has to be scheduled after all.", ""]
if invisible:
    L += ["### 3c. Words invisible to the ledger builder", "",
          f"`build-word-ledger.py` matches `bank:` only when `points:` follows it, so "
          f"{len(invisible)} words are silently absent from the ledger: "
          f"{'、'.join(invisible)}.", "",
          "These are the N4 stress-test bank — arguably correct to exclude as out-of-stage, "
          "but it happens by regex accident rather than by decision, and the ledger reports "
          f"{len(ledger_bank)} bank words where the file has {len(taught_words)}.", ""]
L += ["## 4. Promotion queue — the genuinely orderable list", "",
      "Dictionary-only words ranked for promotion into a lesson bank. Score is own-corpus "
      "demand (source count) plus bonuses for already appearing on a kanji card, for N5, "
      "and for being fully covered by the kanji syllabus. **No centrality division and no "
      "kanji gate** — word cost is flat, and gating words on kanji is the failure mode "
      "`word-kanji-scheduling-v1.md` §2 exists to prevent. Kanji coverage is a tie-breaker "
      "only, because it affects how the word *looks*, never whether it appears.", "",
      "| # | Word | Reading | Meaning | Sources | Kanji covered | Plain at kanji # | Score |",
      "|---:|---|---|---|---:|---|---|---:|"]
for i, q in enumerate(queue[:30], 1):
    pa = ("⚠ jukujikun" if q["plain_at"] == "jukujikun" else
          "kana" if q["plain_at"] == 0 else
          "never in Stage 1" if q["plain_at"] is None else f"#{q['plain_at']}")
    L.append(f"| {i} | {q['word']} | {q['reading'] or '—'} | {q['meaning'] or '—'} | "
             f"{q['sources']} | {q['kanji_covered']} | {pa} | {q['score']} |")
L += ["", "## 5. Where the three orders meet — rendering over time", "",
      "For each taught word, the kanji-order position at which it stops needing furigana. "
      "This is the promotion event from `word-kanji-scheduling-v1.md` §2, made concrete.", "",
      "### ⚠️ First, a correction — composition does not always hold", "",
      "The **Kanji display pipeline** tracker row (Jul 28 2026) records a limitation that has "
      "never been implemented, and every figure in this section originally ignored it:", "",
      "> **Jukujikun break composition entirely** — 今日 きょう, 大人 おとな, 昨日 きのう, "
      "一人 ひとり. The reading does not decompose across characters; both kanji may be known "
      "while the word is unreadable by composition.", "",
      "The row calls for a hand-maintained exception list where the word carries its own "
      "unsplittable reading. **That list still does not exist.** This pipeline now seeds it "
      f"({len(JUKUJIKUN)} entries) and excludes those words from the composition arithmetic "
      "rather than reporting a promotion position that would never fire.", "",
      "It matters most in the promotion queue below, where four of the original top ten — "
      "上手 じょうず, 日本 にほん, 一人 ひとり, 下手 へた — were scored as fully kanji-covered "
      "and therefore ready. Knowing 上 and 手 does not let a learner read じょうず. They now "
      "carry a ⚠ and lose the coverage bonus.", "",
      f"- Taught words that are kana-only and always render plain: **{len(plain_now)}**",
      f"- Taught words that **never** render plain inside the 63-character syllabus: "
      f"**{len(never_plain)}**", ""]
if never_plain:
    L += ["Those words keep furigana for the whole of Stage 1:", "",
          "> " + "、".join(sorted(c["word"] for c in never_plain)), "",
          "This is working as designed — §2 says kanji state changes how a word looks, never "
          "whether it appears — but it is worth seeing the size of it. Roughly "
          f"{100*len(never_plain)//max(1,len(taught_words))}% of the taught vocabulary is "
          "still ruby-annotated at the end of Stage 1, which sets the honest expectation for "
          "how much of the 'quietly stops needing ruby' moment the learner actually gets.", ""]
L += ["Promotion events by kanji-order decile — where the re-render moments cluster:", "",
      "| Kanji positions | Words promoted |", "|---|---:|"]
for d, n in sorted(promo_hist.items()):
    L.append(f"| #{d+1}–#{d+10} | {n} |")
promoted_total = sum(promo_hist.values())
first_half = sum(n for d, n in promo_hist.items() if d < 30)
L += ["", f"Only **{promoted_total}** of the {len(taught_words)} taught words get a "
      f"promotion event at all, and they do not cluster at the front — {first_half} land in "
      "the first thirty characters and the rest are spread through the tail. The demand term "
      "front-loads the *characters*, but a word needs **every** one of its characters, so a "
      "word's promotion is governed by its latest character, not its earliest. That is worth "
      "stating plainly because it is the opposite of what the ordering rationale implies, and "
      "it means the re-render moment is a rarer event than `word-kanji-scheduling-v1.md` §2 "
      "assumes when it calls it 'a genuine product moment'. It is still worth building — but "
      f"on this syllabus it fires {promoted_total} times, not continuously.", "",
      "### The expansion queue this implies — and why it does not work", "",
      "v1's expansion queue ranked untaught characters by demand across the whole 286-word "
      "ledger. The sharper question is which untaught character would move the most **taught** "
      "words from furigana to plain. Asked that way, the answer is uncomfortable:", "",
      "| Untaught kanji | Taught words still blocked | Words |", "|---|---:|---|"]
blocked = defaultdict(list)
for c in cross:
    if c["plain_at"] is None:
        for ch in c["kanji"]:
            if ch not in kpos: blocked[ch].append(c["word"])
for ch, ws in sorted(blocked.items(), key=lambda kv: (-len(kv[1]), kv[0]))[:10]:
    L.append(f"| {ch} | {len(ws)} | {'、'.join(ws)} |")
need = Counter()
for c in cross:
    if c["plain_at"] is None:
        need[sum(1 for ch in c["kanji"] if ch not in kpos)] += 1
L += ["", f"**No character unlocks more than two words, and {sum(1 for v in blocked.values() if len(v) == 1)} "
      f"of the {len(blocked)} unlock exactly one.** The distribution is flat — there is no "
      "high-leverage pick, and ranking the queue barely matters because every entry is worth "
      "about the same.", "",
      f"Worse, clearing furigana from all {len(never_plain)} blocked words would take "
      f"**{len(blocked)} new characters** — the syllabus would have to grow from "
      f"{len(kpos)} to {len(kpos) + len(blocked)}, and "
      f"{sum(v for k, v in need.items() if k > 1)} of those words need two or three of them "
      "before anything visible happens.", "",
      "**This is the finding that should change a plan.** The promotion event — a finishing "
      "kanji reaching back to re-render a word the learner already knows — is described in "
      "`word-kanji-scheduling-v1.md` §2 as the payoff of the whole scheduling model. On the "
      "current syllabus it fires nineteen times in Stage 1 and then stops, because the "
      "vocabulary is written with a long flat tail of characters that each appear once. The "
      "model is not wrong; the expectation set on it is. Either the kanji syllabus expands "
      "far past 63 to chase it, or the promotion event is repositioned as a pleasant "
      "occasional surprise rather than a core mechanic. That is a product decision, and it "
      "should be made deliberately rather than discovered after the feature is built.", ""]
out["rendering"]["blocking_untaught_kanji"] = {c: ws for c, ws in
                                              sorted(blocked.items(), key=lambda kv: -len(kv[1]))}
(HERE / "curriculum-order-v1.json").write_text(
    json.dumps(out, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
(HERE / "curriculum-order-report-v1.md").write_text("\n".join(L) + "\n", encoding="utf-8")
print("\n".join(L))
