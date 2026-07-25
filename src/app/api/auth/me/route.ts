import { NextResponse, type NextRequest } from "next/server";
import type { ProfileRow } from "@/types/database";
import { createRouteClient } from "@/lib/supabase/route";
import { createServiceClient } from "@/lib/supabase/admin";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import { authSessionPayload } from "@/lib/mappers/profile";
import { profileUpdateSchema, profileZodError } from "@/lib/validation/profile";

export async function GET(request: NextRequest) {
  if (!hasSupabaseEnv()) {
    return jsonError("Supabase is not configured", 503);
  }

  const { supabase, applyCookies } = createRouteClient(request);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return jsonError("Unauthorized", 401);
  }

  let profile: ProfileRow | null = null;

  if (hasServiceRoleKey()) {
    const admin = createServiceClient();
    const { data } = await admin
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    profile = data;
  } else {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    profile = data;
  }

  if (!profile) {
    return jsonError("Unauthorized", 401);
  }

  if (profile.status === "suspended") {
    await supabase.auth.signOut({ scope: "global" });
    return applyCookies(
      NextResponse.json({ error: "This account has been suspended" }, { status: 403 })
    );
  }

  return applyCookies(jsonOk(authSessionPayload(profile)));
}

export async function PATCH(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required to update profiles.", 503);
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

  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) return jsonError(profileZodError(parsed.error));

  const patch: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) patch.name = parsed.data.name;
  if (parsed.data.phone !== undefined) patch.phone = parsed.data.phone;
  if (parsed.data.bio !== undefined) patch.bio = parsed.data.bio;
  if (parsed.data.city !== undefined) patch.city = parsed.data.city;
  if (parsed.data.avatarUrl !== undefined) patch.avatar_url = parsed.data.avatarUrl;
  if (Object.keys(patch).length === 0) return jsonError("No updates provided");

  const admin = createServiceClient();
  const { data, error: updateError } = await admin
    .from("profiles")
    .update(patch)
    .eq("id", user.id)
    .select("*")
    .single();

  if (updateError || !data) {
    return jsonError(updateError?.message ?? "Unable to update profile", 500);
  }

  return jsonOk(authSessionPayload(data as ProfileRow));
}
