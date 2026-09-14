-- Dealer listing packs: 3 free slots, then paid plans (default ₹99 / +10).
-- Adding a new plan later is an INSERT into listing_plans — checkout stays the same.

alter table public.profiles
  add column if not exists listing_slots_purchased integer not null default 0;

alter table public.profiles
  drop constraint if exists profiles_listing_slots_purchased_check;

alter table public.profiles
  add constraint profiles_listing_slots_purchased_check
  check (listing_slots_purchased >= 0);

comment on column public.profiles.listing_slots_purchased is
  'Lifetime extra property slots bought or granted. Quota = free_listings + this.';

update public.platform_settings
set max_listings_per_dealer = 3
where id = 1
  and max_listings_per_dealer is null;

create table if not exists public.listing_plans (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  price_paise integer not null check (price_paise >= 0),
  slots integer not null check (slots >= 1 and slots <= 1000),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.listing_orders (
  id uuid primary key default gen_random_uuid(),
  dealer_id uuid not null references public.profiles (id) on delete cascade,
  plan_id uuid references public.listing_plans (id) on delete set null,
  provider text not null default 'razorpay',
  razorpay_order_id text unique,
  razorpay_payment_id text unique,
  amount_paise integer not null check (amount_paise >= 0),
  slots integer not null check (slots >= 1),
  status text not null default 'created'
    check (status in ('created', 'paid', 'failed')),
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create index if not exists listing_orders_dealer_id_idx
  on public.listing_orders (dealer_id, created_at desc);

create index if not exists listing_plans_active_sort_idx
  on public.listing_plans (is_active, sort_order);

insert into public.listing_plans (slug, name, description, price_paise, slots, is_active, sort_order)
values (
  'pack-10',
  '10 extra listings',
  'Add 10 more property slots after your 3 free listings.',
  9900,
  10,
  true,
  10
)
on conflict (slug) do nothing;

-- Existing dealers keep current inventory (do not lock them at 3).
update public.profiles p
set listing_slots_purchased = greatest(
  p.listing_slots_purchased,
  greatest(
    0,
    (
      select count(*)::int
      from public.properties pr
      where pr.owner_id = p.id
        and pr.status is distinct from 'rejected'
    ) - 3
  )
)
where p.role = 'broker';

alter table public.listing_plans enable row level security;
alter table public.listing_orders enable row level security;

revoke all on table public.listing_plans from anon, authenticated;
revoke all on table public.listing_orders from anon, authenticated;
grant all on table public.listing_plans to service_role;
grant all on table public.listing_orders to service_role;

grant select on table public.listing_plans to authenticated;
create policy "listing_plans_select_active"
  on public.listing_plans
  for select
  to authenticated
  using (is_active = true);
