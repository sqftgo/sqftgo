# Phase 4 — Assistance & general enquiries (production wiring)

**Status:** Implemented (2026-07-25)  
**Depends on:** Auth / `profiles` (done)  
**Out of scope this phase:** Customer reviews, email/SMS notify, file uploads / Storage, dealer assignment workflows

---

## Why Phase 4

1. Dream Project FAB still `alert()`s — highest-visibility unfinished lead capture.
2. Admin reports already expect `enquiries`; assistance types exist but never hit a DB.
3. Independent of properties/dealers FKs — clean lead vertical after marketplace core (Phases 1–3).

---

## Goals

1. Tables `assistance_requests` + `general_enquiries` with production RLS.
2. Public can INSERT (no PII SELECT for anon); admin can SELECT/UPDATE/DELETE.
3. APIs + Zod; Dream Project submits real `general_enquiries` (payload JSON for wizard extras).
4. AppContext loads leads for admin; reviews stay mock.
5. Seed 1 assistance + 1 enquiry; verify HTTP + MCP.

---

## Data model

### `assistance_requests`
Matches `AssistanceRequest`: name, email, phone, budget, areas[], bhk, family_size, move_in_date, notes, status enum.

### `general_enquiries`
Matches `GeneralEnquiry` + optional `payload jsonb` for Dream Project wizard fields (amenities, features, etc.). Contact required on submit.

### RLS
| Who | SELECT | INSERT | UPDATE | DELETE |
|-----|--------|--------|--------|--------|
| anon | — | Yes | — | — |
| authenticated (non-admin) | Own email match (optional) | Yes | — | — |
| admin | All | Yes | Yes | Yes |

---

## API

| Method | Path | Auth | Behavior |
|--------|------|------|----------|
| POST | `/api/assistance` | Public | Create assistance request |
| GET | `/api/assistance` | Admin | List |
| PATCH/DELETE | `/api/assistance/[id]` | Admin | Status / remove |
| POST | `/api/enquiries` | Public | Create general / dream enquiry |
| GET | `/api/enquiries` | Admin | List |
| DELETE | `/api/enquiries/[id]` | Admin | Remove |

---

## Explicitly NOT in Phase 4

- Reviews table  
- Inspiration file uploads  
- Email notify admin  
- Assign assistance to a broker  

---

## Test plan

- [x] Migration + RLS  
- [x] Public POST assistance / enquiry → 201  
- [x] Anon GET → 401  
- [x] Admin GET lists  
- [x] Zod rejects invalid  
- [x] Dream Project submit persists  
- [x] Security advisor: no critical new issues (insert WARN cleared via service-role-only writes)  

---

## Next phase (preview)

Phase 5 — Reviews **or** Storage uploads / messaging — pick by product priority.
