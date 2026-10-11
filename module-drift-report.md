# Module drift check

## Stroke engine

- ✅ **`strokeStart()`** — identical across 4 modules
- ❌ **`StrokeView()`** — **2 DIFFERENT VERSIONS**
    - `e06912e9` — kanji-module.jsx, vocabulary-module.jsx
    - `55c9e51e` — hiragana-module.jsx, katakana-module.jsx
- ✅ **`resample()`** — identical across 4 modules
- ✅ **`samplePath()`** — identical across 4 modules
- ✅ **`scoreStroke()`** — identical across 4 modules
- ✅ **`tolerancesFor()`** — identical across 4 modules
- ✅ **`thinPoints()`** — identical across 4 modules
- ❌ **`useStrokeData()`** — **2 DIFFERENT VERSIONS**
    - `7b6c9ff2` — kanji-module.jsx, vocabulary-module.jsx
    - `62fabdbd` — hiragana-module.jsx, katakana-module.jsx
- ❌ **`StrokePractice()`** — **2 DIFFERENT VERSIONS**
    - `57bbf244` — kanji-module.jsx, vocabulary-module.jsx
    - `fcd239b9` — hiragana-module.jsx, katakana-module.jsx

## Shared scaffolding


- design tokens: 20 keys across 8 modules; **0 hold conflicting values**
    - ✅ no key holds two different values — divergence is additive only
    - ⚪ `hairline` — room `#D9CFB8` vs older modules `#E4E2DB`: **waived, checked** — the room's value is the tatami-rework value lib/tokens.js ships for every module
    - ⚪ `ink` — room `#2C2A26` vs older modules `#22252B`: **waived, checked** — the room's value is the tatami-rework value lib/tokens.js ships for every module
    - ⚪ `paper` — room `#F6F1E6` vs older modules `#F7F6F2`: **waived, checked** — the room's value is the tatami-rework value lib/tokens.js ships for every module
    - ⚪ `sheet` — room `#FBF7EE` vs older modules `#FFFFFF`: **waived, checked** — the room's value is the tatami-rework value lib/tokens.js ships for every module
    - ⚪ `sub` — room `#4A463D` vs older modules `#6E7178`: **waived, checked** — the room's value is the tatami-rework value lib/tokens.js ships for every module
- ✅ **`loadJSON()`** — identical across 5 modules
- ✅ **`saveJSON()`** — identical across 5 modules

## Lesson-completion block

Copied into grammar, kanji and vocabulary rather than imported — the same
duplication as the stroke engine, and the same failure mode if one is edited.

- ✅ **`LessonComplete()`** — identical across 3 modules
- ✅ **`COMPLETE_CSS`** — identical across 3 modules

## Romaji converter

Copied from the dictionary into vocabulary for typed review answers.

- ✅ **`RK` table** — identical across 2 modules
- ✅ **`romajiToKana()`** — identical across 2 modules

## Koban ledger

Byte-identical or the build refuses; compared here so drift shows before a build.

- ✅ **koban ledger block** — identical across 6 modules

## Storage keys

A key renamed in one module silently orphans that learner's progress in
every other module that reads it. These are the real seams.

| Key | Modules |
|---|---|
| `tsumiki-achievement-points-v1` | engagement-module.jsx, grammar-module.jsx, hiragana-module.jsx, katakana-module.jsx, room-module.jsx, vocabulary-module.jsx ⚠️ shared |
| `tsumiki-koban-ledger-v1` | engagement-module.jsx, grammar-module.jsx, hiragana-module.jsx, katakana-module.jsx, room-module.jsx, vocabulary-module.jsx ⚠️ shared |
| `tsumiki-known-kanji-v1` | dictionary-module.jsx, grammar-module.jsx, kanji-module.jsx, vocabulary-module.jsx ⚠️ shared |
| `tsumiki-stroke-data-v1` | hiragana-module.jsx, kanji-module.jsx, katakana-module.jsx, vocabulary-module.jsx ⚠️ shared |
| `tsumiki-hiragana-progress-v2` | grammar-module.jsx, hiragana-module.jsx, room-module.jsx ⚠️ shared |
| `tsumiki-katakana-progress-v1` | katakana-module.jsx, room-module.jsx, vocabulary-module.jsx ⚠️ shared |
| `tsumiki-n5-progress-v1` | grammar-module.jsx, kanji-module.jsx, vocabulary-module.jsx ⚠️ shared |
| `tsumiki-engagement-v1` | engagement-module.jsx, room-module.jsx ⚠️ shared |
| `tsumiki-known-words-v1` | room-module.jsx, vocabulary-module.jsx ⚠️ shared |
| `tsumiki-my-words-v1` | dictionary-module.jsx, vocabulary-module.jsx ⚠️ shared |
| `tsumiki-character-v1` | room-module.jsx |
| `tsumiki-dict-recent-v1` | dictionary-module.jsx |
| `tsumiki-garden-state-v1` | room-module.jsx |
| `tsumiki-kanji-progress-v1` | kanji-module.jsx |
| `tsumiki-learner-depth-v1` | grammar-module.jsx |
| `tsumiki-room-layout-v1` | room-module.jsx |
| `tsumiki-room-owned-v1` | room-module.jsx |
| `tsumiki-room-pulse-v1` | room-module.jsx |

10 of 18 keys are shared across modules.


## Kana audio sprite

- ✅ `kana-sprite.mp3` identical in both locations (`09e2b589`)
- ✅ `kana-sprite.json` identical in both locations (`8931e55e`)

If these diverge, re-run `Audio/build-kana-sprite.py` and copy the result to
both locations, rather than editing either by hand.
## Verdict

**DRIFT DETECTED in 3 shared block(s):** `StrokeView()`; `useStrokeData()`; `StrokePractice()`.

The copies have diverged. Whatever was fixed in one module is now
absent from the others, and no test covers the gap. This is the
event that says the modules should share code for real rather than
by duplication — see `stitching-decision-v1.md`.
