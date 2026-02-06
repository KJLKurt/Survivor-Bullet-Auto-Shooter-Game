import { GAME_CONFIG } from '../config.js';

export function advanceAccumulator(accumulator, deltaSec, stepSec, maxUpdates = GAME_CONFIG.maxStepUpdates) {
  const cappedDelta = Math.min(deltaSec, 0.25);
  let nextAccumulator = accumulator + cappedDelta;
  let steps = 0;

  while (nextAccumulator >= stepSec && steps < maxUpdates) {
    nextAccumulator -= stepSec;
    steps += 1;
  }

  // If the frame is too far behind, drop remaining lag to avoid spiral-of-death.
  if (steps === maxUpdates && nextAccumulator >= stepSec) {
    nextAccumulator = 0;
  }

  return { accumulator: nextAccumulator, steps };
}

export default class GameEngine {
  constructor({ update, render, stepSec = GAME_CONFIG.fixedStepSec, maxUpdates = GAME_CONFIG.maxStepUpdates }) {
    this.update = update;
    this.render = render;
    this.stepSec = stepSec;
    this.maxUpdates = maxUpdates;

    this.running = false;
    this.lastTime = 0;
    this.accumulator = 0;
    this.rafId = 0;

    this.tick = this.tick.bind(this);
  }

  start() {
    if (this.running) {
      return;
    }
    this.running = true;
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop() {
    this.running = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  }

  runFrame(deltaSec) {
    const result = advanceAccumulator(this.accumulator, deltaSec, this.stepSec, this.maxUpdates);
    this.accumulator = result.accumulator;

    for (let index = 0; index < result.steps; index += 1) {
      this.update(this.stepSec);
    }

    const alpha = this.accumulator / this.stepSec;
    this.render(alpha);
    return result.steps;
  }

  tick(nowMs) {
    if (!this.running) {
      return;
    }

    const deltaSec = (nowMs - this.lastTime) / 1000;
    this.lastTime = nowMs;
    this.runFrame(deltaSec);
    this.rafId = requestAnimationFrame(this.tick);
  }
}
