"use client";

import React, { useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { isAgentOrConsultantCategory } from "@/features/dealers";
import { Users, Building2, MessageSquare, Printer } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  DashboardPageHeader,
  StatCard,
  KpiGrid,
  Avatar,
  Panel,
  Button,
  CityDonutChart,
  MonthlyTrendChart,
} from "@/components/ui";

const TYPE_COLORS = [
  "#1b3864",
  "#c95b3c",
  "#2f6b4f",
  "#7a5c2e",
  "#4a6fa5",
  "#8b4513",
  "#467e54",
  "#dfab34",
];

function TypeBarTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload?: { name: string; count: number } }[];
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;
  return (
    <div className="rounded-xl border border-indigo/10 bg-white px-3 py-2 shadow-lg shadow-indigo/10">
      <p className="text-[10px] font-black uppercase tracking-wider text-charcoal/40">
        {row.name}
      </p>
      <p className="mt-0.5 text-sm font-serif font-black text-indigo">
        {row.count} {row.count === 1 ? "listing" : "listings"}
      </p>
    </div>
  );
}

export default function AdminReportsPage() {
  const { properties, adminUsers, inquiries, enquiries, directoryProfiles } = useApp();

  const reportProperties = useMemo(
    () => properties.filter((p) => p.status !== "Draft"),
    [properties]
  );
  const totalInquiries = Object.values(inquiries).reduce((a, b) => a + b.length, 0);
  const totalEnquiries = enquiries.length;
  const activeProperties = reportProperties.filter((p) => p.status === "Active").length;
  const totalDealers = directoryProfiles.filter((p) =>
    isAgentOrConsultantCategory(p.category)
  ).length;
  const totalUsers = adminUsers.filter((u) => u.role === "user").length;

  const cityShare = useMemo(() => {
    const counts = reportProperties.reduce((acc: Record<string, number>, p) => {
      acc[p.city] = (acc[p.city] || 0) + 1;
      return acc;
    }, {});
    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        percent: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }, [reportProperties]);

  const typeBars = useMemo(() => {
    const counts = reportProperties.reduce((acc: Record<string, number>, p) => {
      acc[p.type] = (acc[p.type] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [reportProperties]);

  const monthlyEnquiries = useMemo(() => {
    const buckets = new Map<string, number>();
    const bump = (raw: string | undefined) => {
      if (!raw) return;
      const d = new Date(raw);
      if (Number.isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    };

    for (const enq of enquiries) bump(enq.date);
    for (const rows of Object.values(inquiries)) {
      for (const row of rows) bump(row.date);
    }

    const now = new Date();
    const months: { month: string; count: number }[] = [];
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months.push({ month: key, count: buckets.get(key) ?? 0 });
    }
    return months;
  }, [enquiries, inquiries]);

  const generatedAt = new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="print:hidden">
        <DashboardPageHeader
          title="Reports"
          description="Platform data summary"
          actions={
            <Button variant="primary" size="sm" onClick={handlePrintPdf} className="gap-2">
              <Printer className="w-4 h-4" /> Print PDF
            </Button>
          }
        />
      </div>

      <div className="space-y-8 print-report">
        <div className="hidden print:block mb-6 border-b border-charcoal/20 pb-4">
          <p className="font-logo text-lg text-indigo">SqftGo</p>
          <h1 className="font-serif font-black text-2xl text-charcoal mt-1">
            Platform Report
          </h1>
          <p className="text-xs text-charcoal/50 font-semibold mt-1">
            Generated {generatedAt}
          </p>
        </div>

        <KpiGrid>
          <StatCard
            label="Total Users"
            value={totalUsers}
            icon={<Users className="w-4 h-4 text-indigo" />}
            tone="indigo"
          />
          <StatCard
            label="Registered Dealers"
            value={totalDealers}
            icon={<Users className="w-4 h-4 text-indigo/70" />}
          />
          <StatCard
            label="Active Listings"
            value={activeProperties}
            icon={<Building2 className="w-4 h-4 text-emerald-600" />}
            tone="success"
          />
          <StatCard
            label="Total Inquiries"
            value={totalInquiries + totalEnquiries}
            icon={<MessageSquare className="w-4 h-4 text-terracotta" />}
            tone="terracotta"
          />
        </KpiGrid>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Panel title="Enquiry Trend" description="Last 6 months" padding="md" rounded="2xl" className="xl:col-span-2">
            <MonthlyTrendChart data={monthlyEnquiries} height={240} />
          </Panel>

          <Panel title="Listings by City" description="Share of inventory" padding="md" rounded="2xl">
            <CityDonutChart data={cityShare} height={180} />
          </Panel>
        </div>

        <Panel title="Listings by Type" description="Property category breakdown" padding="md" rounded="2xl">
          {typeBars.length === 0 ? (
            <p className="text-xs text-charcoal/40 font-semibold py-8 text-center">
              No listing data.
            </p>
          ) : (
            <div className="w-full h-72 print:hidden">
              <ResponsiveContainer>
                <BarChart
                  data={typeBars}
                  margin={{ top: 8, right: 8, left: -12, bottom: 48 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 6"
                    vertical={false}
                    stroke="rgba(27, 56, 100, 0.08)"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    angle={-28}
                    textAnchor="end"
                    height={60}
                    tick={{
                      fill: "rgba(28, 25, 23, 0.45)",
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  />
                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    width={36}
                    tick={{
                      fill: "rgba(28, 25, 23, 0.35)",
                      fontSize: 10,
                      fontWeight: 600,
                    }}
                  />
                  <Tooltip content={<TypeBarTooltip />} cursor={{ fill: "rgba(27, 56, 100, 0.04)" }} />
                  <Bar dataKey="count" radius={[8, 8, 4, 4]} maxBarSize={48}>
                    {typeBars.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={TYPE_COLORS[index % TYPE_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          {/* Print-friendly fallback table */}
          <div className="hidden print:block space-y-2">
            {typeBars.map((row) => (
              <div key={row.name} className="flex justify-between text-xs font-semibold">
                <span>{row.name}</span>
                <span>{row.count}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Recent General Enquiries" padding="none" rounded="2xl">
          <div className="divide-y divide-indigo/5">
            {enquiries.slice(0, 8).map((enq) => (
              <div
                key={enq.id}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-indigo/5 transition-colors print:hover:bg-transparent"
              >
                <Avatar name={enq.name} size="sm" className="print:hidden" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-charcoal">{enq.name}</p>
                  <p className="text-[10px] text-charcoal/50 font-semibold truncate">
                    {(enq.message || enq.remarks || "").slice(0, 60)}
                    {(enq.message || enq.remarks || "").length > 60 ? "..." : ""}
                  </p>
                </div>
                <span className="text-[9px] text-charcoal/40 font-semibold shrink-0">
                  {enq.date}
                </span>
              </div>
            ))}
            {enquiries.length === 0 && (
              <div className="p-8 text-center text-charcoal/40 text-sm font-semibold">
                No general enquiries yet.
              </div>
            )}
          </div>
        </Panel>

        <div className="hidden print:block pt-6 border-t border-charcoal/15 text-[10px] text-charcoal/45 font-semibold">
          SqftGo Admin · Confidential platform summary · Page generated for print/PDF
        </div>
      </div>
    </div>
  );
}
