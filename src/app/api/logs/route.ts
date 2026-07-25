import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import { mapActivityLogRow } from "@/lib/mappers/activity-log";
import {
  activityLogCreateSchema,
  activityLogZodError,
} from "@/lib/validation/activity-log";
import type { ActivityLogRow } from "@/types/database";

function roleLabel(role: "user" | "broker" | "admin"): "Admin" | "Dealer" | "Broker" | "User" {
  if (role === "admin") return "Admin";
  if (role === "broker") return "Dealer";
  return "User";
}

export async function GET(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required to list activity logs.", 503);
  }

  const { profile, error } = await authenticateApiRequest(request);
  if (error || !profile) return jsonError("Unauthorized", 401);
  if (profile.status === "suspended" || profile.role !== "admin") {
    return jsonError("Forbidden", 403);
  }

  const limitRaw = request.nextUrl.searchParams.get("limit");
  const limit = Math.min(Math.max(Number(limitRaw) || 100, 1), 500);

  const admin = createServiceClient();
  const { data, error: listError } = await admin
    .from("activity_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (listError) return jsonError(listError.message, 500);
  return jsonOk(((data as ActivityLogRow[] | null) ?? []).map(mapActivityLogRow));
}

export async function POST(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required to write activity logs.", 503);
  }

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (profile.status === "suspended") return jsonError("Forbidden", 403);
  if (profile.role !== "admin" && profile.role !== "broker") {
    return jsonError("Forbidden", 403);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body");
  }

  const parsed = activityLogCreateSchema.safeParse(body);
  if (!parsed.success) return jsonError(activityLogZodError(parsed.error));

  const admin = createServiceClient();
  const { data, error: insertError } = await admin
    .from("activity_logs")
    .insert({
      action: parsed.data.action,
      performed_by: profile.email,
      actor_id: user.id,
      role: roleLabel(profile.role),
      target: parsed.data.target ?? "",
      entity_type: parsed.data.entityType ?? null,
      entity_id: parsed.data.entityId ?? null,
    })
    .select("*")
    .single();

  if (insertError || !data) {
    return jsonError(insertError?.message ?? "Unable to write activity log", 500);
  }

  return jsonOk(mapActivityLogRow(data as ActivityLogRow), { status: 201 });
}
