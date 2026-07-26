import "server-only";

import { createServiceClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { hasServiceRoleKey } from "@/lib/supabase/env";

/** Prefer service-role client when available; otherwise cookie-scoped user client. */
export async function resolveApiDb() {
  return hasServiceRoleKey() ? createServiceClient() : await createClient();
}
