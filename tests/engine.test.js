import { describe, expect, it, vi } from "vitest";
import { Engine } from "../src/game/engine.js";

describe("Engine fixed timestep", () => {
  it("accumulates and executes fixed steps deterministically", () => {
    const update = vi.fn();
    const render = vi.fn();
    const engine = new Engine({ update, render });

    engine.frame(0);
    engine.frame(10);

    expect(update).toHaveBeenCalledTimes(0);
    expect(render).toHaveBeenLastCalledWith(expect.closeTo(0.6, 3));

    engine.frame(20);

    expect(update).toHaveBeenCalledTimes(1);
    expect(render).toHaveBeenLastCalledWith(expect.closeTo(0.2, 2));
  });

  it("clamps long frame time to max frame", () => {
    const update = vi.fn();
    const render = vi.fn();
    const engine = new Engine({ update, render });

    engine.frame(0);
    const result = engine.frame(100);

    expect(result.frameTimeSeconds).toBe(0.05);
    expect(update).toHaveBeenCalledTimes(3);
    expect(render).toHaveBeenCalled();
  });
});
