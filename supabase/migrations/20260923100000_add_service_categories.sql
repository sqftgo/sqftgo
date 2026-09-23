-- Add Services + Destination wedding-adjacent service categories.
-- Idempotent: skip names that already exist (case-insensitive).

insert into public.service_types (name, description, icon, active, sort_order)
select v.name, v.description, v.icon, true, v.sort_order
from (
  values
    ('Architect & Interior Designer', 'Architecture and interior design for homes and commercial spaces.', '🏛️', 10),
    ('House Services', 'Day-to-day home maintenance, repairs, and household support.', '🏠', 11),
    ('Movers & Packers', 'Packing, shifting, and relocation logistics.', '📦', 12),
    ('Contractors', 'Construction, renovation, and project contracting.', '🧱', 13),
    ('Event Managers', 'Full-service event planning and on-ground coordination.', '🎉', 14),
    ('Wedding Planners', 'Destination wedding planning, decor, and vendor coordination.', '💍', 15)
) as v(name, description, icon, sort_order)
where not exists (
  select 1
  from public.service_types st
  where lower(st.name) = lower(v.name)
);
