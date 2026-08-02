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
  let next = safeRedirectPath(url.searchParams.get("next"), "/");
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

  // Default home → send dealers/admins to their portals after Google/email confirm
  if (next === "/") {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      if (profile?.role === "admin") next = "/admin";
      else if (profile?.role === "broker") next = "/dealer/dashboard";
    }
  }

  return NextResponse.redirect(`${site}${next}`);
}
