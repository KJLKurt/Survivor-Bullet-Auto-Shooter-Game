# Survivor Bullet Auto Shooter Game

Mobile-first Survivors-style bullet-hell built with vanilla JavaScript, HTML, and CSS.

## Features
- Canvas-rendered geometric visuals with configurable constants.
- Fixed timestep simulation (`1/60`) + interpolation for smooth motion.
- Touch dual-stick controls (move left, aim/fire right) and desktop WASD/mouse.
- Modular shop with atomic purchase transactions and persistence.
- Progressive Web App with offline shell caching and in-app service worker update banner.
- GitHub Pages deployment workflow targeting non-root paths (`/<repo>/`).

## Setup
1. Install Node.js 20+.
2. Install dependencies:
   ```bash
   npm ci
   ```

## Development
Run watch build + static server:
```bash
npm run dev
```
Open the printed local URL.

## Build
```bash
npm run build
```
Build output is emitted to `public/dist/bundle.js` and `public/service-worker.js`.

## Test
```bash
npm test
```
Includes deterministic unit tests for engine, storage, player, collisions, and shop transaction behavior.

## How To Play
- Move: `WASD` / arrow keys (desktop) or left touch stick (mobile).
- Aim: mouse move (desktop) or right touch pad drag (mobile).
- Shoot: mouse click / `Space` (desktop) or right touch pad tap (mobile).
- Goal: survive waves, collect coins, buy upgrades/unlocks in shop.

## Extending
- Tune game constants in `src/config.js`.
- Add characters in `src/data/characters.js`.
- Add upgrade items in `src/data/items.js`.
- Add level waves/patterns in `src/data/levels.js`.
- Keep rendering logic in `src/game/render.js` and DOM logic in `src/game/ui.js`.

## Storage Adapter Swap
Persistence is abstracted through `StorageAdapter` (`src/storage/storageAdapter.js`).
Swap `LocalStorageAdapter` with API-backed storage by implementing:
- `get(key)`
- `set(key, value)`
- `remove(key)`
- `clear()`
- `keys()`

## Service Worker Update Flow
- App registers `./service-worker.js`.
- New waiting worker posts `{ type: "SWUPDATEAVAILABLE" }`.
- UI shows: `Update available Tap to refresh`.
- Tapping banner sends `{ type: "SKIP_WAITING" }` to waiting worker.
- App listens to `controllerchange` and reloads once to activate new assets.

## GitHub Pages Deploy
`/.github/workflows/deploy.yml`:
1. Runs on push to `main`.
2. Executes `npm ci` and `npm run build`.
3. Uploads `public/` as Pages artifact.
4. Deploys to GitHub Pages.

Because all asset URLs are relative, hosting under `https://<user>.github.io/<repo>/` works without path rewrites.
