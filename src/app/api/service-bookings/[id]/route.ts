import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import { mapServiceBookingRow } from "@/lib/mappers/services";
import { serviceBookingUpdateSchema, serviceZodError } from "@/lib/validation/services";
import type { ServiceBookingRow } from "@/types/database";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required.", 503);
  }

  const { id } = await context.params;
  if (!id) return jsonError("Booking id is required");

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (profile.status === "suspended") return jsonError("Forbidden", 403);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body");
  }

  const parsed = serviceBookingUpdateSchema.safeParse(body);
  if (!parsed.success) return jsonError(serviceZodError(parsed.error));

  const admin = createServiceClient();
  const { data: existing } = await admin
    .from("service_bookings")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!existing) return jsonError("Booking not found", 404);
  const booking = existing as ServiceBookingRow;

  const { data: dir } = await admin
    .from("directory_profiles")
    .select("user_id, firm_name, city")
    .eq("id", booking.directory_profile_id)
    .maybeSingle();

  const isOwner = dir?.user_id === user.id;
  const isRequester = booking.user_id === user.id;
  const isAdmin = profile.role === "admin";

  if (!isOwner && !isRequester && !isAdmin) {
    return jsonError("Forbidden", 403);
  }

  // Requesters may only cancel their own pending bookings
  if (isRequester && !isOwner && !isAdmin) {
    if (parsed.data.status && parsed.data.status !== "cancelled") {
      return jsonError("You can only cancel your booking", 403);
    }
  }

  const patch: Partial<ServiceBookingRow> = {};
  if (parsed.data.status !== undefined) patch.status = parsed.data.status;
  if (parsed.data.ownerNotes !== undefined && (isOwner || isAdmin)) {
    patch.owner_notes = parsed.data.ownerNotes;
  }
  if (parsed.data.message !== undefined && (isRequester || isAdmin)) {
    patch.message = parsed.data.message;
  }
  if (parsed.data.contactPhone !== undefined && (isRequester || isAdmin)) {
    patch.contact_phone = parsed.data.contactPhone;
  }
  if (parsed.data.preferredAt !== undefined && (isRequester || isAdmin)) {
    const d = new Date(parsed.data.preferredAt);
    if (Number.isNaN(d.getTime())) return jsonError("Invalid preferred date/time");
    patch.preferred_at = d.toISOString();
  }

  const { data, error: updateError } = await admin
    .from("service_bookings")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (updateError || !data) {
    return jsonError(updateError?.message ?? "Unable to update booking", 500);
  }

  return jsonOk(
    mapServiceBookingRow(data as ServiceBookingRow, {
      firmName: dir?.firm_name,
      city: dir?.city,
    })
  );
}
