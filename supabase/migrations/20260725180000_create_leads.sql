-- Phase 4: assistance requests + general enquiries (Dream Project leads).

create type public.assistance_status as enum (
  'Received',
  'Assigned to Agent',
  'Properties Suggested'
);

create table public.assistance_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  budget text not null default '',
  areas text[] not null default '{}',
  bhk text not null default '',
  family_size integer not null default 1 check (family_size >= 0),
  move_in_date text not null default '',
  notes text not null default '',
  status public.assistance_status not null default 'Received',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint assistance_requests_name_len check (char_length(trim(name)) >= 2),
  constraint assistance_requests_email_len check (char_length(trim(email)) >= 3),
  constraint assistance_requests_phone_len check (char_length(trim(phone)) >= 5)
);

create index assistance_requests_created_at_idx on public.assistance_requests (created_at desc);
create index assistance_requests_status_idx on public.assistance_requests (status);
create index assistance_requests_email_idx on public.assistance_requests (lower(email));

create table public.general_enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null default '',
  property_type text not null default '',
  budget text not null default '',
  email text not null,
  mobile text not null,
  remarks text not null default '',
  message text,
  payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint general_enquiries_name_len check (char_length(trim(name)) >= 2),
  constraint general_enquiries_email_len check (char_length(trim(email)) >= 3),
  constraint general_enquiries_mobile_len check (char_length(trim(mobile)) >= 5)
);

create index general_enquiries_created_at_idx on public.general_enquiries (created_at desc);
create index general_enquiries_email_idx on public.general_enquiries (lower(email));

comment on table public.assistance_requests is 'Relocation / concierge assistance lead requests';
comment on table public.general_enquiries is 'General marketplace enquiries including Dream Project wizard submissions';

create or replace function public.set_leads_updated_at()
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

create trigger assistance_requests_set_updated_at
  before update on public.assistance_requests
  for each row execute function public.set_leads_updated_at();

create trigger general_enquiries_set_updated_at
  before update on public.general_enquiries
  for each row execute function public.set_leads_updated_at();

revoke execute on function public.set_leads_updated_at() from public, anon, authenticated;
grant execute on function public.set_leads_updated_at() to postgres, service_role;

alter table public.assistance_requests enable row level security;
alter table public.general_enquiries enable row level security;

grant insert on table public.assistance_requests to anon, authenticated;
grant select, update, delete on table public.assistance_requests to authenticated;
grant all on table public.assistance_requests to service_role;

grant insert on table public.general_enquiries to anon, authenticated;
grant select, update, delete on table public.general_enquiries to authenticated;
grant all on table public.general_enquiries to service_role;

-- Public can submit leads
create policy "assistance_requests_insert_public"
  on public.assistance_requests for insert to anon, authenticated
  with check (true);

create policy "general_enquiries_insert_public"
  on public.general_enquiries for insert to anon, authenticated
  with check (true);

-- Admin full read/write; submitters can read own by email
create policy "assistance_requests_select_admin_or_own"
  on public.assistance_requests for select to authenticated
  using (
    exists (
      select 1 from public.profiles pr
      where pr.id = (select auth.uid())
        and pr.status = 'active'
        and pr.role = 'admin'
    )
    or lower(email) = (
      select lower(pr.email) from public.profiles pr where pr.id = (select auth.uid())
    )
  );

create policy "assistance_requests_update_admin"
  on public.assistance_requests for update to authenticated
  using (
    exists (
      select 1 from public.profiles pr
      where pr.id = (select auth.uid())
        and pr.status = 'active'
        and pr.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles pr
      where pr.id = (select auth.uid())
        and pr.status = 'active'
        and pr.role = 'admin'
    )
  );

create policy "assistance_requests_delete_admin"
  on public.assistance_requests for delete to authenticated
  using (
    exists (
      select 1 from public.profiles pr
      where pr.id = (select auth.uid())
        and pr.status = 'active'
        and pr.role = 'admin'
    )
  );

create policy "general_enquiries_select_admin_or_own"
  on public.general_enquiries for select to authenticated
  using (
    exists (
      select 1 from public.profiles pr
      where pr.id = (select auth.uid())
        and pr.status = 'active'
        and pr.role = 'admin'
    )
    or lower(email) = (
      select lower(pr.email) from public.profiles pr where pr.id = (select auth.uid())
    )
  );

create policy "general_enquiries_update_admin"
  on public.general_enquiries for update to authenticated
  using (
    exists (
      select 1 from public.profiles pr
      where pr.id = (select auth.uid())
        and pr.status = 'active'
        and pr.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles pr
      where pr.id = (select auth.uid())
        and pr.status = 'active'
        and pr.role = 'admin'
    )
  );

create policy "general_enquiries_delete_admin"
  on public.general_enquiries for delete to authenticated
  using (
    exists (
      select 1 from public.profiles pr
      where pr.id = (select auth.uid())
        and pr.status = 'active'
        and pr.role = 'admin'
    )
  );
