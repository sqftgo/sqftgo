import type { AdminUser, AuthRole, UserProfile } from "@/types";
import { apiClient, type PaginatedResult } from "@/lib/api/client";

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

export interface AuthRepository {
  login(email: string, password: string): Promise<AuthSession>;
  signup(input: {
    name: string;
    email: string;
    password: string;
  }): Promise<SignupResult>;
  logout: () => Promise<void>;
  getSession(): Promise<AuthSession | null>;
  updateProfile(input: {
    name?: string;
    phone?: string | null;
    bio?: string | null;
    city?: string | null;
    avatarUrl?: string | null;
  }): Promise<AuthSession>;
  resetPassword(email: string): Promise<void>;
  listUsers(params?: { limit?: number; offset?: number }): Promise<AdminUser[]>;
  listUsersPage(params?: {
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResult<AdminUser>>;
  updateUser(id: string, updates: Partial<AdminUser>): Promise<AdminUser>;
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

  async signup({ name, email, password }) {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    if (!trimmedName || !trimmedEmail || !password) {
      throw new Error("All fields are required");
    }
    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }

    const data = await apiClient<ApiSessionPayload & { status?: string; message?: string }>(
      "/api/auth/signup",
      {
        method: "POST",
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          password,
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

  async logout() {
    await apiClient<{ ok: boolean }>("/api/auth/logout", {
      method: "POST",
      body: "{}",
    });
  },

  async getSession() {
    try {
      return await apiClient<ApiSessionPayload>("/api/auth/me", { method: "GET" });
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
      }),
    });
  },
};

export const authService: AuthRepository = authApi;

/** @deprecated Use authApi */
export const supabaseAuthRepository = authApi;
