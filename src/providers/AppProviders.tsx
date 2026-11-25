"use client";

import React from "react";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { AppProvider } from "@/context/AppContext";
import { Toaster } from "@/components/ui/Toaster";

/** Root client providers: Query → Auth → marketplace AppContext + global toasts. */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <AppProvider>
          {children}
          <Toaster />
        </AppProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
