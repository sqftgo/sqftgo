# Phase 8 — Messaging (production wiring)

**Status:** Implemented (2026-07-25)  
**Depends on:** Auth / profiles; Phase 6 notifications  
**Out of scope:** Realtime, email/SMS, attachments, buyer inbox page, replacing property inquiries

---

## Goals

1. `message_threads` + `messages` + `message_thread_reads` + RLS.
2. APIs: list/create threads, get thread + messages, reply, mark read / resolve.
3. Dealer inbox: Compose + Reply against live data.
4. Admin support: list + Reply & Resolve.
5. `notifyUser` on new messages to other participants.
6. Harsh auth/role tests.

---

## API

| Method | Path | Auth |
|--------|------|------|
| GET/POST | `/api/messages/threads` | session |
| GET/PATCH | `/api/messages/threads/[id]` | participant/admin |
| POST | `/api/messages/threads/[id]/messages` | participant/admin |

Compose accepts `participantEmail` (+ subject, body, optional kind/propertyId).

---

## Test plan

- [x] Migration + RLS  
- [x] Unauth list → 401  
- [x] Compose + reply + notify  
- [x] Non-participant → 403  
- [x] Resolve / mark read  
- [x] Zod validation  
- [x] Security advisor: no critical messaging issues  
