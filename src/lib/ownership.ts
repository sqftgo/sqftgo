import type { DirectoryProfile, Project, Property } from "@/types";

/**
 * Prefer stable auth/profile ids over email. Email is a display fallback only
 * for legacy directory rows that still lack user_id.
 */
export function isOwnDirectoryProfile(
  profile: Pick<DirectoryProfile, "userId" | "email">,
  userId: string | null | undefined,
  userEmail?: string | null
): boolean {
  if (userId && profile.userId) return profile.userId === userId;
  if (userEmail && profile.email) {
    return profile.email.toLowerCase() === userEmail.toLowerCase();
  }
  return false;
}

export function isOwnProperty(
  property: Pick<Property, "ownerId" | "ownerEmail">,
  userId: string | null | undefined,
  userEmail?: string | null
): boolean {
  if (userId && property.ownerId) return property.ownerId === userId;
  if (userEmail && property.ownerEmail) {
    return property.ownerEmail.toLowerCase() === userEmail.toLowerCase();
  }
  return false;
}

export function isOwnProject(
  project: Pick<Project, "ownerId">,
  userId: string | null | undefined,
): boolean {
  return Boolean(userId && project.ownerId && project.ownerId === userId);
}

export function findMyDirectoryProfile(
  profiles: DirectoryProfile[],
  userId: string | null | undefined,
  userEmail?: string | null
): DirectoryProfile | undefined {
  return profiles.find((p) => isOwnDirectoryProfile(p, userId, userEmail));
}

export function filterMyProperties(
  properties: Property[],
  userId: string | null | undefined,
  userEmail?: string | null
): Property[] {
  return properties.filter((p) => isOwnProperty(p, userId, userEmail));
}

/** Public dealer page: attribute listings by owner_id when linked. */
export function filterDealerListings(
  properties: Property[],
  profile: Pick<DirectoryProfile, "userId" | "email" | "mobile">
): Property[] {
  const active = properties.filter((p) => p.status === "Active");
  if (profile.userId) {
    return active.filter((p) => p.ownerId === profile.userId);
  }
  return active.filter(
    (p) =>
      (p.ownerEmail &&
        p.ownerEmail.toLowerCase() === profile.email.toLowerCase()) ||
      (profile.mobile && p.ownerPhone === profile.mobile)
  );
}
