import { NextResponse, type NextRequest } from "next/server";
import type { ProfileRow } from "@/types/database";
import { createRouteClient } from "@/lib/supabase/route";
import { createServiceClient } from "@/lib/supabase/admin";
import { jsonError } from "@/lib/api/auth";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import { skipEmailConfirmEnabled } from "@/lib/auth/email-confirm";
import { asClaimResult } from "@/lib/auth/mobile-otp";
import { countryDigits, nationalDigits, validateMobile } from "@/lib/auth/phone";
import { enforceAuthRateLimit } from "@/lib/auth/rate-limit";
import { getSiteUrl } from "@/lib/auth/urls";
import { authSessionPayload } from "@/lib/mappers/profile";

type SignupBody = {
  email?: string;
  password?: string;
  name?: string;
  /** Dealer registration grants broker role after profile creation. */
  intent?: "user" | "dealer";
  countryCode?: string;
  mobileNumber?: string;
  mobileClaimToken?: string;
  cityId?: string;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function promoteDealerIfNeeded(
  userId: string,
  intent: "user" | "dealer" | undefined
): Promise<"user" | "broker" | "admin" | null> {
  if (intent !== "dealer" || !hasServiceRoleKey()) return null;
  const admin = createServiceClient();
  const { data } = await admin
    .from("profiles")
    .update({ role: "broker" })
    .eq("id", userId)
    .eq("role", "user")
    .select("role")
    .maybeSingle();
  return (data?.role as "user" | "broker" | "admin" | undefined) ?? "broker";
}

const MIN_PASSWORD_LENGTH = 8;

async function loadProfile(
  supabase: ReturnType<typeof createRouteClient>["supabase"],
  userId: string
): Promise<ProfileRow | null> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    if (data) return data;
    await new Promise((r) => setTimeout(r, 150));
  }
  return null;
}

function publicAuthError(message: string): string {
  if (/rate limit|email rate/i.test(message)) {
    return "Too many attempts. Please wait a few minutes and try again.";
  }
  if (/already|registered|exists/i.test(message)) {
    return "Unable to create account with those details.";
  }
  return "Unable to create account. Please try again.";
}

async function resolveActiveCity(
  cityId: string | undefined
): Promise<{ id: string; city: string } | null | undefined> {
  if (cityId === undefined || cityId === null || cityId === "") return undefined;
  if (!UUID_RE.test(cityId)) return null;
  const admin = createServiceClient();
  const { data } = await admin
    .from("locations")
    .select("id, city")
    .eq("id", cityId)
    .eq("active", true)
    .maybeSingle();
  return data ?? null;
}

async function claimMobileAndPatchProfile(opts: {
  userId: string;
  claimToken: string;
  city?: { id: string; city: string };
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const admin = createServiceClient();
  const { data, error } = await admin.rpc("claim_mobile_verification", {
    p_claim_token: opts.claimToken,
    p_user_id: opts.userId,
  });

  if (error) {
    console.error("[signup] claim_mobile_verification failed");
    return { ok: false, message: "Mobile verification failed. Request a new code." };
  }

  const claim = asClaimResult(data);
  if (!claim.ok) {
    return {
      ok: false,
      message: claim.message ?? "Mobile verification expired. Request a new code.",
    };
  }

  if (opts.city) {
    await admin
      .from("profiles")
      .update({ city_id: opts.city.id, city: opts.city.city })
      .eq("id", opts.userId);
  }

  return { ok: true };
}

async function deleteAuthUser(userId: string) {
  try {
    const admin = createServiceClient();
    await admin.auth.admin.deleteUser(userId);
  } catch {
    console.error("[signup] failed to delete auth user after claim failure");
  }
}

export async function POST(request: NextRequest) {
  if (!hasSupabaseEnv()) {
    return jsonError("Supabase is not configured", 503);
  }
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required for signup.", 503);
  }

  const limited = await enforceAuthRateLimit(
    request,
    "signup",
    "Too many signup attempts. Please try again shortly."
  );
  if (limited) return limited;

  let body: SignupBody;
  try {
    body = (await request.json()) as SignupBody;
  } catch {
    return jsonError("Invalid JSON body");
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";
  const name = body.name?.trim() ?? "";
  const intent = body.intent === "dealer" ? "dealer" : "user";
  const claimToken = body.mobileClaimToken?.trim() ?? "";
  const country = countryDigits(body.countryCode);
  const national = nationalDigits(country, body.mobileNumber);

  if (!email || !password || !name) {
    return jsonError("All fields are required");
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return jsonError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }
  if (email === "admin@sqftgo.com") {
    return jsonError("This email is reserved", 403);
  }
  if (!claimToken || !body.countryCode || !body.mobileNumber) {
    return jsonError("Verify your mobile number first.", 400, { code: "mobile_required" });
  }
  const mobileError = validateMobile(country, national);
  if (mobileError) {
    return jsonError(mobileError, 400, { code: "invalid_number" });
  }

  const resolvedCity = await resolveActiveCity(body.cityId?.trim());
  if (body.cityId?.trim() && resolvedCity === null) {
    return jsonError("Choose a valid active city.", 400, { code: "invalid_city" });
  }

  const siteUrl = getSiteUrl(request);
  const { supabase, applyCookies } = createRouteClient(request);

  /**
   * When email confirm is skipped (local/default, or AUTH_SKIP_EMAIL_CONFIRM),
   * create a confirmed user via Admin API so signup can sign in immediately
   * without Supabase sending a verification email.
   */
  if (skipEmailConfirmEnabled()) {
    const admin = createServiceClient();
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, intent },
    });

    if (createError || !created.user) {
      return jsonError(publicAuthError(createError?.message ?? "Unable to create account"), 400);
    }

    const claimed = await claimMobileAndPatchProfile({
      userId: created.user.id,
      claimToken,
      city: resolvedCity ?? undefined,
    });
    if (!claimed.ok) {
      await deleteAuthUser(created.user.id);
      return jsonError(claimed.message, 400, { code: "mobile_claim_failed" });
    }

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) {
      return jsonError("Account created but sign-in failed. Try logging in.", 500);
    }

    let profile = await loadProfile(supabase, created.user.id);
    if (!profile && hasServiceRoleKey()) {
      const { data } = await admin.from("profiles").select("*").eq("id", created.user.id).maybeSingle();
      profile = data;
    }
    if (!profile) {
      return jsonError(
        "Account created but profile is not ready. Push the profiles migration, then sign in.",
        500
      );
    }
    if (profile.name !== name) {
      await admin.from("profiles").update({ name }).eq("id", created.user.id);
      profile = { ...profile, name };
    }

    const promoted = await promoteDealerIfNeeded(created.user.id, intent);
    if (promoted) profile = { ...profile, role: promoted };

    return applyCookies(
      NextResponse.json(
        authSessionPayload(profile, signInData.session?.access_token, {
          refreshToken: signInData.session?.refresh_token,
          expiresAt: signInData.session?.expires_at,
        }),
        { status: 201 }
      )
    );
  }

  const dealerNext = intent === "dealer" ? "/dealer/dashboard" : "/";
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, intent },
      emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(dealerNext)}`,
    },
  });

  if (error || !data.user) {
    return jsonError(publicAuthError(error?.message ?? "Unable to create account"), 400);
  }

  const claimed = await claimMobileAndPatchProfile({
    userId: data.user.id,
    claimToken,
    city: resolvedCity ?? undefined,
  });
  if (!claimed.ok) {
    await deleteAuthUser(data.user.id);
    return jsonError(claimed.message, 400, { code: "mobile_claim_failed" });
  }

  // Email confirmation required — no session yet
  if (!data.session) {
    return NextResponse.json(
      {
        status: "confirm_email",
        email,
        message: "Check your email to confirm your account before signing in.",
        phone: national,
        countryCode: country,
        mobileVerified: true,
      },
      { status: 201 }
    );
  }

  let profile = await loadProfile(supabase, data.user.id);
  if (!profile && hasServiceRoleKey()) {
    const admin = createServiceClient();
    const { data: row } = await admin.from("profiles").select("*").eq("id", data.user.id).maybeSingle();
    profile = row;
  }
  if (!profile) {
    return jsonError(
      "Account created but profile is not ready. Push the profiles migration, then sign in.",
      500
    );
  }

  if (profile.name !== name) {
    await supabase.from("profiles").update({ name }).eq("id", data.user.id);
    profile = { ...profile, name };
  }

  const promoted = await promoteDealerIfNeeded(data.user.id, intent);
  if (promoted) profile = { ...profile, role: promoted };

  return applyCookies(
    NextResponse.json(
      authSessionPayload(profile, data.session?.access_token, {
        refreshToken: data.session?.refresh_token,
        expiresAt: data.session?.expires_at,
      }),
      { status: 201 }
    )
  );
}
