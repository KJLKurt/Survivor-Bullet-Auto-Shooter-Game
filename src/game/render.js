const COLORS = { player:'#53d8fb', enemy:'#f26a8d', projectile:'#f5f7ff', enemyProjectile:'#f6b73c', coin:'#f7ef5f' };

export function renderGame(ctx, game) {
  const { level, player, enemies, playerProjectiles, enemyProjectiles, coins } = game;
  ctx.fillStyle = level.backgroundColor;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  ctx.fillStyle = COLORS.player;
  ctx.fillRect(player.x - player.stats.size, player.y - player.stats.size, player.stats.size * 2, player.stats.size * 2);

  ctx.fillStyle = COLORS.enemy;
  enemies.forEach((e) => ctx.fillRect(e.x - e.size, e.y - e.size, e.size * 2, e.size * 2));

  ctx.fillStyle = COLORS.projectile;
  playerProjectiles.forEach((p) => { ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill(); });
  ctx.fillStyle = COLORS.enemyProjectile;
  enemyProjectiles.forEach((p) => { ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill(); });
  ctx.fillStyle = COLORS.coin;
  coins.forEach((c) => { ctx.beginPath(); ctx.arc(c.x, c.y, 4, 0, Math.PI * 2); ctx.fill(); });
}
