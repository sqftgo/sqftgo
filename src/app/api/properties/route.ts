import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import { mapCreateToInsert, mapPropertyRow, toDbStatus } from "@/lib/mappers/property";
import {
  propertyCreateSchema,
  propertyStatusUiSchema,
  zodErrorMessage,
} from "@/lib/validation/property";
import type { PropertyRow } from "@/types/database";

function parseOptionalNumber(value: string | null): number | undefined {
  if (value == null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function sanitizeSearch(raw: string): string {
  return raw.replace(/[%_,.()]/g, " ").trim().slice(0, 80);
}

export async function GET(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);

  const { searchParams } = request.nextUrl;
  const mine = searchParams.get("mine") === "1" || searchParams.get("mine") === "true";
  const statusParam = searchParams.get("status");
  const city = searchParams.get("city") ?? undefined;
  const type = searchParams.get("type") ?? undefined;
  const purpose = searchParams.get("purpose") ?? undefined;
  const featuredParam = searchParams.get("featured");
  const searchRaw = searchParams.get("search")?.trim() ?? undefined;
  const ownerEmail = searchParams.get("ownerEmail")?.trim().toLowerCase() ?? undefined;
  const minPrice = parseOptionalNumber(searchParams.get("minPrice"));
  const maxPrice = parseOptionalNumber(searchParams.get("maxPrice"));

  const auth = await authenticateApiRequest(request);
  const isAdmin = auth.profile?.role === "admin" && auth.profile.status === "active";

  // User-scoped client so RLS enforces active / own / admin visibility.
  const supabase = await createClient();
  let query = supabase.from("properties").select("*").order("created_at", { ascending: false });

  if (mine) {
    if (!auth.user) return jsonError("Unauthorized", 401);
    query = query.eq("owner_id", auth.user.id);
  } else if (statusParam && statusParam !== "all") {
    const parsed = propertyStatusUiSchema.safeParse(statusParam);
    if (!parsed.success) return jsonError("Invalid status filter");
    query = query.eq("status", toDbStatus(parsed.data));
  }

  if (city && city !== "All India") query = query.eq("city", city);
  if (type && type !== "any") query = query.eq("type", type);
  if (purpose) query = query.eq("purpose", purpose);
  if (featuredParam === "true") query = query.eq("featured", true);
  if (featuredParam === "false") query = query.eq("featured", false);
  if (minPrice !== undefined) query = query.gte("price", minPrice);
  if (maxPrice !== undefined) query = query.lte("price", maxPrice);
  if (ownerEmail) {
    if (!isAdmin && auth.profile?.email?.toLowerCase() !== ownerEmail) {
      return jsonError("Forbidden", 403);
    }
    query = query.ilike("owner_email", ownerEmail);
  }
  if (searchRaw) {
    const search = sanitizeSearch(searchRaw);
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,locality.ilike.%${search}%,city.ilike.%${search}%`
      );
    }
  }

  const { data, error } = await query;
  if (error) return jsonError(error.message, 500);

  return jsonOk((data as PropertyRow[] | null)?.map(mapPropertyRow) ?? []);
}

export async function POST(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required to create properties.", 503);
  }

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (profile.status === "suspended") return jsonError("Forbidden", 403);
  if (profile.role !== "broker" && profile.role !== "admin") {
    return jsonError("Only brokers and admins can create listings", 403);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body");
  }

  const parsed = propertyCreateSchema.safeParse(body);
  if (!parsed.success) return jsonError(zodErrorMessage(parsed.error));

  const input = parsed.data;
  const isAdmin = profile.role === "admin";

  let status = input.status ?? "Pending Review";
  let featured = input.featured ?? false;

  if (!isAdmin) {
    if (status !== "Draft" && status !== "Pending Review") {
      return jsonError("Brokers may only create draft or pending review listings", 403);
    }
    if (featured) return jsonError("Brokers cannot feature listings", 403);
    featured = false;
  }

  const admin = createServiceClient();
  const insert = mapCreateToInsert({
    ownerId: user.id,
    title: input.title,
    price: input.price,
    type: input.type,
    purpose: input.purpose,
    bhk: input.bhk,
    bathrooms: input.bathrooms,
    parking: input.parking,
    yearBuilt: input.yearBuilt,
    city: input.city,
    state: input.state,
    country: input.country,
    locality: input.locality,
    size: input.size,
    furnished: input.furnished,
    description: input.description,
    amenities: input.amenities ?? [],
    images: input.images ?? [],
    videoUrl: input.videoUrl ? input.videoUrl : undefined,
    ownerName: input.ownerName ?? profile.name,
    ownerPhone: input.ownerPhone ?? profile.phone ?? "+91 00000 00000",
    ownerEmail: input.ownerEmail ?? profile.email,
    status,
    featured,
    reraApproved: input.reraApproved,
    reraId: input.reraId,
    verifiedDate: input.verifiedDate,
    seoTitle: input.seoTitle,
    seoDescription: input.seoDescription,
    verificationChecks: input.verificationChecks,
    priceBreakdown: input.priceBreakdown,
  });

  const { data, error: insertError } = await admin
    .from("properties")
    .insert(insert)
    .select("*")
    .single();

  if (insertError || !data) {
    return jsonError(insertError?.message ?? "Unable to create property", 500);
  }

  return jsonOk(mapPropertyRow(data as PropertyRow), { status: 201 });
}
