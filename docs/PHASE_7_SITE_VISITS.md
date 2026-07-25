# Phase 7 — Site Visits (production wiring)

**Status:** Implemented (2026-07-25)  
**Depends on:** Phase 1 properties; Phase 6 notifications  
**Out of scope:** Calendar sync, SMS/email, slot inventory, admin visits console, messaging threads

---

## Goals

1. `site_visits` table + RLS.
2. APIs: book tour, list (buyer/broker/admin), cancel / confirm / reschedule / complete.
3. `VisitBookingForm` on property detail (Book Tour create path).
4. Wire `/my-visits` + dealer dashboard upcoming visits + UserDropdown link.
5. Notify broker on create; notify buyer on confirm; notify other party on cancel/reschedule.
6. Harsh HTTP + auth/role tests.

---

## Status map

| DB | UI |
|----|-----|
| pending | Pending Approval |
| confirmed | Confirmed |
| completed | Completed |
| cancelled | Cancelled |

---

## API

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/properties/[id]/visits` | public (active listing) |
| GET | `/api/visits` | session |
| PATCH | `/api/visits/[id]` | buyer (own cancel/reschedule) or owner/admin |

---

## Test plan

- [x] Migration + RLS  
- [x] Unauth list → 401  
- [x] Book on active listing → 201 + broker notified  
- [x] Non-active book → 400  
- [x] Buyer sees own on `/api/visits`  
- [x] Cancel / confirm / reschedule  
- [x] Cross-user complete → 403  
- [x] Security advisor: no critical visit issues (HIBP warn only)  
