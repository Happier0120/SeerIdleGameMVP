export function getNow(): number {
  return Date.now();
}

export function getRemainingMs(startedAt: number, durationMs: number, now: number): number {
  return Math.max(0, startedAt + durationMs - now);
}

export function formatRemainingTime(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
