import { Coins, Hand, HeartHandshake, Utensils } from "lucide-react";
import { BALANCE } from "../data/balance";
import { PETS } from "../data/pets";
import { PetPortrait } from "../components/PetPortrait";
import { PrimaryButton } from "../components/PrimaryButton";
import { StatBar } from "../components/StatBar";
import { getExpRequiredForLevel } from "../domain/leveling";
import { useGameStore } from "../store/gameStore";

const CAMP_SLOTS = [
  { left: "15%", top: "58%", delay: "0ms" },
  { left: "58%", top: "54%", delay: "420ms" },
  { left: "37%", top: "70%", delay: "840ms" },
  { left: "72%", top: "72%", delay: "1260ms" },
  { left: "23%", top: "36%", delay: "1680ms" },
  { left: "52%", top: "33%", delay: "2100ms" }
];

export function HomePage() {
  const activePetInstanceId = useGameStore((state) => state.activePetInstanceId);
  const pets = useGameStore((state) => state.pets);
  const pet = useGameStore((state) => (activePetInstanceId ? state.pets[activePetInstanceId] : undefined));
  const coins = useGameStore((state) => state.coins);
  const latestPetReaction = useGameStore((state) => state.latestPetReaction);
  const setActivePet = useGameStore((state) => state.setActivePet);
  const interactWithPet = useGameStore((state) => state.interactWithPet);

  if (!pet) {
    return <div className="page">正在同步伙伴资料...</div>;
  }

  const petData = PETS[pet.petId];
  const requiredExp = getExpRequiredForLevel(pet.level);
  const ownedPets = Object.values(pets);

  return (
    <div className="page home-page">
      <header className="top-line">
        <div>
          <p className="eyebrow">营地伙伴</p>
          <h1>{ownedPets.length} 只精灵在场</h1>
        </div>
        <div className="coin-pill">
          <Coins size={18} />
          <span>{coins}</span>
        </div>
      </header>

      <section className="camp-scene" aria-label="精灵营地">
        <div className="camp-sky" />
        <div className="camp-hill hill-back" />
        <div className="camp-hill hill-front" />
        <div className="camp-water" />
        {ownedPets.map((ownedPet, index) => {
          const slot = CAMP_SLOTS[index % CAMP_SLOTS.length];
          const ownedPetData = PETS[ownedPet.petId];
          const isActive = ownedPet.instanceId === activePetInstanceId;

          return (
            <button
              key={ownedPet.instanceId}
              className={`camp-pet ${isActive ? "active" : ""}`}
              style={{ left: slot.left, top: slot.top, animationDelay: slot.delay }}
              type="button"
              onClick={() => setActivePet(ownedPet.instanceId)}
              title={`选择 ${ownedPetData.name}`}
            >
              {isActive && <span className="active-signal" />}
              <PetPortrait petId={ownedPet.petId} size="small" />
              <span>{ownedPetData.name}</span>
            </button>
          );
        })}
        <div className="camp-hint">
          <span>悠闲时段</span>
        </div>
      </section>

      <section className="selected-pet-strip">
        <PetPortrait petId={pet.petId} size="small" />
        <div>
          <h2>{pet.nickname ?? petData.name}</h2>
          <p>{latestPetReaction ?? petData.description}</p>
        </div>
      </section>

      <section className="panel stats-panel">
        <div className="level-row">
          <strong>
            {petData.title} · Lv.{pet.level}
          </strong>
          <span>
            EXP {pet.exp}/{requiredExp}
          </span>
        </div>
        <StatBar label="心情" value={pet.mood} max={BALANCE.maxMood} tone="pink" />
        <StatBar label="亲密度" value={pet.bond} max={BALANCE.maxBond} tone="green" />
        <StatBar label="体力" value={pet.stamina} max={BALANCE.maxStamina} tone="blue" />
      </section>

      <section className="action-grid">
        <PrimaryButton icon={<Utensils size={18} />} onClick={() => interactWithPet("feed")}>
          喂食
        </PrimaryButton>
        <PrimaryButton icon={<Hand size={18} />} variant="secondary" onClick={() => interactWithPet("touch")}>
          摸摸
        </PrimaryButton>
        <PrimaryButton icon={<HeartHandshake size={18} />} variant="secondary" onClick={() => interactWithPet("play")}>
          玩耍
        </PrimaryButton>
      </section>
    </div>
  );
}
