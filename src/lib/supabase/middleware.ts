import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";
import {
  hasSupabaseEnv,
  getSupabaseEnv,
  hasServiceRoleKey,
  getServiceRoleKey,
} from "./env";

type AppRole = "user" | "broker" | "admin";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith("/admin");
  const isDealerDashboard = pathname.startsWith("/dealer/dashboard");
  const isProtected = isAdminRoute || isDealerDashboard;

  // Production must fail closed: never expose protected UI without auth config.
  if (!hasSupabaseEnv()) {
    if (process.env.NODE_ENV === "production" && isProtected) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("error", "auth_not_configured");
      return NextResponse.redirect(loginUrl);
    }
    return supabaseResponse;
  }

  const { url, anonKey } = getSupabaseEnv();

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isProtected) {
    return supabaseResponse;
  }

  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Prefer service role for role lookup after getUser() — Edge + RLS session
  // attachment can miss the profile row and falsely bounce valid sessions.
  // Identity is already verified; we only read that user's row by id.
  let profile: { role: AppRole; status: string } | null = null;
  if (hasServiceRoleKey()) {
    const admin = createClient<Database>(url, getServiceRoleKey(), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data } = await admin
      .from("profiles")
      .select("role, status")
      .eq("id", user.id)
      .maybeSingle();
    profile = data;
  } else {
    const { data } = await supabase
      .from("profiles")
      .select("role, status")
      .eq("id", user.id)
      .maybeSingle();
    profile = data;
  }

  const role = (profile?.role ?? null) as AppRole | null;
  const suspended = profile?.status === "suspended";

  if (suspended || !role) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && role !== "admin") {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/";
    homeUrl.search = "";
    return NextResponse.redirect(homeUrl);
  }

  if (isDealerDashboard && role !== "broker" && role !== "admin") {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/";
    homeUrl.search = "";
    return NextResponse.redirect(homeUrl);
  }

  return supabaseResponse;
}
