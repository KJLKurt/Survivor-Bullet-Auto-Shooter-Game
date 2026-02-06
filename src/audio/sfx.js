export class SFX {
  constructor() { this.ctx = null; }
  ensure() { this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)(); }
  tone(freq, duration, type = 'sine', gain = 0.03, slide = 0) {
    this.ensure();
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t); if (slide) o.frequency.linearRampToValueAtTime(freq + slide, t + duration);
    g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    o.connect(g); g.connect(this.ctx.destination); o.start(t); o.stop(t + duration);
  }
  shoot() { this.tone(520, 0.06, 'square'); }
  hit() { this.tone(180, 0.05, 'triangle'); }
  enemyDeath() { this.tone(460, 0.12, 'sawtooth', 0.035, -220); }
  coin() { this.tone(920, 0.08, 'sine'); }
  levelUp() { this.tone(660, 0.16, 'triangle', 0.03, 180); }
  shopBuy() { this.tone(480, 0.07, 'sine'); }
  updateAvailable() { this.tone(720, 0.09, 'sine'); }
}
