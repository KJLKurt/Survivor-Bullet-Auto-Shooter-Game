import { StorageAdapter } from './storageAdapter.js';

export class LocalStorageAdapter extends StorageAdapter {
  constructor(prefix = 'sbh:') {
    super();
    this.prefix = prefix;
    this.store = globalThis.localStorage;
  }

  k(key) { return `${this.prefix}${key}`; }

  async get(key) {
    const value = this.store.getItem(this.k(key));
    return value ? JSON.parse(value) : null;
  }

  async set(key, value) {
    this.store.setItem(this.k(key), JSON.stringify(value));
  }

  async remove(key) {
    this.store.removeItem(this.k(key));
  }

  async clear() {
    for (const key of await this.keys()) {
      this.store.removeItem(this.k(key));
    }
  }

  async keys() {
    const list = [];
    for (let i = 0; i < this.store.length; i += 1) {
      const key = this.store.key(i);
      if (key?.startsWith(this.prefix)) list.push(key.slice(this.prefix.length));
    }
    return list;
  }
}
