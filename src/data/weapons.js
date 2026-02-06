export const WEAPONS = [
  {
    id: 'pistol',
    name: 'Sidearm Pistol',
    cooldownMs: 420,
    projectileSpeed: 420,
    damage: 14,
    spreadDegrees: 0,
    projectilesPerShot: 1,
    special: 'none'
  },
  {
    id: 'smg',
    name: 'Street SMG',
    cooldownMs: 150,
    projectileSpeed: 450,
    damage: 6,
    spreadDegrees: 8,
    projectilesPerShot: 1,
    special: 'none'
  },
  {
    id: 'shotgun',
    name: 'Pump Shotgun',
    cooldownMs: 760,
    projectileSpeed: 340,
    damage: 9,
    spreadDegrees: 28,
    projectilesPerShot: 5,
    special: 'none'
  },
  {
    id: 'sniper',
    name: 'Needle Rifle',
    cooldownMs: 980,
    projectileSpeed: 620,
    damage: 36,
    spreadDegrees: 0,
    projectilesPerShot: 1,
    special: 'piercing'
  },
  {
    id: 'turret_blaster',
    name: 'Engineer Blaster',
    cooldownMs: 340,
    projectileSpeed: 410,
    damage: 11,
    spreadDegrees: 6,
    projectilesPerShot: 2,
    special: 'none'
  },
  {
    id: 'medic_pistol',
    name: 'Medic Burst',
    cooldownMs: 380,
    projectileSpeed: 430,
    damage: 10,
    spreadDegrees: 4,
    projectilesPerShot: 1,
    special: 'healBoost'
  },
  {
    id: 'cleaver',
    name: 'Rage Cleaver',
    cooldownMs: 320,
    projectileSpeed: 250,
    damage: 20,
    spreadDegrees: 14,
    projectilesPerShot: 1,
    special: 'shortRange'
  },
  {
    id: 'burst_rifle',
    name: 'Scout Burst',
    cooldownMs: 510,
    projectileSpeed: 500,
    damage: 9,
    spreadDegrees: 9,
    projectilesPerShot: 3,
    special: 'none'
  },
  {
    id: 'grenade_launcher',
    name: 'Arc Launcher',
    cooldownMs: 940,
    projectileSpeed: 300,
    damage: 30,
    spreadDegrees: 5,
    projectilesPerShot: 1,
    special: 'explosive'
  },
  {
    id: 'phantom_blade',
    name: 'Ghost Chakram',
    cooldownMs: 540,
    projectileSpeed: 470,
    damage: 15,
    spreadDegrees: 12,
    projectilesPerShot: 2,
    special: 'piercing'
  }
];

export function getWeaponById(id) {
  return WEAPONS.find((weapon) => weapon.id === id) || WEAPONS[0];
}
