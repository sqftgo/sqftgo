import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import {
  mapServiceVerificationDocRow,
  mapServiceVerificationRow,
} from "@/lib/mappers/services";
import {
  serviceVerificationSubmitSchema,
  serviceZodError,
} from "@/lib/validation/services";
import type {
  ServiceVerificationDocumentRow,
  ServiceVerificationRow,
} from "@/types/database";

export async function GET(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required.", 503);
  }

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (profile.status === "suspended") return jsonError("Forbidden", 403);

  const admin = createServiceClient();
  const { data, error: listError } = await admin
    .from("service_verifications")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (listError) return jsonError(listError.message, 500);
  if (!data) return jsonOk(null);

  const row = data as ServiceVerificationRow;
  const { data: docs } = await admin
    .from("service_verification_documents")
    .select("*")
    .eq("verification_id", row.id);

  return jsonOk(
    mapServiceVerificationRow(row, {
      documents: ((docs as ServiceVerificationDocumentRow[] | null) ?? []).map(
        mapServiceVerificationDocRow
      ),
    })
  );
}

export async function POST(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required.", 503);
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

  const parsed = serviceVerificationSubmitSchema.safeParse(body);
  if (!parsed.success) return jsonError(serviceZodError(parsed.error));

  const admin = createServiceClient();
  const { data: dir } = await admin
    .from("directory_profiles")
    .select("id, service_type_id, category")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!dir) return jsonError("Create a service profile before submitting verification", 400);
  if (!dir.service_type_id) {
    return jsonError("Only service directory profiles can submit verification", 400);
  }

  const now = new Date().toISOString();
  const { data: existing } = await admin
    .from("service_verifications")
    .select("*")
    .eq("directory_profile_id", dir.id)
    .maybeSingle();

  let row: ServiceVerificationRow;
  if (existing) {
    if ((existing as ServiceVerificationRow).status === "approved") {
      return jsonError("Verification already approved", 409);
    }
    const { data, error: updateError } = await admin
      .from("service_verifications")
      .update({
        status: "pending",
        business_registration_id: parsed.data.businessRegistrationId ?? null,
        owner_notes: parsed.data.ownerNotes ?? "",
        submitted_at: now,
        rejection_reason: null,
      })
      .eq("id", (existing as ServiceVerificationRow).id)
      .select("*")
      .single();
    if (updateError || !data) {
      return jsonError(updateError?.message ?? "Unable to submit verification", 500);
    }
    row = data as ServiceVerificationRow;
  } else {
    const { data, error: insertError } = await admin
      .from("service_verifications")
      .insert({
        directory_profile_id: dir.id,
        user_id: user.id,
        status: "pending",
        business_registration_id: parsed.data.businessRegistrationId ?? null,
        owner_notes: parsed.data.ownerNotes ?? "",
        submitted_at: now,
      })
      .select("*")
      .single();
    if (insertError || !data) {
      return jsonError(insertError?.message ?? "Unable to submit verification", 500);
    }
    row = data as ServiceVerificationRow;
  }

  await admin
    .from("directory_profiles")
    .update({ verification_status: "pending" })
    .eq("id", dir.id);

  return jsonOk(mapServiceVerificationRow(row), { status: 201 });
}
