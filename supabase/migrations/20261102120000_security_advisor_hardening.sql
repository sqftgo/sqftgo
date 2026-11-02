-- Harden SECURITY DEFINER helpers + clear intentional service-only RLS lints.
-- is_admin() stays executable by authenticated (required by RLS policies).

-- 1) Trigger / internal helpers: not callable via PostgREST RPC
revoke execute on function public.protect_dealer_kyc_status() from public, anon, authenticated;
revoke execute on function public.protect_service_verification_status() from public, anon, authenticated;
revoke execute on function public.set_dealer_kyc_updated_at() from public, anon, authenticated;
revoke execute on function public.set_service_bookings_updated_at() from public, anon, authenticated;
revoke execute on function public.set_service_verifications_updated_at() from public, anon, authenticated;
revoke execute on function public.resolve_active_location_city(text) from public, anon, authenticated;

grant execute on function public.protect_dealer_kyc_status() to postgres, service_role;
grant execute on function public.protect_service_verification_status() to postgres, service_role;
grant execute on function public.set_dealer_kyc_updated_at() to postgres, service_role;
grant execute on function public.set_service_bookings_updated_at() to postgres, service_role;
grant execute on function public.set_service_verifications_updated_at() to postgres, service_role;
grant execute on function public.resolve_active_location_city(text) to postgres, service_role;

-- 2) Role helpers: anon must not call; is_broker unused in current RLS
revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.is_broker() from public, anon, authenticated;
grant execute on function public.is_admin() to authenticated, service_role, postgres;
grant execute on function public.is_broker() to service_role, postgres;

-- 3) Service-role-only tables: explicit deny policies (clears "RLS enabled no policy")
-- Clients already have table privileges revoked; service_role bypasses RLS.
drop policy if exists "activity_logs_no_client_access" on public.activity_logs;
create policy "activity_logs_no_client_access"
  on public.activity_logs
  for all
  to authenticated, anon
  using (false)
  with check (false);

drop policy if exists "listing_orders_no_client_access" on public.listing_orders;
create policy "listing_orders_no_client_access"
  on public.listing_orders
  for all
  to authenticated, anon
  using (false)
  with check (false);

-- 4) Move extensions out of public schema
create schema if not exists extensions;
grant usage on schema extensions to postgres, anon, authenticated, service_role;

alter extension vector set schema extensions;
alter extension pg_trgm set schema extensions;
