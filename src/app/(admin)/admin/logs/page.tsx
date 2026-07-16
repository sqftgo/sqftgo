"use client";
import React from "react";
import { useApp } from "@/context/AppContext";
import { ScrollText, Clock } from "lucide-react";

export default function AdminLogsPage() {
  const { activityLogs } = useApp();

  const roleColor: Record<string, string> = {
    Admin: "bg-terracotta/10 text-terracotta border-terracotta/20",
    Dealer: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    User: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    Broker: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div><h1 className="text-2xl font-serif font-black text-white">Activity Logs</h1><p className="text-white/40 text-sm font-semibold mt-1">{activityLogs.length} events recorded</p></div>

      <div className="bg-[#1e2028] border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-white/5">
              <tr>{["Timestamp", "Action", "Performed By", "Role", "Target"].map(h => (
                <th key={h} className="px-5 py-3.5 text-[9px] font-black text-white/30 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {activityLogs.map(log => (
                <tr key={log.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-white/20 shrink-0" />
                      <span className="text-[10px] text-white/40 font-semibold">{log.timestamp}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5"><span className="text-xs font-bold text-white">{log.action}</span></td>
                  <td className="px-5 py-3.5"><span className="text-xs text-white/60 font-semibold">{log.performedBy}</span></td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${roleColor[log.role] || roleColor.User}`}>{log.role}</span>
                  </td>
                  <td className="px-5 py-3.5"><span className="text-xs text-white/50 font-semibold truncate max-w-[200px] block">{log.target}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {activityLogs.length === 0 && <div className="p-10 text-center text-white/30 text-sm font-semibold">No activity logged yet.</div>}
      </div>
    </div>
  );
}
