import { describe, expect, it, vi } from "vitest";
import {
  checkPlayerEnemyCollision,
  checkProjectileEnemyCollisions,
  createProjectilePool,
  spawnProjectile
} from "../src/game/projectile.js";

describe("Collision helpers", () => {
  it("detects projectile-enemy collisions and resolves kill callback", () => {
    const pool = createProjectilePool(8);
    const enemies = [
      {
        id: 1,
        x: 50,
        y: 50,
        prevX: 50,
        prevY: 50,
        size: 10,
        health: 5,
        flashTimer: 0,
        flashDuration: 0.08,
        alive: true
      }
    ];

    spawnProjectile(pool, {
      x: 52,
      y: 52,
      vx: 0,
      vy: 0,
      owner: "player",
      damage: 7,
      size: 4,
      ttl: 1
    });

    const onHit = vi.fn();
    const onKill = vi.fn();

    checkProjectileEnemyCollisions(pool, enemies, onHit, onKill);

    expect(onHit).toHaveBeenCalledTimes(1);
    expect(onKill).toHaveBeenCalledTimes(1);
    expect(enemies[0].alive).toBe(false);
  });

  it("detects player-enemy AABB overlap", () => {
    const player = { x: 100, y: 100, size: 12 };
    const enemies = [
      { x: 118, y: 100, size: 8, alive: true },
      { x: 250, y: 250, size: 8, alive: true }
    ];

    const collision = checkPlayerEnemyCollision(player, enemies);
    expect(collision).toBe(enemies[0]);
  });
});
