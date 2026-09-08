#!/usr/bin/env python3
"""Model bake-off harness — runs the eval set through the three Run Key models
OUTSIDE the artifact environment (where model strings are pinned).

Why this exists: Session 5 proved the artifact API proxy ignores the requested
model, so every in-artifact impression was of the pinned default. This script
calls the real API with the real model strings, against your own key.

KEY HANDLING: reads ANTHROPIC_API_KEY from the environment. The key is never
written to any file, log, chat, or tracker. Set it for the single command only:
    ANTHROPIC_API_KEY=sk-... python3 bakeoff-harness.py --smoke
    ANTHROPIC_API_KEY=sk-... python3 bakeoff-harness.py --run

What it does:
  1. Extracts SYSTEM_PROMPT live from tsumiki-prototype.jsx (no drift — the
     prompt under test is the prompt in the file, and the run is stamped with
     its SCHEMA_VERSION).
  2. Reads sentences from naoshi-eval-v1.xlsx / Eval Set (skips EXAMPLE + blanks).
  3. Reads model strings and prices from Run Key — nothing hardcoded.
  4. For each pre-shuffled Blind Grading row, calls the row's model with the
     row's sentence. Static system prompt is sent with cache_control so repeat
     calls hit the prompt cache.
  5. Appends every raw response to bakeoff-log.jsonl AS IT ARRIVES (durable
     artifacts logged immediately — the Apps Script lesson). Re-running skips
     already-logged pairs, so a crash costs nothing. A response that cannot be
     parsed goes to bakeoff-parse-failures.jsonl instead, WITH the raw body —
     it must not go in the resume log, where its output_id would read as done.
  6. Writes naoshi-eval-v1-with-outputs.xlsx (a copy — the original is never
     touched) with Tool verdict + Tool feedback filled, and prints per-model
     token totals for the Results sheet's yellow cells.

Verdict mapping (strongest tier wins): any "fix" -> FIX; else any "unnatural"
-> UNNATURAL; else any "note" -> WORTH KNOWING; no issues -> NONE. Matches the
Expected-tier dropdown and the checker's own severity ordering.

Modes:
  --dry-run  validate wiring, print the run plan, no API calls (no key needed)
  --smoke    one sentence through each model, prints verdicts (needs key)
  --run      the full bake-off (needs key AND --key-verified)

  --two-pass (Session 27) modifier on --smoke/--run/--dry-run. Splits the call
             in two: pass 1 is the unchanged prompt from the jsx and produces
             the diagnosis; pass 2 receives the source sentence and pass 1's
             finalised `issues` array and returns ONLY the rewrite. Rows are
             stamped `naoshi-6`, so the single-pass path stays runnable and
             comparable without a checkout. With --smoke it runs 5 real plan
             rows and projects the full-run cost from measured tokens.

  --schema-stamp=NAME (Session 28) stamp this run's rows NAME instead of the
             jsx's SCHEMA_VERSION. The resume set keys on the stamp, so this is
             what lets a prompt be run TWICE: re-running naoshi-4 as naoshi-4
             finds 150 rows already logged, makes zero calls, costs $0 and exits
             GREEN — the Session 24 false green reached from the opposite
             direction. Stamping the replicate naoshi-4r1 gives it its own rows.
             ⛔ It does NOT change the prompt and must never be used to imply
             one changed: the md5 logged on every row is the only claim about
             what text was sent. Editing SCHEMA_VERSION in the jsx to achieve
             the same thing is the move this option exists to make unnecessary —
             it dirties the harness's source of truth for a run whose whole
             premise may be that nothing changed. Refused with --two-pass, which
             sets its own stamp.

--run also requires --key-verified: per the README protocol, the reviewer must
verify the answer key (Step 2) BEFORE outputs exist, or they can leak into the
key. The flag is you asserting Step 2 is done.

Every log record carries model_requested AND model_answered (from the API
response envelope). If they ever differ the run aborts — that silent
substitution is exactly what the artifact proxy did for five sessions.
"""
import json, os, re, sys, time, pathlib, urllib.request, hashlib

HERE = pathlib.Path(__file__).parent
WB_IN = HERE / "naoshi-eval-v1.xlsx"
WB_OUT = HERE / "naoshi-eval-v1-with-outputs.xlsx"
LOG = HERE / "bakeoff-log.jsonl"
# Unparseable responses go HERE and never into bakeoff-log.jsonl. The resume
# logic builds its `done` set from every output_id in that file, so a failure
# record written there would mark the row complete and every later re-run would
# skip it — the row would be permanently missing and the log would say it was
# handled.
FAIL_LOG = HERE / "bakeoff-parse-failures.jsonl"
API = "https://api.anthropic.com/v1/messages"

# ---------- pass 2: the rewrite call (--two-pass, Session 27) ----------
# WHAT IS BEING TESTED, and why it is not another wording change. naoshi-5 tried
# to fix the rewrite by adding prose about it to the single prompt.
# SELF_INCONSISTENT went 23 -> 22 and the two stronger models moved BACKWARDS by
# four each. Session 24 had written the disqualifying condition down in advance:
# "If M1 does not move, the problem was never the prompt." M1 moved one row.
#
# So the hypothesis here is STRUCTURAL. In the single-pass design `model_rewrite`
# is a sibling field in a JSON schema, emitted in the same breath as the
# diagnosis and connected to the `issues` array by nothing but prose. This gives
# it its own call, fed the finalised issues, with no ability to revisit them.
#
# THREE THINGS ARE DELIBERATELY NOT REPEATED HERE, each because a measurement
# says they backfired:
#   - NO MINIMALITY INSTRUCTION. naoshi-5's "minimum edit that resolves the
#     diagnosis" was read as flat minimality: divergence 0.105 -> 0.076,
#     identical-to-source 47 -> 56, TARGET_MISSED 21 -> 26. R2 below says the
#     opposite thing on purpose. If the rewrite now over-edits, that is a
#     finding to measure, not something to pre-empt with a clause.
#   - NO ASYMMETRY CLAUSE. Session 24's "substituting a content word is the more
#     frequent and more damaging failure" is the prime suspect for SUBSTITUTION
#     falling 8 while LEXICAL_MISS rose — it handed the model a safe default of
#     "don't touch the word". R3 leaves both halves balanced and lets the
#     instrument say which way it errs.
#   - NO RE-DIAGNOSIS. This call cannot add, drop or overrule an issue.
REWRITE_SYSTEM_PROMPT = """You apply corrections that have already been decided. You do not diagnose.

You receive a Japanese sentence written by a learner, and a list of issues already identified in it. Return that sentence with those issues applied.

You do not re-analyse the sentence. You do not add issues of your own. You do not judge whether an issue is correct: if the list says something is wrong, treat it as wrong and repair it. If you disagree with an issue, apply it anyway.

R1. APPLY EVERY ISSUE IN THE LIST, AND NOTHING ELSE. Every issue in the list must be resolved in your output. Do not make changes the list does not call for — same words, same order, same script everywhere it is silent. If the list is empty, return the input text character for character, unchanged.

R2. RESOLVE EACH ISSUE COMPLETELY. Your output must be a sentence in which the problem each issue names is genuinely gone. An output that leaves a listed problem standing has failed, however small the edit that produced it. Repair each issue as fully as it requires.

R3. REPAIR WHAT THE ISSUE NAMES — THE FORM OR THE WORD. If the issue is about the FORM of a word, fix the form and keep the writer's word: if \u4f1a\u3044 is wanted as a nominalised \u4f1a\u3046\u306e, nominalise the writer's own verb rather than reaching for \u4f1a\u8b70 or \u5f85\u3061\u5408\u308f\u305b; if \u5b64\u7acb\u306a is wanted as \u5b64\u7acb\u3057\u305f, conjugate it rather than swapping in \u5b64\u72ec. If the issue is about the WORD ITSELF, replace the word: adjusting a particle beside a wrong word and leaving the word standing has not resolved it. Read each issue and repair the thing it points at.

R4. TREAT KANA AS THE WRITER WROTE IT UNLESS AN ISSUE NAMES THAT EXACT TOKEN. Never convert a run of kana to kanji on your own initiative. A kana run may be a name — \u3048\u308a and \u3068\u3082 are people, not \u895f and \u53cb\u9054 — and the sentence alone frequently cannot tell you which.

Respond with ONLY valid JSON, no markdown fences, no preamble:
{"rewrite": "<the input text with the issues applied>"}"""

# The stamp for two-pass rows. The jsx prompt IS naoshi-4, byte for byte, and
# stays stamped that way — naoshi-6 names the two-CALL CONFIGURATION, which is
# the thing that changed. Putting a second label on an unchanged prompt is the
# error §2 of the Session 27 brief warns about; the two md5s logged per row say
# exactly which texts produced it.
TWO_PASS_SCHEMA = "naoshi-6"

# `note` issues are filtered out IN CODE, not by an instruction in the prompt.
# R1 can then say "apply every issue in the list", which is literally true and
# leaves nothing to interpret — and the whole premise of this session is that a
# rule carried by prose is the thing that failed. A note is a growth
# observation; applying one silently changes the writer's register.
REWRITE_TIERS = ("fix", "unnatural")


def rewrite_user_content(sentence, issues):
    """Return (issues actually sent, the user message for pass 2)."""
    applicable = [i for i in issues if i.get("type") in REWRITE_TIERS]
    return applicable, ("SENTENCE:\n" + sentence + "\n\nISSUES:\n"
                        + json.dumps(applicable, ensure_ascii=False, indent=2))


def call_cost(usage, cin, cout):
    """Dollar cost of one call, pricing the cache tiers separately.

    The harness's cumulative token totals fold cache reads in with fresh input
    because that is what the Results sheet's yellow cells want. A COST
    projection cannot do that: a cache read is a tenth of the price and a cache
    write is 1.25x, so folding them together overstates a cached run badly.
    """
    u = usage or {}
    fresh = u.get("input_tokens", 0) or 0
    read = u.get("cache_read_input_tokens", 0) or 0
    write = u.get("cache_creation_input_tokens", 0) or 0
    out = u.get("output_tokens", 0) or 0
    cin = float(cin or 0); cout = float(cout or 0)
    return (fresh * cin + read * cin * 0.1 + write * cin * 1.25
            + out * cout) / 1_000_000


def extract_rewrite(resp):
    """Pull the rewrite out of a pass-2 response.

    Pass 2 answers in JSON rather than bare text on purpose. Bare text invites a
    preamble ("Here is the rewrite: ..."), and a preamble would be silently
    swallowed INTO the rewrite — inflating divergence on every row and
    corrupting the exact numbers this run exists to produce. A wrapped value
    plus raw_decode fails loudly instead, and reuses the trailing-prose
    tolerance extract_json already has.
    """
    text = "".join(b.get("text", "") for b in resp.get("content", []))
    data = extract_json(text)
    rw = data.get("rewrite")
    if not isinstance(rw, str):
        raise ValueError("pass 2 returned no string 'rewrite' key: "
                         f"{text[:200]!r}")
    return rw

# ---------- prompt, straight from the checker file ----------
def load_prompt():
    src = (HERE / "tsumiki-prototype.jsx").read_text(encoding="utf-8")
    schema = re.search(r'SCHEMA_VERSION = "([^"]+)"', src).group(1)
    m = re.search(r"const SYSTEM_PROMPT = `(.*?)`;", src, re.S)
    if not m:
        sys.exit("Could not extract SYSTEM_PROMPT from tsumiki-prototype.jsx")
    return m.group(1), schema

# ---------- workbook ----------
def load_workbook_data():
    import openpyxl
    wb = openpyxl.load_workbook(WB_IN)
    es = wb["Eval Set"]
    sentences = {}  # eval id -> sentence
    for row in es.iter_rows(min_row=6):  # row 4 header, row 5 EXAMPLE, E01 at 6
        rid, sent = row[0].value, row[3].value
        if rid and sent and str(sent).strip():
            sentences[str(rid).strip()] = str(sent).strip()
    rk = wb["Run Key"]
    models = {}  # code -> (model string, in $/MTok, out $/MTok)
    for row in rk.iter_rows(min_row=5):
        if row[0].value and row[2].value:
            models[str(row[0].value)] = (str(row[2].value), row[3].value, row[4].value)
    bg = wb["Blind Grading"]
    plan = []  # (sheet row, output id, eval id, model code)
    for row in bg.iter_rows(min_row=5):
        oid, eid, code = row[0].value, row[1].value, row[2].value
        if oid and eid and code:
            plan.append((row[0].row, str(oid), str(eid), str(code)))
    return wb, sentences, models, plan

# ---------- api ----------
NO_TEMPERATURE = set()  # models whose API rejects the `temperature` param


def sampling_of(model):
    """(temperature actually sent, whether sampling was pinned) for `model`.

    ⚠ RECORDED PER ROW BECAUSE IT WAS INFERRED FROM A JSON ESCAPING BUG ONCE.
    Session 27 established that M1 is the only model still accepting
    temperature=0 — and established it by noticing O040 reproduced byte for
    byte across two runs. Every delta attributed to M2 and M3 since then has
    carried an unmeasured variance component that nothing in the log recorded.
    NO_TEMPERATURE is populated at RUN TIME, on the first 400 from each model,
    so this must be read AFTER a row's calls have returned, not before.

    `deterministic` means "temperature=0 was sent and accepted", not "the output
    is guaranteed reproducible". It is a statement about the request.
    """
    pinned = model not in NO_TEMPERATURE
    return (0 if pinned else None), pinned

# Headers of the most recent successful call. Anthropic stamps `request-id` on
# every response, errors included; the Cowork sandbox's egress layer does not.
# So its PRESENCE is the one-look discriminator between "the API answered" and
# "something in front of the API answered", which is why smoke checks it rather
# than trusting a 200. Calls are sequential, so a single slot is safe.
LAST_HEADERS = {}

def call_model(key, model, system_prompt, sentence):
    body = {
        "model": model,
        # 8000, was 2048 (Aug 2). The Claude 5 family spends adaptive-thinking
        # tokens INSIDE this budget, so 2048 truncated 35/150 calls mid-JSON on
        # Aug 15 2026 — parse failures, silently skipped by the run loop.
        # Priced per token actually used, so the headroom costs nothing.
        "max_tokens": 8000,
        "system": [{"type": "text", "text": system_prompt,
                    "cache_control": {"type": "ephemeral"}}],
        "messages": [{"role": "user", "content": sentence}],
    }
    # temperature 0 was the Aug 2 2026 determinism choice. The Claude 5 family
    # rejects the param outright (400: "`temperature` is deprecated for this
    # model", found in smoke Aug 14 2026), so those models run at their API
    # default — which is also how production would call them.
    if model not in NO_TEMPERATURE:
        body["temperature"] = 0
    req = urllib.request.Request(
        API, data=json.dumps(body).encode(), method="POST",
        headers={"x-api-key": key, "anthropic-version": "2023-06-01",
                 "content-type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            LAST_HEADERS.clear()
            LAST_HEADERS.update({k.lower(): v for k, v in r.headers.items()})
            return json.load(r)
    except urllib.error.HTTPError as e:
        # Surface the API's own error message — a bare "400 Bad Request"
        # traceback (smoke, Aug 14 2026) says nothing about WHICH field the
        # API rejected. The body always does. The key is never in the body.
        detail = e.read().decode("utf-8", "replace")
        if (e.code == 400 and "temperature" in detail
                and model not in NO_TEMPERATURE):
            NO_TEMPERATURE.add(model)
            print(f"  note: {model} rejects `temperature` — "
                  f"retrying without it (model-default sampling)")
            return call_model(key, model, system_prompt, sentence)
        sys.exit(f"\nAPI error {e.code} from model {model}:\n{detail}\n"
                 "Nothing was lost — completed calls are in bakeoff-log.jsonl; "
                 "re-run the same command to resume.")

def extract_json(text):
    """Return the FIRST JSON object in `text`, ignoring anything after it.

    Aug 15 2026 (Session 16), diagnosed by running E20 through Haiku 8 times:
    4 succeeded, 4 failed, all four the same way. Haiku emits a valid fenced
    JSON block and then KEEPS TALKING — a paragraph of plain-English commentary
    after the closing fence, restating the verdict. Output was 112–372 tokens,
    nowhere near the 8000 cap, so this was never truncation, and the JSON
    itself was always well-formed.

    The old line stripped fence MARKERS (`^```(json)?|```$`) and handed the
    whole remainder to json.loads, which then died on "Extra data: line 15
    column 1" — the trailing prose. Four perfectly good analyses were thrown
    away and recorded as failures.

    raw_decode is the fix: it parses one JSON value and reports where it
    ended, ignoring everything after. Robust against trailing prose, a second
    fence, or a sign-off, from any model.

    Worth stating plainly because it nearly went into the bake-off verdict as a
    model defect: this was OUR bug. The prompt does say "no markdown fences",
    and Haiku obeys that less strictly than Sonnet or Opus — a real but minor
    instruction-following difference. It is not "returns unparseable JSON", and
    it is not disqualifying.
    """
    start = text.find("{")
    if start == -1:
        raise ValueError(f"no JSON object in model output: {text[:200]!r}")
    obj, _end = json.JSONDecoder().raw_decode(text[start:])
    return obj

def log_parse_failure(exc, resp, **ident):
    """Persist the RAW response body when parsing it fails, and say so loudly.

    WHY THIS EXISTS. Session 16 burned four retry rounds on E20×M1 with nothing
    to look at. The run loop printed `FAILED — Extra data: line 15 column 1` and
    dropped the response on the floor, so each retry was blind: the same call,
    the same useless message, no way to tell truncation from trailing prose from
    a refusal. The cause (Haiku emitting valid fenced JSON and then a paragraph
    of English commentary) was only found by calling the API by hand, eight
    times, OUTSIDE the harness — reproducing from scratch what the harness had
    held in memory and discarded on every one of those rounds.

    A repeated failure that produces no diagnostic is itself a defect, separate
    from whatever caused it. So the body is now durable BEFORE anything is
    printed, and the whole body is kept, not an excerpt: the interesting part of
    "Extra data: line 15" is what sits AFTER the JSON ends, and the interesting
    part of a truncation is where it stopped. An excerpt from the head would
    have hidden the Session 16 bug specifically.

    `stop_reason` is the one field that separates the two big causes at a
    glance — `max_tokens` means truncation, `end_turn` means the model finished
    and said something extra — so it is printed as well as stored.

    The key cannot appear here: it is a request header and is never echoed in a
    response body.
    """
    text = "".join(b.get("text", "") for b in (resp or {}).get("content", []))
    rec = {
        "ts": time.strftime("%Y-%m-%dT%H:%M:%S"),
        **ident,
        "error": str(exc),
        "error_type": type(exc).__name__,
        "model_answered": (resp or {}).get("model", ""),
        "stop_reason": (resp or {}).get("stop_reason"),
        "usage": (resp or {}).get("usage", {}),
        "text": text,          # concatenated text blocks — what the parser saw
        "response": resp,      # the entire envelope, thinking blocks included
    }
    try:
        with FAIL_LOG.open("a", encoding="utf-8") as f:
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")
            f.flush()
        where = f"raw body appended to {FAIL_LOG.name}"
    except Exception as e:  # never let diagnostics be the thing that kills a run
        where = f"COULD NOT WRITE {FAIL_LOG.name} ({e}) — body below is all there is"

    u = rec["usage"] or {}
    head, tail = text[:300], text[-300:] if len(text) > 600 else ""
    print(f"      stop_reason={rec['stop_reason']} · "
          f"out {u.get('output_tokens')} tok · {len(text)} chars · {where}")
    print(f"      head: {head!r}")
    if tail:
        print(f"      tail: {tail!r}")


def verdict_of(data):
    types = [i.get("type") for i in data.get("issues", [])]
    return ("FIX" if "fix" in types else
            "UNNATURAL" if "unnatural" in types else
            "WORTH KNOWING" if "note" in types else "NONE")


def render_feedback(data):
    """Build the Blind Grading feedback cell from a parsed response.

    Split out of parse_issues in Session 27: under --two-pass the rewrite
    arrives from a SECOND call, after this text would already have been built,
    so the cell has to be rebuildable from updated data rather than assembled
    once on the way past.
    """
    lines = [data.get("overall", {}).get("summary", "")]
    for i in data.get("issues", []):
        lines.append(f"[{i.get('type','?').upper()}] {i.get('span','')} → "
                     f"{i.get('correction','')} — {i.get('explanation','')}")
    rw = data.get("model_rewrite")
    if rw:
        lines.append(f"Rewrite: {rw}")
    return "\n".join(l for l in lines if l)


def parse_issues(resp):
    text = "".join(b.get("text", "") for b in resp.get("content", []))
    data = extract_json(text)
    return verdict_of(data), render_feedback(data), data

# ---------- main ----------
def main():
    mode = next((a for a in ("--dry-run", "--smoke", "--run") if a in sys.argv), None)
    if not mode:
        sys.exit(__doc__)
    two_pass = "--two-pass" in sys.argv
    stamp = next((a.split("=", 1)[1] for a in sys.argv
                  if a.startswith("--schema-stamp=")), None)
    if stamp is not None and not stamp.strip():
        sys.exit("--schema-stamp= needs a value, e.g. --schema-stamp=naoshi-4r1")
    if stamp and two_pass:
        sys.exit("--schema-stamp and --two-pass both set the stamp; pick one.")
    system_prompt, schema = load_prompt()
    prompt_md5 = hashlib.md5(system_prompt.encode("utf-8")).hexdigest()
    rewrite_md5 = hashlib.md5(REWRITE_SYSTEM_PROMPT.encode("utf-8")).hexdigest()
    jsx_schema = schema
    if two_pass:
        schema = TWO_PASS_SCHEMA
    elif stamp:
        schema = stamp
    wb, sentences, models, plan = load_workbook_data()
    runnable = [p for p in plan if p[2] in sentences]
    print(f"prompt {schema} · {len(sentences)} sentences · {len(models)} models · "
          f"{len(runnable)}/{len(plan)} blind-grading rows runnable")
    if stamp:
        print(f"  STAMPED {schema} · the prompt is the jsx's {jsx_schema}, "
              f"unchanged (md5 {prompt_md5[:8]})")
        if stamp == jsx_schema:
            print("  ⚠ the stamp equals the jsx's own version, so this run will "
                  "resume the existing rows rather than produce new ones.")
    if two_pass:
        print(f"  TWO-PASS · pass 1 = {jsx_schema} (md5 {prompt_md5[:8]}) · "
              f"pass 2 = rewrite-only (md5 {rewrite_md5[:8]})")
        print(f"  rows stamped {schema}; the jsx keeps {jsx_schema}, which is "
              f"what its prompt still is")

    if mode == "--dry-run":
        per_row = 2 if two_pass else 1
        for code, (mstr, cin, cout) in models.items():
            n = sum(1 for p in runnable if p[3] == code)
            print(f"  {code} → {mstr} (${cin}/${cout} per MTok): "
                  f"{n * per_row} calls ({n} rows × {per_row})")
        if not runnable:
            print("Eval Set has no sentences yet — fill column D first.")
        # THE RESUME SET, SHOWN. The Session 24 bug was a silent no-op that
        # impersonated a measurement: 150 rows "already logged", zero calls
        # made, the workbook rewritten from the previous prompt's outputs. It
        # was invisible in --dry-run because --dry-run never looked at the log.
        # It does now — and with a THIRD generation in the file the filter has
        # to separate three as cleanly as it separated two.
        by_schema, done_here = {}, set()
        if LOG.exists():
            for line in LOG.read_text(encoding="utf-8").splitlines():
                try:
                    rec = json.loads(line)
                except Exception:
                    continue
                sc = rec.get("schema", "<unstamped>")
                by_schema[sc] = by_schema.get(sc, 0) + 1
                if sc == schema:
                    done_here.add(rec.get("output_id"))
        print("  log holds " + str(sum(by_schema.values())) + " record(s): "
              + ", ".join(f"{k} {v}" for k, v in sorted(by_schema.items())))
        todo = [o for _, o, *_ in runnable if o not in done_here]
        print(f"  under {schema}: {len(done_here)} already logged, "
              f"{len(todo)} to call → {len(todo) * per_row} API calls")
        if done_here and todo:
            print("  (a partial resume — expected only if a previous run of "
                  "THIS schema stopped early)")
        return

    key = os.environ.get("ANTHROPIC_API_KEY")
    if not key:
        sys.exit("ANTHROPIC_API_KEY is not set. Set it inline for one command; "
                 "never paste it into a file or chat.")

    if mode == "--smoke" and two_pass:
        # §4 of the Session 27 brief: five REAL plan rows, not one synthetic
        # sentence. It has to show three things before ~$6 is spent — that the
        # calls reach Anthropic, that pass 2 receives a genuine issues array
        # rather than an empty one, and that pass 2's output parses — and then
        # price the full run off measured tokens.
        #
        # SMOKE MUST NOT WRITE TO bakeoff-log.jsonl. The resume set is built
        # from that file, so a smoked row would be skipped by the real run and
        # go missing from the measurement while reading as complete.
        sample = runnable[:5]
        print(f"smoke (two-pass) — {len(sample)} real rows, {len(sample) * 2} calls\n")
        rows, unparseable, no_request_id, issue_counts = [], [], [], []
        for rowno, oid, eid, code in sample:
            mstr = models[code][0]
            cin, cout = models[code][1], models[code][2]
            resp = call_model(key, mstr, system_prompt, sentences[eid])
            rid1 = LAST_HEADERS.get("request-id", "")
            if not rid1:
                no_request_id.append(f"{oid} pass 1")
            try:
                verdict, _, data = parse_issues(resp)
            except Exception as e:
                print(f"  {oid} ({eid}×{code}): PASS-1 UNPARSEABLE — {e}")
                log_parse_failure(e, resp, output_id=f"SMOKE-{oid}", eval_id=eid,
                                  model_code=code, model_requested=mstr, pass_no=1)
                unparseable.append(f"{oid} pass 1")
                continue
            applied, content2 = rewrite_user_content(sentences[eid],
                                                     data.get("issues", []))
            resp2 = call_model(key, mstr, REWRITE_SYSTEM_PROMPT, content2)
            rid2 = LAST_HEADERS.get("request-id", "")
            if not rid2:
                no_request_id.append(f"{oid} pass 2")
            try:
                new_rw = extract_rewrite(resp2)
            except Exception as e:
                print(f"  {oid} ({eid}×{code}): PASS-2 UNPARSEABLE — {e}")
                log_parse_failure(e, resp2, output_id=f"SMOKE-{oid}", eval_id=eid,
                                  model_code=code, model_requested=mstr, pass_no=2)
                unparseable.append(f"{oid} pass 2")
                continue
            u1, u2 = resp.get("usage", {}), resp2.get("usage", {})
            c = call_cost(u1, cin, cout) + call_cost(u2, cin, cout)
            rows.append((code, c))
            issue_counts.append(len(applied))
            old_rw = data.get("model_rewrite") or ""
            print(f"  {oid} ({eid}×{code}): {verdict} · {len(applied)} issue(s) "
                  f"to pass 2 · req-id {'yes' if rid1 and rid2 else 'NO'} · "
                  f"${c:.4f}")
            print(f"      source : {sentences[eid]}")
            print(f"      1-pass : {old_rw}")
            print(f"      2-pass : {new_rw}")
            print(f"      tokens : p1 in {u1.get('input_tokens')}"
                  f"/cache {u1.get('cache_read_input_tokens', 0)} out "
                  f"{u1.get('output_tokens')} · p2 in {u2.get('input_tokens')} "
                  f"out {u2.get('output_tokens')}")

        print()
        if no_request_id:
            sys.exit("smoke FAILED — no `request-id` header on: "
                     + ", ".join(no_request_id) + ".\nAnthropic stamps one on "
                     "every response. Its absence means something in front of "
                     "the API answered, NOT that the key is bad. Do not rotate "
                     "the key; run this outside the sandbox.")
        if unparseable:
            sys.exit(f"smoke FAILED — unparseable: {', '.join(unparseable)}. Raw "
                     f"bodies are in {FAIL_LOG.name}; read them before retrying.")
        if not rows:
            sys.exit("smoke FAILED — no row completed both passes.")
        # §4: "confirm call 2 receives a real issues array rather than an empty
        # one". If every sampled row sent zero issues, pass 2 was only ever
        # asked to echo its input, and a green smoke would say nothing about
        # the thing being tested.
        if not any(issue_counts):
            sys.exit("smoke FAILED — every sampled row sent pass 2 an EMPTY "
                     "issues array, so nothing exercised the actual change. "
                     "Re-run smoke (the plan is shuffled) or widen the sample.")
        print(f"  pass 2 issue counts across the sample: {issue_counts} "
              f"({sum(1 for c in issue_counts if c)} of {len(issue_counts)} "
              f"non-empty)")
        # Project the full run: per-model mean where sampled, overall mean
        # otherwise. Deliberately an OVER-estimate — these five rows pay cache
        # WRITES that the remaining 145 will pay as cache reads.
        overall = sum(c for _, c in rows) / len(rows)
        by_model = {}
        for code, c in rows:
            by_model.setdefault(code, []).append(c)
        projected = 0.0
        for code in models:
            cnt = sum(1 for r in runnable if r[3] == code)
            mean = (sum(by_model[code]) / len(by_model[code])
                    if code in by_model else overall)
            projected += cnt * mean
            print(f"  {code}: {cnt} rows × ${mean:.4f} mean "
                  f"({'sampled' if code in by_model else 'UNSAMPLED — overall mean'})")
        print(f"\n  smoke spend        ${sum(c for _, c in rows):.4f}")
        print(f"  PROJECTED FULL RUN ${projected:.2f}   (brief §5 estimate: ~$6)")
        if projected > 9:
            sys.exit(f"smoke STOP — ${projected:.2f} is materially past the ~$6 "
                     "estimate. An unexpected cost means an unexpected number "
                     "of calls, so the run would not be measuring what it "
                     "thinks. Brief §0 hard stop.")
        print("\nsmoke OK — both passes reached Anthropic and parsed.")
        return

    if mode == "--smoke":
        sent = next(iter(sentences.values()), "私は毎日私の犬と散歩します。")
        smoke_unparseable = []
        for code, (mstr, *_ ) in models.items():
            resp = call_model(key, mstr, system_prompt, sent)
            u = resp.get("usage", {})
            try:
                verdict, _, _ = parse_issues(resp)
            except Exception as e:
                # Smoke is where an unparseable response is CHEAPEST to
                # diagnose — one sentence, three calls. It used to die here on a
                # bare traceback with the body discarded, same as the run loop.
                print(f"  {code} {mstr}: UNPARSEABLE — {e}")
                log_parse_failure(e, resp, output_id=f"SMOKE-{code}",
                                  eval_id="SMOKE", model_code=code,
                                  model_requested=mstr)
                smoke_unparseable.append(code)
                continue
            print(f"  {code} {mstr}: {verdict} "
                  f"(in {u.get('input_tokens')}, out {u.get('output_tokens')}, "
                  f"cache-read {u.get('cache_read_input_tokens', 0)})")
        if smoke_unparseable:
            sys.exit(f"smoke FAILED — {', '.join(smoke_unparseable)} returned output "
                     f"this harness cannot parse. The raw bodies are in "
                     f"{FAIL_LOG.name}; read them before retrying, a blind retry "
                     f"tells you nothing new.")
        print("smoke OK — models answered under their own names.")
        return

    if not runnable:
        sys.exit("Nothing to run: Eval Set sentences are empty.")
    if "--key-verified" not in sys.argv:
        sys.exit("Refusing to run: pass --key-verified to assert the reviewer has "
                 "verified the answer key (README Step 2). Outputs produced before "
                 "key verification can leak into the key and compromise the blind.")

    # ⚠️ THE RESUME SET IS SCOPED TO THE CURRENT SCHEMA, AND IT WAS NOT.
    #
    # `done` used to be built from output_id alone. output_ids are O001…O150 and
    # do not vary with the prompt, so after a SYSTEM_PROMPT change the harness
    # would print "resuming — 150 rows already logged", make ZERO calls, exit
    # successfully, and rewrite the workbook from the OLD outputs. Every
    # downstream counter would then be identical to the baseline — which reads
    # exactly like "the prompt change did nothing", the one conclusion the
    # instrument exists to draw. A silent no-op that impersonates a measurement.
    #
    # Found Sep 6 2026 when naoshi-4 → naoshi-5 was about to be measured. The
    # harness already stamped `schema` on every row; the resume logic simply did
    # not read it. Same shape as the count-is-not-a-check finding in Session 23:
    # the evidence was present and nothing consulted it.
    done = set()
    other_schema = 0
    if LOG.exists():
        for line in LOG.read_text(encoding="utf-8").splitlines():
            try:
                rec = json.loads(line)
            except Exception:
                continue
            if rec.get("schema") == schema:
                done.add(rec["output_id"])
            else:
                other_schema += 1
        if done:
            print(f"resuming — {len(done)} rows already logged under {schema}")
        if other_schema:
            # Said out loud rather than skipped silently: these are a previous
            # prompt's outputs and they are being re-run ON PURPOSE.
            print(f"note — {other_schema} row(s) in the log came from a different "
                  f"prompt version and do NOT count as done; {schema} will be run fresh")

    usage = {c: [0, 0] for c in models}
    usage2 = {c: [0, 0] for c in models}   # pass 2, kept SEPARATE on purpose:
    # the product question is "what does the second pass add", and an aggregate
    # cannot answer it.
    results = {}
    failed = []
    parse_failed = []
    with LOG.open("a", encoding="utf-8") as log:
        for rowno, oid, eid, code in runnable:
            if oid in done:
                continue
            mstr = models[code][0]
            # The call and the parse are caught SEPARATELY. They fail for
            # unrelated reasons and need different evidence: a call failure is
            # fully described by its exception, while a parse failure is not
            # described by its exception at all — the useful evidence is the
            # body, which is why it is written out below.
            try:
                resp = call_model(key, mstr, system_prompt, sentences[eid])
            except Exception as e:
                print(f"  {oid} ({eid}×{code}): CALL FAILED — {e}")
                failed.append(oid)
                time.sleep(2)
                continue
            try:
                verdict, feedback, data = parse_issues(resp)
            except Exception as e:
                print(f"  {oid} ({eid}×{code}): UNPARSEABLE — {e}")
                log_parse_failure(e, resp, output_id=oid, eval_id=eid,
                                  model_code=code, model_requested=mstr)
                failed.append(oid)
                parse_failed.append(oid)
                time.sleep(2)
                continue
            answered = resp.get("model", "")
            if answered and not answered.startswith(mstr):
                sys.exit(f"ABORT at {oid}: requested {mstr}, answered {answered}. "
                         "A silent model substitution invalidates the whole run.")

            # ---- pass 2: the rewrite, from the finalised issues ----
            u2, applied, answered2, rewrite_pass1 = {}, [], "", None
            if two_pass:
                applied, content2 = rewrite_user_content(
                    sentences[eid], data.get("issues", []))
                # THE EMPTY ARRAY IS STILL SENT. Short-circuiting it to
                # "rewrite = source" would be cheaper and would guarantee the
                # NONE rows come out unchanged — which is precisely why it is
                # not done. SELF_INCONSISTENT is the decisive counter of this
                # run, and four of its baseline rows ARE none-but-changed
                # rows. Hard-coding those to pass would settle the decisive
                # test by construction instead of by measurement.
                try:
                    resp2 = call_model(key, mstr, REWRITE_SYSTEM_PROMPT, content2)
                except Exception as e:
                    print(f"  {oid} ({eid}×{code}): PASS-2 CALL FAILED — {e}")
                    failed.append(oid)
                    time.sleep(2)
                    continue
                answered2 = resp2.get("model", "")
                if answered2 and not answered2.startswith(mstr):
                    sys.exit(f"ABORT at {oid} pass 2: requested {mstr}, "
                             f"answered {answered2}. A silent model "
                             "substitution invalidates the whole run.")
                try:
                    new_rewrite = extract_rewrite(resp2)
                except Exception as e:
                    print(f"  {oid} ({eid}×{code}): PASS-2 UNPARSEABLE — {e}")
                    log_parse_failure(e, resp2, output_id=oid, eval_id=eid,
                                      model_code=code, model_requested=mstr,
                                      pass_no=2)
                    failed.append(oid)
                    parse_failed.append(oid)
                    time.sleep(2)
                    continue
                u2 = resp2.get("usage", {})
                usage2[code][0] += (u2.get("input_tokens", 0)
                                    + u2.get("cache_read_input_tokens", 0))
                usage2[code][1] += u2.get("output_tokens", 0)
                # Keep pass 1's own rewrite. It is a free within-row comparison
                # of the two architectures on an IDENTICAL diagnosis, which no
                # across-run comparison can give.
                rewrite_pass1 = data.get("model_rewrite")
                data = dict(data, model_rewrite=new_rewrite)
                feedback = render_feedback(data)   # verdict is set by the
                # issues, which pass 2 cannot touch, so it does not change.

            u = resp.get("usage", {})
            usage[code][0] += u.get("input_tokens", 0) + u.get("cache_read_input_tokens", 0)
            usage[code][1] += u.get("output_tokens", 0)
            rec = {
                "output_id": oid, "eval_id": eid, "model_code": code,
                "model_requested": mstr, "model_answered": answered,
                "schema": schema, "verdict": verdict, "feedback": feedback,
                "raw": data, "usage": u, "ts": time.strftime("%Y-%m-%dT%H:%M:%S"),
                # One stamp now covers TWO prompts. A schema string that cannot
                # tell you which two texts produced a row is the kind of record
                # this project has had to reconstruct before.
                "prompt_md5": prompt_md5,
            }
            temp, pinned = sampling_of(mstr)
            rec["temperature"], rec["deterministic"] = temp, pinned
            if two_pass:
                rec.update({
                    "two_pass": True,
                    "rewrite_prompt_md5": rewrite_md5,
                    "model_answered_pass2": answered2,
                    "usage_pass2": u2,
                    "rewrite_pass1": rewrite_pass1,
                    "issues_sent_to_pass2": len(applied),
                })
            log.write(json.dumps(rec, ensure_ascii=False) + "\n")
            log.flush()  # durable immediately
            results[oid] = (rowno, verdict, feedback)
            print(f"  {oid} ({eid}×{code}): {verdict}"
                  + (f" · {len(applied)} applied" if two_pass else ""))
            time.sleep(1)  # sequential, gently — a rate limit mid-run reads as model failure

    # Merge prior runs OF THIS SCHEMA into the output workbook copy. Filtering
    # here matters as much as it does in the resume set: without it a log holding
    # two prompt generations fills the workbook with whichever line was read
    # last, and the blind grading sheet would carry a mixture nobody could see.
    for line in LOG.read_text(encoding="utf-8").splitlines():
        try:
            rec = json.loads(line)
            if rec.get("schema") != schema:
                continue
            row = next((r for r, o, *_ in runnable if o == rec["output_id"]), None)
            if row:
                results[rec["output_id"]] = (row, rec["verdict"], rec["feedback"])
        except Exception:
            pass
    bg = wb["Blind Grading"]
    for oid, (rowno, verdict, feedback) in results.items():
        bg.cell(row=rowno, column=5, value=verdict)
        bg.cell(row=rowno, column=6, value=feedback)
    wb.save(WB_OUT)
    print(f"\nwrote {WB_OUT.name} ({len(results)} rows filled)")
    # Completion is judged against the PLAN, not against this run: failed
    # calls are skipped and unlogged, and on Aug 15 2026 a run with 35 skips
    # still ended on a message that read as success.
    missing = [o for _, o, *_ in runnable if o not in results]
    if missing:
        print(f"\n⚠️  RUN INCOMPLETE — {len(missing)} of {len(runnable)} rows "
              f"missing ({len(failed)} failed this run).")
        print("   Re-run this same command to retry ONLY the missing rows.")
        if parse_failed:
            # Say this here rather than only at the failure site: after 150 rows
            # of output the per-row line has scrolled away, and "re-run to
            # retry" on its own is what turned one parse bug into four blind
            # rounds.
            print(f"   {len(parse_failed)} of them returned output this harness "
                  f"could not parse: {', '.join(parse_failed)}.")
            print(f"   READ THE RAW BODIES FIRST — {FAIL_LOG.name}. Retrying an "
                  f"unparseable response without looking at it learns nothing.")
    else:
        print(f"\n✅ COMPLETE — all {len(runnable)} rows filled.")
    # Cumulative totals from the whole log — these are what the Results
    # sheet's yellow cells want (in = input + cache reads, per model).
    cum = {c: [0, 0] for c in models}
    cum2 = {c: [0, 0] for c in models}
    for line in LOG.read_text(encoding="utf-8").splitlines():
        try:
            rec = json.loads(line)
            if rec.get("schema") != schema:
                continue   # the yellow cells describe THIS prompt generation;
                # folding three generations together was never meaningful and
                # is actively misleading now that the log holds three.
            u = rec.get("usage", {})
            cum[rec["model_code"]][0] += (u.get("input_tokens", 0)
                                          + u.get("cache_read_input_tokens", 0) or 0)
            cum[rec["model_code"]][1] += u.get("output_tokens", 0)
            v = rec.get("usage_pass2") or {}
            if v:
                cum2[rec["model_code"]][0] += (v.get("input_tokens", 0)
                                               + v.get("cache_read_input_tokens", 0) or 0)
                cum2[rec["model_code"]][1] += v.get("output_tokens", 0)
        except Exception:
            pass
    print(f"Token totals for the Results sheet (input, output) — {schema} only:")
    for code, (tin, tout) in cum.items():
        if two_pass:
            t2in, t2out = cum2[code]
            print(f"  {code}: pass 1 {tin:,} in · {tout:,} out"
                  f"   |   pass 2 {t2in:,} in · {t2out:,} out"
                  f"   |   total {tin + t2in:,} in · {tout + t2out:,} out")
        else:
            print(f"  {code}: {tin:,} in · {tout:,} out")
    if two_pass:
        cost1 = sum(call_cost({"input_tokens": cum[c][0],
                               "output_tokens": cum[c][1]},
                              models[c][1], models[c][2]) for c in models)
        cost2 = sum(call_cost({"input_tokens": cum2[c][0],
                               "output_tokens": cum2[c][1]},
                              models[c][1], models[c][2]) for c in models)
        # Upper bound: every input token is priced as fresh, because the log
        # folds cache reads in with fresh input and cannot separate them after
        # the fact. The real bill is lower. Said out loud so this is not later
        # quoted as the measured spend.
        print(f"\n  cost UPPER BOUND (cache reads priced as fresh input): "
              f"pass 1 ${cost1:.2f} + pass 2 ${cost2:.2f} = ${cost1 + cost2:.2f}")

if __name__ == "__main__":
    main()
