import { describe, expect, it, beforeEach } from "vitest";
import { LocalStorageAdapter } from "../src/storage/localStorageAdapter.js";

describe("LocalStorageAdapter", () => {
  let adapter;

  beforeEach(async () => {
    localStorage.clear();
    adapter = new LocalStorageAdapter("test");
    await adapter.clear();
  });

  it("get/set stores and retrieves JSON values", async () => {
    await adapter.set("profile", { coins: 12, nested: { ok: true } });
    const value = await adapter.get("profile");
    expect(value).toEqual({ coins: 12, nested: { ok: true } });
  });

  it("remove deletes one key", async () => {
    await adapter.set("a", 1);
    await adapter.remove("a");
    await expect(adapter.get("a")).resolves.toBeNull();
  });

  it("clear removes all adapter-prefixed keys", async () => {
    await adapter.set("a", 1);
    await adapter.set("b", 2);
    await adapter.clear();
    await expect(adapter.keys()).resolves.toEqual([]);
  });

  it("keys returns adapter-local keys", async () => {
    await adapter.set("alpha", 1);
    await adapter.set("beta", 2);
    const keys = await adapter.keys();
    expect(keys.sort()).toEqual(["alpha", "beta"]);
  });
});
