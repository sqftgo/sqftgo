import { createServerClient } from "@supabase/ssr";
import { type NextRequest } from "next/server";
import type { Database } from "@/types/database";
import { createRouteClient } from "@/lib/supabase/route";
import { createServiceClient } from "@/lib/supabase/admin";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { getSupabaseEnv, hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import { enforceAuthRateLimit } from "@/lib/auth/rate-limit";

type Body = { password?: string; currentPassword?: string };

const MIN_PASSWORD_LENGTH = 8;

function hasBearer(request: NextRequest): boolean {
  return Boolean(request.headers.get("authorization")?.toLowerCase().startsWith("bearer "));
}

function mapUpdateError(raw: string) {
  if (/same|identical|unchanged/i.test(raw)) {
    return jsonError("New password must be different from your current password.", 400);
  }
  if (/weak|short|least|characters/i.test(raw)) {
    return jsonError("Password does not meet security requirements.", 400);
  }
  return null;
}

/** Native clients: signed-in password change that re-verifies the current password. */
async function updateWithBearer(request: NextRequest, body: Body, password: string) {
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required to change passwords.", 503);
  }

  const limited = await enforceAuthRateLimit(
    request,
    "login",
    "Too many attempts. Please try again shortly."
  );
  if (limited) return limited;

  const { user, profile } = await authenticateApiRequest(request);
  if (!user || !profile || !user.email) return jsonError("Unauthorized", 401);
  if (profile.status === "suspended") return jsonError("Forbidden", 403);

  const currentPassword = body.currentPassword ?? "";
  if (!currentPassword) return jsonError("Current password is required");

  const { url, anonKey } = getSupabaseEnv();
  const verifier = createServerClient<Database>(url, anonKey, {
    cookies: { getAll: () => [], setAll: () => undefined },
  });
  const { error: verifyError } = await verifier.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (verifyError) return jsonError("Current password is incorrect.", 400);
  if (currentPassword === password) {
    return jsonError("New password must be different from your current password.", 400);
  }

  const { error } = await createServiceClient().auth.admin.updateUserById(user.id, { password });
  if (error) {
    return mapUpdateError(error.message ?? "") ?? jsonError("Unable to update password.", 400);
  }
  return jsonOk({ ok: true });
}

export async function POST(request: NextRequest) {
  if (!hasSupabaseEnv()) {
    return jsonError("Supabase is not configured", 503);
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return jsonError("Invalid JSON body");
  }

  const password = body.password ?? "";
  if (password.length < MIN_PASSWORD_LENGTH) {
    return jsonError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }

  if (hasBearer(request)) return updateWithBearer(request, body, password);

  const { supabase, applyCookies } = createRouteClient(request);
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return jsonError("Your reset link is invalid or expired. Request a new one.", 401);
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return (
      mapUpdateError(error.message ?? "") ??
      jsonError("Unable to update password. Request a new reset link and try again.", 400)
    );
  }

  return applyCookies(jsonOk({ ok: true }));
}
