import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import { mapProjectRow, mapProjectUpdateToPatch, toUiProjectStatus } from "@/lib/mappers/project";
import { requireActiveCity } from "@/lib/server/active-city";
import { projectUpdateSchema, zodErrorMessage } from "@/lib/validation/project";
import type { Project } from "@/types";
import type { ProjectRow } from "@/types/database";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);

  const { id } = await context.params;
  if (!id) return jsonError("Project id is required");

  const auth = await authenticateApiRequest(request);
  const isAdmin = auth.profile?.role === "admin" && auth.profile.status === "active";

  const supabase = hasServiceRoleKey() ? createServiceClient() : await createClient();
  const { data, error } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();

  if (error) return jsonError(error.message, 500);
  if (!data) return jsonError("Project not found", 404);

  const row = data as ProjectRow;
  const isOwner = Boolean(auth.user?.id && auth.user.id === row.owner_id);
  if (row.status !== "active" && !isOwner && !isAdmin) {
    return jsonError("Project not found", 404);
  }

  return jsonOk(mapProjectRow(row));
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required to update projects.", 503);
  }

  const { id } = await context.params;
  if (!id) return jsonError("Project id is required");

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

  const parsed = projectUpdateSchema.safeParse(body);
  if (!parsed.success) return jsonError(zodErrorMessage(parsed.error));

  const admin = createServiceClient();
  const { data: existing, error: loadError } = await admin
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (loadError) return jsonError(loadError.message, 500);
  if (!existing) return jsonError("Project not found", 404);

  const row = existing as ProjectRow;
  if (!isAdmin && row.owner_id !== user.id) return jsonError("Forbidden", 403);

  const updates = parsed.data as Partial<Project> & { rejectionReason?: string | null };

  if (!isAdmin) {
    if (updates.featured === true) {
      return jsonError("Brokers cannot feature projects", 403);
    }
    if (updates.rejectionReason !== undefined) {
      return jsonError("Brokers cannot set rejection feedback", 403);
    }
    if (
      updates.status &&
      updates.status !== "Draft" &&
      updates.status !== "Pending Review"
    ) {
      return jsonError("Brokers cannot set this status", 403);
    }
  }

  const nextStatus = updates.status ?? toUiProjectStatus(row.status);
  const nextImages =
    updates.images !== undefined ? updates.images : row.images ?? [];
  if (nextStatus === "Pending Review" && nextImages.length < 1) {
    return jsonError("At least one image is required before submitting for review", 400);
  }

  if (updates.city !== undefined) {
    const cityCheck = await requireActiveCity(admin, updates.city);
    if (!cityCheck.ok) return jsonError(cityCheck.error, 400);
    updates.city = cityCheck.location.city;
    if (updates.state === undefined) updates.state = cityCheck.location.state;
    if (updates.country === undefined) updates.country = cityCheck.location.country;
  }

  if (updates.status === "Rejected") {
    const reason = updates.rejectionReason?.trim();
    if (!reason) return jsonError("A rejection reason is required", 400);
    updates.rejectionReason = reason;
  } else if (updates.status === "Active" || updates.status === "Pending Review") {
    updates.rejectionReason = null;
  }

  const patch = mapProjectUpdateToPatch(updates);
  if (Object.keys(patch).length === 0) return jsonError("No updates provided");
  delete patch.owner_id;

  const { data, error: updateError } = await admin
    .from("projects")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (updateError || !data) {
    return jsonError(updateError?.message ?? "Unable to update project", 500);
  }

  return jsonOk(mapProjectRow(data as ProjectRow));
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required to delete projects.", 503);
  }

  const { id } = await context.params;
  if (!id) return jsonError("Project id is required");

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (profile.status === "suspended") return jsonError("Forbidden", 403);

  const isAdmin = profile.role === "admin";
  const isBroker = profile.role === "broker";
  if (!isAdmin && !isBroker) return jsonError("Forbidden", 403);

  const admin = createServiceClient();
  const { data: existing, error: loadError } = await admin
    .from("projects")
    .select("id, owner_id, status")
    .eq("id", id)
    .maybeSingle();

  if (loadError) return jsonError(loadError.message, 500);
  if (!existing) return jsonError("Project not found", 404);

  if (!isAdmin && existing.owner_id !== user.id) return jsonError("Forbidden", 403);

  // Soft-protect live inventory: brokers cannot hard-delete Active projects.
  if (!isAdmin && existing.status === "active") {
    return jsonError("Active projects cannot be deleted. Move to draft or contact support.", 403);
  }

  const { error: deleteError } = await admin.from("projects").delete().eq("id", id);
  if (deleteError) return jsonError(deleteError.message, 500);

  return jsonOk({ ok: true });
}
