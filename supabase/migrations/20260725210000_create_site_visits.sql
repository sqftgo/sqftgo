-- Phase 7: property site visits / book tour.

create type public.visit_status as enum (
  'pending',
  'confirmed',
  'completed',
  'cancelled'
);

create table public.site_visits (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  visitor_name text not null,
  visitor_email text not null,
  visitor_phone text not null,
  scheduled_date date not null,
  scheduled_time text not null,
  status public.visit_status not null default 'pending',
  notes text,
  broker_notes text,
  cancelled_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site_visits_visitor_name_len check (char_length(trim(visitor_name)) >= 2),
  constraint site_visits_visitor_email_len check (char_length(trim(visitor_email)) >= 5),
  constraint site_visits_visitor_phone_len check (char_length(trim(visitor_phone)) >= 5),
  constraint site_visits_scheduled_time_len check (char_length(trim(scheduled_time)) >= 2),
  constraint site_visits_notes_len check (notes is null or char_length(notes) <= 5000)
);

create index site_visits_property_id_idx on public.site_visits (property_id);
create index site_visits_user_id_idx on public.site_visits (user_id);
create index site_visits_visitor_email_idx on public.site_visits (lower(visitor_email));
create index site_visits_scheduled_date_idx on public.site_visits (scheduled_date);
create index site_visits_status_idx on public.site_visits (status);

comment on table public.site_visits is 'Buyer/broker property tour bookings';

create or replace function public.set_site_visits_updated_at()
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

create trigger site_visits_set_updated_at
  before update on public.site_visits
  for each row execute function public.set_site_visits_updated_at();

revoke execute on function public.set_site_visits_updated_at() from public, anon, authenticated;
grant execute on function public.set_site_visits_updated_at() to postgres, service_role;

alter table public.site_visits enable row level security;

revoke all on table public.site_visits from anon, authenticated, public;
grant select on table public.site_visits to authenticated;
grant all on table public.site_visits to service_role;

create policy "site_visits_select_scoped"
  on public.site_visits for select to authenticated
  using (
    user_id = (select auth.uid())
    or lower(visitor_email) = lower(coalesce((select auth.jwt() ->> 'email'), ''))
    or exists (
      select 1 from public.properties p
      where p.id = site_visits.property_id
        and p.owner_id = (select auth.uid())
    )
    or exists (
      select 1 from public.profiles pr
      where pr.id = (select auth.uid())
        and pr.status = 'active'
        and pr.role = 'admin'
    )
  );
