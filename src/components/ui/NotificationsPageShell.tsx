"use client";

import React, { useState } from "react";
import {
  Bell,
  CheckCheck,
  Trash2,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Info,
  CreditCard,
  Building,
  Settings,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  EmptyState,
  DashboardPageHeader,
  Switch,
  Button,
  Panel,
} from "@/components/ui";

export type NotificationRole = "admin" | "broker" | "all";

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  forRole: NotificationRole;
}

export interface NotificationPrefItem {
  key: string;
  label: string;
  description: string;
}

export interface NotificationsPageShellProps {
  accent?: "indigo" | "terracotta";
  roleFilter: NotificationRole;
  notifications: DashboardNotification[];
  preferences: NotificationPrefItem[];
  initialPrefs: Record<string, boolean>;
  unreadLabel?: (count: number) => string;
  preferencesTitle?: string;
  preferencesDescription?: string;
  preferencesButtonLabel?: string;
  emptyIconClassName?: string;
  onMarkRead: (id: string) => void;
  onMarkAll: () => void;
  onDelete: (id: string) => void;
}

function getGroupTitle(dateStr: string) {
  try {
    const parts = dateStr.split("-");
    if (parts.length !== 3) return "Earlier";
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const notifDate = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    notifDate.setHours(0, 0, 0, 0);
    const diffDays = Math.round((today.getTime() - notifDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return "This Week";
    return "Earlier";
  } catch {
    return "Earlier";
  }
}

function notificationIcon(notif: DashboardNotification, accent: "indigo" | "terracotta") {
  const text = `${notif.title} ${notif.message}`.toLowerCase();
  const accentColor = accent === "terracotta" ? "text-terracotta" : "text-indigo";

  if (text.includes("inquiry") || text.includes("message")) {
    return <MessageSquare className={`w-4 h-4 ${accentColor}`} />;
  }
  if (
    text.includes("registration") ||
    text.includes("dealer") ||
    text.includes("user") ||
    text.includes("building")
  ) {
    return <Building className={`w-4 h-4 ${accentColor}`} />;
  }
  if (
    text.includes("approved") ||
    text.includes("success") ||
    text.includes("verified") ||
    text.includes("welcome")
  ) {
    return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
  }
  if (
    text.includes("pending") ||
    text.includes("review") ||
    text.includes("waiting") ||
    text.includes("warning")
  ) {
    return <AlertTriangle className="w-4 h-4 text-amber-600" />;
  }
  if (
    text.includes("razorpay") ||
    text.includes("payment") ||
    text.includes("revenue") ||
    text.includes("billing") ||
    text.includes("invoice") ||
    text.includes("subscription")
  ) {
    return <CreditCard className="w-4 h-4 text-purple-600" />;
  }
  return <Info className={`w-4 h-4 ${accent === "terracotta" ? "text-terracotta/70" : "text-indigo/60"}`} />;
}

const GROUP_ORDER = ["Today", "Yesterday", "This Week", "Earlier"];

export function NotificationsPageShell({
  accent = "indigo",
  roleFilter,
  notifications,
  preferences,
  initialPrefs,
  unreadLabel = (n) => `${n} unread alerts requiring your attention`,
  preferencesTitle = "Configure Alert Preferences",
  preferencesDescription = "Customize when you receive push dashboard updates.",
  preferencesButtonLabel = "Preferences",
  emptyIconClassName,
  onMarkRead,
  onMarkAll,
  onDelete,
}: NotificationsPageShellProps) {
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [prefForm, setPrefForm] = useState(initialPrefs);

  const filtered = notifications.filter(
    (n) => n.forRole === roleFilter || n.forRole === "all"
  );
  const unread = filtered.filter((n) => !n.read).length;

  const unreadBg =
    accent === "terracotta"
      ? "bg-terracotta/[0.015] border-terracotta/20 shadow-sm"
      : "bg-indigo/[0.02] border-indigo/15 shadow-sm";
  const pulseDot = accent === "terracotta" ? "bg-terracotta" : "bg-indigo";
  const primaryBtn =
    accent === "terracotta"
      ? "bg-terracotta hover:bg-terracotta-hover shadow-terracotta/10"
      : "bg-indigo hover:bg-indigo-hover shadow-indigo/10";
  const hoverAccent =
    accent === "terracotta" ? "hover:text-terracotta" : "hover:text-indigo";

  const grouped = filtered.reduce(
    (groups, notif) => {
      const title = getGroupTitle(notif.date);
      if (!groups[title]) groups[title] = [];
      groups[title].push(notif);
      return groups;
    },
    {} as Record<string, typeof filtered>
  );

  return (
    <div className="p-6 md:p-8 bg-[#faf8f5] min-h-screen text-charcoal w-full space-y-6">
      <DashboardPageHeader
        title="Notifications"
        description={unreadLabel(unread)}
        className="rounded-3xl"
        actions={
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPreferencesOpen(!preferencesOpen)}
              className={`flex items-center gap-1.5 px-4 py-2 bg-white border border-indigo/10 hover:bg-sand/35 text-charcoal/70 ${hoverAccent} text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs`}
            >
              <Settings className="w-4 h-4" /> {preferencesButtonLabel}
              {preferencesOpen ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
            {unread > 0 && (
              <button
                type="button"
                onClick={onMarkAll}
                className={`flex items-center gap-1.5 px-4 py-2 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md ${primaryBtn}`}
              >
                <CheckCheck className="w-4 h-4" /> Mark All Read
              </button>
            )}
          </div>
        }
      />

      <AnimatePresence>
        {preferencesOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <Panel padding="lg" rounded="3xl" className="shadow-xs">
              <div className="mb-4">
                <h2 className="text-xs font-bold text-charcoal">{preferencesTitle}</h2>
                <p className="text-[10px] text-charcoal/40 font-semibold mt-0.5">
                  {preferencesDescription}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {preferences.map(({ key, label, description }) => (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-4 p-3 bg-sand/15 border border-indigo/5 rounded-2xl"
                  >
                    <div>
                      <p className="text-[11px] font-bold text-charcoal leading-none">{label}</p>
                      <p className="text-[9px] text-charcoal/40 font-semibold mt-1">{description}</p>
                    </div>
                    <Switch
                      size="sm"
                      accent={accent}
                      checked={Boolean(prefForm[key])}
                      onCheckedChange={(checked) =>
                        setPrefForm((prev) => ({ ...prev, [key]: checked }))
                      }
                      aria-label={label}
                    />
                  </div>
                ))}
              </div>
            </Panel>
          </motion.div>
        )}
      </AnimatePresence>

      {filtered.length === 0 ? (
        <EmptyState
          title="All Caught Up"
          description="Newly received messages, listing reviews, and payouts will appear here."
          icon={
            <Bell
              className={
                emptyIconClassName ??
                (accent === "terracotta" ? "w-8 h-8 text-terracotta/30" : "w-8 h-8 text-indigo/40")
              }
            />
          }
        />
      ) : (
        <div className="space-y-6">
          {GROUP_ORDER.map((group) => {
            const list = grouped[group];
            if (!list?.length) return null;
            return (
              <div key={group} className="space-y-3">
                <h2 className="text-[10px] font-black text-charcoal/40 uppercase tracking-widest px-1">
                  {group}
                </h2>
                <div className="space-y-2.5">
                  {list.map((notif, idx) => (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => onMarkRead(notif.id)}
                      className={`group border rounded-3xl p-5 cursor-pointer transition-all hover:shadow-md ${
                        notif.read ? "bg-white border-indigo/5 opacity-60" : unreadBg
                      }`}
                    >
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center shrink-0 pt-0.5">
                          <div
                            className={`w-2.5 h-2.5 rounded-full ${
                              notif.read ? "bg-charcoal/15" : `${pulseDot} animate-pulse`
                            }`}
                          />
                        </div>
                        <div className="w-9 h-9 rounded-2xl bg-white border border-indigo/10 flex items-center justify-center shrink-0 shadow-xs">
                          {notificationIcon(notif, accent)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <p
                              className={`text-xs text-charcoal leading-snug truncate ${
                                notif.read ? "font-semibold" : "font-extrabold"
                              }`}
                            >
                              {notif.title}
                            </p>
                            <span className="text-[8px] font-black text-charcoal/30 bg-sand/40 border border-indigo/5 px-2 py-0.5 rounded-md shrink-0">
                              {notif.date}
                            </span>
                          </div>
                          <p className="text-[10px] text-charcoal/50 font-semibold mt-1 leading-relaxed">
                            {notif.message}
                          </p>
                        </div>
                        <div className="flex items-center shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(notif.id);
                            }}
                            className="p-2 text-charcoal/30 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                            title="Delete alert"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default NotificationsPageShell;
