"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Plus, Send, X } from "lucide-react";
import { messageService } from "@/services";
import type { MessageThread, MessageThreadDetail } from "@/types";
import {
  DashboardPageHeader,
  Avatar,
  Badge,
  Button,
  TextInput,
  PageLoader,
} from "@/components/ui";
import { useApp } from "@/context/AppContext";

export default function AdminMessagesPage() {
  const { sessionReady, isLoggedIn } = useApp();
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [details, setDetails] = useState<Record<string, MessageThreadDetail>>({});
  const [reply, setReply] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [compose, setCompose] = useState({
    participantEmail: "",
    subject: "",
    body: "",
  });

  const refresh = useCallback(async () => {
    const rows = await messageService.listThreads({ kind: "support" });
    // Also include any open threads admin participates in.
    const all = await messageService.listThreads();
    const byId = new Map<string, MessageThread>();
    for (const t of [...rows, ...all]) byId.set(t.id, t);
    setThreads([...byId.values()].sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt)));
  }, []);

  useEffect(() => {
    if (!sessionReady || !isLoggedIn) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        await refresh();
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load support messages");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionReady, isLoggedIn, refresh]);

  const ensureDetail = async (id: string) => {
    if (details[id]) return details[id];
    const d = await messageService.getThread(id);
    setDetails((prev) => ({ ...prev, [id]: d }));
    return d;
  };

  const handleReplyResolve = async (id: string) => {
    const text = (reply[id] || "").trim();
    if (!text || busyId) return;
    setBusyId(id);
    setError(null);
    try {
      await ensureDetail(id);
      await messageService.reply(id, text);
      await messageService.updateThread(id, { status: "resolved" });
      setReply((r) => ({ ...r, [id]: "" }));
      await refresh();
      const d = await messageService.getThread(id);
      setDetails((prev) => ({ ...prev, [id]: d }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reply");
    } finally {
      setBusyId(null);
    }
  };

  const handleCompose = async () => {
    setBusyId("compose");
    setError(null);
    try {
      const created = await messageService.createThread({
        participantEmail: compose.participantEmail,
        subject: compose.subject,
        body: compose.body,
        kind: "support",
      });
      setComposeOpen(false);
      setCompose({ participantEmail: "", subject: "", body: "" });
      await refresh();
      const d = await messageService.getThread(created.id);
      setDetails((prev) => ({ ...prev, [created.id]: d }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create ticket");
    } finally {
      setBusyId(null);
    }
  };

  if (!sessionReady || loading) {
    return <PageLoader label="Loading support messages..." />;
  }

  const openCount = threads.filter((t) => t.status === "open").length;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <DashboardPageHeader
        title="Support Messages"
        description={`${openCount} open tickets`}
        actions={
          <Button variant="primary" size="sm" onClick={() => setComposeOpen(true)}>
            <Plus className="w-4 h-4" /> New Ticket
          </Button>
        }
      />

      {error ? (
        <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
          {error}
        </p>
      ) : null}

      <div className="space-y-4">
        {threads.length === 0 ? (
          <p className="text-sm text-charcoal/50 font-semibold">No support threads yet.</p>
        ) : (
          threads.map((msg) => {
            const other = msg.participants.find((p) => p.role !== "admin") ?? msg.participants[0];
            const isResolved = msg.status === "resolved" || msg.status === "archived";
            const threadMessages = details[msg.id]?.messages;
            return (
              <div
                key={msg.id}
                className={`bg-white/80 border rounded-2xl p-5 shadow-sm transition-all ${
                  isResolved ? "border-indigo/5 opacity-60" : "border-indigo/10"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={other?.name ?? msg.subject} size="md" tone="indigo" />
                    <div>
                      <p className="text-sm font-bold text-charcoal">{other?.name ?? "Participant"}</p>
                      <p className="text-[10px] text-charcoal/40 font-semibold">
                        {other?.email ?? ""} · {new Date(msg.lastMessageAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  </div>
                  <Badge status={isResolved ? "active" : "pending"} size="sm">
                    {isResolved ? "Resolved" : "Open"}
                  </Badge>
                </div>
                <div className="bg-indigo/5 rounded-xl p-4 mb-4">
                  <p className="text-[10px] font-black text-charcoal/40 uppercase tracking-widest mb-1">
                    {msg.subject}
                  </p>
                  <p className="text-sm text-charcoal/70 font-semibold">
                    &ldquo;{msg.lastMessage}&rdquo;
                  </p>
                  {threadMessages && threadMessages.length > 1 ? (
                    <div className="mt-3 space-y-2 border-t border-indigo/10 pt-3">
                      {threadMessages.slice(-4).map((m) => (
                        <p key={m.id} className="text-[11px] text-charcoal/60">
                          <span className="font-bold">{m.senderName}:</span> {m.body}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="mt-2 text-[10px] font-black uppercase tracking-wider text-indigo"
                      onClick={() => {
                        void ensureDetail(msg.id);
                      }}
                    >
                      Load thread
                    </button>
                  )}
                </div>
                {!isResolved && (
                  <div className="flex gap-3">
                    <TextInput
                      value={reply[msg.id] || ""}
                      onChange={(e) => setReply((r) => ({ ...r, [msg.id]: e.target.value }))}
                      placeholder="Type your reply..."
                      className="flex-1"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={busyId === msg.id}
                      onClick={() => {
                        void handleReplyResolve(msg.id);
                      }}
                    >
                      <Send className="w-3 h-3" /> Reply & Resolve
                    </Button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {composeOpen ? (
        <div className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-indigo/10 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-black text-lg text-indigo">New Support Ticket</h3>
              <button
                type="button"
                onClick={() => setComposeOpen(false)}
                className="p-1.5 rounded-full hover:bg-sand/40"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <TextInput
              value={compose.participantEmail}
              onChange={(e) => setCompose({ ...compose, participantEmail: e.target.value })}
              placeholder="User/broker email"
            />
            <TextInput
              value={compose.subject}
              onChange={(e) => setCompose({ ...compose, subject: e.target.value })}
              placeholder="Subject"
            />
            <textarea
              value={compose.body}
              onChange={(e) => setCompose({ ...compose, body: e.target.value })}
              rows={4}
              placeholder="Message..."
              className="w-full border border-sand rounded-xl px-3 py-2 text-sm font-medium"
            />
            <Button
              variant="secondary"
              size="md"
              className="w-full"
              disabled={busyId === "compose"}
              onClick={() => {
                void handleCompose();
              }}
            >
              Create Ticket
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
