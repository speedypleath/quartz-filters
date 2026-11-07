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
