"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import {
  Building2, MessageSquare, TrendingUp, Eye, Plus, ArrowUpRight,
  Clock, CheckCircle2, AlertCircle, Bell, Heart, CreditCard,
  Calendar, Send, MessageCircle
} from "lucide-react";
import { motion } from "framer-motion";

export default function DealerDashboardPage() {
  const { properties, inquiries, notifications, userEmail, directoryProfiles } = useApp();

  const brokerProfile = directoryProfiles.find(p => p.email.toLowerCase() === userEmail.toLowerCase());
  const myProperties = properties.filter(p => p.ownerEmail?.toLowerCase() === userEmail.toLowerCase());

  const activeProps = myProperties.filter(p => p.status === "Active");
  const pendingProps = myProperties.filter(p => p.status === "Pending Review");
  const draftProps = myProperties.filter(p => p.status === "Draft");

  const totalInquiries = myProperties.reduce((a, p) => a + (inquiries[p.id]?.length || 0), 0);
  const recentInquiries = myProperties
    .flatMap(p => (inquiries[p.id] || []).map(inq => ({ ...inq, propertyTitle: p.title, propId: p.id })))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4);

  const myNotifs = notifications.filter(n => n.forRole === "broker" || n.forRole === "all").slice(0, 3);

  // Stats definition
  const stats = [
    { label: "Active Listings", value: activeProps.length, icon: Building2, color: "text-indigo", bg: "bg-indigo/10", border: "border-indigo/10" },
    { label: "Total Views", value: activeProps.length * 142 + 258, icon: Eye, color: "text-purple-600", bg: "bg-purple-500/10", border: "border-purple-500/10" },
    { label: "New Leads", value: totalInquiries, icon: MessageSquare, color: "text-terracotta", bg: "bg-terracotta/10", border: "border-terracotta/10" },
    { label: "Saved Properties", value: activeProps.length * 12 + 4, icon: Heart, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/10" },
    { label: "Monthly Revenue", value: "₹45,000", icon: CreditCard, color: "text-emerald-600", bg: "bg-emerald-500/10", border: "border-emerald-500/10" },
    { label: "Subscription Status", value: "Pro Plan", icon: CheckCircle2, color: "text-indigo", bg: "bg-indigo/10", border: "border-indigo/10" }
  ];

  const formatPrice = (v: number) => "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(v);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/60 border border-indigo/10 rounded-3xl p-6 md:p-8 shadow-sm backdrop-blur-sm">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-black text-charcoal leading-tight">
            Welcome back, {brokerProfile?.ownerName?.split(" ")[0] || "Dealer"}
          </h1>
          <p className="text-charcoal/50 text-xs md:text-sm font-semibold mt-1.5">
            Here is a comprehensive summary of your property listings and buyer actions.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dealer/dashboard/add-property"
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo hover:bg-indigo-hover text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-indigo/15"
          >
            <Plus className="w-4 h-4" />
            <span>List New Property</span>
          </Link>
        </div>
      </div>

      {/* 6-Column Key Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white/80 border border-indigo/10 rounded-2xl p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`w-8 h-8 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-serif font-black text-charcoal">{stat.value}</p>
                <p className="text-[9px] font-black text-charcoal/40 uppercase tracking-widest mt-1">{stat.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Performance Charts Section (CSS Visualizations to match public theme) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Chart 1: Property Views */}
        <div className="bg-white/80 border border-indigo/10 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-black text-indigo/40 uppercase tracking-widest">Listing Views</span>
            <h3 className="text-sm font-serif font-black text-charcoal mt-1">Property Views (Weekly)</h3>
          </div>
          <div className="flex items-end gap-3 h-32 mt-6">
            {[35, 52, 48, 70, 62, 85, 95].map((val, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full bg-indigo/10 rounded-t-lg relative group transition-all" style={{ height: `${val}%` }}>
                  <div className="absolute inset-x-0 bottom-0 bg-indigo rounded-t-lg h-0 group-hover:h-full transition-all" />
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-indigo text-white text-[8px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{val}0</span>
                </div>
                <span className="text-[8px] font-bold text-charcoal/40">Day {idx + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Lead Conversion */}
        <div className="bg-white/80 border border-indigo/10 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-black text-indigo/40 uppercase tracking-widest">Performance</span>
            <h3 className="text-sm font-serif font-black text-charcoal mt-1">Lead Conversion</h3>
          </div>
          <div className="space-y-4 mt-6">
            {[
              { label: "Direct Inquiries", percentage: 78, color: "bg-indigo" },
              { label: "Platform Calls", percentage: 54, color: "bg-terracotta" },
              { label: "Site Visits Schedule", percentage: 32, color: "bg-purple-600" },
            ].map(item => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-charcoal/65">{item.label}</span>
                  <span className="text-charcoal">{item.percentage}%</span>
                </div>
                <div className="h-2 bg-indigo/5 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 3: Performance Target */}
        <div className="bg-white/80 border border-indigo/10 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-black text-indigo/40 uppercase tracking-widest">Overview</span>
            <h3 className="text-sm font-serif font-black text-charcoal mt-1">Monthly Conversion Rate</h3>
          </div>
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative w-24 h-24 rounded-full border-[10px] border-indigo/5 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-[10px] border-t-terracotta border-r-terracotta border-b-indigo border-l-indigo animate-spin-slow opacity-80" />
              <div className="text-center">
                <span className="text-lg font-serif font-black text-charcoal">4.8%</span>
                <p className="text-[8px] text-charcoal/40 font-bold uppercase tracking-wider leading-none">Target 5%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Recent Listings */}
        <div className="xl:col-span-2 bg-white/80 border border-indigo/10 rounded-3xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-indigo/5 bg-white/40">
            <h2 className="text-sm font-serif font-black text-charcoal">My Recent Listings</h2>
            <Link href="/dealer/dashboard/properties" className="text-[9px] font-black text-indigo uppercase tracking-wider flex items-center gap-1 hover:underline">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-indigo/5">
            {myProperties.slice(0, 4).length > 0 ? (
              myProperties.slice(0, 4).map(prop => (
                <div key={prop.id} className="flex items-center gap-4 p-4 hover:bg-indigo/5 transition-colors">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 bg-sand/35 border border-indigo/5">
                    <img src={prop.images?.[0] || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=200&q=80"} alt={prop.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-charcoal truncate">{prop.title}</p>
                    <p className="text-[10px] font-semibold text-charcoal/50 mt-0.5">{prop.locality}, {prop.city}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-serif font-black text-indigo">
                      {formatPrice(prop.price)}
                    </p>
                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border mt-1.5 inline-block ${prop.status === "Active" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                        prop.status === "Pending Review" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                          "bg-white/10 text-charcoal/40 border-indigo/5"
                      }`}>
                      {prop.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <Building2 className="w-10 h-10 text-indigo/20 mx-auto mb-3" />
                <p className="text-charcoal/40 text-sm font-semibold">No listings yet</p>
                <Link href="/dealer/dashboard/add-property" className="inline-block mt-3 px-4 py-2 bg-indigo/10 hover:bg-indigo/20 text-indigo text-xs font-black uppercase tracking-wider rounded-xl transition-all">Add property</Link>
              </div>
            )}
          </div>
        </div>

        {/* Notifications and Visits */}
        <div className="space-y-6">

          {/* Quick Actions Card */}
          <div className="bg-white/80 border border-indigo/10 rounded-3xl p-5 shadow-sm space-y-3">
            <h4 className="text-[9px] font-black text-indigo/40 uppercase tracking-widest mb-1.5">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/dealer/dashboard/add-property" className="p-3 bg-indigo/5 border border-indigo/10 rounded-2xl hover:bg-indigo hover:text-white transition-all text-center flex flex-col items-center gap-1.5 group">
                <Plus className="w-4 h-4 text-indigo group-hover:text-white" />
                <span className="text-[10px] font-black uppercase tracking-wide">Add Property</span>
              </Link>
              <Link href="/dealer/dashboard/inquiries" className="p-3 bg-indigo/5 border border-indigo/10 rounded-2xl hover:bg-indigo hover:text-white transition-all text-center flex flex-col items-center gap-1.5 group">
                <MessageCircle className="w-4 h-4 text-indigo group-hover:text-white" />
                <span className="text-[10px] font-black uppercase tracking-wide">Check Leads</span>
              </Link>
            </div>
          </div>

          {/* Upcoming Visits */}
          <div className="bg-white/80 border border-indigo/10 rounded-3xl p-5 shadow-sm">
            <h4 className="text-[9px] font-black text-indigo/40 uppercase tracking-widest mb-4">Upcoming Property Visits</h4>
            <div className="space-y-3">
              {[
                { name: "Rahul Verma", time: "Today at 04:00 PM", property: "Lake-Facing Villa" },
                { name: "Priya Sharma", time: "Tomorrow at 11:30 AM", property: "3 BHK Flat in C-Scheme" }
              ].map((v, i) => (
                <div key={i} className="flex gap-3 p-3 bg-sand/20 border border-indigo/5 rounded-2xl">
                  <Calendar className="w-4 h-4 text-indigo shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-charcoal">{v.name}</p>
                    <p className="text-[10px] text-charcoal/40 mt-0.5">{v.time}</p>
                    <p className="text-[9px] text-indigo font-bold mt-1 uppercase tracking-wide">Re: {v.property}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Recent Inquiries inbox section */}
      {recentInquiries.length > 0 && (
        <div className="bg-white/80 border border-indigo/10 rounded-3xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-indigo/5 bg-white/40">
            <h2 className="text-sm font-serif font-black text-charcoal">Latest Messages</h2>
            <Link href="/dealer/dashboard/inquiries" className="text-[9px] font-black text-indigo uppercase tracking-wider flex items-center gap-1 hover:underline">
              View All Inquiries <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-indigo/5">
            {recentInquiries.map((inq, i) => (
              <div key={i} className="flex items-start gap-4 p-4 hover:bg-indigo/5 transition-colors">
                <div className="w-9 h-9 rounded-2xl bg-indigo/10 border border-indigo/20 flex items-center justify-center text-indigo font-black text-xs shrink-0">
                  {inq.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-charcoal">{inq.name}</p>
                    <p className="text-[9px] text-charcoal/30 font-semibold">{inq.date}</p>
                  </div>
                  <p className="text-[9px] font-bold text-charcoal/50 mt-0.5 uppercase tracking-wide">Re: {inq.propertyTitle}</p>
                  <p className="text-xs text-charcoal/70 font-semibold mt-1 truncate">"{inq.message}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
