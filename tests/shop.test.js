import { beforeEach, describe, expect, it } from "vitest";
import { LocalStorageAdapter } from "../src/storage/localStorageAdapter.js";
import { Shop } from "../src/game/shop.js";

const catalog = [
  {
    id: "upgrade_1",
    name: "Upgrade 1",
    kind: "upgrade",
    description: "",
    maxLevel: 2,
    costs: [10, 20]
  }
];

describe("Shop transactions", () => {
  let storage;

  beforeEach(() => {
    localStorage.clear();
    storage = new LocalStorageAdapter("shop-test");
  });

  it("rejects purchase when insufficient coins", async () => {
    const shop = new Shop({ storage, storageKey: "shop", catalog });
    await shop.init({ coins: 9, ownedLevels: {} });

    const result = await shop.buy("upgrade_1");
    expect(result).toEqual({ ok: false, reason: "INSUFFICIENT_COINS" });
    expect(shop.getLevel("upgrade_1")).toBe(0);
  });

  it("allows exact coin purchase and persists", async () => {
    const shop = new Shop({ storage, storageKey: "shop", catalog });
    await shop.init({ coins: 10, ownedLevels: {} });

    const result = await shop.buy("upgrade_1");
    expect(result.ok).toBe(true);
    expect(shop.getCoins()).toBe(0);
    expect(shop.getLevel("upgrade_1")).toBe(1);

    const reloaded = new Shop({ storage, storageKey: "shop", catalog });
    await reloaded.init({ coins: 0, ownedLevels: {} });

    expect(reloaded.getCoins()).toBe(0);
    expect(reloaded.getLevel("upgrade_1")).toBe(1);
  });

  it("enforces max level", async () => {
    const shop = new Shop({ storage, storageKey: "shop", catalog });
    await shop.init({ coins: 100, ownedLevels: {} });

    await shop.buy("upgrade_1");
    await shop.buy("upgrade_1");
    const result = await shop.buy("upgrade_1");

    expect(result).toEqual({ ok: false, reason: "MAX_LEVEL" });
  });
});
