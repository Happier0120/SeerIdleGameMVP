import { PETS } from "../data/pets";
import { ZONES } from "../data/zones";
import { createSeededRng, pickWeighted, randomInt } from "./random";
import type { Encounter, ExplorationResult, ExploreEvent, ExploreTask, ZoneId } from "./models";

export function createExploreTask(args: {
  zoneId: ZoneId;
  petInstanceId: string;
  now: number;
  seed: string;
}): ExploreTask {
  const zone = ZONES[args.zoneId];

  return {
    taskId: `explore_${args.now}_${args.seed.slice(0, 8)}`,
    zoneId: args.zoneId,
    petInstanceId: args.petInstanceId,
    startedAt: args.now,
    durationMs: zone.durationMs,
    status: "running",
    seed: args.seed
  };
}

export function isExploreReady(task: ExploreTask, now: number): boolean {
  return task.status === "running" && now >= task.startedAt + task.durationMs;
}

export function generateExplorationResult(args: {
  task: ExploreTask;
  now: number;
}): ExplorationResult {
  const zone = ZONES[args.task.zoneId];
  const rng = createSeededRng(args.task.seed);
  const coins = randomInt(rng, zone.rewards.coins[0], zone.rewards.coins[1]);
  const exp = randomInt(rng, zone.rewards.exp[0], zone.rewards.exp[1]);
  const events: ExploreEvent[] = [
    {
      type: "coins" as const,
      title: "获得金币",
      description: "伙伴在草丛中发现了发光的矿石。"
    },
    {
      type: "exp" as const,
      title: "获得经验",
      description: "一路探索让伙伴变得更加熟练。"
    }
  ];
  let encounter: Encounter | undefined;

  if (rng.next() < zone.encounterRate) {
    const encounterConfig = pickWeighted(
      rng,
      zone.encounters.map((item) => ({ item, weight: item.weight }))
    );
    encounter = {
      encounterId: `encounter_${args.task.taskId}`,
      petId: encounterConfig.petId,
      level: randomInt(rng, encounterConfig.levelRange[0], encounterConfig.levelRange[1]),
      zoneId: zone.id
    };
    events.push({
      type: "encounter",
      title: "遭遇精灵",
      description: `草丛突然晃动，一只${PETS[encounter.petId].name}跳了出来。`
    });
  } else {
    events.push({
      type: "empty",
      title: "安静的区域",
      description: "这里很安静，只有风吹过草地。"
    });
  }

  return {
    taskId: args.task.taskId,
    zoneId: args.task.zoneId,
    events,
    rewards: {
      coins,
      exp
    },
    encounter,
    generatedAt: args.now
  };
}
