# Kanji module — rebuilt against Session 3

The first pass was written against a stale `n5-practice.jsx` and without the kana modules' internals. Five things were wrong. This rebuild corrects them.

## What Session 3 changed

**1. The seam already exists — I invented a parallel one.** Decision 3 established `KANJI_SYLLABUS` / `kanjiTaught()` / `needsFurigana()` as the single place that decides what a learner reads unaided. My `known-kanji-v1` key was a second mechanism for the same job. The module now **exports `KANJI_SYLLABUS`** — the ordered list of every kanji it teaches, in teaching order — and writes learner progress to `known-kanji-v1` for the runtime half.

⚠️ I couldn't read the current `n5-practice.jsx`, so the export's shape is inferred from the journal. If `kanjiTaught()` expects a Set, an object, or entries with metadata rather than a bare ordered array, the export needs adjusting to match. Worth checking before wiring.

**2. Furigana as general mechanism, not exception marker.** I proposed adaptive furigana last session as though it were new. Decision 4 had already made it the rule. Word examples in the module now render with real `<ruby>` throughout, consistent with the practice module.

**3. Repetitive writing — I under-read the evidence.** I'd cited Toyoda & Kubota to argue against writing drills, then built a naive trace-then-hide canvas. The kana modules already had the right answer: **Trace → Guided → Blank**, per-stroke scoring against KanjiVG reference paths, direction detection, and out-of-order detection that distinguishes "wrong stroke" from "right stroke, wrong turn". That engine is ported wholesale rather than reinvented.

**4. Hints reveal one step.** Decision 8. `Help me` now ghosts *only* the current stroke and clears itself the moment that stroke lands. Each tap buys exactly one nudge.

**5. No counts.** Decision 6. Gone: "25 kanji · 12 learned", the `n/total` on group headers. Groups show an unlabelled bar; lessons show ✓ or ○. The coverage percentage stays — it's a capability statement rather than a workload one — but it's the only number in the interface.

Also carried over: English kind codes (KJ / SB / CC / CP) on the same reasoning the kana modules use, the checkpoint colour at `#907119` rather than the 3.2:1 ochre, legend above the list, culture intro pulled out so it can't be scrolled past, and collapsible groups.

## What's real rather than invented

**Stroke data** — 63 characters, 327 strokes, pulled from KanjiVG (CC BY-SA 3.0, attributed in-file). Same 109-unit box as the kana modules, so paths, scoring, and tolerances all transfer unchanged.

**Component decompositions** — also KanjiVG, depth-1 only, including the `original` attribute that records variant forms. That's why 休 reads as "亻 (a squashed 人) + 木" rather than as two unrelated shapes. Last session I hand-wrote these and had 校 listing 交 as a part with no way for the learner to have met it.

Structural ≠ pedagogical, though: KanjiVG reports 白 as containing 日, which is true of the shape and false about the meaning. Where that misleads, the lesson note overrides it explicitly.

**Handwriting calibration shares `stroke-data-v1` with the kana modules.** A learner arriving from hiragana already has a calibrated floor, so tolerance is right from the first kanji stroke rather than after eight more samples. The Session 3 bug is carried forward too: calibration samples only when a reference is actually visible, and `hinted: true` attempts are excluded for the same reason a blank-box stroke was.

**Verified.** Builds clean. All 63 lesson characters have both stroke data and a dictionary entry; nothing in the dictionary goes untaught; and no component is introduced after a character that contains it.

## Still open

- **The order is still hand-sequenced.** It satisfies the component-precedence property by construction, but centrality scoring and the topological pass haven't been run. That pipeline is the real next build, and it needs the merged frequency list — not the Wikipedia one.
- **The coverage curve is interpolated** from published anchor points, not computed against this order. Most confident-looking number in the UI, least earned.
- **The sentence prompt gates coarsely.** It checks that grammar progress exists at all, not that the specific pattern is done — I don't have the current lesson ids. `K[ch].sentence` marks the candidates; the per-pattern gate is a one-line change once the ids are known.
- **No SRS.** When it arrives, keep passive sightings in grammar sentences out of the scheduler — recognising 食 inside 食べます with the sentence around it is an easier task than cold recall, and letting it extend intervals will overstate retention.
- **Everything Japanese here is AI-authored and unverified.** The `story` fields make etymological claims — 休 as person-against-tree is well attested, 好 is genuinely disputed and is flagged as such in the lesson, and 白 I've deliberately written as uncertain. These need the reviewer as much as the Session 3 "watch out" beats do.

## Not addressed

Phase 0 hasn't moved. Third session running, and this is a fourth artifact rather than an eval. Worth naming.
