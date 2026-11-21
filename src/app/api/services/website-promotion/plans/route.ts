import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { mapWebsitePromotionPlanRow } from "@/lib/mappers/website-promotion";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import type { ServiceWebsitePromotionPlanRow } from "@/types/database";

export async function GET(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required", 503);
  }

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);

  const admin = createServiceClient();
  const { data, error: qErr } = await admin
    .from("service_website_promotion_plans")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (qErr) return jsonError(qErr.message, 500);

  return jsonOk({
    items: ((data ?? []) as ServiceWebsitePromotionPlanRow[]).map(mapWebsitePromotionPlanRow),
  });
}
