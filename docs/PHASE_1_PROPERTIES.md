# Phase 1 — Properties (production wiring)

**Status:** ✅ Implemented & verified (2026-07-25)  
**Depends on:** Auth / `profiles` (done)  
**Out of scope this phase:** inquiries, dealers directory, categories/locations CRUD, notifications, messaging, Storage uploads, Google OAuth, Zod across all domains

---

## Product context (short)

SqftGo is a Rajasthan real-estate marketplace with three portals:

| Role | Portal | Needs from Phase 1 |
|------|--------|--------------------|
| `user` | Public browse | List + detail of **Active** properties |
| `broker` (seller) | Dealer dashboard | Create/edit/delete **own** listings |
| `admin` | Admin panel | List all, approve/reject status, delete any |

Today only **auth/profiles** hit Supabase. Properties (and everything else) still use `src/services/store.ts` + `@/data` mocks.

---

## Why Phase 1 = Properties

1. Highest product value — homepage, `/listings`, `/property/[id]`, dealer add/edit, admin properties/approvals all depend on it.
2. Clean vertical slice — one table family, clear RLS by role, existing `PropertyRepository` interface.
3. Unblocks later phases (inquiries need `property_id` FK).
4. Auth is already stable — we can attach `owner_id → profiles.id`.

---

## Current state (properties)

| Layer | Today |
|-------|--------|
| Data | In-memory `getStore().properties` seeded from `@/data` |
| Service | `src/services/properties.ts` → `mockPropertyRepository` |
| API | None under `/api/properties` |
| DB | No `properties` table |
| UI | AppContext → `propertyService` / local store mutations |

---

## Phase 1 goals (done = shippable)

1. **Postgres schema** for properties with enums matching app types (or check constraints).
2. **RLS** that is production-correct (not “open for authenticated”).
3. **Next.js route handlers** as the only write path from the browser (service role never in client).
4. **Replace mock `propertyService`** with API-backed repository (same `PropertyRepository` interface).
5. **Wire UI** so public / broker / admin read/write real data (no dual mock fallback for properties).
6. **Input validation** with Zod on create/update APIs.
7. **Seed** a small set of Active + Pending Review rows for demos (linked to existing broker/admin profiles).
8. **Verify** with HTTP + Supabase MCP (counts, RLS, role smoke tests).

**Images in Phase 1:** keep `images text[]` as **HTTPS URLs** (same as today’s mock). Supabase Storage upload is a later phase — not a temp hack; URL arrays are a valid v1 design.

---

## Data model

### Table `public.properties`

| Column | Type | Notes |
|--------|------|--------|
| `id` | `uuid` PK | `gen_random_uuid()` |
| `owner_id` | `uuid` NOT NULL FK → `profiles(id)` ON DELETE CASCADE | Listing owner (broker) |
| `title` | `text` NOT NULL | |
| `price` | `numeric` NOT NULL CHECK ≥ 0 | |
| `type` | `property_type` enum | Align with UI union |
| `purpose` | `property_purpose` enum | `buy` \| `sell` \| `rent` \| `lease` |
| `bhk`, `bathrooms`, `parking`, `year_built` | nullable ints | |
| `city`, `locality` | `text` NOT NULL | |
| `state`, `country` | `text` nullable | defaults OK |
| `size` | `numeric` NOT NULL | sqft |
| `furnished` | `furnished_status` enum | |
| `description` | `text` NOT NULL | |
| `amenities` | `text[]` NOT NULL DEFAULT `{}` | |
| `images` | `text[]` NOT NULL DEFAULT `{}` | URL list |
| `video_url` | `text` nullable | |
| `owner_name`, `owner_phone` | `text` NOT NULL | Denormalized display (from profile at create) |
| `owner_email` | `text` nullable | |
| `inquiry_count` | `int` NOT NULL DEFAULT 0 | Updated in inquiries phase |
| `status` | `property_status` enum | `draft` \| `pending_review` \| `active` \| `sold` \| `rented` |
| `featured` | `boolean` NOT NULL DEFAULT false | Admin-only to set true (enforce in API) |
| `rera_approved`, `rera_id`, `verified_date` | optional | |
| `seo_title`, `seo_description` | optional | |
| `verification_checks` | `jsonb` nullable | |
| `price_breakdown` | `jsonb` nullable | |
| `created_at`, `updated_at` | `timestamptz` | trigger on update |

**API ↔ UI mapping:** DB uses snake_case + lowercase status enums; mapper converts to existing `Property` camelCase / display labels (`Pending Review`, etc.) so pages don’t need a big rewrite.

### Indexes

- `(status)`, `(city)`, `(owner_id)`, `(purpose)`, `(featured)` where useful  
- Optional: `gin` on amenities later — skip for Phase 1

---

## RLS (production rules)

| Who | SELECT | INSERT | UPDATE | DELETE |
|-----|--------|--------|--------|--------|
| `anon` / public | Rows with `status = 'active'` only | — | — | — |
| Authenticated `user` | Same as public (+ own? no ownership) | — | — | — |
| `broker` | Active **or** `owner_id = auth.uid()` | Own row only; status limited to `draft` / `pending_review` | Own row; cannot set `status` to `active`/`sold`/`rented` or `featured=true` without admin | Own only |
| `admin` | All | Optional | All fields including status/featured | All |

Implementation approach:

- Helper SQL: `public.is_admin()`, `public.is_broker()` (security definer, `search_path = public`) reading `profiles.role`.
- No client INSERT of arbitrary `owner_id` — API sets `owner_id` from session.
- Prefer **API + service role for admin status changes** *or* RLS that allows admin update — pick **RLS + authenticated client where possible**, service role only when needed (same pattern as auth admin users). Prefer: broker uses user-scoped client; admin status changes use service role after `authenticateApiRequest` proves admin (clear audit path).

---

## API surface

| Method | Path | Auth | Behavior |
|--------|------|------|----------|
| `GET` | `/api/properties` | Public | List; query filters: city, type, purpose, minPrice, maxPrice, status, featured, search, owner (self for broker). Default public filter: `status=active` unless admin/broker requesting own/all. |
| `GET` | `/api/properties/[id]` | Public | Active for public; owner/admin can see non-active |
| `POST` | `/api/properties` | Broker or admin | Create; Zod validate; force `owner_id` from session; default status `pending_review` |
| `PATCH` | `/api/properties/[id]` | Owner broker or admin | Update; brokers cannot self-approve to `active` |
| `DELETE` | `/api/properties/[id]` | Owner broker or admin | Hard delete Phase 1 (soft-delete later if needed) |

Shared:

- `authenticateApiRequest` for writes  
- Zod schemas in e.g. `src/lib/validation/property.ts`  
- Map DB row ↔ `Property` in `src/lib/mappers/property.ts`  
- Consistent `{ error }` JSON errors  

---

## App wiring

1. Implement `supabasePropertyRepository` (fetch `/api/properties…`) implementing `PropertyRepository`.
2. Export `propertyService = supabasePropertyRepository` (remove mock as default for properties).
3. AppContext: property list/create/update/delete go through `propertyService` (async); drop in-memory property mutations as source of truth.
4. Keep favorites/compare in local UI prefs (already non-auth) — they reference property ids that now exist in DB.
5. Dealer add-property + admin approvals pages must await API and refresh list (no silent mock).

---

## Migration + seed

- New migration file under `supabase/migrations/` (timestamped).
- Apply via Supabase MCP `apply_migration` on project `iwldglorfloyupayvmxd` **and** keep file in git.
- Seed 3–5 properties: at least 2 `active` (public), 1 `pending_review` owned by `broker@sqftgo.com` profile id.
- Update `src/types/database.ts` for `properties` table types.
- Update `docs/AUTH_REMAINING.md` style checklist or add “Phase 1 complete” note here when done.

---

## Explicitly NOT in Phase 1

- Property inquiries / assistance / reviews tables  
- Dealer directory profiles table  
- Categories / locations admin CRUD in DB  
- Supabase Storage for image upload  
- Full-text search (simple `ilike` is enough)  
- Soft deletes / audit log table  
- Renaming `broker` → `seller` in DB (UI can say Seller; role stays `broker`)

---

## Test plan (must pass before Phase 2)

- [x] Migration applied; MCP `list_tables` shows `properties` + RLS on  
- [x] `GET /api/properties` (no cookie) returns only `active`  
- [x] Broker login → `POST` creates `pending_review` with their `owner_id`  
- [x] Broker cannot `PATCH` status to `active`  
- [x] Admin can `PATCH` status to `active`  
- [x] Public `/listings` and `/property/[id]` show seeded Active rows  
- [x] Dealer dashboard lists only that broker’s rows (plus filters)  
- [x] Admin properties/approvals see pending + can approve  
- [x] User cannot `POST /api/properties` (403)  
- [x] Invalid body fails Zod with 400 (no crash)  
- [x] Security advisor: no new critical RLS gaps on `properties` (only deferred HaveIBeenPwned / Pro)

---

## Implementation order (when approved)

1. Zod dependency + property schemas  
2. SQL migration (enums, table, indexes, RLS helpers, policies) → apply MCP + commit file  
3. Mappers + `database.ts` types  
4. API routes  
5. `supabasePropertyRepository` + switch `propertyService`  
6. AppContext / pages touch-ups for async truth  
7. Seed  
8. Test checklist + fix any real gaps (no temp hacks)

---

## Sign-off criteria

Phase 1 is complete when public browse + broker CRUD + admin approve all run against Supabase with RLS verified, mock property store no longer used for properties, and the test plan above is green.

**Next phase (preview only):** Phase 2 — Property inquiries (FK to `properties` + submit form + dealer/admin inbox).
