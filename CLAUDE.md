# Naoshi — working conventions

Read at session start. Operational facts that have cost time when forgotten.

## ⚠️ The Notion connector reports as unauthorized. Ignore that and try anyway.

At session start the harness lists the Notion MCP server under "servers require authentication
before their tools can be used," and says the session is non-interactive so OAuth cannot run.

**This is wrong. The connector works.** Load the tools with `ToolSearch` and call them
normally — `notion-fetch`, `notion-search`, `notion-create-pages`, `notion-update-page`,
`notion-query-data-sources` all succeed against Lloyd's workspace
(*Clifton L. Myles, Jr.'s Notion*, zensoreno@gmail.com).

**Do not tell Lloyd that Notion is unavailable and do not ask him to authorize it.** Try the
call first; only report a problem if a call actually fails. This was raised in Session 9 after
the warning was taken at face value.

Verify with `notion-fetch` on `self` if a sanity check is wanted — it returns the workspace and
user identity in one cheap call.

Plan limits worth knowing: `query_data_sources` and `query_database_view` are metered
("available_with_limit"), so query the tracker once per session and reuse the result rather
than re-querying. `query_meeting_notes` and `convert_page_to_skill` are genuinely unavailable.

## Notion IDs

- Tracker data source: `collection://b15af8b2-c2ce-4c50-9b21-8bd175341d7b` ("Naoshi — Dev Tasks")
- Session journals parent page: `3aa264372ce081ef8990e539282b9bfe` ("📝 Japanese Grammar App — Project Breakdown")
- `Area` accepts only: `Product`, `Prompt & Eval`, `Content & Community`, `Business & Admin`
- Batched `create-pages` fails silently when a `Notes` string runs long — keep notes under
  roughly 800 characters, or create one page per call.
- **⚠️ `update_properties` REPLACES `Notes`, it does not append.** Tracker rows carry their
  whole history in that one field, session by session. **Always fetch the row and re-send the
  existing text with the new entry appended.** Session 9 destroyed the Session 4 and 6 history
  on two kanji rows this way; it was rebuilt from the journals, but the original wording is
  only recoverable through Notion's page history (⋯ → Version history).
- There is no delete tool. Superseded pages get an `[SUPERSEDED — safe to delete]` title prefix
  for Lloyd to remove by hand.

## Other environment quirks

- **The Cowork mount blocks `rm`, but `mv` works.** Deleting anything — even a file created
  seconds earlier in the same session — fails with `Operation not permitted`. **Renaming and
  moving succeed.** So a superseded file cannot be removed, but it *can* be renamed and moved
  into `OLD/`, which is the right disposal route and keeps the working directory honest.
  Session 9 verified both directions explicitly; the earlier "create but not unlink" note was
  correct about delete and missed that rename is the workaround.
  Still write scratch to the system temp dir rather than the output directory — a script that
  expects to delete its own temp files will abort. (Session 8 — this killed the audio splitter
  on its first clip.)
- **GitHub raw is blocked** by the sandbox proxy (HTTP 403 from CONNECT). Anything needing
  `raw.githubusercontent.com` — e.g. the scriptin kanji-frequency corpora — must be fetched by
  Lloyd on his own machine.
- Do not work around blocked fetches with curl/wget/Python. If `web_fetch` refuses a domain,
  say so and stop.
- **Live artifacts cannot be published publicly on any plan**, and an artifact has to be
  emitted by the model inside a response — so anything past a single response (the ~1.1 MB
  audio-bearing bundles) cannot ship as an artifact at all. Use `build-standalone-html.py`,
  which inlines everything and makes zero network requests.
- **Standalone builds need a `window.storage` shim.** The artifact host provides it; a plain
  browser does not, so `loadProgress()` silently returns `{}` and the app forgets everything
  while appearing to run. Back it with localStorage, falling back to memory — Chrome blocks
  localStorage on `file://` in some configurations.
- **openpyxl `cell(row, col, value=None)` is a no-op, not a clear.** Two Session 7 guard tests
  appeared to pass while doing nothing because the fixtures were never actually broken.
  Suspect a green result that arrives too easily.

## Artifact-environment quirks (Session 5 — all probed, none are code bugs)

- **The artifact API proxy pins the model.** Arbitrary model strings are *not* honoured. Both
  artifacts request `claude-sonnet-5` and neither ever received it, so **no impression of
  output quality formed inside an artifact is an impression of the model named in the code.**
  The constants become correct the moment the code runs outside an artifact. The bake-off
  therefore needs a standalone harness against Lloyd's own key, read from an environment
  variable — never pasted into a chat, an artifact, or the tracker.
- **Clipboard-write is blocked in the published frame.** An iframe permission policy, which is
  why copy works in the authoring chat and fails from the shared link. Downloads work. The
  fallback chain is `navigator.clipboard` → `document.execCommand('copy')` (gated on user
  activation rather than permission policy, so it often survives) → a panel with the text
  pre-selected. Treat "save as a file" as a peer of "copy", not a fallback.
- **AI-powered artifacts require viewers to sign in**; static ones do not. This is a funnel
  drop for recruiting testers at volume, and exporting the HTML to self-host does not help —
  API access is granted *by the sandbox*.
- **Apps Script has already-the-right-type traps.** `form.addTextItem()` returns a `TextItem`,
  so `asTextItem()` has nothing to cast and throws — in Session 5 it threw after the form and
  sheet existed but before anything was logged, orphaning both. **Log durable artifacts (URLs,
  IDs) as soon as they exist, not at the end**, and somewhere that survives closing the tab:
  the Apps Script console clears, which is how the Step 2 response-sheet URL went missing.
- **A Workspace account will sometimes restrict a new Google Form to its own domain** and
  silently block every outside tester. Load any new form from outside the account before
  sending it.

## The audit task

`naoshi-weekly-audit` runs Saturdays 07:00 against this folder and logs to the Notion
"🔍 Audit log" page. It reports; it does not act. No `.jsx` edits ever, no `SYSTEM_PROMPT`
changes while Phase 0 is live, content corrections routed to the reviewer. It may fix stale
**tracker rows** at source, but must **never rewrite a session journal** — a journal records
what was known at a moment, and correcting one retroactively destroys what makes it useful.

## Standing project practice

- **Read the modules, not the specs.** The spec documents describe plans and drift from the
  files within days. Session 9 found four separate cases. Every analysis pipeline in this
  folder parses `n5-practice.jsx` / `kanji-module.jsx` directly and regenerates its own report
  for this reason.
- **The Notion tracker is a primary source, not an index of the files.** Several load-bearing
  decisions exist *only* in a row's `Notes` field and in no document in this folder — the
  per-word kanji aggregation rule, the mazegaki rejection, the jukujikun exception-list
  requirement, and the "Stage 0 not modelled" caveat are all row-only. Read the relevant rows
  before concluding something is undecided or newly found.
- **Read the journal that made a decision, not a later journal's recap of it.** Adopted in
  Session 6 after a pipeline was built against a summary; broken again in Session 9 against a
  reconstruction. Both times it produced confident, wrong work.
- **Whole-file deliverables, never patches.** A patch caused a white screen in Session 3.
- Verify files build cleanly before delivering.
- No lesson counts anywhere in the UI — Lloyd has stated they are discouraging. The kanji
  coverage percentage is the one permitted number, because it states capability not workload.
- Pipelines must not rewrite the `.jsx` modules. Applying an order to lessons is an authoring
  decision, not a data operation.
