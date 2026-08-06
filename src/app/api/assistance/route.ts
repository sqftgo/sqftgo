import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { enforcePublicRateLimit } from "@/lib/auth/rate-limit";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import { mapAssistanceRow } from "@/lib/mappers/leads";
import { assistanceCreateSchema, leadZodError } from "@/lib/validation/leads";
import type { AssistanceRequestRow } from "@/types/database";

export async function GET(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required to list assistance requests.", 503);
  }

  const { profile, error } = await authenticateApiRequest(request);
  if (error || !profile) return jsonError("Unauthorized", 401);
  if (profile.status === "suspended" || profile.role !== "admin") {
    return jsonError("Forbidden", 403);
  }

  const admin = createServiceClient();
  const { data, error: listError } = await admin
    .from("assistance_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (listError) return jsonError(listError.message, 500);
  return jsonOk((data as AssistanceRequestRow[] | null)?.map(mapAssistanceRow) ?? []);
}

export async function POST(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required to submit assistance requests.", 503);
  }

  const limited = await enforcePublicRateLimit(request, "assistance");
  if (limited) return limited;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body");
  }

  const parsed = assistanceCreateSchema.safeParse(body);
  if (!parsed.success) return jsonError(leadZodError(parsed.error));

  const input = parsed.data;
  const admin = createServiceClient();
  const { data, error: insertError } = await admin
    .from("assistance_requests")
    .insert({
      name: input.name,
      email: input.email.toLowerCase(),
      phone: input.phone,
      budget: input.budget,
      areas: input.areas,
      bhk: input.bhk,
      family_size: input.familySize,
      move_in_date: input.moveInDate,
      notes: input.notes,
      status: "Received",
    })
    .select("*")
    .single();

  if (insertError || !data) {
    return jsonError(insertError?.message ?? "Unable to submit assistance request", 500);
  }

  return jsonOk(mapAssistanceRow(data as AssistanceRequestRow), { status: 201 });
}
