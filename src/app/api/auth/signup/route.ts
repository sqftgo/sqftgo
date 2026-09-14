import { NextResponse, type NextRequest } from "next/server";
import type { ProfileRow } from "@/types/database";
import { createRouteClient } from "@/lib/supabase/route";
import { createServiceClient } from "@/lib/supabase/admin";
import { jsonError } from "@/lib/api/auth";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import { skipEmailConfirmEnabled } from "@/lib/auth/email-confirm";
import { enforceAuthRateLimit } from "@/lib/auth/rate-limit";
import { getSiteUrl } from "@/lib/auth/urls";
import { authSessionPayload } from "@/lib/mappers/profile";

type SignupBody = {
  email?: string;
  password?: string;
  name?: string;
  /** Dealer registration grants broker role after profile creation. */
  intent?: "user" | "dealer";
};

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

export async function POST(request: NextRequest) {
  if (!hasSupabaseEnv()) {
    return jsonError("Supabase is not configured", 503);
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

  if (!email || !password || !name) {
    return jsonError("All fields are required");
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return jsonError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }
  if (email === "admin@sqftgo.com") {
    return jsonError("This email is reserved", 403);
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

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) {
      return jsonError("Account created but sign-in failed. Try logging in.", 500);
    }

    let profile = await loadProfile(supabase, created.user.id);
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
      NextResponse.json(authSessionPayload(profile, signInData.session?.access_token), {
        status: 201,
      })
    );
  }

  const dealerNext =
    intent === "dealer" ? "/dealer/dashboard" : "/";
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

  // Email confirmation required — no session yet
  if (!data.session) {
    return NextResponse.json(
      {
        status: "confirm_email",
        email,
        message: "Check your email to confirm your account before signing in.",
      },
      { status: 201 }
    );
  }

  let profile = await loadProfile(supabase, data.user.id);
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
      authSessionPayload(profile, data.session?.access_token),
      { status: 201 }
    )
  );
}
