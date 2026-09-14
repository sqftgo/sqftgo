import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { canAccessDealerDashboard } from "@/lib/authz";
import {
  mapDealerSubscription,
  mapDealerSubscriptionPayment,
} from "@/lib/mappers/billing";
import { getRazorpayKeyIdPublic, isRazorpayConfigured } from "@/lib/razorpay/config";
import { createServiceClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import type {
  DealerSubscriptionPaymentRow,
  DealerSubscriptionRow,
} from "@/types/database";
import type { SubscriptionOverview } from "@/types/billing";

async function db() {
  return hasServiceRoleKey() ? createServiceClient() : await createClient();
}

export async function GET(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (!canAccessDealerDashboard(profile)) return jsonError("Forbidden", 403);

  const supabase = await db();

  const [{ data: sub }, { data: payments }] = await Promise.all([
    supabase
      .from("dealer_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("dealer_subscription_payments")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const payload: SubscriptionOverview = {
    billingEnabled: isRazorpayConfigured(),
    razorpayKeyId: getRazorpayKeyIdPublic(),
    subscription: sub
      ? mapDealerSubscription(sub as DealerSubscriptionRow)
      : null,
    recentPayments: ((payments ?? []) as DealerSubscriptionPaymentRow[]).map(
      mapDealerSubscriptionPayment
    ),
  };

  return jsonOk(payload);
}
