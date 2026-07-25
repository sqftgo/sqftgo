import { type NextRequest } from "next/server";
import { createRouteClient } from "@/lib/supabase/route";
import { jsonError, jsonOk } from "@/lib/api/auth";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type Body = { password?: string };

const MIN_PASSWORD_LENGTH = 8;

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
    return jsonError(error.message, 400);
  }

  return applyCookies(jsonOk({ ok: true }));
}
