import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { canAccessDealerDashboard } from "@/lib/authz";
import { fetchDealerAnalytics } from "@/lib/server/analytics";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";

export async function GET(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required for dealer analytics.", 503);
  }

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (profile.status === "suspended") return jsonError("Forbidden", 403);
  if (!canAccessDealerDashboard(profile)) return jsonError("Forbidden", 403);

  const supabase = createServiceClient();

  try {
    const payload = await fetchDealerAnalytics(supabase, user.id);
    return jsonOk(payload);
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Unable to load analytics", 500);
  }
}
