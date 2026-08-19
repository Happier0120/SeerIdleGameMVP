export type PetId = "bubu_seed" | "fire_monkey" | "yiyou" | "pipi" | "maomao" | "cactus";

export type ElementType = "grass" | "fire" | "water" | "normal";

export type Rarity = "starter" | "common" | "uncommon";

export type ZoneId = "cross_grassland" | "cross_forest";

export type RouteId = "starter" | "home" | "explore" | "battle" | "collection" | "settings";

export type BattleSupport = "power" | "guard" | "focus";

export interface PetData {
  id: PetId;
  name: string;
  title: string;
  element: ElementType;
  rarity: Rarity;
  description: string;
  baseStats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
  };
  growth: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
  };
  baseCaptureRate: number;
  unlockHint: string;
  portraitKey: string;
}

export interface PetInstance {
  instanceId: string;
  petId: PetId;
  nickname?: string;
  level: number;
  exp: number;
  mood: number;
  bond: number;
  stamina: number;
  currentHp: number;
  createdAt: number;
}

export interface ExploreTask {
  taskId: string;
  zoneId: ZoneId;
  petInstanceId: string;
  startedAt: number;
  durationMs: number;
  status: "running" | "ready" | "claimed";
  seed: string;
}

export interface ExplorationResult {
  taskId: string;
  zoneId: ZoneId;
  events: ExploreEvent[];
  rewards: {
    coins: number;
    exp: number;
  };
  encounter?: Encounter;
  generatedAt: number;
}

export interface ExploreEvent {
  type: "coins" | "exp" | "encounter" | "empty";
  title: string;
  description: string;
}

export interface Encounter {
  encounterId: string;
  petId: PetId;
  level: number;
  zoneId: ZoneId;
}

export interface BattleState {
  battleId: string;
  playerPetInstanceId: string;
  enemy: BattlePet;
  rounds: BattleRound[];
  status: "pending" | "resolved";
  winner?: "player" | "enemy";
  startedAt: number;
  resolvedAt?: number;
}

export interface BattlePet {
  petId: PetId;
  level: number;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
}

export interface BattleRound {
  round: number;
  actor: "player" | "enemy";
  damage: number;
  targetHpAfter: number;
  text: string;
}

export interface CaptureAttempt {
  captureId: string;
  encounterId: string;
  petId: PetId;
  chance: number;
  success: boolean;
  createdAt: number;
}

export interface CollectionEntry {
  petId: PetId;
  seen: boolean;
  owned: boolean;
  firstSeenAt?: number;
  firstOwnedAt?: number;
}
