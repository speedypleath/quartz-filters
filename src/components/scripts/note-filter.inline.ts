/* eslint-disable no-restricted-syntax -- the "nav" listener lives as long as the page;
   every mount registers its own cleanup through window.addCleanup in panel.ts. */
import { resolveBasePath } from "@quartz-community/utils/path";
import type { NoteFilterStrings } from "../../i18n";
import { INDEX_FILE } from "../../index-format";
import { createBookmarkStore } from "./note-filter/bookmarks";
import { createExplorerSync } from "./note-filter/explorer-sync";
import { createIndexLoader, type IndexLoader } from "./note-filter/index-loader";
import { mountNoteFilter } from "./note-filter/panel";

// Module state survives SPA navigation, so the index is fetched once per page load.
const loaders = new Map<string, IndexLoader>();

function loaderFor(url: string): IndexLoader {
  let loader = loaders.get(url);
  if (!loader) {
    loader = createIndexLoader(url);
    loaders.set(url, loader);
  }
  return loader;
}

document.addEventListener("nav", () => {
  for (const root of document.querySelectorAll<HTMLElement>(".note-filter")) {
    const strings = JSON.parse(root.dataset.strings ?? "{}") as NoteFilterStrings;
    mountNoteFilter(root, {
      loader: loaderFor(resolveBasePath(root.dataset.indexPath ?? INDEX_FILE)),
      bookmarks: createBookmarkStore(() => window.localStorage),
      createSync: (onClear) => createExplorerSync(document, strings, onClear),
      hrefFor: (path) => resolveBasePath(path),
      session: () => window.sessionStorage,
    });
  }
});
