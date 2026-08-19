import { createInitialCollection } from "../domain/collection";
import type {
  BattleState,
  CaptureAttempt,
  CollectionEntry,
  Encounter,
  ExplorationResult,
  ExploreTask,
  PetId,
  PetInstance,
  RouteId,
  BattleSupport
} from "../domain/models";

export interface GameState {
  version: number;
  currentRoute: RouteId;
  hasChosenStarter: boolean;
  activePetInstanceId?: string;
  coins: number;
  pets: Record<string, PetInstance>;
  collection: Record<PetId, CollectionEntry>;
  activeExploreTask?: ExploreTask;
  lastExploreResult?: ExplorationResult;
  activeEncounter?: Encounter;
  activeBattle?: BattleState;
  battleSupport?: BattleSupport;
  lastCaptureAttempt?: CaptureAttempt;
  latestPetReaction?: string;
  notifications: string[];
}

export function createInitialGameState(): GameState {
  return {
    version: 1,
    currentRoute: "starter",
    hasChosenStarter: false,
    activePetInstanceId: undefined,
    coins: 30,
    pets: {},
    collection: createInitialCollection(),
    activeExploreTask: undefined,
    lastExploreResult: undefined,
    activeEncounter: undefined,
    activeBattle: undefined,
    battleSupport: undefined,
    lastCaptureAttempt: undefined,
    latestPetReaction: undefined,
    notifications: []
  };
}
