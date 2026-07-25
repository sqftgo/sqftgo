import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import { mapEnquiryRow } from "@/lib/mappers/leads";
import { enquiryCreateSchema, leadZodError } from "@/lib/validation/leads";
import type { GeneralEnquiryRow, Json } from "@/types/database";

export async function GET(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required to list enquiries.", 503);
  }

  const { profile, error } = await authenticateApiRequest(request);
  if (error || !profile) return jsonError("Unauthorized", 401);
  if (profile.status === "suspended" || profile.role !== "admin") {
    return jsonError("Forbidden", 403);
  }

  const admin = createServiceClient();
  const { data, error: listError } = await admin
    .from("general_enquiries")
    .select("*")
    .order("created_at", { ascending: false });

  if (listError) return jsonError(listError.message, 500);
  return jsonOk((data as GeneralEnquiryRow[] | null)?.map(mapEnquiryRow) ?? []);
}

export async function POST(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required to submit enquiries.", 503);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body");
  }

  const parsed = enquiryCreateSchema.safeParse(body);
  if (!parsed.success) return jsonError(leadZodError(parsed.error));

  const input = parsed.data;
  const admin = createServiceClient();
  const { data, error: insertError } = await admin
    .from("general_enquiries")
    .insert({
      name: input.name,
      city: input.city,
      property_type: input.propertyType,
      budget: input.budget,
      email: input.email.toLowerCase(),
      mobile: input.mobile,
      remarks: input.remarks,
      message: input.message ?? null,
      payload: (input.payload as Json | undefined) ?? null,
    })
    .select("*")
    .single();

  if (insertError || !data) {
    return jsonError(insertError?.message ?? "Unable to submit enquiry", 500);
  }

  return jsonOk(mapEnquiryRow(data as GeneralEnquiryRow), { status: 201 });
}
