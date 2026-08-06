import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { enforcePublicRateLimit } from "@/lib/auth/rate-limit";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import { mapInquiryRow } from "@/lib/mappers/inquiry";
import { notifyUser } from "@/lib/notifications/server";
import { inquiryCreateSchema, inquiryZodError } from "@/lib/validation/inquiry";
import type { PropertyInquiryRow, PropertyRow } from "@/types/database";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required to list inquiries.", 503);
  }

  const { id: propertyId } = await context.params;
  if (!propertyId) return jsonError("Property id is required");

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (profile.status === "suspended") return jsonError("Forbidden", 403);

  const isAdmin = profile.role === "admin";
  const admin = createServiceClient();

  if (!isAdmin) {
    const { data: property } = await admin
      .from("properties")
      .select("id, owner_id")
      .eq("id", propertyId)
      .maybeSingle();
    if (!property || property.owner_id !== user.id) {
      return jsonError("Forbidden", 403);
    }
  }

  const { data, error: listError } = await admin
    .from("property_inquiries")
    .select("*")
    .eq("property_id", propertyId)
    .order("created_at", { ascending: false });

  if (listError) return jsonError(listError.message, 500);
  return jsonOk((data as PropertyInquiryRow[] | null)?.map(mapInquiryRow) ?? []);
}

export async function POST(request: NextRequest, context: RouteContext) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);

  const limited = await enforcePublicRateLimit(request, "propertyInquiry");
  if (limited) return limited;

  const { id: propertyId } = await context.params;
  if (!propertyId) return jsonError("Property id is required");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body");
  }

  const parsed = inquiryCreateSchema.safeParse(body);
  if (!parsed.success) return jsonError(inquiryZodError(parsed.error));

  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required to submit inquiries.", 503);
  }

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
    return jsonError("Inquiries are only accepted on active listings", 400);
  }

  const input = parsed.data;
  const { data, error: insertError } = await admin
    .from("property_inquiries")
    .insert({
      property_id: propertyId,
      name: input.name,
      email: input.email.toLowerCase(),
      phone: input.phone,
      message: input.message,
      status: "new",
    })
    .select("*")
    .single();

  if (insertError || !data) {
    return jsonError(insertError?.message ?? "Unable to submit inquiry", 500);
  }

  const inquiry = data as PropertyInquiryRow;
  void notifyUser({
    userId: prop.owner_id,
    forRole: "broker",
    title: "New property inquiry",
    message: `${input.name} inquired about “${prop.title}”.`,
    type: "info",
    eventKey: "inquiry.created",
    entityType: "property_inquiry",
    entityId: inquiry.id,
  });

  return jsonOk(mapInquiryRow(inquiry), { status: 201 });
}
