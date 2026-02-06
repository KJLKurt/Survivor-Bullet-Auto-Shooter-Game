const lv = (costs, deltas) => costs.map((cost, i) => ({ level:i+1, cost, delta:deltas[i] }));
export const ITEMS = [
  { id:'plating', name:'Reinforced Plating', description:'Increase max health.', type:'playerBoost', levels:lv([80,120,180,260],[{maxHealth:20},{maxHealth:16},{maxHealth:14},{maxHealth:12}]) },
  { id:'boots', name:'Lightweight Boots', description:'Increase movement speed.', type:'playerBoost', levels:lv([70,110,160,230],[{speed:18},{speed:14},{speed:10},{speed:8}]) },
  { id:'autoload', name:'Auto-Loader', description:'Reduce weapon cooldown.', type:'weaponUpgrade', levels:lv([90,140,200,280],[{cooldownMult:-0.08},{cooldownMult:-0.06},{cooldownMult:-0.05},{cooldownMult:-0.04}]) },
  { id:'hvr', name:'High-Velocity Rounds', description:'Boost projectile speed.', type:'weaponUpgrade', levels:lv([70,110,150],[{projectileSpeed:45},{projectileSpeed:35},{projectileSpeed:25}]) },
  { id:'pierce', name:'Piercing Rounds', description:'Chance to pierce enemies.', type:'weaponUpgrade', levels:lv([100,160,240],[{piercingChance:0.1},{piercingChance:0.08},{piercingChance:0.06}]) },
  { id:'rapid', name:'Rapid Fire Mod', description:'Fire additional projectiles.', type:'weaponUpgrade', levels:lv([130,220,360],[{projectilesPerShot:1},{cooldownMult:-0.05},{spreadDegrees:3}]) },
  { id:'nanoheal', name:'Nano-Healer', description:'Heal slowly in combat.', type:'passive', levels:lv([120,180,260,340],[{healthRegen:0.2},{healthRegen:0.2},{healthRegen:0.15},{healthRegen:0.15}]) },
  { id:'magnet', name:'Coin Magnet', description:'Increase coin pickup radius.', type:'passive', levels:lv([80,130,190],[{coinRadius:18},{coinRadius:14},{coinRadius:10}]) },
  { id:'shield', name:'Shield Generator', description:'Periodic damage shield.', type:'passive', levels:lv([150,240,360],[{shield:18},{shield:14},{shield:12}]) },
  { id:'explosive', name:'Explosive Rounds', description:'Add area damage.', type:'weaponUpgrade', levels:lv([140,240,380],[{explosive:0.12},{explosive:0.1},{explosive:0.08}]) },
  { id:'critical', name:'Critical Tuner', description:'Increase crit chance.', type:'passive', levels:lv([100,170,250,330],[{critChance:0.05},{critChance:0.04},{critChance:0.03},{critDamage:0.2}]) },
  { id:'reserve', name:'Ammo Reserve', description:'Smoother sustained fire.', type:'passive', levels:lv([90,150,220],[{cooldownMult:-0.04},{cooldownMult:-0.03},{cooldownMult:-0.03}]) }
];
