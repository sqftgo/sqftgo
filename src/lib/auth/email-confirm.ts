import { hasServiceRoleKey } from "@/lib/supabase/env";
import { isProductionRuntime } from "@/lib/auth/urls";

/**
 * When true, Auth skips email verification:
 * - signup creates confirmed users (admin API)
 * - login auto-confirms stuck unconfirmed accounts then retries
 *
 * NEVER enabled in production (`NODE_ENV=production`), even if
 * AUTH_SKIP_EMAIL_CONFIRM=true — that flag is for local/staging only.
 *
 * Local defaults ON when the service role key is present.
 * Set AUTH_SKIP_EMAIL_CONFIRM=false to require confirmation locally.
 */
export function skipEmailConfirmEnabled(): boolean {
  if (isProductionRuntime()) return false;
  if (!hasServiceRoleKey()) return false;
  if (process.env.AUTH_SKIP_EMAIL_CONFIRM === "false") return false;
  if (process.env.AUTH_SKIP_EMAIL_CONFIRM === "true") return true;
  if (process.env.AUTH_DEV_AUTO_CONFIRM === "true") return true;
  return true;
}
