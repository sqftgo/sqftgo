import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import { mapInquiryRow } from "@/lib/mappers/inquiry";
import { inquiryUpdateSchema, inquiryZodError } from "@/lib/validation/inquiry";
import type { PropertyInquiryRow } from "@/types/database";

type RouteContext = { params: Promise<{ id: string }> };

async function assertCanManageInquiry(
  inquiryId: string,
  userId: string,
  isAdmin: boolean
): Promise<{ row: PropertyInquiryRow } | { error: string; status: number }> {
  const admin = createServiceClient();
  const { data, error } = await admin
    .from("property_inquiries")
    .select("*")
    .eq("id", inquiryId)
    .maybeSingle();

  if (error) return { error: error.message, status: 500 };
  if (!data) return { error: "Inquiry not found", status: 404 };

  const row = data as PropertyInquiryRow;
  if (isAdmin) return { row };

  const { data: property } = await admin
    .from("properties")
    .select("owner_id")
    .eq("id", row.property_id)
    .maybeSingle();

  if (!property || property.owner_id !== userId) {
    return { error: "Forbidden", status: 403 };
  }

  return { row };
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required to update inquiries.", 503);
  }

  const { id } = await context.params;
  if (!id) return jsonError("Inquiry id is required");

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (profile.status === "suspended") return jsonError("Forbidden", 403);

  const isAdmin = profile.role === "admin";
  const isBroker = profile.role === "broker";
  if (!isAdmin && !isBroker) return jsonError("Forbidden", 403);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body");
  }

  const parsed = inquiryUpdateSchema.safeParse(body);
  if (!parsed.success) return jsonError(inquiryZodError(parsed.error));

  const access = await assertCanManageInquiry(id, user.id, isAdmin);
  if ("error" in access) return jsonError(access.error, access.status);

  const admin = createServiceClient();
  const { data, error: updateError } = await admin
    .from("property_inquiries")
    .update({ status: parsed.data.status })
    .eq("id", id)
    .select("*")
    .single();

  if (updateError || !data) {
    return jsonError(updateError?.message ?? "Unable to update inquiry", 500);
  }

  return jsonOk(mapInquiryRow(data as PropertyInquiryRow));
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required to delete inquiries.", 503);
  }

  const { id } = await context.params;
  if (!id) return jsonError("Inquiry id is required");

  const { user, profile, error } = await authenticateApiRequest(_request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (profile.status === "suspended") return jsonError("Forbidden", 403);

  const isAdmin = profile.role === "admin";
  const isBroker = profile.role === "broker";
  if (!isAdmin && !isBroker) return jsonError("Forbidden", 403);

  const access = await assertCanManageInquiry(id, user.id, isAdmin);
  if ("error" in access) return jsonError(access.error, access.status);

  const admin = createServiceClient();
  const { error: deleteError } = await admin.from("property_inquiries").delete().eq("id", id);
  if (deleteError) return jsonError(deleteError.message, 500);

  return jsonOk({ ok: true });
}
