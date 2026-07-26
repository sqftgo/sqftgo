"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import {
  MessageSquare,
  Building2,
  MapPin,
  Filter,
  CheckCircle,
} from "lucide-react";
import {
  CustomSelect,
  DashboardPageHeader,
  StatCard,
  KpiGrid,
  ProgressBar,
  Panel,
  Badge,
  Alert,
} from "@/components/ui";
import { filterMyProperties } from "@/lib/ownership";

export default function DealerAnalyticsPage() {
  const { properties, userEmail, userProfile, inquiries } = useApp();

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const myProps = useMemo(() => {
    return filterMyProperties(properties, userProfile?.id, userEmail);
  }, [properties, userProfile?.id, userEmail]);

  const filteredProps = useMemo(() => {
    return myProps.filter((p) => {
      if (categoryFilter !== "all" && p.type !== categoryFilter) return false;
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      return true;
    });
  }, [myProps, categoryFilter, statusFilter]);

  const kpis = useMemo(() => {
    const total = filteredProps.length;
    const active = filteredProps.filter((p) => p.status === "Active").length;
    const totalInqs = filteredProps.reduce(
      (a, p) => a + (inquiries[p.id]?.length || 0),
      0
    );
    return { total, active, totalInqs };
  }, [filteredProps, inquiries]);

  const cityBreakdown = useMemo(() => {
    const data = filteredProps.reduce((acc: Record<string, number>, p) => {
      acc[p.city] = (acc[p.city] || 0) + 1;
      return acc;
    }, {});
    const total = filteredProps.length || 1;
    return Object.entries(data)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({
        name,
        count,
        percent: Math.round((count / total) * 100),
      }));
  }, [filteredProps]);

  const categoryOptions = useMemo(() => {
    const set = new Set(myProps.map((p) => p.type));
    return [
      { label: "All Categories", value: "all" },
      ...Array.from(set).map((cat) => ({ label: cat, value: cat })),
    ];
  }, [myProps]);

  const topListings = useMemo(() => {
    return [...filteredProps]
      .sort(
        (a, b) => (inquiries[b.id]?.length || 0) - (inquiries[a.id]?.length || 0)
      )
      .slice(0, 5);
  }, [filteredProps, inquiries]);

  return (
    <div className="bg-[#faf8f5] min-h-full text-charcoal w-full space-y-6">
      <DashboardPageHeader
        title="Analytics & Trends"
        description="Live metrics from your listings. Historical monthly trends are not stored yet."
        actions={
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <div className="flex items-center gap-1.5 bg-sand/20 border border-indigo/5 px-3 py-2 rounded-xl shrink-0">
              <Filter className="w-3.5 h-3.5 text-indigo" />
              <span className="text-[10px] font-black text-charcoal/45 uppercase tracking-wider">
                Filters
              </span>
            </div>
            <CustomSelect
              options={categoryOptions}
              value={categoryFilter}
              onChange={setCategoryFilter}
              accent="indigo"
              buttonClassName="bg-white border border-indigo/10 text-[10px] font-black uppercase tracking-wider px-4 py-2.5 rounded-xl text-charcoal"
            />
            <CustomSelect
              options={[
                { label: "All Statuses", value: "all" },
                { label: "Active", value: "Active" },
                { label: "Pending Review", value: "Pending Review" },
                { label: "Rejected", value: "Rejected" },
                { label: "Sold / Rented", value: "Sold" },
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              accent="indigo"
              buttonClassName="bg-white border border-indigo/10 text-[10px] font-black uppercase tracking-wider px-4 py-2.5 rounded-xl text-charcoal"
            />
          </div>
        }
      />

      <KpiGrid className="lg:grid-cols-3 xl:grid-cols-3">
        <StatCard
          label="Your listings"
          value={kpis.total}
          hint="Matching current filters"
          tone="indigo"
          icon={<Building2 className="w-4 h-4" />}
        />
        <StatCard
          label="Active Live"
          value={kpis.active}
          hint="Status = Active"
          tone="success"
          icon={<CheckCircle className="w-4 h-4" />}
        />
        <StatCard
          label="Customer Inquiries"
          value={kpis.totalInqs}
          hint="On filtered listings"
          tone="terracotta"
          icon={<MessageSquare className="w-4 h-4" />}
        />
      </KpiGrid>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Panel
          className="lg:col-span-8"
          title="Monthly enquiry trends"
          description="Not available"
        >
          <Alert
            variant="warning"
            title="No fabricated charts"
            description="Historical monthly inquiry series are not stored yet. KPIs above use your live listing and inquiry data."
          />
        </Panel>

        <Panel
          className="lg:col-span-4"
          title="Geographical Breakdown"
          description="Listings allocation by city hubs"
        >
          {cityBreakdown.length === 0 ? (
            <div className="flex items-center justify-center py-6 text-charcoal/30 text-xs font-semibold">
              No city records found.
            </div>
          ) : (
            <div className="space-y-4">
              {cityBreakdown.slice(0, 4).map((city) => (
                <div key={city.name} className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-bold text-charcoal">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-indigo/60" />
                      {city.name}
                    </span>
                    <span className="text-charcoal/40 font-semibold">
                      {city.count} listings ({city.percent}%)
                    </span>
                  </div>
                  <ProgressBar value={city.percent} tone="indigo" label={city.name} />
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      <Panel
        title="Top Sourced Listings"
        description="Ranked by total customer inquiries"
        padding="none"
      >
        {topListings.length === 0 ? (
          <div className="p-6 text-xs text-charcoal/40 font-semibold">No listings yet.</div>
        ) : (
          <div className="divide-y divide-indigo/5">
            {topListings.map((p) => (
              <div
                key={p.id}
                className="px-5 py-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-charcoal truncate">{p.title}</p>
                  <p className="text-[10px] text-charcoal/40 font-semibold">
                    {p.city} · {p.status}
                  </p>
                </div>
                <Badge tone="primary" size="sm">
                  {inquiries[p.id]?.length || 0} inquiries
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
