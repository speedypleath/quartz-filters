// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import NoteFilter from "../src/components/NoteFilter";
import { createBookmarkStore } from "../src/components/scripts/note-filter/bookmarks";
import { createExplorerSync } from "../src/components/scripts/note-filter/explorer-sync";
import type { IndexLoader } from "../src/components/scripts/note-filter/index-loader";
import { mountNoteFilter } from "../src/components/scripts/note-filter/panel";
import { SESSION_KEY } from "../src/components/scripts/note-filter/session";
import type { IndexedNote } from "../src/index-format";
import { explorerHtml } from "./fixtures/explorer";
import { renderComponent } from "./fixtures/render";
import { BrokenStorage, MemoryStorage } from "./fixtures/storage";

const note = (
  path: string,
  title: string,
  fields: Record<string, string | string[]>,
): IndexedNote => ({
  path,
  title,
  fields: { title, path, ...fields },
});

const NOTES = [
  note("electronics/h-bridge", "H-bridge motor driver", {
    topic: "Electronics",
    tags: ["seedling"],
  }),
  note("electronics/esp32", "ESP32 pinout", { topic: "Electronics", tags: ["evergreen"] }),
  note("reading/dune", "Dune", { topic: "Books", tags: ["seedling"] }),
];

interface SetupOptions {
  loader?: IndexLoader;
  explorer?: boolean;
  local?: MemoryStorage;
  session?: MemoryStorage;
}

function setup(options: SetupOptions = {}) {
  document.body.innerHTML =
    '<div id="panel"></div>' +
    (options.explorer === false
      ? ""
      : explorerHtml(NOTES.map((n) => ({ slug: n.path, title: n.title }))));
  const container = document.getElementById("panel") as HTMLElement;
  renderComponent(NoteFilter(), container);
  const root = container.querySelector(".note-filter") as HTMLElement;
  const strings = JSON.parse(root.dataset.strings ?? "{}");
  const local = options.local ?? new MemoryStorage();
  const session = options.session ?? new MemoryStorage();
  const cleanup = mountNoteFilter(root, {
    loader: options.loader ?? { load: () => Promise.resolve(NOTES) },
    bookmarks: createBookmarkStore(() => local),
    createSync: (onClear) => createExplorerSync(document, strings, onClear),
    hrefFor: (path) => `/${path}`,
    session: () => session,
  });
  const $ = <T extends Element = HTMLElement>(selector: string) =>
    root.querySelector(selector) as T;
  return { root, cleanup, local, session, $, input: $<HTMLTextAreaElement>(".qf-input") };
}

const type = (input: HTMLTextAreaElement, value: string) => {
  input.value = value;
  input.dispatchEvent(new Event("input", { bubbles: true }));
};
const settle = () => vi.advanceTimersByTimeAsync(200);
const visibleNotes = () =>
  Array.from(document.querySelectorAll(".explorer-ul a.nav-file-title"))
    .filter((a) => !a.closest(".qf-hidden"))
    .map((a) => a.textContent);
const submit = (form: HTMLFormElement) =>
  form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

describe("mountNoteFilter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("filters the Explorer once the reader stops typing", async () => {
    const { input, $ } = setup();
    type(input, 'topic is "Electronics"');
    expect(visibleNotes()).toHaveLength(3);

    await settle();
    expect(visibleNotes()).toEqual(["H-bridge motor driver", "ESP32 pinout"]);
    expect($(".qf-status").textContent).toBe("2 of 3 notes");
  });

  it("updates the syntax highlight on every keystroke", () => {
    const { input, $ } = setup();
    type(input, "topic is Books");
    expect($(".qf-highlight .qf-field").textContent).toBe("topic");
    expect($(".qf-highlight .qf-value").textContent).toBe("Books");
  });

  it("lists the parsed clauses and their connective", async () => {
    const { input, $ } = setup();
    type(input, 'topic is Electronics and "seedling" in tags');
    await settle();
    const items = Array.from($(".qf-clauses").children).map((li) => [
      li.className,
      li.firstChild?.textContent,
    ]);
    expect(items).toEqual([
      ["qf-clause", 'topic is "Electronics"'],
      ["qf-join", "and"],
      ["qf-clause", '"seedling" in tags'],
    ]);
  });

  it("keeps the last valid filter while the query has an error", async () => {
    const { input, $ } = setup();
    type(input, "topic is Electronics");
    await settle();
    type(input, "topic is Electronics and");
    await settle();

    expect(visibleNotes()).toEqual(["H-bridge motor driver", "ESP32 pinout"]);
    expect($(".qf-error").hidden).toBe(false);
    expect($(".qf-error").textContent).toBe("Expected a clause (column 25)");
  });

  it("re-filters immediately when Match case is flipped", async () => {
    const { input, $ } = setup();
    type(input, "topic is electronics");
    await settle();
    expect(visibleNotes()).toHaveLength(2);

    $<HTMLButtonElement>(".qf-case").click();
    expect($(".qf-case").getAttribute("aria-pressed")).toBe("true");
    expect(visibleNotes()).toEqual([]);
    expect(document.querySelector(".qf-empty")).not.toBeNull();
  });

  it("removes a clause with its ×", async () => {
    const { input, $ } = setup();
    type(input, 'topic is "Electronics" and "seedling" in tags');
    await settle();
    expect(visibleNotes()).toEqual(["H-bridge motor driver"]);

    $<HTMLButtonElement>(".qf-clause-remove").click();
    expect(input.value).toBe('"seedling" in tags');
    expect(visibleNotes()).toEqual(["H-bridge motor driver", "Dune"]);
  });

  it("clears the filter", async () => {
    const { input, $ } = setup();
    type(input, "topic is Books");
    await settle();
    $<HTMLButtonElement>(".qf-clear").click();
    expect(input.value).toBe("");
    expect(visibleNotes()).toHaveLength(3);
    expect(document.querySelector(".explorer")?.hasAttribute("data-qf-filtered")).toBe(false);
  });

  it("saves a bookmark, asks before replacing one, and loads it with its case setting", async () => {
    const { input, $, local } = setup();
    type(input, "topic is Electronics");
    await settle();
    $<HTMLButtonElement>(".qf-case").click();

    $<HTMLButtonElement>(".qf-save").click();
    const form = $<HTMLFormElement>(".qf-save-form");
    const name = $<HTMLInputElement>(".qf-name");
    expect(form.hidden).toBe(false);
    expect(name.value).toBe("topic is Electronics");
    name.value = "Electronics";
    submit(form);
    expect(form.hidden).toBe(true);
    expect($(".qf-count").textContent).toBe("1");
    expect(JSON.parse(local.getItem("quartz-filters:bookmarks") ?? "[]")).toEqual([
      { name: "Electronics", query: "topic is Electronics", caseSensitive: true },
    ]);

    type(input, "topic is Books");
    await settle();
    $<HTMLButtonElement>(".qf-save").click();
    name.value = "Electronics";
    submit(form);
    expect($(".qf-replace").hidden).toBe(false);
    expect($(".qf-replace").textContent).toBe('Replace the saved filter "Electronics"?');
    expect($(".qf-save-confirm").textContent).toBe("Replace");
    $<HTMLButtonElement>(".qf-save-cancel").click();
    expect(form.hidden).toBe(true);

    $<HTMLButtonElement>(".qf-case").click();
    type(input, "");
    await settle();
    $<HTMLButtonElement>('[data-tab="saved"]').click();
    $<HTMLButtonElement>(".qf-bookmark").click();

    expect($('[data-tab="filter"]').getAttribute("aria-selected")).toBe("true");
    expect(input.value).toBe("topic is Electronics");
    expect($(".qf-case").getAttribute("aria-pressed")).toBe("true");
    expect(visibleNotes()).toEqual(["H-bridge motor driver", "ESP32 pinout"]);
    expect($(".qf-bookmark").getAttribute("aria-current")).toBe("true");
  });

  it("deletes a bookmark", async () => {
    const { input, $ } = setup();
    type(input, "topic is Books");
    await settle();
    $<HTMLButtonElement>(".qf-save").click();
    submit($<HTMLFormElement>(".qf-save-form"));
    $<HTMLButtonElement>(".qf-bookmark-remove").click();
    expect($(".qf-bookmarks").children).toHaveLength(0);
    expect($(".qf-saved-note").textContent).toBe("Save a filter to run it again later.");
  });

  it("shows bookmark names and queries as text, never as HTML", async () => {
    const { input, $ } = setup();
    const name = '<img src=x onerror="window.__xss = 1">';
    type(input, 'title contains "<b>bold</b>"');
    await settle();
    $<HTMLButtonElement>(".qf-save").click();
    $<HTMLInputElement>(".qf-name").value = name;
    submit($<HTMLFormElement>(".qf-save-form"));

    expect($(".qf-bookmark-name").textContent).toBe(name);
    expect($(".qf-bookmarks img")).toBeNull();
    expect($(".qf-clauses b")).toBeNull();
    expect($(".qf-highlight b")).toBeNull();
  });

  it("explains when saving is off", () => {
    const { $ } = setup({ local: new BrokenStorage() });
    expect($<HTMLButtonElement>(".qf-save").disabled).toBe(true);
    expect($(".qf-saved-note").textContent).toBe("Saving is off in this browser.");
  });

  it("reports a failed load and retries on the next focus", async () => {
    const load = vi
      .fn<() => Promise<IndexedNote[]>>()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValue(NOTES);
    const { input, $ } = setup({ loader: { load } });
    type(input, "topic is Books");
    await settle();
    expect($(".qf-status").textContent).toBe("Couldn't load filter data.");
    expect(visibleNotes()).toHaveLength(3);

    input.dispatchEvent(new Event("focus"));
    await settle();
    expect($(".qf-status").textContent).toBe("1 of 3 notes");
    expect(visibleNotes()).toEqual(["Dune"]);
  });

  it("says when the page has no Explorer", async () => {
    const { input, $ } = setup({ explorer: false });
    type(input, "topic is Books");
    await settle();
    expect($(".qf-status").textContent).toBe(
      "1 of 3 notes Add the Explorer plugin to filter notes.",
    );
  });

  it("restores the query from the session after navigation", async () => {
    const session = new MemoryStorage();
    const first = setup({ session });
    type(first.input, "topic is Books");
    await settle();
    expect(JSON.parse(session.getItem(SESSION_KEY) ?? "{}")).toEqual({
      query: "topic is Books",
      caseSensitive: false,
    });
    first.cleanup();

    const second = setup({ session });
    expect(second.input.value).toBe("topic is Books");
    await settle();
    expect(visibleNotes()).toEqual(["Dune"]);
  });

  it("ignores an index that arrives after the panel was unmounted", async () => {
    let resolve: (notes: IndexedNote[]) => void = () => {};
    const loader = { load: () => new Promise<IndexedNote[]>((r) => (resolve = r)) };
    const { input, cleanup } = setup({ loader });
    type(input, "topic is Books");
    await settle();
    cleanup();
    resolve(NOTES);
    await settle();
    expect(document.querySelectorAll(".qf-hidden")).toHaveLength(0);
  });

  it("moves between tabs with the arrow keys", () => {
    const { $ } = setup();
    $('[data-tab="filter"]').dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
    );
    expect($('[data-tab="saved"]').getAttribute("aria-selected")).toBe("true");
    expect($<HTMLElement>('[data-panel="saved"]').hidden).toBe(false);
    expect($<HTMLElement>('[data-panel="filter"]').hidden).toBe(true);
    expect(document.activeElement).toBe($('[data-tab="saved"]'));
  });
});
