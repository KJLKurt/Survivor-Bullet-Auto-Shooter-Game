import { GAME_CONFIG } from '../config.js';

export default class GameRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  resize(width, height) {
    const ratio = window.devicePixelRatio || 1;
    this.canvas.width = Math.floor(width * ratio);
    this.canvas.height = Math.floor(height * ratio);
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  clear(color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
  }

  drawEntity(entity, color) {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(entity.x, entity.y, entity.size / 2, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawBar(x, y, width, height, valueRatio, fillColor) {
    this.ctx.fillStyle = 'rgba(6, 15, 24, 0.75)';
    this.ctx.fillRect(x, y, width, height);
    this.ctx.fillStyle = fillColor;
    this.ctx.fillRect(x, y, width * Math.max(0, Math.min(1, valueRatio)), height);
  }

  render(state) {
    this.clear(state.backgroundColor);

    this.ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    this.ctx.lineWidth = 1;
    for (let y = 24; y < this.canvas.clientHeight; y += 24) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.clientWidth, y);
      this.ctx.stroke();
    }

    state.coins.forEach((coin) => this.drawEntity(coin, GAME_CONFIG.palette.coin));
    state.projectiles.forEach((projectile) => this.drawEntity(projectile, GAME_CONFIG.palette.projectileFriendly));
    state.enemyProjectiles.forEach((projectile) => this.drawEntity(projectile, GAME_CONFIG.palette.projectileEnemy));

    state.enemies.forEach((enemy) => {
      this.drawEntity(enemy, enemy.color || GAME_CONFIG.palette.enemy);
      this.drawBar(enemy.x - enemy.size / 2, enemy.y - enemy.size * 0.72, enemy.size, 4, enemy.hp / enemy.maxHp, '#ff9aad');
    });

    this.drawEntity(state.player, GAME_CONFIG.palette.player);

    if (state.player.invulnerableMs > 0) {
      this.ctx.strokeStyle = '#8de6ff';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(state.player.x, state.player.y, state.player.size * 0.9, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    const timeLeft = Math.max(0, Math.ceil(state.timeLeftSec));
    this.ctx.fillStyle = GAME_CONFIG.palette.text;
    this.ctx.font = '14px Trebuchet MS';
    this.ctx.fillText(`Time ${timeLeft}s`, 12, this.canvas.clientHeight - 16);
  }
}
