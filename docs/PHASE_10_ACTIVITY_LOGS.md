# Phase 10 — Activity Logs (production wiring)

**Status:** Implemented (2026-07-25)  
**Depends on:** Auth / profiles  
**Out of scope:** Reviews, amenities, Dream Project files, log purge, server-side domain auto-logging

---

## Goals

1. `activity_logs` table (immutable audit) + RLS / service-role APIs.
2. `GET /api/logs` admin-only; `POST /api/logs` admin/broker.
3. AppContext loads logs for admin; `addLog` persists via API.
4. Admin `/admin/logs` + dashboard recent activity use live data.
5. Harsh auth/role tests.

---

## API

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/logs` | admin |
| POST | `/api/logs` | admin or broker |

---

## Test plan

- [x] Migration + seed  
- [x] Unauth GET/POST → 401  
- [x] Non-admin GET → 403  
- [x] Admin/broker POST → 201  
- [x] Zod validation  
- [x] Security advisor clean of critical log issues  
