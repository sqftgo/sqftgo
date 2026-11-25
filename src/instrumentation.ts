export async function register() {
  // Reserved for future boot-time hooks.
}

export async function onRequestError(
  error: unknown,
  request: { path: string; method: string; headers: NodeJS.Dict<string | string[]> },
  context: { routeType: string; routePath: string },
) {
  const path = request.path || context.routePath || "";
  if (!path.includes("/api/")) return;
  // Only care about route handlers (our APIs), not RSC render noise.
  if (context.routeType && context.routeType !== "route") return;

  const { notifyApiFailure } = await import("@/lib/ops/api-alert");
  const message = error instanceof Error ? error.message : "Unhandled API error";
  const detail = error instanceof Error ? error.stack : String(error);

  notifyApiFailure({
    path,
    method: request.method,
    status: 500,
    message,
    detail,
    source: "uncaught",
  });
}
