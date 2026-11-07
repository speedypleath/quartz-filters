// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import NoteFilter from "../src/components/NoteFilter";
import { renderComponent } from "./fixtures/render";

const mount = (options?: Parameters<typeof NoteFilter>[0]) => {
  const container = document.createElement("div");
  renderComponent(NoteFilter(options), container);
  return container.querySelector(".note-filter") as HTMLElement;
};

describe("NoteFilter", () => {
  it("renders Filter and Saved tabs wired to their panels", () => {
    const root = mount();
    const tabs = Array.from(root.querySelectorAll('[role="tab"]'));
    expect(tabs.map((t) => [t.textContent?.trim(), t.getAttribute("aria-selected")])).toEqual([
      ["Filter", "true"],
      ["Saved", "false"],
    ]);
    for (const tab of tabs) {
      const panel = root.querySelector(`#${tab.getAttribute("aria-controls")}`);
      expect(panel?.getAttribute("role")).toBe("tabpanel");
      expect(panel?.getAttribute("aria-labelledby")).toBe(tab.id);
    }
    expect(root.querySelector('[data-panel="saved"]')?.hasAttribute("hidden")).toBe(true);
  });

  it("passes options and strings to the client script", () => {
    const root = mount({ caseSensitive: true, placeholder: "has status" });
    expect(root.dataset.indexPath).toBe("static/quartz-filters/index.json");
    expect(root.dataset.caseSensitive).toBe("true");
    expect(JSON.parse(root.dataset.strings ?? "{}").tabSaved).toBe("Saved");
    expect(root.querySelector("textarea")?.getAttribute("placeholder")).toBe("has status");
    expect(root.querySelector(".qf-case")?.getAttribute("aria-pressed")).toBe("true");
  });

  it("defaults to case-insensitive matching", () => {
    expect(mount().querySelector(".qf-case")?.getAttribute("aria-pressed")).toBe("false");
  });

  it("gives each instance its own ids", () => {
    const a = mount().querySelector('[role="tab"]')?.id;
    const b = mount().querySelector('[role="tab"]')?.id;
    expect(a).not.toBe(b);
  });
});
