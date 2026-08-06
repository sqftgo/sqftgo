import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import {
  extForImageMime,
  isAllowedImageMime,
  verifyAllowedImageBytes,
} from "@/lib/security/image-magic";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";

export const runtime = "nodejs";

const BUCKET = "dream-inspiration";
const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError(
      "SUPABASE_SERVICE_ROLE_KEY is required to upload inspiration images.",
      503
    );
  }

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (profile.status === "suspended") return jsonError("Forbidden", 403);

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

  const path = `${user.id}/${crypto.randomUUID()}.${extForImageMime(checked.mime)}`;

  const admin = createServiceClient();
  const { error: uploadError } = await admin.storage.from(BUCKET).upload(path, bytes, {
    contentType: checked.mime,
    upsert: false,
  });

  if (uploadError) {
    return jsonError(uploadError.message, 500);
  }

  const { data } = admin.storage.from(BUCKET).getPublicUrl(path);
  if (!data?.publicUrl) {
    return jsonError("Upload succeeded but public URL was not returned", 500);
  }

  return jsonOk({ url: data.publicUrl, path }, { status: 201 });
}
