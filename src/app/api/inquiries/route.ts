import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import { mapInquiryRow } from "@/lib/mappers/inquiry";
import { inquiryStatusSchema } from "@/lib/validation/inquiry";
import type { PropertyInquiryRow } from "@/types/database";

export async function GET(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required to list inquiries.", 503);
  }

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (profile.status === "suspended") return jsonError("Forbidden", 403);

  const { searchParams } = request.nextUrl;
  const mine = searchParams.get("mine") === "1" || searchParams.get("mine") === "true";
  const statusParam = searchParams.get("status");
  const search = searchParams.get("search")?.trim().slice(0, 80);

  const isAdmin = profile.role === "admin";
  const isBroker = profile.role === "broker";
  const isBuyerSelf = mine || (!isAdmin && !isBroker);

  if (!isAdmin && !isBroker && !isBuyerSelf) {
    return jsonError("Forbidden", 403);
  }

  const admin = createServiceClient();
  let query = admin
    .from("property_inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  if (isBuyerSelf && !isAdmin && !isBroker) {
    query = query.ilike("email", profile.email);
  } else if (isBroker && !isAdmin) {
    const { data: owned, error: ownedError } = await admin
      .from("properties")
      .select("id")
      .eq("owner_id", user.id);
    if (ownedError) return jsonError(ownedError.message, 500);
    const ids = (owned ?? []).map((p) => p.id);
    if (ids.length === 0) return jsonOk([]);
    query = query.in("property_id", ids);
  }

  if (statusParam) {
    const parsed = inquiryStatusSchema.safeParse(statusParam);
    if (!parsed.success) return jsonError("Invalid status filter");
    query = query.eq("status", parsed.data);
  }

  if (search) {
    const q = search.replace(/[%_,.()]/g, " ").trim();
    if (q) {
      query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%,message.ilike.%${q}%`);
    }
  }

  const { data, error: listError } = await query;
  if (listError) return jsonError(listError.message, 500);

  return jsonOk((data as PropertyInquiryRow[] | null)?.map(mapInquiryRow) ?? []);
}
