import type { ParseError, Token } from "./types";

export const KEYWORDS = new Set(["is", "not", "in", "and", "or", "has", "exists", "contains"]);

const WORD_CHAR = /[\p{L}\p{N}_.:/-]/u;
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
