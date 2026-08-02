"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { SESSION_STORAGE_KEY } from "@/constants/demoAccounts";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/queryKeys";
import { authService, type AuthSession, type AuthRole } from "@/services/auth";
import type { UserProfile } from "@/types";

type AuthContextValue = {
  sessionReady: boolean;
  isLoggedIn: boolean;
  userEmail: string;
  userRole: AuthRole | null;
  userName: string;
  userProfile: UserProfile | null;
  login: (email: string, password: string) => Promise<AuthSession>;
  signup: (input: {
    name: string;
    email: string;
    password: string;
  }) => Promise<
    | { status: "authenticated"; session: AuthSession }
    | { status: "confirm_email"; email: string; message: string }
  >;
  loginWithGoogle: (nextPath?: string | null) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (input: {
    name?: string;
    phone?: string | null;
    bio?: string | null;
    city?: string | null;
    avatarUrl?: string | null;
  }) => Promise<UserProfile>;
  /** Apply a verified session from BFF (login/signup/me). Not for spoofing roles. */
  applySession: (session: AuthSession | null) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [sessionReady, setSessionReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState<AuthRole | null>(null);
  const [userName, setUserName] = useState("");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const applySession = useCallback((session: AuthSession | null) => {
    if (!session) {
      setIsLoggedIn(false);
      setUserEmail("");
      setUserRole(null);
      setUserName("");
      setUserProfile(null);
      return;
    }
    setIsLoggedIn(true);
    setUserEmail(session.email);
    setUserRole(session.role);
    setUserName(session.name);
    setUserProfile(session.profile);
  }, []);

  const clearLocalUiPrefsOnLogout = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { selectedCity?: string };
      localStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify({
          favorites: [],
          selectedCity:
            typeof parsed.selectedCity === "string" && parsed.selectedCity
              ? parsed.selectedCity
              : "Udaipur",
        })
      );
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      if (!hasSupabaseEnv()) {
        if (!cancelled) {
          applySession(null);
          setSessionReady(true);
        }
        return;
      }
      try {
        const session = await authService.getSession();
        if (!cancelled) applySession(session);
      } catch {
        if (!cancelled) applySession(null);
      } finally {
        if (!cancelled) setSessionReady(true);
      }
    }

    void hydrate();

    if (!hasSupabaseEnv()) {
      return () => {
        cancelled = true;
      };
    }

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (cancelled) return;
      if (event === "SIGNED_OUT") {
        applySession(null);
        clearLocalUiPrefsOnLogout();
        void queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
        void queryClient.invalidateQueries({ queryKey: queryKeys.dealers.all });
        void queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers.all });
        return;
      }
      if (
        event === "SIGNED_IN" ||
        event === "TOKEN_REFRESHED" ||
        event === "USER_UPDATED"
      ) {
        void authService
          .getSession()
          .then((session) => {
            if (!cancelled) applySession(session);
          })
          .catch(() => {
            if (!cancelled) applySession(null);
          });
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [applySession, clearLocalUiPrefsOnLogout, queryClient]);

  const login = useCallback(
    async (email: string, password: string) => {
      const session = await authService.login(email, password);
      applySession(session);
      void queryClient.invalidateQueries();
      return session;
    },
    [applySession, queryClient]
  );

  const signup = useCallback(
    async (input: { name: string; email: string; password: string }) => {
      const result = await authService.signup(input);
      if (result.status === "authenticated") {
        applySession(result.session);
        void queryClient.invalidateQueries();
      }
      return result;
    },
    [applySession, queryClient]
  );

  const loginWithGoogle = useCallback(async (nextPath?: string | null) => {
    await authService.loginWithGoogle(nextPath);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      applySession(null);
      clearLocalUiPrefsOnLogout();
      void queryClient.invalidateQueries();
    }
  }, [applySession, clearLocalUiPrefsOnLogout, queryClient]);

  const updateProfile = useCallback(
    async (input: {
      name?: string;
      phone?: string | null;
      bio?: string | null;
      city?: string | null;
      avatarUrl?: string | null;
    }) => {
      const session = await authService.updateProfile(input);
      applySession(session);
      return session.profile;
    },
    [applySession]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      sessionReady,
      isLoggedIn,
      userEmail,
      userRole,
      userName,
      userProfile,
      login,
      signup,
      loginWithGoogle,
      logout,
      updateProfile,
      applySession,
    }),
    [
      sessionReady,
      isLoggedIn,
      userEmail,
      userRole,
      userName,
      userProfile,
      login,
      signup,
      loginWithGoogle,
      logout,
      updateProfile,
      applySession,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return ctx;
}
