# Auth — remaining work & how to resume

Last verified: **2026-07-25**  
Project: `iwldglorfloyupayvmxd` (`https://iwldglorfloyupayvmxd.supabase.co`)  
App local: `http://localhost:3000`

Use this file when you come back later. It is the checklist for what’s left on authentication.

---

## Current verdict: **on the right track**

Live HTTP + Supabase checks on 2026-07-25 passed for core auth.

| Test | Result |
|------|--------|
| `GET /api/auth/me` (logged out) | 401 |
| Bad password login | 401 |
| Login `user@sqftgo.com` | 200, role `user` |
| User hits `/admin` | redirected to `/` (forbidden) |
| Login `broker@sqftgo.com` | 200 → `/dealer/dashboard` OK |
| Broker hits `/admin` | redirected to `/` |
| Login `admin@sqftgo.com` | 200 → `/admin` OK |
| Logout then `/api/auth/me` | 401 |
| Supabase users ↔ profiles | 4 / 4, 0 orphans |
| RLS + role/single-admin triggers | present |
| `pnpm auth:verify` service + demo login | PASS |

Notes from testing:

- Middleware role lookup must use service role after `getUser()` (fixed) — Edge + RLS alone was bouncing valid sessions to `/login`.
- Supabase rejects some domains (e.g. `example.com`) as `email_address_invalid`.
- Free-tier **email rate limit** can block signup/verify temporarily (`email rate limit exceeded`). Wait a few minutes or use dashboard to confirm users.

---

## Already done

- [x] Supabase cookie sessions (`@supabase/ssr` + `getUser()`)
- [x] Profiles table + RLS (own or admin select/update)
- [x] Role protect + single-admin triggers
- [x] Overbroad table grants revoked (`authenticated` SELECT/UPDATE only)
- [x] Signup confirm-email path (prod-style)
- [x] Middleware guards for `/admin` and `/dealer/dashboard`
- [x] Fail-closed middleware when auth env missing in production
- [x] No auth identity in `localStorage` (UI prefs only)
- [x] Demo passwords removed from client bundle
- [x] Dealer register no longer fakes `broker` role client-side
- [x] Logout clears Supabase cookies (Navbar / profile)
- [x] Supabase MCP for this project (`.cursor/mcp.json`)

---

## Remaining (do later)

### 1. Leaked password protection — **needs Supabase Pro**

Skipped on Free plan. Do this after upgrade:

1. Open: https://supabase.com/dashboard/project/iwldglorfloyupayvmxd/auth/providers?provider=Email  
2. Under Email / Password security → enable **Prevent the use of leaked passwords** (HaveIBeenPwned).  
3. Optional: stronger min length / required character classes.  
4. Save.  
5. In Cursor with Supabase MCP: `get_advisors` type `security` — warning `auth_leaked_password_protection` should clear.

Docs: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

### 2. Production site URL + redirect allowlist

Before real deploy:

- [ ] Set `NEXT_PUBLIC_SITE_URL` to the live domain (no trailing slash)
- [ ] Supabase → Authentication → URL configuration:
  - Site URL = production origin
  - Redirect URLs include `https://YOUR_DOMAIN/auth/callback` (and localhost for local)
- [ ] Confirm email templates point at the right domain

### 3. App-level rate limiting

- [ ] Throttle `/api/auth/login`, `/signup`, `/forgot-password` (e.g. Upstash) for public internet

### 4. Google / social Sign-In

- [ ] Login UI Google button is still a stub — wire OAuth when ready

### 5. Demo / seed hygiene

- [ ] Change or remove demo passwords before shared/staging deploy  
- [ ] Prefer `.env.local` (gitignored)  
- [ ] Never commit `SUPABASE_SERVICE_ROLE_KEY`

Local demo (dev only):

| Email | Password | Role |
|-------|----------|------|
| `user@sqftgo.com` | `user2026` | user |
| `broker@sqftgo.com` | `broker2026` | broker |
| `admin@sqftgo.com` | `admin2026` | admin (not on login UI) |

### 6. Optional hardening

- [ ] CAPTCHA (Supabase Bot Detection)
- [ ] MFA for admin
- [ ] Stronger password rules once on Pro

---

## How to re-test quickly

```bash
pnpm dev
pnpm auth:verify
```

Browser smoke:

1. Login as user → `/admin` should bounce home  
2. Login as broker → `/dealer/dashboard` works  
3. Login as admin → `/admin` works  
4. Sign out → session gone  
5. Sign up (use a real-looking domain, not `example.com`) → confirm-email or rate-limit wait

Resume prompt for a new chat:

> Read `@docs/AUTH_REMAINING.md` and continue auth production hardening. Start with unchecked items. Use Supabase MCP project `iwldglorfloyupayvmxd`.

---

## Key code paths

| Area | Path |
|------|------|
| Middleware / route guards | `src/lib/supabase/middleware.ts` |
| Auth APIs | `src/app/api/auth/**` |
| Auth callback | `src/app/auth/callback/route.ts` |
| Admin user APIs | `src/app/api/admin/users/**` |
| Migrations | `supabase/migrations/**` |
| Env template | `.env.example` |
| Verify script | `scripts/verify-auth-prod.mjs` (`pnpm auth:verify`) |
