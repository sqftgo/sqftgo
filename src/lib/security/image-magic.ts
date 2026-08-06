/**
 * Verify image uploads by file magic bytes (not client-declared MIME).
 * Prevents spoofed Content-Type / polyglot uploads past a MIME allowlist alone.
 */

export const ALLOWED_IMAGE_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export type AllowedImageMime = (typeof ALLOWED_IMAGE_MIMES)[number];

const ALLOWED_SET = new Set<string>(ALLOWED_IMAGE_MIMES);

export function isAllowedImageMime(value: string): value is AllowedImageMime {
  return ALLOWED_SET.has(value);
}

export function extForImageMime(mime: AllowedImageMime): string {
  switch (mime) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "jpg";
  }
}

function startsWith(bytes: Uint8Array, sig: number[]): boolean {
  if (bytes.length < sig.length) return false;
  for (let i = 0; i < sig.length; i++) {
    if (bytes[i] !== sig[i]) return false;
  }
  return true;
}

/**
 * Detect JPEG / PNG / WebP / GIF from leading bytes.
 * Returns null when the payload is not a recognized allowed image.
 */
export function detectAllowedImageMime(
  bytes: Uint8Array
): AllowedImageMime | null {
  if (bytes.length < 12) return null;

  // JPEG: FF D8 FF
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return "image/jpeg";

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  ) {
    return "image/png";
  }

  // GIF87a / GIF89a
  if (
    startsWith(bytes, [0x47, 0x49, 0x46, 0x38, 0x37, 0x61]) ||
    startsWith(bytes, [0x47, 0x49, 0x46, 0x38, 0x39, 0x61])
  ) {
    return "image/gif";
  }

  // WebP: RIFF....WEBP
  if (
    startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }

  return null;
}

export type ImageMagicCheckResult =
  | { ok: true; mime: AllowedImageMime }
  | { ok: false; error: string };

/**
 * Validate bytes (and optional client Content-Type) for an allowed image.
 * Storage path + contentType must use the returned `mime`, never the client claim alone.
 */
export function verifyAllowedImageBytes(
  bytes: Uint8Array,
  claimedMime?: string | null
): ImageMagicCheckResult {
  const detected = detectAllowedImageMime(bytes);
  if (!detected) {
    return {
      ok: false,
      error: "File content is not a valid JPEG, PNG, WebP, or GIF image",
    };
  }

  const claimed = claimedMime?.trim().toLowerCase() ?? "";
  if (
    claimed &&
    claimed !== "application/octet-stream" &&
    isAllowedImageMime(claimed) &&
    claimed !== detected
  ) {
    return {
      ok: false,
      error: "Declared image type does not match file content",
    };
  }

  return { ok: true, mime: detected };
}
