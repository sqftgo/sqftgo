-- Trigger helpers are SECURITY DEFINER and must not be callable via PostgREST RPC.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.protect_profile_role() from public, anon, authenticated;
revoke execute on function public.enforce_single_admin() from public, anon, authenticated;

grant execute on function public.handle_new_user() to postgres, service_role;
grant execute on function public.protect_profile_role() to postgres, service_role;
grant execute on function public.enforce_single_admin() to postgres, service_role;
