import { GAME_CONFIG } from '../config.js';
import { clamp, normalize } from '../utils/vector.js';

export default class InputController {
  constructor({ canvas, joystickZone, joystickKnob, shootButton, specialButton }) {
    this.canvas = canvas;
    this.joystickZone = joystickZone;
    this.joystickKnob = joystickKnob;
    this.shootButton = shootButton;
    this.specialButton = specialButton;

    this.moveVector = { x: 0, y: 0 };
    this.lookVector = { x: 0, y: -1 };
    this.keyboard = new Set();
    this.shooting = false;
    this.specialQueued = false;

    this.joystickPointerId = null;
    this.joystickCenter = { x: 0, y: 0 };

    this.boundKeyDown = (event) => this.onKeyDown(event);
    this.boundKeyUp = (event) => this.onKeyUp(event);
    this.boundMouseMove = (event) => this.onMouseMove(event);
  }

  attach() {
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);
    window.addEventListener('mousemove', this.boundMouseMove);

    this.shootButton.addEventListener('pointerdown', () => {
      this.shooting = true;
    });
    this.shootButton.addEventListener('pointerup', () => {
      this.shooting = false;
    });
    this.shootButton.addEventListener('pointercancel', () => {
      this.shooting = false;
    });

    this.specialButton.addEventListener('pointerdown', () => {
      this.specialQueued = true;
    });

    this.joystickZone.addEventListener('pointerdown', (event) => this.onJoystickDown(event));
    this.joystickZone.addEventListener('pointermove', (event) => this.onJoystickMove(event));
    this.joystickZone.addEventListener('pointerup', (event) => this.onJoystickUp(event));
    this.joystickZone.addEventListener('pointercancel', (event) => this.onJoystickUp(event));
  }

  destroy() {
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
    window.removeEventListener('mousemove', this.boundMouseMove);
  }

  onKeyDown(event) {
    this.keyboard.add(event.key.toLowerCase());
    if (event.key === ' ') {
      this.shooting = true;
      event.preventDefault();
    }
    if (event.key.toLowerCase() === 'x' || event.key === 'Shift') {
      this.specialQueued = true;
    }
  }

  onKeyUp(event) {
    this.keyboard.delete(event.key.toLowerCase());
    if (event.key === ' ') {
      this.shooting = false;
    }
  }

  onMouseMove(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const center = { x: rect.width / 2, y: rect.height / 2 };
    this.lookVector = normalize(x - center.x, y - center.y);
  }

  onJoystickDown(event) {
    this.joystickPointerId = event.pointerId;
    this.joystickZone.setPointerCapture(event.pointerId);
    const rect = this.joystickZone.getBoundingClientRect();
    this.joystickCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    this.onJoystickMove(event);
  }

  onJoystickMove(event) {
    if (event.pointerId !== this.joystickPointerId) {
      return;
    }

    const dx = event.clientX - this.joystickCenter.x;
    const dy = event.clientY - this.joystickCenter.y;
    const radius = GAME_CONFIG.controls.joystickRadius;
    const nx = clamp(dx / radius, -1, 1);
    const ny = clamp(dy / radius, -1, 1);
    const normalized = normalize(nx, ny);
    const magnitude = Math.min(1, Math.hypot(nx, ny));

    this.moveVector = {
      x: normalized.x * magnitude,
      y: normalized.y * magnitude
    };

    this.joystickKnob.style.transform = `translate(${this.moveVector.x * radius * 0.55}px, ${this.moveVector.y * radius * 0.55}px)`;
  }

  onJoystickUp(event) {
    if (event.pointerId !== this.joystickPointerId) {
      return;
    }

    this.joystickPointerId = null;
    this.moveVector = { x: 0, y: 0 };
    this.joystickKnob.style.transform = 'translate(0, 0)';
  }

  getMovement() {
    let x = this.moveVector.x;
    let y = this.moveVector.y;

    if (this.keyboard.has('a') || this.keyboard.has('arrowleft')) {
      x -= 1;
    }
    if (this.keyboard.has('d') || this.keyboard.has('arrowright')) {
      x += 1;
    }
    if (this.keyboard.has('w') || this.keyboard.has('arrowup')) {
      y -= 1;
    }
    if (this.keyboard.has('s') || this.keyboard.has('arrowdown')) {
      y += 1;
    }

    const result = normalize(x, y);
    if (Math.hypot(x, y) < GAME_CONFIG.controls.deadzone) {
      return { x: 0, y: 0 };
    }

    return result;
  }

  getLookDirection(fallbackDirection = { x: 0, y: -1 }) {
    if (this.lookVector.x === 0 && this.lookVector.y === 0) {
      return fallbackDirection;
    }
    return this.lookVector;
  }

  isShooting() {
    return this.shooting;
  }

  consumeSpecial() {
    const queued = this.specialQueued;
    this.specialQueued = false;
    return queued;
  }
}
