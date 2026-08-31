import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { getPartnerPlan, type PartnerPlanId } from "@/features/billing/plans";
import type { Database } from "@/types/database";

type AdminClient = SupabaseClient<Database>;

export async function activateDealerSubscription(params: {
  supabase: AdminClient;
  userId: string;
  planId: PartnerPlanId;
  paymentRowId: string;
  razorpayPaymentId: string;
  razorpayOrderId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const plan = getPartnerPlan(params.planId);
  if (!plan) return { ok: false, error: "Unknown plan" };

  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setUTCDate(periodEnd.getUTCDate() + plan.billingDays);

  const { data: payment, error: payErr } = await params.supabase
    .from("dealer_subscription_payments")
    .update({
      status: "paid",
      razorpay_payment_id: params.razorpayPaymentId,
      paid_at: now.toISOString(),
    })
    .eq("id", params.paymentRowId)
    .eq("user_id", params.userId)
    .select("id, subscription_id")
    .maybeSingle();

  if (payErr) return { ok: false, error: payErr.message };
  if (!payment) return { ok: false, error: "Payment row not found" };

  const { data: existing } = await params.supabase
    .from("dealer_subscriptions")
    .select("id")
    .eq("user_id", params.userId)
    .maybeSingle();

  const subPayload = {
    user_id: params.userId,
    plan: params.planId,
    status: "active" as const,
    billing_cycle: "monthly" as const,
    amount_paise: plan.amountPaise,
    currency: plan.currency,
    current_period_start: now.toISOString(),
    current_period_end: periodEnd.toISOString(),
    cancel_at_period_end: false,
    razorpay_payment_id: params.razorpayPaymentId,
    last_payment_id: payment.id,
    metadata: {
      last_order_id: params.razorpayOrderId,
      activated_via: "checkout",
    },
  };

  if (existing?.id) {
    const { error } = await params.supabase
      .from("dealer_subscriptions")
      .update(subPayload)
      .eq("id", existing.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await params.supabase
      .from("dealer_subscriptions")
      .insert(subPayload);
    if (error) return { ok: false, error: error.message };
  }

  return { ok: true };
}
