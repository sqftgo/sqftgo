# SqftGo — remaining work

Last updated: **2026-10-17**  
Phases **1–14** shipped on `main`. Phase **15** covers cleanup + Dream Project inspiration uploads + notification pref persistence.

Auth-specific checklist: see also [`AUTH_REMAINING.md`](./AUTH_REMAINING.md).

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

### 4. Host destination city covers (CDN / Supabase Storage)

**Today (2026-10-12):** City card / city-page / login slide covers are **static files** in `public/cities/*.jpg`, mapped by `src/constants/city-images.ts` via `cityCoverImage()`. `locations` has **no image column**. Property/dealer images already use Supabase Storage; city covers do not.

**Why change later:** Repo ships ~10MB of JPGs; adding cities needs a code deploy; admins cannot swap a cover from the console.

**To ship when prioritized:**

1. Add `cover_image_url` (nullable text) on `locations` (+ migration).
2. Upload city landmarks to a public Storage bucket (e.g. `city-covers`) or CDN.
3. Admin Locations UI: upload / replace cover; seed existing `public/cities` files once.
4. Resolve covers: DB URL → else `cityCoverImage(name)` → else `/DestinationHero.png`.
5. After DB is source of truth, optionally delete large files from `public/cities` (keep map as fallback only).

**Out of scope until then:** Scraping Unsplash at runtime; hotlinking random CDNs without hosting.

**Resume prompt:**

> Read `@docs/REMAINING.md` §4 and move destination city covers to Supabase Storage + `locations.cover_image_url`.

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

- [ ] Leaked password protection (Supabase Pro)
- [ ] Production site URL + redirect allowlist (ops checklist)
- [x] Rate limit auth APIs (in-memory per IP; Upstash later for multi-node)
- [x] `AUTH_SKIP_EMAIL_CONFIRM` ignored in production
- [ ] Rotate demo passwords before shared staging
- [ ] Optional CAPTCHA / MFA for admin

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

> Read `@docs/REMAINING.md` §4 and move destination city covers to Supabase Storage + `locations.cover_image_url`.

> Read `@docs/REMAINING.md` §5 and finish Search Console verification + sitemap submit for SqftGo production.
