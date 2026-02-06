export class Projectile {
  constructor({ x, y, vx, vy, radius = 4, damage = 1, friendly = true, life = 2, special = {} }) {
    Object.assign(this, { x, y, vx, vy, radius, damage, friendly, life, special });
  }
  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;
  }
}

export const makeSpread = (origin, angle, count, speed, spreadDeg, base) => {
  const out = [];
  const spread = (spreadDeg * Math.PI) / 180;
  for (let i = 0; i < count; i += 1) {
    const t = count === 1 ? 0 : (i / (count - 1) - 0.5);
    const a = angle + t * spread;
    out.push(new Projectile({ ...base, x: origin.x, y: origin.y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed }));
  }
  return out;
};

export const aabbCircleHit = (a, b) => Math.abs(a.x - b.x) < a.size + b.radius && Math.abs(a.y - b.y) < a.size + b.radius;
