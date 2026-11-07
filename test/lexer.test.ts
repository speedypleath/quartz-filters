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

  it("allows slashes in unquoted values so paths need no quotes", () => {
    expect(kinds("path is electronics/h-bridge")[2]).toEqual(["word", "electronics/h-bridge"]);
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
