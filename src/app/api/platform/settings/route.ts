import { jsonError, jsonOk } from "@/lib/api/auth";
import { mapPublicPlatformSettings } from "@/lib/mappers/platform-settings";
import { createServiceClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import type { PlatformSettingsRow } from "@/types/database";

/**
 * Public platform config used by marketplace UI (branding, caps, price filters).
 * Does not expose maintenance mode or analytics IDs.
 */
export async function GET() {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);

  const supabase = hasServiceRoleKey()
    ? createServiceClient()
    : await createClient();

  const { data, error } = await supabase
    .from("platform_settings")
    .select(
      "site_name, tagline, support_email, support_phone, allow_user_listings, max_listings_per_user, currency_code, price_ranges, maintenance_mode, require_listing_approval, max_listings_per_dealer, analytics_measurement_id, updated_at, updated_by, id"
    )
    .eq("id", 1)
    .maybeSingle();

  if (error) return jsonError(error.message, 500);
  if (!data) return jsonError("Settings unavailable", 500);

  return jsonOk(mapPublicPlatformSettings(data as PlatformSettingsRow));
}
