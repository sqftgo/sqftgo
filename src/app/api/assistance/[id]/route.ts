import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import { mapAssistanceRow } from "@/lib/mappers/leads";
import { assistanceUpdateSchema, leadZodError } from "@/lib/validation/leads";
import type { AssistanceRequestRow, AssistanceRequestUpdate } from "@/types/database";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required to update assistance requests.", 503);
  }

  const { id } = await context.params;
  if (!id) return jsonError("Assistance id is required");

  const { profile, error } = await authenticateApiRequest(request);
  if (error || !profile) return jsonError("Unauthorized", 401);
  if (profile.status === "suspended" || profile.role !== "admin") {
    return jsonError("Forbidden", 403);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body");
  }

  const parsed = assistanceUpdateSchema.safeParse(body);
  if (!parsed.success) return jsonError(leadZodError(parsed.error));

  const patch: AssistanceRequestUpdate = {};
  if (parsed.data.status !== undefined) patch.status = parsed.data.status;
  if (parsed.data.notes !== undefined) patch.notes = parsed.data.notes;
  if (Object.keys(patch).length === 0) return jsonError("No updates provided");

  const admin = createServiceClient();
  const { data, error: updateError } = await admin
    .from("assistance_requests")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (updateError || !data) {
    return jsonError(updateError?.message ?? "Unable to update assistance request", 500);
  }

  return jsonOk(mapAssistanceRow(data as AssistanceRequestRow));
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required to delete assistance requests.", 503);
  }

  const { id } = await context.params;
  if (!id) return jsonError("Assistance id is required");

  const { profile, error } = await authenticateApiRequest(request);
  if (error || !profile) return jsonError("Unauthorized", 401);
  if (profile.status === "suspended" || profile.role !== "admin") {
    return jsonError("Forbidden", 403);
  }

  const admin = createServiceClient();
  const { error: deleteError } = await admin.from("assistance_requests").delete().eq("id", id);
  if (deleteError) return jsonError(deleteError.message, 500);

  return jsonOk({ ok: true });
}
