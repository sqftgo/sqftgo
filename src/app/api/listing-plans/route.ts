import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import { mapListingPlan, type ListingPlanRow } from "@/lib/payments/listing-orders";

export async function GET(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required to list plans.", 503);
  }

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (profile.status === "suspended") return jsonError("Forbidden", 403);

  const admin = createServiceClient();
  const { data, error: listError } = await admin
    .from("listing_plans")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (listError) return jsonError(listError.message, 500);

  return jsonOk((data as ListingPlanRow[] | null)?.map(mapListingPlan) ?? []);
}
