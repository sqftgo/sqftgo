import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { canAccessDealerDashboard } from "@/lib/authz";
import { mapDealerKyc } from "@/lib/mappers/kyc";
import { dealerKycUpsertSchema } from "@/lib/validation/kyc";
import { createServiceClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import type { DealerKycDocumentRow, DealerKycRow } from "@/types/database";

async function db() {
  return hasServiceRoleKey() ? createServiceClient() : await createClient();
}

export async function GET(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (!canAccessDealerDashboard(profile)) return jsonError("Forbidden", 403);

  const supabase = await db();
  const { data, error: qErr } = await supabase
    .from("dealer_kyc")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (qErr) return jsonError(qErr.message, 500);
  if (!data) return jsonOk(null);

  const { data: docs } = await supabase
    .from("dealer_kyc_documents")
    .select("*")
    .eq("kyc_id", (data as DealerKycRow).id)
    .order("created_at", { ascending: false });

  return jsonOk(
    mapDealerKyc(data as DealerKycRow, (docs ?? []) as DealerKycDocumentRow[])
  );
}

export async function PUT(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (!canAccessDealerDashboard(profile)) return jsonError("Forbidden", 403);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON");
  }

  const parsed = dealerKycUpsertSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid KYC payload", 400);
  }

  const input = parsed.data;
  const supabase = await db();

  const { data: existing } = await supabase
    .from("dealer_kyc")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const existingRow = existing as DealerKycRow | null;
  if (existingRow?.status === "approved") {
    return jsonError("Approved KYC cannot be edited. Contact admin to reopen.", 400);
  }
  if (existingRow?.status === "pending" && !input.submit) {
    return jsonError("KYC is pending review. Wait for a decision or contact admin.", 400);
  }

  const nextStatus = input.submit ? "pending" : "draft";
  const payload = {
    user_id: user.id,
    directory_profile_id: input.directoryProfileId ?? existingRow?.directory_profile_id ?? null,
    pan_number: input.panNumber,
    aadhaar_last4: input.aadhaarLast4,
    dealer_notes: input.dealerNotes ?? "",
    status: nextStatus as DealerKycRow["status"],
    submitted_at: input.submit ? new Date().toISOString() : existingRow?.submitted_at ?? null,
    rejection_reason: input.submit ? null : existingRow?.rejection_reason ?? null,
  };

  const { data, error: upErr } = existingRow
    ? await supabase
        .from("dealer_kyc")
        .update(payload)
        .eq("id", existingRow.id)
        .select("*")
        .maybeSingle()
    : await supabase.from("dealer_kyc").insert(payload).select("*").maybeSingle();

  if (upErr) return jsonError(upErr.message, 500);
  if (!data) return jsonError("KYC save failed", 500);

  const row = data as DealerKycRow;
  const { data: docs } = await supabase
    .from("dealer_kyc_documents")
    .select("*")
    .eq("kyc_id", row.id);

  return jsonOk(mapDealerKyc(row, (docs ?? []) as DealerKycDocumentRow[]));
}
