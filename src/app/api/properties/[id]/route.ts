import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import { mapPropertyRow, mapUpdateToPatch } from "@/lib/mappers/property";
import { propertyUpdateSchema, zodErrorMessage } from "@/lib/validation/property";
import type { Property } from "@/types";
import type { PropertyRow } from "@/types/database";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);

  const { id } = await context.params;
  if (!id) return jsonError("Property id is required");

  const auth = await authenticateApiRequest(request);
  const isAdmin = auth.profile?.role === "admin" && auth.profile.status === "active";
  const useService = hasServiceRoleKey() && isAdmin;

  const supabase = useService ? createServiceClient() : await createClient();
  const { data, error } = await supabase.from("properties").select("*").eq("id", id).maybeSingle();

  if (error) return jsonError(error.message, 500);
  if (!data) return jsonError("Property not found", 404);

  const row = data as PropertyRow;
  const isOwner = auth.user?.id === row.owner_id;
  if (row.status !== "active" && !isOwner && !isAdmin) {
    return jsonError("Property not found", 404);
  }

  return jsonOk(mapPropertyRow(row));
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required to update properties.", 503);
  }

  const { id } = await context.params;
  if (!id) return jsonError("Property id is required");

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (profile.status === "suspended") return jsonError("Forbidden", 403);

  const isAdmin = profile.role === "admin";
  const isBroker = profile.role === "broker";
  if (!isAdmin && !isBroker) return jsonError("Forbidden", 403);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body");
  }

  const parsed = propertyUpdateSchema.safeParse(body);
  if (!parsed.success) return jsonError(zodErrorMessage(parsed.error));

  const admin = createServiceClient();
  const { data: existing, error: loadError } = await admin
    .from("properties")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (loadError) return jsonError(loadError.message, 500);
  if (!existing) return jsonError("Property not found", 404);

  const row = existing as PropertyRow;
  if (!isAdmin && row.owner_id !== user.id) return jsonError("Forbidden", 403);

  const updates = parsed.data as Partial<Property>;

  if (!isAdmin) {
    if (updates.featured === true) {
      return jsonError("Brokers cannot feature listings", 403);
    }
    if (
      updates.status &&
      updates.status !== "Draft" &&
      updates.status !== "Pending Review"
    ) {
      return jsonError("Brokers cannot set this status", 403);
    }
  }

  const patch = mapUpdateToPatch(updates);
  if (Object.keys(patch).length === 0) return jsonError("No updates provided");

  // Never allow owner reassignment via API in Phase 1.
  delete patch.owner_id;

  const { data, error: updateError } = await admin
    .from("properties")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (updateError || !data) {
    return jsonError(updateError?.message ?? "Unable to update property", 500);
  }

  return jsonOk(mapPropertyRow(data as PropertyRow));
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required to delete properties.", 503);
  }

  const { id } = await context.params;
  if (!id) return jsonError("Property id is required");

  const { user, profile, error } = await authenticateApiRequest(_request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (profile.status === "suspended") return jsonError("Forbidden", 403);

  const isAdmin = profile.role === "admin";
  const isBroker = profile.role === "broker";
  if (!isAdmin && !isBroker) return jsonError("Forbidden", 403);

  const admin = createServiceClient();
  const { data: existing, error: loadError } = await admin
    .from("properties")
    .select("id, owner_id")
    .eq("id", id)
    .maybeSingle();

  if (loadError) return jsonError(loadError.message, 500);
  if (!existing) return jsonError("Property not found", 404);
  if (!isAdmin && existing.owner_id !== user.id) return jsonError("Forbidden", 403);

  const { error: deleteError } = await admin.from("properties").delete().eq("id", id);
  if (deleteError) return jsonError(deleteError.message, 500);

  return jsonOk({ ok: true });
}
