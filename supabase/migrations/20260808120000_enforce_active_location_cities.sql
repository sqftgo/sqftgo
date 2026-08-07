-- Enforce that property + directory cities must match an active admin location.
-- Canonical spelling is taken from public.locations.city for consistency under load.

create index if not exists locations_active_city_lower_idx
  on public.locations (lower(city))
  where active = true;

create or replace function public.resolve_active_location_city(p_city text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select l.city
  from public.locations l
  where l.active = true
    and lower(l.city) = lower(trim(p_city))
  order by l.sort_order asc, l.city asc
  limit 1;
$$;

comment on function public.resolve_active_location_city(text) is
  'Returns canonical city name from active locations, or null if not allowed.';

create or replace function public.enforce_active_location_city()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  canonical text;
begin
  if new.city is null or length(trim(new.city)) < 2 then
    raise exception 'City is required and must match an active platform location'
      using errcode = '23514';
  end if;

  canonical := public.resolve_active_location_city(new.city);
  if canonical is null then
    raise exception 'City "%" is not an active platform location. Ask an admin to add it first.',
      trim(new.city)
      using errcode = '23514';
  end if;

  new.city := canonical;
  return new;
end;
$$;

drop trigger if exists properties_enforce_active_city on public.properties;
create trigger properties_enforce_active_city
  before insert or update of city
  on public.properties
  for each row
  execute function public.enforce_active_location_city();

drop trigger if exists directory_profiles_enforce_active_city on public.directory_profiles;
create trigger directory_profiles_enforce_active_city
  before insert or update of city
  on public.directory_profiles
  for each row
  execute function public.enforce_active_location_city();

revoke all on function public.resolve_active_location_city(text) from public, anon, authenticated;
grant execute on function public.resolve_active_location_city(text) to postgres, service_role, authenticated;

revoke all on function public.enforce_active_location_city() from public, anon, authenticated;
grant execute on function public.enforce_active_location_city() to postgres, service_role;

-- Normalize casing/spacing for rows that already match an active location.
update public.properties p
set city = l.city
from public.locations l
where l.active = true
  and lower(trim(p.city)) = lower(l.city)
  and p.city is distinct from l.city;

update public.directory_profiles d
set city = l.city
from public.locations l
where l.active = true
  and lower(trim(d.city)) = lower(l.city)
  and d.city is distinct from l.city;
