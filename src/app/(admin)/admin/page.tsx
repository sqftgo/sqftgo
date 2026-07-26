"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { platformService } from "@/services";
import type { PlatformAnalytics } from "@/types";
import {
  Users,
  Briefcase,
  Building2,
  CheckSquare,
  TrendingUp,
  MessageSquare,
  ArrowUpRight,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  DashboardPageHeader,
  StatCard,
  KpiGrid,
  Badge,
  Panel,
  Alert,
  GlobalLoading,
  ErrorState,
} from "@/components/ui";

export default function AdminDashboardPage() {
  const { properties, activityLogs, propertiesError } = useApp();
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setAnalytics(await platformService.getAnalytics());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard KPIs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading && !analytics) {
    return <GlobalLoading label="Loading admin dashboard…" />;
  }

  if (error && !analytics) {
    return (
      <ErrorState
        title="Dashboard unavailable"
        message={error}
        onRetry={() => void load()}
      />
    );
  }

  if (!analytics) {
    return (
      <ErrorState
        title="Dashboard unavailable"
        message="No platform analytics returned."
        onRetry={() => void load()}
      />
    );
  }

  const totalInquiries =
    analytics.propertyInquiries + analytics.generalEnquiries;
  const pendingApprovals = analytics.pendingReview;

  const stats = [
    {
      label: "Total Users",
      value: analytics.buyerUsers,
      hint: `${analytics.accounts} accounts total`,
      icon: Users,
      tone: "indigo" as const,
      link: "/admin/users",
    },
    {
      label: "Dealers",
      value: analytics.dealers,
      hint: `${analytics.brokerUsers} broker logins`,
      icon: Briefcase,
      tone: "default" as const,
      link: "/admin/dealers",
    },
    {
      label: "Properties",
      value: analytics.propertiesTotal,
      hint: "Excludes dealer drafts",
      icon: Building2,
      tone: "success" as const,
      link: "/admin/properties",
    },
    {
      label: "Pending Approval",
      value: pendingApprovals,
      hint: "Needs review",
      icon: CheckSquare,
      tone: "warning" as const,
      link: "/admin/approvals",
    },
    {
      label: "Active Listings",
      value: analytics.activeListings,
      hint: "Live on marketplace",
      icon: TrendingUp,
      tone: "indigo" as const,
      link: "/admin/properties",
    },
    {
      label: "Total Inquiries",
      value: totalInquiries,
      hint: `${analytics.propertyInquiries} property · ${analytics.generalEnquiries} general`,
      icon: MessageSquare,
      tone: "terracotta" as const,
      link: "/admin/analytics",
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <DashboardPageHeader
        title="Admin Dashboard"
        description="Live platform overview from database counts"
      />

      {error ? (
        <Alert
          variant="warning"
          title="KPI refresh failed"
          description={error}
        />
      ) : null}
      {propertiesError ? (
        <Alert
          variant="danger"
          title="Property feed failed to load"
          description={propertiesError}
        />
      ) : null}

      <KpiGrid className="xl:grid-cols-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Link href={stat.link} className="block">
                <StatCard
                  label={stat.label}
                  value={stat.value}
                  hint={stat.hint}
                  tone={stat.tone}
                  icon={<Icon className="w-4 h-4" />}
                />
              </Link>
            </motion.div>
          );
        })}
      </KpiGrid>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {pendingApprovals > 0 && (
          <Alert
            variant="warning"
            title="Action Required"
            description={`${pendingApprovals} listings awaiting review`}
          >
            <Link
              href="/admin/approvals"
              className="inline-block mt-3 px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-700 text-xs font-bold rounded-xl hover:bg-amber-500/20 transition-colors"
            >
              Review Now
            </Link>
          </Alert>
        )}
        <Link
          href="/admin/users"
          className="bg-white/80 border border-indigo/10 rounded-2xl p-5 flex items-center justify-between hover:shadow-md transition-shadow"
        >
          <div>
            <p className="text-xs font-black text-charcoal/40 uppercase tracking-wider">
              Management
            </p>
            <p className="text-base font-serif font-black text-charcoal mt-1">
              View All Users
            </p>
          </div>
          <ArrowUpRight className="w-5 h-5 text-charcoal/30" />
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Panel
          title="Recent Properties"
          padding="none"
          actions={
            <Link
              href="/admin/properties"
              className="text-[10px] font-black text-terracotta/80 hover:text-terracotta uppercase tracking-wider flex items-center gap-1"
            >
              All <ArrowUpRight className="w-3 h-3" />
            </Link>
          }
        >
          <div className="divide-y divide-indigo/5">
            {properties.filter((prop) => prop.status !== "Draft").length === 0 ? (
              <p className="p-6 text-xs text-charcoal/40 font-semibold">
                No properties loaded yet.
              </p>
            ) : (
              properties
                .filter((prop) => prop.status !== "Draft")
                .slice(0, 5)
                .map((prop) => (
                <Link
                  key={prop.id}
                  href={`/admin/properties`}
                  className="flex items-center gap-3 p-4 hover:bg-indigo/5 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-sand/35 border border-indigo/5 shrink-0">
                    <img
                      src={
                        prop.images?.[0] ||
                        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=200&q=80"
                      }
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-charcoal truncate">
                      {prop.title}
                    </p>
                    <p className="text-[10px] text-charcoal/40 font-semibold">
                      {prop.ownerName}
                    </p>
                  </div>
                  <Badge status={prop.status} size="sm">
                    {prop.status}
                  </Badge>
                </Link>
              ))
            )}
          </div>
        </Panel>

        <Panel
          title="Recent Activity"
          padding="none"
          actions={
            <Link
              href="/admin/logs"
              className="text-[10px] font-black text-terracotta/80 hover:text-terracotta uppercase tracking-wider flex items-center gap-1"
            >
              All <ArrowUpRight className="w-3 h-3" />
            </Link>
          }
        >
          <div className="divide-y divide-indigo/5">
            {activityLogs.length === 0 ? (
              <p className="p-6 text-xs text-charcoal/40 font-semibold">
                No activity logged yet.
              </p>
            ) : (
              activityLogs.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  className="p-4 flex items-start gap-3 hover:bg-indigo/5 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-terracotta/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-3 h-3 text-terracotta/60" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-charcoal">{log.action}</p>
                    <p className="text-[10px] text-charcoal/40 font-semibold mt-0.5">
                      {log.performedBy} · {log.role}
                    </p>
                    <p className="text-[9px] text-charcoal/20 font-semibold mt-0.5">
                      {log.timestamp}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
