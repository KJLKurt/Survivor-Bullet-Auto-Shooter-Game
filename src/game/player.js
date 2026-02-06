import { GAME_CONFIG } from '../config.js';
import { clamp, normalize } from '../utils/vector.js';
import { createWeaponProjectiles } from './projectile.js';

export function aggregateUpgradeDeltas(upgradeEntries) {
  return upgradeEntries.reduce((acc, deltas) => {
    Object.entries(deltas).forEach(([key, value]) => {
      acc[key] = (acc[key] || 0) + value;
    });
    return acc;
  }, {});
}

export function applyUpgradeStats(baseStats, aggregatedDeltas = {}) {
  const maxHealth = Math.round(baseStats.maxHealth * (1 + (aggregatedDeltas.maxHealthPct || 0)));
  const speed = baseStats.speed * (1 + (aggregatedDeltas.speedPct || 0));
  const healthRegen = baseStats.healthRegen + (aggregatedDeltas.healthRegenFlat || 0);
  return {
    ...baseStats,
    maxHealth,
    speed,
    healthRegen,
    armor: clamp(baseStats.armor + (aggregatedDeltas.armorFlat || 0), 0, 0.8)
  };
}

export default class Player {
  constructor({ character, weapon, upgrades = {}, startX, startY, random = Math.random }) {
    this.character = character;
    this.weapon = weapon;
    this.upgrades = upgrades;
    this.random = random;

    this.baseStats = applyUpgradeStats(character.baseStats, upgrades);
    this.maxHealth = this.baseStats.maxHealth;
    this.health = this.maxHealth;
    this.speed = this.baseStats.speed;
    this.size = this.baseStats.size || GAME_CONFIG.sizes.player;

    this.x = startX;
    this.y = startY;

    this.lastShotAtMs = -99999;
    this.invulnerableMs = 0;
    this.specialCooldownMs = 0;
  }

  getWeaponStats() {
    const cooldownDelta = this.upgrades.cooldownPct || 0;
    const cooldownPenaltyReduction = this.upgrades.cooldownPenaltyReduction || 0;
    const baseCooldown = this.weapon.cooldownMs * this.character.baseStats.cooldown;
    const adjustedCooldown = baseCooldown * (1 + cooldownDelta * (1 - cooldownPenaltyReduction));

    const projectilesBonus = this.upgrades.projectilesBonus || 0;

    return {
      ...this.weapon,
      cooldownMs: Math.max(65, adjustedCooldown),
      projectileSpeed: this.weapon.projectileSpeed * (1 + (this.upgrades.projectileSpeedPct || 0)),
      damage: this.weapon.damage * this.character.baseStats.baseDamage,
      projectilesPerShot: this.weapon.projectilesPerShot + Math.round(projectilesBonus),
      piercing: this.weapon.special === 'piercing' || this.random() < (this.upgrades.piercingChance || 0),
      explosiveRadius: this.weapon.special === 'explosive'
        ? 20 + (this.upgrades.explosiveRadius || 0)
        : (this.upgrades.explosiveRadius || 0),
      critChance: GAME_CONFIG.defaultCritChance + (this.upgrades.critChance || 0),
      critMultiplier: GAME_CONFIG.defaultCritMultiplier + (this.upgrades.critDamage || 0)
    };
  }

  canShoot(nowMs) {
    return nowMs - this.lastShotAtMs >= this.getWeaponStats().cooldownMs;
  }

  shoot(aimVector, nowMs) {
    if (!this.canShoot(nowMs)) {
      return [];
    }

    this.lastShotAtMs = nowMs;
    const normalizedAim = normalize(aimVector.x, aimVector.y);
    const weaponStats = this.getWeaponStats();
    const crit = this.random() < weaponStats.critChance;
    if (crit) {
      weaponStats.damage *= weaponStats.critMultiplier;
    }
    if (this.character.id === 'berserker' && this.health / this.maxHealth < 0.35) {
      weaponStats.damage *= 1.3;
    }

    return createWeaponProjectiles({ x: this.x, y: this.y }, normalizedAim, weaponStats);
  }

  move(direction, dt, bounds) {
    const normalized = normalize(direction.x, direction.y);
    this.x += normalized.x * this.speed * dt;
    this.y += normalized.y * this.speed * dt;

    const half = this.size / 2;
    this.x = clamp(this.x, half, bounds.width - half);
    this.y = clamp(this.y, half, bounds.height - half);
  }

  update(dt) {
    this.health = Math.min(this.maxHealth, this.health + this.baseStats.healthRegen * dt);
    this.invulnerableMs = Math.max(0, this.invulnerableMs - dt * 1000);
    this.specialCooldownMs = Math.max(0, this.specialCooldownMs - dt * 1000);
  }

  applyDamage(rawDamage) {
    if (this.invulnerableMs > 0) {
      return false;
    }

    const shieldChance = this.upgrades.shieldChance || 0;
    if (this.random() < shieldChance) {
      this.invulnerableMs = 180;
      return false;
    }

    const reduced = rawDamage * (1 - this.baseStats.armor);
    this.health = Math.max(0, this.health - reduced);
    this.invulnerableMs = 120;
    return true;
  }

  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  isDead() {
    return this.health <= 0;
  }

  tryUseSpecial() {
    if (this.specialCooldownMs > 0) {
      return false;
    }

    if (this.character.id === 'ghost') {
      this.invulnerableMs = 1700;
      this.specialCooldownMs = 11000;
      return true;
    }

    if (this.character.id === 'engineer') {
      this.specialCooldownMs = 9000;
      return 'turretBurst';
    }

    this.specialCooldownMs = 7000;
    return false;
  }
}
