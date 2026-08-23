-- Admin-managed marketplace filter catalog (web listings + mobile explore).

create table public.listing_filters (
  id uuid primary key default gen_random_uuid(),
  key text not null,
  label text not null,
  kind text not null,
  property_field text,
  catalog text,
  options jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  system boolean not null default false,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint listing_filters_key_len check (char_length(trim(key)) between 2 and 40),
  constraint listing_filters_key_slug check (key ~ '^[a-z][a-z0-9_]*$'),
  constraint listing_filters_label_len check (char_length(trim(label)) between 2 and 80),
  constraint listing_filters_kind_ok check (kind in (
    'purpose','city','locality','type','bhk','furnishing','price','size',
    'amenities','rera','featured','text','toggle','multi'
  )),
  constraint listing_filters_catalog_ok check (
    catalog is null or catalog in ('cities','categories','amenities')
  )
);

create unique index listing_filters_key_uidx on public.listing_filters (key);

comment on table public.listing_filters is
  'Marketplace filter dimensions. Admin toggles/adds; public listings and mobile Explore render active rows.';

create trigger listing_filters_set_updated_at
  before update on public.listing_filters
  for each row execute function public.set_catalog_updated_at();

alter table public.listing_filters enable row level security;

revoke all on table public.listing_filters from anon, authenticated, public;
grant select on table public.listing_filters to anon, authenticated;
grant all on table public.listing_filters to service_role;

create policy "listing_filters_select_active"
  on public.listing_filters for select to anon, authenticated
  using (active = true);

insert into public.listing_filters
  (key, label, kind, property_field, catalog, options, active, system, sort_order)
values
  ('purpose', 'Purpose', 'purpose', 'purpose', null, '[]'::jsonb, true, true, 10),
  ('city', 'City', 'city', 'city', 'cities', '[]'::jsonb, true, true, 20),
  ('locality', 'Locality', 'locality', 'locality', null, '[]'::jsonb, true, true, 30),
  ('type', 'Property Type', 'type', 'type', 'categories', '[]'::jsonb, true, true, 40),
  ('bhk', 'BHK Size', 'bhk', 'bhk', null,
    '[{"label":"1 BHK","value":"1"},{"label":"2 BHK","value":"2"},{"label":"3 BHK","value":"3"},{"label":"4 BHK","value":"4"}]'::jsonb,
    true, true, 50),
  ('price', 'Budget Price', 'price', 'price', null, '[]'::jsonb, true, true, 60),
  ('size', 'Property Size (sq.ft.)', 'size', 'size', null, '[]'::jsonb, true, true, 70),
  ('furnishing', 'Furnishing', 'furnishing', 'furnished', null,
    '[{"label":"Furnished","value":"Furnished"},{"label":"Semi-Furnished","value":"Semi-Furnished"},{"label":"Unfurnished","value":"Unfurnished"}]'::jsonb,
    true, true, 80),
  ('amenities', 'Amenities', 'amenities', 'amenities', 'amenities', '[]'::jsonb, true, true, 90),
  ('rera', 'RERA Registered Only', 'rera', 'reraApproved', null, '[]'::jsonb, true, true, 100),
  ('featured', 'Featured Collection Only', 'featured', 'featured', null, '[]'::jsonb, true, true, 110),
  ('hospital', 'Nearby hospital', 'text', 'nearbyHospital', null, '[]'::jsonb, false, true, 120),
  ('school', 'Nearby school', 'text', 'nearbySchool', null, '[]'::jsonb, false, true, 130),
  ('transportation', 'Nearby transportation', 'text', 'nearbyTransportation', null, '[]'::jsonb, false, true, 140);
