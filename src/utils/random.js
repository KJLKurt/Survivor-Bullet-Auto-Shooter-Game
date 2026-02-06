export function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

export function randomChoice(list) {
  return list[Math.floor(Math.random() * list.length)];
}

export function chance(probability) {
  return Math.random() < probability;
}
