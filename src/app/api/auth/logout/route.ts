import { NextResponse, type NextRequest } from "next/server";
import { createRouteClient } from "@/lib/supabase/route";
import { jsonError } from "@/lib/api/auth";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export async function POST(request: NextRequest) {
  if (!hasSupabaseEnv()) {
    return jsonError("Supabase is not configured", 503);
  }

  const { supabase, applyCookies } = createRouteClient(request);
  const { error } = await supabase.auth.signOut({ scope: "global" });

  // Still clear cookies even if remote revoke fails
  const response = NextResponse.json(
    error ? { ok: true, warning: error.message } : { ok: true }
  );
  return applyCookies(response);
}
