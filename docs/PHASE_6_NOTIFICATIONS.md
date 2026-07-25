# Phase 6 — Notifications (production wiring)

**Status:** Implemented (2026-07-25)  
**Depends on:** Auth / profiles; Phase 1 properties; Phase 2 inquiries  
**Out of scope:** Email/SMS, preference persistence, Realtime push, public buyer inbox UI, payments alerts

---

## Goals

1. `notifications` table + RLS (recipient/admin).
2. APIs: list, mark read, mark all read, delete.
3. AppContext loads live notifications; admin/dealer pages use API (no mock store writes).
4. Event hooks: inquiry → owner broker; property pending → admins; property approved/rejected → owner.
5. Harsh HTTP + auth/role tests; no critical advisor issues.

---

## Data model

| Column | Type |
|--------|------|
| id | uuid PK |
| user_id | uuid FK → profiles (recipient) |
| for_role | user \| broker \| admin \| all |
| title, message | text |
| type | info \| success \| warning \| error |
| read | boolean |
| event_key | text nullable |
| entity_type, entity_id | text/uuid nullable |
| created_at, updated_at | timestamptz |

---

## API

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/notifications` | session |
| PATCH | `/api/notifications/[id]` | owner |
| DELETE | `/api/notifications/[id]` | owner |
| POST | `/api/notifications/mark-all-read` | session |

---

## Test plan

- [x] Migration + RLS  
- [x] Unauth GET → 401  
- [x] Broker/admin list own notifications only  
- [x] Mark read / mark all / delete own  
- [x] Inquiry creates broker notification  
- [x] Pending property notifies admins  
- [x] Approve notifies owner; draft-return notifies owner  
- [x] Cross-user mark/delete → 403  
- [x] Invalid/missing PATCH → 400/404  
- [x] Security advisor: no critical notification issues (HIBP warn only, pre-existing)  
