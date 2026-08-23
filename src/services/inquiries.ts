import { apiClient } from "@/lib/api/client";
import type { PropertyInquiry, PropertyInquiryView } from "@/types";
import { toInquiryRecord } from "@/lib/mappers/inquiry";

export interface InquiryRepository {
  listByProperty(propertyId: string): Promise<PropertyInquiry[]>;
  listAll(): Promise<Record<string, PropertyInquiry[]>>;
  listFlat(opts?: { mine?: boolean; received?: boolean }): Promise<PropertyInquiryView[]>;
  submit(propertyId: string, inquiry: Omit<PropertyInquiry, "date" | "id" | "status">): Promise<PropertyInquiry>;
  remove(propertyId: string, index: number): Promise<void>;
  removeById(inquiryId: string): Promise<void>;
  updateStatus(inquiryId: string, status: "new" | "read" | "archived"): Promise<PropertyInquiryView>;
}

/** Property inquiries BFF client. */
export const inquiryApi: InquiryRepository = {
  async listByProperty(propertyId) {
    const rows = await apiClient<PropertyInquiryView[]>(`/api/properties/${propertyId}/inquiries`);
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      message: r.message,
      date: r.date,
      status: r.status,
    }));
  },

  async listAll() {
    const rows = await apiClient<PropertyInquiryView[]>("/api/inquiries");
    return toInquiryRecord(rows);
  },

  async listFlat(opts) {
    const params = new URLSearchParams();
    if (opts?.mine) params.set("mine", "1");
    if (opts?.received) params.set("received", "1");
    const qs = params.toString() ? `?${params.toString()}` : "";
    return apiClient<PropertyInquiryView[]>(`/api/inquiries${qs}`);
  },

  async submit(propertyId, inquiry) {
    const created = await apiClient<PropertyInquiryView>(`/api/properties/${propertyId}/inquiries`, {
      method: "POST",
      body: JSON.stringify({
        name: inquiry.name,
        email: inquiry.email,
        phone: inquiry.phone,
        message: inquiry.message,
      }),
    });
    return {
      id: created.id,
      name: created.name,
      email: created.email,
      phone: created.phone,
      message: created.message,
      date: created.date,
      status: created.status,
    };
  },

  async remove(_propertyId, _index) {
    throw new Error("Use removeById with the inquiry id");
  },

  async removeById(inquiryId) {
    await apiClient<{ ok: boolean }>(`/api/inquiries/${inquiryId}`, { method: "DELETE" });
  },

  async updateStatus(inquiryId, status) {
    return apiClient<PropertyInquiryView>(`/api/inquiries/${inquiryId}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },
};

export const inquiryService: InquiryRepository = inquiryApi;

/** @deprecated Use inquiryApi */
export const supabaseInquiryRepository = inquiryApi;
