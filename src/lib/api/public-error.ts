/** Safe copy for unexpected server failures — never include DB/provider text. */
export const GENERIC_SERVER_ERROR =
  "Something went wrong. Please try again.";

const GENERIC_BY_STATUS: Record<number, string> = {
  401: "Please sign in to continue.",
  403: "You don't have permission to do that.",
  404: "We couldn't find that.",
  408: "Request timed out. Please try again.",
  409: "That conflicted with existing data. Please try again.",
  429: "Too many attempts. Please wait a moment and try again.",
  502: "A payment or upstream service failed. Please try again.",
  503: "Service temporarily unavailable. Please try again shortly.",
};

/** Heuristic: Supabase / Postgres / stack dumps that must never reach the UI. */
export function looksLikeInternalError(message: string): boolean {
  const m = message.trim();
  if (!m) return true;
  if (m.length > 220) return true;
  return /PGRST|Postgrest|postgres|SQLSTATE|violates\s+(unique|foreign|check|not-null)|permission denied|row-level security|RLS|relation ['"]?\w+|column ['"]?\w+|duplicate key|jwt|stack trace|ECONNREFUSED|ENOTFOUND|ETIMEDOUT|supabase\.co|razorpay\.com|at\s+\S+\s+\(|node_modules|TypeError:|ReferenceError:/i.test(
    m,
  );
}

/**
 * Map any handler message to a user-safe string.
 * 5xx always generic. 4xx keep intentional UX copy unless they look internal.
 */
export function toPublicErrorMessage(message: string, status = 400): string {
  if (status >= 500) {
    return GENERIC_BY_STATUS[status] || GENERIC_SERVER_ERROR;
  }
  if (looksLikeInternalError(message)) {
    return GENERIC_BY_STATUS[status] || "Unable to complete that request.";
  }
  return message.trim() || GENERIC_BY_STATUS[status] || "Unable to complete that request.";
}
