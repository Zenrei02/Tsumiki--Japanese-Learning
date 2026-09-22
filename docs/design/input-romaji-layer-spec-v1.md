# Input & Romaji Layer — Spec v1

*Draft, July 28 2026. Covers tracker rows "Romaji containment rule in generation prompt", "Romaji detection with stateful redirect + conversion preview", and "Pop-up 五十音 kana keyboard for IME-less devices".*

Nothing here depends on how well the checker grades, so it survives any Phase 0 outcome. All Japanese examples below are AI-authored and pending reviewer verification.

---

## Part A — Romaji containment

### The rule

Romaji lives only inside the kana module and never leaks past it.

The reason the rule needs writing down at all: you cannot teach あ without saying "a". Romaji has to exist somewhere in the product, which means "no romaji" is not implementable as stated and will get quietly reinterpreted by the model at generation time. That is exactly how the ご飯 leak happened.

### The distinction that does the real work

**English translations are allowed. Romaji transliterations are not.**

| Output | Verdict | Why |
|---|---|---|
| コーヒー — "coffee" | Allowed | English gloss. That's meaning. |
| コーヒー — "koohii" | Banned | Transliteration. That's the reading, and readings go in kana. |
| 【珈琲\|コーヒー】 | Allowed | The existing annotation system. Reading in kana. |

Most romaji leaks will not look like leaks. They arrive disguised as pronunciation help, which is precisely when they do the most damage.

### Prompt language

Paste into the system prompt as its own section.

```
## Script policy

All Japanese you produce must be written in Japanese script — hiragana,
katakana, or kanji. Never write Japanese words or sentences in Latin
letters (romaji): not in example sentences, not in word-helper chips, not
in feedback, not in quiz stems, and not in parentheses as a pronunciation
aid.

Readings are given in kana using the 【word|reading】 annotation. Never in
romaji.

English translations of meaning are permitted and encouraged. The banned
thing is transliteration, not translation. "コーヒー (coffee)" is correct.
"コーヒー (koohii)" is not.

Exception — kana lessons only. When the active module type is KANA, you may
use romaji solely to name the sound of an individual kana or mora being
taught: あ = "a", き = "ki", きゃ = "kya". Even inside a kana lesson, never
render a whole word, phrase, or sentence in romaji.

Pronunciation notes must be expressed in kana. To explain that the particle
は is read わ, write: 「は」は「わ」と読みます。Do not write: "は is
pronounced wa".

If you are unsure whether romaji is permitted in a given output, do not use
it.
```

### Architecture implication

Keep Japanese text and English gloss in **separate response fields**, not interleaved in one string.

Once they're separate, the containment rule becomes machine-checkable: any Latin character appearing in a Japanese-text field is a leak, full stop. Interleaved in a single string it is not checkable at all, because legitimate English glosses contain Latin letters and no regex can tell the two apart.

This is the cheap structural fix that makes the whole rule enforceable rather than aspirational. Worth doing before the kana module exists.

### Leak test cases

Add to the eval as a small dedicated block. Each asks for output where romaji is the tempting answer.

| # | Prompt to the model | Pass condition |
|---|---|---|
| L1 | Generate an example sentence using a new N5 word | Japanese script only; reading in 【】 if annotated |
| L2 | Generate word-helper chips for a practice box | Kana/kanji only; English gloss permitted |
| L3 | Explain why the particle は is read わ | Explained in kana. **The highest-risk case** — this one practically begs for romaji |
| L4 | Introduce コーヒー in a katakana lesson | English meaning allowed; "koohii" is a fail |
| L5 | Generate content for a KANA-type module teaching さ行 | Romaji permitted, but only labelling single kana |
| L6 | Learner asks "how do I pronounce 上手?" | Answered in kana (じょうず), not "jouzu" |
| L7 | Generate feedback on a sentence with a long-vowel error | Contrast shown in kana (おう vs おお) |

L3 and L6 are the ones to watch. Both are pronunciation questions, which is where a helpful model reaches for romaji by instinct.

---

## Part B — Romaji detection and redirect

### Detection

Two branches, because romaji-Japanese and actual-English need different responses.

1. **Extract Latin runs** from the input.
2. **Whitelist legitimate Latin.** Japanese text does legitimately contain some: `CD`, `PC`, `DVD`, `Tシャツ`, `Wi-Fi`. Rule of thumb — short all-caps tokens and single capitals adjacent to kana are fine. Don't flag those.
3. **Test convertibility.** Take the remaining lowercase Latin runs and attempt wapuro-romaji-to-kana conversion.
   - Converts cleanly (`watashi` → わたし) → **romaji Japanese**. Run the redirect.
   - Fails to convert (`hello`, `I went to school`) → **English input**. Different message: ask for Japanese, offer the kana pad. Don't lecture about romaji.
4. **Accept both romanisation systems.** `shi`/`si`, `tsu`/`tu`, `chi`/`ti`, `fu`/`hu`, `ja`/`zya` all map. Overseas textbooks teach Hepburn, Japanese primary schools teach Kunrei, IMEs accept both.

### The converter must be deliberately dumb about particles

This is the part that is easy to get wrong by being helpful.

| Learner types | Naive conversion | The "smart" conversion |
|---|---|---|
| `wa` | わ | は (if it looks like a topic particle) |
| `o` | お | を (if it looks like an object particle) |
| `e` | え | へ (if it looks like a direction particle) |

**Always show the naive conversion.** Never infer the particle.

Guessing は is doing the single most valuable piece of the learner's work for them — and は/わ is exactly the knowledge the checker exists to test. A converter that silently fixes particles produces a submission that looks correct and teaches nothing.

The preview should surface the ambiguity rather than hide it: show わたしわがくせいです and note that some kana here may need to be particles, without saying which.

### Redirect logic

```
romaji detected
├── kana module not completed
│   └── "Japanese is written in kana. Want to learn it? — 20 min"
│       → link to hiragana module
│       → still offer the conversion preview; never hard-block
└── kana module completed
    └── no lecture
        → open the 五十音 pad
        → link to input setup troubleshooter (Phase 2)
        → conversion preview as normal
```

The preview requires explicit confirmation before submission. Silent conversion means grading our own converter, not the learner's Japanese.

### Grading consequences

A submission that arrived as romaji is flagged **orthography-not-graded**.

| Tier | Status on a converted submission |
|---|---|
| FIX — grammar, word choice, conjugation | Still valid |
| UNNATURAL | Still valid |
| WORTH KNOWING — kanji opportunities | Still valid |
| Anything orthographic | **Suppressed** |

Suppress specifically: は/わ, へ/え, を/お, long vowels (おう vs おお), じ/ぢ, ず/づ, small っ. The learner never wrote those distinctions, so the checker has no evidence either way — and flagging them would be inventing errors, which is the failure mode the whole eval is built to catch.

Surface this in the UI. "Checked for grammar and naturalness. Spelling wasn't checked — you typed in romaji."

---

## Part C — 五十音 keyboard

### Purpose

Unblock input on any device without a Japanese IME. Cheaper than supporting romaji, and it teaches kana layout as a side effect.

### Layout

Standard 五十音図 grid, with gaps preserved rather than collapsed — the gaps are information.

```
あ か さ た な は ま や ら わ
い き し ち に ひ み ・  り ・
う く す つ ぬ ふ む ゆ る ・
え け せ て ね へ め ・  れ ・
お こ そ と の ほ も よ ろ を
                            ん
```

- や行 has only や ゆ よ. Leave い/え positions visibly empty.
- わ行 ships わ and を only. Omit ゐ ゑ — archaic, and confusing at this level.
- ん sits alone.

**Open decision:** traditional 五十音図 runs right-to-left with あ rightmost. Left-to-right is more intuitive for learners coming from Latin scripts, but diverges from every chart they'll see in Japan and from the reference material inside your own kana module. I'd go left-to-right in the keyboard and show the traditional orientation in the lesson, but flag the inconsistency deliberately rather than letting it happen by accident.

### Required keys beyond the grid

Easy to omit, painful to retrofit:

- **゛dakuten** and **゜handakuten** — applied to the last-entered kana (か + ゛→ が)
- **小 small-kana toggle** — つ→っ, や→ゃ, ゆ→ゅ, よ→ょ, plus small vowels ぁぃぅぇぉ for katakana
- **ー** the katakana long-vowel bar
- **、** and **。**
- **hiragana / katakana switch**
- **backspace**
- No space key. Japanese doesn't use spaces, and offering one invites romaji-shaped habits.

Combos (きゃ, しゅ, ちょ) are built by entering the base kana then the small form. No separate combo keys.

### Constraints

- 10×5 grid plus modifiers is ~55 cells. On a 380px viewport that's roughly 34px per cell — usable but tight. Test at small sizes early; a two-page or scrollable variant may be needed.
- Long-press for dakuten variants on mobile, as a shortcut alongside the explicit modifier key.
- Screen-reader labels should give the kana's reading, not its Unicode name.
- Surfaces automatically when romaji is detected on a device with no Japanese input source; available on demand from the input box otherwise.

---

## Sequencing

1. Split the Japanese-text and English-gloss response fields — unblocks enforceable containment
2. Land the script-policy prompt section and the L1–L7 leak tests
3. Build romaji detection and the conversion preview
4. Build the 五十音 pad
5. Hiragana module — the redirect target
6. Input setup troubleshooter (Phase 2)

Steps 1 and 2 are worth doing before the kana module exists. Everything after can wait for Phase 0 to clear.
