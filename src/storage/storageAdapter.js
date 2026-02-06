import LocalStorageAdapter from './localStorageAdapter.js';

export class StorageAdapter {
  async get(_key) {
    throw new Error('StorageAdapter.get not implemented');
  }

  async set(_key, _value) {
    throw new Error('StorageAdapter.set not implemented');
  }

  async remove(_key) {
    throw new Error('StorageAdapter.remove not implemented');
  }

  async clear() {
    throw new Error('StorageAdapter.clear not implemented');
  }

  async keys() {
    throw new Error('StorageAdapter.keys not implemented');
  }
}

export function createStorageAdapter() {
  return new LocalStorageAdapter();
}
