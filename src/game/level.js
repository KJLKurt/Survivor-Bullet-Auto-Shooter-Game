import { LIMITS } from "../config.js";

export function createLevelRuntime(level) {
  return {
    elapsedSeconds: 0,
    spawnAccumulator: 0,
    completed: false,
    completionAnnounced: false,
    level
  };
}

function getActiveWave(level, elapsedSeconds) {
  return level.waves.find((wave) => elapsedSeconds >= wave.start && elapsedSeconds < wave.end) ?? level.waves[level.waves.length - 1];
}

export function updateLevel(runtime, state, dtSeconds, spawnEnemy) {
  if (runtime.completed) {
    return;
  }

  runtime.elapsedSeconds += dtSeconds;
  runtime.spawnAccumulator += dtSeconds;

  const wave = getActiveWave(runtime.level, runtime.elapsedSeconds);
  const spawnEvery = runtime.level.spawnIntervalSeconds * (wave.spawnMultiplier ?? 1);

  while (runtime.spawnAccumulator >= spawnEvery) {
    runtime.spawnAccumulator -= spawnEvery;

    if (state.enemies.length >= LIMITS.MAX_ENEMIES) {
      break;
    }

    spawnEnemy(wave.type, wave.pattern, runtime.level.difficulty);
  }

  if (runtime.elapsedSeconds >= runtime.level.durationSeconds) {
    runtime.completed = true;
  }
}
