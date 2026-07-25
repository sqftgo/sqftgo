-- Phase E: platform_settings singleton + dealer_kyc (private) + kyc docs bucket.

-- ΓöÇΓöÇΓöÇ platform_settings (singleton id = 1) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

create table public.platform_settings (
  id smallint primary key default 1 check (id = 1),
  site_name text not null default 'SqftGo',
  tagline text not null default 'Rajasthan Real Estate Marketplace',
  support_email text,
  support_phone text,
  maintenance_mode boolean not null default false,
  require_listing_approval boolean not null default true,
  max_listings_per_dealer integer
    check (max_listings_per_dealer is null or max_listings_per_dealer >= 1),
  currency_code text not null default 'INR',
  analytics_measurement_id text,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null,
  constraint platform_settings_site_name_len check (char_length(trim(site_name)) >= 2),
  constraint platform_settings_currency_len check (char_length(trim(currency_code)) = 3)
);

comment on table public.platform_settings is
  'Singleton platform configuration; payment secrets stay in env, not here';

insert into public.platform_settings (id) values (1)
on conflict (id) do nothing;

alter table public.platform_settings enable row level security;

revoke all on table public.platform_settings from anon, authenticated, public;
grant select on table public.platform_settings to authenticated;
grant all on table public.platform_settings to service_role;

-- Authenticated may read (for maintenance banner). Writes via service role / admin BFF only.
create policy "platform_settings_select_authenticated"
  on public.platform_settings
  for select
  to authenticated
  using (true);

-- ΓöÇΓöÇΓöÇ dealer_kyc ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

create type public.kyc_status as enum ('draft', 'pending', 'approved', 'rejected');

create table public.dealer_kyc (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  directory_profile_id uuid references public.directory_profiles (id) on delete set null,
  pan_number text,
  aadhaar_last4 text,
  status public.kyc_status not null default 'draft',
  dealer_notes text not null default '',
  admin_notes text not null default '',
  rejection_reason text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dealer_kyc_aadhaar_last4_fmt check (
    aadhaar_last4 is null or aadhaar_last4 ~ '^[0-9]{4}$'
  ),
  constraint dealer_kyc_pan_len check (
    pan_number is null or char_length(trim(pan_number)) between 8 and 12
  )
);

create index dealer_kyc_status_idx on public.dealer_kyc (status);
create index dealer_kyc_submitted_at_idx on public.dealer_kyc (submitted_at desc nulls last);

comment on table public.dealer_kyc is
  'Private dealer KYC ΓÇö not exposed on public directory; admin review only';

create or replace function public.set_dealer_kyc_updated_at()
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

create trigger dealer_kyc_set_updated_at
  before update on public.dealer_kyc
  for each row execute function public.set_dealer_kyc_updated_at();

-- Brokers cannot self-approve / self-reject
create or replace function public.protect_dealer_kyc_status()
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
      raise exception 'Only admins can approve or reject KYC';
    end if;
    new.reviewed_at := old.reviewed_at;
    new.reviewed_by := old.reviewed_by;
    new.admin_notes := old.admin_notes;
    new.rejection_reason := old.rejection_reason;
    if new.user_id is distinct from old.user_id then
      raise exception 'Cannot reassign KYC ownership';
    end if;
  end if;

  return new;
end;
$$;

create trigger dealer_kyc_protect_status
  before update on public.dealer_kyc
  for each row execute function public.protect_dealer_kyc_status();

alter table public.dealer_kyc enable row level security;

revoke all on table public.dealer_kyc from anon, authenticated, public;
grant select, insert, update on table public.dealer_kyc to authenticated;
grant all on table public.dealer_kyc to service_role;

create policy "dealer_kyc_select_own_or_admin"
  on public.dealer_kyc
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

create policy "dealer_kyc_insert_own"
  on public.dealer_kyc
  for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid())
        and p.role in ('broker', 'admin')
        and p.status = 'active'
    )
  );

create policy "dealer_kyc_update_own_or_admin"
  on public.dealer_kyc
  for update
  to authenticated
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

-- ΓöÇΓöÇΓöÇ dealer_kyc_documents ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

create table public.dealer_kyc_documents (
  id uuid primary key default gen_random_uuid(),
  kyc_id uuid not null references public.dealer_kyc (id) on delete cascade,
  doc_type text not null,
  storage_path text not null,
  file_name text not null default '',
  created_at timestamptz not null default now(),
  constraint dealer_kyc_documents_doc_type_allowed check (
    doc_type in ('pan_card', 'aadhaar', 'rera_certificate', 'other')
  ),
  constraint dealer_kyc_documents_path_len check (char_length(trim(storage_path)) >= 3)
);

create index dealer_kyc_documents_kyc_id_idx on public.dealer_kyc_documents (kyc_id);

comment on table public.dealer_kyc_documents is
  'Private KYC document metadata; files live in dealer-kyc storage bucket';

alter table public.dealer_kyc_documents enable row level security;

revoke all on table public.dealer_kyc_documents from anon, authenticated, public;
grant select, insert, delete on table public.dealer_kyc_documents to authenticated;
grant all on table public.dealer_kyc_documents to service_role;

create policy "dealer_kyc_documents_select_own_or_admin"
  on public.dealer_kyc_documents
  for select
  to authenticated
  using (
    exists (
      select 1 from public.dealer_kyc k
      where k.id = kyc_id
        and (
          k.user_id = (select auth.uid())
          or exists (
            select 1 from public.profiles p
            where p.id = (select auth.uid())
              and p.role = 'admin'
              and p.status = 'active'
          )
        )
    )
  );

create policy "dealer_kyc_documents_insert_own"
  on public.dealer_kyc_documents
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.dealer_kyc k
      where k.id = kyc_id
        and k.user_id = (select auth.uid())
        and k.status in ('draft', 'pending', 'rejected')
    )
  );

create policy "dealer_kyc_documents_delete_own_or_admin"
  on public.dealer_kyc_documents
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.dealer_kyc k
      where k.id = kyc_id
        and (
          (k.user_id = (select auth.uid()) and k.status in ('draft', 'rejected'))
          or exists (
            select 1 from public.profiles p
            where p.id = (select auth.uid())
              and p.role = 'admin'
              and p.status = 'active'
          )
        )
    )
  );

-- ΓöÇΓöÇΓöÇ private storage bucket ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'dealer-kyc',
  'dealer-kyc',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- No public listing/select policies ΓÇö BFF uses service role for upload/signed URL.
