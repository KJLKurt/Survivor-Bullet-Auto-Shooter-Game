export const LEVELS = [
  {
    id: 'level1',
    name: 'Neon Yard',
    arenaSize: { width: 900, height: 1600 },
    backgroundColor: '#13263c',
    spawnPatterns: [
      { id: 'l1-a', startSec: 0, endSec: 30, intervalSec: 1.6, enemyType: 'grunt', count: 2, bulletPattern: 'radial' },
      { id: 'l1-b', startSec: 25, endSec: 70, intervalSec: 2.4, enemyType: 'runner', count: 2, bulletPattern: 'aimedBurst' },
      { id: 'l1-c', startSec: 60, endSec: 95, intervalSec: 2.9, enemyType: 'tankette', count: 1, bulletPattern: 'wave' }
    ],
    music: null,
    unlockCondition: { type: 'default' }
  },
  {
    id: 'level2',
    name: 'Foundry District',
    arenaSize: { width: 1024, height: 1800 },
    backgroundColor: '#2b1f31',
    spawnPatterns: [
      { id: 'l2-a', startSec: 0, endSec: 40, intervalSec: 1.3, enemyType: 'runner', count: 3, bulletPattern: 'spiral' },
      { id: 'l2-b', startSec: 20, endSec: 95, intervalSec: 2.1, enemyType: 'grunt', count: 3, bulletPattern: 'aimedBurst' },
      { id: 'l2-c', startSec: 48, endSec: 95, intervalSec: 6.8, enemyType: 'miniBoss', count: 1, bulletPattern: 'radial' }
    ],
    music: null,
    unlockCondition: { type: 'playCount', value: 2 }
  },
  {
    id: 'level3',
    name: 'Void Citadel',
    arenaSize: { width: 1180, height: 2100 },
    backgroundColor: '#1f1f30',
    spawnPatterns: [
      { id: 'l3-a', startSec: 0, endSec: 95, intervalSec: 1.1, enemyType: 'runner', count: 4, bulletPattern: 'spiral' },
      { id: 'l3-b', startSec: 10, endSec: 95, intervalSec: 1.9, enemyType: 'tankette', count: 2, bulletPattern: 'wave' },
      { id: 'l3-c', startSec: 35, endSec: 95, intervalSec: 3.8, enemyType: 'miniBoss', count: 1, bulletPattern: 'radial' },
      { id: 'l3-d', startSec: 70, endSec: 95, intervalSec: 8.2, enemyType: 'boss', count: 1, bulletPattern: 'multiPhase' }
    ],
    music: null,
    unlockCondition: { type: 'levelsCompleted', value: 1 }
  }
];

export function getLevelById(id) {
  return LEVELS.find((level) => level.id === id) || LEVELS[0];
}
