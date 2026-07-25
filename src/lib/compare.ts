/** Max properties in the local compare tray. */
export const COMPARE_LIMIT = 4;

/** Toggle a property id in the compare list (FIFO when over limit). */
export function toggleCompareList(prev: string[], id: string, limit = COMPARE_LIMIT): string[] {
  if (prev.includes(id)) return prev.filter((x) => x !== id);
  if (prev.length >= limit) return [...prev.slice(1), id];
  return [...prev, id];
}
