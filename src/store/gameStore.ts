import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BALANCE } from "../data/balance";
import { PETS } from "../data/pets";
import { ZONES } from "../data/zones";
import { createBattle, resolveAutoBattle } from "../domain/battle";
import { canPayCaptureCost, getCaptureChance, rollCapture } from "../domain/capture";
import { markOwned, markSeen } from "../domain/collection";
import { createExploreTask, generateExplorationResult, isExploreReady } from "../domain/exploration";
import { createId } from "../domain/id";
import { addExpToPet, getMaxHp } from "../domain/leveling";
import { clamp } from "../domain/math";
import type { BattleSupport, PetId, RouteId, ZoneId } from "../domain/models";
import { getNow } from "../domain/time";
import { createInitialGameState, type GameState } from "./initialState";
import { migrateSave } from "./migrations";

const SAVE_KEY = "seer-web-mvp-save";

export interface GameActions {
  chooseStarter: (petId: PetId) => void;
  setRoute: (route: RouteId) => void;
  setActivePet: (petInstanceId: string) => void;
  interactWithPet: (action: "feed" | "touch" | "play") => void;
  startExplore: (zoneId: ZoneId) => void;
  refreshExploreTask: () => void;
  claimExplore: () => void;
  resolveBattle: (support?: BattleSupport) => void;
  attemptCapture: () => void;
  dismissNotification: (index: number) => void;
  resetSave: () => void;
}

function notify(state: GameState, text: string): string[] {
  return [text, ...state.notifications].slice(0, 5);
}

function getActivePet(state: GameState) {
  return state.activePetInstanceId ? state.pets[state.activePetInstanceId] : undefined;
}

function getPetName(petId: PetId): string {
  return PETS[petId].name;
}

function getReaction(petId: PetId, action: "select" | "feed" | "touch" | "play" | "explore"): string {
  const name = getPetName(petId);
  const reactions = {
    select: `${name}注意到了你的视线，轻轻凑了过来。`,
    feed: `${name}吃得很开心，尾巴的节奏都变快了。`,
    touch: `${name}眯起眼睛，安静地贴近你的手心。`,
    play: `${name}绕着场地跑了一圈，看起来精神满满。`,
    explore: `${name}背起小包，回头等你确认出发。`
  };

  return reactions[action];
}

export const useGameStore = create<GameState & GameActions>()(
  persist(
    (set, get) => ({
      ...createInitialGameState(),

      chooseStarter: (petId) => {
        const now = getNow();
        const petData = PETS[petId];
        const instanceId = createId("pet", now);
        const pet = {
          instanceId,
          petId,
          level: 1,
          exp: 0,
          mood: 70,
          bond: 15,
          stamina: BALANCE.maxStamina,
          currentHp: getMaxHp(petData, 1),
          createdAt: now
        };

        set((state) => ({
          ...state,
          currentRoute: "home",
          hasChosenStarter: true,
          activePetInstanceId: instanceId,
          coins: 30,
          pets: {
            ...state.pets,
            [instanceId]: pet
          },
          collection: markOwned(state.collection, petId, now),
          latestPetReaction: getReaction(petId, "select"),
          notifications: notify(state, `${petData.name}成为了你的初始伙伴。`)
        }));
      },

      setRoute: (route) => {
        set({ currentRoute: route });
        get().refreshExploreTask();
      },

      setActivePet: (petInstanceId) => {
        const state = get();
        const pet = state.pets[petInstanceId];

        if (!pet) {
          return;
        }

        set({
          activePetInstanceId: petInstanceId,
          latestPetReaction: getReaction(pet.petId, "select")
        });
      },

      interactWithPet: (action) => {
        const state = get();
        const pet = getActivePet(state);

        if (!pet) {
          return;
        }

        if (action === "feed" && state.coins < BALANCE.feedCost) {
          set({ notifications: notify(state, "金币不足，暂时不能喂食。") });
          return;
        }

        if (action === "play" && pet.stamina < BALANCE.playStaminaCost) {
          set({ notifications: notify(state, "体力不足，先休息一下吧。") });
          return;
        }

        const nextPet = (() => {
          if (action === "feed") {
            return {
              ...pet,
              mood: clamp(pet.mood + 8, 0, BALANCE.maxMood),
              stamina: clamp(pet.stamina + 12, 0, BALANCE.maxStamina)
            };
          }

          if (action === "touch") {
            return {
              ...pet,
              mood: clamp(pet.mood + 4, 0, BALANCE.maxMood),
              bond: clamp(pet.bond + BALANCE.touchBondGain, 0, BALANCE.maxBond)
            };
          }

          return {
            ...pet,
            mood: clamp(pet.mood + 12, 0, BALANCE.maxMood),
            bond: clamp(pet.bond + 4, 0, BALANCE.maxBond),
            stamina: clamp(pet.stamina - BALANCE.playStaminaCost, 0, BALANCE.maxStamina)
          };
        })();

        const actionLabel = action === "feed" ? "喂食" : action === "touch" ? "摸摸" : "玩耍";

        set((current) => ({
          coins: action === "feed" ? current.coins - BALANCE.feedCost : current.coins,
          pets: {
            ...current.pets,
            [nextPet.instanceId]: nextPet
          },
          latestPetReaction: getReaction(pet.petId, action),
          notifications: notify(current, `${actionLabel}让伙伴更有精神了。`)
        }));
      },

      startExplore: (zoneId) => {
        const state = get();
        const pet = getActivePet(state);
        const zone = ZONES[zoneId];

        if (!pet) {
          return;
        }

        if (state.activeExploreTask && state.activeExploreTask.status !== "claimed") {
          set({ notifications: notify(state, "已经有探索任务在进行中。") });
          return;
        }

        if (pet.level < zone.minLevel) {
          set({ notifications: notify(state, `需要达到 ${zone.minLevel} 级才能进入这里。`) });
          return;
        }

        if (pet.stamina < zone.staminaCost) {
          set({ notifications: notify(state, "伙伴体力不足，先养成恢复一下。") });
          return;
        }

        const now = getNow();
        const seed = createId("seed", now);
        const task = createExploreTask({
          zoneId,
          petInstanceId: pet.instanceId,
          now,
          seed
        });

        set((current) => ({
          activeExploreTask: task,
          lastExploreResult: undefined,
          activeEncounter: undefined,
          activeBattle: undefined,
          battleSupport: undefined,
          lastCaptureAttempt: undefined,
          pets: {
            ...current.pets,
            [pet.instanceId]: {
              ...pet,
              stamina: clamp(pet.stamina - zone.staminaCost, 0, BALANCE.maxStamina)
            }
          },
          latestPetReaction: getReaction(pet.petId, "explore"),
          notifications: notify(current, `${pet.nickname ?? PETS[pet.petId].name}出发探索${zone.name}。`)
        }));
      },

      refreshExploreTask: () => {
        const state = get();
        const task = state.activeExploreTask;

        if (!task || !isExploreReady(task, getNow())) {
          return;
        }

        set({
          activeExploreTask: {
            ...task,
            status: "ready"
          }
        });
      },

      claimExplore: () => {
        get().refreshExploreTask();

        const state = get();
        const task = state.activeExploreTask;

        if (!task || task.status !== "ready") {
          set({ notifications: notify(state, "探索还没有完成。") });
          return;
        }

        const now = getNow();
        const result = generateExplorationResult({ task, now });
        const pet = state.pets[task.petInstanceId];
        const expResult = addExpToPet(pet, result.rewards.exp);
        const petData = PETS[expResult.pet.petId];
        const restoredPet = {
          ...expResult.pet,
          currentHp: Math.max(1, Math.min(expResult.pet.currentHp, getMaxHp(petData, expResult.pet.level)))
        };
        const collection = result.encounter
          ? markSeen(state.collection, result.encounter.petId, now)
          : state.collection;
        const battle = result.encounter
          ? createBattle({
              playerPet: restoredPet,
              encounter: result.encounter,
              now,
              seed: task.seed
            })
          : undefined;

        set((current) => ({
          coins: current.coins + result.rewards.coins,
          pets: {
            ...current.pets,
            [restoredPet.instanceId]: restoredPet
          },
          collection,
          activeExploreTask: undefined,
          lastExploreResult: result,
          activeEncounter: result.encounter,
          activeBattle: battle,
          currentRoute: result.encounter ? "battle" : "explore",
          notifications: notify(
            current,
            expResult.levelsGained > 0
              ? `探索完成，伙伴升了 ${expResult.levelsGained} 级！`
              : "探索完成，奖励已领取。"
          )
        }));
      },

      resolveBattle: (support) => {
        const state = get();
        const battle = state.activeBattle;
        const pet = getActivePet(state);

        if (!battle || battle.status === "resolved" || !pet) {
          return;
        }

        const now = getNow();
        const playerPetData = PETS[pet.petId];
        const enemyPetData = PETS[battle.enemy.petId];
        const resolved = resolveAutoBattle({
          battle,
          playerPetLevel: pet.level,
          playerPetData,
          enemyPetData,
          support,
          seed: state.activeExploreTask?.seed ?? battle.battleId,
          now
        });
        const maxHp = getMaxHp(playerPetData, pet.level);
        const recoveryRatio = resolved.winner === "player" ? 0.6 : 0.4;
        const recoveredPet = {
          ...pet,
          currentHp: Math.max(1, Math.round(maxHp * recoveryRatio))
        };

        set((current) => ({
          activeBattle: resolved,
          battleSupport: support,
          pets: {
            ...current.pets,
            [recoveredPet.instanceId]: recoveredPet
          },
          notifications: notify(current, resolved.winner === "player" ? "自动战斗胜利！" : "战斗失败，伙伴正在休整。")
        }));
      },

      attemptCapture: () => {
        const state = get();
        const battle = state.activeBattle;
        const encounter = state.activeEncounter;
        const playerPet = getActivePet(state);

        if (!battle || !encounter || !playerPet || battle.status !== "resolved" || battle.winner !== "player") {
          return;
        }

        if (state.lastCaptureAttempt?.encounterId === encounter.encounterId) {
          set({ notifications: notify(state, "这次遭遇已经尝试过捕捉。") });
          return;
        }

        if (!canPayCaptureCost(state.coins)) {
          set({ notifications: notify(state, "金币不足，无法投放捕捉胶囊。") });
          return;
        }

        const now = getNow();
        const petData = PETS[encounter.petId];
        const chance = getCaptureChance({
          petData,
          enemyLevel: encounter.level,
          playerLevel: playerPet.level
        }) + (state.battleSupport === "focus" ? 0.1 : 0);
        const attempt = rollCapture({
          encounter,
          chance: clamp(chance, 0.05, 0.9),
          now,
          seed: battle.battleId
        });
        const newPetId = createId("pet", now);
        const newPet = {
          instanceId: newPetId,
          petId: encounter.petId,
          level: encounter.level,
          exp: 0,
          mood: 60,
          bond: 10,
          stamina: 70,
          currentHp: getMaxHp(petData, encounter.level),
          createdAt: now
        };

        set((current) => ({
          coins: current.coins - BALANCE.captureCoinCost,
          pets: attempt.success
            ? {
                ...current.pets,
                [newPetId]: newPet
              }
            : current.pets,
          collection: attempt.success ? markOwned(current.collection, encounter.petId, now) : current.collection,
          lastCaptureAttempt: attempt,
          activePetInstanceId: attempt.success ? newPetId : current.activePetInstanceId,
          latestPetReaction: attempt.success
            ? `${petData.name}有点害羞，但还是跟着你回到了营地。`
            : `${petData.name}从胶囊光里挣脱，飞快躲进了草丛。`,
          notifications: notify(
            current,
            attempt.success ? `${petData.name}加入了精灵仓库！` : `${petData.name}挣脱后逃走了。`
          )
        }));
      },

      dismissNotification: (index) => {
        set((state) => ({
          notifications: state.notifications.filter((_, itemIndex) => itemIndex !== index)
        }));
      },

      resetSave: () => {
        localStorage.removeItem(SAVE_KEY);
        set(createInitialGameState());
      }
    }),
    {
      name: SAVE_KEY,
      version: 1,
      migrate: migrateSave
    }
  )
);
