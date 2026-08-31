import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { canAccessDealerDashboard } from "@/lib/authz";
import { getPartnerPlan } from "@/features/billing/plans";
import { createRazorpayOrder } from "@/lib/razorpay/client";
import { getRazorpayKeyIdPublic, isRazorpayConfigured } from "@/lib/razorpay/config";
import { createSubscriptionOrderSchema } from "@/lib/validation/billing";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";

export async function POST(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("Billing requires SUPABASE_SERVICE_ROLE_KEY", 503);
  }
  if (!isRazorpayConfigured()) {
    return jsonError(
      "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
      503
    );
  }

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (!canAccessDealerDashboard(profile)) return jsonError("Forbidden", 403);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON");
  }

  const parsed = createSubscriptionOrderSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid plan", 400);
  }

  const plan = getPartnerPlan(parsed.data.planId);
  if (!plan) return jsonError("Unknown plan", 400);

  const supabase = createServiceClient();
  const receipt = `sub_${user.id.slice(0, 8)}_${Date.now().toString(36)}`;

  let order;
  try {
    order = await createRazorpayOrder({
      amountPaise: plan.amountPaise,
      currency: plan.currency,
      receipt,
      notes: {
        user_id: user.id,
        plan_id: plan.id,
        purpose: "dealer_subscription",
      },
    });
  } catch (err) {
    return jsonError(
      err instanceof Error ? err.message : "Failed to create Razorpay order",
      502
    );
  }

  const { data: payment, error: insertErr } = await supabase
    .from("dealer_subscription_payments")
    .insert({
      user_id: user.id,
      plan: plan.id,
      amount_paise: plan.amountPaise,
      currency: plan.currency,
      status: "created",
      razorpay_order_id: order.id,
      receipt,
      notes: {
        plan_id: plan.id,
        plan_name: plan.name,
      },
    })
    .select("id")
    .maybeSingle();

  if (insertErr || !payment) {
    return jsonError(insertErr?.message ?? "Failed to record payment", 500);
  }

  await supabase.from("dealer_subscriptions").upsert(
    {
      user_id: user.id,
      plan: plan.id,
      status: "pending",
      billing_cycle: "monthly",
      amount_paise: plan.amountPaise,
      currency: plan.currency,
      last_payment_id: payment.id,
    },
    { onConflict: "user_id" }
  );

  return jsonOk({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: getRazorpayKeyIdPublic(),
    paymentRecordId: payment.id,
    plan: {
      id: plan.id,
      name: plan.name,
      amountPaise: plan.amountPaise,
    },
  });
}
