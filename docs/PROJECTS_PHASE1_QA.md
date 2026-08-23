# Dealer Projects — Phase 1 QA checklist (production)

Ship scope: API + dealer dashboard only. **Do not** add home/user rail until Phase 2.

**Last run:** 2026-08-23 — `scripts/qa-projects-phase1.ps1` → **30/30 PASS**  
**Migration:** `create_projects` applied via Supabase MCP  
**Bug fixed during QA:** Zod v4 crash — `projectUpdateSchema` cannot `.partial()` a refined schema (split base object + refine).

## Auth / roles
- [x] Anon GET `/api/projects` → only Active
- [x] Anon POST/PATCH/DELETE → 401
- [x] User (role=user) POST → 403
- [ ] Suspended broker → 403 on write *(not mutated in automated run)*
- [x] Broker create with status Active / Sold / featured → 403
- [x] Broker PATCH other owner's project → 403 *(user token vs broker-owned)*
- [x] Broker PATCH featured=true or rejectionReason → 403
- [x] Broker DELETE Active → 403 (UI hides Delete)
- [x] Broker create Draft without images → OK
- [x] Broker create/submit Pending Review without images → 400
- [x] Admin can set Active / featured / reject with reason

## Ownership / data
- [x] `mine=1` returns only caller `owner_id`
- [x] Cannot reassign `owner_id` via PATCH body
- [x] City must be an active platform city
- [x] priceTo < priceFrom / sizeTo < sizeFrom → 400
- [ ] Listing cap (`max_listings_per_dealer`) counts projects (non-rejected) *(not force-hit in automated run)*

## Dealer UI
- [x] Nav: My Projects / Add Project / Drafts filter *(routes present; auth redirects when logged out)*
- [x] Create → list refresh; Edit only own; Access denied on foreign id *(API ownership covered)*
- [x] Submit / To Draft / Delete (non-Active) work *(API)*
- [x] Rejected shows reason *(API returns rejectionReason)*

## Admin (required for Active)
- [x] `/admin/projects` lists non-draft projects *(page shipped)*
- [x] Approve → Active; Reject requires reason; Feature toggles
- [x] Dealer sees rejection reason and can resubmit Pending Review

## Migration
- [x] Apply `20260823120000_create_projects.sql` / MCP `create_projects`
- [x] Confirm RLS: anon cannot write; Active delete blocked for brokers (BFF)

## Out of scope (Phase 2)
- Home screen “Dealer projects” rail
- Public project detail page polish / property↔project linking UI
