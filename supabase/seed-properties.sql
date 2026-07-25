-- Demo properties for Phase 1 (owner = broker@sqftgo.com).
-- Safe to re-run only on empty tables; otherwise insert may duplicate.

insert into public.properties (
  owner_id, title, price, type, purpose, bhk, bathrooms, parking, year_built,
  city, state, country, locality, size, furnished, description, amenities, images,
  owner_name, owner_phone, owner_email, status, featured, rera_approved
)
select
  p.id,
  v.title,
  v.price,
  v.type::public.property_type,
  v.purpose::public.property_purpose,
  v.bhk,
  v.bathrooms,
  v.parking,
  v.year_built,
  v.city,
  v.state,
  v.country,
  v.locality,
  v.size,
  v.furnished::public.furnished_status,
  v.description,
  v.amenities,
  v.images,
  v.owner_name,
  v.owner_phone,
  v.owner_email,
  v.status::public.property_status,
  v.featured,
  v.rera_approved
from public.profiles p
cross join (
  values
    (
      'Lakeview Heritage Haveli', 18500000::numeric, 'Villa', 'sell', 4, 4, 2, 2018,
      'Udaipur', 'Rajasthan', 'India', 'Fateh Sagar', 4200::numeric, 'Furnished',
      'A restored heritage haveli overlooking Fateh Sagar with private courtyard and lake-facing terraces.',
      array['Lake View','Parking','Power Backup','Garden']::text[],
      array['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200']::text[],
      'Rajesh Mehta', '+91 98765 43210', 'broker@sqftgo.com', 'active', true, true
    ),
    (
      'Blue City Boutique Apartment', 65000::numeric, 'Apartment', 'rent', 2, 2, 1, 2021,
      'Jodhpur', 'Rajasthan', 'India', 'Ratanada', 1250::numeric, 'Semi-Furnished',
      'Bright 2BHK near the old city with city views and covered parking.',
      array['Lift','Security','Balcony']::text[],
      array['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200']::text[],
      'Rajesh Mehta', '+91 98765 43210', 'broker@sqftgo.com', 'active', false, false
    ),
    (
      'Amber Hills Farmhouse', 9200000::numeric, 'Home', 'sell', 3, 3, 3, 2015,
      'Jaipur', 'Rajasthan', 'India', 'Amer Road', 3100::numeric, 'Unfurnished',
      'Spacious farmhouse plot with fruit orchard — pending admin review.',
      array['Garden','Well Water','Boundary Wall']::text[],
      array['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200']::text[],
      'Rajesh Mehta', '+91 98765 43210', 'broker@sqftgo.com', 'pending_review', false, false
    ),
    (
      'Pink City Commercial Shop', 4500000::numeric, 'Shop', 'sell', null::int, 1, 0, 2010,
      'Jaipur', 'Rajasthan', 'India', 'MI Road', 650::numeric, 'Unfurnished',
      'Ground-floor retail shop on MI Road with high footfall frontage.',
      array['Main Road','Shutters']::text[],
      array['https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200']::text[],
      'Rajesh Mehta', '+91 98765 43210', 'broker@sqftgo.com', 'active', false, true
    )
) as v(
  title, price, type, purpose, bhk, bathrooms, parking, year_built,
  city, state, country, locality, size, furnished, description, amenities, images,
  owner_name, owner_phone, owner_email, status, featured, rera_approved
)
where p.email = 'broker@sqftgo.com'
  and not exists (select 1 from public.properties limit 1);
