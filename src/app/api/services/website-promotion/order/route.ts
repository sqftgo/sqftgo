import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { isServiceDirectoryCategory } from "@/features/dealers/lib/is-dealer-category";
import { enforceRateLimit } from "@/lib/auth/rate-limit";
import { createRazorpayOrder } from "@/lib/razorpay/client";
import { getRazorpayKeyIdPublic, isRazorpayConfigured } from "@/lib/razorpay/config";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import {
  createWebsitePromotionOrderSchema,
  websitePromoZodError,
} from "@/lib/validation/website-promotion";
import type {
  DirectoryProfileRow,
  ServiceWebsitePromotionPlanRow,
} from "@/types/database";

export async function POST(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  const limited = await enforceRateLimit(
    request,
    "payments:service-website-promo-order",
    8,
    60_000,
    "Too many payment attempts. Try again shortly."
  );
  if (limited) return limited;
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
  if (profile.status === "suspended") return jsonError("Forbidden", 403);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON");
  }

  const parsed = createWebsitePromotionOrderSchema.safeParse(body);
  if (!parsed.success) return jsonError(websitePromoZodError(parsed.error));

  const admin = createServiceClient();
  const { data: dir } = await admin
    .from("directory_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!dir) {
    return jsonError("Register your service business before purchasing website promotion.", 404);
  }
  const profileRow = dir as DirectoryProfileRow;
  if (!isServiceDirectoryCategory(profileRow.category)) {
    return jsonError("Website promotion is only available for service providers.", 403);
  }

  const { data: planRow, error: planErr } = await admin
    .from("service_website_promotion_plans")
    .select("*")
    .eq("id", parsed.data.planId)
    .eq("is_active", true)
    .maybeSingle();

  if (planErr) return jsonError(planErr.message, 500);
  if (!planRow) return jsonError("Selected plan is unavailable", 404);
  const plan = planRow as ServiceWebsitePromotionPlanRow;

  const websiteUrl =
    parsed.data.websiteUrl?.trim() ||
    profileRow.website?.trim() ||
    "";

  const receipt = `swp_${user.id.slice(0, 8)}_${Date.now().toString(36)}`;

  let order;
  try {
    order = await createRazorpayOrder({
      amountPaise: plan.price_paise,
      currency: plan.currency || "INR",
      receipt,
      notes: {
        user_id: user.id,
        plan_id: plan.id,
        directory_profile_id: profileRow.id,
        purpose: "service_website_promotion",
      },
    });
  } catch (err) {
    return jsonError(
      err instanceof Error ? err.message : "Failed to create Razorpay order",
      502
    );
  }

  const { data: payment, error: insertErr } = await admin
    .from("service_website_promotion_payments")
    .insert({
      directory_profile_id: profileRow.id,
      user_id: user.id,
      plan_id: plan.id,
      amount_paise: plan.price_paise,
      currency: plan.currency || "INR",
      status: "created",
      razorpay_order_id: order.id,
      receipt,
      notes: {
        plan_id: plan.id,
        plan_name: plan.name,
        website_url: websiteUrl,
        billing_type: plan.billing_type,
        duration_days: plan.duration_days,
      },
    })
    .select("id")
    .maybeSingle();

  if (insertErr || !payment) {
    return jsonError(insertErr?.message ?? "Failed to record payment", 500);
  }

  await admin.from("service_website_promotions").upsert(
    {
      directory_profile_id: profileRow.id,
      user_id: user.id,
      plan_id: plan.id,
      status: "pending",
      website_url: websiteUrl || profileRow.website || "",
      last_payment_id: payment.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "directory_profile_id" }
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
      amountPaise: plan.price_paise,
      durationDays: plan.duration_days,
      billingType: plan.billing_type,
    },
  });
}
