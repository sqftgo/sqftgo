/**
 * Clean test listings + seed realistic catalog for home page demos.
 *
 * - Deletes titles matching Testing-* / [demo-seed]
 * - Upserts featured sale/rent/plot listings for broker@sqftgo.com
 * - Adds two Builder & Developer directory profiles
 *
 * Usage: node scripts/seed-home-catalog.mjs
 */
import { readFileSync, existsSync } from "fs";

function loadEnv() {
  for (const path of [".env.local", ".env"]) {
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
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
}

const env = loadEnv();
const BASE = env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "");
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;

async function rest(method, path, body, extraHeaders = {}) {
  const res = await fetch(`${BASE}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
      Prefer:
        method === "POST" || method === "PATCH"
          ? "return=representation"
          : "return=minimal",
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

const NEW_LISTINGS = [
  {
    title: "Aravali Ridge Premium Apartments",
    price: 12500000,
    type: "Apartment",
    purpose: "sell",
    bhk: 3,
    bathrooms: 3,
    parking: 2,
    year_built: 2023,
    city: "Jaipur",
    state: "Rajasthan",
    country: "India",
    locality: "Malviya Nagar",
    size: 1850,
    furnished: "Semi-Furnished",
    description:
      "Corner 3BHK with Aravali views, clubhouse access, and covered parking in a gated Malviya Nagar community.",
    amenities: ["Gym", "Security", "Power Backup", "Clubhouse", "Lift"],
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200",
    ],
    featured: true,
    rera_approved: true,
  },
  {
    title: "Mehrangarh View Heritage Villa",
    price: 27800000,
    type: "Villa",
    purpose: "sell",
    bhk: 5,
    bathrooms: 5,
    parking: 3,
    year_built: 2019,
    city: "Jodhpur",
    state: "Rajasthan",
    country: "India",
    locality: "Mehrangarh Road",
    size: 5200,
    furnished: "Furnished",
    description:
      "Sandstone villa with private courtyard, rooftop sit-out facing Mehrangarh Fort, and landscaped gardens.",
    amenities: ["Garden", "Parking", "Security", "Terrace", "Modular Kitchen"],
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200",
    ],
    featured: true,
    rera_approved: true,
  },
  {
    title: "Pichola Edge Serviced Apartment",
    price: 85000,
    type: "Apartment",
    purpose: "rent",
    bhk: 2,
    bathrooms: 2,
    parking: 1,
    year_built: 2022,
    city: "Udaipur",
    state: "Rajasthan",
    country: "India",
    locality: "Lake Pichola",
    size: 1180,
    furnished: "Furnished",
    description:
      "Fully furnished 2BHK steps from the lake belt — ideal for professionals relocating to Udaipur.",
    amenities: ["Wi-Fi", "AC Rooms", "Parking", "Security", "Lift"],
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200",
    ],
    featured: true,
    rera_approved: false,
  },
  {
    title: "NH-48 Industrial Plot — Sitapura",
    price: 9800000,
    type: "Industrial Plot",
    purpose: "sell",
    bhk: null,
    bathrooms: 0,
    parking: 0,
    year_built: 2016,
    city: "Jaipur",
    state: "Rajasthan",
    country: "India",
    locality: "Sitapura Industrial Area",
    size: 4500,
    furnished: "Unfurnished",
    description:
      "Clear-title industrial plot with road frontage near NH-48 — suitable for warehouse or light manufacturing.",
    amenities: ["Boundary Wall", "Main Road", "Electricity"],
    images: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200",
    ],
    featured: true,
    rera_approved: true,
  },
];

const NEW_BUILDERS = [
  {
    firm_name: "Mewar Lakefront Developers",
    owner_name: "Vikram Singh Chouhan",
    category: "Builder & Developer",
    city: "Udaipur",
    address: "Hiran Magri Sector 11, Udaipur",
    email: "projects@mewarlakefront.example",
    website: "https://sqftgo.com",
    mobile: "+91 98290 11442",
    description:
      "RERA-registered developer delivering lake-facing residences and boutique townships across Udaipur.",
    rera_id: "RAJ/AAJ/2022/UDPR/118",
    experience: "15 years",
    specialties: ["Lake-facing homes", "Gated communities", "Luxury villas"],
    team_size: 42,
    listings_count: 0,
  },
  {
    firm_name: "Pink City Skyline Projects",
    owner_name: "Neha Agarwal",
    category: "Builder & Developer",
    city: "Jaipur",
    address: "Tonk Road, Jaipur",
    email: "hello@pinkcityskyline.example",
    website: "https://sqftgo.com",
    mobile: "+91 94140 22881",
    description:
      "Mid-rise and high-rise residential projects in Jaipur with clubhouse amenities and strong after-sales support.",
    rera_id: "RAJ/AAJ/2021/JPUR/204",
    experience: "11 years",
    specialties: ["Apartments", "Penthouses", "Commercial mixed-use"],
    team_size: 68,
    listings_count: 0,
  },
];

async function main() {
  const brokerRows = await rest(
    "GET",
    "profiles?email=eq.broker@sqftgo.com&select=id,name,email,phone"
  );
  const broker = brokerRows?.[0];
  if (!broker) throw new Error("broker@sqftgo.com profile missing — run pnpm seed:demo-users");

  // Remove test / demo-seed noise from public catalog
  const all = await rest("GET", "properties?select=id,title");
  const junk = (all || []).filter((p) =>
    /testing|\[demo-seed\]|draft studio/i.test(p.title || "")
  );
  for (const row of junk) {
    await rest("DELETE", `properties?id=eq.${row.id}`);
    console.log("deleted", row.title);
  }

  // Feature an existing quality listing if present
  await rest(
    "PATCH",
    "properties?title=eq.Pink%20City%20Commercial%20Shop",
    { featured: true, status: "active" }
  );
  await rest(
    "PATCH",
    "properties?title=eq.Blue%20City%20Boutique%20Apartment",
    { featured: true, status: "active" }
  );
  await rest(
    "PATCH",
    "properties?title=eq.Lakeview%20Heritage%20Haveli",
    { featured: true, status: "active" }
  );

  for (const listing of NEW_LISTINGS) {
    const existing = await rest(
      "GET",
      `properties?title=eq.${encodeURIComponent(listing.title)}&select=id`
    );
    const payload = {
      ...listing,
      owner_id: broker.id,
      owner_name: broker.name || "Rajesh Mehta",
      owner_phone: broker.phone || "+91 98765 43210",
      owner_email: broker.email,
      status: "active",
    };
    if (existing?.[0]?.id) {
      await rest("PATCH", `properties?id=eq.${existing[0].id}`, payload);
      console.log("updated listing", listing.title);
    } else {
      await rest("POST", "properties", payload);
      console.log("created listing", listing.title);
    }
  }

  for (const builder of NEW_BUILDERS) {
    const existing = await rest(
      "GET",
      `directory_profiles?email=eq.${encodeURIComponent(builder.email)}&select=id`
    );
    if (existing?.[0]?.id) {
      await rest("PATCH", `directory_profiles?id=eq.${existing[0].id}`, builder);
      console.log("updated builder", builder.firm_name);
    } else {
      await rest("POST", "directory_profiles", builder);
      console.log("created builder", builder.firm_name);
    }
  }

  const active = await rest(
    "GET",
    "properties?status=eq.active&select=title,purpose,type,featured,city&order=featured.desc"
  );
  const builders = await rest(
    "GET",
    "directory_profiles?category=eq.Builder%20%26%20Developer&select=firm_name,city"
  );
  console.log("\nActive properties:", active?.length);
  console.log(active);
  console.log("\nBuilders:", builders?.length);
  console.log(builders);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
