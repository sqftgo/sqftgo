-- Fix advisor warnings on public.profiles:
-- - auth_rls_initplan: wrap auth.uid() in (select ...)
-- - multiple_permissive_policies: one policy per action for authenticated

drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Admins can view all profiles" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Admins can update any profile" on public.profiles;

create policy "profiles_select_own_or_admin"
  on public.profiles
  for select
  to authenticated
  using (
    (select auth.uid()) = id
    or exists (
      select 1
      from public.profiles as p
      where p.id = (select auth.uid())
        and p.role = 'admin'
    )
  );

create policy "profiles_update_own_or_admin"
  on public.profiles
  for update
  to authenticated
  using (
    (select auth.uid()) = id
    or exists (
      select 1
      from public.profiles as p
      where p.id = (select auth.uid())
        and p.role = 'admin'
    )
  )
  with check (
    (select auth.uid()) = id
    or exists (
      select 1
      from public.profiles as p
      where p.id = (select auth.uid())
        and p.role = 'admin'
    )
  );
