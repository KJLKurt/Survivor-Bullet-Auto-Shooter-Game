import { ITEMS } from '../data/items.js';

export const calcUpgradeCost = (item, ownedLevel) => item.levels[ownedLevel]?.cost ?? null;

export function applyOwnedUpgrades(player, owned) {
  for (const [itemId, level] of Object.entries(owned)) {
    const item = ITEMS.find((i) => i.id === itemId);
    if (!item) continue;
    for (let i = 0; i < level; i += 1) player.applyUpgrade(item.levels[i].delta);
  }
}

export function tryBuyItem(state, itemId) {
  const item = ITEMS.find((i) => i.id === itemId);
  if (!item) return { ok: false, reason: 'Item not found' };
  const ownedLevel = state.upgrades[itemId] || 0;
  const next = item.levels[ownedLevel];
  if (!next) return { ok: false, reason: 'Max level' };
  if (state.coins < next.cost) return { ok: false, reason: 'Not enough coins' };
  state.coins -= next.cost;
  state.upgrades[itemId] = ownedLevel + 1;
  return { ok: true, purchasedLevel: ownedLevel + 1, remainingCoins: state.coins };
}
