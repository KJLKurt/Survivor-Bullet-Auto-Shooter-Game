export function vec(x = 0, y = 0) {
  return { x, y };
}

export function add(a, b) {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function subtract(a, b) {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function scale(v, factor) {
  return { x: v.x * factor, y: v.y * factor };
}

export function length(v) {
  return Math.hypot(v.x, v.y);
}

export function normalize(v) {
  const len = length(v);
  if (!len) {
    return { x: 0, y: 0 };
  }
  return { x: v.x / len, y: v.y / len };
}

export function clampMagnitude(v, maxLength) {
  const len = length(v);
  if (!len || len <= maxLength) {
    return { x: v.x, y: v.y };
  }
  const ratio = maxLength / len;
  return { x: v.x * ratio, y: v.y * ratio };
}

export function lerp(a, b, alpha) {
  return a + (b - a) * alpha;
}

export function lerpVec(a, b, alpha) {
  return {
    x: lerp(a.x, b.x, alpha),
    y: lerp(a.y, b.y, alpha)
  };
}

export function fromAngle(radians) {
  return { x: Math.cos(radians), y: Math.sin(radians) };
}

export function angleOf(v) {
  return Math.atan2(v.y, v.x);
}
