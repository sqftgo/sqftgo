/**
 * Production-safe ops helper:
 * - Confirms existing unconfirmed users (admin email_confirm)
 * - Ensures demo accounts exist with confirmed email (dev/staging only)
 *
 * Does NOT enable AUTH_DEV_AUTO_CONFIRM signup bypass.
 * Usage: node scripts/confirm-and-seed-auth.mjs
 */
import { readFileSync, existsSync } from "fs";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  if (!existsSync(".env.local")) {
    throw new Error("Missing .env.local");
  }
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

const DEMO = [
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

async function listAllUsers(admin) {
  const { data, error } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (error) throw new Error(error.message);
  return data.users ?? [];
}

async function ensureConfirmed(admin, account) {
  const users = await listAllUsers(admin);
  const existing = users.find(
    (u) => u.email?.toLowerCase() === account.email.toLowerCase()
  );

  let userId = existing?.id;
  if (!userId) {
    const { data, error } = await admin.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true,
      user_metadata: { name: account.name },
    });
    if (error || !data.user) {
      throw new Error(`create ${account.email}: ${error?.message ?? "unknown"}`);
    }
    userId = data.user.id;
    console.log(`created+confirmed ${account.email}`);
  } else {
    const { error } = await admin.auth.admin.updateUserById(userId, {
      password: account.password,
      email_confirm: true,
      user_metadata: { name: account.name },
    });
    if (error) throw new Error(`confirm ${account.email}: ${error.message}`);
    console.log(`confirmed ${account.email}`);
  }

  // Wait for profile trigger
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
    throw new Error(`profile missing for ${account.email}`);
  }
  if (profile.role !== account.role || profile.name !== account.name) {
    const { error } = await admin
      .from("profiles")
      .update({ role: account.role, name: account.name })
      .eq("id", userId);
    if (error) throw new Error(`role ${account.email}: ${error.message}`);
    console.log(`  role → ${account.role}`);
  }
}

async function confirmAllUnconfirmed(admin) {
  const users = await listAllUsers(admin);
  let n = 0;
  for (const u of users) {
    if (u.email_confirmed_at) continue;
    const { error } = await admin.auth.admin.updateUserById(u.id, {
      email_confirm: true,
    });
    if (error) {
      console.log(`skip unconfirmed user: ${error.message}`);
      continue;
    }
    n += 1;
  }
  console.log(`confirmed_unconfirmed_count=${n}`);
}

async function main() {
  const env = loadEnvLocal();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const service = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service || service.startsWith("your-")) {
    throw new Error("Real SUPABASE_SERVICE_ROLE_KEY required in .env.local");
  }

  const admin = createClient(url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // 1) Confirm any stuck signups (production-safe ops: confirm after identity known)
  await confirmAllUnconfirmed(admin);

  // 2) Ensure demo accounts for local QA (confirmed)
  for (const account of DEMO) {
    await ensureConfirmed(admin, account);
  }

  // 3) Verify password login for demo user via anon key
  const anon =
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const client = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.auth.signInWithPassword({
    email: "user@sqftgo.com",
    password: "user2026",
  });
  if (error || !data.session) {
    throw new Error(`verify login failed: ${error?.message ?? "no session"}`);
  }
  console.log("verify_login=PASS");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
