"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { 
  TrendingUp, 
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
} from "@/components/ui";

const MONTHLY_TREND = [
  { month: "Jan", value: 12 },
  { month: "Feb", value: 18 },
  { month: "Mar", value: 15 },
  { month: "Apr", value: 24 },
  { month: "May", value: 30 },
  { month: "Jun", value: 22 },
  { month: "Jul", value: 35 },
  { month: "Aug", value: 28 },
  { month: "Sep", value: 42 },
  { month: "Oct", value: 38 },
  { month: "Nov", value: 48 },
  { month: "Dec", value: 40 }
];

export default function DealerAnalyticsPage() {
  const { properties, userEmail, inquiries } = useApp();

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeMonthIdx, setActiveMonthIdx] = useState<number | null>(null);

  const myProps = useMemo(() => {
    return properties.filter(p => p.ownerEmail?.toLowerCase() === userEmail.toLowerCase());
  }, [properties, userEmail]);

  const filteredProps = useMemo(() => {
    return myProps.filter(p => {
      if (categoryFilter !== "all" && p.type !== categoryFilter) return false;
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      return true;
    });
  }, [myProps, categoryFilter, statusFilter]);

  const kpis = useMemo(() => {
    const total = filteredProps.length;
    const active = filteredProps.filter(p => p.status === "Active").length;
    const totalInqs = filteredProps.reduce((a, p) => a + (inquiries[p.id]?.length || 0), 0);
    const inqRate = total > 0 ? (totalInqs / total).toFixed(1) : "0.0";

    return { total, active, totalInqs, inqRate };
  }, [filteredProps, inquiries]);

  const cityBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    filteredProps.forEach(p => { map[p.city] = (map[p.city] || 0) + 1; });
    
    const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);
    const totalVal = sorted.reduce((sum, [, count]) => sum + count, 0);

    return sorted.map(([name, count]) => ({
      name,
      count,
      percent: totalVal > 0 ? Math.round((count / totalVal) * 100) : 0
    }));
  }, [filteredProps]);

  const topProperties = useMemo(() => {
    return [...filteredProps]
      .sort((a, b) => (inquiries[b.id]?.length || 0) - (inquiries[a.id]?.length || 0))
      .slice(0, 5);
  }, [filteredProps, inquiries]);

  const chartHeight = 160;
  const chartWidth = 500;
  const xOffset = 30;
  const yOffset = 20;
  const graphWidth = chartWidth - xOffset * 2;
  const graphHeight = chartHeight - yOffset * 2;

  const maxVal = Math.max(...MONTHLY_TREND.map(d => d.value), 1);

  const points = useMemo(() => {
    return MONTHLY_TREND.map((d, i) => {
      const x = xOffset + (i / (MONTHLY_TREND.length - 1)) * graphWidth;
      const y = (chartHeight - yOffset) - (d.value / maxVal) * graphHeight;
      return { x, y, value: d.value, month: d.month };
    });
  }, [maxVal, graphWidth, graphHeight]);

  const linePath = useMemo(() => {
    if (points.length === 0) return "";
    return points.reduce((acc, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, "");
  }, [points]);

  const areaPath = useMemo(() => {
    if (points.length === 0) return "";
    return `${linePath} L ${points[points.length - 1].x} ${chartHeight - yOffset} L ${points[0].x} ${chartHeight - yOffset} Z`;
  }, [points, linePath]);

  const categoryOptions = useMemo(() => {
    const set = new Set(myProps.map(p => p.type));
    return [
      { label: "All Categories", value: "all" },
      ...Array.from(set).map(cat => ({ label: cat, value: cat }))
    ];
  }, [myProps]);

  return (
    <div className="p-6 md:p-8 bg-[#faf8f5] min-h-screen text-charcoal w-full space-y-6">
      <DashboardPageHeader
        title="Analytics & Trends"
        description="Analyze real-time inquiries, listings metrics, and conversions."
        actions={
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <div className="flex items-center gap-1.5 bg-sand/20 border border-indigo/5 px-3 py-2 rounded-xl shrink-0">
              <Filter className="w-3.5 h-3.5 text-indigo" />
              <span className="text-[10px] font-black text-charcoal/45 uppercase tracking-wider">Filters</span>
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

      <KpiGrid>
        <StatCard
          label="Total Sourced"
          value={kpis.total}
          hint="+12% MoM"
          tone="indigo"
          icon={<Building2 className="w-4 h-4" />}
        />
        <StatCard
          label="Active Live"
          value={kpis.active}
          hint="Live listings indexed"
          tone="success"
          icon={<CheckCircle className="w-4 h-4" />}
        />
        <StatCard
          label="Customer Inquiries"
          value={kpis.totalInqs}
          hint="+18% leads"
          tone="terracotta"
          icon={<MessageSquare className="w-4 h-4" />}
        />
        <StatCard
          label="Average Leads / listing"
          value={kpis.inqRate}
          hint="Average conversion ratio"
          tone="default"
          icon={<TrendingUp className="w-4 h-4" />}
        />
      </KpiGrid>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Panel
          className="lg:col-span-8"
          title="Monthly Enquiry Trends (2026)"
          description="Interaction frequency across active listings"
          actions={
            activeMonthIdx !== null ? (
              <Badge tone="primary" size="sm">
                {MONTHLY_TREND[activeMonthIdx].month}: {MONTHLY_TREND[activeMonthIdx].value} Inquiries
              </Badge>
            ) : undefined
          }
        >
          <div className="w-full relative">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-full select-none"
            >
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1b3864" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#1b3864" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {[0, 0.25, 0.5, 0.75, 1].map((val, idx) => {
                const y = yOffset + val * graphHeight;
                return (
                  <line
                    key={idx}
                    x1={xOffset}
                    y1={y}
                    x2={chartWidth - xOffset}
                    y2={y}
                    stroke="#1b3864"
                    strokeOpacity="0.05"
                    strokeDasharray="4 4"
                  />
                );
              })}

              {points.map((p, i) => (
                <text
                  key={i}
                  x={p.x}
                  y={chartHeight - 4}
                  textAnchor="middle"
                  className="text-[8px] font-bold fill-charcoal/40"
                >
                  {p.month}
                </text>
              ))}

              <path d={areaPath} fill="url(#areaGrad)" />
              <path d={linePath} fill="none" stroke="#1b3864" strokeWidth="2.5" strokeLinecap="round" />

              {points.map((p, i) => {
                const active = activeMonthIdx === i;
                return (
                  <g key={i}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={active ? 5 : 3.5}
                      className={`transition-all ${
                        active 
                          ? "fill-indigo stroke-white stroke-2 shadow-lg" 
                          : "fill-white stroke-indigo stroke-2 cursor-pointer hover:fill-indigo"
                      }`}
                      onMouseEnter={() => setActiveMonthIdx(i)}
                      onMouseLeave={() => setActiveMonthIdx(null)}
                    />
                  </g>
                );
              })}
            </svg>
          </div>
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
                    <span className="text-charcoal/40 font-semibold">{city.count} listings ({city.percent}%)</span>
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
        actions={
          <Badge tone="primary" size="sm">Popular Items</Badge>
        }
      >
        {topProperties.length === 0 ? (
          <div className="p-12 text-center text-charcoal/30 text-xs font-semibold">
            No properties matching search conditions.
          </div>
        ) : (
          <div className="divide-y divide-indigo/5">
            {topProperties.map((prop, index) => {
              const count = inquiries[prop.id]?.length || 0;
              const maxInquiries = Math.max(...topProperties.map(p => inquiries[p.id]?.length || 0), 1);
              const progressPct = Math.round((count / maxInquiries) * 100);

              return (
                <div 
                  key={prop.id}
                  className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:bg-indigo/[0.015] transition-colors"
                >
                  <div className="flex items-center gap-3 w-full sm:w-auto sm:flex-1 min-w-0">
                    <span className="text-charcoal/25 font-black text-xs w-6 shrink-0 text-center">
                      #0{index + 1}
                    </span>
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-indigo/10 bg-sand/20 shrink-0">
                      <img 
                        src={prop.images?.[0] || "/placeholder.png"} 
                        alt="" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs font-bold text-charcoal truncate">{prop.title}</h3>
                      <div className="flex items-center gap-1 mt-0.5 text-charcoal/40 text-[9px] font-semibold">
                        <MapPin className="w-3 h-3" />
                        <span>{prop.locality}, {prop.city}</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full sm:w-48 flex items-center gap-3 pt-2 sm:pt-0">
                    <ProgressBar value={progressPct} tone="indigo" size="sm" className="flex-1" label={`${prop.title} leads`} />
                    <Badge tone="primary" size="sm" className="shrink-0">
                      {count} Leads
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );
}
