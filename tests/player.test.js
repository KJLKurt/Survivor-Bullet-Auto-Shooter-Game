import { describe, it, expect } from 'vitest';
import { Player } from '../src/game/player.js';

const character = { id:'rookie', name:'Rookie', baseStats:{maxHealth:100,healthRegen:0,speed:100,baseDamage:10,cooldown:300,size:10,armor:0.2}, startingWeaponId:'pistol' };

describe('Player', () => {
  it('applies armor reduction', () => {
    const p = new Player(character);
    p.takeDamage(10);
    expect(p.health).toBe(92);
  });

  it('respects shooting cooldown', () => {
    const p = new Player(character);
    expect(p.shoot().length).toBeGreaterThan(0);
    expect(p.shoot().length).toBe(0);
  });
});
