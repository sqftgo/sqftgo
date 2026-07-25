import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import { favoritePropertyIdSchema, favoriteZodError } from "@/lib/validation/favorites";

export async function GET(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required to list favorites.", 503);
  }

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (profile.status === "suspended") return jsonError("Forbidden", 403);

  const admin = createServiceClient();
  const { data, error: listError } = await admin
    .from("user_favorites")
    .select("property_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (listError) return jsonError(listError.message, 500);

  const ids = ((data as { property_id: string }[] | null) ?? []).map((row) => row.property_id);
  return jsonOk(ids);
}

export async function POST(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required to save favorites.", 503);
  }

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (profile.status === "suspended") return jsonError("Forbidden", 403);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body");
  }

  const parsed = favoritePropertyIdSchema.safeParse(body);
  if (!parsed.success) return jsonError(favoriteZodError(parsed.error));

  const admin = createServiceClient();
  const { data: property } = await admin
    .from("properties")
    .select("id")
    .eq("id", parsed.data.propertyId)
    .maybeSingle();
  if (!property) return jsonError("Property not found", 404);

  const { error: insertError } = await admin.from("user_favorites").upsert(
    {
      user_id: user.id,
      property_id: parsed.data.propertyId,
    },
    { onConflict: "user_id,property_id", ignoreDuplicates: true }
  );

  if (insertError) return jsonError(insertError.message, 500);

  return jsonOk({ ok: true, propertyId: parsed.data.propertyId, favorited: true }, { status: 201 });
}
