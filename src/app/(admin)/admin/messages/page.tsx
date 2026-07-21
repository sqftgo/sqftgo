"use client";
import React, { useState } from "react";
import { Send } from "lucide-react";
import {
  DashboardPageHeader,
  Avatar,
  Badge,
  Button,
  TextInput,
} from "@/components/ui";

const MOCK_SUPPORT = [
  { id: 1, name: "Rahul Verma", email: "rahul@gmail.com", subject: "Property listing issue", message: "I submitted a property 3 days ago and it's still pending. Can you help?", date: "2026-07-15", resolved: false },
  { id: 2, name: "Priya Sharma", email: "priya@hotmail.com", subject: "Login problem", message: "Unable to login to my dealer account. Password reset isn't working.", date: "2026-07-14", resolved: false },
  { id: 3, name: "Amit Patel", email: "amit@company.in", subject: "Payment query", message: "My subscription payment was deducted but plan wasn't upgraded.", date: "2026-07-13", resolved: true },
];

export default function AdminMessagesPage() {
  const [resolved, setResolved] = useState<number[]>([3]);
  const [reply, setReply] = useState<Record<number, string>>({});

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <DashboardPageHeader
        title="Support Messages"
        description={`${MOCK_SUPPORT.filter(m => !resolved.includes(m.id)).length} open tickets`}
      />
      <div className="space-y-4">
        {MOCK_SUPPORT.map(msg => (
          <div key={msg.id} className={`bg-white/80 border rounded-2xl p-5 shadow-sm transition-all ${resolved.includes(msg.id) ? "border-indigo/5 opacity-60" : "border-indigo/10"}`}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <Avatar name={msg.name} size="md" tone="indigo" />
                <div>
                  <p className="text-sm font-bold text-charcoal">{msg.name}</p>
                  <p className="text-[10px] text-charcoal/40 font-semibold">{msg.email} · {msg.date}</p>
                </div>
              </div>
              <Badge
                status={resolved.includes(msg.id) ? "active" : "pending"}
                size="sm"
              >
                {resolved.includes(msg.id) ? "Resolved" : "Open"}
              </Badge>
            </div>
            <div className="bg-indigo/5 rounded-xl p-4 mb-4">
              <p className="text-[10px] font-black text-charcoal/40 uppercase tracking-widest mb-1">{msg.subject}</p>
              <p className="text-sm text-charcoal/70 font-semibold">&ldquo;{msg.message}&rdquo;</p>
            </div>
            {!resolved.includes(msg.id) && (
              <div className="flex gap-3">
                <TextInput
                  value={reply[msg.id] || ""}
                  onChange={e => setReply(r => ({ ...r, [msg.id]: e.target.value }))}
                  placeholder="Type your reply..."
                  className="flex-1"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setResolved(r => [...r, msg.id])}
                >
                  <Send className="w-3 h-3" /> Reply & Resolve
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
