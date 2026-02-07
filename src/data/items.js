export const ITEMS = [
  {
    id: "vitality_core",
    name: "Vitality Core",
    kind: "upgrade",
    description: "Increase max health with diminishing gains.",
    maxLevel: 5,
    costs: [20, 45, 80, 130, 190],
    effect: { stat: "maxHealth", mode: "add", perLevel: 14 }
  },
  {
    id: "regen_thread",
    name: "Regen Thread",
    kind: "upgrade",
    description: "Improve passive health regeneration.",
    maxLevel: 4,
    costs: [25, 55, 95, 150],
    effect: { stat: "healthRegen", mode: "add", perLevel: 0.42 }
  },
  {
    id: "agility_shards",
    name: "Agility Shards",
    kind: "upgrade",
    description: "Boost movement speed.",
    maxLevel: 5,
    costs: [30, 65, 110, 170, 245],
    effect: { stat: "speed", mode: "add", perLevel: 10 }
  },
  {
    id: "reinforced_plating",
    name: "Reinforced Plating",
    kind: "upgrade",
    description: "Increase armor percentage.",
    maxLevel: 4,
    costs: [35, 80, 140, 220],
    effect: { stat: "armorPercent", mode: "add", perLevel: 0.03 }
  },
  {
    id: "focusing_lens",
    name: "Focusing Lens",
    kind: "upgrade",
    description: "Scale outgoing damage.",
    maxLevel: 5,
    costs: [40, 92, 154, 228, 315],
    effect: { stat: "damageMultiplier", mode: "mult", perLevel: 0.1 }
  },
  {
    id: "quick_chamber",
    name: "Quick Chamber",
    kind: "upgrade",
    description: "Raise fire rate with smaller late gains.",
    maxLevel: 5,
    costs: [34, 76, 129, 198, 286],
    effect: { stat: "fireRateMultiplier", mode: "mult", perLevel: 0.08 }
  },
  {
    id: "kinetic_booster",
    name: "Kinetic Booster",
    kind: "upgrade",
    description: "Increase projectile speed.",
    maxLevel: 4,
    costs: [22, 49, 86, 140],
    effect: { stat: "projectileSpeedMultiplier", mode: "mult", perLevel: 0.12 }
  },
  {
    id: "coin_magnet",
    name: "Coin Magnet",
    kind: "upgrade",
    description: "Expand coin pickup radius.",
    maxLevel: 5,
    costs: [16, 36, 60, 90, 126],
    effect: { stat: "pickupRadius", mode: "add", perLevel: 11 }
  },
  {
    id: "stability_mesh",
    name: "Stability Mesh",
    kind: "upgrade",
    description: "Reduce hitbox size slightly.",
    maxLevel: 3,
    costs: [28, 68, 125],
    effect: { stat: "size", mode: "add", perLevel: -0.9 }
  },
  {
    id: "assault_matrix",
    name: "Assault Matrix",
    kind: "upgrade",
    description: "Add flat base damage.",
    maxLevel: 4,
    costs: [33, 72, 121, 185],
    effect: { stat: "baseDamage", mode: "add", perLevel: 1.8 }
  },
  {
    id: "coolant_loop",
    name: "Coolant Loop",
    kind: "upgrade",
    description: "Lower cooldown baseline.",
    maxLevel: 4,
    costs: [29, 63, 108, 166],
    effect: { stat: "cooldownMs", mode: "add", perLevel: -16 }
  },
  {
    id: "surge_lattice",
    name: "Surge Lattice",
    kind: "upgrade",
    description: "Small all-round scaling for late game.",
    maxLevel: 3,
    costs: [90, 170, 285],
    effect: { stat: "damageMultiplier", mode: "mult", perLevel: 0.06 }
  }
];

export const ITEMS_BY_ID = Object.fromEntries(ITEMS.map((item) => [item.id, item]));
