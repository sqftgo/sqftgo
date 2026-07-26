# SqftGo — User flow walkthrough & test checklist

Use this while clicking through the site at **`http://localhost:3000`**.  
Mark each box as you go. Failed / missing items → note under **Gaps** at the bottom (or file a phase).

**Last updated:** 2026-07-25

---

## Before you start

```bash
pnpm dev
```

| Role | Email | Password | Lands on |
|------|-------|----------|----------|
| Buyer / user | `user@sqftgo.com` | `user2026` | Home / public pages |
| Broker / dealer | `broker@sqftgo.com` | `broker2026` | `/dealer/dashboard` |
| Admin | `admin@sqftgo.com` | `admin2026` | `/admin` |

**Tips**

- Use a private window (or log out) between roles.
- Prefer a real-looking email domain for new signups (not `example.com` — Supabase rejects some).
- Email verification is **skipped in local/dev** (`AUTH_SKIP_EMAIL_CONFIRM`); forgot-password still needs SMTP / wait if rate-limited.
- Google Sign-In button is a **stub** — do not expect it to work yet.

Related: [`REMAINING.md`](./REMAINING.md) · [`AUTH_REMAINING.md`](./AUTH_REMAINING.md)

---

## Map: who does what

```text
GUEST ──browse──► Listings / Property / Dealers / Compare / Favorites (local)
  │
  ├── signup/login ──► USER
  │                      ├── inquire, book visit, favorites (synced), profile
  │                      ├── my inquiries / my visits / settings
  │                      └── post-property / hub / dream flows (as built)
  │
  └── dealer register ──► USER (pending broker) ──admin approve──► BROKER
                                                                   ├── listings CRUD
                                                                   ├── inquiries / visits / messages
                                                                   └── directory profile

ADMIN ── catalog (categories, locations, amenities)
      ├── approve properties / users / dealers
      └── ops (logs, reports, settings)
```

---

## A. Guest (not logged in)

Walk the public site as a first-time visitor.

### A1. Discover & search

- [ ] Open `/` — hero, city search, buy/rent tabs load without console errors
- [ ] Search from home (city + type/budget) → lands on `/listings` with filters applied
- [ ] Open `/listings` — filters (city, type, purpose, amenities, price) change results
- [ ] Open `/destinations` — cities/destinations UI works
- [ ] Open a listing → `/property/[id]` — gallery, price, amenities, owner/contact area render
- [ ] Open `/dealers` — directory list; open `/dealers/[id]` for a firm
- [ ] Open `/services` — services directory makes sense
- [ ] Open `/help`, `/privacy`, `/terms` — pages load

### A2. Engagement without account

- [ ] Heart / favorite on a card — appears in `/favorites` (local / guest)
- [ ] Compare toggle on cards (max 4) — sticky tray + `/compare` table looks right
- [ ] Clear compare / remove one from compare
- [ ] Guest can open **Book tour** / enquiry UI on property (if allowed) and submit as guest
- [ ] Unauthenticated visit to `/profile` or `/my-visits` → redirected to login (or clear empty state)

### A3. Auth entry

- [ ] `/login` — email/password works for demo user
- [ ] `/signup` (or register tab) — new user creates account and can use the site **without** email link (dev skip)
- [ ] Bad password → clear error (no stack dump)
- [ ] Google button → “not configured” (or stub) — **expected remaining**
- [ ] `/forgot-password` — request accepted (UI ok); email may fail if Supabase free mail rate-limited / no SMTP — **known remaining**
- [ ] `/dealer/register` — can start dealer signup flow

**Guest gaps / notes**

| # | What broke or felt unfinished | Severity |
|---|-------------------------------|----------|
| 1 | | |
| 2 | | |

---

## B. Logged-in buyer (`user@sqftgo.com`)

Log in as user, then walk the buyer journey.

### B1. Account & profile

- [ ] Navbar shows logged-in state (not “Login”)
- [ ] `/profile` — name, email, role visible
- [ ] `/profile/edit` — change name/phone/bio/city; save; refresh persists
- [ ] Avatar upload (if shown) — image appears after save
- [ ] `/settings` — notification toggles persist after refresh (localStorage)

### B2. Browse → shortlist → decide

- [ ] Favorite a property while logged in — still there after refresh / new tab (server sync)
- [ ] Unfavorite — removed from `/favorites`
- [ ] Add 2–3 to compare → `/compare` — prices/BHK/amenities columns sensible
- [ ] From compare or card → open property detail

### B3. Lead & visit

- [ ] Property page → **Submit enquiry / inquiry** — success toast/state; shows under `/my-inquiries`
- [ ] Property page → **Book tour / site visit** — pick future date/time; appears under `/my-visits` as Pending
- [ ] `/my-visits` — reschedule (allowed states) and cancel work
- [ ] After broker confirms a visit (use broker account in another window) — user sees Confirmed + notification if wired

### B4. Other buyer surfaces

- [ ] `/post-property` — form opens; understand if it creates draft / needs broker (note behavior)
- [ ] `/hub` — “dream home” / assistance style flow; inspiration upload if present
- [ ] `/services/register` — can submit a service listing (or clear validation errors)
- [ ] Logout → cannot hit `/my-inquiries` as session; `/api/auth/me` style session gone

**Buyer gaps / notes**

| # | What broke or felt unfinished | Severity |
|---|-------------------------------|----------|
| 1 | | |
| 2 | | |

---

## C. Broker / dealer (`broker@sqftgo.com`)

Log in as broker.

### C1. Access control

- [ ] Login redirects to `/dealer/dashboard` (or can open it)
- [ ] Visiting `/admin` redirects away (forbidden)
- [ ] Sidebar links: properties, add property, inquiries, messages, analytics, notifications, profile, settings, subscription

### C2. Listings lifecycle

- [ ] `/dealer/dashboard/properties` — own listings list
- [ ] `/dealer/dashboard/add-property` — create listing with images; status Draft or Pending Review
- [ ] Edit property → `/dealer/dashboard/edit-property/[id]` — save changes
- [ ] Submit for approval (if flow exists) — admin must see it under Approvals
- [ ] After admin activates — property appears on public `/listings`

### C3. Leads & operations

- [ ] `/dealer/dashboard/inquiries` — see inquiries on own properties; update status / dismiss
- [ ] Site visits on own properties — confirm / complete / reject as designed
- [ ] `/dealer/dashboard/messages` — threads load (if any); send a reply
- [ ] `/dealer/dashboard/notifications` — unread / mark read
- [ ] `/dealer/dashboard/analytics` — numbers load (even if zero)
- [ ] `/dealer/dashboard/profile` — firm fields save; KYC tab submits real draft/pending KYC (admin reviews at `/admin/kyc`)
- [ ] Optional: `pnpm seed:dealer-demo` — adds pending listing, inquiry, visits, KYC draft, notifications for clearer checks
- [ ] `/dealer/dashboard/subscription` — page loads (may be marketing/UI only)
- [ ] `/dealer/dashboard/settings` — password change path (if present)

### C4. New dealer path (optional second account)

- [ ] Logout → `/dealer/register` with a **new** email
- [ ] After signup, broker dashboard stays locked until admin promotes/approves (note exact UX)
- [ ] As admin, approve / set role → dealer can open dashboard

**Broker gaps / notes**

| # | What broke or felt unfinished | Severity |
|---|-------------------------------|----------|
| 1 | | |
| 2 | | |

---

## D. Admin (`admin@sqftgo.com`)

Log in as admin (may need direct URL `/login` then `/admin`).

### D1. Access

- [ ] `/admin` dashboard loads
- [ ] User / broker cannot open `/admin`

### D2. Marketplace ops

- [ ] `/admin/approvals` — approve / reject pending properties
- [ ] `/admin/properties` — list, feature flag, delete/deactivate as designed
- [ ] `/admin/users` — list users; suspend / role change (careful with sole admin)
- [ ] `/admin/dealers` — directory entries; remove if needed

### D3. Catalog (filters depend on these)

- [ ] `/admin/categories` — create, toggle active, delete/soft-delete
- [ ] `/admin/locations` — create city, toggle, delete
- [ ] `/admin/amenities` — create, toggle, delete; inactive hidden on public filters

### D4. Comms & ops

- [ ] `/admin/messages` — threads visible
- [ ] `/admin/notifications` — prefs / list
- [ ] `/admin/analytics`, `/admin/reports`, `/admin/logs` — pages load
- [ ] `/admin/roles`, `/admin/settings`, `/admin/profile` — pages load; settings changes behave

**Admin gaps / notes**

| # | What broke or felt unfinished | Severity |
|---|-------------------------------|----------|
| 1 | | |
| 2 | | |

---

## E. Cross-role “happy path” (one story)

Run this once as a full product story. Prefer a second browser profile for buyer vs broker.

1. [ ] **Guest** finds a property on `/listings` and opens detail  
2. [ ] **Guest** signs up as a new buyer → logged in immediately (dev)  
3. [ ] **Buyer** favorites + compares 2 homes  
4. [ ] **Buyer** sends inquiry + books a site visit  
5. [ ] **Broker** sees inquiry + visit; confirms visit  
6. [ ] **Buyer** sees confirmed visit (+ notification if applicable)  
7. [ ] **Broker** adds a new property → Pending  
8. [ ] **Admin** approves property → live on `/listings`  
9. [ ] **Guest** (logout) can see the new Active listing  

**Story result:** Pass / Fail — _______________________

---

## F. Known remaining (do not treat as random bugs)

Track these as product/ops backlog, not “broken click”:

| Area | Status | Where tracked |
|------|--------|----------------|
| Google OAuth login/signup | Stub | [`REMAINING.md`](./REMAINING.md) |
| Dealer KYC / bank / docs | KYC API live; bank/social still stubs | Profile KYC + `/admin/kyc` |
| Customer reviews | Not shipped | [`REMAINING.md`](./REMAINING.md) |
| Forgot-password email | Needs Custom SMTP / SES | Auth SMTP; free Supabase mail ~2/hr |
| Email confirm in production | Skipped in local via `AUTH_SKIP_EMAIL_CONFIRM` | Re-enable when SMTP ready |
| Leaked-password protection | Needs Supabase Pro | [`AUTH_REMAINING.md`](./AUTH_REMAINING.md) |
| Auth API rate limits | Not shipped | [`AUTH_REMAINING.md`](./AUTH_REMAINING.md) |
| Compare / city / notif prefs | Local device prefs by design | [`REMAINING.md`](./REMAINING.md) |
| Push/email notifications | In-app notifications only | Product later |

---

## G. Scorecard (fill after a test session)

| Persona | Pass rate (rough) | Worst issue |
|---------|-------------------|-------------|
| Guest | ___ / A boxes | |
| Buyer | ___ / B boxes | |
| Broker | ___ / C boxes | |
| Admin | ___ / D boxes | |
| Happy path E | Pass / Fail | |

### Top 5 things to do next (your priority)

1. 
2. 
3. 
4. 
5. 

---

## Quick URL cheat sheet

| Path | Who |
|------|-----|
| `/` `/listings` `/property/[id]` | Everyone |
| `/favorites` `/compare` `/dealers` `/services` | Everyone |
| `/login` `/signup` `/forgot-password` | Guest |
| `/profile` `/profile/edit` `/settings` | User+ |
| `/my-inquiries` `/my-visits` | User+ |
| `/dealer/register` | New dealer |
| `/dealer/dashboard/*` | Broker |
| `/admin/*` | Admin |

---

## Resume prompt for Cursor

> Read `@docs/USER_FLOW_WALKTHROUGH.md`. I finished a manual test session; here are my unchecked boxes and gap notes: … Fix the highest-severity broken flows first, then update this walkthrough if behavior changed.
