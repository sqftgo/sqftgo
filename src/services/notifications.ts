import type { Notification } from "@/types";

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

export interface NotificationRepository {
  list(opts?: { unread?: boolean }): Promise<Notification[]>;
  markRead(id: string): Promise<Notification>;
  markAllRead(): Promise<{ ok: boolean; updated: number }>;
  remove(id: string): Promise<void>;
}

export const supabaseNotificationRepository: NotificationRepository = {
  async list(opts) {
    const qs = opts?.unread ? "?unread=1" : "";
    return apiJson<Notification[]>(`/api/notifications${qs}`);
  },

  async markRead(id) {
    return apiJson<Notification>(`/api/notifications/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ read: true }),
    });
  },

  async markAllRead() {
    return apiJson<{ ok: boolean; updated: number }>("/api/notifications/mark-all-read", {
      method: "POST",
      body: JSON.stringify({}),
    });
  },

  async remove(id) {
    await apiJson<{ ok: boolean }>(`/api/notifications/${id}`, { method: "DELETE" });
  },
};

export const notificationService: NotificationRepository = supabaseNotificationRepository;
