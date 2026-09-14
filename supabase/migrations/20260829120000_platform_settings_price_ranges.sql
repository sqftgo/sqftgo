-- Store admin-managed budget filter options for all clients
ALTER TABLE public.platform_settings
  ADD COLUMN IF NOT EXISTS price_ranges jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.platform_settings.price_ranges IS
  'Admin-managed buy/rent min/max dropdown options for public listing filters';
