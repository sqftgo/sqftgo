<p align="center">
  <img src="public/logo.svg" alt="SqftGo Logo" width="80" />
</p>

<h1 align="center">SqftGo</h1>

<p align="center">
  <strong>Bharat's Premier Real Estate Marketplace</strong>
</p>

<p align="center">
  Buy · Sell · Rent — Heritage havelis, luxury lakeview villas, modern apartments & more across Bharat.
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#project-structure">Project Structure</a> •
  <a href="#scripts">Scripts</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

---

## Overview

**SqftGo** is a full-featured real estate marketplace focused on Rajasthan, India — covering cities like Udaipur, Jaipur, Jodhpur, and more. It connects property buyers, renters, and sellers with verified dealers through a polished, responsive web experience built on Next.js 16.

The platform provides three distinct experiences:

| Portal | Description |
|--------|-------------|
| **Public** | Browse listings, search & filter properties, compare options, view destinations, and submit inquiries |
| **Dealer** | Dashboard for dealers to manage listings, respond to inquiries, and register their business |
| **Admin** | Full administrative control — manage users, dealers, properties, categories, amenities, analytics, and more |

---

## Features

### 🏠 Public Experience
- **Smart Property Search** — Filter by city, price, type, bedrooms, and more
- **Property Listings** — Rich detail pages with image galleries, amenities, and maps
- **Compare Properties** — Side-by-side comparison of shortlisted properties
- **Favorites & Inquiries** — Save properties and submit inquiry forms
- **Destination Hub** — Explore cities and localities across Rajasthan
- **Dream Project Wizard** — Guided property discovery tool
- **Dealer Directory** — Browse and connect with verified dealers
- **Auth Flow** — Login, signup, forgot password, and profile management

### 📊 Dealer Dashboard
- Property listing management
- Dealer registration and onboarding

### 🛡️ Admin Panel
- User, dealer, and property management
- Categories, amenities, and locations configuration
- Approval workflows
- Analytics, reports, and audit logs
- Roles & permissions management
- Notifications and messaging system
- Platform settings

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **UI Library** | [React 19](https://react.dev/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) |
| **Backend** | [Supabase](https://supabase.com/) (Auth, Postgres, RLS) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **Icons** | [Lucide React](https://lucide.dev/), [Font Awesome 7](https://fontawesome.com/) |
| **Fonts** | [Geist](https://vercel.com/font) (via `next/font`) |
| **Package Manager** | [pnpm](https://pnpm.io/) |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18.18
- **pnpm** ≥ 8 — Install via `npm install -g pnpm`
- **Docker** — required for local Supabase (`pnpm supabase:start`)
- **Supabase CLI** — bundled as a dev dependency (`pnpm exec supabase`)

### Installation

```bash
# Clone the repository
git clone https://github.com/sqftgo/sqftgo.git
cd sqftgo

# Install dependencies
pnpm install

# Copy env template and fill keys after starting Supabase (or from your cloud project)
cp .env.example .env.local
```

### Supabase (local)

```bash
# Start local Supabase (API, DB, Auth, Studio)
pnpm supabase:start

# Apply migrations + seed (profiles + single admin)
pnpm supabase:reset

# Print URL and anon/service keys — paste into .env.local
pnpm supabase:status
```

Then set in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only; never expose to the browser)

**Auth notes**

- Public signup creates `profiles.role = user` only. Signup cannot create an admin.
- A **single admin** is seeded locally as `admin@sqftgo.com` / `sqftgo26`. These credentials are **not shown** on the login page; use them only when you need `/admin`.
- On a hosted Supabase project, create that one admin in the Auth dashboard, then set `profiles.role = 'admin'` for that user (only one admin row is allowed).
- Demo autocomplete on login is limited to client (`user@sqftgo.com`) and broker (`broker@sqftgo.com`).
- `/admin/*` and `/dealer/dashboard/*` are protected by Next.js middleware using the Supabase session + profile role.

### Web auth API (this repo)

Web login/signup goes through Next.js Route Handlers (cookie session). Same routes will later accept `Authorization: Bearer` for the Expo app.

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/auth/login` | Sign in, set session cookies |
| `POST` | `/api/auth/signup` | Register user (role=`user`) |
| `POST` | `/api/auth/logout` | Clear session |
| `GET` | `/api/auth/me` | Current user + profile |
| `POST` | `/api/auth/forgot-password` | Send reset email |

Push schema to your hosted project before testing signup:

```bash
pnpm exec supabase login
pnpm exec supabase link --project-ref YOUR_PROJECT_REF
pnpm exec supabase db push
```

### Development

```bash
# Start the Next.js dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build & Production

```bash
# Create a production build
pnpm build

# Start the production server
pnpm start
```

### Linting

```bash
pnpm lint
```

---

## Project Structure

```
sqftgo/
├── public/                    # Static assets (images, icons, fonts)
├── scripts/                   # Build & utility scripts
├── supabase/                  # Supabase config, migrations, seed
│   ├── migrations/            # SQL migrations (profiles, RLS, triggers)
│   ├── seed.sql               # Local seed (single admin + demo accounts)
│   └── config.toml
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (public)/          # Public-facing pages
│   │   │   ├── page.tsx       # Homepage
│   │   │   ├── listings/      # Property listings
│   │   │   ├── property/      # Property detail pages
│   │   │   ├── compare/       # Property comparison
│   │   │   ├── favorites/     # Saved properties
│   │   │   ├── destinations/  # City & locality explorer
│   │   │   ├── dealers/       # Dealer directory
│   │   │   ├── hub/           # Content hub
│   │   │   ├── my-inquiries/  # User inquiries
│   │   │   ├── my-visits/     # Scheduled visits
│   │   │   ├── post-property/ # Property submission wizard
│   │   │   ├── services/      # Service offerings
│   │   │   ├── login/         # Authentication
│   │   │   ├── signup/        # Registration
│   │   │   └── ...            # Profile, settings, help, etc.
│   │   ├── (dealer)/          # Dealer portal
│   │   │   └── dealer/
│   │   │       ├── dashboard/ # Dealer dashboard
│   │   │       └── register/  # Dealer onboarding
│   │   ├── (admin)/           # Admin portal
│   │   │   └── admin/
│   │   │       ├── page.tsx   # Admin dashboard
│   │   │       ├── properties/
│   │   │       ├── users/
│   │   │       ├── dealers/
│   │   │       ├── analytics/
│   │   │       └── ...        # 15+ admin modules
│   │   ├── layout.tsx         # Root layout
│   │   ├── globals.css        # Global styles & design tokens
│   │   ├── error.tsx          # Error boundary
│   │   └── not-found.tsx      # 404 page
│   ├── middleware.ts          # Supabase session refresh + route guards
│   ├── lib/
│   │   └── supabase/          # Browser, server, and middleware clients
│   ├── components/
│   │   ├── ui/                # Reusable UI primitives (28 components)
│   │   │   ├── Button, Badge, Avatar, Alert
│   │   │   ├── Dialog, DropdownMenu, Panel
│   │   │   ├── PropertyCard, FilterPanel, InquiryForm
│   │   │   ├── DataTable, StatCard, SearchInput
│   │   │   └── ...
│   │   ├── shared/            # App-wide shared components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── DepthBackground.tsx
│   │   │   ├── DreamProjectButton.tsx
│   │   │   └── MainWrapper.tsx
│   │   ├── property/          # Property-specific components
│   │   ├── destinations/      # Destination page components
│   │   ├── layout/            # Layout components
│   │   └── admin/             # Admin panel components
│   ├── context/               # React Context providers (AppContext)
│   ├── hooks/                 # Custom hooks (useAuth, etc.)
│   ├── services/              # API service layers
│   ├── types/                 # TypeScript type definitions
│   ├── constants/             # App constants & configuration
│   ├── data/                  # Static/mock data
│   ├── lib/                   # Utility libraries
│   └── mocks/                 # Mock data for development
├── next.config.ts             # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
├── eslint.config.mjs          # ESLint configuration
├── postcss.config.mjs         # PostCSS configuration
└── package.json
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with hot reload |
| `pnpm build` | Create optimized production build |
| `pnpm start` | Run the production server |
| `pnpm lint` | Run ESLint checks |

---

## Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'feat: add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

Please follow the existing code style and naming conventions.

---

## License

This project is proprietary. All rights reserved.

---

<p align="center">
  Built with ❤️ for Rajasthan's real estate community
</p>