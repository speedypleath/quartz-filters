/**
 * Markup from github:quartz-community/explorer that the filter depends on. If an Explorer
 * release renames any of these, update them here and in test/fixtures/explorer.ts.
 */
export const EXPLORER = {
  root: "div.explorer",
  list: ".explorer-ul",
  content: ".explorer-content",
  title: ".title-button h2",
  fileLink: "a.nav-file-title",
  folderHeader: ".folder-container",
  folderOuter: ".folder-outer",
  openClass: "open",
} as const;

export const HIDDEN_CLASS = "qf-hidden";
export const EMPTY_CLASS = "qf-empty";
/** Set on `.folder-outer` elements the filter opened, so clearing closes only those. */
export const OPENED_ATTR = "data-qf-opened";
export const FILTERED_ATTR = "data-qf-filtered";
