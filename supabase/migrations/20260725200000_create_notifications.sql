-- Phase 6: in-app notifications.

create type public.notification_type as enum ('info', 'success', 'warning', 'error');
create type public.notification_for_role as enum ('user', 'broker', 'admin', 'all');

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  for_role public.notification_for_role not null default 'all',
  title text not null,
  message text not null,
  type public.notification_type not null default 'info',
  read boolean not null default false,
  event_key text,
  entity_type text,
  entity_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint notifications_title_len check (char_length(trim(title)) >= 2),
  constraint notifications_message_len check (char_length(trim(message)) >= 2)
);

create index notifications_user_id_created_at_idx
  on public.notifications (user_id, created_at desc);
create index notifications_user_unread_idx
  on public.notifications (user_id) where read = false;
create index notifications_event_key_idx on public.notifications (event_key);

comment on table public.notifications is 'In-app notifications for marketplace users';

create or replace function public.set_notifications_updated_at()
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

create trigger notifications_set_updated_at
  before update on public.notifications
  for each row execute function public.set_notifications_updated_at();

revoke execute on function public.set_notifications_updated_at() from public, anon, authenticated;
grant execute on function public.set_notifications_updated_at() to postgres, service_role;

alter table public.notifications enable row level security;

revoke all on table public.notifications from anon, authenticated, public;
grant select, update, delete on table public.notifications to authenticated;
grant all on table public.notifications to service_role;

create policy "notifications_select_own"
  on public.notifications for select to authenticated
  using (
    user_id = (select auth.uid())
    or exists (
      select 1 from public.profiles pr
      where pr.id = (select auth.uid())
        and pr.status = 'active'
        and pr.role = 'admin'
    )
  );

create policy "notifications_update_own"
  on public.notifications for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "notifications_delete_own"
  on public.notifications for delete to authenticated
  using (
    user_id = (select auth.uid())
    or exists (
      select 1 from public.profiles pr
      where pr.id = (select auth.uid())
        and pr.status = 'active'
        and pr.role = 'admin'
    )
  );
