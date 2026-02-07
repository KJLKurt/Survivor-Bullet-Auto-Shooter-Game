export const CHARACTERS = [
  {
    id: "runner",
    name: "Runner",
    startingWeaponId: "pulse",
    stats: {
      maxHealth: 110,
      healthRegen: 2.8,
      speed: 218,
      baseDamage: 10,
      cooldownMs: 290,
      size: 15,
      armorPercent: 0.04
    },
    unlockCondition: { type: "default", value: 0 }
  },
  {
    id: "bulwark",
    name: "Bulwark",
    startingWeaponId: "pulse",
    stats: {
      maxHealth: 170,
      healthRegen: 2,
      speed: 168,
      baseDamage: 12,
      cooldownMs: 320,
      size: 18,
      armorPercent: 0.18
    },
    unlockCondition: { type: "coins", value: 120 }
  },
  {
    id: "spark",
    name: "Spark",
    startingWeaponId: "twin",
    stats: {
      maxHealth: 95,
      healthRegen: 2.4,
      speed: 240,
      baseDamage: 8,
      cooldownMs: 220,
      size: 14,
      armorPercent: 0.02
    },
    unlockCondition: { type: "playCount", value: 3 }
  },
  {
    id: "warden",
    name: "Warden",
    startingWeaponId: "rail",
    stats: {
      maxHealth: 150,
      healthRegen: 2.2,
      speed: 182,
      baseDamage: 15,
      cooldownMs: 420,
      size: 17,
      armorPercent: 0.12
    },
    unlockCondition: { type: "score", value: 1400 }
  },
  {
    id: "rift",
    name: "Rift",
    startingWeaponId: "nova",
    stats: {
      maxHealth: 105,
      healthRegen: 2.1,
      speed: 205,
      baseDamage: 13,
      cooldownMs: 370,
      size: 16,
      armorPercent: 0.06
    },
    unlockCondition: { type: "levelsCompleted", value: 1 }
  },
  {
    id: "echo",
    name: "Echo",
    startingWeaponId: "twin",
    stats: {
      maxHealth: 120,
      healthRegen: 3.2,
      speed: 198,
      baseDamage: 9,
      cooldownMs: 250,
      size: 15,
      armorPercent: 0.05
    },
    unlockCondition: { type: "coins", value: 380 }
  },
  {
    id: "viper",
    name: "Viper",
    startingWeaponId: "rail",
    stats: {
      maxHealth: 100,
      healthRegen: 1.9,
      speed: 245,
      baseDamage: 16,
      cooldownMs: 470,
      size: 14,
      armorPercent: 0.03
    },
    unlockCondition: { type: "score", value: 2600 }
  },
  {
    id: "atlas",
    name: "Atlas",
    startingWeaponId: "pulse",
    stats: {
      maxHealth: 210,
      healthRegen: 2.5,
      speed: 158,
      baseDamage: 14,
      cooldownMs: 340,
      size: 20,
      armorPercent: 0.2
    },
    unlockCondition: { type: "levelsCompleted", value: 2 }
  },
  {
    id: "aster",
    name: "Aster",
    startingWeaponId: "nova",
    stats: {
      maxHealth: 112,
      healthRegen: 2.6,
      speed: 214,
      baseDamage: 11,
      cooldownMs: 300,
      size: 15,
      armorPercent: 0.07
    },
    unlockCondition: { type: "playCount", value: 9 }
  },
  {
    id: "sol",
    name: "Sol",
    startingWeaponId: "rail",
    stats: {
      maxHealth: 132,
      healthRegen: 2.4,
      speed: 190,
      baseDamage: 18,
      cooldownMs: 450,
      size: 16,
      armorPercent: 0.1
    },
    unlockCondition: { type: "score", value: 4200 }
  }
];

export const CHARACTERS_BY_ID = Object.fromEntries(CHARACTERS.map((character) => [character.id, character]));
