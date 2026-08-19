import type { PetData, PetId } from "../domain/models";

export const PETS: Record<PetId, PetData> = {
  bubu_seed: {
    id: "bubu_seed",
    name: "布布种子",
    title: "草系初心者",
    element: "grass",
    rarity: "starter",
    description: "性格温和的草系精灵，喜欢阳光和泥土。",
    baseStats: { hp: 42, attack: 11, defense: 12, speed: 8 },
    growth: { hp: 7, attack: 3, defense: 3, speed: 2 },
    baseCaptureRate: 0,
    unlockHint: "初始伙伴",
    portraitKey: "sprout"
  },
  fire_monkey: {
    id: "fire_monkey",
    name: "小火猴",
    title: "火系冒险家",
    element: "fire",
    rarity: "starter",
    description: "活泼好动的火系精灵，尾焰会随着心情跳动。",
    baseStats: { hp: 38, attack: 14, defense: 9, speed: 11 },
    growth: { hp: 6, attack: 4, defense: 2, speed: 3 },
    baseCaptureRate: 0,
    unlockHint: "初始伙伴",
    portraitKey: "flame"
  },
  yiyou: {
    id: "yiyou",
    name: "伊优",
    title: "水系观察员",
    element: "water",
    rarity: "starter",
    description: "冷静亲人的水系精灵，擅长在溪流边发现线索。",
    baseStats: { hp: 44, attack: 10, defense: 11, speed: 9 },
    growth: { hp: 8, attack: 3, defense: 3, speed: 2 },
    baseCaptureRate: 0,
    unlockHint: "初始伙伴",
    portraitKey: "drop"
  },
  pipi: {
    id: "pipi",
    name: "皮皮",
    title: "草原小影子",
    element: "normal",
    rarity: "common",
    description: "常在草丛间快速穿梭，胆小但十分亲近熟悉的人。",
    baseStats: { hp: 30, attack: 9, defense: 7, speed: 13 },
    growth: { hp: 5, attack: 2, defense: 2, speed: 4 },
    baseCaptureRate: 0.65,
    unlockHint: "克洛斯星草原外围常见",
    portraitKey: "star"
  },
  maomao: {
    id: "maomao",
    name: "毛毛",
    title: "林风信使",
    element: "normal",
    rarity: "common",
    description: "柔软轻盈的小精灵，会顺着风的方向寻找果实。",
    baseStats: { hp: 34, attack: 10, defense: 8, speed: 12 },
    growth: { hp: 5, attack: 3, defense: 2, speed: 3 },
    baseCaptureRate: 0.55,
    unlockHint: "克洛斯星草原外围和林间深处可遇见",
    portraitKey: "feather"
  },
  cactus: {
    id: "cactus",
    name: "仙人球",
    title: "林间守卫",
    element: "grass",
    rarity: "uncommon",
    description: "看似安静，受到惊扰时会立刻竖起尖刺保护自己。",
    baseStats: { hp: 46, attack: 12, defense: 14, speed: 6 },
    growth: { hp: 7, attack: 3, defense: 4, speed: 1 },
    baseCaptureRate: 0.38,
    unlockHint: "克洛斯星林间深处较少出现",
    portraitKey: "cactus"
  }
};

export const STARTER_PET_IDS: PetId[] = ["bubu_seed", "fire_monkey", "yiyou"];

export const CAPTURABLE_PET_IDS: PetId[] = ["pipi", "maomao", "cactus"];
