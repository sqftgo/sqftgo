-- Phase 11: amenities taxonomy for filters and property forms.

create table public.amenities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint amenities_name_len check (char_length(trim(name)) >= 2)
);

create unique index amenities_name_lower_uidx on public.amenities (lower(name));

comment on table public.amenities is 'Property amenity taxonomy for marketplace filters and forms';

create trigger amenities_set_updated_at
  before update on public.amenities
  for each row execute function public.set_catalog_updated_at();

alter table public.amenities enable row level security;

revoke all on table public.amenities from anon, authenticated, public;
grant select on table public.amenities to anon, authenticated;
grant all on table public.amenities to service_role;

create policy "amenities_select_active"
  on public.amenities for select to anon, authenticated
  using (active = true);

insert into public.amenities (name, active, sort_order) values
  ('Swimming Pool', true, 1),
  ('Parking', true, 2),
  ('Gym', true, 3),
  ('Security', true, 4),
  ('Power Backup', true, 5),
  ('Lift', true, 6),
  ('Garden', true, 7),
  ('Lake View', true, 8),
  ('Clubhouse', true, 9),
  ('Children Play Area', true, 10),
  ('CCTV', true, 11),
  ('Wi-Fi', true, 12),
  ('AC Rooms', true, 13),
  ('Terrace', true, 14),
  ('Modular Kitchen', true, 15),
  ('Vaastu Compliant', true, 16),
  ('Jogging Track', true, 17),
  ('Library', true, 18),
  ('Amphitheatre', true, 19),
  ('Meditation Zone', true, 20),
  ('EV Charging', true, 21);
