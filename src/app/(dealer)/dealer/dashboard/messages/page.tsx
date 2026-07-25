"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { MessageSquare, Plus, Send, X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { messageService } from "@/services";
import type { ChatMessage, MessageThread, MessageThreadDetail } from "@/types";
import {
  DashboardPageHeader,
  Avatar,
  Button,
  TextInput,
  EmptyState,
  PageLoader,
} from "@/components/ui";

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `${hours}h ago`;
  return new Date(iso).toLocaleDateString("en-IN");
}

export default function DealerMessagesPage() {
  const { userEmail, sessionReady, isLoggedIn } = useApp();
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [detail, setDetail] = useState<MessageThreadDetail | null>(null);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [compose, setCompose] = useState({
    participantEmail: "",
    subject: "",
    body: "",
  });

  const refreshThreads = useCallback(async () => {
    const rows = await messageService.listThreads();
    setThreads(rows);
  }, []);

  useEffect(() => {
    if (!sessionReady || !isLoggedIn) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        await refreshThreads();
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load messages");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionReady, isLoggedIn, refreshThreads]);

  const openThread = async (id: string) => {
    setActiveId(id);
    setError(null);
    try {
      const d = await messageService.getThread(id);
      setDetail(d);
      setThreads((prev) =>
        prev.map((t) => (t.id === id ? { ...t, unread: false } : t))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to open conversation");
    }
  };

  const handleSend = async () => {
    if (!newMsg.trim() || !activeId || sending) return;
    setSending(true);
    setError(null);
    try {
      const msg = await messageService.reply(activeId, newMsg.trim());
      setDetail((prev) =>
        prev
          ? {
              ...prev,
              messages: [...prev.messages, msg],
              lastMessage: msg.body,
              lastMessageAt: msg.createdAt,
            }
          : prev
      );
      setNewMsg("");
      await refreshThreads();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send message");
    } finally {
      setSending(false);
    }
  };

  const handleCompose = async () => {
    if (sending) return;
    setSending(true);
    setError(null);
    try {
      const created = await messageService.createThread({
        participantEmail: compose.participantEmail,
        subject: compose.subject,
        body: compose.body,
        kind: "direct",
      });
      setComposeOpen(false);
      setCompose({ participantEmail: "", subject: "", body: "" });
      await refreshThreads();
      await openThread(created.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start conversation");
    } finally {
      setSending(false);
    }
  };

  const counterpartName = useMemo(() => {
    if (!detail) return "";
    const other = detail.participants.find(
      (p) => p.email.toLowerCase() !== userEmail.toLowerCase()
    );
    return other?.name ?? detail.subject;
  }, [detail, userEmail]);

  if (!sessionReady || loading) {
    return <PageLoader label="Loading messages..." />;
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto text-charcoal h-[calc(100vh-120px)] flex flex-col">
      <DashboardPageHeader
        title="Messages Inbox"
        description="Direct conversations with buyers and partners"
        className="rounded-3xl shrink-0"
        actions={
          <Button variant="secondary" size="sm" onClick={() => setComposeOpen(true)}>
            <Plus className="w-4 h-4" /> Compose
          </Button>
        }
      />

      {error ? (
        <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
          {error}
        </p>
      ) : null}

      <div className="bg-white/80 border border-indigo/10 rounded-3xl overflow-hidden flex flex-1 shadow-sm min-h-0">
        <div className="w-72 border-r border-indigo/5 flex flex-col shrink-0">
          <div className="p-4 border-b border-indigo/5 bg-white/40">
            <p className="text-[10px] font-black text-charcoal/40 uppercase tracking-widest">
              Conversations
            </p>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {threads.length === 0 ? (
              <p className="p-4 text-xs text-charcoal/40 font-semibold">
                No conversations yet. Compose to start one.
              </p>
            ) : (
              threads.map((t) => {
                const other =
                  t.participants.find(
                    (p) => p.email.toLowerCase() !== userEmail.toLowerCase()
                  ) ?? t.participants[0];
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      void openThread(t.id);
                    }}
                    className={`w-full flex items-center gap-3 p-4 text-left border-b border-indigo/5 hover:bg-indigo/5 transition-colors cursor-pointer ${
                      activeId === t.id ? "bg-indigo/5" : ""
                    }`}
                  >
                    <Avatar name={other?.name ?? t.subject} size="md" shape="rounded" tone="indigo" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className="text-xs font-bold text-charcoal truncate">
                          {other?.name ?? t.subject}
                        </p>
                        <p className="text-[9px] text-charcoal/30 font-semibold">
                          {relativeTime(t.lastMessageAt)}
                        </p>
                      </div>
                      <p className="text-[10px] text-charcoal/50 font-semibold truncate mt-0.5">
                        {t.lastMessage || t.subject}
                      </p>
                    </div>
                    {t.unread && (
                      <div className="w-2.5 h-2.5 bg-terracotta rounded-full shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-sand/10 min-w-0">
          {detail && activeId ? (
            <>
              <div className="p-4 border-b border-indigo/5 bg-white/60">
                <p className="text-sm font-bold text-charcoal">{counterpartName}</p>
                <p className="text-[10px] text-charcoal/40 font-semibold mt-0.5">
                  {detail.subject}
                </p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {detail.messages.map((m: ChatMessage) => {
                  const isMe =
                    detail.participants.find((p) => p.id === m.senderId)?.email.toLowerCase() ===
                    userEmail.toLowerCase();
                  return (
                    <div
                      key={m.id}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2.5 rounded-2xl text-xs font-bold ${
                          isMe
                            ? "bg-indigo text-white shadow-sm"
                            : "bg-white border border-indigo/10 text-charcoal"
                        }`}
                      >
                        {m.body}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="p-4 border-t border-indigo/5 bg-white flex gap-3">
                <TextInput
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handleSend();
                  }}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    void handleSend();
                  }}
                  disabled={sending}
                  aria-label="Send"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6">
              <EmptyState
                title="No conversation selected"
                description="Select a buyer from the list or compose a new message"
                icon={<MessageSquare className="w-8 h-8 text-indigo/40" />}
              />
            </div>
          )}
        </div>
      </div>

      {composeOpen ? (
        <div className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-indigo/10 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-black text-lg text-indigo">New Conversation</h3>
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
              placeholder="Recipient email (must have a SqftGo account)"
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
              placeholder="First message..."
              className="w-full border border-sand rounded-xl px-3 py-2 text-sm font-medium"
            />
            <Button
              variant="secondary"
              size="md"
              className="w-full"
              disabled={sending}
              onClick={() => {
                void handleCompose();
              }}
            >
              Start Conversation
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
