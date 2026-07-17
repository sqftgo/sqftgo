"use client";
import React, { useState } from "react";
import { useApp, Property } from "@/context/AppContext";
import { Search, Edit2, Trash2, ExternalLink, Eye } from "lucide-react";
import Link from "next/link";

export default function AdminPropertiesPage() {
  const { properties, updateProperty, deleteProperty, addLog, userEmail } = useApp();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [cityFilter, setCityFilter] = useState("All");

  const cities = [...new Set(properties.map(p => p.city))];
  const filtered = properties.filter(p => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.ownerName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || p.status === statusFilter;
    const matchCity = cityFilter === "All" || p.city === cityFilter;
    return matchSearch && matchStatus && matchCity;
  });

  const handleStatusChange = (id: string, title: string, status: Property["status"]) => {
    updateProperty(id, { status });
    addLog({ action: `Property Status → ${status}`, performedBy: userEmail, role: "Admin", target: title });
  };

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    deleteProperty(id);
    addLog({ action: "Property Deleted", performedBy: userEmail, role: "Admin", target: title });
  };

  const formatPrice = (v: number) => "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(v);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-serif font-black text-charcoal">Property Management</h1>
        <p className="text-charcoal/40 text-sm font-semibold mt-1">{filtered.length} of {properties.length} properties shown</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-charcoal/30" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search properties..." className="w-full bg-sand/35 border border-indigo/5 focus:border-terracotta/50 text-charcoal placeholder-charcoal/40 text-xs font-semibold px-4 py-2.5 pl-10 rounded-xl focus:outline-none" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-sand/35 border border-indigo/5 text-charcoal/80 text-xs font-semibold px-3 py-2.5 rounded-xl focus:outline-none cursor-pointer">
          {["All", "Active", "Pending Review", "Sold", "Rented"].map(s => <option key={s} value={s}>{s === "All" ? "All Status" : s}</option>)}
        </select>
        <select value={cityFilter} onChange={e => setCityFilter(e.target.value)} className="bg-sand/35 border border-indigo/5 text-charcoal/80 text-xs font-semibold px-3 py-2.5 rounded-xl focus:outline-none cursor-pointer">
          <option value="All">All Cities</option>
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="bg-white/80 border border-indigo/10 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-indigo/5 bg-white/40">
              <tr>{["Property", "Owner", "City", "Price", "Status", "Actions"].map(h => (
                <th key={h} className="px-5 py-3.5 text-[9px] font-black text-charcoal/40 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-indigo/5">
              {filtered.map(prop => (
                <tr key={prop.id} className="hover:bg-indigo/5 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-sand/35 border border-indigo/5 shrink-0">
                        <img src={prop.images?.[0] || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=200&q=80"} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="max-w-[200px]">
                        <p className="text-sm font-bold text-charcoal truncate">{prop.title}</p>
                        <p className="text-[10px] text-charcoal/40 font-semibold truncate">{prop.type} · {prop.purpose}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4"><span className="text-xs text-charcoal/60 font-semibold">{prop.ownerName}</span></td>
                  <td className="px-5 py-4"><span className="text-xs text-charcoal/60 font-semibold">{prop.city}</span></td>
                  <td className="px-5 py-4"><span className="text-sm font-serif font-black text-indigo">{formatPrice(prop.price)}</span></td>
                  <td className="px-5 py-4">
                    <select value={prop.status} onChange={e => handleStatusChange(prop.id, prop.title, e.target.value as Property["status"])}
                      className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg border bg-transparent cursor-pointer ${
                        prop.status === "Active" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                        prop.status === "Pending Review" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                        "bg-white/10 text-charcoal/40 border-indigo/5"
                      }`}>
                      {["Active", "Pending Review", "Sold", "Rented", "Draft"].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <Link href={`/property/${prop.id}`} target="_blank" className="p-2 bg-indigo/5 hover:bg-indigo/10 text-charcoal/40 hover:text-indigo rounded-lg transition-all" title="View">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                      <button onClick={() => handleDelete(prop.id, prop.title)} className="p-2 bg-indigo/5 hover:bg-rose-500/10 text-charcoal/40 hover:text-rose-500 rounded-lg transition-all cursor-pointer" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="p-10 text-center text-charcoal/40 text-sm font-semibold">No properties found.</div>}
      </div>
    </div>
  );
}
