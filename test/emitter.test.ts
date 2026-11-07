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
