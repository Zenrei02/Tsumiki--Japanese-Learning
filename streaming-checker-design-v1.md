# Streaming the checker — design v1

*Session 16, Aug 15 2026. Design only; implementation goes to Claude Code.*

## The problem

A real check took **~70 seconds** boot-to-shutdown on the first browser request.
The bake-off's Sonnet median was ~16s and p90 ~41s, so 70s is the upper end but
not an outlier. Sonnet averaged **1,656 output tokens** per check, of which
several hundred are thinking the learner never sees.

Seventy seconds of spinner is not a product. The learner has no way to tell a
slow check from a broken one — and this app already had that exact failure mode
flagged as the thing that must never happen ("a checker that fails invisibly is
indistinguishable from one that found no errors").

## What this changes and what it must not

**Total time does not improve.** The model takes as long as it takes. What
improves is **time-to-first-useful-thing**: the naturalness score and summary
land early, then issues appear one at a time.

**This must not invalidate the bake-off.** Same model, same prompt, same
`max_tokens`, same everything except `stream: true`. The generated tokens are
identical; only delivery changes. Contrast with the two changes deliberately
deferred until after the GO/TUNE verdict:

- the `effort` parameter (would genuinely change what the model produces)
- the tool `input_schema` output mechanism (would change the request shape)

Streaming is safe to do now precisely because it changes neither.

## Order of arrival, and the one thing that hurts

The prompt fixes the JSON key order:

```
overall → issues[] → model_rewrite → readings
```

That order is lucky for three of four fields and awkward for the fourth.
`overall` is the cheapest, most reassuring thing to show and it arrives first.
Issues arrive in document order, which is the order they should render.

**`readings` arrives last, and furigana needs it.** Do not fix this by
reordering the prompt — that changes what the bake-off measured, for a cosmetic
gain. Instead: render text without ruby, and apply furigana when `readings`
lands. The furigana toggle should start **visually off and disabled** with a
quiet "furigana loading" state, flipping to the user's preference once the map
arrives. A reflow that adds ruby to already-correct text is acceptable; ruby
that pops in half-formed is not.

## Server: emit our own events, not Anthropic's

Do **not** proxy the upstream SSE to the browser. Two reasons, and the first is
non-negotiable:

1. **Span verification must stay server-side.** The whole guarantee is that
   `start`/`end` were checked character-for-character against the submitted
   text. Streaming raw model output to the client would move that into the
   browser, or drop it.
2. Thinking deltas would leak reasoning to the client. It is not for the
   learner and it is not the product.

So the endpoint consumes Anthropic's stream, and emits its own:

```
event: overall   data: {"natural_score":3,"summary":"..."}
event: issue     data: {"span":"私の","start":4,"end":6,"located":true,...}
event: rewrite   data: {"model_rewrite":"..."}
event: readings  data: {"readings":[["毎日","まいにち"]]}
event: done      data: {"schema":"naoshi-4","model":"...","verdict":"FIX",
                        "spans":{...},"cap":{...},"usage":{...}}
event: error     data: {"error":"upstream-timeout"}
```

The client stays dumb: it renders what it is handed and never computes an
offset. Same contract as today, delivered in pieces.

### Incremental extraction

The hard part is that you cannot `JSON.parse` a prefix. The existing
`parsePayload` brace-walker already has the right machinery — depth tracking
that skips string contents so a `{` inside an explanation cannot close an
object early. Extend it into a stateful scanner:

- Feed it each text delta; it appends to a buffer and advances.
- When the value for `overall` closes → emit `overall`.
- Inside the `issues` array, each time depth returns to array level → one
  complete issue object → place its span → emit `issue`.
- Same for `model_rewrite` and `readings`.

**Span claiming is unaffected.** `placeSpans` is greedy in model order and
claims ranges as it goes, so placing issues one at a time as they arrive gives
byte-identical results to placing them in a batch. Verify this with a test that
runs the same issue list both ways and asserts equality — it is the assumption
the whole design rests on.

### Failure mid-stream

Once headers are sent the status code is fixed at 200, so **errors after that
point must be in-band** (`event: error`). The client must treat a stream that
ends without `done` as a failure, not as a short result — otherwise a dropped
connection reads as "no issues found", which is the confusion this product
exists to avoid.

### The cap

`reserve()` still runs **before** the upstream call, unchanged. On failure:

- Failed **before any content was emitted** → `release()`, as today.
- Failed **after** content was emitted → **do not release.** The learner got
  something and tokens were spent. Counting it is correct.

## Client changes

`result` stops being one object set once and becomes incremental state:

```js
const [overall, setOverall] = useState(null);
const [issues, setIssues] = useState([]);      // appended
const [rewrite, setRewrite] = useState("");
const [readings, setReadings] = useState(null); // null until it lands
const [phase, setPhase] = useState("idle");     // idle|waiting|streaming|done|error
```

Use `fetch` with a `ReadableStream` reader rather than `EventSource` —
`EventSource` cannot POST.

**Keep rendering against the submitted text**, not the textarea's current
contents. That is already true today and matters more now: the learner has 70
seconds in which to keep typing.

**The waiting state should say what is happening**, not spin. Before `overall`
arrives there is genuinely nothing to show, so that first stretch still needs
honest copy — "Reading it properly. This usually takes under a minute." No fake
progress bar; the model gives no progress signal and inventing one is a lie.

## What to test

Chunk boundaries are where streaming parsers die. The extractor needs its own
test file alongside `test-spans.mjs`, fed recorded deltas split at hostile
points:

- mid-key, mid-value, mid-escape sequence (`\"`, `\\`)
- a split inside a multi-byte character — **UTF-8 boundaries in Japanese text
  are the likeliest real bug.** Decode with a streaming `TextDecoder`
  (`{stream: true}`), never per-chunk.
- `{` or `}` inside an explanation string
- a stream that ends early, mid-issue → must surface as an error
- zero issues → `overall`, then straight to `rewrite`/`done`

Plus the equality test named above: incremental placement == batch placement.

## Keep the non-streaming path

`stream: true` should be a request flag, not a replacement. The buffered path
stays because:

- `bakeoff-harness.py` must keep making the request that was measured.
- It is the fallback if streaming misbehaves in a browser we cannot test.
- It is far easier to curl when debugging.

Two code paths is a real cost. It is worth it while the eval is still open.

## Scope estimate

Endpoint is the bulk of it — the extractor and its tests. The module is a
moderate refactor of one component. Not a small change; roughly a session.

**Do it after the reviewer forms go out**, not before. The forms are the
critical path to the GO/TUNE verdict and nothing here helps them.
