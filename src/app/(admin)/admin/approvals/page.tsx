"use client";
import React from "react";
import { useApp } from "@/context/AppContext";
import { CheckCircle2, XCircle, MapPin, Bed, Square, Clock } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AdminApprovalsPage() {
  const { properties, updateProperty, deleteProperty, addLog, userEmail } = useApp();

  const pending = properties.filter(p => p.status === "Pending Review");

  const approve = (id: string, title: string) => {
    updateProperty(id, { status: "Active" });
    addLog({ action: "Property Approved", performedBy: userEmail, role: "Admin", target: title });
  };

  const reject = (id: string, title: string) => {
    if (!confirm(`Reject and remove "${title}"?`)) return;
    deleteProperty(id);
    addLog({ action: "Property Rejected", performedBy: userEmail, role: "Admin", target: title });
  };

  const formatPrice = (v: number) => "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(v);

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-black text-white">Property Approval Queue</h1>
        <p className="text-white/40 text-sm font-semibold mt-1">
          {pending.length > 0 ? `${pending.length} listings waiting for review` : "All listings are up to date"}
        </p>
      </div>

      {pending.length === 0 ? (
        <div className="bg-[#1e2028] border border-emerald-500/20 rounded-2xl p-16 text-center">
          <CheckCircle2 className="w-14 h-14 text-emerald-400/40 mx-auto mb-4" />
          <p className="text-white/50 font-serif font-black text-lg">All caught up!</p>
          <p className="text-white/30 text-sm font-semibold mt-1">No listings pending review.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {pending.map((prop, i) => (
            <motion.div key={prop.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="bg-[#1e2028] border border-amber-500/20 rounded-2xl overflow-hidden">
              <div className="p-5 md:p-6">
                <div className="flex flex-col md:flex-row gap-5">
                  {/* Image */}
                  <div className="w-full md:w-48 h-40 rounded-xl overflow-hidden shrink-0 bg-white/5">
                    <img src={prop.images?.[0]} alt={prop.title} className="w-full h-full object-cover" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className="text-base font-serif font-black text-white">{prop.title}</h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          <MapPin className="w-3 h-3 text-white/30" />
                          <p className="text-xs text-white/50 font-semibold">{prop.locality}, {prop.city}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">Pending Review</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 mb-3">
                      <div className="flex items-center gap-1.5 text-xs text-white/50 font-semibold">
                        <Bed className="w-3.5 h-3.5 text-white/30" />{prop.bhk || "—"} BHK
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-white/50 font-semibold">
                        <Square className="w-3.5 h-3.5 text-white/30" />{prop.size} sq.ft.
                      </div>
                      <span className="text-xs text-white/50 font-semibold">{prop.type} · {prop.furnished}</span>
                    </div>

                    <p className="text-xs text-white/50 font-semibold leading-relaxed line-clamp-2 mb-4">{prop.description}</p>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] text-white/30 font-black uppercase tracking-wider">Submitted by</p>
                        <p className="text-sm font-bold text-white">{prop.ownerName}</p>
                        <p className="text-[10px] text-white/40">{prop.ownerEmail}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-white/30 font-black uppercase tracking-wider">Price</p>
                        <p className="text-xl font-serif font-black text-white">{formatPrice(prop.price)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RERA */}
                {prop.reraId && (
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[10px] text-emerald-400 font-bold">RERA Registered: {prop.reraId}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between flex-wrap gap-3">
                  <Link href={`/property/${prop.id}`} target="_blank" className="text-xs text-indigo font-bold hover:underline">
                    Preview Listing →
                  </Link>
                  <div className="flex gap-3">
                    <button onClick={() => reject(prop.id, prop.title)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-black rounded-xl hover:bg-rose-500/20 transition-colors cursor-pointer">
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                    <button onClick={() => approve(prop.id, prop.title)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black rounded-xl hover:bg-emerald-500/20 transition-colors cursor-pointer">
                      <CheckCircle2 className="w-4 h-4" /> Approve
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
