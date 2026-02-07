import { MAX_FRAME_SECONDS, STEP_SECONDS } from "../config.js";

export class Engine {
  constructor({ update, render, stepSeconds = STEP_SECONDS, maxFrameSeconds = MAX_FRAME_SECONDS, now = () => performance.now() }) {
    this.update = update;
    this.render = render;
    this.stepSeconds = stepSeconds;
    this.maxFrameSeconds = maxFrameSeconds;
    this.now = now;

    this.accumulator = 0;
    this.lastTimestamp = null;
    this.running = false;
    this.rafId = null;

    this.boundFrame = this.frame.bind(this);
  }

  frame(timestampMs = this.now()) {
    if (this.lastTimestamp === null) {
      this.lastTimestamp = timestampMs;
      this.render(0);
      return { steps: 0, alpha: 0, frameTimeSeconds: 0 };
    }

    let frameTimeSeconds = (timestampMs - this.lastTimestamp) / 1000;
    this.lastTimestamp = timestampMs;

    if (frameTimeSeconds > this.maxFrameSeconds) {
      frameTimeSeconds = this.maxFrameSeconds;
    }

    this.accumulator += frameTimeSeconds;
    let steps = 0;

    while (this.accumulator >= this.stepSeconds) {
      this.update(this.stepSeconds);
      this.accumulator -= this.stepSeconds;
      steps += 1;
    }

    const alpha = this.accumulator / this.stepSeconds;
    this.render(alpha);

    return { steps, alpha, frameTimeSeconds };
  }

  start() {
    if (this.running) {
      return;
    }
    this.running = true;
    this.lastTimestamp = null;

    const loop = (timestamp) => {
      if (!this.running) {
        return;
      }
      this.frame(timestamp);
      this.rafId = requestAnimationFrame(loop);
    };

    this.rafId = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
}
