"use client";
import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Search, Edit2, Trash2, CheckCircle2, MapPin, Phone, Globe, ExternalLink } from "lucide-react";

export default function AdminDealersPage() {
  const { directoryProfiles, setDirectoryProfiles, addLog, userEmail } = useApp();
  const [search, setSearch] = useState("");

  const dealers = directoryProfiles.filter(p => {
    const isDealerCat = p.category === "Agent & Broker" || p.category === "Property Consultant" || p.category === "Builder & Developer";
    const matchSearch = !search || p.firmName.toLowerCase().includes(search.toLowerCase()) || p.ownerName.toLowerCase().includes(search.toLowerCase());
    return isDealerCat && matchSearch;
  });

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Remove dealer "${name}" from the platform?`)) return;
    setDirectoryProfiles(prev => prev.filter(p => p.id !== id));
    addLog({ action: "Dealer Removed", performedBy: userEmail, role: "Admin", target: name });
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-serif font-black text-white">Dealer Management</h1>
          <p className="text-white/40 text-sm font-semibold mt-1">{dealers.length} registered dealers</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-white/30" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search dealers..." className="bg-[#1e2028] border border-white/10 text-white placeholder-white/30 text-xs font-semibold px-4 py-2.5 pl-10 rounded-xl focus:outline-none focus:border-terracotta/50 w-60" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {dealers.map(dealer => (
          <div key={dealer.id} className="bg-[#1e2028] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-400/20 flex items-center justify-center text-purple-400 font-black text-sm shrink-0">
                  {dealer.firmName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white leading-tight truncate">{dealer.firmName}</p>
                  <p className="text-[10px] text-white/40 font-semibold mt-0.5">{dealer.ownerName}</p>
                </div>
              </div>
              <span className="text-[9px] font-black bg-purple-400/10 text-purple-400 border border-purple-400/20 px-2 py-0.5 rounded-lg whitespace-nowrap shrink-0 ml-2">{dealer.category}</span>
            </div>

            <div className="space-y-2 mb-4">
              {dealer.city && <div className="flex items-center gap-2 text-[10px] text-white/50 font-semibold"><MapPin className="w-3 h-3 text-white/25 shrink-0" />{dealer.city}</div>}
              {dealer.mobile && <div className="flex items-center gap-2 text-[10px] text-white/50 font-semibold"><Phone className="w-3 h-3 text-white/25 shrink-0" />{dealer.mobile}</div>}
              {dealer.reraId && (
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="text-[10px] text-emerald-400 font-bold">{dealer.reraId}</span>
                </div>
              )}
            </div>

            {dealer.description && (
              <p className="text-[11px] text-white/40 font-semibold leading-relaxed mb-4 line-clamp-2">{dealer.description}</p>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <span className="text-[10px] text-white/30 font-semibold">{dealer.experience || "—"} experience</span>
              <div className="flex items-center gap-2">
                {dealer.website && (
                  <a href={`https://${dealer.website}`} target="_blank" className="p-1.5 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-lg transition-all" title="Website">
                    <Globe className="w-3.5 h-3.5" />
                  </a>
                )}
                <button onClick={() => handleDelete(dealer.id, dealer.firmName)} className="p-1.5 bg-white/5 hover:bg-rose-500/20 text-white/50 hover:text-rose-400 rounded-lg transition-all cursor-pointer" title="Remove">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {dealers.length === 0 && (
        <div className="bg-[#1e2028] border border-white/10 rounded-2xl p-16 text-center">
          <p className="text-white/40 font-semibold">No dealers found matching your search.</p>
        </div>
      )}
    </div>
  );
}
