# Phase 5 — Supabase Storage uploads (property images)

**Status:** Implemented (2026-07-25)  
**Depends on:** Phase 1 Properties (`images text[]` URL contract); Auth / profiles  
**Out of scope this phase:** Reviews, catalog CRUD, notifications, messaging/visits, Dream Project file uploads, image CDN/moderation

---

## Why Phase 5

1. Brokers still cannot put real photos on listings — wizards used mock Unsplash / “upload simulated.”
2. Completes the Phase 1 listing loop with owner-owned media.
3. Highest production-value gap remaining after marketplace + leads.

---

## Goals

1. Storage bucket `property-images` (public read, 5MB, image MIME types).
2. `POST /api/uploads/property-image` — broker/admin only; service-role upload; returns public HTTPS URL.
3. Wire `PostPropertyWizard` + `PropertyForm` real file picker → URL array → existing property APIs.
4. Keep manual URL add as fallback.
5. Verify upload + list on property detail; security advisor clean of critical Storage gaps.

---

## Storage model

| Bucket | Public | Path | Limit |
|--------|--------|------|-------|
| `property-images` | Yes (read) | `{owner_id}/{uuid}.{ext}` | 5MB; jpeg/png/webp/gif |

Writes only via Next.js service role after auth (same BFF pattern as leads).

---

## Explicitly NOT in Phase 5

- Reviews  
- Categories / locations DB  
- Notifications / messaging / visits  
- Dream Project inspiration uploads  
- Dealer avatar / KYC docs  

---

## Test plan

- [x] Bucket exists  
- [x] Broker upload → public URL  
- [x] Anon / non-broker upload → 401/403  
- [x] Reject oversized / non-image  
- [x] Wizard & form wired for real uploads  
- [x] Security advisor: no Storage listing WARN (public URL still works)  

---

## Next phase (preview)

Phase 6 — Notifications **or** site visits (FK → properties) — pick by product priority.
