"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { Send, Trash2, MessageSquare, CheckCircle2, Phone, Mail, MoreVertical } from "lucide-react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DashboardPageHeader,
  SearchInput,
  Avatar,
  ConfirmDialog,
  Dialog,
  Button,
  TextArea,
} from "@/components/ui";

export default function DealerInquiriesPage() {
  const { properties, userEmail, inquiries, deleteInquiry } = useApp();
  const [search, setSearch] = useState("");
  const [replyModal, setReplyModal] = useState<any>(null);
  const [replyMsg, setReplyMsg] = useState("");
  const [replySent, setReplySent] = useState(false);
  const [pendingDismiss, setPendingDismiss] = useState<{ propertyId: string; idx: number } | null>(null);

  const myProperties = properties.filter(p => p.ownerEmail?.toLowerCase() === userEmail.toLowerCase());

  const allInquiries = useMemo(() => {
    return myProperties.flatMap(p =>
      (inquiries[p.id] || []).map((inq, idx) => ({
        ...inq, propertyId: p.id, propertyTitle: p.title, propertyImage: p.images?.[0], idx
      }))
    ).filter(inq => !search || inq.name.toLowerCase().includes(search.toLowerCase()) || inq.propertyTitle.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [myProperties, inquiries, search]);

  const closeReply = () => {
    setReplyModal(null);
    setReplySent(false);
    setReplyMsg("");
  };

  const handleReply = () => {
    setReplySent(true);
    setTimeout(() => {
      deleteInquiry(replyModal.propertyId, replyModal.idx);
      closeReply();
    }, 1500);
  };

  const confirmDismiss = () => {
    if (!pendingDismiss) return;
    deleteInquiry(pendingDismiss.propertyId, pendingDismiss.idx);
    setPendingDismiss(null);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto text-charcoal">
      <DashboardPageHeader
        title="Customer Inquiries"
        description={`${allInquiries.length} inquiries received on your properties`}
        actions={
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search inquiries..."
            accent="indigo"
            containerClassName="w-full sm:w-64 flex-none min-w-0"
          />
        }
      />

      {allInquiries.length === 0 ? (
        <div className="bg-white/80 border border-indigo/10 rounded-3xl p-16 text-center shadow-sm">
          <MessageSquare className="w-12 h-12 text-indigo/20 mx-auto mb-4" />
          <p className="text-charcoal/50 font-semibold text-sm">No inquiries yet. They will appear here when buyers contact you.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {allInquiries.map((inq, i) => (
            <motion.div
              key={`${inq.propertyId}-${inq.idx}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white/80 border border-indigo/10 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow relative flex flex-col md:flex-row gap-5 items-start md:items-center justify-between"
            >
              <div className="flex gap-4 items-start md:items-center flex-1 min-w-0">
                <div className="relative shrink-0">
                  <Avatar name={inq.name} size="lg" shape="rounded" tone="indigo" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="text-xs font-black text-charcoal">{inq.name}</span>
                    <span className="text-[9px] text-charcoal/40 font-bold uppercase tracking-wider">{inq.date}</span>
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
                  onClick={() => setReplyModal(inq)}
                  className="uppercase tracking-wider"
                >
                  <Send className="w-3.5 h-3.5" />
                  Reply
                </Button>
                <DropdownMenu
                  accent="indigo"
                  align="right"
                  trigger={
                    <button type="button" className="p-2 hover:bg-indigo/5 text-charcoal/40 hover:text-indigo rounded-xl transition-all cursor-pointer">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  }
                  items={[
                    { id: "call", label: `Call: ${inq.phone}`, href: `tel:${inq.phone}`, icon: Phone },
                    { id: "email", label: `Email: ${inq.email}`, href: `mailto:${inq.email}`, icon: Mail },
                    { id: "dismiss", label: "Dismiss Inquiry", onClick: () => setPendingDismiss({ propertyId: inq.propertyId, idx: inq.idx }), icon: Trash2, variant: "danger", dividerBefore: true }
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
              <Button variant="ghost" size="sm" onClick={closeReply}>Cancel</Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleReply}
                disabled={!replyMsg}
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
            <p className="text-emerald-700 font-bold text-sm">Reply sent! Marking inquiry as resolved...</p>
          </div>
        ) : (
          <TextArea
            value={replyMsg}
            onChange={(e) => setReplyMsg(e.target.value)}
            rows={5}
            placeholder={`Dear ${replyModal?.name},\n\nThank you for your interest...`}
          />
        )}
      </Dialog>

      <ConfirmDialog
        open={Boolean(pendingDismiss)}
        onClose={() => setPendingDismiss(null)}
        onConfirm={confirmDismiss}
        title="Dismiss inquiry?"
        description="Dismiss this inquiry? It will be removed from your inbox."
        confirmLabel="Dismiss"
        tone="danger"
      />
    </div>
  );
}
