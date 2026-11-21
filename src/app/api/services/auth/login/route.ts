import { NextResponse, type NextRequest } from "next/server";
import type { DirectoryProfileRow, ProfileRow } from "@/types/database";
import { jsonError } from "@/lib/api/auth";
import { asConsumeResult, mobileOtpHttpStatus } from "@/lib/auth/mobile-otp";
import { countryDigits, nationalDigits, validateMobile } from "@/lib/auth/phone";
import { enforceAuthRateLimit } from "@/lib/auth/rate-limit";
import { isServiceDirectoryCategory } from "@/features/dealers/lib/is-dealer-category";
import { authSessionPayload } from "@/lib/mappers/profile";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import { createRouteClient } from "@/lib/supabase/route";

type LoginBody = {
  countryCode?: string;
  mobileNumber?: string;
  code?: string;
};

async function loadProfile(userId: string): Promise<ProfileRow | null> {
  const client = createServiceClient();
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data } = await client.from("profiles").select("*").eq("id", userId).maybeSingle();
    if (data) return data;
    await new Promise((r) => setTimeout(r, 150));
  }
  return null;
}

/**
 * Service-provider mobile OTP login.
 * Reuses MSG91 / auth_mobile_otp stack, then requires a service directory profile.
 */
export async function POST(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required for mobile login.", 503);
  }

  const limited = await enforceAuthRateLimit(
    request,
    "mobileLogin",
    "Too many login attempts. Please try again shortly."
  );
  if (limited) return limited;

  let body: LoginBody;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return jsonError("Invalid JSON body");
  }

  const country = countryDigits(body.countryCode);
  const national = nationalDigits(country, body.mobileNumber);
  const validationError = validateMobile(country, national);
  if (validationError) {
    return jsonError(validationError, 400, { code: "invalid_number" });
  }

  const code = String(body.code ?? "").trim();
  if (!/^[0-9]{6}$/.test(code)) {
    return jsonError("Enter the 6-digit code.", 400, { code: "invalid_code" });
  }

  const admin = createServiceClient();
  const { data, error } = await admin.rpc("consume_auth_mobile_otp", {
    p_purpose: "login",
    p_country: country,
    p_national: national,
    p_code: code,
  });

  if (error) {
    console.error("[services/auth/login] consume_auth_mobile_otp failed");
    return jsonError("Couldn't verify that code. Try again.", 500);
  }

  const result = asConsumeResult(data);
  if (!result.ok || !result.userId) {
    const codeName = result.code;
    if (codeName === "no_account" || codeName === "user_not_found") {
      return NextResponse.json(
        {
          ok: false,
          code: "unregistered_provider",
          message:
            "No service business is registered with this mobile number. Register your business to continue.",
        },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        ok: false,
        code: result.code,
        message: result.message ?? "Couldn't verify that code. Try again.",
      },
      { status: mobileOtpHttpStatus(result.code) }
    );
  }

  const profile = await loadProfile(result.userId);
  if (!profile) {
    return jsonError("Profile not found for this account.", 500);
  }
  if (profile.status === "suspended") {
    return jsonError("This account has been suspended", 403);
  }
  if (!profile.email) {
    return jsonError("Account email is missing. Contact support.", 500);
  }

  const { data: directory } = await admin
    .from("directory_profiles")
    .select("*")
    .eq("user_id", profile.id)
    .maybeSingle();

  const dir = directory as DirectoryProfileRow | null;
  if (!dir || !isServiceDirectoryCategory(dir.category)) {
    return NextResponse.json(
      {
        ok: false,
        code: "unregistered_provider",
        message:
          "No service business is registered with this mobile number. Register your business to continue.",
        registerPath: "/services/register",
      },
      { status: 404 }
    );
  }

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: profile.email,
  });

  const tokenHash = linkData?.properties?.hashed_token;
  if (linkError || !tokenHash) {
    console.error("[services/auth/login] generateLink failed");
    return jsonError("Unable to create session. Please try again.", 500);
  }

  const { supabase, applyCookies } = createRouteClient(request);
  const { data: verified, error: verifyError } = await supabase.auth.verifyOtp({
    type: "magiclink",
    token_hash: tokenHash,
  });

  if (verifyError || !verified.session) {
    console.error("[services/auth/login] verifyOtp failed");
    return jsonError("Unable to create session. Please try again.", 500);
  }

  return applyCookies(
    NextResponse.json({
      ...authSessionPayload(profile, verified.session.access_token, {
        refreshToken: verified.session.refresh_token,
        expiresAt: verified.session.expires_at,
      }),
      ok: true,
      directoryProfileId: dir.id,
      redirectTo: "/services/manage",
    })
  );
}
