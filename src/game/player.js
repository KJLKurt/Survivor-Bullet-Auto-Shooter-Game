import { makeSpread } from './projectile.js';

export const WEAPONS = {
  pistol: { id:'pistol', name:'Pistol', cooldownMs:380, projectileSpeed:340, damage:10, spreadDegrees:4, projectilesPerShot:1, special:{} },
  smg: { id:'smg', name:'SMG', cooldownMs:180, projectileSpeed:320, damage:6, spreadDegrees:8, projectilesPerShot:1, special:{} },
  shotgun: { id:'shotgun', name:'Shotgun', cooldownMs:700, projectileSpeed:280, damage:7, spreadDegrees:28, projectilesPerShot:5, special:{} },
  sniper: { id:'sniper', name:'Sniper', cooldownMs:900, projectileSpeed:520, damage:24, spreadDegrees:1, projectilesPerShot:1, special:{piercing:true} },
  turretgun: { id:'turretgun', name:'Turret Blaster', cooldownMs:420, projectileSpeed:300, damage:11, spreadDegrees:12, projectilesPerShot:2, special:{} },
  healpistol: { id:'healpistol', name:'Medic Sidearm', cooldownMs:360, projectileSpeed:320, damage:9, spreadDegrees:5, projectilesPerShot:1, special:{healOnHit:0.02} },
  sawblade: { id:'sawblade', name:'Sawblade', cooldownMs:300, projectileSpeed:250, damage:13, spreadDegrees:15, projectilesPerShot:2, special:{} },
  burst: { id:'burst', name:'Burst Rifle', cooldownMs:420, projectileSpeed:370, damage:8, spreadDegrees:10, projectilesPerShot:3, special:{} },
  grenade: { id:'grenade', name:'Grenade Launcher', cooldownMs:1000, projectileSpeed:240, damage:18, spreadDegrees:4, projectilesPerShot:1, special:{explosive:0.2} },
  phase: { id:'phase', name:'Phase Shot', cooldownMs:340, projectileSpeed:360, damage:11, spreadDegrees:6, projectilesPerShot:1, special:{piercing:true} }
};

export class Player {
  constructor(character) {
    this.character = character;
    this.stats = { ...character.baseStats };
    this.maxHealth = this.stats.maxHealth;
    this.health = this.maxHealth;
    this.x = 240; this.y = 680;
    this.weapon = { ...WEAPONS[character.startingWeaponId] };
    this.cooldown = 0;
    this.specialCooldown = 0;
    this.coinRadius = 16;
  }

  applyUpgrade(delta) {
    Object.entries(delta).forEach(([k, v]) => {
      if (k === 'cooldownMult') this.weapon.cooldownMs = Math.max(80, this.weapon.cooldownMs * (1 + v));
      else if (k in this.weapon) this.weapon[k] += v;
      else if (k in this.stats) this.stats[k] += v;
      else this[k] = (this[k] || 0) + v;
    });
    this.maxHealth = this.stats.maxHealth;
  }

  update(dt, input, bounds) {
    this.cooldown = Math.max(0, this.cooldown - dt * 1000);
    this.specialCooldown = Math.max(0, this.specialCooldown - dt * 1000);
    this.health = Math.min(this.maxHealth, this.health + this.stats.healthRegen * dt);
    this.x = Math.max(0, Math.min(bounds.width, this.x + input.moveX * this.stats.speed * dt));
    this.y = Math.max(0, Math.min(bounds.height, this.y + input.moveY * this.stats.speed * dt));
  }

  shoot(angle = -Math.PI / 2) {
    if (this.cooldown > 0) return [];
    this.cooldown = this.weapon.cooldownMs;
    return makeSpread({ x: this.x, y: this.y }, angle, this.weapon.projectilesPerShot, this.weapon.projectileSpeed, this.weapon.spreadDegrees, {
      damage: this.stats.baseDamage + this.weapon.damage,
      friendly: true,
      special: this.weapon.special
    });
  }

  takeDamage(damage) {
    const reduced = damage * (1 - this.stats.armor);
    this.health -= reduced;
    return reduced;
  }
}
