import { describe, expect, it } from 'vitest';
import { playerHitsEnemy, projectileHitsEntity } from '../src/utils/collision.js';

describe('collision helpers', () => {
  it('detects projectile and enemy collision', () => {
    const projectile = { x: 10, y: 10, size: 4 };
    const enemy = { x: 11, y: 11, size: 12 };
    expect(projectileHitsEntity(projectile, enemy)).toBe(true);
  });

  it('detects player and enemy separation', () => {
    const player = { x: 0, y: 0, size: 10 };
    const enemy = { x: 50, y: 50, size: 10 };
    expect(playerHitsEnemy(player, enemy)).toBe(false);
  });
});
