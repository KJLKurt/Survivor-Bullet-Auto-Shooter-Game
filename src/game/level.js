import { GAME_CONFIG } from '../config.js';
import { getLevelById } from '../data/levels.js';
import { SpawnManager } from './enemy.js';

export default class LevelController {
  constructor(levelId) {
    this.level = getLevelById(levelId);
    this.spawnManager = new SpawnManager(this.level.spawnPatterns);
    this.elapsedSec = 0;
  }

  update(dt) {
    this.elapsedSec += dt;
    const spawned = this.spawnManager.update(this.elapsedSec, this.level.arenaSize);
    return spawned;
  }

  getArenaBounds(canvasWidth, canvasHeight) {
    return {
      width: canvasWidth,
      height: canvasHeight,
      padding: GAME_CONFIG.arenaPadding
    };
  }

  isComplete() {
    return this.elapsedSec >= GAME_CONFIG.runDurationSec;
  }
}
