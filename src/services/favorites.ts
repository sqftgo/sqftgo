import { apiClient } from "@/lib/api/client";
export interface FavoritesRepository {
  list(): Promise<string[]>;
  add(propertyId: string): Promise<void>;
  remove(propertyId: string): Promise<void>;
}

export const favoritesApi: FavoritesRepository = {
  async list() {
    return apiClient<string[]>("/api/favorites");
  },

  async add(propertyId) {
    await apiClient<{ ok: boolean }>("/api/favorites", {
      method: "POST",
      body: JSON.stringify({ propertyId }),
    });
  },

  async remove(propertyId) {
    await apiClient<{ ok: boolean }>(`/api/favorites/${propertyId}`, {
      method: "DELETE",
    });
  },
};

export const favoritesService: FavoritesRepository = favoritesApi;

/** @deprecated Use favoritesApi */
export const supabaseFavoritesRepository = favoritesApi;
