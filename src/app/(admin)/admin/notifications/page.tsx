"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import {
  NotificationsPageShell,
  type DashboardNotification,
} from "@/components/ui";

const ADMIN_PREFERENCES = [
  {
    key: "registrations",
    label: "Dealer Self-Registration",
    description: "Alert when a new dealer registers.",
  },
  {
    key: "approvals",
    label: "Listing Approval Requests",
    description: "Notify when reviews are pending.",
  },
  {
    key: "payments",
    label: "Payment & Settlements",
    description: "Confirm invoices and checkout events.",
  },
  {
    key: "system",
    label: "Server Log Warnings",
    description: "Urgent notifications on DB failures.",
  },
];

export default function AdminNotificationsPage() {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
  } = useApp();

  return (
    <NotificationsPageShell
      accent="terracotta"
      roleFilter="admin"
      notifications={notifications as DashboardNotification[]}
      preferences={ADMIN_PREFERENCES}
      prefsStorageKey="admin"
      initialPrefs={{
        registrations: true,
        approvals: true,
        payments: true,
        system: true,
      }}
      unreadLabel={(n) => `${n} system alerts awaiting action`}
      preferencesTitle="System Dispatch Rules"
      preferencesDescription="Toggle live alerts for standard operational flows."
      preferencesButtonLabel="Configs"
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
