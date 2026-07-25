import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import { mapNotificationRow } from "@/lib/mappers/notification";
import type { NotificationRow } from "@/types/database";

export async function GET(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required to list notifications.", 503);
  }

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (profile.status === "suspended") return jsonError("Forbidden", 403);

  const unreadOnly =
    request.nextUrl.searchParams.get("unread") === "1" ||
    request.nextUrl.searchParams.get("unread") === "true";

  const admin = createServiceClient();
  let query = admin
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (unreadOnly) query = query.eq("read", false);

  const { data, error: listError } = await query;
  if (listError) return jsonError(listError.message, 500);

  return jsonOk((data as NotificationRow[] | null)?.map(mapNotificationRow) ?? []);
}
