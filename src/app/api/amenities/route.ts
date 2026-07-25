import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import { mapAmenityRow } from "@/lib/mappers/catalog";
import { amenityCreateSchema, catalogZodError } from "@/lib/validation/catalog";
import type { AmenityRow } from "@/types/database";

export async function GET(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);

  const all =
    request.nextUrl.searchParams.get("all") === "1" ||
    request.nextUrl.searchParams.get("all") === "true";

  if (all) {
    if (!hasServiceRoleKey()) {
      return jsonError("SUPABASE_SERVICE_ROLE_KEY is required for admin amenity lists.", 503);
    }
    const { profile, error } = await authenticateApiRequest(request);
    if (error || !profile) return jsonError("Unauthorized", 401);
    if (profile.status === "suspended" || profile.role !== "admin") {
      return jsonError("Forbidden", 403);
    }
    const admin = createServiceClient();
    const { data, error: listError } = await admin
      .from("amenities")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });
    if (listError) return jsonError(listError.message, 500);
    return jsonOk(((data as AmenityRow[] | null) ?? []).map(mapAmenityRow));
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("amenities")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) return jsonError(error.message, 500);
  return jsonOk(((data as AmenityRow[] | null) ?? []).map(mapAmenityRow));
}

export async function POST(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required to create amenities.", 503);
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

  const parsed = amenityCreateSchema.safeParse(body);
  if (!parsed.success) return jsonError(catalogZodError(parsed.error));

  const admin = createServiceClient();
  const { data, error: insertError } = await admin
    .from("amenities")
    .insert({
      name: parsed.data.name,
      active: parsed.data.active ?? true,
      sort_order: parsed.data.sortOrder ?? 100,
    })
    .select("*")
    .single();

  if (insertError || !data) {
    return jsonError(insertError?.message ?? "Unable to create amenity", 500);
  }

  return jsonOk(mapAmenityRow(data as AmenityRow), { status: 201 });
}
