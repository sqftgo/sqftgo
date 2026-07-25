# SqftGo — remaining work

Last updated: **2026-07-25**  
Phases **1–14** shipped on `main`. Phase **15** covers cleanup + Dream Project inspiration uploads + notification pref persistence.

Auth-specific checklist: see also [`AUTH_REMAINING.md`](./AUTH_REMAINING.md).

---

## Deferred product features (do not start until prioritized)

### 1. Google / social Sign-In + Sign-Up

**Today:** Login page Google button is a stub (`"Google Sign-In is not configured yet."`).

**To ship:**

1. Supabase Dashboard → Authentication → Providers → enable **Google** (client ID/secret from Google Cloud Console).
2. Add redirect URLs: `https://YOUR_DOMAIN/auth/callback` and localhost for local.
3. Wire login + signup UI to `supabase.auth.signInWithOAuth({ provider: "google" })` (cookie SSR path).
4. Ensure `handle_new_user` / profiles trigger still creates `profiles` row for OAuth users (name/email from metadata).
5. Harsh tests: OAuth happy path, cancel, existing email link, middleware role routing.

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

**Billing module:** still deferred (subscription page remains honesty-disabled)

---

## Resume prompts

> Read `@docs/REMAINING.md` and implement **Google OAuth** sign-in/sign-up end-to-end with harsh tests.

> Harden **max_listings_per_dealer** / `require_listing_approval` enforcement in property create APIs.

> Add signed-URL viewing of KYC documents in admin review UI.
