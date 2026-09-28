-- Update platform_settings default tagline to Bharat
update public.platform_settings
set tagline = replace(tagline, 'Rajasthan', 'Bharat')
where tagline ilike '%rajasthan%';

alter table public.platform_settings
  alter column tagline set default 'Bharat Real Estate Marketplace';
