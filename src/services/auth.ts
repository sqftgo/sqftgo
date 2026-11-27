import type { AdminUser, AuthRole, UserProfile } from "@/types";
import { apiClient, ApiError, type PaginatedResult } from "@/lib/api/client";
import { countryDigits, nationalDigits, validateMobile } from "@/lib/auth/phone";
import { safeRedirectPath } from "@/lib/auth/urls";
import { createClient } from "@/lib/supabase/client";

export type { AuthRole };

export interface AuthSession {
  email: string;
  role: AuthRole;
  name: string;
  profile: UserProfile;
}

export type SignupResult =
  | { status: "authenticated"; session: AuthSession }
  | { status: "confirm_email"; email: string; message: string };

export type SignupInput = {
  name: string;
  email: string;
  password: string;
  intent?: "user" | "dealer";
  countryCode: string;
  mobileNumber: string;
  mobileClaimToken: string;
  cityId?: string;
};

export type MobileOtpSendResult = {
  ok: true;
  expiresAt?: string;
  resendAfterSeconds: number;
  channel: "whatsapp" | "sms" | "dev";
  /** Present only in non-production when MSG91 is unset. */
  debugCode?: string;
};

export type MobileOtpVerifyRegisterResult = {
  ok: true;
  claimToken: string;
  phone: string;
  countryCode: string;
};

export interface AuthRepository {
  login(email: string, password: string): Promise<AuthSession>;
  loginWithMobile(input: {
    countryCode: string;
    mobileNumber: string;
    code: string;
  }): Promise<AuthSession>;
  loginServiceProviderWithMobile(input: {
    countryCode: string;
    mobileNumber: string;
    code: string;
  }): Promise<AuthSession>;
  sendMobileOtp(input: {
    purpose: "register" | "login";
    countryCode: string;
    mobileNumber: string;
  }): Promise<MobileOtpSendResult>;
  verifyMobileOtpForRegister(input: {
    countryCode: string;
    mobileNumber: string;
    code: string;
  }): Promise<MobileOtpVerifyRegisterResult>;
  signup(input: SignupInput): Promise<SignupResult>;
  /** Starts Google OAuth (browser redirect). Resolves only on error; success leaves the page. */
  loginWithGoogle(nextPath?: string | null): Promise<void>;
  logout: () => Promise<void>;
  getSession(): Promise<AuthSession | null>;
  updateProfile(input: {
    name?: string;
    phone?: string | null;
    bio?: string | null;
    city?: string | null;
    cityId?: string | null;
    avatarUrl?: string | null;
  }): Promise<AuthSession>;
  resetPassword(email: string): Promise<void>;
  listUsers(params?: { limit?: number; offset?: number }): Promise<AdminUser[]>;
  listUsersPage(params?: {
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResult<AdminUser>>;
  updateUser(
    id: string,
    updates: Partial<AdminUser> & { grantListingSlots?: number }
  ): Promise<AdminUser>;
}

type ApiSessionPayload = {
  email: string;
  role: AuthRole;
  name: string;
  profile: UserProfile;
  error?: string;
  status?: string;
  message?: string;
};

function assertMobile(countryCode: string, mobileNumber: string) {
  const country = countryDigits(countryCode);
  const national = nationalDigits(country, mobileNumber);
  const err = validateMobile(country, national);
  if (err) throw new Error(err);
  return { country, national };
}

export const authApi: AuthRepository = {
  async login(email, password) {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !password) {
      throw new Error("Email and password are required");
    }

    return apiClient<ApiSessionPayload>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: trimmed, password }),
    });
  },

  async loginWithMobile({ countryCode, mobileNumber, code }) {
    const { country, national } = assertMobile(countryCode, mobileNumber);
    const otp = String(code ?? "").trim();
    if (!/^[0-9]{6}$/.test(otp)) {
      throw new Error("Enter the 6-digit code.");
    }

    return apiClient<ApiSessionPayload>("/api/auth/mobile/login", {
      method: "POST",
      body: JSON.stringify({
        countryCode: country,
        mobileNumber: national,
        code: otp,
      }),
    });
  },

  /** Service-provider portal login — requires a registered service business. */
  async loginServiceProviderWithMobile({
    countryCode,
    mobileNumber,
    code,
  }: {
    countryCode: string;
    mobileNumber: string;
    code: string;
  }) {
    const { country, national } = assertMobile(countryCode, mobileNumber);
    const otp = String(code ?? "").trim();
    if (!/^[0-9]{6}$/.test(otp)) {
      throw new Error("Enter the 6-digit code.");
    }

    return apiClient<
      ApiSessionPayload & {
        ok?: boolean;
        directoryProfileId?: string;
        redirectTo?: string;
      }
    >("/api/services/auth/login", {
      method: "POST",
      body: JSON.stringify({
        countryCode: country,
        mobileNumber: national,
        code: otp,
      }),
    });
  },

  async sendMobileOtp({ purpose, countryCode, mobileNumber }) {
    const { country, national } = assertMobile(countryCode, mobileNumber);

    const data = await apiClient<{
      ok?: boolean;
      expiresAt?: string;
      resendAfterSeconds?: number;
      channel?: string;
      debugCode?: string;
      message?: string;
      error?: string;
      code?: string;
    }>("/api/auth/mobile/otp/send", {
      method: "POST",
      body: JSON.stringify({
        purpose,
        countryCode: country,
        mobileNumber: national,
      }),
    });

    if (!data.ok) {
      throw new ApiError(data.message || data.error || "Couldn't send a code.", 400, {
        code: data.code,
      });
    }

    const channel =
      data.channel === "sms" || data.channel === "dev" || data.channel === "whatsapp"
        ? data.channel
        : "whatsapp";

    return {
      ok: true as const,
      expiresAt: data.expiresAt,
      resendAfterSeconds: data.resendAfterSeconds ?? 30,
      channel,
      ...(typeof data.debugCode === "string" ? { debugCode: data.debugCode } : {}),
    };
  },

  async verifyMobileOtpForRegister({ countryCode, mobileNumber, code }) {
    const { country, national } = assertMobile(countryCode, mobileNumber);
    const otp = String(code ?? "").trim();
    if (!/^[0-9]{6}$/.test(otp)) {
      throw new Error("Enter the 6-digit code.");
    }

    const data = await apiClient<{
      ok?: boolean;
      claimToken?: string;
      phone?: string;
      countryCode?: string;
      message?: string;
      error?: string;
      code?: string;
    }>("/api/auth/mobile/otp/verify", {
      method: "POST",
      body: JSON.stringify({
        purpose: "register",
        countryCode: country,
        mobileNumber: national,
        code: otp,
      }),
    });

    if (!data.ok || !data.claimToken) {
      throw new ApiError(data.message || data.error || "Couldn't verify that code.", 400, {
        code: data.code,
      });
    }

    return {
      ok: true as const,
      claimToken: data.claimToken,
      phone: data.phone ?? national,
      countryCode: data.countryCode ?? country,
    };
  },

  async signup({
    name,
    email,
    password,
    intent,
    countryCode,
    mobileNumber,
    mobileClaimToken,
    cityId,
  }) {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();
    const claim = mobileClaimToken.trim();
    const { country, national } = assertMobile(countryCode, mobileNumber);

    if (!trimmedName || !trimmedEmail || !password) {
      throw new Error("All fields are required");
    }
    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }
    if (!claim) {
      throw new Error("Verify your mobile number first.");
    }

    const data = await apiClient<ApiSessionPayload & { status?: string; message?: string }>(
      "/api/auth/signup",
      {
        method: "POST",
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          password,
          intent: intent === "dealer" ? "dealer" : "user",
          countryCode: country,
          mobileNumber: national,
          mobileClaimToken: claim,
          ...(cityId ? { cityId } : {}),
        }),
      }
    );

    if (data.status === "confirm_email") {
      return {
        status: "confirm_email",
        email: trimmedEmail,
        message: data.message ?? "Check your email to confirm your account before signing in.",
      };
    }

    return {
      status: "authenticated",
      session: {
        email: data.email,
        role: data.role,
        name: data.name,
        profile: data.profile,
      },
    };
  },

  async loginWithGoogle(nextPath) {
    if (typeof window === "undefined") {
      throw new Error("Google sign-in must run in the browser");
    }

    const next = safeRedirectPath(nextPath, "/");
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: {
          prompt: "select_account",
        },
      },
    });

    if (error) {
      throw new Error(error.message || "Google sign-in failed");
    }
  },

  async logout() {
    await apiClient<{ ok: boolean }>("/api/auth/logout", {
      method: "POST",
      body: "{}",
    });
  },

  async getSession() {
    try {
      // Anonymous first visits 401 — expected; never toast session probes.
      return await apiClient<ApiSessionPayload>("/api/auth/me", {
        method: "GET",
        toast: false,
      });
    } catch {
      return null;
    }
  },

  async updateProfile(input) {
    return apiClient<ApiSessionPayload>("/api/auth/me", {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  async resetPassword(email) {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) throw new Error("Email is required");

    await apiClient<{ ok: boolean }>("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email: trimmed }),
    });
  },

  async listUsersPage(params) {
    const qs = new URLSearchParams();
    if (params?.limit !== undefined) qs.set("limit", String(params.limit));
    if (params?.offset !== undefined) qs.set("offset", String(params.offset));
    const q = qs.toString();
    return apiClient<PaginatedResult<AdminUser>>(
      `/api/admin/users${q ? `?${q}` : ""}`,
      { method: "GET" }
    );
  },

  async listUsers(params) {
    const page = await this.listUsersPage(params);
    return page.items;
  },

  async updateUser(id, updates) {
    return apiClient<AdminUser>(`/api/admin/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        name: updates.name,
        email: updates.email,
        role: updates.role,
        status: updates.status,
        listingStatus: updates.listingStatus,
        grantListingSlots: updates.grantListingSlots,
      }),
    });
  },
};

export const authService: AuthRepository = authApi;

/** @deprecated Use authApi */
export const supabaseAuthRepository = authApi;
