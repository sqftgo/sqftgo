-- Service provider profile enhancements + premium website promotion (DB-driven pricing).

-- ---------------------------------------------------------------------------
-- directory_profiles: slug, social links, intro
-- ---------------------------------------------------------------------------
alter table public.directory_profiles
  add column if not exists slug text;

alter table public.directory_profiles
  add column if not exists social_links jsonb not null default '{}'::jsonb;

alter table public.directory_profiles
  add column if not exists intro text not null default '';

comment on column public.directory_profiles.slug is
  'SEO-friendly public URL segment for service/dealer profiles.';
comment on column public.directory_profiles.social_links is
  'Optional social URLs: facebook, instagram, linkedin, twitter, youtube, whatsapp.';
comment on column public.directory_profiles.intro is
  'Short business introduction shown on the public profile hero.';

create unique index if not exists directory_profiles_slug_uidx
  on public.directory_profiles (slug)
  where slug is not null and length(trim(slug)) > 0;

-- Backfill slugs for existing rows (id suffix keeps uniqueness).
update public.directory_profiles
set slug = lower(
  regexp_replace(
    regexp_replace(coalesce(nullif(trim(firm_name), ''), 'business'), '[^a-zA-Z0-9]+', '-', 'g'),
    '(^-+|-+$)',
    '',
    'g'
  )
) || '-' || substr(replace(id::text, '-', ''), 1, 8)
where slug is null or trim(slug) = '';

-- ---------------------------------------------------------------------------
-- Portfolio images
-- ---------------------------------------------------------------------------
create table if not exists public.service_portfolio_images (
  id uuid primary key default gen_random_uuid(),
  directory_profile_id uuid not null references public.directory_profiles (id) on delete cascade,
  image_url text not null,
  caption text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists service_portfolio_images_profile_idx
  on public.service_portfolio_images (directory_profile_id, sort_order);

-- ---------------------------------------------------------------------------
-- Customer reviews
-- ---------------------------------------------------------------------------
create table if not exists public.service_reviews (
  id uuid primary key default gen_random_uuid(),
  directory_profile_id uuid not null references public.directory_profiles (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  title text not null default '',
  body text not null default '',
  status text not null default 'published'
    check (status in ('published', 'hidden', 'pending')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (directory_profile_id, user_id)
);

create index if not exists service_reviews_profile_status_idx
  on public.service_reviews (directory_profile_id, status, created_at desc);

-- ---------------------------------------------------------------------------
-- Premium website promotion plans (admin-configurable; never hardcode in app)
-- ---------------------------------------------------------------------------
create table if not exists public.service_website_promotion_plans (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  price_paise integer not null check (price_paise >= 0),
  currency text not null default 'INR',
  billing_type text not null default 'one_time'
    check (billing_type in ('one_time', 'recurring')),
  duration_days integer
    check (duration_days is null or (duration_days >= 1 and duration_days <= 3660)),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint service_website_promotion_plans_duration_check check (
    (billing_type = 'one_time' and duration_days is not null)
    or (billing_type = 'recurring' and duration_days is not null)
  )
);

insert into public.service_website_promotion_plans
  (slug, name, description, price_paise, billing_type, duration_days, is_active, sort_order)
values
  (
    'website-promo-30',
    'Website Promotion — 30 days',
    'Show a clickable Visit Website button on your public service profile for 30 days.',
    49900,
    'one_time',
    30,
    true,
    10
  ),
  (
    'website-promo-90',
    'Website Promotion — 90 days',
    'Show a clickable Visit Website button on your public service profile for 90 days.',
    129900,
    'one_time',
    90,
    true,
    20
  ),
  (
    'website-promo-monthly',
    'Website Promotion — Monthly',
    'Recurring monthly website promotion on your public profile.',
    39900,
    'recurring',
    30,
    true,
    30
  )
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Entitlements (one active row per directory profile)
-- ---------------------------------------------------------------------------
create table if not exists public.service_website_promotions (
  id uuid primary key default gen_random_uuid(),
  directory_profile_id uuid not null unique references public.directory_profiles (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  plan_id uuid references public.service_website_promotion_plans (id) on delete set null,
  status text not null default 'inactive'
    check (status in ('inactive', 'pending', 'active', 'expired', 'cancelled')),
  starts_at timestamptz,
  expires_at timestamptz,
  website_url text not null default '',
  admin_notes text not null default '',
  last_payment_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists service_website_promotions_user_idx
  on public.service_website_promotions (user_id);
create index if not exists service_website_promotions_status_expires_idx
  on public.service_website_promotions (status, expires_at);

-- ---------------------------------------------------------------------------
-- Payment history
-- ---------------------------------------------------------------------------
create table if not exists public.service_website_promotion_payments (
  id uuid primary key default gen_random_uuid(),
  directory_profile_id uuid not null references public.directory_profiles (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  plan_id uuid references public.service_website_promotion_plans (id) on delete set null,
  amount_paise integer not null check (amount_paise >= 0),
  currency text not null default 'INR',
  status text not null default 'created'
    check (status in ('created', 'paid', 'failed', 'refunded')),
  razorpay_order_id text unique,
  razorpay_payment_id text unique,
  razorpay_signature text,
  receipt text,
  notes jsonb not null default '{}'::jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists service_website_promo_payments_user_idx
  on public.service_website_promotion_payments (user_id, created_at desc);
create index if not exists service_website_promo_payments_profile_idx
  on public.service_website_promotion_payments (directory_profile_id, created_at desc);

alter table public.service_website_promotions
  drop constraint if exists service_website_promotions_last_payment_id_fkey;

alter table public.service_website_promotions
  add constraint service_website_promotions_last_payment_id_fkey
  foreign key (last_payment_id)
  references public.service_website_promotion_payments (id)
  on delete set null;

-- ---------------------------------------------------------------------------
-- Helper: is website promotion currently usable?
-- ---------------------------------------------------------------------------
create or replace function public.service_website_promotion_is_active(
  p_status text,
  p_expires_at timestamptz
)
returns boolean
language sql
stable
as $$
  select p_status = 'active'
    and (p_expires_at is null or p_expires_at > now());
$$;

-- Expire stale rows (callable from API; no cron required for correctness on read).
create or replace function public.expire_service_website_promotions()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  n integer;
begin
  update public.service_website_promotions
  set status = 'expired',
      updated_at = now()
  where status = 'active'
    and expires_at is not null
    and expires_at <= now();
  get diagnostics n = row_count;
  return n;
end;
$$;

revoke all on function public.expire_service_website_promotions() from public;
grant execute on function public.expire_service_website_promotions() to service_role;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.service_portfolio_images enable row level security;
alter table public.service_reviews enable row level security;
alter table public.service_website_promotion_plans enable row level security;
alter table public.service_website_promotions enable row level security;
alter table public.service_website_promotion_payments enable row level security;

revoke all on table public.service_portfolio_images from anon, authenticated;
revoke all on table public.service_reviews from anon, authenticated;
revoke all on table public.service_website_promotion_plans from anon, authenticated;
revoke all on table public.service_website_promotions from anon, authenticated;
revoke all on table public.service_website_promotion_payments from anon, authenticated;

grant all on table public.service_portfolio_images to service_role;
grant all on table public.service_reviews to service_role;
grant all on table public.service_website_promotion_plans to service_role;
grant all on table public.service_website_promotions to service_role;
grant all on table public.service_website_promotion_payments to service_role;

-- Public can read portfolio + published reviews (via Data API if exposed); BFF uses service_role.
grant select on table public.service_portfolio_images to anon, authenticated;
create policy "service_portfolio_images_public_select"
  on public.service_portfolio_images
  for select
  to anon, authenticated
  using (true);

grant select on table public.service_reviews to anon, authenticated;
create policy "service_reviews_public_select_published"
  on public.service_reviews
  for select
  to anon, authenticated
  using (status = 'published');

grant select on table public.service_website_promotion_plans to authenticated;
create policy "service_website_promo_plans_select_active"
  on public.service_website_promotion_plans
  for select
  to authenticated
  using (is_active = true);

grant select on table public.service_website_promotions to authenticated;
create policy "service_website_promotions_select_own"
  on public.service_website_promotions
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid())
        and p.role = 'admin'
        and p.status = 'active'
    )
  );

grant select on table public.service_website_promotion_payments to authenticated;
create policy "service_website_promo_payments_select_own"
  on public.service_website_promotion_payments
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid())
        and p.role = 'admin'
        and p.status = 'active'
    )
  );
