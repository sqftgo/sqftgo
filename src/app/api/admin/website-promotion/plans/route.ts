import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { canAccessAdminRoutes } from "@/lib/authz";
import { mapWebsitePromotionPlanRow } from "@/lib/mappers/website-promotion";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import {
  websitePromotionPlanCreateSchema,
  websitePromoZodError,
} from "@/lib/validation/website-promotion";
import type { ServiceWebsitePromotionPlanRow } from "@/types/database";

export async function GET(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) return jsonError("SUPABASE_SERVICE_ROLE_KEY is required", 503);

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (!canAccessAdminRoutes(profile)) return jsonError("Forbidden", 403);

  const admin = createServiceClient();
  const { data, error: qErr } = await admin
    .from("service_website_promotion_plans")
    .select("*")
    .order("sort_order", { ascending: true });

  if (qErr) return jsonError(qErr.message, 500);
  return jsonOk({
    items: ((data ?? []) as ServiceWebsitePromotionPlanRow[]).map(mapWebsitePromotionPlanRow),
  });
}

export async function POST(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) return jsonError("SUPABASE_SERVICE_ROLE_KEY is required", 503);

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (!canAccessAdminRoutes(profile)) return jsonError("Forbidden", 403);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON");
  }

  const parsed = websitePromotionPlanCreateSchema.safeParse(body);
  if (!parsed.success) return jsonError(websitePromoZodError(parsed.error));

  const admin = createServiceClient();
  const { data, error: insertErr } = await admin
    .from("service_website_promotion_plans")
    .insert({
      slug: parsed.data.slug,
      name: parsed.data.name,
      description: parsed.data.description,
      price_paise: Math.round(parsed.data.priceInr * 100),
      currency: parsed.data.currency.toUpperCase(),
      billing_type: parsed.data.billingType,
      duration_days: parsed.data.durationDays,
      is_active: parsed.data.isActive,
      sort_order: parsed.data.sortOrder,
    })
    .select("*")
    .single();

  if (insertErr || !data) {
    return jsonError(insertErr?.message ?? "Unable to create plan", 500);
  }

  return jsonOk(mapWebsitePromotionPlanRow(data as ServiceWebsitePromotionPlanRow), {
    status: 201,
  });
}
