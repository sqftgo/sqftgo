/** Lowercase URL slug from a display name (letters, numbers, hyphens). */
export function slugify(input: string, maxLen = 120): string {
  const s = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLen);
  return s || "item";
}
