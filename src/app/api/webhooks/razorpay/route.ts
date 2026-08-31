import { type NextRequest, NextResponse } from "next/server";
import { activateDealerSubscription } from "@/lib/billing/activate";
import { getRazorpayConfig } from "@/lib/razorpay/config";
import { verifyWebhookSignature } from "@/lib/razorpay/verify";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import type {
  DealerSubscriptionPaymentRow,
  SubscriptionPlanDb,
} from "@/types/database";

type RazorpayWebhookPayload = {
  event?: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
        status?: string;
        notes?: Record<string, string>;
      };
    };
  };
};

/**
 * Razorpay webhook — set URL to /api/webhooks/razorpay
 * Events: payment.captured (minimum)
 */
export async function POST(request: NextRequest) {
  if (!hasSupabaseEnv() || !hasServiceRoleKey()) {
    return NextResponse.json({ error: "Unavailable" }, { status: 503 });
  }

  const config = getRazorpayConfig();
  if (!config?.webhookSecret) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 503 }
    );
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";

  const valid = verifyWebhookSignature({
    rawBody,
    signature,
    webhookSecret: config.webhookSecret,
  });

  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let payload: RazorpayWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as RazorpayWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (payload.event !== "payment.captured") {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const payment = payload.payload?.payment?.entity;
  const orderId = payment?.order_id;
  const paymentId = payment?.id;

  if (!orderId || !paymentId) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const supabase = createServiceClient();
  const { data: paymentRow } = await supabase
    .from("dealer_subscription_payments")
    .select("*")
    .eq("razorpay_order_id", orderId)
    .maybeSingle();

  if (!paymentRow) {
    return NextResponse.json({ ok: true, unmatched: true });
  }

  const row = paymentRow as DealerSubscriptionPaymentRow;
  if (row.status === "paid") {
    return NextResponse.json({ ok: true, alreadyProcessed: true });
  }

  const userId =
    payment?.notes?.user_id ||
    (typeof row.notes === "object" &&
    row.notes &&
    !Array.isArray(row.notes) &&
    "user_id" in row.notes
      ? String((row.notes as Record<string, unknown>).user_id)
      : row.user_id);

  await activateDealerSubscription({
    supabase,
    userId: userId || row.user_id,
    planId: row.plan as SubscriptionPlanDb,
    paymentRowId: row.id,
    razorpayPaymentId: paymentId,
    razorpayOrderId: orderId,
  });

  return NextResponse.json({ ok: true });
}
