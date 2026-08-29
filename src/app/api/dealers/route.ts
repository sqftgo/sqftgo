import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { clampPageParams } from "@/lib/api/client";
import { createServiceClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import { mapDealerCreateToInsert, mapDealerRow } from "@/lib/mappers/dealer";
import { requireActiveCity } from "@/lib/server/active-city";
import { dealerCreateSchema, dealerZodError, directoryCategorySchema } from "@/lib/validation/dealer";
import {
  DEALER_CATEGORIES,
  isDealerCategory,
  isServiceDirectoryCategory,
} from "@/features/dealers/lib/is-dealer-category";
import type { DirectoryProfileRow } from "@/types/database";

export async function GET(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);

  const { searchParams } = request.nextUrl;
  const city = searchParams.get("city")?.trim();
  const categoryParam = searchParams.get("category")?.trim();
  const search = searchParams.get("search")?.trim().slice(0, 80);
  const surface = searchParams.get("surface")?.trim().toLowerCase();
  const mine = searchParams.get("mine") === "1" || searchParams.get("mine") === "true";
  const { limit, offset } = clampPageParams(
    searchParams.get("limit"),
    searchParams.get("offset"),
    { limit: 100, maxLimit: 200 }
  );

  const supabase = hasServiceRoleKey() ? createServiceClient() : await createClient();
  let query = supabase
    .from("directory_profiles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (mine) {
    const { user, error } = await authenticateApiRequest(request);
    if (error || !user) return jsonError("Unauthorized", 401);
    query = query.eq("user_id", user.id);
  }

  if (city && city !== "All India") query = query.eq("city", city);

  if (categoryParam) {
    const parsed = directoryCategorySchema.safeParse(categoryParam);
    if (!parsed.success) return jsonError("Invalid category filter");
    query = query.eq("category", parsed.data);
  } else if (surface === "dealers") {
    query = query.in("category", [...DEALER_CATEGORIES]);
  }

  if (search) {
    const q = search.replace(/[%_,.()"']/g, " ").trim();
    if (q) {
      query = query.or(
        `firm_name.ilike.%${q}%,owner_name.ilike.%${q}%,city.ilike.%${q}%,email.ilike.%${q}%`
      );
    }
  }

  const { data, error: listError, count } = await query;
  if (listError) return jsonError(listError.message, 500);

  let items = (data as DirectoryProfileRow[] | null)?.map(mapDealerRow) ?? [];
  if (surface === "services") {
    items = items.filter((p) => isServiceDirectoryCategory(p.category));
  } else if (surface === "dealers") {
    items = items.filter((p) => isDealerCategory(p.category));
  }

  return jsonOk({
    items,
    total: surface === "services" ? items.length : (count ?? 0),
    limit,
    offset,
  });
}

export async function POST(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required to create directory profiles.", 503);
  }

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (profile.status === "suspended") return jsonError("Forbidden", 403);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body");
  }

  const parsed = dealerCreateSchema.safeParse(body);
  if (!parsed.success) return jsonError(dealerZodError(parsed.error));

  const admin = createServiceClient();
  const isAdmin = profile.role === "admin";

  const { data: existingByUser } = await admin
    .from("directory_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (existingByUser) {
    return jsonError("You already have a directory profile", 409);
  }

  const email = parsed.data.email.toLowerCase();
  const { data: existingByEmail } = await admin
    .from("directory_profiles")
    .select("id")
    .ilike("email", email)
    .maybeSingle();
  if (existingByEmail) {
    return jsonError("A directory profile with this email already exists", 409);
  }

  const cityCheck = await requireActiveCity(admin, parsed.data.city);
  if (!cityCheck.ok) return jsonError(cityCheck.error, 400);

  // Resolve service type name into category when registering a service trade
  let category = parsed.data.category;
  let serviceTypeId = parsed.data.serviceTypeId ?? null;
  if (serviceTypeId) {
    const { data: st } = await admin
      .from("service_types")
      .select("id, name, active")
      .eq("id", serviceTypeId)
      .maybeSingle();
    if (!st || !st.active) {
      return jsonError("Invalid or inactive service type", 400);
    }
    category = st.name;
    if (isDealerCategory(category)) {
      return jsonError("Builders and dealers must register via the dealer flow", 400);
    }
  } else if (isServiceDirectoryCategory(category)) {
    const { data: st } = await admin
      .from("service_types")
      .select("id")
      .eq("name", category)
      .eq("active", true)
      .maybeSingle();
    serviceTypeId = st?.id ?? null;
  }

  const insert = mapDealerCreateToInsert(
    {
      ...parsed.data,
      category,
      serviceTypeId,
      city: cityCheck.location.city,
      coverImageUrl: parsed.data.coverImageUrl || null,
      logoUrl: parsed.data.logoUrl || null,
      // Dealer applications start pending until admin KYC / verification.
      verificationStatus: isDealerCategory(category) ? "pending" : "unverified",
    },
    user.id
  );
  if (isAdmin && body && typeof body === "object" && "linkUser" in body && (body as { linkUser?: boolean }).linkUser === false) {
    insert.user_id = null;
  }

  const { data, error: insertError } = await admin
    .from("directory_profiles")
    .insert(insert)
    .select("*")
    .single();

  if (insertError || !data) {
    return jsonError(insertError?.message ?? "Unable to create directory profile", 500);
  }

  return jsonOk(mapDealerRow(data as DirectoryProfileRow), { status: 201 });
}
