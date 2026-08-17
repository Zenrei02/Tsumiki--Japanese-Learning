// Incremental extraction for the streaming checker — design v1, "Server: emit
// our own events, not Anthropic's".
//
// Two decoders live here, and they exist because a stream can be cut at any
// byte. Both are fed arbitrary chunks and both must behave identically to
// having received the whole thing at once. That is the entire contract, and it
// is what test-stream-extract.mjs beats on.
//
//   SseDecoder          bytes  → Anthropic SSE frames
//   JsonStreamExtractor text   → our own events, as each JSON value completes
//
// WHY NOT JUST BUFFER AND JSON.parse. Because you cannot parse a prefix, and
// the whole point is to show the learner something before the model has
// finished. The buffered path still exists (and still uses parsePayload) — this
// is the incremental sibling, not a replacement.
//
// WHAT THIS DELIBERATELY DOES NOT DO: it never sees, forwards or stores
// thinking deltas. Reasoning is not for the learner and is not the product, so
// `textDeltaOf` drops every block type except `text_delta` — the filter is here,
// at the boundary, rather than somewhere downstream where a later edit could
// forget it.

/** One decoded Server-Sent Event. `data` is still a raw string. */
export type SseFrame = { event: string; data: string };

/**
 * Anthropic's SSE stream → frames.
 *
 * ⚠️ THE MULTI-BYTE TRAP, which is the likeliest real bug in this whole file.
 * The payload is Japanese, so almost every interesting character is 3 bytes in
 * UTF-8, and a network chunk boundary lands mid-character routinely. Decoding
 * each chunk independently (`new TextDecoder().decode(chunk)`) yields U+FFFD
 * where the split happened — silent, permanent corruption of the learner's own
 * sentence, and it would show up as a span that no longer matches the input.
 *
 * ONE decoder instance, kept across pushes, with `{stream: true}`: it holds the
 * trailing partial sequence back until the continuation arrives. The same logic
 * applies one level up to lines — a frame can be split mid-line — so partial
 * lines stay in `buf` until their newline shows up.
 */
export class SseDecoder {
  // Deliberately ONE decoder for the life of the stream. See above.
  private decoder = new TextDecoder("utf-8");
  private buf = "";
  private event = "";
  private data: string[] = [];

  push(bytes: Uint8Array): SseFrame[] {
    this.buf += this.decoder.decode(bytes, { stream: true });
    return this.drain();
  }

  /** Call once the byte stream is finished, to surface anything still held. */
  flush(): SseFrame[] {
    this.buf += this.decoder.decode();
    // A well-formed stream ends with a blank line, so this is usually empty.
    // If the connection died mid-frame we deliberately do NOT emit the partial
    // frame — a half-frame is not data, and inventing one here is how a
    // truncated stream would start reading as a complete result.
    return this.drain();
  }

  private drain(): SseFrame[] {
    const frames: SseFrame[] = [];
    let nl: number;
    while ((nl = this.buf.indexOf("\n")) !== -1) {
      let line = this.buf.slice(0, nl);
      this.buf = this.buf.slice(nl + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);

      if (line === "") {
        if (this.data.length) {
          frames.push({
            event: this.event || "message",
            data: this.data.join("\n"),
          });
        }
        this.event = "";
        this.data = [];
        continue;
      }
      if (line.startsWith(":")) continue; // comment / keep-alive

      const colon = line.indexOf(":");
      const field = colon === -1 ? line : line.slice(0, colon);
      let value = colon === -1 ? "" : line.slice(colon + 1);
      if (value.startsWith(" ")) value = value.slice(1);

      if (field === "event") this.event = value;
      else if (field === "data") this.data.push(value);
    }
    return frames;
  }
}

/**
 * The text of a text delta, or null for everything else.
 *
 * Everything else INCLUDES `thinking_delta`. Dropping it here is a product
 * decision, not a parsing convenience: streaming raw model output to the
 * browser would leak reasoning the learner should never see, and would also
 * move span verification client-side. Both are refused in the design.
 */
export function textDeltaOf(frame: SseFrame): string | null {
  if (frame.event !== "content_block_delta") return null;
  try {
    const d = JSON.parse(frame.data);
    if (d?.delta?.type === "text_delta" && typeof d.delta.text === "string") {
      return d.delta.text;
    }
  } catch {
    // A frame we cannot read is not fatal on its own; the extractor will fail
    // loudly later if the JSON it was carrying actually mattered.
  }
  return null;
}

/** Pull the bits of the envelope the `done` event needs. */
export function envelopeOf(
  frame: SseFrame,
): { model?: string; usage?: unknown; stopReason?: string } | null {
  if (frame.event !== "message_start" && frame.event !== "message_delta") {
    return null;
  }
  try {
    const d = JSON.parse(frame.data);
    if (frame.event === "message_start") {
      return { model: d?.message?.model, usage: d?.message?.usage };
    }
    return { usage: d?.usage, stopReason: d?.delta?.stop_reason };
  } catch {
    return null;
  }
}

// ── the JSON extractor ──────────────────────────────────────────────────────

export type ExtractEvent =
  | { type: "overall"; value: unknown }
  | { type: "issue"; value: unknown; index: number }
  | { type: "model_rewrite"; value: unknown }
  | { type: "readings"; value: unknown };

type State =
  | "before-root"
  | "expect-key"
  | "in-key"
  | "expect-colon"
  | "expect-value"
  | "in-container-value"
  | "in-string-value"
  | "in-scalar-value"
  | "in-array"
  | "in-element-container"
  | "in-element-string"
  | "in-element-scalar"
  | "after-root";

const WS = new Set([" ", "\t", "\n", "\r"]);

/**
 * A resumable scanner over the model's JSON object.
 *
 * It is the `parsePayload` brace-walker in index.ts turned inside out: same
 * depth tracking, same "skip string contents so a `{` inside an explanation
 * cannot close an object early" rule, but with every piece of state in a field
 * instead of a local, so it can stop mid-value and pick up when the next chunk
 * lands.
 *
 * Boundaries are found by walking; the VALUES are still handed to JSON.parse.
 * That split is on purpose — hand-rolling number and escape parsing would be a
 * second JSON implementation to get subtly wrong, and the walker only has to be
 * right about where a value starts and ends.
 *
 * Emits as each top-level value closes, and — for `issues` — as each ELEMENT
 * closes, which is what lets issues render one at a time. Key order is not
 * assumed: the prompt fixes it as overall → issues → model_rewrite → readings,
 * but nothing here depends on that, so a prompt edit cannot silently break it.
 *
 * Content past the closing brace is ignored, exactly like `parsePayload`. That
 * is the 0ffe23d fix: a model may emit valid JSON and then keep talking, and
 * four good analyses were once thrown away because of it.
 */
export class JsonStreamExtractor {
  private buf = "";
  private pos = 0;
  private state: State = "before-root";
  private key = "";
  private keyStart = 0;
  private valueStart = 0;
  private depth = 0;
  private inString = false;
  private escaped = false;
  private elementIndex = 0;
  private readonly arrayKey: string;

  constructor(opts: { arrayKey?: string } = {}) {
    this.arrayKey = opts.arrayKey ?? "issues";
  }

  /** Feed decoded text. Returns whatever became complete because of it. */
  push(chunk: string): ExtractEvent[] {
    this.buf += chunk;
    const out: ExtractEvent[] = [];
    this.run(out);
    return out;
  }

  /**
   * Did the root object actually close?
   *
   * The caller MUST check this. A stream that stops early leaves a
   * syntactically incomplete object, and the whole reason the streaming design
   * insists on a terminal `done` event is that "ended early" must never be
   * presentable as "found nothing".
   */
  get complete(): boolean {
    return this.state === "after-root";
  }

  /** Everything received, for logging a failure the way the harness now does. */
  get raw(): string {
    return this.buf;
  }

  private run(out: ExtractEvent[]): void {
    while (this.pos < this.buf.length) {
      const ch = this.buf[this.pos];

      switch (this.state) {
        case "before-root":
          // Skip a ```json fence, a preamble, anything. First brace wins.
          if (ch === "{") this.state = "expect-key";
          this.pos++;
          break;

        case "expect-key":
          if (ch === "}") {
            this.state = "after-root";
            this.pos++;
          } else if (ch === '"') {
            this.keyStart = this.pos;
            this.escaped = false;
            this.state = "in-key";
            this.pos++;
          } else {
            this.pos++; // whitespace or a comma between members
          }
          break;

        case "in-key":
          if (this.escaped) {
            this.escaped = false;
          } else if (ch === "\\") {
            this.escaped = true;
          } else if (ch === '"') {
            this.key = JSON.parse(
              this.buf.slice(this.keyStart, this.pos + 1),
            ) as string;
            this.state = "expect-colon";
          }
          this.pos++;
          break;

        case "expect-colon":
          if (ch === ":") this.state = "expect-value";
          this.pos++;
          break;

        case "expect-value":
          if (WS.has(ch)) {
            this.pos++;
            break;
          }
          if (this.key === this.arrayKey && ch === "[") {
            this.state = "in-array";
            this.pos++;
            break;
          }
          this.valueStart = this.pos;
          if (ch === "{" || ch === "[") {
            this.depth = 0;
            this.inString = false;
            this.escaped = false;
            this.state = "in-container-value";
          } else if (ch === '"') {
            this.escaped = false;
            this.state = "in-string-value";
            this.pos++;
          } else {
            this.state = "in-scalar-value";
          }
          break;

        case "in-container-value":
          if (this.stepContainer()) {
            this.emitKeyed(out, this.buf.slice(this.valueStart, this.pos));
            this.state = "expect-key";
          }
          break;

        case "in-string-value":
          if (this.escaped) {
            this.escaped = false;
            this.pos++;
          } else if (ch === "\\") {
            this.escaped = true;
            this.pos++;
          } else if (ch === '"') {
            this.pos++;
            this.emitKeyed(out, this.buf.slice(this.valueStart, this.pos));
            this.state = "expect-key";
          } else {
            this.pos++;
          }
          break;

        case "in-scalar-value":
          // Numbers, true/false/null. Terminated by the next member or the end
          // of the root object; neither is consumed here — "expect-key" owns
          // both, so there is one place that understands `,` and `}`.
          if (ch === "," || ch === "}") {
            this.emitKeyed(
              out,
              this.buf.slice(this.valueStart, this.pos).trim(),
            );
            this.state = "expect-key";
          } else {
            this.pos++;
          }
          break;

        case "in-array":
          if (ch === "]") {
            this.state = "expect-key";
            this.pos++;
          } else if (WS.has(ch) || ch === ",") {
            this.pos++;
          } else {
            this.valueStart = this.pos;
            if (ch === "{" || ch === "[") {
              this.depth = 0;
              this.inString = false;
              this.escaped = false;
              this.state = "in-element-container";
            } else if (ch === '"') {
              this.escaped = false;
              this.state = "in-element-string";
              this.pos++;
            } else {
              this.state = "in-element-scalar";
            }
          }
          break;

        case "in-element-container":
          if (this.stepContainer()) {
            this.emitElement(out, this.buf.slice(this.valueStart, this.pos));
            this.state = "in-array";
          }
          break;

        case "in-element-string":
          if (this.escaped) {
            this.escaped = false;
            this.pos++;
          } else if (ch === "\\") {
            this.escaped = true;
            this.pos++;
          } else if (ch === '"') {
            this.pos++;
            this.emitElement(out, this.buf.slice(this.valueStart, this.pos));
            this.state = "in-array";
          } else {
            this.pos++;
          }
          break;

        case "in-element-scalar":
          if (ch === "," || ch === "]") {
            const raw = this.buf.slice(this.valueStart, this.pos).trim();
            if (raw) this.emitElement(out, raw);
            this.state = "in-array";
          } else {
            this.pos++;
          }
          break;

        case "after-root":
          // Trailing prose, a second fence, a sign-off. Discarded, same as the
          // buffered parser does.
          this.pos = this.buf.length;
          break;
      }
    }
  }

  /**
   * Advance one character inside a container, returning true when it closed.
   *
   * The string handling is the load-bearing part: an explanation containing a
   * `}` — and Japanese grammar explanations do quote braces and brackets —
   * would otherwise close the object early and truncate the issue.
   */
  private stepContainer(): boolean {
    const ch = this.buf[this.pos];
    this.pos++;

    if (this.escaped) {
      this.escaped = false;
      return false;
    }
    if (ch === "\\") {
      if (this.inString) this.escaped = true;
      return false;
    }
    if (ch === '"') {
      this.inString = !this.inString;
      return false;
    }
    if (this.inString) return false;

    if (ch === "{" || ch === "[") {
      this.depth++;
      return false;
    }
    if (ch === "}" || ch === "]") {
      this.depth--;
      return this.depth === 0;
    }
    return false;
  }

  private emitKeyed(out: ExtractEvent[], raw: string): void {
    const value = this.parseOrThrow(raw, `value of "${this.key}"`);
    if (this.key === "overall") out.push({ type: "overall", value });
    else if (this.key === "model_rewrite") {
      out.push({ type: "model_rewrite", value });
    } else if (this.key === "readings") out.push({ type: "readings", value });
    // Any other key is consumed and ignored — an added field must not break
    // the stream.
  }

  private emitElement(out: ExtractEvent[], raw: string): void {
    out.push({
      type: "issue",
      value: this.parseOrThrow(raw, `${this.arrayKey}[${this.elementIndex}]`),
      index: this.elementIndex++,
    });
  }

  /**
   * Throw rather than skip. If the walker found a complete value and JSON
   * refuses it, either the model emitted malformed JSON or this scanner has a
   * bug — both are worth surfacing as an error the learner can see, and
   * swallowing it would produce a check that quietly returns less than it
   * found. That silent-partial-result failure is the one this product exists
   * to avoid.
   */
  private parseOrThrow(raw: string, what: string): unknown {
    try {
      return JSON.parse(raw);
    } catch (e) {
      throw new Error(`could not parse ${what}: ${e} · raw=${raw.slice(0, 200)}`);
    }
  }
}
