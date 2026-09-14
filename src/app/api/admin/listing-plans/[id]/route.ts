import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { canAccessAdminRoutes } from "@/lib/authz";
import { mapListingPlan } from "@/lib/payments/listing-orders";
import type { ListingPlanUpdate } from "@/types/database";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import { listingPlanPatchSchema, listingPlanZodError } from "@/lib/validation/listing-plan";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) return jsonError("SUPABASE_SERVICE_ROLE_KEY is required.", 503);

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (!canAccessAdminRoutes(profile)) return jsonError("Forbidden", 403);

  const { id } = await context.params;
  if (!id) return jsonError("Plan id is required");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body");
  }

  const parsed = listingPlanPatchSchema.safeParse(body);
  if (!parsed.success) return jsonError(listingPlanZodError(parsed.error));

  const patch: ListingPlanUpdate = { updated_at: new Date().toISOString() };
  if (parsed.data.name !== undefined) patch.name = parsed.data.name;
  if (parsed.data.description !== undefined) patch.description = parsed.data.description;
  if (parsed.data.priceInr !== undefined) patch.price_paise = parsed.data.priceInr * 100;
  if (parsed.data.slots !== undefined) patch.slots = parsed.data.slots;
  if (parsed.data.isActive !== undefined) patch.is_active = parsed.data.isActive;
  if (parsed.data.sortOrder !== undefined) patch.sort_order = parsed.data.sortOrder;

  const admin = createServiceClient();
  const { data, error: upErr } = await admin
    .from("listing_plans")
    .update(patch)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (upErr) return jsonError(upErr.message, 500);
  if (!data) return jsonError("Plan not found", 404);
  return jsonOk(mapListingPlan(data));
}
