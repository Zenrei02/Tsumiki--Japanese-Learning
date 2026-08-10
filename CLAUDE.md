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

- **`rm` fails until you ASK for permission. It is not impossible.**
  A delete returns `Operation not permitted` by default, and it is tempting to conclude the
  mount forbids deletion. It does not. Call **`mcp__cowork__allow_cowork_file_delete`** with
  the path; Lloyd approves once, and `rm` works normally for the whole folder from then on.
  The tool's own description says to do this "rather than telling the user it is impossible."

  Session 9 got this wrong three times in a row — the superseded grammar module, scratch
  files, and a stale git lock were all reported to Lloyd as undeletable, and the false
  limitation was written into this file twice before he asked "even if I give permissions?"
  and it turned out the answer was one tool call.

  **The lesson generalises past this tool:** an `Operation not permitted` is a closed door, not
  a wall. Check for the sanctioned path before reporting a limitation, especially before
  writing that limitation down where it will be believed later.

  **This has now happened three times** — `rm`, `git`, and the KanjiVG fetch below. Each time
  an early failure was recorded as a property of the environment, and each time the record
  outlived the mistake and was believed by a later session. **A limitation written into a
  handover or into this file stops being checked.** So the bar for writing one down is higher
  than the bar for hitting it: before it goes in a document, exhaust the sanctioned path,
  search rather than guess, and say what was actually tried so the next session can retry it
  cheaply. A dead end recorded with its method attached is useful; one recorded as a verdict
  is a wall that was never there.

  `mv` also works and needs no permission, which is why `OLD/` remains the right home for
  superseded files worth keeping.

- **`git` in the project folder: COMMITTING WORKS. Pushing does not. Check delete permission
  first.**

  The hazard is `.git/index.lock`: `git status` and anything else that refreshes the index
  creates it and then deletes it. **If delete permission has not been granted that cleanup
  fails**, the lock is left behind, and Lloyd's GitHub Desktop reports the repo as locked. A
  read-only command with a write-shaped side effect — Session 9 did exactly this with
  `git status --porcelain` and then wrote git off entirely, which was an overcorrection.

  **The order of operations that works:**

  1. Probe delete permission before any git call — `touch .p && rm .p` in the project folder.
     If it fails, call `mcp__cowork__allow_cowork_file_delete` and let Lloyd approve.
  2. Inspect with `git --no-optional-locks …`, which never takes the index lock. Safe even
     without permission.
  3. `git add -A && git commit -F -` works. Author comes from repo-local config and is already
     set to Lloyd (`Clifton L. Myles, Jr. <zensoreno@gmail.com>`) — commits land as his,
     which is what he asked for. Session 9 shipped `a4e0c71`, `735eaf9` and `8b4bf60` this way.
  4. **Check for a stray lock afterwards** (`ls .git/index.lock`) and remove it if present.

  **`git push` FAILS and always will** — `could not read Username for 'https://github.com'`.
  No credentials in the sandbox and GitHub is proxy-blocked anyway. Do not go looking for a
  way around it and do not accept a token: it would sit permanently in the transcript and can
  rewrite history. **Lloyd pushes from GitHub Desktop**, usually within a minute of the commit
  appearing.

  One trap when confirming: after his push, the local `origin/main` ref advances and
  `rev-list origin/main..HEAD` reads 0, which looks identical to "my push succeeded." It did
  not. Distinguish them by timestamp — compare `stat .git/refs/remotes/origin/main` against
  the commit time — or just ask.

- **Write scratch files to the system temp dir, not the project folder.** Even with delete
  permission granted, a script that creates and removes its own temp files is cleaner run
  outside the mount. (Session 8 — probe files next to the masters aborted the audio splitter
  on its first clip.)
- **GitHub raw is blocked** by the sandbox proxy (HTTP 403 from CONNECT). Anything needing
  `raw.githubusercontent.com` — e.g. the scriptin kanji-frequency corpora — must be fetched by
  Lloyd on his own machine. `github.com`, `codeload`, and the GitHub API are blocked too.

- **⚠️ The npm registry is reachable, and it is the way around a blocked GitHub. SEARCH it;
  do not guess package names.** Session 9 wanted KanjiVG stroke paths for 言, tried
  `kanjivg`, `kanjivg-js`, `kanji-svg` and three other guesses, got 404s, and recorded in the
  handover that KanjiVG was unreachable from the sandbox — leaving the character blocked
  across a whole session and pushing a licensing decision at Lloyd that never needed making.

  **`@madcat/kanjivg` has the entire corpus** — 22,923 files, CC BY-SA 3.0 (the licence the
  modules already attribute), `viewBox="0 0 109 109"`, path strings in exactly the shape
  `STROKES` wants. It was one registry search away the whole time:

  ```
  curl -sS "https://registry.npmjs.org/-/v1/search?text=kanjivg&size=12"
  ```

  Scoped packages will never turn up by guessing bare names. Search first.

  Also: `npm install` is unreliable here and its background process does not survive between
  tool calls. Fetch the tarball from `registry.npmjs.org` and `tar xzf --wildcards` the one
  file you need. For any long command, `setsid … & disown` then `sleep` **in the same call** —
  a plain `&` is killed when the call returns, which looks exactly like a hang.

- **Long-running commands need `setsid` + a done-marker.** `setsid bash -c 'cmd > log 2>&1;
  echo EXIT=$? > /tmp/x.done' < /dev/null & disown`, then poll for the marker. Backgrounding
  without `setsid` produces an empty log and no error, which reads as a failure that isn't one.
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
- **⚠️ `node test/smoke.mjs` run directly reads whatever bundle is already at
  `/tmp/test-bundle.js` — including one from a previous session.** Session 10 reported several
  smoke PASSes for new code that way; the bundle predated every change it claimed to test, and
  the sandbox's unwritable /tmp is what finally exposed it (`npm run smoke` failed to write,
  revealing that nothing had been rebuilding it). The test now refuses any bundle older than
  the sources and takes a `SMOKE_BUNDLE` env override — in the sandbox, build to `$HOME` and
  run `SMOKE_BUNDLE=$HOME/test-bundle.js node test/smoke.mjs`. The freshness gate is code, but
  the habit generalises: before trusting a green render test, check what artifact it actually
  loaded.

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

- **⚠️ A CONTEXT-COMPACTION SUMMARY IS THAT RECAP. Treat it as a lead, never as the record.**
  A long session hits the context limit and resumes from a generated summary. It reads as
  authoritative and it is not — it is a later recap of earlier work, exactly the artifact the
  rule above says not to build on.

  Session 9 broke this twice within an hour of editing that rule, and **neither failure was
  lost information** — both facts were sitting in the summary:

  - It opened with Lloyd's own words, *"This is Session 9."* A **"Session 10"** was invented
    anyway and reached six places across four files and two tracker rows before he caught it.
  - It gave the journal's page ID and said that page was mid-edit. Lloyd was still told no
    Session 9 journal existed, and nearly got a duplicate.

  So the failure mode is not a small context window. It is **substituting a confident
  inference for a cheap check** — the same move as guessing npm package names instead of
  searching the registry. On resuming from a summary:

  1. **Never infer the session number.** It is in the summary's first user message, or ask.
     A fabricated one poisons journals, tracker cross-references and commit messages at once.
  2. **List before you create.** `notion-fetch` on the journals parent page (id in "Notion IDs"
     above) costs one call and shows every journal that exists.
  3. **Re-read the source before repeating any claim the summary makes**, especially a
     limitation — see the `rm`, `git` and KanjiVG entries above, all three of which were
     believed from a written record rather than retested.
- **Whole-file deliverables, never patches.** A patch caused a white screen in Session 3.
- Verify files build cleanly before delivering.
- No lesson counts anywhere in the UI — Lloyd has stated they are discouraging. The kanji
  coverage percentage is the one permitted number, because it states capability not workload.
- Pipelines must not rewrite the `.jsx` modules. Applying an order to lessons is an authoring
  decision, not a data operation.
