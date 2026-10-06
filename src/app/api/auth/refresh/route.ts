import { createServerClient } from "@supabase/ssr";
import { type NextRequest } from "next/server";
import type { Database } from "@/types/database";
import { createServiceClient } from "@/lib/supabase/admin";
import { getSupabaseEnv, hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import { jsonError, jsonOk } from "@/lib/api/auth";
import { enforceAuthRateLimit } from "@/lib/auth/rate-limit";
import { authSessionPayload } from "@/lib/mappers/profile";

type RefreshBody = { refreshToken?: string };

/**
 * Rotates a Supabase session for native (Bearer) clients that cannot rely on
 * cookie refresh in middleware. Returns the same payload shape as login.
 */
export async function POST(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required to refresh sessions.", 503);
  }

  const limited = await enforceAuthRateLimit(
    request,
    "refresh",
    "Too many session refresh attempts. Please sign in again."
  );
  if (limited) return limited;

  let body: RefreshBody;
  try {
    body = (await request.json()) as RefreshBody;
  } catch {
    return jsonError("Invalid JSON body");
  }

  const refreshToken = body.refreshToken?.trim();
  if (!refreshToken) return jsonError("refreshToken is required");

  const { url, anonKey } = getSupabaseEnv();
  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: { getAll: () => [], setAll: () => undefined },
  });

  const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
  if (error || !data.session || !data.user) {
    return jsonError("Session expired. Please sign in again.", 401);
  }

  const { data: profile } = await createServiceClient()
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!profile) return jsonError("Unauthorized", 401);
  if (profile.status === "suspended") {
    return jsonError("This account has been suspended", 403);
  }

  return jsonOk(
    authSessionPayload(profile, data.session.access_token, {
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at,
    })
  );
}
