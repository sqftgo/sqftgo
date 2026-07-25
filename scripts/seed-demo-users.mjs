/**
 * Seed demo auth users on the linked Supabase project (remote or local).
 * Uses SUPABASE_SERVICE_ROLE_KEY from .env.local — never commit that file.
 *
 * Usage: node scripts/seed-demo-users.mjs
 */
import { readFileSync, existsSync } from "fs";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  const path = ".env.local";
  if (!existsSync(path)) {
    throw new Error("Missing .env.local — copy from .env.example and fill keys.");
  }
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i === -1) continue;
    env[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return env;
}

const DEMO_USERS = [
  {
    email: "admin@sqftgo.com",
    password: "admin2026",
    name: "Super Admin",
    role: "admin",
  },
  {
    email: "broker@sqftgo.com",
    password: "broker2026",
    name: "Rajesh Mehta",
    role: "broker",
  },
  {
    email: "user@sqftgo.com",
    password: "user2026",
    name: "Arjun Sharma",
    role: "user",
  },
];

async function findUserByEmail(admin, email) {
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (error) throw new Error(`listUsers failed: ${error.message}`);
  return data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase()) ?? null;
}

async function ensureUser(admin, account) {
  const existing = await findUserByEmail(admin, account.email);
  let userId = existing?.id;

  if (!userId) {
    const { data, error } = await admin.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true,
      user_metadata: { name: account.name },
    });
    if (error || !data.user) {
      throw new Error(`createUser(${account.email}): ${error?.message ?? "unknown"}`);
    }
    userId = data.user.id;
    console.log(`created ${account.email}`);
  } else {
    const { error } = await admin.auth.admin.updateUserById(userId, {
      password: account.password,
      email_confirm: true,
      user_metadata: { name: account.name },
    });
    if (error) {
      throw new Error(`updateUser(${account.email}): ${error.message}`);
    }
    console.log(`updated ${account.email}`);
  }

  let profile = null;
  for (let i = 0; i < 10; i++) {
    const { data } = await admin
      .from("profiles")
      .select("id, role, name")
      .eq("id", userId)
      .maybeSingle();
    if (data) {
      profile = data;
      break;
    }
    await new Promise((r) => setTimeout(r, 200));
  }

  if (!profile) {
    throw new Error(
      `Profile missing for ${account.email}. Push the profiles migration (supabase db push), then re-run.`
    );
  }

  if (profile.role !== account.role || profile.name !== account.name) {
    const { error } = await admin
      .from("profiles")
      .update({ role: account.role, name: account.name })
      .eq("id", userId);
    if (error) {
      throw new Error(`profile update(${account.email}): ${error.message}`);
    }
    console.log(`  role → ${account.role}`);
  }
}

async function main() {
  const env = loadEnvLocal();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey || serviceKey.startsWith("your-")) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env.local"
    );
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  for (const account of DEMO_USERS) {
    await ensureUser(admin, account);
  }

  console.log("Done. Demo logins:");
  console.log("  user@sqftgo.com / user2026");
  console.log("  broker@sqftgo.com / broker2026");
  console.log("  admin@sqftgo.com / admin2026 (not shown on login UI)");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
