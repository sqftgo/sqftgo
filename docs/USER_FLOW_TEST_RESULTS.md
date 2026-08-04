# User flow E2E test results

Harsh buyer/user validation against live Next BFF + Supabase.

- **When:** 2026-08-04 (IST evening run)
- **Base URL:** `http://localhost:3000`
- **Credentials:** `user@sqftgo.com` / `user2026` (+ broker for visit confirm)
- **Preflight:** `pnpm auth:verify` → service PASS, demo login OK
- **Commands:** `pnpm user-flow:verify` · `pnpm user-flow:verify:ui`

## Executive scorecard

| Layer | PASS | FAIL | KNOWN |
|-------|------|------|-------|
| API battery (auth, listings, favorites, inquiry, visits, profile, gates) | 32 | 0 | 1 |
| Browser-style UI pages (guest + buyer) | 18 | 0 | 1 |
| **Combined (unique concerns)** | **50** | **0** | **`/compare` missing** |

| Severity | Count |
|----------|-------|
| P0 | 0 |
| P1 | 0 |
| P2 | 0 |

**Verdict:** Buyer happy-path **PASS** end-to-end against backend. Core lead loop (inquire → visit → broker confirm → buyer sees Confirmed) works. Access control holds (buyer cannot create properties or hit admin APIs).

---

## Happy path E (buyer half) — result

| Step | Result |
|------|--------|
| Guest listings + property detail | PASS |
| Login as buyer | PASS |
| Favorite add/list/remove (API synced) | PASS |
| Submit inquiry → `/api/inquiries?mine=1` | PASS |
| Book visit → list Pending | PASS |
| Broker confirms → buyer sees Confirmed | PASS |
| Buyer cancels another visit | PASS |
| Profile PATCH persists | PASS |
| Logout → me 401 + `/my-inquiries` → login | PASS |

**Story result:** **Pass**

---

## Failures (ranked)

- None in this run.

---

## Known stubs confirmed

| Item | Evidence | Tracked as |
|------|----------|------------|
| `/compare` | HTTP 404 | Walkthrough §F / docs |
| Buyer messages UI | Not in scope; no `/messages` for buyers | Product backlog |
| Buyer `/post-property` | Soft UI deny (“Only verified brokers…”) + API `POST /api/properties` → **403** | Expected |
| Forgot-password email delivery | Page loads; SMTP not re-tested this run | AUTH_REMAINING |
| Google login | Login HTML mentions Google (OAuth feature present on web) | Ops/config dependent |

---

## Observations (not failures)

1. **`/post-property` returns HTTP 200** for buyers with deny copy and client redirect messaging — not a middleware hard redirect. API still enforces 403 (good). Consider middleware redirect for cleaner UX.
2. **Demo profile bio/phone mutated** during test (`bio=E2E …`, phone `+91 90000 11122`). Re-seed or edit profile if you need clean demo data.
3. **E2E created real inquiry + visits** on property `3f7182d0-…` — fine for demo project; clean up in admin/broker UI if noisy.
4. **Signup prod-style** (from `auth:verify`): new emails need confirm when skip is off — local demo login still works.
5. **No Playwright:** UI checks are HTTP + HTML content / session cookies. Interactive clicks (heart animation, date picker UX) were not exercised in a real browser.

---

## Top fixes (priority)

1. No P0/P1/P2 from this battery.
2. Optional: add `/compare` or remove it from [`docs/USER_FLOW_WALKTHROUGH.md`](./USER_FLOW_WALKTHROUGH.md).
3. Optional: middleware-block `/post-property` for `role=user` (match API).
4. Optional: add Playwright for true click-path coverage.
5. Merge/deploy `fix/mobile-bearer-auth-session` if Expo needs `accessToken` (out of this buyer web pass).

---

## API battery detail

| ID | Status | Severity | Name | Detail |
|----|--------|----------|------|--------|
| `A-me-unauth` | PASS | — | Unauthed GET /api/auth/me → 401 |  |
| `A-bad-pw` | PASS | — | Bad password → 401 + error | Invalid email or password |
| `B-login` | PASS | — | Demo user login + cookies | role=user cookies=1 |
| `B-me` | PASS | — | GET /api/auth/me with session |  |
| `A-listings` | PASS | — | GET /api/properties has listings | id=3f7182d0-3074-4eb6-b500-7bbe21938d34 total=5 |
| `A-property` | PASS | — | GET /api/properties/[id] |  |
| `UI-home` | PASS | — | Page / | HTTP 200 |
| `UI-listings` | PASS | — | Page /listings | HTTP 200 |
| `UI-dealers` | PASS | — | Page /dealers | HTTP 200 |
| `UI-services` | PASS | — | Page /services | HTTP 200 |
| `UI-favorites` | PASS | — | Page /favorites | HTTP 200 |
| `UI-help` | PASS | — | Page /help | HTTP 200 |
| `UI-login` | PASS | — | Page /login | HTTP 200 |
| `UI-compare` | KNOWN | — | GET /compare (walkthrough) | route missing — documented stub |
| `UI-property` | PASS | — | Page /property/[id] | HTTP 200 |
| `B-fav-add` | PASS | — | POST /api/favorites | favorited |
| `B-fav-list` | PASS | — | GET /api/favorites includes id |  |
| `B-fav-del` | PASS | — | DELETE favorite + list empty of id |  |
| `B-inquiry` | PASS | — | POST property inquiry | created |
| `B-inquiry-mine` | PASS | — | GET /api/inquiries?mine=1 includes new |  |
| `B-visit` | PASS | — | POST book site visit | Pending Approval |
| `B-visit-list` | PASS | — | GET /api/visits includes booking |  |
| `E-broker-login` | PASS | — | Broker login for visit confirm |  |
| `E-visit-confirm` | PASS | — | Broker confirms visit | Confirmed |
| `E-buyer-sees-confirmed` | PASS | — | Buyer sees confirmed visit | confirmed |
| `B-visit-cancel` | PASS | — | Buyer cancels visit |  |
| `B-profile-patch` | PASS | — | PATCH profile persists |  |
| `B-no-create-property` | PASS | — | Buyer POST /api/properties denied | 403 |
| `B-no-admin` | PASS | — | Buyer GET /api/admin/users denied | 403 |
| `B-logout` | PASS | — | POST /api/auth/logout | 200 |
| `B-logout-me` | PASS | — | GET /api/auth/me after logout → 401 |  |
| `B-gate-my-inquiries` | PASS | — | Logged-out /my-inquiries → login |  |
| `B-enquiries` | PASS | — | POST /api/enquiries | 201 |

---

## Browser-style UI walkthrough detail

| ID | Status | Severity | Name | Detail |
|----|--------|----------|------|--------|
| `G-destinations` | PASS | — | Guest /destinations | HTTP 200 + content match |
| `G-privacy` | PASS | — | Guest /privacy | HTTP 200 + content match |
| `G-terms` | PASS | — | Guest /terms | HTTP 200 + content match |
| `G-hub` | PASS | — | Guest /hub | HTTP 200 + content match |
| `G-signup` | PASS | — | Guest /signup | redirect 307 → /login?tab=signup |
| `G-forgot` | PASS | — | Guest /forgot-password | HTTP 200 + content match |
| `G-google` | PASS | — | Login mentions Google | Google string present on login HTML |
| `G-profile-gate` | PASS | — | Guest /profile → login |  |
| `U-login` | PASS | — | Buyer session for UI |  |
| `U-profile` | PASS | — | Auth /profile |  |
| `U-profile-edit` | PASS | — | Auth /profile/edit |  |
| `U-settings` | PASS | — | Auth /settings |  |
| `U-my-inquiries` | PASS | — | Auth /my-inquiries |  |
| `U-my-visits` | PASS | — | Auth /my-visits |  |
| `U-favorites` | PASS | — | Auth /favorites |  |
| `U-post-property` | PASS | — | Buyer denied copy (no form fields) | HTTP 200 soft deny |
| `U-admin-gate` | PASS | — | Buyer /admin redirected | / |
| `U-fav-sync` | PASS | — | Favorites UI + API |  |
| `G-compare` | KNOWN | — | /compare missing | 404 |

---

## How to re-run

```bash
pnpm dev
pnpm auth:verify
pnpm user-flow:verify
pnpm user-flow:verify:ui
```

Optional against production (read carefully — writes create real inquiries/visits):

```bash
BASE_URL=https://www.sqftgo.com pnpm user-flow:verify
```
