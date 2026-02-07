export class StorageAdapter {
  async get(_key) {
    throw new Error("StorageAdapter.get must be implemented");
  }

  async set(_key, _value) {
    throw new Error("StorageAdapter.set must be implemented");
  }

  async remove(_key) {
    throw new Error("StorageAdapter.remove must be implemented");
  }

  async clear() {
    throw new Error("StorageAdapter.clear must be implemented");
  }

  async keys() {
    throw new Error("StorageAdapter.keys must be implemented");
  }
}
