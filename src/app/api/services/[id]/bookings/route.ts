import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import { mapServiceBookingRow } from "@/lib/mappers/services";
import { serviceBookingCreateSchema, serviceZodError } from "@/lib/validation/services";
import type { DirectoryProfileRow, ServiceBookingRow } from "@/types/database";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required.", 503);
  }

  const { id: profileId } = await context.params;
  if (!profileId) return jsonError("Service profile id is required");

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (profile.status === "suspended") return jsonError("Forbidden", 403);

  const admin = createServiceClient();
  const { data: dir } = await admin
    .from("directory_profiles")
    .select("id, user_id, firm_name, city")
    .eq("id", profileId)
    .maybeSingle();

  if (!dir) return jsonError("Service profile not found", 404);

  const isOwner = dir.user_id === user.id;
  const isAdmin = profile.role === "admin";
  if (!isOwner && !isAdmin) {
    return jsonError("Forbidden", 403);
  }

  const { data, error: listError } = await admin
    .from("service_bookings")
    .select("*")
    .eq("directory_profile_id", profileId)
    .order("preferred_at", { ascending: false });

  if (listError) return jsonError(listError.message, 500);

  return jsonOk({
    items: ((data as ServiceBookingRow[] | null) ?? []).map((row) =>
      mapServiceBookingRow(row, { firmName: dir.firm_name, city: dir.city })
    ),
  });
}

export async function POST(request: NextRequest, context: RouteContext) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required.", 503);
  }

  const { id: profileId } = await context.params;
  if (!profileId) return jsonError("Service profile id is required");

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (profile.status === "suspended") return jsonError("Forbidden", 403);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body");
  }

  const parsed = serviceBookingCreateSchema.safeParse(body);
  if (!parsed.success) return jsonError(serviceZodError(parsed.error));

  const preferred = new Date(parsed.data.preferredAt);
  if (Number.isNaN(preferred.getTime())) {
    return jsonError("Invalid preferred date/time");
  }

  const admin = createServiceClient();
  const { data: dir } = await admin
    .from("directory_profiles")
    .select("id, firm_name, city, listing_active, service_type_id")
    .eq("id", profileId)
    .maybeSingle();

  if (!dir || !(dir as DirectoryProfileRow).listing_active) {
    return jsonError("Service profile not found", 404);
  }
  if (!(dir as DirectoryProfileRow).service_type_id) {
    return jsonError("Bookings are only available for service partners", 400);
  }

  const { data, error: insertError } = await admin
    .from("service_bookings")
    .insert({
      directory_profile_id: profileId,
      user_id: user.id,
      preferred_at: preferred.toISOString(),
      message: parsed.data.message ?? "",
      contact_phone: parsed.data.contactPhone,
      status: "pending",
    })
    .select("*")
    .single();

  if (insertError || !data) {
    return jsonError(insertError?.message ?? "Unable to create booking", 500);
  }

  return jsonOk(
    mapServiceBookingRow(data as ServiceBookingRow, {
      firmName: (dir as DirectoryProfileRow).firm_name,
      city: (dir as DirectoryProfileRow).city,
    }),
    { status: 201 }
  );
}
