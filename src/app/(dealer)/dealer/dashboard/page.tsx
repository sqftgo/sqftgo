"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { usePropertiesQuery } from "@/hooks";
import {
  Building2,
  MessageSquare,
  Plus,
  ArrowUpRight,
  Calendar,
  MessageCircle,
  BarChart3,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  DashboardPageHeader,
  StatCard,
  KpiGrid,
  Badge,
  Avatar,
  Panel,
  Button,
  GlobalLoading,
} from "@/components/ui";
import { findMyDirectoryProfile } from "@/lib/ownership";

export default function DealerDashboardPage() {
  const {
    inquiries,
    userEmail,
    userProfile,
    directoryProfiles,
    visits,
    updateVisit,
  } = useApp();

  const mineQuery = usePropertiesQuery({ mine: true, limit: 100, offset: 0 });
  const myProperties = mineQuery.data?.items ?? [];

  const brokerProfile = findMyDirectoryProfile(
    directoryProfiles,
    userProfile?.id,
    userEmail
  );

  const propertyTitles = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of myProperties) map.set(p.id, p.title);
    return map;
  }, [myProperties]);

  const activeProps = myProperties.filter((p) => p.status === "Active");

  const totalInquiries = useMemo(
    () => Object.values(inquiries).reduce((a, rows) => a + rows.length, 0),
    [inquiries]
  );

  const recentInquiries = useMemo(
    () =>
      Object.entries(inquiries)
        .flatMap(([propId, rows]) =>
          rows.map((inq) => ({
            ...inq,
            propertyTitle: propertyTitles.get(propId) ?? "Property",
            propId,
          }))
        )
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 4),
    [inquiries, propertyTitles]
  );

  const myPropertyIds = useMemo(
    () => new Set(myProperties.map((p) => p.id)),
    [myProperties]
  );

  const myVisits = useMemo(
    () => visits.filter((v) => myPropertyIds.has(v.propertyId)),
    [visits, myPropertyIds]
  );

  const upcomingVisits = myVisits
    .filter((v) => v.status === "Pending Approval" || v.status === "Confirmed")
    .slice(0, 5);

  const siteVisitCount = myVisits.length;

  const stats = [
    { label: "Active Listings", value: activeProps.length, icon: Building2, tone: "default" as const },
    { label: "New Leads", value: totalInquiries, icon: MessageSquare, tone: "default" as const },
    { label: "Site Visits", value: siteVisitCount, icon: Calendar, tone: "default" as const },
  ];

  const formatPrice = (v: number) => "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(v);

  if (mineQuery.isPending && !mineQuery.data) {
    return <GlobalLoading label="Loading dashboard…" />;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
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

      <KpiGrid className="lg:grid-cols-3 xl:grid-cols-3">
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
          <Panel title="Analytics Summary" description="Your listing performance" padding="lg">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-charcoal/60 font-semibold">Active listings</span>
                <span className="font-black text-indigo">{activeProps.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-charcoal/60 font-semibold">Total inquiries</span>
                <span className="font-black text-indigo">{totalInquiries}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-charcoal/60 font-semibold">Site visits</span>
                <span className="font-black text-indigo">{siteVisitCount}</span>
              </div>
              <p className="text-[10px] text-charcoal/40 font-semibold pt-1">
                Property view tracking is not available yet.
              </p>
              <Link
                href="/dealer/dashboard/analytics"
                className="inline-flex items-center gap-1.5 mt-2 text-[10px] font-black uppercase tracking-wider text-indigo hover:underline"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                View full analytics
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Panel>

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
