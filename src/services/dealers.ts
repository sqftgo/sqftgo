import type { DirectoryProfile } from "@/types";
import { apiClient, type PaginatedResult } from "@/lib/api/client";

export interface DealerFilters {
  city?: string;
  category?: string;
  search?: string;
  mine?: boolean;
  limit?: number;
  offset?: number;
}

export interface DealerRepository {
  listProfiles(filters?: DealerFilters): Promise<DirectoryProfile[]>;
  listProfilesPage(filters?: DealerFilters): Promise<PaginatedResult<DirectoryProfile>>;
  getById(id: string): Promise<DirectoryProfile | null>;
  getByEmail(email: string): Promise<DirectoryProfile | null>;
  create(profile: Omit<DirectoryProfile, "id">): Promise<DirectoryProfile>;
  update(id: string, updates: Partial<DirectoryProfile>): Promise<DirectoryProfile>;
  remove(id: string): Promise<void>;
}

function toQuery(filters?: DealerFilters): string {
  if (!filters) return "";
  const params = new URLSearchParams();
  if (filters.city) params.set("city", filters.city);
  if (filters.category) params.set("category", filters.category);
  if (filters.search) params.set("search", filters.search);
  if (filters.mine) params.set("mine", "1");
  if (filters.limit !== undefined) params.set("limit", String(filters.limit));
  if (filters.offset !== undefined) params.set("offset", String(filters.offset));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const dealerApi: DealerRepository = {
  async listProfilesPage(filters) {
    return apiClient<PaginatedResult<DirectoryProfile>>(`/api/dealers${toQuery(filters)}`);
  },

  async listProfiles(filters) {
    const page = await this.listProfilesPage(filters);
    return page.items;
  },

  async getById(id) {
    try {
      return await apiClient<DirectoryProfile>(`/api/dealers/${id}`);
    } catch {
      return null;
    }
  },

  async getByEmail(email) {
    const page = await apiClient<PaginatedResult<DirectoryProfile>>(
      `/api/dealers?search=${encodeURIComponent(email)}&limit=20`
    );
    return (
      page.items.find((p) => p.email.toLowerCase() === email.toLowerCase()) ?? null
    );
  },

  async create(profile) {
    return apiClient<DirectoryProfile>("/api/dealers", {
      method: "POST",
      body: JSON.stringify(profile),
    });
  },

  async update(id, updates) {
    return apiClient<DirectoryProfile>(`/api/dealers/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  },

  async remove(id) {
    await apiClient<{ ok: boolean }>(`/api/dealers/${id}`, { method: "DELETE" });
  },
};

export const dealerService: DealerRepository = dealerApi;

/** @deprecated Use dealerApi */
export const supabaseDealerRepository = dealerApi;
