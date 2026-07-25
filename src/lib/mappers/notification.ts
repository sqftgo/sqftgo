import type { Notification } from "@/types";
import type { NotificationRow } from "@/types/database";

export function mapNotificationRow(row: NotificationRow): Notification {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    type: row.type,
    read: row.read,
    date: row.created_at.split("T")[0] ?? row.created_at,
    forRole: row.for_role,
  };
}
