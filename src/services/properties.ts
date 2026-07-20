import { simulateNetwork } from "@/mocks/delay";
import type { Property } from "@/types";
import { getStore, patchStore } from "./store";

export interface PropertyFilters {
  city?: string;
  type?: string;
  purpose?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: Property["status"];
  ownerEmail?: string;
  featured?: boolean;
  search?: string;
}

export type PropertyCreateInput = Omit<
  Property,
  "id" | "inquiryCount" | "status" | "ownerName" | "ownerPhone" | "ownerEmail"
> & {
  status?: Property["status"];
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
};

export interface PropertyRepository {
  list(filters?: PropertyFilters): Promise<Property[]>;
  getById(id: string): Promise<Property | null>;
  create(input: PropertyCreateInput): Promise<Property>;
  update(id: string, updates: Partial<Property>): Promise<Property>;
  remove(id: string): Promise<void>;
}

function applyFilters(items: Property[], filters?: PropertyFilters): Property[] {
  if (!filters) return items;
  return items.filter((p) => {
    if (filters.city && filters.city !== "All India" && p.city !== filters.city) return false;
    if (filters.type && filters.type !== "any" && p.type !== filters.type) return false;
    if (filters.purpose && p.purpose !== filters.purpose) return false;
    if (filters.status && p.status !== filters.status) return false;
    if (filters.ownerEmail && p.ownerEmail?.toLowerCase() !== filters.ownerEmail.toLowerCase()) return false;
    if (filters.featured !== undefined && Boolean(p.featured) !== filters.featured) return false;
    if (filters.minPrice !== undefined && p.price < filters.minPrice) return false;
    if (filters.maxPrice !== undefined && p.price > filters.maxPrice) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const hay = `${p.title} ${p.locality} ${p.city} ${p.type}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export const mockPropertyRepository: PropertyRepository = {
  async list(filters) {
    await simulateNetwork(120);
    return applyFilters([...getStore().properties], filters);
  },

  async getById(id) {
    await simulateNetwork(80);
    return getStore().properties.find((p) => p.id === id) ?? null;
  },

  async create(input) {
    await simulateNetwork(180);
    const property: Property = {
      ...input,
      id: `prop-${Date.now()}`,
      inquiryCount: 0,
      status: input.status ?? "Pending Review",
      ownerName: input.ownerName ?? "Owner User",
      ownerPhone: input.ownerPhone ?? "+91 99000 99000",
      ownerEmail: input.ownerEmail ?? "owner@example.com",
    };
    patchStore({ properties: [property, ...getStore().properties] });
    return property;
  },

  async update(id, updates) {
    await simulateNetwork(140);
    const next = getStore().properties.map((p) => (p.id === id ? { ...p, ...updates } : p));
    const updated = next.find((p) => p.id === id);
    if (!updated) throw new Error("Property not found");
    patchStore({ properties: next });
    return updated;
  },

  async remove(id) {
    await simulateNetwork(100);
    patchStore({ properties: getStore().properties.filter((p) => p.id !== id) });
  },
};

export const propertyService: PropertyRepository = mockPropertyRepository;
