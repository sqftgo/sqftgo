# Phase 15 — Cleanup + Dream inspiration + notif prefs

**Status:** Implemented (2026-07-25)  
**Out of scope (documented in `docs/REMAINING.md`):** Google OAuth, Dealer KYC, Reviews product UI

---

## Goals

1. Slim client `store` to admin user cache only; rename `mockUsers` → `adminUsers`.
2. Remove dead customer-reviews mock path (no UI).
3. Persist admin/dealer notification preference toggles in localStorage.
4. Dream Project inspiration uploads (`dream-inspiration` bucket) + live amenity chips.
5. Document Google signup + KYC as remaining work.

---

## Test plan

- [x] Store no longer seeds reviews/messages/visits/properties  
- [x] Admin pages use `adminUsers`  
- [x] Notif prefs storage key wired  
- [x] Dream inspiration upload API (auth required)  
- [ ] Spot-check Dream Project attach photos while logged in  
