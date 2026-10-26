-- Admin-managed city cover images for /services destinations and cityCoverImage().

alter table public.locations
  add column if not exists cover_image_url text;

comment on column public.locations.cover_image_url is
  'Public cover URL (Supabase Storage city-covers or static /cities/*). Used app-wide via cityCoverImage.';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'city-covers',
  'city-covers',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Seed known static covers so admin UI shows current images immediately.
update public.locations set cover_image_url = '/cities/udaipur.jpg' where lower(city) = 'udaipur' and cover_image_url is null;
update public.locations set cover_image_url = '/cities/jaipur.jpg' where lower(city) = 'jaipur' and cover_image_url is null;
update public.locations set cover_image_url = '/cities/jaisalmer.jpg' where lower(city) = 'jaisalmer' and cover_image_url is null;
update public.locations set cover_image_url = '/cities/jodhpur.jpg' where lower(city) = 'jodhpur' and cover_image_url is null;
update public.locations set cover_image_url = '/cities/kota.jpg' where lower(city) = 'kota' and cover_image_url is null;
update public.locations set cover_image_url = '/cities/bikaner.jpg' where lower(city) = 'bikaner' and cover_image_url is null;
update public.locations set cover_image_url = '/cities/pushkar.jpg' where lower(city) = 'pushkar' and cover_image_url is null;
update public.locations set cover_image_url = '/cities/ajmer.jpg' where lower(city) = 'ajmer' and cover_image_url is null;
update public.locations set cover_image_url = '/cities/pali.jpg' where lower(city) = 'pali' and cover_image_url is null;
update public.locations set cover_image_url = '/cities/alwar.jpg' where lower(city) = 'alwar' and cover_image_url is null;
update public.locations set cover_image_url = '/cities/rajsamand.jpg' where lower(city) = 'rajsamand' and cover_image_url is null;
update public.locations set cover_image_url = '/cities/ahmedabad.jpg' where lower(city) = 'ahmedabad' and cover_image_url is null;
update public.locations set cover_image_url = '/cities/surat.jpg' where lower(city) = 'surat' and cover_image_url is null;
update public.locations set cover_image_url = '/cities/rajkot.jpg' where lower(city) = 'rajkot' and cover_image_url is null;
update public.locations set cover_image_url = '/cities/gandhinagar.jpg' where lower(city) = 'gandhinagar' and cover_image_url is null;
update public.locations set cover_image_url = '/cities/kutch.jpg' where lower(city) = 'kutch' and cover_image_url is null;
update public.locations set cover_image_url = '/cities/anand.jpg' where lower(city) = 'anand' and cover_image_url is null;
update public.locations set cover_image_url = '/cities/shimla.jpg' where lower(city) = 'shimla' and cover_image_url is null;
update public.locations set cover_image_url = '/cities/dharamshala.jpg' where lower(city) = 'dharamshala' and cover_image_url is null;
update public.locations set cover_image_url = '/cities/chittorgarh.jpg' where lower(city) = 'chittorgarh' and cover_image_url is null;
update public.locations set cover_image_url = '/cities/bundi.jpg' where lower(city) = 'bundi' and cover_image_url is null;
update public.locations set cover_image_url = '/cities/vadodara.jpg' where lower(city) = 'vadodara' and cover_image_url is null;
update public.locations set cover_image_url = '/cities/bengaluru.jpg' where lower(city) in ('bengaluru', 'bangalore') and cover_image_url is null;
update public.locations set cover_image_url = '/cities/delhi.jpg' where lower(city) in ('delhi', 'new delhi') and cover_image_url is null;
update public.locations set cover_image_url = '/cities/hyderabad.jpg' where lower(city) = 'hyderabad' and cover_image_url is null;
update public.locations set cover_image_url = '/cities/pune.jpg' where lower(city) = 'pune' and cover_image_url is null;
update public.locations set cover_image_url = '/cities/chennai.jpg' where lower(city) = 'chennai' and cover_image_url is null;
update public.locations set cover_image_url = '/cities/indore.jpg' where lower(city) = 'indore' and cover_image_url is null;
update public.locations set cover_image_url = '/cities/gurugram.jpg' where lower(city) in ('gurugram', 'gurgaon') and cover_image_url is null;
update public.locations set cover_image_url = '/cities/noida.jpg' where lower(city) = 'noida' and cover_image_url is null;
