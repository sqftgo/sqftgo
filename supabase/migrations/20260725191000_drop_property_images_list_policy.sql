-- Phase 5 follow-up: public buckets serve objects by URL without a listing policy.

drop policy if exists "property_images_public_read" on storage.objects;
