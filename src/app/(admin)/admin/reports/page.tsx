"use client";
import React from "react";
import { useApp } from "@/context/AppContext";
import { Users, Building2, MessageSquare, TrendingUp, Download } from "lucide-react";

export default function AdminReportsPage() {
  const { properties, mockUsers, inquiries, enquiries, directoryProfiles } = useApp();

  const totalInquiries = Object.values(inquiries).reduce((a, b) => a + b.length, 0);
  const totalEnquiries = enquiries.length;
  const activeProperties = properties.filter(p => p.status === "Active").length;
  const totalDealers = directoryProfiles.filter(p => p.category === "Agent & Broker" || p.category === "Property Consultant").length;

  const cityReport = properties.reduce((acc: Record<string, number>, p) => {
    acc[p.city] = (acc[p.city] || 0) + 1;
    return acc;
  }, {});

  const typeReport = properties.reduce((acc: Record<string, number>, p) => {
    acc[p.type] = (acc[p.type] || 0) + 1;
    return acc;
  }, {});

  const handleExport = () => {
    const data = properties.map(p => ({
      ID: p.id, Title: p.title, Type: p.type, City: p.city, Price: p.price,
      Status: p.status, Owner: p.ownerName, Inquiries: inquiries[p.id]?.length || 0,
    }));
    const csv = [Object.keys(data[0]).join(","), ...data.map(row => Object.values(row).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "sunvalley_properties.csv"; a.click();
  };

  const StatCard = ({ label, value, icon: Icon, color }: any) => (
    <div className="bg-[#1e2028] border border-white/10 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-black text-white/40 uppercase tracking-wider">{label}</p>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <p className="text-3xl font-serif font-black text-white">{value}</p>
    </div>
  );

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-serif font-black text-white">Reports</h1><p className="text-white/40 text-sm font-semibold mt-1">Platform data summary</p></div>
        <button onClick={handleExport} className="flex items-center gap-2 px-5 py-2.5 bg-terracotta hover:bg-terracotta-hover text-white text-xs font-black rounded-xl transition-colors cursor-pointer">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={mockUsers.filter(u => u.role === "user").length} icon={Users} color="text-indigo" />
        <StatCard label="Registered Dealers" value={totalDealers} icon={Users} color="text-purple-400" />
        <StatCard label="Active Listings" value={activeProperties} icon={Building2} color="text-emerald-400" />
        <StatCard label="Total Inquiries" value={totalInquiries + totalEnquiries} icon={MessageSquare} color="text-terracotta" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#1e2028] border border-white/10 rounded-2xl p-5">
          <h2 className="text-sm font-serif font-black text-white mb-4">Listings by City</h2>
          <div className="space-y-3">
            {Object.entries(cityReport).sort((a, b) => b[1] - a[1]).map(([city, count]) => {
              const max = Math.max(...Object.values(cityReport));
              return (
                <div key={city} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-white/60 w-24 shrink-0">{city}</span>
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-terracotta/60 rounded-full" style={{ width: `${(count / max) * 100}%` }} />
                  </div>
                  <span className="text-xs font-black text-white/40 w-6 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-[#1e2028] border border-white/10 rounded-2xl p-5">
          <h2 className="text-sm font-serif font-black text-white mb-4">Listings by Type</h2>
          <div className="space-y-3">
            {Object.entries(typeReport).sort((a, b) => b[1] - a[1]).map(([type, count]) => {
              const max = Math.max(...Object.values(typeReport));
              return (
                <div key={type} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-white/60 w-28 shrink-0 truncate">{type}</span>
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo/60 rounded-full" style={{ width: `${(count / max) * 100}%` }} />
                  </div>
                  <span className="text-xs font-black text-white/40 w-6 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Inquiry Report Table */}
      <div className="bg-[#1e2028] border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/5"><h2 className="text-sm font-serif font-black text-white">Recent General Enquiries</h2></div>
        <div className="divide-y divide-white/5">
          {enquiries.slice(0, 8).map(enq => (
            <div key={enq.id} className="flex items-center gap-4 px-5 py-3.5">
              <div className="w-8 h-8 rounded-full bg-indigo/10 flex items-center justify-center text-indigo font-black text-xs shrink-0">{enq.name.charAt(0)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white">{enq.name}</p>
                <p className="text-[10px] text-white/40 font-semibold truncate">{enq.message?.slice(0, 60)}...</p>
              </div>
              <span className="text-[9px] text-white/30 font-semibold shrink-0">{enq.date}</span>
            </div>
          ))}
          {enquiries.length === 0 && <div className="p-8 text-center text-white/30 text-sm font-semibold">No general enquiries yet.</div>}
        </div>
      </div>
    </div>
  );
}
