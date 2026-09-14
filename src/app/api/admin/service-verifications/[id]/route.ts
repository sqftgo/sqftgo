import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import { mapServiceVerificationRow } from "@/lib/mappers/services";
import {
  serviceVerificationAdminUpdateSchema,
  serviceZodError,
} from "@/lib/validation/services";
import type { ServiceVerificationRow } from "@/types/database";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required.", 503);
  }

  const { id } = await context.params;
  if (!id) return jsonError("Verification id is required");

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (profile.status === "suspended" || profile.role !== "admin") {
    return jsonError("Forbidden", 403);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body");
  }

  const parsed = serviceVerificationAdminUpdateSchema.safeParse(body);
  if (!parsed.success) return jsonError(serviceZodError(parsed.error));

  if (parsed.data.status === "rejected" && !parsed.data.rejectionReason?.trim()) {
    return jsonError("Rejection reason is required");
  }

  const admin = createServiceClient();
  const now = new Date().toISOString();
  const { data, error: updateError } = await admin
    .from("service_verifications")
    .update({
      status: parsed.data.status,
      admin_notes: parsed.data.adminNotes ?? "",
      rejection_reason:
        parsed.data.status === "rejected" ? parsed.data.rejectionReason ?? null : null,
      reviewed_at: now,
      reviewed_by: user.id,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (updateError || !data) {
    return jsonError(updateError?.message ?? "Unable to update verification", 500);
  }

  const row = data as ServiceVerificationRow;
  const verificationStatus =
    parsed.data.status === "approved"
      ? "verified"
      : parsed.data.status === "rejected"
        ? "rejected"
        : "pending";

  await admin
    .from("directory_profiles")
    .update({ verification_status: verificationStatus })
    .eq("id", row.directory_profile_id);

  return jsonOk(mapServiceVerificationRow(row));
}
