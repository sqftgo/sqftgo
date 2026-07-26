/**
 * Seed/enrich dealer demo fixtures for broker@sqftgo.com E2E verification.
 * Idempotent: skips rows that already look like demo fixtures.
 *
 * Usage: node scripts/seed-dealer-demo.mjs
 * Requires: .env.local with NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 * Prefer running after: pnpm seed:demo-users
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

function loadEnvLocal() {
  for (const path of [".env.local", "src/.env", ".env"]) {
    if (!existsSync(path)) continue;
    const env = {};
    for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
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
    if (env.NEXT_PUBLIC_SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) return env;
  }
  throw new Error("Missing Supabase env in .env.local");
}

const env = loadEnvLocal();
const BASE = env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "");
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;

const DEMO_MARKER = "[demo-seed]";

async function rest(method, path, body, extraHeaders = {}) {
  const res = await fetch(`${BASE}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
      Prefer: method === "POST" ? "return=representation" : "return=representation",
      ...extraHeaders,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    throw new Error(`${method} ${path}: ${res.status} ${JSON.stringify(data)}`);
  }
  return data;
}

async function getProfile(email) {
  const rows = await rest(
    "GET",
    `profiles?email=eq.${encodeURIComponent(email)}&select=id,email,name,role`
  );
  if (!rows?.[0]) throw new Error(`Profile not found for ${email}`);
  return rows[0];
}

async function ensureDirectory(broker) {
  const existing = await rest(
    "GET",
    `directory_profiles?user_id=eq.${broker.id}&select=*`
  );
  if (existing?.length) {
    console.log("directory_profiles: already linked");
    return existing[0];
  }
  const byEmail = await rest(
    "GET",
    `directory_profiles?email=eq.${encodeURIComponent(broker.email)}&select=*`
  );
  if (byEmail?.[0]) {
    const updated = await rest(
      "PATCH",
      `directory_profiles?id=eq.${byEmail[0].id}`,
      { user_id: broker.id }
    );
    console.log("directory_profiles: linked existing row to broker");
    return updated?.[0] ?? byEmail[0];
  }
  const created = await rest("POST", "directory_profiles", {
    user_id: broker.id,
    firm_name: "Lake City Brokerage",
    owner_name: broker.name || "Rajesh Mehta",
    category: "Agent & Broker",
    city: "Udaipur",
    address: "Fateh Sagar Road, Udaipur",
    email: broker.email,
    website: "https://sqftgo.com",
    mobile: "+91 98765 43210",
    description: `${DEMO_MARKER} Full-service brokerage for Udaipur & Jaipur listings.`,
    rera_id: "RAJ/RERA/DEMO/001",
    experience: "12 years",
    specialties: ["Luxury villas", "Lake-facing homes", "Commercial"],
    team_size: 6,
    listings_count: 0,
  });
  console.log("directory_profiles: created");
  return created[0];
}

async function ensurePendingListing(broker) {
  const title = `${DEMO_MARKER} Pending Lake Cottage`;
  const existing = await rest(
    "GET",
    `properties?owner_id=eq.${broker.id}&title=eq.${encodeURIComponent(title)}&select=id,title,status`
  );
  if (existing?.length) {
    console.log("properties: pending demo listing exists");
    return existing[0];
  }
  const created = await rest("POST", "properties", {
    owner_id: broker.id,
    title,
    price: 7800000,
    type: "Villa",
    purpose: "sell",
    bhk: 3,
    bathrooms: 3,
    parking: 2,
    year_built: 2022,
    city: "Udaipur",
    state: "Rajasthan",
    country: "India",
    locality: "Badi Lake",
    size: 2800,
    furnished: "Semi-Furnished",
    description:
      "Demo pending-review listing for dealer E2E — waiting on admin approval.",
    amenities: ["Lake View", "Parking", "Garden"],
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200",
    ],
    owner_name: broker.name || "Rajesh Mehta",
    owner_phone: "+91 98765 43210",
    owner_email: broker.email,
    status: "pending_review",
    featured: false,
    rera_approved: false,
  });
  console.log("properties: created pending demo listing");
  return created[0];
}

async function pickActiveProperty(broker) {
  const rows = await rest(
    "GET",
    `properties?owner_id=eq.${broker.id}&status=eq.active&select=id,title&order=created_at.desc&limit=1`
  );
  if (!rows?.[0]) throw new Error("No active broker property — seed properties first");
  return rows[0];
}

async function ensureInquiry(property, buyer) {
  const message = `${DEMO_MARKER} Interested in a weekend site visit and price negotiation.`;
  const existing = await rest(
    "GET",
    `property_inquiries?property_id=eq.${property.id}&message=eq.${encodeURIComponent(message)}&select=id`
  );
  if (existing?.length) {
    console.log("property_inquiries: demo inquiry exists");
    return existing[0];
  }
  const created = await rest("POST", "property_inquiries", {
    property_id: property.id,
    name: buyer.name || "Arjun Sharma",
    email: buyer.email,
    phone: "+91 90000 11111",
    message,
    status: "new",
  });
  console.log("property_inquiries: created demo inquiry");
  return created[0];
}

async function ensureVisit(property, buyer, status, dayOffset) {
  const notes = `${DEMO_MARKER} ${status} visit`;
  const existing = await rest(
    "GET",
    `site_visits?property_id=eq.${property.id}&notes=eq.${encodeURIComponent(notes)}&select=id,status`
  );
  if (existing?.length) {
    console.log(`site_visits: ${status} demo visit exists`);
    return existing[0];
  }
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + dayOffset);
  const scheduled_date = d.toISOString().slice(0, 10);
  const created = await rest("POST", "site_visits", {
    property_id: property.id,
    user_id: buyer.id,
    visitor_name: buyer.name || "Arjun Sharma",
    visitor_email: buyer.email,
    visitor_phone: "+91 90000 11111",
    scheduled_date,
    scheduled_time: status === "pending" ? "11:00" : "16:30",
    status,
    notes,
  });
  console.log(`site_visits: created ${status} demo visit`);
  return created[0];
}

async function ensureKyc(broker, directory) {
  const existing = await rest(
    "GET",
    `dealer_kyc?user_id=eq.${broker.id}&select=*`
  );
  if (existing?.length) {
    console.log("dealer_kyc: already present");
    return existing[0];
  }
  const created = await rest("POST", "dealer_kyc", {
    user_id: broker.id,
    directory_profile_id: directory?.id ?? null,
    pan_number: "ABCDE1234F",
    aadhaar_last4: "4321",
    status: "draft",
    dealer_notes: `${DEMO_MARKER} Draft KYC for dealer profile verification E2E.`,
  });
  console.log("dealer_kyc: created draft");
  return created[0];
}

async function ensureNotifications(broker) {
  const title = `${DEMO_MARKER} New buyer inquiry`;
  const existing = await rest(
    "GET",
    `notifications?user_id=eq.${broker.id}&title=eq.${encodeURIComponent(title)}&select=id`
  );
  if (existing?.length) {
    console.log("notifications: demo alerts exist");
    return;
  }
  await rest("POST", "notifications", [
    {
      user_id: broker.id,
      for_role: "broker",
      title,
      message: "Arjun Sharma inquired about your active listing. Open Communications to reply.",
      type: "info",
      read: false,
      event_key: "demo.inquiry",
      entity_type: "property_inquiry",
    },
    {
      user_id: broker.id,
      for_role: "broker",
      title: `${DEMO_MARKER} Site visit pending approval`,
      message: "A buyer requested a tour — confirm or reschedule from your dashboard.",
      type: "warning",
      read: false,
      event_key: "demo.visit",
      entity_type: "site_visit",
    },
  ]);
  console.log("notifications: created 2 demo alerts");
}

async function main() {
  const broker = await getProfile("broker@sqftgo.com");
  const buyer = await getProfile("user@sqftgo.com");
  if (broker.role !== "broker") {
    throw new Error(`broker@sqftgo.com role is ${broker.role}, expected broker`);
  }

  const directory = await ensureDirectory(broker);
  await ensurePendingListing(broker);
  const active = await pickActiveProperty(broker);
  await ensureInquiry(active, buyer);
  await ensureVisit(active, buyer, "pending", 2);
  await ensureVisit(active, buyer, "confirmed", 5);
  await ensureKyc(broker, directory);
  await ensureNotifications(broker);

  console.log("\nDealer demo fixtures ready.");
  console.log("Verify as broker@sqftgo.com / broker2026:");
  console.log("  /dealer/dashboard");
  console.log("  /dealer/dashboard/inquiries  (reply should open a message thread)");
  console.log("  /dealer/dashboard/notifications");
  console.log("  /dealer/dashboard/profile    (KYC draft)");
  console.log("  /dealer/dashboard/properties (includes pending demo listing)");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
