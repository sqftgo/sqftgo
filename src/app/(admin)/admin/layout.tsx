"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  LayoutDashboard, Users, Briefcase, Building2, CheckSquare, Tag,
  MapPin, Star, FileText, BarChart3, MessageSquare, Settings, User,
  Shield, ScrollText, Bell, LogOut, Menu, X, ExternalLink, HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/dealers", label: "Dealers", icon: Briefcase },
  { href: "/admin/properties", label: "Properties", icon: Building2 },
  { href: "/admin/approvals", label: "Approvals", icon: CheckSquare, badge: "approvals" },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { href: "/admin/locations", label: "Locations", icon: MapPin },
  { href: "/admin/amenities", label: "Amenities", icon: Star },
  { href: "/admin/reports", label: "Reports", icon: FileText },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/profile", label: "Admin Profile", icon: User },
  { href: "/admin/roles", label: "Roles & Permissions", icon: Shield },
  { href: "/admin/logs", label: "Activity Logs", icon: ScrollText },
  { href: "/admin/notifications", label: "Notifications", icon: Bell, badge: "notifications" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn, userEmail, userRole, setIsLoggedIn, setUserEmail, setUserRole, properties, notifications } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const pendingCount = properties.filter(p => p.status === "Pending Review").length;
  const unreadNotifCount = notifications.filter(n => !n.read && (n.forRole === "admin" || n.forRole === "all")).length;

  const isAdmin = mounted && isLoggedIn && (userRole === "admin" || userEmail === "admin@svrepl.com");

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail("");
    if (setUserRole) setUserRole(null);
    router.push("/");
  };

  if (!mounted) return <div className="min-h-screen bg-[#0f1117]" />;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center p-6">
        <div className="bg-[#1e2028] border border-white/10 rounded-3xl p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-400 mx-auto mb-6 border border-rose-500/20">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-serif font-black text-white mb-3">Admin Access Only</h1>
          <p className="text-white/50 text-sm font-semibold mb-8 leading-relaxed">
            This area is restricted to platform administrators. Please authenticate with admin credentials.
          </p>
          <Link href="/login" className="block w-full py-3.5 bg-terracotta hover:bg-terracotta-hover text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors mb-3">
            Admin Login
          </Link>
          <Link href="/" className="block w-full py-3.5 border border-white/10 text-white/60 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-white/5 transition-colors">
            Back to Website
          </Link>
        </div>
      </div>
    );
  }

  const getBadge = (badge?: string) => {
    if (badge === "approvals") return pendingCount;
    if (badge === "notifications") return unreadNotifCount;
    return 0;
  };

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/5 shrink-0">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-terracotta rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-logo text-sm text-white leading-none">Sun Valley</span>
            <span className="text-[8px] text-terracotta/80 font-black uppercase tracking-wider mt-0.5">Admin Portal</span>
          </div>
        </Link>
      </div>

      {/* Admin Badge */}
      <div className="px-5 py-4 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-terracotta/20 flex items-center justify-center text-terracotta font-black text-xs shrink-0">
            A
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-bold truncate">Super Administrator</p>
            <p className="text-white/40 text-[10px] font-semibold truncate">{userEmail}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto no-scrollbar space-y-0.5">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const badgeCount = getBadge(item.badge);
          return (
            <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all group ${
                isActive ? "bg-terracotta/10 text-terracotta border border-terracotta/20" : "text-white/40 hover:text-white hover:bg-white/5"
              }`}>
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-terracotta" : "text-white/25 group-hover:text-white/60"}`} />
                <span>{item.label}</span>
              </div>
              {badgeCount > 0 && (
                <span className={`text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isActive ? "bg-terracotta/20 text-terracotta" : "bg-terracotta text-white"}`}>
                  {badgeCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-3 border-t border-white/5 shrink-0 space-y-1">
        <Link href="/" target="_blank" className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-white/30 hover:text-white hover:bg-white/5 transition-all">
          <ExternalLink className="w-4 h-4" /><span>View Public Site</span>
        </Link>
        <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-500 hover:text-rose-400 hover:bg-rose-500/5 transition-all cursor-pointer">
          <LogOut className="w-4 h-4" /><span>Log Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#0f1117] overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 xl:w-64 bg-[#161618] border-r border-white/5 flex-col shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} className="lg:hidden fixed inset-0 bg-black/60 z-40" />
            <motion.aside initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }} transition={{ type: "spring", stiffness: 400, damping: 40 }} className="lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-[#161618] border-r border-white/5 z-50 flex flex-col">
              <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 p-2 bg-white/10 text-white rounded-xl cursor-pointer"><X className="w-4 h-4" /></button>
              <Sidebar />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Top Bar */}
        <div className="lg:hidden flex items-center justify-between px-5 py-4 bg-[#161618] border-b border-white/5 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-white/10 text-white rounded-xl cursor-pointer"><Menu className="w-5 h-5" /></button>
          <span className="font-logo text-sm text-white">Sun Valley Admin</span>
          <Link href="/admin/notifications" className="relative p-2 hover:bg-white/10 text-white rounded-xl">
            <Bell className="w-5 h-5" />
            {unreadNotifCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-terracotta rounded-full" />}
          </Link>
        </div>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
