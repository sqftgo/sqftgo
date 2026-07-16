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
    { label: "Total Users", value: totalUsers, icon: Users, color: "text-indigo", bg: "bg-indigo/10 border-indigo/20", link: "/admin/users" },
    { label: "Dealers", value: totalDealers, icon: Briefcase, color: "text-purple-400", bg: "bg-purple-400/10 border-purple-400/20", link: "/admin/dealers" },
    { label: "Properties", value: totalProperties, icon: Building2, color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20", link: "/admin/properties" },
    { label: "Pending Approval", value: pendingApprovals, icon: CheckSquare, color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20", link: "/admin/approvals" },
    { label: "Active Listings", value: activeProperties, icon: TrendingUp, color: "text-sky-400", bg: "bg-sky-400/10 border-sky-400/20", link: "/admin/properties" },
    { label: "Total Inquiries", value: totalInquiries, icon: MessageSquare, color: "text-terracotta", bg: "bg-terracotta/10 border-terracotta/20", link: "/admin/reports" },
  ];

  const formatPrice = (v: number) => "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(v);

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-serif font-black text-white">Admin Dashboard</h1>
        <p className="text-white/40 text-sm font-semibold mt-1">Platform overview and management controls</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <Link href={stat.link} className={`bg-[#1e2028] border ${stat.bg} rounded-2xl p-5 flex flex-col gap-3 hover:scale-[1.02] transition-transform block`}>
                <div className={`w-9 h-9 ${stat.bg} border rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-3xl font-serif font-black text-white">{stat.value}</p>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mt-1">{stat.label}</p>
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
              <p className="text-xs font-black text-amber-400 uppercase tracking-wider">Action Required</p>
              <p className="text-base font-serif font-black text-white mt-1">{pendingApprovals} listings awaiting review</p>
            </div>
            <Link href="/admin/approvals" className="px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold rounded-xl hover:bg-amber-500/20 transition-colors">
              Review Now
            </Link>
          </div>
        )}
        <Link href="/admin/users" className="bg-[#1e2028] border border-white/10 rounded-2xl p-5 flex items-center justify-between hover:border-white/20 transition-colors">
          <div>
            <p className="text-xs font-black text-white/40 uppercase tracking-wider">Management</p>
            <p className="text-base font-serif font-black text-white mt-1">View All Users</p>
          </div>
          <ArrowUpRight className="w-5 h-5 text-white/30" />
        </Link>
      </div>

      {/* Recent Properties + Activity Log */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Properties */}
        <div className="bg-[#1e2028] border border-white/10 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <h2 className="text-sm font-serif font-black text-white">Recent Properties</h2>
            <Link href="/admin/properties" className="text-[10px] font-black text-terracotta/80 hover:text-terracotta uppercase tracking-wider flex items-center gap-1">
              All <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {properties.slice(0, 5).map(prop => (
              <div key={prop.id} className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/5 shrink-0">
                  <img src={prop.images?.[0]} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{prop.title}</p>
                  <p className="text-[10px] text-white/40 font-semibold">{prop.ownerName}</p>
                </div>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                  prop.status === "Active" ? "bg-emerald-500/10 text-emerald-400" :
                  prop.status === "Pending Review" ? "bg-amber-500/10 text-amber-400" : "bg-white/5 text-white/30"
                }`}>{prop.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Log */}
        <div className="bg-[#1e2028] border border-white/10 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <h2 className="text-sm font-serif font-black text-white">Recent Activity</h2>
            <Link href="/admin/logs" className="text-[10px] font-black text-terracotta/80 hover:text-terracotta uppercase tracking-wider flex items-center gap-1">
              All <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {activityLogs.slice(0, 5).map(log => (
              <div key={log.id} className="p-4 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-terracotta/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-3 h-3 text-terracotta/60" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{log.action}</p>
                  <p className="text-[10px] text-white/40 font-semibold mt-0.5">{log.performedBy} · {log.role}</p>
                  <p className="text-[9px] text-white/20 font-semibold mt-0.5">{log.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
