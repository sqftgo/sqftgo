import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";
import type { Database, ProfileRow } from "@/types/database";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { createClient as createServerCookieClient } from "@/lib/supabase/server";

export type ApiAuthResult =
  | { user: User; profile: ProfileRow | null; error: null }
  | { user: null; profile: null; error: string };

function extractBearerToken(request: NextRequest | Request): string | null {
  const header = request.headers.get("authorization");
  if (!header?.toLowerCase().startsWith("bearer ")) return null;
  const token = header.slice(7).trim();
  return token || null;
}

/**
 * Authenticate an API request.
 * Bearer token first (future mobile), then cookie session (web).
 * Always verifies with getUser() — never trust unverified session blobs.
 */
export async function authenticateApiRequest(
  request: NextRequest | Request
): Promise<ApiAuthResult> {
  const { url, anonKey } = getSupabaseEnv();
  const bearer = extractBearerToken(request);

  if (bearer) {
    const supabase = createServerClient<Database>(url, anonKey, {
      cookies: {
        getAll: () => [],
        setAll: () => undefined,
      },
    });
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(bearer);

    if (error || !user) {
      return { user: null, profile: null, error: error?.message ?? "Unauthorized" };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    return { user, profile, error: null };
  }

  const supabase = await createServerCookieClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { user: null, profile: null, error: error?.message ?? "Unauthorized" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return { user, profile, error: null };
}

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, { status: 200, ...init });
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
