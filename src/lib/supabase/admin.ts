import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getServiceRoleKey, getSupabaseEnv } from "./env";

/** Server-only admin client. Bypasses RLS — never import from client components. */
export function createServiceClient() {
  const { url } = getSupabaseEnv();
  return createClient<Database>(url, getServiceRoleKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
