import { BALANCE } from "../data/balance";
import { PETS } from "../data/pets";
import { createSeededRng } from "./random";
import type {
  BattlePet,
  BattleRound,
  BattleState,
  BattleSupport,
  ElementType,
  Encounter,
  PetData,
  PetInstance
} from "./models";

export function getElementMultiplier(attacker: ElementType, defender: ElementType): number {
  if (
    (attacker === "grass" && defender === "water") ||
    (attacker === "water" && defender === "fire") ||
    (attacker === "fire" && defender === "grass")
  ) {
    return 1.2;
  }

  if (
    (defender === "grass" && attacker === "water") ||
    (defender === "water" && attacker === "fire") ||
    (defender === "fire" && attacker === "grass")
  ) {
    return 0.85;
  }

  return 1;
}

export function createBattlePet(petData: PetData, level: number): BattlePet {
  return {
    petId: petData.id,
    level,
    hp: petData.baseStats.hp + petData.growth.hp * (level - 1),
    attack: petData.baseStats.attack + petData.growth.attack * (level - 1),
    defense: petData.baseStats.defense + petData.growth.defense * (level - 1),
    speed: petData.baseStats.speed + petData.growth.speed * (level - 1)
  };
}

export function createBattle(args: {
  playerPet: PetInstance;
  encounter: Encounter;
  now: number;
  seed: string;
}): BattleState {
  const enemyData = PETS[args.encounter.petId];

  return {
    battleId: `battle_${args.now}_${args.seed.slice(0, 8)}`,
    playerPetInstanceId: args.playerPet.instanceId,
    enemy: createBattlePet(enemyData, args.encounter.level),
    rounds: [],
    status: "pending",
    startedAt: args.now
  };
}

export function resolveAutoBattle(args: {
  battle: BattleState;
  playerPetLevel: number;
  playerPetData: PetData;
  enemyPetData: PetData;
  support?: BattleSupport;
  seed: string;
  now: number;
}): BattleState {
  const rng = createSeededRng(`${args.seed}:battle`);
  const enemy = { ...args.battle.enemy };
  const playerUnit = createBattlePet(args.playerPetData, args.playerPetLevel);

  if (args.support === "power") {
    playerUnit.attack = Math.round(playerUnit.attack * 1.16);
  }

  if (args.support === "guard") {
    playerUnit.defense = Math.round(playerUnit.defense * 1.18);
    playerUnit.hp = Math.round(playerUnit.hp * 1.08);
  }
  let playerHp = playerUnit.hp;
  let enemyHp = enemy.hp;
  const rounds: BattleRound[] = [];
  const playerFirst = playerUnit.speed >= enemy.speed;

  const createAttack = (
    round: number,
    actor: "player" | "enemy",
    attacker: BattlePet,
    defender: BattlePet,
    defenderHp: number
  ): { damage: number; targetHpAfter: number; log: BattleRound } => {
    const attackerData = PETS[attacker.petId];
    const defenderData = PETS[defender.petId];
    const baseDamage = attacker.attack * 1.5 - defender.defense * 0.7;
    const levelModifier = 1 + attacker.level * 0.03;
    const randomModifier = 0.9 + rng.next() * 0.2;
    const elementModifier = getElementMultiplier(attackerData.element, defenderData.element);
    const damage = Math.max(1, Math.round(baseDamage * levelModifier * randomModifier * elementModifier));
    const targetHpAfter = Math.max(0, defenderHp - damage);
    const actorName = actor === "player" ? args.playerPetData.name : args.enemyPetData.name;
    const defenderName = actor === "player" ? args.enemyPetData.name : args.playerPetData.name;

    return {
      damage,
      targetHpAfter,
      log: {
        round,
        actor,
        damage,
        targetHpAfter,
        text: `${actorName}攻击${defenderName}，造成 ${damage} 点伤害。`
      }
    };
  };

  for (let round = 1; round <= BALANCE.maxBattleRounds; round += 1) {
    const order: Array<"player" | "enemy"> = playerFirst ? ["player", "enemy"] : ["enemy", "player"];

    for (const actor of order) {
      if (playerHp <= 0 || enemyHp <= 0) {
        break;
      }

      if (actor === "player") {
        const attack = createAttack(round, "player", playerUnit, enemy, enemyHp);
        enemyHp = attack.targetHpAfter;
        rounds.push(attack.log);
      } else {
        const attack = createAttack(round, "enemy", enemy, playerUnit, playerHp);
        playerHp = attack.targetHpAfter;
        rounds.push(attack.log);
      }
    }

    if (playerHp <= 0 || enemyHp <= 0) {
      break;
    }
  }

  const playerRatio = playerHp / playerUnit.hp;
  const enemyRatio = enemyHp / enemy.hp;
  const winner = enemyHp <= 0 || playerRatio >= enemyRatio ? "player" : "enemy";

  rounds.push({
    round: rounds.length + 1,
    actor: winner,
    damage: 0,
    targetHpAfter: winner === "player" ? enemyHp : playerHp,
    text: winner === "player" ? "战斗胜利，可以尝试捕捉！" : "伙伴暂时落败，回到基地休整。"
  });

  return {
    ...args.battle,
    rounds,
    status: "resolved",
    winner,
    resolvedAt: args.now
  };
}
