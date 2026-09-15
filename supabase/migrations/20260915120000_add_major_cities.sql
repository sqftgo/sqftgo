-- Migration: Seed requested cities into public.locations
-- Bangalore, Pune, Navi Mumbai, Hyderabad, Chennai, Gurgaon, Noida, Delhi, New Delhi, Vadodara, Indore

insert into public.locations (city, state, country, active, sort_order) values
  ('Bangalore', 'Karnataka', 'India', true, 10),
  ('Pune', 'Maharashtra', 'India', true, 11),
  ('Navi Mumbai', 'Maharashtra', 'India', true, 12),
  ('Hyderabad', 'Telangana', 'India', true, 13),
  ('Chennai', 'Tamil Nadu', 'India', true, 14),
  ('Gurgaon', 'Haryana', 'India', true, 15),
  ('Noida', 'Uttar Pradesh', 'India', true, 16),
  ('Delhi', 'Delhi', 'India', true, 17),
  ('New Delhi', 'Delhi', 'India', true, 18),
  ('Vadodara', 'Gujarat', 'India', true, 19),
  ('Indore', 'Madhya Pradesh', 'India', true, 20)
on conflict (lower(city), lower(state)) do update set
  active = true,
  country = excluded.country;
