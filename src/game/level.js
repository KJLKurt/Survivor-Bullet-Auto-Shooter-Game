import { LEVELS } from '../data/levels.js';

export const getUnlockedLevels = (progress) => LEVELS.filter((level) => {
  const c = level.unlockCondition;
  if (c.type === 'default') return true;
  if (c.type === 'score') return (progress.highScore || 0) >= c.value;
  if (c.type === 'levelsCompleted') return (progress.levelsCompleted || 0) >= c.value;
  return false;
});

export const getLevelById = (id) => LEVELS.find((l) => l.id === id) || LEVELS[0];
