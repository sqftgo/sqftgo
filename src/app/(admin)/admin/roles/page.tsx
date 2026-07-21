"use client";
import React from "react";
import { Shield, CheckCircle2 } from "lucide-react";
import { DashboardPageHeader, Panel, Badge, Alert } from "@/components/ui";

const ROLES = [
  {
    name: "Super Admin",
    tone: "warning" as const,
    permissions: [
      "Full Platform Access",
      "User Management",
      "Dealer Management",
      "Property Management",
      "Role Management",
      "System Settings",
      "View Logs",
      "Analytics",
    ],
  },
  {
    name: "Dealer",
    tone: "primary" as const,
    permissions: [
      "Own Property Management",
      "View Own Inquiries",
      "Manage Profile",
      "View Own Analytics",
      "Manage Subscription",
    ],
  },
  {
    name: "User",
    tone: "info" as const,
    permissions: [
      "Browse Properties",
      "Save Favorites",
      "Submit Inquiries",
      "Contact Dealers",
      "Manage Own Profile",
      "Compare Properties",
    ],
  },
  {
    name: "Guest",
    tone: "neutral" as const,
    permissions: ["Browse Properties", "View Property Details", "Search Listings"],
  },
];

export default function AdminRolesPage() {
  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <DashboardPageHeader
        title="Roles & Permissions"
        description="Platform role hierarchy and access controls"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {ROLES.map((role) => (
          <Panel key={role.name} padding="lg" rounded="2xl">
            <div className="flex items-center gap-3 mb-5">
              <Shield className="w-5 h-5 text-charcoal/50" />
              <Badge tone={role.tone}>{role.name}</Badge>
            </div>
            <div className="space-y-2">
              {role.permissions.map((perm) => (
                <div key={perm} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo/50 shrink-0" />
                  <span className="text-xs font-semibold text-charcoal/65">{perm}</span>
                </div>
              ))}
            </div>
          </Panel>
        ))}
      </div>
      <Alert
        variant="info"
        title="Role assignments"
        description="Role assignments are managed via the Users page. Role definitions are enforced server-side via RBAC middleware. Admin accounts can only be created manually."
      />
    </div>
  );
}
