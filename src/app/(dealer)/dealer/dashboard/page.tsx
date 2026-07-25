"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import {
  Building2,
  MessageSquare,
  Eye,
  Plus,
  ArrowUpRight,
  CheckCircle2,
  Heart,
  CreditCard,
  Calendar,
  MessageCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  DashboardPageHeader,
  StatCard,
  KpiGrid,
  Badge,
  Avatar,
  ProgressBar,
  Panel,
  Button,
} from "@/components/ui";

export default function DealerDashboardPage() {
  const {
    properties,
    inquiries,
    userEmail,
    directoryProfiles,
    visits,
    updateVisit,
  } = useApp();

  const brokerProfile = directoryProfiles.find(
    (p) => p.email.toLowerCase() === userEmail.toLowerCase()
  );
  const myProperties = properties.filter(
    (p) => p.ownerEmail?.toLowerCase() === userEmail.toLowerCase()
  );

  const activeProps = myProperties.filter((p) => p.status === "Active");

  const totalInquiries = myProperties.reduce(
    (a, p) => a + (inquiries[p.id]?.length || 0),
    0
  );
  const recentInquiries = myProperties
    .flatMap((p) =>
      (inquiries[p.id] || []).map((inq) => ({
        ...inq,
        propertyTitle: p.title,
        propId: p.id,
      }))
    )
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4);

  const upcomingVisits = visits
    .filter((v) => v.status === "Pending Approval" || v.status === "Confirmed")
    .slice(0, 5);

  const stats = [
    { label: "Active Listings", value: activeProps.length, icon: Building2, tone: "default" as const },
    { label: "Total Views", value: activeProps.length * 142 + 258, icon: Eye, tone: "default" as const },
    { label: "New Leads", value: totalInquiries, icon: MessageSquare, tone: "default" as const },
    { label: "Saved Properties", value: activeProps.length * 12 + 4, icon: Heart, tone: "default" as const },
    { label: "Monthly Revenue", value: "₹45,000", icon: CreditCard, tone: "default" as const },
    { label: "Subscription Status", value: "Pro Plan", icon: CheckCircle2, tone: "default" as const }
  ];

  const formatPrice = (v: number) => "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(v);

  const conversionItems = [
    { label: "Direct Inquiries", percentage: 78, tone: "indigo" as const },
    { label: "Platform Calls", percentage: 54, tone: "terracotta" as const },
    { label: "Site Visits Schedule", percentage: 32, tone: "purple" as const },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <DashboardPageHeader
        title={`Welcome back, ${brokerProfile?.ownerName?.split(" ")[0] || "Dealer"}`}
        description="Here is a comprehensive summary of your property listings and buyer actions."
        actions={
          <Link href="/dealer/dashboard/add-property">
            <Button variant="secondary" size="md" className="shadow-md shadow-indigo/15">
              <Plus className="w-4 h-4" />
              List New Property
            </Button>
          </Link>
        }
      />

      <KpiGrid className="lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <StatCard
                label={stat.label}
                value={stat.value}
                tone={stat.tone}
                icon={<Icon className="w-4 h-4" />}
                className="p-4"
              />
            </motion.div>
          );
        })}
      </KpiGrid>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Panel title="Property Views (Weekly)" description="Listing Views" padding="lg">
          <div className="flex items-end gap-3 h-32 mt-2">
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
        </Panel>

        <Panel title="Lead Conversion" description="Performance" padding="lg">
          <div className="space-y-4 mt-2">
            {conversionItems.map(item => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-charcoal/65">{item.label}</span>
                  <span className="text-charcoal">{item.percentage}%</span>
                </div>
                <ProgressBar value={item.percentage} tone={item.tone} label={item.label} />
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Monthly Conversion Rate" description="Overview" padding="lg">
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative w-24 h-24 rounded-full border-[10px] border-indigo/5 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-[10px] border-t-terracotta border-r-terracotta border-b-indigo border-l-indigo animate-spin-slow opacity-80" />
              <div className="text-center">
                <span className="text-lg font-serif font-black text-charcoal">4.8%</span>
                <p className="text-[8px] text-charcoal/40 font-bold uppercase tracking-wider leading-none">Target 5%</p>
              </div>
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Panel
          className="xl:col-span-2"
          title="My Recent Listings"
          padding="none"
          actions={
            <Link href="/dealer/dashboard/properties" className="text-[9px] font-black text-indigo uppercase tracking-wider flex items-center gap-1 hover:underline">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          }
        >
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
                    <Badge status={prop.status} size="sm" className="mt-1.5">
                      {prop.status}
                    </Badge>
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
        </Panel>

        <div className="space-y-6">
          <Panel title="Quick Actions" padding="md">
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
          </Panel>

          <Panel title="Upcoming Property Visits" padding="md">
            <div className="space-y-3">
              {upcomingVisits.length === 0 ? (
                <p className="text-xs text-charcoal/40 font-semibold text-center py-6">
                  No upcoming tours yet.
                </p>
              ) : (
                upcomingVisits.map((v) => (
                  <div
                    key={v.id}
                    className="flex gap-3 p-3 bg-sand/20 border border-indigo/5 rounded-2xl"
                  >
                    <Calendar className="w-4 h-4 text-indigo shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-charcoal truncate">{v.visitorName}</p>
                        <Badge status={v.status} size="sm">
                          {v.status}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-charcoal/40 mt-0.5">
                        {v.date} at {v.time}
                      </p>
                      <p className="text-[9px] text-indigo font-bold mt-1 uppercase tracking-wide truncate">
                        Re: {v.propertyTitle}
                      </p>
                      {v.status === "Pending Approval" ? (
                        <button
                          type="button"
                          onClick={() => {
                            void updateVisit(v.id, { status: "Confirmed" });
                          }}
                          className="mt-2 text-[10px] font-black uppercase tracking-wider text-emerald-600 hover:underline"
                        >
                          Confirm Tour
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Panel>
        </div>
      </div>

      {recentInquiries.length > 0 && (
        <Panel
          title="Latest Messages"
          padding="none"
          actions={
            <Link href="/dealer/dashboard/inquiries" className="text-[9px] font-black text-indigo uppercase tracking-wider flex items-center gap-1 hover:underline">
              View All Inquiries <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          }
        >
          <div className="divide-y divide-indigo/5">
            {recentInquiries.map((inq, i) => (
              <div key={i} className="flex items-start gap-4 p-4 hover:bg-indigo/5 transition-colors">
                <Avatar name={inq.name} size="md" shape="rounded" tone="indigo" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-charcoal">{inq.name}</p>
                    <p className="text-[9px] text-charcoal/30 font-semibold">{inq.date}</p>
                  </div>
                  <p className="text-[9px] font-bold text-charcoal/50 mt-0.5 uppercase tracking-wide">Re: {inq.propertyTitle}</p>
                  <p className="text-xs text-charcoal/70 font-semibold mt-1 truncate">&ldquo;{inq.message}&rdquo;</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
