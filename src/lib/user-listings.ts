import type { ListerStatus } from "@/types";

export const DEFAULT_MAX_LISTINGS_PER_USER = 2;

export const NEARBY_REQUIRED_MESSAGE =
  "Add nearest hospital, school, and transportation (name and distance, e.g. GBH American Hospital, 2 km).";

export function hasNearbyLandmarks(input: {
  nearbyHospital?: string | null;
  nearbySchool?: string | null;
  nearbyTransportation?: string | null;
}): boolean {
  return Boolean(
    input.nearbyHospital?.trim() &&
      input.nearbySchool?.trim() &&
      input.nearbyTransportation?.trim()
  );
}

export function listingStatusLabel(status: ListerStatus | undefined): string {
  switch (status) {
    case "approved":
      return "Verified by Admin";
    case "pending":
      return "Pending admin review";
    case "rejected":
      return "Listing access declined";
    default:
      return "Not listed yet";
  }
}
