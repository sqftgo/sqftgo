import type { UserProfile } from "@/types";
import type { ProfileRow } from "@/types/database";

export function mapProfileRow(profile: ProfileRow): UserProfile {
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    phone: profile.phone ?? undefined,
    avatar: profile.avatar_url ?? undefined,
    bio: profile.bio ?? undefined,
    city: profile.city ?? undefined,
    role: profile.role,
    joinedDate: profile.created_at.split("T")[0] ?? profile.created_at,
  };
}

/**
 * Session JSON for web cookie clients and Expo Bearer clients.
 * Web uses email/role/name/profile; mobile also needs id/status/accessToken.
 */
export function authSessionPayload(
  profile: ProfileRow,
  accessToken?: string | null
) {
  const mapped = mapProfileRow(profile);
  return {
    email: profile.email,
    role: profile.role,
    name: profile.name,
    profile: mapped,
    id: profile.id,
    phone: profile.phone ?? undefined,
    status: profile.status,
    joinedDate: mapped.joinedDate,
    ...(accessToken ? { accessToken } : {}),
  };
}
