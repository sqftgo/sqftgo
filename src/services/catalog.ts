import { simulateNetwork } from "@/mocks/delay";
import type { ActivityLog, Category, Location, Notification } from "@/types";
import { getStore, patchStore } from "./store";

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

export interface CatalogRepository {
  listNotifications(forRole?: Notification["forRole"]): Promise<Notification[]>;
  markNotificationRead(id: string): Promise<void>;
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
  listLogs(): Promise<ActivityLog[]>;
  addLog(log: Omit<ActivityLog, "id" | "timestamp">): Promise<ActivityLog>;
}

/** Categories/locations/logs hit Supabase; leftover notification mocks unused. */
export const supabaseCatalogRepository: CatalogRepository = {
  async listNotifications(forRole) {
    await simulateNetwork(80);
    const all = getStore().notifications;
    if (!forRole || forRole === "all") return [...all];
    return all.filter((n) => n.forRole === forRole || n.forRole === "all");
  },

  async markNotificationRead(id) {
    await simulateNetwork(60);
    patchStore({
      notifications: getStore().notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    });
  },

  async listCategories(opts) {
    const qs = opts?.all ? "?all=1" : "";
    return apiJson<Category[]>(`/api/categories${qs}`);
  },

  async createCategory(input) {
    return apiJson<Category>("/api/categories", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async updateCategory(id, updates) {
    return apiJson<Category>(`/api/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  },

  async deleteCategory(id) {
    return apiJson<{ ok: boolean; deactivated?: boolean }>(`/api/categories/${id}`, {
      method: "DELETE",
    });
  },

  async listLocations(opts) {
    const qs = opts?.all ? "?all=1" : "";
    return apiJson<Location[]>(`/api/locations${qs}`);
  },

  async createLocation(input) {
    return apiJson<Location>("/api/locations", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async updateLocation(id, updates) {
    return apiJson<Location>(`/api/locations/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  },

  async deleteLocation(id) {
    return apiJson<{ ok: boolean; deactivated?: boolean }>(`/api/locations/${id}`, {
      method: "DELETE",
    });
  },

  async listLogs() {
    return apiJson<ActivityLog[]>("/api/logs");
  },

  async addLog(log) {
    return apiJson<ActivityLog>("/api/logs", {
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

export const catalogService: CatalogRepository = supabaseCatalogRepository;
