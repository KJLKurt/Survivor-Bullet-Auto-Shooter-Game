import { SIZES, TUNING, WORLD } from "../config.js";
import { fromAngle, normalize } from "../utils/vector.js";

export const ENEMY_ARCHETYPES = {
  skitter: {
    size: SIZES.ENEMY_SMALL,
    speed: 64,
    maxHealth: 18,
    damage: 9,
    shotDamage: 7,
    shotSpeed: 190,
    shootCooldown: 1.3
  },
  brute: {
    size: SIZES.ENEMY_MEDIUM,
    speed: 44,
    maxHealth: 36,
    damage: 14,
    shotDamage: 11,
    shotSpeed: 170,
    shootCooldown: 1.9
  },
  elite: {
    size: SIZES.ENEMY_LARGE,
    speed: 58,
    maxHealth: 58,
    damage: 18,
    shotDamage: 13,
    shotSpeed: 220,
    shootCooldown: 1.15
  }
};

function spawnEdgePosition(size, world = WORLD) {
  const edge = Math.floor(Math.random() * 4);
  if (edge === 0) {
    return { x: Math.random() * world.WIDTH, y: -size * 2 };
  }
  if (edge === 1) {
    return { x: world.WIDTH + size * 2, y: Math.random() * world.HEIGHT };
  }
  if (edge === 2) {
    return { x: Math.random() * world.WIDTH, y: world.HEIGHT + size * 2 };
  }
  return { x: -size * 2, y: Math.random() * world.HEIGHT };
}

export function createEnemy(id, type, pattern, difficulty = 1, world = WORLD) {
  const archetype = ENEMY_ARCHETYPES[type] ?? ENEMY_ARCHETYPES.skitter;
  const spawn = spawnEdgePosition(archetype.size, world);

  return {
    id,
    type,
    pattern,
    x: spawn.x,
    y: spawn.y,
    prevX: spawn.x,
    prevY: spawn.y,
    size: archetype.size,
    speed: archetype.speed + difficulty * 4,
    maxHealth: archetype.maxHealth * (1 + difficulty * 0.08),
    health: archetype.maxHealth * (1 + difficulty * 0.08),
    contactDamage: archetype.damage,
    shotDamage: archetype.shotDamage,
    shotSpeed: archetype.shotSpeed,
    shootCooldown: Math.max(0.32, archetype.shootCooldown - difficulty * 0.04),
    shootTimer: 0,
    spiralAngle: 0,
    alive: true,
    flashDuration: TUNING.ENEMY_FLASH_SECONDS,
    flashTimer: 0
  };
}

export function saveEnemyPrevious(enemy) {
  enemy.prevX = enemy.x;
  enemy.prevY = enemy.y;
}

function enemyMovement(enemy, player, dtSeconds, elapsedSeconds) {
  const toPlayer = normalize({ x: player.x - enemy.x, y: player.y - enemy.y });

  if (enemy.pattern === "wave") {
    const waveOffset = Math.sin(elapsedSeconds * 4 + enemy.id * 0.9);
    enemy.x += (toPlayer.x * enemy.speed + waveOffset * 26) * dtSeconds;
    enemy.y += (toPlayer.y * enemy.speed * 0.7) * dtSeconds;
    return;
  }

  if (enemy.pattern === "spiral") {
    const tangent = fromAngle(Math.atan2(toPlayer.y, toPlayer.x) + Math.PI / 2);
    enemy.x += (toPlayer.x * enemy.speed * 0.7 + tangent.x * 34) * dtSeconds;
    enemy.y += (toPlayer.y * enemy.speed * 0.7 + tangent.y * 34) * dtSeconds;
    return;
  }

  enemy.x += toPlayer.x * enemy.speed * dtSeconds;
  enemy.y += toPlayer.y * enemy.speed * dtSeconds;
}

function spawnRadial(enemy, spawnProjectile) {
  const shots = 8;
  for (let i = 0; i < shots; i += 1) {
    const angle = (Math.PI * 2 * i) / shots;
    const dir = fromAngle(angle);
    spawnProjectile(enemy, dir);
  }
}

function spawnSpiral(enemy, spawnProjectile) {
  enemy.spiralAngle += Math.PI / 9;
  const dir = fromAngle(enemy.spiralAngle);
  spawnProjectile(enemy, dir);
}

function spawnAimedBurst(enemy, player, spawnProjectile) {
  const base = Math.atan2(player.y - enemy.y, player.x - enemy.x);
  const offsets = [-0.18, 0, 0.18];
  for (const offset of offsets) {
    spawnProjectile(enemy, fromAngle(base + offset));
  }
}

function spawnWave(enemy, elapsedSeconds, spawnProjectile) {
  const vertical = Math.sin(elapsedSeconds * 5 + enemy.id) * 0.4;
  spawnProjectile(enemy, normalize({ x: 1, y: vertical }));
  spawnProjectile(enemy, normalize({ x: -1, y: -vertical }));
}

export function updateEnemy(enemy, dtSeconds, player, elapsedSeconds, spawnProjectile) {
  if (!enemy.alive) {
    return;
  }

  enemy.flashTimer = Math.max(0, enemy.flashTimer - dtSeconds);
  enemyMovement(enemy, player, dtSeconds, elapsedSeconds);

  enemy.shootTimer -= dtSeconds;
  if (enemy.shootTimer > 0) {
    return;
  }

  enemy.shootTimer = enemy.shootCooldown;

  if (enemy.pattern === "radial") {
    spawnRadial(enemy, spawnProjectile);
    return;
  }

  if (enemy.pattern === "spiral") {
    spawnSpiral(enemy, spawnProjectile);
    return;
  }

  if (enemy.pattern === "aimed_burst") {
    spawnAimedBurst(enemy, player, spawnProjectile);
    return;
  }

  spawnWave(enemy, elapsedSeconds, spawnProjectile);
}
