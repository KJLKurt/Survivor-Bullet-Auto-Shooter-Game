You are a meticulous senior engineer shipping a complete repo. Do NOT skip requirements.

PRIMARY GOAL
Create a complete personal web app project that implements a mobile-first Survivors bullet-hell game.
Deliver a ready-to-build repository scaffold and ALL source code in vanilla JavaScript, HTML, and CSS.
Use minimal fast tooling: esbuild for bundling and Vitest for tests. Keep dependencies minimal.
The app must work offline as a Progressive Web App and when online must detect updates and show an in-app update banner that lets the user refresh to apply the update.
Use simple solid-color geometric shapes on <canvas>. All colors/sizes must be configurable constants so sprites can be swapped later.
Keep local storage behind an abstract StorageAdapter interface so it can be swapped for an API later.
Finally: automatically build and publish to GitHub Pages (workflow included) and ensure the app works under a non-root base path (https://user.github.io/repo/).

CRITICAL OUTPUT RULES (must follow)
1) Output MUST be file-by-file with headings exactly: "FILE: path/to/file"
2) Include EVERY required file exactly once. No omissions.
3) If response is too large, split into groups and label: "CONTINUATION: Group N of M"
4) After each group, print:
   - Emitted files list
   - Remaining files list
5) Do not use placeholders like TODO. Provide complete code.

PHASE 0: PLAN + IMPLEMENTATION MAP (must appear before code)
A) PLAN (max 25 lines): list major subsystems + tricky requirements.
B) IMPLEMENTATION MAP: map each key requirement to exact file(s).
C) Then output files in the exact GROUP ORDER below.

GROUP ORDER (must follow)
Group 1: package.json, README.md, TEST_PLAN.md, .gitignore, .github/workflows/deploy.yml
Group 2: public/index.html, public/manifest.json, public/styles.css, public/icons/* (SVG placeholders), public/favicon.ico (can be SVG or tiny placeholder)
Group 3: service-worker.js (root), and src/main.js SW registration + update message wiring
Group 4: src/config.js, src/utils/vector.js, src/game/engine.js, src/game/render.js, src/game/input.js
Group 5: src/game/player.js, src/game/enemy.js, src/game/projectile.js, src/game/level.js
Group 6: src/game/shop.js, src/game/ui.js, src/storage/storageAdapter.js, src/storage/localStorageAdapter.js, src/audio/sfx.js
Group 7: src/data/characters.js, src/data/items.js, src/data/levels.js
Group 8: tests/* (engine, storage, player, collision, shop transaction), plus any remaining glue files

HIGH-LEVEL CONSTRAINTS
- Vanilla JS (ES2022+), HTML, CSS. No heavy frameworks.
- Use esbuild bundling into public/dist/bundle.js.
- Use Vitest + jsdom where needed.
- Modular ES modules. Keep DOM interactions in ui.js. Keep render.js drawing only from state.
- Keep deterministic logic in engine.js with fixed timestep. Use performance.now().

PWA + UPDATE FLOW (must be correct)
- Cache app shell on install: index.html, dist/bundle.js, styles.css, manifest.json, icons.
- Activate: claim clients.
- Fetch strategy:
  - Cache-first for app shell
  - Network-first for optional dynamic/remote (if any)
- Update detection contract (must):
  - When a new SW is installed and waiting, SW notifies all clients with postMessage {type:"SWUPDATEAVAILABLE"}.
  - UI shows banner: "Update available Tap to refresh" (non-blocking).
  - Tap sends {type:"SKIP_WAITING"} to SW.
  - App listens for navigator.serviceWorker.controllerchange and reloads once to apply update.
- Provide fallback if SW unsupported.

GITHUB PAGES (must work)
- Add .github/workflows/deploy.yml to build and deploy on push to main.
- Publish the /public directory as the Pages artifact after running npm ci && npm run build.
- IMPORTANT: The app must work when hosted at /<repo>/ (non-root base path).
  - Avoid absolute URLs. Use relative paths.
  - Service worker scope/cached URLs must match Pages pathing.
  - manifest icons paths must be relative.

STORAGE ABSTRACTION (must)
Create storage/storageAdapter.js with interface:
- async get(key) -> parsed JSON or null
- async set(key, value) -> stores JSON-serializable value
- async remove(key)
- async clear()
- async keys() -> array of keys
Implement localStorageAdapter.js using localStorage but async API. ALL persistence uses adapter only.

MOBILE-FIRST INPUT + AIM POLISH (must to avoid confusion)
- Touch controls:
  - Bottom-left virtual joystick = movement vector.
  - Bottom-right shoot area:
    - Drag sets AIM direction vector.
    - Tap fires in last aim direction.
    - If no aim yet, fire in movement direction; if no movement, fire upward by default.
- Desktop:
  - WASD/arrow keys move.
  - Mouse aim (move mouse sets aim vector relative to player).
  - Click or Space shoots.
- Render a visible aim indicator line/arrow from player at all times.
- Show a brief first-launch overlay hint: "Left stick moves • Right pad aims • Tap fires" persisted via StorageAdapter.

GAME FEEL + SMOOTHNESS (must)
- Engine:
  - Fixed timestep STEP = 1/60 seconds with accumulator (dt in seconds, not ms).
  - Clamp frameTime max 0.05s.
  - Store prev position for entities each tick.
  - Render interpolation with alpha = accumulator / STEP and draw lerp(prevPos, pos, alpha) to prevent jerkiness.
- Performance:
  - Use simple object pooling for projectiles to reduce GC stutter.
  - Cap bullets/enemies reasonably with configurable constants.
- Feedback:
  - Enemy hit flash or brief color tint.
  - UI toasts for purchase success/failure and unlocks.
  - Settings toggle for SFX (persisted).

GAMEPLAY REQUIREMENTS
- Survivors bullet hell style: player dodges many bullets and shoots back.
- Player stats: maxHealth, healthRegen/sec, speed, baseDamage, cooldownMs, size, armorPercent.
- Weapons: id,name,cooldownMs,projectileSpeed,damage,spreadDegrees,projectilesPerShot,special (piercing/explosive).
- Enemies spawn in waves with bullet patterns: radial, spiral, aimed burst, wave.
- Levels: 3 levels with distinct enemy patterns and backgroundColor (data/levels.js).
- Currency: coins drop and can be collected. Coin magnet item increases pickup radius.
- Shop/progression:
  - Coins buy characters, weapons, and upgrades.
  - Unlocks based on playCount, totalCoinsCollected, levelsCompleted, and score thresholds.
  - Save high score and per-level best locally.
- 10 playable characters (data/characters.js) with stats, startingWeaponId, unlockCondition.
- 12 upgradeable items (data/items.js) with 3–5 levels, increasing cost, diminishing returns.

SHOP CORRECTNESS (must to avoid “free upgrades” bug)
- All purchases must go through shop.buy(itemId) atomic transaction:
  - recompute next cost from current owned level
  - validate coins >= cost
  - deduct coins and increment level
  - persist via StorageAdapter
  - return {ok:true} or {ok:false, reason:"INSUFFICIENT_COINS"|"MAX_LEVEL"}
- UI must NOT mutate coins/levels directly; it only calls shop.buy and re-renders from state.
- Disabled buy buttons when cannot afford.
- Toast on failed purchase.

AUDIO (must)
- src/audio/sfx.js provides modular replaceable SFX using WebAudio oscillators.
- Provide: shoot, hit, enemyDeath, coin, levelUp, shopBuy, updateAvailable
- Expose sfx.register(name, function|AudioBuffer) and sfx.play(name).

REQUIRED MODULES / FILES
- src/main.js
- src/config.js
- src/utils/vector.js
- src/game/engine.js
- src/game/render.js
- src/game/input.js
- src/game/player.js
- src/game/enemy.js
- src/game/projectile.js
- src/game/level.js
- src/game/shop.js
- src/game/ui.js
- src/storage/storageAdapter.js
- src/storage/localStorageAdapter.js
- src/audio/sfx.js
- src/data/characters.js (10)
- src/data/items.js (12)
- src/data/levels.js (3)
- tests/storage.test.js
- tests/engine.test.js
- tests/player.test.js
- tests/collision.test.js
- tests/shop.test.js
- public/index.html
- public/styles.css
- public/manifest.json
- public/icons/* placeholders
- service-worker.js
- README.md
- TEST_PLAN.md

TESTING (must)
- Use Vitest; tests must be deterministic and fast.
- Tests required:
  - storage adapter get/set/remove/clear/keys
  - engine fixed timestep accumulator behavior and clamping
  - player damage/heal/cooldown + upgrade application
  - collision projectile-enemy and player-enemy AABB
  - shop atomic purchase (insufficient coins cannot upgrade; exact coins works; persistence reload)
- Provide TEST_PLAN.md manual tests including offline, SW update flow, mobile controls, shop persistence.

README (must)
Include: setup, dev, build, test, how to play, extending, storage adapter swap, SW update flow, GitHub Pages deploy.

QUALITY GATES (must complete before final output)
Before ending, do a self-audit and ensure:
- Dual-stick aiming works and is explained + aim indicator visible.
- Shop purchases cannot occur without sufficient coins.
- Enemy movement is smooth (interpolation + pooling).
- PWA offline works after first load.
- Update banner appears when new SW waiting and refresh applies update.
- GitHub Pages deploy workflow publishes and app works under /<repo>/.

NOW GENERATE THE FULL PROJECT FILES IN THE GROUP ORDER ABOVE.
