-- Services platform: service_types catalog, profile verification fields,
-- service_verifications, service_bookings, user listing cap = 3.

-- ─── service_types (admin-managed catalog) ───────────────────────────────────

create table public.service_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  icon text not null default '🔧',
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint service_types_name_len check (char_length(trim(name)) >= 2),
  constraint service_types_icon_len check (char_length(trim(icon)) >= 1)
);

create unique index service_types_name_lower_uidx on public.service_types (lower(name));

comment on table public.service_types is
  'Admin-managed service trades for the public /services directory';

create trigger service_types_set_updated_at
  before update on public.service_types
  for each row execute function public.set_catalog_updated_at();

alter table public.service_types enable row level security;

revoke all on table public.service_types from anon, authenticated, public;
grant select on table public.service_types to anon, authenticated;
grant all on table public.service_types to service_role;

create policy "service_types_select_active"
  on public.service_types for select to anon, authenticated
  using (active = true);

insert into public.service_types (name, description, icon, active, sort_order) values
  ('Interior Decorator', 'Renovate spaces with traditional and modern layouts.', '🎨', true, 1),
  ('Architect', 'Heritage restoration and contemporary residential design.', '📐', true, 2),
  ('Building Contractor', 'Structural work, materials, and craftsmanship.', '🔨', true, 3),
  ('Vastu Consultant', 'Align home plans with Vedic guidelines.', '🧭', true, 4),
  ('Home Valuation/Inspection', 'Structural checks and fair market valuations.', '🧮', true, 5),
  ('Home Shifting/Deep Cleaning', 'Relocation logistics, cleaning, and pest control.', '🚚', true, 6);

-- ─── directory_profiles: category as text + service / verification fields ────

alter table public.directory_profiles
  alter column category type text using category::text;

alter table public.directory_profiles
  add column if not exists service_type_id uuid references public.service_types (id) on delete set null,
  add column if not exists verification_status text not null default 'unverified'
    check (verification_status in ('unverified', 'pending', 'verified', 'rejected')),
  add column if not exists listing_active boolean not null default true,
  add column if not exists lat double precision,
  add column if not exists lng double precision,
  add column if not exists cover_image_url text,
  add column if not exists logo_url text,
  add column if not exists business_hours jsonb,
  add column if not exists services_offered text[] not null default '{}';

create index if not exists directory_profiles_service_type_id_idx
  on public.directory_profiles (service_type_id);
create index if not exists directory_profiles_verification_status_idx
  on public.directory_profiles (verification_status);
create index if not exists directory_profiles_listing_active_idx
  on public.directory_profiles (listing_active);

-- Backfill service_type_id for existing service-trade rows
update public.directory_profiles dp
set service_type_id = st.id
from public.service_types st
where dp.category = st.name
  and dp.service_type_id is null;

-- Public select: only listing_active rows (owners/admins still read via service role BFF)
drop policy if exists "directory_profiles_select_public" on public.directory_profiles;
create policy "directory_profiles_select_public"
  on public.directory_profiles
  for select
  to anon, authenticated
  using (
    listing_active = true
    or user_id = (select auth.uid())
    or exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid())
        and p.role = 'admin'
        and p.status = 'active'
    )
  );

-- ─── service_verifications ───────────────────────────────────────────────────

create type public.service_verification_status as enum (
  'draft', 'pending', 'approved', 'rejected'
);

create table public.service_verifications (
  id uuid primary key default gen_random_uuid(),
  directory_profile_id uuid not null references public.directory_profiles (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  status public.service_verification_status not null default 'draft',
  business_registration_id text,
  owner_notes text not null default '',
  admin_notes text not null default '',
  rejection_reason text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint service_verifications_profile_uidx unique (directory_profile_id)
);

create index service_verifications_status_idx on public.service_verifications (status);
create index service_verifications_user_id_idx on public.service_verifications (user_id);

comment on table public.service_verifications is
  'Service owner verification queue; admin approve sets directory_profiles.verification_status';

create or replace function public.set_service_verifications_updated_at()
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

create trigger service_verifications_set_updated_at
  before update on public.service_verifications
  for each row execute function public.set_service_verifications_updated_at();

create or replace function public.protect_service_verification_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_role public.app_role;
begin
  if auth.uid() is null then
    return new;
  end if;

  select p.role into caller_role
  from public.profiles p
  where p.id = auth.uid();

  if caller_role is distinct from 'admin' then
    if new.status in ('approved', 'rejected') and old.status is distinct from new.status then
      raise exception 'Only admins can approve or reject service verification';
    end if;
    new.reviewed_at := old.reviewed_at;
    new.reviewed_by := old.reviewed_by;
    new.admin_notes := old.admin_notes;
    new.rejection_reason := old.rejection_reason;
    if new.user_id is distinct from old.user_id then
      raise exception 'Cannot reassign verification ownership';
    end if;
  end if;

  return new;
end;
$$;

create trigger service_verifications_protect_status
  before update on public.service_verifications
  for each row execute function public.protect_service_verification_status();

alter table public.service_verifications enable row level security;

revoke all on table public.service_verifications from anon, authenticated, public;
grant select, insert, update on table public.service_verifications to authenticated;
grant all on table public.service_verifications to service_role;

create policy "service_verifications_select_own_or_admin"
  on public.service_verifications for select to authenticated
  using (
    user_id = (select auth.uid())
    or exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid())
        and p.role = 'admin'
        and p.status = 'active'
    )
  );

create policy "service_verifications_insert_own"
  on public.service_verifications for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "service_verifications_update_own_or_admin"
  on public.service_verifications for update to authenticated
  using (
    user_id = (select auth.uid())
    or exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid())
        and p.role = 'admin'
        and p.status = 'active'
    )
  )
  with check (
    user_id = (select auth.uid())
    or exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid())
        and p.role = 'admin'
        and p.status = 'active'
    )
  );

create table public.service_verification_documents (
  id uuid primary key default gen_random_uuid(),
  verification_id uuid not null references public.service_verifications (id) on delete cascade,
  doc_type text not null check (doc_type in (
    'business_license', 'gst_certificate', 'owner_id', 'other'
  )),
  storage_path text not null,
  file_name text not null default '',
  created_at timestamptz not null default now()
);

create index service_verification_documents_verification_id_idx
  on public.service_verification_documents (verification_id);

alter table public.service_verification_documents enable row level security;

revoke all on table public.service_verification_documents from anon, authenticated, public;
grant select, insert, delete on table public.service_verification_documents to authenticated;
grant all on table public.service_verification_documents to service_role;

create policy "service_verification_docs_select_own_or_admin"
  on public.service_verification_documents for select to authenticated
  using (
    exists (
      select 1 from public.service_verifications v
      where v.id = verification_id
        and (
          v.user_id = (select auth.uid())
          or exists (
            select 1 from public.profiles p
            where p.id = (select auth.uid())
              and p.role = 'admin'
              and p.status = 'active'
          )
        )
    )
  );

create policy "service_verification_docs_insert_own"
  on public.service_verification_documents for insert to authenticated
  with check (
    exists (
      select 1 from public.service_verifications v
      where v.id = verification_id
        and v.user_id = (select auth.uid())
        and v.status in ('draft', 'pending', 'rejected')
    )
  );

create policy "service_verification_docs_delete_own"
  on public.service_verification_documents for delete to authenticated
  using (
    exists (
      select 1 from public.service_verifications v
      where v.id = verification_id
        and v.user_id = (select auth.uid())
        and v.status in ('draft', 'rejected')
    )
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'service-verification',
  'service-verification',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do nothing;

-- ─── service_bookings ────────────────────────────────────────────────────────

create type public.service_booking_status as enum (
  'pending', 'confirmed', 'cancelled', 'completed'
);

create table public.service_bookings (
  id uuid primary key default gen_random_uuid(),
  directory_profile_id uuid not null references public.directory_profiles (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  preferred_at timestamptz not null,
  message text not null default '',
  contact_phone text not null,
  status public.service_booking_status not null default 'pending',
  owner_notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint service_bookings_phone_len check (char_length(trim(contact_phone)) >= 5),
  constraint service_bookings_message_len check (char_length(message) <= 4000)
);

create index service_bookings_profile_idx on public.service_bookings (directory_profile_id);
create index service_bookings_user_id_idx on public.service_bookings (user_id);
create index service_bookings_status_idx on public.service_bookings (status);
create index service_bookings_preferred_at_idx on public.service_bookings (preferred_at);

comment on table public.service_bookings is
  'Logged-in booking requests against a service directory profile';

create or replace function public.set_service_bookings_updated_at()
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

create trigger service_bookings_set_updated_at
  before update on public.service_bookings
  for each row execute function public.set_service_bookings_updated_at();

alter table public.service_bookings enable row level security;

revoke all on table public.service_bookings from anon, authenticated, public;
grant select, insert, update on table public.service_bookings to authenticated;
grant all on table public.service_bookings to service_role;

create policy "service_bookings_select_party_or_admin"
  on public.service_bookings for select to authenticated
  using (
    user_id = (select auth.uid())
    or exists (
      select 1 from public.directory_profiles dp
      where dp.id = directory_profile_id
        and dp.user_id = (select auth.uid())
    )
    or exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid())
        and p.role = 'admin'
        and p.status = 'active'
    )
  );

create policy "service_bookings_insert_own"
  on public.service_bookings for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "service_bookings_update_party_or_admin"
  on public.service_bookings for update to authenticated
  using (
    user_id = (select auth.uid())
    or exists (
      select 1 from public.directory_profiles dp
      where dp.id = directory_profile_id
        and dp.user_id = (select auth.uid())
    )
    or exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid())
        and p.role = 'admin'
        and p.status = 'active'
    )
  )
  with check (
    user_id = (select auth.uid())
    or exists (
      select 1 from public.directory_profiles dp
      where dp.id = directory_profile_id
        and dp.user_id = (select auth.uid())
    )
    or exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid())
        and p.role = 'admin'
        and p.status = 'active'
    )
  );

-- ─── platform: max 3 listings for normal users ───────────────────────────────

update public.platform_settings
set max_listings_per_user = 3
where id = 1;
