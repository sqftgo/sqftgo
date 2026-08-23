-- Allow verified-active clients to list a small number of properties.
-- Admin controls: allow_user_listings, max_listings_per_user, listing_status, listing approval.

do $$ begin
  create type public.lister_status as enum ('none', 'pending', 'approved', 'rejected');
exception
  when duplicate_object then null;
end $$;

alter table public.profiles
  add column if not exists listing_status public.lister_status not null default 'none';

alter table public.profiles
  add column if not exists listing_verified_at timestamptz;

comment on column public.profiles.listing_status is
  'Admin verification for client (role=user) property listing. none=not requested, pending=awaiting review, approved=verified by admin, rejected=blocked.';

alter table public.platform_settings
  add column if not exists allow_user_listings boolean not null default true;

alter table public.platform_settings
  add column if not exists max_listings_per_user integer not null default 2;

alter table public.platform_settings
  drop constraint if exists platform_settings_max_listings_per_user_check;

alter table public.platform_settings
  add constraint platform_settings_max_listings_per_user_check
  check (max_listings_per_user >= 1);

drop policy if exists "properties_insert_broker_or_admin" on public.properties;
drop policy if exists "properties_insert_owner_or_admin" on public.properties;

create policy "properties_insert_owner_or_admin"
  on public.properties
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid())
        and p.status = 'active'
        and p.role = 'admin'
    )
    or (
      exists (
        select 1 from public.profiles p
        where p.id = (select auth.uid())
          and p.status = 'active'
          and p.role in ('broker', 'user')
          and p.listing_status is distinct from 'rejected'
      )
      and owner_id = (select auth.uid())
      and status in ('draft', 'pending_review')
      and featured = false
    )
  );

create or replace function public.protect_property_privileges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
      and p.status = 'active'
  ) or auth.uid() is null then
    return new;
  end if;

  new.owner_id := old.owner_id;
  new.featured := old.featured;

  if new.status is distinct from old.status
     and new.status not in ('draft', 'pending_review') then
    raise exception 'Owners cannot set property status to %', new.status;
  end if;

  return new;
end;
$$;
