import { NextResponse, type NextRequest } from "next/server";
import { createRouteClient } from "@/lib/supabase/route";
import { MOBILE_REDIRECT_COOKIE, safeMobileRedirect } from "@/lib/auth/mobile";

/**
 * Final OAuth hop for the native app: reads the browser session created by
 * `/auth/callback` and returns tokens to the app scheme in the URL fragment.
 * Browser auth cookies are cleared without revoking the session the app now owns.
 */
export async function GET(request: NextRequest) {
  const redirect = safeMobileRedirect(request.cookies.get(MOBILE_REDIRECT_COOKIE)?.value);
  const { supabase } = createRouteClient(request);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const target = session
    ? `${redirect}#${new URLSearchParams({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: String(session.expires_at ?? ""),
      }).toString()}`
    : `${redirect}?error=oauth_session_missing`;

  const response = NextResponse.redirect(target);
  response.cookies.delete(MOBILE_REDIRECT_COOKIE);
  for (const cookie of request.cookies.getAll()) {
    if (cookie.name.startsWith("sb-")) response.cookies.delete(cookie.name);
  }
  return response;
}
