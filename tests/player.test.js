import { describe, expect, it } from 'vitest';
import Player, { applyUpgradeStats } from '../src/game/player.js';
import { CHARACTERS } from '../src/data/characters.js';
import { WEAPONS } from '../src/data/weapons.js';

const rookie = CHARACTERS.find((character) => character.id === 'rookie');
const pistol = WEAPONS.find((weapon) => weapon.id === 'pistol');

describe('applyUpgradeStats', () => {
  it('applies max health and speed upgrades', () => {
    const next = applyUpgradeStats(rookie.baseStats, { maxHealthPct: 0.1, speedPct: 0.2 });
    expect(next.maxHealth).toBe(Math.round(rookie.baseStats.maxHealth * 1.1));
    expect(next.speed).toBeCloseTo(rookie.baseStats.speed * 1.2);
  });
});

describe('Player', () => {
  it('reduces damage by armor and can heal', () => {
    const player = new Player({
      character: rookie,
      weapon: pistol,
      startX: 100,
      startY: 100,
      random: () => 0.99
    });

    const before = player.health;
    player.applyDamage(20);
    expect(player.health).toBeLessThan(before);

    player.heal(1000);
    expect(player.health).toBe(player.maxHealth);
  });

  it('respects weapon cooldown', () => {
    const player = new Player({
      character: rookie,
      weapon: pistol,
      startX: 100,
      startY: 100,
      random: () => 0.99
    });

    const first = player.shoot({ x: 1, y: 0 }, 0);
    const second = player.shoot({ x: 1, y: 0 }, 100);
    const third = player.shoot({ x: 1, y: 0 }, 500);

    expect(first.length).toBeGreaterThan(0);
    expect(second.length).toBe(0);
    expect(third.length).toBeGreaterThan(0);
  });

  it('applies shield chance upgrade', () => {
    const player = new Player({
      character: rookie,
      weapon: pistol,
      upgrades: { shieldChance: 1 },
      startX: 0,
      startY: 0,
      random: () => 0
    });

    const before = player.health;
    player.applyDamage(50);
    expect(player.health).toBe(before);
  });
});
