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

function isMaintenanceSurface(pathname: string): boolean {
  if (pathname === "/") return true;
  return [
    "/listings",
    "/dealers",
    "/property",
    "/services",
    "/destinations",
    "/favorites",
  ].some((p) => pathname.startsWith(p));
}

async function readMaintenanceMode(
  url: string,
  serviceKey: string
): Promise<boolean> {
  const admin = createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data } = await admin
    .from("platform_settings")
    .select("maintenance_mode")
    .eq("id", 1)
    .maybeSingle();
  return Boolean((data as { maintenance_mode?: boolean } | null)?.maintenance_mode);
}

async function readProfileRole(
  supabase: ReturnType<typeof createServerClient<Database>>,
  url: string,
  userId: string
): Promise<{ role: AppRole; status: string } | null> {
  if (hasServiceRoleKey()) {
    const admin = createClient<Database>(url, getServiceRoleKey(), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data } = await admin
      .from("profiles")
      .select("role, status")
      .eq("id", userId)
      .maybeSingle();
    return data;
  }
  const { data } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", userId)
    .maybeSingle();
  return data;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith("/admin");
  const isDealerDashboard = pathname.startsWith("/dealer/dashboard");
  const isAccountRoute =
    pathname.startsWith("/settings") || pathname.startsWith("/profile");
  const isProtected = isAdminRoute || isDealerDashboard || isAccountRoute;

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

  // Maintenance gate for public marketplace surfaces (admins bypass).
  if (
    isMaintenanceSurface(pathname) &&
    pathname !== "/maintenance" &&
    !pathname.startsWith("/api") &&
    hasServiceRoleKey()
  ) {
    try {
      const on = await readMaintenanceMode(url, getServiceRoleKey());
      if (on) {
        let role: AppRole | null = null;
        if (user) {
          const profile = await readProfileRole(supabase, url, user.id);
          role = (profile?.role ?? null) as AppRole | null;
        }
        if (role !== "admin") {
          const maintUrl = request.nextUrl.clone();
          maintUrl.pathname = "/maintenance";
          maintUrl.search = "";
          return NextResponse.redirect(maintUrl);
        }
      }
    } catch {
      // Fail open if settings unavailable
    }
  }

  if (!isProtected) {
    return supabaseResponse;
  }

  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const profile = await readProfileRole(supabase, url, user.id);
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
