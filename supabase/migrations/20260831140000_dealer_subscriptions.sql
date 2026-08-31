-- Dealer partner subscriptions + Razorpay payment records.
-- Mutations go through service_role API routes; dealers may only read their own rows.

create type public.subscription_plan as enum ('starter', 'professional', 'enterprise');
create type public.subscription_status as enum (
  'inactive',
  'pending',
  'active',
  'past_due',
  'cancelled',
  'expired'
);
create type public.subscription_payment_status as enum (
  'created',
  'attempted',
  'paid',
  'failed',
  'refunded'
);

create table public.dealer_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  plan public.subscription_plan not null default 'starter',
  status public.subscription_status not null default 'inactive',
  billing_cycle text not null default 'monthly'
    constraint dealer_subscriptions_billing_cycle_check
      check (billing_cycle in ('monthly', 'yearly')),
  amount_paise integer not null default 0
    constraint dealer_subscriptions_amount_nonneg check (amount_paise >= 0),
  currency text not null default 'INR'
    constraint dealer_subscriptions_currency_len check (char_length(trim(currency)) = 3),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  razorpay_customer_id text,
  razorpay_subscription_id text,
  razorpay_payment_id text,
  last_payment_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index dealer_subscriptions_status_idx on public.dealer_subscriptions (status);
create index dealer_subscriptions_period_end_idx on public.dealer_subscriptions (current_period_end);

comment on table public.dealer_subscriptions is
  'One partner plan per dealer; activated after verified Razorpay payment.';

create or replace function public.set_dealer_subscriptions_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger dealer_subscriptions_set_updated_at
  before update on public.dealer_subscriptions
  for each row execute function public.set_dealer_subscriptions_updated_at();

alter table public.dealer_subscriptions enable row level security;

revoke all on table public.dealer_subscriptions from anon, authenticated, public;
grant select on table public.dealer_subscriptions to authenticated;
grant all on table public.dealer_subscriptions to service_role;

create policy "dealer_subscriptions_select_own_or_admin"
  on public.dealer_subscriptions
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

create table public.dealer_subscription_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  subscription_id uuid references public.dealer_subscriptions (id) on delete set null,
  plan public.subscription_plan not null,
  amount_paise integer not null
    constraint dealer_subscription_payments_amount_pos check (amount_paise > 0),
  currency text not null default 'INR'
    constraint dealer_subscription_payments_currency_len check (char_length(trim(currency)) = 3),
  status public.subscription_payment_status not null default 'created',
  razorpay_order_id text not null,
  razorpay_payment_id text,
  razorpay_signature text,
  receipt text,
  notes jsonb not null default '{}'::jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dealer_subscription_payments_order_unique unique (razorpay_order_id)
);

create index dealer_subscription_payments_user_idx
  on public.dealer_subscription_payments (user_id, created_at desc);
create index dealer_subscription_payments_status_idx
  on public.dealer_subscription_payments (status);

comment on table public.dealer_subscription_payments is
  'Razorpay order/payment trail for dealer plan checkouts.';

create or replace function public.set_dealer_subscription_payments_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger dealer_subscription_payments_set_updated_at
  before update on public.dealer_subscription_payments
  for each row execute function public.set_dealer_subscription_payments_updated_at();

alter table public.dealer_subscription_payments enable row level security;

revoke all on table public.dealer_subscription_payments from anon, authenticated, public;
grant select on table public.dealer_subscription_payments to authenticated;
grant all on table public.dealer_subscription_payments to service_role;

create policy "dealer_subscription_payments_select_own_or_admin"
  on public.dealer_subscription_payments
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

-- Optional FK after payments table exists
alter table public.dealer_subscriptions
  add constraint dealer_subscriptions_last_payment_id_fkey
  foreign key (last_payment_id)
  references public.dealer_subscription_payments (id)
  on delete set null;

revoke execute on function public.set_dealer_subscriptions_updated_at() from anon, authenticated, public;
revoke execute on function public.set_dealer_subscription_payments_updated_at() from anon, authenticated, public;
grant execute on function public.set_dealer_subscriptions_updated_at() to postgres, service_role;
grant execute on function public.set_dealer_subscription_payments_updated_at() to postgres, service_role;
