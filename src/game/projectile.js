import { LIMITS, SIZES, WORLD } from "../config.js";

export function createProjectilePool(max = LIMITS.MAX_PROJECTILES) {
  return {
    items: Array.from({ length: max }, () => ({ active: false })),
    nextIndex: 0
  };
}

export function spawnProjectile(pool, spec) {
  const { items } = pool;
  for (let attempt = 0; attempt < items.length; attempt += 1) {
    const index = (pool.nextIndex + attempt) % items.length;
    const projectile = items[index];
    if (projectile.active) {
      continue;
    }

    projectile.active = true;
    projectile.x = spec.x;
    projectile.y = spec.y;
    projectile.prevX = spec.x;
    projectile.prevY = spec.y;
    projectile.vx = spec.vx;
    projectile.vy = spec.vy;
    projectile.size = spec.size ?? SIZES.PROJECTILE;
    projectile.damage = spec.damage ?? 1;
    projectile.owner = spec.owner ?? "player";
    projectile.ttl = spec.ttl ?? 2.5;
    projectile.pierceLeft = spec.pierceLeft ?? 0;
    projectile.special = spec.special ?? "none";
    projectile.explosionRadius = spec.explosionRadius ?? 0;

    pool.nextIndex = (index + 1) % items.length;
    return projectile;
  }

  return null;
}

export function deactivateProjectile(projectile) {
  projectile.active = false;
}

export function forEachActiveProjectile(pool, callback) {
  for (const projectile of pool.items) {
    if (!projectile.active) {
      continue;
    }
    callback(projectile);
  }
}

export function updateProjectiles(pool, dtSeconds, world = WORLD) {
  forEachActiveProjectile(pool, (projectile) => {
    projectile.prevX = projectile.x;
    projectile.prevY = projectile.y;
    projectile.x += projectile.vx * dtSeconds;
    projectile.y += projectile.vy * dtSeconds;
    projectile.ttl -= dtSeconds;

    if (
      projectile.ttl <= 0 ||
      projectile.x < -32 ||
      projectile.y < -32 ||
      projectile.x > world.WIDTH + 32 ||
      projectile.y > world.HEIGHT + 32
    ) {
      deactivateProjectile(projectile);
    }
  });
}

export function aabbOverlap(a, b) {
  return (
    a.x - a.size < b.x + b.size &&
    a.x + a.size > b.x - b.size &&
    a.y - a.size < b.y + b.size &&
    a.y + a.size > b.y - b.size
  );
}

export function checkProjectileEnemyCollisions(pool, enemies, onHitEnemy, onEnemyKilled) {
  forEachActiveProjectile(pool, (projectile) => {
    if (projectile.owner !== "player") {
      return;
    }

    for (const enemy of enemies) {
      if (!enemy.alive) {
        continue;
      }
      if (!aabbOverlap(projectile, enemy)) {
        continue;
      }

      enemy.health -= projectile.damage;
      enemy.flashTimer = enemy.flashDuration;
      onHitEnemy?.(enemy, projectile);

      if (enemy.health <= 0) {
        enemy.alive = false;
        onEnemyKilled?.(enemy, projectile);
      }

      if (projectile.special === "explosive" && projectile.explosionRadius > 0) {
        for (const nearby of enemies) {
          if (!nearby.alive || nearby === enemy) {
            continue;
          }
          const dx = nearby.x - enemy.x;
          const dy = nearby.y - enemy.y;
          const distance = Math.hypot(dx, dy);
          if (distance <= projectile.explosionRadius) {
            nearby.health -= projectile.damage * 0.4;
            nearby.flashTimer = nearby.flashDuration;
            if (nearby.health <= 0) {
              nearby.alive = false;
              onEnemyKilled?.(nearby, projectile);
            }
          }
        }
      }

      if (projectile.pierceLeft > 0) {
        projectile.pierceLeft -= 1;
      } else {
        deactivateProjectile(projectile);
      }
      break;
    }
  });
}

export function checkProjectilePlayerCollisions(pool, player, onPlayerHit) {
  forEachActiveProjectile(pool, (projectile) => {
    if (projectile.owner !== "enemy") {
      return;
    }

    if (!aabbOverlap(projectile, player)) {
      return;
    }

    onPlayerHit?.(projectile);
    deactivateProjectile(projectile);
  });
}

export function checkPlayerEnemyCollision(player, enemies) {
  for (const enemy of enemies) {
    if (!enemy.alive) {
      continue;
    }

    if (aabbOverlap(player, enemy)) {
      return enemy;
    }
  }

  return null;
}
