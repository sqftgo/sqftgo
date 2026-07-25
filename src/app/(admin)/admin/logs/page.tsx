"use client";
import React from "react";
import { useApp } from "@/context/AppContext";
import { Clock } from "lucide-react";
import {
  DashboardPageHeader,
  Badge,
  DataTable,
  type DataTableColumn,
} from "@/components/ui";

type ActivityLog = {
  id: string;
  timestamp: string;
  action: string;
  performedBy: string;
  role: string;
  target: string;
};

const ROLE_TONE: Record<string, "warning" | "primary" | "info" | "neutral"> = {
  Admin: "warning",
  Dealer: "primary",
  Broker: "primary",
  User: "info",
};

export default function AdminLogsPage() {
  const { activityLogs, logsReady, refreshLogs } = useApp();

  React.useEffect(() => {
    void refreshLogs();
  }, [refreshLogs]);

  const columns: DataTableColumn<ActivityLog>[] = [
    {
      key: "timestamp",
      header: "Timestamp",
      render: (log) => (
        <div className="flex items-center gap-2 whitespace-nowrap">
          <Clock className="w-3 h-3 text-charcoal/30 shrink-0" />
          <span className="text-[10px] text-charcoal/40 font-semibold">{log.timestamp}</span>
        </div>
      ),
    },
    {
      key: "action",
      header: "Action",
      render: (log) => <span className="text-xs font-bold text-charcoal">{log.action}</span>,
    },
    {
      key: "performedBy",
      header: "Performed By",
      render: (log) => (
        <span className="text-xs text-charcoal/60 font-semibold">{log.performedBy}</span>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (log) => (
        <Badge tone={ROLE_TONE[log.role] ?? "neutral"} size="sm">
          {log.role}
        </Badge>
      ),
    },
    {
      key: "target",
      header: "Target",
      render: (log) => (
        <span className="text-xs text-charcoal/50 font-semibold truncate max-w-[200px] block">
          {log.target}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <DashboardPageHeader
        title="Activity Logs"
        description={
          logsReady
            ? `${activityLogs.length} events recorded`
            : "Loading activity…"
        }
      />
      <DataTable
        columns={columns}
        rows={activityLogs as ActivityLog[]}
        rowKey={(log) => log.id}
        emptyMessage={logsReady ? "No activity logged yet." : "Loading…"}
      />
    </div>
  );
}
