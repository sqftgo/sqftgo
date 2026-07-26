-- Fix: infinite recursion when properties RLS reads profiles, and profiles RLS
-- also reads profiles. Use SECURITY DEFINER helpers (bypass RLS) instead.

grant execute on function public.is_admin() to authenticated, anon, service_role;
grant execute on function public.is_broker() to authenticated, service_role;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
drop policy if exists "profiles_update_own_or_admin" on public.profiles;

create policy "profiles_select_own_or_admin"
  on public.profiles
  for select
  to authenticated
  using (
    (select auth.uid()) = id
    or public.is_admin()
  );

create policy "profiles_update_own_or_admin"
  on public.profiles
  for update
  to authenticated
  using (
    (select auth.uid()) = id
    or public.is_admin()
  )
  with check (
    (select auth.uid()) = id
    or public.is_admin()
  );

drop policy if exists "properties_select_authenticated" on public.properties;
create policy "properties_select_authenticated"
  on public.properties
  for select
  to authenticated
  using (
    status = 'active'
    or owner_id = (select auth.uid())
    or public.is_admin()
  );

drop policy if exists "properties_insert_broker_or_admin" on public.properties;
create policy "properties_insert_broker_or_admin"
  on public.properties
  for insert
  to authenticated
  with check (
    public.is_admin()
    or (
      public.is_broker()
      and owner_id = (select auth.uid())
      and status in ('draft', 'pending_review')
      and featured = false
    )
  );

drop policy if exists "properties_update_owner_or_admin" on public.properties;
create policy "properties_update_owner_or_admin"
  on public.properties
  for update
  to authenticated
  using (
    owner_id = (select auth.uid())
    or public.is_admin()
  )
  with check (
    owner_id = (select auth.uid())
    or public.is_admin()
  );

drop policy if exists "properties_delete_owner_or_admin" on public.properties;
create policy "properties_delete_owner_or_admin"
  on public.properties
  for delete
  to authenticated
  using (
    owner_id = (select auth.uid())
    or public.is_admin()
  );
