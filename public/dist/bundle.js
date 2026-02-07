// src/config.js
var STEP_SECONDS = 1 / 60;
var MAX_FRAME_SECONDS = 0.05;
var STORAGE_KEYS = {
  PROFILE: "survivor.profile.v1",
  SETTINGS: "survivor.settings.v1",
  HINT_SEEN: "survivor.hintSeen.v1"
};
var WORLD = {
  WIDTH: 960,
  HEIGHT: 540,
  PLAYER_SPAWN_X: 480,
  PLAYER_SPAWN_Y: 300
};
var COLORS = {
  PLAYER: "#53cdf8",
  PLAYER_CORE: "#ffd089",
  AIM: "#9fe8ff",
  PLAYER_PROJECTILE: "#ffe1a8",
  ENEMY_PROJECTILE: "#ff7070",
  ENEMY: "#ff8b7b",
  ENEMY_FLASH: "#fff2aa",
  COIN: "#f6d15e",
  COIN_STROKE: "#9f7e1a",
  HUD_TEXT: "#d7f3ff"
};
var LIMITS = {
  MAX_ENEMIES: 64,
  MAX_PROJECTILES: 420,
  MAX_COINS: 180
};
var SIZES = {
  PLAYER: 16,
  ENEMY_SMALL: 18,
  ENEMY_MEDIUM: 24,
  ENEMY_LARGE: 30,
  PROJECTILE: 6,
  ENEMY_PROJECTILE: 7,
  COIN: 5
};
var TUNING = {
  PLAYER_INVULN_MS_ON_HIT: 220,
  COIN_LIFETIME_SECONDS: 10,
  COIN_PICKUP_BASE_RADIUS: 36,
  COIN_MAGNET_PER_LEVEL: 11,
  ENEMY_FLASH_SECONDS: 0.08,
  SHOOT_FALLBACK_Y: -1
};
var WEAPONS = [
  {
    id: "pulse",
    name: "Pulse Blaster",
    cooldownMs: 280,
    projectileSpeed: 440,
    damage: 11,
    spreadDegrees: 2,
    projectilesPerShot: 1,
    special: "none"
  },
  {
    id: "twin",
    name: "Twin Fork",
    cooldownMs: 340,
    projectileSpeed: 420,
    damage: 8,
    spreadDegrees: 12,
    projectilesPerShot: 2,
    special: "piercing"
  },
  {
    id: "nova",
    name: "Nova Scatter",
    cooldownMs: 560,
    projectileSpeed: 390,
    damage: 7,
    spreadDegrees: 28,
    projectilesPerShot: 5,
    special: "explosive"
  },
  {
    id: "rail",
    name: "Rail Needle",
    cooldownMs: 520,
    projectileSpeed: 560,
    damage: 22,
    spreadDegrees: 0,
    projectilesPerShot: 1,
    special: "piercing"
  }
];
var WEAPONS_BY_ID = Object.fromEntries(WEAPONS.map((weapon) => [weapon.id, weapon]));
var DEFAULT_PROFILE = {
  bankCoins: 0,
  totalCoinsCollected: 0,
  playCount: 0,
  highScore: 0,
  levelsCompleted: [],
  perLevelBest: {},
  ownedLevels: {},
  selectedCharacterId: "runner",
  selectedWeaponId: "pulse",
  unlockedCharacters: ["runner"],
  unlockedWeapons: ["pulse"]
};
var DEFAULT_SETTINGS = {
  sfxEnabled: true
};

// src/audio/sfx.js
function getAudioContextClass() {
  return window.AudioContext || window.webkitAudioContext;
}
var Sfx = class {
  constructor() {
    this.registry = /* @__PURE__ */ new Map();
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
      const ctx2 = this.getContext();
      if (ctx2?.state === "suspended") {
        await ctx2.resume().catch(() => {
        });
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
    const ctx2 = this.getContext();
    if (!ctx2) {
      return;
    }
    if (clip instanceof AudioBuffer) {
      const source = ctx2.createBufferSource();
      source.buffer = clip;
      source.connect(ctx2.destination);
      source.start();
      return;
    }
    if (typeof clip === "function") {
      clip(ctx2, options);
    }
  }
};
function beep(ctx2, { frequency = 440, duration = 0.08, type = "square", volume = 0.03, slide = 0 }) {
  const oscillator = ctx2.createOscillator();
  const gain = ctx2.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  if (slide) {
    oscillator.frequency.linearRampToValueAtTime(frequency + slide, ctx2.currentTime + duration);
  }
  gain.gain.setValueAtTime(volume, ctx2.currentTime);
  gain.gain.exponentialRampToValueAtTime(1e-4, ctx2.currentTime + duration);
  oscillator.connect(gain);
  gain.connect(ctx2.destination);
  oscillator.start();
  oscillator.stop(ctx2.currentTime + duration);
}
function createDefaultSfx() {
  const sfx2 = new Sfx();
  sfx2.enableAutoUnlock();
  sfx2.register("shoot", (ctx2) => beep(ctx2, { frequency: 760, duration: 0.05, type: "square", volume: 0.02, slide: -160 }));
  sfx2.register("hit", (ctx2) => beep(ctx2, { frequency: 280, duration: 0.06, type: "triangle", volume: 0.03, slide: -30 }));
  sfx2.register("enemyDeath", (ctx2) => beep(ctx2, { frequency: 180, duration: 0.1, type: "sawtooth", volume: 0.04, slide: -120 }));
  sfx2.register("coin", (ctx2) => beep(ctx2, { frequency: 960, duration: 0.04, type: "triangle", volume: 0.03, slide: 120 }));
  sfx2.register("levelUp", (ctx2) => {
    beep(ctx2, { frequency: 520, duration: 0.06, type: "triangle", volume: 0.03, slide: 120 });
    beep(ctx2, { frequency: 690, duration: 0.08, type: "triangle", volume: 0.03, slide: 140 });
  });
  sfx2.register("shopBuy", (ctx2) => beep(ctx2, { frequency: 640, duration: 0.08, type: "square", volume: 0.03, slide: 80 }));
  sfx2.register("updateAvailable", (ctx2) => beep(ctx2, { frequency: 430, duration: 0.18, type: "sine", volume: 0.03, slide: 80 }));
  return sfx2;
}

// src/data/characters.js
var CHARACTERS = [
  {
    id: "runner",
    name: "Runner",
    startingWeaponId: "pulse",
    stats: {
      maxHealth: 110,
      healthRegen: 2.8,
      speed: 218,
      baseDamage: 10,
      cooldownMs: 290,
      size: 15,
      armorPercent: 0.04
    },
    unlockCondition: { type: "default", value: 0 }
  },
  {
    id: "bulwark",
    name: "Bulwark",
    startingWeaponId: "pulse",
    stats: {
      maxHealth: 170,
      healthRegen: 2,
      speed: 168,
      baseDamage: 12,
      cooldownMs: 320,
      size: 18,
      armorPercent: 0.18
    },
    unlockCondition: { type: "coins", value: 120 }
  },
  {
    id: "spark",
    name: "Spark",
    startingWeaponId: "twin",
    stats: {
      maxHealth: 95,
      healthRegen: 2.4,
      speed: 240,
      baseDamage: 8,
      cooldownMs: 220,
      size: 14,
      armorPercent: 0.02
    },
    unlockCondition: { type: "playCount", value: 3 }
  },
  {
    id: "warden",
    name: "Warden",
    startingWeaponId: "rail",
    stats: {
      maxHealth: 150,
      healthRegen: 2.2,
      speed: 182,
      baseDamage: 15,
      cooldownMs: 420,
      size: 17,
      armorPercent: 0.12
    },
    unlockCondition: { type: "score", value: 1400 }
  },
  {
    id: "rift",
    name: "Rift",
    startingWeaponId: "nova",
    stats: {
      maxHealth: 105,
      healthRegen: 2.1,
      speed: 205,
      baseDamage: 13,
      cooldownMs: 370,
      size: 16,
      armorPercent: 0.06
    },
    unlockCondition: { type: "levelsCompleted", value: 1 }
  },
  {
    id: "echo",
    name: "Echo",
    startingWeaponId: "twin",
    stats: {
      maxHealth: 120,
      healthRegen: 3.2,
      speed: 198,
      baseDamage: 9,
      cooldownMs: 250,
      size: 15,
      armorPercent: 0.05
    },
    unlockCondition: { type: "coins", value: 380 }
  },
  {
    id: "viper",
    name: "Viper",
    startingWeaponId: "rail",
    stats: {
      maxHealth: 100,
      healthRegen: 1.9,
      speed: 245,
      baseDamage: 16,
      cooldownMs: 470,
      size: 14,
      armorPercent: 0.03
    },
    unlockCondition: { type: "score", value: 2600 }
  },
  {
    id: "atlas",
    name: "Atlas",
    startingWeaponId: "pulse",
    stats: {
      maxHealth: 210,
      healthRegen: 2.5,
      speed: 158,
      baseDamage: 14,
      cooldownMs: 340,
      size: 20,
      armorPercent: 0.2
    },
    unlockCondition: { type: "levelsCompleted", value: 2 }
  },
  {
    id: "aster",
    name: "Aster",
    startingWeaponId: "nova",
    stats: {
      maxHealth: 112,
      healthRegen: 2.6,
      speed: 214,
      baseDamage: 11,
      cooldownMs: 300,
      size: 15,
      armorPercent: 0.07
    },
    unlockCondition: { type: "playCount", value: 9 }
  },
  {
    id: "sol",
    name: "Sol",
    startingWeaponId: "rail",
    stats: {
      maxHealth: 132,
      healthRegen: 2.4,
      speed: 190,
      baseDamage: 18,
      cooldownMs: 450,
      size: 16,
      armorPercent: 0.1
    },
    unlockCondition: { type: "score", value: 4200 }
  }
];
var CHARACTERS_BY_ID = Object.fromEntries(CHARACTERS.map((character) => [character.id, character]));

// src/data/items.js
var ITEMS = [
  {
    id: "vitality_core",
    name: "Vitality Core",
    kind: "upgrade",
    description: "Increase max health with diminishing gains.",
    maxLevel: 5,
    costs: [20, 45, 80, 130, 190],
    effect: { stat: "maxHealth", mode: "add", perLevel: 14 }
  },
  {
    id: "regen_thread",
    name: "Regen Thread",
    kind: "upgrade",
    description: "Improve passive health regeneration.",
    maxLevel: 4,
    costs: [25, 55, 95, 150],
    effect: { stat: "healthRegen", mode: "add", perLevel: 0.42 }
  },
  {
    id: "agility_shards",
    name: "Agility Shards",
    kind: "upgrade",
    description: "Boost movement speed.",
    maxLevel: 5,
    costs: [30, 65, 110, 170, 245],
    effect: { stat: "speed", mode: "add", perLevel: 10 }
  },
  {
    id: "reinforced_plating",
    name: "Reinforced Plating",
    kind: "upgrade",
    description: "Increase armor percentage.",
    maxLevel: 4,
    costs: [35, 80, 140, 220],
    effect: { stat: "armorPercent", mode: "add", perLevel: 0.03 }
  },
  {
    id: "focusing_lens",
    name: "Focusing Lens",
    kind: "upgrade",
    description: "Scale outgoing damage.",
    maxLevel: 5,
    costs: [40, 92, 154, 228, 315],
    effect: { stat: "damageMultiplier", mode: "mult", perLevel: 0.1 }
  },
  {
    id: "quick_chamber",
    name: "Quick Chamber",
    kind: "upgrade",
    description: "Raise fire rate with smaller late gains.",
    maxLevel: 5,
    costs: [34, 76, 129, 198, 286],
    effect: { stat: "fireRateMultiplier", mode: "mult", perLevel: 0.08 }
  },
  {
    id: "kinetic_booster",
    name: "Kinetic Booster",
    kind: "upgrade",
    description: "Increase projectile speed.",
    maxLevel: 4,
    costs: [22, 49, 86, 140],
    effect: { stat: "projectileSpeedMultiplier", mode: "mult", perLevel: 0.12 }
  },
  {
    id: "coin_magnet",
    name: "Coin Magnet",
    kind: "upgrade",
    description: "Expand coin pickup radius.",
    maxLevel: 5,
    costs: [16, 36, 60, 90, 126],
    effect: { stat: "pickupRadius", mode: "add", perLevel: 11 }
  },
  {
    id: "stability_mesh",
    name: "Stability Mesh",
    kind: "upgrade",
    description: "Reduce hitbox size slightly.",
    maxLevel: 3,
    costs: [28, 68, 125],
    effect: { stat: "size", mode: "add", perLevel: -0.9 }
  },
  {
    id: "assault_matrix",
    name: "Assault Matrix",
    kind: "upgrade",
    description: "Add flat base damage.",
    maxLevel: 4,
    costs: [33, 72, 121, 185],
    effect: { stat: "baseDamage", mode: "add", perLevel: 1.8 }
  },
  {
    id: "coolant_loop",
    name: "Coolant Loop",
    kind: "upgrade",
    description: "Lower cooldown baseline.",
    maxLevel: 4,
    costs: [29, 63, 108, 166],
    effect: { stat: "cooldownMs", mode: "add", perLevel: -16 }
  },
  {
    id: "surge_lattice",
    name: "Surge Lattice",
    kind: "upgrade",
    description: "Small all-round scaling for late game.",
    maxLevel: 3,
    costs: [90, 170, 285],
    effect: { stat: "damageMultiplier", mode: "mult", perLevel: 0.06 }
  }
];
var ITEMS_BY_ID = Object.fromEntries(ITEMS.map((item) => [item.id, item]));

// src/data/levels.js
var LEVELS = [
  {
    id: "dockyard",
    name: "Storm Dockyard",
    backgroundColor: "#102034",
    durationSeconds: 85,
    spawnIntervalSeconds: 1.15,
    difficulty: 1,
    waves: [
      { start: 0, end: 24, type: "skitter", pattern: "wave", spawnMultiplier: 1 },
      { start: 24, end: 50, type: "skitter", pattern: "aimed_burst", spawnMultiplier: 0.9 },
      { start: 50, end: 85, type: "brute", pattern: "radial", spawnMultiplier: 0.8 }
    ]
  },
  {
    id: "citadel",
    name: "Fracture Citadel",
    backgroundColor: "#2b1b28",
    durationSeconds: 95,
    spawnIntervalSeconds: 1,
    difficulty: 2,
    waves: [
      { start: 0, end: 30, type: "skitter", pattern: "spiral", spawnMultiplier: 0.95 },
      { start: 30, end: 62, type: "brute", pattern: "aimed_burst", spawnMultiplier: 0.82 },
      { start: 62, end: 95, type: "elite", pattern: "radial", spawnMultiplier: 0.78 }
    ]
  },
  {
    id: "riftcore",
    name: "Riftcore Gate",
    backgroundColor: "#182431",
    durationSeconds: 110,
    spawnIntervalSeconds: 0.9,
    difficulty: 3,
    waves: [
      { start: 0, end: 38, type: "brute", pattern: "spiral", spawnMultiplier: 0.88 },
      { start: 38, end: 74, type: "elite", pattern: "wave", spawnMultiplier: 0.75 },
      { start: 74, end: 110, type: "elite", pattern: "aimed_burst", spawnMultiplier: 0.68 }
    ]
  }
];
var LEVELS_BY_ID = Object.fromEntries(LEVELS.map((level) => [level.id, level]));

// src/game/engine.js
var Engine = class {
  constructor({ update, render, stepSeconds = STEP_SECONDS, maxFrameSeconds = MAX_FRAME_SECONDS, now = () => performance.now() }) {
    this.update = update;
    this.render = render;
    this.stepSeconds = stepSeconds;
    this.maxFrameSeconds = maxFrameSeconds;
    this.now = now;
    this.accumulator = 0;
    this.lastTimestamp = null;
    this.running = false;
    this.rafId = null;
    this.boundFrame = this.frame.bind(this);
  }
  frame(timestampMs = this.now()) {
    if (this.lastTimestamp === null) {
      this.lastTimestamp = timestampMs;
      this.render(0);
      return { steps: 0, alpha: 0, frameTimeSeconds: 0 };
    }
    let frameTimeSeconds = (timestampMs - this.lastTimestamp) / 1e3;
    this.lastTimestamp = timestampMs;
    if (frameTimeSeconds > this.maxFrameSeconds) {
      frameTimeSeconds = this.maxFrameSeconds;
    }
    this.accumulator += frameTimeSeconds;
    let steps = 0;
    while (this.accumulator >= this.stepSeconds) {
      this.update(this.stepSeconds);
      this.accumulator -= this.stepSeconds;
      steps += 1;
    }
    const alpha = this.accumulator / this.stepSeconds;
    this.render(alpha);
    return { steps, alpha, frameTimeSeconds };
  }
  start() {
    if (this.running) {
      return;
    }
    this.running = true;
    this.lastTimestamp = null;
    const loop = (timestamp) => {
      if (!this.running) {
        return;
      }
      this.frame(timestamp);
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }
  stop() {
    this.running = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
};

// src/utils/vector.js
function length(v) {
  return Math.hypot(v.x, v.y);
}
function normalize(v) {
  const len = length(v);
  if (!len) {
    return { x: 0, y: 0 };
  }
  return { x: v.x / len, y: v.y / len };
}
function clampMagnitude(v, maxLength) {
  const len = length(v);
  if (!len || len <= maxLength) {
    return { x: v.x, y: v.y };
  }
  const ratio = maxLength / len;
  return { x: v.x * ratio, y: v.y * ratio };
}
function lerp(a, b, alpha) {
  return a + (b - a) * alpha;
}
function fromAngle(radians) {
  return { x: Math.cos(radians), y: Math.sin(radians) };
}

// src/game/enemy.js
var ENEMY_ARCHETYPES = {
  skitter: {
    size: SIZES.ENEMY_SMALL,
    speed: 64,
    maxHealth: 18,
    damage: 9,
    shotDamage: 7,
    shotSpeed: 190,
    shootCooldown: 1.3
  },
  brute: {
    size: SIZES.ENEMY_MEDIUM,
    speed: 44,
    maxHealth: 36,
    damage: 14,
    shotDamage: 11,
    shotSpeed: 170,
    shootCooldown: 1.9
  },
  elite: {
    size: SIZES.ENEMY_LARGE,
    speed: 58,
    maxHealth: 58,
    damage: 18,
    shotDamage: 13,
    shotSpeed: 220,
    shootCooldown: 1.15
  }
};
function spawnEdgePosition(size, world = WORLD) {
  const edge = Math.floor(Math.random() * 4);
  if (edge === 0) {
    return { x: Math.random() * world.WIDTH, y: -size * 2 };
  }
  if (edge === 1) {
    return { x: world.WIDTH + size * 2, y: Math.random() * world.HEIGHT };
  }
  if (edge === 2) {
    return { x: Math.random() * world.WIDTH, y: world.HEIGHT + size * 2 };
  }
  return { x: -size * 2, y: Math.random() * world.HEIGHT };
}
function createEnemy(id, type, pattern, difficulty = 1, world = WORLD) {
  const archetype = ENEMY_ARCHETYPES[type] ?? ENEMY_ARCHETYPES.skitter;
  const spawn = spawnEdgePosition(archetype.size, world);
  return {
    id,
    type,
    pattern,
    x: spawn.x,
    y: spawn.y,
    prevX: spawn.x,
    prevY: spawn.y,
    size: archetype.size,
    speed: archetype.speed + difficulty * 4,
    maxHealth: archetype.maxHealth * (1 + difficulty * 0.08),
    health: archetype.maxHealth * (1 + difficulty * 0.08),
    contactDamage: archetype.damage,
    shotDamage: archetype.shotDamage,
    shotSpeed: archetype.shotSpeed,
    shootCooldown: Math.max(0.32, archetype.shootCooldown - difficulty * 0.04),
    shootTimer: 0,
    spiralAngle: 0,
    alive: true,
    flashDuration: TUNING.ENEMY_FLASH_SECONDS,
    flashTimer: 0
  };
}
function saveEnemyPrevious(enemy) {
  enemy.prevX = enemy.x;
  enemy.prevY = enemy.y;
}
function enemyMovement(enemy, player, dtSeconds, elapsedSeconds) {
  const toPlayer = normalize({ x: player.x - enemy.x, y: player.y - enemy.y });
  if (enemy.pattern === "wave") {
    const waveOffset = Math.sin(elapsedSeconds * 4 + enemy.id * 0.9);
    enemy.x += (toPlayer.x * enemy.speed + waveOffset * 26) * dtSeconds;
    enemy.y += toPlayer.y * enemy.speed * 0.7 * dtSeconds;
    return;
  }
  if (enemy.pattern === "spiral") {
    const tangent = fromAngle(Math.atan2(toPlayer.y, toPlayer.x) + Math.PI / 2);
    enemy.x += (toPlayer.x * enemy.speed * 0.7 + tangent.x * 34) * dtSeconds;
    enemy.y += (toPlayer.y * enemy.speed * 0.7 + tangent.y * 34) * dtSeconds;
    return;
  }
  enemy.x += toPlayer.x * enemy.speed * dtSeconds;
  enemy.y += toPlayer.y * enemy.speed * dtSeconds;
}
function spawnRadial(enemy, spawnProjectile2) {
  const shots = 8;
  for (let i = 0; i < shots; i += 1) {
    const angle = Math.PI * 2 * i / shots;
    const dir = fromAngle(angle);
    spawnProjectile2(enemy, dir);
  }
}
function spawnSpiral(enemy, spawnProjectile2) {
  enemy.spiralAngle += Math.PI / 9;
  const dir = fromAngle(enemy.spiralAngle);
  spawnProjectile2(enemy, dir);
}
function spawnAimedBurst(enemy, player, spawnProjectile2) {
  const base = Math.atan2(player.y - enemy.y, player.x - enemy.x);
  const offsets = [-0.18, 0, 0.18];
  for (const offset of offsets) {
    spawnProjectile2(enemy, fromAngle(base + offset));
  }
}
function spawnWave(enemy, elapsedSeconds, spawnProjectile2) {
  const vertical = Math.sin(elapsedSeconds * 5 + enemy.id) * 0.4;
  spawnProjectile2(enemy, normalize({ x: 1, y: vertical }));
  spawnProjectile2(enemy, normalize({ x: -1, y: -vertical }));
}
function updateEnemy(enemy, dtSeconds, player, elapsedSeconds, spawnProjectile2) {
  if (!enemy.alive) {
    return;
  }
  enemy.flashTimer = Math.max(0, enemy.flashTimer - dtSeconds);
  enemyMovement(enemy, player, dtSeconds, elapsedSeconds);
  enemy.shootTimer -= dtSeconds;
  if (enemy.shootTimer > 0) {
    return;
  }
  enemy.shootTimer = enemy.shootCooldown;
  if (enemy.pattern === "radial") {
    spawnRadial(enemy, spawnProjectile2);
    return;
  }
  if (enemy.pattern === "spiral") {
    spawnSpiral(enemy, spawnProjectile2);
    return;
  }
  if (enemy.pattern === "aimed_burst") {
    spawnAimedBurst(enemy, player, spawnProjectile2);
    return;
  }
  spawnWave(enemy, elapsedSeconds, spawnProjectile2);
}

// src/game/input.js
function getTouchById(touchList, identifier) {
  for (const touch of touchList) {
    if (touch.identifier === identifier) {
      return touch;
    }
  }
  return null;
}
function computePadVector(touch, pad, maxRadiusPx) {
  const rect = pad.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const offset = {
    x: touch.clientX - cx,
    y: touch.clientY - cy
  };
  const clamped = clampMagnitude(offset, maxRadiusPx);
  return {
    x: clamped.x / maxRadiusPx,
    y: clamped.y / maxRadiusPx
  };
}
function setKnob(knob, vector, maxRadiusPx) {
  const px = vector.x * maxRadiusPx;
  const py = vector.y * maxRadiusPx;
  knob.style.transform = `translate(${px}px, ${py}px)`;
}
function resetKnob(knob) {
  knob.style.transform = "translate(0px, 0px)";
}
var InputController = class {
  constructor({ canvas: canvas2, movePad: movePad2, moveKnob: moveKnob2, aimPad: aimPad2, aimKnob: aimKnob2 }) {
    this.canvas = canvas2;
    this.movePad = movePad2;
    this.moveKnob = moveKnob2;
    this.aimPad = aimPad2;
    this.aimKnob = aimKnob2;
    this.keyboard = /* @__PURE__ */ new Set();
    this.mouseAim = { x: 0, y: -1 };
    this.touchMove = { x: 0, y: 0 };
    this.touchAim = { x: 0, y: 0 };
    this.hasAim = false;
    this.moveTouchId = null;
    this.aimTouchId = null;
    this.aimTapStart = null;
    this.shootRequested = false;
    this.playerScreenPos = { x: canvas2.width / 2, y: canvas2.height / 2 };
    this.handleKeyDown = this.onKeyDown.bind(this);
    this.handleKeyUp = this.onKeyUp.bind(this);
    this.handleMouseMove = this.onMouseMove.bind(this);
    this.handleMouseDown = this.onMouseDown.bind(this);
    this.handleMoveStart = this.onMoveTouchStart.bind(this);
    this.handleMoveMove = this.onMoveTouchMove.bind(this);
    this.handleMoveEnd = this.onMoveTouchEnd.bind(this);
    this.handleAimStart = this.onAimTouchStart.bind(this);
    this.handleAimMove = this.onAimTouchMove.bind(this);
    this.handleAimEnd = this.onAimTouchEnd.bind(this);
    this.attach();
  }
  attach() {
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
    this.canvas.addEventListener("mousemove", this.handleMouseMove);
    this.canvas.addEventListener("mousedown", this.handleMouseDown);
    this.movePad.addEventListener("touchstart", this.handleMoveStart, { passive: false });
    this.movePad.addEventListener("touchmove", this.handleMoveMove, { passive: false });
    this.movePad.addEventListener("touchend", this.handleMoveEnd, { passive: false });
    this.movePad.addEventListener("touchcancel", this.handleMoveEnd, { passive: false });
    this.aimPad.addEventListener("touchstart", this.handleAimStart, { passive: false });
    this.aimPad.addEventListener("touchmove", this.handleAimMove, { passive: false });
    this.aimPad.addEventListener("touchend", this.handleAimEnd, { passive: false });
    this.aimPad.addEventListener("touchcancel", this.handleAimEnd, { passive: false });
  }
  destroy() {
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
    this.canvas.removeEventListener("mousemove", this.handleMouseMove);
    this.canvas.removeEventListener("mousedown", this.handleMouseDown);
    this.movePad.removeEventListener("touchstart", this.handleMoveStart);
    this.movePad.removeEventListener("touchmove", this.handleMoveMove);
    this.movePad.removeEventListener("touchend", this.handleMoveEnd);
    this.movePad.removeEventListener("touchcancel", this.handleMoveEnd);
    this.aimPad.removeEventListener("touchstart", this.handleAimStart);
    this.aimPad.removeEventListener("touchmove", this.handleAimMove);
    this.aimPad.removeEventListener("touchend", this.handleAimEnd);
    this.aimPad.removeEventListener("touchcancel", this.handleAimEnd);
  }
  onKeyDown(event) {
    const key = event.key.toLowerCase();
    this.keyboard.add(key);
    if (key === " ") {
      event.preventDefault();
      this.shootRequested = true;
    }
  }
  onKeyUp(event) {
    this.keyboard.delete(event.key.toLowerCase());
  }
  onMouseMove(event) {
    const rect = this.canvas.getBoundingClientRect();
    const cursor = {
      x: (event.clientX - rect.left) * (this.canvas.width / rect.width),
      y: (event.clientY - rect.top) * (this.canvas.height / rect.height)
    };
    this.mouseAim = normalize({
      x: cursor.x - this.playerScreenPos.x,
      y: cursor.y - this.playerScreenPos.y
    });
    if (this.mouseAim.x || this.mouseAim.y) {
      this.hasAim = true;
    }
  }
  onMouseDown() {
    this.shootRequested = true;
  }
  onMoveTouchStart(event) {
    if (this.moveTouchId !== null) {
      return;
    }
    const touch = event.changedTouches[0];
    this.moveTouchId = touch.identifier;
    this.onMoveTouchMove(event);
  }
  onMoveTouchMove(event) {
    if (this.moveTouchId === null) {
      return;
    }
    event.preventDefault();
    const touch = getTouchById(event.touches, this.moveTouchId);
    if (!touch) {
      return;
    }
    const radius = this.movePad.clientWidth * 0.34;
    this.touchMove = computePadVector(touch, this.movePad, radius);
    setKnob(this.moveKnob, this.touchMove, radius);
  }
  onMoveTouchEnd(event) {
    if (this.moveTouchId === null) {
      return;
    }
    const ended = getTouchById(event.changedTouches, this.moveTouchId);
    if (!ended) {
      return;
    }
    this.moveTouchId = null;
    this.touchMove = { x: 0, y: 0 };
    resetKnob(this.moveKnob);
  }
  onAimTouchStart(event) {
    if (this.aimTouchId !== null) {
      return;
    }
    const touch = event.changedTouches[0];
    this.aimTouchId = touch.identifier;
    this.aimTapStart = { x: touch.clientX, y: touch.clientY };
  }
  onAimTouchMove(event) {
    if (this.aimTouchId === null) {
      return;
    }
    event.preventDefault();
    const touch = getTouchById(event.touches, this.aimTouchId);
    if (!touch) {
      return;
    }
    const radius = this.aimPad.clientWidth * 0.34;
    this.touchAim = computePadVector(touch, this.aimPad, radius);
    const normalAim = normalize(this.touchAim);
    if (normalAim.x || normalAim.y) {
      this.touchAim = normalAim;
      this.hasAim = true;
    }
    setKnob(this.aimKnob, this.touchAim, radius);
  }
  onAimTouchEnd(event) {
    if (this.aimTouchId === null) {
      return;
    }
    const touch = getTouchById(event.changedTouches, this.aimTouchId);
    if (!touch) {
      return;
    }
    const movedDistance = this.aimTapStart ? Math.hypot(touch.clientX - this.aimTapStart.x, touch.clientY - this.aimTapStart.y) : 0;
    if (movedDistance < 14) {
      this.shootRequested = true;
    }
    this.aimTouchId = null;
    this.aimTapStart = null;
    resetKnob(this.aimKnob);
  }
  setPlayerScreenPosition(x, y) {
    this.playerScreenPos = { x, y };
  }
  getMovementVector() {
    if (this.moveTouchId !== null) {
      return normalize(this.touchMove);
    }
    const x = (this.keyboard.has("d") || this.keyboard.has("arrowright") ? 1 : 0) - (this.keyboard.has("a") || this.keyboard.has("arrowleft") ? 1 : 0);
    const y = (this.keyboard.has("s") || this.keyboard.has("arrowdown") ? 1 : 0) - (this.keyboard.has("w") || this.keyboard.has("arrowup") ? 1 : 0);
    return normalize({ x, y });
  }
  getAimVector() {
    if (this.aimTouchId !== null || (this.touchAim.x || this.touchAim.y)) {
      return normalize(this.touchAim);
    }
    if (this.hasAim) {
      return normalize(this.mouseAim);
    }
    return { x: 0, y: 0 };
  }
  consumeShootRequested() {
    if (!this.shootRequested) {
      return false;
    }
    this.shootRequested = false;
    return true;
  }
};

// src/game/level.js
function createLevelRuntime(level) {
  return {
    elapsedSeconds: 0,
    spawnAccumulator: 0,
    completed: false,
    completionAnnounced: false,
    level
  };
}
function getActiveWave(level, elapsedSeconds) {
  return level.waves.find((wave) => elapsedSeconds >= wave.start && elapsedSeconds < wave.end) ?? level.waves[level.waves.length - 1];
}
function updateLevel(runtime, state2, dtSeconds, spawnEnemy) {
  if (runtime.completed) {
    return;
  }
  runtime.elapsedSeconds += dtSeconds;
  runtime.spawnAccumulator += dtSeconds;
  const wave = getActiveWave(runtime.level, runtime.elapsedSeconds);
  const spawnEvery = runtime.level.spawnIntervalSeconds * (wave.spawnMultiplier ?? 1);
  while (runtime.spawnAccumulator >= spawnEvery) {
    runtime.spawnAccumulator -= spawnEvery;
    if (state2.enemies.length >= LIMITS.MAX_ENEMIES) {
      break;
    }
    spawnEnemy(wave.type, wave.pattern, runtime.level.difficulty);
  }
  if (runtime.elapsedSeconds >= runtime.level.durationSeconds) {
    runtime.completed = true;
  }
}

// src/game/player.js
function createPlayer(character, weapon) {
  const stats = structuredClone(character.stats);
  return {
    id: character.id,
    name: character.name,
    baseStats: stats,
    x: WORLD.PLAYER_SPAWN_X,
    y: WORLD.PLAYER_SPAWN_Y,
    prevX: WORLD.PLAYER_SPAWN_X,
    prevY: WORLD.PLAYER_SPAWN_Y,
    health: stats.maxHealth,
    maxHealth: stats.maxHealth,
    healthRegen: stats.healthRegen,
    speed: stats.speed,
    baseDamage: stats.baseDamage,
    cooldownMs: stats.cooldownMs,
    size: stats.size,
    armorPercent: stats.armorPercent,
    invulnerableMs: 0,
    shootCooldownMs: 0,
    aimDir: { x: 0, y: -1 },
    weapon,
    pickupRadius: TUNING.COIN_PICKUP_BASE_RADIUS,
    damageMultiplier: 1,
    projectileSpeedMultiplier: 1,
    fireRateMultiplier: 1
  };
}
function savePlayerPreviousPosition(player) {
  player.prevX = player.x;
  player.prevY = player.y;
}
function setPlayerAim(player, aimVec) {
  const normalized = normalize(aimVec);
  if (normalized.x || normalized.y) {
    player.aimDir = normalized;
  }
}
function updatePlayer(player, moveVec, dtSeconds, world = WORLD) {
  const move = normalize(moveVec);
  player.x += move.x * player.speed * dtSeconds;
  player.y += move.y * player.speed * dtSeconds;
  const minX = player.size;
  const maxX = world.WIDTH - player.size;
  const minY = player.size;
  const maxY = world.HEIGHT - player.size;
  player.x = Math.min(maxX, Math.max(minX, player.x));
  player.y = Math.min(maxY, Math.max(minY, player.y));
  player.health = Math.min(player.maxHealth, player.health + player.healthRegen * dtSeconds);
  player.shootCooldownMs = Math.max(0, player.shootCooldownMs - dtSeconds * 1e3);
  player.invulnerableMs = Math.max(0, player.invulnerableMs - dtSeconds * 1e3);
}
function canPlayerShoot(player) {
  return player.shootCooldownMs <= 0;
}
function consumePlayerShot(player) {
  if (!canPlayerShoot(player)) {
    return false;
  }
  player.shootCooldownMs = player.cooldownMs / player.fireRateMultiplier;
  return true;
}
function takePlayerDamage(player, rawDamage) {
  if (player.invulnerableMs > 0) {
    return 0;
  }
  const clampedArmor = Math.min(0.85, Math.max(0, player.armorPercent));
  const actualDamage = rawDamage * (1 - clampedArmor);
  player.health = Math.max(0, player.health - actualDamage);
  player.invulnerableMs = TUNING.PLAYER_INVULN_MS_ON_HIT;
  return actualDamage;
}
function applyModifier(player, item, level) {
  if (!level || !item.effect) {
    return;
  }
  const { stat, mode, perLevel } = item.effect;
  if (mode === "add") {
    player[stat] += perLevel * level;
    return;
  }
  if (mode === "mult") {
    player[stat] *= 1 + perLevel * level;
  }
}
function applyUpgradeLevels(player, ownedLevels, itemsById) {
  player.maxHealth = player.baseStats.maxHealth;
  player.healthRegen = player.baseStats.healthRegen;
  player.speed = player.baseStats.speed;
  player.baseDamage = player.baseStats.baseDamage;
  player.cooldownMs = player.baseStats.cooldownMs;
  player.size = player.baseStats.size;
  player.armorPercent = player.baseStats.armorPercent;
  player.pickupRadius = TUNING.COIN_PICKUP_BASE_RADIUS;
  player.damageMultiplier = 1;
  player.projectileSpeedMultiplier = 1;
  player.fireRateMultiplier = 1;
  for (const [itemId, level] of Object.entries(ownedLevels)) {
    const item = itemsById[itemId];
    if (!item) {
      continue;
    }
    if (item.effect?.stat === "pickupRadius") {
      player.pickupRadius += item.effect.perLevel * level;
      continue;
    }
    if (item.effect?.stat === "damageMultiplier") {
      player.damageMultiplier *= 1 + item.effect.perLevel * level;
      continue;
    }
    if (item.effect?.stat === "projectileSpeedMultiplier") {
      player.projectileSpeedMultiplier *= 1 + item.effect.perLevel * level;
      continue;
    }
    if (item.effect?.stat === "fireRateMultiplier") {
      player.fireRateMultiplier *= 1 + item.effect.perLevel * level;
      continue;
    }
    applyModifier(player, item, level);
  }
  if (player.health > player.maxHealth) {
    player.health = player.maxHealth;
  }
}
function setPlayerWeapon(player, weapon) {
  player.weapon = weapon;
}

// src/game/projectile.js
function createProjectilePool(max = LIMITS.MAX_PROJECTILES) {
  return {
    items: Array.from({ length: max }, () => ({ active: false })),
    nextIndex: 0
  };
}
function spawnProjectile(pool, spec) {
  const { items } = pool;
  for (let attempt = 0; attempt < items.length; attempt += 1) {
    const index = (pool.nextIndex + attempt) % items.length;
    const projectile = items[index];
    if (projectile.active) {
      continue;
    }
    projectile.active = true;
    projectile.x = spec.x;
    projectile.y = spec.y;
    projectile.prevX = spec.x;
    projectile.prevY = spec.y;
    projectile.vx = spec.vx;
    projectile.vy = spec.vy;
    projectile.size = spec.size ?? SIZES.PROJECTILE;
    projectile.damage = spec.damage ?? 1;
    projectile.owner = spec.owner ?? "player";
    projectile.ttl = spec.ttl ?? 2.5;
    projectile.pierceLeft = spec.pierceLeft ?? 0;
    projectile.special = spec.special ?? "none";
    projectile.explosionRadius = spec.explosionRadius ?? 0;
    pool.nextIndex = (index + 1) % items.length;
    return projectile;
  }
  return null;
}
function deactivateProjectile(projectile) {
  projectile.active = false;
}
function forEachActiveProjectile(pool, callback) {
  for (const projectile of pool.items) {
    if (!projectile.active) {
      continue;
    }
    callback(projectile);
  }
}
function updateProjectiles(pool, dtSeconds, world = WORLD) {
  forEachActiveProjectile(pool, (projectile) => {
    projectile.prevX = projectile.x;
    projectile.prevY = projectile.y;
    projectile.x += projectile.vx * dtSeconds;
    projectile.y += projectile.vy * dtSeconds;
    projectile.ttl -= dtSeconds;
    if (projectile.ttl <= 0 || projectile.x < -32 || projectile.y < -32 || projectile.x > world.WIDTH + 32 || projectile.y > world.HEIGHT + 32) {
      deactivateProjectile(projectile);
    }
  });
}
function aabbOverlap(a, b) {
  return a.x - a.size < b.x + b.size && a.x + a.size > b.x - b.size && a.y - a.size < b.y + b.size && a.y + a.size > b.y - b.size;
}
function checkProjectileEnemyCollisions(pool, enemies, onHitEnemy, onEnemyKilled) {
  forEachActiveProjectile(pool, (projectile) => {
    if (projectile.owner !== "player") {
      return;
    }
    for (const enemy of enemies) {
      if (!enemy.alive) {
        continue;
      }
      if (!aabbOverlap(projectile, enemy)) {
        continue;
      }
      enemy.health -= projectile.damage;
      enemy.flashTimer = enemy.flashDuration;
      onHitEnemy?.(enemy, projectile);
      if (enemy.health <= 0) {
        enemy.alive = false;
        onEnemyKilled?.(enemy, projectile);
      }
      if (projectile.special === "explosive" && projectile.explosionRadius > 0) {
        for (const nearby of enemies) {
          if (!nearby.alive || nearby === enemy) {
            continue;
          }
          const dx = nearby.x - enemy.x;
          const dy = nearby.y - enemy.y;
          const distance = Math.hypot(dx, dy);
          if (distance <= projectile.explosionRadius) {
            nearby.health -= projectile.damage * 0.4;
            nearby.flashTimer = nearby.flashDuration;
            if (nearby.health <= 0) {
              nearby.alive = false;
              onEnemyKilled?.(nearby, projectile);
            }
          }
        }
      }
      if (projectile.pierceLeft > 0) {
        projectile.pierceLeft -= 1;
      } else {
        deactivateProjectile(projectile);
      }
      break;
    }
  });
}
function checkProjectilePlayerCollisions(pool, player, onPlayerHit) {
  forEachActiveProjectile(pool, (projectile) => {
    if (projectile.owner !== "enemy") {
      return;
    }
    if (!aabbOverlap(projectile, player)) {
      return;
    }
    onPlayerHit?.(projectile);
    deactivateProjectile(projectile);
  });
}
function checkPlayerEnemyCollision(player, enemies) {
  for (const enemy of enemies) {
    if (!enemy.alive) {
      continue;
    }
    if (aabbOverlap(player, enemy)) {
      return enemy;
    }
  }
  return null;
}

// src/game/render.js
function interpolateEntity(entity, alpha) {
  return {
    x: lerp(entity.prevX ?? entity.x, entity.x, alpha),
    y: lerp(entity.prevY ?? entity.y, entity.y, alpha)
  };
}
function renderGame(ctx2, canvas2, state2, alpha) {
  const { width, height } = canvas2;
  ctx2.clearRect(0, 0, width, height);
  ctx2.fillStyle = state2.level.backgroundColor;
  ctx2.fillRect(0, 0, width, height);
  renderCoins(ctx2, state2, alpha);
  renderProjectiles(ctx2, state2, alpha);
  renderEnemies(ctx2, state2, alpha);
  renderPlayer(ctx2, state2, alpha);
}
function renderPlayer(ctx2, state2, alpha) {
  const player = state2.player;
  const pos = interpolateEntity(player, alpha);
  ctx2.save();
  ctx2.fillStyle = COLORS.PLAYER;
  ctx2.beginPath();
  ctx2.arc(pos.x, pos.y, player.size, 0, Math.PI * 2);
  ctx2.fill();
  ctx2.fillStyle = COLORS.PLAYER_CORE;
  ctx2.beginPath();
  ctx2.arc(pos.x, pos.y, Math.max(4, player.size * 0.38), 0, Math.PI * 2);
  ctx2.fill();
  const aim = state2.aimDir;
  const length2 = player.size + 28;
  ctx2.strokeStyle = COLORS.AIM;
  ctx2.lineWidth = 3;
  ctx2.beginPath();
  ctx2.moveTo(pos.x, pos.y);
  ctx2.lineTo(pos.x + aim.x * length2, pos.y + aim.y * length2);
  ctx2.stroke();
  ctx2.restore();
}
function renderEnemies(ctx2, state2, alpha) {
  for (const enemy of state2.enemies) {
    if (!enemy.alive) {
      continue;
    }
    const pos = interpolateEntity(enemy, alpha);
    ctx2.save();
    ctx2.fillStyle = enemy.flashTimer > 0 ? COLORS.ENEMY_FLASH : COLORS.ENEMY;
    ctx2.fillRect(pos.x - enemy.size, pos.y - enemy.size, enemy.size * 2, enemy.size * 2);
    ctx2.restore();
  }
}
function renderProjectiles(ctx2, state2, alpha) {
  for (const projectile of state2.projectiles.items) {
    if (!projectile.active) {
      continue;
    }
    const x = lerp(projectile.prevX ?? projectile.x, projectile.x, alpha);
    const y = lerp(projectile.prevY ?? projectile.y, projectile.y, alpha);
    ctx2.save();
    ctx2.fillStyle = projectile.owner === "enemy" ? COLORS.ENEMY_PROJECTILE : COLORS.PLAYER_PROJECTILE;
    const size = projectile.owner === "enemy" ? SIZES.ENEMY_PROJECTILE : projectile.size;
    ctx2.beginPath();
    ctx2.arc(x, y, size, 0, Math.PI * 2);
    ctx2.fill();
    ctx2.restore();
  }
}
function renderCoins(ctx2, state2, alpha) {
  for (const coin of state2.coins) {
    if (!coin.active) {
      continue;
    }
    const x = lerp(coin.prevX ?? coin.x, coin.x, alpha);
    const y = lerp(coin.prevY ?? coin.y, coin.y, alpha);
    ctx2.save();
    ctx2.fillStyle = COLORS.COIN;
    ctx2.strokeStyle = COLORS.COIN_STROKE;
    ctx2.lineWidth = 2;
    ctx2.beginPath();
    ctx2.arc(x, y, coin.size ?? SIZES.COIN, 0, Math.PI * 2);
    ctx2.fill();
    ctx2.stroke();
    ctx2.restore();
  }
}

// src/game/shop.js
var DEFAULT_STATE = {
  coins: 0,
  ownedLevels: {}
};
function cloneState(state2) {
  return {
    ...state2,
    ownedLevels: { ...state2.ownedLevels ?? {} }
  };
}
var Shop = class {
  constructor({ storage: storage2, storageKey = "shop", catalog: catalog2 }) {
    this.storage = storage2;
    this.storageKey = storageKey;
    this.catalog = new Map(catalog2.map((item) => [item.id, item]));
    this.state = cloneState(DEFAULT_STATE);
  }
  async init(seedState = DEFAULT_STATE) {
    const stored = await this.storage.get(this.storageKey);
    this.state = cloneState({
      ...DEFAULT_STATE,
      ...seedState,
      ...stored ?? {}
    });
    if (!this.state.ownedLevels) {
      this.state.ownedLevels = {};
    }
    return this.getSnapshot();
  }
  getSnapshot() {
    return cloneState(this.state);
  }
  getLevel(itemId) {
    return this.state.ownedLevels[itemId] ?? 0;
  }
  getCoins() {
    return this.state.coins;
  }
  setCoins(coins) {
    this.state.coins = Math.max(0, Math.floor(coins));
  }
  addCoins(delta) {
    this.setCoins(this.state.coins + delta);
  }
  getItem(itemId) {
    return this.catalog.get(itemId) ?? null;
  }
  getNextCost(itemId) {
    const item = this.getItem(itemId);
    if (!item) {
      return Infinity;
    }
    const level = this.getLevel(itemId);
    if (level >= item.maxLevel) {
      return null;
    }
    return item.costs[level];
  }
  canAfford(itemId) {
    const nextCost = this.getNextCost(itemId);
    if (nextCost === null) {
      return false;
    }
    return this.state.coins >= nextCost;
  }
  async persist() {
    await this.storage.set(this.storageKey, this.getSnapshot());
  }
  async buy(itemId) {
    const item = this.getItem(itemId);
    if (!item) {
      return { ok: false, reason: "MAX_LEVEL" };
    }
    const currentLevel = this.getLevel(itemId);
    if (currentLevel >= item.maxLevel) {
      return { ok: false, reason: "MAX_LEVEL" };
    }
    const nextCost = item.costs[currentLevel];
    if (this.state.coins < nextCost) {
      return { ok: false, reason: "INSUFFICIENT_COINS" };
    }
    this.state.coins -= nextCost;
    this.state.ownedLevels[itemId] = currentLevel + 1;
    await this.persist();
    return {
      ok: true,
      itemId,
      level: this.state.ownedLevels[itemId],
      coins: this.state.coins,
      spent: nextCost
    };
  }
};

// src/game/ui.js
function el(id) {
  const node = document.getElementById(id);
  if (!node) {
    throw new Error(`Missing DOM element: ${id}`);
  }
  return node;
}
function createUI({ onToggleShop, onCloseShop, onBuy, onToggleSfx, onApplyUpdate, onDismissHint }) {
  const refs = {
    healthText: el("healthText"),
    scoreText: el("scoreText"),
    coinsText: el("coinsText"),
    bankCoinsText: el("bankCoinsText"),
    shopToggle: el("shopToggle"),
    shopClose: el("shopClose"),
    shopPanel: el("shopPanel"),
    shopItems: el("shopItems"),
    toastArea: el("toastArea"),
    hintOverlay: el("hintOverlay"),
    hintDismiss: el("hintDismiss"),
    updateBanner: el("updateBanner"),
    updateButton: el("updateButton"),
    sfxToggle: el("sfxToggle")
  };
  refs.shopToggle.addEventListener("click", onToggleShop);
  refs.shopClose.addEventListener("click", onCloseShop);
  refs.hintDismiss.addEventListener("click", onDismissHint);
  refs.updateButton.addEventListener("click", onApplyUpdate);
  refs.sfxToggle.addEventListener("change", (event) => onToggleSfx(event.target.checked));
  function renderHud2({ health, maxHealth, score, runCoins, bankCoins }) {
    refs.healthText.textContent = `HP: ${Math.ceil(health)}/${Math.ceil(maxHealth)}`;
    refs.scoreText.textContent = `Score: ${Math.floor(score)}`;
    refs.coinsText.textContent = `Run Coins: ${runCoins}`;
    refs.bankCoinsText.textContent = `Bank Coins: ${bankCoins}`;
  }
  function setShopOpen(isOpen) {
    refs.shopPanel.classList.toggle("hidden", !isOpen);
  }
  function showHint(show) {
    refs.hintOverlay.classList.toggle("hidden", !show);
  }
  function showUpdateBanner(show) {
    refs.updateBanner.classList.toggle("hidden", !show);
  }
  function setSfxEnabled(enabled) {
    refs.sfxToggle.checked = Boolean(enabled);
  }
  function showToast(message, type = "info", ttlMs = 1600) {
    const node = document.createElement("div");
    node.className = `toast ${type}`;
    node.textContent = message;
    refs.toastArea.appendChild(node);
    window.setTimeout(() => {
      node.remove();
    }, ttlMs);
  }
  function renderShopEntries(entries, bankCoins) {
    refs.shopItems.innerHTML = "";
    for (const entry of entries) {
      const card = document.createElement("article");
      card.className = "shop-item";
      const title = document.createElement("strong");
      title.textContent = `${entry.name} (${entry.kind})`;
      card.appendChild(title);
      const meta = document.createElement("div");
      meta.className = "meta";
      meta.innerHTML = `<span>${entry.description}</span><span>Level ${entry.level}/${entry.maxLevel}</span>`;
      card.appendChild(meta);
      const row = document.createElement("div");
      row.className = "row";
      const costText = entry.nextCost === null ? "MAX" : `Cost: ${entry.nextCost}`;
      const cost = document.createElement("span");
      cost.textContent = costText;
      row.appendChild(cost);
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = entry.nextCost === null ? "Max" : "Buy";
      const disabled = !entry.unlocked || entry.nextCost === null || bankCoins < entry.nextCost;
      button.disabled = disabled;
      if (!entry.unlocked) {
        button.title = `Unlock: ${entry.unlockText}`;
      }
      button.addEventListener("click", () => onBuy(entry.id));
      row.appendChild(button);
      card.appendChild(row);
      refs.shopItems.appendChild(card);
    }
  }
  return {
    renderHud: renderHud2,
    setShopOpen,
    showHint,
    showToast,
    renderShopEntries,
    setSfxEnabled,
    showUpdateBanner
  };
}

// src/storage/storageAdapter.js
var StorageAdapter = class {
  async get(_key) {
    throw new Error("StorageAdapter.get must be implemented");
  }
  async set(_key, _value) {
    throw new Error("StorageAdapter.set must be implemented");
  }
  async remove(_key) {
    throw new Error("StorageAdapter.remove must be implemented");
  }
  async clear() {
    throw new Error("StorageAdapter.clear must be implemented");
  }
  async keys() {
    throw new Error("StorageAdapter.keys must be implemented");
  }
};

// src/storage/localStorageAdapter.js
var LocalStorageAdapter = class extends StorageAdapter {
  constructor(prefix = "survivor") {
    super();
    this.prefix = prefix;
  }
  makeKey(key) {
    return `${this.prefix}:${key}`;
  }
  async get(key) {
    const raw = localStorage.getItem(this.makeKey(key));
    if (raw === null) {
      return null;
    }
    return JSON.parse(raw);
  }
  async set(key, value) {
    localStorage.setItem(this.makeKey(key), JSON.stringify(value));
  }
  async remove(key) {
    localStorage.removeItem(this.makeKey(key));
  }
  async clear() {
    const keys = await this.keys();
    for (const key of keys) {
      localStorage.removeItem(this.makeKey(key));
    }
  }
  async keys() {
    const out = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const full = localStorage.key(i);
      if (!full || !full.startsWith(`${this.prefix}:`)) {
        continue;
      }
      out.push(full.slice(this.prefix.length + 1));
    }
    return out;
  }
};

// src/main.js
var storage = new LocalStorageAdapter("survivor");
var sfx = createDefaultSfx();
var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");
var movePad = document.getElementById("movePad");
var moveKnob = document.getElementById("moveKnob");
var aimPad = document.getElementById("aimPad");
var aimKnob = document.getElementById("aimKnob");
canvas.width = WORLD.WIDTH;
canvas.height = WORLD.HEIGHT;
ctx.imageSmoothingEnabled = false;
ctx.fillStyle = COLORS.HUD_TEXT;
var catalog = buildShopCatalog();
var shop = new Shop({
  storage,
  storageKey: "shop",
  catalog
});
var swRegistration = null;
var waitingWorker = null;
var swReloaded = false;
var shopOpen = false;
var saveQueued = false;
var announcedUnlockables = /* @__PURE__ */ new Set();
var ui = createUI({
  onToggleShop: () => {
    shopOpen = !shopOpen;
    ui.setShopOpen(shopOpen);
    renderShop();
  },
  onCloseShop: () => {
    shopOpen = false;
    ui.setShopOpen(false);
  },
  onBuy: async (itemId) => {
    const item = catalog.find((entry) => entry.id === itemId);
    if (!item) {
      return;
    }
    if (!unlockConditionMet(item.unlockCondition, profile)) {
      ui.showToast(`Locked: ${describeUnlock(item.unlockCondition)}`, "error");
      return;
    }
    const result = await shop.buy(itemId);
    if (!result.ok) {
      const reason = result.reason === "MAX_LEVEL" ? "Item already maxed" : "Not enough coins";
      ui.showToast(reason, "error");
      return;
    }
    onCatalogPurchase(itemId);
    sfx.play("shopBuy");
    ui.showToast(`Purchased ${item.name}`, "success");
    applyOwnedLevelsToPlayer();
    renderHud();
    renderShop();
    queueSave();
  },
  onToggleSfx: async (enabled) => {
    settings.sfxEnabled = enabled;
    sfx.setEnabled(enabled);
    await storage.set(STORAGE_KEYS.SETTINGS, settings);
  },
  onApplyUpdate: () => {
    const target = waitingWorker ?? swRegistration?.waiting;
    if (!target) {
      return;
    }
    target.postMessage({ type: "SKIP_WAITING" });
  },
  onDismissHint: async () => {
    ui.showHint(false);
    hintSeen = true;
    await storage.set(STORAGE_KEYS.HINT_SEEN, true);
  }
});
var input = new InputController({
  canvas,
  movePad,
  moveKnob,
  aimPad,
  aimKnob
});
var engine = new Engine({
  update: tick,
  render: (alpha) => renderGame(ctx, canvas, state, alpha)
});
var profile = structuredClone(DEFAULT_PROFILE);
var settings = structuredClone(DEFAULT_SETTINGS);
var hintSeen = false;
var state = {
  levelIndex: 0,
  level: LEVELS[0],
  levelRuntime: createLevelRuntime(LEVELS[0]),
  player: null,
  enemies: [],
  coins: [],
  projectiles: createProjectilePool(),
  score: 0,
  runCoins: 0,
  elapsedSeconds: 0,
  gameOver: false,
  gameWon: false,
  enemyIdSeed: 0,
  coinIdSeed: 0,
  aimDir: { x: 0, y: -1 },
  moveDir: { x: 0, y: 0 },
  hasExplicitAim: false
};
await bootstrap();
async function bootstrap() {
  await loadPersistence();
  await initShop();
  sfx.setEnabled(settings.sfxEnabled);
  ui.setSfxEnabled(settings.sfxEnabled);
  ui.showHint(!hintSeen);
  startRun(true);
  renderShop();
  renderHud();
  engine.start();
  registerServiceWorker();
}
async function loadPersistence() {
  const [storedProfile, storedSettings, storedHintSeen] = await Promise.all([
    storage.get(STORAGE_KEYS.PROFILE),
    storage.get(STORAGE_KEYS.SETTINGS),
    storage.get(STORAGE_KEYS.HINT_SEEN)
  ]);
  profile = {
    ...structuredClone(DEFAULT_PROFILE),
    ...storedProfile ?? {}
  };
  profile.levelsCompleted = Array.isArray(profile.levelsCompleted) ? profile.levelsCompleted : [];
  profile.perLevelBest = { ...profile.perLevelBest ?? {} };
  profile.ownedLevels = { ...profile.ownedLevels ?? {} };
  profile.unlockedCharacters = unique(["runner", ...profile.unlockedCharacters ?? []]);
  profile.unlockedWeapons = unique(["pulse", ...profile.unlockedWeapons ?? []]);
  settings = {
    ...structuredClone(DEFAULT_SETTINGS),
    ...storedSettings ?? {}
  };
  hintSeen = Boolean(storedHintSeen);
  sanitizeProfileSelections();
}
async function initShop() {
  const seeded = {
    coins: profile.bankCoins,
    ownedLevels: {
      ...profile.ownedLevels,
      ...seedPurchasedUnlocks(profile)
    }
  };
  const snapshot = await shop.init(seeded);
  profile.bankCoins = snapshot.coins;
  profile.ownedLevels = { ...snapshot.ownedLevels };
}
function sanitizeProfileSelections() {
  if (!profile.unlockedCharacters.includes(profile.selectedCharacterId)) {
    profile.selectedCharacterId = profile.unlockedCharacters[0] ?? "runner";
  }
  if (!profile.unlockedWeapons.includes(profile.selectedWeaponId)) {
    profile.selectedWeaponId = profile.unlockedWeapons[0] ?? "pulse";
  }
}
function unique(items) {
  return [...new Set(items)];
}
function seedPurchasedUnlocks(sourceProfile) {
  const seeded = {};
  for (const id of sourceProfile.unlockedCharacters) {
    if (id !== "runner") {
      seeded[`character:${id}`] = 1;
    }
  }
  for (const id of sourceProfile.unlockedWeapons) {
    if (id !== "pulse") {
      seeded[`weapon:${id}`] = 1;
    }
  }
  return seeded;
}
function getCurrentCharacter() {
  return CHARACTERS_BY_ID[profile.selectedCharacterId] ?? CHARACTERS[0];
}
function getCurrentWeapon(character) {
  const preferredWeapon = WEAPONS_BY_ID[profile.selectedWeaponId];
  if (preferredWeapon && profile.unlockedWeapons.includes(preferredWeapon.id)) {
    return preferredWeapon;
  }
  const fallback = WEAPONS_BY_ID[character.startingWeaponId] ?? WEAPONS_BY_ID.pulse;
  if (profile.unlockedWeapons.includes(fallback.id)) {
    return fallback;
  }
  return WEAPONS_BY_ID.pulse;
}
function getUpgradeLevelsOnly() {
  const owned = shop.getSnapshot().ownedLevels;
  const levels = {};
  for (const [id, level] of Object.entries(owned)) {
    if (ITEMS_BY_ID[id]) {
      levels[id] = level;
    }
  }
  return levels;
}
function applyOwnedLevelsToPlayer() {
  if (!state.player) {
    return;
  }
  const upgradeLevels = getUpgradeLevelsOnly();
  applyUpgradeLevels(state.player, upgradeLevels, ITEMS_BY_ID);
}
function startRun(incrementPlayCount) {
  if (incrementPlayCount) {
    profile.playCount += 1;
  }
  const runNumber = Math.max(1, profile.playCount);
  state.levelIndex = (runNumber - 1) % LEVELS.length;
  state.level = LEVELS[state.levelIndex];
  state.levelRuntime = createLevelRuntime(state.level);
  state.enemies.length = 0;
  state.coins.length = 0;
  state.projectiles = createProjectilePool();
  state.score = 0;
  state.runCoins = 0;
  state.elapsedSeconds = 0;
  state.gameOver = false;
  state.gameWon = false;
  const character = getCurrentCharacter();
  const weapon = getCurrentWeapon(character);
  state.player = createPlayer(character, weapon);
  applyOwnedLevelsToPlayer();
  state.aimDir = { x: 0, y: -1 };
  state.moveDir = { x: 0, y: 0 };
  state.hasExplicitAim = false;
  ui.showToast(`Entering ${state.level.name}`, "success", 1500);
  queueSave();
}
function tick(dtSeconds) {
  if (!state.player) {
    return;
  }
  state.elapsedSeconds += dtSeconds;
  savePlayerPreviousPosition(state.player);
  for (const enemy of state.enemies) {
    saveEnemyPrevious(enemy);
  }
  for (const coin of state.coins) {
    coin.prevX = coin.x;
    coin.prevY = coin.y;
  }
  state.moveDir = input.getMovementVector();
  const aimInput = input.getAimVector();
  if (aimInput.x || aimInput.y) {
    state.aimDir = normalize(aimInput);
    state.hasExplicitAim = true;
  }
  setPlayerAim(state.player, state.aimDir);
  input.setPlayerScreenPosition(state.player.x, state.player.y);
  if (state.gameOver) {
    if (input.consumeShootRequested()) {
      startRun(true);
    }
    return;
  }
  updatePlayer(state.player, state.moveDir, dtSeconds, WORLD);
  const requestedShot = input.consumeShootRequested();
  if (requestedShot) {
    const fallbackAim = resolveFallbackAim();
    state.aimDir = normalize(fallbackAim);
    setPlayerAim(state.player, state.aimDir);
    firePlayerWeapon(state.aimDir);
  }
  updateLevel(state.levelRuntime, state, dtSeconds, (type, pattern, difficulty) => {
    const enemy = createEnemy(++state.enemyIdSeed, type, pattern, difficulty, WORLD);
    state.enemies.push(enemy);
  });
  for (const enemy of state.enemies) {
    updateEnemy(enemy, dtSeconds, state.player, state.elapsedSeconds, (sourceEnemy, direction) => {
      spawnProjectile(state.projectiles, {
        x: sourceEnemy.x,
        y: sourceEnemy.y,
        vx: direction.x * sourceEnemy.shotSpeed,
        vy: direction.y * sourceEnemy.shotSpeed,
        owner: "enemy",
        size: SIZES.ENEMY_PROJECTILE,
        damage: sourceEnemy.shotDamage,
        ttl: 4
      });
    });
  }
  updateProjectiles(state.projectiles, dtSeconds, WORLD);
  updateCoins(dtSeconds);
  checkProjectileEnemyCollisions(
    state.projectiles,
    state.enemies,
    () => {
      sfx.play("hit");
    },
    (enemy) => {
      state.score += Math.round(enemy.maxHealth * 4);
      dropCoins(enemy.x, enemy.y, Math.max(1, Math.round(enemy.size / 12)));
      sfx.play("enemyDeath");
    }
  );
  checkProjectilePlayerCollisions(state.projectiles, state.player, (projectile) => {
    const damageDone = takePlayerDamage(state.player, projectile.damage);
    if (damageDone > 0) {
      sfx.play("hit");
    }
  });
  const contactEnemy = checkPlayerEnemyCollision(state.player, state.enemies);
  if (contactEnemy) {
    const damageDone = takePlayerDamage(state.player, contactEnemy.contactDamage * dtSeconds * 6.2);
    if (damageDone > 0) {
      sfx.play("hit");
    }
  }
  cleanupEntities();
  state.score += dtSeconds * 7;
  if (state.player.health <= 0) {
    finishRun(false);
  }
  if (state.levelRuntime.completed && state.enemies.length === 0) {
    onLevelCompleted();
  }
  announceUnlocks();
  renderHud();
  if (shopOpen) {
    renderShop();
  }
  if (Math.floor(state.elapsedSeconds * 10) % 13 === 0) {
    queueSave();
  }
}
function resolveFallbackAim() {
  if (state.hasExplicitAim && (state.aimDir.x || state.aimDir.y)) {
    return state.aimDir;
  }
  if (state.moveDir.x || state.moveDir.y) {
    return state.moveDir;
  }
  return { x: 0, y: TUNING.SHOOT_FALLBACK_Y };
}
function firePlayerWeapon(direction) {
  if (!consumePlayerShot(state.player)) {
    return;
  }
  const weapon = state.player.weapon;
  const baseAngle = Math.atan2(direction.y, direction.x);
  const spread = weapon.spreadDegrees * Math.PI / 180;
  const totalProjectiles = weapon.projectilesPerShot;
  for (let i = 0; i < totalProjectiles; i += 1) {
    const t = totalProjectiles === 1 ? 0.5 : i / (totalProjectiles - 1);
    const offset = (t - 0.5) * spread;
    const dir = fromAngle(baseAngle + offset);
    const damage = (weapon.damage + state.player.baseDamage) * state.player.damageMultiplier;
    const speed = weapon.projectileSpeed * state.player.projectileSpeedMultiplier;
    spawnProjectile(state.projectiles, {
      x: state.player.x + dir.x * (state.player.size + 4),
      y: state.player.y + dir.y * (state.player.size + 4),
      vx: dir.x * speed,
      vy: dir.y * speed,
      owner: "player",
      size: SIZES.PROJECTILE,
      damage,
      ttl: 2,
      special: weapon.special,
      pierceLeft: weapon.special === "piercing" ? 1 : 0,
      explosionRadius: weapon.special === "explosive" ? 32 : 0
    });
  }
  sfx.play("shoot");
}
function updateCoins(dtSeconds) {
  const pickupRadius = state.player.pickupRadius;
  for (const coin of state.coins) {
    if (!coin.active) {
      continue;
    }
    coin.age += dtSeconds;
    coin.vx *= 0.94;
    coin.vy *= 0.94;
    coin.x += coin.vx * dtSeconds;
    coin.y += coin.vy * dtSeconds;
    if (coin.age > TUNING.COIN_LIFETIME_SECONDS) {
      coin.active = false;
      continue;
    }
    const dx = state.player.x - coin.x;
    const dy = state.player.y - coin.y;
    const distance = Math.hypot(dx, dy);
    if (distance <= pickupRadius) {
      coin.active = false;
      state.runCoins += coin.value;
      shop.addCoins(coin.value);
      profile.bankCoins = shop.getCoins();
      profile.totalCoinsCollected += coin.value;
      sfx.play("coin");
      queueSave();
    }
  }
}
function dropCoins(x, y, count) {
  for (let i = 0; i < count; i += 1) {
    if (state.coins.length >= 180) {
      break;
    }
    const angle = Math.random() * Math.PI * 2;
    const speed = 30 + Math.random() * 60;
    state.coins.push({
      id: ++state.coinIdSeed,
      active: true,
      x,
      y,
      prevX: x,
      prevY: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      value: 1,
      size: SIZES.COIN,
      age: 0
    });
  }
}
function cleanupEntities() {
  state.enemies = state.enemies.filter((enemy) => enemy.alive);
  state.coins = state.coins.filter((coin) => coin.active);
}
function onLevelCompleted() {
  if (!profile.levelsCompleted.includes(state.level.id)) {
    profile.levelsCompleted.push(state.level.id);
  }
  const levelBest = profile.perLevelBest[state.level.id] ?? 0;
  profile.perLevelBest[state.level.id] = Math.max(levelBest, Math.floor(state.score));
  if (state.levelIndex < LEVELS.length - 1) {
    state.levelIndex += 1;
    state.level = LEVELS[state.levelIndex];
    state.levelRuntime = createLevelRuntime(state.level);
    ui.showToast(`Level clear. Entering ${state.level.name}`, "success", 1800);
    sfx.play("levelUp");
    queueSave();
    return;
  }
  finishRun(true);
}
function finishRun(won) {
  state.gameOver = true;
  state.gameWon = won;
  profile.highScore = Math.max(profile.highScore, Math.floor(state.score));
  profile.bankCoins = shop.getCoins();
  profile.ownedLevels = shop.getSnapshot().ownedLevels;
  queueSave();
  const msg = won ? `Run complete! Score ${Math.floor(state.score)}. Tap fire to restart.` : `Downed! Score ${Math.floor(state.score)}. Tap fire to retry.`;
  ui.showToast(msg, won ? "success" : "error", 2100);
}
function renderHud() {
  ui.renderHud({
    health: state.player.health,
    maxHealth: state.player.maxHealth,
    score: state.score,
    runCoins: state.runCoins,
    bankCoins: shop.getCoins()
  });
}
function renderShop() {
  const entries = catalog.map((item) => {
    const level = shop.getLevel(item.id);
    const nextCost = shop.getNextCost(item.id);
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      kind: item.kind,
      level,
      maxLevel: item.maxLevel,
      nextCost,
      unlocked: unlockConditionMet(item.unlockCondition, profile),
      unlockText: describeUnlock(item.unlockCondition)
    };
  });
  ui.renderShopEntries(entries, shop.getCoins());
}
function onCatalogPurchase(itemId) {
  const item = catalog.find((entry) => entry.id === itemId);
  if (!item) {
    return;
  }
  if (item.reward?.type === "character") {
    if (!profile.unlockedCharacters.includes(item.reward.id)) {
      profile.unlockedCharacters.push(item.reward.id);
      profile.selectedCharacterId = item.reward.id;
      ui.showToast(`${CHARACTERS_BY_ID[item.reward.id].name} unlocked`, "success", 1800);
    }
  }
  if (item.reward?.type === "weapon") {
    if (!profile.unlockedWeapons.includes(item.reward.id)) {
      profile.unlockedWeapons.push(item.reward.id);
      profile.selectedWeaponId = item.reward.id;
      if (state.player) {
        setPlayerWeapon(state.player, WEAPONS_BY_ID[item.reward.id]);
      }
      ui.showToast(`${WEAPONS_BY_ID[item.reward.id].name} unlocked`, "success", 1800);
    }
  }
  profile.bankCoins = shop.getCoins();
  profile.ownedLevels = shop.getSnapshot().ownedLevels;
}
function announceUnlocks() {
  for (const item of catalog) {
    if (shop.getLevel(item.id) > 0) {
      continue;
    }
    if (!unlockConditionMet(item.unlockCondition, profile)) {
      continue;
    }
    if (announcedUnlockables.has(item.id)) {
      continue;
    }
    announcedUnlockables.add(item.id);
    ui.showToast(`Unlocked in shop: ${item.name}`, "success", 1800);
    sfx.play("levelUp");
  }
}
function queueSave() {
  if (saveQueued) {
    return;
  }
  saveQueued = true;
  window.setTimeout(async () => {
    saveQueued = false;
    profile.bankCoins = shop.getCoins();
    profile.ownedLevels = shop.getSnapshot().ownedLevels;
    sanitizeProfileSelections();
    await Promise.all([
      storage.set(STORAGE_KEYS.PROFILE, profile),
      shop.persist()
    ]);
  }, 100);
}
function buildShopCatalog() {
  const upgrades = ITEMS.map((item) => ({
    ...item,
    unlockCondition: { type: "default", value: 0 }
  }));
  const characters = CHARACTERS.filter((character) => character.id !== "runner").map((character, index) => ({
    id: `character:${character.id}`,
    name: `Unlock ${character.name}`,
    kind: "character",
    description: "Playable character unlock.",
    maxLevel: 1,
    costs: [120 + index * 72],
    unlockCondition: character.unlockCondition,
    reward: { type: "character", id: character.id }
  }));
  const weaponUnlocks = [
    { id: "twin", unlockCondition: { type: "playCount", value: 2 }, cost: 170 },
    { id: "nova", unlockCondition: { type: "levelsCompleted", value: 1 }, cost: 300 },
    { id: "rail", unlockCondition: { type: "score", value: 1800 }, cost: 390 }
  ].map((entry) => ({
    id: `weapon:${entry.id}`,
    name: `Unlock ${WEAPONS_BY_ID[entry.id].name}`,
    kind: "weapon",
    description: "Weapon unlock for future runs.",
    maxLevel: 1,
    costs: [entry.cost],
    unlockCondition: entry.unlockCondition,
    reward: { type: "weapon", id: entry.id }
  }));
  return [...upgrades, ...characters, ...weaponUnlocks];
}
function unlockConditionMet(condition, sourceProfile) {
  if (!condition || condition.type === "default") {
    return true;
  }
  if (condition.type === "playCount") {
    return sourceProfile.playCount >= condition.value;
  }
  if (condition.type === "coins") {
    return sourceProfile.totalCoinsCollected >= condition.value;
  }
  if (condition.type === "levelsCompleted") {
    return sourceProfile.levelsCompleted.length >= condition.value;
  }
  if (condition.type === "score") {
    return sourceProfile.highScore >= condition.value;
  }
  return false;
}
function describeUnlock(condition) {
  if (!condition || condition.type === "default") {
    return "Available";
  }
  if (condition.type === "playCount") {
    return `Play ${condition.value} runs`;
  }
  if (condition.type === "coins") {
    return `Collect ${condition.value} total coins`;
  }
  if (condition.type === "levelsCompleted") {
    return `Complete ${condition.value} levels`;
  }
  if (condition.type === "score") {
    return `Reach high score ${condition.value}`;
  }
  return "Progress required";
}
async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    ui.showToast("Service workers unsupported in this browser", "error", 2e3);
    return;
  }
  try {
    swRegistration = await navigator.serviceWorker.register("./service-worker.js", { scope: "./" });
    if (swRegistration.waiting) {
      onServiceWorkerWaiting(swRegistration.waiting);
    }
    swRegistration.addEventListener("updatefound", () => {
      const installing = swRegistration.installing;
      if (!installing) {
        return;
      }
      installing.addEventListener("statechange", () => {
        if (installing.state === "installed" && navigator.serviceWorker.controller) {
          onServiceWorkerWaiting(swRegistration.waiting ?? installing);
        }
      });
    });
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data?.type === "SWUPDATEAVAILABLE") {
        onServiceWorkerWaiting(swRegistration?.waiting ?? null);
      }
    });
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (swReloaded) {
        return;
      }
      swReloaded = true;
      window.location.reload();
    });
  } catch (error) {
    console.error("Service worker registration failed", error);
    ui.showToast("Offline mode unavailable", "error", 1700);
  }
}
function onServiceWorkerWaiting(worker) {
  waitingWorker = worker;
  ui.showUpdateBanner(true);
  sfx.play("updateAvailable");
}
window.addEventListener("beforeunload", () => {
  input.destroy();
  engine.stop();
});
//# sourceMappingURL=bundle.js.map
