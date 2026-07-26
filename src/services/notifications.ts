import { apiClient } from "@/lib/api/client";
import type { Notification } from "@/types";

export interface NotificationRepository {
  list(opts?: { unread?: boolean }): Promise<Notification[]>;
  markRead(id: string): Promise<Notification>;
  markAllRead(): Promise<{ ok: boolean; updated: number }>;
  remove(id: string): Promise<void>;
}

export const notificationApi: NotificationRepository = {
  async list(opts) {
    const qs = opts?.unread ? "?unread=1" : "";
    return apiClient<Notification[]>(`/api/notifications${qs}`);
  },

  async markRead(id) {
    return apiClient<Notification>(`/api/notifications/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ read: true }),
    });
  },

  async markAllRead() {
    return apiClient<{ ok: boolean; updated: number }>("/api/notifications/mark-all-read", {
      method: "POST",
      body: JSON.stringify({}),
    });
  },

  async remove(id) {
    await apiClient<{ ok: boolean }>(`/api/notifications/${id}`, { method: "DELETE" });
  },
};

export const notificationService: NotificationRepository = notificationApi;

/** @deprecated Use notificationApi */
export const supabaseNotificationRepository = notificationApi;
