"use client";

import React, { useState } from "react";
import { MessageSquare, Send } from "lucide-react";

const MOCK_THREADS = [
  { id: 1, name: "Suresh Mehta", avatar: "S", message: "Is the property still available?", time: "2h ago", unread: true },
  { id: 2, name: "Aishwarya Rao", avatar: "A", message: "Can we schedule a site visit?", time: "1d ago", unread: false },
  { id: 3, name: "Ramesh Kumar", avatar: "R", message: "What is the maintenance charge?", time: "2d ago", unread: false },
];

export default function DealerMessagesPage() {
  const [active, setActive] = useState<number | null>(null);
  const [newMsg, setNewMsg] = useState("");
  const [chats, setChats] = useState<Record<number, { from: "me" | "them", text: string }[]>>({
    1: [{ from: "them", text: "Is the property still available?" }, { from: "me", text: "Yes! Which property are you inquiring about?" }],
    2: [{ from: "them", text: "Can we schedule a site visit?" }],
    3: [{ from: "them", text: "What is the maintenance charge?" }],
  });

  const handleSend = () => {
    if (!newMsg.trim() || active === null) return;
    setChats(prev => ({ ...prev, [active]: [...(prev[active] || []), { from: "me", text: newMsg }] }));
    setNewMsg("");
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto text-charcoal h-[calc(100vh-120px)] flex flex-col">
      <div className="bg-white/60 border border-indigo/10 rounded-3xl p-6 shadow-sm flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-serif font-black text-charcoal">Messages Inbox</h1>
          <p className="text-charcoal/50 text-xs font-semibold mt-1">Direct inquiries and chats from interested buyers</p>
        </div>
      </div>

      <div className="bg-white/80 border border-indigo/10 rounded-3xl overflow-hidden flex flex-1 shadow-sm min-h-0">
        {/* Thread List */}
        <div className="w-72 border-r border-indigo/5 flex flex-col shrink-0">
          <div className="p-4 border-b border-indigo/5 bg-white/40">
            <p className="text-[10px] font-black text-charcoal/40 uppercase tracking-widest">Conversations</p>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {MOCK_THREADS.map(t => (
              <button key={t.id} onClick={() => setActive(t.id)}
                className={`w-full flex items-center gap-3 p-4 text-left border-b border-indigo/5 hover:bg-indigo/5 transition-colors cursor-pointer ${active === t.id ? "bg-indigo/5" : ""}`}>
                <div className="w-10 h-10 rounded-2xl bg-indigo/10 border border-indigo/25 flex items-center justify-center text-indigo font-serif font-black text-sm shrink-0">{t.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-bold text-charcoal">{t.name}</p>
                    <p className="text-[9px] text-charcoal/30 font-semibold">{t.time}</p>
                  </div>
                  <p className="text-[10px] text-charcoal/50 font-semibold truncate mt-0.5">{t.message}</p>
                </div>
                {t.unread && <div className="w-2.5 h-2.5 bg-terracotta rounded-full shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-sand/10 min-w-0">
          {active ? (
            <>
              <div className="p-4 border-b border-indigo/5 bg-white/60">
                <p className="text-sm font-bold text-charcoal">{MOCK_THREADS.find(t => t.id === active)?.name}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {(chats[active] || []).map((m, i) => (
                  <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-xs font-bold ${
                      m.from === "me" ? "bg-indigo text-white shadow-sm" : "bg-white border border-indigo/10 text-charcoal"
                    }`}>
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-indigo/5 bg-white flex gap-3">
                <input
                  value={newMsg}
                  onChange={e => setNewMsg(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1 bg-sand/35 border border-indigo/10 text-charcoal placeholder-charcoal/30 text-xs font-semibold px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo/40"
                />
                <button onClick={handleSend} className="p-2.5 bg-indigo hover:bg-indigo-hover text-white rounded-xl transition-all cursor-pointer shadow-md shadow-indigo/15">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-indigo/20 mx-auto mb-3" />
                <p className="text-charcoal/40 font-semibold text-sm">Select a buyer from the list to view chat logs</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
