"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import {
  NotificationsPageShell,
  type DashboardNotification,
} from "@/components/ui";

const DEALER_PREFERENCES = [
  {
    key: "inquiries",
    label: "Property Inquiries",
    description: "Alert when a buyer submits an inquiry on your listings.",
  },
  {
    key: "visits",
    label: "Site Visit Requests",
    description: "Notify when buyers request or confirm property tours.",
  },
  {
    key: "messages",
    label: "Direct Messages",
    description: "Alert when buyers send you a direct message.",
  },
  {
    key: "approvals",
    label: "Listing Status Updates",
    description: "Notify when admin approves or rejects your listings.",
  },
];

export default function DealerNotificationsPage() {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
  } = useApp();

  return (
    <NotificationsPageShell
      accent="indigo"
      roleFilter="broker"
      notifications={notifications as DashboardNotification[]}
      preferences={DEALER_PREFERENCES}
      prefsStorageKey="dealer"
      initialPrefs={{
        inquiries: true,
        visits: true,
        messages: true,
        approvals: true,
      }}
      unreadLabel={(n) => `${n} dealer alerts awaiting action`}
      preferencesTitle="Dealer Alert Preferences"
      preferencesDescription="Choose which buyer and listing events trigger notifications."
      preferencesButtonLabel="Preferences"
      onMarkRead={(id) => {
        void markNotificationRead(id);
      }}
      onMarkAll={() => {
        void markAllNotificationsRead();
      }}
      onDelete={(id) => {
        void deleteNotification(id);
      }}
    />
  );
}
