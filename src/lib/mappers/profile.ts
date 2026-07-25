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

export function authSessionPayload(profile: ProfileRow) {
  return {
    email: profile.email,
    role: profile.role,
    name: profile.name,
    profile: mapProfileRow(profile),
  };
}
