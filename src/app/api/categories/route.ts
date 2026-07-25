import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import { mapCategoryRow } from "@/lib/mappers/catalog";
import { categoryCreateSchema, catalogZodError } from "@/lib/validation/catalog";
import type { CategoryRow } from "@/types/database";

async function attachCounts(
  rows: CategoryRow[]
): Promise<ReturnType<typeof mapCategoryRow>[]> {
  if (!hasServiceRoleKey() || rows.length === 0) {
    return rows.map((r) => mapCategoryRow(r, 0));
  }
  const admin = createServiceClient();
  const { data: props } = await admin.from("properties").select("type").eq("status", "active");
  const counts = new Map<string, number>();
  for (const p of props ?? []) {
    counts.set(p.type, (counts.get(p.type) ?? 0) + 1);
  }
  return rows.map((r) => mapCategoryRow(r, counts.get(r.name) ?? 0));
}

export async function GET(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);

  const all =
    request.nextUrl.searchParams.get("all") === "1" ||
    request.nextUrl.searchParams.get("all") === "true";

  if (all) {
    if (!hasServiceRoleKey()) {
      return jsonError("SUPABASE_SERVICE_ROLE_KEY is required for admin catalog lists.", 503);
    }
    const { profile, error } = await authenticateApiRequest(request);
    if (error || !profile) return jsonError("Unauthorized", 401);
    if (profile.status === "suspended" || profile.role !== "admin") {
      return jsonError("Forbidden", 403);
    }
    const admin = createServiceClient();
    const { data, error: listError } = await admin
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });
    if (listError) return jsonError(listError.message, 500);
    return jsonOk(await attachCounts((data as CategoryRow[] | null) ?? []));
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) return jsonError(error.message, 500);
  return jsonOk(await attachCounts((data as CategoryRow[] | null) ?? []));
}

export async function POST(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required to create categories.", 503);
  }

  const { profile, error } = await authenticateApiRequest(request);
  if (error || !profile) return jsonError("Unauthorized", 401);
  if (profile.status === "suspended" || profile.role !== "admin") {
    return jsonError("Forbidden", 403);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body");
  }

  const parsed = categoryCreateSchema.safeParse(body);
  if (!parsed.success) return jsonError(catalogZodError(parsed.error));

  const admin = createServiceClient();
  const { data, error: insertError } = await admin
    .from("categories")
    .insert({
      name: parsed.data.name,
      icon: parsed.data.icon,
      active: parsed.data.active ?? true,
      sort_order: parsed.data.sortOrder ?? 100,
    })
    .select("*")
    .single();

  if (insertError || !data) {
    return jsonError(insertError?.message ?? "Unable to create category", 500);
  }

  return jsonOk(mapCategoryRow(data as CategoryRow, 0), { status: 201 });
}
