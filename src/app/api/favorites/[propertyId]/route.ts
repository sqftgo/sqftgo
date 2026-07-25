import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import { z } from "zod";

type RouteContext = { params: Promise<{ propertyId: string }> };

const propertyIdParamSchema = z.string().uuid();

export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required to remove favorites.", 503);
  }

  const { propertyId } = await context.params;
  const parsedId = propertyIdParamSchema.safeParse(propertyId);
  if (!parsedId.success) return jsonError("Invalid property id");

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (profile.status === "suspended") return jsonError("Forbidden", 403);

  const admin = createServiceClient();
  const { error: deleteError } = await admin
    .from("user_favorites")
    .delete()
    .eq("user_id", user.id)
    .eq("property_id", parsedId.data);

  if (deleteError) return jsonError(deleteError.message, 500);

  return jsonOk({ ok: true, propertyId: parsedId.data, favorited: false });
}
