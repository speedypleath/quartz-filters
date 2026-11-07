import { describe, expect, it } from "vitest";
import {
  BOOKMARKS_KEY,
  createBookmarkStore,
} from "../src/components/scripts/note-filter/bookmarks";
import { BrokenStorage, MemoryStorage } from "./fixtures/storage";

describe("createBookmarkStore", () => {
  it("saves, lists, finds and removes bookmarks", () => {
    const storage = new MemoryStorage();
    const store = createBookmarkStore(() => storage);
    expect(store.available).toBe(true);

    expect(store.save({ name: "Seedlings", query: "seedling in tags", caseSensitive: false })).toBe(
      true,
    );
    expect(store.save({ name: "Exact", query: "topic is Electronics", caseSensitive: true })).toBe(
      true,
    );

    expect(store.list().map((b) => b.name)).toEqual(["Seedlings", "Exact"]);
    expect(store.find("Exact")).toEqual({
      name: "Exact",
      query: "topic is Electronics",
      caseSensitive: true,
    });

    store.remove("Seedlings");
    expect(store.list().map((b) => b.name)).toEqual(["Exact"]);
  });

  it("replaces a bookmark with the same name in place", () => {
    const store = createBookmarkStore(() => new MemoryStorage());
    store.save({ name: "A", query: "a is 1", caseSensitive: false });
    store.save({ name: "B", query: "b is 1", caseSensitive: false });
    store.save({ name: "A", query: "a is 2", caseSensitive: true });
    expect(store.list()).toEqual([
      { name: "A", query: "a is 2", caseSensitive: true },
      { name: "B", query: "b is 1", caseSensitive: false },
    ]);
  });

  it("loads older bookmarks without caseSensitive with the toggle off", () => {
    const storage = new MemoryStorage();
    storage.setItem(BOOKMARKS_KEY, JSON.stringify([{ name: "Old", query: "has status" }]));
    expect(createBookmarkStore(() => storage).list()).toEqual([
      { name: "Old", query: "has status", caseSensitive: false },
    ]);
  });

  it("ignores corrupted or malformed data", () => {
    const storage = new MemoryStorage();
    storage.setItem(BOOKMARKS_KEY, "{not json");
    expect(createBookmarkStore(() => storage).list()).toEqual([]);
    storage.setItem(
      BOOKMARKS_KEY,
      JSON.stringify([{ name: 3 }, "x", { name: "Ok", query: "a is 1" }]),
    );
    expect(
      createBookmarkStore(() => storage)
        .list()
        .map((b) => b.name),
    ).toEqual(["Ok"]);
  });

  it("reports itself unavailable when storage throws or is missing", () => {
    const broken = createBookmarkStore(() => new BrokenStorage());
    expect(broken.available).toBe(false);
    expect(broken.save({ name: "A", query: "a is 1", caseSensitive: false })).toBe(false);
    expect(broken.list()).toEqual([]);

    const missing = createBookmarkStore(() => {
      throw new Error("SecurityError");
    });
    expect(missing.available).toBe(false);
  });
});
