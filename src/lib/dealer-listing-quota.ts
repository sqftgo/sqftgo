import type { SupabaseClient } from "@supabase/supabase-js";
import { ROUTES } from "@/constants/routes";

export const LISTING_QUOTA_CODE = "LISTING_QUOTA";
export const DEFAULT_DEALER_FREE_LISTINGS = 3;

export type DealerListingQuota = {
  used: number;
  free: number;
  purchased: number;
  quota: number;
  remaining: number;
  atCap: boolean;
  checkoutPath: string;
};

export function freeListingsFromSettings(maxListingsPerDealer: number | null | undefined): number {
  if (typeof maxListingsPerDealer === "number" && maxListingsPerDealer >= 1) {
    return maxListingsPerDealer;
  }
  return DEFAULT_DEALER_FREE_LISTINGS;
}

export function buildDealerQuota(input: {
  used: number;
  free: number;
  purchased: number;
}): DealerListingQuota {
  const quota = input.free + input.purchased;
  const remaining = Math.max(0, quota - input.used);
  return {
    used: input.used,
    free: input.free,
    purchased: input.purchased,
    quota,
    remaining,
    atCap: input.used >= quota,
    checkoutPath: ROUTES.dealerSubscription,
  };
}

export async function loadDealerListingQuota(
  admin: SupabaseClient,
  dealerId: string
): Promise<DealerListingQuota> {
  const [{ data: settings }, { data: profile, error: profileError }, { count, error: countError }] =
    await Promise.all([
      admin
        .from("platform_settings")
        .select("max_listings_per_dealer")
        .eq("id", 1)
        .maybeSingle(),
      admin.from("profiles").select("listing_slots_purchased").eq("id", dealerId).maybeSingle(),
      admin
        .from("properties")
        .select("id", { count: "exact", head: true })
        .eq("owner_id", dealerId)
        .neq("status", "rejected"),
    ]);

  if (profileError) throw new Error(profileError.message);
  if (countError) throw new Error(countError.message);

  return buildDealerQuota({
    used: count ?? 0,
    free: freeListingsFromSettings(settings?.max_listings_per_dealer),
    purchased: profile?.listing_slots_purchased ?? 0,
  });
}
