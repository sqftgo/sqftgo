import { apiClient } from "@/lib/api/client";
import type { ActivityLog, Amenity, Category, Location } from "@/types";

export interface CatalogRepository {
  listCategories(opts?: { all?: boolean }): Promise<Category[]>;
  createCategory(input: { name: string; icon: string; active?: boolean }): Promise<Category>;
  updateCategory(
    id: string,
    updates: { name?: string; icon?: string; active?: boolean }
  ): Promise<Category>;
  deleteCategory(id: string): Promise<{ ok: boolean; deactivated?: boolean }>;
  listLocations(opts?: { all?: boolean }): Promise<Location[]>;
  createLocation(input: {
    city: string;
    state: string;
    country: string;
    active?: boolean;
  }): Promise<Location>;
  updateLocation(
    id: string,
    updates: { city?: string; state?: string; country?: string; active?: boolean }
  ): Promise<Location>;
  deleteLocation(id: string): Promise<{ ok: boolean; deactivated?: boolean }>;
  listAmenities(opts?: { all?: boolean }): Promise<Amenity[]>;
  createAmenity(input: { name: string; active?: boolean }): Promise<Amenity>;
  updateAmenity(
    id: string,
    updates: { name?: string; active?: boolean }
  ): Promise<Amenity>;
  deleteAmenity(id: string): Promise<{ ok: boolean; deactivated?: boolean }>;
  listLogs(): Promise<ActivityLog[]>;
  addLog(log: Omit<ActivityLog, "id" | "timestamp">): Promise<ActivityLog>;
}

/** Categories / locations / amenities / logs hit Supabase via BFF. */
export const catalogApi: CatalogRepository = {
  async listCategories(opts) {
    const qs = opts?.all ? "?all=1" : "";
    return apiClient<Category[]>(`/api/categories${qs}`);
  },

  async createCategory(input) {
    return apiClient<Category>("/api/categories", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async updateCategory(id, updates) {
    return apiClient<Category>(`/api/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  },

  async deleteCategory(id) {
    return apiClient<{ ok: boolean; deactivated?: boolean }>(`/api/categories/${id}`, {
      method: "DELETE",
    });
  },

  async listLocations(opts) {
    const qs = opts?.all ? "?all=1" : "";
    return apiClient<Location[]>(`/api/locations${qs}`);
  },

  async createLocation(input) {
    return apiClient<Location>("/api/locations", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async updateLocation(id, updates) {
    return apiClient<Location>(`/api/locations/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  },

  async deleteLocation(id) {
    return apiClient<{ ok: boolean; deactivated?: boolean }>(`/api/locations/${id}`, {
      method: "DELETE",
    });
  },

  async listAmenities(opts) {
    const qs = opts?.all ? "?all=1" : "";
    return apiClient<Amenity[]>(`/api/amenities${qs}`);
  },

  async createAmenity(input) {
    return apiClient<Amenity>("/api/amenities", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async updateAmenity(id, updates) {
    return apiClient<Amenity>(`/api/amenities/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  },

  async deleteAmenity(id) {
    return apiClient<{ ok: boolean; deactivated?: boolean }>(`/api/amenities/${id}`, {
      method: "DELETE",
    });
  },

  async listLogs() {
    return apiClient<ActivityLog[]>("/api/logs");
  },

  async addLog(log) {
    return apiClient<ActivityLog>("/api/logs", {
      method: "POST",
      body: JSON.stringify({
        action: log.action,
        performedBy: log.performedBy,
        role: log.role,
        target: log.target,
      }),
    });
  },
};

export const catalogService: CatalogRepository = catalogApi;

/** @deprecated Use catalogApi */
export const supabaseCatalogRepository = catalogApi;
