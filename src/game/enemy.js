import { Projectile, makeSpread } from './projectile.js';

export class Enemy {
  constructor({ x, y, hp = 20, speed = 50, size = 12, scoreValue = 25, pattern = 'aimed' }) {
    Object.assign(this, { x, y, hp, speed, size, scoreValue, pattern, cooldown: 1.2 });
  }

  update(dt, player, enemyProjectiles) {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const len = Math.hypot(dx, dy) || 1;
    this.x += (dx / len) * this.speed * dt;
    this.y += (dy / len) * this.speed * dt;
    this.cooldown -= dt;
    if (this.cooldown <= 0) {
      this.cooldown = this.pattern === 'spiral' ? 0.2 : 1.3;
      const angle = Math.atan2(dy, dx);
      if (this.pattern === 'radial') {
        for (let i = 0; i < 8; i += 1) {
          const a = (i / 8) * Math.PI * 2;
          enemyProjectiles.push(new Projectile({ x: this.x, y: this.y, vx: Math.cos(a) * 120, vy: Math.sin(a) * 120, friendly: false, damage: 8, radius: 4, life: 3 }));
        }
      } else if (this.pattern === 'spiral') {
        enemyProjectiles.push(new Projectile({ x: this.x, y: this.y, vx: Math.cos(Date.now() / 100) * 140, vy: Math.sin(Date.now() / 100) * 140, friendly: false, damage: 7, radius: 4, life: 3 }));
      } else {
        enemyProjectiles.push(...makeSpread(this, angle, 3, 150, 12, { friendly: false, damage: 7, radius: 4, life: 3 }));
      }
    }
  }
}

export class SpawnManager {
  constructor(level) { this.level = level; this.timer = 0; this.wave = 0; }
  update(dt, enemies) {
    this.timer -= dt;
    if (this.timer > 0) return;
    this.wave += 1;
    this.timer = Math.max(0.5, 2 - this.wave * 0.05);
    const pattern = this.level.spawnPatterns[this.wave % this.level.spawnPatterns.length];
    const count = Math.min(10, 2 + Math.floor(this.wave / 2));
    for (let i = 0; i < count; i += 1) {
      enemies.push(new Enemy({ x: Math.random() * this.level.arenaSize.width, y: -30 - i * 18, hp: 12 + this.wave * 1.8, speed: 40 + this.wave * 1.2, pattern }));
    }
  }
}
