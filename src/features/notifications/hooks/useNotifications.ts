"use client";

import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { Notification } from "@/types";
import { notificationService } from "@/services";

type UseNotificationsArgs = {
  sessionReady: boolean;
  isLoggedIn: boolean;
  userRole: "user" | "broker" | "admin" | null;
};

export function useNotifications({ sessionReady, isLoggedIn, userRole }: UseNotificationsArgs) {
  const [notifications, setNotificationsState] = useState<Notification[]>([]);
  const [notificationsReady, setNotificationsReady] = useState(false);

  const refreshNotifications = useCallback(async () => {
    if (!hasSupabaseEnv() || !isLoggedIn) {
      setNotificationsState([]);
      setNotificationsReady(true);
      return;
    }
    try {
      const rows = await notificationService.list();
      setNotificationsState(rows);
    } catch {
      setNotificationsState([]);
    } finally {
      setNotificationsReady(true);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!sessionReady) return;
    void refreshNotifications();
  }, [sessionReady, isLoggedIn, userRole, refreshNotifications]);

  const setNotifications: Dispatch<SetStateAction<Notification[]>> = useCallback(
    (action) => {
      setNotificationsState((current) =>
        typeof action === "function" ? action(current) : action
      );
    },
    []
  );

  const markNotificationRead = useCallback(async (id: string) => {
    const updated = await notificationService.markRead(id);
    setNotificationsState((prev) => prev.map((n) => (n.id === id ? updated : n)));
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    await notificationService.markAllRead();
    setNotificationsState((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    await notificationService.remove(id);
    setNotificationsState((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return {
    notifications,
    notificationsReady,
    refreshNotifications,
    setNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
  };
}
