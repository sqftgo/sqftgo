"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { Search, Send, Trash2, MessageSquare, X, CheckCircle2, Phone, Mail, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DealerInquiriesPage() {
  const { properties, userEmail, inquiries, deleteInquiry } = useApp();
  const [search, setSearch] = useState("");
  const [replyModal, setReplyModal] = useState<any>(null);
  const [replyMsg, setReplyMsg] = useState("");
  const [replySent, setReplySent] = useState(false);

  const myProperties = properties.filter(p => p.ownerEmail?.toLowerCase() === userEmail.toLowerCase());

  const allInquiries = useMemo(() => {
    return myProperties.flatMap(p =>
      (inquiries[p.id] || []).map((inq, idx) => ({
        ...inq, propertyId: p.id, propertyTitle: p.title, propertyImage: p.images?.[0], idx
      }))
    ).filter(inq => !search || inq.name.toLowerCase().includes(search.toLowerCase()) || inq.propertyTitle.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [myProperties, inquiries, search]);

  const handleReply = () => {
    setReplySent(true);
    setTimeout(() => {
      deleteInquiry(replyModal.propertyId, replyModal.idx);
      setReplyModal(null);
      setReplySent(false);
      setReplyMsg("");
    }, 1500);
  };

  const handleDismiss = (propertyId: string, idx: number) => {
    if (confirm("Dismiss this inquiry?")) deleteInquiry(propertyId, idx);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto text-charcoal">
      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white/60 border border-indigo/10 rounded-3xl p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-serif font-black text-charcoal">Customer Inquiries</h1>
          <p className="text-charcoal/50 text-xs font-semibold mt-1">{allInquiries.length} inquiries received on your properties</p>
        </div>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-charcoal/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search inquiries..."
            className="w-full sm:w-64 bg-sand/30 border border-indigo/10 text-charcoal placeholder-charcoal/30 text-xs font-semibold px-4 py-2.5 pl-10 rounded-xl focus:outline-none focus:border-indigo/40"
          />
        </div>
      </div>

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
                {/* Customer Avatar & Unread Badge Indicator */}
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-2xl bg-indigo/10 border border-indigo/20 flex items-center justify-center text-indigo font-serif font-black text-sm">
                    {inq.name.charAt(0)}
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
                </div>

                {/* Conversation Details */}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="text-xs font-black text-charcoal">{inq.name}</span>
                    <span className="text-[9px] text-charcoal/40 font-bold uppercase tracking-wider">{inq.date}</span>
                  </div>
                  
                  {/* Property Referrer */}
                  <div className="flex items-center gap-1 text-[9px] font-black text-indigo uppercase tracking-wider">
                    <span>Re: {inq.propertyTitle}</span>
                  </div>

                  {/* Message body */}
                  <p className="text-xs text-charcoal/70 font-semibold leading-relaxed line-clamp-1">
                    "{inq.message}"
                  </p>
                </div>
              </div>

              {/* Action operations */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 border-indigo/5 pt-3 md:pt-0 shrink-0">
                <button
                  onClick={() => handleDismiss(inq.propertyId, inq.idx)}
                  className="px-4 py-2 border border-rose-100 hover:bg-rose-50 text-rose-500 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Dismiss
                </button>
                <button
                  onClick={() => setReplyModal(inq)}
                  className="flex items-center gap-1.5 px-5 py-2 bg-indigo hover:bg-indigo-hover text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-indigo/15 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Reply</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Reply Dialog */}
      <AnimatePresence>
        {replyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setReplyModal(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white border border-indigo/15 rounded-3xl p-6 max-w-lg w-full z-10 shadow-xl text-charcoal"
            >
              <button onClick={() => setReplyModal(null)} className="absolute top-4 right-4 p-2 hover:bg-indigo/5 text-charcoal/40 hover:text-charcoal rounded-xl transition-colors cursor-pointer"><X className="w-4 h-4" /></button>
              <h3 className="text-lg font-serif font-black text-charcoal mb-1">Reply to {replyModal?.name}</h3>
              <p className="text-[10px] text-charcoal/40 uppercase tracking-wider mb-5">Re: {replyModal?.propertyTitle}</p>
              
              {replySent ? (
                <div className="text-center py-6">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                  <p className="text-emerald-700 font-bold text-sm">Reply sent! Marking inquiry as resolved...</p>
                </div>
              ) : (
                <>
                  <textarea
                    value={replyMsg}
                    onChange={e => setReplyMsg(e.target.value)}
                    rows={5}
                    placeholder={`Dear ${replyModal?.name},\n\nThank you for your interest...`}
                    className="w-full bg-sand/30 border border-indigo/10 focus:border-indigo/40 text-charcoal placeholder-charcoal/30 text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none resize-none mb-4"
                  />
                  <div className="flex gap-3 justify-end">
                    <button onClick={() => setReplyModal(null)} className="px-4 py-2.5 text-charcoal/50 text-xs font-bold cursor-pointer">Cancel</button>
                    <button
                      onClick={handleReply}
                      disabled={!replyMsg}
                      className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo hover:bg-indigo-hover text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all disabled:opacity-40 cursor-pointer shadow-md shadow-indigo/15"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Reply</span>
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
