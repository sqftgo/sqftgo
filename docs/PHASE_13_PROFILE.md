# Phase 13 — Profile self-update + avatar

**Status:** Implemented (2026-07-25)  
**Depends on:** Auth / profiles; Phase 5 Storage pattern  
**Out of scope:** Dealer KYC docs, dealer firm logos, Google OAuth, email change

---

## Why Phase 13

`/profile/edit` looked real but only mutated in-memory `userName`. `profiles` already has `phone` / `bio` / `avatar_url`; city was missing.

---

## Goals

1. Add `profiles.city`; Storage bucket `avatars` (public read, 5MB images).
2. `PATCH /api/auth/me` — own-row updates (name, phone, bio, city, avatarUrl).
3. `POST /api/uploads/avatar` — any authenticated non-suspended user.
4. Wire `/profile/edit` + show avatar/bio/phone/city on `/profile`.
5. Harsh auth tests.

---

## API

| Method | Path | Auth |
|--------|------|------|
| PATCH | `/api/auth/me` | logged-in |
| POST | `/api/uploads/avatar` | logged-in (multipart `file`) |

---

## Test plan

- [x] Migration + avatars bucket  
- [x] Unauth PATCH/upload → 401  
- [x] User PATCH persists; GET reflects  
- [x] Zod validation  
- [x] Avatar upload → public URL; non-image rejected  
- [ ] Spot-check `/profile/edit` UI  
