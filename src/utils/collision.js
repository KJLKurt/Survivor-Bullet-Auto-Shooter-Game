function bounds(entity) {
  const half = entity.size / 2;
  return {
    left: entity.x - half,
    right: entity.x + half,
    top: entity.y - half,
    bottom: entity.y + half
  };
}

export function intersectsAABB(a, b) {
  const aa = bounds(a);
  const bb = bounds(b);
  return aa.left <= bb.right && aa.right >= bb.left && aa.top <= bb.bottom && aa.bottom >= bb.top;
}

export function projectileHitsEntity(projectile, entity) {
  return intersectsAABB(projectile, entity);
}

export function playerHitsEnemy(player, enemy) {
  return intersectsAABB(player, enemy);
}
