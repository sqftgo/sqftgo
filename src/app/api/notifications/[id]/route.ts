import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import { mapNotificationRow } from "@/lib/mappers/notification";
import {
  notificationUpdateSchema,
  notificationZodError,
} from "@/lib/validation/notification";
import type { NotificationRow } from "@/types/database";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required to update notifications.", 503);
  }

  const { id } = await context.params;
  if (!id) return jsonError("Notification id is required");

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (profile.status === "suspended") return jsonError("Forbidden", 403);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body");
  }

  const parsed = notificationUpdateSchema.safeParse(body);
  if (!parsed.success) return jsonError(notificationZodError(parsed.error));

  const admin = createServiceClient();
  const { data: existing, error: loadError } = await admin
    .from("notifications")
    .select("id, user_id")
    .eq("id", id)
    .maybeSingle();

  if (loadError) return jsonError(loadError.message, 500);
  if (!existing) return jsonError("Notification not found", 404);
  if (existing.user_id !== user.id) return jsonError("Forbidden", 403);

  const { data, error: updateError } = await admin
    .from("notifications")
    .update({ read: parsed.data.read })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (updateError || !data) {
    return jsonError(updateError?.message ?? "Unable to update notification", 500);
  }

  return jsonOk(mapNotificationRow(data as NotificationRow));
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required to delete notifications.", 503);
  }

  const { id } = await context.params;
  if (!id) return jsonError("Notification id is required");

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (profile.status === "suspended") return jsonError("Forbidden", 403);

  const isAdmin = profile.role === "admin";
  const admin = createServiceClient();

  const { data: existing, error: loadError } = await admin
    .from("notifications")
    .select("id, user_id")
    .eq("id", id)
    .maybeSingle();

  if (loadError) return jsonError(loadError.message, 500);
  if (!existing) return jsonError("Notification not found", 404);
  if (!isAdmin && existing.user_id !== user.id) return jsonError("Forbidden", 403);

  let deleteQuery = admin.from("notifications").delete().eq("id", id);
  if (!isAdmin) deleteQuery = deleteQuery.eq("user_id", user.id);

  const { error: deleteError } = await deleteQuery;
  if (deleteError) return jsonError(deleteError.message, 500);

  return jsonOk({ ok: true });
}
