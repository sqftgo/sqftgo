# SqftGo — remaining work

Last updated: **2026-11-25**  
Phases **1–14** shipped on `main`. Phase **15** covers cleanup + Dream Project inspiration uploads + notification pref persistence.

Auth-specific checklist: see also [`AUTH_REMAINING.md`](./AUTH_REMAINING.md).

---

## Transactional email + API failure alerts

**Plan:** keep mail sending continuous on free tiers by chaining providers.

| Priority | Provider | Free monthly limit (approx.) | Role |
|----------|----------|------------------------------|------|
| 1st | **Resend** | ~**3,000** emails / month | Primary sender |
| 2nd | **Mailjet** | ~**6,000** emails / month | Fallback when Resend free quota is exhausted |
| 3rd | **MSG91 Email** (optional) | per MSG91 plan | Last fallback if configured |

**How mail send works (code shipped):**

1. `src/lib/mail/send.ts` tries **Resend → Mailjet → MSG91** automatically.
2. When Resend hits free limit / 429, next provider is tried so mail can continue.
3. Do not commit API keys; keep secrets in env only (see `.env.example`).

**API failure alerts (code shipped — reactive, not a poller):**

- When **our own** `/api/*` routes return **5xx** (`jsonError`) or throw (**uncaught** via `src/instrumentation.ts`), we build a proper alert and email **`bhaveshanjana58@gmail.com`** (override with `API_ALERT_EMAIL`).
- Does **not** ping third-party services and does **not** actively health-check every route — only fires when a real request hits a failing endpoint.
- Same route is rate-limited (~15 min) so one outage does not flood the inbox.
- Alerts run in **production** once a mail provider is configured; set `API_ALERT_IN_DEV=true` to test locally. Set `API_ALERTS_DISABLED=true` to mute.

**Still needed (ops — when mail service is available):**

1. Create Resend account + API key; verify sending domain (SPF/DKIM); set `RESEND_API_KEY` + `RESEND_FROM`
2. Create Mailjet account + API key/secret; verify sender; set `MAILJET_API_KEY` + `MAILJET_API_SECRET` + `MAILJET_FROM_EMAIL`
3. Optional: MSG91 Email domain + `MSG91_EMAIL_*` (or reuse `MSG91_AUTH_KEY` with email domain/from)
4. Set production env on Vercel: mail keys + `API_ALERT_EMAIL=bhaveshanjana58@gmail.com`
5. Confirm free-tier numbers in each dashboard before launch (limits can change)
6. Smoke test: force a 500 on a non-critical API in staging with mail configured → confirm inbox message
7. Confirm current free-tier numbers again after first production week

**Out of scope until then:** paid Resend/Mailjet plans, full ESP analytics, marketing blasts, third-party uptime monitors.

**Resume prompt:**

> Read `@docs/REMAINING.md` transactional email + API alerts section and finish Resend/Mailjet (optional MSG91) env + DNS so API 5xx alerts reach bhaveshanjana58@gmail.com.

---

## Deferred product features (do not start until prioritized)

### 1. Google / social Sign-In + Sign-Up

**App wiring:** Done — login page calls `signInWithOAuth({ provider: "google" })` → `/auth/callback`.

**Still needed (dashboard / ops):**

1. Supabase → Authentication → Providers → enable **Google** (paste Client ID + Client Secret).
2. Supabase → Authentication → URL configuration → Redirect URLs include `http://localhost:3000/auth/callback` (and prod domain later).
3. Apply migration `20260802120000_oauth_profile_metadata.sql` (Google `full_name` / `picture` → profile).
4. Harsh tests: happy path, cancel, existing email link, role routing.

**Out of scope until then:** Apple/Facebook, account linking UX.

---

### 2. Dealer KYC / bank / verification

**Today (Phase E):** Private `dealer_kyc` + docs metadata + `dealer-kyc` storage bucket; dealer submit + admin review at `/admin/kyc`. Badge reflects real KYC status (or RERA on directory).

**Still open:**

1. Admin signed-URL document viewer in review UI
2. Enforce listing caps / approval policy flags from `platform_settings` in property create APIs
3. Bank/settlement vault (still intentionally unavailable)

**Out of scope until then:** Settlement payouts, bank verification webhooks.

---

### 3. Customer reviews (product)

**Today:** Dead mock path removed in Phase 15. Type `CustomerReview` may remain unused.

**To ship:** Design a review surface (property and/or dealer) → table + RLS + APIs + UI. Do not invent DB without UI.

---

### 4. Image hosting + admin city covers (shipped 2026-10-26)

**Policy:**

| Asset | Where |
|-------|--------|
| Logo, favicon, fixed heroes, static city fallbacks | `/public` |
| Admin-uploaded city covers | Supabase `city-covers` bucket + `locations.cover_image_url` |
| Property / avatar / KYC / dream uploads | Existing Storage buckets |

**Shipped:**

- `locations.cover_image_url` + public `city-covers` bucket (seeded from `/cities/*` paths for known cities)
- Admin `/admin/locations`: add city, enable/disable, upload cover (**Image** on each row)
- `cityCoverImage()` prefers admin cover app-wide; destinations (including newly added cities) use it
- Static `/public/cities` remains fallback when no DB cover is set

**Optional later:** drop large static city JPGs once every active city has a Storage cover; mobile app parity if needed.

---

### 5. SEO ops (Google / human — ~30%)

**Code side (done):** `metadataBase`, page titles/descriptions, Open Graph, `robots.ts`, `sitemap.ts`, Organization + RealEstateListing JSON-LD.

**Still needed (you / ops — not code):**

1. **Google Search Console** (required for organic SEO)
   - Add property `https://www.sqftgo.com`
   - Verify ownership (DNS TXT, HTML file, or meta tag — paste token into a follow-up if you want the meta in repo)
   - Submit sitemap: `https://www.sqftgo.com/sitemap.xml`
   - Watch Coverage / Page indexing for errors
2. Confirm production `NEXT_PUBLIC_SITE_URL=https://www.sqftgo.com` (no trailing slash) so sitemap/OG URLs are absolute and correct
3. **Google Analytics (GA4)** — optional traffic dashboards; not required for ranking
4. **Google Business Profile** — optional for local “SqftGo Udaipur” pack
5. Do **not** need Google Ads for organic SEO

**Out of scope until then:** Paid ads, link buying, keyword agency retainers.

**Resume prompt:**

> Read `@docs/REMAINING.md` §5 and finish Search Console verification + sitemap submit for SqftGo production.

---

## Intentionally local (not bugs)

| Item | Why |
|------|-----|
| Compare list | Device tray; max 4 FIFO — account sync optional later |
| Selected city | UI preference in `sv_ui_prefs` |
| Notification preference toggles | Persisted in `localStorage` (`sv_notif_prefs_*`) — not server push routing yet |

---

## Auth / production ops

From `AUTH_REMAINING.md` (summary):

- [ ] **Leaked password protection — blocked on Free plan (needs Supabase Pro)**  
  Tried 2026-11-02: Dashboard → Authentication → **Attack Protection** → Leaked password protection (HaveIBeenPwned). Toggle requires **Pro**. Leave off until upgrade. After Pro: enable → Save → re-check `get_advisors` type `security` (`auth_leaked_password_protection` should clear).  
  Docs: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
- [x] DB security advisor hardening (2026-11-02) — migration `20261102120000_security_advisor_hardening.sql` applied (RPC revoke, service-only table policies, extensions schema). Remaining advisor WARN: `is_admin()` for authenticated (intentional for RLS).
- [ ] Production site URL + redirect allowlist (ops checklist)
- [x] Rate limit auth APIs (in-memory per IP; Upstash later for multi-node)
- [x] Rate limit payment verify routes (listing / subscription / website-promo)
- [x] `AUTH_SKIP_EMAIL_CONFIRM` ignored in production
- [x] Service reviews insert as `pending` (not live-published)
- [x] KYC uploads verified by magic bytes (JPEG/PNG/WebP/PDF)
- [x] Public service SSR uses RLS client (no service-role bypass)
- [ ] **Prod:** set `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` (otherwise rate limits are per-instance memory only)
- [ ] Rotate demo passwords before shared staging (`sqftgo26` in seed scripts — do not use on real prod)
- [ ] Optional CAPTCHA / MFA for admin
- [ ] Tighten CSP (`unsafe-inline` / `unsafe-eval` still required for some checkout scripts — revisit)
- [ ] CI: Dependabot + Semgrep/Trivy (or OSV-Scanner) on PRs

### Phase A honesty (2026-07-25)

- Admin settings / roles / analytics no longer fake persistence or fabricated charts
- Dealer KYC badge / bank / social theater removed; subscription upgrade disabled
- Public dealer inquire no longer fakes success; city listing fallback removed
- Admin users store starts empty (no mock seed flash)

### Phase B (2026-07-25)

- Dealer ownership matching uses `userId` / `ownerId` (email fallback only)
- Property status `rejected` added; approvals reject with reason + activity log (no hard delete)
- Settings password reset wired; admin profile uses `updateProfile`
- Middleware protects `/profile` and `/settings`

### Phase C (2026-07-25)

- `AuthProvider` owns session + `onAuthStateChange`; no client-exported role setters
- TanStack Query for properties, dealers, admin users (via `AppContext` + hooks)
- Shared `apiClient` + paginated list APIs (`{ items, total, limit, offset }`)
- Thin server helpers in `src/lib/server/properties.ts` for future RSC (listings still client)

### Phase D (2026-07-25)

- `src/features/*` modules: properties, dealers, inquiries, visits, auth, notifications, destinations, locations
- `PropertyForm` split into types/constants/six create steps + orchestrator
- Domain UI moved out of `components/ui` (compat re-exports remain, marked deprecated)
- Dealer naming in UI (`Dealer Console`); DB role stays `broker` — see `features/dealers`
- Deleted dead `src/data` mocks; destinations live under `features/destinations`

### Phase E (2026-07-25)

- `platform_settings` singleton + admin Settings save API/UI; maintenance mode gate
- Admin Analytics from DB aggregates (counts, city breakdown, 6-month inquiry series)
- `dealer_kyc` + documents + private `dealer-kyc` bucket; dealer submit + admin `/admin/kyc` review
- Route-group `error.tsx` boundaries (admin / dealer / public)

**Billing:** listing packs + monthly partner plans share one Razorpay stack. Listing cap is enforced (free + active plan cap + bought packs). Period end is checked on each create. **Live keys / webhook / first test payment are still ops** — keep secrets in local `.env`. Webhook: `/api/webhooks/razorpay` (`payment.captured`).

---

## Resume prompts

> Read `@docs/REMAINING.md` and implement **Google OAuth** sign-in/sign-up end-to-end with harsh tests.

> Harden **max_listings_per_dealer** / `require_listing_approval` enforcement in property create APIs.

> Add signed-URL viewing of KYC documents in admin review UI.

> Finish **Razorpay ops**: local test keys, webhook `payment.captured` → `/api/webhooks/razorpay`, one `broker@sqftgo.com` pack buy and one monthly plan buy, then live keys. Do not commit secrets.

> Read `@docs/REMAINING.md` §5 and finish Search Console verification + sitemap submit for SqftGo production.
