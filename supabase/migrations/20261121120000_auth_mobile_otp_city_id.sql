-- Mobile OTP auth + profile city_id.
-- Idempotent: safe if partially applied via dashboard / MCP.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Profile columns
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists country_code text,
  add column if not exists mobile_verified boolean not null default false,
  add column if not exists mobile_verified_at timestamptz,
  add column if not exists auth_provider text,
  add column if not exists city_id uuid;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_city_id_fkey'
  ) then
    alter table public.profiles
      add constraint profiles_city_id_fkey
      foreign key (city_id) references public.locations (id) on delete set null;
  end if;
end $$;

create index if not exists profiles_city_id_idx on public.profiles (city_id);

-- One verified mobile per account (normalized national + country).
create unique index if not exists profiles_verified_mobile_uidx
  on public.profiles (country_code, phone)
  where mobile_verified = true
    and phone is not null
    and country_code is not null
    and length(trim(phone)) > 0;

comment on column public.profiles.city_id is 'FK to public.locations; preferred home city';
comment on column public.profiles.mobile_verified is 'True after MSG91 OTP claim during signup or verified login bind';

-- ---------------------------------------------------------------------------
-- OTP challenges + short-lived registration claims
-- ---------------------------------------------------------------------------
create table if not exists public.auth_mobile_otp_challenges (
  id uuid primary key default gen_random_uuid(),
  purpose text not null check (purpose in ('register', 'login')),
  country_code text not null,
  national_number text not null,
  code_hash text not null,
  attempts int not null default 0,
  max_attempts int not null default 5,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  voided_at timestamptz,
  locked_until timestamptz,
  last_sent_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists auth_mobile_otp_challenges_lookup_idx
  on public.auth_mobile_otp_challenges (purpose, country_code, national_number, created_at desc);

create table if not exists public.auth_mobile_claims (
  id uuid primary key default gen_random_uuid(),
  claim_token text not null unique,
  country_code text not null,
  national_number text not null,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  user_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists auth_mobile_claims_token_idx
  on public.auth_mobile_claims (claim_token)
  where consumed_at is null;

alter table public.auth_mobile_otp_challenges enable row level security;
alter table public.auth_mobile_claims enable row level security;

-- No policies for anon/authenticated — service role only via SECURITY DEFINER RPCs.
revoke all on public.auth_mobile_otp_challenges from anon, authenticated;
revoke all on public.auth_mobile_claims from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public._auth_mobile_hash(p_code text)
returns text
language sql
immutable
set search_path = public, extensions
as $$
  select encode(digest(convert_to(trim(p_code), 'UTF8'), 'sha256'), 'hex');
$$;

create or replace function public._auth_mobile_json_error(
  p_code text,
  p_message text,
  p_extra jsonb default '{}'::jsonb
)
returns jsonb
language sql
immutable
as $$
  select jsonb_build_object('ok', false, 'code', p_code, 'message', p_message) || coalesce(p_extra, '{}'::jsonb);
$$;

-- ---------------------------------------------------------------------------
-- issue_auth_mobile_otp
-- ---------------------------------------------------------------------------
create or replace function public.issue_auth_mobile_otp(
  p_purpose text,
  p_country text,
  p_national text
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_purpose text := lower(trim(p_purpose));
  v_country text := regexp_replace(coalesce(p_country, ''), '\D', '', 'g');
  v_national text := regexp_replace(coalesce(p_national, ''), '\D', '', 'g');
  v_existing public.profiles%rowtype;
  v_recent public.auth_mobile_otp_challenges%rowtype;
  v_code text;
  v_id uuid;
  v_expires timestamptz;
  v_cooldown int := 30;
  v_wait int;
begin
  if v_purpose not in ('register', 'login') then
    return public._auth_mobile_json_error('invalid_purpose', 'Unsupported verification purpose.');
  end if;

  if v_country = '' then v_country := '91'; end if;

  if v_country = '91' then
    if v_national ~ '^91[6-9][0-9]{9}$' then
      v_national := substr(v_national, 3);
    end if;
    if v_national !~ '^[6-9][0-9]{9}$' then
      return public._auth_mobile_json_error('invalid_number', 'Enter a 10-digit Indian mobile number.');
    end if;
  elsif v_national !~ '^[0-9]{6,15}$' then
    return public._auth_mobile_json_error('invalid_number', 'Enter a valid mobile number.');
  end if;

  if v_purpose = 'register' then
    select * into v_existing
    from public.profiles
    where mobile_verified = true
      and country_code = v_country
      and phone = v_national
    limit 1;
    if found then
      return public._auth_mobile_json_error('duplicate', 'This mobile number is already registered.');
    end if;
  else
    select * into v_existing
    from public.profiles
    where mobile_verified = true
      and country_code = v_country
      and phone = v_national
      and status = 'active'
    limit 1;
    if not found then
      return public._auth_mobile_json_error('not_found', 'No verified account found for this mobile number.');
    end if;
  end if;

  select * into v_recent
  from public.auth_mobile_otp_challenges
  where purpose = v_purpose
    and country_code = v_country
    and national_number = v_national
    and voided_at is null
    and consumed_at is null
  order by created_at desc
  limit 1;

  if found then
    if v_recent.locked_until is not null and v_recent.locked_until > now() then
      return public._auth_mobile_json_error(
        'locked',
        'Too many attempts. Try again later.',
        jsonb_build_object(
          'resendAfterSeconds',
          greatest(1, ceil(extract(epoch from (v_recent.locked_until - now()))))
        )
      );
    end if;
    v_wait := greatest(
      0,
      ceil(extract(epoch from (v_recent.last_sent_at + make_interval(secs => v_cooldown) - now())))
    );
    if v_wait > 0 then
      return public._auth_mobile_json_error(
        'cooldown',
        'Please wait before requesting another code.',
        jsonb_build_object('resendAfterSeconds', v_wait)
      );
    end if;
  end if;

  -- Invalidate prior open challenges for this number/purpose.
  update public.auth_mobile_otp_challenges
  set voided_at = now()
  where purpose = v_purpose
    and country_code = v_country
    and national_number = v_national
    and consumed_at is null
    and voided_at is null;

  v_code := lpad((floor(random() * 1000000))::int::text, 6, '0');
  v_expires := now() + interval '5 minutes';
  v_id := gen_random_uuid();

  insert into public.auth_mobile_otp_challenges (
    id, purpose, country_code, national_number, code_hash, expires_at, last_sent_at
  ) values (
    v_id, v_purpose, v_country, v_national, public._auth_mobile_hash(v_code), v_expires, now()
  );

  return jsonb_build_object(
    'ok', true,
    'challengeId', v_id::text,
    'otp', v_code,
    'expiresAt', v_expires,
    'resendAfterSeconds', v_cooldown,
    'userId', case when v_purpose = 'login' then v_existing.id::text else null end
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- void_mobile_otp
-- ---------------------------------------------------------------------------
create or replace function public.void_mobile_otp(p_challenge text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  begin
    v_id := p_challenge::uuid;
  exception when others then
    return public._auth_mobile_json_error('invalid_challenge', 'Invalid challenge.');
  end;

  update public.auth_mobile_otp_challenges
  set voided_at = coalesce(voided_at, now())
  where id = v_id;

  return jsonb_build_object('ok', true);
end;
$$;

-- ---------------------------------------------------------------------------
-- consume_auth_mobile_otp
-- ---------------------------------------------------------------------------
create or replace function public.consume_auth_mobile_otp(
  p_purpose text,
  p_country text,
  p_national text,
  p_code text
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_purpose text := lower(trim(p_purpose));
  v_country text := regexp_replace(coalesce(p_country, ''), '\D', '', 'g');
  v_national text := regexp_replace(coalesce(p_national, ''), '\D', '', 'g');
  v_code text := trim(coalesce(p_code, ''));
  v_row public.auth_mobile_otp_challenges%rowtype;
  v_profile public.profiles%rowtype;
  v_token text;
  v_claim_expires timestamptz;
begin
  if v_purpose not in ('register', 'login') then
    return public._auth_mobile_json_error('invalid_purpose', 'Unsupported verification purpose.');
  end if;
  if v_country = '' then v_country := '91'; end if;
  if v_country = '91' and v_national ~ '^91[6-9][0-9]{9}$' then
    v_national := substr(v_national, 3);
  end if;
  if v_code !~ '^[0-9]{6}$' then
    return public._auth_mobile_json_error('invalid_code', 'Enter the 6-digit code.');
  end if;

  select * into v_row
  from public.auth_mobile_otp_challenges
  where purpose = v_purpose
    and country_code = v_country
    and national_number = v_national
    and voided_at is null
    and consumed_at is null
  order by created_at desc
  limit 1
  for update;

  if not found then
    return public._auth_mobile_json_error('expired', 'Code expired. Request a new one.');
  end if;

  if v_row.locked_until is not null and v_row.locked_until > now() then
    return public._auth_mobile_json_error('locked', 'Too many attempts. Request a new code later.');
  end if;

  if v_row.expires_at < now() then
    update public.auth_mobile_otp_challenges set voided_at = now() where id = v_row.id;
    return public._auth_mobile_json_error('expired', 'Code expired. Request a new one.');
  end if;

  if v_row.code_hash <> public._auth_mobile_hash(v_code) then
    update public.auth_mobile_otp_challenges
    set
      attempts = attempts + 1,
      locked_until = case
        when attempts + 1 >= max_attempts then now() + interval '15 minutes'
        else locked_until
      end
    where id = v_row.id;
    if v_row.attempts + 1 >= v_row.max_attempts then
      return public._auth_mobile_json_error('locked', 'Too many incorrect codes. Try again later.');
    end if;
    return public._auth_mobile_json_error('invalid_code', 'Incorrect code. Try again.');
  end if;

  update public.auth_mobile_otp_challenges
  set consumed_at = now()
  where id = v_row.id;

  if v_purpose = 'register' then
    v_token := encode(gen_random_bytes(24), 'hex');
    v_claim_expires := now() + interval '15 minutes';
    insert into public.auth_mobile_claims (
      claim_token, country_code, national_number, expires_at
    ) values (
      v_token, v_country, v_national, v_claim_expires
    );
    return jsonb_build_object(
      'ok', true,
      'claimToken', v_token,
      'phone', v_national,
      'countryCode', v_country,
      'purpose', 'register',
      'expiresAt', v_claim_expires
    );
  end if;

  select * into v_profile
  from public.profiles
  where mobile_verified = true
    and country_code = v_country
    and phone = v_national
  limit 1;

  if not found then
    return public._auth_mobile_json_error('not_found', 'No verified account found for this mobile number.');
  end if;

  return jsonb_build_object(
    'ok', true,
    'userId', v_profile.id::text,
    'phone', v_national,
    'countryCode', v_country,
    'purpose', 'login'
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- claim_mobile_verification (bind verified mobile to new auth user)
-- ---------------------------------------------------------------------------
create or replace function public.claim_mobile_verification(
  p_claim_token text,
  p_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_claim public.auth_mobile_claims%rowtype;
  v_dup public.profiles%rowtype;
begin
  if p_user_id is null or coalesce(trim(p_claim_token), '') = '' then
    return public._auth_mobile_json_error('unauthorized', 'Mobile verification failed.');
  end if;

  select * into v_claim
  from public.auth_mobile_claims
  where claim_token = trim(p_claim_token)
  for update;

  if not found then
    return public._auth_mobile_json_error('expired', 'Mobile verification expired. Request a new code.');
  end if;
  if v_claim.consumed_at is not null then
    return public._auth_mobile_json_error('expired', 'Mobile verification already used. Request a new code.');
  end if;
  if v_claim.expires_at < now() then
    return public._auth_mobile_json_error('expired', 'Mobile verification expired. Request a new code.');
  end if;

  select * into v_dup
  from public.profiles
  where mobile_verified = true
    and country_code = v_claim.country_code
    and phone = v_claim.national_number
    and id <> p_user_id
  limit 1;
  if found then
    return public._auth_mobile_json_error('duplicate', 'This mobile number is already registered.');
  end if;

  update public.profiles
  set
    phone = v_claim.national_number,
    country_code = v_claim.country_code,
    mobile_verified = true,
    mobile_verified_at = now(),
    auth_provider = coalesce(auth_provider, 'email'),
    updated_at = now()
  where id = p_user_id;

  if not found then
    return public._auth_mobile_json_error('not_found', 'Profile not found for this account.');
  end if;

  update public.auth_mobile_claims
  set consumed_at = now(), user_id = p_user_id
  where id = v_claim.id;

  return jsonb_build_object(
    'ok', true,
    'phone', v_claim.national_number,
    'countryCode', v_claim.country_code,
    'mobileVerified', true
  );
end;
$$;

revoke all on function public.issue_auth_mobile_otp(text, text, text) from public, anon, authenticated;
revoke all on function public.consume_auth_mobile_otp(text, text, text, text) from public, anon, authenticated;
revoke all on function public.claim_mobile_verification(text, uuid) from public, anon, authenticated;
revoke all on function public.void_mobile_otp(text) from public, anon, authenticated;

grant execute on function public.issue_auth_mobile_otp(text, text, text) to service_role;
grant execute on function public.consume_auth_mobile_otp(text, text, text, text) to service_role;
grant execute on function public.claim_mobile_verification(text, uuid) to service_role;
grant execute on function public.void_mobile_otp(text) to service_role;
