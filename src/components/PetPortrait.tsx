import { PETS } from "../data/pets";
import type { PetId } from "../domain/models";

const PORTRAITS: Record<string, string> = {
  sprout: "🌱",
  flame: "🔥",
  drop: "💧",
  star: "⭐",
  feather: "🍃",
  cactus: "🌵"
};

interface PetPortraitProps {
  petId: PetId;
  locked?: boolean;
  size?: "small" | "medium" | "large";
}

export function PetPortrait({ petId, locked = false, size = "medium" }: PetPortraitProps) {
  const pet = PETS[petId];

  return (
    <div className={`pet-portrait portrait-${size} ${locked ? "portrait-locked" : ""}`}>
      <span aria-hidden="true">{locked ? "?" : PORTRAITS[pet.portraitKey]}</span>
    </div>
  );
}
