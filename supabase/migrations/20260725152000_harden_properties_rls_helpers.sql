-- Split anon SELECT so it does not call SECURITY DEFINER helpers.
-- Revoke RPC-callable EXECUTE on trigger helper.

drop policy if exists "properties_select_active_public" on public.properties;

create policy "properties_select_active_anon"
  on public.properties
  for select
  to anon
  using (status = 'active');

create policy "properties_select_authenticated"
  on public.properties
  for select
  to authenticated
  using (
    status = 'active'
    or owner_id = (select auth.uid())
    or exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid())
        and p.role = 'admin'
        and p.status = 'active'
    )
  );

revoke execute on function public.is_admin() from anon;
revoke execute on function public.is_broker() from anon;

revoke execute on function public.set_properties_updated_at() from public, anon, authenticated;
grant execute on function public.set_properties_updated_at() to postgres, service_role;

revoke execute on function public.is_admin() from public;
revoke execute on function public.is_broker() from public;
grant execute on function public.is_admin() to authenticated, service_role;
grant execute on function public.is_broker() to authenticated, service_role;
