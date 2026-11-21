import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { canAccessAdminRoutes } from "@/lib/authz";
import { mapWebsitePromotionRow } from "@/lib/mappers/website-promotion";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import {
  adminWebsitePromotionPatchSchema,
  websitePromoZodError,
} from "@/lib/validation/website-promotion";
import type { ServiceWebsitePromotionRow } from "@/types/database";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) return jsonError("SUPABASE_SERVICE_ROLE_KEY is required", 503);

  const { id } = await context.params;
  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (!canAccessAdminRoutes(profile)) return jsonError("Forbidden", 403);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON");
  }

  const parsed = adminWebsitePromotionPatchSchema.safeParse(body);
  if (!parsed.success) return jsonError(websitePromoZodError(parsed.error));

  const admin = createServiceClient();
  const { data: existing, error: loadErr } = await admin
    .from("service_website_promotions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (loadErr) return jsonError(loadErr.message, 500);
  if (!existing) return jsonError("Promotion not found", 404);

  const row = existing as ServiceWebsitePromotionRow;
  const patch: Partial<ServiceWebsitePromotionRow> = {
    updated_at: new Date().toISOString(),
  };

  if (parsed.data.status !== undefined) patch.status = parsed.data.status;
  if (parsed.data.startsAt !== undefined) patch.starts_at = parsed.data.startsAt;
  if (parsed.data.expiresAt !== undefined) patch.expires_at = parsed.data.expiresAt;
  if (parsed.data.websiteUrl !== undefined) patch.website_url = parsed.data.websiteUrl;
  if (parsed.data.adminNotes !== undefined) patch.admin_notes = parsed.data.adminNotes;

  if (parsed.data.extendDays) {
    const base =
      row.expires_at && new Date(row.expires_at).getTime() > Date.now()
        ? new Date(row.expires_at)
        : new Date();
    patch.expires_at = new Date(
      base.getTime() + parsed.data.extendDays * 24 * 60 * 60 * 1000
    ).toISOString();
    patch.status = "active";
    if (!row.starts_at) patch.starts_at = new Date().toISOString();
  }

  if (parsed.data.status === "active" && !parsed.data.expiresAt && !parsed.data.extendDays) {
    if (!row.starts_at) patch.starts_at = new Date().toISOString();
  }

  const { data, error: updErr } = await admin
    .from("service_website_promotions")
    .update(patch)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (updErr) return jsonError(updErr.message, 500);
  if (!data) return jsonError("Promotion not found", 404);

  const updated = data as ServiceWebsitePromotionRow;
  if (parsed.data.websiteUrl !== undefined || updated.website_url) {
    await admin
      .from("directory_profiles")
      .update({ website: updated.website_url || "" })
      .eq("id", updated.directory_profile_id);
  }

  return jsonOk(mapWebsitePromotionRow(updated));
}
