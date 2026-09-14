"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { useDealersQuery } from "@/hooks";
import { DashboardShell, type DashboardNavSection } from "@/components/layout/DashboardShell";
import { findMyDirectoryProfile } from "@/lib/ownership";
import {
  LayoutDashboard, Building2, Plus, MessageSquare, BarChart3,
  CreditCard, User, Settings, ShieldAlert, FolderKanban,
} from "lucide-react";

export default function DealerDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const {
    isLoggedIn,
    userEmail,
    userRole,
    userName,
    userProfile,
    logout,
    sessionReady,
    directoryProfiles,
    inquiries,
  } = useApp();

  const myDirectoryQuery = useDealersQuery({ mine: true, limit: 5, offset: 0 });
  const myDirectory = myDirectoryQuery.data?.items?.[0];

  const isBroker = isLoggedIn && (userRole === "broker" || userRole === "admin");
  const brokerProfile =
    myDirectory ??
    findMyDirectoryProfile(directoryProfiles, userProfile?.id, userEmail);

  const newInquiryCount = useMemo(
    () =>
      Object.values(inquiries).reduce(
        (acc, rows) => acc + rows.filter((row) => !row.status || row.status === "new").length,
        0
      ),
    [inquiries]
  );

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const navSections: DashboardNavSection[] = useMemo(
    () => [
      {
        title: "Core",
        items: [
          { href: "/dealer/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
        ],
      },
      {
        title: "Properties",
        items: [
          { href: "/dealer/dashboard/properties", label: "My Properties", icon: Building2 },
          { href: "/dealer/dashboard/add-property", label: "Add Property", icon: Plus },
          {
            href: "/dealer/dashboard/properties",
            label: "Drafts",
            icon: Building2,
            query: { status: "Draft" },
          },
        ],
      },
      {
        title: "Projects",
        items: [
          { href: "/dealer/dashboard/projects", label: "My Projects", icon: FolderKanban },
          { href: "/dealer/dashboard/add-project", label: "Add Project", icon: Plus },
          {
            href: "/dealer/dashboard/projects",
            label: "Drafts",
            icon: FolderKanban,
            query: { status: "Draft" },
          },
        ],
      },
      {
        title: "Leads & Inbox",
        items: [
          {
            href: "/dealer/dashboard/inquiries",
            label: "Communications",
            icon: MessageSquare,
            badge: "inquiries",
          },
        ],
      },
      {
        title: "Analytics & Plans",
        items: [
          { href: "/dealer/dashboard/analytics", label: "Analytics", icon: BarChart3 },
          { href: "/dealer/dashboard/subscription", label: "Plans & Billing", icon: CreditCard },
        ],
      },
      {
        title: "Business Account",
        items: [
          { href: "/dealer/dashboard/profile", label: "Dealer Profile", icon: User },
          { href: "/dealer/dashboard/settings", label: "Settings", icon: Settings },
        ],
      },
    ],
    []
  );

  const accessDenied = (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="bg-white border border-indigo/10 rounded-3xl p-10 max-w-md w-full text-center shadow-sm">
        <div className="w-16 h-16 bg-indigo/10 rounded-2xl flex items-center justify-center text-indigo mx-auto mb-6 border border-indigo/20">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-serif font-black text-charcoal mb-3">Dealer Access Required</h1>
        <p className="text-charcoal/50 text-sm font-semibold mb-8 leading-relaxed">
          Sign in with a broker account to manage listings and leads.
        </p>
        <Link
          href="/login"
          className="block w-full py-3.5 bg-terracotta hover:bg-terracotta-hover text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors mb-3"
        >
          Dealer Login
        </Link>
        <Link
          href="/"
          className="block w-full py-3.5 border border-indigo/10 text-charcoal/60 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-indigo/5 transition-colors"
        >
          Back to Website
        </Link>
      </div>
    </div>
  );

  const publicSiteHref = brokerProfile?.id
    ? `/dealers/${brokerProfile.id}`
    : "/dealer/dashboard/profile";
  const publicSiteLabel = brokerProfile?.id
    ? "View Public Profile"
    : "Complete Dealer Profile";

  return (
    <DashboardShell
      portalLabel="Dealer Portal"
      accent="indigo"
      profileName={brokerProfile?.firmName || userName || "Dealer Account"}
      profileEmail={userEmail || ""}
      profileInitial={brokerProfile?.ownerName?.charAt(0) || "D"}
      navSections={navSections}
      getBadgeCount={(badge) => {
        if (badge === "inquiries") return newInquiryCount;
        return 0;
      }}
      onLogout={handleLogout}
      hideTopBar
      publicSiteHref={publicSiteHref}
      publicSiteLabel={publicSiteLabel}
      ready={sessionReady}
      accessDenied={!isBroker ? accessDenied : undefined}
    >
      {children}
    </DashboardShell>
  );
}
