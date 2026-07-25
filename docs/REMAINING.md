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

**Today:** Dealer profile “KYC & RERA” tab is UI theater — “KYC Verified” always shown; PAN/Aadhaar/bank fields not persisted. Directory only has `rera_id` (and related firm fields).

**To ship (compliance-shaped):**

1. Private table (e.g. `dealer_kyc`) — **not** public `directory_profiles` — for PII + status (`pending` / `approved` / `rejected`).
2. Private Storage bucket for KYC docs (no public listing).
3. Dealer upload + save APIs; admin approve/reject with activity log.
4. Drive “KYC Verified” badge from real status; hide or soft-gate unverified dealers if product requires it.
5. Harsh tests: broker cannot approve self; admin-only review; docs not publicly listable.

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
- [ ] Production site URL + redirect allowlist
- [ ] Rate limit auth APIs
- [ ] Rotate demo passwords before shared staging
- [ ] Optional CAPTCHA / MFA for admin

---

## Resume prompts

> Read `@docs/REMAINING.md` and implement **Google OAuth** sign-in/sign-up end-to-end with harsh tests.

> Read `@docs/REMAINING.md` and implement **Dealer KYC** (private table + docs bucket + admin review).
