import { type NextRequest } from "next/server";
import { z } from "zod";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { isServiceDirectoryCategory } from "@/features/dealers/lib/is-dealer-category";
import { looksLikeUuid } from "@/lib/services/profile-slug";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import type { DirectoryProfileRow, ServicePortfolioImageRow } from "@/types/database";
import type { ServicePortfolioImage } from "@/types";

type RouteContext = { params: Promise<{ id: string }> };

const addImageSchema = z.object({
  imageUrl: z.string().trim().url().max(500),
  caption: z.string().trim().max(200).optional().default(""),
  sortOrder: z.number().int().min(0).max(1000).optional().default(0),
});

function mapImage(row: ServicePortfolioImageRow): ServicePortfolioImage {
  return {
    id: row.id,
    directoryProfileId: row.directory_profile_id,
    imageUrl: row.image_url,
    caption: row.caption,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  };
}

async function resolveProfile(
  admin: ReturnType<typeof createServiceClient>,
  idOrSlug: string
) {
  let q = admin.from("directory_profiles").select("*");
  q = looksLikeUuid(idOrSlug) ? q.eq("id", idOrSlug) : q.eq("slug", idOrSlug);
  const { data } = await q.maybeSingle();
  if (!data) return null;
  const row = data as DirectoryProfileRow;
  if (!isServiceDirectoryCategory(row.category)) return null;
  return row;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) return jsonError("SUPABASE_SERVICE_ROLE_KEY is required", 503);

  const { id } = await context.params;
  const admin = createServiceClient();
  const profile = await resolveProfile(admin, id);
  if (!profile) return jsonError("Service profile not found", 404);

  const { data, error } = await admin
    .from("service_portfolio_images")
    .select("*")
    .eq("directory_profile_id", profile.id)
    .order("sort_order", { ascending: true })
    .limit(40);

  if (error) return jsonError(error.message, 500);
  return jsonOk({
    items: ((data ?? []) as ServicePortfolioImageRow[]).map(mapImage),
  });
}

export async function POST(request: NextRequest, context: RouteContext) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) return jsonError("SUPABASE_SERVICE_ROLE_KEY is required", 503);

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);

  const { id } = await context.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON");
  }

  const parsed = addImageSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid image", 400);
  }

  const admin = createServiceClient();
  const serviceProfile = await resolveProfile(admin, id);
  if (!serviceProfile) return jsonError("Service profile not found", 404);

  const isAdmin = profile.role === "admin";
  if (!isAdmin && serviceProfile.user_id !== user.id) {
    return jsonError("Forbidden", 403);
  }

  const { count } = await admin
    .from("service_portfolio_images")
    .select("id", { count: "exact", head: true })
    .eq("directory_profile_id", serviceProfile.id);

  if ((count ?? 0) >= 24) {
    return jsonError("Portfolio limit reached (24 images)", 400);
  }

  const { data, error: insertErr } = await admin
    .from("service_portfolio_images")
    .insert({
      directory_profile_id: serviceProfile.id,
      image_url: parsed.data.imageUrl,
      caption: parsed.data.caption,
      sort_order: parsed.data.sortOrder,
    })
    .select("*")
    .single();

  if (insertErr || !data) {
    return jsonError(insertErr?.message ?? "Unable to add image", 500);
  }

  return jsonOk(mapImage(data as ServicePortfolioImageRow), { status: 201 });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) return jsonError("SUPABASE_SERVICE_ROLE_KEY is required", 503);

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);

  const imageId = request.nextUrl.searchParams.get("imageId")?.trim();
  if (!imageId) return jsonError("imageId is required");

  const { id } = await context.params;
  const admin = createServiceClient();
  const serviceProfile = await resolveProfile(admin, id);
  if (!serviceProfile) return jsonError("Service profile not found", 404);

  const isAdmin = profile.role === "admin";
  if (!isAdmin && serviceProfile.user_id !== user.id) {
    return jsonError("Forbidden", 403);
  }

  const { error: delErr } = await admin
    .from("service_portfolio_images")
    .delete()
    .eq("id", imageId)
    .eq("directory_profile_id", serviceProfile.id);

  if (delErr) return jsonError(delErr.message, 500);
  return jsonOk({ ok: true });
}
