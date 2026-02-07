function getAudioContextClass() {
  return window.AudioContext || window.webkitAudioContext;
}

export class Sfx {
  constructor() {
    this.registry = new Map();
    this.enabled = true;
    this.audioContext = null;
    this.unlocked = false;
    this.unlockHandler = null;
  }

  setEnabled(enabled) {
    this.enabled = Boolean(enabled);
  }

  getContext() {
    if (!this.audioContext) {
      const Ctx = getAudioContextClass();
      if (!Ctx) {
        return null;
      }
      this.audioContext = new Ctx();
    }
    return this.audioContext;
  }

  enableAutoUnlock() {
    if (this.unlockHandler) {
      return;
    }

    this.unlockHandler = async () => {
      this.unlocked = true;
      const ctx = this.getContext();
      if (ctx?.state === "suspended") {
        await ctx.resume().catch(() => {});
      }

      for (const eventName of ["pointerdown", "keydown", "touchstart"]) {
        window.removeEventListener(eventName, this.unlockHandler);
      }
    };

    for (const eventName of ["pointerdown", "keydown", "touchstart"]) {
      window.addEventListener(eventName, this.unlockHandler, { once: true, passive: true });
    }
  }

  register(name, clip) {
    this.registry.set(name, clip);
  }

  play(name, options = {}) {
    if (!this.enabled || !this.unlocked) {
      return;
    }

    const clip = this.registry.get(name);
    if (!clip) {
      return;
    }

    const ctx = this.getContext();
    if (!ctx) {
      return;
    }

    if (clip instanceof AudioBuffer) {
      const source = ctx.createBufferSource();
      source.buffer = clip;
      source.connect(ctx.destination);
      source.start();
      return;
    }

    if (typeof clip === "function") {
      clip(ctx, options);
    }
  }
}

function beep(ctx, { frequency = 440, duration = 0.08, type = "square", volume = 0.03, slide = 0 }) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;
  if (slide) {
    oscillator.frequency.linearRampToValueAtTime(frequency + slide, ctx.currentTime + duration);
  }

  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start();
  oscillator.stop(ctx.currentTime + duration);
}

export function createDefaultSfx() {
  const sfx = new Sfx();
  sfx.enableAutoUnlock();

  sfx.register("shoot", (ctx) => beep(ctx, { frequency: 760, duration: 0.05, type: "square", volume: 0.02, slide: -160 }));
  sfx.register("hit", (ctx) => beep(ctx, { frequency: 280, duration: 0.06, type: "triangle", volume: 0.03, slide: -30 }));
  sfx.register("enemyDeath", (ctx) => beep(ctx, { frequency: 180, duration: 0.1, type: "sawtooth", volume: 0.04, slide: -120 }));
  sfx.register("coin", (ctx) => beep(ctx, { frequency: 960, duration: 0.04, type: "triangle", volume: 0.03, slide: 120 }));
  sfx.register("levelUp", (ctx) => {
    beep(ctx, { frequency: 520, duration: 0.06, type: "triangle", volume: 0.03, slide: 120 });
    beep(ctx, { frequency: 690, duration: 0.08, type: "triangle", volume: 0.03, slide: 140 });
  });
  sfx.register("shopBuy", (ctx) => beep(ctx, { frequency: 640, duration: 0.08, type: "square", volume: 0.03, slide: 80 }));
  sfx.register("updateAvailable", (ctx) => beep(ctx, { frequency: 430, duration: 0.18, type: "sine", volume: 0.03, slide: 80 }));

  return sfx;
}
