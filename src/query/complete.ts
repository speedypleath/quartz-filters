import type { IndexedNote } from "../index-format";
import { formatLiteral } from "./format";
import { tokenize } from "./lexer";
import { FIELD_NAME } from "./parser";
import type { Scalar, Token } from "./types";

export interface CatalogValue {
  value: Scalar;
  /** The value as readers see it, used for matching and display. */
  text: string;
  /** How many notes have this value. */
  count: number;
}

export interface CatalogField {
  name: string;
  /** How many notes have this field. */
  count: number;
  /** Most common first. */
  values: CatalogValue[];
}

/** Every field a query can name, with its values. Fields used by more notes come first. */
export type Catalog = CatalogField[];

export interface Suggestion {
  kind: "field" | "value";
  label: string;
  /** For a value at the start of a clause: the field the clause will test. */
  field?: string;
  /** Replaces the text between `from` and `to`. */
  insert: string;
}

export interface Completion {
  from: number;
  to: number;
  items: Suggestion[];
}

/** Always present, so they are listed after the note's own fields, in this order. */
const BUILT_IN_ORDER = ["title", "path"];
const BUILT_IN = new Set(BUILT_IN_ORDER);
const builtInRank = (name: string) => BUILT_IN_ORDER.indexOf(name);
const DEFAULT_LIMIT = 8;

/** Only fields that lex as one plain word can be written in a query. */
function isTypeable(name: string): boolean {
  if (!FIELD_NAME.test(name)) return false;
  const { tokens, error } = tokenize(name);
  return !error && tokens.length === 1 && tokens[0]!.type === "word";
}

export function buildCatalog(notes: IndexedNote[]): Catalog {
  const fields = new Map<string, { count: number; values: Map<string, CatalogValue> }>();
  for (const note of notes) {
    for (const [name, raw] of Object.entries(note.fields)) {
      if (!isTypeable(name)) continue;
      let field = fields.get(name);
      if (!field) {
        field = { count: 0, values: new Map() };
        fields.set(name, field);
      }
      field.count++;
      const seen = new Set<string>();
      for (const value of Array.isArray(raw) ? raw : [raw]) {
        const text = String(value);
        if (seen.has(text)) continue;
        seen.add(text);
        const entry = field.values.get(text);
        if (entry) entry.count++;
        else field.values.set(text, { value, text, count: 1 });
      }
    }
  }

  const byCount =
    <T extends { count: number }>(key: (item: T) => string) =>
    (a: T, b: T) =>
      b.count - a.count || key(a).localeCompare(key(b));
  return Array.from(fields, ([name, { count, values }]) => ({
    name,
    count,
    values: Array.from(values.values()).sort(byCount((v) => v.text)),
  })).sort(
    (a, b) =>
      builtInRank(a.name) - builtInRank(b.name) || byCount<CatalogField>((f) => f.name)(a, b),
  );
}

/** How the text is written as a value: bare when it reads back as the same value, else quoted. */
function formatValue(value: Scalar): string {
  if (typeof value !== "string") return String(value);
  const { tokens, error } = tokenize(value);
  const only = tokens[0];
  const bare =
    !error &&
    tokens.length === 1 &&
    only!.start === 0 &&
    only!.end === value.length &&
    (only!.type === "word" || only!.type === "date");
  return bare ? value : formatLiteral({ type: "string", value });
}

/** 0 for a prefix match, 1 for a match inside the text, null for no match. */
function rank(text: string, typed: string): number | null {
  if (!typed) return 0;
  const at = text.toLowerCase().indexOf(typed);
  return at < 0 ? null : at === 0 ? 0 : 1;
}

/** Keeps the matches, stable within a rank, so the catalog's order breaks ties. */
function filterRanked<T>(items: T[], text: (item: T) => string, typed: string): T[] {
  return items
    .map((item, index) => ({ item, index, r: rank(text(item), typed) }))
    .filter((x): x is { item: T; index: number; r: number } => x.r !== null)
    .sort((a, b) => a.r - b.r || a.index - b.index)
    .map((x) => x.item);
}

type Context =
  { kind: "clause" } | { kind: "field"; holding?: string } | { kind: "value"; field: string };

const isKeyword = (t: Token | undefined, word: string) => t?.type === "keyword" && t.value === word;
const isLiteral = (t: Token | undefined) =>
  t !== undefined && ["string", "number", "date", "boolean", "word"].includes(t.type);

/** What the grammar expects after these tokens, or null when it expects an operator or connective. */
function contextAfter(tokens: Token[]): Context | null {
  const n = tokens.length;
  const last = tokens[n - 1];
  const back = (k: number) => tokens[n - 1 - k];
  if (!last || last.type === "lparen" || isKeyword(last, "and") || isKeyword(last, "or")) {
    return { kind: "clause" };
  }
  if (isKeyword(last, "not")) {
    if (isKeyword(back(1), "is")) {
      return back(2)?.type === "word" ? { kind: "value", field: back(2)!.value } : null;
    }
    // `value not` waits for `in`; anywhere else `not` negates the next clause.
    return isLiteral(back(1)) ? null : { kind: "clause" };
  }
  if (isKeyword(last, "has")) return { kind: "field" };
  if (isKeyword(last, "in")) {
    const value = isKeyword(back(1), "not") ? back(2) : back(1);
    return { kind: "field", holding: isLiteral(value) ? value!.value : undefined };
  }
  if (isKeyword(last, "is") || isKeyword(last, "contains") || last.type === "op") {
    return back(1)?.type === "word" ? { kind: "value", field: back(1)!.value } : null;
  }
  return null;
}

const fieldItem = (f: CatalogField): Suggestion => ({
  kind: "field",
  label: f.name,
  insert: f.name,
});

/**
 * Suggestions for the word at `cursor`: field names where the grammar expects a field, that field's
 * values after an operator, and both at the start of a clause.
 */
export function complete(
  query: string,
  cursor: number,
  catalog: Catalog,
  limit = DEFAULT_LIMIT,
): Completion | null {
  const before = query.slice(0, cursor);
  const lexed = tokenize(before);
  let tokens = lexed.tokens;
  let from = cursor;
  let quoted = false;

  if (lexed.error) {
    // Only an open quote at the cursor is a word in progress; other errors leave nothing to complete.
    const start = lexed.error.column - 1;
    if (!/["“]/.test(before[start] ?? "") || tokens.some((t) => t.start >= start)) return null;
    from = start;
    quoted = true;
  } else {
    const last = tokens[tokens.length - 1];
    if (last && last.end === cursor) {
      if (last.type === "string") return null;
      if (isLiteral(last) || last.type === "keyword") {
        from = last.start;
        tokens = tokens.slice(0, -1);
      }
    }
  }

  const context = contextAfter(tokens);
  if (!context) return null;

  const typed = before.slice(quoted ? from + 1 : from).toLowerCase();
  const whole = tokenize(query).tokens.find((t) => t.start === from);
  const to = whole && whole.end > cursor ? whole.end : cursor;

  const fields = quoted ? [] : catalog;
  let items: Suggestion[];
  if (context.kind === "field") {
    const holding = context.holding?.toLowerCase();
    const holds = (f: CatalogField) =>
      holding !== undefined && f.values.some((v) => v.text.toLowerCase() === holding);
    const ordered =
      holding === undefined
        ? fields
        : [...fields.filter(holds), ...fields.filter((f) => !holds(f))];
    items = filterRanked(ordered, (f) => f.name, typed).map(fieldItem);
  } else if (context.kind === "value") {
    const name = context.field.toLowerCase();
    const values = catalog
      .filter((f) => f.name.toLowerCase() === name)
      .flatMap((f) => f.values)
      .sort((a, b) => b.count - a.count);
    items = filterRanked(values, (v) => v.text, typed).map((v) => ({
      kind: "value",
      label: v.text,
      insert: formatValue(v.value),
    }));
  } else {
    const values = catalog
      .filter((f) => !BUILT_IN.has(f.name))
      .flatMap((f) => f.values.map((v) => ({ field: f.name, v })))
      .sort((a, b) => b.v.count - a.v.count);
    items = [
      ...filterRanked(fields, (f) => f.name, typed).map(fieldItem),
      ...filterRanked(values, (x) => x.v.text, typed).map(({ field, v }): Suggestion => ({
        kind: "value",
        label: v.text,
        field,
        insert: `${formatValue(v.value)} in ${field}`,
      })),
    ];
  }

  return items.length > 0 ? { from, to, items: items.slice(0, limit) } : null;
}

/** The query with the suggestion inserted, and where the cursor goes: after a following space. */
export function applySuggestion(
  query: string,
  completion: Completion,
  suggestion: Suggestion,
): { query: string; cursor: number } {
  const head = query.slice(0, completion.from) + suggestion.insert;
  const rest = query.slice(completion.to);
  if (/^\s/.test(rest)) return { query: head + rest, cursor: head.length + 1 };
  return { query: `${head} ${rest}`, cursor: head.length + 1 };
}
