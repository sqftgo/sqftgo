import { apiClient } from "@/lib/api/client";
import type { VisitBooking, VisitStatusUi } from "@/types";

export type VisitCreatePayload = {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  notes?: string;
};

export type VisitUpdatePayload = {
  status?: VisitStatusUi;
  date?: string;
  time?: string;
  notes?: string;
  brokerNotes?: string;
};

export interface VisitRepository {
  list(opts?: { status?: VisitStatusUi }): Promise<VisitBooking[]>;
  book(propertyId: string, payload: VisitCreatePayload): Promise<VisitBooking>;
  update(id: string, updates: VisitUpdatePayload): Promise<VisitBooking>;
}

export const supabaseVisitRepository: VisitRepository = {
  async list(opts) {
    const qs = opts?.status ? `?status=${encodeURIComponent(opts.status)}` : "";
    return apiClient<VisitBooking[]>(`/api/visits${qs}`);
  },

  async book(propertyId, payload) {
    return apiClient<VisitBooking>(`/api/properties/${propertyId}/visits`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async update(id, updates) {
    return apiClient<VisitBooking>(`/api/visits/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  },
};

export const visitService: VisitRepository = supabaseVisitRepository;
