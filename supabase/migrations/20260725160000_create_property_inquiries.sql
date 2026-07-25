-- Phase 2: property inquiries + inquiry_count sync trigger.

create type public.inquiry_status as enum ('new', 'read', 'archived');

create table public.property_inquiries (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  name text not null,
  email text not null,
  phone text not null,
  message text not null,
  status public.inquiry_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint property_inquiries_name_len check (char_length(trim(name)) >= 2),
  constraint property_inquiries_email_len check (char_length(trim(email)) >= 3),
  constraint property_inquiries_phone_len check (char_length(trim(phone)) >= 5),
  constraint property_inquiries_message_len check (char_length(trim(message)) >= 5)
);

create index property_inquiries_property_id_idx on public.property_inquiries (property_id);
create index property_inquiries_created_at_idx on public.property_inquiries (created_at desc);
create index property_inquiries_status_idx on public.property_inquiries (status);
create index property_inquiries_email_idx on public.property_inquiries (lower(email));

comment on table public.property_inquiries is 'Buyer inquiries on marketplace property listings';

create or replace function public.set_property_inquiries_updated_at()
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

create trigger property_inquiries_set_updated_at
  before update on public.property_inquiries
  for each row execute function public.set_property_inquiries_updated_at();

revoke execute on function public.set_property_inquiries_updated_at() from public, anon, authenticated;
grant execute on function public.set_property_inquiries_updated_at() to postgres, service_role;

-- Keep properties.inquiry_count in sync
create or replace function public.sync_property_inquiry_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.properties
      set inquiry_count = inquiry_count + 1
    where id = new.property_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.properties
      set inquiry_count = greatest(inquiry_count - 1, 0)
    where id = old.property_id;
    return old;
  end if;
  return null;
end;
$$;

create trigger property_inquiries_sync_count
  after insert or delete on public.property_inquiries
  for each row execute function public.sync_property_inquiry_count();

revoke execute on function public.sync_property_inquiry_count() from public, anon, authenticated;
grant execute on function public.sync_property_inquiry_count() to postgres, service_role;

alter table public.property_inquiries enable row level security;

grant select on table public.property_inquiries to authenticated;
grant insert on table public.property_inquiries to anon, authenticated;
grant update, delete on table public.property_inquiries to authenticated;
grant all on table public.property_inquiries to service_role;

-- Anyone can inquire on an Active listing
create policy "property_inquiries_insert_active_property"
  on public.property_inquiries
  for insert
  to anon, authenticated
  with check (
    exists (
      select 1 from public.properties p
      where p.id = property_id
        and p.status = 'active'
    )
  );

-- Owner broker or admin can read
create policy "property_inquiries_select_owner_or_admin"
  on public.property_inquiries
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles pr
      where pr.id = (select auth.uid())
        and pr.status = 'active'
        and pr.role = 'admin'
    )
    or exists (
      select 1 from public.properties p
      where p.id = property_id
        and p.owner_id = (select auth.uid())
    )
    -- Buyers can see their own submitted inquiries
    or lower(email) = (
      select lower(pr.email) from public.profiles pr
      where pr.id = (select auth.uid())
    )
  );

create policy "property_inquiries_update_owner_or_admin"
  on public.property_inquiries
  for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles pr
      where pr.id = (select auth.uid())
        and pr.status = 'active'
        and pr.role = 'admin'
    )
    or exists (
      select 1 from public.properties p
      where p.id = property_id
        and p.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.profiles pr
      where pr.id = (select auth.uid())
        and pr.status = 'active'
        and pr.role = 'admin'
    )
    or exists (
      select 1 from public.properties p
      where p.id = property_id
        and p.owner_id = (select auth.uid())
    )
  );

create policy "property_inquiries_delete_owner_or_admin"
  on public.property_inquiries
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles pr
      where pr.id = (select auth.uid())
        and pr.status = 'active'
        and pr.role = 'admin'
    )
    or exists (
      select 1 from public.properties p
      where p.id = property_id
        and p.owner_id = (select auth.uid())
    )
  );
