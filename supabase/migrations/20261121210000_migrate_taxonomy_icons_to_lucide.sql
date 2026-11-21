-- Convert legacy emoji taxonomy icons to Lucide icon names used by the admin UI.

update public.categories
set icon = case icon
  when '🏠' then 'Home'
  when '🏡' then 'Home'
  when '🏢' then 'Building2'
  when '🏗️' then 'Building2'
  when '🏬' then 'Store'
  when '🏭' then 'Building2'
  when '🏪' then 'Store'
  when '🏨' then 'Building2'
  when '·' then 'Home'
  when '🌾' then 'Leaf'
  else icon
end
where icon !~ '^[A-Za-z][A-Za-z0-9]*$';

update public.amenities
set icon = case icon
  when '⭐' then 'Star'
  when '🏊' then 'Waves'
  when '🚗' then 'Car'
  when '💪' then 'Dumbbell'
  when '🔒' then 'Shield'
  when '📶' then 'Wifi'
  when '🌳' then 'Trees'
  else 'Star'
end
where icon is null or trim(icon) = '' or icon !~ '^[A-Za-z][A-Za-z0-9]*$';

update public.service_types
set icon = case icon
  when '🔧' then 'Wrench'
  when '🛠️' then 'Hammer'
  when '🧱' then 'Hammer'
  when '🧭' then 'Compass'
  when '💍' then 'Sparkles'
  when '🏠' then 'Home'
  when '🧮' then 'Briefcase'
  when '📦' then 'Truck'
  when '🏛️' then 'Landmark'
  when '🔨' then 'Hammer'
  when '📐' then 'Compass'
  when '🎉' then 'Sparkles'
  when '🚚' then 'Truck'
  when '🎨' then 'Paintbrush'
  else 'Wrench'
end
where icon is null or trim(icon) = '' or icon !~ '^[A-Za-z][A-Za-z0-9]*$';

alter table public.categories alter column icon set default 'Home';
alter table public.amenities alter column icon set default 'Star';
alter table public.service_types alter column icon set default 'Wrench';
