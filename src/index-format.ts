import type { NoteFields } from "./query/types";

/** Where the emitter writes the index, relative to the site's output root. */
export const INDEX_FILE = "static/quartz-filters/index.json";

export interface IndexedNote {
  /** The note's slug, e.g. `electronics/h-bridge`. */
  path: string;
  title: string;
  /** Normalized frontmatter, always including `title` and `path`. */
  fields: NoteFields;
}

export interface FrontmatterIndexFile {
  version: 1;
  notes: IndexedNote[];
}
