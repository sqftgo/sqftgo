import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ServiceWebsitePromotionPaymentRow,
  ServiceWebsitePromotionPlanRow,
  ServiceWebsitePromotionRow,
} from "@/types/database";

type ActivateInput = {
  supabase: SupabaseClient;
  userId: string;
  directoryProfileId: string;
  plan: ServiceWebsitePromotionPlanRow;
  paymentRowId: string;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  websiteUrl?: string;
};

export async function activateServiceWebsitePromotion(
  input: ActivateInput
): Promise<{ ok: true; promotion: ServiceWebsitePromotionRow } | { ok: false; error: string }> {
  const {
    supabase,
    userId,
    directoryProfileId,
    plan,
    paymentRowId,
    razorpayPaymentId,
    razorpayOrderId,
    websiteUrl,
  } = input;

  const now = new Date();
  const expires = new Date(now.getTime() + plan.duration_days * 24 * 60 * 60 * 1000);

  const { data: existing } = await supabase
    .from("service_website_promotions")
    .select("*")
    .eq("directory_profile_id", directoryProfileId)
    .maybeSingle();

  let startsAt = now.toISOString();
  let expiresAt = expires.toISOString();

  const existingRow = existing as ServiceWebsitePromotionRow | null;
  if (
    existingRow &&
    existingRow.status === "active" &&
    existingRow.expires_at &&
    new Date(existingRow.expires_at).getTime() > now.getTime()
  ) {
    startsAt = existingRow.starts_at || startsAt;
    const base = new Date(existingRow.expires_at);
    expiresAt = new Date(
      base.getTime() + plan.duration_days * 24 * 60 * 60 * 1000
    ).toISOString();
  }

  const resolvedWebsite =
    (websiteUrl && websiteUrl.trim()) ||
    existingRow?.website_url ||
    "";

  const { error: payErr } = await supabase
    .from("service_website_promotion_payments")
    .update({
      status: "paid",
      razorpay_payment_id: razorpayPaymentId,
      paid_at: now.toISOString(),
    })
    .eq("id", paymentRowId)
    .eq("razorpay_order_id", razorpayOrderId);

  if (payErr) return { ok: false, error: payErr.message };

  const upsertPayload = {
    directory_profile_id: directoryProfileId,
    user_id: userId,
    plan_id: plan.id,
    status: "active" as const,
    starts_at: startsAt,
    expires_at: expiresAt,
    website_url: resolvedWebsite,
    last_payment_id: paymentRowId,
    updated_at: now.toISOString(),
  };

  const { data: promotion, error: promoErr } = await supabase
    .from("service_website_promotions")
    .upsert(upsertPayload, { onConflict: "directory_profile_id" })
    .select("*")
    .single();

  if (promoErr || !promotion) {
    return { ok: false, error: promoErr?.message ?? "Failed to activate promotion" };
  }

  if (resolvedWebsite) {
    await supabase
      .from("directory_profiles")
      .update({ website: resolvedWebsite })
      .eq("id", directoryProfileId);
  }

  return { ok: true, promotion: promotion as ServiceWebsitePromotionRow };
}

export async function fulfillWebsitePromotionOrderByRazorpayOrder(
  supabase: SupabaseClient,
  orderId: string,
  paymentId: string
): Promise<boolean> {
  await supabase.rpc("expire_service_website_promotions");

  const { data: paymentRow } = await supabase
    .from("service_website_promotion_payments")
    .select("*")
    .eq("razorpay_order_id", orderId)
    .maybeSingle();

  if (!paymentRow) return false;
  const row = paymentRow as ServiceWebsitePromotionPaymentRow;
  if (row.status === "paid") return true;

  if (!row.plan_id) return false;
  const { data: plan } = await supabase
    .from("service_website_promotion_plans")
    .select("*")
    .eq("id", row.plan_id)
    .maybeSingle();
  if (!plan) return false;

  const notes = row.notes as { website_url?: string } | null;
  const result = await activateServiceWebsitePromotion({
    supabase,
    userId: row.user_id,
    directoryProfileId: row.directory_profile_id,
    plan: plan as ServiceWebsitePromotionPlanRow,
    paymentRowId: row.id,
    razorpayPaymentId: paymentId,
    razorpayOrderId: orderId,
    websiteUrl: notes?.website_url,
  });

  return result.ok;
}