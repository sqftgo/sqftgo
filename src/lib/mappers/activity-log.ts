import type { ActivityLog } from "@/types";
import type { ActivityLogRow } from "@/types/database";

export function mapActivityLogRow(row: ActivityLogRow): ActivityLog {
  return {
    id: row.id,
    action: row.action,
    performedBy: row.performed_by,
    role: row.role,
    target: row.target,
    timestamp: new Date(row.created_at).toLocaleString("en-IN"),
  };
}
