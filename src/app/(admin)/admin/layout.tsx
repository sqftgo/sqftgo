"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { DashboardShell, type DashboardNavSection } from "@/components/layout/DashboardShell";
import { DropdownMenu, Avatar } from "@/components/ui";
import {
  LayoutDashboard, Users, Briefcase, Building2, CheckSquare, Tag,
  MapPin, Star, FileText, BarChart3, MessageSquare, Settings, User,
  Shield, ScrollText, Bell, ChevronDown, LogOut,
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
    notifications,
  } = useApp();

  const pendingCount = properties.filter((p) => p.status === "Pending Review").length;
  const unreadNotifCount = notifications.filter(
    (n) => !n.read && (n.forRole === "admin" || n.forRole === "all")
  ).length;

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
        ],
      },
      {
        title: "Properties",
        items: [
          { href: "/admin/properties", label: "Properties", icon: Building2 },
          { href: "/admin/approvals", label: "Approvals", icon: CheckSquare, badge: "approvals" },
        ],
      },
      {
        title: "Taxonomy",
        items: [
          { href: "/admin/categories", label: "Categories", icon: Tag },
          { href: "/admin/locations", label: "Locations", icon: MapPin },
          { href: "/admin/amenities", label: "Amenities", icon: Star },
        ],
      },
      {
        title: "Platform",
        items: [
          { href: "/admin/reports", label: "Reports", icon: FileText },
          { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
          { href: "/admin/messages", label: "Messages", icon: MessageSquare },
        ],
      },
      {
        title: "System",
        items: [
          { href: "/admin/profile", label: "Admin Profile", icon: User },
          { href: "/admin/settings", label: "Settings", icon: Settings },
          { href: "/admin/roles", label: "Roles & Permissions", icon: Shield },
          { href: "/admin/logs", label: "Activity Logs", icon: ScrollText },
          {
            href: "/admin/notifications",
            label: "Notifications",
            icon: Bell,
            badge: "notifications",
          },
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

  const topBarExtra = (
    <div className="flex items-center gap-4">
      <Link
        href="/admin/notifications"
        className="relative p-2.5 hover:bg-indigo/5 rounded-xl text-indigo transition-colors"
        aria-label={`Notifications${unreadNotifCount ? `, ${unreadNotifCount} unread` : ""}`}
      >
        <Bell className="w-4 h-4" />
        {unreadNotifCount > 0 && (
          <span className="absolute top-1 right-1 bg-terracotta text-white text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-sm">
            {unreadNotifCount}
          </span>
        )}
      </Link>
      <div className="h-5 w-px bg-indigo/10" />
      <DropdownMenu
        accent="terracotta"
        align="right"
        trigger={
          <div className="flex items-center gap-2.5 hover:bg-indigo/5 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer">
            <Avatar
              name={userName || "Admin"}
              size="xs"
              shape="square"
              tone="terracotta"
              className="w-7 h-7 text-xs font-serif"
            />
            <div className="hidden md:flex flex-col items-start leading-none text-left">
              <span className="text-xs font-bold text-charcoal">{userName || "Super Admin"}</span>
              <span className="text-[9px] text-charcoal/40 font-semibold mt-0.5 uppercase tracking-wide">
                Admin
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-charcoal/40" />
          </div>
        }
        items={[
          { id: "profile", label: "My Profile", href: "/admin/profile", icon: User },
          { id: "settings", label: "Account Settings", href: "/admin/settings", icon: Settings },
          { id: "logout", label: "Log Out", onClick: handleLogout, variant: "danger", icon: LogOut, dividerBefore: true }
        ]}
      />
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
        if (badge === "notifications") return unreadNotifCount;
        return 0;
      }}
      onLogout={handleLogout}
      topBarExtra={topBarExtra}
      searchPlaceholder="Search platform..."
      ready={sessionReady}
      accessDenied={!isAdmin ? accessDenied : undefined}
    >
      {children}
    </DashboardShell>
  );
}
