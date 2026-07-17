"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  LayoutDashboard, Users, Briefcase, Building2, CheckSquare, Tag,
  MapPin, Star, FileText, BarChart3, MessageSquare, Settings, User,
  Shield, ScrollText, Bell, LogOut, Menu, X, ExternalLink, ChevronDown, Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NavItem {
  href: string;
  label: string;
  icon: any;
  exact?: boolean;
  badge?: string;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    isLoggedIn, userEmail, userRole, setIsLoggedIn, setUserEmail, setUserRole,
    setUserName, properties, notifications
  } = useApp();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Automatic login as admin for direct dashboard access without barriers
  useEffect(() => {
    if (!isLoggedIn || userRole !== "admin") {
      setIsLoggedIn(true);
      setUserEmail("admin@svrepl.com");
      setUserRole("admin");
      if (setUserName) setUserName("Super Admin");
    }
  }, [isLoggedIn, userRole]);

  const pendingCount = properties.filter(p => p.status === "Pending Review").length;
  const unreadNotifCount = notifications.filter(n => !n.read && (n.forRole === "admin" || n.forRole === "all")).length;

  const isAdmin = mounted && isLoggedIn && (userRole === "admin" || userEmail === "admin@svrepl.com");

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail("");
    if (setUserRole) setUserRole(null);
    router.push("/");
  };

  if (!mounted) return <div className="min-h-screen bg-[#faf8f5]" />;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-6">
        <div className="bg-white border border-indigo/10 rounded-3xl p-10 max-w-md w-full text-center shadow-sm">
          <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 mx-auto mb-6 border border-rose-500/20">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-serif font-black text-charcoal mb-3">Admin Access Only</h1>
          <p className="text-charcoal/50 text-sm font-semibold mb-8 leading-relaxed">
            This area is restricted to platform administrators. Please authenticate with admin credentials.
          </p>
          <Link href="/login" className="block w-full py-3.5 bg-terracotta hover:bg-terracotta-hover text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors mb-3 shadow-md shadow-terracotta/15">
            Admin Login
          </Link>
          <Link href="/" className="block w-full py-3.5 border border-indigo/10 text-charcoal/60 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-indigo/5 transition-colors">
            Back to Website
          </Link>
        </div>
      </div>
    );
  }

  const getBadgeCount = (badge?: string) => {
    if (badge === "approvals") return pendingCount;
    if (badge === "notifications") return unreadNotifCount;
    return 0;
  };

  const navSections = [
    {
      title: "Core",
      items: [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true }
      ]
    },
    {
      title: "Directory",
      items: [
        { href: "/admin/users", label: "Users", icon: Users },
        { href: "/admin/dealers", label: "Dealers", icon: Briefcase }
      ]
    },
    {
      title: "Properties",
      items: [
        { href: "/admin/properties", label: "Properties", icon: Building2 },
        { href: "/admin/approvals", label: "Approvals", icon: CheckSquare, badge: "approvals" }
      ]
    },
    {
      title: "Taxonomy",
      items: [
        { href: "/admin/categories", label: "Categories", icon: Tag },
        { href: "/admin/locations", label: "Locations", icon: MapPin },
        { href: "/admin/amenities", label: "Amenities", icon: Star }
      ]
    },
    {
      title: "Platform",
      items: [
        { href: "/admin/reports", label: "Reports", icon: FileText },
        { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
        { href: "/admin/messages", label: "Messages", icon: MessageSquare }
      ]
    },
    {
      title: "System",
      items: [
        { href: "/admin/profile", label: "Admin Profile", icon: User },
        { href: "/admin/settings", label: "Settings", icon: Settings },
        { href: "/admin/roles", label: "Roles & Permissions", icon: Shield },
        { href: "/admin/logs", label: "Activity Logs", icon: ScrollText },
        { href: "/admin/notifications", label: "Notifications", icon: Bell, badge: "notifications" }
      ]
    }
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#fbf7f0] text-charcoal select-none">
      {/* Brand logo */}
      <div className="px-6 py-5 border-b border-indigo/5 shrink-0 bg-white/40">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-terracotta rounded-lg flex items-center justify-center shadow-sm">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-logo text-sm text-indigo leading-none">Sun Valley</span>
            <span className="text-[8px] text-terracotta font-black uppercase tracking-wider mt-0.5">Admin Portal</span>
          </div>
        </Link>
      </div>

      {/* Profile Card */}
      <div className="px-6 py-5 border-b border-indigo/5 shrink-0 bg-white/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl overflow-hidden border border-indigo/10 shrink-0 bg-white shadow-sm flex items-center justify-center text-terracotta font-serif font-black text-sm">
            A
          </div>
          <div className="min-w-0">
            <p className="text-charcoal font-bold text-xs truncate leading-tight">Super Admin</p>
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
              const isMatch = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              const badgeCount = getBadgeCount(item.badge);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 group ${isMatch
                    ? "bg-terracotta text-white shadow-md shadow-terracotta/15"
                    : "text-charcoal/65 hover:text-terracotta hover:bg-terracotta/5"
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${isMatch ? "text-white" : "text-terracotta/60 group-hover:text-terracotta"}`} />
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
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-charcoal/60 hover:text-terracotta hover:bg-terracotta/5 transition-all"
        >
          <ExternalLink className="w-4 h-4 text-terracotta/60" />
          <span>View Public Site</span>
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
                placeholder="Search platform..."
                className="bg-sand/35 border border-indigo/5 focus:border-indigo/35 text-charcoal text-xs font-semibold px-4 py-2 pl-9 rounded-xl focus:outline-none w-56 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications icon */}
            <Link
              href="/admin/notifications"
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
                <div className="w-7 h-7 rounded-lg bg-terracotta/10 border border-terracotta/20 flex items-center justify-center text-terracotta font-serif font-black text-xs shrink-0">
                  A
                </div>
                <div className="hidden md:flex flex-col items-start leading-none text-left">
                  <span className="text-xs font-bold text-charcoal">Super Admin</span>
                  <span className="text-[9px] text-charcoal/40 font-semibold mt-0.5 uppercase tracking-wide">Admin</span>
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
                        href="/admin/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="px-3 py-2 text-xs font-semibold text-charcoal/80 hover:text-indigo hover:bg-indigo/5 rounded-xl transition-colors text-left"
                      >
                        My Profile
                      </Link>
                      <Link
                        href="/admin/settings"
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

