import { NextResponse, type NextRequest } from "next/server";
import type { ProfileRow } from "@/types/database";
import { createRouteClient } from "@/lib/supabase/route";
import { createServiceClient } from "@/lib/supabase/admin";
import { jsonError, jsonOk } from "@/lib/api/auth";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";

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

  return applyCookies(
    jsonOk({
      email: profile.email,
      role: profile.role,
      name: profile.name,
      profile: {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone ?? undefined,
        avatar: profile.avatar_url ?? undefined,
        bio: profile.bio ?? undefined,
        role: profile.role,
        joinedDate: profile.created_at.split("T")[0] ?? profile.created_at,
      },
    })
  );
}
