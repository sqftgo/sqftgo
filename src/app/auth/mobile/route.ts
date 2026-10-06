import { NextResponse, type NextRequest } from "next/server";
import { createRouteClient } from "@/lib/supabase/route";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { getSiteUrl } from "@/lib/auth/urls";
import { MOBILE_REDIRECT_COOKIE, safeMobileRedirect } from "@/lib/auth/mobile";

/**
 * Starts Google OAuth for the native app inside an auth browser session.
 * The PKCE verifier lives in this browser's cookies; `/auth/callback` exchanges
 * the code and forwards to `/auth/mobile/complete`, which hands tokens to the app.
 */
export async function GET(request: NextRequest) {
  const redirect = safeMobileRedirect(request.nextUrl.searchParams.get("redirect"));
  const fail = (reason: string) =>
    NextResponse.redirect(`${redirect}?error=${encodeURIComponent(reason)}`);

  if (!hasSupabaseEnv()) return fail("auth_not_configured");

  const site = getSiteUrl(request);
  const { supabase, applyCookies } = createRouteClient(request);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${site}/auth/callback?next=${encodeURIComponent("/auth/mobile/complete")}`,
      skipBrowserRedirect: true,
      queryParams: { prompt: "select_account" },
    },
  });

  if (error || !data.url) return fail("oauth_start_failed");

  const response = NextResponse.redirect(data.url);
  response.cookies.set(MOBILE_REDIRECT_COOKIE, redirect, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 600,
    path: "/",
  });
  return applyCookies(response);
}
