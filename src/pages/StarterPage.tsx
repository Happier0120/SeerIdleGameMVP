import { Check } from "lucide-react";
import { PETS, STARTER_PET_IDS } from "../data/pets";
import { PetPortrait } from "../components/PetPortrait";
import { PrimaryButton } from "../components/PrimaryButton";
import { useGameStore } from "../store/gameStore";

export function StarterPage() {
  const chooseStarter = useGameStore((state) => state.chooseStarter);

  return (
    <div className="page starter-page">
      <header className="page-hero">
        <p className="eyebrow">克洛斯星登陆许可</p>
        <h1>选择你的初始伙伴</h1>
        <p>第一只精灵会陪你完成养成、探索、遭遇和图鉴点亮的完整循环。</p>
      </header>

      <div className="starter-grid">
        {STARTER_PET_IDS.map((petId) => {
          const pet = PETS[petId];
          return (
            <article className="starter-card" key={petId}>
              <PetPortrait petId={petId} size="large" />
              <h2>{pet.name}</h2>
              <p className="pet-title">{pet.title}</p>
              <p>{pet.description}</p>
              <PrimaryButton icon={<Check size={18} />} onClick={() => chooseStarter(petId)}>
                选择
              </PrimaryButton>
            </article>
          );
        })}
      </div>
    </div>
  );
}
