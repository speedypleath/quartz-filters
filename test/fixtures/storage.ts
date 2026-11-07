/** In-memory stand-in for localStorage and sessionStorage. */
export class MemoryStorage {
  private data = new Map<string, string>();

  getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.data.set(key, String(value));
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }
}

/** Storage that refuses writes, like Safari private mode or a full quota. */
export class BrokenStorage extends MemoryStorage {
  override setItem(_key: string, _value: string): void {
    throw new DOMException("The quota has been exceeded.", "QuotaExceededError");
  }
}
