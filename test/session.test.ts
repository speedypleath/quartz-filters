import { describe, expect, it } from "vitest";
import {
  SESSION_KEY,
  readSession,
  writeSession,
} from "../src/components/scripts/note-filter/session";
import { BrokenStorage, MemoryStorage } from "./fixtures/storage";

describe("session state", () => {
  it("round-trips the query and case setting", () => {
    const storage = new MemoryStorage();
    writeSession(() => storage, { query: "has status", caseSensitive: true });
    expect(readSession(() => storage)).toEqual({ query: "has status", caseSensitive: true });
  });

  it("returns null for missing or malformed state", () => {
    const storage = new MemoryStorage();
    expect(readSession(() => storage)).toBeNull();
    storage.setItem(SESSION_KEY, "{oops");
    expect(readSession(() => storage)).toBeNull();
    storage.setItem(SESSION_KEY, JSON.stringify({ query: 4 }));
    expect(readSession(() => storage)).toBeNull();
  });

  it("never throws when storage is unavailable", () => {
    expect(() =>
      writeSession(() => new BrokenStorage(), { query: "x", caseSensitive: false }),
    ).not.toThrow();
    expect(
      readSession(() => {
        throw new Error("SecurityError");
      }),
    ).toBeNull();
  });
});
