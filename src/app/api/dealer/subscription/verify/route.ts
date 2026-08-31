import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { canAccessDealerDashboard } from "@/lib/authz";
import { activateDealerSubscription } from "@/lib/billing/activate";
import { mapDealerSubscription } from "@/lib/mappers/billing";
import { getRazorpayConfig } from "@/lib/razorpay/config";
import { verifyPaymentSignature } from "@/lib/razorpay/verify";
import { verifySubscriptionPaymentSchema } from "@/lib/validation/billing";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import type {
  DealerSubscriptionPaymentRow,
  DealerSubscriptionRow,
  SubscriptionPlanDb,
} from "@/types/database";

export async function POST(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("Billing requires SUPABASE_SERVICE_ROLE_KEY", 503);
  }

  const config = getRazorpayConfig();
  if (!config) {
    return jsonError("Razorpay is not configured", 503);
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

  const parsed = verifySubscriptionPaymentSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid payload", 400);
  }

  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = parsed.data;

  const valid = verifyPaymentSignature({
    orderId: razorpayOrderId,
    paymentId: razorpayPaymentId,
    signature: razorpaySignature,
    keySecret: config.keySecret,
  });

  if (!valid) return jsonError("Invalid payment signature", 400);

  const supabase = createServiceClient();

  const { data: paymentRow, error: payErr } = await supabase
    .from("dealer_subscription_payments")
    .select("*")
    .eq("razorpay_order_id", razorpayOrderId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (payErr) return jsonError(payErr.message, 500);
  if (!paymentRow) return jsonError("Order not found", 404);

  const row = paymentRow as DealerSubscriptionPaymentRow;

  if (row.status === "paid") {
    const { data: sub } = await supabase
      .from("dealer_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    return jsonOk({
      alreadyProcessed: true,
      subscription: sub
        ? mapDealerSubscription(sub as DealerSubscriptionRow)
        : null,
    });
  }

  await supabase
    .from("dealer_subscription_payments")
    .update({ razorpay_signature: razorpaySignature })
    .eq("id", row.id);

  const activated = await activateDealerSubscription({
    supabase,
    userId: user.id,
    planId: row.plan as SubscriptionPlanDb,
    paymentRowId: row.id,
    razorpayPaymentId,
    razorpayOrderId,
  });

  if (!activated.ok) return jsonError(activated.error, 500);

  const { data: sub } = await supabase
    .from("dealer_subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return jsonOk({
    alreadyProcessed: false,
    subscription: sub
      ? mapDealerSubscription(sub as DealerSubscriptionRow)
      : null,
  });
}
