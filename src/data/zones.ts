import type { PetId, ZoneId } from "../domain/models";

export interface ZoneData {
  id: ZoneId;
  name: string;
  planetName: string;
  description: string;
  durationMs: number;
  staminaCost: number;
  minLevel: number;
  rewards: {
    coins: [number, number];
    exp: [number, number];
  };
  encounterRate: number;
  encounters: Array<{
    petId: PetId;
    weight: number;
    levelRange: [number, number];
  }>;
}

export const ZONES: Record<ZoneId, ZoneData> = {
  cross_grassland: {
    id: "cross_grassland",
    name: "草原外围",
    planetName: "克洛斯星",
    description: "微风吹过草地，偶尔能看见小型精灵活动。",
    durationMs: 20_000,
    staminaCost: 10,
    minLevel: 1,
    rewards: {
      coins: [8, 18],
      exp: [10, 22]
    },
    encounterRate: 0.45,
    encounters: [
      { petId: "pipi", weight: 70, levelRange: [1, 3] },
      { petId: "maomao", weight: 30, levelRange: [2, 4] }
    ]
  },
  cross_forest: {
    id: "cross_forest",
    name: "林间深处",
    planetName: "克洛斯星",
    description: "枝叶更密的区域，野生精灵更强，也更值得探索。",
    durationMs: 45_000,
    staminaCost: 18,
    minLevel: 3,
    rewards: {
      coins: [18, 36],
      exp: [24, 48]
    },
    encounterRate: 0.6,
    encounters: [
      { petId: "pipi", weight: 35, levelRange: [2, 5] },
      { petId: "maomao", weight: 40, levelRange: [3, 5] },
      { petId: "cactus", weight: 25, levelRange: [4, 6] }
    ]
  }
};
