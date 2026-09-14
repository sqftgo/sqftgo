import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import {
  mapServiceVerificationDocRow,
  mapServiceVerificationRow,
} from "@/lib/mappers/services";
import type {
  DirectoryProfileRow,
  ServiceVerificationDocumentRow,
  ServiceVerificationRow,
} from "@/types/database";

export async function GET(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required.", 503);
  }

  const { profile, error } = await authenticateApiRequest(request);
  if (error || !profile) return jsonError("Unauthorized", 401);
  if (profile.status === "suspended" || profile.role !== "admin") {
    return jsonError("Forbidden", 403);
  }

  const statusParam = request.nextUrl.searchParams.get("status")?.trim() || "pending";
  const admin = createServiceClient();
  let query = admin
    .from("service_verifications")
    .select("*")
    .order("submitted_at", { ascending: false, nullsFirst: false });

  if (statusParam !== "all") {
    query = query.eq(
      "status",
      statusParam as "draft" | "pending" | "approved" | "rejected"
    );
  }

  const { data, error: listError } = await query;
  if (listError) return jsonError(listError.message, 500);

  const rows = (data as ServiceVerificationRow[] | null) ?? [];
  const profileIds = [...new Set(rows.map((r) => r.directory_profile_id))];
  const verificationIds = rows.map((r) => r.id);

  const [{ data: profiles }, { data: docs }] = await Promise.all([
    profileIds.length
      ? admin
          .from("directory_profiles")
          .select("id, firm_name, owner_name, city, category")
          .in("id", profileIds)
      : Promise.resolve({
          data: [] as Pick<
            DirectoryProfileRow,
            "id" | "firm_name" | "owner_name" | "city" | "category"
          >[],
        }),
    verificationIds.length
      ? admin
          .from("service_verification_documents")
          .select("*")
          .in("verification_id", verificationIds)
      : Promise.resolve({ data: [] as ServiceVerificationDocumentRow[] }),
  ]);

  const profileMap = new Map(
    (
      (profiles as
        | Pick<DirectoryProfileRow, "id" | "firm_name" | "owner_name" | "city" | "category">[]
        | null) ?? []
    ).map((p) => [p.id, p])
  );
  const docsByVerification = new Map<string, ServiceVerificationDocumentRow[]>();
  for (const d of (docs as ServiceVerificationDocumentRow[] | null) ?? []) {
    const list = docsByVerification.get(d.verification_id) ?? [];
    list.push(d);
    docsByVerification.set(d.verification_id, list);
  }

  return jsonOk({
    items: rows.map((row) => {
      const p = profileMap.get(row.directory_profile_id);
      return mapServiceVerificationRow(row, {
        documents: (docsByVerification.get(row.id) ?? []).map(mapServiceVerificationDocRow),
        firmName: p?.firm_name,
        ownerName: p?.owner_name,
        city: p?.city,
        category: p?.category,
      });
    }),
  });
}
