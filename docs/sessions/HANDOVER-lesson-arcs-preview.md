# Handover to Claude Code — render the lesson arcs, locally only

*Session 17, Cowork. Paste this whole file as the opening prompt.*

---

## ⚠️ THE ONE HARD RULE

**Do not deploy. Do not push to `main`.** Netlify charges **15 credits per production
deploy** and every push to `main` triggers one; ten pushes burned ~150 credits on
Aug 13 2026 before anyone noticed. Lloyd's standing rule is **at most one push per
session, made by him**.

Your job ends at a **single standalone `.html` file Lloyd can open anywhere** (see "How
Lloyd actually sees this" below). Commit if you like — commits are free. Do not push, and
do not suggest pushing.

`netlify.toml` carries a build-ignore rule so a push touching nothing under `tsumiki-app/`
skips the build. That is a safety net, not a licence.

---

## What you are building

A new lesson structure Lloyd specified in Session 17. The situation a learner is standing
in opens the lesson, and the grammar arrives as the answer to a question they already
have. Read **`lesson-arc-design-v1.md`** first — it is short and it is the spec.

The data is **`lesson-arcs-v1.json`**: 112 entries, one per teaching point, covering
**all of Stage 1 (Steps 0–12)**. It is hand-authored and validated by
**`check-arcs.py`**, which is green. Run it before and after you touch anything:

```bash
python3 check-arcs.py     # exits 0, prints Stage 1 coverage
```

---

## The change, precisely

Everything happens in **`Walkthrough`** in `grammar-module.jsx` (~line 3679, built
Session 14). **It already does paged-not-scrolled with dot navigation and Back/Next.**
You are extending it, not replacing it.

### Today

```js
const pages = [
  "idea", "apart",
  ...(point.ex.length > 1 ? ["again"] : []),
  ...(exp.watch || wr.length ? ["watch"] : []),
  "try",
];
```

All wrinkles render stacked on the single `watch` page.

### Wanted

```
setting → idea → apart → again → ext₀ → ext₁ → … → watch → try
```

1. **`setting` becomes page 0** when `ARCS[point.id]` exists. It renders
   `setting.scene` as prose, then `setting.jp` / `setting.en` in the same treatment
   `exBox` already uses for examples, with `setting.pattern` highlighted via the existing
   `HL` component.
2. **Each entry in `arc.extensions` gets its own page.** For an extension with
   `kind: "wrinkle"`, the teaching text is **`DEEP[id].wr[extension.wr].t`** — read it
   from the module, do not read it from the JSON, because it is deliberately not in
   the JSON. For `kind: "extra"`, the text is `extension.t` on the extension itself.
   Render order per page: `scene` prose → the wrinkle text → the `jp`/`en` box.
3. **`watch` survives** and carries `exp.watch` only. Any `wr` entry that no extension
   claims should still render there rather than vanishing — `check-arcs.py` warns when
   that happens, and currently nothing does.
4. **`try` is unchanged.**

Points with no arc keep exactly today's page list. Do not regress them.

### Schema reference

```json
{
  "point": "teiru2",
  "step": "Step 4 · Verbs: from dictionary form up",
  "setting":  { "scene": "…", "jp": "…", "en": "…", "pattern": "住んでいます" },
  "extensions": [
    { "wr": null, "kind": "flip",    "scene": "…", "jp": "…", "en": "…" },
    { "wr": 0,    "kind": "wrinkle", "scene": "…", "jp": "…", "en": "…" }
  ],
  "claims": [], "sources": [], "flags": [], "review": { "status": "unreviewed" }
}
```

`claims`, `sources`, `flags` and `review` are **for the reviewer and must never render.**

`pattern` may be `null` (the lesson's point is an absence — `prim-drop` only).

---

## How the data gets in

`lesson-arcs-v1.json` is 112 entries and the module is already 660 KB. **Do not paste the
JSON into `grammar-module.jsx` by hand.** Follow the pattern the folder already uses for
generated content — see `build-vocab-data.py`, which merges `vocab-notes-v1.json` into
`vocab-data-v1.js`, and the `// @@DEEP-START` / `// @@DEEP-END` markers around the `DEEP`
object.

Write **`build-arcs.py`**: read the JSON, emit an `ARCS` object between
`// @@ARCS-START` / `// @@ARCS-END` markers, and make re-running it idempotent. Never
hand-edit the generated block.

---

## How Lloyd actually sees this

**A single standalone `.html` file he can double-click.** Not a dev server he has to keep
alive, and not a deploy.

`build-standalone-html.py` already does exactly this for the kana modules — it inlines
everything and makes zero network requests. Use it rather than inventing a second
mechanism.

### ⚠️ The trap that makes a standalone build lie to you

**Standalone builds need a `window.storage` shim.** The artifact host provides one; a
plain browser does not. Without it `loadProgress()` silently returns `{}` — so the app
runs, looks completely fine, and forgets everything. Back it with `localStorage`, falling
back to an in-memory object, because **Chrome blocks `localStorage` on `file://` in some
configurations** and that failure is also silent.

Verify by paging through a lesson, closing the file, reopening it, and checking the
`walked` flag survived. If it did not, the shim is not working and everything you think
you tested is unverified.

### There is already a preview to compare against

`lesson-arc-preview.html` (built by `build-arc-preview.py`, Session 17) renders the arc
page-sequence straight from the JSON plus the module's own prose. **It is a shape preview,
not the app** — no drill, no progress, no kanji toggle, and `apart` shows the sentence
whole instead of breaking it into `DEEP.seg` cards.

Use it two ways: as the reference for what the page order should feel like, and as a
check on your own build — if a lesson reads differently in the real module than it does
there, one of you has the data wrong, and it is worth knowing which before Lloyd sees it.

---

## Conventions that will bite you if you skip them

- **Whole-file deliverables, never patches.** A patch caused a white screen in Session 3.
- **Read the modules, not the specs.** Spec documents in this folder drift from the code
  within days. `grammar-module.jsx` is the truth.
- **`npm run smoke` builds the bundle first.** Running `node test/smoke.mjs` directly
  reads whatever is already at `/tmp/test-bundle.js` — in Session 10 that produced green
  passes for code that had never been built. In the sandbox, build to `$HOME` and run
  `SMOKE_BUNDLE=$HOME/test-bundle.js node test/smoke.mjs`.
- **No lesson counts in the UI.** Lloyd has ruled these out as discouraging. The page
  dots are fine — they are position, not workload. **Do not add "page 3 of 8".**
- **Do not touch `SYSTEM_PROMPT`** while Phase 0 evaluation is live.
- **Do not edit the `.jsx` content itself** — the arcs are additive. If a `wr` index in
  the JSON no longer resolves, `check-arcs.py` fails; fix the JSON, not the module.

---

## Definition of done

1. `python3 check-arcs.py` exits 0.
2. `build-arcs.py` runs clean and is idempotent — running it twice changes nothing.
3. The app builds.
4. **A standalone `.html` exists that Lloyd can double-click**, and on any Stage 1 grammar
   point the Learn flow opens on the situation and pages through to `try`.
5. **Progress survives a close-and-reopen** of that file — proving the `window.storage`
   shim is real and not silently swallowing writes.
6. Points without an arc render exactly as before.
7. **Nothing is pushed.** Report the file path and stop.

A dev server is fine for your own iteration. It is not the deliverable, because Lloyd
should not have to keep a terminal running to look at a lesson.

## What to tell Lloyd when you finish

The local URL, which points you spot-checked, and anything in the data that looked wrong
from the rendering side — particularly any Japanese line that is too long for a phone at
the font size the module uses. Seventeen lines carry kanji outside `KANJI_DICT` and are
flagged in the JSON for a furigana decision; if any of them render badly, say so, because
that decision has not been made yet.

---

# ⚠️ SUPERSEDED — see HANDOVER-lesson-arcs-buildout.md

The integration this file briefs was delivered in commit `65ccf5c`. What remains is a
renderer gate that blocks 26 of the 112 arcs, plus the standalone build. Both are
specified in `HANDOVER-lesson-arcs-buildout.md`, which is the current handover.
