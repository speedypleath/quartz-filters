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
