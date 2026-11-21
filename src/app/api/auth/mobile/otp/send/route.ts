import { NextResponse, type NextRequest } from "next/server";
import { jsonError } from "@/lib/api/auth";
import {
  asIssueResult,
  mobileOtpHttpStatus,
  parseAuthMobilePurpose,
} from "@/lib/auth/mobile-otp";
import {
  countryDigits,
  nationalDigits,
  toE164Digits,
  validateMobile,
} from "@/lib/auth/phone";
import { enforceAuthRateLimit } from "@/lib/auth/rate-limit";
import { isProductionRuntime } from "@/lib/auth/urls";
import { deliverMobileOtp, isMsg91Configured } from "@/lib/sms/msg91";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";

type SendBody = {
  purpose?: string;
  countryCode?: string;
  mobileNumber?: string;
};

export async function POST(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required for mobile OTP.", 503);
  }

  const limited = await enforceAuthRateLimit(
    request,
    "mobileOtpSend",
    "Too many verification requests. Please try again shortly."
  );
  if (limited) return limited;

  let body: SendBody;
  try {
    body = (await request.json()) as SendBody;
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

  const allowDevDelivery =
    !isProductionRuntime() && process.env.AUTH_DEV_MOBILE_OTP !== "false";

  if (!isMsg91Configured() && !allowDevDelivery) {
    return jsonError("Mobile verification is temporarily unavailable.", 503, {
      code: "delivery_unconfigured",
    });
  }

  const admin = createServiceClient();
  const { data, error } = await admin.rpc("issue_auth_mobile_otp", {
    p_purpose: purpose,
    p_country: country,
    p_national: national,
  });

  if (error) {
    console.error("[mobile-otp/send] issue_auth_mobile_otp failed");
    return jsonError("Couldn't send a code. Try again.", 500);
  }

  const issued = asIssueResult(data);
  if (!issued.ok || !issued.otp || !issued.challengeId) {
    return NextResponse.json(
      {
        ok: false,
        code: issued.code,
        message: issued.message ?? "Couldn't send a code. Try again.",
        ...(issued.resendAfterSeconds != null
          ? { resendAfterSeconds: issued.resendAfterSeconds }
          : {}),
      },
      { status: mobileOtpHttpStatus(issued.code) }
    );
  }

  // Local/dev: skip MSG91 when unset so flows can be tested with debugCode.
  if (!isMsg91Configured() && allowDevDelivery) {
    return NextResponse.json({
      ok: true,
      expiresAt: issued.expiresAt,
      resendAfterSeconds: issued.resendAfterSeconds ?? 30,
      channel: "dev",
      debugCode: issued.otp,
    });
  }

  const delivery = await deliverMobileOtp(toE164Digits(country, national), issued.otp);
  if (!delivery.ok) {
    await admin.rpc("void_mobile_otp", { p_challenge: issued.challengeId });
    return NextResponse.json(
      { ok: false, code: delivery.code, message: delivery.message },
      { status: mobileOtpHttpStatus(delivery.code) }
    );
  }

  return NextResponse.json({
    ok: true,
    expiresAt: issued.expiresAt,
    resendAfterSeconds: issued.resendAfterSeconds ?? 30,
    channel: delivery.channel === "sms" ? "sms" : "whatsapp",
  });
}
