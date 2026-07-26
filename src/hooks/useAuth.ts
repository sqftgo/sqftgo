"use client";

import { useAuthContext } from "@/providers/AuthProvider";
import { useApp } from "@/context/AppContext";

export function useAuth() {
  const {
    isLoggedIn,
    userEmail,
    userRole,
    userName,
    userProfile,
    sessionReady,
    login,
    signup,
    logout,
  } = useAuthContext();

  const { adminUsers } = useApp();

  return {
    isLoggedIn,
    userEmail,
    userRole,
    userName,
    userProfile,
    sessionReady,
    adminUsers,
    login,
    signup,
    logout,
  };
}
