import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import { mapListingFilterCreate, mapListingFilterRow } from "@/lib/mappers/listing-filter";
import {
  listingFilterCreateSchema,
  listingFilterZodError,
} from "@/lib/validation/listing-filter";
import type { ListingFilterRow } from "@/types/database";

export async function GET(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);

  const all =
    request.nextUrl.searchParams.get("all") === "1" ||
    request.nextUrl.searchParams.get("all") === "true";

  if (all) {
    if (!hasServiceRoleKey()) {
      return jsonError("SUPABASE_SERVICE_ROLE_KEY is required for admin filter lists.", 503);
    }
    const { profile, error } = await authenticateApiRequest(request);
    if (error || !profile) return jsonError("Unauthorized", 401);
    if (profile.status === "suspended" || profile.role !== "admin") {
      return jsonError("Forbidden", 403);
    }
    const admin = createServiceClient();
    const { data, error: listError } = await admin
      .from("listing_filters")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("label", { ascending: true });
    if (listError) return jsonError(listError.message, 500);
    return jsonOk(((data as ListingFilterRow[] | null) ?? []).map(mapListingFilterRow));
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listing_filters")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .order("label", { ascending: true });
  if (error) return jsonError(error.message, 500);
  return jsonOk(((data as ListingFilterRow[] | null) ?? []).map(mapListingFilterRow));
}

export async function POST(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required to create listing filters.", 503);
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

  const parsed = listingFilterCreateSchema.safeParse(body);
  if (!parsed.success) return jsonError(listingFilterZodError(parsed.error));

  const SYSTEM_KINDS = new Set([
    "purpose",
    "city",
    "locality",
    "type",
    "bhk",
    "furnishing",
    "price",
    "size",
    "amenities",
    "rera",
    "featured",
  ]);
  if (SYSTEM_KINDS.has(parsed.data.kind)) {
    return jsonError("Use toggle/edit on the existing system filter instead of creating a duplicate.", 400);
  }

  const admin = createServiceClient();
  const { data, error: insertError } = await admin
    .from("listing_filters")
    .insert(mapListingFilterCreate(parsed.data))
    .select("*")
    .single();

  if (insertError || !data) {
    const message = insertError?.message ?? "Unable to create listing filter";
    if (/duplicate|unique/i.test(message)) {
      return jsonError("A filter with this key already exists", 409);
    }
    return jsonError(message, 500);
  }

  return jsonOk(mapListingFilterRow(data as ListingFilterRow), { status: 201 });
}
