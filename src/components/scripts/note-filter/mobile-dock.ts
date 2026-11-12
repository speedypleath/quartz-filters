/* eslint-disable no-restricted-syntax -- the returned cleanup removes the listener;
   note-filter.inline.ts registers it through window.addCleanup. */
import { EXPLORER } from "./selectors";

/** Quartz's own mobile breakpoint: below it the left sidebar collapses into a header row. */
export const MOBILE_QUERY = "(max-width: 800px)";
export const DOCKED_CLASS = "qf-docked";

/**
 * On mobile, moves the filter into the Explorer's drawer, above the tree, so it is shown
 * with the notes it filters instead of being squeezed into the header row. Moves it back
 * when the viewport grows past the breakpoint. Does nothing when the filter's sidebar has
 * no Explorer. Returns a cleanup that puts the filter back where it was rendered.
 *
 * The filter goes before `.explorer-ul`, never inside it: the Explorer rebuilds that list
 * on every navigation.
 */
export function dockInExplorer(
  root: HTMLElement,
  media: Pick<MediaQueryList, "matches" | "addEventListener" | "removeEventListener">,
): () => void {
  const content = root
    .closest(".sidebar")
    ?.querySelector<HTMLElement>(`${EXPLORER.root} ${EXPLORER.content}`);
  if (!content) return () => {};

  const placeholder = root.ownerDocument.createComment("note-filter");
  root.before(placeholder);

  const undock = () => {
    placeholder.after(root);
    root.classList.remove(DOCKED_CLASS);
  };
  const place = () => {
    if (!media.matches) return undock();
    const list = Array.from(content.children).find((child) => child.matches(EXPLORER.list));
    content.insertBefore(root, list ?? content.firstChild);
    root.classList.add(DOCKED_CLASS);
  };

  place();
  media.addEventListener("change", place);
  return () => {
    media.removeEventListener("change", place);
    undock();
    placeholder.remove();
  };
}
