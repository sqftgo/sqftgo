"use client";
import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { MessageSquare, Send } from "lucide-react";

const MOCK_SUPPORT = [
  { id: 1, name: "Rahul Verma", email: "rahul@gmail.com", subject: "Property listing issue", message: "I submitted a property 3 days ago and it's still pending. Can you help?", date: "2026-07-15", resolved: false },
  { id: 2, name: "Priya Sharma", email: "priya@hotmail.com", subject: "Login problem", message: "Unable to login to my dealer account. Password reset isn't working.", date: "2026-07-14", resolved: false },
  { id: 3, name: "Amit Patel", email: "amit@company.in", subject: "Payment query", message: "My subscription payment was deducted but plan wasn't upgraded.", date: "2026-07-13", resolved: true },
];

export default function AdminMessagesPage() {
  const [resolved, setResolved] = useState<number[]>([3]);
  const [reply, setReply] = useState<Record<number, string>>({});

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div><h1 className="text-2xl font-serif font-black text-white">Support Messages</h1><p className="text-white/40 text-sm font-semibold mt-1">{MOCK_SUPPORT.filter(m => !resolved.includes(m.id)).length} open tickets</p></div>
      <div className="space-y-4">
        {MOCK_SUPPORT.map(msg => (
          <div key={msg.id} className={`bg-[#1e2028] border rounded-2xl p-5 ${resolved.includes(msg.id) ? "border-white/5 opacity-60" : "border-white/10"}`}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo/20 flex items-center justify-center text-indigo font-black text-sm shrink-0">{msg.name.charAt(0)}</div>
                <div>
                  <p className="text-sm font-bold text-white">{msg.name}</p>
                  <p className="text-[10px] text-white/40 font-semibold">{msg.email} · {msg.date}</p>
                </div>
              </div>
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${resolved.includes(msg.id) ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}>
                {resolved.includes(msg.id) ? "Resolved" : "Open"}
              </span>
            </div>
            <div className="bg-white/5 rounded-xl p-4 mb-4">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-wider mb-1">{msg.subject}</p>
              <p className="text-sm text-white/70 font-semibold">"{msg.message}"</p>
            </div>
            {!resolved.includes(msg.id) && (
              <div className="flex gap-3">
                <input value={reply[msg.id] || ""} onChange={e => setReply(r => ({ ...r, [msg.id]: e.target.value }))} placeholder="Type your reply..." className="flex-1 bg-white/5 border border-white/10 text-white placeholder-white/30 text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-indigo/50" />
                <button onClick={() => setResolved(r => [...r, msg.id])} className="flex items-center gap-2 px-4 py-2 bg-indigo hover:bg-indigo-hover text-white text-xs font-black rounded-xl transition-colors cursor-pointer">
                  <Send className="w-3 h-3" /> Reply & Resolve
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
