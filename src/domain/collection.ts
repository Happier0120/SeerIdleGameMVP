import { PETS } from "../data/pets";
import type { CollectionEntry, PetId } from "./models";

export function createInitialCollection(): Record<PetId, CollectionEntry> {
  return Object.keys(PETS).reduce(
    (entries, petId) => ({
      ...entries,
      [petId]: {
        petId: petId as PetId,
        seen: false,
        owned: false
      }
    }),
    {} as Record<PetId, CollectionEntry>
  );
}

export function markSeen(
  collection: Record<PetId, CollectionEntry>,
  petId: PetId,
  now: number
): Record<PetId, CollectionEntry> {
  const entry = collection[petId];

  return {
    ...collection,
    [petId]: {
      ...entry,
      seen: true,
      firstSeenAt: entry.firstSeenAt ?? now
    }
  };
}

export function markOwned(
  collection: Record<PetId, CollectionEntry>,
  petId: PetId,
  now: number
): Record<PetId, CollectionEntry> {
  const seenCollection = markSeen(collection, petId, now);
  const entry = seenCollection[petId];

  return {
    ...seenCollection,
    [petId]: {
      ...entry,
      owned: true,
      firstOwnedAt: entry.firstOwnedAt ?? now
    }
  };
}

export function getCollectionProgress(collection: Record<PetId, CollectionEntry>): {
  owned: number;
  total: number;
  percent: number;
} {
  const entries = Object.values(collection);
  const owned = entries.filter((entry) => entry.owned).length;
  const total = entries.length;

  return {
    owned,
    total,
    percent: total === 0 ? 0 : Math.round((owned / total) * 100)
  };
}
