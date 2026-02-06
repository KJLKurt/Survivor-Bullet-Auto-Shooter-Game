# Survivor Bullet Hell

Mobile-first, vanilla JavaScript Survivors-style bullet hell game with offline support, local progression, and modular architecture for fast iteration.

## Features

- Vanilla JS + HTML + CSS with ES modules
- Fast bundling via esbuild and unit tests via Vitest
- Fixed timestep game engine (60 FPS target)
- Mobile touch controls (virtual joystick + shoot/special), keyboard/mouse support
- 10 playable characters with unique starter weapons/stats
- 12 upgradeable items (3-5 levels each) with persistent progression
- 3 levels with distinct spawn pacing, bullet patterns, and backgrounds
- Coins, shop system, unlock milestones, high score + per-level best tracking
- Replaceable SFX via modular `SfxManager`
- PWA offline support with service worker update notification banner
- GitHub Pages deploy workflow

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:8000` (or the address shown by esbuild).

Build production bundle:

```bash
npm run build
```

Run tests:

```bash
npm run test
```

## How To Play

- Move: touch joystick or `WASD` / arrow keys
- Shoot: hold on-screen `Shoot` button or hold `Space`
- Special: tap `Special` button or press `Shift` / `X`
- Pause: top-right `II` button

HUD:

- Top-left: player name + health bar
- Top-right: coins (run bank during gameplay), score, best score
- Toasts: unlock notifications + app update notification

## Extending The Game

### Add characters

Update `src/data/characters.js` with:

- `id`, `name`, `description`
- `baseStats`
- `startingWeaponId`
- `unlockCondition`

### Add weapons

Update `src/data/weapons.js` and optionally unlock rules in `src/game/shop.js`.

### Add items/upgrades

Update `src/data/items.js` with level costs and `statDeltas`.

### Add levels and patterns

Update `src/data/levels.js` spawn patterns and level metadata.

### Swap storage adapter

Game logic imports only `src/storage/storageAdapter.js`. Replace `createStorageAdapter()` implementation there with a remote API adapter without changing gameplay modules.

## Service Worker + Update Flow

- Service worker caches app shell for offline play.
- On update availability, the app displays: `Update available Tap to refresh.`
- Tapping sends `SKIP_WAITING` to the waiting worker and reloads when the new worker controls the page.

## Testing

Automated tests:

- `tests/storage.test.js`
- `tests/engine.test.js`
- `tests/player.test.js`
- `tests/collision.test.js`

Manual test plan is in `TEST_PLAN.md`.

## GitHub Pages Deployment

A workflow is included at `.github/workflows/deploy.yml`.

- Push to `main` to trigger build and deploy.
- Enable GitHub Pages in repository settings with **GitHub Actions** as source.

## License

MIT
