import { useEffect, useState } from "react";
import { CheckCircle2, Compass, Timer } from "lucide-react";
import { PETS } from "../data/pets";
import { ZONES } from "../data/zones";
import { EventLog } from "../components/EventLog";
import { PrimaryButton } from "../components/PrimaryButton";
import { formatRemainingTime, getNow, getRemainingMs } from "../domain/time";
import { useGameStore } from "../store/gameStore";

const RUNNING_CLUES = [
  "远处草叶轻轻晃动，像是有什么经过。",
  "伙伴发现了一串很浅的脚印。",
  "通讯器捕捉到一小段精灵能量波动。",
  "背包里的捕捉胶囊微微发亮。"
];

export function ExplorePage() {
  const [, forceTick] = useState(0);
  const activePetInstanceId = useGameStore((state) => state.activePetInstanceId);
  const pet = useGameStore((state) => (activePetInstanceId ? state.pets[activePetInstanceId] : undefined));
  const task = useGameStore((state) => state.activeExploreTask);
  const lastExploreResult = useGameStore((state) => state.lastExploreResult);
  const startExplore = useGameStore((state) => state.startExplore);
  const claimExplore = useGameStore((state) => state.claimExplore);
  const refreshExploreTask = useGameStore((state) => state.refreshExploreTask);

  useEffect(() => {
    refreshExploreTask();
    const timer = window.setInterval(() => {
      refreshExploreTask();
      forceTick((value) => value + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [refreshExploreTask]);

  const remainingMs = task ? getRemainingMs(task.startedAt, task.durationMs, getNow()) : 0;
  const progress = task ? Math.min(100, Math.round(((task.durationMs - remainingMs) / task.durationMs) * 100)) : 0;
  const clueCount = task ? Math.max(1, Math.min(RUNNING_CLUES.length, Math.ceil(progress / 25))) : 0;

  return (
    <div className="page explore-page">
      <header className="top-line">
        <div>
          <p className="eyebrow">克洛斯星</p>
          <h1>探索区域</h1>
        </div>
        {task && (
          <div className="timer-pill">
            <Timer size={18} />
            <span>{task.status === "ready" ? "可领取" : formatRemainingTime(remainingMs)}</span>
          </div>
        )}
      </header>

      {task && (
        <section className="panel task-panel">
          <h2>{ZONES[task.zoneId].name}</h2>
          <p>{task.status === "ready" ? "探索队伍已经返回，奖励等待领取。" : "伙伴正在区域内搜索线索。"}</p>
          <div className="explore-progress" aria-label={`探索进度 ${progress}%`}>
            <div style={{ width: `${task.status === "ready" ? 100 : progress}%` }} />
          </div>
          {task.status !== "ready" && (
            <div className="clue-list">
              {RUNNING_CLUES.slice(0, clueCount).map((clue) => (
                <p key={clue}>{clue}</p>
              ))}
            </div>
          )}
          <PrimaryButton icon={<CheckCircle2 size={18} />} disabled={task.status !== "ready"} onClick={claimExplore}>
            领取结果
          </PrimaryButton>
        </section>
      )}

      <div className="zone-list">
        {Object.values(ZONES).map((zone) => {
          const disabled =
            Boolean(task) || !pet || pet.stamina < zone.staminaCost || pet.level < zone.minLevel;
          return (
            <article className="zone-card" key={zone.id}>
              <div>
                <p className="eyebrow">{zone.planetName}</p>
                <h2>{zone.name}</h2>
                <p>{zone.description}</p>
              </div>
              <div className="zone-meta">
                <span>{Math.round(zone.durationMs / 1000)} 秒</span>
                <span>体力 {zone.staminaCost}</span>
                <span>Lv.{zone.minLevel}+</span>
              </div>
              <PrimaryButton icon={<Compass size={18} />} disabled={disabled} onClick={() => startExplore(zone.id)}>
                出发
              </PrimaryButton>
            </article>
          );
        })}
      </div>

      {lastExploreResult && (
        <EventLog
          title="最近探索"
          items={lastExploreResult.events.map((event) =>
            event.type === "encounter" && lastExploreResult.encounter
              ? `${event.title}: ${PETS[lastExploreResult.encounter.petId].name} Lv.${lastExploreResult.encounter.level}`
              : `${event.title}: ${event.description}`
          )}
        />
      )}
    </div>
  );
}
