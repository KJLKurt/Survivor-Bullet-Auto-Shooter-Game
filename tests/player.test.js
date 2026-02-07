import { describe, expect, it } from "vitest";
import { WEAPONS_BY_ID } from "../src/config.js";
import { CHARACTERS_BY_ID } from "../src/data/characters.js";
import { ITEMS_BY_ID } from "../src/data/items.js";
import {
  applyUpgradeLevels,
  consumePlayerShot,
  createPlayer,
  takePlayerDamage,
  updatePlayer
} from "../src/game/player.js";

describe("Player module", () => {
  it("applies damage with armor and respects hit invulnerability window", () => {
    const player = createPlayer(CHARACTERS_BY_ID.runner, WEAPONS_BY_ID.pulse);
    player.armorPercent = 0.2;

    const damage = takePlayerDamage(player, 50);
    expect(damage).toBeCloseTo(40, 4);

    const secondDamage = takePlayerDamage(player, 50);
    expect(secondDamage).toBe(0);
  });

  it("heals over time and enforces weapon cooldown", () => {
    const player = createPlayer(CHARACTERS_BY_ID.runner, WEAPONS_BY_ID.pulse);
    player.health = 50;

    expect(consumePlayerShot(player)).toBe(true);
    expect(consumePlayerShot(player)).toBe(false);

    updatePlayer(player, { x: 0, y: 0 }, 1);
    expect(player.health).toBeGreaterThan(50);

    updatePlayer(player, { x: 0, y: 0 }, 2);
    expect(consumePlayerShot(player)).toBe(true);
  });

  it("applies upgrade levels onto derived player stats", () => {
    const player = createPlayer(CHARACTERS_BY_ID.runner, WEAPONS_BY_ID.pulse);

    applyUpgradeLevels(
      player,
      {
        vitality_core: 2,
        coin_magnet: 3,
        quick_chamber: 1,
        focusing_lens: 2
      },
      ITEMS_BY_ID
    );

    expect(player.maxHealth).toBeGreaterThan(player.baseStats.maxHealth);
    expect(player.pickupRadius).toBeGreaterThan(36);
    expect(player.fireRateMultiplier).toBeGreaterThan(1);
    expect(player.damageMultiplier).toBeGreaterThan(1);
  });
});
