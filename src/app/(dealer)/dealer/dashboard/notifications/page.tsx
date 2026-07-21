"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import {
  NotificationsPageShell,
  type DashboardNotification,
} from "@/components/ui";

const DEALER_PREFERENCES = [
  {
    key: "leads",
    label: "New Leads / Messages",
    description: "Notify when buyer posts inquiries.",
  },
  {
    key: "approvals",
    label: "Listing Approvals",
    description: "Alert when admin approves properties.",
  },
  {
    key: "system",
    label: "System Service Status",
    description: "Urgent updates on platform status.",
  },
  {
    key: "news",
    label: "News & Marketing",
    description: "Tips, tricks, and analytics summaries.",
  },
];

export default function DealerNotificationsPage() {
  const { notifications, setNotifications, markNotificationRead } = useApp();

  return (
    <NotificationsPageShell
      accent="indigo"
      roleFilter="broker"
      notifications={notifications as DashboardNotification[]}
      preferences={DEALER_PREFERENCES}
      initialPrefs={{
        leads: true,
        approvals: true,
        news: false,
        system: true,
      }}
      unreadLabel={(n) => `${n} unread alerts requiring your attention`}
      preferencesTitle="Configure Alert Preferences"
      preferencesDescription="Customize when you receive push dashboard updates."
      preferencesButtonLabel="Preferences"
      onMarkRead={markNotificationRead}
      onMarkAll={() =>
        setNotifications((prev) =>
          prev.map((n) =>
            n.forRole === "broker" || n.forRole === "all" ? { ...n, read: true } : n
          )
        )
      }
      onDelete={(id) => setNotifications((prev) => prev.filter((n) => n.id !== id))}
    />
  );
}
