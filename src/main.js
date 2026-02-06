import { LocalStorageAdapter } from './storage/localStorageAdapter.js';
import { CHARACTERS } from './data/characters.js';
import { LEVELS } from './data/levels.js';
import { Player } from './game/player.js';
import { createInput } from './game/input.js';
import { UI } from './game/ui.js';
import { GameEngine } from './game/engine.js';
import { SFX } from './audio/sfx.js';
import { tryBuyItem } from './game/shop.js';
import { getUnlockedLevels } from './game/level.js';

const storage = new LocalStorageAdapter();
const sfx = new SFX();

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const joystick = document.getElementById('joystick');
const shootBtn = document.getElementById('shootBtn');
const specialBtn = document.getElementById('specialBtn');
const input = createInput(canvas, joystick, shootBtn, specialBtn);

const progress = await storage.get('progress') || { playCount: 0, totalCoinsCollected: 0, levelsCompleted: 0, highScore: 0, unlockedCharacters: ['rookie'], unlockedWeapons: ['pistol'] };
const state = await storage.get('state') || { coins: 0, upgrades: {} };

const character = CHARACTERS.find((c) => progress.unlockedCharacters.includes(c.id)) || CHARACTERS[0];
const unlockedLevels = getUnlockedLevels(progress);
const level = unlockedLevels[unlockedLevels.length - 1] || LEVELS[0];
const player = new Player(character);

const ui = new UI({
  storage,
  onStart: start,
  onShop: async () => {
    const result = tryBuyItem(state, 'boots');
    if (result.ok) {
      await storage.set('state', state);
      sfx.shopBuy();
      ui.showToast(`Bought Boots Lv${result.purchasedLevel}`);
    } else ui.showToast(result.reason);
  }
});

await ui.loadBest(level.id);

let engine;
function start() {
  progress.playCount += 1;
  engine = new GameEngine({
    ctx,
    level,
    player,
    input,
    ui,
    sfx,
    onEnd: async ({ score, coins }) => {
      const highs = await storage.get('highScores') || {};
      highs[level.id] = Math.max(highs[level.id] || 0, score);
      progress.highScore = Math.max(progress.highScore, score);
      progress.totalCoinsCollected += coins;
      if (score > 600) progress.levelsCompleted = Math.max(progress.levelsCompleted, 1);
      if (score > 1300) progress.levelsCompleted = Math.max(progress.levelsCompleted, 2);
      if (score > 2000) progress.levelsCompleted = Math.max(progress.levelsCompleted, 3);
      if (progress.totalCoinsCollected >= 250 && !progress.unlockedCharacters.includes('runner')) progress.unlockedCharacters.push('runner');
      if (progress.highScore >= 1200 && !progress.unlockedCharacters.includes('sharpshooter')) progress.unlockedCharacters.push('sharpshooter');
      state.coins += coins;
      await Promise.all([storage.set('highScores', highs), storage.set('progress', progress), storage.set('state', state)]);
      ui.showGameOver({ score, coins });
    }
  });
  engine.start();
}

if ('serviceWorker' in navigator) {
  const registration = await navigator.serviceWorker.register('/service-worker.js');
  ui.bindServiceWorkerUpdates(registration);
}
