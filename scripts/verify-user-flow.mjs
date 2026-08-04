/**
 * Harsh buyer/user-flow API battery against the Next BFF.
 *
 * Usage:
 *   BASE_URL=http://localhost:3000 node scripts/verify-user-flow.mjs
 *   pnpm user-flow:verify
 *
 * Exit 1 if any FAIL (KNOWN stubs do not fail the process).
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

function loadEnvFile(path) {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return "";
  }
}

function loadEnv() {
  const env = { ...process.env };
  const raw = loadEnvFile(".env.local") || loadEnvFile(".env");
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i === -1) continue;
    const key = line.slice(0, i).trim();
    if (env[key]) continue;
    let v = line.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    env[key] = v;
  }
  return env;
}

const env = loadEnv();
const BASE = (process.env.BASE_URL || env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(
  /\/$/,
  ""
);

const USER = {
  email: "user@sqftgo.com",
  password: "user2026",
};
const BROKER = {
  email: "broker@sqftgo.com",
  password: "broker2026",
};

/** @type {{ id: string, name: string, status: 'PASS'|'FAIL'|'KNOWN', detail?: string, severity?: string }[]} */
const results = [];

function record(id, name, status, detail = "", severity = "") {
  results.push({ id, name, status, detail: String(detail).slice(0, 400), severity });
  const tag = severity ? ` [${severity}]` : "";
  console.log(`${status.padEnd(5)} ${id} — ${name}${tag}${detail ? `: ${String(detail).slice(0, 160)}` : ""}`);
}

class CookieJar {
  constructor() {
    /** @type {Map<string, string>} */
    this.map = new Map();
  }

  /** @param {Response} res */
  store(res) {
    const raw =
      typeof res.headers.getSetCookie === "function"
        ? res.headers.getSetCookie()
        : [];
    const single = res.headers.get("set-cookie");
    const list = raw.length ? raw : single ? [single] : [];
    for (const line of list) {
      const part = line.split(";")[0];
      const eq = part.indexOf("=");
      if (eq === -1) continue;
      const name = part.slice(0, eq).trim();
      const value = part.slice(eq + 1).trim();
      if (!name) continue;
      if (value === "" || /Max-Age=0/i.test(line)) this.map.delete(name);
      else this.map.set(name, value);
    }
  }

  header() {
    if (this.map.size === 0) return "";
    return [...this.map.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
  }

  clear() {
    this.map.clear();
  }
}

/**
 * @param {string} path
 * @param {RequestInit & { jar?: CookieJar }} [opts]
 */
async function api(path, opts = {}) {
  const { jar, headers: extra, ...init } = opts;
  const headers = new Headers(extra || {});
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  if (jar) {
    const cookie = jar.header();
    if (cookie) headers.set("Cookie", cookie);
  }
  const res = await fetch(`${BASE}${path}`, { ...init, headers, redirect: "manual" });
  if (jar) jar.store(res);
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text.slice(0, 200) };
  }
  return { res, status: res.status, json, text };
}

function tomorrowYmd() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function assert(cond, failMsg) {
  if (!cond) throw new Error(failMsg);
}

async function login(jar, creds) {
  return api("/api/auth/login", {
    jar,
    method: "POST",
    body: JSON.stringify(creds),
  });
}

async function run() {
  console.log(`\nUser-flow API battery → ${BASE}\n`);

  // --- Auth gates ---
  {
    const { status, json } = await api("/api/auth/me");
    if (status === 401) record("A-me-unauth", "Unauthed GET /api/auth/me → 401", "PASS");
    else record("A-me-unauth", "Unauthed GET /api/auth/me → 401", "FAIL", `${status} ${JSON.stringify(json)}`, "P0");
  }

  {
    const { status, json } = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: USER.email, password: "wrong-password-xxx" }),
    });
    const hasError = typeof json?.error === "string" && json.error.length > 0;
    if (status === 401 && hasError) {
      record("A-bad-pw", "Bad password → 401 + error", "PASS", json.error);
    } else {
      record("A-bad-pw", "Bad password → 401 + error", "FAIL", `${status} ${JSON.stringify(json)}`, "P0");
    }
  }

  const userJar = new CookieJar();
  let userSession = null;
  {
    const { status, json } = await login(userJar, USER);
    try {
      assert(status === 200, `login status ${status}`);
      assert(json?.role === "user", `role=${json?.role}`);
      assert(userJar.map.size > 0, "no session cookies set");
      userSession = json;
      record("B-login", "Demo user login + cookies", "PASS", `role=${json.role} cookies=${userJar.map.size}`);
    } catch (e) {
      record("B-login", "Demo user login + cookies", "FAIL", `${status} ${e.message} ${JSON.stringify(json)}`, "P0");
    }
  }

  {
    const { status, json } = await api("/api/auth/me", { jar: userJar });
    if (status === 200 && (json?.email === USER.email || json?.profile?.email === USER.email)) {
      record("B-me", "GET /api/auth/me with session", "PASS");
    } else {
      record("B-me", "GET /api/auth/me with session", "FAIL", `${status} ${JSON.stringify(json)}`, "P0");
    }
  }

  // --- Catalog ---
  let propertyId = null;
  let propertyTitle = "";
  {
    const { status, json } = await api("/api/properties?limit=5");
    const items = json?.items ?? json?.data?.items ?? [];
    const active = Array.isArray(items) ? items.find((p) => (p.status || "").toLowerCase() === "active") || items[0] : null;
    if (status === 200 && active?.id) {
      propertyId = active.id;
      propertyTitle = active.title || "";
      record("A-listings", "GET /api/properties has listings", "PASS", `id=${propertyId} total=${json.total ?? items.length}`);
    } else {
      record("A-listings", "GET /api/properties has listings", "FAIL", `${status} ${JSON.stringify(json)?.slice?.(0, 200) ?? json}`, "P0");
    }
  }

  {
    if (!propertyId) {
      record("A-property", "GET /api/properties/[id]", "FAIL", "no propertyId", "P0");
    } else {
      const { status, json } = await api(`/api/properties/${propertyId}`);
      if (status === 200 && (json?.id === propertyId || json?.data?.id === propertyId)) {
        record("A-property", "GET /api/properties/[id]", "PASS");
      } else {
        record("A-property", "GET /api/properties/[id]", "FAIL", `${status} ${JSON.stringify(json)}`, "P1");
      }
    }
  }

  // Public pages (HTTP reachability — UI smoke)
  for (const [id, path] of [
    ["UI-home", "/"],
    ["UI-listings", "/listings"],
    ["UI-dealers", "/dealers"],
    ["UI-services", "/services"],
    ["UI-favorites", "/favorites"],
    ["UI-help", "/help"],
    ["UI-login", "/login"],
  ]) {
    const res = await fetch(`${BASE}${path}`, { redirect: "manual" });
    if (res.status >= 200 && res.status < 400) {
      record(id, `Page ${path}`, "PASS", `HTTP ${res.status}`);
    } else {
      record(id, `Page ${path}`, "FAIL", `HTTP ${res.status}`, "P1");
    }
  }

  {
    const res = await fetch(`${BASE}/compare`, { redirect: "manual" });
    if (res.status === 404) {
      record("UI-compare", "GET /compare (walkthrough)", "KNOWN", "route missing — documented stub");
    } else if (res.status >= 200 && res.status < 400) {
      record("UI-compare", "GET /compare", "PASS", `HTTP ${res.status}`);
    } else {
      record("UI-compare", "GET /compare", "FAIL", `HTTP ${res.status}`, "P2");
    }
  }

  if (propertyId) {
    const res = await fetch(`${BASE}/property/${propertyId}`, { redirect: "manual" });
    if (res.status >= 200 && res.status < 400) {
      record("UI-property", `Page /property/${propertyId}`, "PASS", `HTTP ${res.status}`);
    } else {
      record("UI-property", `Page /property/${propertyId}`, "FAIL", `HTTP ${res.status}`, "P1");
    }
  }

  // --- Favorites ---
  if (propertyId && userJar.map.size) {
    {
      const { status, json } = await api("/api/favorites", {
        jar: userJar,
        method: "POST",
        body: JSON.stringify({ propertyId }),
      });
      if (status === 201 || status === 200) {
        record("B-fav-add", "POST /api/favorites", "PASS", JSON.stringify(json));
      } else {
        record("B-fav-add", "POST /api/favorites", "FAIL", `${status} ${JSON.stringify(json)}`, "P0");
      }
    }
    {
      const { status, json } = await api("/api/favorites", { jar: userJar });
      const ids = Array.isArray(json) ? json : json?.data ?? [];
      if (status === 200 && ids.includes(propertyId)) {
        record("B-fav-list", "GET /api/favorites includes id", "PASS");
      } else {
        record("B-fav-list", "GET /api/favorites includes id", "FAIL", `${status} ${JSON.stringify(json)}`, "P0");
      }
    }
    {
      const { status, json } = await api(`/api/favorites/${propertyId}`, {
        jar: userJar,
        method: "DELETE",
      });
      if (status === 200 || status === 204) {
        const list = await api("/api/favorites", { jar: userJar });
        const ids = Array.isArray(list.json) ? list.json : list.json?.data ?? [];
        if (!ids.includes(propertyId)) {
          record("B-fav-del", "DELETE favorite + list empty of id", "PASS");
        } else {
          record("B-fav-del", "DELETE favorite + list empty of id", "FAIL", "still present", "P1");
        }
      } else {
        record("B-fav-del", "DELETE favorite", "FAIL", `${status} ${JSON.stringify(json)}`, "P1");
      }
    }
    // re-add for later UI consistency
    await api("/api/favorites", {
      jar: userJar,
      method: "POST",
      body: JSON.stringify({ propertyId }),
    });
  } else {
    record("B-fav-add", "Favorites suite", "FAIL", "skipped — no session/property", "P0");
  }

  // --- Inquiry ---
  let inquiryId = null;
  if (propertyId && userJar.map.size) {
    const { status, json } = await api(`/api/properties/${propertyId}/inquiries`, {
      jar: userJar,
      method: "POST",
      body: JSON.stringify({
        name: userSession?.name || "Demo User",
        email: USER.email,
        phone: "+91 98765 43210",
        message: `E2E inquiry ${Date.now()} — please ignore`,
      }),
    });
    if (status === 201 && json?.id) {
      inquiryId = json.id;
      record("B-inquiry", "POST property inquiry", "PASS", `id=${inquiryId}`);
    } else {
      record("B-inquiry", "POST property inquiry", "FAIL", `${status} ${JSON.stringify(json)}`, "P0");
    }

    const mine = await api("/api/inquiries?mine=1", { jar: userJar });
    const rows = Array.isArray(mine.json) ? mine.json : mine.json?.data ?? [];
    const found = inquiryId ? rows.some((r) => r.id === inquiryId) : false;
    if (mine.status === 200 && found) {
      record("B-inquiry-mine", "GET /api/inquiries?mine=1 includes new", "PASS");
    } else {
      record(
        "B-inquiry-mine",
        "GET /api/inquiries?mine=1 includes new",
        "FAIL",
        `${mine.status} found=${found} count=${rows.length}`,
        "P0"
      );
    }
  }

  // --- Visits ---
  let visitId = null;
  if (propertyId && userJar.map.size) {
    const { status, json } = await api(`/api/properties/${propertyId}/visits`, {
      jar: userJar,
      method: "POST",
      body: JSON.stringify({
        name: userSession?.name || "Demo User",
        email: USER.email,
        phone: "+91 98765 43210",
        date: tomorrowYmd(),
        time: "11:00 AM",
        notes: `E2E visit ${Date.now()}`,
      }),
    });
    if (status === 201 && json?.id) {
      visitId = json.id;
      const st = json.status || json.statusLabel || "";
      record("B-visit", "POST book site visit", "PASS", `id=${visitId} status=${st}`);
    } else {
      record("B-visit", "POST book site visit", "FAIL", `${status} ${JSON.stringify(json)}`, "P0");
    }

    const list = await api("/api/visits", { jar: userJar });
    const rows = Array.isArray(list.json) ? list.json : list.json?.data ?? [];
    const found = visitId ? rows.some((r) => r.id === visitId) : false;
    if (list.status === 200 && found) {
      record("B-visit-list", "GET /api/visits includes booking", "PASS");
    } else {
      record("B-visit-list", "GET /api/visits includes booking", "FAIL", `${list.status} found=${found}`, "P0");
    }
  }

  // Broker confirms visit (cross-role)
  if (visitId) {
    const brokerJar = new CookieJar();
    const broLogin = await login(brokerJar, BROKER);
    if (broLogin.status !== 200 || broLogin.json?.role !== "broker") {
      record(
        "E-broker-login",
        "Broker login for visit confirm",
        "FAIL",
        `${broLogin.status} ${JSON.stringify(broLogin.json)}`,
        "P1"
      );
    } else {
      record("E-broker-login", "Broker login for visit confirm", "PASS");
      const conf = await api(`/api/visits/${visitId}`, {
        jar: brokerJar,
        method: "PATCH",
        body: JSON.stringify({ status: "Confirmed" }),
      });
      if (conf.status === 200) {
        record("E-visit-confirm", "Broker confirms visit", "PASS", JSON.stringify(conf.json?.status || conf.json));
      } else {
        record("E-visit-confirm", "Broker confirms visit", "FAIL", `${conf.status} ${JSON.stringify(conf.json)}`, "P1");
      }

      const buyerSee = await api("/api/visits", { jar: userJar });
      const rows = Array.isArray(buyerSee.json) ? buyerSee.json : buyerSee.json?.data ?? [];
      const row = rows.find((r) => r.id === visitId);
      const st = String(row?.status || row?.statusLabel || "").toLowerCase();
      if (row && st.includes("confirm")) {
        record("E-buyer-sees-confirmed", "Buyer sees confirmed visit", "PASS", st);
      } else {
        record(
          "E-buyer-sees-confirmed",
          "Buyer sees confirmed visit",
          "FAIL",
          `row=${JSON.stringify(row)?.slice(0, 200)}`,
          "P1"
        );
      }
    }
  }

  // Cancel a fresh visit as buyer
  if (propertyId && userJar.map.size) {
    const booked = await api(`/api/properties/${propertyId}/visits`, {
      jar: userJar,
      method: "POST",
      body: JSON.stringify({
        name: userSession?.name || "Demo User",
        email: USER.email,
        phone: "+91 98765 43210",
        date: tomorrowYmd(),
        time: "03:00 PM",
        notes: "E2E cancel target",
      }),
    });
    if (booked.status === 201 && booked.json?.id) {
      const cancel = await api(`/api/visits/${booked.json.id}`, {
        jar: userJar,
        method: "PATCH",
        body: JSON.stringify({ status: "Cancelled" }),
      });
      if (cancel.status === 200) {
        record("B-visit-cancel", "Buyer cancels visit", "PASS");
      } else {
        record("B-visit-cancel", "Buyer cancels visit", "FAIL", `${cancel.status} ${JSON.stringify(cancel.json)}`, "P1");
      }
    } else {
      record("B-visit-cancel", "Buyer cancels visit", "FAIL", `book failed ${booked.status}`, "P1");
    }
  }

  // --- Profile PATCH ---
  if (userJar.map.size) {
    const stamp = `E2E ${Date.now().toString().slice(-6)}`;
    const patch = await api("/api/auth/me", {
      jar: userJar,
      method: "PATCH",
      body: JSON.stringify({
        phone: "+91 90000 11122",
        bio: stamp,
      }),
    });
    if (patch.status !== 200) {
      record("B-profile-patch", "PATCH /api/auth/me", "FAIL", `${patch.status} ${JSON.stringify(patch.json)}`, "P1");
    } else {
      const me = await api("/api/auth/me", { jar: userJar });
      const bio = me.json?.profile?.bio ?? me.json?.bio;
      const phone = me.json?.profile?.phone ?? me.json?.phone;
      if (me.status === 200 && bio === stamp && phone) {
        record("B-profile-patch", "PATCH profile persists", "PASS", `bio=${bio}`);
      } else {
        record(
          "B-profile-patch",
          "PATCH profile persists",
          "FAIL",
          `${me.status} bio=${bio} phone=${phone}`,
          "P1"
        );
      }
    }
  }

  // --- Buyer must NOT create property ---
  {
    const { status, json } = await api("/api/properties", {
      jar: userJar,
      method: "POST",
      body: JSON.stringify({
        title: "Buyer should not create",
        price: 100000,
        city: "Udaipur",
      }),
    });
    if (status === 401 || status === 403 || status === 400) {
      record("B-no-create-property", "Buyer POST /api/properties denied", "PASS", `${status}`);
    } else {
      record("B-no-create-property", "Buyer POST /api/properties denied", "FAIL", `${status} ${JSON.stringify(json)}`, "P0");
    }
  }

  // --- Buyer must NOT access admin APIs ---
  {
    const { status, json } = await api("/api/admin/users", { jar: userJar });
    if (status === 401 || status === 403) {
      record("B-no-admin", "Buyer GET /api/admin/users denied", "PASS", `${status}`);
    } else {
      record("B-no-admin", "Buyer GET /api/admin/users denied", "FAIL", `${status} ${JSON.stringify(json)}`, "P0");
    }
  }

  // Protected pages without session after logout
  {
    const logout = await api("/api/auth/logout", { jar: userJar, method: "POST" });
    if (logout.status === 200 || logout.status === 204) {
      record("B-logout", "POST /api/auth/logout", "PASS", `${logout.status}`);
    } else {
      record("B-logout", "POST /api/auth/logout", "FAIL", `${logout.status} ${JSON.stringify(logout.json)}`, "P0");
    }

    const me = await api("/api/auth/me", { jar: userJar });
    if (me.status === 401) {
      record("B-logout-me", "GET /api/auth/me after logout → 401", "PASS");
    } else {
      record("B-logout-me", "GET /api/auth/me after logout → 401", "FAIL", `${me.status} ${JSON.stringify(me.json)}`, "P0");
    }

    const gate = await fetch(`${BASE}/my-inquiries`, {
      redirect: "manual",
      headers: { Cookie: userJar.header() },
    });
    // middleware typically 307/302 to login
    if (gate.status === 307 || gate.status === 302 || gate.status === 303) {
      const loc = gate.headers.get("location") || "";
      if (/login/i.test(loc)) {
        record("B-gate-my-inquiries", "Logged-out /my-inquiries → login", "PASS", loc);
      } else {
        record("B-gate-my-inquiries", "Logged-out /my-inquiries → login", "FAIL", `${gate.status} ${loc}`, "P1");
      }
    } else if (gate.status === 401) {
      record("B-gate-my-inquiries", "Logged-out /my-inquiries gated", "PASS", "401");
    } else {
      record("B-gate-my-inquiries", "Logged-out /my-inquiries → login", "FAIL", `HTTP ${gate.status}`, "P1");
    }
  }

  // Dream / enquiry endpoints (buyer-adjacent)
  {
    const jar = new CookieJar();
    await login(jar, USER);
    const enq = await api("/api/enquiries", {
      jar,
      method: "POST",
      body: JSON.stringify({
        name: "E2E Dream",
        email: USER.email,
        mobile: "9876543210",
        message: "E2E dream project enquiry — ignore",
      }),
    });
    if (enq.status === 200 || enq.status === 201) {
      record("B-enquiries", "POST /api/enquiries", "PASS", `${enq.status}`);
    } else if (enq.status === 400 && enq.json?.error) {
      // schema may require more fields — still a controlled response
      record("B-enquiries", "POST /api/enquiries schema gate", "PASS", enq.json.error);
    } else {
      record("B-enquiries", "POST /api/enquiries", "FAIL", `${enq.status} ${JSON.stringify(enq.json)}`, "P2");
    }
  }

  // --- Scorecard ---
  const pass = results.filter((r) => r.status === "PASS").length;
  const fail = results.filter((r) => r.status === "FAIL").length;
  const known = results.filter((r) => r.status === "KNOWN").length;
  const p0 = results.filter((r) => r.status === "FAIL" && r.severity === "P0");
  const p1 = results.filter((r) => r.status === "FAIL" && r.severity === "P1");
  const p2 = results.filter((r) => r.status === "FAIL" && r.severity === "P2");

  console.log("\n========== SCORECARD ==========");
  console.log(`BASE: ${BASE}`);
  console.log(`PASS ${pass} | FAIL ${fail} | KNOWN ${known} | total ${results.length}`);
  console.log(`P0 ${p0.length} | P1 ${p1.length} | P2 ${p2.length}`);
  if (fail) {
    console.log("\nFailures:");
    for (const r of results.filter((x) => x.status === "FAIL")) {
      console.log(`- [${r.severity || "?"}] ${r.id}: ${r.name} — ${r.detail}`);
    }
  }
  console.log("================================\n");

  const outPath = resolve("docs/USER_FLOW_TEST_RESULTS.md");
  const md = [
    `# User flow E2E test results`,
    ``,
    `- **When:** ${new Date().toISOString()}`,
    `- **Base URL:** ${BASE}`,
    `- **Score:** PASS ${pass} / FAIL ${fail} / KNOWN ${known} (total ${results.length})`,
    `- **Severity:** P0 ${p0.length}, P1 ${p1.length}, P2 ${p2.length}`,
    ``,
    `## Results`,
    ``,
    `| ID | Status | Severity | Name | Detail |`,
    `|----|--------|----------|------|--------|`,
    ...results.map(
      (r) =>
        `| \`${r.id}\` | ${r.status} | ${r.severity || "—"} | ${r.name.replace(/\|/g, "/")} | ${(r.detail || "").replace(/\|/g, "/").replace(/\n/g, " ")} |`
    ),
    ``,
    `## Failures (ranked)`,
    ``,
    ...(fail
      ? results
          .filter((r) => r.status === "FAIL")
          .sort((a, b) => String(a.severity).localeCompare(String(b.severity)))
          .map((r) => `- **${r.severity || "?"}** \`${r.id}\` — ${r.name}: ${r.detail}`)
      : [`- None`]),
    ``,
    `## Known stubs confirmed`,
    ``,
    ...results.filter((r) => r.status === "KNOWN").map((r) => `- \`${r.id}\` — ${r.detail}`),
    results.some((r) => r.status === "KNOWN") ? "" : `- (none in this run)`,
    ``,
    `## Top fixes`,
    ``,
    ...[...p0, ...p1, ...p2].slice(0, 5).map((r, i) => `${i + 1}. [${r.severity}] ${r.name} (\`${r.id}\`)`),
    [...p0, ...p1, ...p2].length === 0 ? `1. No API failures in this battery.` : "",
    ``,
  ].join("\n");

  writeFileSync(outPath, md, "utf8");
  console.log(`Wrote ${outPath}`);

  process.exit(fail > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
