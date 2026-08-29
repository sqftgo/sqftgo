import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import { mapProjectCreateToInsert, mapProjectRow } from "@/lib/mappers/project";
import { requireActiveCity } from "@/lib/server/active-city";
import {
  projectCreateSchema,
  projectStatusUiSchema,
  zodErrorMessage,
} from "@/lib/validation/project";
import type { ProjectRow } from "@/types/database";

function parseListParams(searchParams: URLSearchParams) {
  const mine = searchParams.get("mine") === "1" || searchParams.get("mine") === "true";
  const statusParam = searchParams.get("status") || undefined;
  const city = searchParams.get("city")?.trim() || undefined;
  const searchRaw = searchParams.get("search")?.trim() || undefined;
  const limit = Math.min(Math.max(Number(searchParams.get("limit") || 50) || 50, 1), 100);
  const offset = Math.max(Number(searchParams.get("offset") || 0) || 0, 0);
  return { mine, statusParam, city, searchRaw, limit, offset };
}

export async function GET(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);

  const { mine, statusParam, city, searchRaw, limit, offset } = parseListParams(
    request.nextUrl.searchParams,
  );

  const auth = await authenticateApiRequest(request);
  const isAdmin = auth.profile?.role === "admin" && auth.profile.status === "active";

  if (mine) {
    if (!auth.user || !auth.profile) return jsonError("Unauthorized", 401);
    if (auth.profile.status === "suspended") return jsonError("Forbidden", 403);
    if (!hasServiceRoleKey()) {
      return jsonError("SUPABASE_SERVICE_ROLE_KEY is required for mine projects.", 503);
    }

    const admin = createServiceClient();
    let query = admin
      .from("projects")
      .select("*", { count: "exact" })
      .eq("owner_id", auth.user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (statusParam) {
      const parsed = projectStatusUiSchema.safeParse(statusParam);
      if (!parsed.success) return jsonError("Invalid status filter");
      const { toDbProjectStatus } = await import("@/lib/mappers/project");
      query = query.eq("status", toDbProjectStatus(parsed.data));
    }
    if (city) query = query.eq("city", city);
    if (searchRaw) query = query.ilike("title", `%${searchRaw}%`);

    const { data, error, count } = await query;
    if (error) return jsonError(error.message, 500);

    return jsonOk({
      items: (data as ProjectRow[] | null)?.map(mapProjectRow) ?? [],
      total: count ?? 0,
      limit,
      offset,
    });
  }

  if (isAdmin && statusParam) {
    const parsed = projectStatusUiSchema.safeParse(statusParam);
    if (parsed.success && parsed.data === "Draft") {
      return jsonOk({ items: [], total: 0, limit, offset });
    }
  }

  const supabase =
    isAdmin && hasServiceRoleKey() ? createServiceClient() : await createClient();

  let query = supabase
    .from("projects")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (isAdmin) {
    query = query.neq("status", "draft");
  }

  if (statusParam) {
    const parsed = projectStatusUiSchema.safeParse(statusParam);
    if (!parsed.success) return jsonError("Invalid status filter");
    const { toDbProjectStatus } = await import("@/lib/mappers/project");
    query = query.eq("status", toDbProjectStatus(parsed.data));
  } else if (!isAdmin) {
    query = query.eq("status", "active");
  }

  if (city) query = query.eq("city", city);
  if (searchRaw) query = query.ilike("title", `%${searchRaw}%`);

  const { data, error, count } = await query;
  if (error) return jsonError(error.message, 500);

  return jsonOk({
    items: (data as ProjectRow[] | null)?.map(mapProjectRow) ?? [],
    total: count ?? 0,
    limit,
    offset,
  });
}

export async function POST(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required to create projects.", 503);
  }

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (profile.status === "suspended") return jsonError("Forbidden", 403);
  if (profile.role !== "broker" && profile.role !== "admin") {
    return jsonError("Only brokers and admins can create projects", 403);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body");
  }

  const parsed = projectCreateSchema.safeParse(body);
  if (!parsed.success) return jsonError(zodErrorMessage(parsed.error));

  const input = parsed.data;
  const isAdmin = profile.role === "admin";

  let status = input.status ?? "Pending Review";
  let featured = input.featured ?? false;

  if (!isAdmin) {
    if (status !== "Draft" && status !== "Pending Review") {
      return jsonError("Brokers may only create draft or pending review projects", 403);
    }
    if (featured) return jsonError("Brokers cannot feature projects", 403);
    featured = false;
  }

  if (status === "Pending Review" && (!input.images || input.images.length < 1)) {
    return jsonError("At least one image is required before submitting for review", 400);
  }

  const admin = createServiceClient();

  const cityCheck = await requireActiveCity(admin, input.city);
  if (!cityCheck.ok) return jsonError(cityCheck.error, 400);
  const city = cityCheck.location.city;
  const state = input.state?.trim() || cityCheck.location.state;
  const country = input.country?.trim() || cityCheck.location.country;

  if (!isAdmin) {
    const { data: settings } = await admin
      .from("platform_settings")
      .select("require_listing_approval, max_listings_per_dealer")
      .limit(1)
      .maybeSingle();

    const requireApproval = settings?.require_listing_approval !== false;
    if (status !== "Draft") {
      status = requireApproval ? "Pending Review" : "Active";
    }

    const max = settings?.max_listings_per_dealer;
    if (typeof max === "number" && max > 0) {
      const { count, error: countError } = await admin
        .from("projects")
        .select("id", { count: "exact", head: true })
        .eq("owner_id", user.id)
        .neq("status", "rejected");
      if (countError) return jsonError(countError.message, 500);
      if ((count ?? 0) >= max) {
        return jsonError(`Project limit reached (${max}). Contact support to raise your cap.`, 403);
      }
    }
  }

  const contactName =
    input.contactName?.trim() || profile.name?.trim() || profile.email?.split("@")[0] || "Dealer";
  const contactPhone = input.contactPhone?.trim() || profile.phone?.trim() || "";
  if (!contactPhone) {
    return jsonError("contactPhone is required (set on your profile or in the form)", 400);
  }

  const insert = mapProjectCreateToInsert({
    ownerId: user.id,
    title: input.title,
    description: input.description,
    city,
    state,
    country,
    locality: input.locality,
    ownershipRole: input.ownershipRole ?? "Owner",
    lifecycle: input.lifecycle ?? "Upcoming",
    propertyTypes: input.propertyTypes ?? [],
    configurations: input.configurations ?? [],
    priceFrom: input.priceFrom,
    priceTo: input.priceTo,
    sizeFrom: input.sizeFrom,
    sizeTo: input.sizeTo,
    amenities: input.amenities ?? [],
    images: input.images ?? [],
    contactName,
    contactPhone,
    // RERA deferred for projects v1 (properties / dealer profile still use RERA).
    reraId: null,
    reraApproved: false,
    possessionDate: input.possessionDate,
    launchDate: input.launchDate,
    status,
    featured,
    seoTitle: input.seoTitle,
    seoDescription: input.seoDescription,
  });

  const { data, error: insertError } = await admin
    .from("projects")
    .insert(insert)
    .select("*")
    .single();

  if (insertError || !data) {
    return jsonError(insertError?.message ?? "Unable to create project", 500);
  }

  return jsonOk(mapProjectRow(data as ProjectRow), { status: 201 });
}
