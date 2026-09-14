import { type NextRequest, NextResponse } from "next/server";
import { fulfillListingOrder } from "@/lib/payments/listing-orders";
import { verifyWebhookSignature } from "@/lib/payments/razorpay";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";

export const runtime = "nodejs";

type RazorpayWebhook = {
  event?: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
        notes?: { listing_order_id?: string };
      };
    };
  };
};

export async function POST(request: NextRequest) {
  if (!hasSupabaseEnv() || !hasServiceRoleKey()) {
    return NextResponse.json({ error: "Unavailable" }, { status: 503 });
  }

  const raw = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";
  if (!verifyWebhookSignature(raw, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: RazorpayWebhook;
  try {
    event = JSON.parse(raw) as RazorpayWebhook;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (event.event !== "payment.captured") {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const payment = event.payload?.payment?.entity;
  const razorpayOrderId = payment?.order_id;
  const paymentId = payment?.id;
  if (!razorpayOrderId || !paymentId) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const admin = createServiceClient();
  const { data: order, error } = await admin
    .from("listing_orders")
    .select("id")
    .eq("razorpay_order_id", razorpayOrderId)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!order) return NextResponse.json({ ok: true, ignored: true });

  try {
    await fulfillListingOrder(admin, { orderId: order.id, paymentId });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Fulfill failed" },
      { status: 500 }
    );
  }
}
