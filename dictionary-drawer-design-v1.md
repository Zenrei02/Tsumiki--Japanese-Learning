# The dictionary drawer — design v1

*Session 34, Sep 17 2026 (design); BUILT Sep 19 2026 as a module, not only a
drawer — see "What was built" directly below, which supersedes anything later
in this document that disagrees with it. The sections after it are the original
design, kept because they record why. Sizes marked **MODELLED** there have
been replaced by measured numbers in "What was built".*

---

## What was built (Sep 19)

Lloyd's call, Session 34: the dictionary is a **module** — a seventh section in
the menu — and **every word lookup in the app goes through it**. Words can be
**sent to Vocabulary**, and practising them is an **alternative way to keep the
week**. Example sentences are **later-phase** (section at the end).

### Data — `build-dict-data.py`

- **Source — two, deliberately.** edrdg.org is off the allowlist from the
  sandbox and zenpop alike, but zenpop can reach GitHub, where
  scriptin/jmdict-simplified republishes JMdict and KANJIDIC2 as JSON weekly.
  That is the content: **JMdict and KANJIDIC2 dated 2026-09-14**, refreshed
  with `python3 build-dict-data.py --fetch --overwrite`. It flattens JMdict's
  priority tags to one common/not-common flag, and the ranking needs the tags,
  so they come from `jamdict-data` 1.5 (2021) **as a lookup table by entry id
  and nothing else**. 98.5% of today's common entries have 2021 tags; the rest
  (new since, or renumbered — 規則, 混む) rank from the common flag. The first
  build of the day read everything from the 2021 database; replaced same day.
- **SKIP is never read.** Neither `queryCodes` in the JSON nor `query_code` in
  the 2021 database — which hold the noncommercial SKIP codes — is touched.
  Grade and the old JLPT level are dropped from the kanji shards too.
- **Tiers.** FULL = all 191,541 entries: **74 MB raw / 28 MB gzipped** —
  measured. Wrong to commit on every rebuild. **CORE = 32,575 entries** from the
  2026 data: every entry with a priority tag or a current common flag, plus
  every single-kanji word — **19.8 MB raw / 8.3 MB gzipped, 1,409 files,
  largest shard 17 KB gzipped** — measured, under `tsumiki-app/public/dict/`.
  KANJIDIC2 (English build) has 10,384 characters; 60 rare ones used by core
  words have no card, all obscure (mostly fish and plant names). A word outside CORE shows as "not
  in this dictionary", never an error.
- **Rank — "the most common interpretation".** The first ranking used JMdict's
  newspaper-frequency bands and got it visibly wrong: 喫する above 食べる, and
  行く — no band at all — behind hundreds of news words. The shipped ranking
  tiers on WHICH list a word is on (ichi1/spec1, the everyday list, first),
  uses the nf band only as a tiebreak, borrows a band from the word's rarest
  kanji's KANJIDIC2 frequency when JMdict gives none, and puts common particles
  at 0 (without that, は looks up as "leaf"). The top result is marked MOST
  COMMON; in an entry, JMdict's first sense is highlighted as MOST COMMON
  MEANING — that ordering is the data's claim, not a guess.
- **English search** orders by how well a gloss matches (a gloss that IS the
  word beats one qualified by a parenthetical: 行く "to go" over 囲碁 "go (board
  game)"), then sense, then rank. **Known limit:** English→Japanese is
  many-to-one and still imperfect — "friend" puts 友人 before 友達, "study" puts
  研究 before 勉強. A learner-frequency list would fix it; none is licensed.

### The module and the drawer

- `dictionary-module.jsx` (artifact, source of truth) → `Dictionary.jsx`. One
  component, two shapes: a page, and a drawer from the right. Search in kanji,
  kana (katakana folded to hiragana) or English. A small **deinflector** makes
  lifted-out forms work — 食べた, 行きます, 高くない — proposing dictionary
  forms and keeping only EXACT matches, so a wrong proposal costs a lookup,
  never a wrong answer. Kanji cards show on/kun, meanings, strokes and the words
  containing the character. **No JLPT levels and no counts are shown.**
- **The EDRDG credit is on every screen** the module draws, page or drawer.
- **The protocol.** A module fires `tsumiki:lookup` with `{ q, kanji?, curated? }`
  through `lookUp()` (byte-identical in grammar, kanji, checker). The shell's
  `LookupHost` listens and sets `window.__tsumikiLookup`; standalone artifacts
  have no listener, so `lookUp()` returns false and the caller keeps its old
  behaviour. A **辞** button in the header opens the drawer from every screen.
- **Grammar**: every tapped word now opens the drawer. The curated entry — gloss
  and micro anecdote — is shown ABOVE the dictionary entry as FROM YOUR LESSONS,
  and the exact entry opens automatically.
- **Kanji**: the character panel offers "Words with 験" — the character being
  studied, preloaded.
- **Checker**: each kanji run the model gave a reading for is tappable in the
  learner's text (outside the issue buttons — a tap target inside a button is
  two actions on one press) and in the natural rewrite. Runs, not words: 食
  finds 食べる through the prefix search. The prompt is untouched.

### Send to Vocabulary, and the week

- The dictionary owns `tsumiki-my-words-v1` (one writer). It is in
  storage.js KEYS, so it backs up and syncs.
- Vocabulary reads it and shows **Your words** first on Today. A sent word that
  is already in the bank uses the curated object (scene, notes, step); otherwise
  its kanji split into taught (unlock writing as learned) and untaught, read off
  WORDS so it cannot disagree with the bank.
- **The goal** (Lloyd's answers, Session 34): what counts is **practising** a
  sent word — a finished vocabulary visit after the send — never the sending,
  so one tap cannot be farmed; and it is an **alternative way to keep the
  week**, not a second prize: five such practices keep the week whatever the
  day count, and pay no koban of their own. The koban economy is untouched.
  Counted by the Goals panel from the two owning stores, never recorded twice.

### Verified

`npm run smoke` gained a DICTIONARY section serving the real shards: header
button → kana, English and inflected search → MOST COMMON marking → entry
highlight → send → Your words in Vocabulary → the Goals line (with a visit from
before the send correctly NOT counted) → a lesson's curated lookup → a kanji
request → the credit line. The Grammar section now taps a real word in a drill
sentence and asserts the drawer opens, then plays the drill out and asserts the
finish reads the round's own total — it reads **4 of 5**, the exact case Lloyd
reported. Drift check and storage-key check clean.

---

## What this is

A panel that slides out from the right edge and looks words up. It is reachable
from anywhere, it does not navigate away from what the learner is doing, and it
can be handed a word or a kanji by the screen that opened it.

Three moments justify it, in descending order of strength:

| Where | The moment | Today |
|---|---|---|
| **Checker** | The tool returns a rewrite containing a word the learner has never seen. The next question is always "what is that?" | No lookup of any kind. The learner leaves the app. |
| **Kanji** | Working on 験. What words is it actually *in*? | Three curated words per lesson, authored. Nothing beyond. |
| **Grammar / Vocabulary** | Tapping an unfamiliar word in an example sentence | A modal popup over curated data only (`JPText` → `setPopup`) |

The checker case is the one that decides this feature. It is the only screen in
the app that regularly puts **unpredictable** Japanese in front of the learner —
everything else shows authored content whose vocabulary was chosen. A curated
dictionary can never cover the checker's output, because the checker's output is
generated. That is the gap, and it is not closable by authoring more words.

---

## The rule this must not break

**One lookup, not two.** Grammar and Vocabulary already have a word popup, keyed
to the curated ledger through `annotate()`'s longest-match pass. If the drawer
arrives *beside* that popup, the app has two lookups that can disagree about the
same word — the exact failure class the drift checker exists to prevent between
modules.

So the drawer **absorbs** the popup. `onTapWord` stops opening a modal and starts
opening the drawer, pre-filled. The curated entry still wins where one exists —
it carries the level tag, the scene, the reviewer's fingerprints — and the
dictionary fills in underneath it as *additional* senses, clearly separated:

```
験  ケン
  ── from your lessons ──────────────────
  経験  けいけん   experience          [S9]
  試験  しけん     an exam             [S9]
  実験  じっけん   an experiment       [S10]
  ── from the dictionary ───────────────
  受験  じゅけん   taking an exam
  体験  たいけん   first-hand experience
  ...
```

The separator is not decoration. Everything above it has been through the
authoring pipeline and is reviewer-verifiable; everything below it is a
third-party dataset the reviewer has never seen. The app has been careful about
that distinction everywhere else (`AI-authored and pending native-speaker
review` is in the curriculum header) and should stay careful here.

---

## The data

**JMdict** — words. **214,000+ entries representing 314,000 unique
headword-reading combinations** as of March 2023, and it is updated almost
daily, so treat that as a floor. English-gloss build is `JMdict_e`.

**KANJIDIC2** — kanji. **13,108 characters**, carrying readings (on, kun, and
also Chinese/Korean/Vietnamese), meanings, stroke counts, radical, frequency
rank, grade, and the legacy JLPT tag.

Both are XML, both from EDRDG (Jim Breen et al.).

### Two things about the licence that are not obvious

**1. ShareAlike binds the data, not the app.** Both files are CC BY-SA 4.0.
A trimmed, re-indexed, sharded or level-tagged JMdict is a *derivative database*
and must be offered under BY-SA. That obligation reaches the generated dictionary
artefacts and nothing else: the module code, the curated word ledger, the scenes,
the kanji stories and the checker prompt are not adaptations of JMdict and stay
entirely ours. Commercial use is explicitly permitted, so the Phase 3 paid tier
is not affected.

**2. SKIP codes are a different, non-commercial licence.** Inside KANJIDIC2, the
SKIP search codes are **CC BY-NC-SA 4.0** — *noncommercial*. Every other field is
BY-SA. If the paid tier ever ships, a KANJIDIC2 derivative that still carries
SKIP codes is a licence violation. **The build script must strip SKIP, from day
one**, so it never enters the pipeline and never has to be found and removed
later. We do not use SKIP for anything; there is no cost to dropping it.

### Attribution is on-screen, not in an About page

The EDRDG licence is specific: a service displaying the data must carry the
acknowledgement **on each screen that shows it**. So the drawer itself needs a
persistent credit line at its foot, linking to the project pages. Not the
settings screen, not a colophon. This is a design constraint on the drawer, and
it is small: one line of 0.6875rem `T.sub` text.

---

## Where the data lives — three shapes

### A · Postgres in Supabase, queried over RPC

Tables `dict_word` and `dict_kanji`, btree indexes on headword and reading,
lookups through a `SECURITY DEFINER` function.

**For:** real search. Prefix matching, search-as-you-type, "every word containing
this kanji" as a query rather than a pre-computed answer. Zero bundle cost. Same
backend the checker already calls. Every lookup is a real query, which — per the
Session 22 finding that the activity timer resets on queries and not on dashboard
visits — would keep the project from pausing during frontend-only work.

**Against:** it spends the 500 MB free-tier database on reference data, when that
tier exists to hold learner progress. Needs the network for every lookup. Cold
starts. And it puts a third-party dataset inside the backup/restore surface that
Session 33 just finished stabilising.

### B · Static shards on the CDN  ← recommended for v1

A build script shards JMdict by headword prefix and writes JSON into
`tsumiki-app/public/dict/`. One lookup fetches one shard. Alongside it, a second
set of shards keyed by kanji — `dict/kanji/験.json` — holding the words that
contain that character, pre-computed at build time.

**For:** costs the database nothing. Cached by the CDN and then by the browser,
so a repeat lookup is free and works offline. No cold start. No new runtime. The
per-kanji shard *is* the kanji-module feature, already computed. Fits the
existing `build-*.py` convention exactly.

**Against:** no fuzzy or substring search — exact and prefix only. Shards are
build artefacts that either bloat the repo or need generating during the Netlify
build. Updating the dictionary means a rebuild.

### C · Full download into IndexedDB

Rejected. Tens of MB on a phone, on a Hiroshima commute, to answer one question.
The app's whole architectural achievement is a 49 KB first load; this is the one
option that throws it away.

**Recommendation: B now, A later and only if search-as-you-type is wanted.** B
delivers both headline use cases — checker lookup and the kanji preload — without
touching the database. A is an upgrade path, not a prerequisite, and deferring it
keeps the free tier for learner data.

---

## Costs

Row counts are sourced. Byte figures are **MODELLED** — see "Measuring it".

### Option A, if it were built

| | Modelled |
|---|---|
| `dict_word` rows | ~314,000 (headword × reading combinations) |
| `dict_sense` rows | ~535,000 (≈2.5 senses/entry × 214k) |
| `dict_kanji` rows | 13,108 |
| Heap, words + senses | **~80–100 MB** at ~90–110 B/row incl. overhead |
| Btree indexes (headword, reading) | **~25–30 MB** |
| Trigram/GIN index for substring search | **~50–150 MB** — the expensive one. Not in v1. |
| **Total without trigram** | **~120–150 MB** of the free tier's 500 MB |

Free plan: **500 MB database, 5 GB egress, 50,000 MAU, paused after 1 week of
inactivity, 2 active projects.** Pro is **$25/mo** for 8 GB disk and 250 GB
egress.

So A fits the free tier — with roughly a third of it gone, and the trigram index
off the table until Pro. That is the real cost of A: not money, but **headroom**.

### Option B, as recommended

| | Modelled |
|---|---|
| Prefix shards | ~2,000 files, ~20–40 KB each raw, ~8–15 KB gzipped |
| Per-kanji shards | 13,108 files, mostly 1–5 KB |
| Total deployed | **~40–70 MB** of static assets |
| Supabase cost | **zero** |
| Per lookup, over the wire | **~10 KB**, once, then cached |

Netlify free is now **300 credits/month**, with bandwidth at **20 credits per
GB** — about **15 GB/month** if credits went to nothing else. At ~10 KB per
uncached lookup that is on the order of **1.5 million lookups/month**, against a
current user base of one. Bandwidth is not the constraint and will not be at
beta scale.

**The constraint for B is the repo, not the bill.** 40–70 MB of generated JSON
should not be committed. Generate during the Netlify build, or publish the shards
to Supabase Storage and point the drawer at that. Open question below.

### API cost

**None.** The drawer makes no model calls. This is the only significant feature
added since the checker that does not touch the API, which is worth noting
against the standing concern about output-token spend.

### Measuring it

Every byte figure above is arithmetic, not observation, because edrdg.org is
outside the egress allowlist from both the sandbox and the linked machine. To
replace them, download `JMdict_e.gz` and `kanjidic2.xml.gz` by hand and:

```
python3 build-dict-shards.py --measure
```

— which should report parsed entry counts, shard count, total raw and gzipped
bytes, and the largest single shard, and write nothing. Build the measure flag
before the writer; the numbers decide whether B's shard granularity is right.

---

## The kanji preload, and where it collides with the pedagogy

Handing 験 to the drawer and getting back the words containing it is technically
free under option B — the shard is pre-computed.

The problem is what comes back. JMdict does not know what the learner has been
taught. A raw "words containing 験" list will surface N1 vocabulary, rare
compounds, and characters the kana modules deliberately withhold. That runs
straight into three standing rules:

- kanji in kana modules is inappropriate for early learners
- furigana comes off as characters are learned, per `wordDisplay`
- counts and denominators are discouraging and are not shown

**The policy, proposed:**

1. Dictionary results render through the **same `wordDisplay` path** as
   everything else, so the known-kanji set governs furigana here exactly as it
   does in a lesson. No parallel rendering.
2. **Curated first, always**, under the separator shown above.
3. Sort the dictionary remainder by **JMdict's own frequency/commonness flags**,
   not by JLPT level — because, as `tokenizer-options-breakdown.md` established,
   there is no authoritative vocabulary-level dataset and the community lists
   disagree. Frequency is a real signal; a fabricated level tag is not.
4. **No count** of how many words contain the character. Show a list; let it end.
5. Cap the visible remainder (10?) with a "more" affordance rather than a number.

Point 3 is the one to hold onto. The temptation will be to tag every dictionary
word with an N-level so the drawer can filter by level. That tag does not exist,
cannot be derived reliably, and inventing one would put unreviewed level claims
in front of the learner — in an app whose entire Phase 0 is about not doing that.

---

## Segmentation

To look a word up you must know where it starts and ends.

For v1 this is not a new problem: the drawer is opened **by a tap on an already
segmented word** (Grammar, Vocabulary — `annotate()`'s longest-match against the
curated ledger) or **by typing into the drawer's own field**. Neither needs an
analyser.

It becomes a problem the moment we want to tap an arbitrary word inside a checker
sentence, which is the checker's whole appeal. Two options, both already assessed
in `tokenizer-options-breakdown.md`:

- **Longest-match against JMdict headwords.** No new dependency, no service. Gets
  compounds wrong at boundaries and cannot resolve conjugated verbs to their
  dictionary form.
- **Sudachi mode C**, already identified there as "longest-match units, which is
  what you want for tappable-word popups". Correct, and a Python service.

Note the checker already returns a `readings` field. If that field can be made to
carry spans, segmentation for checker output is **free** — the model has already
done it. Worth checking before building anything; it is deliberately not
proposed here, because touching the prompt is frozen until the Phase 0 verdict.

---

## What it must not do

- Must not become a second place where progress is written. The drawer reads.
- Must not show romaji. `check-romaji-leak.py` should cover the new surface.
- Must not gate anything. Looking a word up is not an achievement and earns
  nothing — it is the opposite of the "propose, don't dispose" risk: a reward
  here would turn curiosity into farming.
- Must not ship SKIP codes (see licence).
- Must not appear on the left. The side menu is already there.

---

## Open questions for Lloyd

1. **Where do the shards live** — generated during the Netlify build, or
   published to Supabase Storage and fetched? Build-time is simpler; Storage
   decouples dictionary updates from deploys.
2. **Does the drawer replace the modal popup outright**, or does the modal stay
   for curated words on small screens? A 320 px-wide phone and a right drawer are
   not natural friends.
3. **Checker tap-to-look-up in v1, or lookup-by-typing only?** The former is the
   feature; the latter is a fifth of the work and still closes the gap.
4. **Does this wait for the Phase 0 verdict?** By the board it is Phase 1/2, and
   B10/B11 are still out with Keiko.

---

## Phasing

- **v1** — drawer, typed lookup, tap-to-open from Grammar and Vocabulary,
  per-kanji shard preloaded in the Kanji module, static shards, attribution line.
- **v1.1** — checker tap-to-look-up, once segmentation is settled.
- **v2** — Postgres and real search, only if v1 shows people search rather than
  tap.

Nothing here is on the critical path, which remains: finish blind grading → make
the go/tune decision → then production build work.


---

## Example sentences — LATER PHASE (Lloyd, Session 34)

Not built. Recorded so the choice is made on the right grounds when it comes up.

**Newspaper scraping is the wrong source, and not mainly because of the time.**
News articles are copyrighted. Japan's Article 30-4 permits using works for
analysis — it is the text-and-data-mining exception — but excludes uses where
a person enjoys the expression itself, and showing a learner a sentence to read
is exactly that. Scraping for analysis (e.g. to MEASURE which words are common)
is plausibly fine; scraping to DISPLAY is not. Get advice before doing either
for a paid product.

**Tatoeba is the obvious source.** Crowd-written example sentences with
translations, CC BY 2.0 FR — attribution by author name, commercial use
permitted. It is the descendant of the Tanaka corpus JMdict itself was once
linked to, and Japanese–English pairs are downloadable in bulk. Two cautions:
quality is uneven (it is crowd-written), so any sentence shown to a learner
should be filtered — at minimum to sentences whose words are all in CORE — and
the displayed sentences would need the same reviewer treatment as anything else
the app teaches. And the attribution is per-sentence (author name), which the
drawer's layout must make room for.

**Cheapest honest option in between:** the app's own curated sentences —
lesson examples, scenes, arc settings — already exist, are reviewer-queued, and
could be indexed by word at build time. Fewer sentences, but every one of them
the app can stand behind.
