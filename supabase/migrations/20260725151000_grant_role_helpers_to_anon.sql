-- RLS policies for anon SELECT evaluate is_admin()/is_broker();
-- security definer helpers are safe for anon (return false without a JWT).
grant execute on function public.is_admin() to anon;
grant execute on function public.is_broker() to anon;
