export const GAME_CONFIG = {
  targetFps: 60,
  fixedStepSec: 1 / 60,
  maxStepUpdates: 6,
  arenaPadding: 16,
  runDurationSec: 95,
  coinBasePickupRadius: 22,
  coinLifetimeSec: 18,
  defaultCritChance: 0.05,
  defaultCritMultiplier: 1.55,
  controls: {
    joystickRadius: 52,
    deadzone: 0.17
  },
  palette: {
    text: '#eff7ff',
    player: '#61dafb',
    enemy: '#ff7b7b',
    enemyFast: '#ffb86c',
    enemyTank: '#c77dff',
    enemyBoss: '#ff3e6c',
    projectileFriendly: '#c0ff4b',
    projectileEnemy: '#ffcf6d',
    coin: '#f9d65a'
  },
  sizes: {
    player: 18,
    enemySmall: 16,
    enemyMedium: 24,
    enemyLarge: 36,
    projectile: 6,
    coin: 8
  }
};

export const STORAGE_KEYS = {
  profile: 'survivor_profile_v1',
  sfxEnabled: 'survivor_sfx_enabled'
};
