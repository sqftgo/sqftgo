-- Phase 1: properties table, enums, RLS helpers, policies.

create type public.property_type as enum (
  'Home',
  'Villa',
  'Hotel',
  'Agricultural Land',
  'Apartment',
  'Office Space',
  'Commercial Space',
  'Shop',
  'Industrial Plot'
);

create type public.property_purpose as enum ('buy', 'sell', 'rent', 'lease');

create type public.furnished_status as enum ('Furnished', 'Semi-Furnished', 'Unfurnished');

create type public.property_status as enum (
  'draft',
  'pending_review',
  'active',
  'sold',
  'rented'
);

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  price numeric(14, 2) not null check (price >= 0),
  type public.property_type not null,
  purpose public.property_purpose not null,
  bhk integer,
  bathrooms integer,
  parking integer,
  year_built integer,
  city text not null,
  state text,
  country text default 'India',
  locality text not null,
  size numeric(14, 2) not null check (size >= 0),
  furnished public.furnished_status not null default 'Unfurnished',
  description text not null default '',
  amenities text[] not null default '{}',
  images text[] not null default '{}',
  video_url text,
  owner_name text not null,
  owner_phone text not null,
  owner_email text,
  inquiry_count integer not null default 0 check (inquiry_count >= 0),
  status public.property_status not null default 'pending_review',
  featured boolean not null default false,
  rera_approved boolean not null default false,
  rera_id text,
  verified_date date,
  seo_title text,
  seo_description text,
  verification_checks jsonb,
  price_breakdown jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index properties_status_idx on public.properties (status);
create index properties_city_idx on public.properties (city);
create index properties_owner_id_idx on public.properties (owner_id);
create index properties_purpose_idx on public.properties (purpose);
create index properties_featured_idx on public.properties (featured) where featured = true;
create index properties_created_at_idx on public.properties (created_at desc);

comment on table public.properties is 'Marketplace property listings owned by broker profiles';

create or replace function public.set_properties_updated_at()
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

create trigger properties_set_updated_at
  before update on public.properties
  for each row execute function public.set_properties_updated_at();

-- Role helpers for RLS
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
      and p.status = 'active'
  );
$$;

create or replace function public.is_broker()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'broker'
      and p.status = 'active'
  );
$$;

revoke execute on function public.is_admin() from public;
revoke execute on function public.is_broker() from public;
grant execute on function public.is_admin() to authenticated, service_role;
grant execute on function public.is_broker() to authenticated, service_role;

revoke execute on function public.set_properties_updated_at() from public, anon, authenticated;
grant execute on function public.set_properties_updated_at() to postgres, service_role;

alter table public.properties enable row level security;

grant select on table public.properties to anon, authenticated;
grant insert, update, delete on table public.properties to authenticated;
grant all on table public.properties to service_role;

-- Anon: active only (no SECURITY DEFINER helper calls)
create policy "properties_select_active_anon"
  on public.properties
  for select
  to anon
  using (status = 'active');

create policy "properties_select_authenticated"
  on public.properties
  for select
  to authenticated
  using (
    status = 'active'
    or owner_id = (select auth.uid())
    or exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid())
        and p.role = 'admin'
        and p.status = 'active'
    )
  );

create policy "properties_insert_broker_or_admin"
  on public.properties
  for insert
  to authenticated
  with check (
    (
      public.is_broker()
      and owner_id = (select auth.uid())
      and status in ('draft', 'pending_review')
      and featured = false
    )
    or public.is_admin()
  );

create policy "properties_update_owner_or_admin"
  on public.properties
  for update
  to authenticated
  using (
    (public.is_broker() and owner_id = (select auth.uid()))
    or public.is_admin()
  )
  with check (
    (public.is_broker() and owner_id = (select auth.uid()))
    or public.is_admin()
  );

-- Brokers cannot self-approve, feature, or reassign ownership.
create or replace function public.protect_property_privileges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() or auth.uid() is null then
    return new;
  end if;

  new.owner_id := old.owner_id;
  new.featured := old.featured;

  if new.status is distinct from old.status
     and new.status not in ('draft', 'pending_review') then
    raise exception 'Brokers cannot set property status to %', new.status;
  end if;

  return new;
end;
$$;

create trigger properties_protect_privileges
  before update on public.properties
  for each row execute function public.protect_property_privileges();

revoke execute on function public.protect_property_privileges() from public, anon, authenticated;
grant execute on function public.protect_property_privileges() to postgres, service_role;

create policy "properties_delete_owner_or_admin"
  on public.properties
  for delete
  to authenticated
  using (
    (public.is_broker() and owner_id = (select auth.uid()))
    or public.is_admin()
  );
