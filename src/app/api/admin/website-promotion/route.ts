import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { canAccessAdminRoutes } from "@/lib/authz";
import {
  mapWebsitePromotionPaymentRow,
  mapWebsitePromotionRow,
} from "@/lib/mappers/website-promotion";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import type {
  ServiceWebsitePromotionPaymentRow,
  ServiceWebsitePromotionPlanRow,
  ServiceWebsitePromotionRow,
} from "@/types/database";

export async function GET(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) return jsonError("SUPABASE_SERVICE_ROLE_KEY is required", 503);

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (!canAccessAdminRoutes(profile)) return jsonError("Forbidden", 403);

  const admin = createServiceClient();
  await admin.rpc("expire_service_website_promotions");

  const status = request.nextUrl.searchParams.get("status")?.trim();
  let q = admin
    .from("service_website_promotions")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(100);
  if (
    status === "inactive" ||
    status === "pending" ||
    status === "active" ||
    status === "expired" ||
    status === "cancelled"
  ) {
    q = q.eq("status", status);
  }

  const { data, error: qErr } = await q;
  if (qErr) return jsonError(qErr.message, 500);

  const rows = (data ?? []) as ServiceWebsitePromotionRow[];
  const planIds = [...new Set(rows.map((r) => r.plan_id).filter(Boolean) as string[])];
  const profileIds = [...new Set(rows.map((r) => r.directory_profile_id))];

  const planById = new Map<string, ServiceWebsitePromotionPlanRow>();
  if (planIds.length) {
    const { data: plans } = await admin
      .from("service_website_promotion_plans")
      .select("*")
      .in("id", planIds);
    for (const p of (plans ?? []) as ServiceWebsitePromotionPlanRow[]) {
      planById.set(p.id, p);
    }
  }

  const firmById = new Map<string, string>();
  if (profileIds.length) {
    const { data: profiles } = await admin
      .from("directory_profiles")
      .select("id, firm_name")
      .in("id", profileIds);
    for (const p of profiles ?? []) {
      firmById.set(p.id as string, p.firm_name as string);
    }
  }

  const { data: payments } = await admin
    .from("service_website_promotion_payments")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  return jsonOk({
    items: rows.map((r) => ({
      ...mapWebsitePromotionRow(r, r.plan_id ? planById.get(r.plan_id) : null),
      firmName: firmById.get(r.directory_profile_id) ?? null,
    })),
    payments: ((payments ?? []) as ServiceWebsitePromotionPaymentRow[]).map((p) =>
      mapWebsitePromotionPaymentRow(p)
    ),
  });
}
