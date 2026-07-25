-- Local seed: single admin (not shown on public login UI) + optional demo user/broker.
-- Defaults match README local credentials. Change passwords before any shared/staging use.

create extension if not exists pgcrypto with schema extensions;

-- Fixed UUIDs for reproducible local seeds
-- admin: a0000000-0000-4000-8000-000000000001
-- broker: a0000000-0000-4000-8000-000000000002
-- user:   a0000000-0000-4000-8000-000000000003

create or replace function public.seed_auth_user(
  p_id uuid,
  p_email text,
  p_password text,
  p_name text
)
returns void
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
begin
  if exists (select 1 from auth.users where id = p_id) then
    return;
  end if;

  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  ) values (
    '00000000-0000-0000-0000-000000000000',
    p_id,
    'authenticated',
    'authenticated',
    p_email,
    extensions.crypt(p_password, extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('name', p_name),
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  if not exists (
    select 1 from auth.identities
    where user_id = p_id and provider = 'email'
  ) then
    insert into auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) values (
      gen_random_uuid(),
      p_id,
      jsonb_build_object('sub', p_id::text, 'email', p_email),
      'email',
      p_id::text,
      now(),
      now(),
      now()
    );
  end if;
end;
$$;

select public.seed_auth_user(
  'a0000000-0000-4000-8000-000000000001'::uuid,
  'admin@sqftgo.com',
  'admin2026',
  'Super Admin'
);

select public.seed_auth_user(
  'a0000000-0000-4000-8000-000000000002'::uuid,
  'broker@sqftgo.com',
  'broker2026',
  'Rajesh Mehta'
);

select public.seed_auth_user(
  'a0000000-0000-4000-8000-000000000003'::uuid,
  'user@sqftgo.com',
  'user2026',
  'Arjun Sharma'
);

-- Promote the single seeded admin (trigger always inserts role=user)
update public.profiles
set
  role = 'admin',
  name = 'Super Admin'
where id = 'a0000000-0000-4000-8000-000000000001'::uuid;

update public.profiles
set
  role = 'broker',
  name = 'Rajesh Mehta'
where id = 'a0000000-0000-4000-8000-000000000002'::uuid;

update public.profiles
set name = 'Arjun Sharma'
where id = 'a0000000-0000-4000-8000-000000000003'::uuid;

drop function public.seed_auth_user(uuid, text, text, text);
