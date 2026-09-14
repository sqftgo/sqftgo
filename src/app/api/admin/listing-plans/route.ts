import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { canAccessAdminRoutes } from "@/lib/authz";
import { mapListingPlan, type ListingPlanRow } from "@/lib/payments/listing-orders";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import { listingPlanWriteSchema, listingPlanZodError } from "@/lib/validation/listing-plan";

export async function GET(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) return jsonError("SUPABASE_SERVICE_ROLE_KEY is required.", 503);

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (!canAccessAdminRoutes(profile)) return jsonError("Forbidden", 403);

  const admin = createServiceClient();
  const { data, error: listError } = await admin
    .from("listing_plans")
    .select("*")
    .order("sort_order", { ascending: true });
  if (listError) return jsonError(listError.message, 500);
  return jsonOk((data as ListingPlanRow[] | null)?.map(mapListingPlan) ?? []);
}

export async function POST(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) return jsonError("SUPABASE_SERVICE_ROLE_KEY is required.", 503);

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (!canAccessAdminRoutes(profile)) return jsonError("Forbidden", 403);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body");
  }

  const parsed = listingPlanWriteSchema.safeParse(body);
  if (!parsed.success) return jsonError(listingPlanZodError(parsed.error));

  const admin = createServiceClient();
  const { data, error: insertError } = await admin
    .from("listing_plans")
    .insert({
      slug: parsed.data.slug,
      name: parsed.data.name,
      description: parsed.data.description,
      price_paise: parsed.data.priceInr * 100,
      slots: parsed.data.slots,
      is_active: parsed.data.isActive,
      sort_order: parsed.data.sortOrder,
    })
    .select("*")
    .single();
  if (insertError || !data) {
    return jsonError(insertError?.message ?? "Unable to create plan", 500);
  }
  return jsonOk(mapListingPlan(data as ListingPlanRow), { status: 201 });
}
