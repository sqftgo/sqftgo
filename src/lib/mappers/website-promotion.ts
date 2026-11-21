import type {
  ServiceWebsitePromotion,
  ServiceWebsitePromotionPayment,
  ServiceWebsitePromotionPlan,
} from "@/types";
import type {
  ServiceWebsitePromotionPaymentRow,
  ServiceWebsitePromotionPlanRow,
  ServiceWebsitePromotionRow,
} from "@/types/database";

export function mapWebsitePromotionPlanRow(
  row: ServiceWebsitePromotionPlanRow
): ServiceWebsitePromotionPlan {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? "",
    pricePaise: row.price_paise,
    currency: row.currency || "INR",
    billingType: row.billing_type,
    durationDays: row.duration_days,
    isActive: row.is_active,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function isWebsitePromotionCurrentlyActive(
  status: string,
  expiresAt: string | null | undefined
): boolean {
  if (status !== "active") return false;
  if (!expiresAt) return true;
  return new Date(expiresAt).getTime() > Date.now();
}

export function mapWebsitePromotionRow(
  row: ServiceWebsitePromotionRow,
  plan?: ServiceWebsitePromotionPlanRow | null
): ServiceWebsitePromotion {
  const isActive = isWebsitePromotionCurrentlyActive(row.status, row.expires_at);
  return {
    id: row.id,
    directoryProfileId: row.directory_profile_id,
    userId: row.user_id,
    planId: row.plan_id,
    status: isActive ? "active" : row.status === "active" ? "expired" : row.status,
    startsAt: row.starts_at,
    expiresAt: row.expires_at,
    websiteUrl: row.website_url || "",
    adminNotes: row.admin_notes,
    lastPaymentId: row.last_payment_id,
    isActive,
    plan: plan ? mapWebsitePromotionPlanRow(plan) : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapWebsitePromotionPaymentRow(
  row: ServiceWebsitePromotionPaymentRow,
  planName?: string
): ServiceWebsitePromotionPayment {
  return {
    id: row.id,
    directoryProfileId: row.directory_profile_id,
    userId: row.user_id,
    planId: row.plan_id,
    amountPaise: row.amount_paise,
    currency: row.currency || "INR",
    status: row.status,
    razorpayOrderId: row.razorpay_order_id,
    razorpayPaymentId: row.razorpay_payment_id,
    receipt: row.receipt,
    paidAt: row.paid_at,
    createdAt: row.created_at,
    planName,
  };
}