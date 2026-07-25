import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import { mapThreadDetail } from "@/lib/mappers/message";
import { loadProfilesByIds } from "@/lib/messages/server";
import {
  messageThreadUpdateSchema,
  messageZodError,
} from "@/lib/validation/message";
import type { MessageRow, MessageThreadRow } from "@/types/database";

type RouteContext = { params: Promise<{ id: string }> };

function canAccess(
  thread: MessageThreadRow,
  userId: string,
  isAdmin: boolean
): boolean {
  return isAdmin || thread.participant_ids.includes(userId);
}

export async function GET(request: NextRequest, context: RouteContext) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required to load threads.", 503);
  }

  const { id } = await context.params;
  if (!id) return jsonError("Thread id is required");

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (profile.status === "suspended") return jsonError("Forbidden", 403);

  const admin = createServiceClient();
  const { data: thread, error: loadError } = await admin
    .from("message_threads")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (loadError) return jsonError(loadError.message, 500);
  if (!thread) return jsonError("Thread not found", 404);

  const row = thread as MessageThreadRow;
  const isAdmin = profile.role === "admin";
  if (!canAccess(row, user.id, isAdmin)) return jsonError("Forbidden", 403);

  const { data: messages, error: msgError } = await admin
    .from("messages")
    .select("*")
    .eq("thread_id", id)
    .order("created_at", { ascending: true });

  if (msgError) return jsonError(msgError.message, 500);

  const msgRows = (messages as MessageRow[] | null) ?? [];
  const profilesById = await loadProfilesByIds(admin, [
    ...row.participant_ids,
    ...msgRows.map((m) => m.sender_id),
  ]);

  let propertyTitle: string | null = null;
  if (row.property_id) {
    const { data: prop } = await admin
      .from("properties")
      .select("title")
      .eq("id", row.property_id)
      .maybeSingle();
    propertyTitle = prop?.title ?? null;
  }

  const { data: read } = await admin
    .from("message_thread_reads")
    .select("last_read_at")
    .eq("thread_id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  const unread =
    !read?.last_read_at ||
    new Date(row.last_message_at) > new Date(read.last_read_at);

  // Opening a thread marks it read.
  await admin.from("message_thread_reads").upsert({
    thread_id: id,
    user_id: user.id,
    last_read_at: new Date().toISOString(),
  });

  return jsonOk(
    mapThreadDetail(
      { ...row, property_title: propertyTitle },
      msgRows,
      profilesById,
      false
    )
  );
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required to update threads.", 503);
  }

  const { id } = await context.params;
  if (!id) return jsonError("Thread id is required");

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (profile.status === "suspended") return jsonError("Forbidden", 403);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body");
  }

  const parsed = messageThreadUpdateSchema.safeParse(body);
  if (!parsed.success) return jsonError(messageZodError(parsed.error));

  const admin = createServiceClient();
  const { data: thread, error: loadError } = await admin
    .from("message_threads")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (loadError) return jsonError(loadError.message, 500);
  if (!thread) return jsonError("Thread not found", 404);

  const row = thread as MessageThreadRow;
  const isAdmin = profile.role === "admin";
  if (!canAccess(row, user.id, isAdmin)) return jsonError("Forbidden", 403);

  if (parsed.data.markRead) {
    await admin.from("message_thread_reads").upsert({
      thread_id: id,
      user_id: user.id,
      last_read_at: new Date().toISOString(),
    });
  }

  if (parsed.data.status) {
    if (!isAdmin && profile.role !== "broker" && profile.role !== "user") {
      return jsonError("Forbidden", 403);
    }
    const { data: updated, error: updateError } = await admin
      .from("message_threads")
      .update({ status: parsed.data.status })
      .eq("id", id)
      .select("*")
      .single();
    if (updateError || !updated) {
      return jsonError(updateError?.message ?? "Unable to update thread", 500);
    }
    const profilesById = await loadProfilesByIds(admin, updated.participant_ids);
    return jsonOk(mapThreadDetail(updated as MessageThreadRow, [], profilesById, false));
  }

  const profilesById = await loadProfilesByIds(admin, row.participant_ids);
  return jsonOk(mapThreadDetail(row, [], profilesById, false));
}
