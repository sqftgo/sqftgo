import { apiClient } from "@/lib/api/client";
import type { AssistanceRequest } from "@/types";

export interface AssistanceRepository {
  list(): Promise<AssistanceRequest[]>;
  add(req: Omit<AssistanceRequest, "id" | "status">): Promise<AssistanceRequest>;
  update(
    id: string,
    updates: { status?: AssistanceRequest["status"]; notes?: string }
  ): Promise<AssistanceRequest>;
  remove(id: string): Promise<void>;
}

/** Assistance requests BFF client (`/api/assistance`). */
export const assistanceApi: AssistanceRepository = {
  async list() {
    return apiClient<AssistanceRequest[]>("/api/assistance");
  },

  async add(req) {
    return apiClient<AssistanceRequest>("/api/assistance", {
      method: "POST",
      body: JSON.stringify(req),
    });
  },

  async update(id, updates) {
    return apiClient<AssistanceRequest>(`/api/assistance/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  },

  async remove(id) {
    await apiClient<{ ok: boolean }>(`/api/assistance/${id}`, { method: "DELETE" });
  },
};

export const assistanceService: AssistanceRepository = assistanceApi;

/** @deprecated Use assistanceApi */
export const supabaseAssistanceRepository = assistanceApi;
