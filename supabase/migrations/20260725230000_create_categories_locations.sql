-- Phase 9: categories + locations taxonomy.

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text not null default '🏠',
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_name_len check (char_length(trim(name)) >= 2),
  constraint categories_icon_len check (char_length(trim(icon)) >= 1)
);

create unique index categories_name_lower_uidx on public.categories (lower(name));

create table public.locations (
  id uuid primary key default gen_random_uuid(),
  city text not null,
  state text not null,
  country text not null default 'India',
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint locations_city_len check (char_length(trim(city)) >= 2),
  constraint locations_state_len check (char_length(trim(state)) >= 2),
  constraint locations_country_len check (char_length(trim(country)) >= 2)
);

create unique index locations_city_state_lower_uidx
  on public.locations (lower(city), lower(state));

comment on table public.categories is 'Property type taxonomy for marketplace filters';
comment on table public.locations is 'City/region taxonomy for marketplace filters';

create or replace function public.set_catalog_updated_at()
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

create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_catalog_updated_at();

create trigger locations_set_updated_at
  before update on public.locations
  for each row execute function public.set_catalog_updated_at();

revoke execute on function public.set_catalog_updated_at() from public, anon, authenticated;
grant execute on function public.set_catalog_updated_at() to postgres, service_role;

alter table public.categories enable row level security;
alter table public.locations enable row level security;

revoke all on table public.categories from anon, authenticated, public;
revoke all on table public.locations from anon, authenticated, public;

grant select on table public.categories to anon, authenticated;
grant select on table public.locations to anon, authenticated;
grant all on table public.categories to service_role;
grant all on table public.locations to service_role;

create policy "categories_select_active"
  on public.categories for select to anon, authenticated
  using (active = true);

create policy "locations_select_active"
  on public.locations for select to anon, authenticated
  using (active = true);

insert into public.categories (name, icon, active, sort_order) values
  ('Villa', '🏡', true, 1),
  ('Apartment', '🏢', true, 2),
  ('Home', '🏠', true, 3),
  ('Office Space', '🏗️', true, 4),
  ('Shop', '🏪', true, 5),
  ('Agricultural Land', '🌾', true, 6),
  ('Hotel', '🏨', true, 7),
  ('Commercial Space', '🏬', true, 8),
  ('Industrial Plot', '🏭', false, 9);

insert into public.locations (city, state, country, active, sort_order) values
  ('Udaipur', 'Rajasthan', 'India', true, 1),
  ('Jaipur', 'Rajasthan', 'India', true, 2),
  ('Jodhpur', 'Rajasthan', 'India', true, 3),
  ('Jaisalmer', 'Rajasthan', 'India', true, 4),
  ('Kota', 'Rajasthan', 'India', true, 5),
  ('Ahmedabad', 'Gujarat', 'India', true, 6),
  ('Surat', 'Gujarat', 'India', true, 7),
  ('Shimla', 'Himachal Pradesh', 'India', false, 8);
