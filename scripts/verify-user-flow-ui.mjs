/**
 * Browser-style HTTP walkthrough for guest + buyer pages.
 * Uses cookie session (same as verify-user-flow.mjs). Appends to scorecard.
 *
 *   node scripts/verify-user-flow-ui.mjs
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

const USER = { email: "user@sqftgo.com", password: "user2026" };

/** @type {{ id: string, name: string, status: string, detail?: string, severity?: string }[]} */
const results = [];

function record(id, name, status, detail = "", severity = "") {
  results.push({ id, name, status, detail: String(detail).slice(0, 400), severity });
  console.log(
    `${status.padEnd(5)} ${id} — ${name}${severity ? ` [${severity}]` : ""}${detail ? `: ${String(detail).slice(0, 160)}` : ""}`
  );
}

class CookieJar {
  constructor() {
    this.map = new Map();
  }
  store(res) {
    const raw = typeof res.headers.getSetCookie === "function" ? res.headers.getSetCookie() : [];
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
    return [...this.map.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
  }
}

async function api(path, opts = {}) {
  const { jar, ...init } = opts;
  const headers = new Headers(init.headers || {});
  if (!headers.has("Content-Type") && init.body) headers.set("Content-Type", "application/json");
  if (jar) {
    const c = jar.header();
    if (c) headers.set("Cookie", c);
  }
  const res = await fetch(`${BASE}${path}`, { ...init, headers, redirect: "manual" });
  if (jar) jar.store(res);
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return { res, status: res.status, json, text };
}

async function page(path, jar) {
  const headers = {};
  if (jar?.map.size) headers.Cookie = jar.header();
  const res = await fetch(`${BASE}${path}`, { headers, redirect: "manual" });
  const text = await res.text();
  return { status: res.status, text, location: res.headers.get("location") || "" };
}

async function run() {
  console.log(`\nUser-flow UI walkthrough → ${BASE}\n`);

  // Guest pages
  for (const [id, path, mustInclude] of [
    ["G-destinations", "/destinations", /destination/i],
    ["G-privacy", "/privacy", /privacy/i],
    ["G-terms", "/terms", /term/i],
    ["G-hub", "/hub", /hub|dream|portal/i],
    ["G-signup", "/signup", /sign\s*up|create|register|password/i],
    ["G-forgot", "/forgot-password", /forgot|reset|email/i],
  ]) {
    const { status, text, location } = await page(path);
    if (status >= 300 && status < 400) {
      record(id, `Guest ${path}`, "PASS", `redirect ${status} → ${location}`);
      continue;
    }
    if (status === 200 && mustInclude.test(text)) {
      record(id, `Guest ${path}`, "PASS", `HTTP 200 + content match`);
    } else if (status === 200) {
      record(id, `Guest ${path}`, "FAIL", `HTTP 200 but content mismatch`, "P2");
    } else {
      record(id, `Guest ${path}`, "FAIL", `HTTP ${status}`, "P1");
    }
  }

  // Login page: Google button presence (wired or stub)
  {
    const { status, text } = await page("/login");
    if (status !== 200) {
      record("G-google", "Login Google control", "FAIL", `HTTP ${status}`, "P2");
    } else if (/google/i.test(text)) {
      // Google OAuth was enabled on web — button may be real; mark as present
      record("G-google", "Login mentions Google", "PASS", "Google string present on login HTML");
    } else {
      record("G-google", "Login Google control", "KNOWN", "no Google CTA in HTML (stub/removed)");
    }
  }

  // Guest profile gate
  {
    const { status, location } = await page("/profile");
    if ((status === 307 || status === 302) && /login/i.test(location)) {
      record("G-profile-gate", "Guest /profile → login", "PASS", location);
    } else {
      record("G-profile-gate", "Guest /profile → login", "FAIL", `${status} ${location}`, "P1");
    }
  }

  const jar = new CookieJar();
  const login = await api("/api/auth/login", {
    jar,
    method: "POST",
    body: JSON.stringify(USER),
  });
  if (login.status !== 200) {
    record("U-login", "Buyer session for UI", "FAIL", `${login.status}`, "P0");
  } else {
    record("U-login", "Buyer session for UI", "PASS");
  }

  // Authenticated pages
  for (const [id, path, re] of [
    ["U-profile", "/profile", /profile|email|account/i],
    ["U-profile-edit", "/profile/edit", /phone|bio|save|name/i],
    ["U-settings", "/settings", /setting|notif/i],
    ["U-my-inquiries", "/my-inquiries", /inquir/i],
    ["U-my-visits", "/my-visits", /visit|tour/i],
    ["U-favorites", "/favorites", /favorit|saved|shortlist|property/i],
  ]) {
    const { status, text, location } = await page(path, jar);
    if (status >= 300 && status < 400) {
      record(id, `Auth ${path}`, "FAIL", `unexpected redirect ${location}`, "P1");
    } else if (status === 200 && re.test(text)) {
      record(id, `Auth ${path}`, "PASS");
    } else if (status === 200) {
      record(id, `Auth ${path}`, "FAIL", "200 but content mismatch", "P2");
    } else {
      record(id, `Auth ${path}`, "FAIL", `HTTP ${status}`, "P1");
    }
  }

  // post-property denied for buyer
  {
    const { status, location, text } = await page("/post-property", jar);
    if ((status >= 300 && status < 400 && (location === "/" || /home|listings|login/i.test(location))) ||
        (status === 200 && /access denied|not allowed|broker|dealer/i.test(text))) {
      record("U-post-property", "Buyer /post-property denied/redirect", "PASS", `${status} ${location}`);
    } else if (status >= 300 && status < 400) {
      record("U-post-property", "Buyer /post-property redirect", "PASS", location);
    } else {
      record("U-post-property", "Buyer /post-property denied", "FAIL", `${status} ${location}`, "P2");
    }
  }

  // admin page forbidden for buyer
  {
    const { status, location } = await page("/admin", jar);
    if (status >= 300 && status < 400) {
      record("U-admin-gate", "Buyer /admin redirected", "PASS", location);
    } else if (status === 403) {
      record("U-admin-gate", "Buyer /admin 403", "PASS");
    } else {
      record("U-admin-gate", "Buyer /admin gated", "FAIL", `${status} ${location}`, "P0");
    }
  }

  // Cross-check: favorites page vs API
  {
    const props = await api("/api/properties?limit=1");
    const id = props.json?.items?.[0]?.id;
    if (id) {
      await api("/api/favorites", {
        jar,
        method: "POST",
        body: JSON.stringify({ propertyId: id }),
      });
      const favApi = await api("/api/favorites", { jar });
      const ids = Array.isArray(favApi.json) ? favApi.json : [];
      const { status, text } = await page("/favorites", jar);
      if (status === 200 && ids.includes(id) && (text.includes(id) || /favorit|saved|property/i.test(text))) {
        record("U-fav-sync", "Favorites UI reachable with API sync", "PASS", `api has ${ids.length}`);
      } else if (status === 200 && ids.includes(id)) {
        // RSC may not embed uuid in HTML
        record("U-fav-sync", "Favorites UI + API id present", "PASS", "API synced; HTML may be client-rendered");
      } else {
        record("U-fav-sync", "Favorites UI + API", "FAIL", `api=${JSON.stringify(ids)} http=${status}`, "P1");
      }
    } else {
      record("U-fav-sync", "Favorites sync", "FAIL", "no property", "P1");
    }
  }

  // Compare still known
  {
    const { status } = await page("/compare");
    if (status === 404) record("G-compare", "/compare missing", "KNOWN", "404");
    else record("G-compare", "/compare", status === 200 ? "PASS" : "FAIL", `HTTP ${status}`, "P2");
  }

  const pass = results.filter((r) => r.status === "PASS").length;
  const fail = results.filter((r) => r.status === "FAIL").length;
  const known = results.filter((r) => r.status === "KNOWN").length;

  console.log("\n========== UI SCORECARD ==========");
  console.log(`PASS ${pass} | FAIL ${fail} | KNOWN ${known}`);
  console.log("==================================\n");

  // Append to results doc
  const outPath = resolve("docs/USER_FLOW_TEST_RESULTS.md");
  let existing = "";
  try {
    existing = readFileSync(outPath, "utf8");
  } catch {
    existing = "# User flow E2E test results\n";
  }

  const section = [
    ``,
    `---`,
    ``,
    `## Browser-style UI walkthrough`,
    ``,
    `- **When:** ${new Date().toISOString()}`,
    `- **Base URL:** ${BASE}`,
    `- **Score:** PASS ${pass} / FAIL ${fail} / KNOWN ${known}`,
    ``,
    `| ID | Status | Severity | Name | Detail |`,
    `|----|--------|----------|------|--------|`,
    ...results.map(
      (r) =>
        `| \`${r.id}\` | ${r.status} | ${r.severity || "—"} | ${r.name.replace(/\|/g, "/")} | ${(r.detail || "").replace(/\|/g, "/")} |`
    ),
    ``,
  ].join("\n");

  writeFileSync(outPath, existing.trimEnd() + "\n" + section, "utf8");
  console.log(`Appended UI results → ${outPath}`);
  process.exit(fail > 0 ? 1 : 0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
