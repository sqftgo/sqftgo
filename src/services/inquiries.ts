import { simulateNetwork } from "@/mocks/delay";
import type { AssistanceRequest, CustomerReview, GeneralEnquiry, PropertyInquiry } from "@/types";
import { getStore, patchStore } from "./store";

export interface InquiryRepository {
  listByProperty(propertyId: string): Promise<PropertyInquiry[]>;
  listAll(): Promise<Record<string, PropertyInquiry[]>>;
  submit(propertyId: string, inquiry: Omit<PropertyInquiry, "date">): Promise<PropertyInquiry>;
  remove(propertyId: string, index: number): Promise<void>;
  listAssistance(): Promise<AssistanceRequest[]>;
  addAssistance(req: Omit<AssistanceRequest, "id" | "status">): Promise<AssistanceRequest>;
  listEnquiries(): Promise<GeneralEnquiry[]>;
  addEnquiry(enq: Omit<GeneralEnquiry, "id" | "date">): Promise<GeneralEnquiry>;
  listReviews(): Promise<CustomerReview[]>;
  addReview(rev: Omit<CustomerReview, "id" | "date">): Promise<CustomerReview>;
}

export const mockInquiryRepository: InquiryRepository = {
  async listByProperty(propertyId) {
    await simulateNetwork(80);
    return [...(getStore().inquiries[propertyId] ?? [])];
  },

  async listAll() {
    await simulateNetwork(80);
    return structuredClone(getStore().inquiries);
  },

  async submit(propertyId, inquiry) {
    await simulateNetwork(160);
    const entry: PropertyInquiry = {
      ...inquiry,
      date: new Date().toISOString().split("T")[0],
    };
    const inquiries = {
      ...getStore().inquiries,
      [propertyId]: [...(getStore().inquiries[propertyId] ?? []), entry],
    };
    const properties = getStore().properties.map((p) =>
      p.id === propertyId ? { ...p, inquiryCount: p.inquiryCount + 1 } : p
    );
    patchStore({ inquiries, properties });
    return entry;
  },

  async remove(propertyId, index) {
    await simulateNetwork(100);
    const existing = getStore().inquiries[propertyId] ?? [];
    const updated = existing.filter((_, i) => i !== index);
    const inquiries = { ...getStore().inquiries, [propertyId]: updated };
    const properties = getStore().properties.map((p) =>
      p.id === propertyId
        ? { ...p, inquiryCount: Math.max(0, p.inquiryCount - 1) }
        : p
    );
    patchStore({ inquiries, properties });
  },

  async listAssistance() {
    await simulateNetwork(80);
    return [...getStore().assistanceRequests];
  },

  async addAssistance(req) {
    await simulateNetwork(140);
    const item: AssistanceRequest = {
      ...req,
      id: `req-${Date.now()}`,
      status: "Received",
    };
    patchStore({ assistanceRequests: [item, ...getStore().assistanceRequests] });
    return item;
  },

  async listEnquiries() {
    await simulateNetwork(80);
    return [...getStore().enquiries];
  },

  async addEnquiry(enq) {
    await simulateNetwork(140);
    const item: GeneralEnquiry = {
      ...enq,
      id: `enq-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
    };
    patchStore({ enquiries: [item, ...getStore().enquiries] });
    return item;
  },

  async listReviews() {
    await simulateNetwork(80);
    return [...getStore().reviews];
  },

  async addReview(rev) {
    await simulateNetwork(120);
    const item: CustomerReview = {
      ...rev,
      id: `rev-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
    };
    patchStore({ reviews: [item, ...getStore().reviews] });
    return item;
  },
};

export const inquiryService: InquiryRepository = mockInquiryRepository;
