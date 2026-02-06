export default class LocalStorageAdapter {
  constructor(prefix = 'survivor:') {
    this.prefix = prefix;
  }

  makeKey(key) {
    return `${this.prefix}${key}`;
  }

  async get(key) {
    const raw = globalThis.localStorage.getItem(this.makeKey(key));
    if (raw == null) {
      return null;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  async set(key, value) {
    globalThis.localStorage.setItem(this.makeKey(key), JSON.stringify(value));
  }

  async remove(key) {
    globalThis.localStorage.removeItem(this.makeKey(key));
  }

  async clear() {
    const prefixedKeys = await this.keys();
    prefixedKeys.forEach((key) => {
      globalThis.localStorage.removeItem(this.makeKey(key));
    });
  }

  async keys() {
    const keys = [];
    for (let index = 0; index < globalThis.localStorage.length; index += 1) {
      const key = globalThis.localStorage.key(index);
      if (key && key.startsWith(this.prefix)) {
        keys.push(key.slice(this.prefix.length));
      }
    }
    return keys;
  }
}
