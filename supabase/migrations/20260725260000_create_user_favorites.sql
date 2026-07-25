-- Phase 12: account-backed property favorites.

create table public.user_favorites (
  user_id uuid not null references public.profiles (id) on delete cascade,
  property_id uuid not null references public.properties (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, property_id)
);

create index user_favorites_user_id_created_at_idx
  on public.user_favorites (user_id, created_at desc);

create index user_favorites_property_id_idx
  on public.user_favorites (property_id);

comment on table public.user_favorites is 'Per-user shortlisted property IDs for favorites sync';

alter table public.user_favorites enable row level security;

revoke all on table public.user_favorites from anon, authenticated, public;
grant select, insert, delete on table public.user_favorites to authenticated;
grant all on table public.user_favorites to service_role;

create policy "user_favorites_select_own"
  on public.user_favorites for select to authenticated
  using (user_id = (select auth.uid()));

create policy "user_favorites_insert_own"
  on public.user_favorites for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "user_favorites_delete_own"
  on public.user_favorites for delete to authenticated
  using (user_id = (select auth.uid()));
