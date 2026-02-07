import { COLORS, SIZES } from "../config.js";
import { lerp } from "../utils/vector.js";

function interpolateEntity(entity, alpha) {
  return {
    x: lerp(entity.prevX ?? entity.x, entity.x, alpha),
    y: lerp(entity.prevY ?? entity.y, entity.y, alpha)
  };
}

export function renderGame(ctx, canvas, state, alpha) {
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = state.level.backgroundColor;
  ctx.fillRect(0, 0, width, height);

  renderCoins(ctx, state, alpha);
  renderProjectiles(ctx, state, alpha);
  renderEnemies(ctx, state, alpha);
  renderPlayer(ctx, state, alpha);
}

function renderPlayer(ctx, state, alpha) {
  const player = state.player;
  const pos = interpolateEntity(player, alpha);

  ctx.save();
  ctx.fillStyle = COLORS.PLAYER;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, player.size, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = COLORS.PLAYER_CORE;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, Math.max(4, player.size * 0.38), 0, Math.PI * 2);
  ctx.fill();

  const aim = state.aimDir;
  const length = player.size + 28;
  ctx.strokeStyle = COLORS.AIM;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
  ctx.lineTo(pos.x + aim.x * length, pos.y + aim.y * length);
  ctx.stroke();
  ctx.restore();
}

function renderEnemies(ctx, state, alpha) {
  for (const enemy of state.enemies) {
    if (!enemy.alive) {
      continue;
    }
    const pos = interpolateEntity(enemy, alpha);
    ctx.save();
    ctx.fillStyle = enemy.flashTimer > 0 ? COLORS.ENEMY_FLASH : COLORS.ENEMY;
    ctx.fillRect(pos.x - enemy.size, pos.y - enemy.size, enemy.size * 2, enemy.size * 2);
    ctx.restore();
  }
}

function renderProjectiles(ctx, state, alpha) {
  for (const projectile of state.projectiles.items) {
    if (!projectile.active) {
      continue;
    }

    const x = lerp(projectile.prevX ?? projectile.x, projectile.x, alpha);
    const y = lerp(projectile.prevY ?? projectile.y, projectile.y, alpha);

    ctx.save();
    ctx.fillStyle = projectile.owner === "enemy" ? COLORS.ENEMY_PROJECTILE : COLORS.PLAYER_PROJECTILE;
    const size = projectile.owner === "enemy" ? SIZES.ENEMY_PROJECTILE : projectile.size;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function renderCoins(ctx, state, alpha) {
  for (const coin of state.coins) {
    if (!coin.active) {
      continue;
    }

    const x = lerp(coin.prevX ?? coin.x, coin.x, alpha);
    const y = lerp(coin.prevY ?? coin.y, coin.y, alpha);

    ctx.save();
    ctx.fillStyle = COLORS.COIN;
    ctx.strokeStyle = COLORS.COIN_STROKE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, coin.size ?? SIZES.COIN, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}
