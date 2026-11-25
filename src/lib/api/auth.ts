import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";
import type { Database, ProfileRow } from "@/types/database";
import { getSupabaseEnv, hasServiceRoleKey } from "@/lib/supabase/env";
import { createServiceClient } from "@/lib/supabase/admin";
import { createClient as createServerCookieClient } from "@/lib/supabase/server";
import { toPublicErrorMessage } from "@/lib/api/public-error";

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

    const profileClient = hasServiceRoleKey() ? createServiceClient() : supabase;
    const { data: profile } = await profileClient
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

  const profileClient = hasServiceRoleKey() ? createServiceClient() : supabase;
  const { data: profile } = await profileClient
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return { user, profile, error: null };
}

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, { status: 200, ...init });
}

export function jsonError(
  message: string,
  status = 400,
  extra?: Record<string, unknown>
) {
  const publicMessage = toPublicErrorMessage(message, status);

  if (status >= 500) {
    // Log + alert with the real backend message; client only gets publicMessage.
    console.error("[api]", status, message, extra ?? "");
    void import("@/lib/ops/api-alert")
      .then(async ({ notifyApiJsonError }) => {
        let path = "/api";
        let method: string | undefined;
        try {
          const { headers } = await import("next/headers");
          const h = await headers();
          path = h.get("x-sqftgo-api-path") || path;
          method = h.get("x-sqftgo-api-method") || undefined;
        } catch {
          /* headers() unavailable outside a request context */
        }
        notifyApiJsonError({ message, status, path, method, extra });
      })
      .catch(() => undefined);
  }

  // Only allow non-secret structural fields through (never raw provider payloads).
  const allowedExtraKeys = new Set([
    "code",
    "checkoutPath",
    "resendAfterSeconds",
    "ok",
    "db",
    "checkedAt",
    "latencyMs",
    "pauseAfterInactiveDays",
    "service",
  ]);
  const publicExtra = extra
    ? Object.fromEntries(
        Object.entries(extra).filter(([key, value]) => {
          if (!allowedExtraKeys.has(key)) return false;
          // Block string extras that look like backend dumps.
          if (typeof value === "string" && value.length > 120) return false;
          return true;
        }),
      )
    : undefined;

  return NextResponse.json(
    { error: publicMessage, ...(publicExtra && Object.keys(publicExtra).length ? publicExtra : {}) },
    { status },
  );
}
