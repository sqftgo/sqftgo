export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly checkoutPath?: string;

  constructor(
    message: string,
    status: number,
    extra?: { code?: string; checkoutPath?: string }
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = extra?.code;
    this.checkoutPath = extra?.checkoutPath;
  }
}

export type ApiClientOptions = RequestInit & {
  /** Abort after this many ms (default 30s). */
  timeoutMs?: number;
};

/**
 * Shared BFF fetch wrapper ΓÇö credentials, JSON, typed errors, optional timeout.
 * Used by all `src/services/*` clients.
 */
export async function apiClient<T>(
  input: RequestInfo | URL,
  init?: ApiClientOptions
): Promise<T> {
  const { timeoutMs = 30_000, ...rest } = init ?? {};
  const controller = new AbortController();
  const timer =
    timeoutMs > 0
      ? setTimeout(() => controller.abort(), timeoutMs)
      : undefined;

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
      code?: string;
      checkoutPath?: string;
    };
    if (!res.ok) {
      throw new ApiError(
        typeof data === "object" && data && "error" in data && data.error
          ? String(data.error)
          : "Request failed",
        res.status,
        {
          code: typeof data?.code === "string" ? data.code : undefined,
          checkoutPath:
            typeof data?.checkoutPath === "string" ? data.checkoutPath : undefined,
        }
      );
    }
    return data as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError("Request timed out", 408);
    }
    throw err;
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
  defaults: { limit: number; maxLimit: number }
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
