"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Bell, CheckCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function DealerNotificationsPage() {
  const { notifications, setNotifications, markNotificationRead } = useApp();
  const myNotifs = notifications.filter(n => n.forRole === "broker" || n.forRole === "all");
  const unread = myNotifs.filter(n => !n.read).length;

  const markAll = () => setNotifications(prev => prev.map(n => (n.forRole === "broker" || n.forRole === "all") ? { ...n, read: true } : n));

  const typeColor: Record<string, string> = {
    success: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    error: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    info: "bg-indigo/10 text-indigo border-indigo/25",
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-3xl mx-auto text-charcoal">
      <div className="flex items-center justify-between bg-white/60 border border-indigo/10 rounded-3xl p-5 shadow-sm">
        <div>
          <h1 className="text-2xl font-serif font-black text-charcoal">Notifications</h1>
          <p className="text-charcoal/50 text-xs font-semibold mt-1">{unread} unread alerts</p>
        </div>
        {unread > 0 && (
          <button onClick={markAll} className="flex items-center gap-1.5 px-4 py-2 border border-indigo/10 bg-white hover:bg-sand/35 text-indigo text-xs font-bold rounded-xl transition-all cursor-pointer">
            <CheckCheck className="w-4 h-4" /> Mark All Read
          </button>
        )}
      </div>

      {myNotifs.length === 0 ? (
        <div className="bg-white/80 border border-indigo/10 rounded-3xl p-16 text-center shadow-sm">
          <Bell className="w-12 h-12 text-indigo/20 mx-auto mb-4" />
          <p className="text-charcoal/50 font-semibold text-sm">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {myNotifs.map((notif, i) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => markNotificationRead(notif.id)}
              className={`bg-white/80 border rounded-3xl p-5 cursor-pointer transition-all shadow-sm hover:shadow-md ${
                notif.read ? "border-indigo/5 opacity-60" : "border-indigo/15"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${!notif.read ? "bg-indigo animate-pulse" : "bg-charcoal/15"}`} />
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-bold text-charcoal">{notif.title}</p>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border shrink-0 ${typeColor[notif.type]}`}>{notif.type}</span>
                  </div>
                  <p className="text-xs text-charcoal/65 font-semibold mt-1.5 leading-relaxed">{notif.message}</p>
                  <p className="text-[9px] text-charcoal/40 font-bold mt-2">{notif.date}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
