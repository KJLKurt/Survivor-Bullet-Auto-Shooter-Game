export const LEVELS = [
  {
    id: "dockyard",
    name: "Storm Dockyard",
    backgroundColor: "#102034",
    durationSeconds: 85,
    spawnIntervalSeconds: 1.15,
    difficulty: 1,
    waves: [
      { start: 0, end: 24, type: "skitter", pattern: "wave", spawnMultiplier: 1 },
      { start: 24, end: 50, type: "skitter", pattern: "aimed_burst", spawnMultiplier: 0.9 },
      { start: 50, end: 85, type: "brute", pattern: "radial", spawnMultiplier: 0.8 }
    ]
  },
  {
    id: "citadel",
    name: "Fracture Citadel",
    backgroundColor: "#2b1b28",
    durationSeconds: 95,
    spawnIntervalSeconds: 1,
    difficulty: 2,
    waves: [
      { start: 0, end: 30, type: "skitter", pattern: "spiral", spawnMultiplier: 0.95 },
      { start: 30, end: 62, type: "brute", pattern: "aimed_burst", spawnMultiplier: 0.82 },
      { start: 62, end: 95, type: "elite", pattern: "radial", spawnMultiplier: 0.78 }
    ]
  },
  {
    id: "riftcore",
    name: "Riftcore Gate",
    backgroundColor: "#182431",
    durationSeconds: 110,
    spawnIntervalSeconds: 0.9,
    difficulty: 3,
    waves: [
      { start: 0, end: 38, type: "brute", pattern: "spiral", spawnMultiplier: 0.88 },
      { start: 38, end: 74, type: "elite", pattern: "wave", spawnMultiplier: 0.75 },
      { start: 74, end: 110, type: "elite", pattern: "aimed_burst", spawnMultiplier: 0.68 }
    ]
  }
];

export const LEVELS_BY_ID = Object.fromEntries(LEVELS.map((level) => [level.id, level]));
