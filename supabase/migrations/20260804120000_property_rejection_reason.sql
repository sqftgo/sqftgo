-- Persist admin rejection feedback on listings so brokers see why a listing failed review.

alter table public.properties
  add column if not exists rejection_reason text;

comment on column public.properties.rejection_reason is
  'Admin feedback when status is rejected; cleared when listing is re-approved or resubmitted.';
