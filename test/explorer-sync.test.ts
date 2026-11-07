// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createExplorerSync } from "../src/components/scripts/note-filter/explorer-sync";
import { explorerHtml, treeHtml, type TreeNode } from "./fixtures/explorer";

const STRINGS = {
  filtered: "Filtered",
  noMatches: "No notes match this filter.",
  clearFilter: "Clear filter",
};

const TREE: TreeNode[] = [
  {
    folder: "electronics",
    children: [
      { slug: "electronics/h-bridge", title: "H-bridge motor driver" },
      { slug: "electronics/oscilloscope", title: "Oscilloscope probing" },
      {
        folder: "microcontrollers",
        children: [{ slug: "electronics/microcontrollers/esp32", title: "ESP32 pinout" }],
      },
    ],
  },
  { folder: "journal", children: [{ slug: "journal/2026-01-01", title: "New year" }] },
  { slug: "café-notes", title: "Café notes" },
];

const visibleFiles = () =>
  Array.from(document.querySelectorAll<HTMLAnchorElement>(".explorer-ul a.nav-file-title"))
    .filter((a) => !a.closest(".qf-hidden"))
    .map((a) => a.textContent);
const folder = (name: string) =>
  document.querySelector(`[data-folderpath="${name}"]`)?.parentElement as HTMLElement;
const outer = (name: string) => folder(name).querySelector(":scope > .folder-outer") as HTMLElement;

describe("createExplorerSync", () => {
  beforeEach(() => {
    document.body.innerHTML = explorerHtml(TREE);
  });

  it("hides files whose link isn't in the match set", () => {
    const sync = createExplorerSync(document, STRINGS, () => {});
    sync.apply(new Set(["/electronics/h-bridge", "/café-notes"]));
    expect(visibleFiles()).toEqual(["H-bridge motor driver", "Café notes"]);
  });

  it("hides empty folders and opens folders that hold matches", () => {
    const sync = createExplorerSync(document, STRINGS, () => {});
    sync.apply(new Set(["/electronics/microcontrollers/esp32"]));
    expect(folder("journal").classList.contains("qf-hidden")).toBe(true);
    expect(folder("electronics").classList.contains("qf-hidden")).toBe(false);
    expect(outer("electronics").classList.contains("open")).toBe(true);
    expect(outer("microcontrollers").classList.contains("open")).toBe(true);
  });

  it("restores the tree, closing only the folders it opened", () => {
    outer("journal").classList.add("open");
    const sync = createExplorerSync(document, STRINGS, () => {});
    sync.apply(new Set(["/electronics/microcontrollers/esp32"]));
    sync.apply(null);

    expect(document.querySelectorAll(".qf-hidden")).toHaveLength(0);
    expect(outer("journal").classList.contains("open")).toBe(true);
    expect(outer("electronics").classList.contains("open")).toBe(false);
    expect(outer("microcontrollers").classList.contains("open")).toBe(false);
    expect(document.querySelectorAll("[data-qf-opened]")).toHaveLength(0);
  });

  it("marks the Explorer title while a filter is on", () => {
    const sync = createExplorerSync(document, STRINGS, () => {});
    const explorer = document.querySelector(".explorer") as HTMLElement;
    const title = document.querySelector(".title-button h2") as HTMLElement;

    sync.apply(new Set(["/café-notes"]));
    expect(explorer.hasAttribute("data-qf-filtered")).toBe(true);
    expect(title.getAttribute("data-qf-filtered")).toBe("Filtered");

    sync.apply(null);
    expect(explorer.hasAttribute("data-qf-filtered")).toBe(false);
    expect(title.hasAttribute("data-qf-filtered")).toBe(false);
  });

  it("explains an empty result and offers to clear it", () => {
    const onClear = vi.fn();
    const sync = createExplorerSync(document, STRINGS, onClear);
    sync.apply(new Set());

    const note = document.querySelector(".explorer-content > .qf-empty") as HTMLElement;
    expect(note.textContent).toBe("No notes match this filter. Clear filter");
    note.querySelector("button")?.click();
    expect(onClear).toHaveBeenCalledOnce();

    sync.apply(null);
    expect(document.querySelector(".qf-empty")).toBeNull();
  });

  it("re-applies the filter after the Explorer redraws its tree", async () => {
    const sync = createExplorerSync(document, STRINGS, () => {});
    sync.apply(new Set(["/café-notes"]));

    const list = document.querySelector(".explorer-ul") as HTMLElement;
    list.innerHTML = treeHtml(TREE);
    expect(visibleFiles()).toHaveLength(5);

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(visibleFiles()).toEqual(["Café notes"]);
    sync.disconnect();
  });

  it("does nothing on a page without an Explorer", () => {
    document.body.innerHTML = "<main></main>";
    const sync = createExplorerSync(document, STRINGS, () => {});
    expect(sync.count).toBe(0);
    expect(() => sync.apply(new Set(["/x"]))).not.toThrow();
  });
});
