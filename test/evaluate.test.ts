import { describe, expect, it } from "vitest";
import { matches } from "../src/query/evaluate";
import { parse } from "../src/query/parser";
import type { NoteFields } from "../src/query/types";

const NOTE: NoteFields = {
  title: "H-bridge Motor Driver",
  path: "electronics/h-bridge",
  topic: "Electronics",
  tags: ["seedling", "Robotics"],
  rating: 4,
  draft: false,
  created: "2026-01-01T00:00:00.000Z",
  updated: "2026-03-15T09:30:00.000Z",
  status: "",
  empty: [],
  tópico: "Électronique",
};

const run = (query: string, caseSensitive = false, fields: NoteFields = NOTE) => {
  const { ast, error } = parse(query);
  if (!ast || error) throw new Error(`Query did not parse: ${query}`);
  return matches(ast, fields, { caseSensitive });
};

describe("matches", () => {
  it.each([
    ['topic is "Electronics"', true],
    ["topic is electronics", true],
    ["topic is Books", false],
    ["topic is not Books", true],
    ['"seedling" in tags', true],
    ["robotics in tags", true],
    ["evergreen in tags", false],
    ["evergreen not in tags", true],
    ["tags is seedling", true],
    ["Electronics in topic", true],
    ["title contains motor", true],
    ["tags contains seed", true],
    ["rating > 3", true],
    ["rating >= 4", true],
    ["rating < 4", false],
    ["rating is 4", true],
    ["draft is false", true],
    ["draft is true", false],
    ["created is 2026-01-01", true],
    ["created >= 2026-01-01", true],
    ["created < 2026-01-01", false],
    ["updated > 2026-03-15T09:00Z", true],
    ["updated < 2026-03-15T09:00Z", false],
    ["has topic", true],
    ["has status", false],
    ["has empty", false],
    ["has missing", false],
    ["missing is x", false],
    ["missing is not x", true],
    ["x not in missing", true],
    ["missing contains x", false],
    ["missing > 1", false],
    ["topic > 3", false],
    ["rating > 2026-01-01", false],
    ['tópico is "électronique"', true],
    ['topic is "Electronics" and ("seedling" in tags or status is done)', true],
    ["not topic is Electronics", false],
    ['path contains "electronics/"', true],
  ])("%s → %s", (query, expected) => {
    expect(run(query)).toBe(expected);
  });

  describe("with case sensitivity on", () => {
    it.each([
      ['topic is "Electronics"', true],
      ["topic is electronics", false],
      ["Topic is Electronics", false],
      ["Robotics in tags", true],
      ["robotics in tags", false],
      ["title contains Motor", true],
      ["title contains motor", false],
      ["rating is 4", true],
      ["draft is false", true],
      ["created is 2026-01-01", true],
      ['tópico is "électronique"', false],
    ])("%s → %s", (query, expected) => {
      expect(run(query, true)).toBe(expected);
    });
  });

  it("matches either key when keys differ only in case and the toggle is off", () => {
    const fields: NoteFields = { Status: "draft", status: "done" };
    expect(run("status is done", false, fields)).toBe(true);
    expect(run("status is draft", false, fields)).toBe(true);
    expect(run("Status is done", true, fields)).toBe(false);
  });
});
