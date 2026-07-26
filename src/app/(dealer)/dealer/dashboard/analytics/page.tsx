"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { platformService } from "@/services";
import type { DealerAnalytics } from "@/types";
import {
  MessageSquare,
  Building2,
  Filter,
  CheckCircle,
  Calendar,
} from "lucide-react";
import {
  CustomSelect,
  DashboardPageHeader,
  StatCard,
  KpiGrid,
  MonthlyTrendChart,
  CityDonutChart,
  Panel,
  Badge,
  GlobalLoading,
  ErrorState,
} from "@/components/ui";

export default function DealerAnalyticsPage() {
  const [data, setData] = useState<DealerAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const analytics = await platformService.getDealerAnalytics();
      setData(analytics);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredListings = useMemo(() => {
    if (!data) return [];
    return data.listings.filter((p) => {
      if (categoryFilter !== "all" && p.type !== categoryFilter) return false;
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      return true;
    });
  }, [data, categoryFilter, statusFilter]);

  const filtersActive = categoryFilter !== "all" || statusFilter !== "all";

  const kpis = useMemo(() => {
    if (!data) return null;
    if (!filtersActive) {
      return {
        total: data.listingsTotal,
        active: data.listingsActive,
        inquiries: data.inquiriesTotal,
        visits: data.visitsTotal,
      };
    }
    return {
      total: filteredListings.length,
      active: filteredListings.filter((p) => p.status === "Active").length,
      inquiries: filteredListings.reduce((sum, p) => sum + p.inquiryCount, 0),
      // Visits are not filterable per listing in the API yet.
      visits: null as number | null,
    };
  }, [data, filteredListings, filtersActive]);

  const cityBreakdown = useMemo(() => {
    const total = filteredListings.length || 1;
    const cityMap = new Map<string, number>();
    for (const p of filteredListings) {
      cityMap.set(p.city, (cityMap.get(p.city) ?? 0) + 1);
    }
    return [...cityMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({
        name,
        count,
        percent: Math.round((count / total) * 100),
      }));
  }, [filteredListings]);

  const categoryOptions = useMemo(() => {
    if (!data) return [{ label: "All Categories", value: "all" }];
    const set = new Set(data.listings.map((p) => p.type));
    return [
      { label: "All Categories", value: "all" },
      ...Array.from(set).map((cat) => ({ label: cat, value: cat })),
    ];
  }, [data]);

  const topListings = useMemo(() => {
    return [...filteredListings]
      .sort((a, b) => b.inquiryCount - a.inquiryCount)
      .slice(0, 5);
  }, [filteredListings]);

  if (loading) {
    return <GlobalLoading label="Loading your analytics…" />;
  }

  if (error) {
    return (
      <ErrorState
        title="Analytics unavailable"
        message={error}
        onRetry={() => void load()}
      />
    );
  }

  if (!data || !kpis) {
    return (
      <ErrorState
        title="Analytics unavailable"
        message="No analytics data returned."
        onRetry={() => void load()}
      />
    );
  }

  return (
    <div className="bg-[#faf8f5] min-h-full text-charcoal w-full space-y-6">
      <DashboardPageHeader
        title="Analytics & Trends"
        description="Live metrics from your listings and inquiries."
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
                { label: "Draft", value: "Draft" },
                { label: "Rejected", value: "Rejected" },
                { label: "Sold", value: "Sold" },
                { label: "Rented", value: "Rented" },
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              accent="indigo"
              buttonClassName="bg-white border border-indigo/10 text-[10px] font-black uppercase tracking-wider px-4 py-2.5 rounded-xl text-charcoal"
            />
          </div>
        }
      />

      <KpiGrid>
        <StatCard
          label="Your listings"
          value={kpis.total}
          hint={
            categoryFilter === "all" && statusFilter === "all"
              ? "All your properties"
              : "Matching current filters"
          }
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
          value={kpis.inquiries}
          hint={
            categoryFilter === "all" && statusFilter === "all"
              ? "All property inquiries"
              : "On filtered listings"
          }
          tone="terracotta"
          icon={<MessageSquare className="w-4 h-4" />}
        />
        <StatCard
          label="Site Visits"
          value={kpis.visits ?? "—"}
          hint={
            filtersActive
              ? "Clear filters to see visit totals"
              : `${data.visitsPending} pending · ${data.visitsConfirmed} confirmed`
          }
          tone="warning"
          icon={<Calendar className="w-4 h-4" />}
        />
      </KpiGrid>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Panel
          className="lg:col-span-8"
          title="Monthly enquiry trends"
          description="Last 6 months from your property inquiries"
        >
          <MonthlyTrendChart data={data.monthlyInquiries} height={240} />
        </Panel>

        <Panel
          className="lg:col-span-4"
          title="Geographical Breakdown"
          description="Listings allocation by city hubs"
        >
          <CityDonutChart data={cityBreakdown} height={168} />
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
                  {p.inquiryCount} inquiries
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
