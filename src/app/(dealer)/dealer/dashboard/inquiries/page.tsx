"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Send,
  Trash2,
  MessageSquare,
  CheckCircle2,
  Phone,
  Mail,
  MoreVertical,
  Plus,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { inquiryService, messageService } from "@/services";
import { usePropertiesQuery } from "@/hooks";
import type { ChatMessage, MessageThread, MessageThreadDetail } from "@/types";
import {
  DropdownMenu,
  DashboardPageHeader,
  SearchInput,
  Avatar,
  ConfirmDialog,
  Dialog,
  Button,
  TextArea,
  TextInput,
  EmptyState,
  PageLoader,
} from "@/components/ui";
import { cn } from "@/lib/cn";

type CommTab = "inquiries" | "messages";

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `${hours}h ago`;
  return new Date(iso).toLocaleDateString("en-IN");
}

function InquiriesPanel() {
  const { inquiries, refreshInquiries } = useApp();
  const mineQuery = usePropertiesQuery({ mine: true, limit: 100 });
  const [search, setSearch] = useState("");
  const [replyModal, setReplyModal] = useState<{
    id: string;
    name: string;
    email: string;
    propertyId: string;
    propertyTitle: string;
  } | null>(null);
  const [replyMsg, setReplyMsg] = useState("");
  const [replySent, setReplySent] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [pendingDismiss, setPendingDismiss] = useState<{ inquiryId: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const propertyMeta = useMemo(() => {
    const titles = new Map<string, string>();
    const images = new Map<string, string | undefined>();
    for (const p of mineQuery.data?.items ?? []) {
      titles.set(p.id, p.title);
      images.set(p.id, p.images?.[0]);
    }
    return { titles, images };
  }, [mineQuery.data?.items]);

  const allInquiries = useMemo(() => {
    return Object.entries(inquiries)
      .flatMap(([propertyId, rows]) =>
        rows.map((inq) => ({
          ...inq,
          propertyId,
          propertyTitle: propertyMeta.titles.get(propertyId) ?? "Property",
          propertyImage: propertyMeta.images.get(propertyId),
        }))
      )
      .filter((inq) => inq.status !== "archived")
      .filter(
        (inq) =>
          !search ||
          inq.name.toLowerCase().includes(search.toLowerCase()) ||
          inq.propertyTitle.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [inquiries, propertyMeta, search]);

  const closeReply = () => {
    setReplyModal(null);
    setReplySent(false);
    setReplyMsg("");
    setReplyError(null);
  };

  const handleReply = async () => {
    if (!replyModal?.id || !replyMsg.trim() || busy) return;
    setBusy(true);
    setReplyError(null);
    try {
      await messageService.createThread({
        subject: `Re: ${replyModal.propertyTitle}`,
        participantEmail: replyModal.email,
        body: replyMsg.trim(),
        kind: "direct",
        propertyId: replyModal.propertyId,
      });
      await inquiryService.updateStatus(replyModal.id, "read");
      await refreshInquiries();
      setReplySent(true);
      window.setTimeout(() => {
        closeReply();
      }, 1500);
    } catch (err) {
      setReplyError(err instanceof Error ? err.message : "Unable to send reply");
    } finally {
      setBusy(false);
    }
  };

  const markAsRead = async (inquiryId: string) => {
    if (busy) return;
    setBusy(true);
    try {
      await inquiryService.updateStatus(inquiryId, "read");
      await refreshInquiries();
    } finally {
      setBusy(false);
    }
  };

  const confirmDismiss = async () => {
    if (!pendingDismiss?.inquiryId || busy) return;
    setBusy(true);
    try {
      await inquiryService.updateStatus(pendingDismiss.inquiryId, "archived");
      await refreshInquiries();
      setPendingDismiss(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search inquiries..."
          accent="indigo"
          containerClassName="w-full sm:w-64 flex-none min-w-0"
        />
      </div>

      {allInquiries.length === 0 ? (
        <div className="bg-white/80 border border-indigo/10 rounded-3xl p-16 text-center shadow-sm">
          <MessageSquare className="w-12 h-12 text-indigo/20 mx-auto mb-4" />
          <p className="text-charcoal/50 font-semibold text-sm">
            No inquiries yet. They will appear here when buyers contact you.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {allInquiries.map((inq, i) => (
            <motion.div
              key={inq.id ?? `${inq.propertyId}-${inq.email}-${inq.date}-${i}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white/80 border border-indigo/10 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow relative flex flex-col md:flex-row gap-5 items-start md:items-center justify-between"
            >
              <div className="flex gap-4 items-start md:items-center flex-1 min-w-0">
                <div className="relative shrink-0">
                  <Avatar name={inq.name} size="lg" shape="rounded" tone="indigo" />
                  {(!inq.status || inq.status === "new") && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-terracotta rounded-full border-2 border-white animate-pulse" />
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="text-xs font-black text-charcoal">{inq.name}</span>
                    <span className="text-[9px] text-charcoal/40 font-bold uppercase tracking-wider">
                      {inq.date}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[9px] font-black text-indigo uppercase tracking-wider">
                    <span>Re: {inq.propertyTitle}</span>
                  </div>

                  <p className="text-xs text-charcoal/70 font-semibold leading-relaxed line-clamp-1">
                    &ldquo;{inq.message}&rdquo;
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto justify-end border-t md:border-t-0 border-indigo/5 pt-3 md:pt-0 shrink-0">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setReplyModal({
                      id: inq.id!,
                      name: inq.name,
                      email: inq.email,
                      propertyId: inq.propertyId,
                      propertyTitle: inq.propertyTitle,
                    })
                  }
                  className="uppercase tracking-wider"
                  disabled={!inq.id}
                >
                  <Send className="w-3.5 h-3.5" />
                  Reply
                </Button>
                <DropdownMenu
                  accent="indigo"
                  align="right"
                  trigger={
                    <button
                      type="button"
                      className="p-2 hover:bg-indigo/5 text-charcoal/40 hover:text-indigo rounded-xl transition-all cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  }
                  items={[
                    { id: "call", label: `Call: ${inq.phone}`, href: `tel:${inq.phone}`, icon: Phone },
                    { id: "email", label: `Email: ${inq.email}`, href: `mailto:${inq.email}`, icon: Mail },
                    {
                      id: "read",
                      label: "Mark as read",
                      onClick: () => inq.id && void markAsRead(inq.id),
                      icon: CheckCircle2,
                      disabled: inq.status === "read" || inq.status === "archived",
                      dividerBefore: true,
                    },
                    {
                      id: "dismiss",
                      label: "Archive Inquiry",
                      onClick: () => inq.id && setPendingDismiss({ inquiryId: inq.id }),
                      icon: Trash2,
                      variant: "danger",
                    },
                  ]}
                />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog
        open={Boolean(replyModal)}
        onClose={closeReply}
        title={replyModal ? `Reply to ${replyModal.name}` : "Reply"}
        description={replyModal ? `Re: ${replyModal.propertyTitle}` : undefined}
        className="max-w-lg"
        footer={
          replySent ? undefined : (
            <>
              <Button variant="ghost" size="sm" onClick={closeReply}>
                Cancel
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => void handleReply()}
                disabled={!replyMsg || busy}
                className="uppercase tracking-wider"
              >
                <Send className="w-3.5 h-3.5" />
                Send Reply
              </Button>
            </>
          )
        }
      >
        {replySent ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <p className="text-emerald-700 font-bold text-sm">
              Reply sent! Marking inquiry as resolved...
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {replyError ? (
              <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                {replyError}
              </p>
            ) : null}
            <TextArea
              value={replyMsg}
              onChange={(e) => setReplyMsg(e.target.value)}
              rows={5}
              placeholder={`Dear ${replyModal?.name},\n\nThank you for your interest...`}
            />
          </div>
        )}
      </Dialog>

      <ConfirmDialog
        open={Boolean(pendingDismiss)}
        onClose={() => setPendingDismiss(null)}
        onConfirm={() => void confirmDismiss()}
        title="Archive inquiry?"
        description="Archive this inquiry? It will be hidden from your inbox."
        confirmLabel="Archive"
        tone="danger"
      />
    </div>
  );
}

function MessagesPanel() {
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
    <div className="space-y-4 flex flex-col min-h-[calc(100vh-220px)]">
      <div className="flex justify-end shrink-0">
        <Button variant="secondary" size="sm" onClick={() => setComposeOpen(true)}>
          <Plus className="w-4 h-4" /> Compose
        </Button>
      </div>

      {error ? (
        <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 shrink-0">
          {error}
        </p>
      ) : null}

      <div className="bg-white/80 border border-indigo/10 rounded-3xl overflow-hidden flex flex-1 shadow-sm min-h-0">
        <div className="w-full sm:w-72 border-r border-indigo/5 flex flex-col shrink-0 max-h-[50vh] sm:max-h-none">
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

        <div className="hidden sm:flex flex-1 flex-col bg-sand/10 min-w-0">
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

      {/* Mobile thread view */}
      {detail && activeId ? (
        <div className="sm:hidden bg-white/80 border border-indigo/10 rounded-3xl overflow-hidden flex flex-col shadow-sm min-h-[320px]">
          <div className="p-4 border-b border-indigo/5 bg-white/60">
            <p className="text-sm font-bold text-charcoal">{counterpartName}</p>
            <p className="text-[10px] text-charcoal/40 font-semibold mt-0.5">{detail.subject}</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[40vh]">
            {detail.messages.map((m: ChatMessage) => {
              const isMe =
                detail.participants.find((p) => p.id === m.senderId)?.email.toLowerCase() ===
                userEmail.toLowerCase();
              return (
                <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
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
        </div>
      ) : null}

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

export default function DealerCommunicationsPage() {
  return (
    <React.Suspense fallback={<PageLoader label="Loading communications..." />}>
      <CommunicationsContent />
    </React.Suspense>
  );
}

function CommunicationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab: CommTab = tabParam === "messages" ? "messages" : "inquiries";

  const setTab = (tab: CommTab) => {
    const href =
      tab === "messages"
        ? "/dealer/dashboard/inquiries?tab=messages"
        : "/dealer/dashboard/inquiries";
    router.replace(href, { scroll: false });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-charcoal">
      <DashboardPageHeader
        title="Communications"
        description="Customer inquiries and direct messages in one place"
      />

      <div
        className="flex gap-1 bg-sand/35 border border-indigo/5 p-1 rounded-2xl w-full sm:w-fit"
        role="tablist"
        aria-label="Communications sections"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "inquiries"}
          onClick={() => setTab("inquiries")}
          className={cn(
            "flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer",
            activeTab === "inquiries"
              ? "bg-white text-indigo shadow-sm"
              : "text-charcoal/45 hover:text-charcoal"
          )}
        >
          Inquiries
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "messages"}
          onClick={() => setTab("messages")}
          className={cn(
            "flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer",
            activeTab === "messages"
              ? "bg-white text-indigo shadow-sm"
              : "text-charcoal/45 hover:text-charcoal"
          )}
        >
          Messages
        </button>
      </div>

      {activeTab === "inquiries" ? <InquiriesPanel /> : <MessagesPanel />}
    </div>
  );
}
