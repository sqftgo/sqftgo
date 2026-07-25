-- Tighten profiles RLS for production:
-- authenticated users may only read their own row;
-- admins may read all rows (for admin user management).

drop policy if exists "Profiles are viewable by authenticated users" on public.profiles;

create policy "Users can view own profile"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Admins can view all profiles"
  on public.profiles
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid())
        and p.role = 'admin'
    )
  );
