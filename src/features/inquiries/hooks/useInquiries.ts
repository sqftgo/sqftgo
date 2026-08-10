"use client";

import { useCallback, useEffect, useState } from "react";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { PropertyInquiry } from "@/types";
import { inquiryService } from "@/services";

type UseInquiriesArgs = {
  sessionReady: boolean;
  isLoggedIn: boolean;
  userRole: "user" | "broker" | "admin" | null;
  refreshProperties: () => Promise<void>;
};

export function useInquiries({
  sessionReady,
  isLoggedIn,
  userRole,
  refreshProperties,
}: UseInquiriesArgs) {
  const [inquiries, setInquiriesState] = useState<Record<string, PropertyInquiry[]>>({});
  const [inquiriesReady, setInquiriesReady] = useState(false);

  const refreshInquiries = useCallback(async () => {
    if (!hasSupabaseEnv() || !isLoggedIn) {
      setInquiriesState({});
      setInquiriesReady(true);
      return;
    }
    setInquiriesReady(false);
    try {
      // Buyers always use mine=1. Brokers/admins list owned/all.
      // While role is still null after login, prefer mine=1 (safe for buyers).
      if (userRole === "broker" || userRole === "admin") {
        setInquiriesState(await inquiryService.listAll());
      } else {
        const rows = await inquiryService.listFlat({ mine: true });
        const out: Record<string, PropertyInquiry[]> = {};
        for (const row of rows) {
          const entry: PropertyInquiry = {
            id: row.id,
            name: row.name,
            email: row.email,
            phone: row.phone,
            message: row.message,
            date: row.date,
            status: row.status,
          };
          if (!out[row.propertyId]) out[row.propertyId] = [];
          out[row.propertyId].push(entry);
        }
        setInquiriesState(out);
      }
    } catch {
      setInquiriesState({});
    } finally {
      setInquiriesReady(true);
    }
  }, [isLoggedIn, userRole]);

  useEffect(() => {
    if (!sessionReady) {
      setInquiriesReady(false);
      return;
    }
    void refreshInquiries();
  }, [sessionReady, isLoggedIn, userRole, refreshInquiries]);

  const deleteInquiry = useCallback(
    async (inquiryId: string) => {
      await inquiryService.removeById(inquiryId);
      setInquiriesState((prev) => {
        const next: Record<string, PropertyInquiry[]> = {};
        for (const [pid, list] of Object.entries(prev)) {
          const filtered = list.filter((inq) => inq.id !== inquiryId);
          if (filtered.length) next[pid] = filtered;
        }
        return next;
      });
      void refreshProperties();
    },
    [refreshProperties]
  );

  const submitInquiry = useCallback(
    async (
      propertyId: string,
      inquiry: { name: string; email: string; phone: string; message: string }
    ) => {
      const created = await inquiryService.submit(propertyId, inquiry);
      setInquiriesState((prev) => ({
        ...prev,
        [propertyId]: [created, ...(prev[propertyId] ?? [])],
      }));
      void refreshProperties();
      return created;
    },
    [refreshProperties]
  );

  const clearInquiriesOnLogout = useCallback(() => {
    setInquiriesState({});
    setInquiriesReady(false);
  }, []);

  return {
    inquiries,
    inquiriesReady,
    refreshInquiries,
    submitInquiry,
    deleteInquiry,
    clearInquiriesOnLogout,
  };
}
