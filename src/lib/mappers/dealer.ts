import type { DirectoryProfile } from "@/types";
import type { DirectoryProfileRow, DirectoryProfileInsert, DirectoryProfileUpdate } from "@/types/database";
import type { DealerUpdateInput } from "@/lib/validation/dealer";

export type DirectoryProfileView = DirectoryProfile & {
  userId?: string | null;
};

export function mapDealerRow(row: DirectoryProfileRow): DirectoryProfileView {
  return {
    id: row.id,
    userId: row.user_id,
    firmName: row.firm_name,
    ownerName: row.owner_name,
    category: row.category,
    serviceTypeId: row.service_type_id,
    city: row.city,
    address: row.address,
    email: row.email,
    website: row.website,
    mobile: row.mobile,
    description: row.description,
    reraId: row.rera_id ?? undefined,
    experience: row.experience ?? undefined,
    specialties: row.specialties ?? [],
    teamSize: row.team_size ?? undefined,
    listingsCount: row.listings_count,
    verificationStatus: row.verification_status ?? "unverified",
    listingActive: row.listing_active ?? true,
    lat: row.lat,
    lng: row.lng,
    coverImageUrl: row.cover_image_url,
    logoUrl: row.logo_url,
    businessHours: row.business_hours,
    servicesOffered: row.services_offered ?? [],
  };
}

export function mapDealerCreateToInsert(
  input: {
    firmName: string;
    ownerName: string;
    category: DirectoryProfile["category"];
    city: string;
    address?: string;
    email: string;
    website?: string;
    mobile: string;
    description?: string;
    reraId?: string;
    experience?: string;
    specialties?: string[];
    teamSize?: number;
    listingsCount?: number;
    serviceTypeId?: string | null;
    servicesOffered?: string[];
    businessHours?: Record<string, string> | null;
    coverImageUrl?: string | null;
    logoUrl?: string | null;
    lat?: number | null;
    lng?: number | null;
    verificationStatus?: DirectoryProfile["verificationStatus"];
  },
  userId: string | null
): DirectoryProfileInsert {
  return {
    user_id: userId,
    firm_name: input.firmName,
    owner_name: input.ownerName,
    category: input.category,
    city: input.city,
    address: input.address ?? "",
    email: input.email.toLowerCase(),
    website: input.website ?? "",
    mobile: input.mobile,
    description: input.description ?? "",
    rera_id: input.reraId || null,
    experience: input.experience || null,
    specialties: input.specialties ?? [],
    team_size: input.teamSize ?? null,
    listings_count: input.listingsCount ?? 0,
    service_type_id: input.serviceTypeId ?? null,
    services_offered: input.servicesOffered ?? [],
    business_hours: input.businessHours ?? null,
    cover_image_url: input.coverImageUrl ?? null,
    logo_url: input.logoUrl ?? null,
    lat: input.lat ?? null,
    lng: input.lng ?? null,
    verification_status: input.verificationStatus ?? "unverified",
    listing_active: true,
  };
}

export function mapDealerUpdateToPatch(updates: DealerUpdateInput): DirectoryProfileUpdate {
  const patch: DirectoryProfileUpdate = {};
  if (updates.firmName !== undefined) patch.firm_name = updates.firmName;
  if (updates.ownerName !== undefined) patch.owner_name = updates.ownerName;
  if (updates.category !== undefined) patch.category = updates.category;
  if (updates.city !== undefined) patch.city = updates.city;
  if (updates.address !== undefined) patch.address = updates.address;
  if (updates.email !== undefined) patch.email = updates.email.toLowerCase();
  if (updates.website !== undefined) patch.website = updates.website;
  if (updates.mobile !== undefined) patch.mobile = updates.mobile;
  if (updates.description !== undefined) patch.description = updates.description;
  if (updates.reraId !== undefined) patch.rera_id = updates.reraId || null;
  if (updates.experience !== undefined) patch.experience = updates.experience || null;
  if (updates.specialties !== undefined) patch.specialties = updates.specialties;
  if (updates.teamSize !== undefined) patch.team_size = updates.teamSize;
  if (updates.listingsCount !== undefined) patch.listings_count = updates.listingsCount;
  if (updates.serviceTypeId !== undefined) patch.service_type_id = updates.serviceTypeId;
  if (updates.servicesOffered !== undefined) patch.services_offered = updates.servicesOffered;
  if (updates.businessHours !== undefined) patch.business_hours = updates.businessHours;
  if (updates.coverImageUrl !== undefined) patch.cover_image_url = updates.coverImageUrl;
  if (updates.logoUrl !== undefined) patch.logo_url = updates.logoUrl;
  if (updates.lat !== undefined) patch.lat = updates.lat;
  if (updates.lng !== undefined) patch.lng = updates.lng;
  if (updates.listingActive !== undefined) patch.listing_active = updates.listingActive;
  if (updates.verificationStatus !== undefined) {
    patch.verification_status = updates.verificationStatus;
  }
  return patch;
}
