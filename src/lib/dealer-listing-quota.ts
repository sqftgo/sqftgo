import type { SupabaseClient } from "@supabase/supabase-js";
import { ROUTES } from "@/constants/routes";
import { getPartnerPlan } from "@/features/billing/plans";

export const LISTING_QUOTA_CODE = "LISTING_QUOTA";
export const DEFAULT_DEALER_FREE_LISTINGS = 3;

export type DealerListingQuota = {
  used: number;
  free: number;
  purchased: number;
  quota: number;
  remaining: number;
  atCap: boolean;
  unlimited: boolean;
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
  planLimit?: number | null;
  unlimited?: boolean;
}): DealerListingQuota {
  if (input.unlimited) {
    return {
      used: input.used,
      free: input.free,
      purchased: input.purchased,
      quota: input.used,
      remaining: 9999,
      atCap: false,
      unlimited: true,
      checkoutPath: ROUTES.dealerSubscription,
    };
  }

  const included = input.planLimit != null ? Math.max(input.free, input.planLimit) : input.free;
  const quota = included + input.purchased;
  const remaining = Math.max(0, quota - input.used);
  return {
    used: input.used,
    free: included,
    purchased: input.purchased,
    quota,
    remaining,
    atCap: input.used >= quota,
    unlimited: false,
    checkoutPath: ROUTES.dealerSubscription,
  };
}

function subscriptionStillActive(row: {
  status: string;
  current_period_end: string | null;
}): boolean {
  if (row.status !== "active") return false;
  if (!row.current_period_end) return false;
  return new Date(row.current_period_end).getTime() > Date.now();
}

export async function loadDealerListingQuota(
  admin: SupabaseClient,
  dealerId: string
): Promise<DealerListingQuota> {
  const [
    { data: settings },
    { data: profile, error: profileError },
    { count, error: countError },
    { data: subscription },
  ] = await Promise.all([
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
    admin
      .from("dealer_subscriptions")
      .select("plan, status, current_period_end")
      .eq("user_id", dealerId)
      .maybeSingle(),
  ]);

  if (profileError) throw new Error(profileError.message);
  if (countError) throw new Error(countError.message);

  const free = freeListingsFromSettings(settings?.max_listings_per_dealer);
  let planLimit: number | null | undefined;
  let unlimited = false;

  if (subscription && subscriptionStillActive(subscription)) {
    const plan = getPartnerPlan(subscription.plan);
    if (plan) {
      if (plan.listingLimit == null) unlimited = true;
      else planLimit = plan.listingLimit;
    }
  }

  return buildDealerQuota({
    used: count ?? 0,
    free,
    purchased: profile?.listing_slots_purchased ?? 0,
    planLimit,
    unlimited,
  });
}
