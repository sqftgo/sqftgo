import { type NextRequest } from "next/server";
import { z } from "zod";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { isServiceDirectoryCategory } from "@/features/dealers/lib/is-dealer-category";
import { looksLikeUuid } from "@/lib/services/profile-slug";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import type { DirectoryProfileRow, ServiceReviewRow } from "@/types/database";
import type { ServiceReview } from "@/types";

type RouteContext = { params: Promise<{ id: string }> };

const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional().default(""),
  body: z.string().trim().min(5).max(2000),
});

function mapReview(
  row: ServiceReviewRow,
  reviewerName?: string
): ServiceReview {
  return {
    id: row.id,
    directoryProfileId: row.directory_profile_id,
    userId: row.user_id,
    rating: row.rating,
    title: row.title,
    body: row.body,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    reviewerName,
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
    .from("service_reviews")
    .select("*")
    .eq("directory_profile_id", profile.id)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return jsonError(error.message, 500);

  const rows = (data ?? []) as ServiceReviewRow[];
  const userIds = [...new Set(rows.map((r) => r.user_id))];
  const nameById = new Map<string, string>();
  if (userIds.length) {
    const { data: users } = await admin.from("profiles").select("id, name").in("id", userIds);
    for (const u of users ?? []) {
      nameById.set(u.id as string, (u.name as string) || "Customer");
    }
  }

  const avg =
    rows.length > 0
      ? rows.reduce((sum, r) => sum + r.rating, 0) / rows.length
      : null;

  return jsonOk({
    items: rows.map((r) => mapReview(r, nameById.get(r.user_id))),
    averageRating: avg,
    reviewCount: rows.length,
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

  const parsed = createReviewSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid review", 400);
  }

  const admin = createServiceClient();
  const serviceProfile = await resolveProfile(admin, id);
  if (!serviceProfile) return jsonError("Service profile not found", 404);
  if (serviceProfile.user_id === user.id) {
    return jsonError("You cannot review your own business", 400);
  }

  const { data, error: upsertErr } = await admin
    .from("service_reviews")
    .upsert(
      {
        directory_profile_id: serviceProfile.id,
        user_id: user.id,
        rating: parsed.data.rating,
        title: parsed.data.title,
        body: parsed.data.body,
        status: "published",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "directory_profile_id,user_id" }
    )
    .select("*")
    .single();

  if (upsertErr || !data) {
    return jsonError(upsertErr?.message ?? "Unable to save review", 500);
  }

  return jsonOk(mapReview(data as ServiceReviewRow, profile.name || "Customer"), {
    status: 201,
  });
}
