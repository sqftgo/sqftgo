import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import { mapLocationRow } from "@/lib/mappers/catalog";
import { locationUpdateSchema, catalogZodError } from "@/lib/validation/catalog";
import type { LocationRow, LocationUpdate } from "@/types/database";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required to update locations.", 503);
  }

  const { id } = await context.params;
  if (!id) return jsonError("Location id is required");

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

  const parsed = locationUpdateSchema.safeParse(body);
  if (!parsed.success) return jsonError(catalogZodError(parsed.error));

  const patch: LocationUpdate = {};
  if (parsed.data.city !== undefined) patch.city = parsed.data.city;
  if (parsed.data.state !== undefined) patch.state = parsed.data.state;
  if (parsed.data.country !== undefined) patch.country = parsed.data.country;
  if (parsed.data.active !== undefined) patch.active = parsed.data.active;
  if (parsed.data.sortOrder !== undefined) patch.sort_order = parsed.data.sortOrder;

  const admin = createServiceClient();
  const { data, error: updateError } = await admin
    .from("locations")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (updateError || !data) {
    return jsonError(updateError?.message ?? "Unable to update location", 500);
  }

  return jsonOk(mapLocationRow(data as LocationRow, 0));
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required to delete locations.", 503);
  }

  const { id } = await context.params;
  if (!id) return jsonError("Location id is required");

  const { profile, error } = await authenticateApiRequest(_request);
  if (error || !profile) return jsonError("Unauthorized", 401);
  if (profile.status === "suspended" || profile.role !== "admin") {
    return jsonError("Forbidden", 403);
  }

  const admin = createServiceClient();
  const { data: existing } = await admin
    .from("locations")
    .select("id, city")
    .eq("id", id)
    .maybeSingle();
  if (!existing) return jsonError("Location not found", 404);

  const { count } = await admin
    .from("properties")
    .select("id", { count: "exact", head: true })
    .ilike("city", existing.city);

  if ((count ?? 0) > 0) {
    const { data, error: softError } = await admin
      .from("locations")
      .update({ active: false })
      .eq("id", id)
      .select("*")
      .single();
    if (softError || !data) {
      return jsonError(softError?.message ?? "Unable to deactivate location", 500);
    }
    return jsonOk({ ok: true, deactivated: true, location: mapLocationRow(data as LocationRow, 0) });
  }

  const { error: deleteError } = await admin.from("locations").delete().eq("id", id);
  if (deleteError) return jsonError(deleteError.message, 500);
  return jsonOk({ ok: true, deactivated: false });
}
