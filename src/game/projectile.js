import { GAME_CONFIG } from '../config.js';
import { angleFrom, fromAngle, normalize } from '../utils/vector.js';

let projectileId = 1;

export default class Projectile {
  constructor({ x, y, vx, vy, size = GAME_CONFIG.sizes.projectile, damage = 1, friendly = true, piercing = false, explosiveRadius = 0, lifeSec = 2.4 }) {
    this.id = projectileId += 1;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.size = size;
    this.damage = damage;
    this.friendly = friendly;
    this.piercing = piercing;
    this.explosiveRadius = explosiveRadius;
    this.lifeSec = lifeSec;
    this.dead = false;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.lifeSec -= dt;
    if (this.lifeSec <= 0) {
      this.dead = true;
    }
  }

  isOutOfBounds(width, height, padding = 60) {
    return this.x < -padding || this.x > width + padding || this.y < -padding || this.y > height + padding;
  }
}

export function createWeaponProjectiles(origin, aimDirection, weaponStats) {
  const direction = normalize(aimDirection.x, aimDirection.y);
  const baseAngle = Math.atan2(direction.y, direction.x);
  const count = weaponStats.projectilesPerShot;
  const spreadRadians = (weaponStats.spreadDegrees * Math.PI) / 180;
  const projectiles = [];

  for (let index = 0; index < count; index += 1) {
    const offset = count === 1 ? 0 : ((index / (count - 1)) - 0.5) * spreadRadians;
    const shotDirection = fromAngle(baseAngle + offset);
    projectiles.push(
      new Projectile({
        x: origin.x,
        y: origin.y,
        vx: shotDirection.x * weaponStats.projectileSpeed,
        vy: shotDirection.y * weaponStats.projectileSpeed,
        damage: weaponStats.damage,
        friendly: true,
        piercing: weaponStats.piercing,
        explosiveRadius: weaponStats.explosiveRadius || 0,
        lifeSec: weaponStats.special === 'shortRange' ? 0.6 : 1.8
      })
    );
  }

  return projectiles;
}

function ringPattern(enemy, bullets, speed, rotation = 0) {
  const shots = [];
  for (let index = 0; index < bullets; index += 1) {
    const direction = fromAngle(rotation + (index / bullets) * Math.PI * 2);
    shots.push(
      new Projectile({
        x: enemy.x,
        y: enemy.y,
        vx: direction.x * speed,
        vy: direction.y * speed,
        damage: enemy.bulletDamage,
        friendly: false,
        size: 7,
        lifeSec: 4.3
      })
    );
  }
  return shots;
}

export function createEnemyPatternProjectiles(patternId, enemy, player, elapsedSec) {
  switch (patternId) {
    case 'radial':
      return ringPattern(enemy, 8, 180);
    case 'spiral': {
      const rotation = elapsedSec * 4.2;
      return ringPattern(enemy, 6, 210, rotation);
    }
    case 'aimedBurst': {
      const base = angleFrom(enemy, player);
      return [-0.2, 0, 0.2].map((offset) => {
        const direction = fromAngle(base + offset);
        return new Projectile({
          x: enemy.x,
          y: enemy.y,
          vx: direction.x * 235,
          vy: direction.y * 235,
          damage: enemy.bulletDamage + 1,
          friendly: false,
          size: 6,
          lifeSec: 3.1
        });
      });
    }
    case 'wave': {
      const a = Math.sin(elapsedSec * 5) * 0.5;
      return [-0.35, 0, 0.35].map((offset) => {
        const direction = fromAngle(Math.PI / 2 + a + offset);
        return new Projectile({
          x: enemy.x,
          y: enemy.y,
          vx: direction.x * 190,
          vy: direction.y * 190,
          damage: enemy.bulletDamage,
          friendly: false,
          size: 7,
          lifeSec: 3.8
        });
      });
    }
    case 'multiPhase': {
      const base = angleFrom(enemy, player);
      const burst = [-0.3, 0, 0.3].map((offset) => {
        const direction = fromAngle(base + offset);
        return new Projectile({
          x: enemy.x,
          y: enemy.y,
          vx: direction.x * 260,
          vy: direction.y * 260,
          damage: enemy.bulletDamage + 2,
          friendly: false,
          size: 8,
          lifeSec: 3.3
        });
      });
      return burst.concat(ringPattern(enemy, 10, 170, elapsedSec * 1.8));
    }
    default:
      return [];
  }
}
