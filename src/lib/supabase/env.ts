/**
 * Public client key: prefer the new publishable key, fall back to legacy anon key.
 * Never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
 */
export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableOrAnon =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !publishableOrAnon) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY). Copy .env.example to .env.local and fill in your project values."
    );
  }

  return { url, anonKey: publishableOrAnon };
}

export function hasSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}

export function hasServiceRoleKey(): boolean {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Boolean(key && !key.startsWith("your-"));
}

export function getServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key || key.startsWith("your-")) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. Add the service_role secret from the Supabase dashboard (server-only)."
    );
  }
  return key;
}
