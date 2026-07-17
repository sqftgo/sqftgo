"use client";
import React from "react";
import { useApp } from "@/context/AppContext";
import { Users, Building2, MessageSquare, TrendingUp, BarChart3, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminAnalyticsPage() {
  const { properties, mockUsers, inquiries, enquiries } = useApp();

  const activeProps = properties.filter(p => p.status === "Active").length;
  const totalInquiries = Object.values(inquiries).reduce((a, b) => a + b.length, 0);
  const totalRevenue = properties.filter(p => p.status === "Active").reduce((a, p) => a + p.price, 0);

  const cityData = properties.reduce((acc: Record<string, number>, p) => { acc[p.city] = (acc[p.city] || 0) + 1; return acc; }, {});
  const topCities = Object.entries(cityData).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxCity = Math.max(...topCities.map(([, c]) => c), 1);

  const monthlyInquiries = [12, 18, 14, 22, 30, 25, 35, 28, 40, 33, 45, 38];
  const maxInq = Math.max(...monthlyInquiries);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const KPI = ({ label, value, icon: Icon, color, sub }: any) => {
    // Determine background styling based on text color class
    let bgStyle = "bg-indigo/10 border-indigo/20";
    if (color === "text-emerald-600") bgStyle = "bg-emerald-500/10 border-emerald-500/20";
    if (color === "text-terracotta") bgStyle = "bg-terracotta/10 border-terracotta/20";
    if (color === "text-amber-600") bgStyle = "bg-amber-500/10 border-amber-500/20";

    return (
      <div className="bg-white/80 border border-indigo/10 rounded-2xl p-5 shadow-sm">
        <div className="flex items-start justify-between mb-3">
          <p className="text-[10px] font-black text-charcoal/40 uppercase tracking-widest">{label}</p>
          <div className={`w-8 h-8 ${bgStyle} border rounded-xl flex items-center justify-center`}>
            <Icon className={`w-4 h-4 ${color}`} />
          </div>
        </div>
        <p className="text-3xl font-serif font-black text-charcoal">{value}</p>
        {sub && <p className="text-[10px] text-charcoal/40 font-semibold mt-1">{sub}</p>}
      </div>
    );
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-serif font-black text-charcoal">Platform Analytics</h1>
        <p className="text-charcoal/40 text-sm font-semibold mt-1">Overall performance metrics</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KPI label="Total Users" value={mockUsers.length} icon={Users} color="text-indigo" sub="Registered accounts" />
        <KPI label="Active Listings" value={activeProps} icon={Building2} color="text-emerald-600" sub="Live on website" />
        <KPI label="Total Inquiries" value={totalInquiries + enquiries.length} icon={MessageSquare} color="text-terracotta" sub="Buyer messages" />
        <KPI label="Est. Portfolio Value" value={`₹${(totalRevenue / 10000000).toFixed(1)}Cr`} icon={TrendingUp} color="text-amber-600" sub="Active listings sum" />
      </div>

      {/* Monthly Inquiries Chart */}
      <div className="bg-white/80 border border-indigo/10 rounded-2xl p-6 shadow-sm">
        <h2 className="text-sm font-serif font-black text-charcoal mb-6">Monthly Inquiry Trend (2026)</h2>
        <div className="flex items-end gap-2 h-32">
          {monthlyInquiries.map((val, i) => (
            <motion.div key={i} className="flex-1 flex flex-col items-center gap-1" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: i * 0.05 }} style={{ originY: 1 }}>
              <div className="w-full rounded-t-lg bg-gradient-to-t from-indigo/20 to-indigo hover:from-indigo/40 hover:to-indigo cursor-pointer transition-all animate-grow-height"
                style={{ height: `${(val / maxInq) * 100}%` }} title={`${months[i]}: ${val} inquiries`} />
              <p className="text-[9px] font-bold text-charcoal/40">{months[i].slice(0,3)}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* City Breakdown */}
      <div className="bg-white/80 border border-indigo/10 rounded-2xl p-6 shadow-sm">
        <h2 className="text-sm font-serif font-black text-charcoal mb-5">Properties by City</h2>
        <div className="space-y-4">
          {topCities.map(([city, count]) => (
            <div key={city} className="flex items-center gap-3">
              <div className="flex items-center gap-2 w-24 shrink-0">
                <MapPin className="w-3 h-3 text-charcoal/30" />
                <span className="text-xs font-bold text-charcoal/65 truncate">{city}</span>
              </div>
              <div className="flex-1 h-3 bg-indigo/5 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${(count / maxCity) * 100}%` }} transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-terracotta/40 to-terracotta rounded-full" />
              </div>
              <span className="text-xs font-black text-charcoal/40 w-8 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
