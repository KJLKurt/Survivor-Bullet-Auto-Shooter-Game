export const CHARACTERS = [
  {
    id: 'rookie',
    name: 'Rookie',
    description: 'Balanced baseline survivor.',
    baseStats: {
      maxHealth: 110,
      healthRegen: 0.2,
      speed: 180,
      baseDamage: 1,
      cooldown: 1,
      size: 18,
      armor: 0.04
    },
    startingWeaponId: 'pistol',
    unlockCondition: { type: 'default' }
  },
  {
    id: 'runner',
    name: 'Runner',
    description: 'Very fast but fragile.',
    baseStats: {
      maxHealth: 80,
      healthRegen: 0.12,
      speed: 240,
      baseDamage: 0.95,
      cooldown: 0.9,
      size: 16,
      armor: 0.01
    },
    startingWeaponId: 'smg',
    unlockCondition: { type: 'coins', value: 150 }
  },
  {
    id: 'tank',
    name: 'Tank',
    description: 'Huge health pool and armor.',
    baseStats: {
      maxHealth: 180,
      healthRegen: 0.08,
      speed: 135,
      baseDamage: 1,
      cooldown: 1.05,
      size: 24,
      armor: 0.16
    },
    startingWeaponId: 'shotgun',
    unlockCondition: { type: 'coins', value: 240 }
  },
  {
    id: 'sharpshooter',
    name: 'Sharpshooter',
    description: 'High single-target damage, slower shots.',
    baseStats: {
      maxHealth: 90,
      healthRegen: 0.1,
      speed: 170,
      baseDamage: 1.35,
      cooldown: 1.2,
      size: 17,
      armor: 0.02
    },
    startingWeaponId: 'sniper',
    unlockCondition: { type: 'score', value: 900 }
  },
  {
    id: 'engineer',
    name: 'Engineer',
    description: 'Deploys a temporary turret burst as special.',
    baseStats: {
      maxHealth: 115,
      healthRegen: 0.15,
      speed: 175,
      baseDamage: 1.05,
      cooldown: 0.95,
      size: 18,
      armor: 0.05
    },
    startingWeaponId: 'turret_blaster',
    unlockCondition: { type: 'playCount', value: 3 }
  },
  {
    id: 'medic',
    name: 'Medic',
    description: 'Passive regeneration specialist.',
    baseStats: {
      maxHealth: 100,
      healthRegen: 0.65,
      speed: 160,
      baseDamage: 0.95,
      cooldown: 1,
      size: 18,
      armor: 0.03
    },
    startingWeaponId: 'medic_pistol',
    unlockCondition: { type: 'coins', value: 300 }
  },
  {
    id: 'berserker',
    name: 'Berserker',
    description: 'Damage ramps up when health is low.',
    baseStats: {
      maxHealth: 125,
      healthRegen: 0.05,
      speed: 190,
      baseDamage: 1.15,
      cooldown: 0.95,
      size: 19,
      armor: 0.04
    },
    startingWeaponId: 'cleaver',
    unlockCondition: { type: 'playCount', value: 6 }
  },
  {
    id: 'scout',
    name: 'Scout',
    description: 'Small hitbox and agile movement.',
    baseStats: {
      maxHealth: 85,
      healthRegen: 0.18,
      speed: 235,
      baseDamage: 1,
      cooldown: 0.92,
      size: 14,
      armor: 0.01
    },
    startingWeaponId: 'burst_rifle',
    unlockCondition: { type: 'score', value: 1600 }
  },
  {
    id: 'demolisher',
    name: 'Demolisher',
    description: 'Explosive rounds with slow cadence.',
    baseStats: {
      maxHealth: 130,
      healthRegen: 0.09,
      speed: 150,
      baseDamage: 1.25,
      cooldown: 1.18,
      size: 20,
      armor: 0.08
    },
    startingWeaponId: 'grenade_launcher',
    unlockCondition: { type: 'coins', value: 430 }
  },
  {
    id: 'ghost',
    name: 'Ghost',
    description: 'Can phase briefly to avoid damage.',
    baseStats: {
      maxHealth: 76,
      healthRegen: 0.12,
      speed: 215,
      baseDamage: 1.12,
      cooldown: 0.98,
      size: 15,
      armor: 0.02
    },
    startingWeaponId: 'phantom_blade',
    unlockCondition: { type: 'levelsCompleted', value: 2 }
  }
];

export function getCharacterById(id) {
  return CHARACTERS.find((character) => character.id === id) || CHARACTERS[0];
}
