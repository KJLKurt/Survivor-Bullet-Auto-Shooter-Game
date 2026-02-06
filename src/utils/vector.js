export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function length(x, y) {
  return Math.hypot(x, y);
}

export function normalize(x, y) {
  const len = length(x, y);
  if (!len) {
    return { x: 0, y: 0 };
  }
  return { x: x / len, y: y / len };
}

export function scale(v, scalar) {
  return { x: v.x * scalar, y: v.y * scalar };
}

export function add(a, b) {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function fromAngle(radians) {
  return { x: Math.cos(radians), y: Math.sin(radians) };
}

export function angleFrom(a, b) {
  return Math.atan2(b.y - a.y, b.x - a.x);
}

export function rotate(v, radians) {
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return { x: v.x * cos - v.y * sin, y: v.x * sin + v.y * cos };
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}
