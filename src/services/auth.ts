import type { MockUser, UserProfile } from "@/types";

export type AuthRole = "user" | "broker" | "admin";

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
  logout(): Promise<void>;
  getSession(): Promise<AuthSession | null>;
  updateProfile(input: {
    name?: string;
    phone?: string | null;
    bio?: string | null;
    city?: string | null;
    avatarUrl?: string | null;
  }): Promise<AuthSession>;
  resetPassword(email: string): Promise<void>;
  listUsers(): Promise<MockUser[]>;
  updateUser(id: string, updates: Partial<MockUser>): Promise<MockUser>;
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

async function apiJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    credentials: "same-origin",
  });

  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) {
    throw new Error(
      typeof data === "object" && data && "error" in data && data.error
        ? String(data.error)
        : "Request failed"
    );
  }
  return data;
}

export const supabaseAuthRepository: AuthRepository = {
  async login(email, password) {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !password) {
      throw new Error("Email and password are required");
    }

    return apiJson<ApiSessionPayload>("/api/auth/login", {
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

    const data = await apiJson<ApiSessionPayload & { status?: string; message?: string }>(
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
    await apiJson<{ ok: boolean }>("/api/auth/logout", {
      method: "POST",
      body: "{}",
    });
  },

  async getSession() {
    try {
      return await apiJson<ApiSessionPayload>("/api/auth/me", { method: "GET" });
    } catch {
      return null;
    }
  },

  async updateProfile(input) {
    return apiJson<ApiSessionPayload>("/api/auth/me", {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  async resetPassword(email) {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) throw new Error("Email is required");

    await apiJson<{ ok: boolean }>("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email: trimmed }),
    });
  },

  async listUsers() {
    return apiJson<MockUser[]>("/api/admin/users", { method: "GET" });
  },

  async updateUser(id, updates) {
    return apiJson<MockUser>(`/api/admin/users/${id}`, {
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

export const authService: AuthRepository = supabaseAuthRepository;
