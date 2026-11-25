import { ApiError } from "@/lib/api/client";
import {
  GENERIC_SERVER_ERROR,
  toPublicErrorMessage,
} from "@/lib/api/public-error";
import { toast, type ToastTone } from "@/lib/toast/store";

export type HandleClientErrorOptions = {
  /** Fallback when error has no usable message */
  fallback?: string;
  /** Optional toast title override (defaults to sanitized message) */
  title?: string;
  tone?: ToastTone;
  /** Override HTTP-ish status used for sanitizing (default from ApiError or 400 for strings) */
  status?: number;
  silent?: boolean;
};

/**
 * Central client error handler: sanitize → toast (top-right).
 * Use for catch blocks instead of setState(err.message) / ad-hoc banners.
 */
export function handleClientError(
  err: unknown,
  options: HandleClientErrorOptions = {},
): string {
  const status =
    options.status ??
    (err instanceof ApiError ? err.status : typeof err === "string" ? 400 : 500);
  const raw =
    err instanceof Error
      ? err.message
      : typeof err === "string"
        ? err
        : options.fallback || GENERIC_SERVER_ERROR;

  const message = toPublicErrorMessage(
    raw || options.fallback || GENERIC_SERVER_ERROR,
    status,
  );

  const alreadyToasted = err instanceof ApiError && err.toasted;
  if (!options.silent && !alreadyToasted) {
    toast.show({
      title: options.title || message,
      description: options.title ? message : undefined,
      tone:
        options.tone ??
        (status >= 500 ? "danger" : status === 429 ? "warning" : "danger"),
    });
    if (err instanceof ApiError) err.toasted = true;
  }

  return message;
}

/** Convenience: success toast from one place. */
export function notifySuccess(title: string, description?: string) {
  toast.success(title, description);
}

export function notifyInfo(title: string, description?: string) {
  toast.info(title, description);
}

export function notifyWarning(title: string, description?: string) {
  toast.warning(title, description);
}
