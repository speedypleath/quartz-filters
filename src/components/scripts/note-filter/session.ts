import { isRecord, type KeyValueStorage } from "./guards";

export const SESSION_KEY = "quartz-filters:query";

export interface FilterState {
  query: string;
  caseSensitive: boolean;
}

export function readSession(
  getStorage: () => KeyValueStorage | null | undefined,
): FilterState | null {
  try {
    const raw = getStorage()?.getItem(SESSION_KEY);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (!isRecord(value) || typeof value.query !== "string") return null;
    return { query: value.query, caseSensitive: value.caseSensitive === true };
  } catch {
    return null;
  }
}

export function writeSession(
  getStorage: () => KeyValueStorage | null | undefined,
  state: FilterState,
): void {
  try {
    getStorage()?.setItem(SESSION_KEY, JSON.stringify(state));
  } catch {
    // Without session storage the filter still works; it just won't survive navigation.
  }
}
