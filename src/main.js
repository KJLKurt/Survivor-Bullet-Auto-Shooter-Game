import { GAME_CONFIG, STORAGE_KEYS } from './config.js';
import SfxManager from './audio/sfx.js';
import { CHARACTERS, getCharacterById } from './data/characters.js';
import { ITEMS } from './data/items.js';
import { LEVELS } from './data/levels.js';
import { WEAPONS, getWeaponById } from './data/weapons.js';
import GameEngine from './game/engine.js';
import InputController from './game/input.js';
import LevelController from './game/level.js';
import Player from './game/player.js';
import Projectile, { createEnemyPatternProjectiles } from './game/projectile.js';
import GameRenderer from './game/render.js';
import {
  applyRunResults,
  getAggregatedUpgradeDeltas,
  getCharacterCatalog,
  getLevelCatalog,
  getWeaponCatalog,
  loadProfile,
  purchaseCharacter,
  purchaseItemUpgrade,
  purchaseWeapon,
  saveProfile,
  unlockNewContent
} from './game/shop.js';
import UI from './game/ui.js';
import { createStorageAdapter } from './storage/storageAdapter.js';
import { playerHitsEnemy, projectileHitsEntity } from './utils/collision.js';
import { fromAngle } from './utils/vector.js';

const storage = createStorageAdapter();

const canvas = document.getElementById('game-canvas');
const renderer = new GameRenderer(canvas);
const input = new InputController({
  canvas,
  joystickZone: document.getElementById('joystick-zone'),
  joystickKnob: document.getElementById('joystick-knob'),
  shootButton: document.getElementById('shoot-button'),
  specialButton: document.getElementById('special-button')
});
input.attach();

const runtime = {
  profile: null,
  ui: null,
  sfx: null,
  run: {
    active: false,
    paused: false,
    elapsedSec: 0,
    coinsCollected: 0,
    score: 0,
    levelController: null,
    player: null,
    upgrades: {},
    enemies: [],
    projectiles: [],
    enemyProjectiles: [],
    coins: [],
    backgroundColor: '#0f2238'
  }
};

function distanceSquared(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

function getBestForSelectedLevel() {
  return runtime.profile.levelBest[runtime.profile.selectedLevelId] || 0;
}

function refreshMenus() {
  const characterCatalog = getCharacterCatalog(runtime.profile);
  const levelCatalog = getLevelCatalog(runtime.profile);
  const weaponCatalog = getWeaponCatalog(runtime.profile);

  runtime.ui.renderMenu(runtime.profile, characterCatalog, weaponCatalog, levelCatalog);
  runtime.ui.renderShop(runtime.profile, characterCatalog, weaponCatalog, ITEMS);
}

function syncHud() {
  const player = runtime.run.player;
  runtime.ui.updateHud({
    playerName: player?.character.name || getCharacterById(runtime.profile.selectedCharacterId).name,
    health: player?.health || 0,
    maxHealth: player?.maxHealth || 1,
    coins: runtime.run.active ? runtime.run.coinsCollected : runtime.profile.coinsBank,
    score: runtime.run.active ? runtime.run.score : runtime.profile.highScore,
    best: getBestForSelectedLevel()
  });
}

function resizeCanvas() {
  const frame = document.getElementById('game-frame');
  renderer.resize(frame.clientWidth, frame.clientHeight);
}

function createCoinDrops(enemy) {
  const drops = [];
  const count = Math.min(5, Math.max(1, Math.round(enemy.scoreValue / 80)));
  for (let index = 0; index < count; index += 1) {
    const angle = (index / count) * Math.PI * 2;
    drops.push({
      x: enemy.x + Math.cos(angle) * 9,
      y: enemy.y + Math.sin(angle) * 9,
      size: GAME_CONFIG.sizes.coin,
      value: 1,
      lifeSec: GAME_CONFIG.coinLifetimeSec
    });
  }
  return drops;
}

function getAimVector() {
  if (runtime.run.enemies.length > 0) {
    const nearest = runtime.run.enemies.reduce((best, enemy) => {
      if (!best) {
        return enemy;
      }
      return distanceSquared(enemy, runtime.run.player) < distanceSquared(best, runtime.run.player) ? enemy : best;
    }, null);
    return { x: nearest.x - runtime.run.player.x, y: nearest.y - runtime.run.player.y };
  }
  return { x: 0, y: -1 };
}

function spawnEngineerBurst(player) {
  const burst = [];
  for (let index = 0; index < 10; index += 1) {
    const direction = fromAngle((index / 10) * Math.PI * 2);
    burst.push(
      new Projectile({
        x: player.x,
        y: player.y,
        vx: direction.x * 300,
        vy: direction.y * 300,
        damage: 9,
        friendly: true,
        lifeSec: 1.1
      })
    );
  }
  return burst;
}

function startRun() {
  const character = getCharacterById(runtime.profile.selectedCharacterId);
  const selectedWeapon = getWeaponById(runtime.profile.selectedWeaponId || character.startingWeaponId);
  const weapon = runtime.profile.unlockedWeapons.includes(selectedWeapon.id)
    ? selectedWeapon
    : getWeaponById(character.startingWeaponId);

  const upgrades = getAggregatedUpgradeDeltas(runtime.profile);

  runtime.run.active = true;
  runtime.run.paused = false;
  runtime.run.elapsedSec = 0;
  runtime.run.coinsCollected = 0;
  runtime.run.score = 0;
  runtime.run.levelController = new LevelController(runtime.profile.selectedLevelId);
  runtime.run.backgroundColor = runtime.run.levelController.level.backgroundColor;
  runtime.run.upgrades = upgrades;
  runtime.run.enemies = [];
  runtime.run.projectiles = [];
  runtime.run.enemyProjectiles = [];
  runtime.run.coins = [];
  runtime.run.player = new Player({
    character,
    weapon,
    upgrades,
    startX: canvas.clientWidth * 0.5,
    startY: canvas.clientHeight * 0.7
  });

  runtime.ui.setOverlay(null);
  syncHud();
}

async function persistProfile() {
  await saveProfile(storage, runtime.profile);
}

async function finishRun(completed) {
  const result = {
    score: runtime.run.score,
    coinsCollected: runtime.run.coinsCollected,
    levelId: runtime.profile.selectedLevelId,
    completed
  };

  runtime.run.active = false;
  runtime.run.paused = false;

  runtime.profile = applyRunResults(runtime.profile, result);
  const unlockResult = unlockNewContent(runtime.profile);
  runtime.profile = unlockResult.profile;
  await persistProfile();

  if (completed) {
    runtime.sfx.play('levelUp');
  }

  unlockResult.unlockMessages.forEach((message) => runtime.ui.showToast(message, 3200));
  refreshMenus();
  syncHud();
  runtime.ui.showGameOver({
    score: result.score,
    coins: result.coinsCollected,
    levelBest: runtime.profile.levelBest[result.levelId] || result.score,
    completed
  });
}

function update(dt) {
  if (!runtime.run.active || runtime.run.paused) {
    return;
  }

  const nowMs = performance.now();
  runtime.run.elapsedSec += dt;

  const moveVector = input.getMovement();
  const bounds = runtime.run.levelController.getArenaBounds(canvas.clientWidth, canvas.clientHeight);
  runtime.run.player.move(moveVector, dt, bounds);
  runtime.run.player.update(dt);

  if (input.consumeSpecial()) {
    const special = runtime.run.player.tryUseSpecial();
    if (special === 'turretBurst') {
      runtime.run.projectiles.push(...spawnEngineerBurst(runtime.run.player));
      runtime.sfx.play('shoot');
    }
  }

  if (input.isShooting()) {
    const look = input.getLookDirection(getAimVector());
    const fired = runtime.run.player.shoot(look, nowMs);
    if (fired.length) {
      runtime.run.projectiles.push(...fired);
      runtime.sfx.play('shoot');
    }
  }

  const newlySpawned = runtime.run.levelController.update(dt);
  runtime.run.enemies.push(...newlySpawned);

  runtime.run.enemies.forEach((enemy) => {
    enemy.update(dt, runtime.run.player, runtime.run.elapsedSec);
    if (enemy.shouldFire(nowMs)) {
      enemy.onFire(nowMs);
      runtime.run.enemyProjectiles.push(
        ...createEnemyPatternProjectiles(enemy.bulletPattern, enemy, runtime.run.player, runtime.run.elapsedSec)
      );
    }
  });

  runtime.run.projectiles.forEach((projectile) => projectile.update(dt));
  runtime.run.enemyProjectiles.forEach((projectile) => projectile.update(dt));

  runtime.run.projectiles.forEach((projectile) => {
    if (projectile.dead) {
      return;
    }

    for (let index = 0; index < runtime.run.enemies.length; index += 1) {
      const enemy = runtime.run.enemies[index];
      if (enemy.dead || !projectileHitsEntity(projectile, enemy)) {
        continue;
      }

      const wasKilled = enemy.takeDamage(projectile.damage);

      if (projectile.explosiveRadius > 0) {
        runtime.run.enemies.forEach((otherEnemy) => {
          const explodeDistSq = distanceSquared(otherEnemy, enemy);
          if (!otherEnemy.dead && explodeDistSq <= projectile.explosiveRadius * projectile.explosiveRadius) {
            const splash = projectile.damage * 0.55;
            if (otherEnemy.takeDamage(splash)) {
              runtime.run.score += otherEnemy.scoreValue;
              runtime.run.coins.push(...createCoinDrops(otherEnemy));
              runtime.sfx.play('enemyDeath');
            }
          }
        });
      }

      if (wasKilled) {
        runtime.run.score += enemy.scoreValue;
        runtime.run.coins.push(...createCoinDrops(enemy));
        runtime.sfx.play('enemyDeath');
      }

      if (!projectile.piercing) {
        projectile.dead = true;
      }

      if (!projectile.piercing) {
        break;
      }
    }
  });

  runtime.run.enemyProjectiles.forEach((projectile) => {
    if (!projectile.dead && projectileHitsEntity(projectile, runtime.run.player)) {
      const hitLanded = runtime.run.player.applyDamage(projectile.damage);
      projectile.dead = true;
      if (hitLanded) {
        runtime.sfx.play('hit');
      }
    }
  });

  runtime.run.enemies.forEach((enemy) => {
    if (!enemy.dead && playerHitsEnemy(runtime.run.player, enemy)) {
      const hitLanded = runtime.run.player.applyDamage(10);
      if (hitLanded) {
        runtime.sfx.play('hit');
      }
    }
  });

  const pickupRadius = GAME_CONFIG.coinBasePickupRadius + (runtime.run.upgrades.coinMagnetFlat || 0);
  runtime.run.coins.forEach((coin) => {
    coin.lifeSec -= dt;
    if (coin.lifeSec <= 0) {
      coin.dead = true;
      return;
    }

    if (distanceSquared(coin, runtime.run.player) <= pickupRadius * pickupRadius) {
      coin.dead = true;
      runtime.run.coinsCollected += coin.value;
      runtime.sfx.play('coin');
    }
  });

  runtime.run.projectiles = runtime.run.projectiles.filter((projectile) => !projectile.dead && !projectile.isOutOfBounds(canvas.clientWidth, canvas.clientHeight));
  runtime.run.enemyProjectiles = runtime.run.enemyProjectiles.filter((projectile) => !projectile.dead && !projectile.isOutOfBounds(canvas.clientWidth, canvas.clientHeight));
  runtime.run.enemies = runtime.run.enemies.filter((enemy) => !enemy.dead);
  runtime.run.coins = runtime.run.coins.filter((coin) => !coin.dead);

  syncHud();

  if (runtime.run.player.isDead()) {
    finishRun(false);
    return;
  }

  if (runtime.run.levelController.isComplete()) {
    finishRun(true);
  }
}

function render() {
  if (!runtime.run.player) {
    renderer.clear('#0f2238');
    return;
  }

  renderer.render({
    player: runtime.run.player,
    enemies: runtime.run.enemies,
    projectiles: runtime.run.projectiles,
    enemyProjectiles: runtime.run.enemyProjectiles,
    coins: runtime.run.coins,
    backgroundColor: runtime.run.backgroundColor,
    timeLeftSec: GAME_CONFIG.runDurationSec - runtime.run.elapsedSec
  });
}

function wireUiActions() {
  runtime.ui.on({
    startRun: () => startRun(),
    openShop: () => {
      refreshMenus();
      runtime.ui.setOverlay('shop');
    },
    closeShop: () => {
      runtime.ui.setOverlay('menu');
    },
    pause: () => {
      if (!runtime.run.active) {
        return;
      }
      runtime.run.paused = true;
      runtime.ui.setOverlay('pause');
    },
    resume: () => {
      runtime.run.paused = false;
      runtime.ui.setOverlay(null);
    },
    quitRun: () => {
      runtime.run.active = false;
      runtime.run.paused = false;
      runtime.ui.setOverlay('menu');
      syncHud();
    },
    mainMenu: () => {
      runtime.ui.setOverlay('menu');
      syncHud();
    },
    characterChanged: (characterId) => {
      if (runtime.profile.unlockedCharacters.includes(characterId)) {
        runtime.profile.selectedCharacterId = characterId;
        const character = getCharacterById(characterId);
        if (runtime.profile.unlockedWeapons.includes(character.startingWeaponId)) {
          runtime.profile.selectedWeaponId = character.startingWeaponId;
        }
        persistProfile();
        refreshMenus();
      }
    },
    weaponChanged: (weaponId) => {
      if (runtime.profile.unlockedWeapons.includes(weaponId)) {
        runtime.profile.selectedWeaponId = weaponId;
        persistProfile();
      }
    },
    levelChanged: (levelId) => {
      if (runtime.profile.unlockedLevels.includes(levelId)) {
        runtime.profile.selectedLevelId = levelId;
        persistProfile();
        syncHud();
      }
    },
    buyCharacter: (characterId) => {
      const result = purchaseCharacter(runtime.profile, characterId);
      runtime.profile = result.profile;
      if (result.ok) {
        runtime.sfx.play('shopBuy');
        persistProfile();
      } else {
        runtime.ui.showToast(result.reason || 'Unable to buy character');
      }
      refreshMenus();
    },
    buyWeapon: (weaponId) => {
      const result = purchaseWeapon(runtime.profile, weaponId);
      runtime.profile = result.profile;
      if (result.ok) {
        runtime.sfx.play('shopBuy');
        persistProfile();
      } else {
        runtime.ui.showToast(result.reason || 'Unable to buy weapon');
      }
      refreshMenus();
    },
    buyItem: (itemId) => {
      const result = purchaseItemUpgrade(runtime.profile, itemId);
      runtime.profile = result.profile;
      if (result.ok) {
        runtime.sfx.play('shopBuy');
        persistProfile();
      } else {
        runtime.ui.showToast(result.reason || 'Unable to buy upgrade');
      }
      refreshMenus();
    },
    toggleSfx: async () => {
      const next = !runtime.sfx.enabled;
      runtime.sfx.setEnabled(next);
      await storage.set(STORAGE_KEYS.sfxEnabled, next);
      runtime.ui.showToast(`SFX ${next ? 'on' : 'off'}`);
    }
  });
}

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    runtime.ui.showToast('Service worker not supported in this browser.', 2000);
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('./service-worker.js');
    runtime.ui.setServiceWorkerRegistration(registration);

    if (registration.waiting) {
      runtime.ui.showUpdateToast();
    }

    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      if (!worker) {
        return;
      }
      worker.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) {
          runtime.ui.showUpdateToast();
        }
      });
    });
  } catch (error) {
    // If registration fails, the app still works online.
    console.warn('Service worker registration failed', error);
  }
}

async function bootstrap() {
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const sfxEnabled = (await storage.get(STORAGE_KEYS.sfxEnabled)) ?? true;
  runtime.sfx = new SfxManager(Boolean(sfxEnabled));

  runtime.profile = await loadProfile(storage);

  runtime.ui = new UI({
    characters: CHARACTERS,
    levels: LEVELS,
    weapons: WEAPONS,
    sfx: runtime.sfx
  });

  wireUiActions();
  refreshMenus();
  syncHud();
  runtime.ui.setOverlay('menu');

  await registerServiceWorker();

  const engine = new GameEngine({ update, render });
  engine.start();
}

bootstrap();
