import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { loadDealerListingQuota } from "@/lib/dealer-listing-quota";
import { fulfillListingOrder } from "@/lib/payments/listing-orders";
import { fetchRazorpayPayment } from "@/lib/razorpay/client";
import { getRazorpayConfig } from "@/lib/razorpay/config";
import { verifyPaymentSignature } from "@/lib/razorpay/verify";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";

export async function POST(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required.", 503);
  }

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (profile.role !== "broker") return jsonError("Forbidden", 403);

  let body: { razorpayOrderId?: string; razorpayPaymentId?: string; razorpaySignature?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return jsonError("Invalid JSON body");
  }

  const razorpayOrderId = body.razorpayOrderId?.trim() ?? "";
  const razorpayPaymentId = body.razorpayPaymentId?.trim() ?? "";
  const razorpaySignature = body.razorpaySignature?.trim() ?? "";
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return jsonError("Payment details are required");
  }

  const config = getRazorpayConfig();
  if (!config) return jsonError("Razorpay is not configured", 503);
  if (
    !verifyPaymentSignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
      keySecret: config.keySecret,
    })
  ) {
    return jsonError("Invalid payment signature", 400);
  }

  const captured = await fetchRazorpayPayment(razorpayPaymentId);
  if (!captured || captured.order_id !== razorpayOrderId) {
    return jsonError("Payment could not be confirmed", 400);
  }
  if (captured.status !== "captured" && captured.status !== "authorized") {
    return jsonError("Payment is not captured yet", 400);
  }

  const admin = createServiceClient();
  const { data: order, error: orderError } = await admin
    .from("listing_orders")
    .select("id, dealer_id, amount_paise")
    .eq("razorpay_order_id", razorpayOrderId)
    .eq("dealer_id", user.id)
    .maybeSingle();
  if (orderError) return jsonError(orderError.message, 500);
  if (!order) return jsonError("Order not found", 404);
  if (captured.amount !== order.amount_paise) {
    return jsonError("Payment amount does not match the order", 400);
  }

  try {
    await fulfillListingOrder(admin, { orderId: order.id, paymentId: razorpayPaymentId });
    const quota = await loadDealerListingQuota(admin, user.id);
    return jsonOk({ ok: true, quota });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Unable to confirm payment", 500);
  }
}
