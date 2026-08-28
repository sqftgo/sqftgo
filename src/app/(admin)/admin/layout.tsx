"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { platformService, projectService } from "@/services";
import { DashboardShell, type DashboardNavSection } from "@/components/layout/DashboardShell";
import {
  LayoutDashboard,
  Briefcase,
  Building2,
  CheckSquare,
  Tag,
  MapPin,
  Star,
  IndianRupee,
  FileText,
  MessageSquare,
  Shield,
  Users,
  Settings,
  FolderKanban,
  SlidersHorizontal,
  Wrench,
  ShieldCheck,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const {
    isLoggedIn,
    userEmail,
    userRole,
    userName,
    logout,
    sessionReady,
    properties,
  } = useApp();

  const [pendingFromAnalytics, setPendingFromAnalytics] = useState<number | null>(null);
  const [pendingProjects, setPendingProjects] = useState(0);

  useEffect(() => {
    if (!sessionReady || userRole !== "admin") return;
    let cancelled = false;
    (async () => {
      try {
        const [analytics, projectPage] = await Promise.all([
          platformService.getAnalytics(),
          projectService.listPage({ status: "Pending Review", limit: 1, offset: 0 }),
        ]);
        if (!cancelled) {
          setPendingFromAnalytics(analytics.pendingReview);
          setPendingProjects(projectPage.total);
        }
      } catch {
        if (!cancelled) {
          setPendingFromAnalytics(null);
          setPendingProjects(0);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionReady, userRole]);

  const pendingFromProperties = properties.filter(
    (p) => p.status === "Pending Review"
  ).length;
  const pendingCount = (pendingFromAnalytics ?? pendingFromProperties) + pendingProjects;

  const isAdmin = isLoggedIn && userRole === "admin";

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const navSections: DashboardNavSection[] = useMemo(
    () => [
      {
        title: "Core",
        items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true }],
      },
      {
        title: "Directory",
        items: [
          { href: "/admin/users", label: "Users", icon: Users },
          { href: "/admin/dealers", label: "Dealers", icon: Briefcase },
          { href: "/admin/services", label: "Services", icon: Wrench },
          { href: "/admin/service-verifications", label: "Service Verify", icon: ShieldCheck },
          { href: "/admin/kyc", label: "KYC Reviews", icon: Shield },
        ],
      },
      {
        title: "Properties",
        items: [
          { href: "/admin/properties", label: "Properties", icon: Building2 },
          { href: "/admin/projects", label: "Projects", icon: FolderKanban },
          { href: "/admin/approvals", label: "Approvals", icon: CheckSquare, badge: "approvals" },
        ],
      },
      {
        title: "Customize filters",
        items: [
          { href: "/admin/filters", label: "Search filters", icon: SlidersHorizontal },
          { href: "/admin/categories", label: "Categories", icon: Tag },
          { href: "/admin/locations", label: "Locations", icon: MapPin },
          { href: "/admin/amenities", label: "Amenities", icon: Star },
          { href: "/admin/pricing", label: "Pricing Management", icon: IndianRupee },
        ],
      },
      {
        title: "Platform",
        items: [
          { href: "/admin/reports", label: "Reports", icon: FileText },
          { href: "/admin/messages", label: "Messages", icon: MessageSquare },
          { href: "/admin/settings", label: "Settings", icon: Settings },
        ],
      },
    ],
    []
  );

  const accessDenied = (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="bg-white border border-indigo/10 rounded-3xl p-10 max-w-md w-full text-center shadow-sm">
        <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 mx-auto mb-6 border border-rose-500/20">
          <Shield className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-serif font-black text-charcoal mb-3">Admin Access Only</h1>
        <p className="text-charcoal/50 text-sm font-semibold mb-8 leading-relaxed">
          This area is restricted to the platform administrator. Sign in with the seeded admin account.
        </p>
        <Link
          href="/login"
          className="block w-full py-3.5 bg-terracotta hover:bg-terracotta-hover text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors mb-3 shadow-md shadow-terracotta/15"
        >
          Sign In
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

  return (
    <DashboardShell
      portalLabel="Admin Portal"
      accent="terracotta"
      brandIcon={<Shield className="w-4 h-4 text-white" />}
      profileName={userName || "Super Admin"}
      profileEmail={userEmail || ""}
      profileInitial="A"
      navSections={navSections}
      getBadgeCount={(badge) => {
        if (badge === "approvals") return pendingCount;
        return 0;
      }}
      onLogout={handleLogout}
      hideTopBar
      showPublicSiteLink={false}
      ready={sessionReady}
      accessDenied={!isAdmin ? accessDenied : undefined}
    >
      {children}
    </DashboardShell>
  );
}
