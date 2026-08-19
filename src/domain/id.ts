export function createId(prefix: string, now: number): string {
  return `${prefix}_${now}_${Math.random().toString(36).slice(2, 8)}`;
}
