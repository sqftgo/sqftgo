drop policy if exists "properties_insert_broker_or_admin" on public.properties;
drop policy if exists "properties_update_owner_or_admin" on public.properties;
drop policy if exists "properties_delete_owner_or_admin" on public.properties;

create policy "properties_insert_broker_or_admin"
  on public.properties
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

create policy "properties_update_owner_or_admin"
  on public.properties
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

create policy "properties_delete_owner_or_admin"
  on public.properties
  for delete
  to authenticated
  using (
    owner_id = (select auth.uid())
    or exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid())
        and p.status = 'active'
        and p.role = 'admin'
    )
  );

revoke execute on function public.is_admin() from anon, authenticated, public;
revoke execute on function public.is_broker() from anon, authenticated, public;
grant execute on function public.is_admin() to postgres, service_role;
grant execute on function public.is_broker() to postgres, service_role;
