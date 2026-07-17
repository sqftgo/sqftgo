"use client";
import React from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { Users, Briefcase, Building2, CheckSquare, TrendingUp, MessageSquare, ArrowUpRight, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminDashboardPage() {
  const { properties, mockUsers, directoryProfiles, inquiries, enquiries, activityLogs } = useApp();

  const totalUsers = mockUsers.filter(u => u.role === "user").length;
  const totalDealers = mockUsers.filter(u => u.role === "broker").length;
  const totalProperties = properties.length;
  const pendingApprovals = properties.filter(p => p.status === "Pending Review").length;
  const activeProperties = properties.filter(p => p.status === "Active").length;
  const totalInquiries = Object.values(inquiries).reduce((a, b) => a + b.length, 0) + enquiries.length;

  const stats = [
    { label: "Total Users", value: totalUsers, icon: Users, color: "text-indigo", bg: "bg-indigo/10 border-indigo/10", link: "/admin/users" },
    { label: "Dealers", value: totalDealers, icon: Briefcase, color: "text-purple-600", bg: "bg-purple-500/10 border-purple-500/10", link: "/admin/dealers" },
    { label: "Properties", value: totalProperties, icon: Building2, color: "text-emerald-600", bg: "bg-emerald-500/10 border-emerald-500/10", link: "/admin/properties" },
    { label: "Pending Approval", value: pendingApprovals, icon: CheckSquare, color: "text-amber-600", bg: "bg-amber-500/10 border-amber-500/10", link: "/admin/approvals" },
    { label: "Active Listings", value: activeProperties, icon: TrendingUp, color: "text-sky-600", bg: "bg-sky-500/10 border-sky-500/10", link: "/admin/properties" },
    { label: "Total Inquiries", value: totalInquiries, icon: MessageSquare, color: "text-terracotta", bg: "bg-terracotta/10 border-terracotta/10", link: "/admin/reports" },
  ];

  const formatPrice = (v: number) => "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(v);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/60 border border-indigo/10 rounded-3xl p-6 md:p-8 shadow-sm backdrop-blur-sm">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-black text-charcoal leading-tight">Admin Dashboard</h1>
          <p className="text-charcoal/50 text-xs md:text-sm font-semibold mt-1.5">Platform overview and management controls</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <Link href={stat.link} className="bg-white/80 border border-indigo/10 rounded-2xl p-5 flex flex-col gap-3 hover:shadow-md transition-shadow block">
                <div className={`w-9 h-9 ${stat.bg} border rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-3xl font-serif font-black text-charcoal">{stat.value}</p>
                  <p className="text-[10px] font-black text-charcoal/40 uppercase tracking-widest mt-1">{stat.label}</p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {pendingApprovals > 0 && (
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-amber-600 uppercase tracking-wider">Action Required</p>
              <p className="text-base font-serif font-black text-charcoal mt-1">{pendingApprovals} listings awaiting review</p>
            </div>
            <Link href="/admin/approvals" className="px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-600 text-xs font-bold rounded-xl hover:bg-amber-500/20 transition-colors">
              Review Now
            </Link>
          </div>
        )}
        <Link href="/admin/users" className="bg-white/80 border border-indigo/10 rounded-2xl p-5 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-black text-charcoal/40 uppercase tracking-wider">Management</p>
            <p className="text-base font-serif font-black text-charcoal mt-1">View All Users</p>
          </div>
          <ArrowUpRight className="w-5 h-5 text-charcoal/30" />
        </Link>
      </div>

      {/* Recent Properties + Activity Log */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Properties */}
        <div className="bg-white/80 border border-indigo/10 rounded-3xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-indigo/5 bg-white/40">
            <h2 className="text-sm font-serif font-black text-charcoal">Recent Properties</h2>
            <Link href="/admin/properties" className="text-[10px] font-black text-terracotta/80 hover:text-terracotta uppercase tracking-wider flex items-center gap-1">
              All <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-indigo/5">
            {properties.slice(0, 5).map(prop => (
              <div key={prop.id} className="flex items-center gap-3 p-4 hover:bg-indigo/5 transition-colors">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-sand/35 border border-indigo/5 shrink-0">
                  <img src={prop.images?.[0] || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=200&q=80"} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-charcoal truncate">{prop.title}</p>
                  <p className="text-[10px] text-charcoal/40 font-semibold">{prop.ownerName}</p>
                </div>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                  prop.status === "Active" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                  prop.status === "Pending Review" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : "bg-white/10 text-charcoal/40 border-indigo/5"
                }`}>{prop.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Log */}
        <div className="bg-white/80 border border-indigo/10 rounded-3xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-indigo/5 bg-white/40">
            <h2 className="text-sm font-serif font-black text-charcoal">Recent Activity</h2>
            <Link href="/admin/logs" className="text-[10px] font-black text-terracotta/80 hover:text-terracotta uppercase tracking-wider flex items-center gap-1">
              All <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-indigo/5">
            {activityLogs.slice(0, 5).map(log => (
              <div key={log.id} className="p-4 flex items-start gap-3 hover:bg-indigo/5 transition-colors">
                <div className="w-7 h-7 rounded-full bg-terracotta/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-3 h-3 text-terracotta/60" />
                </div>
                <div>
                  <p className="text-xs font-bold text-charcoal">{log.action}</p>
                  <p className="text-[10px] text-charcoal/40 font-semibold mt-0.5">{log.performedBy} · {log.role}</p>
                  <p className="text-[9px] text-charcoal/20 font-semibold mt-0.5">{log.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
