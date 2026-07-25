-- Phase B: allow admin reject without hard-delete.
-- Brokers remain limited to draft/pending_review via protect_property_privileges.

ALTER TYPE public.property_status ADD VALUE IF NOT EXISTS 'rejected';
