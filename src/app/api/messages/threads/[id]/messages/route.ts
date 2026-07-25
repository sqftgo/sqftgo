import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import { mapMessageRow } from "@/lib/mappers/message";
import { loadProfilesByIds, previewBody } from "@/lib/messages/server";
import { notifyUser } from "@/lib/notifications/server";
import { messageCreateSchema, messageZodError } from "@/lib/validation/message";
import type { MessageRow, MessageThreadRow, ProfileRow } from "@/types/database";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required to send messages.", 503);
  }

  const { id: threadId } = await context.params;
  if (!threadId) return jsonError("Thread id is required");

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (profile.status === "suspended") return jsonError("Forbidden", 403);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body");
  }

  const parsed = messageCreateSchema.safeParse(body);
  if (!parsed.success) return jsonError(messageZodError(parsed.error));

  const admin = createServiceClient();
  const { data: thread, error: loadError } = await admin
    .from("message_threads")
    .select("*")
    .eq("id", threadId)
    .maybeSingle();

  if (loadError) return jsonError(loadError.message, 500);
  if (!thread) return jsonError("Thread not found", 404);

  const row = thread as MessageThreadRow;
  const isAdmin = profile.role === "admin";
  if (!isAdmin && !row.participant_ids.includes(user.id)) {
    return jsonError("Forbidden", 403);
  }
  if (row.status === "archived") {
    return jsonError("Cannot reply to an archived thread", 400);
  }

  const preview = previewBody(parsed.data.body);
  const now = new Date().toISOString();

  const { data: message, error: msgError } = await admin
    .from("messages")
    .insert({
      thread_id: threadId,
      sender_id: user.id,
      body: parsed.data.body.trim(),
    })
    .select("*")
    .single();

  if (msgError || !message) {
    return jsonError(msgError?.message ?? "Unable to send message", 500);
  }

  await admin
    .from("message_threads")
    .update({
      last_message_at: now,
      last_message_preview: preview,
      status: row.status === "resolved" ? "open" : row.status,
    })
    .eq("id", threadId);

  await admin.from("message_thread_reads").upsert({
    thread_id: threadId,
    user_id: user.id,
    last_read_at: now,
  });

  const recipients = row.participant_ids.filter((id) => id !== user.id);
  const profilesById = await loadProfilesByIds(admin, [
    ...row.participant_ids,
    user.id,
  ]);

  for (const recipientId of recipients) {
    const recip = profilesById.get(recipientId);
    if (!recip) continue;
    void notifyUser({
      userId: recipientId,
      forRole: recip.role as ProfileRow["role"],
      title: "New message",
      message: `${profile.name}: ${preview}`,
      type: "info",
      eventKey: "message.created",
      entityType: "message_thread",
      entityId: threadId,
    });
  }

  return jsonOk(mapMessageRow(message as MessageRow, profilesById), { status: 201 });
}
