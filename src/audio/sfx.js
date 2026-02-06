const DEFAULT_PATTERNS = {
  shoot: [
    { frequency: 680, duration: 0.03, type: 'square', gain: 0.08 },
    { frequency: 520, duration: 0.02, type: 'square', gain: 0.06 }
  ],
  hit: [{ frequency: 140, duration: 0.05, type: 'triangle', gain: 0.07 }],
  enemyDeath: [
    { frequency: 380, duration: 0.04, type: 'sawtooth', gain: 0.07 },
    { frequency: 220, duration: 0.06, type: 'sawtooth', gain: 0.06 }
  ],
  coin: [
    { frequency: 740, duration: 0.05, type: 'triangle', gain: 0.07 },
    { frequency: 930, duration: 0.05, type: 'triangle', gain: 0.05 }
  ],
  levelUp: [
    { frequency: 440, duration: 0.05, type: 'sine', gain: 0.08 },
    { frequency: 620, duration: 0.06, type: 'sine', gain: 0.07 },
    { frequency: 820, duration: 0.08, type: 'sine', gain: 0.06 }
  ],
  shopBuy: [{ frequency: 520, duration: 0.06, type: 'sine', gain: 0.06 }],
  updateAvailable: [{ frequency: 350, duration: 0.07, type: 'triangle', gain: 0.06 }]
};

export default class SfxManager {
  constructor(enabled = true) {
    this.enabled = enabled;
    this.registered = new Map();
    this.ctx = null;
    Object.entries(DEFAULT_PATTERNS).forEach(([name, pattern]) => {
      this.register(name, () => this.playPattern(pattern));
    });
  }

  initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextImpl = window.AudioContext || window.webkitAudioContext;
      if (AudioContextImpl) {
        this.ctx = new AudioContextImpl();
      }
    }
    return this.ctx;
  }

  setEnabled(value) {
    this.enabled = Boolean(value);
  }

  register(name, customSound) {
    this.registered.set(name, customSound);
  }

  async play(name) {
    if (!this.enabled) {
      return;
    }

    const ctx = this.initContext();
    if (!ctx) {
      return;
    }

    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const sound = this.registered.get(name);
    if (!sound) {
      return;
    }

    if (typeof sound === 'function') {
      sound(ctx);
      return;
    }

    if (sound instanceof AudioBuffer) {
      const source = ctx.createBufferSource();
      source.buffer = sound;
      source.connect(ctx.destination);
      source.start();
    }
  }

  playPattern(pattern) {
    const ctx = this.initContext();
    if (!ctx) {
      return;
    }

    let start = ctx.currentTime;
    pattern.forEach((tone) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.frequency.value = tone.frequency;
      oscillator.type = tone.type || 'sine';

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(tone.gain || 0.06, start + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + tone.duration);

      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(start);
      oscillator.stop(start + tone.duration + 0.01);
      start += tone.duration * 0.75;
    });
  }
}
