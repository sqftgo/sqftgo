-- Nearby landmarks dealers capture on property listings.

alter table public.properties
  add column if not exists nearby_hospital text,
  add column if not exists nearby_school text,
  add column if not exists nearby_transportation text;

comment on column public.properties.nearby_hospital is 'Closest hospital / medical facility';
comment on column public.properties.nearby_school is 'Closest school / education';
comment on column public.properties.nearby_transportation is 'Closest transit / connectivity';
