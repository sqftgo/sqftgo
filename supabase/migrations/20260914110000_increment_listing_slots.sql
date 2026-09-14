-- Atomic credit for bought or granted listing slots.
create or replace function public.increment_listing_slots(p_dealer_id uuid, p_slots integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  next_slots integer;
begin
  if p_slots is null or p_slots < 1 or p_slots > 1000 then
    raise exception 'invalid slots';
  end if;

  update public.profiles
  set listing_slots_purchased = listing_slots_purchased + p_slots
  where id = p_dealer_id
  returning listing_slots_purchased into next_slots;

  if next_slots is null then
    raise exception 'dealer not found';
  end if;

  return next_slots;
end;
$$;

revoke all on function public.increment_listing_slots(uuid, integer) from public, anon, authenticated;
grant execute on function public.increment_listing_slots(uuid, integer) to service_role;
