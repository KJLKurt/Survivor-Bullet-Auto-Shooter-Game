import { clampMagnitude, normalize } from "../utils/vector.js";

function getTouchById(touchList, identifier) {
  for (const touch of touchList) {
    if (touch.identifier === identifier) {
      return touch;
    }
  }
  return null;
}

function computePadVector(touch, pad, maxRadiusPx) {
  const rect = pad.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const offset = {
    x: touch.clientX - cx,
    y: touch.clientY - cy
  };
  const clamped = clampMagnitude(offset, maxRadiusPx);
  return {
    x: clamped.x / maxRadiusPx,
    y: clamped.y / maxRadiusPx
  };
}

function applyDeadzone(vector, deadzone) {
  const magnitude = Math.hypot(vector.x, vector.y);
  if (magnitude <= deadzone) {
    return { x: 0, y: 0 };
  }

  const direction = normalize(vector);
  const adjustedMagnitude = (magnitude - deadzone) / (1 - deadzone);
  return {
    x: direction.x * adjustedMagnitude,
    y: direction.y * adjustedMagnitude
  };
}

function setKnob(knob, vector, maxRadiusPx) {
  const px = vector.x * maxRadiusPx;
  const py = vector.y * maxRadiusPx;
  knob.style.transform = `translate(${px}px, ${py}px)`;
}

function resetKnob(knob) {
  knob.style.transform = "translate(0px, 0px)";
}

export class InputController {
  constructor({ canvas, movePad, moveKnob, aimPad, aimKnob }) {
    this.canvas = canvas;
    this.movePad = movePad;
    this.moveKnob = moveKnob;
    this.aimPad = aimPad;
    this.aimKnob = aimKnob;

    this.keyboard = new Set();
    this.mouseAim = { x: 0, y: -1 };
    this.touchMove = { x: 0, y: 0 };
    this.touchAim = { x: 0, y: 0 };
    this.hasAim = false;

    this.moveTouchId = null;
    this.aimTouchId = null;
    this.aimTapStart = null;
    this.shootRequested = false;
    this.moveDeadzone = 0.14;
    this.aimDeadzone = 0.08;

    this.playerScreenPos = { x: canvas.width / 2, y: canvas.height / 2 };

    this.handleKeyDown = this.onKeyDown.bind(this);
    this.handleKeyUp = this.onKeyUp.bind(this);
    this.handleMouseMove = this.onMouseMove.bind(this);
    this.handleMouseDown = this.onMouseDown.bind(this);

    this.handleMoveStart = this.onMoveTouchStart.bind(this);
    this.handleMoveMove = this.onMoveTouchMove.bind(this);
    this.handleMoveEnd = this.onMoveTouchEnd.bind(this);

    this.handleAimStart = this.onAimTouchStart.bind(this);
    this.handleAimMove = this.onAimTouchMove.bind(this);
    this.handleAimEnd = this.onAimTouchEnd.bind(this);

    this.attach();
  }

  attach() {
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
    this.canvas.addEventListener("mousemove", this.handleMouseMove);
    this.canvas.addEventListener("mousedown", this.handleMouseDown);

    this.movePad.addEventListener("touchstart", this.handleMoveStart, { passive: false });
    this.movePad.addEventListener("touchmove", this.handleMoveMove, { passive: false });
    this.movePad.addEventListener("touchend", this.handleMoveEnd, { passive: false });
    this.movePad.addEventListener("touchcancel", this.handleMoveEnd, { passive: false });

    this.aimPad.addEventListener("touchstart", this.handleAimStart, { passive: false });
    this.aimPad.addEventListener("touchmove", this.handleAimMove, { passive: false });
    this.aimPad.addEventListener("touchend", this.handleAimEnd, { passive: false });
    this.aimPad.addEventListener("touchcancel", this.handleAimEnd, { passive: false });
  }

  destroy() {
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
    this.canvas.removeEventListener("mousemove", this.handleMouseMove);
    this.canvas.removeEventListener("mousedown", this.handleMouseDown);

    this.movePad.removeEventListener("touchstart", this.handleMoveStart);
    this.movePad.removeEventListener("touchmove", this.handleMoveMove);
    this.movePad.removeEventListener("touchend", this.handleMoveEnd);
    this.movePad.removeEventListener("touchcancel", this.handleMoveEnd);

    this.aimPad.removeEventListener("touchstart", this.handleAimStart);
    this.aimPad.removeEventListener("touchmove", this.handleAimMove);
    this.aimPad.removeEventListener("touchend", this.handleAimEnd);
    this.aimPad.removeEventListener("touchcancel", this.handleAimEnd);
  }

  onKeyDown(event) {
    const key = event.key.toLowerCase();
    this.keyboard.add(key);
    if (key === " ") {
      event.preventDefault();
      this.shootRequested = true;
    }
  }

  onKeyUp(event) {
    this.keyboard.delete(event.key.toLowerCase());
  }

  onMouseMove(event) {
    const rect = this.canvas.getBoundingClientRect();
    const cursor = {
      x: (event.clientX - rect.left) * (this.canvas.width / rect.width),
      y: (event.clientY - rect.top) * (this.canvas.height / rect.height)
    };
    this.mouseAim = normalize({
      x: cursor.x - this.playerScreenPos.x,
      y: cursor.y - this.playerScreenPos.y
    });
    if (this.mouseAim.x || this.mouseAim.y) {
      this.hasAim = true;
    }
  }

  onMouseDown() {
    this.shootRequested = true;
  }

  onMoveTouchStart(event) {
    if (this.moveTouchId !== null) {
      return;
    }
    const touch = event.changedTouches[0];
    this.moveTouchId = touch.identifier;
    this.onMoveTouchMove(event);
  }

  onMoveTouchMove(event) {
    if (this.moveTouchId === null) {
      return;
    }
    event.preventDefault();
    const touch = getTouchById(event.touches, this.moveTouchId);
    if (!touch) {
      return;
    }

    const radius = this.movePad.clientWidth * 0.34;
    this.touchMove = applyDeadzone(computePadVector(touch, this.movePad, radius), this.moveDeadzone);
    setKnob(this.moveKnob, this.touchMove, radius);
  }

  onMoveTouchEnd(event) {
    if (this.moveTouchId === null) {
      return;
    }
    const ended = getTouchById(event.changedTouches, this.moveTouchId);
    if (!ended) {
      return;
    }
    this.moveTouchId = null;
    this.touchMove = { x: 0, y: 0 };
    resetKnob(this.moveKnob);
  }

  onAimTouchStart(event) {
    if (this.aimTouchId !== null) {
      return;
    }
    const touch = event.changedTouches[0];
    this.aimTouchId = touch.identifier;
    this.aimTapStart = { x: touch.clientX, y: touch.clientY };
  }

  onAimTouchMove(event) {
    if (this.aimTouchId === null) {
      return;
    }
    event.preventDefault();
    const touch = getTouchById(event.touches, this.aimTouchId);
    if (!touch) {
      return;
    }

    const radius = this.aimPad.clientWidth * 0.34;
    this.touchAim = applyDeadzone(computePadVector(touch, this.aimPad, radius), this.aimDeadzone);
    const normalAim = normalize(this.touchAim);
    if (normalAim.x || normalAim.y) {
      this.touchAim = normalAim;
      this.hasAim = true;
    }
    setKnob(this.aimKnob, this.touchAim, radius);
  }

  onAimTouchEnd(event) {
    if (this.aimTouchId === null) {
      return;
    }
    const touch = getTouchById(event.changedTouches, this.aimTouchId);
    if (!touch) {
      return;
    }

    const movedDistance = this.aimTapStart
      ? Math.hypot(touch.clientX - this.aimTapStart.x, touch.clientY - this.aimTapStart.y)
      : 0;

    if (movedDistance < 14) {
      this.shootRequested = true;
    }

    this.aimTouchId = null;
    this.aimTapStart = null;
    resetKnob(this.aimKnob);
  }

  setPlayerScreenPosition(x, y) {
    this.playerScreenPos = { x, y };
  }

  getMovementVector() {
    if (this.moveTouchId !== null) {
      return normalize(this.touchMove);
    }

    const x = (this.keyboard.has("d") || this.keyboard.has("arrowright") ? 1 : 0) - (this.keyboard.has("a") || this.keyboard.has("arrowleft") ? 1 : 0);
    const y = (this.keyboard.has("s") || this.keyboard.has("arrowdown") ? 1 : 0) - (this.keyboard.has("w") || this.keyboard.has("arrowup") ? 1 : 0);
    return normalize({ x, y });
  }

  getAimVector() {
    if (this.aimTouchId !== null || (this.touchAim.x || this.touchAim.y)) {
      return normalize(this.touchAim);
    }
    if (this.hasAim) {
      return normalize(this.mouseAim);
    }
    return { x: 0, y: 0 };
  }

  consumeShootRequested() {
    if (!this.shootRequested) {
      return false;
    }
    this.shootRequested = false;
    return true;
  }
}
