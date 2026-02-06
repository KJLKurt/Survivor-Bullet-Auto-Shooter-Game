import { describe, it, expect, beforeEach } from 'vitest';
import { LocalStorageAdapter } from '../src/storage/localStorageAdapter.js';

describe('LocalStorageAdapter', () => {
  let adapter;
  beforeEach(() => {
    localStorage.clear();
    adapter = new LocalStorageAdapter('t:');
  });

  it('sets and gets values', async () => {
    await adapter.set('foo', { x: 1 });
    await expect(adapter.get('foo')).resolves.toEqual({ x: 1 });
  });

  it('lists namespaced keys', async () => {
    await adapter.set('a', 1); await adapter.set('b', 2);
    await expect(adapter.keys()).resolves.toEqual(['a', 'b']);
  });
});
