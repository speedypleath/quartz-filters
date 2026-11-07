import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types";
import { i18n } from "../i18n";
import { INDEX_FILE } from "../index-format";
import { classNames } from "../util/lang";
import style from "./styles/note-filter.scss";
// @ts-expect-error - inline script import handled by Quartz bundler
import script from "./scripts/note-filter.inline.ts";

export interface NoteFilterOptions {
  /** Example query shown in the empty input. */
  placeholder?: string;
  /** Whether "Match case" starts switched on. Readers can still flip it. */
  caseSensitive?: boolean;
}

let instances = 0;

export default ((opts?: NoteFilterOptions) => {
  const { placeholder = 'topic is "Electronics"', caseSensitive = false } = opts ?? {};

  const Component: QuartzComponent = (props: QuartzComponentProps) => {
    const t = i18n(props.cfg?.locale ?? "en-US").components.noteFilter;
    const id = `note-filter-${instances++}`;

    return (
      <div
        class={classNames(props.displayClass, "note-filter")}
        data-index-path={INDEX_FILE}
        data-case-sensitive={String(caseSensitive)}
        data-strings={JSON.stringify(t)}
      >
        <div class="qf-tabs" role="tablist" aria-label={t.label}>
          <button
            type="button"
            role="tab"
            class="qf-tab"
            id={`${id}-tab-filter`}
            aria-controls={`${id}-filter`}
            aria-selected="true"
            data-tab="filter"
          >
            {t.tabFilter}
          </button>
          <button
            type="button"
            role="tab"
            class="qf-tab"
            id={`${id}-tab-saved`}
            aria-controls={`${id}-saved`}
            aria-selected="false"
            tabIndex={-1}
            data-tab="saved"
          >
            {t.tabSaved} <span class="qf-count"></span>
          </button>
        </div>

        <div
          class="qf-panel"
          role="tabpanel"
          id={`${id}-filter`}
          aria-labelledby={`${id}-tab-filter`}
          data-panel="filter"
        >
          <div class="qf-query">
            <pre class="qf-highlight" aria-hidden="true"></pre>
            <textarea
              class="qf-input"
              rows={1}
              spellcheck={false}
              autocomplete="off"
              aria-label={t.label}
              placeholder={placeholder}
              role="combobox"
              aria-autocomplete="list"
              aria-controls={`${id}-suggestions`}
              aria-expanded="false"
            ></textarea>
            <button
              type="button"
              class="qf-case"
              aria-pressed={caseSensitive}
              aria-label={t.matchCase}
              title={t.matchCase}
            >
              Aa
            </button>
            <ul
              class="qf-suggestions"
              role="listbox"
              id={`${id}-suggestions`}
              aria-label={t.suggestions}
              hidden
            ></ul>
          </div>
          <p class="qf-error" role="alert" hidden></p>
          <ol class="qf-clauses"></ol>
          <div class="qf-status-row">
            <span class="qf-status" aria-live="polite"></span>
            <span class="qf-actions">
              <button type="button" class="qf-link qf-save">
                {t.save}
              </button>
              <button type="button" class="qf-link qf-clear">
                {t.clear}
              </button>
            </span>
          </div>
          <form class="qf-save-form" hidden>
            <label>
              {t.nameLabel}
              <input class="qf-name" type="text" autocomplete="off" />
            </label>
            <p class="qf-replace" hidden></p>
            <div class="qf-form-actions">
              <button type="button" class="qf-link qf-save-cancel">
                {t.cancel}
              </button>
              <button type="submit" class="qf-link qf-save-confirm">
                {t.save}
              </button>
            </div>
          </form>
        </div>

        <div
          class="qf-panel"
          role="tabpanel"
          id={`${id}-saved`}
          aria-labelledby={`${id}-tab-saved`}
          data-panel="saved"
          hidden
        >
          <p class="qf-note qf-saved-note"></p>
          <ul class="qf-bookmarks"></ul>
        </div>
      </div>
    );
  };

  Component.css = style;
  Component.afterDOMLoaded = script;

  return Component;
}) satisfies QuartzComponentConstructor<NoteFilterOptions>;
