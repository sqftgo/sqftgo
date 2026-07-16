"use client";

import React, { useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { TrendingUp, Eye, MessageSquare, Building2, MapPin, BarChart2 } from "lucide-react";
import { motion } from "framer-motion";

export default function DealerAnalyticsPage() {
  const { properties, userEmail, inquiries } = useApp();

  const myProps = properties.filter(p => p.ownerEmail?.toLowerCase() === userEmail.toLowerCase());
  const totalInquiries = myProps.reduce((a, p) => a + (inquiries[p.id]?.length || 0), 0);
  const activeCount = myProps.filter(p => p.status === "Active").length;
  const pendingCount = myProps.filter(p => p.status === "Pending Review").length;
  const soldCount = myProps.filter(p => p.status === "Sold" || p.status === "Rented").length;

  const topProperties = [...myProps].sort((a, b) => (inquiries[b.id]?.length || 0) - (inquiries[a.id]?.length || 0)).slice(0, 5);

  const cityBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    myProps.forEach(p => { map[p.city] = (map[p.city] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [myProps]);

  const maxCount = Math.max(...cityBreakdown.map(([, c]) => c), 1);

  const KPI = ({ label, value, sub, icon: Icon, color, bg }: any) => (
    <div className="bg-white/80 border border-indigo/10 rounded-3xl p-5 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <p className="text-[10px] font-black text-charcoal/40 uppercase tracking-widest">{label}</p>
        <div className={`w-8 h-8 ${bg} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
      </div>
      <p className="text-2xl md:text-3xl font-serif font-black text-charcoal">{value}</p>
      {sub && <p className="text-[10px] text-charcoal/40 font-semibold mt-1">{sub}</p>}
    </div>
  );

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto text-charcoal">
      <div className="bg-white/60 border border-indigo/10 rounded-3xl p-6 shadow-sm">
        <h1 className="text-2xl font-serif font-black text-charcoal">Analytics & Trends</h1>
        <p className="text-charcoal/50 text-xs font-semibold mt-1">Real-time performance metrics of your real estate listings</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Total Listings" value={myProps.length} icon={Building2} color="text-indigo" bg="bg-indigo/10" sub="All time" />
        <KPI label="Active Now" value={activeCount} icon={TrendingUp} color="text-emerald-600" bg="bg-emerald-500/10" sub="Live on site" />
        <KPI label="Customer Inquiries" value={totalInquiries} icon={MessageSquare} color="text-terracotta" bg="bg-terracotta/10" sub="From buyers" />
        <KPI label="Completed Deals" value={soldCount} icon={Eye} color="text-purple-600" bg="bg-purple-500/10" sub="Sold / Rented" />
      </div>

      {/* Top Performing Properties */}
      <div className="bg-white/80 border border-indigo/10 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-indigo/5 bg-white/40">
          <h2 className="text-sm font-serif font-black text-charcoal">Top Listings by Inquiries</h2>
        </div>
        {topProperties.length === 0 ? (
          <div className="p-10 text-center text-charcoal/30 text-sm font-semibold">No listings yet.</div>
        ) : (
          <div className="divide-y divide-indigo/5">
            {topProperties.map((prop, i) => {
              const inqCount = inquiries[prop.id]?.length || 0;
              const maxInq = Math.max(...topProperties.map(p => inquiries[p.id]?.length || 0), 1);
              return (
                <div key={prop.id} className="flex items-center gap-4 p-4 hover:bg-indigo/5 transition-colors">
                  <span className="text-charcoal/30 font-black text-xs w-5 shrink-0">#{i + 1}</span>
                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-sand/35 border border-indigo/5 shrink-0">
                    <img src={prop.images?.[0]} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-charcoal truncate">{prop.title}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-charcoal/30" />
                      <p className="text-[10px] text-charcoal/50 font-semibold">{prop.locality}, {prop.city}</p>
                    </div>
                    <div className="mt-2 h-1.5 bg-indigo/5 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo rounded-full" style={{ width: `${(inqCount / maxInq) * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-xs font-black text-indigo bg-indigo/10 border border-indigo/25 px-2.5 py-1 rounded-lg shrink-0">{inqCount} Inquiries</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* City Breakdown */}
      <div className="bg-white/80 border border-indigo/10 rounded-3xl p-6 shadow-sm">
        <h2 className="text-sm font-serif font-black text-charcoal mb-5">Listings by City</h2>
        {cityBreakdown.length === 0 ? (
          <p className="text-charcoal/30 text-sm font-semibold text-center py-6">No data yet.</p>
        ) : (
          <div className="space-y-4">
            {cityBreakdown.map(([city, count]) => (
              <div key={city} className="flex items-center gap-3">
                <span className="text-xs font-bold text-charcoal/75 w-24 shrink-0">{city}</span>
                <div className="flex-1 h-2 bg-indigo/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / maxCount) * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full bg-indigo rounded-full"
                  />
                </div>
                <span className="text-xs font-black text-charcoal/40 w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
