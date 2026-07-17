"use client";
import React, { useState } from "react";
import { Shield, CheckCircle2 } from "lucide-react";

const ROLES = [
  { name: "Super Admin", color: "text-terracotta border-terracotta/20 bg-terracotta/10", permissions: ["Full Platform Access", "User Management", "Dealer Management", "Property Management", "Role Management", "System Settings", "View Logs", "Analytics"] },
  { name: "Dealer", color: "text-purple-600 border-purple-500/20 bg-purple-500/10", permissions: ["Own Property Management", "View Own Inquiries", "Manage Profile", "View Own Analytics", "Manage Subscription"] },
  { name: "User", color: "text-sky-600 border-sky-500/20 bg-sky-500/10", permissions: ["Browse Properties", "Save Favorites", "Submit Inquiries", "Contact Dealers", "Manage Own Profile", "Compare Properties"] },
  { name: "Guest", color: "text-charcoal/40 border-indigo/10 bg-indigo/5", permissions: ["Browse Properties", "View Property Details", "Search Listings"] },
];

export default function AdminRolesPage() {
  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-serif font-black text-charcoal">Roles & Permissions</h1>
        <p className="text-charcoal/40 text-sm font-semibold mt-1">Platform role hierarchy and access controls</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {ROLES.map(role => (
          <div key={role.name} className={`bg-white/80 border rounded-2xl p-6 shadow-sm ${
            role.color.includes("terracotta") ? "border-terracotta/20" :
            role.color.includes("purple") ? "border-purple-500/20" :
            role.color.includes("sky") ? "border-sky-500/20" : "border-indigo/5"
          }`}>
            <div className="flex items-center gap-3 mb-5">
              <Shield className={`w-5 h-5 ${role.color.split(" ")[0]}`} />
              <h2 className={`text-sm font-serif font-black ${role.color.split(" ")[0]}`}>{role.name}</h2>
            </div>
            <div className="space-y-2">
              {role.permissions.map(perm => (
                <div key={perm} className="flex items-center gap-2">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${role.color.split(" ")[0]} shrink-0`} />
                  <span className="text-xs font-semibold text-charcoal/65">{perm}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="bg-indigo/5 border border-indigo/10 rounded-2xl p-5 shadow-sm">
        <p className="text-[10px] font-black text-charcoal/40 uppercase tracking-widest mb-2">Note</p>
        <p className="text-xs text-charcoal/50 font-semibold leading-relaxed">
          Role assignments are managed via the Users page. Role definitions are enforced server-side via RBAC middleware. Admin accounts can only be created manually.
        </p>
      </div>
    </div>
  );
}
