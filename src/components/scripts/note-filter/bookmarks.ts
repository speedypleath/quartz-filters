import { isRecord, type KeyValueStorage } from "./guards";

export const BOOKMARKS_KEY = "quartz-filters:bookmarks";

export interface Bookmark {
  name: string;
  query: string;
  caseSensitive: boolean;
}

export interface BookmarkStore {
  /** False when the browser won't let us write, e.g. in private mode. */
  readonly available: boolean;
  list(): Bookmark[];
  find(name: string): Bookmark | undefined;
  /** Adds the bookmark, or replaces the one with the same name. Returns false if it couldn't be stored. */
  save(bookmark: Bookmark): boolean;
  remove(name: string): void;
}

function probe(getStorage: () => KeyValueStorage | null | undefined): KeyValueStorage | null {
  try {
    const storage = getStorage();
    if (!storage) return null;
    const key = `${BOOKMARKS_KEY}:probe`;
    storage.setItem(key, "1");
    storage.removeItem(key);
    return storage;
  } catch {
    return null;
  }
}

export function createBookmarkStore(
  getStorage: () => KeyValueStorage | null | undefined,
): BookmarkStore {
  const storage = probe(getStorage);

  const read = (): Bookmark[] => {
    if (!storage) return [];
    try {
      const parsed: unknown = JSON.parse(storage.getItem(BOOKMARKS_KEY) ?? "[]");
      if (!Array.isArray(parsed)) return [];
      return parsed.flatMap((item) =>
        isRecord(item) && typeof item.name === "string" && typeof item.query === "string"
          ? [{ name: item.name, query: item.query, caseSensitive: item.caseSensitive === true }]
          : [],
      );
    } catch {
      return [];
    }
  };

  const write = (bookmarks: Bookmark[]): boolean => {
    if (!storage) return false;
    try {
      storage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
      return true;
    } catch {
      return false;
    }
  };

  return {
    available: storage !== null,
    list: read,
    find: (name) => read().find((b) => b.name === name),
    save(bookmark) {
      const bookmarks = read();
      const index = bookmarks.findIndex((b) => b.name === bookmark.name);
      if (index >= 0) bookmarks[index] = bookmark;
      else bookmarks.push(bookmark);
      return write(bookmarks);
    },
    remove(name) {
      write(read().filter((b) => b.name !== name));
    },
  };
}
