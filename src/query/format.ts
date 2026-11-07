import { tokenize } from "./lexer";
import type { Clause, Literal, Token } from "./types";

type KeywordToken = Token & { type: "keyword" };

const isKeyword = (t: Token | undefined, word: string): t is KeywordToken =>
  t?.type === "keyword" && t.value === word;
const isConnective = (t: Token | undefined): t is KeywordToken =>
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
