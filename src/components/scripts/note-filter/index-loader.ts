import type { FrontmatterIndexFile, IndexedNote } from "../../../index-format";

export interface IndexLoader {
  load(): Promise<IndexedNote[]>;
}

export function createIndexLoader(
  url: string,
  fetchFn: (url: string) => Promise<Response> = (u) => fetch(u),
): IndexLoader {
  let pending: Promise<IndexedNote[]> | null = null;
  return {
    load() {
      pending ??= fetchFn(url)
        .then(async (response) => {
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const data = (await response.json()) as Partial<FrontmatterIndexFile>;
          if (data.version !== 1 || !Array.isArray(data.notes)) {
            throw new Error("Unexpected index format");
          }
          return data.notes;
        })
        .catch((error: unknown) => {
          pending = null;
          throw error;
        });
      return pending;
    },
  };
}
