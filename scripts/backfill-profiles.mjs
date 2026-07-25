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
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
if (error) throw new Error(error.message);

let created = 0;
for (const u of data.users ?? []) {
  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("id", u.id)
    .maybeSingle();
  if (profile) continue;
  const name =
    u.user_metadata?.name ||
    (u.email ? u.email.split("@")[0] : "user");
  const { error: insErr } = await admin.from("profiles").insert({
    id: u.id,
    email: u.email ?? "",
    name,
    role: "user",
  });
  if (insErr) {
    console.log(`profile_backfill_fail: ${insErr.message}`);
  } else {
    created += 1;
  }
}
console.log(`profiles_backfilled=${created}`);

const { count } = await admin.from("profiles").select("id", { count: "exact", head: true });
console.log(`profiles_total=${count}`);
