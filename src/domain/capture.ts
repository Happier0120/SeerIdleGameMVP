import { BALANCE } from "../data/balance";
import { clamp } from "./math";
import { createSeededRng } from "./random";
import type { CaptureAttempt, Encounter, PetData } from "./models";

export function getCaptureChance(args: {
  petData: PetData;
  enemyLevel: number;
  playerLevel: number;
}): number {
  const levelModifier = clamp((args.playerLevel - args.enemyLevel) * 0.03, -0.12, 0.18);
  return clamp(args.petData.baseCaptureRate + levelModifier, 0.05, 0.9);
}

export function rollCapture(args: {
  encounter: Encounter;
  chance: number;
  now: number;
  seed: string;
}): CaptureAttempt {
  const rng = createSeededRng(`${args.seed}:capture`);

  return {
    captureId: `capture_${args.now}_${args.encounter.encounterId}`,
    encounterId: args.encounter.encounterId,
    petId: args.encounter.petId,
    chance: args.chance,
    success: rng.next() < args.chance,
    createdAt: args.now
  };
}

export function canPayCaptureCost(coins: number): boolean {
  return coins >= BALANCE.captureCoinCost;
}
