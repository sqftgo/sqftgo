import { type NextRequest } from "next/server";
import { jsonError, jsonOk } from "@/lib/api/auth";
import { isServiceDirectoryCategory } from "@/features/dealers/lib/is-dealer-category";
import { isWebsitePromotionCurrentlyActive } from "@/lib/mappers/website-promotion";
import { looksLikeUuid } from "@/lib/services/profile-slug";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import type { DirectoryProfileRow, ServiceWebsitePromotionRow } from "@/types/database";

type RouteContext = { params: Promise<{ id: string }> };

/** Public entitlement check — does not expose payment details. */
export async function GET(_request: NextRequest, context: RouteContext) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) return jsonError("SUPABASE_SERVICE_ROLE_KEY is required", 503);

  const { id } = await context.params;
  const admin = createServiceClient();
  await admin.rpc("expire_service_website_promotions");

  let q = admin.from("directory_profiles").select("id, category, website");
  q = looksLikeUuid(id) ? q.eq("id", id) : q.eq("slug", id);
  const { data: profile } = await q.maybeSingle();
  if (!profile) return jsonError("Not found", 404);

  const row = profile as Pick<DirectoryProfileRow, "id" | "category" | "website">;
  if (!isServiceDirectoryCategory(row.category)) return jsonError("Not found", 404);

  const { data: promo } = await admin
    .from("service_website_promotions")
    .select("status, expires_at, website_url")
    .eq("directory_profile_id", row.id)
    .maybeSingle();

  const promoRow = promo as Pick<
    ServiceWebsitePromotionRow,
    "status" | "expires_at" | "website_url"
  > | null;

  const active = Boolean(
    promoRow && isWebsitePromotionCurrentlyActive(promoRow.status, promoRow.expires_at)
  );

  const url = active
    ? (promoRow?.website_url || row.website || "").trim()
    : "";

  return jsonOk({
    active,
    hasWebsite: Boolean(url),
  });
}
