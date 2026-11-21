import type { Json } from "@/types/database";

export type AuthMobilePurpose = "register" | "login";

export type IssueAuthMobileOtpResult = {
  ok: boolean;
  code?: string;
  message?: string;
  challengeId?: string;
  otp?: string;
  expiresAt?: string;
  resendAfterSeconds?: number;
  userId?: string;
};

export type ConsumeAuthMobileOtpResult = {
  ok: boolean;
  code?: string;
  message?: string;
  claimToken?: string;
  userId?: string;
  phone?: string;
  countryCode?: string;
  purpose?: string;
  expiresAt?: string;
};

export type ClaimMobileVerificationResult = {
  ok: boolean;
  code?: string;
  message?: string;
  phone?: string;
  countryCode?: string;
  mobileVerified?: boolean;
};

export function parseAuthMobilePurpose(raw: unknown): AuthMobilePurpose | null {
  if (raw === "register" || raw === "login") return raw;
  return null;
}

export function asIssueResult(data: Json | null): IssueAuthMobileOtpResult {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { ok: false, message: "Couldn't send a code. Try again." };
  }
  const row = data as Record<string, unknown>;
  return {
    ok: row.ok === true,
    code: typeof row.code === "string" ? row.code : undefined,
    message: typeof row.message === "string" ? row.message : undefined,
    challengeId: typeof row.challengeId === "string" ? row.challengeId : undefined,
    otp: typeof row.otp === "string" ? row.otp : undefined,
    expiresAt: typeof row.expiresAt === "string" ? row.expiresAt : undefined,
    resendAfterSeconds:
      typeof row.resendAfterSeconds === "number" ? row.resendAfterSeconds : undefined,
    userId: typeof row.userId === "string" ? row.userId : undefined,
  };
}

export function asConsumeResult(data: Json | null): ConsumeAuthMobileOtpResult {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { ok: false, message: "Couldn't verify that code. Try again." };
  }
  const row = data as Record<string, unknown>;
  return {
    ok: row.ok === true,
    code: typeof row.code === "string" ? row.code : undefined,
    message: typeof row.message === "string" ? row.message : undefined,
    claimToken: typeof row.claimToken === "string" ? row.claimToken : undefined,
    userId: typeof row.userId === "string" ? row.userId : undefined,
    phone: typeof row.phone === "string" ? row.phone : undefined,
    countryCode: typeof row.countryCode === "string" ? row.countryCode : undefined,
    purpose: typeof row.purpose === "string" ? row.purpose : undefined,
    expiresAt: typeof row.expiresAt === "string" ? row.expiresAt : undefined,
  };
}

export function asClaimResult(data: Json | null): ClaimMobileVerificationResult {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { ok: false, message: "Mobile verification failed. Request a new code." };
  }
  const row = data as Record<string, unknown>;
  return {
    ok: row.ok === true,
    code: typeof row.code === "string" ? row.code : undefined,
    message: typeof row.message === "string" ? row.message : undefined,
    phone: typeof row.phone === "string" ? row.phone : undefined,
    countryCode: typeof row.countryCode === "string" ? row.countryCode : undefined,
    mobileVerified: row.mobileVerified === true,
  };
}

export function mobileOtpHttpStatus(code?: string): number {
  if (code === "rate_limited" || code === "cooldown" || code === "locked") return 429;
  if (code === "duplicate" || code === "not_found") return 409;
  if (code === "delivery_unconfigured" || code === "delivery_failed") return 503;
  if (code === "unauthorized") return 401;
  return 400;
}
