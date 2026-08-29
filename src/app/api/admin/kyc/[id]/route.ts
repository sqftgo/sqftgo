import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { canAccessAdminRoutes } from "@/lib/authz";
import { mapDealerKyc } from "@/lib/mappers/kyc";
import { adminKycReviewSchema } from "@/lib/validation/kyc";
import { createServiceClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import type { DealerKycDocumentRow, DealerKycRow } from "@/types/database";

async function db() {
  return hasServiceRoleKey() ? createServiceClient() : await createClient();
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (!canAccessAdminRoutes(profile)) return jsonError("Forbidden", 403);

  const { id } = await context.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON");
  }

  const parsed = adminKycReviewSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid review", 400);
  }

  const { action, adminNotes, rejectionReason } = parsed.data;
  if (action === "reject" && !rejectionReason?.trim()) {
    return jsonError("Rejection reason is required", 400);
  }

  const supabase = await db();
  const now = new Date().toISOString();
  const { data, error: upErr } = await supabase
    .from("dealer_kyc")
    .update({
      status: action === "approve" ? "approved" : "rejected",
      admin_notes: adminNotes ?? "",
      rejection_reason: action === "reject" ? rejectionReason ?? null : null,
      reviewed_at: now,
      reviewed_by: user.id,
    })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (upErr) return jsonError(upErr.message, 500);
  if (!data) return jsonError("KYC not found", 404);

  const row = data as DealerKycRow;
  void supabase.from("activity_logs").insert({
    action: action === "approve" ? "KYC Approved" : "KYC Rejected",
    performed_by: profile.email,
    actor_id: user.id,
    role: "Admin",
    target: row.user_id,
    entity_type: "dealer_kyc",
    entity_id: row.id,
  });

  // Wire KYC decision into dealer entitlements: role + public verified badge.
  if (action === "approve") {
    await supabase
      .from("profiles")
      .update({ role: "broker" })
      .eq("id", row.user_id)
      .neq("role", "admin");

    const directoryId = row.directory_profile_id;
    if (directoryId) {
      await supabase
        .from("directory_profiles")
        .update({ verification_status: "verified" })
        .eq("id", directoryId);
    } else {
      await supabase
        .from("directory_profiles")
        .update({ verification_status: "verified" })
        .eq("user_id", row.user_id);
    }
  } else {
    const directoryId = row.directory_profile_id;
    if (directoryId) {
      await supabase
        .from("directory_profiles")
        .update({ verification_status: "rejected" })
        .eq("id", directoryId);
    } else {
      await supabase
        .from("directory_profiles")
        .update({ verification_status: "rejected" })
        .eq("user_id", row.user_id);
    }
  }

  const { data: docs } = await supabase
    .from("dealer_kyc_documents")
    .select("*")
    .eq("kyc_id", row.id);

  return jsonOk(mapDealerKyc(row, (docs ?? []) as DealerKycDocumentRow[]));
}
