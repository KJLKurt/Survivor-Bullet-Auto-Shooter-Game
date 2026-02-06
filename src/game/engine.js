import { aabbCircleHit } from './projectile.js';
import { SpawnManager } from './enemy.js';
import { renderGame } from './render.js';

export class GameEngine {
  constructor({ ctx, level, player, input, ui, sfx, onEnd }) {
    this.ctx = ctx; this.level = level; this.player = player; this.input = input; this.ui = ui; this.sfx = sfx; this.onEnd = onEnd;
    this.enemies = []; this.playerProjectiles = []; this.enemyProjectiles = []; this.coins = [];
    this.score = 0; this.collectedCoins = 0; this.running = false;
    this.spawn = new SpawnManager(level);
    this.last = 0; this.acc = 0; this.step = 1 / 60;
  }

  start() { this.running = true; requestAnimationFrame((t) => this.frame(t)); }
  stop() { this.running = false; }

  frame(ts) {
    if (!this.running) return;
    if (!this.last) this.last = ts;
    const dt = Math.min(0.1, (ts - this.last) / 1000);
    this.last = ts; this.acc += dt;
    while (this.acc >= this.step) { this.update(this.step); this.acc -= this.step; }
    this.render();
    requestAnimationFrame((t) => this.frame(t));
  }

  update(dt) {
    this.player.update(dt, this.input, this.level.arenaSize);
    if (this.input.special && this.player.specialCooldown <= 0) {
      this.player.specialCooldown = 5000;
      this.player.x = Math.min(this.level.arenaSize.width, this.player.x + 80);
    }
    if (this.input.shooting) {
      const shots = this.player.shoot();
      if (shots.length) this.sfx.shoot();
      this.playerProjectiles.push(...shots);
    }
    this.spawn.update(dt, this.enemies);
    this.enemies.forEach((e) => e.update(dt, this.player, this.enemyProjectiles));

    [...this.playerProjectiles, ...this.enemyProjectiles].forEach((p) => p.update(dt));
    this.playerProjectiles = this.playerProjectiles.filter((p) => p.life > 0);
    this.enemyProjectiles = this.enemyProjectiles.filter((p) => p.life > 0);

    for (const p of this.playerProjectiles) {
      for (const e of this.enemies) {
        if (aabbCircleHit(e, p)) {
          e.hp -= p.damage; p.life = 0; this.sfx.hit();
          if (e.hp <= 0) {
            this.score += e.scoreValue; this.sfx.enemyDeath();
            this.coins.push({ x: e.x, y: e.y, value: 1 + Math.floor(Math.random() * 3) });
          }
        }
      }
    }
    this.enemies = this.enemies.filter((e) => e.hp > 0 && e.y < this.level.arenaSize.height + 50);

    for (const p of this.enemyProjectiles) {
      if (aabbCircleHit({ x: this.player.x, y: this.player.y, size: this.player.stats.size }, p)) {
        p.life = 0;
        this.player.takeDamage(p.damage);
        this.sfx.hit();
      }
    }

    this.coins = this.coins.filter((coin) => {
      const pickup = Math.hypot(coin.x - this.player.x, coin.y - this.player.y) < this.player.coinRadius;
      if (pickup) { this.collectedCoins += coin.value; this.sfx.coin(); }
      return !pickup;
    });

    this.ui.updateHud(this.player, this.score, this.collectedCoins);
    if (this.player.health <= 0) { this.stop(); this.onEnd({ score: this.score, coins: this.collectedCoins }); }
  }

  render() { renderGame(this.ctx, this); }
}
