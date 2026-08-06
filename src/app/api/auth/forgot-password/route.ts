import { type NextRequest } from "next/server";
import { createRouteClient } from "@/lib/supabase/route";
import { jsonError, jsonOk } from "@/lib/api/auth";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { enforceAuthRateLimit } from "@/lib/auth/rate-limit";
import { getSiteUrl } from "@/lib/auth/urls";

type Body = { email?: string };

export async function POST(request: NextRequest) {
  if (!hasSupabaseEnv()) {
    return jsonError("Supabase is not configured", 503);
  }

  const limited = enforceAuthRateLimit(
    request,
    "forgotPassword",
    "Too many reset attempts. Please try again shortly."
  );
  if (limited) return limited;

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return jsonError("Invalid JSON body");
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  if (!email) return jsonError("Email is required");

  const { supabase } = createRouteClient(request);
  const siteUrl = getSiteUrl(request);

  // Always return ok to avoid email enumeration. Log/ignore provider errors.
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/update-password&type=recovery`,
  });

  if (error && process.env.NODE_ENV !== "production") {
    console.warn("[forgot-password]", error.message);
  }

  return jsonOk({ ok: true });
}
