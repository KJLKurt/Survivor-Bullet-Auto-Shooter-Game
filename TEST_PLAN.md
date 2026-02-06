# Test Plan

## Automated
- Unit tests via Vitest:
  - Storage adapter async CRUD and key scoping.
  - Collision helper correctness.
  - Player damage reduction and shooting cooldown.
  - Upgrade cost calculations.

## Manual
1. Launch app (`npm run dev`) and verify canvas/HUD render.
2. Use touch or keyboard controls to move and shoot.
3. Confirm enemies spawn, shoot patterns, and collisions reduce health.
4. Confirm coins drop and are collected near player.
5. Open shop and purchase upgrade when enough coins.
6. Confirm game over screen appears and restart works.
7. Reload page and verify high score/progression persistence.
8. Install as PWA (supported browser) and verify offline launch.
9. Deploy updated bundle/service-worker and verify update banner appears, tap to refresh applies update.
