import { apiClient } from "@/lib/api/client";
import type { GeneralEnquiry } from "@/types";

export interface EnquiryRepository {
  list(): Promise<GeneralEnquiry[]>;
  add(
    enq: Omit<GeneralEnquiry, "id" | "date"> & { payload?: Record<string, unknown> }
  ): Promise<GeneralEnquiry>;
  remove(id: string): Promise<void>;
}

/** General enquiries BFF client (`/api/enquiries`). */
export const supabaseEnquiryRepository: EnquiryRepository = {
  async list() {
    return apiClient<GeneralEnquiry[]>("/api/enquiries");
  },

  async add(enq) {
    return apiClient<GeneralEnquiry>("/api/enquiries", {
      method: "POST",
      body: JSON.stringify(enq),
    });
  },

  async remove(id) {
    await apiClient<{ ok: boolean }>(`/api/enquiries/${id}`, { method: "DELETE" });
  },
};

export const enquiryService: EnquiryRepository = supabaseEnquiryRepository;
