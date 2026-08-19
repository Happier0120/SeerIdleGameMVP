import { createInitialGameState } from "./initialState";

export function migrateSave(persistedState: unknown, version: number): unknown {
  if (version < 1 || !persistedState) {
    return createInitialGameState();
  }

  return persistedState;
}
