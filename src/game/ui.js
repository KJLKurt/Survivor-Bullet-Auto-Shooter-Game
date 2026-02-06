export class UI {
  constructor({ storage, onStart, onShop }) {
    this.storage = storage;
    this.onStart = onStart;
    this.onShop = onShop;
    this.playerNameEl = document.getElementById('playerName');
    this.healthFillEl = document.getElementById('healthFill');
    this.scoreEl = document.getElementById('score');
    this.coinsEl = document.getElementById('coins');
    this.bestEl = document.getElementById('best');
    this.menu = document.getElementById('menu');
    this.overlay = document.getElementById('overlay');
    this.toast = document.getElementById('toast');
    this.updateBanner = document.getElementById('updateBanner');

    document.getElementById('startBtn').onclick = () => { this.overlay.style.display = 'none'; this.onStart(); };
    document.getElementById('shopBtn').onclick = () => this.onShop();
  }

  async loadBest(levelId) {
    const highs = await this.storage.get('highScores') || {};
    this.bestEl.textContent = highs[levelId] || 0;
  }

  updateHud(player, score, coins) {
    this.playerNameEl.textContent = player.character.name;
    this.healthFillEl.style.width = `${Math.max(0, (player.health / player.maxHealth) * 100)}%`;
    this.scoreEl.textContent = Math.floor(score);
    this.coinsEl.textContent = coins;
  }

  showToast(msg, ms = 1800) {
    this.toast.textContent = msg;
    this.toast.style.display = 'block';
    setTimeout(() => { this.toast.style.display = 'none'; }, ms);
  }

  showGameOver(summary) {
    this.overlay.style.display = 'flex';
    this.menu.innerHTML = `<h2>Game Over</h2><p>Score: ${summary.score}</p><p>Coins: ${summary.coins}</p><button id='restartBtn'>Restart</button>`;
    document.getElementById('restartBtn').onclick = () => window.location.reload();
  }

  bindServiceWorkerUpdates(registration) {
    if (!registration) return;
    const show = () => {
      this.updateBanner.style.display = 'block';
      this.showToast('Update ready');
    };

    if (registration.waiting) show();
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      worker?.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) show();
      });
    });

    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'SWUPDATEAVAILABLE') show();
    });

    this.updateBanner.onclick = () => {
      registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
    };

    navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload());
  }
}
