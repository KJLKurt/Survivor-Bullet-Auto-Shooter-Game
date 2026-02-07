import {
  COLORS,
  DEFAULT_PROFILE,
  DEFAULT_SETTINGS,
  STORAGE_KEYS,
  SIZES,
  TUNING,
  WEAPONS,
  WEAPONS_BY_ID,
  WORLD
} from "./config.js";
import { createDefaultSfx } from "./audio/sfx.js";
import { CHARACTERS, CHARACTERS_BY_ID } from "./data/characters.js";
import { ITEMS, ITEMS_BY_ID } from "./data/items.js";
import { LEVELS } from "./data/levels.js";
import { Engine } from "./game/engine.js";
import { createEnemy, saveEnemyPrevious, updateEnemy } from "./game/enemy.js";
import { InputController } from "./game/input.js";
import { createLevelRuntime, updateLevel } from "./game/level.js";
import {
  applyUpgradeLevels,
  consumePlayerShot,
  createPlayer,
  savePlayerPreviousPosition,
  setPlayerAim,
  setPlayerWeapon,
  takePlayerDamage,
  updatePlayer
} from "./game/player.js";
import {
  checkPlayerEnemyCollision,
  checkProjectileEnemyCollisions,
  checkProjectilePlayerCollisions,
  createProjectilePool,
  spawnProjectile,
  updateProjectiles
} from "./game/projectile.js";
import { renderGame } from "./game/render.js";
import { Shop } from "./game/shop.js";
import { createUI } from "./game/ui.js";
import { LocalStorageAdapter } from "./storage/localStorageAdapter.js";
import { fromAngle, normalize } from "./utils/vector.js";

const storage = new LocalStorageAdapter("survivor");
const sfx = createDefaultSfx();

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const movePad = document.getElementById("movePad");
const moveKnob = document.getElementById("moveKnob");
const aimPad = document.getElementById("aimPad");
const aimKnob = document.getElementById("aimKnob");

canvas.width = WORLD.WIDTH;
canvas.height = WORLD.HEIGHT;
ctx.imageSmoothingEnabled = false;
ctx.fillStyle = COLORS.HUD_TEXT;

const catalog = buildShopCatalog();
const shop = new Shop({
  storage,
  storageKey: "shop",
  catalog
});

let swRegistration = null;
let waitingWorker = null;
let swReloaded = false;
let shopOpen = false;
let saveQueued = false;
const announcedUnlockables = new Set();

const ui = createUI({
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

const input = new InputController({
  canvas,
  movePad,
  moveKnob,
  aimPad,
  aimKnob
});

const engine = new Engine({
  update: tick,
  render: (alpha) => renderGame(ctx, canvas, state, alpha)
});

let profile = structuredClone(DEFAULT_PROFILE);
let settings = structuredClone(DEFAULT_SETTINGS);
let hintSeen = false;

const state = {
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
    ...(storedProfile ?? {})
  };
  profile.levelsCompleted = Array.isArray(profile.levelsCompleted) ? profile.levelsCompleted : [];
  profile.perLevelBest = { ...(profile.perLevelBest ?? {}) };
  profile.ownedLevels = { ...(profile.ownedLevels ?? {}) };
  profile.unlockedCharacters = unique(["runner", ...(profile.unlockedCharacters ?? [])]);
  profile.unlockedWeapons = unique(["pulse", ...(profile.unlockedWeapons ?? [])]);

  settings = {
    ...structuredClone(DEFAULT_SETTINGS),
    ...(storedSettings ?? {})
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
  const spread = (weapon.spreadDegrees * Math.PI) / 180;
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

  const msg = won
    ? `Run complete! Score ${Math.floor(state.score)}. Tap fire to restart.`
    : `Downed! Score ${Math.floor(state.score)}. Tap fire to retry.`;
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
    ui.showToast("Service workers unsupported in this browser", "error", 2000);
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
