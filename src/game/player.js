import { TUNING, WORLD } from "../config.js";
import { normalize } from "../utils/vector.js";

export function createPlayer(character, weapon) {
  const stats = structuredClone(character.stats);
  return {
    id: character.id,
    name: character.name,
    baseStats: stats,
    x: WORLD.PLAYER_SPAWN_X,
    y: WORLD.PLAYER_SPAWN_Y,
    prevX: WORLD.PLAYER_SPAWN_X,
    prevY: WORLD.PLAYER_SPAWN_Y,
    health: stats.maxHealth,
    maxHealth: stats.maxHealth,
    healthRegen: stats.healthRegen,
    speed: stats.speed,
    baseDamage: stats.baseDamage,
    cooldownMs: stats.cooldownMs,
    size: stats.size,
    armorPercent: stats.armorPercent,
    invulnerableMs: 0,
    shootCooldownMs: 0,
    aimDir: { x: 0, y: -1 },
    weapon,
    pickupRadius: TUNING.COIN_PICKUP_BASE_RADIUS,
    damageMultiplier: 1,
    projectileSpeedMultiplier: 1,
    fireRateMultiplier: 1
  };
}

export function savePlayerPreviousPosition(player) {
  player.prevX = player.x;
  player.prevY = player.y;
}

export function setPlayerAim(player, aimVec) {
  const normalized = normalize(aimVec);
  if (normalized.x || normalized.y) {
    player.aimDir = normalized;
  }
}

export function updatePlayer(player, moveVec, dtSeconds, world = WORLD) {
  const move = normalize(moveVec);
  player.x += move.x * player.speed * dtSeconds;
  player.y += move.y * player.speed * dtSeconds;

  const minX = player.size;
  const maxX = world.WIDTH - player.size;
  const minY = player.size;
  const maxY = world.HEIGHT - player.size;

  player.x = Math.min(maxX, Math.max(minX, player.x));
  player.y = Math.min(maxY, Math.max(minY, player.y));

  player.health = Math.min(player.maxHealth, player.health + player.healthRegen * dtSeconds);
  player.shootCooldownMs = Math.max(0, player.shootCooldownMs - dtSeconds * 1000);
  player.invulnerableMs = Math.max(0, player.invulnerableMs - dtSeconds * 1000);
}

export function canPlayerShoot(player) {
  return player.shootCooldownMs <= 0;
}

export function consumePlayerShot(player) {
  if (!canPlayerShoot(player)) {
    return false;
  }
  player.shootCooldownMs = player.cooldownMs / player.fireRateMultiplier;
  return true;
}

export function takePlayerDamage(player, rawDamage) {
  if (player.invulnerableMs > 0) {
    return 0;
  }

  const clampedArmor = Math.min(0.85, Math.max(0, player.armorPercent));
  const actualDamage = rawDamage * (1 - clampedArmor);
  player.health = Math.max(0, player.health - actualDamage);
  player.invulnerableMs = TUNING.PLAYER_INVULN_MS_ON_HIT;
  return actualDamage;
}

export function healPlayer(player, amount) {
  player.health = Math.min(player.maxHealth, player.health + amount);
}

function applyModifier(player, item, level) {
  if (!level || !item.effect) {
    return;
  }

  const { stat, mode, perLevel } = item.effect;
  if (mode === "add") {
    player[stat] += perLevel * level;
    return;
  }

  if (mode === "mult") {
    player[stat] *= 1 + perLevel * level;
  }
}

export function applyUpgradeLevels(player, ownedLevels, itemsById) {
  player.maxHealth = player.baseStats.maxHealth;
  player.healthRegen = player.baseStats.healthRegen;
  player.speed = player.baseStats.speed;
  player.baseDamage = player.baseStats.baseDamage;
  player.cooldownMs = player.baseStats.cooldownMs;
  player.size = player.baseStats.size;
  player.armorPercent = player.baseStats.armorPercent;
  player.pickupRadius = TUNING.COIN_PICKUP_BASE_RADIUS;
  player.damageMultiplier = 1;
  player.projectileSpeedMultiplier = 1;
  player.fireRateMultiplier = 1;

  for (const [itemId, level] of Object.entries(ownedLevels)) {
    const item = itemsById[itemId];
    if (!item) {
      continue;
    }

    if (item.effect?.stat === "pickupRadius") {
      player.pickupRadius += item.effect.perLevel * level;
      continue;
    }

    if (item.effect?.stat === "damageMultiplier") {
      player.damageMultiplier *= 1 + item.effect.perLevel * level;
      continue;
    }

    if (item.effect?.stat === "projectileSpeedMultiplier") {
      player.projectileSpeedMultiplier *= 1 + item.effect.perLevel * level;
      continue;
    }

    if (item.effect?.stat === "fireRateMultiplier") {
      player.fireRateMultiplier *= 1 + item.effect.perLevel * level;
      continue;
    }

    applyModifier(player, item, level);
  }

  if (player.health > player.maxHealth) {
    player.health = player.maxHealth;
  }
}

export function setPlayerWeapon(player, weapon) {
  player.weapon = weapon;
}
