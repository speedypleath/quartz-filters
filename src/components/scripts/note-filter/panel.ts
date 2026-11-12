import type { NoteFilterStrings } from "../../../i18n";
import type { IndexedNote } from "../../../index-format";
import {
  applySuggestion,
  buildCatalog,
  complete,
  type Catalog,
  type Completion,
} from "../../../query/complete";
import { matches } from "../../../query/evaluate";
import { connectiveAfter, formatClause, removeClause } from "../../../query/format";
import { highlight } from "../../../query/highlight";
import { parse } from "../../../query/parser";
import type { Expr, ParseResult } from "../../../query/types";
import type { Bookmark, BookmarkStore } from "./bookmarks";
import type { ExplorerSync } from "./explorer-sync";
import type { KeyValueStorage } from "./guards";
import type { IndexLoader } from "./index-loader";
import { readSession, writeSession } from "./session";

export interface PanelDeps {
  loader: IndexLoader;
  bookmarks: BookmarkStore;
  /** Creates the Explorer sync. `onClear` runs when the reader clicks "Clear filter" in the Explorer. */
  createSync: (onClear: () => void) => ExplorerSync;
  /** The Explorer's link `href` for a note path. */
  hrefFor: (path: string) => string;
  session: () => KeyValueStorage | null | undefined;
  debounceMs?: number;
}

const fmt = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (match, key: string) => String(values[key] ?? match));

export function mountNoteFilter(root: HTMLElement, deps: PanelDeps): () => void {
  const strings = JSON.parse(root.dataset.strings ?? "{}") as NoteFilterStrings;
  const doc = root.ownerDocument;
  const must = <T extends Element>(selector: string): T => {
    const el = root.querySelector<T>(selector);
    if (!el) throw new Error(`NoteFilter markup is missing ${selector}`);
    return el;
  };

  const el = {
    tabs: Array.from(root.querySelectorAll<HTMLButtonElement>('[role="tab"]')),
    panels: Array.from(root.querySelectorAll<HTMLElement>('[role="tabpanel"]')),
    input: must<HTMLTextAreaElement>(".qf-input"),
    highlight: must<HTMLElement>(".qf-highlight"),
    suggestions: must<HTMLUListElement>(".qf-suggestions"),
    caseToggle: must<HTMLButtonElement>(".qf-case"),
    error: must<HTMLElement>(".qf-error"),
    clauses: must<HTMLElement>(".qf-clauses"),
    status: must<HTMLElement>(".qf-status"),
    save: must<HTMLButtonElement>(".qf-save"),
    clear: must<HTMLButtonElement>(".qf-clear"),
    form: must<HTMLFormElement>(".qf-save-form"),
    name: must<HTMLInputElement>(".qf-name"),
    replace: must<HTMLElement>(".qf-replace"),
    confirm: must<HTMLButtonElement>(".qf-save-confirm"),
    cancel: must<HTMLButtonElement>(".qf-save-cancel"),
    count: must<HTMLElement>(".qf-count"),
    savedNote: must<HTMLElement>(".qf-saved-note"),
    bookmarkList: must<HTMLElement>(".qf-bookmarks"),
  };

  let mounted = true;
  let notes: IndexedNote[] | null = null;
  let catalog: Catalog | null = null;
  let completion: Completion | null = null;
  let activeOption = 0;
  /** Set by Escape; the list stays closed until the reader types again. */
  let dismissed = false;
  let loadState: "idle" | "loading" | "ready" | "failed" = "idle";
  let parsed: ParseResult = parse("");
  /** The last query that parsed. `null` means no filter. */
  let active: Expr | null = null;
  let pendingReplace: string | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const removers: Array<() => void> = [];
  const sync = deps.createSync(() => setQuery(""));

  function on<K extends keyof HTMLElementEventMap>(
    target: HTMLElement,
    type: K,
    handler: (event: HTMLElementEventMap[K]) => void,
  ) {
    target.addEventListener(type, handler);
    removers.push(() => target.removeEventListener(type, handler));
  }

  const caseSensitive = () => el.caseToggle.getAttribute("aria-pressed") === "true";
  const setCase = (value: boolean) => el.caseToggle.setAttribute("aria-pressed", String(value));
  const query = () => el.input.value.trim();

  function ensureLoaded() {
    if (loadState === "loading" || loadState === "ready") return;
    loadState = "loading";
    renderStatus();
    deps.loader.load().then(
      (result) => {
        if (!mounted) return;
        notes = result;
        catalog = buildCatalog(result);
        loadState = "ready";
        applyFilter();
        updateSuggestions();
      },
      () => {
        if (!mounted) return;
        loadState = "failed";
        renderStatus();
      },
    );
  }

  function render() {
    clearTimeout(timer);
    parsed = parse(el.input.value);
    if (!parsed.error) active = parsed.ast;
    renderHighlight();
    renderClauses();
    el.error.hidden = parsed.error === null;
    el.error.textContent = parsed.error
      ? fmt(strings.errorAt, { message: parsed.error.message, column: parsed.error.column })
      : "";
    el.save.disabled = !deps.bookmarks.available || !query();
    el.clear.disabled = !el.input.value;
    renderBookmarks();
    if (query()) ensureLoaded();
    applyFilter();
    writeSession(deps.session, { query: el.input.value, caseSensitive: caseSensitive() });
  }

  function renderHighlight() {
    el.highlight.replaceChildren(
      ...highlight(el.input.value).map((segment) => {
        const span = doc.createElement("span");
        span.className = `qf-${segment.kind}`;
        span.textContent = segment.text;
        return span;
      }),
    );
    // Keeps a trailing newline from collapsing, so the overlay matches the textarea's height.
    el.highlight.append("\n");
    fitInput();
  }

  /** Grows the input to its text. A hidden input measures 0, so this runs again when it is shown. */
  function fitInput() {
    el.input.style.height = "auto";
    if (el.input.scrollHeight > 0) el.input.style.height = `${el.input.scrollHeight}px`;
  }

  function updateSuggestions() {
    const cursor = el.input.selectionStart ?? el.input.value.length;
    const open = catalog !== null && !dismissed && doc.activeElement === el.input;
    completion = open && catalog ? complete(el.input.value, cursor, catalog) : null;
    activeOption = 0;
    renderSuggestions();
  }

  function renderSuggestions() {
    const items = completion?.items ?? [];
    el.suggestions.hidden = items.length === 0;
    el.suggestions.replaceChildren(
      ...items.map((item, index) => {
        const option = doc.createElement("li");
        option.className = `qf-suggestion qf-suggestion-${item.kind}`;
        option.id = `${el.suggestions.id}-${index}`;
        option.dataset.index = String(index);
        option.setAttribute("role", "option");
        option.setAttribute("aria-selected", String(index === activeOption));
        const label = doc.createElement("span");
        label.className = "qf-suggestion-label";
        label.textContent = item.label;
        option.append(label);
        const detail =
          item.kind === "field"
            ? strings.suggestionField
            : item.field
              ? fmt(strings.suggestionIn, { field: item.field })
              : "";
        if (detail) {
          const hint = doc.createElement("span");
          hint.className = "qf-suggestion-detail";
          hint.textContent = detail;
          option.append(hint);
        }
        return option;
      }),
    );
    const active = el.suggestions.children[activeOption];
    if (active) {
      el.input.setAttribute("aria-activedescendant", active.id);
      active.scrollIntoView?.({ block: "nearest" });
    } else {
      el.input.removeAttribute("aria-activedescendant");
    }
  }

  function acceptSuggestion(index: number) {
    const item = completion?.items[index];
    if (!completion || !item) return;
    const next = applySuggestion(el.input.value, completion, item);
    el.input.value = next.query;
    el.input.setSelectionRange(next.cursor, next.cursor);
    onTyped();
  }

  /** Runs after every edit: the highlight follows at once, the filter once typing pauses. */
  function onTyped() {
    dismissed = false;
    renderHighlight();
    clearTimeout(timer);
    timer = setTimeout(render, deps.debounceMs ?? 150);
    updateSuggestions();
  }

  function renderClauses() {
    const items: HTMLElement[] = [];
    parsed.clauses.forEach((clause, index) => {
      const text = formatClause(clause);
      const item = doc.createElement("li");
      item.className = "qf-clause";
      const label = doc.createElement("span");
      label.textContent = text;
      const remove = doc.createElement("button");
      remove.type = "button";
      remove.className = "qf-clause-remove";
      remove.dataset.clause = String(index);
      remove.textContent = "×";
      remove.setAttribute("aria-label", `${strings.removeClause}: ${text}`);
      item.append(label, remove);
      items.push(item);

      const join =
        index < parsed.clauses.length - 1 ? connectiveAfter(el.input.value, clause) : null;
      if (join) {
        const joiner = doc.createElement("li");
        joiner.className = "qf-join";
        joiner.setAttribute("aria-hidden", "true");
        joiner.textContent = join;
        items.push(joiner);
      }
    });
    el.clauses.replaceChildren(...items);
  }

  function applyFilter() {
    const expr = active;
    if (!notes || !expr) {
      sync.apply(null);
      renderStatus();
      return;
    }
    const opts = { caseSensitive: caseSensitive() };
    const hits = notes.filter((n) => matches(expr, n.fields, opts));
    sync.apply(new Set(hits.map((n) => deps.hrefFor(n.path))));
    renderStatus(hits.length);
  }

  function renderStatus(matched?: number) {
    let text = "";
    if (loadState === "loading") text = strings.loading;
    else if (loadState === "failed") text = strings.loadFailed;
    else if (notes && matched !== undefined) {
      text = fmt(strings.matched, { matched, total: notes.length });
    } else if (notes) text = fmt(strings.total, { total: notes.length });
    if (sync.count === 0 && loadState !== "failed") {
      text = text ? `${text} ${strings.noExplorer}` : strings.noExplorer;
    }
    el.status.textContent = text;
  }

  function currentBookmark(list: Bookmark[]): Bookmark | undefined {
    return list.find((b) => b.query === query() && b.caseSensitive === caseSensitive());
  }

  function renderBookmarks() {
    const list = deps.bookmarks.list();
    const current = currentBookmark(list);
    el.count.textContent = list.length > 0 ? String(list.length) : "";
    el.savedNote.textContent = deps.bookmarks.available ? strings.savedEmpty : strings.savingOff;
    el.savedNote.hidden = deps.bookmarks.available && list.length > 0;
    el.bookmarkList.replaceChildren(
      ...list.map((bookmark) => {
        const item = doc.createElement("li");
        const run = doc.createElement("button");
        run.type = "button";
        run.className = "qf-bookmark";
        run.dataset.name = bookmark.name;
        if (bookmark === current) run.setAttribute("aria-current", "true");
        const name = doc.createElement("span");
        name.className = "qf-bookmark-name";
        name.textContent = bookmark.name;
        const text = doc.createElement("span");
        text.className = "qf-bookmark-query";
        text.textContent = bookmark.query;
        run.append(name, text);

        const remove = doc.createElement("button");
        remove.type = "button";
        remove.className = "qf-bookmark-remove";
        remove.dataset.name = bookmark.name;
        remove.textContent = "×";
        remove.setAttribute("aria-label", fmt(strings.deleteBookmark, { name: bookmark.name }));
        item.append(run, remove);
        return item;
      }),
    );
  }

  function setQuery(value: string) {
    el.input.value = value;
    render();
    updateSuggestions();
  }

  function selectTab(name: string, focus = false) {
    for (const tab of el.tabs) {
      const selected = tab.dataset.tab === name;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected && focus) tab.focus();
    }
    for (const panel of el.panels) panel.hidden = panel.dataset.panel !== name;
    if (name === "filter") fitInput();
  }

  function resetReplace() {
    pendingReplace = null;
    el.replace.hidden = true;
    el.replace.textContent = "";
    el.confirm.textContent = strings.save;
  }

  function closeForm() {
    resetReplace();
    el.form.hidden = true;
  }

  // Tabs
  el.tabs.forEach((tab, index) => {
    on(tab, "click", () => selectTab(tab.dataset.tab ?? "filter"));
    on(tab, "keydown", (event) => {
      const targets: Record<string, number> = {
        ArrowRight: index + 1,
        ArrowLeft: index - 1,
        Home: 0,
        End: el.tabs.length - 1,
      };
      const next = targets[event.key];
      if (next === undefined) return;
      event.preventDefault();
      const target = el.tabs[(next + el.tabs.length) % el.tabs.length];
      if (target) selectTab(target.dataset.tab ?? "filter", true);
    });
  });

  // Query input
  on(el.input, "input", onTyped);
  on(el.input, "keydown", (event) => {
    const count = completion?.items.length ?? 0;
    // Ctrl+Space switches input sources on macOS, so the down arrow reopens the list too.
    if ((event.key === " " && event.ctrlKey) || (event.key === "ArrowDown" && count === 0)) {
      dismissed = false;
      updateSuggestions();
      if (completion || event.key === " ") event.preventDefault();
      return;
    }
    if (count > 0) {
      const step = { ArrowDown: 1, ArrowUp: -1 }[event.key];
      if (step !== undefined) {
        event.preventDefault();
        activeOption = (activeOption + step + count) % count;
        renderSuggestions();
        return;
      }
      if (event.key === "Enter" || (event.key === "Tab" && !event.shiftKey)) {
        event.preventDefault();
        acceptSuggestion(activeOption);
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        dismissed = true;
        updateSuggestions();
        return;
      }
    }
    if (event.key === "Enter") event.preventDefault();
  });
  // The cursor can move without an edit; the suggestions follow the word it lands in.
  on(el.input, "click", updateSuggestions);
  on(el.input, "keyup", (event) => {
    if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) updateSuggestions();
  });
  on(el.input, "focus", () => {
    ensureLoaded();
    updateSuggestions();
  });
  on(el.input, "blur", () => {
    completion = null;
    renderSuggestions();
  });
  // Keeps focus in the input, so choosing an option doesn't close the list first.
  on(el.suggestions, "mousedown", (event) => event.preventDefault());
  on(el.suggestions, "click", (event) => {
    const option = (event.target as Element).closest<HTMLElement>(".qf-suggestion");
    if (!option) return;
    acceptSuggestion(Number(option.dataset.index));
    el.input.focus();
  });
  on(el.caseToggle, "click", () => {
    setCase(!caseSensitive());
    render();
  });
  on(el.clear, "click", () => {
    setQuery("");
    el.input.focus();
  });
  on(el.clauses, "click", (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>(".qf-clause-remove");
    const clause = button ? parsed.clauses[Number(button.dataset.clause)] : undefined;
    if (!clause) return;
    setQuery(removeClause(el.input.value, clause));
    el.input.focus();
  });

  // Saving
  on(el.save, "click", () => {
    if (!query()) return;
    resetReplace();
    el.form.hidden = false;
    el.name.value = currentBookmark(deps.bookmarks.list())?.name ?? query();
    el.name.focus();
    el.name.select();
  });
  on(el.cancel, "click", closeForm);
  on(el.name, "input", resetReplace);
  on(el.form, "submit", (event) => {
    event.preventDefault();
    const name = el.name.value.trim();
    if (!name) return;
    if (pendingReplace !== name && deps.bookmarks.find(name)) {
      pendingReplace = name;
      el.replace.textContent = fmt(strings.replacePrompt, { name });
      el.replace.hidden = false;
      el.confirm.textContent = strings.replace;
      return;
    }
    if (deps.bookmarks.save({ name, query: query(), caseSensitive: caseSensitive() })) {
      closeForm();
      renderBookmarks();
    }
  });

  // Bookmarks
  on(el.bookmarkList, "click", (event) => {
    const target = event.target as Element;
    const remove = target.closest<HTMLButtonElement>(".qf-bookmark-remove");
    if (remove?.dataset.name !== undefined) {
      deps.bookmarks.remove(remove.dataset.name);
      renderBookmarks();
      return;
    }
    const run = target.closest<HTMLButtonElement>(".qf-bookmark");
    const bookmark =
      run?.dataset.name !== undefined ? deps.bookmarks.find(run.dataset.name) : undefined;
    if (!bookmark) return;
    setCase(bookmark.caseSensitive);
    setQuery(bookmark.query);
    selectTab("filter");
  });

  // Initial state: the session wins over the author's default.
  const restored = readSession(deps.session);
  el.input.value = restored?.query ?? "";
  setCase(restored ? restored.caseSensitive : root.dataset.caseSensitive === "true");
  render();

  // Re-fits when the input is shown (a closed mobile drawer can measure 0) or changes width.
  const resizeObserver =
    typeof ResizeObserver === "function" ? new ResizeObserver(() => fitInput()) : null;
  resizeObserver?.observe(el.input);

  const cleanup = () => {
    mounted = false;
    clearTimeout(timer);
    removers.forEach((remove) => remove());
    sync.disconnect();
    resizeObserver?.disconnect();
  };
  if (typeof window.addCleanup === "function") window.addCleanup(cleanup);
  return cleanup;
}
