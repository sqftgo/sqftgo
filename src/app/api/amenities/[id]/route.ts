import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import { mapAmenityRow } from "@/lib/mappers/catalog";
import { amenityUpdateSchema, catalogZodError } from "@/lib/validation/catalog";
import type { AmenityRow } from "@/types/database";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required to update amenities.", 503);
  }

  const { id } = await context.params;
  if (!id) return jsonError("Amenity id is required");

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

  const parsed = amenityUpdateSchema.safeParse(body);
  if (!parsed.success) return jsonError(catalogZodError(parsed.error));

  const patch: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) patch.name = parsed.data.name;
  if (parsed.data.active !== undefined) patch.active = parsed.data.active;
  if (parsed.data.sortOrder !== undefined) patch.sort_order = parsed.data.sortOrder;

  const admin = createServiceClient();
  const { data, error: updateError } = await admin
    .from("amenities")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (updateError || !data) {
    return jsonError(updateError?.message ?? "Unable to update amenity", 500);
  }

  return jsonOk(mapAmenityRow(data as AmenityRow));
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required to delete amenities.", 503);
  }

  const { id } = await context.params;
  if (!id) return jsonError("Amenity id is required");

  const { profile, error } = await authenticateApiRequest(_request);
  if (error || !profile) return jsonError("Unauthorized", 401);
  if (profile.status === "suspended" || profile.role !== "admin") {
    return jsonError("Forbidden", 403);
  }

  const admin = createServiceClient();
  const { data: existing } = await admin
    .from("amenities")
    .select("id, name")
    .eq("id", id)
    .maybeSingle();
  if (!existing) return jsonError("Amenity not found", 404);

  const { count } = await admin
    .from("properties")
    .select("id", { count: "exact", head: true })
    .contains("amenities", [existing.name]);

  if ((count ?? 0) > 0) {
    const { data, error: softError } = await admin
      .from("amenities")
      .update({ active: false })
      .eq("id", id)
      .select("*")
      .single();
    if (softError || !data) {
      return jsonError(softError?.message ?? "Unable to deactivate amenity", 500);
    }
    return jsonOk({ ok: true, deactivated: true, amenity: mapAmenityRow(data as AmenityRow) });
  }

  const { error: deleteError } = await admin.from("amenities").delete().eq("id", id);
  if (deleteError) return jsonError(deleteError.message, 500);
  return jsonOk({ ok: true, deactivated: false });
}
