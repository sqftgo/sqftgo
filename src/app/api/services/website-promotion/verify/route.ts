import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { activateServiceWebsitePromotion } from "@/lib/billing/activate-website-promotion";
import { isServiceDirectoryCategory } from "@/features/dealers/lib/is-dealer-category";
import { mapWebsitePromotionRow } from "@/lib/mappers/website-promotion";
import { fetchRazorpayPayment } from "@/lib/razorpay/client";
import { getRazorpayConfig } from "@/lib/razorpay/config";
import { verifyPaymentSignature } from "@/lib/razorpay/verify";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import {
  verifyWebsitePromotionPaymentSchema,
  websitePromoZodError,
} from "@/lib/validation/website-promotion";
import type {
  DirectoryProfileRow,
  ServiceWebsitePromotionPaymentRow,
  ServiceWebsitePromotionPlanRow,
  ServiceWebsitePromotionRow,
} from "@/types/database";

export async function POST(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("Billing requires SUPABASE_SERVICE_ROLE_KEY", 503);
  }

  const config = getRazorpayConfig();
  if (!config) return jsonError("Razorpay is not configured", 503);

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON");
  }

  const parsed = verifyWebsitePromotionPaymentSchema.safeParse(body);
  if (!parsed.success) return jsonError(websitePromoZodError(parsed.error));

  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = parsed.data;

  const valid = verifyPaymentSignature({
    orderId: razorpayOrderId,
    paymentId: razorpayPaymentId,
    signature: razorpaySignature,
    keySecret: config.keySecret,
  });
  if (!valid) return jsonError("Invalid payment signature", 400);

  const captured = await fetchRazorpayPayment(razorpayPaymentId);
  if (!captured || captured.order_id !== razorpayOrderId) {
    return jsonError("Payment could not be confirmed", 400);
  }
  if (captured.status !== "captured" && captured.status !== "authorized") {
    return jsonError("Payment is not captured yet", 400);
  }

  const admin = createServiceClient();
  const { data: paymentRow, error: payErr } = await admin
    .from("service_website_promotion_payments")
    .select("*")
    .eq("razorpay_order_id", razorpayOrderId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (payErr) return jsonError(payErr.message, 500);
  if (!paymentRow) return jsonError("Order not found", 404);

  const row = paymentRow as ServiceWebsitePromotionPaymentRow;
  if (captured.amount !== row.amount_paise) {
    return jsonError("Payment amount does not match the order", 400);
  }

  const { data: dir } = await admin
    .from("directory_profiles")
    .select("*")
    .eq("id", row.directory_profile_id)
    .maybeSingle();
  const profileRow = dir as DirectoryProfileRow | null;
  if (!profileRow || !isServiceDirectoryCategory(profileRow.category)) {
    return jsonError("Service profile not found", 404);
  }

  if (row.status === "paid") {
    const { data: promo } = await admin
      .from("service_website_promotions")
      .select("*")
      .eq("directory_profile_id", row.directory_profile_id)
      .maybeSingle();
    return jsonOk({
      alreadyProcessed: true,
      promotion: promo
        ? mapWebsitePromotionRow(promo as ServiceWebsitePromotionRow)
        : null,
    });
  }

  if (!row.plan_id) return jsonError("Plan missing on payment", 500);
  const { data: plan } = await admin
    .from("service_website_promotion_plans")
    .select("*")
    .eq("id", row.plan_id)
    .maybeSingle();
  if (!plan) return jsonError("Plan not found", 404);

  await admin
    .from("service_website_promotion_payments")
    .update({ razorpay_signature: razorpaySignature })
    .eq("id", row.id);

  const notes = row.notes as { website_url?: string } | null;
  const activated = await activateServiceWebsitePromotion({
    supabase: admin,
    userId: user.id,
    directoryProfileId: row.directory_profile_id,
    plan: plan as ServiceWebsitePromotionPlanRow,
    paymentRowId: row.id,
    razorpayPaymentId,
    razorpayOrderId,
    websiteUrl: notes?.website_url,
  });

  if (!activated.ok) return jsonError(activated.error, 500);

  return jsonOk({
    alreadyProcessed: false,
    promotion: mapWebsitePromotionRow(activated.promotion, plan as ServiceWebsitePromotionPlanRow),
  });
}
