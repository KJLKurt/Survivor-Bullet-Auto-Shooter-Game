# Survivors Bullet Hell (Vanilla JS PWA)

Mobile-first Survivors-style bullet hell game built with vanilla JS, HTML, and CSS.

## Features
- 60 FPS fixed timestep engine with deterministic update/render separation.
- 10 playable characters with unique stats and starting weapons.
- 12 upgradable items with multi-level progression and costs.
- 3 levels with distinct arena sizes, backgrounds, and spawn patterns.
- Currency, shop purchases, unlock progression, high scores, and local persistence.
- Touch controls (virtual joystick, shoot/special buttons) + keyboard support.
- Replaceable audio SFX via WebAudio.
- PWA support with offline shell caching and update notification banner.
- StorageAdapter abstraction with LocalStorageAdapter implementation.
- Vitest test suite for storage, collision, cooldown, and upgrade logic.

## Setup
```bash
npm install
```

## Run (dev)
```bash
npm run dev
```
Open the served URL from esbuild output.

## Build
```bash
npm run build
```

## Test
```bash
npm test
```

## Extend
- Add an `ApiStorageAdapter` implementing `src/storage/storageAdapter.js`.
- Replace geometric draw calls in `src/game/render.js` with sprite rendering.
- Add new weapons in `src/game/player.js` and bind unlocks in `src/main.js`.
