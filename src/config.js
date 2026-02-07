export const STEP_SECONDS = 1 / 60;
export const MAX_FRAME_SECONDS = 0.05;

export const STORAGE_KEYS = {
  PROFILE: "survivor.profile.v1",
  SETTINGS: "survivor.settings.v1",
  HINT_SEEN: "survivor.hintSeen.v1"
};

export const WORLD = {
  WIDTH: 960,
  HEIGHT: 540,
  PLAYER_SPAWN_X: 480,
  PLAYER_SPAWN_Y: 300
};

export const COLORS = {
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

export const LIMITS = {
  MAX_ENEMIES: 64,
  MAX_PROJECTILES: 420,
  MAX_COINS: 180
};

export const SIZES = {
  PLAYER: 16,
  ENEMY_SMALL: 18,
  ENEMY_MEDIUM: 24,
  ENEMY_LARGE: 30,
  PROJECTILE: 6,
  ENEMY_PROJECTILE: 7,
  COIN: 5
};

export const TUNING = {
  PLAYER_INVULN_MS_ON_HIT: 220,
  COIN_LIFETIME_SECONDS: 10,
  COIN_PICKUP_BASE_RADIUS: 36,
  COIN_MAGNET_PER_LEVEL: 11,
  ENEMY_FLASH_SECONDS: 0.08,
  SHOOT_FALLBACK_Y: -1
};

export const WEAPONS = [
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

export const WEAPONS_BY_ID = Object.fromEntries(WEAPONS.map((weapon) => [weapon.id, weapon]));

export const DEFAULT_PROFILE = {
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

export const DEFAULT_SETTINGS = {
  sfxEnabled: true
};
