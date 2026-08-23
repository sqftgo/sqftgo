import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { mapAdminUser } from "@/lib/mappers/admin-user";
import { createServiceClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import type { AuthRole, ListerStatus } from "@/types";
import type { ProfileUpdate } from "@/types/database";

type PatchBody = {
  name?: string;
  email?: string;
  role?: AuthRole;
  status?: "active" | "suspended";
  listingStatus?: ListerStatus;
};

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

  const patch: ProfileUpdate = {};

  if (body.name !== undefined) patch.name = body.name;
  if (body.email !== undefined) patch.email = body.email;
  if (body.role !== undefined) patch.role = body.role;
  if (body.status !== undefined) patch.status = body.status;
  if (body.listingStatus !== undefined) {
    patch.listing_status = body.listingStatus;
    patch.listing_verified_at =
      body.listingStatus === "approved" ? new Date().toISOString() : null;
  }

  if (Object.keys(patch).length === 0) {
    return jsonError("No updates provided");
  }

  // Prevent locking yourself out of the sole admin account.
  if (id === user.id) {
    if (patch.role !== undefined && patch.role !== "admin") {
      return jsonError("You cannot demote your own admin role.", 403);
    }
    if (patch.status === "suspended") {
      return jsonError("You cannot suspend your own account.", 403);
    }
  }
  if (patch.role === "admin") {
    return jsonError("Admin role cannot be granted via the API.", 403);
  }

  const needsService =
    patch.role !== undefined ||
    patch.status !== undefined ||
    patch.listing_status !== undefined;
  if (needsService && !hasServiceRoleKey()) {
    return jsonError(
      "SUPABASE_SERVICE_ROLE_KEY is required to change role, status, or listing verification.",
      503
    );
  }

  const supabase = needsService
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

  return jsonOk(mapAdminUser(data));
}
