import { GENERIC_SERVER_ERROR, toPublicErrorMessage } from "@/lib/api/public-error";
import { toast } from "@/lib/toast/store";

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly checkoutPath?: string;
  readonly resendAfterSeconds?: number;
  /** Set when apiClient (or handleClientError) already showed a toast. */
  toasted = false;

  constructor(
    message: string,
    status: number,
    extra?: { code?: string; checkoutPath?: string; resendAfterSeconds?: number },
  ) {
    super(toPublicErrorMessage(message, status));
    this.name = "ApiError";
    this.status = status;
    this.code = extra?.code;
    this.checkoutPath = extra?.checkoutPath;
    this.resendAfterSeconds = extra?.resendAfterSeconds;
  }
}

export type ApiClientOptions = RequestInit & {
  /** Abort after this many ms (default 30s). */
  timeoutMs?: number;
  /**
   * Show a top-right toast on failure (default true in the browser).
   * Set false for background polls / silent checks.
   */
  toast?: boolean;
};

function maybeToast(err: ApiError, enabled: boolean) {
  if (!enabled || typeof window === "undefined" || err.toasted) return;
  const tone =
    err.status >= 500 ? "danger" : err.status === 429 ? "warning" : "danger";
  toast.show({ title: err.message, tone });
  err.toasted = true;
}

/**
 * Shared BFF fetch wrapper — credentials, JSON, typed errors, optional timeout.
 * Failed requests toast a sanitized message by default (whole-app coverage).
 */
export async function apiClient<T>(
  input: RequestInfo | URL,
  init?: ApiClientOptions,
): Promise<T> {
  const { timeoutMs = 30_000, toast: toastOnError = true, ...rest } = init ?? {};
  const controller = new AbortController();
  const timer =
    timeoutMs > 0 ? setTimeout(() => controller.abort(), timeoutMs) : undefined;

  if (rest.signal) {
    const outer = rest.signal;
    if (outer.aborted) controller.abort();
    else {
      outer.addEventListener("abort", () => controller.abort(), { once: true });
    }
  }

  try {
    const res = await fetch(input, {
      ...rest,
      signal: controller.signal,
      credentials: rest.credentials ?? "same-origin",
      headers: {
        "Content-Type": "application/json",
        ...(rest.headers ?? {}),
      },
    });

    const data = (await res.json().catch(() => ({}))) as T & {
      error?: string;
      message?: string;
      code?: string;
      checkoutPath?: string;
      resendAfterSeconds?: number;
    };
    if (!res.ok) {
      const raw =
        typeof data === "object" && data
          ? data.error
            ? String(data.error)
            : typeof data.message === "string"
              ? data.message
              : null
          : null;
      const errMsg =
        res.status >= 500 ? GENERIC_SERVER_ERROR : raw || "Request failed";
      const err = new ApiError(errMsg, res.status, {
        code: typeof data?.code === "string" ? data.code : undefined,
        checkoutPath:
          typeof data?.checkoutPath === "string" ? data.checkoutPath : undefined,
        resendAfterSeconds:
          typeof data?.resendAfterSeconds === "number"
            ? data.resendAfterSeconds
            : undefined,
      });
      maybeToast(err, toastOnError);
      throw err;
    }
    return data as T;
  } catch (err) {
    if (err instanceof ApiError) {
      maybeToast(err, toastOnError);
      throw err;
    }
    if (err instanceof DOMException && err.name === "AbortError") {
      const timeoutErr = new ApiError("Request timed out", 408);
      maybeToast(timeoutErr, toastOnError);
      throw timeoutErr;
    }
    const networkErr = new ApiError(GENERIC_SERVER_ERROR, 500);
    maybeToast(networkErr, toastOnError);
    throw networkErr;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  limit: number;
  offset: number;
};

export function clampPageParams(
  limitRaw: string | null,
  offsetRaw: string | null,
  defaults: { limit: number; maxLimit: number },
): { limit: number; offset: number } {
  const limitParsed = Number(limitRaw);
  const offsetParsed = Number(offsetRaw);
  const limit = Number.isFinite(limitParsed)
    ? Math.min(Math.max(1, Math.floor(limitParsed)), defaults.maxLimit)
    : defaults.limit;
  const offset = Number.isFinite(offsetParsed)
    ? Math.max(0, Math.floor(offsetParsed))
    : 0;
  return { limit, offset };
}
