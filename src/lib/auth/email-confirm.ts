import { hasServiceRoleKey } from "@/lib/supabase/env";
import { isProductionRuntime } from "@/lib/auth/urls";

/**
 * When true, Auth skips email verification:
 * - signup creates confirmed users (admin API)
 * - login auto-confirms stuck unconfirmed accounts then retries
 *
 * Defaults ON in non-production when the service role key is present.
 * Set AUTH_SKIP_EMAIL_CONFIRM=true to force on (incl. production staging).
 * Set AUTH_SKIP_EMAIL_CONFIRM=false to require email confirmation again.
 */
export function skipEmailConfirmEnabled(): boolean {
  if (!hasServiceRoleKey()) return false;
  if (process.env.AUTH_SKIP_EMAIL_CONFIRM === "false") return false;
  if (process.env.AUTH_SKIP_EMAIL_CONFIRM === "true") return true;
  if (process.env.AUTH_DEV_AUTO_CONFIRM === "true") return true;
  return !isProductionRuntime();
}
