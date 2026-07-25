import "server-only";

import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey } from "@/lib/supabase/env";
import type { NotificationForRoleDb, NotificationTypeDb } from "@/types/database";

export type NotifyInput = {
  userId: string;
  forRole: NotificationForRoleDb;
  title: string;
  message: string;
  type?: NotificationTypeDb;
  eventKey?: string;
  entityType?: string;
  entityId?: string;
};

/** Fire-and-forget safe: never throws to callers of primary business flows. */
export async function notifyUser(input: NotifyInput): Promise<void> {
  if (!hasServiceRoleKey()) return;
  try {
    const admin = createServiceClient();
    const { error } = await admin.from("notifications").insert({
      user_id: input.userId,
      for_role: input.forRole,
      title: input.title,
      message: input.message,
      type: input.type ?? "info",
      read: false,
      event_key: input.eventKey ?? null,
      entity_type: input.entityType ?? null,
      entity_id: input.entityId ?? null,
    });
    if (error) {
      console.error("[notifyUser]", error.message);
    }
  } catch (err) {
    console.error("[notifyUser]", err);
  }
}

export async function notifyRole(
  role: "admin" | "broker" | "user",
  input: Omit<NotifyInput, "userId" | "forRole">
): Promise<void> {
  if (!hasServiceRoleKey()) return;
  try {
    const admin = createServiceClient();
    const { data: recipients, error } = await admin
      .from("profiles")
      .select("id")
      .eq("role", role)
      .eq("status", "active");
    if (error || !recipients?.length) {
      if (error) console.error("[notifyRole]", error.message);
      return;
    }
    const rows = recipients.map((r) => ({
      user_id: r.id,
      for_role: role as NotificationForRoleDb,
      title: input.title,
      message: input.message,
      type: input.type ?? "info",
      read: false,
      event_key: input.eventKey ?? null,
      entity_type: input.entityType ?? null,
      entity_id: input.entityId ?? null,
    }));
    const { error: insertError } = await admin.from("notifications").insert(rows);
    if (insertError) console.error("[notifyRole]", insertError.message);
  } catch (err) {
    console.error("[notifyRole]", err);
  }
}
