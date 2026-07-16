"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useApp, Property } from "@/context/AppContext";
import { Search, Plus, Edit2, Trash2, ExternalLink, Filter, Building2, CheckCircle2, Clock, XCircle, Grid, List, Eye, Heart, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_OPTIONS = ["All", "Active", "Pending Review", "Sold", "Rented", "Draft"] as const;
const TYPE_OPTIONS = ["All", "Villa", "Apartment", "Home", "Office Space", "Shop", "Agricultural Land", "Hotel"];

export default function DealerPropertiesPage() {
  const { properties, userEmail, updateProperty, deleteProperty, inquiries } = useApp();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");

  const myProperties = useMemo(() => {
    let props = properties.filter(p => p.ownerEmail?.toLowerCase() === userEmail.toLowerCase());
    if (search) props = props.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.locality.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter !== "All") props = props.filter(p => p.status === statusFilter);
    if (typeFilter !== "All") props = props.filter(p => p.type === typeFilter);
    if (sortBy === "price-asc") props = [...props].sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc") props = [...props].sort((a, b) => b.price - a.price);
    if (sortBy === "inquiries") props = [...props].sort((a, b) => (inquiries[b.id]?.length || 0) - (inquiries[a.id]?.length || 0));
    return props;
  }, [properties, userEmail, search, statusFilter, typeFilter, sortBy, inquiries]);

  const formatPrice = (v: number) => "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(v);

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Delete "${title}"? This action cannot be undone.`)) deleteProperty(id);
  };

  const handleStatusChange = (id: string, status: Property["status"]) => updateProperty(id, { status });

  const StatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, string> = {
      "Active": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      "Pending Review": "bg-amber-500/10 text-amber-600 border-amber-500/20",
      "Sold": "bg-blue-500/10 text-blue-600 border-blue-500/20",
      "Rented": "bg-purple-500/10 text-purple-600 border-purple-500/20",
      "Draft": "bg-sand/30 text-charcoal/50 border-indigo/5",
    };
    return <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-1 rounded-lg border ${map[status] || map["Draft"]}`}>{status}</span>;
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white/60 border border-indigo/10 rounded-3xl p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-serif font-black text-charcoal">My Property Listings</h1>
          <p className="text-charcoal/50 text-xs font-semibold mt-1">{myProperties.length} active and draft listings found</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Switcher */}
          <div className="bg-sand/35 border border-indigo/5 p-1 rounded-xl flex gap-0.5">
            <button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg cursor-pointer transition-colors ${viewMode === "grid" ? "bg-white text-indigo shadow-sm" : "text-charcoal/40 hover:text-charcoal"}`}><Grid className="w-3.5 h-3.5" /></button>
            <button onClick={() => setViewMode("table")} className={`p-2 rounded-lg cursor-pointer transition-colors ${viewMode === "table" ? "bg-white text-indigo shadow-sm" : "text-charcoal/40 hover:text-charcoal"}`}><List className="w-3.5 h-3.5" /></button>
          </div>
          <Link href="/dealer/dashboard/add-property" className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo hover:bg-indigo-hover text-white text-xs font-black uppercase tracking-wider rounded-xl transition-colors shadow-lg shadow-indigo/15 shrink-0">
            <Plus className="w-4 h-4" />
            <span>Add Property</span>
          </Link>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-3 bg-white/60 border border-indigo/10 rounded-3xl p-4 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-charcoal/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search listings..."
            className="w-full bg-sand/30 border border-indigo/5 focus:border-indigo/35 text-charcoal placeholder-charcoal/30 text-xs font-semibold px-4 py-2.5 pl-10 rounded-xl focus:outline-none"
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-sand/30 border border-indigo/5 text-charcoal text-xs font-semibold px-3 py-2.5 rounded-xl focus:outline-none cursor-pointer">
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s === "All" ? "All Status" : s}</option>)}
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="bg-sand/30 border border-indigo/5 text-charcoal text-xs font-semibold px-3 py-2.5 rounded-xl focus:outline-none cursor-pointer">
          {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t === "All" ? "All Types" : t}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-sand/30 border border-indigo/5 text-charcoal text-xs font-semibold px-3 py-2.5 rounded-xl focus:outline-none cursor-pointer">
          <option value="newest">Newest First</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="inquiries">Most Inquiries</option>
        </select>
      </div>

      {/* Main listing view grid or table */}
      {myProperties.length === 0 ? (
        <div className="bg-white/80 border border-indigo/10 rounded-3xl p-16 text-center shadow-sm">
          <Building2 className="w-12 h-12 text-indigo/20 mx-auto mb-4" />
          <p className="text-charcoal/50 font-semibold text-sm">No properties match your filters.</p>
          <Link href="/dealer/dashboard/add-property" className="inline-block mt-4 px-4 py-2 bg-indigo/10 text-indigo text-xs font-black uppercase tracking-wider rounded-xl transition-all">Add first property</Link>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {myProperties.map(prop => (
            <motion.div key={prop.id} layout className="bg-white/80 border border-indigo/10 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between">
              
              {/* Cover Image & Status Badge */}
              <div className="h-48 overflow-hidden relative bg-sand/35">
                <img src={prop.images?.[0] || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80"} alt="" className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4"><StatusBadge status={prop.status} /></div>
              </div>

              {/* Card Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[9px] font-black text-indigo/60 uppercase tracking-widest">{prop.type} · For {prop.purpose}</span>
                  <h3 className="text-sm font-bold text-charcoal line-clamp-1 mt-1">{prop.title}</h3>
                  <p className="text-[10px] text-charcoal/50 font-semibold mt-0.5">{prop.locality}, {prop.city}</p>
                </div>

                <div className="flex items-end justify-between border-t border-indigo/5 pt-3">
                  <div>
                    <span className="text-[8px] font-black text-charcoal/40 uppercase tracking-wider block">Price</span>
                    <span className="text-base font-serif font-black text-indigo">{formatPrice(prop.price)}</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1 text-[10px] text-charcoal/65 font-bold"><Eye className="w-3.5 h-3.5 text-charcoal/30" />142</span>
                    <span className="flex items-center gap-1 text-[10px] text-charcoal/65 font-bold"><Heart className="w-3.5 h-3.5 text-charcoal/30" />12</span>
                    <span className="flex items-center gap-1 text-[10px] text-charcoal/65 font-bold"><MessageSquare className="w-3.5 h-3.5 text-charcoal/30" />{inquiries[prop.id]?.length || 0}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Link href={`/property/${prop.id}`} target="_blank" className="flex-1 py-2 border border-indigo/5 bg-sand/30 hover:bg-indigo/5 text-charcoal text-center text-[10px] font-black rounded-xl transition-all uppercase tracking-wider flex items-center justify-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5" /> View
                  </Link>
                  <Link href={`/dealer/dashboard/edit-property/${prop.id}`} className="flex-1 py-2 bg-indigo/5 border border-indigo/10 hover:bg-indigo hover:text-white text-indigo text-center text-[10px] font-black rounded-xl transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 group">
                    <Edit2 className="w-3.5 h-3.5 text-indigo group-hover:text-white" /> Edit
                  </Link>
                  <button onClick={() => handleDelete(prop.id, prop.title)} className="p-2 border border-rose-100 hover:bg-rose-50 rounded-xl text-rose-500 transition-colors cursor-pointer" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white/80 border border-indigo/10 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-indigo/5 bg-white/40">
                <tr>
                  {["Property", "Type", "Price", "Status", "Inquiries", "Actions"].map(h => (
                    <th key={h} className="px-5 py-3.5 text-[9px] font-black text-charcoal/40 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo/5">
                {myProperties.map(prop => (
                  <tr key={prop.id} className="hover:bg-indigo/5 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 bg-sand/35 border border-indigo/5">
                          <img src={prop.images?.[0] || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=200&q=80"} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-charcoal line-clamp-1 max-w-[200px]">{prop.title}</p>
                          <p className="text-[10px] text-charcoal/50 font-semibold mt-0.5">{prop.locality}, {prop.city}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-bold text-charcoal/65">{prop.type}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-serif font-black text-indigo">{formatPrice(prop.price)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={prop.status} />
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-bold text-charcoal/70">{inquiries[prop.id]?.length || 0}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <Link href={`/property/${prop.id}`} target="_blank" className="p-2 bg-sand/30 border border-indigo/5 hover:bg-indigo/5 text-charcoal/50 hover:text-indigo rounded-xl transition-all" title="View Public">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <Link href={`/dealer/dashboard/edit-property/${prop.id}`} className="p-2 bg-indigo/5 border border-indigo/10 hover:bg-indigo text-indigo hover:text-white rounded-xl transition-all" title="Edit">
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <button onClick={() => handleDelete(prop.id, prop.title)} className="p-2 border border-rose-100 hover:bg-rose-50 rounded-xl text-rose-500 transition-colors cursor-pointer" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
