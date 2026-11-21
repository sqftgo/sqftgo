import type { UserProfile } from "@/types";
import type { ProfileRow } from "@/types/database";

export function mapProfileRow(profile: ProfileRow): UserProfile {
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    phone: profile.phone ?? undefined,
    countryCode: profile.country_code ?? undefined,
    mobileVerified: profile.mobile_verified ?? undefined,
    mobileVerifiedAt: profile.mobile_verified_at ?? undefined,
    avatar: profile.avatar_url ?? undefined,
    bio: profile.bio ?? undefined,
    city: profile.city ?? undefined,
    cityId: profile.city_id ?? undefined,
    role: profile.role,
    joinedDate: profile.created_at.split("T")[0] ?? profile.created_at,
    listingStatus: profile.listing_status,
    listingVerifiedAt: profile.listing_verified_at,
  };
}

/**
 * Session JSON for web (cookies) and mobile (Bearer).
 * Flat fields + accessToken support Expo clients that cannot use Next cookies.
 */
export type AuthSessionTokens = {
  refreshToken?: string;
  expiresAt?: number;
};

export function authSessionPayload(
  profile: ProfileRow,
  accessToken?: string,
  tokens: AuthSessionTokens = {}
) {
  const mapped = mapProfileRow(profile);
  return {
    email: profile.email,
    role: profile.role,
    name: profile.name,
    profile: mapped,
    id: profile.id,
    phone: profile.phone ?? undefined,
    countryCode: profile.country_code ?? undefined,
    mobileVerified: profile.mobile_verified ?? undefined,
    mobileVerifiedAt: profile.mobile_verified_at ?? undefined,
    status: profile.status,
    bio: profile.bio ?? undefined,
    city: profile.city ?? undefined,
    cityId: profile.city_id ?? undefined,
    avatarUrl: profile.avatar_url ?? undefined,
    dealerAccess: profile.role === "broker" ? ("approved" as const) : ("none" as const),
    joinedDate: profile.created_at,
    ...(accessToken ? { accessToken } : {}),
    ...(tokens.refreshToken ? { refreshToken: tokens.refreshToken } : {}),
    ...(tokens.expiresAt ? { expiresAt: tokens.expiresAt } : {}),
  };
}
