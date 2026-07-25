# Phase 11 — Amenities (production wiring)

**Status:** Implemented (2026-07-25)  
**Depends on:** Auth / profiles; Phase 1 properties (`amenities text[]`)  
**Out of scope:** Reviews UI, Dream Project files, dealer KYC/avatars, FK from properties to amenities

---

## Goals

1. `amenities` table + RLS (active public read; service-role writes).
2. Admin CRUD APIs; seed from admin defaults + form constants.
3. AppContext + `/admin/amenities` persist.
4. PropertyForm, PostPropertyWizard, FilterPanel use live active amenities.
5. Harsh auth/role tests.

---

## API

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/amenities` | public (`?all=1` admin) |
| POST | `/api/amenities` | admin |
| PATCH/DELETE | `/api/amenities/[id]` | admin |

---

## Test plan

- [x] Migration + seed + RLS  
- [x] Public active-only GET  
- [x] Unauth/broker write blocked  
- [x] Admin CRUD  
- [x] Zod validation  
- [x] Security advisor clean of critical amenities issues  
