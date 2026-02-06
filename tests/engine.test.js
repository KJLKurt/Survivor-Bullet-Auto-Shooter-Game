import { describe, expect, it, vi } from 'vitest';
import GameEngine, { advanceAccumulator } from '../src/game/engine.js';

describe('advanceAccumulator', () => {
  it('converts accumulated delta into fixed steps', () => {
    const result = advanceAccumulator(0, 1 / 30, 1 / 60, 10);
    expect(result.steps).toBe(2);
    expect(result.accumulator).toBeCloseTo(0);
  });

  it('caps runaway updates and drops excess lag', () => {
    const result = advanceAccumulator(0, 1, 1 / 60, 3);
    expect(result.steps).toBe(3);
    expect(result.accumulator).toBe(0);
  });
});

describe('GameEngine', () => {
  it('runs update callback for each fixed step and renders once', () => {
    const update = vi.fn();
    const render = vi.fn();
    const engine = new GameEngine({ update, render, stepSec: 1 / 60, maxUpdates: 10 });

    const steps = engine.runFrame(1 / 20);
    expect(steps).toBe(3);
    expect(update).toHaveBeenCalledTimes(3);
    expect(render).toHaveBeenCalledTimes(1);
  });
});
