import { describe, it, expect } from 'vitest';
import { aabbCircleHit } from '../src/game/projectile.js';
import { calcUpgradeCost } from '../src/game/shop.js';

describe('Core logic', () => {
  it('detects AABB collision', () => {
    expect(aabbCircleHit({ x: 10, y: 10, size: 5 }, { x: 14, y: 13, radius: 2 })).toBe(true);
    expect(aabbCircleHit({ x: 10, y: 10, size: 5 }, { x: 30, y: 30, radius: 2 })).toBe(false);
  });

  it('computes next upgrade cost', () => {
    const item = { levels: [{ cost: 10 }, { cost: 20 }] };
    expect(calcUpgradeCost(item, 0)).toBe(10);
    expect(calcUpgradeCost(item, 1)).toBe(20);
    expect(calcUpgradeCost(item, 2)).toBeNull();
  });
});
