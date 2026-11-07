/** The part of the Web Storage API the filter uses, so tests can pass a plain object. */
export type KeyValueStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
