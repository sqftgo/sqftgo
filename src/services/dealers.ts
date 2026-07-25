import type { DirectoryProfile } from "@/types";

export interface DealerFilters {
  city?: string;
  category?: string;
  search?: string;
  mine?: boolean;
}

export interface DealerRepository {
  listProfiles(filters?: DealerFilters): Promise<DirectoryProfile[]>;
  getById(id: string): Promise<DirectoryProfile | null>;
  getByEmail(email: string): Promise<DirectoryProfile | null>;
  create(profile: Omit<DirectoryProfile, "id">): Promise<DirectoryProfile>;
  update(id: string, updates: Partial<DirectoryProfile>): Promise<DirectoryProfile>;
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

function toQuery(filters?: DealerFilters): string {
  if (!filters) return "";
  const params = new URLSearchParams();
  if (filters.city) params.set("city", filters.city);
  if (filters.category) params.set("category", filters.category);
  if (filters.search) params.set("search", filters.search);
  if (filters.mine) params.set("mine", "1");
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

/** Directory profiles hit Supabase. */
export const supabaseDealerRepository: DealerRepository = {
  async listProfiles(filters) {
    return apiJson<DirectoryProfile[]>(`/api/dealers${toQuery(filters)}`);
  },

  async getById(id) {
    try {
      return await apiJson<DirectoryProfile>(`/api/dealers/${id}`);
    } catch {
      return null;
    }
  },

  async getByEmail(email) {
    const rows = await apiJson<DirectoryProfile[]>(
      `/api/dealers?search=${encodeURIComponent(email)}`
    );
    return (
      rows.find((p) => p.email.toLowerCase() === email.toLowerCase()) ?? null
    );
  },

  async create(profile) {
    return apiJson<DirectoryProfile>("/api/dealers", {
      method: "POST",
      body: JSON.stringify(profile),
    });
  },

  async update(id, updates) {
    return apiJson<DirectoryProfile>(`/api/dealers/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  },

  async remove(id) {
    await apiJson<{ ok: boolean }>(`/api/dealers/${id}`, { method: "DELETE" });
  },
};

export const dealerService: DealerRepository = supabaseDealerRepository;
