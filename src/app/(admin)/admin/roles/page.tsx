"use client";

import React from "react";
import { Shield, CheckCircle2 } from "lucide-react";
import { DashboardPageHeader, Panel, Badge, Alert } from "@/components/ui";

/** Documentation of coarse roles — not an editable permissions matrix. */
const ROLES = [
  {
    name: "Admin",
    tone: "warning" as const,
    permissions: [
      "Full platform access via middleware + API role checks",
      "User management (suspend / promote broker)",
      "Property approvals and catalog CRUD",
      "Activity logs",
      "Admin-only APIs",
    ],
  },
  {
    name: "Broker (Dealer)",
    tone: "primary" as const,
    permissions: [
      "Own property management",
      "View own inquiries / messages",
      "Directory profile updates",
      "Dealer dashboard routes",
    ],
  },
  {
    name: "User",
    tone: "info" as const,
    permissions: [
      "Browse properties",
      "Save favorites",
      "Submit inquiries / visits",
      "Manage own profile",
    ],
  },
  {
    name: "Guest",
    tone: "neutral" as const,
    permissions: ["Browse public listings", "View property details", "Search"],
  },
];

export default function AdminRolesPage() {
  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <DashboardPageHeader
        title="Roles & Permissions"
        description="Read-only reference for the current coarse role model"
      />

      <Alert
        variant="info"
        title="Documentation only — not editable"
        description="There is no permissions matrix API. Roles are the profiles.role enum (user | broker | admin), enforced by middleware, RLS, and API checks. Assign roles on the Users page; admin elevation cannot be granted via the public API."
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
    </div>
  );
}
