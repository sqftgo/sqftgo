-- Phase 8: dealer/admin messaging threads.

create type public.message_thread_kind as enum ('direct', 'support');
create type public.message_thread_status as enum ('open', 'resolved', 'archived');

create table public.message_threads (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  created_by uuid not null references public.profiles (id) on delete cascade,
  participant_ids uuid[] not null,
  property_id uuid references public.properties (id) on delete set null,
  kind public.message_thread_kind not null default 'direct',
  status public.message_thread_status not null default 'open',
  last_message_at timestamptz not null default now(),
  last_message_preview text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint message_threads_subject_len check (char_length(trim(subject)) >= 2),
  constraint message_threads_participants_len check (cardinality(participant_ids) >= 2)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.message_threads (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  constraint messages_body_len check (char_length(trim(body)) >= 1 and char_length(body) <= 5000)
);

create table public.message_thread_reads (
  thread_id uuid not null references public.message_threads (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  last_read_at timestamptz not null default now(),
  primary key (thread_id, user_id)
);

create index message_threads_last_message_at_idx
  on public.message_threads (last_message_at desc);
create index message_threads_participant_ids_idx
  on public.message_threads using gin (participant_ids);
create index message_threads_kind_status_idx
  on public.message_threads (kind, status);
create index messages_thread_id_created_at_idx
  on public.messages (thread_id, created_at);

comment on table public.message_threads is 'Dealer/admin inbox conversation threads';
comment on table public.messages is 'Messages within conversation threads';

create or replace function public.set_message_threads_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger message_threads_set_updated_at
  before update on public.message_threads
  for each row execute function public.set_message_threads_updated_at();

revoke execute on function public.set_message_threads_updated_at() from public, anon, authenticated;
grant execute on function public.set_message_threads_updated_at() to postgres, service_role;

alter table public.message_threads enable row level security;
alter table public.messages enable row level security;
alter table public.message_thread_reads enable row level security;

revoke all on table public.message_threads from anon, authenticated, public;
revoke all on table public.messages from anon, authenticated, public;
revoke all on table public.message_thread_reads from anon, authenticated, public;

grant select on table public.message_threads to authenticated;
grant select on table public.messages to authenticated;
grant select, insert, update on table public.message_thread_reads to authenticated;
grant all on table public.message_threads to service_role;
grant all on table public.messages to service_role;
grant all on table public.message_thread_reads to service_role;

create policy "message_threads_select_scoped"
  on public.message_threads for select to authenticated
  using (
    (select auth.uid()) = any (participant_ids)
    or exists (
      select 1 from public.profiles pr
      where pr.id = (select auth.uid())
        and pr.status = 'active'
        and pr.role = 'admin'
    )
  );

create policy "messages_select_scoped"
  on public.messages for select to authenticated
  using (
    exists (
      select 1 from public.message_threads t
      where t.id = messages.thread_id
        and (
          (select auth.uid()) = any (t.participant_ids)
          or exists (
            select 1 from public.profiles pr
            where pr.id = (select auth.uid())
              and pr.status = 'active'
              and pr.role = 'admin'
          )
        )
    )
  );

create policy "message_thread_reads_own"
  on public.message_thread_reads for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
