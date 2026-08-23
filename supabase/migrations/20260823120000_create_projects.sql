-- Dealer projects (Phase 1): developments / owned inventory portfolios.
-- Mirrors properties: BFF + service role writes; RLS for direct client access.

create type public.project_status as enum (
  'draft',
  'pending_review',
  'active',
  'sold',
  'rejected'
);

create type public.project_lifecycle as enum (
  'upcoming',
  'under_construction',
  'ready'
);

create type public.project_ownership_role as enum (
  'owner',
  'builder',
  'marketing_partner'
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(trim(title)) >= 3),
  description text not null default '',
  city text not null,
  state text,
  country text default 'India',
  locality text not null default '',
  ownership_role public.project_ownership_role not null default 'owner',
  lifecycle public.project_lifecycle not null default 'upcoming',
  property_types text[] not null default '{}',
  configurations text[] not null default '{}',
  price_from numeric(14, 2) check (price_from is null or price_from >= 0),
  price_to numeric(14, 2) check (price_to is null or price_to >= 0),
  size_from numeric(14, 2) check (size_from is null or size_from >= 0),
  size_to numeric(14, 2) check (size_to is null or size_to >= 0),
  amenities text[] not null default '{}',
  images text[] not null default '{}',
  contact_name text not null default '',
  contact_phone text not null default '',
  rera_id text,
  rera_approved boolean not null default false,
  possession_date date,
  launch_date date,
  status public.project_status not null default 'pending_review',
  rejection_reason text,
  featured boolean not null default false,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_price_range_chk check (
    price_from is null or price_to is null or price_from <= price_to
  ),
  constraint projects_size_range_chk check (
    size_from is null or size_to is null or size_from <= size_to
  )
);

create index projects_status_idx on public.projects (status);
create index projects_city_idx on public.projects (city);
create index projects_owner_id_idx on public.projects (owner_id);
create index projects_featured_idx on public.projects (featured) where featured = true;
create index projects_created_at_idx on public.projects (created_at desc);

comment on table public.projects is 'Dealer/builder projects (developments or owned inventory portfolios)';

-- Optional link from unit listings to a project (Phase 2+ UI).
alter table public.properties
  add column if not exists project_id uuid references public.projects (id) on delete set null;

create index if not exists properties_project_id_idx on public.properties (project_id);

create or replace function public.set_projects_updated_at()
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

create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_projects_updated_at();

revoke execute on function public.set_projects_updated_at() from public, anon, authenticated;
grant execute on function public.set_projects_updated_at() to postgres, service_role;

-- Brokers cannot self-approve, feature, or reassign ownership.
create or replace function public.protect_project_privileges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_is_admin boolean;
begin
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.status = 'active'
  ) into caller_is_admin;

  if caller_is_admin or auth.uid() is null then
    return new;
  end if;

  new.owner_id := old.owner_id;
  new.featured := old.featured;

  if new.status is distinct from old.status
     and new.status not in ('draft', 'pending_review') then
    raise exception 'Brokers cannot set project status to %', new.status;
  end if;

  return new;
end;
$$;

create trigger projects_protect_privileges
  before update on public.projects
  for each row execute function public.protect_project_privileges();

revoke execute on function public.protect_project_privileges() from public, anon, authenticated;
grant execute on function public.protect_project_privileges() to postgres, service_role;

alter table public.projects enable row level security;

grant select on table public.projects to anon, authenticated;
grant insert, update, delete on table public.projects to authenticated;
grant all on table public.projects to service_role;

create policy "projects_select_active_anon"
  on public.projects
  for select
  to anon
  using (status = 'active');

create policy "projects_select_authenticated"
  on public.projects
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

create policy "projects_insert_broker_or_admin"
  on public.projects
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
          and p.role = 'broker'
      )
      and owner_id = (select auth.uid())
      and status in ('draft', 'pending_review')
      and featured = false
    )
  );

create policy "projects_update_owner_or_admin"
  on public.projects
  for update
  to authenticated
  using (
    owner_id = (select auth.uid())
    or exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid())
        and p.status = 'active'
        and p.role = 'admin'
    )
  )
  with check (
    owner_id = (select auth.uid())
    or exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid())
        and p.status = 'active'
        and p.role = 'admin'
    )
  );

-- Brokers may delete only non-active inventory (matches BFF soft-protect).
create policy "projects_delete_owner_or_admin"
  on public.projects
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid())
        and p.status = 'active'
        and p.role = 'admin'
    )
    or (
      owner_id = (select auth.uid())
      and status <> 'active'
    )
  );
