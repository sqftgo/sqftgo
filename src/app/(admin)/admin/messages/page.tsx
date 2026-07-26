"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Archive,
  CheckCircle2,
  MessageSquare,
  Plus,
  Search,
  Send,
  X,
} from "lucide-react";
import { messageService } from "@/services";
import type { MessageThread, MessageThreadDetail } from "@/types";
import {
  DashboardPageHeader,
  Avatar,
  Badge,
  Button,
  TextInput,
  PageLoader,
  EmptyState,
  Alert,
} from "@/components/ui";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/cn";

type StatusFilter = "all" | "open" | "resolved";

export default function AdminMessagesPage() {
  const { sessionReady, isLoggedIn } = useApp();
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<MessageThreadDetail | null>(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [composeOpen, setComposeOpen] = useState(false);
  const [compose, setCompose] = useState({
    participantEmail: "",
    subject: "",
    body: "",
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    const rows = await messageService.listThreads({ kind: "support" });
    const all = await messageService.listThreads();
    const byId = new Map<string, MessageThread>();
    for (const t of [...rows, ...all]) byId.set(t.id, t);
    const sorted = [...byId.values()].sort((a, b) =>
      b.lastMessageAt.localeCompare(a.lastMessageAt)
    );
    setThreads(sorted);
    return sorted;
  }, []);

  useEffect(() => {
    if (!sessionReady || !isLoggedIn) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const sorted = await refresh();
        if (!cancelled && sorted.length > 0) {
          setSelectedId((prev) => prev ?? sorted[0].id);
        }
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

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setDetailLoading(true);
        const d = await messageService.getThread(selectedId);
        if (!cancelled) setDetail(d);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load conversation");
        }
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [detail?.messages.length]);

  const filteredThreads = useMemo(() => {
    const q = search.trim().toLowerCase();
    return threads.filter((t) => {
      const isResolved = t.status === "resolved" || t.status === "archived";
      if (statusFilter === "open" && isResolved) return false;
      if (statusFilter === "resolved" && !isResolved) return false;
      if (!q) return true;
      const other = t.participants.find((p) => p.role !== "admin") ?? t.participants[0];
      return (
        t.subject.toLowerCase().includes(q) ||
        t.lastMessage.toLowerCase().includes(q) ||
        (other?.name ?? "").toLowerCase().includes(q) ||
        (other?.email ?? "").toLowerCase().includes(q)
      );
    });
  }, [threads, search, statusFilter]);

  const selectedThread = threads.find((t) => t.id === selectedId) ?? null;
  const openCount = threads.filter((t) => t.status === "open").length;

  const handleReply = async (resolve: boolean) => {
    if (!selectedId || !reply.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      await messageService.reply(selectedId, reply.trim());
      if (resolve) {
        await messageService.updateThread(selectedId, { status: "resolved" });
      }
      setReply("");
      await refresh();
      const d = await messageService.getThread(selectedId);
      setDetail(d);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reply");
    } finally {
      setBusy(false);
    }
  };

  const handleResolveOnly = async () => {
    if (!selectedId || busy) return;
    setBusy(true);
    setError(null);
    try {
      await messageService.updateThread(selectedId, { status: "resolved" });
      await refresh();
      const d = await messageService.getThread(selectedId);
      setDetail(d);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to resolve thread");
    } finally {
      setBusy(false);
    }
  };

  const handleCompose = async () => {
    if (!compose.participantEmail.trim() || !compose.subject.trim() || !compose.body.trim()) {
      setError("Email, subject, and message are required");
      return;
    }
    setBusy(true);
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
      setSelectedId(created.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create ticket");
    } finally {
      setBusy(false);
    }
  };

  if (!sessionReady || loading) {
    return <PageLoader label="Loading support messages..." />;
  }

  const otherParticipant =
    selectedThread?.participants.find((p) => p.role !== "admin") ??
    selectedThread?.participants[0];
  const isResolved =
    selectedThread?.status === "resolved" || selectedThread?.status === "archived";

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full">
      <DashboardPageHeader
        title="Messages"
        description={`${openCount} open support conversation${openCount === 1 ? "" : "s"}`}
        actions={
          <Button variant="primary" size="sm" onClick={() => setComposeOpen(true)}>
            <Plus className="w-4 h-4" /> New Ticket
          </Button>
        }
      />

      {error ? (
        <Alert variant="danger" title={error} onDismiss={() => setError(null)} />
      ) : null}

      <div className="bg-white border border-indigo/10 rounded-2xl shadow-sm overflow-hidden min-h-[560px] h-[calc(100vh-14rem)] flex flex-col lg:flex-row">
        {/* Thread list */}
        <aside className="w-full lg:w-80 xl:w-96 border-b lg:border-b-0 lg:border-r border-indigo/10 flex flex-col shrink-0 max-h-[40vh] lg:max-h-none">
          <div className="p-4 border-b border-indigo/5 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-charcoal/35 pointer-events-none" />
              <TextInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations…"
                className="pl-9 py-2 text-xs"
                aria-label="Search conversations"
              />
            </div>
            <div className="flex gap-1.5">
              {(
                [
                  ["all", "All"],
                  ["open", "Open"],
                  ["resolved", "Resolved"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatusFilter(value)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer",
                    statusFilter === value
                      ? "bg-terracotta text-white"
                      : "bg-indigo/5 text-charcoal/50 hover:bg-indigo/10"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredThreads.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  icon={<MessageSquare className="w-5 h-5" />}
                  title="No conversations"
                  description="No support threads match your filters."
                />
              </div>
            ) : (
              filteredThreads.map((msg) => {
                const other =
                  msg.participants.find((p) => p.role !== "admin") ?? msg.participants[0];
                const resolved = msg.status === "resolved" || msg.status === "archived";
                const active = msg.id === selectedId;
                return (
                  <button
                    key={msg.id}
                    type="button"
                    onClick={() => setSelectedId(msg.id)}
                    className={cn(
                      "w-full text-left px-4 py-3.5 border-b border-indigo/5 transition-colors cursor-pointer",
                      active ? "bg-terracotta/8 border-l-2 border-l-terracotta" : "hover:bg-sand/40 border-l-2 border-l-transparent"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar
                        name={other?.name ?? msg.subject}
                        size="sm"
                        tone="indigo"
                        className="shrink-0 mt-0.5"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold text-charcoal truncate">
                            {other?.name ?? "Participant"}
                          </p>
                          <span className="text-[9px] text-charcoal/35 font-semibold shrink-0">
                            {new Date(msg.lastMessageAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </div>
                        <p className="text-[10px] font-black text-charcoal/45 uppercase tracking-wide truncate mt-0.5">
                          {msg.subject}
                        </p>
                        <p className="text-[11px] text-charcoal/50 font-semibold truncate mt-1">
                          {msg.lastMessage}
                        </p>
                        <div className="mt-2">
                          <Badge status={resolved ? "active" : "pending"} size="sm">
                            {resolved ? "Resolved" : "Open"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Conversation pane */}
        <section className="flex-1 flex flex-col min-w-0 min-h-0 bg-cream/30">
          {!selectedThread ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <EmptyState
                icon={<MessageSquare className="w-5 h-5" />}
                title="Select a conversation"
                description="Choose a support thread from the list to view and reply."
              />
            </div>
          ) : (
            <>
              <div className="px-4 sm:px-5 py-4 border-b border-indigo/10 bg-white flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar
                    name={otherParticipant?.name ?? selectedThread.subject}
                    size="md"
                    tone="indigo"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-charcoal truncate">
                      {otherParticipant?.name ?? "Participant"}
                    </p>
                    <p className="text-[10px] text-charcoal/40 font-semibold truncate">
                      {otherParticipant?.email ?? ""} · {selectedThread.subject}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge status={isResolved ? "active" : "pending"} size="sm">
                    {isResolved ? "Resolved" : "Open"}
                  </Badge>
                  {!isResolved ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={busy}
                      onClick={() => void handleResolveOnly()}
                      className="hidden sm:inline-flex"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Resolve
                    </Button>
                  ) : (
                    <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-charcoal/40 uppercase tracking-wider">
                      <Archive className="w-3 h-3" /> Closed
                    </span>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
                {detailLoading && !detail ? (
                  <PageLoader label="Loading thread…" />
                ) : (
                  (detail?.messages ?? []).map((m) => {
                    const sender = detail?.participants.find((p) => p.id === m.senderId);
                    const isAdmin = sender?.role === "admin";
                    return (
                      <div
                        key={m.id}
                        className={cn(
                          "flex",
                          isAdmin ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 shadow-sm",
                            isAdmin
                              ? "bg-terracotta text-white rounded-br-md"
                              : "bg-white border border-indigo/10 text-charcoal rounded-bl-md"
                          )}
                        >
                          <p
                            className={cn(
                              "text-[9px] font-black uppercase tracking-wider mb-1",
                              isAdmin ? "text-white/70" : "text-charcoal/40"
                            )}
                          >
                            {m.senderName}
                          </p>
                          <p className="text-sm font-semibold leading-relaxed whitespace-pre-wrap">
                            {m.body}
                          </p>
                          <p
                            className={cn(
                              "text-[9px] font-semibold mt-2",
                              isAdmin ? "text-white/55" : "text-charcoal/30"
                            )}
                          >
                            {new Date(m.createdAt).toLocaleString("en-IN", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {!isResolved ? (
                <div className="p-4 border-t border-indigo/10 bg-white shrink-0">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <TextInput
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          void handleReply(false);
                        }
                      }}
                      placeholder="Type your reply…"
                      className="flex-1"
                      aria-label="Reply message"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={busy || !reply.trim()}
                        onClick={() => void handleReply(false)}
                      >
                        <Send className="w-3.5 h-3.5" /> Send
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={busy || !reply.trim()}
                        onClick={() => void handleReply(true)}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Send & Resolve
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="px-5 py-3 border-t border-indigo/10 bg-sand/30 text-[11px] font-semibold text-charcoal/45 shrink-0">
                  This conversation is resolved. Open a new ticket to continue the discussion.
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {composeOpen ? (
        <div className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-indigo/10 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-black text-lg text-indigo">New Support Ticket</h3>
              <button
                type="button"
                onClick={() => setComposeOpen(false)}
                className="p-1.5 rounded-full hover:bg-sand/40 cursor-pointer"
                aria-label="Close"
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
              className="w-full border border-indigo/10 rounded-xl px-3 py-2 text-sm font-medium bg-cream/40 focus:outline-none focus:ring-2 focus:ring-terracotta/30"
            />
            <Button
              variant="primary"
              size="md"
              className="w-full"
              disabled={busy}
              onClick={() => void handleCompose()}
            >
              Create Ticket
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
