# Phase 3 — Dealer directory profiles (production wiring)

**Status:** Implemented (2026-07-25)  
**Depends on:** Auth / `profiles` (done); Phase 1 Properties (public profile → listings join)  
**Out of scope this phase:** Assistance requests, general enquiries, reviews, messaging/visits, subscription billing, Storage avatars, Dream Project persistence

---

## Why Phase 3 = Dealer directory

1. Highest remaining marketplace value — `/dealers`, dealer detail, homepage sellers, admin dealers still read mock `directoryProfiles`.
2. Completes Phase 1–2 loop: discover broker → Active listings → property inquiry.
3. Clean vertical — one table, existing `DealerRepository` / UI surfaces.

---

## Current state (before)

| Layer | Today |
|-------|--------|
| Data | In-memory `getStore().directoryProfiles` from `@/data/directory` |
| Service | `src/services/dealers.ts` → mock |
| API | None |
| DB | No `directory_profiles` table |

---

## Goals

1. Postgres `directory_profiles` + category enum + RLS.
2. Optional FK `user_id → profiles(id)` (unique) for linked accounts.
3. Next.js `/api/dealers` + Zod; service-role writes after auth.
4. Replace mock dealer repository for profile CRUD (messages/visits stay mock).
5. Wire AppContext load + create/update/delete; dealer profile save; admin remove; register/services register.
6. Seed linked `broker@sqftgo.com` + a few public samples.
7. Verify HTTP + Supabase MCP.

---

## Data model

### Table `public.directory_profiles`

| Column | Type | Notes |
|--------|------|--------|
| `id` | uuid PK | |
| `user_id` | uuid unique nullable FK → profiles | Linked auth user |
| `firm_name`, `owner_name` | text | |
| `category` | `directory_category` enum | Matches UI union |
| `city`, `address`, `email`, `website`, `mobile`, `description` | text | |
| `rera_id`, `experience` | text nullable | |
| `specialties` | text[] | default `{}` |
| `team_size`, `listings_count` | int nullable / default 0 | |
| `created_at`, `updated_at` | timestamptz | |

Unique index on `lower(email)`.

### RLS

| Who | SELECT | INSERT | UPDATE | DELETE |
|-----|--------|--------|--------|--------|
| anon / public | Yes (directory is public) | — | — | — |
| authenticated | Yes | Own row (`user_id = auth.uid()`) | Own row | — |
| admin | Yes | Yes | Yes | Yes |

Writes from Next API use service role after `authenticateApiRequest` (same pattern as properties/inquiries).

---

## API surface

| Method | Path | Auth | Behavior |
|--------|------|------|----------|
| GET | `/api/dealers` | Public | List; filters `city`, `category`, `search` |
| POST | `/api/dealers` | Authenticated | Create; links `user_id`; one profile per user |
| GET | `/api/dealers/[id]` | Public | Detail |
| PATCH | `/api/dealers/[id]` | Owner or admin | Update |
| DELETE | `/api/dealers/[id]` | Admin | Remove |

---

## Explicitly NOT in Phase 3

- Assistance / general enquiries / reviews  
- Dream Project persistence  
- Dealer reply messaging / visits  
- Expanding `profiles` instead of a dedicated directory table  

---

## Test plan

- [x] Migration applied; table + RLS on  
- [x] Public GET list/detail → 200  
- [x] Anon POST → 401  
- [x] Authenticated create → 201; second create for same user → 409  
- [x] Broker/owner PATCH own profile → 200  
- [x] Non-owner PATCH → 403  
- [x] Admin DELETE → 200  
- [x] Zod rejects invalid payload  
- [x] Security advisor: no critical new issues on `directory_profiles`  

---

## Next phase (preview)

Phase 4 — Assistance / general enquiries (wire Dream Project + admin inbox; reviews later).
