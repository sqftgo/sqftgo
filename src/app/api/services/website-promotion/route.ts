import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { isServiceDirectoryCategory } from "@/features/dealers/lib/is-dealer-category";
import {
  mapWebsitePromotionPaymentRow,
  mapWebsitePromotionPlanRow,
  mapWebsitePromotionRow,
} from "@/lib/mappers/website-promotion";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import {
  updateMyWebsiteUrlSchema,
  websitePromoZodError,
} from "@/lib/validation/website-promotion";
import type {
  DirectoryProfileRow,
  ServiceWebsitePromotionPaymentRow,
  ServiceWebsitePromotionPlanRow,
  ServiceWebsitePromotionRow,
} from "@/types/database";

async function loadMyServiceProfile(admin: ReturnType<typeof createServiceClient>, userId: string) {
  const { data } = await admin
    .from("directory_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (!data) return null;
  const row = data as DirectoryProfileRow;
  if (!isServiceDirectoryCategory(row.category)) return null;
  return row;
}

export async function GET(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required", 503);
  }

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);

  const admin = createServiceClient();
  await admin.rpc("expire_service_website_promotions");

  const myProfile = await loadMyServiceProfile(admin, user.id);
  if (!myProfile) {
    return jsonError("Register a service business before managing website promotion.", 404);
  }

  const { data: promo } = await admin
    .from("service_website_promotions")
    .select("*")
    .eq("directory_profile_id", myProfile.id)
    .maybeSingle();

  let plan: ServiceWebsitePromotionPlanRow | null = null;
  if (promo?.plan_id) {
    const { data: planRow } = await admin
      .from("service_website_promotion_plans")
      .select("*")
      .eq("id", promo.plan_id)
      .maybeSingle();
    plan = (planRow as ServiceWebsitePromotionPlanRow) ?? null;
  }

  const { data: payments } = await admin
    .from("service_website_promotion_payments")
    .select("*")
    .eq("directory_profile_id", myProfile.id)
    .order("created_at", { ascending: false })
    .limit(25);

  const planIds = [
    ...new Set(
      ((payments ?? []) as ServiceWebsitePromotionPaymentRow[])
        .map((p) => p.plan_id)
        .filter(Boolean) as string[]
    ),
  ];
  const planNameById = new Map<string, string>();
  if (planIds.length) {
    const { data: plans } = await admin
      .from("service_website_promotion_plans")
      .select("id, name")
      .in("id", planIds);
    for (const p of plans ?? []) {
      planNameById.set(p.id as string, p.name as string);
    }
  }

  const { data: activePlans } = await admin
    .from("service_website_promotion_plans")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return jsonOk({
    directoryProfileId: myProfile.id,
    profileWebsite: myProfile.website || "",
    promotion: promo
      ? mapWebsitePromotionRow(promo as ServiceWebsitePromotionRow, plan)
      : null,
    payments: ((payments ?? []) as ServiceWebsitePromotionPaymentRow[]).map((p) =>
      mapWebsitePromotionPaymentRow(p, p.plan_id ? planNameById.get(p.plan_id) : undefined)
    ),
    plans: ((activePlans ?? []) as ServiceWebsitePromotionPlanRow[]).map(mapWebsitePromotionPlanRow),
  });
}

export async function PATCH(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required", 503);
  }

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON");
  }

  const parsed = updateMyWebsiteUrlSchema.safeParse(body);
  if (!parsed.success) return jsonError(websitePromoZodError(parsed.error));

  const admin = createServiceClient();
  await admin.rpc("expire_service_website_promotions");

  const myProfile = await loadMyServiceProfile(admin, user.id);
  if (!myProfile) {
    return jsonError("Register a service business before managing website promotion.", 404);
  }

  const { data: promo } = await admin
    .from("service_website_promotions")
    .select("*")
    .eq("directory_profile_id", myProfile.id)
    .maybeSingle();

  const mapped = promo
    ? mapWebsitePromotionRow(promo as ServiceWebsitePromotionRow)
    : null;

  if (!mapped?.isActive) {
    return jsonError(
      "Premium Website Promotion is required to publish a clickable website link.",
      402
    );
  }

  const websiteUrl = parsed.data.websiteUrl.trim();
  await admin
    .from("service_website_promotions")
    .update({ website_url: websiteUrl, updated_at: new Date().toISOString() })
    .eq("directory_profile_id", myProfile.id);

  await admin
    .from("directory_profiles")
    .update({ website: websiteUrl })
    .eq("id", myProfile.id);

  const { data: refreshed } = await admin
    .from("service_website_promotions")
    .select("*")
    .eq("directory_profile_id", myProfile.id)
    .maybeSingle();

  return jsonOk({
    promotion: refreshed
      ? mapWebsitePromotionRow(refreshed as ServiceWebsitePromotionRow)
      : null,
  });
}
