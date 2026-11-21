-- Enrich marketplace taxonomy for admin-managed filters, categories, locations,
-- amenities, and service types. Backfill slugs; expand custom filter kinds.

create or replace function public.marketplace_slugify(input text)
returns text
language plpgsql
immutable
as $$
declare
  s text;
begin
  s := lower(trim(coalesce(input, '')));
  s := regexp_replace(s, '[^a-z0-9]+', '-', 'g');
  s := regexp_replace(s, '^-+|-+$', '', 'g');
  if s = '' then
    s := 'item';
  end if;
  return left(s, 120);
end;
$$;

revoke all on function public.marketplace_slugify(text) from public, anon, authenticated;
grant execute on function public.marketplace_slugify(text) to postgres, service_role;

-- ── Categories ──────────────────────────────────────────────────────────────
alter table public.categories
  add column if not exists slug text,
  add column if not exists description text not null default '',
  add column if not exists image_url text;

update public.categories
set slug = public.marketplace_slugify(name)
where slug is null or trim(slug) = '';

alter table public.categories
  alter column slug set not null;

create unique index if not exists categories_slug_uidx
  on public.categories (lower(slug));

-- ── Locations ───────────────────────────────────────────────────────────────
alter table public.locations
  add column if not exists slug text,
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;

update public.locations
set slug = public.marketplace_slugify(city || '-' || state)
where slug is null or trim(slug) = '';

-- Deduplicate slug collisions within locations
with ranked as (
  select
    id,
    slug,
    row_number() over (partition by lower(slug) order by sort_order, created_at, id) as rn
  from public.locations
)
update public.locations loc
set slug = loc.slug || '-' || ranked.rn
from ranked
where loc.id = ranked.id and ranked.rn > 1;

alter table public.locations
  alter column slug set not null;

create unique index if not exists locations_slug_uidx
  on public.locations (lower(slug));

alter table public.locations
  drop constraint if exists locations_lat_range,
  drop constraint if exists locations_lng_range;

alter table public.locations
  add constraint locations_lat_range
    check (latitude is null or (latitude >= -90 and latitude <= 90)),
  add constraint locations_lng_range
    check (longitude is null or (longitude >= -180 and longitude <= 180));

-- ── Amenities ───────────────────────────────────────────────────────────────
alter table public.amenities
  add column if not exists description text not null default '',
  add column if not exists icon text not null default '⭐',
  add column if not exists category text;

-- ── Service types ───────────────────────────────────────────────────────────
alter table public.service_types
  add column if not exists slug text,
  add column if not exists image_url text;

update public.service_types
set slug = public.marketplace_slugify(name)
where slug is null or trim(slug) = '';

with ranked as (
  select
    id,
    slug,
    row_number() over (partition by lower(slug) order by sort_order, created_at, id) as rn
  from public.service_types
)
update public.service_types st
set slug = st.slug || '-' || ranked.rn
from ranked
where st.id = ranked.id and ranked.rn > 1;

alter table public.service_types
  alter column slug set not null;

create unique index if not exists service_types_slug_uidx
  on public.service_types (lower(slug));

-- ── Listing filter kinds ────────────────────────────────────────────────────
alter table public.listing_filters
  drop constraint if exists listing_filters_kind_ok;

alter table public.listing_filters
  add constraint listing_filters_kind_ok check (kind in (
    'purpose','city','locality','type','bhk','furnishing','price','size',
    'amenities','rera','featured',
    'text','toggle','multi',
    'dropdown','checkbox','range','boolean','number','date'
  ));

comment on column public.categories.slug is 'URL-safe unique category slug';
comment on column public.locations.slug is 'URL-safe unique city slug';
comment on column public.service_types.slug is 'URL-safe unique service type slug';
comment on column public.amenities.category is 'Optional amenity grouping label for admin UI';
