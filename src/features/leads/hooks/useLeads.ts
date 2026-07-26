"use client";

import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { AssistanceRequest, GeneralEnquiry } from "@/types";
import { assistanceService, enquiryService } from "@/services";

type UseLeadsArgs = {
  sessionReady: boolean;
  isLoggedIn: boolean;
  userRole: "user" | "broker" | "admin" | null;
};

export function useLeads({ sessionReady, isLoggedIn, userRole }: UseLeadsArgs) {
  const [assistanceRequests, setAssistanceRequestsState] = useState<AssistanceRequest[]>([]);
  const [assistanceReady, setAssistanceReady] = useState(false);
  const [enquiries, setEnquiriesState] = useState<GeneralEnquiry[]>([]);
  const [enquiriesReady, setEnquiriesReady] = useState(false);

  const refreshAssistance = useCallback(async () => {
    if (!hasSupabaseEnv() || !isLoggedIn || userRole !== "admin") {
      setAssistanceRequestsState([]);
      setAssistanceReady(true);
      return;
    }
    try {
      setAssistanceRequestsState(await assistanceService.list());
    } catch {
      setAssistanceRequestsState([]);
    } finally {
      setAssistanceReady(true);
    }
  }, [isLoggedIn, userRole]);

  const refreshEnquiries = useCallback(async () => {
    if (!hasSupabaseEnv() || !isLoggedIn || userRole !== "admin") {
      setEnquiriesState([]);
      setEnquiriesReady(true);
      return;
    }
    try {
      setEnquiriesState(await enquiryService.list());
    } catch {
      setEnquiriesState([]);
    } finally {
      setEnquiriesReady(true);
    }
  }, [isLoggedIn, userRole]);

  useEffect(() => {
    if (!sessionReady) return;
    void refreshAssistance();
    void refreshEnquiries();
  }, [sessionReady, refreshAssistance, refreshEnquiries]);

  const setAssistanceRequests: Dispatch<SetStateAction<AssistanceRequest[]>> = useCallback(
    (action) => {
      setAssistanceRequestsState((current) =>
        typeof action === "function" ? action(current) : action
      );
    },
    []
  );

  const setEnquiries: Dispatch<SetStateAction<GeneralEnquiry[]>> = useCallback(
    (action) => {
      setEnquiriesState((current) => (typeof action === "function" ? action(current) : action));
    },
    []
  );

  const addAssistanceRequest = useCallback(
    async (req: Omit<AssistanceRequest, "id" | "status">) => {
      const created = await assistanceService.add(req);
      setAssistanceRequestsState((prev) => [created, ...prev.filter((r) => r.id !== created.id)]);
      return created;
    },
    []
  );

  const updateAssistanceRequest = useCallback(
    async (id: string, updates: { status?: AssistanceRequest["status"]; notes?: string }) => {
      const updated = await assistanceService.update(id, updates);
      setAssistanceRequestsState((prev) => prev.map((r) => (r.id === id ? updated : r)));
      return updated;
    },
    []
  );

  const deleteAssistanceRequest = useCallback(async (id: string) => {
    await assistanceService.remove(id);
    setAssistanceRequestsState((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addGeneralEnquiry = useCallback(
    async (enq: Omit<GeneralEnquiry, "id" | "date"> & { payload?: Record<string, unknown> }) => {
      const created = await enquiryService.add(enq);
      setEnquiriesState((prev) => [created, ...prev.filter((e) => e.id !== created.id)]);
      return created;
    },
    []
  );

  const deleteGeneralEnquiry = useCallback(async (id: string) => {
    await enquiryService.remove(id);
    setEnquiriesState((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return {
    assistanceRequests,
    assistanceReady,
    refreshAssistance,
    setAssistanceRequests,
    addAssistanceRequest,
    updateAssistanceRequest,
    deleteAssistanceRequest,
    enquiries,
    enquiriesReady,
    refreshEnquiries,
    setEnquiries,
    addGeneralEnquiry,
    deleteGeneralEnquiry,
  };
}
