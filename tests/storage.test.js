/* @vitest-environment jsdom */
import { beforeEach, describe, expect, it } from 'vitest';
import LocalStorageAdapter from '../src/storage/localStorageAdapter.js';

describe('LocalStorageAdapter', () => {
  let adapter;

  beforeEach(() => {
    localStorage.clear();
    adapter = new LocalStorageAdapter('test:');
  });

  it('stores and retrieves JSON values', async () => {
    await adapter.set('profile', { score: 42, alive: true });
    const value = await adapter.get('profile');
    expect(value).toEqual({ score: 42, alive: true });
  });

  it('removes one key', async () => {
    await adapter.set('a', 1);
    await adapter.remove('a');
    await expect(adapter.get('a')).resolves.toBeNull();
  });

  it('clears only prefixed keys', async () => {
    await adapter.set('a', 1);
    localStorage.setItem('external', 'value');
    await adapter.clear();

    expect(await adapter.keys()).toEqual([]);
    expect(localStorage.getItem('external')).toBe('value');
  });

  it('returns unprefixed keys list', async () => {
    await adapter.set('x', true);
    await adapter.set('y', false);
    const keys = await adapter.keys();
    expect(keys.sort()).toEqual(['x', 'y']);
  });
});
