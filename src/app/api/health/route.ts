import { jsonError, jsonOk } from "@/lib/api/auth";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Cheap DB ping. Supabase Free pauses a project after 7 days with no
 * database activity (https://supabase.com/pricing). A daily hit of this
 * route counts as activity. Do not cache the response.
 */
export async function GET() {
  const checkedAt = new Date().toISOString();

  if (!hasSupabaseEnv()) {
    return jsonError("Supabase is not configured", 503, {
      ok: false,
      db: "unconfigured",
      checkedAt,
    });
  }

  const started = Date.now();
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("locations").select("id").limit(1);
    const latencyMs = Date.now() - started;
    if (error) {
      return jsonError("Database unreachable", 503, {
        ok: false,
        db: "down",
        latencyMs,
        checkedAt,
      });
    }
    return jsonOk({
      ok: true,
      service: "sqftgo",
      db: "up",
      latencyMs,
      checkedAt,
      pauseAfterInactiveDays: 7,
    });
  } catch {
    return jsonError("Database unreachable", 503, {
      ok: false,
      db: "down",
      latencyMs: Date.now() - started,
      checkedAt,
    });
  }
}
