import { NextResponse, type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import type { AuthRole } from "@/services/auth";
import type { ProfileRow } from "@/types/database";

type PatchBody = {
  name?: string;
  email?: string;
  role?: AuthRole;
  status?: "active" | "suspended";
};

function toMockUser(row: ProfileRow) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    status: row.status,
    joinedDate: row.created_at.split("T")[0] ?? row.created_at,
    inquiriesCount: 0,
  };
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!hasSupabaseEnv()) {
    return jsonError("Supabase is not configured", 503);
  }

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) {
    return jsonError("Unauthorized", 401);
  }
  if (profile.role !== "admin" || profile.status === "suspended") {
    return jsonError("Forbidden", 403);
  }

  const { id } = await context.params;
  if (!id) return jsonError("User id is required");

  let body: PatchBody;
  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return jsonError("Invalid JSON body");
  }

  const patch: {
    name?: string;
    email?: string;
    role?: AuthRole;
    status?: "active" | "suspended";
  } = {};

  if (body.name !== undefined) patch.name = body.name;
  if (body.email !== undefined) patch.email = body.email;
  if (body.role !== undefined) patch.role = body.role;
  if (body.status !== undefined) patch.status = body.status;

  if (Object.keys(patch).length === 0) {
    return jsonError("No updates provided");
  }

  // Role/status changes need service role (or admin RLS update policy).
  if ((patch.role !== undefined || patch.status !== undefined) && !hasServiceRoleKey()) {
    return jsonError(
      "SUPABASE_SERVICE_ROLE_KEY is required to change role or status.",
      503
    );
  }

  const supabase =
    patch.role !== undefined || patch.status !== undefined
      ? createServiceClient()
      : hasServiceRoleKey()
        ? createServiceClient()
        : await createClient();

  const { data, error: updateError } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (updateError || !data) {
    return jsonError(updateError?.message ?? "User not found", 404);
  }

  return jsonOk(toMockUser(data));
}
