import { describe, expect, it } from "vitest";
import { applySuggestion, buildCatalog, complete, type Completion } from "../src/query/complete";
import type { IndexedNote } from "../src/index-format";
import type { NoteFields } from "../src/query/types";

const note = (path: string, fields: NoteFields): IndexedNote => ({
  path,
  title: path,
  fields: { title: path, path, ...fields },
});

const catalog = buildCatalog([
  note("a", { topics: ["Programming", "Electronics"], status: "done", rating: 4 }),
  note("b", { topics: ["Programming", "Embedded programming"], tags: ["seedling"] }),
  note("c", { topics: "Topology", tags: ["seedling", "and"], draft: true }),
  note("d", { "my field": "x", Is: "y", created: "2026-01-01T00:00:00.000Z" }),
]);

/** Completes at the `|` in the query. */
const at = (text: string): Completion | null => {
  const cursor = text.indexOf("|");
  return complete(text.replace("|", ""), cursor, catalog);
};
const labels = (text: string) => at(text)?.items.map((i) => i.label);

describe("buildCatalog", () => {
  it("counts fields and values, and skips fields a query can't name", () => {
    const topics = catalog.find((f) => f.name === "topics");
    expect(topics?.count).toBe(3);
    expect(topics?.values.find((v) => v.text === "Programming")?.count).toBe(2);
    expect(catalog.map((f) => f.name)).not.toContain("my field");
    expect(catalog.map((f) => f.name)).not.toContain("Is");
  });
});

describe("complete", () => {
  it("offers fields, then values with their field, at the start of a clause", () => {
    expect(at("top|")?.items).toEqual([
      { kind: "field", label: "topics", insert: "topics" },
      { kind: "value", label: "Topology", field: "topics", insert: "Topology in topics" },
    ]);
  });

  it("starts a clause after and, or, not and (", () => {
    for (const prefix of ["status is done and ", "status is done or ", "not ", "("]) {
      expect(labels(`${prefix}sta|`)).toEqual(["status"]);
    }
  });

  it("leaves note titles and paths out of the values at the start of a clause", () => {
    const titled = buildCatalog([note("dune", {})]);
    expect(complete("dun", 3, titled)).toBeNull();
  });

  it("offers every field when nothing is typed, built-in ones last", () => {
    expect(labels("|")).toEqual([
      "topics",
      "tags",
      "created",
      "draft",
      "rating",
      "status",
      "title",
      "path",
    ]);
  });

  it("offers the field's values after an operator", () => {
    expect(labels("topics is |")).toEqual([
      "Programming",
      "Electronics",
      "Embedded programming",
      "Topology",
    ]);
    expect(labels("topics is not emb|")).toEqual(["Embedded programming"]);
    expect(labels("topics contains pro|")).toEqual(["Programming", "Embedded programming"]);
    expect(labels("rating >= |")).toEqual(["4"]);
  });

  it("matches field names regardless of case", () => {
    expect(labels("TOPICS is top|")).toEqual(["Topology"]);
  });

  it("ranks prefix matches before matches inside the text", () => {
    expect(labels("topics is pro|")).toEqual(["Programming", "Embedded programming"]);
  });

  it("offers fields after in, with the ones holding the value first", () => {
    expect(labels("seedling in |")?.slice(0, 2)).toEqual(["tags", "topics"]);
    expect(labels('"Programming" not in t|')?.slice(0, 3)).toEqual(["topics", "tags", "title"]);
  });

  it("offers fields after has", () => {
    expect(labels("has st|")).toEqual(["status"]);
  });

  it("completes inside quotes", () => {
    const result = at('topics is "Embedded pro|');
    expect(result).toMatchObject({ from: 10, to: 23 });
    expect(result?.items.map((i) => i.label)).toEqual(["Embedded programming"]);
  });

  it("replaces the whole word under the cursor", () => {
    expect(at("topics is Pro|gramming and")).toMatchObject({ from: 10, to: 21 });
  });

  it("offers nothing where an operator or connective is expected", () => {
    expect(at("topics |")).toBeNull();
    expect(at("topics is done |")).toBeNull();
    expect(at("seedling not |")).toBeNull();
    expect(at("(status is done) |")).toBeNull();
  });

  it("caps the list", () => {
    const many = buildCatalog([note("x", { tags: Array.from({ length: 20 }, (_, i) => `t${i}`) })]);
    expect(complete("tags is ", 8, many)?.items).toHaveLength(8);
  });
});

describe("applySuggestion", () => {
  const apply = (text: string, index = 0) => {
    const cursor = text.indexOf("|");
    const query = text.replace("|", "");
    const result = complete(query, cursor, catalog)!;
    const next = applySuggestion(query, result, result.items[index]!);
    return next.query.slice(0, next.cursor) + "|" + next.query.slice(next.cursor);
  };

  it("inserts a field and a space", () => {
    expect(apply("top|")).toBe("topics |");
  });

  it("writes the whole clause for a value at the start of a clause", () => {
    expect(apply("top|", 1)).toBe("Topology in topics |");
  });

  it("quotes values with spaces, keywords and literal look-alikes", () => {
    expect(apply("topics is emb|")).toBe('topics is "Embedded programming" |');
    expect(apply("tags is an|")).toBe('tags is "and" |');
  });

  it("keeps numbers, booleans and dates bare", () => {
    expect(apply("rating is |")).toBe("rating is 4 |");
    expect(apply("draft is |")).toBe("draft is true |");
    expect(apply("created >= |")).toBe("created >= 2026-01-01T00:00:00.000Z |");
  });

  it("replaces an open quote and the word after the cursor", () => {
    expect(apply('topics is "Emb|')).toBe('topics is "Embedded programming" |');
    expect(apply("topics is Pro|gramming and x")).toBe("topics is Programming |and x");
  });
});
