import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import type { Database } from "@/types/database";
import { getSupabaseEnv } from "@/lib/supabase/env";

type CookieToSet = {
  name: string;
  value: string;
  options: Parameters<NextResponse["cookies"]["set"]>[2];
};

/**
 * Route-handler client that collects auth cookies so they can be applied
 * to the final JSON response (preserving httpOnly / secure options).
 *
 * Important: getAll() merges pending setAll() cookies so that queries in the
 * same request (e.g. profiles after signInWithPassword) see the new session.
 */
export function createRouteClient(request: NextRequest) {
  const { url, anonKey } = getSupabaseEnv();
  const pending: CookieToSet[] = [];

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        const map = new Map<string, { name: string; value: string }>();
        for (const c of request.cookies.getAll()) {
          map.set(c.name, { name: c.name, value: c.value });
        }
        for (const c of pending) {
          map.set(c.name, { name: c.name, value: c.value });
        }
        return Array.from(map.values());
      },
      setAll(cookiesToSet) {
        for (const cookie of cookiesToSet) {
          const idx = pending.findIndex((p) => p.name === cookie.name);
          if (idx >= 0) pending[idx] = cookie;
          else pending.push(cookie);
        }
      },
    },
  });

  return {
    supabase,
    applyCookies(response: NextResponse) {
      pending.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options);
      });
      return response;
    },
  };
}
