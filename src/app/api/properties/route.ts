import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import { mapCreateToInsert, mapPropertyRow } from "@/lib/mappers/property";
import { notifyRole } from "@/lib/notifications/server";
import {
  applyPropertyListFilters,
  parsePropertyListParams,
} from "@/lib/server/properties-list";
import { requireActiveCity } from "@/lib/server/active-city";
import {
  propertyCreateSchema,
  propertyStatusUiSchema,
  zodErrorMessage,
} from "@/lib/validation/property";
import type { PropertyRow } from "@/types/database";
import { hasNearbyLandmarks, NEARBY_REQUIRED_MESSAGE } from "@/lib/user-listings";

export async function GET(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);

  const {
    mine,
    statusParam,
    city,
    type,
    purpose,
    featuredParam,
    searchRaw,
    ownerEmail,
    minPrice,
    maxPrice,
    limit,
    offset,
  } = parsePropertyListParams(request.nextUrl.searchParams);

  const filters = {
    statusParam,
    city,
    type,
    purpose,
    featuredParam,
    searchRaw,
    minPrice,
    maxPrice,
  };

  const auth = await authenticateApiRequest(request);
  const isAdmin = auth.profile?.role === "admin" && auth.profile.status === "active";

  // Owner inventory (`mine`) must bypass public RLS (active-only for non-owners).
  // Authenticate first, then read with the service client filtered to auth.user.id.
  if (mine) {
    if (!auth.user || !auth.profile) return jsonError("Unauthorized", 401);
    if (auth.profile.status === "suspended") return jsonError("Forbidden", 403);
    if (!hasServiceRoleKey()) {
      return jsonError("SUPABASE_SERVICE_ROLE_KEY is required for mine listings.", 503);
    }

    const admin = createServiceClient();
    let query = admin
      .from("properties")
      .select("*", { count: "exact" })
      .eq("owner_id", auth.user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const filtered = applyPropertyListFilters(query, filters);
    if ("error" in filtered) return jsonError(filtered.error);
    query = filtered.query;

    const { data, error, count } = await query;
    if (error) return jsonError(error.message, 500);

    return jsonOk({
      items: (data as PropertyRow[] | null)?.map(mapPropertyRow) ?? [],
      total: count ?? 0,
      limit,
      offset,
    });
  }

  // User-scoped client so RLS enforces active / own / admin visibility.
  // Active admins use the service client so Bearer + cookie sessions both see
  // pending/rejected inventory (RLS cookie-only sessions were undercounting).
  // Drafts stay dealer-private — never returned on admin marketplace lists.
  if (isAdmin && statusParam) {
    const parsed = propertyStatusUiSchema.safeParse(statusParam);
    if (parsed.success && parsed.data === "Draft") {
      return jsonOk({ items: [], total: 0, limit, offset });
    }
  }

  const supabase =
    isAdmin && hasServiceRoleKey()
      ? createServiceClient()
      : await createClient();
  let query = supabase
    .from("properties")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (isAdmin) {
    query = query.neq("status", "draft");
  }

  const filtered = applyPropertyListFilters(query, filters);
  if ("error" in filtered) return jsonError(filtered.error);
  query = filtered.query;

  if (ownerEmail) {
    if (!isAdmin && auth.profile?.email?.toLowerCase() !== ownerEmail) {
      return jsonError("Forbidden", 403);
    }
    query = query.ilike("owner_email", ownerEmail);
  }

  const { data, error, count } = await query;
  if (error) return jsonError(error.message, 500);

  return jsonOk({
    items: (data as PropertyRow[] | null)?.map(mapPropertyRow) ?? [],
    total: count ?? 0,
    limit,
    offset,
  });
}

export async function POST(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required to create properties.", 503);
  }

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (profile.status === "suspended") return jsonError("Forbidden", 403);
  if (profile.role !== "broker" && profile.role !== "admin" && profile.role !== "user") {
    return jsonError("Only signed-in clients, brokers, and admins can create listings", 403);
  }
  if (profile.role === "user" && profile.listing_status === "rejected") {
    return jsonError("Listing access was declined. Contact support if this is a mistake.", 403);
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
      return jsonError("You may only create draft or pending review listings", 403);
    }
    if (featured) return jsonError("Only admins can feature listings", 403);
    featured = false;
  }

  const admin = createServiceClient();

  const cityCheck = await requireActiveCity(admin, input.city);
  if (!cityCheck.ok) return jsonError(cityCheck.error, 400);
  const city = cityCheck.location.city;
  const state = input.state?.trim() || cityCheck.location.state;
  const country = input.country?.trim() || cityCheck.location.country;

  // Enforce platform listing policy (admins bypass).
  if (!isAdmin) {
    if (status !== "Draft" && !hasNearbyLandmarks(input)) {
      return jsonError(NEARBY_REQUIRED_MESSAGE, 400);
    }

    const { data: settings } = await admin
      .from("platform_settings")
      .select(
        "require_listing_approval, max_listings_per_dealer, allow_user_listings, max_listings_per_user"
      )
      .eq("id", 1)
      .maybeSingle();

    const requireApproval = settings?.require_listing_approval !== false;
    if (requireApproval && status !== "Draft") {
      status = "Pending Review";
    }

    if (profile.role === "user") {
      if (settings?.allow_user_listings === false) {
        return jsonError("Client listings are turned off by admin.", 403);
      }
      const maxListings = settings?.max_listings_per_user ?? 2;
      const { count, error: countError } = await admin
        .from("properties")
        .select("id", { count: "exact", head: true })
        .eq("owner_id", user.id)
        .neq("status", "rejected");
      if (countError) return jsonError(countError.message, 500);
      if ((count ?? 0) >= maxListings) {
        return jsonError(
          `You can list up to ${maxListings} properties. Remove or wait for a rejected listing to free a slot.`,
          403
        );
      }
      if (profile.listing_status === "none" && status === "Pending Review") {
        await admin
          .from("profiles")
          .update({ listing_status: "pending" })
          .eq("id", user.id)
          .eq("listing_status", "none");
      }
    } else {
      const maxListings = settings?.max_listings_per_dealer ?? null;
      if (maxListings != null && maxListings >= 1) {
        const { count, error: countError } = await admin
          .from("properties")
          .select("id", { count: "exact", head: true })
          .eq("owner_id", user.id)
          .neq("status", "rejected");
        if (countError) return jsonError(countError.message, 500);
        if ((count ?? 0) >= maxListings) {
          return jsonError(
            `Listing limit reached (${maxListings}). Remove or archive a listing before adding another.`,
            403
          );
        }
      }
    }
  }

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
    city,
    state,
    country,
    locality: input.locality,
    nearbyHospital: input.nearbyHospital,
    nearbySchool: input.nearbySchool,
    nearbyTransportation: input.nearbyTransportation,
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

  const created = data as PropertyRow;
  if (created.status === "pending_review") {
    void notifyRole("admin", {
      title: "Listing awaiting review",
      message: `“${created.title}” was submitted for approval.`,
      type: "warning",
      eventKey: "property.pending_review",
      entityType: "property",
      entityId: created.id,
    });
  }

  return jsonOk(mapPropertyRow(created), { status: 201 });
}
