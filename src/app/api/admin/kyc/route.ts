import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { canAccessAdminRoutes } from "@/lib/authz";
import { mapDealerKyc } from "@/lib/mappers/kyc";
import { createServiceClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import type { DealerKycDocumentRow, DealerKycRow, ProfileRow } from "@/types/database";

async function db() {
  return hasServiceRoleKey() ? createServiceClient() : await createClient();
}

export async function GET(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (!canAccessAdminRoutes(profile)) return jsonError("Forbidden", 403);

  const status = request.nextUrl.searchParams.get("status");
  const supabase = await db();

  let query = supabase
    .from("dealer_kyc")
    .select("*")
    .order("submitted_at", { ascending: false, nullsFirst: false });

  if (
    status === "draft" ||
    status === "pending" ||
    status === "approved" ||
    status === "rejected"
  ) {
    query = query.eq("status", status);
  }

  const { data, error: qErr } = await query.limit(100);
  if (qErr) return jsonError(qErr.message, 500);

  const rows = (data ?? []) as DealerKycRow[];
  const userIds = [...new Set(rows.map((r) => r.user_id))];
  const kycIds = rows.map((r) => r.id);

  const [{ data: profiles }, { data: docs }] = await Promise.all([
    userIds.length
      ? supabase.from("profiles").select("id, email, name").in("id", userIds)
      : Promise.resolve({ data: [] as Pick<ProfileRow, "id" | "email" | "name">[] }),
    kycIds.length
      ? supabase.from("dealer_kyc_documents").select("*").in("kyc_id", kycIds)
      : Promise.resolve({ data: [] as DealerKycDocumentRow[] }),
  ]);

  const profileById = new Map(
    ((profiles ?? []) as Pick<ProfileRow, "id" | "email" | "name">[]).map((p) => [
      p.id,
      p,
    ])
  );
  const docsByKyc = new Map<string, DealerKycDocumentRow[]>();
  for (const d of (docs ?? []) as DealerKycDocumentRow[]) {
    const list = docsByKyc.get(d.kyc_id) ?? [];
    list.push(d);
    docsByKyc.set(d.kyc_id, list);
  }

  return jsonOk({
    items: rows.map((row) => {
      const p = profileById.get(row.user_id);
      return mapDealerKyc(row, docsByKyc.get(row.id) ?? [], {
        userEmail: p?.email,
        userName: p?.name,
      });
    }),
  });
}
