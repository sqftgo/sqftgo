"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  LayoutDashboard, Building2, Plus, MessageSquare, BarChart3,
  Mail, CreditCard, User, Settings, Bell, LogOut, Menu, X,
  ExternalLink, Search, ChevronDown, Heart, ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NavItem {
  href: string;
  label: string;
  icon: any;
  exact?: boolean;
  badge?: string;
  query?: Record<string, string>;
}

export default function DealerDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    isLoggedIn, userEmail, userRole, setIsLoggedIn, setUserEmail, setUserRole,
    setUserName, directoryProfiles, inquiries, notifications, properties
  } = useApp();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Automatic login as broker for direct dashboard access without barriers
  useEffect(() => {
    if (!isLoggedIn || (userRole !== "broker" && userRole !== "admin")) {
      setIsLoggedIn(true);
      setUserEmail("broker@svrepl.com");
      setUserRole("broker");
      if (setUserName) setUserName("Rajesh Mehta");
    }
  }, [isLoggedIn, userRole]);

  const brokerProfile = mounted ? directoryProfiles.find(p => p.email.toLowerCase() === userEmail.toLowerCase()) : null;
  const brokerProperties = mounted ? properties.filter(p => p.ownerEmail?.toLowerCase() === userEmail.toLowerCase()) : [];

  const activeCount = brokerProperties.filter(p => p.status === "Active").length;
  const draftCount = brokerProperties.filter(p => p.status === "Draft").length;

  const inquiryCount = brokerProperties.reduce((acc, p) => acc + (inquiries[p.id]?.length || 0), 0);
  const unreadNotifCount = notifications.filter(n => !n.read && (n.forRole === "broker" || n.forRole === "all")).length;

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail("");
    if (setUserRole) setUserRole(null);
    router.push("/");
  };

  if (!mounted) return <div className="min-h-screen bg-[#faf8f5]" />;

  const getBadgeCount = (badge?: string) => {
    if (badge === "inquiries") return inquiryCount;
    if (badge === "notifications") return unreadNotifCount;
    return 0;
  };

  const navSections = [
    {
      title: "Core",
      items: [
        { href: "/dealer/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true }
      ]
    },
    {
      title: "Properties",
      items: [
        { href: "/dealer/dashboard/properties", label: "My Properties", icon: Building2 },
        { href: "/dealer/dashboard/add-property", label: "Add Property", icon: Plus },
        { href: "/dealer/dashboard/properties", label: "Drafts", icon: Building2, query: { status: "Draft" } }
      ]
    },
    {
      title: "Leads & Inbox",
      items: [
        { href: "/dealer/dashboard/inquiries", label: "Customer Inquiries", icon: MessageSquare, badge: "inquiries" },
        { href: "/dealer/dashboard/messages", label: "Messages", icon: Mail, badge: "messages" }
      ]
    },
    {
      title: "Analytics & Plans",
      items: [
        { href: "/dealer/dashboard/analytics", label: "Analytics", icon: BarChart3 },
        { href: "/dealer/dashboard/subscription", label: "Subscription", icon: CreditCard }
      ]
    },
    {
      title: "Business Account",
      items: [
        { href: "/dealer/dashboard/profile", label: "Dealer Profile", icon: User },
        { href: "/dealer/dashboard/settings", label: "Settings", icon: Settings },
        { href: "/dealer/dashboard/notifications", label: "Notifications", icon: Bell, badge: "notifications" }
      ]
    }
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#fbf7f0] text-charcoal select-none">
      {/* Brand logo */}
      <div className="px-6 py-5 border-b border-indigo/5 shrink-0 bg-white/40">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex flex-col">
            <span className="font-logo text-sm text-indigo leading-none">Sun Valley</span>
            <span className="text-[8px] text-terracotta font-black uppercase tracking-wider mt-0.5">Dealer Portal</span>
          </div>
        </Link>
      </div>

      {/* Profile Card */}
      <div className="px-6 py-5 border-b border-indigo/5 shrink-0 bg-white/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl overflow-hidden border border-indigo/10 shrink-0 bg-white shadow-sm flex items-center justify-center text-indigo font-serif font-black text-sm">
            {brokerProfile?.ownerName?.charAt(0) || "D"}
          </div>
          <div className="min-w-0">
            <p className="text-charcoal font-bold text-xs truncate leading-tight">{brokerProfile?.firmName || "Dealer Account"}</p>
            <p className="text-charcoal/40 text-[10px] font-semibold truncate mt-0.5">{userEmail}</p>
          </div>
        </div>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 px-4 py-4 overflow-y-auto no-scrollbar space-y-4">
        {navSections.map(section => (
          <div key={section.title} className="space-y-1">
            <p className="text-[9px] font-black text-indigo/40 uppercase tracking-widest pl-3 mb-1.5">{section.title}</p>
            {section.items.map((item: NavItem) => {
              const Icon = item.icon;
              const isMatch = pathname === item.href;
              const badgeCount = getBadgeCount(item.badge);
              return (
                <Link
                  key={item.label}
                  href={item.query ? `${item.href}?status=${item.query.status}` : item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 group ${isMatch
                    ? "bg-indigo text-white shadow-md shadow-indigo/15"
                    : "text-charcoal/65 hover:text-indigo hover:bg-indigo/5"
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${isMatch ? "text-white" : "text-indigo/60 group-hover:text-indigo"}`} />
                    <span>{item.label}</span>
                  </div>
                  {badgeCount > 0 && (
                    <span className={`text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 ${isMatch ? "bg-white/20 text-white" : "bg-terracotta text-white"
                      }`}>
                      {badgeCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer operations */}
      <div className="p-4 border-t border-indigo/5 bg-white/40 space-y-1 shrink-0">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-charcoal/60 hover:text-indigo hover:bg-indigo/5 transition-all"
        >
          <ExternalLink className="w-4 h-4 text-indigo/60" />
          <span>View Public Profile</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-500 hover:bg-rose-500/5 transition-all cursor-pointer text-left"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#faf8f5] text-charcoal font-sans overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 xl:w-70 bg-[#fbf7f0] border-r border-indigo/10 flex-col shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 450, damping: 40 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-[#fbf7f0] border-r border-indigo/10 z-50 flex flex-col"
            >
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4.5 right-4.5 p-2 bg-indigo/5 hover:bg-indigo/10 text-charcoal rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header Top Bar */}
        <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-indigo/5 z-30 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-indigo/5 rounded-xl text-indigo transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-charcoal/30" />
              <input
                type="text"
                placeholder="Search dashboard..."
                className="bg-sand/35 border border-indigo/5 focus:border-indigo/35 text-charcoal text-xs font-semibold px-4 py-2 pl-9 rounded-xl focus:outline-none w-56 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">


            {/* Notifications icon */}
            <Link
              href="/dealer/dashboard/notifications"
              className="relative p-2.5 hover:bg-indigo/5 rounded-xl text-indigo transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifCount > 0 && (
                <span className="absolute top-1 right-1 bg-terracotta text-white text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-sm">
                  {unreadNotifCount}
                </span>
              )}
            </Link>

            <div className="h-5 w-px bg-indigo/10" />

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 hover:bg-indigo/5 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo/10 border border-indigo/20 flex items-center justify-center text-indigo font-serif font-black text-xs shrink-0">
                  {brokerProfile?.ownerName?.charAt(0) || "D"}
                </div>
                <div className="hidden md:flex flex-col items-start leading-none text-left">
                  <span className="text-xs font-bold text-charcoal">{brokerProfile?.ownerName || "Dealer User"}</span>
                  <span className="text-[9px] text-charcoal/40 font-semibold mt-0.5 uppercase tracking-wide">Broker</span>
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
                    >
                      <Link
                        href="/dealer/dashboard/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="px-3 py-2 text-xs font-semibold text-charcoal/80 hover:text-indigo hover:bg-indigo/5 rounded-xl transition-colors text-left"
                      >
                        My Profile
                      </Link>
                      <Link
                        href="/dealer/dashboard/settings"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="px-3 py-2 text-xs font-semibold text-charcoal/80 hover:text-indigo hover:bg-indigo/5 rounded-xl transition-colors text-left"
                      >
                        Account Settings
                      </Link>
                      <div className="h-px bg-indigo/5 my-1.5" />
                      <button
                        onClick={() => { setProfileDropdownOpen(false); handleLogout(); }}
                        className="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left cursor-pointer"
                      >
                        Log Out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Scrollable Layout Content */}
        <main className="flex-1 overflow-y-auto bg-[#faf8f5]">
          {children}
        </main>
      </div>
    </div>
  );
}
