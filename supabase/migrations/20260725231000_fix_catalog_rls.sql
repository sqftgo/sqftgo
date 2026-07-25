-- Fix: public catalog SELECT must not query profiles (anon has no grant).
-- Admin inactive rows are loaded via service-role APIs (?all=1).

drop policy if exists "categories_select_active_or_admin" on public.categories;
drop policy if exists "locations_select_active_or_admin" on public.locations;

create policy "categories_select_active"
  on public.categories for select to anon, authenticated
  using (active = true);

create policy "locations_select_active"
  on public.locations for select to anon, authenticated
  using (active = true);
