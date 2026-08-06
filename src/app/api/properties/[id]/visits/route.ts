import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { enforcePublicRateLimit } from "@/lib/auth/rate-limit";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import { mapVisitRow, type SiteVisitJoined } from "@/lib/mappers/visit";
import { notifyUser } from "@/lib/notifications/server";
import { visitCreateSchema, visitZodError } from "@/lib/validation/visit";
import type { PropertyRow, SiteVisitRow } from "@/types/database";

type RouteContext = { params: Promise<{ id: string }> };

const VISIT_SELECT = `
  *,
  properties (
    id,
    title,
    images,
    locality,
    city,
    owner_name,
    owner_phone,
    owner_id
  )
`;

export async function POST(request: NextRequest, context: RouteContext) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required to book visits.", 503);
  }

  const limited = await enforcePublicRateLimit(request, "propertyVisit");
  if (limited) return limited;

  const { id: propertyId } = await context.params;
  if (!propertyId) return jsonError("Property id is required");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body");
  }

  const parsed = visitCreateSchema.safeParse(body);
  if (!parsed.success) return jsonError(visitZodError(parsed.error));

  const auth = await authenticateApiRequest(request);
  if (auth.profile?.status === "suspended") return jsonError("Forbidden", 403);

  const admin = createServiceClient();
  const { data: property, error: propError } = await admin
    .from("properties")
    .select("id, status, owner_id, title")
    .eq("id", propertyId)
    .maybeSingle();

  if (propError) return jsonError(propError.message, 500);
  if (!property) return jsonError("Property not found", 404);

  const prop = property as Pick<PropertyRow, "id" | "status" | "owner_id" | "title">;
  if (prop.status !== "active") {
    return jsonError("Visits can only be booked on active listings", 400);
  }

  const input = parsed.data;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const scheduled = new Date(`${input.date}T00:00:00`);
  if (Number.isNaN(scheduled.getTime()) || scheduled < today) {
    return jsonError("Visit date must be today or in the future", 400);
  }

  const { data, error: insertError } = await admin
    .from("site_visits")
    .insert({
      property_id: propertyId,
      user_id: auth.user?.id ?? null,
      visitor_name: input.name,
      visitor_email: input.email.toLowerCase(),
      visitor_phone: input.phone,
      scheduled_date: input.date,
      scheduled_time: input.time.trim(),
      status: "pending",
      notes: input.notes?.trim() || null,
    })
    .select(VISIT_SELECT)
    .single();

  if (insertError || !data) {
    return jsonError(insertError?.message ?? "Unable to book visit", 500);
  }

  const row = data as unknown as SiteVisitJoined;
  void notifyUser({
    userId: prop.owner_id,
    forRole: "broker",
    title: "New site visit request",
    message: `${input.name} requested a tour of “${prop.title}” on ${input.date} at ${input.time}.`,
    type: "info",
    eventKey: "visit.created",
    entityType: "site_visit",
    entityId: (row as SiteVisitRow).id,
  });

  return jsonOk(mapVisitRow(row), { status: 201 });
}
