import { ArrowLeft, CircleDollarSign, Shield, Sparkles, Swords, Zap } from "lucide-react";
import { BALANCE } from "../data/balance";
import { PETS } from "../data/pets";
import { EventLog } from "../components/EventLog";
import { PetPortrait } from "../components/PetPortrait";
import { PrimaryButton } from "../components/PrimaryButton";
import { getCaptureChance } from "../domain/capture";
import { useGameStore } from "../store/gameStore";

export function BattlePage() {
  const activePetInstanceId = useGameStore((state) => state.activePetInstanceId);
  const pet = useGameStore((state) => (activePetInstanceId ? state.pets[activePetInstanceId] : undefined));
  const battle = useGameStore((state) => state.activeBattle);
  const encounter = useGameStore((state) => state.activeEncounter);
  const coins = useGameStore((state) => state.coins);
  const lastCaptureAttempt = useGameStore((state) => state.lastCaptureAttempt);
  const resolveBattle = useGameStore((state) => state.resolveBattle);
  const battleSupport = useGameStore((state) => state.battleSupport);
  const attemptCapture = useGameStore((state) => state.attemptCapture);
  const setRoute = useGameStore((state) => state.setRoute);

  if (!battle || !pet) {
    return (
      <div className="page empty-page">
        <h1>暂无遭遇</h1>
        <p>派遣伙伴探索克洛斯星后，可能会在这里进入自动战斗。</p>
        <PrimaryButton icon={<ArrowLeft size={18} />} onClick={() => setRoute("explore")}>
          去探索
        </PrimaryButton>
      </div>
    );
  }

  const enemyPet = PETS[battle.enemy.petId];
  const playerPet = PETS[pet.petId];
  const captureChance =
    encounter && battle.status === "resolved"
      ? getCaptureChance({
          petData: enemyPet,
          enemyLevel: encounter.level,
          playerLevel: pet.level
        }) + (battleSupport === "focus" ? 0.1 : 0)
      : 0;
  const captureForCurrentEncounter =
    encounter && lastCaptureAttempt?.encounterId === encounter.encounterId ? lastCaptureAttempt : undefined;
  const canCapture =
    Boolean(encounter) &&
    battle.status === "resolved" &&
    battle.winner === "player" &&
    !captureForCurrentEncounter &&
    coins >= BALANCE.captureCoinCost;

  return (
    <div className="page battle-page">
      <header className="top-line">
        <div>
          <p className="eyebrow">自动战斗</p>
          <h1>{battle.status === "resolved" ? (battle.winner === "player" ? "战斗胜利" : "暂时落败") : "战斗中"}</h1>
        </div>
        <Swords size={28} />
      </header>

      <section className="battle-stage">
        <div>
          <PetPortrait petId={pet.petId} />
          <strong>{playerPet.name}</strong>
          <span>Lv.{pet.level}</span>
        </div>
        <span className="versus">VS</span>
        <div>
          <PetPortrait petId={battle.enemy.petId} />
          <strong>{enemyPet.name}</strong>
          <span>Lv.{battle.enemy.level}</span>
        </div>
      </section>

      <EventLog title="战斗日志" items={battle.rounds.map((round) => round.text)} emptyText="等待你的指令。" />

      {battle.status === "pending" && (
        <section className="panel battle-choice-panel">
          <h2>给伙伴一个指令</h2>
          <p>每场遭遇只能选择一次倾向，选择后自动战斗开始。</p>
          <div className="battle-choice-grid">
            <PrimaryButton icon={<Zap size={18} />} onClick={() => resolveBattle("power")}>
              猛攻
            </PrimaryButton>
            <PrimaryButton variant="secondary" icon={<Shield size={18} />} onClick={() => resolveBattle("guard")}>
              守护
            </PrimaryButton>
            <PrimaryButton variant="secondary" icon={<Sparkles size={18} />} onClick={() => resolveBattle("focus")}>
              专注捕捉
            </PrimaryButton>
          </div>
        </section>
      )}

      {captureForCurrentEncounter && (
        <section className="panel result-panel">
          <h2>{captureForCurrentEncounter.success ? "捕捉成功" : "捕捉失败"}</h2>
          <p>
            {captureForCurrentEncounter.success
              ? `${enemyPet.name}已经加入仓库，图鉴也被点亮。`
              : `${enemyPet.name}逃走了，下次探索还有机会。`}
          </p>
        </section>
      )}

      <div className="action-grid">
        {battle.status === "resolved" && battle.winner === "player" && (
          <PrimaryButton
            icon={<CircleDollarSign size={18} />}
            disabled={!canCapture}
            onClick={attemptCapture}
          >
            捕捉 {Math.round(Math.min(captureChance, 0.9) * 100)}%
          </PrimaryButton>
        )}
        <PrimaryButton variant="secondary" icon={<ArrowLeft size={18} />} onClick={() => setRoute("explore")}>
          返回探索
        </PrimaryButton>
      </div>
    </div>
  );
}
