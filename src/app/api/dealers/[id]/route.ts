import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import { mapDealerRow, mapDealerUpdateToPatch } from "@/lib/mappers/dealer";
import { dealerUpdateSchema, dealerZodError } from "@/lib/validation/dealer";
import type { DirectoryProfileRow } from "@/types/database";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);

  const { id } = await context.params;
  if (!id) return jsonError("Dealer id is required");

  const supabase = hasServiceRoleKey() ? createServiceClient() : await createClient();
  const { data, error } = await supabase
    .from("directory_profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) return jsonError(error.message, 500);
  if (!data) return jsonError("Directory profile not found", 404);

  return jsonOk(mapDealerRow(data as DirectoryProfileRow));
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required to update directory profiles.", 503);
  }

  const { id } = await context.params;
  if (!id) return jsonError("Dealer id is required");

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (profile.status === "suspended") return jsonError("Forbidden", 403);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body");
  }

  const parsed = dealerUpdateSchema.safeParse(body);
  if (!parsed.success) return jsonError(dealerZodError(parsed.error));

  const admin = createServiceClient();
  const { data: existing, error: loadError } = await admin
    .from("directory_profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (loadError) return jsonError(loadError.message, 500);
  if (!existing) return jsonError("Directory profile not found", 404);

  const row = existing as DirectoryProfileRow;
  const isAdmin = profile.role === "admin";
  const isOwner = row.user_id === user.id;
  if (!isAdmin && !isOwner) return jsonError("Forbidden", 403);

  if (parsed.data.email) {
    const nextEmail = parsed.data.email.toLowerCase();
    if (nextEmail !== row.email.toLowerCase()) {
      const { data: clash } = await admin
        .from("directory_profiles")
        .select("id")
        .ilike("email", nextEmail)
        .neq("id", id)
        .maybeSingle();
      if (clash) return jsonError("A directory profile with this email already exists", 409);
    }
  }

  const patch = mapDealerUpdateToPatch(parsed.data);
  if (Object.keys(patch).length === 0) {
    return jsonOk(mapDealerRow(row));
  }

  // Non-admins cannot reassign ownership via patch.
  delete patch.user_id;

  const { data, error: updateError } = await admin
    .from("directory_profiles")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (updateError || !data) {
    return jsonError(updateError?.message ?? "Unable to update directory profile", 500);
  }

  return jsonOk(mapDealerRow(data as DirectoryProfileRow));
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required to delete directory profiles.", 503);
  }

  const { id } = await context.params;
  if (!id) return jsonError("Dealer id is required");

  const { profile, error } = await authenticateApiRequest(request);
  if (error || !profile) return jsonError("Unauthorized", 401);
  if (profile.status === "suspended" || profile.role !== "admin") {
    return jsonError("Forbidden", 403);
  }

  const admin = createServiceClient();
  const { data: existing } = await admin
    .from("directory_profiles")
    .select("id")
    .eq("id", id)
    .maybeSingle();
  if (!existing) return jsonError("Directory profile not found", 404);

  const { error: deleteError } = await admin.from("directory_profiles").delete().eq("id", id);
  if (deleteError) return jsonError(deleteError.message, 500);

  return jsonOk({ ok: true });
}
