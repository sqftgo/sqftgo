import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import { mapVisitRow, type SiteVisitJoined } from "@/lib/mappers/visit";
import { visitStatusUiSchema } from "@/lib/validation/visit";

const VISIT_SELECT = `
  *,
  properties (
    id,
    title,
    images,
    locality,
    city,
    owner_name,
    owner_phone,
    owner_id
  )
`;

export async function GET(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required to list visits.", 503);
  }

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (profile.status === "suspended") return jsonError("Forbidden", 403);

  const statusParam = request.nextUrl.searchParams.get("status");
  const admin = createServiceClient();

  let query = admin
    .from("site_visits")
    .select(VISIT_SELECT)
    .order("scheduled_date", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(100);

  const isAdmin = profile.role === "admin";
  const isBroker = profile.role === "broker";

  if (isAdmin) {
    // all visits
  } else if (isBroker) {
    const { data: owned, error: ownedError } = await admin
      .from("properties")
      .select("id")
      .eq("owner_id", user.id);
    if (ownedError) return jsonError(ownedError.message, 500);
    const ids = (owned ?? []).map((p) => p.id);
    if (ids.length === 0) return jsonOk([]);
    query = query.in("property_id", ids);
  } else {
    query = query.or(
      `user_id.eq.${user.id},visitor_email.eq.${profile.email.toLowerCase()}`
    );
  }

  if (statusParam) {
    const parsed = visitStatusUiSchema.safeParse(statusParam);
    if (!parsed.success) return jsonError("Invalid status filter");
    const db =
      parsed.data === "Pending Approval"
        ? "pending"
        : parsed.data === "Confirmed"
          ? "confirmed"
          : parsed.data === "Completed"
            ? "completed"
            : "cancelled";
    query = query.eq("status", db);
  }

  const { data, error: listError } = await query;
  if (listError) return jsonError(listError.message, 500);

  return jsonOk(
    ((data as unknown as SiteVisitJoined[] | null) ?? []).map(mapVisitRow)
  );
}
