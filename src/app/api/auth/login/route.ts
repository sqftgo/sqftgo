import { NextResponse, type NextRequest } from "next/server";
import type { ProfileRow } from "@/types/database";
import { createRouteClient } from "@/lib/supabase/route";
import { createServiceClient } from "@/lib/supabase/admin";
import { jsonError } from "@/lib/api/auth";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import { authSessionPayload } from "@/lib/mappers/profile";

type AuthBody = {
  email?: string;
  password?: string;
};

async function loadProfile(userId: string): Promise<ProfileRow | null> {
  // Prefer service role for post-login profile read (same-request cookie race
  // with SSR clients can miss the new session under RLS). Auth already verified.
  if (!hasServiceRoleKey()) return null;

  const client = createServiceClient();
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data } = await client.from("profiles").select("*").eq("id", userId).maybeSingle();
    if (data) return data;
    await new Promise((r) => setTimeout(r, 150));
  }
  return null;
}

export async function POST(request: NextRequest) {
  if (!hasSupabaseEnv()) {
    return jsonError("Supabase is not configured", 503);
  }

  let body: AuthBody;
  try {
    body = (await request.json()) as AuthBody;
  } catch {
    return jsonError("Invalid JSON body");
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";
  if (!email || !password) {
    return jsonError("Email and password are required");
  }

  const { supabase, applyCookies } = createRouteClient(request);

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    const raw = error?.message ?? "";
    if (/email not confirmed/i.test(raw)) {
      return jsonError(
        "Email not confirmed. Check your inbox for the confirmation link, then sign in.",
        401
      );
    }
    return jsonError("Invalid email or password", 401);
  }

  let profile = await loadProfile(data.user.id);

  // Fallback: session-scoped client
  if (!profile) {
    for (let attempt = 0; attempt < 5; attempt++) {
      const { data: row } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .maybeSingle();
      if (row) {
        profile = row;
        break;
      }
      await new Promise((r) => setTimeout(r, 150));
    }
  }

  if (!profile) {
    return jsonError(
      "Profile not found. Push the profiles migration to your Supabase project.",
      500
    );
  }
  if (profile.status === "suspended") {
    await supabase.auth.signOut({ scope: "global" });
    return applyCookies(
      NextResponse.json({ error: "This account has been suspended" }, { status: 403 })
    );
  }

  return applyCookies(NextResponse.json(authSessionPayload(profile)));
}
