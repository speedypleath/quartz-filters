# Note Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let readers of a Quartz site narrow the Explorer to notes whose frontmatter matches a plain-words query (`topic is "Electronics" and "seedling" in tags`), and save those queries as bookmarks.

**Architecture:**

- A pure TypeScript query engine (lexer, parser, evaluator, formatter, highlighter) lives in `src/query/`.
- A build-time emitter writes every published note's frontmatter to `static/quartz-filters/index.json`.
- A Preact sidebar component renders the Filter/Saved panel.
- A client script wires the panel together:
  - it fetches the index
  - it evaluates queries
  - it hides non-matching items in the Explorer's rendered tree (`github:quartz-community/explorer`)
  - it keeps bookmarks in localStorage

**Tech Stack:** TypeScript 5 (strict, `noUncheckedIndexedAccess`), Preact 10, tsup + esbuild, SCSS (sass), Vitest 2 with jsdom, `@quartz-community/types` and `@quartz-community/utils`.

**Spec:** `docs/superpowers/specs/2026-11-07-note-filter-design.md`

## Global Constraints

- Node `>=22`, npm `>=10.9.2`, Quartz `>=5.0.0` (already set in `package.json`).
- No new runtime `dependencies`. Add exactly one dev dependency: `jsdom`.
- Don't edit `tsup.config.ts`, `.changeset/config.json` or `.github/`.
- `dist/index.js` may only import Node built-ins, `@quartz-community/*`, `preact`, `@jackyzha0/quartz`, `vfile`, `unified` or peer deps. CI checks this.
- Lint runs with `--max-warnings=0`. Any file that calls `addEventListener` must also call `window.addCleanup(...)` (rule `no-restricted-syntax`). The single exception is the inline entry file, which disables the rule with a stated reason.
- Styles may only use Quartz theme variables: `--light`, `--lightgray`, `--gray`, `--darkgray`, `--dark`, `--secondary`, `--tertiary`, `--highlight`, `--headerFont`, `--bodyFont`, `--codeFont`.
- The index file is `static/quartz-filters/index.json`, and its shape is `{ "version": 1, "notes": [{ path, title, fields }] }`.
- Storage keys:
  - localStorage: `quartz-filters:bookmarks`
  - sessionStorage: `quartz-filters:query`
- Bookmark shape: `{ name, query, caseSensitive }`. Session shape: `{ query, caseSensitive }`.
- The query input is debounced at 150 ms. Flipping the case toggle re-evaluates immediately.
- Text from frontmatter, queries or bookmark names must only reach the DOM through `textContent` or attributes. Never use `innerHTML`.
- `npm run check` (typecheck, lint, format and tests) must pass at the end of every task.
- Every commit message ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Deviations from the spec

These were decided while planning. Each one is noted again in the task that owns it.

- **The `indexPath` component option is dropped (Task 10).** Quartz passes one YAML `options` block to every part of a plugin, so the emitter and the component must agree on the path. Making it configurable only invites a mismatch, so it is the fixed constant `INDEX_FILE`.
- **Field names in the highlight overlay are coloured but not semibold (Task 10).** A bold run in the overlay can be wider than the same text in the textarea above it, which puts the caret out of line.
- **Date-only literals compare on the calendar day (Task 4).** `created is 2026-01-01` matches `2026-01-01T00:00:00.000Z`, and `created >= 2026-01-01` compares day strings. Literals that include a time compare as instants.
- **Smart quotes `“…”` work like `"…"` (Task 2).** macOS turns straight quotes into curly ones as you type.
- **The emitter can't test that unpublished notes are absent (Task 6).** Quartz runs its filters before emitters and only hands emitters published content. This belongs to Quartz, so the plan doesn't test it.
- **Parser error messages are English only.** The surrounding UI text is localized through i18n.

## Review Focus

These are cases the spec implies but no task's main tests exercise. Each one has a pinned test in the task named.

1. **Curly quotes from macOS autocorrect.** `topic is “Electronics”` should parse like straight quotes. Test in Task 2.
2. **HTML in bookmark names and queries.** A name like `<img src=x onerror=…>` must show as text and never create elements. Test in Task 11.
3. **Non-ASCII field names and values.** `tópico is "Électronique"` and case-insensitive `É`/`é` must work. Tests in Task 2 and Task 4.
4. **YAML dates arriving as full ISO timestamps.** `created is 2026-01-01` must match a note whose `created: 2026-01-01` was serialized as `2026-01-01T00:00:00.000Z`. Test in Task 4.
5. **The index resolving after an SPA navigation unmounted the panel.** It must not throw, and must not touch the Explorer. Test in Task 11.

Known limitation (not fixed): with `folderClickBehavior: link`, a folder's own note (`folder/index`) is hidden when its folder has no matching child notes. The user has no folders, so this is acceptable.

---

## File structure

```
src/
  index.ts                      exports FrontmatterIndex, NoteFilter, option types (Task 12)
  types.ts                      re-exports Quartz types only (Task 1)
  emitter.ts                    FrontmatterIndex emitter + normalization (Task 6)
  index-format.ts               INDEX_FILE, IndexedNote, FrontmatterIndexFile (Task 6)
  query/
    types.ts                    Token, Literal, Clause, Expr, ParseResult, NoteFields… (Task 2)
    lexer.ts                    tokenize() (Task 2)
    parser.ts                   parse() (Task 3)
    evaluate.ts                 matches() (Task 4)
    format.ts                   formatClause(), connectiveAfter(), removeClause() (Task 5)
    highlight.ts                highlight() -> Segment[] (Task 5)
  i18n/locales/en-US.ts         noteFilter strings (Task 10)
  i18n/index.ts                 + NoteFilterStrings type (Task 10)
  components/
    index.ts                    exports NoteFilter (Task 10)
    NoteFilter.tsx              server-rendered panel markup (Task 10)
    styles/note-filter.scss     panel + Explorer integration styles (Task 10)
    scripts/
      note-filter.inline.ts     browser entry: wires modules on "nav" (Task 11)
      note-filter/
        guards.ts               isRecord(), KeyValueStorage (Task 7)
        bookmarks.ts            createBookmarkStore() (Task 7)
        selectors.ts            Explorer markup contract (Task 8)
        explorer-sync.ts        createExplorerSync() (Task 8)
        index-loader.ts         createIndexLoader() (Task 9)
        session.ts              readSession(), writeSession() (Task 9)
        panel.ts                mountNoteFilter() (Task 11)
test/
  helpers.ts                    (existing) createCtx, createProcessedContent…
  fixtures/storage.ts           MemoryStorage, BrokenStorage (Task 7)
  fixtures/explorer.ts          Explorer markup builder (Task 8)
  fixtures/render.ts            renderComponent() via preact (Task 10)
  lexer.test.ts  parser.test.ts  evaluate.test.ts  format.test.ts  highlight.test.ts
  emitter.test.ts  bookmarks.test.ts  explorer-sync.test.ts  index-loader.test.ts
  session.test.ts  note-filter-component.test.ts  panel.test.ts
vitest.config.ts                + plugin stubbing .scss/.inline.ts imports (Task 10)
```

---

### Task 1: Remove the template examples

**Files:**

- Delete:
  - `src/transformer.ts`, `src/filter.ts`, `src/emitter.ts`
  - `src/components/ExampleComponent.tsx`, `src/components/scripts/example.inline.ts`, `src/components/styles/example.scss`
  - `test/transformer.test.ts`, `test/filter.test.ts`, `test/emitter.test.ts`
- Modify: `src/index.ts`, `src/types.ts`, `src/components/index.ts`, `src/i18n/locales/en-US.ts`

**Interfaces:**

- Produces:
  - `src/types.ts` only re-exports `@quartz-community/types`.
  - `src/index.ts` only re-exports Quartz types. Tasks 6, 10 and 12 add exports to it.

- [ ] **Step 1: Delete the example files**

```bash
git rm -q src/transformer.ts src/filter.ts src/emitter.ts \
  src/components/ExampleComponent.tsx src/components/scripts/example.inline.ts \
  src/components/styles/example.scss \
  test/transformer.test.ts test/filter.test.ts test/emitter.test.ts
```

- [ ] **Step 2: Replace `src/types.ts`**

```ts
export type {
  BuildCtx,
  ChangeEvent,
  CSSResource,
  JSResource,
  ProcessedContent,
  QuartzEmitterPlugin,
  QuartzEmitterPluginInstance,
  QuartzFilterPlugin,
  QuartzFilterPluginInstance,
  QuartzPluginData,
  QuartzTransformerPlugin,
  QuartzTransformerPluginInstance,
  StaticResources,
  PageMatcher,
  PageGenerator,
  VirtualPage,
  QuartzPageTypePlugin,
  QuartzPageTypePluginInstance,
} from "@quartz-community/types";
```

- [ ] **Step 3: Replace `src/index.ts`**

```ts
// Re-export shared types from @quartz-community/types
export type {
  QuartzComponent,
  QuartzComponentProps,
  QuartzComponentConstructor,
  StringResource,
  QuartzTransformerPlugin,
  QuartzFilterPlugin,
  QuartzEmitterPlugin,
  QuartzPageTypePlugin,
  QuartzPageTypePluginInstance,
  PageMatcher,
  PageGenerator,
  VirtualPage,
} from "@quartz-community/types";
```

- [ ] **Step 4: Replace `src/components/index.ts`**

```ts
export {};
```

- [ ] **Step 5: Replace `src/i18n/locales/en-US.ts`**

```ts
export default {
  components: {},
};
```

- [ ] **Step 6: Confirm that typecheck, lint, format and build pass**

There are no tests yet, so run the parts of `check` that don't need test files:

Run: `npm run typecheck && npm run lint && npm run format && npm run build && npx vitest run --passWithNoTests`

Expected: every command exits 0. The build prints `Build success`.

- [ ] **Step 7: Commit**

`dist/` is rebuilt and committed once, in Task 12, so leave it out here.

```bash
git add -A src test
git commit -m "Remove template example plugins

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Query types and lexer

**Files:**

- Create: `src/query/types.ts`, `src/query/lexer.ts`
- Test: `test/lexer.test.ts`

**Interfaces:**

- Produces:
  - Types: `Scalar`, `FieldValue`, `NoteFields`, `TokenType`, `Token`, `ParseError`, `Literal`, `ClauseOp`, `Clause`, `Expr`, `ParseResult`, `EvalOptions`
  - `tokenize(input: string): LexResult`, where `LexResult = { tokens: Token[]; error: ParseError | null }`
  - `KEYWORDS: Set<string>`

- [ ] **Step 1: Create `src/query/types.ts`**

```ts
export type Scalar = string | number | boolean;
export type FieldValue = Scalar | Scalar[];
/** Frontmatter of one note after normalization. Dates are ISO strings. */
export type NoteFields = Record<string, FieldValue>;

export type TokenType =
  "string" | "number" | "date" | "boolean" | "word" | "keyword" | "op" | "lparen" | "rparen";

export interface Token {
  type: TokenType;
  /** Keywords are lowercased and quoted strings are unescaped. Everything else is the raw text. */
  value: string;
  /** 0-based offset of the first character. */
  start: number;
  /** 0-based offset just past the last character. */
  end: number;
}

export interface ParseError {
  message: string;
  /** 1-based column, as shown to readers. */
  column: number;
}

export interface Literal {
  type: "string" | "number" | "date" | "boolean";
  value: string;
}

export type ClauseOp =
  "is" | "is not" | "in" | "not in" | "contains" | "<" | ">" | "<=" | ">=" | "has";

export interface Clause {
  kind: "clause";
  op: ClauseOp;
  field: string;
  /** `null` only for `has`. */
  value: Literal | null;
  /** Offsets into the query text, covering the clause's own tokens. */
  start: number;
  end: number;
}

export type Expr =
  Clause | { kind: "and" | "or"; left: Expr; right: Expr } | { kind: "not"; expr: Expr };

export interface ParseResult {
  /** `null` when the query is empty or has an error. */
  ast: Expr | null;
  error: ParseError | null;
  /** Every clause that parsed, in order, including the ones before an error. */
  clauses: Clause[];
}

export interface EvalOptions {
  caseSensitive: boolean;
}
```

- [ ] **Step 2: Write the failing tests in `test/lexer.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { tokenize } from "../src/query/lexer";

const kinds = (input: string) => tokenize(input).tokens.map((t) => [t.type, t.value]);

describe("tokenize", () => {
  it("reads fields, keywords and quoted values", () => {
    expect(kinds('topic is "Electronics"')).toEqual([
      ["word", "topic"],
      ["keyword", "is"],
      ["string", "Electronics"],
    ]);
  });

  it("lowercases keywords but keeps words as typed", () => {
    expect(kinds("Status IS Done")).toEqual([
      ["word", "Status"],
      ["keyword", "is"],
      ["word", "Done"],
    ]);
  });

  it("recognises numbers, dates, booleans, operators and parentheses", () => {
    expect(kinds("(rating >= -4.5) or created < 2026-01-01T10:30 or draft is true")).toEqual([
      ["lparen", "("],
      ["word", "rating"],
      ["op", ">="],
      ["number", "-4.5"],
      ["rparen", ")"],
      ["keyword", "or"],
      ["word", "created"],
      ["op", "<"],
      ["date", "2026-01-01T10:30"],
      ["keyword", "or"],
      ["word", "draft"],
      ["keyword", "is"],
      ["boolean", "true"],
    ]);
  });

  it('unescapes \\" inside quoted strings', () => {
    expect(kinds('title is "say \\"hi\\""')[2]).toEqual(["string", 'say "hi"']);
  });

  it("treats curly quotes like straight quotes", () => {
    expect(kinds("topic is “Electronics”")[2]).toEqual(["string", "Electronics"]);
  });

  it("reads non-ASCII words", () => {
    expect(kinds("tópico is Électronique")).toEqual([
      ["word", "tópico"],
      ["keyword", "is"],
      ["word", "Électronique"],
    ]);
  });

  it("records 0-based offsets", () => {
    const [first, second] = tokenize("  has status").tokens;
    expect(first).toMatchObject({ start: 2, end: 5 });
    expect(second).toMatchObject({ start: 6, end: 12 });
  });

  it("reports an unclosed quote with its column and keeps earlier tokens", () => {
    const result = tokenize('topic is "Electr');
    expect(result.tokens.map((t) => t.value)).toEqual(["topic", "is"]);
    expect(result.error).toEqual({ message: "This quoted value has no closing quote", column: 10 });
  });

  it("reports characters it can't read", () => {
    expect(tokenize("topic = x").error).toEqual({
      message: 'Unexpected character "="',
      column: 7,
    });
  });
});
```

- [ ] **Step 3: Run the tests to confirm they fail**

Run: `npx vitest run test/lexer.test.ts`

Expected: FAIL with `Failed to resolve import "../src/query/lexer"`.

- [ ] **Step 4: Create `src/query/lexer.ts`**

```ts
import type { ParseError, Token } from "./types";

export const KEYWORDS = new Set(["is", "not", "in", "and", "or", "has", "exists", "contains"]);

const WORD_CHAR = /[\p{L}\p{N}_.:\-]/u;
const DATE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z)?)?$/;
const NUMBER = /^-?\d+(\.\d+)?$/;
const OPEN_QUOTES = new Set(['"', "“"]);
const CLOSE_QUOTES = new Set(['"', "”"]);

export interface LexResult {
  /** Tokens read before the first error. */
  tokens: Token[];
  error: ParseError | null;
}

export function tokenize(input: string): LexResult {
  const tokens: Token[] = [];
  let i = 0;

  while (i < input.length) {
    const ch = input[i]!;

    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    if (ch === "(" || ch === ")") {
      tokens.push({ type: ch === "(" ? "lparen" : "rparen", value: ch, start: i, end: i + 1 });
      i++;
      continue;
    }

    if (ch === "<" || ch === ">") {
      const op = input[i + 1] === "=" ? `${ch}=` : ch;
      tokens.push({ type: "op", value: op, start: i, end: i + op.length });
      i += op.length;
      continue;
    }

    if (OPEN_QUOTES.has(ch)) {
      const start = i;
      let value = "";
      let closed = false;
      i++;
      while (i < input.length) {
        const c = input[i]!;
        if (c === "\\" && input[i + 1] === '"') {
          value += '"';
          i += 2;
          continue;
        }
        if (CLOSE_QUOTES.has(c)) {
          closed = true;
          i++;
          break;
        }
        value += c;
        i++;
      }
      if (!closed) {
        return {
          tokens,
          error: { message: "This quoted value has no closing quote", column: start + 1 },
        };
      }
      tokens.push({ type: "string", value, start, end: i });
      continue;
    }

    if (WORD_CHAR.test(ch)) {
      const start = i;
      while (i < input.length && WORD_CHAR.test(input[i]!)) i++;
      const text = input.slice(start, i);
      const lower = text.toLowerCase();
      if (DATE.test(text)) tokens.push({ type: "date", value: text, start, end: i });
      else if (NUMBER.test(text)) tokens.push({ type: "number", value: text, start, end: i });
      else if (lower === "true" || lower === "false")
        tokens.push({ type: "boolean", value: lower, start, end: i });
      else if (KEYWORDS.has(lower)) tokens.push({ type: "keyword", value: lower, start, end: i });
      else tokens.push({ type: "word", value: text, start, end: i });
      continue;
    }

    return { tokens, error: { message: `Unexpected character "${ch}"`, column: i + 1 } };
  }

  return { tokens, error: null };
}
```

- [ ] **Step 5: Run the tests to confirm they pass**

Run: `npx vitest run test/lexer.test.ts`

Expected: PASS (9 tests).

- [ ] **Step 6: Commit**

```bash
npx prettier --write src/query test/lexer.test.ts
git add src/query test/lexer.test.ts
git commit -m "Add query lexer

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Parser

**Files:**

- Create: `src/query/parser.ts`
- Test: `test/parser.test.ts`

**Interfaces:**

- Consumes: `tokenize` and `Token`, `Clause`, `ClauseOp`, `Expr`, `Literal`, `ParseError`, `ParseResult` from Task 2.
- Produces: `parse(input: string): ParseResult`.
  - An empty or whitespace-only query gives `{ ast: null, error: null, clauses: [] }`.
  - `x exists` parses as op `"has"`.
  - Bareword values parse as `type: "string"`.

- [ ] **Step 1: Write the failing tests in `test/parser.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { parse } from "../src/query/parser";
import type { Expr } from "../src/query/types";

/** Compact view of an AST: clauses become "field op value". */
const show = (e: Expr | null): unknown => {
  if (!e) return null;
  switch (e.kind) {
    case "clause":
      return `${e.field} ${e.op}${e.value ? ` ${e.value.type}:${e.value.value}` : ""}`;
    case "not":
      return { not: show(e.expr) };
    default:
      return { [e.kind]: [show(e.left), show(e.right)] };
  }
};

describe("parse", () => {
  it.each([
    ['topic is "Electronics"', "topic is string:Electronics"],
    ["status is not done", "status is not string:done"],
    ['"seedling" in tags', "tags in string:seedling"],
    ["seedling not in tags", "tags not in string:seedling"],
    ["title contains motor", "title contains string:motor"],
    ["rating >= 4", "rating >= number:4"],
    ["created < 2026-01-01", "created < date:2026-01-01"],
    ["draft is false", "draft is boolean:false"],
    ["has status", "status has"],
    ["status exists", "status has"],
    ["TOPIC Is Electronics", "TOPIC is string:Electronics"],
  ])("parses %s", (input, expected) => {
    const result = parse(input);
    expect(result.error).toBeNull();
    expect(show(result.ast)).toBe(expected);
  });

  it("binds not tighter than and, and and tighter than or", () => {
    expect(show(parse("not a is 1 and b is 2 or c is 3").ast)).toEqual({
      or: [{ and: [{ not: "a is number:1" }, "b is number:2"] }, "c is number:3"],
    });
  });

  it("groups with parentheses", () => {
    expect(show(parse("a is 1 and (b is 2 or c is 3)").ast)).toEqual({
      and: ["a is number:1", { or: ["b is number:2", "c is number:3"] }],
    });
  });

  it("returns nothing for an empty query", () => {
    expect(parse("   ")).toEqual({ ast: null, error: null, clauses: [] });
  });

  it("records each clause with its text span", () => {
    const query = 'topic is "Electronics" and "seedling" in tags';
    const { clauses } = parse(query);
    expect(clauses.map((c) => query.slice(c.start, c.end))).toEqual([
      'topic is "Electronics"',
      '"seedling" in tags',
    ]);
  });

  it.each([
    ["topic is", 'Expected a value after "is"', 9],
    ["topic", 'Expected "is", "in", "contains", a comparison or "exists" after "topic"', 6],
    ['"seedling" is tags', 'Expected "in" after ""seedling""', 12],
    ["seedling in", 'Expected a field name after "in"', 12],
    ["has 42", 'Expected a field name after "has"', 5],
    ["title is and", '"and" is a keyword. Put it in quotes to use it as a value', 10],
    ["a is 1 b is 2", 'Expected "and" or "or" before "b"', 8],
    ["(a is 1", 'Expected ")" to close the "(" at column 1', 8],
    ["a is 1)", 'There is no "(" for this ")"', 7],
    ["a is 1 and", "Expected a clause", 11],
    ["and", 'Expected a clause, found "and"', 1],
  ])("reports %j", (input, message, column) => {
    const result = parse(input);
    expect(result.ast).toBeNull();
    expect(result.error).toEqual({ message, column });
  });

  it("keeps the clauses that parsed before an error", () => {
    const result = parse("a is 1 and b is");
    expect(result.clauses.map((c) => c.field)).toEqual(["a"]);
  });

  it("reports the earlier of a lexer error and a parser error", () => {
    expect(parse('a is 1 and b is "open').error).toEqual({
      message: "This quoted value has no closing quote",
      column: 17,
    });
  });
});
```

- [ ] **Step 2: Run the tests to confirm they fail**

Run: `npx vitest run test/parser.test.ts`

Expected: FAIL with `Failed to resolve import "../src/query/parser"`.

- [ ] **Step 3: Create `src/query/parser.ts`**

```ts
import { tokenize } from "./lexer";
import type { Clause, ClauseOp, Expr, Literal, ParseError, ParseResult, Token } from "./types";

const FIELD_NAME = /^[\p{L}_][\p{L}\p{N}_.\-]*$/u;
const LITERAL_TYPES = new Set<Token["type"]>(["string", "number", "date", "boolean", "word"]);

class ParseFailure extends Error {
  constructor(readonly detail: ParseError) {
    super(detail.message);
  }
}

const earliest = (a: ParseError | null, b: ParseError): ParseError =>
  a && a.column <= b.column ? a : b;

export function parse(input: string): ParseResult {
  const { tokens, error: lexError } = tokenize(input);
  const clauses: Clause[] = [];
  let pos = 0;

  const peek = (offset = 0): Token | undefined => tokens[pos + offset];
  const describe = (t: Token) => `"${input.slice(t.start, t.end)}"`;
  const isKeyword = (t: Token | undefined, word: string): t is Token =>
    t?.type === "keyword" && t.value === word;
  const isLiteral = (t: Token | undefined): t is Token =>
    t !== undefined && LITERAL_TYPES.has(t.type);
  const isFieldName = (t: Token | undefined): t is Token =>
    t?.type === "word" && FIELD_NAME.test(t.value);

  function fail(message: string, at: Token | undefined): never {
    throw new ParseFailure({ message, column: (at?.start ?? input.length) + 1 });
  }

  function toLiteral(t: Token): Literal {
    return { type: t.type === "word" ? "string" : (t.type as Literal["type"]), value: t.value };
  }

  function orExpr(): Expr {
    let left = andExpr();
    while (isKeyword(peek(), "or")) {
      pos++;
      left = { kind: "or", left, right: andExpr() };
    }
    return left;
  }

  function andExpr(): Expr {
    let left = notExpr();
    while (isKeyword(peek(), "and")) {
      pos++;
      left = { kind: "and", left, right: notExpr() };
    }
    return left;
  }

  function notExpr(): Expr {
    if (isKeyword(peek(), "not")) {
      pos++;
      return { kind: "not", expr: notExpr() };
    }
    return primary();
  }

  function primary(): Expr {
    const open = peek();
    if (open?.type === "lparen") {
      pos++;
      const inner = orExpr();
      const close = peek();
      if (close?.type !== "rparen") {
        return fail(`Expected ")" to close the "(" at column ${open.start + 1}`, close);
      }
      pos++;
      return inner;
    }
    return clause();
  }

  function fieldAfter(after: Token): string {
    const t = peek();
    if (!isFieldName(t)) return fail(`Expected a field name after ${describe(after)}`, t);
    pos++;
    return t.value;
  }

  function valueAfter(after: Token): Literal {
    const t = peek();
    if (t?.type === "keyword") {
      return fail(`${describe(t)} is a keyword. Put it in quotes to use it as a value`, t);
    }
    if (!isLiteral(t)) return fail(`Expected a value after ${describe(after)}`, t);
    pos++;
    return toLiteral(t);
  }

  function clause(): Clause {
    const first = peek();
    if (!first) return fail("Expected a clause", first);

    const finish = (op: ClauseOp, field: string, value: Literal | null): Clause => {
      const c: Clause = {
        kind: "clause",
        op,
        field,
        value,
        start: first.start,
        end: tokens[pos - 1]?.end ?? first.end,
      };
      clauses.push(c);
      return c;
    };

    if (isKeyword(first, "has")) {
      pos++;
      return finish("has", fieldAfter(first), null);
    }
    if (!isLiteral(first)) return fail(`Expected a clause, found ${describe(first)}`, first);
    pos++;

    const next = peek();
    if (isKeyword(next, "in")) {
      pos++;
      return finish("in", fieldAfter(next), toLiteral(first));
    }
    const following = peek(1);
    if (isKeyword(next, "not") && isKeyword(following, "in")) {
      pos += 2;
      return finish("not in", fieldAfter(following), toLiteral(first));
    }

    if (!isFieldName(first)) return fail(`Expected "in" after ${describe(first)}`, next);

    if (isKeyword(next, "is")) {
      pos++;
      const negation = peek();
      if (isKeyword(negation, "not")) {
        pos++;
        return finish("is not", first.value, valueAfter(negation));
      }
      return finish("is", first.value, valueAfter(next));
    }
    if (isKeyword(next, "contains")) {
      pos++;
      return finish("contains", first.value, valueAfter(next));
    }
    if (next?.type === "op") {
      pos++;
      return finish(next.value as ClauseOp, first.value, valueAfter(next));
    }
    if (isKeyword(next, "exists")) {
      pos++;
      return finish("has", first.value, null);
    }
    return fail(
      `Expected "is", "in", "contains", a comparison or "exists" after ${describe(first)}`,
      next,
    );
  }

  if (tokens.length === 0) return { ast: null, error: lexError, clauses };

  try {
    const ast = orExpr();
    const extra = peek();
    if (extra) {
      fail(
        extra.type === "rparen"
          ? 'There is no "(" for this ")"'
          : `Expected "and" or "or" before ${describe(extra)}`,
        extra,
      );
    }
    return lexError ? { ast: null, error: lexError, clauses } : { ast, error: null, clauses };
  } catch (e) {
    if (e instanceof ParseFailure) {
      return { ast: null, error: earliest(lexError, e.detail), clauses };
    }
    throw e;
  }
}
```

- [ ] **Step 4: Run the tests to confirm they pass**

Run: `npx vitest run test/parser.test.ts`

Expected: PASS. If a column assertion fails, count the characters in the input: the column is the 1-based offset of the offending token, or `length + 1` at the end of the query. Fix the test's expectation only if the message and column the parser produced are what a reader would want to see.

- [ ] **Step 5: Commit**

```bash
npx prettier --write src/query/parser.ts test/parser.test.ts
git add src/query/parser.ts test/parser.test.ts
git commit -m "Add query parser

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Evaluator

**Files:**

- Create: `src/query/evaluate.ts`
- Test: `test/evaluate.test.ts`

**Interfaces:**

- Consumes: `parse` (Task 3) in tests. `Expr`, `Clause`, `Literal`, `NoteFields`, `Scalar`, `EvalOptions` (Task 2).
- Produces: `matches(ast: Expr, fields: NoteFields, opts: EvalOptions): boolean`.

- [ ] **Step 1: Write the failing tests in `test/evaluate.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { matches } from "../src/query/evaluate";
import { parse } from "../src/query/parser";
import type { NoteFields } from "../src/query/types";

const NOTE: NoteFields = {
  title: "H-bridge Motor Driver",
  path: "electronics/h-bridge",
  topic: "Electronics",
  tags: ["seedling", "Robotics"],
  rating: 4,
  draft: false,
  created: "2026-01-01T00:00:00.000Z",
  updated: "2026-03-15T09:30:00.000Z",
  status: "",
  empty: [],
  tópico: "Électronique",
};

const run = (query: string, caseSensitive = false, fields: NoteFields = NOTE) => {
  const { ast, error } = parse(query);
  if (!ast || error) throw new Error(`Query did not parse: ${query}`);
  return matches(ast, fields, { caseSensitive });
};

describe("matches", () => {
  it.each([
    ['topic is "Electronics"', true],
    ["topic is electronics", true],
    ["topic is Books", false],
    ["topic is not Books", true],
    ['"seedling" in tags', true],
    ["robotics in tags", true],
    ["evergreen in tags", false],
    ["evergreen not in tags", true],
    ["tags is seedling", true],
    ["Electronics in topic", true],
    ["title contains motor", true],
    ["tags contains seed", true],
    ["rating > 3", true],
    ["rating >= 4", true],
    ["rating < 4", false],
    ["rating is 4", true],
    ["draft is false", true],
    ["draft is true", false],
    ["created is 2026-01-01", true],
    ["created >= 2026-01-01", true],
    ["created < 2026-01-01", false],
    ["updated > 2026-03-15T09:00Z", true],
    ["updated < 2026-03-15T09:00Z", false],
    ["has topic", true],
    ["has status", false],
    ["has empty", false],
    ["has missing", false],
    ["missing is x", false],
    ["missing is not x", true],
    ["x not in missing", true],
    ["missing contains x", false],
    ["missing > 1", false],
    ["topic > 3", false],
    ["rating > 2026-01-01", false],
    ['tópico is "électronique"', true],
    ['topic is "Electronics" and ("seedling" in tags or status is done)', true],
    ["not topic is Electronics", false],
    ['path contains "electronics/"', true],
  ])("%s → %s", (query, expected) => {
    expect(run(query)).toBe(expected);
  });

  describe("with case sensitivity on", () => {
    it.each([
      ['topic is "Electronics"', true],
      ["topic is electronics", false],
      ["Topic is Electronics", false],
      ["Robotics in tags", true],
      ["robotics in tags", false],
      ["title contains Motor", true],
      ["title contains motor", false],
      ["rating is 4", true],
      ["draft is false", true],
      ["created is 2026-01-01", true],
      ['tópico is "électronique"', false],
    ])("%s → %s", (query, expected) => {
      expect(run(query, true)).toBe(expected);
    });
  });

  it("matches either key when keys differ only in case and the toggle is off", () => {
    const fields: NoteFields = { Status: "draft", status: "done" };
    expect(run("status is done", false, fields)).toBe(true);
    expect(run("status is draft", false, fields)).toBe(true);
    expect(run("Status is done", true, fields)).toBe(false);
  });
});
```

- [ ] **Step 2: Run the tests to confirm they fail**

Run: `npx vitest run test/evaluate.test.ts`

Expected: FAIL with `Failed to resolve import "../src/query/evaluate"`.

- [ ] **Step 3: Create `src/query/evaluate.ts`**

```ts
import type { Clause, EvalOptions, Expr, Literal, NoteFields, Scalar } from "./types";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}(T[\d:.]+(Z|[+-]\d{2}:\d{2})?)?$/;

export function matches(ast: Expr, fields: NoteFields, opts: EvalOptions): boolean {
  switch (ast.kind) {
    case "and":
      return matches(ast.left, fields, opts) && matches(ast.right, fields, opts);
    case "or":
      return matches(ast.left, fields, opts) || matches(ast.right, fields, opts);
    case "not":
      return !matches(ast.expr, fields, opts);
    case "clause":
      return matchClause(ast, fields, opts.caseSensitive);
  }
}

/** Every value stored under `name`, with arrays flattened. `undefined` when the field is missing. */
function lookup(fields: NoteFields, name: string, caseSensitive: boolean): Scalar[] | undefined {
  if (caseSensitive) {
    const value = fields[name];
    return value === undefined ? undefined : ([] as Scalar[]).concat(value);
  }
  const wanted = name.toLowerCase();
  let found: Scalar[] | undefined;
  for (const [key, value] of Object.entries(fields)) {
    if (key.toLowerCase() === wanted) found = (found ?? []).concat(value);
  }
  return found;
}

function matchClause(clause: Clause, fields: NoteFields, caseSensitive: boolean): boolean {
  const values = lookup(fields, clause.field, caseSensitive);
  if (clause.op === "has") return values !== undefined && values.some((v) => v !== "");

  const literal = clause.value;
  if (!literal) return false;
  const anyEqual = () => values?.some((v) => equal(v, literal, caseSensitive)) ?? false;

  switch (clause.op) {
    case "is":
    case "in":
      return anyEqual();
    case "is not":
    case "not in":
      return !anyEqual();
    case "contains":
      return values?.some((v) => contains(v, literal, caseSensitive)) ?? false;
    default:
      return values?.some((v) => ordered(v, literal, clause.op)) ?? false;
  }
}

const isDate = (s: string) => ISO_DATE.test(s) && !Number.isNaN(Date.parse(s));
const day = (s: string) => new Date(Date.parse(s)).toISOString().slice(0, 10);

/** Negative, zero or positive. A date-only literal compares on the field's UTC calendar day. */
function compareDates(field: string, literal: string): number {
  if (literal.length === 10) {
    const fieldDay = day(field);
    return fieldDay < literal ? -1 : fieldDay > literal ? 1 : 0;
  }
  return Math.sign(Date.parse(field) - Date.parse(literal));
}

const sameText = (a: string, b: string, caseSensitive: boolean) =>
  caseSensitive ? a === b : a.toLowerCase() === b.toLowerCase();

function equal(value: Scalar, literal: Literal, caseSensitive: boolean): boolean {
  if (literal.type === "number" && typeof value === "number")
    return value === Number(literal.value);
  if (literal.type === "date" && typeof value === "string" && isDate(value)) {
    return compareDates(value, literal.value) === 0;
  }
  if (literal.type === "boolean" && typeof value === "boolean") {
    return value === (literal.value === "true");
  }
  return sameText(String(value), literal.value, caseSensitive);
}

function contains(value: Scalar, literal: Literal, caseSensitive: boolean): boolean {
  const text = String(value);
  return caseSensitive
    ? text.includes(literal.value)
    : text.toLowerCase().includes(literal.value.toLowerCase());
}

function ordered(value: Scalar, literal: Literal, op: Clause["op"]): boolean {
  let cmp: number;
  if (literal.type === "number" && typeof value === "number") {
    cmp = Math.sign(value - Number(literal.value));
  } else if (literal.type === "date" && typeof value === "string" && isDate(value)) {
    cmp = compareDates(value, literal.value);
  } else {
    return false;
  }
  switch (op) {
    case "<":
      return cmp < 0;
    case ">":
      return cmp > 0;
    case "<=":
      return cmp <= 0;
    case ">=":
      return cmp >= 0;
    default:
      return false;
  }
}
```

- [ ] **Step 4: Run the tests to confirm they pass**

Run: `npx vitest run test/evaluate.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
npx prettier --write src/query/evaluate.ts test/evaluate.test.ts
git add src/query/evaluate.ts test/evaluate.test.ts
git commit -m "Add query evaluator with case-sensitivity option

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Clause formatting, clause removal and syntax highlighting

**Files:**

- Create: `src/query/format.ts`, `src/query/highlight.ts`
- Test: `test/format.test.ts`, `test/highlight.test.ts`

**Interfaces:**

- Consumes: `tokenize` (Task 2), `parse` (Task 3), and the types `Clause`, `Literal`, `Token`.
- Produces:
  - `formatClause(clause: Clause): string`
  - `connectiveAfter(query: string, clause: Clause): "and" | "or" | null`
  - `removeClause(query: string, clause: Clause): string`
  - `highlight(query: string): Segment[]`, where `Segment = { text: string; kind: SegmentKind }` and `SegmentKind = "field" | "keyword" | "value" | "op" | "paren" | "space" | "invalid"`. The segment texts concatenate back to the exact query.

- [ ] **Step 1: Write the failing tests in `test/format.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { connectiveAfter, formatClause, removeClause } from "../src/query/format";
import { parse } from "../src/query/parser";

const clauseAt = (query: string, index: number) => {
  const clause = parse(query).clauses[index];
  if (!clause) throw new Error(`No clause ${index} in ${query}`);
  return clause;
};

describe("formatClause", () => {
  it.each([
    ["topic is Electronics", 'topic is "Electronics"'],
    ["seedling in tags", '"seedling" in tags'],
    ['title contains "say \\"hi\\""', 'title contains "say \\"hi\\""'],
    ["rating>=4", "rating >= 4"],
    ["status exists", "has status"],
    ["draft is not true", "draft is not true"],
  ])("%s → %s", (query, expected) => {
    expect(formatClause(clauseAt(query, 0))).toBe(expected);
  });
});

describe("connectiveAfter", () => {
  it("finds the connective after a clause, skipping closing parentheses", () => {
    const query = "(a is 1 and b is 2) or c is 3";
    expect(connectiveAfter(query, clauseAt(query, 0))).toBe("and");
    expect(connectiveAfter(query, clauseAt(query, 1))).toBe("or");
    expect(connectiveAfter(query, clauseAt(query, 2))).toBeNull();
  });
});

describe("removeClause", () => {
  it.each([
    ["a is 1 and b is 2", 0, "b is 2"],
    ["a is 1 and b is 2", 1, "a is 1"],
    ["a is 1 and b is 2 or c is 3", 1, "a is 1 and c is 3"],
    ["not a is 1 and b is 2", 0, "b is 2"],
    ["(a is 1) and b is 2", 0, "b is 2"],
    ["a is 1 and not (b is 2)", 1, "a is 1"],
    ["a is 1", 0, ""],
  ])("removes clause %i from %j", (query, index, expected) => {
    expect(removeClause(query, clauseAt(query, index))).toBe(expected);
  });
});
```

- [ ] **Step 2: Write the failing tests in `test/highlight.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { highlight } from "../src/query/highlight";

const kinds = (query: string) => highlight(query).filter((s) => s.kind !== "space");

describe("highlight", () => {
  it("rebuilds the exact query text", () => {
    const query = '  topic is "Electronics"  and (rating >= 4)';
    expect(
      highlight(query)
        .map((s) => s.text)
        .join(""),
    ).toBe(query);
  });

  it("tells fields from values", () => {
    expect(kinds('topic is "Electronics" and "seedling" in tags and has status')).toEqual([
      { text: "topic", kind: "field" },
      { text: "is", kind: "keyword" },
      { text: '"Electronics"', kind: "value" },
      { text: "and", kind: "keyword" },
      { text: '"seedling"', kind: "value" },
      { text: "in", kind: "keyword" },
      { text: "tags", kind: "field" },
      { text: "and", kind: "keyword" },
      { text: "has", kind: "keyword" },
      { text: "status", kind: "field" },
    ]);
  });

  it("marks operators, parentheses and exists", () => {
    expect(kinds("(rating >= 4) or status exists").map((s) => s.kind)).toEqual([
      "paren",
      "field",
      "op",
      "value",
      "paren",
      "keyword",
      "field",
      "keyword",
    ]);
  });

  it("marks text the lexer couldn't read as invalid", () => {
    expect(highlight('topic is "Electr').at(-1)).toEqual({ text: '"Electr', kind: "invalid" });
  });
});
```

- [ ] **Step 3: Run the tests to confirm they fail**

Run: `npx vitest run test/format.test.ts test/highlight.test.ts`

Expected: FAIL with `Failed to resolve import`.

- [ ] **Step 4: Create `src/query/format.ts`**

```ts
import { tokenize } from "./lexer";
import type { Clause, Literal, Token } from "./types";

const isKeyword = (t: Token | undefined, word: string): t is Token =>
  t?.type === "keyword" && t.value === word;
const isConnective = (t: Token | undefined): t is Token =>
  isKeyword(t, "and") || isKeyword(t, "or");

export function formatLiteral(literal: Literal): string {
  return literal.type === "string" ? `"${literal.value.replace(/"/g, '\\"')}"` : literal.value;
}

/** Canonical text for one clause, as shown in the clause list. */
export function formatClause(clause: Clause): string {
  if (clause.op === "has" || !clause.value) return `has ${clause.field}`;
  if (clause.op === "in" || clause.op === "not in") {
    return `${formatLiteral(clause.value)} ${clause.op} ${clause.field}`;
  }
  return `${clause.field} ${clause.op} ${formatLiteral(clause.value)}`;
}

/** The `and`/`or` that joins this clause to the next one, if any. */
export function connectiveAfter(query: string, clause: Clause): "and" | "or" | null {
  const { tokens } = tokenize(query);
  let i = tokens.findIndex((t) => t.start >= clause.end);
  if (i < 0) return null;
  while (tokens[i]?.type === "rparen") i++;
  const t = tokens[i];
  return isConnective(t) ? (t.value as "and" | "or") : null;
}

/**
 * Removes a clause from the query text, together with its negations, any parentheses that would
 * be left empty, and the connective that joined it to a neighbour.
 */
export function removeClause(query: string, clause: Clause): string {
  const { tokens } = tokenize(query);
  let first = tokens.findIndex((t) => t.start === clause.start);
  let last = tokens.findIndex((t) => t.end === clause.end);
  if (first < 0 || last < first) return query;

  const absorbNegations = () => {
    while (isKeyword(tokens[first - 1], "not")) first--;
  };
  absorbNegations();
  while (tokens[first - 1]?.type === "lparen" && tokens[last + 1]?.type === "rparen") {
    first--;
    last++;
    absorbNegations();
  }

  let from = tokens[first]?.start ?? clause.start;
  let to = tokens[last]?.end ?? clause.end;
  const after = tokens[last + 1];
  const before = tokens[first - 1];
  if (isConnective(after)) {
    to = tokens[last + 2]?.start ?? after.end;
  } else if (isConnective(before)) {
    from = tokens[first - 2]?.end ?? before.start;
  }
  return (query.slice(0, from) + query.slice(to)).trim();
}
```

- [ ] **Step 5: Create `src/query/highlight.ts`**

```ts
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
```

- [ ] **Step 6: Run the tests to confirm they pass**

Run: `npx vitest run test/format.test.ts test/highlight.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
npx prettier --write src/query test/format.test.ts test/highlight.test.ts
git add src/query test/format.test.ts test/highlight.test.ts
git commit -m "Add clause formatting, removal and query highlighting

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Frontmatter index emitter

**Files:**

- Create: `src/index-format.ts`, `src/emitter.ts`
- Modify: `src/index.ts` (add the export)
- Test: `test/emitter.test.ts`

**Interfaces:**

- Consumes: `NoteFields`, `FieldValue`, `Scalar` (Task 2). `createCtx`, `createProcessedContent`, `assertFullSlug`, `assertFilePath` from `test/helpers.ts`.
- Produces:
  - `INDEX_FILE = "static/quartz-filters/index.json"`
  - `IndexedNote = { path: string; title: string; fields: NoteFields }`
  - `FrontmatterIndexFile = { version: 1; notes: IndexedNote[] }`
  - `FrontmatterIndexOptions = { excludeFields: string[]; fields?: string[] }`
  - `normalizeValue(value: unknown): FieldValue | undefined`
  - `indexNote(slug: string, frontmatter: Record<string, unknown>, options: FrontmatterIndexOptions): IndexedNote`
  - `FrontmatterIndex: QuartzEmitterPlugin<Partial<FrontmatterIndexOptions>>`

- [ ] **Step 1: Write the failing tests in `test/emitter.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import path from "node:path";
import fs from "node:fs/promises";
import { tmpdir } from "node:os";
import { FrontmatterIndex, indexNote, normalizeValue } from "../src/emitter";
import { INDEX_FILE } from "../src/index-format";
import { assertFilePath, assertFullSlug, createCtx, createProcessedContent } from "./helpers";

const collect = async <T>(result: T[] | AsyncIterable<T>): Promise<T[]> => {
  if (Array.isArray(result)) return result;
  const items: T[] = [];
  for await (const item of result) items.push(item);
  return items;
};

describe("normalizeValue", () => {
  it.each([
    ["text", "text"],
    [4, 4],
    [false, false],
    [new Date("2026-01-01"), "2026-01-01T00:00:00.000Z"],
    [
      ["a", 1, { nested: true }, null, new Date("2026-02-03")],
      ["a", 1, "2026-02-03T00:00:00.000Z"],
    ],
    [null, undefined],
    [{ nested: true }, undefined],
    [Number.NaN, undefined],
    [new Date("not a date"), undefined],
  ])("%j → %j", (input, expected) => {
    expect(normalizeValue(input)).toEqual(expected);
  });
});

describe("indexNote", () => {
  const frontmatter = {
    title: "H-bridge",
    topic: "Electronics",
    Email: "me@example.com",
    path: "overridden",
    meta: { nested: true },
  };

  it("keeps normalized fields and adds the built-in title and path", () => {
    expect(indexNote("electronics/h-bridge", frontmatter, { excludeFields: [] })).toEqual({
      path: "electronics/h-bridge",
      title: "H-bridge",
      fields: {
        title: "H-bridge",
        path: "electronics/h-bridge",
        topic: "Electronics",
        Email: "me@example.com",
      },
    });
  });

  it("drops excluded fields regardless of case", () => {
    const note = indexNote("a", frontmatter, { excludeFields: ["email"] });
    expect(note.fields).not.toHaveProperty("Email");
  });

  it("keeps only allowlisted fields, plus title and path", () => {
    const note = indexNote("a", frontmatter, { excludeFields: [], fields: ["Topic"] });
    expect(Object.keys(note.fields).sort()).toEqual(["path", "title", "topic"]);
  });

  it("falls back to the slug when there is no title", () => {
    expect(indexNote("notes/untitled", {}, { excludeFields: [] }).title).toBe("notes/untitled");
  });
});

describe("FrontmatterIndex", () => {
  it("writes the index for every note it receives", async () => {
    const outputDir = await fs.mkdtemp(path.join(tmpdir(), "quartz-filters-"));
    const ctx = createCtx({ argv: { output: outputDir } });
    const content = [
      createProcessedContent({
        slug: assertFullSlug("electronics/h-bridge"),
        filePath: assertFilePath("electronics/h-bridge.md"),
        frontmatter: { title: "H-bridge", topic: "Electronics", tags: ["seedling"] },
      }),
    ];

    const emitted = await collect(
      await FrontmatterIndex({ excludeFields: ["tags"] }).emit(ctx, content, {
        css: [],
        js: [],
        additionalHead: [],
      }),
    );

    expect(emitted).toEqual([path.join(outputDir, INDEX_FILE)]);
    const file = JSON.parse(await fs.readFile(path.join(outputDir, INDEX_FILE), "utf8"));
    expect(file).toEqual({
      version: 1,
      notes: [
        {
          path: "electronics/h-bridge",
          title: "H-bridge",
          fields: { title: "H-bridge", path: "electronics/h-bridge", topic: "Electronics" },
        },
      ],
    });
  });
});
```

- [ ] **Step 2: Run the tests to confirm they fail**

Run: `npx vitest run test/emitter.test.ts`

Expected: FAIL with `Failed to resolve import "../src/emitter"`.

- [ ] **Step 3: Create `src/index-format.ts`**

```ts
import type { NoteFields } from "./query/types";

/** Where the emitter writes the index, relative to the site's output root. */
export const INDEX_FILE = "static/quartz-filters/index.json";

export interface IndexedNote {
  /** The note's slug, e.g. `electronics/h-bridge`. */
  path: string;
  title: string;
  /** Normalized frontmatter, always including `title` and `path`. */
  fields: NoteFields;
}

export interface FrontmatterIndexFile {
  version: 1;
  notes: IndexedNote[];
}
```

- [ ] **Step 4: Create `src/emitter.ts`**

```ts
import path from "node:path";
import fs from "node:fs/promises";
import type {
  BuildCtx,
  FilePath,
  ProcessedContent,
  QuartzEmitterPlugin,
} from "@quartz-community/types";
import { INDEX_FILE, type FrontmatterIndexFile, type IndexedNote } from "./index-format";
import type { FieldValue, NoteFields, Scalar } from "./query/types";

export interface FrontmatterIndexOptions {
  /** Frontmatter keys to leave out of the public index. Matched regardless of case. */
  excludeFields: string[];
  /** When set, only these keys are indexed. `title` and `path` are always included. */
  fields?: string[];
}

const defaultOptions: FrontmatterIndexOptions = { excludeFields: [] };
const BUILT_IN = new Set(["title", "path"]);

function normalizeScalar(value: unknown): Scalar | undefined {
  if (typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? undefined : value.toISOString();
  return undefined;
}

/** Keeps strings, numbers, booleans and dates (as ISO strings). Arrays keep only those. */
export function normalizeValue(value: unknown): FieldValue | undefined {
  if (Array.isArray(value)) {
    return value.map(normalizeScalar).filter((v): v is Scalar => v !== undefined);
  }
  return normalizeScalar(value);
}

export function indexNote(
  slug: string,
  frontmatter: Record<string, unknown>,
  options: FrontmatterIndexOptions,
): IndexedNote {
  const excluded = new Set(options.excludeFields.map((f) => f.toLowerCase()));
  const allowed = options.fields ? new Set(options.fields.map((f) => f.toLowerCase())) : null;
  const fields: NoteFields = {};

  for (const [key, raw] of Object.entries(frontmatter)) {
    const lower = key.toLowerCase();
    if (BUILT_IN.has(lower) || excluded.has(lower)) continue;
    if (allowed && !allowed.has(lower)) continue;
    const value = normalizeValue(raw);
    if (value !== undefined) fields[key] = value;
  }

  const title =
    typeof frontmatter.title === "string" && frontmatter.title.length > 0
      ? frontmatter.title
      : slug;
  fields.title = title;
  fields.path = slug;
  return { path: slug, title, fields };
}

/** Writes every published note's frontmatter to `static/quartz-filters/index.json`. */
export const FrontmatterIndex: QuartzEmitterPlugin<Partial<FrontmatterIndexOptions>> = (
  userOptions?: Partial<FrontmatterIndexOptions>,
) => {
  const options: FrontmatterIndexOptions = { ...defaultOptions, ...userOptions };

  const emitIndex = async (ctx: BuildCtx, content: ProcessedContent[]): Promise<FilePath[]> => {
    const notes = content.flatMap(([, vfile]) => {
      const slug = vfile.data?.slug;
      if (typeof slug !== "string") return [];
      const frontmatter = (vfile.data?.frontmatter ?? {}) as Record<string, unknown>;
      return [indexNote(slug, frontmatter, options)];
    });
    const file: FrontmatterIndexFile = { version: 1, notes };
    const outputPath = path.join(ctx.argv.output, INDEX_FILE);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(file));
    return [outputPath as FilePath];
  };

  return {
    name: "FrontmatterIndex",
    async emit(ctx, content) {
      return emitIndex(ctx, content);
    },
    async *partialEmit(ctx, content) {
      yield* await emitIndex(ctx, content);
    },
  };
};
```

- [ ] **Step 5: Export the emitter from `src/index.ts`**

Add these lines at the top of the file, above the type re-exports:

```ts
export { FrontmatterIndex } from "./emitter";
export type { FrontmatterIndexOptions } from "./emitter";
```

- [ ] **Step 6: Run the tests to confirm they pass**

Run: `npx vitest run test/emitter.test.ts && npm run typecheck`

Expected: PASS, and typecheck exits 0. If the `emit` or `partialEmit` signatures don't typecheck against `QuartzEmitterPlugin`, copy the parameter list from the type in `node_modules/@quartz-community/types/dist/index.d.ts`, using `_`-prefixed names for parameters you don't use.

- [ ] **Step 7: Commit**

```bash
npx prettier --write src/emitter.ts src/index-format.ts src/index.ts test/emitter.test.ts
git add src/emitter.ts src/index-format.ts src/index.ts test/emitter.test.ts
git commit -m "Add FrontmatterIndex emitter

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Bookmark store

**Files:**

- Create: `src/components/scripts/note-filter/guards.ts`, `src/components/scripts/note-filter/bookmarks.ts`, `test/fixtures/storage.ts`
- Test: `test/bookmarks.test.ts`

**Interfaces:**

- Produces:
  - `isRecord(value: unknown): value is Record<string, unknown>`
  - `KeyValueStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">`
  - `BOOKMARKS_KEY = "quartz-filters:bookmarks"`
  - `Bookmark = { name: string; query: string; caseSensitive: boolean }`
  - `BookmarkStore = { readonly available: boolean; list(): Bookmark[]; find(name: string): Bookmark | undefined; save(bookmark: Bookmark): boolean; remove(name: string): void }`
  - `createBookmarkStore(getStorage: () => KeyValueStorage | null | undefined): BookmarkStore`
  - Test fixtures `MemoryStorage` and `BrokenStorage` (whose `setItem` throws)

- [ ] **Step 1: Create `test/fixtures/storage.ts`**

```ts
/** In-memory stand-in for localStorage and sessionStorage. */
export class MemoryStorage {
  private data = new Map<string, string>();

  getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.data.set(key, String(value));
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }
}

/** Storage that refuses writes, like Safari private mode or a full quota. */
export class BrokenStorage extends MemoryStorage {
  override setItem(_key: string, _value: string): void {
    throw new DOMException("The quota has been exceeded.", "QuotaExceededError");
  }
}
```

- [ ] **Step 2: Write the failing tests in `test/bookmarks.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import {
  BOOKMARKS_KEY,
  createBookmarkStore,
} from "../src/components/scripts/note-filter/bookmarks";
import { BrokenStorage, MemoryStorage } from "./fixtures/storage";

describe("createBookmarkStore", () => {
  it("saves, lists, finds and removes bookmarks", () => {
    const storage = new MemoryStorage();
    const store = createBookmarkStore(() => storage);
    expect(store.available).toBe(true);

    expect(store.save({ name: "Seedlings", query: "seedling in tags", caseSensitive: false })).toBe(
      true,
    );
    expect(store.save({ name: "Exact", query: "topic is Electronics", caseSensitive: true })).toBe(
      true,
    );

    expect(store.list().map((b) => b.name)).toEqual(["Seedlings", "Exact"]);
    expect(store.find("Exact")).toEqual({
      name: "Exact",
      query: "topic is Electronics",
      caseSensitive: true,
    });

    store.remove("Seedlings");
    expect(store.list().map((b) => b.name)).toEqual(["Exact"]);
  });

  it("replaces a bookmark with the same name in place", () => {
    const store = createBookmarkStore(() => new MemoryStorage());
    store.save({ name: "A", query: "a is 1", caseSensitive: false });
    store.save({ name: "B", query: "b is 1", caseSensitive: false });
    store.save({ name: "A", query: "a is 2", caseSensitive: true });
    expect(store.list()).toEqual([
      { name: "A", query: "a is 2", caseSensitive: true },
      { name: "B", query: "b is 1", caseSensitive: false },
    ]);
  });

  it("loads older bookmarks without caseSensitive with the toggle off", () => {
    const storage = new MemoryStorage();
    storage.setItem(BOOKMARKS_KEY, JSON.stringify([{ name: "Old", query: "has status" }]));
    expect(createBookmarkStore(() => storage).list()).toEqual([
      { name: "Old", query: "has status", caseSensitive: false },
    ]);
  });

  it("ignores corrupted or malformed data", () => {
    const storage = new MemoryStorage();
    storage.setItem(BOOKMARKS_KEY, "{not json");
    expect(createBookmarkStore(() => storage).list()).toEqual([]);
    storage.setItem(
      BOOKMARKS_KEY,
      JSON.stringify([{ name: 3 }, "x", { name: "Ok", query: "a is 1" }]),
    );
    expect(
      createBookmarkStore(() => storage)
        .list()
        .map((b) => b.name),
    ).toEqual(["Ok"]);
  });

  it("reports itself unavailable when storage throws or is missing", () => {
    const broken = createBookmarkStore(() => new BrokenStorage());
    expect(broken.available).toBe(false);
    expect(broken.save({ name: "A", query: "a is 1", caseSensitive: false })).toBe(false);
    expect(broken.list()).toEqual([]);

    const missing = createBookmarkStore(() => {
      throw new Error("SecurityError");
    });
    expect(missing.available).toBe(false);
  });
});
```

- [ ] **Step 3: Run the tests to confirm they fail**

Run: `npx vitest run test/bookmarks.test.ts`

Expected: FAIL with `Failed to resolve import`.

- [ ] **Step 4: Create `src/components/scripts/note-filter/guards.ts`**

```ts
/** The part of the Web Storage API the filter uses, so tests can pass a plain object. */
export type KeyValueStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
```

- [ ] **Step 5: Create `src/components/scripts/note-filter/bookmarks.ts`**

```ts
import { isRecord, type KeyValueStorage } from "./guards";

export const BOOKMARKS_KEY = "quartz-filters:bookmarks";

export interface Bookmark {
  name: string;
  query: string;
  caseSensitive: boolean;
}

export interface BookmarkStore {
  /** False when the browser won't let us write, e.g. in private mode. */
  readonly available: boolean;
  list(): Bookmark[];
  find(name: string): Bookmark | undefined;
  /** Adds the bookmark, or replaces the one with the same name. Returns false if it couldn't be stored. */
  save(bookmark: Bookmark): boolean;
  remove(name: string): void;
}

function probe(getStorage: () => KeyValueStorage | null | undefined): KeyValueStorage | null {
  try {
    const storage = getStorage();
    if (!storage) return null;
    const key = `${BOOKMARKS_KEY}:probe`;
    storage.setItem(key, "1");
    storage.removeItem(key);
    return storage;
  } catch {
    return null;
  }
}

export function createBookmarkStore(
  getStorage: () => KeyValueStorage | null | undefined,
): BookmarkStore {
  const storage = probe(getStorage);

  const read = (): Bookmark[] => {
    if (!storage) return [];
    try {
      const parsed: unknown = JSON.parse(storage.getItem(BOOKMARKS_KEY) ?? "[]");
      if (!Array.isArray(parsed)) return [];
      return parsed.flatMap((item) =>
        isRecord(item) && typeof item.name === "string" && typeof item.query === "string"
          ? [{ name: item.name, query: item.query, caseSensitive: item.caseSensitive === true }]
          : [],
      );
    } catch {
      return [];
    }
  };

  const write = (bookmarks: Bookmark[]): boolean => {
    if (!storage) return false;
    try {
      storage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
      return true;
    } catch {
      return false;
    }
  };

  return {
    available: storage !== null,
    list: read,
    find: (name) => read().find((b) => b.name === name),
    save(bookmark) {
      const bookmarks = read();
      const index = bookmarks.findIndex((b) => b.name === bookmark.name);
      if (index >= 0) bookmarks[index] = bookmark;
      else bookmarks.push(bookmark);
      return write(bookmarks);
    },
    remove(name) {
      write(read().filter((b) => b.name !== name));
    },
  };
}
```

- [ ] **Step 6: Run the tests to confirm they pass**

Run: `npx vitest run test/bookmarks.test.ts`

Expected: PASS (5 tests).

- [ ] **Step 7: Commit**

```bash
npx prettier --write src/components/scripts/note-filter test/bookmarks.test.ts test/fixtures
git add src/components/scripts/note-filter test/bookmarks.test.ts test/fixtures
git commit -m "Add bookmark store

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Explorer sync

**Files:**

- Modify: `package.json` and `package-lock.json` (add the `jsdom` dev dependency)
- Create: `src/components/scripts/note-filter/selectors.ts`, `src/components/scripts/note-filter/explorer-sync.ts`, `test/fixtures/explorer.ts`
- Test: `test/explorer-sync.test.ts`

**Interfaces:**

- Produces:
  - The constants `EXPLORER`, `HIDDEN_CLASS`, `OPENED_ATTR`, `FILTERED_ATTR` and `EMPTY_CLASS`
  - `ExplorerSyncStrings = { filtered: string; noMatches: string; clearFilter: string }`
  - `ExplorerSync = { readonly count: number; apply(hrefs: Set<string> | null): void; disconnect(): void }`
  - `createExplorerSync(root: ParentNode, strings: ExplorerSyncStrings, onClear: () => void): ExplorerSync`
  - Test fixtures `TreeNode`, `treeHtml(nodes)` and `explorerHtml(nodes)`
- The markup contract was copied from `github:quartz-community/explorer` (`src/components/Explorer.tsx` and `scripts/explorer.inline.ts`):
  - File items are `<li><a href={resolveBasePath(slug)} class="nav-file-title tree-item-self">`.
  - Folder items are `<li><div class="folder-container" data-folderpath>…</div><div class="folder-outer [open]"><ul class="content">…`.
  - The list is `ul.explorer-ul` inside `div.explorer-content`.
  - The title is `.title-button h2`.

- [ ] **Step 1: Install jsdom**

Run: `npm install -D jsdom`

Expected: `package.json` gains `"jsdom"` under `devDependencies`.

- [ ] **Step 2: Create `test/fixtures/explorer.ts`**

```ts
export type TreeNode = { slug: string; title: string } | { folder: string; children: TreeNode[] };

/** List items in the shape the Explorer renders from its templates. */
export function treeHtml(nodes: TreeNode[]): string {
  return nodes
    .map((node) =>
      "folder" in node
        ? `<li><div class="folder-container nav-folder-title tree-item-self" data-folderpath="${node.folder}">` +
          `<div><button class="folder-button"><span class="folder-title">${node.folder}</span></button></div></div>` +
          `<div class="folder-outer"><ul class="content tree-item-children">${treeHtml(node.children)}</ul></div></li>`
        : `<li><a href="/${node.slug}" class="nav-file-title tree-item-self">${node.title}</a></li>`,
    )
    .join("");
}

export function explorerHtml(nodes: TreeNode[]): string {
  return (
    `<div class="explorer nav-files-container">` +
    `<button type="button" class="title-button explorer-toggle desktop-explorer"><h2>Explorer</h2></button>` +
    `<div class="explorer-content"><ul class="explorer-ul overflow">${treeHtml(nodes)}</ul></div>` +
    `</div>`
  );
}
```

- [ ] **Step 3: Write the failing tests in `test/explorer-sync.test.ts`**

```ts
// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createExplorerSync } from "../src/components/scripts/note-filter/explorer-sync";
import { explorerHtml, treeHtml, type TreeNode } from "./fixtures/explorer";

const STRINGS = {
  filtered: "Filtered",
  noMatches: "No notes match this filter.",
  clearFilter: "Clear filter",
};

const TREE: TreeNode[] = [
  {
    folder: "electronics",
    children: [
      { slug: "electronics/h-bridge", title: "H-bridge motor driver" },
      { slug: "electronics/oscilloscope", title: "Oscilloscope probing" },
      {
        folder: "microcontrollers",
        children: [{ slug: "electronics/microcontrollers/esp32", title: "ESP32 pinout" }],
      },
    ],
  },
  { folder: "journal", children: [{ slug: "journal/2026-01-01", title: "New year" }] },
  { slug: "café-notes", title: "Café notes" },
];

const visibleFiles = () =>
  Array.from(document.querySelectorAll<HTMLAnchorElement>(".explorer-ul a.nav-file-title"))
    .filter((a) => !a.closest(".qf-hidden"))
    .map((a) => a.textContent);
const folder = (name: string) =>
  document.querySelector(`[data-folderpath="${name}"]`)?.parentElement as HTMLElement;
const outer = (name: string) => folder(name).querySelector(":scope > .folder-outer") as HTMLElement;

describe("createExplorerSync", () => {
  beforeEach(() => {
    document.body.innerHTML = explorerHtml(TREE);
  });

  it("hides files whose link isn't in the match set", () => {
    const sync = createExplorerSync(document, STRINGS, () => {});
    sync.apply(new Set(["/electronics/h-bridge", "/café-notes"]));
    expect(visibleFiles()).toEqual(["H-bridge motor driver", "Café notes"]);
  });

  it("hides empty folders and opens folders that hold matches", () => {
    const sync = createExplorerSync(document, STRINGS, () => {});
    sync.apply(new Set(["/electronics/microcontrollers/esp32"]));
    expect(folder("journal").classList.contains("qf-hidden")).toBe(true);
    expect(folder("electronics").classList.contains("qf-hidden")).toBe(false);
    expect(outer("electronics").classList.contains("open")).toBe(true);
    expect(outer("microcontrollers").classList.contains("open")).toBe(true);
  });

  it("restores the tree, closing only the folders it opened", () => {
    outer("journal").classList.add("open");
    const sync = createExplorerSync(document, STRINGS, () => {});
    sync.apply(new Set(["/electronics/microcontrollers/esp32"]));
    sync.apply(null);

    expect(document.querySelectorAll(".qf-hidden")).toHaveLength(0);
    expect(outer("journal").classList.contains("open")).toBe(true);
    expect(outer("electronics").classList.contains("open")).toBe(false);
    expect(outer("microcontrollers").classList.contains("open")).toBe(false);
    expect(document.querySelectorAll("[data-qf-opened]")).toHaveLength(0);
  });

  it("marks the Explorer title while a filter is on", () => {
    const sync = createExplorerSync(document, STRINGS, () => {});
    const explorer = document.querySelector(".explorer") as HTMLElement;
    const title = document.querySelector(".title-button h2") as HTMLElement;

    sync.apply(new Set(["/café-notes"]));
    expect(explorer.hasAttribute("data-qf-filtered")).toBe(true);
    expect(title.getAttribute("data-qf-filtered")).toBe("Filtered");

    sync.apply(null);
    expect(explorer.hasAttribute("data-qf-filtered")).toBe(false);
    expect(title.hasAttribute("data-qf-filtered")).toBe(false);
  });

  it("explains an empty result and offers to clear it", () => {
    const onClear = vi.fn();
    const sync = createExplorerSync(document, STRINGS, onClear);
    sync.apply(new Set());

    const note = document.querySelector(".explorer-content > .qf-empty") as HTMLElement;
    expect(note.textContent).toBe("No notes match this filter. Clear filter");
    note.querySelector("button")?.click();
    expect(onClear).toHaveBeenCalledOnce();

    sync.apply(null);
    expect(document.querySelector(".qf-empty")).toBeNull();
  });

  it("re-applies the filter after the Explorer redraws its tree", async () => {
    const sync = createExplorerSync(document, STRINGS, () => {});
    sync.apply(new Set(["/café-notes"]));

    const list = document.querySelector(".explorer-ul") as HTMLElement;
    list.innerHTML = treeHtml(TREE);
    expect(visibleFiles()).toHaveLength(5);

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(visibleFiles()).toEqual(["Café notes"]);
    sync.disconnect();
  });

  it("does nothing on a page without an Explorer", () => {
    document.body.innerHTML = "<main></main>";
    const sync = createExplorerSync(document, STRINGS, () => {});
    expect(sync.count).toBe(0);
    expect(() => sync.apply(new Set(["/x"]))).not.toThrow();
  });
});
```

- [ ] **Step 4: Run the tests to confirm they fail**

Run: `npx vitest run test/explorer-sync.test.ts`

Expected: FAIL with `Failed to resolve import`.

- [ ] **Step 5: Create `src/components/scripts/note-filter/selectors.ts`**

```ts
/**
 * Markup from github:quartz-community/explorer that the filter depends on. If an Explorer
 * release renames any of these, update them here and in test/fixtures/explorer.ts.
 */
export const EXPLORER = {
  root: "div.explorer",
  list: ".explorer-ul",
  content: ".explorer-content",
  title: ".title-button h2",
  fileLink: "a.nav-file-title",
  folderHeader: ".folder-container",
  folderOuter: ".folder-outer",
  openClass: "open",
} as const;

export const HIDDEN_CLASS = "qf-hidden";
export const EMPTY_CLASS = "qf-empty";
/** Set on `.folder-outer` elements the filter opened, so clearing closes only those. */
export const OPENED_ATTR = "data-qf-opened";
export const FILTERED_ATTR = "data-qf-filtered";
```

- [ ] **Step 6: Create `src/components/scripts/note-filter/explorer-sync.ts`**

```ts
import { EMPTY_CLASS, EXPLORER, FILTERED_ATTR, HIDDEN_CLASS, OPENED_ATTR } from "./selectors";

export interface ExplorerSyncStrings {
  filtered: string;
  noMatches: string;
  clearFilter: string;
}

export interface ExplorerSync {
  /** Number of Explorers found on the page. */
  readonly count: number;
  /** Shows only notes whose link `href` is in `hrefs`. `null` restores the full tree. */
  apply(hrefs: Set<string> | null): void;
  disconnect(): void;
}

const childMatching = (el: Element, selector: string): Element | null =>
  Array.from(el.children).find((child) => child.matches(selector)) ?? null;

export function createExplorerSync(
  root: ParentNode,
  strings: ExplorerSyncStrings,
  onClear: () => void,
): ExplorerSync {
  const explorers = Array.from(root.querySelectorAll<HTMLElement>(EXPLORER.root));
  const observers: MutationObserver[] = [];
  let current: Set<string> | null = null;
  let scheduled = false;

  const renderAll = () => explorers.forEach((explorer) => render(explorer, current));

  function restore(explorer: HTMLElement, list: Element) {
    list.querySelectorAll(`.${HIDDEN_CLASS}`).forEach((el) => el.classList.remove(HIDDEN_CLASS));
    list.querySelectorAll(`[${OPENED_ATTR}]`).forEach((el) => {
      el.classList.remove(EXPLORER.openClass);
      el.removeAttribute(OPENED_ATTR);
    });
    explorer.removeAttribute(FILTERED_ATTR);
    explorer.querySelector(EXPLORER.title)?.removeAttribute(FILTERED_ATTR);
  }

  function render(explorer: HTMLElement, hrefs: Set<string> | null) {
    explorer.querySelector(`.${EMPTY_CLASS}`)?.remove();
    const list = explorer.querySelector(EXPLORER.list);
    if (!list) return;
    if (hrefs === null) {
      restore(explorer, list);
      return;
    }

    const items = Array.from(list.querySelectorAll("li"));
    let visibleFiles = 0;
    for (const li of items) {
      const link = childMatching(li, EXPLORER.fileLink);
      if (!link) continue;
      const show = hrefs.has(link.getAttribute("href") ?? "");
      li.classList.toggle(HIDDEN_CLASS, !show);
      if (show) visibleFiles++;
    }

    // Deepest folders first, so each parent sees its children's final state.
    for (const li of items.reverse()) {
      if (!childMatching(li, EXPLORER.folderHeader)) continue;
      const hasVisibleFile = Array.from(li.querySelectorAll("li")).some(
        (item) => !item.classList.contains(HIDDEN_CLASS) && childMatching(item, EXPLORER.fileLink),
      );
      li.classList.toggle(HIDDEN_CLASS, !hasVisibleFile);
      const outer = childMatching(li, EXPLORER.folderOuter);
      if (hasVisibleFile && outer && !outer.classList.contains(EXPLORER.openClass)) {
        outer.classList.add(EXPLORER.openClass);
        outer.setAttribute(OPENED_ATTR, "");
      }
    }

    explorer.setAttribute(FILTERED_ATTR, "");
    explorer.querySelector(EXPLORER.title)?.setAttribute(FILTERED_ATTR, strings.filtered);

    if (visibleFiles === 0) {
      const doc = explorer.ownerDocument;
      const note = doc.createElement("p");
      note.className = EMPTY_CLASS;
      note.append(`${strings.noMatches} `);
      const clear = doc.createElement("button");
      clear.type = "button";
      clear.textContent = strings.clearFilter;
      clear.onclick = onClear;
      note.append(clear);
      (explorer.querySelector(EXPLORER.content) ?? explorer).append(note);
    }
  }

  // The Explorer rebuilds its list after every "nav" and "render" event, asynchronously.
  // The note we insert sits outside the list, so our own changes never trigger this observer.
  for (const explorer of explorers) {
    const list = explorer.querySelector(EXPLORER.list);
    if (!list) continue;
    const observer = new MutationObserver(() => {
      if (scheduled) return;
      scheduled = true;
      queueMicrotask(() => {
        scheduled = false;
        renderAll();
      });
    });
    observer.observe(list, { childList: true, subtree: true });
    observers.push(observer);
  }

  return {
    count: explorers.length,
    apply(hrefs) {
      current = hrefs;
      renderAll();
    },
    disconnect() {
      observers.forEach((observer) => observer.disconnect());
    },
  };
}
```

- [ ] **Step 7: Run the tests to confirm they pass**

Run: `npx vitest run test/explorer-sync.test.ts`

Expected: PASS (7 tests).

- [ ] **Step 8: Commit**

```bash
npx prettier --write src/components/scripts/note-filter test/explorer-sync.test.ts test/fixtures
git add package.json package-lock.json src/components/scripts/note-filter test/explorer-sync.test.ts test/fixtures
git commit -m "Filter the Explorer tree to matching notes

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Index loader and session state

**Files:**

- Create: `src/components/scripts/note-filter/index-loader.ts`, `src/components/scripts/note-filter/session.ts`
- Test: `test/index-loader.test.ts`, `test/session.test.ts`

**Interfaces:**

- Consumes: `IndexedNote` and `FrontmatterIndexFile` (Task 6). `isRecord` and `KeyValueStorage` (Task 7).
- Produces:
  - `IndexLoader = { load(): Promise<IndexedNote[]> }`
  - `createIndexLoader(url: string, fetchFn?: (url: string) => Promise<Response>): IndexLoader`. It shares one request while that request is pending, caches the result once it succeeds, and lets a later call retry after a failure.
  - `SESSION_KEY = "quartz-filters:query"`
  - `FilterState = { query: string; caseSensitive: boolean }`
  - `readSession(getStorage: () => KeyValueStorage | null | undefined): FilterState | null`
  - `writeSession(getStorage: () => KeyValueStorage | null | undefined, state: FilterState): void`

- [ ] **Step 1: Write the failing tests in `test/index-loader.test.ts`**

```ts
import { describe, expect, it, vi } from "vitest";
import { createIndexLoader } from "../src/components/scripts/note-filter/index-loader";

const NOTES = [{ path: "a", title: "A", fields: { title: "A", path: "a" } }];
const ok = (body: unknown) => Promise.resolve(new Response(JSON.stringify(body), { status: 200 }));

describe("createIndexLoader", () => {
  it("fetches once and caches the notes", async () => {
    const fetchFn = vi.fn(() => ok({ version: 1, notes: NOTES }));
    const loader = createIndexLoader("/static/quartz-filters/index.json", fetchFn);
    const [first, second] = await Promise.all([loader.load(), loader.load()]);
    expect(first).toEqual(NOTES);
    expect(second).toBe(first);
    await loader.load();
    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(fetchFn).toHaveBeenCalledWith("/static/quartz-filters/index.json");
  });

  it("retries after a failure", async () => {
    const fetchFn = vi
      .fn<(url: string) => Promise<Response>>()
      .mockRejectedValueOnce(new TypeError("offline"))
      .mockImplementation(() => ok({ version: 1, notes: NOTES }));
    const loader = createIndexLoader("/index.json", fetchFn);
    await expect(loader.load()).rejects.toThrow("offline");
    await expect(loader.load()).resolves.toEqual(NOTES);
  });

  it("rejects HTTP errors and unknown formats", async () => {
    const notFound = createIndexLoader("/x", () =>
      Promise.resolve(new Response("", { status: 404 })),
    );
    await expect(notFound.load()).rejects.toThrow("HTTP 404");
    const wrongShape = createIndexLoader("/x", () => ok({ version: 2, notes: [] }));
    await expect(wrongShape.load()).rejects.toThrow("Unexpected index format");
  });
});
```

- [ ] **Step 2: Write the failing tests in `test/session.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import {
  SESSION_KEY,
  readSession,
  writeSession,
} from "../src/components/scripts/note-filter/session";
import { BrokenStorage, MemoryStorage } from "./fixtures/storage";

describe("session state", () => {
  it("round-trips the query and case setting", () => {
    const storage = new MemoryStorage();
    writeSession(() => storage, { query: "has status", caseSensitive: true });
    expect(readSession(() => storage)).toEqual({ query: "has status", caseSensitive: true });
  });

  it("returns null for missing or malformed state", () => {
    const storage = new MemoryStorage();
    expect(readSession(() => storage)).toBeNull();
    storage.setItem(SESSION_KEY, "{oops");
    expect(readSession(() => storage)).toBeNull();
    storage.setItem(SESSION_KEY, JSON.stringify({ query: 4 }));
    expect(readSession(() => storage)).toBeNull();
  });

  it("never throws when storage is unavailable", () => {
    expect(() =>
      writeSession(() => new BrokenStorage(), { query: "x", caseSensitive: false }),
    ).not.toThrow();
    expect(
      readSession(() => {
        throw new Error("SecurityError");
      }),
    ).toBeNull();
  });
});
```

- [ ] **Step 3: Run the tests to confirm they fail**

Run: `npx vitest run test/index-loader.test.ts test/session.test.ts`

Expected: FAIL with `Failed to resolve import`.

- [ ] **Step 4: Create `src/components/scripts/note-filter/index-loader.ts`**

```ts
import type { FrontmatterIndexFile, IndexedNote } from "../../../index-format";

export interface IndexLoader {
  load(): Promise<IndexedNote[]>;
}

export function createIndexLoader(
  url: string,
  fetchFn: (url: string) => Promise<Response> = (u) => fetch(u),
): IndexLoader {
  let pending: Promise<IndexedNote[]> | null = null;
  return {
    load() {
      pending ??= fetchFn(url)
        .then(async (response) => {
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const data = (await response.json()) as Partial<FrontmatterIndexFile>;
          if (data.version !== 1 || !Array.isArray(data.notes)) {
            throw new Error("Unexpected index format");
          }
          return data.notes;
        })
        .catch((error: unknown) => {
          pending = null;
          throw error;
        });
      return pending;
    },
  };
}
```

- [ ] **Step 5: Create `src/components/scripts/note-filter/session.ts`**

```ts
import { isRecord, type KeyValueStorage } from "./guards";

export const SESSION_KEY = "quartz-filters:query";

export interface FilterState {
  query: string;
  caseSensitive: boolean;
}

export function readSession(
  getStorage: () => KeyValueStorage | null | undefined,
): FilterState | null {
  try {
    const raw = getStorage()?.getItem(SESSION_KEY);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (!isRecord(value) || typeof value.query !== "string") return null;
    return { query: value.query, caseSensitive: value.caseSensitive === true };
  } catch {
    return null;
  }
}

export function writeSession(
  getStorage: () => KeyValueStorage | null | undefined,
  state: FilterState,
): void {
  try {
    getStorage()?.setItem(SESSION_KEY, JSON.stringify(state));
  } catch {
    // Without session storage the filter still works; it just won't survive navigation.
  }
}
```

- [ ] **Step 6: Run the tests to confirm they pass**

Run: `npx vitest run test/index-loader.test.ts test/session.test.ts`

Expected: PASS (6 tests).

- [ ] **Step 7: Commit**

```bash
npx prettier --write src/components/scripts/note-filter test/index-loader.test.ts test/session.test.ts
git add src/components/scripts/note-filter test/index-loader.test.ts test/session.test.ts
git commit -m "Add index loader and session state

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Panel component, strings and styles

**Files:**

- Create: `src/components/NoteFilter.tsx`, `src/components/styles/note-filter.scss`, `test/fixtures/render.ts`
- Create a temporary file: `src/components/scripts/note-filter.inline.ts`, a one-line stub. Task 11 fills it in.
- Modify: `src/i18n/locales/en-US.ts`, `src/i18n/index.ts`, `src/components/index.ts`, `vitest.config.ts`
- Test: `test/note-filter-component.test.ts`

**Interfaces:**

- Consumes: `INDEX_FILE` (Task 6).
- Produces:
  - `NoteFilterOptions = { placeholder?: string; caseSensitive?: boolean }`
  - The default export `NoteFilter` is a `QuartzComponentConstructor<NoteFilterOptions>`.
  - `NoteFilterStrings` is the type of `enUS.components.noteFilter`.
  - `renderComponent(component, container, props?)` is a test helper.
  - The DOM contract Task 11 relies on: the root `.note-filter` element carries these attributes:
    - `data-index-path`
    - `data-case-sensitive="true|false"`
    - `data-strings` (JSON)
  - Inside the root, by class:
    - `[role=tab][data-tab=filter|saved]`
    - `[role=tabpanel][data-panel=filter|saved]`
    - `.qf-query`
    - `.qf-highlight`
    - `textarea.qf-input`
    - `button.qf-case[aria-pressed]`
    - `.qf-error`
    - `ol.qf-clauses`
    - `.qf-status`
    - `button.qf-save`
    - `button.qf-clear`
    - `form.qf-save-form[hidden]`
    - `input.qf-name`
    - `.qf-replace[hidden]`
    - `button.qf-save-confirm`
    - `button.qf-save-cancel`
    - `.qf-count`
    - `.qf-saved-note`
    - `ul.qf-bookmarks`
- Deviation: there is no `indexPath` option (see "Deviations from the spec"), and field names are coloured but not bold.

- [ ] **Step 1: Stub vitest's handling of `.scss` and `.inline.ts` imports in `vitest.config.ts`**

tsup turns these imports into strings during the build. Vitest can't, so tests load them as empty strings.

```ts
import { defineConfig } from "vitest/config";

const STUB_PREFIX = "\0quartz-asset-stub:";

export default defineConfig({
  plugins: [
    {
      name: "quartz-asset-stubs",
      enforce: "pre",
      resolveId(source) {
        return /\.scss$|\.inline\.ts$/.test(source) ? STUB_PREFIX + source : null;
      },
      load(id) {
        return id.startsWith(STUB_PREFIX) ? "export default ''" : null;
      },
    },
  ],
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
    reporters: ["default"],
  },
});
```

- [ ] **Step 2: Create `test/fixtures/render.ts`**

```ts
import { h, render, type FunctionComponent } from "preact";
import type { QuartzComponent } from "@quartz-community/types";

/** Renders a Quartz component into `container` with a minimal `cfg`. */
export function renderComponent(
  component: QuartzComponent,
  container: HTMLElement,
  props: Record<string, unknown> = {},
): void {
  const Component = component as unknown as FunctionComponent<Record<string, unknown>>;
  render(h(Component, { cfg: { locale: "en-US" }, ...props }), container);
}
```

- [ ] **Step 3: Write the failing tests in `test/note-filter-component.test.ts`**

```ts
// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import NoteFilter from "../src/components/NoteFilter";
import { renderComponent } from "./fixtures/render";

const mount = (options?: Parameters<typeof NoteFilter>[0]) => {
  const container = document.createElement("div");
  renderComponent(NoteFilter(options), container);
  return container.querySelector(".note-filter") as HTMLElement;
};

describe("NoteFilter", () => {
  it("renders Filter and Saved tabs wired to their panels", () => {
    const root = mount();
    const tabs = Array.from(root.querySelectorAll('[role="tab"]'));
    expect(tabs.map((t) => [t.textContent?.trim(), t.getAttribute("aria-selected")])).toEqual([
      ["Filter", "true"],
      ["Saved", "false"],
    ]);
    for (const tab of tabs) {
      const panel = root.querySelector(`#${tab.getAttribute("aria-controls")}`);
      expect(panel?.getAttribute("role")).toBe("tabpanel");
      expect(panel?.getAttribute("aria-labelledby")).toBe(tab.id);
    }
    expect(root.querySelector('[data-panel="saved"]')?.hasAttribute("hidden")).toBe(true);
  });

  it("passes options and strings to the client script", () => {
    const root = mount({ caseSensitive: true, placeholder: "has status" });
    expect(root.dataset.indexPath).toBe("static/quartz-filters/index.json");
    expect(root.dataset.caseSensitive).toBe("true");
    expect(JSON.parse(root.dataset.strings ?? "{}").tabSaved).toBe("Saved");
    expect(root.querySelector("textarea")?.getAttribute("placeholder")).toBe("has status");
    expect(root.querySelector(".qf-case")?.getAttribute("aria-pressed")).toBe("true");
  });

  it("defaults to case-insensitive matching", () => {
    expect(mount().querySelector(".qf-case")?.getAttribute("aria-pressed")).toBe("false");
  });

  it("gives each instance its own ids", () => {
    const a = mount().querySelector('[role="tab"]')?.id;
    const b = mount().querySelector('[role="tab"]')?.id;
    expect(a).not.toBe(b);
  });
});
```

- [ ] **Step 4: Run the tests to confirm they fail**

Run: `npx vitest run test/note-filter-component.test.ts`

Expected: FAIL with `Failed to resolve import "../src/components/NoteFilter"`.

- [ ] **Step 5: Replace `src/i18n/locales/en-US.ts`**

```ts
export default {
  components: {
    noteFilter: {
      label: "Filter notes",
      tabFilter: "Filter",
      tabSaved: "Saved",
      matchCase: "Match case",
      removeClause: "Remove clause",
      save: "Save",
      clear: "Clear",
      cancel: "Cancel",
      replace: "Replace",
      nameLabel: "Name",
      replacePrompt: 'Replace the saved filter "{name}"?',
      deleteBookmark: 'Delete "{name}"',
      errorAt: "{message} (column {column})",
      loading: "Loading notes…",
      loadFailed: "Couldn't load filter data.",
      matched: "{matched} of {total} notes",
      total: "{total} notes",
      noExplorer: "Add the Explorer plugin to filter notes.",
      noMatches: "No notes match this filter.",
      clearFilter: "Clear filter",
      filtered: "Filtered",
      savedEmpty: "Save a filter to run it again later.",
      savingOff: "Saving is off in this browser.",
    },
  },
};
```

- [ ] **Step 6: Replace `src/i18n/index.ts`**

```ts
import enUS from "./locales/en-US";

const locales: Record<string, typeof enUS> = {
  "en-US": enUS,
};

export type NoteFilterStrings = typeof enUS.components.noteFilter;

export function i18n(locale: string) {
  return locales[locale] || enUS;
}
```

- [ ] **Step 7: Create the stub `src/components/scripts/note-filter.inline.ts`**

```ts
// Filled in by Task 11.
export {};
```

- [ ] **Step 8: Create `src/components/NoteFilter.tsx`**

```tsx
import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types";
import { i18n } from "../i18n";
import { INDEX_FILE } from "../index-format";
import { classNames } from "../util/lang";
import style from "./styles/note-filter.scss";
// @ts-expect-error - inline script import handled by Quartz bundler
import script from "./scripts/note-filter.inline.ts";

export interface NoteFilterOptions {
  /** Example query shown in the empty input. */
  placeholder?: string;
  /** Whether "Match case" starts switched on. Readers can still flip it. */
  caseSensitive?: boolean;
}

let instances = 0;

export default ((opts?: NoteFilterOptions) => {
  const { placeholder = 'topic is "Electronics"', caseSensitive = false } = opts ?? {};

  const Component: QuartzComponent = (props: QuartzComponentProps) => {
    const t = i18n(props.cfg?.locale ?? "en-US").components.noteFilter;
    const id = `note-filter-${instances++}`;

    return (
      <div
        class={classNames(props.displayClass, "note-filter")}
        data-index-path={INDEX_FILE}
        data-case-sensitive={String(caseSensitive)}
        data-strings={JSON.stringify(t)}
      >
        <div class="qf-tabs" role="tablist" aria-label={t.label}>
          <button
            type="button"
            role="tab"
            class="qf-tab"
            id={`${id}-tab-filter`}
            aria-controls={`${id}-filter`}
            aria-selected="true"
            data-tab="filter"
          >
            {t.tabFilter}
          </button>
          <button
            type="button"
            role="tab"
            class="qf-tab"
            id={`${id}-tab-saved`}
            aria-controls={`${id}-saved`}
            aria-selected="false"
            tabIndex={-1}
            data-tab="saved"
          >
            {t.tabSaved} <span class="qf-count"></span>
          </button>
        </div>

        <div
          class="qf-panel"
          role="tabpanel"
          id={`${id}-filter`}
          aria-labelledby={`${id}-tab-filter`}
          data-panel="filter"
        >
          <div class="qf-query">
            <pre class="qf-highlight" aria-hidden="true"></pre>
            <textarea
              class="qf-input"
              rows={1}
              spellcheck={false}
              autocomplete="off"
              aria-label={t.label}
              placeholder={placeholder}
            ></textarea>
            <button
              type="button"
              class="qf-case"
              aria-pressed={String(caseSensitive)}
              aria-label={t.matchCase}
              title={t.matchCase}
            >
              Aa
            </button>
          </div>
          <p class="qf-error" role="alert" hidden></p>
          <ol class="qf-clauses"></ol>
          <div class="qf-status-row">
            <span class="qf-status" aria-live="polite"></span>
            <span class="qf-actions">
              <button type="button" class="qf-link qf-save">
                {t.save}
              </button>
              <button type="button" class="qf-link qf-clear">
                {t.clear}
              </button>
            </span>
          </div>
          <form class="qf-save-form" hidden>
            <label>
              {t.nameLabel}
              <input class="qf-name" type="text" autocomplete="off" />
            </label>
            <p class="qf-replace" hidden></p>
            <div class="qf-form-actions">
              <button type="button" class="qf-link qf-save-cancel">
                {t.cancel}
              </button>
              <button type="submit" class="qf-link qf-save-confirm">
                {t.save}
              </button>
            </div>
          </form>
        </div>

        <div
          class="qf-panel"
          role="tabpanel"
          id={`${id}-saved`}
          aria-labelledby={`${id}-tab-saved`}
          data-panel="saved"
          hidden
        >
          <p class="qf-note qf-saved-note"></p>
          <ul class="qf-bookmarks"></ul>
        </div>
      </div>
    );
  };

  Component.css = style;
  Component.afterDOMLoaded = script;

  return Component;
}) satisfies QuartzComponentConstructor<NoteFilterOptions>;
```

- [ ] **Step 9: Create `src/components/styles/note-filter.scss`**

```scss
// Uses only Quartz theme variables, so the panel follows the site's theme and dark mode.
// The overlay and the textarea must keep the same font, size and padding, or the caret
// drifts away from the highlighted text.

@mixin focus-ring {
  &:focus-visible {
    outline: 2px solid var(--secondary);
    outline-offset: 2px;
    border-radius: 3px;
  }
}

.note-filter {
  margin: 0.5rem 0 1.25rem;
  font-family: var(--bodyFont);
  color: var(--darkgray);

  .qf-tabs {
    display: flex;
    gap: 1.1rem;
    border-bottom: 1px solid var(--lightgray);
    margin-bottom: 0.75rem;
  }

  .qf-tab {
    background: none;
    border: 0;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    padding: 0 0 0.4rem;
    cursor: pointer;
    font-family: var(--headerFont);
    font-size: 1rem;
    color: var(--gray);
    @include focus-ring;

    &[aria-selected="true"] {
      color: var(--dark);
      font-weight: 700;
      border-bottom-color: var(--secondary);
    }
  }

  .qf-count {
    font-family: var(--bodyFont);
    font-weight: 400;
    color: var(--gray);
  }

  .qf-query {
    position: relative;
  }

  .qf-highlight,
  .qf-input {
    box-sizing: border-box;
    width: 100%;
    margin: 0;
    padding: 0.5rem 2.6rem 0.5rem 0.65rem;
    border: 1px solid transparent;
    border-radius: 5px;
    font-family: var(--codeFont);
    font-size: 0.85rem;
    font-weight: 400;
    line-height: 1.55;
    letter-spacing: normal;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  .qf-highlight {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    color: var(--dark);
    background: none;
  }

  .qf-input {
    position: relative;
    display: block;
    resize: none;
    overflow: hidden;
    color: transparent;
    caret-color: var(--dark);
    background: transparent;
    border-color: var(--lightgray);

    &::placeholder {
      color: var(--gray);
    }

    &:focus {
      outline: none;
      border-color: var(--secondary);
      box-shadow: 0 0 0 2px var(--highlight);
    }
  }

  .qf-field {
    color: var(--secondary);
  }

  .qf-keyword,
  .qf-op,
  .qf-paren {
    color: var(--gray);
  }

  .qf-value {
    color: color-mix(in srgb, var(--tertiary) 70%, var(--dark));
  }

  .qf-invalid {
    text-decoration: underline wavy;
    text-decoration-color: var(--secondary);
  }

  .qf-case {
    position: absolute;
    top: 0.35rem;
    right: 0.35rem;
    padding: 0.1rem 0.35rem;
    border: 1px solid transparent;
    border-radius: 4px;
    background: none;
    cursor: pointer;
    font-family: var(--codeFont);
    font-size: 0.75rem;
    color: var(--gray);
    @include focus-ring;

    &[aria-pressed="true"] {
      color: var(--secondary);
      background: var(--highlight);
      border-color: var(--secondary);
    }
  }

  .qf-error {
    margin: 0.4rem 0 0;
    font-size: 0.8rem;
    color: var(--dark);
  }

  .qf-clauses {
    list-style: none;
    margin: 0.5rem 0 0;
    padding: 0;
    font-family: var(--codeFont);
    font-size: 0.8rem;
    color: var(--dark);

    li {
      margin: 0;
    }
  }

  .qf-clause {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
    padding: 0.15rem 0 0.15rem 0.55rem;
    border-left: 2px solid var(--tertiary);
    overflow-wrap: anywhere;
  }

  .qf-join {
    padding: 0.05rem 0 0.05rem 0.55rem;
    border-left: 2px solid var(--lightgray);
    font-size: 0.72rem;
    color: var(--gray);
  }

  .qf-clause-remove,
  .qf-bookmark-remove {
    flex: none;
    background: none;
    border: 0;
    padding: 0 0.2rem;
    cursor: pointer;
    font-size: 1rem;
    line-height: 1;
    color: var(--gray);
    @include focus-ring;

    &:hover {
      color: var(--dark);
    }
  }

  .qf-status-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 0.5rem;
    margin-top: 0.6rem;
    font-size: 0.8rem;
  }

  .qf-actions,
  .qf-form-actions {
    display: flex;
    gap: 0.75rem;
  }

  .qf-form-actions {
    justify-content: flex-end;
  }

  .qf-link {
    background: none;
    border: 0;
    padding: 0;
    cursor: pointer;
    font: inherit;
    color: var(--secondary);
    @include focus-ring;

    &:hover {
      text-decoration: underline;
    }

    &:disabled {
      color: var(--gray);
      cursor: default;
      text-decoration: none;
    }
  }

  .qf-save-form {
    display: grid;
    gap: 0.4rem;
    margin-top: 0.6rem;
    font-size: 0.85rem;

    &[hidden] {
      display: none;
    }

    label {
      display: grid;
      gap: 0.2rem;
    }

    input {
      font: inherit;
      padding: 0.3rem 0.5rem;
      border: 1px solid var(--lightgray);
      border-radius: 4px;
      background: var(--light);
      color: var(--dark);

      &:focus {
        outline: none;
        border-color: var(--secondary);
      }
    }
  }

  .qf-replace {
    margin: 0;
    color: var(--dark);
  }

  .qf-note {
    margin: 0.25rem 0;
    font-size: 0.85rem;
  }

  .qf-bookmarks {
    list-style: none;
    margin: 0;
    padding: 0;

    li {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      margin: 0;
      border-bottom: 1px solid var(--lightgray);

      &:last-child {
        border-bottom: 0;
      }
    }
  }

  .qf-bookmark {
    flex: 1;
    min-width: 0;
    padding: 0.45rem 0 0.45rem 0.5rem;
    border: 0;
    border-left: 2px solid transparent;
    background: none;
    cursor: pointer;
    text-align: left;
    font: inherit;
    color: inherit;
    @include focus-ring;

    &[aria-current="true"] {
      border-left-color: var(--secondary);

      .qf-bookmark-name {
        color: var(--secondary);
      }
    }
  }

  .qf-bookmark-name {
    display: block;
    font-size: 0.92rem;
    font-weight: 600;
    color: var(--dark);
  }

  .qf-bookmark-query {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: var(--codeFont);
    font-size: 0.72rem;
    color: var(--gray);
  }
}

// Explorer integration (classes and attributes set by explorer-sync.ts)
.explorer {
  .qf-hidden {
    display: none !important;
  }

  .title-button h2[data-qf-filtered]::after {
    content: attr(data-qf-filtered);
    margin-left: 0.5rem;
    font-family: var(--bodyFont);
    font-size: 0.75rem;
    font-weight: 400;
    color: var(--secondary);
  }

  .qf-empty {
    margin: 0.5rem 0;
    font-size: 0.85rem;
    color: var(--darkgray);

    button {
      background: none;
      border: 0;
      padding: 0;
      cursor: pointer;
      font: inherit;
      color: var(--secondary);

      &:hover {
        text-decoration: underline;
      }

      &:focus-visible {
        outline: 2px solid var(--secondary);
        outline-offset: 2px;
      }
    }
  }
}
```

- [ ] **Step 10: Replace `src/components/index.ts`**

```ts
export { default as NoteFilter } from "./NoteFilter";
export type { NoteFilterOptions } from "./NoteFilter";
```

- [ ] **Step 11: Run the tests, typecheck and build**

Run: `npx vitest run test/note-filter-component.test.ts && npm run typecheck && npm run build`

Expected:

- The tests PASS (4 tests).
- Typecheck exits 0.
- The build succeeds, which proves sass compiles the SCSS.
- If the textarea's `autocomplete` or `spellcheck` attributes fail typecheck under Preact's JSX types, use `spellcheck={false}` and drop `autocomplete`.

- [ ] **Step 12: Commit**

```bash
npx prettier --write src test vitest.config.ts
git add src test vitest.config.ts
git commit -m "Add NoteFilter panel markup, strings and styles

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11: Panel controller and browser entry

**Files:**

- Create: `src/components/scripts/note-filter/panel.ts`
- Replace: `src/components/scripts/note-filter.inline.ts`
- Test: `test/panel.test.ts`

**Interfaces:**

- Consumes:
  - `parse` (Task 3), `matches` (Task 4), and `formatClause`, `connectiveAfter`, `removeClause`, `highlight` (Task 5)
  - `IndexedNote` and `INDEX_FILE` (Task 6)
  - `BookmarkStore` and `createBookmarkStore` (Task 7)
  - `ExplorerSync` and `createExplorerSync` (Task 8)
  - `IndexLoader`, `createIndexLoader`, `readSession` and `writeSession` (Task 9)
  - `NoteFilterStrings` and the DOM contract (Task 10)
- Produces:
  - `PanelDeps`, with these fields:
    - `loader: IndexLoader`
    - `bookmarks: BookmarkStore`
    - `createSync: (onClear: () => void) => ExplorerSync`
    - `hrefFor: (path: string) => string`
    - `session: () => KeyValueStorage | null | undefined`
    - `debounceMs?: number`
  - `mountNoteFilter(root: HTMLElement, deps: PanelDeps): () => void`. It returns a cleanup function, and also registers it with `window.addCleanup` when that exists.

- [ ] **Step 1: Write the failing tests in `test/panel.test.ts`**

```ts
// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import NoteFilter from "../src/components/NoteFilter";
import { createBookmarkStore } from "../src/components/scripts/note-filter/bookmarks";
import { createExplorerSync } from "../src/components/scripts/note-filter/explorer-sync";
import type { IndexLoader } from "../src/components/scripts/note-filter/index-loader";
import { mountNoteFilter } from "../src/components/scripts/note-filter/panel";
import { SESSION_KEY } from "../src/components/scripts/note-filter/session";
import type { IndexedNote } from "../src/index-format";
import { explorerHtml } from "./fixtures/explorer";
import { renderComponent } from "./fixtures/render";
import { BrokenStorage, MemoryStorage } from "./fixtures/storage";

const note = (
  path: string,
  title: string,
  fields: Record<string, string | string[]>,
): IndexedNote => ({
  path,
  title,
  fields: { title, path, ...fields },
});

const NOTES = [
  note("electronics/h-bridge", "H-bridge motor driver", {
    topic: "Electronics",
    tags: ["seedling"],
  }),
  note("electronics/esp32", "ESP32 pinout", { topic: "Electronics", tags: ["evergreen"] }),
  note("reading/dune", "Dune", { topic: "Books", tags: ["seedling"] }),
];

interface SetupOptions {
  loader?: IndexLoader;
  explorer?: boolean;
  local?: MemoryStorage;
  session?: MemoryStorage;
}

function setup(options: SetupOptions = {}) {
  document.body.innerHTML =
    '<div id="panel"></div>' +
    (options.explorer === false
      ? ""
      : explorerHtml(NOTES.map((n) => ({ slug: n.path, title: n.title }))));
  const container = document.getElementById("panel") as HTMLElement;
  renderComponent(NoteFilter(), container);
  const root = container.querySelector(".note-filter") as HTMLElement;
  const strings = JSON.parse(root.dataset.strings ?? "{}");
  const local = options.local ?? new MemoryStorage();
  const session = options.session ?? new MemoryStorage();
  const cleanup = mountNoteFilter(root, {
    loader: options.loader ?? { load: () => Promise.resolve(NOTES) },
    bookmarks: createBookmarkStore(() => local),
    createSync: (onClear) => createExplorerSync(document, strings, onClear),
    hrefFor: (path) => `/${path}`,
    session: () => session,
  });
  const $ = <T extends Element>(selector: string) => root.querySelector(selector) as T;
  return { root, cleanup, local, session, $, input: $<HTMLTextAreaElement>(".qf-input") };
}

const type = (input: HTMLTextAreaElement, value: string) => {
  input.value = value;
  input.dispatchEvent(new Event("input", { bubbles: true }));
};
const settle = () => vi.advanceTimersByTimeAsync(200);
const visibleNotes = () =>
  Array.from(document.querySelectorAll(".explorer-ul a.nav-file-title"))
    .filter((a) => !a.closest(".qf-hidden"))
    .map((a) => a.textContent);
const submit = (form: HTMLFormElement) =>
  form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

describe("mountNoteFilter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("filters the Explorer once the reader stops typing", async () => {
    const { input, $ } = setup();
    type(input, 'topic is "Electronics"');
    expect(visibleNotes()).toHaveLength(3);

    await settle();
    expect(visibleNotes()).toEqual(["H-bridge motor driver", "ESP32 pinout"]);
    expect($(".qf-status").textContent).toBe("2 of 3 notes");
  });

  it("updates the syntax highlight on every keystroke", () => {
    const { input, $ } = setup();
    type(input, "topic is Books");
    expect($(".qf-highlight .qf-field").textContent).toBe("topic");
    expect($(".qf-highlight .qf-value").textContent).toBe("Books");
  });

  it("lists the parsed clauses and their connective", async () => {
    const { input, $ } = setup();
    type(input, 'topic is Electronics and "seedling" in tags');
    await settle();
    const items = Array.from($(".qf-clauses").children).map((li) => [
      li.className,
      li.firstChild?.textContent,
    ]);
    expect(items).toEqual([
      ["qf-clause", 'topic is "Electronics"'],
      ["qf-join", "and"],
      ["qf-clause", '"seedling" in tags'],
    ]);
  });

  it("keeps the last valid filter while the query has an error", async () => {
    const { input, $ } = setup();
    type(input, "topic is Electronics");
    await settle();
    type(input, "topic is Electronics and");
    await settle();

    expect(visibleNotes()).toEqual(["H-bridge motor driver", "ESP32 pinout"]);
    expect($(".qf-error").hidden).toBe(false);
    expect($(".qf-error").textContent).toBe("Expected a clause (column 25)");
  });

  it("re-filters immediately when Match case is flipped", async () => {
    const { input, $ } = setup();
    type(input, "topic is electronics");
    await settle();
    expect(visibleNotes()).toHaveLength(2);

    $<HTMLButtonElement>(".qf-case").click();
    expect($(".qf-case").getAttribute("aria-pressed")).toBe("true");
    expect(visibleNotes()).toEqual([]);
    expect(document.querySelector(".qf-empty")).not.toBeNull();
  });

  it("removes a clause with its ×", async () => {
    const { input, $ } = setup();
    type(input, 'topic is "Electronics" and "seedling" in tags');
    await settle();
    expect(visibleNotes()).toEqual(["H-bridge motor driver"]);

    $<HTMLButtonElement>(".qf-clause-remove").click();
    expect(input.value).toBe('"seedling" in tags');
    expect(visibleNotes()).toEqual(["H-bridge motor driver", "Dune"]);
  });

  it("clears the filter", async () => {
    const { input, $ } = setup();
    type(input, "topic is Books");
    await settle();
    $<HTMLButtonElement>(".qf-clear").click();
    expect(input.value).toBe("");
    expect(visibleNotes()).toHaveLength(3);
    expect(document.querySelector(".explorer")?.hasAttribute("data-qf-filtered")).toBe(false);
  });

  it("saves a bookmark, asks before replacing one, and loads it with its case setting", async () => {
    const { input, $, local } = setup();
    type(input, "topic is Electronics");
    await settle();
    $<HTMLButtonElement>(".qf-case").click();

    $<HTMLButtonElement>(".qf-save").click();
    const form = $<HTMLFormElement>(".qf-save-form");
    const name = $<HTMLInputElement>(".qf-name");
    expect(form.hidden).toBe(false);
    expect(name.value).toBe("topic is Electronics");
    name.value = "Electronics";
    submit(form);
    expect(form.hidden).toBe(true);
    expect($(".qf-count").textContent).toBe("1");
    expect(JSON.parse(local.getItem("quartz-filters:bookmarks") ?? "[]")).toEqual([
      { name: "Electronics", query: "topic is Electronics", caseSensitive: true },
    ]);

    type(input, "topic is Books");
    await settle();
    $<HTMLButtonElement>(".qf-save").click();
    name.value = "Electronics";
    submit(form);
    expect($(".qf-replace").hidden).toBe(false);
    expect($(".qf-replace").textContent).toBe('Replace the saved filter "Electronics"?');
    expect($(".qf-save-confirm").textContent).toBe("Replace");
    $<HTMLButtonElement>(".qf-save-cancel").click();
    expect(form.hidden).toBe(true);

    $<HTMLButtonElement>(".qf-case").click();
    type(input, "");
    await settle();
    $<HTMLButtonElement>('[data-tab="saved"]').click();
    $<HTMLButtonElement>(".qf-bookmark").click();

    expect($('[data-tab="filter"]').getAttribute("aria-selected")).toBe("true");
    expect(input.value).toBe("topic is Electronics");
    expect($(".qf-case").getAttribute("aria-pressed")).toBe("true");
    expect(visibleNotes()).toEqual(["H-bridge motor driver", "ESP32 pinout"]);
    expect($(".qf-bookmark").getAttribute("aria-current")).toBe("true");
  });

  it("deletes a bookmark", async () => {
    const { input, $ } = setup();
    type(input, "topic is Books");
    await settle();
    $<HTMLButtonElement>(".qf-save").click();
    submit($<HTMLFormElement>(".qf-save-form"));
    $<HTMLButtonElement>(".qf-bookmark-remove").click();
    expect($(".qf-bookmarks").children).toHaveLength(0);
    expect($(".qf-saved-note").textContent).toBe("Save a filter to run it again later.");
  });

  it("shows bookmark names and queries as text, never as HTML", async () => {
    const { input, $ } = setup();
    const name = '<img src=x onerror="window.__xss = 1">';
    type(input, 'title contains "<b>bold</b>"');
    await settle();
    $<HTMLButtonElement>(".qf-save").click();
    $<HTMLInputElement>(".qf-name").value = name;
    submit($<HTMLFormElement>(".qf-save-form"));

    expect($(".qf-bookmark-name").textContent).toBe(name);
    expect($(".qf-bookmarks img")).toBeNull();
    expect($(".qf-clauses b")).toBeNull();
    expect($(".qf-highlight b")).toBeNull();
  });

  it("explains when saving is off", () => {
    const { $ } = setup({ local: new BrokenStorage() });
    expect($<HTMLButtonElement>(".qf-save").disabled).toBe(true);
    expect($(".qf-saved-note").textContent).toBe("Saving is off in this browser.");
  });

  it("reports a failed load and retries on the next focus", async () => {
    const load = vi
      .fn<() => Promise<IndexedNote[]>>()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValue(NOTES);
    const { input, $ } = setup({ loader: { load } });
    type(input, "topic is Books");
    await settle();
    expect($(".qf-status").textContent).toBe("Couldn't load filter data.");
    expect(visibleNotes()).toHaveLength(3);

    input.dispatchEvent(new Event("focus"));
    await settle();
    expect($(".qf-status").textContent).toBe("1 of 3 notes");
    expect(visibleNotes()).toEqual(["Dune"]);
  });

  it("says when the page has no Explorer", async () => {
    const { input, $ } = setup({ explorer: false });
    type(input, "topic is Books");
    await settle();
    expect($(".qf-status").textContent).toBe(
      "1 of 3 notes Add the Explorer plugin to filter notes.",
    );
  });

  it("restores the query from the session after navigation", async () => {
    const session = new MemoryStorage();
    const first = setup({ session });
    type(first.input, "topic is Books");
    await settle();
    expect(JSON.parse(session.getItem(SESSION_KEY) ?? "{}")).toEqual({
      query: "topic is Books",
      caseSensitive: false,
    });
    first.cleanup();

    const second = setup({ session });
    expect(second.input.value).toBe("topic is Books");
    await settle();
    expect(visibleNotes()).toEqual(["Dune"]);
  });

  it("ignores an index that arrives after the panel was unmounted", async () => {
    let resolve: (notes: IndexedNote[]) => void = () => {};
    const loader = { load: () => new Promise<IndexedNote[]>((r) => (resolve = r)) };
    const { input, cleanup } = setup({ loader });
    type(input, "topic is Books");
    await settle();
    cleanup();
    resolve(NOTES);
    await settle();
    expect(document.querySelectorAll(".qf-hidden")).toHaveLength(0);
  });

  it("moves between tabs with the arrow keys", () => {
    const { $ } = setup();
    $('[data-tab="filter"]').dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
    );
    expect($('[data-tab="saved"]').getAttribute("aria-selected")).toBe("true");
    expect($<HTMLElement>('[data-panel="saved"]').hidden).toBe(false);
    expect($<HTMLElement>('[data-panel="filter"]').hidden).toBe(true);
    expect(document.activeElement).toBe($('[data-tab="saved"]'));
  });
});
```

- [ ] **Step 2: Run the tests to confirm they fail**

Run: `npx vitest run test/panel.test.ts`

Expected: FAIL with `Failed to resolve import "../src/components/scripts/note-filter/panel"`.

- [ ] **Step 3: Create `src/components/scripts/note-filter/panel.ts`**

```ts
import type { NoteFilterStrings } from "../../../i18n";
import type { IndexedNote } from "../../../index-format";
import { matches } from "../../../query/evaluate";
import { connectiveAfter, formatClause, removeClause } from "../../../query/format";
import { highlight } from "../../../query/highlight";
import { parse } from "../../../query/parser";
import type { Expr, ParseResult } from "../../../query/types";
import type { Bookmark, BookmarkStore } from "./bookmarks";
import type { ExplorerSync } from "./explorer-sync";
import type { KeyValueStorage } from "./guards";
import type { IndexLoader } from "./index-loader";
import { readSession, writeSession } from "./session";

export interface PanelDeps {
  loader: IndexLoader;
  bookmarks: BookmarkStore;
  /** Creates the Explorer sync. `onClear` runs when the reader clicks "Clear filter" in the Explorer. */
  createSync: (onClear: () => void) => ExplorerSync;
  /** The Explorer's link `href` for a note path. */
  hrefFor: (path: string) => string;
  session: () => KeyValueStorage | null | undefined;
  debounceMs?: number;
}

const fmt = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (match, key: string) => String(values[key] ?? match));

export function mountNoteFilter(root: HTMLElement, deps: PanelDeps): () => void {
  const strings = JSON.parse(root.dataset.strings ?? "{}") as NoteFilterStrings;
  const doc = root.ownerDocument;
  const must = <T extends Element>(selector: string): T => {
    const el = root.querySelector<T>(selector);
    if (!el) throw new Error(`NoteFilter markup is missing ${selector}`);
    return el;
  };

  const el = {
    tabs: Array.from(root.querySelectorAll<HTMLButtonElement>('[role="tab"]')),
    panels: Array.from(root.querySelectorAll<HTMLElement>('[role="tabpanel"]')),
    input: must<HTMLTextAreaElement>(".qf-input"),
    highlight: must<HTMLElement>(".qf-highlight"),
    caseToggle: must<HTMLButtonElement>(".qf-case"),
    error: must<HTMLElement>(".qf-error"),
    clauses: must<HTMLElement>(".qf-clauses"),
    status: must<HTMLElement>(".qf-status"),
    save: must<HTMLButtonElement>(".qf-save"),
    clear: must<HTMLButtonElement>(".qf-clear"),
    form: must<HTMLFormElement>(".qf-save-form"),
    name: must<HTMLInputElement>(".qf-name"),
    replace: must<HTMLElement>(".qf-replace"),
    confirm: must<HTMLButtonElement>(".qf-save-confirm"),
    cancel: must<HTMLButtonElement>(".qf-save-cancel"),
    count: must<HTMLElement>(".qf-count"),
    savedNote: must<HTMLElement>(".qf-saved-note"),
    bookmarkList: must<HTMLElement>(".qf-bookmarks"),
  };

  let mounted = true;
  let notes: IndexedNote[] | null = null;
  let loadState: "idle" | "loading" | "ready" | "failed" = "idle";
  let parsed: ParseResult = parse("");
  /** The last query that parsed. `null` means no filter. */
  let active: Expr | null = null;
  let pendingReplace: string | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const removers: Array<() => void> = [];
  const sync = deps.createSync(() => setQuery(""));

  function on<K extends keyof HTMLElementEventMap>(
    target: HTMLElement,
    type: K,
    handler: (event: HTMLElementEventMap[K]) => void,
  ) {
    target.addEventListener(type, handler);
    removers.push(() => target.removeEventListener(type, handler));
  }

  const caseSensitive = () => el.caseToggle.getAttribute("aria-pressed") === "true";
  const setCase = (on: boolean) => el.caseToggle.setAttribute("aria-pressed", String(on));
  const query = () => el.input.value.trim();

  function ensureLoaded() {
    if (loadState === "loading" || loadState === "ready") return;
    loadState = "loading";
    renderStatus();
    deps.loader.load().then(
      (result) => {
        if (!mounted) return;
        notes = result;
        loadState = "ready";
        applyFilter();
      },
      () => {
        if (!mounted) return;
        loadState = "failed";
        renderStatus();
      },
    );
  }

  function render() {
    clearTimeout(timer);
    parsed = parse(el.input.value);
    if (!parsed.error) active = parsed.ast;
    renderHighlight();
    renderClauses();
    el.error.hidden = parsed.error === null;
    el.error.textContent = parsed.error
      ? fmt(strings.errorAt, { message: parsed.error.message, column: parsed.error.column })
      : "";
    el.save.disabled = !deps.bookmarks.available || !query();
    el.clear.disabled = !el.input.value;
    renderBookmarks();
    if (query()) ensureLoaded();
    applyFilter();
    writeSession(deps.session, { query: el.input.value, caseSensitive: caseSensitive() });
  }

  function renderHighlight() {
    el.highlight.replaceChildren(
      ...highlight(el.input.value).map((segment) => {
        const span = doc.createElement("span");
        span.className = `qf-${segment.kind}`;
        span.textContent = segment.text;
        return span;
      }),
    );
    // Keeps a trailing newline from collapsing, so the overlay matches the textarea's height.
    el.highlight.append("\n");
    el.input.style.height = "auto";
    if (el.input.scrollHeight > 0) el.input.style.height = `${el.input.scrollHeight}px`;
  }

  function renderClauses() {
    const items: HTMLElement[] = [];
    parsed.clauses.forEach((clause, index) => {
      const text = formatClause(clause);
      const item = doc.createElement("li");
      item.className = "qf-clause";
      const label = doc.createElement("span");
      label.textContent = text;
      const remove = doc.createElement("button");
      remove.type = "button";
      remove.className = "qf-clause-remove";
      remove.dataset.clause = String(index);
      remove.textContent = "×";
      remove.setAttribute("aria-label", `${strings.removeClause}: ${text}`);
      item.append(label, remove);
      items.push(item);

      const join =
        index < parsed.clauses.length - 1 ? connectiveAfter(el.input.value, clause) : null;
      if (join) {
        const joiner = doc.createElement("li");
        joiner.className = "qf-join";
        joiner.setAttribute("aria-hidden", "true");
        joiner.textContent = join;
        items.push(joiner);
      }
    });
    el.clauses.replaceChildren(...items);
  }

  function applyFilter() {
    const expr = active;
    if (!notes || !expr) {
      sync.apply(null);
      renderStatus();
      return;
    }
    const opts = { caseSensitive: caseSensitive() };
    const hits = notes.filter((n) => matches(expr, n.fields, opts));
    sync.apply(new Set(hits.map((n) => deps.hrefFor(n.path))));
    renderStatus(hits.length);
  }

  function renderStatus(matched?: number) {
    let text = "";
    if (loadState === "loading") text = strings.loading;
    else if (loadState === "failed") text = strings.loadFailed;
    else if (notes && matched !== undefined) {
      text = fmt(strings.matched, { matched, total: notes.length });
    } else if (notes) text = fmt(strings.total, { total: notes.length });
    if (sync.count === 0 && loadState !== "failed") {
      text = text ? `${text} ${strings.noExplorer}` : strings.noExplorer;
    }
    el.status.textContent = text;
  }

  function currentBookmark(list: Bookmark[]): Bookmark | undefined {
    return list.find((b) => b.query === query() && b.caseSensitive === caseSensitive());
  }

  function renderBookmarks() {
    const list = deps.bookmarks.list();
    const current = currentBookmark(list);
    el.count.textContent = list.length > 0 ? String(list.length) : "";
    el.savedNote.textContent = deps.bookmarks.available ? strings.savedEmpty : strings.savingOff;
    el.savedNote.hidden = deps.bookmarks.available && list.length > 0;
    el.bookmarkList.replaceChildren(
      ...list.map((bookmark) => {
        const item = doc.createElement("li");
        const run = doc.createElement("button");
        run.type = "button";
        run.className = "qf-bookmark";
        run.dataset.name = bookmark.name;
        if (bookmark === current) run.setAttribute("aria-current", "true");
        const name = doc.createElement("span");
        name.className = "qf-bookmark-name";
        name.textContent = bookmark.name;
        const text = doc.createElement("span");
        text.className = "qf-bookmark-query";
        text.textContent = bookmark.query;
        run.append(name, text);

        const remove = doc.createElement("button");
        remove.type = "button";
        remove.className = "qf-bookmark-remove";
        remove.dataset.name = bookmark.name;
        remove.textContent = "×";
        remove.setAttribute("aria-label", fmt(strings.deleteBookmark, { name: bookmark.name }));
        item.append(run, remove);
        return item;
      }),
    );
  }

  function setQuery(value: string) {
    el.input.value = value;
    render();
  }

  function selectTab(name: string, focus = false) {
    for (const tab of el.tabs) {
      const selected = tab.dataset.tab === name;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected && focus) tab.focus();
    }
    for (const panel of el.panels) panel.hidden = panel.dataset.panel !== name;
  }

  function resetReplace() {
    pendingReplace = null;
    el.replace.hidden = true;
    el.replace.textContent = "";
    el.confirm.textContent = strings.save;
  }

  function closeForm() {
    resetReplace();
    el.form.hidden = true;
  }

  // Tabs
  el.tabs.forEach((tab, index) => {
    on(tab, "click", () => selectTab(tab.dataset.tab ?? "filter"));
    on(tab, "keydown", (event) => {
      const targets: Record<string, number> = {
        ArrowRight: index + 1,
        ArrowLeft: index - 1,
        Home: 0,
        End: el.tabs.length - 1,
      };
      const next = targets[event.key];
      if (next === undefined) return;
      event.preventDefault();
      const target = el.tabs[(next + el.tabs.length) % el.tabs.length];
      if (target) selectTab(target.dataset.tab ?? "filter", true);
    });
  });

  // Query input
  on(el.input, "input", () => {
    renderHighlight();
    clearTimeout(timer);
    timer = setTimeout(render, deps.debounceMs ?? 150);
  });
  on(el.input, "keydown", (event) => {
    if (event.key === "Enter") event.preventDefault();
  });
  on(el.input, "focus", ensureLoaded);
  on(el.caseToggle, "click", () => {
    setCase(!caseSensitive());
    render();
  });
  on(el.clear, "click", () => {
    setQuery("");
    el.input.focus();
  });
  on(el.clauses, "click", (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>(".qf-clause-remove");
    const clause = button ? parsed.clauses[Number(button.dataset.clause)] : undefined;
    if (!clause) return;
    setQuery(removeClause(el.input.value, clause));
    el.input.focus();
  });

  // Saving
  on(el.save, "click", () => {
    if (!query()) return;
    resetReplace();
    el.form.hidden = false;
    el.name.value = currentBookmark(deps.bookmarks.list())?.name ?? query();
    el.name.focus();
    el.name.select();
  });
  on(el.cancel, "click", closeForm);
  on(el.name, "input", resetReplace);
  on(el.form, "submit", (event) => {
    event.preventDefault();
    const name = el.name.value.trim();
    if (!name) return;
    if (pendingReplace !== name && deps.bookmarks.find(name)) {
      pendingReplace = name;
      el.replace.textContent = fmt(strings.replacePrompt, { name });
      el.replace.hidden = false;
      el.confirm.textContent = strings.replace;
      return;
    }
    if (deps.bookmarks.save({ name, query: query(), caseSensitive: caseSensitive() })) {
      closeForm();
      renderBookmarks();
    }
  });

  // Bookmarks
  on(el.bookmarkList, "click", (event) => {
    const target = event.target as Element;
    const remove = target.closest<HTMLButtonElement>(".qf-bookmark-remove");
    if (remove?.dataset.name !== undefined) {
      deps.bookmarks.remove(remove.dataset.name);
      renderBookmarks();
      return;
    }
    const run = target.closest<HTMLButtonElement>(".qf-bookmark");
    const bookmark =
      run?.dataset.name !== undefined ? deps.bookmarks.find(run.dataset.name) : undefined;
    if (!bookmark) return;
    setCase(bookmark.caseSensitive);
    setQuery(bookmark.query);
    selectTab("filter");
  });

  // Initial state: the session wins over the author's default.
  const restored = readSession(deps.session);
  el.input.value = restored?.query ?? "";
  setCase(restored ? restored.caseSensitive : root.dataset.caseSensitive === "true");
  render();

  const cleanup = () => {
    mounted = false;
    clearTimeout(timer);
    removers.forEach((remove) => remove());
    sync.disconnect();
  };
  if (typeof window.addCleanup === "function") window.addCleanup(cleanup);
  return cleanup;
}
```

- [ ] **Step 4: Run the tests to confirm they pass**

Run: `npx vitest run test/panel.test.ts`

Expected: PASS (16 tests). If "keeps the last valid filter" fails only on the column, recount: the input `topic is Electronics and` has 24 characters, so an error at the end of the query is column 25.

- [ ] **Step 5: Replace `src/components/scripts/note-filter.inline.ts`**

```ts
/* eslint-disable no-restricted-syntax -- the "nav" listener lives as long as the page;
   every mount registers its own cleanup through window.addCleanup in panel.ts. */
import { resolveBasePath } from "@quartz-community/utils/path";
import type { NoteFilterStrings } from "../../i18n";
import { INDEX_FILE } from "../../index-format";
import { createBookmarkStore } from "./note-filter/bookmarks";
import { createExplorerSync } from "./note-filter/explorer-sync";
import { createIndexLoader, type IndexLoader } from "./note-filter/index-loader";
import { mountNoteFilter } from "./note-filter/panel";

// Module state survives SPA navigation, so the index is fetched once per page load.
const loaders = new Map<string, IndexLoader>();

function loaderFor(url: string): IndexLoader {
  let loader = loaders.get(url);
  if (!loader) {
    loader = createIndexLoader(url);
    loaders.set(url, loader);
  }
  return loader;
}

document.addEventListener("nav", () => {
  for (const root of document.querySelectorAll<HTMLElement>(".note-filter")) {
    const strings = JSON.parse(root.dataset.strings ?? "{}") as NoteFilterStrings;
    mountNoteFilter(root, {
      loader: loaderFor(resolveBasePath(root.dataset.indexPath ?? INDEX_FILE)),
      bookmarks: createBookmarkStore(() => window.localStorage),
      createSync: (onClear) => createExplorerSync(document, strings, onClear),
      hrefFor: (path) => resolveBasePath(path),
      session: () => window.sessionStorage,
    });
  }
});
```

- [ ] **Step 6: Run the full check and build**

Run: `npm run check && npm run build`

Expected: both exit 0.

- If lint flags `panel.ts` for `no-restricted-syntax`, check that the file still contains the literal `window.addCleanup(cleanup)` call.
- After the build, `grep -c "qf-bookmark" dist/components/index.js` prints a number greater than 0. That proves the inline script was bundled as a string.
- `grep -c 'from"@quartz-community\|from "@quartz-community' dist/components/index.js` must print `0`. The inline script runs in the browser, so `resolveBasePath` has to be bundled into the string, not left as a bare import. If the count is not 0, copy `resolveBasePath` into `note-filter/selectors.ts` as a small local helper that reads `document.body.dataset.basepath`.

- [ ] **Step 7: Commit**

```bash
npx prettier --write src test
git add src test
git commit -m "Wire the filter panel: live filtering, bookmarks and session restore

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 12: Manifest, exports, README, changeset and dist

**Files:**

- Modify: `src/index.ts`, `package.json` (`quartz` field), `README.md`
- Create: `.changeset/note-filter.md`
- Rebuild: `dist/`

**Interfaces:**

- Consumes: `FrontmatterIndex` (Task 6) and `NoteFilter` (Task 10).
- Produces: the published package surface:
  - `FrontmatterIndex` and `NoteFilter` from `.`
  - `NoteFilter` from `./components`
  - the option types `FrontmatterIndexOptions` and `NoteFilterOptions`

- [ ] **Step 1: Add the component export to `src/index.ts`**

Add these two lines under the `FrontmatterIndex` exports:

```ts
export { default as NoteFilter } from "./components/NoteFilter";
export type { NoteFilterOptions } from "./components/NoteFilter";
```

- [ ] **Step 2: Replace the `quartz` field in `package.json`**

Quartz passes the same YAML `options` to the emitter and to the component, so their option names must not collide.

Only `string`, `boolean`, `number` and `enum` appear in community `optionSchema`s, so leave the array options (`excludeFields`, `fields`) out of the schema. The README documents them.

```json
"quartz": {
  "name": "quartz-filters",
  "displayName": "Quartz Filters",
  "category": ["emitter", "component"],
  "version": "1.0.0",
  "quartzVersion": ">=5.0.0",
  "dependencies": [],
  "defaultOrder": 50,
  "defaultEnabled": true,
  "defaultOptions": {
    "excludeFields": [],
    "caseSensitive": false
  },
  "optionSchema": {
    "placeholder": { "type": "string" },
    "caseSensitive": { "type": "boolean" }
  },
  "components": {
    "NoteFilter": {
      "displayName": "Note Filter",
      "defaultPosition": "left",
      "defaultPriority": 40
    }
  }
},
```

Also add `"filter"`, `"frontmatter"` and `"explorer"` to `keywords`, and remove `"remark"`, `"rehype"`, `"mdast"` and `"hast"`.

- [ ] **Step 3: Replace `README.md`**

````markdown
# Quartz Filters

Filter the [Explorer](https://quartz.jzhao.xyz/plugins/explorer) by frontmatter, in plain words,
and save the filters you use often.

```
topic is "Electronics" and "seedling" in tags
```

Readers type a query in the sidebar and the Explorer shows only the notes that match. Nothing is
rebuilt, and nothing leaves the reader's browser.

## Install

The panel filters the Explorer, so install both:

```bash
npx quartz plugin add github:quartz-community/explorer
npx quartz plugin add github:speedypleath/quartz-filters
```

```yaml
plugins:
  - source: github:quartz-community/explorer
    enabled: true
  - source: github:speedypleath/quartz-filters
    enabled: true
    options:
      excludeFields: [email, private-notes]
```

The Note Filter panel goes on the left by default, above the Explorer.

> [!warning]
> Every frontmatter field of every published note is written to a public file,
> `static/quartz-filters/index.json`, so the browser can filter without a server. Use
> `excludeFields` (or the `fields` allowlist) for anything you don't want readable.

## Writing a filter

| Clause                                 | Example                  |
| -------------------------------------- | ------------------------ |
| `field is value`, `field is not value` | `topic is "Electronics"` |
| `value in field`, `value not in field` | `"seedling" in tags`     |
| `field contains value`                 | `title contains motor`   |
| `field < > <= >= value`                | `created >= 2026-01-01`  |
| `has field`, `field exists`            | `has status`             |

- **Combining clauses:** use `and`, `or`, `not` and parentheses. `not` binds tightest, then `and`,
  then `or`:

  ```
  topic is Electronics and ("seedling" in tags or status is not done)
  ```

- **Values:**
  - Values can be `"quoted text"`, numbers, dates (`2026-01-01`, or `2026-01-01T10:30`) or
    `true`/`false`.
  - A single word doesn't need quotes. Quote a value if it has spaces or is a keyword (`is`, `not`,
    `in`, `and`, `or`, `has`, `exists`, `contains`).
- **Fields:** any frontmatter key works. `title` and `path` (the note's slug) are always available.

### How values match

- **Match case:** with the **Aa** toggle off (the default), text and field names match regardless
  of case. Switch it on to require exact case. Keywords, numbers, dates and booleans are never
  affected.
- **Lists:** if a field is a list, a clause matches when any item matches. `tags is seedling` and
  `seedling in tags` mean the same thing.
- **Dates:** a date without a time matches the whole day. `created is 2026-01-01` matches a note
  created at any time that day.
- **Comparisons:** `<`, `>`, `<=` and `>=` only compare numbers with numbers and dates with dates.
  Anything else doesn't match.
- **Missing fields:** a missing field never matches, except with `is not` and `not in`.
  `status is not done` includes notes that have no `status`.

## Saved filters

Click **Save** to keep the current filter under a name. Saved filters appear in the **Saved** tab
and remember their Match case setting.

They live in the reader's browser (localStorage), so each reader has their own. If the browser
blocks storage, as some private modes do, filtering still works but saving is off.

## Options

| Option          | Type       | Default                  | Used by | Description                                                         |
| --------------- | ---------- | ------------------------ | ------- | ------------------------------------------------------------------- |
| `excludeFields` | `string[]` | `[]`                     | index   | Frontmatter keys to leave out of the public index (any case).       |
| `fields`        | `string[]` | all fields               | index   | If set, only these keys are indexed. `title` and `path` always are. |
| `placeholder`   | `string`   | `topic is "Electronics"` | panel   | Example query shown in the empty input.                             |
| `caseSensitive` | `boolean`  | `false`                  | panel   | Whether **Aa** starts switched on. Readers can still flip it.       |

For advanced use in `quartz.ts`:

```ts
import * as ExternalPlugin from "./.quartz/plugins";

ExternalPlugin.FrontmatterIndex({ excludeFields: ["email"] });
ExternalPlugin.NoteFilter({ caseSensitive: true });
```

## Development

```bash
npm install
npm run check   # typecheck, lint, format, tests
npm run build   # rebuilds dist/, which is committed
```

> [!important]
> Commit the rebuilt `dist/` with your changes. Quartz installs plugins from it.

Releases use [Changesets](https://github.com/changesets/changesets). Run `npx changeset`, commit the
file, and merging the release PR publishes to npm.

## License

MIT
````

- [ ] **Step 4: Create `.changeset/note-filter.md`**

```markdown
---
"@speedypleath/quartz-filters": minor
---

Add the Note Filter. Readers filter the Explorer by frontmatter with plain-words queries such as `topic is "Electronics" and "seedling" in tags`, toggle Match case, and save filters in their browser. A new `FrontmatterIndex` emitter writes the data to `static/quartz-filters/index.json`. Use `excludeFields` to keep fields private. This replaces the template's example plugins.
```

- [ ] **Step 5: Rebuild `dist/` and run the whole check**

Run: `npm run check && npm run build && npx changeset status`

Expected:

- Every command exits 0.
- The build warns about nothing.
- `changeset status` lists a minor bump for `@speedypleath/quartz-filters`.

- [ ] **Step 6: Run the CI externals check locally**

Run the "Verify dist externals" script from `.github/workflows/ci.yml`. Copy the `node -e "..."` block and run it from the repo root.

Expected output: `dist/ externals verified: all imports are bundled or allowlisted.`

- [ ] **Step 7: Check the result in a real Quartz site**

This is a manual step; skip it if no Quartz 5 site is at hand.

1. Point a Quartz 5 site at this checkout. In the site, run `npx quartz plugin add /Users/speedypleath/Projects/quartz-filters` or the site's local-path equivalent.
2. Build the site. Confirm that `public/static/quartz-filters/index.json` exists, which proves Quartz ran the `FrontmatterIndex` emitter from a plugin that has both the emitter and component categories. If it's missing, check how Quartz's plugin loader maps `category` to exports before changing anything else.
3. Serve the site. Confirm that typing `has tags` narrows the Explorer.
4. Confirm that **Aa** changes the results for a mixed-case value.
5. Confirm that a saved filter survives a page reload.
6. Confirm that navigating between notes keeps the filter.

Report anything that differs. Don't change the selectors without evidence from the Explorer's real markup.

- [ ] **Step 8: Commit**

```bash
npx prettier --write README.md package.json .changeset/note-filter.md src/index.ts
git add README.md package.json package-lock.json .changeset/note-filter.md src/index.ts dist
git commit -m "Publish Note Filter: manifest, README, changeset and rebuilt dist

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
