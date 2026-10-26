import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import {
  extForImageMime,
  isAllowedImageMime,
  verifyAllowedImageBytes,
} from "@/lib/security/image-magic";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import { mapLocationRow } from "@/lib/mappers/catalog";
import type { LocationRow } from "@/types/database";

export const runtime = "nodejs";

const BUCKET = "city-covers";
const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required to upload city covers.", 503);
  }

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (profile.status === "suspended" || profile.role !== "admin") {
    return jsonError("Forbidden", 403);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError("Expected multipart form data");
  }

  const file = form.get("file");
  if (!file || !(file instanceof File)) {
    return jsonError("file is required");
  }

  const locationId = String(form.get("locationId") ?? "").trim();
  if (!locationId) return jsonError("locationId is required");

  if (
    file.type &&
    file.type !== "application/octet-stream" &&
    !isAllowedImageMime(file.type)
  ) {
    return jsonError("Only JPEG, PNG, WebP, and GIF images are allowed");
  }
  if (file.size <= 0 || file.size > MAX_BYTES) {
    return jsonError("Image must be between 1 byte and 5MB");
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const checked = verifyAllowedImageBytes(bytes, file.type);
  if (!checked.ok) return jsonError(checked.error);

  const admin = createServiceClient();
  const { data: location, error: locError } = await admin
    .from("locations")
    .select("id, city")
    .eq("id", locationId)
    .maybeSingle();
  if (locError || !location) return jsonError("Location not found", 404);

  const slug = location.city
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const path = `${slug || locationId}/${crypto.randomUUID()}.${extForImageMime(checked.mime)}`;

  const { error: uploadError } = await admin.storage.from(BUCKET).upload(path, bytes, {
    contentType: checked.mime,
    upsert: false,
  });
  if (uploadError) return jsonError(uploadError.message, 500);

  const { data: publicData } = admin.storage.from(BUCKET).getPublicUrl(path);
  if (!publicData?.publicUrl) {
    return jsonError("Upload succeeded but public URL was not returned", 500);
  }

  const { data: updated, error: updateError } = await admin
    .from("locations")
    .update({ cover_image_url: publicData.publicUrl })
    .eq("id", locationId)
    .select("*")
    .single();

  if (updateError || !updated) {
    return jsonError(updateError?.message ?? "Upload saved but location update failed", 500);
  }

  return jsonOk(
    {
      url: publicData.publicUrl,
      path,
      location: mapLocationRow(updated as LocationRow, 0),
    },
    { status: 201 }
  );
}
