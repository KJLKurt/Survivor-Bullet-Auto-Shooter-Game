import { STORAGE_KEYS } from '../config.js';
import { CHARACTERS } from '../data/characters.js';
import { ITEMS } from '../data/items.js';
import { LEVELS } from '../data/levels.js';
import { WEAPONS } from '../data/weapons.js';

const WEAPON_UNLOCK_RULES = [
  { weaponId: 'smg', condition: { type: 'playCount', value: 2 } },
  { weaponId: 'shotgun', condition: { type: 'coinsBank', value: 160 } },
  { weaponId: 'sniper', condition: { type: 'score', value: 1200 } },
  { weaponId: 'grenade_launcher', condition: { type: 'levelsCompleted', value: 2 } }
];

export function createDefaultProfile() {
  return {
    selectedCharacterId: 'rookie',
    selectedWeaponId: 'pistol',
    selectedLevelId: 'level1',
    coinsBank: 0,
    highScore: 0,
    levelBest: {},
    playCount: 0,
    totalCoinsCollected: 0,
    levelsCompleted: [],
    unlockedCharacters: ['rookie'],
    unlockedLevels: ['level1'],
    unlockedWeapons: ['pistol'],
    itemLevels: {}
  };
}

export function normalizeProfile(profile) {
  const base = createDefaultProfile();
  const next = {
    ...base,
    ...profile,
    levelBest: { ...base.levelBest, ...(profile?.levelBest || {}) },
    itemLevels: { ...base.itemLevels, ...(profile?.itemLevels || {}) },
    unlockedCharacters: Array.from(new Set([...(profile?.unlockedCharacters || ['rookie']), 'rookie'])),
    unlockedLevels: Array.from(new Set([...(profile?.unlockedLevels || ['level1']), 'level1'])),
    unlockedWeapons: Array.from(new Set([...(profile?.unlockedWeapons || ['pistol']), 'pistol']))
  };

  if (!next.unlockedCharacters.includes(next.selectedCharacterId)) {
    next.selectedCharacterId = next.unlockedCharacters[0];
  }
  if (!next.unlockedLevels.includes(next.selectedLevelId)) {
    next.selectedLevelId = next.unlockedLevels[0];
  }
  if (!next.unlockedWeapons.includes(next.selectedWeaponId)) {
    next.selectedWeaponId = next.unlockedWeapons[0];
  }
  return next;
}

export async function loadProfile(storage) {
  const saved = await storage.get(STORAGE_KEYS.profile);
  return normalizeProfile(saved || {});
}

export async function saveProfile(storage, profile) {
  await storage.set(STORAGE_KEYS.profile, normalizeProfile(profile));
}

function meetsCondition(profile, condition) {
  if (!condition || condition.type === 'default') {
    return true;
  }
  switch (condition.type) {
    case 'coins':
    case 'coinsBank':
      return profile.coinsBank >= condition.value;
    case 'playCount':
      return profile.playCount >= condition.value;
    case 'score':
      return profile.highScore >= condition.value;
    case 'levelsCompleted':
      return profile.levelsCompleted.length >= condition.value;
    default:
      return false;
  }
}

export function applyRunResults(profile, runResult) {
  const next = normalizeProfile(profile);
  next.playCount += 1;
  next.totalCoinsCollected += runResult.coinsCollected;
  next.coinsBank += runResult.coinsCollected;
  next.highScore = Math.max(next.highScore, runResult.score);
  next.levelBest[runResult.levelId] = Math.max(next.levelBest[runResult.levelId] || 0, runResult.score);

  if (runResult.completed && !next.levelsCompleted.includes(runResult.levelId)) {
    next.levelsCompleted.push(runResult.levelId);
  }

  return next;
}

export function unlockNewContent(profile) {
  const next = normalizeProfile(profile);
  const unlockMessages = [];

  CHARACTERS.forEach((character) => {
    if (!next.unlockedCharacters.includes(character.id) && meetsCondition(next, character.unlockCondition)) {
      next.unlockedCharacters.push(character.id);
      next.unlockedWeapons.push(character.startingWeaponId);
      unlockMessages.push(`Character unlocked: ${character.name}`);
    }
  });

  LEVELS.forEach((level) => {
    if (!next.unlockedLevels.includes(level.id) && meetsCondition(next, level.unlockCondition)) {
      next.unlockedLevels.push(level.id);
      unlockMessages.push(`Level unlocked: ${level.name}`);
    }
  });

  WEAPON_UNLOCK_RULES.forEach((rule) => {
    if (!next.unlockedWeapons.includes(rule.weaponId) && meetsCondition(next, rule.condition)) {
      const weapon = WEAPONS.find((candidate) => candidate.id === rule.weaponId);
      next.unlockedWeapons.push(rule.weaponId);
      unlockMessages.push(`Weapon unlocked: ${weapon?.name || rule.weaponId}`);
    }
  });

  return { profile: next, unlockMessages };
}

export function getCharacterCatalog(profile) {
  const current = normalizeProfile(profile);
  return CHARACTERS.map((character) => ({
    ...character,
    unlocked: current.unlockedCharacters.includes(character.id),
    canUnlock: meetsCondition(current, character.unlockCondition)
  }));
}

export function getLevelCatalog(profile) {
  const current = normalizeProfile(profile);
  return LEVELS.map((level) => ({
    ...level,
    unlocked: current.unlockedLevels.includes(level.id),
    canUnlock: meetsCondition(current, level.unlockCondition)
  }));
}

export function getWeaponCatalog(profile) {
  const current = normalizeProfile(profile);
  return WEAPONS.map((weapon) => ({
    ...weapon,
    unlocked: current.unlockedWeapons.includes(weapon.id),
    cost: Math.round((weapon.damage * 9) + weapon.projectileSpeed * 0.08 + weapon.projectilesPerShot * 40)
  }));
}

export function purchaseCharacter(profile, characterId) {
  const current = normalizeProfile(profile);
  const character = CHARACTERS.find((entry) => entry.id === characterId);
  if (!character) {
    return { ok: false, profile: current, reason: 'Character missing' };
  }

  if (current.unlockedCharacters.includes(characterId)) {
    current.selectedCharacterId = characterId;
    current.selectedWeaponId = character.startingWeaponId;
    return { ok: true, profile: current };
  }

  const cost = character.unlockCondition?.type === 'coins' ? character.unlockCondition.value : 0;
  if (cost > current.coinsBank) {
    return { ok: false, profile: current, reason: 'Not enough coins' };
  }

  if (!meetsCondition(current, { ...character.unlockCondition, type: character.unlockCondition.type === 'coins' ? 'default' : character.unlockCondition.type })) {
    return { ok: false, profile: current, reason: 'Requirement not met' };
  }

  current.coinsBank -= cost;
  current.unlockedCharacters.push(characterId);
  current.unlockedWeapons.push(character.startingWeaponId);
  current.selectedCharacterId = characterId;
  current.selectedWeaponId = character.startingWeaponId;
  return { ok: true, profile: normalizeProfile(current) };
}

export function purchaseWeapon(profile, weaponId) {
  const current = normalizeProfile(profile);
  const weapon = WEAPONS.find((entry) => entry.id === weaponId);
  if (!weapon) {
    return { ok: false, profile: current, reason: 'Weapon missing' };
  }

  if (current.unlockedWeapons.includes(weaponId)) {
    current.selectedWeaponId = weaponId;
    return { ok: true, profile: current };
  }

  const cost = Math.round((weapon.damage * 9) + weapon.projectileSpeed * 0.08 + weapon.projectilesPerShot * 40);
  if (current.coinsBank < cost) {
    return { ok: false, profile: current, reason: 'Not enough coins' };
  }

  current.coinsBank -= cost;
  current.unlockedWeapons.push(weaponId);
  current.selectedWeaponId = weaponId;
  return { ok: true, profile: normalizeProfile(current) };
}

export function purchaseItemUpgrade(profile, itemId) {
  const current = normalizeProfile(profile);
  const item = ITEMS.find((entry) => entry.id === itemId);
  if (!item) {
    return { ok: false, profile: current, reason: 'Item missing' };
  }

  const currentLevel = current.itemLevels[itemId] || 0;
  if (currentLevel >= item.levels.length) {
    return { ok: false, profile: current, reason: 'Max level reached' };
  }

  const target = item.levels[currentLevel];
  if (current.coinsBank < target.cost) {
    return { ok: false, profile: current, reason: 'Not enough coins' };
  }

  current.coinsBank -= target.cost;
  current.itemLevels[itemId] = currentLevel + 1;
  return { ok: true, profile: current };
}

export function getAggregatedUpgradeDeltas(profile) {
  const current = normalizeProfile(profile);
  const deltas = {};

  ITEMS.forEach((item) => {
    const levelsPurchased = current.itemLevels[item.id] || 0;
    for (let levelIndex = 0; levelIndex < levelsPurchased; levelIndex += 1) {
      const level = item.levels[levelIndex];
      Object.entries(level.statDeltas).forEach(([key, value]) => {
        deltas[key] = (deltas[key] || 0) + value;
      });
    }
  });

  return deltas;
}
