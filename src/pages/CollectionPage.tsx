import { CheckCircle2, Eye, Lock } from "lucide-react";
import { PETS } from "../data/pets";
import { PetPortrait } from "../components/PetPortrait";
import { getCollectionProgress } from "../domain/collection";
import { useGameStore } from "../store/gameStore";

export function CollectionPage() {
  const collection = useGameStore((state) => state.collection);
  const progress = getCollectionProgress(collection);

  return (
    <div className="page collection-page">
      <header className="top-line">
        <div>
          <p className="eyebrow">精灵图鉴</p>
          <h1>
            {progress.owned}/{progress.total} 已拥有
          </h1>
        </div>
        <div className="progress-ring">{progress.percent}%</div>
      </header>

      <div className="collection-grid">
        {Object.values(PETS).map((pet) => {
          const entry = collection[pet.id];
          const locked = !entry.seen && !entry.owned;
          return (
            <article className={`collection-card ${locked ? "locked" : ""}`} key={pet.id}>
              <PetPortrait petId={pet.id} locked={locked} />
              <h2>{locked ? "???" : pet.name}</h2>
              <p>{locked ? pet.unlockHint : pet.title}</p>
              <div className="collection-state">
                {entry.owned ? <CheckCircle2 size={16} /> : entry.seen ? <Eye size={16} /> : <Lock size={16} />}
                <span>{entry.owned ? "已拥有" : entry.seen ? "已见过" : "未发现"}</span>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
