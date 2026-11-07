import { EMPTY_CLASS, EXPLORER, FILTERED_ATTR, HIDDEN_CLASS, OPENED_ATTR } from "./selectors";

export interface ExplorerSyncStrings {
  filtered: string;
  noMatches: string;
  clearFilter: string;
}

export interface ExplorerSync {
  /** Number of Explorers found on the page. */
  readonly count: number;
  /** Shows only notes whose link `href` is in `hrefs`. `null` restores the full tree. */
  apply(hrefs: Set<string> | null): void;
  disconnect(): void;
}

const childMatching = (el: Element, selector: string): Element | null =>
  Array.from(el.children).find((child) => child.matches(selector)) ?? null;

export function createExplorerSync(
  root: Pick<ParentNode, "querySelectorAll">,
  strings: ExplorerSyncStrings,
  onClear: () => void,
): ExplorerSync {
  const explorers = Array.from(root.querySelectorAll<HTMLElement>(EXPLORER.root));
  const observers: MutationObserver[] = [];
  let current: Set<string> | null = null;
  let scheduled = false;

  const renderAll = () => explorers.forEach((explorer) => render(explorer, current));

  function restore(explorer: HTMLElement, list: Element) {
    list.querySelectorAll(`.${HIDDEN_CLASS}`).forEach((el) => el.classList.remove(HIDDEN_CLASS));
    list.querySelectorAll(`[${OPENED_ATTR}]`).forEach((el) => {
      el.classList.remove(EXPLORER.openClass);
      el.removeAttribute(OPENED_ATTR);
    });
    explorer.removeAttribute(FILTERED_ATTR);
    explorer.querySelector(EXPLORER.title)?.removeAttribute(FILTERED_ATTR);
  }

  function render(explorer: HTMLElement, hrefs: Set<string> | null) {
    explorer.querySelector(`.${EMPTY_CLASS}`)?.remove();
    const list = explorer.querySelector(EXPLORER.list);
    if (!list) return;
    if (hrefs === null) {
      restore(explorer, list);
      return;
    }

    const items = Array.from(list.querySelectorAll("li"));
    let visibleFiles = 0;
    for (const li of items) {
      const link = childMatching(li, EXPLORER.fileLink);
      if (!link) continue;
      const show = hrefs.has(link.getAttribute("href") ?? "");
      li.classList.toggle(HIDDEN_CLASS, !show);
      if (show) visibleFiles++;
    }

    // Deepest folders first, so each parent sees its children's final state.
    for (const li of items.reverse()) {
      if (!childMatching(li, EXPLORER.folderHeader)) continue;
      const hasVisibleFile = Array.from(li.querySelectorAll("li")).some(
        (item) => !item.classList.contains(HIDDEN_CLASS) && childMatching(item, EXPLORER.fileLink),
      );
      li.classList.toggle(HIDDEN_CLASS, !hasVisibleFile);
      const outer = childMatching(li, EXPLORER.folderOuter);
      if (hasVisibleFile && outer && !outer.classList.contains(EXPLORER.openClass)) {
        outer.classList.add(EXPLORER.openClass);
        outer.setAttribute(OPENED_ATTR, "");
      }
    }

    explorer.setAttribute(FILTERED_ATTR, "");
    explorer.querySelector(EXPLORER.title)?.setAttribute(FILTERED_ATTR, strings.filtered);

    if (visibleFiles === 0) {
      const doc = explorer.ownerDocument;
      const note = doc.createElement("p");
      note.className = EMPTY_CLASS;
      note.append(`${strings.noMatches} `);
      const clear = doc.createElement("button");
      clear.type = "button";
      clear.textContent = strings.clearFilter;
      clear.onclick = onClear;
      note.append(clear);
      (explorer.querySelector(EXPLORER.content) ?? explorer).append(note);
    }
  }

  // The Explorer rebuilds its list after every "nav" and "render" event, asynchronously.
  // The note we insert sits outside the list, so our own changes never trigger this observer.
  for (const explorer of explorers) {
    const list = explorer.querySelector(EXPLORER.list);
    if (!list) continue;
    const observer = new MutationObserver(() => {
      if (scheduled) return;
      scheduled = true;
      queueMicrotask(() => {
        scheduled = false;
        renderAll();
      });
    });
    observer.observe(list, { childList: true, subtree: true });
    observers.push(observer);
  }

  return {
    count: explorers.length,
    apply(hrefs) {
      current = hrefs;
      renderAll();
    },
    disconnect() {
      observers.forEach((observer) => observer.disconnect());
    },
  };
}
