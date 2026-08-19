import { BALANCE } from "../data/balance";
import type { PetData, PetInstance } from "./models";

export function getExpRequiredForLevel(level: number): number {
  return BALANCE.levelExpBase + (level - 1) * BALANCE.levelExpGrowth;
}

export function addExpToPet(
  pet: PetInstance,
  expGain: number
): {
  pet: PetInstance;
  levelsGained: number;
} {
  let nextExp = pet.exp + expGain;
  let nextLevel = pet.level;
  let levelsGained = 0;

  while (nextExp >= getExpRequiredForLevel(nextLevel)) {
    nextExp -= getExpRequiredForLevel(nextLevel);
    nextLevel += 1;
    levelsGained += 1;
  }

  return {
    pet: {
      ...pet,
      exp: nextExp,
      level: nextLevel
    },
    levelsGained
  };
}

export function getMaxHp(petData: PetData, level: number): number {
  return petData.baseStats.hp + petData.growth.hp * (level - 1);
}
