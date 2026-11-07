import { describe, expect, it, vi } from "vitest";
import { createIndexLoader } from "../src/components/scripts/note-filter/index-loader";

const NOTES = [{ path: "a", title: "A", fields: { title: "A", path: "a" } }];
const ok = (body: unknown) => Promise.resolve(new Response(JSON.stringify(body), { status: 200 }));

describe("createIndexLoader", () => {
  it("fetches once and caches the notes", async () => {
    const fetchFn = vi.fn((_url: string) => ok({ version: 1, notes: NOTES }));
    const loader = createIndexLoader("/static/quartz-filters/index.json", fetchFn);
    const [first, second] = await Promise.all([loader.load(), loader.load()]);
    expect(first).toEqual(NOTES);
    expect(second).toBe(first);
    await loader.load();
    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(fetchFn).toHaveBeenCalledWith("/static/quartz-filters/index.json");
  });

  it("retries after a failure", async () => {
    const fetchFn = vi
      .fn<(url: string) => Promise<Response>>()
      .mockRejectedValueOnce(new TypeError("offline"))
      .mockImplementation(() => ok({ version: 1, notes: NOTES }));
    const loader = createIndexLoader("/index.json", fetchFn);
    await expect(loader.load()).rejects.toThrow("offline");
    await expect(loader.load()).resolves.toEqual(NOTES);
  });

  it("rejects HTTP errors and unknown formats", async () => {
    const notFound = createIndexLoader("/x", () =>
      Promise.resolve(new Response("", { status: 404 })),
    );
    await expect(notFound.load()).rejects.toThrow("HTTP 404");
    const wrongShape = createIndexLoader("/x", () => ok({ version: 2, notes: [] }));
    await expect(wrongShape.load()).rejects.toThrow("Unexpected index format");
  });
});
