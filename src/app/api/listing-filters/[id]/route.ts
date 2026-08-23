import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import { mapListingFilterPatch, mapListingFilterRow } from "@/lib/mappers/listing-filter";
import {
  listingFilterUpdateSchema,
  listingFilterZodError,
} from "@/lib/validation/listing-filter";
import type { ListingFilterRow } from "@/types/database";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required to update listing filters.", 503);
  }

  const { id } = await context.params;
  if (!id) return jsonError("Filter id is required");

  const { profile, error } = await authenticateApiRequest(request);
  if (error || !profile) return jsonError("Unauthorized", 401);
  if (profile.status === "suspended" || profile.role !== "admin") {
    return jsonError("Forbidden", 403);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body");
  }

  const parsed = listingFilterUpdateSchema.safeParse(body);
  if (!parsed.success) return jsonError(listingFilterZodError(parsed.error));

  const admin = createServiceClient();
  const { data: existing, error: loadError } = await admin
    .from("listing_filters")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (loadError) return jsonError(loadError.message, 500);
  if (!existing) return jsonError("Filter not found", 404);

  const row = existing as ListingFilterRow;
  if (row.system) {
    if (parsed.data.kind !== undefined && parsed.data.kind !== row.kind) {
      return jsonError("Cannot change the type of a system filter", 400);
    }
    if (parsed.data.propertyField !== undefined && parsed.data.propertyField !== row.property_field) {
      return jsonError("Cannot change the property field of a system filter", 400);
    }
  }

  const patch = mapListingFilterPatch(parsed.data);
  const { data, error: updateError } = await admin
    .from("listing_filters")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (updateError || !data) {
    return jsonError(updateError?.message ?? "Unable to update listing filter", 500);
  }

  return jsonOk(mapListingFilterRow(data as ListingFilterRow));
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required to delete listing filters.", 503);
  }

  const { id } = await context.params;
  if (!id) return jsonError("Filter id is required");

  const { profile, error } = await authenticateApiRequest(request);
  if (error || !profile) return jsonError("Unauthorized", 401);
  if (profile.status === "suspended" || profile.role !== "admin") {
    return jsonError("Forbidden", 403);
  }

  const admin = createServiceClient();
  const { data: existing } = await admin
    .from("listing_filters")
    .select("id, system, label")
    .eq("id", id)
    .maybeSingle();
  if (!existing) return jsonError("Filter not found", 404);

  if (existing.system) {
    const { data, error: softError } = await admin
      .from("listing_filters")
      .update({ active: false })
      .eq("id", id)
      .select("*")
      .single();
    if (softError || !data) {
      return jsonError(softError?.message ?? "Unable to deactivate filter", 500);
    }
    return jsonOk({ ok: true, deactivated: true, filter: mapListingFilterRow(data as ListingFilterRow) });
  }

  const { error: deleteError } = await admin.from("listing_filters").delete().eq("id", id);
  if (deleteError) return jsonError(deleteError.message, 500);
  return jsonOk({ ok: true, deactivated: false });
}
