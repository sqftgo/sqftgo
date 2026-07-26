"use client";

import React, { useMemo, useState } from "react";
import {
  Send,
  Trash2,
  MessageSquare,
  CheckCircle2,
  Phone,
  Mail,
  MoreVertical,
} from "lucide-react";
import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { inquiryService, messageService } from "@/services";
import { usePropertiesQuery } from "@/hooks";
import {
  DropdownMenu,
  SearchInput,
  Avatar,
  ConfirmDialog,
  Dialog,
  Button,
  TextArea,
} from "@/components/ui";

export function DealerInquiriesPanel() {
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
