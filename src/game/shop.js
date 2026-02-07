const DEFAULT_STATE = {
  coins: 0,
  ownedLevels: {}
};

function cloneState(state) {
  return {
    ...state,
    ownedLevels: { ...(state.ownedLevels ?? {}) }
  };
}

export class Shop {
  constructor({ storage, storageKey = "shop", catalog }) {
    this.storage = storage;
    this.storageKey = storageKey;
    this.catalog = new Map(catalog.map((item) => [item.id, item]));
    this.state = cloneState(DEFAULT_STATE);
  }

  async init(seedState = DEFAULT_STATE) {
    const stored = await this.storage.get(this.storageKey);
    this.state = cloneState({
      ...DEFAULT_STATE,
      ...seedState,
      ...(stored ?? {})
    });

    if (!this.state.ownedLevels) {
      this.state.ownedLevels = {};
    }

    return this.getSnapshot();
  }

  getSnapshot() {
    return cloneState(this.state);
  }

  getLevel(itemId) {
    return this.state.ownedLevels[itemId] ?? 0;
  }

  getCoins() {
    return this.state.coins;
  }

  setCoins(coins) {
    this.state.coins = Math.max(0, Math.floor(coins));
  }

  addCoins(delta) {
    this.setCoins(this.state.coins + delta);
  }

  getItem(itemId) {
    return this.catalog.get(itemId) ?? null;
  }

  getNextCost(itemId) {
    const item = this.getItem(itemId);
    if (!item) {
      return Infinity;
    }

    const level = this.getLevel(itemId);
    if (level >= item.maxLevel) {
      return null;
    }

    return item.costs[level];
  }

  canAfford(itemId) {
    const nextCost = this.getNextCost(itemId);
    if (nextCost === null) {
      return false;
    }
    return this.state.coins >= nextCost;
  }

  async persist() {
    await this.storage.set(this.storageKey, this.getSnapshot());
  }

  async buy(itemId) {
    const item = this.getItem(itemId);
    if (!item) {
      return { ok: false, reason: "MAX_LEVEL" };
    }

    const currentLevel = this.getLevel(itemId);

    if (currentLevel >= item.maxLevel) {
      return { ok: false, reason: "MAX_LEVEL" };
    }

    const nextCost = item.costs[currentLevel];
    if (this.state.coins < nextCost) {
      return { ok: false, reason: "INSUFFICIENT_COINS" };
    }

    this.state.coins -= nextCost;
    this.state.ownedLevels[itemId] = currentLevel + 1;
    await this.persist();

    return {
      ok: true,
      itemId,
      level: this.state.ownedLevels[itemId],
      coins: this.state.coins,
      spent: nextCost
    };
  }
}
