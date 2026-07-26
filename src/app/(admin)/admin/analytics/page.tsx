"use client";

import React, { useEffect, useMemo, useState } from "react";
import { platformService } from "@/services";
import type { PlatformAnalytics } from "@/types";
import {
  Users,
  Building2,
  MessageSquare,
  DollarSign,
  Clock,
} from "lucide-react";
import {
  DashboardPageHeader,
  StatCard,
  KpiGrid,
  MonthlyTrendChart,
  CityDonutChart,
  Panel,
  DataTable,
  Alert,
  type DataTableColumn,
} from "@/components/ui";

type InquiryRow = PlatformAnalytics["recentInquiries"][number];

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<PlatformAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const analytics = await platformService.getAnalytics();
        if (!cancelled) setData(analytics);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load analytics");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const cityShare = useMemo(() => {
    if (!data) return [];
    const total = data.activeListings || 1;
    return data.cityBreakdown.map((row) => ({
      name: row.city,
      count: row.count,
      percent: Math.round((row.count / total) * 100),
    }));
  }, [data]);

  const columns: DataTableColumn<InquiryRow>[] = [
    {
      key: "user",
      header: "Client",
      render: (inq) => (
        <div>
          <p className="font-bold text-charcoal">{inq.name}</p>
          <p className="text-[9px] text-charcoal/40 font-semibold mt-0.5">
            {inq.email}
          </p>
        </div>
      ),
    },
    {
      key: "property",
      header: "Property",
      render: (inq) => (
        <p className="font-bold text-charcoal truncate max-w-[200px]" title={inq.propertyTitle}>
          {inq.propertyTitle}
        </p>
      ),
    },
    {
      key: "message",
      header: "Message",
      render: (inq) => (
        <p className="text-charcoal/60 truncate max-w-[300px]" title={inq.message}>
          {inq.message}
        </p>
      ),
    },
    {
      key: "date",
      header: "Date",
      className: "text-right",
      render: (inq) => (
        <span className="text-[9px] font-black text-charcoal/30 bg-sand/30 border border-indigo/5 px-2 py-0.5 rounded-md">
          {inq.date}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6 md:p-8 bg-[#faf8f5] min-h-screen text-charcoal w-full space-y-6">
      <DashboardPageHeader
        title="Platform Analytics"
        description="Live aggregates from Supabase (profiles, listings, inquiries)."
      />

      {error ? (
        <Alert variant="danger" title="Analytics unavailable" description={error} />
      ) : null}
      {loading ? (
        <Alert variant="info" title="Loading" description="Querying database aggregates…" />
      ) : null}

      {data ? (
        <>
          <KpiGrid>
            <StatCard
              label="Registered accounts"
              value={data.accounts}
              hint="profiles count"
              tone="indigo"
              icon={<Users className="w-4 h-4" />}
            />
            <StatCard
              label="Active listings"
              value={data.activeListings}
              hint={`${data.pendingReview} pending review`}
              tone="success"
              icon={<Building2 className="w-4 h-4" />}
            />
            <StatCard
              label="Enquiry threads"
              value={data.propertyInquiries + data.generalEnquiries}
              hint="Property + general"
              tone="terracotta"
              icon={<MessageSquare className="w-4 h-4" />}
            />
            <StatCard
              label="Listed inventory value"
              value={`₹${(data.inventoryValueSum / 10000000).toFixed(1)}Cr`}
              hint="Sum of active prices (not revenue)"
              tone="warning"
              icon={<DollarSign className="w-4 h-4" />}
            />
          </KpiGrid>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Panel
              className="lg:col-span-8"
              title="Monthly property inquiries"
              description="Last 6 months from property_inquiries.created_at"
            >
              <MonthlyTrendChart data={data.monthlyInquiries} height={240} />
            </Panel>

            <Panel
              className="lg:col-span-4"
              title="Active listings by city"
              description="Current inventory"
            >
              <CityDonutChart data={cityShare} height={168} />
            </Panel>
          </div>

          <KpiGrid>
            <StatCard
              label="Directory profiles"
              value={data.dealers}
              tone="indigo"
              icon={<Users className="w-4 h-4" />}
            />
            <StatCard
              label="Site visits booked"
              value={data.siteVisits}
              tone="terracotta"
              icon={<Clock className="w-4 h-4" />}
            />
          </KpiGrid>

          <Panel title="Recent property inquiries" description="Latest five">
            <DataTable
              columns={columns}
              rows={data.recentInquiries}
              rowKey={(r) => r.id}
              emptyMessage="No property inquiries yet."
            />
          </Panel>
        </>
      ) : null}
    </div>
  );
}
