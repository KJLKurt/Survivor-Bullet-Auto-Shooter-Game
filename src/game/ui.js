function el(id) {
  const node = document.getElementById(id);
  if (!node) {
    throw new Error(`Missing DOM element: ${id}`);
  }
  return node;
}

export function createUI({ onToggleShop, onCloseShop, onBuy, onToggleSfx, onApplyUpdate, onDismissHint }) {
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

  function renderHud({ health, maxHealth, score, runCoins, bankCoins }) {
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
    renderHud,
    setShopOpen,
    showHint,
    showToast,
    renderShopEntries,
    setSfxEnabled,
    showUpdateBanner
  };
}
