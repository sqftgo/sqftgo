import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import { mapVisitRow, toDbVisitStatus, type SiteVisitJoined } from "@/lib/mappers/visit";
import { notifyUser } from "@/lib/notifications/server";
import { visitUpdateSchema, visitZodError } from "@/lib/validation/visit";
import type { SiteVisitRow, SiteVisitUpdate } from "@/types/database";

type RouteContext = { params: Promise<{ id: string }> };

const VISIT_SELECT = `
  *,
  properties (
    id,
    title,
    images,
    locality,
    city,
    owner_name,
    owner_phone,
    owner_id
  )
`;

export async function PATCH(request: NextRequest, context: RouteContext) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required to update visits.", 503);
  }

  const { id } = await context.params;
  if (!id) return jsonError("Visit id is required");

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (profile.status === "suspended") return jsonError("Forbidden", 403);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body");
  }

  const parsed = visitUpdateSchema.safeParse(body);
  if (!parsed.success) return jsonError(visitZodError(parsed.error));

  const admin = createServiceClient();
  const { data: existing, error: loadError } = await admin
    .from("site_visits")
    .select(VISIT_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (loadError) return jsonError(loadError.message, 500);
  if (!existing) return jsonError("Visit not found", 404);

  const row = existing as unknown as SiteVisitJoined;
  const ownerId = row.properties?.owner_id;
  const isAdmin = profile.role === "admin";
  const isOwner = Boolean(ownerId && ownerId === user.id);
  const isVisitor =
    row.user_id === user.id ||
    row.visitor_email.toLowerCase() === profile.email.toLowerCase();

  if (!isAdmin && !isOwner && !isVisitor) return jsonError("Forbidden", 403);

  const updates = parsed.data;
  const patch: SiteVisitUpdate = {};

  if (updates.status) {
    if (updates.status === "Cancelled") {
      if (!isVisitor && !isOwner && !isAdmin) return jsonError("Forbidden", 403);
      patch.status = "cancelled";
      patch.cancelled_at = new Date().toISOString();
    } else if (updates.status === "Confirmed" || updates.status === "Completed") {
      if (!isOwner && !isAdmin) return jsonError("Forbidden", 403);
      patch.status = toDbVisitStatus(updates.status);
      if (updates.status === "Completed") {
        patch.completed_at = new Date().toISOString();
      }
    } else if (updates.status === "Pending Approval") {
      if (!isOwner && !isAdmin) return jsonError("Forbidden", 403);
      patch.status = "pending";
    }
  }

  if (updates.date !== undefined || updates.time !== undefined) {
    if (!isVisitor && !isOwner && !isAdmin) return jsonError("Forbidden", 403);
    if (updates.date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const scheduled = new Date(`${updates.date}T00:00:00`);
      if (Number.isNaN(scheduled.getTime()) || scheduled < today) {
        return jsonError("Visit date must be today or in the future", 400);
      }
      patch.scheduled_date = updates.date;
    }
    if (updates.time) {
      patch.scheduled_time = updates.time.replace(/\s+/g, " ").trim();
    }
    if (row.status === "cancelled" || row.status === "completed") {
      return jsonError("Cannot reschedule a cancelled or completed visit", 400);
    }
  }

  if (updates.notes !== undefined) {
    if (!isVisitor && !isAdmin) return jsonError("Forbidden", 403);
    patch.notes = updates.notes || null;
  }

  if (updates.brokerNotes !== undefined) {
    if (!isOwner && !isAdmin) return jsonError("Forbidden", 403);
    patch.broker_notes = updates.brokerNotes || null;
  }

  if (Object.keys(patch).length === 0) return jsonError("No updates provided");

  const { data, error: updateError } = await admin
    .from("site_visits")
    .update(patch)
    .eq("id", id)
    .select(VISIT_SELECT)
    .single();

  if (updateError || !data) {
    return jsonError(updateError?.message ?? "Unable to update visit", 500);
  }

  const updated = data as unknown as SiteVisitJoined;
  const title = updated.properties?.title ?? "property";
  const prev = row as SiteVisitRow;

  if (patch.status === "cancelled" && prev.status !== "cancelled") {
    if (isVisitor && ownerId) {
      void notifyUser({
        userId: ownerId,
        forRole: "broker",
        title: "Site visit cancelled",
        message: `${updated.visitor_name} cancelled the tour of “${title}”.`,
        type: "warning",
        eventKey: "visit.cancelled",
        entityType: "site_visit",
        entityId: updated.id,
      });
    } else if (updated.user_id) {
      void notifyUser({
        userId: updated.user_id,
        forRole: "user",
        title: "Site visit cancelled",
        message: `Your tour of “${title}” was cancelled.`,
        type: "warning",
        eventKey: "visit.cancelled",
        entityType: "site_visit",
        entityId: updated.id,
      });
    }
  } else if (patch.status === "confirmed" && prev.status !== "confirmed" && updated.user_id) {
    void notifyUser({
      userId: updated.user_id,
      forRole: "user",
      title: "Site visit confirmed",
      message: `Your tour of “${title}” on ${updated.scheduled_date} at ${updated.scheduled_time} is confirmed.`,
      type: "success",
      eventKey: "visit.confirmed",
      entityType: "site_visit",
      entityId: updated.id,
    });
  } else if (
    (patch.scheduled_date || patch.scheduled_time) &&
    ownerId &&
    updated.user_id
  ) {
    const recipientId = isVisitor ? ownerId : updated.user_id;
    const forRole = isVisitor ? "broker" : "user";
    void notifyUser({
      userId: recipientId,
      forRole,
      title: "Site visit rescheduled",
      message: `Tour of “${title}” moved to ${updated.scheduled_date} at ${updated.scheduled_time}.`,
      type: "info",
      eventKey: "visit.rescheduled",
      entityType: "site_visit",
      entityId: updated.id,
    });
  }

  return jsonOk(mapVisitRow(updated));
}
