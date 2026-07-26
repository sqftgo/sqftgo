import type { Property } from "@/types";
import { apiClient, type PaginatedResult } from "@/lib/api/client";

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
  /** When true, returns only the authenticated broker's listings (all statuses). */
  mine?: boolean;
  limit?: number;
  offset?: number;
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
  listPage(filters?: PropertyFilters): Promise<PaginatedResult<Property>>;
  getById(id: string): Promise<Property | null>;
  create(input: PropertyCreateInput): Promise<Property>;
  update(id: string, updates: Partial<Property>): Promise<Property>;
  remove(id: string): Promise<void>;
}

function toQuery(filters?: PropertyFilters): string {
  if (!filters) return "";
  const params = new URLSearchParams();
  if (filters.city) params.set("city", filters.city);
  if (filters.type) params.set("type", filters.type);
  if (filters.purpose) params.set("purpose", filters.purpose);
  if (filters.minPrice !== undefined) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice));
  if (filters.status) params.set("status", filters.status);
  if (filters.ownerEmail) params.set("ownerEmail", filters.ownerEmail);
  if (filters.featured !== undefined) params.set("featured", String(filters.featured));
  if (filters.search) params.set("search", filters.search);
  if (filters.mine) params.set("mine", "1");
  if (filters.limit !== undefined) params.set("limit", String(filters.limit));
  if (filters.offset !== undefined) params.set("offset", String(filters.offset));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const propertyApi: PropertyRepository = {
  async listPage(filters) {
    return apiClient<PaginatedResult<Property>>(`/api/properties${toQuery(filters)}`);
  },

  async list(filters) {
    const page = await this.listPage(filters);
    return page.items;
  },

  async getById(id) {
    try {
      return await apiClient<Property>(`/api/properties/${id}`);
    } catch {
      return null;
    }
  },

  async create(input) {
    return apiClient<Property>("/api/properties", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async update(id, updates) {
    return apiClient<Property>(`/api/properties/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  },

  async remove(id) {
    await apiClient<{ ok: boolean }>(`/api/properties/${id}`, { method: "DELETE" });
  },
};

export const propertyService: PropertyRepository = propertyApi;

/** @deprecated Use propertyApi */
export const supabasePropertyRepository = propertyApi;
