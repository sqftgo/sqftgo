"use client";

import React from "react";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { AppProvider } from "@/context/AppContext";

/** Root client providers: Query ΓåÆ Auth ΓåÆ marketplace AppContext. */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <AppProvider>{children}</AppProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
