"use client";

import { useCallback, useEffect, useState } from "react";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { VisitBooking } from "@/types";
import { visitService } from "@/services";

type UseVisitsArgs = {
  sessionReady: boolean;
  isLoggedIn: boolean;
  userRole: "user" | "broker" | "admin" | null;
  refreshNotifications: () => Promise<void>;
};

export function useVisits({
  sessionReady,
  isLoggedIn,
  userRole,
  refreshNotifications,
}: UseVisitsArgs) {
  const [visits, setVisitsState] = useState<VisitBooking[]>([]);
  const [visitsReady, setVisitsReady] = useState(false);

  const refreshVisits = useCallback(async () => {
    if (!hasSupabaseEnv() || !isLoggedIn) {
      setVisitsState([]);
      setVisitsReady(true);
      return;
    }
    try {
      const rows = await visitService.list();
      setVisitsState(rows);
    } catch {
      setVisitsState([]);
    } finally {
      setVisitsReady(true);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!sessionReady) return;
    void refreshVisits();
  }, [sessionReady, isLoggedIn, userRole, refreshVisits]);

  const bookVisit = useCallback(
    async (
      propertyId: string,
      payload: {
        name: string;
        email: string;
        phone: string;
        date: string;
        time: string;
        notes?: string;
      }
    ) => {
      const created = await visitService.book(propertyId, payload);
      setVisitsState((prev) => [created, ...prev.filter((v) => v.id !== created.id)]);
      void refreshNotifications();
      return created;
    },
    [refreshNotifications]
  );

  const updateVisit = useCallback(
    async (
      id: string,
      updates: {
        status?: VisitBooking["status"];
        date?: string;
        time?: string;
        notes?: string;
        brokerNotes?: string;
      }
    ) => {
      const updated = await visitService.update(id, updates);
      setVisitsState((prev) => prev.map((v) => (v.id === id ? updated : v)));
      void refreshNotifications();
      return updated;
    },
    [refreshNotifications]
  );

  return {
    visits,
    visitsReady,
    refreshVisits,
    bookVisit,
    updateVisit,
  };
}
