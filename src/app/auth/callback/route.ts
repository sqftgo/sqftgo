import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey } from "@/lib/supabase/env";
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Dealer signup stores intent in user_metadata; promote after email confirm.
  if (user && user.user_metadata?.intent === "dealer" && hasServiceRoleKey()) {
    const admin = createServiceClient();
    await admin
      .from("profiles")
      .update({ role: "broker" })
      .eq("id", user.id)
      .eq("role", "user");
  }

  // Send dealers/admins to their portals after Google/email confirm
  if (next === "/" || next === "/dealer/dashboard") {
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      if (profile?.role === "admin") next = "/admin";
      else if (profile?.role === "broker" || user.user_metadata?.intent === "dealer") {
        next = "/dealer/dashboard";
      }
    }
  }

  return NextResponse.redirect(`${site}${next}`);
}
