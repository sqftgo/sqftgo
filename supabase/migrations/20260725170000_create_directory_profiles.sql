-- Phase 3: public dealer / service directory profiles.

create type public.directory_category as enum (
  'Agent & Broker',
  'Builder & Developer',
  'Interior Decorator',
  'Architect',
  'Building Contractor',
  'Property Consultant',
  'Vastu Consultant',
  'Home Valuation/Inspection',
  'Home Shifting/Deep Cleaning'
);

create table public.directory_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references public.profiles (id) on delete set null,
  firm_name text not null,
  owner_name text not null,
  category public.directory_category not null,
  city text not null,
  address text not null default '',
  email text not null,
  website text not null default '',
  mobile text not null,
  description text not null default '',
  rera_id text,
  experience text,
  specialties text[] not null default '{}',
  team_size integer check (team_size is null or team_size >= 0),
  listings_count integer not null default 0 check (listings_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint directory_profiles_firm_name_len check (char_length(trim(firm_name)) >= 2),
  constraint directory_profiles_owner_name_len check (char_length(trim(owner_name)) >= 2),
  constraint directory_profiles_email_len check (char_length(trim(email)) >= 3),
  constraint directory_profiles_mobile_len check (char_length(trim(mobile)) >= 5)
);

create unique index directory_profiles_email_lower_uidx
  on public.directory_profiles (lower(email));
create index directory_profiles_city_idx on public.directory_profiles (city);
create index directory_profiles_category_idx on public.directory_profiles (category);
create index directory_profiles_user_id_idx on public.directory_profiles (user_id);
create index directory_profiles_created_at_idx on public.directory_profiles (created_at desc);

comment on table public.directory_profiles is 'Public marketplace directory for brokers and service providers';

create or replace function public.set_directory_profiles_updated_at()
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

create trigger directory_profiles_set_updated_at
  before update on public.directory_profiles
  for each row execute function public.set_directory_profiles_updated_at();

revoke execute on function public.set_directory_profiles_updated_at() from public, anon, authenticated;
grant execute on function public.set_directory_profiles_updated_at() to postgres, service_role;

alter table public.directory_profiles enable row level security;

grant select on table public.directory_profiles to anon, authenticated;
grant insert, update on table public.directory_profiles to authenticated;
grant delete on table public.directory_profiles to authenticated;
grant all on table public.directory_profiles to service_role;

-- Directory is public
create policy "directory_profiles_select_public"
  on public.directory_profiles
  for select
  to anon, authenticated
  using (true);

create policy "directory_profiles_insert_own_or_admin"
  on public.directory_profiles
  for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    or exists (
      select 1 from public.profiles pr
      where pr.id = (select auth.uid())
        and pr.status = 'active'
        and pr.role = 'admin'
    )
  );

create policy "directory_profiles_update_own_or_admin"
  on public.directory_profiles
  for update
  to authenticated
  using (
    user_id = (select auth.uid())
    or exists (
      select 1 from public.profiles pr
      where pr.id = (select auth.uid())
        and pr.status = 'active'
        and pr.role = 'admin'
    )
  )
  with check (
    user_id = (select auth.uid())
    or exists (
      select 1 from public.profiles pr
      where pr.id = (select auth.uid())
        and pr.status = 'active'
        and pr.role = 'admin'
    )
  );

create policy "directory_profiles_delete_admin"
  on public.directory_profiles
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles pr
      where pr.id = (select auth.uid())
        and pr.status = 'active'
        and pr.role = 'admin'
    )
  );
