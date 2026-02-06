import { ITEMS } from '../data/items.js';

export default class UI {
  constructor({ characters, levels, weapons, sfx }) {
    this.characters = characters;
    this.levels = levels;
    this.weapons = weapons;
    this.sfx = sfx;

    this.handlers = {};
    this.updateToast = null;
    this.registration = null;

    this.elements = {
      healthFill: document.getElementById('health-fill'),
      playerName: document.getElementById('player-name'),
      coins: document.getElementById('coins-display'),
      score: document.getElementById('score-display'),
      best: document.getElementById('best-display'),
      characterSelect: document.getElementById('character-select'),
      weaponSelect: document.getElementById('weapon-select'),
      levelSelect: document.getElementById('level-select'),
      overlayMenu: document.getElementById('overlay-menu'),
      overlayPause: document.getElementById('overlay-pause'),
      overlayShop: document.getElementById('overlay-shop'),
      overlayGameOver: document.getElementById('overlay-gameover'),
      gameOverSummary: document.getElementById('gameover-summary'),
      toastArea: document.getElementById('toast-area'),
      shopCoins: document.getElementById('shop-coins'),
      shopCharacters: document.getElementById('shop-characters'),
      shopWeapons: document.getElementById('shop-weapons'),
      shopItems: document.getElementById('shop-items')
    };

    this.bindStaticButtons();
    this.setupServiceWorkerListener();
  }

  bindStaticButtons() {
    document.getElementById('start-button').addEventListener('click', () => {
      this.handlers.startRun?.();
    });
    document.getElementById('shop-button').addEventListener('click', () => {
      this.handlers.openShop?.();
    });
    document.getElementById('sfx-toggle').addEventListener('click', () => {
      this.handlers.toggleSfx?.();
    });
    document.getElementById('shop-close').addEventListener('click', () => {
      this.handlers.closeShop?.();
    });
    document.getElementById('pause-button').addEventListener('click', () => {
      this.handlers.pause?.();
    });
    document.getElementById('resume-button').addEventListener('click', () => {
      this.handlers.resume?.();
    });
    document.getElementById('quit-button').addEventListener('click', () => {
      this.handlers.quitRun?.();
    });
    document.getElementById('gameover-menu').addEventListener('click', () => {
      this.handlers.mainMenu?.();
    });

    this.elements.characterSelect.addEventListener('change', (event) => {
      this.handlers.characterChanged?.(event.target.value);
    });
    this.elements.weaponSelect.addEventListener('change', (event) => {
      this.handlers.weaponChanged?.(event.target.value);
    });
    this.elements.levelSelect.addEventListener('change', (event) => {
      this.handlers.levelChanged?.(event.target.value);
    });
  }

  setupServiceWorkerListener() {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'SWUPDATEAVAILABLE') {
        this.sfx.play('updateAvailable');
        this.showUpdateToast();
      }
    });

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }

  on(handlers) {
    this.handlers = handlers;
  }

  setServiceWorkerRegistration(registration) {
    this.registration = registration;
  }

  showUpdateToast() {
    if (this.updateToast) {
      return;
    }

    const button = document.createElement('button');
    button.className = 'toast update';
    button.textContent = 'Update available Tap to refresh.';
    button.addEventListener('click', () => {
      const waiting = this.registration?.waiting;
      if (waiting) {
        waiting.postMessage({ type: 'SKIP_WAITING' });
      } else {
        window.location.reload();
      }
    });

    this.updateToast = button;
    this.elements.toastArea.append(button);
  }

  showToast(text, durationMs = 2500) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = text;
    this.elements.toastArea.append(toast);
    setTimeout(() => {
      toast.remove();
    }, durationMs);
  }

  updateHud({ playerName, health, maxHealth, coins, score, best }) {
    this.elements.playerName.textContent = playerName;
    this.elements.healthFill.style.width = `${Math.max(0, (health / maxHealth) * 100)}%`;
    this.elements.coins.textContent = `Coins: ${coins}`;
    this.elements.score.textContent = `Score: ${score}`;
    this.elements.best.textContent = `Best: ${best}`;
  }

  renderMenu(profile, characterCatalog, weaponCatalog, levelCatalog) {
    this.elements.characterSelect.innerHTML = '';
    characterCatalog.forEach((character) => {
      const option = document.createElement('option');
      option.value = character.id;
      option.disabled = !character.unlocked;
      option.textContent = character.unlocked ? character.name : `${character.name} (locked)`;
      if (character.id === profile.selectedCharacterId) {
        option.selected = true;
      }
      this.elements.characterSelect.append(option);
    });

    this.elements.weaponSelect.innerHTML = '';
    weaponCatalog.forEach((weapon) => {
      const option = document.createElement('option');
      option.value = weapon.id;
      option.disabled = !weapon.unlocked;
      option.textContent = weapon.unlocked ? weapon.name : `${weapon.name} (locked)`;
      if (weapon.id === profile.selectedWeaponId) {
        option.selected = true;
      }
      this.elements.weaponSelect.append(option);
    });

    this.elements.levelSelect.innerHTML = '';
    levelCatalog.forEach((level) => {
      const option = document.createElement('option');
      option.value = level.id;
      option.disabled = !level.unlocked;
      option.textContent = level.unlocked ? level.name : `${level.name} (locked)`;
      if (level.id === profile.selectedLevelId) {
        option.selected = true;
      }
      this.elements.levelSelect.append(option);
    });
  }

  renderShop(profile, characterCatalog, weaponCatalog, items = ITEMS) {
    this.elements.shopCoins.textContent = `Bank: ${profile.coinsBank}`;

    this.elements.shopCharacters.innerHTML = '';
    characterCatalog.forEach((character) => {
      const wrapper = document.createElement('article');
      wrapper.className = 'shop-card';
      const cost = character.unlockCondition?.type === 'coins' ? character.unlockCondition.value : 0;
      const owned = profile.unlockedCharacters.includes(character.id);
      wrapper.innerHTML = `
        <strong>${character.name}</strong>
        <div class="shop-meta">${character.description}</div>
        <div class="shop-meta">${owned ? 'Owned' : cost > 0 ? `Cost: ${cost}` : 'Unlock by milestone'}</div>
      `;
      const button = document.createElement('button');
      button.textContent = owned ? 'Select' : 'Unlock';
      button.disabled = !owned && !character.canUnlock && cost <= 0;
      button.addEventListener('click', () => this.handlers.buyCharacter?.(character.id));
      wrapper.append(button);
      this.elements.shopCharacters.append(wrapper);
    });

    this.elements.shopWeapons.innerHTML = '';
    weaponCatalog.forEach((weapon) => {
      const wrapper = document.createElement('article');
      wrapper.className = 'shop-card';
      const owned = profile.unlockedWeapons.includes(weapon.id);
      wrapper.innerHTML = `
        <strong>${weapon.name}</strong>
        <div class="shop-meta">Damage ${weapon.damage.toFixed(1)} / Cooldown ${weapon.cooldownMs}ms</div>
        <div class="shop-meta">${owned ? 'Owned' : `Cost: ${weapon.cost}`}</div>
      `;
      const button = document.createElement('button');
      button.textContent = owned ? 'Equip' : 'Buy';
      button.disabled = !owned && profile.coinsBank < weapon.cost;
      button.addEventListener('click', () => this.handlers.buyWeapon?.(weapon.id));
      wrapper.append(button);
      this.elements.shopWeapons.append(wrapper);
    });

    this.elements.shopItems.innerHTML = '';
    items.forEach((item) => {
      const level = profile.itemLevels[item.id] || 0;
      const isMax = level >= item.levels.length;
      const nextLevel = item.levels[level];
      const wrapper = document.createElement('article');
      wrapper.className = 'shop-card';
      wrapper.innerHTML = `
        <strong>${item.name}</strong>
        <div class="shop-meta">${item.description}</div>
        <div class="shop-meta">Level ${level}/${item.levels.length}</div>
      `;
      const button = document.createElement('button');
      button.textContent = isMax ? 'Maxed' : `Upgrade (${nextLevel.cost})`;
      button.disabled = isMax || profile.coinsBank < nextLevel.cost;
      button.addEventListener('click', () => this.handlers.buyItem?.(item.id));
      wrapper.append(button);
      this.elements.shopItems.append(wrapper);
    });
  }

  setOverlay(name) {
    const overlays = [
      this.elements.overlayMenu,
      this.elements.overlayPause,
      this.elements.overlayShop,
      this.elements.overlayGameOver
    ];

    overlays.forEach((overlay) => overlay.classList.remove('visible'));
    if (!name) {
      return;
    }

    if (name === 'menu') {
      this.elements.overlayMenu.classList.add('visible');
    }
    if (name === 'pause') {
      this.elements.overlayPause.classList.add('visible');
    }
    if (name === 'shop') {
      this.elements.overlayShop.classList.add('visible');
    }
    if (name === 'gameover') {
      this.elements.overlayGameOver.classList.add('visible');
    }
  }

  showGameOver(summary) {
    this.elements.gameOverSummary.innerHTML = `
      <div>Score: ${summary.score}</div>
      <div>Coins earned: ${summary.coins}</div>
      <div>Best on level: ${summary.levelBest}</div>
      <div>${summary.completed ? 'Level survived!' : 'You were overwhelmed.'}</div>
    `;
    this.setOverlay('gameover');
  }
}
