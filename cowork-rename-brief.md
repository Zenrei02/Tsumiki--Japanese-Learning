# Cowork brief — execute the Naoshi → tsumiki rename

**Assumed scope:** carry out the rename across the local repo, database, and
project docs. This is the one task from the naming work that needs local file
access. If you wanted this session for something else, say so before starting.

Run this as its own session. It touches nearly every file and will corrupt any
feature work it shares a session with.

## The decision being implemented

The app is renamed from **Naoshi** to **tsumiki** (つみき, 積み木 — wooden
building blocks). Naoshi meant "a fix" and named the mechanism; it also read as a
man's given name. tsumiki names accumulation instead, which matches the product's
thesis of growth over completion. Keiko approved it on the reasoning that study
is 日々の積み重ね.

Presentation: lowercase `tsumiki` in running text and the wordmark, with つみき
in the logo lockup. Never capitalise it mid-sentence. Do not abbreviate to
"Tsumi" anywhere — 罪 means sin.

## Before you start

Have Lloyd take a backup file from the Account screen on his own device. There
are no testers with data worth preserving, but his is the one store with real
accumulated use in it — and the open question about the 400 KB / 300 check
budgets was going to be answered by watching a real store fill up. The rename
will clear it otherwise.

## Storage keys — rename straight

No compatibility shim, no read-old-write-new. Nobody has history that matters
yet, so this is the cheapest this change will ever be; once there are users with
something to lose, the same edit becomes a migration that has to be maintained
indefinitely. Bring the name-neutral keys (`checker-history-v1`,
`known-kanji-v1`) into line too while the surface area is small.

`naoshi_progress_archive` in Supabase needs mechanical care rather than caution:
a database trigger writes to it, so the change is table plus trigger plus
function, confirmed against an actual write rather than inferred from a clean
schema diff.

## Scope checklist

Verify each against the actual tree rather than assuming — several may already be
done or may not exist.

- Repo name and remote
- `package.json` name, title tags, manifest, favicon references
- Module files — `checker-module.jsx` was already renamed from
  `naoshi-prototype.jsx`; check the others (`n5-practice`, `kanji-module`,
  `hiragana-module`, `katakana-module`, `vocabulary-module-artifact`)
- Any `naoshi`-prefixed identifiers in source: functions, CSS classes, storage
  keys, constants
- Supabase: table and column names, RLS policy names, trigger and function names,
  migration files
- **Leave `VITE_SUPABASE_*` alone** — those are Supabase's names, not ours, and
  there is an open unproven claim that the production bundle inlines them.
  Renaming would confuse that investigation.
- Repo docs: `SESSION-24-HANDOVER.md`, `error-history-design-v1.md`, and any
  earlier design docs
- Netlify site name and any deploy metadata

## Deliberately out of scope

- **Blind-grading materials.** B8 and B9 are outstanding with Keiko and the form
  links are already sent. Changing the product name in materials she is midway
  through would be confusing for no benefit. Rename after the study closes.
- **`naoshi-eval-v1.xlsx`.** Same reasoning; it is tied to the study.
- Anything in the block visual system. That is a separate design brief and no
  code should be written against it yet.

## Deployment constraint

Sixteen commits are unpushed; `origin/main` is `bbf15c8`. One push is one Netlify
build at 15 credits, already authorised. The rename should land as **one push, not
several** — batch it, verify the build locally first, then push once.

Production currently serves a build with no Account UI, no Review, and no
Progress section. The Session 23 handover claims four commits and is out of date.

## Working notes

- Whole-file replacements verified to build cleanly, never patches — a patch
  caused a white screen in an early session.
- `/mnt/project/` can be stale. Trust the local tree.
- Say "I can't see it" rather than "it doesn't exist" when context is
  incomplete. Check the files before making existence claims.
- Close with a Notion journal entry and a tracker update capturing what changed
  and why. Dev Tasks data source: `b15af8b2-c2ce-4c50-9b21-8bd175341d7b`.
  Journals live under page `3aa26437-2ce0-81ef-8990-e539282b9bfe`.
- Notion has no delete tool; superseded pages get a
  `[SUPERSEDED — safe to delete]` prefix for manual removal.

## Definition of done

Nothing in the repo, database, or live build refers to Naoshi except the
grading materials deliberately left behind, the archive trigger still writes
after the table rename, the build is clean, and the whole thing went out in a
single push.
