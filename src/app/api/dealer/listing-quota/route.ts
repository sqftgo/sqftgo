import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { loadDealerListingQuota } from "@/lib/dealer-listing-quota";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";

export async function GET(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required.", 503);
  }

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (profile.status === "suspended") return jsonError("Forbidden", 403);
  if (profile.role !== "broker" && profile.role !== "admin") {
    return jsonError("Forbidden", 403);
  }

  try {
    const quota = await loadDealerListingQuota(createServiceClient(), user.id);
    return jsonOk(quota);
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Unable to load quota", 500);
  }
}
