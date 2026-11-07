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
