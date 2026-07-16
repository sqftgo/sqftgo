"use client";
import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Bell, CheckCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminNotificationsPage() {
  const { notifications, setNotifications, markNotificationRead } = useApp();
  const adminNotifs = notifications.filter(n => n.forRole === "admin" || n.forRole === "all");
  const unread = adminNotifs.filter(n => !n.read).length;
  const markAll = () => setNotifications(prev => prev.map(n => (n.forRole === "admin" || n.forRole === "all") ? { ...n, read: true } : n));

  const typeColor: Record<string, string> = {
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    error: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    info: "bg-terracotta/10 text-terracotta border-terracotta/20",
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-serif font-black text-white">Notifications</h1><p className="text-white/40 text-sm font-semibold mt-1">{unread} unread</p></div>
        {unread > 0 && <button onClick={markAll} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white/60 text-xs font-bold rounded-xl transition-colors cursor-pointer"><CheckCheck className="w-4 h-4" /> Mark All Read</button>}
      </div>
      {adminNotifs.length === 0 ? (
        <div className="bg-[#1e2028] border border-white/10 rounded-2xl p-16 text-center"><Bell className="w-12 h-12 text-white/10 mx-auto mb-4" /><p className="text-white/40">No notifications.</p></div>
      ) : (
        <div className="space-y-3">
          {adminNotifs.map((notif, i) => (
            <motion.div key={notif.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              onClick={() => markNotificationRead(notif.id)}
              className={`bg-[#1e2028] border rounded-2xl p-5 cursor-pointer transition-all hover:border-white/20 ${notif.read ? "border-white/5 opacity-60" : "border-white/10"}`}>
              <div className="flex items-start gap-4">
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${!notif.read ? "bg-terracotta animate-pulse" : "bg-white/10"}`} />
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-bold text-white">{notif.title}</p>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border shrink-0 ${typeColor[notif.type]}`}>{notif.type}</span>
                  </div>
                  <p className="text-xs text-white/50 font-semibold mt-1 leading-relaxed">{notif.message}</p>
                  <p className="text-[9px] font-bold text-white/20 mt-2">{notif.date}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
