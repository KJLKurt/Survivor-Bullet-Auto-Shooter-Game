Create a complete personal web app project that implements a mobile-first Survivors bullet hell game. Deliver a ready-to-build repository scaffold and all source code in vanilla JavaScript, HTML, and CSS with a minimal fast build and test setup. Keep local storage as an abstracted storage adapter so it can be swapped for a remote API later. Make graphics simple solid colors and geometric shapes so sprites can be swapped later. The app must work offline as a Progressive Web App and when online must detect an available update and show a user-facing update notification that lets the user refresh to apply the update.

Follow these explicit requirements and acceptance criteria exactly.

---

High level goals and constraints

- Language and frameworks: Vanilla JavaScript (ES2022+), HTML, CSS. No heavy frameworks. Small dev tooling allowed for fast builds.
- Build and test speed: Use esbuild for bundling and Vitest for tests. Keep dependencies minimal.
- Offline support: Implement a service worker that caches app shell and assets and supports update detection. When a new service worker is available, show a non-blocking in-app notification prompting the user to update.
- Storage abstraction: Provide a StorageAdapter interface with a LocalStorageAdapter implementation. Design the interface so it can be replaced with ApiStorageAdapter later without changing game logic.
- Mobile-first: Responsive layout optimized for mobile portrait, touch controls (virtual joystick and tap/shoot button), and keyboard support for desktop.
- Graphics: Use simple solid colors and shapes drawn on <canvas>. All colors and sizes must be configurable constants so sprites can replace them later.
- Audio: Provide a small set of replaceable SFX implemented with WebAudio oscillator or short base64 audio blobs. Keep SFX modular and easy to replace.
- Gameplay features:
  - Survivors bullet hell style: player dodges many bullets and shoots back.
  - Player has health, speed, cooldown, weapon type, and passive modifiers.
  - Weapons have cooldowns, projectile speed, damage, spread, and special effects.
  - Enemies spawn in waves with bullet patterns.
  - Levels: 3 distinct levels with different enemy spawn patterns and backgrounds.
  - Currency: in-game coins collected during play.
  - Shop and progression: coins buy characters, weapons, and upgrades. New content unlocks as player plays more.
  - 10 playable characters with unique starting weapons and stats.
  - 10–15 upgradable items or upgrades (list provided below).
  - High score and per-level best scores saved locally.
  - Level unlocks and weapon unlocks based on playtime or achievements.
- Testing: Provide unit tests for core game logic (collision, cooldown, storage adapter, upgrade calculations) using Vitest and jsdom where needed. Provide a test plan document describing manual and automated tests.
- Readme: Include a README with setup, build, run, test, and extension instructions.
- Code quality: Modular, well-documented functions, clear separation of concerns, and easy to extend.

---

Deliverables required by the prompt

- Full project scaffold with package.json, src folder, public folder, index.html, manifest.json, service-worker.js, and README.md.
- src modules:
  - main.js app bootstrap
  - game/engine.js game loop and tick management
  - game/render.js canvas rendering utilities
  - game/input.js touch and keyboard controls
  - game/player.js player class and stats
  - game/enemy.js enemy class and spawn manager
  - game/projectile.js projectile class and bullet patterns
  - game/level.js level definitions and spawn patterns
  - game/shop.js shop and upgrade logic
  - game/ui.js UI overlays, HUD, and update notification
  - storage/storageAdapter.js interface and localStorageAdapter.js implementation
  - audio/sfx.js simple SFX manager
  - data/characters.js 10 character definitions
  - data/items.js 10–15 upgrade definitions
  - data/levels.js 3 level definitions
  - tests/* unit tests
- public/ static assets (placeholder color images if needed) and index.html.
- manifest.json for PWA and icons (use simple colored SVG placeholders).
- service-worker.js with cache-first strategy for app shell and network-first for optional remote content; implement update detection and postMessage to the app to trigger update notification.
- README.md and TEST_PLAN.md.

---

Project structure example

`
/survivors-bullet-hell
  /public
    index.html
    manifest.json
    icons/
    favicon.ico
  /src
    main.js
    /game
      engine.js
      render.js
      input.js
      player.js
      enemy.js
      projectile.js
      level.js
      shop.js
      ui.js
    /storage
      storageAdapter.js
      localStorageAdapter.js
    /audio
      sfx.js
    /data
      characters.js
      items.js
      levels.js
  /tests
    engine.test.js
    storage.test.js
    player.test.js
  package.json
  service-worker.js
  README.md
  TEST_PLAN.md
`

---

package.json example for fast builds and tests

Provide this package.json in the scaffold.

`json
{
  "name": "survivors-bullet-hell",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "esbuild src/main.js --bundle --outfile=public/dist/bundle.js --servedir=public --sourcemap --watch",
    "build": "esbuild src/main.js --bundle --minify --outfile=public/dist/bundle.js",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint src --ext .js"
  },
  "devDependencies": {
    "esbuild": "^0.19.0",
    "vitest": "^1.0.0",
    "jsdom": "^22.0.0",
    "eslint": "^8.0.0"
  }
}
`

---

Storage adapter interface

Create storage/storageAdapter.js with this interface:

- Methods:
  - async get(key) returns parsed JSON or null
  - async set(key, value) stores JSON-serializable value
  - async remove(key)
  - async clear()
  - async keys() returns array of keys

Implement localStorageAdapter.js using localStorage but exposing async API (Promise-based). Keep all calls to storage via this adapter.

---

Service worker and update notification behavior

- Cache app shell files on install: index.html, dist/bundle.js, manifest.json, CSS, icons.
- On activate, claim clients.
- On fetch, use cache-first for app shell and network-first for dynamic content.
- When a new service worker is installed and waiting, send a postMessage to clients with {type: 'SWUPDATEAVAILABLE'}.
- In src/ui.js listen for navigator.serviceWorker messages and show a small in-app banner with text: Update available Tap to refresh. Tapping calls skipWaiting via message to the service worker and then reloads the page when the new worker activates.
- Provide fallback if service worker not supported.

---

Gameplay design details

Core loop and tick
- Fixed timestep game loop at 60 FPS target with requestAnimationFrame and accumulator for deterministic updates.
- Separate update(dt) and render() phases.
- Keep physics simple AABB collision for player/projectile/enemy.

Player
- Stats: maxHealth, healthRegen (per second), speed, baseDamage, cooldown (ms), size, armor (damage reduction percent).
- Actions: move, shoot, dash (optional unlock).
- Inventory: starting weapon, passive modifiers from items.

Weapons
- Weapon properties: id, name, cooldownMs, projectileSpeed, damage, spreadDegrees, projectilesPerShot, ammo (optional), special (e.g., piercing, explosive).
- Weapons have levels that reduce cooldown or increase damage.

Enemies
- Enemy properties: hp, speed, size, scoreValue, bulletPattern (function or pattern id).
- Patterns: radial, spiral, aimed bursts, wave.

Levels
- Level 1: Arena small; slow enemies; simple radial bullets.
- Level 2: Medium arena; faster enemies; spiral bullets and occasional mini-boss.
- Level 3: Large arena; dense bullets; boss with multi-phase patterns.

Currency and shop
- Coins drop from enemies and appear as small circles to collect.
- Shop accessible from main menu and between levels.
- Purchases: characters, starting weapons, permanent upgrades.
- Unlock rules: some items unlocked after X plays or reaching score thresholds.

Progression and unlocks
- Track playCount, totalCoinsCollected, levelsCompleted.
- Unlock new weapons/levels/characters when thresholds reached.

---

Characters list 10 unique starting characters

Provide these 10 characters in data/characters.js with unique starting weapon and stats. Example entries:

1. Rookie starting pistol; balanced stats
2. Runner higher speed, lower health; starting SMG
3. Tank high health, low speed; starting shotgun
4. Sharpshooter high damage, slow fire; starting sniper
5. Engineer starts with turret deploy ability; medium stats
6. Medic slow but passive health regen; starting pistol with heal boost
7. Berserker high damage on low health; melee-ish short-range weapon
8. Scout tiny size, high dodge; starting burst weapon
9. Demolisher explosive projectiles; low fire rate
10. Ghost temporary invisibility cooldown; low health

Each character entry must include: id, name, description, baseStats, startingWeaponId, unlockCondition (e.g., default or coins).

---

Items and upgrades 12 example items

Provide 12 upgradeable items in data/items.js. Each item has id, name, description, type (weaponUpgrade, playerBoost, passive), levels array with stat deltas and cost per level. Example items:

1. Reinforced Plating playerBoost increases maxHealth
2. Lightweight Boots playerBoost increases speed
3. Auto-Loader weaponUpgrade reduces cooldown
4. High-Velocity Rounds weaponUpgrade increases projectileSpeed
5. Piercing Rounds weaponUpgrade adds piercing chance
6. Rapid Fire Mod weaponUpgrade increases projectilesPerShot or fire rate
7. Nano-Healer passive slowly heals in combat
8. Coin Magnet passive increases pickup radius for coins
9. Shield Generator active cooldown shield (unlockable)
10. Explosive Rounds weaponUpgrade adds area damage on hit
11. Critical Tuner passive increases crit chance or damage
12. Ammo Reserve passive increases starting ammo or reduces cooldown penalty

Each item should have 3–5 upgrade levels with increasing cost and diminishing returns.

---

Levels definitions

Provide data/levels.js with 3 levels. Each level includes id, name, arenaSize (logical size), backgroundColor, spawnPatterns array, music (optional), and unlockCondition.

---

UI and HUD

- Top-left: health bar and player name
- Top-right: coins and high score
- Bottom-left: virtual joystick area
- Bottom-right: shoot button and special ability button
- Center overlay: pause, shop, and level select
- Small toast area for update notifications and unlock messages

---

Audio SFX list

Provide simple SFX implemented in audio/sfx.js using WebAudio oscillator or short base64 blobs:

- sfx.shoot short beep
- sfx.hit low click
- sfx.enemyDeath short descending tone
- sfx.coin bright chime
- sfx.levelUp celebratory tone
- sfx.shopBuy soft confirm
- sfx.updateAvailable subtle ping

Make SFX replaceable by exposing sfx.register(name, AudioBuffer|function).

---

Tests and test plan

Automated tests
- tests/storage.test.js tests LocalStorageAdapter get/set/remove/clear/keys.
- tests/engine.test.js tests fixed timestep update behavior and accumulator edge cases.
- tests/player.test.js tests damage, heal, cooldown, and upgrade application.
- tests/collision.test.js tests projectile-enemy and player-enemy collisions.

Use Vitest and jsdom for DOM-related tests. Keep tests fast and deterministic.

Manual test plan TEST_PLAN.md
- Install and run dev server verify app loads offline after first load.
- Service worker update flow: simulate new service-worker.js and verify update banner appears and refresh applies new version.
- Gameplay: verify player movement, shooting, enemy spawn, coin drops, and collisions.
- Shop and persistence: buy item, reload, verify persistence via storage adapter.
- Unlocks: reach thresholds and verify unlocks appear.
- Mobile touch: test virtual joystick and shoot button responsiveness.
- Audio: toggle SFX on/off and verify sounds play.
- Performance: verify stable 60 FPS on mid-range mobile device with moderate bullet count.

---

README content outline

Include sections:

- Project overview
- Features
- Quick start with commands:
  - npm install
  - npm run dev open http://localhost:8000 or http://localhost:3000 depending on dev server
  - npm run build
  - npm run test
- How to play controls and UI
- Extending the game how to add characters, weapons, levels, and swap storage adapter
- Service worker and update flow explanation
- Testing how to run tests and add new tests
- License

---

Implementation notes for the model

- Use modular ES modules and export default classes where appropriate.
- Keep all constants (colors, sizes, speeds) in a single config.js file for easy replacement.
- Keep rendering and game logic separated. render.js should only draw based on game state.
- Keep deterministic logic in engine.js and pure functions for collision and math to ease testing.
- Use requestAnimationFrame with a fixed update step of 1/60 seconds and an accumulator.
- Use performance.now() for timing.
- Keep all DOM interactions in ui.js.
- Provide clear inline comments for each module and exported API.
- Provide small helper utilities for vector math in utils/vector.js.

---

Acceptance criteria checklist

- [ ] Vanilla JS project scaffold present with package.json using esbuild and vitest
- [ ] Service worker implemented with update detection and in-app notification
- [ ] Storage adapter abstraction with localStorage implementation
- [ ] Mobile-first controls and responsive layout
- [ ] 10 characters, 12 items, 3 levels defined in data files
- [ ] Coins, shop, unlocks, and progression implemented
- [ ] Simple SFX manager with replaceable sounds
- [ ] Unit tests for core logic and a TEST_PLAN.md
- [ ] README.md with setup and extension instructions

---

Additional developer guidance

- Keep bundle small and avoid heavy polyfills.
- Favor simple deterministic math for collision and movement.
- Keep all assets minimal and replaceable.
- Make it easy to swap localStorageAdapter for ApiStorageAdapter by only importing storage/storageAdapter.js in game code.

---

Final instruction to the code model

Generate the full project files described above. Provide complete source code for each file in the scaffold, including package.json, index.html, manifest.json, service-worker.js, all src modules, public placeholders, README.md, and TEST_PLAN.md. Ensure tests run with npm run test and dev server runs with npm run dev. Keep code modular, well-commented, and ready to run locally.  Please have it automatically build and publish the game hosted on a GitHub pages.

If you cannot produce the entire project in one response, produce the full file list and then output files in logical groups (for example: package.json and build files first, then core src modules, then data files, then service worker, then tests, then README and test plan).
