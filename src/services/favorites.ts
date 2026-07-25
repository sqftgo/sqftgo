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

export interface FavoritesRepository {
  list(): Promise<string[]>;
  add(propertyId: string): Promise<void>;
  remove(propertyId: string): Promise<void>;
}

export const supabaseFavoritesRepository: FavoritesRepository = {
  async list() {
    return apiJson<string[]>("/api/favorites");
  },

  async add(propertyId) {
    await apiJson<{ ok: boolean }>("/api/favorites", {
      method: "POST",
      body: JSON.stringify({ propertyId }),
    });
  },

  async remove(propertyId) {
    await apiJson<{ ok: boolean }>(`/api/favorites/${propertyId}`, {
      method: "DELETE",
    });
  },
};

export const favoritesService: FavoritesRepository = supabaseFavoritesRepository;
