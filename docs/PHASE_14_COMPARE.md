# Phase 14 — Compare UX (wire the existing shortlist)

**Status:** Implemented (2026-07-25)  
**Depends on:** Phase 1 properties (local UI prefs already store `compareList`)  
**Out of scope:** Server-side compare sync, reviews, dealer KYC

---

## Why Phase 14

`/compare` and `toggleCompare` already existed, but listing cards and property detail never called them — the empty state lied about a “compare icon.”

---

## Goals

1. Compare toggle on `PropertyCard` + property detail (max 4, FIFO when full).
2. Navbar compare entry with count badge.
3. Sticky “Compare (n)” bar when 2+ selected.
4. Compare page amenity rows from the union of selected property amenities (fallback static list).
5. Remove broken `mockCatalogRepository` export + dead catalog notification mock methods.
6. Smoke: `/compare` + prefs persistence.

---

## Test plan

- [x] `/compare` returns 200  
- [x] Broken `mockCatalogRepository` export removed  
- [ ] Spot-check: add from card → navbar count → `/compare` table  
- [ ] Cap at 4 (oldest drops when adding a 5th)  
