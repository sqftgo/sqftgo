"use client";
import React from "react";
import { useApp } from "@/context/AppContext";
import { Users, Building2, MessageSquare, Download } from "lucide-react";
import {
  DashboardPageHeader,
  StatCard,
  KpiGrid,
  ProgressBar,
  Avatar,
  Panel,
  Button,
} from "@/components/ui";

export default function AdminReportsPage() {
  const { properties, mockUsers, inquiries, enquiries, directoryProfiles } = useApp();

  const totalInquiries = Object.values(inquiries).reduce((a, b) => a + b.length, 0);
  const totalEnquiries = enquiries.length;
  const activeProperties = properties.filter(p => p.status === "Active").length;
  const totalDealers = directoryProfiles.filter(p => p.category === "Agent & Broker" || p.category === "Property Consultant").length;

  const cityReport = properties.reduce((acc: Record<string, number>, p) => {
    acc[p.city] = (acc[p.city] || 0) + 1;
    return acc;
  }, {});

  const typeReport = properties.reduce((acc: Record<string, number>, p) => {
    acc[p.type] = (acc[p.type] || 0) + 1;
    return acc;
  }, {});

  const handleExport = () => {
    const data = properties.map(p => ({
      ID: p.id, Title: p.title, Type: p.type, City: p.city, Price: p.price,
      Status: p.status, Owner: p.ownerName, Inquiries: inquiries[p.id]?.length || 0,
    }));
    if (data.length === 0) return;
    const csv = [Object.keys(data[0]).join(","), ...data.map(row => Object.values(row).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "sqftgo_properties.csv"; a.click();
  };

  const maxCity = Math.max(1, ...Object.values(cityReport));
  const maxType = Math.max(1, ...Object.values(typeReport));

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <DashboardPageHeader
        title="Reports"
        description="Platform data summary"
        actions={
          <Button variant="primary" size="sm" onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        }
      />

      <KpiGrid>
        <StatCard label="Total Users" value={mockUsers.filter(u => u.role === "user").length} icon={<Users className="w-4 h-4 text-indigo" />} tone="indigo" />
        <StatCard label="Registered Dealers" value={totalDealers} icon={<Users className="w-4 h-4 text-purple-600" />} />
        <StatCard label="Active Listings" value={activeProperties} icon={<Building2 className="w-4 h-4 text-emerald-600" />} tone="success" />
        <StatCard label="Total Inquiries" value={totalInquiries + totalEnquiries} icon={<MessageSquare className="w-4 h-4 text-terracotta" />} tone="terracotta" />
      </KpiGrid>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Panel title="Listings by City" padding="md" rounded="2xl">
          <div className="space-y-3">
            {Object.entries(cityReport).sort((a, b) => b[1] - a[1]).map(([city, count]) => (
              <div key={city} className="flex items-center gap-3">
                <span className="text-xs font-bold text-charcoal/65 w-24 shrink-0">{city}</span>
                <ProgressBar value={count} max={maxCity} tone="terracotta" className="flex-1" label={`${city}: ${count}`} />
                <span className="text-xs font-black text-charcoal/40 w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Listings by Type" padding="md" rounded="2xl">
          <div className="space-y-3">
            {Object.entries(typeReport).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
              <div key={type} className="flex items-center gap-3">
                <span className="text-xs font-bold text-charcoal/65 w-28 shrink-0 truncate">{type}</span>
                <ProgressBar value={count} max={maxType} tone="indigo" className="flex-1" label={`${type}: ${count}`} />
                <span className="text-xs font-black text-charcoal/40 w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="Recent General Enquiries" padding="none" rounded="2xl">
        <div className="divide-y divide-indigo/5">
          {enquiries.slice(0, 8).map(enq => (
            <div key={enq.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-indigo/5 transition-colors">
              <Avatar name={enq.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-charcoal">{enq.name}</p>
                <p className="text-[10px] text-charcoal/50 font-semibold truncate">{(enq.message || enq.remarks || "").slice(0, 60)}{(enq.message || enq.remarks || "").length > 60 ? "..." : ""}</p>
              </div>
              <span className="text-[9px] text-charcoal/40 font-semibold shrink-0">{enq.date}</span>
            </div>
          ))}
          {enquiries.length === 0 && (
            <div className="p-8 text-center text-charcoal/40 text-sm font-semibold">No general enquiries yet.</div>
          )}
        </div>
      </Panel>
    </div>
  );
}
