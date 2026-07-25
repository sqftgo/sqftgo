import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl, safeRedirectPath } from "@/lib/auth/urls";

/**
 * Exchanges Supabase auth codes (email confirm, password recovery, OAuth)
 * for a session cookie, then redirects into the app.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeRedirectPath(url.searchParams.get("next"), "/");
  const type = url.searchParams.get("type");

  const site = getSiteUrl({ nextUrl: { origin: url.origin } });

  if (!code) {
    return NextResponse.redirect(`${site}/login?error=auth_callback_missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    // Do not leak provider error text into the URL / browser history.
    return NextResponse.redirect(`${site}/login?error=auth_callback_failed`);
  }

  // Password recovery → force user to set a new password
  if (type === "recovery" || next === "/update-password") {
    return NextResponse.redirect(`${site}/update-password`);
  }

  return NextResponse.redirect(`${site}${next}`);
}
