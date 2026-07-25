"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { 
  Users, 
  Building2, 
  MessageSquare, 
  MapPin, 
  Filter,
  DollarSign,
  Activity
} from "lucide-react";
import {
  CustomSelect,
  DashboardPageHeader,
  StatCard,
  KpiGrid,
  ProgressBar,
  Panel,
  DataTable,
  Badge,
  type DataTableColumn,
} from "@/components/ui";

const MONTHLY_INQUIRIES = [
  { month: "Jan", value: 12 },
  { month: "Feb", value: 18 },
  { month: "Mar", value: 14 },
  { month: "Apr", value: 22 },
  { month: "May", value: 30 },
  { month: "Jun", value: 25 },
  { month: "Jul", value: 35 },
  { month: "Aug", value: 28 },
  { month: "Sep", value: 40 },
  { month: "Oct", value: 33 },
  { month: "Nov", value: 45 },
  { month: "Dec", value: 38 }
];

type InquiryRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  propTitle: string;
  message: string;
  date: string;
};

export default function AdminAnalyticsPage() {
  const { properties, adminUsers, inquiries, enquiries } = useApp();
  
  const [cityFilter, setCityFilter] = useState("all");
  const [activeBarIdx, setActiveBarIdx] = useState<number | null>(null);

  const activeProps = useMemo(() => properties.filter(p => p.status === "Active").length, [properties]);
  const totalInquiries = useMemo(() => Object.values(inquiries).reduce((a, b) => a + b.length, 0), [inquiries]);
  const totalRevenue = useMemo(() => properties.filter(p => p.status === "Active").reduce((a, p) => a + p.price, 0), [properties]);

  const cityData = useMemo(() => {
    const data = properties.reduce((acc: Record<string, number>, p) => { 
      acc[p.city] = (acc[p.city] || 0) + 1; 
      return acc; 
    }, {});
    
    const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]);
    
    return sorted.map(([name, count]) => ({
      name,
      count,
      percent: Math.round((count / properties.length) * 100),
    }));
  }, [properties]);

  const cityFilterOptions = useMemo(() => {
    const list = Array.from(new Set(properties.map(p => p.city)));
    return [
      { label: "All Cities", value: "all" },
      ...list.map(c => ({ label: c, value: c }))
    ];
  }, [properties]);

  const recentInquiries = useMemo(() => {
    const list: InquiryRow[] = [];
    Object.entries(inquiries).forEach(([propId, inqList]) => {
      const prop = properties.find(p => p.id === propId);
      inqList.forEach(inq => {
        list.push({
          id: `${propId}-${inq.name}-${inq.phone}`,
          name: inq.name,
          email: inq.email,
          phone: inq.phone,
          propTitle: prop?.title || "Unknown Property",
          message: inq.message,
          date: "2026-07-16"
        });
      });
    });
    return list.slice(0, 5);
  }, [inquiries, properties]);

  const chartHeight = 160;
  const chartWidth = 540;
  const xOffset = 30;
  const yOffset = 20;
  const graphWidth = chartWidth - xOffset * 2;
  const graphHeight = chartHeight - yOffset * 2;
  const maxInqVal = Math.max(...MONTHLY_INQUIRIES.map(d => d.value), 1);

  const columns: DataTableColumn<InquiryRow>[] = [
    {
      key: "user",
      header: "User Client",
      render: (inq) => (
        <div>
          <p className="font-bold text-charcoal">{inq.name}</p>
          <p className="text-[9px] text-charcoal/40 font-semibold mt-0.5">{inq.email}</p>
        </div>
      ),
    },
    {
      key: "property",
      header: "Property Sourced",
      render: (inq) => (
        <p className="font-bold text-charcoal truncate max-w-[200px]" title={inq.propTitle}>
          {inq.propTitle}
        </p>
      ),
    },
    {
      key: "message",
      header: "Inquiry Message",
      render: (inq) => (
        <p className="text-charcoal/60 truncate max-w-[300px]" title={inq.message}>
          {inq.message}
        </p>
      ),
    },
    {
      key: "date",
      header: "Activity Date",
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
        description="Global operational overview, database statistics, and conversion analytics."
        actions={
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-sand/20 border border-indigo/5 px-3 py-2 rounded-xl shrink-0">
              <Filter className="w-3.5 h-3.5 text-terracotta" />
              <span className="text-[10px] font-black text-charcoal/45 uppercase tracking-wider font-semibold">City Hub</span>
            </div>
            <CustomSelect
              options={cityFilterOptions}
              value={cityFilter}
              onChange={setCityFilter}
              accent="terracotta"
              buttonClassName="bg-white border border-indigo/10 text-[10px] font-black uppercase tracking-wider px-4 py-2.5 rounded-xl text-charcoal animate-none"
            />
          </div>
        }
      />

      <KpiGrid>
        <StatCard
          label="Total Sourced Users"
          value={adminUsers.length}
          hint="Active dealers & clients"
          tone="indigo"
          icon={<Users className="w-4 h-4" />}
        />
        <StatCard
          label="Active Listings"
          value={activeProps}
          hint="+8.5% listings"
          tone="success"
          icon={<Building2 className="w-4 h-4" />}
        />
        <StatCard
          label="Enquiry Threads"
          value={totalInquiries + enquiries.length}
          hint="Total customer leads"
          tone="terracotta"
          icon={<MessageSquare className="w-4 h-4" />}
        />
        <StatCard
          label="Est. Portfolio Value"
          value={`₹${(totalRevenue / 10000000).toFixed(1)}Cr`}
          hint="+2.1% values"
          tone="warning"
          icon={<DollarSign className="w-4 h-4" />}
        />
      </KpiGrid>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Panel
          className="lg:col-span-8"
          title="Monthly Sourced Inquiries (2026)"
          description="Interaction distributions"
          actions={
            activeBarIdx !== null ? (
              <Badge tone="primary" size="sm">
                {MONTHLY_INQUIRIES[activeBarIdx].month}: {MONTHLY_INQUIRIES[activeBarIdx].value} inquiries
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
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c95b3c" stopOpacity="1" />
                  <stop offset="100%" stopColor="#c95b3c" stopOpacity="0.4" />
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
                    stroke="#c95b3c"
                    strokeOpacity="0.05"
                    strokeDasharray="4 4"
                  />
                );
              })}

              {MONTHLY_INQUIRIES.map((d, i) => {
                const barSpacing = graphWidth / MONTHLY_INQUIRIES.length;
                const barWidth = barSpacing * 0.65;
                const barHeight = (d.value / maxInqVal) * graphHeight;
                const x = xOffset + i * barSpacing + (barSpacing - barWidth) / 2;
                const y = (chartHeight - yOffset) - barHeight;
                const active = activeBarIdx === i;

                return (
                  <g key={i}>
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      rx={3}
                      fill="url(#barGrad)"
                      className="transition-all duration-200 cursor-pointer"
                      style={{ opacity: active ? 1 : 0.8 }}
                      onMouseEnter={() => setActiveBarIdx(i)}
                      onMouseLeave={() => setActiveBarIdx(null)}
                    />
                    <text
                      x={x + barWidth / 2}
                      y={chartHeight - 4}
                      textAnchor="middle"
                      className="text-[8px] font-bold fill-charcoal/40"
                    >
                      {d.month}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </Panel>

        <Panel
          className="lg:col-span-4"
          title="Market Breakdown"
          description="Listings allocated in state regions"
        >
          <div className="space-y-4">
            {cityData.slice(0, 4).map((city) => (
              <div key={city.name} className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-bold text-charcoal">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-terracotta/75" />
                    {city.name}
                  </span>
                  <span className="text-charcoal/40 font-semibold">{city.count} listings ({city.percent}%)</span>
                </div>
                <ProgressBar value={city.percent} tone="terracotta" label={city.name} />
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel
        title="System Sourcing Activity"
        description="Real-time dealer inquiries audit log"
        padding="none"
        actions={
          <Badge tone="primary" size="sm">
            <span className="inline-flex items-center gap-1">
              <Activity className="w-3 h-3" /> Audit Trail
            </span>
          </Badge>
        }
      >
        <div className="p-4">
          <DataTable
            columns={columns}
            rows={recentInquiries}
            rowKey={(r) => r.id}
            emptyMessage="No platform activity registered."
          />
        </div>
      </Panel>
    </div>
  );
}
