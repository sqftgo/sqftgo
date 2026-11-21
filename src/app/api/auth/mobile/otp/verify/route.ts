import { NextResponse, type NextRequest } from "next/server";
import { jsonError } from "@/lib/api/auth";
import {
  asConsumeResult,
  mobileOtpHttpStatus,
  parseAuthMobilePurpose,
} from "@/lib/auth/mobile-otp";
import { countryDigits, nationalDigits, validateMobile } from "@/lib/auth/phone";
import { enforceAuthRateLimit } from "@/lib/auth/rate-limit";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";

type VerifyBody = {
  purpose?: string;
  countryCode?: string;
  mobileNumber?: string;
  code?: string;
};

export async function POST(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required for mobile OTP.", 503);
  }

  const limited = await enforceAuthRateLimit(
    request,
    "mobileOtpVerify",
    "Too many verification attempts. Please try again shortly."
  );
  if (limited) return limited;

  let body: VerifyBody;
  try {
    body = (await request.json()) as VerifyBody;
  } catch {
    return jsonError("Invalid JSON body");
  }

  const purpose = parseAuthMobilePurpose(body.purpose);
  if (!purpose) {
    return jsonError("Unsupported verification purpose.", 400, { code: "invalid_purpose" });
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
    p_purpose: purpose,
    p_country: country,
    p_national: national,
    p_code: code,
  });

  if (error) {
    console.error("[mobile-otp/verify] consume_auth_mobile_otp failed");
    return jsonError("Couldn't verify that code. Try again.", 500);
  }

  const result = asConsumeResult(data);
  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        code: result.code,
        message: result.message ?? "Couldn't verify that code. Try again.",
      },
      { status: mobileOtpHttpStatus(result.code) }
    );
  }

  if (purpose === "register") {
    if (!result.claimToken) {
      return jsonError("Couldn't verify that code. Try again.", 500);
    }
    return NextResponse.json({
      ok: true,
      claimToken: result.claimToken,
      phone: result.phone ?? national,
      countryCode: result.countryCode ?? country,
    });
  }

  // Login: do not mint tokens here — client should call POST /api/auth/mobile/login.
  return NextResponse.json({
    ok: true,
    ready: true,
    phone: result.phone ?? national,
    countryCode: result.countryCode ?? country,
  });
}
