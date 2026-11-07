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
