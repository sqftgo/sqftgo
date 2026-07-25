-- Profiles: 1:1 with auth.users. Single admin is seeded, never created via signup.

create type public.app_role as enum ('user', 'broker', 'admin');
create type public.profile_status as enum ('active', 'suspended');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  name text not null default '',
  phone text,
  avatar_url text,
  bio text,
  role public.app_role not null default 'user',
  status public.profile_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_email_unique unique (email)
);

create index profiles_role_idx on public.profiles (role);
create index profiles_status_idx on public.profiles (status);

comment on table public.profiles is 'App user profiles linked to Supabase Auth users';

-- Auto-create a profile on signup. Always starts as role=user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'name', split_part(coalesce(new.email, 'user'), '@', 1)),
    'user'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Protect role/status: clients cannot self-elevate; nobody can mint a new admin.
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_role public.app_role;
begin
  new.updated_at := now();

  -- Migrations / service role / seed (no JWT): allow
  if auth.uid() is null then
    return new;
  end if;

  select p.role into caller_role
  from public.profiles p
  where p.id = auth.uid();

  if caller_role is distinct from 'admin' then
    new.role := old.role;
    new.status := old.status;
  elsif new.role = 'admin' and old.role is distinct from 'admin' then
    raise exception 'Cannot elevate role to admin';
  end if;

  return new;
end;
$$;

create trigger profiles_protect_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();

-- Enforce at most one admin row
create or replace function public.enforce_single_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role = 'admin' then
    if exists (
      select 1 from public.profiles p
      where p.role = 'admin' and p.id is distinct from new.id
    ) then
      raise exception 'Only one admin account is allowed';
    end if;
  end if;
  return new;
end;
$$;

create trigger profiles_single_admin
  before insert or update on public.profiles
  for each row execute function public.enforce_single_admin();

alter table public.profiles enable row level security;

-- Grants (RLS still applies)
grant usage on schema public to anon, authenticated, service_role;
grant select, update on table public.profiles to authenticated;
grant select on table public.profiles to anon;
grant all on table public.profiles to service_role;

-- Policies
create policy "Profiles are viewable by authenticated users"
  on public.profiles
  for select
  to authenticated
  using (true);

create policy "Users can update own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Admins can update any profile"
  on public.profiles
  for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- No insert/delete from clients; profile rows come from the auth trigger only.
