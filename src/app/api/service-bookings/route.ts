import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import { mapServiceBookingRow } from "@/lib/mappers/services";
import type { DirectoryProfileRow, ServiceBookingRow } from "@/types/database";

/** List bookings for the current user (as requester). */
export async function GET(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required.", 503);
  }

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (profile.status === "suspended") return jsonError("Forbidden", 403);

  const admin = createServiceClient();
  const { data, error: listError } = await admin
    .from("service_bookings")
    .select("*")
    .eq("user_id", user.id)
    .order("preferred_at", { ascending: false });

  if (listError) return jsonError(listError.message, 500);

  const rows = (data as ServiceBookingRow[] | null) ?? [];
  const profileIds = [...new Set(rows.map((r) => r.directory_profile_id))];
  const { data: profiles } = profileIds.length
    ? await admin
        .from("directory_profiles")
        .select("id, firm_name, city")
        .in("id", profileIds)
    : { data: [] as Pick<DirectoryProfileRow, "id" | "firm_name" | "city">[] };

  const map = new Map(
    ((profiles as Pick<DirectoryProfileRow, "id" | "firm_name" | "city">[] | null) ?? []).map(
      (p) => [p.id, p]
    )
  );

  return jsonOk({
    items: rows.map((row) => {
      const p = map.get(row.directory_profile_id);
      return mapServiceBookingRow(row, { firmName: p?.firm_name, city: p?.city });
    }),
  });
}
