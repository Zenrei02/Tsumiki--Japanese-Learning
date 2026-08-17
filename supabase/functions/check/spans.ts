// Span verification — the engineering rule from the project breakdown, in code.
//
// "Verify that every returned span exists character-for-character in the input,
//  and fall back gracefully when it does not — models occasionally paraphrase
//  spans."
//
// The failure this prevents is specific and nasty: an unverified span gets
// highlighted at whatever offset indexOf happens to return, so the learner sees
// the explanation attached to the WRONG characters. For a tool whose whole
// value is "here is where you went wrong", pointing at the wrong place is worse
// than saying nothing. A learner cannot catch it — that is why they came.
//
// So: locate every span exactly, or mark it unlocatable and let the UI render
// it as a card with no highlight. Never guess an offset.

export type RawIssue = {
  span?: string;
  category?: string;
  type?: string;
  correction?: string;
  explanation?: string;
  pattern_name?: string;
  jlpt?: string;
};

export type PlacedIssue = RawIssue & {
  /** Index into the original text, or -1 when the span could not be placed. */
  start: number;
  /** Exclusive end index, or -1. */
  end: number;
  /** False when the span was not found verbatim, or lost an overlap contest. */
  located: boolean;
  /** Why it is not located, for logging and for the UI's honesty. */
  reason?: "not-found" | "empty" | "overlap";
};

export type SpanReport = {
  issues: PlacedIssue[];
  /** Counts worth logging: a rising notFound rate is a prompt regression. */
  stats: { total: number; located: number; notFound: number; overlapped: number };
};

/**
 * Place each issue's span in `text` — the claiming state machine, as an object
 * you can feed one issue at a time.
 *
 * Occurrences are claimed greedily in the order the model returned them, and a
 * claimed stretch is never reused. That matters because a span like "は" occurs
 * many times: without claiming, three separate は issues would all highlight
 * the first one and the learner would see one character wearing three
 * explanations while the actual sites went unmarked.
 *
 * The prompt forbids overlapping and nested spans, so an overlap means the
 * model broke its contract. We keep the earlier issue and demote the later one
 * to an unhighlighted card rather than dropping it — it may still be correct
 * advice, and silently discarding model output is how a checker starts missing
 * real errors without anyone noticing.
 *
 * WHY IT IS A CLASS. The streaming endpoint places each issue the moment it
 * arrives, while the buffered endpoint places them all at once. The design's
 * central assumption is that those two produce identical placements — "placing
 * issues one at a time as they arrive gives byte-identical results to placing
 * them in a batch".
 *
 * That assumption holds only because claiming is greedy in model order and
 * never reconsiders: each issue takes the first unclaimed occurrence, so an
 * issue's outcome depends on the issues BEFORE it and never on the ones after.
 * Nothing about that requires the whole list up front.
 *
 * It would have been easy to write a second placer for the streaming path. Then
 * the equality test would be comparing two implementations that could drift
 * apart on any later edit, and passing would mean less each time. Instead
 * `placeSpans` is now a thin wrapper over this, so batch placement IS
 * incremental placement — and test-stream-extract.mjs still checks the equality
 * empirically, because a shared implementation is an argument and the test is
 * evidence.
 */
export class SpanPlacer {
  private readonly claimed: Array<[number, number]> = [];
  private total = 0;
  private located = 0;
  private notFound = 0;
  private overlapped = 0;

  constructor(private readonly text: string) {}

  /** Place one issue against the text, consuming the range it lands on. */
  place(issue: RawIssue): PlacedIssue {
    this.total++;
    const span = typeof issue.span === "string" ? issue.span : "";

    if (!span) {
      this.notFound++;
      return { ...issue, start: -1, end: -1, located: false, reason: "empty" };
    }

    // Walk every occurrence, take the first that is not already spoken for.
    let from = 0;
    let sawOccurrence = false;
    for (;;) {
      const at = this.text.indexOf(span, from);
      if (at === -1) break;
      sawOccurrence = true;
      const end = at + span.length;
      if (!this.overlaps(at, end)) {
        this.claimed.push([at, end]);
        this.located++;
        return { ...issue, start: at, end, located: true };
      }
      from = at + 1;
    }

    // Distinguish "the model invented a span" from "every occurrence was
    // already taken". They are different bugs: the first is a prompt problem,
    // the second is the no-overlap rule being broken.
    const reason = sawOccurrence ? "overlap" : "not-found";
    if (reason === "overlap") this.overlapped++;
    else this.notFound++;
    return { ...issue, start: -1, end: -1, located: false, reason };
  }

  get stats(): SpanReport["stats"] {
    return {
      total: this.total,
      located: this.located,
      notFound: this.notFound,
      overlapped: this.overlapped,
    };
  }

  private overlaps(a: number, b: number): boolean {
    return this.claimed.some(([s, e]) => a < e && s < b);
  }
}

export function placeSpans(text: string, issues: RawIssue[]): SpanReport {
  const placer = new SpanPlacer(text);
  const out = issues.map((issue) => placer.place(issue));

  // Render order is document order; unlocatable issues sort last so the
  // highlighted ones read top-to-bottom with the text.
  //
  // NOTE for the streaming path: this sort is a BATCH-ONLY step, and it is the
  // one thing that genuinely cannot be done incrementally — you cannot sort a
  // list you have not finished receiving. The stream therefore emits issues in
  // model order and the client renders them in arrival order. That is not a
  // discrepancy in placement: start/end/located/reason are identical either
  // way, which is what the equality test pins down. Only the order differs, and
  // the prompt already returns issues in document order.
  out.sort((a, b) => {
    if (a.located && b.located) return a.start - b.start;
    if (a.located) return -1;
    if (b.located) return 1;
    return 0;
  });

  return { issues: out, stats: placer.stats };
}

/**
 * Split `text` into rendering segments, so the UI never does index arithmetic.
 * Only located issues produce a marked segment; everything else is plain.
 */
export function segment(
  text: string,
  issues: PlacedIssue[],
): Array<{ text: string; issue: PlacedIssue | null }> {
  const marks = issues.filter((i) => i.located).sort((a, b) => a.start - b.start);
  const segments: Array<{ text: string; issue: PlacedIssue | null }> = [];
  let cursor = 0;
  for (const m of marks) {
    if (m.start > cursor) {
      segments.push({ text: text.slice(cursor, m.start), issue: null });
    }
    segments.push({ text: text.slice(m.start, m.end), issue: m });
    cursor = m.end;
  }
  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), issue: null });
  }
  return segments;
}

/** Strongest tier wins — same ordering as the harness and the eval dropdown. */
export function verdictOf(issues: RawIssue[]): "FIX" | "UNNATURAL" | "WORTH KNOWING" | "NONE" {
  const types = issues.map((i) => i.type);
  if (types.includes("fix")) return "FIX";
  if (types.includes("unnatural")) return "UNNATURAL";
  if (types.includes("note")) return "WORTH KNOWING";
  return "NONE";
}
