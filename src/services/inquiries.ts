import { apiClient } from "@/lib/api/client";
import type { AssistanceRequest, GeneralEnquiry, PropertyInquiry } from "@/types";
import type { PropertyInquiryView } from "@/lib/mappers/inquiry";

export interface InquiryRepository {
  listByProperty(propertyId: string): Promise<PropertyInquiry[]>;
  listAll(): Promise<Record<string, PropertyInquiry[]>>;
  listFlat(opts?: { mine?: boolean }): Promise<PropertyInquiryView[]>;
  submit(propertyId: string, inquiry: Omit<PropertyInquiry, "date" | "id" | "status">): Promise<PropertyInquiry>;
  remove(propertyId: string, index: number): Promise<void>;
  removeById(inquiryId: string): Promise<void>;
  updateStatus(inquiryId: string, status: "new" | "read" | "archived"): Promise<PropertyInquiryView>;
  listAssistance(): Promise<AssistanceRequest[]>;
  addAssistance(req: Omit<AssistanceRequest, "id" | "status">): Promise<AssistanceRequest>;
  updateAssistance(id: string, updates: { status?: AssistanceRequest["status"]; notes?: string }): Promise<AssistanceRequest>;
  removeAssistance(id: string): Promise<void>;
  listEnquiries(): Promise<GeneralEnquiry[]>;
  addEnquiry(enq: Omit<GeneralEnquiry, "id" | "date"> & { payload?: Record<string, unknown> }): Promise<GeneralEnquiry>;
  removeEnquiry(id: string): Promise<void>;
}

function toRecord(rows: PropertyInquiryView[]): Record<string, PropertyInquiry[]> {
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
  return out;
}

/** Property inquiries + assistance/enquiries hit Supabase. */
export const supabaseInquiryRepository: InquiryRepository = {
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
    return toRecord(rows);
  },

  async listFlat(opts) {
    const qs = opts?.mine ? "?mine=1" : "";
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

  async listAssistance() {
    return apiClient<AssistanceRequest[]>("/api/assistance");
  },

  async addAssistance(req) {
    return apiClient<AssistanceRequest>("/api/assistance", {
      method: "POST",
      body: JSON.stringify(req),
    });
  },

  async updateAssistance(id, updates) {
    return apiClient<AssistanceRequest>(`/api/assistance/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  },

  async removeAssistance(id) {
    await apiClient<{ ok: boolean }>(`/api/assistance/${id}`, { method: "DELETE" });
  },

  async listEnquiries() {
    return apiClient<GeneralEnquiry[]>("/api/enquiries");
  },

  async addEnquiry(enq) {
    return apiClient<GeneralEnquiry>("/api/enquiries", {
      method: "POST",
      body: JSON.stringify(enq),
    });
  },

  async removeEnquiry(id) {
    await apiClient<{ ok: boolean }>(`/api/enquiries/${id}`, { method: "DELETE" });
  },
};

export const inquiryService: InquiryRepository = supabaseInquiryRepository;
