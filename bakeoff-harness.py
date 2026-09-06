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
  1. Extracts SYSTEM_PROMPT live from naoshi-prototype.jsx (no drift — the
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

--run also requires --key-verified: per the README protocol, the reviewer must
verify the answer key (Step 2) BEFORE outputs exist, or they can leak into the
key. The flag is you asserting Step 2 is done.

Every log record carries model_requested AND model_answered (from the API
response envelope). If they ever differ the run aborts — that silent
substitution is exactly what the artifact proxy did for five sessions.
"""
import json, os, re, sys, time, pathlib, urllib.request

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

# ---------- prompt, straight from the checker file ----------
def load_prompt():
    src = (HERE / "naoshi-prototype.jsx").read_text(encoding="utf-8")
    schema = re.search(r'SCHEMA_VERSION = "([^"]+)"', src).group(1)
    m = re.search(r"const SYSTEM_PROMPT = `(.*?)`;", src, re.S)
    if not m:
        sys.exit("Could not extract SYSTEM_PROMPT from naoshi-prototype.jsx")
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


def parse_issues(resp):
    text = "".join(b.get("text", "") for b in resp.get("content", []))
    data = extract_json(text)
    issues = data.get("issues", [])
    types = [i.get("type") for i in issues]
    verdict = ("FIX" if "fix" in types else
               "UNNATURAL" if "unnatural" in types else
               "WORTH KNOWING" if "note" in types else "NONE")
    lines = [data.get("overall", {}).get("summary", "")]
    for i in issues:
        lines.append(f"[{i.get('type','?').upper()}] {i.get('span','')} → "
                     f"{i.get('correction','')} — {i.get('explanation','')}")
    rw = data.get("model_rewrite")
    if rw:
        lines.append(f"Rewrite: {rw}")
    return verdict, "\n".join(l for l in lines if l), data

# ---------- main ----------
def main():
    mode = next((a for a in ("--dry-run", "--smoke", "--run") if a in sys.argv), None)
    if not mode:
        sys.exit(__doc__)
    system_prompt, schema = load_prompt()
    wb, sentences, models, plan = load_workbook_data()
    runnable = [p for p in plan if p[2] in sentences]
    print(f"prompt {schema} · {len(sentences)} sentences · {len(models)} models · "
          f"{len(runnable)}/{len(plan)} blind-grading rows runnable")

    if mode == "--dry-run":
        for code, (mstr, cin, cout) in models.items():
            n = sum(1 for p in runnable if p[3] == code)
            print(f"  {code} → {mstr} (${cin}/${cout} per MTok): {n} calls")
        if not runnable:
            print("Eval Set has no sentences yet — fill column D first.")
        return

    key = os.environ.get("ANTHROPIC_API_KEY")
    if not key:
        sys.exit("ANTHROPIC_API_KEY is not set. Set it inline for one command; "
                 "never paste it into a file or chat.")

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
            u = resp.get("usage", {})
            usage[code][0] += u.get("input_tokens", 0) + u.get("cache_read_input_tokens", 0)
            usage[code][1] += u.get("output_tokens", 0)
            log.write(json.dumps({
                "output_id": oid, "eval_id": eid, "model_code": code,
                "model_requested": mstr, "model_answered": answered,
                "schema": schema, "verdict": verdict, "feedback": feedback,
                "raw": data, "usage": u, "ts": time.strftime("%Y-%m-%dT%H:%M:%S"),
            }, ensure_ascii=False) + "\n")
            log.flush()  # durable immediately
            results[oid] = (rowno, verdict, feedback)
            print(f"  {oid} ({eid}×{code}): {verdict}")
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
    for line in LOG.read_text(encoding="utf-8").splitlines():
        try:
            rec = json.loads(line)
            u = rec.get("usage", {})
            cum[rec["model_code"]][0] += (u.get("input_tokens", 0)
                                          + u.get("cache_read_input_tokens", 0) or 0)
            cum[rec["model_code"]][1] += u.get("output_tokens", 0)
        except Exception:
            pass
    print("Token totals for the Results sheet (input, output) — CUMULATIVE:")
    for code, (tin, tout) in cum.items():
        print(f"  {code}: {tin:,} in · {tout:,} out")

if __name__ == "__main__":
    main()
