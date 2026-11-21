import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { canAccessAdminRoutes } from "@/lib/authz";
import { mapWebsitePromotionPlanRow } from "@/lib/mappers/website-promotion";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import {
  websitePromotionPlanUpdateSchema,
  websitePromoZodError,
} from "@/lib/validation/website-promotion";
import type { ServiceWebsitePromotionPlanRow } from "@/types/database";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) return jsonError("SUPABASE_SERVICE_ROLE_KEY is required", 503);

  const { id } = await context.params;
  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (!canAccessAdminRoutes(profile)) return jsonError("Forbidden", 403);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON");
  }

  const parsed = websitePromotionPlanUpdateSchema.safeParse(body);
  if (!parsed.success) return jsonError(websitePromoZodError(parsed.error));

  const patch: Partial<ServiceWebsitePromotionPlanRow> = {
    updated_at: new Date().toISOString(),
  };
  if (parsed.data.name !== undefined) patch.name = parsed.data.name;
  if (parsed.data.description !== undefined) patch.description = parsed.data.description;
  if (parsed.data.priceInr !== undefined) {
    patch.price_paise = Math.round(parsed.data.priceInr * 100);
  }
  if (parsed.data.currency !== undefined) patch.currency = parsed.data.currency.toUpperCase();
  if (parsed.data.billingType !== undefined) patch.billing_type = parsed.data.billingType;
  if (parsed.data.durationDays !== undefined) patch.duration_days = parsed.data.durationDays;
  if (parsed.data.isActive !== undefined) patch.is_active = parsed.data.isActive;
  if (parsed.data.sortOrder !== undefined) patch.sort_order = parsed.data.sortOrder;

  const admin = createServiceClient();
  const { data, error: updErr } = await admin
    .from("service_website_promotion_plans")
    .update(patch)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (updErr) return jsonError(updErr.message, 500);
  if (!data) return jsonError("Plan not found", 404);

  return jsonOk(mapWebsitePromotionPlanRow(data as ServiceWebsitePromotionPlanRow));
}
