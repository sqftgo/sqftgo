"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { DEMO_ACCOUNTS } from "@/constants/demoAccounts";
import { DashboardShell, type DashboardNavSection } from "@/components/layout/DashboardShell";
import { Button, DropdownMenu, Avatar } from "@/components/ui";
import {
  LayoutDashboard, Building2, Plus, MessageSquare, BarChart3,
  Mail, CreditCard, User, Settings, Bell, ChevronDown, ShieldAlert, LogOut,
} from "lucide-react";

export default function DealerDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const {
    isLoggedIn,
    userEmail,
    userRole,
    userName,
    logout,
    sessionReady,
    directoryProfiles,
    inquiries,
    notifications,
    properties,
    setIsLoggedIn,
    setUserEmail,
    setUserRole,
    setUserName,
    setUserProfile,
  } = useApp();

  const isBroker = isLoggedIn && (userRole === "broker" || userRole === "admin");
  const brokerProfile = directoryProfiles.find(
    (p) => p.email.toLowerCase() === userEmail.toLowerCase()
  );
  const brokerProperties = properties.filter(
    (p) => p.ownerEmail?.toLowerCase() === userEmail.toLowerCase()
  );
  const inquiryCount = brokerProperties.reduce(
    (acc, p) => acc + (inquiries[p.id]?.length || 0),
    0
  );
  const unreadNotifCount = notifications.filter(
    (n) => !n.read && (n.forRole === "broker" || n.forRole === "all")
  ).length;

  const enterAsDemoBroker = () => {
    const demo = DEMO_ACCOUNTS.find((a) => a.role === "broker")!;
    setIsLoggedIn(true);
    setUserEmail(demo.email);
    setUserRole("broker");
    setUserName(demo.name);
    setUserProfile({
      id: `profile-${demo.email}`,
      name: demo.name,
      email: demo.email,
      role: "broker",
      joinedDate: "2025-11-10",
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
        title: "Leads & Inbox",
        items: [
          {
            href: "/dealer/dashboard/inquiries",
            label: "Customer Inquiries",
            icon: MessageSquare,
            badge: "inquiries",
          },
          { href: "/dealer/dashboard/messages", label: "Messages", icon: Mail },
        ],
      },
      {
        title: "Analytics & Plans",
        items: [
          { href: "/dealer/dashboard/analytics", label: "Analytics", icon: BarChart3 },
          { href: "/dealer/dashboard/subscription", label: "Subscription", icon: CreditCard },
        ],
      },
      {
        title: "Business Account",
        items: [
          { href: "/dealer/dashboard/profile", label: "Dealer Profile", icon: User },
          { href: "/dealer/dashboard/settings", label: "Settings", icon: Settings },
          {
            href: "/dealer/dashboard/notifications",
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
        <div className="w-16 h-16 bg-indigo/10 rounded-2xl flex items-center justify-center text-indigo mx-auto mb-6 border border-indigo/20">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-serif font-black text-charcoal mb-3">Dealer Access Required</h1>
        <p className="text-charcoal/50 text-sm font-semibold mb-8 leading-relaxed">
          Sign in with a broker account to manage listings and leads, or continue with the demo dealer.
        </p>
        <Button fullWidth variant="secondary" onClick={enterAsDemoBroker} className="mb-3">
          Continue as Demo Dealer
        </Button>
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

  const topBarExtra = (
    <div className="flex items-center gap-4">
      <Link
        href="/dealer/dashboard/notifications"
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
        accent="indigo"
        align="right"
        trigger={
          <div className="flex items-center gap-2.5 hover:bg-indigo/5 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer">
            <Avatar
              name={brokerProfile?.ownerName || userName || "Dealer"}
              size="xs"
              shape="square"
              tone="indigo"
              className="w-7 h-7 text-xs font-serif"
            />
            <div className="hidden md:flex flex-col items-start leading-none text-left">
              <span className="text-xs font-bold text-charcoal truncate max-w-[100px]">
                {brokerProfile?.ownerName || userName || "Dealer User"}
              </span>
              <span className="text-[9px] text-charcoal/40 font-semibold mt-0.5 uppercase tracking-wide">
                Broker
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-charcoal/40" />
          </div>
        }
        items={[
          { id: "profile", label: "My Profile", href: "/dealer/dashboard/profile", icon: User },
          { id: "settings", label: "Account Settings", href: "/dealer/dashboard/settings", icon: Settings },
          { id: "logout", label: "Log Out", onClick: handleLogout, variant: "danger", icon: LogOut, dividerBefore: true }
        ]}
      />
    </div>
  );

  return (
    <DashboardShell
      portalLabel="Dealer Portal"
      accent="indigo"
      profileName={brokerProfile?.firmName || userName || "Dealer Account"}
      profileEmail={userEmail || "broker@sqftgo.com"}
      profileInitial={brokerProfile?.ownerName?.charAt(0) || "D"}
      navSections={navSections}
      getBadgeCount={(badge) => {
        if (badge === "inquiries") return inquiryCount;
        if (badge === "notifications") return unreadNotifCount;
        return 0;
      }}
      onLogout={handleLogout}
      topBarExtra={topBarExtra}
      publicSiteLabel="View Public Profile"
      ready={sessionReady}
      accessDenied={!isBroker ? accessDenied : undefined}
    >
      {children}
    </DashboardShell>
  );
}
