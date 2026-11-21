import type { DirectoryProfile } from "@/types";

/** Prefer SEO slug when present; fall back to UUID. */
export function serviceProfilePath(
  profile: Pick<DirectoryProfile, "id" | "slug">
): string {
  const slug = profile.slug?.trim();
  return `/services/${slug || profile.id}`;
}
