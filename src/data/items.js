export const ITEMS = [
  {
    id: 'reinforced_plating',
    name: 'Reinforced Plating',
    description: 'Raises max health.',
    type: 'playerBoost',
    levels: [
      { cost: 60, statDeltas: { maxHealthPct: 0.08 } },
      { cost: 110, statDeltas: { maxHealthPct: 0.07 } },
      { cost: 180, statDeltas: { maxHealthPct: 0.06 } },
      { cost: 260, statDeltas: { maxHealthPct: 0.05 } }
    ]
  },
  {
    id: 'lightweight_boots',
    name: 'Lightweight Boots',
    description: 'Improves movement speed.',
    type: 'playerBoost',
    levels: [
      { cost: 55, statDeltas: { speedPct: 0.07 } },
      { cost: 100, statDeltas: { speedPct: 0.06 } },
      { cost: 160, statDeltas: { speedPct: 0.05 } },
      { cost: 240, statDeltas: { speedPct: 0.04 } }
    ]
  },
  {
    id: 'auto_loader',
    name: 'Auto-Loader',
    description: 'Reduces weapon cooldown.',
    type: 'weaponUpgrade',
    levels: [
      { cost: 70, statDeltas: { cooldownPct: -0.08 } },
      { cost: 130, statDeltas: { cooldownPct: -0.07 } },
      { cost: 210, statDeltas: { cooldownPct: -0.06 } },
      { cost: 300, statDeltas: { cooldownPct: -0.05 } }
    ]
  },
  {
    id: 'high_velocity_rounds',
    name: 'High-Velocity Rounds',
    description: 'Increases projectile speed.',
    type: 'weaponUpgrade',
    levels: [
      { cost: 65, statDeltas: { projectileSpeedPct: 0.1 } },
      { cost: 120, statDeltas: { projectileSpeedPct: 0.08 } },
      { cost: 190, statDeltas: { projectileSpeedPct: 0.07 } }
    ]
  },
  {
    id: 'piercing_rounds',
    name: 'Piercing Rounds',
    description: 'Chance for shots to pierce enemies.',
    type: 'weaponUpgrade',
    levels: [
      { cost: 80, statDeltas: { piercingChance: 0.1 } },
      { cost: 140, statDeltas: { piercingChance: 0.08 } },
      { cost: 220, statDeltas: { piercingChance: 0.07 } }
    ]
  },
  {
    id: 'rapid_fire_mod',
    name: 'Rapid Fire Mod',
    description: 'Adds occasional bonus projectile.',
    type: 'weaponUpgrade',
    levels: [
      { cost: 95, statDeltas: { projectilesBonus: 0.2 } },
      { cost: 165, statDeltas: { projectilesBonus: 0.18 } },
      { cost: 250, statDeltas: { projectilesBonus: 0.15 } }
    ]
  },
  {
    id: 'nano_healer',
    name: 'Nano-Healer',
    description: 'Passive healing while fighting.',
    type: 'passive',
    levels: [
      { cost: 85, statDeltas: { healthRegenFlat: 0.12 } },
      { cost: 150, statDeltas: { healthRegenFlat: 0.1 } },
      { cost: 230, statDeltas: { healthRegenFlat: 0.08 } },
      { cost: 320, statDeltas: { healthRegenFlat: 0.07 } }
    ]
  },
  {
    id: 'coin_magnet',
    name: 'Coin Magnet',
    description: 'Wider coin pickup radius.',
    type: 'passive',
    levels: [
      { cost: 60, statDeltas: { coinMagnetFlat: 8 } },
      { cost: 105, statDeltas: { coinMagnetFlat: 7 } },
      { cost: 170, statDeltas: { coinMagnetFlat: 6 } },
      { cost: 250, statDeltas: { coinMagnetFlat: 5 } }
    ]
  },
  {
    id: 'shield_generator',
    name: 'Shield Generator',
    description: 'Chance to nullify incoming hit.',
    type: 'passive',
    levels: [
      { cost: 115, statDeltas: { shieldChance: 0.08 } },
      { cost: 195, statDeltas: { shieldChance: 0.06 } },
      { cost: 285, statDeltas: { shieldChance: 0.05 } }
    ]
  },
  {
    id: 'explosive_rounds',
    name: 'Explosive Rounds',
    description: 'Adds splash damage radius.',
    type: 'weaponUpgrade',
    levels: [
      { cost: 120, statDeltas: { explosiveRadius: 12 } },
      { cost: 210, statDeltas: { explosiveRadius: 8 } },
      { cost: 320, statDeltas: { explosiveRadius: 6 } }
    ]
  },
  {
    id: 'critical_tuner',
    name: 'Critical Tuner',
    description: 'Raises crit chance and crit power.',
    type: 'passive',
    levels: [
      { cost: 110, statDeltas: { critChance: 0.05, critDamage: 0.08 } },
      { cost: 200, statDeltas: { critChance: 0.04, critDamage: 0.07 } },
      { cost: 300, statDeltas: { critChance: 0.03, critDamage: 0.06 } }
    ]
  },
  {
    id: 'ammo_reserve',
    name: 'Ammo Reserve',
    description: 'Mitigates cooldown penalties and improves stability.',
    type: 'passive',
    levels: [
      { cost: 70, statDeltas: { cooldownPenaltyReduction: 0.05 } },
      { cost: 130, statDeltas: { cooldownPenaltyReduction: 0.04 } },
      { cost: 210, statDeltas: { cooldownPenaltyReduction: 0.03 } },
      { cost: 290, statDeltas: { cooldownPenaltyReduction: 0.03 } }
    ]
  }
];

export function getItemById(id) {
  return ITEMS.find((item) => item.id === id);
}
