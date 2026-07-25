-- Phase 10: immutable admin activity audit log.

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  performed_by text not null,
  actor_id uuid references public.profiles (id) on delete set null,
  role text not null,
  target text not null default '',
  entity_type text,
  entity_id uuid,
  created_at timestamptz not null default now(),
  constraint activity_logs_action_len check (char_length(trim(action)) >= 2),
  constraint activity_logs_performed_by_len check (char_length(trim(performed_by)) >= 2),
  constraint activity_logs_role_len check (char_length(trim(role)) >= 2),
  constraint activity_logs_role_allowed check (
    role in ('Admin', 'Dealer', 'Broker', 'User')
  )
);

create index activity_logs_created_at_idx on public.activity_logs (created_at desc);
create index activity_logs_actor_id_created_at_idx
  on public.activity_logs (actor_id, created_at desc);

comment on table public.activity_logs is 'Immutable marketplace admin/dealer activity audit trail';

alter table public.activity_logs enable row level security;

revoke all on table public.activity_logs from anon, authenticated, public;
grant all on table public.activity_logs to service_role;

-- Seed historical mock events (actor_id resolved when profile email matches).
insert into public.activity_logs (action, performed_by, actor_id, role, target, created_at)
select
  v.action,
  v.performed_by,
  p.id,
  v.role,
  v.target,
  v.created_at
from (
  values
    (
      'Property Approved',
      'admin@sqftgo.com',
      'Admin',
      'prop-1 — Ultra Luxury Lake-Facing Villa',
      timestamptz '2026-07-16 14:32:00+00'
    ),
    (
      'User Role Changed',
      'admin@sqftgo.com',
      'Admin',
      'broker@sqftgo.com → broker',
      timestamptz '2026-07-15 10:15:00+00'
    ),
    (
      'New Dealer Registered',
      'vikram@mewarproperty.in',
      'Broker',
      'Mewar Property Consultants',
      timestamptz '2026-07-14 09:45:00+00'
    ),
    (
      'Property Deleted',
      'admin@sqftgo.com',
      'Admin',
      'prop-draft-001',
      timestamptz '2026-07-13 16:22:00+00'
    ),
    (
      'Inquiry Submitted',
      'user@sqftgo.com',
      'User',
      'prop-2 — Premium 3 BHK Flat in C-Scheme',
      timestamptz '2026-07-12 11:05:00+00'
    )
) as v(action, performed_by, role, target, created_at)
left join public.profiles p on lower(p.email) = lower(v.performed_by);
