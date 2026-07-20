"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { DEMO_ACCOUNTS } from "@/constants/demoAccounts";
import { DashboardShell, type DashboardNavSection } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/Button";
import {
  LayoutDashboard, Users, Briefcase, Building2, CheckSquare, Tag,
  MapPin, Star, FileText, BarChart3, MessageSquare, Settings, User,
  Shield, ScrollText, Bell, ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
    setIsLoggedIn,
    setUserEmail,
    setUserRole,
    setUserName,
    setUserProfile,
  } = useApp();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const pendingCount = properties.filter((p) => p.status === "Pending Review").length;
  const unreadNotifCount = notifications.filter(
    (n) => !n.read && (n.forRole === "admin" || n.forRole === "all")
  ).length;

  const isAdmin = isLoggedIn && (userRole === "admin" || userEmail === "admin@svrepl.com");

  const enterAsDemoAdmin = () => {
    const demo = DEMO_ACCOUNTS.find((a) => a.role === "admin")!;
    setIsLoggedIn(true);
    setUserEmail(demo.email);
    setUserRole("admin");
    setUserName(demo.name);
    setUserProfile({
      id: `profile-${demo.email}`,
      name: demo.name,
      email: demo.email,
      role: "admin",
      joinedDate: "2025-06-01",
    });
  };

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
          This area is restricted to platform administrators. Sign in with admin credentials or use the demo account.
        </p>
        <Button fullWidth onClick={enterAsDemoAdmin} className="mb-3">
          Continue as Demo Admin
        </Button>
        <Link
          href="/login"
          className="block w-full py-3.5 bg-terracotta hover:bg-terracotta-hover text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors mb-3 shadow-md shadow-terracotta/15"
        >
          Admin Login
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
      <div className="relative">
        <button
          type="button"
          onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
          className="flex items-center gap-2.5 hover:bg-indigo/5 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer"
          aria-expanded={profileDropdownOpen}
          aria-haspopup="menu"
        >
          <div className="w-7 h-7 rounded-lg bg-terracotta/10 border border-terracotta/20 flex items-center justify-center text-terracotta font-serif font-black text-xs shrink-0">
            A
          </div>
          <div className="hidden md:flex flex-col items-start leading-none text-left">
            <span className="text-xs font-bold text-charcoal">{userName || "Super Admin"}</span>
            <span className="text-[9px] text-charcoal/40 font-semibold mt-0.5 uppercase tracking-wide">
              Admin
            </span>
          </div>
          <ChevronDown className="w-3 h-3 text-charcoal/40" />
        </button>
        <AnimatePresence>
          {profileDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-48 bg-white border border-indigo/10 rounded-2xl p-2 shadow-lg z-50 flex flex-col"
                role="menu"
              >
                <Link
                  href="/admin/profile"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="px-3 py-2 text-xs font-semibold text-charcoal/80 hover:text-indigo hover:bg-indigo/5 rounded-xl transition-colors text-left"
                  role="menuitem"
                >
                  My Profile
                </Link>
                <Link
                  href="/admin/settings"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="px-3 py-2 text-xs font-semibold text-charcoal/80 hover:text-indigo hover:bg-indigo/5 rounded-xl transition-colors text-left"
                  role="menuitem"
                >
                  Account Settings
                </Link>
                <div className="h-px bg-indigo/5 my-1.5" />
                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    handleLogout();
                  }}
                  className="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left cursor-pointer"
                  role="menuitem"
                >
                  Log Out
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  return (
    <DashboardShell
      portalLabel="Admin Portal"
      accent="terracotta"
      brandIcon={<Shield className="w-4 h-4 text-white" />}
      profileName={userName || "Super Admin"}
      profileEmail={userEmail || "admin@svrepl.com"}
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
