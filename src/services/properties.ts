import type { Property } from "@/types";

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

async function apiJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    credentials: "same-origin",
  });

  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) {
    throw new Error(
      typeof data === "object" && data && "error" in data && data.error
        ? String(data.error)
        : "Request failed"
    );
  }
  return data;
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
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const supabasePropertyRepository: PropertyRepository = {
  async list(filters) {
    return apiJson<Property[]>(`/api/properties${toQuery(filters)}`);
  },

  async getById(id) {
    try {
      return await apiJson<Property>(`/api/properties/${id}`);
    } catch {
      return null;
    }
  },

  async create(input) {
    return apiJson<Property>("/api/properties", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async update(id, updates) {
    return apiJson<Property>(`/api/properties/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  },

  async remove(id) {
    await apiJson<{ ok: boolean }>(`/api/properties/${id}`, {
      method: "DELETE",
    });
  },
};

export const propertyService: PropertyRepository = supabasePropertyRepository;
