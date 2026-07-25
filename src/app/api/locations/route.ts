import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import { mapLocationRow } from "@/lib/mappers/catalog";
import { locationCreateSchema, catalogZodError } from "@/lib/validation/catalog";
import type { LocationRow } from "@/types/database";

async function attachCounts(
  rows: LocationRow[]
): Promise<ReturnType<typeof mapLocationRow>[]> {
  if (!hasServiceRoleKey() || rows.length === 0) {
    return rows.map((r) => mapLocationRow(r, 0));
  }
  const admin = createServiceClient();
  const { data: props } = await admin.from("properties").select("city").eq("status", "active");
  const counts = new Map<string, number>();
  for (const p of props ?? []) {
    const key = p.city.toLowerCase();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return rows.map((r) => mapLocationRow(r, counts.get(r.city.toLowerCase()) ?? 0));
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
      .from("locations")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("city", { ascending: true });
    if (listError) return jsonError(listError.message, 500);
    return jsonOk(await attachCounts((data as LocationRow[] | null) ?? []));
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("locations")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .order("city", { ascending: true });
  if (error) return jsonError(error.message, 500);
  return jsonOk(await attachCounts((data as LocationRow[] | null) ?? []));
}

export async function POST(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required to create locations.", 503);
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

  const parsed = locationCreateSchema.safeParse(body);
  if (!parsed.success) return jsonError(catalogZodError(parsed.error));

  const admin = createServiceClient();
  const { data, error: insertError } = await admin
    .from("locations")
    .insert({
      city: parsed.data.city,
      state: parsed.data.state,
      country: parsed.data.country,
      active: parsed.data.active ?? true,
      sort_order: parsed.data.sortOrder ?? 100,
    })
    .select("*")
    .single();

  if (insertError || !data) {
    return jsonError(insertError?.message ?? "Unable to create location", 500);
  }

  return jsonOk(mapLocationRow(data as LocationRow, 0), { status: 201 });
}
