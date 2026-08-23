import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { canAccessAdminRoutes } from "@/lib/authz";
import { createServiceClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import { mapPlatformSettings } from "@/lib/mappers/platform-settings";
import { platformSettingsUpdateSchema } from "@/lib/validation/platform-settings";
import type { PlatformSettingsRow } from "@/types/database";

async function db() {
  return hasServiceRoleKey() ? createServiceClient() : await createClient();
}

export async function GET(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (!canAccessAdminRoutes(profile)) return jsonError("Forbidden", 403);

  const supabase = await db();
  const { data, error: qErr } = await supabase
    .from("platform_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (qErr) return jsonError(qErr.message, 500);
  if (!data) return jsonError("Settings row missing", 500);
  return jsonOk(mapPlatformSettings(data as PlatformSettingsRow));
}

export async function PATCH(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (!canAccessAdminRoutes(profile)) return jsonError("Forbidden", 403);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON");
  }

  const parsed = platformSettingsUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid settings", 400);
  }

  const input = parsed.data;
  const supabase = await db();
  const { data, error: upErr } = await supabase
    .from("platform_settings")
    .update({
      site_name: input.siteName,
      tagline: input.tagline,
      support_email: input.supportEmail,
      support_phone: input.supportPhone,
      maintenance_mode: input.maintenanceMode,
      require_listing_approval: input.requireListingApproval,
      allow_user_listings: input.allowUserListings,
      max_listings_per_dealer: input.maxListingsPerDealer ?? null,
      max_listings_per_user: input.maxListingsPerUser ?? 2,
      currency_code: input.currencyCode,
      analytics_measurement_id: input.analyticsMeasurementId,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq("id", 1)
    .select("*")
    .maybeSingle();

  if (upErr) return jsonError(upErr.message, 500);
  if (!data) return jsonError("Settings update failed", 500);
  return jsonOk(mapPlatformSettings(data as PlatformSettingsRow));
}
