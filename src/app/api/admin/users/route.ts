import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { clampPageParams } from "@/lib/api/client";
import { createServiceClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import type { ProfileRow } from "@/types/database";

function toMockUser(row: ProfileRow) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    status: row.status,
    joinedDate: row.created_at.split("T")[0] ?? row.created_at,
    inquiriesCount: 0,
  };
}

export async function GET(request: NextRequest) {
  if (!hasSupabaseEnv()) {
    return jsonError("Supabase is not configured", 503);
  }

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) {
    return jsonError("Unauthorized", 401);
  }
  if (profile.role !== "admin" || profile.status === "suspended") {
    return jsonError("Forbidden", 403);
  }

  const { limit, offset } = clampPageParams(
    request.nextUrl.searchParams.get("limit"),
    request.nextUrl.searchParams.get("offset"),
    { limit: 100, maxLimit: 200 }
  );

  const supabase = hasServiceRoleKey()
    ? createServiceClient()
    : await createClient();

  const { data, error: listError, count } = await supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (listError) return jsonError(listError.message, 500);
  return jsonOk({
    items: (data ?? []).map(toMockUser),
    total: count ?? 0,
    limit,
    offset,
  });
}
