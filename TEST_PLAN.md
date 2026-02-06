# TEST_PLAN

## Automated Tests

Run:

```bash
npm run test
```

Coverage:

- `tests/storage.test.js`: LocalStorageAdapter `get/set/remove/clear/keys`
- `tests/engine.test.js`: fixed timestep conversion and accumulator cap behavior
- `tests/player.test.js`: damage mitigation, healing, cooldown gate, shield upgrade behavior
- `tests/collision.test.js`: projectile-enemy and player-enemy collision helpers

## Manual Test Checklist

1. Install and run dev server.

- Run `npm install` then `npm run dev`
- Open app and verify main menu, canvas, HUD, controls render correctly

2. Offline/PWA behavior.

- Load app once while online
- Open devtools Application tab and confirm service worker is active
- Set browser to offline and refresh
- Verify app shell still loads and game can be played

3. Service worker update flow.

- With app running, change service-worker version string and rebuild
- Refresh one tab to install updated worker
- Verify existing tab receives banner: `Update available Tap to refresh.`
- Tap banner and confirm page reloads under new worker

4. Gameplay loop.

- Start run and verify movement, shooting, enemy spawning, enemy bullets, and collisions
- Verify player takes damage, can die, and run ends
- Verify level completes after survival timer

5. Coins/shop/progression persistence.

- Collect coins during run
- Finish run and verify coins are added to bank
- Buy a character/weapon/item in shop
- Reload page and verify purchases persist

6. Unlock progression.

- Play enough runs and/or achieve scores to trigger unlock thresholds
- Verify unlock toasts and new content available in menu/shop

7. Mobile touch controls.

- Test joystick responsiveness and shoot/special buttons on phone or emulation
- Verify controls are usable in portrait mode

8. Audio behavior.

- Trigger shoot/hit/death/coin/shop sounds
- Toggle SFX from menu and verify sounds stop/start accordingly

9. Performance smoke test.

- Reach moderate enemy/bullet density
- Verify frame pacing remains stable and inputs remain responsive
