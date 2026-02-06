export function createInput(canvas, joystick, shootBtn, specialBtn) {
  const state = { moveX: 0, moveY: 0, shooting: false, special: false };
  const keys = new Set();

  const updateFromKeys = () => {
    state.moveX = (keys.has('ArrowRight') || keys.has('d') ? 1 : 0) - (keys.has('ArrowLeft') || keys.has('a') ? 1 : 0);
    state.moveY = (keys.has('ArrowDown') || keys.has('s') ? 1 : 0) - (keys.has('ArrowUp') || keys.has('w') ? 1 : 0);
    state.shooting = keys.has(' ');
  };

  window.addEventListener('keydown', (e) => { keys.add(e.key); updateFromKeys(); });
  window.addEventListener('keyup', (e) => { keys.delete(e.key); updateFromKeys(); });

  const joyBase = () => joystick.getBoundingClientRect();
  const onJoy = (clientX, clientY) => {
    const r = joyBase();
    const cx = r.left + r.width / 2; const cy = r.top + r.height / 2;
    const dx = (clientX - cx) / (r.width / 2); const dy = (clientY - cy) / (r.height / 2);
    const mag = Math.max(1, Math.hypot(dx, dy));
    state.moveX = dx / mag; state.moveY = dy / mag;
  };
  joystick.addEventListener('pointerdown', (e) => { joystick.setPointerCapture(e.pointerId); onJoy(e.clientX, e.clientY); });
  joystick.addEventListener('pointermove', (e) => { if (e.pressure > 0) onJoy(e.clientX, e.clientY); });
  joystick.addEventListener('pointerup', () => { state.moveX = 0; state.moveY = 0; });

  shootBtn.addEventListener('pointerdown', () => { state.shooting = true; });
  shootBtn.addEventListener('pointerup', () => { state.shooting = false; });
  specialBtn.addEventListener('pointerdown', () => { state.special = true; setTimeout(() => { state.special = false; }, 50); });

  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  return state;
}
