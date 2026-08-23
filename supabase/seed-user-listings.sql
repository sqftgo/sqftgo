-- Demo listings for role=user (Arjun Sharma / user@sqftgo.com).
-- Safe to re-run: skips if those titles already exist for that owner.

insert into public.properties (
  owner_id, title, price, type, purpose, bhk, bathrooms, parking, year_built,
  city, state, country, locality, size, furnished, description, amenities, images,
  owner_name, owner_phone, owner_email, status, featured, rera_approved,
  nearby_hospital, nearby_school, nearby_transportation
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
  false,
  v.rera_approved,
  v.nearby_hospital,
  v.nearby_school,
  v.nearby_transportation
from public.profiles p
cross join (
  values
    (
      'Fateh Sagar 2BHK Owner Apartment',
      7200000::numeric,
      'Apartment',
      'sell',
      2,
      2,
      1,
      2019,
      'Udaipur',
      'Rajasthan',
      'India',
      'Fateh Sagar',
      1180::numeric,
      'Semi-Furnished',
      'Owner-listed 2BHK near Fateh Sagar with lake-side breeze and covered parking. Listed by a verified client, not a dealer.',
      array['Parking','Lift','Security','Balcony']::text[],
      array['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200']::text[],
      'Arjun Sharma',
      '+91 90000 11122',
      'user@sqftgo.com',
      'active',
      false,
      'GBH American Hospital, 2 km',
      'St. Anthony School, 1 km',
      'Fateh Sagar bus stand, 800 m'
    ),
    (
      'Amer Road Family Home',
      5400000::numeric,
      'Home',
      'sell',
      3,
      2,
      1,
      2012,
      'Jaipur',
      'Rajasthan',
      'India',
      'Amer Road',
      1650::numeric,
      'Unfurnished',
      'Independent family home awaiting admin review. Nearest hospital, school, and bus stop are listed.',
      array['Garden','Parking','Boundary Wall']::text[],
      array['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200']::text[],
      'Arjun Sharma',
      '+91 90000 11122',
      'user@sqftgo.com',
      'pending_review',
      false,
      'SMS Hospital, 4 km',
      'Maharaja Sawai Man Singh School, 2 km',
      'Amer Road bus stop, 500 m'
    )
) as v(
  title, price, type, purpose, bhk, bathrooms, parking, year_built,
  city, state, country, locality, size, furnished, description, amenities, images,
  owner_name, owner_phone, owner_email, status, rera_approved,
  nearby_hospital, nearby_school, nearby_transportation
)
where p.email = 'user@sqftgo.com'
  and not exists (
    select 1
    from public.properties existing
    where existing.owner_id = p.id
      and existing.title = v.title
  );

update public.profiles
set
  listing_status = 'approved',
  listing_verified_at = coalesce(listing_verified_at, now())
where email = 'user@sqftgo.com'
  and listing_status is distinct from 'rejected';

insert into public.property_inquiries (property_id, name, email, phone, message, status)
select
  pr.id,
  'Kavya Patel',
  'kavya.buyer@example.com',
  '+91 98111 22334',
  'Is the Fateh Sagar 2BHK still available? Can we visit this weekend?',
  'new'
from public.properties pr
join public.profiles p on p.id = pr.owner_id
where p.email = 'user@sqftgo.com'
  and pr.title = 'Fateh Sagar 2BHK Owner Apartment'
  and not exists (
    select 1
    from public.property_inquiries pi
    where pi.property_id = pr.id
      and pi.email = 'kavya.buyer@example.com'
  );
