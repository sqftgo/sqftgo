import { readFileSync } from "fs";

/**
 * Lightweight auth probe that avoids @supabase/supabase-js Realtime
 * (breaks on Node < 22 without a WebSocket polyfill).
 */

function loadEnvFile(path) {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return "";
  }
}

function loadEnv() {
  const env = {};
  const raw = loadEnvFile(".env.local") || loadEnvFile(".env");
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i === -1) continue;
    let v = line.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    env[line.slice(0, i).trim()] = v;
  }
  return env;
}

async function authFetch(url, key, path, init = {}) {
  const res = await fetch(`${url}${path}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  return { ok: res.ok, status: res.status, json };
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const anon =
  env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = env.SUPABASE_SERVICE_ROLE_KEY;

const results = {
  service: "FAIL",
  users: 0,
  profiles: 0,
  confirmed: 0,
  unconfirmed: 0,
  loginDemo: null,
  signupProdStyle: null,
};

if (!url || !anon) {
  results.service = "MISSING_PUBLIC_ENV";
  console.log(JSON.stringify(results, null, 2));
  process.exit(1);
}

if (!service || service.startsWith("your-")) {
  results.service = "PLACEHOLDER";
  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
}

{
  const listed = await authFetch(
    url,
    service,
    "/auth/v1/admin/users?page=1&per_page=200"
  );
  if (!listed.ok) {
    results.service = "FAIL:" + (listed.json?.msg || listed.json?.message || listed.status);
  } else {
    results.service = "PASS";
    const users = listed.json?.users ?? [];
    results.users = users.length;
    results.confirmed = users.filter((u) => !!u.email_confirmed_at).length;
    results.unconfirmed = results.users - results.confirmed;
  }
}

{
  const profiles = await authFetch(
    url,
    service,
    "/rest/v1/profiles?select=id",
    { headers: { Prefer: "count=exact", Range: "0-0" } }
  );
  // PostgREST returns count in Content-Range; fall back to array length.
  if (Array.isArray(profiles.json)) {
    results.profiles = profiles.json.length;
  } else if (profiles.ok) {
    results.profiles = "OK";
  } else {
    results.profiles = "ERR:" + profiles.status;
  }

  const counted = await authFetch(
    url,
    service,
    "/rest/v1/profiles?select=id",
    { headers: { Prefer: "count=exact", Range: "0-0" } }
  );
  // Re-fetch with head-style via Prefer return=minimal isn't available here;
  // use admin list size cross-check from users when needed.
  if (Array.isArray(counted.json)) {
    // With Range 0-0, body may be 1 row; get exact via RPC-less second query.
  }
}

{
  const allProfiles = await authFetch(
    url,
    service,
    "/rest/v1/profiles?select=id,role,status"
  );
  if (Array.isArray(allProfiles.json)) {
    results.profiles = allProfiles.json.length;
  }
}

{
  const login = await authFetch(url, anon, "/auth/v1/token?grant_type=password", {
    method: "POST",
    body: JSON.stringify({
      email: "user@sqftgo.com",
      password: "user2026",
    }),
  });
  results.loginDemo = login.ok
    ? { ok: true, hasSession: !!login.json?.access_token }
    : { ok: false, msg: login.json?.error_description || login.json?.msg || String(login.status) };
}

{
  // Use a domain Supabase accepts (example.com is rejected as invalid).
  const testEmail = `verify_${Date.now()}@sqftgo.com`;
  const signup = await authFetch(url, anon, "/auth/v1/signup", {
    method: "POST",
    body: JSON.stringify({
      email: testEmail,
      password: "TestPass2026!",
      data: { name: "Verify User" },
      gotrue_meta_security: {},
    }),
  });
  results.signupProdStyle = signup.ok
    ? {
        ok: true,
        hasSession: !!signup.json?.access_token,
        needsConfirm: !signup.json?.access_token && !!signup.json?.id,
        email: testEmail,
      }
    : {
        ok: false,
        msg: signup.json?.error_description || signup.json?.msg || String(signup.status),
        email: testEmail,
      };
}

console.log(JSON.stringify(results, null, 2));
