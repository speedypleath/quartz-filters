// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { DOCKED_CLASS, dockInExplorer } from "../src/components/scripts/note-filter/mobile-dock";
import { explorerHtml } from "./fixtures/explorer";

function fakeMedia(matches: boolean) {
  const listeners = new Set<() => void>();
  return {
    matches,
    addEventListener: (_: string, fn: () => void) => listeners.add(fn),
    removeEventListener: (_: string, fn: () => void) => listeners.delete(fn),
    set(next: boolean) {
      this.matches = next;
      listeners.forEach((fn) => fn());
    },
    get listenerCount() {
      return listeners.size;
    },
  };
}

const TREE = [{ slug: "a", title: "A" }];
const filter = () => document.querySelector<HTMLElement>(".note-filter")!;
const sidebar = () => document.querySelector<HTMLElement>(".sidebar.left")!;
const content = () => document.querySelector<HTMLElement>(".explorer-content")!;
const typedMedia = (m: ReturnType<typeof fakeMedia>) =>
  m as unknown as Parameters<typeof dockInExplorer>[1];

describe("dockInExplorer", () => {
  beforeEach(() => {
    document.body.innerHTML =
      `<div class="left sidebar"><div class="search"></div>` +
      `<div class="note-filter"></div>${explorerHtml(TREE)}</div>`;
  });

  it("moves the filter above the Explorer list on mobile", () => {
    dockInExplorer(filter(), typedMedia(fakeMedia(true)));
    expect(filter().parentElement).toBe(content());
    expect(filter().nextElementSibling?.matches(".explorer-ul")).toBe(true);
    expect(filter().classList.contains(DOCKED_CLASS)).toBe(true);
  });

  it("leaves the filter in place on desktop", () => {
    dockInExplorer(filter(), typedMedia(fakeMedia(false)));
    expect(filter().parentElement).toBe(sidebar());
    expect(filter().previousElementSibling?.matches(".search")).toBe(true);
    expect(filter().classList.contains(DOCKED_CLASS)).toBe(false);
  });

  it("follows the viewport across the breakpoint, back to its original spot", () => {
    const media = fakeMedia(false);
    dockInExplorer(filter(), typedMedia(media));
    media.set(true);
    expect(filter().parentElement).toBe(content());
    media.set(false);
    expect(filter().parentElement).toBe(sidebar());
    expect(filter().nextElementSibling?.matches(".explorer")).toBe(true);
    expect(filter().classList.contains(DOCKED_CLASS)).toBe(false);
  });

  it("keeps its place when the Explorer rebuilds its list", () => {
    dockInExplorer(filter(), typedMedia(fakeMedia(true)));
    document.querySelector(".explorer-ul")!.innerHTML = '<li class="overflow-end"></li>';
    expect(filter().parentElement).toBe(content());
  });

  it("cleanup restores the rendered position and stops listening", () => {
    const media = fakeMedia(true);
    const cleanup = dockInExplorer(filter(), typedMedia(media));
    cleanup();
    expect(filter().parentElement).toBe(sidebar());
    expect(filter().nextElementSibling?.matches(".explorer")).toBe(true);
    expect(media.listenerCount).toBe(0);
    expect(sidebar().innerHTML).not.toContain("<!--");
  });

  it("does nothing when the sidebar has no Explorer", () => {
    document.body.innerHTML = `<div class="right sidebar"><div class="note-filter"></div></div>${explorerHtml(TREE)}`;
    const media = fakeMedia(true);
    dockInExplorer(filter(), typedMedia(media));
    expect(filter().parentElement?.matches(".right.sidebar")).toBe(true);
    expect(media.listenerCount).toBe(0);
  });
});
