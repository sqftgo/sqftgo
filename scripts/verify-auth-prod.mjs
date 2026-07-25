import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const env = {};
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
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

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anon =
  env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = env.SUPABASE_SERVICE_ROLE_KEY;

const results = {
  service: "FAIL",
  users: 0,
  profiles: 0,
  loginDemo: null,
  signupProdStyle: null,
  emails: [],
};

if (!service || service.startsWith("your-")) {
  results.service = "PLACEHOLDER";
  console.log(JSON.stringify(results));
  process.exit(0);
}

const admin = createClient(url, service, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const anonClient = createClient(url, anon, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data, error } = await admin.auth.admin.listUsers({
  page: 1,
  perPage: 200,
});
if (error) {
  results.service = "FAIL:" + error.message;
} else {
  results.service = "PASS";
  results.users = data.users?.length ?? 0;
  results.confirmed = (data.users ?? []).filter((u) => !!u.email_confirmed_at)
    .length;
  results.unconfirmed = results.users - results.confirmed;
}

const { count, error: pErr } = await admin
  .from("profiles")
  .select("id", { count: "exact", head: true });
results.profiles = pErr ? "ERR:" + pErr.message : count ?? 0;

{
  const { data: d, error: e } = await anonClient.auth.signInWithPassword({
    email: "user@sqftgo.com",
    password: "user2026",
  });
  results.loginDemo = e
    ? { ok: false, msg: e.message }
    : { ok: true, hasSession: !!d.session };
}

const testEmail = `verify_${Date.now()}@example.com`;
{
  const { data: d, error: e } = await anonClient.auth.signUp({
    email: testEmail,
    password: "TestPass2026!",
    options: {
      data: { name: "Verify User" },
      emailRedirectTo: "http://localhost:3000/auth/callback?next=/",
    },
  });
  results.signupProdStyle = e
    ? { ok: false, msg: e.message }
    : {
        ok: true,
        hasSession: !!d.session,
        needsConfirm: !d.session && !!d.user,
        email: testEmail,
      };
}

console.log(JSON.stringify(results, null, 2));
