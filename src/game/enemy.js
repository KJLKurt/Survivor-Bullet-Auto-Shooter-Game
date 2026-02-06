import { GAME_CONFIG } from '../config.js';
import { normalize } from '../utils/vector.js';
import { randomInRange } from '../utils/random.js';

const ENEMY_ARCHETYPES = {
  grunt: {
    hp: 35,
    speed: 80,
    size: GAME_CONFIG.sizes.enemySmall,
    scoreValue: 35,
    bulletDamage: 8,
    fireCooldownMs: 2100,
    color: GAME_CONFIG.palette.enemy
  },
  runner: {
    hp: 22,
    speed: 120,
    size: GAME_CONFIG.sizes.enemySmall,
    scoreValue: 28,
    bulletDamage: 6,
    fireCooldownMs: 1650,
    color: GAME_CONFIG.palette.enemyFast
  },
  tankette: {
    hp: 70,
    speed: 62,
    size: GAME_CONFIG.sizes.enemyMedium,
    scoreValue: 60,
    bulletDamage: 10,
    fireCooldownMs: 2400,
    color: GAME_CONFIG.palette.enemyTank
  },
  miniBoss: {
    hp: 230,
    speed: 55,
    size: 34,
    scoreValue: 190,
    bulletDamage: 13,
    fireCooldownMs: 1400,
    color: '#ff5f9d'
  },
  boss: {
    hp: 420,
    speed: 45,
    size: GAME_CONFIG.sizes.enemyLarge,
    scoreValue: 420,
    bulletDamage: 16,
    fireCooldownMs: 980,
    color: GAME_CONFIG.palette.enemyBoss
  }
};

let enemyId = 1;

export class Enemy {
  constructor({ x, y, type, bulletPattern }) {
    const base = ENEMY_ARCHETYPES[type] || ENEMY_ARCHETYPES.grunt;
    this.id = enemyId += 1;
    this.type = type;
    this.bulletPattern = bulletPattern;

    this.x = x;
    this.y = y;
    this.hp = base.hp;
    this.maxHp = base.hp;
    this.speed = base.speed;
    this.size = base.size;
    this.scoreValue = base.scoreValue;
    this.bulletDamage = base.bulletDamage;
    this.fireCooldownMs = base.fireCooldownMs;
    this.color = base.color;

    this.lastFiredAt = 0;
    this.dead = false;
  }

  update(dt, player, elapsedSec) {
    const direction = normalize(player.x - this.x, player.y - this.y);
    const wobble = this.type === 'runner' ? Math.sin(elapsedSec * 8 + this.id) * 0.5 : 0;
    this.x += (direction.x + wobble) * this.speed * dt;
    this.y += direction.y * this.speed * dt;
  }

  shouldFire(nowMs) {
    return nowMs - this.lastFiredAt >= this.fireCooldownMs;
  }

  onFire(nowMs) {
    this.lastFiredAt = nowMs;
  }

  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.dead = true;
      return true;
    }
    return false;
  }
}

function randomEdgeSpawn(arena) {
  const side = Math.floor(Math.random() * 4);
  const margin = 10;
  switch (side) {
    case 0:
      return { x: randomInRange(margin, arena.width - margin), y: -margin };
    case 1:
      return { x: arena.width + margin, y: randomInRange(margin, arena.height - margin) };
    case 2:
      return { x: randomInRange(margin, arena.width - margin), y: arena.height + margin };
    default:
      return { x: -margin, y: randomInRange(margin, arena.height - margin) };
  }
}

export class SpawnManager {
  constructor(spawnPatterns) {
    this.patterns = spawnPatterns.map((pattern) => ({ ...pattern, nextSpawnAt: pattern.startSec }));
  }

  update(elapsedSec, arena) {
    const spawned = [];

    this.patterns.forEach((pattern) => {
      if (elapsedSec < pattern.startSec || elapsedSec > pattern.endSec) {
        return;
      }

      if (elapsedSec >= pattern.nextSpawnAt) {
        for (let index = 0; index < pattern.count; index += 1) {
          const spawnPoint = randomEdgeSpawn(arena);
          spawned.push(new Enemy({
            x: spawnPoint.x,
            y: spawnPoint.y,
            type: pattern.enemyType,
            bulletPattern: pattern.bulletPattern
          }));
        }
        pattern.nextSpawnAt += pattern.intervalSec;
      }
    });

    return spawned;
  }
}

export function getEnemyArchetypes() {
  return ENEMY_ARCHETYPES;
}
