import { tokenize } from "./lexer";
import type { Clause, ClauseOp, Expr, Literal, ParseError, ParseResult, Token } from "./types";

export const FIELD_NAME = /^[\p{L}_][\p{L}\p{N}_.-]*$/u;
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
  const isKeyword = (t: Token | undefined, word: string): t is Token & { type: "keyword" } =>
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
