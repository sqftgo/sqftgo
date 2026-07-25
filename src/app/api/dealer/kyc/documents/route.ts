import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { canAccessDealerDashboard } from "@/lib/authz";
import { mapKycDocument } from "@/lib/mappers/kyc";
import { kycDocTypeSchema } from "@/lib/validation/kyc";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import type { DealerKycDocumentRow, DealerKycRow } from "@/types/database";

export const runtime = "nodejs";

const BUCKET = "dealer-kyc";
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

export async function POST(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required for KYC uploads.", 503);
  }

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (!canAccessDealerDashboard(profile)) return jsonError("Forbidden", 403);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError("Expected multipart form data");
  }

  const file = form.get("file");
  const docTypeRaw = String(form.get("docType") ?? "other");
  const docTypeParsed = kycDocTypeSchema.safeParse(docTypeRaw);
  if (!docTypeParsed.success) return jsonError("Invalid document type");
  if (!(file instanceof File)) return jsonError("file is required");
  if (!ALLOWED.has(file.type)) return jsonError("Unsupported file type");
  if (file.size > MAX_BYTES) return jsonError("File too large (max 5MB)");

  const supabase = createServiceClient();
  const { data: kyc, error: kycErr } = await supabase
    .from("dealer_kyc")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (kycErr) return jsonError(kycErr.message, 500);
  if (!kyc) return jsonError("Save KYC draft before uploading documents", 400);

  const row = kyc as DealerKycRow;
  if (row.status === "approved" || row.status === "pending") {
    return jsonError("Cannot upload while KYC is pending or approved", 400);
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
  const path = `${user.id}/${row.id}/${crypto.randomUUID()}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  });
  if (upErr) return jsonError(upErr.message, 500);

  const { data: doc, error: docErr } = await supabase
    .from("dealer_kyc_documents")
    .insert({
      kyc_id: row.id,
      doc_type: docTypeParsed.data,
      storage_path: path,
      file_name: file.name,
    })
    .select("*")
    .maybeSingle();

  if (docErr) return jsonError(docErr.message, 500);
  return jsonOk(mapKycDocument(doc as DealerKycDocumentRow));
}
