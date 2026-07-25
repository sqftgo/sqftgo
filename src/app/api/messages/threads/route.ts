import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import { mapThreadRow } from "@/lib/mappers/message";
import { loadProfilesByIds, previewBody } from "@/lib/messages/server";
import { notifyUser } from "@/lib/notifications/server";
import {
  messageThreadCreateSchema,
  messageZodError,
} from "@/lib/validation/message";
import type { MessageThreadRow, ProfileRow } from "@/types/database";

export async function GET(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required to list messages.", 503);
  }

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (profile.status === "suspended") return jsonError("Forbidden", 403);

  const kind = request.nextUrl.searchParams.get("kind");
  const status = request.nextUrl.searchParams.get("status");
  const admin = createServiceClient();

  let query = admin
    .from("message_threads")
    .select("*")
    .order("last_message_at", { ascending: false })
    .limit(100);

  if (profile.role !== "admin") {
    query = query.contains("participant_ids", [user.id]);
  }

  if (kind === "direct" || kind === "support") {
    query = query.eq("kind", kind);
  }
  if (status === "open" || status === "resolved" || status === "archived") {
    query = query.eq("status", status);
  }

  const { data, error: listError } = await query;
  if (listError) return jsonError(listError.message, 500);

  const rows = (data as MessageThreadRow[] | null) ?? [];
  const participantIds = rows.flatMap((r) => r.participant_ids);
  const profilesById = await loadProfilesByIds(admin, participantIds);

  const { data: reads } = await admin
    .from("message_thread_reads")
    .select("thread_id, last_read_at")
    .eq("user_id", user.id)
    .in(
      "thread_id",
      rows.map((r) => r.id)
    );

  const readMap = new Map((reads ?? []).map((r) => [r.thread_id, r.last_read_at]));

  const propertyIds = rows.map((r) => r.property_id).filter(Boolean) as string[];
  const titleMap = new Map<string, string>();
  if (propertyIds.length) {
    const { data: props } = await admin.from("properties").select("id, title").in("id", propertyIds);
    for (const p of props ?? []) titleMap.set(p.id, p.title);
  }

  const mapped = rows.map((row) => {
    const lastRead = readMap.get(row.id);
    const unread = !lastRead || new Date(row.last_message_at) > new Date(lastRead);
    return mapThreadRow(
      { ...row, property_title: row.property_id ? titleMap.get(row.property_id) ?? null : null },
      profilesById,
      unread
    );
  });

  return jsonOk(mapped);
}

export async function POST(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required to create threads.", 503);
  }

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (profile.status === "suspended") return jsonError("Forbidden", 403);
  if (profile.role === "user") {
    // Buyers may open support threads only.
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body");
  }

  const parsed = messageThreadCreateSchema.safeParse(body);
  if (!parsed.success) return jsonError(messageZodError(parsed.error));

  const input = parsed.data;
  const kind = input.kind ?? (profile.role === "admin" ? "support" : "direct");
  if (profile.role === "user" && kind !== "support") {
    return jsonError("Buyers may only open support conversations", 403);
  }

  const admin = createServiceClient();
  const email = input.participantEmail.toLowerCase();
  const { data: counterpart, error: findError } = await admin
    .from("profiles")
    .select("id, name, email, role, status")
    .ilike("email", email)
    .maybeSingle();

  if (findError) return jsonError(findError.message, 500);
  if (!counterpart || counterpart.status !== "active") {
    return jsonError("Recipient profile not found", 404);
  }
  if (counterpart.id === user.id) {
    return jsonError("Cannot start a conversation with yourself", 400);
  }

  if (input.propertyId) {
    const { data: prop } = await admin
      .from("properties")
      .select("id, owner_id")
      .eq("id", input.propertyId)
      .maybeSingle();
    if (!prop) return jsonError("Property not found", 404);
    if (profile.role === "broker" && prop.owner_id !== user.id) {
      return jsonError("Forbidden", 403);
    }
  }

  const participantIds = [user.id, counterpart.id];
  const preview = previewBody(input.body);

  const { data: thread, error: threadError } = await admin
    .from("message_threads")
    .insert({
      subject: input.subject,
      created_by: user.id,
      participant_ids: participantIds,
      property_id: input.propertyId ?? null,
      kind,
      status: "open",
      last_message_at: new Date().toISOString(),
      last_message_preview: preview,
    })
    .select("*")
    .single();

  if (threadError || !thread) {
    return jsonError(threadError?.message ?? "Unable to create thread", 500);
  }

  const threadRow = thread as MessageThreadRow;
  const { data: message, error: msgError } = await admin
    .from("messages")
    .insert({
      thread_id: threadRow.id,
      sender_id: user.id,
      body: input.body.trim(),
    })
    .select("*")
    .single();

  if (msgError || !message) {
    await admin.from("message_threads").delete().eq("id", threadRow.id);
    return jsonError(msgError?.message ?? "Unable to send first message", 500);
  }

  await admin.from("message_thread_reads").upsert({
    thread_id: threadRow.id,
    user_id: user.id,
    last_read_at: new Date().toISOString(),
  });

  const profilesById = await loadProfilesByIds(admin, participantIds);
  void notifyUser({
    userId: counterpart.id,
    forRole: (counterpart as ProfileRow).role,
    title: "New message",
    message: `${profile.name}: ${preview}`,
    type: "info",
    eventKey: "message.created",
    entityType: "message_thread",
    entityId: threadRow.id,
  });

  return jsonOk(mapThreadRow(threadRow, profilesById, false), { status: 201 });
}
