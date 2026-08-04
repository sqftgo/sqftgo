import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import { mapPropertyRow, mapUpdateToPatch } from "@/lib/mappers/property";
import { notifyRole, notifyUser } from "@/lib/notifications/server";
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

  // Prefer service client when configured so shared/deep links work for guests
  // (anon RLS can miss rows depending on policy). Visibility is enforced below:
  // non-active listings only for owner/admin.
  const supabase = hasServiceRoleKey() ? createServiceClient() : await createClient();
  const { data, error } = await supabase.from("properties").select("*").eq("id", id).maybeSingle();

  if (error) return jsonError(error.message, 500);
  if (!data) return jsonError("Property not found", 404);

  const row = data as PropertyRow;
  const isOwner = Boolean(auth.user?.id && auth.user.id === row.owner_id);
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

  if (updates.status === "Rejected") {
    const reason = updates.rejectionReason?.trim();
    if (!reason) {
      return jsonError("A rejection reason is required", 400);
    }
    updates.rejectionReason = reason;
  } else if (updates.status === "Active" || updates.status === "Pending Review") {
    // Clear stale feedback when approving or resubmitting.
    updates.rejectionReason = null;
  }

  const patch = mapUpdateToPatch(updates);
  if (Object.keys(patch).length === 0) return jsonError("No updates provided");

  // Never allow owner reassignment via API in Phase 1.
  delete patch.owner_id;

  const previousStatus = row.status;

  const { data, error: updateError } = await admin
    .from("properties")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (updateError || !data) {
    return jsonError(updateError?.message ?? "Unable to update property", 500);
  }

  const updated = data as PropertyRow;
  if (updated.status !== previousStatus) {
    if (updated.status === "pending_review") {
      void notifyRole("admin", {
        title: "Listing awaiting review",
        message: `“${updated.title}” was submitted for approval.`,
        type: "warning",
        eventKey: "property.pending_review",
        entityType: "property",
        entityId: updated.id,
      });
    } else if (updated.status === "active" && previousStatus === "pending_review") {
      void notifyUser({
        userId: updated.owner_id,
        forRole: "broker",
        title: "Listing approved",
        message: `“${updated.title}” is now live on SqftGo.`,
        type: "success",
        eventKey: "property.approved",
        entityType: "property",
        entityId: updated.id,
      });
    } else if (updated.status === "draft" && previousStatus === "pending_review") {
      void notifyUser({
        userId: updated.owner_id,
        forRole: "broker",
        title: "Listing returned to draft",
        message: `“${updated.title}” was moved back to draft and needs changes.`,
        type: "warning",
        eventKey: "property.returned_to_draft",
        entityType: "property",
        entityId: updated.id,
      });
    } else if (updated.status === "rejected" && previousStatus === "pending_review") {
      const reason = updated.rejection_reason?.trim();
      void notifyUser({
        userId: updated.owner_id,
        forRole: "broker",
        title: "Listing rejected",
        message: reason
          ? `“${updated.title}” was not approved: ${reason}`
          : `“${updated.title}” was not approved. Review feedback in your dashboard and resubmit when ready.`,
        type: "error",
        eventKey: "property.rejected",
        entityType: "property",
        entityId: updated.id,
      });
    }
  }

  return jsonOk(mapPropertyRow(updated));
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
