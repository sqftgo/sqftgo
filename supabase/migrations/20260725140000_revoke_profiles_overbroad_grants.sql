-- Defense in depth: RLS already blocks unauthorized access, but table grants
-- were wider than needed (anon/authenticated had ALL). Align with app design:
-- - profiles are created only by auth.users trigger (no client INSERT)
-- - no client DELETE
-- - anon needs no access
-- - authenticated: SELECT + UPDATE only (policies still apply)

revoke all on table public.profiles from anon, authenticated, public;

grant select, update on table public.profiles to authenticated;
grant all on table public.profiles to service_role;
