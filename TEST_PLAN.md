# Manual Test Plan

## Environment
- Browser: latest Chrome/Safari/Firefox on desktop.
- Mobile: iOS Safari or Android Chrome.
- Build once with `npm run build`.

## Core Smoke
1. Open app and verify canvas/game loop runs.
2. Confirm HUD updates health, score, coins.
3. Confirm aim indicator line is always visible from player.

## Controls
1. Desktop:
   - Use `WASD` and arrow keys to move.
   - Move mouse to aim and click to shoot.
   - Press `Space` to shoot.
2. Mobile:
   - Left bottom pad drag moves player.
   - Right bottom pad drag sets aim direction.
   - Tap right pad fires in last aim direction.
   - If no aim set yet, tap fires by movement direction; if idle, upward.

## First Launch Hint Persistence
1. Clear storage (`localStorage.clear()`), reload.
2. Verify hint overlay appears: `Left stick moves • Right pad aims • Tap fires`.
3. Dismiss overlay and reload.
4. Verify overlay remains hidden.

## Shop + Persistence
1. Collect coins and open shop.
2. Attempt purchase with insufficient coins: verify disabled button and failure toast when forced.
3. Buy affordable item: verify atomic coin deduction and level increment.
4. Reload page: verify coins, upgrades, unlocks, SFX setting persist.
5. Verify character/weapon unlock entries are gated by unlock conditions.

## Gameplay + Feel
1. Confirm enemies spawn with level-specific pattern variety.
2. Verify projectiles are pooled (no stutter after sustained fire).
3. Verify enemy hit flash appears briefly on impact.
4. Verify coin drops and magnet upgrade increases pickup radius.
5. Verify high score/per-level best update after run.

## PWA Offline
1. Visit app online and wait for service worker install.
2. Open DevTools Application > Service Workers: confirm active worker.
3. Disable network and reload.
4. Verify app shell still loads and game runs.

## SW Update Flow
1. Serve old build, open app in one tab.
2. Deploy modified build (e.g., version text change in UI) and reload another tab.
3. Verify waiting SW posts `SWUPDATEAVAILABLE` and app shows banner: `Update available Tap to refresh`.
4. Tap banner.
5. Verify app sends `SKIP_WAITING`, `controllerchange` fires, and page reloads once with new assets.

## GitHub Pages Non-Root Path
1. Publish repository to `https://<user>.github.io/<repo>/`.
2. Verify all assets load via relative paths (no leading `/`).
3. Verify service worker caches URLs within `<repo>` scope.
4. Verify refresh/offline/update flow still works at non-root path.
