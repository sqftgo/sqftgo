# Phase 9 — Categories & Locations (production wiring)

**Status:** Implemented (2026-07-25)  
**Depends on:** Auth / profiles; Phase 1 properties (counts by type/city)  
**Out of scope:** Activity logs, reviews, amenities admin, FK from properties to taxonomy

---

## Goals

1. `categories` + `locations` tables + RLS.
2. Public GET (active); admin CRUD via service-role APIs.
3. Seed from existing mock catalog (+ Commercial Space).
4. AppContext loads live taxonomy; admin pages persist via API.
5. `FilterPanel` city/type options from active catalog.
6. Harsh auth/role tests.

---

## API

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/categories` | public (`?all=1` admin) |
| POST | `/api/categories` | admin |
| PATCH/DELETE | `/api/categories/[id]` | admin |
| GET | `/api/locations` | public (`?all=1` admin) |
| POST | `/api/locations` | admin |
| PATCH/DELETE | `/api/locations/[id]` | admin |

---

## Test plan

- [x] Migration + seed + RLS  
- [x] Public GET active only  
- [x] Unauth POST → 401; non-admin → 403  
- [x] Admin CRUD + toggle  
- [x] FilterPanel uses live options  
- [x] Security advisor: no critical catalog issues  
