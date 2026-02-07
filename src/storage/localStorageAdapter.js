import { StorageAdapter } from "./storageAdapter.js";

export class LocalStorageAdapter extends StorageAdapter {
  constructor(prefix = "survivor") {
    super();
    this.prefix = prefix;
  }

  makeKey(key) {
    return `${this.prefix}:${key}`;
  }

  async get(key) {
    const raw = localStorage.getItem(this.makeKey(key));
    if (raw === null) {
      return null;
    }
    return JSON.parse(raw);
  }

  async set(key, value) {
    localStorage.setItem(this.makeKey(key), JSON.stringify(value));
  }

  async remove(key) {
    localStorage.removeItem(this.makeKey(key));
  }

  async clear() {
    const keys = await this.keys();
    for (const key of keys) {
      localStorage.removeItem(this.makeKey(key));
    }
  }

  async keys() {
    const out = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const full = localStorage.key(i);
      if (!full || !full.startsWith(`${this.prefix}:`)) {
        continue;
      }
      out.push(full.slice(this.prefix.length + 1));
    }
    return out;
  }
}
