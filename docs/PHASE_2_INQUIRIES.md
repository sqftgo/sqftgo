# Phase 2 — Property inquiries (production wiring)

**Status:** Implemented (2026-07-25)  
**Depends on:** Phase 1 Properties + Auth (`profiles`)  
**Out of scope this phase:** relocation assistance requests, general enquiries, reviews, email/SMS delivery, dealer “reply” messaging

---

## Why this phase

Property inquiries are the next vertical after listings: buyers contact owners from `/property/[id]` (`InquiryForm`), brokers manage them in the dealer inbox, admins see them in reports/analytics. They need a real `property_id` FK — which Phase 1 now provides.

---

## Current state

| Layer | Today |
|-------|--------|
| Data | In-memory `getStore().inquiries` keyed by property id |
| Service | `src/services/inquiries.ts` → mock |
| UI submit | `src/components/ui/InquiryForm.tsx` → `submitInquiry` |
| Broker inbox | `src/app/(dealer)/dealer/dashboard/inquiries/page.tsx` |
| Admin | Counts/lists via AppContext `inquiries` (reports/analytics) |
| DB | No `property_inquiries` table |

---

## Phase 2 goals

1. **`property_inquiries` table** with FK → `properties(id)` ON DELETE CASCADE.
2. **Production RLS** — public can insert on Active properties; brokers see/delete inquiries for their properties; admins see/delete all.
3. **APIs** with Zod validation (same pattern as properties).
4. **Replace mock inquiry paths** used by property inquiries (not assistance/enquiries/reviews yet).
5. **Keep `properties.inquiry_count` in sync** via DB trigger (no racey client increments).
6. **Wire UI** — InquiryForm, dealer inbox, AppContext, my-inquiries page.
7. **Verify** with HTTP + Supabase MCP.

---

## Data model

### Table `public.property_inquiries`

| Column | Type | Notes |
|--------|------|--------|
| `id` | `uuid` PK | `gen_random_uuid()` |
| `property_id` | `uuid` NOT NULL FK → `properties(id)` ON DELETE CASCADE | |
| `name` | `text` NOT NULL | |
| `email` | `text` NOT NULL | |
| `phone` | `text` NOT NULL | |
| `message` | `text` NOT NULL | |
| `status` | `inquiry_status` enum | `new` \| `read` \| `archived` (UI can map later; Phase 2 default `new`) |
| `created_at` | `timestamptz` | default `now()` |
| `updated_at` | `timestamptz` | trigger |

Indexes: `(property_id)`, `(created_at desc)`, `(status)`.

**UI mapping:** existing `PropertyInquiry` gains optional `id`; `date` maps from `created_at` (YYYY-MM-DD). AppContext can keep `Record<propertyId, PropertyInquiry[]>` built from API list for minimal page churn, or switch dealer page to a flat array — prefer flat list API + thin adapter.

### Counter sync

```sql
-- AFTER INSERT → inquiry_count + 1
-- AFTER DELETE → inquiry_count - 1 (floor 0)
```

Security definer trigger; revoke EXECUTE from anon/authenticated (trigger-only).

---

## RLS

| Who | SELECT | INSERT | UPDATE | DELETE |
|-----|--------|--------|--------|--------|
| `anon` / public user | — (no PII leak) | Yes, only if target property `status = 'active'` | — | — |
| Property owner (`broker`) | Inquiries on own properties | — | Own property inquiries (`status`) optional | Own property inquiries |
| `admin` | All | — | All | All |

Notes:

- Insert policy: `exists (select 1 from properties p where p.id = property_id and p.status = 'active')`.
- Select for broker: `exists (... properties.owner_id = auth.uid())`.
- No public/anon SELECT of inquiry rows (contact PII).
- Writes from Next API may use service role after validation (same as properties) while RLS remains defense-in-depth for direct clients.

---

## API surface

| Method | Path | Auth | Behavior |
|--------|------|------|----------|
| `POST` | `/api/properties/[id]/inquiries` | Public (optional session) | Zod validate; property must be Active; create inquiry |
| `GET` | `/api/properties/[id]/inquiries` | Owner broker or admin | List for one property |
| `GET` | `/api/inquiries` | Broker or admin | Broker: inquiries for owned properties; Admin: all. Query: `status`, `search` |
| `PATCH` | `/api/inquiries/[id]` | Owner or admin | Optional: mark `read` / `archived` |
| `DELETE` | `/api/inquiries/[id]` | Owner or admin | Remove inquiry |

Rate limiting: document as follow-up (same as auth); Phase 2 ships Zod + basic abuse guards (message max length, phone/email format).

---

## App wiring

1. `src/lib/validation/inquiry.ts` — Zod schemas  
2. `src/lib/mappers/inquiry.ts` — row ↔ UI  
3. Extend `src/types/database.ts`  
4. `supabaseInquiryRepository` for property-inquiry methods; leave assistance/enquiries/reviews on mock until later phases  
5. AppContext: `submitInquiry` / `deleteInquiry` / load inquiries when session ready (broker/admin) or on demand  
6. `InquiryForm` — await API errors  
7. Dealer inquiries page — use real ids (not array index) for delete  
8. Admin analytics/reports — continue reading from refreshed inquiries map  

---

## Explicitly NOT in Phase 2

- Assistance requests / general enquiries / reviews tables  
- Email notify owner on new inquiry  
- Real dealer reply thread (current UI fake-reply → dismiss can stay “dismiss/archive”)  
- CAPTCHA on public form  

---

## Test plan

- [x] Migration applied; table + RLS on  
- [x] Public `POST` inquiry on Active property → 201  
- [x] Public `POST` on Pending Review property → 400/404  
- [x] Public `GET /api/inquiries` → 401  
- [x] Broker sees only inquiries for own listings  
- [x] User (non-owner) cannot list another’s inquiries  
- [x] Admin lists all  
- [x] Delete decrements `properties.inquiry_count`  
- [x] Zod rejects empty/invalid payload  
- [x] Security advisor: no critical new issues on `property_inquiries`  

---

## Implementation order

1. SQL migration (+ apply via MCP)  
2. Zod + mappers + types  
3. API routes  
4. Service + AppContext  
5. UI touch-ups (InquiryForm, dealer inbox)  
6. Seed 1–2 sample inquiries on seeded Active properties  
7. Test checklist  

---

## Sign-off

Phase 2 complete when a buyer can submit an inquiry on an Active listing and the owning broker (and admin) see/delete it in real DB-backed UIs, with counter sync and RLS verified.

**Next phase (preview):** Phase 3 — Dealer directory profiles **or** Assistance / general enquiries (pick one vertical).
