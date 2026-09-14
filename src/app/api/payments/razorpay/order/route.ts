import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { enforceRateLimit } from "@/lib/auth/rate-limit";
import {
  createRazorpayOrder,
  getRazorpayKeyId,
  hasRazorpayConfig,
} from "@/lib/payments/razorpay";
import type { ListingPlanRow } from "@/lib/payments/listing-orders";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";

export async function POST(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required.", 503);
  }
  if (!hasRazorpayConfig()) {
    return jsonError("Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.", 503);
  }

  const limited = await enforceRateLimit(
    request,
    "payments:order",
    8,
    60_000,
    "Too many payment attempts. Try again shortly."
  );
  if (limited) return limited;

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (profile.status !== "active" || profile.role !== "broker") {
    return jsonError("Only active dealers can buy listing packs.", 403);
  }

  let body: { planId?: string };
  try {
    body = (await request.json()) as { planId?: string };
  } catch {
    return jsonError("Invalid JSON body");
  }

  const planId = body.planId?.trim();
  if (!planId) return jsonError("planId is required");

  const admin = createServiceClient();
  const { data: plan, error: planError } = await admin
    .from("listing_plans")
    .select("*")
    .eq("id", planId)
    .eq("is_active", true)
    .maybeSingle();
  if (planError) return jsonError(planError.message, 500);
  if (!plan) return jsonError("That listing plan is not available", 404);

  const row = plan as ListingPlanRow;
  const { data: localOrder, error: insertError } = await admin
    .from("listing_orders")
    .insert({
      dealer_id: user.id,
      plan_id: row.id,
      provider: "razorpay",
      amount_paise: row.price_paise,
      slots: row.slots,
      status: "created",
    })
    .select("id")
    .single();
  if (insertError || !localOrder) {
    return jsonError(insertError?.message ?? "Unable to create order", 500);
  }

  try {
    const rzp = await createRazorpayOrder({
      amountPaise: row.price_paise,
      receipt: localOrder.id.replace(/-/g, "").slice(0, 40),
      notes: {
        listing_order_id: localOrder.id,
        dealer_id: user.id,
        plan_id: row.id,
        plan_slug: row.slug,
      },
    });

    const { error: linkError } = await admin
      .from("listing_orders")
      .update({ razorpay_order_id: rzp.id })
      .eq("id", localOrder.id);
    if (linkError) return jsonError(linkError.message, 500);

    return jsonOk({
      orderId: localOrder.id,
      razorpayOrderId: rzp.id,
      amountPaise: row.price_paise,
      currency: "INR",
      keyId: getRazorpayKeyId(),
      planName: row.name,
      slots: row.slots,
      prefill: {
        name: profile.name,
        email: profile.email,
        contact: profile.phone ?? "",
      },
    });
  } catch (err) {
    await admin.from("listing_orders").update({ status: "failed" }).eq("id", localOrder.id);
    return jsonError(err instanceof Error ? err.message : "Unable to start Razorpay checkout", 502);
  }
}
