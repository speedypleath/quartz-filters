import { tokenize } from "./lexer";
import type { Token } from "./types";

export type SegmentKind = "field" | "keyword" | "value" | "op" | "paren" | "space" | "invalid";

export interface Segment {
  text: string;
  kind: SegmentKind;
}

const FIELD_BEFORE = new Set(["is", "contains", "exists"]);
const FIELD_AFTER = new Set(["has", "in"]);

function kindOf(tokens: Token[], i: number): SegmentKind {
  const t = tokens[i];
  if (!t) return "value";
  if (t.type === "keyword") return "keyword";
  if (t.type === "op") return "op";
  if (t.type === "lparen" || t.type === "rparen") return "paren";
  if (t.type === "word") {
    const prev = tokens[i - 1];
    const next = tokens[i + 1];
    if (prev?.type === "keyword" && FIELD_AFTER.has(prev.value)) return "field";
    if (next?.type === "op" || (next?.type === "keyword" && FIELD_BEFORE.has(next.value))) {
      return "field";
    }
  }
  return "value";
}

/** Splits the query into styled runs whose texts join back into the exact query. */
export function highlight(query: string): Segment[] {
  const { tokens, error } = tokenize(query);
  const segments: Segment[] = [];
  let cursor = 0;
  tokens.forEach((t, i) => {
    if (t.start > cursor) segments.push({ text: query.slice(cursor, t.start), kind: "space" });
    segments.push({ text: query.slice(t.start, t.end), kind: kindOf(tokens, i) });
    cursor = t.end;
  });
  if (cursor < query.length) {
    const rest = query.slice(cursor);
    const lead = rest.length - rest.trimStart().length;
    if (lead > 0) segments.push({ text: rest.slice(0, lead), kind: "space" });
    if (lead < rest.length) {
      segments.push({ text: rest.slice(lead), kind: error ? "invalid" : "space" });
    }
  }
  return segments;
}
