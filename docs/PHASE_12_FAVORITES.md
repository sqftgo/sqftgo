# Phase 12 — Favorites (account sync)

**Status:** Implemented (2026-07-25)  
**Depends on:** Auth / profiles; Phase 1 properties  
**Out of scope:** Compare DB sync, reviews UI, profile avatar, dealer KYC, Dream Project uploads

---

## Why Phase 12

Favorites already power hearts on cards, Navbar badge, `/favorites`, and profile shortlist — but only `localStorage`. Logged-in users lose shortlists across devices/browsers.

---

## Goals

1. `user_favorites` table + own-row RLS (service-role BFF writes).
2. `GET/POST/DELETE /api/favorites` for authenticated users.
3. AppContext: guests stay local; logged-in hydrate + merge local → server on login; toggle hits API.
4. Harsh auth tests.

---

## API

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/favorites` | logged-in → `string[]` property ids |
| POST | `/api/favorites` | logged-in `{ propertyId }` add (idempotent) |
| DELETE | `/api/favorites/[propertyId]` | logged-in remove |

---

## Test plan

- [x] Migration + RLS  
- [x] Unauth GET/POST → 401  
- [x] User add / list / remove  
- [x] Cross-user isolation  
- [x] Zod / invalid uuid  
- [ ] Spot-check heart + `/favorites` after login  
