import type { AdminUser } from "@/types";
import type { ProfileRow } from "@/types/database";

export function mapAdminUser(row: ProfileRow): AdminUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    status: row.status,
    joinedDate: row.created_at.split("T")[0] ?? row.created_at,
    inquiriesCount: 0,
    listingStatus: row.listing_status,
    listingVerifiedAt: row.listing_verified_at,
  };
}
