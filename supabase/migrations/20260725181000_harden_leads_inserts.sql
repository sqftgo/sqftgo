-- Phase 4 follow-up: public lead writes only via Next.js service role (Zod-validated).

revoke insert on table public.assistance_requests from anon, authenticated;
revoke insert on table public.general_enquiries from anon, authenticated;

drop policy if exists "assistance_requests_insert_public" on public.assistance_requests;
drop policy if exists "general_enquiries_insert_public" on public.general_enquiries;
